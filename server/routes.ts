import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertNoteSchema, insertChatMessageSchema } from "@shared/schema";
import OpenAI from "openai";
import multer from "multer";
import path from "path";
import fs from "fs";
// PDF parsing will be handled on frontend for now

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

// Configure multer for image uploads
const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only images (JPEG, JPG, PNG) and PDF files are allowed"));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Notes routes
  app.get("/api/notes", async (req, res) => {
    try {
      const { search, style } = req.query;
      let notes;
      
      if (search && typeof search === 'string') {
        notes = await storage.searchNotes(search);
      } else if (style && typeof style === 'string' && style !== 'all') {
        notes = await storage.getNotesByStyle(style);
      } else {
        notes = await storage.getAllNotes();
      }
      
      res.json(notes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notes" });
    }
  });

  app.get("/api/notes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const note = await storage.getNote(id);
      
      if (!note) {
        return res.status(404).json({ message: "Note not found" });
      }
      
      res.json(note);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch note" });
    }
  });

  app.post("/api/notes", async (req, res) => {
    try {
      const noteData = insertNoteSchema.parse(req.body);
      const note = await storage.createNote(noteData);
      res.status(201).json(note);
    } catch (error) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid note data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create note" });
    }
  });

  app.put("/api/notes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = insertNoteSchema.partial().parse(req.body);
      const note = await storage.updateNote(id, updateData);
      
      if (!note) {
        return res.status(404).json({ message: "Note not found" });
      }
      
      res.json(note);
    } catch (error) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid note data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update note" });
    }
  });

  app.delete("/api/notes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteNote(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Note not found" });
      }
      
      res.json({ message: "Note deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete note" });
    }
  });

  // Image upload route
  app.post("/api/upload", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const fileExtension = path.extname(req.file.originalname).toLowerCase();
      let extractedText = "";

      // PDF files will be handled on frontend with pdf.js

      // Return file info
      res.json({ 
        success: true, 
        filePath: req.file.path,
        originalName: req.file.originalname,
        fileType: fileExtension === '.pdf' ? 'pdf' : 'image'
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ message: "Failed to upload file" });
    }
  });

  // Chat routes
  app.get("/api/chat/messages", async (req, res) => {
    try {
      const messages = await storage.getAllChatMessages();
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch chat messages" });
    }
  });

  app.post("/api/chat/messages", async (req, res) => {
    try {
      const messageData = insertChatMessageSchema.parse(req.body);
      const userMessage = await storage.createChatMessage(messageData);

      // Get user's notes context for AI response
      const notes = await storage.getAllNotes();
      const notesContext = notes.map(note => `Title: ${note.title}\nContent: ${note.content}`).join('\n\n');

      // Generate AI response
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an AI assistant helping with note management. You have access to the user's notes context below. Help them organize, summarize, and answer questions about their notes. Be concise and helpful.\n\nUser's Notes:\n${notesContext}`
          },
          {
            role: "user",
            content: messageData.message
          }
        ],
        max_tokens: 500,
      });

      const aiResponse = completion.choices[0].message.content || "I apologize, but I couldn't generate a response.";
      
      // Save AI response
      const aiMessage = await storage.createChatMessage({
        message: aiResponse,
        isUser: 0
      });

      res.json({ userMessage, aiMessage });
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ message: "Failed to process chat message" });
    }
  });

  app.delete("/api/chat/messages", async (req, res) => {
    try {
      await storage.clearChatHistory();
      res.json({ message: "Chat history cleared" });
    } catch (error) {
      res.status(500).json({ message: "Failed to clear chat history" });
    }
  });

  // AI-powered note enhancement
  app.post("/api/notes/enhance", async (req, res) => {
    try {
      const { messyText, style } = req.body;
      
      if (!messyText) {
        return res.status(400).json({ message: "No text provided for enhancement" });
      }

      const stylePrompts = {
        cornell: `Format this as Cornell Notes using this exact structure:
        
CUES/KEYWORDS          |  MAIN NOTES
-----------------------|--------------------------------
[Key terms here]       |  [Detailed content here]
[Questions here]       |  [Explanations here]
[Important concepts]   |  [Examples and formulas]

SUMMARY:
[Brief summary of all main concepts]`,
        
        bullet: `Format this as organized bullet points with clear hierarchy:
• Main Topic/Chapter
  ○ Subtopic 1
    ▪ Detail or example
    ▪ Supporting information
  ○ Subtopic 2
    ▪ Detail or example
• Second Main Topic
  ○ Subtopic
    ▪ Details`,
    
        mindmap: `Format this as a text-based mind map structure:
        
                    [CENTRAL TOPIC]
                         |
        ┌────────────────┼────────────────┐
        │                │                │
   [BRANCH 1]      [BRANCH 2]      [BRANCH 3]
        │                │                │
   ┌────┼────┐      ┌────┼────┐      ┌────┼────┐
   │    │    │      │    │    │      │    │    │
[SUB1][SUB2][SUB3][SUB4][SUB5][SUB6][SUB7][SUB8][SUB9]`,

        freeform: "Clean up and organize this text while maintaining a natural paragraph flow with clear headings and logical structure."
      };

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an expert note-taking assistant. Take messy, OCR-extracted text and transform it into clean, well-organized notes following the EXACT format specified below.

            FORMATTING INSTRUCTIONS: ${stylePrompts[style as keyof typeof stylePrompts] || stylePrompts.freeform}

            CRITICAL REQUIREMENTS:
            - Fix ALL OCR errors and typos
            - Follow the formatting structure EXACTLY as shown above
            - Preserve all mathematical formulas and equations
            - Use proper spacing and alignment for the chosen format
            - For Cornell notes: Use the pipe | character to create columns
            - For bullet points: Use the exact bullet symbols shown (•, ○, ▪)
            - For mind maps: Use the ASCII art structure with proper alignment
            - Make content study-ready and academically rigorous
            
            Return your response as JSON with this format:
            {
              "title": "Clear descriptive title",
              "content": "Content formatted in the EXACT style requested with proper structure",
              "keyPoints": ["key concept 1", "key concept 2", "key concept 3"],
              "summary": "Brief summary of the main concepts covered"
            }`
          },
          {
            role: "user",
            content: `Please enhance and organize this messy text:\n\n${messyText}`
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 1000,
      });

      const enhanced = JSON.parse(completion.choices[0].message.content || "{}");
      res.json(enhanced);
    } catch (error) {
      console.error("Enhancement error:", error);
      res.status(500).json({ message: "Failed to enhance note" });
    }
  });

  // Generate flashcards from notes
  app.post("/api/notes/:id/flashcards", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const note = await storage.getNote(id);
      
      if (!note) {
        return res.status(404).json({ message: "Note not found" });
      }

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an expert flashcard creator for students. Create effective flashcards from the note content that promote active recall and spaced repetition learning.

            Guidelines:
            - Create 8-12 flashcards covering key concepts
            - Questions should test understanding, not just memorization
            - Include variety: definitions, applications, comparisons, examples
            - Keep answers concise but complete
            - Use clear, student-friendly language

            Return JSON in this format:
            {
              "flashcards": [
                {
                  "id": 1,
                  "front": "Question or prompt",
                  "back": "Clear, concise answer",
                  "category": "concept|definition|application|example",
                  "difficulty": "easy|medium|hard"
                }
              ]
            }`
          },
          {
            role: "user",
            content: `Create flashcards from this note:\n\nTitle: ${note.title}\nContent: ${note.content}`
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 1500,
      });

      const flashcards = JSON.parse(completion.choices[0].message.content || "{}");
      res.json(flashcards);
    } catch (error) {
      console.error("Flashcard generation error:", error);
      res.status(500).json({ message: "Failed to generate flashcards" });
    }
  });

  // Generate practice test from multiple notes
  app.post("/api/notes/practice-test", async (req, res) => {
    try {
      const { noteIds, testLength = 10 } = req.body;
      
      if (!noteIds || noteIds.length === 0) {
        return res.status(400).json({ message: "No notes selected" });
      }

      const notes = await Promise.all(
        noteIds.map((id: number) => storage.getNote(id))
      );
      
      const validNotes = notes.filter(note => note !== undefined);
      if (validNotes.length === 0) {
        return res.status(404).json({ message: "No valid notes found" });
      }

      const notesContent = validNotes.map(note => 
        `Title: ${note!.title}\nContent: ${note!.content}`
      ).join('\n\n---\n\n');

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `Create a comprehensive practice test from multiple study notes. Mix question types and difficulty levels to create a realistic exam experience.

            Create ${testLength} questions with these types:
            - Multiple choice (60%)
            - True/False (20%) 
            - Short answer (20%)

            Return JSON in this format:
            {
              "testInfo": {
                "title": "Practice Test",
                "totalQuestions": ${testLength},
                "estimatedTime": "X minutes",
                "topics": ["topic1", "topic2"]
              },
              "questions": [
                {
                  "id": 1,
                  "type": "multiple_choice|true_false|short_answer",
                  "question": "Question text",
                  "options": ["A", "B", "C", "D"] // only for multiple choice
                  "correctAnswer": "correct answer or option",
                  "explanation": "Why this answer is correct",
                  "points": 1,
                  "difficulty": "easy|medium|hard",
                  "topic": "source topic"
                }
              ]
            }`
          },
          {
            role: "user",
            content: `Create a practice test from these notes:\n\n${notesContent}`
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 2000,
      });

      const practiceTest = JSON.parse(completion.choices[0].message.content || "{}");
      res.json(practiceTest);
    } catch (error) {
      console.error("Practice test generation error:", error);
      res.status(500).json({ message: "Failed to generate practice test" });
    }
  });

  // Analyze concept connections between notes
  app.post("/api/notes/concept-connections", async (req, res) => {
    try {
      const notes = await storage.getAllNotes();
      
      if (notes.length < 2) {
        return res.json({ 
          connections: [],
          message: "Need at least 2 notes to find connections"
        });
      }

      const notesContent = notes.map(note => ({
        id: note.id,
        title: note.title,
        content: note.content.substring(0, 500) // Limit content for analysis
      }));

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `Analyze study notes to find conceptual connections, relationships, and knowledge gaps. Help students understand how different topics relate to each other.

            Return JSON in this format:
            {
              "connections": [
                {
                  "noteIds": [1, 2],
                  "noteTitles": ["Note 1", "Note 2"],
                  "connectionType": "prerequisite|related|builds_on|contradicts|example_of",
                  "relationship": "Brief description of how they connect",
                  "strength": "weak|moderate|strong"
                }
              ],
              "concepts": [
                {
                  "concept": "Key concept name",
                  "frequency": 3,
                  "noteIds": [1, 2, 3],
                  "importance": "high|medium|low"
                }
              ],
              "recommendations": [
                "Study suggestion based on connections"
              ]
            }`
          },
          {
            role: "user",
            content: `Analyze connections between these notes:\n\n${JSON.stringify(notesContent, null, 2)}`
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 1500,
      });

      const analysis = JSON.parse(completion.choices[0].message.content || "{}");
      res.json(analysis);
    } catch (error) {
      console.error("Concept analysis error:", error);
      res.status(500).json({ message: "Failed to analyze concept connections" });
    }
  });

  // Analyze study weaknesses and provide recommendations
  app.post("/api/study/weakness-analysis", async (req, res) => {
    try {
      const { quizResults, noteActivity } = req.body;
      const notes = await storage.getAllNotes();

      // Get all notes content for analysis
      const notesContent = notes.map(note => ({
        id: note.id,
        title: note.title,
        style: note.style
      }));

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `Analyze a student's study patterns, quiz performance, and note-taking habits to identify weaknesses and provide personalized study recommendations.

            Return JSON in this format:
            {
              "weaknessAnalysis": {
                "overallScore": 75,
                "strengths": ["area1", "area2"],
                "weaknesses": ["area1", "area2"],
                "studyHabits": "assessment of note-taking and quiz patterns"
              },
              "recommendations": [
                {
                  "type": "content|method|timing|review",
                  "priority": "high|medium|low",
                  "suggestion": "Specific actionable advice",
                  "reason": "Why this will help"
                }
              ],
              "focusAreas": [
                {
                  "topic": "Topic name",
                  "noteIds": [1, 2],
                  "suggestedActions": ["action1", "action2"]
                }
              ],
              "studyPlan": {
                "todaysFocus": "What to study today",
                "thisWeekGoals": ["goal1", "goal2"],
                "reviewSchedule": "When to review previous material"
              }
            }`
          },
          {
            role: "user",
            content: `Analyze study patterns:
            
            Notes Created: ${notes.length}
            Note Styles Used: ${Array.from(new Set(notes.map(n => n.style))).join(', ')}
            Recent Quiz Results: ${JSON.stringify(quizResults || [])}
            Note Activity: ${JSON.stringify(noteActivity || {})}
            
            Available Notes: ${JSON.stringify(notesContent)}`
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 1500,
      });

      const analysis = JSON.parse(completion.choices[0].message.content || "{}");
      res.json(analysis);
    } catch (error) {
      console.error("Weakness analysis error:", error);
      res.status(500).json({ message: "Failed to analyze study weaknesses" });
    }
  });

  // Generate quiz questions from notes
  app.post("/api/notes/:id/quiz", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { mode, difficulty } = req.body;
      const note = await storage.getNote(id);
      
      if (!note) {
        return res.status(404).json({ message: "Note not found" });
      }

      const quizPrompts = {
        speedrun: `Create a fast-paced quiz with 5 quick questions for speedrun mode. Make questions short and snappy with clear right/wrong answers. Include timer pressure elements.`,
        
        survival: `Create a survival mode quiz with 8 questions that get progressively harder. Start easy and increase difficulty. Include "lives" system where wrong answers cost health points.`,
        
        battle: `Create a battle royale style quiz with 6 strategic questions. Include power-ups, shields, and special abilities. Make it competitive and exciting with point multipliers.`
      };

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a gamified quiz generator for Gen Z students. ${quizPrompts[mode as keyof typeof quizPrompts] || quizPrompts.speedrun}

            Create engaging, game-like questions based on the note content. Use modern, relatable language but keep it educational.

            Return JSON in this format:
            {
              "mode": "${mode}",
              "questions": [
                {
                  "id": 1,
                  "question": "Question text with gaming elements",
                  "options": ["A) Option", "B) Option", "C) Option", "D) Option"],
                  "correct": 0,
                  "explanation": "Why this answer is correct",
                  "points": 100,
                  "difficulty": "easy|medium|hard",
                  "powerUp": "shield|speed|double-points|none"
                }
              ],
              "gameElements": {
                "theme": "Battle/Speed/Survival theme description",
                "instructions": "How to play this mode",
                "scoring": "Scoring system explanation"
              }
            }`
          },
          {
            role: "user",
            content: `Generate a ${mode} mode quiz from this note:\n\nTitle: ${note.title}\nContent: ${note.content}`
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 1500,
      });

      const quiz = JSON.parse(completion.choices[0].message.content || "{}");
      res.json(quiz);
    } catch (error) {
      console.error("Quiz generation error:", error);
      res.status(500).json({ message: "Failed to generate quiz" });
    }
  });

  // AI-powered note analysis
  app.post("/api/notes/:id/analyze", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const note = await storage.getNote(id);
      
      if (!note) {
        return res.status(404).json({ message: "Note not found" });
      }

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an AI assistant that analyzes notes and provides helpful insights. Provide a brief summary, key points, and suggestions for improvement."
          },
          {
            role: "user",
            content: `Please analyze this note:\n\nTitle: ${note.title}\nContent: ${note.content}`
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 300,
      });

      const analysis = JSON.parse(completion.choices[0].message.content || "{}");
      res.json(analysis);
    } catch (error) {
      console.error("Analysis error:", error);
      res.status(500).json({ message: "Failed to analyze note" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

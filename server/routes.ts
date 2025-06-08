import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertNoteSchema, insertChatMessageSchema } from "@shared/schema";
import OpenAI from "openai";
import multer from "multer";
import path from "path";
import fs from "fs";

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
  app.post("/api/upload", upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Return file path for frontend OCR processing
      res.json({ 
        success: true, 
        filePath: req.file.path,
        originalName: req.file.originalname
      });
    } catch (error) {
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
        cornell: "Format this as Cornell Notes with main notes, cues/keywords, and a summary section at the bottom.",
        bullet: "Format this as organized bullet points with clear hierarchy and structure.",
        mindmap: "Format this as a mind map structure with central topic and branching subtopics.",
        freeform: "Clean up and organize this text while maintaining a natural flow."
      };

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an expert note-taking assistant. Take messy, OCR-extracted text and transform it into clean, well-organized notes. ${stylePrompts[style] || stylePrompts.freeform} 

            Guidelines:
            - Fix OCR errors and typos
            - Organize information logically
            - Add proper formatting and structure
            - Preserve all important mathematical formulas and equations
            - Make the content clear and easy to study from
            - Generate a clear, descriptive title
            
            Return your response as JSON with this format:
            {
              "title": "Clear descriptive title",
              "content": "Well-formatted note content",
              "keyPoints": ["point1", "point2", "point3"],
              "summary": "Brief summary of the main concepts"
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

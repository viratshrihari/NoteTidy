import { useState } from "react";
import { useApp } from "../../contexts/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { NativeAd } from "../AdBanner";
import { Brain, BookOpen, GitBranch, TrendingDown, RotateCcw, CheckCircle, AlertCircle, Target } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "../../hooks/use-toast";

interface Flashcard {
  id: number;
  front: string;
  back: string;
  category: string;
  difficulty: string;
}

interface PracticeTest {
  testInfo: {
    title: string;
    totalQuestions: number;
    estimatedTime: string;
    topics: string[];
  };
  questions: Array<{
    id: number;
    type: string;
    question: string;
    options?: string[];
    correctAnswer: string;
    explanation: string;
    points: number;
    difficulty: string;
    topic: string;
  }>;
}

interface ConceptConnection {
  noteIds: number[];
  noteTitles: string[];
  connectionType: string;
  relationship: string;
  strength: string;
}

interface WeaknessAnalysis {
  weaknessAnalysis: {
    overallScore: number;
    strengths: string[];
    weaknesses: string[];
    studyHabits: string;
  };
  recommendations: Array<{
    type: string;
    priority: string;
    suggestion: string;
    reason: string;
  }>;
  focusAreas: Array<{
    topic: string;
    noteIds: number[];
    suggestedActions: string[];
  }>;
  studyPlan: {
    todaysFocus: string;
    thisWeekGoals: string[];
    reviewSchedule: string;
  };
}

export function StudyToolsTab() {
  const { state } = useApp();
  const { toast } = useToast();
  const [activeView, setActiveView] = useState<"menu" | "flashcards" | "practice-test" | "connections" | "weakness">("menu");
  const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null);
  const [selectedNoteIds, setSelectedNoteIds] = useState<number[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentFlashcard, setCurrentFlashcard] = useState(0);
  const [showFlashcardBack, setShowFlashcardBack] = useState(false);
  const [practiceTest, setPracticeTest] = useState<PracticeTest | null>(null);
  const [currentTestQuestion, setCurrentTestQuestion] = useState(0);
  const [testAnswers, setTestAnswers] = useState<Record<number, string>>({});

  // Generate flashcards mutation
  const generateFlashcardsMutation = useMutation({
    mutationFn: async (noteId: number) => {
      const response = await fetch(`/api/notes/${noteId}/flashcards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      if (!response.ok) throw new Error('Failed to generate flashcards');
      return response.json();
    },
    onSuccess: (data) => {
      setFlashcards(data.flashcards || []);
      setCurrentFlashcard(0);
      setShowFlashcardBack(false);
      setActiveView("flashcards");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate flashcards",
        variant: "destructive"
      });
    }
  });

  // Generate practice test mutation
  const generatePracticeTestMutation = useMutation({
    mutationFn: async ({ noteIds, testLength }: { noteIds: number[]; testLength: number }) => {
      const response = await fetch('/api/notes/practice-test', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteIds, testLength })
      });
      if (!response.ok) throw new Error('Failed to generate practice test');
      return response.json();
    },
    onSuccess: (data) => {
      setPracticeTest(data);
      setCurrentTestQuestion(0);
      setTestAnswers({});
      setActiveView("practice-test");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate practice test",
        variant: "destructive"
      });
    }
  });

  // Concept connections query
  const conceptConnectionsQuery = useQuery({
    queryKey: ['/api/notes/concept-connections'],
    queryFn: async () => {
      const response = await fetch('/api/notes/concept-connections', {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      if (!response.ok) throw new Error('Failed to analyze connections');
      return response.json();
    },
    enabled: false
  });

  // Weakness analysis query
  const weaknessAnalysisQuery = useQuery({
    queryKey: ['/api/study/weakness-analysis'],
    queryFn: async () => {
      const response = await fetch('/api/study/weakness-analysis', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizResults: [], // Would come from stored quiz history
          noteActivity: { notesCreated: state.notes.length }
        })
      });
      if (!response.ok) throw new Error('Failed to analyze weaknesses');
      return response.json();
    },
    enabled: false
  });

  const handleFlashcardNext = () => {
    if (currentFlashcard < flashcards.length - 1) {
      setCurrentFlashcard(currentFlashcard + 1);
      setShowFlashcardBack(false);
    } else {
      toast({
        title: "Flashcards Complete!",
        description: "You've reviewed all flashcards. Great job!"
      });
      setActiveView("menu");
    }
  };

  const handleTestAnswer = (questionId: number, answer: string) => {
    setTestAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const submitPracticeTest = () => {
    if (!practiceTest) return;
    
    let score = 0;
    practiceTest.questions.forEach(question => {
      if (testAnswers[question.id] === question.correctAnswer) {
        score += question.points;
      }
    });
    
    const percentage = Math.round((score / practiceTest.questions.length) * 100);
    
    toast({
      title: "Test Complete!",
      description: `You scored ${percentage}% (${score}/${practiceTest.questions.length} correct)`
    });
    
    setActiveView("menu");
  };

  if (activeView === "menu") {
    return (
      <div className="p-4 space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">AI Study Tools</h2>
          <p className="text-muted-foreground">Advanced study features powered by AI</p>
        </div>

        {/* Native Ad in Study Tools */}
        <NativeAd className="mb-4" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Flashcards Tool */}
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <BookOpen className="w-6 h-6 text-blue-500" />
                Smart Flashcards
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Auto-generate flashcards from any note for active recall practice
              </p>
              {state.notes.length === 0 ? (
                <p className="text-sm text-muted-foreground">Create some notes first</p>
              ) : (
                <div className="space-y-2">
                  <select
                    className="w-full p-2 border rounded"
                    onChange={(e) => setSelectedNoteId(Number(e.target.value))}
                    value={selectedNoteId || ""}
                  >
                    <option value="">Select a note</option>
                    {state.notes.map(note => (
                      <option key={note.id} value={note.id}>{note.title}</option>
                    ))}
                  </select>
                  <Button
                    className="w-full"
                    onClick={() => selectedNoteId && generateFlashcardsMutation.mutate(selectedNoteId)}
                    disabled={!selectedNoteId || generateFlashcardsMutation.isPending}
                  >
                    Generate Flashcards
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Practice Test Tool */}
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Target className="w-6 h-6 text-green-500" />
                Practice Tests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Create comprehensive practice exams from multiple notes
              </p>
              {state.notes.length < 2 ? (
                <p className="text-sm text-muted-foreground">Need at least 2 notes</p>
              ) : (
                <div className="space-y-2">
                  <div className="max-h-24 overflow-y-auto">
                    {state.notes.map(note => (
                      <label key={note.id} className="flex items-center space-x-2 text-sm">
                        <input
                          type="checkbox"
                          checked={selectedNoteIds.includes(note.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedNoteIds([...selectedNoteIds, note.id]);
                            } else {
                              setSelectedNoteIds(selectedNoteIds.filter(id => id !== note.id));
                            }
                          }}
                        />
                        <span>{note.title}</span>
                      </label>
                    ))}
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => generatePracticeTestMutation.mutate({ 
                      noteIds: selectedNoteIds, 
                      testLength: 10 
                    })}
                    disabled={selectedNoteIds.length === 0 || generatePracticeTestMutation.isPending}
                  >
                    Create Practice Test
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Concept Connections Tool */}
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <GitBranch className="w-6 h-6 text-purple-500" />
                Concept Connections
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Discover how your notes connect and relate to each other
              </p>
              <Button
                className="w-full"
                onClick={() => {
                  conceptConnectionsQuery.refetch();
                  setActiveView("connections");
                }}
                disabled={state.notes.length < 2 || conceptConnectionsQuery.isFetching}
              >
                Analyze Connections
              </Button>
            </CardContent>
          </Card>

          {/* Study Weakness Analysis Tool */}
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <TrendingDown className="w-6 h-6 text-red-500" />
                Weakness Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Get personalized study recommendations based on your patterns
              </p>
              <Button
                className="w-full"
                onClick={() => {
                  weaknessAnalysisQuery.refetch();
                  setActiveView("weakness");
                }}
                disabled={weaknessAnalysisQuery.isFetching}
              >
                Analyze Study Patterns
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (activeView === "flashcards" && flashcards.length > 0) {
    const card = flashcards[currentFlashcard];
    const progress = ((currentFlashcard + 1) / flashcards.length) * 100;

    return (
      <div className="p-4 space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => setActiveView("menu")}>
            Back to Tools
          </Button>
          <div className="text-sm text-muted-foreground">
            {currentFlashcard + 1} of {flashcards.length}
          </div>
        </div>

        <Progress value={progress} className="mb-4" />

        <Card className="min-h-64">
          <CardContent className="p-8 text-center">
            {!showFlashcardBack ? (
              <div>
                <Badge className="mb-4">{card.category}</Badge>
                <h3 className="text-xl mb-6">{card.front}</h3>
                <Button onClick={() => setShowFlashcardBack(true)}>
                  Show Answer
                </Button>
              </div>
            ) : (
              <div>
                <Badge className="mb-4">{card.difficulty}</Badge>
                <h3 className="text-lg mb-4 text-muted-foreground">{card.front}</h3>
                <div className="border-t pt-4">
                  <p className="text-xl mb-6">{card.back}</p>
                  <div className="flex gap-2 justify-center">
                    <Button variant="outline" onClick={handleFlashcardNext}>
                      Next Card
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (activeView === "practice-test" && practiceTest) {
    const question = practiceTest.questions[currentTestQuestion];
    const isLastQuestion = currentTestQuestion === practiceTest.questions.length - 1;

    return (
      <div className="p-4 space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => setActiveView("menu")}>
            Back to Tools
          </Button>
          <div className="text-sm text-muted-foreground">
            Question {currentTestQuestion + 1} of {practiceTest.questions.length}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{practiceTest.testInfo.title}</CardTitle>
            <div className="flex gap-2">
              <Badge>{question.difficulty}</Badge>
              <Badge variant="outline">{question.points} pts</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <h3 className="text-lg mb-4">{question.question}</h3>

            {question.type === "multiple_choice" && question.options && (
              <div className="space-y-2">
                {question.options.map((option, index) => (
                  <Button
                    key={index}
                    variant={testAnswers[question.id] === option ? "default" : "outline"}
                    className="w-full text-left justify-start"
                    onClick={() => handleTestAnswer(question.id, option)}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            )}

            {question.type === "true_false" && (
              <div className="flex gap-2">
                <Button
                  variant={testAnswers[question.id] === "True" ? "default" : "outline"}
                  onClick={() => handleTestAnswer(question.id, "True")}
                >
                  True
                </Button>
                <Button
                  variant={testAnswers[question.id] === "False" ? "default" : "outline"}
                  onClick={() => handleTestAnswer(question.id, "False")}
                >
                  False
                </Button>
              </div>
            )}

            {question.type === "short_answer" && (
              <textarea
                className="w-full p-3 border rounded"
                rows={3}
                placeholder="Enter your answer..."
                value={testAnswers[question.id] || ""}
                onChange={(e) => handleTestAnswer(question.id, e.target.value)}
              />
            )}

            <div className="flex justify-between mt-6">
              <Button
                variant="outline"
                onClick={() => setCurrentTestQuestion(currentTestQuestion - 1)}
                disabled={currentTestQuestion === 0}
              >
                Previous
              </Button>
              
              {isLastQuestion ? (
                <Button onClick={submitPracticeTest}>
                  Submit Test
                </Button>
              ) : (
                <Button
                  onClick={() => setCurrentTestQuestion(currentTestQuestion + 1)}
                >
                  Next
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (activeView === "connections" && conceptConnectionsQuery.data) {
    const data = conceptConnectionsQuery.data;

    return (
      <div className="p-4 space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => setActiveView("menu")}>
            Back to Tools
          </Button>
          <h2 className="text-xl font-bold">Concept Connections</h2>
        </div>

        {data.connections && data.connections.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Note Relationships</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.connections.map((connection: ConceptConnection, index: number) => (
                <div key={index} className="border rounded p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={
                      connection.strength === "strong" ? "default" :
                      connection.strength === "moderate" ? "secondary" : "outline"
                    }>
                      {connection.connectionType}
                    </Badge>
                    <Badge variant="outline">{connection.strength}</Badge>
                  </div>
                  <p className="text-sm mb-2">
                    <strong>{connection.noteTitles.join(" ↔ ")}</strong>
                  </p>
                  <p className="text-sm text-muted-foreground">{connection.relationship}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {data.recommendations && data.recommendations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Study Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {data.recommendations.map((rec: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                    <span className="text-sm">{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  if (activeView === "weakness" && weaknessAnalysisQuery.data) {
    const data: WeaknessAnalysis = weaknessAnalysisQuery.data;

    return (
      <div className="p-4 space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => setActiveView("menu")}>
            Back to Tools
          </Button>
          <h2 className="text-xl font-bold">Study Analysis</h2>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Overall Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <div className="text-3xl font-bold">{data.weaknessAnalysis.overallScore}%</div>
              <Progress value={data.weaknessAnalysis.overallScore} className="flex-1" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2 text-green-700">Strengths</h4>
                <ul className="text-sm space-y-1">
                  {data.weaknessAnalysis.strengths.map((strength, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2 text-red-700">Areas to Improve</h4>
                <ul className="text-sm space-y-1">
                  {data.weaknessAnalysis.weaknesses.map((weakness, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <AlertCircle className="w-3 h-3 text-red-500" />
                      {weakness}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Personalized Study Plan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Today's Focus</h4>
              <p className="text-sm bg-blue-50 p-3 rounded">{data.studyPlan.todaysFocus}</p>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">This Week's Goals</h4>
              <ul className="text-sm space-y-1">
                {data.studyPlan.thisWeekGoals.map((goal, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Target className="w-3 h-3 text-blue-500" />
                    {goal}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Priority Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.recommendations.map((rec, index) => (
                <div key={index} className="border rounded p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={rec.priority === "high" ? "destructive" : rec.priority === "medium" ? "default" : "secondary"}>
                      {rec.priority} priority
                    </Badge>
                    <Badge variant="outline">{rec.type}</Badge>
                  </div>
                  <p className="text-sm font-medium mb-1">{rec.suggestion}</p>
                  <p className="text-xs text-muted-foreground">{rec.reason}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 text-center">
      <p>Loading...</p>
    </div>
  );
}
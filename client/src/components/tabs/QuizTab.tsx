import { useState } from "react";
import { useApp } from "../../contexts/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Timer, Zap, Heart, Shield, Trophy } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "../../lib/queryClient";

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  points: number;
  difficulty: "easy" | "medium" | "hard";
  powerUp: "shield" | "speed" | "double-points" | "none";
}

interface Quiz {
  mode: string;
  questions: QuizQuestion[];
  gameElements: {
    theme: string;
    instructions: string;
    scoring: string;
  };
}

export function QuizTab() {
  const { state } = useApp();
  const [selectedNote, setSelectedNote] = useState<number | null>(null);
  const [selectedMode, setSelectedMode] = useState<string>("speedrun");
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameState, setGameState] = useState<"menu" | "playing" | "finished">("menu");
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [powerUps, setPowerUps] = useState({ shield: 0, speed: 0, doublePoints: 0 });
  const [streak, setStreak] = useState(0);

  const generateQuizMutation = useMutation({
    mutationFn: async ({ noteId, mode }: { noteId: number; mode: string }) => {
      const response = await fetch(`/api/notes/${noteId}/quiz`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mode, difficulty: "medium" })
      });
      if (!response.ok) {
        throw new Error('Failed to generate quiz');
      }
      return response.json();
    },
    onSuccess: (quiz: Quiz) => {
      setCurrentQuiz(quiz);
      setCurrentQuestion(0);
      setScore(0);
      setLives(quiz.mode === "survival" ? 3 : 1);
      setTimeLeft(quiz.mode === "speedrun" ? 15 : 30);
      setPowerUps({ shield: 1, speed: 1, doublePoints: 1 });
      setStreak(0);
      setGameState("playing");
      startTimer(quiz.mode === "speedrun" ? 15 : 30);
    }
  });

  const startTimer = (seconds: number) => {
    setTimeLeft(seconds);
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleTimeUp = () => {
    if (currentQuiz?.mode === "survival") {
      setLives(prev => prev - 1);
      if (lives <= 1) {
        setGameState("finished");
        return;
      }
    }
    nextQuestion();
  };

  const handleAnswer = (answerIndex: number) => {
    if (selectedAnswer !== null) return;
    
    setSelectedAnswer(answerIndex);
    setShowExplanation(true);

    const question = currentQuiz!.questions[currentQuestion];
    const isCorrect = answerIndex === question.correct;

    if (isCorrect) {
      let points = question.points;
      if (powerUps.doublePoints > 0) {
        points *= 2;
        setPowerUps(prev => ({ ...prev, doublePoints: prev.doublePoints - 1 }));
      }
      if (streak >= 2) points *= 1.5; // Streak bonus
      
      setScore(prev => prev + Math.round(points));
      setStreak(prev => prev + 1);
    } else {
      setStreak(0);
      if (currentQuiz!.mode === "survival") {
        if (powerUps.shield > 0) {
          setPowerUps(prev => ({ ...prev, shield: prev.shield - 1 }));
        } else {
          setLives(prev => prev - 1);
        }
      }
    }

    setTimeout(() => {
      nextQuestion();
    }, 3000);
  };

  const nextQuestion = () => {
    setSelectedAnswer(null);
    setShowExplanation(false);
    
    if (currentQuestion + 1 >= currentQuiz!.questions.length || (currentQuiz!.mode === "survival" && lives <= 0)) {
      setGameState("finished");
      return;
    }

    setCurrentQuestion(prev => prev + 1);
    startTimer(currentQuiz!.mode === "speedrun" ? 15 : 30);
  };

  const restartQuiz = () => {
    setGameState("menu");
    setCurrentQuiz(null);
    setSelectedNote(null);
  };

  const getGameModeIcon = (mode: string) => {
    switch (mode) {
      case "speedrun": return <Timer className="w-5 h-5" />;
      case "survival": return <Heart className="w-5 h-5" />;
      case "battle": return <Zap className="w-5 h-5" />;
      default: return <Trophy className="w-5 h-5" />;
    }
  };

  const getGameModeColor = (mode: string) => {
    switch (mode) {
      case "speedrun": return "bg-yellow-500";
      case "survival": return "bg-red-500";
      case "battle": return "bg-purple-500";
      default: return "bg-blue-500";
    }
  };

  if (gameState === "menu") {
    return (
      <div className="p-4 space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Quiz Arena 🎮</h2>
          <p className="text-muted-foreground">Turn your notes into epic gaming challenges</p>
        </div>

        {/* Game Mode Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Choose Your Game Mode</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { mode: "speedrun", title: "⚡ Speed Run", desc: "Quick fire questions, beat the clock!" },
              { mode: "survival", title: "❤️ Survival Mode", desc: "Lives system, getting harder each round" },
              { mode: "battle", title: "⚔️ Battle Royale", desc: "Power-ups, shields, and epic point multipliers" }
            ].map(({ mode, title, desc }) => (
              <div
                key={mode}
                className={`game-mode-card p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedMode === mode ? 'border-primary bg-primary/10' : 'hover:bg-muted'
                }`}
                onClick={() => setSelectedMode(mode)}
              >
                <div className="flex items-center gap-3">
                  {getGameModeIcon(mode)}
                  <div>
                    <h3 className="font-semibold">{title}</h3>
                    <p className="text-sm text-muted-foreground">{desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Note Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Your Study Material</CardTitle>
          </CardHeader>
          <CardContent>
            {state.notes.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No notes available. Create some notes first!
              </p>
            ) : (
              <div className="space-y-2">
                {state.notes.map((note) => (
                  <div
                    key={note.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                      selectedNote === note.id ? 'border-primary bg-primary/10' : 'hover:bg-muted'
                    }`}
                    onClick={() => setSelectedNote(note.id)}
                  >
                    <h3 className="font-medium">{note.title}</h3>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="secondary">{note.style}</Badge>
                      <Badge variant="outline">Study Material</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {selectedNote && (
          <Button
            className="w-full"
            size="lg"
            onClick={() => generateQuizMutation.mutate({ noteId: selectedNote, mode: selectedMode })}
            disabled={generateQuizMutation.isPending}
          >
            {generateQuizMutation.isPending ? "Generating Quiz..." : "Start Game! 🚀"}
          </Button>
        )}
      </div>
    );
  }

  if (gameState === "playing" && currentQuiz) {
    const question = currentQuiz.questions[currentQuestion];
    const progress = ((currentQuestion + 1) / currentQuiz.questions.length) * 100;

    return (
      <div className="p-4 space-y-4">
        {/* Game HUD */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Badge className={getGameModeColor(currentQuiz.mode)}>
              {getGameModeIcon(currentQuiz.mode)}
              {currentQuiz.mode.toUpperCase()}
            </Badge>
            <div className="text-2xl font-bold">⭐ {score}</div>
            {streak > 1 && (
              <Badge variant="secondary">🔥 {streak}x Streak</Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Timer className="w-4 h-4" />
            <span className={`font-mono ${timeLeft <= 5 ? 'text-red-500' : ''}`}>
              {timeLeft}s
            </span>
          </div>
        </div>

        {/* Lives & Power-ups */}
        <div className="flex justify-between items-center">
          {currentQuiz.mode === "survival" && (
            <div className="flex items-center gap-1">
              {Array.from({ length: lives }, (_, i) => (
                <Heart key={i} className="w-5 h-5 text-red-500 fill-current" />
              ))}
            </div>
          )}
          <div className="flex gap-2">
            {powerUps.shield > 0 && (
              <Badge variant="outline">
                <Shield className="w-3 h-3 mr-1" />
                {powerUps.shield}
              </Badge>
            )}
            {powerUps.doublePoints > 0 && (
              <Badge variant="outline">
                <Zap className="w-3 h-3 mr-1" />
                {powerUps.doublePoints}
              </Badge>
            )}
          </div>
        </div>

        <Progress value={progress} />

        {/* Question */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Question {currentQuestion + 1} of {currentQuiz.questions.length}
            </CardTitle>
            <div className="flex gap-2">
              <Badge variant={question.difficulty === 'easy' ? 'secondary' : question.difficulty === 'medium' ? 'default' : 'destructive'}>
                {question.difficulty || 'medium'}
              </Badge>
              <Badge variant="outline">{question.points} pts</Badge>
              {question.powerUp !== 'none' && (
                <Badge className="bg-purple-500">
                  Power-up: {question.powerUp}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-lg mb-4">{question.question}</p>
            
            <div className="space-y-2">
              {question.options.map((option, index) => (
                <Button
                  key={index}
                  variant={
                    selectedAnswer === null ? "outline" :
                    index === question.correct ? "default" :
                    selectedAnswer === index ? "destructive" : "outline"
                  }
                  className="w-full text-left justify-start"
                  onClick={() => handleAnswer(index)}
                  disabled={selectedAnswer !== null}
                >
                  {option}
                </Button>
              ))}
            </div>

            {showExplanation && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="font-medium mb-2">
                  {selectedAnswer === question.correct ? "✅ Correct!" : "❌ Incorrect"}
                </p>
                <p className="text-sm">{question.explanation}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (gameState === "finished" && currentQuiz) {
    const finalScore = score;
    const accuracy = Math.round((streak / currentQuiz.questions.length) * 100) || 0;

    return (
      <div className="p-4 space-y-6 text-center">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Game Complete! 🎉</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-6xl font-bold text-primary">{finalScore}</div>
            <p className="text-xl">Final Score</p>
            
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold">{accuracy}%</div>
                <div className="text-sm text-muted-foreground">Accuracy</div>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold">{currentQuestion + 1}</div>
                <div className="text-sm text-muted-foreground">Questions</div>
              </div>
            </div>

            <div className="space-y-2 mt-6">
              <Button className="w-full" onClick={restartQuiz}>
                Play Again 🔄
              </Button>
              <Button variant="outline" className="w-full" onClick={() => setGameState("menu")}>
                Choose Different Mode
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
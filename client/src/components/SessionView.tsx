import { useState } from "react";
import { motion } from "framer-motion";
import { RotateCcw, Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FlashcardViewer } from "@/components/FlashcardViewer";
import { QuizSection } from "@/components/QuizSection";
import { ScoreDisplay } from "@/components/ScoreDisplay";
import type { StudyMaterial } from "@/types/schemas";

interface SessionViewProps {
  material: StudyMaterial;
  flashcards: StudyMaterial["flashcards"];
  currentCardIndex: number;
  isFlipped: boolean;
  onFlip: () => void;
  onNextCard: () => void;
  onPrevCard: () => void;
  onShuffle: () => void;
  quiz: StudyMaterial["quiz"];
  currentQuizIndex: number;
  quizAttempts: { questionIndex: number; selectedAnswer: string; isCorrect: boolean }[];
  onSubmitAnswer: (questionIndex: number, answer: string) => void;
  onNextQuiz: () => void;
  quizScore: { correct: number; total: number };
  wrongQuestions: StudyMaterial["quiz"];
  onRetryWrong: () => void;
  onResetSession: () => void;
  progress: number;
}

export function SessionView({
  material,
  flashcards,
  currentCardIndex,
  isFlipped,
  onFlip,
  onNextCard,
  onPrevCard,
  onShuffle,
  quiz,
  currentQuizIndex,
  quizAttempts,
  onSubmitAnswer,
  onNextQuiz,
  quizScore,
  wrongQuestions,
  onRetryWrong,
  onResetSession,
  progress,
}: SessionViewProps) {
  const [activeTab, setActiveTab] = useState("flashcards");
  const allQuizAnswered = quizAttempts.length >= quiz.length;
  const showScore = activeTab === "quiz" && allQuizAnswered;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-3xl mx-auto flex flex-col gap-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">{material.title}</h2>
          <p className="text-muted-foreground text-sm mt-1">{material.summary}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onResetSession}>
          <RotateCcw className="mr-2 h-4 w-4" />
          New Session
        </Button>
      </div>

      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <Progress value={progress} className="flex-1" />
        <span className="text-sm text-muted-foreground whitespace-nowrap">{progress}%</span>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="flashcards" onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="flashcards">
              Flashcards ({flashcards.length})
            </TabsTrigger>
            <TabsTrigger value="quiz">
              Quiz ({quiz.length})
            </TabsTrigger>
          </TabsList>

          {activeTab === "flashcards" && (
            <Button variant="outline" size="sm" onClick={onShuffle}>
              <Shuffle className="mr-2 h-4 w-4" />
              Shuffle
            </Button>
          )}
        </div>

        <TabsContent value="flashcards">
          <FlashcardViewer
            flashcards={flashcards}
            currentIndex={currentCardIndex}
            isFlipped={isFlipped}
            onFlip={onFlip}
            onNext={onNextCard}
            onPrev={onPrevCard}
          />
        </TabsContent>

        <TabsContent value="quiz">
          {showScore ? (
            <ScoreDisplay
              correct={quizScore.correct}
              total={quizScore.total}
              wrongCount={wrongQuestions.length}
              onRetryWrong={onRetryWrong}
              onRestart={onRetryWrong}
            />
          ) : (
            <QuizSection
              quiz={quiz}
              currentIndex={currentQuizIndex}
              attempts={quizAttempts}
              onSelectAnswer={onSubmitAnswer}
              onNext={onNextQuiz}
            />
          )}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}

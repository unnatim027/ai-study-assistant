import { motion } from "framer-motion";
import { CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { QuizOption } from "../../../shared/schemas";
import type { QuizAttempt } from "../types";

interface QuizSectionProps {
  quiz: QuizOption[];
  currentIndex: number;
  attempts: QuizAttempt[];
  onSelectAnswer: (questionIndex: number, answer: string) => void;
  onNext: () => void;
}

export function QuizSection({
  quiz,
  currentIndex,
  attempts,
  onSelectAnswer,
  onNext,
}: QuizSectionProps) {
  const question = quiz[currentIndex];
  if (!question) return null;

  const attempt = attempts.find((a) => a.questionIndex === currentIndex);
  const hasAnswered = !!attempt;
  const isCorrect = attempt?.isCorrect ?? false;

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      {/* Progress indicator */}
      <Badge variant="secondary" className="self-start text-sm">
        Question {currentIndex + 1} of {quiz.length}
      </Badge>

      {/* Question */}
      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="shadow-md">
          <CardContent className="p-6">
            <p className="text-lg font-medium mb-6">{question.question}</p>

            {/* Options */}
            <div className="flex flex-col gap-3">
              {question.options.map((option, i) => {
                const letter = String.fromCharCode(65 + i);
                const isSelected = attempt?.selectedAnswer === option;
                const isCorrectOption = option === question.correctAnswer;

                return (
                  <button
                    key={i}
                    disabled={hasAnswered}
                    onClick={() => onSelectAnswer(currentIndex, option)}
                    className={cn(
                      "flex items-center gap-3 w-full p-4 rounded-lg border text-left transition-all duration-200",
                      !hasAnswered && "hover:bg-accent hover:border-primary/50 cursor-pointer",
                      hasAnswered && isCorrectOption && "bg-green-100 dark:bg-green-900/30 border-green-500",
                      hasAnswered && isSelected && !isCorrectOption && "bg-red-100 dark:bg-red-900/30 border-red-500",
                      hasAnswered && !isSelected && !isCorrectOption && "opacity-50"
                    )}
                  >
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-sm font-medium">
                      {letter}
                    </span>
                    <span className="flex-1">{option}</span>
                    {hasAnswered && isCorrectOption && (
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                    )}
                    {hasAnswered && isSelected && !isCorrectOption && (
                      <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Feedback */}
            {hasAnswered && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "mt-4 p-4 rounded-lg text-sm",
                  isCorrect
                    ? "bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300"
                    : "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300"
                )}
              >
                <p className="font-medium mb-1">
                  {isCorrect ? "Correct!" : "Incorrect"}
                </p>
                <p>{question.explanation}</p>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Next button */}
      {hasAnswered && currentIndex < quiz.length - 1 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Button onClick={onNext} className="w-full">
            Next Question
          </Button>
        </motion.div>
      )}
    </div>
  );
}

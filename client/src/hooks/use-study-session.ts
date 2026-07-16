import { useState, useCallback, useMemo } from "react";
import type { StudyMaterial, Flashcard, QuizOption } from "../../../shared/schemas";
import type { QuizAttempt } from "../types";

/** Fisher-Yates shuffle (immutable). */
function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

interface UseStudySessionReturn {
  material: StudyMaterial | null;
  loadMaterial: (m: StudyMaterial) => void;

  /** Flashcards */
  flashcards: Flashcard[];
  currentCardIndex: number;
  setCurrentCardIndex: (i: number) => void;
  nextCard: () => void;
  prevCard: () => void;
  shuffleFlashcards: () => void;
  isFlipped: boolean;
  setIsFlipped: (v: boolean) => void;

  /** Quiz */
  quiz: QuizOption[];
  currentQuizIndex: number;
  setCurrentQuizIndex: (i: number) => void;
  quizAttempts: QuizAttempt[];
  submitQuizAnswer: (questionIndex: number, answer: string) => void;
  quizScore: { correct: number; total: number };
  wrongQuestions: QuizOption[];
  retryWrongOnly: () => void;

  /** Session */
  progress: number; // 0-100
  resetSession: () => void;
}

export function useStudySession(): UseStudySessionReturn {
  const [material, setMaterial] = useState<StudyMaterial | null>(null);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const [quiz, setQuiz] = useState<QuizOption[]>([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);

  const loadMaterial = useCallback((m: StudyMaterial) => {
    setMaterial(m);
    setFlashcards(m.flashcards);
    setQuiz(m.quiz);
    setCurrentCardIndex(0);
    setCurrentQuizIndex(0);
    setQuizAttempts([]);
    setIsFlipped(false);
  }, []);

  const nextCard = useCallback(() => {
    setIsFlipped(false);
    setCurrentCardIndex((i) => Math.min(i + 1, flashcards.length - 1));
  }, [flashcards.length]);

  const prevCard = useCallback(() => {
    setIsFlipped(false);
    setCurrentCardIndex((i) => Math.max(i - 1, 0));
  }, []);

  const shuffleFlashcards = useCallback(() => {
    setFlashcards((fc) => shuffle(fc));
    setCurrentCardIndex(0);
    setIsFlipped(false);
  }, []);

  const submitQuizAnswer = useCallback(
    (questionIndex: number, answer: string) => {
      const q = quiz[questionIndex];
      if (!q) return;

      setQuizAttempts((prev) => {
        // Don't allow re-answering the same question
        if (prev.some((a) => a.questionIndex === questionIndex)) return prev;
        return [
          ...prev,
          {
            questionIndex,
            selectedAnswer: answer,
            isCorrect: answer === q.correctAnswer,
          },
        ];
      });
    },
    [quiz]
  );

  const quizScore = useMemo(() => {
    const correct = quizAttempts.filter((a) => a.isCorrect).length;
    return { correct, total: quiz.length };
  }, [quizAttempts, quiz.length]);

  const wrongQuestions = useMemo(() => {
    const wrongIndices = new Set(
      quizAttempts.filter((a) => !a.isCorrect).map((a) => a.questionIndex)
    );
    return quiz.filter((_, i) => wrongIndices.has(i));
  }, [quizAttempts, quiz]);

  const retryWrongOnly = useCallback(() => {
    if (wrongQuestions.length === 0) return;
    setQuiz(wrongQuestions);
    setCurrentQuizIndex(0);
    setQuizAttempts([]);
  }, [wrongQuestions]);

  const progress = useMemo(() => {
    if (!material) return 0;
    const totalItems = material.flashcards.length + material.quiz.length;
    const viewedCards = Math.min(currentCardIndex + 1, material.flashcards.length);
    const answeredQuestions = quizAttempts.length;
    return Math.round(((viewedCards + answeredQuestions) / totalItems) * 100);
  }, [material, currentCardIndex, quizAttempts]);

  const resetSession = useCallback(() => {
    setMaterial(null);
    setFlashcards([]);
    setCurrentCardIndex(0);
    setQuiz([]);
    setCurrentQuizIndex(0);
    setQuizAttempts([]);
    setIsFlipped(false);
  }, []);

  return {
    material,
    loadMaterial,
    flashcards,
    currentCardIndex,
    setCurrentCardIndex,
    nextCard,
    prevCard,
    shuffleFlashcards,
    isFlipped,
    setIsFlipped,
    quiz,
    currentQuizIndex,
    setCurrentQuizIndex,
    quizAttempts,
    submitQuizAnswer,
    quizScore,
    wrongQuestions,
    retryWrongOnly,
    progress,
    resetSession,
  };
}

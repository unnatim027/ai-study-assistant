/**
 * Frontend-specific types.
 * Core domain types are imported from shared/schemas.ts for Zod validation.
 * These types extend or complement the shared schema types.
 */

/** Possible phases of the generation pipeline. */
export type LoadingPhase = "idle" | "generating" | "parsing" | "rendering";

/** Active tab in the study session view. */
export type StudyTab = "flashcards" | "quiz";

/** Tracks which quiz answers the user selected and whether they were correct. */
export interface QuizAttempt {
  questionIndex: number;
  selectedAnswer: string;
  isCorrect: boolean;
}

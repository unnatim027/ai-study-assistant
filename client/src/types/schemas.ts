import { z } from "zod";

/** A single flashcard with question on front and answer on back. */
export const FlashcardSchema = z.object({
  question: z.string().min(1, "Question must not be empty"),
  answer: z.string().min(1, "Answer must not be empty"),
});

/** A single quiz question with four options and the correct answer. */
export const QuizOptionSchema = z.object({
  question: z.string().min(1, "Question must not be empty"),
  options: z
    .array(z.string())
    .length(4, "Each quiz question must have exactly 4 options"),
  correctAnswer: z.string().min(1, "correctAnswer must not be empty"),
  explanation: z.string().min(1, "Explanation must not be empty"),
});

/** The full structured response we expect from the LLM. */
export const StudyMaterialSchema = z.object({
  title: z.string().min(1, "Title must not be empty"),
  summary: z.string().min(1, "Summary must not be empty"),
  flashcards: z
    .array(FlashcardSchema)
    .min(1, "At least one flashcard is required"),
  quiz: z.array(QuizOptionSchema).min(1, "At least one quiz question is required"),
});

export type Flashcard = z.infer<typeof FlashcardSchema>;
export type QuizOption = z.infer<typeof QuizOptionSchema>;
export type StudyMaterial = z.infer<typeof StudyMaterialSchema>;

/** Request body for POST /generate */
export const GenerateRequestSchema = z.object({
  notes: z
    .string()
    .min(10, "Please provide at least 10 characters of study notes")
    .max(10000, "Notes cannot exceed 10,000 characters"),
});

export type GenerateRequest = z.infer<typeof GenerateRequestSchema>;

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Loader2, Sparkles, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { GenerateRequestSchema, type GenerateRequest } from "@/types/schemas";
import type { LoadingPhase } from "../types";

interface NotesFormProps {
  onSubmit: (notes: string) => void;
  isLoading: boolean;
  phase: LoadingPhase;
  error: string | null;
  onRetry: () => void;
}

const phaseLabels: Record<LoadingPhase, string> = {
  idle: "",
  generating: "Generating study material...",
  parsing: "Validating AI response...",
  rendering: "Preparing your study session...",
};

export function NotesForm({ onSubmit, isLoading, phase, error, onRetry }: NotesFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<GenerateRequest>({
    resolver: zodResolver(GenerateRequestSchema),
    defaultValues: { notes: "" },
  });

  const notesValue = watch("notes");
  const charCount = notesValue?.length ?? 0;

  const handleFormSubmit = (data: GenerateRequest) => {
    onSubmit(data.notes);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-2xl mx-auto"
    >
      <Card className="shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Study Assistant</CardTitle>
          <p className="text-muted-foreground text-sm">
            Paste your study notes and we'll generate flashcards and quizzes for you.
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4">
            {/* Textarea */}
            <div className="relative">
              <textarea
                {...register("notes")}
                placeholder="Paste your study notes here... (e.g., chapter summaries, lecture notes, textbook excerpts)"
                disabled={isLoading}
                rows={8}
                className="w-full resize-none rounded-lg border bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <span className="absolute bottom-3 right-3 text-xs text-muted-foreground">
                {charCount} / 10,000
              </span>
            </div>

            {/* Validation error */}
            {errors.notes && (
              <p className="text-sm text-destructive">{errors.notes.message}</p>
            )}

            {/* Submit button */}
            <Button type="submit" disabled={isLoading} className="w-full" size="lg">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {phaseLabels[phase]}
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Study Material
                </>
              )}
            </Button>
          </form>

          {/* Error state */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4"
            >
              <Alert variant="destructive">
                <AlertTitle>Generation Failed</AlertTitle>
                <AlertDescription className="flex flex-col gap-3">
                  <p>{error}</p>
                  <Button variant="outline" size="sm" onClick={onRetry} className="self-start">
                    Try Again
                  </Button>
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

import { useState, useCallback, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import { NotesForm } from "@/components/NotesForm";
import { SessionView } from "@/components/SessionView";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useStudySession } from "@/hooks/use-study-session";
import { generateStudyMaterial } from "@/lib/api";
import { StudyMaterialSchema } from "@/types/schemas";
import type { LoadingPhase } from "@/types";

export default function App() {
  const [phase, setPhase] = useState<LoadingPhase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [lastNotes, setLastNotes] = useState("");
  const abortRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);

  const session = useStudySession();

  const generate = useCallback(
    async (notes: string) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      const currentRequestId = ++requestIdRef.current;

      setError(null);
      setLastNotes(notes);
      setPhase("generating");

      try {
        const raw = await generateStudyMaterial(notes, controller.signal);

        if (currentRequestId !== requestIdRef.current) return;

        setPhase("parsing");

        const parsed = StudyMaterialSchema.safeParse(raw);
        if (!parsed.success) {
          setError("AI returned invalid structured data.");
          setPhase("idle");
          return;
        }

        if (currentRequestId !== requestIdRef.current) return;

        setPhase("rendering");

        session.loadMaterial(parsed.data);

        await new Promise((r) => setTimeout(r, 300));

        if (currentRequestId !== requestIdRef.current) return;

        setPhase("idle");
      } catch (err: unknown) {
        if (currentRequestId !== requestIdRef.current) return;

        if (err instanceof Error && err.name === "CanceledError") return;

        let message = "Something went wrong. Please try again.";
        if (err instanceof Error && "code" in err) {
          const axErr = err as { code?: string; response?: { data?: { error?: string } } };
          if (axErr.code === "ECONNABORTED") {
            message = "Request timed out. The AI took too long \u2014 try shorter notes.";
          } else if (axErr.response?.data?.error) {
            message = axErr.response.data.error;
          } else if (axErr.code === "ERR_NETWORK") {
            message = "Network error. Is the server running?";
          }
        }
        setError(message);
        setPhase("idle");
      }
    },
    [session]
  );

  const handleRetry = useCallback(() => {
    if (lastNotes) generate(lastNotes);
  }, [lastNotes, generate]);

  const hasMaterial = !!session.material;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <h1 className="text-lg font-bold tracking-tight">Study Assistant</h1>
          <ThemeToggle />
        </div>
      </header>

      <AnimatePresence>
        {phase !== "idle" && <LoadingOverlay phase={phase} />}
      </AnimatePresence>

      <main className="container mx-auto px-4 py-8">
        {hasMaterial ? (
          <SessionView
            material={session.material!}
            flashcards={session.flashcards}
            currentCardIndex={session.currentCardIndex}
            isFlipped={session.isFlipped}
            onFlip={() => session.setIsFlipped(!session.isFlipped)}
            onNextCard={session.nextCard}
            onPrevCard={session.prevCard}
            onShuffle={session.shuffleFlashcards}
            quiz={session.quiz}
            currentQuizIndex={session.currentQuizIndex}
            quizAttempts={session.quizAttempts}
            onSubmitAnswer={session.submitQuizAnswer}
            onNextQuiz={() => {
              const next = Math.min(session.currentQuizIndex + 1, session.quiz.length - 1);
              session.setCurrentQuizIndex(next);
            }}
            quizScore={session.quizScore}
            wrongQuestions={session.wrongQuestions}
            onRetryWrong={session.retryWrongOnly}
            onResetSession={session.resetSession}
            progress={session.progress}
          />
        ) : (
          <NotesForm
            onSubmit={generate}
            isLoading={phase !== "idle"}
            phase={phase}
            error={error}
            onRetry={handleRetry}
          />
        )}
      </main>
    </div>
  );
}

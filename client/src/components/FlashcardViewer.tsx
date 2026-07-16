import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Flashcard } from "../../../shared/schemas";

interface FlashcardViewerProps {
  flashcards: Flashcard[];
  currentIndex: number;
  isFlipped: boolean;
  onFlip: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export function FlashcardViewer({
  flashcards,
  currentIndex,
  isFlipped,
  onFlip,
  onNext,
  onPrev,
}: FlashcardViewerProps) {
  const card = flashcards[currentIndex];
  if (!card) return null;

  const isFirst = currentIndex === 0;
  const isLast = currentIndex === flashcards.length - 1;

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Counter badge */}
      <Badge variant="secondary" className="text-sm">
        {currentIndex + 1} / {flashcards.length}
      </Badge>

      {/* Clickable flashcard */}
      <motion.div
        className="w-full max-w-lg cursor-pointer"
        onClick={onFlip}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        style={{ perspective: 1000 }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentIndex}-${isFlipped ? "back" : "front"}`}
            initial={{ rotateY: isFlipped ? -90 : 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: isFlipped ? 90 : -90, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="min-h-[250px] flex items-center justify-center p-8 shadow-lg">
              <CardContent className="flex flex-col items-center justify-center gap-4 text-center">
                <Badge variant="outline" className="text-xs">
                  {isFlipped ? "Answer" : "Question"}
                </Badge>
                <p className="text-lg leading-relaxed">
                  {isFlipped ? card.answer : card.question}
                </p>
                <RotateCcw className="h-4 w-4 text-muted-foreground mt-2" />
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Navigation */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={onPrev}
          disabled={isFirst}
          aria-label="Previous card"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={onFlip} aria-label="Flip card">
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={onNext}
          disabled={isLast}
          aria-label="Next card"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

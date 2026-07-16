import { motion } from "framer-motion";
import { Trophy, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ScoreDisplayProps {
  correct: number;
  total: number;
  wrongCount: number;
  onRetryWrong: () => void;
  onRestart: () => void;
}

export function ScoreDisplay({
  correct,
  total,
  wrongCount,
  onRetryWrong,
  onRestart,
}: ScoreDisplayProps) {
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="shadow-lg">
        <CardContent className="flex flex-col items-center gap-6 p-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Trophy className="h-8 w-8 text-primary" />
          </div>

          <div className="text-center">
            <h3 className="text-2xl font-bold">Quiz Complete!</h3>
            <p className="mt-2 text-4xl font-bold text-primary">
              {correct} / {total}
            </p>
            <p className="mt-1 text-muted-foreground">{percentage}% correct</p>
          </div>

          {/* Score bar */}
          <div className="w-full max-w-xs">
            <div className="h-3 w-full overflow-hidden rounded-full bg-secondary">
              <motion.div
                className="h-full rounded-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
            {wrongCount > 0 && (
              <Button variant="outline" onClick={onRetryWrong} className="flex-1">
                <RotateCcw className="mr-2 h-4 w-4" />
                Retry Wrong ({wrongCount})
              </Button>
            )}
            <Button onClick={onRestart} className="flex-1">
              Restart Quiz
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

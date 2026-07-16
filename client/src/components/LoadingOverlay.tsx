import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import type { LoadingPhase } from "../types";

interface LoadingOverlayProps {
  phase: LoadingPhase;
}

const phaseMessages: Record<string, string> = {
  generating: "Asking the AI to analyze your notes...",
  parsing: "Checking the response structure...",
  rendering: "Building your study materials...",
};

export function LoadingOverlay({ phase }: LoadingOverlayProps) {
  if (phase === "idle") return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col items-center gap-4 p-8"
      >
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-lg font-medium text-foreground">
          {phaseMessages[phase] || "Working..."}
        </p>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="h-2 w-2 rounded-full bg-primary"
              animate={{ y: [0, -8, 0] }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.15,
              }}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

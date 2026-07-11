"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Gem, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { ProcessingStage, PROCESSING_STAGE_LABEL } from "@/types/diamond";

const STAGES: ProcessingStage[] = [
  "uploading",
  "loading-model",
  "detecting",
  "measuring",
  "reporting",
];

export function ProcessingOverlay({
  imageUrl,
  stage,
  progress,
}: {
  imageUrl: string;
  stage: ProcessingStage;
  progress: number;
}) {
  const currentIndex = STAGES.indexOf(stage);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="glass overflow-hidden rounded-3xl"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-black/50">
        <img src={imageUrl} alt="Processing" className="h-full w-full object-contain opacity-70" />

        <div className="absolute inset-0 bg-grid opacity-30" />
        <motion.div
          className="absolute left-0 right-0 h-24 bg-gradient-to-b from-transparent via-[var(--brand-cyan)]/40 to-transparent"
          style={{ animation: "scan-line 2.2s ease-in-out infinite" }}
        />
        <div className="pointer-events-none absolute inset-6 rounded-2xl border border-[var(--brand-cyan)]/30" />
        {[...Array(4)].map((_, i) => (
          <span
            key={i}
            className={`pointer-events-none absolute h-5 w-5 border-[var(--brand-cyan)] ${
              i === 0
                ? "left-4 top-4 border-l-2 border-t-2"
                : i === 1
                  ? "right-4 top-4 border-r-2 border-t-2"
                  : i === 2
                    ? "bottom-4 left-4 border-b-2 border-l-2"
                    : "bottom-4 right-4 border-b-2 border-r-2"
            }`}
          />
        ))}

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="glass-strong glow-cyan flex h-16 w-16 items-center justify-center rounded-2xl"
          >
            <Gem className="h-7 w-7 text-[var(--brand-cyan)]" />
          </motion.div>
        </div>
      </div>

      <div className="space-y-5 p-6">
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2 font-medium">
            <Loader2 className="h-4 w-4 animate-spin text-[var(--brand-cyan)]" />
            {PROCESSING_STAGE_LABEL[stage]}
          </span>
          <span className="tabular-nums text-muted-foreground">{Math.round(progress)}%</span>
        </div>

        <Progress value={progress} className="h-2 bg-white/10" />

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {STAGES.map((s, i) => {
            const done = i < currentIndex || stage === "done";
            const active = i === currentIndex && stage !== "done";
            return (
              <div
                key={s}
                className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs transition-colors ${
                  active
                    ? "glass-strong text-foreground"
                    : done
                      ? "text-[var(--brand-cyan)]"
                      : "text-muted-foreground/50"
                }`}
              >
                <AnimatePresence mode="wait">
                  {done ? (
                    <motion.span key="done" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </motion.span>
                  ) : active ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <span className="h-3.5 w-3.5 rounded-full border border-current" />
                  )}
                </AnimatePresence>
                <span className="hidden truncate sm:inline">
                  {PROCESSING_STAGE_LABEL[s].replace("...", "")}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

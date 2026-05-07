"use client";

import { motion, AnimatePresence } from "framer-motion";
import * as Icons from "lucide-react";
import type { PaymentStep } from "@/lib/types";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  CreditCard: Icons.CreditCard,
  Monitor: Icons.Monitor,
  Server: Icons.Server,
  Building2: Icons.Building2,
  Network: Icons.Network,
  Landmark: Icons.Landmark,
  ArrowLeftRight: Icons.ArrowLeftRight,
  Banknote: Icons.Banknote,
};

interface StepDetailProps {
  step: PaymentStep | null;
  stepNumber: number;
  onClose: () => void;
}

export function StepDetail({ step, stepNumber, onClose }: StepDetailProps) {
  return (
    <AnimatePresence mode="wait">
      {step && (
        <motion.div
          key={step.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
          className="rounded-xl border border-accent/20 bg-accent/5 p-6 sm:p-8"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-white text-sm font-bold">
                {stepNumber}
              </div>
              <div>
                <h3 className="text-lg font-semibold">{step.label}</h3>
                <p className="text-sm text-muted">{step.shortDescription}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-muted transition-colors hover:bg-border hover:text-foreground"
              aria-label="Close detail"
            >
              <Icons.X className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-4 text-sm leading-relaxed text-foreground/80">
            {step.detailedExplanation.split(". ").reduce<string[][]>(
              (chunks, sentence, i) => {
                const chunkIndex = Math.floor(i / 3);
                if (!chunks[chunkIndex]) chunks[chunkIndex] = [];
                chunks[chunkIndex].push(sentence);
                return chunks;
              },
              []
            ).map((chunk, i) => (
              <p key={i} className={i > 0 ? "mt-3" : ""}>
                {chunk.join(". ")}{!chunk[chunk.length - 1].endsWith(".") ? "." : ""}
              </p>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

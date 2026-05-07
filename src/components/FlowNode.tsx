"use client";

import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { cn } from "@/lib/utils";
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

interface FlowNodeProps {
  step: PaymentStep;
  index: number;
  isActive: boolean;
  onClick: () => void;
}

export function FlowNode({ step, index, isActive, onClick }: FlowNodeProps) {
  const Icon = iconMap[step.icon] || Icons.Circle;

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.12, duration: 0.4 }}
      onClick={onClick}
      className={cn(
        "group flex flex-col items-center gap-3 rounded-xl border-2 p-5 transition-all cursor-pointer",
        "hover:shadow-lg hover:border-accent/50",
        isActive
          ? "border-accent bg-accent/5 shadow-md"
          : "border-border bg-surface"
      )}
    >
      <div
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-full transition-colors",
          isActive
            ? "bg-accent text-white"
            : "bg-accent/10 text-accent group-hover:bg-accent/20"
        )}
      >
        <Icon className="h-6 w-6" />
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold">{step.label}</p>
        <p className="mt-1 text-xs text-muted leading-snug">
          {step.shortDescription}
        </p>
      </div>
    </motion.button>
  );
}

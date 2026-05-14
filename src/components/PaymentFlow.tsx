"use client";

import { useState, type KeyboardEvent } from "react";
import { paymentSteps } from "@/lib/payment-steps";
import { FlowNode } from "./FlowNode";
import { FlowConnector } from "./FlowConnector";
import { StepDetail } from "./StepDetail";
import { RotateCcw } from "lucide-react";

export function PaymentFlow() {
  const [activeStep, setActiveStep] = useState<string | null>(null);
  const [key, setKey] = useState(0);

  const activeStepData = activeStep
    ? paymentSteps.find((s) => s.id === activeStep) ?? null
    : null;

  const activeStepIndex = activeStep
    ? paymentSteps.findIndex((s) => s.id === activeStep)
    : -1;

  function handleReplay() {
    setActiveStep(null);
    setKey((k) => k + 1);
  }

  // Keyboard nav. Arrow keys step through the flow directly (active state
  // moves, detail panel updates). Home/End jump to ends. Escape closes.
  // Wraps around at the edges so you can keep tapping → to loop.
  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const isForward = e.key === "ArrowRight" || e.key === "ArrowDown";
    const isBack = e.key === "ArrowLeft" || e.key === "ArrowUp";
    if (!isForward && !isBack && e.key !== "Home" && e.key !== "End" && e.key !== "Escape") {
      return;
    }
    e.preventDefault();

    if (e.key === "Escape") {
      setActiveStep(null);
      return;
    }

    const lastIndex = paymentSteps.length - 1;
    let nextIndex = activeStepIndex;

    if (e.key === "Home") nextIndex = 0;
    else if (e.key === "End") nextIndex = lastIndex;
    else if (isForward)
      nextIndex = activeStepIndex < 0 ? 0 : (activeStepIndex + 1) % paymentSteps.length;
    else if (isBack)
      nextIndex =
        activeStepIndex < 0 ? lastIndex : (activeStepIndex - 1 + paymentSteps.length) % paymentSteps.length;

    setActiveStep(paymentSteps[nextIndex].id);
  }

  return (
    <div key={key} onKeyDown={handleKeyDown}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold sm:text-3xl">
            How a Payment Works
          </h2>
          <p className="mt-2 text-muted">
            Click any step to learn what happens under the hood.
          </p>
        </div>
        <button
          onClick={handleReplay}
          className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-muted transition-colors hover:border-accent hover:text-accent"
          aria-label="Replay animation"
        >
          <RotateCcw className="h-4 w-4" />
          <span className="hidden sm:inline">Replay</span>
        </button>
      </div>

      {/* Desktop: grid flow */}
      <div
        className="hidden sm:grid grid-cols-4 gap-3"
        role="group"
        aria-label="Payment flow steps. Use arrow keys to navigate."
      >
        {paymentSteps.map((step, i) => (
          <FlowNode
            key={step.id}
            step={step}
            index={i}
            isActive={activeStep === step.id}
            onClick={() =>
              setActiveStep(activeStep === step.id ? null : step.id)
            }
          />
        ))}
      </div>

      {/* Mobile: vertical flow */}
      <div
        className="flex flex-col items-center sm:hidden"
        role="group"
        aria-label="Payment flow steps"
      >
        {paymentSteps.map((step, i) => (
          <div key={step.id} className="flex flex-col items-center w-full max-w-[280px]">
            <FlowNode
              step={step}
              index={i}
              isActive={activeStep === step.id}
              onClick={() =>
                setActiveStep(activeStep === step.id ? null : step.id)
              }
            />
            {i < paymentSteps.length - 1 && (
              <FlowConnector index={i} direction="down" />
            )}
          </div>
        ))}
      </div>

      {/* Keyboard hint — only visible on devices that likely have keyboards (sm+) */}
      <p className="mt-3 hidden text-xs text-muted sm:block">
        Tip: use <kbd className="rounded border border-border bg-surface px-1 py-0.5 text-[10px] font-mono">←</kbd> <kbd className="rounded border border-border bg-surface px-1 py-0.5 text-[10px] font-mono">→</kbd> to step through, <kbd className="rounded border border-border bg-surface px-1 py-0.5 text-[10px] font-mono">Esc</kbd> to close.
      </p>

      <div className="mt-8">
        <StepDetail
          step={activeStepData}
          stepNumber={activeStepIndex + 1}
          onClose={() => setActiveStep(null)}
        />
      </div>
    </div>
  );
}

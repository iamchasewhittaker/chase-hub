"use client";

// AI Integration Troubleshooter — collapsible chat panel on /payments.
//
// Architecture:
//   - useChat from @ai-sdk/react (v6 API)
//   - DefaultChatTransport pointed at /api/chat
//   - Per-session rate limit: 20 USER messages, tracked in localStorage
//   - Status states: 'ready' | 'submitted' | 'streaming' | 'error'
//
// Voice: matches the site's tone. Warm, direct. No hype.

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, Square } from "lucide-react";
import { cn } from "@/lib/utils";

const RATE_LIMIT_KEY = "chase-hub:troubleshooter-count";
const RATE_LIMIT_MAX = 20;

function getRateCount(): number {
  if (typeof window === "undefined") return 0;
  const raw = window.localStorage.getItem(RATE_LIMIT_KEY);
  const n = raw ? Number.parseInt(raw, 10) : 0;
  return Number.isNaN(n) ? 0 : n;
}

function bumpRateCount(): number {
  const next = getRateCount() + 1;
  window.localStorage.setItem(RATE_LIMIT_KEY, String(next));
  return next;
}

export function Troubleshooter() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [rateCount, setRateCount] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status, stop, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  // Sync rate count from localStorage on mount.
  useEffect(() => {
    setRateCount(getRateCount());
  }, []);

  // Autoscroll on new message chunks.
  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, status]);

  const rateRemaining = Math.max(0, RATE_LIMIT_MAX - rateCount);
  const overLimit = rateRemaining === 0;
  const canSend = status === "ready" && input.trim().length > 0 && !overLimit;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSend) return;
    sendMessage({ text: input });
    setInput("");
    setRateCount(bumpRateCount());
  }

  return (
    <section className="rounded-xl border border-border bg-surface shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-6 py-5 text-left"
        aria-expanded={open}
        aria-controls="troubleshooter-panel"
      >
        <div className="flex items-center gap-3">
          <MessageCircle className="h-5 w-5 text-accent" />
          <div>
            <h3 className="text-base font-semibold text-foreground">
              Stuck on an integration? Ask the troubleshooter.
            </h3>
            <p className="mt-0.5 text-sm text-muted">
              Six years of payments experience, distilled into a Claude prompt.
              Describe your problem, get a diagnosis.
            </p>
          </div>
        </div>
        <span
          aria-hidden
          className={cn(
            "text-2xl text-muted transition-transform",
            open && "rotate-45",
          )}
        >
          +
        </span>
      </button>

      {open && (
        <div id="troubleshooter-panel" className="border-t border-border px-6 py-5">
          <div
            ref={scrollRef}
            className="flex max-h-96 flex-col gap-4 overflow-y-auto"
            role="log"
            aria-live="polite"
            aria-atomic="false"
          >
            {messages.length === 0 && (
              <p className="text-sm text-muted">
                Try: <em>&ldquo;I&rsquo;m getting a 4xx error on Stripe when I try to capture a payment.&rdquo;</em>
              </p>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "rounded-lg px-4 py-3 text-sm leading-relaxed",
                  message.role === "user"
                    ? "ml-8 bg-accent/10 text-foreground"
                    : "mr-8 bg-background text-foreground",
                )}
              >
                {message.parts.map((part, i) =>
                  part.type === "text" ? (
                    <span
                      key={i}
                      className="whitespace-pre-wrap"
                    >
                      {part.text}
                    </span>
                  ) : null,
                )}
              </div>
            ))}

            {status === "submitted" && (
              <div className="mr-8 rounded-lg bg-background px-4 py-3 text-sm text-muted">
                Thinking...
              </div>
            )}

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
                Something went wrong. {error.message}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="mt-4 flex items-stretch gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                overLimit
                  ? "Session limit reached. Refresh to start over."
                  : "Describe your problem..."
              }
              disabled={status !== "ready" || overLimit}
              className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
            />
            {status === "streaming" || status === "submitted" ? (
              <button
                type="button"
                onClick={() => stop()}
                aria-label="Stop"
                className="inline-flex items-center justify-center rounded-lg border border-border px-3 py-2 text-sm text-muted transition-colors hover:border-accent hover:text-accent"
              >
                <Square className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!canSend}
                aria-label="Send"
                className="inline-flex items-center justify-center rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            )}
          </form>

          <p className="mt-2 text-xs text-muted">
            {rateRemaining} of {RATE_LIMIT_MAX} messages remaining this session.{" "}
            Powered by Claude Sonnet via Vercel AI Gateway. Conversations aren&rsquo;t stored.
          </p>
        </div>
      )}
    </section>
  );
}

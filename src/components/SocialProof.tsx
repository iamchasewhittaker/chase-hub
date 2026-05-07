import { quotes } from "@/lib/quotes";
import { Quote } from "lucide-react";

export function SocialProof() {
  return (
    <section className="bg-[#F1F5F9]">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted">
          What people say
        </h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {quotes.map((q) => (
            <div
              key={q.author}
              className="rounded-xl border border-border bg-surface p-6 shadow-sm"
            >
              <Quote className="mb-3 h-5 w-5 text-accent/40" />
              <p className="text-sm leading-relaxed text-foreground">
                &ldquo;{q.text}&rdquo;
              </p>
              <p className="mt-4 text-sm font-medium text-muted">
                {q.author}
                {q.role && (
                  <span className="font-normal"> &middot; {q.role}</span>
                )}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

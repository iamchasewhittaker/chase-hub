import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-24 sm:py-32">
      <div className="max-w-2xl">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Payments expert. Builder.
          <br />
          <span className="text-accent">Making the complex simple.</span>
        </h1>
        <p className="mt-6 text-lg leading-8 text-muted">
          6 years at Authorize.Net and CyberSource helping merchants go live.
          14 months building with AI. Now I make the invisible parts of payments
          visible.
        </p>
        <div className="mt-10 flex items-center gap-4">
          <Link
            href="/payments"
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
          >
            See how payments work
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

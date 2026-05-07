import { ExternalLink, Mail } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-8">
        <p className="text-sm text-muted">Chase Whittaker</p>
        <div className="flex items-center gap-5">
          <a
            href="https://github.com/iamchasewhittaker"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground"
          >
            GitHub
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <a
            href="https://linkedin.com/in/chasewhittaker"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground"
          >
            LinkedIn
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <a
            href="mailto:chase.t.whittaker@gmail.com"
            className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground"
          >
            <Mail className="h-4 w-4" />
            Email
          </a>
        </div>
      </div>
    </footer>
  );
}

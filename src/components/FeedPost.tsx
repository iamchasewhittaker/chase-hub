// Single feed post card. Matches portfolio card style (rounded-xl, border,
// shadow-sm) from the locked design system.

import { formatRelativeTime } from "@/lib/relative-time";
import { TAG_LABELS } from "@/lib/tag-categories";
import type { Post } from "@/lib/types";

export function FeedPost({ post }: { post: Post }) {
  return (
    <article className="rounded-xl border border-border bg-surface p-6 shadow-sm">
      <header className="flex items-center justify-between">
        <span className="inline-flex items-center rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
          {TAG_LABELS[post.topic]}
        </span>
        <time
          className="text-xs text-muted"
          dateTime={post.created_at}
          suppressHydrationWarning
        >
          {formatRelativeTime(post.created_at)}
        </time>
      </header>
      <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
        {post.content}
      </p>
    </article>
  );
}

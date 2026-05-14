"use client";

// DraftList — admin-only list of draft and recently-published posts.
// Click a draft to publish it; click a published post to delete (soft).
//
// Edit-in-place is handled by mounting <PostComposer editing={post}> at the
// parent. This list emits selection events; the parent decides what to do.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TAG_LABELS } from "@/lib/tag-categories";
import { formatRelativeTime } from "@/lib/relative-time";
import type { Post } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  posts: Post[];
  onEdit?: (post: Post) => void;
}

export function DraftList({ posts, onEdit }: Props) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  async function quickPublish(post: Post) {
    setBusyId(post.id);
    const res = await fetch(`/api/posts/${post.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "published" }),
    });
    setBusyId(null);
    if (res.ok) router.refresh();
  }

  async function softDelete(post: Post) {
    if (!confirm("Delete this post? It's a soft delete. You can restore it from the database.")) {
      return;
    }
    setBusyId(post.id);
    const res = await fetch(`/api/posts/${post.id}`, { method: "DELETE" });
    setBusyId(null);
    if (res.ok) router.refresh();
  }

  if (posts.length === 0) {
    return (
      <p className="text-sm text-muted">No posts yet. Write one above.</p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {posts.map((post) => {
        const isDraft = post.status === "draft";
        return (
          <li
            key={post.id}
            className={cn(
              "rounded-xl border p-4 shadow-sm",
              isDraft
                ? "border-amber-200 bg-amber-50/40"
                : "border-border bg-surface",
            )}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs">
                <span className="inline-flex items-center rounded-full bg-accent/10 px-2 py-0.5 font-medium text-accent">
                  {TAG_LABELS[post.topic]}
                </span>
                <span className="text-muted" suppressHydrationWarning>
                  {formatRelativeTime(post.updated_at)}
                </span>
                {isDraft && (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 font-medium uppercase tracking-wide text-amber-800">
                    draft
                  </span>
                )}
              </div>
            </div>
            <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-sm text-foreground">
              {post.content}
            </p>
            <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => onEdit?.(post)}
                disabled={busyId === post.id}
                className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted transition-colors hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-50"
              >
                Edit
              </button>
              {isDraft && (
                <button
                  type="button"
                  onClick={() => quickPublish(post)}
                  disabled={busyId === post.id}
                  className="rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {busyId === post.id ? "Publishing..." : "Publish"}
                </button>
              )}
              <button
                type="button"
                onClick={() => softDelete(post)}
                disabled={busyId === post.id}
                className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted transition-colors hover:border-red-300 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Delete
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

"use client";

// PostComposer — the only place Chase writes new posts or edits drafts.
// Wires up all the Phase 2 guardrails:
//   - 500-char soft target (counter shown, doesn't block)
//   - Editorial checks (money warn, name warn, blocked language hard block)
//   - Ratio nudge when publishing a personal post would push past target
//   - Save as draft / Publish split

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ALL_TAGS,
  RATIO_NUDGE_WINDOW,
  TAG_LABELS,
  isPersonal,
  type Tag,
} from "@/lib/tag-categories";
import { runEditorialChecks } from "@/lib/editorial-checks";
import { checkRatio } from "@/lib/ratio-check";
import type { Post } from "@/lib/types";
import { cn } from "@/lib/utils";

const SOFT_TARGET_CHARS = 500;

interface Props {
  // Recent post topics in chronological order (oldest first). Used by the
  // ratio nudge. Pass at least the last RATIO_NUDGE_WINDOW topics.
  recentTopics: Tag[];
  // Optional: if set, the composer edits an existing post instead of creating.
  editing?: Post;
  // Called after a successful save so the parent can refresh.
  onSaved?: () => void;
}

export function PostComposer({ recentTopics, editing, onSaved }: Props) {
  const router = useRouter();

  const [content, setContent] = useState(editing?.content ?? "");
  const [topic, setTopic] = useState<Tag>(editing?.topic ?? "payments");
  const [submitting, setSubmitting] = useState<"draft" | "publish" | null>(
    null,
  );
  const [serverError, setServerError] = useState<string | null>(null);
  const [dismissedNudge, setDismissedNudge] = useState(false);

  const editorialIssues = useMemo(() => runEditorialChecks(content), [content]);
  const hasBlock = editorialIssues.some((i) => i.severity === "block");

  const ratio = useMemo(
    () => checkRatio(recentTopics, topic),
    [recentTopics, topic],
  );

  const charCount = content.length;
  const overSoftTarget = charCount > SOFT_TARGET_CHARS;

  const showRatioNudge =
    !dismissedNudge && ratio.exceeds && isPersonal(topic) && !editing;

  function reset() {
    setContent("");
    setTopic("payments");
    setServerError(null);
    setDismissedNudge(false);
  }

  async function submit(targetStatus: "draft" | "published") {
    if (!content.trim()) return;
    if (hasBlock && targetStatus === "published") return;

    setSubmitting(targetStatus === "draft" ? "draft" : "publish");
    setServerError(null);

    const url = editing ? `/api/posts/${editing.id}` : "/api/posts";
    const method = editing ? "PATCH" : "POST";
    const body = JSON.stringify({ content, topic, status: targetStatus });

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body,
    });

    if (!res.ok) {
      const payload = (await res.json().catch(() => ({}))) as {
        error?: string;
      };
      setServerError(payload.error ?? "Something went wrong.");
      setSubmitting(null);
      return;
    }

    setSubmitting(null);
    if (!editing) reset();
    onSaved?.();
    router.refresh();
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
      <h2 className="text-sm font-semibold uppercase tracking-widest text-muted">
        {editing ? "Edit post" : "Write a post"}
      </h2>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's on your mind?"
        rows={5}
        className="mt-4 w-full resize-y rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
      />

      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <select
          value={topic}
          onChange={(e) => {
            setTopic(e.target.value as Tag);
            setDismissedNudge(false);
          }}
          className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-foreground focus:border-accent focus:outline-none"
        >
          {ALL_TAGS.map((t) => (
            <option key={t} value={t}>
              {TAG_LABELS[t]}
            </option>
          ))}
        </select>
        <span
          className={cn(
            "text-xs",
            overSoftTarget ? "text-amber-600" : "text-muted",
          )}
        >
          {charCount} / {SOFT_TARGET_CHARS}
        </span>
      </div>

      {editorialIssues.length > 0 && (
        <ul className="mt-3 flex flex-col gap-2">
          {editorialIssues.map((issue) => (
            <li
              key={issue.kind}
              className={cn(
                "rounded-lg border px-3 py-2 text-xs",
                issue.severity === "block"
                  ? "border-red-200 bg-red-50 text-red-800"
                  : "border-amber-200 bg-amber-50 text-amber-800",
              )}
            >
              <strong className="mr-1 uppercase tracking-wide">
                {issue.severity === "block" ? "Blocked" : "Heads up"}
              </strong>
              {issue.message}
              {issue.matches.length > 0 && (
                <span className="ml-2 opacity-70">
                  ({issue.matches.join(", ")})
                </span>
              )}
            </li>
          ))}
        </ul>
      )}

      {showRatioNudge && (
        <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          <p>
            <strong className="uppercase tracking-wide">Balance</strong>{" "}
            {ratio.hypotheticalPersonalCount} of your last{" "}
            {ratio.hypotheticalWindowSize} posts would be personal after this.
            Want to draft a payments / ai / product / sales one first?
          </p>
          <button
            type="button"
            onClick={() => setDismissedNudge(true)}
            className="mt-2 text-xs underline opacity-80 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {serverError && (
        <p className="mt-3 text-xs text-red-600" role="alert">
          {serverError}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-end gap-3">
        {!editing && (
          <button
            type="button"
            disabled={!content.trim() || submitting !== null}
            onClick={() => submit("draft")}
            className="rounded-lg border border-border px-3 py-2 text-sm text-muted transition-colors hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting === "draft" ? "Saving..." : "Save as draft"}
          </button>
        )}
        <button
          type="button"
          disabled={
            !content.trim() || hasBlock || submitting !== null
          }
          onClick={() => submit("published")}
          className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting === "publish"
            ? editing
              ? "Saving..."
              : "Publishing..."
            : editing
              ? "Save changes"
              : "Publish"}
        </button>
      </div>

      {/* Footnote so Chase knows the window the nudge looks at. */}
      {!editing && (
        <p className="mt-3 text-[11px] text-muted">
          Nudge looks at your last {RATIO_NUDGE_WINDOW} published posts.
        </p>
      )}
    </div>
  );
}

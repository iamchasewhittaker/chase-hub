// Admin dashboard widget showing the last-30-day professional/personal ratio.
// Quiet awareness, no nag. Renders amber if the personal share exceeds the
// target (default 30%).

import { cn } from "@/lib/utils";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import {
  PERSONAL_TAGS,
  TARGET_PERSONAL_RATIO,
  isPersonal,
  type Tag,
} from "@/lib/tag-categories";

export async function BalanceWidget() {
  const supabase = await createSupabaseServerClient();
  const thirtyDaysAgo = new Date(
    Date.now() - 30 * 24 * 60 * 60 * 1000,
  ).toISOString();

  const { data, error } = await supabase
    .from("chase_hub_posts")
    .select("topic")
    .eq("status", "published")
    .gte("created_at", thirtyDaysAgo);

  if (error) {
    return (
      <div className="rounded-xl border border-border bg-surface p-4 text-sm text-muted">
        Couldn&apos;t load balance ({error.message}).
      </div>
    );
  }

  const total = data?.length ?? 0;
  if (total === 0) {
    return (
      <div className="rounded-xl border border-border bg-surface p-4 text-sm text-muted">
        Last 30 days: no published posts yet.
      </div>
    );
  }

  const personal = data.filter((row) => isPersonal(row.topic as Tag)).length;
  const professional = total - personal;
  const personalRatio = personal / total;
  const overTarget = personalRatio > TARGET_PERSONAL_RATIO;

  // Format ratio as N/N (professional / personal share).
  const proPct = Math.round((professional / total) * 100);
  const personalPct = 100 - proPct;

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-widest text-muted">
          Last 30 days
        </p>
        <span
          className={cn(
            "text-xs font-medium",
            overTarget ? "text-amber-600" : "text-success",
          )}
        >
          {proPct}/{personalPct} {overTarget ? "" : "✓"}
        </span>
      </div>
      <div className="mt-2 flex items-baseline gap-3 text-sm text-foreground">
        <span>
          <strong>{professional}</strong> professional
        </span>
        <span className="text-muted">&middot;</span>
        <span>
          <strong>{personal}</strong> personal
        </span>
      </div>
      {overTarget && (
        <p className="mt-2 text-xs text-muted">
          Target is {Math.round(TARGET_PERSONAL_RATIO * 100)}% personal max. Lean
          back toward {PERSONAL_TAGS.length === 2 ? "payments / ai / product / sales" : "professional"}
          .
        </p>
      )}
    </div>
  );
}

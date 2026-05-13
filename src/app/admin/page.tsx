// Admin page — Chase only. proxy.ts redirects non-admins to /login.
//
// Server component fetches:
//   - drafts (status='draft')
//   - last 10 published topics (for the ratio nudge)
//   - last 10 published posts in full (for the editable list)
//   - last 30d publish counts (rendered by BalanceWidget)
//
// Then hands the data to a client wrapper that owns the editing state.

import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { Post } from "@/lib/types";
import type { Tag } from "@/lib/tag-categories";
import { BalanceWidget } from "@/components/BalanceWidget";
import { AdminClient } from "./AdminClient";
import { SignOutButton } from "./SignOutButton";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const supabase = await createSupabaseServerClient();

  const [draftsRes, publishedRes] = await Promise.all([
    supabase
      .from("chase_hub_posts")
      .select("*")
      .eq("status", "draft")
      .order("updated_at", { ascending: false }),
    supabase
      .from("chase_hub_posts")
      .select("*")
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const drafts = (draftsRes.data ?? []) as Post[];
  const recentPublished = (publishedRes.data ?? []) as Post[];

  // Topics for the ratio nudge: chronological (oldest first) of last 10 published.
  const recentTopics: Tag[] = recentPublished
    .map((p) => p.topic)
    .reverse();

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Admin</h1>
          <p className="mt-1 text-sm text-muted">
            Write, edit, and manage the feed.
          </p>
        </div>
        <SignOutButton />
      </header>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <BalanceWidget />
        <div className="rounded-xl border border-border bg-surface p-4 text-sm text-muted">
          {drafts.length === 0
            ? "No drafts."
            : `${drafts.length} draft${drafts.length === 1 ? "" : "s"} waiting.`}
        </div>
      </div>

      <div className="mt-8">
        <AdminClient
          drafts={drafts}
          recentPublished={recentPublished}
          recentTopics={recentTopics}
        />
      </div>
    </div>
  );
}

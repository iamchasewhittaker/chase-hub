// Homepage feed — server component. Fetches latest 5 published posts.
// Renders nothing if the feed is empty (Phase 2 ships with zero posts —
// Chase fills it). Matches the section pattern used elsewhere on the homepage.

import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { Post } from "@/lib/types";
import { FeedPost } from "./FeedPost";

export async function FeedSection() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("chase_hub_posts")
    .select("*")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(5);

  // If Supabase errored or there are no posts, render nothing. The section
  // simply doesn't exist until Chase has published something.
  if (error || !data || data.length === 0) {
    return null;
  }

  const posts = data as Post[];

  return (
    <section className="bg-background">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted">
          Recent posts
        </h2>
        <div className="mt-8 flex flex-col gap-4">
          {posts.map((post) => (
            <FeedPost key={post.id} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
}

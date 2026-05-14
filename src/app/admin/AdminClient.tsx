"use client";

// Client wrapper for the admin page. Owns the "currently editing" state so
// the composer and list can swap modes (new post vs edit) without a page nav.

import { useState } from "react";
import { PostComposer } from "@/components/PostComposer";
import { DraftList } from "@/components/DraftList";
import type { Post } from "@/lib/types";
import type { Tag } from "@/lib/tag-categories";

interface Props {
  drafts: Post[];
  recentPublished: Post[];
  recentTopics: Tag[];
}

export function AdminClient({ drafts, recentPublished, recentTopics }: Props) {
  const [editing, setEditing] = useState<Post | null>(null);

  return (
    <>
      <PostComposer
        recentTopics={recentTopics}
        editing={editing ?? undefined}
        onSaved={() => setEditing(null)}
      />

      {editing && (
        <button
          type="button"
          onClick={() => setEditing(null)}
          className="mt-2 text-xs text-muted underline hover:text-foreground"
        >
          Cancel edit. Start a new post instead.
        </button>
      )}

      {drafts.length > 0 && (
        <section className="mt-10">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted">
            Drafts
          </h2>
          <div className="mt-4">
            <DraftList posts={drafts} onEdit={(p) => setEditing(p)} />
          </div>
        </section>
      )}

      {recentPublished.length > 0 && (
        <section className="mt-10">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted">
            Recent published
          </h2>
          <div className="mt-4">
            <DraftList posts={recentPublished} onEdit={(p) => setEditing(p)} />
          </div>
        </section>
      )}
    </>
  );
}

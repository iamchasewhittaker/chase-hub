// PATCH  /api/posts/[id]  — admin only, edit content / topic / status
// DELETE /api/posts/[id]  — admin only, soft delete (sets status='deleted')

import { NextResponse, type NextRequest } from "next/server";
import {
  createSupabaseServerClient,
  getChaseEmailFromSession,
  isAdmin,
} from "@/lib/supabase-server";
import { ALL_TAGS, type Tag } from "@/lib/tag-categories";
import type { PostStatus } from "@/lib/types";

// Next.js 16: dynamic route params are async.
export async function PATCH(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const email = await getChaseEmailFromSession();
  if (!isAdmin(email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const patch = validatePatch(body);
  if ("error" in patch) {
    return NextResponse.json({ error: patch.error }, { status: 400 });
  }
  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("chase_hub_posts")
    .update(patch)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ post: data });
}

export async function DELETE(
  _request: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const email = await getChaseEmailFromSession();
  if (!isAdmin(email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Soft delete — the row stays for recovery, but it's hidden from public reads.
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("chase_hub_posts")
    .update({ status: "deleted" as PostStatus })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

// ── helpers ─────────────────────────────────────────────────────────────────

function validatePatch(
  body: unknown,
):
  | { content?: string; topic?: Tag; status?: PostStatus }
  | { error: string } {
  if (!body || typeof body !== "object") {
    return { error: "Body must be a JSON object" };
  }
  const obj = body as Record<string, unknown>;
  const patch: { content?: string; topic?: Tag; status?: PostStatus } = {};

  if (obj.content !== undefined) {
    if (typeof obj.content !== "string" || obj.content.trim().length === 0) {
      return { error: "content must be a non-empty string" };
    }
    if (obj.content.length > 5000) {
      return { error: "content exceeds 5000 char hard cap" };
    }
    patch.content = obj.content.trim();
  }

  if (obj.topic !== undefined) {
    if (typeof obj.topic !== "string" || !ALL_TAGS.includes(obj.topic as Tag)) {
      return { error: `topic must be one of: ${ALL_TAGS.join(", ")}` };
    }
    patch.topic = obj.topic as Tag;
  }

  if (obj.status !== undefined) {
    if (
      obj.status !== "draft" &&
      obj.status !== "published" &&
      obj.status !== "deleted"
    ) {
      return { error: "status must be draft, published, or deleted" };
    }
    patch.status = obj.status;
  }

  return patch;
}

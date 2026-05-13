// GET  /api/posts            — public, latest 5 published (or more via ?limit)
// GET  /api/posts?status=draft  — admin only, drafts
// GET  /api/posts?recent=true   — admin only, latest 30 (used by BalanceWidget)
// POST /api/posts            — admin only, create draft or published

import { NextResponse, type NextRequest } from "next/server";
import {
  createSupabaseServerClient,
  getChaseEmailFromSession,
  isAdmin,
} from "@/lib/supabase-server";
import { ALL_TAGS, type Tag } from "@/lib/tag-categories";
import type { PostStatus } from "@/lib/types";

const DEFAULT_LIMIT = 5;
const MAX_LIMIT = 100;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const statusParam = searchParams.get("status");
  const recentFlag = searchParams.get("recent") === "true";
  const limitParam = searchParams.get("limit");

  const supabase = await createSupabaseServerClient();

  // Non-published requests require admin.
  const wantsNonPublic = statusParam && statusParam !== "published";
  if (wantsNonPublic || recentFlag) {
    const email = await getChaseEmailFromSession();
    if (!isAdmin(email)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  let query = supabase.from("chase_hub_posts").select("*");

  if (recentFlag) {
    // Last 30 days for the BalanceWidget.
    const thirtyDaysAgo = new Date(
      Date.now() - 30 * 24 * 60 * 60 * 1000,
    ).toISOString();
    query = query
      .eq("status", "published")
      .gte("created_at", thirtyDaysAgo)
      .order("created_at", { ascending: false });
  } else {
    const status: PostStatus = (statusParam as PostStatus) || "published";
    const limit = clampLimit(limitParam);
    query = query
      .eq("status", status)
      .order("created_at", { ascending: false })
      .limit(limit);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ posts: data });
}

export async function POST(request: NextRequest) {
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

  const validation = validatePostBody(body);
  if ("error" in validation) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("chase_hub_posts")
    .insert({
      content: validation.content,
      topic: validation.topic,
      status: validation.status,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ post: data }, { status: 201 });
}

// ── helpers ─────────────────────────────────────────────────────────────────

function clampLimit(raw: string | null): number {
  if (!raw) return DEFAULT_LIMIT;
  const parsed = Number.parseInt(raw, 10);
  if (Number.isNaN(parsed) || parsed < 1) return DEFAULT_LIMIT;
  return Math.min(parsed, MAX_LIMIT);
}

function validatePostBody(
  body: unknown,
): { content: string; topic: Tag; status: PostStatus } | { error: string } {
  if (!body || typeof body !== "object") {
    return { error: "Body must be a JSON object" };
  }
  const obj = body as Record<string, unknown>;

  if (typeof obj.content !== "string" || obj.content.trim().length === 0) {
    return { error: "content is required" };
  }
  if (obj.content.length > 5000) {
    return { error: "content exceeds 5000 char hard cap" };
  }
  if (typeof obj.topic !== "string" || !ALL_TAGS.includes(obj.topic as Tag)) {
    return { error: `topic must be one of: ${ALL_TAGS.join(", ")}` };
  }
  const status: PostStatus =
    obj.status === "draft" ? "draft" : "published";

  return { content: obj.content.trim(), topic: obj.topic as Tag, status };
}

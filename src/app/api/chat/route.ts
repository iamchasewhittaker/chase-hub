// Streaming endpoint for the AI Integration Troubleshooter on /payments.
//
// Uses Vercel AI Gateway with Claude Sonnet 4.6. On Vercel deployments,
// auth is automatic via OIDC. Locally, set AI_GATEWAY_API_KEY in .env.local.
//
// System prompt lives in src/lib/troubleshooter-prompt.ts (where Chase writes).

import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { TROUBLESHOOTER_SYSTEM_PROMPT } from "@/lib/troubleshooter-prompt";

// Sonnet 4.6 was the newest Sonnet at build time (2026-05-13).
// To upgrade, re-fetch model IDs:
//   curl -s https://ai-gateway.vercel.sh/v1/models | python3 -c "..."
const MODEL = "anthropic/claude-sonnet-4.6";

// Allow streams up to 60s. Plenty for chat; Anthropic typically responds
// in 2–10s even on long answers.
export const maxDuration = 60;

// Defense-in-depth cap on server side. The client also limits to 20 messages
// per session via localStorage, but a determined user could bypass that. This
// stops a runaway conversation from spending unbounded credits.
const MAX_MESSAGES_PER_REQUEST = 40;

export async function POST(req: Request) {
  let body: { messages?: UIMessage[] };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const messages = body.messages ?? [];
  if (messages.length === 0) {
    return new Response(JSON.stringify({ error: "No messages provided" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  if (messages.length > MAX_MESSAGES_PER_REQUEST) {
    return new Response(
      JSON.stringify({
        error: `Conversation exceeded ${MAX_MESSAGES_PER_REQUEST} messages. Refresh to start over.`,
      }),
      { status: 429, headers: { "Content-Type": "application/json" } },
    );
  }

  const result = streamText({
    model: MODEL,
    system: TROUBLESHOOTER_SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}

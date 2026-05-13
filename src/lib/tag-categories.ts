// Tag taxonomy for the feed.
// Decisions locked 2026-05-13 via interview (see HANDOFF.md).
// Professional and personal lanes drive the 70/30 ratio guardrail.

export const PROFESSIONAL_TAGS = ["payments", "ai", "product", "sales"] as const;
export const PERSONAL_TAGS = ["career", "life"] as const;

export const ALL_TAGS = [...PROFESSIONAL_TAGS, ...PERSONAL_TAGS] as const;

export type ProfessionalTag = (typeof PROFESSIONAL_TAGS)[number];
export type PersonalTag = (typeof PERSONAL_TAGS)[number];
export type Tag = (typeof ALL_TAGS)[number];

// Display labels for the topic pill — kept lowercase, matches the editorial tone.
export const TAG_LABELS: Record<Tag, string> = {
  payments: "payments",
  ai: "ai",
  product: "product",
  sales: "sales",
  career: "career",
  life: "life",
};

// Max share of personal posts in the recent feed before the soft nudge triggers.
// 30% = ~3 personal in last 10, ~9 personal in last 30.
export const TARGET_PERSONAL_RATIO = 0.3;

// Window the soft nudge looks at when deciding whether to warn.
// (BalanceWidget uses 30 days; nudge uses last 10 posts. See ratio-check.ts.)
export const RATIO_NUDGE_WINDOW = 10;

export function isPersonal(tag: Tag): boolean {
  return (PERSONAL_TAGS as readonly string[]).includes(tag);
}

export function isProfessional(tag: Tag): boolean {
  return (PROFESSIONAL_TAGS as readonly string[]).includes(tag);
}

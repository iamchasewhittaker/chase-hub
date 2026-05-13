// Client-side editorial guards run by PostComposer before publish.
// Pure functions, return either null (clean) or an EditorialIssue.
//
// Two severities:
//   - "warn": soft, dismissible. User can publish anyway.
//   - "block": hard, must edit text to proceed.

import { PROFANITY, SENSITIVE_TERMS } from "./sensitive-names";

export type Severity = "warn" | "block";

export interface EditorialIssue {
  severity: Severity;
  // Short label shown next to the warning (e.g., "money", "name", "language").
  kind: string;
  // Human-readable description shown to the user.
  message: string;
  // The matched substring(s) that triggered the issue — useful for highlighting.
  matches: string[];
}

// ── money / salary / specific-dollar warnings ────────────────────────────────
// Triggers on: "$1,000", "$45", "45k", "$2.5M", "salary", or "$NUMBER".
// Doesn't trigger on plain numbers like "10 things" — only the money signal.
const MONEY_REGEXES = [
  /\$\s?[\d,]+(?:\.\d+)?\s?[kKmMbB]?/g,
  /\b\d{1,3}[kK]\b/g,
  /\bsalary\b/gi,
  /\bcompensation\b/gi,
];

export function checkMoney(text: string): EditorialIssue | null {
  const matches = new Set<string>();
  for (const re of MONEY_REGEXES) {
    for (const m of text.matchAll(re)) matches.add(m[0]);
  }
  if (matches.size === 0) return null;
  return {
    severity: "warn",
    kind: "money",
    message:
      "This mentions money, salary, or specific dollar amounts. Sure you want to publish that?",
    matches: [...matches],
  };
}

// ── full name warnings ───────────────────────────────────────────────────────
// "Capitalized Capitalized" pattern. False positives are real (e.g., "New
// York", "Square Inc"), so this is a warn and dismissible.
//
// We strip out a small allowlist of compound proper-noun phrases that look
// like names but aren't.
const NAME_REGEX = /\b[A-Z][a-z]+\s+[A-Z][a-z]+\b/g;
const NAME_ALLOWLIST = new Set([
  "New York",
  "Los Angeles",
  "San Francisco",
  "Salt Lake",
  "Square Inc",
  "Stripe Inc",
  "Apple Pay",
  "Google Pay",
  "United States",
  "South America",
  "North America",
  "Authorize Net",
  "Card Network",
  "Issuing Bank",
  "Payment Gateway",
]);

export function checkName(text: string): EditorialIssue | null {
  const matches = new Set<string>();
  for (const m of text.matchAll(NAME_REGEX)) {
    if (!NAME_ALLOWLIST.has(m[0])) matches.add(m[0]);
  }
  if (matches.size === 0) return null;
  return {
    severity: "warn",
    kind: "name",
    message:
      "This looks like a person's full name. Make sure you're okay naming them publicly.",
    matches: [...matches],
  };
}

// ── hard blocks: sensitive substrings + profanity ────────────────────────────
// Case-insensitive substring match for SENSITIVE_TERMS.
// Word-boundary match for PROFANITY (catches "fucking" too).
export function checkBlocked(text: string): EditorialIssue | null {
  const lower = text.toLowerCase();
  const matches = new Set<string>();

  for (const term of SENSITIVE_TERMS) {
    if (lower.includes(term.toLowerCase())) matches.add(term);
  }

  for (const word of PROFANITY) {
    const re = new RegExp(`\\b${word}\\w*\\b`, "i");
    const m = lower.match(re);
    if (m) matches.add(m[0]);
  }

  if (matches.size === 0) return null;
  return {
    severity: "block",
    kind: "language",
    message: "This contains language or names that can't be published.",
    matches: [...matches],
  };
}

// Convenience: run all three checks, return the issues that fired.
// Caller decides how to render. If any block-severity issue exists,
// the composer must disable Publish.
export function runEditorialChecks(text: string): EditorialIssue[] {
  return [checkMoney(text), checkName(text), checkBlocked(text)].filter(
    (i): i is EditorialIssue => i !== null,
  );
}

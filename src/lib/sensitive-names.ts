// Words / phrases that will HARD BLOCK a post from publishing.
// Lowercase, case-insensitive substring match.
//
// Add entries here as you remember real names / clients / projects you don't
// want to mention publicly. The file is intentionally tiny — start with
// nothing, grow over time.
//
// Profanity and slurs live alongside named entities here because the goal is
// the same: this list prevents accidental publishing.

export const SENSITIVE_TERMS: readonly string[] = [
  // Add real names, client names, internal project names, etc. here.
  // Example: "acme corp", "internal project x"
];

// Common English profanity. Kept short and obvious — not exhaustive.
// Lowercase. Word-ish boundary, not substring (handled in editorial-checks).
export const PROFANITY: readonly string[] = [
  "fuck",
  "shit",
  "bitch",
  "asshole",
];

// "2 hours ago" / "3 days ago" formatter for feed post timestamps.
// Switches to absolute date ("May 13, 2026") after 7 days.

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;

const ABSOLUTE_FMT = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
});

export function formatRelativeTime(date: Date | string, now: Date = new Date()): string {
  const then = typeof date === "string" ? new Date(date) : date;
  const diffMs = now.getTime() - then.getTime();

  // Future dates (clock skew) → "just now"
  if (diffMs < 0) return "just now";

  if (diffMs < MINUTE) return "just now";

  if (diffMs < HOUR) {
    const minutes = Math.floor(diffMs / MINUTE);
    return `${minutes} ${plural(minutes, "minute")} ago`;
  }

  if (diffMs < DAY) {
    const hours = Math.floor(diffMs / HOUR);
    return `${hours} ${plural(hours, "hour")} ago`;
  }

  if (diffMs < WEEK) {
    const days = Math.floor(diffMs / DAY);
    return `${days} ${plural(days, "day")} ago`;
  }

  // After 7 days, switch to absolute format.
  return ABSOLUTE_FMT.format(then);
}

function plural(n: number, word: string): string {
  return n === 1 ? word : `${word}s`;
}

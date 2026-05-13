// Soft nudge logic for the professional/personal post ratio.
// Pure functions, no DB — caller hands in the recent posts.

import {
  RATIO_NUDGE_WINDOW,
  TARGET_PERSONAL_RATIO,
  isPersonal,
  type Tag,
} from "./tag-categories";

export interface RatioCheck {
  // Whether publishing a post with `incomingTopic` would push the rolling
  // window above the personal-share threshold.
  exceeds: boolean;
  // Hypothetical personal-post count after publishing.
  hypotheticalPersonalCount: number;
  // Hypothetical window size after publishing (clamped to RATIO_NUDGE_WINDOW).
  hypotheticalWindowSize: number;
  // Whether we had enough recent posts to make a meaningful judgment.
  // If false, callers should NOT show the nudge.
  hasEnoughData: boolean;
}

// Minimum number of recent posts before we trust the ratio.
// Below this, one personal post out of 2 is "50% personal" but means nothing.
const MIN_POSTS_FOR_NUDGE = 5;

export function checkRatio(
  recentTopics: readonly Tag[],
  incomingTopic: Tag,
): RatioCheck {
  // Look at the most recent N posts (already in chronological order, newest last).
  const window = recentTopics.slice(-RATIO_NUDGE_WINDOW);

  const personalInWindow = window.filter(isPersonal).length;
  const incomingIsPersonal = isPersonal(incomingTopic);

  const hypotheticalPersonalCount =
    personalInWindow + (incomingIsPersonal ? 1 : 0);
  // The window won't grow beyond RATIO_NUDGE_WINDOW — adding the new post
  // bumps out the oldest in steady state.
  const hypotheticalWindowSize = Math.min(
    window.length + 1,
    RATIO_NUDGE_WINDOW,
  );

  const hasEnoughData = window.length >= MIN_POSTS_FOR_NUDGE;

  const exceeds =
    hasEnoughData &&
    incomingIsPersonal &&
    hypotheticalPersonalCount / hypotheticalWindowSize > TARGET_PERSONAL_RATIO;

  return {
    exceeds,
    hypotheticalPersonalCount,
    hypotheticalWindowSize,
    hasEnoughData,
  };
}

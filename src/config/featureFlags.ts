/**
 * Menu visibility for features that are built but not ready to show.
 * Set a flag to true to bring its entry back in the Trade menu (desktop and mobile).
 * The pages themselves are untouched, they just have no menu entry while hidden.
 */
export const FEATURE_FLAGS = {
  portfolioTracker: true,
  expertAdvisors: true,
  priceAlerts: true,
  aiCompanion: true,
} as const;

/**
 * Points, Syde Credits and levels: the numbers, in one place.
 *
 * Taken from "MarketSyde: Points, Credits and Levels (Final Beta Version)",
 * 20 Oct 2026. Every value here is a proposed beta setting that Admin can
 * change, so nothing downstream should hard-code a copy of it.
 */

/** Active Points, meaning Points earned in the last 90 days, open each level. */
export const LEVEL_STARTS = [0, 100, 300, 500] as const;

export const LEVEL_NAMES = ['Rookie', 'Climber', 'Player', 'Boss'] as const;

/** Share of the broker's commission returned at each level. Estimates. */
export const CASHBACK_SHARE = [0.1, 0.12, 0.14, 0.16] as const;

/** What a member pays for a temporary unlock, as a share of the price. */
export const UNLOCK_DISCOUNT = [1, 0.8, 0.5, 0] as const;

/** Length of an unlock, as a share of the daily price. */
export const UNLOCK_LENGTH = {
  oneUse: 0.25,
  oneHour: 0.4,
  oneDay: 1,
  sevenDays: 4.5,
} as const;

/** Unlock prices round to this many Credits. */
export const UNLOCK_ROUNDING = 5;

/**
 * How many levels above their own a member may unlock.
 *
 * v2.7 opened this up: any locked feature can be bought with Credits from LV1,
 * so a Rookie can reach an Elite tool. Three is the whole ladder, which means
 * the rule no longer refuses anything and the price is what limits reach.
 */
export const UNLOCK_LEVELS_ABOVE = 3;

/** The yardstick: neither currency can be cashed out. */
export const USD_PER_POINT = 1;
export const CREDITS_PER_USD = 100;

/** Conversion, one way only: Points never turn back into Credits. */
export const CREDITS_PER_POINT = 100;
export const CONVERSION_CAP_POINTS = 10;
export const CONVERSION_WINDOW_DAYS = 30;

/** How long each Point and each Credit lasts, from the day it was earned. */
export const POINT_LIFE_DAYS = 90;
export const CREDIT_LIFE_DAYS = 180;
export const POINT_REMINDER_DAYS = [14, 3] as const;
export const CREDIT_REMINDER_DAYS = [30, 7] as const;

/** $1 of Point Value is one Base Point, whatever the market. */
export const PV_PER_POINT = 1;

/** A D6 milestone pays Points rather than Credits. */
export const MILESTONE_POINTS = 10;

/** Boosts multiply Points, never Credits, and together cannot exceed the cap. */
export const BOOSTS = {
  partner: [1, 1.5],
  campaign: [1, 2],
  consistency: [1, 1.2],
  combinedCap: [2, 2.5],
} as const;

/**
 * Caps on Credits from platform activity, as the hybrid rule of v2.8 sets them.
 *
 * Every mission belongs to a cap group. Group 1 is what a member can do alone
 * and repeat, and it is the one held to a hundred a day; the sixty social
 * Credits sit inside that hundred rather than beside it. The weekly twelve
 * hundred is a safety net for bugs and rings that slip past the others, not a
 * budget anyone is meant to reach.
 */
export const CREDIT_CAPS = {
  perTask: 200,
  /** Group 1: actions a member can do alone and repeat. */
  farmablePerDay: 100,
  /** Social actions, counted inside the farmable daily cap. */
  socialPerDay: 60,
  /** Catches what the other caps miss. All activity Credits. */
  safetyPerWeek: 1200,
  /** Group 3: broker-confirmed rewards, all of them together. */
  revenueLinkedPerMonth: 1500,
} as const;

/** First use of a feature or tool pays only so many times per member. */
export const FIRST_USE_REWARD_LIMIT = 10;

/** One-off and referral rewards are held before they count. */
export const REWARD_HOLDING_DAYS = 14;

/**
 * Which cap a mission answers to.
 *
 * 1: farmable, repeatable actions. 2: one-off or verified work outside the
 * daily cap. 3: revenue-linked, confirmed by a broker.
 */
export type CapGroup = 1 | 2 | 3;

/** Repeating the same task pays less each time. */
export const REPEAT_DECAY = [1, 0.5, 0.25, 0] as const;

/** The signal confidence each level may see. */
export const SIGNAL_CONFIDENCE_CAP = [0.75, 0.79, 0.89, 1] as const;

/** The level a member's Active Points put them in, counting from 1. */
export function levelForPoints(activePoints: number): 1 | 2 | 3 | 4 {
  if (activePoints >= LEVEL_STARTS[3]) return 4;
  if (activePoints >= LEVEL_STARTS[2]) return 3;
  if (activePoints >= LEVEL_STARTS[1]) return 2;
  return 1;
}

/**
 * What a temporary unlock costs this member.
 *
 * Daily price times the length, times the member's share, rounded to the
 * nearest five Credits, as the doc's own examples round.
 */
export function unlockPrice(dailyPrice: number, length: keyof typeof UNLOCK_LENGTH, level: number): number {
  const share = UNLOCK_DISCOUNT[Math.min(Math.max(level, 1), 4) - 1];
  const raw = dailyPrice * UNLOCK_LENGTH[length] * share;
  return Math.round(raw / UNLOCK_ROUNDING) * UNLOCK_ROUNDING;
}

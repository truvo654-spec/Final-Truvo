import {
  BOOSTS,
  CASHBACK_SHARE,
  CONVERSION_CAP_POINTS,
  CREDITS_PER_POINT,
  LEVEL_NAMES,
  LEVEL_STARTS,
  POINT_LIFE_DAYS,
  PV_PER_POINT,
  levelForPoints,
} from './rewardRules';

/**
 * The workbook's calculator, as functions.
 *
 * The Calculator sheet shows one worked example end to end: a trade becomes
 * Point Value, Point Value becomes Base Points, boosts multiply them under a
 * cap, conversion adds a little, expiry takes some away, and what is left sets
 * the level and the cashback rate. Having it here means a screen can show the
 * same arithmetic the spec does rather than approximating it.
 */

export interface TradePointsInput {
  /** The trade expressed as one fair dollar figure. */
  pointValue: number;
  partnerBoost?: number;
  campaignBoost?: number;
  consistencyBoost?: number;
  /** The cap in force; the workbook's example uses the low end. */
  boostCap?: number;
}

export interface TradePointsResult {
  basePoints: number;
  /** What the boosts came to before the cap. */
  rawMultiplier: number;
  /** What was actually applied. */
  multiplier: number;
  capped: boolean;
  total: number;
  /** The part of the total that came from boosts, shown separately. */
  fromBoost: number;
}

/** Points for one trade, with its boosts and the cap. */
export function pointsFromTrade(input: TradePointsInput): TradePointsResult {
  const basePoints = Math.round(input.pointValue / PV_PER_POINT);
  const rawMultiplier = (input.partnerBoost ?? 1) * (input.campaignBoost ?? 1) * (input.consistencyBoost ?? 1);
  const cap = input.boostCap ?? BOOSTS.combinedCap[0];
  const multiplier = Math.min(rawMultiplier, cap);
  const total = Math.round(basePoints * multiplier);
  return {
    basePoints,
    rawMultiplier: Math.round(rawMultiplier * 100) / 100,
    multiplier: Math.round(multiplier * 100) / 100,
    capped: rawMultiplier > cap,
    total,
    fromBoost: total - basePoints,
  };
}

export interface ConversionResult {
  /** Points the member actually receives. */
  points: number;
  /** Credits taken, which is Points times the rate and nothing more. */
  creditsSpent: number;
  /** Credits left in hand because they did not make a whole Point. */
  creditsLeft: number;
  /** Converted Points still allowed in this window afterwards. */
  windowLeft: number;
}

/**
 * Converting Credits into Points.
 *
 * Two things the workbook is firm about: only whole Points are given, and only
 * what they cost is taken, so 250 Credits buys two Points for 200 and the
 * remaining 50 stay where they are.
 */
export function convertCredits(credits: number, alreadyConvertedThisWindow = 0): ConversionResult {
  const room = Math.max(0, CONVERSION_CAP_POINTS - alreadyConvertedThisWindow);
  const points = Math.min(Math.floor(credits / CREDITS_PER_POINT), room);
  const creditsSpent = points * CREDITS_PER_POINT;
  return {
    points,
    creditsSpent,
    creditsLeft: credits - creditsSpent,
    windowLeft: room - points,
  };
}

export interface LevelResult {
  activePoints: number;
  level: 1 | 2 | 3 | 4;
  levelName: string;
  /** Points needed for the next level, or null at the top. */
  toNextLevel: number | null;
  /** Share of the broker's commission at this level. */
  cashbackShare: number;
}

/** Where a member stands once the new Points are in and the old ones have gone. */
export function levelAfter(args: {
  activePointsBefore: number;
  pointsEarned: number;
  pointsExpiring: number;
}): LevelResult {
  const activePoints = Math.max(0, args.activePointsBefore + args.pointsEarned - args.pointsExpiring);
  const level = levelForPoints(activePoints);
  // At the top level there is no next start to reach.
  const starts: readonly number[] = LEVEL_STARTS;
  const nextStart: number | undefined = starts[level];
  return {
    activePoints,
    level,
    levelName: LEVEL_NAMES[level - 1],
    toNextLevel: nextStart === undefined ? null : Math.max(0, nextStart - activePoints),
    cashbackShare: CASHBACK_SHARE[level - 1],
  };
}

/** What the member gets back from a broker's commission at their level. */
export function cashbackFor(commission: number, level: number): number {
  const share = CASHBACK_SHARE[Math.min(Math.max(level, 1), 4) - 1];
  return Math.round(commission * share * 100) / 100;
}

/** The day a Point earned now stops counting towards the level. */
export function pointExpiresOn(earnedAt = new Date()): Date {
  const out = new Date(earnedAt);
  out.setDate(out.getDate() + POINT_LIFE_DAYS);
  return out;
}

import type { Broker, MarketSignal, UserProfile } from '../../types';
import { AI_POLICY, addBasicUse, basicUsedToday, grantDayPass as grantPass, hasDayPass as dayPassActive } from './aiEntitlement';

/**
 * How much of the AI Companion each level gets, and what a day of the rest
 * costs in credits.
 *
 * The shape follows the instrument analysis tools: a level opens it for free,
 * and anyone below that level can buy a day of it with credits rather than
 * waiting. The cost falls as the level rises, for the same reason it does
 * there — somebody close to the level should not pay the full price.
 */

export interface AiAllowance {
  /** Basic asks included each day at this level. Infinity at the top tier, 0 when locked. */
  perDay: number;
  /** The level that lifts the limit for good. */
  freeAtLevel: number;
  /** Credits for a day without the limit, at this person's level. */
  dayPrice: number;
}

const BASE_DAY_PRICE = 60;

/**
 * Basic allowance per level. The numbers live in `AI_POLICY` (aiEntitlement.ts)
 * so every AI screen reads the same table: LV1 0 (locked), LV2 10, LV3 20, LV4 unlimited.
 */
export function aiAllowance(tierLevel: number): AiAllowance {
  const lv = Math.min(4, Math.max(1, tierLevel || 1));
  const perDay = AI_POLICY.basicPerDay[lv];
  const discount = tierLevel >= 4 ? 0 : tierLevel === 3 ? 0.5 : tierLevel === 2 ? 0.8 : 1;
  return { perDay, freeAtLevel: 4, dayPrice: Math.round(BASE_DAY_PRICE * discount) };
}

/** How many Basic asks have been completed today (the day turns at 00:00 UTC). */
export function asksUsedToday(): number {
  return basicUsedToday();
}

/** Counts one completed Basic ask. */
export function recordAsk() {
  addBasicUse();
}

/** Whether a day without the limit has been bought and is still running. */
export function hasDayPass(): boolean {
  return dayPassActive();
}

export function grantDayPass() {
  grantPass();
}

/** What is left today: null means there is no limit to speak of; Level 1 has 0. */
export function asksLeft(tierLevel: number): number | null {
  if (tierLevel < AI_POLICY.basicMinLevel) return 0;
  const { perDay } = aiAllowance(tierLevel);
  if (!Number.isFinite(perDay) || hasDayPass()) return null;
  return Math.max(0, perDay - asksUsedToday());
}

/**
 * Openers worth offering, built from what this person actually has.
 *
 * The point is that every one of these can be answered from the data on hand,
 * so nothing here invites an answer the companion cannot give.
 */
export function aiSuggestions(args: {
  user: UserProfile;
  brokers: Broker[];
  signals: MarketSignal[];
}): string[] {
  const { user, brokers, signals } = args;
  const connected = brokers.filter((b) => b.connected);
  const out: string[] = [];

  if (connected.length === 0) {
    out.push('Which broker pays me the most for how I trade?');
    out.push('What does connecting a broker actually get me?');
  } else {
    out.push(`Am I leaving cashback on the table with ${connected[0].name}?`);
    out.push('Compare my connected brokers on cost');
  }

  const top = signals[0];
  if (top) out.push(`Explain the ${top.ticker} signal in plain words`);

  out.push(`What gets me from ${user.rankTitle} to the next level fastest?`);
  out.push('What did I trade badly this month, and why?');
  out.push('Explain spread, swap and commission with my numbers');

  if (user.tierLevel < 4) out.push('What would the next level unlock for me?');

  return out.slice(0, 6);
}

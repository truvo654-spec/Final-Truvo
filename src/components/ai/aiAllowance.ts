import type { Broker, MarketSignal, UserProfile } from '../../types';

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
  /** Asks included each day at this level. Infinity above the top tier. */
  perDay: number;
  /** The level that lifts the limit for good. */
  freeAtLevel: number;
  /** Credits for a day without the limit, at this person's level. */
  dayPrice: number;
}

const BASE_DAY_PRICE = 60;

export function aiAllowance(tierLevel: number): AiAllowance {
  const perDay = tierLevel >= 4 ? Number.POSITIVE_INFINITY : tierLevel >= 3 ? 40 : tierLevel >= 2 ? 15 : 5;
  const discount = tierLevel >= 4 ? 0 : tierLevel === 3 ? 0.5 : tierLevel === 2 ? 0.8 : 1;
  return { perDay, freeAtLevel: 4, dayPrice: Math.round(BASE_DAY_PRICE * discount) };
}

/** Today, as a key that changes at midnight in the person's own timezone. */
function today() {
  return new Date().toLocaleDateString('en-CA');
}

const USED_KEY = 'marketsyde_ai_used';
const PASS_KEY = 'marketsyde_ai_day_pass';

/** How many asks have been spent today. */
export function asksUsedToday(): number {
  try {
    const raw = window.localStorage.getItem(USED_KEY);
    if (!raw) return 0;
    const parsed = JSON.parse(raw) as { date: string; count: number };
    return parsed.date === today() ? parsed.count : 0;
  } catch {
    return 0;
  }
}

export function recordAsk() {
  try {
    window.localStorage.setItem(USED_KEY, JSON.stringify({ date: today(), count: asksUsedToday() + 1 }));
  } catch { /* storage can be blocked */ }
}

/** Whether a day without the limit has been bought and is still running. */
export function hasDayPass(): boolean {
  try {
    return window.localStorage.getItem(PASS_KEY) === today();
  } catch {
    return false;
  }
}

export function grantDayPass() {
  try {
    window.localStorage.setItem(PASS_KEY, today());
  } catch { /* storage can be blocked */ }
}

/** What is left today: null means there is no limit to speak of. */
export function asksLeft(tierLevel: number): number | null {
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

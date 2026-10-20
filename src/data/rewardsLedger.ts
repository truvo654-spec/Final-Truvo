import {
  CREDIT_CAPS,
  CREDIT_LIFE_DAYS,
  POINT_LIFE_DAYS,
  REPEAT_DECAY,
  levelForPoints,
} from './rewardRules';

/**
 * The dated ledger behind Points and Syde Credits.
 *
 * The Final Beta workbook turns on a rule a running total cannot express: each
 * Point counts for ninety days and each Credit for a hundred and eighty, and
 * spending takes the oldest Credits first. So nothing here stores a balance.
 * Every entry keeps the day it was earned, and the balance is what is left
 * once the expired entries are dropped.
 */

export interface LedgerEntry {
  id: string;
  /** When it was earned, as an ISO date. */
  earnedAt: string;
  /** What was earned, before anything was spent from it. */
  amount: number;
  /** How much of this entry has been spent. Credits only. */
  spent: number;
  /** Why it was earned, for the member's own log. */
  reason: string;
}

export interface Ledger {
  points: LedgerEntry[];
  credits: LedgerEntry[];
  /** Tasks already paid, so a repeat pays less. Keyed by task and day. */
  taskCounts: Record<string, number>;
}

const KEY = 'marketsyde_ledger';

const EMPTY: Ledger = { points: [], credits: [], taskCounts: {} };

export function readLedger(): Ledger {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { ...EMPTY };
    const parsed = JSON.parse(raw) as Partial<Ledger>;
    return {
      points: parsed.points ?? [],
      credits: parsed.credits ?? [],
      taskCounts: parsed.taskCounts ?? {},
    };
  } catch {
    return { ...EMPTY };
  }
}

export function writeLedger(ledger: Ledger) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(ledger));
  } catch { /* storage can be blocked */ }
}

/** Days between two dates, counting whole days. */
function ageInDays(earnedAt: string, now: Date): number {
  const then = new Date(earnedAt).getTime();
  return Math.floor((now.getTime() - then) / 86_400_000);
}

export function isLive(entry: LedgerEntry, lifeDays: number, now = new Date()): boolean {
  return ageInDays(entry.earnedAt, now) < lifeDays;
}

/** Points earned in the last ninety days. These set the level. */
export function activePoints(ledger: Ledger, now = new Date()): number {
  return ledger.points
    .filter((e) => isLive(e, POINT_LIFE_DAYS, now))
    .reduce((sum, e) => sum + e.amount, 0);
}

/** Credits still live and not yet spent. */
export function availableCredits(ledger: Ledger, now = new Date()): number {
  return ledger.credits
    .filter((e) => isLive(e, CREDIT_LIFE_DAYS, now))
    .reduce((sum, e) => sum + (e.amount - e.spent), 0);
}

/** The level the member is in right now. */
export function currentLevel(ledger: Ledger, now = new Date()) {
  return levelForPoints(activePoints(ledger, now));
}

/** What is about to go, so the member can be warned in time. */
export function expiringSoon(ledger: Ledger, withinDays: number, now = new Date()) {
  const points = ledger.points
    .filter((e) => isLive(e, POINT_LIFE_DAYS, now) && POINT_LIFE_DAYS - ageInDays(e.earnedAt, now) <= withinDays)
    .reduce((sum, e) => sum + e.amount, 0);
  const credits = ledger.credits
    .filter((e) => isLive(e, CREDIT_LIFE_DAYS, now) && CREDIT_LIFE_DAYS - ageInDays(e.earnedAt, now) <= withinDays)
    .reduce((sum, e) => sum + (e.amount - e.spent), 0);
  return { points, credits };
}

/** Today, as the key the caps and the repeat decay count against. */
function dayKey(now: Date): string {
  return now.toLocaleDateString('en-CA');
}

/**
 * Credits earned from platform activity within the last so many days.
 *
 * The weekly cap is on activity, so an opening balance carried over from the
 * old running total must not count against it; otherwise a member who already
 * had Credits could earn nothing for a week.
 */
function earnedIn(ledger: Ledger, days: number, now: Date): number {
  return ledger.credits
    .filter((e) => ageInDays(e.earnedAt, now) < days && !e.reason.startsWith('opening'))
    .reduce((sum, e) => sum + e.amount, 0);
}

export interface AwardResult {
  ledger: Ledger;
  /** What was actually paid, after the decay and the caps. */
  awarded: number;
  /** Why it was less than asked for, if it was. */
  note?: string;
}

/**
 * Pays Credits for a verified task, applying the decay and the caps.
 *
 * Doing the same task again pays half, then a quarter, then nothing, and no
 * single task pays more than the cap however it is reached. The weekly cap
 * stops the whole thing running away.
 */
export function awardCredits(
  ledger: Ledger,
  args: { task: string; amount: number; reason: string; social?: boolean },
  now = new Date(),
): AwardResult {
  const key = `${args.task}:${dayKey(now)}`;
  const already = ledger.taskCounts[key] ?? 0;
  const decay = REPEAT_DECAY[Math.min(already, REPEAT_DECAY.length - 1)];

  let amount = Math.round(args.amount * decay);
  let note: string | undefined;
  if (decay === 0) note = 'You have already done this one enough times today.';

  if (amount > CREDIT_CAPS.perTask) {
    amount = CREDIT_CAPS.perTask;
    note = `Capped at ${CREDIT_CAPS.perTask} Credits for one task.`;
  }

  if (args.social) {
    const today = ledger.credits
      .filter((e) => ageInDays(e.earnedAt, now) === 0 && e.reason.startsWith('social:'))
      .reduce((sum, e) => sum + e.amount, 0);
    const room = Math.max(0, CREDIT_CAPS.socialPerDay - today);
    if (amount > room) {
      amount = room;
      note = `That is today\u2019s ${CREDIT_CAPS.socialPerDay} social Credits.`;
    }
  }

  const weekRoom = Math.max(0, CREDIT_CAPS.tasksPerWeek - earnedIn(ledger, 7, now));
  if (amount > weekRoom) {
    amount = weekRoom;
    note = `That is this week\u2019s ${CREDIT_CAPS.tasksPerWeek} Credits.`;
  }

  const next: Ledger = {
    ...ledger,
    taskCounts: { ...ledger.taskCounts, [key]: already + 1 },
    credits: amount > 0
      ? [...ledger.credits, {
          id: `c${now.getTime()}`,
          earnedAt: now.toISOString(),
          amount,
          spent: 0,
          reason: args.social ? `social:${args.reason}` : args.reason,
        }]
      : ledger.credits,
  };

  return { ledger: next, awarded: amount, note };
}

/**
 * Pays a social quest, respecting its own limit as well as the daily cap.
 *
 * Each quest says how often it may pay, so the ledger counts what it has
 * already paid for that quest in the period before anything else applies.
 */
export function awardQuest(
  ledger: Ledger,
  quest: { id: string; reward: number; limit: number; period: 'day' | 'week' },
  reason: string,
  now = new Date(),
): AwardResult {
  const days = quest.period === 'day' ? 1 : 7;
  const paidAlready = ledger.credits.filter(
    (e) => e.reason === `social:${quest.id}` && ageInDays(e.earnedAt, now) < days,
  ).length;

  if (paidAlready >= quest.limit) {
    return {
      ledger,
      awarded: 0,
      note: `That is ${quest.limit} time${quest.limit > 1 ? 's' : ''} for this quest ${quest.period === 'day' ? 'today' : 'this week'}.`,
    };
  }

  return awardCredits(
    ledger,
    { task: quest.id, amount: quest.reward, reason: quest.id, social: true },
    now,
  );
}

/** Points from verified trading, which never decay and are never capped. */
export function awardPoints(ledger: Ledger, amount: number, reason: string, now = new Date()): Ledger {
  if (amount <= 0) return ledger;
  return {
    ...ledger,
    points: [...ledger.points, {
      id: `p${now.getTime()}`,
      earnedAt: now.toISOString(),
      amount,
      spent: 0,
      reason,
    }],
  };
}

export interface SpendResult {
  ledger: Ledger;
  ok: boolean;
  /** What was short, when it was. */
  shortBy?: number;
}

/**
 * Spends Credits, oldest live Credits first.
 *
 * Oldest first is the member's interest: it uses up what would expire soonest
 * rather than leaving it to lapse.
 */
export function spendCredits(ledger: Ledger, amount: number, now = new Date()): SpendResult {
  const have = availableCredits(ledger, now);
  if (amount > have) return { ledger, ok: false, shortBy: amount - have };

  let left = amount;
  const credits = [...ledger.credits]
    .sort((a, b) => new Date(a.earnedAt).getTime() - new Date(b.earnedAt).getTime())
    .map((e) => {
      if (left <= 0 || !isLive(e, CREDIT_LIFE_DAYS, now)) return e;
      const take = Math.min(left, e.amount - e.spent);
      left -= take;
      return take > 0 ? { ...e, spent: e.spent + take } : e;
    });

  return { ledger: { ...ledger, credits }, ok: true };
}

/** Drops entries that expired long enough ago to be of no further interest. */
export function pruneLedger(ledger: Ledger, now = new Date()): Ledger {
  const keep = (e: LedgerEntry, life: number) => ageInDays(e.earnedAt, now) < life + 30;
  return {
    ...ledger,
    points: ledger.points.filter((e) => keep(e, POINT_LIFE_DAYS)),
    credits: ledger.credits.filter((e) => keep(e, CREDIT_LIFE_DAYS)),
  };
}

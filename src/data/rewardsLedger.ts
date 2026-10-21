import {
  CapGroup,
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

/**
 * Where the ledger lives.
 *
 * It is in the browser today, which means a member can clear it, and the
 * workbook is firm that only a verified server event may pay. Rather than
 * leave that as a note in a document, the seam is here: set a store and every
 * read and write in the app goes through it instead, no caller changed.
 *
 * The server version is the same two methods over fetch. Until one is set,
 * `isTrusted` stays false and anything that wants to be sure can ask.
 */
export interface LedgerStore {
  read(): Ledger;
  write(ledger: Ledger): void;
  /** True once the record lives somewhere the member cannot edit. */
  readonly trusted: boolean;
}

let store: LedgerStore | null = null;

export function useLedgerStore(next: LedgerStore | null) {
  store = next;
}

/** Whether the ledger is kept somewhere the member cannot edit. */
export function isTrusted(): boolean {
  return store?.trusted ?? false;
}

const EMPTY: Ledger = { points: [], credits: [], taskCounts: {} };

export function readLedger(): Ledger {
  if (store) return store.read();
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
  if (store) { store.write(ledger); return; }
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
  args: { task: string; amount: number; reason: string; social?: boolean; capGroup?: CapGroup },
  now = new Date(),
): AwardResult {
  const capGroup: CapGroup = args.capGroup ?? (args.social ? 1 : 1);
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

  // Social first, because the social sixty sits inside the farmable hundred
  // rather than beside it.
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

  // Group 1 is what a member can do alone and repeat, so it is the one held
  // to a hundred a day. Groups 2 and 3 answer to their own rules.
  if (capGroup === 1) {
    const farmableToday = ledger.credits
      .filter((e) => ageInDays(e.earnedAt, now) === 0 && !e.reason.startsWith('opening'))
      .reduce((sum, e) => sum + e.amount, 0);
    const dayRoom = Math.max(0, CREDIT_CAPS.farmablePerDay - farmableToday);
    if (amount > dayRoom) {
      amount = dayRoom;
      note = `That is today\u2019s ${CREDIT_CAPS.farmablePerDay} Credits from everyday actions.`;
    }

    const weekFarmable = earnedIn(ledger, 7, now);
    const weekRoom = Math.max(0, CREDIT_CAPS.farmablePerWeek - weekFarmable);
    if (amount > weekRoom) {
      amount = weekRoom;
      note = `That is this week\u2019s ${CREDIT_CAPS.farmablePerWeek} Credits from everyday actions.`;
    }
  }

  if (capGroup === 3) {
    const rvThisMonth = ledger.credits
      .filter((e) => ageInDays(e.earnedAt, now) < 30 && e.reason.startsWith('rv:'))
      .reduce((sum, e) => sum + e.amount, 0);
    const rvRoom = Math.max(0, CREDIT_CAPS.revenueLinkedPerMonth - rvThisMonth);
    if (amount > rvRoom) {
      amount = rvRoom;
      note = `That is this month\u2019s ${CREDIT_CAPS.revenueLinkedPerMonth} broker-confirmed Credits.`;
    }
  }

  // v3.6 replaced the hybrid caps with a limit per day, per week and per
  // month on everything from activity. An award pays the smallest of what is
  // left under any of them, and says which one stopped it.
  const windows: [string, number, number][] = [
    ['today', 1, CREDIT_CAPS.allActivityPerDay],
    ['this week', 7, CREDIT_CAPS.allActivityPerWeek],
    ['this month', 30, CREDIT_CAPS.allActivityPerMonth],
  ];
  for (const [when, days, cap] of windows) {
    const room = Math.max(0, cap - earnedIn(ledger, days, now));
    if (amount > room) {
      amount = room;
      note = `That is ${when}\u2019s ${cap} Credits from activity.`;
    }
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
          reason: args.social
        ? `social:${args.reason}`
        : capGroup === 3 ? `rv:${args.reason}` : args.reason,
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

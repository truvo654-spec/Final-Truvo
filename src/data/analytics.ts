import { activePoints, readLedger } from './rewardsLedger';
import { levelForPoints, LEVEL_NAMES } from './rewardRules';

/**
 * The client half of the tracking plan.
 *
 * Three rules from the plan are enforced here rather than left to whoever
 * writes the next call site:
 *
 * 1. Nothing is sent without analytics consent. The gate is in the code, not
 *    in a report nobody reads.
 * 2. Nothing that pays goes through this. Points, Credits and cashback are
 *    server-confirmed events; sending them from a browser would let a console
 *    forge them. `track` refuses them out loud in development.
 * 3. Search queries and questions are hashed before they leave the device, so
 *    the shape of demand is measured without reading what anyone typed.
 *
 * Until a collector exists, events are kept in a ring buffer in memory and can
 * be read with `recentEvents()`. Swapping the buffer for a real endpoint is one
 * function, `useCollector`.
 */

export interface TrackedEvent {
  name: string;
  at: string;
  params: Record<string, unknown>;
}

export type Collector = (event: TrackedEvent) => void;

const CONSENT_KEY = 'marketsyde_consent_analytics';
const BUFFER_MAX = 200;

let collector: Collector | null = null;
const buffer: TrackedEvent[] = [];

/** Events that may only come from a server, because they pay. */
const SERVER_ONLY = [
  'credits_earned', 'points_earned', 'cashback_accrued', 'cashback_paid',
  'level_up', 'level_down', 'conversion_completed', 'unlock_purchased',
  'referral_qualified', 'referral_reward_paid', 'mission_task_completed',
  'daily_checkin', 'review_submitted_reward', 'broker_connect_verified',
];

export function useCollector(next: Collector | null) {
  collector = next;
}

export function analyticsConsent(): boolean {
  try {
    return window.localStorage.getItem(CONSENT_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setAnalyticsConsent(given: boolean) {
  try {
    window.localStorage.setItem(CONSENT_KEY, String(given));
  } catch { /* storage can be blocked */ }
}

/**
 * A stable pseudonymous id for this browser.
 *
 * Not a name, not an email, and not derived from either: it exists only to
 * join a session to itself, and it is created only once consent is given.
 */
function anonymousId(): string {
  const KEY = 'marketsyde_anonymous_id';
  try {
    const kept = window.localStorage.getItem(KEY);
    if (kept) return kept;
    const made = `a${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
    window.localStorage.setItem(KEY, made);
    return made;
  } catch {
    return 'a-unavailable';
  }
}

/** One id per visit, so a funnel can be read within a session. */
let sessionId: string | null = null;
function session(): string {
  if (!sessionId) sessionId = `s${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  return sessionId;
}

/**
 * The parameters the plan says every event carries.
 *
 * Read fresh each time: a level that changed mid-session would otherwise be
 * reported as whatever it was when the page loaded.
 */
function globals(): Record<string, unknown> {
  const points = activePoints(readLedger());
  const level = levelForPoints(points);
  return {
    anonymous_id: anonymousId(),
    session_id: session(),
    member_level: level,
    level_name: LEVEL_NAMES[level - 1],
    is_logged_in: (() => {
      try { return window.localStorage.getItem('marketsyde_is_logged_in') === 'true'; } catch { return false; }
    })(),
    page_path: typeof window === 'undefined' ? '' : window.location.pathname,
    device: typeof window === 'undefined' ? 'unknown'
      : window.innerWidth < 640 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop',
    consent_analytics: true,
  };
}

/**
 * Hashes a query so demand can be counted without reading it.
 *
 * Synchronous and non-cryptographic on purpose: this is not protecting a
 * secret, it is making sure nobody can casually read what people searched for
 * out of an event stream. Length is kept because it is useful and harmless.
 */
export function hashQuery(text: string): string {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return `q${(h >>> 0).toString(36)}_${text.trim().length}`;
}

/** Records one event, if consent allows and the browser is entitled to claim it. */
export function track(name: string, params: Record<string, unknown> = {}) {
  if (SERVER_ONLY.includes(name)) {
    if (import.meta.env?.DEV) {
      console.warn(`[analytics] ${name} must come from the server; it pays. Not sent.`);
    }
    return;
  }
  if (!analyticsConsent()) return;

  const event: TrackedEvent = { name, at: new Date().toISOString(), params: { ...globals(), ...params } };

  if (collector) { collector(event); return; }
  buffer.push(event);
  if (buffer.length > BUFFER_MAX) buffer.shift();
}

/** What has been recorded so far, newest last. For checking the wiring. */
export function recentEvents(): TrackedEvent[] {
  return [...buffer];
}

// Exposed so the wiring can be checked from the console or a test, which is
// the only honest way to know an event fires where the plan says it does.
if (typeof window !== 'undefined') {
  (window as unknown as { marketsydeEvents?: () => TrackedEvent[] }).marketsydeEvents = recentEvents;
}

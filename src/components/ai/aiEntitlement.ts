/**
 * MarketSyde AI: who may ask, in which mode, and how much is left today.
 *
 * One policy for every AI entry point. The level always comes from the
 * person's profile (`user.tierLevel`); there is no separate AI level.
 *
 *   Basic     LV1 locked · LV2 10/day · LV3 20/day · LV4 unlimited (fair use)
 *   Advanced  LV1–2 locked ("Advanced AI unlocks at Level 3") · LV3 10/day · LV4 10/day
 *
 * Counting rules
 * - A prompt is reserved when the request starts and committed only when an
 *   answer completes. Failed, cancelled and automatically retried requests
 *   release the reservation, so they cost nothing.
 * - Basic and Advanced have separate counters. Advanced never uses Basic.
 * - Both reset at 00:00 UTC. Nothing rolls over.
 * - Changing level keeps today's used count: 8 used at LV2 leaves 12 at LV3;
 *   dropping below today's used count leaves 0, never a negative number.
 *
 * PROTOTYPE ONLY: usage is simulated in the browser (localStorage, shared by
 * every tab of the same browser). Production must enforce entitlement,
 * reservation, counting and the UTC reset on the server. These client checks
 * are not authorization.
 */

export type AiMode = 'basic' | 'advanced';

export const AI_POLICY = {
  basicPerDay: { 1: 0, 2: 10, 3: 20, 4: Number.POSITIVE_INFINITY } as Record<number, number>,
  /** LV4 Advanced is not decided yet; kept at 10 rather than silently unlimited. */
  advancedPerDay: { 1: 0, 2: 0, 3: 10, 4: 10 } as Record<number, number>,
  basicMinLevel: 2,
  advancedMinLevel: 3,
  /** A reservation older than this is treated as abandoned (closed tab, crash). */
  pendingTtlMs: 120_000,
};

const BASIC_KEY = 'marketsyde_ai_used';
const ADVANCED_KEY = 'marketsyde_ai_adv_used';
const DAY_PASS_KEY = 'marketsyde_ai_day_pass';
const QA_KEY = 'marketsyde.ai.qa';
const MODE_KEY = 'marketsyde.ai.mode';
const SESSION_KEY = 'marketsyde.ai.session';
/** Fired whenever usage changes in this tab; other tabs hear `storage`. */
export const AI_USAGE_EVENT = 'msai:usage';

/** Test-only switches for QA (never shown to customers). */
export interface AiQa { enabled?: boolean; failNext?: boolean; flaky?: boolean; dayOffset?: number }

export function aiQa(): AiQa {
  try { return JSON.parse(window.localStorage.getItem(QA_KEY) || '{}') || {}; } catch { return {}; }
}
export function setAiQa(patch: AiQa) {
  try {
    window.localStorage.setItem(QA_KEY, JSON.stringify({ ...aiQa(), ...patch }));
    window.dispatchEvent(new CustomEvent(AI_USAGE_EVENT));
  } catch { /* storage can be blocked */ }
}

function now() { return Date.now() + (Number(aiQa().dayOffset) || 0) * 86_400_000; }

/** Today's key, changing at 00:00 UTC for everyone. */
export function aiDay(): string { return new Date(now()).toISOString().slice(0, 10); }

interface Ledger { date: string; count: number; pending: Record<string, number>; done: Record<string, 1> }

const keyFor = (mode: AiMode) => (mode === 'advanced' ? ADVANCED_KEY : BASIC_KEY);

function read(mode: AiMode = 'basic'): Ledger {
  try {
    const raw = JSON.parse(window.localStorage.getItem(keyFor(mode)) || 'null');
    if (raw && raw.date === aiDay()) {
      return {
        date: raw.date,
        count: Number(raw.count) || 0,
        pending: raw.pending && typeof raw.pending === 'object' ? raw.pending : {},
        done: raw.done && typeof raw.done === 'object' ? raw.done : {},
      };
    }
  } catch { /* fall through to a fresh day */ }
  return { date: aiDay(), count: 0, pending: {}, done: {} };
}

function write(ledger: Ledger, mode: AiMode = 'basic') {
  try { window.localStorage.setItem(keyFor(mode), JSON.stringify(ledger)); } catch { /* ignore */ }
  try { window.dispatchEvent(new CustomEvent(AI_USAGE_EVENT)); } catch { /* ignore */ }
}

function prune(ledger: Ledger): Ledger {
  const t = Date.now();
  for (const id of Object.keys(ledger.pending)) {
    if (t - ledger.pending[id] > AI_POLICY.pendingTtlMs) delete ledger.pending[id];
  }
  return ledger;
}

/** Completed Basic prompts today. */
export function basicUsedToday(): number { return read('basic').count; }

/** Adds one completed Basic prompt (for screens that count on their own). */
export function addBasicUse() { const l = read('basic'); l.count += 1; write(l, 'basic'); }

/** The existing credits day pass: lifts the Basic cap at LV2–3 for the UTC day. */
export function hasDayPass(): boolean {
  try { return window.localStorage.getItem(DAY_PASS_KEY) === aiDay(); } catch { return false; }
}
export function grantDayPass() {
  try { window.localStorage.setItem(DAY_PASS_KEY, aiDay()); } catch { /* ignore */ }
}

/** "Resets at 07:00 Bangkok time", worked out for the viewer's own timezone. */
export function aiResetLabel(): string {
  const d = new Date(now());
  const next = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 1));
  let tz = '';
  try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch { /* ignore */ }
  const place = tz.includes('/') ? tz.split('/').pop()!.replace(/_/g, ' ') : tz === 'UTC' ? 'UTC' : 'local';
  let at = '00:00 UTC';
  try { at = next.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }); } catch { /* ignore */ }
  return `Resets at ${at} ${place} time`;
}

export interface AiStatus {
  mode: AiMode;
  level: number;
  limit: number;
  used: number;
  pending: number;
  /** null means no number to show (unlimited or day pass). */
  remaining: number | null;
  unlimited: boolean;
  dayPass: boolean;
  locked: boolean;
  resetLabel: string;
}

const clampLevel = (level: number) => Math.min(4, Math.max(1, Number(level) || 1));

export function aiStatus(level: number, mode: AiMode = 'basic'): AiStatus {
  const lv = clampLevel(level);
  const ledger = prune(read(mode));
  const pending = Object.keys(ledger.pending).length;
  if (mode === 'advanced') {
    const limit = AI_POLICY.advancedPerDay[lv] ?? 0;
    const locked = lv < AI_POLICY.advancedMinLevel || !(limit > 0);
    const unlimited = !locked && !Number.isFinite(limit);
    return {
      mode, level: lv, limit: locked ? 0 : limit, used: ledger.count, pending,
      remaining: locked ? 0 : unlimited ? null : Math.max(0, limit - ledger.count - pending),
      unlimited, dayPass: false, locked, resetLabel: aiResetLabel(),
    };
  }
  const limit = AI_POLICY.basicPerDay[lv];
  const locked = lv < AI_POLICY.basicMinLevel;
  const dayPass = !locked && Number.isFinite(limit) && hasDayPass();
  const unlimited = !locked && !Number.isFinite(limit);
  return {
    mode, level: lv, limit: locked ? 0 : limit, used: ledger.count, pending,
    remaining: locked ? 0 : unlimited || dayPass ? null : Math.max(0, limit - ledger.count - pending),
    unlimited, dayPass, locked, resetLabel: aiResetLabel(),
  };
}

export type AiLockCode = 'basic-locked' | 'advanced-locked' | 'exhausted' | 'advanced-exhausted';
/** ok:false always carries the lock code and a message to show. */
export interface AiEntitlement { ok: boolean; code?: AiLockCode; msg: string }

/**
 * Whether the next generation may run. Checked when a request starts and again
 * when it finishes, so an answer is withheld if the level dropped meanwhile.
 */
export function aiEntitlement(level: number, mode: AiMode, opts?: { ignoreQuota?: boolean }): AiEntitlement {
  const lv = clampLevel(level);
  if (mode === 'advanced') {
    if (lv < AI_POLICY.advancedMinLevel) return { ok: false, code: 'advanced-locked', msg: 'Advanced AI unlocks at Level 3' };
    if (opts?.ignoreQuota) return { ok: true, msg: '' };
    const s = aiStatus(lv, 'advanced');
    return s.remaining !== null && s.remaining <= 0
      ? { ok: false, code: 'advanced-exhausted', msg: `You have used ${s.used} of ${s.limit} Advanced prompts today. 0 left. ${s.resetLabel}. Your draft and history are kept.` }
      : { ok: true, msg: '' };
  }
  if (lv < AI_POLICY.basicMinLevel) {
    return { ok: false, code: 'basic-locked', msg: 'MarketSyde AI is not included at Level 1 (Rookie). Basic AI unlocks at Level 2.' };
  }
  if (opts?.ignoreQuota) return { ok: true, msg: '' };
  const s = aiStatus(lv, 'basic');
  return s.remaining !== null && s.remaining <= 0
    ? { ok: false, code: 'exhausted', msg: `You have used ${s.used} of ${s.limit} Basic prompts today. 0 left. ${s.resetLabel}. Your draft and history are kept.` }
    : { ok: true, msg: '' };
}

/** Holds one prompt for a request in flight. null when none is available. */
export function reserveAi(level: number, mode: AiMode): string | null {
  const s = aiStatus(level, mode);
  if (s.locked || (s.remaining !== null && s.remaining <= 0)) return null;
  const ledger = prune(read(mode));
  const id = (mode === 'advanced' ? 'a' : 'r') + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  ledger.pending[id] = Date.now();
  write(ledger, mode);
  return id;
}

const modeOfId = (id: string): AiMode => (id[0] === 'a' ? 'advanced' : 'basic');

/** Counts a reservation once, when its answer has completed. Idempotent. */
export function commitAi(id: string | null): boolean {
  if (!id) return false;
  const mode = modeOfId(id);
  const ledger = read(mode);
  if (ledger.done[id]) return false;
  delete ledger.pending[id];
  ledger.done[id] = 1;
  ledger.count += 1;
  write(ledger, mode);
  return true;
}

/** Gives a reservation back after a failure or a cancel. */
export function releaseAi(id: string | null) {
  if (!id) return;
  const mode = modeOfId(id);
  const ledger = read(mode);
  if (id in ledger.pending) { delete ledger.pending[id]; write(ledger, mode); }
}

/** Test only: wipe today's simulated usage. */
export function resetAiUsageForQa() {
  try {
    window.localStorage.removeItem(BASIC_KEY);
    window.localStorage.removeItem(ADVANCED_KEY);
  } catch { /* ignore */ }
  setAiQa({ dayOffset: 0, failNext: false, flaky: false });
}

export function loadAiMode(): AiMode {
  try { return window.localStorage.getItem(MODE_KEY) === 'advanced' ? 'advanced' : 'basic'; } catch { return 'basic'; }
}
export function saveAiMode(mode: AiMode) {
  try { window.localStorage.setItem(MODE_KEY, mode); } catch { /* ignore */ }
}

/** The dock's conversation and draft, kept for this browser tab session. */
export function loadAiSession<T>(key: string): T | null {
  try { const all = JSON.parse(window.sessionStorage.getItem(SESSION_KEY) || '{}'); return (all && all[key]) || null; } catch { return null; }
}
export function saveAiSession(key: string, value: unknown) {
  try {
    const all = JSON.parse(window.sessionStorage.getItem(SESSION_KEY) || '{}') || {};
    all[key] = value;
    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(all));
  } catch { /* ignore */ }
}

/**
 * The Advanced answer for this prototype: a labelled result built from the
 * page's own figures. No numbers are invented; live multi-source data is not
 * connected yet, so the missing parts say so.
 */
export function advancedSampleAnswer(
  data: { stats?: { label: string; value: string }[]; pretext?: string },
  question: string,
  source?: string,
): string {
  const facts = (data.stats ?? []).slice(0, 4).map((s) => `• ${s.label}: ${s.value}`);
  const at = new Date();
  return [
    'Advanced answer · sample data',
    'This used 1 of your Advanced prompts. It reads this page’s sample data only, because live multi-source data is not connected in this prototype.',
    '',
    `Question: ${question}`,
    `Sources: ${source || data.pretext || 'This page'} (sample data)`,
    'Account scope: all connected accounts (sample) · Date range: last 30 days (sample)',
    `As of: ${at.toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })} (${at.toISOString().slice(11, 16)} UTC)`,
    '',
    'Facts from this page',
    ...(facts.length ? facts : ['• This page has no figures to compare.']),
    '',
    'Calculations',
    '• None run here. Multi-source comparisons need live data.',
    '',
    'Scenarios',
    '• Not generated in this prototype.',
    '',
    'Missing data',
    '• Live multi-source, multi-account and multi-timeframe data is not connected in this prototype.',
  ].join('\n');
}

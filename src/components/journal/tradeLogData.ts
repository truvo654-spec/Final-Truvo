import { JournalChecklistItem, JournalEntry, PortfolioTrade } from '../../types';

/**
 * The log of one trade, in the order things happened. Only what the data really holds is shown:
 * times come from the linked Portfolio trade, the rest from the journal entry. Nothing is invented.
 */

export type LogKind = 'before' | 'open' | 'close' | 'after' | 'journal';

export interface LogEvent {
  id: string;
  kind: LogKind;
  title: string;
  detail: string;
  /** Display time, or a short label when no clock time is recorded. */
  when: string;
  /** Where the facts came from. */
  source: string;
  tone: 'neutral' | 'good' | 'bad' | 'brand';
}

export interface TradeLog {
  events: LogEvent[];
  /** Shown between the open and the close. */
  held: string | null;
  stats: { label: string; value: string; tone: 'neutral' | 'good' | 'bad' }[];
  notes: string[];
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const pad = (n: number) => String(n).padStart(2, '0');
export const fmtTime = (iso: string) => {
  const d = new Date(iso);
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}, ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())} UTC`;
};
export const fmtDay = (iso: string) => {
  const d = new Date(`${iso.slice(0, 10)}T00:00:00Z`);
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
};
export const fmtDuration = (ms: number) => {
  const m = Math.max(0, Math.round(ms / 60000));
  const d = Math.floor(m / 1440);
  const h = Math.floor((m % 1440) / 60);
  const mm = m % 60;
  return [d ? `${d}d` : '', h || d ? `${h}h` : '', `${mm}m`].filter(Boolean).join(' ');
};
const money = (v: number) => `${v < 0 ? '-' : v > 0 ? '+' : ''}$${Math.abs(v).toFixed(2)}`;
const rFmt = (r: number) => `${r > 0 ? '+' : ''}${r}R`;
const plural = (n: number, w: string) => `${n} ${w}${n === 1 ? '' : 's'}`;
const priceStr = (v: number) => String(v);

const INPUT_LABEL: Record<string, string> = { api: 'synced from the broker', manual: 'entered by hand', csv: 'imported from a file', import: 'imported from a file' };

export function buildTradeLog(entry: JournalEntry, linked: PortfolioTrade | undefined, checklist: JournalChecklistItem[]): TradeLog {
  const events: LogEvent[] = [];
  const notes: string[] = [];
  const total = checklist.length;
  const done = Math.min(entry.checklistDone.length, total);
  const open = entry.outcome === 'open' || entry.exitPrice === null;
  const dirWord = entry.direction === 'BUY' ? 'Bought' : 'Sold';
  const lots = entry.assetClass === 'Forex' ? 'lots' : 'units';

  // before the trade: what the journal recorded about the plan
  events.push({
    id: 'before',
    kind: 'before',
    title: 'Before the trade',
    detail: `Felt ${entry.emotionBefore.toLowerCase().replace('fomo', 'FOMO')}.${total ? ` ${done} of ${total} checklist items ticked.` : ''}${entry.setupNotes.trim() ? ' Setup note written.' : ' No setup note.'}`,
    when: 'Before entry',
    source: 'Journal',
    tone: 'neutral',
  });

  // the open
  const openedAt = linked?.openedAt;
  const via = linked ? `Portfolio · ${linked.broker}${INPUT_LABEL[linked.inputMethod] ? `, ${INPUT_LABEL[linked.inputMethod]}` : ''}` : 'Journal entry';
  const extra: string[] = [];
  if (linked?.confidence !== undefined) extra.push(`From a MarketSyde signal, confidence ${linked.confidence}%.`);
  if (linked?.riskTag) extra.push(`Tagged ${linked.riskTag.replace('-', ' ')}.`);
  events.push({
    id: 'open',
    kind: 'open',
    title: `${dirWord} ${entry.size} ${lots} of ${entry.symbol} at ${priceStr(entry.entryPrice)}`,
    detail: [`Strategy: ${entry.strategy}.`, ...extra].join(' '),
    when: openedAt ? fmtTime(openedAt) : fmtDay(entry.date),
    source: via,
    tone: 'brand',
  });

  // the close
  const dir = entry.direction === 'BUY' ? 1 : -1;
  let held: string | null = null;
  const stats: TradeLog['stats'] = [];
  if (open) {
    events.push({ id: 'close', kind: 'close', title: 'Still open', detail: 'No exit yet, so there is no result to log. Update this entry when the trade closes.', when: 'Now', source: via, tone: 'neutral' });
    if (linked?.openedAt) stats.push({ label: 'Open for', value: fmtDuration(Date.parse('2026-10-05T04:00:00Z') - Date.parse(linked.openedAt)), tone: 'neutral' });
  } else {
    const exit = entry.exitPrice as number;
    const movePct = ((exit - entry.entryPrice) / entry.entryPrice) * dir * 100;
    const isForex = entry.assetClass === 'Forex';
    const pipSize = entry.symbol.includes('JPY') ? 0.01 : 0.0001;
    const pips = ((exit - entry.entryPrice) * dir) / pipSize;
    const parts = [isForex ? `${pips >= 0 ? '+' : ''}${pips.toFixed(1)} pips` : '', `${movePct >= 0 ? '+' : ''}${movePct.toFixed(2)}% price move`, money(entry.pnl), entry.rMultiple !== null ? rFmt(entry.rMultiple) : ''].filter(Boolean);
    events.push({
      id: 'close',
      kind: 'close',
      title: `Closed at ${priceStr(exit)}`,
      detail: parts.join(' · '),
      when: linked?.closedAt ? fmtTime(linked.closedAt) : fmtDay(entry.date),
      source: via,
      tone: entry.pnl > 0 ? 'good' : entry.pnl < 0 ? 'bad' : 'neutral',
    });
    if (linked?.openedAt && linked.closedAt) {
      held = fmtDuration(Date.parse(linked.closedAt) - Date.parse(linked.openedAt));
      stats.push({ label: 'Held for', value: held, tone: 'neutral' });
    }
    stats.push({ label: 'Price move', value: `${movePct >= 0 ? '+' : ''}${movePct.toFixed(2)}%`, tone: movePct > 0 ? 'good' : movePct < 0 ? 'bad' : 'neutral' });
    if (isForex) stats.push({ label: 'Pips', value: `${pips >= 0 ? '+' : ''}${pips.toFixed(1)}`, tone: pips > 0 ? 'good' : pips < 0 ? 'bad' : 'neutral' });
    stats.push({ label: 'Result', value: money(entry.pnl), tone: entry.pnl > 0 ? 'good' : entry.pnl < 0 ? 'bad' : 'neutral' });
    if (entry.rMultiple !== null) stats.push({ label: 'R multiple', value: rFmt(entry.rMultiple), tone: entry.rMultiple > 0 ? 'good' : entry.rMultiple < 0 ? 'bad' : 'neutral' });
  }

  // after the trade: the review the trader wrote
  const afterBits = [`Felt ${entry.emotionAfter.toLowerCase().replace('fomo', 'FOMO')}.`, entry.followedPlan ? 'Plan followed.' : 'Went off plan.', entry.mistakes.length ? `Flagged ${plural(entry.mistakes.length, 'mistake')}: ${entry.mistakes.join(', ')}.` : 'No mistakes flagged.'];
  if (entry.lessons.trim()) afterBits.push(`Lesson: “${entry.lessons.trim()}”`);
  events.push({ id: 'after', kind: 'after', title: 'After the trade', detail: afterBits.join(' '), when: 'After close', source: 'Journal', tone: entry.followedPlan && !entry.mistakes.length ? 'good' : entry.mistakes.length || !entry.followedPlan ? 'bad' : 'neutral' });

  // when it was journaled
  let gap = '';
  if (linked?.closedAt) {
    const days = Math.floor((Date.parse(`${entry.date}T00:00:00Z`) - Date.parse(`${linked.closedAt.slice(0, 10)}T00:00:00Z`)) / 86_400_000);
    gap = days >= 1 ? ` That was ${plural(days, 'day')} after the trade closed.` : days === 0 ? ' Written the day the trade closed.' : '';
  }
  events.push({ id: 'journal', kind: 'journal', title: 'Journal entry written', detail: `${entry.rating ? `Rated ${entry.rating} of 5. ` : ''}${entry.source === 'portfolio' ? 'Started from a Portfolio trade.' : 'Entered by hand.'}${gap}`.trim(), when: fmtDay(entry.date), source: 'Journal', tone: 'neutral' });

  // honest limits
  if (!linked) notes.push('This entry is not linked to a Portfolio trade, so clock times were not recorded. Link it to see when the trade opened and closed.');
  if (linked && (Math.abs(linked.entryPrice - entry.entryPrice) > 1e-9 || (linked.exitPrice !== null && entry.exitPrice !== null && Math.abs(linked.exitPrice - entry.exitPrice) > 1e-9))) notes.push(`The Portfolio trade shows entry ${linked.entryPrice} and exit ${linked.exitPrice ?? 'open'}, which differ from this entry.`);
  return { events, held, stats, notes };
}

/** The log as plain text, for copying. */
export function logToText(entry: JournalEntry, log: TradeLog): string {
  const head = `${entry.symbol} ${entry.direction} · ${entry.date}`;
  const lines = log.events.map((e) => `${e.when} | ${e.title} | ${e.detail} | ${e.source}`);
  return [head, ...lines, ...(log.notes.length ? ['', ...log.notes] : [])].join('\n');
}

import type { JournalEntry } from '../../../types';
import { currencyOf, rawNet, realized, realizedR, reportedPnlOf, statusOf, timestampMs } from '../journalMath';
import { addDays } from '../journalOverview';
import { validDate } from '../journalDay';
import { computeDiscipline, hasDisciplineEvidence } from '../journalDiscipline';

export const INSIGHTS_RANGES = ['7D', '30D', '90D', 'YTD', 'All'] as const;
export type InsightsRange = typeof INSIGHTS_RANGES[number];
export interface InsightsFilters { range: InsightsRange; account: string; side: 'all' | 'long' | 'short'; asOf: string }
export interface InsightsSettings { timeZone: string; currency: string; locale?: string }
export interface InsightTrade {
  entry: JournalEntry; net: number; r: number | null;
  closeDate: string; closeTime: number; entryDate: string | null; entryHour: number | null; entryWeekday: number | null;
}
export interface InsightStats {
  n: number; net: number; wins: number; losses: number; breakeven: number;
  winRate: number | null; profitFactor: number | null; avgWin: number | null; avgLoss: number | null; payoff: number | null;
}
export interface InsightBucket extends InsightStats { key: string; trades: InsightTrade[] }
export interface CurvePoint extends InsightBucket { cumulative: number; drawdown: number }
export interface InsightCallout { id: string; text: string; trades: InsightTrade[] }
const round = (n: number) => Math.round(n * 100) / 100;
export const accountOf = (entry: JournalEntry) => entry.accountId || 'legacy-demo';
export const mondayIndex = (date: string) => (new Date(`${date}T00:00:00Z`).getUTCDay() + 6) % 7;
export const weekOf = (date: string) => addDays(date, -mondayIndex(date));
export function validTimeZone(value: string) {
  try { new Intl.DateTimeFormat(undefined, { timeZone: value }); return true; } catch { return false; }
}
export function validCurrency(value: string) {
  if (!/^[A-Z]{3}$/.test(value)) return false;
  return typeof Intl.supportedValuesOf !== 'function' || Intl.supportedValuesOf('currency').includes(value);
}
export function browserTimeZone() { return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'; }
export function profileTimeZones() {
  return [...new Set([browserTimeZone(), 'UTC', ...(typeof Intl.supportedValuesOf === 'function' ? Intl.supportedValuesOf('timeZone') : ['Europe/London', 'America/New_York', 'Asia/Bangkok', 'Asia/Tokyo', 'Australia/Sydney'])])].sort();
}
export function profileCurrencies() {
  return typeof Intl.supportedValuesOf === 'function' ? Intl.supportedValuesOf('currency') : ['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'AUD', 'CAD', 'THB', 'SGD'];
}
export function zonedParts(time: number, timeZone: string) {
  const format = new Intl.DateTimeFormat('en-US-u-ca-gregory-nu-latn', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23' });
  return partsOf(format, time);
}
function partsOf(format: Intl.DateTimeFormat, time: number) {
  const parts = Object.fromEntries(format.formatToParts(time).map(part => [part.type, part.value]));
  const date = `${parts.year}-${parts.month}-${parts.day}`;
  return { date, hour: Number(parts.hour) % 24, weekday: mondayIndex(date) };
}
function recordedTime(value?: string) {
  return typeof value === 'string' && validDate(value.slice(0, 10)) && /[T ]\d{2}:\d{2}/.test(value) ? timestampMs(value) : NaN;
}
export function openPositionSnapshot(entries: JournalEntry[], filters: Pick<InsightsFilters, 'account' | 'side'>, currency: string) {
  if (!validCurrency(currency)) throw new Error('Open positions require a valid reporting currency.');
  const scoped = entries.filter(entry => statusOf(entry) === 'open' &&
    (filters.account === 'all' || accountOf(entry) === filters.account) &&
    (filters.side === 'all' || entry.direction === (filters.side === 'long' ? 'BUY' : 'SELL')));
  const positions = scoped.filter(entry => currencyOf(entry) === currency)
    .sort((a, b) => (recordedTime(b.entryTime) || 0) - (recordedTime(a.entryTime) || 0) || b.date.localeCompare(a.date) || b.id.localeCompare(a.id))
    .map(entry => ({ entry, unrealized: reportedPnlOf(entry) }));
  const known = positions.map(position => position.unrealized).filter((value): value is number => value !== null);
  const knownSubtotal = known.length ? round(known.reduce((sum, value) => sum + value, 0)) : null;
  const knownFloatingLosses = known.length ? round(known.reduce((sum, value) => sum + Math.min(0, value), 0)) : null;
  const complete = positions.length > 0 && known.length === positions.length;
  return { positions, account: filters.account, side: filters.side, known: known.length, unknown: positions.length - known.length,
    unrealized: complete ? knownSubtotal : null, floatingLosses: complete ? knownFloatingLosses : null,
    knownSubtotal, knownFloatingLosses, otherCurrency: scoped.length - positions.length };
}
export type InsightOpenSnapshot = ReturnType<typeof openPositionSnapshot>;
export function readInsightsFilters(search: string, today: string) {
  const query = new URLSearchParams(search), errors: string[] = [];
  const rawRange = query.get('insightsRange'), rawSide = query.get('insightsSide'), rawDate = query.get('insightsAsOf');
  const range = INSIGHTS_RANGES.find(value => value === rawRange) || '30D';
  const side = rawSide === 'long' || rawSide === 'short' ? rawSide : 'all';
  if (rawRange && !INSIGHTS_RANGES.some(value => value === rawRange)) errors.push('Unknown date preset; showing 30D.');
  if (rawSide && !['all', 'long', 'short'].includes(rawSide)) errors.push('Unknown side; showing all sides.');
  if (rawDate && !validDate(rawDate)) errors.push('Invalid period end date; using today.');
  return { filters: { range, side, account: query.get('insightsAccount') || 'all', asOf: rawDate && validDate(rawDate) ? rawDate : today } satisfies InsightsFilters, errors };
}
export function insightsUrl(url: URL, filters: InsightsFilters) {
  const next = new URL(url);
  next.searchParams.set('journalTab', 'insights');
  next.searchParams.set('insightsRange', filters.range);
  next.searchParams.set('insightsAccount', filters.account);
  next.searchParams.set('insightsSide', filters.side);
  next.searchParams.set('insightsAsOf', filters.asOf);
  next.searchParams.delete('journalTrade');
  return next;
}
export function insightsBounds(filters: InsightsFilters, earliest: string) {
  const to = filters.asOf;
  const from = filters.range === 'All' ? (earliest < to ? earliest : to) : filters.range === 'YTD' ? `${to.slice(0, 4)}-01-01` : addDays(to, -(Number(filters.range.slice(0, -1)) - 1));
  const days = Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86400000) + 1;
  return { from, to, previousFrom: addDays(from, -days), previousTo: addDays(from, -1), days };
}
export function insightStats(trades: InsightTrade[]): InsightStats {
  let net = 0, gains = 0, lost = 0, wins = 0, losses = 0;
  for (const trade of trades) {
    net += trade.net;
    if (trade.net > 0) { gains += trade.net; wins++; }
    if (trade.net < 0) { lost -= trade.net; losses++; }
  }
  const avgWin = wins ? gains / wins : null, avgLoss = losses ? lost / losses : null;
  return { n: trades.length, net: round(net), wins, losses, breakeven: trades.length - wins - losses,
    winRate: trades.length ? wins / trades.length * 100 : null,
    profitFactor: lost ? gains / lost : gains ? Infinity : null, avgWin, avgLoss,
    payoff: avgWin !== null && avgLoss !== null && avgLoss > 0 ? avgWin / avgLoss : null };
}
function buckets(trades: InsightTrade[], keyOf: (trade: InsightTrade) => string | null, keys: string[] = []) {
  const map = new Map<string, InsightTrade[]>(keys.map(key => [key, []]));
  for (const trade of trades) {
    const key = keyOf(trade);
    if (key === null) continue;
    const group = map.get(key);
    if (group) group.push(trade); else map.set(key, [trade]);
  }
  return [...map].map(([key, trades]) => ({ key, trades, ...insightStats(trades) }));
}
export const formatInsightsMoney = (value: number, settings: InsightsSettings, compact = false) =>
  new Intl.NumberFormat(settings.locale, { style: 'currency', currency: settings.currency, signDisplay: 'exceptZero', ...(compact ? { notation: 'compact', maximumFractionDigits: 1 } : {}) }).format(value);
export const weekdayLabel = (index: number, locale?: string, long = false) =>
  new Intl.DateTimeFormat(locale, { weekday: long ? 'long' : 'short', timeZone: 'UTC' }).format(Date.parse(`2024-01-0${index + 1}T12:00:00Z`));
export const hourLabel = (hour: number, locale?: string) =>
  new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: '2-digit', timeZone: 'UTC' }).format(Date.parse(`2024-01-01T${String(hour).padStart(2, '0')}:00:00Z`));
export function aggregateInsights(entries: JournalEntry[], filters: InsightsFilters, settings: InsightsSettings, checklistLength = 0) {
  if (!validDate(filters.asOf) || !validTimeZone(settings.timeZone) || !validCurrency(settings.currency)) throw new Error('Insights requires a valid date, timezone and reporting currency.');
  if (!Number.isInteger(checklistLength) || checklistLength < 0) throw new Error('Insights requires a non-negative checklist length.');
  const localFormat = new Intl.DateTimeFormat('en-US-u-ca-gregory-nu-latn', { timeZone: settings.timeZone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23' });
  const normalized: InsightTrade[] = [];
  const coverage = { closed: 0, otherCurrency: 0, missingExit: 0, unknownResult: 0, invalidCosts: 0, missingEntry: 0, unknownCosts: 0 };
  const accounts = [...new Set(entries.map(accountOf))].sort();
  for (const entry of entries) {
    if (statusOf(entry) !== 'closed') continue;
    coverage.closed++;
    if (currencyOf(entry) !== settings.currency) { coverage.otherCurrency++; continue; }
    if (!realized(entry)) { coverage.unknownResult++; continue; }
    if (entry.commission != null && (!Number.isFinite(entry.commission) || entry.commission < 0)) { coverage.invalidCosts++; continue; }
    const closeTime = recordedTime(entry.exitTime);
    if (!Number.isFinite(closeTime)) { coverage.missingExit++; continue; }
    const closed = partsOf(localFormat, closeTime), entryTime = recordedTime(entry.entryTime);
    const opened = Number.isFinite(entryTime) && entryTime <= closeTime ? partsOf(localFormat, entryTime) : null;
    normalized.push({ entry, net: rawNet(entry), r: realizedR(entry), closeDate: closed.date, closeTime,
      entryDate: opened?.date ?? null, entryHour: opened?.hour ?? null, entryWeekday: opened?.weekday ?? null });
  }
  const earliest = normalized.reduce((date, trade) => trade.closeDate < date ? trade.closeDate : date, filters.asOf);
  const bounds = insightsBounds(filters, earliest);
  const accountSide = normalized.filter(trade => (filters.account === 'all' || accountOf(trade.entry) === filters.account) &&
    (filters.side === 'all' || trade.entry.direction === (filters.side === 'long' ? 'BUY' : 'SELL')));
  const current = accountSide.filter(trade => trade.closeDate >= bounds.from && trade.closeDate <= bounds.to).sort((a, b) => a.closeTime - b.closeTime || a.entry.id.localeCompare(b.entry.id));
  const previous = accountSide.filter(trade => trade.closeDate >= bounds.previousFrom && trade.closeDate <= bounds.previousTo);
  coverage.missingEntry = current.filter(trade => trade.entryHour === null).length;
  coverage.unknownCosts = current.filter(trade => !Number.isFinite(trade.entry.commission)).length;
  const days = buckets(current, trade => trade.closeDate).sort((a, b) => a.key.localeCompare(b.key));
  const previousDays = buckets(previous, trade => trade.closeDate);
  const weekdays = buckets(current, trade => String(mondayIndex(trade.closeDate)), Array.from({ length: 7 }, (_, index) => String(index)));
  const hours = buckets(current, trade => trade.entryHour === null ? null : String(trade.entryHour), Array.from({ length: 24 }, (_, index) => String(index)));
  const heatmap = buckets(current, trade => trade.entryHour === null ? null : `${trade.entryWeekday}-${trade.entryHour}`, Array.from({ length: 168 }, (_, index) => `${Math.floor(index / 24)}-${index % 24}`));
  const weeks = buckets(current, trade => weekOf(trade.closeDate));
  const summary = insightStats(current), previousSummary = insightStats(previous);
  const playbooks = buckets(current, trade => {
    const name = trade.entry.strategy.trim();
    return name === 'Unassigned' ? '' : name;
  }).map(bucket => {
    const answered = bucket.trades.filter(trade => typeof trade.entry.followedPlan === 'boolean');
    const followed = answered.filter(trade => trade.entry.followedPlan === true);
    return { ...bucket, name: bucket.key || 'No playbook recorded', assigned: !!bucket.key, answered, followed,
      adherence: answered.length ? followed.length / answered.length * 100 : null };
  }).sort((a, b) => b.n - a.n || a.name.localeCompare(b.name, settings.locale));
  const disciplineFor = (trades: InsightTrade[]) => {
    const newest = [...trades].sort((a, b) => b.entry.date.localeCompare(a.entry.date) ||
      (timestampMs(b.entry.entryTime) || 0) - (timestampMs(a.entry.entryTime) || 0) || b.entry.id.localeCompare(a.entry.id));
    const reviewed = newest.filter(trade => hasDisciplineEvidence(trade.entry));
    const score = computeDiscipline(newest.map(trade => trade.entry), checklistLength);
    const streakKnown = reviewed.length > 0 && reviewed.every(trade => trade.entryHour !== null &&
      trade.entry.date === new Date(timestampMs(trade.entry.entryTime)).toISOString().slice(0, 10));
    return { score, reviewed, streakKnown, unanswered: newest.filter(trade => !hasDisciplineEvidence(trade.entry)),
      followed: reviewed.filter(trade => trade.entry.followedPlan === true),
      clean: reviewed.filter(trade => trade.entry.mistakes.length === 0),
      streak: reviewed.slice(0, score?.run || 0) };
  };
  const discipline = disciplineFor(current), previousDiscipline = disciplineFor(previous);
  const nextMilestone = discipline.streakKnown ? [1, 3, 5, 10].find(goal => goal > (discipline.score?.run || 0)) ?? null : null;
  const extremes = (list: InsightBucket[]) => {
    const observed = list.filter(bucket => bucket.n);
    return { best: observed.reduce<InsightBucket | null>((best, bucket) => !best || bucket.net > best.net ? bucket : best, null),
      worst: observed.reduce<InsightBucket | null>((worst, bucket) => !worst || bucket.net < worst.net ? bucket : worst, null) };
  };
  let cumulative = 0, peak = 0;
  const curve: CurvePoint[] = days.map(day => {
    cumulative = round(cumulative + day.net); peak = Math.max(peak, cumulative);
    return { ...day, cumulative, drawdown: round(cumulative - peak) };
  });
  // One running pass supplies every KPI sparkline, rather than recalculating per widget.
  let runningNet = 0, gains = 0, lost = 0, wins = 0, losses = 0, count = 0;
  const trends = days.map(day => {
    for (const trade of day.trades) {
      runningNet += trade.net; count++;
      if (trade.net > 0) { gains += trade.net; wins++; }
      if (trade.net < 0) { lost -= trade.net; losses++; }
    }
    return { date: day.key, net: round(runningNet), winRate: wins / count * 100, profitFactor: lost ? gains / lost : gains ? Infinity : null,
      payoff: wins && losses ? (gains / wins) / (lost / losses) : null, total: count, dayNet: day.net };
  });
  const callouts: InsightCallout[] = [];
  const money = (value: number) => formatInsightsMoney(value, settings);
  const bestWeekday = extremes(weekdays.filter(bucket => bucket.n >= 5)).best;
  if (bestWeekday) callouts.push({ id: 'best-day', text: `Your best closing day is ${weekdayLabel(Number(bestWeekday.key), settings.locale, true)} (${money(bestWeekday.net)}, ${bestWeekday.winRate!.toFixed(0)}% win rate).`, trades: bestWeekday.trades });
  const late = current.filter(trade => trade.entryHour !== null && trade.entryHour >= 15);
  const lateStats = insightStats(late);
  if (late.length >= 5 && lateStats.net < 0) callouts.push({ id: 'late', text: `Trades opened from ${hourLabel(15, settings.locale)} average ${money(lateStats.net / late.length)} per trade.`, trades: late });
  const longs = current.filter(trade => trade.entry.direction === 'BUY'), shorts = current.filter(trade => trade.entry.direction === 'SELL');
  const longStats = insightStats(longs), shortStats = insightStats(shorts);
  if (longs.length >= 5 && shorts.length >= 5 && longStats.winRate !== shortStats.winRate) {
    const shortLower = shortStats.winRate! < longStats.winRate!;
    callouts.push({ id: 'side', text: `${shortLower ? 'Short' : 'Long'} trades have a lower win rate than ${shortLower ? 'longs' : 'shorts'} (${(shortLower ? shortStats : longStats).winRate!.toFixed(0)}% vs ${(shortLower ? longStats : shortStats).winRate!.toFixed(0)}%).`, trades: [...longs, ...shorts] });
  }
  const bestHour = extremes(hours.filter(bucket => bucket.n >= 5)).best;
  if (bestHour) callouts.push({ id: 'best-hour', text: `Your best entry hour starts at ${hourLabel(Number(bestHour.key), settings.locale)} (${money(bestHour.net)} across ${bestHour.n} trades).`, trades: bestHour.trades });
  return { filters, settings, bounds, accounts, current, previous, summary, previousSummary, days,
    byDay: new Map(days.map(bucket => [bucket.key, bucket])), weeks: new Map(weeks.map(bucket => [bucket.key, bucket])),
    weekdays, hours, heatmap, curve, trends, dayExtremes: extremes(days), previousDayExtremes: extremes(previousDays),
    hourExtremes: extremes(hours), callouts, coverage, available: normalized.length, filteredOut: normalized.length - current.length,
    playbooks, playbookFocus: playbooks.find(playbook => playbook.assigned) || null,
    discipline: { ...discipline, previousScore: previousDiscipline.score, checklistLength, nextMilestone },
    openSnapshot: openPositionSnapshot(entries, filters, settings.currency) };
}
export type InsightsData = ReturnType<typeof aggregateInsights>;

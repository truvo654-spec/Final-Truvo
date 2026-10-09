import type { JournalEntry, TradingStatus } from '../../types';
export const statusOf = (e: JournalEntry): TradingStatus => e.tradingStatus ?? (e.outcome === 'open' ? 'open' : 'closed');
// Legacy demo records are dollar-denominated. No implicit currency conversion.
export const currencyOf = (e: JournalEntry) => e.accountCurrency || 'USD';
export const costsKnown = (e: JournalEntry) => Number.isFinite(e.commission);
export const realized = (e: JournalEntry) => statusOf(e) === 'closed' && e.pnlKnown !== false && Number.isFinite(e.pnl);
export const eligible = (e: JournalEntry, basis: 'gross' | 'net' = 'net') => realized(e) && (basis === 'gross' || costsKnown(e));
export const rawNet = (e: JournalEntry) => Math.round((e.pnl - (e.commission ?? 0)) * 100) / 100;
// Additive value only: callers display ineligible observations as unknown, not a closed zero result.
export const netOf = (e: JournalEntry) => eligible(e) ? rawNet(e) : 0;
export const resultOf = (e: JournalEntry, basis: 'gross' | 'net' = 'net'): JournalEntry['outcome'] => {
  if (!eligible(e, basis)) return 'open';
  const p = basis === 'net' ? rawNet(e) : e.pnl;
  return Math.abs(p) <= 0.005 ? 'breakeven' : p > 0 ? 'win' : 'loss';
};
export const realizedR = (e: JournalEntry) => !eligible(e) ? null : Number.isFinite(e.initialRisk) && e.initialRisk! > 0 ? rawNet(e) / e.initialRisk! : Number.isFinite(e.rMultiple) ? e.rMultiple : null;
export const timestampMs = (s?: string) => s ? Date.parse(/[zZ]|[+-]\d\d:\d\d$/.test(s) ? s : `${s}Z`) : NaN;
export function metrics(entries: JournalEntry[], basis: 'gross' | 'net' = 'net') {
  const currencies = new Set(entries.filter(e => eligible(e, basis)).map(currencyOf));
  if (currencies.size > 1) throw new Error('Select one account currency before combining money results.');
  const list = entries.filter(e => eligible(e, basis));
  const values = list.map(e => basis === 'net' ? rawNet(e) : e.pnl);
  const wins = list.filter(e => resultOf(e, basis) === 'win').length;
  const losses = list.filter(e => resultOf(e, basis) === 'loss').length;
  const be = list.length - wins - losses;
  const positive = values.filter(n => n > 0).reduce((a,b) => a+b,0);
  const negative = -values.filter(n => n < 0).reduce((a,b) => a+b,0);
  const total = Math.round(values.reduce((a,b) => a+b,0)*100)/100;
  const rs = list.map(realizedR).filter((n): n is number => n != null);
  const knownPlan = entries.filter(e => typeof e.followedPlan === 'boolean');
  const daily = new Map<string, number>();
  list.forEach((e,i) => daily.set(e.date,(daily.get(e.date) || 0)+values[i]));
  let equity = 0, peak = 0, drawdown = 0;
  [...daily].sort(([a],[b]) => a.localeCompare(b)).forEach(([,v]) => { equity+=v; peak=Math.max(peak,equity); drawdown=Math.max(drawdown,peak-equity); });
  return { list, count:entries.length, n:list.length, wins, losses, be, total,
    winRate:list.length ? wins/list.length*100 : null,
    pf:negative > 0 ? positive/negative : positive > 0 ? Infinity : null,
    avgR:rs.length ? rs.reduce((a,b)=>a+b,0)/rs.length : null, rCount:rs.length,
    riskCount:list.filter(e => !!e.initialRisk && e.initialRisk > 0).length,
    expectancy:list.length ? total/list.length : null,
    fees:list.reduce((a,e)=>a+(e.commission ?? 0),0), drawdown,
    plan:knownPlan.length ? knownPlan.filter(e=>e.followedPlan === true).length/knownPlan.length*100 : null,
    planKnown:knownPlan.length, daily:[...daily].sort(([a],[b])=>a.localeCompare(b)) };
}
export const incompleteFields = (e: JournalEntry) => [
  !e.emotionBefore && 'before emotion', !e.emotionAfter && 'after emotion',
  typeof e.followedPlan !== 'boolean' && 'plan adherence', !e.lessons.trim() && 'lesson',
  !Number.isFinite(e.rating) && 'execution rating', !costsKnown(e) && 'costs',
].filter(Boolean) as string[];

import type { Broker, JournalEntry } from '../../types';
import { eligible, netOf, realizedR, resultOf } from './journalMath';
import { entryCashback, entryPoints, UNASSIGNED } from './journalOverview';
import { reviewStateOf, tradingStatusOf } from './tradingStatus';
import type { TradeLogFilterController } from './useTradeLogFilters';

export function filterTradeLogEntries(entries: JournalEntry[], filters: Pick<TradeLogFilterController, 'query' | 'needsReview' | 'fOutcome' | 'fTradingStatus' | 'marketOff' | 'brokerOff'>, brokers: Map<string, Broker>, preset?: { ids: string[] } | null) {
  const query = filters.query.trim().toLowerCase();
  return entries.filter(entry => {
    if (preset) return preset.ids.includes(entry.id);
    if (filters.needsReview && reviewStateOf(entry) === 'complete') return false;
    if (filters.fOutcome !== 'all' && (!eligible(entry) || resultOf(entry) !== filters.fOutcome)) return false;
    if (filters.fTradingStatus !== 'all' && tradingStatusOf(entry) !== filters.fTradingStatus) return false;
    if (filters.marketOff.includes(entry.assetClass) || filters.brokerOff.includes(entry.brokerId || UNASSIGNED)) return false;
    return !query || [entry.symbol, entry.strategy, entry.brokerId ? brokers.get(entry.brokerId)?.name || entry.brokerId : 'Unassigned', ...entry.tags].some(value => value.toLowerCase().includes(query));
  });
}

export function tradeLogTotals(entries: JournalEntry[], brokers: Map<string, Broker>) {
  const list = entries.filter(e => eligible(e));
  const net = list.reduce((sum, e) => sum + netOf(e), 0);
  const gross = list.reduce((sum, e) => sum + e.pnl, 0);
  const fees = list.reduce((sum, e) => sum + (e.commission ?? 0), 0);
  const rs = list.map(realizedR).filter((value): value is number => value !== null);
  return {
    n: list.length, net: Math.round(net * 100) / 100, gross, fees: Math.round(fees * 100) / 100,
    cb: Math.round(list.reduce((sum, e) => sum + entryCashback(e, brokers), 0) * 100) / 100,
    pts: list.reduce((sum, e) => sum + entryPoints(e), 0),
    r: rs.length ? rs.reduce((sum, value) => sum + value, 0) / rs.length : 0, rn: rs.length,
  };
}
export function tradeLogKpis(entries: JournalEntry[], brokers: Map<string, Broker>) {
  const totals = tradeLogTotals(entries, brokers);
  const nets = entries.filter(e => eligible(e)).map(netOf);
  const wins = nets.filter(n => n > 0), losses = nets.filter(n => n < 0);
  const gained = wins.reduce((sum, n) => sum + n, 0), lost = Math.abs(losses.reduce((sum, n) => sum + n, 0));
  const avgW = wins.length ? gained / wins.length : 0, avgL = losses.length ? lost / losses.length : 0;
  const rs = entries.map(realizedR).filter((value): value is number => value !== null);
  return {
    ...totals, pf: lost > 0 ? gained / lost : gained > 0 ? Infinity : null,
    wins: wins.length, losses: losses.length, be: nets.length - wins.length - losses.length,
    winRate: nets.length ? Math.round(wins.length / nets.length * 1000) / 10 : 0,
    avgW, avgL, payoff: avgL > 0 ? avgW / avgL : null, maxR: rs.length ? Math.max(...rs) : 0,
    feePct: totals.gross !== 0 ? totals.fees / Math.abs(totals.gross) * 100 : null,
  };
}
export interface QuickReviewAnswers {
  emotionAfter: JournalEntry['emotionAfter'];
  plan: 'yes' | 'partly' | 'no' | '';
  lessons: string;
  screenshot?: string;
}
export const planAnswer = (entry: JournalEntry): QuickReviewAnswers['plan'] =>
  entry.followedPlan === false && entry.planAdherence === 'partly' ? 'partly' : entry.followedPlan === true ? 'yes' : entry.followedPlan === false ? 'no' : '';
export function quickReviewPatch(answers: QuickReviewAnswers): Partial<JournalEntry> {
  return {
    emotionAfter: answers.emotionAfter, lessons: answers.lessons,
    followedPlan: answers.plan === '' ? null : answers.plan === 'yes',
    planAdherence: answers.plan === 'partly' ? 'partly' : undefined,
    ...(answers.screenshot !== undefined ? { screenshot: answers.screenshot } : {}),
  };
}

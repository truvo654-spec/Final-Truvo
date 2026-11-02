import type { JournalEntry } from '../../types';
import { knownInstrument } from './instrumentMatching';

export const TRADE_MARKETS = [['Forex', 'Forex'], ['Crypto', 'Crypto'], ['Commodity', 'Commodities'], ['Indices', 'Indices'], ['Stocks', 'Stocks']] as const;
export interface TradeListFilter { search: string; market: string; symbol: string }
export const EMPTY_TRADE_FILTER: TradeListFilter = { search: '', market: 'all', symbol: 'all' };
export interface TradeFilterRecord { symbol: string; market?: string; text?: string }
const key = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '');
export function tradeRecordMarket(record: TradeFilterRecord): string {
  const raw = record.market?.trim().toLowerCase();
  const aliases: Record<string, string> = { forex: 'Forex', crypto: 'Crypto', commodity: 'Commodity', commodities: 'Commodity', indices: 'Indices', index: 'Indices', stock: 'Stocks', stocks: 'Stocks' };
  return (raw && aliases[raw]) || knownInstrument(record.symbol)?.market || 'Unassigned';
}
export function matchesTradeFilter(record: TradeFilterRecord, filter: TradeListFilter): boolean {
  if (filter.market !== 'all' && tradeRecordMarket(record) !== filter.market) return false;
  if (filter.symbol !== 'all' && key(record.symbol) !== key(filter.symbol)) return false;
  const instrument = knownInstrument(record.symbol);
  const haystack = key([record.symbol, instrument?.symbol, instrument?.name, tradeRecordMarket(record), record.text].join(' '));
  return filter.search.trim().split(/\s+/).filter(Boolean).every(term => haystack.includes(key(term)));
}
/** Returns original objects so review, replay and bulk actions keep their recorded identity. */
export function filterTradeList<T>(rows: readonly T[], filter: TradeListFilter, describe: (row: T) => TradeFilterRecord): T[] {
  return rows.filter(row => matchesTradeFilter(describe(row), filter));
}
export function journalTradeRecord(entry: JournalEntry): TradeFilterRecord {
  return { symbol: entry.symbol, market: entry.assetClass, text: [entry.id, entry.strategy, entry.direction, entry.direction === 'BUY' ? 'Long' : 'Short', entry.date, entry.entryTime, entry.exitTime, entry.tradingStatus, entry.tags?.join(' ')].join(' ') };
}

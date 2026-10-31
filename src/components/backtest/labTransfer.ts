import type { JournalPlaybook } from '../../data/journalPlaybooks';
import type { JournalEntry } from '../../types';
import type { BacktestSettings } from '../../backtest/types';
import { defaultSettings, defaultCostsFor, deepClone } from '../../backtest/rules';
import type { JournalRules } from '../../backtest/rules';
import { resolveSymbol } from '../../backtest/marketData';
import { currencyOf } from '../journal/journalMath';

export function labBenchmark(entries: JournalEntry[], ids: string[], books: JournalPlaybook[]) {
  const wanted = new Set(ids);
  const trades = entries.filter(e => wanted.has(e.id));
  const names = new Set(trades.map(e => e.strategy));
  return {
    trades,
    books: books.filter(b => b.status !== 'archived' && names.has(b.name)),
    currencies: [...new Set(trades.map(currencyOf))],
    symbols: [...new Set(trades.map(e => resolveSymbol(e.symbol)).filter((s): s is string => !!s))],
    unsupported: [...new Set(trades.filter(e => !resolveSymbol(e.symbol)).map(e => e.symbol))],
    from: trades.map(e => e.date).sort()[0],
    to: trades.map(e => e.date).sort().at(-1),
  };
}

export function labSettings(book: JournalPlaybook, entries: JournalEntry[], journalRules: JournalRules): BacktestSettings {
  const matching = entries.filter(e => e.strategy === book.name);
  const counts = new Map<string, number>();
  matching.forEach(e => counts.set(e.symbol, (counts.get(e.symbol) ?? 0) + 1));
  const mostTraded = [...counts].sort((a,b) => b[1]-a[1])[0]?.[0];
  const s = defaultSettings({playbook:book, journalRules, mostTraded});
  s.timeframe = book.instrumentTimeframe ?? s.timeframe;
  s.rules.exits.targetR = book.benchmarkRR;
  return s;
}

export function labJobs(settings: BacktestSettings[], symbols: string[]) {
  return settings.flatMap(s => [...new Set(symbols)].map(symbol => ({
    ...deepClone(s), symbol,
    costs: {...s.costs, ...(symbol === s.symbol ? {} : defaultCostsFor(symbol))},
  })));
}

export interface LabDraft { settings:BacktestSettings; byBook:Record<string,BacktestSettings>; bookIds:string[]; symbols:string[]; tradeIds:string[] }
const LAB_DRAFT='ms_strategy_lab_draft_v1';
export function loadLabDraft():LabDraft|null {
  try { const value=JSON.parse(localStorage.getItem(LAB_DRAFT)||'null');
    return value&&value.settings?.rules?.entry&&value.settings?.risk&&value.byBook&&Array.isArray(value.bookIds)&&Array.isArray(value.symbols)&&Array.isArray(value.tradeIds)?value:null;
  } catch {return null;}
}
export function saveLabDraft(value:LabDraft) { try{localStorage.setItem(LAB_DRAFT,JSON.stringify(value));}catch{} }

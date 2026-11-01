import type { JournalPlaybook } from '../../data/journalPlaybooks';
import type { JournalEntry } from '../../types';
import type { BacktestSettings, Condition } from '../../backtest/types';
import {playbookConditions,validatePlaybookConditions} from '../../backtest/playbookConditions';
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

/** Selected playbooks supply their supported instruments; never substitute an unrelated symbol. */
export function labBookSymbols(books:JournalPlaybook[],settings:Record<string,BacktestSettings>){
 return [...new Set(books.flatMap(book=>(book.symbols?.length?book.symbols:[settings[book.id]?.symbol]).flatMap(symbol=>{const mapped=symbol?resolveSymbol(symbol):null;return mapped?[mapped]:[];})))];
}

/** Apply an optional editor snapshot only to existing, selected test copies. */
export function mergeLabSetup(drafts:Record<string,BacktestSettings>,selectedIds:string[],updates:Record<string,BacktestSettings>){
 const next={...drafts};for(const id of selectedIds)if(drafts[id]&&updates[id])next[id]=deepClone(updates[id]);return next;
}

/** Edit only this test's entries; keep saved Playbooks and shared/per-book settings intact. */
export function updateLabEntryRules(drafts:Record<string,BacktestSettings>,bookId:string,entry:Condition[]){
 const current=drafts[bookId];if(!current)return drafts;
 const error=validatePlaybookConditions(entry,500);if(error)throw new Error(error);
 return {...drafts,[bookId]:{...current,rules:{...current.rules,entry:deepClone(entry)}}};
}

/** Approval belongs to the exact test entries, not merely to a selected playbook. */
export function labRulesNeedReview(book:JournalPlaybook,settings:BacktestSettings|undefined,reviewed:Record<string,string>){
 return !playbookConditions(book).length&&(!settings||reviewed[book.id]!==JSON.stringify(settings.rules.entry));
}

export interface LabDraft { reviewedRules?:Record<string,string>; settings:BacktestSettings; byBook:Record<string,BacktestSettings>; bookIds:string[]; symbols:string[]; tradeIds:string[] }
const LAB_DRAFT='ms_strategy_lab_draft_v1';
export function loadLabDraft():LabDraft|null {
  try { const value=JSON.parse(localStorage.getItem(LAB_DRAFT)||'null');
    return value&&value.settings?.rules?.entry&&value.settings?.risk&&value.byBook&&Array.isArray(value.bookIds)&&Array.isArray(value.symbols)&&Array.isArray(value.tradeIds)?value:null;
  } catch {return null;}
}
export function saveLabDraft(value:LabDraft) { try{localStorage.setItem(LAB_DRAFT,JSON.stringify(value));}catch{} }

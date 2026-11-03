import type { JournalEntry } from '../../types';
import type { JournalPlaybook } from '../../data/journalPlaybooks';
import type { BacktestRun } from '../../backtest/store';
import type { BacktestSettings } from '../../backtest/types';
import type { JournalRules } from '../../backtest/rules';
import { labSettings } from './labTransfer';

export interface DashboardRunRequest { run?: BacktestRun; bookId?: string; tradeIds?: string[] }
export interface DashboardQuickOption { bookId: string; name: string; summary: string }
export interface DashboardRunJob { settings: BacktestSettings[]; tradeIds: string[]; dashboard: boolean; fingerprint?:string }

/** A rerun always uses its saved snapshot; new tests reuse the chosen Lab draft. */
export function dashboardQuickRun(request: DashboardRunRequest, books: JournalPlaybook[], entries: JournalEntry[], rules: JournalRules, drafts: Record<string, BacktestSettings>, draft: BacktestSettings) {
  if (request.run) return { settings: structuredClone(request.run.settings), tradeIds: [...(request.run.sourceTradeIds ?? [])] };
  const book = books.find(book => book.id === request.bookId && book.status !== 'archived');
  if (!book) throw new Error('Choose a strategy book to run a demo test.');
  const ids = new Set(request.tradeIds ?? []);
  const settings = drafts[book.id] ?? (draft.playbookId === book.id ? draft : labSettings(book, ids.size ? entries.filter(entry => ids.has(entry.id)) : entries, rules));
  return { settings: structuredClone(settings), tradeIds: [...(request.tradeIds ?? [])] };
}

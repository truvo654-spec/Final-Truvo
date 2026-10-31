import type { JournalPlaybook } from '../../data/journalPlaybooks';
import type { JournalEntry } from '../../types';
import type { BacktestRun } from '../../backtest/store';
import { resolveSymbol } from '../../backtest/marketData';
import { eligible, realizedR, resultOf } from './journalMath';
export const instrumentKey = (symbol: string) => resolveSymbol(symbol) ?? symbol.trim().toUpperCase();
export const playbookFingerprint = (p: JournalPlaybook) => JSON.stringify({directions:p.directions,markets:p.markets, symbols:p.symbols, window:p.window, benchmarkRR:p.benchmarkRR, rules:p.rules, tradingRules:p.tradingRules, technicalEntryConditions:p.technicalEntryConditions, technicalRecipeId:p.technicalRecipeId, entryTrigger:p.entryTrigger, stopRule:p.stopRule, targetRule:p.targetRule, riskPerTrade:p.riskPerTrade, maxTradesPerDay:p.maxTradesPerDay, avoid:p.avoid, houseChecklistIds:p.houseChecklistIds});
export function executionRows(playbook: JournalPlaybook, entries: JournalEntry[], runs: BacktestRun[]) {
  const latest = [...runs].filter(r => r.playbookId === playbook.id).sort((a,b) => b.lastRun.localeCompare(a.lastRun));
  return [...new Map((playbook.symbols ?? []).map(symbol => [instrumentKey(symbol),symbol])).values()].map(symbol => {
    const journal = entries.filter(e => e.strategy === playbook.name && instrumentKey(e.symbol) === instrumentKey(symbol));
    const closed = journal.filter(e => eligible(e));
    const reviewed = closed.filter(e => typeof e.followedPlan === 'boolean');
    const rs = closed.map(realizedR).filter((r): r is number => r !== null);
    const run = latest.find(r => instrumentKey(r.symbol) === instrumentKey(symbol));
    return {symbol, journal, closed, run, stale: !!run?.playbookFingerprint && run.playbookFingerprint !== playbookFingerprint(playbook), winRate: closed.length ? 100*closed.filter(e => resultOf(e) === 'win').length/closed.length : null, avgR: rs.length ? rs.reduce((a,b)=>a+b,0)/rs.length : null, rCount: rs.length, plan: reviewed.length ? 100*reviewed.filter(e=>e.followedPlan).length/reviewed.length : null, reviewed: reviewed.length};
  });
}

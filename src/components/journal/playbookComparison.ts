import { BOTH_SIDES, journalSide, type TradeSide } from './DirectionFilter';
import type { JournalEntry } from '../../types';
import type { JournalPlaybook } from '../../data/journalPlaybooks';
import type { BacktestRun } from '../../backtest/store';
import type { BacktestTrade } from '../../backtest/types';
import { eligible, netOf, realizedR, timestampMs, currencyOf } from './journalMath';
import { symbolSpec } from '../../backtest/marketData';
import { instrumentMarket } from './instrumentMatching';
import { instrumentKey, playbookFingerprint } from './playbookExecution';

export function comparisonMarket(playbook: JournalPlaybook, symbol: string, entries: JournalEntry[] = []): string {
  return instrumentMarket(symbol,playbook) ?? entries.find(entry=>instrumentKey(entry.symbol)===instrumentKey(symbol))?.assetClass ?? 'Unassigned';
}

export const executionPrice = (price:number|null|undefined,symbol:string) => price==null ? '—' : price.toLocaleString('en-US',{minimumFractionDigits:0,maximumFractionDigits:symbolSpec(symbol)?.priceDp ?? 6});

export interface ComparisonScope { directions?:TradeSide[]; from: string; to: string; symbols: string[]; currency: string; balance: number }
export interface ExecutionPoint { id: string; at: number; entryAt: number; net: number; r: number | null; journal?: JournalEntry; trade?: BacktestTrade; run?: BacktestRun; symbol: string }
export function comparisonStats(points: ExecutionPoint[], balance: number) {
  const sorted = [...points].sort((a,b)=>a.at-b.at || a.id.localeCompare(b.id));
  let cumulative = 0, peak = balance, drawdown = 0, drawdownPct = 0;
  const curve = sorted.map((point,index) => {
    cumulative += point.net;
    if(index===sorted.length-1 || sorted[index+1].at!==point.at) {
      const equity = balance + cumulative; peak = Math.max(peak,equity);
      drawdown = Math.max(drawdown,peak-equity);
      if(peak > 0) drawdownPct = Math.max(drawdownPct,(peak-equity)/peak*100);
    }
    return {...point,cumulative};
  });
  const wins = sorted.filter(p=>p.net > 0.005).length;
  const profit = sorted.reduce((n,p)=>n+Math.max(0,p.net),0);
  const loss = -sorted.reduce((n,p)=>n+Math.min(0,p.net),0);
  const rs = sorted.map(p=>p.r).filter((r):r is number=>r!==null && Number.isFinite(r));
  return {points:sorted,curve,count:sorted.length,net:cumulative,winRate:sorted.length ? wins/sorted.length*100 : null,avgR:rs.length ? rs.reduce((a,b)=>a+b,0)/rs.length : null,rCount:rs.length,pf:loss ? profit/loss : profit ? Infinity : null,expectancy:sorted.length ? cumulative/sorted.length : null,drawdown,drawdownPct:sorted.length ? drawdownPct : null};
}
export function comparePlaybook(playbook: JournalPlaybook, entries: JournalEntry[], runs: BacktestRun[], scope: ComparisonScope) {
  const start=Date.parse(scope.from+'T00:00:00Z'),end=Date.parse(scope.to+'T00:00:00Z')+86400000;
  const selected=new Set(scope.symbols.map(instrumentKey));
  const sides=scope.directions ?? playbook.directions ?? BOTH_SIDES;
  const history=entries.filter(e=>sides.includes(journalSide(e.direction)) && e.strategy===playbook.name && currencyOf(e)===scope.currency && selected.has(instrumentKey(e.symbol)) && e.date>=scope.from && e.date<=scope.to);
  const journal=history.filter(e=>eligible(e) && (!e.exitTime || timestampMs(e.exitTime)<end)).map((e):ExecutionPoint=>({id:e.id,at:timestampMs(e.exitTime || e.entryTime || e.date),entryAt:timestampMs(e.entryTime || e.date),net:netOf(e),r:realizedR(e),journal:e,symbol:e.symbol}));
  const latest=[...runs].filter(run=>run.playbookId===playbook.id && run.output.result.currency===scope.currency && run.from<=scope.to && run.to>=scope.from).sort((a,b)=>b.lastRun.localeCompare(a.lastRun));
  const rows=[...new Map(scope.symbols.map(s=>[instrumentKey(s),s])).values()].map(symbol=>{
    const candidates=latest.filter(run=>instrumentKey(run.symbol)===instrumentKey(symbol));
    const covers=(run:BacktestRun)=>run.from<=scope.from && run.to>=scope.to;
    const directionMatches=(run:BacktestRun)=>run.settings.rules.direction===(sides.length===2?'both':sides[0]);
    const current=(run:BacktestRun)=>directionMatches(run) && run.playbookFingerprint===playbookFingerprint(playbook) && run.settings.risk.startBalance===scope.balance;
    const run=candidates.find(r=>covers(r)&&current(r)) ?? candidates.find(covers) ?? candidates[0];
    const simulated=(run?.output.result.trades ?? []).filter(t=>sides.includes(t.direction) && t.entryTime>=start && t.entryTime<end && (t.exitTime<end || t.exitReason==='end of test'&&t.exitTime===end)).map((trade):ExecutionPoint=>({id:`${run!.id}:${trade.id}`,at:trade.exitTime,entryAt:trade.entryTime,net:trade.net,r:trade.r,trade,run,symbol}));
    return {symbol,market:comparisonMarket(playbook,symbol,entries),run,partial:!!run&&!covers(run),stale:!!run&&(!directionMatches(run)||!!run.playbookFingerprint&&run.playbookFingerprint!==playbookFingerprint(playbook)),balanceChanged:!!run&&run.settings.risk.startBalance!==scope.balance,journal:comparisonStats(journal.filter(p=>instrumentKey(p.symbol)===instrumentKey(symbol)),scope.balance),simulated:comparisonStats(simulated,scope.balance)};
  });
  return {history,rows,journal:comparisonStats(journal,scope.balance),simulated:comparisonStats(rows.flatMap(row=>row.simulated.points),scope.balance)};
}

import type { JournalPlaybook } from '../../data/journalPlaybooks';
import type { GlobalTradingRules } from '../../data/tradingRules';
import { resolvePlaybookTradingRules } from '../../data/tradingRules';
import { defaultSettings, defaultCostsFor } from '../../backtest/rules';
import { DATA_START, DATA_END } from '../../backtest/config';
import { resolveSymbol } from '../../backtest/marketData';
import { seriesFor, CancelledError } from '../../backtest/job';
import { createRun } from '../../backtest/engine';
import { summarize, type BacktestRun } from '../../backtest/store';
import { playbookFingerprint } from './playbookExecution';
import type { ComparisonScope } from './playbookComparison';
import type { Currency } from '../../backtest/types';
export function simulationSettings(playbook: JournalPlaybook, scope: ComparisonScope, symbol: string, globalRules?: GlobalTradingRules) {
  if(!Number.isFinite(Date.parse(scope.from))||!Number.isFinite(Date.parse(scope.to))||scope.from>scope.to||scope.from<DATA_START||scope.to>DATA_END) throw new Error(`Sample prices cover ${DATA_START} to ${DATA_END}. Choose a valid date range.`);
  if(!Number.isFinite(scope.balance)||scope.balance<=0) throw new Error('Reference balance must be greater than zero.');
  const resolved=resolveSymbol(symbol);
  if(!resolved) throw new Error(`Sample prices are unavailable for ${symbol}.`);
  if(!['USD','EUR','GBP'].includes(scope.currency)) throw new Error('Sample simulation supports USD, EUR and GBP.');
  const book=globalRules ? {...playbook,tradingRules:resolvePlaybookTradingRules(playbook,globalRules)} : playbook;
  const settings=defaultSettings({playbook:book});
  return {...settings,name:`${playbook.name} · ${symbol} simulation`,symbol:resolved,from:scope.from,to:scope.to,timeframe:playbook.instrumentTimeframe ?? settings.timeframe,rules:{...settings.rules,exits:{...settings.rules.exits,targetR:playbook.benchmarkRR}},risk:{...settings.risk,startBalance:scope.balance,currency:scope.currency as Currency},costs:{...settings.costs,...defaultCostsFor(resolved)}};
}
export async function generatePlaybookSimulation(playbook: JournalPlaybook, scope: ComparisonScope, symbol: string, options: {globalRules?:GlobalTradingRules; signal?:AbortSignal; onProgress?:(p:number)=>void}={}) {
  const settings=simulationSettings(playbook,scope,symbol,options.globalRules);
  if(options.signal?.aborted) throw new CancelledError();
  const engine=createRun(settings,seriesFor(settings));
  while(!engine.step(1500)) {
    if(options.signal?.aborted) throw new CancelledError();
    options.onProgress?.(engine.done/Math.max(1,engine.total));
    await new Promise(resolve=>setTimeout(resolve,0));
  }
  if(options.signal?.aborted) throw new CancelledError();
  const output={result:engine.result(),suggestions:[]};
  const now=new Date().toISOString();
  const run:BacktestRun={id:`sim_${crypto.randomUUID()}`,name:settings.name,mode:'automated',status:'done',playbookId:playbook.id,symbol:settings.symbol,timeframe:settings.timeframe,from:scope.from,to:scope.to,createdAt:now,lastRun:now,settings,summary:summarize(output),output,playbookFingerprint:playbookFingerprint(playbook)};
  options.onProgress?.(1);
  return run;
}

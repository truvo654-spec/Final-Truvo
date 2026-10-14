// Explicit synthetic sandbox. No journal outcomes, exit prices or inferred fills shape this feed.
import type { JournalEntry } from '../types';
import type { JournalPlaybook } from '../data/journalPlaybooks';
import { hashSeed, normal, rng } from './rng';
import { isOpen, seriesFromBars, symbolSpec } from './marketData';
import { defaultSettings, deepClone, templateFor } from './rules';
import { runSync, RunOptions } from './engine';
import { Bar, BacktestSettings, RunResult, Timeframe, TF_MS } from './types';

export interface DemoFeed { symbol: string; tf: Timeframe; bars: Bar[]; dp: number; seed: string }
export interface DemoHypothesis { stopAtr: number; targetR: number; commission: number }
export const demoProblem = (h: DemoHypothesis): string | null => {
  if (!Number.isFinite(h.stopAtr) || h.stopAtr < 0.1 || h.stopAtr > 10) return 'Stop distance must be between 0.1 and 10 ATR.';
  if (!Number.isFinite(h.targetR) || h.targetR < 0.1 || h.targetR > 20) return 'Target must be between 0.1 and 20R.';
  if (!Number.isFinite(h.commission) || h.commission < 0 || h.commission > 100) return 'Commission must be between $0 and $100 per unit per side.';
  return null;
};

export function createDemoFeed(symbol: string, tf: Timeframe, seed: string): DemoFeed {
  const spec = symbolSpec(symbol);
  if (!spec || !TF_MS[tf]) throw new Error('Choose a supported demo instrument and timeframe.');
  const random = rng(hashSeed(`demo-v1:${spec.symbol}:${tf}:${seed}`));
  const step = TF_MS[tf];
  // Daily stock bars need a regular-session anchor; midnight would never be an open session.
  let t = Date.UTC(2026, 8, 1, tf === '1D' && spec.hours === 'us-stocks' ? 14 : 0), price = spec.startPrice;
  const bars: Bar[] = [];
  const round = (p: number) => Math.max(spec.tickSize, Math.round(p / spec.tickSize) * spec.tickSize);
  const sigma = spec.annualVol * Math.sqrt(step / (365 * 86400000));
  while (bars.length < 360) {
    if (isOpen(spec.hours, t)) {
      const phase = Math.floor(bars.length / 45) % 4;
      const drift = phase === 0 ? 0.35 : phase === 1 ? -0.35 : 0;
      const o = price;
      const c = round(o * Math.exp(sigma * (normal(random) + drift)));
      const wick = Math.max(spec.tickSize, o * sigma * (0.2 + random() * 0.5));
      bars.push({t, o, c, h:round(Math.max(o,c) + wick), l:round(Math.min(o,c) - wick), v:Math.round(100 + random() * 900)});
      price = c;
    }
    t += step;
  }
  return { symbol:spec.symbol, tf, bars, dp:spec.priceDp, seed };
}

export function demoSettings(feed: DemoFeed, book: JournalPlaybook | null, direction: JournalEntry['direction'] | null): BacktestSettings {
  const s = defaultSettings({playbook:book, mostTraded:feed.symbol});
  s.symbol = feed.symbol; s.timeframe = feed.tf;
  s.from = new Date(feed.bars[0].t).toISOString().slice(0,10);
  s.to = new Date(feed.bars.at(-1)!.t).toISOString().slice(0,10);
  // No mock news, account FX conversion, prop scoring, credits or journal writes in the sandbox.
  s.news = 'include'; s.prop = null; s.weekdays = [0,1,2,3,4,5,6];
  s.rules.direction = direction === 'BUY' ? 'long' : direction === 'SELL' ? 'short' : 'both';
  s.risk = {...s.risk, currency:'USD', startBalance:100000, mode:'fixedR', fixedR:1000, dailyLossPct:null, maxDrawdownPct:null};
  s.costs = {...s.costs, enabled:true, commissionPerSide:0, spread:0, slippage:0, fillModel:'nextOpen'};
  return s;
}

export interface DemoRisk { equity: number; mode: 'risk' | 'quantity'; percent: number; quantity: number }
export interface DemoScenario { symbol:string; bias:'long'|'short'; entry:number; stop:number; target:number }
export interface DemoConfiguration { risk:DemoRisk; scenario:DemoScenario | null }

export function configuredDemo(baseline: BacktestSettings, hypothesis: DemoHypothesis, config?: DemoConfiguration): {base:BacktestSettings; variant:BacktestSettings; options:RunOptions} {
  const problem = demoProblem(hypothesis); if (problem) throw new Error(problem);
  if(config) {
    const spec=symbolSpec(baseline.symbol)!;
    const r=config.risk, sc=config.scenario;
    if(!Number.isFinite(r.equity)||r.equity<=0 || r.equity>1e9)throw new Error('Invalid demo equity.');
    if(r.mode==='risk' && (!Number.isFinite(r.percent)||r.percent<0.01||r.percent>10))throw new Error('Invalid demo risk percentage.');
    if(r.mode==='quantity' && (!Number.isFinite(r.quantity)||r.quantity<spec.minSize||r.quantity>1e8||Math.abs(r.quantity/spec.sizeStep-Math.round(r.quantity/spec.sizeStep))>1e-6))throw new Error('Invalid demo quantity or quantity increment.');
    if(sc && (symbolSpec(sc.symbol)?.symbol!==spec.symbol || ![sc.entry,sc.stop,sc.target].every(v=>Number.isFinite(v)&&v>0) || (sc.bias==='long'?1:-1)*(sc.entry-sc.stop)<=0 || (sc.bias==='long'?1:-1)*(sc.target-sc.entry)<=0))throw new Error('Invalid or mismatched demo scenario levels.');
  }
  const base = deepClone(baseline), variant = deepClone(baseline);
  base.costs.commissionPerSide = variant.costs.commissionPerSide = hypothesis.commission;
  variant.rules.exits.stop = {type:'atr', mult:hypothesis.stopAtr};
  variant.rules.exits.targetR = hypothesis.targetR;
  if(config) for(const s of [base,variant]) {
    s.risk.startBalance=config.risk.equity; s.risk.mode=config.risk.mode==='quantity'?'fixedQty':'percent';
    s.risk.percent=config.risk.percent; s.risk.qty=config.risk.quantity;
  }
  const options:RunOptions={isNewsDay:()=>false};
  if(config?.scenario) {
    const sc=config.scenario, spec=symbolSpec(variant.symbol)!;
    variant.rules.direction=sc.bias;
    // A numeric demo interpretation only; the written scenario trigger is not inferred.
    variant.rules.entry=[{id:'demo-scenario-cross',left:{kind:'price',field:'close'},op:'crossAbove',right:{kind:'value',value:sc.entry}}];
    variant.rules.entryOrder={type:'market'};
    variant.rules.exits.stop={type:'points',value:Math.abs(sc.entry-sc.stop)/spec.costUnit.size};
    variant.rules.exits.targetR=Math.abs(sc.target-sc.entry)/Math.abs(sc.entry-sc.stop);
    options.positionLevels={stop:sc.stop,target:sc.target};
  }
  return {base,variant,options};
}

export function compareDemo(feed: DemoFeed, baseline: BacktestSettings, hypothesis: DemoHypothesis, config?: DemoConfiguration): {baseline:RunResult; variant:RunResult} {
  const {base,variant,options}=configuredDemo(baseline,hypothesis,config);
  const series = seriesFromBars(feed.symbol, feed.tf, feed.bars);
  return {baseline:runSync(base,series,{isNewsDay:()=>false}),variant:runSync(variant,series,options)};
}

export const demoTimeframe = (book: JournalPlaybook | null) => templateFor(book).tf;

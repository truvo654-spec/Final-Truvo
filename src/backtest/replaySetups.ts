import type {JournalEntry} from '../types';
import type {JournalPlaybook} from '../data/journalPlaybooks';
import type {BacktestRun,WhatIfRun} from './store';
import type {Timeframe,Bar} from './types';
import type {WhatIfRule} from './whatif';
import {defaultSettings} from './rules';
import {resolveSymbol,symbolSpec} from './marketData';
import type {PositionDraft} from './positionReplay';
import {eligible,currencyOf,timestampMs} from '../components/journal/journalMath';
import {compareParameters} from './whatifOptimizer';
import {recommendSetup,type RecommendationGoal} from './recommender';

export interface RelatedReplaySetup {
  id:string;name:string;symbols:string[];playbookId?:string;timeframe?:Timeframe;direction?:'BUY'|'SELL';
  targetR?:number;stopAtr?:number;stopFraction?:number;riskPercent?:number;equity?:number;
  session?:{start:number;end:number};maxTrades?:number;lossesPerDay?:number;dailyLoss?:number;breakevenR?:number;
  prices?:{entry:number;stop:number;target:number};rule?:WhatIfRule;notes:string[];
}
const supportedSymbols=(symbols:string[])=>[...new Set(symbols.map(resolveSymbol).filter((v):v is string=>!!v))];
export function replayRuleFields(rule:WhatIfRule,currency='USD'):Partial<RelatedReplaySetup>{
  switch(rule.kind){
    case 'target':return {targetR:rule.r};
    case 'stop':return {stopFraction:rule.mult};
    case 'breakeven':return {breakevenR:rule.r};
    case 'hours':return {session:{start:rule.start,end:rule.end}};
    case 'lossesPerDay':return {lossesPerDay:rule.n};
    case 'dailyLoss':return currency==='USD'?{dailyLoss:rule.usd}:{notes:[`Daily loss is in ${currency}; USD replay does not convert it.`]};
    case 'mistakes':return {notes:[`Avoid tags: ${rule.tags.join(', ')}. Review these manually; replay does not infer mistake tags.`]};
  }
}
export function relatedReplaySetups(playbooks:JournalPlaybook[],entries:JournalEntry[],whatIfs:WhatIfRun[],runs:BacktestRun[]):RelatedReplaySetup[]{
  const options:RelatedReplaySetup[]=[];
  for(const book of playbooks.filter(p=>p.status!=='archived')){
    const settings=defaultSettings({playbook:book});
    const base:RelatedReplaySetup={id:`playbook:${book.id}`,name:`Playbook · ${book.name}`,playbookId:book.id,
      symbols:supportedSymbols(book.symbols?.length?book.symbols:entries.filter(e=>e.strategy===book.name).map(e=>e.symbol)),timeframe:settings.timeframe,
      targetR:book.benchmarkRR,stopAtr:settings.rules.exits.stop.type==='atr'?settings.rules.exits.stop.mult:undefined,
      riskPercent:book.riskPerTrade,session:book.window?{start:book.window.start,end:book.window.end}:undefined,maxTrades:book.maxTradesPerDay,
      breakevenR:settings.rules.exits.breakevenAtR??undefined,
      notes:['Playbook values are copied to an editable replay draft. Written entry rules and partial/trailing exits remain reference context.']};
    options.push(base);
    for(const scenario of book.scenarios||[]){
      const valid=[scenario.entry,scenario.stop,scenario.target].every(v=>Number.isFinite(v)&&v!>0)&&
        (scenario.bias==='long'?1:-1)*(scenario.entry!-scenario.stop!)>0&&(scenario.bias==='long'?1:-1)*(scenario.target!-scenario.entry!)>0;
      options.push({...base,id:`scenario:${book.id}:${scenario.id}`,name:`Scenario · ${book.name} · ${scenario.symbol} · ${scenario.bias}`,
        symbols:supportedSymbols([scenario.symbol]),direction:scenario.bias==='short'?'SELL':'BUY',
        prices:valid?{entry:scenario.entry!,stop:scenario.stop!,target:scenario.target!}:undefined,
        targetR:valid?Math.abs(scenario.target!-scenario.entry!)/Math.abs(scenario.entry!-scenario.stop!):base.targetR,
        notes:[...base.notes,`Scenario status ${scenario.status}; valid until ${scenario.validUntil}. Review its written trigger manually.`,...(valid?[]:['Incomplete or invalid price levels were not transferred.'])]});
    }
  }
  for(const run of whatIfs){
    const snapshot=run.snapshot;
    const fields=replayRuleFields(run.rule,snapshot?.currency||'Unknown');
    options.push({id:`whatif:${run.id}`,name:`Saved What-if · ${run.name||run.rule.kind}`,
      symbols:supportedSymbols(snapshot?.output.trades.map(t=>t.symbol)||[]),rule:run.rule,...fields,
      notes:[...(fields.notes||[]),'Transfers supported rule parameters, not saved P&L or executions. Replay uses its own candles and position sizing.',...(!snapshot?['Legacy save: benchmark, currency and original trades were not recorded.']:[])]});
  }
  for(const run of runs){
    const s=run.settings,usd=s.risk.currency==='USD',stop=s.rules.exits.stop;
    options.push({id:`backtest:${run.id}`,name:`Saved backtest · ${run.name}`,symbols:supportedSymbols([s.symbol]),playbookId:s.playbookId||undefined,
      timeframe:s.timeframe,direction:s.rules.direction==='both'?undefined:s.rules.direction==='short'?'SELL':'BUY',
      targetR:s.rules.exits.targetR??undefined,stopAtr:stop.type==='atr'?stop.mult:undefined,breakevenR:s.rules.exits.breakevenAtR??undefined,
      riskPercent:s.risk.mode==='percent'?s.risk.percent:usd&&s.risk.mode==='fixedR'?s.risk.fixedR/s.risk.startBalance*100:undefined,
      equity:usd?s.risk.startBalance:undefined,session:s.session.id==='any'?undefined:{start:s.session.start,end:s.session.end},maxTrades:s.rules.maxTradesPerDay??undefined,
      notes:[`Template parameters copied; ${s.risk.currency} results and executions are not transferred. Costs and quantity sizing require manual review.`,...(!usd?['Account equity is not converted to USD.']:[]),...(stop.type!=='atr'?['The saved non-ATR stop needs manual price review.']:[])]});
  }
  return options;
}

/** Price parameters are adapted to this draft's own entry/stop, never copied across instruments. */
export function replayVisibleAtr(bars:Bar[],cursor:number):number{
  const visible=bars.slice(Math.max(0,cursor-14),cursor);
  return visible.length?visible.reduce((sum,b,i)=>{const previous=bars[Math.max(0,cursor-14)+i-1]?.c??b.o;return sum+Math.max(b.h-b.l,Math.abs(b.h-previous),Math.abs(b.l-previous));},0)/visible.length:0;
}
export function applyReplayPositionSetup(draft:PositionDraft,setup:Partial<RelatedReplaySetup>,symbol:string,atr?:number):PositionDraft{
  const next={...draft},spec=symbolSpec(symbol),direction=setup.direction||draft.direction,sign=direction==='BUY'?1:-1;
  if(!spec)throw new Error('Choose a supported replay instrument.');
  next.direction=direction;
  if(setup.equity!==undefined)next.equity=String(setup.equity);
  const matching=setup.symbols?.length===1&&resolveSymbol(setup.symbols[0])===resolveSymbol(symbol);
  if(setup.prices&&matching){next.entry=String(setup.prices.entry);next.stop=String(setup.prices.stop);next.target=String(setup.prices.target);}
  else{
    const entry=Number(next.entry),distance=setup.stopAtr!==undefined&&atr!==undefined?setup.stopAtr*atr:Math.abs(entry-Number(next.stop));
    if(next.entry.trim()&&Number.isFinite(distance)&&distance>0&&(next.stop.trim()||setup.stopAtr!==undefined)){
      const stopDistance=distance*(setup.stopFraction??1);
      next.stop=(entry-sign*stopDistance).toFixed(spec.priceDp);
      if(setup.targetR!==undefined)next.target=(entry+sign*stopDistance*setup.targetR).toFixed(spec.priceDp);
      else if(setup.direction&&next.target.trim())next.target=(entry+sign*Math.abs(Number(next.target)-entry)).toFixed(spec.priceDp);
    }
  }
  const riskDistance=Math.abs(Number(next.entry)-Number(next.stop)),equity=Number(next.equity);
  if(setup.riskPercent!==undefined&&next.stop.trim()&&equity>0&&riskDistance>0){
    const qty=Math.floor(equity*setup.riskPercent/100/(riskDistance*spec.multiplier)/spec.sizeStep+1e-9)*spec.sizeStep;
    next.quantity=String(Number(qty.toFixed(8)));next.unit=spec.sizeUnit;next.multiplier=String(spec.multiplier);
  }
  return next;
}

/** Advice uses prior journal evidence; the replay trade itself and future chart bars cannot rank it. */
export function replayJournalAdvice(entries:JournalEntry[],symbol:string,goal:RecommendationGoal,cutoff=Infinity,excludeId='',playbook='',breakeven=true){
  const history=entries.filter(e=>eligible(e)&&currencyOf(e)==='USD'&&resolveSymbol(e.symbol)===resolveSymbol(symbol)&&
    e.id!==excludeId&&(!playbook||e.strategy===playbook)&&timestampMs(e.exitTime)<cutoff);
  const rules:WhatIfRule[]=[...[1,1.5,2,2.5,3].map(r=>({kind:'target' as const,r})),...[0.5,0.75].map(mult=>({kind:'stop' as const,mult})),...(breakeven?[{kind:'breakeven' as const,r:1}]:[])];
  const rows=compareParameters(history,rules),baseline=rows[0].training.actual;
  const recommendation=recommendSetup(rows.map(row=>({id:row.id,name:row.rule.kind==='target'?`Target ${row.rule.r}R`:row.rule.kind==='stop'?`Stop at ${row.rule.mult} of original risk`:'Breakeven at 1R',metrics:row.training.whatIf,estimated:row.output.estimated,validation:row.validation?{baseline:row.validation.actual,candidate:row.validation.whatIf}:null})),baseline,goal);
  return {history,rows,baseline,recommendation,candidate:rows.find(r=>r.id===recommendation.candidate?.id)||null};
}

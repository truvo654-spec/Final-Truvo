import type {JournalEntry} from '../types';
import type {JournalPlaybook} from '../data/journalPlaybooks';
import type {BacktestRun} from './store';
import type {JournalRules} from './rules';
import {symbolSpec} from './marketData';
import {USD_PER} from './config';
import type {WhatIfEntry,WhatIfRule} from './whatif';
import {currencyOf,eligible} from '../components/journal/journalMath';

export const WHAT_IF_MARKETS=['Forex','Indices','Commodity','Crypto','Stocks'];
export interface WhatIfFilters {from:string;to:string;symbol:string;side:string;market:string;tradeIds:string[]|null}
export function whatIfMarket(entry:WhatIfEntry):string{
 return Number.isFinite(entry.whatIfRecordedNet)?symbolSpec(entry.symbol)?.assetClass??entry.assetClass:entry.assetClass;
}
export function filterWhatIfEntries(entries:WhatIfEntry[],filters:WhatIfFilters):WhatIfEntry[]{
 return entries.filter(e=>(!filters.from||e.date>=filters.from)&&(!filters.to||e.date<=filters.to)&&(!filters.market||whatIfMarket(e)===filters.market)&&(!filters.symbol||e.symbol===filters.symbol)&&(!filters.side||e.direction===filters.side)&&(filters.tradeIds===null||filters.tradeIds.includes(e.id)));
}

/** Keep the user's exact choice first; explore only a few values of that same rule. */
export function quickWhatIfAlternatives(rule:WhatIfRule):WhatIfRule[]{
 let alternatives:WhatIfRule[]=[];
 switch(rule.kind){
  case 'lossesPerDay':alternatives=[1,2,3].map(n=>({kind:rule.kind,n}));break;
  case 'target':case 'breakeven':alternatives=[rule.r-0.5,rule.r+0.5,rule.r+1].filter(r=>Number.isFinite(r)&&r>0).map(r=>({kind:rule.kind,r:Math.round(r*100)/100}));break;
  case 'hours':{
   const duration=((rule.end-rule.start)%24+24)%24||24;
   alternatives=[duration-2,duration-1,duration+1].filter(h=>h>0&&h<=24).map(h=>({kind:rule.kind,start:rule.start,end:rule.start+h===24?24:(rule.start+h)%24}));break;
  }
  case 'mistakes':alternatives=rule.tags.slice(0,3).map(tag=>({kind:rule.kind,tags:[tag]}));break;
  case 'technical':alternatives=rule.conditions.slice(0,3).map((condition,i)=>({...rule,label:rule.label+' · condition '+(i+1),conditions:[condition]}));break;
  case 'dailyLoss':alternatives=[0.5,0.75,1.25].map(scale=>({kind:rule.kind,usd:Math.max(1,Math.round(rule.usd*scale*100)/100)}));break;
  case 'stop':alternatives=[0.5,0.75,0.9].map(mult=>({kind:rule.kind,mult}));break;
 }
 const seen=new Set<string>();
 return [rule,...alternatives].filter(r=>{const key=JSON.stringify(r.kind==='technical'?{kind:r.kind,timeframe:r.timeframe,conditions:r.conditions}:r);if(seen.has(key))return false;seen.add(key);return true;}).slice(0,4).map(r=>structuredClone(r));
}

/** Adapt a saved ledger for one-rule analysis; never write simulated trades into the journal. */
export function whatIfRunEntries(run:BacktestRun):WhatIfEntry[]{
 return run.output.result.trades.map(t=>({id:`whatif:${run.id}:${t.id}`,date:new Date(t.entryTime).toISOString().slice(0,10),symbol:run.symbol,
 assetClass:(symbolSpec(run.symbol)?.marketGroup??symbolSpec(run.symbol)?.assetClass??'Indices') as JournalEntry['assetClass'],
 direction:t.direction==='long'?'BUY':'SELL',entryPrice:t.entryPrice,exitPrice:t.exitPrice,size:t.size,pnl:t.net,commission:0,pnlKnown:true,whatIfRecordedNet:t.net,
 initialRisk:Number.isFinite(t.r)&&Math.abs(t.r)>1e-9&&t.net/t.r>0?t.net/t.r:symbolSpec(run.symbol)?Math.abs(t.entryPrice-t.stopPrice)*t.size*symbolSpec(run.symbol)!.multiplier/USD_PER[run.settings.risk.currency]:null,rMultiple:t.r,outcome:t.net>0?'win':t.net<0?'loss':'breakeven',tradingStatus:'closed',
 strategy:run.name,tags:[],mistakes:[],setupNotes:'Saved sample simulation',emotionBefore:null,emotionAfter:null,followedPlan:null,checklistDone:[],lessons:'',rating:null,source:'manual',
 accountCurrency:run.settings.risk.currency,entryTime:new Date(t.entryTime).toISOString(),exitTime:new Date(t.exitTime).toISOString(),stopPrice:t.stopPrice,takeProfit:t.targetPrice??undefined}));
}
export function quickWhatIfSource(key:string,selection:JournalEntry[],history:JournalEntry[],books:JournalPlaybook[],runs:BacktestRun[],currency:string):{entries:WhatIfEntry[];currency:string;book:JournalPlaybook|undefined;run:BacktestRun|undefined;label:string;excluded:number}{
 const run=key.startsWith('run:')?runs.find(r=>r.id===key.slice(4)):undefined;
 const book=key.startsWith('book:')?books.find(b=>b.id===key.slice(5)):undefined;
 const rows=run?whatIfRunEntries(run).map(e=>({...e,strategy:books.find(b=>b.id===run.playbookId)?.name??e.strategy})):key==='selection'?selection:key==='history'?history:book?history.filter(e=>e.strategy===book.name&&(!book.directions?.length||book.directions.includes(e.direction==='BUY'?'long':'short'))):[];
 const unit=run?.settings.risk.currency??currency;
 const entries=rows.filter(e=>currencyOf(e)===unit&&eligible(e));
 const linked=book??(run?books.find(b=>b.id===run.playbookId):books.find(b=>entries.length>0&&entries.every(e=>e.strategy===b.name)));
 return {entries,currency:unit,book:linked,run,label:run?`${run.name} · ${run.symbol}`:book?`${book.name} journal trades`:key==='history'?'All journal history':'Current journal selection',excluded:rows.length-entries.length};
}
export function quickWhatIfDefaults(book:JournalPlaybook|undefined,run:BacktestRun|undefined,rules:JournalRules){
 const pb=book?.tradingRules;
 const losses=pb?.enabled.stopAfterLosses?pb.values.stopAfterLosses:rules.stopAfterLosses;
 const dailyPct=run?.settings.risk.dailyLossPct;
 return {n:Number.isFinite(losses)&&losses>0?Math.round(losses):2,usd:dailyPct&&run?Math.round(run.settings.risk.startBalance*dailyPct/100):300,
 start:run?.settings.session.start??book?.window?.start??(book?0:7),end:run?.settings.session.end??book?.window?.end??(book?24:16),
 target:run?.settings.rules.exits.targetR??book?.benchmarkRR??2,be:run?.settings.rules.exits.breakevenAtR??1,stop:0.75};
}

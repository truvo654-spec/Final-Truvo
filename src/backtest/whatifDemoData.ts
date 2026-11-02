import type {JournalPlaybook} from '../data/journalPlaybooks';
import type {BacktestRun} from './store';
import type {WhatIfEntry} from './whatif';
import type {WhatIfFilters} from './whatifQuick';
import {marketData,emptySeries,resolveSymbol,sliceSeries,parseDay,dayMs} from './marketData';
import {templateFor} from './rules';
import {getTechnicalStrategyRecipe} from './technicalStrategies';
import {technicalTradeChecks,type TechnicalWhatIfRule} from './whatifTechnical';
import {TF_MS,type Series,type Timeframe} from './types';
import {timestampMs} from '../components/journal/journalMath';
import type {DateRange} from '../components/journal/journalDay';

export interface WhatIfDemoInstrument {symbols:string[];symbol:string|null;timeframe:Timeframe;tradeIds:string[];bars:number;from:string;to:string;available:number;missing:number}
export interface WhatIfDemoMetadata {source:'generated'|'saved-test';version:'generated-v1';loadedAt:string;from:string;to:string;instruments:WhatIfDemoInstrument[]}
export interface WhatIfDemoData {metadata:WhatIfDemoMetadata;series:Map<string,Series>}
export const demoSeriesKey=(symbol:string,tf:Timeframe)=>symbol+'|'+tf;
export function demoWhatIfFeed(data:WhatIfDemoData){return (symbol:string,tf:Timeframe)=>data.series.get(demoSeriesKey(symbol,tf))??emptySeries(symbol,tf,0);}
/** A date change narrows the chosen evidence; clearing it never clears the checked trade IDs. */
export function applyWhatIfDateRange<T extends WhatIfFilters>(scope:T,range:DateRange,all:boolean):T{
 return {...scope,from:all?'':range.from,to:all?'':range.to,tradeIds:scope.tradeIds===null?null:[...scope.tradeIds]};
}
export function whatIfDateBounds(entries:WhatIfEntry[],fallback=new Date().toISOString().slice(0,10)){
 const dates=entries.map(e=>e.date).sort();return {from:dates[0]??fallback,to:dates.at(-1)??fallback};
}
export function whatIfDemoTimeframe(entry:WhatIfEntry,books:JournalPlaybook[],run?:BacktestRun,technical?:TechnicalWhatIfRule):Timeframe{
 if(technical)return technical.timeframe;if(run)return run.settings.timeframe;
 const book=books.find(b=>b.name===entry.strategy);
 return book?(getTechnicalStrategyRecipe(book.technicalRecipeId)?.timeframe??book.instrumentTimeframe??templateFor(book).tf):'15m';
}
/** Align seeded demo prices to the exact evidence and setup. Refresh reuses the same historical seed. */
export function prepareWhatIfDemoData(entries:WhatIfEntry[],books:JournalPlaybook[],run?:BacktestRun,technical?:TechnicalWhatIfRule,now=Date.now()):WhatIfDemoData{
 const groups=new Map<string,{symbol:string|null;tf:Timeframe;entries:WhatIfEntry[]}>();
 for(const entry of entries){const symbol=resolveSymbol(entry.symbol),tf=whatIfDemoTimeframe(entry,books,run,technical),key=demoSeriesKey(symbol??entry.symbol,tf);const group=groups.get(key)??{symbol,tf,entries:[]};group.entries.push(entry);groups.set(key,group);}
 const series=new Map<string,Series>(),instruments:WhatIfDemoInstrument[]=[];
 const periods=technical?.conditions.flatMap(c=>[c.left,c.right]).flatMap(o=>o.kind==='ind'?[o.ind.period??0]:[])??[];
 const warmup=Math.max(200,...periods)+50;
 for(const [key,g] of groups){
  const bounds=whatIfDateBounds(g.entries),times=g.entries.map(e=>timestampMs(e.entryTime)).filter(Number.isFinite),ends=g.entries.flatMap(e=>[timestampMs(e.entryTime),timestampMs(e.exitTime)]).filter(Number.isFinite);
  const first=times.length?Math.min(...times):parseDay(bounds.from),last=ends.length?Math.max(...ends):parseDay(bounds.to)+dayMs;
  let data=emptySeries(g.symbol??g.entries[0].symbol,g.tf,0);
  if(g.symbol){try{data=sliceSeries(marketData.seriesSync(g.symbol,g.tf),first-warmup*TF_MS[g.tf]*4,last+TF_MS[g.tf]);}catch{/* Report an unavailable instrument without substituting another symbol. */}}
  series.set(key,data);
  const available=g.entries.filter(e=>{const at=timestampMs(e.entryTime);return !!e.entryTime&&Number.isFinite(at)&&data.length>0&&at>=data.t[0]+TF_MS[g.tf]&&at<=data.t[data.length-1]+TF_MS[g.tf];}).length;
  instruments.push({symbols:[...new Set(g.entries.map(e=>e.symbol))],symbol:g.symbol,timeframe:g.tf,tradeIds:g.entries.map(e=>e.id),bars:data.length,from:bounds.from,to:bounds.to,available,missing:g.entries.length-available});
 }
 const bounds=whatIfDateBounds(entries),data={metadata:{source:run?'saved-test' as const:'generated' as const,version:'generated-v1' as const,loadedAt:new Date(now).toISOString(),...bounds,instruments},series};
 if(technical){const checks=technicalTradeChecks(entries,technical,demoWhatIfFeed(data));for(const instrument of instruments){instrument.available=instrument.tradeIds.filter(id=>checks.get(id)?.match!==null&&checks.has(id)).length;instrument.missing=instrument.tradeIds.length-instrument.available;}}
 return data;
}

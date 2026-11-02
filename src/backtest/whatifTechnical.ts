import type {JournalEntry} from '../types';
import type {WhatIfRule} from './whatif';
import {createIndicator,indKey,type Indicator} from './indicators';
import {marketData,resolveSymbol} from './marketData';
import {mirrorCondition} from './rules';
import {validatePlaybookConditions} from './playbookConditions';
import {SUPPORTED_TIMEFRAMES,TF_MS,type Condition,type Operand,type Series,type Timeframe} from './types';
import {timestampMs} from '../components/journal/journalMath';

export type TechnicalWhatIfRule=Extract<WhatIfRule,{kind:'technical'}>;
type Check={match:boolean|null;reason:string};
const cache=new WeakMap<Series,Map<string,{long:Int8Array;short:Int8Array}>>();

/** Streaming indicators see each bar once. Unknown readings are distinct from failed conditions. */
function readings(series:Series,rule:TechnicalWhatIfRule){
 let stored=cache.get(series);if(!stored){stored=new Map();cache.set(series,stored);}
 const key=JSON.stringify(rule.conditions),hit=stored.get(key);if(hit)return hit;
 const long=rule.conditions,short=long.map(mirrorCondition),indicators=new Map<string,Indicator>();
 for(const c of [...long,...short])for(const o of [c.left,c.right])if(o.kind==='ind'&&!indicators.has(indKey(o.ind)))indicators.set(indKey(o.ind),createIndicator(o.ind));
 const result={long:new Int8Array(series.length),short:new Int8Array(series.length)};
 const value=(o:Operand,i:number,prev=false):number=>o.kind==='value'?o.value:o.kind==='price'?(i-(prev?1:0)<0?NaN:series[{open:'o',high:'h',low:'l',close:'c'}[o.field] as 'o'][i-(prev?1:0)]):prev?indicators.get(indKey(o.ind))!.prev:indicators.get(indKey(o.ind))!.value;
 const test=(conditions:Condition[],i:number)=>{
  const checks=conditions.map(c=>{const a=value(c.left,i),b=value(c.right,i),pa=value(c.left,i,true),pb=value(c.right,i,true);
   if(![a,b].every(Number.isFinite)||((c.op==='crossAbove'||c.op==='crossBelow')&&![pa,pb].every(Number.isFinite)))return -1;
   return (c.op==='gt'?a>b:c.op==='lt'?a<b:c.op==='crossAbove'?pa<=pb&&a>b:pa>=pb&&a<b)?1:0;});
  return checks.includes(-1)?-1:checks.every(v=>v===1)?1:0;
 };
 for(let i=0;i<series.length;i++){
  for(const indicator of indicators.values())indicator.update(series.t[i],series.o[i],series.h[i],series.l[i],series.c[i],series.v[i]);
  result.long[i]=test(long,i);result.short[i]=test(short,i);
 }
 if(stored.size>=8)stored.delete(stored.keys().next().value!);stored.set(key,result);return result;
}

/** Only the latest fully completed candle before entry may determine inclusion. */
export function technicalTradeChecks(entries:JournalEntry[],rule:TechnicalWhatIfRule,feed:(symbol:string,tf:Timeframe)=>Series=(symbol,tf)=>marketData.seriesSync(symbol,tf)):Map<string,Check>{
 const result=new Map<string,Check>(),error=validatePlaybookConditions(rule.conditions,500);
 for(const entry of entries){
  const unknown=(reason:string)=>result.set(entry.id,{match:null,reason});
  if(error||!SUPPORTED_TIMEFRAMES.includes(rule.timeframe)){unknown('Invalid technical setup');continue;}
  const at=timestampMs(entry.entryTime),symbol=resolveSymbol(entry.symbol);
  if(!entry.entryTime||!Number.isFinite(at)){unknown('Entry time not recorded');continue;}
  if(!symbol){unknown('No demo prices for this instrument');continue;}
  const series=feed(symbol,rule.timeframe),ms=TF_MS[rule.timeframe];
  if(!series.length||at<series.t[0]+ms||at>series.t[series.length-1]+ms){unknown('Entry is outside demo price coverage');continue;}
  let lo=0,hi=series.length;while(lo<hi){const mid=(lo+hi)>>>1;if(series.t[mid]+ms<=at)lo=mid+1;else hi=mid;}
  const i=lo-1;
  // Do not carry Friday or a prior session's signal across a gap in price coverage.
  if(i<0||at-series.t[i]>2*ms){unknown('No recent completed demo candle');continue;}
  const values=readings(series,rule),match=(entry.direction==='BUY'?values.long:values.short)[i];
  if(match<0){unknown('Indicators need more completed candles');continue;}
  result.set(entry.id,{match:match===1,reason:match===1?'Technical conditions passed on completed demo candles':'Technical conditions not met on completed demo candles'});
 }
 return result;
}

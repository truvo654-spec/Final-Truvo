import type {JournalEntry} from '../../types';
import type {Bar,Timeframe} from '../../backtest/types';
import {SUPPORTED_TIMEFRAMES} from '../../backtest/types';
import {marketData,resolveSymbol,sliceSeries,symbolSpec} from '../../backtest/marketData';
import {eligible,netOf,realizedR,timestampMs} from './journalMath';
import {instrumentKey} from './playbookExecution';
import type {ExecutionPoint} from './playbookComparison';
export const priceTimeframe=(from:string,to:string):Timeframe=>{
  const days=(Date.parse(to)-Date.parse(from))/86400000;
  return days>45?'1D':days>10?'4h':days>3?'1h':'15m';
};
/** Chart intervals can aggregate the feed's 5-minute bars without changing test rules. */
export type PriceChartInterval = `${number}${'m'|'h'|'D'|'W'|'M'}`;
export type PriceIntervalUnit = 'm'|'h'|'D'|'W'|'M';
export const PRICE_INTERVAL_GROUPS:{label:string;options:{value:PriceChartInterval;label:string}[]}[]=[
  {label:'Minutes',options:[5,10,15,30,45].map(n=>({value:`${n}m`,label:`${n} minutes`}))},
  {label:'Hours',options:[1,2,3,4].map(n=>({value:`${n}h`,label:`${n} ${n===1?'hour':'hours'}`}))},
  {label:'Days, weeks and months',options:[{value:'1D',label:'1 day'},{value:'1W',label:'1 week'},{value:'1M',label:'1 month'},{value:'3M',label:'3 months'},{value:'6M',label:'6 months'},{value:'12M',label:'12 months'}]},
];
const UNIT_LIMITS:Record<PriceIntervalUnit,number>={m:1440,h:24,D:365,W:52,M:12};
export function customPriceInterval(count:number,unit:PriceIntervalUnit):PriceChartInterval|null {
  if(!Number.isInteger(count)||count<1||count>UNIT_LIMITS[unit]||(unit==='m'&&count%5!==0))return null;
  return `${count}${unit}`;
}
function intervalParts(interval:PriceChartInterval) {
  const match=/^(\d+)([mhDWM])$/.exec(interval);
  if(!match)return null;
  const count=Number(match[1]),unit=match[2] as PriceIntervalUnit;
  return customPriceInterval(count,unit)?{count,unit}:null;
}
export function selectedPriceInterval(choice:'auto'|PriceChartInterval,from:string,to:string,tradeInterval?:Timeframe):PriceChartInterval {
  if(choice!=='auto'&&intervalParts(choice))return choice;
  if(tradeInterval&&intervalParts(tradeInterval as PriceChartInterval))return tradeInterval as PriceChartInterval;
  return priceTimeframe(from,to) as PriceChartInterval;
}
const fixedIntervalMs=({count,unit}:{count:number;unit:PriceIntervalUnit})=>count*({m:60000,h:3600000,D:86400000,W:604800000,M:0}[unit]);
function intervalBucket(time:number,parts:{count:number;unit:PriceIntervalUnit}):number {
  if(parts.unit==='M'){
    const date=new Date(time),month=Math.floor((date.getUTCFullYear()*12+date.getUTCMonth())/parts.count)*parts.count;
    return Date.UTC(Math.floor(month/12),month%12,1);
  }
  // Weeks begin on Monday, in UTC.
  const anchor=parts.unit==='W'?Date.UTC(1970,0,5):0,ms=fixedIntervalMs(parts);
  return Math.floor((time-anchor)/ms)*ms+anchor;
}
function intervalEnd(time:number,parts:{count:number;unit:PriceIntervalUnit}):number {
  if(parts.unit!=='M')return intervalBucket(time,parts)+fixedIntervalMs(parts);
  const date=new Date(intervalBucket(time,parts));
  return Date.UTC(date.getUTCFullYear(),date.getUTCMonth()+parts.count,1);
}
export function executionPriceBars(symbol:string,from:string,to:string,tf:PriceChartInterval):Bar[] {
  const resolved=resolveSymbol(symbol),parts=intervalParts(tf);if(!resolved||!parts)return [];
  const start=Date.parse(from+'T00:00:00Z'),end=Date.parse(to+'T00:00:00Z')+86400000;
  if(!Number.isFinite(start)||!Number.isFinite(end)||start>=end)return [];
  if(SUPPORTED_TIMEFRAMES.includes(tf as Timeframe)){
    const data=sliceSeries(marketData.seriesSync(resolved,tf as Timeframe),start,end);
    return Array.from({length:data.length},(_,i)=>({t:data.t[i],o:data.o[i],h:data.h[i],l:data.l[i],c:data.c[i],v:data.v[i]}));
  }
  const data=sliceSeries(marketData.seriesSync(resolved,'5m'),start,end),bars:Bar[]=[];
  for(let i=0;i<data.length;i++){
    const bucket=intervalBucket(data.t[i],parts),last=bars.at(-1);
    if(!last||intervalBucket(last.t,parts)!==bucket){
      // A first partial candle starts at the selected date, never before it.
      bars.push({t:Math.max(bucket,start),o:data.o[i],h:data.h[i],l:data.l[i],c:data.c[i],v:data.v[i]});
    }else{last.h=Math.max(last.h,data.h[i]);last.l=Math.min(last.l,data.l[i]);last.c=data.c[i];last.v+=data.v[i];}
  }
  return bars;
}
export function priceBarAt(bars:Bar[],at:number,tf:PriceChartInterval):number|null {
  const parts=intervalParts(tf);
  if(!parts||!bars.length||!Number.isFinite(at)||at<bars[0].t||at>intervalEnd(bars.at(-1)!.t,parts))return null;
  let lo=0,hi=bars.length;while(lo<hi){const mid=(lo+hi)>>>1;if(bars[mid].t<=at)lo=mid+1;else hi=mid;}
  return Math.max(0,lo-1);
}
/** Inclusive display window ends at the next candle boundary, capped by the chosen dates. */
export function priceWindowEnd(bars:Bar[],to:number,tf:PriceChartInterval,scopeEnd:number):number {
  if(to<1||!bars.length)return scopeEnd;
  const parts=intervalParts(tf);if(!parts)return scopeEnd;
  return Math.min(scopeEnd,bars[to]?.t??scopeEnd,intervalEnd(bars[Math.min(to,bars.length)-1].t,parts));
}
export function journalExecutionPoints(entries:JournalEntry[],symbol:string):ExecutionPoint[] {
  return entries.filter(e=>instrumentKey(e.symbol)===instrumentKey(symbol)).map(journal=>({id:journal.id,at:timestampMs(journal.exitTime||journal.entryTime||journal.date),entryAt:timestampMs(journal.entryTime||journal.date),symbol:journal.symbol,net:netOf(journal),r:realizedR(journal),journal})).filter(point=>Number.isFinite(point.entryAt));
}
export function recordedFillAnchors(point:ExecutionPoint) {
  const entry=point.journal;
  if(!entry)return [];
  const anchors:{kind:'entry'|'exit';time:number;price:number;dayOnly:boolean}[]=[];
  const at=timestampMs(entry.entryTime||entry.date);
  if(Number.isFinite(at)&&Number.isFinite(entry.entryPrice))anchors.push({kind:'entry',time:at,price:entry.entryPrice,dayOnly:!entry.entryTime});
  if(entry.exitTime&&entry.exitPrice!==null&&Number.isFinite(entry.exitPrice)&&Number.isFinite(timestampMs(entry.exitTime)))anchors.push({kind:'exit',time:timestampMs(entry.exitTime),price:entry.exitPrice,dayOnly:false});
  return anchors;
}
export const pointNetKnown=(point:ExecutionPoint)=>point.trade?true:!!point.journal&&eligible(point.journal);


export type TimeWindow=[number,number];
/** Calendar-aware shifts for the recorded-fill timeline; no price bars are generated. */
export function shiftPriceInterval(at:number,tf:PriceChartInterval,steps:number):number {
  const parts=intervalParts(tf);if(!parts)return at;
  if(parts.unit!=='M')return at+fixedIntervalMs(parts)*steps;
  const date=new Date(at),day=date.getUTCDate();
  date.setUTCDate(1);date.setUTCMonth(date.getUTCMonth()+parts.count*steps);
  const lastDay=new Date(Date.UTC(date.getUTCFullYear(),date.getUTCMonth()+1,0)).getUTCDate();
  date.setUTCDate(Math.min(day,lastDay));return date.getTime();
}
export function clampTimeWindow(view:TimeWindow,scope:TimeWindow):TimeWindow {
  const size=Math.min(scope[1]-scope[0],Math.max(1,view[1]-view[0]));
  const start=Math.max(scope[0],Math.min(scope[1]-size,view[0]));
  return [start,start+size];
}
export function resizeTimeWindow(view:TimeWindow,scope:TimeWindow,factor:number,minimum:number):TimeWindow {
  const size=Math.min(scope[1]-scope[0],Math.max(minimum,Math.round((view[1]-view[0])*factor))),center=(view[0]+view[1])/2;
  return clampTimeWindow([Math.round(center-size/2),Math.round(center-size/2)+size],scope);
}
export function shiftTimeWindow(view:TimeWindow,scope:TimeWindow,direction:number):TimeWindow {
  const step=Math.round((view[1]-view[0])/2)*direction;
  return clampTimeWindow([view[0]+step,view[1]+step],scope);
}
export function recordedFocusInterval(point:ExecutionPoint):PriceChartInterval {
  const anchors=recordedFillAnchors(point);
  if(anchors.some(a=>a.dayOnly)||!anchors.length)return '1D';
  const times=anchors.map(a=>a.time);
  return priceTimeframe(new Date(Math.min(...times)).toISOString().slice(0,10),new Date(Math.max(...times)).toISOString().slice(0,10)) as PriceChartInterval;
}
export function recordedFocusWindow(point:ExecutionPoint,scope:TimeWindow,tf:PriceChartInterval):TimeWindow {
  const anchors=recordedFillAnchors(point),parts=intervalParts(tf);
  if(!anchors.length||!parts)return scope;
  const times=anchors.map(a=>a.time),first=intervalBucket(Math.min(...times),parts),last=intervalBucket(Math.max(...times),parts);
  return clampTimeWindow([shiftPriceInterval(first,tf,-8),shiftPriceInterval(last,tf,9)],scope);
}
export function recordedTimeTicks(from:number,to:number,tf:PriceChartInterval):number[] {
  const parts=intervalParts(tf);if(!parts||to<=from)return [];
  let at=intervalBucket(from,parts);if(at<from)at=shiftPriceInterval(at,tf,1);
  const period=Math.max(1,shiftPriceInterval(at,tf,1)-at),stride=Math.max(1,Math.ceil((to-from)/period/5));
  const ticks:number[]=[];
  while(at<to&&ticks.length<7){ticks.push(at);at=shiftPriceInterval(at,tf,stride);}
  return ticks;
}
export function recordedTradeLevels(point:ExecutionPoint|null) {
  const entry=point?.journal;if(!entry)return [];
  return [
    {price:entry.entryPrice,label:'Entry',color:'#5338ec'},
    {price:entry.exitPrice,label:'Exit',color:'#0d9488'},
    {price:entry.stopPrice,label:'Stop',color:'#e11d48',dashed:true},
    {price:entry.takeProfit,label:'Target',color:'#059669',dashed:true},
  ].filter(level=>typeof level.price==='number'&&Number.isFinite(level.price)) as {price:number;label:string;color:string;dashed?:boolean}[];
}


/** A stable demo price scale, anchored once to the earliest recorded entry, never to exits or P&L. */
export function journalDemoAnchor(entries:JournalEntry[],symbol:string) {
  return entries.filter(entry=>instrumentKey(entry.symbol)===instrumentKey(symbol)&&Number.isFinite(entry.entryPrice)&&entry.entryPrice>0&&Number.isFinite(timestampMs(entry.entryTime||entry.date)))
    .sort((a,b)=>timestampMs(a.entryTime||a.date)-timestampMs(b.entryTime||b.date)||a.id.localeCompare(b.id))[0];
}
export function journalDemoPriceBars(symbol:string,from:string,to:string,tf:PriceChartInterval,anchor?:JournalEntry):Bar[] {
  const bars=executionPriceBars(symbol,from,to,tf),resolved=resolveSymbol(symbol);
  if(!bars.length||!resolved)return [];
  let scale=1;
  if(anchor&&anchor.entryPrice>0){
    const base=marketData.seriesSync(resolved,'5m'),at=timestampMs(anchor.entryTime||anchor.date);
    if(at>=base.t[0]&&at<base.t[base.length-1]+300000){
      let lo=0,hi=base.length;while(lo<hi){const mid=(lo+hi)>>>1;if(base.t[mid]<=at)lo=mid+1;else hi=mid;}
      const reference=base.o[Math.max(0,lo-1)];if(reference>0)scale=anchor.entryPrice/reference;
    }
  }
  const dp=symbolSpec(symbol)?.priceDp??4,round=(value:number)=>Number((value*scale).toFixed(dp));
  return bars.map(bar=>({...bar,o:round(bar.o),h:round(bar.h),l:round(bar.l),c:round(bar.c)}));
}

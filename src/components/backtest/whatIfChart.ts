import type {WhatIfTrade} from '../../backtest/whatif';
import {executionCurve} from '../journal/executionChartData';
import type {LineSeries} from './charts';
import type {Marker} from './charts';
import type {JournalEntry} from '../../types';
import type {Bar} from '../../backtest/types';
import {priceBarAt,type PriceChartInterval} from '../journal/executionPriceStudy';
import {linkedValueAt} from './linkedPerformance';

/** Reuse Playbook close-time grouping; drawdown is monetary, with no assumed balance. */
export function whatIfPerformance(trades:WhatIfTrade[],actual:boolean){
 const included=trades.filter(t=>actual||t.status!=='skipped');
 const nodes=executionCurve(included.map(t=>({id:t.id,at:t.exitTime,entryAt:t.entryTime,symbol:t.symbol,net:actual?t.actualNet:t.newNet,r:actual?t.actualR:t.newR})),0);
 return {nodes,count:included.length,net:nodes.at(-1)?.cumulative??0,maxDD:Math.max(0,...nodes.map(n=>n.drawdown))};
}

export function whatIfRecordedMarkers(trades:WhatIfTrade[],entries:JournalEntry[],bars:Bar[],symbol:string,interval:PriceChartInterval,scenario:string,color:string,source=scenario):Marker[]{
 const recorded=new Map(entries.map(entry=>[entry.id,entry]));
 return trades.filter(trade=>trade.symbol===symbol).flatMap(trade=>{
  const entry=recorded.get(trade.id);
  if(!entry)return [];
  return (['entry','exit'] as const).flatMap(kind=>{
   const time=kind==='entry'?trade.entryTime:trade.exitTime;
   const price=kind==='entry'?entry.entryPrice:entry.exitPrice;
   const timestamp=kind==='entry'?entry.entryTime:entry.exitTime;
   const index=priceBarAt(bars,time,interval);
   if(!timestamp||index===null||price==null||!Number.isFinite(price))return [];
   return [{id:trade.id+':'+kind,index,time,price,kind:kind==='exit'?'exit' as const:trade.direction==='BUY'?'buy' as const:'sell' as const,source:trade.status==='skipped'?source+' (skipped)':source,color:trade.status==='skipped'?'#94a3b8':color,label:`${scenario} · ${kind==='entry'?'Recorded entry':'Recorded exit'} · ${trade.direction==='BUY'?'Long':'Short'} · ${trade.status}`,showLabel:false}];
  });
 });
}

/** Carry the last known close into the viewport without reading any later close. */
export function windowWhatIfSeries(series:LineSeries[],start:number,end:number):LineSeries[]{
 return series.map(s=>{const points=s.points.map(p=>({at:p.x,value:p.y}));return {...s,points:[{x:start,y:linkedValueAt(points,start)},...s.points.filter(p=>p.x>start&&p.x<end),{x:end,y:linkedValueAt(points,end)}]};});
}

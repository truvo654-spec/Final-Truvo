import type {Bar,BacktestTrade,BacktestSettings,Series,Timeframe} from './types';
import {TF_MS} from './types';
import {createRun} from './engine';

/** Replay the saved engine series, without generating a different demo path. */
export function resultTradeReplay(series:Series,trade:BacktestTrade,sameClose=false){
 const empty={bars:[] as Bar[],entryIndex:0,exitIndex:0,start:0,sourceOffset:0};
 if(!series.length||!Number.isFinite(trade.entryTime)||!Number.isFinite(trade.exitTime)||trade.exitTime<trade.entryTime)return empty;
 const step=TF_MS[series.tf];
 if(trade.entryTime<series.t[0]||trade.exitTime>series.t[series.length-1]+step)return empty;
 const index=(time:number,atClose:boolean)=>{
  const target=time-(atClose?1:0);let lo=0,hi=series.length;
  while(lo<hi){const mid=(lo+hi)>>>1;if(series.t[mid]<=target)lo=mid+1;else hi=mid;}
  return Math.max(0,lo-1);
 };
 const entry=index(trade.entryTime,sameClose&&trade.orderType==='market');
 const exit=index(trade.exitTime,['time','session end','signal','rule limit','end of test'].includes(trade.exitReason));
 if(exit<entry)return empty;
 const first=Math.max(0,entry-24),bars:Bar[]=[];
 for(let i=first;i<=exit;i++)bars.push({t:series.t[i],o:series.o[i],h:series.h[i],l:series.l[i],c:series.c[i],v:series.v[i]});
 return {bars,entryIndex:entry-first,exitIndex:exit-first,start:entry-first+1,sourceOffset:first};
}

/** Group only revealed candles, including a forming higher-timeframe candle. */
export function replayCandleGroups(bars:Bar[],cursor:number,timeframe:Timeframe){
 const grouped:Bar[]=[],ms=TF_MS[timeframe];
 if(!ms)return grouped;
 for(const bar of bars.slice(0,cursor)){
  const t=Math.floor(bar.t/ms)*ms,last=grouped.at(-1);
  if(last?.t===t){last.h=Math.max(last.h,bar.h);last.l=Math.min(last.l,bar.l);last.c=bar.c;last.v+=bar.v;}
  else grouped.push({...bar,t});
 }
 return grouped;
}

export interface ReplayPerformancePoint {at:number;net:number;drawdown:number;maxDrawdown:number;stop:number|null;remaining:number}
/** Reconstruct the saved engine position, including partials and costs, on its native candles. */
export function replayTradePerformance(settings:BacktestSettings,series:Series,trade:BacktestTrade,data=resultTradeReplay(series,trade,settings.costs.fillModel==='sameClose')):ReplayPerformancePoint[]|null{
 if(!data.bars.length)return null;
 const handle=createRun(settings,series),points:ReplayPerformancePoint[]=[];
 const first=data.sourceOffset+data.entryIndex;
 if(first)handle.step(first);
 let peak=0,maxDrawdown=0;
 for(let i=data.entryIndex;i<=data.exitIndex;i++){
  handle.step(1);
  const snapshot=handle.snapshot(),position=snapshot.position;
  const closed=snapshot.trades.find(t=>t.id===trade.id&&t.entryTime===trade.entryTime&&t.direction===trade.direction);
  if(closed&&(closed.exitTime!==trade.exitTime||Math.abs(closed.net-trade.net)>0.00001||Math.abs(closed.size-trade.size)>0.00001))return null;
  const net=closed?closed.net:position?.entryTime===trade.entryTime?position.realizedPartialNet+position.unrealizedNet:null;
  if(net===null||!Number.isFinite(net))return null;
  peak=Math.max(peak,net);const drawdown=Math.max(0,peak-net);maxDrawdown=Math.max(maxDrawdown,drawdown);
  points.push({at:data.bars[i].t,net,drawdown,maxDrawdown,stop:closed?null:position!.stop,remaining:closed?0:position!.remaining});
  if(i===data.exitIndex&&!closed)return null;
 }
 return points;
}

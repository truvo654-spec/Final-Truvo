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

/** Illustrative 1-minute candles inside each feed candle: deterministic, and they keep the parent's open, high, low and close. */
export function splitReplayCandles(bars:Bar[],parentMs:number,childMs=60000):Bar[]{
 const n=Math.max(1,Math.round(parentMs/childMs));if(n<=1)return bars.map(b=>({...b}));
 const out:Bar[]=[];
 for(const bar of bars){
  let seed=Math.floor(bar.t/childMs)%2147483647||1;const rnd=()=>(seed=seed*16807%2147483647)/2147483647;
  let ih=Math.floor(rnd()*n),il=Math.floor(rnd()*n);if(il===ih)il=(ih+1+Math.floor(rnd()*(n-1)))%n;
  const keys=[[0,bar.o],[ih+1,bar.h],[il+1,bar.l],[n,bar.c]].sort((a,b)=>a[0]-b[0]);
  const path:number[]=[];
  for(let k=0;k<=n;k++){
   let j=0;while(j<keys.length-2&&keys[j+1][0]<k)j++;
   const [x0,y0]=keys[j],[x1,y1]=keys[j+1];const f=x1===x0?1:(k-x0)/(x1-x0);
   const base=y0+(y1-y0)*f,noise=(rnd()-.5)*(bar.h-bar.l)*.15*(k===0||k===n||k===ih+1||k===il+1?0:1);
   path.push(Math.min(bar.h,Math.max(bar.l,base+noise)));
  }
  path[ih+1]=bar.h;path[il+1]=bar.l;path[0]=bar.o;path[n]=bar.c;
  for(let k=0;k<n;k++){
   const o=k===0?bar.o:path[k],c=path[k+1];
   let h=Math.max(o,c),l=Math.min(o,c);if(k===ih)h=bar.h;if(k===il)l=bar.l;
   out.push({t:bar.t+k*childMs,o,h,l,c,v:bar.v/n});
  }
 }
 return out;
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

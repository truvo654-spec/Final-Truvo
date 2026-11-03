import React,{useEffect,useMemo,useState} from 'react';
import type {JournalEntry} from '../../types';
import type {Bar} from '../../backtest/types';
import type {WhatIfTrade} from '../../backtest/whatif';
import {symbolSpec} from '../../backtest/marketData';
import {executionPriceBars,journalDemoAnchor,journalDemoPriceBars,selectedPriceInterval,type PriceChartInterval} from '../journal/executionPriceStudy';
import {CandleChart,type Marker} from './charts';
import {ChartTimeframeSelect} from './ChartTimeframeSelect';
import {btnSecondary,inputBase} from './ui';
import {Pause,Play} from 'lucide-react';

const WINDOW=120;
const day=(t:number)=>new Date(t).toISOString().slice(0,10);
const stamp=(t:number)=>new Date(t).toISOString().slice(0,16).replace('T',' ');
function nearestBar(bars:Bar[],time:number){
 if(!bars.length)return -1;
 let lo=0,hi=bars.length;
 while(lo<hi){const mid=(lo+hi)>>>1;if(bars[mid].t<time)lo=mid+1;else hi=mid;}
 if(lo===0)return 0;if(lo===bars.length)return bars.length-1;
 return time-bars[lo-1].t<=bars[lo].t-time?lo-1:lo;
}

interface Props{trades:WhatIfTrade[];entries:JournalEntry[];simulation:boolean;money:(n:number)=>string;scenario:string;markerSource?:string;scenarioColor?:string;onTrades?:()=>void}
/** Market price candles for the What-if result: entries and exits marked, with original vs What-if result per trade. */
export function WhatIfPriceChart({trades,entries,simulation,money,scenario,markerSource=scenario,scenarioColor='#5338ec',onTrades}:Props){
 const symbols=useMemo(()=>{const count=new Map<string,number>();trades.forEach(t=>count.set(t.symbol,(count.get(t.symbol)??0)+1));return [...count].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0])).map(([s])=>s);},[trades]);
 const [picked,setPicked]=useState('');
 const symbol=symbols.includes(picked)?picked:symbols[0]??'';
 const [tfChoice,setTfChoice]=useState<'auto'|PriceChartInterval>('auto');
 const [playing,setPlaying]=useState(false);
 const [end,setEnd]=useState<number|null>(null);
 const [size,setSize]=useState(WINDOW);
 const own=useMemo(()=>trades.filter(t=>t.symbol===symbol&&Number.isFinite(t.entryTime)&&Number.isFinite(t.exitTime)),[trades,symbol]);
 const times=own.flatMap(t=>[t.entryTime,t.exitTime]);
 const from=times.length?day(Math.min(...times)):'',to=times.length?day(Math.max(...times)):'';
 const autoTf=from?selectedPriceInterval('auto',from,to):'1h' as PriceChartInterval;
 const tf=from?selectedPriceInterval(tfChoice,from,to):autoTf;
 const byId=useMemo(()=>new Map(entries.map(e=>[e.id,e])),[entries]);
 const anchorKey=symbol+'|'+entries.length;
 const bars=useMemo(()=>{
  if(!symbol||!from)return [] as Bar[];
  return simulation?executionPriceBars(symbol,from,to,tf):journalDemoPriceBars(symbol,from,to,tf,journalDemoAnchor(entries,symbol));
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[symbol,from,to,tf,simulation,anchorKey]);
 useEffect(()=>{setEnd(null);setSize(WINDOW);setPlaying(false);},[symbol,tf,from,to]);
 const {markers,events}=useMemo(()=>{
  const markers:Marker[]=[],events=new Map<number,{trade:WhatIfTrade;kind:'entry'|'exit'}[]>();
  const add=(trade:WhatIfTrade,kind:'entry'|'exit')=>{
   const time=kind==='entry'?trade.entryTime:trade.exitTime,index=nearestBar(bars,time);if(index<0)return;
   const e=byId.get(trade.id),recorded=kind==='entry'?e?.entryPrice:e?.exitPrice;
   const bar=bars[index],price=typeof recorded==='number'&&Number.isFinite(recorded)&&recorded>=bar.l*0.98&&recorded<=bar.h*1.02?recorded:bar.c;
   const color=trade.status==='skipped'?'#94a3b8':scenarioColor;
   markers.push({index,price,kind:kind==='exit'?'exit':trade.direction==='BUY'?'buy':'sell',source:trade.status==='skipped'?markerSource+' (skipped)':markerSource,color,label:`${scenario} · ${kind==='entry'?'Entry':'Exit'} · ${trade.direction==='BUY'?'Long':'Short'}${trade.status==='skipped'?' · skipped':''}`,showLabel:false,id:trade.id+':'+kind});
   events.set(bar.t,[...(events.get(bar.t)??[]),{trade,kind}]);
  };
  own.forEach(t=>{add(t,'entry');add(t,'exit');});
  return {markers,events};
 },[bars,own,byId,scenario,markerSource,scenarioColor]);
 const curves=useMemo(()=>{
  const at=new Map<number,{a:number;w:number}>();
  own.forEach(t=>{const i=nearestBar(bars,t.exitTime);if(i<0)return;const v=at.get(i)??{a:0,w:0};v.a+=t.actualNet;v.w+=t.newNet;at.set(i,v);});
  let a=0,w=0;const original:{x:number;y:number}[]=[],whatIf:{x:number;y:number}[]=[];
  bars.forEach((bar,i)=>{const v=at.get(i);if(v){a+=v.a;w+=v.w;}original.push({x:bar.t,y:a});whatIf.push({x:bar.t,y:w});});
  return {original,whatIf};
 },[bars,own]);
 const stepSize=Math.max(1,Math.round(bars.length/240));
 useEffect(()=>{
  if(!playing)return;
  const id=window.setInterval(()=>setEnd(current=>{const next=Math.min(bars.length,(current??bars.length)+stepSize);if(next>=bars.length)setPlaying(false);return next;}),120);
  return ()=>window.clearInterval(id);
 },[playing,bars.length,stepSize]);
 if(!symbols.length)return null;
 const span=Math.min(size,bars.length),hi=bars.length?Math.max(Math.min(10,bars.length),Math.min(end??bars.length,bars.length)):0,lo=Math.max(0,hi-span);
 const changed=own.filter(t=>t.status==='changed').length,skipped=own.filter(t=>t.status==='skipped').length;
 const cursor=hi>0?hi-1:0,origNow=curves.original[cursor]?.y??0,whatNow=curves.whatIf[cursor]?.y??0,closedNow=hi>0?own.filter(t=>t.exitTime<=bars[cursor].t+1).length:0;
 const play=()=>{if(playing){setPlaying(false);return;}if(hi>=bars.length)setEnd(Math.min(10,bars.length));setPlaying(true);};
 return <section className="mt-5 rounded-xl border border-[#CCC6FB] p-4" aria-label="What-if market price chart">
  <div className="flex flex-wrap items-start justify-between gap-3">
   <div className="min-w-0"><h3 className="text-sm font-bold">Market price · {symbol}</h3><p className="mt-1 text-xs text-slate-500">{scenario} · {own.length} trade{own.length===1?'':'s'} on this instrument · {changed} changed · {skipped} skipped. Hover a candle to compare the original and What-if result.</p></div>
   <div className="flex flex-wrap items-end gap-2">
    {symbols.length>1&&<label className="flex items-center gap-2 text-xs text-slate-500">Instrument<select aria-label="What-if price chart instrument" className={inputBase} value={symbol} onChange={e=>setPicked(e.target.value)}>{symbols.map(s=><option key={s}>{s}</option>)}</select></label>}
    <ChartTimeframeSelect value={tfChoice} autoInterval={autoTf} onChange={setTfChoice}/>
    <div className="flex gap-1"><button type="button" className={btnSecondary} aria-label={playing?'Pause timeline':'Play timeline'} aria-pressed={playing} disabled={!bars.length} onClick={play}>{playing?<Pause size={14}/>:<Play size={14}/>}{playing?'Pause':'Play'}</button><button type="button" className={btnSecondary} aria-label="Zoom in price chart" disabled={span<=20} onClick={()=>setSize(s=>Math.max(20,Math.round(Math.min(s,bars.length)/2)))}>+</button><button type="button" className={btnSecondary} aria-label="Zoom out price chart" disabled={span>=Math.min(400,bars.length)} onClick={()=>setSize(s=>Math.min(400,s*2))}>−</button></div>
   </div>
  </div>
  {bars.length?<>
   <div className="mt-3 grid gap-2 sm:grid-cols-4 text-xs" role="status" aria-live="off" aria-label="Linked timeline results">
    <div className="rounded-lg bg-slate-50 px-3 py-2"><p className="text-[10px] uppercase tracking-wide text-slate-500">Timeline at</p><p className="mt-0.5 font-mono font-semibold">{stamp(bars[cursor].t)}</p></div>
    <div className="rounded-lg bg-slate-50 px-3 py-2"><p className="text-[10px] uppercase tracking-wide text-slate-500">Original net</p><p className="mt-0.5 font-mono font-semibold">{money(origNow)}</p></div>
    <div className="rounded-lg bg-[#F6F3FF] px-3 py-2"><p className="text-[10px] uppercase tracking-wide text-[#5338ec]">What-if net</p><p className="mt-0.5 font-mono font-semibold">{money(whatNow)}</p></div>
    <div className="rounded-lg bg-slate-50 px-3 py-2"><p className="text-[10px] uppercase tracking-wide text-slate-500">Difference · {closedNow}/{own.length} closed</p><p className={`mt-0.5 font-mono font-semibold ${whatNow-origNow>0?'text-emerald-600':whatNow-origNow<0?'text-rose-600':''}`}>{money(whatNow-origNow)}</p></div>
   </div>
   <div className="mt-3"><CandleChart label={`${symbol} ${tf} market price with What-if trades`} bars={bars} from={lo} to={hi} height={300} dp={symbolSpec(symbol)?.priceDp??2} markers={markers} responsive showTimeAxis interactive pnl={{series:[{name:'Original',color:'#94a3b8',dashed:true,points:curves.original},{name:scenario,color:scenarioColor,points:curves.whatIf}],detail:time=>{const i=nearestBar(bars,time);return <p>Closed so far · Original {money(curves.original[i]?.y??0)} · What-if {money(curves.whatIf[i]?.y??0)}</p>;}}} onMarkerClick={onTrades?()=>onTrades():undefined} tooltipDetail={time=>{const list=events.get(time);return list?.length?<div className="mt-1 space-y-0.5 border-t border-white/20 pt-1">{list.map(({trade,kind})=><p key={trade.id+kind}>{kind==='entry'?'Entry':'Exit'} · {trade.direction==='BUY'?'Long':'Short'} · {stamp(kind==='entry'?trade.entryTime:trade.exitTime)}{kind==='exit'?` · Original ${money(trade.actualNet)} → What-if ${money(trade.newNet)}${trade.status==='same'?'':' · '+trade.status}`:''}</p>)}</div>:null;}}/></div>
   <label className="mt-3 block text-[11px] font-semibold text-slate-600">Chart timeline · {stamp(bars[lo].t)} – {stamp(bars[hi-1].t)} · drag or press Play to replay results<input type="range" aria-label="What-if price chart timeline" min={Math.min(10,bars.length)} max={bars.length} value={hi} onChange={e=>{setPlaying(false);setEnd(Number(e.target.value));}} className="mt-2 w-full accent-[#5338ec]"/></label>
   <p className="mt-2 text-[11px] text-slate-500"><span aria-hidden className="mr-1 inline-block h-2 w-2 rounded-full" style={{background:scenarioColor}}/>Colored entry/exit dots and the P&amp;L line match the selected scenario. Hover or focus a dot for entry/exit, direction and trade details. Grey dots are skipped trades. Exits are drawn at the recorded price, not an inferred scenario fill. {simulation?'Generated demo candles from the saved test feed.':'Illustrative demo candles scaled to your first recorded entry, not historical prices.'}</p>
  </>:<p className="mt-4 py-6 text-center text-xs text-slate-500">No demo price candles are available for {symbol} in this date range.</p>}
 </section>;
}

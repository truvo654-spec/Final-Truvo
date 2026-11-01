import React,{useEffect,useMemo,useState} from 'react';
import {Play,Pause,RotateCcw,SkipForward} from 'lucide-react';
import type {BacktestRun} from '../../backtest/store';
import {SUPPORTED_TIMEFRAMES,TF_MS,type Timeframe,type BacktestTrade} from '../../backtest/types';
import {seriesFor} from '../../backtest/job';
import {symbolSpec} from '../../backtest/marketData';
import {resultTradeReplay,replayCandleGroups,replayTradePerformance} from '../../backtest/resultTradeReplay';
import {CandleChart,type Marker,type PriceLine} from './charts';
import type {LinkedPanel} from './linkedPerformance';
import {InfoTooltip} from '../common/InfoTooltip';
import {btnPrimary,btnSecondary,inputBase} from './ui';

/** Timeframe changes only the view; valuation always follows the saved execution settings. */
export function ResultTradeReplay({run,trade,timezone}:{run:BacktestRun;trade:BacktestTrade;timezone:string}){
 const replay=useMemo(()=>{try{const series=seriesFor(run.settings),data=resultTradeReplay(series,trade,run.settings.costs.fillModel==='sameClose');return {data,performance:replayTradePerformance(run.settings,series,trade,data)};}catch{return {data:{bars:[],entryIndex:0,exitIndex:0,start:0,sourceOffset:0},performance:null};}},[run,trade]);
 const {data,performance}=replay;
 const native=run.settings.timeframe;
 const [timeframe,setTimeframe]=useState<Timeframe>(native),[speed,setSpeed]=useState(1);
 const [cursor,setCursor]=useState(data.start),[playing,setPlaying]=useState(false);
 const end=data.bars.length,done=cursor>=end;
 const bars=useMemo(()=>replayCandleGroups(data.bars,cursor,timeframe),[data,cursor,timeframe]);
 useEffect(()=>{if(!playing)return;const timer=window.setInterval(()=>setCursor(c=>Math.min(end,c+1)),700/speed);return()=>window.clearInterval(timer);},[playing,end,speed]);
 useEffect(()=>{if(done&&playing)setPlaying(false);},[done,playing]);
 if(!end||!bars.length)return <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">The saved trade’s candles are unavailable. Its recorded details are shown below.</p>;
 const last=data.bars[cursor-1],dp=symbolSpec(run.symbol)?.priceDp??5;
 const candleIndex=(index:number)=>bars.findIndex(b=>b.t===Math.floor(data.bars[index].t/TF_MS[timeframe])*TF_MS[timeframe]);
 const markers:Marker[]=[{index:candleIndex(data.entryIndex),price:trade.entryPrice,kind:trade.direction==='long'?'buy':'sell',label:'Entry',showLabel:true},...(done?[{index:candleIndex(data.exitIndex),price:trade.exitPrice,kind:'exit' as const,label:'Exit',showLabel:true}]:[])];
 const point=performance?.[cursor-data.start],visiblePerformance=performance?.slice(0,cursor-data.start+1)??[];
 const stop=point?.stop??trade.stopPrice;
 const lines:PriceLine[]=[{price:trade.entryPrice,color:'#5338ec',label:'Entry'},{price:stop,color:'#e11d48',label:stop===trade.stopPrice?'Initial stop':'Stop',dashed:true},...(trade.targetPrice===null?[]:[{price:trade.targetPrice,color:'#059669',label:'Target',dashed:true}])];
 const money=(n:number)=>new Intl.NumberFormat('en-US',{style:'currency',currency:run.output.result.currency,maximumFractionDigits:2}).format(Math.abs(n)<.005?0:n);
 const panels:LinkedPanel[]=point?[{id:'replay-pnl',label:'Trade P&L',color:'#5338ec',points:visiblePerformance.map(p=>({at:p.at,value:p.net})),format:money},{id:'replay-dd',label:'Trade drawdown',color:'#e11d48',underwater:true,points:visiblePerformance.map(p=>({at:p.at,value:p.drawdown})),format:v=>money(-v)}]:[];
 const time=new Intl.DateTimeFormat('en-GB',{timeZone:timezone,dateStyle:'medium',timeStyle:'short'}).format(last.t+TF_MS[native]);
 return <section aria-label="Trade replay" className="mt-4 min-w-0 rounded-xl border border-slate-200 bg-white p-3">
  <div className="mb-3 flex flex-wrap items-center justify-between gap-3"><div><h4 className="flex items-center text-sm font-bold">Trade replay<InfoTooltip label="About this replay" description="Playback uses the saved test’s generated candles and engine settings. It does not change saved results, place orders or use another test run. Each step reveals one test candle. Larger chart timeframes group only revealed candles; the current grouped candle may still be forming."/></h4><p className="mt-1 text-xs text-slate-500">{run.symbol} · Tested on {native} · Generated sample prices</p></div><div className="flex flex-wrap gap-3"><label className="text-xs font-semibold">Chart timeframe<select aria-label="Trade replay timeframe" value={timeframe} onChange={e=>{setPlaying(false);setTimeframe(e.target.value as Timeframe);}} className={inputBase+' ml-2 text-xs'}>{SUPPORTED_TIMEFRAMES.filter(tf=>TF_MS[tf]>=TF_MS[native]).map(tf=><option key={tf} value={tf}>{tf==='1D'?'Daily':tf}{tf===native?' · test':''}</option>)}</select></label><label className="text-xs font-semibold">Speed<select aria-label="Trade replay speed" value={speed} onChange={e=>setSpeed(Number(e.target.value))} className={inputBase+' ml-2 text-xs'}>{[1,2,4].map(s=><option key={s} value={s}>{s}×</option>)}</select></label></div></div>
  <div className="mb-3 grid grid-cols-3 gap-2" aria-label="Replay performance">
   <div className="min-w-0 rounded-lg bg-slate-50 p-3"><p className="flex items-center text-[11px] text-slate-500">{done?'Net P&L · closed':'P&L now'}<InfoTooltip label="Replay P&L" description="Net position value at the revealed test candle’s close, including realized partial exits and estimated closing costs from the original engine. At exit it matches the saved net P&L. This is trade replay, not a live market feed."/></p><output aria-label="Replay net P&L" className={'mt-1 block break-words text-sm font-bold '+(point&&point.net<0?'text-rose-600':'text-emerald-700')}>{point?money(point.net):'—'}</output></div>
   <div className="min-w-0 rounded-lg bg-slate-50 p-3"><p className="flex items-center text-[11px] text-slate-500">Drawdown now<InfoTooltip label="Replay drawdown" description="How far this trade’s replay P&L is below its highest value so far, starting at zero. Measured at test candle closes in account currency. This is not account drawdown or an intrabar worst case."/></p><output aria-label="Replay current drawdown" className="mt-1 block break-words text-sm font-bold text-rose-600">{point?money(-point.drawdown):'—'}</output></div>
   <div className="min-w-0 rounded-lg bg-slate-50 p-3"><p className="text-[11px] text-slate-500">Max drawdown</p><output aria-label="Replay maximum drawdown" className="mt-1 block break-words text-sm font-bold text-rose-600">{point?money(-point.maxDrawdown):'—'}</output></div>
  </div>
  {!point&&<p className="mb-3 text-xs text-slate-500">Playback P&L is unavailable for this saved trade. Its recorded final result stays available in Trade details.</p>}
  <div role="toolbar" aria-label="Trade replay controls" className="mb-3 flex flex-wrap items-center gap-2"><button type="button" className={btnPrimary} onClick={()=>{if(done)setCursor(data.start);setPlaying(p=>!p);}}>{playing?<Pause size={14}/>:<Play size={14}/>} {playing?'Pause':done?'Play again':'Play'}</button><button type="button" className={btnSecondary} disabled={done} onClick={()=>{setPlaying(false);setCursor(c=>Math.min(end,c+1));}}><SkipForward size={14}/>Next step</button><button type="button" className={btnSecondary} onClick={()=>{setPlaying(false);setCursor(data.start);}}><RotateCcw size={14}/>Restart</button><p role="status" className="text-xs font-semibold text-[#5338ec]">{done?'Exit reached · '+trade.exitReason:'Step '+(cursor-data.start+1)+' of '+(end-data.start+1)}</p></div>
  <input aria-label="Trade replay position" type="range" min={data.start} max={end} value={cursor} onChange={e=>{setPlaying(false);setCursor(Number(e.target.value));}} className="mb-2 w-full accent-[#5338ec]"/>
  <CandleChart bars={bars} from={Math.max(0,bars.length-85)} to={bars.length} timelineEnd={last.t+TF_MS[native]} height={220} responsive showTimeAxis dp={dp} markers={markers} lines={lines} linkedPanels={panels} interactive label="Saved test trade replay candles"/>
  <p className="mt-2 text-[11px] text-slate-500">Through {time} · {timezone} · Playback steps: {native}</p>
 </section>;
}

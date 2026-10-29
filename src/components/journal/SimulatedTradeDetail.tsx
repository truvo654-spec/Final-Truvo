import React from 'react';
import { executionPrice, type ExecutionPoint } from './playbookComparison';
import { useDialogFocus } from './useDialogFocus';
import { seriesFor } from '../../backtest/job';
import { TF_MS } from '../../backtest/types';
import { formatMoney } from './JournalCurrency';
export const SimulatedTradeDetail:React.FC<{point:ExecutionPoint;onClose:()=>void}> = ({point,onClose}) => {
  const ref=useDialogFocus(onClose);
  const trade=point.trade!,run=point.run!;
  const data=seriesFor(run.settings);
  const pad=TF_MS[run.settings.timeframe]*8;
  const indices=Array.from({length:data.length},(_,i)=>i).filter(i=>data.t[i]>=trade.entryTime-pad && data.t[i]<=trade.exitTime+pad);
  const stride=Math.max(1,Math.ceil(indices.length/180));
  const sample=indices.filter((_,i)=>i%stride===0);
  const times=sample.map(i=>data.t[i]),prices=sample.map(i=>data.c[i]);
  const low=Math.min(...prices,trade.entryPrice,trade.exitPrice,trade.stopPrice),high=Math.max(...prices,trade.entryPrice,trade.exitPrice,trade.targetPrice ?? trade.entryPrice),span=high-low||1;
  const first=Math.min(...times,trade.entryTime),last=Math.max(...times,trade.exitTime);
  const x=(t:number)=>35+(t-first)/Math.max(1,last-first)*620,y=(p:number)=>170-(p-low)/span*140;
  const dt=(t:number)=>new Date(t).toISOString().replace('T',' ').slice(0,16)+' UTC';
  const money=(n:number)=>formatMoney(n,run.output.result.currency,2);
  return <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/45 p-4" onMouseDown={e=>{if(e.target===e.currentTarget)onClose();}}><div ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="sim-trade-title" className="max-h-[90dvh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl outline-none">
    <div className="flex items-start justify-between gap-4"><div><span className="text-xs font-semibold text-teal-700">SIMULATED · GENERATED SAMPLE PRICES</span><h3 id="sim-trade-title" className="mt-1 text-lg font-bold">{point.symbol} · {trade.direction} · trade #{trade.id}</h3><p className="mt-1 text-xs text-slate-500">{run.timeframe} · {run.from} to {run.to}</p></div><button type="button" aria-label="Close simulated trade" onClick={onClose} className="rounded-lg border px-3 py-2 text-xs">Close</button></div>
    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">{[['Net P&L',money(trade.net)],['Result',trade.r.toFixed(2)+'R'],['Costs',new Intl.NumberFormat('en-US',{style:'currency',currency:run.output.result.currency}).format(trade.costs)],['Exit reason',trade.exitReason]].map(([k,v])=><div key={k} className="rounded-xl bg-slate-50 p-3"><p className="text-[10px] uppercase text-slate-500">{k}</p><p className="mt-1 text-sm font-semibold">{v}</p></div>)}</div>
    <svg viewBox="0 0 700 205" className="mt-4 w-full rounded-xl border border-slate-200" role="img" aria-label="Generated sample closing prices with entry, exit, initial stop and target markers">
      <polyline fill="none" stroke="#94a3b8" strokeWidth="1.5" points={sample.map(i=>`${x(data.t[i])},${y(data.c[i])}`).join(' ')}/>
      {([{label:'Entry',time:trade.entryTime,price:trade.entryPrice,color:'#5338ec'},{label:'Exit',time:trade.exitTime,price:trade.exitPrice,color:'#0d9488'}]).map(p=><g key={p.label}><line x1={x(p.time)} x2={x(p.time)} y1="20" y2="175" stroke={p.color} strokeDasharray="3 3"/><circle cx={x(p.time)} cy={y(p.price)} r="5" fill={p.color}/><text x={x(p.time)} y="190" textAnchor="middle" fontSize="11" fill={p.color}>{p.label}</text><title>{p.label} {p.price} · {dt(p.time)}</title></g>)}
      <line x1="35" x2="655" y1={y(trade.stopPrice)} y2={y(trade.stopPrice)} stroke="#f43f5e" strokeDasharray="4 4"/><text x="650" y={y(trade.stopPrice)-4} textAnchor="end" fontSize="10" fill="#e11d48">Initial stop</text>
      {trade.targetPrice!==null && <><line x1="35" x2="655" y1={y(trade.targetPrice)} y2={y(trade.targetPrice)} stroke="#10b981" strokeDasharray="4 4"/><text x="650" y={y(trade.targetPrice)-4} textAnchor="end" fontSize="10" fill="#059669">Target</text></>}
    </svg>
    <dl className="mt-4 grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">{[['Entry',`${executionPrice(trade.entryPrice,point.symbol)} · ${dt(trade.entryTime)}`],['Exit',`${executionPrice(trade.exitPrice,point.symbol)} · ${dt(trade.exitTime)}`],['Initial stop',executionPrice(trade.stopPrice,point.symbol)],['Target',trade.targetPrice===null?'None':executionPrice(trade.targetPrice,point.symbol)],['Position size',String(trade.size)],['Gross P&L',money(trade.gross)],['Maximum adverse move',trade.mae.toFixed(2)+'R'],['Maximum favorable move',trade.mfe.toFixed(2)+'R']].map(([k,v])=><div key={k}><dt className="text-slate-500">{k}</dt><dd className="mt-1 font-semibold">{v}</dd></div>)}</dl>
    <p className="mt-4 text-[11px] text-slate-500">{trade.ambiguous ? 'Stop and target shared a bar; the engine assumed the stop filled first. ' : ''}The line shows sampled closing prices; markers show engine fill prices. No real order was placed.</p>
  </div></div>;
};

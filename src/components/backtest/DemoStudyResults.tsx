import { JournalHelp } from '../journal/JournalHelp';
import React from 'react';
import type {RunResult} from '../../backtest/types';
import {computeMetrics} from '../../backtest/metrics';
import {bestValues,BestValueBadge,bestValueClass} from './comparisonHighlights';

export interface DemoComparison {name:string;color:string;run:RunResult;}
const usd=(n:number)=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(n);
export function DemoStudyResults({runs}:{runs:DemoComparison[]}){
  const measured=runs.map(r=>({...r,metrics:computeMetrics(r.run.trades,r.run.startBalance)}));
  const rows=[
    {label:'Net P&L',values:measured.map(r=>r.metrics.netPnl),format:usd,high:true},
    {label:'Gross gains',values:measured.map(r=>r.metrics.grossProfit),format:usd,high:true},
    {label:'Gross losses',values:measured.map(r=>r.metrics.grossLoss),format:usd,high:true},
    {label:'Max closed-equity drawdown',values:measured.map(r=>r.metrics.maxDD),format:usd,high:false},
    {label:'Win rate',values:measured.map(r=>r.metrics.trades?r.metrics.winRate:NaN),format:(n:number)=>(n*100).toFixed(1)+'%',high:true},
    {label:'Average R',values:measured.map(r=>r.metrics.trades?r.metrics.avgR:NaN),format:(n:number)=>n.toFixed(2)+'R',high:true},
    {label:'Account return',values:measured.map(r=>r.metrics.netPct),format:(n:number)=>(n*100).toFixed(2)+'%',high:true},
  ];
  const limit=Math.max(1,...measured.flatMap(r=>[r.metrics.grossProfit,-r.metrics.grossLoss,r.metrics.maxDD]));
  return <div className="space-y-3" aria-label="Demo performance and risk comparison">
    <p className="text-xs font-semibold">Same generated candles, sizing and costs · full-path simulated results</p>
    <div className="overflow-x-auto"><table className="w-full min-w-[550px] text-xs text-right tabular-nums"><caption className="sr-only">Baseline, user and available MarketSyde AI performance</caption><thead><tr><th className="text-left p-2">Measure</th>{measured.map(r=><th key={r.name} scope="col" className="p-2" style={{color:r.color}}>{r.name}</th>)}</tr></thead><tbody>
      {rows.map(row=>{const best=bestValues(row.values,row.high);return <tr key={row.label} className="border-t border-slate-100"><th scope="row" className="text-left p-2 font-medium">{row.label}</th>{row.values.map((n,i)=><td key={i} className={`p-2 ${best.winners.includes(i)?bestValueClass:''}`}>{Number.isNaN(n)?'Unknown':row.format(n)}{best.winners.includes(i)&&<span className="block"><BestValueBadge tied={best.tied}/></span>}</td>)}</tr>;})}
      <tr className="border-t"><th scope="row" className="p-2 text-left font-medium">Trades<JournalHelp label="Trades" /></th>{measured.map(r=><td className="p-2" key={r.name}>{r.metrics.trades}</td>)}</tr>
    </tbody></table></div>
    <svg viewBox={`0 0 640 ${measured.length*90+25}`} className="w-full" role="img" aria-label="Demo gross gains, losses and drawdown comparison"><title>Simulated gross gains, absolute losses and closed-equity drawdown in USD, shared scale</title>{measured.map((r,i)=><g key={r.name} transform={`translate(0 ${i*90})`}><text x="4" y="16" fontSize="11" fill={r.color}>{r.name}</text>{[['Gains',r.metrics.grossProfit,'#059669'],['Losses',-r.metrics.grossLoss,'#e11d48'],['Drawdown',r.metrics.maxDD,'#d97706']].map(([label,v,color],j)=><g key={String(label)}><text x="4" y={35+j*21} fontSize="10" fill="#64748b">{label}</text><rect x="76" y={26+j*21} height="12" width={Number(v)/limit*430} fill={String(color)} rx="2"/><text x={83+Number(v)/limit*430} y={36+j*21} fontSize="10" fill="#0b1c30">{usd(Number(v))}</text></g>)}</g>)}</svg>
    <p className="text-[11px] text-slate-500">Green highlights the better observed metric. Equal values and trade counts stay neutral. AI selection uses training only; full-path results include holdout and do not establish future performance.</p>
  </div>;
}

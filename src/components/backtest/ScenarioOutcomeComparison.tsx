import React, {useState} from 'react';
import type { WhatIfOutput } from '../../backtest/whatif';
import type { Metrics } from '../../backtest/metrics';
import { JournalCurrency, formatMoney } from '../journal/JournalCurrency';
import { Card, Segmented } from './ui';
import {bestValues,BestValueBadge} from './comparisonHighlights';

type Group='gain'|'risk'|'performance';
interface Measure {name:string;value:(m:Metrics,o:WhatIfOutput,actual:boolean)=>number;format:(n:number)=>string}
const COLORS=['#94a3b8','#0284c7','#5338ec'];
const NAMES=['Actual','Your setup','MarketSyde AI'];

export const ScenarioOutcomeComparison:React.FC<{user:WhatIfOutput;ai:WhatIfOutput|null;aiName:string;userName:string}>=({user,ai,aiName,userName})=>{
  const currency=React.useContext(JournalCurrency);
  const [group,setGroup]=useState<Group>('gain');
  const money=(n:number)=>Number.isFinite(n)?formatMoney(n,currency,2):'—';
  const riskMoney=(n:number)=>Number.isFinite(n)?new Intl.NumberFormat('en-US',{style:'currency',currency,minimumFractionDigits:2,maximumFractionDigits:2}).format(n):'—';
  const number=(n:number)=>Number.isFinite(n)?n.toFixed(2):'—';
  const measures:Record<Group,Measure[]>={
    gain:[{name:'Net result',value:m=>m.netPnl,format:money},{name:'Winning net',value:m=>m.grossProfit,format:money},{name:'Losing net',value:m=>m.grossLoss,format:money}],
    risk:[{name:'Max drawdown · lower is better',value:m=>m.maxDD,format:riskMoney},{name:'Worst closed loss · lower is better',value:(_m,o,actual)=>Math.max(0,...o.trades.map(t=>-(actual?t.actualNet:t.newNet))),format:riskMoney},{name:'Losing trades',value:m=>m.losses,format:n=>`${n}`}],
    performance:[{name:'Win rate',value:m=>m.winRate*100,format:n=>Number.isFinite(n)?`${n.toFixed(1)}%`:'—'},{name:'Average realized R',value:m=>m.avgR,format:n=>`${number(n)}${Number.isFinite(n)?'R':''}`},{name:'Trades taken',value:m=>m.trades,format:n=>`${n}`}],
  };
  return <Card title="Your setup vs MarketSyde AI" sub="Gain / loss, risk and performance on the same filtered journal trades.">
    <Segmented size="sm" label="Scenario comparison measure" value={group} onChange={setGroup} options={[{id:'gain',label:'Gain / loss'},{id:'risk',label:'Risk'},{id:'performance',label:'Performance'}]}/>
    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-3 text-[10px]">{NAMES.map((name,i)=><span key={name} className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{background:COLORS[i]}}/>{name}</span>)}</div>
    {!ai&&<p role="status" className="text-[11px] text-slate-500 mt-3">No qualifying AI scenario for this sample and goal. AI values stay unavailable.</p>}
    <div className="space-y-4 mt-4" role="group" aria-label={`${group==='gain'?'Gain and loss':group==='risk'?'Closed-result risk':'Performance'} comparison of actual, your setup and MarketSyde AI`}>
      {measures[group].map((measure,i)=>{
        const values=[measure.value(user.actual,user,true),measure.value(user.whatIf,user,false),ai?measure.value(ai.whatIf,ai,false):NaN];
        const finite=values.filter(Number.isFinite),lo=Math.min(0,...finite),hi=Math.max(0,...finite),span=hi-lo||1;
        const x=(n:number)=>(n-lo)/span*100;
        const highlight=measure.name==='Trades taken'?null:bestValues(values,group!=='risk');
        return <div key={measure.name}>
          <p className="text-[11px] font-bold text-[#0b1c30] mb-2">{measure.name}{highlight?.allEqual&&<span className="ml-2 font-normal text-slate-500">Same result</span>}</p>
          <div className="space-y-1.5">{values.map((value,j)=><div key={NAMES[j]} className={`grid grid-cols-[60px_minmax(0,1fr)_90px] items-center gap-2 text-[10px] tabular-nums rounded ${highlight?.winners.includes(j)?'bg-emerald-50 ring-1 ring-emerald-200':''}`}>
            <span className="text-slate-500">{j===2?'AI':NAMES[j]}</span>
            <div className="relative h-4 rounded bg-slate-50" role="img" aria-label={`${measure.name} · ${NAMES[j]}: ${Number.isFinite(value)?measure.format(value):'Unavailable'}`}>
              <span className="absolute inset-y-0 border-l border-slate-300" style={{left:`${x(0)}%`}}/>
              {Number.isFinite(value)&&<span className="absolute top-0.5 h-3 rounded-sm" style={{left:`${Math.min(x(0),x(value))}%`,width:`${Math.abs(x(value)-x(0))}%`,background:COLORS[j]}}/>}
            </div>
            <span className="text-right font-semibold whitespace-nowrap" style={{color:Number.isFinite(value)?COLORS[j]:'#94a3b8'}}>{Number.isFinite(value)?measure.format(value):'—'}{highlight?.winners.includes(j)&&<span className="block mt-0.5"><BestValueBadge tied={highlight.tied}/></span>}</span>
          </div>)}</div>
        </div>;
      })}
    </div>
    <p className="text-[11px] text-slate-500 mt-3">Green highlights mark the best historical value for each metric; ties share the highlight. Higher gains and performance, smaller losses and drawdown are better. Trade counts are context. Each metric uses its own scale. Risk shows closed-result risk, not planned position exposure.</p>
    <div className="mt-3 space-y-1 text-[11px]"><p><b className="text-[#0284c7]">Your setup:</b> {userName}</p><p><b className="text-[#5338ec]">MarketSyde AI:</b> {aiName}</p></div>
    {ai&&<p className={`text-xs font-semibold mt-3 ${ai.whatIf.netPnl-user.whatIf.netPnl>=0?'text-emerald-700':'text-rose-700'}`}>AI vs your setup: {money(ai.whatIf.netPnl-user.whatIf.netPnl)} net Δ</p>}
    {(user.estimated||ai?.estimated)&&<p className="text-[11px] text-amber-700 mt-2">Price-dependent results use reconstructed paths. Full-history results include the training and holdout trades.</p>}
  </Card>;
};

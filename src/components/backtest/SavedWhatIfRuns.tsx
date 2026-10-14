import React,{useState} from 'react';
import {ArrowLeft,Eye,Trash2} from 'lucide-react';
import type {WhatIfRun} from '../../backtest/store';
import {describeWhatIf} from '../../backtest/whatif';
import {formatMoney} from '../journal/JournalCurrency';
import {dateOnly,pct,rr,num} from '../../backtest/format';
import {Card,Pill,btnSecondary} from './ui';
import {LineChart} from './charts';
import {bestValues,BestValueBadge,bestValueClass} from './comparisonHighlights';

export const savedWhatIfName=(run:WhatIfRun)=>run.name||describeWhatIf(run.rule);
const currencyMoney=(run:WhatIfRun,value:number)=>run.snapshot?formatMoney(value,run.snapshot.currency,2):`${Number.isFinite(value)?value.toFixed(2):'—'} (currency not recorded)`;

export const SavedWhatIfRuns:React.FC<{runs:WhatIfRun[];tz:string;onDelete:(id:string)=>void}>=({runs,tz,onDelete})=>{
  const [openId,setOpenId]=useState<string|null>(null);
  const [confirm,setConfirm]=useState<string|null>(null);
  const run=runs.find(r=>r.id===openId);
  if(run){
    const snapshot=run.snapshot;
    const output=snapshot?.output;
    const money=(value:number)=>currencyMoney(run,value);
    const ruleText=run.rule.kind==='dailyLoss'?`Stop after ${money(run.rule.usd)} net loss in a day`:describeWhatIf(run.rule);
    const curve=(actual:boolean)=>{
      let total=0;
      const sorted=[...(output?.trades||[])].sort((a,b)=>a.exitTime-b.exitTime);
      return sorted.length?[{x:Math.min(...sorted.map(t=>t.entryTime)),y:0},...sorted.map(t=>({x:t.exitTime,y:total+=actual?t.actualNet:t.newNet}))]:[];
    };
    const metrics=output?[
      {name:'Net P&L',values:[output.actual.netPnl,output.whatIf.netPnl],format:money,hi:true},
      {name:'Win rate',values:[output.actual.winRate,output.whatIf.winRate],format:pct,hi:true},
      {name:'Profit factor',values:[output.actual.profitFactor??NaN,output.whatIf.profitFactor??NaN],format:(v:number)=>v===Infinity?'∞':Number.isNaN(v)?'—':num(v),hi:true},
      {name:'Average R',values:[output.actual.avgR,output.whatIf.avgR],format:rr,hi:true},
      {name:'Max drawdown',values:[output.actual.maxDD,output.whatIf.maxDD],format:(v:number)=>money(-v),hi:false},
      {name:'Trades taken',values:[output.actual.trades,output.whatIf.trades],format:(v:number)=>String(v),hi:null},
    ]:[];
    return <div className="space-y-5">
      <button type="button" className={btnSecondary} onClick={()=>setOpenId(null)}><ArrowLeft className="w-4 h-4"/> Back to saved What-if runs</button>
      <Card title={savedWhatIfName(run)} sub={`Saved ${dateOnly(Date.parse(run.createdAt),tz)} · Frozen What-if test`}>
        <p className="text-sm font-semibold">{ruleText}</p>
        {snapshot?<><div className="flex flex-wrap gap-2 my-3"><Pill>{snapshot.source==='ai'?'MarketSyde AI':snapshot.source==='user'?'Your setup':'Parameter scenario'}</Pill><Pill>{snapshot.currency}</Pill>{output?.estimated&&<Pill tone="warn">Estimated price path</Pill>}</div>
          <p className="text-xs text-slate-500">{snapshot.benchmark} · {run.trades} benchmark trades. This snapshot keeps the original results; newer journal records and edits do not recalculate it.</p>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-2 mt-4 text-xs">{Object.entries(snapshot.scope).map(([key,value])=><div key={key}><dt className="font-semibold text-slate-500">{key}</dt><dd>{value}</dd></div>)}</dl>
          <p className="text-xs text-slate-500 mt-4">Recommendation goal: {snapshot.goal==='net'?'Improve net result':snapshot.goal==='drawdown'?'Reduce drawdown':'Improve win rate'}. Training: {snapshot.training.trades.length} trades · Holdout: {snapshot.validation?.trades.length||0} trades{snapshot.crossingCount?` · ${snapshot.crossingCount} crossing trades included only in full history`:''}.</p>
          <p className="text-xs mt-2">Training net Δ: {money(snapshot.training.saved)} · Holdout net Δ: {snapshot.validation?money(snapshot.validation.saved):'Unavailable'}. Selection uses training results; full-history totals include holdout trades.</p>
          {output?.estimated&&<p className="text-xs text-amber-700 mt-2">Price-dependent results use reconstructed paths, not recorded candles.</p>}
        </>:<p className="text-xs text-slate-500 mt-3">Legacy checklist save: only the rule, trade count and net totals were recorded. Currency, filters, trade ledger and holdout evidence are unavailable.</p>}
      </Card>
      <Card title="Actual vs saved scenario" sub="Green highlights the better historical metric; lower drawdown is better. Trade counts stay neutral.">
        {output?<div className="overflow-x-auto"><table className="w-full min-w-[380px] text-xs tabular-nums"><thead><tr className="border-b text-slate-500"><th className="text-left py-2">Measure</th><th className="text-right">Actual</th><th className="text-right">Saved scenario</th></tr></thead><tbody>{metrics.map(metric=>{
          const highlights=metric.hi===null?null:bestValues(metric.values,metric.hi);
          return <tr key={metric.name} className="border-b border-slate-100"><td className="py-3 font-semibold">{metric.name}</td>{metric.values.map((value,i)=><td key={i} className={`py-3 px-2 text-right ${highlights?.winners.includes(i)?bestValueClass:''}`}>{metric.format(value)}{highlights?.winners.includes(i)&&<span className="block mt-1"><BestValueBadge/></span>}</td>)}</tr>;
        })}</tbody></table></div>:<p className="text-sm">Actual: {money(run.actualNet)} · Saved scenario: {money(run.whatIfNet)} · Δ actual: {money(run.saved)}</p>}
      </Card>
      {output&&<>
        <Card title="Saved scenario equity" sub={`Cumulative net P&L in ${snapshot!.currency} from the saved trade ledger, ordered by recorded exit time.`}><LineChart label="Actual and saved What-if scenario equity" area={false} height={280} yFmt={money} xFmt={t=>dateOnly(t,tz)} series={[{name:'Actual',color:'#94a3b8',dashed:true,points:curve(true)},{name:snapshot!.source==='ai'?'MarketSyde AI':'Saved scenario',color:'#5338ec',points:curve(false)}]}/></Card>
        <Card title={`Saved trades (${output.trades.length})`} sub="The original tested ledger, including unchanged and skipped trades."><div className="overflow-x-auto"><table className="w-full min-w-[650px] text-xs tabular-nums"><thead><tr className="border-b text-slate-500">{['Date','Symbol','Playbook','Actual','Saved scenario','What happened'].map(label=><th key={label} className="py-2 text-left px-2">{label}</th>)}</tr></thead><tbody>{output.trades.map(t=><tr key={t.id} className="border-b border-slate-100"><td className="py-2 px-2 whitespace-nowrap">{dateOnly(t.entryTime,tz)}</td><td className="px-2">{t.symbol} · {t.direction==='BUY'?'Long':'Short'}</td><td className="px-2">{t.strategy}</td><td className="px-2 whitespace-nowrap">{money(t.actualNet)}</td><td className="px-2 whitespace-nowrap">{t.status==='skipped'?`Skipped · ${money(0)} net`:money(t.newNet)}</td><td className="px-2">{t.note||'Unchanged'}</td></tr>)}</tbody></table></div></Card>
      </>}
    </div>;
  }
  return <Card title="Saved What-if runs" sub="Save any tested scenario using its save icon in What-if. Results and parameters are stored in this browser.">
    {!runs.length?<p className="text-xs text-slate-500 py-3">No saved What-if scenarios yet.</p>:<div className="overflow-x-auto -mx-5 px-5"><table className="w-full min-w-[850px] text-xs tabular-nums"><thead><tr className="border-b text-slate-500 text-left">{['Scenario','Source / currency','Benchmark','Trades','Net','Δ actual','Drawdown','Saved','Actions'].map(label=><th key={label} className="py-2 px-2">{label}</th>)}</tr></thead><tbody>{runs.map(r=><tr key={r.id} className="border-b border-slate-100">
      <td className="py-3 px-2"><button type="button" className="text-left font-bold text-[#5338ec] hover:underline" onClick={()=>setOpenId(r.id)}>{savedWhatIfName(r)}</button>{r.snapshot?.output.estimated&&<p className="text-[10px] text-amber-700">Estimated price path</p>}</td>
      <td className="px-2">{r.snapshot?`${r.snapshot.source==='ai'?'MarketSyde AI':r.snapshot.source==='user'?'Your setup':'Parameter'} · ${r.snapshot.currency}`:'Legacy checklist'}</td>
      <td className="px-2">{r.snapshot?.benchmark||'Not recorded'}</td><td className="px-2">{r.snapshot?.output.whatIf.trades??r.trades}</td>
      <td className={`px-2 whitespace-nowrap font-bold ${r.whatIfNet>=0?'text-emerald-700':'text-rose-600'}`}>{currencyMoney(r,r.whatIfNet)}</td><td className="px-2 whitespace-nowrap">{currencyMoney(r,r.saved)}</td><td className="px-2 whitespace-nowrap">{r.snapshot?currencyMoney(r,-r.snapshot.output.whatIf.maxDD):'—'}</td><td className="px-2 whitespace-nowrap">{dateOnly(Date.parse(r.createdAt),tz)}</td>
      <td className="px-2"><div className="flex items-center gap-1"><button type="button" title="Open saved scenario report" aria-label={`Open ${savedWhatIfName(r)}`} onClick={()=>setOpenId(r.id)} className="p-2 rounded hover:bg-slate-100"><Eye className="w-4 h-4"/></button>{confirm===r.id?<><button type="button" className="text-rose-600 font-bold" onClick={()=>{onDelete(r.id);setConfirm(null);}}>Delete</button><button type="button" onClick={()=>setConfirm(null)}>Keep</button></>:<button type="button" title="Delete saved scenario" aria-label={`Delete ${savedWhatIfName(r)}`} onClick={()=>setConfirm(r.id)} className="p-2 rounded text-slate-400 hover:text-rose-600"><Trash2 className="w-4 h-4"/></button>}</div></td>
    </tr>)}</tbody></table></div>}
  </Card>;
};

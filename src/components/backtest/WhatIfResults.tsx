import React from 'react';
import {Check} from 'lucide-react';
import type {WhatIfStudyRow} from '../../backtest/savedWhatIf';
import {describeWhatIf} from '../../backtest/whatif';
import {formatMoney} from '../journal/JournalCurrency';
import {LineChart} from './charts';
import {Pill,btnPrimary,btnSecondary} from './ui';

interface Props{
 rows:WhatIfStudyRow[];selected:WhatIfStudyRow;onSelect:(id:string)=>void;currency:string;summary:string;simulation:boolean;
 saved:boolean;onSave:()=>void;onTrades:()=>void;onClose:()=>void;onViewSaved?:()=>void;onAdvanced?:()=>void;
}
/** One comparison popup: exact chosen setup first, then values of the same rule. */
export function WhatIfResults({rows,selected,onSelect,currency,summary,simulation,saved,onSave,onTrades,onClose,onViewSaved,onAdvanced}:Props){
 const out=selected.output,choice=rows[0],isChoice=selected.id===choice.id;
 const money=(n:number)=>Number.isFinite(n)?formatMoney(n,currency,2):'—';
 const describe=(row:WhatIfStudyRow)=>row.rule.kind==='dailyLoss'?`Stop after ${money(row.rule.usd).replace(/^\+/,'')} daily loss`:describeWhatIf(row.rule);
 const pct=(n:number)=>Number.isFinite(n)?(n*100).toFixed(1)+'%':'—';
 const factor=(n:number|null)=>n===Infinity?'∞':n!==null&&Number.isFinite(n)?n.toFixed(2):'—';
 const changed=out.trades.filter(t=>t.status!=='same').length;
 const unknown=out.trades.filter(t=>t.note.startsWith('Unknown initial monetary risk')).length;
 const curve=(actual:boolean)=>{let total=0;const trades=[...out.trades].sort((a,b)=>a.exitTime-b.exitTime);return [...(trades.length?[{x:Math.min(...trades.map(t=>t.entryTime)),y:0}]:[]),...trades.map(t=>({x:t.exitTime,y:total+=actual?t.actualNet:t.newNet}))];};
 return <>
  <div className="flex flex-wrap items-start justify-between gap-3 pr-6">
   <div className="min-w-0"><p className="text-xs font-semibold text-[#5338ec]">{simulation?'SAMPLE SIMULATION':'JOURNAL'} · {isChoice?'Your choice':'Viewing an alternative'}</p><h2 className="mt-2 text-xl font-bold">{describe(selected)}</h2><p className="mt-2 text-xs text-slate-500">{summary}</p></div>
   <div className="flex flex-wrap items-center gap-2">{out.estimated&&<Pill tone="warn">{selected.rule.kind==='technical'?'Demo price check':'Estimated price path'}</Pill>}{onAdvanced&&<button type="button" className={btnSecondary} onClick={onAdvanced}>Advanced analysis</button>}</div>
  </div>
  <p className="mt-3 text-lg font-semibold" role="status">{Math.abs(out.saved)<0.005?'No change in net result':`${money(Math.abs(out.saved)).replace(/^\+/,'')} ${out.saved>0?'more':'less'} net P&L`}</p>
  <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[['Net P&L',money(out.actual.netPnl),money(out.whatIf.netPnl)],['Win rate',pct(out.actual.winRate),pct(out.whatIf.winRate)],['Profit factor',factor(out.actual.profitFactor),factor(out.whatIf.profitFactor)],['Max drawdown',money(-out.actual.maxDD),money(-out.whatIf.maxDD)]].map(([label,a,b])=><div key={label} className="rounded-xl border border-[#CCC6FB] p-3"><p className="text-xs text-slate-500">{label}</p><p className="mt-2 text-sm text-slate-500">Original {a}</p><p className="mt-1 text-lg font-bold">What-if {b}</p></div>)}</div>
  {rows.length>1&&<section className="mt-5" aria-label="Compare values of this rule"><h3 className="text-sm font-bold">{selected.rule.kind==='technical'?'Compare conditions':'Try another value'}</h3><p className="mt-1 text-xs text-slate-500">{selected.rule.kind==='technical'?'Same trades. Compare the full set with individual conditions.':'Same trades, same rule. Click a value to update the result.'}</p><div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">{rows.map((row,index)=><button type="button" key={row.id} aria-pressed={selected.id===row.id} onClick={()=>onSelect(row.id)} className={'rounded-xl border p-3 text-left '+(selected.id===row.id?'border-[#5338ec] bg-[#F6F3FF]':'border-[#CCC6FB] bg-white hover:bg-slate-50')}><span className="block text-[10px] font-semibold text-[#5338ec]">{index===0?'Your choice':'Alternative'}</span><span className="mt-1 block text-xs font-semibold">{describe(row)}</span><span className="mt-2 block text-sm font-bold">{money(row.output.whatIf.netPnl)}</span><span className="mt-1 block text-[11px] text-slate-500">{money(row.output.saved)} vs original</span></button>)}</div></section>}
  <div className="mt-4"><LineChart label="Original and selected What-if cumulative net P&L" height={230} area={false} yFmt={money} xFmt={t=>new Date(t).toISOString().slice(0,10)} series={[{name:'Original',color:'#94a3b8',points:curve(true)},{name:isChoice?'Your choice':'Selected alternative',color:'#5338ec',points:curve(false)}]} onPointSelect={onTrades}/></div>
  <p className="mt-2 text-xs text-slate-500">{changed} changed or skipped · {out.lossesAvoided} losses avoided or reduced · {out.winsForfeited} wins reduced or skipped</p>
  {out.trades.length<10&&<p className="mt-2 text-xs text-slate-500">Small sample · {out.trades.length} trade{out.trades.length===1?'':'s'}. Treat these comparisons as ideas to investigate.</p>}
  <details className="mt-3 text-xs text-slate-500"><summary className="cursor-pointer font-semibold">About this comparison</summary><p className="mt-2">Values are compared on the same selected history. Alternatives are not ranked or recommendations. Drawdown uses daily closed results grouped by UTC entry date.</p>{out.estimated&&<p className="mt-2">{selected.rule.kind==='technical'?'Technical checks use illustrative demo candles. Unavailable checks leave trades unchanged.':'Reconstructed price paths estimate the alternative. Saved candles are not used for this calculation.'}{unknown>0?` ${unknown} trades lack initial monetary risk and stay unchanged.`:''}</p>}</details>
  <div className="sticky bottom-0 z-10 mt-4 flex flex-wrap justify-between gap-3 border-t border-[#CCC6FB] bg-white py-4"><button className={btnSecondary} onClick={onTrades}>View trades ({out.trades.length})</button><div className="flex flex-wrap gap-2"><button className={btnSecondary} onClick={onClose}>Back to setup</button>{saved&&onViewSaved&&<button className={btnSecondary} onClick={onViewSaved}>View saved runs</button>}<button className={btnPrimary} disabled={saved} onClick={onSave}>{saved?<><Check size={14}/>Saved</>:'Save comparison'}</button></div></div>
 </>;
}

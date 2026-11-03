import React from 'react';
import {Check} from 'lucide-react';
import type {WhatIfStudyRow} from '../../backtest/savedWhatIf';
import {describeWhatIf} from '../../backtest/whatif';
import {describeCondition} from '../../backtest/rules';
import {whatIfDrawdownCurve} from '../../backtest/whatifResults';
import {formatMoney} from '../journal/JournalCurrency';
import {LineChart} from './charts';
import {WhatIfPriceChart} from './WhatIfPriceChart';
import type {JournalEntry} from '../../types';
import {Pill,btnPrimary,btnSecondary} from './ui';

interface Props{
 rows:WhatIfStudyRow[];selected:WhatIfStudyRow;onSelect:(id:string)=>void;currency:string;summary:string;simulation:boolean;
 entries?:JournalEntry[];saved:boolean;onSave:()=>void;onTrades:()=>void;onClose:()=>void;onViewSaved?:()=>void;onAdvanced?:()=>void;
}
/** One comparison popup: exact chosen setup first, then values of the same rule. */
export function WhatIfResults({rows,selected,onSelect,currency,summary,simulation,entries=[],saved,onSave,onTrades,onClose,onViewSaved,onAdvanced}:Props){
 const out=selected.output,choice=rows[0],isChoice=selected.id===choice.id;
 const money=(n:number)=>Number.isFinite(n)?formatMoney(n,currency,2):'—';
 const scenarioColor=out.saved>0.005?'#059669':out.saved< -0.005?'#e11d48':'#5338ec';
 const technical=choice.rule.kind==='technical';
 const numeric=choice.rule.kind==='target'||choice.rule.kind==='breakeven'||choice.rule.kind==='stop';
 const multiChart=technical||numeric;
 const comparisonTitle=choice.rule.kind==='target'?'Compare selected targets':choice.rule.kind==='breakeven'?'Compare selected breakeven levels':'Compare selected stops';
 const colors=['#5338ec','#0891b2','#d97706','#db2777','#059669','#2563eb','#9333ea','#ea580c','#4d7c0f','#be123c','#0f766e','#a16207','#475569'];
 const colorFor=(index:number)=>colors[index]??`hsl(${(index*137.508)%360} 65% 40%)`;
 const scenarioName=(row:WhatIfStudyRow,index:number)=>technical?(index===0?'All conditions (AND)':`Condition ${index} only`):describeWhatIf(row.rule);
 const describe=(row:WhatIfStudyRow)=>row.rule.kind==='technical'?row.rule.conditions.map(describeCondition).join(' AND '):row.rule.kind==='dailyLoss'?`Stop after ${money(row.rule.usd).replace(/^\+/,'')} daily loss`:describeWhatIf(row.rule);
 const pct=(n:number)=>Number.isFinite(n)?(n*100).toFixed(1)+'%':'—';
 const factor=(n:number|null)=>n===Infinity?'∞':n!==null&&Number.isFinite(n)?n.toFixed(2):'—';
 const changed=out.trades.filter(t=>t.status!=='same').length;
 const unknown=out.trades.filter(t=>t.note.startsWith('Unknown initial monetary risk')).length;
 const curve=(output:WhatIfStudyRow['output'],actual:boolean)=>{let total=0;const trades=[...output.trades].sort((a,b)=>a.exitTime-b.exitTime);return [...(trades.length?[{x:Math.min(...trades.map(t=>t.entryTime)),y:0}]:[]),...trades.map(t=>({x:t.exitTime,y:total+=actual?t.actualNet:t.newNet}))];};
 const selectedIndex=Math.max(0,rows.findIndex(row=>row.id===selected.id));
 const selectedColor=multiChart?colorFor(selectedIndex):scenarioColor;
 const plottedRows=multiChart?rows:[selected];
 const benchmarkName=technical?(simulation?'Original test · before technical filters':'Original journal · before technical filters'):numeric?'Original · before scenario changes':'Original';
 const series=[...plottedRows.map(row=>({id:row.id,name:scenarioName(row,rows.indexOf(row)),color:multiChart?colorFor(rows.indexOf(row)):selectedColor,points:curve(row.output,false)})),{id:'benchmark',name:benchmarkName,color:'#94a3b8',dashed:true,points:curve(choice.output,true)}];
 const drawdownSeries=series.map(line=>({...line,points:whatIfDrawdownCurve(line.id==='benchmark'?choice.output:plottedRows.find(row=>row.id===line.id)!.output,entries,line.id==='benchmark')}));
 const selectChartScenario=(id:string)=>{if(id!=='benchmark')onSelect(id);};
 return <>
  <div className="flex flex-wrap items-start justify-between gap-3 pr-6">
   <div className="min-w-0"><p className="text-xs font-semibold text-[#5338ec]">{simulation?'SAMPLE SIMULATION':'JOURNAL'} · {isChoice?'Your choice':'Viewing an alternative'}</p><h2 className="mt-2 text-xl font-bold">{describe(selected)}</h2><p className="mt-2 text-xs text-slate-500">{summary}</p></div>
   <div className="flex flex-wrap items-center gap-2">{out.estimated&&<Pill tone="warn">{selected.rule.kind==='technical'?'Demo price check':'Estimated price path'}</Pill>}{onAdvanced&&<button type="button" className={btnSecondary} onClick={onAdvanced}>Advanced analysis</button>}</div>
  </div>
  <p className="mt-3 text-lg font-semibold" role="status">{Math.abs(out.saved)<0.005?'No change in net result':`${money(Math.abs(out.saved)).replace(/^\+/,'')} ${out.saved>0?'more':'less'} net P&L`}</p>
  <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[['Net P&L',money(out.actual.netPnl),money(out.whatIf.netPnl)],['Win rate',pct(out.actual.winRate),pct(out.whatIf.winRate)],['Profit factor',factor(out.actual.profitFactor),factor(out.whatIf.profitFactor)],['Max drawdown',money(-out.actual.maxDD),money(-out.whatIf.maxDD)]].map(([label,a,b])=><div key={label} className="rounded-xl border border-[#CCC6FB] p-3"><p className="text-xs text-slate-500">{label}</p><p className="mt-2 text-sm text-slate-500">Original {a}</p><p className="mt-1 text-lg font-bold">What-if {b}</p></div>)}</div>
  <WhatIfPriceChart trades={out.trades} entries={entries} simulation={simulation} money={money} scenario={scenarioName(selected,selectedIndex)} markerSource={technical?(selectedIndex===0?'All conditions':`Condition ${selectedIndex}`):`Scenario ${selectedIndex+1}`} scenarioColor={selectedColor} onTrades={onTrades}/>
  {rows.length>1&&<section className="mt-5" aria-label="Compare values of this rule"><h3 className="text-sm font-bold">{technical?'Compare conditions':numeric?comparisonTitle:'Try another value'}</h3><p className="mt-1 text-xs text-slate-500">{technical?'Same original trades. All conditions must pass for the full setup; each condition-only result is a separate comparison.':numeric?'Your checked values, each tested on the same original trades. Click a scenario to inspect its results.':'Same trades, same rule. Click a value to update the result.'}</p><div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">{rows.map((row,index)=><button type="button" key={row.id} aria-pressed={selected.id===row.id} onClick={()=>onSelect(row.id)} className={'rounded-xl border p-3 text-left '+(selected.id===row.id?'border-[#5338ec] bg-[#F6F3FF]':'border-[#CCC6FB] bg-white hover:bg-slate-50')}><span className="block text-[10px] font-semibold text-[#5338ec]">{multiChart?<><span aria-hidden className="mr-1.5 inline-block h-2 w-2 rounded-full" style={{background:colorFor(index)}}/>{technical?scenarioName(row,index):`Selected scenario ${index+1}`}</>:index===0?'Your choice':'Alternative'}</span><span className="mt-1 block text-xs font-semibold">{describe(row)}</span><span className="mt-2 block text-sm font-bold">{money(row.output.whatIf.netPnl)}</span><span className="mt-1 block text-[11px] text-slate-500">{money(row.output.saved)} vs original</span></button>)}</div></section>}
  <div className="mt-4"><LineChart label="Original and selected What-if cumulative net P&L" height={230} area={false} yFmt={money} xFmt={t=>new Date(t).toISOString().slice(0,10)} series={series} onPointSelect={selectChartScenario}/></div>
  <section className="mt-5" aria-label="What-if drawdown comparison"><h3 className="text-sm font-bold">Drawdown by scenario</h3><p className="mt-1 text-xs text-slate-500">Below each scenario's daily net-P&amp;L peak, grouped by UTC entry date. Colors match the scenario cards and trade markers. Select a scenario card or chart dot to inspect its trades.</p><LineChart label="Original and scenario drawdown" height={210} area={false} yFmt={money} xFmt={t=>new Date(t).toISOString().slice(0,10)} series={drawdownSeries} onPointSelect={selectChartScenario}/></section>
  {technical&&<p className="mt-2 text-xs text-slate-500">The dashed benchmark keeps the original results before these filters. Matching lines may overlap. Conditions use completed demo candles; unavailable checks leave trades unchanged.</p>}
  <p className="mt-2 text-xs text-slate-500">{changed} changed or skipped · {out.lossesAvoided} losses avoided or reduced · {out.winsForfeited} wins reduced or skipped</p>
  {out.trades.length<10&&<p className="mt-2 text-xs text-slate-500">Small sample · {out.trades.length} trade{out.trades.length===1?'':'s'}. Treat these comparisons as ideas to investigate.</p>}
  <details className="mt-3 text-xs text-slate-500"><summary className="cursor-pointer font-semibold">About this comparison</summary><p className="mt-2">Values are compared on the same selected history. Alternatives are not ranked or recommendations. Drawdown uses daily closed results grouped by UTC entry date.</p>{out.estimated&&<p className="mt-2">{selected.rule.kind==='technical'?'Technical checks use illustrative demo candles. Unavailable checks leave trades unchanged.':'Reconstructed price paths estimate the alternative. Saved candles are not used for this calculation.'}{unknown>0?` ${unknown} trades lack initial monetary risk and stay unchanged.`:''}</p>}</details>
  <div className="sticky bottom-0 z-10 mt-4 flex flex-wrap justify-between gap-3 border-t border-[#CCC6FB] bg-white py-4"><button className={btnSecondary} onClick={onTrades}>View trades ({out.trades.length})</button><div className="flex flex-wrap gap-2"><button className={btnSecondary} onClick={onClose}>Back to setup</button>{saved&&onViewSaved&&<button className={btnSecondary} onClick={onViewSaved}>View saved runs</button>}<button className={btnPrimary} disabled={saved} onClick={onSave}>{saved?<><Check size={14}/>Saved</>:'Save comparison'}</button></div></div>
 </>;
}

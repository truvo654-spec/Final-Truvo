import React,{useId} from 'react';
import type {WhatIfResultGroup} from '../../backtest/whatifResults';
import {inputCls} from './ui';
/** One familiar result selector, shared by the popup and frozen saved comparison. */
export function WhatIfResultPicker({groups,value,onChange,dateControl}:{dateControl?:React.ReactNode;groups:WhatIfResultGroup[];value:string;onChange:(id:string)=>void}){
 const id=useId();
 const selected=groups.find(g=>g.id===value)??groups[0],markets=[...new Set(groups.slice(1).map(g=>g.market))];
 return <section aria-label="Choose comparison result" className="min-w-0 border-b border-[#CCC6FB] bg-white pb-3 pr-7">
  <div className="mb-1 flex flex-wrap items-center justify-between gap-2"><label htmlFor={id} className="text-xs font-semibold">Result</label>{dateControl}</div><select id={id} aria-label="What-if result" className={inputCls+' mt-1'} value={selected?.id??'all'} onChange={e=>onChange(e.target.value)}>
   {groups[0]&&<option value="all">All selected trades · {groups[0].tradeIds.length} trade{groups[0].tradeIds.length===1?'':'s'}</option>}
   {markets.map(m=><optgroup key={m} label={m||'Other'}>{groups.slice(1).filter(g=>g.market===m).map(g=><option key={g.id} value={g.id}>{g.label} · {g.from} to {g.to} · {g.tradeIds.length} trade{g.tradeIds.length===1?'':'s'}</option>)}</optgroup>)}
  </select>
  <p className="mt-1 text-[11px] text-slate-500">{selected?.id==='all'?'One comparison across your selected trades.':'Breakdown of the same comparison · daily limits stay shared.'}</p>
 </section>;
}

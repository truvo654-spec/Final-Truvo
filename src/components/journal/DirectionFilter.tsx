import React from 'react';
export type TradeSide = 'long' | 'short';
export const BOTH_SIDES: TradeSide[] = ['long', 'short'];
export const journalSide = (direction: string): TradeSide => direction === 'BUY' ? 'long' : 'short';
export function DirectionFilter({value,onChange,label='Trade direction',disabled=false}:{value:TradeSide[];onChange:(value:TradeSide[])=>void;label?:string;disabled?:boolean}) {
  return <fieldset className="my-3"><legend className="mb-1 text-xs font-semibold">{label}</legend><div className="flex flex-wrap gap-4">{BOTH_SIDES.map(side=><label key={side} className="flex items-center gap-2 text-xs"><input type="checkbox" className="accent-[#5338ec]" checked={value.includes(side)} disabled={disabled} onChange={()=>onChange(value.includes(side)?value.filter(s=>s!==side):[...value,side])}/>{side==='long'?'Long':'Short'}</label>)}</div>{!value.length&&<p className="mt-1 text-xs text-slate-500">Select a direction to show trades.</p>}</fieldset>;
}

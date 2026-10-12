import React from 'react';

/** Compare available evidence only; Infinity is a valid profit factor. */
export function bestValues(values:number[],higherIsBetter=true){
  const available=values.map((value,index)=>({value,index})).filter(({value})=>!Number.isNaN(value));
  if(available.length<2)return {winners:[] as number[],tied:false,allEqual:false};
  const best=(higherIsBetter?Math.max:Math.min)(...available.map(v=>v.value));
  const winners=available.filter(({value})=>value===best||Math.abs(value-best)<1e-9).map(v=>v.index);
  const allEqual=winners.length===available.length;
  return {winners:allEqual?[]:winners,tied:winners.length>1,allEqual};
}

export const bestValueClass='bg-emerald-50 text-emerald-800';
export const BestValueBadge:React.FC<{tied?:boolean}>=({tied=false})=><span className="inline-block rounded px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-bold whitespace-nowrap leading-tight">{tied?'Joint best':'Best'}</span>;

import React,{useState} from 'react';
import {PRICE_INTERVAL_GROUPS,customPriceInterval,type PriceChartInterval,type PriceIntervalUnit} from '../journal/executionPriceStudy';
import {btnSecondary,inputBase} from './ui';

export function ChartTimeframeSelect({value,autoInterval,onChange}:{value:'auto'|PriceChartInterval;autoInterval:PriceChartInterval;onChange:(value:'auto'|PriceChartInterval)=>void}){
 const [editing,setEditing]=useState(false),[amount,setAmount]=useState('20'),[unit,setUnit]=useState<PriceIntervalUnit>('m'),[error,setError]=useState('');
 return <div className="min-w-0">
  <label className="flex flex-wrap items-center gap-2 text-xs text-slate-500">Timeframe<select aria-label="What-if chart timeframe" className={inputBase} value={editing?'custom':value} onChange={e=>{setError('');if(e.target.value==='custom'){setEditing(true);return;}setEditing(false);onChange(e.target.value as 'auto'|PriceChartInterval);}}>
   <option value="auto">Auto ({autoInterval})</option>
   {PRICE_INTERVAL_GROUPS.map(group=><optgroup key={group.label} label={group.label}>{group.options.map(option=><option key={option.value} value={option.value}>{option.label}</option>)}</optgroup>)}
   {value!=='auto'&&!PRICE_INTERVAL_GROUPS.some(group=>group.options.some(option=>option.value===value))&&<option value={value}>{value} (custom)</option>}
   <option value="custom">Custom interval…</option>
  </select></label>
  {editing&&<form noValidate aria-label="Custom What-if chart interval" className="mt-2 rounded-lg bg-slate-50 p-3" onSubmit={e=>{e.preventDefault();const next=customPriceInterval(Number(amount),unit);if(!next){setError(unit==='m'?'Use a multiple of 5 minutes, from 5 to 1440.':`Use a whole number from 1 to ${{h:24,D:365,W:52,M:12}[unit]}.`);return;}onChange(next);setEditing(false);setError('');}}>
   <div className="flex flex-wrap items-center gap-2"><input aria-label="Custom interval amount" type="number" min={unit==='m'?5:1} max={{m:1440,h:24,D:365,W:52,M:12}[unit]} step={unit==='m'?5:1} value={amount} onChange={e=>setAmount(e.target.value)} className={inputBase+' w-20'}/><select aria-label="Custom interval unit" className={inputBase} value={unit} onChange={e=>setUnit(e.target.value as PriceIntervalUnit)}>{[['m','Minutes'],['h','Hours'],['D','Days'],['W','Weeks'],['M','Months']].map(([id,label])=><option key={id} value={id}>{label}</option>)}</select><button type="submit" className={btnSecondary}>Apply</button><button type="button" className={btnSecondary} onClick={()=>{setEditing(false);setError('');}}>Cancel</button></div>
   {error&&<p role="alert" className="mt-2 text-xs text-rose-600">{error}</p>}
  </form>}
 </div>;
}

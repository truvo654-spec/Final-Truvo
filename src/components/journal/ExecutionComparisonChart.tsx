import React, {useEffect,useMemo,useState} from 'react';
import type {ExecutionPoint} from './playbookComparison';
import {buildExecutionSeries,curveAt,nearestChartTime,stepCurvePath,type ChartGroup,type ChartRow,type ExecutionSeries} from './executionChartData';
const control='rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs';
const timeLabel=(at:number)=>new Date(at).toISOString().slice(0,16).replace('T',' ')+' UTC';
const compact=(n:number)=>Math.abs(n)>=1000?(n/1000).toFixed(1)+'k':n.toFixed(0);
export const ExecutionComparisonChart:React.FC<{
  rows:ChartRow[];from:string;to:string;balance:number;currency:string;format:(n:number)=>string;onPoint:(point:ExecutionPoint)=>void;
}> = ({rows,from,to,balance,currency,format,onPoint}) => {
  const [group,setGroup]=useState<ChartGroup>('source');
  const [source,setSource]=useState<'both'|'journal'|'simulated'>('both');
  const [hidden,setHidden]=useState<string[]>([]);
  const [cursor,setCursor]=useState<number|null>(null);
  const [pinned,setPinned]=useState(false);
  const [zoom,setZoom]=useState<[number,number]>([0,100]);
  const [ddUnit,setDdUnit]=useState<'percent'|'money'>('percent');
  const signature=JSON.stringify(rows.map(row=>[row.symbol,row.market,...(['journal','simulated'] as const).map(kind=>row[kind].points.map(p=>[p.id,p.at,p.net]))]));
  const series=useMemo(()=>buildExecutionSeries(rows,group,balance),[signature,group,balance]);
  useEffect(()=>{setCursor(null);setPinned(false);setHidden([]);},[signature,group]);
  useEffect(()=>{setZoom([0,100]);setCursor(null);setPinned(false);},[from,to]);
  const shown=series.filter(s=>(source==='both'||s.source===source)&&!hidden.includes(s.id));
  const nonempty=shown.filter(s=>s.nodes.length);
  const nodes=nonempty.flatMap(s=>s.nodes);
  const baseStart=Math.min(Date.parse(from+'T00:00:00Z'),...nodes.map(p=>p.at));
  const baseEnd=Math.max(Date.parse(to+'T23:59:59Z'),...nodes.map(p=>p.at));
  const start=baseStart+(baseEnd-baseStart)*zoom[0]/100,end=baseStart+(baseEnd-baseStart)*zoom[1]/100;
  const times=[...new Set([start,end,...nodes.filter(p=>p.at>=start&&p.at<=end).map(p=>p.at)])].sort((a,b)=>a-b);
  const at=Math.min(end,Math.max(start,cursor??end));
  const x=(t:number)=>66+(t-start)/Math.max(1,end-start)*628;
  const samples=nonempty.flatMap(s=>[curveAt(s.nodes,start),...s.nodes.filter(p=>p.at>=start&&p.at<=end)]).filter(p=>p!==null);
  const vals=[0,...samples.map(p=>p.cumulative)],rawLo=Math.min(...vals),rawHi=Math.max(...vals),lo=rawLo===rawHi?rawLo-1:rawLo,hi=rawLo===rawHi?rawHi+1:rawHi,span=hi-lo;
  const y=(v:number)=>168-(v-lo+span*0.08)/(span*1.16)*142;
  const ddMetric=ddUnit==='percent'?'drawdownPct':'drawdown';
  const worst=Math.max(0,...samples.map(p=>p[ddMetric])),ddMax=worst||1;
  const dy=(v:number)=>26+v/ddMax*90;
  const ddText=(n:number)=>ddUnit==='percent'?`${n.toFixed(2)}%`:new Intl.NumberFormat('en-US',{style:'currency',currency,maximumFractionDigits:2}).format(n);
  const snapshot=shown.map(s=>({series:s,node:curveAt(s.nodes,at),worst:Math.max(0,...s.nodes.filter(p=>p.at<=at).map(p=>p[ddMetric]))}));
  const pointer=(event:React.PointerEvent<SVGSVGElement>)=>{
    const rect=event.currentTarget.getBoundingClientRect();
    const local=(event.clientX-rect.left)*720/rect.width;
    return nearestChartTime(times,start+Math.max(0,Math.min(1,(local-66)/628))*(end-start));
  };
  const keyboard=(event:React.KeyboardEvent<SVGSVGElement>)=>{
    if(!['ArrowLeft','ArrowRight','Home','End','Escape'].includes(event.key))return;
    event.preventDefault();
    if(event.key==='Escape'){setPinned(false);setCursor(null);return;}
    const index=Math.max(0,times.findIndex(t=>t>=at));
    const next=event.key==='Home'?times[0]:event.key==='End'?times.at(-1)!:times[Math.max(0,Math.min(times.length-1,index+(event.key==='ArrowLeft'?-1:1)))];
    setCursor(next);setPinned(true);
  };
  const events={onPointerMove:(e:React.PointerEvent<SVGSVGElement>)=>{if(!pinned)setCursor(pointer(e));},onPointerLeave:()=>{if(!pinned)setCursor(null);},onClick:(e:React.MouseEvent<SVGSVGElement>)=>{const rect=e.currentTarget.getBoundingClientRect();const local=(e.clientX-rect.left)*720/rect.width;setCursor(nearestChartTime(times,start+Math.max(0,Math.min(1,(local-66)/628))*(end-start)));setPinned(true);},onKeyDown:keyboard};
  const drawLine=(s:ExecutionSeries,drawdown:boolean)=>{
    const node=curveAt(s.nodes,at);
    const path=stepCurvePath(s.nodes,start,end,x,drawdown?dy:y,drawdown?ddMetric:'cumulative');
    return <g key={s.id}>
      {drawdown&&<path d={`${path} L ${x(end)} ${dy(0)} L ${x(start)} ${dy(0)} Z`} fill={s.color} fillOpacity="0.06"/>}
      <path d={path} fill="none" stroke={s.color} strokeWidth="2" strokeDasharray={s.source==='simulated'?'6 3':undefined}/>
      {node&&<circle cx={x(at)} cy={drawdown?dy(node[ddMetric]):y(node.cumulative)} r="4" fill={s.color} stroke="white"><title>{s.label} · {drawdown?ddText(node[ddMetric]):format(node.cumulative)} · last close {timeLabel(node.at)}</title></circle>}
    </g>;
  };
  return <section aria-label="Interactive execution analytics" className="min-w-0 rounded-xl border border-slate-200 bg-white p-4">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><h4 className="text-sm font-bold">P&amp;L &amp; drawdown explorer</h4><p className="mt-1 text-xs text-slate-500">{rows.length} selected instruments · {[...new Set(rows.map(row=>row.market))].join(', ')||'No market selected'}</p></div><label className="text-xs font-semibold">View <select aria-label="Group chart by" className={control} value={group} onChange={e=>setGroup(e.target.value as ChartGroup)}><option value="source">Overall</option><option value="market">By market</option><option value="instrument">By instrument</option></select></label></div>
    <div className="mt-3 flex flex-wrap items-center justify-between gap-3"><div role="group" aria-label="Chart data source" className="inline-flex gap-1 rounded-lg bg-slate-100 p-1">{(['both','journal','simulated'] as const).map(kind=><button key={kind} type="button" aria-pressed={source===kind} onClick={()=>{setSource(kind);setCursor(null);setPinned(false);}} className={`rounded-md px-3 py-1.5 text-xs font-semibold ${source===kind?'bg-white text-[#5338ec] shadow-sm':'text-slate-500'}`}>{kind==='both'?'Compare':kind==='journal'?'Journal':'Backtest'}</button>)}</div><button type="button" onClick={()=>{setHidden([]);setZoom([0,100]);setCursor(null);setPinned(false);setSource('both');}} className="text-xs font-semibold text-[#5338ec]">Reset chart</button></div>
    <div role="group" aria-label="Chart series" className="mt-3 flex max-h-32 flex-wrap gap-2 overflow-y-auto">{series.filter(s=>source==='both'||s.source===source).map(s=><button key={s.id} type="button" aria-label={`Show ${s.label}`} aria-pressed={!hidden.includes(s.id)} onClick={()=>setHidden(current=>current.includes(s.id)?current.filter(id=>id!==s.id):[...current,s.id])} className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-[11px] ${hidden.includes(s.id)?'border-slate-100 text-slate-400':'border-slate-200 text-slate-700'}`}><span aria-hidden="true" className="w-4 border-t-2" style={{borderColor:s.color,borderTopStyle:s.source==='simulated'?'dashed':'solid'}}/>{s.label}<span className="text-slate-400">{s.count}</span></button>)}</div>
    <p className="mt-2 text-[10px] text-slate-500">Solid = journal · dashed = backtest. Click a legend item to hide or show it.</p>
    {!nodes.length?<p className="rounded-lg bg-slate-50 p-6 text-center text-xs text-slate-500">{shown.length?'No closed trades in the visible series. Run a backtest or adjust the selected markets, instruments and dates.':'Select a series above to show its performance.'}</p>:<>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs"><h5 className="font-semibold">Cumulative closed P&amp;L · {currency}</h5><span className="text-[10px] text-slate-500">{pinned?'Pinned':'Hover or use ← →'} · {timeLabel(at)}</span></div>
      <svg viewBox="0 0 720 208" className="mt-1 w-full touch-pan-y rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5338ec]/30" role="group" aria-label="Cumulative P&L chart. Use left and right arrows to inspect closes." tabIndex={0} {...events}>
        {[lo,(lo+hi)/2,hi].map((v,i)=><g key={i}><line x1="66" x2="694" y1={y(v)} y2={y(v)} stroke="#e2e8f0"/><text x="58" y={y(v)+4} textAnchor="end" fontSize="10" fill="#64748b">{compact(v)}</text></g>)}
        {nonempty.map(s=>drawLine(s,false))}<line x1={x(at)} x2={x(at)} y1="18" y2="177" stroke="#94a3b8" strokeDasharray="3 3"/>
        <text x="66" y="198" fontSize="10" fill="#64748b">{new Date(start).toISOString().slice(0,10)}</text><text x="694" y="198" textAnchor="end" fontSize="10" fill="#64748b">{new Date(end).toISOString().slice(0,10)}</text>
      </svg>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2"><h5 className="text-xs font-semibold">Drawdown from peak</h5><label className="text-xs">Unit <select aria-label="Drawdown chart unit" className={control} value={ddUnit} onChange={e=>setDdUnit(e.target.value as 'percent'|'money')}><option value="percent">Percent</option><option value="money">{currency}</option></select></label></div>
      <svg viewBox="0 0 720 148" className="mt-1 w-full touch-pan-y rounded-lg bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-[#5338ec]/30" role="group" aria-label="Linked drawdown chart. Use left and right arrows to inspect closes." tabIndex={0} {...events}>
        {[0,ddMax/2,ddMax].map((v,i)=><g key={i}><line x1="66" x2="694" y1={dy(v)} y2={dy(v)} stroke="#e2e8f0"/><text x="58" y={dy(v)+4} textAnchor="end" fontSize="10" fill="#64748b">{ddUnit==='percent'?`${v===0?'':'−'}${v.toFixed(1)}%`:compact(-v)}</text></g>)}
        {nonempty.map(s=>drawLine(s,true))}<line x1={x(at)} x2={x(at)} y1="18" y2="123" stroke="#94a3b8" strokeDasharray="3 3"/>
        <text x="66" y="140" fontSize="10" fill="#64748b">{new Date(start).toISOString().slice(0,10)}</text><text x="694" y="140" textAnchor="end" fontSize="10" fill="#64748b">{new Date(end).toISOString().slice(0,10)}</text>
      </svg>
      <div role="group" aria-label="Chart zoom" className="mt-3 grid grid-cols-1 gap-3 rounded-lg bg-slate-50 p-3 sm:grid-cols-2"><label className="text-[11px] font-semibold">Zoom start<input aria-label="Chart zoom start" type="range" min={0} max={99} step={1} value={zoom[0]} onChange={e=>{setZoom([Math.min(Number(e.target.value),zoom[1]-1),zoom[1]]);setCursor(null);setPinned(false);}} className="mt-1 block w-full accent-[#5338ec]"/></label><label className="text-[11px] font-semibold">Zoom end<input aria-label="Chart zoom end" type="range" min={1} max={100} step={1} value={zoom[1]} onChange={e=>{setZoom([zoom[0],Math.max(Number(e.target.value),zoom[0]+1)]);setCursor(null);setPinned(false);}} className="mt-1 block w-full accent-[#5338ec]"/></label></div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs"><p className="font-semibold">{pinned?'Selected close':'Snapshot'} · {timeLabel(at)}</p>{pinned&&<button type="button" onClick={()=>{setPinned(false);setCursor(null);}} className="font-semibold text-[#5338ec]">Unpin cursor</button>}</div>
      <div className="mt-2 overflow-x-auto"><table className="w-full text-xs"><thead className="border-b border-slate-200 text-[10px] text-slate-500"><tr>{['Series','Closed P&L','Drawdown','Max drawdown','Closes','Last close / trade'].map(label=><th key={label} className="whitespace-nowrap px-2 py-2 text-left">{label}</th>)}</tr></thead><tbody>{snapshot.map(({series:s,node,worst:maxDD})=><tr key={s.id} className="border-b border-slate-100"><th scope="row" className="whitespace-nowrap px-2 py-2 text-left font-semibold" style={{color:s.color}}>{s.label}</th><td className="whitespace-nowrap px-2 py-2">{format(node?.cumulative??0)}</td><td className="whitespace-nowrap px-2 py-2">{ddText(node?.[ddMetric]??0)}</td><td className="whitespace-nowrap px-2 py-2">{ddText(maxDD)}</td><td className="px-2 py-2">{node?.count??0}</td><td className="whitespace-nowrap px-2 py-2">{node?<><span className="block text-[10px] text-slate-400">{timeLabel(node.at)}</span>{node.trades.map(point=><button key={point.id} type="button" onClick={()=>onPoint(point)} className="mr-2 mt-1 font-semibold text-[#5338ec]">{point.symbol} · View trade</button>)}</>:'No close yet'}</td></tr>)}</tbody></table></div>
      <p className="mt-2 text-[11px] text-slate-500">Move across either chart to inspect both at the same time. Click to pin, or use arrow keys; open the last closed trade from the snapshot. Zoom changes this chart only.</p>
    </>}
    <p className="mt-3 text-[11px] leading-relaxed text-slate-500">Market and instrument choices come from the comparison filters above. Each line applies closed P&amp;L to the {new Intl.NumberFormat('en-US',{style:'currency',currency}).format(balance)} reference balance. Drawdown values are loss magnitudes. Drawdown excludes unrealized moves and is not actual account-equity drawdown. Grouped backtests combine independent instrument results, not a shared-capital portfolio test. Records without exit times use their recorded entry time or date.</p>
  </section>;
};

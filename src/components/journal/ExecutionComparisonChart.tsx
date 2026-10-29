import React from 'react';
import type { comparisonStats, ExecutionPoint } from './playbookComparison';
type Stats=ReturnType<typeof comparisonStats>;
export const ExecutionComparisonChart:React.FC<{journal:Stats;simulated:Stats;from:string;to:string;format:(n:number)=>string;onPoint:(p:ExecutionPoint)=>void}> = ({journal,simulated,from,to,format,onPoint}) => {
  const values=[0,...journal.curve.map(p=>p.cumulative),...simulated.curve.map(p=>p.cumulative)];
  const lo=Math.min(...values),hi=Math.max(...values),span=hi-lo || 1;
  const points=[...journal.points,...simulated.points];
  const start=Math.min(Date.parse(from+'T00:00:00Z'),...points.map(p=>p.at));
  const end=Math.max(Date.parse(to+'T23:59:59Z'),...points.map(p=>p.at));
  const x=(t:number)=>55+(t-start)/Math.max(1,end-start)*620;
  const y=(v:number)=>195-(v-lo)/span*150;
  return <div className="rounded-xl border border-slate-200 bg-white p-3">
    <div className="flex flex-wrap items-center justify-between gap-2 text-xs"><h5 className="font-semibold">Cumulative closed P&amp;L</h5><div className="flex gap-3"><span className="text-[#5338ec]">● Journal</span><span className="text-teal-600">● Simulated</span></div></div>
    {!points.length ? <p className="p-6 text-center text-xs text-slate-500">Closed trades will appear here for your selected dates and instruments.</p> : <>
    <svg viewBox="0 0 720 235" className="mt-2 w-full" role="group" aria-label="Interactive journal versus simulated cumulative closed profit and loss">
      {[lo,(lo+hi)/2,hi].map((v,i)=><g key={i}><line x1="55" x2="675" y1={y(v)} y2={y(v)} stroke="#e2e8f0"/><text x="50" y={y(v)+4} textAnchor="end" fontSize="10" fill="#64748b">{Math.abs(v)>=1000 ? (v/1000).toFixed(1)+'k' : v.toFixed(0)}</text></g>)}
      {([{stats:journal,color:'#5338ec',name:'Journal'},{stats:simulated,color:'#0d9488',name:'Simulated'}]).map(({stats,color,name})=><g key={name}>
        <polyline fill="none" stroke={color} strokeWidth="2" points={[`${x(start)},${y(0)}`,...stats.curve.map(p=>`${x(p.at)},${y(p.cumulative)}`)].join(' ')}/>
        {stats.curve.filter((_,i)=>i%Math.max(1,Math.ceil(stats.curve.length/150))===0 || i===stats.curve.length-1).map(p=><circle key={p.id} cx={x(p.at)} cy={y(p.cumulative)} r="4" fill={color} stroke="white" tabIndex={0} role="button" aria-label={`${name} ${p.symbol} ${new Date(p.at).toISOString().slice(0,10)}, net ${format(p.net)}. View trade`} className="cursor-pointer focus:outline-none focus:stroke-slate-950" onClick={()=>onPoint(p)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onPoint(p);}}}><title>{name} · {p.symbol} · {new Date(p.at).toISOString().slice(0,10)} · net {format(p.net)} · cumulative {format(p.cumulative)}</title></circle>)}
      </g>)}
      <text x="55" y="222" fontSize="10" fill="#64748b">{from}</text><text x="675" y="222" textAnchor="end" fontSize="10" fill="#64748b">{to}</text>
    </svg><p className="text-[11px] text-slate-500">Click a point to inspect its trade. Entry-date cohort, realized closes through the end date, plotted by exit time (UTC). Journal records without an exit time use their recorded date. Hover or focus points for values.</p></>}
  </div>;
};

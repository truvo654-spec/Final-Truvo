import React, { useId, useMemo, useState } from 'react';
import { InfoTooltip } from '../../common/InfoTooltip';
import type { JournalEntry } from '../../../types';
import { formatOverviewValue, scatterPoints, type OverviewDay, type PnlBasis, type RadarMetric } from './overviewAnalytics';

const overviewCard='relative bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 min-w-0 shadow-2xs';
export function MetricHelp({label,definition}:{label:string;definition:string}) {
  return <InfoTooltip label={label} description={definition} />;
}
export function ChartCard({title,definition,children,action}:{title:string;definition:string;children:React.ReactNode;action?:React.ReactNode}) {
  return <article className={overviewCard}><header className="flex items-center justify-between gap-2 mb-3"><h3 className="font-display font-bold text-sm text-slate-900 flex items-center gap-1">{title}<MetricHelp label={title} definition={definition}/></h3>{action}</header>{children}</article>;
}
type Formatter=(value:number|null,compact?:boolean)=>string;
const W=500,H=220,L=65,R=15,T=16,B=35;
type ChartField='cumulative'|'value'|'drawdown'|'riskRatio'|'marginRatio'|'portfolioSize';
type ChartOverlay={label:string;color:string;getValue:(day:OverviewDay)=>number|null};
export function TimeSeriesChart({title,days,field,kind='line',format,onDay,hoverDate,onHover,overlay,primaryLabel='Realized drawdown',pointCount,pointLabel='eligible trades',unknownValueLabel='No eligible realized result',emptyStateLabel='No eligible results in this view.'}:{title:string;days:OverviewDay[];field:ChartField;kind?:'line'|'bar';format:Formatter;onDay:(date:string)=>void;hoverDate:string|null;onHover:(date:string|null)=>void;overlay?:ChartOverlay;primaryLabel?:string;pointCount?:(day:OverviewDay)=>number;pointLabel?:string;unknownValueLabel?:string;emptyStateLabel?:string}) {
  const [table,setTable]=useState(false),[focused,setFocused]=useState<string|null>(null),[escaped,setEscaped]=useState(false),gradient=useId().replace(/:/g,'');
  const points=days.filter(d=>d[field]!=null||(overlay?.getValue(d)!=null)),primaryPoints=points.filter(d=>d[field]!=null),overlayPoints=overlay?points.filter(d=>overlay.getValue(d)!=null):[],active=points.find(d=>d.date===(escaped?null:focused||hoverDate));
  const values=[...primaryPoints.map(d=>d[field]!),...overlayPoints.map(d=>overlay!.getValue(d)!)];
  const low=Math.min(0,...values),high=Math.max(0,...values);
  const lo=low===high&&field==='drawdown'?-1:low,hi=low===high&&field!=='drawdown'?1:high,span=hi-lo;
  const firstDate=points.length?Date.parse(points[0].date):0,lastDate=points.length?Date.parse(points[points.length-1].date):0;
  const inset=kind==='bar'?14:0;
  const y=(v:number)=>T+(hi-v)/span*(H-T-B),x=(i:number)=>L+inset+(points.length<=1?(W-L-R-inset*2)/2:(Date.parse(points[i].date)-firstDate)/(lastDate-firstDate)*(W-L-R-inset*2)),xDate=(date:string)=>x(points.findIndex(d=>d.date===date));
  const path=primaryPoints.map((d,i)=>`${i?'L':'M'}${xDate(d.date)},${y(d[field]!)}`).join(' '),overlayPath=overlayPoints.map((d,i)=>`${i?'L':'M'}${xDate(d.date)},${y(overlay!.getValue(d)!)}`).join(' ');
  const move=(ev:React.MouseEvent<SVGSVGElement>)=>{if(!points.length)return;const rect=ev.currentTarget.getBoundingClientRect(),px=(ev.clientX-rect.left)/rect.width*W;let i=0;points.forEach((_,j)=>{if(Math.abs(x(j)-px)<Math.abs(x(i)-px))i=j;});setEscaped(false);onHover(points[i].date);};
  const key=(ev:React.KeyboardEvent, index:number)=>{if(ev.key==='Escape'){setEscaped(true);onHover(null);ev.stopPropagation();}if(ev.key==='ArrowRight'||ev.key==='ArrowLeft'){ev.preventDefault();const i=Math.max(0,Math.min(primaryPoints.length-1,index+(ev.key==='ArrowRight'?1:-1)));(ev.currentTarget.parentElement?.querySelector(`[data-point="${i}"]`) as SVGElement|undefined)?.focus();}if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();onDay(primaryPoints[index].date);}};
  const activePrimary=active?.[field]??null,activeOverlay=active&&overlay?overlay.getValue(active):null,activeCount=active?(pointCount?pointCount(active):active.n):0;
  return <div>
    <div className="relative min-h-52">
      {!points.length?<p className="text-sm text-slate-500 py-16 text-center">{emptyStateLabel}</p>:<svg viewBox={`0 0 ${W} ${H}`} className="w-full h-52 overflow-visible" role="group" aria-label={title} onMouseMove={move} onMouseLeave={()=>onHover(null)} onClick={ev=>{
        const rect=ev.currentTarget.getBoundingClientRect(),px=(ev.clientX-rect.left)/rect.width*W;let i=0;
        points.forEach((_,j)=>{if(Math.abs(x(j)-px)<Math.abs(x(i)-px))i=j;});onDay(points[i].date);
      }}>
        <defs><linearGradient id={gradient} x1="0" y1="0" x2="0" y2="1"><stop stopColor="var(--color-prime-500)" stopOpacity=".2"/><stop offset="1" stopColor="var(--color-prime-500)" stopOpacity=".02"/></linearGradient></defs>
        {[0,0.5,1].map(f=>{const v=lo+span*f;return <g key={f}><line x1={L} x2={W-R} y1={y(v)} y2={y(v)} stroke="#e2e8f0" strokeDasharray="3 5"/><text x={L-8} y={y(v)+4} textAnchor="end" fontSize="10" fill="#64748b">{format(v,true)}</text></g>;})}
        {kind==='line'&&primaryPoints.length>0&&<><path d={`${path} L${xDate(primaryPoints[primaryPoints.length-1].date)},${y(0)} L${xDate(primaryPoints[0].date)},${y(0)} Z`} fill={`url(#${gradient})`}/><path d={path} fill="none" stroke="var(--color-prime-500)" strokeWidth="2.5" strokeLinejoin="round"/></>}
        {overlay&&overlayPoints.length>1&&<path d={overlayPath} fill="none" stroke={overlay.color} strokeWidth="2.5" strokeDasharray="7 5" strokeLinejoin="round"><title>{overlay.label}</title></path>}
        {active&&<line x1={x(points.indexOf(active))} x2={x(points.indexOf(active))} y1={T} y2={H-B} stroke="var(--color-prime-400)" strokeDasharray="4 4"/>}
        {primaryPoints.map((d,i)=><g key={d.date}>
          {kind==='bar'&&<rect x={xDate(d.date)-Math.min(12,(W-L-R)/points.length*.34)} width={Math.min(24,(W-L-R)/points.length*.68)} y={Math.min(y(0),y(d.value!))} height={Math.max(2,Math.abs(y(0)-y(d.value!)))} rx="2" fill={d.value!>0?'#059669':d.value!<0?'#e11d48':'#64748b'}/>}
          <circle data-point={i} cx={xDate(d.date)} cy={y(d[field]!)} r={active?.date===d.date?5:kind==='bar'?6:primaryPoints.length>20?3:4} fill={kind==='bar'?'transparent':'var(--color-prime-500)'} stroke={active?.date===d.date?'var(--color-prime-500)':'transparent'} strokeWidth="2" role="button" tabIndex={0} aria-label={`${d.date}, ${format(d[field])}, ${pointCount?pointCount(d):d.n} ${pointLabel}. Open day`} onFocus={()=>{setFocused(d.date);setEscaped(false);onHover(d.date);}} onBlur={()=>{setFocused(null);onHover(null);}} onMouseEnter={()=>{setEscaped(false);onHover(d.date);}} onClick={ev=>{ev.stopPropagation();onDay(d.date);}} onKeyDown={ev=>key(ev,i)} className="cursor-pointer focus:outline-none focus:stroke-slate-900"/>
          {(i===0||i===primaryPoints.length-1||(primaryPoints.length>6&&i===Math.floor(primaryPoints.length/2)))&&<text x={xDate(d.date)} y={H-10} textAnchor="middle" fontSize="10" fill="#64748b">{d.date.slice(5)}</text>}
        </g>)}
        {overlay&&overlayPoints.map(d=><circle key={`overlay-${d.date}`} cx={xDate(d.date)} cy={y(overlay.getValue(d)!)} r="3" fill={overlay.color}/>)}
      </svg>}
      {overlay&&<div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-600 mt-1"><span className="inline-flex items-center gap-1"><span className="h-0.5 w-5 bg-prime-500"/>{primaryLabel}</span><span className="inline-flex items-center gap-1"><span className="h-0.5 w-5 border-t-2 border-dashed" style={{borderColor:overlay.color}}/>{overlay.label}</span></div>}
      <div aria-live="polite" className="min-h-8 text-xs text-slate-600 mt-1">{active?<span className="inline-block rounded-lg bg-prime-20 px-2.5 py-2"><strong>{active.date}</strong> · {activePrimary==null?unknownValueLabel:format(activePrimary)}{activeOverlay!=null?` · ${overlay!.label}: ${format(activeOverlay)}`:''} · {activeCount} {pointLabel} / {active.recorded} recorded trades</span>:<span>Hover or focus a point for details. Select it to review that day.</span>}</div>
    </div>
    <button className="text-xs font-semibold text-prime-600 mt-2" onClick={()=>setTable(v=>!v)} aria-expanded={table}>{table?'Hide':'Show'} {title.toLowerCase()} data table</button>
    {table&&<div className="max-h-48 overflow-auto mt-2"><table className="w-full text-xs"><caption className="sr-only">{title}</caption><thead><tr><th className="text-left p-2">UTC entry date</th><th className="text-right p-2">Value</th>{overlay&&<th className="text-right p-2">{overlay.label}</th>}<th className="text-right p-2">Trades</th></tr></thead><tbody>{points.map(d=><tr key={d.date} className="border-t border-slate-100"><td className="p-2"><button className="underline text-prime-600" onClick={()=>onDay(d.date)}>{d.date}</button></td><td className="p-2 text-right tabular-nums">{d[field]==null?'—':format(d[field])}</td>{overlay&&<td className="p-2 text-right tabular-nums">{overlay.getValue(d)==null?'—':format(overlay.getValue(d))}</td>}<td className="p-2 text-right">{d.n}</td></tr>)}</tbody></table></div>}
  </div>;
}

type ComparisonScope='all'|'open';
type ComparisonMode='margin'|'pnl';
export function RiskPortfolioComparisonChart({days,currency,onDay,scope}:{days:OverviewDay[];currency:string;onDay:(date:string)=>void;scope:ComparisonScope}) {
  const [mode,setMode]=useState<ComparisonMode>('margin'),[hoverDate,setHoverDate]=useState<string|null>(null),[table,setTable]=useState(false);
  const W=500,H=220,L=58,R=58,T=16,B=35;
  const config=mode==='margin'
    ? {primaryLabel:scope==='open'?'Open margin / equity %':'Recorded margin / equity %',secondaryLabel:scope==='open'?'Open portfolio size (USD)':'Recorded portfolio size (USD)',primary:(d:OverviewDay)=>scope==='open'?d.openMarginRatio:d.marginRatio,secondary:(d:OverviewDay)=>scope==='open'?d.openPortfolioSize:d.portfolioSize,primaryFormat:(v:number|null)=>v==null?'—':`${v.toFixed(2)}%`,secondaryFormat:(v:number|null)=>formatOverviewValue(v,currency)}
    : {primaryLabel:'Open P&L ROI %',secondaryLabel:'Unrealized P&L (USD)',primary:(d:OverviewDay)=>d.openPnlRoi,secondary:(d:OverviewDay)=>d.unrealized,primaryFormat:(v:number|null)=>v==null?'—':`${v.toFixed(2)}%`,secondaryFormat:(v:number|null)=>formatOverviewValue(v,currency)};
  const points=days.filter(d=>config.primary(d)!=null||config.secondary(d)!=null);
  const primaryPoints=points.filter(d=>config.primary(d)!=null),secondaryPoints=points.filter(d=>config.secondary(d)!=null);
  const primaryValues=primaryPoints.map(d=>config.primary(d)!),secondaryValues=secondaryPoints.map(d=>config.secondary(d)!);
  const primaryLow=Math.min(0,...primaryValues),primaryHigh=Math.max(0,...primaryValues),primarySpan=primaryLow===primaryHigh?1:primaryHigh-primaryLow;
  const secondaryLow=Math.min(0,...secondaryValues),secondaryHigh=Math.max(0,...secondaryValues),secondarySpan=secondaryLow===secondaryHigh?1:secondaryHigh-secondaryLow;
  const firstDate=points.length?Date.parse(points[0].date):0,lastDate=points.length?Date.parse(points[points.length-1].date):0;
  const x=(i:number)=>L+(points.length<=1?(W-L-R)/2:(Date.parse(points[i].date)-firstDate)/(lastDate-firstDate)*(W-L-R));
  const xDate=(date:string)=>x(points.findIndex(d=>d.date===date));
  const yPrimary=(v:number)=>T+(primaryHigh-v)/primarySpan*(H-T-B),ySecondary=(v:number)=>T+(secondaryHigh-v)/secondarySpan*(H-T-B);
  const path=(source:typeof config.primary,scale:(value:number)=>number)=>points.filter(d=>source(d)!=null).map((d,i)=>`${i?'L':'M'}${xDate(d.date)},${scale(source(d)!)}`).join(' ');
  const active=points.find(d=>d.date===hoverDate);
  const axisFormat=(value:number,kind:'primary'|'secondary')=>kind==='primary'?config.primaryFormat(value):config.secondaryFormat(value);
  return <div>
    <div role="tablist" aria-label="Risk and open P&L comparison" className="mb-3 grid grid-cols-2 gap-2">
      <button type="button" role="tab" aria-selected={mode==='margin'} onClick={()=>{setMode('margin');setHoverDate(null);}} className={`rounded-lg border px-2 py-1.5 text-xs font-semibold ${mode==='margin'?'border-prime-500 bg-prime-20 text-prime-700':'border-slate-200 text-slate-600'}`}>Margin % vs portfolio USD</button>
      <button type="button" role="tab" aria-selected={mode==='pnl'} onClick={()=>{setMode('pnl');setHoverDate(null);}} className={`rounded-lg border px-2 py-1.5 text-xs font-semibold ${mode==='pnl'?'border-prime-500 bg-prime-20 text-prime-700':'border-slate-200 text-slate-600'}`}>Open P&amp;L ROI vs USD</button>
    </div>
    {!points.length?<p className="py-16 text-center text-sm text-slate-500">{mode==='margin'?'No recorded margin or portfolio-size evidence in this view.':'No reported open P&L evidence in this view.'}</p>:<svg viewBox={`0 0 ${W} ${H}`} className="w-full h-52 overflow-visible" role="group" aria-label={`${config.primaryLabel} compared with ${config.secondaryLabel}`} onMouseMove={ev=>{const rect=ev.currentTarget.getBoundingClientRect(),px=(ev.clientX-rect.left)/rect.width*W;let i=0;points.forEach((_,j)=>{if(Math.abs(x(j)-px)<Math.abs(x(i)-px))i=j;});setHoverDate(points[i].date);}} onMouseLeave={()=>setHoverDate(null)} onClick={()=>{if(active)onDay(active.date);}}>
      {[0,.5,1].map(f=>{const primaryValue=primaryLow+primarySpan*f;return <g key={f}><line x1={L} x2={W-R} y1={yPrimary(primaryValue)} y2={yPrimary(primaryValue)} stroke="#e2e8f0" strokeDasharray="3 5"/><text x={L-8} y={yPrimary(primaryValue)+4} textAnchor="end" fontSize="10" fill="#64748b">{axisFormat(primaryValue,'primary')}</text></g>;})}
      <text x={L} y={T-4} textAnchor="start" fontSize="10" fill="#64748b">%</text><text x={W-R} y={T-4} textAnchor="end" fontSize="10" fill="#64748b">USD</text>
      {primaryPoints.length>1&&<path d={path(config.primary,yPrimary)} fill="none" stroke="var(--color-prime-500)" strokeWidth="2.5" strokeLinejoin="round"/>}
      {secondaryPoints.length>1&&<path d={path(config.secondary,ySecondary)} fill="none" stroke="#d97706" strokeWidth="2.5" strokeDasharray="7 5" strokeLinejoin="round"/>}
      {active&&<line x1={x(points.indexOf(active))} x2={x(points.indexOf(active))} y1={T} y2={H-B} stroke="var(--color-prime-400)" strokeDasharray="4 4"/>}
      {primaryPoints.map(d=><circle key={`primary-${d.date}`} cx={xDate(d.date)} cy={yPrimary(config.primary(d)!)} r={active?.date===d.date?5:4} fill="var(--color-prime-500)" role="button" tabIndex={0} aria-label={`${d.date}, ${config.primaryLabel} ${config.primaryFormat(config.primary(d))}`} onMouseEnter={()=>setHoverDate(d.date)} onFocus={()=>setHoverDate(d.date)} onBlur={()=>setHoverDate(null)} onClick={ev=>{ev.stopPropagation();onDay(d.date);}} className="cursor-pointer focus:outline-none focus:stroke-slate-900"/> )}
      {secondaryPoints.map(d=><circle key={`secondary-${d.date}`} cx={xDate(d.date)} cy={ySecondary(config.secondary(d)!)} r={active?.date===d.date?5:3} fill="#d97706" role="button" tabIndex={0} aria-label={`${d.date}, ${config.secondaryLabel} ${config.secondaryFormat(config.secondary(d))}`} onMouseEnter={()=>setHoverDate(d.date)} onFocus={()=>setHoverDate(d.date)} onBlur={()=>setHoverDate(null)} onClick={ev=>{ev.stopPropagation();onDay(d.date);}} className="cursor-pointer focus:outline-none focus:stroke-slate-900"/> )}
      {points.map((d,i)=>(i===0||i===points.length-1||(points.length>6&&i===Math.floor(points.length/2)))&&<text key={`date-${d.date}`} x={x(i)} y={H-10} textAnchor="middle" fontSize="10" fill="#64748b">{d.date.slice(5)}</text>)}
    </svg>}
    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-600"><span className="inline-flex items-center gap-1"><span className="h-0.5 w-5 bg-prime-500"/>{config.primaryLabel}</span><span className="inline-flex items-center gap-1"><span className="h-0.5 w-5 border-t-2 border-dashed border-amber-600"/>{config.secondaryLabel}</span></div>
    <div aria-live="polite" className="min-h-8 text-xs text-slate-600 mt-1">{active?<span className="inline-block rounded-lg bg-prime-20 px-2.5 py-2"><strong>{active.date}</strong> · {config.primaryLabel}: {config.primaryFormat(config.primary(active))} · {config.secondaryLabel}: {config.secondaryFormat(config.secondary(active))}</span>:<span>Hover or focus a point for both values. Select it to review that day.</span>}</div>
    <button className="text-xs font-semibold text-prime-600 mt-2" onClick={()=>setTable(v=>!v)} aria-expanded={table}>{table?'Hide':'Show'} comparison data table</button>
    {table&&<div className="max-h-48 overflow-auto mt-2"><table className="w-full text-xs"><caption className="sr-only">{config.primaryLabel} compared with {config.secondaryLabel}</caption><thead><tr><th className="text-left p-2">UTC entry date</th><th className="text-right p-2">{config.primaryLabel}</th><th className="text-right p-2">{config.secondaryLabel}</th></tr></thead><tbody>{points.map(d=><tr key={d.date} className="border-t border-slate-100"><td className="p-2"><button className="underline text-prime-600" onClick={()=>onDay(d.date)}>{d.date}</button></td><td className="p-2 text-right tabular-nums">{config.primaryFormat(config.primary(d))}</td><td className="p-2 text-right tabular-nums">{config.secondaryFormat(config.secondary(d))}</td></tr>)}</tbody></table></div>}
  </div>;
}

export function CoverageRadar({profitRisk,strategyDiscipline}:{profitRisk:RadarMetric[];strategyDiscipline:RadarMetric[]}) {
  const [mode,setMode]=useState<'profit-risk'|'strategy-discipline'>('profit-risk');
  const [active,setActive]=useState<number|null>(null);
  const axes=mode==='profit-risk'?profitRisk:strategyDiscipline;
  const position=(i:number,scale:number)=>{const a=-Math.PI/2+i*Math.PI/3;return [150+Math.cos(a)*scale*76,110+Math.sin(a)*scale*76];};
  const polygon=(scale:number)=>axes.map((_,i)=>position(i,scale).join(',')).join(' ');
  const selected=active==null?null:axes[active];
  return <div>
    <div role="tablist" aria-label="Journal analysis view" className="mb-3 grid grid-cols-2 gap-2">
      <button type="button" role="tab" aria-selected={mode==='profit-risk'} onClick={()=>{setMode('profit-risk');setActive(null);}} className={`rounded-lg border px-2 py-1.5 text-xs font-semibold ${mode==='profit-risk'?'border-prime-500 bg-prime-20 text-prime-700':'border-slate-200 text-slate-600'}`}>Profit &amp; risk</button>
      <button type="button" role="tab" aria-selected={mode==='strategy-discipline'} onClick={()=>{setMode('strategy-discipline');setActive(null);}} className={`rounded-lg border px-2 py-1.5 text-xs font-semibold ${mode==='strategy-discipline'?'border-prime-500 bg-prime-20 text-prime-700':'border-slate-200 text-slate-600'}`}>Strategy &amp; discipline</button>
    </div>
    <div className="relative">
      <svg viewBox="0 0 300 220" className="w-full h-52" role="group" aria-label={`${mode==='profit-risk'?'Profit and risk':'Strategy and discipline'} journal analysis`}>
        {[.25,.5,.75,1].map(s=><polygon key={s} points={polygon(s)} fill="none" stroke="#e2e8f0"/>)}
        {axes.map((a,i)=>{const [x,y]=position(i,1);return <line key={a.label} x1="150" y1="110" x2={x} y2={y} stroke="#e2e8f0"/>;})}
        <polygon points={axes.map((a,i)=>position(i,(a.value||0)/100).join(',')).join(' ')} fill="var(--color-prime-500)" fillOpacity=".15" stroke="var(--color-prime-500)" strokeWidth="2"/>
        {axes.map((a,i)=>{const [x,y]=position(i,(a.value||0)/100),[lx,ly]=position(i,1.24);return <g key={a.label}><text x={lx} y={ly+4} textAnchor="middle" fontSize="10" fill="#475569">{a.label}</text><circle cx={x} cy={y} r="5" fill="var(--color-prime-500)" role="button" tabIndex={0} aria-label={`${a.label}: ${a.display}`} onMouseEnter={()=>setActive(i)} onMouseLeave={()=>setActive(null)} onFocus={()=>setActive(i)} onBlur={()=>setActive(null)} onClick={()=>setActive(i)} onKeyDown={ev=>{if(ev.key==='Escape'){ev.stopPropagation();setActive(null);}if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();setActive(i);}}} className="cursor-pointer focus:stroke-slate-900 focus:stroke-2"/></g>;})}
      </svg>
      {selected&&<div role="dialog" aria-label={`${selected.label} details`} className="rounded-xl border border-prime-200 bg-prime-20 p-3 text-xs text-slate-700 shadow-sm">
        <div className="flex items-start justify-between gap-3"><div><p className="font-bold text-slate-900">{selected.label}</p><p className="mt-1 text-base font-mono font-semibold">{selected.display}</p></div><button type="button" aria-label="Close metric details" className="text-prime-700 font-semibold" onClick={()=>setActive(null)}>Close</button></div>
        <p className="mt-2">{selected.description}</p>
        <p className="mt-2 text-slate-500">The radar distance is a comparable 0–100 visual scale; the value above is the recorded metric.</p>
      </div>}
    </div>
    <p className="text-xs text-slate-600 mt-2">{selected?`Selected ${selected.label}. Click another corner for its details.`:mode==='profit-risk'?'Profit and risk factors use recorded results and risk evidence; missing values stay unknown.':'Strategy and discipline describe journal evidence and outcomes; they are not an automatic grade.'}</p>
    <details className="text-xs mt-2"><summary className="text-prime-600 cursor-pointer font-semibold">View all metric details</summary><dl className="mt-2 space-y-2">{axes.map(a=><div key={a.label}><dt className="font-semibold text-slate-600">{a.label} · {a.display}</dt><dd className="text-slate-500">{a.description}</dd></div>)}</dl></details>
  </div>;
}

export function TradeScatter({entries,basis,kind,format,onTrade}:{entries:JournalEntry[];basis:PnlBasis;kind:'time'|'duration';format:Formatter;onTrade:(id:string)=>void}) {
  const points=useMemo(()=>scatterPoints(entries,basis,kind),[entries,basis,kind]),[selected,setSelected]=useState<string|null>(null),[pinned,setPinned]=useState(false),[table,setTable]=useState(false);
  const chosen=points.find(p=>p.id===selected),overlap=chosen?points.filter(p=>Math.abs(p.x-chosen.x)<(kind==='time'?.25:.01) && Math.abs(p.value-chosen.value)<Math.max(1,...points.map(p=>Math.abs(p.value)))*.04):[];
  const lo=Math.min(0,...points.map(p=>p.value)),high=Math.max(0,...points.map(p=>p.value)),hi=high===lo?lo+1:high,span=hi-lo;
  const x=(v:number)=>L+v/(kind==='time'?24:5)*(W-L-R),y=(v:number)=>T+(hi-v)/span*(H-T-B);
  return <div onKeyDown={ev=>{if(ev.key==='Escape'){ev.stopPropagation();setPinned(false);setSelected(null);}}}>
    {!points.length?<p className="py-16 text-center text-sm text-slate-500">No eligible trades with {kind==='time'?'entry times':'complete duration evidence'}.</p>:<svg viewBox={`0 0 ${W} ${H}`} className="w-full h-52" role="group" aria-label={`Trade ${kind} performance in UTC`} onMouseLeave={()=>{if(!pinned)setSelected(null);}}>
      {[0,.5,1].map(f=>{const v=lo+span*f;return <g key={f}><line x1={L} x2={W-R} y1={y(v)} y2={y(v)} stroke="#e2e8f0" strokeDasharray="3 5"/><text x={L-8} y={y(v)+4} fontSize="10" textAnchor="end" fill="#64748b">{format(v,true)}</text></g>;})}
      {(kind==='time'?['00','06','12','18','24']:['<15m','15–60m','1–4h','4–24h','1–7d','≥7d']).map((label,i)=><text key={label} x={x(kind==='time'?i*6:i)} y={H-10} textAnchor="middle" fontSize="10" fill="#64748b">{label}</text>)}
      {points.map((p,i)=><circle key={p.id} cx={x(p.x)} cy={y(p.value)} r={selected===p.id?6:4} fill={p.value>0?'#059669':p.value<0?'#e11d48':'#64748b'} fillOpacity=".75" stroke={selected===p.id?'var(--color-prime-600)':'transparent'} strokeWidth="2" role="button" tabIndex={0} aria-label={`${p.symbol}, ${p.date} ${p.time} UTC, ${format(p.value)}. Show overlapping trades`} onMouseEnter={()=>{if(!pinned)setSelected(p.id);}} onFocus={()=>{setSelected(p.id);setPinned(true);}} onClick={()=>{setSelected(p.id);setPinned(true);}} onKeyDown={ev=>{
        if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();setSelected(p.id);setPinned(true);}
        if(ev.key==='ArrowRight'||ev.key==='ArrowLeft'){
          ev.preventDefault();
          const index=Math.max(0,Math.min(points.length-1,i+(ev.key==='ArrowRight'?1:-1)));
          (ev.currentTarget.parentElement?.querySelectorAll('[role="button"]')[index] as SVGElement)?.focus();
        }
      }} className="cursor-pointer focus:outline-none focus:stroke-slate-900"/>)}
    </svg>}
    <div className="min-h-10 mt-2 text-xs text-slate-600">{chosen?<div className="rounded-xl bg-prime-20 p-3"><div className="flex justify-between gap-2 mb-2"><span>{overlap.length} nearby trade{overlap.length===1?'':'s'} · {pinned?'pinned':'select to pin'}</span><button className="text-prime-600" onClick={()=>{setPinned(false);setSelected(null);}}>Dismiss details</button></div><ul className="max-h-36 overflow-auto space-y-1">{(pinned?overlap:overlap.slice(0,12)).map(p=><li key={p.id}><button className="w-full text-left rounded-lg p-1.5 hover:bg-white focus-visible:outline-2 focus-visible:outline-prime-500" onClick={()=>onTrade(p.id)}>{p.symbol} · {p.date} {p.time} UTC · {format(p.value)}{kind==='duration'?` · ${Math.round(p.minutes)} min`:''}</button></li>)}</ul>{!pinned&&overlap.length>12&&<p>+{overlap.length-12} more; select a dot to pin the full list.</p>}</div>:<p>Focus or select a dot, then select its trade. Missing times are excluded.</p>}</div>
    <button className="text-xs font-semibold text-prime-600 mt-2" aria-expanded={table} onClick={()=>setTable(v=>!v)}>{table?'Hide':'Show'} trade {kind} data table ({points.length})</button>
    {table&&<div className="max-h-48 overflow-auto mt-2"><table className="w-full text-xs"><thead><tr><th className="text-left p-2">Trade</th><th className="text-left p-2">UTC entry</th><th className="text-right p-2">Result</th></tr></thead><tbody>{points.map(p=><tr key={p.id} className="border-t border-slate-100"><td className="p-2"><button className="text-prime-600 underline" onClick={()=>onTrade(p.id)}>{p.symbol}</button></td><td className="p-2">{p.date} {p.time}{kind==='duration'?` · ${Math.round(p.minutes)}m`:''}</td><td className="p-2 text-right">{format(p.value)}</td></tr>)}</tbody></table></div>}
  </div>;
}

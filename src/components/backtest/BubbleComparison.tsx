import React,{useEffect,useMemo,useState} from 'react';
import type {DashboardScope,DashboardSource,DashboardRow} from './dashboardData';
import {comparisonAxis,comparisonBubbles,comparisonSize,comparisonValue,METRIC_LABELS,ORIGIN_LABELS,type ComparisonBubble,type ComparisonDimension,type ComparisonMetric,type ComparisonOrigin,type ComparisonSize} from './dashboardComparison';
import {inputCls,btnPrimary} from './ui';

interface Options {dimension:ComparisonDimension;origin:'all'|ComparisonOrigin;x:ComparisonMetric;y:ComparisonMetric;size:ComparisonSize;color:'origin'|'market'|'playbook'|'result'}
const DEFAULTS:Options={dimension:'playbook',origin:'all',x:'winRate',y:'pf',size:'trades',color:'origin'};
const CHOICES={dimension:['playbook','market','instrument','result'],origin:['all',...Object.keys(ORIGIN_LABELS)],x:Object.keys(METRIC_LABELS),y:Object.keys(METRIC_LABELS),size:['trades','net','drawdown','r'],color:['origin','market','playbook','result']};
function loadOptions():Options {try {const saved=JSON.parse(localStorage.getItem('ms_dashboard_bubbles_v1')||'{}'),options={...DEFAULTS};for(const key of Object.keys(DEFAULTS) as (keyof Options)[])if(CHOICES[key].includes(saved[key]))(options as Record<string,string>)[key]=saved[key];return options;}catch{return DEFAULTS;}}
const PALETTE=['#5338ec','#0d9488','#d97706','#0284c7','#db2777','#7c3aed','#475569','#be123c','#4d7c0f','#a16207'];
const ORIGIN_COLORS:Record<ComparisonOrigin,string>={'playbook-test':'#5338ec','journal-test':'#0284c7',journal:'#0d9488',practice:'#d97706'};
const stableColor=(text:string)=>PALETTE[Array.from(text).reduce((n,c)=>(n*31+c.charCodeAt(0))>>>0,0)%PALETTE.length];
const DIMENSION_LABELS:Record<ComparisonDimension,string>={playbook:'Playbooks',market:'Markets',instrument:'Instruments',result:'Saved results'};
const SIZE_LABELS:Record<ComparisonSize,string>={trades:'Trade count',net:'Net result · magnitude',drawdown:'Max drawdown',r:'Total R · magnitude'};
const financial=(metric:string)=>['net','drawdown','expectancy'].includes(metric);
const fixed=(v:number,d=2)=>v===Infinity?'∞':v.toLocaleString('en-US',{maximumFractionDigits:d});
interface Props {groups:{source:DashboardSource;rows:DashboardRow[]}[];scope:DashboardScope;unit:DashboardScope['unit'];onScope:(patch:Partial<DashboardScope>)=>void;onInspect:(bubble:ComparisonBubble)=>void}

export function BubbleComparison({groups,scope,unit,onScope,onInspect}:Props){
  const [options,setOptions]=useState(loadOptions),[active,setActive]=useState(''),[hover,setHover]=useState('');
  const patch=(values:Partial<Options>)=>{setOptions(o=>({...o,...values}));setActive('');setHover('');};
  useEffect(()=>{try{localStorage.setItem('ms_dashboard_bubbles_v1',JSON.stringify(options));}catch{}},[options]);
  const bubbles=useMemo(()=>comparisonBubbles(groups,options.dimension,options.origin),[groups,options.dimension,options.origin]);
  const points=useMemo(()=>bubbles.map(b=>({bubble:b,x:comparisonValue(b,options.x,unit),y:comparisonValue(b,options.y,unit),size:comparisonSize(b,options.size,unit)})),[bubbles,options.x,options.y,options.size,unit]);
  const plotted=points.filter((p):p is typeof p & {x:number;y:number;size:number}=>p.x!==null&&p.y!==null&&p.size!==null&&!Number.isNaN(p.x)&&!Number.isNaN(p.y)&&Number.isFinite(p.size));
  const hidden=bubbles.length-plotted.length;
  const xa=comparisonAxis(plotted.map(p=>p.x),options.x),ya=comparisonAxis(plotted.map(p=>p.y),options.y,.7);
  const W=920,H=355,M={l:85,r:54,t:47,b:64},pw=W-M.l-M.r,ph=H-M.t-M.b;
  const sx=(v:number)=>M.l+xa.position(v)*pw,sy=(v:number)=>H-M.b-ya.position(v)*ph;
  const maxSize=Math.max(1,...plotted.map(p=>p.size));
  const radius=(size:number)=>Math.max(6,30*Math.sqrt(size/maxSize));
  const colorLabel=(b:ComparisonBubble)=>options.color==='origin'?ORIGIN_LABELS[b.origin]:options.color==='result'?b.source.name:options.color==='playbook'?b.playbook:b.market;
  const color=(b:ComparisonBubble)=>options.color==='origin'?ORIGIN_COLORS[b.origin]:stableColor(options.color==='result'?b.source.id:colorLabel(b));
  const legend=[...new Map(bubbles.map(b=>[options.color==='result'?b.source.id:colorLabel(b),{text:colorLabel(b),color:color(b)}])).values()];
  const focused=bubbles.find(b=>b.id===(hover||active))??bubbles[0];
  const money=(v:number)=>scope.privacy?'Hidden':new Intl.NumberFormat('en-US',{style:'currency',currency:scope.currency,maximumFractionDigits:2}).format(v);
  const valueText=(v:number|null,metric:ComparisonMetric):string=>v===null?'—':metric==='winRate'?fixed(v,1)+'%':metric==='avgR'?fixed(v)+'R':financial(metric)?scope.privacy?'Hidden':unit==='money'?money(v):fixed(v)+(unit==='r'?'R':'%'):fixed(v,metric==='trades'?0:2);
  const metricLabel=(metric:ComparisonMetric)=>METRIC_LABELS[metric]+(financial(metric)?' · '+(unit==='money'?scope.currency:unit==='r'?'R':'%'):'');
  const privacyBlocked=scope.privacy&&unit==='money'&&(financial(options.x)||financial(options.y)||financial(options.size));
  const summary=(b:ComparisonBubble)=>`${b.name} · ${b.source.name} · ${b.instrument} · ${ORIGIN_LABELS[b.origin]}`;
  const caption=scope.from||scope.to?`${scope.from||'First result'} to ${scope.to||'Last result'}`:'All result dates';
  return <div className="space-y-4">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div role="group" aria-label="Compare by" className="flex max-w-full flex-wrap gap-1 rounded-xl bg-slate-100 p-1">{(Object.keys(DIMENSION_LABELS) as ComparisonDimension[]).map(d=><button key={d} aria-pressed={options.dimension===d} onClick={()=>patch({dimension:d})} className={`rounded-lg px-3 py-2 text-xs font-semibold ${options.dimension===d?'bg-white text-[#5338ec] shadow-sm':'text-slate-500 hover:text-slate-800'}`}>{DIMENSION_LABELS[d]}</button>)}</div>
      <label className="flex items-center gap-2 text-xs font-semibold">Data<select aria-label="Bubble data source" value={options.origin} onChange={e=>patch({origin:e.target.value as Options['origin']})} className={`${inputCls} !w-auto !max-w-full`}><option value="all">All selected results</option>{(Object.entries(ORIGIN_LABELS) as [ComparisonOrigin,string][]).map(([key,name])=><option key={key} value={key}>{name}</option>)}</select></label>
    </div>
    <div className="grid grid-cols-1 items-end gap-3 rounded-xl bg-[#FAF8FF] p-3 sm:grid-cols-2 lg:grid-cols-[auto_auto_1fr]">
      <label className="min-w-0 text-[11px] font-semibold">From · result date<input aria-label="Comparison start date" type="date" value={scope.from} onInput={e=>onScope({from:e.currentTarget.value})} onChange={e=>onScope({from:e.target.value})} className={`${inputCls} mt-1 !text-xs`}/></label>
      <label className="min-w-0 text-[11px] font-semibold">To · result date<input aria-label="Comparison end date" type="date" value={scope.to} onInput={e=>onScope({to:e.currentTarget.value})} onChange={e=>onScope({to:e.target.value})} className={`${inputCls} mt-1 !text-xs`}/></label>
      <p className="pb-2 text-[11px] text-slate-500 sm:col-span-2 lg:col-span-1">{caption} · {scope.timezone} · {plotted.length} bubbles</p>
    </div>
    <details className="rounded-xl border border-[#DED5FF] px-3 py-2"><summary className="cursor-pointer text-xs font-semibold text-[#5338ec]">Customize chart · axes, size & color</summary><div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {(['x','y'] as const).map(axis=><label key={axis} className="text-[11px] font-semibold">{axis.toUpperCase()} axis<select aria-label={`Bubble ${axis.toUpperCase()} axis`} value={options[axis]} onChange={e=>patch({[axis]:e.target.value as ComparisonMetric})} className={`${inputCls} mt-1 !text-xs`}>{(Object.keys(METRIC_LABELS) as ComparisonMetric[]).map(m=><option key={m} value={m}>{metricLabel(m)}</option>)}</select></label>)}
      <label className="text-[11px] font-semibold">Bubble size<select aria-label="Bubble size" value={options.size} onChange={e=>patch({size:e.target.value as ComparisonSize})} className={`${inputCls} mt-1 !text-xs`}>{(Object.keys(SIZE_LABELS) as ComparisonSize[]).map(s=><option key={s} value={s}>{SIZE_LABELS[s]}</option>)}</select></label>
      <label className="text-[11px] font-semibold">Bubble color<select aria-label="Bubble color" value={options.color} onChange={e=>patch({color:e.target.value as Options['color']})} className={`${inputCls} mt-1 !text-xs`}><option value="origin">Result type</option><option value="market">Market</option><option value="playbook">Playbook</option><option value="result">Saved result</option></select></label>
    </div><button className="mt-3 text-xs font-semibold text-[#5338ec]" onClick={()=>{setOptions(DEFAULTS);setActive('');setHover('');}}>Reset chart defaults</button></details>
    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500"><span><b className="text-slate-700">X</b> {metricLabel(options.x)}</span><span><b className="text-slate-700">Y</b> {metricLabel(options.y)}</span><span><b className="text-slate-700">Size</b> {SIZE_LABELS[options.size]}</span><span><b className="text-slate-700">Color</b> {options.color==='origin'?'Result type':options.color}</span></div>
    {privacyBlocked?<div className="rounded-xl bg-slate-50 p-8 text-center text-sm text-slate-500">Privacy hides charts that encode monetary values. <button className="font-semibold text-[#5338ec]" onClick={()=>patch({x:'winRate',y:'pf',size:'trades'})}>Show win rate vs profit factor</button></div>:!plotted.length?<div role="status" className="rounded-xl bg-slate-50 p-8 text-center text-sm text-slate-500">No bubbles match these metrics and filters. Choose another data source, date range or axis.</div>:<>
      <p className="text-[10px] text-slate-500 sm:hidden">Swipe the chart sideways to see every bubble.</p><div className="overflow-x-auto rounded-xl bg-[#FCFBFF]">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto min-w-[600px] w-full select-none" role="group" aria-label="Performance bubble comparison" onMouseLeave={()=>setHover('')}>
          <text x={M.l} y={17} fontSize={11} fill="#475569" fontWeight={600}>{metricLabel(options.y)}</text>
          {xa.ticks.map((v,i)=><g key={'x'+i}><line x1={sx(v)} x2={sx(v)} y1={M.t} y2={H-M.b} stroke="#e2e8f0" strokeDasharray="3 5"/><text x={sx(v)} y={H-M.b+21} textAnchor="middle" fontSize={10} fill="#64748b">{valueText(v,options.x)}</text></g>)}
          {ya.ticks.map((v,i)=><g key={'y'+i}><line x1={M.l} x2={W-M.r} y1={sy(v)} y2={sy(v)} stroke="#e2e8f0" strokeDasharray="3 5"/><text x={M.l-12} y={sy(v)+4} textAnchor="end" fontSize={10} fill="#64748b">{valueText(v,options.y)}</text></g>)}
          {xa.infinity&&<g><line x1={sx(Infinity)-38} x2={sx(Infinity)-38} y1={M.t} y2={H-M.b} stroke="#a78bfa" strokeDasharray="5 5"/><text x={sx(Infinity)} y={H-M.b+21} textAnchor="middle" fontSize={12} fill="#5338ec">∞</text></g>}
          {ya.infinity&&<g><line x1={M.l} x2={W-M.r} y1={sy(Infinity)+33} y2={sy(Infinity)+33} stroke="#a78bfa" strokeDasharray="5 5"/><text x={M.l-12} y={sy(Infinity)+4} textAnchor="end" fontSize={12} fill="#5338ec">∞</text></g>}
          {options.x==='winRate'&&<line x1={sx(50)} x2={sx(50)} y1={M.t} y2={H-M.b} stroke="#c4b5fd" strokeDasharray="5 5"/>}
          {options.y==='pf'&&ya.max>=1&&<line x1={M.l} x2={W-M.r} y1={sy(1)} y2={sy(1)} stroke="#c4b5fd" strokeDasharray="5 5"/>}
          {[...plotted].sort((a,b)=>b.size-a.size).map(({bubble:b,x,y,size})=><g key={b.id}>
            <circle cx={sx(x)} cy={sy(y)} r={radius(size)} fill={color(b)} fillOpacity={focused?.id===b.id ? .28 : .16} stroke={color(b)} strokeWidth={focused?.id===b.id?3:1.8} tabIndex={0} role="button" aria-pressed={active===b.id} aria-label={`Inspect ${summary(b)}: ${METRIC_LABELS[options.x]} ${valueText(x,options.x)}, ${METRIC_LABELS[options.y]} ${valueText(y,options.y)}, ${b.rows.length} trades`} onMouseEnter={()=>setHover(b.id)} onFocus={()=>{setActive(b.id);setHover('');}} onClick={()=>{setActive(b.id);setHover('');}} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();setActive(b.id);setHover('');}}} className="cursor-pointer focus:outline-none focus:stroke-slate-900"><title>{summary(b)}</title></circle>
            {plotted.length<=12&&<text x={sx(x)} y={sy(y)-radius(size)-7} textAnchor="middle" fontSize={10} fontWeight={600} fill={color(b)} pointerEvents="none">{b.name.length>24?b.name.slice(0,22)+'…':b.name}</text>}
          </g>)}
          <text x={M.l+pw/2} y={H-12} textAnchor="middle" fontSize={11} fill="#475569" fontWeight={600}>{metricLabel(options.x)}</text>
        </svg>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-slate-600">{legend.map((v,i)=><span key={i} className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{backgroundColor:v.color}}/>{v.text}</span>)}</div>
    </>}
    <p className="text-[11px] text-slate-500">Each bubble stays within one saved result. Market and instrument views split that result into comparable groups. Dates filter recorded closes; no test is rerun.{options.size!=='trades'?' Size uses magnitude; the details show the sign.':''}{xa.infinity||ya.infinity?' ∞ marks profit with no losses, separate from the finite scale.':''}{hidden?` ${hidden} group(s) lack a selected metric; their results remain in the list below.`:''}</p>
    {bubbles.length>0&&<div className="rounded-xl border border-[#DED5FF] bg-[#FAF8FF] p-4">
      <label className="block text-[11px] font-semibold">Explore a bubble<select aria-label="Explore comparison bubble" className={`${inputCls} mt-1 !text-xs`} value={focused?.id??''} onChange={e=>{setActive(e.target.value);setHover('');}}>{bubbles.map(b=><option key={b.id} value={b.id}>{summary(b)} · {b.rows.length} trades{b.source.run?' · '+b.source.run.from+' to '+b.source.run.to+' · saved '+b.source.run.lastRun.slice(0,16).replace('T',' '):''}</option>)}</select></label>
      {focused&&<><div className="mt-3 flex flex-wrap items-start justify-between gap-3"><div><h4 className="text-sm font-bold">{focused.name}</h4><p className="mt-1 text-[11px] text-slate-500">{ORIGIN_LABELS[focused.origin]} · {focused.market} · {focused.instrument} · {focused.rows.map(r=>r.day).sort().at(0)} to {focused.rows.map(r=>r.day).sort().at(-1)}</p>{focused.origin==='journal-test'&&<p className="mt-1 text-[11px] text-slate-500">Simulated test started from journal selections · {focused.source.run?.sourceTradeIds?.length} linked journal records.</p>}</div><button className={btnPrimary} onClick={()=>onInspect(focused)}>View {focused.rows.length} trades</button></div><div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">{(['winRate','pf','net','avgR'] as ComparisonMetric[]).map(m=><div key={m}><p className="text-[10px] text-slate-500">{metricLabel(m)}</p><p className="mt-1 text-base font-bold">{valueText(comparisonValue(focused,m,unit),m)}</p></div>)}</div><p className="mt-3 text-[10px] text-slate-500">{focused.rows.length} trades · R available for {focused.stats.rCoverage}/{focused.rows.length}. Select overlapping bubbles from this list.{focused.rows.length<10?' Small sample.':''}</p></>}
    </div>}
  </div>;
}

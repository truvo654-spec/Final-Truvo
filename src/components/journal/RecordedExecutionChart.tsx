import React,{useEffect,useMemo,useRef,useState} from 'react';
import type {PriceLine} from '../backtest/charts';
import {LinkedPerformancePanes,LINKED_PANE_HEIGHT,linkedValueAt,type LinkedPanel} from '../backtest/linkedPerformance';
import type {ExecutionPoint} from './playbookComparison';
import {executionPrice} from './playbookComparison';
import {recordedFillAnchors,recordedTimeTicks,type PriceChartInterval} from './executionPriceStudy';
const dateTime=(at:number)=>new Date(at).toISOString().slice(0,16).replace('T',' ')+' UTC';

/** A navigable timeline of actual fills, never synthetic market candles. */
export const RecordedExecutionChart:React.FC<{
  points:ExecutionPoint[];selected?:string;from:number;to:number;symbol:string;timeframe:PriceChartInterval;
  onSelect:(point:ExecutionPoint)=>void;panels:LinkedPanel[];lines:PriceLine[];
}> = ({points,selected,from,to,symbol,timeframe,onSelect,panels,lines}) => {
  const container=useRef<HTMLDivElement>(null),svgRef=useRef<SVGSVGElement>(null);
  const [width,setWidth]=useState(760),[hoverTime,setHoverTime]=useState<number|null>(null);
  useEffect(()=>setHoverTime(null),[from,to,symbol,timeframe]);
  useEffect(()=>{
    const node=container.current;if(!node)return;
    const update=()=>setWidth(Math.max(280,Math.round(node.getBoundingClientRect().width)));update();
    if(typeof ResizeObserver==='undefined')return;
    const observer=new ResizeObserver(update);observer.observe(node);return()=>observer.disconnect();
  },[]);
  const allRecords=useMemo(()=>points.map(point=>({point,anchors:recordedFillAnchors(point)})).filter(record=>record.anchors.length),[points]);
  const records=allRecords.map(record=>({...record,anchors:record.anchors.filter(a=>a.time>=from&&a.time<to)})).filter(record=>record.anchors.length);
  const prices=records.flatMap(record=>record.anchors.map(a=>a.price));
  const scalePrices=[...(prices.length?prices:allRecords.flatMap(record=>record.anchors.map(a=>a.price))),...lines.map(line=>line.price)];
  const lo=scalePrices.length?Math.min(...scalePrices):0,hi=scalePrices.length?Math.max(...scalePrices):1,pad=(hi-lo)*0.1||Math.max(1,Math.abs(hi)*0.01);
  const left=8,right=64,plotWidth=width-left-right,height=260+panels.length*LINKED_PANE_HEIGHT+16;
  const x=(time:number)=>left+(time-from)/Math.max(1,to-from)*plotWidth,y=(price:number)=>232-(price-lo+pad)/(hi-lo+2*pad)*220;
  const times=[...new Set([from,to-1,...records.flatMap(record=>record.anchors.map(a=>a.time)),...panels.flatMap(panel=>panel.points.map(p=>p.at))])].filter(t=>t>=from&&t<to).sort((a,b)=>a-b);
  const choose=(point:ExecutionPoint)=>{setHoverTime(Math.max(from,Math.min(to-1,point.entryAt)));onSelect(point);};
  return <div ref={container} className="relative mt-3">
    <svg ref={svgRef} viewBox={`0 0 ${width} ${height}`} className="w-full h-auto cursor-crosshair select-none" role="group" aria-label={`${symbol} recorded entry and exit prices`} tabIndex={0}
      onFocus={event=>{if(event.target===event.currentTarget&&hoverTime===null)setHoverTime(to-1);}} onBlur={()=>setHoverTime(null)} onMouseLeave={()=>setHoverTime(null)}
      onMouseMove={event=>{const rect=svgRef.current?.getBoundingClientRect();if(rect)setHoverTime(Math.min(to-1,from+Math.max(0,Math.min(1,((event.clientX-rect.left)/rect.width*width-left)/plotWidth))*(to-from)));}}
      onKeyDown={event=>{if(!['ArrowLeft','ArrowRight','Home','End','Escape'].includes(event.key))return;event.preventDefault();if(event.key==='Escape'){setHoverTime(null);return;}const at=hoverTime??to-1;setHoverTime(event.key==='Home'?from:event.key==='End'?to-1:event.key==='ArrowLeft'?(times.filter(t=>t<at).at(-1)??from):(times.find(t=>t>at)??to-1));}}>
      {scalePrices.length>0&&[lo,(lo+hi)/2,hi].filter((value,index,list)=>list.indexOf(value)===index).map(price=><g key={price}><line x1={left} x2={width-right} y1={y(price)} y2={y(price)} stroke="#e2e8f0" strokeDasharray="3 4"/><text x={width-right+6} y={y(price)+3} fontSize="10" fill="#64748b">{executionPrice(price,symbol)}</text></g>)}
      {recordedTimeTicks(from,to,timeframe).map(at=><line key={at} x1={x(at)} x2={x(at)} y1="10" y2="232" stroke="#e2e8f0" strokeDasharray="3 4"/>)}
      {lines.map(line=><g key={line.label}><line x1={left} x2={width-right} y1={y(line.price)} y2={y(line.price)} stroke={line.color} strokeDasharray={line.dashed?'5 4':undefined}/><rect x={width-right+2} y={y(line.price)-8} width={right-4} height="16" rx="3" fill={line.color}/><text x={width-right+6} y={y(line.price)+3} fontSize="9" fill="white" fontWeight="700">{line.label}</text></g>)}
      {records.map(({point,anchors})=><g key={point.id}>
        {anchors.length===2&&<line x1={x(anchors[0].time)} x2={x(anchors[1].time)} y1={y(anchors[0].price)} y2={y(anchors[1].price)} stroke={point.net<0?'#e11d48':'#059669'} strokeWidth={selected===point.id?2:1.2} strokeDasharray="4 3"/>}
        {anchors.map(anchor=><g key={anchor.kind} role="button" tabIndex={0} aria-label={`Select journal trade ${point.id} ${anchor.kind}`} className="cursor-pointer focus:outline-none focus:stroke-slate-950" onFocus={()=>setHoverTime(anchor.time)} onClick={()=>choose(point)} onKeyDown={event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();event.stopPropagation();choose(point);}}}>
          <circle cx={x(anchor.time)} cy={y(anchor.price)} r={selected===point.id?6:5} fill={anchor.kind==='exit'?'#5338ec':point.journal?.direction==='BUY'?'#059669':'#e11d48'} stroke="white" strokeWidth="1.5"/>
          {selected===point.id&&<text x={x(anchor.time)} y={y(anchor.price)-10} textAnchor="middle" fontSize="10" fill="#0b1c30">{anchor.kind}</text>}
          <title>{`${anchor.kind} · ${executionPrice(anchor.price,symbol)} · ${anchor.dayOnly?new Date(anchor.time).toISOString().slice(0,10)+' (day only)':dateTime(anchor.time)}`}</title>
        </g>)}
      </g>)}
      {!records.length&&<text x={left+plotWidth/2} y="115" textAnchor="middle" fontSize="12" fill="#64748b">{allRecords.length?'No recorded fills in this view. Browse or choose Full period.':'No recorded fills for this instrument in the selected dates.'}</text>}
      <LinkedPerformancePanes panels={panels} top={260} left={left} right={right} width={width} start={from} end={to-1} x={x} hoverTime={hoverTime}/>
      {hoverTime!==null&&<line aria-label="Shared time cursor" x1={x(hoverTime)} x2={x(hoverTime)} y1="10" y2={height-25} stroke="#64748b" strokeDasharray="3 3"/>}
      <text x={left} y={height-6} fontSize="11" fill="#64748b">{new Date(from).toISOString().slice(5,16).replace('T',' ')} UTC</text><text x={width-right} y={height-6} textAnchor="end" fontSize="11" fill="#64748b">{new Date(to-1).toISOString().slice(5,16).replace('T',' ')} UTC</text>
    </svg>
    {hoverTime!==null&&<div role="status" className="pointer-events-none absolute top-6 left-2 right-2 sm:right-auto rounded-lg bg-[#0b1c30] p-3 text-[11px] text-white shadow-lg"><p>{dateTime(hoverTime)}</p><p>Recorded fills · {timeframe} time grid</p>{panels.map(panel=><p key={panel.id}>{panel.label} {panel.format(linkedValueAt(panel.points,hoverTime))}</p>)}</div>}
  </div>;
};

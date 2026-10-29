import React from 'react';
import type {Bar} from '../../backtest/types';

export interface LinkedPanel {
  id:string;label:string;color:string;points:{at:number;value:number}[];
  format:(value:number)=>string;axisFormat?:(value:number)=>string;underwater?:boolean;
}
export function linkedValueAt(points:LinkedPanel['points'],at:number):number {
  let lo=0,hi=points.length;
  while(lo<hi){const mid=(lo+hi)>>>1;if(points[mid].at<=at)lo=mid+1;else hi=mid;}
  return lo?points[lo-1].value:0;
}
export function candleIndexAt(bars:Bar[],at:number):number {
  let lo=0,hi=bars.length;
  while(lo<hi){const mid=(lo+hi)>>>1;if(bars[mid].t<=at)lo=mid+1;else hi=mid;}
  return Math.max(0,lo-1);
}
/** Map exact closes into the candle chart's compressed session-time axis. */
export function candleTimePosition(bars:Bar[],from:number,to:number,at:number,end:number):number {
  const size=to-from;if(size<1)return 0;
  const i=Math.max(from,Math.min(to-1,candleIndexAt(bars,at)));
  const next=i+1<to?bars[i+1].t:end;
  const fraction=Math.max(0,Math.min(1,(at-bars[i].t)/Math.max(1,next-bars[i].t)));
  return Math.max(0,Math.min(1,(i-from+0.5+fraction*(i===to-1?0.5:1))/size));
}
/** Inverse of the shared candle scale, used by every pane's pointer cursor. */
export function candlePositionTime(bars:Bar[],from:number,to:number,position:number,end:number):number {
  if(to<=from)return end;
  const offset=Math.max(0,Math.min(to-from-0.5,position*(to-from)-0.5));
  const i=Math.min(to-1,from+Math.floor(offset));
  const next=i+1<to?bars[i+1].t:end;
  const fraction=Math.min(1,(offset-Math.floor(offset))*(i===to-1?2:1));
  return bars[i].t+fraction*(next-bars[i].t);
}
export function linkedStepPath(points:LinkedPanel['points'],start:number,end:number,x:(at:number)=>number,y:(value:number)=>number):string {
  let path=`M ${x(start)} ${y(linkedValueAt(points,start))}`;
  for(const point of points){if(point.at<=start||point.at>end)continue;path+=` H ${x(point.at)} V ${y(point.value)}`;}
  return path+` H ${x(end)}`;
}

export const LINKED_PANE_HEIGHT=94;
export const LinkedPerformancePanes:React.FC<{
  panels:LinkedPanel[];top:number;left:number;right:number;width:number;
  start:number;end:number;x:(at:number)=>number;hoverTime:number|null;
}> = ({panels,top,left,right,width,start,end,x,hoverTime}) => <>{panels.map((panel,index)=>{
  const offset=top+index*LINKED_PANE_HEIGHT,plotTop=offset+25,plotBottom=offset+LINKED_PANE_HEIGHT-10;
  const visible=[linkedValueAt(panel.points,start),...panel.points.filter(p=>p.at>start&&p.at<=end).map(p=>p.value)];
  const lo=panel.underwater?0:Math.min(0,...visible),hi=Math.max(0,...visible),span=hi-lo||1;
  const y=(value:number)=>panel.underwater?plotTop+(value-lo)/span*(plotBottom-plotTop):plotBottom-(value-lo)/span*(plotBottom-plotTop);
  const ticks=[lo,(lo+hi)/2,hi].filter((value,i,all)=>all.indexOf(value)===i);
  const path=linkedStepPath(panel.points,start,end,x,y),value=linkedValueAt(panel.points,hoverTime??end);
  return <g key={panel.id} role="group" aria-label={panel.label}>
    <rect x={left} y={offset+2} width={width-left-right} height={LINKED_PANE_HEIGHT-4} fill="#f8fafc" rx="4"/>
    <text x={left+3} y={offset+15} fontSize="11" fill="#0b1c30" fontWeight="600">{panel.label}</text>
    <text x={width-right-3} y={offset+15} textAnchor="end" fontSize="11" fill={panel.color} fontWeight="600">{panel.format(value)}</text>
    {ticks.map(tick=><g key={tick}><line x1={left} x2={width-right} y1={y(tick)} y2={y(tick)} stroke="#e2e8f0" strokeDasharray="3 4"/><text x={width-right+6} y={y(tick)+3} fontSize="10" fill="#64748b">{(panel.axisFormat??panel.format)(tick)}</text></g>)}
    {panel.underwater&&<path d={`${path} L ${x(end)} ${y(0)} H ${x(start)} Z`} fill={panel.color} opacity="0.09"/>}
    <path d={path} fill="none" stroke={panel.color} strokeWidth="1.8"/>
    {hoverTime!==null&&<circle cx={x(hoverTime)} cy={y(value)} r="3" fill={panel.color} stroke="white"/>}
  </g>;
})}</>;

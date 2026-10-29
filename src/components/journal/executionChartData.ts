import type { ExecutionPoint } from './playbookComparison';
export type ChartGroup = 'source' | 'market' | 'instrument';
export type ChartSource = 'journal' | 'simulated';
export interface ChartRow {symbol:string;market:string;journal:{points:ExecutionPoint[]};simulated:{points:ExecutionPoint[]}}
export interface CurveNode {at:number;cumulative:number;drawdown:number;drawdownPct:number;count:number;trades:ExecutionPoint[]}
export interface ExecutionSeries {id:string;label:string;group:string;source:ChartSource;color:string;nodes:CurveNode[];count:number}
const COLORS=['#5338ec','#0891b2','#d97706','#db2777','#059669','#4f46e5','#9333ea','#475569'];

/** Aggregate simultaneous closes before computing peaks, avoiding artificial ordering drawdowns. */
export function executionCurve(points:ExecutionPoint[],balance:number):CurveNode[] {
  const grouped=new Map<number,ExecutionPoint[]>();
  for(const point of points){
    if(!Number.isFinite(point.at)||!Number.isFinite(point.net))continue;
    grouped.set(point.at,[...(grouped.get(point.at)??[]),point]);
  }
  let cumulative=0,peak=balance,count=0;
  return [...grouped].sort(([a],[b])=>a-b).map(([at,trades])=>{
    cumulative+=trades.reduce((sum,point)=>sum+point.net,0);count+=trades.length;
    const equity=balance+cumulative;peak=Math.max(peak,equity);
    const drawdown=Math.max(0,peak-equity);
    return {at,cumulative,drawdown,drawdownPct:peak>0?drawdown/peak*100:0,count,trades};
  });
}
export function buildExecutionSeries(rows:ChartRow[],groupBy:ChartGroup,balance:number):ExecutionSeries[] {
  const groups=new Map<string,ChartRow[]>();
  for(const row of rows){const group=groupBy==='source'?'All selected':groupBy==='market'?row.market:row.symbol;groups.set(group,[...(groups.get(group)??[]),row]);}
  return [...groups].flatMap(([group,items],index)=>(['journal','simulated'] as const).map(source=>{
    const points=items.flatMap(row=>row[source].points);
    return {id:`${groupBy}:${group}:${source}`,label:groupBy==='source'?(source==='journal'?'Journal':'Backtest'):`${group} · ${source==='journal'?'Journal':'Backtest'}`,group,source,color:groupBy==='source'?(source==='journal'?'#5338ec':'#0d9488'):COLORS[index%COLORS.length],nodes:executionCurve(points,balance),count:points.length};
  }));
}
/** Right-continuous closed-result value; no future data is read while hovering. */
export function curveAt(nodes:CurveNode[],at:number):CurveNode|null {
  let lo=0,hi=nodes.length;
  while(lo<hi){const mid=(lo+hi)>>>1;if(nodes[mid].at<=at)lo=mid+1;else hi=mid;}
  return lo>0?nodes[lo-1]:null;
}
export function nearestChartTime(times:number[],at:number):number|null {
  if(!times.length)return null;
  let lo=0,hi=times.length;
  while(lo<hi){const mid=(lo+hi)>>>1;if(times[mid]<at)lo=mid+1;else hi=mid;}
  if(lo===0)return times[0];if(lo===times.length)return times.at(-1)!;
  return at-times[lo-1]<=times[lo]-at?times[lo-1]:times[lo];
}
export function stepCurvePath(nodes:CurveNode[],start:number,end:number,x:(at:number)=>number,y:(value:number)=>number,metric:'cumulative'|'drawdown'|'drawdownPct') {
  const initial=curveAt(nodes,start)?.[metric]??0;
  let path=`M ${x(start)} ${y(initial)}`;
  for(const node of nodes){if(node.at<=start||node.at>end)continue;path+=` H ${x(node.at)} V ${y(node[metric])}`;}
  return path+` H ${x(end)}`;
}

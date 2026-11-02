import type {WhatIfTrade} from '../../backtest/whatif';
import {executionCurve} from '../journal/executionChartData';
import type {LineSeries} from './charts';
import {linkedValueAt} from './linkedPerformance';

/** Reuse Playbook close-time grouping; drawdown is monetary, with no assumed balance. */
export function whatIfPerformance(trades:WhatIfTrade[],actual:boolean){
 const included=trades.filter(t=>actual||t.status!=='skipped');
 const nodes=executionCurve(included.map(t=>({id:t.id,at:t.exitTime,entryAt:t.entryTime,symbol:t.symbol,net:actual?t.actualNet:t.newNet,r:actual?t.actualR:t.newR})),0);
 return {nodes,count:included.length,net:nodes.at(-1)?.cumulative??0,maxDD:Math.max(0,...nodes.map(n=>n.drawdown))};
}

/** Carry the last known close into the viewport without reading any later close. */
export function windowWhatIfSeries(series:LineSeries[],start:number,end:number):LineSeries[]{
 return series.map(s=>{const points=s.points.map(p=>({at:p.x,value:p.y}));return {...s,points:[{x:start,y:linkedValueAt(points,start)},...s.points.filter(p=>p.x>start&&p.x<end),{x:end,y:linkedValueAt(points,end)}]};});
}

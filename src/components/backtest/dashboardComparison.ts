import {instrumentKey} from '../journal/playbookExecution';
import {dashboardMarket,dashboardStats,type DashboardRow,type DashboardSource} from './dashboardData';

export type ComparisonDimension='playbook'|'market'|'instrument'|'result';
export type ComparisonOrigin='playbook-test'|'journal-test'|'journal'|'practice';
export type ComparisonMetric='winRate'|'pf'|'payoff'|'avgR'|'net'|'expectancy'|'drawdown'|'trades';
export type ComparisonSize='trades'|'net'|'drawdown'|'r';
export const ORIGIN_LABELS:Record<ComparisonOrigin,string>={'playbook-test':'Playbook test','journal-test':'Test from journal','journal':'Recorded journal','practice':'Practice'};
export const METRIC_LABELS:Record<ComparisonMetric,string>={winRate:'Win rate',pf:'Profit factor',payoff:'Avg win / loss',avgR:'Average R',net:'Net result',expectancy:'Expectancy',drawdown:'Max drawdown',trades:'Trade count'};
export interface ComparisonBubble {id:string;name:string;source:DashboardSource;rows:DashboardRow[];origin:ComparisonOrigin;playbook:string;market:string;instrument:string;stats:ReturnType<typeof dashboardStats>}
export const comparisonOrigin=(source:DashboardSource):ComparisonOrigin=>source.kind==='Journal'?'journal':source.kind==='Practice'?'practice':source.run?.sourceTradeIds?.length?'journal-test':'playbook-test';
const category=(rows:DashboardRow[],get:(row:DashboardRow)=>string)=>{const values=[...new Set(rows.map(get))];return values.length===1?values[0]:'Multiple';};
// Partition within each result: never combine overlapping runs or their balances.
export function comparisonBubbles(groups:{source:DashboardSource;rows:DashboardRow[]}[],dimension:ComparisonDimension,origin:'all'|ComparisonOrigin='all'):ComparisonBubble[]{
  return groups.flatMap(({source,rows})=>{
    const kind=comparisonOrigin(source);if(origin!=='all'&&origin!==kind)return [];
    const buckets=new Map<string,DashboardRow[]>();
    for(const row of rows){const key=dimension==='playbook'?(row.bookId||row.strategy||'Unassigned'):dimension==='market'?dashboardMarket(row):dimension==='instrument'?instrumentKey(row.symbol):source.id;buckets.set(key,[...(buckets.get(key)??[]),row]);}
    return [...buckets].map(([key,list])=>{
      const playbook=category(list,r=>r.strategy||'Unassigned'),market=category(list,dashboardMarket),instrument=category(list,r=>r.symbol);
      return {id:JSON.stringify([source.id,dimension,key]),name:dimension==='playbook'?playbook:dimension==='market'?market:dimension==='instrument'?instrument:source.name,source,rows:list,origin:kind,playbook,market,instrument,stats:dashboardStats(list,source.balance)};
    });
  });
}
export function comparisonValue(bubble:ComparisonBubble,metric:ComparisonMetric,unit:'money'|'r'|'percent'):number|null {
  const m=bubble.stats;
  if(metric==='trades')return m.count;
  if(metric==='winRate'||metric==='pf'||metric==='payoff'||metric==='avgR')return m[metric];
  if(unit==='percent'&&!bubble.source.balance)return null;
  const rows=unit==='r'?bubble.rows.filter(r=>r.r!==null):bubble.rows;
  if(!rows.length)return null;
  const value=(r:DashboardRow)=>unit==='r'?r.r!:unit==='percent'?100*r.net/bubble.source.balance!:r.net;
  const net=rows.reduce((s,r)=>s+value(r),0);
  if(metric==='net')return net;
  if(metric==='expectancy')return net/rows.length;
  // Group simultaneous closes before measuring a peak-to-trough decline.
  const closes=new Map<number,number>();rows.forEach(r=>closes.set(r.at,(closes.get(r.at)??0)+value(r)));
  let total=0,peak=0,dd=0;[...closes].sort(([a],[b])=>a-b).forEach(([,v])=>{total+=v;peak=Math.max(peak,total);dd=Math.max(dd,peak-total);});return dd;
}
export function comparisonSize(bubble:ComparisonBubble,size:ComparisonSize,unit:'money'|'r'|'percent'):number|null {
  if(size==='r')return bubble.stats.rCoverage?Math.abs(bubble.rows.reduce((n,r)=>n+(r.r??0),0)):null;
  const v=comparisonValue(bubble,size,unit);return v===null?null:Math.abs(v);
}
export function comparisonAxis(values:(number|null)[],metric:ComparisonMetric,finiteShare=.86){
  const finite=values.filter((v):v is number=>v!==null&&Number.isFinite(v));
  const infinity=values.includes(Infinity);
  let min=metric==='winRate'?0:Math.min(0,...finite),max=metric==='winRate'?100:Math.max(0,...finite);
  if(min===max){if(min===0)max=1;else {min-=Math.abs(min)*.1;max+=Math.abs(max)*.1;}}
  const step=(max-min)/4;
  const ticks=Array.from({length:5},(_,i)=>min+i*step);
  // Infinity has its own labeled band; it is never shown as a finite PF.
  const position=(v:number)=>v===Infinity?1:(v-min)/(max-min)*(infinity?finiteShare:1);
  return {min,max,ticks,infinity,position};
}

import type { JournalEntry } from '../../../types';
import { eligible, metrics, netOf, resultOf, timestampMs } from '../journalMath';
import { reviewStateOf } from '../tradingStatus';

export type PnlBasis='gross'|'net';
export const overviewValue=(e:JournalEntry,basis:PnlBasis):number|null=>!eligible(e,basis)?null:basis==='gross'?e.pnl:netOf(e);
const sum=(values:number[])=>Math.round(values.reduce((a,b)=>a+b,0)*100)/100;
export interface OverviewDay {
  date:string; ids:string[]; recorded:number; n:number; value:number|null;
  cumulative:number|null; drawdown:number|null; reviewed:number; wins:number; losses:number; be:number;
}
export function aggregateOverview(entries:JournalEntry[],basis:PnlBasis='net') {
  const base=metrics(entries,basis),net=metrics(entries),gross=sum(net.list.map(e=>e.pnl));
  const grouped=new Map<string,JournalEntry[]>();
  entries.forEach(e=>{const group=grouped.get(e.date)||[];group.push(e);grouped.set(e.date,group);});
  let cumulative=0,peak=0;
  const daily:OverviewDay[]=[...grouped].sort(([a],[b])=>a.localeCompare(b)).map(([date,es])=>{
    const m=metrics(es,basis),value=m.n?m.total:null;
    if(value!=null){cumulative=sum([cumulative,value]);peak=Math.max(peak,cumulative);}
    return {date,ids:es.map(e=>e.id),recorded:es.length,n:m.n,value,cumulative:value==null?null:cumulative,drawdown:value==null?null:sum([cumulative,-peak]),reviewed:es.filter(e=>reviewStateOf(e)==='complete').length,wins:m.wins,losses:m.losses,be:m.be};
  });
  const days=daily.filter(d=>d.n),winningDays=days.filter(d=>d.value!>0.005).length;
  const winners=base.list.filter(e=>resultOf(e,basis)==='win'),losers=base.list.filter(e=>resultOf(e,basis)==='loss');
  const avgWin=winners.length?sum(winners.map(e=>overviewValue(e,basis)!))/winners.length:null;
  const avgLoss=losers.length?sum(losers.map(e=>overviewValue(e,basis)!))/losers.length:null;
  const coverage=(n:number)=>entries.length?n/entries.length*100:null;
  return {base,daily,net,gross:net.n?gross:null,costs:net.n?net.fees:null,
    dayWinRate:days.length?winningDays/days.length*100:null,days:days.length,winningDays,
    avgWin,avgLoss,winLossRatio:avgWin!=null&&avgLoss!=null?avgWin/Math.abs(avgLoss):null,
    coverage:[{label:'Known net',value:coverage(net.n)},{label:'Reviewed',value:coverage(entries.filter(e=>reviewStateOf(e)==='complete').length)},
      {label:'Plan answer',value:coverage(entries.filter(e=>typeof e.followedPlan==='boolean').length)},
      {label:'Risk recorded',value:coverage(entries.filter(e=>Number.isFinite(e.initialRisk)&&e.initialRisk!>0).length)},
      {label:'Both emotions',value:coverage(entries.filter(e=>e.emotionBefore&&e.emotionAfter).length)},
      {label:'Timing',value:coverage(entries.filter(e=>Number.isFinite(timestampMs(e.entryTime))&&Number.isFinite(timestampMs(e.exitTime))).length)}]};
}
export const formatOverviewValue=(v:number|null,currency:string,compact=false)=> {
  if(v==null||!Number.isFinite(v))return '—';
  return new Intl.NumberFormat('en-US',{style:'currency',currency,signDisplay:'exceptZero',maximumFractionDigits:compact?1:2,notation:compact?'compact':'standard'}).format(Math.abs(v)<0.0000001?0:v);
};
export function scatterPoints(entries:JournalEntry[],basis:PnlBasis,kind:'time'|'duration') {
  return entries.flatMap(e=>{
    const value=overviewValue(e,basis),entry=timestampMs(e.entryTime),exit=timestampMs(e.exitTime);
    if(value==null||!Number.isFinite(entry))return [];
    const d=new Date(entry),minutes=(exit-entry)/60000;
    if(kind==='duration'&&(!Number.isFinite(exit)||minutes<0))return [];
    const x=kind==='time'?d.getUTCHours()+d.getUTCMinutes()/60+d.getUTCSeconds()/3600:minutes<15?0:minutes<60?1:minutes<240?2:minutes<1440?3:minutes<10080?4:5;
    return [{id:e.id,date:e.date,symbol:e.symbol,x,value,time:d.toISOString().slice(11,19),minutes}];
  });
}

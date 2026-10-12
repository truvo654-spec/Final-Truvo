import type { JournalEntry } from '../../../types';
import { eligible, metrics, netOf, resultOf, statusOf, timestampMs } from '../journalMath';
import { reviewStateOf } from '../tradingStatus';

export type PnlBasis='gross'|'net';
export interface RadarMetric {
  label:string;
  value:number|null;
  display:string;
  description:string;
}
export const overviewValue=(e:JournalEntry,basis:PnlBasis):number|null=>!eligible(e,basis)?null:basis==='gross'?e.pnl:netOf(e);
const sum=(values:number[])=>Math.round(values.reduce((a,b)=>a+b,0)*100)/100;
const ratioScore=(value:number|null,max=3)=>value==null?null:value===Infinity?100:Math.max(0,Math.min(100,value/max*100));
const rScore=(value:number|null)=>value==null?null:Math.max(0,Math.min(100,(value+1)/4*100));
const percentDisplay=(value:number|null)=>value==null?'—':`${value.toFixed(1)}%`;
const numberDisplay=(value:number|null,suffix='')=>value==null?'—':`${value===Infinity?'∞':value.toFixed(2)}${suffix}`;
const averageRatio=(entries:JournalEntry[],kind:'risk'|'margin')=>{
  const values=entries.map(e=>{
    const numerator=kind==='risk'?e.initialRisk:e.marginAtEntry;
    return Number.isFinite(numerator)&&(kind==='risk'?numerator!>0:numerator!>=0)&&Number.isFinite(e.equityAtEntry)&&e.equityAtEntry!>0
      ? numerator!/e.equityAtEntry!*100
      : null;
  }).filter((value):value is number=>value!=null&&Number.isFinite(value));
  return {value:values.length?sum(values)/values.length:null,count:values.length};
};
const openExposure=(entries:JournalEntry[],kind:'risk'|'margin',includeReportedPnl=false)=>{
  const equityFor=(entry:JournalEntry)=>{
    if(!Number.isFinite(entry.equityAtEntry)||entry.equityAtEntry!<=0)return null;
    if(!includeReportedPnl)return entry.equityAtEntry!;
    if(entry.pnlKnown===false||!Number.isFinite(entry.pnl))return null;
    const current=entry.equityAtEntry!+entry.pnl;
    return current>0?current:null;
  };
  const numerator=entries.reduce((total,e)=>{
    const value=kind==='risk'?e.initialRisk:e.marginAtEntry;
    return Number.isFinite(value)&&(kind==='risk'?value!>0:value!>=0)?total+value!:total;
  },0);
  const equity=entries.reduce((total,e)=>{const value=equityFor(e);return value!=null?total+value:total;},0);
  const count=entries.filter(e=>{
    const value=kind==='risk'?e.initialRisk:e.marginAtEntry;
    return Number.isFinite(value)&&(kind==='risk'?value!>0:value!>=0)&&equityFor(e)!=null;
  }).length;
  return {amount:numerator||null,equity:equity||null,value:equity?numerator/equity*100:null,count};
};
export interface OverviewDay {
  date:string; ids:string[]; recorded:number; n:number; value:number|null;
  cumulative:number|null; drawdown:number|null; unrealized:number|null;
  riskRatio:number|null; marginRatio:number|null; portfolioSize:number|null;
  openMarginRatio:number|null; openPortfolioSize:number|null; openPnlRoi:number|null;
  riskRatioCount:number; marginRatioCount:number; portfolioSizeCount:number;
  reviewed:number; wins:number; losses:number; be:number;
}
export interface OpenPositionExposure {
  count:number;
  riskAmount:number|null;
  equity:number|null;
  riskRatio:number|null;
  riskObservations:number;
  marginAmount:number|null;
  marginRatio:number|null;
  marginObservations:number;
  reportedPnl:number|null;
}
export function aggregateOverview(entries:JournalEntry[],basis:PnlBasis='net') {
  const base=metrics(entries,basis),net=metrics(entries),gross=sum(net.list.map(e=>e.pnl));
  const grouped=new Map<string,JournalEntry[]>();
  entries.forEach(e=>{const group=grouped.get(e.date)||[];group.push(e);grouped.set(e.date,group);});
  let cumulative=0,peak=0;
  const daily:OverviewDay[]=[...grouped].sort(([a],[b])=>a.localeCompare(b)).map(([date,es])=>{
    const m=metrics(es,basis),value=m.n?m.total:null;
    if(value!=null){cumulative=sum([cumulative,value]);peak=Math.max(peak,cumulative);}
    const openValues=es.filter(e=>statusOf(e)==='open'&&e.pnlKnown!==false&&Number.isFinite(e.pnl)).map(e=>e.pnl);
    const risk=averageRatio(es,'risk'),margin=averageRatio(es,'margin');
    const portfolioValues=es.map(e=>e.equityAtEntry).filter((value):value is number=>Number.isFinite(value)&&value>0);
    const openEntries=es.filter(e=>statusOf(e)==='open');
    const openMargin=openExposure(openEntries,'margin',true);
    const openPortfolioValues=openEntries.map(e=>{if(!Number.isFinite(e.equityAtEntry)||e.equityAtEntry!<=0||e.pnlKnown===false||!Number.isFinite(e.pnl))return null;const value=e.equityAtEntry!+e.pnl;return value>0?value:null;}).filter((value):value is number=>value!=null);
    const openPortfolioSize=openPortfolioValues.length?sum(openPortfolioValues):null;
    const openPnl=openValues.length?sum(openValues):null;
    const openPnlRoi=openPnl!=null&&openPortfolioSize!=null?openPnl/openPortfolioSize*100:null;
    return {date,ids:es.map(e=>e.id),recorded:es.length,n:m.n,value,cumulative:value==null?null:cumulative,drawdown:value==null?null:sum([cumulative,-peak]),unrealized:openPnl,riskRatio:risk.value,marginRatio:margin.value,portfolioSize:portfolioValues.length?sum(portfolioValues)/portfolioValues.length:null,openMarginRatio:openMargin.value,openPortfolioSize,openPnlRoi,riskRatioCount:risk.count,marginRatioCount:margin.count,portfolioSizeCount:portfolioValues.length,reviewed:es.filter(e=>reviewStateOf(e)==='complete').length,wins:m.wins,losses:m.losses,be:m.be};
  });
  const days=daily.filter(d=>d.n),winningDays=days.filter(d=>d.value!>0.005).length;
  const openEntries=entries.filter(e=>statusOf(e)==='open');
  const openRisk=openExposure(openEntries,'risk',true),openMargin=openExposure(openEntries,'margin',true);
  const reportedOpenPnl=openEntries.filter(e=>e.pnlKnown!==false&&Number.isFinite(e.pnl)).map(e=>e.pnl);
  const openPosition:OpenPositionExposure={
    count:openEntries.length,
    riskAmount:openRisk.amount,
    equity:openRisk.equity,
    riskRatio:openRisk.value,
    riskObservations:openRisk.count,
    marginAmount:openMargin.amount,
    marginRatio:openMargin.value,
    marginObservations:openMargin.count,
    reportedPnl:reportedOpenPnl.length?sum(reportedOpenPnl):null,
  };
  const winners=base.list.filter(e=>resultOf(e,basis)==='win'),losers=base.list.filter(e=>resultOf(e,basis)==='loss');
  const avgWin=winners.length?sum(winners.map(e=>overviewValue(e,basis)!))/winners.length:null;
  const avgLoss=losers.length?sum(losers.map(e=>overviewValue(e,basis)!))/losers.length:null;
  const winLossRatio=avgWin!=null&&avgLoss!=null?avgWin/Math.abs(avgLoss):null;
  const coverage=(n:number)=>entries.length?n/entries.length*100:null;
  const strategyRecorded=coverage(entries.filter(e=>!!e.strategy?.trim()).length);
  const profitRisk:RadarMetric[]=[
    {label:'Win rate',value:base.winRate,display:percentDisplay(base.winRate),description:`Share of eligible ${basis} trades with a positive result. Breakeven trades remain in the denominator.`},
    {label:'Profit factor',value:ratioScore(base.pf),display:numberDisplay(base.pf),description:'Gross profits divided by the absolute value of gross losses. The radial score is capped at a profit factor of 3.'},
    {label:'Average R',value:rScore(base.avgR),display:numberDisplay(base.avgR,'R'),description:'Average realized R for trades with recorded initial risk or reported R. The radial score maps -1R to 0 and +3R to 100.'},
    {label:'Payoff ratio',value:ratioScore(winLossRatio),display:numberDisplay(winLossRatio,'×'),description:'Average winning result divided by the absolute average losing result. The radial score is capped at 3×.'},
    {label:'Risk recorded',value:coverage(base.riskCount),display:percentDisplay(coverage(base.riskCount)),description:'Share of recorded trades with a positive initial monetary risk value.'},
    {label:'Known net',value:coverage(net.n),display:percentDisplay(coverage(net.n)),description:'Share of recorded trades with a closed result and known costs, so net P&L can be calculated.'},
  ];
  const strategyDiscipline:RadarMetric[]=[
    {label:'Win rate',value:base.winRate,display:percentDisplay(base.winRate),description:`Share of eligible ${basis} trades with a positive result. This is a result metric, not a discipline grade.`},
    {label:'Plan followed',value:base.plan,display:percentDisplay(base.plan),description:'Share of trades with an answered plan-adherence field that were marked as followed. Unknown answers are excluded.'},
    {label:'Reviewed',value:coverage(entries.filter(e=>reviewStateOf(e)==='complete').length),display:percentDisplay(coverage(entries.filter(e=>reviewStateOf(e)==='complete').length)),description:'Share of recorded trades whose journal review state is Complete.'},
    {label:'Strategy recorded',value:strategyRecorded,display:percentDisplay(strategyRecorded),description:'Share of recorded trades with a non-empty strategy field.'},
    {label:'Both emotions',value:coverage(entries.filter(e=>e.emotionBefore&&e.emotionAfter).length),display:percentDisplay(coverage(entries.filter(e=>e.emotionBefore&&e.emotionAfter).length)),description:'Share of recorded trades with both before-trade and after-trade emotions recorded.'},
    {label:'Timing',value:coverage(entries.filter(e=>Number.isFinite(timestampMs(e.entryTime))&&Number.isFinite(timestampMs(e.exitTime))).length),display:percentDisplay(coverage(entries.filter(e=>Number.isFinite(timestampMs(e.entryTime))&&Number.isFinite(timestampMs(e.exitTime))).length)),description:'Share of recorded trades with valid entry and exit timestamps.'},
  ];
  return {base,daily,net,gross:net.n?gross:null,costs:net.n?net.fees:null,
    dayWinRate:days.length?winningDays/days.length*100:null,days:days.length,winningDays,
    avgWin,avgLoss,winLossRatio,
    profitRisk,strategyDiscipline,
    openPosition,
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

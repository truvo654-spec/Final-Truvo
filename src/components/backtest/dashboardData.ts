import { outcomeOf } from '../../backtest/metrics';
import type {JournalEntry} from '../../types';
import type {JournalPlaybook} from '../../data/journalPlaybooks';
import type {BacktestRun,ReplaySession,PracticeTrade} from '../../backtest/store';
import type {BacktestTrade} from '../../backtest/types';
import {currencyOf,eligible,netOf,realizedR,timestampMs} from '../journal/journalMath';
import {instrumentKey,playbookFingerprint} from '../journal/playbookExecution';
import {comparisonStats} from '../journal/playbookComparison';
import {knownInstrument,instrumentMarket} from '../journal/instrumentMatching';

export type DashboardSide='long'|'short';
export interface DashboardEntry {resultIds?:string[];journalTradeIds?:string[];playbookId?:string}
export interface DashboardScope {resultIds:string[];journal:boolean;journalIds:string[]|null;books:string[];symbols:string[];markets:string[];sides:DashboardSide[];from:string;to:string;currency:string;unit:'money'|'r'|'percent';privacy:boolean;timezone:string;focus:string}
export interface DashboardRow {id:string;sourceId:string;symbol:string;market?:string;bookId:string;strategy:string;side:DashboardSide;at:number;entryAt:number;day:string;net:number;r:number|null;fallbackDate:boolean;holdKnown:boolean;journal?:JournalEntry;trade?:BacktestTrade;run?:BacktestRun;practice?:PracticeTrade}
export interface DashboardSource {id:string;name:string;kind:'Journal'|'Sample simulation'|'Practice';currency:string;balance:number|null;rows:DashboardRow[];excluded:number;stale:boolean;run?:BacktestRun;session?:ReplaySession}
export function dashboardMarket(row:DashboardRow):string {return row.market||row.journal?.assetClass||knownInstrument(row.symbol)?.market||'Unassigned';}
export function dashboardDay(at:number,timezone:string):string {
  if(!Number.isFinite(at))return '';
  const p=new Intl.DateTimeFormat('en-US',{timeZone:timezone,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(at);
  const field=(key:string)=>p.find(v=>v.type===key)?.value;
  return `${field('year')}-${field('month')}-${field('day')}`;
}
export function dashboardSources(runs:BacktestRun[],sessions:ReplaySession[],entries:JournalEntry[],books:JournalPlaybook[],scope:DashboardScope):DashboardSource[] {
  const sourceRows:DashboardSource[]=[];
  for(const run of runs){
    const book=books.find(b=>b.id===run.playbookId),id=`run:${run.id}`;
    const rows=run.output.result.trades.filter(t=>Number.isFinite(t.net)&&Number.isFinite(t.exitTime)).map((trade):DashboardRow=>({id:`${id}:${trade.id}`,sourceId:id,symbol:run.symbol,market:book?instrumentMarket(run.symbol,book):undefined,bookId:run.playbookId??'',strategy:book?.name??run.name,side:trade.direction,at:trade.exitTime,entryAt:trade.entryTime,day:dashboardDay(trade.exitTime,scope.timezone),net:trade.net,r:Number.isFinite(trade.r)?trade.r:null,fallbackDate:false,holdKnown:true,trade,run}));
    sourceRows.push({id,name:run.name,kind:'Sample simulation',currency:run.output.result.currency,balance:run.output.result.startBalance>0?run.output.result.startBalance:null,rows,excluded:Math.max(run.summary.trades,run.output.result.trades.length)-rows.length,stale:!!book&&!!run.playbookFingerprint&&run.playbookFingerprint!==playbookFingerprint(book),run});
  }
  for(const session of sessions.filter(s=>!!s.finishedAt)){
    const id=`practice:${session.id}`;
    const rows=session.trades.flatMap((practice,index):DashboardRow[]=>{
      const at=timestampMs(practice.exitTime), entryAt=timestampMs(practice.entryTime);
      if(!Number.isFinite(practice.net)||!Number.isFinite(at)||!Number.isFinite(entryAt))return [];
      const journal=entries.find(e=>e.id===session.journalTradeId),book=books.find(b=>b.name===journal?.strategy);
      return [{id:`${id}:${index}`,sourceId:id,symbol:session.symbol,bookId:book?.id??'',strategy:journal?.strategy??session.label,side:practice.dir,at:at!,entryAt:entryAt!,day:dashboardDay(at!,scope.timezone),net:practice.net,r:practice.r!==null&&Number.isFinite(practice.r)?practice.r:null,fallbackDate:false,holdKnown:true,practice}];
    });
    sourceRows.push({id,name:session.label,kind:'Practice',currency:'USD',balance:null,rows,excluded:session.trades.length-rows.length,stale:false,session});
  }
  const journal=entries;
  const id='journal';
  const rows=journal.flatMap((e):DashboardRow[]=>{
    if(!eligible(e))return [];
    const at=timestampMs(e.exitTime||e.entryTime||e.date),entryAt=timestampMs(e.entryTime||e.date);
    if(!Number.isFinite(at)||!Number.isFinite(entryAt))return [];
    const book=books.find(b=>b.name===e.strategy),dateOnly=!e.exitTime&&!e.entryTime;
    return [{id:`journal:${e.id}`,sourceId:id,symbol:e.symbol,bookId:book?.id??'',strategy:e.strategy,side:e.direction==='BUY'?'long':'short',at,entryAt,day:dateOnly?e.date:dashboardDay(at,scope.timezone),net:netOf(e),r:realizedR(e),fallbackDate:!e.exitTime,holdKnown:!!e.entryTime&&!!e.exitTime,journal:e}];
  });
  sourceRows.push({id,name:scope.journalIds?'Selected journal trades':'Journal trades',kind:'Journal',currency:'',balance:null,rows,excluded:journal.length-rows.length,stale:false});
  return sourceRows;
}
export function filterDashboardRows(source:DashboardSource,scope:DashboardScope){
  const ids=scope.journalIds===null?null:new Set(scope.journalIds);
  const symbols=new Set(scope.symbols.map(instrumentKey));
  return source.rows.filter(row=>(source.kind==='Journal'?currencyOf(row.journal!)===scope.currency&&(!ids||ids.has(row.journal!.id)):source.currency===scope.currency)
    &&(!scope.books.length||scope.books.includes(row.bookId))&&(!symbols.size||symbols.has(instrumentKey(row.symbol)))&&(!scope.markets.length||scope.markets.includes(dashboardMarket(row)))&&scope.sides.includes(row.side)
    &&(!scope.from||row.day>=scope.from)&&(!scope.to||row.day<=scope.to));
}
export const dashboardWin=(row:DashboardRow)=>row.trade?outcomeOf(row.trade)==='win':row.net>0.005;
export const dashboardLoss=(row:DashboardRow)=>row.trade?outcomeOf(row.trade)==='loss':row.net< -0.005;
export function dashboardStats(rows:DashboardRow[],balance:number|null){
  const points=rows.map(row=>({id:row.id,at:row.at,entryAt:row.entryAt,net:row.net,r:row.r,symbol:row.symbol}));
  const stats=comparisonStats(points,balance??0);
  const wins=rows.filter(dashboardWin),losses=rows.filter(dashboardLoss);
  const avgWin=wins.length?wins.reduce((s,r)=>s+r.net,0)/wins.length:null,avgLoss=losses.length?losses.reduce((s,r)=>s+r.net,0)/losses.length:null;
  const days=new Map<string,DashboardRow[]>();rows.forEach(row=>days.set(row.day,[...(days.get(row.day)??[]),row]));
  const daily=[...days].sort(([a],[b])=>a.localeCompare(b)).map(([day,list])=>({day,rows:list,net:list.reduce((s,r)=>s+r.net,0)}));
  let cumulative=0,peak=0,winStreak=0,lossStreak=0,maxWins=0,maxLosses=0;
  const rs=rows.filter(r=>r.r!==null);
  const dailyCurve=daily.map(d=>{cumulative+=d.net;peak=Math.max(peak,cumulative);return {...d,cumulative,drawdown:cumulative-peak};});
  [...rows].sort((a,b)=>a.at-b.at||a.id.localeCompare(b.id)).forEach(row=>{if(dashboardWin(row)){winStreak++;lossStreak=0;}else if(dashboardLoss(row)){lossStreak++;winStreak=0;}else{winStreak=0;lossStreak=0;}maxWins=Math.max(maxWins,winStreak);maxLosses=Math.max(maxLosses,lossStreak);});
  const holds=rows.filter(r=>r.holdKnown&&r.at>=r.entryAt);
  return {...stats,winRate:rows.length?wins.length/rows.length*100:null,avgWin,avgLoss,payoff:avgWin!==null&&avgLoss!==null?avgWin/Math.abs(avgLoss):null,dayWin:daily.length?daily.filter(d=>d.net>0.005).length/daily.length*100:null,daily:dailyCurve,avgHold:holds.length?holds.reduce((s,r)=>s+Math.max(0,r.at-r.entryAt)/60000,0)/holds.length:null,maxWins,maxLosses,rCoverage:rs.length,drawdownPct:balance!==null?stats.drawdownPct:null};
}
export function initialDashboardScope(runs:BacktestRun[],sessions:ReplaySession[],entry?:DashboardEntry,saved?:Partial<DashboardScope>|null):DashboardScope {
  const latest=[...runs].sort((a,b)=>b.lastRun.localeCompare(a.lastRun))[0];
  const latestPractice=[...sessions].filter(s=>s.finishedAt).sort((a,b)=>(b.finishedAt??'').localeCompare(a.finishedAt??''))[0];
  let base:DashboardScope={resultIds:latest?[`run:${latest.id}`]:latestPractice?[`practice:${latestPractice.id}`]:[],journal:false,journalIds:null,books:[],symbols:[],markets:[],sides:['long','short'],from:'',to:'',currency:latest?.output.result.currency??'USD',unit:'money',privacy:false,timezone:'UTC',focus:'',...saved};
  if(entry){
    const matching=entry.playbookId?runs.filter(r=>r.playbookId===entry.playbookId).sort((a,b)=>b.lastRun.localeCompare(a.lastRun)):[];
    const ids=entry.resultIds??(entry.playbookId?(matching[0]?[`run:${matching[0].id}`]:[]):[]);
    const selected=runs.find(r=>ids.includes(`run:${r.id}`));
    base={...base,resultIds:ids,journal:!!entry.playbookId||entry.journalTradeIds!==undefined,journalIds:entry.journalTradeIds??null,books:entry.playbookId?[entry.playbookId]:[],symbols:[],markets:[],sides:['long','short'],from:'',to:'',unit:'money',currency:selected?.output.result.currency??base.currency,focus:ids[0]??'journal'};
  }
  if(!Array.isArray(base.resultIds))base.resultIds=[];
  base.resultIds=base.resultIds.filter(id=>runs.some(r=>id===`run:${r.id}`)||sessions.some(s=>!!s.finishedAt&&id===`practice:${s.id}`));
  if(!Array.isArray(base.sides))base.sides=['long','short'];
  if(!Array.isArray(base.books))base.books=[];if(!Array.isArray(base.symbols))base.symbols=[];if(!Array.isArray(base.markets))base.markets=[];
  if(base.journalIds!==null&&!Array.isArray(base.journalIds))base.journalIds=null;
  try{new Intl.DateTimeFormat('en-US',{timeZone:base.timezone});}catch{base.timezone='UTC';}
  base.sides=base.sides.filter(s=>s==='long'||s==='short');
  if(!['money','r','percent'].includes(base.unit))base.unit='money';
  try{new Intl.NumberFormat('en-US',{style:'currency',currency:base.currency});}catch{base.currency='USD';}
  return base;
}
export const DASHBOARD_STORAGE='ms_backtest_dashboard_v1';
export function loadDashboardScope():Partial<DashboardScope>|null {try{return JSON.parse(localStorage.getItem(DASHBOARD_STORAGE)||'null');}catch{return null;}}

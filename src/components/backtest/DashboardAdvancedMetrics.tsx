import React from 'react';
import type {DashboardRow,DashboardScope,DashboardSource} from './dashboardData';
import {advancedStats,activeMilliseconds,coveredMonths,METRIC_HELP} from './dashboardAnalytics';
import {Card,Hint} from './ui';
export function DashboardAdvancedMetrics({rows,source,sources,scope,widgets,valueOf,format,onSetBalance}:{rows:DashboardRow[];source?:DashboardSource;sources:DashboardSource[];scope:DashboardScope;widgets:string[];valueOf:(r:DashboardRow)=>number|null;format:(v:number|null)=>string;onSetBalance:()=>void}){
 const m=advancedStats(rows,source?.balance??null,valueOf,scope.breakeven),time=activeMilliseconds(sources),coverage=coveredMonths(sources,scope);
 const num=(v:number|null)=>v!==null&&Number.isFinite(v)?v.toFixed(2):'—';
 const field=(label:string,value:string,help:string)=><div key={label} className="flex items-start justify-between gap-3 border-b border-slate-100 py-3 text-xs"><dt className="text-slate-500"><Hint text={help}>{label}</Hint></dt><dd className="text-right font-semibold">{value}</dd></div>;
 return <Card title="Testing & statistics" sub="Selected results · optional widgets"><div className="grid grid-cols-1 gap-x-8 md:grid-cols-2"><dl>
 {widgets.includes('avgDrawdown')&&field('Avg drawdown',format(m.avgDrawdown),METRIC_HELP.avgDrawdown)}
 {field('Drawdown / starting balance',m.drawdownStartPct===null?'—':num(m.drawdownStartPct)+'%','Maximum daily closed-result drawdown / saved or explicitly set reference balance × 100. Needs a positive saved/reference balance and closed trades.')}
 {m.drawdownStartPct===null&&<button className="mt-2 text-xs font-semibold text-[#5338ec]" onClick={onSetBalance}>Needs saved balance · set reference</button>}
 </dl><dl>{widgets.includes('testing')&&<>{field('Time spent backtesting',time.ms===null?'—':Math.floor(time.ms/3600000)+'h '+Math.floor(time.ms/60000%60)+'m '+Math.floor(time.ms/1000%60)+'s','Recorded active foreground session time across matching selected results, deduplicated by session. Older saves without active tracking are unavailable. Filters select sessions; time is not prorated to individual trades.')}{time.missing>0&&<p className="mt-1 text-[10px] text-slate-400">{time.missing} selected result(s) have no recorded active time.</p>}{field('Total data backtested',coverage===null?'—':coverage.toFixed(1)+' months','Union of covered market-data intervals across matching selected results, clipped to the selected result-date range. Overlapping periods count once. One month = 365.25 / 12 days. Journal records do not imply tested data coverage.')}</>}
 {widgets.includes('dayStreaks')&&<>{field('Max consecutive winning days',m.days?String(m.maxWinDays):'—','Longest run of positive net closing days, in the selected time zone. Breakeven days reset the streak. Non-trading days are not observations.')}{field('Max consecutive losing days',m.days?String(m.maxLossDays):'—','Longest run of negative net closing days. Breakeven days reset the streak. This counts days, not trades.')}</>}
 </dl></div></Card>;
}

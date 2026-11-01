import test from 'node:test';
import assert from 'node:assert/strict';
import {advancedStats,closedRow,displayRowValue,unitAvailability,priceUnitValue,rowOutcome,matchesAdvanced,coveredMonths,activeMilliseconds,snapshotSvg,rowRoi} from '../dashboardAnalytics';
import {dashboardStats,initialDashboardScope,type DashboardRow,type DashboardSource} from '../dashboardData';
import {JOURNAL_ENTRIES} from '../../../data/journalData';
import {dashboardCsv} from '../DashboardTradeTable';
import {drillRows} from '../DashboardResultPopup';
const row=(net:number,day:string,id=day):DashboardRow=>({id,sourceId:'a',symbol:'MNQ',bookId:'p',strategy:'Swing',side:'long',at:Date.parse(day+'T20:00:00Z'),entryAt:Date.parse(day+'T10:00:00Z'),day,net,r:net/100,fallbackDate:false,holdKnown:true,practice:{dir:'long',entry:100,exit:100+net/10,size:1,net,r:net/100,tags:[],entryBar:0,exitBar:1}});
const seq=(values:number[])=>values.map((n,i)=>row(n,'2026-09-'+String(i+1).padStart(2,'0')));
const source=(rows:DashboardRow[]):DashboardSource=>({id:'a',name:'Test',currency:'USD',balance:1000,kind:'Sample simulation',rows,excluded:0,stale:false});

test('empty results and unavailable ratios return null, never non-finite metrics',()=>{
 const m=advancedStats([],1000);for(const k of ['sharpe','sortino','calmar','avgDrawdown','drawdownStartPct'] as const)assert.equal(m[k],null);
 const base=dashboardStats([],1000);assert.equal(base.winRate,null);assert.equal(base.pf,null);
});
test('ratios match a hand-calculated fixture with two daily returns and zero target',()=>{
 const m=advancedStats(seq([100,-50]),1000),mean=.025,std=Math.sqrt((.075**2+.075**2));
 assert.ok(Math.abs(m.sharpe!-mean/std*Math.sqrt(252))<1e-10);
 assert.ok(Math.abs(m.sortino!-.025/Math.sqrt(.05**2/2)*Math.sqrt(252))<1e-10);
 assert.ok(Math.abs(m.calmar!-((1.05**126-1)/(.05/1.1)))<1e-8);
 assert.equal(m.drawdownStartPct,5);
});
test('all wins, all losses, breakeven and missing balance have explicit denominator rules',()=>{
 const wins=advancedStats(seq([100,100]),1000);assert.equal(wins.sharpe,null);assert.equal(wins.sortino,null);assert.equal(wins.calmar,null);assert.equal(wins.avgDrawdown,0);
 const losses=advancedStats(seq([-100,-50]),1000);assert.ok(losses.sharpe!<0);assert.ok(losses.sortino!<0);assert.ok(losses.calmar!<0);
 const be=advancedStats(seq([.001,-.002,0]),1000,undefined,.005);assert.equal(be.dayBE,3);assert.equal(be.maxWinDays,0);assert.equal(be.maxLossDays,0);
 const absent=advancedStats(seq([100,-50]),null);assert.equal(absent.sharpe,null);assert.equal(absent.sortino,null);assert.equal(absent.calmar,null);assert.equal(absent.drawdownStartPct,null);
 assert.equal(advancedStats(seq([100]),1000).sharpe,null);assert.equal(dashboardStats(seq([100,50]),1000).pf,null);
});
test('drawdown periods use peak depths, include unrecovered periods and convert selected units',()=>{
 const rows=seq([100,-50,-50,100,-30]),cash=advancedStats(rows,1000),r=advancedStats(rows,1000,x=>x.r);
 assert.equal(cash.avgDrawdown,65);assert.equal(r.avgDrawdown,.65);assert.equal(cash.maxLossDays,2);assert.equal(cash.maxWinDays,1);
 const mixed=seq([1,-1,0,1,1]);assert.equal(advancedStats(mixed,1000).maxWinDays,2);
});
test('price units use actual fills and symbol metadata, with incompatible mixed instruments disabled',()=>{
 const future=row(10,'2026-09-01');assert.equal(priceUnitValue(future,'points'),1);assert.equal(priceUnitValue(future,'ticks'),4);assert.equal(priceUnitValue(future,'pips'),null);
 const fx={...future,symbol:'EUR/USD',practice:{...future.practice!,entry:1.1,exit:1.101}};assert.ok(Math.abs(priceUnitValue(fx,'pips')!-10)<1e-8);
 assert.equal(unitAvailability([future,fx],'pips'),false);assert.equal(unitAvailability([future,fx],'ticks'),false);assert.equal(priceUnitValue({...future,symbol:'UNKNOWN'},'ticks'),null);
 assert.equal(displayRowValue(future,'percent',1000),1);assert.equal(displayRowValue(future,'percent',null),null);assert.equal(displayRowValue({...future,r:null},'r',1000),null);
});
test('advanced filters share timezone, review, tags, holding state and outcome semantics',()=>{
 const scope=initialDashboardScope([],[]),r={...row(100,'2026-09-02'),journal:{...JOURNAL_ENTRIES[0],tags:['patient'],mistakes:['late'],reviewState:'complete' as const,entryTime:'2026-09-01T23:30:00Z'},entryAt:Date.parse('2026-09-01T23:30:00Z')};
 assert.equal(matchesAdvanced(r,{...scope,tags:['patient'],mistakes:['late'],review:'reviewed',outcomes:['win']}),true);
 assert.equal(matchesAdvanced(r,{...scope,timezone:'Asia/Bangkok',holding:'intraday',weekdays:['Wed'],hourFrom:'6',hourTo:'6'}),true);
 assert.equal(matchesAdvanced(r,{...scope,timezone:'UTC',holding:'intraday'}),false);
 assert.equal(matchesAdvanced(r,{...scope,review:'unreviewed'}),false);
 assert.equal(rowOutcome({...r,net:.001}), 'breakeven');assert.equal(matchesAdvanced({...r,net:.001},{...scope,outcomes:['breakeven']}),true);
});
test('open trades remain inspectable but never contaminate realized metrics or physical units',()=>{
 const open={...row(999,'2026-09-01'),closed:false};assert.equal(closedRow(open),false);assert.equal(rowOutcome(open),null);assert.equal(displayRowValue(open,'money',1000),null);assert.equal(dashboardStats([open],1000).count,0);assert.equal(advancedStats([open],1000).days,0);
 assert.equal(matchesAdvanced(open,{...initialDashboardScope([],[]),state:'open'}),true);assert.equal(matchesAdvanced(open,{...initialDashboardScope([],[]),state:'closed'}),false);
 const incomplete={...open,state:'closed' as const};assert.equal(matchesAdvanced(incomplete,{...initialDashboardScope([],[]),state:'closed'}),true);assert.equal(dashboardStats([incomplete],1000).count,0);assert.equal(rowOutcome(incomplete),null);
});
test('coverage uses interval unions and active session deduplication rather than summing overlapping tests',()=>{
 const a={...source([]),run:{from:'2026-09-01',to:'2026-09-05',activeMs:1000,activityId:'lab'} as any},b={...a,id:'b'},scope={...initialDashboardScope([],[]),from:'2026-09-02',to:'2026-09-04'};
 assert.ok(Math.abs(coveredMonths([a,b],scope)!-3/(365.25/12))<1e-12);assert.equal(activeMilliseconds([a,b]).ms,1000);
 assert.equal(activeMilliseconds([source([])]).ms,null);assert.equal(activeMilliseconds([source([])]).missing,1);assert.equal(coveredMonths([source([])],scope),null);
});
test('ROI uses recorded entry equity; snapshot text is escaped and cannot execute markup',()=>{
 const r={...row(100,'2026-09-01'),journal:{...JOURNAL_ENTRIES[0],equityAtEntry:2000,pnl:100,commission:0,pnlKnown:true,tradingStatus:'closed' as const}};
 assert.equal(rowRoi(r),5);assert.equal(rowRoi({...r,journal:{...r.journal,equityAtEntry:undefined}}),null);
 const svg=snapshotSvg('<script>', ['<img onerror="evil">','Net Hidden']);assert.equal(svg.includes('<script>'),false);assert.equal(svg.includes('<img '),false);assert.ok(svg.includes('Hidden'));
});
test('CSV exports the exact selected cohort and redacts financial cells with formula-safe labels',()=>{
 const rows=[{...row(98765,'2026-09-01'),strategy:'\t=HYPERLINK("evil")'}],scope={...initialDashboardScope([],[]),privacy:true};
 const csv=dashboardCsv(rows,scope,()=> 'Hidden');assert.equal(csv.includes('98765'),false);assert.equal(csv.includes('100.00'),false);assert.ok(csv.includes('Hidden'));assert.ok(csv.includes("'\t=HYPERLINK"));assert.equal(csv.split('\r\n').length,2);
});
test('popup cohorts stay exact by source, month/year, selected bubble IDs and known risk',()=>{
 const rows=[row(100,'2026-09-01'),{...row(-20,'2026-09-02'),r:null},{...row(10,'2026-10-01'),sourceId:'b'},{...row(0,'2026-09-03'),closed:false},row(20,'2025-09-01')];
 assert.deepEqual(drillRows(rows,{source:'a',period:'2026-09'}).map(r=>r.id),['2026-09-01','2026-09-02']);
 assert.equal(drillRows(rows,{source:'a',period:'2026',knownR:true}).length,1);
 assert.deepEqual(drillRows(rows,{source:'a',rowIds:['2026-09-02']}).map(r=>r.id),['2026-09-02']);
 assert.equal(drillRows(rows,{source:'missing'}).length,0);
});

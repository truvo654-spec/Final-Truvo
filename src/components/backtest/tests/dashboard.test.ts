import test from 'node:test';
import assert from 'node:assert/strict';
import {dashboardDay,dashboardSources,filterDashboardRows,dashboardStats,initialDashboardScope} from '../dashboardData';
import {DEFAULT_PLAYBOOKS} from '../../../data/journalPlaybooks';
import {JOURNAL_ENTRIES} from '../../../data/journalData';
import {defaultSettings} from '../../../backtest/rules';
import {summarize,type BacktestRun,type ReplaySession} from '../../../backtest/store';
import type {BacktestTrade} from '../../../backtest/types';
import {playbookFingerprint} from '../../journal/playbookExecution';
import {comparisonBubbles,comparisonValue,comparisonSize,comparisonAxis} from '../dashboardComparison';
const book=DEFAULT_PLAYBOOKS[0];
const trade=(id:number,net:number,side:'long'|'short'='long',exit='2026-09-02T00:30:00Z'):BacktestTrade=>({id,entryTime:Date.parse('2026-09-01T22:30:00Z'),exitTime:Date.parse(exit),direction:side,net,r:net/100,gross:net,costs:0,entryPrice:100,exitPrice:101,orderType:'market',stopPrice:99,targetPrice:102,size:1,mae:0,mfe:1,exitReason:'target',balance:1000+net,bars:2,ambiguous:false,partial:false});
const run=(id:string,trades:BacktestTrade[]):BacktestRun=>{
 const output={result:{trades,startBalance:1000,endBalance:1000+trades.reduce((s,t)=>s+t.net,0),currency:'USD' as const,rangeStart:Date.parse('2026-09-01'),rangeEnd:Date.parse('2026-09-05'),events:[],stopReason:null,diagnostics:{} as any,zeroTradeReason:null,propStatus:null,tradingDays:1},suggestions:[]};
 return {id,name:id,mode:'automated',status:'done',playbookId:book.id,symbol:'MNQ',timeframe:'15m',from:'2026-09-01',to:'2026-09-04',lastRun:id,createdAt:id,settings:defaultSettings({playbook:book}),summary:summarize(output),output,playbookFingerprint:playbookFingerprint(book)};
};
const journal=(id:string,net:number,cur='USD')=>({...JOURNAL_ENTRIES[0],id,strategy:book.name,symbol:'NAS100',direction:'BUY' as const,tradingStatus:'closed' as const,outcome:'win' as const,pnl:net,commission:0,pnlKnown:true,initialRisk:undefined,rMultiple:null,accountCurrency:cur,date:'2026-09-01',entryTime:'2026-09-01T22:30:00Z',exitTime:'2026-09-02T00:30:00Z'});
test('one shared scope filters source, instrument aliases, side, dates and currency',()=>{
 const a=run('a',[trade(1,100),trade(2,-40,'short')]);const scope={...initialDashboardScope([a],[]),symbols:['NAS100'],sides:['short' as const],from:'2026-09-02',to:'2026-09-02'};
 const s=dashboardSources([a],[],[],[book],scope)[0],rows=filterDashboardRows(s,scope);
 assert.equal(rows.length,1);assert.equal(rows[0].side,'short');assert.equal(dashboardStats(rows,s.balance).net,-40);
 assert.equal(filterDashboardRows(s,{...scope,currency:'EUR'}).length,0);
 assert.equal(filterDashboardRows(s,{...scope,sides:[]}).length,0);
});
test('timezone date and exact calendar/chart drill-down agree across midnight',()=>{
 const a=run('a',[trade(1,100)]);const scope={...initialDashboardScope([a],[]),timezone:'America/New_York',from:'2026-09-01',to:'2026-09-01'};
 assert.equal(dashboardDay(a.output.result.trades[0].exitTime,scope.timezone),'2026-09-01');
 const s=dashboardSources([a],[],[],[book],scope)[0],rows=filterDashboardRows(s,scope),m=dashboardStats(rows,s.balance);
 assert.equal(m.daily[0].day,'2026-09-01');assert.deepEqual(m.daily[0].rows.map(r=>r.id),rows.map(r=>r.id));
 assert.equal(m.daily[0].net,m.net);
});
test('journal IDs stay exact and missing risk never removes known P&L',()=>{
 const entries=[journal('a',100),journal('b',-40),journal('eur',500,'EUR')];const scope=initialDashboardScope([],[],{journalTradeIds:['a','b']});
 const source=dashboardSources([],[],entries,[book],scope).at(-1)!,rows=filterDashboardRows(source,scope),m=dashboardStats(rows,null);
 assert.equal(m.count,2);assert.equal(m.net,60);assert.equal(m.rCoverage,0);assert.equal(m.avgR,null);assert.equal(m.drawdownPct,null);
 assert.deepEqual(rows.map(r=>r.journal!.id),['a','b']);
});
test('overlapping saved runs keep distinct trade IDs and independent balances',()=>{
 const a=run('a',[trade(1,100)]),b=run('b',[trade(1,200)]),scope=initialDashboardScope([a,b],[],{resultIds:['run:a','run:b']});
 const sources=dashboardSources([a,b],[],[],[book],scope).filter(s=>s.kind==='Sample simulation');
 assert.notEqual(sources[0].rows[0].id,sources[1].rows[0].id);
 assert.equal(dashboardStats(sources[0].rows,sources[0].balance).net,100);assert.equal(dashboardStats(sources[1].rows,sources[1].balance).net,200);
});
test('simulation win rate matches saved run summary including engine breakeven',()=>{
 const a=run('a',[trade(1,100),trade(2,-50,'short'),trade(3,0.1)]),scope=initialDashboardScope([a],[]);
 const source=dashboardSources([a],[],[],[book],scope)[0],m=dashboardStats(source.rows,source.balance);
 assert.equal(m.winRate,a.summary.winRate*100);assert.equal(m.count,a.summary.trades);assert.equal(m.net,a.summary.net);
});
test('practice uses actual recorded price timestamps and excludes old undated fills',()=>{
 const session:ReplaySession={id:'p',source:'journal',symbol:'EUR/USD',label:'Practice',startedAt:'2026-10-31',finishedAt:'2026-10-31',trades:[{dir:'long',entry:1,exit:2,size:1,net:100,r:1,entryBar:1,exitBar:2,tags:[],entryTime:'2026-09-01T10:00:00Z',exitTime:'2026-09-01T12:00:00Z'},{dir:'short',entry:2,exit:1,size:1,net:100,r:1,entryBar:1,exitBar:2,tags:[]}],net:200,notes:'',tags:[],pointsAwarded:false};
 const scope=initialDashboardScope([],[session]),source=dashboardSources([],[session],[],[book],scope)[0];
 assert.equal(source.rows.length,1);assert.equal(source.excluded,1);assert.equal(source.rows[0].day,'2026-09-01');assert.equal(source.balance,null);
});
test('untimed journal rows retain recorded day and do not invent holding durations',()=>{
 const entry={...journal('a',100),entryTime:undefined,exitTime:undefined},scope={...initialDashboardScope([],[],{journalTradeIds:['a']}),timezone:'America/New_York'};
 const source=dashboardSources([],[],[entry],[book],scope).at(-1)!;
 assert.equal(source.rows[0].day,'2026-09-01');assert.equal(dashboardStats(source.rows,null).avgHold,null);
});
test('scope restores filters, rejects deleted sources and identifies changed playbooks',()=>{
 const a=run('a',[trade(1,100)]);const scope=initialDashboardScope([a],[],undefined,{resultIds:['run:a','run:deleted'],sides:['short'],currency:'EUR',timezone:'bad-zone'});
 assert.deepEqual(scope.resultIds,['run:a']);assert.deepEqual(scope.sides,['short']);assert.equal(scope.currency,'EUR');assert.equal(scope.timezone,'UTC');
 const source=dashboardSources([a],[],[],[{...book,benchmarkRR:99}],scope)[0];assert.equal(source.stale,true);
});

test('bubble playbook groups preserve overlapping saved runs and exact trade cohorts',()=>{
 const a=run('a',[trade(1,100),trade(2,-50)]),b=run('b',[trade(1,200)]),scope=initialDashboardScope([a,b],[],{resultIds:['run:a','run:b']});
 const groups=dashboardSources([a,b],[],[],[book],scope).filter(s=>s.run).map(source=>({source,rows:filterDashboardRows(source,scope)}));
 const bubbles=comparisonBubbles(groups,'playbook');
 assert.equal(bubbles.length,2);assert.notEqual(bubbles[0].id,bubbles[1].id);
 assert.equal(comparisonValue(bubbles[0],'net','money'),50);assert.equal(comparisonValue(bubbles[1],'net','money'),200);
 assert.deepEqual(bubbles[0].rows.map(r=>r.id),['run:a:1','run:a:2']);
});

test('market and instrument bubbles partition filtered journal trades without losing any records',()=>{
 const list=[{...journal('a',100),assetClass:'Indices' as const},{...journal('b',-20),symbol:'EUR/USD',assetClass:'Forex' as const},{...journal('c',30),symbol:'EURUSD',assetClass:'Forex' as const}];
 const scope=initialDashboardScope([],[],{journalTradeIds:list.map(e=>e.id)}),source=dashboardSources([],[],list,[book],scope).at(-1)!;
 const markets=comparisonBubbles([{source,rows:filterDashboardRows(source,scope)}],'market');
 assert.deepEqual(markets.map(b=>b.name).sort(),['Forex','Indices']);
 assert.equal(markets.reduce((n,b)=>n+b.rows.length,0),3);
 const instruments=comparisonBubbles([{source,rows:source.rows}],'instrument');assert.equal(instruments.length,2);
 const filtered=filterDashboardRows(source,{...scope,markets:['Forex'],from:'2026-09-02',to:'2026-09-02',sides:['long']});
 assert.deepEqual(filtered.map(r=>r.journal!.id),['b','c']);
 assert.equal(comparisonBubbles([{source,rows:filtered}],'market')[0].stats.net,10);
});

test('bubble data origins distinguish journal-seeded simulations from recorded benchmarks',()=>{
 const a=run('a',[trade(1,100)]),b={...run('b',[trade(1,200)]),sourceTradeIds:['journal-a']},scope=initialDashboardScope([a,b],[]);
 const groups=dashboardSources([a,b],[],[journal('journal-a',55)],[book],scope).map(source=>({source,rows:filterDashboardRows(source,scope)}));
 assert.equal(comparisonBubbles(groups,'playbook','playbook-test').length,1);
 const tested=comparisonBubbles(groups,'playbook','journal-test');assert.equal(tested.length,1);assert.equal(tested[0].stats.net,200);
 assert.equal(comparisonBubbles(groups,'playbook','journal')[0].stats.net,55);
});

test('custom bubble metrics honor units, missing risk and simultaneous close drawdowns',()=>{
 const a=run('a',[trade(1,100),trade(2,-50),trade(3,-20,'short','2026-09-03T00:30:00Z')]),scope=initialDashboardScope([a],[]),source=dashboardSources([a],[],[],[book],scope)[0];
 source.rows[2].r=null;const b=comparisonBubbles([{source,rows:source.rows}],'result')[0];
 assert.equal(comparisonValue(b,'net','money'),30);assert.equal(comparisonValue(b,'net','percent'),3);assert.equal(comparisonValue(b,'net','r'),.5);
 assert.equal(comparisonValue(b,'expectancy','r'),.25);assert.equal(comparisonValue(b,'drawdown','money'),20);
 assert.equal(comparisonValue(b,'drawdown','r'),0);assert.equal(comparisonSize(b,'r','money'),.5);
 const unknown={...b,source:{...source,balance:null}};assert.equal(comparisonValue(unknown,'net','percent'),null);
 const noRisk=comparisonBubbles([{source,rows:source.rows.map(r=>({...r,r:null}))}],'result')[0];assert.equal(comparisonValue(noRisk,'net','r'),null);assert.equal(comparisonSize(noRisk,'r','money'),null);
});

test('bubble axis reserves a labeled infinity band and retains zero and negative values',()=>{
 const axis=comparisonAxis([0,2,Infinity,null],'pf');assert.equal(axis.infinity,true);assert.equal(axis.position(Infinity),1);assert.ok(axis.position(2)<1);assert.equal(axis.position(0),0);
 const win=comparisonAxis([40,80],'winRate');assert.equal(win.min,0);assert.equal(win.max,100);
 const net=comparisonAxis([-100,300],'net');assert.equal(net.min,-100);assert.equal(net.max,300);assert.ok(net.position(0)>0);
 assert.ok(Number.isFinite(comparisonAxis([0,0],'net').position(0)));
});

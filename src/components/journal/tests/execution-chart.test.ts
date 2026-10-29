import test from 'node:test';
import assert from 'node:assert/strict';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {buildExecutionSeries,executionCurve,curveAt,nearestChartTime,stepCurvePath,type ChartRow} from '../executionChartData';
import {comparisonMarket,comparisonStats,type ExecutionPoint} from '../playbookComparison';
import {ExecutionComparisonChart} from '../ExecutionComparisonChart';
import {PlaybookExecutionWorkspace} from '../PlaybookExecutionWorkspace';
import {DEFAULT_PLAYBOOKS} from '../../../data/journalPlaybooks';
const point=(id:string,at:number,net:number,symbol='EUR/USD'):ExecutionPoint=>({id,at,entryAt:at-1,net,r:net/100,symbol});
const rows:ChartRow[]=[
 {symbol:'EUR/USD',market:'Forex',journal:{points:[point('j1',1,100)]},simulated:{points:[point('s1',1,-50)]}},
 {symbol:'GBP/USD',market:'Forex',journal:{points:[point('j2',2,-40,'GBP/USD')]},simulated:{points:[point('s2',2,70,'GBP/USD')]}},
 {symbol:'NAS100',market:'Indices',journal:{points:[]},simulated:{points:[point('s3',3,90,'NAS100')]}}
];
test('Overall, market and instrument views keep source results separate',()=>{
 const all=buildExecutionSeries(rows,'source',1000);assert.equal(all.length,2);assert.equal(all[0].nodes.at(-1)!.cumulative,60);assert.equal(all[1].nodes.at(-1)!.cumulative,110);
 const market=buildExecutionSeries(rows,'market',1000);assert.equal(market.length,4);assert.equal(market.find(s=>s.group==='Forex'&&s.source==='simulated')!.nodes.at(-1)!.cumulative,20);
 const instrument=buildExecutionSeries(rows,'instrument',1000);assert.equal(instrument.length,6);assert.equal(instrument.find(s=>s.group==='NAS100'&&s.source==='journal')!.nodes.length,0);
});
test('Simultaneous closes do not manufacture intratimestamp drawdown',()=>{
 const tied=[point('profit',1,100),point('loss',1,-100)];const nodes=executionCurve(tied,1000);
 assert.equal(nodes.length,1);assert.equal(nodes[0].count,2);assert.equal(nodes[0].drawdown,0);assert.equal(nodes[0].drawdownPct,0);assert.equal(comparisonStats(tied,1000).drawdownPct,0);
});
test('Underwater curve follows reference equity peaks and recovery',()=>{
 const nodes=executionCurve([point('a',1,100),point('b',2,-300),point('c',3,200)],1000);
 assert.equal(nodes[1].drawdown,300);assert.equal(nodes[2].drawdown,100);assert.ok(Math.abs(nodes[1].drawdownPct-300/1100*100)<1e-8);
 assert.equal(curveAt(nodes,0),null);assert.equal(curveAt(nodes,1.5)!.cumulative,100);assert.equal(curveAt(nodes,99)!.count,3);
});
test('Stepped paths carry prior values through zoom boundaries and do not interpolate future profits',()=>{
 const nodes=executionCurve([point('a',1,100),point('b',3,-25)],1000);
 assert.equal(stepCurvePath(nodes,2,4,n=>n,n=>n,'cumulative'),'M 2 100 H 3 V 75 H 4');
 assert.equal(nearestChartTime([],9),null);assert.equal(nearestChartTime([1,3,8],4),3);assert.equal(nearestChartTime([1,3,8],99),8);
});
test('Market classification respects saved assignments and standard instrument aliases',()=>{
 const book={...DEFAULT_PLAYBOOKS[0],instrumentMarkets:{CUSTOM:'Crypto' as const}};
 assert.equal(comparisonMarket(book,'CUSTOM'),'Crypto');assert.equal(comparisonMarket(book,'MNQ'),'Indices');assert.equal(comparisonMarket(book,'EUR/USD'),'Forex');assert.equal(comparisonMarket(book,'UNKNOWN'),'Unassigned');
});
test('Explorer exposes source, grouping and reference-drawdown controls without closed data',()=>{
 const html=renderToStaticMarkup(createElement(ExecutionComparisonChart,{rows:rows.map(r=>({...r,journal:{points:[]},simulated:{points:[]}})),from:'2026-08-01',to:'2026-09-01',balance:1000,currency:'USD',format:n=>String(n),onPoint:()=>{}}));
 assert.match(html,/Group chart by/);assert.match(html,/By market/);assert.match(html,/By instrument/);assert.match(html,/Run a backtest/);assert.match(html,/not actual account-equity drawdown/);
});
test('Saved market scope drives table, charts and backtest selection together',()=>{
 const prior=Object.getOwnPropertyDescriptor(globalThis,'localStorage');
 const book={...DEFAULT_PLAYBOOKS[0],symbols:['NAS100','EUR/USD'],markets:['Indices','Forex'] as typeof DEFAULT_PLAYBOOKS[0]['markets']};
 Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:(key:string)=>key.startsWith('ms_playbook_comparison_')?JSON.stringify({from:'2026-08-01',to:'2026-09-01',balance:1000,selection:null,playbookSymbols:book.symbols,marketSelection:['Forex']}):null}});
 try{
 const html=renderToStaticMarkup(createElement(PlaybookExecutionWorkspace,{playbook:book,entries:[],allEntries:[],onOpenEntry:()=>{},onShowTrades:()=>{},onReplay:()=>{}}));
 assert.match(html,/Run backtest/);assert.doesNotMatch(html,/Generate simulated results/);assert.match(html,/Inspect EUR\/USD journal trades/);assert.doesNotMatch(html,/Inspect NAS100 journal trades/);
 }finally{if(prior)Object.defineProperty(globalThis,'localStorage',prior);else Reflect.deleteProperty(globalThis,'localStorage');}
});

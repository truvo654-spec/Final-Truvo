import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { JournalOverviewAnalytics } from '../overview/JournalOverviewAnalytics';
import type { JournalEntry } from '../../../types';
import { metrics } from '../journalMath';
import { aggregateOverview, formatOverviewValue, scatterPoints } from '../overview/overviewAnalytics';
import { JOURNAL_ENTRIES, hydrateDemoCfdEvidence } from '../../../data/journalData';
import { generateJournalHistory } from '../../../data/journalHistory';

const trade=(patch:Partial<JournalEntry>={}):JournalEntry=>({id:'isolated',date:'2026-10-01',symbol:'TEST',assetClass:'Stocks',direction:'BUY',entryPrice:10,exitPrice:12,size:1,pnl:20,rMultiple:null,outcome:'win',tradingStatus:'closed',commission:0,strategy:'Test',tags:[],setupNotes:'',emotionBefore:null,emotionAfter:null,followedPlan:null,checklistDone:[],mistakes:[],lessons:'',rating:null,source:'manual',accountCurrency:'USD',...patch});

test('Overview daily totals reconcile with shared metrics, excluding open and planned trades',()=>{
  const entries=[trade({pnl:100,commission:3}),trade({id:'b',date:'2026-10-02',pnl:-40,commission:2}),trade({id:'c',tradingStatus:'open',pnl:-1000}),trade({id:'d',tradingStatus:'planned',pnl:-500})];
  const data=aggregateOverview(entries);
  assert.equal(data.daily.reduce((sum,d)=>sum+(d.value||0),0),metrics(entries).total);
  assert.deepEqual(data.daily.map(d=>[d.value,d.cumulative,d.drawdown,d.unrealized]),[[97,97,0,-1000],[-42,55,-42,null]]);
  assert.equal(data.daily[0].recorded,3);assert.equal(data.daily[0].n,1);
});
test('Risk and margin ratios use only explicitly recorded entry evidence',()=>{
  const data=aggregateOverview([
    trade({initialRisk:100,equityAtEntry:10000,marginAtEntry:500}),
    trade({id:'b',initialRisk:200,equityAtEntry:10000,marginAtEntry:1000}),
    trade({id:'c',date:'2026-10-02',initialRisk:100,equityAtEntry:0,marginAtEntry:250}),
  ]);
  assert.equal(data.daily[0].riskRatio,1.5);
  assert.equal(data.daily[0].marginRatio,7.5);
  assert.equal(data.daily[0].portfolioSize,10000);
  assert.equal(data.daily[0].portfolioSizeCount,2);
  assert.equal(data.daily[0].openMarginRatio,null);
  assert.equal(data.daily[0].openPortfolioSize,null);
  assert.equal(data.daily[0].openPnlRoi,null);
  assert.equal(data.daily[0].riskRatioCount,2);
  assert.equal(data.daily[0].marginRatioCount,2);
  assert.equal(data.daily[1].riskRatio,null);
  assert.equal(data.daily[1].marginRatio,null);
  assert.equal(data.daily[1].portfolioSize,null);
});
test('Open-position monitor aggregates recorded risk and margin as percentages of equity',()=>{
  const data=aggregateOverview([
    trade({tradingStatus:'open',pnlKnown:true,pnl:-20,initialRisk:100,equityAtEntry:10000,marginAtEntry:500}),
    trade({id:'b',tradingStatus:'open',pnlKnown:true,pnl:15,initialRisk:200,equityAtEntry:10000,marginAtEntry:1000}),
    trade({id:'c',tradingStatus:'closed',initialRisk:50,equityAtEntry:10000,marginAtEntry:100}),
  ]);
  assert.equal(data.openPosition.count,2);
  assert.equal(data.openPosition.riskRatio,300/19995*100);
  assert.equal(data.openPosition.marginRatio,1500/19995*100);
  assert.equal(data.openPosition.riskAmount,300);
  assert.equal(data.openPosition.equity,19995);
  assert.equal(data.openPosition.reportedPnl,-5);
});
test('CFD demo evidence is deterministic and migration preserves explicit user values',()=>{
  const first=generateJournalHistory();
  const second=generateJournalHistory();
  assert.deepEqual(first.map(e=>[e.id,e.initialRisk,e.equityAtEntry,e.marginAtEntry]),second.map(e=>[e.id,e.initialRisk,e.equityAtEntry,e.marginAtEntry]));
  assert.ok(first.every(e=>Number.isFinite(e.initialRisk) && (e.initialRisk || 0)>0 && Number.isFinite(e.equityAtEntry) && (e.equityAtEntry || 0)>0 && Number.isFinite(e.marginAtEntry) && (e.marginAtEntry || 0)>=0));

  const legacy={...JOURNAL_ENTRIES[0]};
  delete legacy.initialRisk; delete legacy.equityAtEntry; delete legacy.marginAtEntry;
  const explicit={...legacy,id:'user-copy',accountId:'live-account',initialRisk:7,equityAtEntry:25000,marginAtEntry:null};
  const migrated=hydrateDemoCfdEvidence([legacy,explicit]);
  assert.equal(migrated[0].initialRisk,JOURNAL_ENTRIES[0].initialRisk);
  assert.equal(migrated[0].equityAtEntry,JOURNAL_ENTRIES[0].equityAtEntry);
  assert.equal(migrated[0].marginAtEntry,JOURNAL_ENTRIES[0].marginAtEntry);
  assert.equal(migrated[1].initialRisk,7);
  assert.equal(migrated[1].equityAtEntry,25000);
  assert.equal(migrated[1].marginAtEntry,null);
  const legacyDemoSession=hydrateDemoCfdEvidence([JOURNAL_ENTRIES.find(entry=>entry.id==='jr_1')!]);
  assert.deepEqual(legacyDemoSession.filter(entry=>entry.id.startsWith('jr_')).map(entry=>entry.id),['jr_1','jr_9','jr_10','jr_11','jr_12','jr_13']);
});
test('Overview costs reconcile on the same known-cost cohort even in gross mode',()=>{
  const data=aggregateOverview([trade({pnl:100,commission:2}),trade({pnl:50,commission:undefined})],'gross');
  assert.equal(data.base.total,150);assert.equal(data.gross,100);assert.equal(data.costs,2);assert.equal(data.net.total,98);
  assert.equal(data.gross!-data.costs!,data.net.total);assert.equal(data.net.n,1);
});
test('Flat days count in the day denominator; net wins obey shared tolerance',()=>{
  const data=aggregateOverview([trade({pnl:10}),trade({date:'2026-10-02',pnl:0}),trade({date:'2026-10-03',pnl:1,commission:2}),trade({date:'2026-10-04',pnl:0.004})]);
  assert.equal(data.days,4);assert.equal(data.dayWinRate,25);assert.equal(data.avgWin,10);assert.equal(data.avgLoss,-1);assert.equal(data.winLossRatio,10);
});
test('Missing results and empty cohorts stay unknown, not zero or compliant',()=>{
  const empty=aggregateOverview([]);assert.equal(empty.gross,null);assert.equal(empty.costs,null);assert.equal(empty.dayWinRate,null);assert.ok(empty.coverage.every(a=>a.value===null));
  const unknown=aggregateOverview([trade({commission:undefined})]);assert.equal(unknown.daily[0].value,null);assert.equal(unknown.daily[0].drawdown,null);assert.equal(unknown.avgWin,null);
});
test('Coverage counts no and yes as answered without creating a performance score',()=>{
  const data=aggregateOverview([trade({followedPlan:false,initialRisk:10}),trade({initialRisk:Infinity})]);
  assert.equal(data.coverage.find(a=>a.label==='Plan answer')?.value,50);
  assert.equal(data.coverage.find(a=>a.label==='Risk recorded')?.value,50);
  assert.equal(data.coverage.find(a=>a.label==='Both emotions')?.value,0);
});
test('Scatter times use source offsets and only complete valid duration evidence',()=>{
  const entries=[trade({entryTime:'2026-10-01T07:00:00+07:00',exitTime:'2026-10-01T01:00:00Z'}),trade({id:'no-exit',entryTime:'2026-10-01T02:00:00Z'}),trade({id:'reversed',entryTime:'2026-10-01T03:00:00Z',exitTime:'2026-10-01T02:00:00Z'}),trade({id:'open',tradingStatus:'open',entryTime:'2026-10-01T01:00:00Z'})];
  assert.equal(scatterPoints(entries,'net','time').length,3);
  const duration=scatterPoints(entries,'net','duration');assert.equal(duration.length,1);assert.equal(duration[0].minutes,60);assert.equal(duration[0].x,2);assert.equal(duration[0].time,'00:00:00');
});
test('Partial exits do not invent a closed duration or realized result',()=>{
  const partial=trade({tradingStatus:'open',entryTime:'2026-10-01T00:00Z',exitTime:'2026-10-01T02:00Z',fills:[{id:'a',time:'2026-10-01T00:00Z',side:'entry',quantity:2,price:10,fee:null},{id:'b',time:'2026-10-01T02:00Z',side:'exit',quantity:1,price:12,fee:0}]});
  assert.equal(aggregateOverview([partial]).base.n,0);assert.deepEqual(scatterPoints([partial],'net','duration'),[]);
});
test('Overview rejects mixed currencies and formats unknown/flat values honestly',()=>{
  assert.throws(()=>aggregateOverview([trade(),trade({accountCurrency:'EUR'})]));
  assert.equal(formatOverviewValue(null,'USD'),'—');assert.equal(formatOverviewValue(-0,'USD'),'$0.00');assert.equal(formatOverviewValue(10,'EUR'),'+€10.00');
});

test('Overview renders seven additional cards without duplicate filters, calendar or review queue',()=>{
  const html=renderToStaticMarkup(createElement(JournalOverviewAnalytics,{entries:[trade()],currency:'USD',basis:'net',onDay:()=>{},onTrade:()=>{}}));
  assert.equal((html.match(/<article /g)||[]).length,7);
  assert.ok(!html.includes('<select'));assert.ok(!html.includes('aria-label="Review queue"'));assert.ok(!html.includes('Journal calendar'));assert.ok(!html.includes('Cumulative P&amp;L'));
  assert.ok(html.includes('cashback and points stay separate'));assert.ok(!html.includes('NaN'));
  assert.ok(html.includes('Margin % vs portfolio USD'));assert.ok(html.includes('Open P&amp;L ROI vs USD'));
});
test('Flat and empty chart rendering has no invalid SVG coordinates or invented results',()=>{
  for(const entries of [[],[trade({pnl:0,entryTime:'2026-10-01T01:00Z',exitTime:'2026-10-01T02:00Z'})]]){
    const html=renderToStaticMarkup(createElement(JournalOverviewAnalytics,{entries,currency:'USD',basis:'net',onDay:()=>{},onTrade:()=>{}}));
    assert.ok(!html.includes('NaN'));assert.ok(!html.includes('Infinity'));
    if(!entries.length)assert.ok(html.includes('No eligible results in this view.'));
  }
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { JournalEntry } from '../../../types';
import { daySummary, presetRange, validDate, validRange } from '../journalDay';
import { metrics, netRoiOf } from '../journalMath';
import { JournalDayReview } from '../JournalDayReview';
import { addMonth, monthBounds, monthCells } from '../journalOverview';
import { RulesMonitor } from '../JournalMonitors';
import { JournalReplayAvailability } from '../JournalReplayAvailability';

const trade = (patch: Partial<JournalEntry> = {}): JournalEntry => ({ id:'test', date:'2026-10-02', symbol:'TEST', assetClass:'Stocks', direction:'BUY', entryPrice:10, exitPrice:12, size:1, pnl:20, rMultiple:null, outcome:'win', tradingStatus:'closed', commission:2, strategy:'Breakout', tags:[], setupNotes:'', emotionBefore:null, emotionAfter:null, followedPlan:null, checklistDone:[], mistakes:[], lessons:'', rating:null, source:'manual', accountCurrency:'USD', ...patch });

test('Date range validation preserves invalid and reversed dates as errors', () => {
  assert.ok(validDate('2024-02-29')); assert.ok(!validDate('2026-02-29'));
  assert.ok(!validDate('2026-10-32')); assert.ok(!validDate('')); assert.ok(!validDate('0000-01-01'));
  assert.ok(!validRange({from:'2026-10-05',to:'2026-10-01'}));
  assert.ok(validRange({from:'2026-10-02',to:'2026-10-02'}));
});
test('Presets have inclusive UTC boundaries and Monday-based weeks', () => {
  assert.deepEqual(presetRange('This week','2026-10-05'),{from:'2026-10-05',to:'2026-10-05'});
  assert.deepEqual(presetRange('This week','2026-10-04'),{from:'2026-09-28',to:'2026-10-04'});
  assert.deepEqual(presetRange('Last 30 days','2026-10-05'),{from:'2026-09-06',to:'2026-10-05'});
  assert.deepEqual(presetRange('Last 7 days','2026-01-02'),{from:'2025-12-27',to:'2026-01-02'});
});
test('Month, quarter and year presets respect leap years and year changes', () => {
  assert.deepEqual(presetRange('Last month','2024-03-15'),{from:'2024-02-01',to:'2024-02-29'});
  assert.deepEqual(presetRange('Last month','2026-01-15'),{from:'2025-12-01',to:'2025-12-31'});
  assert.deepEqual(presetRange('This quarter','2026-10-05'),{from:'2026-10-01',to:'2026-10-05'});
  assert.deepEqual(presetRange('Year to date','2026-10-05'),{from:'2026-01-01',to:'2026-10-05'});
  assert.deepEqual(presetRange('Today','2026-10-05'),{from:'2026-10-05',to:'2026-10-05'});
  assert.deepEqual(presetRange('This month','2026-10-05'),{from:'2026-10-01',to:'2026-10-05'});
  assert.deepEqual(presetRange('Calendar month','2026-10-05'),{from:'2026-10-01',to:'2026-10-31'});
});
test('Calendar arithmetic preserves four-digit years and real leap boundaries', () => {
  assert.equal(addMonth('0099-12',1),'0100-01');
  assert.deepEqual(monthBounds('0004-02'),['0004-02-01','0004-02-29']);
  assert.equal(monthCells('2026-10').filter(Boolean).length,31);
});
test('Daily results reconcile with shared metrics and exclude open/planned trades', () => {
  const entries=[trade(),trade({id:'be',pnl:2}),trade({id:'loss',pnl:-10}),trade({id:'open',tradingStatus:'open',pnl:-999}),trade({id:'plan',tradingStatus:'planned',pnl:-999})];
  const s=daySummary(entries), shared=metrics(entries);
  assert.equal(s.net.total,shared.total); assert.equal(s.net.total,6); assert.equal(s.net.n,3);
  assert.deepEqual([s.net.wins,s.net.losses,s.net.be],[1,1,1]);
  assert.ok(Math.abs(s.net.winRate! - 100/3) < 1e-10); assert.equal(s.net.fees,6);
  assert.equal(s.curve.at(-1)?.value,6); assert.equal(s.net.avgR,null);
});
test('Missing costs and empty cohorts are not known zero results', () => {
  const s=daySummary([trade({commission:undefined})]);
  assert.equal(s.net.n,0); assert.equal(s.gross.n,1); assert.equal(s.gross.total,20);
  assert.equal(s.net.winRate,null); assert.equal(s.net.pf,null); assert.deepEqual(s.curve,[]);
  assert.equal(daySummary([]).averageHold,null);
});
test('Multiple account currencies cannot be combined, including open positions', () => {
  assert.throws(() => daySummary([trade(),trade({id:'eur',accountCurrency:'EUR',tradingStatus:'open'})]),/one account currency/);
});
test('Partial execution ledger is preserved and never substitutes guessed P&L', () => {
  const e=trade({tradingStatus:'open',fills:[{id:'in',time:'2026-10-02T10:00:00Z',side:'entry',quantity:2,price:10,fee:1},{id:'out',time:'2026-10-02T11:00:00Z',side:'exit',quantity:1,price:12,fee:1}]});
  const before=JSON.stringify(e); assert.equal(daySummary([e]).net.n,0); assert.equal(JSON.stringify(e),before);
});
test('Hold averages use only valid timestamp pairs and retain genuine zero duration', () => {
  const s=daySummary([trade({entryTime:'2026-10-02T10:00:00Z',exitTime:'2026-10-02T10:20:00Z'}),trade({id:'zero',entryTime:'2026-10-02T12:00:00Z',exitTime:'2026-10-02T12:00:00Z'}),trade({id:'negative',entryTime:'2026-10-02T11:00:00Z',exitTime:'2026-10-02T10:00:00Z'}),trade({id:'missing'})]);
  assert.equal(s.holdCount,2); assert.equal(s.averageHold,600000);
});
test('Curve order is deterministic for missing timestamps and chronological with complete evidence', () => {
  const a=trade({id:'a',entryTime:'2026-10-02T12:00:00Z'}), b=trade({id:'b',entryTime:'2026-10-02T10:00:00Z'});
  assert.deepEqual(daySummary([a,b]).curve.map(p=>p.id),['b','a']);
  assert.deepEqual(daySummary([b,trade({id:'c'}),a]).curve.map(p=>p.id),['a','b','c']);
});
test('Day window labels missing answers and costs honestly and keeps linked review actions', () => {
  const html=renderToStaticMarkup(createElement(JournalDayReview,{date:'2026-10-02',entries:[trade({commission:undefined})],currency:'USD',from:'2026-10-01',to:'2026-10-31',note:'',onNote:()=>{},onDay:()=>{},onClose:()=>{},onTrade:()=>{},onEditRules:()=>{},brokerName:id=>id,checklistLength:3,playbookNames:['Breakout'],rules:{maxRisk:1,maxDailyLoss:3,maxTrades:3,stopAfterLosses:2}}));
  const text=html.replace(/<[^>]*>/g,'');
  assert.match(text,/Not answered/); assert.match(text,/unknown costs/); assert.match(text,/not an automatic compliance grade/);
  assert.match(html,/aria-label="Daily reflection"/); assert.match(html,/aria-label="Review TEST trade test"/);
  assert.doesNotMatch(text,/NaN|undefined/);
});
test('Empty and planned-only daily rules do not claim compliance', () => {
  for (const entries of [[],[trade({tradingStatus:'planned'})]]) {
    const text=renderToStaticMarkup(createElement(RulesMonitor,{entries,rules:{maxRisk:1,maxDailyLoss:3,maxTrades:3,stopAfterLosses:2},onEdit:()=>{}})).replace(/<[^>]*>/g,'');
    assert.doesNotMatch(text,/Kept/); assert.match(text,/Unknown/);
  }
});
test('Net ROI is net P&L as percent of recorded account equity, including fees and breakeven', () => {
  assert.equal(netRoiOf(trade({pnl:150,commission:7,equityAtEntry:10000})),1.43);
  assert.equal(netRoiOf(trade({pnl:-100,commission:5,equityAtEntry:10000,direction:'SELL'})),-1.05);
  assert.equal(netRoiOf(trade({pnl:2,commission:2,equityAtEntry:10000})),0);
});
test('ROI never invents capital, unrealized results or a currency conversion', () => {
  for (const patch of [{equityAtEntry:undefined},{equityAtEntry:null},{equityAtEntry:0},{equityAtEntry:-1},{equityAtEntry:NaN},{equityAtEntry:Infinity},{equityAtEntry:1000,commission:undefined},{equityAtEntry:1000,tradingStatus:'open' as const},{equityAtEntry:1000,tradingStatus:'planned' as const},{equityAtEntry:1000,pnlKnown:false}]) assert.equal(netRoiOf(trade(patch)),null);
  assert.equal(netRoiOf(trade({accountCurrency:'EUR',pnl:12,commission:2,equityAtEntry:1000})),1);
});
test('Daily table has separate side, percentage ROI, playbook strategy and demo replay columns', () => {
  const html=renderToStaticMarkup(createElement(JournalDayReview,{date:'2026-10-02',entries:[trade({pnl:150,commission:7,equityAtEntry:10000}),trade({id:'sell',direction:'SELL',strategy:'Legacy setup'})],currency:'USD',from:'2026-10-01',to:'2026-10-31',note:'',onNote:()=>{},onDay:()=>{},onClose:()=>{},onTrade:()=>{},onReplay:()=>{},onEditRules:()=>{},brokerName:id=>id,checklistLength:3,playbookNames:['Breakout'],rules:{maxRisk:1,maxDailyLoss:3,maxTrades:3,stopAfterLosses:2}}));
  assert.match(html,/>Buy \/ Sell<\/th>/); assert.match(html,/>Net ROI \(%\)<\/th>/); assert.match(html,/>Strategy<\/th>/); assert.match(html,/>Replay<\/th>/);
  assert.match(html,/\+1\.43%/); assert.match(html,/>BUY<\/span>/); assert.match(html,/>SELL<\/span>/);
  assert.match(html,/Breakout/); assert.match(html,/Recorded strategy · not linked/);
  assert.match(html,/aria-label="Open demo replay for TEST trade test"/); assert.match(html,/aria-label="Scrollable daily trades table"/);
});
test('Replay window supplies an explicit simulated sandbox, never an API claim', () => {
  const html=renderToStaticMarkup(createElement(JournalReplayAvailability,{entry:trade(),onClose:()=>{}}));
  assert.match(html,/Simulated demo data/); assert.match(html,/not historical or live prices/);
  assert.match(html,/aria-label="Position test price history"/); assert.match(html,/aria-label="Position replay timeline"/);
  assert.doesNotMatch(html,/Custom replay API not connected/);
  assert.match(html,/Return to daily review/);
});

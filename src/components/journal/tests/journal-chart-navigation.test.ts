import test from 'node:test';
import assert from 'node:assert/strict';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {journalExecutionPoints,recordedFillAnchors,recordedFocusInterval,recordedFocusWindow,recordedTradeLevels,recordedTimeTicks,resizeTimeWindow,shiftTimeWindow,shiftPriceInterval,journalDemoAnchor,journalDemoPriceBars,type TimeWindow} from '../executionPriceStudy';
import {ExecutionPriceChart} from '../ExecutionPriceChart';
import {PlaybookExecutionWorkspace} from '../PlaybookExecutionWorkspace';
import {comparePlaybook} from '../playbookComparison';
import {DEFAULT_PLAYBOOKS} from '../../../data/journalPlaybooks';
import {JOURNAL_ENTRIES} from '../../../data/journalData';
const book={...DEFAULT_PLAYBOOKS[0],symbols:['NAS100']};
const entry={...JOURNAL_ENTRIES[0],id:'recorded',strategy:book.name,symbol:'NAS100',date:'2026-08-14',entryTime:'2026-08-14T10:10:00Z',exitTime:'2026-08-14T12:15:00Z',entryPrice:20000,exitPrice:20100,stopPrice:19900,takeProfit:20200};
const point=journalExecutionPoints([entry],'NAS100')[0];
const scope:TimeWindow=[Date.parse('2026-08-01'),Date.parse('2026-10-01')];

test('Recorded trade focus fits actual entry and exit and preserves missing-time evidence',()=>{
 assert.equal(recordedFocusInterval(point),'15m');
 const view=recordedFocusWindow(point,scope,'15m');
 assert.ok(view[0]<Date.parse(entry.entryTime)&&view[1]>Date.parse(entry.exitTime));
 assert.ok(view[1]-view[0]<scope[1]-scope[0]);
 const day=journalExecutionPoints([{...entry,entryTime:undefined,exitTime:undefined}],'NAS100')[0];
 assert.equal(recordedFocusInterval(day),'1D');assert.equal(recordedFillAnchors(day).length,1);
 assert.deepEqual(recordedFillAnchors(point).map(a=>a.time),[Date.parse(entry.entryTime),Date.parse(entry.exitTime)]);
});

test('Recorded timeline zoom and browsing stay inside the selected dates',()=>{
 const view=recordedFocusWindow(point,scope,'15m'),zoom=resizeTimeWindow(view,scope,0.5,2*3600000);
 assert.ok(zoom[1]-zoom[0]<view[1]-view[0]);
 assert.ok(shiftTimeWindow(zoom,scope,-1)[0]<zoom[0]);
 assert.ok(shiftTimeWindow(zoom,scope,1)[1]>zoom[1]);
 assert.deepEqual(resizeTimeWindow(view,scope,10000,1),scope);
 const atStart:TimeWindow=[scope[0],scope[0]+3600000],atEnd:TimeWindow=[scope[1]-3600000,scope[1]];
 assert.deepEqual(shiftTimeWindow(atStart,scope,-1),atStart);assert.deepEqual(shiftTimeWindow(atEnd,scope,1),atEnd);
});

test('Custom journal grid follows UTC calendar intervals without generating prices',()=>{
 const ticks=recordedTimeTicks(scope[0],scope[1],'20m');
 assert.ok(ticks.length<=7&&ticks.length>0);assert.ok(ticks.every(t=>t>=scope[0]&&t<scope[1]&&t%(20*60000)===0));
 const weekly=recordedTimeTicks(scope[0],scope[1],'1W');assert.ok(weekly.every(t=>new Date(t).getUTCDay()===1));
 assert.equal(new Date(shiftPriceInterval(Date.parse('2026-01-31T12:00:00Z'),'1M',1)).toISOString(),'2026-02-28T12:00:00.000Z');
});

test('Recorded guide levels use known prices and omit unknown exits and stops',()=>{
 assert.deepEqual(recordedTradeLevels(point).map(level=>level.price),[20000,20100,19900,20200]);
 const incomplete=journalExecutionPoints([{...entry,exitPrice:null,stopPrice:undefined,takeProfit:undefined}],'NAS100')[0];
 assert.deepEqual(recordedTradeLevels(incomplete).map(level=>level.label),['Entry']);
});

test('Journal shares navigation and labels demo candles separately from recorded outcomes',()=>{
 const compared=comparePlaybook(book,[entry],[],{from:'2026-08-01',to:'2026-10-01',symbols:book.symbols,currency:'USD',balance:100000});
 const html=renderToStaticMarkup(createElement(ExecutionPriceChart,{rows:compared.rows,history:[entry],instrument:'NAS100',source:'journal',from:'2026-08-01',to:'2026-10-01',balance:100000,currency:'USD',format:String,onInstrument:()=>{},onSource:()=>{},onPoint:()=>{}}));
 for(const label of ['Price chart timeframe','Custom interval','Zoom in price chart','Zoom out price chart','Full period','demo market price chart with journal entries and exits','Cumulative closed P&amp;L','Drawdown from peak'])assert.ok(html.includes(label),label);
 assert.match(html,/Demo candles are illustrative, not historical or live prices/);assert.doesNotMatch(html,/sample market price chart with backtest entries/);assert.doesNotMatch(html,/NaN/);
});

test('A fresh workspace opens Journal for both chart and execution history',()=>{
 const html=renderToStaticMarkup(createElement(PlaybookExecutionWorkspace,{playbook:book,entries:[entry],allEntries:[entry],onOpenEntry:()=>{},onShowTrades:()=>{},onReplay:()=>{}}));
 assert.match(html,/<button[^>]*aria-pressed="true"[^>]*>Journal<\/button>/);
 assert.match(html,/<button[^>]*aria-pressed="true"[^>]*>Journal trades \(/);
});


test('Journal demo price path is stable across date windows and independent of exits and P&L',()=>{
 const earlier={...entry,id:'earliest',entryTime:'2026-08-03T10:10:00Z',date:'2026-08-03',entryPrice:19500};
 const anchor=journalDemoAnchor([entry,earlier],'MNQ');assert.equal(anchor?.id,'earliest');
 const full=journalDemoPriceBars('NAS100','2026-08-03','2026-08-05','1h',anchor);
 const subset=journalDemoPriceBars('NAS100','2026-08-04','2026-08-04','1h',anchor);
 assert.deepEqual(subset,full.filter(bar=>bar.t>=Date.parse('2026-08-04')&&bar.t<Date.parse('2026-08-05')));
 assert.deepEqual(full,journalDemoPriceBars('NAS100','2026-08-03','2026-08-05','1h',{...anchor!,exitPrice:1,pnl:-999999}));
 assert.deepEqual(journalDemoPriceBars('UNAVAILABLE','2026-08-03','2026-08-05','1h',anchor),[]);
 assert.ok(full.every(bar=>bar.l<=Math.min(bar.o,bar.c)&&bar.h>=Math.max(bar.o,bar.c)));
});

test('Demo chart preserves exact recorded fill prices and journal results',()=>{
 const before=JSON.stringify(entry),scope={from:'2026-08-01',to:'2026-10-01',symbols:book.symbols,currency:'USD',balance:100000};
 const compared=comparePlaybook(book,[entry],[],scope);
 const html=renderToStaticMarkup(createElement(ExecutionPriceChart,{rows:compared.rows,history:[entry],instrument:'NAS100',source:'journal',from:scope.from,to:scope.to,balance:100000,currency:'USD',format:String,onInstrument:()=>{},onSource:()=>{},onPoint:()=>{}}));
 assert.match(html,/Buy entry at 20000.00 · 2026-08-14T10:10 UTC/);assert.match(html,/Exit at 20100.00 · 2026-08-14T12:15 UTC/);
 assert.equal(JSON.stringify(entry),before);assert.equal(comparePlaybook(book,[entry],[],scope).journal.net,compared.journal.net);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {CandleChart} from '../../backtest/charts';
import {ExecutionPriceChart} from '../ExecutionPriceChart';
import {executionPriceBars,journalExecutionPoints,priceBarAt,priceTimeframe,recordedFillAnchors,customPriceInterval,selectedPriceInterval,PRICE_INTERVAL_GROUPS} from '../executionPriceStudy';
import {comparePlaybook} from '../playbookComparison';
import {DEFAULT_PLAYBOOKS} from '../../../data/journalPlaybooks';
import {JOURNAL_ENTRIES} from '../../../data/journalData';

test('Price view reuses deterministic backtest feed and resolves journal aliases',()=>{
 assert.equal(priceTimeframe('2026-08-01','2026-08-02'),'15m');assert.equal(priceTimeframe('2026-08-01','2026-10-01'),'1D');
 const first=executionPriceBars('NAS100','2026-08-03','2026-08-04','1h');
 const second=executionPriceBars('MNQ','2026-08-03','2026-08-04','1h');
 assert.ok(first.length>0);assert.deepEqual(first,second);assert.deepEqual(executionPriceBars('UNAVAILABLE','2026-08-03','2026-08-04','1h'),[]);
 assert.ok(first.every(bar=>bar.t>=Date.parse('2026-08-03')&&bar.t<Date.parse('2026-08-05')));
 assert.equal(priceBarAt(first,first[0].t-1,'1h'),null);assert.equal(priceBarAt(first,first[0].t,'1h'),0);assert.equal(priceBarAt(first,first.at(-1)!.t+3600000,'1h'),first.length-1);
});
test('Recorded journals preserve actual fill prices and never invent exit timestamps',()=>{
 const entry={...JOURNAL_ENTRIES[0],symbol:'NAS100',entryTime:undefined,date:'2026-08-03',exitPrice:12345,exitTime:undefined};
 const point=journalExecutionPoints([entry],'MNQ')[0];
 assert.equal(point.journal?.entryPrice,entry.entryPrice);assert.equal(recordedFillAnchors(point).length,1);assert.equal(recordedFillAnchors(point)[0].dayOnly,true);
 const exact={...entry,entryTime:'2026-08-03T10:00:00Z',exitTime:'2026-08-03T12:00:00Z'};
 assert.deepEqual(recordedFillAnchors(journalExecutionPoints([exact],'NAS100')[0]).map(anchor=>anchor.price),[exact.entryPrice,12345]);
});
test('Recorded-fill mode shows no generated candles or fake historical price path',()=>{
 const book={...DEFAULT_PLAYBOOKS[0],symbols:['UNAVAILABLE']};
 const entry={...JOURNAL_ENTRIES[0],strategy:book.name,symbol:'UNAVAILABLE',date:'2026-08-03',entryTime:undefined,exitTime:undefined,exitPrice:null,tradingStatus:'open' as const};
 const compared=comparePlaybook(book,[entry],[],{from:'2026-08-01',to:'2026-09-01',symbols:book.symbols,currency:'USD',balance:100000});
 const html=renderToStaticMarkup(createElement(ExecutionPriceChart,{rows:compared.rows,history:[entry],instrument:'UNAVAILABLE',source:'journal',from:'2026-08-01',to:'2026-09-01',balance:100000,currency:'USD',format:String,onInstrument:()=>{},onSource:()=>{},onPoint:()=>{}}));
 assert.match(html,/Recorded fills only/);assert.match(html,/Demo candles are unavailable for this instrument or date range/);assert.match(html,/time not recorded/);assert.doesNotMatch(html,/sample market price chart with backtest entries/);
});
test('Existing candle renderer exposes selectable trade markers and a real time axis',()=>{
 const html=renderToStaticMarkup(createElement(CandleChart,{bars:[{t:Date.parse('2026-08-03T10:00:00Z'),o:10,h:12,l:9,c:11,v:100}],from:0,to:1,dp:2,label:'Test price',showTimeAxis:true,markers:[{index:0,price:10,kind:'buy',label:'Buy entry',id:'t1',showLabel:false}],onMarkerClick:()=>{}}));
 assert.match(html,/role="button"/);assert.match(html,/Buy entry at 10.00/);assert.match(html,/08-03 10:00 UTC/);assert.doesNotMatch(html,/NaN/);
});


test('Custom intervals aggregate existing OHLCV without inventing finer price data',()=>{
 const base=executionPriceBars('NAS100','2026-08-03','2026-08-04','5m');
 const ten=executionPriceBars('NAS100','2026-08-03','2026-08-04','10m');
 assert.ok(ten.length>0&&ten.length<base.length);
 assert.deepEqual(ten[0],{t:base[0].t,o:base[0].o,h:Math.max(base[0].h,base[1].h),l:Math.min(base[0].l,base[1].l),c:base[1].c,v:base[0].v+base[1].v});
 assert.equal(customPriceInterval(20,'m'),'20m');assert.equal(customPriceInterval(2,'h'),'2h');
 for(const count of [0,1,3,7,2.5,1445,NaN])assert.equal(customPriceInterval(count,'m'),null);
 assert.equal(customPriceInterval(13,'M'),null);assert.deepEqual(executionPriceBars('NAS100','2026-08-03','2026-08-04','1m'),[]);
});

test('Calendar candles use UTC weeks and real month lengths with correctly mapped trades',()=>{
 const monthly=executionPriceBars('NAS100','2026-08-03','2026-10-07','1M');
 assert.deepEqual(monthly.map(b=>new Date(b.t).toISOString().slice(0,10)),['2026-08-03','2026-09-01','2026-10-01']);
 assert.equal(priceBarAt(monthly,Date.parse('2026-09-30T12:00:00Z'),'1M'),1);
 assert.equal(priceBarAt(monthly,Date.parse('2026-10-07T12:00:00Z'),'1M'),2);
 assert.equal(priceBarAt(monthly,Date.parse('2026-11-01T00:00:00.001Z'),'1M'),null);
 const weekly=executionPriceBars('NAS100','2026-08-05','2026-08-19','1W');
 assert.deepEqual(weekly.map(b=>new Date(b.t).toISOString().slice(0,10)),['2026-08-05','2026-08-10','2026-08-17']);
 const monthBase=executionPriceBars('NAS100','2026-08-03','2026-08-31','5m');
 assert.equal(monthly[0].c,monthBase.at(-1)!.c);assert.equal(monthly[0].v,monthBase.reduce((sum,b)=>sum+b.v,0));
});

test('Explicit chart intervals survive trade selection while Auto follows trade resolution',()=>{
 assert.equal(selectedPriceInterval('auto','2026-08-01','2026-10-01'),'1D');
 assert.equal(selectedPriceInterval('auto','2026-08-01','2026-10-01','15m'),'15m');
 assert.equal(selectedPriceInterval('1h','2026-08-01','2026-10-01','15m'),'1h');
 assert.equal(selectedPriceInterval('20m','2026-08-01','2026-10-01','15m'),'20m');
 assert.ok(PRICE_INTERVAL_GROUPS.flatMap(g=>g.options).some(option=>option.value==='1W'));
});


test('Coarse candles preserve exact trade times on selectable markers',()=>{
 const html=renderToStaticMarkup(createElement(CandleChart,{bars:[{t:Date.parse('2026-08-03T00:00:00Z'),o:10,h:12,l:9,c:11,v:100}],from:0,to:1,dp:2,label:'Daily candle',markers:[{index:0,price:10,kind:'buy',label:'Buy entry',id:'t1',time:Date.parse('2026-08-03T10:15:00Z')}],onMarkerClick:()=>{}}));
 assert.match(html,/Buy entry at 10.00 · 2026-08-03T10:15 UTC/);
});

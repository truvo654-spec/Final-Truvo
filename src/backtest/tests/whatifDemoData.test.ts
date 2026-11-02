import {test} from 'node:test';
import assert from 'node:assert/strict';
import {JOURNAL_ENTRIES} from '../../data/journalData';
import {DEFAULT_PLAYBOOKS} from '../../data/journalPlaybooks';
import {prepareWhatIfDemoData,applyWhatIfDateRange,whatIfDateBounds,demoWhatIfFeed} from '../whatifDemoData';
import {filterWhatIfEntries} from '../whatifQuick';
import {runWhatIf} from '../whatif';
import {compareParameters} from '../whatifOptimizer';
import {makeSavedWhatIf} from '../savedWhatIf';
import {cond,price,val} from '../rules';
import type {BacktestRun} from '../store';
const entry=(id:string,date:string,symbol='EUR/USD',strategy='Swing')=>({...JOURNAL_ENTRIES[0],id,date,symbol,strategy,entryTime:date+'T10:00:00Z',exitTime:date+'T11:00:00Z',pnl:100,commission:2,direction:'BUY' as const,accountCurrency:'USD',pnlKnown:true,tradingStatus:'closed' as const,outcome:'win' as const});
const entries=[entry('one','2026-10-01'),entry('two','2026-10-02','BTC/USDT','Scalping')];
const books=[{...DEFAULT_PLAYBOOKS[0],name:'Swing',instrumentTimeframe:'4h' as const},{...DEFAULT_PLAYBOOKS[1],name:'Scalping',instrumentTimeframe:'1h' as const}];
const rule={kind:'technical' as const,label:'Positive close',timeframe:'15m' as const,conditions:[cond(price(),'gt',val(0))]};

test('date apply and reset keep the exact checked trades without widening to other source records',()=>{
 const history=[...entries,entry('not-selected','2026-10-02')],scope={from:'',to:'',symbol:'',market:'',side:'',tradeIds:['one','two']};
 const filtered=applyWhatIfDateRange(scope,{from:'2026-10-02',to:'2026-10-02'},false);
 assert.deepEqual(filterWhatIfEntries(history,filtered).map(e=>e.id),['two']);
 const cleared=applyWhatIfDateRange(filtered,{from:'2020-01-01',to:'2030-01-01'},true);
 assert.deepEqual(filterWhatIfEntries(history,cleared).map(e=>e.id),['one','two']);
 assert.deepEqual(scope.tradeIds,['one','two']);assert.equal(scope.from,'');
 assert.deepEqual(whatIfDateBounds(entries),{from:'2026-10-01',to:'2026-10-02'});
 assert.deepEqual(filterWhatIfEntries(history,applyWhatIfDateRange(scope,{from:'2030-01-01',to:'2030-01-02'},false)),[]);
});

test('demo requests inherit Playbook timeframes and load warmup candles for only the selected instruments',()=>{
 const data=prepareWhatIfDemoData(entries,books,undefined,undefined,1000);
 assert.deepEqual(data.metadata.instruments.map(i=>[i.symbol,i.timeframe,i.tradeIds]),[['EUR/USD','4h',['one']],['BTC/USDT','1h',['two']]]);
 assert.ok(data.metadata.instruments.every(i=>i.bars>0&&i.available===1&&i.missing===0));
 const euro=demoWhatIfFeed(data)('EUR/USD','4h');assert.ok(euro.t[0]<Date.parse(entries[0].entryTime));
 assert.equal(demoWhatIfFeed(data)('NVDA','4h').length,0);
 assert.equal(data.metadata.source,'generated');
});

test('applying technical timeframe reloads aligned candles and the engine consumes this exact snapshot',()=>{
 const data=prepareWhatIfDemoData(entries,books,undefined,rule,2000);
 assert.ok(data.metadata.instruments.every(i=>i.timeframe==='15m'&&i.missing===0));
 assert.equal(runWhatIf(entries,rule,1,data).whatIf.netPnl,196);
 const missing={...data,series:new Map()};
 const output=runWhatIf(entries,rule,1,missing);
 assert.equal(output.whatIf.netPnl,196);assert.ok(output.trades.every(t=>t.note.startsWith('Technical check unavailable')));
 assert.equal(output.skipped,0);
});

test('refresh preserves seeded past prices and saved results / provenance stay frozen',()=>{
 const a=prepareWhatIfDemoData(entries,books,undefined,rule,1000),b=prepareWhatIfDemoData(entries,books,undefined,rule,5000);
 assert.notEqual(a.metadata.loadedAt,b.metadata.loadedAt);
 assert.deepEqual(demoWhatIfFeed(a)('EUR/USD','15m').c,demoWhatIfFeed(b)('EUR/USD','15m').c);
 const row=compareParameters(entries,[rule],a)[0],saved=makeSavedWhatIf(row,{currency:'USD',source:'user',goal:'net',benchmark:'Selected trades',scope:{},demoData:a.metadata},'Demo');
 a.metadata.instruments[0].timeframe='1D';assert.equal(saved.snapshot!.demoData!.instruments[0].timeframe,'15m');assert.equal(saved.whatIfNet,196);
});

test('saved tests use their own timeframe and unknown demo symbols never substitute another instrument',()=>{
 const run={settings:{timeframe:'1h'}} as BacktestRun;
 const data=prepareWhatIfDemoData(entries,books,run,undefined,1000);
 assert.equal(data.metadata.source,'saved-test');assert.ok(data.metadata.instruments.every(i=>i.timeframe==='1h'));
 const unknown=prepareWhatIfDemoData([entry('unknown','2026-10-01','UNKNOWN')],books,undefined,rule,1000);
 assert.equal(unknown.metadata.instruments[0].symbol,null);assert.equal(unknown.metadata.instruments[0].missing,1);assert.equal(unknown.metadata.instruments[0].bars,0);
});

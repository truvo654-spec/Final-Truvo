import test from 'node:test';
import assert from 'node:assert/strict';
import { comparePlaybook, comparisonStats, type ComparisonScope } from '../playbookComparison';
import { generatePlaybookSimulation, simulationSettings } from '../playbookSimulation';
import { DEFAULT_PLAYBOOKS } from '../../../data/journalPlaybooks';
import { JOURNAL_ENTRIES } from '../../../data/journalData';
import { eligible } from '../journalMath';
import { defaultSettings } from '../../../backtest/rules';
import { summarize, type BacktestRun } from '../../../backtest/store';
import { playbookFingerprint } from '../playbookExecution';
import type { BacktestTrade } from '../../../backtest/types';
const book={...DEFAULT_PLAYBOOKS[0],symbols:['NAS100','GBP/USD'],window:null};
const scope:ComparisonScope={from:'2026-07-01',to:'2026-09-30',symbols:book.symbols,currency:'USD',balance:100000};
const trade=(id:number,date:string,net:number):BacktestTrade=>({id,entryTime:Date.parse(date+'T10:00:00Z'),exitTime:Date.parse(date+'T12:00:00Z'),direction:'long',entryPrice:100,exitPrice:101,orderType:'market',stopPrice:99,targetPrice:102,size:1,gross:net,costs:0,net,r:net/100,mae:0,mfe:1,exitReason:'target',balance:100000+net,bars:2,ambiguous:false,partial:false});
const makeRun=(id:string,from:string,to:string,trades:BacktestTrade[]):BacktestRun=>{
 const output={result:{trades,startBalance:100000,endBalance:100000,currency:'USD' as const,rangeStart:0,rangeEnd:1,events:[],stopReason:null,diagnostics:{} as any,zeroTradeReason:null,propStatus:null,tradingDays:1},suggestions:[]};
 return {id,name:id,mode:'automated',status:'done',playbookId:book.id,symbol:'MNQ',timeframe:'15m',from,to,createdAt:'2026-10-01',lastRun:id,settings:defaultSettings({playbook:book}),summary:summarize(output),output,playbookFingerprint:playbookFingerprint(book)};
};
test('Shared date, instrument and currency scope; closes after cutoff cannot leak into results',()=>{
 const template=JOURNAL_ENTRIES.find(e=>eligible(e))!;
 const base={...template,strategy:book.name,symbol:'NAS100',date:'2026-08-01',entryTime:'2026-08-01T10:00:00Z',exitTime:'2026-08-01T12:00:00Z',accountCurrency:'USD',pnl:110,commission:10};
 const entries=[base,{...base,id:'old',date:'2026-06-01'},{...base,id:'eur',accountCurrency:'EUR'},{...base,id:'outside',symbol:'BTC/USDT'},{...base,id:'future',exitTime:'2026-10-02T12:00:00Z'}];
 const result=comparePlaybook(book,entries,[],scope);
 assert.equal(result.journal.count,1);assert.equal(result.journal.net,100);assert.equal(result.history.length,2);assert.equal(result.rows.length,2);
});
test('Latest covering run preferred; overlapping tests never duplicate trades and rates are percentages',()=>{
 const old=makeRun('a','2026-07-01','2026-09-30',[trade(1,'2026-08-01',100),trade(2,'2026-08-02',-50)]);
 const newerPartial=makeRun('z','2026-09-01','2026-09-30',[trade(3,'2026-09-02',999)]);
 const result=comparePlaybook(book,[],[newerPartial,old],scope);
 assert.equal(result.simulated.count,2);assert.equal(result.simulated.net,50);assert.equal(result.simulated.winRate,50);assert.equal(result.rows[0].partial,false);assert.equal(result.rows[1].run,undefined);
});
test('Closed P&L drawdown uses the reference balance and exit ordering',()=>{
 const points=[{id:'2',at:2,entryAt:1,net:-300,r:-3,symbol:'A'},{id:'1',at:1,entryAt:0,net:100,r:1,symbol:'A'}];
 const result=comparisonStats(points,1000);
 assert.equal(result.drawdown,300);assert.ok(Math.abs(result.drawdownPct!-300/1100*100)<1e-8);assert.equal(result.net,-200);
});
test('Simulation maps selected instrument, technical rules, target, timeframe and balance without fabricating fills',async()=>{
 const custom={...book,instrumentTimeframe:'1h' as const,technicalEntryConditions:[{id:'always',left:{kind:'price' as const,field:'close' as const},op:'gt' as const,right:{kind:'value' as const,value:0}}]};
 const short={...scope,from:'2026-08-01',to:'2026-08-31',symbols:['NAS100']};
 const settings=simulationSettings(custom,short,'NAS100');
 assert.equal(settings.symbol,'MNQ');assert.equal(settings.timeframe,'1h');assert.equal(settings.risk.startBalance,100000);assert.equal(settings.rules.exits.targetR,custom.benchmarkRR);assert.deepEqual(settings.rules.entry,custom.technicalEntryConditions);
 const result=await generatePlaybookSimulation(custom,short,'NAS100');
 assert.ok(result.output.result.trades.length>0);assert.equal(result.summary.trades,result.output.result.trades.length);assert.equal(result.playbookFingerprint,playbookFingerprint(custom));
 assert.ok(result.output.result.trades.every(t=>t.entryTime>=Date.parse(short.from)&&t.exitTime<=Date.parse('2026-09-01')));
 const ctl=new AbortController();ctl.abort();await assert.rejects(generatePlaybookSimulation(custom,short,'NAS100',{signal:ctl.signal}),/cancelled/i);
 assert.throws(()=>simulationSettings(custom,short,'CUSTOM'),/unavailable/);
 assert.throws(()=>simulationSettings(custom,{...short,balance:0},'NAS100'),/balance/);
 assert.throws(()=>simulationSettings(custom,{...short,from:'2020-01-01'},'NAS100'),/date range/);
});

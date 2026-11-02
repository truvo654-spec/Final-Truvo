import {test} from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {quickWhatIfSource,quickWhatIfDefaults,whatIfRunEntries,filterWhatIfEntries,whatIfMarket,WHAT_IF_MARKETS,quickWhatIfAlternatives} from '../whatifQuick';
import {compareParameters} from '../whatifOptimizer';
import {makeSavedWhatIf} from '../savedWhatIf';
import {WhatIfResults} from '../../components/backtest/WhatIfResults';
import type {WhatIfRule} from '../whatif';
import {DEFAULT_PLAYBOOKS} from '../../data/journalPlaybooks';
import {JOURNAL_ENTRIES} from '../../data/journalData';
import {defaultSettings} from '../rules';
import {runWhatIf} from '../whatif';
import type {BacktestRun} from '../store';
import {WhatIfPanel} from '../../components/backtest/WhatIfPanel';
const rules={maxRisk:1,maxDailyLoss:3,maxTrades:3,stopAfterLosses:3};
const book={...DEFAULT_PLAYBOOKS[0],directions:['short'] as ('long'|'short')[]};
const trade={...JOURNAL_ENTRIES[0],id:'selected',strategy:book.name,direction:'SELL' as const,accountCurrency:'USD',pnl:100,commission:2,outcome:'win' as const,tradingStatus:'closed' as const,pnlKnown:true};
test('current selection retains exact IDs and currency without widening to history',()=>{
 const history=[trade,{...trade,id:'other'},{...trade,id:'eur',accountCurrency:'EUR'}];
 const before=JSON.stringify(history);
 const out=quickWhatIfSource('selection',[trade,history[2]],history,[book],[],'USD');
 assert.deepEqual(out.entries.map(t=>t.id),['selected']);assert.equal(out.excluded,1);
 assert.equal(quickWhatIfSource('selection',[],history,[book],[],'USD').entries.length,0);
 assert.equal(JSON.stringify(history),before);
});
test('Playbook source honors saved direction but retains out-of-session trades as comparison evidence',()=>{
 const history=[trade,{...trade,id:'long',direction:'BUY' as const},{...trade,id:'other',strategy:'Other'}];
 const out=quickWhatIfSource('book:'+book.id,[],history,[book],[],'USD');
 assert.deepEqual(out.entries.map(t=>t.id),['selected']);
 assert.equal(quickWhatIfDefaults(book,undefined,rules).n,3);
 assert.equal(quickWhatIfDefaults(book,undefined,rules).target,book.benchmarkRR);
 assert.equal(quickWhatIfDefaults(book,undefined,rules).start,book.window?.start??7);
});
test('saved test adapter preserves net costs, currency, direction and independent IDs without journal writes',()=>{
 const settings=defaultSettings();settings.risk.currency='EUR';settings.rules.exits.targetR=3;settings.risk.dailyLossPct=2;
 const run={id:'saved',name:'Saved Swing',symbol:'MGC',playbookId:book.id,settings,output:{result:{trades:[{id:1,entryTime:Date.UTC(2026,8,1,12),exitTime:Date.UTC(2026,8,1,13),direction:'short',entryPrice:100,exitPrice:98,size:2,gross:110,costs:10,net:100,r:2,stopPrice:101,targetPrice:97}]}}} as BacktestRun;
 const before=JSON.stringify(run);const entries=whatIfRunEntries(run);
 assert.equal(entries[0].id,'whatif:saved:1');assert.equal(entries[0].initialRisk,50);
 assert.equal(entries[0].accountCurrency,'EUR');assert.equal(entries[0].direction,'SELL');
 const source=quickWhatIfSource('run:saved',[],[trade],[book],[run],'USD');
 assert.equal(source.currency,'EUR');assert.equal(source.entries.length,1);assert.equal(source.book?.id,book.id);
 const out=runWhatIf(entries,{kind:'lossesPerDay',n:2});assert.equal(out.actual.netPnl,100);assert.equal(out.saved,0);
 const fractional=entries.map(e=>({...e,pnl:100.004,whatIfRecordedNet:100.004}));
 assert.equal(runWhatIf(fractional,{kind:'lossesPerDay',n:2}).actual.netPnl,100.004);
 assert.equal(runWhatIf(fractional,{kind:'lossesPerDay',n:2}).whatIf.netPnl,100.004);
 assert.equal(quickWhatIfDefaults(book,run,rules).target,3);assert.equal(quickWhatIfDefaults(book,run,rules).usd,settings.risk.startBalance*.02);
 assert.equal(JSON.stringify(run),before);
});
test('basic page starts with loaded evidence and common changes, leaving optimization for a popup',()=>{
 const html=renderToStaticMarkup(React.createElement(WhatIfPanel,{entries:[trade],allEntries:[trade],playbooks:[book],journalRules:rules,tz:'UTC',onToast:()=>{},onOpenTrades:()=>{},onAddRule:()=>{}}));
 assert.match(html,/1 closed trade/);assert.match(html,/See results/);
 assert.doesNotMatch(html,/Explore alternatives/);
 assert.doesNotMatch(html,/Parameter optimization|MarketSyde AI recommender|wi-benchmark|NaN/);
});
test('alternatives keep the exact chosen value first and only vary the same rule',()=>{
 const rules:WhatIfRule[]=[{kind:'lossesPerDay',n:2},{kind:'target',r:2.17},{kind:'hours',start:22,end:3},{kind:'mistakes',tags:['Chased','Late']},{kind:'stop',mult:0.62},{kind:'breakeven',r:1.3},{kind:'dailyLoss',usd:325}];
 for(const rule of rules){
  const before=JSON.stringify(rule),alternatives=quickWhatIfAlternatives(rule);
  assert.deepEqual(alternatives[0],rule);assert.notEqual(alternatives[0],rule);
  assert.ok(alternatives.length<=4);assert.ok(alternatives.every(r=>r.kind===rule.kind));
  assert.equal(new Set(alternatives.map(r=>JSON.stringify(r))).size,alternatives.length);
  assert.equal(JSON.stringify(rule),before);
 }
 assert.deepEqual(quickWhatIfAlternatives({kind:'lossesPerDay',n:2}).map(r=>r.kind==='lossesPerDay'?r.n:null),[2,1,3]);
 const hours=quickWhatIfAlternatives({kind:'hours',start:22,end:3});
 assert.ok(hours.every(r=>r.kind==='hours'&&r.start===22&&r.end>=0&&r.end<=24));
 assert.ok(quickWhatIfAlternatives({kind:'target',r:0.1}).every(r=>r.kind==='target'&&r.r>0));
});
test('switching and saving an alternative preserves its exact rule, evidence and source setup',()=>{
 const original={kind:'lossesPerDay',n:2} as const;
 const history=[{...trade,id:'loss',pnl:-100,commission:0,date:'2026-09-01',entryTime:'2026-09-01T08:00:00Z',exitTime:'2026-09-01T09:00:00Z'},{...trade,id:'later',pnl:200,commission:0,date:'2026-09-01',entryTime:'2026-09-01T10:00:00Z',exitTime:'2026-09-01T11:00:00Z'}];
 const before=JSON.stringify(history),rows=compareParameters(history,quickWhatIfAlternatives(original));
 const choice=rows[0],alternative=rows.find(r=>r.rule.kind==='lossesPerDay'&&r.rule.n===1)!;
 assert.equal(choice.output.saved,0);assert.equal(alternative.output.saved,-200);
 for(const row of rows){assert.deepEqual(row.output.trades.map(t=>t.id),['loss','later']);assert.equal(row.output.actual.netPnl,100);}
 const saved=makeSavedWhatIf(alternative,{currency:'USD',source:'parameter',goal:'net',benchmark:'Selected Trade Log',scope:{Market:'Forex','Trade IDs':'loss,later'}},'Selected alternative');
 assert.deepEqual(saved.rule,{kind:'lossesPerDay',n:1});assert.equal(saved.whatIfNet,-100);
 assert.equal(saved.snapshot?.scope.Market,'Forex');assert.equal(JSON.stringify(history),before);assert.equal(original.n,2);
 const html=renderToStaticMarkup(React.createElement(WhatIfResults,{rows,selected:alternative,onSelect:()=>{},currency:'USD',summary:'Selected Trade Log · 2 trades · Forex',simulation:false,saved:false,onSave:()=>{},onTrades:()=>{},onClose:()=>{},onAdvanced:()=>{}}));
 assert.match(html,/Viewing an alternative/);assert.match(html,/Your choice/);assert.match(html,/Same trades, same rule/);assert.match(html,/Small sample/);assert.match(html,/Save comparison/);
 assert.match(html,/Advanced analysis/);
 assert.doesNotMatch(html,/Best|Recommendation goal|Rule to change|What-if data source/);
});
test('market filtering covers every supported market and keeps exact checked trades',()=>{
 const filters={from:'',to:'',symbol:'',side:'',market:'',tradeIds:null as string[]|null};
 const history=WHAT_IF_MARKETS.map((market,i)=>({...trade,id:String(i),assetClass:market as typeof trade.assetClass}));
 for(const market of WHAT_IF_MARKETS){const picked=filterWhatIfEntries(history,{...filters,market});assert.equal(picked.length,1);assert.equal(picked[0].assetClass,market);}
 assert.equal(filterWhatIfEntries(history,filters).length,5);
 assert.deepEqual(filterWhatIfEntries(history,{...filters,tradeIds:['0','3']}).map(e=>e.id),['0','3']);
 assert.equal(filterWhatIfEntries(history,{...filters,tradeIds:[]}).length,0);
 assert.equal(filterWhatIfEntries(history,{...filters,tradeIds:['0'],market:'Stocks'}).length,0);
 assert.equal(whatIfMarket({...trade,symbol:'MGC',assetClass:'Commodity'}),'Commodity');
 assert.equal(whatIfMarket({...trade,symbol:'MGC',assetClass:'Commodity',whatIfRecordedNet:100}),'Futures');
 assert.equal(whatIfMarket({...trade,symbol:'MNQ',assetClass:'Indices',whatIfRecordedNet:100}),'Futures');
});

test('Playbook handoff loads any-time sessions and the saved target without mutating the book',()=>{
 const anyTime={...book,window:null,benchmarkRR:3.5},before=JSON.stringify(anyTime);
 const loaded=quickWhatIfDefaults(anyTime,undefined,rules);
 assert.deepEqual([loaded.start,loaded.end,loaded.target],[0,24,3.5]);
 assert.equal(JSON.stringify(anyTime),before);
 const html=renderToStaticMarkup(React.createElement(WhatIfPanel,{initialPlaybookId:anyTime.id,entries:[],allEntries:[trade],playbooks:[anyTime],journalRules:rules,tz:'UTC',onToast:()=>{},onOpenTrades:()=>{},onAddRule:()=>{}}));
 assert.match(html,/Setup loaded/);assert.match(html,/Any time/);assert.match(html,/Target 3.5R/);assert.match(html,/Technical tools/);
});

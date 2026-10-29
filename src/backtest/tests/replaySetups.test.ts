import test from 'node:test';
import assert from 'node:assert/strict';
import {relatedReplaySetups,replayRuleFields,applyReplayPositionSetup,replayVisibleAtr,replayJournalAdvice} from '../replaySetups';
import {practiceEntryBlock,emptyPracticeGuardrails} from '../practiceGuardrails';
import {DEFAULT_PLAYBOOKS} from '../../data/journalPlaybooks';
import type {PositionDraft} from '../positionReplay';
import type {PracticeTrade,WhatIfRun,BacktestRun} from '../store';
import {defaultSettings} from '../rules';
import {autoMap,convertRows,parseCsv,SAMPLE_CSV} from '../../components/journal/journalIngest';

const imported=()=>{const [headers,...rows]=parseCsv(SAMPLE_CSV);return convertRows(rows,autoMap(headers),[],{currency:'USD',strategy:'Unassigned'}).map(r=>r.entry!);};
const draft:PositionDraft={direction:'BUY',entry:'100',stop:'90',target:'120',quantity:'10',unit:'shares',multiplier:'1',costs:'3',equity:'10000'};
test('related setups copy playbook scope and scenario levels without mutating original data',()=>{
  const before=JSON.stringify(DEFAULT_PLAYBOOKS),options=relatedReplaySetups(DEFAULT_PLAYBOOKS,[],[],[]);
  const base=options.find(o=>o.id===`playbook:${DEFAULT_PLAYBOOKS[0].id}`)!;
  assert.equal(base.targetR,2);assert.deepEqual(base.session,{start:12,end:16});assert.equal(base.riskPercent,1);
  const scenario=options.find(o=>o.id.endsWith(':sc1'))!;
  assert.equal(scenario.symbols.length,1);assert.equal(scenario.targetR,3);assert.ok(scenario.prices);
  base.symbols.push('OTHER');assert.equal(JSON.stringify(DEFAULT_PLAYBOOKS),before);
  const broken={...DEFAULT_PLAYBOOKS[0],scenarios:[{...DEFAULT_PLAYBOOKS[0].scenarios![0],stop:20000}]};
  const invalid=relatedReplaySetups([broken],[],[],[]).find(o=>o.id.endsWith(':sc1'))!;
  assert.equal(invalid.prices,undefined);assert.match(invalid.notes.join(' '),/invalid/);
});
test('saved What-if transfers rules but never saved profits, with no implicit monetary conversion',()=>{
  const save:WhatIfRun={id:'legacy',createdAt:'2026-10-01',rule:{kind:'target',r:3},trades:20,actualNet:100,whatIfNet:999999,saved:0};
  const copied=relatedReplaySetups([],[],[save],[])[0];assert.equal(copied.targetR,3);assert.equal(copied.equity,undefined);assert.deepEqual(copied.symbols,[]);
  assert.deepEqual(replayRuleFields({kind:'dailyLoss',usd:50},'USD'),{dailyLoss:50});
  const euro=replayRuleFields({kind:'dailyLoss',usd:50},'EUR');assert.equal(euro.dailyLoss,undefined);assert.match(euro.notes!.join(''),/does not convert/);
  assert.deepEqual(replayRuleFields({kind:'hours',start:22,end:2}).session,{start:22,end:2});
});
test('saved automated setups preserve percent risk but transfer monetary equity only for USD',()=>{
  const settings=defaultSettings({playbook:DEFAULT_PLAYBOOKS[0]});settings.risk.startBalance=10000;settings.risk.mode='fixedR';settings.risk.fixedR=100;
  const usd={id:'usd',name:'USD setup',settings} as BacktestRun;
  const euro={id:'eur',name:'EUR setup',settings:{...settings,risk:{...settings.risk,currency:'EUR' as const},rules:{...settings.rules,exits:{...settings.rules.exits,stop:{type:'points' as const,value:5}}}}} as BacktestRun;
  const before=JSON.stringify([usd,euro]),copies=relatedReplaySetups([],[],[],[usd,euro]);
  assert.equal(copies[0].equity,10000);assert.equal(copies[0].riskPercent,1);
  assert.equal(copies[1].equity,undefined);assert.equal(copies[1].riskPercent,undefined);assert.equal(copies[1].stopAtr,undefined);
  assert.match(copies[1].notes.join(' '),/not converted/);assert.equal(JSON.stringify([usd,euro]),before);
});
test('playbook backtest settings use that playbook limits and respect disabled limits',()=>{
  const tradingRules={
    values:{maxRisk:0.5,maxDailyLoss:1.75,maxTrades:4,stopAfterLosses:2},
    enabled:{maxRisk:true,maxDailyLoss:true,maxTrades:true,stopAfterLosses:true},
    customRules:[],
  };
  const book={...DEFAULT_PLAYBOOKS[0],riskPerTrade:9,maxTradesPerDay:9,tradingRules};
  const enabled=defaultSettings({playbook:book});
  assert.equal(enabled.risk.percent,0.5);
  assert.equal(enabled.risk.dailyLossPct,1.75);
  assert.equal(enabled.rules.maxTradesPerDay,4);
  const disabled=defaultSettings({
    playbook:{...book,tradingRules:{...tradingRules,enabled:{maxRisk:false,maxDailyLoss:false,maxTrades:false,stopAfterLosses:false}}},
    journalRules:{maxRisk:1.25,maxDailyLoss:3,maxTrades:5,stopAfterLosses:2},
  });
  assert.equal(disabled.risk.percent,1.25);
  assert.equal(disabled.risk.dailyLossPct,null);
  assert.equal(disabled.rules.maxTradesPerDay,null);
});
test('position adaptation retains costs and size for exit-only comparisons and keeps instruments isolated',()=>{
  const next=applyReplayPositionSetup(draft,{targetR:3,stopFraction:.5},'NVDA');
  assert.equal(next.stop,'95.00');assert.equal(next.target,'115.00');assert.equal(next.quantity,draft.quantity);assert.equal(next.costs,draft.costs);
  const other=applyReplayPositionSetup(draft,{symbols:['EUR/USD'],prices:{entry:1.1,stop:1,target:1.2}},'NVDA');
  assert.equal(other.entry,'100');assert.equal(other.stop,'90.00');assert.equal(draft.stop,'90');
  const flip=applyReplayPositionSetup(draft,{direction:'SELL',targetR:2},'NVDA');assert.equal(flip.stop,'110.00');assert.equal(flip.target,'80.00');
});
test('ATR fills missing stops from revealed evidence and rounds risk sizing down to supported increments',()=>{
  const next=applyReplayPositionSetup({...draft,stop:''},{stopAtr:2,targetR:3,riskPercent:1},'NVDA',1);
  assert.equal(next.stop,'98.00');assert.equal(next.target,'106.00');assert.equal(next.quantity,'50');
  const bars=[{t:0,o:100,h:101,l:99,c:100,v:1},{t:1,o:102,h:104,l:101,c:103,v:1},{t:2,o:100,h:999,l:1,c:300,v:1}];
  assert.equal(replayVisibleAtr(bars,2),3);assert.equal(replayVisibleAtr(bars.slice(0,2),2),3);
});
test('journal AI excludes the replay trade, other currencies, other instruments and future closed results',()=>{
  const sample=imported()[0],cutoff=Date.parse('2026-10-06T00:00:00Z');
  const history=[sample,{...sample,id:'selected'},{...sample,id:'eur',accountCurrency:'EUR'},{...sample,id:'future',exitTime:'2026-10-07T00:00:00Z'},{...sample,id:'other',symbol:'NVDA'}];
  const advice=replayJournalAdvice(history,sample.symbol,'net',cutoff,'selected');
  assert.deepEqual(advice.history.map(e=>e.id),[sample.id]);assert.equal(advice.recommendation.status,'insufficient');
  const changed=replayJournalAdvice(history.map(e=>e.id==='future'?{...e,pnl:1e8}:e),sample.symbol,'net',cutoff,'selected');
  assert.deepEqual(changed.rows,advice.rows);
});
test('practice limits use only closed results, count partial exits as one position and respect overnight UTC sessions',()=>{
  const trade=(entry:string,exit:string,net:number):PracticeTrade=>({dir:'long',entry:100,exit:90,size:1,net,r:-1,entryBar:1,exitBar:2,tags:[],entryTime:entry,exitTime:exit});
  const now=Date.parse('2026-10-05T23:00:00Z');
  const trades=[trade('2026-10-05T22:00:00Z','2026-10-05T22:30:00Z',-20),trade('2026-10-05T22:00:00Z','2026-10-05T22:40:00Z',-30),trade('2026-10-05T22:45:00Z','2026-10-06T00:00:00Z',-1000)];
  assert.equal(practiceEntryBlock(trades,now,{...emptyPracticeGuardrails,maxTrades:2}),null);
  assert.match(practiceEntryBlock(trades,now,{...emptyPracticeGuardrails,lossesPerDay:1})!,/losing-trade/);
  assert.equal(practiceEntryBlock(trades,now,{...emptyPracticeGuardrails,dailyLoss:51}),null);
  assert.match(practiceEntryBlock(trades,now,{...emptyPracticeGuardrails,dailyLoss:50})!,/daily loss/);
  assert.equal(practiceEntryBlock([],now,{...emptyPracticeGuardrails,session:{start:22,end:2}}),null);
  assert.match(practiceEntryBlock([],Date.parse('2026-10-05T12:00:00Z'),{...emptyPracticeGuardrails,session:{start:22,end:2}})!,/Outside/);
});

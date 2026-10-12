import {test} from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {aiWhatIfRules,buildWhatIfStudy,compareWhatIfLedgers} from '../whatifStudy';
import {autoMap,convertRows,parseCsv,SAMPLE_CSV} from '../../components/journal/journalIngest';
import {runWhatIf} from '../whatif';
import {ScenarioOutcomeComparison} from '../../components/backtest/ScenarioOutcomeComparison';
import {WhatIfPanel} from '../../components/backtest/WhatIfPanel';

function history(){
  const [headers,...csvRows]=parseCsv(SAMPLE_CSV);
  const source=convertRows(csvRows,autoMap(headers),[],{strategy:'Test',currency:'USD'})[0].entry!;
  return Array.from({length:30},(_,i)=>{
    const date=new Date(Date.UTC(2026,7,1+i)).toISOString().slice(0,10);
    return {...source,id:`t${i}`,date,entryTime:`${date}T14:00:00Z`,exitTime:`${date}T15:00:00Z`,pnl:i%3===0?-100:100,commission:0,initialRisk:100,takeProfit:null,rMultiple:i%3===0?-1:1,mistakes:i%3===0?['Chased price']:[],tags:[]};
  });
}
test('AI scenario is independently selected without overwriting the user rule and full totals reconcile',()=>{
  const entries=history(),rule={kind:'target' as const,r:2};
  const study=buildWhatIfStudy(entries,rule,[0.5,3,0.5],'net');
  assert.deepEqual(rule,{kind:'target',r:2}); assert.deepEqual(study.rows[0].rule,rule);
  assert.deepEqual(study.aiRow?.rule,{kind:'mistakes',tags:['Chased price']});
  assert.equal(study.aiRow!.output.whatIf.netPnl,2000);
  assert.equal(study.aiRow!.output.saved,1000);
  assert.equal(study.aiRow!.training.saved,700); assert.equal(study.aiRow!.validation?.saved,300);
  assert.equal(study.aiRow!.output.trades.length,entries.length);
});
test('AI candidate metadata is learned only from training days and exploration stays bounded',()=>{
  const entries=history();
  entries.at(-1)!.mistakes=['Holdout only']; entries.at(-1)!.initialRisk=100000000;
  const rules=aiWhatIfRules(entries);
  assert.ok(!rules.some(r=>r.kind==='mistakes'&&r.tags.includes('Holdout only')));
  assert.deepEqual(rules.filter(r=>r.kind==='dailyLoss').map(r=>r.kind==='dailyLoss'?r.usd:0),[100,200]);
  assert.ok(rules.length<=21);
});
test('changed-trade comparison joins by ID, includes AI-only changes and preserves unavailable evidence',()=>{
  const entries=history(),user=runWhatIf(entries,{kind:'target',r:2}),ai=runWhatIf(entries,{kind:'mistakes',tags:['Chased price']});
  ai.trades.reverse();
  const joined=compareWhatIfLedgers(user,ai);
  assert.equal(joined.length,10);
  assert.ok(joined.every(row=>row.user.id===row.ai?.id&&row.user.status==='same'&&row.ai?.status==='skipped'));
  const changedUser=runWhatIf(entries,{kind:'stop',mult:0.5});
  const missing=compareWhatIfLedgers(changedUser,{...ai,trades:[]});
  assert.ok(missing.length>0);assert.ok(missing.every(row=>row.ai===undefined));
});
test('outcome chart does not invent AI values or render invalid SVG geometry',()=>{
  const user=runWhatIf(history(),{kind:'target',r:2});
  const html=renderToStaticMarkup(React.createElement(ScenarioOutcomeComparison,{user,ai:null,aiName:'Unavailable',userName:'2R target'}));
  assert.match(html,/No qualifying AI scenario/);assert.match(html,/Winning net/);
  assert.doesNotMatch(html,/NaN|Infinity/);assert.match(html,/MarketSyde AI/);
});
test('What-if table includes AI aggregate and trade evidence on the same filtered cohort',()=>{
  const entries=history();
  const html=renderToStaticMarkup(React.createElement(WhatIfPanel,{entries,allEntries:entries,playbooks:[],journalRules:{} as never,tz:'UTC',onToast:()=>{},onOpenTrades:()=>{},onAddRule:()=>{}}));
  assert.match(html,/Your setup vs MarketSyde AI/);
  assert.equal((html.match(/MarketSyde AI result/g)||[]).length,2);
  assert.match(html,/Trades that changed \(10\)/);assert.match(html,/AI Δ your setup/);
  assert.match(html,/2,000\.00/); assert.doesNotMatch(html,/NaN/);
});

import {test} from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {autoMap,convertRows,parseCsv,SAMPLE_CSV} from '../../components/journal/journalIngest';
import {buildWhatIfStudy} from '../whatifStudy';
import {makeSavedWhatIf,savedWhatIfKey,whatIfSaveKey,type WhatIfSaveContext} from '../savedWhatIf';
import {loadWhatIfs,saveWhatIfs,type WhatIfRun} from '../store';
import {SavedWhatIfRuns} from '../../components/backtest/SavedWhatIfRuns';

function study(){
  const [headers,...rows]=parseCsv(SAMPLE_CSV);
  const source=convertRows(rows,autoMap(headers),[],{strategy:'Test',currency:'EUR'})[0].entry!;
  const entries=Array.from({length:30},(_,i)=>{
    const date=new Date(Date.UTC(2026,7,1+i)).toISOString().slice(0,10);
    return {...source,id:`s${i}`,date,entryTime:`${date}T14:00:00Z`,exitTime:`${date}T15:00:00Z`,pnl:i%3===0?-100:100,commission:0,initialRisk:100,takeProfit:null,rMultiple:i%3===0?-1:1,mistakes:i%3===0?['Chased price']:[],tags:[]};
  });
  return buildWhatIfStudy(entries,{kind:'target',r:2},[1,3,1],'net');
}
const context:WhatIfSaveContext={currency:'EUR',source:'ai',benchmark:'All journal history',scope:{Symbols:'EUR/USD','Market type':'Forex'},goal:'net'};

test('saved scenario preserves the exact AI rule, cohort, holdout and currency as an independent snapshot',()=>{
  const model=study(),row=model.aiRow!;
  const saved=makeSavedWhatIf(row,context,'AI test');
  assert.equal(saved.whatIfNet,row.output.whatIf.netPnl);
  assert.deepEqual(saved.rule,row.rule);assert.deepEqual(saved.snapshot!.output.trades,row.output.trades);
  assert.equal(saved.snapshot!.currency,'EUR');assert.equal(saved.snapshot!.source,'ai');
  assert.equal(saved.snapshot!.training.trades.length,21);assert.equal(saved.snapshot!.validation!.trades.length,9);
  assert.equal(savedWhatIfKey(saved),whatIfSaveKey(row.rule,context,row.output));
  row.output.trades[0].newNet=99999; row.output.whatIf.netPnl=99999;context.scope.Symbols='GBP/USD';
  assert.notEqual(saved.snapshot!.output.trades[0].newNet,99999);assert.notEqual(saved.snapshot!.output.whatIf.netPnl,99999);
  assert.equal(saved.snapshot!.scope.Symbols,'EUR/USD');context.scope.Symbols='EUR/USD';
  assert.notEqual(savedWhatIfKey(saved),whatIfSaveKey(row.rule,context,row.output));
});

test('saved What-if evidence reloads, preserves special metrics and accepts legacy records',()=>{
  const descriptor=Object.getOwnPropertyDescriptor(globalThis,'localStorage');
  const values=new Map<string,string>();
  Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:(key:string)=>values.get(key)??null,setItem:(key:string,value:string)=>values.set(key,value)}});
  try{
    const row=study().aiRow!,saved=makeSavedWhatIf(row,context,'AI test');
    saved.snapshot!.output.whatIf.profitFactor=Infinity;
    const legacy:WhatIfRun={id:'legacy',createdAt:'2026-10-12T00:00:00Z',rule:{kind:'target',r:2},trades:5,actualNet:20,whatIfNet:30,saved:10};
    assert.equal(saveWhatIfs([saved,legacy]),true);
    const loaded=loadWhatIfs();assert.deepEqual(loaded,[saved,legacy]);assert.equal(loaded[0].snapshot!.output.whatIf.profitFactor,Infinity);
    assert.equal(savedWhatIfKey(loaded[0]),savedWhatIfKey(saved));
    const html=renderToStaticMarkup(React.createElement(SavedWhatIfRuns,{runs:loaded,tz:'UTC',onDelete:()=>{}}));
    assert.match(html,/AI test/);assert.match(html,/MarketSyde AI · EUR/);assert.match(html,/Legacy checklist/);assert.match(html,/currency not recorded/);
    assert.match(html,/Open AI test/);
    Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:()=>null,setItem:()=>{throw new Error('Storage full');}}});
    assert.equal(saveWhatIfs([saved]),false);
  }finally{if(descriptor)Object.defineProperty(globalThis,'localStorage',descriptor);else Reflect.deleteProperty(globalThis,'localStorage');}
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { JournalEntry } from '../../../types';
import { JournalInsights } from '../JournalInsights';
import { JOURNAL_MARKET_TYPES } from '../journalOverview';

const trade=(patch:Partial<JournalEntry>={}):JournalEntry=>({id:'isolated',date:'2026-10-01',symbol:'TEST',assetClass:'Stocks',direction:'BUY',entryPrice:10,exitPrice:12,size:1,pnl:20,rMultiple:null,outcome:'win',tradingStatus:'closed',commission:0,strategy:'Breakout',tags:[],setupNotes:'',emotionBefore:null,emotionAfter:null,followedPlan:null,checklistDone:[],mistakes:[],lessons:'',rating:null,source:'manual',accountCurrency:'USD',...patch});

function render(entries:JournalEntry[],saved:Record<string,unknown>={}) {
  const original=Object.getOwnPropertyDescriptor(globalThis,'localStorage');
  const read:string[]=[];
  Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:(key:string)=>{
    read.push(key);
    const name=key.replace(/^ms-journal-v2-/,'');
    return name in saved?JSON.stringify(saved[name]):null;
  }}});
  try {
    const html=renderToStaticMarkup(createElement(JournalInsights,{entries,brokers:[],overview:null,onDrill:()=>{},onToast:()=>{}}));
    return {html,text:html.replace(/<[^>]*>/g,''),read};
  } finally {
    if(original)Object.defineProperty(globalThis,'localStorage',original);
    else Reflect.deleteProperty(globalThis,'localStorage');
  }
}

test('Insights keeps all five journal market choices even in an empty cohort',()=>{
  assert.deepEqual(JOURNAL_MARKET_TYPES,['Forex','Crypto','Stocks','Commodity','Indices']);
  assert.ok(render([]).text.includes('Market type (5/5)'));
});
test('Retired report Broker filters neither render nor invisibly exclude trades',()=>{
  const result=render([trade({brokerId:'exness'}),trade({id:'b',brokerId:'hfm'})],{'JournalInsights-brokerOff':['exness','hfm']});
  assert.ok(result.text.includes('2 eligible closed trades'));
  assert.ok(!result.read.some(key=>key.endsWith('JournalInsights-brokerOff')));
  assert.doesNotMatch(result.text,/Broker \(\d+\/\d+\)/);
  assert.match(result.html,/role="tab"[^>]*>Broker</);
});
test('Insights uses the supplied shared cohort and preserves report market exclusions',()=>{
  const result=render([trade({assetClass:'Forex'}),trade({id:'b',assetClass:'Indices'})],{'JournalInsights-assetOff':['Indices']});
  assert.ok(result.text.includes('Market type (4/5)'));
  assert.ok(result.text.includes('1 eligible closed trades'));
});

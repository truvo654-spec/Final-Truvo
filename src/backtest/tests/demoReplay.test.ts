import test from 'node:test';
import assert from 'node:assert/strict';
import { compareDemo, createDemoFeed, demoProblem, demoSettings, demoTimeframe } from '../demoReplay';
import { DEFAULT_PLAYBOOKS } from '../../data/journalPlaybooks';
import { SYMBOLS } from '../marketData';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { DemoReplay } from '../../components/backtest/DemoReplay';
import { JournalEntry } from '../../types';

test('Demo paths are deterministic, chronological and OHLC valid across instruments and timeframes', () => {
  for (const spec of SYMBOLS) for (const tf of ['1m','5m','4h','1D'] as const) {
    const f=createDemoFeed(spec.symbol,tf,'test');
    assert.equal(f.bars.length,360);
    assert.deepEqual(f,createDemoFeed(spec.symbol,tf,'test'));
    for(let i=0;i<f.bars.length;i++) {
      const b=f.bars[i]; assert.ok([b.o,b.h,b.l,b.c,b.v,b.t].every(Number.isFinite));
      assert.ok(b.l>0 && b.h>=Math.max(b.o,b.c) && b.l<=Math.min(b.o,b.c));
      if(i)assert.ok(b.t>f.bars[i-1].t);
    }
  }
  assert.notDeepEqual(createDemoFeed('EUR/USD','5m','a').bars,createDemoFeed('EUR/USD','5m','b').bars);
  assert.throws(()=>createDemoFeed('UNKNOWN','5m','a'),/supported/);
});

test('Recorded strategy template and direction configure a separate USD sandbox', () => {
  const pb=DEFAULT_PLAYBOOKS.find(p=>p.name==='Scalping')!;
  const s=demoSettings(createDemoFeed('BTC/USDT','5m','jr_2:1'),pb,'SELL');
  assert.equal(s.playbookId,pb.id);assert.equal(s.rules.direction,'short');assert.equal(s.risk.currency,'USD');
  assert.equal(s.risk.startBalance,100000);assert.equal(s.risk.fixedR,1000);assert.equal(s.costs.fillModel,'nextOpen');
  assert.equal(s.rules.entry[0].left.kind,'ind'); assert.equal(demoTimeframe(pb),'5m');
});

test('Demo comparison reuses identical data, reconciles results and leaves input rules unchanged', () => {
  const f=createDemoFeed('BTC/USDT','5m','jr_2:1');
  const s=demoSettings(f,DEFAULT_PLAYBOOKS.find(p=>p.name==='Scalping')!,'SELL');
  s.session={id:'any',start:0,end:24};
  const before=JSON.stringify({f,s});
  const h={stopAtr:1,targetR:1.5,commission:0};
  const r=compareDemo(f,s,h);
  assert.ok(r.baseline.trades.length>0);
  assert.deepEqual(r.baseline.trades,r.variant.trades); // same stops and targets as scalp template
  for(const result of [r.baseline,r.variant]) {
    assert.ok(Math.abs(result.trades.reduce((sum,t)=>sum+t.net,0)-(result.endBalance-result.startBalance))<1e-7);
    assert.ok(result.trades.every(t=>t.entryTime>=f.bars[0].t && t.exitTime<=f.bars.at(-1)!.t));
  }
  assert.equal(JSON.stringify({f,s}),before);
  assert.deepEqual(compareDemo(f,s,h),r);
  const costs=compareDemo(f,s,{...h,commission:1});
  assert.ok(costs.variant.trades.some(t=>t.costs>0));
});

test('Invalid hypothesis numbers cannot run and a no-trade cohort has no invented average', () => {
  for(const h of [{stopAtr:0,targetR:2,commission:0},{stopAtr:1,targetR:NaN,commission:0},{stopAtr:1,targetR:2,commission:-1},{stopAtr:Infinity,targetR:2,commission:0}])assert.ok(demoProblem(h));
  const f=createDemoFeed('EUR/USD','5m','empty'),s=demoSettings(f,null,'BUY');
  s.rules.entry=[{id:'never',left:{kind:'price',field:'close'},op:'gt',right:{kind:'value',value:1e9}}];
  const r=compareDemo(f,s,{stopAtr:1,targetR:2,commission:0});
  assert.equal(r.variant.trades.length,0);assert.equal(r.variant.endBalance,r.variant.startBalance);assert.ok(r.variant.zeroTradeReason);
  assert.throws(()=>compareDemo(f,s,{stopAtr:0,targetR:2,commission:0}),/Stop distance/);
});

test('Replay labels the actual mirrored short template, demo source and accessible alternatives', () => {
  const e:JournalEntry={id:'short-demo',date:'2026-10-01',symbol:'BTC/USDT',assetClass:'Crypto',direction:'SELL',entryPrice:68420,exitPrice:66180,size:1,pnl:448,rMultiple:null,outcome:'win',strategy:'Scalping',tags:[],setupNotes:'',emotionBefore:null,emotionAfter:null,followedPlan:null,checklistDone:[],mistakes:[],lessons:'',rating:null,source:'manual'};
  const before=JSON.stringify(e);
  const html=renderToStaticMarkup(createElement(DemoReplay,{entries:[e],playbooks:DEFAULT_PLAYBOOKS,initialEntryId:e.id,initialMode:'strategy'}));
  assert.match(html,/the 9 EMA crosses below the 21 EMA/);assert.match(html,/Scalping · short · 5m/);
  assert.match(html,/not historical or live prices/);assert.match(html,/aria-label="Replay timeline"/);
  assert.match(html,/Visible simulated candles only/);assert.match(html,/Generated demo volume/);
  assert.match(html,/Test hypothesis · reveal full demo/);assert.doesNotMatch(html,/Demo comparison complete/);
  assert.equal(JSON.stringify(e),before);
  assert.equal((html.match(/<g><title>2026-/g)||[]).length,80); // only the revealed candle window
});

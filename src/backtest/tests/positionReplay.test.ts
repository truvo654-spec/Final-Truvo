import test from 'node:test';
import assert from 'node:assert/strict';
import { positionPath, parsePositionDraft, recordedPositionDraft, playbookPositionDraft, TestPosition, PositionDraft } from '../positionReplay';
import { createDemoFeed } from '../demoReplay';
import { DEFAULT_PLAYBOOKS } from '../../data/journalPlaybooks';
import type { JournalEntry } from '../../types';
import type { Bar } from '../types';

const bar=(index:number,o:number,h:number,l:number,c:number):Bar=>({t:Date.UTC(2026,8,1)+index*60000,o,h,l,c,v:100});
const prices=[bar(0,100,120,80,100),bar(1,100,104,99,103),bar(2,103,108,101,107),bar(3,107,110,106,109)];
const position:TestPosition={direction:'BUY',entry:100,quantity:2,unit:'contracts',multiplier:5,stop:null,target:null,costs:4,equity:1000};
const draft:PositionDraft={direction:'BUY',entry:'100',quantity:'2',unit:'contracts',multiplier:'5',stop:'',target:'',costs:'4',equity:''};

test('Open Buy and Sell positions reconcile price movement, costs and remaining size on the chart timeline',()=>{
  const buy=positionPath(prices,position,0,3),sell=positionPath(prices,{...position,direction:'SELL'},0,3);
  assert.equal(buy.status,'open');assert.equal(buy.points[0].openNet,-4);assert.equal(buy.points[2].openNet,66);
  assert.equal(buy.points[2].remaining,2);assert.equal(buy.points[2].realizedNet,0);assert.equal(sell.points[2].openNet,-74);
  assert.equal(positionPath(prices,position,0,prices.length).status,'open'); // chart end does not invent a close
});
test('Only bars after start can trigger intrabar exits; managed and keep-open P&L diverge after a target',()=>{
  const p={...position,stop:95,target:105};
  assert.equal(positionPath(prices,p,0,1).status,'open'); // start candle touched both before monitoring began
  const result=positionPath(prices,p,0,4);
  assert.deepEqual(result.exit,{index:2,price:105,reason:'Target'});
  assert.equal(result.points[3].managedNet,46);assert.equal(result.points[3].holdNet,86);
  assert.equal(result.points[3].remaining,0);assert.equal(result.points[3].openNet,0);assert.equal(result.points[3].realizedNet,46);
});
test('Stop-first ambiguity, adverse stop gaps and short targets have conservative explicit fills',()=>{
  const both=[prices[0],bar(1,100,106,94,101)];
  assert.deepEqual(positionPath(both,{...position,stop:95,target:105},0,2).exit,{index:1,price:95,reason:'Stop · both levels touched'});
  const gap=[prices[0],bar(1,90,92,88,91)];
  assert.equal(positionPath(gap,{...position,stop:95},0,2).exit!.price,90);
  const short=positionPath(gap,{...position,direction:'SELL',stop:105,target:95},0,2);
  assert.equal(short.exit!.price,95);assert.equal(short.points[1].realizedNet,46);
});
test('Manual close, rewind and revealed prefixes cannot leak future prices or future exits',()=>{
  const full=positionPath(prices,position,1,4,2);
  assert.equal(full.exit!.index,2);assert.equal(full.points.at(-1)!.managedNet,66);
  const rewind=positionPath(prices,position,1,2,2);assert.equal(rewind.status,'open');assert.equal(rewind.exit,null);
  assert.equal(positionPath(prices,position,1,1,2).status,'before');
  const changed=prices.map((b,i)=>i<2?b:{...b,o:999,h:1000,l:998,c:999});
  assert.deepEqual(positionPath(changed,position,1,2,2),rewind);
});
test('Valuation prerequisites and optional unknown equity remain distinct from zero',()=>{
  const parsed=parsePositionDraft(draft);assert.ok(parsed.position);assert.equal(parsed.position.equity,null);
  for(const patch of [{costs:''},{multiplier:''},{quantity:'0'},{unit:''},{stop:'110'},{target:'90'},{equity:'0'},{entry:'Infinity'}])assert.ok(parsePositionDraft({...draft,...patch}).error);
  assert.ok(parsePositionDraft({...draft,costs:'0'}).position);
});
test('Recorded trade copies preserve actual fields and do not guess CFD contract multipliers or currency conversion',()=>{
  const e={symbol:'US500',direction:'BUY',entryPrice:5640.9,size:0.5,quantityUnit:'lots',stopPrice:5600,takeProfit:5700,commission:2,equityAtEntry:10000,accountCurrency:'USD'} as JournalEntry;
  const before=JSON.stringify(e),copy=recordedPositionDraft(e);
  assert.equal(copy.entry,'5640.9');assert.equal(copy.quantity,'0.5');assert.equal(copy.multiplier,'');assert.equal(copy.costs,'2');
  assert.equal(recordedPositionDraft({...e,quantityUnit:undefined}).unit,'');
  const eur=recordedPositionDraft({...e,accountCurrency:'EUR'});assert.equal(eur.costs,'');assert.equal(eur.equity,'');
  assert.equal(recordedPositionDraft({...e,symbol:'EUR/USD'}).multiplier,'100000');assert.equal(JSON.stringify(e),before);
});
test('Playbook setups use template stops and targets, while missing saved scenario prices stay unknown',()=>{
  const feed=createDemoFeed('EUR/USD','15m','setup-test'),book=DEFAULT_PLAYBOOKS[0];
  const d=playbookPositionDraft(feed,book,80),p=parsePositionDraft(d).position!;
  assert.ok(p);assert.ok(Math.abs(p.target!-p.entry)/Math.abs(p.entry-p.stop!)>=4-1e-6);
  assert.ok(Math.abs(p.entry-p.stop!)*p.quantity*p.multiplier<=1000+1e-6);
  const changed={...feed,bars:feed.bars.map((b,i)=>i<80?b:{...b,c:999,l:998,h:1000,o:999})};
  assert.deepEqual(playbookPositionDraft(changed,book,80),d);
  const missing={...book,scenarios:[{...book.scenarios![0],entry:undefined}]};
  assert.equal(playbookPositionDraft(feed,missing,80,'BUY',missing.scenarios[0].id).entry,'');
  assert.doesNotThrow(()=>playbookPositionDraft(feed,{...book,riskPerTrade:20},80));
});

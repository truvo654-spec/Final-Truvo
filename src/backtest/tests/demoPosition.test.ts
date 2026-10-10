import test from 'node:test';
import assert from 'node:assert/strict';
import { createRun } from '../engine';
import { cond, defaultSettings, price, val } from '../rules';
import { seriesFromBars } from '../marketData';
import { createDemoFeed, demoSettings, configuredDemo, compareDemo } from '../demoReplay';
import { defaultPositionSetup, monitorDemo, planPosition, positionChecks, resolvePositionSetup, draftScenarioLevels } from '../demoPosition';
import { DEFAULT_PLAYBOOKS, PlaybookScenario } from '../../data/journalPlaybooks';
import type { Bar } from '../types';

const approx=(a:number,b:number)=>assert.ok(Math.abs(a-b)<1e-6,`${a} != ${b}`);
const t0=Date.UTC(2026,0,5,8);
const fixture=()=>{
  const s=defaultSettings();s.symbol='EUR/USD';s.timeframe='5m';s.session={id:'any',start:0,end:24};
  s.rules={direction:'long',entry:[cond(price(),'crossAbove',val(1.1))],entryOrder:{type:'market'},exits:{stop:{type:'points',value:20},targetR:3,breakevenAtR:null,breakevenLockR:0,trailing:null,partial:{atR:1,fraction:0.5},timeExitBars:null,sessionEndExit:false},maxTradesPerDay:null};
  s.risk={...s.risk,mode:'fixedQty',qty:1,startBalance:10000,dailyLossPct:null,maxDrawdownPct:null};
  s.costs={enabled:true,brokerId:null,commissionPerSide:2,spread:0,slippage:0,fillModel:'nextOpen'};
  const prices=[...Array.from({length:20},()=>[1.095,1.0955,1.0945,1.095]),[1.095,1.1012,1.0948,1.101],[1.101,1.1032,1.1005,1.1025],[1.1025,1.104,1.102,1.103],[1.103,1.109,1.102,1.108]];
  const bars:Bar[]=prices.map(([o,h,l,c],i)=>({t:t0+i*300000,o,h,l,c,v:100}));
  return {s,bars,series:seriesFromBars('EUR/USD','5m',bars)};
};

test('Position snapshot separates remaining size, partial net and net close estimate without forcing an exit',()=>{
  const {s,series}=fixture();const run=createRun(s,series,{isNewsDay:()=>false});
  run.step(22);const snap=run.snapshot(),p=snap.position!;
  assert.ok(p);assert.equal(p.size,1);assert.equal(p.remaining,0.5);assert.equal(snap.trades.length,0);assert.equal(snap.closedNet,0);
  approx(p.initialRisk,200);approx(p.remainingRisk,100);approx(p.realizedPartialNet,98);approx(p.unrealizedNet,73);
  assert.equal(p.equityAtEntry,10000);assert.equal(snap.finished,false);
  const repeat=run.snapshot();assert.deepEqual(repeat,snap);repeat.position!.remaining=999;assert.equal(run.snapshot().position!.remaining,0.5);
  run.step(100);const end=run.snapshot();assert.equal(end.position,null);assert.equal(end.trades.length,1);approx(end.closedNet,end.trades[0].net);
  approx(end.closedNet,396);end.trades[0].net=999;approx(run.snapshot().trades[0].net,396);
});

test('Snapshot never reads a future bar, even when risk limits halt a run early',()=>{
  const {s,series}=fixture();s.risk.dailyLossPct=0.1; s.risk.maxDrawdownPct=0.001;
  series.l[22]=1.098;series.c[22]=1.099;
  const run=createRun(s,series,{isNewsDay:()=>false});run.step(1);
  assert.equal(run.snapshot().processed,1);assert.equal(run.snapshot().position,null);
  assert.doesNotThrow(()=>{run.step(1000);run.snapshot();});assert.equal(run.snapshot().processed,23);assert.equal(run.snapshot().finished,true);
});

test('Sizing validates units, increments, currencies and missing prerequisites',()=>{
  const pb=DEFAULT_PLAYBOOKS[0],p=defaultPositionSetup(pb);
  assert.equal(resolvePositionSetup({...p,mode:'quantity',quantity:'1.5'},pb,'MNQ').config,null);
  assert.ok(resolvePositionSetup({...p,mode:'quantity',quantity:'2'},pb,'MNQ').config);
  for(const equity of ['','0','-1','Infinity'])assert.ok(resolvePositionSetup({...p,equity},pb,'EUR/USD').error);
  assert.ok(resolvePositionSetup({...p,scenarioKey:'custom'},pb,'EUR/USD').error);
  assert.ok(resolvePositionSetup({...p,scenarioKey:'custom',entry:'1.1',stop:'1.12',target:'1.13'},pb,'EUR/USD').error);
  assert.ok(resolvePositionSetup({...p,scenarioKey:'custom',entry:'1.1',stop:'1.09',target:'1.12'},pb,'EUR/USD').config);
});

test('Scenario copies are independent and scenario levels use the exact stop/target rather than guessed ATR levels',()=>{
  const pb=DEFAULT_PLAYBOOKS[0],before=JSON.stringify(pb);
  const sc=pb.scenarios![0],p={...defaultPositionSetup(pb),scenarioKey:sc.id};
  const resolved=resolvePositionSetup(p,pb,'MNQ');assert.ok(resolved.config);assert.ok(resolvePositionSetup(p,pb,'EUR/USD').error);
  assert.equal(resolved.config!.scenario!.entry,sc.entry);assert.equal(JSON.stringify(pb),before);
  const {s,series}=fixture();const run=createRun(s,series,{isNewsDay:()=>false,positionLevels:{stop:1.098,target:1.11}});
  run.step(22);const position=run.snapshot().position!;approx(position.initialStop,1.098);approx(position.target!,1.11);
  const configured=configuredDemo(s,{stopAtr:1.5,targetR:2,commission:0},{risk:{equity:10000,mode:'quantity',percent:1,quantity:1},scenario:{symbol:'EUR/USD',bias:'short',entry:1.1,stop:1.11,target:1.08}});
  assert.equal(configured.variant.rules.direction,'short');assert.deepEqual(configured.options.positionLevels,{stop:1.11,target:1.08});
});

test('Timeline rewind is deterministic and monitoring cannot use bars after the cursor',()=>{
  const f=createDemoFeed('EUR/USD','15m','position'),pb=DEFAULT_PLAYBOOKS[0],baseline=demoSettings(f,pb,'BUY');
  const cfg=resolvePositionSetup(defaultPositionSetup(pb),pb,f.symbol).config!,h={stopAtr:1.5,targetR:2,commission:0};
  const a=monitorDemo(f,baseline,h,cfg,80);monitorDemo(f,baseline,h,cfg,200);
  assert.deepEqual(monitorDemo(f,baseline,h,cfg,80),a);
  const changed={...f,bars:f.bars.map((b,i)=>i<80?b:{...b,o:9,h:10,l:8,c:9})};
  assert.deepEqual(monitorDemo(changed,baseline,h,cfg,80),a);
  const plan=planPosition(f,cfg,h,a,80,'BUY')!;assert.ok(plan);assert.ok(plan.riskPercent<=1+1e-8);
});

test('Checks mark oversized risk, expired scenarios and unsupported symbols as mismatches, and written rules as unknown',()=>{
  const pb=DEFAULT_PLAYBOOKS[0],feed=createDemoFeed('EUR/USD','15m','checks');
  const sc:PlaybookScenario={id:'x',symbol:'EUR/USD',bias:'long',entry:1.1,stop:1.09,target:1.12,hypothesis:'test',trigger:'written',createdAt:'2026-10-01',validUntil:'2026-10-07',status:'watching'};
  const plan={entry:1.1,stop:1.09,target:1.12,quantity:1,risk:2000,riskPercent:2,rr:2,fees:0,direction:'BUY' as const};
  const rows=positionChecks({book:pb,feed,plan,snapshot:null,scenario:sc,scenarioKey:'x',asOf:'2026-10-09'});
  assert.equal(rows.find(c=>c.label==='Risk per trade')!.state,'Mismatch');
  assert.equal(rows.find(c=>c.label==='Scenario validity')!.state,'Mismatch');
  assert.equal(rows.find(c=>c.label==='Written scenario trigger')!.state,'Unknown');
  assert.equal(rows.find(c=>c.label==='Written playbook rules')!.state,'Unknown');
  const missing=positionChecks({book:{...pb,riskPerTrade:undefined},feed,plan:null,snapshot:null,scenario:null,scenarioKey:'custom',asOf:'2026-10-09'});
  assert.equal(missing.find(c=>c.label==='Risk per trade')!.state,'Unknown');assert.equal(missing.find(c=>c.label==='Scenario price levels')!.state,'Unknown');
  const unknownDate=positionChecks({book:pb,feed,plan,snapshot:null,scenario:{...sc,validUntil:'2026-02-30'},scenarioKey:'x',asOf:'2026-10-09'});
  assert.equal(unknownDate.find(c=>c.label==='Scenario validity')!.state,'Unknown');
});

test('Generated scenario levels respect tick increments without rounding below the requested R',()=>{
  const feed=createDemoFeed('MNQ','15m','rounding'),h={stopAtr:1.5,targetR:2,commission:0};
  for(const bias of ['long','short'] as const) {
    const levels=draftScenarioLevels(feed,80,bias,38.2734375,h)!;
    const entry=Number(levels.entry),stop=Number(levels.stop),target=Number(levels.target);
    for(const price of [entry,stop,target])approx(price/0.25,Math.round(price/0.25));
    assert.ok(Math.abs(target-entry)/Math.abs(entry-stop)>=2-1e-8);
    assert.ok(resolvePositionSetup({...defaultPositionSetup(null),scenarioKey:'custom',bias,...levels},null,feed.symbol).config);
  }
  assert.equal(draftScenarioLevels(feed,1,'long',NaN,h),null);
});

test('Final timeline monitor reconciles exactly with the hypothesis comparison using the same sizing and scenario',()=>{
  const feed=createDemoFeed('EUR/USD','15m','reconcile'),pb=DEFAULT_PLAYBOOKS[1],s=demoSettings(feed,pb,'BUY');
  const h={stopAtr:1.5,targetR:2,commission:2};
  const levels=draftScenarioLevels(feed,80,'long',0.001,h)!;
  const cfg=resolvePositionSetup({...defaultPositionSetup(pb),scenarioKey:'custom',...levels},pb,feed.symbol).config!;
  const end=monitorDemo(feed,s,h,cfg,feed.bars.length),comparison=compareDemo(feed,s,h,cfg);
  assert.equal(end.position,null);assert.equal(end.finished,true);
  approx(end.balance,comparison.variant.endBalance);
  approx(end.closedNet,comparison.variant.endBalance-comparison.variant.startBalance);
  assert.deepEqual(end.trades,comparison.variant.trades);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {compareDemoStudy,demoClosedEquity} from '../demoReplayStudy';
import {compareDemo,createDemoFeed,demoSettings} from '../demoReplay';
import {DEFAULT_PLAYBOOKS} from '../../data/journalPlaybooks';
import {recommendSetup} from '../recommender';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {DemoStudyResults} from '../../components/backtest/DemoStudyResults';
import {TF_MS} from '../types';

const feed=createDemoFeed('BTC/USDT','5m','jr_2:1');
const settings=demoSettings(feed,DEFAULT_PLAYBOOKS.find(p=>p.name==='Scalping')!,'SELL');
settings.session={id:'any',start:0,end:24};
const hypothesis={stopAtr:1.5,targetR:2,commission:.01};
const config={risk:{equity:100000,mode:'risk' as const,percent:1,quantity:1},scenario:null};
test('demo study evaluates nine bounded exits with identical feed, sizing and costs, preserving the user setup',()=>{
  const before=JSON.stringify({feed,settings,hypothesis,config}),study=compareDemoStudy(feed,settings,hypothesis,config);
  assert.equal(study.candidates.length,9);assert.equal(study.trainingBars,251);assert.equal(study.holdoutBars,109);
  assert.deepEqual(study.variant,compareDemo(feed,settings,hypothesis,config).variant);
  for(const c of study.candidates){
    assert.deepEqual(c.output,compareDemo(feed,settings,c.setup,config).variant);
    assert.equal(c.output.startBalance,config.risk.equity);assert.equal(c.setup.commission,hypothesis.commission);
    assert.equal(c.validation.baseline.netPnl,study.candidates[0].validation.baseline.netPnl);
  }
  assert.equal(JSON.stringify({feed,settings,hypothesis,config}),before);
});
test('changing holdout candles cannot change training ranking or selected exit setup',()=>{
  const original=compareDemoStudy(feed,settings,hypothesis,config),split=original.trainingBars;
  const changedFeed={...feed,bars:feed.bars.map((b,i)=>i<split?b:{...b,o:b.o*1.3,h:b.h*1.3,l:b.l*1.3,c:b.c*1.3})};
  const changed=compareDemoStudy(changedFeed,settings,hypothesis,config);
  assert.deepEqual(changed.baselineMetrics,original.baselineMetrics);
  assert.deepEqual(changed.candidates.map(c=>c.metrics),original.candidates.map(c=>c.metrics));
  for(const goal of ['net','win','drawdown'] as const)assert.equal(recommendSetup(changed.candidates,changed.baselineMetrics,goal).candidate?.id,recommendSetup(original.candidates,original.baselineMetrics,goal).candidate?.id);
});
test('absolute scenario exits disable unrelated ATR exploration instead of showing invented candidates',()=>{
  const result=compareDemoStudy(feed,settings,hypothesis,{...config,scenario:{symbol:feed.symbol,bias:'long',entry:68000,stop:67000,target:70000}});
  assert.equal(result.candidates.length,0);assert.equal(recommendSetup(result.candidates,result.baselineMetrics,'net').candidate,null);
});
test('candle equity includes final close-time exits and never exposes a later intrabar exit on rewind',()=>{
  const result=compareDemo(feed,settings,hypothesis,config).variant,trade=result.trades[0],bars=feed.bars.slice(0,3);
  const example={...result,trades:[{...trade,exitTime:bars[1].t,exitReason:'stop' as const,net:-100},{...trade,exitTime:bars[2].t+TF_MS[feed.tf],exitReason:'end of test' as const,net:250}]};
  assert.deepEqual(demoClosedEquity({...feed,bars},example,1).map(p=>p.y),[0]);
  assert.deepEqual(demoClosedEquity({...feed,bars},example,3).map(p=>p.y),[0,-100,150]);
});
test('demo results show gain/loss and risk comparison with observed winners rather than a brand preference',()=>{
  const study=compareDemoStudy(feed,settings,hypothesis,config),markup=renderToStaticMarkup(createElement(DemoStudyResults,{runs:[{name:'User',color:'#0284c7',run:study.variant},{name:'AI',color:'#5338ec',run:study.variant}]}));
  assert.match(markup,/Gross gains/);assert.match(markup,/Gross losses/);assert.match(markup,/Max closed-equity drawdown/);assert.match(markup,/Demo gross gains, losses and drawdown comparison/);
  assert.doesNotMatch(markup,/>Best</);assert.match(markup,/Equal values and trade counts stay neutral/);
});

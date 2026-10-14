import { test } from 'node:test';
import assert from 'node:assert/strict';
import { comparableSetups, recommendSetup, type RecommendationCandidate } from '../recommender';
import { defaultSettings } from '../rules';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MarketSydeRecommender } from '../../components/backtest/MarketSydeRecommender';

const base = {netPnl:100,maxDD:20,winRate:0.5,trades:20};
const candidate = (id:string,netPnl=120,maxDD=20,winRate=0.5,trades=20):RecommendationCandidate => ({id,name:id,metrics:{netPnl,maxDD,winRate,trades}});
test('selection rejects higher profits with excessive drawdown, low coverage or invalid evidence',()=>{
  const r=recommendSetup([candidate('overfit',1000,100),candidate('one trade',500,1,1,1),candidate('invalid',NaN),candidate('useful',120,22)],base,'net');
  assert.equal(r.candidate?.id,'useful'); assert.equal(r.status,'candidate');
  assert.equal(recommendSetup([candidate('bad',200,100)],base,'net').status,'keep');
});
test('goals preserve net results for drawdown and win-rate recommendations',()=>{
  const candidates=[candidate('net',150,20,0.5),candidate('risk',100,10,0.5),candidate('win',100,20,0.8),candidate('deceptive',80,1,1)];
  assert.equal(recommendSetup(candidates,base,'net').candidate?.id,'net');
  assert.equal(recommendSetup(candidates,base,'drawdown').candidate?.id,'risk');
  assert.equal(recommendSetup(candidates,base,'win').candidate?.id,'win');
});
test('holdout results never influence selection and negative holdout evidence is retained',()=>{
  const stronger=candidate('training best',130), weaker=candidate('holdout best',120);
  stronger.validation={baseline:base,candidate:{...base,netPnl:-50}};
  weaker.validation={baseline:base,candidate:{...base,netPnl:1000}};
  const r=recommendSetup([weaker,stronger],base,'net');
  assert.equal(r.candidate?.id,'training best'); assert.equal(r.candidate?.validation?.candidate.netPnl,-50);
});
test('small samples are exploratory, one trade is insufficient, ties keep benchmark',()=>{
  assert.equal(recommendSetup([candidate('small',120,20,0.5,6)],{...base,trades:8},'net').status,'exploratory');
  assert.equal(recommendSetup([candidate('tiny')],{...base,trades:1},'net').status,'insufficient');
  assert.equal(recommendSetup([candidate('same',100)],base,'net').status,'keep');
});
test('comparability allows intentional strategy changes but rejects unmatched account and test conditions',()=>{
  const a=defaultSettings({}), b=structuredClone(a);
  b.rules.exits.targetR=3; b.timeframe='1h'; b.session={id:'london',start:7,end:16};
  b.risk=Object.fromEntries(Object.entries(b.risk).reverse()) as typeof b.risk;
  assert.equal(comparableSetups([a,b]),true);
  b.risk.currency='EUR'; assert.equal(comparableSetups([a,b]),false);
  b.risk.currency=a.risk.currency; b.from='2024-01-01'; assert.equal(comparableSetups([a,b]),false);
  assert.equal(recommendSetup([candidate('winner',200)],base,'net',false).status,'incomparable');
});
test('recommendation card displays failed holdout and transparent local method beside the action',()=>{
  const c=candidate('candidate',150); c.validation={baseline:base,candidate:{...base,netPnl:50}};
  const recommendation=recommendSetup([c],base,'net');
  const html=renderToStaticMarkup(React.createElement(MarketSydeRecommender,{recommendation,baseline:base,baselineName:'Actual history',goal:'net',onGoal:()=>{},money:n=>`${n} USD`,evidence:'Training only.',onUse:()=>{}}));
  assert.match(html,/Improvement not confirmed on this holdout/); assert.match(html,/-50 USD/);
  assert.match(html,/Local statistical recommender/); assert.match(html,/Try this setup/);
});

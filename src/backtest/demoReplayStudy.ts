import {compareDemo,type DemoFeed,type DemoHypothesis,type DemoConfiguration} from './demoReplay';
import type {BacktestSettings,RunResult} from './types';
import {TF_MS} from './types';
import {runRecommendationCandidate} from './recommender';

/** Close-time exits belong to the candle just revealed; intrabar exits belong to their own candle. */
export function demoClosedEquity(feed:DemoFeed,result:RunResult,cursor:number){
  const closes=new Set(['time','session end','signal','rule limit','end of test']);
  return feed.bars.slice(0,cursor).map(b=>({x:b.t,y:result.trades.filter(t=>t.exitTime-(closes.has(t.exitReason)?TF_MS[feed.tf]:0)<=b.t).reduce((n,t)=>n+t.net,0)}));
}

/** Bounded exit exploration. Training selection and a fresh holdout run share identical sizing/costs. */
export function compareDemoStudy(feed:DemoFeed,baseline:BacktestSettings,hypothesis:DemoHypothesis,config:DemoConfiguration){
  const full=compareDemo(feed,baseline,hypothesis,config);
  const split=Math.floor(feed.bars.length*0.7),train={...feed,bars:feed.bars.slice(0,split)},holdout={...feed,bars:feed.bars.slice(split)};
  const training=compareDemo(train,baseline,hypothesis,config),validation=compareDemo(holdout,baseline,hypothesis,config);
  const baselineMetrics=runRecommendationCandidate('user','Your hypothesis',training.variant).metrics;
  const holdoutBaseline=runRecommendationCandidate('user','Your hypothesis',validation.variant).metrics;
  const candidates=config.scenario?[]:[0.75,1.5,2.25].flatMap(stopAtr=>[1,2,3].map(targetR=>{
    const setup={...hypothesis,stopAtr,targetR},id=`${stopAtr}:${targetR}`,name=`Stop ${stopAtr} ATR · target ${targetR}R`;
    const output=compareDemo(feed,baseline,setup,config).variant;
    const trainResult=compareDemo(train,baseline,setup,config).variant,holdoutResult=compareDemo(holdout,baseline,setup,config).variant;
    return {id,name,setup,output,metrics:runRecommendationCandidate(id,name,trainResult).metrics,
      validation:{baseline:holdoutBaseline,candidate:runRecommendationCandidate(id,name,holdoutResult).metrics}};
  }));
  return {...full,candidates,baselineMetrics,trainingBars:split,holdoutBars:feed.bars.length-split};
}

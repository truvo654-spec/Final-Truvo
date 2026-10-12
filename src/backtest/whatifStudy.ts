import type { JournalEntry } from '../types';
import type { WhatIfOutput, WhatIfRule, WhatIfTrade } from './whatif';
import { describeWhatIf } from './whatif';
import { compareParameters, parameterRules, splitWhatIfHistory } from './whatifOptimizer';
import { recommendSetup, type RecommendationGoal } from './recommender';

export const whatIfBounds = (rule: WhatIfRule): [number,number,number] => rule.kind === 'stop' ? [0.5,1,0.25] : rule.kind === 'dailyLoss' ? [100,500,100] : rule.kind === 'hours' ? [2,10,2] : rule.kind === 'lossesPerDay' ? [1,4,1] : [0.5,3,0.5];

/** Bounded AI exploration, with data-derived tags and monetary limits learned from training only. */
export function aiWhatIfRules(entries: JournalEntry[]): WhatIfRule[] {
  const {train} = splitWhatIfHistory(entries);
  const tags = new Map<string,number>();
  train.forEach(e=>new Set([...e.mistakes,...e.tags]).forEach(tag=>tags.set(tag,(tags.get(tag)||0)+1)));
  const risk = train.map(e=>e.initialRisk).filter((r):r is number=>Number.isFinite(r)&&r!>0).sort((a,b)=>a-b);
  const median = risk.length ? risk[Math.floor(risk.length/2)] : null;
  return [
    ...[1,2,3].map(n=>({kind:'lossesPerDay' as const,n})),
    ...[1,2,3,4].map(r=>({kind:'target' as const,r})),
    ...[0.5,1,1.5].map(r=>({kind:'breakeven' as const,r})),
    ...[0.5,0.75].map(mult=>({kind:'stop' as const,mult})),
    {kind:'hours',start:7,end:16},{kind:'hours',start:12,end:21},{kind:'hours',start:0,end:7},
    ...[...tags].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0])).slice(0,4).map(([tag])=>({kind:'mistakes' as const,tags:[tag]})),
    ...(median ? [1,2].map(scale=>({kind:'dailyLoss' as const,usd:Math.round(median*scale*100)/100})) : []),
  ];
}

export function buildWhatIfStudy(entries:JournalEntry[],rule:WhatIfRule,bounds:[number,number,number],goal:RecommendationGoal) {
  let rangeRules:WhatIfRule[]=[rule], error='';
  try {rangeRules=parameterRules(rule,...bounds);} catch(e){error=e instanceof Error?e.message:'Unable to compare these parameters.';}
  const rangeIds=new Set(rangeRules.map(r=>JSON.stringify(r)));
  const rules=[...rangeRules,...aiWhatIfRules(entries)].filter((r,i,all)=>all.findIndex(x=>JSON.stringify(x)===JSON.stringify(r))===i);
  const allRows=compareParameters(entries,rules);
  const baseline=allRows[0].training.actual;
  const recommendation=recommendSetup(allRows.map(row=>({id:row.id,name:describeWhatIf(row.rule),metrics:row.training.whatIf,estimated:row.output.estimated,
    validation:row.validation?{baseline:row.validation.actual,candidate:row.validation.whatIf}:null})),baseline,goal);
  const aiRow=allRows.find(row=>row.id===recommendation.candidate?.id)??null;
  // Include an AI rule from outside the user's sweep so the two setups stay inspectable.
  const rows=allRows.filter(row=>rangeIds.has(row.id)||row.id===aiRow?.id);
  return {rows,aiRow,baseline,recommendation,error,tested:allRows.length};
}

/** Match by stable trade identity and include trades changed by either scenario. */
export function compareWhatIfLedgers(user:WhatIfOutput,ai:WhatIfOutput|null): {user:WhatIfTrade;ai:WhatIfTrade|undefined}[] {
  const aiTrades=new Map(ai?.trades.map(t=>[t.id,t])??[]);
  return user.trades.map(trade=>({user:trade,ai:aiTrades.get(trade.id)})).filter(row=>row.user.status!=='same'||(row.ai&&row.ai.status!=='same'));
}

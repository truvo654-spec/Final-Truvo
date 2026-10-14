import { useMemo, useState } from 'react';
import type { JournalEntry } from '../../types';
import type { WhatIfRule } from '../../backtest/whatif';
import type { RecommendationGoal } from '../../backtest/recommender';
import { buildWhatIfStudy, whatIfBounds } from '../../backtest/whatifStudy';

export function useWhatIfStudy(entries:JournalEntry[],rule:WhatIfRule) {
  const [range,setRange]=useState({kind:rule.kind,bounds:whatIfBounds(rule)});
  const [goal,setGoal]=useState<RecommendationGoal>('net');
  const bounds=range.kind===rule.kind?range.bounds:whatIfBounds(rule);
  const setBounds=(next:((previous:number[])=>number[])|number[])=>setRange({kind:rule.kind,bounds:(typeof next==='function'?next(bounds):next) as [number,number,number]});
  const study=useMemo(()=>buildWhatIfStudy(entries,rule,bounds,goal),[entries,JSON.stringify(rule),JSON.stringify(bounds),goal]);
  return {...study,bounds,setBounds,goal,setGoal};
}
export type WhatIfStudyModel=ReturnType<typeof useWhatIfStudy>;

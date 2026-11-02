import { useMemo, useState } from 'react';
import type { JournalEntry } from '../../types';
import type {WhatIfDemoData} from '../../backtest/whatifDemoData';
import type { WhatIfRule } from '../../backtest/whatif';
import type { RecommendationGoal } from '../../backtest/recommender';
import { buildWhatIfStudy, whatIfBounds } from '../../backtest/whatifStudy';

export function useWhatIfStudy(entries:JournalEntry[],rule:WhatIfRule,viewIds?:readonly string[],priceData?:WhatIfDemoData) {
  const [range,setRange]=useState({kind:rule.kind,bounds:whatIfBounds(rule)});
  const [goal,setGoal]=useState<RecommendationGoal>('net');
  const bounds=range.kind===rule.kind?range.bounds:whatIfBounds(rule);
  const setBounds=(next:((previous:number[])=>number[])|number[])=>setRange({kind:rule.kind,bounds:(typeof next==='function'?next(bounds):next) as [number,number,number]});
  const study=useMemo(()=>buildWhatIfStudy(entries,rule,bounds,goal,viewIds,priceData),[entries,JSON.stringify(rule),JSON.stringify(bounds),goal,JSON.stringify(viewIds),priceData]);
  const [pinned,setPinned]=useState<string[]>([]);
  const rows=[...study.rows,...study.allRows.filter(row=>pinned.includes(row.id)&&!study.rows.some(r=>r.id===row.id))];
  const pin=(id:string)=>setPinned(list=>list.includes(id)?list:[...list,id]);
  return {...study,rows,pin,bounds,setBounds,goal,setGoal};
}
export type WhatIfStudyModel=ReturnType<typeof useWhatIfStudy>;

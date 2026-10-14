import React,{useMemo,useState} from 'react';
import type {JournalEntry} from '../../types';
import type {WhatIfRule} from '../../backtest/whatif';
import {replayJournalAdvice} from '../../backtest/replaySetups';
import type {RecommendationGoal} from '../../backtest/recommender';
import {MarketSydeRecommender} from './MarketSydeRecommender';
import {money} from '../../backtest/format';

export function ReplayAICoach({entries,symbol,cutoff=Infinity,excludeId='',playbook='',onUse,action='Apply AI suggestion to draft',breakeven=true}:{entries:JournalEntry[];symbol:string;cutoff?:number;excludeId?:string;playbook?:string;onUse?:(rule:WhatIfRule)=>void;action?:string;breakeven?:boolean}){
  const [goal,setGoal]=useState<RecommendationGoal>('net');
  const advice=useMemo(()=>replayJournalAdvice(entries,symbol,goal,cutoff,excludeId,playbook,breakeven),[entries,symbol,goal,cutoff,excludeId,playbook,breakeven]);
  return <MarketSydeRecommender recommendation={advice.recommendation} baseline={advice.baseline} baselineName="prior closed USD journal trades for this instrument" goal={goal} onGoal={setGoal} money={money}
    evidence={`${advice.history.length} eligible trades${playbook?' for the selected playbook':''}. The selected replay trade is excluded. ${Number.isFinite(cutoff)?'Only trades closed before the replay starts are included. ':''}First 70% of entry days select; remaining days validate. Price-dependent results are reconstructed estimates. Suggestions do not inspect unrevealed replay candles or demonstrate demo/live performance.`}
    action={action} onUse={onUse?(id)=>{const row=advice.rows.find(r=>r.id===id);if(row)onUse(row.rule);}:undefined}/>;
}

import type {WhatIfEntry,WhatIfOutput} from './whatif';
import {summarizeWhatIfOutput} from './whatif';
import {whatIfMarket} from './whatifQuick';
import type {WhatIfStudyRow} from './savedWhatIf';

export interface WhatIfResultGroup {id:string;label:string;market:string;from:string;to:string;tradeIds:string[]}
export interface WhatIfBreakdown extends WhatIfResultGroup {output:WhatIfOutput}
const group=(id:string,label:string,market:string,entries:WhatIfEntry[]):WhatIfResultGroup=>{
 const dates=entries.map(e=>e.date).sort();
 return {id,label,market,from:dates[0]??'',to:dates.at(-1)??'',tradeIds:entries.map(e=>e.id)};
};
/** Only combinations present in the chosen evidence become results. No cross-product tests. */
export function whatIfResultGroups(entries:WhatIfEntry[]):WhatIfResultGroup[]{
 const buckets=new Map<string,WhatIfEntry[]>();
 for(const e of entries){const key=JSON.stringify([whatIfMarket(e),e.strategy||'Unassigned',e.symbol]);buckets.set(key,[...(buckets.get(key)??[]),e]);}
 return [group('all','All selected trades','',entries),...[...buckets].map(([key,list])=>group(key,(list[0].strategy||'Unassigned')+' · '+list[0].symbol,whatIfMarket(list[0]),list)).sort((a,b)=>a.market.localeCompare(b.market)||a.label.localeCompare(b.label))];
}
/** Projection keeps global skip/change decisions, then recalculates metrics for this exact ledger. */
export function projectWhatIfOutput(output:WhatIfOutput,entries:WhatIfEntry[],ids:readonly string[]):WhatIfOutput{
 const wanted=new Set(ids),trades=output.trades.filter(t=>wanted.has(t.id));
 const present=new Set(trades.map(t=>t.id));
 return summarizeWhatIfOutput(entries.filter(e=>present.has(e.id)),trades,output.estimated);
}
export function projectWhatIfRow(row:WhatIfStudyRow,entries:WhatIfEntry[],ids:readonly string[]):WhatIfStudyRow{
 const output=projectWhatIfOutput(row.output,entries,ids),training=projectWhatIfOutput(row.training,entries,ids),validation=row.validation?projectWhatIfOutput(row.validation,entries,ids):null;
 return {...row,output,training,validation,trainingCount:training.trades.length,validationCount:validation?.trades.length??0,crossingCount:output.trades.length-training.trades.length-(validation?.trades.length??0)};
}
export function whatIfBreakdowns(output:WhatIfOutput,entries:WhatIfEntry[]):WhatIfBreakdown[]{
 return whatIfResultGroups(entries).slice(1).map(g=>({...g,output:projectWhatIfOutput(output,entries,g.tradeIds)}));
}

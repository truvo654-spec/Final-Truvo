import type {WhatIfRun,WhatIfSnapshot} from './store';
import type {buildWhatIfStudy} from './whatifStudy';

export type WhatIfStudyRow=ReturnType<typeof buildWhatIfStudy>['rows'][number];
export type WhatIfSaveContext=Omit<WhatIfSnapshot,'version'|'output'|'training'|'validation'|'crossingCount'>;

/** A save is evidence from this exact test, never a recipe that reruns on newer history. */
export function makeSavedWhatIf(row:WhatIfStudyRow,context:WhatIfSaveContext,name:string):WhatIfRun {
  return structuredClone({id:`wi_${crypto.randomUUID()}`,createdAt:new Date().toISOString(),name,rule:row.rule,
    trades:row.output.trades.length,actualNet:row.output.actual.netPnl,whatIfNet:row.output.whatIf.netPnl,saved:row.output.saved,
    snapshot:{...context,version:1 as const,output:row.output,training:row.training,validation:row.validation,crossingCount:row.crossingCount}});
}

/** Include the cohort/results, not just the rule, when detecting an already saved test. */
export function whatIfSaveKey(rule:WhatIfRun['rule'],context:WhatIfSaveContext,output:WhatIfSnapshot['output']):string {
  const {currency,source,benchmark,goal,scope}=context;
  return JSON.stringify({rule,context:{currency,source,benchmark,goal,scope:Object.fromEntries(Object.entries(scope).sort(([a],[b])=>a.localeCompare(b)))},output});
}
export function savedWhatIfKey(run:WhatIfRun):string|null {
  const s=run.snapshot;
  return s?whatIfSaveKey(run.rule,{currency:s.currency,source:s.source,benchmark:s.benchmark,scope:s.scope,goal:s.goal},s.output):null;
}

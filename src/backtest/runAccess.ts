import type {BacktestSettings} from './types';
import type {BacktestRun,Usage} from './store';
import {BACKTEST_ENGINE_VERSION} from './config';

export const availableRuns=(usage:Usage,limit:number)=>Math.max(0,limit-usage.used)+usage.prepaid;

/** Persist the entitlement before charging. Existing paid runs must never be bought twice. */
export function purchaseRunAllowance(limit:number,ports:{load:()=>Usage;save:(usage:Usage)=>boolean;spend:()=>boolean}) {
 const usage=ports.load();
 if(availableRuns(usage,limit)>0)return {ok:true as const,usage,charged:false};
 const next={...usage,extraPaid:usage.extraPaid+1,prepaid:usage.prepaid+1};
 if(!ports.save(next))return {ok:false as const,error:'Unable to save the extra run. No credits were spent.'};
 let spent=false;
 try{spent=ports.spend();}catch{}
 if(!spent){ports.save(usage);return {ok:false as const,error:'No extra run was purchased. Check your credit balance and try again.'};}
 return {ok:true as const,usage:next,charged:true};
}

/** A failed, empty or unsaved result leaves its included/paid run available for retry. */
export function completedRunUsage(usage:Usage,limit:number,saved:boolean,trades:number):Usage {
 if(!saved||trades<=0)return usage;
 return usage.used<limit?{...usage,used:usage.used+1}:{...usage,prepaid:Math.max(0,usage.prepaid-1)};
}

export function runSettingsKey(settings:BacktestSettings) {
 const value={...settings,rules:{...settings.rules,entry:settings.rules.entry.map(({id,...condition})=>condition)}};
 return JSON.stringify(value,(_key,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.entries(v).sort(([a],[b])=>a.localeCompare(b))):v);
}

/** Generated prices are deterministic. Opening the same complete result is free. */
export function reusableRuns(settings:BacktestSettings[],runs:BacktestRun[],sourceTradeIds?:string[]):BacktestRun[]|null {
 if(!settings.length)return null;
 const benchmark=sourceTradeIds?JSON.stringify([...sourceTradeIds].sort()):null;
 const matched=settings.map(s=>runs.find(run=>run.engineVersion===BACKTEST_ENGINE_VERSION&&run.status==='done'&&run.dataSource==='generated'&&run.summary.trades===run.output.result.trades.length&&(!benchmark||JSON.stringify([...(run.sourceTradeIds??[])].sort())===benchmark)&&runSettingsKey(run.settings)===runSettingsKey(s)));
 return matched.every((run):run is BacktestRun=>!!run)?matched:null;
}

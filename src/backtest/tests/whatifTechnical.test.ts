import {test} from 'node:test';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {WhatIfTechnicalSetup} from '../../components/backtest/WhatIfTechnicalSetup';
import assert from 'node:assert/strict';
import {technicalTradeChecks,type TechnicalWhatIfRule} from '../whatifTechnical';
import {runWhatIf} from '../whatif';
import {compareParameters,parameterRules} from '../whatifOptimizer';
import {makeSavedWhatIf} from '../savedWhatIf';
import {cond,price,val,ind} from '../rules';
import type {Series} from '../types';
import {JOURNAL_ENTRIES} from '../../data/journalData';
import {DEFAULT_PLAYBOOKS} from '../../data/journalPlaybooks';
import {technicalSetupFromBook} from '../../components/backtest/WhatIfTechnicalSetup';
const start=Date.UTC(2026,0,1),minute=60000;
const series=(closes:number[]):Series=>({symbol:'EUR/USD',tf:'5m',length:closes.length,t:Float64Array.from(closes.map((_,i)=>start+i*5*minute)),o:Float64Array.from(closes),h:Float64Array.from(closes),l:Float64Array.from(closes),c:Float64Array.from(closes),v:Float64Array.from(closes.map(()=>100))});
const entry=(id:string,minutes:number,direction:'BUY'|'SELL'='BUY')=>({...JOURNAL_ENTRIES[0],id,direction,symbol:'EUR/USD',entryTime:new Date(start+minutes*minute).toISOString()});
const rule:TechnicalWhatIfRule={kind:'technical',label:'Price threshold',timeframe:'5m',conditions:[cond(price(),'gt',val(50))]};

test('technical checks use only completed candles and mirror short rules',()=>{
 const entries=[entry('incomplete',7),entry('closed',10),entry('next-incomplete',12),entry('short',7,'SELL')];
 const data=series([40,60,10,9999]),check=technicalTradeChecks(entries,rule,()=>data);
 assert.equal(check.get('incomplete')?.match,false);assert.equal(check.get('closed')?.match,true);assert.equal(check.get('next-incomplete')?.match,true);assert.equal(check.get('short')?.match,true);
 const changedFuture=technicalTradeChecks(entries,rule,()=>series([40,60,999999,-999999]));
 assert.deepEqual(changedFuture,check);
 const crossed={...rule,conditions:[{...rule.conditions[0],op:'crossAbove' as const}]};
 assert.equal(technicalTradeChecks([entry('cross',10)],crossed,()=>data).get('cross')?.match,true);
});

test('missing times, unsupported coverage, stale signals and indicator warmup remain unknown',()=>{
 const data=series([40,60,10,80]),unknowns=[{...entry('missing',10),entryTime:undefined},entry('outside',999),{...entry('symbol',10),symbol:'UNAVAILABLE'}];
 assert.ok([...technicalTradeChecks(unknowns,rule,()=>data).values()].every(c=>c.match===null));
 const warmup={...rule,conditions:[cond(ind('RSI',14),'gt',val(50))]};
 assert.equal(technicalTradeChecks([entry('warmup',10)],warmup,()=>data).get('warmup')?.match,null);
 const gap=series([40,60,10]);gap.t[2]=start+60*minute;
 assert.equal(technicalTradeChecks([entry('gap',30)],rule,()=>gap).get('gap')?.match,null);
});

test('technical What-if preserves the complete original ledger and labels demo or unavailable checks',()=>{
 const trade={...JOURNAL_ENTRIES[0],id:'known',symbol:'EUR/USD',date:'2026-08-03',entryTime:'2026-08-03T10:00:00Z',exitTime:'2026-08-03T11:00:00Z',direction:'BUY' as const,accountCurrency:'USD',pnl:100,commission:2,outcome:'win' as const,tradingStatus:'closed' as const,pnlKnown:true};
 const entries=[trade,{...trade,id:'unknown',symbol:'UNAVAILABLE'}],before=JSON.stringify(entries);
 const never={...rule,label:'Never',conditions:[cond(price(),'lt',val(0))]};
 const output=runWhatIf(entries,never);
 assert.equal(output.actual.trades,2);assert.equal(output.actual.netPnl,196);assert.equal(output.whatIf.netPnl,98);assert.equal(output.skipped,1);assert.equal(output.estimated,true);
 assert.match(output.trades.find(t=>t.id==='known')!.note,/completed demo candles/);
 assert.match(output.trades.find(t=>t.id==='unknown')!.note,/unavailable.*unchanged/);
 assert.equal(JSON.stringify(entries),before);
 const saved=makeSavedWhatIf(compareParameters(entries,[never])[0],{currency:'USD',source:'user',goal:'net',benchmark:'Selected journal',scope:{}},'Technical comparison');
 never.conditions[0].right=val(500);
 assert.deepEqual(saved.rule.kind==='technical'?saved.rule.conditions[0].right:null,val(0));
});

test('saved Playbook transfer and condition comparisons preserve source rules and timeframe',()=>{
 const book={...DEFAULT_PLAYBOOKS[0],instrumentTimeframe:'4h' as const,technicalEntryConditions:[cond(ind('RSI',14),'gt',val(50)),cond(price(),'gt',ind('EMA',20))]},before=JSON.stringify(book);
 const loaded=technicalSetupFromBook(book),variants=parameterRules(loaded,0,0,0);
 assert.equal(loaded.timeframe,'4h');assert.deepEqual(variants.map(r=>r.kind==='technical'?r.conditions.length:0),[2,1,1]);
 loaded.conditions[0].right=val(60);assert.equal(JSON.stringify(book),before);
});


test('technical tools exposes Playbook indicator controls directly without a source chooser',()=>{
 const html=renderToStaticMarkup(createElement(WhatIfTechnicalSetup,{onUse:()=>{},onClear:()=>{}}));
 for(const label of ['Condition 1 indicator','Condition 1 period','Condition 1 comparison','Condition 1 number','Technical timeframe'])assert.ok(html.includes('aria-label="'+label+'"'),label);
 for(const label of ['Add condition','Compare conditions','Compare two tools','Hide Technical tools','Money Flow Index','Bollinger upper band'])assert.ok(html.includes(label),label);
 assert.doesNotMatch(html,/My playbooks|Quick setups|no saved conditions|Restore default conditions|Choose an indicator, comparison/);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {labBenchmark,labSettings,labJobs,updateLabEntryRules,labBookSymbols,mergeLabSetup,labRulesNeedReview} from '../labTransfer';
import {validatePlaybookConditions} from '../../../backtest/playbookConditions';
import {cond,ind,val} from '../../../backtest/rules';
import {DEFAULT_PLAYBOOKS} from '../../../data/journalPlaybooks';
import {JOURNAL_ENTRIES} from '../../../data/journalData';
import {defaultSettings} from '../../../backtest/rules';
const book={...DEFAULT_PLAYBOOKS[0],instrumentTimeframe:'1h' as const,directions:['short'] as ('long'|'short')[],benchmarkRR:3};
const rules={maxRisk:1,maxDailyLoss:3,maxTrades:3} as any;
const trade={...JOURNAL_ENTRIES[0],id:'a',strategy:book.name,symbol:'NAS100',date:'2023-01-02',accountCurrency:'EUR'};
test('journal transfer preserves exact IDs, dates, currencies and source data without clamping',()=>{
 const entries=[trade,{...trade,id:'b',symbol:'UNKNOWN',date:'2026-11-01',accountCurrency:'USD'},{...trade,id:'outside'}];
 const before=JSON.stringify(entries);const r=labBenchmark(entries,['a','b'],[book]);
 assert.deepEqual(r.trades.map(e=>e.id),['a','b']);assert.deepEqual(r.currencies,['EUR','USD']);
 assert.deepEqual(r.symbols,['MNQ']);assert.deepEqual(r.unsupported,['UNKNOWN']);
 assert.equal(r.from,'2023-01-02');assert.equal(r.to,'2026-11-01');assert.equal(JSON.stringify(entries),before);
});
test('unlinked journal trades do not select unrelated or archived playbooks',()=>{
 assert.equal(labBenchmark([{...trade,strategy:'Unknown'}],['a'],[book]).books.length,0);
 assert.equal(labBenchmark([trade],['a'],[{...book,status:'archived'}]).books.length,0);
});
test('saved direction, target and timeframe transfer into an independent test copy',()=>{
 const before=JSON.stringify(book);const s=labSettings(book,[trade],rules);
 assert.equal(s.symbol,'MNQ');assert.equal(s.timeframe,'1h');assert.equal(s.rules.direction,'short');assert.equal(s.rules.exits.targetR,3);
 s.rules.exits.targetR=9;assert.equal(JSON.stringify(book),before);
});
test('multi-instrument jobs preserve each playbook rule/risk and use instrument costs',()=>{
 const a=labSettings(book,[trade],rules);const b={...defaultSettings(),playbookId:'second',risk:{...a.risk,percent:2}};
 const jobs=labJobs([a,b],['MNQ','EUR/USD','MNQ']);assert.equal(jobs.length,4);
 assert.equal(jobs[2].risk.percent,2);assert.equal(jobs[0].rules.direction,'short');
 assert.notDeepEqual(jobs[0].costs,jobs[1].costs);jobs[0].rules.entry.length=0;assert.ok(a.rules.entry.length);
});

test('single-day journal tests are valid and reversed dates remain blocked',async()=>{
 const {validateSettings}=await import('../../../backtest/rules');
 const s=labSettings(book,[trade],rules);s.from='2026-09-01';s.to='2026-09-01';
 assert.equal(validateSettings(s).filter(p=>p.field==='dates').length,0);
 s.to='2026-08-31';assert.equal(validateSettings(s).filter(p=>p.field==='dates').length,1);
});

test('entry-rule edits affect one test only and preserve settings and saved playbook',()=>{
 const first=labSettings(book,[trade],rules),second={...defaultSettings(),playbookId:'second'};
 const drafts={first,second},before=JSON.stringify({drafts,book});
 const entry=[cond(ind('RSI',14),'gt',val(55))],next=updateLabEntryRules(drafts,'first',entry);
 assert.equal(JSON.stringify({drafts,book}),before);assert.equal(next.second,second);
 assert.equal(JSON.stringify(next.first.rules.entry),JSON.stringify(entry));assert.notEqual(next.first.rules.entry,entry);
 assert.deepEqual({...next.first,rules:undefined},{...first,rules:undefined});
 assert.deepEqual({...next.first.rules,entry:undefined},{...first.rules,entry:undefined});
 next.first.rules.entry[0].right={kind:'value',value:99};assert.equal((entry[0].right as any).value,55);
 assert.throws(()=>updateLabEntryRules(drafts,'first',[]));assert.equal(updateLabEntryRules(drafts,'deleted',entry),drafts);
});

test('test editing supports the engine period range without widening saved-playbook scanner limits',()=>{
 const entry=[cond(ind('EMA',500),'gt',val(0))];
 assert.ok(validatePlaybookConditions(entry));assert.equal(validatePlaybookConditions(entry,500),null);
 assert.ok(validatePlaybookConditions([{...entry[0],left:ind('EMA',501)}],500));
 assert.ok(validatePlaybookConditions([{...entry[0],right:val(NaN)}],500));
});

test('playbook selection transfers supported instruments and aliases without unrelated fallbacks',()=>{
 const a={...book,id:'first',symbols:['NAS100','EUR/USD','US500']},b={...book,id:'second',symbols:['MNQ','UNKNOWN']};
 assert.deepEqual(labBookSymbols([a,b],{}),['MNQ','EUR/USD','MES']);
 assert.deepEqual(labBookSymbols([{...b,symbols:['UNKNOWN']}],{second:defaultSettings()}),[]);
 assert.deepEqual(labBookSymbols([{...b,symbols:[]}],{second:{...defaultSettings(),symbol:'MGC'}}),['MGC']);
 assert.deepEqual(labBookSymbols([],{}),[]);
});

test('quick setup edits preserve other selected playbooks, rules and saved source data',()=>{
 const a=labSettings(book,[trade],rules),b={...defaultSettings(),playbookId:'second',risk:{...a.risk,percent:2}},drafts={first:a,second:b};
 const original=JSON.stringify({drafts,book});
 const changed={...a,risk:{...a.risk,percent:1.5}};
 const next=mergeLabSetup(drafts,['first'],{first:changed,second:{...b,timeframe:'1D'}});
 assert.equal(next.second,b);assert.equal(next.first.risk.percent,1.5);
 assert.equal(JSON.stringify(next.first.rules),JSON.stringify(a.rules));assert.deepEqual(next.first.session,a.session);
 assert.equal(next.first.timeframe,a.timeframe);assert.equal(JSON.stringify({drafts,book}),original);
 next.first.risk.percent=3;assert.equal(changed.risk.percent,1.5);
 assert.deepEqual(Object.keys(mergeLabSetup(drafts,['deleted'],{deleted:a})),['first','second']);
});


test('rule review survives draft copies but cannot approve changed or different playbook entries',()=>{
 const source={...book,technicalEntryConditions:undefined,technicalRecipeId:undefined},settings=labSettings(source,[],rules);
 assert.equal(labRulesNeedReview(source,settings,{}),true);
 const reviewed={[source.id]:JSON.stringify(settings.rules.entry)};
 assert.equal(labRulesNeedReview(source,JSON.parse(JSON.stringify(settings)),reviewed),false);
 assert.equal(labRulesNeedReview(source,{...settings,risk:{...settings.risk,percent:2}},reviewed),false);
 assert.equal(labRulesNeedReview(source,{...settings,rules:{...settings.rules,entry:[cond(ind('RSI',14),'gt',val(55))]}},reviewed),true);
 assert.equal(labRulesNeedReview({...source,id:'another'},settings,reviewed),true);
 assert.equal(labRulesNeedReview(source,undefined,reviewed),true);
 assert.equal(labRulesNeedReview({...source,technicalEntryConditions:settings.rules.entry},settings,{}),false);
});

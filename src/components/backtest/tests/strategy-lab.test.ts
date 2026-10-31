import test from 'node:test';
import assert from 'node:assert/strict';
import {labBenchmark,labSettings,labJobs} from '../labTransfer';
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

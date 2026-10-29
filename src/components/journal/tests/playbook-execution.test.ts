import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { DEFAULT_PLAYBOOKS } from '../../../data/journalPlaybooks';
import { JOURNAL_ENTRIES, DEFAULT_CHECKLIST } from '../../../data/journalData';
import { defaultSettings } from '../../../backtest/rules';
import type { BacktestRun } from '../../../backtest/store';
import { eligible } from '../journalMath';
import { executionRows, playbookFingerprint } from '../playbookExecution';
import { PlaybookSetupDialog } from '../PlaybookSetupDialog';
import { PlaybookEditorFields } from '../PlaybookEditorFields';
import { PlaybookExecutionWorkspace } from '../PlaybookExecutionWorkspace';
const book = { ...DEFAULT_PLAYBOOKS[0], symbols: ['NAS100','EUR/USD','CUSTOM'] };
const globalRules = {maxRisk:1,maxDailyLoss:3,maxTrades:3,stopAfterLosses:2,customRules:[]};
const run = (id:string, lastRun:string): BacktestRun => ({id,lastRun,createdAt:lastRun, name:'Test',mode:'automated',status:'done',playbookId:book.id,symbol:'MNQ',timeframe:'15m',from:'2026-01-01',to:'2026-02-01',settings:defaultSettings({playbook:book}),summary:{trades:0,net:0,netPct:0,winRate:0,avgR:0,pf:null,maxDDPct:0},output:{result:{trades:[],startBalance:1000,endBalance:1000,currency:'USD',rangeStart:0,rangeEnd:1,events:[],stopReason:null,diagnostics:{} as any,zeroTradeReason:'No matching signals',propStatus:null,tradingDays:1},suggestions:[]},playbookFingerprint:playbookFingerprint(book)});
test('Every selected instrument appears; aliases use latest test without inventing results',()=>{
 const rows=executionRows(book,JOURNAL_ENTRIES,[run('old','2026-01-01'),run('new','2026-02-01')]);
 assert.equal(rows.length,3); assert.equal(rows[0].run?.id,'new'); assert.equal(rows[0].stale,false); assert.equal(rows[1].run,undefined);assert.equal(rows[2].avgR,null);
 const changed=executionRows({...book,benchmarkRR:7},[],[run('old','2026-01-01')]); assert.equal(changed[0].stale,true);
});
test('Unknown adherence is excluded from assessed denominator; unrelated playbooks do not leak',()=>{
 const entry=JOURNAL_ENTRIES.find(e=>eligible(e)) ?? JOURNAL_ENTRIES[0];
 const entries=[{...entry,strategy:book.name,symbol:'NAS100',followedPlan:undefined},{...entry,id:'off',strategy:book.name,symbol:'NAS100',followedPlan:false},{...entry,id:'other',strategy:'Other',symbol:'NAS100',followedPlan:true}];
 const row=executionRows(book,entries,[])[0];assert.equal(row.journal.length,2);assert.equal(row.reviewed,1);assert.equal(row.plan,0);
});
test('Edit shares creation dialog, keeps basic area lean and uses Save changes',()=>{
 const html=renderToStaticMarkup(createElement(PlaybookSetupDialog,{mode:'edit',draft:book,entries:[],globalRules,houseChecklist:DEFAULT_CHECKLIST,onChange:()=>{},onBack:()=>{},onCreate:()=>null}));
 assert.match(html,/Edit playbook/);assert.match(html,/Save changes/);assert.match(html,/Customize details/);assert.doesNotMatch(html,/Create playbook<|Pre-trade checklist/);
 const detail=renderToStaticMarkup(createElement(PlaybookEditorFields,{editing:book,setEditing:()=>{},entries:[],globalRules,isNew:false,grouped:true,houseChecklist:DEFAULT_CHECKLIST}));
 assert.ok(detail.indexOf('Pre-trade checklist') < detail.indexOf('Thesis and execution rules'));assert.match(detail,/<summary[^>]*>Pre-trade checklist/);
});
test('Comparison shows waiting state with every instrument and keeps execution history',()=>{
 const html=renderToStaticMarkup(createElement(PlaybookExecutionWorkspace,{playbook:book,entries:[],allEntries:[],onOpenEntry:()=>{},onShowTrades:()=>{},onReplay:()=>{}}));
 assert.equal((html.match(/Waiting for test/g)||[]).length,3);assert.match(html,/Simulated trades/);assert.match(html,/Journal trades/);assert.match(html,/CUSTOM/);
});

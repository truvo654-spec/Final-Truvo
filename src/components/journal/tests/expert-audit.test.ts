import test from 'node:test';
import assert from 'node:assert/strict';
import type { JournalEntry } from '../../../types';
import { JOURNAL_ENTRIES } from '../../../data/journalData';
import { DEFAULT_PLAYBOOKS } from '../../../data/journalPlaybooks';
import { autoMap,convertRows,parseCsv } from '../journalIngest';
import { journalCsv } from '../journalExport';
import { attributionSnapshot,isActiveScenario,matchesPlaybook, playbookVersion, scenarioProblem,scenarioRR,setupCheckKey } from '../playbookLinks';
import { checkRules,computeDiscipline,computeTilt } from '../JournalMonitors';
import { liveStats,healthOf } from '../../../backtest/gap';
import { createJournalBackup,parseJournalBackup,restoreJournalBackup } from '../journalBackup';
import { saveJournalBatch } from '../journalStorage';
const entry=(patch:Partial<JournalEntry>={}):JournalEntry=>({...JOURNAL_ENTRIES[0],id:'expert-test',accountId:'A',accountCurrency:'USD',symbol:'EUR/USD',direction:'BUY',
  entryPrice:1.1,exitPrice:null,size:1,date:'2026-10-01',entryTime:'2026-10-01T10:00:00Z',exitTime:undefined,
  pnl:10,pnlKnown:true,commission:0,tradingStatus:'closed',initialRisk:10,rMultiple:null,strategy:'Unassigned',playbookId:undefined,playbookVersion:undefined,...patch});
const rules={maxRisk:1,maxDailyLoss:3,maxTrades:3,stopAfterLosses:2};
const convert=(text:string,existing:JournalEntry[]=[])=>{
  const [head,...rows]=parseCsv(text);
  return convertRows(rows,autoMap(head),existing,{strategy:'Unassigned',accountId:' A ',currency:'USD'});
};
test('scenario price relationships are directional, finite and non-degenerate',()=>{
  assert.equal(scenarioRR({bias:'long',entry:100,stop:95,target:110}),2);
  assert.equal(scenarioRR({bias:'short',entry:100,stop:105,target:90}),2);
  for(const scenario of [{bias:'long' as const,entry:100,stop:110,target:95},{bias:'short' as const,entry:100,stop:95,target:110},{bias:'long' as const,entry:100,stop:100,target:110},{bias:'long' as const,entry:Infinity,stop:95,target:110}]){
    assert.ok(scenarioProblem(scenario)); assert.equal(scenarioRR(scenario),null);
  }
});
test('immutable attribution and scenario/version-specific preparation do not bleed between ideas',()=>{
  const book=DEFAULT_PLAYBOOKS[0];
  assert.ok(matchesPlaybook(entry({playbookId:book.id,strategy:'Old name'}),book));
  assert.equal(matchesPlaybook(entry({playbookId:'different',strategy:book.name}),book),false);
  assert.notEqual(setupCheckKey(book,'one'),setupCheckKey(book,'two'));
  assert.notEqual(setupCheckKey(book,'one'),setupCheckKey({...book,targetRule:'Changed target'},'one'));
  assert.notEqual(playbookVersion(book),playbookVersion({...book,window:{start:9,end:10,label:'Custom'}}));
  assert.equal(playbookVersion(book),playbookVersion({...book,grade:book.grade==='A+'?'B':'A+'}));
  const prior=entry({strategy:'Previous book',playbookId:'previous',playbookVersion:'v0',scenarioId:'prior-scenario'});
  const snapshot=attributionSnapshot(prior);
  prior.strategy='Corrected book';
  assert.equal(snapshot.strategy,'Previous book');assert.equal(snapshot.playbookVersion,'v0');assert.equal(snapshot.scenarioId,'prior-scenario');
});
test('expired watching ideas are not active preparation, while already-triggered history remains active',()=>{
  assert.equal(isActiveScenario({status:'watching',validUntil:'2026-10-18'},'2026-10-19'),false);
  assert.equal(isActiveScenario({status:'watching',validUntil:'2026-10-19'},'2026-10-19'),true);
  assert.equal(isActiveScenario({status:'triggered',validUntil:'2026-10-18'},'2026-10-19'),true);
  assert.equal(isActiveScenario({status:'closed',validUntil:'2026-10-20'},'2026-10-19'),false);
});
test('explicit open status wins over zero P&L and ambiguous zero is rejected',()=>{
  const head='date,symbol,side,entry,qty,pnl,fee,ticket,status\n';
  const open=convert(head+'2026-10-01,EUR/USD,BUY,1.1,1,0,0,T,open')[0];
  assert.equal(open.status,'ok');assert.equal(open.entry?.tradingStatus,'open');
  assert.equal(open.entry?.strategy,'Unassigned');assert.equal(open.entry?.accountId,'A');
  assert.equal(convert(head+'2026-10-01,EUR/USD,BUY,1.1,Infinity,0,0,T,open')[0].status,'invalid');
  assert.equal(convert(head+'2026-10-01,EUR/USD,BUY,1.1,1,0,0,T,')[0].status,'invalid');
  assert.equal(convert(head+'2026-10-01,EUR/USD,BUY,1.1,1,,0,T,closed')[0].status,'invalid');
});
test('open-to-closed reimport preserves identity and review; closed conflicts require approval',()=>{
  const head='time,symbol,side,entry,qty,pnl,fee,ticket,status,exit\n';
  const open=convert(head+'2026-10-01T10:00:00Z,EUR/USD,BUY,1.1,1,0,0,T,open,')[0].entry!;
  const reviewed={...open,lessons:'Keep my review',scenarioId:'scenario',playbookId:'book',screenshot:'local-image'};
  const csv=head+'2026-10-01T10:00:00Z,EUR/USD,BUY,1.1,1,20,2,T,closed,1.2';
  const updated=convert(csv,[reviewed])[0];
  assert.equal(updated.status,'update');assert.equal(updated.entry?.id,open.id);
  assert.equal(updated.entry?.lessons,'Keep my review');assert.equal(updated.entry?.scenarioId,'scenario');
  assert.equal(updated.entry?.screenshot,'local-image');assert.equal(updated.entry?.executionHistory?.[0].status,'open');
  assert.equal(updated.entry?.executionHistory?.[0].symbol,reviewed.symbol);
  assert.equal(updated.entry?.executionHistory?.[0].size,reviewed.size);
  assert.equal(convert(csv,[updated.entry!])[0].status,'duplicate');
  assert.equal(convert(csv.replace(',20,2,',',30,2,'),[updated.entry!])[0].status,'conflict');
});
test('execution CSV round-trips prices, risk, timestamps, units and signed results without formula injection',()=>{
  const original=entry({ticketId:'-ticket',entryTime:'2026-10-01T10:00:00.000Z',exitPrice:1.09,exitTime:'2026-10-01T11:00:00.000Z',stopPrice:1.09,takeProfit:1.12,initialRisk:12,
    pnl:-12,commission:2,quantityUnit:'lots',setupNotes:'=not a spreadsheet formula',tags:['@tag'],strategy:'-custom'});
  const csv=journalCsv([original]);
  assert.ok(csv.includes("'=not a spreadsheet formula"));
  const imported=convert(csv)[0];
  assert.equal(imported.status,'ok');
  for(const key of ['entryPrice','exitPrice','pnl','commission','ticketId','entryTime','exitTime','stopPrice','takeProfit','initialRisk','quantityUnit','setupNotes','strategy'] as const)assert.equal(imported.entry![key],original[key],key);
});
test('loss-streak monitor uses closures known at entry time, separately per account',()=>{
  const loss1=entry({id:'L1',pnl:-10,exitTime:'2026-10-01T14:00:00Z'});
  const loss2=entry({id:'L2',entryTime:'2026-10-01T11:00:00Z',pnl:-10,exitTime:'2026-10-01T15:00:00Z'});
  const third=entry({id:'T3',entryTime:'2026-10-01T12:00:00Z',tradingStatus:'open'});
  assert.equal(checkRules([loss1,loss2,third],rules).keptTrading.length,0);
  assert.equal(checkRules([loss1,loss2,{...third,entryTime:'2026-10-01T16:00:00Z'}],rules).keptTrading.length,1);
  assert.equal(checkRules([loss1,loss2,{...third,entryTime:'2026-10-01T16:00:00Z',accountId:'B'}],rules).keptTrading.length,0);
});
test('risk evidence produces known breaches without inventing day-start equity',()=>{
  const loss=entry({pnl:-400,exitTime:'2026-10-01T11:00:00Z'});
  const next=entry({id:'next',entryTime:'2026-10-01T12:00:00Z',tradingStatus:'open',initialRisk:200,equityAtEntry:10000,dayStartEquity:10000});
  const result=checkRules([loss,next],rules);
  assert.equal(result.riskBreaches.length,1);assert.equal(result.dailyBreaches.length,1);
  assert.equal(checkRules([loss,{...next,dayStartEquity:undefined}],rules).dailyCoverage,0);
});
test('discipline denominator is a saved snapshot and tilt uses monetary net outcomes',()=>{
  const reviewed=entry({followedPlan:true,mistakesReviewed:true,mistakes:[],checklistDone:['a'],checklistSnapshot:[{id:'a',label:'Original'}]});
  assert.equal(computeDiscipline([reviewed],1)?.score,computeDiscipline([reviewed],20)?.score);
  assert.equal(computeDiscipline([{...reviewed,checklistSnapshot:undefined}],20)?.checklist,null);
  assert.ok(computeTilt([entry({pnl:1,commission:2}),entry({id:'two',pnl:1,commission:2,outcome:'win'})],rules)?.signals.some(s=>s.includes('losses in a row')));
});
test('demo comparisons exclude other instruments, currencies, versions and unknown legacy versions',()=>{
  const scope={playbookId:'P',symbol:'EUR/USD',currency:'USD',playbookVersion:'v1'};
  const match=entry({playbookId:'P',playbookVersion:'v1',strategy:'Book'});
  const stats=liveStats([match,{...match,id:'other-symbol',symbol:'GBP/USD'},{...match,id:'other-currency',accountCurrency:'EUR'},
    {...match,id:'old',playbookVersion:'v0'},{...match,id:'unknown',playbookVersion:undefined}], 'Book',scope);
  assert.equal(stats.trades,1);
  const reference={...scope,runId:'R',runName:'Demo',savedAt:'2026-10-01',trades:100,winRate:90,avgR:2,pf:4,maxDDPct:1,stdR:1,dataSource:'generated-demo' as const};
  assert.equal(healthOf({...stats,trades:100,avgR:-10},reference).health,'demo-reference');
  assert.equal(healthOf({...stats,playbookVersion:'v2'},reference).health,'outdated');
});
test('backup is lossless, excludes entitlements, rejects foreign keys, and rolls back failed writes',()=>{
  const memory=new Map<string,string>();
  const previous=Object.getOwnPropertyDescriptor(globalThis,'localStorage');
  Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{
    getItem:(key:string)=>memory.get(key) ?? null,
    setItem:(key:string,value:string)=>{if(key.endsWith('imports') && value==='[1]')throw Error('quota');memory.set(key,value);},
    removeItem:(key:string)=>memory.delete(key),
  }});
  try {
    memory.set('ms-journal-v2-entries',JSON.stringify([entry({lessons:'Retain review',screenshot:'data:image/png;base64,test'})]));
    memory.set('ms-journal-v2-playbooks',JSON.stringify(DEFAULT_PLAYBOOKS));
    memory.set('ms-journal-v2-access-unlocks','{"private":"not-exported"}');
    const backup=createJournalBackup();
    assert.ok(!JSON.stringify(backup).includes('not-exported'));
    assert.equal(parseJournalBackup(JSON.stringify(backup)).values.entries,backup.values.entries);
    assert.throws(()=>parseJournalBackup(JSON.stringify({...backup,values:{...backup.values,constructor:'{}'}})));
    assert.equal(saveJournalBatch({entries:[],imports:[1]}),false);
    assert.equal(memory.get('ms-journal-v2-entries'),backup.values.entries);
    assert.ok(restoreJournalBackup(backup));
    assert.equal(memory.get('ms-journal-v2-access-unlocks'),'{"private":"not-exported"}');
  } finally {if(previous)Object.defineProperty(globalThis,'localStorage',previous);else Reflect.deleteProperty(globalThis,'localStorage');}
});

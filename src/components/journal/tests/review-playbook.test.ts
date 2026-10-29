import test from 'node:test';
import assert from 'node:assert/strict';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {JournalReviewDrawer, changeReviewPlaybook} from '../JournalReviewDrawer';
import {DEFAULT_PLAYBOOKS} from '../../../data/journalPlaybooks';
import {JOURNAL_ENTRIES} from '../../../data/journalData';
const entry={...JOURNAL_ENTRIES[0],strategy:'Original strategy',followedPlan:true,scenarioId:'old-scenario',ruleEvidence:[{ruleId:'old-rule',label:'Old setup rule',version:'old',effectiveAt:'2026-10-01',state:'pass' as const,source:'user' as const}]};
const active={...DEFAULT_PLAYBOOKS[0],id:'saved-custom',name:'My saved setup',status:'active' as const};
const archived={...DEFAULT_PLAYBOOKS[1],id:'archived',name:'Archived setup',status:'archived' as const};
const html=(record=entry,books=[active,archived])=>renderToStaticMarkup(createElement(JournalReviewDrawer,{entry:record,cohort:[record.id],playbooks:books,onSelect:()=>{},onClose:()=>{},onSave:()=>{},onDelete:()=>{},onReplay:()=>{}}));
test('Review offers saved playbooks only and preserves unavailable legacy assignment',()=>{
 const output=html();
 assert.match(output,/aria-label="Trade playbook"/);assert.match(output,/<option value="My saved setup">My saved setup<\/option>/);
 assert.match(output,/Original strategy \(not in saved playbooks\)/);assert.doesNotMatch(output,/<option[^>]*value="Archived setup"/);
 assert.doesNotMatch(output,/<input[^>]*aria-label="Trade playbook"/);
 const historical=html({...entry,strategy:archived.name});assert.match(historical,/Archived setup \(Archived\)/);
});
test('Switching setup preserves trade execution facts and resets evidence from the old playbook',()=>{
 const changed=changeReviewPlaybook(entry,active.name);
 assert.equal(changed.strategy,active.name);assert.equal(changed.followedPlan,null);assert.equal(changed.ruleEvidence,undefined);assert.equal(changed.scenarioId,undefined);assert.equal(changed.reviewState,'needs_review');assert.equal(changed.pnl,entry.pnl);assert.equal(changed.entryPrice,entry.entryPrice);assert.equal(changed.initialRisk,entry.initialRisk);
 assert.equal(changeReviewPlaybook(entry,entry.strategy),entry);
 const output=html(changed as typeof entry);assert.match(output,/Defined range/);assert.doesNotMatch(output,/Old setup rule/);
});
test('No saved playbooks does not create a free-text strategy or silently assign a default',()=>{
 const output=html(entry,[]);assert.match(output,/Create a playbook in the Playbook tab/);assert.match(output,/<select aria-label="Trade playbook"[^>]*disabled/);
});

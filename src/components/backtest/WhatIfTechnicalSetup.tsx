import React,{useEffect,useState} from 'react';
import {DEFAULT_PLAYBOOKS,type JournalPlaybook} from '../../data/journalPlaybooks';
import {cond,ind,val,templateFor} from '../../backtest/rules';
import {playbookConditions,validatePlaybookConditions} from '../../backtest/playbookConditions';
import {getTechnicalStrategyRecipe} from '../../backtest/technicalStrategies';
import {SUPPORTED_TIMEFRAMES,type Timeframe} from '../../backtest/types';
import type {TechnicalWhatIfRule} from '../../backtest/whatifTechnical';
import {PlaybookTechnicalConditions} from '../journal/PlaybookTechnicalConditions';
import {InfoTooltip} from '../common/InfoTooltip';
import {CollapsibleCard,Modal,Pill,btnPrimary,btnSecondary,inputBase} from './ui';

export const DEFAULT_TECHNICAL_SETUP:TechnicalWhatIfRule={kind:'technical',label:'RSI',timeframe:'15m',conditions:[cond(ind('RSI',14),'gt',val(50))]};
export function technicalSetupFromBook(book:JournalPlaybook):TechnicalWhatIfRule{
 return {kind:'technical',label:book.name,timeframe:getTechnicalStrategyRecipe(book.technicalRecipeId)?.timeframe??book.instrumentTimeframe??templateFor(book).tf,conditions:playbookConditions(book)};
}
const conditionLabel=(conditions:TechnicalWhatIfRule['conditions'])=>[...new Set(conditions.map(c=>c.left.kind==='ind'?c.left.ind.type:c.left.kind==='price'?c.left.field:'Custom'))].join(' + ')||'Technical conditions';
const editorBook=(rule:TechnicalWhatIfRule):JournalPlaybook=>({...structuredClone(DEFAULT_PLAYBOOKS[0]),name:rule.label,technicalEntryConditions:structuredClone(rule.conditions)});

export function WhatIfTechnicalSetup({initial,applied,onUse,onFinish=onUse}:{initial?:TechnicalWhatIfRule;applied?:TechnicalWhatIfRule;onUse:(rule:TechnicalWhatIfRule)=>void;onFinish?:(rule:TechnicalWhatIfRule)=>void}){
 const [book,setBook]=useState(()=>editorBook(initial??DEFAULT_TECHNICAL_SETUP));
 const [timeframe,setTimeframe]=useState((initial??DEFAULT_TECHNICAL_SETUP).timeframe);
 const [editing,setEditing]=useState<JournalPlaybook|null>(null);
 const [editingConditionId,setEditingConditionId]=useState<string|null>(null);
 useEffect(()=>{if(applied){setBook(editorBook(applied));setTimeframe(applied.timeframe);}},[JSON.stringify(applied)]);
 const conditions=book.technicalEntryConditions??[];
 const label=conditionLabel(conditions);
 const draft:TechnicalWhatIfRule={kind:'technical',label,timeframe,conditions};
 const error=validatePlaybookConditions(conditions,500),editError=editing?validatePlaybookConditions(editing.technicalEntryConditions??[],500):null;
 const same=applied&&applied.timeframe===timeframe&&JSON.stringify(applied.conditions)===JSON.stringify(conditions);
 const editCondition=(conditionId:string)=>{const condition=book.technicalEntryConditions?.find(item=>item.id===conditionId);if(!condition)return;setEditingConditionId(conditionId);setEditing({...structuredClone(book),technicalEntryConditions:[structuredClone(condition)]});};
 return <>
  <CollapsibleCard title="Technical tools" summary={conditions.length+' condition'+(conditions.length===1?'':'s')+' · '+timeframe+(applied?' · Applied':'')}>
   <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><span className="inline-flex items-center"><Pill tone="warn">Demo price check</Pill><InfoTooltip label="Technical conditions" description="All conditions must pass on completed demo candles before entry. Short rules mirror long rules. Missing data leaves a trade unchanged. Changes apply only to this comparison. MACD uses 12/26/9, Bollinger bands 2 deviations and Ultimate Oscillator 7/14/28."/></span><label className="flex items-center gap-1 text-[11px] text-slate-500">Timeframe<select aria-label="Technical timeframe" className={inputBase+' max-w-24 !px-2 !text-xs'} value={timeframe} onChange={e=>setTimeframe(e.target.value as Timeframe)}>{SUPPORTED_TIMEFRAMES.map(tf=><option key={tf}>{tf}</option>)}</select></label></div>
   <PlaybookTechnicalConditions mode="whatif" playbook={book} onChange={setBook} onEditAdvanced={editCondition}/>
   <div className="mt-3 flex flex-wrap items-center gap-2"><button type="button" className={btnPrimary} disabled={!!error} onClick={()=>onFinish(structuredClone(draft))}>Finish comparing conditions</button>{applied&&<Pill tone={same?'good':'warn'}>{same?'Applied':'Not applied'}</Pill>}</div>
  </CollapsibleCard>
  <Modal open={!!editing} onClose={()=>{setEditing(null);setEditingConditionId(null);}} title="Edit technical conditions" width="max-w-4xl">
   <h2 className="pr-6 text-lg font-bold">Compare technical tools</h2><p className="mt-1 text-xs text-slate-500">Price or indicator · comparison · price, indicator or number.</p>
   <div className="mt-4 max-h-[60vh] overflow-y-auto pr-2">{editing&&<PlaybookTechnicalConditions mode="test" playbook={editing} onChange={next=>setEditing(current=>current?(typeof next==='function'?next(current):next):current)}/>}</div>
   <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-slate-200 pt-4"><button type="button" className={btnSecondary} onClick={()=>{setEditing(null);setEditingConditionId(null);}}>Cancel</button><button type="button" className={btnPrimary} disabled={!!editError} onClick={()=>{if(!editing||!editingConditionId)return;const editedConditions=structuredClone(editing.technicalEntryConditions??[]);const nextConditions=(book.technicalEntryConditions??[]).flatMap(condition=>condition.id===editingConditionId?editedConditions:[condition]);const nextBook={...book,technicalEntryConditions:nextConditions};const next={...draft,label:conditionLabel(nextConditions),conditions:nextConditions};setBook(nextBook);onUse(next);setEditing(null);setEditingConditionId(null);}}>Apply &amp; compare</button></div>
  </Modal>
 </>;
}

import React,{useState} from 'react';
import type {JournalPlaybook} from '../../data/journalPlaybooks';
import type {BacktestSettings,Condition} from '../../backtest/types';
import {deepClone} from '../../backtest/rules';
import {validatePlaybookConditions} from '../../backtest/playbookConditions';
import {PlaybookTechnicalConditions} from '../journal/PlaybookTechnicalConditions';
import {InfoTooltip} from '../common/InfoTooltip';
import {Modal,btnPrimary,btnSecondary} from './ui';

export function LabEntryRulesDialog({book,settings,suggested,reviewProgress,initialEntry,onBack,onApply,onClose}:{book:JournalPlaybook;settings:BacktestSettings;suggested:boolean;reviewProgress?:{current:number;total:number};initialEntry?:Condition[];onBack?:(entries:Condition[])=>void;onApply:(entries:Condition[])=>void;onClose:()=>void}){
 const [editing,setEditing]=useState<JournalPlaybook>(()=>({...book,technicalEntryConditions:structuredClone(initialEntry??settings.rules.entry)}));
 const entries=editing.technicalEntryConditions??[],error=validatePlaybookConditions(entries,500);
 return <Modal open onClose={onClose} title={`${book.name} entry rules`} width="max-w-3xl"><div className="flex max-h-[80dvh] flex-col">
  <header className="shrink-0 pr-8">{reviewProgress&&<p className="mb-2 text-xs font-semibold text-[#5338ec]">Review {reviewProgress.current} of {reviewProgress.total}</p>}<div className="flex flex-wrap items-center gap-2"><h3 className="text-lg font-bold">{book.name} · Entry rules</h3>{suggested&&<span className="rounded-full bg-amber-50 px-2 py-1 text-[10px] font-semibold text-amber-700">Suggested template</span>}</div><p className="mt-1 flex items-center text-xs text-slate-500">Changes apply to this test only.<InfoTooltip label="Test copy" description="Applying these conditions updates this strategy book’s entry rules in the current Strategy Lab draft. The saved Strategy Book, its notes and other selected strategy books stay unchanged. Dates, risk, exits and session settings are retained."/></p></header>
  <div className="mt-4 min-h-0 overflow-y-auto pr-1"><PlaybookTechnicalConditions mode="test" playbook={editing} onChange={setEditing}/></div>
  <footer className="mt-4 flex shrink-0 flex-wrap items-center gap-2 border-t border-slate-200 pt-4">{reviewProgress&&reviewProgress.total>1&&<button type="button" className={btnSecondary} disabled={reviewProgress.current<=1||!onBack} onClick={()=>onBack?.(structuredClone(entries))}>Back</button>}<div className="ml-auto flex gap-2"><button type="button" className={btnSecondary} onClick={onClose}>Cancel</button><button type="button" className={btnPrimary} disabled={!!error} onClick={()=>{if(!error)onApply(deepClone(entries));}}>{reviewProgress?(reviewProgress.current<reviewProgress.total?'Apply & next':'Finish review'):'Apply to test'}</button></div></footer>
 </div></Modal>;
}

import React,{useMemo,useState} from 'react';
import type {JournalEntry} from '../../types';
import type {JournalPlaybook} from '../../data/journalPlaybooks';
import {loadRuns,loadWhatIfs} from '../../backtest/store';
import {relatedReplaySetups,type RelatedReplaySetup} from '../../backtest/replaySetups';
import {Field,inputCls} from './ui';

export function ReplaySetupTransfer({entries,playbooks,onSelect,disabled=false,initialId='',label='Choose a playbook or saved test'}:{entries:JournalEntry[];playbooks:JournalPlaybook[];onSelect:(setup:RelatedReplaySetup|null)=>void;disabled?:boolean;initialId?:string;label?:string}){
  const [saved]=useState(()=>({whatifs:loadWhatIfs(),runs:loadRuns()}));
  const [id,setId]=useState(initialId);
  const options=useMemo(()=>relatedReplaySetups(playbooks,entries,saved.whatifs,saved.runs),[playbooks,entries,saved]);
  const selected=options.find(o=>o.id===id);
  const playbookOptions=options.filter(o=>o.id.startsWith('playbook:')||o.id.startsWith('scenario:'));
  const whatIfOptions=options.filter(o=>o.id.startsWith('whatif:'));
  const backtestOptions=options.filter(o=>o.id.startsWith('backtest:'));
  return <div className="rounded-xl border border-[#5338ec]/20 bg-[#FBFAFF] p-3 space-y-2" aria-label="Related replay setup transfer">
    <Field label={label} hint="Load your playbook rules and supported settings into this replay. Save a backtest first if it is still a draft."><select aria-label={label} disabled={disabled} className={inputCls} value={id} onChange={e=>{setId(e.target.value);onSelect(options.find(o=>o.id===e.target.value)||null);}}><option value="">Manual setup · keep current values</option>{playbookOptions.length>0&&<optgroup label="Journal playbooks">{playbookOptions.map(o=><option key={o.id} value={o.id}>{o.name}</option>)}</optgroup>}{whatIfOptions.length>0&&<optgroup label="Saved What-if tests">{whatIfOptions.map(o=><option key={o.id} value={o.id}>{o.name}</option>)}</optgroup>}{backtestOptions.length>0&&<optgroup label="Saved backtests">{backtestOptions.map(o=><option key={o.id} value={o.id}>{o.name}</option>)}</optgroup>}</select></Field>
    <p className="text-[11px] text-[#5338ec]">Instrument scope, timeframe, risk and supported exit settings are copied into an editable replay. Playbook rules stay visible as your practice guide.</p>
    {options.length===0&&<p className="text-[11px] text-slate-500">No active playbooks or saved tests yet. Create a playbook or save a backtest to use it here.</p>}
    {selected&&<><p className="text-[11px] text-slate-600">{selected.symbols.length?`Instrument scope: ${selected.symbols.join(', ')}. ${selected.symbols.length>1?'One instrument is selected as a starting point; choose another manually.':''}`:'No recorded instrument; keep your current selection.'}</p>{selected.notes.map((note,i)=><p key={i} className="text-[10px] text-slate-500">{note}</p>)}</>}
  </div>;
}

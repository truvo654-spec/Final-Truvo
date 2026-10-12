import React,{useMemo,useState} from 'react';
import type {JournalEntry} from '../../types';
import type {JournalPlaybook} from '../../data/journalPlaybooks';
import {loadRuns,loadWhatIfs} from '../../backtest/store';
import {relatedReplaySetups,type RelatedReplaySetup} from '../../backtest/replaySetups';
import {Field,inputCls} from './ui';

export function ReplaySetupTransfer({entries,playbooks,onSelect,disabled=false,label='Related setup'}:{entries:JournalEntry[];playbooks:JournalPlaybook[];onSelect:(setup:RelatedReplaySetup|null)=>void;disabled?:boolean;label?:string}){
  const [saved]=useState(()=>({whatifs:loadWhatIfs(),runs:loadRuns()}));
  const [id,setId]=useState('');
  const options=useMemo(()=>relatedReplaySetups(playbooks,entries,saved.whatifs,saved.runs),[playbooks,entries,saved]);
  const selected=options.find(o=>o.id===id);
  return <div className="rounded-xl border border-[#5338ec]/20 bg-[#FBFAFF] p-3 space-y-2" aria-label="Related replay setup transfer">
    <Field label={label}><select aria-label={label} disabled={disabled} className={inputCls} value={id} onChange={e=>{setId(e.target.value);onSelect(options.find(o=>o.id===e.target.value)||null);}}><option value="">Manual setup · keep current values</option>{options.map(o=><option key={o.id} value={o.id}>{o.name}</option>)}</select></Field>
    <p className="text-[11px] text-[#5338ec]">Selecting a setup fills matching fields automatically. Every copied field remains editable.</p>
    {selected&&<><p className="text-[11px] text-slate-600">{selected.symbols.length?`Instrument scope: ${selected.symbols.join(', ')}. ${selected.symbols.length>1?'One instrument is selected as a starting point; choose another manually.':''}`:'No recorded instrument; keep your current selection.'}</p>{selected.notes.map((note,i)=><p key={i} className="text-[10px] text-slate-500">{note}</p>)}</>}
  </div>;
}

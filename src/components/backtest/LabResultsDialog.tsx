import React,{useState} from 'react';
import type {BacktestRun} from '../../backtest/store';
import type {JournalPlaybook} from '../../data/journalPlaybooks';
import {DashboardResultPopup} from './DashboardResultPopup';
import {dashboardSources,initialDashboardScope,loadDashboardScope} from './dashboardData';
import {Check,Save,FolderOpen} from 'lucide-react';
import {inputCls,btnPrimary,btnSecondary} from './ui';

/** Inspect this completed batch in place; keep dashboard filters and Lab drafts untouched. */
export function LabResultsDialog({runs,playbooks,saved,onClose,onSave,onViewSavedRuns,onWhatIf,closeLabel='Back to setup'}:{runs:BacktestRun[];playbooks:JournalPlaybook[];saved:boolean;onClose:()=>void;onSave?:()=>void;onViewSavedRuns?:()=>void;onWhatIf?:(run:BacktestRun)=>void;closeLabel?:string}){
 const [selectedId,setSelectedId]=useState(runs[0]?.id);
 const run=runs.find(r=>r.id===selectedId)??runs[0];
 if(!run)return null;
 const id='run:'+run.id;
 const scope=initialDashboardScope(runs,[],{resultIds:[id]},{privacy:loadDashboardScope()?.privacy??false});
 scope.timezone=run.timezone??'UTC';
 const source=dashboardSources([run],[],[],playbooks,scope).find(s=>s.id===id);
 const format=(n:number|null)=>scope.privacy?'Hidden':n===null||!Number.isFinite(n)?'—':new Intl.NumberFormat('en-US',{style:'currency',currency:scope.currency,maximumFractionDigits:2}).format(n);
 const saveHeader=<div className="mb-3 flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-semibold">Test complete · {runs.length} result{runs.length===1?'':'s'}</p><p role="status" className={'mt-1 flex items-center gap-1 text-xs '+(saved?'text-emerald-700':'text-amber-700')}>{saved?<><Check size={14}/>Saved to Saved runs</>:'Not saved — try saving again'}</p><p className="mt-1 text-[10px] text-slate-500">{saved?'Saved automatically in this browser.':'Browser storage was unavailable.'}</p></div><div className="flex flex-wrap gap-2">{!saved&&onSave&&<button type="button" className={btnPrimary} onClick={onSave}><Save size={14}/>Save results</button>}{onViewSavedRuns&&<button type="button" className={btnSecondary} onClick={onViewSavedRuns}><FolderOpen size={14}/>View saved runs</button>}</div></div>;
 return <DashboardResultPopup key={run.id} title="Test results" closeLabel={closeLabel} detailPicker={saveHeader} selection={{source:id,name:run.symbol+' · '+run.from+' to '+run.to}} source={source} rows={source?.rows??[]} scope={scope} format={format} valueOf={row=>row.net} onClose={onClose}
  resultPicker={<>{saveHeader}{onWhatIf&&<button type="button" className={btnSecondary+' mb-3'} onClick={()=>onWhatIf(run)}>Try a What-if</button>}{runs.length>1?<label className="block text-xs font-semibold">Result<select aria-label="Completed test result" value={run.id} onChange={e=>setSelectedId(e.target.value)} className={inputCls+' mt-1'}>{runs.map(r=><option key={r.id} value={r.id}>{playbooks.find(b=>b.id===r.playbookId)?.name??r.name} · {r.symbol} · {r.from} to {r.to}</option>)}</select></label>:<h2 className="text-lg font-bold">{run.name}</h2>}</>}/>
}

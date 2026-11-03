import React,{useState} from 'react';
import type {BacktestRun} from '../../backtest/store';
import type {JournalPlaybook} from '../../data/journalPlaybooks';
import {DashboardResultPopup} from './DashboardResultPopup';
import {dashboardSources,initialDashboardScope,loadDashboardScope} from './dashboardData';
import {Check,Save,FolderOpen} from 'lucide-react';
import {inputCls,btnPrimary,btnSecondary} from './ui';

/** Inspect this completed batch in place; keep dashboard filters and Lab drafts untouched. */
export function LabResultsDialog({runs,playbooks,saved,onClose,onSave,onViewSavedRuns,onWhatIf,closeLabel='Back to setup'}:{runs:BacktestRun[];playbooks:JournalPlaybook[];saved:boolean;onClose:()=>void;onSave?:()=>void;onViewSavedRuns?:()=>void;onWhatIf?:(run:BacktestRun)=>void;closeLabel?:string}){
 const [selectedId,setSelectedId]=useState((runs.find(run=>run.summary.trades>0)??runs[0])?.id);
 const run=runs.find(r=>r.id===selectedId)??runs[0];
 if(!run)return null;
 const id='run:'+run.id;
 const scope=initialDashboardScope(runs,[],{resultIds:[id]},{privacy:loadDashboardScope()?.privacy??false});
 scope.timezone=run.timezone??'UTC';
 const source=dashboardSources([run],[],[],playbooks,scope).find(s=>s.id===id);
 const format=(n:number|null)=>scope.privacy?'Hidden':n===null||!Number.isFinite(n)?'—':new Intl.NumberFormat('en-US',{style:'currency',currency:scope.currency,maximumFractionDigits:2}).format(n);
 const saveHeader=<div className="mb-3 flex flex-wrap items-start justify-between gap-3"><div><p className="text-sm font-bold">Test results · {runs.length} result{runs.length===1?'':'s'} <span className="ml-1 rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-700">Sample simulation</span></p><p role="status" className={'mt-1 flex items-center gap-1 text-xs '+(saved?'text-emerald-700':'text-amber-700')}>{saved?<><Check size={14}/>Saved to Saved runs</>:'Not saved · your test run is still available'}</p></div><div className="flex flex-wrap gap-2">{!saved&&onSave&&<button type="button" className={btnPrimary} onClick={onSave}><Save size={14}/>Save results</button>}{onViewSavedRuns&&<button type="button" className={btnSecondary} onClick={onViewSavedRuns}><FolderOpen size={14}/>View saved runs</button>}{onWhatIf&&<button type="button" className={btnSecondary} onClick={()=>onWhatIf(run)}>Try a What-if</button>}</div></div>;
 return <DashboardResultPopup key={run.id} layout="lab" title="Test results" closeLabel={closeLabel} selection={{source:id,name:run.symbol+' · '+run.from+' to '+run.to}} source={source} rows={source?.rows??[]} scope={scope} format={format} valueOf={row=>row.net} onClose={onClose}
  resultPicker={<>{saveHeader}{runs.length>1?<label className="block text-xs font-semibold">Result<select aria-label="Completed test result" value={run.id} onChange={e=>setSelectedId(e.target.value)} className={inputCls+' mt-1'}>{runs.map(r=><option key={r.id} value={r.id}>{playbooks.find(b=>b.id===r.playbookId)?.name??r.name} · {r.symbol} · {r.from} to {r.to}</option>)}</select></label>:null}</>}/>
}

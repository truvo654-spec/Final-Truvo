import React, { useEffect, useRef, useState } from 'react';
import type { JournalEntry, JournalChecklistItem, TradingStatus } from '../../types';
import type { JournalPlaybook } from '../../data/journalPlaybooks';
import { JOURNAL_EMOTIONS, JOURNAL_MISTAKES } from '../../data/journalData';
import { costsKnown, currencyOf, eligible, incompleteFields, rawNet, realizedR, resultOf, timestampMs } from './journalMath';
import { ReviewStateBadge, TradingStatusBadge, reviewStateOf, tradingStatusOf } from './tradingStatus';

interface Props { entry: JournalEntry; cohort: string[]; playbook?: JournalPlaybook; checklist?:JournalChecklistItem[]; onSelect:(id:string)=>void; onClose:()=>void; onSave:(e:JournalEntry)=>void; onDelete:(id:string)=>void; onReplay:()=>void }
export const JournalReviewDrawer: React.FC<Props> = ({entry,cohort,playbook,checklist=[],onSelect,onClose,onSave,onDelete,onReplay}) => {
  const dialog = useRef<HTMLDivElement>(null);
  const [draft,setDraft] = useState(entry);
  const [error,setError] = useState('');
  const errorNode = useRef<HTMLParagraphElement>(null);
  useEffect(()=>{if(error){errorNode.current?.focus();errorNode.current?.scrollIntoView({block:'nearest'});}},[error]);
  const [discard,setDiscard] = useState<null | (()=>void)>(null);
  const [confirmDelete,setConfirmDelete] = useState(false);
  const [fill,setFill] = useState({time:'',side:'entry' as 'entry'|'exit',quantity:'',price:'',fee:''});
  const dirty = JSON.stringify(draft)!==JSON.stringify(entry);
  const requestLeave = (action:()=>void) => dirty ? setDiscard(()=>action) : action();
  useEffect(() => {
    const prior = document.activeElement as HTMLElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow='hidden'; dialog.current?.focus();
    return () => { document.body.style.overflow=overflow; prior?.focus(); };
  },[]);
  useEffect(()=>{setDraft(entry);setError('');setDiscard(null);},[entry]);
  const patch = (v: Partial<JournalEntry>)=>setDraft(d=>({...d,...v}));
  const ruleVersion = playbook ? JSON.stringify(playbook.rules) : '';
  const evidence = draft.ruleEvidence || (playbook?.rules.map(r=>({ruleId:r.id,label:r.title,version:ruleVersion,effectiveAt:new Date().toISOString(),state:'unknown' as const,source:'user' as const})) || []);
  const currency = currencyOf(draft);
  const money = (v:number)=>new Intl.NumberFormat('en-US',{style:'currency',currency}).format(v);
  const pos = cohort.indexOf(entry.id);
  const save = (complete:boolean) => {
    if (draft.commission != null && (!Number.isFinite(draft.commission) || draft.commission<0)) return setError('Costs must be zero or a positive amount; leave blank if unknown.');
    if (draft.initialRisk != null && (!Number.isFinite(draft.initialRisk) || draft.initialRisk<=0)) return setError('Initial monetary risk must be positive, or left unknown.');
    if (draft.equityAtEntry != null && (!Number.isFinite(draft.equityAtEntry) || draft.equityAtEntry<=0)) return setError('Equity at entry must be positive, or left unknown.');
    if (tradingStatusOf(draft)==='closed' && (draft.pnlKnown===false || !Number.isFinite(draft.pnl))) return setError('A closed trade needs an explicitly reported gross result.');
    const missing = incompleteFields(draft);
    if (complete && missing.length) return setError(`Answer these before completing: ${missing.join(', ')}.`);
    const riskChanged=draft.initialRisk!==entry.initialRisk;
    onSave({...draft,reviewState:complete?'complete':'needs_review',ruleEvidence:evidence,
      riskHistory:riskChanged?[...(entry.riskHistory || []),{at:new Date().toISOString(),stop:draft.stopPrice ?? null,monetaryRisk:draft.initialRisk ?? null,reason:'User supplied initial-risk evidence during review'}]:draft.riskHistory});
    setError('');
  };
  const field='w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5338ec]/40';
  const button='rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold hover:bg-slate-50 disabled:opacity-40';
  const remaining=draft.fills?.reduce((a,f)=>a+(f.side==='entry'?f.quantity:-f.quantity),0);
  const addFill=()=>{
    if (!fill.time || !Number.isFinite(timestampMs(fill.time)) || !Number.isFinite(Number(fill.quantity)) || !Number.isFinite(Number(fill.price)) || !(Number(fill.quantity)>0) || !(Number(fill.price)>0) || (fill.fee!=='' && (!Number.isFinite(Number(fill.fee)) || !(Number(fill.fee)>=0)))) return setError('Execution needs a valid UTC time, positive quantity and price, and non-negative fee (or unknown).');
    if(draft.fills?.length && timestampMs(fill.time)<Math.max(...draft.fills.map(f=>timestampMs(f.time))))return setError('Add executions in UTC time order; do not append an exit before the recorded entries.');
    const nextRemaining=(remaining || 0)+(fill.side==='entry'?1:-1)*Number(fill.quantity);
    if (nextRemaining<0) return setError('An exit cannot exceed recorded entry quantity. Record the actual entries first.');
    patch({fills:[...(draft.fills || []),{id:crypto.randomUUID(),time:`${fill.time}Z`,side:fill.side,quantity:Number(fill.quantity),price:Number(fill.price),fee:fill.fee===''?null:Number(fill.fee)}]});
    setFill({time:'',side:'entry',quantity:'',price:'',fee:''});setError('');
  };
  return <div className="fixed inset-0 z-[70] bg-slate-900/35 flex justify-end" onClick={ev=>{if(ev.target===ev.currentTarget) requestLeave(onClose);}}>
    <div ref={dialog} role="dialog" aria-modal="true" aria-label={`Review ${entry.symbol}`} tabIndex={-1} className="w-full max-w-3xl h-full bg-[#FBFBFF] overflow-y-auto shadow-2xl outline-none" onKeyDown={ev=>{
      if(ev.key==='Escape'){ev.stopPropagation();requestLeave(onClose);}
      if(ev.key==='Tab'){const nodes=(Array.from(dialog.current!.querySelectorAll('button:not(:disabled),input,select,textarea,a[href]')) as HTMLElement[]).filter(e=>e.offsetParent!==null);const first=nodes[0],last=nodes[nodes.length-1]; if(ev.shiftKey && (document.activeElement===first || document.activeElement===dialog.current)){ev.preventDefault();last?.focus();}else if(!ev.shiftKey && document.activeElement===last){ev.preventDefault();first?.focus();}}
    }}>
      <header className="sticky top-0 z-10 bg-white border-b border-slate-200 p-4 flex flex-wrap items-center gap-2">
        <h2 className="text-lg font-bold mr-auto">Review {entry.symbol}</h2><span className="text-xs">{pos+1} / {cohort.length}</span>
        <button className={button} disabled={pos<=0} onClick={()=>requestLeave(()=>onSelect(cohort[pos-1]))}>Previous trade</button>
        <button className={button} disabled={pos<0 || pos>=cohort.length-1} onClick={()=>requestLeave(()=>onSelect(cohort[pos+1]))}>Next trade</button>
        <button className={button} onClick={()=>requestLeave(onClose)}>Close review</button>
      </header>
      <div className="p-4 sm:p-6 space-y-5">
        {discard && <div role="alert" className="p-3 bg-amber-50 rounded-xl text-sm">You have unsaved edits. <button className={button} onClick={()=>{const action=discard;setDiscard(null);action();}}>Discard and leave</button> <button className={button} onClick={()=>setDiscard(null)}>Keep editing</button></div>}
        {error && <p ref={errorNode} tabIndex={-1} role="alert" className="text-sm text-rose-700">{error}</p>}
        <section className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
          <div className="flex flex-wrap gap-2"><TradingStatusBadge status={tradingStatusOf(draft)}/><ReviewStateBadge state={reviewStateOf(draft)}/><span className="text-xs">{draft.date} · {draft.direction} · {draft.strategy} · {currency}</span></div>
          <p className="font-mono font-bold">{eligible(draft)?`${money(rawNet(draft))} net · ${resultOf(draft)}`:'Realized net result unavailable'} · {realizedR(draft)==null?'R unknown':`${realizedR(draft)!.toFixed(2)}R`}</p>
          <p className="text-xs text-slate-500">{draft.accountId || 'Legacy demo account'} · {draft.size} {draft.quantityUnit || 'quantity units not recorded'} · entry {draft.entryPrice} · exit {draft.exitPrice ?? 'unknown'} · stop {draft.stopPrice ?? 'unknown'} · planned R {draft.plannedR ?? 'unknown'}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="text-xs font-semibold">Trading status<select className={field} value={tradingStatusOf(draft)} onChange={ev=>patch({tradingStatus:ev.target.value as TradingStatus,...(ev.target.value==='closed' && tradingStatusOf(draft)!=='closed' && draft.pnlKnown!==true?{pnlKnown:false}:{})})}><option value="planned">Planned</option><option value="open">Open</option><option value="closed">Closed</option></select></label>
            <label className="text-xs font-semibold">Reported gross P&amp;L<input className={field} type="number" step="any" value={draft.pnlKnown===false?'':draft.pnl} onChange={ev=>patch({pnlKnown:ev.target.value!=='',pnl:ev.target.value===''?0:Number(ev.target.value)})}/></label>
            <label className="text-xs font-semibold">Total costs (fees, commissions, swaps)<input className={field} type="number" min="0" step="any" placeholder="Unknown; enter 0 only if confirmed" value={draft.commission ?? ''} onChange={ev=>patch({commission:ev.target.value===''?undefined:Number(ev.target.value)})}/></label>
            <label className="text-xs font-semibold">Initial monetary risk ({currency})<input className={field} type="number" min="0" step="any" placeholder="Unknown" value={draft.initialRisk ?? ''} onChange={ev=>patch({initialRisk:ev.target.value===''?null:Number(ev.target.value)})}/></label>
            <label className="text-xs font-semibold">Equity at entry ({currency})<input className={field} type="number" min="0" step="any" placeholder="Unknown; needed for risk %" value={draft.equityAtEntry ?? ''} onChange={ev=>patch({equityAtEntry:ev.target.value===''?null:Number(ev.target.value)})}/></label>
          </div>
          <p className="text-xs text-slate-500">Gross results are source/user reported. No contract multipliers or currency conversions are assumed. R is net ÷ initial monetary risk when known; otherwise a preserved reported R is used.</p>
        </section>
        <section className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
          <h3 className="font-bold text-sm">Psychology and review</h3>
          <div className="grid sm:grid-cols-2 gap-3">{(['emotionBefore','emotionAfter'] as const).map((key,i)=><label key={key} className="text-xs font-semibold">{i===0?'Before emotion':'After emotion'}<select className={field} value={draft[key] || ''} onChange={ev=>patch({[key]:ev.target.value || null} as Partial<JournalEntry>)}><option value="">Unanswered</option>{JOURNAL_EMOTIONS.map(e=><option key={e}>{e}</option>)}</select></label>)}
          <label className="text-xs font-semibold">Plan adherence<select className={field} value={draft.followedPlan==null?'':String(draft.followedPlan)} onChange={ev=>patch({followedPlan:ev.target.value===''?null:ev.target.value==='true'})}><option value="">Unanswered</option><option value="true">Followed</option><option value="false">Broken</option></select></label>
          <label className="text-xs font-semibold">Execution rating<select className={field} value={draft.rating ?? ''} onChange={ev=>patch({rating:ev.target.value===''?null:Number(ev.target.value)})}><option value="">Unanswered</option>{[1,2,3,4,5].map(n=><option key={n}>{n}</option>)}</select></label></div>
          <label className="block text-xs font-semibold">Lesson / linked notes<textarea className={field} rows={3} value={draft.lessons} onChange={ev=>patch({lessons:ev.target.value})}/></label>
          <details><summary className="text-xs font-semibold cursor-pointer">Mistakes and setup notes</summary><p className="text-sm mt-2">{draft.setupNotes || 'No setup notes'}</p><div className="flex flex-wrap gap-2 mt-2">{JOURNAL_MISTAKES.map(m=><label key={m} className="text-xs"><input type="checkbox" checked={draft.mistakes.includes(m)} onChange={()=>patch({mistakes:draft.mistakes.includes(m)?draft.mistakes.filter(x=>x!==m):[...draft.mistakes,m],mistakesReviewed:true})}/> {m}</label>)}</div><label className="block text-xs mt-3"><input type="checkbox" checked={draft.mistakesReviewed===true} onChange={ev=>patch({mistakesReviewed:ev.target.checked})}/> Mistakes checked (including none)</label></details>
        </section>
        <section className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3"><h3 className="font-bold text-sm">Rule evidence</h3><p className="text-xs text-slate-500">{draft.ruleEvidence?'Recorded rule snapshot; later playbook edits do not change it.':'Current rules, not historical proof. Save creates a review-time snapshot; unanswered rules stay unknown.'}</p>{evidence.length===0?<p className="text-xs">No rule evidence available.</p>:evidence.map((r,i)=><label key={`${r.ruleId}-${i}`} className="flex items-center justify-between gap-3 text-xs"><span>{r.label}</span><select aria-label={`Rule ${r.label}`} className={field+' max-w-40'} value={r.state} onChange={ev=>patch({ruleEvidence:evidence.map((x,j)=>j===i?{...x,state:ev.target.value as typeof r.state}:x)})}><option value="unknown">Unknown</option><option value="pass">Followed</option><option value="fail">Broken</option><option value="not_applicable">Not applicable</option></select></label>)}</section>
        <details className="bg-white border border-slate-200 rounded-2xl p-5"><summary className="font-bold text-sm cursor-pointer">Execution ledger and risk history</summary><p className="text-xs text-slate-500 my-3">Legacy aggregate prices are not invented fills. Ledger quantities are evidence only; reported P&amp;L is not recalculated without valuation metadata.</p>
          <div className="overflow-x-auto"><table className="w-full text-xs"><caption className="text-left">Recorded fills · remaining {remaining==null?'unknown':remaining} {draft.quantityUnit || 'units'}</caption><thead><tr>{['UTC time','Side','Quantity','Price',`Fee (${currency})`].map(h=><th key={h} className="text-left p-2">{h}</th>)}</tr></thead><tbody>{draft.fills?.map(f=><tr key={f.id}>{[f.time,f.side,f.quantity,f.price,f.fee ?? 'Unknown'].map((v,i)=><td key={i} className="p-2">{v}</td>)}</tr>)}</tbody></table></div>
          {tradingStatusOf(draft)==='closed' && remaining!=null && remaining>0 && <p className="text-xs text-amber-700 mt-2">Reported status is Closed, but this ledger has remaining quantity. Execution evidence is incomplete; reported P&amp;L remains the source of truth.</p>}
          <div className="grid sm:grid-cols-2 gap-2 mt-3"><label className="text-xs">Fill UTC time<input className={field} type="datetime-local" value={fill.time} onChange={ev=>setFill(f=>({...f,time:ev.target.value}))}/></label><label className="text-xs">Fill side<select className={field} value={fill.side} onChange={ev=>setFill(f=>({...f,side:ev.target.value as 'entry'|'exit'}))}><option value="entry">Entry</option><option value="exit">Exit / partial close</option></select></label>{(['quantity','price','fee'] as const).map(k=><label key={k} className="text-xs">Fill {k}<input className={field} type="number" step="any" value={fill[k]} onChange={ev=>setFill(f=>({...f,[k]:ev.target.value}))}/></label>)}</div><button className={button+' mt-3'} onClick={addFill}>Add execution evidence</button>
          <ul className="text-xs mt-3 space-y-1">{draft.riskHistory?.map((r,i)=><li key={i}>{r.at} · stop {r.stop ?? 'unknown'} · risk {r.monetaryRisk ?? 'unknown'} · {r.reason}</li>)}</ul>
        </details>
        <section className="bg-white border border-slate-200 rounded-2xl p-5"><h3 className="font-bold text-sm">Pre-trade checklist</h3><p className="text-xs text-slate-500 mt-1">Checked items are recorded positives. Unchecked legacy items are unanswered, not proven failures.</p><div className="space-y-2 mt-3">{checklist.map(c=><label key={c.id} className="block text-xs"><input type="checkbox" checked={draft.checklistDone.includes(c.id)} onChange={()=>patch({checklistDone:draft.checklistDone.includes(c.id)?draft.checklistDone.filter(x=>x!==c.id):[...draft.checklistDone,c.id]})}/> {c.label}</label>)}</div></section>
        <label className="block text-xs font-semibold">Attach chart image (local, up to 3 MB)<input className={field} type="file" accept="image/png,image/jpeg,image/webp" onChange={ev=>{const file=ev.target.files?.[0];if(!file)return;if(file.size>3*1024*1024 || !['image/png','image/jpeg','image/webp'].includes(file.type))return setError('Use a PNG, JPEG or WebP image up to 3 MB.');const reader=new FileReader();reader.onload=()=>patch({screenshot:String(reader.result)});reader.readAsDataURL(file);}}/></label>
        {draft.screenshot && <img src={draft.screenshot} alt={`Recorded chart for ${draft.symbol}`} className="rounded-xl w-full border border-slate-200"/>}
        <div className="flex flex-wrap gap-2"><button className={button} onClick={()=>save(false)}>Save review draft</button><button className="rounded-lg bg-[#5338ec] text-white px-3 py-2 text-xs font-semibold" onClick={()=>save(true)}>Complete review</button><button className={button} disabled={dirty || reviewStateOf(entry)!=='complete'} onClick={()=>onSave({...entry,reviewState:'needs_review'})}>Reopen review</button><button className={button} onClick={()=>{setDraft(entry);setError('');}}>Cancel edits</button><button className={button} onClick={()=>requestLeave(onReplay)}>Replay blind</button><button className={button} onClick={()=>setConfirmDelete(true)}>Delete entry</button></div>
        {confirmDelete && <p role="alert" className="text-sm">Delete this entry? <button className={button} onClick={()=>onDelete(entry.id)}>Confirm delete</button> <button className={button} onClick={()=>setConfirmDelete(false)}>Keep entry</button></p>}
        <p className="text-xs text-slate-500">Missing: {incompleteFields(draft).join(', ') || 'review prerequisites answered'}. Review completion does not change trading status.</p>
      </div>
    </div>
  </div>;
};

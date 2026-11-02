import React,{useContext,useEffect,useMemo,useRef,useState} from 'react';
import {ArrowRight,Check} from 'lucide-react';
import type {JournalEntry} from '../../types';
import type {JournalPlaybook} from '../../data/journalPlaybooks';
import type {JournalRules} from '../../backtest/rules';
import type {BacktestRun,WhatIfRun} from '../../backtest/store';
import {loadWhatIfs,saveWhatIfs} from '../../backtest/store';
import {makeSavedWhatIf,savedWhatIfKey,whatIfSaveKey} from '../../backtest/savedWhatIf';
import {compareParameters} from '../../backtest/whatifOptimizer';
import {describeWhatIf,ESTIMATED_RULES,runWhatIf,type WhatIfRule,type WhatIfTrade} from '../../backtest/whatif';
import {quickWhatIfDefaults,quickWhatIfSource,filterWhatIfEntries,whatIfMarket,WHAT_IF_MARKETS,quickWhatIfAlternatives} from '../../backtest/whatifQuick';
import {JournalCurrency,formatMoney} from '../journal/JournalCurrency';
import {WhatIfResults} from './WhatIfResults';
import {WhatIfAdvancedPanel} from './WhatIfAdvancedPanel';
import {Card,Field,Modal,Pill,btnPrimary,btnSecondary,inputCls,Segmented} from './ui';

interface Props{
 entries:JournalEntry[];allEntries:JournalEntry[];initialPlaybookId?:string;initialRunId?:string;runs?:BacktestRun[];
 playbooks:JournalPlaybook[];journalRules:JournalRules;tz:string;onToast:(message:string)=>void;
 onOpenTrades:(ids:string[],label:string)=>void;onAddRule:(kind:'rule'|'checklist',label:string,patch?:Partial<JournalRules>)=>void;
 onSaveScenario?:(run:WhatIfRun)=>boolean;onViewSaved?:()=>void;
}
const choices:{kind:WhatIfRule['kind'];title:string;hint:string}[]=[
 {kind:'lossesPerDay',title:'Stop after daily losses',hint:'Use your saved loss limit.'},
 {kind:'hours',title:'Trade only during my session',hint:'Use the session from your setup.'},
 {kind:'mistakes',title:'Skip tagged mistakes',hint:'Start with your most common mistakes.'},
 {kind:'target',title:'Change my target',hint:'Try a different reward for each unit of risk.'},
];
const emptyFilters={from:'',to:'',symbol:'',side:'',market:'',tradeIds:null as string[]|null};
type SourceKind='log'|'book'|'run';
const sourceKind=(key:string):SourceKind=>key.startsWith('book:')?'book':key.startsWith('run:')?'run':'log';
export const WhatIfPanel:React.FC<Props>=({entries,allEntries,initialPlaybookId='',initialRunId='',runs=[],playbooks,journalRules,tz,onToast,onOpenTrades,onAddRule,onSaveScenario,onViewSaved})=>{
 const journalCurrency=useContext(JournalCurrency);
 const [scope,setScope]=useState({key:initialRunId?'run:'+initialRunId:initialPlaybookId?'book:'+initialPlaybookId:'selection',...emptyFilters});
 const [pending,setPending]=useState(scope);
 const source=useMemo(()=>quickWhatIfSource(scope.key,entries,allEntries,playbooks,runs,journalCurrency),[scope.key,entries,allEntries,playbooks,runs,journalCurrency]);
 const picked=useMemo(()=>filterWhatIfEntries(source.entries,scope),[source.entries,scope]);
 const pendingSource=quickWhatIfSource(pending.key,entries,allEntries,playbooks,runs,journalCurrency);
 const matching=filterWhatIfEntries(pendingSource.entries,{...pending,tradeIds:null});
 const pendingPicked=filterWhatIfEntries(pendingSource.entries,pending);
 const pendingSymbols=[...new Set(pendingSource.entries.filter(e=>!pending.market||whatIfMarket(e)===pending.market).map(e=>e.symbol))].sort();
 const marketOptions=[...new Set([...WHAT_IF_MARKETS,...pendingSource.entries.map(whatIfMarket)])].filter(m=>m!=='Futures');
 useEffect(()=>{
  if(pending.market==='Futures')setPending(p=>({...p,market:'',symbol:'',tradeIds:null}));
  if(scope.market==='Futures')setScope(p=>({...p,market:'',symbol:'',tradeIds:null}));
 },[pending.market,scope.market]);
 const activeBooks=playbooks.filter(b=>b.status!=='archived');
 const defaults=quickWhatIfDefaults(source.book,source.run,journalRules);
 const [params,setParams]=useState({...defaults,tags:[] as string[]});
 const [kind,setKind]=useState<WhatIfRule['kind']>('lossesPerDay');
 const [dialog,setDialog]=useState<'source'|'result'|'trades'|null>(null);
 const [returnToResult,setReturnToResult]=useState(false);
 const [changedOnly,setChangedOnly]=useState(false);
 const [selectedAlternative,setSelectedAlternative]=useState<string|null>(null);
 const [advancedOpen,setAdvancedOpen]=useState(false);
 const [advancedVisited,setAdvancedVisited]=useState(false);
 const [reviewRows,setReviewRows]=useState<WhatIfTrade[]|null>(null);
 const [reviewLabel,setReviewLabel]=useState('');
 const [selectableTrades,setSelectableTrades]=useState<WhatIfTrade[]>([]);
 const [tradeSelection,setTradeSelection]=useState<string[]>([]);
 const popupScroll=useRef<HTMLDivElement>(null);
 const analysisMode=(open:boolean)=>{setAdvancedOpen(open);if(open)setAdvancedVisited(true);popupScroll.current?.scrollTo({top:0});};
 const [savedKeys,setSavedKeys]=useState(()=>loadWhatIfs().map(savedWhatIfKey));
 const cohortKey=picked.map(e=>e.id).join('|');
 useEffect(()=>{
  const counts=new Map<string,number>();picked.forEach(e=>e.mistakes.forEach(t=>counts.set(t,(counts.get(t)??0)+1)));
  setParams({...quickWhatIfDefaults(source.book,source.run,journalRules),tags:[...counts].sort((a,b)=>b[1]-a[1]).slice(0,2).map(([tag])=>tag)});
 },[scope.key,cohortKey,source.book,source.run,journalRules]);
 const rule:WhatIfRule=kind==='lossesPerDay'?{kind,n:params.n}:kind==='hours'?{kind,start:params.start,end:params.end}:kind==='mistakes'?{kind,tags:params.tags}:kind==='target'?{kind,r:params.target}:kind==='breakeven'?{kind,r:params.be}:kind==='stop'?{kind,mult:params.stop}:{kind:'dailyLoss',usd:params.usd};
 const rows=useMemo(()=>compareParameters(picked,quickWhatIfAlternatives(rule)),[picked,JSON.stringify(rule)]);
 const row=rows.find(r=>r.id===selectedAlternative)??rows[0];
 const out=row.output;
 const valid=kind==='mistakes'?params.tags.length>0:kind==='hours'?Number.isFinite(params.start)&&Number.isFinite(params.end)&&params.start!==params.end:kind==='lossesPerDay'?Number.isInteger(params.n)&&params.n>0:kind==='target'?Number.isFinite(params.target)&&params.target>0:kind==='breakeven'?Number.isFinite(params.be)&&params.be>0:kind==='stop'?params.stop>0&&params.stop<=1:Number.isFinite(params.usd)&&params.usd>0;
 const tags=[...new Set(picked.flatMap(e=>[...e.mistakes,...e.tags]))].sort();
 const currency=source.currency;
 const money=(n:number)=>Number.isFinite(n)?formatMoney(n,currency,2):'—';
 const dates=picked.map(e=>e.date).sort();
 const title=row.rule.kind==='dailyLoss'?`Stop after ${money(row.rule.usd)} daily loss`:describeWhatIf(row.rule);
 const estimate=ESTIMATED_RULES.includes(kind);
 const changed=out.trades.filter(t=>t.status!=='same');
 const context={currency,source:row.id===rows[0].id?'user' as const:'parameter' as const,goal:'net' as const,benchmark:source.label,scope:{'Source':scope.key,'Market':scope.market||'All markets','From':scope.from||dates[0]||'','To':scope.to||dates.at(-1)||'','Trade IDs':picked.map(e=>e.id).sort().join(','),'Data':source.run?'Sample simulation':'Journal'}};
 const saveKey=whatIfSaveKey(row.rule,context,out);
 const saved=savedKeys.includes(saveKey);
 const save=()=>{if(saved)return;const run=makeSavedWhatIf(row,context,title);const ok=onSaveScenario?onSaveScenario(run):saveWhatIfs([run,...loadWhatIfs()]);if(ok){setSavedKeys(keys=>[...keys,saveKey]);onToast('What-if result saved to Saved runs');}else onToast('Could not save. Please try again.');};
 const showTrades=(fromResult:boolean,onlyChanged=false)=>{
  if(!fromResult){
   setSelectableTrades(runWhatIf(filterWhatIfEntries(source.entries,{...scope,tradeIds:null}),rule).trades);
   setTradeSelection(picked.map(t=>t.id));
  }
  setReviewRows(null);setReviewLabel('');setReturnToResult(fromResult);setChangedOnly(onlyChanged);setDialog('trades');
 };
 const chooseSource=(type:SourceKind)=>{setPending(sourceKind(scope.key)===type?scope:{key:type==='log'?'history':type==='book'?'book:'+(activeBooks[0]?.id??''):'run:'+(runs[0]?.id??''),...emptyFilters});setDialog('source');};
 const changeSource=()=>{setPending(scope);setDialog('source');};
 const switchSource=(type:SourceKind)=>setPending({key:type==='log'?'history':type==='book'?'book:'+(activeBooks[0]?.id??''):'run:'+(runs[0]?.id??''),...emptyFilters});
 const tableRows=!returnToResult?selectableTrades:reviewRows??(changedOnly?changed:out.trades);
 return <JournalCurrency.Provider value={currency as React.ContextType<typeof JournalCurrency>}><div className="space-y-5 min-w-0">
  <Card title="What if I changed one thing?" sub="Use your saved trades. Try one change. See the difference.">
   <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Choose What-if source">{([{id:'log',label:'Trade Log'},{id:'book',label:'Playbook'},{id:'run',label:'Saved tests'}] as const).map(s=><button type="button" key={s.id} className={btnSecondary+(sourceKind(scope.key)===s.id?' border-[#5338ec] bg-[#F6F3FF] text-[#5338ec]':'')} aria-pressed={sourceKind(scope.key)===s.id} disabled={s.id==='book'?!activeBooks.length:s.id==='run'?!runs.length:false} onClick={()=>chooseSource(s.id)}>{s.label}</button>)}</div>
   <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-[#F8F7FF] p-4">
    <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="font-semibold text-sm">{source.label}</p><Pill tone={source.run?'info':'neutral'}>{source.run?'Sample simulation':'Journal'}</Pill></div><p className="mt-1 text-xs text-slate-500">{picked.length} closed trade{picked.length===1?"":"s"} · {dates.length?`${dates[0]} → ${dates.at(-1)}`:'No matching dates'} · {currency} · {scope.market||'All markets'}</p>{source.run&&<p className="mt-1 text-xs text-slate-500">{source.run.timeframe} · Saved test settings loaded</p>}</div>
    <div className="flex gap-2"><button className={btnSecondary} onClick={()=>showTrades(false)} disabled={!picked.length}>View trades</button><button className={btnSecondary} onClick={changeSource}>Change</button></div>
   </div>
   {source.excluded>0&&<p className="mt-2 text-xs text-slate-500">{source.excluded} records excluded: open, unknown net result, or another currency.</p>}
   {source.book?.directions?.length===1&&<p className="mt-2 text-xs text-slate-500">{source.book.name} · {source.book.directions[0]} trades</p>}
  </Card>
  <Card title="Choose one change">
   <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" role="group" aria-label="What to change">{choices.map(c=><button key={c.kind} type="button" aria-pressed={kind===c.kind} onClick={()=>setKind(c.kind)} className={`rounded-xl border p-4 text-left transition-colors ${kind===c.kind?'border-[#5338ec] bg-[#F6F3FF]':'border-[#CCC6FB] hover:bg-slate-50'}`}><span className="flex items-start justify-between gap-2 text-sm font-semibold">{c.title}{kind===c.kind&&<Check size={16} className="shrink-0 text-[#5338ec]"/>}</span><span className="mt-2 block text-xs text-slate-500">{c.hint}</span>{c.kind==='target'&&<span className="mt-2 inline-block text-[10px] font-semibold text-amber-700">Estimated</span>}</button>)}</div>
   <div className="mt-5 flex flex-wrap items-center gap-3 rounded-xl bg-slate-50 p-4">
    {kind==='lossesPerDay'&&<><span className="text-sm">Stop after</span><Segmented label="Daily loss count" value={String(params.n)} onChange={v=>setParams(p=>({...p,n:Number(v)}))} options={[...new Set([1,2,3,params.n])].map(n=>({id:String(n),label:String(n)}))}/><span className="text-sm">losses in a day</span><span className="text-xs text-slate-500">From your trading rules</span></>}
    {kind==='hours'&&<><span className="text-sm font-semibold">Trading session · UTC</span><label className="text-xs">From<select aria-label="Session start UTC" className={inputCls} value={params.start} onChange={e=>setParams(p=>({...p,start:Number(e.target.value)}))}>{Array.from({length:24},(_,h)=><option key={h} value={h}>{String(h).padStart(2,'0')}:00</option>)}</select></label><label className="text-xs">To<select aria-label="Session end UTC" className={inputCls} value={params.end} onChange={e=>setParams(p=>({...p,end:Number(e.target.value)}))}>{Array.from({length:24},(_,i)=>i+1).map(h=><option key={h} value={h}>{h===24?'24:00':String(h).padStart(2,'0')+':00'}</option>)}</select></label><span className="text-xs text-slate-500">{source.book||source.run?'Loaded from your setup':'Suggested session · editable'}</span></>}
    {kind==='mistakes'&&(tags.length?<div className="flex flex-wrap gap-2">{tags.map(t=><button key={t} className={btnSecondary} aria-pressed={params.tags.includes(t)} onClick={()=>setParams(p=>({...p,tags:p.tags.includes(t)?p.tags.filter(x=>x!==t):[...p.tags,t]}))}>{params.tags.includes(t)&&<Check size={14}/>} {t}</button>)}</div>:<p className="text-sm text-slate-500">These trades have no mistake tags. Choose another change.</p>)}
    {kind==='target'&&<><span className="text-sm">Take profit at</span><Segmented label="Target presets" value={String(params.target)} onChange={v=>setParams(p=>({...p,target:Number(v)}))} options={[...new Set([1,1.5,2,3,defaults.target])].sort((a,b)=>a-b).map(n=>({id:String(n),label:n+'R'}))}/><label className="text-xs">Custom R<input aria-label="Custom target R" type="number" min="0.1" step="0.1" className={inputCls+' max-w-24'} value={params.target} onChange={e=>setParams(p=>({...p,target:Number(e.target.value)}))}/></label></>}
   </div>
   <div className="mt-5 flex flex-wrap items-center justify-between gap-3"><p className="text-xs text-slate-500">{estimate?'Estimated using reconstructed price paths.':'Compare the same trades with one rule changed.'}</p><button className={btnPrimary} disabled={!picked.length||!valid} onClick={()=>{setSelectedAlternative(null);setAdvancedOpen(false);setAdvancedVisited(false);setDialog('result');}}>See results<ArrowRight size={16}/></button></div>
   {!picked.length&&<p role="status" className="mt-3 text-sm text-slate-500">No eligible trades in this selection. <button className="font-semibold text-[#5338ec]" onClick={changeSource}>Choose your data</button></p>}
  </Card>
  <Modal open={dialog!==null} onClose={()=>setDialog(null)} title={dialog==='source'?'Choose your data':dialog==='trades'?'Trades in this comparison':'What-if results'} width={dialog==='source'?'max-w-2xl':'max-w-6xl'}>
   <div ref={popupScroll} className="max-h-[80vh] overflow-y-auto pr-2">
   {dialog==='source'&&<>
    <h2 className="mb-4 text-lg font-bold">Choose your data</h2>
    <Segmented label="Data source type" value={sourceKind(pending.key)} onChange={switchSource} options={[{id:'log',label:'Trade Log'},{id:'book',label:'Playbook'},{id:'run',label:'Saved tests'}]} disabled={{book:activeBooks.length?undefined:'No playbooks yet',run:runs.length?undefined:'No saved tests yet'}}/>
    <label className="mt-4 block text-sm font-semibold">{sourceKind(pending.key)==='book'?'Choose a playbook':sourceKind(pending.key)==='run'?'Choose a saved test':'Choose Trade Log data'}
     <select aria-label="What-if data source" className={inputCls+' mt-2'} value={pending.key} onChange={e=>setPending({key:e.target.value,...emptyFilters})}>
      {sourceKind(pending.key)==='log'&&<><option value="selection">Current journal selection ({entries.length})</option><option value="history">All Trade Log trades · {journalCurrency}</option></>}
      {sourceKind(pending.key)==='book'&&activeBooks.map(b=><option key={b.id} value={'book:'+b.id}>{b.name}</option>)}
      {sourceKind(pending.key)==='run'&&runs.map(r=><option key={r.id} value={'run:'+r.id}>{r.name} · {r.symbol} · {r.from} to {r.to}</option>)}
     </select>
    </label>
    <div className="mt-4 grid gap-3 sm:grid-cols-3">
     <Field label="Market type" htmlFor="quick-wi-market"><select id="quick-wi-market" className={inputCls} value={pending.market} onChange={e=>setPending(p=>({...p,market:e.target.value,symbol:'',tradeIds:null}))}><option value="">All markets</option>{marketOptions.map(m=><option key={m}>{m}</option>)}</select></Field>
     <Field label="Instrument" htmlFor="quick-wi-symbol"><select id="quick-wi-symbol" className={inputCls} value={pending.symbol} onChange={e=>setPending(p=>({...p,symbol:e.target.value,tradeIds:null}))}><option value="">All instruments</option>{pendingSymbols.map(s=><option key={s}>{s}</option>)}</select></Field>
     <Field label="Direction" htmlFor="quick-wi-side"><select id="quick-wi-side" className={inputCls} value={pending.side} onChange={e=>setPending(p=>({...p,side:e.target.value,tradeIds:null}))}><option value="">Both directions</option><option value="BUY">Long</option><option value="SELL">Short</option></select></Field>
    </div>
    <details className="mt-3 rounded-lg border border-[#CCC6FB] p-3"><summary className="cursor-pointer text-xs font-semibold">Dates · {pending.from||'First included trade'} → {pending.to||'Latest included trade'}</summary><div className="mt-3 grid gap-3 sm:grid-cols-2"><Field label="From entry date" htmlFor="quick-wi-from"><input id="quick-wi-from" type="date" className={inputCls} value={pending.from} onChange={e=>setPending(p=>({...p,from:e.target.value,tradeIds:null}))}/></Field><Field label="To entry date" htmlFor="quick-wi-to"><input id="quick-wi-to" type="date" className={inputCls} min={pending.from} value={pending.to} onChange={e=>setPending(p=>({...p,to:e.target.value,tradeIds:null}))}/></Field></div></details>
    <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs"><label className="flex items-center gap-2 font-semibold"><input type="checkbox" aria-label="Select all matching trades" checked={matching.length>0&&pendingPicked.length===matching.length} disabled={!matching.length} onChange={e=>setPending(p=>({...p,tradeIds:e.target.checked?null:[]}))}/>All {matching.length} matching trades</label><span role="status">{pendingPicked.length} selected · {pendingSource.currency} · {pendingSource.run?'Sample simulation':'Journal'}</span></div>
    <div className="mt-2 max-h-48 overflow-y-auto rounded-xl border border-[#CCC6FB]" role="group" aria-label="Select trades for What-if">
     {matching.map(e=><label key={e.id} className="flex cursor-pointer items-start gap-3 border-b border-[#CCC6FB] p-3 last:border-b-0 hover:bg-[#F8F7FF]"><input type="checkbox" className="mt-1 accent-[#5338ec]" aria-label={'Include '+e.symbol+' '+e.date+' '+e.id} checked={pending.tradeIds===null||pending.tradeIds.includes(e.id)} onChange={event=>{const checked=event.target.checked;setPending(p=>{const ids=p.tradeIds??matching.map(t=>t.id);return {...p,tradeIds:checked?[...new Set([...ids,e.id])]:ids.filter(id=>id!==e.id)};});}}/><span className="min-w-0 text-xs"><span className="font-semibold">{e.symbol} · {e.direction==='BUY'?'Long':'Short'}</span><span className="mt-1 block text-slate-500">{e.date} · {e.strategy} · {whatIfMarket(e)}</span></span></label>)}
     {!matching.length&&<p className="p-4 text-sm text-slate-500">No eligible trades match. Choose another market or data source.</p>}
    </div>
    <div className="sticky bottom-0 z-10 mt-4 flex items-center justify-end gap-2 border-t border-[#CCC6FB] bg-white py-3"><button className={btnSecondary} onClick={()=>setDialog(null)}>Cancel</button><button className={btnPrimary} disabled={!pendingPicked.length||(!!pending.from&&!!pending.to&&pending.from>pending.to)} onClick={()=>{setScope({...pending,tradeIds:pending.tradeIds===null?null:[...pending.tradeIds]});setDialog(null);}}>Use {pendingPicked.length} trade{pendingPicked.length===1?'':'s'}</button></div>
   </>}
   {(dialog==='result'||(dialog==='trades'&&returnToResult))&&<div hidden={dialog!=='result'}>
    <div hidden={advancedOpen}><WhatIfResults onAdvanced={()=>analysisMode(true)} rows={rows} selected={row} onSelect={setSelectedAlternative} currency={currency} summary={source.label+' · '+picked.length+' trades · '+currency+' · '+(scope.market||'All markets')+' · '+(dates[0]??'')+' → '+(dates.at(-1)??'')} simulation={!!source.run} saved={saved} onSave={save} onTrades={()=>showTrades(true,true)} onClose={()=>setDialog(null)} onViewSaved={onViewSaved?()=>{setDialog(null);onViewSaved();}:undefined}/></div>
    {advancedVisited&&<section hidden={!advancedOpen} aria-label="Advanced What-if analysis">
     <header className="sticky top-0 z-20 mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-[#CCC6FB] bg-white pb-4 pr-7"><div><h2 className="text-lg font-bold">Advanced analysis</h2><p className="mt-1 text-xs text-slate-500">{source.label} · {picked.length} trades · {currency} · {scope.market||'All markets'}</p></div><button type="button" className={btnSecondary} onClick={()=>analysisMode(false)}>Back to results</button></header>
     <WhatIfAdvancedPanel key={row.id} fixedScope benchmarkLabel={(source.run?'Sample simulation · ':'Journal · ')+source.label} benchmarkScope={context.scope} initialValues={params} initialRule={row.rule} entries={picked} allEntries={picked} playbooks={[]} journalRules={journalRules} tz={tz} onToast={onToast} onAddRule={onAddRule} onOpenTrades={onOpenTrades} onReviewTrades={(trades,label)=>{setReviewRows(trades);setReviewLabel(label);setChangedOnly(false);setReturnToResult(true);setDialog('trades');}} onSaveScenario={onSaveScenario} onViewSaved={onViewSaved?()=>{setDialog(null);onViewSaved();}:undefined}/>
    </section>}
   </div>}
   {dialog==='trades'&&<>
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 pr-5"><div><h2 className="text-lg font-bold">{reviewRows?'Advanced comparison trades':changedOnly?'Changed trades':'Trades in this comparison'}</h2><p className="mt-1 text-xs text-slate-500">{reviewLabel||source.label} · {currency}</p></div>{returnToResult&&<button className={btnSecondary} onClick={()=>setDialog('result')}>Back to result</button>}</div>
    {!returnToResult&&<div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs">
     <label className="flex cursor-pointer items-center gap-2 font-semibold"><input type="checkbox" className="accent-[#5338ec]" aria-label="Select all comparison trades" ref={el=>{if(el)el.indeterminate=tradeSelection.length>0&&tradeSelection.length<tableRows.length;}} checked={tableRows.length>0&&tradeSelection.length===tableRows.length} disabled={!tableRows.length} onChange={e=>setTradeSelection(e.target.checked?tableRows.map(t=>t.id):[])}/>Select all</label>
     <span role="status">{tradeSelection.length} of {tableRows.length} selected</span>
    </div>}
    <div className="overflow-x-auto max-h-[55vh]"><table className="w-full min-w-[620px] text-xs"><thead className="sticky top-0 bg-slate-50"><tr>
     {!returnToResult&&<th className="w-10 p-3 text-left"><span className="sr-only">Include in What-if</span></th>}
     {['Entry · UTC','Instrument','Side','Playbook','Original',...(returnToResult?['What-if','Change']:[])].map(h=><th className="p-3 text-left" key={h}>{h}</th>)}
    </tr></thead><tbody>{tableRows.map(t=><tr key={t.id} className={'border-t border-[#CCC6FB]'+(!returnToResult&&tradeSelection.includes(t.id)?' bg-[#F8F7FF]':'')}>
     {!returnToResult&&<td className="p-3"><input type="checkbox" className="accent-[#5338ec]" aria-label={'Include '+t.symbol+' '+new Date(t.entryTime).toISOString().slice(0,16).replace('T',' ')+' in What-if'} checked={tradeSelection.includes(t.id)} onChange={e=>{const checked=e.target.checked;setTradeSelection(ids=>checked?[...new Set([...ids,t.id])]:ids.filter(id=>id!==t.id));}}/></td>}
     <td className="p-3">{new Date(t.entryTime).toISOString().slice(0,16).replace('T',' ')}</td><td className="p-3 font-semibold">{t.symbol}</td><td className="p-3">{t.direction==='BUY'?'Long':'Short'}</td><td className="p-3">{t.strategy}</td><td className="p-3">{money(t.actualNet)}</td>{returnToResult&&<><td className="p-3 font-semibold">{money(t.newNet)}</td><td className="p-3">{t.note||'Unchanged'}</td></>}
    </tr>)}</tbody></table>{!tableRows.length&&<p className="p-4 text-sm text-slate-500">{returnToResult?'No trades changed with this rule.':'No eligible trades match your filters.'}</p>}</div>
    {!returnToResult&&<div className="sticky bottom-0 mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-[#CCC6FB] bg-white py-3"><button className={btnSecondary} onClick={()=>setDialog(null)}>Cancel</button><button className={btnPrimary} disabled={!tradeSelection.length} onClick={()=>{setScope(p=>({...p,tradeIds:[...tradeSelection]}));setDialog(null);}}>Use selected trades</button></div>}
   </>}

   </div>
  </Modal>
 </div></JournalCurrency.Provider>;
};

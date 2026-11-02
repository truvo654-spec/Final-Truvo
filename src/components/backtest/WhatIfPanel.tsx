import React,{useContext,useEffect,useMemo,useRef,useState} from 'react';
import {ArrowRight,Check} from 'lucide-react';
import type {JournalEntry} from '../../types';
import type {JournalPlaybook} from '../../data/journalPlaybooks';
import type {JournalRules} from '../../backtest/rules';
import {ind,price,val} from '../../backtest/rules';
import type {TechnicalWhatIfRule} from '../../backtest/whatifTechnical';
import type {BacktestRun,WhatIfRun} from '../../backtest/store';
import {loadWhatIfs,saveWhatIfs} from '../../backtest/store';
import {makeSavedWhatIf,savedWhatIfKey,whatIfSaveKey} from '../../backtest/savedWhatIf';
import {compareParameters} from '../../backtest/whatifOptimizer';
import {describeWhatIf,ESTIMATED_RULES,runWhatIf,type WhatIfRule,type WhatIfTrade} from '../../backtest/whatif';
import {quickWhatIfDefaults,quickWhatIfSource,filterWhatIfEntries,whatIfMarket,WHAT_IF_MARKETS,quickWhatIfAlternatives} from '../../backtest/whatifQuick';
import {JournalCurrency,formatMoney} from '../journal/JournalCurrency';
import {WhatIfResults} from './WhatIfResults';
import {JournalDateRange} from '../journal/JournalDateRange';
import {prepareWhatIfDemoData,whatIfDateBounds,applyWhatIfDateRange} from '../../backtest/whatifDemoData';
import {whatIfResultGroups,projectWhatIfRow,whatIfBreakdowns} from '../../backtest/whatifResults';
import {WhatIfResultPicker} from './WhatIfResultPicker';
import {DashboardResultPopup} from './DashboardResultPopup';
import {dashboardSources,initialDashboardScope,type DashboardRow} from './dashboardData';
import {WhatIfAdvancedPanel} from './WhatIfAdvancedPanel';
import {WhatIfTechnicalSetup,technicalSetupFromBook} from './WhatIfTechnicalSetup';
import {playbookConditions} from '../../backtest/playbookConditions';
import {Card,Field,Modal,Pill,btnPrimary,btnSecondary,inputCls,Segmented} from './ui';

interface Props{
 entries:JournalEntry[];allEntries:JournalEntry[];initialPlaybookId?:string;initialRunId?:string;runs?:BacktestRun[];
 playbooks:JournalPlaybook[];journalRules:JournalRules;tz:string;onToast:(message:string)=>void;
 onOpenTrades:(ids:string[],label:string)=>void;onAddRule:(kind:'rule'|'checklist',label:string,patch?:Partial<JournalRules>)=>void;
 onSaveScenario?:(run:WhatIfRun)=>boolean;onViewSaved?:()=>void;
}
const choices:{kind:WhatIfRule['kind'];title:string;hint:string}[]=[
 {kind:'target',title:'Change my target',hint:'Take profit at a different R multiple.'},
 {kind:'breakeven',title:'Move stop to breakeven',hint:'Protect the trade once it reaches a set R.'},
 {kind:'stop',title:'Tighten my stop',hint:'Risk a smaller part of 1R on each trade.'},
 {kind:'technical',title:'Add a technical filter',hint:'Keep only trades that pass an indicator check.'},
];
const TECH_PRESETS:TechnicalWhatIfRule[]=[
 {kind:'technical',label:'RSI 14 above 50',timeframe:'15m',conditions:[{id:'wi-rsi',left:ind('RSI',14),op:'gt',right:val(50)}]},
 {kind:'technical',label:'Price above EMA 50',timeframe:'15m',conditions:[{id:'wi-ema',left:price('close'),op:'gt',right:ind('EMA',50)}]},
 {kind:'technical',label:'ADX 14 above 25',timeframe:'15m',conditions:[{id:'wi-adx',left:ind('ADX',14),op:'gt',right:val(25)}]},
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
 const [kind,setKind]=useState<WhatIfRule['kind']>('target');
 const [techId,setTechId]=useState('setup');
 const [technicalEditor,setTechnicalEditor]=useState(false);
 const [dialog,setDialog]=useState<'source'|'result'|'trades'|null>(null);
 const [returnToResult,setReturnToResult]=useState(false);
 const [changedOnly,setChangedOnly]=useState(false);
 const [selectedAlternative,setSelectedAlternative]=useState<string|null>(null);
 const [comparisonRule,setComparisonRule]=useState<WhatIfRule|null>(null);
 const [resultGroupId,setResultGroupId]=useState('all');
 const [tradeDetail,setTradeDetail]=useState<{row:DashboardRow;trade:WhatIfTrade}|null>(null);
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
  setComparisonRule(null);setSelectedAlternative(null);setResultGroupId('all');setAdvancedVisited(false);setKind(current=>choices.some(c=>c.kind===current)?current:'target');
  const counts=new Map<string,number>();source.entries.forEach(e=>e.mistakes.forEach(t=>counts.set(t,(counts.get(t)??0)+1)));
  setParams({...quickWhatIfDefaults(source.book,source.run,journalRules),tags:[...counts].sort((a,b)=>b[1]-a[1]).slice(0,2).map(([tag])=>tag)});
 },[scope.key,source.book,source.run,journalRules]);
 const playbookTech:TechnicalWhatIfRule|undefined=(()=>{const t=source.run?{kind:'technical' as const,label:source.run.name,timeframe:source.run.settings.timeframe,conditions:source.run.settings.rules.entry}:source.book&&playbookConditions(source.book).length?technicalSetupFromBook(source.book):undefined;return t&&t.conditions.length?t:undefined;})();
 const techOptions=[...(playbookTech?[{id:'setup',rule:playbookTech}]:[]),...TECH_PRESETS.map((r,i)=>({id:'preset'+i,rule:{...r,timeframe:source.run?.settings.timeframe??(source.book?technicalSetupFromBook(source.book).timeframe:r.timeframe)}}))];
 const techRule=(techOptions.find(o=>o.id===techId)??techOptions[0]).rule;
 const rule:WhatIfRule=kind==='technical'?techRule:kind==='lossesPerDay'?{kind,n:params.n}:kind==='hours'?{kind,start:params.start,end:params.end}:kind==='mistakes'?{kind,tags:params.tags}:kind==='target'?{kind,r:params.target}:kind==='breakeven'?{kind,r:params.be}:kind==='stop'?{kind,mult:params.stop}:{kind:'dailyLoss',usd:params.usd};
 const comparisonChoice=comparisonRule??rule;
 const changeSetupParams=(next:React.SetStateAction<typeof params>)=>{setComparisonRule(null);setParams(next);};
 const acceptComparisonRule=(next:WhatIfRule)=>{setComparisonRule(next);setSelectedAlternative(null);setKind(next.kind);if(next.kind!=='technical')setParams(p=>({...p,...(next.kind==='target'?{target:next.r}:next.kind==='breakeven'?{be:next.r}:next.kind==='stop'?{stop:next.mult}:next.kind==='dailyLoss'?{usd:next.usd}:next.kind==='lossesPerDay'?{n:next.n}:next.kind==='hours'?{start:next.start,end:next.end}:{tags:next.tags})}));};
 const priceData=useMemo(()=>prepareWhatIfDemoData(picked,playbooks,source.run,comparisonChoice.kind==='technical'?comparisonChoice:undefined),[picked,playbooks,source.run,comparisonChoice.kind==='technical'?JSON.stringify(comparisonChoice):'']);
 const rows=useMemo(()=>compareParameters(picked,quickWhatIfAlternatives(comparisonChoice),priceData),[picked,JSON.stringify(comparisonChoice),priceData]);
 const dateEntries=useMemo(()=>filterWhatIfEntries(source.entries,{...scope,from:'',to:''}),[source.entries,scope]);
 const dateBounds=whatIfDateBounds(dateEntries);
 const dateLabel=scope.from||scope.to?(scope.from||dateBounds.from)+' → '+(scope.to||dateBounds.to):'All selected data';
 const dateControl=<JournalDateRange context="whatif" from={scope.from} to={scope.to} label={dateLabel} today={dateBounds.to} entries={dateEntries} onApply={(range,all)=>{setScope(current=>applyWhatIfDateRange(current,range,all));setReviewRows(null);}}/>;
 const resultGroups=useMemo(()=>whatIfResultGroups(picked),[picked]);
 const resultGroup=resultGroups.find(g=>g.id===resultGroupId)??resultGroups[0];
 const visibleRows=useMemo(()=>resultGroup.id==='all'?rows:rows.map(r=>projectWhatIfRow(r,picked,resultGroup.tradeIds)),[rows,picked,resultGroup]);
 const row=rows.find(r=>r.id===selectedAlternative)??rows[0];
 const visibleRow=visibleRows.find(r=>r.id===row.id)??visibleRows[0];
 const out=visibleRow.output;
 const valid=kind==='technical'?(comparisonChoice.kind==='technical'&&comparisonChoice.conditions.length>0):kind==='mistakes'?params.tags.length>0:kind==='hours'?Number.isFinite(params.start)&&Number.isFinite(params.end)&&params.start!==params.end:kind==='lossesPerDay'?Number.isInteger(params.n)&&params.n>0:kind==='target'?Number.isFinite(params.target)&&params.target>0:kind==='breakeven'?Number.isFinite(params.be)&&params.be>0:kind==='stop'?params.stop>0&&params.stop<=1:Number.isFinite(params.usd)&&params.usd>0;
 const tags=[...new Set(picked.flatMap(e=>[...e.mistakes,...e.tags]))].sort();
 const currency=source.currency;
 const money=(n:number)=>Number.isFinite(n)?formatMoney(n,currency,2):'—';
 const dates=picked.map(e=>e.date).sort();
 const title=row.rule.kind==='dailyLoss'?`Stop after ${money(row.rule.usd)} daily loss`:describeWhatIf(row.rule);
 const estimate=ESTIMATED_RULES.includes(kind);
 const changed=out.trades.filter(t=>t.status!=='same');
 const context={currency,source:row.id===rows[0].id?'user' as const:'parameter' as const,goal:'net' as const,benchmark:source.label,scope:{'Source':scope.key,'Market':scope.market||'All markets','From':scope.from||dates[0]||'','To':scope.to||dates.at(-1)||'','Trade IDs':picked.map(e=>e.id).sort().join(','),'Data':source.run?'Sample simulation':'Journal','Price source':'Generated demo data','Demo timeframes':priceData.metadata.instruments.map(i=>i.symbols.join('/')+' · '+i.timeframe).join(', ')}};
 const saveKey=whatIfSaveKey(row.rule,context,row.output);
 const saved=savedKeys.includes(saveKey);
 const save=()=>{if(saved)return;const run=makeSavedWhatIf(row,{...context,demoData:priceData.metadata,breakdowns:whatIfBreakdowns(row.output,picked),selectedBreakdown:resultGroup.id},title);const ok=onSaveScenario?onSaveScenario(run):saveWhatIfs([run,...loadWhatIfs()]);if(ok){setSavedKeys(keys=>[...keys,saveKey]);onToast('Comparison and all result breakdowns saved to Saved runs');}else onToast('Could not save. Please try again.');};
 const showTrades=(fromResult:boolean,onlyChanged=false)=>{
  if(!fromResult){
   setSelectableTrades(runWhatIf(filterWhatIfEntries(source.entries,{...scope,tradeIds:null}),comparisonChoice,1,priceData).trades);
   setTradeSelection(picked.map(t=>t.id));
  }
  setReviewRows(null);setReviewLabel('');setReturnToResult(fromResult);setChangedOnly(onlyChanged);setDialog('trades');
 };
 const chooseSource=(type:SourceKind)=>{setPending(sourceKind(scope.key)===type?scope:{key:type==='log'?'history':type==='book'?'book:'+(activeBooks[0]?.id??''):'run:'+(runs[0]?.id??''),...emptyFilters});setDialog('source');};
 const changeSource=()=>{setPending(scope);setDialog('source');};
 const switchSource=(type:SourceKind)=>setPending({key:type==='log'?'history':type==='book'?'book:'+(activeBooks[0]?.id??''):'run:'+(runs[0]?.id??''),...emptyFilters});
 const tableRows=!returnToResult?selectableTrades:reviewRows??(changedOnly?changed:out.trades);
 const reviewScope=useMemo(()=>({...initialDashboardScope(source.run?[source.run]:[],[]),currency,timezone:tz,privacy:false}),[source.run,currency,tz]);
 const reviewSource=useMemo(()=>dashboardSources(source.run?[source.run]:[],[],picked,playbooks,reviewScope).find(s=>s.id===(source.run?'run:'+source.run.id:'journal')),[source.run,picked,playbooks,reviewScope]);
 const reviewTrade=(trade:WhatIfTrade)=>{const detail=reviewSource?.rows.find(r=>source.run?trade.id==='whatif:'+source.run.id+':'+r.trade?.id:r.journal?.id===trade.id);if(detail)setTradeDetail({row:detail,trade});};
 const initialTechnicalSetup=playbookTech;
 return <JournalCurrency.Provider value={currency as React.ContextType<typeof JournalCurrency>}><div className="space-y-5 min-w-0">
  <Card title="What if I changed one thing?" sub="Use your saved trades. Try one change. See the difference." right={dateControl}>
   <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Choose What-if source">{([{id:'log',label:'Trade Log'},{id:'book',label:'Playbook'},{id:'run',label:'Saved tests'}] as const).map(s=><button type="button" key={s.id} className={btnSecondary+(sourceKind(scope.key)===s.id?' border-[#5338ec] bg-[#F6F3FF] text-[#5338ec]':'')} aria-pressed={sourceKind(scope.key)===s.id} disabled={s.id==='book'?!activeBooks.length:s.id==='run'?!runs.length:false} onClick={()=>chooseSource(s.id)}>{s.label}</button>)}</div>
   <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-[#F8F7FF] p-4">
    <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="font-semibold text-sm">{source.label}</p><Pill tone={source.run?'info':'neutral'}>{source.run?'Sample simulation':'Journal'}</Pill></div><p className="mt-1 text-xs text-slate-500">{picked.length} closed trade{picked.length===1?"":"s"} · {dates.length?`${dates[0]} → ${dates.at(-1)}`:'No matching dates'} · {currency} · {scope.market||'All markets'}</p>{source.run&&<p className="mt-1 text-xs text-slate-500">{source.run.timeframe} · Saved test settings loaded</p>}</div>
    <div className="flex gap-2"><button className={btnSecondary} onClick={()=>showTrades(false)} disabled={!picked.length}>View trades</button></div>
   </div>
   {source.book&&!source.run&&<p className="mt-2 text-xs text-slate-500" title="Session, target, direction and technical conditions are copied from this playbook. Changes here apply only to this comparison.">Setup loaded · {technicalSetupFromBook(source.book).timeframe} · {(source.book.directions??['long','short']).join(' + ')} · {source.book.window?`${source.book.window.start}:00–${source.book.window.end}:00 UTC`:'Any time'} · Target {source.book.benchmarkRR}R</p>}
   {source.excluded>0&&<p className="mt-2 text-xs text-slate-500">{source.excluded} records excluded: open, unknown net result, or another currency.</p>}
   {source.book?.directions?.length===1&&<p className="mt-2 text-xs text-slate-500">{source.book.name} · {source.book.directions[0]} trades</p>}
  </Card>
  <Card title="Choose one change" right={<button type="button" className={btnSecondary} onClick={()=>setTechnicalEditor(true)}>Technical tools</button>}>
   <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" role="group" aria-label="What to change">{choices.map(c=><button key={c.kind} type="button" aria-pressed={kind===c.kind} onClick={()=>{setKind(c.kind);setComparisonRule(null);}} className={`rounded-xl border p-4 text-left transition-colors ${kind===c.kind?'border-[#5338ec] bg-[#F6F3FF]':'border-[#CCC6FB] hover:bg-slate-50'}`}><span className="flex items-start justify-between gap-2 text-sm font-semibold">{c.title}{kind===c.kind&&<Check size={16} className="shrink-0 text-[#5338ec]"/>}</span><span className="mt-2 block text-xs text-slate-500">{c.hint}</span>{c.kind==='target'&&<span className="mt-2 inline-block text-[10px] font-semibold text-amber-700">Estimated</span>}</button>)}</div>
   <div className="mt-5 flex flex-wrap items-center gap-3 rounded-xl bg-slate-50 p-4">
    {!choices.some(c=>c.kind===kind)&&comparisonRule&&<p className="text-sm font-semibold">{describeWhatIf(comparisonRule)}</p>}
    {kind==='lossesPerDay'&&<><span className="text-sm">Stop after</span><Segmented label="Daily loss count" value={String(params.n)} onChange={v=>changeSetupParams(p=>({...p,n:Number(v)}))} options={[...new Set([1,2,3,params.n])].map(n=>({id:String(n),label:String(n)}))}/><span className="text-sm">losses in a day</span><span className="text-xs text-slate-500">From your trading rules</span></>}
    {kind==='hours'&&<><span className="text-sm font-semibold">Trading session · UTC</span><label className="text-xs">From<select aria-label="Session start UTC" className={inputCls} value={params.start} onChange={e=>changeSetupParams(p=>({...p,start:Number(e.target.value)}))}>{Array.from({length:24},(_,h)=><option key={h} value={h}>{String(h).padStart(2,'0')}:00</option>)}</select></label><label className="text-xs">To<select aria-label="Session end UTC" className={inputCls} value={params.end} onChange={e=>changeSetupParams(p=>({...p,end:Number(e.target.value)}))}>{Array.from({length:24},(_,i)=>i+1).map(h=><option key={h} value={h}>{h===24?'24:00':String(h).padStart(2,'0')+':00'}</option>)}</select></label><span className="text-xs text-slate-500">{source.book||source.run?'Loaded from your setup':'Suggested session · editable'}</span></>}
    {kind==='mistakes'&&(tags.length?<div className="flex flex-wrap gap-2">{tags.map(t=><button key={t} className={btnSecondary} aria-pressed={params.tags.includes(t)} onClick={()=>changeSetupParams(p=>({...p,tags:p.tags.includes(t)?p.tags.filter(x=>x!==t):[...p.tags,t]}))}>{params.tags.includes(t)&&<Check size={14}/>} {t}</button>)}</div>:<p className="text-sm text-slate-500">These trades have no mistake tags. Choose another change.</p>)}
    {kind==='target'&&<><span className="text-sm">Take profit at</span><Segmented label="Target presets" value={String(params.target)} onChange={v=>changeSetupParams(p=>({...p,target:Number(v)}))} options={[...new Set([1,1.5,2,3,defaults.target])].sort((a,b)=>a-b).map(n=>({id:String(n),label:n+'R'}))}/><label className="text-xs">Custom R<input aria-label="Custom target R" type="number" min="0.1" step="0.1" className={inputCls+' max-w-24'} value={params.target} onChange={e=>changeSetupParams(p=>({...p,target:Number(e.target.value)}))}/></label></>}
    {kind==='breakeven'&&<><span className="text-sm">Move stop to breakeven at</span><Segmented label="Breakeven presets" value={String(params.be)} onChange={v=>changeSetupParams(p=>({...p,be:Number(v)}))} options={[...new Set([0.5,1,1.5,2,defaults.be])].sort((a,b)=>a-b).map(n=>({id:String(n),label:n+'R'}))}/><label className="text-xs">Custom R<input aria-label="Custom breakeven R" type="number" min="0.1" step="0.1" className={inputCls+' max-w-24'} value={params.be} onChange={e=>changeSetupParams(p=>({...p,be:Number(e.target.value)}))}/></label></>}
    {kind==='stop'&&<><span className="text-sm">Stop at</span><Segmented label="Stop presets" value={String(params.stop)} onChange={v=>changeSetupParams(p=>({...p,stop:Number(v)}))} options={[0.5,0.75,0.9].map(n=>({id:String(n),label:n+'R'}))}/><span className="text-sm">instead of 1R</span><span className="text-xs text-slate-500">A tighter stop risks less but may stop out more trades</span></>}
    {kind==='technical'&&<><span className="text-sm">Only take trades where</span><select aria-label="Technical filter" className={inputCls+' max-w-xs'} value={comparisonRule?.kind==='technical'?'custom':techOptions.some(o=>o.id===techId)?techId:techOptions[0].id} onChange={e=>{setComparisonRule(null);setTechId(e.target.value);}}>{comparisonRule?.kind==='technical'&&<option value="custom">Custom · {comparisonRule.label}</option>}{techOptions.map(o=><option key={o.id} value={o.id}>{o.id==='setup'?'Your setup · '+o.rule.label:o.rule.label}</option>)}</select><span className="text-xs text-slate-500">{comparisonChoice.kind==='technical'?comparisonChoice.timeframe:techRule.timeframe} demo candles</span></>}
   </div>
   <div className="mt-5 flex flex-wrap items-center justify-between gap-3"><p className="text-xs text-slate-500">{kind==='technical'?'Technical conditions use generated demo candles.':estimate?'Estimated using reconstructed price paths.':'Compare the same trades with one rule changed.'}</p><button className={btnPrimary} disabled={!picked.length||!valid} onClick={()=>{setComparisonRule(structuredClone(comparisonChoice));setSelectedAlternative(null);setResultGroupId('all');setAdvancedOpen(false);setAdvancedVisited(false);setDialog('result');}}>See results<ArrowRight size={16}/></button></div>
   {!picked.length&&<p role="status" className="mt-3 text-sm text-slate-500">{dateEntries.length>0&&(scope.from||scope.to)?<>No selected trades in this date range. <button className="font-semibold text-[#5338ec]" onClick={()=>setScope(current=>applyWhatIfDateRange(current,dateBounds,true))}>Reset date range</button></>:<>No eligible trades in this selection. <button className="font-semibold text-[#5338ec]" onClick={changeSource}>Choose your data</button></>}</p>}
  </Card>
  <Modal open={technicalEditor} onClose={()=>setTechnicalEditor(false)} title="Technical tools" width="max-w-4xl"><div className="max-h-[75vh] overflow-y-auto pr-2"><WhatIfTechnicalSetup key={scope.key} initial={comparisonChoice.kind==='technical'?comparisonChoice:playbookTech??techRule} applied={comparisonChoice.kind==='technical'?comparisonChoice:undefined} onUse={next=>{acceptComparisonRule(next);setTechnicalEditor(false);}} onClear={()=>{setComparisonRule(null);setKind('target');setTechnicalEditor(false);}} /></div></Modal>
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
    <p className="mt-3 text-xs text-slate-500">Date range · {pending.from||'First selected trade'} → {pending.to||'Latest selected trade'}</p>
    <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs"><label className="flex items-center gap-2 font-semibold"><input type="checkbox" aria-label="Select all matching trades" checked={matching.length>0&&pendingPicked.length===matching.length} disabled={!matching.length} onChange={e=>setPending(p=>({...p,tradeIds:e.target.checked?null:[]}))}/>All {matching.length} matching trades</label><span role="status">{pendingPicked.length} selected · {pendingSource.currency} · {pendingSource.run?'Sample simulation':'Journal'}</span></div>
    <div className="mt-2 max-h-48 overflow-y-auto rounded-xl border border-[#CCC6FB]" role="group" aria-label="Select trades for What-if">
     {matching.map(e=><label key={e.id} className="flex cursor-pointer items-start gap-3 border-b border-[#CCC6FB] p-3 last:border-b-0 hover:bg-[#F8F7FF]"><input type="checkbox" className="mt-1 accent-[#5338ec]" aria-label={'Include '+e.symbol+' '+e.date+' '+e.id} checked={pending.tradeIds===null||pending.tradeIds.includes(e.id)} onChange={event=>{const checked=event.target.checked;setPending(p=>{const ids=p.tradeIds??matching.map(t=>t.id);return {...p,tradeIds:checked?[...new Set([...ids,e.id])]:ids.filter(id=>id!==e.id)};});}}/><span className="min-w-0 text-xs"><span className="font-semibold">{e.symbol} · {e.direction==='BUY'?'Long':'Short'}</span><span className="mt-1 block text-slate-500">{e.date} · {e.strategy} · {whatIfMarket(e)}</span></span></label>)}
     {!matching.length&&<p className="p-4 text-sm text-slate-500">No eligible trades match. Choose another market or data source.</p>}
    </div>
    <div className="sticky bottom-0 z-10 mt-4 flex items-center justify-end gap-2 border-t border-[#CCC6FB] bg-white py-3"><button className={btnSecondary} onClick={()=>setDialog(null)}>Cancel</button><button className={btnPrimary} disabled={!pendingPicked.length||(!!pending.from&&!!pending.to&&pending.from>pending.to)} onClick={()=>{setScope({...pending,tradeIds:pending.tradeIds===null?null:[...pending.tradeIds]});setDialog(null);}}>Use {pendingPicked.length} trade{pendingPicked.length===1?'':'s'}</button></div>
   </>}
   {(dialog==='result'||(dialog==='trades'&&returnToResult))&&<div hidden={dialog!=='result'}>
    <div className="sticky top-0 z-30 mb-4 bg-white"><WhatIfResultPicker dateControl={dateControl} groups={resultGroups} value={resultGroup.id} onChange={id=>{setResultGroupId(id);setReviewRows(null);}}/></div>
    <div hidden={advancedOpen}><WhatIfResults onAdvanced={()=>analysisMode(true)} entries={picked} rows={visibleRows} selected={visibleRow} onSelect={setSelectedAlternative} currency={currency} summary={resultGroup.label+' · '+out.trades.length+' trade'+(out.trades.length===1?'':'s')+' · '+currency+' · '+(resultGroup.market||scope.market||'All markets')+' · '+(scope.from||resultGroup.from)+' → '+(scope.to||resultGroup.to)} simulation={!!source.run} saved={saved} onSave={save} onTrades={()=>showTrades(true,false)} onClose={()=>setDialog(null)} onViewSaved={onViewSaved?()=>{setDialog(null);onViewSaved();}:undefined}/></div>
    {advancedVisited&&<section hidden={!advancedOpen} aria-label="Advanced What-if analysis">
     <header className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-[#CCC6FB] bg-white pb-4 pr-7"><div><h2 className="text-lg font-bold">Advanced analysis</h2><p className="mt-1 text-xs text-slate-500">{resultGroup.label} · {out.trades.length} trades · {currency} · {resultGroup.market||scope.market||'All markets'}</p></div><button type="button" className={btnSecondary} onClick={()=>analysisMode(false)}>Back to results</button></header>
     <WhatIfAdvancedPanel key={scope.key+'|'+cohortKey} priceData={priceData} controlledRule={row.rule} onRuleChange={acceptComparisonRule} resultTradeIds={resultGroup.id==='all'?undefined:resultGroup.tradeIds} resultLabel={resultGroup.label} initialTechnicalSetup={initialTechnicalSetup} fixedScope benchmarkLabel={(source.run?'Sample simulation · ':'Journal · ')+source.label} benchmarkScope={context.scope} initialValues={params} initialRule={row.rule} entries={picked} allEntries={picked} playbooks={[]} journalRules={journalRules} tz={tz} onToast={onToast} onAddRule={onAddRule} onOpenTrades={onOpenTrades} onReviewTrades={(trades,label)=>{setReviewRows(trades);setReviewLabel(label);setChangedOnly(false);setReturnToResult(true);setDialog('trades');}} onSaveScenario={onSaveScenario} onViewSaved={onViewSaved?()=>{setDialog(null);onViewSaved();}:undefined}/>
    </section>}
   </div>}
   {dialog==='trades'&&<>
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 pr-5"><div><h2 className="text-lg font-bold">{reviewRows?'Advanced comparison trades':changedOnly?'Changed trades':'Trades in this comparison'}</h2><p className="mt-1 text-xs text-slate-500">{reviewLabel||resultGroup.label} · {currency}</p></div>{returnToResult&&<button className={btnSecondary} onClick={()=>setDialog('result')}>Back to result</button>}</div>
    {!returnToResult&&<div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs">
     <label className="flex cursor-pointer items-center gap-2 font-semibold"><input type="checkbox" className="accent-[#5338ec]" aria-label="Select all comparison trades" ref={el=>{if(el)el.indeterminate=tradeSelection.length>0&&tradeSelection.length<tableRows.length;}} checked={tableRows.length>0&&tradeSelection.length===tableRows.length} disabled={!tableRows.length} onChange={e=>setTradeSelection(e.target.checked?tableRows.map(t=>t.id):[])}/>Select all</label>
     <span role="status">{tradeSelection.length} of {tableRows.length} selected</span>
    </div>}
    <div className="overflow-x-auto max-h-[55vh]"><table className="w-full min-w-[620px] text-xs"><thead className="sticky top-0 bg-slate-50"><tr>
     {!returnToResult&&<th className="w-10 p-3 text-left"><span className="sr-only">Include in What-if</span></th>}
     {['Entry · UTC','Instrument','Side','Playbook','Original',...(returnToResult?['What-if','Change','Review']:[])].map(h=><th className="p-3 text-left" key={h}>{h}</th>)}
    </tr></thead><tbody>{tableRows.map(t=><tr key={t.id} className={'border-t border-[#CCC6FB]'+(!returnToResult&&tradeSelection.includes(t.id)?' bg-[#F8F7FF]':'')}>
     {!returnToResult&&<td className="p-3"><input type="checkbox" className="accent-[#5338ec]" aria-label={'Include '+t.symbol+' '+new Date(t.entryTime).toISOString().slice(0,16).replace('T',' ')+' in What-if'} checked={tradeSelection.includes(t.id)} onChange={e=>{const checked=e.target.checked;setTradeSelection(ids=>checked?[...new Set([...ids,t.id])]:ids.filter(id=>id!==t.id));}}/></td>}
     <td className="p-3">{new Date(t.entryTime).toISOString().slice(0,16).replace('T',' ')}</td><td className="p-3 font-semibold">{t.symbol}</td><td className="p-3">{t.direction==='BUY'?'Long':'Short'}</td><td className="p-3">{t.strategy}</td><td className="p-3">{money(t.actualNet)}</td>{returnToResult&&<><td className="p-3 font-semibold">{money(t.newNet)}</td><td className="p-3">{t.note||'Unchanged'}</td><td className="p-3"><button type="button" className={btnSecondary} aria-label={'Review '+t.symbol+' '+t.id} onClick={()=>reviewTrade(t)}>{source.run?'Replay':'Details'}</button></td></>}
    </tr>)}</tbody></table>{!tableRows.length&&<p className="p-4 text-sm text-slate-500">{returnToResult?'No trades in this result.':'No eligible trades match your filters.'}</p>}</div>
    {!returnToResult&&<div className="sticky bottom-0 mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-[#CCC6FB] bg-white py-3"><button className={btnSecondary} onClick={()=>setDialog(null)}>Cancel</button><button className={btnPrimary} disabled={!tradeSelection.length} onClick={()=>{setScope(p=>({...p,tradeIds:[...tradeSelection]}));setDialog(null);}}>Use selected trades</button></div>}
   </>}

   </div>
  </Modal>
  {tradeDetail&&<DashboardResultPopup key={tradeDetail.row.id} initialTradeId={tradeDetail.row.id} title="What-if trade details" closeLabel="Back to comparison trades" selection={{source:tradeDetail.row.sourceId,name:resultGroup.label}} source={reviewSource} rows={[tradeDetail.row]} scope={reviewScope} format={n=>n===null?'—':money(n)} valueOf={r=>r.net} onClose={()=>setTradeDetail(null)} resultPicker={<div className="text-xs"><p className="font-semibold">Original {money(tradeDetail.trade.actualNet)} → What-if {money(tradeDetail.trade.newNet)}</p><p className="mt-1 text-slate-500">{tradeDetail.trade.note||'Unchanged'}{source.run?' · Replay shows the original saved test.':''}</p></div>}/>}
 </div></JournalCurrency.Provider>;
};

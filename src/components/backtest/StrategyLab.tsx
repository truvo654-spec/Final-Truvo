import {startRuleReview,moveRuleReview,type LabRuleReview} from './labRuleReview';
import {TradeListFilters} from '../journal/TradeListFilters';
import {EMPTY_TRADE_FILTER,filterTradeList,journalTradeRecord} from '../journal/tradeListFiltering';
import React, {useState, useRef} from 'react';
import {FlaskConical, Check, ChevronRight, Play} from 'lucide-react';
import type {JournalEntry} from '../../types';
import type {JournalPlaybook} from '../../data/journalPlaybooks';
import {BACKTEST_TRAINING_ENABLED,DATA_START, DATA_END} from '../../backtest/config';
import {resolveSymbol} from '../../backtest/marketData';
import {describeRules, validateSettings} from '../../backtest/rules';
import {playbookConditions} from '../../backtest/playbookConditions';
import {currencyOf} from '../journal/journalMath';
import type {BacktestSetup} from './BacktestSetup';
import {LabQuickSetup} from './LabQuickSetup';
import {labJobs,labRulesNeedReview} from './labTransfer';
import {LabEntryRulesDialog} from './LabEntryRulesDialog';
import {InfoTooltip} from '../common/InfoTooltip';
import type {Condition,BacktestSettings} from '../../backtest/types';
import {btnPrimary, btnSecondary, inputCls, Modal} from './ui';

type SetupProps=React.ComponentProps<typeof BacktestSetup>;
interface Props {
  reusesSavedResult?:boolean;
  setup:SetupProps; allEntries:JournalEntry[];
  reviewedRules:Record<string,string>;
  symbols:string[];
  onSetup:(updates:Record<string,BacktestSettings>,symbols:string[],base:BacktestSettings)=>void;
  onBooks:(ids:string[])=>void; onTrades:(ids:string[])=>void;
  onPractice:(tradeId?:string,bookId?:string)=>void;
  onEntryRules:(bookId:string,entry:Condition[])=>void;
  onViewResults?:()=>void;
}

export function StrategyLab({reusesSavedResult=false,setup:s,allEntries,reviewedRules,symbols,onSetup,onBooks,onTrades,onPractice,onEntryRules,onViewResults}:Props){

  const [step,setStep]=useState<'choose'|'setup'>('choose');
  const headerRef=useRef<HTMLElement>(null);
  const goStep=(next:'choose'|'setup')=>{setStep(next);requestAnimationFrame(()=>{headerRef.current?.scrollIntoView({behavior:'smooth',block:'start'});headerRef.current?.focus({preventScroll:true});});};
  const [showSelectedTrades,setShowSelectedTrades]=useState(false);
  const [bookQuery,setBookQuery]=useState('');
  const [tradeFilters,setTradeFilters]=useState({...EMPTY_TRADE_FILTER});
  const [selectedTrades,setSelectedTrades]=useState<string[]>(s.benchmarkEntries.map(e=>e.id));
  const [requestedMode,setMode]=useState<'auto'|'practice'>('auto');
  const mode=BACKTEST_TRAINING_ENABLED?requestedMode:'auto';
  const [templates,setTemplates]=useState<string[]>([]);
  const [ruleBookId,setRuleBookId]=useState<string|null>(null);
  const [review,setReview]=useState<LabRuleReview|null>(null);
  const closeRules=()=>{setRuleBookId(null);setReview(null);};
  const activeRuleBookId=review?.ids[review.index]??ruleBookId;
  const ruleBook=s.playbooks.find(b=>b.id===activeRuleBookId&&s.selectedPlaybookIds.includes(b.id));
  const [customRules,setCustomRules]=useState<string[]>([]);
  const chosen=s.playbooks.filter(b=>s.selectedPlaybookIds.includes(b.id));
  const active=s.playbooks.filter(b=>b.status!=='archived');

  const books=active.filter(b=>[b.name,...b.symbols??[]].join(' ').toLowerCase().includes(bookQuery.toLowerCase()));
  const trades=filterTradeList(allEntries,tradeFilters,journalTradeRecord);
  const currencies=[...new Set(s.benchmarkEntries.map(currencyOf))];
  const missing=chosen.filter(b=>labRulesNeedReview(b,s.settingsByPlaybook[b.id],reviewedRules));
  const jobs=labJobs(s.selectedPlaybookIds.flatMap(id=>s.settingsByPlaybook[id]?[s.settingsByPlaybook[id]]:[]),symbols);
  const problems=jobs.flatMap(job=>validateSettings(job).map(p=>`${job.name} · ${job.symbol}: ${p.message}`));
  const outside=s.settings.from<DATA_START||s.settings.to>DATA_END;
  const wrongCurrency=currencies.length>1||currencies.length===1&&jobs.some(job=>job.risk.currency!==currencies[0]);
  const unsupported=[...new Set(s.benchmarkEntries.filter(e=>!resolveSymbol(e.symbol)).map(e=>e.symbol))];
  const pendingTrades=JSON.stringify([...selectedTrades].sort())!==JSON.stringify(s.benchmarkEntries.map(e=>e.id).sort());
  const canContinue=chosen.length>0||selectedTrades.length>0;
  const continueToSetup=()=>{
    if(!canContinue)return;
    if(pendingTrades){
      if(selectedTrades.length){setCustomRules([]);setTemplates([]);onTrades(selectedTrades);}
      else s.onClearBenchmark();
    }
    goStep('setup');
  };
  const emptyDirections=chosen.filter(b=>b.directions&&!b.directions.length);
  const validSetup=!!jobs.length&&!problems.length&&!wrongCurrency&&!pendingTrades&&!emptyDirections.length;
  const ready=validSetup&&!missing.length;
  const practiceReady=s.benchmarkEntries.length===1||chosen.length===1;
  const choose=(ids:string[])=>{setCustomRules([]);setTemplates([]);onBooks(ids);};
  const run=()=>{if(mode==='practice')onPractice(s.benchmarkEntries.length===1?s.benchmarkEntries[0].id:undefined,chosen.length===1?chosen[0].id:undefined);else if(validSetup&&missing.length){setRuleBookId(null);setReview(startRuleReview(missing.map(b=>b.id)));}else if(ready)s.onRun();};
  const patch=(value:Partial<typeof s.settings>)=>s.onChange({...s.settings,...value});
  return <div className="w-full min-w-0 space-y-5 pb-6">
    {ruleBook&&s.settingsByPlaybook[ruleBook.id]&&<LabEntryRulesDialog key={ruleBook.id} book={ruleBook} settings={s.settingsByPlaybook[ruleBook.id]} suggested={!playbookConditions(ruleBook).length&&missing.some(b=>b.id===ruleBook.id)} onClose={closeRules} initialEntry={review?.drafts[ruleBook.id]} reviewProgress={review?{current:review.index+1,total:review.ids.length}:undefined} onBack={review?entry=>setReview(moveRuleReview(review,entry,-1)):undefined} onApply={entry=>{const current=s.settingsByPlaybook[ruleBook.id];onEntryRules(ruleBook.id,entry);setTemplates(ids=>[...new Set([...ids,ruleBook.id])]);if(JSON.stringify(entry)!==JSON.stringify(current.rules.entry))setCustomRules(ids=>[...new Set([...ids,ruleBook.id])]);if(review)setReview(moveRuleReview(review,entry,1));else closeRules();}}/>}
    <Modal open={showSelectedTrades} onClose={()=>setShowSelectedTrades(false)} title="Selected journal trades" width="max-w-3xl">
      <h3 className="pr-8 text-lg font-bold text-[#0b1c30]">Selected journal trades</h3>
      <p className="mt-1 text-xs text-slate-500">{s.benchmarkEntries.length} trade{s.benchmarkEntries.length===1?'':'s'} linked to this setup. This is the journal benchmark you chose.</p>
      <div className="mt-4 max-h-[55dvh] overflow-y-auto rounded-xl border border-slate-200">
        {s.benchmarkEntries.map(entry=><div key={entry.id} className="flex items-start gap-3 border-b border-slate-100 p-4 text-sm last:border-0">
          <Check size={16} aria-label="Selected" className="mt-0.5 shrink-0 text-[#5338ec]"/>
          <div className="min-w-0 flex-1"><p><b>{entry.symbol}</b> · {entry.direction==='BUY'?'Long':'Short'}</p><p className="mt-1 text-xs text-slate-500">{entry.date} · {entry.strategy||'No linked strategy book'} · {currencyOf(entry)}</p></div>
        </div>)}
        {!s.benchmarkEntries.length&&<p className="p-4 text-sm text-slate-500">No journal trades linked to this setup.</p>}
      </div>
      <div className="mt-4 flex justify-end"><button type="button" className={btnPrimary} onClick={()=>setShowSelectedTrades(false)}>Back to setup</button></div>
    </Modal>
    <section ref={headerRef} tabIndex={-1} className="scroll-mt-24 rounded-2xl border border-[#DED5FF] bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="mb-1 flex items-center gap-2 text-xs font-bold text-[#5338ec]"><FlaskConical size={16}/>STRATEGY LAB</p><h2 className="text-2xl font-bold text-[#0b1c30]">Your next discovery starts here</h2><p className="mt-2 text-sm text-slate-500">Pick what you already saved. Test an idea. Learn from the result.</p></div><span className="rounded-full bg-teal-50 px-3 py-1 text-[10px] font-semibold text-teal-700">Sample simulation</span></div>
      <ol aria-label="Lab progress" className="mt-5 flex flex-wrap gap-3 text-xs">
        <li><button type="button" aria-current={step==='choose'?'step':undefined} onClick={()=>goStep('choose')} className="flex items-center gap-2 rounded-md py-1 font-semibold text-[#5338ec]"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-current">1</span>Choose your starting point<ChevronRight size={13}/></button></li>
        <li><button type="button" aria-current={step==='setup'?'step':undefined} disabled={!canContinue} onClick={continueToSetup} className="flex items-center gap-2 rounded-md py-1 font-semibold text-[#5338ec] disabled:text-slate-400"><span className="grid h-6 w-6 place-items-center rounded-full border border-current">2</span>Check your setup<ChevronRight size={13}/></button></li>
        <li className="flex items-center gap-2 text-slate-400"><span className="grid h-6 w-6 place-items-center rounded-full border border-current">3</span>Explore results</li>
      </ol>
    </section>

    {step==='choose'&&<>
    <section aria-label="My strategy books" className="w-full min-w-0 rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-bold">My strategy books</h3><p className="mt-1 text-xs text-slate-500">Choose the strategies to test. Their saved settings load below.</p></div><span className="rounded-full bg-[#F1EDFF] px-3 py-1 text-xs font-semibold text-[#5338ec]">{chosen.length} selected</span></div>
      <input aria-label="Search lab strategy books" placeholder="Find a strategy book or instrument…" className={`${inputCls} mt-4`} value={bookQuery} onChange={e=>setBookQuery(e.target.value)}/>
      <div className="mt-3 grid max-h-80 grid-cols-1 gap-2 overflow-auto sm:grid-cols-2 lg:grid-cols-3">{books.map(b=><label key={b.id} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 ${s.selectedPlaybookIds.includes(b.id)?'border-[#BEB0FF] bg-[#F7F5FF]':'border-slate-200 hover:bg-slate-50'}`}><input type="checkbox" className="mt-1 accent-[#5338ec]" checked={s.selectedPlaybookIds.includes(b.id)} onChange={()=>choose(s.selectedPlaybookIds.includes(b.id)?s.selectedPlaybookIds.filter(id=>id!==b.id):[...s.selectedPlaybookIds,b.id])}/><span className="min-w-0"><span className="block text-sm font-bold">{b.name}</span><span className="mt-1 block text-xs text-slate-500">{b.symbols?.join(' · ')||b.markets.join(' · ')}</span><span className="mt-1 block text-[10px] text-slate-500">{b.grade} · {b.status} · target {b.benchmarkRR}R</span></span></label>)}{!books.length&&<p className="p-4 text-sm text-slate-500">{active.length?'No strategy books match your search.':'Create a strategy book in the Strategy Book tab to run a test.'}</p>}</div>
    </section>

    <section aria-label="My journal trades" className="w-full min-w-0 rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-bold">My journal trades</h3><p className="mt-1 text-xs text-slate-500">Choose recorded trades to compare. Check your setup loads these trades and their linked strategy books.</p></div><span className="rounded-full bg-[#F1EDFF] px-3 py-1 text-xs font-semibold text-[#5338ec]">{selectedTrades.length} selected</span></div>
      <TradeListFilters value={tradeFilters} onChange={setTradeFilters} records={allEntries.map(journalTradeRecord)} count={trades.length}/>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs"><label className="flex items-center gap-2"><input type="checkbox" checked={!!trades.length&&trades.every(e=>selectedTrades.includes(e.id))} onChange={e=>setSelectedTrades(e.target.checked?[...new Set([...selectedTrades,...trades.map(t=>t.id)])]:selectedTrades.filter(id=>!trades.some(t=>t.id===id)))}/>All {trades.length} matching trades</label><button className="text-[#5338ec]" onClick={()=>{setSelectedTrades([]);s.onClearBenchmark();}}>Clear selection</button></div>
        <div className="mt-2 max-h-80 overflow-auto rounded-xl border border-slate-200">{trades.map(e=><label key={e.id} className="flex cursor-pointer items-center gap-3 border-b border-slate-100 p-3 text-xs last:border-0 hover:bg-slate-50"><input type="checkbox" checked={selectedTrades.includes(e.id)} onChange={()=>setSelectedTrades(selectedTrades.includes(e.id)?selectedTrades.filter(id=>id!==e.id):[...selectedTrades,e.id])}/><span className="flex-1"><b>{e.symbol}</b> · {e.direction==='BUY'?'Long':'Short'}<span className="mt-1 block text-slate-500">{e.date} · {e.strategy||'No linked strategy book'} · {currencyOf(e)}</span></span></label>)}{!trades.length&&<p className="p-4 text-sm text-slate-500">No matching journal trades. Change or clear these filters.</p>}</div>
        <p className="mt-2 text-[11px] text-slate-500">Your checked trades load when you click Check your setup. Your journal stays unchanged.</p>

    </section>

    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-5"><p className="text-xs text-slate-500">{chosen.length} strategy book{chosen.length===1?'':'s'} · {selectedTrades.length} selected journal trades{!canContinue?' · Select a strategy book or journal trade to continue.':''}</p><button type="button" className={btnPrimary} disabled={!canContinue} onClick={continueToSetup}>Check your setup <ChevronRight size={16}/></button></div>
    </>}

    {step==='setup'&&(chosen.length||s.benchmarkEntries.length)?<section aria-label="Lab setup summary" className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-bold">2. Check your setup</h3><button type="button" className="mt-2 text-xs font-semibold text-[#5338ec]" onClick={()=>goStep('choose')}>← Change selection</button></div>{BACKTEST_TRAINING_ENABLED&&<div role="group" aria-label="Lab mode" className="flex gap-1 rounded-lg bg-slate-100 p-1">{(['auto','practice'] as const).map(m=><button key={m} aria-pressed={mode===m} onClick={()=>setMode(m)} className={`rounded-md px-3 py-2 text-xs font-semibold ${mode===m?'bg-white text-[#5338ec] shadow-sm':'text-slate-500'}`}>{m==='auto'?'Run automatically':'Practice myself'}</button>)}</div>}</div>
      {s.benchmarkEntries.length>0&&<div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-50 p-3 text-xs"><b>{s.benchmarkEntries.length} selected journal trades</b><button className="font-semibold text-[#5338ec]" onClick={()=>setShowSelectedTrades(true)}>View selected trades</button></div>}
      {mode==='auto'?<>
        <LabQuickSetup settings={s.settings} byBook={s.settingsByPlaybook} books={chosen} symbols={symbols} onApply={onSetup}/>
        {!!chosen.length&&<section aria-label="Strategy Book test rules" className="mt-4"><div className="mb-2 flex items-center gap-2"><h4 className="text-xs font-bold">Your strategy book rules</h4><span className="text-[11px] text-slate-500">Test copies</span></div><div className="space-y-2">{chosen.map(b=>{const st=s.settingsByPlaybook[b.id];if(!st)return null;const needsReview=missing.some(m=>m.id===b.id);return <article key={b.id} aria-label={b.name+' test rules'} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3"><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-1"><h5 className="text-sm font-bold">{b.name}</h5><InfoTooltip label={b.name+' rule details'} description={<><p>{describeRules(st.rules).map(r=>r.label+': '+r.text).join(' ')}</p>{(b.thesis||b.entryTrigger)&&<p className="mt-2">Strategy Book notes · manual guidance: {b.thesis||b.entryTrigger}</p>}</>}/><span className={'ml-1 rounded-full px-2 py-0.5 text-[10px] font-semibold '+(needsReview?'bg-amber-50 text-amber-700':'bg-emerald-50 text-emerald-700')}>{needsReview?'Review needed':customRules.includes(b.id)?'Edited for test':templates.includes(b.id)||!playbookConditions(b).length?'Reviewed for test':'From strategy book'}</span></div><p className="mt-1 text-xs text-slate-500">{st.timeframe} · {st.rules.direction==='both'?'Long + Short':st.rules.direction==='long'?'Long':'Short'} · {st.session.id==='any'?'Any time':st.session.start+':00–'+st.session.end+':00 UTC'} · {st.risk.mode==='percent'?st.risk.percent+'% risk':st.risk.mode==='fixedR'?st.risk.fixedR+' '+st.risk.currency+' risk':st.risk.qty+' fixed size'} · Target {st.rules.exits.targetR===null?'off':st.rules.exits.targetR+'R'}</p></div><button type="button" aria-label={(needsReview?'Review':'Edit')+' entry rules for '+b.name} className={btnSecondary} onClick={()=>setRuleBookId(b.id)}>{needsReview?'Review rules':'Edit rules'}</button></article>;})}</div></section>}
        {!jobs.length&&<p role="alert" className="mt-3 text-xs text-amber-700">Select a supported instrument using Edit instruments.</p>}
        {!!emptyDirections.length&&<p role="alert" className="mt-3 text-xs text-amber-700">Choose Long or Short in the Strategy Book settings for {emptyDirections.map(b=>b.name).join(', ')}.</p>}
        {pendingTrades&&<p role="alert" className="mt-3 text-xs text-amber-700">Your trade selection changed. Click Check your setup to load it.</p>}
        {wrongCurrency&&<p role="alert" className="mt-3 text-xs text-amber-700">{currencies.length>1?'Choose journal trades in one currency before comparing results.':'Choose the journal benchmark’s currency. No currency conversion is applied.'}</p>}
        {unsupported.length>0&&<p className="mt-2 text-xs text-amber-700">No sample prices for {unsupported.join(', ')}. Their journal records remain in the benchmark; choose supported instruments to test.</p>}
        {outside&&<div className="mt-3 rounded-xl bg-amber-50 p-3 text-xs"><p>Sample prices cover {DATA_START} to {DATA_END}. Your benchmark has not been changed.</p><button className="mt-2 font-semibold text-[#5338ec]" onClick={()=>patch({from:DATA_START,to:DATA_END})}>Use available sample period</button></div>}
        {!!problems.length&&<ul role="alert" className="mt-3 space-y-1 text-xs text-amber-700">{[...new Set(problems)].map(p=><li key={p}>{p}</li>)}</ul>}
      </>:<p className="mt-4 text-sm text-slate-600">Practice one strategy book or one selected trade with the existing candle-by-candle player. Supported settings load automatically; written rules stay visible as your guide.{!practiceReady?' Choose one strategy book or exactly one journal trade above.':''}</p>}
      <div className="mt-5 flex flex-wrap items-center gap-4"><button type="button" className={`${btnPrimary} min-h-11 px-6`} disabled={mode==='auto'?!validSetup:!practiceReady||pendingTrades} onClick={run}><Play size={16}/>{mode==='auto'?(missing.length?`Review rules to run · ${missing.length}`:reusesSavedResult?'View saved result':`Run test${jobs.length>1?' · '+jobs.length+' results':''}`):'Start practice'}</button>{onViewResults&&<button type="button" className={btnSecondary} onClick={onViewResults}>View latest results</button>}<p className="max-w-md text-[11px] text-slate-500">{mode==='auto'?(missing.length?'Review the suggested entry rules first. Your saved strategy books stay unchanged.':s.runHint):'Practice is free. Complete a session to review what you learned.'}</p></div>
      <p className="mt-3 text-[11px] text-slate-500">Generated sample prices. Simulated fills and results are separate from your recorded trades.</p>
    </section>:null}

  </div>;
}

import React, {useState, useRef} from 'react';
import {FlaskConical, Check, ChevronRight, Play, History} from 'lucide-react';
import type {JournalEntry} from '../../types';
import type {JournalPlaybook} from '../../data/journalPlaybooks';
import type {BacktestRun} from '../../backtest/store';
import {DATA_START, DATA_END} from '../../backtest/config';
import {SYMBOLS, resolveSymbol} from '../../backtest/marketData';
import {describeCondition, validateSettings} from '../../backtest/rules';
import {playbookConditions} from '../../backtest/playbookConditions';
import {currencyOf} from '../journal/journalMath';
import {BacktestSetup} from './BacktestSetup';
import {labJobs} from './labTransfer';
import {btnPrimary, btnSecondary, inputCls, Modal} from './ui';

type SetupProps=React.ComponentProps<typeof BacktestSetup>;
interface Props {
  setup:SetupProps; allEntries:JournalEntry[]; runs:BacktestRun[];
  symbols:string[]; onSymbols:(symbols:string[])=>void;
  onBooks:(ids:string[])=>void; onTrades:(ids:string[])=>void;
  onPractice:(tradeId?:string,bookId?:string)=>void;
  onOpenRun:(run:BacktestRun)=>void; onRerun:(run:BacktestRun)=>void;
}

export function StrategyLab({setup:s,allEntries,runs,symbols,onSymbols,onBooks,onTrades,onPractice,onOpenRun,onRerun}:Props){

  const [step,setStep]=useState<'choose'|'setup'>('choose');
  const headerRef=useRef<HTMLElement>(null);
  const goStep=(next:'choose'|'setup')=>{setStep(next);requestAnimationFrame(()=>{headerRef.current?.scrollIntoView({behavior:'smooth',block:'start'});headerRef.current?.focus({preventScroll:true});});};
  const [showSelectedTrades,setShowSelectedTrades]=useState(false);
  const [instrumentQuery,setInstrumentQuery]=useState('');
  const [bookQuery,setBookQuery]=useState('');
  const [tradeQuery,setTradeQuery]=useState('');
  const [selectedTrades,setSelectedTrades]=useState<string[]>(s.benchmarkEntries.map(e=>e.id));
  const [mode,setMode]=useState<'auto'|'practice'>('auto');
  const [templates,setTemplates]=useState<string[]>([]);
  const [settingsOpen,setSettingsOpen]=useState(false);
  const [customRules,setCustomRules]=useState<string[]>([]);
  const chosen=s.playbooks.filter(b=>s.selectedPlaybookIds.includes(b.id));
  const active=s.playbooks.filter(b=>b.status!=='archived');

  const books=active.filter(b=>[b.name,...b.symbols??[]].join(' ').toLowerCase().includes(bookQuery.toLowerCase()));
  const trades=allEntries.filter(e=>[e.symbol,e.strategy,e.date].join(' ').toLowerCase().includes(tradeQuery.toLowerCase()));
  const currencies=[...new Set(s.benchmarkEntries.map(currencyOf))];
  const missing=chosen.filter(b=>!playbookConditions(b).length&&!templates.includes(b.id)&&!customRules.includes(b.id));
  const jobs=labJobs(s.selectedPlaybookIds.flatMap(id=>s.settingsByPlaybook[id]?[s.settingsByPlaybook[id]]:[]),symbols);
  const problems=jobs.flatMap(job=>validateSettings(job).map(p=>`${job.name} · ${job.symbol}: ${p.message}`));
  const outside=s.settings.from<DATA_START||s.settings.to>DATA_END;
  const wrongCurrency=currencies.length>1||currencies.length===1&&jobs.some(job=>job.risk.currency!==currencies[0]);
  const unsupported=[...new Set(s.benchmarkEntries.filter(e=>!resolveSymbol(e.symbol)).map(e=>e.symbol))];
  const pendingTrades=JSON.stringify([...selectedTrades].sort())!==JSON.stringify(s.benchmarkEntries.map(e=>e.id).sort());
  const ready=!!jobs.length&&!problems.length&&!missing.length&&!wrongCurrency&&!pendingTrades&&chosen.every(b=>!b.directions||!!b.directions.length);
  const practiceReady=s.benchmarkEntries.length===1||chosen.length===1;
  const choose=(ids:string[])=>{setCustomRules([]);setTemplates([]);onBooks(ids);};
  const run=()=>{if(mode==='practice')onPractice(s.benchmarkEntries.length===1?s.benchmarkEntries[0].id:undefined,chosen.length===1?chosen[0].id:undefined);else if(ready)s.onRun();};
  const patch=(value:Partial<typeof s.settings>)=>s.onChange({...s.settings,...value});
  return <div className="w-full min-w-0 space-y-5 pb-6">
    <Modal open={showSelectedTrades} onClose={()=>setShowSelectedTrades(false)} title="Selected journal trades" width="max-w-3xl">
      <h3 className="pr-8 text-lg font-bold text-[#0b1c30]">Selected journal trades</h3>
      <p className="mt-1 text-xs text-slate-500">{s.benchmarkEntries.length} trade{s.benchmarkEntries.length===1?'':'s'} linked to this setup. This is the journal benchmark you chose.</p>
      <div className="mt-4 max-h-[55dvh] overflow-y-auto rounded-xl border border-slate-200">
        {s.benchmarkEntries.map(entry=><div key={entry.id} className="flex items-start gap-3 border-b border-slate-100 p-4 text-sm last:border-0">
          <Check size={16} aria-label="Selected" className="mt-0.5 shrink-0 text-[#5338ec]"/>
          <div className="min-w-0 flex-1"><p><b>{entry.symbol}</b> · {entry.direction==='BUY'?'Long':'Short'}</p><p className="mt-1 text-xs text-slate-500">{entry.date} · {entry.strategy||'No linked playbook'} · {currencyOf(entry)}</p></div>
        </div>)}
        {!s.benchmarkEntries.length&&<p className="p-4 text-sm text-slate-500">No journal trades linked to this setup.</p>}
      </div>
      <div className="mt-4 flex justify-end"><button type="button" className={btnPrimary} onClick={()=>setShowSelectedTrades(false)}>Back to setup</button></div>
    </Modal>
    <section ref={headerRef} tabIndex={-1} className="scroll-mt-24 rounded-2xl border border-[#DED5FF] bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="mb-1 flex items-center gap-2 text-xs font-bold text-[#5338ec]"><FlaskConical size={16}/>STRATEGY LAB</p><h2 className="text-2xl font-bold text-[#0b1c30]">Your next discovery starts here</h2><p className="mt-2 text-sm text-slate-500">Pick what you already saved. Test an idea. Learn from the result.</p></div><span className="rounded-full bg-teal-50 px-3 py-1 text-[10px] font-semibold text-teal-700">Sample simulation</span></div>
      <ol aria-label="Lab progress" className="mt-5 flex flex-wrap gap-3 text-xs">
        <li><button type="button" aria-current={step==='choose'?'step':undefined} onClick={()=>goStep('choose')} className="flex items-center gap-2 rounded-md py-1 font-semibold text-[#5338ec]"><span className="grid h-6 w-6 place-items-center rounded-full border border-current">{step==='setup'?<Check size={13}/>:1}</span>Choose your starting point<ChevronRight size={13}/></button></li>
        <li><button type="button" aria-current={step==='setup'?'step':undefined} disabled={!chosen.length&&!s.benchmarkEntries.length||pendingTrades} onClick={()=>goStep('setup')} className="flex items-center gap-2 rounded-md py-1 font-semibold text-[#5338ec] disabled:text-slate-400"><span className="grid h-6 w-6 place-items-center rounded-full border border-current">2</span>Check your setup<ChevronRight size={13}/></button></li>
        <li className="flex items-center gap-2 text-slate-400"><span className="grid h-6 w-6 place-items-center rounded-full border border-current">3</span>Explore results</li>
      </ol>
    </section>

    {step==='choose'&&<>
    <section aria-label="My playbooks" className="w-full min-w-0 rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-bold">My playbooks</h3><p className="mt-1 text-xs text-slate-500">Choose the strategies to test. Their saved settings load below.</p></div><span className="rounded-full bg-[#F1EDFF] px-3 py-1 text-xs font-semibold text-[#5338ec]">{chosen.length} selected</span></div>
      <input aria-label="Search lab playbooks" placeholder="Find a playbook or instrument…" className={`${inputCls} mt-4`} value={bookQuery} onChange={e=>setBookQuery(e.target.value)}/>
      <div className="mt-3 grid max-h-80 grid-cols-1 gap-2 overflow-auto sm:grid-cols-2 lg:grid-cols-3">{books.map(b=><label key={b.id} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 ${s.selectedPlaybookIds.includes(b.id)?'border-[#BEB0FF] bg-[#F7F5FF]':'border-slate-200 hover:bg-slate-50'}`}><input type="checkbox" className="mt-1 accent-[#5338ec]" checked={s.selectedPlaybookIds.includes(b.id)} onChange={()=>choose(s.selectedPlaybookIds.includes(b.id)?s.selectedPlaybookIds.filter(id=>id!==b.id):[...s.selectedPlaybookIds,b.id])}/><span className="min-w-0"><span className="block text-sm font-bold">{b.name}</span><span className="mt-1 block text-xs text-slate-500">{b.symbols?.join(' · ')||b.markets.join(' · ')}</span><span className="mt-1 block text-[10px] text-slate-500">{b.grade} · {b.status} · target {b.benchmarkRR}R</span></span></label>)}{!books.length&&<p className="p-4 text-sm text-slate-500">{active.length?'No playbooks match your search.':'Create a playbook in the Playbook tab, or choose a journal trade to practice.'}</p>}</div>
    </section>

    <section aria-label="My journal trades" className="w-full min-w-0 rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-bold">My journal trades</h3><p className="mt-1 text-xs text-slate-500">Choose recorded trades to compare. Applying them selects their linked playbooks above.</p></div><span className="rounded-full bg-[#F1EDFF] px-3 py-1 text-xs font-semibold text-[#5338ec]">{selectedTrades.length} selected</span></div>
      <input aria-label="Search lab journal trades" placeholder="Find a trade, instrument or playbook…" className={`${inputCls} mt-4`} value={tradeQuery} onChange={e=>setTradeQuery(e.target.value)}/>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs"><label className="flex items-center gap-2"><input type="checkbox" checked={!!trades.length&&trades.every(e=>selectedTrades.includes(e.id))} onChange={e=>setSelectedTrades(e.target.checked?[...new Set([...selectedTrades,...trades.map(t=>t.id)])]:selectedTrades.filter(id=>!trades.some(t=>t.id===id)))}/>All {trades.length} matching trades</label><button className="text-[#5338ec]" onClick={()=>{setSelectedTrades([]);s.onClearBenchmark();}}>Clear selection</button></div>
        <div className="mt-2 max-h-80 overflow-auto rounded-xl border border-slate-200">{trades.map(e=><label key={e.id} className="flex cursor-pointer items-center gap-3 border-b border-slate-100 p-3 text-xs last:border-0 hover:bg-slate-50"><input type="checkbox" checked={selectedTrades.includes(e.id)} onChange={()=>setSelectedTrades(selectedTrades.includes(e.id)?selectedTrades.filter(id=>id!==e.id):[...selectedTrades,e.id])}/><span className="flex-1"><b>{e.symbol}</b> · {e.direction==='BUY'?'Long':'Short'}<span className="mt-1 block text-slate-500">{e.date} · {e.strategy||'No linked playbook'} · {currencyOf(e)}</span></span></label>)}{!trades.length&&<p className="p-4 text-sm text-slate-500">No matching journal trades. Choose a playbook or change your search.</p>}</div>
        <button className={`${btnSecondary} mt-3`} disabled={!selectedTrades.length} onClick={()=>{setCustomRules([]);setTemplates([]);onTrades(selectedTrades);goStep('setup');}}>Use {selectedTrades.length} selected trade{selectedTrades.length===1?'':'s'}</button>
        <p className="mt-2 text-[11px] text-slate-500">These records become your comparison benchmark. Your journal stays unchanged.</p>

    </section>

    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-5"><p className="text-xs text-slate-500">{chosen.length} playbook{chosen.length===1?'':'s'} · {s.benchmarkEntries.length} linked journal trades{pendingTrades?' · Apply your selected trades to continue.':''}</p><button type="button" className={btnPrimary} disabled={!chosen.length&&!s.benchmarkEntries.length||pendingTrades} onClick={()=>goStep('setup')}>Check your setup <ChevronRight size={16}/></button></div>
    </>}

    {step==='setup'&&(chosen.length||s.benchmarkEntries.length)?<section aria-label="Lab setup summary" className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-bold">2. Check your setup</h3><button type="button" className="mt-2 text-xs font-semibold text-[#5338ec]" onClick={()=>goStep('choose')}>← Change selection</button></div><div role="group" aria-label="Lab mode" className="flex gap-1 rounded-lg bg-slate-100 p-1">{(['auto','practice'] as const).map(m=><button key={m} aria-pressed={mode===m} onClick={()=>setMode(m)} className={`rounded-md px-3 py-2 text-xs font-semibold ${mode===m?'bg-white text-[#5338ec] shadow-sm':'text-slate-500'}`}>{m==='auto'?'Run automatically':'Practice myself'}</button>)}</div></div>
      {s.benchmarkEntries.length>0&&<div className="mt-4 rounded-xl bg-slate-50 p-3 text-xs"><b>{s.benchmarkEntries.length} journal trades linked</b><p className="mt-1 text-slate-500">{currencies.join(' / ')} · {s.benchmarkEntries.map(e=>e.date).sort()[0]} to {s.benchmarkEntries.map(e=>e.date).sort().at(-1)} · {chosen.map(b=>b.name).join(', ')||'Choose a linked playbook above, or practice one selected trade.'}</p><button className="mt-2 font-semibold text-[#5338ec]" onClick={()=>setShowSelectedTrades(true)}>View selected trades</button></div>}
      {mode==='auto'?<>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3"><label className="text-xs font-semibold">From · UTC<input aria-label="Lab start date" type="date" className={`${inputCls} mt-1`} value={s.settings.from} onInput={e=>patch({from:e.currentTarget.value})} onChange={e=>patch({from:e.target.value})}/></label><label className="text-xs font-semibold">To · UTC<input aria-label="Lab end date" type="date" className={`${inputCls} mt-1`} value={s.settings.to} onInput={e=>patch({to:e.currentTarget.value})} onChange={e=>patch({to:e.target.value})}/></label><label className="text-xs font-semibold">Test currency<select aria-label="Lab currency" className={`${inputCls} mt-1`} value={s.settings.risk.currency} onChange={e=>patch({risk:{...s.settings.risk,currency:e.target.value as typeof s.settings.risk.currency}})}>{['USD','EUR','GBP'].map(c=><option key={c}>{c}</option>)}</select></label></div>
        <fieldset className="mt-4"><legend className="text-xs font-bold">Instruments · each runs independently</legend>
          <label className="mt-2 block text-xs text-slate-500">Search instruments<input type="search" aria-label="Search lab instruments" placeholder="Symbol or name, e.g. EURUSD, NAS100, Gold…" value={instrumentQuery} onChange={e=>setInstrumentQuery(e.target.value)} className={`${inputCls} mt-1`}/></label>
          <div className="mt-2 flex max-h-48 flex-wrap gap-2 overflow-y-auto">{SYMBOLS.filter(item=>[item.symbol,item.name,...item.aliases].join(' ').toLowerCase().replace(/[^a-z0-9]/g,'').includes(instrumentQuery.toLowerCase().replace(/[^a-z0-9]/g,''))).map(item=><label key={item.symbol} className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-xs ${symbols.includes(item.symbol)?'border-[#BEB0FF] bg-[#F7F5FF] text-[#5338ec]':'border-slate-200'}`}><input type="checkbox" checked={symbols.includes(item.symbol)} onChange={()=>onSymbols(symbols.includes(item.symbol)?symbols.filter(s=>s!==item.symbol):[...symbols,item.symbol])}/><span>{item.symbol}<span className="ml-1 text-slate-500">· {item.name}</span></span></label>)}</div>
          {!SYMBOLS.some(item=>[item.symbol,item.name,...item.aliases].join(' ').toLowerCase().replace(/[^a-z0-9]/g,'').includes(instrumentQuery.toLowerCase().replace(/[^a-z0-9]/g,'')))&&<p className="mt-2 text-xs text-slate-500">No matching instruments. Try another symbol or name.</p>}
          <p className="mt-2 text-xs text-slate-500">{symbols.length} selected{symbols.length?': '+symbols.join(', '):''}</p>
          <p className="mt-1 text-[10px] text-slate-500">NAS100 → MNQ · US500 → MES · XAU/USD → MGC. Simulations use mapped instruments.</p>
        </fieldset>
        <p className="mt-2 text-[11px] text-slate-500">Reference balance: {s.settings.risk.startBalance.toLocaleString()} {s.settings.risk.currency}. Costs {s.settings.costs.enabled?'include commission, spread and slippage':'are off'}; review exact assumptions in Advanced customization.</p>
        {chosen.filter(b=>!playbookConditions(b).length&&!customRules.includes(b.id)).map(b=><div key={b.id} className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs"><p><b>{b.name}</b> has no saved technical conditions. Review the suggested template in Advanced customization; it does not interpret your written strategy.</p><label className="mt-2 flex items-center gap-2"><input type="checkbox" checked={templates.includes(b.id)} onChange={e=>setTemplates(e.target.checked?[...templates,b.id]:templates.filter(id=>id!==b.id))}/>Use the suggested rules for this test</label><button className="mt-2 font-semibold text-[#5338ec]" onClick={()=>setSettingsOpen(true)}>Review or edit rules in Advanced customization</button></div>)}
        {wrongCurrency&&<p role="alert" className="mt-3 text-xs text-amber-700">{currencies.length>1?'Choose journal trades in one currency before comparing results.':'Choose the journal benchmark’s currency. No currency conversion is applied.'}</p>}
        {unsupported.length>0&&<p className="mt-2 text-xs text-amber-700">No sample prices for {unsupported.join(', ')}. Their journal records remain in the benchmark; choose supported instruments to test.</p>}
        {outside&&<div className="mt-3 rounded-xl bg-amber-50 p-3 text-xs"><p>Sample prices cover {DATA_START} to {DATA_END}. Your benchmark has not been changed.</p><button className="mt-2 font-semibold text-[#5338ec]" onClick={()=>patch({from:DATA_START,to:DATA_END})}>Use available sample period</button></div>}
        {!!problems.length&&<ul role="alert" className="mt-3 space-y-1 text-xs text-amber-700">{[...new Set(problems)].map(p=><li key={p}>{p}</li>)}</ul>}
      </>:<p className="mt-4 text-sm text-slate-600">Practice one playbook or one selected trade with the existing candle-by-candle player. Supported settings load automatically; written rules stay visible as your guide.{!practiceReady?' Choose one playbook or exactly one journal trade above.':''}</p>}
      <details open={settingsOpen} onToggle={e=>setSettingsOpen(e.currentTarget.open)} className="mt-4 border-t border-slate-100 pt-3"><summary className="cursor-pointer text-xs font-bold text-[#5338ec]">Advanced customization · playbooks, risk &amp; rules</summary>
        <div className="mt-4 space-y-4">
      {chosen.length>0&&<div className="mt-4 space-y-2">{chosen.map(b=>{const st=s.settingsByPlaybook[b.id];return st?<div key={b.id} className="rounded-xl border border-[#DED5FF] bg-[#FAF8FF] p-3"><p className="text-sm font-bold">{b.name} <span className="font-normal text-[10px] text-slate-500">From playbook · editable test copy</span></p><p className="mt-1 text-xs text-slate-600">{st.timeframe} · {st.rules.direction==='both'?'Long + Short':st.rules.direction} · {st.session.id==='any'?'Any time':`${st.session.start}:00–${st.session.end}:00 UTC`} · {st.risk.mode==='percent'?`${st.risk.percent}% risk`:st.risk.mode==='fixedR'?`${st.risk.fixedR} risk`:st.risk.qty+' units'} · target {st.rules.exits.targetR}R</p><details className="mt-2 text-xs"><summary className="cursor-pointer text-[#5338ec]">Technical rules &amp; manual guidance</summary><ul className="mt-2 space-y-1 text-slate-600">{st.rules.entry.map(c=><li key={c.id}>{describeCondition(c)}</li>)}</ul><p className="mt-2 text-slate-500">Written instructions and checklists are manual guidance: {b.entryTrigger} {b.stopRule} {b.targetRule}</p></details></div>:null;})}</div>}
          {mode==='auto'&&<BacktestSetup embedded {...s} onChange={next=>{if(next.playbookId && JSON.stringify(next.rules.entry)!==JSON.stringify(s.settings.rules.entry))setCustomRules(ids=>[...new Set([...ids,next.playbookId!])]);s.onChange(next);}} onSelectionChange={choose} onRun={()=>{if(ready)s.onRun();}}/>}
          <p className="text-xs text-slate-500">Changes affect this test copy only.</p>
        </div>
      </details>
      {pendingTrades&&<p className="mt-3 text-xs text-amber-700">Click Use selected trades to apply your new benchmark.</p>}
      <div className="mt-5 flex flex-wrap items-center gap-4"><button type="button" className={`${btnPrimary} min-h-11 px-6`} disabled={mode==='auto'?!ready:!practiceReady||pendingTrades} onClick={run}><Play size={16}/>{mode==='auto'?`Run test${jobs.length>1?' · '+jobs.length+' results':''}`:'Start practice'}</button><p className="max-w-md text-[11px] text-slate-500">{mode==='auto'?s.runHint:'Practice is free. Complete a session to review what you learned.'}</p></div>
      <p className="mt-3 text-[11px] text-slate-500">Generated sample prices. Simulated fills and results are separate from your recorded trades.</p>
    </section>:null}

    {step==='choose'&&<section aria-label="Recent lab tests" className="rounded-2xl border border-slate-200 bg-white p-5"><h3 className="flex items-center gap-2 font-bold"><History size={16}/>Your discoveries</h3><p className="mt-1 text-xs text-slate-500">Recent completed tests · saved in this browser</p><div className="mt-3 divide-y divide-slate-100">{runs.slice(0,5).map(r=><div key={r.id} className="flex flex-wrap items-center gap-3 py-3"><div className="min-w-0 flex-1"><p className="text-sm font-bold">{r.name}</p><p className="mt-1 text-[11px] text-slate-500">{r.symbol} · {r.from} to {r.to} · {r.summary.trades} trades · Completed</p></div><button className={btnSecondary} onClick={()=>onOpenRun(r)}>View results</button><button className="text-xs font-semibold text-[#5338ec]" onClick={()=>onRerun(r)}>Run again</button></div>)}{!runs.length&&<p className="py-5 text-sm text-slate-500">Your first discovery is one test away. Choose a starting point above.</p>}</div></section>}
  </div>;
}

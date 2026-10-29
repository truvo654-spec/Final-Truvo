import React, { useContext, useEffect, useRef, useState } from 'react';
import type { JournalPlaybook } from '../../data/journalPlaybooks';
import type { JournalEntry } from '../../types';
import type { GlobalTradingRules } from '../../data/tradingRules';
import { loadRuns, saveRuns, type BacktestRun } from '../../backtest/store';
import { DATA_START, DATA_END } from '../../backtest/config';
import { resolveSymbol } from '../../backtest/marketData';
import { describeCondition } from '../../backtest/rules';
import { eligible, netOf } from './journalMath';
import { JournalCurrency, formatMoney } from './JournalCurrency';
import { instrumentKey } from './playbookExecution';
import { executionPrice, comparePlaybook, type ComparisonScope, type ExecutionPoint } from './playbookComparison';
import { simulationSettings, generatePlaybookSimulation } from './playbookSimulation';
import { ExecutionComparisonChart } from './ExecutionComparisonChart';
import { SimulatedTradeDetail } from './SimulatedTradeDetail';
const cell='px-3 py-3 text-left whitespace-nowrap';
const field='rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs';
const fmt=(n:number|null,suffix='')=>n===null ? '—' : n===Infinity ? '∞' : n.toFixed(1)+suffix;

export const PlaybookExecutionWorkspace:React.FC<{
  playbook:JournalPlaybook; entries:JournalEntry[]; allEntries:JournalEntry[]; comparisonEntries?:JournalEntry[]; globalRules?:GlobalTradingRules;
  onOpenEntry:(id:string)=>void; onShowTrades:(ids:string[],label:string)=>void; onReplay:(id:string)=>void; onTest?:(symbol:string)=>void;
}> = ({playbook,entries,allEntries,comparisonEntries=entries,globalRules,onOpenEntry,onShowTrades,onReplay,onTest}) => {
  const currency=useContext(JournalCurrency);
  const money=(n:number)=>formatMoney(n,currency,2);
  const savedKey=`ms_playbook_comparison_${playbook.id}`;
  const [initial]=useState(()=>{try{return JSON.parse(localStorage.getItem(savedKey)||'null') as Partial<ComparisonScope>|null;}catch{return null;}});
  const earliest=comparisonEntries.filter(e=>e.strategy===playbook.name).map(e=>e.date).sort()[0] || '2026-07-01';
  const [from,setFrom]=useState(initial?.from || (earliest<DATA_START ? DATA_START : earliest>DATA_END ? '2026-07-01' : earliest));
  const [to,setTo]=useState(initial?.to || DATA_END);
  const [balance,setBalance]=useState(initial?.balance || 100000);
  const [selection,setSelection]=useState<string[]|null>(initial?.symbols ?? null);
  const [source,setSource]=useState<'journal'|'simulated'>('journal');
  const [logSymbol,setLogSymbol]=useState('all');
  const [page,setPage]=useState(1);
  const [runs,setRuns]=useState(loadRuns);
  const [detail,setDetail]=useState<ExecutionPoint|null>(null);
  const [busy,setBusy]=useState(false);
  const [progress,setProgress]=useState('');
  const [error,setError]=useState('');
  const [notice,setNotice]=useState('');
  const abort=useRef<AbortController|null>(null);
  const logRef=useRef<HTMLElement>(null);
  const selected=selection ?? [...(playbook.symbols ?? [])];
  const available=[...new Map([...(playbook.symbols ?? []),...comparisonEntries.filter(e=>e.strategy===playbook.name).map(e=>e.symbol)].map(s=>[instrumentKey(s),s])).values()];
  const validRange=/^\d{4}-\d{2}-\d{2}$/.test(from)&&/^\d{4}-\d{2}-\d{2}$/.test(to)&&Number.isFinite(Date.parse(from))&&Number.isFinite(Date.parse(to))&&from<=to;
  const validBalance=Number.isFinite(balance)&&balance>0;
  const scope:ComparisonScope={from,to,symbols:selected.filter(s=>available.some(a=>instrumentKey(a)===instrumentKey(s))),currency,balance:validBalance?balance:100000};
  const comparison=comparePlaybook(playbook,comparisonEntries,runs,scope);
  const supported=scope.symbols.filter(s=>!!resolveSymbol(s));
  const unsupported=scope.symbols.filter(s=>!resolveSymbol(s));
  const journalHistory=comparison.history.filter(e=>logSymbol==='all'||instrumentKey(e.symbol)===instrumentKey(logSymbol)).sort((a,b)=>(b.entryTime||b.date).localeCompare(a.entryTime||a.date));
  const simPoints=comparison.simulated.points.filter(p=>logSymbol==='all'||instrumentKey(p.symbol)===instrumentKey(logSymbol)).sort((a,b)=>b.entryAt-a.entryAt);
  const count=source==='journal'?journalHistory.length:simPoints.length;
  const currentPage=Math.min(page,Math.max(1,Math.ceil(count/10)));
  const rangeProblem=!validRange?'Choose a valid start and end date.':!validBalance?'Reference balance must be greater than zero.':'';
  useEffect(()=>()=>abort.current?.abort(),[]);
  useEffect(()=>{setPage(1);},[from,to,selection,logSymbol,source]);
  useEffect(()=>{if(validRange&&validBalance){try{localStorage.setItem(savedKey,JSON.stringify(scope));}catch{}}},[from,to,balance,selection,currency]);
  const toggle=(symbol:string)=>{setSelection(current=>{const chosen=current ?? [...(playbook.symbols??[])];return chosen.includes(symbol)?chosen.filter(s=>s!==symbol):[...chosen,symbol];});setLogSymbol('all');};
  const drill=(symbol:string,next:'journal'|'simulated')=>{setLogSymbol(symbol);setSource(next);setPage(1);requestAnimationFrame(()=>{logRef.current?.scrollIntoView({behavior:'smooth',block:'start'});logRef.current?.focus({preventScroll:true});});};
  const openPoint=(point:ExecutionPoint)=>point.journal ? onOpenEntry(point.journal.id) : setDetail(point);
  const generate=async()=>{
    if(busy||rangeProblem||!supported.length)return;
    if(from<DATA_START||to>DATA_END){setError(`Sample prices cover ${DATA_START} to ${DATA_END}. Choose dates inside this range to simulate.`);return;}
    const ctl=new AbortController();abort.current=ctl;setBusy(true);setError('');setNotice('');
    const completed:BacktestRun[]=[];
    try{
      for(const [i,symbol] of supported.entries()){
        setProgress(`${i+1}/${supported.length} · ${symbol}`);
        const run=await generatePlaybookSimulation(playbook,scope,symbol,{globalRules,signal:ctl.signal,onProgress:p=>setProgress(`${i+1}/${supported.length} · ${symbol} · ${Math.round(p*100)}%`)});
        completed.push(run);
      }
      if(ctl.signal.aborted)return;
      const next=[...completed,...loadRuns()].slice(0,30);setRuns(next);
      const persisted=saveRuns(next);
      setSource('simulated');setLogSymbol('all');setPage(1);
      setNotice(`${completed.reduce((n,r)=>n+r.output.result.trades.length,0)} simulated trades generated across ${completed.length} instruments.${unsupported.length ? ` No sample prices for ${unsupported.join(', ')}.` : ''}${persisted?' Results saved in this browser.':' Browser storage is full; results are available for this visit.'}`);
    }catch(e){if(!ctl.signal.aborted)setError(e instanceof Error?e.message:'Simulation could not finish.');else setNotice('Simulation cancelled. Previous results are unchanged.');}
    finally{setBusy(false);setProgress('');}
  };
  let preview:ReturnType<typeof simulationSettings>|null=null;
  try{if(supported[0]&&validRange&&validBalance)preview=simulationSettings(playbook,scope,supported[0],globalRules);}catch{}
  const summaryPairs=[['Net P&L',money(comparison.journal.net),money(comparison.simulated.net)],['Closed trades',String(comparison.journal.count),String(comparison.simulated.count)],['Win rate',fmt(comparison.journal.winRate,'%'),fmt(comparison.simulated.winRate,'%')],['Average R',fmt(comparison.journal.avgR,'R'),fmt(comparison.simulated.avgR,'R')]];
  return <div className="min-w-0 space-y-5">
    <section aria-label="Comparison filters" className="rounded-xl border border-[#DED5FF] bg-[#FAF8FF] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><h4 className="text-sm font-bold">Compare journal &amp; simulation</h4><p className="mt-1 text-xs text-slate-500">Choose the same dates and instruments for both sources.</p></div><span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-teal-700">GENERATED SAMPLE PRICES</span></div>
      <div className="mt-4 flex flex-wrap items-end gap-3">
        <label className="text-xs font-semibold">From<input type="date" aria-label="Comparison start date" onInput={e=>{setFrom(e.currentTarget.value);setNotice('');}} value={from} disabled={busy} onChange={e=>{setFrom(e.target.value);setNotice('');}} className={`${field} mt-1 block`}/></label>
        <label className="text-xs font-semibold">To<input type="date" aria-label="Comparison end date" onInput={e=>{setTo(e.currentTarget.value);setNotice('');}} value={to} disabled={busy} onChange={e=>{setTo(e.target.value);setNotice('');}} className={`${field} mt-1 block`}/></label>
        <label className="text-xs font-semibold">Reference balance ({currency})<input type="number" min="1" step="1000" aria-label="Comparison reference balance" onInput={e=>setBalance(e.currentTarget.valueAsNumber)} value={Number.isFinite(balance)?balance:''} disabled={busy} onChange={e=>setBalance(e.target.valueAsNumber)} className={`${field} mt-1 block w-40`}/></label>
        <details className="relative min-w-[160px]"><summary className={`${field} cursor-pointer font-semibold`}>Instruments · {scope.symbols.length} selected</summary><fieldset aria-label="Comparison instruments" className="absolute left-0 top-full z-20 mt-2 max-h-80 w-64 overflow-y-auto rounded-xl border border-slate-200 bg-white p-3 shadow-xl"><legend className="sr-only">Choose instruments</legend><div className="mb-2 flex gap-3 text-xs"><button type="button" disabled={busy} onClick={()=>{setSelection([...playbook.symbols??[]]);setLogSymbol('all');}} className="font-semibold text-[#5338ec]">Playbook instruments</button><button type="button" disabled={busy} onClick={()=>setSelection([])} className="text-slate-500">Clear</button></div>{available.map(s=><label key={s} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-xs hover:bg-slate-50"><input type="checkbox" checked={scope.symbols.includes(s)} disabled={busy} onChange={()=>toggle(s)} className="accent-[#5338ec]"/>{s}{!(playbook.symbols??[]).some(x=>instrumentKey(x)===instrumentKey(s))&&<span className="ml-auto text-[10px] text-slate-400">Journal only</span>}</label>)}</fieldset></details>
        <button type="button" disabled={busy||!!rangeProblem||!supported.length} onClick={generate} className="min-h-9 rounded-lg bg-[#5338ec] px-4 py-2 text-xs font-semibold text-white hover:bg-[#4326d8] disabled:opacity-40">{busy?'Generating…':'Generate simulated results'}</button>
        {busy&&<button type="button" onClick={()=>abort.current?.abort()} className="text-xs font-semibold text-slate-600">Cancel</button>}
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">{scope.symbols.map(s=><button key={s} type="button" disabled={busy} aria-label={`Remove ${s} from comparison`} onClick={()=>toggle(s)} className="rounded-md border border-[#DED5FF] bg-white px-2 py-1 text-[11px] font-semibold text-[#5338ec]">{s} ×</button>)}</div>
      {rangeProblem&&<p role="alert" className="mt-2 text-xs text-rose-600">{rangeProblem}</p>}{error&&<p role="alert" className="mt-2 text-xs text-rose-600">{error}</p>}{notice&&<p role="status" className="mt-2 text-xs text-teal-700">{notice}</p>}{busy&&<p role="status" aria-live="polite" className="mt-2 text-xs font-semibold text-[#5338ec]">{progress}</p>}
      <p className="mt-3 text-[11px] text-slate-500">Dates filter entry days in UTC; results include eligible closes through the end date. Account, currency and other journal filters still apply. Sample prices: {DATA_START} to {DATA_END}.</p>
      <details className="mt-3 text-xs"><summary className="cursor-pointer font-semibold text-[#5338ec]">Review simulation assumptions</summary><div className="mt-2 space-y-2 rounded-lg bg-white p-3"><p>Each instrument starts independently with {new Intl.NumberFormat('en-US',{style:'currency',currency}).format(scope.balance)}. The generator uses saved technical conditions (or the playbook template), session, risk limits, target R, and default execution costs. Written instructions and checklist answers need manual review; use Backtest this playbook for advanced settings.</p>{preview&&<><p className="font-semibold">{preview.timeframe} · {preview.rules.direction} · target {preview.rules.exits.targetR}R · risk {preview.risk.percent}% · stop {JSON.stringify(preview.rules.exits.stop)}</p><ul className="space-y-1">{preview.rules.entry.map(c=><li key={c.id}>{describeCondition(c)}</li>)}</ul></>}{unsupported.length>0&&<p className="text-amber-700">No sample prices: {unsupported.join(', ')}. Journal records remain available.</p>}</div></details>
    </section>
    {!rangeProblem&&<>
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">{summaryPairs.map(([label,journal,sim])=><div key={label} className="rounded-xl border border-slate-200 bg-white p-3"><p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{label}</p><div className="mt-2 flex justify-between text-xs"><span className="text-[#5338ec]">Journal</span><strong>{comparison.journal.count?journal:'—'}</strong></div><div className="mt-1 flex justify-between text-xs"><span className="text-teal-600">Simulated</span><strong>{comparison.simulated.count?sim:comparison.rows.some(r=>r.run)&&label==='Closed trades'?'0':'—'}</strong></div></div>)}</div>
    <ExecutionComparisonChart journal={comparison.journal} simulated={comparison.simulated} from={from} to={to} format={money} onPoint={openPoint}/>
    <section aria-label="Instrument performance comparison" className="min-w-0 rounded-xl border border-slate-200 p-4"><h4 className="text-sm font-bold">Performance by instrument</h4><p className="mt-1 text-xs text-slate-500">Purple = journal · teal = simulated. Click a value to inspect its trades.</p>
      <div className="mt-3 overflow-x-auto"><table className="w-full text-xs"><thead className="bg-slate-50 text-slate-500"><tr>{['Instrument / test','Source','Trades','Net P&L','Win rate','Avg R','Profit factor','Drawdown %'].map(label=><th key={label} scope="col" className={cell}>{label}</th>)}</tr></thead><tbody>
      {comparison.rows.map(row=>(['journal','simulated'] as const).map((kind,index)=>{const stats=row[kind];return <tr key={row.symbol+kind} className={index===0?'border-t border-slate-200':'border-t border-slate-50'}>{index===0&&<th scope="rowgroup" rowSpan={2} className={`${cell} align-top`}><button type="button" onClick={()=>drill(row.symbol,'journal')} className="font-bold text-[#0b1c30] hover:text-[#5338ec]">{row.symbol}</button><span className="mt-1 block text-[10px] font-normal text-slate-500">{!row.run?'Waiting for test':row.stale?'Setup changed · regenerate':row.balanceChanged?'Balance changed · regenerate':row.partial?'Partial date coverage':!row.run.playbookFingerprint?'Earlier test · verify setup':'Test complete'}</span>{row.run&&<span className="mt-1 block text-[10px] font-normal text-slate-400">{row.run.symbol} · {row.run.timeframe}<br/>{row.run.from} to {row.run.to}</span>}{onTest&&<button type="button" disabled={!resolveSymbol(row.symbol)} onClick={()=>onTest(resolveSymbol(row.symbol)!)} className="mt-2 text-[10px] font-semibold text-[#5338ec] disabled:text-slate-300">Advanced test</button>}</th>}<td className={`${cell} ${kind==='journal'?'text-[#5338ec]':'text-teal-600'}`}>{kind==='journal'?'Journal':'Simulated'}</td>{[String(stats.count),stats.count?money(stats.net):'—',fmt(stats.winRate,'%'),fmt(stats.avgR,'R'),fmt(stats.pf),fmt(stats.drawdownPct,'%')].map((v,i)=><td key={i} className={cell}><button type="button" aria-label={`Inspect ${row.symbol} ${kind} ${['trades','net P&L','win rate','average R','profit factor','drawdown'][i]}`} onClick={()=>drill(row.symbol,kind)} className="font-semibold hover:text-[#5338ec] hover:underline">{kind==='simulated'&&!row.run?'—':v}</button></td>)}</tr>;}))}
      </tbody></table></div>{!comparison.rows.length&&<p className="mt-3 text-xs text-slate-500">Choose one or more instruments above.</p>}
      <p className="mt-3 text-[11px] text-slate-500">Drawdown % uses {new Intl.NumberFormat('en-US',{style:'currency',currency}).format(scope.balance)} as a reference starting balance for each instrument’s closed-trade P&amp;L path. It is not actual account equity drawdown. The combined chart overlays independent instrument tests, not a shared-capital portfolio backtest. Journal uses recorded position sizes; simulation uses configured risk. Use average R for a size-adjusted comparison. Average R uses trades with known initial risk; no currency conversion is applied.</p>
    </section>
    <section ref={logRef} tabIndex={-1} aria-label="Playbook executions" className="scroll-mt-24 rounded-xl border border-slate-200 p-4 outline-none">
      <div className="flex flex-wrap items-center justify-between gap-3"><h4 className="text-sm font-bold">Executions</h4><button type="button" disabled={!journalHistory.length} onClick={()=>onShowTrades(journalHistory.map(e=>e.id),`${playbook.name} · ${from} to ${to}`)} className="text-xs font-semibold text-[#5338ec] disabled:text-slate-400">Open filtered trade log ({journalHistory.length})</button></div>
      <div className="mt-3 flex flex-wrap items-center gap-3"><div role="group" aria-label="Execution source" className="flex gap-1 rounded-lg bg-slate-100 p-1">{(['journal','simulated'] as const).map(kind=><button key={kind} type="button" aria-pressed={source===kind} onClick={()=>setSource(kind)} className={`rounded-md px-3 py-2 text-xs font-semibold ${source===kind?'bg-white text-[#5338ec] shadow-sm':'text-slate-500'}`}>{kind==='journal'?`Journal trades (${comparison.history.length})`:`Simulated trades (${comparison.simulated.count})`}</button>)}</div><label className="text-xs sm:ml-auto">Instrument <select aria-label="Execution instrument" value={scope.symbols.some(s=>instrumentKey(s)===instrumentKey(logSymbol))?logSymbol:'all'} onChange={e=>setLogSymbol(e.target.value)} className={field}><option value="all">All selected instruments</option>{scope.symbols.map(s=><option key={s}>{s}</option>)}</select></label></div>
      {source==='simulated'&&simPoints.length===0&&<div className="mt-4 rounded-xl border border-dashed border-[#DED5FF] bg-[#FAF8FF] p-5"><p className="text-sm font-semibold">{comparison.rows.some(r=>r.run)?'No matching simulated trades':'Waiting for test'}</p><p className="mt-1 text-xs text-slate-500">{comparison.rows.some(r=>r.run)?'No closed trades for these filters. Review the dates, instruments and matching conditions.':'Generate simulated results for your chosen dates and instruments above.'}</p><button type="button" disabled={busy||!supported.length} onClick={generate} className="mt-3 text-xs font-semibold text-[#5338ec] disabled:opacity-40">Generate simulated results</button>{comparison.rows.filter(r=>r.run&&!r.simulated.count).map(r=><p key={r.symbol} className="mt-2 text-[11px] text-slate-500">{r.symbol}: {r.run?.output.result.zeroTradeReason||'No closes within the selected dates.'}</p>)}</div>}
      {(source==='journal'||simPoints.length>0)&&<div className="mt-3 overflow-x-auto"><table className="w-full text-xs"><thead className="bg-slate-50 text-slate-500"><tr>{['Entry / exit · UTC','Instrument','Side','Entry → exit','Net P&L','Plan / exit reason','Details'].map(label=><th key={label} className={cell}>{label}</th>)}</tr></thead><tbody>
      {source==='journal'?journalHistory.slice((currentPage-1)*10,currentPage*10).map(entry=>{const closed=comparison.journal.points.some(p=>p.id===entry.id);return <tr key={entry.id} className="border-t border-slate-100 hover:bg-slate-50"><td className={cell}>{(entry.entryTime||entry.date).replace('T',' ').slice(0,16)}<span className="mt-1 block text-[10px] text-slate-400">{entry.exitTime?entry.exitTime.replace('T',' ').slice(0,16):'Exit not recorded'}</span></td><td className={cell}>{entry.symbol}</td><td className={cell}>{entry.direction==='BUY'?'Long':'Short'}</td><td className={cell}>{executionPrice(entry.entryPrice,entry.symbol)} → {entry.exitPrice===null?'Open':executionPrice(entry.exitPrice,entry.symbol)}</td><td className={cell}>{closed?money(netOf(entry)):'Pending / incomplete'}</td><td className={cell}>{entry.followedPlan===true?'On plan':entry.followedPlan===false?'Off plan':'Not assessed'}</td><td className={cell}><button type="button" onClick={()=>onOpenEntry(entry.id)} className="font-semibold text-[#5338ec]">View trade</button><button type="button" onClick={()=>onReplay(entry.id)} className="ml-3 text-[#5338ec]">Replay</button></td></tr>;}):simPoints.slice((currentPage-1)*10,currentPage*10).map(point=>{const trade=point.trade!;return <tr key={point.id} className="border-t border-slate-100 hover:bg-slate-50"><td className={cell}>{new Date(trade.entryTime).toISOString().slice(0,16).replace('T',' ')}<span className="mt-1 block text-[10px] text-slate-400">{new Date(trade.exitTime).toISOString().slice(0,16).replace('T',' ')}</span></td><td className={cell}>{point.symbol}<span className="block text-[10px] text-teal-600">Simulated</span></td><td className={cell}>{trade.direction}</td><td className={cell}>{executionPrice(trade.entryPrice,point.symbol)} → {executionPrice(trade.exitPrice,point.symbol)}</td><td className={cell}>{money(trade.net)}<span className="block text-[10px] text-slate-400">{fmt(trade.r,'R')}</span></td><td className={cell}>{trade.exitReason}</td><td className={cell}><button type="button" onClick={()=>setDetail(point)} className="font-semibold text-[#5338ec]">View trade</button></td></tr>;})}
      </tbody></table>{source==='journal'&&!journalHistory.length&&<p className="p-6 text-center text-xs text-slate-500">No journal trades match these dates and instruments.</p>}</div>}
      {count>10&&<div className="mt-3 flex items-center justify-end gap-3 text-xs"><button type="button" disabled={currentPage===1} onClick={()=>setPage(currentPage-1)} className="disabled:text-slate-300">Previous</button><span>{currentPage} / {Math.ceil(count/10)}</span><button type="button" disabled={currentPage*10>=count} onClick={()=>setPage(currentPage+1)} className="disabled:text-slate-300">Next</button></div>}
    </section></>}
    {detail&&<SimulatedTradeDetail point={detail} onClose={()=>setDetail(null)}/>}
  </div>;
};

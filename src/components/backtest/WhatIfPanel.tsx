// What-if on your real journal trades: pick trades with the journal's filters, change one rule, compare.
import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, ChevronDown, Info, ListPlus, TrendingDown, TrendingUp } from 'lucide-react';
import type { JournalEntry } from '../../types';
import { currencyOf, eligible, resultOf, timestampMs } from '../journal/journalMath';
import { WhatIfComparison } from './WhatIfComparison';
import { useWhatIfStudy } from './useWhatIfStudy';
import { ScenarioOutcomeComparison } from './ScenarioOutcomeComparison';
import {bestValues,BestValueBadge,bestValueClass} from './comparisonHighlights';
import {SaveScenarioButton} from './SaveScenarioButton';
import {makeSavedWhatIf,savedWhatIfKey,whatIfSaveKey,type WhatIfStudyRow,type WhatIfSaveContext} from '../../backtest/savedWhatIf';
import type {WhatIfRun,WhatIfSnapshot} from '../../backtest/store';
import { compareWhatIfLedgers } from '../../backtest/whatifStudy';
import { resolveSymbol } from '../../backtest/marketData';
import { playbookWhatIfSetup, selectWhatIfBenchmark } from '../../backtest/whatifOptimizer';
import { JournalCurrency, formatMoney } from '../journal/JournalCurrency';
import type { JournalPlaybook } from '../../data/journalPlaybooks';
import { JOURNAL_TODAY } from '../../data/journalData';
import type { JournalRules } from '../../backtest/rules';
import { describeWhatIf as describeRule, ESTIMATED_RULES, runWhatIf, WhatIfRule } from '../../backtest/whatif';
import { dateOnly, money, num, pct, rr, tone, utcWindow } from '../../backtest/format';
import { loadWhatIfs, saveWhatIfs } from '../../backtest/store';
import { Card, Field, Hint, Pill, Segmented, btnPrimary, btnSecondary, inputBase, inputCls } from './ui';

interface Props {
  entries: JournalEntry[];
  allEntries: JournalEntry[];
  initialPlaybookId?: string;
  playbooks: JournalPlaybook[];
  journalRules: JournalRules;
  tz: string;
  onToast: (m: string) => void;
  onOpenTrades: (ids: string[], label: string) => void;
  onAddRule: (kind: 'rule' | 'checklist', label: string, patch?: Partial<JournalRules>) => void;
  onSaveScenario?: (run:WhatIfRun)=>boolean;
  onViewSaved?: ()=>void;
}

type Kind = WhatIfRule['kind'];
const RULES: { kind: Kind; title: string; hint: string }[] = [
  { kind: 'lossesPerDay', title: 'Stop after N losses a day', hint: 'Skip every trade taken after the Nth losing trade of that day.' },
  { kind: 'dailyLoss', title: 'Max daily loss', hint: 'Skip trades once the day is down this much.' },
  { kind: 'hours', title: 'Only trade certain hours', hint: 'Skip trades opened outside these hours (UTC).' },
  { kind: 'mistakes', title: 'Skip trades with a mistake tag', hint: 'Skip trades you tagged with these mistakes or tags.' },
  { kind: 'breakeven', title: 'Move stop to breakeven', hint: 'Once a trade is X R in profit, a return to entry closes it at breakeven.' },
  { kind: 'target', title: 'Different target', hint: 'Take profit at this many R.' },
  { kind: 'stop', title: 'Tighter stop', hint: 'Stop at a fraction of the original risk, e.g. 0.75R.' },
];

const MultiPick: React.FC<{ label: string; options: string[]; value: string[]; onChange: (v: string[]) => void }> = ({ label, options, value, onChange }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button type="button" aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen(!open)} className={`inline-flex items-center gap-1 h-9 text-xs font-semibold border rounded-lg px-3 bg-white hover:bg-slate-50 ${value.length ? 'border-[#5338ec] text-[#5338ec]' : 'border-slate-200 text-[#0b1c30]'}`}>
        {label}{value.length ? ` (${value.length})` : ': all'} <ChevronDown className="w-3.5 h-3.5" />
      </button>
      {open && (
        <div className="absolute z-20 mt-2 w-60 rounded-xl bg-white border border-slate-200 shadow-xl p-2 max-h-72 overflow-y-auto" onMouseLeave={() => setOpen(false)}>
          {options.map((o) => (
            <label key={o} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 text-xs cursor-pointer">
              <input type="checkbox" checked={value.includes(o)} onChange={() => onChange(value.includes(o) ? value.filter((x) => x !== o) : [...value, o])} />{o}
            </label>
          ))}
          <button type="button" className="text-[11px] font-semibold text-[#5338ec] hover:underline px-2 pt-1" onClick={() => onChange([])}>All</button>
        </div>
      )}
    </div>
  );
};

export const WhatIfPanel: React.FC<Props> = ({ entries, allEntries, initialPlaybookId = '', playbooks, tz, onOpenTrades, onAddRule,onToast,onSaveScenario,onViewSaved }) => {
  const currency=React.useContext(JournalCurrency);
  const money=(n:number,_currency?:unknown,dp=2,_signed=true)=>Number.isFinite(n)?formatMoney(n,currency,Math.max(2,dp)):'—';
  const describeWhatIf=(r:WhatIfRule)=>r.kind==='dailyLoss'?`Stop after ${money(r.usd)} net loss in a day`:describeRule(r);
  const [range, setRange] = useState<'all' | '30' | '90'>('all');
  const [pbs, setPbs] = useState<string[]>([]);
  const [syms, setSyms] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [result, setResult] = useState<'all' | 'wins' | 'losses'>('all');
  const [kind, setKind] = useState<Kind>('target');
  const [benchmark, setBenchmark] = useState(initialPlaybookId ? 'playbook' : 'selection');
  const [market, setMarket] = useState('all');
  const [setupMarkets, setSetupMarkets] = useState<string[]>([]);
  const [direction, setDirection] = useState('all');
  const [sessionOnly, setSessionOnly] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [transferId, setTransferId] = useState(initialPlaybookId);
  const [scenarioId, setScenarioId] = useState('');
  const transfer = playbooks.find(p => p.id === transferId);
  const dataset = useMemo(() => selectWhatIfBenchmark(entries, allEntries, benchmark, currency, transfer?.name), [entries, allEntries, benchmark, currency, transfer?.name]);
  const accounts = useMemo(() => [...new Set(allEntries.filter(e => currencyOf(e) === currency).map(e => e.accountId || 'legacy-demo'))].sort(), [allEntries, currency]);
  const benchmarkCount = (value: string) => selectWhatIfBenchmark(entries, allEntries, value, currency, transfer?.name).filter(e => eligible(e)).length;
  // Start with the two mistakes you log most often, so the first result means something.
  const topMistakes = useMemo(() => {
    const c = new Map<string, number>();
    entries.forEach((e) => e.mistakes.forEach((m) => c.set(m, (c.get(m) || 0) + 1)));
    return Array.from(c.entries()).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([m]) => m);
  }, [entries]);
  const [params, setParams] = useState({ n: 1, usd: 300, start: 7, end: 16, tags: topMistakes, be: 1, target: 2, stop: 0.75 });

  const allTags = useMemo(() => Array.from(new Set(dataset.flatMap((e) => [...e.mistakes, ...e.tags]))).sort(), [dataset]);
  const symbols = useMemo(() => Array.from(new Set(dataset.filter(e => market === 'all' || (market === 'playbook' ? setupMarkets.includes(e.assetClass) : e.assetClass === market)).map((e) => e.symbol))).sort(), [dataset, market, setupMarkets]);
  const names = useMemo(() => Array.from(new Set([...playbooks.map((p) => p.name), ...dataset.map((e) => e.strategy)])).sort(), [playbooks, dataset]);

  const picked = useMemo(() => {
    const latest = dataset.map(e => e.date).sort().at(-1) || JOURNAL_TODAY;
    const since = range === 'all' ? '' : new Date(Date.parse(`${latest}T00:00:00Z`) - Number(range) * 86400000).toISOString().slice(0, 10);
    return dataset.filter((e) => eligible(e)
      && (!since || e.date >= since)
      && (!fromDate || e.date >= fromDate) && (!toDate || e.date <= toDate)
      && (market === 'all' || (market === 'playbook' ? setupMarkets.includes(e.assetClass) : e.assetClass === market))
      && (direction === 'all' || e.direction === direction)
      && (!sessionOnly || kind === 'hours' || (() => { const t = timestampMs(e.entryTime); if (!Number.isFinite(t)) return false; const h = new Date(t).getUTCHours() + new Date(t).getUTCMinutes()/60; return params.start < params.end ? h >= params.start && h < params.end : h >= params.start || h < params.end; })())
      && (!pbs.length || pbs.includes(e.strategy))
      && (!syms.length || syms.some(s => s === e.symbol || (!!resolveSymbol(s) && resolveSymbol(s) === resolveSymbol(e.symbol))))
      && (!tags.length || [...e.tags, ...e.mistakes].some((t) => tags.includes(t)))
      && (result === 'all' || (result === 'wins' ? resultOf(e)==='win' : resultOf(e)==='loss')));
  }, [dataset, range, pbs, syms, tags, result, market, setupMarkets, direction, fromDate, toDate, sessionOnly, params.start, params.end, kind]);

  const rule: WhatIfRule = kind === 'lossesPerDay' ? { kind, n: params.n } : kind === 'dailyLoss' ? { kind, usd: params.usd } : kind === 'hours' ? { kind, start: params.start, end: params.end }
    : kind === 'mistakes' ? { kind, tags: params.tags } : kind === 'breakeven' ? { kind, r: params.be } : kind === 'target' ? { kind, r: params.target } : { kind, mult: params.stop };
  const study=useWhatIfStudy(picked,rule);
  const out=study.rows[0].output;
  const aiOut=study.aiRow?.output??null;
  const aiName=study.aiRow?describeWhatIf(study.aiRow.rule):'No qualifying AI scenario';
  const comparisonTrades=compareWhatIfLedgers(out,aiOut);
  const [savedKeys,setSavedKeys]=useState(()=>loadWhatIfs().map(savedWhatIfKey).filter((key):key is string=>key!==null));
  const saveContext=(source:WhatIfSnapshot['source']):WhatIfSaveContext=>({currency,source,goal:study.goal,
    benchmark:benchmark==='history'?'All journal history':benchmark==='playbook'?`${transfer?.name||'Selected playbook'} trade history`:benchmark.startsWith('account:')?`Account ${benchmark.slice(8)}`:'Current journal selection',
    scope:{'Market type':market==='playbook'?setupMarkets.join(', '):market,'Symbols':syms.join(', ')||'All','Direction':direction==='all'?'Long + short':direction==='BUY'?'Long':'Short','Playbook setup':transfer?.name||'Custom setup','Playbook scenario':scenarioId||'Base setup','Date range':range==='all'?'All time':`Last ${range} days (ending on latest benchmark trade)`,'From entry date':fromDate||'Any','To entry date':toDate||'Any','Session (UTC)':sessionOnly?`${params.start}:00–${params.end}:00`:'Any','Playbook filter':pbs.join(', ')||'All','Tags filter':tags.join(', ')||'All','Outcome filter':result}});
  const isScenarioSaved=(row:WhatIfStudyRow,source:WhatIfSnapshot['source'])=>savedKeys.includes(whatIfSaveKey(row.rule,saveContext(source),row.output));
  const saveScenario=(row:WhatIfStudyRow,source:WhatIfSnapshot['source'])=>{
    if(isScenarioSaved(row,source))return;
    const context=saveContext(source);
    const run=makeSavedWhatIf(row,context,`${source==='ai'?'MarketSyde AI':source==='user'?'Your setup':'Scenario'} · ${describeWhatIf(row.rule)}`);
    const saved=onSaveScenario?onSaveScenario(run):saveWhatIfs([run,...loadWhatIfs()]);
    if(saved){setSavedKeys(loadWhatIfs().map(savedWhatIfKey).filter((key):key is string=>key!==null));onToast('Scenario and results saved to Saved runs');}
    else onToast('Could not save this scenario. Browser storage is full or unavailable.');
  };
  const selectRule = (r: WhatIfRule) => {
    setKind(r.kind);
    setParams(p => ({ ...p, ...(r.kind === 'target' ? { target: r.r } : r.kind === 'breakeven' ? { be: r.r } : r.kind === 'stop' ? { stop: r.mult } : r.kind === 'dailyLoss' ? { usd: r.usd } : r.kind === 'lossesPerDay' ? { n: r.n } : r.kind === 'hours' ? { start: r.start, end: r.end } : { tags: r.tags }) }));
  };
  useEffect(() => {
    if (!transfer) {
      setKind('target'); setParams(p => ({ ...p, target: 2, start: 7, end: 16 }));
      setSessionOnly(false); setMarket('all'); setSetupMarkets([]); setSyms([]); setDirection('all');
      return;
    }
    const setup = playbookWhatIfSetup(transfer, scenarioId);
    setKind('target'); setParams(p => ({ ...p, target: setup.target, start: setup.start, end: setup.end }));
    setSessionOnly(setup.sessionOnly); setMarket(setup.market); setSetupMarkets(setup.markets);
    setSyms(setup.symbols); setPbs([]); setTags([]); setResult('all'); setDirection(setup.direction);
  }, [transfer, scenarioId]);

  const changed = out.trades.filter((t) => t.status !== 'same');
  const headline = !picked.length ? 'No journal trades match these filters.'
    : !changed.length ? `${describeWhatIf(rule)} would not have changed any of these ${picked.length} trades.`
    : `${describeWhatIf(rule)} would have ${out.saved >= 0 ? 'added' : 'cost'} ${money(Math.abs(out.saved), 'USD', 0, false)} on these ${picked.length} trades${out.skipped ? ` (${out.skipped} skipped` : ''}${out.changed ? `${out.skipped ? ', ' : ' ('}${out.changed} changed` : ''}${out.skipped || out.changed ? ')' : ''}.`;

  const ruleText = describeWhatIf(rule);
  const add = () => {
    const list = loadWhatIfs();
    saveWhatIfs([{ id: `wi_${Date.now().toString(36)}`, createdAt: new Date().toISOString(), rule, trades: picked.length, actualNet: out.actual.netPnl, whatIfNet: out.whatIf.netPnl, saved: out.saved }, ...list]);
    onAddRule('checklist', ruleText);
  };

  const rows: [string, string, number, number, number, (x: number) => string, boolean][] = [
    ['Net P&L', 'Total result of the trades', out.actual.netPnl, out.whatIf.netPnl, aiOut?.whatIf.netPnl??NaN, (x) => money(x, 'USD', 0), true],
    ['Win rate', 'Winning trades ÷ trades taken', out.actual.winRate, out.whatIf.winRate, aiOut?.whatIf.winRate??NaN, (x) => pct(x, 1), true],
    ['Profit factor', 'Positive net ÷ absolute negative net', out.actual.profitFactor ?? NaN, out.whatIf.profitFactor ?? NaN, aiOut?.whatIf.profitFactor??NaN, (x) => x===Infinity?'∞':num(x), true],
    ['Average R', 'Average result per trade in units of risk', out.actual.avgR, out.whatIf.avgR, aiOut?.whatIf.avgR??NaN, (x) => rr(x), true],
    ['Max drawdown', 'Daily closed-result drawdown by UTC entry date; no account-equity assumption', out.actual.maxDD, out.whatIf.maxDD, aiOut?.whatIf.maxDD??NaN, (x) => money(-x, 'USD', 0), false],
    ['Trades', 'Trades taken', out.actual.trades, out.whatIf.trades, aiOut?.whatIf.trades??NaN, (x) => `${x}`, true],
  ];
  const delta=(key:string,d:number)=>!Number.isFinite(d)?'—':Math.abs(d)<1e-9?'same':key==='Net P&L'||key==='Max drawdown'?money(d):`${d>0?'+':'−'}${key==='Win rate'?`${Math.abs(d*100).toFixed(1)} pts`:key==='Average R'?`${Math.abs(d).toFixed(2)}R`:key==='Trades'?Math.abs(d):Math.abs(d).toFixed(2)}`;

  return (
    <div className="space-y-5">
      <Card title="What-if scenario lab" sub="Choose a benchmark from your journal. Playbook and scenario selections apply their setup automatically.">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          <Field label="Trade history benchmark" htmlFor="wi-benchmark"><select id="wi-benchmark" className={inputCls} value={benchmark} onChange={e => setBenchmark(e.target.value)}><option value="selection">Current journal selection ({benchmarkCount('selection')})</option><option value="history">All journal history · {currency} ({benchmarkCount('history')})</option><option value="playbook" disabled={!transfer}>{transfer ? `${transfer.name} trade history (${benchmarkCount('playbook')})` : 'Selected playbook trade history'}</option>{accounts.map(account => <option key={account} value={`account:${account}`}>Account: {account} ({benchmarkCount(`account:${account}`)})</option>)}</select></Field>
          <Field label="Market type" htmlFor="wi-market"><select id="wi-market" value={market} onChange={e => { setMarket(e.target.value); setSyms([]); }} className={inputCls}><option value="all">All markets</option>{setupMarkets.length > 1 && <option value="playbook">Playbook: {setupMarkets.join(', ')}</option>}{['Forex','Crypto','Stocks','Commodity','Indices'].map(m => <option key={m}>{m}</option>)}</select></Field>
          <Field label="Instrument symbol"><MultiPick label="Symbol" options={symbols} value={syms} onChange={setSyms} /></Field>
          <Field label="Trade direction" htmlFor="wi-direction"><select id="wi-direction" value={direction} onChange={e => setDirection(e.target.value)} className={inputCls}><option value="all">Long + short</option><option value="BUY">Long only</option><option value="SELL">Short only</option></select></Field>
        </div>
        <div className="rounded-xl bg-[#FBFAFF] border border-[#5338ec]/15 p-3 mt-4">
          <div className="flex flex-wrap items-end gap-3"><Field label="Playbook setup" htmlFor="wi-transfer"><select id="wi-transfer" className={inputBase} value={transferId} onChange={e => { setTransferId(e.target.value); setScenarioId(''); setBenchmark(e.target.value ? 'playbook' : 'selection'); }}><option value="">Custom setup</option>{playbooks.filter(p => p.status !== 'archived').map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></Field>
            {transfer?.scenarios?.length ? <Field label="Playbook scenario" htmlFor="wi-idea"><select id="wi-idea" className={inputBase} value={scenarioId} onChange={e => setScenarioId(e.target.value)}><option value="">Base playbook setup</option>{transfer.scenarios.map(s => <option key={s.id} value={s.id}>{s.symbol} · {s.bias} · {s.status}</option>)}</select></Field> : null}
            <span className="text-[11px] text-[#5338ec] h-9 inline-flex items-center">{transfer ? 'Setup applied automatically · editable below' : 'Choose a playbook to apply its setup'}</span>
          </div>
          {transfer && <div className="text-[11px] text-slate-500 mt-2 space-y-1"><p>{transfer.name}: benchmark {transfer.benchmarkRR}R · {transfer.window?.label || 'Any session'} · risk {transfer.riskPerTrade ?? '—'}% · max {transfer.maxTradesPerDay ?? '—'} trades/day</p><p>Target R, instrument scope, direction and UTC session transfer automatically. A priced scenario uses its own planned R. Change the benchmark above to compare against other journal history.</p><p>Reference stop: {transfer.stopRule} · Target: {transfer.targetRule}</p><p>Written entry rules, partial exits, trailing stops and percentage position sizing are reference context; this test changes one supported rule on recorded trades.</p></div>}
        </div>
        <div className="flex flex-wrap items-end gap-3 mt-4"><Field label="From entry date" htmlFor="wi-from"><input id="wi-from" type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className={inputBase} /></Field><Field label="To entry date" htmlFor="wi-to"><input id="wi-to" type="date" value={toDate} min={fromDate || undefined} onChange={e => setToDate(e.target.value)} className={inputBase} /></Field><label className="flex gap-2 items-center h-9 text-xs"><input type="checkbox" checked={sessionOnly} onChange={e => setSessionOnly(e.target.checked)} />Filter to setup session (UTC)</label>{sessionOnly && <><input type="number" aria-label="Setup session start UTC" min={0} max={23} value={params.start} onChange={e => setParams(p => ({...p,start:Math.max(0,Math.min(23,Number(e.target.value)))}))} className={`${inputBase} w-20`} /><span className="text-xs">to</span><input type="number" aria-label="Setup session end UTC" min={0} max={24} value={params.end} onChange={e => setParams(p => ({...p,end:Math.max(0,Math.min(24,Number(e.target.value)))}))} className={`${inputBase} w-20`} /></>}</div>
        <p className="text-[11px] text-slate-500 mt-3">History stays linked to your journal, including imported and newly recorded trades. Benchmark counts show eligible closed trades before setup filters. {currency} only · {benchmark === 'selection' ? 'Current selection follows the journal account, dates and filters.' : 'This benchmark uses its own date scope below.'} Relative ranges end on the benchmark’s latest trade. {dataset.filter(e => !eligible(e)).length} records excluded for open status or unknown P&amp;L / fees. {kind === 'hours' && sessionOnly ? 'The hours rule’s parameter range replaces the setup session filter during comparison.' : ''}</p>
      </Card>
      <div className="flex flex-wrap items-center gap-2" role="toolbar" aria-label="Which trades to test">
        <Segmented label="Date range" value={range} onChange={setRange} options={[{ id: 'all', label: 'All time' }, { id: '90', label: 'Last 90 days' }, { id: '30', label: 'Last 30 days' }]} />
        <MultiPick label="Playbook" options={names} value={pbs} onChange={setPbs} />
        <MultiPick label="Tags" options={allTags} value={tags} onChange={setTags} />
        <Segmented label="Result" value={result} onChange={setResult} options={[{ id: 'all', label: 'All results' }, { id: 'wins', label: 'Wins' }, { id: 'losses', label: 'Losses' }]} />
        <span className="ml-auto text-xs text-[#474556] tabular-nums">Testing <b className="text-[#0b1c30]">{picked.length}</b> filtered trades</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)] gap-5 items-start">
        <div className="space-y-5 min-w-0">
        <Card title="Scenario parameter" sub="Choose a rule, then compare its parameter range below.">
          <div className="space-y-2" role="radiogroup" aria-label="Rule to change">
            {RULES.map((r) => {
              const on = kind === r.kind;
              return (
                <div key={r.kind} className={`rounded-xl border p-3 ${on ? 'border-[#5338ec] bg-[#FBFAFF]' : 'border-slate-200'}`}>
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input type="radio" name="whatif-rule" checked={on} onChange={() => setKind(r.kind)} className="mt-0.5" />
                    <span className="flex-1">
                      <span className="text-xs font-bold text-[#0b1c30]">{r.title}</span>
                      {ESTIMATED_RULES.includes(r.kind) && <Pill tone="warn" className="ml-1.5" title="Journal trades have no recorded price path, so this uses a path rebuilt from entry, stop, exit and times.">Estimate</Pill>}
                      <span className="block text-[11px] text-slate-500">{r.hint}</span>
                    </span>
                  </label>
                  {on && (
                    <div className="mt-2.5 pl-6 flex flex-wrap items-center gap-2 text-xs">
                      {r.kind === 'lossesPerDay' && (<><input type="number" min={1} max={10} aria-label="Losses per day" value={params.n} onChange={(e) => setParams({ ...params, n: Math.max(1, Number(e.target.value)) })} className={`${inputBase} w-20`} /> losses</>)}
                      {r.kind === 'dailyLoss' && (<>{currency}<input type="number" min={10} step={50} aria-label={`Max daily loss in ${currency}`} value={params.usd} onChange={(e) => setParams({ ...params, usd: Math.max(1, Number(e.target.value)) })} className={`${inputBase} w-28`} /></>)}
                      {r.kind === 'hours' && (<>
                        <select aria-label="From hour UTC" value={params.start} onChange={(e) => setParams({ ...params, start: Number(e.target.value) })} className={`${inputBase} w-auto`}>{Array.from({ length: 24 }, (_, h) => <option key={h} value={h}>{String(h).padStart(2, '0')}:00</option>)}</select>
                        to
                        <select aria-label="To hour UTC" value={params.end} onChange={(e) => setParams({ ...params, end: Number(e.target.value) })} className={`${inputBase} w-auto`}>{Array.from({ length: 24 }, (_, h) => <option key={h} value={h + 1}>{String((h + 1) % 24).padStart(2, '0')}:00</option>)}</select>
                        <span className="basis-full text-[11px] text-slate-500">{utcWindow(params.start, params.end, tz)}</span>
                      </>)}
                      {r.kind === 'mistakes' && (
                        <div className="flex flex-wrap gap-1.5">
                          {allTags.map((t) => { const sel = params.tags.includes(t); return <button key={t} type="button" aria-pressed={sel} onClick={() => setParams({ ...params, tags: sel ? params.tags.filter((x) => x !== t) : [...params.tags, t] })} className={`h-7 px-2.5 rounded-full text-[11px] font-semibold border ${sel ? 'bg-rose-50 border-rose-300 text-rose-700' : 'bg-white border-slate-200 text-[#474556]'}`}>{t}</button>; })}
                        </div>
                      )}
                      {r.kind === 'breakeven' && (<>at <input type="number" min={0.25} step={0.25} aria-label="Breakeven at R" value={params.be} onChange={(e) => setParams({ ...params, be: Number(e.target.value) })} className={`${inputBase} w-20`} /> R</>)}
                      {r.kind === 'target' && (<><input type="number" min={0.1} step={0.1} aria-label="Target R" value={params.target} onChange={e => setParams(p => ({ ...p, target: Math.max(0.1,Number(e.target.value)) }))} className={`${inputBase} w-24`} />R</>)}
                      {r.kind === 'stop' && (<Segmented size="sm" label="Stop size" value={String(params.stop)} onChange={(v) => setParams({ ...params, stop: Number(v) })} options={['0.5', '0.75', '0.9'].map((x) => ({ id: x, label: `${x}R` }))} />)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
        {picked.length>0&&<ScenarioOutcomeComparison user={out} ai={aiOut} aiName={aiName} userName={describeWhatIf(rule)}/>}
        </div>

        <div className="space-y-5 min-w-0">
          {picked.length > 0 && <WhatIfComparison entries={picked} selectedSymbols={syms} instrumentOptions={symbols} onInstrument={symbol=>setSyms([symbol])} rule={rule} model={study} onSelect={selectRule} onSave={saveScenario} isSaved={isScenarioSaved}/>}
          <section className={`rounded-2xl border p-5 ${out.saved > 0 ? 'border-emerald-200 bg-emerald-50' : out.saved < 0 ? 'border-rose-200 bg-rose-50' : 'border-slate-200 bg-white'}`} aria-live="polite">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Result</p>
            <p className="text-lg font-bold text-[#0b1c30] mt-0.5 flex items-start gap-2">
              {out.saved > 0 ? <TrendingUp className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" /> : out.saved < 0 ? <TrendingDown className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" /> : null}{headline}
            </p>
            {picked.length > 0 && <p className="text-xs text-[#474556] mt-1">{out.lossesAvoided} losing trade{out.lossesAvoided === 1 ? '' : 's'} avoided or reduced · {out.winsForfeited} winning trade{out.winsForfeited === 1 ? '' : 's'} given up or cut.{out.estimated ? ' This rule is an estimate based on rebuilt price paths.' : ''}</p>}
            <div className="flex flex-wrap gap-2 mt-3">
              {picked.length>0&&<SaveScenarioButton name="your scenario" saved={isScenarioSaved(study.rows[0],'user')} onSave={()=>saveScenario(study.rows[0],'user')} label/>}
              {onViewSaved&&<button type="button" className={btnSecondary} onClick={onViewSaved}>View Saved runs <ArrowRight className="w-3.5 h-3.5"/></button>}
              <button type="button" className={btnPrimary} disabled={!picked.length} onClick={add}><ListPlus className="w-4 h-4" /> Add this as a rule in my checklist</button>
            </div>
          </section>

          {picked.length > 0 && (<>
            <Card title="Actual vs what-if" sub="Full filtered history: actual trades, your selected rule and the independently selected MarketSyde AI scenario.">
              <p className="text-[11px] text-[#5338ec] mb-3">MarketSyde AI: {aiName}{aiOut?.estimated?' · Estimated price path':''}. Selection uses training results; totals below also include holdout trades.</p>
              <p className="text-[11px] text-slate-500 mb-3">Green = best historical value per measure, shared for ties. Lower drawdown is better; trade counts are context.</p>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-xs tabular-nums">
                  <thead><tr className="text-[10px] uppercase tracking-wider text-slate-500 border-b border-slate-200"><th className="text-left py-2 pr-3">Measure</th><th className="text-right py-2 px-2">What you did</th><th className="text-right py-2 px-2">With the rule <SaveScenarioButton name="your scenario" saved={isScenarioSaved(study.rows[0],'user')} onSave={()=>saveScenario(study.rows[0],'user')}/></th><th className="text-right py-2 px-2 text-[#5338ec] bg-[#F5F2FF]">MarketSyde AI result {study.aiRow&&<SaveScenarioButton name="MarketSyde AI scenario" saved={isScenarioSaved(study.aiRow,'ai')} onSave={()=>saveScenario(study.aiRow!,'ai')}/>}</th><th className="text-right py-2 px-2">Your Δ actual</th><th className="text-right py-2 pl-2">AI Δ your setup</th></tr></thead>
                  <tbody>
                    {rows.map(([k, hint, a, b, c, f, hi]) => {
                      const d = b - a;
                      const good = hi ? d > 1e-9 : d < -1e-9;
                      const bad = hi ? d < -1e-9 : d > 1e-9;
                      const aiDelta=c-b;
                      const aiGood=hi?aiDelta>1e-9:aiDelta<-1e-9;
                      const aiBad=hi?aiDelta<-1e-9:aiDelta>1e-9;
                      const highlight=k==='Trades'?null:bestValues([a,b,c],hi);
                      return (
                        <tr key={k} className="border-b border-slate-100">
                          <td className="py-2 pr-3 font-semibold"><Hint text={hint}>{k}</Hint></td>
                          {[a,b,c].map((value,index)=><td key={index} className={`py-2 px-2 text-right ${index?'font-bold':''} ${highlight?.winners.includes(index)?bestValueClass:index===2?'text-[#5338ec] bg-[#F5F2FF]':''}`}>
                            {Number.isNaN(value)?'—':f(value)}{highlight?.winners.includes(index)&&<span className="block mt-1"><BestValueBadge tied={highlight.tied}/></span>}
                          </td>)}
                          <td className={`py-2 px-2 text-right font-bold ${k === 'Trades' ? 'text-slate-500' : good ? 'text-emerald-600' : bad ? 'text-rose-600' : 'text-slate-400'}`}>
                            {delta(k,d)}
                          </td>
                          <td className={`py-2 pl-2 text-right font-bold ${k==='Trades'?'text-slate-500':aiGood?'text-emerald-600':aiBad?'text-rose-600':'text-slate-400'}`}>{delta(k,aiDelta)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>

            <Card title={`Trades that changed (${comparisonTrades.length})`} sub="Trades changed by either your setup or MarketSyde AI, matched by journal trade ID. Green highlights the highest net result for each trade; ties share it." right={comparisonTrades.length > 0 ? <button type="button" className={btnSecondary} onClick={() => onOpenTrades(comparisonTrades.map(({user}) => user.id), `What-if: your setup vs MarketSyde AI`)}>Open in Trade Log <ArrowRight className="w-3.5 h-3.5" /></button> : undefined}>
              {comparisonTrades.length === 0 ? <p className="text-xs text-slate-500 flex items-center gap-1.5"><Info className="w-3.5 h-3.5" /> Neither available setup changed these trades.</p> : (
                <div className="overflow-x-auto -mx-5 px-5">
                  <table className="w-full min-w-[1000px] text-xs tabular-nums">
                    <thead><tr className="text-[10px] uppercase tracking-wider text-slate-500 border-b border-slate-200"><th className="text-left py-2 pr-2">Date</th><th className="text-left py-2 px-2">Symbol</th><th className="text-left py-2 px-2">Playbook</th><th className="text-right py-2 px-2">Actual</th><th className="text-right py-2 px-2">With the rule</th><th className="text-right py-2 px-2 text-[#5338ec] bg-[#F5F2FF]">MarketSyde AI result</th><th className="text-right py-2 px-2">AI Δ your setup</th><th className="text-left py-2 pl-2">What happened</th></tr></thead>
                    <tbody>
                      {comparisonTrades.slice(0, 15).map(({user:t,ai}) => {
                        const highlight=bestValues([t.actualNet,t.newNet,ai?.newNet??NaN]);
                        const badge=(index:number)=>highlight.winners.includes(index)?<span className="block mt-1"><BestValueBadge tied={highlight.tied}/></span>:null;
                        return (
                        <tr key={t.id} className="border-b border-slate-100">
                          <td className="py-2 pr-2 whitespace-nowrap">{dateOnly(t.entryTime, tz)}</td>
                          <td className="py-2 px-2 font-semibold">{t.symbol} <span className={t.direction === 'BUY' ? 'text-emerald-700' : 'text-rose-700'}>{t.direction === 'BUY' ? 'Long' : 'Short'}</span></td>
                          <td className="py-2 px-2">{t.strategy}</td>
                          <td className={`py-2 px-2 text-right ${highlight.winners.includes(0)?bestValueClass:tone(t.actualNet)}`}>{money(t.actualNet, 'USD', 0)} <span className="text-slate-400">{rr(t.actualR, 1)}</span>{badge(0)}</td>
                          <td className={`py-2 px-2 text-right font-bold ${highlight.winners.includes(1)?bestValueClass:t.status === 'skipped' ? 'text-slate-500' : tone(t.newNet)}`}>{t.status === 'skipped' ? `Skipped · ${money(0)} net` : <>{money(t.newNet, 'USD', 0)} <span className="text-slate-400 font-normal">{rr(t.newR, 1)}</span></>}{badge(1)}</td>
                          <td className={`py-2 px-2 text-right font-bold ${highlight.winners.includes(2)?bestValueClass:'text-[#5338ec] bg-[#F5F2FF]'}`}>{!ai?'—':ai.status==='skipped'?`Skipped · ${money(0)} net`:<>{money(ai.newNet)} <span className="text-slate-400 font-normal">{rr(ai.newR,1)}</span></>}{badge(2)}</td>
                          <td className={`py-2 px-2 text-right font-semibold ${ai?tone(ai.newNet-t.newNet):'text-slate-400'}`}>{ai?money(ai.newNet-t.newNet):'—'}</td>
                          <td className="py-2 pl-2 text-[#474556]"><p>Your setup: {t.note||'Unchanged'}</p><p className="text-[#5338ec] mt-1">AI: {ai?(ai.note||'Unchanged'):'Unavailable'}</p></td>
                        </tr>
                      );})}
                    </tbody>
                  </table>
                  {comparisonTrades.length > 15 && <p className="text-[11px] text-slate-500 mt-2">+{comparisonTrades.length - 15} more. Open them in the Trade Log to see all.</p>}
                </div>
              )}
            </Card>
          </>)}
        </div>
      </div>
      {!picked.length && <Card title="Choose a trade benchmark"><p className="text-xs text-slate-500">No eligible trades match this benchmark and setup. Choose all journal history or another account, or broaden the market, symbol, date or session filters.</p></Card>}
    </div>
  );
};

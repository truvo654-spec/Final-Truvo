import { JournalHelp } from '../journal/JournalHelp';
import React, { useEffect, useMemo, useState } from 'react';
import type { JournalEntry } from '../../types';
import type { WhatIfRule } from '../../backtest/whatif';
import { describeWhatIf as describeRule } from '../../backtest/whatif';
import { dayMs, marketData, resolveSymbol, symbolSpec } from '../../backtest/marketData';
import type { Bar } from '../../backtest/types';
import { JournalCurrency, formatMoney } from '../journal/JournalCurrency';
import { CandleChart, LineChart } from './charts';
import { Card, Field, Pill, inputBase, btnSecondary } from './ui';
import { MarketSydeRecommender, RecommendationBadge } from './MarketSydeRecommender';
import type { WhatIfStudyModel } from './useWhatIfStudy';
import type {WhatIfStudyRow} from '../../backtest/savedWhatIf';
import type {WhatIfSnapshot} from '../../backtest/store';
import {SaveScenarioButton} from './SaveScenarioButton';

const COLORS = ['#5338ec', '#059669', '#0284c7', '#d97706', '#db2777', '#7c3aed'];
export const WhatIfComparison: React.FC<{ entries: JournalEntry[]; selectedSymbols:string[]; instrumentOptions:string[]; onInstrument:(symbol:string)=>void; rule: WhatIfRule; model:WhatIfStudyModel; onSelect: (rule: WhatIfRule) => void; onSave:(row:WhatIfStudyRow,source:WhatIfSnapshot['source'])=>void; isSaved:(row:WhatIfStudyRow,source:WhatIfSnapshot['source'])=>boolean }> = ({ entries, selectedSymbols,instrumentOptions,onInstrument,rule, model, onSelect,onSave,isSaved }) => {
  const currency = React.useContext(JournalCurrency);
  const money = (n: number) => Number.isFinite(n) ? formatMoney(n, currency, 2) : '—';
  const describeWhatIf = (rule: WhatIfRule) => rule.kind === 'dailyLoss' ? `Stop after ${money(rule.usd)} net loss in a day` : describeRule(rule);
  const {bounds,setBounds,goal:recommendationGoal,setGoal:setRecommendationGoal,baseline:recommendationBaseline}=model;
  const comparison={rows:model.rows,error:model.error};
  const recommendation={...model.recommendation,candidate:model.recommendation.candidate&&model.aiRow?{...model.recommendation.candidate,name:describeWhatIf(model.aiRow.rule)}:null};
  const [score, setScore] = useState('net');
  const [improvedOnly, setImprovedOnly] = useState(false);
  const [visible, setVisible] = useState<string[] | null>(null);

  const [chartEnd, setChartEnd] = useState<number | null>(null);
  const [equityScope, setEquityScope] = useState('benchmark');
  const [chartView, setChartView] = useState('combined');
  useEffect(() => { setVisible(null); }, [rule.kind]);

  const rank = (row: typeof comparison.rows[number]) => score === 'drawdown' ? -row.training.whatIf.maxDD : score === 'win' ? row.training.whatIf.winRate : row.training.whatIf.netPnl;
  const ranked = [...comparison.rows].sort((a, b) => rank(b) - rank(a));
  const shown = ranked.filter(r => !improvedOnly || r.output.saved > 0);
  const selected = shown.filter(r => visible ? visible.includes(r.id) : shown.indexOf(r) < 3 || r.id === recommendation.candidate?.id || r.id === JSON.stringify(rule)).slice(0,6);
  const symbols = Array.from(new Set<string>(entries.map(e => e.symbol))).sort();
  const instrument=selectedSymbols.map(selected=>symbols.find(symbol=>symbol===selected||(!!resolveSymbol(selected)&&resolveSymbol(selected)===resolveSymbol(symbol)))).find(Boolean)||symbols[0]||'';
  useEffect(()=>{setChartEnd(null);},[instrument,entries]);
  const canonical = resolveSymbol(instrument);
  const matchesSymbol = (symbol: string) => canonical ? resolveSymbol(symbol) === canonical : symbol === instrument;
  const actualTrades = comparison.rows[0]?.output.trades ?? [];
  const bars = useMemo((): Bar[] => {
    if (!canonical || !entries.length) return [];
    const timestamps = actualTrades.flatMap(t => [t.entryTime, t.exitTime]);
    if (!timestamps.length) return [];
    const start = Math.floor(Math.min(...timestamps) / dayMs) * dayMs;
    const end = Math.floor(Math.max(...timestamps) / dayMs) * dayMs + dayMs;
    const s = marketData.seriesSync(canonical, '1D');
    const result: Bar[] = [];
    for (let i = 0; i < s.length; i++) if (s.t[i] >= start && s.t[i] < end) result.push({ t: s.t[i], o: s.o[i], h: s.h[i], l: s.l[i], c: s.c[i], v: s.v[i] });
    return result;
  }, [canonical, actualTrades, entries]);
  const origin = actualTrades.length ? [{ x: Math.min(...actualTrades.map(t => t.entryTime)), y: 0 }] : [];
  const scopedTrades = (trades: typeof actualTrades) => equityScope === 'benchmark' ? trades : trades.filter(t => matchesSymbol(t.symbol));
  const actualCurve = (() => { let total = 0; return [...origin, ...[...scopedTrades(actualTrades)].sort((a,b) => a.exitTime-b.exitTime).map(t => ({ x: t.exitTime, y: total += t.actualNet }))]; })();
  const portfolioSeries = [{ name: 'Actual', color: '#94a3b8', dashed: true, points: actualCurve }, ...selected.map((row, i) => {
    let total = 0;
    return { name: (row.id === JSON.stringify(rule) ? 'Your setup · ' : '') + describeWhatIf(row.rule) + (row.id === recommendation.candidate?.id ? (recommendation.status === 'exploratory' ? ' · AI exploration' : ' · MarketSyde AI') : ''), color: row.id === recommendation.candidate?.id ? '#5338ec' : row.id === JSON.stringify(rule) ? '#0284c7' : COLORS[(i + 1) % COLORS.length], points: [...origin, ...[...scopedTrades(row.output.trades)].sort((a,b) => a.exitTime-b.exitTime).map(t => ({ x: t.exitTime, y: total += t.newNet }))] };
  })];
  const dailyPoints = (trades: typeof actualTrades, actual: boolean) => {
    const sorted = [...scopedTrades(trades)].sort((a,b) => a.exitTime-b.exitTime);
    let index = 0, total = 0;
    return bars.map(bar => {
      while (index < sorted.length && sorted[index].exitTime < bar.t + dayMs) { total += actual ? sorted[index].actualNet : sorted[index].newNet; index++; }
      return { x: bar.t, y: total };
    });
  };
  const candleSeries = [{ name: 'Actual', color: '#94a3b8', dashed: true, points: dailyPoints(actualTrades, true) }, ...selected.map((row, i) => ({ name: (row.id === JSON.stringify(rule) ? 'Your setup · ' : '') + describeWhatIf(row.rule) + (row.id === recommendation.candidate?.id ? (recommendation.status === 'exploratory' ? ' · AI exploration' : ' · MarketSyde AI') : ''), color: row.id === recommendation.candidate?.id ? '#5338ec' : row.id === JSON.stringify(rule) ? '#0284c7' : COLORS[(i + 1) % COLORS.length], points: dailyPoints(row.output.trades, false) }))];
  const to = Math.max(Math.min(chartEnd ?? bars.length, bars.length), Math.min(70, bars.length));
  const from = Math.max(0, to - 70);
  const first = comparison.rows[0];
  const rowSource=(row:WhatIfStudyRow):WhatIfSnapshot['source']=>row.id===JSON.stringify(rule)?'user':row.id===model.aiRow?.id?'ai':'parameter';
  return <div className="space-y-5">
    <MarketSydeRecommender recommendation={recommendation} baseline={recommendationBaseline} baselineName="actual journal history on the training days" goal={recommendationGoal} onGoal={setRecommendationGoal} money={money}
      evidence={`Selection uses the first 70% of entry days. The remaining days are checked independently; crossing trades stay in full-history results only. AI explores ${model.tested} supported setups across guardrails, session, tags and price-dependent rules, including your parameter range.`} action="Compare AI scenario" onUse={id => {setImprovedOnly(false);setVisible([...new Set([JSON.stringify(rule),id])]);}} />
    <Card title="Candles & scenario comparison" sub="Compare actual and What-if equity alongside market candles on one timeline.">
      <div className="flex flex-wrap items-end gap-3 mb-3">
        <Field label="Candle instrument · linked to setup" htmlFor="wi-chart-symbol"><select id="wi-chart-symbol" className={inputBase} value={instrument} onChange={e => onInstrument(e.target.value)}>{instrumentOptions.map(s => <option key={s}>{s}</option>)}</select></Field>
        <Field label="Equity scope" htmlFor="wi-equity-scope"><select id="wi-equity-scope" className={inputBase} value={equityScope} onChange={e => setEquityScope(e.target.value)}><option value="benchmark">All filtered benchmark trades</option><option value="instrument">Selected instrument only</option></select></Field>
        <Field label="Chart view" htmlFor="wi-chart-view"><select id="wi-chart-view" className={inputBase} value={chartView} onChange={e => setChartView(e.target.value)}><option value="combined">Candles + equity</option><option value="equity">Equity only · full history</option></select></Field>
      </div>
      <p className="text-[11px] text-slate-500 mb-3">Changing the candle instrument updates the scenario lab symbol filter. {equityScope === 'benchmark' ? 'Lines include all filtered benchmark trades across instruments.' : `Lines include only ${instrument || 'the selected instrument'} trades.`} {chartView === 'combined' && bars.length ? `Candles show ${instrument || 'the selected instrument'} prices on an independent right axis; equity uses ${currency} on the left.` : `Cumulative realized net P&L in ${currency}, ordered by recorded exit time.`}</p>
      {chartView === 'combined' && bars.length ? <><CandleChart label={`${instrument} demo candles and ${equityScope === 'benchmark' ? 'benchmark' : 'instrument'} scenario equity`} bars={bars} from={from} to={to} height={380} dp={symbolSpec(instrument)?.priceDp ?? 2} pnl={{ currency, series: candleSeries, detail: time => <div>{candleSeries.map(s => <p key={s.name}>{s.name}: {money(s.points.find(p => p.x === time)?.y ?? NaN)}</p>)}</div> }} />
        <label className="block text-[11px] text-slate-500 mt-3">Chart timeline<JournalHelp label="Chart timeline" /><input type="range" aria-label="What-if candle timeline" min={Math.min(70,bars.length)} max={bars.length} value={to} onChange={e => setChartEnd(Number(e.target.value))} className="w-full accent-[#5338ec]" /></label></> : <>
        {chartView === 'combined' && <p role="status" className="text-xs text-slate-500 mb-3">No demo candles for this instrument and date range. Showing full-history equity.</p>}
        <LineChart label="Actual and What-if full-history equity" height={340} area={false} yFmt={money} xFmt={x => new Date(x).toISOString().slice(0,10)} series={portfolioSeries} />
      </>}
      <p className="text-[11px] text-slate-500 mt-3">Generated demo candles are context only and do not drive What-if calculations. Combined view shows cumulative realized net P&amp;L at each candle’s day end. Candle coverage: Oct 1, 2024 – Oct 7, 2026. Use Equity only for all exit dates beyond this coverage.</p>
    </Card>
    <Card title="Parameter optimization" sub="Sweep one parameter on the same trades. Select rows to compare up to six scenarios on the main chart.">
      <div className="flex flex-wrap items-end gap-3 mb-4">
        {rule.kind !== 'mistakes' ? bounds.map((value, i) => <Field key={i} label={['Minimum', 'Maximum', 'Step'][i]} htmlFor={`wi-bound-${i}`}><input id={`wi-bound-${i}`} type="number" min="0.01" step={rule.kind === 'lossesPerDay' || rule.kind === 'hours' ? 1 : 0.25} value={value} onChange={e => { setBounds(b => b.map((v, j) => i === j ? Number(e.target.value) : v)); setVisible(null); }} className={`${inputBase} w-24`} /></Field>) : <p className="text-xs text-slate-500">Compare the selected tag set with each individual tag.</p>}
        <Field label="Rank by training result" htmlFor="wi-rank"><select id="wi-rank" className={inputBase} value={score} onChange={e => setScore(e.target.value)}><option value="net">Highest net P&amp;L</option><option value="drawdown">Lowest drawdown</option><option value="win">Highest win rate</option></select></Field>
        <label className="flex items-center gap-2 h-9 text-xs"><input type="checkbox" checked={improvedOnly} onChange={e => setImprovedOnly(e.target.checked)} />Improved net only<JournalHelp label="Improved net only" /></label>
      </div>
      <p className="text-[11px] text-slate-500 mb-3">{rule.kind === 'hours' ? 'Range is session duration in hours, from the selected UTC start.' : rule.kind === 'dailyLoss' ? `Range is daily loss in ${currency}.` : rule.kind === 'lossesPerDay' ? 'Range is the number of losses allowed each day.' : rule.kind !== 'mistakes' ? 'Range is measured in R, relative to each recorded trade’s initial risk.' : ''} The current setup is included alongside the range. A highlighted AI scenario can use another supported rule.</p>
      {['stop','target','breakeven'].includes(rule.kind) && <p className="text-[11px] text-amber-700 mb-3">Price-path coverage: {entries.filter(e => Number.isFinite(e.initialRisk) && e.initialRisk! > 0).length} / {entries.length} trades have initial monetary risk. Missing-risk trades stay unchanged. Paths are reconstructed estimates, not recorded candles.</p>}
      {comparison.error && <p role="alert" className="text-xs text-rose-600">{comparison.error}</p>}
      {first && <div className="flex flex-wrap gap-2 mb-3"><Pill tone="info">{first.trainingCount} training trades</Pill><Pill tone="neutral">{first.validationCount} holdout trades</Pill><span className="text-[11px] text-slate-500">First 70% of entry days train; remaining days validate independently. {first.validationCount ? 'Holdout results do not determine ranking.' : 'More entry days are needed for a holdout.'} {first.crossingCount ? `${first.crossingCount} trades cross the split and appear only in full-history results.` : ''}</span></div>}
      {entries.length < 30 && <p className="text-[11px] text-amber-700 mb-3">Small sample: {entries.length} trades. An in-sample winner is a hypothesis to test.</p>}
      <div className="overflow-x-auto"><table className="w-full min-w-[790px] text-xs tabular-nums"><thead><tr className="border-b text-slate-500 text-left"><th className="py-2">Chart / scenario</th><th className="text-right">Net P&amp;L<JournalHelp label="Net P&L" /></th><th className="text-right">Δ actual</th><th className="text-right">Win rate<JournalHelp label="Win rate" /></th><th className="text-right">Drawdown</th><th className="text-right">Taken / skipped</th><th className="text-right">Training Δ</th><th className="text-right">Holdout Δ</th><th>Actions</th></tr></thead><tbody>
        <tr className="bg-slate-50 border-b"><td className="py-3 font-bold">Actual history</td><td className="text-right">{money(first?.output.actual.netPnl ?? NaN)}</td><td className="text-right">—</td><td className="text-right">{first && Number.isFinite(first.output.actual.winRate) ? `${(first.output.actual.winRate*100).toFixed(1)}%` : '—'}</td><td className="text-right">{money(first?.output.actual.maxDD ?? NaN)}</td><td className="text-right">{entries.length} / 0</td><td colSpan={3} /></tr>
        {shown.map(row => <tr key={row.id} className={`border-b border-slate-100 ${row.id === recommendation.candidate?.id ? 'bg-[#F1EDFF]' : ''} ${JSON.stringify(rule) === row.id ? 'bg-[#FBFAFF]' : ''}`}><td className="py-3 pr-3"><label className="flex items-start gap-2"><input type="checkbox" aria-label={`Chart ${describeWhatIf(row.rule)}`} checked={selected.some(r => r.id === row.id)} disabled={!selected.some(r => r.id === row.id) && selected.length >= 6} onChange={() => setVisible(selected.some(r => r.id === row.id) ? selected.filter(r => r.id !== row.id).map(r => r.id) : [...selected.map(r => r.id), row.id])} /><span>{describeWhatIf(row.rule)}{row.id === recommendation.candidate?.id && <span className="block mt-1"><RecommendationBadge exploratory={recommendation.status === 'exploratory'} /></span>}{row.output.estimated && <span className="block text-[10px] text-amber-600">Estimated price path</span>}</span></label></td><td className="text-right font-bold">{money(row.output.whatIf.netPnl)}</td><td className={`text-right ${row.output.saved > 0 ? 'text-emerald-600' : row.output.saved < 0 ? 'text-rose-600' : ''}`}>{money(row.output.saved)}</td><td className="text-right">{Number.isFinite(row.output.whatIf.winRate) ? `${(row.output.whatIf.winRate*100).toFixed(1)}%` : '—'}</td><td className="text-right">{money(row.output.whatIf.maxDD)}</td><td className="text-right">{row.output.whatIf.trades} / {row.output.skipped}</td><td className="text-right">{money(row.training.saved)}</td><td className="text-right">{money(row.validation?.saved ?? NaN)}</td><td className="pl-3"><div className="flex items-center gap-1"><SaveScenarioButton name={describeWhatIf(row.rule)} saved={isSaved(row,rowSource(row))} onSave={()=>onSave(row,rowSource(row))}/><button className={btnSecondary} type="button" onClick={() => onSelect(row.rule)}>Use setup</button></div></td></tr>)}
      </tbody></table></div>
      {!shown.length && !comparison.error && <p role="status" className="text-xs text-slate-500 mt-3">No scenarios match this comparison filter.</p>}
    </Card>
  </div>;
};

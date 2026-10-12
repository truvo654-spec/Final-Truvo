import React, { useMemo, useState } from 'react';
import type { JournalEntry } from '../../types';
import type { JournalPlaybook } from '../../data/journalPlaybooks';
import { computeMetrics } from '../../backtest/metrics';
import { liveStats } from '../../backtest/gap';
import { dateOnly, money, num, pct, rr, tone, utcWindow } from '../../backtest/format';
import { SESSIONS, type Bar } from '../../backtest/types';
import { dayMs, marketData, SYMBOLS, marketGroupOf, symbolSpec } from '../../backtest/marketData';
import { ACCENT, DOWN, UP, CandleChart } from './charts';
import { Card, btnSecondary, inputBase, Pill } from './ui';
import { JournalTradeBenchmark } from './JournalTradeBenchmark';
import type { BacktestSettings, JobOutput } from '../../backtest/types';

const SCENARIO_COLORS = [ACCENT, UP, DOWN, '#0284c7', '#d97706', '#7c3aed', '#0f766e', '#ea580c'];
const CHART_WINDOW = 85;
const scenarioId = (item: BacktestComparisonItem, index: number) => item.settings.playbookId ?? `scenario-${index}`;

export interface BacktestComparisonItem {
  settings: BacktestSettings;
  output: JobOutput;
}

interface Props {
  items: BacktestComparisonItem[];
  playbooks: JournalPlaybook[];
  entries: JournalEntry[];
  benchmarkEntries: JournalEntry[];
  tz: string;
  onOpenTrades: (ids: string[], label: string) => void;
  onEditSetup: () => void;
  onViewResult: (item: BacktestComparisonItem) => void;
  onChangeInstrument: (symbol: string) => void;
}

export const BacktestComparisonResults: React.FC<Props> = ({ items, playbooks, entries, benchmarkEntries, tz, onOpenTrades, onEditSetup, onViewResult, onChangeInstrument }) => {
  const [visibleScenarios, setVisibleScenarios] = useState<Set<string>>(() => new Set(items.map(scenarioId)));
  const [instrumentQuery, setInstrumentQuery] = useState('');
  const [chartEnd, setChartEnd] = useState<number | null>(null);
  const rows = useMemo(() => items.map((item) => {
    const { settings, output } = item;
    const result = output.result;
    const metrics = computeMetrics(result.trades, result.startBalance, result.rangeStart, result.rangeEnd);
    const playbook = playbooks.find((p) => p.id === settings.playbookId);
    const matchingEntries = playbook ? entries.filter((e) => e.strategy === playbook.name) : [];
    const live = playbook ? liveStats(entries, playbook.name) : null;
    const session = settings.session.id === 'any'
      ? 'Any time'
      : `${settings.session.id === 'custom' ? 'Custom hours' : SESSIONS[settings.session.id].label} ${utcWindow(settings.session.start, settings.session.end, tz)}`;
    return { item, metrics, playbook, matchingEntries, live, session, currency: result.currency };
  }), [items, playbooks, entries, tz]);
  const shared = items[0]?.settings;
  const chartBars = useMemo((): Bar[] => {
    if (!shared) return [];
    const series = marketData.seriesSync(shared.symbol, '1D');
    const start = Date.parse(`${shared.from}T00:00:00Z`);
    const end = Date.parse(`${shared.to}T00:00:00Z`) + dayMs;
    const bars: Bar[] = [];
    for (let i = 0; i < series.length; i++) {
      const t = series.t[i];
      if (t < start) continue;
      if (t >= end) break;
      bars.push({ t, o: series.o[i], h: series.h[i], l: series.l[i], c: series.c[i], v: series.v[i] });
    }
    return bars;
  }, [shared?.from, shared?.symbol, shared?.to]);
  const scenarios = useMemo(() => items.map((item, index) => {
    const playbook = playbooks.find((p) => p.id === item.settings.playbookId);
    const trades = [...item.output.result.trades].sort((a, b) => a.exitTime - b.exitTime);
    let tradeIndex = 0;
    let cumulativeNet = 0;
    return {
      key: scenarioId(item, index),
      name: `${playbook?.name ?? item.settings.name} · ${item.settings.symbol}`,
      color: SCENARIO_COLORS[index % SCENARIO_COLORS.length],
      points: chartBars.map((bar) => {
        const dayEnd = bar.t + dayMs;
        while (tradeIndex < trades.length && trades[tradeIndex].exitTime <= dayEnd) {
          cumulativeNet += trades[tradeIndex].net;
          tradeIndex++;
        }
        return { x: bar.t, y: cumulativeNet };
      }),
    };
  }), [items, playbooks, chartBars]);
  const shownSeries = scenarios.filter((scenario) => visibleScenarios.has(scenario.key));
  const instrumentMatches = useMemo(() => {
    const query = instrumentQuery.trim().toLowerCase();
    if (!query) return [];
    return SYMBOLS.filter((instrument) => instrument.symbol !== shared?.symbol && [
      instrument.symbol,
      instrument.name,
      marketGroupOf(instrument),
      ...instrument.aliases,
    ].some((value) => value.toLowerCase().includes(query)));
  }, [instrumentQuery, shared?.symbol]);
  if (!shared) return null;
  const instrument = symbolSpec(shared.symbol);
  const visibleTo = chartBars.length
    ? Math.max(Math.min(chartEnd ?? chartBars.length, chartBars.length), Math.min(CHART_WINDOW, chartBars.length))
    : 0;
  const visibleFrom = Math.max(0, visibleTo - CHART_WINDOW);

  return (
    <div className="space-y-5">
      {benchmarkEntries.length > 0 && <JournalTradeBenchmark entries={benchmarkEntries} />}
      <Card title="Scenario comparison" sub="Daily generated candles show the selected instrument; colored lines show each playbook's cumulative net P&L. Hover for candle prices and scenario results."
        right={
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Market instrument</span>
            <Pill tone="accent" title={instrument?.name}>{shared.symbol}</Pill>
            <div className="relative w-full sm:w-56">
              <input
                type="search"
                role="combobox"
                aria-label="Search market instruments"
                aria-autocomplete="list"
                aria-controls="comparison-instrument-results"
                aria-expanded={!!instrumentQuery.trim()}
                autoComplete="off"
                placeholder="Search symbol or name"
                value={instrumentQuery}
                onChange={(event) => setInstrumentQuery(event.target.value)}
                className={`${inputBase} w-full text-xs`}
              />
              {!!instrumentQuery.trim() && (
                <div id="comparison-instrument-results" role="listbox" className="absolute right-0 top-full z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white p-1 shadow-lg">
                  {instrumentMatches.length ? instrumentMatches.map((match) => (
                    <button
                      key={match.symbol}
                      type="button"
                      role="option"
                      aria-selected={false}
                      onClick={() => {
                        setInstrumentQuery('');
                        onChangeInstrument(match.symbol);
                      }}
                      className="flex w-full items-start justify-between gap-3 rounded-md px-2.5 py-2 text-left hover:bg-[#F8F7FF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5338ec]"
                    >
                      <span className="text-xs font-bold text-[#0b1c30]">{match.symbol}</span>
                      <span className="text-right text-[10px] text-slate-500">{match.name} · {marketGroupOf(match)}</span>
                    </button>
                  )) : (
                    <p role="status" className="px-2.5 py-2 text-xs text-slate-500">No other supported instruments match.</p>
                  )}
                </div>
              )}
            </div>
            <span className="sr-only">Selecting an instrument opens setup; run the comparison there to generate new results.</span>
          </div>
        }>
        <div className="mb-3 flex flex-wrap gap-x-4 gap-y-2" role="group" aria-label="Scenarios shown on chart">
          {scenarios.map((scenario) => (
            <label key={scenario.key} className="inline-flex items-center gap-2 text-xs font-semibold text-[#0b1c30]">
              <input
                type="checkbox"
                checked={visibleScenarios.has(scenario.key)}
                onChange={() => setVisibleScenarios((current) => {
                  const next = new Set(current);
                  if (next.has(scenario.key)) next.delete(scenario.key);
                  else next.add(scenario.key);
                  return next;
                })}
                className="accent-[#5338ec]"
              />
              <span className="inline-block h-0.5 w-4" style={{ backgroundColor: scenario.color }} aria-hidden />
              {scenario.name}
            </label>
          ))}
        </div>
        {chartBars.length ? (
          <>
            <CandleChart
              label={`${shared.symbol} daily demo prices and scenario net P&L`}
              bars={chartBars}
              from={visibleFrom}
              to={visibleTo}
              dp={instrument?.priceDp ?? 2}
              height={320}
              pnl={{
                series: shownSeries,
                currency: shared.risk.currency,
                detail: (time) => (
                  <div className="mt-1 space-y-0.5">
                    {shownSeries.map((scenario) => {
                      const point = scenario.points.find((candidate) => candidate.x === time);
                      return point && <p key={scenario.key}>{scenario.name}: {money(point.y, shared.risk.currency, 0, false)}</p>;
                    })}
                  </div>
                ),
              }}
            />
            <label className="mt-3 block text-[11px] font-semibold text-slate-600">
              Chart timeline · {dateOnly(chartBars[visibleFrom].t, tz)} – {dateOnly(chartBars[visibleTo - 1].t, tz)}
              <input
                type="range"
                aria-label="Candlestick chart timeline"
                aria-valuetext={`${dateOnly(chartBars[visibleFrom].t, tz)} to ${dateOnly(chartBars[visibleTo - 1].t, tz)}`}
                min={Math.min(CHART_WINDOW, chartBars.length)}
                max={chartBars.length}
                value={visibleTo}
                onChange={(event) => setChartEnd(Number(event.target.value))}
                className="mt-2 w-full accent-[#5338ec]"
              />
            </label>
          </>
        ) : (
          <p className="grid h-40 place-items-center text-xs text-slate-500">No daily price candles are available for this market and date range.</p>
        )}
      </Card>
      <Card title="Playbook comparison" sub="Each playbook used the same market, dates, balance, risk and costs; its own rules, timeframe and session were preserved."
        right={<button type="button" className={btnSecondary} onClick={onEditSetup}>Edit comparison setup</button>}>
        <p className="mb-3 text-[11px] text-slate-500">Historical simulations are comparisons, not forecasts. Open a full report for robustness checks and the simulated trade log.</p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-xs tabular-nums">
            <thead>
              <tr className="border-b border-slate-200 text-left text-[10px] uppercase tracking-wider text-slate-500">
                <th className="py-2 pr-3">Playbook</th>
                <th className="px-3 py-2">Timeframe / session</th>
                <th className="px-3 py-2 text-right">Net P&amp;L / ROI</th>
                <th className="px-3 py-2 text-right">Win rate</th>
                <th className="px-3 py-2 text-right">Average R</th>
                <th className="px-3 py-2 text-right">Profit factor</th>
                <th className="px-3 py-2 text-right">Max drawdown</th>
                <th className="px-3 py-2 text-right">Trades</th>
                <th className="px-3 py-2">Live journal</th>
                <th className="py-2 pl-3">Open</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ item, metrics: m, playbook, matchingEntries, live, session, currency }) => (
                <tr key={item.settings.playbookId} className="border-b border-slate-100 align-top">
                  <td className="py-3 pr-3">
                    <p className="font-bold text-[#0b1c30]">{playbook?.name ?? item.settings.name}</p>
                    <p className="mt-0.5 text-[10px] text-slate-400">{item.settings.symbol} · {item.settings.from} → {item.settings.to}</p>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">{item.settings.timeframe}<p className="mt-0.5 text-[10px] text-slate-500">{session}</p></td>
                  <td className="px-3 py-3 text-right whitespace-nowrap">
                    <span className={`font-bold ${tone(m.netPnl)}`}>{money(m.netPnl, currency, 0)}</span>
                    <p className="mt-0.5 text-[10px] text-slate-500">{pct(m.netPct, 1, true)}</p>
                  </td>
                  <td className="px-3 py-3 text-right">{m.trades ? pct(m.winRate, 0) : '—'}</td>
                  <td className={`px-3 py-3 text-right font-semibold ${tone(m.avgR)}`}>{m.trades ? rr(m.avgR) : '—'}</td>
                  <td className="px-3 py-3 text-right">{m.trades ? (m.profitFactor === null ? '∞' : num(m.profitFactor)) : '—'}</td>
                  <td className="px-3 py-3 text-right text-rose-600">{m.trades ? pct(-m.maxDDPct) : '—'}</td>
                  <td className="px-3 py-3 text-right">{m.trades}</td>
                  <td className="px-3 py-3 whitespace-nowrap">{live?.trades ? <>{pct(live.winRate, 0)} · {rr(live.avgR)}<p className="mt-0.5 text-[10px] text-slate-500">{live.trades} closed</p></> : <span className="text-slate-400">No eligible trades</span>}</td>
                  <td className="py-3 pl-3">
                    <div className="flex flex-col items-start gap-1.5">
                      <button type="button" className="font-semibold text-[#5338ec] hover:underline" onClick={() => onViewResult(item)}>Full report</button>
                      {matchingEntries.length > 0 && <button type="button" className="font-semibold text-[#5338ec] hover:underline" onClick={() => onOpenTrades(matchingEntries.map((e) => e.id), `${playbook?.name ?? 'Playbook'} journal`)}>Trade Log ({matchingEntries.length})</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

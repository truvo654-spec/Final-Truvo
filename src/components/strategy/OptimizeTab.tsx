import React, { useEffect, useMemo, useState } from 'react';
import { Bar, Strategy } from './engine/types';
import { GridMetric, GridResult, Tunable, getTunables, linspace, robustness, runGrid } from './engine/optimize';
import { GridHeatmap } from './StrategyCharts';
import { ratio } from './format';
import { Field, NumInput, SelectBox } from './ui';

const METRICS: { id: GridMetric; label: string; higher: boolean; fmt: (v: number) => string }[] = [
  { id: 'returnPct', label: 'Total return', higher: true, fmt: (v) => `${v.toFixed(0)}%` },
  { id: 'sharpe', label: 'Sharpe ratio', higher: true, fmt: (v) => v.toFixed(2) },
  { id: 'profitFactor', label: 'Profit factor', higher: true, fmt: (v) => v.toFixed(2) },
  { id: 'winRate', label: 'Win rate', higher: true, fmt: (v) => `${v.toFixed(0)}%` },
  { id: 'maxDrawdownPct', label: 'Worst drawdown (lower is better)', higher: false, fmt: (v) => `${v.toFixed(0)}%` },
];

export const OptimizeTab: React.FC<{ strategy: Strategy; bars: Bar[]; onApply: (changes: { tunable: Tunable; value: number }[]) => void }> = ({ strategy, bars, onApply }) => {
  const tunables = useMemo(() => getTunables(strategy), [strategy]);
  const [aId, setAId] = useState('');
  const [bId, setBId] = useState('');
  const [metric, setMetric] = useState<GridMetric>('sharpe');
  const [steps, setSteps] = useState(5);
  const [ranges, setRanges] = useState<Record<string, [number, number]>>({});
  const [run, setRun] = useState<{ grid: GridResult; a: Tunable; b: Tunable; sig: string } | null>(null);
  const [progress, setProgress] = useState<number | null>(null);

  // keep the two pickers valid when the strategy changes
  useEffect(() => {
    if (!tunables.find((t) => t.id === aId)) setAId(tunables[0]?.id ?? '');
    if (!tunables.find((t) => t.id === bId) || bId === aId) setBId(tunables.find((t) => t.id !== (tunables.find((x) => x.id === aId) ? aId : tunables[0]?.id))?.id ?? '');
  }, [tunables, aId, bId]);

  const A = tunables.find((t) => t.id === aId);
  const B = tunables.find((t) => t.id === bId);
  const meta = METRICS.find((m) => m.id === metric)!;
  const rangeOf = (t: Tunable): [number, number] => ranges[t.id] ?? [t.min, t.max];
  const sig = JSON.stringify(strategy);
  const stale = !!run && run.sig !== sig;

  if (tunables.length < 2)
    return (
      <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-8 text-center">
        <p className="text-lg font-bold text-[#0b1c30]">Not enough numbers to sweep</p>
        <p className="text-sm text-[#474556] mt-2 max-w-lg mx-auto">Optimisation tries a grid of values for two numbers in your strategy, for example two indicator lengths, or a stop and a target. Add rules with indicator lengths, and a stop loss and take profit, and come back.</p>
      </div>
    );

  const go = async () => {
    if (!A || !B) return;
    const [aMin, aMax] = rangeOf(A);
    const [bMin, bMax] = rangeOf(B);
    setProgress(0);
    const grid = await runGrid(strategy, bars, A, linspace(Math.min(aMin, aMax), Math.max(aMin, aMax), steps, A.integer), B, linspace(Math.min(bMin, bMax), Math.max(bMin, bMax), steps, B.integer), metric, (d, t) => setProgress(d / t));
    setRun({ grid, a: A, b: B, sig });
    setProgress(null);
  };

  const rb = run ? robustness(run.grid) : null;
  const nearest = (xs: number[], v: number | undefined) => (v === undefined ? -1 : xs.reduce((best, x, i) => (Math.abs(x - v) < Math.abs(xs[best] - v) ? i : best), 0));
  const cur = run ? { x: nearest(run.grid.xs, run.a.get(strategy)), y: nearest(run.grid.ys, run.b.get(strategy)) } : null;
  const bestCell = run && rb ? run.grid.cells[rb.bestY]?.[rb.bestX] : null;
  const apply = (xi: number, yi: number) => run && onApply([{ tunable: run.a, value: run.grid.xs[xi] }, { tunable: run.b, value: run.grid.ys[yi] }]);

  return (
    <div className="space-y-4">
      <section className="bg-white border border-[#e2e8f0] rounded-2xl p-4 sm:p-5">
        <h3 className="text-sm font-bold text-[#0b1c30]">Optimise two numbers</h3>
        <p className="text-xs text-[#6b7686] mt-0.5 mb-4">Runs the strategy for every pair of values in a grid and colours each cell by the result. Look for a wide green area, not a single bright spot.</p>
        <div className="grid sm:grid-cols-2 gap-4">
          {([['Across (left to right)', A, aId, setAId], ['Down (top to bottom)', B, bId, setBId]] as const).map(([label, t, id, setId]) => (
            <div key={label} className="space-y-2">
              <Field label={label}>
                <SelectBox value={id} onChange={setId} ariaLabel={label} options={tunables.map((x) => ({ value: x.id, label: x.label }))} />
              </Field>
              {t && (
                <div className="grid grid-cols-2 gap-2">
                  <Field label="From"><NumInput value={rangeOf(t)[0]} onChange={(v) => setRanges((r) => ({ ...r, [t.id]: [v, rangeOf(t)[1]] }))} step={t.integer ? 1 : 0.5} integer={t.integer} ariaLabel={`${label} from`} /></Field>
                  <Field label="To"><NumInput value={rangeOf(t)[1]} onChange={(v) => setRanges((r) => ({ ...r, [t.id]: [rangeOf(t)[0], v] }))} step={t.integer ? 1 : 0.5} integer={t.integer} ariaLabel={`${label} to`} /></Field>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="grid sm:grid-cols-3 gap-4 mt-4 items-end">
          <Field label="Colour cells by"><SelectBox<GridMetric> value={metric} onChange={setMetric} ariaLabel="Result to colour by" options={METRICS.map((m) => ({ value: m.id, label: m.label }))} /></Field>
          <Field label="Grid size"><SelectBox<number> value={steps} onChange={setSteps} ariaLabel="Grid size" options={[3, 5, 7, 9].map((s) => ({ value: s, label: `${s} × ${s} (${s * s} runs)` }))} /></Field>
          <button type="button" onClick={go} disabled={progress !== null || !A || !B || aId === bId} className="h-[34px] rounded-lg bg-[#5338ec] hover:bg-[#4326d8] disabled:opacity-50 text-white text-sm font-bold transition-colors">
            {progress !== null ? `Running… ${Math.round(progress * 100)}%` : 'Run optimisation'}
          </button>
        </div>
        {aId === bId && <p className="text-xs text-amber-700 mt-2">Pick two different numbers.</p>}
      </section>

      {run && rb && bestCell && (
        <section className="bg-white border border-[#e2e8f0] rounded-2xl p-4 sm:p-5">
          {stale && <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2 mb-3">Your strategy changed since this run. Run it again for fresh results.</p>}
          <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
            <div>
              <h3 className="text-sm font-bold text-[#0b1c30]">Results: {meta.label}</h3>
              <p className="text-xs text-[#6b7686] mt-0.5">Purple ring is the best cell. Dark outline is your current setting. Click any cell to use its values.</p>
            </div>
            <button type="button" onClick={() => apply(rb.bestX, rb.bestY)} className="px-3.5 py-2 rounded-lg bg-[#5338ec] hover:bg-[#4326d8] text-white text-xs font-bold transition-colors">Use the best cell</button>
          </div>
          <GridHeatmap grid={run.grid} xLabel={run.a.label.replace(/ \(now [^)]*\)$/, '')} yLabel={run.b.label.replace(/ \(now [^)]*\)$/, '')} format={meta.fmt} higherBetter={meta.higher} best={{ x: rb.bestX, y: rb.bestY }} current={cur} onPick={apply} />
          <div className="grid sm:grid-cols-3 gap-3 mt-4">
            <div className="bg-slate-50 rounded-xl px-4 py-3">
              <p className="text-[11px] font-bold uppercase tracking-wide text-[#6b7686]">Best cell</p>
              <p className="text-sm font-bold text-[#0b1c30] mt-0.5">{run.grid.xs[rb.bestX]} · {run.grid.ys[rb.bestY]}</p>
              <p className="text-[11px] text-[#6b7686]">{meta.label} {meta.fmt(bestCell.value)} · return {bestCell.returnPct.toFixed(1)}% · drawdown {bestCell.maxDD.toFixed(1)}% · {bestCell.trades} trades</p>
            </div>
            <div className="bg-slate-50 rounded-xl px-4 py-3">
              <p className="text-[11px] font-bold uppercase tracking-wide text-[#6b7686]">Neighbours of the best</p>
              <p className="text-sm font-bold text-[#0b1c30] mt-0.5">{meta.fmt(rb.neighbourMean)} on average</p>
              <p className="text-[11px] text-[#6b7686]">The cells next to the best one.</p>
            </div>
            <div className="bg-slate-50 rounded-xl px-4 py-3">
              <p className="text-[11px] font-bold uppercase tracking-wide text-[#6b7686]">Stability</p>
              <p className={`text-sm font-bold mt-0.5 ${rb.score >= 0.7 ? 'text-emerald-600' : rb.score >= 0.4 ? 'text-amber-600' : 'text-rose-600'}`}>{rb.score >= 0.7 ? 'Broad plateau' : rb.score >= 0.4 ? 'Somewhat peaked' : 'A lone peak'} ({ratio(rb.score)})</p>
              <p className="text-[11px] text-[#6b7686]">Neighbours as a share of the best.</p>
            </div>
          </div>
          <div className="mt-4 text-xs text-[#474556] leading-relaxed space-y-1.5">
            {rb.score < 0.4 && <p className="bg-amber-50 text-amber-800 rounded-lg px-3 py-2">The best cell is much better than its neighbours. That usually means the numbers were tuned to this exact history and will not carry over. Prefer settings in the middle of a wide good area.</p>}
            <p>Choosing the best cell on the history you tested on always flatters the result. Check the chosen settings on the other simulated histories in the Stress test tab before you trust them.</p>
          </div>
        </section>
      )}
    </div>
  );
};

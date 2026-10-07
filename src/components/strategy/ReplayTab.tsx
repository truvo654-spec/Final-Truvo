import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BacktestResult, Trade } from './engine/types';
import { series as indicatorSeries, isPriceScale } from './engine/indicators';
import { describeOperand } from './engine/templates';
import { getInstrument } from './engine/marketData';
import { Overlay, PriceChart } from './StrategyCharts';
import { dateTime, money, signedMoney } from './format';
import { SelectBox } from './ui';

const COLORS = ['#f59e0b', '#0ea5e9', '#8b5cf6', '#ec4899', '#14b8a6', '#84cc16'];

/** Transport icons drawn the same way so none of them turn into coloured emoji. */
const ICONS: Record<string, string> = {
  start: 'M5 5h2v14H5z M20 6v12l-11-6z',
  prevTrade: 'M11 6v12l-9-6z M22 6v12l-9-6z',
  back: 'M17 6v12l-10-6z',
  play: 'M7 5v14l12-7z',
  pause: 'M7 5h4v14H7z M13 5h4v14h-4z',
  forward: 'M7 6v12l10-6z',
  nextTrade: 'M13 6v12l9-6z M2 6v12l9-6z',
  end: 'M4 6v12l11-6z M17 5h2v14h-2z',
};
const Ico: React.FC<{ name: keyof typeof ICONS }> = ({ name }) => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" aria-hidden>
    <path d={ICONS[name]} />
  </svg>
);

/** Bar-by-bar replay. The chart only shows what had happened by the current candle, so nothing leaks from the future. */
export const ReplayTab: React.FC<{ result: BacktestResult; focusTrade: Trade | null; onClearFocus: () => void }> = ({ result: r, focusTrade, onClearFocus }) => {
  const n = r.bars.length;
  const [idx, setIdx] = useState(() => Math.max(0, (r.trades[0]?.entryIdx ?? 60) - 30));
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(5);
  const [win, setWin] = useState(100);
  const [highlight, setHighlight] = useState<number | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const ins = getInstrument(r.strategy.instrument);

  // jump to a trade picked in the table
  useEffect(() => {
    if (focusTrade) {
      setIdx(Math.min(n - 1, Math.max(0, focusTrade.entryIdx - 6)));
      setHighlight(focusTrade.id);
      setPlaying(false);
      onClearFocus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusTrade]);

  useEffect(() => {
    if (!playing) return;
    const ms = Math.max(30, 600 / speed);
    timer.current = window.setInterval(() => {
      setIdx((i) => {
        if (i >= n - 1) {
          setPlaying(false);
          return i;
        }
        return i + 1;
      });
    }, ms);
    return () => window.clearInterval(timer.current);
  }, [playing, speed, n]);

  // what to draw on the price chart and in the extra panel
  const { overlays, oscillator } = useMemo(() => {
    const ops = [
      ...r.strategy.longEntry.conditions,
      ...r.strategy.shortEntry.conditions,
      ...r.strategy.exit.exitRules.conditions,
    ].flatMap((c) => [c.left, c.right]);
    const seen = new Set<string>();
    const over: Overlay[] = [];
    let osc: { name: string; values: number[]; levels?: number[]; color: string } | undefined;
    ops.forEach((o) => {
      const name = describeOperand(o);
      if (seen.has(name) || o.kind === 'price' || o.kind === 'value' || o.kind === 'atr') return;
      seen.add(name);
      if (isPriceScale(o.kind)) over.push({ name, color: COLORS[over.length % COLORS.length], values: indicatorSeries(r.bars, o) });
      else if (!osc) osc = { name, values: indicatorSeries(r.bars, o), color: '#8b5cf6', levels: o.kind === 'rsi' ? [30, 70] : o.kind === 'stoch' ? [20, 80] : o.kind.startsWith('macd') ? [0] : undefined };
    });
    return { overlays: over, oscillator: osc };
  }, [r]);

  const from = Math.max(0, Math.min(n - win, idx + 4 - win));
  const to = Math.min(n, from + win);
  const upTo = idx;
  const bar = r.bars[idx];
  const openTrade = r.trades.find((t) => t.entryIdx <= idx && t.exitIdx > idx) ?? null;
  const doneTrades = r.trades.filter((t) => t.exitIdx <= idx);
  const wins = doneTrades.filter((t) => t.pnl > 0).length;
  const eq = r.equity[idx];
  const nextTrade = r.trades.find((t) => t.entryIdx > idx + 1);
  const prevTrade = [...r.trades].reverse().find((t) => t.entryIdx < idx - 8);
  const unreal = openTrade ? openTrade.dir * (bar.c - openTrade.entryPrice) * (ins.jpyQuote ? ins.valuePerUnit / bar.c : ins.valuePerUnit) * openTrade.lots : 0;

  const stepBtn = 'w-9 h-9 rounded-lg border border-slate-200 bg-white hover:border-[#5338ec] hover:text-[#5338ec] text-[#0b1c30] flex items-center justify-center text-sm font-bold transition-colors disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:text-[#0b1c30]';

  return (
    <div className="space-y-3">
      <div className="bg-white border border-[#e2e8f0] rounded-2xl p-3 sm:p-4">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <button type="button" aria-label="Back to the start" onClick={() => { setPlaying(false); setIdx(Math.max(0, (r.trades[0]?.entryIdx ?? 60) - 30)); }} className={stepBtn}><Ico name="start" /></button>
          <button type="button" aria-label="Previous trade" disabled={!prevTrade} onClick={() => prevTrade && setIdx(Math.max(0, prevTrade.entryIdx - 6))} className={stepBtn}><Ico name="prevTrade" /></button>
          <button type="button" aria-label="Back one candle" onClick={() => { setPlaying(false); setIdx((i) => Math.max(0, i - 1)); }} className={stepBtn}><Ico name="back" /></button>
          <button type="button" aria-label={playing ? 'Pause' : 'Play'} onClick={() => { if (idx >= n - 1) setIdx(Math.max(0, (r.trades[0]?.entryIdx ?? 60) - 30)); setPlaying((p) => !p); }} className="w-11 h-9 rounded-lg bg-[#5338ec] hover:bg-[#4326d8] text-white flex items-center justify-center text-sm font-bold transition-colors">{playing ? <Ico name="pause" /> : <Ico name="play" />}</button>
          <button type="button" aria-label="Forward one candle" onClick={() => { setPlaying(false); setIdx((i) => Math.min(n - 1, i + 1)); }} className={stepBtn}><Ico name="forward" /></button>
          <button type="button" aria-label="Next trade" disabled={!nextTrade} onClick={() => nextTrade && setIdx(Math.max(0, nextTrade.entryIdx - 6))} className={stepBtn}><Ico name="nextTrade" /></button>
          <button type="button" aria-label="Jump to the end" onClick={() => { setPlaying(false); setIdx(n - 1); }} className={stepBtn}><Ico name="end" /></button>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wide text-[#6b7686]">Speed</span>
            <div className="w-24"><SelectBox<number> value={speed} onChange={setSpeed} ariaLabel="Replay speed" options={[{ value: 1, label: '1×' }, { value: 3, label: '3×' }, { value: 5, label: '5×' }, { value: 10, label: '10×' }, { value: 25, label: '25×' }]} /></div>
            <span className="text-[11px] font-bold uppercase tracking-wide text-[#6b7686]">Candles</span>
            <div className="w-24"><SelectBox<number> value={win} onChange={setWin} ariaLabel="Candles on screen" options={[{ value: 50, label: '50' }, { value: 100, label: '100' }, { value: 160, label: '160' }, { value: 240, label: '240' }]} /></div>
          </div>
        </div>
        <input type="range" min={0} max={n - 1} value={idx} onChange={(e) => { setPlaying(false); setIdx(Number(e.target.value)); }} aria-label="Position in the history" className="w-full accent-[#5338ec] mb-3" />

        <PriceChart bars={r.bars} from={from} to={to} overlays={overlays} trades={r.trades} upTo={upTo} oscillator={oscillator} decimals={ins.decimals} openTrade={openTrade} highlightTrade={highlight} />

        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-[11px] text-[#6b7686]">
          <span><b className="text-emerald-600">▲</b> long entry</span>
          <span><b className="text-rose-600">▼</b> short entry</span>
          <span>● exit (green win, red loss)</span>
          {overlays.map((o) => <span key={o.name} className="flex items-center gap-1"><span className="w-3 h-0.5 inline-block" style={{ background: o.color }} />{o.name}</span>)}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white border border-[#e2e8f0] rounded-2xl px-4 py-3">
          <p className="text-[11px] font-bold uppercase tracking-wide text-[#6b7686]">Candle</p>
          <p className="text-sm font-bold text-[#0b1c30] mt-0.5">{dateTime(bar.t)}</p>
          <p className="text-[11px] font-mono text-[#6b7686] mt-1">O {bar.o.toFixed(ins.decimals)} H {bar.h.toFixed(ins.decimals)} L {bar.l.toFixed(ins.decimals)} C {bar.c.toFixed(ins.decimals)}</p>
        </div>
        <div className="bg-white border border-[#e2e8f0] rounded-2xl px-4 py-3">
          <p className="text-[11px] font-bold uppercase tracking-wide text-[#6b7686]">Account now</p>
          <p className="font-display text-xl font-black text-[#0b1c30] mt-0.5">{money(eq)}</p>
          <p className={`text-[11px] font-semibold ${eq >= r.strategy.capital ? 'text-emerald-600' : 'text-rose-600'}`}>{signedMoney(eq - r.strategy.capital)} since the start</p>
        </div>
        <div className="bg-white border border-[#e2e8f0] rounded-2xl px-4 py-3">
          <p className="text-[11px] font-bold uppercase tracking-wide text-[#6b7686]">Open trade</p>
          {openTrade ? (
            <>
              <p className="text-sm font-bold text-[#0b1c30] mt-0.5">{openTrade.dir === 1 ? 'Long' : 'Short'} {openTrade.lots.toFixed(2)} lots</p>
              <p className={`text-[11px] font-semibold ${unreal >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{signedMoney(unreal)} floating · in since {dateTime(openTrade.entryTime)}</p>
            </>
          ) : (
            <p className="text-sm text-[#6b7686] mt-0.5">None. Waiting for a signal.</p>
          )}
        </div>
        <div className="bg-white border border-[#e2e8f0] rounded-2xl px-4 py-3">
          <p className="text-[11px] font-bold uppercase tracking-wide text-[#6b7686]">Closed so far</p>
          <p className="font-display text-xl font-black text-[#0b1c30] mt-0.5">{doneTrades.length} <span className="text-sm font-semibold text-[#6b7686]">trades</span></p>
          <p className="text-[11px] text-[#6b7686]">{wins} won · {doneTrades.length - wins} lost</p>
        </div>
      </div>
      <p className="text-[11px] text-[#6b7686]">Replay shows simulated prices. Signals are read on a candle's close and trades open at the next candle's open, as in the backtest.</p>
    </div>
  );
};

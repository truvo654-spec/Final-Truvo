import React, { useEffect, useMemo, useState } from 'react';
import type { JournalEntry } from '../../types';
import { CandleChart } from '../backtest/charts';
import { buildCoachCandleComparison, coachCandleSnapshot, type CoachCandleScenario } from './coachCandleComparison';
import { formatMoney } from './JournalCurrency';

export const CoachCandleChart: React.FC<{ entry: JournalEntry; currency: string; scenarios: CoachCandleScenario[] }> = ({ entry, currency, scenarios }) => {
  const model = useMemo(() => buildCoachCandleComparison(entry, scenarios), [entry, scenarios]);
  const [cursor, setCursor] = useState(model?.bars.length || 1);
  const [playing, setPlaying] = useState(false);
  const length = model?.bars.length || 1;
  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => setCursor(value => Math.min(length, value + 1)), 250);
    return () => clearInterval(timer);
  }, [playing, length]);
  useEffect(() => { if (cursor >= length) setPlaying(false); }, [cursor, length]);
  if (!model) return <p className="mt-4 text-xs text-slate-500">A valid entry price is needed to show the candle chart.</p>;
  const visible = Math.min(cursor, length);
  const snapshot = coachCandleSnapshot(model, visible);
  const money = (n: number) => formatMoney(n, currency);
  return <div className="mt-5 rounded-xl border border-[#5338ec]/20 bg-[#FBFAFF] p-3 sm:p-4" aria-label="Selected trade candle comparison">
    <div className="flex flex-wrap justify-between gap-2"><h4 className="text-sm font-bold">{entry.symbol} · {entry.direction === 'BUY' ? 'Long' : 'Short'} · scenario replay</h4><span className="text-[10px] font-semibold text-amber-700">Reconstructed candles · estimated paths</span></div>
    <p className="mt-1 text-[11px] text-slate-500">Recorded entry and exit anchors. Candles and open P&amp;L are synthetic estimates; no historical price feed is connected.</p>
    <div className="mt-4 overflow-x-auto"><div className="min-w-[700px] sm:min-w-0"><CandleChart bars={model.bars} from={0} to={snapshot.to} height={380} dp={model.dp} lines={model.lines} markers={snapshot.markers} label="AI Coach selected trade and scenario candle chart" pnl={{ currency, series: snapshot.series, detail: time => {
      const i = model.bars.findIndex(bar => bar.t === time);
      return <>{model.series.map(series => { const point = series.points.find(point => point.x === time); return <p key={series.name} style={{ color: series.color === '#0b1c30' ? '#fff' : series.color }}>{series.name}: {point ? money(point.y) : 'Unknown until recorded close'}</p>; })}<p>{i < model.start ? 'Before entry' : i < model.exitIndex ? 'Inside reconstructed trade' : 'Recorded close reached'}</p>{model.exits.map(exit => <p key={exit.name}>{exit.name}: {exit.status === 'skipped' ? 'No position · skipped by rule' : i >= exit.index ? `Closed · ${money(exit.net)} · ${exit.note || 'Recorded outcome retained'}` : 'Estimated position open'}</p>)}</>;
    } }}/></div></div>
    <label className="mt-4 block text-xs font-semibold">Replay timeline<input type="range" aria-label="AI Coach candle timeline" min={1} max={length} value={visible} onChange={event => { setCursor(Number(event.target.value)); setPlaying(false); }} className="mt-2 w-full accent-[#5338ec]"/></label>
    <div className="mt-2 flex flex-wrap items-center justify-between gap-2"><div className="flex gap-2">{[['Replay from entry', () => { setCursor(model.start + 1); setPlaying(false); }], ['Previous candle', () => { setCursor(value => Math.max(1, value - 1)); setPlaying(false); }], [playing ? 'Pause' : 'Play', () => { if (visible >= length) setCursor(model.start + 1); setPlaying(value => !value); }], ['Next candle', () => { setCursor(value => Math.min(length, value + 1)); setPlaying(false); }]].map(([label, action]) => <button key={label as string} type="button" onClick={action as () => void} className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[11px] font-semibold">{label as string}</button>)}</div><span className="text-[11px] text-slate-500">{visible} / {length} candles · {new Date(model.bars[visible - 1].t).toISOString().slice(0, 16).replace('T', ' ')} UTC</span></div>
    {!model.riskKnown && <p className="mt-2 text-[11px] text-amber-700">No recorded monetary risk: P&amp;L is shown only at the recorded close.</p>}
    {!model.timesKnown && <p className="mt-2 text-[11px] text-amber-700">Missing execution timestamps use a reconstructed timeline from the trade date.</p>}
  </div>;
};

// Manual replay: bars appear one at a time with the future hidden. Place orders, manage the trade,
// tag it, take notes, and finish the session for Points.
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, EyeOff, Flag, Minus, Pause, Play, Shuffle, CalendarSearch, NotebookPen, Trash2, Monitor, ShieldCheck, Scissors, X } from 'lucide-react';
import type { JournalEntry } from '../../types';
import { eligible, netOf, realizedR } from '../journal/journalMath';
import { PracticeFilters, matchesJournal, practiceInstruments, DEFAULT_FILTER } from './PracticeFilters';
import { replayDaysLikeToday, replayJournalTrade, replayRandom, ReplayData, replayTimeframes } from '../../backtest/replay';
import type { PracticeFilter, PracticeTrade, ReplaySession } from '../../backtest/store';
import { Bar, Timeframe } from '../../backtest/types';
import { money, pct, priceFmt, rr, tone, dateTime } from '../../backtest/format';
import { CandleChart } from './charts';
import { Card, Field, Pill, Segmented, Toggle, btnPrimary, btnSecondary, inputBase, inputCls, Banner } from './ui';

interface Props {
  entries: JournalEntry[];
  tz: string;
  initialEntryId: string | null;
  onFinish: (s: ReplaySession) => void;
  onToast: (m: string) => void;
}

type Side = 1 | -1;
interface Pending { dir: Side; type: 'market' | 'limit' | 'stop'; price: number; stop: number; target: number | null; size: number }
interface Position { dir: Side; entry: number; size: number; stop: number; target: number | null; entryBar: number; initRisk: number; tags: string[] }

const START_BALANCE = 10000;
const WINDOW = 90;

const roundStep = (x: number, step: number) => Math.floor(x / step + 1e-9) * step;

export const ReplayPanel: React.FC<Props> = ({ entries, tz, initialEntryId, onFinish, onToast }) => {
  const [source, setSource] = useState<'random' | 'similar' | 'journal'>(initialEntryId ? 'journal' : 'random');
  const [filter, setFilter] = useState<PracticeFilter>(DEFAULT_FILTER);
  const [tf, setTf] = useState<Timeframe>('5m');
  const [blind, setBlind] = useState(true);
  const [pickId, setPickId] = useState<string | null>(initialEntryId);
  const [data, setData] = useState<ReplayData | null>(null);
  const [cursor, setCursor] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<'1' | '3' | '5' | '10'>('3');
  const [htf, setHtf] = useState(false);
  const [drawMode, setDrawMode] = useState(false);
  const [drawings, setDrawings] = useState<number[]>([]);
  const [side, setSide] = useState<Side>(1);
  const [otype, setOtype] = useState<'market' | 'limit' | 'stop'>('market');
  const [oprice, setOprice] = useState('');
  const [riskPct, setRiskPct] = useState(1);
  const [stopPx, setStopPx] = useState('');
  const [targetPx, setTargetPx] = useState('');
  const [pending, setPending] = useState<Pending | null>(null);
  const [pos, setPos] = useState<Position | null>(null);
  const [trades, setTrades] = useState<PracticeTrade[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [finished, setFinished] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [minCursor, setMinCursor] = useState(0);
  const stateRef = useRef({ pending, pos, cursor, data, trades });
  stateRef.current = { pending, pos, cursor, data, trades };

  const journalMatches = useMemo(() => entries.filter((e) => eligible(e) && e.exitPrice !== null && matchesJournal(e, filter))
    .sort((a, b) => (b.entryTime || b.date).localeCompare(a.entryTime || a.date)), [entries, filter]);
  const journalList = journalMatches.slice(0, 40);
  const feedMatches = useMemo(() => practiceInstruments(filter), [filter]);
  const allTags = useMemo(() => Array.from(new Set(entries.flatMap((e) => [...e.tags, ...e.mistakes]))).slice(0, 14), [entries]);

  const balance = START_BALANCE + trades.reduce((a, t) => a + t.net, 0);
  const bars = data?.bars ?? [];
  const last: Bar | undefined = bars[cursor - 1];

  const avgRange = useMemo(() => {
    const l = bars.slice(Math.max(0, cursor - 14), cursor);
    return l.length ? l.reduce((a, b) => a + (b.h - b.l), 0) / l.length : 0;
  }, [bars, cursor]);

  const load = (d: ReplayData) => {
    setData(d); setCursor(d.start); setMinCursor(d.start); setPlaying(false); setPending(null); setPos(null); setTrades([]); setDrawings([]);
    setFinished(false); setNotes(''); setTags(d.trade?.mistakes ?? []); setSessionId(`rs_${Date.now().toString(36)}`);
    setStopPx(''); setTargetPx(''); setOprice('');
  };
  const loadSource = () => {
    try {
      if (source !== 'journal') {
        if (!feedMatches.length) { onToast('No instruments match these filters. Pick another market or instrument.'); return; }
        const sym = feedMatches[Math.floor(Math.random() * feedMatches.length)].symbol;
        load(source === 'random' ? replayRandom(sym, tf) : replayDaysLikeToday(sym, tf));
      } else {
        const e = entries.find((x) => x.id === pickId && journalMatches.some((m) => m.id === x.id)) || journalList[0] || (initialEntryId ? entries.find((x) => x.id === pickId) : undefined);
        if (!e) { onToast('No journal trades match these filters. Loosen one of them.'); return; }
        setPickId(e.id); load(replayJournalTrade(e));
      }
    } catch (err) { onToast(err instanceof Error ? err.message : 'Could not load the replay'); }
  };
  // Load the deep-linked trade straight away.
  useEffect(() => { if (initialEntryId) { const e = entries.find((x) => x.id === initialEntryId); if (e) { setBlind(true); load(replayJournalTrade(e)); } } }, [initialEntryId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Default stop/target suggestions follow the market until the user types their own.
  const autoStop = last ? last.c - side * avgRange * 1.5 : NaN;
  const entryRef = otype === 'market' ? last?.c ?? NaN : Number(oprice) || last?.c || NaN;
  const stopVal = stopPx === '' ? autoStop : Number(stopPx);
  const riskDist = Math.abs(entryRef - stopVal);
  const targetVal = targetPx === '' ? entryRef + side * 2 * riskDist : Number(targetPx);
  const rrNow = riskDist > 0 && Number.isFinite(targetVal) ? Math.abs(targetVal - entryRef) / riskDist : NaN;
  const sizeNow = data && riskDist > 0 ? roundStep((balance * riskPct / 100) / (riskDist * data.multiplier), data.minSize) : 0;
  const ticketProblem = !data ? 'Load a chart first.' : finished ? 'Session finished.' : pos ? 'Close the open position first.' : pending ? 'Cancel the pending order first.'
    : !(riskDist > 0) || side * (entryRef - stopVal) <= 0 ? `The stop must be ${side === 1 ? 'below' : 'above'} the entry.`
    : Number.isFinite(targetVal) && side * (targetVal - entryRef) <= 0 ? `The target must be ${side === 1 ? 'above' : 'below'} the entry.`
    : !(sizeNow >= (data?.minSize ?? 0)) || sizeNow <= 0 ? 'Risk is too small for the minimum size.' : null;

  const closeAt = useCallback((p: Position, price: number, bar: number, qty = p.size): PracticeTrade => {
    const mult = stateRef.current.data?.multiplier ?? 1;
    const net = (price - p.entry) * p.dir * qty * mult;
    return { dir: p.dir === 1 ? 'long' : 'short', entry: p.entry, exit: price, size: qty, net, r: p.initRisk > 0 ? net / (p.initRisk * (qty / p.size)) : null, entryBar: p.entryBar, exitBar: bar, tags: p.tags };
  }, []);

  /** Reveal the next bar and run orders/position against it (stop first if both stop and target are inside the bar). */
  const advance = useCallback((n = 1) => {
    const st = stateRef.current;
    if (!st.data) return;
    let cur = st.cursor, pd = st.pending, p = st.pos;
    const done: PracticeTrade[] = [];
    for (let k = 0; k < n && cur < st.data.bars.length; k++) {
      const b = st.data.bars[cur];
      if (pd && !p) {
        const fill = pd.type === 'market' ? b.o
          : pd.type === 'limit' ? ((pd.dir === 1 ? b.l < pd.price : b.h > pd.price) ? (pd.dir === 1 ? Math.min(b.o, pd.price) : Math.max(b.o, pd.price)) : null)
          : ((pd.dir === 1 ? b.h >= pd.price : b.l <= pd.price) ? (pd.dir === 1 ? Math.max(b.o, pd.price) : Math.min(b.o, pd.price)) : null);
        if (fill !== null) {
          p = { dir: pd.dir, entry: fill, size: pd.size, stop: pd.stop, target: pd.target, entryBar: cur, initRisk: Math.abs(fill - pd.stop) * pd.size * st.data.multiplier, tags: [] };
          pd = null;
        }
      }
      if (p) {
        const adv = p.dir === 1 ? b.l : b.h, fav = p.dir === 1 ? b.h : b.l;
        if (p.dir * (b.o - p.stop) <= 0 && p.entryBar !== cur) { done.push(closeAt(p, b.o, cur)); p = null; }
        else if (p.dir * (adv - p.stop) <= 0) { done.push(closeAt(p, p.stop, cur)); p = null; }
        else if (p.target !== null && p.dir * (fav - p.target) >= 0) { done.push(closeAt(p, p.target, cur)); p = null; }
      }
      cur++;
    }
    setCursor(cur); setPending(pd); setPos(p);
    if (done.length) {
      setTrades((t) => [...t, ...done.map((x) => ({ ...x, tags }))]);
      setMinCursor(cur);
      done.forEach((d) => onToast(`Practice trade closed: ${rr(d.r)} (${money(d.net)})`));
    }
    if (cur >= st.data.bars.length) setPlaying(false);
  }, [closeAt, onToast, tags]);

  // Playback timer
  useEffect(() => {
    if (!playing || finished) return;
    const id = window.setInterval(() => advance(1), 1000 / Number(speed));
    return () => window.clearInterval(id);
  }, [playing, speed, advance, finished]);

  const place = () => {
    if (ticketProblem || !data || !last) { if (ticketProblem) onToast(ticketProblem); return; }
    setPending({ dir: side, type: otype, price: otype === 'market' ? last.c : Number(oprice), stop: stopVal, target: Number.isFinite(targetVal) ? targetVal : null, size: sizeNow });
    onToast(otype === 'market' ? 'Market order placed: it fills at the next bar open' : `${otype === 'limit' ? 'Limit' : 'Stop'} order placed`);
  };

  const closePos = (half = false) => {
    if (!pos || !last) return;
    const qty = half ? roundStep(pos.size / 2, data?.minSize ?? 0.01) : pos.size;
    if (half && (qty <= 0 || qty >= pos.size)) { onToast('Position too small to split'); return; }
    const t = closeAt(pos, last.c, cursor - 1, qty);
    setTrades((x) => [...x, { ...t, tags }]);
    setMinCursor(cursor);
    setPos(half ? { ...pos, size: +(pos.size - qty).toFixed(6), initRisk: pos.initRisk * (1 - qty / pos.size) } : null);
  };

  const finish = () => {
    if (!data) return;
    let all = trades;
    if (pos && last) { const t = closeAt(pos, last.c, cursor - 1); all = [...trades, { ...t, tags }]; setTrades(all); setPos(null); }
    setPending(null); setPlaying(false); setFinished(true);
    onFinish({ id: sessionId, source: data.source, symbol: data.symbol, label: data.label, startedAt: new Date().toISOString(), finishedAt: new Date().toISOString(), trades: all, net: all.reduce((a, t) => a + t.net, 0), notes, tags, pointsAwarded: false, journalTradeId: data.trade?.id });
  };

  // Keyboard: Space play/pause, → next bar, ← back, B buy, S sell
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName) || !data || finished) return;
      if (e.key === ' ') { e.preventDefault(); setPlaying((x) => !x); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); advance(1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); if (!pos && !pending && cursor > minCursor) setCursor(cursor - 1); }
      else if (e.key.toLowerCase() === 'b') { setSide(1); }
      else if (e.key.toLowerCase() === 's') { setSide(-1); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [data, finished, advance, pos, pending, cursor, minCursor]);

  const from = Math.max(0, cursor - WINDOW);
  const unreal = pos && last ? (last.c - pos.entry) * pos.dir * pos.size * (data?.multiplier ?? 1) : 0;
  const unrealR = pos && pos.initRisk > 0 ? unreal / pos.initRisk : 0;
  const wins = trades.filter((t) => t.net > 0).length;
  const net = trades.reduce((a, t) => a + t.net, 0);
  const avgR = trades.length ? trades.reduce((a, t) => a + (t.r ?? 0), 0) / trades.length : 0;
  const hidden = blind && !finished;
  const dp = data?.dp ?? 5;

  const htfBars = useMemo(() => {
    if (!htf || !data) return [];
    const k = 6, out: Bar[] = [];
    const vis = bars.slice(0, cursor);
    for (let i = 0; i < vis.length; i += k) {
      const g = vis.slice(i, i + k);
      out.push({ t: g[0].t, o: g[0].o, h: Math.max(...g.map((x) => x.h)), l: Math.min(...g.map((x) => x.l)), c: g[g.length - 1].c, v: 0 });
    }
    return out.slice(-50);
  }, [htf, data, bars, cursor]);

  const markers = useMemo(() => {
    const m: { index: number; price: number; kind: 'buy' | 'sell' | 'exit' }[] = [];
    trades.forEach((t) => { m.push({ index: t.entryBar, price: t.entry, kind: t.dir === 'long' ? 'buy' : 'sell' }); m.push({ index: t.exitBar, price: t.exit, kind: 'exit' }); });
    if (pos) m.push({ index: pos.entryBar, price: pos.entry, kind: pos.dir === 1 ? 'buy' : 'sell' });
    if (finished && data?.trade) { m.push({ index: data.trade.entryIndex, price: data.trade.entry, kind: data.trade.direction === 'BUY' ? 'buy' : 'sell' }); m.push({ index: data.trade.exitIndex, price: data.trade.exit, kind: 'exit' }); }
    return m;
  }, [trades, pos, finished, data]);

  const lines = [
    ...(pos ? [{ price: pos.entry, color: '#5338ec', label: 'Entry' }, { price: pos.stop, color: '#e11d48', label: 'Stop', dashed: true }, ...(pos.target !== null ? [{ price: pos.target, color: '#059669', label: 'Target', dashed: true }] : [])] : []),
    ...(!pos && pending ? [{ price: pending.type === 'market' ? NaN : pending.price, color: '#5338ec', label: pending.type === 'limit' ? 'Limit' : 'Stop ord', dashed: true }] : []),
    ...(!pos && !pending && data && !finished && last ? [{ price: stopVal, color: '#e11d4888', label: 'SL?', dashed: true }, { price: targetVal, color: '#05966988', label: 'TP?', dashed: true }] : []),
  ];

  return (
    <div className="space-y-5">
      <div className="md:hidden"><Banner tone="info" icon={<Monitor className="w-4 h-4" />}>Replay works best on a larger screen. Everything still works here; the chart scrolls sideways.</Banner></div>

      <div className="grid grid-cols-1 xl:grid-cols-[280px_minmax(0,1fr)_300px] gap-5 items-start">
        {/* Source */}
        <Card title="Practice source" sub="Pick what to replay, then load it.">
          <div className="space-y-4">
            <Segmented size="sm" label="Practice from" value={source} onChange={setSource} options={[{ id: 'random', label: 'Random', title: 'A random date from the last two years' }, { id: 'similar', label: 'Like today', title: 'A past day whose range and direction looked like the latest day' }, { id: 'journal', label: 'My trades', title: 'One of your journal trades, rebuilt bar by bar' }]} />
            <PracticeFilters source={source} value={filter} onChange={setFilter} entries={entries} matchCount={source === 'journal' ? journalMatches.length : feedMatches.length} onToast={onToast} />
            {source !== 'journal' ? (
              <Field label="Bars" hint="Bar size of the replay chart.">
                <Segmented size="sm" label="Bar size" value={tf} onChange={setTf} options={replayTimeframes.map((t) => ({ id: t, label: t }))} />
              </Field>
            ) : (
              <div className="space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Pick a trade</p>
                <ul className="max-h-64 overflow-y-auto space-y-1.5 pr-1" aria-label="Your journal trades">
                  {journalList.map((e) => (
                    <li key={e.id}>
                      <button type="button" aria-pressed={pickId === e.id} onClick={() => setPickId(e.id)} className={`w-full text-left rounded-lg border px-2.5 py-2 text-[11px] ${pickId === e.id ? 'border-[#5338ec] bg-[#FBFAFF]' : 'border-slate-200 hover:bg-slate-50'}`}>
                        <span className="flex justify-between gap-2 font-semibold text-[#0b1c30]"><span className="truncate">{blind ? `Trade #${e.id.replace(/\D/g, '') || e.id}` : `${e.symbol} · ${e.date}`}</span><span className={tone(netOf(e))}>{rr(realizedR(e), 1)}</span></span>
                        <span className="text-slate-500">{e.strategy}{e.mistakes[0] ? ` · ${e.mistakes[0]}` : ''}</span>
                      </button>
                    </li>
                  ))}
                  {journalList.length === 0 && <li className="text-xs text-slate-500">No trades match.</li>}
                </ul>
              </div>
            )}
            <div className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 px-3 py-2.5">
              <div><p className="text-xs font-bold text-[#0b1c30] flex items-center gap-1.5"><EyeOff className="w-3.5 h-3.5" /> Blind mode</p><p className="text-[11px] text-slate-500">Hides the symbol and dates until you finish.</p></div>
              <Toggle label="Blind mode" checked={blind} onChange={setBlind} />
            </div>
            <button type="button" className={`${btnPrimary} w-full`} onClick={loadSource}>{source === 'random' ? <Shuffle className="w-4 h-4" /> : <CalendarSearch className="w-4 h-4" />} Load to chart</button>
          </div>
        </Card>

        {/* Chart */}
        <section className="bg-white border border-[#e2e8f0] rounded-2xl p-4 min-w-0" aria-label="Replay chart">
          {!data ? (
            <div className="h-[360px] grid place-items-center text-center">
              <div><p className="text-sm font-semibold text-[#0b1c30]">Load a chart to start</p><p className="text-xs text-slate-500 mt-1">Bars appear one at a time. You only ever see the past.</p></div>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-sm font-bold text-[#0b1c30]">{hidden ? 'Hidden market' : data.symbol}</span>
                <Pill>{data.tf}</Pill>
                <span className="text-[11px] text-slate-500 tabular-nums">{hidden ? `Bar ${cursor - data.start + 1}` : last ? dateTime(last.t, tz) : ''}</span>
                {hidden && <Pill tone="accent"><EyeOff className="w-3 h-3" /> Blind</Pill>}
                <span className="ml-auto flex items-center gap-1.5 text-[11px]"><Toggle label="Higher timeframe" checked={htf} onChange={setHtf} /> Higher timeframe</span>
              </div>
              <div className="flex gap-2">
                <div className="flex flex-col gap-1 pt-1" role="toolbar" aria-label="Drawing tools">
                  <button type="button" aria-pressed={drawMode} title="Horizontal line: click the chart to draw" onClick={() => setDrawMode(!drawMode)} className={`p-2 rounded-lg ${drawMode ? 'bg-[#EEF0FE] text-[#5338ec]' : 'text-slate-500 hover:bg-slate-100'}`}><Minus className="w-4 h-4" /></button>
                  <button type="button" title="Clear drawings" onClick={() => setDrawings([])} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100"><Trash2 className="w-4 h-4" /></button>
                </div>
                <div className="flex-1 min-w-0 overflow-x-auto">
                  <div className="min-w-[520px] relative">
                    <CandleChart bars={bars} from={from} to={cursor} dp={dp} height={340} label="Replay chart" lines={lines} markers={markers} drawings={drawings} onPick={drawMode ? (p) => { setDrawings((d) => [...d, p]); setDrawMode(false); } : undefined} />
                    {htf && htfBars.length > 1 && (
                      <div className="absolute top-1 left-1 w-48 bg-white/95 border border-slate-200 rounded-lg p-1 shadow-sm">
                        <p className="text-[9px] font-semibold text-slate-500 px-1">Higher timeframe (×6)</p>
                        <CandleChart bars={htfBars} from={0} to={htfBars.length} dp={dp} height={110} label="Higher timeframe" hidePriceAxis />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-3" role="toolbar" aria-label="Replay controls">
                <button type="button" className={btnSecondary} title="Back one bar (←). Not possible past a closed trade or while a trade is open." disabled={!!pos || !!pending || cursor <= minCursor || finished} onClick={() => setCursor(cursor - 1)}><ChevronLeft className="w-4 h-4" /></button>
                <button type="button" className={`${btnPrimary} w-24`} disabled={finished || cursor >= bars.length} onClick={() => setPlaying(!playing)}>{playing ? <><Pause className="w-4 h-4" /> Pause</> : <><Play className="w-4 h-4" /> Play</>}</button>
                <button type="button" className={btnSecondary} title="Next bar (→)" disabled={finished || cursor >= bars.length} onClick={() => advance(1)}><ChevronRight className="w-4 h-4" /></button>
                <Segmented size="sm" label="Speed" value={speed} onChange={setSpeed} options={(['1', '3', '5', '10'] as const).map((x) => ({ id: x, label: `${x}x`, title: `${x} bar${x === '1' ? '' : 's'} per second` }))} />
                <select aria-label="Jump ahead" value="" onChange={(e) => { if (e.target.value) advance(Number(e.target.value)); }} className={`${inputBase} w-auto h-8 text-xs`} disabled={finished}>
                  <option value="">Jump ahead…</option><option value="10">10 bars</option><option value="50">50 bars</option><option value={data.tf === '5m' ? 288 : data.tf === '15m' ? 96 : 24}>1 day</option>
                </select>
                <span className="text-[10px] text-slate-400 ml-auto hidden lg:inline">Keys: Space play · ← → step · B / S side</span>
              </div>
            </>
          )}
        </section>

        {/* Ticket + position */}
        <div className="space-y-5">
          <Card title="Order ticket" sub="Simulated. Sized from your risk %.">
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-1.5">
                <button type="button" aria-pressed={side === 1} onClick={() => setSide(1)} className={`h-10 rounded-lg text-sm font-bold ${side === 1 ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'}`}>Buy / Long</button>
                <button type="button" aria-pressed={side === -1} onClick={() => setSide(-1)} className={`h-10 rounded-lg text-sm font-bold ${side === -1 ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-500'}`}>Sell / Short</button>
              </div>
              <Segmented size="sm" label="Order type" value={otype} onChange={setOtype} options={[{ id: 'market', label: 'Market', title: 'Fills at the next bar open' }, { id: 'limit', label: 'Limit', title: 'Fills only if price trades through your price' }, { id: 'stop', label: 'Stop', title: 'Fills when price reaches your price' }]} />
              {otype !== 'market' && <Field label="Order price"><input type="number" step="any" aria-label="Order price" placeholder={last ? priceFmt(last.c, dp) : ''} value={oprice} onChange={(e) => setOprice(e.target.value)} className={inputCls} /></Field>}
              <div className="grid grid-cols-2 gap-2">
                <Field label="Stop loss"><input type="number" step="any" aria-label="Stop loss price" placeholder={Number.isFinite(autoStop) ? priceFmt(autoStop, dp) : ''} value={stopPx} onChange={(e) => setStopPx(e.target.value)} className={inputCls} /></Field>
                <Field label="Take profit"><input type="number" step="any" aria-label="Take profit price" placeholder={Number.isFinite(targetVal) ? priceFmt(targetVal, dp) : ''} value={targetPx} onChange={(e) => setTargetPx(e.target.value)} className={inputCls} /></Field>
              </div>
              <div className="flex items-center gap-2">
                <Field label="Risk" className="w-24"><div className="flex items-center gap-1"><input type="number" step="0.25" min={0.1} max={5} aria-label="Risk percent" value={riskPct} onChange={(e) => setRiskPct(Number(e.target.value))} className={inputCls} /><span className="text-xs text-slate-500">%</span></div></Field>
                <div className="flex-1 rounded-lg bg-slate-50 px-3 py-2 text-[11px] tabular-nums">
                  <p>Size <b>{sizeNow > 0 ? sizeNow : '—'}</b> {data?.sizeUnit ?? ''}</p>
                  <p>Reward:risk <b className={rrNow >= 2 ? 'text-emerald-700' : rrNow >= 1 ? 'text-[#0b1c30]' : 'text-rose-600'}>{Number.isFinite(rrNow) ? `1 : ${rrNow.toFixed(2)}` : '—'}</b></p>
                </div>
              </div>
              <button type="button" disabled={!!ticketProblem} title={ticketProblem ?? undefined} onClick={() => place()}
                className={`w-full h-11 rounded-lg text-sm font-bold text-white disabled:opacity-40 ${side === 1 ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'}`}>
                {side === 1 ? 'Buy' : 'Sell'} {otype === 'market' ? 'at market' : otype}
              </button>
              {ticketProblem && data && <p className="text-[11px] text-slate-500">{ticketProblem}</p>}
              {pending && (
                <div className="flex items-center justify-between rounded-lg border border-[#5338ec]/30 bg-[#FBFAFF] px-3 py-2 text-xs">
                  <span>Pending {pending.dir === 1 ? 'buy' : 'sell'} {pending.type}{pending.type !== 'market' ? ` @ ${priceFmt(pending.price, dp)}` : ''}</span>
                  <button type="button" aria-label="Cancel order" onClick={() => setPending(null)} className="p-1 rounded hover:bg-white"><X className="w-3.5 h-3.5" /></button>
                </div>
              )}
            </div>
          </Card>

          <Card title="Position" right={pos ? <Pill tone={pos.dir === 1 ? 'good' : 'bad'}>{pos.dir === 1 ? 'Long' : 'Short'} {pos.size}</Pill> : undefined}>
            {pos ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-[11px] tabular-nums">
                  <p className="text-slate-500">Entry <b className="block text-sm text-[#0b1c30]">{priceFmt(pos.entry, dp)}</b></p>
                  <p className="text-slate-500">Now <b className="block text-sm text-[#0b1c30]">{last ? priceFmt(last.c, dp) : '—'}</b></p>
                </div>
                <p className={`text-2xl font-bold tabular-nums ${tone(unreal)}`}>{money(unreal)} <span className="text-sm">{rr(unrealR)}</span></p>
                <div className="grid grid-cols-2 gap-1.5">
                  <button type="button" className={btnSecondary} onClick={() => { setPos({ ...pos, stop: pos.entry }); onToast('Stop moved to breakeven'); }} disabled={pos.stop === pos.entry}><ShieldCheck className="w-3.5 h-3.5" /> Stop to breakeven</button>
                  <button type="button" className={btnSecondary} onClick={() => closePos(true)}><Scissors className="w-3.5 h-3.5" /> Close half</button>
                  <button type="button" className={`${btnSecondary} col-span-2 text-rose-700 border-rose-200 hover:bg-rose-50`} onClick={() => closePos(false)}>Close at market</button>
                </div>
              </div>
            ) : <p className="text-xs text-slate-500">No open position.</p>}
          </Card>
        </div>
      </div>

      {/* Session telemetry */}
      <section className="bg-white border border-[#e2e8f0] rounded-2xl p-5" aria-label="Practice session">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
          <h3 className="text-sm font-bold text-[#0b1c30] mr-auto">This session</h3>
          {[['Trades', `${trades.length}`], ['Win rate', trades.length ? pct(wins / trades.length, 0) : '—'], ['Net', money(net)], ['Average', trades.length ? rr(avgR) : '—']].map(([k, v]) => (
            <div key={k} className="tabular-nums"><p className={`text-lg font-bold ${k === 'Net' ? tone(net) : 'text-[#0b1c30]'}`}>{v}</p><p className="text-[10px] uppercase tracking-wider text-slate-500">{k}</p></div>
          ))}
          <button type="button" className={btnPrimary} disabled={!data || finished} onClick={finish}><Flag className="w-4 h-4" /> Finish session</button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-4">
          <Field label="Tag this practice" hint="Your journal's own tags. Tags apply to the trades you close from now on.">
            <div className="flex flex-wrap gap-1.5">
              {allTags.map((t) => { const on = tags.includes(t); return <button key={t} type="button" aria-pressed={on} onClick={() => setTags(on ? tags.filter((x) => x !== t) : [...tags, t])} className={`h-7 px-2.5 rounded-full text-[11px] font-semibold border ${on ? 'bg-[#EEF0FE] border-[#5338ec]/40 text-[#5338ec]' : 'bg-white border-slate-200 text-[#474556]'}`}>{t}</button>; })}
            </div>
          </Field>
          <Field label="Notes" htmlFor="rp-notes" hint="Saved with this practice session.">
            <textarea id="rp-notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="What did you see? What would you do differently?" className="w-full resize-y border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5338ec]/30" />
          </Field>
        </div>
        {finished && data && (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-[#0b1c30] space-y-1">
            <p className="font-bold flex items-center gap-1.5"><NotebookPen className="w-4 h-4" /> Session finished</p>
            <p>That was <b>{data.symbol}</b>, {data.dateLabel}. You took {trades.length} trade{trades.length === 1 ? '' : 's'} for {money(net)}.</p>
            {data.trade && <p>Your real trade was a {data.trade.direction === 'BUY' ? 'long' : 'short'} at {priceFmt(data.trade.entry, dp)}, closed at {priceFmt(data.trade.exit, dp)} for <b className={tone(data.trade.pnl)}>{rr(data.trade.r)}</b>{data.trade.mistakes.length ? ` (tagged ${data.trade.mistakes.join(', ')})` : ''}. It is marked on the chart.</p>}
            <button type="button" className={`${btnSecondary} mt-2`} onClick={loadSource}>Practise another</button>
          </div>
        )}
      </section>
    </div>
  );
};

import React, { useEffect, useRef, useState } from 'react';
import { JournalEntry } from '../../types';

// Execution replay for one journal trade:
// - "Your recording": a short screen capture you record here (screen share → video) or attach as a file.
// - "Trade path": an animated schematic of entry → exit against stop and target. It is drawn from the
//   journal numbers only (no tick data), and says so.

interface Props {
  entry: JournalEntry;
  targetRR: number;
  recording?: string; // object URL
  onAttach: (blob: Blob) => void;
  onRemove: () => void;
  onClose: () => void;
}

const MAX_SECONDS = 60;
const netOf = (e: JournalEntry) => e.pnl - (e.commission ?? 0);

export const TradeReplayModal: React.FC<Props> = ({ entry: e, targetRR, recording, onAttach, onRemove, onClose }) => {
  const [tab, setTab] = useState<'video' | 'path'>(recording ? 'video' : 'path');
  const [rec, setRec] = useState<{ recorder: MediaRecorder; stream: MediaStream; started: number } | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [err, setErr] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  // schematic animation
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    if (!playing) return;
    let raf = 0; const start = performance.now() - t * 4000;
    const step = (now: number) => {
      const v = Math.min(1, (now - start) / 4000);
      setT(v);
      if (v < 1) raf = requestAnimationFrame(step); else setPlaying(false);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing]);

  useEffect(() => {
    if (!rec) return;
    const id = setInterval(() => {
      const s = Math.floor((Date.now() - rec.started) / 1000);
      setElapsed(s);
      if (s >= MAX_SECONDS) stopRec();
    }, 250);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rec]);

  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => { if (ev.key === 'Escape' && !rec) onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [rec, onClose]);

  const startRec = async () => {
    setErr('');
    const md = navigator.mediaDevices as MediaDevices & { getDisplayMedia?: (c: object) => Promise<MediaStream> };
    if (!md?.getDisplayMedia || typeof MediaRecorder === 'undefined') { setErr('This browser cannot record the screen here. Attach a video file instead.'); return; }
    try {
      const stream = await md.getDisplayMedia({ video: { frameRate: 30 }, audio: false });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (ev) => ev.data.size && chunks.push(ev.data);
      recorder.onstop = () => { stream.getTracks().forEach((tr) => tr.stop()); if (chunks.length) onAttach(new Blob(chunks, { type: recorder.mimeType || 'video/webm' })); setRec(null); setElapsed(0); };
      stream.getVideoTracks()[0]?.addEventListener('ended', () => recorder.state !== 'inactive' && recorder.stop());
      recorder.start(500);
      setRec({ recorder, stream, started: Date.now() });
    } catch {
      setErr('Screen recording was blocked or cancelled. You can attach a video file instead.');
    }
  };
  const stopRec = () => { if (rec && rec.recorder.state !== 'inactive') rec.recorder.stop(); };

  // schematic geometry
  const stop = e.stopPrice;
  const risk = stop !== undefined ? Math.abs(e.entryPrice - stop) : undefined;
  const target = e.takeProfit ?? (risk !== undefined ? (e.direction === 'BUY' ? e.entryPrice + risk * targetRR : e.entryPrice - risk * targetRR) : undefined);
  const exit = e.exitPrice;
  const levels = [e.entryPrice, exit, stop, target].filter((v): v is number => typeof v === 'number');
  const lo = Math.min(...levels), hi = Math.max(...levels), pad = (hi - lo || e.entryPrice * 0.01) * 0.15;
  const W = 600, H = 220, L = 118, R = 20;
  const y = (v: number) => 14 + (1 - (v - (lo - pad)) / (hi - lo + 2 * pad)) * (H - 40);
  const xAt = (f: number) => L + f * (W - L - R);
  const cur = exit === null ? e.entryPrice : e.entryPrice + (exit - e.entryPrice) * t;
  const win = netOf(e) >= 0;
  const dp = e.entryPrice < 10 ? 4 : e.entryPrice < 500 ? 2 : 1;
  const time = (iso?: string) => (iso ? iso.replace('T', ' ').slice(0, 16) : '—');

  return (
    <div className="fixed inset-0 z-[60] bg-slate-900/50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={`Replay ${e.symbol}`}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-3 px-5 pt-4">
          <div>
            <p className="text-[10px] font-bold tracking-wider uppercase text-[#5338ec]">Execution replay</p>
            <p className="text-lg font-bold text-[#0b1c30]">{e.symbol} <span className={`text-xs font-bold ${e.direction === 'BUY' ? 'text-emerald-700' : 'text-rose-700'}`}>{e.direction === 'BUY' ? 'LONG' : 'SHORT'}</span> <span className={`text-sm font-mono ${win ? 'text-emerald-600' : 'text-rose-600'}`}>{win ? '+' : ''}{netOf(e).toFixed(2)}{e.rMultiple !== null ? ` (${e.rMultiple >= 0 ? '+' : ''}${e.rMultiple}R)` : ''}</span></p>
            <p className="text-[11px] text-slate-500 font-mono">{time(e.entryTime) !== '—' ? time(e.entryTime) : e.date} → {time(e.exitTime)} UTC · {e.strategy}</p>
          </div>
          <button type="button" onClick={onClose} disabled={!!rec} className="text-sm font-semibold text-[#474556] hover:underline disabled:opacity-40">Close</button>
        </div>

        <div className="flex gap-1 mx-5 mt-3 rounded-lg bg-slate-100 p-1 text-xs font-semibold" role="tablist">
          {([['video', recording ? 'Your recording' : 'Record / attach video'], ['path', 'Trade path']] as const).map(([id, label]) => (
            <button key={id} type="button" role="tab" aria-selected={tab === id} onClick={() => setTab(id)} className={`flex-1 rounded-md py-1.5 ${tab === id ? 'bg-white shadow-sm text-[#0b1c30]' : 'text-[#474556]'}`}>{label}</button>
          ))}
        </div>

        <div className="p-5">
          {tab === 'video' ? (
            <div className="space-y-3">
              {recording && !rec ? (
                <>
                  <video src={recording} controls className="w-full rounded-xl bg-black aspect-video" />
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={startRec} className="h-9 px-3 rounded-lg border border-slate-200 text-xs font-semibold hover:bg-slate-50">Record again</button>
                    <button type="button" onClick={() => fileRef.current?.click()} className="h-9 px-3 rounded-lg border border-slate-200 text-xs font-semibold hover:bg-slate-50">Replace with file</button>
                    <a href={recording} download={`${e.symbol.replace(/\W+/g, '-')}-${e.date}-replay.webm`} className="h-9 px-3 rounded-lg border border-slate-200 text-xs font-semibold hover:bg-slate-50 inline-flex items-center">Download</a>
                    <button type="button" onClick={onRemove} className="h-9 px-3 rounded-lg text-xs font-semibold text-rose-600 hover:underline ml-auto">Remove</button>
                  </div>
                </>
              ) : rec ? (
                <div className="rounded-xl border-2 border-rose-300 bg-rose-50 p-6 text-center">
                  <p className="text-sm font-bold text-rose-700">● Recording {elapsed}s / {MAX_SECONDS}s</p>
                  <p className="text-xs text-[#474556] mt-1">Replay the trade on your chart (e.g. bar replay in your platform). Recording stops automatically at {MAX_SECONDS}s.</p>
                  <button type="button" onClick={stopRec} className="mt-3 h-9 px-4 rounded-lg bg-rose-600 hover:bg-rose-700 text-xs font-semibold text-white">Stop and save</button>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center">
                  <p className="text-sm font-semibold text-[#0b1c30]">Capture a short replay of this execution</p>
                  <p className="text-xs text-[#474556] mt-1">Record your chart window for up to {MAX_SECONDS}s while you replay the trade, or attach a clip you already have.</p>
                  <div className="flex justify-center gap-2 mt-3">
                    <button type="button" onClick={startRec} className="h-9 px-4 rounded-lg bg-[#5338ec] hover:bg-[#4326d8] text-xs font-semibold text-white">Record screen</button>
                    <button type="button" onClick={() => fileRef.current?.click()} className="h-9 px-4 rounded-lg border border-slate-200 text-xs font-semibold hover:bg-slate-50">Attach video file</button>
                  </div>
                </div>
              )}
              {err && <p className="text-xs text-rose-600" role="alert">{err}</p>}
              <p className="text-[10px] text-slate-400">Recordings stay in this browser session; they are not uploaded anywhere.</p>
              <input ref={fileRef} type="file" accept="video/*" className="hidden" onChange={(ev) => { const f = ev.target.files?.[0]; if (f) onAttach(f); ev.target.value = ''; }} />
            </div>
          ) : (
            <div className="space-y-3">
              <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-xl border border-slate-200" role="img" aria-label={`Trade path from entry ${e.entryPrice} to exit ${exit ?? 'open'}`}>
                {target !== undefined && <rect x={L} width={W - L - R} y={Math.min(y(target), y(e.entryPrice))} height={Math.abs(y(target) - y(e.entryPrice))} fill="#10b981" opacity={0.06} />}
                {stop !== undefined && <rect x={L} width={W - L - R} y={Math.min(y(stop), y(e.entryPrice))} height={Math.abs(y(stop) - y(e.entryPrice))} fill="#f43f5e" opacity={0.06} />}
                {([['Entry', e.entryPrice, '#0b1c30'], ['Stop', stop, '#e11d48'], ['Target', target, '#059669']] as const).map(([n, v, c]) => v !== undefined && (
                  <g key={n}>
                    <line x1={L} x2={W - R} y1={y(v)} y2={y(v)} stroke={c} strokeDasharray={n === 'Entry' ? undefined : '5 4'} strokeWidth={1.2} />
                    <text x={L - 6} y={y(v) + 3} textAnchor="end" fontSize="10" fill={c} fontFamily="ui-monospace, monospace">{n} {v.toFixed(dp)}</text>
                  </g>
                ))}
                {exit !== null && <line x1={xAt(0)} y1={y(e.entryPrice)} x2={xAt(t)} y2={y(cur)} stroke={win ? '#10b981' : '#f43f5e'} strokeWidth={2.5} />}
                <circle cx={xAt(0)} cy={y(e.entryPrice)} r={4} fill="#0b1c30" />
                <circle cx={xAt(t)} cy={y(cur)} r={5} fill={win ? '#10b981' : '#f43f5e'} stroke="#fff" strokeWidth={2} />
                {t >= 1 && exit !== null && <text x={xAt(1) - 4} y={y(exit) - 8} textAnchor="end" fontSize="11" fontWeight={700} fill={win ? '#047857' : '#be123c'}>Exit {exit.toFixed(dp)}</text>}
                <text x={L} y={H - 6} fontSize="10" fill="#64748b">{time(e.entryTime)}</text>
                <text x={W - R} y={H - 6} fontSize="10" fill="#64748b" textAnchor="end">{time(e.exitTime)}</text>
              </svg>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => { if (t >= 1) setT(0); setPlaying((p) => !p); }} className="h-9 px-4 rounded-lg bg-[#5338ec] hover:bg-[#4326d8] text-xs font-semibold text-white">{playing ? 'Pause' : t >= 1 ? 'Replay' : 'Play'}</button>
                <input type="range" min={0} max={1000} value={Math.round(t * 1000)} onChange={(ev) => { setPlaying(false); setT(Number(ev.target.value) / 1000); }} className="flex-1" aria-label="Replay position" />
              </div>
              <p className="text-[10px] text-slate-500">Schematic only: a straight line from your entry to your exit against the stop and the {e.takeProfit !== undefined ? 'take-profit' : `${targetRR}R target`}. It is drawn from the journal numbers, not from market tick data, so it does not show the real path price took.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

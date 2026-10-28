import React, { useId, useMemo, useState } from 'react';
import { ArrowRight, BookOpen, Plus } from 'lucide-react';
import type { JournalPlaybook } from '../../data/journalPlaybooks';
import { PLAYBOOK_STATUS_LABELS } from '../../data/journalPlaybooks';
import type { JournalEntry } from '../../types';
import { QuickPlaybookCreate } from './QuickPlaybookCreate';
import { currencyOf, eligible, netOf, resultOf } from './journalMath';

type Props = {
  playbooks: JournalPlaybook[];
  entries: JournalEntry[];
  scopedEntries: JournalEntry[];
  currency: string;
  houseLimits: { maxRisk: number; maxTrades: number };
  onCreate: (book: JournalPlaybook) => void;
  onOpenWorkspace: (id?: string) => void;
};

type PatternKind = 'breakout' | 'pullback' | 'scalp' | 'swing' | 'reversal' | 'generic';

export function playbookIllustration(book: Pick<JournalPlaybook, 'name' | 'style'>): PatternKind {
  const text = `${book.name} ${book.style}`.toLowerCase();
  if (/scalp/.test(text)) return 'scalp';
  if (/swing/.test(text)) return 'swing';
  if (/revers|range|mean.reversion|fade/.test(text)) return 'reversal';
  if (/pullback|trend/.test(text)) return 'pullback';
  if (/breakout|momentum/.test(text)) return 'breakout';
  return 'generic';
}

const PATTERNS: Record<PatternKind, { label: string; line: string; guide?: string }> = {
  breakout: { label: 'Breakout example', line: '8,78 30,72 48,83 68,72 86,81 107,70 123,75 140,62 158,69 174,44 194,48 212,24 232,28 250,15', guide: 'M8 67 H250' },
  pullback: { label: 'Pullback example', line: '8,83 25,76 40,79 58,61 75,65 92,44 108,49 125,39 142,54 157,60 173,48 190,51 208,34 224,38 250,19' },
  scalp: { label: 'Scalping example', line: '8,67 22,58 35,66 48,51 62,62 76,43 90,56 104,46 118,62 132,48 145,53 159,34 173,43 188,29 201,42 215,27 229,32 250,20' },
  swing: { label: 'Swing example', line: '8,84 28,79 48,69 68,73 88,60 108,63 128,47 148,54 168,42 188,44 208,30 228,33 250,19' },
  reversal: { label: 'Reversal example', line: '8,27 28,32 47,31 66,46 84,43 103,60 122,57 141,76 157,80 173,67 191,70 210,52 228,55 250,37' },
  generic: { label: 'Generic example', line: '8,75 27,68 46,73 64,59 83,64 101,53 120,61 138,54 157,42 175,47 194,37 212,41 231,30 250,25' },
};

function PatternIllustration({ book }: { book: JournalPlaybook }) {
  const pattern = PATTERNS[playbookIllustration(book)];
  const gradient = `pattern-${useId().replace(/:/g, '')}`;
  const points = pattern.line.split(' ').map(point => point.split(',').map(Number));
  const area = `M${points[0][0]} 100 ${points.map(([x, y]) => `L${x} ${y}`).join(' ')} L${points[points.length - 1][0]} 100 Z`;
  return <div className="overflow-hidden rounded-xl border border-[#403570] bg-gradient-to-br from-[#171136] via-[#242055] to-[#292064] p-3 shadow-sm">
    <div className="flex flex-wrap items-start justify-between gap-2">
      <div><p className="text-[10px] font-semibold uppercase tracking-wider text-violet-200">Strategy blueprint</p><p className="mt-1 text-xs font-bold text-white">{pattern.label}</p></div>
      <span className="rounded-full border border-white/20 bg-white/10 px-2 py-1 text-[10px] font-semibold text-violet-100">Example</span>
    </div>
    <svg role="img" aria-label={`${pattern.label}: illustrative pattern, not market data or a prediction`} viewBox="0 0 258 100" className="mt-2 h-24 w-full" preserveAspectRatio="none">
      <defs><linearGradient id={gradient} x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#b6a4ff" stopOpacity=".28"/><stop offset="1" stopColor="#b6a4ff" stopOpacity="0"/></linearGradient></defs>
      <path d="M8 25 H250 M8 50 H250 M8 75 H250 M52 8 V95 M104 8 V95 M156 8 V95 M208 8 V95" fill="none" stroke="#fff" strokeOpacity=".1" strokeWidth="1"/>
      <path d={area} fill={`url(#${gradient})`}/>
      {pattern.guide && <path d={pattern.guide} fill="none" stroke="#d7ccff" strokeOpacity=".6" strokeDasharray="4 4" strokeWidth="1"/>}
      <polyline points={pattern.line} fill="none" stroke="#bcaeff" strokeOpacity=".65" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke"/>
      {points.slice(1).map(([x, close], index) => {
        const open = points[index][1];
        const rising = close < open;
        const color = rising ? '#6ee7c1' : '#fda4af';
        const top = Math.min(open, close), bottom = Math.max(open, close);
        return <g key={index} fill={color} stroke={color}>
          <line x1={x} x2={x} y1={Math.max(3, top - 4)} y2={Math.min(97, bottom + 4)} strokeWidth="1" vectorEffect="non-scaling-stroke"/>
          <rect x={x - 3} y={top} width="6" height={Math.max(2, bottom - top)} rx="1" stroke="none"/>
        </g>;
      })}
    </svg>
    <p className="mt-1 text-[10px] text-violet-100">Illustration · not market data</p>
  </div>;
}

export function playbookPerformance(trades: JournalEntry[], currency: string) {
  const groups = new Map<string, { count: number; wins: number; losses: number; net: number; winNet: number; lossNet: number }>();
  for (const trade of trades) {
    if (!eligible(trade) || currencyOf(trade) !== currency) continue;
    const current = groups.get(trade.strategy) || { count: 0, wins: 0, losses: 0, net: 0, winNet: 0, lossNet: 0 };
    const cents = Math.round(netOf(trade) * 100), result = resultOf(trade);
    current.count++; current.net += cents;
    if (result === 'win') { current.wins++; current.winNet += cents; }
    if (result === 'loss') { current.losses++; current.lossNet += cents; }
    groups.set(trade.strategy, current);
  }
  return groups;
}

export function EasyPlaybookCards({ playbooks, entries, scopedEntries, currency, houseLimits, onCreate, onOpenWorkspace }: Props) {
  const [status, setStatus] = useState<'active' | 'all'>('active');
  const [creating, setCreating] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const visible = status === 'active' ? playbooks.filter(book => book.status === 'active') : playbooks;
  const performance = useMemo(() => playbookPerformance(scopedEntries, currency), [scopedEntries, currency]);
  const money = new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 2, signDisplay: 'exceptZero' });
  return <div className="min-w-0 space-y-5" aria-label="Strategy cards">
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div><p className="text-xs font-bold uppercase tracking-wider text-[#5338ec] dark:text-violet-300">Your strategy collection</p><h2 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">Playbooks</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Keep your setups and rules close, one card at a time.</p></div>
      <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto"><button type="button" onClick={() => onOpenWorkspace()} className="text-xs font-semibold text-[#5338ec] underline dark:text-violet-300">House rules &amp; full workspace</button><button type="button" data-keep-button-icons onClick={() => setCreating(true)} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#5338ec] px-4 text-sm font-semibold text-white hover:bg-[#4326d8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5338ec] sm:w-auto"><Plus size={16}/>Create new playbook</button></div>
    </div>
    <div role="group" aria-label="Playbook status" className="flex flex-wrap items-center gap-2">
      {(['active', 'all'] as const).map(item => <button key={item} type="button" aria-pressed={status === item} onClick={() => setStatus(item)} className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${status === item ? 'border-[#5338ec] bg-[#f1edff] text-[#5338ec] dark:bg-violet-950 dark:text-violet-200' : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'}`}>{item === 'active' ? 'Active' : 'All'} <span className="opacity-70">{item === 'active' ? playbooks.filter(book => book.status === 'active').length : playbooks.length}</span></button>)}
    </div>
    {visible.length ? <div className="grid min-w-0 grid-cols-1 items-start gap-4 md:grid-cols-2 xl:grid-cols-3">
      {visible.map(book => {
        const open = openId === book.id;
        const detailsId = `playbook-details-${encodeURIComponent(book.id)}`;
        const stats = performance.get(book.name);
        return <article key={book.id} aria-label={`${book.name} strategy card`} className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="h-1.5 bg-gradient-to-r from-[#5338ec] via-violet-400 to-sky-300"/>
          <div className="space-y-4 p-4">
            <header className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-violet-100 text-[#5338ec] dark:bg-violet-950 dark:text-violet-300"><BookOpen size={19} aria-hidden="true"/></span><div className="min-w-0 flex-1"><h3 className="break-words text-base font-bold text-slate-900 dark:text-white">{book.name}</h3><p className="mt-0.5 break-words text-xs text-slate-500 dark:text-slate-400">{book.style || 'Strategy'}</p></div><span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">{PLAYBOOK_STATUS_LABELS[book.status]}</span></header>
            <PatternIllustration book={book}/>
            <div><h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Markets</h4><div className="mt-2 flex flex-wrap gap-1.5">{book.markets.length ? book.markets.map(market => <span key={market} className="break-all rounded-full bg-violet-50 px-2 py-1 text-xs font-medium text-violet-700 dark:bg-violet-950 dark:text-violet-200">{market === 'Commodity' ? 'Commodities' : market}</span>) : <span className="text-xs text-slate-500">Not set</span>}</div></div>
            <div><h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Instruments</h4><div className="mt-2 flex flex-wrap gap-1.5">{book.symbols?.length ? book.symbols.map(symbol => <span key={symbol} className="break-all rounded-md border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200">{symbol}</span>) : <span className="text-xs text-slate-500">None selected</span>}</div></div>
            <div><h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Key rules</h4>{book.rules.length ? <ul className="mt-2 space-y-1.5">{book.rules.slice(0, 3).map((rule, index) => <li key={`${rule.id}-${index}`} className="flex gap-2 text-xs leading-relaxed text-slate-700 dark:text-slate-200"><span className="font-bold text-[#5338ec] dark:text-violet-300">{index + 1}.</span><span className="min-w-0 break-words">{rule.title || 'Untitled rule'}</span></li>)}</ul> : <p className="mt-2 text-xs text-slate-500">No rules yet.</p>}{book.rules.length > 3 && <p className="mt-1 text-[11px] text-slate-500">+{book.rules.length - 3} more in details</p>}</div>
            <div aria-label={`${book.name} performance`} className="space-y-2 rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
              <div className="flex items-center justify-between gap-2"><h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Performance</h4><span className="text-[10px] text-slate-500 dark:text-slate-400">{stats?.count ?? 0} closed trade{stats?.count === 1 ? '' : 's'}</span></div>
              <div className="grid grid-cols-2 gap-2">
                <div className="min-w-0 rounded-lg bg-white p-2 dark:bg-slate-900"><span className="block text-[10px] text-slate-500 dark:text-slate-400">Net P&amp;L</span><strong className={`block break-words text-sm ${!stats || stats.net === 0 ? 'text-slate-700 dark:text-slate-200' : stats.net > 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}`}>{stats ? money.format(stats.net / 100) : '—'}</strong></div>
                <div className="rounded-lg bg-white p-2 dark:bg-slate-900"><span className="block text-[10px] text-slate-500 dark:text-slate-400">Win rate</span><strong className="text-sm text-slate-700 dark:text-slate-200">{stats ? `${(stats.wins / stats.count * 100).toFixed(0)}%` : '—'}</strong></div>
                <div className="min-w-0 rounded-lg border border-emerald-100 bg-emerald-50 p-2 dark:border-emerald-900 dark:bg-emerald-950/30"><span className="block text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">Winning P&amp;L</span><strong className="block break-words text-xs text-emerald-800 dark:text-emerald-200">{stats ? money.format(stats.winNet / 100) : '—'}</strong><span className="text-[10px] text-emerald-700 dark:text-emerald-300">{stats?.wins ?? 0} win{stats?.wins === 1 ? '' : 's'}</span></div>
                <div className="min-w-0 rounded-lg border border-rose-100 bg-rose-50 p-2 dark:border-rose-900 dark:bg-rose-950/30"><span className="block text-[10px] font-semibold text-rose-700 dark:text-rose-300">Losing P&amp;L</span><strong className="block break-words text-xs text-rose-800 dark:text-rose-200">{stats ? money.format(stats.lossNet / 100) : '—'}</strong><span className="text-[10px] text-rose-700 dark:text-rose-300">{stats?.losses ?? 0} loss{stats?.losses === 1 ? '' : 'es'}</span></div>
              </div>
              {stats && stats.count - stats.wins - stats.losses > 0 && <p className="text-[10px] text-slate-500 dark:text-slate-400">{stats.count - stats.wins - stats.losses} breakeven trade{stats.count - stats.wins - stats.losses === 1 ? '' : 's'} included in the total.</p>}
            </div>
            <button type="button" aria-expanded={open} aria-controls={detailsId} onClick={() => setOpenId(open ? null : book.id)} className="w-full rounded-xl border border-violet-200 px-3 py-2.5 text-sm font-semibold text-[#5338ec] hover:bg-violet-50 focus-visible:outline-2 focus-visible:outline-[#5338ec] dark:border-violet-800 dark:text-violet-200 dark:hover:bg-violet-950">{open ? 'Hide details' : 'Show details'}</button>
            <div id={detailsId} hidden={!open} className="space-y-3 border-t border-slate-100 pt-3 text-xs text-slate-700 dark:border-slate-700 dark:text-slate-200">
              <div><h4 className="font-bold">Thesis</h4><p className="mt-1 whitespace-pre-wrap break-words leading-relaxed">{book.thesis || 'No thesis recorded.'}</p></div>
              <div><h4 className="font-bold">All rules</h4>{book.rules.length ? <ol className="mt-1 space-y-2">{book.rules.map((rule, index) => <li key={`${rule.id}-${index}`} className="break-words"><span className="font-semibold">{index + 1}. {rule.title || 'Untitled rule'}</span>{rule.detail && <p className="mt-0.5 whitespace-pre-wrap text-slate-500 dark:text-slate-400">{rule.detail}</p>}</li>)}</ol> : <p className="mt-1 text-slate-500">No rules recorded.</p>}</div>
              <p>Minimum reward:risk: <strong>1:{book.benchmarkRR}</strong></p>
              <p>Session: <strong>{book.window ? `${book.window.label} (${String(book.window.start).padStart(2, '0')}:00–${String(book.window.end).padStart(2, '0')}:00 UTC)` : 'Any time'}</strong></p>
              <button type="button" data-keep-button-icons onClick={() => onOpenWorkspace(book.id)} className="inline-flex items-center gap-1 font-semibold text-[#5338ec] underline dark:text-violet-300">Edit or open full workspace <ArrowRight size={14}/></button>
            </div>
          </div>
        </article>;
      })}
    </div> : <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-700"><p className="font-semibold text-slate-700 dark:text-slate-200">{playbooks.length ? 'No active playbooks. Choose All to see the rest.' : 'Create your first playbook to start your strategy collection.'}</p><button type="button" onClick={() => setCreating(true)} className="mt-4 rounded-xl bg-[#5338ec] px-4 py-2.5 text-sm font-semibold text-white">Create new playbook</button></div>}
    {visible.length > 0 && <p className="text-xs text-slate-500 dark:text-slate-400">Results use filtered closed trades with recorded costs in {currency}. Win and loss amounts are net of recorded costs. Breakeven trades are included in the win-rate denominator. Trades with unknown costs or other currencies are excluded.</p>}
    {creating && <QuickPlaybookCreate entries={entries} playbooks={playbooks} houseLimits={houseLimits} onClose={() => setCreating(false)} onCreate={book => { onCreate(book); setStatus('active'); setOpenId(book.id); setCreating(false); }}/>}
  </div>;
}

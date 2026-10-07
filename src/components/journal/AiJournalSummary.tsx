import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { JournalEntry } from '../../types';
import { analyzeJournal } from './journalAnalysis';
import { TextReveal, wordCount } from './TextReveal';

const STAGGER = 26;

const useReducedMotion = () => {
  const [reduced, setReduced] = useState(() => (typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false));
  useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const on = () => setReduced(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return reduced;
};

const money = (v: number) => `${v < 0 ? '-' : v > 0 ? '+' : ''}$${Math.abs(Math.round(v)).toLocaleString()}`;

interface Props {
  entries: JournalEntry[];
  checklistSize: number;
  today: string;
  onWriteEntry: () => void;
  onOpenInsights: () => void;
}

/** The Overview's summary card: MarketSyde reads the journal and says what it sees. */
export const AiJournalSummary: React.FC<Props> = ({ entries, checklistSize, today, onWriteEntry, onOpenInsights }) => {
  const reduced = useReducedMotion();
  const a = useMemo(() => analyzeJournal(entries, { checklistSize, today }), [entries, checklistSize, today]);
  const sig = useMemo(() => JSON.stringify([a.n, a.netPnl, a.winRate, a.avgR, a.planRate, a.headline, a.overview, a.strengths, a.improvements, a.focus]), [a]);
  const [run, setRun] = useState(0);
  const [reading, setReading] = useState(!reduced);
  const ref = useRef<HTMLElement>(null);

  // "Reading your trades" for a moment, then the text writes itself. Runs again when the journal changes.
  useEffect(() => {
    if (reduced) {
      setReading(false);
      return;
    }
    setReading(true);
    const t = window.setTimeout(() => setReading(false), 750);
    return () => window.clearTimeout(t);
  }, [sig, run, reduced]);

  const move = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - r.left}px`);
    el.style.setProperty('--my', `${e.clientY - r.top}px`);
    el.dataset.hover = 'true';
  };
  const leave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.removeProperty('--mx');
    el.style.removeProperty('--my');
    delete el.dataset.hover;
  };

  // when each piece starts, so the sections follow one another
  const t0 = 120;
  const tOverview = t0 + wordCount(a.headline) * STAGGER + 160;
  const tChips = tOverview + wordCount(a.overview) * STAGGER * 0.6;
  const tLists = tOverview + wordCount(a.overview) * STAGGER + 200;
  const colDelay = (col: number, upTo: number, items: { text: string }[]) => tLists + col * 260 + items.slice(0, upTo).reduce((s, it) => s + wordCount(it.text) * STAGGER * 0.7 + 120, 0);

  const chips = [
    { label: 'Win rate', value: `${a.winRate}%`, tone: 'text-[#D6F73A]' },
    { label: 'Average R', value: `${a.avgR >= 0 ? '+' : ''}${a.avgR}R`, tone: 'text-white' },
    { label: 'Profit factor', value: isFinite(a.profitFactor) ? a.profitFactor.toFixed(2) : '∞', tone: 'text-white' },
    { label: 'Plan followed', value: `${a.planRate}%`, tone: 'text-[#FF8AD8]' },
    { label: 'Closed P&L', value: money(a.netPnl), tone: a.netPnl >= 0 ? 'text-[#D6F73A]' : 'text-[#FF8AD8]' },
  ];

  return (
    <section ref={ref} onPointerMove={move} onPointerLeave={leave} aria-label="MarketSyde AI summary of your trading" className="jr-spot relative isolate overflow-hidden rounded-3xl bg-[#090119] text-white border border-white/10 p-5 sm:p-8">
      <div className="jr-spot-idle" aria-hidden />
      <div className="jr-spot-glow" aria-hidden />
      <div className="jr-spot-border" aria-hidden />

      <div className="relative z-10">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold tracking-wide bg-white/10 border border-white/15">
              <Sparkles className="w-3.5 h-3.5 text-[#D6F73A]" aria-hidden />
              <span className="jr-grad-text">MarketSyde AI summary</span>
            </span>
            <span className="text-[11px] text-white/60">{a.n} {a.n === 1 ? 'entry' : 'entries'} read</span>
          </div>
          {a.sample !== 'none' && (
            <button type="button" onClick={() => setRun((r) => r + 1)} className="text-xs font-semibold text-white/70 hover:text-white underline-offset-4 hover:underline transition-colors">
              ↻ Analyze again
            </button>
          )}
        </div>

        {a.sample === 'none' ? (
          <div className="py-4">
            <TextReveal as="h2" text={a.headline} palette="headline" instant={reduced} className="font-display text-2xl sm:text-3xl font-bold leading-tight" />
            <p className="text-sm text-white/70 mt-3 max-w-xl">{a.overview}</p>
            <button type="button" onClick={onWriteEntry} className="mt-5 rounded-xl bg-[#CAEB0E] hover:bg-[#b8d70c] text-black text-sm font-bold px-5 py-2.5 transition-colors">
              Write an entry
            </button>
          </div>
        ) : reading ? (
          <div className="py-6" role="status" aria-live="polite">
            <p className="text-sm font-semibold jr-grad-text jr-shimmer">Reading your {a.n} {a.n === 1 ? 'trade' : 'trades'}…</p>
            <div className="mt-4 space-y-2.5" aria-hidden>
              {[92, 78, 60].map((w) => <div key={w} className="h-3 rounded-full jr-skeleton" style={{ width: `${w}%` }} />)}
            </div>
          </div>
        ) : (
          <div key={`${sig}-${run}`}>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/55 mb-2">Your trading style</p>
            <TextReveal as="h2" text={a.headline} palette="headline" delay={t0} stagger={STAGGER * 1.6} instant={reduced} className="font-display text-2xl sm:text-4xl font-bold leading-tight tracking-tight max-w-3xl" />
            <TextReveal text={a.overview} palette="body" delay={tOverview} stagger={STAGGER * 0.6} instant={reduced} className="mt-4 text-[15px] sm:text-base leading-relaxed max-w-3xl" />

            <div className={`mt-5 flex flex-wrap gap-2.5 ${reduced ? '' : 'jr-fade'}`} style={reduced ? undefined : { animationDelay: `${tChips}ms` }}>
              {chips.map((c) => (
                <div key={c.label} className="rounded-xl bg-white/[0.06] border border-white/10 px-3.5 py-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-white/55">{c.label}</p>
                  <p className={`font-mono text-base font-bold ${c.tone}`}>{c.value}</p>
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-3 gap-4 mt-6">
              <Column accent="#CAEB0E" title="What you do well" delay={tLists} reduced={reduced}>
                {a.strengths.map((s, i) => (
                  <Item key={s.title} title={s.title} text={s.text} delay={colDelay(0, i, a.strengths)} reduced={reduced} />
                ))}
              </Column>
              <Column accent="#FD02B0" title="What to work on" delay={tLists + 260} reduced={reduced}>
                {a.improvements.map((s, i) => (
                  <Item key={s.title} title={s.title} text={s.text} delay={colDelay(1, i, a.improvements)} reduced={reduced} />
                ))}
              </Column>
              <Column accent="#8A7AF6" title="Your next focus" delay={tLists + 520} reduced={reduced}>
                {a.focus && (
                  <>
                    <p className="text-sm font-bold text-white">{a.focus.title}</p>
                    <TextReveal text={a.focus.why} palette="soft" delay={colDelay(2, 0, [])} stagger={STAGGER * 0.7} instant={reduced} className="text-xs leading-relaxed mt-1" />
                    <ol className="mt-3 space-y-2">
                      {a.focus.steps.map((s, i) => (
                        <li key={s} className="flex items-start gap-2.5 text-xs leading-relaxed">
                          <span className="mt-0.5 w-5 h-5 shrink-0 rounded-full bg-white/10 border border-white/15 text-[10px] font-bold flex items-center justify-center text-white/80">{i + 1}</span>
                          <TextReveal as="span" text={s} palette="soft" delay={colDelay(2, 0, []) + 500 + i * 450} stagger={STAGGER * 0.7} instant={reduced} />
                        </li>
                      ))}
                    </ol>
                  </>
                )}
              </Column>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-[11px] text-white/55 border-t border-white/10 pt-4">
              <p className="max-w-2xl">{a.caveat} Built from your journal entries, so it describes what you did and is not a forecast or advice.</p>
              <button type="button" onClick={onOpenInsights} className="font-semibold text-white/75 hover:text-white hover:underline underline-offset-4 transition-colors">See all insights</button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

const Column: React.FC<{ accent: string; title: string; delay: number; reduced: boolean; children: React.ReactNode }> = ({ accent, title, delay, reduced, children }) => (
  <div className={`rounded-2xl bg-white/[0.05] border border-white/10 p-4 sm:p-5 ${reduced ? '' : 'jr-fade'}`} style={reduced ? undefined : { animationDelay: `${delay}ms` }}>
    <div className="flex items-center gap-2 mb-3">
      <span className="w-2 h-2 rounded-full" style={{ background: accent, boxShadow: `0 0 10px ${accent}` }} aria-hidden />
      <h3 className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/70">{title}</h3>
    </div>
    <div className="space-y-4">{children}</div>
  </div>
);

const Item: React.FC<{ title: string; text: string; delay: number; reduced: boolean }> = ({ title, text, delay, reduced }) => (
  <div>
    <p className={`text-sm font-bold text-white ${reduced ? '' : 'jr-fade'}`} style={reduced ? undefined : { animationDelay: `${delay}ms` }}>{title}</p>
    <TextReveal text={text} palette="soft" delay={delay + 120} stagger={STAGGER * 0.7} instant={reduced} className="text-xs leading-relaxed mt-1" />
  </div>
);

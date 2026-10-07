import React, { useEffect, useMemo, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { JournalChecklistItem, JournalEntry } from '../../types';
import { analyzeEntry } from './entryAnalysis';
import { TextReveal, wordCount } from './TextReveal';
import { SpotlightCard, SpotlightColumn as Column, SpotlightItem as Item, STAGGER, itemDelay, useReducedMotion } from './SpotlightCard';

const TONE: Record<'lime' | 'pink' | 'white', string> = { lime: 'text-[#D6F73A]', pink: 'text-[#FF8AD8]', white: 'text-white' };

/** MarketSyde's read of one journal entry, in the same spotlight card as the Overview summary. */
export const AiEntrySummary: React.FC<{ entry: JournalEntry; allEntries: JournalEntry[]; checklist: JournalChecklistItem[] }> = ({ entry, allEntries, checklist }) => {
  const reduced = useReducedMotion();
  const a = useMemo(() => analyzeEntry(entry, allEntries, checklist), [entry, allEntries, checklist]);
  const sig = useMemo(() => JSON.stringify([entry.id, a.headline, a.overview, a.wentWell, a.improve, a.focus]), [entry.id, a]);
  const [run, setRun] = useState(0);
  const [reading, setReading] = useState(!reduced);

  // "Reading this trade" for a moment, then the text writes itself. Runs again when the entry changes.
  useEffect(() => {
    if (reduced) {
      setReading(false);
      return;
    }
    setReading(true);
    const t = window.setTimeout(() => setReading(false), 650);
    return () => window.clearTimeout(t);
  }, [sig, run, reduced]);

  const t0 = 120;
  const tOverview = t0 + wordCount(a.headline) * STAGGER * 1.6 + 160;
  const tChips = tOverview + wordCount(a.overview) * STAGGER * 0.6;
  const tLists = tOverview + wordCount(a.overview) * STAGGER * 0.6 + 350;
  const colDelay = (col: number, upTo: number, items: { text: string }[]) => itemDelay(tLists, col, upTo, items);

  return (
    <SpotlightCard label="MarketSyde AI summary of this trade" className="mb-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold tracking-wide bg-white/10 border border-white/15">
            <Sparkles className="w-3.5 h-3.5 text-[#D6F73A]" aria-hidden />
            <span className="jr-grad-text">MarketSyde AI summary</span>
          </span>
          <span className="text-[11px] text-white/60">this trade</span>
        </div>
        <button type="button" onClick={() => setRun((r) => r + 1)} className="text-xs font-semibold text-white/70 hover:text-white underline-offset-4 hover:underline transition-colors">
          ↻ Analyze again
        </button>
      </div>

      {reading ? (
        <div className="py-5" role="status" aria-live="polite">
          <p className="text-sm font-semibold jr-grad-text jr-shimmer">Reading this trade…</p>
          <div className="mt-4 space-y-2.5" aria-hidden>
            {[90, 74, 56].map((w) => <div key={w} className="h-3 rounded-full jr-skeleton" style={{ width: `${w}%` }} />)}
          </div>
        </div>
      ) : (
        <div key={`${sig}-${run}`}>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/55 mb-2">How this trade went</p>
          <TextReveal as="h2" text={a.headline} palette="headline" delay={t0} stagger={STAGGER * 1.6} instant={reduced} className="font-display text-2xl sm:text-3xl font-bold leading-tight tracking-tight max-w-3xl" />
          <TextReveal text={a.overview} palette="body" delay={tOverview} stagger={STAGGER * 0.6} instant={reduced} className="mt-3 text-[15px] leading-relaxed max-w-3xl" />

          <div className={`mt-4 flex flex-wrap gap-2.5 ${reduced ? '' : 'jr-fade'}`} style={reduced ? undefined : { animationDelay: `${tChips}ms` }}>
            {a.chips.map((c) => (
              <div key={c.label} className="rounded-xl bg-white/[0.06] border border-white/10 px-3.5 py-2">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-white/55">{c.label}</p>
                <p className={`font-mono text-base font-bold ${TONE[c.tone]}`}>{c.value}</p>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-3 gap-4 mt-5">
            <Column accent="#CAEB0E" title="What went well" delay={tLists} reduced={reduced}>
              {a.wentWell.map((s, i) => <Item key={s.title} title={s.title} text={s.text} delay={colDelay(0, i, a.wentWell)} reduced={reduced} />)}
            </Column>
            <Column accent="#FD02B0" title="What to improve" delay={tLists + 260} reduced={reduced}>
              {a.improve.map((s, i) => <Item key={s.title} title={s.title} text={s.text} delay={colDelay(1, i, a.improve)} reduced={reduced} />)}
            </Column>
            <Column accent="#8A7AF6" title="Next time" delay={tLists + 520} reduced={reduced}>
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
            </Column>
          </div>

          <p className="mt-5 text-[11px] text-white/55 border-t border-white/10 pt-4 max-w-3xl">{a.caveat} Built from your journal entry, so it describes what you did and is not a forecast or advice.</p>
        </div>
      )}
    </SpotlightCard>
  );
};

import React, { useEffect, useMemo, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { TextReveal, wordCount } from '../journal/TextReveal';
import { SpotlightCard, SpotlightColumn, SpotlightItem, STAGGER, itemDelay, useReducedMotion } from '../journal/SpotlightCard';

export interface AiSectionChip { label: string; value: string; tone?: 'lime' | 'pink' | 'white' }
export interface AiSectionItem { title: string; text: string }
export interface AiSectionColumn { accent: string; title: string; items: AiSectionItem[] }

export interface AiSectionData {
  /** Small label above the headline, e.g. "What your backtests say". */
  eyebrow: string;
  headline: string;
  overview: string;
  chips?: AiSectionChip[];
  columns?: AiSectionColumn[];
  /** One line under the card: where the read came from. */
  footnote?: string;
  /** Shown while the card "reads", e.g. "Reading your 12 runs". */
  reading?: string;
  /** Replaces the body when there is nothing to read yet. */
  empty?: { text: string; actionLabel?: string; onAction?: () => void };
}

const TONE: Record<'lime' | 'pink' | 'white', string> = { lime: 'text-[#D6F73A]', pink: 'text-[#FF8AD8]', white: 'text-white' };
export const ACCENT = { lime: '#D6F73A', pink: '#FF8AD8', violet: '#A78BFA', sky: '#7DD3FC' };

/**
 * MarketSyde's read of one feature, in the same spotlight card the trading journal uses.
 * Pass a short headline, one paragraph, a few numbers and up to three columns.
 */
export const AiSection: React.FC<{ data: AiSectionData; label?: string; className?: string }> = ({ data, label, className = '' }) => {
  const reduced = useReducedMotion();
  const sig = useMemo(() => JSON.stringify(data), [data]);
  const [run, setRun] = useState(0);
  const [reading, setReading] = useState(!reduced);

  useEffect(() => {
    if (reduced) {
      setReading(false);
      return;
    }
    setReading(true);
    const t = window.setTimeout(() => setReading(false), 700);
    return () => window.clearTimeout(t);
  }, [sig, run, reduced]);

  const t0 = 120;
  const tOverview = t0 + wordCount(data.headline) * STAGGER + 160;
  const tChips = tOverview + wordCount(data.overview) * STAGGER * 0.6;
  const tLists = tOverview + wordCount(data.overview) * STAGGER + 200;
  const columns = data.columns ?? [];

  return (
    <SpotlightCard label={label ?? `MarketSyde AI summary: ${data.eyebrow}`} className={className}>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold tracking-wide bg-white/10 border border-white/15">
          <Sparkles className="w-3.5 h-3.5 text-[#D6F73A]" aria-hidden />
          <span className="jr-grad-text">MarketSyde AI summary</span>
        </span>
        {!data.empty && (
          <button type="button" onClick={() => setRun((r) => r + 1)} className="text-xs font-semibold text-white/70 hover:text-white underline-offset-4 hover:underline transition-colors">
            ↻ Analyze again
          </button>
        )}
      </div>

      {data.empty ? (
        <div className="py-4">
          <TextReveal as="h2" text={data.headline} palette="headline" instant={reduced} className="font-display text-2xl sm:text-3xl font-bold leading-tight" />
          <p className="text-sm text-white/70 mt-3 max-w-xl">{data.empty.text}</p>
          {data.empty.actionLabel && (
            <button type="button" onClick={data.empty.onAction} className="mt-5 rounded-xl bg-[#CAEB0E] hover:bg-[#b8d70c] text-black text-sm font-bold px-5 py-2.5 transition-colors">
              {data.empty.actionLabel}
            </button>
          )}
        </div>
      ) : reading ? (
        <div className="py-6" role="status" aria-live="polite">
          <p className="text-sm font-semibold jr-grad-text jr-shimmer">{data.reading ?? 'Reading your data…'}</p>
          <div className="mt-4 space-y-2.5" aria-hidden>
            {[92, 78, 60].map((w) => <div key={w} className="h-3 rounded-full jr-skeleton" style={{ width: `${w}%` }} />)}
          </div>
        </div>
      ) : (
        <div key={`${sig}-${run}`}>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/55 mb-2">{data.eyebrow}</p>
          <TextReveal as="h2" text={data.headline} palette="headline" delay={t0} stagger={STAGGER * 1.6} instant={reduced} className="font-display text-2xl sm:text-4xl font-bold leading-tight tracking-tight max-w-3xl" />
          <TextReveal text={data.overview} palette="body" delay={tOverview} stagger={STAGGER * 0.6} instant={reduced} className="mt-4 text-[15px] sm:text-base leading-relaxed max-w-3xl" />

          {data.chips && data.chips.length > 0 && (
            <div className={`mt-5 flex flex-wrap gap-2.5 ${reduced ? '' : 'jr-fade'}`} style={reduced ? undefined : { animationDelay: `${tChips}ms` }}>
              {data.chips.map((c) => (
                <div key={c.label} className="rounded-xl bg-white/[0.06] border border-white/10 px-3.5 py-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-white/55">{c.label}</p>
                  <p className={`font-mono text-base font-bold ${TONE[c.tone ?? 'white']}`}>{c.value}</p>
                </div>
              ))}
            </div>
          )}

          {columns.length > 0 && (
            <div className={`mt-6 grid gap-4 ${columns.length >= 3 ? 'md:grid-cols-3' : columns.length === 2 ? 'md:grid-cols-2' : ''}`}>
              {columns.map((col, ci) => (
                <SpotlightColumn key={col.title} accent={col.accent} title={col.title} delay={itemDelay(tLists, ci, 0, [])} reduced={reduced}>
                  {col.items.map((it, ii) => (
                    <SpotlightItem key={it.title} title={it.title} text={it.text} delay={itemDelay(tLists, ci, ii, col.items)} reduced={reduced} />
                  ))}
                </SpotlightColumn>
              ))}
            </div>
          )}

          {data.footnote && <p className="mt-6 text-[11px] text-white/45 leading-relaxed">{data.footnote}</p>}
        </div>
      )}
    </SpotlightCard>
  );
};

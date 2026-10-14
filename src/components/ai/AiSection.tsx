import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDown, Sparkles } from 'lucide-react';
import { TextReveal, wordCount } from '../journal/TextReveal';
import { SpotlightCard, SpotlightColumn, SpotlightItem, STAGGER, useReducedMotion } from '../journal/SpotlightCard';

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
export const AiSection: React.FC<{ data: AiSectionData; label?: string; className?: string; defaultOpen?: boolean }> = ({ data, label, className = '', defaultOpen = false }) => {
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(defaultOpen);
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
    <SpotlightCard label={label ?? `MarketSyde AI summary: ${data.eyebrow}`} className={`!p-4 sm:!p-5 !rounded-2xl ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide bg-white/10 border border-white/15">
          <Sparkles className="w-3 h-3 text-[#D6F73A]" aria-hidden />
          <span className="jr-grad-text">MarketSyde AI summary</span>
        </span>
        {!data.empty && (
          <button type="button" onClick={() => setRun((r) => r + 1)} className="text-[11px] font-semibold text-white/60 hover:text-white underline-offset-4 hover:underline transition-colors">
            ↻ Analyze again
          </button>
        )}
      </div>

      {data.empty ? (
        <div className="py-1">
          <TextReveal as="h2" text={data.headline} palette="headline" instant={reduced} className="font-display text-lg sm:text-xl font-bold leading-snug" />
          <p className="text-[13px] text-white/70 mt-2 max-w-xl">{data.empty.text}</p>
          {data.empty.actionLabel && (
            <button type="button" onClick={data.empty.onAction} className="mt-4 rounded-lg bg-[#CAEB0E] hover:bg-[#b8d70c] text-black text-[13px] font-bold px-4 py-2 transition-colors">
              {data.empty.actionLabel}
            </button>
          )}
        </div>
      ) : reading ? (
        <div className="py-2" role="status" aria-live="polite">
          <p className="text-[13px] font-semibold jr-grad-text jr-shimmer">{data.reading ?? 'Reading your data…'}</p>
          <div className="mt-3 space-y-2" aria-hidden>
            {[82, 58].map((w) => <div key={w} className="h-2.5 rounded-full jr-skeleton" style={{ width: `${w}%` }} />)}
          </div>
        </div>
      ) : (
        <div key={`${sig}-${run}`}>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/50 mb-1.5">{data.eyebrow}</p>
          <TextReveal as="h2" text={data.headline} palette="headline" delay={t0} stagger={STAGGER * 1.6} instant={reduced} className="font-display text-xl sm:text-[22px] font-bold leading-snug tracking-tight max-w-3xl" />
          <TextReveal text={data.overview} palette="body" delay={tOverview} stagger={STAGGER * 0.6} instant={reduced} className="mt-2 text-[13px] leading-relaxed text-white/80 max-w-3xl line-clamp-2" />

          {data.chips && data.chips.length > 0 && (
            <div className={`mt-3 flex flex-wrap gap-2 ${reduced ? '' : 'jr-fade'}`} style={reduced ? undefined : { animationDelay: `${tChips}ms` }}>
              {data.chips.slice(0, 4).map((c) => (
                <div key={c.label} className="rounded-lg bg-white/[0.06] border border-white/10 px-2.5 py-1.5">
                  <p className="text-[9px] font-semibold uppercase tracking-wide text-white/50">{c.label}</p>
                  <p className={`font-mono text-[13px] font-bold ${TONE[c.tone ?? 'white']}`}>{c.value}</p>
                </div>
              ))}
            </div>
          )}

          {columns.length > 0 && (
            <>
              <button type="button" aria-expanded={open} onClick={() => setOpen((v) => !v)} className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-semibold text-white/70 hover:text-white transition-colors">
                {open ? 'Hide the detail' : 'Read the detail'}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
              </button>

              {open && (
                <div className={`mt-4 grid gap-3 ${columns.length >= 3 ? 'md:grid-cols-3' : columns.length === 2 ? 'md:grid-cols-2' : ''}`}>
                  {columns.map((col) => (
                    <SpotlightColumn key={col.title} accent={col.accent} title={col.title} delay={0} reduced>
                      {col.items.map((it) => <SpotlightItem key={it.title} title={it.title} text={it.text} delay={0} reduced />)}
                    </SpotlightColumn>
                  ))}
                </div>
              )}
            </>
          )}

          {data.footnote && open && <p className="mt-4 text-[11px] text-white/45 leading-relaxed">{data.footnote}</p>}
        </div>
      )}
    </SpotlightCard>
  );
};

/* ───────────── Lighter variants ─────────────
 * Not every page deserves the big dark card. Use the one that fits:
 *  - AiSection  : a page where the read is the point (dashboard, journal)
 *  - AiNote     : a quiet light box beside content the person is reading
 *  - AiInline   : one sentence under a number the person just produced
 *  - AiStrip    : a single line of guidance above a list
 */

export const AiNote: React.FC<{ title: string; lines: string[]; footnote?: string; className?: string }> = ({ title, lines, footnote, className = '' }) => (
  <aside className={`rounded-xl border border-[#d7d3fb] bg-[#faf9ff] p-4 ${className}`} aria-label={`MarketSyde AI: ${title}`}>
    <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-[#5945F1] mb-2">
      <Sparkles className="w-3.5 h-3.5" aria-hidden />MarketSyde AI · {title}
    </p>
    <ul className="space-y-1.5">
      {lines.map((l) => (
        <li key={l} className="flex gap-2 text-[13px] leading-relaxed text-[#0b1c30]">
          <span className="mt-[7px] w-1.5 h-1.5 rounded-full bg-[#5945F1] shrink-0" aria-hidden />
          <span>{l}</span>
        </li>
      ))}
    </ul>
    {footnote && <p className="text-[11px] text-[#64748b] mt-2.5">{footnote}</p>}
  </aside>
);

export const AiInline: React.FC<{ text: string; tone?: 'neutral' | 'warn' | 'good'; className?: string }> = ({ text, tone = 'neutral', className = '' }) => {
  const colour = tone === 'warn' ? 'text-[#b45309] bg-[#fffbeb] border-[#fde68a]' : tone === 'good' ? 'text-[#15803d] bg-[#f0fdf4] border-[#bbf7d0]' : 'text-[#0b1c30] bg-[#faf9ff] border-[#d7d3fb]';
  return (
    <p className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-[13px] leading-relaxed ${colour} ${className}`} role="note">
      <Sparkles className="w-3.5 h-3.5 mt-[3px] shrink-0 opacity-80" aria-hidden />
      <span><span className="font-semibold">MarketSyde AI:</span> {text}</span>
    </p>
  );
};

export const AiStrip: React.FC<{ text: string; action?: { label: string; onClick: () => void }; bare?: boolean; className?: string }> = ({ text, action, bare = false, className = '' }) => (
  <div className={`flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-[#d7d3fb] bg-gradient-to-r from-[#f3f1ff] to-[#fdf2fb] px-4 py-3 ${className}`} role="note">
    {!bare && (
      <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-[#5945F1] shrink-0">
        <Sparkles className="w-3.5 h-3.5" aria-hidden />MarketSyde AI
      </span>
    )}
    <span className="text-[13px] leading-relaxed text-[#0b1c30] flex-1 min-w-[200px]">{text}</span>
    {action && <button type="button" onClick={action.onClick} className="text-[13px] font-semibold text-[#5945F1] hover:underline shrink-0">{action.label}</button>}
  </div>
);

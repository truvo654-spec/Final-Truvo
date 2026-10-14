import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Maximize2, Minus, RefreshCw, Sparkles } from 'lucide-react';

/**
 * The spotlight panel: one shape for every AI read in the app.
 *
 * It borrows the rhythm of a chat — a header of tabs, lines that arrive one
 * after another, a strip along the bottom — without being one. Nothing here
 * accepts typing: the bottom strip holds the suggestions for that feature,
 * and each one opens a page rather than sending a message.
 */

export interface SpotlightLine {
  /** Bold lead, e.g. "Sales History". */
  label: string;
  /** Grey qualifier after the label, e.g. "Flavor Data". */
  sub?: string;
  /** How long that read took, shown as "for 0.4s". */
  took?: string;
  body: string;
  tone?: 'good' | 'bad' | 'neutral';
}

export interface SpotlightTab {
  id: string;
  label: string;
  lines: SpotlightLine[];
}

export interface SpotlightSuggestion {
  label: string;
  /** One line under the label in the dashboard panel. */
  sub?: string;
  onClick: () => void;
}

export interface SpotlightData {
  /** Sits above the headline: what was read, e.g. "Read 23 signals". */
  pretext: string;
  headline: string;
  /** One line under the headline, shown on the first tab. */
  overview?: string;
  stats?: { label: string; value: string; tone?: 'good' | 'bad' | 'neutral' }[];
  tabs: SpotlightTab[];
  suggestions?: SpotlightSuggestion[];
  /** One line explaining a figure, keyed by its label. */
  statNotes?: Record<string, string>;
  footnote?: string;
}

const TONE: Record<string, string> = {
  good: 'text-emerald-600',
  bad: 'text-rose-600',
  neutral: 'text-[#0b1c30]',
};

const Line: React.FC<{ line: SpotlightLine; delay: number; reduced: boolean }> = ({ line, delay, reduced }) => (
  <div
    className="flex w-full flex-col gap-1"
    style={reduced ? undefined : { animation: `ai-spot-up 420ms cubic-bezier(0.23,1,0.32,1) ${delay}ms both` }}
  >
    <p className="flex flex-wrap items-center gap-1 text-[12px] leading-[1.3]">
      <span className={`font-semibold ${TONE[line.tone ?? 'neutral']}`}>{line.label}</span>
      {line.sub && <span className="text-[#94a3b8]">{line.sub}</span>}
      {line.took && <span className="text-[#cbd5e1]">for {line.took}</span>}
    </p>
    <p className="text-[13px] leading-relaxed text-[#474556]">{line.body}</p>
  </div>
);

export const AiSpotlightPanel: React.FC<{
  data: SpotlightData;
  /** Remembers the minimised state for this feature. */
  storageKey?: string;
  className?: string;
}> = ({ data, storageKey, className = '' }) => {
  const reduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const [tab, setTab] = useState(data.tabs[0]?.id ?? '');
  const [minimised, setMinimised] = useState(false);
  const [run, setRun] = useState(0);
  const [reading, setReading] = useState(!reduced);
  const read = useRef(false);

  useEffect(() => {
    if (!storageKey) return;
    try {
      setMinimised(window.localStorage.getItem(`ai.min.${storageKey}`) === '1');
    } catch { /* storage can be blocked; leave it open */ }
  }, [storageKey]);

  const toggle = () => {
    setMinimised((m) => {
      const next = !m;
      try { if (storageKey) window.localStorage.setItem(`ai.min.${storageKey}`, next ? '1' : '0'); } catch { /* ignore */ }
      return next;
    });
  };

  useEffect(() => {
    if (reduced) { setReading(false); return; }
    setReading(true);
    const t = window.setTimeout(() => { setReading(false); read.current = true; }, run === 0 && !read.current ? 620 : 820);
    return () => window.clearTimeout(t);
  }, [run, reduced]);

  const active = useMemo(() => data.tabs.find((t) => t.id === tab) ?? data.tabs[0], [data.tabs, tab]);
  const first = active?.id === data.tabs[0]?.id;

  return (
    <section
      aria-label={`MarketSyde AI summary: ${data.pretext}`}
      className={`overflow-hidden rounded-2xl border border-[#d0cbfb] bg-white shadow-[0_1px_2px_rgba(11,28,48,0.04)] ${className}`}
    >
      <style>{`@keyframes ai-spot-up{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}`}</style>

      {/* header: tabs on the left, controls on the right */}
      <div className="flex items-center justify-between gap-3 border-b border-[#ece9fb] p-1.5">
        <div className="flex min-w-0 items-center gap-0.5 overflow-x-auto no-scrollbar">
          <span className="ml-1 mr-1.5 inline-flex shrink-0 items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-[#5945F1]">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />MarketSyde AI
          </span>
          {!minimised && data.tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              aria-pressed={active?.id === t.id}
              onClick={() => setTab(t.id)}
              className={`shrink-0 rounded-md px-2 py-[3px] text-[13px] transition-colors duration-100 ${
                active?.id === t.id ? 'bg-[#f1f0fe] text-[#0b1c30]' : 'text-[#64748b] hover:bg-[#f7f6ff]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {!minimised && (
            <button
              type="button"
              aria-label="Analyze again"
              onClick={() => setRun((r) => r + 1)}
              className="flex h-6 w-6 items-center justify-center rounded-md text-[#94a3b8] transition-colors hover:bg-[#f1f0fe] hover:text-[#5945F1]"
            >
              <RefreshCw className="h-[15px] w-[15px]" />
            </button>
          )}
          <button
            type="button"
            aria-label={minimised ? 'Expand the summary' : 'Minimise the summary'}
            aria-expanded={!minimised}
            onClick={toggle}
            className="flex h-6 w-6 items-center justify-center rounded-md text-[#94a3b8] transition-colors hover:bg-[#f1f0fe] hover:text-[#5945F1]"
          >
            {minimised ? <Maximize2 className="h-[14px] w-[14px]" /> : <Minus className="h-[15px] w-[15px]" />}
          </button>
        </div>
      </div>

      {minimised ? (
        <button type="button" onClick={toggle} className="flex w-full items-center gap-2 px-3 py-2.5 text-left">
          <span className="truncate text-[13px] font-semibold text-[#0b1c30]">{data.headline}</span>
          <ChevronDown className="ml-auto h-4 w-4 shrink-0 text-[#94a3b8]" aria-hidden />
        </button>
      ) : (
        <>
          <div className="flex flex-col gap-3 px-3 pt-3 pb-2">
            {reading ? (
              <div role="status" aria-live="polite">
                <p className="text-[12px] font-semibold text-[#5945F1]">{data.pretext}…</p>
                <div className="mt-2.5 space-y-2" aria-hidden>
                  {[78, 54].map((w) => (
                    <div key={w} className="h-2.5 animate-pulse rounded-full bg-[#f1f0fe]" style={{ width: `${w}%` }} />
                  ))}
                </div>
              </div>
            ) : (
              <div key={`${active?.id}-${run}`} className="flex flex-col gap-3">
                {first && (
                  <div style={reduced ? undefined : { animation: 'ai-spot-up 420ms cubic-bezier(0.23,1,0.32,1) both' }}>
                    <p className="text-[12px] text-[#94a3b8]">{data.pretext}</p>
                    <h3 className="mt-0.5 text-[17px] font-bold leading-snug text-[#0b1c30]">{data.headline}</h3>
                    {data.overview && <p className="mt-1.5 text-[13px] leading-relaxed text-[#474556]">{data.overview}</p>}
                    {data.stats && data.stats.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {data.stats.slice(0, 4).map((s) => (
                          <span key={s.label} className="rounded-lg border border-[#ece9fb] bg-[#fbfbff] px-2.5 py-1.5">
                            <span className="block text-[10px] font-semibold uppercase tracking-wide text-[#94a3b8]">{s.label}</span>
                            <span className={`block font-mono text-[13px] font-bold ${TONE[s.tone ?? 'neutral']}`}>{s.value}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {(active?.lines ?? []).map((l, i) => (
                  <Line key={l.label} line={l} delay={(first ? 160 : 0) + i * 140} reduced={!!reduced} />
                ))}
              </div>
            )}
          </div>

          {/* bottom strip: the feature's own suggestions, not a composer */}
          {data.suggestions && data.suggestions.length > 0 && (
            <div className="p-1.5 pt-0">
              <div className="rounded-xl border border-[#ece9fb] bg-[#fbfbff] p-2.5">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[#94a3b8]">Where to go next</p>
                <div className="flex flex-wrap gap-2">
                  {data.suggestions.map((s) => (
                    <button
                      key={s.label}
                      type="button"
                      onClick={s.onClick}
                      className="rounded-lg border border-[#d7d3fb] bg-white px-3 py-1.5 text-[13px] text-[#5945F1] transition-colors hover:bg-[#f1f0fe]"
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {data.footnote && <p className="px-3 pb-3 text-[11px] leading-relaxed text-[#94a3b8]">{data.footnote}</p>}
        </>
      )}
    </section>
  );
};

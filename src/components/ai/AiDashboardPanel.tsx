import React, { useEffect, useMemo, useState } from 'react';
import { Activity, BarChart3, BookOpenCheck, CalendarDays, ChevronRight, Compass, Info, LayoutGrid, MessageCircle, RefreshCw, Shield, Sun, X } from 'lucide-react';
import { SpotlightData } from './AiSpotlightPanel';
import robot from '../../assets/community/ai-robot.png';

/**
 * The AI panel as a small dashboard: a greeting, the headline read, four
 * figures with their trend, and where to go next. Light and dark.
 */

const ICONS = [LayoutGrid, Activity, BarChart3, Shield];

/** A stable sparkline for a figure, so it does not jump between renders. */
function spark(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i += 1) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const pts: number[] = [];
  let v = 50;
  for (let i = 0; i < 16; i += 1) {
    h = (h * 1103515245 + 12345) >>> 0;
    v = Math.max(8, Math.min(92, v + ((h % 100) - 48) / 2.2));
    pts.push(v);
  }
  return pts.map((y, i) => `${i === 0 ? 'M' : 'L'}${(i / (pts.length - 1)) * 160},${34 - (y / 100) * 28}`).join(' ');
}

const TREND: Record<string, string> = { good: '#aeea00', bad: '#ff4fa3', neutral: '#8b7bf7' };

export const AiDashboardPanel: React.FC<{
  data: SpotlightData;
  greeting: string;
  onClose: () => void;
  onAsk: () => void;
  storageKey?: string;
  className?: string;
}> = ({ data, greeting, onClose, onAsk, storageKey, className = '' }) => {
  const [tab, setTab] = useState(data.tabs[0]?.id ?? 'summary');
  const [run, setRun] = useState(0);
  const active = useMemo(() => data.tabs.find((t) => t.id === tab) ?? data.tabs[0], [data.tabs, tab]);
  const first = active?.id === data.tabs[0]?.id;

  useEffect(() => { setTab(data.tabs[0]?.id ?? 'summary'); }, [storageKey, data.tabs]);

  const pill = 'rounded-lg px-3 py-1.5 text-[14px] transition-colors';

  return (
    <section
      aria-label={`MarketSyde AI: ${data.pretext}`}
      data-keep-button-icons
      className={`flex flex-col overflow-hidden rounded-2xl border border-[#e4e0fa] bg-[#fbfbff] text-[#0b1c30] shadow-[0_18px_50px_rgba(11,28,48,0.18)] dark:border-[#2a1a66] dark:bg-[#090119] dark:text-white ${className}`}
    >
      {/* header */}
      <div className="flex shrink-0 items-center gap-3 border-b border-[#ece9fb] px-4 py-2.5 dark:border-[#1d1046]">
        <span className="flex shrink-0 items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#5945F1] text-[13px] font-black text-white">M</span>
          <span className="hidden text-[15px] font-bold sm:inline">market<span className="text-[#5945F1] dark:text-[#a99bff]">syde</span></span>
        </span>
        <span className="shrink-0 rounded-md bg-[#efecff] px-2 py-0.5 text-[11px] font-bold text-[#5945F1] dark:bg-[#1d1046] dark:text-[#a99bff]">AI</span>

        <nav className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto no-scrollbar">
          {data.tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              aria-pressed={active?.id === t.id}
              onClick={() => setTab(t.id)}
              className={`${pill} shrink-0 ${active?.id === t.id
                ? 'bg-white font-semibold text-[#5945F1] shadow-sm dark:bg-[#170345] dark:text-white'
                : 'text-[#64748b] hover:bg-white/70 dark:text-white/70 dark:hover:bg-white/5'}`}
            >
              {t.label}
            </button>
          ))}
          <button type="button" onClick={onAsk} className={`${pill} shrink-0 text-[#64748b] hover:bg-white/70 dark:text-white/70 dark:hover:bg-white/5`}>Ask</button>
          <span className="shrink-0 rounded-full border border-[#d7d3fb] px-2.5 py-0.5 text-[11px] font-semibold text-[#64748b] dark:border-white/25 dark:text-white/70">Beta</span>
        </nav>

        <div className="flex shrink-0 items-center gap-1.5">
          <button type="button" aria-label="Analyze again" onClick={() => setRun((r) => r + 1)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#d7d3fb] text-[#5945F1] transition hover:bg-[#f1f0fe] dark:border-white/20 dark:text-white dark:hover:bg-white/10">
            <RefreshCw className="h-4 w-4" />
          </button>
          <button type="button" aria-label="Close the MarketSyde AI panel" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#d7d3fb] text-[#5945F1] transition hover:bg-[#f1f0fe] dark:border-white/20 dark:text-white dark:hover:bg-white/10">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div key={`${active?.id}-${run}`} className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
        {first ? (
          <>
            <div className="flex flex-col-reverse gap-6 lg:flex-row lg:items-start">
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 text-[14px] text-[#64748b] dark:text-white/70">
                  <Sun className="h-4 w-4" aria-hidden />{greeting}
                </p>
                <h2 className="mt-2 font-display text-[26px] font-bold leading-tight sm:text-[30px]">{data.headline}</h2>
                {data.overview && <p className="mt-3 max-w-[560px] text-[15px] leading-relaxed text-[#474556] dark:text-white/70">{data.overview}</p>}
              </div>
              <img src={robot} alt="" aria-hidden className="w-[260px] shrink-0 self-center rounded-xl lg:w-[300px]" />
            </div>

            {data.stats && data.stats.length > 0 && (
              <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                {data.stats.slice(0, 4).map((s, i) => {
                  const Icon = ICONS[i % ICONS.length];
                  const colour = TREND[s.tone ?? 'neutral'];
                  return (
                    <div key={s.label} className="rounded-xl border border-[#e4e0fa] bg-[#f8f7ff] p-4 dark:border-[#2a1a66] dark:bg-[#170345]">
                      <div className="flex items-start gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#5945F1] dark:bg-white/5 dark:text-white">
                          <Icon className="h-[18px] w-[18px]" aria-hidden />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-[11px] font-semibold uppercase tracking-wide text-[#64748b] dark:text-white/60">{s.label}</span>
                          <span className="mt-1 block font-display text-[24px] font-bold leading-none" style={{ color: s.tone ? colour : undefined }}>{s.value}</span>
                        </span>
                      </div>
                      <svg viewBox="0 0 160 36" preserveAspectRatio="none" className="mt-3 h-9 w-full" aria-hidden>
                        <path d={spark(s.label + s.value)} fill="none" stroke={colour} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <div className="space-y-5">
            {(active?.lines ?? []).map((l) => (
              <div key={l.label}>
                <p className="text-[15px] font-bold">{l.label}</p>
                <p className="mt-1 text-[14px] leading-relaxed text-[#474556] dark:text-white/70">{l.body}</p>
              </div>
            ))}
          </div>
        )}

        {data.suggestions && data.suggestions.length > 0 && (
          <>
            <p className="mt-7 flex items-center gap-2 text-[12px] font-bold uppercase tracking-wide text-[#5945F1] dark:text-[#d6f73a]">
              <Compass className="h-4 w-4" aria-hidden />Where to go next
            </p>
            <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.suggestions.map((s, i) => {
                const Icon = [BookOpenCheck, CalendarDays, MessageCircle][i % 3];
                return (
                  <button
                    key={s.label}
                    type="button"
                    onClick={s.onClick}
                    className="flex items-start gap-3 rounded-xl border border-[#e4e0fa] bg-[#f8f7ff] p-4 text-left transition hover:border-[#5945F1] dark:border-[#2a1a66] dark:bg-[#170345] dark:hover:border-[#6b5bff]"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#5945F1] dark:bg-white/5 dark:text-white">
                      <Icon className="h-[18px] w-[18px]" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[15px] font-bold">{s.label}</span>
                      {s.sub && <span className="mt-1 block text-[13px] leading-relaxed text-[#64748b] dark:text-white/60">{s.sub}</span>}
                    </span>
                    <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-[#94a3b8] dark:text-white/50" aria-hidden />
                  </button>
                );
              })}
            </div>
          </>
        )}

        {data.footnote && (
          <p className="mt-6 flex items-start gap-2 text-[12px] leading-relaxed text-[#94a3b8] dark:text-white/45">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />{data.footnote}
          </p>
        )}
      </div>
    </section>
  );
};

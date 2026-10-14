import React from 'react';
import { ArrowRight, CalendarClock, CheckCircle2, Sparkles, TrendingDown, TrendingUp } from 'lucide-react';

/**
 * Light AI presentations. The dark spotlight card is reserved for the two pages
 * where the read is the point (dashboard, journal); everywhere else gets the
 * shape that matches what the AI is actually saying.
 */

/** Drops the card chrome when the widget sits inside the AI panel. */
const shell = (bare: boolean, cls: string) => (bare ? '' : cls);

const Tag: React.FC<{ children?: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-[#5945F1] ${className}`}>
    <Sparkles className="w-3 h-3" aria-hidden />MarketSyde AI{children}
  </span>
);

/* ── 1. Verdict: a split meter for anything with two sides (longs vs shorts, bullish vs bearish) ── */
export const AiVerdict: React.FC<{
  headline: string;
  note: string;
  left: { label: string; value: number };
  right: { label: string; value: number };
  neutral?: { label: string; value: number };
  stats?: { label: string; value: string }[];
  bare?: boolean;
  className?: string;
}> = ({ headline, note, left, right, neutral, stats = [], bare = false, className = '' }) => {
  const total = Math.max(1, left.value + right.value + (neutral?.value ?? 0));
  const seg = (v: number) => `${(v / total) * 100}%`;
  return (
    <section className={`${shell(bare, 'rounded-2xl border border-[#d7d3fb] dark:border-[#2a1a66] bg-white dark:bg-transparent p-4 sm:p-5')} ${className}`} aria-label="MarketSyde AI verdict">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          {!bare && <Tag />}
          {!bare && <h3 className="text-[17px] sm:text-lg font-bold text-[#0b1c30] dark:text-white mt-1.5 leading-snug">{headline}</h3>}
        </div>
        {stats.length > 0 && (
          <div className="flex gap-4 shrink-0">
            {stats.map((s) => (
              <div key={s.label} className="text-right">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[#94a3b8]">{s.label}</p>
                <p className="font-mono text-[15px] font-bold text-[#0b1c30] dark:text-white">{s.value}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex h-2.5 rounded-full overflow-hidden mt-4 bg-[#eef1f5] dark:bg-white/10" role="img" aria-label={`${left.label} ${left.value}, ${right.label} ${right.value}`}>
        <span style={{ width: seg(left.value) }} className="bg-[#caeb0e]" />
        {neutral && <span style={{ width: seg(neutral.value) }} className="bg-[#e2e8f0]" />}
        <span style={{ width: seg(right.value) }} className="bg-[#5945F1]" />
      </div>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 mt-2 text-[11px] font-semibold">
        <span className="flex items-center gap-1.5 text-[#5f7a00]"><TrendingUp className="w-3.5 h-3.5" />{left.label} {left.value}</span>
        {neutral && <span className="text-[#64748b]">{neutral.label} {neutral.value}</span>}
        <span className="flex items-center gap-1.5 text-[#5945F1]"><TrendingDown className="w-3.5 h-3.5" />{right.label} {right.value}</span>
      </div>
      <p className="text-[13px] leading-relaxed text-[#474556] dark:text-white/70 mt-3">{note}</p>
    </section>
  );
};

/* ── 2. Next up: one thing with a time on it (a release, an offer closing) ── */
export const AiNext: React.FC<{
  kicker: string;
  title: string;
  meta: string;
  note: string;
  tone?: 'violet' | 'amber';
  action?: { label: string; onClick: () => void };
  bare?: boolean;
  className?: string;
}> = ({ kicker, title, meta, note, tone = 'violet', action, bare = false, className = '' }) => {
  const bar = tone === 'amber' ? 'bg-[#f59e0b]' : 'bg-[#5945F1]';
  const bg = tone === 'amber' ? 'bg-[#fffbeb] border-[#fde68a]' : 'bg-[#faf9ff] border-[#d7d3fb]';
  return (
    <section className={`relative overflow-hidden pl-5 ${shell(bare, `rounded-2xl border ${bg} p-4 sm:p-5 sm:pl-6`)} ${className}`} aria-label="MarketSyde AI, next up">
      <span className={`absolute left-0 top-0 bottom-0 w-1.5 ${bar}`} aria-hidden />
      <div className="flex flex-wrap items-center justify-between gap-3">
        {!bare && <Tag />}
        <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[#64748b]"><CalendarClock className="w-3.5 h-3.5" />{meta}</span>
      </div>
      <p className="text-[10px] font-bold uppercase tracking-wide text-[#94a3b8] mt-2">{kicker}</p>
      <h3 className="text-[17px] sm:text-lg font-bold text-[#0b1c30] dark:text-white leading-snug mt-0.5">{title}</h3>
      <p className="text-[13px] leading-relaxed text-[#474556] dark:text-white/70 mt-2">{note}</p>
      {action && (
        <button type="button" onClick={action.onClick} className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#5945F1] hover:underline">
          {action.label}<ArrowRight className="w-3.5 h-3.5" />
        </button>
      )}
    </section>
  );
};

/* ── 3. Progress: a bar towards something (points to a level, courses done) ── */
export const AiProgress: React.FC<{
  headline: string;
  note: string;
  value: number;
  max: number;
  valueLabel: string;
  targetLabel: string;
  action?: { label: string; onClick: () => void };
  bare?: boolean;
  className?: string;
}> = ({ headline, note, value, max, valueLabel, targetLabel, action, bare = false, className = '' }) => {
  const share = Math.max(0, Math.min(100, (value / Math.max(1, max)) * 100));
  return (
    <section className={`${shell(bare, "rounded-2xl border border-[#d7d3fb] dark:border-[#2a1a66] bg-gradient-to-r from-white to-[#faf9ff] dark:from-transparent dark:to-transparent p-4 sm:p-5")} ${className}`} aria-label="MarketSyde AI progress">
      {!bare && <Tag />}
      <div className="flex flex-wrap items-end justify-between gap-3 mt-1.5">
        {!bare && <h3 className="text-[17px] sm:text-lg font-bold text-[#0b1c30] dark:text-white leading-snug">{headline}</h3>}
        <p className="font-mono text-[15px] font-bold text-[#5945F1]">{valueLabel}</p>
      </div>
      <div className="h-2.5 rounded-full bg-[#ece9ff] dark:bg-white/10 overflow-hidden mt-3" role="img" aria-label={`${Math.round(share)}% of the way to ${targetLabel}`}>
        <span style={{ width: `${share}%` }} className="block h-full rounded-full bg-gradient-to-r from-[#5945F1] to-[#c026d3]" />
      </div>
      <div className="flex justify-between text-[11px] text-[#64748b] dark:text-white/60 mt-1.5">
        <span>{Math.round(share)}% there</span>
        <span>{targetLabel}</span>
      </div>
      <p className="text-[13px] leading-relaxed text-[#474556] dark:text-white/70 mt-3">{note}</p>
      {action && (
        <button type="button" onClick={action.onClick} className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#5945F1] hover:underline">
          {action.label}<ArrowRight className="w-3.5 h-3.5" />
        </button>
      )}
    </section>
  );
};

/* ── 4. Compare: the safe pick against the risky one ── */
export const AiCompare: React.FC<{
  headline: string;
  left: { badge: string; title: string; text: string };
  right: { badge: string; title: string; text: string };
  note?: string;
  bare?: boolean;
  className?: string;
}> = ({ headline, left, right, note, bare = false, className = '' }) => (
  <section className={`${shell(bare, 'rounded-2xl border border-[#d7d3fb] dark:border-[#2a1a66] bg-white dark:bg-transparent p-4 sm:p-5')} ${className}`} aria-label="MarketSyde AI comparison">
    {!bare && <Tag />}
    {!bare && <h3 className="text-[17px] sm:text-lg font-bold text-[#0b1c30] dark:text-white leading-snug mt-1.5">{headline}</h3>}
    <div className="grid sm:grid-cols-2 gap-3 mt-4">
      {[{ ...left, accent: 'border-l-[#caeb0e]' }, { ...right, accent: 'border-l-[#fd02b0]' }].map((c) => (
        <div key={c.badge} className={`rounded-xl border border-[#e8e5fb] dark:border-[#2a1a66] border-l-[3px] ${c.accent} bg-[#fbfbff] dark:bg-[#170345] p-3.5`}>
          <p className="text-[10px] font-bold uppercase tracking-wide text-[#94a3b8]">{c.badge}</p>
          <p className="text-[15px] font-bold text-[#0b1c30] dark:text-white mt-0.5">{c.title}</p>
          <p className="text-[12.5px] leading-relaxed text-[#474556] dark:text-white/70 mt-1.5">{c.text}</p>
        </div>
      ))}
    </div>
    {note && <p className="text-[12px] text-[#64748b] dark:text-white/60 mt-3">{note}</p>}
  </section>
);

/* ── 5. Checklist: numbered steps, for anything procedural ── */
export const AiChecklist: React.FC<{
  headline: string;
  steps: { title: string; text: string }[];
  note?: string;
  bare?: boolean;
  className?: string;
}> = ({ headline, steps, note, bare = false, className = '' }) => (
  <section className={`${shell(bare, 'rounded-2xl border border-[#d7d3fb] dark:border-[#2a1a66] bg-white dark:bg-transparent p-4 sm:p-5')} ${className}`} aria-label="MarketSyde AI checklist">
    {!bare && <Tag />}
    {!bare && <h3 className="text-[17px] sm:text-lg font-bold text-[#0b1c30] dark:text-white leading-snug mt-1.5">{headline}</h3>}
    <ol className="mt-3.5 space-y-2.5">
      {steps.map((s, i) => (
        <li key={s.title} className="flex gap-3">
          <span className="w-6 h-6 rounded-lg bg-[#EEF0FE] dark:bg-white/10 text-[#5945F1] dark:text-[#a99bff] text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
          <span className="min-w-0">
            <span className="block text-[14px] font-semibold text-[#0b1c30] dark:text-white">{s.title}</span>
            <span className="block text-[12.5px] leading-relaxed text-[#474556] dark:text-white/70 mt-0.5">{s.text}</span>
          </span>
        </li>
      ))}
    </ol>
    {note && <p className="flex items-start gap-1.5 text-[12px] text-[#64748b] dark:text-white/60 mt-3"><CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0" />{note}</p>}
  </section>
);

/* ── 6. Metrics: a row of numbers with one line of reading ── */
export const AiMetrics: React.FC<{
  headline: string;
  note: string;
  metrics: { label: string; value: string; tone?: 'good' | 'bad' | 'neutral' }[];
  bare?: boolean;
  className?: string;
}> = ({ headline, note, metrics, bare = false, className = '' }) => (
  <section className={`${shell(bare, 'rounded-2xl border border-[#d7d3fb] dark:border-[#2a1a66] bg-white dark:bg-transparent p-4 sm:p-5')} ${className}`} aria-label="MarketSyde AI metrics">
    <div className="flex flex-wrap items-center justify-between gap-2">
      {!bare && <Tag />}
    </div>
    {!bare && <h3 className="text-[17px] sm:text-lg font-bold text-[#0b1c30] dark:text-white leading-snug mt-1.5">{headline}</h3>}
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4">
      {metrics.map((m) => (
        <div key={m.label} className="rounded-xl bg-[#fbfbff] dark:bg-[#170345] border border-[#e8e5fb] dark:border-[#2a1a66] px-3 py-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#94a3b8] truncate">{m.label}</p>
          <p className={`font-mono text-[15px] font-bold ${m.tone === 'good' ? 'text-emerald-600' : m.tone === 'bad' ? 'text-rose-600' : 'text-[#0b1c30] dark:text-white'}`}>{m.value}</p>
        </div>
      ))}
    </div>
    <p className="text-[13px] leading-relaxed text-[#474556] dark:text-white/70 mt-3">{note}</p>
  </section>
);

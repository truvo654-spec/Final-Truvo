import React from 'react';

/**
 * One pick, in the shape every feature can fill.
 *
 * The signal card earns its own component because entry, stop and target have
 * to be read together. Everything else wants the same three things: what it
 * is, the two or three figures that decide it, and the one thing to do about
 * it. One card for all of them keeps the panel consistent, so a person does
 * not relearn the layout on every page.
 */

export interface PickCardProps {
  /** A flag, logo or letter mark. */
  mark?: React.ReactNode;
  title: string;
  subtitle?: string;
  /** The figures that decide it, at most three. */
  figures?: { label: string; value: string }[];
  /** The number worth shouting, with its name underneath. */
  headline?: { value: string; label: string };
  /** Short notes along the foot: a deadline, a requirement, a caveat. */
  notes?: { text: string; tone?: 'neutral' | 'good' | 'warn' }[];
  action?: { label: string; run: () => void };
  /** A quieter button, for a pick that is not an invitation to act. */
  quiet?: boolean;
}

/** Notes read as quiet chips rather than loose coloured words. */
const TONE_CHIPS = {
  neutral: 'bg-[#f3f4f8] text-[#64748b]',
  good: 'bg-[#eaf7ee] text-[#16803c]',
  warn: 'bg-[#fdf2e3] text-[#b45309]',
} as const;

export const PickCard: React.FC<PickCardProps> = ({
  mark, title, subtitle, figures, headline, notes, action, quiet,
}) => (
  <div className="flex h-full flex-col gap-3 rounded-2xl border border-[#CCC6FB] bg-white p-4 dark:bg-transparent">
    <div className="flex items-start gap-2.5">
      {mark && <span className="shrink-0">{mark}</span>}
      <span className="min-w-0 flex-1">
        <span className="block text-[14px] font-bold leading-snug text-[#0b1c30] dark:text-white">{title}</span>
        {subtitle && (
          <span className="mt-1 block text-[12px] leading-snug text-[#64748b] dark:text-white/55">{subtitle}</span>
        )}
      </span>
      {headline && (
        <span className="shrink-0 text-right leading-none">
          <span className="block font-display text-[19px] font-extrabold text-[#5945F1]">{headline.value}</span>
          <span className="mt-1 block text-[11px] font-semibold text-[#8a7af6]">{headline.label}</span>
        </span>
      )}
    </div>

    {figures && figures.length > 0 && (
      <dl className="space-y-1.5 border-t border-[#eceafb] pt-3">
        {figures.slice(0, 3).map((f) => (
          <div key={f.label} className="flex items-baseline justify-between gap-3">
            <dt className="text-[12.5px] text-[#64748b] dark:text-white/55">{f.label}</dt>
            <dd className="font-display text-[13.5px] font-bold tabular-nums text-[#0b1c30] dark:text-white">
              {f.value}
            </dd>
          </div>
        ))}
      </dl>
    )}

    {notes && notes.length > 0 && (
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {notes.map((n) => (
          <span
            key={n.text}
            className={`rounded-md px-2 py-0.5 text-[11.5px] font-semibold ${TONE_CHIPS[n.tone ?? 'neutral']}`}
          >
            {n.text}
          </span>
        ))}
      </div>
    )}

    {action && (
      <button
        type="button"
        onClick={action.run}
        className={`mt-auto w-full rounded-xl border py-2.5 font-display text-[14px] font-extrabold transition ${
          quiet
            ? 'border-[#CCC6FB] bg-white text-[#5945F1] hover:bg-[#f5f4ff]'
            : 'border-transparent bg-[#5945F1] text-white hover:bg-[#4a38d6]'
        }`}
      >
        {action.label}
      </button>
    )}
  </div>
);

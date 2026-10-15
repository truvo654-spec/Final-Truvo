import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { AiGhost } from '../ai/AiGhost';

/**
 * Paying credits for something a level does not open yet.
 *
 * The person sees what they are buying, what they already have, how long the
 * access lasts and when it ends, then confirms once. Nothing is charged until
 * they press the button, and the flow behind it is whatever the panel used
 * before; only the look is shared.
 */

export interface UnlockDurationChoice {
  id: string;
  /** What the option is called, e.g. "1 day". */
  label: string;
  cost: number;
  /** When the access would end, already worded for a reader. */
  endsAt?: string;
}

export const UnlockStateModal: React.FC<{
  open: boolean;
  /** What is being unlocked. */
  title: string;
  description: string;
  /** The level that opens it for free. */
  minLevel?: number;
  levelLabel: string;
  credits: number;
  durations: UnlockDurationChoice[];
  onClose: () => void;
  onConfirm: (choice: UnlockDurationChoice) => void;
}> = ({ open, title, description, minLevel, levelLabel, credits, durations, onClose, onConfirm }) => {
  const [chosen, setChosen] = useState(durations[0]?.id ?? '');
  const close = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    setChosen(durations[0]?.id ?? '');
    close.current?.focus();
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); onClose(); } };
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', key);
    return () => { document.removeEventListener('keydown', key); document.body.style.overflow = overflow; };
  }, [open, durations, onClose]);

  if (!open) return null;

  const option = durations.find((d) => d.id === chosen) ?? durations[0];
  const short = option ? credits < option.cost : false;

  return (
    <div
      className="fixed inset-0 z-[95] flex items-center justify-center bg-white/50 p-4 backdrop-blur-md"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="unlock-title"
        data-keep-button-icons
        className="relative w-full max-w-[520px] rounded-2xl bg-white p-7 shadow-[0_24px_70px_rgba(11,28,48,0.18)]"
      >
        <button
          ref={close}
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-5 top-5 text-slate-500 transition hover:text-slate-900"
        >
          <X size={20} />
        </button>

        <h2 id="unlock-title" className="flex flex-wrap items-center gap-3 pr-8 font-display text-[22px] font-bold text-[#5945F1]">
          {title}
          {minLevel && (
            <span className="rounded-md bg-[#ece9ff] px-2.5 py-1 text-[13px] font-bold text-[#5945F1]">
              Level {minLevel}
            </span>
          )}
        </h2>
        <p className="mt-2.5 text-[16px] leading-relaxed text-slate-600">{description}</p>

        {/* what the person already has */}
        <div className="mt-5 flex items-center gap-3 rounded-xl bg-[#f1f0fe] px-4 py-3.5">
          <AiGhost className="h-9 w-9 shrink-0 text-[#5945F1]" blink={false} />
          <span className="min-w-0">
            <span className="block text-[13.5px] text-slate-600">Your Tier:</span>
            <b className="block text-[16px] font-bold text-slate-900">{levelLabel}</b>
          </span>
          <span className="ml-auto text-right">
            <span className="block text-[13.5px] text-slate-600">Your credits:</span>
            <b className="block text-[16px] font-bold text-[#5945F1]">{credits.toLocaleString()} Credits</b>
          </span>
        </div>

        {/* how long for */}
        <label className="mt-5 block">
          <span className="text-[16px] font-bold text-slate-900">What duration would you like?</span>
          <span className="relative mt-2 block">
            <select
              value={chosen}
              onChange={(e) => setChosen(e.target.value)}
              className="w-full cursor-pointer appearance-none rounded-xl border border-[#CCC6FB] bg-white py-3 pl-4 pr-10 text-[16px] text-slate-900 outline-none transition hover:border-[#5945F1] focus:border-[#5945F1]"
            >
              {durations.map((d) => (
                <option key={d.id} value={d.id}>{d.label} - {d.cost.toLocaleString()} Credits</option>
              ))}
            </select>
            <svg viewBox="0 0 24 24" className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 fill-none stroke-slate-500" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <path d="M6 9l6 6 6-6" />
            </svg>
          </span>
        </label>

        {option?.endsAt && (
          <p className="mt-4 text-[14px] leading-relaxed text-slate-600">
            Access ends on {option.endsAt} and does not renew automatically.
            {minLevel ? ` Reaching Level ${minLevel} before this date will keep your access active.` : ''}
          </p>
        )}

        <button
          type="button"
          disabled={!option || short}
          onClick={() => option && onConfirm(option)}
          className={`mt-5 w-full rounded-xl py-3.5 text-[17px] font-bold text-white transition ${
            short ? 'cursor-not-allowed bg-[#c7c2f5]' : 'bg-[#5945F1] hover:bg-[#4a38d6] active:scale-[0.99]'
          }`}
        >
          {short ? `You need ${(option!.cost - credits).toLocaleString()} more credits` : 'Confirm and unlock'}
        </button>
      </div>
    </div>
  );
};

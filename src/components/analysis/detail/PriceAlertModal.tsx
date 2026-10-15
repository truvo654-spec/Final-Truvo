import React, { useEffect, useRef, useState } from 'react';
import { Info, Plus, X } from 'lucide-react';

/**
 * Create Price Alert.
 *
 * The person picks a condition and a target, and the app tells them when the
 * instrument gets there. Everything else on the page keeps its state behind
 * the dialog, so cancelling costs nothing.
 */

const CONDITIONS = ['Price Reaches', 'Price Rises Above', 'Price Falls Below', 'Changes By'] as const;

export const PriceAlertModal: React.FC<{
  open: boolean;
  name: string;
  ticker: string;
  price: number;
  /** The round mark the page already draws for this instrument. */
  mark?: React.ReactNode;
  onClose: () => void;
  onCreate: (summary: string) => void;
}> = ({ open, name, ticker, price, mark, onClose, onCreate }) => {
  const [condition, setCondition] = useState<string>(CONDITIONS[0]);
  const [target, setTarget] = useState(() => price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  const [advanced, setAdvanced] = useState(false);
  const [onlyOnce, setOnlyOnce] = useState(true);
  const [channel, setChannel] = useState<'App' | 'Email' | 'Both'>('App');
  const first = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    setTarget(price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
    first.current?.focus();
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); onClose(); } };
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', key);
    return () => { document.removeEventListener('keydown', key); document.body.style.overflow = overflow; };
  }, [open, price, onClose]);

  if (!open) return null;

  const money = (v: number) => `$${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div
      className="fixed inset-0 z-[95] flex items-center justify-center bg-white/50 p-4 backdrop-blur-md"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="price-alert-title"
        data-keep-button-icons
        className="relative w-full max-w-[560px] rounded-2xl bg-white p-7 shadow-[0_24px_70px_rgba(11,28,48,0.18)]"
      >
        <button
          ref={first}
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-5 top-5 text-slate-400 transition hover:text-slate-700"
        >
          <X size={20} />
        </button>

        <h2 id="price-alert-title" className="font-display text-[22px] font-bold text-[#5945F1]">Create Price Alert</h2>
        <p className="mt-1.5 text-[15px] text-slate-500">Pick a target. We&rsquo;ll tell you when {name} reaches it.</p>

        {/* what the alert watches */}
        <div className="mt-5 flex items-center gap-3 rounded-xl bg-[#f5f4ff] px-4 py-3.5">
          {mark ?? (
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#f7931a] text-[15px] font-bold text-white" aria-hidden>
              ₿
            </span>
          )}
          <b className="text-[16px] font-bold text-slate-900">{name}</b>
          <span className="text-[14px] text-slate-500">{ticker}</span>
          <b className="ml-auto text-[16px] font-bold text-slate-900">{money(price)}</b>
        </div>

        {/* when it should fire */}
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="text-[14px] font-medium text-slate-700">Condition</span>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="w-full cursor-pointer rounded-xl border border-[#CCC6FB] bg-white px-3.5 py-2.5 text-[15px] text-slate-900 outline-none transition hover:border-[#5945F1] focus:border-[#5945F1]"
            >
              {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[14px] font-medium text-slate-700">Target Price</span>
            <span className="flex items-center gap-2 rounded-xl border border-[#CCC6FB] bg-white px-3.5 py-2.5 focus-within:border-[#5945F1]">
              <input
                value={target}
                onChange={(e) => setTarget(e.target.value.replace(/[^\d.,]/g, ''))}
                inputMode="decimal"
                aria-label="Target price"
                className="w-full min-w-0 bg-transparent text-[15px] text-slate-900 outline-none placeholder:text-slate-400"
              />
              <span className="shrink-0 text-[15px] text-slate-500">$</span>
            </span>
          </label>
        </div>

        <p className="mt-4 flex items-center gap-2 rounded-xl bg-[#f1f0fe] px-4 py-3 text-[14px] text-slate-700">
          <Info size={16} className="shrink-0 text-[#5945F1]" aria-hidden />
          Notify me when <b className="font-bold text-[#5945F1]">{name}</b> {condition.toLowerCase()} my target.
        </p>

        {/* the rest, for people who want it */}
        <div className="mt-4 rounded-xl border border-[#CCC6FB]">
          <button
            type="button"
            onClick={() => setAdvanced((v) => !v)}
            aria-expanded={advanced}
            className="flex w-full items-center justify-between px-4 py-3.5 text-left text-[15px] text-slate-900"
          >
            {advanced ? 'Hide Advanced Filters' : 'Show Advanced Filters'}
            <Plus size={18} className={`text-[#5945F1] transition-transform ${advanced ? 'rotate-45' : ''}`} aria-hidden />
          </button>
          {advanced && (
            <div className="space-y-3 border-t border-[#CCC6FB] px-4 py-3.5">
              <label className="flex items-center justify-between gap-3 text-[14px] text-slate-700">
                Tell me once, then stop
                <input type="checkbox" checked={onlyOnce} onChange={(e) => setOnlyOnce(e.target.checked)} className="size-4 accent-[#5945F1]" />
              </label>
              <label className="flex items-center justify-between gap-3 text-[14px] text-slate-700">
                Where to tell me
                <select
                  value={channel}
                  onChange={(e) => setChannel(e.target.value as 'App' | 'Email' | 'Both')}
                  className="cursor-pointer rounded-lg border border-[#CCC6FB] px-2.5 py-1.5 text-[14px] outline-none"
                >
                  <option>App</option>
                  <option>Email</option>
                  <option>Both</option>
                </select>
              </label>
            </div>
          )}
        </div>

        <p className="mt-4 text-[13.5px] leading-relaxed text-slate-500">
          Alerts use our available market snapshot and can be paused or removed later.
        </p>

        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[#CCC6FB] px-5 py-2.5 text-[15px] font-bold text-[#5945F1] transition hover:bg-[#f7f6ff]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              const value = Number(target.replace(/,/g, '')) || price;
              onCreate(`${name} ${condition.toLowerCase()} ${money(value)}`);
              onClose();
            }}
            className="rounded-xl bg-[#5945F1] px-5 py-2.5 text-[15px] font-bold text-white transition hover:bg-[#4a38d6] active:scale-[0.99]"
          >
            Create Alert
          </button>
        </div>
      </div>
    </div>
  );
};

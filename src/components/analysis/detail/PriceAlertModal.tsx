import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, Info, Plus, X } from 'lucide-react';

/**
 * Create Price Alert.
 *
 * The person picks a condition and a target, and the app tells them when the
 * instrument gets there. Everything else on the page keeps its state behind
 * the dialog, so cancelling costs nothing.
 */

const CONDITIONS = [
  'Price Reaches', 'Price Rises Above', 'Price Drops Below',
  'Price Crosses Above', 'Price Crosses Below',
  'Change is Above', 'Change is Below', 'Price Enters a Range',
] as const;

/** Only a crossing is measured against an indicator; the rest take a price. */
const CROSSING = ['Price Crosses Above', 'Price Crosses Below'];
const INDICATORS = ['Moving Average (MA)', 'Bollinger Bands', 'MACD', 'Ichimoku Cloud'] as const;
const FREQUENCIES = ['Once', 'Every Crossing', 'Every 30 Minutes', 'Daily Summary'] as const;
const EXPIRIES = ['24 Hours', '7 Days', '30 Days', 'Never'] as const;
const CHANNELS = ['Push Notification', 'In-App Inbox', 'Email'] as const;

/** An alert that already exists for this instrument. */
export interface SavedAlert {
  condition: string;
  target: string;
  indicator: string;
  period: string;
  deviation: string;
  frequency: string;
  expiry: string;
  channel: string;
}

export const PriceAlertModal: React.FC<{
  open: boolean;
  name: string;
  ticker: string;
  price: number;
  /** The round mark the page already draws for this instrument. */
  mark?: React.ReactNode;
  /** When set, the dialog opens on the alert that is already running. */
  existing?: SavedAlert | null;
  onClose: () => void;
  onCreate: (alert: SavedAlert) => void;
  onDelete?: () => void;
}> = ({ open, name, ticker, price, mark, existing, onClose, onCreate, onDelete }) => {
  const [condition, setCondition] = useState<string>(CONDITIONS[0]);
  const [target, setTarget] = useState(() => price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  const [indicator, setIndicator] = useState<string>(INDICATORS[0]);
  const byIndicator = CROSSING.includes(condition);
  const [lookback, setLookback] = useState('20');
  const [deviation, setDeviation] = useState('2');
  const [advanced, setAdvanced] = useState(false);
  const [frequency, setFrequency] = useState<string>(FREQUENCIES[0]);
  const [expiry, setExpiry] = useState<string>(EXPIRIES[1]);
  const [channel, setChannel] = useState<string>(CHANNELS[0]);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const first = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    setConfirmDelete(false);
    if (existing) {
      setCondition(existing.condition);
      setTarget(existing.target);
      setIndicator(existing.indicator);
      setLookback(existing.period);
      setDeviation(existing.deviation);
      setFrequency(existing.frequency);
      setExpiry(existing.expiry);
      setChannel(existing.channel);
      setAdvanced(true);
    } else {
      setCondition(CONDITIONS[0]);
      setIndicator(INDICATORS[0]);
      setAdvanced(false);
      setTarget(price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
    }
    first.current?.focus();
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); onClose(); } };
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', key);
    return () => { document.removeEventListener('keydown', key); document.body.style.overflow = overflow; };
    // Only when the dialog opens: the parent hands us new callbacks on every
    // render, and re-running this would reset what the person is doing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

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

        <h2 id="price-alert-title" className="font-display text-[22px] font-bold text-[#5945F1]">{existing ? 'Price Alert' : 'Create Price Alert'}</h2>
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
            <span className="relative block">
            <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" aria-hidden />
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="w-full cursor-pointer appearance-none rounded-xl border border-[#CCC6FB] bg-white py-2.5 pl-3.5 pr-9 text-[15px] text-slate-900 outline-none transition hover:border-[#5945F1] focus:border-[#5945F1]"
            >
              {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            </span>
          </label>

          {byIndicator && (
          <label className="flex flex-col gap-1.5">
            <span className="text-[14px] font-medium text-slate-700">Indicator</span>
            <span className="relative block">
            <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" aria-hidden />
            <select
              value={indicator}
              onChange={(e) => setIndicator(e.target.value)}
              className="w-full cursor-pointer appearance-none rounded-xl border border-[#CCC6FB] bg-white py-2.5 pl-3.5 pr-9 text-[15px] text-slate-900 outline-none transition hover:border-[#5945F1] focus:border-[#5945F1]"
            >
              {INDICATORS.map((i) => <option key={i} value={i}>{i}</option>)}
            </select>
            </span>
          </label>
          )}

          {!byIndicator ? (
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
          ) : (
            <>
              <label className="flex flex-col gap-1.5">
                <span className="text-[14px] font-medium text-slate-700">Period</span>
                <input
                  value={lookback}
                  onChange={(e) => setLookback(e.target.value.replace(/\D/g, ''))}
                  inputMode="numeric"
                  className="w-full rounded-xl border border-[#CCC6FB] px-3.5 py-2.5 text-[15px] text-slate-900 outline-none focus:border-[#5945F1]"
                />
              </label>
              {indicator === 'Bollinger Bands' && (
              <label className="flex flex-col gap-1.5">
                <span className="text-[14px] font-medium text-slate-700">Standard Deviation (SD)</span>
                <input
                  value={deviation}
                  onChange={(e) => setDeviation(e.target.value.replace(/[^\d.]/g, ''))}
                  inputMode="decimal"
                  className="w-full rounded-xl border border-[#CCC6FB] px-3.5 py-2.5 text-[15px] text-slate-900 outline-none focus:border-[#5945F1]"
                />
              </label>
              )}
            </>
          )}
        </div>

        {byIndicator && (
          <p className="mt-3 text-[13.5px] leading-relaxed text-slate-500">
            {indicator === 'Bollinger Bands'
              ? `Set the lookback period and the number of standard deviations used for the ${indicator}.`
              : 'Set the indicator parameters used to evaluate the crossing.'}
          </p>
        )}

        <p className="mt-4 flex items-center gap-2 rounded-xl bg-[#f1f0fe] px-4 py-3 text-[14px] text-slate-700">
          <Info size={16} className="shrink-0 text-[#5945F1]" aria-hidden />
          <span className="text-[#5945F1]">
            Notify me when <b className="font-bold">{name}</b> {condition.toLowerCase()}{' '}
            {!byIndicator
              ? 'my target.'
              : indicator === 'Bollinger Bands'
                ? `the ${indicator} (${lookback} Period) (${deviation} Standard Deviation).`
                : `the ${indicator} (${lookback} Period).`}
          </span>
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
            <div className="grid gap-4 border-t border-[#CCC6FB] px-4 py-4 sm:grid-cols-2">
              {([
                ['Frequency', frequency, setFrequency, FREQUENCIES],
                ['Expiration', expiry, setExpiry, EXPIRIES],
                ['Notification', channel, setChannel, CHANNELS],
              ] as const).map(([label, value, set, list]) => (
                <label key={label} className="flex flex-col gap-1.5">
                  <span className="text-[14px] font-medium text-slate-700">{label}</span>
                  <span className="relative block">
                  <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" aria-hidden />
                  <select
                    value={value}
                    onChange={(e) => (set as (v: string) => void)(e.target.value)}
                    className="w-full cursor-pointer appearance-none rounded-xl border border-[#CCC6FB] bg-white py-2.5 pl-3.5 pr-9 text-[15px] text-slate-900 outline-none transition hover:border-[#5945F1] focus:border-[#5945F1]"
                  >
                    {list.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        <p className="mt-4 text-[13.5px] leading-relaxed text-slate-500">
          Alerts use our available market snapshot and can be paused or removed later.
        </p>

        <div className="mt-5 flex items-center justify-between gap-3">
          {existing ? (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="rounded-xl bg-[#fee2e2] px-5 py-2.5 text-[15px] font-bold text-[#dc2626] transition hover:bg-[#fecaca]"
            >
              Delete
            </button>
          ) : <span />}

          <span className="flex gap-3">
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
                onCreate({ condition, target, indicator, period: lookback, deviation, frequency, expiry, channel });
                onClose();
              }}
              className="rounded-xl bg-[#5945F1] px-5 py-2.5 text-[15px] font-bold text-white transition hover:bg-[#4a38d6] active:scale-[0.99]"
            >
              {existing ? 'Edit Alert' : 'Create Alert'}
            </button>
          </span>
        </div>

        {/* the one step that cannot be taken back */}
        {confirmDelete && (
          <div
            className="fixed inset-0 z-[97] flex items-center justify-center bg-white/50 p-4 backdrop-blur-md"
            onClick={(e) => { if (e.target === e.currentTarget) setConfirmDelete(false); }}
          >
            <div role="alertdialog" aria-modal="true" className="relative w-full max-w-[420px] rounded-2xl bg-white p-6 shadow-[0_24px_70px_rgba(11,28,48,0.18)]">
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                aria-label="Close"
                className="absolute right-4 top-4 text-slate-500 transition hover:text-slate-900"
              >
                <X size={18} />
              </button>
              <h3 className="font-display text-[20px] font-bold text-slate-900">Delete This Alert?</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-slate-600">
                You&rsquo;ll stop getting notifications for this asset. This can&rsquo;t be undone.
              </p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="rounded-xl border border-[#CCC6FB] py-2.5 text-[15px] font-bold text-[#5945F1] transition hover:bg-[#f7f6ff]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => { setConfirmDelete(false); onDelete?.(); onClose(); }}
                  className="rounded-xl bg-[#fee2e2] py-2.5 text-[15px] font-bold text-[#dc2626] transition hover:bg-[#fecaca]"
                >
                  Delete Alert
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

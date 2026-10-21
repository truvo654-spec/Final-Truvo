import React from 'react';
import { Clock, Hourglass } from 'lucide-react';
import { CurrencyPairFlags, currencyPair } from '../common/CurrencyFlag';
import { InstrumentIcon } from '../analysis/InstrumentIcon';

/**
 * One signal, as the signals page draws it.
 *
 * The AI panel used to summarise a call in a line of text, which left out the
 * three numbers that decide whether it is worth taking. Entry, stop and target
 * are a set: take the entry and invent your own stop and the arithmetic is no
 * longer the one on the card, so they are shown together or not at all.
 */

export interface SignalPick {
  ticker: string;
  direction: 'BUY' | 'SELL';
  entry?: string | number;
  stop?: string | number;
  target?: string | number;
  confidence?: number;
  riskReward?: string;
  timeframe?: string;
  validFor?: string;
}

const money = (v: string | number | undefined) =>
  v === undefined || v === '' ? '—' : typeof v === 'number' ? v.toFixed(3) : v;

export const SignalPickCard: React.FC<{ signal: SignalPick; onTrade?: () => void }> = ({ signal, onTrade }) => {
  const pair = currencyPair(signal.ticker);
  const sell = signal.direction === 'SELL';

  return (
    <div className="rounded-2xl border border-[#CCC6FB] bg-white p-3.5 dark:bg-transparent">
      <div className="flex items-center gap-2.5">
        {pair
          ? <CurrencyPairFlags pair={pair} className="h-8 w-8" />
          : <InstrumentIcon iconType={signal.ticker} name={signal.ticker} className="h-8 w-8" />}
        <span className="font-display text-[17px] font-extrabold tracking-tight text-[#0b1c30] dark:text-white">
          {signal.ticker}
        </span>
      </div>

      <div className="mt-3 flex items-start gap-3">
        <dl className="min-w-0 flex-1 space-y-1">
          {([['Target', signal.target], ['Entry', signal.entry], ['Stop', signal.stop]] as const).map(([label, value]) => (
            <div key={label} className="flex items-baseline justify-between gap-3">
              <dt className="text-[13px] text-[#64748b] dark:text-white/60">{label}</dt>
              <dd className="font-display text-[15px] font-bold tabular-nums text-[#0b1c30] dark:text-white">
                {money(value)}
              </dd>
            </div>
          ))}
        </dl>

        {signal.confidence !== undefined && (
          <div className="shrink-0 text-right">
            <span className="block font-display text-[26px] font-extrabold leading-none text-[#5945F1]">
              {signal.confidence}%
            </span>
            <span className="block text-[12px] font-bold text-[#5945F1]">Confidence</span>
          </div>
        )}
      </div>

      {signal.riskReward && (
        <div className="mt-2.5 flex items-baseline justify-between gap-3">
          <span className="text-[13px] text-[#64748b] dark:text-white/60">Risk/Reward</span>
          <span className="font-display text-[14px] font-bold text-[#0b1c30] dark:text-white">{signal.riskReward}</span>
        </div>
      )}

      {(signal.timeframe || signal.validFor) && (
        <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-[#CCC6FB] pt-2.5">
          {signal.timeframe && (
            <span className="inline-flex items-center gap-1.5 text-[12.5px] font-bold text-[#5945F1]">
              <Clock className="h-3.5 w-3.5" aria-hidden />
              {signal.timeframe} period
            </span>
          )}
          {signal.validFor && (
            <span className="inline-flex items-center gap-1.5 text-[12.5px] font-bold text-[#16a34a]">
              <Hourglass className="h-3.5 w-3.5" aria-hidden />
              valid for {signal.validFor}
            </span>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={onTrade}
        className={`mt-3 w-full rounded-xl border py-2.5 font-display text-[15px] font-extrabold transition ${
          sell
            ? 'border-[#CCC6FB] text-[#5945F1] hover:bg-[#f5f4ff]'
            : 'border-transparent bg-[#5945F1] text-white hover:bg-[#4a38d6]'
        }`}
      >
        {sell ? 'Sell' : 'Buy'}
      </button>
    </div>
  );
};

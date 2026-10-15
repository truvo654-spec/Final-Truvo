import { JournalHelp } from '../journal/JournalHelp';
import React, { useMemo } from 'react';
import type { JournalEntry } from '../../types';
import { currencyOf, eligible, metrics } from '../journal/journalMath';
import { money, pct, rr } from '../../backtest/format';
import { btnSecondary } from './ui';

interface Props {
  entries: JournalEntry[];
  onClear?: () => void;
}

export const JournalTradeBenchmark: React.FC<Props> = ({ entries, onClear }) => {
  const summaries = useMemo(() => {
    const byCurrency = new Map<string, JournalEntry[]>();
    entries.filter(eligible).forEach((entry) => {
      const currency = currencyOf(entry);
      byCurrency.set(currency, [...(byCurrency.get(currency) ?? []), entry]);
    });
    return Array.from(byCurrency, ([currency, trades]) => ({ currency, stats: metrics(trades) }));
  }, [entries]);
  const count = summaries.reduce((sum, group) => sum + group.stats.n, 0);
  const wins = summaries.reduce((sum, group) => sum + group.stats.wins, 0);
  const rCount = summaries.reduce((sum, group) => sum + group.stats.rCount, 0);
  const avgR = rCount
    ? summaries.reduce((sum, group) => sum + (group.stats.avgR ?? 0) * group.stats.rCount, 0) / rCount
    : null;

  return (
    <section className="rounded-2xl border border-[#5338ec]/25 bg-[#F8F7FF] p-4 sm:p-5" aria-label="Imported journal trade benchmark">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-[#0b1c30]">Imported actual-trade benchmark · {entries.length} selected<JournalHelp label="Trade history setup" /></h3>
          <p className="mt-1 text-xs text-[#474556]">
            Imported trades are the actual-results benchmark, not inferred rules. Backtest uses the selected playbook hypothesis and executable recipe (or a labeled starter set); choose other playbooks below to compare setups.
          </p>
        </div>
        {onClear && <button type="button" className={btnSecondary} onClick={onClear}>Remove benchmark</button>}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
        <div className="rounded-lg bg-white px-3 py-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Known closed results</p>
          <p className="mt-1 font-bold tabular-nums text-[#0b1c30]">{count} / {entries.length} trades</p>
        </div>
        <div className="rounded-lg bg-white px-3 py-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Actual net P&amp;L</p>
          <p className="mt-1 font-bold tabular-nums text-[#0b1c30]">
            {summaries.length ? summaries.map(({ currency, stats }) => money(stats.total, currency, 0)).join(' · ') : '—'}
          </p>
        </div>
        <div className="rounded-lg bg-white px-3 py-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Win rate<JournalHelp label="Win rate" /></p>
          <p className="mt-1 font-bold tabular-nums text-[#0b1c30]">{count ? pct(wins / count, 0) : '—'}</p>
        </div>
        <div className="rounded-lg bg-white px-3 py-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Realized average R</p>
          <p className="mt-1 font-bold tabular-nums text-[#0b1c30]">{avgR === null ? '—' : rr(avgR)}</p>
        </div>
      </div>
      <p className="mt-2 text-[10px] text-slate-500">Only closed trades with known net results count toward benchmark metrics. This historical sample is a reference, not a like-for-like forecast.</p>
    </section>
  );
};

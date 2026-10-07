import React from 'react';
import { JournalChecklistItem, JournalEntry } from '../../types';
import { PORTFOLIO_TRADES } from '../../data/portfolioData';
import { LogKind, buildTradeLog, logToText } from './tradeLogData';

const DOT: Record<string, string> = { neutral: 'bg-slate-400', good: 'bg-emerald-500', bad: 'bg-rose-500', brand: 'bg-[#5338ec]' };
const STAT_TONE: Record<string, string> = { neutral: 'text-[#0b1c30]', good: 'text-emerald-600', bad: 'text-rose-600' };
const KIND_LABEL: Record<LogKind, string> = { before: 'Plan', open: 'Open', close: 'Close', after: 'Review', journal: 'Journal' };

/** What happened in this trade, from the plan to the close to the write-up. */
export const TradeLogSection: React.FC<{ entry: JournalEntry; checklist: JournalChecklistItem[]; onShowToast: (msg: string) => void }> = ({ entry, checklist, onShowToast }) => {
  const linked = entry.linkedTradeId ? PORTFOLIO_TRADES.find((t) => t.id === entry.linkedTradeId) : undefined;
  const log = buildTradeLog(entry, linked, checklist);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(logToText(entry, log));
      onShowToast('Trade log copied');
    } catch {
      onShowToast('Could not copy here');
    }
  };

  return (
    <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5" aria-label="Trade log">
      <div className="flex items-center justify-between gap-3 mb-3">
        <p className="text-xs font-bold uppercase tracking-wide text-[#474556]">Trade log</p>
        <button type="button" onClick={copy} className="text-xs font-semibold text-[#5338ec] hover:text-[#4326d8] hover:underline">Copy log</button>
      </div>

      {log.stats.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
          {log.stats.slice(0, 4).map((s) => (
            <div key={s.label} className="bg-slate-50 rounded-xl px-3 py-2.5">
              <p className="text-[11px] text-[#474556]">{s.label}</p>
              <p className={`text-sm font-bold font-mono ${STAT_TONE[s.tone]}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      <ol className="relative">
        {log.events.map((e, i) => (
          <li key={e.id} className="relative pl-7 pb-5 last:pb-0">
            {i < log.events.length - 1 && <span className="absolute left-[5px] top-3 bottom-0 w-px bg-[#e2e8f0]" aria-hidden />}
            <span className={`absolute left-0 top-1.5 w-[11px] h-[11px] rounded-full ring-4 ring-white ${DOT[e.tone]}`} aria-hidden />
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wide text-[#5338ec] bg-[#EEF0FE] px-1.5 py-0.5 rounded">{KIND_LABEL[e.kind]}</span>
              <p className="text-sm font-bold text-[#0b1c30]">{e.title}</p>
            </div>
            <p className="text-[11px] font-mono text-[#6b7686] mt-0.5">{e.when} · {e.source}</p>
            {e.detail && <p className="text-xs leading-relaxed text-[#474556] mt-1">{e.detail}</p>}
            {e.id === 'open' && log.held && (
              <p className="inline-flex mt-2.5 text-[11px] font-semibold text-[#474556] bg-slate-100 rounded-full px-2.5 py-1">Held for {log.held}</p>
            )}
          </li>
        ))}
      </ol>

      {log.notes.length > 0 && (
        <div className="mt-4 space-y-1.5">
          {log.notes.map((n) => <p key={n} className="text-[11px] text-[#6b7686] bg-slate-50 rounded-lg px-3 py-2">{n}</p>)}
        </div>
      )}
    </div>
  );
};

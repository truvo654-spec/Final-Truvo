import React, { useMemo, useState } from 'react';
import { BacktestResult, ExitReason, Trade } from './engine/types';
import { dateTime, money, signedMoney } from './format';
import { SelectBox } from './ui';

type SortKey = 'id' | 'entryTime' | 'pnl' | 'pnlPct' | 'r' | 'pips' | 'bars';
const REASON_LABEL: Record<ExitReason, string> = { stop: 'Stop loss', target: 'Take profit', trailing: 'Trailing stop', time: 'Time limit', opposite: 'Opposite signal', rule: 'Exit rule', end: 'End of test' };
const PAGE = 20;

export const tradesToCsv = (r: BacktestResult): string => {
  const head = ['#', 'Direction', 'Entry time', 'Exit time', 'Entry price', 'Exit price', 'Lots', 'Pips', 'P&L (USD)', 'P&L (% of balance)', 'R', 'Candles held', 'Exit reason'];
  const rows = r.trades.map((t) => [t.id, t.dir === 1 ? 'Long' : 'Short', new Date(t.entryTime).toISOString(), new Date(t.exitTime).toISOString(), t.entryPrice.toFixed(5), t.exitPrice.toFixed(5), t.lots, t.pips.toFixed(1), t.pnl.toFixed(2), t.pnlPct.toFixed(3), t.r === null ? '' : t.r.toFixed(2), t.bars, REASON_LABEL[t.reason]]);
  return [head, ...rows].map((row) => row.join(',')).join('\n');
};

export const TradesTab: React.FC<{ result: BacktestResult; onReplay: (t: Trade) => void; onCopyCsv: () => void; onDownloadCsv: () => void }> = ({ result: r, onReplay, onCopyCsv, onDownloadCsv }) => {
  const [dir, setDir] = useState<'all' | 'long' | 'short'>('all');
  const [res, setRes] = useState<'all' | 'win' | 'loss'>('all');
  const [reason, setReason] = useState<'all' | ExitReason>('all');
  const [sort, setSort] = useState<{ key: SortKey; asc: boolean }>({ key: 'id', asc: true });
  const [page, setPage] = useState(0);
  const dec = r.strategy.instrument === 'USDJPY' ? 3 : r.strategy.instrument === 'BTCUSD' || r.strategy.instrument === 'US500' ? 1 : r.strategy.instrument === 'XAUUSD' ? 2 : 5;

  const rows = useMemo(() => {
    const list = r.trades.filter((t) => (dir === 'all' || (dir === 'long' ? t.dir === 1 : t.dir === -1)) && (res === 'all' || (res === 'win' ? t.pnl > 0 : t.pnl <= 0)) && (reason === 'all' || t.reason === reason));
    const val = (t: Trade) => (sort.key === 'r' ? t.r ?? -Infinity : sort.key === 'entryTime' ? t.entryTime : (t[sort.key] as number));
    return [...list].sort((a, b) => (val(a) - val(b)) * (sort.asc ? 1 : -1));
  }, [r.trades, dir, res, reason, sort]);

  const pages = Math.max(1, Math.ceil(rows.length / PAGE));
  const cur = Math.min(page, pages - 1);
  const shown = rows.slice(cur * PAGE, cur * PAGE + PAGE);
  const total = rows.reduce((a, t) => a + t.pnl, 0);
  const head = (key: SortKey, label: string, right = true) => (
    <th className={`px-3 py-2.5 font-bold ${right ? 'text-right' : 'text-left'}`} aria-sort={sort.key === key ? (sort.asc ? 'ascending' : 'descending') : 'none'}>
      <button type="button" onClick={() => { setSort((s) => (s.key === key ? { key, asc: !s.asc } : { key, asc: true })); setPage(0); }} className="hover:text-[#5338ec] transition-colors">
        {label}{sort.key === key ? (sort.asc ? ' ▲' : ' ▼') : ''}
      </button>
    </th>
  );

  return (
    <div className="space-y-3">
      <div className="bg-white border border-[#e2e8f0] rounded-2xl p-4 flex flex-wrap items-end gap-3">
        <div className="w-36"><span className="block text-[11px] font-bold uppercase tracking-wide text-[#6b7686] mb-1">Side</span><SelectBox value={dir} onChange={(v) => { setDir(v); setPage(0); }} ariaLabel="Filter by side" options={[{ value: 'all', label: 'All' }, { value: 'long', label: 'Long' }, { value: 'short', label: 'Short' }]} /></div>
        <div className="w-36"><span className="block text-[11px] font-bold uppercase tracking-wide text-[#6b7686] mb-1">Result</span><SelectBox value={res} onChange={(v) => { setRes(v); setPage(0); }} ariaLabel="Filter by result" options={[{ value: 'all', label: 'All' }, { value: 'win', label: 'Winners' }, { value: 'loss', label: 'Losers' }]} /></div>
        <div className="w-44"><span className="block text-[11px] font-bold uppercase tracking-wide text-[#6b7686] mb-1">Ended by</span><SelectBox<'all' | ExitReason> value={reason} onChange={(v) => { setReason(v); setPage(0); }} ariaLabel="Filter by exit reason" options={[{ value: 'all', label: 'Any reason' }, ...(Object.keys(REASON_LABEL) as ExitReason[]).map((k) => ({ value: k, label: REASON_LABEL[k] }))]} /></div>
        <div className="ml-auto flex gap-2">
          <button type="button" onClick={onCopyCsv} className="px-3.5 py-2 rounded-lg border border-slate-200 text-xs font-bold hover:border-[#5338ec] hover:text-[#5338ec] transition-colors">Copy as CSV</button>
          <button type="button" onClick={onDownloadCsv} className="px-3.5 py-2 rounded-lg bg-[#5338ec] hover:bg-[#4326d8] text-white text-xs font-bold transition-colors">Download CSV</button>
        </div>
      </div>

      <div className="bg-white border border-[#e2e8f0] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs min-w-[860px]">
            <thead className="bg-slate-50 text-[#6b7686] uppercase tracking-wide text-[10px]">
              <tr>
                {head('id', '#', false)}
                <th className="px-3 py-2.5 text-left font-bold">Side</th>
                {head('entryTime', 'Entered', false)}
                <th className="px-3 py-2.5 text-left font-bold">Exited</th>
                <th className="px-3 py-2.5 text-right font-bold">Entry → exit</th>
                <th className="px-3 py-2.5 text-right font-bold">Lots</th>
                {head('pips', 'Pips')}
                {head('pnl', 'P&L')}
                {head('pnlPct', '%')}
                {head('r', 'R')}
                {head('bars', 'Candles')}
                <th className="px-3 py-2.5 text-left font-bold">Ended by</th>
                <th className="px-3 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9]">
              {shown.map((t) => (
                <tr key={t.id} className="hover:bg-[#fafbfe]">
                  <td className="px-3 py-2 font-mono text-[#6b7686]">{t.id}</td>
                  <td className="px-3 py-2"><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${t.dir === 1 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>{t.dir === 1 ? 'Long' : 'Short'}</span></td>
                  <td className="px-3 py-2 whitespace-nowrap text-[#0b1c30]">{dateTime(t.entryTime)}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-[#0b1c30]">{dateTime(t.exitTime)}</td>
                  <td className="px-3 py-2 text-right font-mono whitespace-nowrap text-[#0b1c30]">{t.entryPrice.toFixed(dec)} → {t.exitPrice.toFixed(dec)}</td>
                  <td className="px-3 py-2 text-right font-mono text-[#0b1c30]">{t.lots.toFixed(2)}</td>
                  <td className={`px-3 py-2 text-right font-mono ${t.pips >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{t.pips.toFixed(1)}</td>
                  <td className={`px-3 py-2 text-right font-mono font-bold ${t.pnl >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{signedMoney(t.pnl, 2)}</td>
                  <td className={`px-3 py-2 text-right font-mono ${t.pnlPct >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{t.pnlPct.toFixed(2)}%</td>
                  <td className="px-3 py-2 text-right font-mono text-[#0b1c30]">{t.r === null ? '–' : t.r.toFixed(2)}</td>
                  <td className="px-3 py-2 text-right font-mono text-[#0b1c30]">{t.bars}</td>
                  <td className="px-3 py-2 text-[#474556] whitespace-nowrap">{REASON_LABEL[t.reason]}</td>
                  <td className="px-3 py-2 text-right"><button type="button" onClick={() => onReplay(t)} className="text-[11px] font-bold text-[#5338ec] hover:underline whitespace-nowrap">Watch on chart</button></td>
                </tr>
              ))}
              {shown.length === 0 && <tr><td colSpan={13} className="px-3 py-10 text-center text-[#6b7686]">No trades match these filters.</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-[#f1f5f9] text-xs text-[#474556]">
          <span>{rows.length} trades · total <b className={total >= 0 ? 'text-emerald-600' : 'text-rose-600'}>{signedMoney(total, 2)}</b> · starting balance {money(r.strategy.capital)}</span>
          <div className="flex items-center gap-2">
            <button type="button" disabled={cur === 0} onClick={() => setPage(cur - 1)} className="px-3 py-1.5 rounded-lg border border-slate-200 font-bold disabled:opacity-40 hover:border-[#5338ec]">Previous</button>
            <span className="font-mono">{cur + 1} / {pages}</span>
            <button type="button" disabled={cur >= pages - 1} onClick={() => setPage(cur + 1)} className="px-3 py-1.5 rounded-lg border border-slate-200 font-bold disabled:opacity-40 hover:border-[#5338ec]">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useLayoutEffect, useRef } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, PlayCircle, X } from 'lucide-react';
import { JournalEntry } from '../../types';
import { daySummary } from './journalDay';
import { addDays, UNASSIGNED } from './journalOverview';
import { eligible, incompleteFields, netOf, netRoiOf, realizedR, statusOf, timestampMs } from './journalMath';
import { DisciplineCard, JournalRules, RulesMonitor } from './JournalMonitors';
import { formatMoney } from './JournalCurrency';
import { ReviewStateBadge, reviewStateOf, TradingStatusBadge } from './tradingStatus';
import { useDialogFocus } from './useDialogFocus';

interface Props {
  date: string; entries: JournalEntry[]; currency: string; from: string; to: string;
  note: string; onNote: (value: string) => void; onDay: (date: string) => void; onClose: () => void;
  onTrade: (id: string) => void; onEditRules: () => void; brokerName: (id: string) => string;
  onReplay?: (id: string) => void;
  checklistLength: number; playbookNames: string[]; rules: JournalRules;
  suspended?: boolean;
}
export function JournalDayReview({ date, entries, currency, from, to, note, onNote, onDay, onClose, onTrade, onReplay, onEditRules, brokerName, checklistLength, playbookNames, rules, suspended = false }: Props) {
  const ref = useDialogFocus(onClose);
  const lastFocus = useRef<HTMLElement | null>(null);
  const wasSuspended = useRef(suspended);
  useLayoutEffect(() => {
    if (wasSuspended.current && !suspended) (lastFocus.current?.isConnected ? lastFocus.current : ref.current)?.focus({ preventScroll: true });
    wasSuspended.current = suspended;
  }, [suspended]);
  const summary = daySummary(entries), m = summary.net, g = summary.gross;
  const money = (n: number) => formatMoney(n, currency);
  const reviews = entries.filter(e => reviewStateOf(e) === 'complete').length;
  const linked = entries.filter(e => playbookNames.includes(e.strategy)).length;
  const stops = entries.filter(e => e.riskHistory?.length ? Number.isFinite(e.riskHistory[0].stop) : false).length;
  const currentStops = entries.filter(e => Number.isFinite(e.stopPrice)).length;
  const timesKnown = entries.every(e => Number.isFinite(timestampMs(e.entryTime)));
  const ordered = [...entries].sort((a,b) => timesKnown ? timestampMs(a.entryTime) - timestampMs(b.entryTime) || a.id.localeCompare(b.id) : a.id.localeCompare(b.id));
  const min = Math.min(0, ...summary.curve.map(p => p.value)), max = Math.max(0, ...summary.curve.map(p => p.value));
  const x = (i: number) => 70 + (i + 1) / Math.max(1, summary.curve.length) * 405;
  const y = (n: number) => 140 - (n - min) / (max - min || 1) * 110;
  const cards = [
    ['Net trading P&L', m.n ? money(m.total) : '—', `${m.n} closed trades with known costs`],
    ['Gross trading P&L', g.n ? money(g.total) : '—', `${g.n} closed trades with known P&L`],
    ['Known closed costs', m.n ? money(m.fees) : '—', `Same ${m.n} trades as net P&L`],
    ['Recorded trades', String(entries.length), `${entries.filter(e => statusOf(e) === 'open').length} open · ${entries.filter(e => statusOf(e) === 'planned').length} planned`],
    ['Winners / losers / BE', m.n ? `${m.wins} / ${m.losses} / ${m.be}` : '—', 'Net results · breakeven included'],
    ['Win rate', m.winRate == null ? '—' : `${m.winRate.toFixed(2)}%`, `${m.n} eligible closed trades`],
    ['Profit factor', m.pf === null ? '—' : m.pf === Infinity ? '∞' : m.pf.toFixed(2), 'Net profits / net losses'],
    ['Average hold', summary.averageHold == null ? '—' : `${(summary.averageHold / 60000).toFixed(1)} min`, `${summary.holdCount} valid timestamp pairs`],
  ];
  return <div inert={suspended ? true : undefined} aria-hidden={suspended ? true : undefined} className="fixed inset-0 z-[60] flex items-center justify-center bg-[#0b1c30]/35 p-3 sm:p-6" onClick={ev => ev.target === ev.currentTarget && onClose()}>
    <div ref={ref} role="dialog" aria-modal={!suspended} aria-labelledby="journal-day-title" tabIndex={-1} onFocusCapture={ev => { if (!suspended) lastFocus.current = ev.target as HTMLElement; }} className="w-full max-w-6xl max-h-[90dvh] overflow-y-auto rounded-2xl border border-slate-200 bg-[#f8fafc] text-[#0b1c30] shadow-2xl focus:outline-none">
      <header className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 bg-white border-b border-slate-200 p-5">
        <div><h2 id="journal-day-title" className="text-lg font-bold flex items-center gap-2"><CalendarDays size={20} className="text-[#5338ec]"/>Daily review · {date}</h2><p className="text-xs text-slate-500 mt-1">{currency} · recorded entry date (UTC) · current journal filters · trading only</p></div>
        <div className="flex items-center gap-2"><button disabled={date <= from || date <= '0001-01-01'} className="p-2 rounded-lg border border-slate-200 disabled:opacity-40" aria-label="Previous day" onClick={() => onDay(addDays(date, -1))}><ChevronLeft size={18}/></button><button disabled={date >= to || date >= '9999-12-31'} className="p-2 rounded-lg border border-slate-200 disabled:opacity-40" aria-label="Next day" onClick={() => onDay(addDays(date, 1))}><ChevronRight size={18}/></button><button aria-label="Close daily review" onClick={onClose} className="p-2 rounded-lg border border-slate-200"><X size={18}/></button></div>
      </header>
      <div className="grid lg:grid-cols-[minmax(0,1fr)_320px] gap-5 p-4 sm:p-5">
        <div className="min-w-0 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">{cards.map(([label,value,detail]) => <div key={label} className="rounded-xl border border-slate-200 bg-white p-3"><h3 className="text-[11px] font-semibold text-slate-500">{label}</h3><p className="text-lg font-bold font-mono mt-2 break-words">{value}</p><p className="text-[10px] text-slate-500 mt-1">{detail}</p></div>)}</div>
          {g.n !== m.n && <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs">{g.n - m.n} closed trade(s) have unknown costs and are excluded from net statistics. Gross and net coverage differ.</p>}
          <section className="bg-white border border-slate-200 rounded-2xl p-4"><h3 className="text-sm font-bold">Trade-by-trade net result curve</h3><p className="text-[11px] text-slate-500 mt-1">{summary.timestampCoverage === m.n ? 'Entry-time order' : 'Stable trade-ID order where timestamps are missing'} · not a live intraday equity curve</p>
            {m.n ? <><svg viewBox="0 0 500 170" className="w-full max-h-40 mt-2" role="img" aria-label={`Recorded trade results ending at ${money(m.total)}. Exact values are in the table below.`}><line x1="70" x2="475" y1={y(0)} y2={y(0)} stroke="#cbd5e1" strokeDasharray="4 4"/><polyline points={`70,${y(0)} ${summary.curve.map((p,i) => `${x(i)},${y(p.value)}`).join(' ')}`} fill="none" stroke="#5338ec" strokeWidth="3"/>{summary.curve.map((p,i) => <circle key={p.id} cx={x(i)} cy={y(p.value)} r="4" fill="#5338ec"><title>{`${p.id}: ${money(p.value)} cumulative`}</title></circle>)}<text x="5" y={y(max) - 6} fontSize="11" fill="#64748b">{money(max)}</text>{min !== max && <text x="5" y={y(min) - 6} fontSize="11" fill="#64748b">{money(min)}</text>}<text x="70" y="160" fontSize="11" fill="#64748b">Start</text><text x="475" y="160" textAnchor="end" fontSize="11" fill="#64748b">Trade {summary.curve.length}</text></svg><details className="text-xs"><summary className="cursor-pointer text-[#5338ec]">View curve data</summary><table className="w-full mt-2"><caption className="sr-only">Cumulative net result by recorded trade</caption><thead><tr><th className="text-left">Trade</th><th className="text-right">Cumulative net</th></tr></thead><tbody>{summary.curve.map(p => <tr key={p.id}><td><button onClick={() => onTrade(p.id)} className="text-[#5338ec] underline">{entries.find(e => e.id === p.id)?.symbol} · {p.id}</button></td><td className="text-right">{money(p.value)}</td></tr>)}</tbody></table></details></> : <p className="text-xs text-slate-500 py-6">No eligible closed results on this day. Open positions are not realized losses.</p>}
          </section>
          <section className="rounded-2xl bg-white border border-slate-200 p-4" aria-label="Daily linked trades">
            <h3 className="text-sm font-bold mb-2">Linked trades · {entries.length}</h3>
            {!entries.length ? <p className="text-xs text-slate-500">No recorded trades match this day and your filters. You can still write a reflection.</p> : <>
              <p id="daily-trades-help" className="text-[11px] text-slate-500 mb-3">Scroll for all columns. Net ROI = net P&amp;L ÷ account equity at entry × 100%. Add equity in Review; missing equity stays unknown.</p>
              <div className="overflow-x-auto rounded-lg focus-visible:outline-2 focus-visible:outline-[#5338ec]" tabIndex={0} role="region" aria-label="Scrollable daily trades table" aria-describedby="daily-trades-help">
                <table className="w-full text-xs whitespace-nowrap">
                  <caption className="sr-only">Trades in this daily review</caption>
                  <thead className="text-slate-500 text-left bg-slate-50"><tr>
                    {['Entry time (UTC)','Trade','Buy / Sell','Status / review','Net P&L','Net ROI (%)','Strategy','Realized R','Broker'].map(v => <th scope="col" key={v} className="p-2 font-semibold">{v}</th>)}
                    <th scope="col" className="p-2 font-semibold sticky right-16 bg-slate-50">Replay</th><th scope="col" className="p-2 font-semibold sticky right-0 bg-slate-50 min-w-16">Action</th>
                  </tr></thead>
                  <tbody>{ordered.map(e => {
                    const roi = netRoiOf(e);
                    return <tr key={e.id} className="border-t border-slate-100 bg-white">
                      <td className="p-2">{Number.isFinite(timestampMs(e.entryTime)) ? new Date(timestampMs(e.entryTime)).toISOString().slice(11,19) : 'Unknown'}</td>
                      <td className="p-2 font-semibold">{e.symbol}<span className="block text-[10px] font-normal text-slate-500">{e.assetClass}</span></td>
                      <td className="p-2"><span className={`font-semibold ${e.direction === 'BUY' ? 'text-emerald-700' : 'text-rose-700'}`}>{e.direction}</span></td>
                      <td className="p-2"><div className="flex gap-1"><TradingStatusBadge status={statusOf(e)}/><ReviewStateBadge state={reviewStateOf(e)}/></div></td>
                      <td className="p-2 font-mono">{eligible(e) ? money(netOf(e)) : 'Not realized / unknown'}</td>
                      <td className="p-2 font-mono" title={roi === null ? 'Needs an eligible closed result, known costs and positive account equity at entry.' : `Net P&L ${money(netOf(e))} ÷ recorded equity ${money(e.equityAtEntry!)} × 100`}>
                        {roi === null ? 'Unknown' : `${roi > 0 ? '+' : ''}${roi.toFixed(2)}%`}
                      </td>
                      <td className="p-2">{e.strategy?.trim() || 'Not recorded'}<span className="block text-[10px] text-slate-500">{playbookNames.includes(e.strategy) ? 'Playbook' : e.strategy?.trim() ? 'Recorded strategy · not linked' : 'No strategy provided'}</span></td>
                      <td className="p-2">{realizedR(e) === null ? 'Unknown' : `${realizedR(e)!.toFixed(2)}R`}</td>
                      <td className="p-2">{brokerName(e.brokerId || UNASSIGNED)}</td>
                      <td className="p-2 sticky right-16 bg-white">
                        <button type="button" disabled={!onReplay} onClick={() => onReplay?.(e.id)} aria-label={`Open demo replay for ${e.symbol} trade ${e.id}`} aria-haspopup="dialog" title="Open simulated replay and strategy hypothesis test" className="inline-flex items-center justify-center rounded-lg border border-[#e2dcff] bg-[#f5f2ff] p-1.5 text-[#5338ec] hover:bg-[#eee9ff] focus-visible:outline-2 focus-visible:outline-[#5338ec] disabled:opacity-40"><PlayCircle size={17} aria-hidden="true"/></button>
                      </td>
                      <td className="p-2 sticky right-0 bg-white min-w-16"><button onClick={() => onTrade(e.id)} aria-label={`Review ${e.symbol} trade ${e.id}`} className="text-[#5338ec] font-semibold underline">Review</button></td>
                    </tr>;
                  })}</tbody>
                </table>
              </div>
              <p className="text-[10px] text-slate-500 mt-2">Replay opens a simulated demo with strategy testing, not this trade’s historical market prices.</p>
            </>}
          </section>
          <label className="block rounded-2xl bg-white border border-slate-200 p-4 text-sm font-bold">Daily reflection<textarea aria-label="Daily reflection" rows={3} value={note} onChange={ev => onNote(ev.target.value)} placeholder="What worked today? What will you do differently?" className="mt-3 w-full rounded-xl border border-slate-200 p-3 text-sm font-normal focus:outline-none focus:ring-2 focus:ring-[#5338ec]/30"/><span className="block text-[11px] font-normal text-slate-500 mt-1">Saved locally as you type. Also linked in Weekly Review.</span></label>
        </div>
        <aside className="space-y-4">
          <section className="rounded-2xl border border-slate-200 bg-white p-5"><h3 className="text-sm font-bold">Daily progress</h3><p className="text-[11px] text-slate-500 mt-1 mb-4">Recorded evidence, not an automatic compliance grade</p>{[
            ['Daily reflection', note.trim() ? 'Recorded' : 'Not answered'],
            ['Trade reviews', entries.length ? `${reviews} / ${entries.length} complete` : 'No trades'],
            ['Linked playbook', entries.length ? `${linked} / ${entries.length} linked` : 'No trades'],
            ['Initial stop history', entries.length ? `${stops} / ${entries.length} recorded` : 'No trades'],
          ].map(([label,value]) => <div key={label} className="flex justify-between gap-3 text-xs py-2 border-b border-slate-100"><span>{label}</span><span className="font-semibold text-right">{value}</span></div>)}<p className="text-[10px] text-slate-500 mt-3">{currentStops} current stop(s). A current stop does not prove a stop was set at entry. {entries.filter(e => incompleteFields(e).length > 0).length} trade(s) have incomplete information.</p></section>
          <DisciplineCard entries={entries} checklistLength={checklistLength}/>
          <RulesMonitor entries={entries} rules={rules} onEdit={onEditRules}/>
        </aside>
      </div>
    </div>
  </div>;
}

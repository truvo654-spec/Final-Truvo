import React, { useEffect, useId, useRef, useState } from 'react';
import type { JournalEntry } from '../../../types';
import { useDialogFocus } from '../useDialogFocus';
import { timestampMs } from '../journalMath';
import { formatInsightsMoney, type InsightBucket, type InsightOpenSnapshot, type InsightTrade, type InsightsData, type InsightsSettings } from './insightsData';

export type OpenInsightTrades = (label: string, trades: InsightTrade[]) => void;
export interface InsightsWidgetProps { data: InsightsData; onDrill: OpenInsightTrades; compact?: boolean }
export const insightButton = 'rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-[#5338ec] disabled:opacity-40';
export const resultStyle = (net: number): React.CSSProperties => ({ color: net > 0 ? 'var(--insights-gain)' : net < 0 ? 'var(--insights-loss)' : 'var(--text-secondary)' });
export const dateLabel = (date: string, locale?: string) => new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' }).format(Date.parse(`${date}T12:00:00Z`));
export const countLabel = (count: number, locale?: string) => `${count.toLocaleString(locale)} ${count === 1 ? 'trade' : 'trades'}`;
export function useInsightsChartWidth() {
  const ref = useRef<HTMLDivElement>(null), [width, setWidth] = useState(640);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const update = () => setWidth(Math.max(260, Math.round(node.getBoundingClientRect().width)));
    update();
    if (typeof ResizeObserver === 'undefined') { window.addEventListener('resize', update); return () => window.removeEventListener('resize', update); }
    const observer = new ResizeObserver(update); observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return { ref, width };
}
export function bucketLabel(label: string, bucket: Pick<InsightBucket, 'n' | 'net' | 'winRate'>, settings: InsightsSettings) {
  return `${label}: ${formatInsightsMoney(bucket.net, settings)}, ${countLabel(bucket.n, settings.locale)}, ${bucket.winRate === null ? 'win rate unavailable' : `${bucket.winRate.toFixed(1)}% win rate`}`;
}
export function InsightsTooltip({ label, bucket, settings, children }: { label: string; bucket?: Pick<InsightBucket, 'n' | 'net' | 'winRate'>; settings: InsightsSettings; children?: React.ReactNode }) {
  const id = useId();
  return <div id={id} role="tooltip" className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
    <p className="font-semibold">{label}</p>
    {bucket && <p className="mt-1">{bucketLabel('Result', bucket, settings)}</p>}
    {children}
  </div>;
}
export function cellTint(net: number, max: number): React.CSSProperties {
  const percentage = 8 + Math.min(1, Math.abs(net) / Math.max(max, 0.01)) * 24;
  return { backgroundColor: net ? `color-mix(in srgb, var(${net > 0 ? '--insights-gain' : '--insights-loss'}) ${percentage}%, var(--bg-card))` : 'var(--bg-subtle)' };
}
export function InsightsLoading({ compact = false }: { compact?: boolean }) {
  const labels = ['Overview', 'Playbook progress', 'Discipline track', 'Trading calendar', 'Cumulative P&L', 'Day of week', 'Entry hour', 'Day and hour', 'Insights'];
  const ordered = compact ? ['Overview', 'Trading calendar', ...labels.filter(label => !['Overview', 'Trading calendar', 'Day and hour'].includes(label))] : labels;
  return <div aria-label="Loading Insights" role="status" className="space-y-5">
    {ordered.map(label =>
      <div key={label} aria-label={`Loading ${label}`} className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 motion-reduce:animate-none">
        <div className="mb-4 h-3 w-36 rounded bg-slate-200"/><div className={`${['Overview', 'Playbook progress', 'Discipline track', 'Insights'].includes(label) ? 'h-24' : 'h-52'} rounded-xl bg-slate-100`}/>
      </div>)}
  </div>;
}
export function InsightTradeDrawer({ label, trades, openSnapshot, settings, onClose, onOpenTrade, onOpenTrades, initialView = 'closed', presentation = 'drawer' }: {
  label: string; trades: Pick<InsightTrade, 'entry' | 'net' | 'r'>[]; openSnapshot?: InsightOpenSnapshot; settings: InsightsSettings; onClose: () => void;
  onOpenTrade?: (trade: JournalEntry) => void; onOpenTrades?: (trades: JournalEntry[], label: string) => void;
  initialView?: 'closed' | 'open'; presentation?: 'drawer' | 'dialog';
}) {
  const ref = useDialogFocus(onClose), titleId = useId();
  const body = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<'closed' | 'open'>(openSnapshot ? initialView : 'closed');
  const [limit, setLimit] = useState(50);
  const open = view === 'open' && !!openSnapshot, count = open && openSnapshot ? openSnapshot.positions.length : trades.length;
  const title = open ? 'Open positions · saved snapshot' : label;
  const rows = open && openSnapshot ? openSnapshot.positions.slice(0, limit).map(position => ({ entry: position.entry, amount: position.unrealized, r: null }))
    : trades.slice(0, limit).map(trade => ({ entry: trade.entry, amount: trade.net, r: trade.r }));
  const switchView = (next: 'closed' | 'open') => { setView(next); setLimit(50); if (body.current) body.current.scrollTop = 0; };
  const money = (value: number | null) => value === null ? 'Unknown' : formatInsightsMoney(value, settings);
  const number = new Intl.NumberFormat(settings.locale, { maximumFractionDigits: 6 });
  const time = (value?: string) => Number.isFinite(timestampMs(value))
    ? new Intl.DateTimeFormat(settings.locale, { timeZone: settings.timeZone, dateStyle: 'medium', timeStyle: 'short' }).format(timestampMs(value)) : 'Not recorded';
  return <div className={`fixed inset-0 z-[70] flex bg-slate-900/40 ${presentation === 'dialog' ? 'items-center justify-center p-4' : 'justify-end'}`} onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <div ref={ref} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1} className={`flex w-full max-w-2xl flex-col bg-white text-[#0b1c30] shadow-2xl outline-none ${presentation === 'dialog' ? 'max-h-[85vh] rounded-2xl' : 'h-full'}`}>
      <header className="flex items-start gap-3 border-b border-slate-200 p-5">
        <div className="min-w-0 flex-1"><h2 id={titleId} className="break-words text-lg font-bold">{title}</h2><p className="mt-1 text-xs text-slate-500">{open ? `${count.toLocaleString(settings.locale)} open ${count === 1 ? 'position' : 'positions'}` : countLabel(count, settings.locale)} · {settings.currency} · {settings.timeZone}</p></div>
        <button className={insightButton} onClick={onClose}>Close</button>
      </header>
      {openSnapshot && <div className="border-b border-slate-200 px-5 py-3">
        <div role="group" aria-label="Trade drawer view" className="inline-flex max-w-full overflow-hidden rounded-lg border border-slate-200">
          {(['closed', 'open'] as const).map(mode => <button key={mode} type="button" aria-pressed={view === mode} className={`px-3 py-2 text-xs font-semibold ${view === mode ? 'bg-[#5338ec] text-white' : 'bg-white text-slate-500'}`} onClick={() => switchView(mode)}>
            {mode === 'closed' ? `Closed trades (${trades.length})` : `Open positions (${openSnapshot.positions.length})`}
          </button>)}
        </div>
      </div>}
      <div ref={body} className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
        {open && openSnapshot && <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
          <p className="break-words">Latest saved open-position snapshot—not live prices or positions reconstructed for the clicked date. Account: {openSnapshot.account === 'all' ? 'All accounts' : openSnapshot.account} · Side: {openSnapshot.side}. The report date range and clicked day/group do not restrict this snapshot.</p>
          {count > 0 && <dl className="grid min-w-0 grid-cols-3 gap-3">
            <div className="min-w-0"><dt>Open positions</dt><dd className="mt-1 text-base font-semibold">{count.toLocaleString(settings.locale)}</dd></div>
            <div className="min-w-0"><dt>Reported unrealized P&L</dt><dd className="mt-1 break-words text-base font-semibold" style={openSnapshot.unrealized === null ? undefined : resultStyle(openSnapshot.unrealized)}>{money(openSnapshot.unrealized)}</dd></div>
            <div className="min-w-0"><dt>Floating losses</dt><dd className="mt-1 break-words text-base font-semibold" style={openSnapshot.floatingLosses === null ? undefined : resultStyle(openSnapshot.floatingLosses)}>{money(openSnapshot.floatingLosses)}</dd></div>
          </dl>}
          <p>Floating losses sum negative reported P&L on open positions. They are not historical peak-to-trough drawdown; no mark-to-market history is stored for these positions. Recorded costs stay separate from reported unrealized values.</p>
          {openSnapshot.unknown > 0 && <p role="status">{openSnapshot.known} of {count} positions have reported P&L. Full totals remain unknown.{openSnapshot.known > 0 && <> Known P&L subtotal: {money(openSnapshot.knownSubtotal)}; known floating losses: {money(openSnapshot.knownFloatingLosses)}.</>}</p>}
          {openSnapshot.otherCurrency > 0 && <p>{openSnapshot.otherCurrency} open positions in other currencies are excluded. Values are never combined across currencies.</p>}
        </div>}
        {!count && <p className="p-5 text-sm text-slate-500">{open ? 'No open positions match the selected account, side and reporting currency.' : 'No closed trades match this point.'}</p>}
        {rows.map(trade => {
          const entry = trade.entry;
          const url = onOpenTrade ? new URL(window.location.href) : null;
          if (url) { url.searchParams.set('journalTab', 'entries'); url.searchParams.set('journalTrade', entry.id); }
          return <article key={entry.id} className="rounded-xl border border-slate-200 p-4 text-sm">
            <div className="flex items-start justify-between gap-3">
              {onOpenTrade && url ? <a className="font-semibold text-[#5338ec] underline" href={url.pathname + url.search} onClick={event => {
                if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                event.preventDefault(); onOpenTrade(entry);
              }} aria-label={`Open ${entry.symbol} ${entry.id} in Trade Log`}>{entry.symbol} · {entry.direction === 'BUY' ? 'Long' : 'Short'}</a> : <strong>{entry.symbol} · {entry.direction === 'BUY' ? 'Long' : 'Short'}</strong>}
              <span className="shrink-0 text-right"><span className="block text-xs text-slate-500">{open ? 'Unrealized P&L' : 'Net P&L'}</span><strong style={trade.amount === null ? undefined : resultStyle(trade.amount)}>{trade.amount === null ? 'Not reported' : money(trade.amount)}</strong></span>
            </div>
            <dl className="mt-3 grid grid-cols-1 gap-2 text-xs text-slate-600 sm:grid-cols-2">
              <div><dt>Entry</dt><dd>{time(entry.entryTime)} · {Number.isFinite(entry.entryPrice) ? number.format(entry.entryPrice) : 'Price not recorded'}</dd></div>
              {open ? <>
                <div><dt>Recorded size</dt><dd>{Number.isFinite(entry.size) ? number.format(entry.size) : 'Not recorded'} · {entry.quantityUnit || 'unit not recorded'}</dd></div>
                <div><dt>Floating loss</dt><dd>{trade.amount === null ? 'Not reported' : money(Math.min(0, trade.amount))}</dd></div>
              </> : <>
                <div><dt>Exit</dt><dd>{time(entry.exitTime)} · {entry.exitPrice != null && Number.isFinite(entry.exitPrice) ? number.format(entry.exitPrice) : 'Price not recorded'}</dd></div>
                <div><dt>R-multiple</dt><dd>{trade.r === null ? 'Not recorded' : `${trade.r.toFixed(2)}R`}</dd></div>
              </>}
              <div><dt>{open ? 'Recorded costs (separate)' : 'Recorded costs'}</dt><dd>{entry.commission != null && (!Number.isFinite(entry.commission) || entry.commission < 0) ? 'Invalid recorded costs' : Number.isFinite(entry.commission) ? formatInsightsMoney(-entry.commission!, settings) : open ? 'Not recorded' : 'Not recorded; result deducts recorded costs only'}</dd></div>
            </dl>
            <p className="mt-3 break-words text-xs text-slate-500">Tags: {entry.tags.length ? entry.tags.join(' · ') : 'None'}</p>
          </article>;
        })}
        {limit < count && <button className={insightButton+' w-full'} onClick={() => setLimit(limit + 50)}>{open ? 'Load more positions' : 'Load more trades'}</button>}
      </div>
      {onOpenTrades && <footer className="border-t border-slate-200 p-4"><button className={insightButton+' w-full'} disabled={!count} onClick={() => onOpenTrades(open && openSnapshot ? openSnapshot.positions.map(position => position.entry) : trades.map(trade => trade.entry), title)}>{open ? 'Open positions in Trade Log' : 'Open these trades in Trade Log'}</button></footer>}
    </div>
  </div>;
}

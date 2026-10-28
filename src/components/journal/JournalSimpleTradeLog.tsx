import React, { lazy, Suspense, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import type { Broker, JournalEntry } from '../../types';
import { useMoney } from './JournalCurrency';
import { JournalCard, journalButton } from './JournalCards';
import type { JournalCardsController } from './useJournalCards';
const JournalTradeLog = lazy(() => import('./JournalTradeLog').then(module => ({ default: module.JournalTradeLog })));
import { filterTradeLogEntries, tradeLogKpis } from './journalTradeLogModel';
import { eligible, netOf, timestampMs } from './journalMath';
import { reviewStateOf, tradingStatusOf } from './tradingStatus';
import { pluralize, formatPlainPF, formatPlainPayoff } from './journalPlain';
import { useTradeLogFilters } from './useTradeLogFilters';
import { getJournalHelp } from './JournalHelp';

const CARD_HELP_LABELS: Record<string, string> = {
  summary: 'Cumul. Net P&L', net: 'Cumul. Net P&L', 'profit-factor': 'Profit Factor',
  payoff: 'Avg Win / Loss', 'win-rate': 'Win Rate', 'realized-r': 'Realized R-Avg',
  fees: 'Comms & Fees', cashback: 'Cashback (est. USD)', points: 'Points (est.)', trades: 'Trade Log', tools: 'Trade Log',
};
interface Props {
  entries: JournalEntry[];
  brokers: Broker[];
  currency: string;
  rangeLabel: string;
  view: JournalCardsController;
  preset?: { ids: string[]; label: string } | null;
  onClearPreset: () => void;
  onChange: React.Dispatch<React.SetStateAction<JournalEntry[]>>;
  onOpen: (id: string, cohort?: string[]) => void;
  onToast: (message: string) => void;
  onAdd: () => void;
  onImport: () => void;
  onReplay: (id: string) => void;
  onReplayLog: (id: string) => void;
  onBacktestTrades: (ids: string[]) => void;
}
export function JournalSimpleTradeLog(props: Props) {
  const { entries, brokers, currency, rangeLabel, view, preset, onClearPreset, onOpen, onAdd, onImport } = props;
  const easy = view.baseLevel === 'easy';
  const money = useMoney();
  const filters = useTradeLogFilters();
  const { query, setQuery, needsReview, setNeedsReview, setFOutcome, setFTradingStatus, setMarketOff, setBrokerOff } = filters;
  const [searchOpen, setSearchOpen] = useState(!!query);
  const [limit, setLimit] = useState(20);
  const brokerMap = useMemo(() => new Map(brokers.map(broker => [broker.id, broker])), [brokers]);
  const baseRows = useMemo(() => filterTradeLogEntries(entries, { ...filters, needsReview: false }, brokerMap, preset),
    [entries, preset, query, filters.fOutcome, filters.fTradingStatus, filters.marketOff, filters.brokerOff, brokerMap]);
  const waiting = baseRows.filter(entry => reviewStateOf(entry) !== 'complete');
  const easyRows = useMemo(() => [...baseRows].filter(entry => preset || !needsReview || reviewStateOf(entry) !== 'complete')
    .sort((a, b) => timestampMs(b.entryTime || b.date) - timestampMs(a.entryTime || a.date) || b.id.localeCompare(a.id)), [baseRows, needsReview, preset]);
  const rows = easyRows;
  const kpi = useMemo(() => tradeLogKpis(rows, brokerMap), [rows, brokerMap]);
  const reset = () => { setQuery(''); setNeedsReview(false); setFOutcome('all'); setFTradingStatus('all'); setMarketOff([]); setBrokerOff([]); setLimit(20); onClearPreset(); };
  const table = (advanced: boolean) => <Suspense fallback={<p role="status">Loading trade tools…</p>}><JournalTradeLog key={advanced ? 'tools' : 'standard'} {...props} filters={filters} onToast={props.onToast} variant={advanced ? 'advanced' : 'standard'}/></Suspense>;
  const renderCard = (id: string) => {
    switch (id) {
      case 'summary': return <>
        <p className="text-sm text-slate-600">In {rangeLabel === 'All time' ? 'all time' : rangeLabel}, {kpi.n ? `you made ${money(kpi.net)}. You won ${kpi.wins} of ${pluralize(kpi.n, 'trade')}.` : 'there are no closed trades with known results and costs yet.'}</p>
        <dl className="mt-5 grid grid-cols-3 gap-3">
          <div className="min-w-0"><dt className="text-sm text-slate-500">Net result</dt><dd className={`mt-1 break-words text-lg font-semibold ${kpi.net > 0 ? 'text-emerald-600' : kpi.net < 0 ? 'text-rose-600' : ''}`}>{kpi.n ? money(kpi.net) : '—'}</dd></div>
          <div><dt className="text-sm text-slate-500">Closed trades</dt><dd className="mt-1 text-lg font-semibold">{kpi.n}</dd></div>
          <div><dt className="text-sm text-slate-500">Win rate</dt><dd className="mt-1 text-lg font-semibold">{kpi.n ? `${kpi.winRate}%` : '—'}</dd></div>
        </dl>
      </>;
      case 'net': return <p className="text-lg font-semibold">{kpi.n ? money(kpi.net) : 'No closed results yet'}</p>;
      case 'win-rate': return <p className="text-sm">{kpi.n ? `You won ${kpi.wins} of ${pluralize(kpi.n, 'trade')} (${kpi.winRate}%).` : 'No closed results yet'}</p>;
      case 'payoff': return <p className="text-sm">{formatPlainPayoff(kpi.payoff)}</p>;
      case 'profit-factor': return <p className="text-sm">{formatPlainPF(kpi.pf, currency)}</p>;
      case 'realized-r': return <p className="text-sm">{kpi.rn ? `${kpi.r.toFixed(2)}R average across ${pluralize(kpi.rn, 'trade')}` : 'No risk-based results recorded'}</p>;
      case 'fees': return <p className="text-lg font-semibold">{money(-kpi.fees)}</p>;
      case 'cashback': return <p className="text-sm">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(kpi.cb)} estimated cashback</p>;
      case 'points': return <p className="text-sm">{pluralize(kpi.pts, 'point')} estimated before boosters</p>;
      case 'tools': return table(true);
      case 'trades':
        if (!easy) return table(false);
        return <>
          {entries.length > 0 && <div className="mb-4 flex items-center gap-2">
            <button className={journalButton} aria-label="Search trades" aria-expanded={searchOpen} onClick={() => { setSearchOpen(!searchOpen); if (searchOpen) setQuery(''); }}><Search size={16}/></button>
            {searchOpen && <input autoFocus aria-label="Search my trades" placeholder="Search trades" value={query} onChange={event => { setQuery(event.target.value); setLimit(20); }} className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"/>}
          </div>}
          {easyRows.length < entries.length && <p className="mb-4 text-sm text-slate-500">Showing {easyRows.length} of {entries.length} trades · <button className="text-[#5338ec] underline" onClick={reset}>Show all</button>{preset && ` · ${preset.label}`}{needsReview && ' · Needs review'}</p>}
          {!easyRows.length ? <div className="py-6 text-center">
            <p className="text-sm text-slate-500">{entries.length ? 'No trades match this view.' : 'Your trades will show here. Add one or import from your broker.'}</p>
            <button className={journalButton+' mt-4'} onClick={entries.length ? reset : onAdd}>{entries.length ? 'Show all trades' : '+ Add trade'}</button>
          </div> : <div className="divide-y divide-slate-100">{easyRows.slice(0, limit).map(entry => <button key={entry.id} className="grid w-full grid-cols-2 gap-2 py-4 text-left text-sm hover:bg-slate-50 sm:grid-cols-[1fr_1fr_1fr_1fr_auto]" aria-label={`Quick review ${entry.symbol} ${entry.date}`} onClick={() => onOpen(entry.id, easyRows.map(item => item.id))}>
            <span className="text-slate-500">{entry.date}</span><span className="font-semibold">{entry.symbol}</span>
            <span className="text-slate-600">{entry.direction === 'BUY' ? 'Long' : 'Short'}</span>
            <span className={`font-semibold ${eligible(entry) ? netOf(entry) > 0 ? 'text-emerald-600' : netOf(entry) < 0 ? 'text-rose-600' : 'text-slate-600' : 'text-slate-500'}`}>{eligible(entry) ? money(netOf(entry)) : tradingStatusOf(entry) === 'closed' ? 'Result unknown' : tradingStatusOf(entry) === 'planned' ? 'Planned' : 'Open'}</span>
            {reviewStateOf(entry) !== 'complete' && <span className="inline-flex items-center gap-1 text-slate-500" aria-label="Needs notes"><span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[#5338ec]"/>Needs notes</span>}
          </button>)}</div>}
          {limit < easyRows.length && <button className={journalButton+' mt-4 w-full'} onClick={() => setLimit(limit + 20)}>Load more</button>}
        </>;
      default: return null;
    }
  };
  return <div className="mt-6 space-y-5">
    <div className="flex flex-wrap items-center gap-4"><h2 className="mr-auto text-lg font-semibold">{easy ? 'My trades' : 'Trade Log'}</h2>
      <button className="rounded-xl bg-[#5338ec] px-4 py-2.5 text-sm font-semibold text-white" onClick={onAdd}>+ Add trade</button>
      <button className="text-sm font-semibold text-[#5338ec] hover:underline" onClick={onImport}>Import from broker</button>
    </div>
    {easy && waiting.length > 0 && <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">{pluralize(waiting.length, 'trade')} waiting for your notes · <button className="font-semibold text-[#5338ec] hover:underline" onClick={() => { onClearPreset(); setNeedsReview(true); setLimit(20); }}>Review now</button></p>}
    <div className={easy ? 'space-y-5' : 'grid grid-cols-1 gap-4 md:grid-cols-2'}>
      {view.cards.map(card => <div key={card.id} className={!easy && ['trades', 'tools', 'summary'].includes(card.id) ? 'md:col-span-2 min-w-0' : 'min-w-0'}>
        <JournalCard card={card} view={view} detail={<p>{getJournalHelp(CARD_HELP_LABELS[card.id] || card.title) || card.plainSummary}</p>}>{renderCard(card.component)}</JournalCard>
      </div>)}
    </div>
  </div>;
}

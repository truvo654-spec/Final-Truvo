import { useJournalState } from './journalStorage';
import { useMoney, formatMoney } from './JournalCurrency';
import { netOf, eligible, resultOf, realizedR, timestampMs, metrics, currencyOf } from './journalMath';
import React, { useEffect, useMemo, useState } from 'react';
import { Broker, JournalEntry } from '../../types';
import { UNASSIGNED, brokerColor, entryCashback, entryPoints } from './journalOverview';
import { TradingStatusBadge, ReviewStateBadge, reviewStateOf, TRADING_STATUS_LABEL, tradingStatusOf } from './tradingStatus';

// Dark "trade log" workspace: KPI strip, bulk actions, grouping, column picker, sortable table with
// totals and pagination. Figures are net of commissions; cashback and points are estimates.

type ColKey =
  | 'time' | 'instrument' | 'side' | 'size' | 'entry' | 'exit' | 'net' | 'r'
  | 'broker' | 'cashback' | 'points' | 'fees' | 'tags' | 'playbook' | 'outcome' | 'tradingStatus' | 'review';

interface ColDef { key: ColKey; label: string; align?: 'right'; sortable?: boolean; defaultOn: boolean }

const COLS: ColDef[] = [
  { key: 'time', label: 'Date & Time', sortable: true, defaultOn: true },
  { key: 'instrument', label: 'Instrument', sortable: true, defaultOn: true },
  { key: 'tradingStatus', label: 'Trading status', sortable: true, defaultOn: true },
  { key: 'review', label: 'Review', defaultOn: true },
  { key: 'side', label: 'Side', sortable: true, defaultOn: true },
  { key: 'size', label: 'Size', align: 'right', sortable: true, defaultOn: false },
  { key: 'entry', label: 'Entry', align: 'right', sortable: true, defaultOn: false },
  { key: 'exit', label: 'Exit', align: 'right', sortable: true, defaultOn: false },
  { key: 'net', label: 'Net P&L', align: 'right', sortable: true, defaultOn: true },
  { key: 'r', label: 'Realized R', align: 'right', sortable: true, defaultOn: true },
  { key: 'broker', label: 'Broker', sortable: true, defaultOn: true },
  { key: 'cashback', label: 'Cashback (est. USD)', align: 'right', sortable: true, defaultOn: false },
  { key: 'points', label: 'Points', align: 'right', sortable: true, defaultOn: false },
  { key: 'fees', label: 'Comm. & Fees', align: 'right', sortable: true, defaultOn: false },
  { key: 'tags', label: 'Execution Tags', defaultOn: true },
  { key: 'playbook', label: 'Playbook', sortable: true, defaultOn: false },
  { key: 'outcome', label: 'Outcome', sortable: true, defaultOn: false },
];

type GroupBy = 'none' | 'day' | 'week' | 'instrument' | 'broker' | 'playbook' | 'side' | 'outcome' | 'tradingStatus';

const money = (n: number, dp = 2) =>
  `${n < 0 ? '-' : n > 0 ? '+' : ''}$${Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: dp, maximumFractionDigits: dp })}`;
const plain = (n: number, dp = 2) => `$${Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: dp, maximumFractionDigits: dp })}`;
const num = (n: number) => n.toLocaleString('en-US', { maximumFractionDigits: 5 });
const tone = (n: number) => (n > 0 ? 'text-emerald-600' : n < 0 ? 'text-rose-600' : 'text-slate-500');

const VENUE: Record<string, string> = { Forex: 'SPOT', Crypto: 'SPOT', Stocks: 'EQUITY', Indices: 'CFD', Commodity: 'CFD' };
const BADGE: Record<string, string> = { Forex: 'FX', Crypto: 'CR', Stocks: 'EQ', Indices: 'IX', Commodity: 'CM' };
const BADGE_STYLE: Record<string, string> = {
  Forex: 'bg-blue-100 text-blue-700',
  Crypto: 'bg-violet-100 text-violet-700',
  Stocks: 'bg-cyan-100 text-cyan-700',
  Indices: 'bg-indigo-100 text-indigo-700',
  Commodity: 'bg-amber-100 text-amber-700',
};

const sizeLabel = (e: JournalEntry) => {
  const unit =
    e.quantityUnit || (e.assetClass === 'Stocks' ? 'shares'
    : e.assetClass === 'Crypto' ? e.symbol.split(/[/-]/)[0]
    : e.assetClass === 'Indices' && e.size >= 1 && Number.isInteger(e.size) ? (e.size === 1 ? 'contract' : 'contracts')
    : e.size === 1 ? 'lot' : 'lots');
  return `${num(e.size)} ${unit}`;
};

const fmtTime = (e: JournalEntry) => {
  const d = new Date(timestampMs(e.entryTime || `${e.date}T00:00:00`));
  const date = d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric', timeZone: 'UTC' });
  if (!e.entryTime) return date;
  return `${date} ${d.toLocaleTimeString('en-US', { hour12: false, timeZone: 'UTC' })}`;
};

const tagLabel = (t: string) => `#${t.replace(/^#/, '').trim().replace(/\s+/g, '_')}`;

interface Props {
  entries: JournalEntry[];
  brokers: Broker[];
  onChange: (updater: (prev: JournalEntry[]) => JournalEntry[]) => void;
  onOpen: (id: string, cohort?: string[]) => void;
  onNew: () => void;
  onToast: (msg: string) => void;
  preset?: { ids: string[]; label: string } | null;
  onClearPreset?: () => void;
  /** Replay one trade blind in Backtest → Practice. */
  onReplay?: (id: string) => void;
}

export const JournalTradeLog: React.FC<Props> = ({ entries, brokers, onChange, onOpen, onNew, onToast, preset, onClearPreset, onReplay }) => {
  const money = useMoney();
  const tradingPlain = (n:number,dp=2)=>money(Math.abs(n),dp).replace(/^\+/, '');

  const brokerMap = useMemo(() => new Map(brokers.map((b) => [b.id, b] as const)), [brokers]);
  const brokerOrder = useMemo(() => brokers.map((b) => b.id), [brokers]);
  const brokerName = (id?: string) => (id ? brokerMap.get(id)?.name || id : 'Unassigned');

  const [query, setQuery] = useJournalState('JournalTradeLog-query', '');
  const [needsReview, setNeedsReview] = useJournalState('JournalTradeLog-needsReview', false);
  const [fOutcome, setFOutcome] = useJournalState('JournalTradeLog-fOutcome', 'all');
  const [fTradingStatus, setFTradingStatus] = useJournalState<'all' | 'planned' | 'open' | 'closed'>('JournalTradeLog-fTradingStatus', 'all');
  const [marketOff, setMarketOff] = useJournalState<string[]>('JournalTradeLog-marketOff', []);
  const [brokerOff, setBrokerOff] = useJournalState<string[]>('JournalTradeLog-brokerOff', []);
  const [groupBy, setGroupBy] = useJournalState<GroupBy>('JournalTradeLog-groupBy', 'none');
  const [cols, setCols] = useJournalState<ColKey[]>('JournalTradeLog-cols', COLS.filter((c) => c.defaultOn).map((c) => c.key));
  const [colsOpen, setColsOpen] = useState(false);
  const [sort, setSort] = useState<{ key: ColKey; dir: 'asc' | 'desc' }>({ key: 'time', dir: 'desc' });
  const [perPage, setPerPage] = useJournalState('JournalTradeLog-perPage', 10);
  const [page, setPage] = useJournalState('JournalTradeLog-page', 1);
  const [sel, setSel] = useState<string[]>([]);
  const [panel, setPanel] = useState<null | 'tag' | 'move' | 'delete'>(null);
  const [tagText, setTagText] = useState('');
  const [moveTo, setMoveTo] = useState('');

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries.filter((e) => {
      // A contributing-trade handoff must not silently inherit unrelated Log subfilters.
      if(preset)return preset.ids.includes(e.id);
      if (needsReview && reviewStateOf(e) === 'complete') return false;
      if (fOutcome !== 'all' && (!eligible(e) || resultOf(e) !== fOutcome)) return false;
      if (fTradingStatus !== 'all' && tradingStatusOf(e) !== fTradingStatus) return false;
      if (marketOff.includes(e.assetClass)) return false;
      if (brokerOff.includes(e.brokerId || UNASSIGNED)) return false;
      if (!q) return true;
      return [e.symbol, e.strategy, brokerName(e.brokerId), ...e.tags].some((s) => s.toLowerCase().includes(q));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries, query, needsReview, fOutcome, fTradingStatus, marketOff, brokerOff, brokerMap, preset]);

  const sortVal = (e: JournalEntry, k: ColKey): number | string => {
    switch (k) {
      case 'time': return timestampMs(e.entryTime || `${e.date}T00:00:00`);
      case 'instrument': return e.symbol;
      case 'side': return e.direction;
      case 'size': return e.size;
      case 'entry': return e.entryPrice;
      case 'exit': return e.exitPrice ?? Number.NEGATIVE_INFINITY;
      case 'net': return netOf(e);
      case 'r': return realizedR(e) ?? Number.NEGATIVE_INFINITY;
      case 'broker': return brokerName(e.brokerId);
      case 'cashback': return entryCashback(e, brokerMap);
      case 'points': return entryPoints(e);
      case 'fees': return e.commission ?? 0;
      case 'playbook': return e.strategy;
      case 'outcome': return eligible(e)?resultOf(e):'unknown';
      case 'tradingStatus': return tradingStatusOf(e);
      default: return 0;
    }
  };

  const sorted = useMemo(() => {
    const out = [...rows].sort((a, b) => {
      const x = sortVal(a, sort.key);
      const y = sortVal(b, sort.key);
      const c = typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y));
      return sort.dir === 'asc' ? c : -c;
    });
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, sort, brokerMap]);

  const pages = Math.max(1, Math.ceil(sorted.length / perPage));
  const curPage = Math.min(page, pages);
  const visible = sorted.slice((curPage - 1) * perPage, curPage * perPage);

  useEffect(() => { setPage(1); }, [query, fOutcome, fTradingStatus, marketOff, brokerOff, perPage, groupBy]);
  useEffect(() => { setSel((s) => s.filter((id) => entries.some((e) => e.id === id))); }, [entries]);

  const sum = (list: JournalEntry[]) => {
    list = list.filter(e => eligible(e));
    const net = list.reduce((a, e) => a + netOf(e), 0);
    const gross = list.reduce((a, e) => a + e.pnl, 0);
    const fees = list.reduce((a, e) => a + (e.commission ?? 0), 0);
    const rs = list.map((e) => realizedR(e)).filter((r): r is number => r !== null);
    return {
      n: list.length,
      net: Math.round(net * 100) / 100,
      gross,
      fees: Math.round(fees * 100) / 100,
      cb: Math.round(list.reduce((a, e) => a + entryCashback(e, brokerMap), 0) * 100) / 100,
      pts: list.reduce((a, e) => a + entryPoints(e), 0),
      r: rs.length ? rs.reduce((a, b) => a + b, 0) / rs.length : 0,
      rn: rs.length,
    };
  };

  const kpi = useMemo(() => {
    const t = sum(rows);
    const nets = rows.filter(e => eligible(e)).map(netOf);
    const wins = nets.filter((n) => n > 0);
    const losses = nets.filter((n) => n < 0);
    const be = nets.length - wins.length - losses.length;
    const gW = wins.reduce((a, b) => a + b, 0);
    const gL = Math.abs(losses.reduce((a, b) => a + b, 0));
    const avgW = wins.length ? gW / wins.length : 0;
    const avgL = losses.length ? gL / losses.length : 0;
    const pf = gL > 0 ? gW / gL : gW>0 ? Infinity : null;
    const rs = rows.map((e) => realizedR(e)).filter((r): r is number => r !== null);
    return {
      ...t,
      pf,
      wins: wins.length,
      losses: losses.length,
      be,
      winRate: nets.length ? Math.round((wins.length / nets.length) * 1000) / 10 : 0,
      avgW, avgL,
      payoff: avgL > 0 ? avgW / avgL : null,
      maxR: rs.length ? Math.max(...rs) : 0,
      feePct: t.gross !== 0 ? (t.fees / Math.abs(t.gross)) * 100 : null,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, brokerMap]);

  const selEntries = useMemo(() => entries.filter((e) => sel.includes(e.id)), [entries, sel]);
  const selSum = sum(selEntries);

  const groups = useMemo(() => {
    if (groupBy === 'none') return [{ key: '', list: visible }];
    const keyOf = (e: JournalEntry) =>
      groupBy === 'day' ? e.date : groupBy === 'week' ? `Week of ${new Date(Date.parse(`${e.date}T00:00:00Z`) - ((new Date(`${e.date}T00:00:00Z`).getUTCDay()+6)%7)*86400000).toISOString().slice(0,10)}` :
      groupBy === 'instrument' ? e.symbol : groupBy === 'broker' ? brokerName(e.brokerId) : groupBy === 'playbook' ? e.strategy : groupBy === 'side' ? (e.direction === 'BUY' ? 'LONG' : 'SHORT') : groupBy === 'outcome' ? (eligible(e)?resultOf(e):'Not realized / unknown') : TRADING_STATUS_LABEL[tradingStatusOf(e)];
    const m = new Map<string, JournalEntry[]>();
    visible.forEach((e) => { const k = keyOf(e); m.set(k, [...(m.get(k) || []), e]); });
    return Array.from(m.entries()).map(([key, list]) => ({ key, list }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, groupBy, brokerMap]);

  const marketOpts = useMemo(() => {
    const m = new Map<string, number>();
    entries.forEach((e) => m.set(e.assetClass, (m.get(e.assetClass) || 0) + 1));
    return Array.from(m.entries()).map(([id, n]) => ({ id, label: id, n }));
  }, [entries]);
  const brokerOpts = useMemo(() => {
    const m = new Map<string, number>();
    entries.forEach((e) => m.set(e.brokerId || UNASSIGNED, (m.get(e.brokerId || UNASSIGNED) || 0) + 1));
    return Array.from(m.entries()).map(([id, n]) => ({ id, label: id === UNASSIGNED ? 'Unassigned' : brokerName(id), n, color: brokerColor(id, brokerOrder) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries, brokerMap]);
  const toggleIn = (set: React.Dispatch<React.SetStateAction<string[]>>, id: string) => set((o) => (o.includes(id) ? o.filter((x) => x !== id) : [...o, id]));

  const btn = 'h-9 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-[#0b1c30] disabled:opacity-40 disabled:hover:bg-white';
  const [openMenu, setOpenMenu] = useState<null | 'market' | 'broker' | 'cols'>(null);
  const filterMenu = (
    id: 'market' | 'broker',
    title: string,
    opts: { id: string; label: string; n: number; color?: string }[],
    off: string[],
    set: React.Dispatch<React.SetStateAction<string[]>>
  ) => (
    <div className="relative">
      <button type="button" disabled={!!preset} aria-expanded={openMenu === id} onClick={() => { setColsOpen(false); setOpenMenu(openMenu === id ? null : id); }} className={`${btn} ${off.length ? 'border-[#5338ec] text-[#5338ec]' : ''}`}>
        {title} ({opts.length - off.length}/{opts.length})
      </button>
      {openMenu === id && (
        <div className="absolute z-20 mt-2 w-56 rounded-xl bg-white border border-slate-200 shadow-xl p-2 max-h-72 overflow-y-auto">
          {opts.map((o) => (
            <label key={o.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 text-xs text-[#0b1c30] cursor-pointer">
              <input type="checkbox" checked={!off.includes(o.id)} onChange={() => toggleIn(set, o.id)} style={o.color ? { accentColor: o.color } : undefined} />
              <span className="flex-1">{o.label}</span>
              <span className="text-[10px] font-mono text-slate-400">{o.n}</span>
            </label>
          ))}
          <div className="flex justify-between px-2 pt-1.5">
            <button type="button" onClick={() => set([])} className="text-[11px] font-semibold text-[#5338ec] hover:underline">Select all</button>
            <button type="button" onClick={() => set(opts.map((o) => o.id))} className="text-[11px] font-semibold text-slate-500 hover:underline">Clear</button>
          </div>
        </div>
      )}
    </div>
  );

  const colOn = (k: ColKey) => cols.includes(k);
  const shownCols = COLS.filter((c) => colOn(c.key));
  const allVisibleSelected = visible.length > 0 && visible.every((e) => sel.includes(e.id));
  const someVisibleSelected = visible.some((e) => sel.includes(e.id));

  const toggleSort = (k: ColKey) => setSort((s) => (s.key === k ? { key: k, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key: k, dir: k === 'time' || typeof sortVal(entries[0] || ({} as JournalEntry), k) === 'number' ? 'desc' : 'asc' }));
  const toggleRow = (id: string) => setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const toggleAll = () => setSel((s) => (allVisibleSelected ? s.filter((id) => !visible.some((e) => e.id === id)) : Array.from(new Set([...s, ...visible.map((e) => e.id)]))));

  const applyTag = () => {
    const t = tagText.trim().replace(/^#/, '');
    if (!t) return;
    onChange((prev) => prev.map((e) => (sel.includes(e.id) && !e.tags.includes(t) ? { ...e, tags: [...e.tags, t] } : e)));
    onToast(`Tagged ${sel.length} trade${sel.length === 1 ? '' : 's'} ${tagLabel(t)}`);
    setTagText(''); setPanel(null);
  };
  const applyMove = () => {
    onChange((prev) => prev.map((e) => (sel.includes(e.id) ? { ...e, brokerId: moveTo || undefined, cashback: undefined } : e)));
    onToast(`Moved ${sel.length} trade${sel.length === 1 ? '' : 's'} to ${brokerName(moveTo || undefined)}`);
    setPanel(null);
  };
  const applyDelete = () => {
    onChange((prev) => prev.filter((e) => !sel.includes(e.id)));
    onToast(`Deleted ${sel.length} trade${sel.length === 1 ? '' : 's'}`);
    setSel([]); setPanel(null);
  };

  const exportCsv = () => {
    const list = sel.length ? selEntries : sorted;
    const head = ['Date', 'Instrument', 'Side', 'Size', 'Entry', 'Exit', 'Gross P&L', 'Commissions', 'Net P&L', 'Realized R', 'Trading status', 'Broker', 'Cashback (est. USD)', 'Points (est.)', 'Playbook', 'Tags', 'Journal ID', 'Account ID', 'Account currency', 'Review state', 'Net eligible'];
    const esc = (v: string | number) => `"${(typeof v==='string' && /^[=+@\-]/.test(v)?`'${v}`:String(v)).replace(/"/g, '""')}"`;
    const lines = list.map((e) => [e.entryTime || e.date, e.symbol, e.direction === 'BUY' ? 'LONG' : 'SHORT', e.size, e.entryPrice, e.exitPrice ?? '', e.pnlKnown===false?'':e.pnl, e.commission ?? '', eligible(e)?netOf(e):'', realizedR(e) ?? '', TRADING_STATUS_LABEL[tradingStatusOf(e)], brokerName(e.brokerId), entryCashback(e, brokerMap), entryPoints(e), e.strategy, e.tags.join('|'),e.id,e.accountId || 'legacy-demo',currencyOf(e),reviewStateOf(e),eligible(e)?'yes':'no'].map(esc).join(','));
    const blob = new Blob([[head.map(esc).join(','), ...lines].join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'trade-log.csv'; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    onToast(`Exported ${list.length} trade${list.length === 1 ? '' : 's'} to CSV`);
  };

  const hasSel = sel.length > 0;

  const cell = (e: JournalEntry, k: ColKey) => {
    switch (k) {
      case 'review': return <td key={k} className="px-3 py-2.5"><ReviewStateBadge state={reviewStateOf(e)} /></td>;
      case 'time': return <td key={k} className="px-3 py-2.5 whitespace-nowrap text-slate-700">{fmtTime(e)}</td>;
      case 'instrument':
        return (
          <td key={k} className="px-3 py-2.5 whitespace-nowrap">
            <span className="inline-flex items-center gap-2">
              <span className={`w-6 h-6 rounded-md text-[9px] font-bold flex items-center justify-center ${BADGE_STYLE[e.assetClass]}`}>{BADGE[e.assetClass]}</span>
              <span className="font-bold text-[#0b1c30]">{e.symbol}</span>
              <span className="text-[9px] font-semibold text-slate-500">{VENUE[e.assetClass]}</span>
            </span>
          </td>
        );
      case 'side':
        return (
          <td key={k} className="px-3 py-2.5">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${e.direction === 'BUY' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{e.direction === 'BUY' ? 'LONG' : 'SHORT'}</span>
          </td>
        );
      case 'size': return <td key={k} className="px-3 py-2.5 text-right whitespace-nowrap text-slate-700">{sizeLabel(e)}</td>;
      case 'entry': return <td key={k} className="px-3 py-2.5 text-right font-mono text-slate-700">{num(e.entryPrice)}</td>;
      case 'exit': return <td key={k} className="px-3 py-2.5 text-right font-mono text-slate-700">{e.exitPrice == null ? <span className="text-slate-500">{tradingStatusOf(e)==='closed'?'Unknown':'—'}</span> : num(e.exitPrice)}</td>;
      case 'net': return <td key={k} className={`px-3 py-2.5 text-right font-mono font-bold ${tone(netOf(e))}`} title={!eligible(e) ? 'Not realized or costs unknown; excluded from net totals' : 'Closed result after costs'}>{eligible(e) ? money(netOf(e)) : '—'}</td>;
      case 'r': return <td key={k} className="px-3 py-2.5 text-right font-mono">{realizedR(e) == null ? '—' : `${realizedR(e)!.toFixed(2)}R`}</td>;
      case 'broker':
        return (
          <td key={k} className="px-3 py-2.5 whitespace-nowrap">
            <span className="inline-flex items-center gap-1.5 text-[#0b1c30]">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: brokerColor(e.brokerId || UNASSIGNED, brokerOrder) }} />
              {brokerName(e.brokerId)}
            </span>
          </td>
        );
      case 'cashback': { const v = entryCashback(e, brokerMap); return <td key={k} className={`px-3 py-2.5 text-right font-mono ${v > 0 ? 'text-emerald-600' : 'text-slate-500'}`}>{v > 0 ? `+${plain(v)}` : '—'}</td>; }
      case 'points': { const v = entryPoints(e); return <td key={k} className={`px-3 py-2.5 text-right font-mono ${v > 0 ? 'text-violet-600' : 'text-slate-500'}`}>{v > 0 ? `+${v.toLocaleString('en-US')}` : '—'}</td>; }
      case 'fees': return <td key={k} className="px-3 py-2.5 text-right font-mono text-slate-700">{Number.isFinite(e.commission) ? tradingPlain(e.commission!) : <span className="text-slate-500">—</span>}</td>;
      case 'tags':
        return (
          <td key={k} className="px-3 py-2.5">
            <span className="flex gap-1 max-w-[260px] overflow-hidden">
              {e.tags.slice(0, 3).map((t) => <span key={t} className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] font-semibold text-slate-700 whitespace-nowrap">{tagLabel(t)}</span>)}
              {e.tags.length === 0 && <span className="text-slate-500">—</span>}
            </span>
          </td>
        );
      case 'playbook': return <td key={k} className="px-3 py-2.5 whitespace-nowrap text-slate-700">{e.strategy}</td>;
      case 'outcome': return <td key={k} className="px-3 py-2.5 capitalize text-slate-700">{eligible(e)?resultOf(e):'Not realized / unknown'}</td>;
      case 'tradingStatus': return <td key={k} className="px-3 py-2.5"><TradingStatusBadge status={tradingStatusOf(e)} /></td>;
    }
  };

  const total = sum(sorted);
  const totalCell = (k: ColKey, s: ReturnType<typeof sum>) => {
    switch (k) {
      case 'net': return <td key={k} className={`px-3 py-2 text-right font-mono font-bold ${tone(s.net)}`}>{money(s.net)}</td>;
      case 'r': return <td key={k} className={`px-3 py-2 text-right font-mono ${tone(s.r)}`}>{s.rn ? `${s.r > 0 ? '+' : ''}${s.r.toFixed(2)}R avg` : '—'}</td>;
      case 'cashback': return <td key={k} className="px-3 py-2 text-right font-mono text-emerald-600">{s.cb > 0 ? `+${plain(s.cb)}` : '—'}</td>;
      case 'points': return <td key={k} className="px-3 py-2 text-right font-mono text-violet-600">{s.pts > 0 ? `+${s.pts.toLocaleString('en-US')}` : '—'}</td>;
      case 'fees': return <td key={k} className="px-3 py-2 text-right font-mono text-[#0b1c30]">{tradingPlain(s.fees)}</td>;
      default: return <td key={k} />;
    }
  };

  const card = 'rounded-xl bg-white border border-[#e2e8f0] px-4 py-3';
  const lbl = 'text-[10px] font-bold tracking-wider uppercase text-slate-500';

  return (
    <div className="rounded-2xl bg-[#f8fafc] border border-[#e2e8f0] p-4 sm:p-5 text-[#0b1c30] space-y-4">
      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3">
        <div className={card}>
          <p className={lbl}>Cumul. Net P&amp;L</p>
          <p className={`text-xl font-bold font-mono mt-1 ${tone(kpi.net)}`}>{kpi.n ? money(kpi.net) : '—'}</p>
          <p className="text-[10px] text-slate-500 mt-1">{kpi.n} trade{kpi.n === 1 ? '' : 's'}</p>
        </div>
        <div className={card}>
          <p className={lbl}>Profit Factor</p>
          <p className="text-xl font-bold font-mono mt-1 text-[#0b1c30]">{kpi.pf === null ? '—' : kpi.pf === Infinity ? '∞' : kpi.pf.toFixed(2)}</p>
          <p className="text-[10px] text-slate-500 mt-1">{kpi.pf===Infinity?'No losing results':kpi.pf===null?'No positive or negative results':'Positive net / absolute negative net'}</p>
        </div>
        <div className={card}>
          <p className={lbl}>Win Rate</p>
          <p className="text-xl font-bold mt-1 text-[#0b1c30]">{kpi.n?`${kpi.winRate}%`:'—'}</p>
          <p className="text-[10px] mt-1"><span className="text-emerald-600">{kpi.wins}W</span> / <span className="text-rose-600">{kpi.losses}L</span> <span className="text-slate-500 ml-1">{kpi.be} BE</span></p>
        </div>
        <div className={card}>
          <p className={lbl}>Avg Win / Loss</p>
          <p className="text-lg font-bold font-mono mt-1"><span className="text-emerald-600">{kpi.wins?tradingPlain(kpi.avgW, 0):'—'}</span> <span className="text-slate-500">/</span> <span className="text-rose-600">{kpi.losses?`-${tradingPlain(kpi.avgL, 0)}`:'—'}</span></p>
          <p className="text-[10px] text-slate-500 mt-1">Payoff ratio {kpi.payoff === null ? '—' : `${kpi.payoff.toFixed(2)}x`}</p>
        </div>
        <div className={card}>
          <p className={lbl}>Realized R-Avg</p>
          <p className={`text-xl font-bold font-mono mt-1 ${kpi.rn ? tone(kpi.r) : 'text-slate-500'}`}>{kpi.rn ? `${kpi.r > 0 ? '+' : ''}${kpi.r.toFixed(2)}R` : '—'}</p>
          <p className="text-[10px] text-slate-500 mt-1">Max single {kpi.rn ? `+${kpi.maxR.toFixed(2)}R` : '—'}</p>
        </div>
        <div className={card}>
          <p className={lbl}>Comms &amp; Fees</p>
          <p className="text-xl font-bold font-mono mt-1 text-[#0b1c30]">{tradingPlain(kpi.fees)}</p>
          <p className="text-[10px] text-slate-500 mt-1">{kpi.feePct==null?'Impact unknown (zero gross)':`${kpi.feePct.toFixed(2)}% of absolute gross total`}</p>
        </div>
        <div className={card}>
          <p className={lbl}>Cashback (est. USD)</p>
          <p className="text-xl font-bold font-mono mt-1 text-emerald-600">{kpi.cb > 0 ? `+${plain(kpi.cb)}` : plain(0)}</p>
          <p className="text-[10px] text-slate-500 mt-1">Separate reward estimate; not trading P&amp;L</p>
        </div>
        <div className={card}>
          <p className={lbl}>Points (est.)</p>
          <p className="text-xl font-bold font-mono mt-1 text-violet-600">{kpi.pts.toLocaleString('en-US')}</p>
          <p className="text-[10px] text-slate-500 mt-1">Base rate, before boosters</p>
        </div>
      </div>

      {/* Bulk actions */}
      <div className="flex flex-wrap items-center gap-2 min-h-[36px]">
        {hasSel ? (
          <>
            <span className="px-3 py-1.5 rounded-lg bg-[#EEF0FE] text-[#5338ec] border border-[#5338ec]/30 text-[11px] font-bold tracking-wide">{sel.length} TRADE{sel.length === 1 ? '' : 'S'} SELECTED</span>
            <button type="button" className={btn} onClick={() => setPanel(panel === 'tag' ? null : 'tag')}>Tag</button>
            <button type="button" className={btn} onClick={() => { setMoveTo(''); setPanel(panel === 'move' ? null : 'move'); }}>Change broker</button>
            <button type="button" className={btn} onClick={exportCsv}>Export</button>
            {onReplay && sel.length === 1 && <button type="button" className={btn} title="Practise this trade bar by bar with the date and outcome hidden" onClick={() => onReplay(sel[0])}>Replay this trade blind</button>}
            <button type="button" className={`${btn} text-rose-600`} onClick={() => setPanel(panel === 'delete' ? null : 'delete')}>Delete</button>
            <button type="button" className="px-2 py-1.5 text-xs font-semibold text-slate-500 hover:text-[#0b1c30]" onClick={() => { setSel([]); setPanel(null); }}>Deselect ({sel.length})</button>
            <span className="ml-auto text-[11px] font-mono text-slate-500">
              Selected: <span className={tone(selSum.net)}>{money(selSum.net)}</span> net · cashback <span className="text-emerald-600">{plain(selSum.cb)}</span> · {selSum.pts} pts · fees {plain(selSum.fees)}
            </span>
          </>
        ) : (
          <>
            <span className="text-[11px] text-slate-500">Tick trades to tag, move to another broker, export or delete them.</span>
            <button type="button" className={`${btn} ml-auto`} onClick={exportCsv}>Export all</button>
            <button type="button" className="px-3 py-1.5 rounded-lg bg-[#5338ec] hover:bg-[#4326d8] text-xs font-semibold text-white" onClick={onNew}>New trade</button>
          </>
        )}
      </div>

      {hasSel && panel === 'tag' && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg bg-white border border-slate-200 p-3">
          <input autoFocus value={tagText} onChange={(e) => setTagText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && applyTag()} placeholder="Tag name, e.g. NY_Open" className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-[#0b1c30] placeholder:text-slate-400 w-56" />
          <button type="button" className={btn} onClick={applyTag} disabled={!tagText.trim()}>Add tag to {sel.length}</button>
          <button type="button" className="text-xs text-slate-500 hover:text-[#0b1c30]" onClick={() => setPanel(null)}>Cancel</button>
        </div>
      )}
      {hasSel && panel === 'move' && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg bg-white border border-slate-200 p-3">
          <label className="text-xs text-slate-500" htmlFor="tl-move">Move to broker</label>
          <select id="tl-move" value={moveTo} onChange={(e) => setMoveTo(e.target.value)} className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-[#0b1c30]">
            <option value="">Unassigned</option>
            {brokers.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <button type="button" className={btn} onClick={applyMove}>Move {sel.length}</button>
          <span className="text-[10px] text-slate-500">Cashback is re-estimated from the new broker's rate.</span>
          <button type="button" className="text-xs text-slate-500 hover:text-[#0b1c30] ml-auto" onClick={() => setPanel(null)}>Cancel</button>
        </div>
      )}
      {hasSel && panel === 'delete' && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg bg-rose-50 border border-rose-200 p-3">
          <span className="text-xs text-rose-600">Delete {sel.length} trade{sel.length === 1 ? '' : 's'} from the journal? This can't be undone.</span>
          <button type="button" className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white" onClick={applyDelete}>Delete {sel.length}</button>
          <button type="button" className="text-xs text-slate-700 hover:text-rose-700" onClick={() => setPanel(null)}>Cancel</button>
        </div>
      )}

      {preset && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg bg-[#F8F7FF] border border-[#5338ec]/30 px-3 py-2 text-xs">
          <span className="font-bold text-[#5338ec]">Drill-down from Insights:</span>
          <span className="text-[#0b1c30]">{preset.label} · {rows.length}/{preset.ids.length} linked trades in current journal scope. Saved Log subfilters are paused.</span>
          <button type="button" onClick={onClearPreset} className="ml-auto font-semibold text-[#474556] hover:underline">Show all trades</button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <input disabled={!!preset} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Filter symbols, tags, playbooks, brokers..." aria-label="Filter trades" className="flex-1 min-w-[220px] max-w-md h-9 bg-white border border-slate-200 rounded-lg px-3 text-xs text-[#0b1c30] placeholder:text-slate-400" />
        <button type="button" disabled={!!preset} aria-pressed={needsReview} onClick={() => { setNeedsReview(v => !v); setPage(1); }} className={btn}>Needs Review ({entries.filter(e => reviewStateOf(e) !== 'complete').length})</button>
        <label className="flex items-center gap-2 h-9 rounded-lg bg-white border border-slate-200 px-3 text-[10px] font-bold tracking-wide text-slate-500">
          GROUP:
          <select value={groupBy} onChange={(e) => setGroupBy(e.target.value as GroupBy)} className="bg-transparent text-xs font-semibold text-[#0b1c30] focus:outline-none">
            <option value="none" className="text-black">All</option>
            <option value="day">Day</option><option value="week">Week</option><option value="tradingStatus">Trading status</option>
            <option value="instrument" className="text-black">Instrument</option>
            <option value="broker" className="text-black">Broker</option>
            <option value="playbook" className="text-black">Playbook</option>
            <option value="side" className="text-black">Side</option>
            <option value="outcome" className="text-black">Outcome</option>
          </select>
        </label>
        <select disabled={!!preset} value={fOutcome} onChange={(e) => setFOutcome(e.target.value)} aria-label="Outcome" className="h-9 bg-white border border-slate-200 rounded-lg px-3 text-xs font-semibold text-[#0b1c30]">
          <option value="all" className="text-black">Any outcome</option>
          <option value="win" className="text-black">Wins</option>
          <option value="loss" className="text-black">Losses</option>
          <option value="breakeven" className="text-black">Breakeven</option>
        </select>
        <select disabled={!!preset} value={fTradingStatus} onChange={(e) => setFTradingStatus(e.target.value as typeof fTradingStatus)} aria-label="Trading status" className="h-9 bg-white border border-slate-200 rounded-lg px-3 text-xs font-semibold text-[#0b1c30]">
          <option value="all">Any trading status</option>
          <option value="planned">Planned</option>
          <option value="open">Open</option>
          <option value="closed">Closed</option>
        </select>
        {filterMenu('market', 'Market type', marketOpts, marketOff, setMarketOff)}
        {filterMenu('broker', 'Broker', brokerOpts, brokerOff, setBrokerOff)}
        <div className="relative">
          <button type="button" aria-expanded={colsOpen} onClick={() => { setOpenMenu(null); setColsOpen((o) => !o); }} className={btn}>Columns ({cols.length}/{COLS.length})</button>
          {colsOpen && (
            <div className="absolute z-20 mt-2 w-56 rounded-xl bg-white border border-slate-200 shadow-2xl p-2 max-h-72 overflow-y-auto">
              {COLS.map((c) => (
                <label key={c.key} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-100 text-xs text-[#0b1c30] cursor-pointer">
                  <input type="checkbox" checked={colOn(c.key)} disabled={colOn(c.key) && cols.length <= 3} onChange={() => setCols((cs) => (cs.includes(c.key) ? cs.filter((k) => k !== c.key) : COLS.map((x) => x.key).filter((k) => k === c.key || cs.includes(k))))} />
                  {c.label}
                </label>
              ))}
              <button type="button" className="w-full text-left px-2 py-1.5 text-[11px] font-semibold text-[#5338ec] hover:underline" onClick={() => setCols(COLS.filter((c) => c.defaultOn).map((c) => c.key))}>Reset columns</button>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-[#e2e8f0]">
        <table className="w-full text-xs">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="w-10 px-3 py-2.5">
                <input type="checkbox" aria-label="Select all on this page" checked={allVisibleSelected} ref={(el) => { if (el) el.indeterminate = !allVisibleSelected && someVisibleSelected; }} onChange={toggleAll} />
              </th>
              {shownCols.map((c) => (
                <th key={c.key} aria-sort={sort.key === c.key ? (sort.dir === 'asc' ? 'ascending' : 'descending') : undefined} className={`px-3 py-2.5 font-semibold whitespace-nowrap ${c.align === 'right' ? 'text-right' : 'text-left'}`}>
                  {c.sortable ? (
                    <button type="button" onClick={() => toggleSort(c.key)} className="hover:text-[#0b1c30] font-semibold">
                      {c.label} <span aria-hidden="true" className={sort.key === c.key ? 'text-[#5338ec]' : 'text-slate-300'}>{sort.key === c.key ? (sort.dir === 'asc' ? '▲' : '▼') : '↕'}</span>
                    </button>
                  ) : c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {groups.map((g) => (
              <React.Fragment key={g.key || 'all'}>
                {groupBy !== 'none' && (() => {
                  const s = sum(g.list);
                  return (
                    <tr className="bg-slate-50 border-t border-[#e2e8f0]">
                      <td colSpan={shownCols.length + 1} className="px-3 py-2 text-[11px] font-bold text-slate-700 capitalize">
                        {g.key} <span className="font-normal text-slate-500">· {s.n} trade{s.n === 1 ? '' : 's'} · </span>
                        <span className={`font-mono ${tone(s.net)}`}>{money(s.net)}</span>
                        <span className="font-normal text-slate-500"> · cashback </span><span className="font-mono text-emerald-600">{plain(s.cb)}</span>
                        <span className="font-normal text-slate-500"> · </span><span className="font-mono text-violet-600">{s.pts} pts</span>
                      </td>
                    </tr>
                  );
                })()}
                {g.list.map((e) => {
                  const on = sel.includes(e.id);
                  return (
                    <tr key={e.id} tabIndex={0} aria-label={`Review ${e.symbol} ${e.date}`} onKeyDown={ev => { if (ev.key === 'Enter') onOpen(e.id, sorted.map(x=>x.id)); }} onClick={() => onOpen(e.id, sorted.map(x=>x.id))} className={`border-t border-[#e2e8f0] cursor-pointer focus:outline-2 focus:outline-[#5338ec] ${on ? 'bg-[#EEF0FE]' : 'hover:bg-slate-50'}`}>
                      <td className="px-3 py-2.5" onClick={(ev) => ev.stopPropagation()}>
                        <input type="checkbox" aria-label={`Select ${e.symbol} ${e.date}`} checked={on} onChange={() => toggleRow(e.id)} />
                      </td>
                      {shownCols.map((c) => cell(e, c.key))}
                    </tr>
                  );
                })}
              </React.Fragment>
            ))}
            {visible.length === 0 && (
              <tr><td colSpan={shownCols.length + 1} className="px-3 py-12 text-center text-slate-500">No trades match these filters.</td></tr>
            )}
          </tbody>
          {sorted.length > 0 && (
            <tfoot className="bg-slate-50 border-t-2 border-slate-200">
              <tr>
                <td className="px-3 py-2" />
                {shownCols.map((c, i) => (i === 0 ? <td key={c.key} className="px-3 py-2 font-bold text-[#0b1c30] whitespace-nowrap">Σ Total ({total.n})</td> : totalCell(c.key, total)))}
              </tr>
              {hasSel && (
                <tr>
                  <td className="px-3 py-2" />
                  {shownCols.map((c, i) => (i === 0 ? <td key={c.key} className="px-3 py-2 font-bold text-[#5338ec] whitespace-nowrap">Σ Selected ({selSum.n})</td> : totalCell(c.key, selSum)))}
                </tr>
              )}
            </tfoot>
          )}
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
        <span>Showing <b className="text-[#0b1c30]">{sorted.length ? (curPage - 1) * perPage + 1 : 0}–{Math.min(curPage * perPage, sorted.length)}</b> of <b className="text-[#0b1c30]">{sorted.length}</b> executions</span>
        <label className="flex items-center gap-1.5 font-bold tracking-wide">
          PER PAGE:
          <select value={perPage} onChange={(e) => setPerPage(Number(e.target.value))} className="bg-white border border-slate-200 rounded-md px-2 py-1 text-[#0b1c30]">
            {[10, 25, 50].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>
        <span className="hidden lg:inline text-slate-500">Net of commissions · cashback and points are estimates</span>
        <div className="ml-auto flex items-center gap-1" role="navigation" aria-label="Pagination">
          <button type="button" aria-label="Previous page" disabled={curPage <= 1} onClick={() => setPage(curPage - 1)} className="w-7 h-7 rounded-md border border-slate-200 bg-white disabled:opacity-40">‹</button>
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <button key={p} type="button" aria-current={p === curPage ? 'page' : undefined} onClick={() => setPage(p)} className={`w-7 h-7 rounded-md border text-xs font-semibold ${p === curPage ? 'bg-[#5338ec] border-[#5338ec] text-[#0b1c30]' : 'border-slate-200 bg-white text-slate-700'}`}>{p}</button>
          ))}
          <button type="button" aria-label="Next page" disabled={curPage >= pages} onClick={() => setPage(curPage + 1)} className="w-7 h-7 rounded-md border border-slate-200 bg-white disabled:opacity-40">›</button>
        </div>
      </div>
    </div>
  );
};

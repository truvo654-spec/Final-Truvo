import React, { useEffect, useMemo, useState } from 'react';
import { Search, Lock, X, ArrowUp, ArrowDown, NotebookPen, Tag, Link2, PenLine, ChevronsUpDown } from 'lucide-react';
import { PortfolioTrade, PortfolioAssetClass } from '../../types';
import { PortfolioCtx } from './portfolioContext';
import { Card, PLAN_RANK, money, signedMoney } from './portfolioUi';
import { durationH, isClosed, rOf } from './portfolioMath';
import { AddManualTradeModal } from './AddManualTradeModal';
import { PORTFOLIO_NOW } from '../../data/portfolioData';

type SortKey = 'date' | 'pnl' | 'size' | 'duration';

const RISK_STYLE: Record<string, string> = {
  'high-risk': 'bg-rose-50 text-rose-600',
  'high-reward': 'bg-[#F0FCB1] text-[#323B01]',
  'low-risk': 'bg-slate-100 text-slate-500',
};

const fmtDur = (h: number) => (h < 1 ? `${Math.round(h * 60)}m` : h < 48 ? `${h.toFixed(1)}h` : `${(h / 24).toFixed(1)}d`);
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

export const PortfolioTrades: React.FC<{ ctx: PortfolioCtx; selectedId: string | null; onSelect: (id: string | null) => void; addRequest?: boolean; onAddConsumed?: () => void }> = ({
  ctx,
  selectedId,
  onSelect,
  addRequest = false,
  onAddConsumed,
}) => {
  const rank = PLAN_RANK[ctx.plan];
  const [search, setSearch] = useState('');
  const [asset, setAsset] = useState<'All' | PortfolioAssetClass>('All');
  const [method, setMethod] = useState<'All' | 'manual' | 'api'>('All');
  const [outcome, setOutcome] = useState<'All' | 'win' | 'loss' | 'neutral' | 'open'>('All');
  const [broker, setBroker] = useState('All');
  const [instrument, setInstrument] = useState('All');
  const [risk, setRisk] = useState('All');
  const [strategy, setStrategy] = useState('All');
  const [sort, setSort] = useState<SortKey>('date');
  const [dir, setDir] = useState<1 | -1>(-1);
  const [addOpen, setAddOpen] = useState(false);
  const [shown, setShown] = useState(20);
  useEffect(() => {
    if (addRequest) {
      setAddOpen(true);
      onAddConsumed?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addRequest]);

  const instruments = useMemo(() => Array.from(new Set(ctx.trades.map((t) => t.symbol))).sort(), [ctx.trades]);
  const strategies = useMemo(() => Array.from(new Set(ctx.trades.map((t) => t.strategyTag).filter(Boolean))) as string[], [ctx.trades]);

  const list = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = ctx.trades.filter((t) => {
      if (q && !(t.symbol.toLowerCase().includes(q) || t.broker.toLowerCase().includes(q) || (t.strategyTag || '').toLowerCase().includes(q))) return false;
      if (rank >= 1) {
        if (asset !== 'All' && t.assetClass !== asset) return false;
        if (method !== 'All' && t.inputMethod !== method) return false;
        if (broker !== 'All' && t.broker !== broker) return false;
        if (instrument !== 'All' && t.symbol !== instrument) return false;
        if (outcome === 'open' && isClosed(t)) return false;
        if (outcome === 'neutral' && !(isClosed(t) && t.outcome === 'neutral')) return false;
        if ((outcome === 'win' || outcome === 'loss') && t.outcome !== outcome) return false;
        if (risk !== 'All' && t.riskTag !== risk) return false;
        if (strategy !== 'All' && t.strategyTag !== strategy) return false;
      }
      return true;
    });
    const val = (t: PortfolioTrade) =>
      sort === 'date' ? Date.parse(t.closedAt || t.openedAt) : sort === 'pnl' ? t.pnl : sort === 'size' ? t.size : durationH(t);
    return [...filtered].sort((a, b) => (val(a) - val(b)) * dir);
  }, [ctx.trades, search, asset, method, outcome, broker, instrument, risk, strategy, sort, dir, rank]);

  const net = list.filter(isClosed).reduce((a, t) => a + t.pnl, 0);
  const selected = selectedId ? ctx.allTrades.find((t) => t.id === selectedId) : null;
  const hidden = ctx.allTrades.length - ctx.trades.length;

  const head = (label: string, key?: SortKey, className = '') => (
    <button
      onClick={() => {
        if (!key) return;
        if (sort === key) setDir((d) => (d === 1 ? -1 : 1));
        else {
          setSort(key);
          setDir(-1);
        }
      }}
      className={`flex items-center gap-1 text-xs font-bold text-[#474556] ${key ? 'hover:text-[#5338ec]' : 'cursor-default'} ${className}`}
    >
      {label}
      {key && <ChevronsUpDown className={`w-3 h-3 ${sort === key ? 'text-[#5338ec]' : 'text-slate-300'}`} />}
    </button>
  );

  const sel = 'text-xs font-semibold border border-slate-200 rounded-full px-3.5 py-2 bg-white disabled:opacity-40';

  return (
    <div>
      {hidden > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#F8F7FF] border border-[#ECEEFA] rounded-2xl px-5 py-3 mb-5">
          <span className="text-sm font-medium text-[#0b1c30]">
            Your plan shows the last {ctx.historyDays} days. {hidden} older trades are hidden.
          </span>
          <button onClick={ctx.upgrade} className="bg-[#5338ec] hover:bg-[#4326d8] text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors">
            See plans
          </button>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 mb-5">
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search symbol, account or strategy" className="w-full border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5338ec]/30" />
        </div>
        <select disabled={rank < 1} value={asset} onChange={(e) => setAsset(e.target.value as typeof asset)} className={sel}>
          <option value="All">All assets</option>
          {['Forex', 'Crypto', 'Stocks', 'Commodity', 'Indices'].map((a) => <option key={a}>{a}</option>)}
        </select>
        <select disabled={rank < 1} value={method} onChange={(e) => setMethod(e.target.value as typeof method)} className={sel}>
          <option value="All">Manual &amp; API</option>
          <option value="manual">Manual only</option>
          <option value="api">API-synced only</option>
        </select>
        <select disabled={rank < 1} value={broker} onChange={(e) => setBroker(e.target.value)} className={sel}>
          <option value="All">All brokers</option>
          {ctx.accounts.map((a) => <option key={a.id} value={a.name}>{a.name}</option>)}
        </select>
        <select disabled={rank < 1} value={instrument} onChange={(e) => setInstrument(e.target.value)} className={sel}>
          <option value="All">Any instrument</option>
          {instruments.map((i) => <option key={i}>{i}</option>)}
        </select>
        <select disabled={rank < 1} value={outcome} onChange={(e) => setOutcome(e.target.value as typeof outcome)} className={sel}>
          <option value="All">Any outcome</option>
          <option value="win">Wins</option>
          <option value="loss">Losses</option>
          <option value="neutral">Neutral (break-even)</option>
          <option value="open">Open</option>
        </select>
        <select disabled={rank < 1} value={risk} onChange={(e) => setRisk(e.target.value)} className={sel}>
          <option value="All">Any risk tag</option>
          <option value="high-risk">High risk</option>
          <option value="high-reward">High reward</option>
          <option value="low-risk">Low risk</option>
        </select>
        <select disabled={rank < 1} value={strategy} onChange={(e) => setStrategy(e.target.value)} className={sel}>
          <option value="All">Any strategy</option>
          {strategies.map((s) => <option key={s}>{s}</option>)}
        </select>
        {rank < 1 && (
          <button onClick={ctx.upgrade} className="flex items-center gap-1 text-xs font-semibold text-[#5338ec]">
            <Lock className="w-3.5 h-3.5" /> Smart filters need Intermediate
          </button>
        )}
      </div>

      <div className="flex items-center justify-between mb-3 text-xs text-[#474556]">
        <span>{list.length} trades</span>
        <span>Net closed P&amp;L <span className={`font-mono font-bold ${net >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{signedMoney(net)}</span></span>
      </div>

      <Card className="overflow-hidden">
        <div className="hidden md:grid grid-cols-[88px_minmax(0,1.3fr)_64px_72px_minmax(0,1.2fr)_76px_64px_92px_minmax(0,1fr)] gap-3 px-5 py-3 border-b border-[#e2e8f0] bg-[#fafbfe]">
          {head('Date', 'date')}
          {head('Symbol')}
          {head('Side')}
          {head('Size', 'size')}
          {head('Entry → Exit')}
          {head('Held', 'duration')}
          {head('R')}
          {head('P&L', 'pnl', 'justify-end')}
          {head('Tags')}
        </div>
        {list.slice(0, shown).map((t) => (
          <button
            key={t.id}
            onClick={() => onSelect(t.id)}
            className={`w-full text-left grid grid-cols-1 md:grid-cols-[88px_minmax(0,1.3fr)_64px_72px_minmax(0,1.2fr)_76px_64px_92px_minmax(0,1fr)] gap-x-3 gap-y-1 items-center px-5 py-3 border-b border-[#f1f5f9] hover:bg-[#f8f9fc] transition-colors ${selectedId === t.id ? 'bg-[#F8F7FF]' : ''}`}
          >
            <span className="text-xs text-[#474556]">{fmtDate(t.closedAt || t.openedAt)}</span>
            <span className="min-w-0">
              <span className="block text-sm font-bold text-[#0b1c30] truncate">{t.symbol}</span>
              <span className="flex items-center gap-1 text-[11px] text-[#94a3b8]">
                {t.inputMethod === 'api' ? <Link2 className="w-3 h-3" /> : <PenLine className="w-3 h-3" />} {t.broker}
              </span>
            </span>
            <span className={`text-xs font-bold ${t.direction === 'BUY' ? 'text-emerald-600' : 'text-rose-600'}`}>{t.direction}</span>
            <span className="text-xs font-mono text-[#474556]">{t.size}</span>
            <span className="text-xs font-mono text-[#474556] truncate">{t.entryPrice} → {t.exitPrice ?? 'open'}</span>
            <span className="text-xs font-mono text-[#474556]">{fmtDur(durationH(t))}</span>
            <span className={`text-xs font-mono font-bold ${isClosed(t) ? (rOf(t) > 0 ? 'text-emerald-600' : rOf(t) < 0 ? 'text-rose-600' : 'text-slate-500') : 'text-slate-300'}`}>
              {isClosed(t) ? `${rOf(t) > 0 ? '+' : ''}${rOf(t).toFixed(1)}R` : '—'}
            </span>
            <span className={`text-sm font-bold font-mono md:text-right ${t.pnl >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{signedMoney(t.pnl)}</span>
            <span className="flex flex-wrap gap-1">
              {!isClosed(t) ? (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700">Open</span>
              ) : t.outcome === 'win' ? (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-600">Win</span>
              ) : t.outcome === 'loss' ? (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-600">Loss</span>
              ) : (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-500">Even</span>
              )}
              {t.riskTag && <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${RISK_STYLE[t.riskTag]}`}>{t.riskTag.replace('-', ' ')}</span>}
              {t.strategyTag && rank >= 2 && <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#EEF0FE] text-[#5338ec]">{t.strategyTag}</span>}
            </span>
          </button>
        ))}
        {list.length === 0 && <div className="py-16 text-center text-sm text-[#474556]">No trades match these filters.</div>}
        {list.length > shown && (
          <button onClick={() => setShown((n) => n + 20)} className="w-full py-3.5 text-sm font-semibold text-[#5338ec] hover:bg-[#F8F7FF] transition-colors">
            Show more ({list.length - shown} left)
          </button>
        )}
      </Card>

      {/* Detail drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/30 backdrop-blur-xs" onClick={() => onSelect(null)}>
          <div className="w-full max-w-md bg-white h-full shadow-2xl overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-5">
              <div>
                <h3 className="text-xl font-display font-bold text-[#0b1c30] flex items-center gap-2">
                  {selected.symbol}
                  <span className={`flex items-center text-sm font-bold ${selected.direction === 'BUY' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {selected.direction === 'BUY' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />} {selected.direction}
                  </span>
                </h3>
                <p className="text-xs text-[#94a3b8] mt-0.5">{selected.broker} · {selected.assetClass} · {selected.inputMethod === 'api' ? 'Synced from broker' : 'Logged manually'}</p>
              </div>
              <button onClick={() => onSelect(null)} className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100"><X className="w-4 h-4" /></button>
            </div>

            <div className={`rounded-2xl p-5 mb-5 ${selected.pnl >= 0 ? 'bg-emerald-50' : 'bg-rose-50'}`}>
              <p className="text-xs font-semibold text-[#474556] mb-1">{isClosed(selected) ? 'Realized P&L' : 'Unrealized P&L'}</p>
              <p className={`text-3xl font-bold font-mono ${selected.pnl >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{signedMoney(selected.pnl)}</p>
              {isClosed(selected) && <p className="text-xs font-semibold text-[#474556] mt-1">{rOf(selected) > 0 ? '+' : ''}{rOf(selected).toFixed(1)}R</p>}
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5 text-sm">
              {[
                ['Entry', String(selected.entryPrice)],
                ['Exit', selected.exitPrice === null ? 'Open' : String(selected.exitPrice)],
                ['Size', `${selected.size} lots`],
                ['Held', fmtDur(durationH(selected))],
                ['Opened', new Date(selected.openedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })],
                ['Closed', selected.closedAt ? new Date(selected.closedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'],
              ].map(([k, v]) => (
                <div key={k} className="bg-slate-50 rounded-xl p-3">
                  <p className="text-[11px] text-[#474556] mb-0.5">{k}</p>
                  <p className="font-bold font-mono text-[#0b1c30]">{v}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 mb-5">
              {selected.strategyTag && <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#EEF0FE] text-[#5338ec] text-xs font-semibold"><Tag className="w-3 h-3" />{selected.strategyTag}</span>}
              {selected.riskTag && <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${RISK_STYLE[selected.riskTag]}`}>{selected.riskTag.replace('-', ' ')}</span>}
              <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-semibold">{(PORTFOLIO_NOW - Date.parse(selected.openedAt)) / 86400000 < 1 ? 'Today' : `${Math.round((PORTFOLIO_NOW - Date.parse(selected.openedAt)) / 86400000)}d ago`}</span>
            </div>

            <div className="mb-5">
              <p className="text-xs font-bold uppercase tracking-wide text-[#474556] mb-2">Analyst note</p>
              {rank >= 2 ? (
                <p className="text-sm text-[#0b1c30] leading-relaxed bg-[#F8F7FF] rounded-xl p-3.5">
                  {selected.analystNote || 'No analyst note is attached to this trade.'}
                </p>
              ) : (
                <button onClick={ctx.upgrade} className="flex items-center gap-1.5 text-xs font-bold text-[#5338ec]"><Lock className="w-3.5 h-3.5" /> Analyst notes are on Premium</button>
              )}
            </div>

            <div className="flex gap-3">
              <button onClick={() => ctx.navigate('trading-journal')} className="flex-1 flex items-center justify-center gap-1.5 bg-[#5338ec] hover:bg-[#4326d8] text-white text-sm font-semibold py-2.5 rounded-xl transition-colors">
                <NotebookPen className="w-4 h-4" /> Journal this trade
              </button>
              {selected.inputMethod === 'manual' && (
                <button
                  onClick={() => {
                    ctx.setAllTrades((p) => p.filter((t) => t.id !== selected.id));
                    onSelect(null);
                    ctx.toast('Trade removed');
                  }}
                  className="px-4 border border-slate-200 text-sm font-semibold text-slate-500 hover:text-rose-500 rounded-xl"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {addOpen && (
        <AddManualTradeModal
          brokers={ctx.accounts.map((a) => a.name)}
          onClose={() => setAddOpen(false)}
          onSubmit={(t) => {
            const calc = t.exitPrice ? Math.round((t.direction === 'BUY' ? t.exitPrice - t.entryPrice : t.entryPrice - t.exitPrice) * t.size * 100 * 100) / 100 : 0;
            const pnl = t.result !== null && t.result !== undefined ? t.result : calc;
            const now = new Date(PORTFOLIO_NOW).toISOString();
            const nt: PortfolioTrade = {
              id: `ptr_manual_${Date.now()}`,
              broker: t.broker,
              inputMethod: 'manual',
              assetClass: t.assetClass,
              symbol: t.symbol,
              direction: t.direction,
              entryPrice: t.entryPrice,
              exitPrice: t.exitPrice,
              size: t.size,
              pnl,
              isRealized: !!t.exitPrice,
              outcome: pnl > 0 ? 'win' : pnl < 0 ? 'loss' : 'neutral',
              openedAt: now,
              closedAt: t.exitPrice ? now : null,
            };
            ctx.setAllTrades((p) => [nt, ...p]);
            setAddOpen(false);
            ctx.toast('Trade logged to your portfolio');
          }}
        />
      )}
    </div>
  );
};

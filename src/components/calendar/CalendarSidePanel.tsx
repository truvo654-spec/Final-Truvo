import React, { useMemo, useState } from 'react';
import {
  BarChart3,
  Sparkles,
  Star,
  Bell,
  TrendingUp,
  Newspaper,
  Wrench,
  Lock,
  X,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { EconomicEvent, Broker } from '../../types';
import { instruments } from '../analysis/detail/mockMarket';
import { INITIAL_BROKERS } from '../../data/mockData';
import { CommunityBrokerAdWidget } from '../community/CommunityBrokerAdWidget';
import { IMPACT_STYLES } from '../../data/economicCalendarData';

export type SidePanel = 'markets' | 'ai' | 'watchlist' | 'alerts';

type MarketTab = 'Forex' | 'Commodities' | 'Crypto' | 'Stocks';
type Period = '1D' | '1W' | '1M' | '6M' | '1Y' | '5Y' | 'Max';

const MARKET_TABS: MarketTab[] = ['Forex', 'Commodities', 'Crypto', 'Stocks'];
const PERIODS: Period[] = ['1D', '1W', '1M', '6M', '1Y', '5Y', 'Max'];
const MARKET_FILTER: Record<MarketTab, string[]> = {
  Forex: ['Forex'],
  Commodities: ['Commodity'],
  Crypto: ['Crypto'],
  Stocks: ['US Stocks', 'Stocks'],
};

const periodChange = (change: number, return1m: number, p: Period) => {
  switch (p) {
    case '1D': return change;
    case '1W': return change * 1.8;
    case '1M': return return1m;
    case '6M': return return1m * 3.8;
    case '1Y': return return1m * 7.4;
    case '5Y': return return1m * 21;
    default: return return1m * 34;
  }
};

const fmtPrice = (n: number) =>
  n >= 1000 ? n.toLocaleString(undefined, { maximumFractionDigits: 2 }) : n >= 10 ? n.toFixed(2) : n.toFixed(4);

function seeded(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

interface CalendarSidePanelProps {
  panel: SidePanel;
  onPanelChange: (p: SidePanel) => void;
  watchedEvents: EconomicEvent[];
  alertEvents: { event: EconomicEvent; lead: number }[];
  aiEvents: EconomicEvent[];
  hasAiAccess: boolean;
  alertLimitLabel: string;
  eventWhen: (e: EconomicEvent) => string;
  onOpenEvent: (e: EconomicEvent) => void;
  onRemoveAlert: (id: string) => void;
  onUpgradePrompt: () => void;
  onNavigateToTab?: (tab: string) => void;
  onOpenConnectModal?: (broker?: Broker) => void;
}

const RAIL: { id: string; label: string; icon: React.ElementType; panel?: SidePanel; tab?: string }[] = [
  { id: 'ai', label: 'AI Assistant', icon: Sparkles, panel: 'ai' },
  { id: 'markets', label: 'Markets', icon: BarChart3, panel: 'markets' },
  { id: 'watchlist', label: 'Watchlist', icon: Star, panel: 'watchlist' },
  { id: 'alerts', label: 'Alerts', icon: Bell, panel: 'alerts' },
  { id: 'brokers', label: 'Top Brokers', icon: TrendingUp, tab: 'brokers' },
  { id: 'news', label: 'Market News', icon: Newspaper, tab: 'news' },
  { id: 'tools', label: 'Tools', icon: Wrench, tab: 'calculators' },
];

export const CalendarSidePanel: React.FC<CalendarSidePanelProps> = ({
  panel,
  onPanelChange,
  watchedEvents,
  alertEvents,
  aiEvents,
  hasAiAccess,
  alertLimitLabel,
  eventWhen,
  onOpenEvent,
  onRemoveAlert,
  onUpgradePrompt,
  onNavigateToTab,
  onOpenConnectModal,
}) => {
  const [marketTab, setMarketTab] = useState<MarketTab>('Forex');
  const [period, setPeriod] = useState<Period>('1D');
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [moversTab, setMoversTab] = useState<'active' | 'gainers' | 'losers'>('active');
  const [railVisible, setRailVisible] = useState(true);

  const rows = useMemo(
    () => instruments.filter((i) => MARKET_FILTER[marketTab].includes(i.market)).slice(0, 8),
    [marketTab]
  );
  const selected = rows.find((r) => r.symbol === selectedSymbol) || rows[0];

  const chart = useMemo(() => {
    if (!selected) return null;
    const rand = seeded(`${selected.symbol}-${period}`);
    const n = 56;
    const total = periodChange(selected.change, selected.return1m, period);
    const pts: number[] = [];
    let v = 0;
    for (let i = 0; i < n; i++) {
      v += (rand() - 0.5) * 2 + (total / n) * 0.9;
      pts.push(v);
    }
    const min = Math.min(...pts);
    const max = Math.max(...pts);
    const range = max - min || 1;
    const w = 320;
    const h = 120;
    const step = w / (n - 1);
    const coords = pts.map((p, i) => [i * step, 8 + (1 - (p - min) / range) * (h - 16)] as const);
    const line = coords.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
    const area = `0,${h} ${line} ${w},${h}`;
    return { line, area, w, h, up: total >= 0 };
  }, [selected, period]);

  const movers = useMemo(() => {
    const stocks = instruments.filter((i) => MARKET_FILTER.Stocks.includes(i.market));
    const sorted =
      moversTab === 'active'
        ? [...stocks].sort((a, b) => b.volume - a.volume)
        : moversTab === 'gainers'
        ? [...stocks].sort((a, b) => b.change - a.change)
        : [...stocks].sort((a, b) => a.change - b.change);
    return sorted.slice(0, 6);
  }, [moversTab]);

  const adBroker = INITIAL_BROKERS.find((b) => b.isTopPick) || INITIAL_BROKERS[0];

  return (
    <div className="bg-white border border-[#e2e8f0] rounded-2xl shadow-xs flex overflow-hidden">
      <div className="flex-1 min-w-0 p-3">
        {/* ───── Markets ───── */}
        {panel === 'markets' && (
          <div>
            <div className="flex items-center gap-3 border-b border-[#f1f5f9] mb-2 overflow-x-auto">
              {MARKET_TABS.map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setMarketTab(t);
                    setSelectedSymbol(null);
                  }}
                  className={`pb-1.5 text-sm font-semibold whitespace-nowrap relative transition-colors ${
                    marketTab === t
                      ? "text-[#5338ec] after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#5338ec]"
                      : 'text-[#474556] hover:text-[#0b1c30]'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2.5 mb-1.5 overflow-x-auto">
              {PERIODS.map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`text-xs font-semibold ${period === p ? 'text-[#5338ec] underline underline-offset-4' : 'text-[#474556] hover:text-[#0b1c30]'}`}
                >
                  {p}
                </button>
              ))}
            </div>

            {chart && selected && (
              <div className="mb-2">
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-xs font-bold text-[#0b1c30]">{selected.symbol}</span>
                  <span className={`text-xs font-bold font-mono ${chart.up ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {periodChange(selected.change, selected.return1m, period) >= 0 ? '+' : ''}
                    {periodChange(selected.change, selected.return1m, period).toFixed(2)}%
                  </span>
                </div>
                <svg viewBox={`0 0 ${chart.w} ${chart.h}`} className="w-full h-20">
                  <polygon points={chart.area} fill={chart.up ? 'rgba(16,185,129,0.10)' : 'rgba(244,63,94,0.10)'} />
                  <polyline points={chart.line} fill="none" stroke={chart.up ? '#10b981' : '#f43f5e'} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
                </svg>
              </div>
            )}

            <div className="divide-y divide-[#f1f5f9]">
              {rows.map((r) => {
                const chg = periodChange(r.change, r.return1m, period);
                const active = selected?.symbol === r.symbol;
                return (
                  <button
                    key={r.symbol}
                    onClick={() => setSelectedSymbol(r.symbol)}
                    className={`w-full grid grid-cols-[1fr_auto_auto] items-center gap-2 px-2 py-1.5 text-left transition-colors ${active ? 'bg-[#F8F7FF]' : 'hover:bg-slate-50'}`}
                  >
                    <span className="text-xs font-bold text-[#0b1c30] truncate">{r.symbol}</span>
                    <span className="text-xs font-mono text-[#0b1c30]">{fmtPrice(r.price)}</span>
                    <span className={`text-xs font-bold font-mono w-16 text-right ${chg >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {chg >= 0 ? '+' : ''}
                      {chg.toFixed(2)}%
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-3 pt-3 border-t border-[#f1f5f9]">
              <p className="text-sm text-[#0b1c30] leading-snug mb-2">
                Join our learning challenges and earn rewards while you study.
              </p>
              <button
                onClick={() => onNavigateToTab?.('education-hub')}
                className="w-full bg-[#5338ec] hover:bg-[#4326d8] text-white text-sm font-bold py-2 rounded-xl transition-colors"
              >
                Take the Challenge
              </button>
            </div>

            <div className="mt-3">
              <button
                onClick={() => onNavigateToTab?.('signals')}
                className="flex items-center gap-1 text-sm font-bold text-[#0b1c30] hover:text-[#5338ec] mb-1.5 transition-colors"
              >
                Market Movers <ChevronRight className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-3 border-b border-[#f1f5f9] mb-1">
                {([
                  ['active', 'Most Active'],
                  ['gainers', 'Gainers %'],
                  ['losers', 'Losers %'],
                ] as const).map(([id, label]) => (
                  <button
                    key={id}
                    onClick={() => setMoversTab(id)}
                    className={`pb-1.5 text-xs font-semibold relative transition-colors ${
                      moversTab === id
                        ? "text-[#5338ec] after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#5338ec]"
                        : 'text-[#474556]'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="divide-y divide-[#f1f5f9]">
                {movers.map((m) => (
                  <div key={m.symbol} className="grid grid-cols-[1fr_auto_auto] items-center gap-2 px-1 py-1.5">
                    <span className="text-xs font-bold text-[#0b1c30]">{m.symbol}</span>
                    <span className="text-xs font-mono text-[#0b1c30]">{fmtPrice(m.price)}</span>
                    <span className={`text-xs font-bold font-mono w-16 text-right ${m.change >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {m.change >= 0 ? '+' : ''}
                      {m.change.toFixed(2)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {adBroker && (
              <div className="mt-3 -mx-1">
                <CommunityBrokerAdWidget broker={adBroker} onOpenConnectModal={onOpenConnectModal} />
              </div>
            )}
          </div>
        )}

        {/* ───── AI Assistant ───── */}
        {panel === 'ai' && (
          <div>
            <h4 className="flex items-center gap-1.5 text-sm font-bold text-[#0b1c30] mb-1">
              <Sparkles className="w-4 h-4 text-[#5338ec]" /> AI Market Reaction Model
            </h4>
            <p className="text-xs text-[#474556] mb-4">
              Estimates how the market has tended to react to similar surprises. It is an estimate, not a guarantee.
            </p>
            <div className="space-y-3 relative">
              {aiEvents.length === 0 && <p className="text-xs text-[#94a3b8]">No supported events in this range.</p>}
              {aiEvents.map((e) => (
                <button
                  key={e.id}
                  onClick={() => onOpenEvent(e)}
                  className={`w-full text-left border border-[#e2e8f0] rounded-xl p-3 hover:border-[#5338ec] transition-colors ${hasAiAccess ? '' : 'blur-[3px] select-none'}`}
                >
                  <p className="text-xs font-bold text-[#0b1c30] mb-0.5">{e.countryFlag} {e.title}</p>
                  <p className="text-[11px] text-[#94a3b8] mb-1.5">{eventWhen(e)}</p>
                  <p className="text-xs text-[#474556] leading-relaxed line-clamp-3">{e.aiPrediction}</p>
                </button>
              ))}
              {!hasAiAccess && aiEvents.length > 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/40">
                  <button
                    onClick={onUpgradePrompt}
                    className="flex items-center gap-1.5 bg-[#5338ec] hover:bg-[#4326d8] text-white text-xs font-semibold px-4 py-2 rounded-xl"
                  >
                    <Lock className="w-3.5 h-3.5" /> Unlock AI Assistant
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ───── Watchlist ───── */}
        {panel === 'watchlist' && (
          <div>
            <h4 className="flex items-center gap-1.5 text-sm font-bold text-[#0b1c30] mb-3">
              <Star className="w-4 h-4 text-amber-500" /> Watched Events
            </h4>
            {watchedEvents.length === 0 ? (
              <p className="text-xs text-[#474556] leading-relaxed">
                Hover a row and tap the star to keep an event here, then set a reminder from the bell.
              </p>
            ) : (
              <div className="divide-y divide-[#f1f5f9]">
                {watchedEvents.map((e) => (
                  <button key={e.id} onClick={() => onOpenEvent(e)} className="w-full flex items-center justify-between gap-2 py-2.5 text-left group">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#0b1c30] group-hover:text-[#5338ec] truncate">{e.countryFlag} {e.title}</p>
                      <p className="text-[11px] text-[#94a3b8]">{eventWhen(e)}</p>
                    </div>
                    <span className={`w-2 h-2 rounded-full shrink-0 ${IMPACT_STYLES[e.impact].dot}`} />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ───── Alerts ───── */}
        {panel === 'alerts' && (
          <div>
            <h4 className="flex items-center gap-1.5 text-sm font-bold text-[#0b1c30] mb-1">
              <Bell className="w-4 h-4 text-[#5338ec]" /> Your reminders
            </h4>
            <p className="text-[11px] text-[#94a3b8] mb-3">{alertLimitLabel}</p>
            {alertEvents.length === 0 ? (
              <p className="text-xs text-[#474556] leading-relaxed">
                No reminders yet. Tap the bell on any row to get a heads-up 15 minutes before it starts.
              </p>
            ) : (
              <div className="divide-y divide-[#f1f5f9]">
                {alertEvents.map(({ event, lead }) => (
                  <div key={event.id} className="flex items-center justify-between gap-2 py-2.5">
                    <button onClick={() => onOpenEvent(event)} className="min-w-0 text-left">
                      <p className="text-xs font-bold text-[#0b1c30] truncate">{event.countryFlag} {event.title}</p>
                      <p className="text-[11px] text-[#94a3b8]">{lead} min before · {eventWhen(event)}</p>
                    </button>
                    <button onClick={() => onRemoveAlert(event.id)} aria-label="Remove reminder" className="text-slate-300 hover:text-rose-500 shrink-0">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Icon rail */}
      {railVisible ? (
        <div className="w-[76px] shrink-0 border-l border-[#f1f5f9] bg-[#fcfcfe] flex flex-col py-2">
          <button
            type="button"
            onClick={() => setRailVisible(false)}
            aria-label="Hide calendar side panel rail"
            title="Hide side panel rail"
            className="mx-auto mb-1 flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-[#5338ec]"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          {RAIL.map((r) => {
            const Icon = r.icon;
            const active = r.panel === panel;
            const aiLocked = r.id === 'ai' && !hasAiAccess;
            return (
              <button
                key={r.id}
                onClick={() => {
                  if (aiLocked) {
                    onUpgradePrompt();
                    return;
                  }
                  if (r.panel) onPanelChange(r.panel);
                  else if (r.tab) onNavigateToTab?.(r.tab);
                }}
                aria-label={aiLocked ? 'Unlock AI Assistant for Level 3 or Level 4' : r.label}
                aria-disabled={aiLocked}
                title={aiLocked ? 'AI Assistant is available at Level 3 or Level 4' : r.label}
                className={`relative flex flex-col items-center gap-1 py-3 px-1 text-[10px] font-semibold leading-tight text-center transition-colors ${
                  aiLocked
                    ? 'text-slate-400 hover:text-[#5338ec]'
                    : active ? 'text-[#5338ec]' : 'text-[#474556] hover:text-[#5338ec]'
                }`}
              >
                <Icon className={`w-5 h-5 ${aiLocked ? 'opacity-60' : ''}`} />
                {aiLocked && <Lock className="absolute right-2 top-2 h-2.5 w-2.5 text-slate-500" />}
                {r.label}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => onNavigateToTab?.('profile')}
            aria-label="Personalize your calendar"
            title="Personalize your calendar"
            className="group relative mx-1 mt-auto flex flex-col items-center gap-1 overflow-hidden rounded-xl border border-fuchsia-300/80 bg-gradient-to-b from-fuchsia-500 via-violet-600 to-indigo-700 px-1 py-3 text-[10px] font-bold leading-tight text-white shadow-[0_0_14px_rgba(168,85,247,0.7)] transition-transform hover:scale-105 animate-pulse"
          >
            <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/90 shadow-[0_0_8px_2px_rgba(255,255,255,0.9)]" />
            <Sparkles className="h-5 w-5 drop-shadow-[0_0_5px_rgba(255,255,255,0.9)]" />
            Personalize
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setRailVisible(true)}
          aria-label="Show calendar side panel rail"
          title="Show side panel rail"
          className="flex w-8 shrink-0 items-center justify-center border-l border-[#f1f5f9] bg-[#fcfcfe] text-slate-400 transition-colors hover:text-[#5338ec]"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

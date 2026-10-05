import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Link2, FlaskConical, ChevronDown } from 'lucide-react';
import { PortfolioTrade } from '../../types';
import { FolderTabs, FolderTabItem } from '../common/FolderTabs';
import {
  PORTFOLIO_ACCOUNTS,
  PORTFOLIO_TRADES,
  DEFAULT_GOALS,
  PortfolioGoal2,
} from '../../data/portfolioData';
import { PlanId, PLAN_LABEL, HISTORY_DAYS, planFromTier, PillTabs } from './portfolioUi';
import { PortfolioCtx, PortfolioRole } from './portfolioContext';
import { Timeframe, TF_DAYS, isClosed, sliceSeries, totalSeries, tradeStats, tradesInRange } from './portfolioMath';
import { PortfolioOverview } from './PortfolioOverview';
import { PortfolioTrades } from './PortfolioTrades';
import { PortfolioAnalytics } from './PortfolioAnalytics';
import { PortfolioGoals } from './PortfolioGoals';
import { PortfolioAccounts } from './PortfolioAccounts';
import { PortfolioReports } from './PortfolioReports';
import { AdvisorPanel, BrokerPanel } from './PortfolioRolePanels';

interface PortfolioTrackerPageProps {
  userTierLevel: number;
  isLoggedIn: boolean;
  isAdvisor?: boolean;
  isBroker?: boolean;
  onOpenConnectModal?: () => void;
  onUpgradePrompt: () => void;
  onShowToast: (msg: string) => void;
  onNavigateToTab?: (tab: string) => void;
  onNavigateToSignal?: (ticker: string) => void;
}

type TabId = 'overview' | 'trades' | 'analytics' | 'goals' | 'accounts' | 'reports' | 'clients' | 'engagement';

export const PortfolioTrackerPage: React.FC<PortfolioTrackerPageProps> = ({
  userTierLevel,
  isLoggedIn,
  isAdvisor = false,
  isBroker = false,
  onOpenConnectModal,
  onUpgradePrompt,
  onShowToast,
  onNavigateToTab,
  onNavigateToSignal,
}) => {
  const ownPlan = planFromTier(userTierLevel, isLoggedIn);
  const [previewPlan, setPreviewPlan] = useState<PlanId | null>(null);
  const [role, setRole] = useState<PortfolioRole>(isAdvisor ? 'advisor' : isBroker ? 'broker' : 'trader');
  const [demoOpen, setDemoOpen] = useState(false);
  const plan: PlanId = previewPlan ?? ownPlan;
  const historyDays = HISTORY_DAYS[plan];

  const [tab, setTab] = useState<TabId>('overview');
  const [accountId, setAccountId] = useState<string>('all');
  const [timeframe, setTimeframe] = useState<Timeframe>('1M');
  const [allTrades, setAllTrades] = useState<PortfolioTrade[]>(PORTFOLIO_TRADES);
  const [goals, setGoals] = useState<PortfolioGoal2[]>(DEFAULT_GOALS);
  const [selectedTradeId, setSelectedTradeId] = useState<string | null>(null);
  const [addRequest, setAddRequest] = useState(false);
  const [liveDelta, setLiveDelta] = useState(0);

  const isLive = plan === 'premium';

  // keep the chosen timeframe inside what the plan allows
  useEffect(() => {
    const allowed = (Object.keys(TF_DAYS) as Timeframe[]).filter((t) => (t === 'ALL' ? historyDays >= 9999 : TF_DAYS[t] <= historyDays));
    if (!allowed.includes(timeframe)) setTimeframe(allowed[allowed.length - 1] || '1W');
  }, [historyDays, timeframe]);

  // simulated live ticks for the real-time (Premium) experience
  useEffect(() => {
    if (!isLive) {
      setLiveDelta(0);
      return;
    }
    const id = window.setInterval(() => setLiveDelta((d) => Math.max(-180, Math.min(180, d + (Math.random() - 0.5) * 24))), 3000);
    return () => window.clearInterval(id);
  }, [isLive]);

  const accountIds = accountId === 'all' ? [] : [accountId];
  const selectedAccounts = accountId === 'all' ? PORTFOLIO_ACCOUNTS : PORTFOLIO_ACCOUNTS.filter((a) => a.id === accountId);
  const accountNames = selectedAccounts.map((a) => a.name);

  const rawSeries = useMemo(() => totalSeries(accountIds), [accountId]); // eslint-disable-line react-hooks/exhaustive-deps
  const fullSeries = useMemo(() => sliceSeries(rawSeries, historyDays, historyDays), [rawSeries, historyDays]);
  const series = useMemo(() => sliceSeries(fullSeries, TF_DAYS[timeframe], historyDays), [fullSeries, timeframe, historyDays]);

  const trades = useMemo(
    () => tradesInRange(allTrades.filter((t) => accountNames.includes(t.broker)), historyDays),
    [allTrades, accountNames.join('|'), historyDays] // eslint-disable-line react-hooks/exhaustive-deps
  );
  const windowTrades = useMemo(() => tradesInRange(trades, Math.min(TF_DAYS[timeframe], historyDays)), [trades, timeframe, historyDays]);
  const stats = useMemo(() => tradeStats(windowTrades), [windowTrades]);
  const openTrades = useMemo(() => trades.filter((t) => !isClosed(t)), [trades]);
  const unrealized = openTrades.reduce((a, t) => a + t.pnl, 0) + (isLive ? liveDelta : 0);
  const marginUsed = selectedAccounts.reduce((a, c) => a + c.marginUsed, 0);

  const ctx: PortfolioCtx = {
    plan,
    role,
    accounts: PORTFOLIO_ACCOUNTS,
    accountIds,
    allTrades,
    setAllTrades,
    trades,
    windowTrades,
    openTrades,
    stats,
    unrealized,
    isLive,
    historyDays,
    timeframe,
    setTimeframe,
    series,
    fullSeries,
    rawSeries,
    goals,
    setGoals,
    marginUsed,
    upgrade: onUpgradePrompt,
    toast: onShowToast,
    navigate: (t) => onNavigateToTab?.(t),
    openSignal: (t) => onNavigateToSignal?.(t),
    openConnect: () => onOpenConnectModal?.(),
    openTrade: (id) => {
      setSelectedTradeId(id);
      setTab('trades');
    },
    setTab: (t) => setTab(t as TabId),
  };

  const tabs: FolderTabItem<TabId>[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'trades', label: 'Trades', count: trades.length },
    { id: 'analytics', label: 'Analytics' },
    { id: 'goals', label: 'Goals & Risk' },
    { id: 'accounts', label: 'Accounts' },
    { id: 'reports', label: 'Reports' },
    ...(role === 'advisor' ? [{ id: 'clients' as TabId, label: 'Client Panel' }] : []),
    ...(role === 'broker' ? [{ id: 'engagement' as TabId, label: 'Engagement' }] : []),
  ];
  const activeTab = tabs.some((t) => t.id === tab) ? tab : 'overview';

  return (
    <div className="w-full max-w-[1360px] mx-auto px-4 sm:px-8 md:px-14 py-8 sm:py-10 pb-24">
      <div className="flex flex-wrap items-start justify-between gap-5 mb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-[#0b1c30]">Portfolio Tracker</h1>
          <p className="text-sm text-[#474556] mt-1 max-w-xl">
            Every broker account and manual trade in one place: balance, P&amp;L, margin and risk.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="appearance-none text-sm font-semibold border border-slate-200 rounded-xl pl-4 pr-9 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#5338ec]/30"
            >
              <option value="all">All accounts</option>
              {PORTFOLIO_ACCOUNTS.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          <button onClick={() => setTab('accounts')} className="flex items-center gap-1.5 border border-slate-200 hover:bg-slate-50 text-sm font-semibold text-[#0b1c30] px-4 py-2.5 rounded-xl transition-colors">
            <Link2 className="w-4 h-4" /> Connect broker
          </button>
          <button
            onClick={() => {
              setTab('trades');
              setAddRequest(true);
            }}
            className="flex items-center gap-1.5 bg-[#5338ec] hover:bg-[#4326d8] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" /> Log trade
          </button>
        </div>
      </div>

      {/* Demo controls */}
      <div className="mb-5">
        <button onClick={() => setDemoOpen((v) => !v)} className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-[#94a3b8] hover:text-[#5338ec] transition-colors">
          <FlaskConical className="w-3.5 h-3.5" /> Demo controls · viewing as {PLAN_LABEL[plan]} {role}
          <ChevronDown className={`w-3 h-3 transition-transform ${demoOpen ? 'rotate-180' : ''}`} />
        </button>
        {demoOpen && (
          <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-3 border border-dashed border-[#cbd5e1] rounded-2xl px-4 py-3 bg-white/60">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#474556]">Plan</span>
              <PillTabs<'own' | PlanId>
                options={[{ id: 'own', label: `Mine (${PLAN_LABEL[ownPlan]})` }, { id: 'basic', label: 'Basic' }, { id: 'intermediate', label: 'Intermediate' }, { id: 'premium', label: 'Premium' }]}
                value={previewPlan ?? 'own'}
                onChange={(v) => {
                  setPreviewPlan(v === 'own' ? null : v);
                  setTimeframe('1M');
                }}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#474556]">Role</span>
              <PillTabs<PortfolioRole>
                options={[{ id: 'trader', label: 'Trader' }, { id: 'advisor', label: 'Advisor' }, { id: 'broker', label: 'Broker' }]}
                value={role}
                onChange={(r) => {
                  setRole(r);
                  setTab(r === 'advisor' ? 'clients' : r === 'broker' ? 'engagement' : 'overview');
                }}
              />
            </div>
            <p className="text-[11px] text-[#94a3b8]">Lets you preview each plan and role. Remove before launch.</p>
          </div>
        )}
      </div>

      <div className="mb-6">
        <FolderTabs tabs={tabs} activeTab={activeTab} onChange={(t) => setTab(t)} />
      </div>

      {activeTab === 'overview' && <PortfolioOverview ctx={ctx} />}
      {activeTab === 'trades' && <PortfolioTrades ctx={ctx} selectedId={selectedTradeId} onSelect={setSelectedTradeId} addRequest={addRequest} onAddConsumed={() => setAddRequest(false)} />}
      {activeTab === 'analytics' && <PortfolioAnalytics ctx={ctx} />}
      {activeTab === 'goals' && <PortfolioGoals ctx={ctx} />}
      {activeTab === 'accounts' && <PortfolioAccounts ctx={ctx} />}
      {activeTab === 'reports' && <PortfolioReports ctx={ctx} />}
      {activeTab === 'clients' && <AdvisorPanel toast={onShowToast} />}
      {activeTab === 'engagement' && <BrokerPanel toast={onShowToast} />}
    </div>
  );
};

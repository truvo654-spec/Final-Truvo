import React, { useState } from 'react';
import { useTone } from '../context/ToneContext';
import {
  ArrowLeft,
  ChevronRight,
  ChevronDown,
  Plus,
  Minus,
  Check,
  ShoppingBag,
  Link2,
  CandlestickChart,
  DollarSign,
  TrendingUp,
  Info,
  Sparkles,
  Download,
  ExternalLink,
  ShieldAlert,
  HelpCircle,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { UserProfile, Broker, MarketSignal } from '../types';
import { BorderBeam } from './ui/BorderBeam';


export type CashbackScenario =
  | '01-empty'
  | '02-pending'
  | '03-approved'
  | '04-trade-earn'
  | '03a-rejected'
  | '03b-archived';

interface CashbackOverviewPageProps {
  user: UserProfile;
  brokers: Broker[];
  signals: MarketSignal[];
  onOpenConnectModal: (broker?: Broker) => void;
  onOpenViewPlan: () => void;
  onNavigateToBrokers: () => void;
  onNavigateToSignals: () => void;
  onSelectSignal: (signal: MarketSignal) => void;
  onBackToDashboard?: () => void;
  onNavigateToConnectBroker?: (broker?: Broker) => void;
}

export const CashbackOverviewPage: React.FC<CashbackOverviewPageProps> = ({
  user,
  brokers,
  signals,
  onOpenConnectModal,
  onOpenViewPlan,
  onNavigateToBrokers,
  onNavigateToSignals,
  onSelectSignal,
  onBackToDashboard,
  onNavigateToConnectBroker,
}) => {
  // Scenario state: Allows user to test all 6 reference images
  const [activeScenario, setActiveScenario] = useState<CashbackScenario>('01-empty');
  const { copy } = useTone();

  // Sub-tabs for connected accounts card (Active vs Archived)
  const [accountTab, setAccountTab] = useState<'active' | 'archived'>('active');

  // Account filter in Transactions section
  const [selectedAccountId, setSelectedAccountId] = useState<string>('all');

  // FAQ Accordions (0 open by default as in reference)
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Toast for download or interactive actions
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const toggleFaq = (index: number) => {
    setOpenFaq((prev) => (prev === index ? null : index));
  };

  const handleConnectClick = (brokerName: string) => {
    const found =
      brokers.find((b) => b.name.toLowerCase().includes(brokerName.toLowerCase())) || brokers[0];
    if (onNavigateToConnectBroker) {
      onNavigateToConnectBroker(found);
    } else {
      onOpenConnectModal(found);
    }
  };

  const handleDownloadExcel = () => {
    showToast('📊 Exporting Transactions to Excel (.xlsx)...');
  };

  const handleDownloadPDF = () => {
    showToast('📄 Generating Official Cashback Statement PDF...');
  };

  // Scenario descriptions matching file names
  const scenarioOptions = [
    { id: '01-empty' as CashbackScenario, label: '01. Empty State', fileName: '01. Cashback - Empty State.png' },
    { id: '02-pending' as CashbackScenario, label: '02. Pending Approval', fileName: '02. Cashback - Pending Approval.png' },
    { id: '03-approved' as CashbackScenario, label: '03. Account Approved', fileName: '03. Cashback - Account Approved.png' },
    { id: '04-trade-earn' as CashbackScenario, label: '04. Trade & Earn', fileName: '04. Cashback - Trade & Earn.png' },
    { id: '03a-rejected' as CashbackScenario, label: '03a. Account Rejected', fileName: '03a. Cashback - Account Rejected.png' },
    { id: '03b-archived' as CashbackScenario, label: '03b. Account Archived', fileName: '03b. Cashback - Account Archived.png' },
  ];

  // Helper to switch scenario and ensure correct sub-tab
  const switchScenario = (sc: CashbackScenario) => {
    setActiveScenario(sc);
    if (sc === '03a-rejected' || sc === '03b-archived') {
      setAccountTab('archived');
    } else {
      setAccountTab('active');
    }
  };

  // 5 Connected Brokers for bottom carousel
  const bottomBrokers = [
    {
      id: 'xm',
      name: 'XM',
      maxCashback: '$8.00',
      logoBg: 'bg-black',
      renderLogo: () => (
        <div className="flex items-center justify-center font-black text-white text-base tracking-wider relative overflow-hidden">
          <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#E11928] rounded-full" />
          <span>XM</span>
        </div>
      ),
    },
    {
      id: 'hfm',
      name: 'HFM',
      maxCashback: '$8.00',
      logoBg: 'bg-black',
      renderLogo: () => (
        <div className="flex flex-col items-center justify-center leading-none">
          <span className="font-extrabold text-white text-xs tracking-tight">HFM</span>
          <span className="text-[5.5px] text-slate-400 font-bold uppercase tracking-tighter scale-90">HF MARKETS</span>
        </div>
      ),
    },
    {
      id: 'exness',
      name: 'Exness',
      maxCashback: '$8.00',
      logoBg: 'bg-[#FFCC00]',
      renderLogo: () => (
        <div className="flex items-center justify-center font-black text-black text-base tracking-tighter">
          ex
        </div>
      ),
    },
    {
      id: 'pepperstone',
      name: 'Pepperstone',
      maxCashback: '$8.00',
      logoBg: 'bg-[#0066ff]',
      renderLogo: () => (
        <div className="flex items-center justify-center font-black text-white text-base tracking-tighter">
          P
        </div>
      ),
    },
    {
      id: 'icmarkets',
      name: 'IC Markets',
      maxCashback: '$8.00',
      logoBg: 'bg-black',
      renderLogo: () => (
        <div className="flex flex-col items-center justify-center leading-none">
          <span className="font-extrabold text-[#bef264] text-xs">IC</span>
          <span className="text-[5px] text-white font-bold uppercase tracking-tighter">Markets</span>
        </div>
      ),
    },
  ];

  // Most recent signals list matching screenshot
  const recentSignalsData = [
    { ticker: 'EUR/USD', change: '+0.33%', type: 'buy', sparkColor: '#16a34a' },
    { ticker: 'GOOGL', change: '-0.11%', type: 'sell', sparkColor: '#5945F1' },
    { ticker: 'BTC/USD', change: 'Premium', type: 'upgrade', sparkColor: '#FD02B0' },
    { ticker: 'S&P 500', change: '+0.44%', type: 'buy', sparkColor: '#16a34a' },
    { ticker: 'XAU/USD', change: '+0.24%', type: 'buy', sparkColor: '#16a34a' },
  ];

  // Scenario 04 Transactions mock data
  const scenario04Transactions = [
    {
      id: 'tx-1',
      broker: 'XM',
      accountLabel: 'Account Detail - Account Number',
      lots: '2.50',
      amount: '$12,250.00',
      asset: 'XAU/USD',
      date: 'Jan 14, 2026',
    },
    {
      id: 'tx-2',
      broker: 'XM',
      accountLabel: 'Account Detail - Account Number',
      lots: '0.80',
      amount: '$1,920.40',
      asset: 'EUR/USD',
      date: 'Jan 12, 2026',
    },
    {
      id: 'tx-3',
      broker: 'XM',
      accountLabel: 'Account Detail - Account Number',
      lots: '1.20',
      amount: '$7,440.00',
      asset: 'USD/ZAR',
      date: 'Jan 10, 2026',
    },
    {
      id: 'tx-4',
      broker: 'XM',
      accountLabel: 'Account Detail - Account Number',
      lots: '0.40',
      amount: '$3,180.00',
      asset: 'BTC/USD',
      date: 'Jan 08, 2026',
    },
    {
      id: 'tx-5',
      broker: 'XM',
      accountLabel: 'Account Detail - Account Number',
      lots: '0.10',
      amount: '$1,406.40',
      asset: 'GBP/JPY',
      date: 'Jan 05, 2026',
    },
  ];

  return (
    <div className="w-full space-y-7 pb-20 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0b1c30] text-white border border-slate-700 px-4 py-3 rounded-2xl shadow-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <Sparkles className="w-4 h-4 text-[#bef264]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ─── SCENARIO SWITCHER BAR (Fulfilling User Request) ─── */}
      <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl p-3 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#5945F1] bg-[#ede9fe] px-2.5 py-1 rounded-lg">
            Scenario Preview
          </span>
          <span className="text-xs text-slate-500 hidden sm:inline">
            Switch between the 6 reference design scenarios:
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          {scenarioOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => switchScenario(opt.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                activeScenario === opt.id
                  ? 'bg-[#5338ec] text-white shadow-xs font-bold'
                  : 'bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80'
              }`}
              title={opt.fileName}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation Back */}
      {onBackToDashboard && (
        <div>
          <button
            onClick={onBackToDashboard}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-[#5945F1] transition-colors shadow-2xs cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </button>
        </div>
      )}

      {/* ─── PAGE TITLE ─── */}
      <div>
        <h1 className="text-2xl sm:text-3xl lg:text-[32px] font-black tracking-tight font-display text-[#0b1c30]">
          {copy.pageTitles.cashbackOverview}
        </h1>
      </div>

      {/* ─── TOP SECTION: 3 PANELS ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* PANEL 1: Total Cashback Card (approx 3.8 cols) */}
        <div className="lg:col-span-4 rounded-3xl bg-white border-2 border-[#FD02B0]/80 p-6 shadow-2xs flex flex-col justify-between">
          <div className="space-y-3">
            <div>
              {/* Number display */}
              {activeScenario === '04-trade-earn' ? (
                <div className="text-4xl sm:text-5xl font-black tracking-tight text-[#5945F1] font-display">
                  $26,196.<span className="text-[#FD02B0]">80</span>
                </div>
              ) : (
                <div className="text-4xl sm:text-5xl font-black tracking-tight text-[#5945F1] font-display">
                  $0.00
                </div>
              )}
              <div className="text-xs sm:text-sm font-semibold text-slate-700 mt-1">
                Your Total Cashback
              </div>
            </div>

            <div>
              <span className="text-xs font-bold text-[#2563eb]">
                5.00 Lots Traded
              </span>
            </div>

            {/* In Scenario 04: Show Broker Breakdown list */}
            {activeScenario === '04-trade-earn' && (
              <div className="pt-2 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-black text-white flex items-center justify-center font-bold text-[8px]">
                      HFM
                    </div>
                    <span className="font-bold text-slate-800">HFM</span>
                  </div>
                  <span className="font-mono font-bold text-slate-800">$10,478.72</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-black text-white flex items-center justify-center font-bold text-[9px] relative overflow-hidden">
                      <span className="absolute top-0.5 right-0.5 w-1 h-1 bg-red-600 rounded-full" />
                      XM
                    </div>
                    <span className="font-bold text-slate-800">XM</span>
                  </div>
                  <span className="font-mono font-bold text-slate-800">$7,859.04</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-[#FFCC00] text-black flex items-center justify-center font-bold text-[9px]">
                      ex
                    </div>
                    <span className="font-bold text-slate-800">Exness</span>
                  </div>
                  <span className="font-mono font-bold text-slate-800">$5,239.36</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-black text-white flex items-center justify-center font-bold text-[9px] relative">
                      <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                    </div>
                    <span className="font-bold text-slate-800">Tickmill</span>
                  </div>
                  <span className="font-mono font-bold text-slate-800">$2,619.68</span>
                </div>

                <div className="pt-2 text-right">
                  <span className="text-[10px] text-slate-400 font-mono">
                    As of Mar 5, 2026 11:35:12
                  </span>
                </div>
              </div>
            )}
          </div>

          {activeScenario !== '04-trade-earn' && (
            <div className="pt-6 border-t border-slate-100">
              <p className="text-xs text-slate-400 leading-relaxed">
                Your total cashback reflects all cashback credited from eligible trades across your connected trading accounts.
              </p>
            </div>
          )}
        </div>

        {/* PANEL 2: Onboarding or Connected Accounts (approx 4.8 cols) */}
        <div className="lg:col-span-5 rounded-3xl bg-white border border-slate-200/90 p-6 shadow-2xs flex flex-col justify-between">
          {/* SCENARIO 01: "Your cashback starts here" */}
          {activeScenario === '01-empty' && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                <div>
                  <h3 className="font-display font-extrabold text-lg text-[#0b1c30]">
                    Your cashback starts her<span className="text-[#FD02B0]">e</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    One connection away from making your trades more rewarding.
                  </p>
                </div>
                <button
                  onClick={onNavigateToBrokers}
                  className="px-3.5 py-1.5 rounded-xl bg-[#5945F1] hover:bg-[#4734dc] text-white text-xs font-bold whitespace-nowrap shadow-2xs transition-colors cursor-pointer shrink-0"
                >
                  Explore All Brokers
                </button>
              </div>

              {/* 3 Brokers Row */}
              <div className="grid grid-cols-3 gap-3 mt-4">
                {bottomBrokers.slice(0, 3).map((b) => (
                  <div
                    key={b.id}
                    className="p-3 rounded-2xl border border-slate-200/80 bg-white shadow-2xs flex flex-col items-center text-center justify-between"
                  >
                    <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-slate-900 bg-[#a3e635] px-2 py-0.5 rounded-full mb-2">
                      ✓ Verified
                    </span>

                    <div className={`w-11 h-11 rounded-xl ${b.logoBg} shadow-xs flex items-center justify-center mb-1.5`}>
                      {b.renderLogo()}
                    </div>

                    <div className="font-bold text-xs text-[#0b1c30]">
                      {b.name}
                    </div>

                    <div className="mt-1">
                      <div className="text-xs font-black text-[#5945F1] font-mono">
                        {b.maxCashback}
                      </div>
                      <div className="text-[9px] text-slate-400 font-medium">
                        Max Cashback
                      </div>
                    </div>

                    <button
                      onClick={() => handleConnectClick(b.name)}
                      className="w-full mt-2.5 py-1 px-2 rounded-lg bg-white hover:bg-[#5945F1] text-[#5945F1] hover:text-white border border-[#5945F1]/40 text-[11px] font-bold transition-all shadow-2xs cursor-pointer"
                    >
                      Connect
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SCENARIOS 02, 03, 04, 03a, 03b: Accounts Review & Status */}
          {activeScenario !== '01-empty' && (
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  {/* Scenario specific header */}
                  {activeScenario === '02-pending' || activeScenario === '03-approved' ? (
                    <h3 className="font-display font-extrabold text-lg text-[#0b1c30]">
                      Almost read<span className="text-[#FD02B0]">y</span>
                    </h3>
                  ) : activeScenario === '04-trade-earn' ? (
                    <h3 className="font-display font-extrabold text-lg text-[#0b1c30]">
                      Connect more. Earn mor<span className="text-[#FD02B0]">e</span>.
                    </h3>
                  ) : activeScenario === '03a-rejected' ? (
                    <h3 className="font-display font-extrabold text-lg text-[#0b1c30]">
                      Couldn't verify this accoun<span className="text-[#FD02B0]">t</span>
                    </h3>
                  ) : (
                    <h3 className="font-display font-extrabold text-lg text-[#0b1c30]">
                      Couldn't find this accoun<span className="text-[#FD02B0]">t</span>
                    </h3>
                  )}

                  <p className="text-xs text-slate-500 mt-0.5">
                    {activeScenario === '02-pending' || activeScenario === '03-approved'
                      ? "We're reviewing your connection. Your cashback journey starts soon."
                      : activeScenario === '04-trade-earn'
                      ? 'More connected accounts mean more opportunities to earn cashback.'
                      : activeScenario === '03a-rejected'
                      ? 'Something didn’t match. A quick review should get things back on track.'
                      : 'Looks like we couldn’t find a match. Check the account details and reconnect.'}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  {activeScenario === '04-trade-earn' && (
                    <button
                      onClick={() => handleConnectClick('HFM')}
                      className="text-[11px] font-bold text-[#5945F1] hover:underline cursor-pointer"
                    >
                      Add Trading Account
                    </button>
                  )}
                  <button
                    onClick={() => handleConnectClick('XM')}
                    className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-[#5338ec] hover:bg-[#432bd4] text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                  >
                    <span>Connect More</span>
                    <span>→</span>
                  </button>
                </div>
              </div>

              {/* Sub-tabs: Active | Archived */}
              <div className="flex items-center gap-4 border-b border-slate-200 text-xs font-semibold pt-1">
                <button
                  onClick={() => setAccountTab('active')}
                  className={`pb-2 transition-colors relative cursor-pointer ${
                    accountTab === 'active'
                      ? 'text-[#5945F1] font-bold border-b-2 border-[#5945F1]'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Active
                </button>
                <button
                  onClick={() => setAccountTab('archived')}
                  className={`pb-2 transition-colors relative flex items-center gap-1.5 cursor-pointer ${
                    accountTab === 'archived'
                      ? 'text-[#5945F1] font-bold border-b-2 border-[#5945F1]'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <span>Archived</span>
                  {(activeScenario === '03a-rejected' || activeScenario === '03b-archived') && (
                    <span className="w-4 h-4 rounded-full bg-[#5945F1] text-white text-[10px] flex items-center justify-center font-bold">
                      1
                    </span>
                  )}
                </button>
              </div>

              {/* Account list items based on active scenario */}
              <div className="space-y-3 pt-1">
                {/* 1. SCENARIO 02: XM Pending Approval */}
                {activeScenario === '02-pending' && (
                  <div className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center font-black text-xs relative">
                        <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-red-600 rounded-full" />
                        XM
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#0b1c30]">Premium</span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-600 border border-amber-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            Pending Approval
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          1100012001
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={onOpenViewPlan}
                      className="text-xs font-bold text-[#5945F1] hover:underline cursor-pointer"
                    >
                      Cashback Plan
                    </button>
                  </div>
                )}

                {/* 2. SCENARIO 03: XM Approved */}
                {activeScenario === '03-approved' && (
                  <div className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center font-black text-xs relative">
                        <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-red-600 rounded-full" />
                        XM
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#0b1c30]">Premium</span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Approved
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          1100012001
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={onOpenViewPlan}
                      className="text-xs font-bold text-[#5945F1] hover:underline cursor-pointer"
                    >
                      Cashback Plan
                    </button>
                  </div>
                )}

                {/* 3. SCENARIO 04: HFM Approved + FxPro Pending */}
                {activeScenario === '04-trade-earn' && (
                  <div className="space-y-2">
                    {/* HFM Row */}
                    <div className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-black text-white flex flex-col items-center justify-center leading-none">
                          <span className="font-extrabold text-[10px]">HFM</span>
                          <span className="text-[4px] text-slate-400">HF MARKETS</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#0b1c30]">Premium</span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Approved
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                            1100012001
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={onOpenViewPlan}
                        className="text-xs font-bold text-[#5945F1] hover:underline cursor-pointer"
                      >
                        Cashback Plan
                      </button>
                    </div>

                    {/* FxPro Row */}
                    <div className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#e52424] text-white flex flex-col items-center justify-center leading-none font-bold text-[8px]">
                          FxPro
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#0b1c30]">Raw+</span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-600 border border-amber-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                              Pending Approval
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                            1100012001
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={onOpenViewPlan}
                        className="text-xs font-bold text-[#5945F1] hover:underline cursor-pointer"
                      >
                        Cashback Plan
                      </button>
                    </div>
                  </div>
                )}

                {/* 4. SCENARIO 03a: Rejected Account */}
                {activeScenario === '03a-rejected' && (
                  <div className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center font-black text-xs relative">
                        <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-red-600 rounded-full" />
                        XM
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#0b1c30]">Premium</span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-600 border border-rose-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            Rejected ⓘ
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Account Detail
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleConnectClick('XM')}
                        className="px-3 py-1 bg-[#5338ec] hover:bg-[#432bd4] text-white rounded-lg text-xs font-semibold cursor-pointer shadow-2xs"
                      >
                        Reconnect
                      </button>
                      <button
                        onClick={() => showToast('Account removed from archived list')}
                        className="px-3 py-1 bg-white hover:bg-slate-50 border border-slate-300 text-slate-600 rounded-lg text-xs font-medium cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}

                {/* 5. SCENARIO 03b: Unavailable / Archived Account */}
                {activeScenario === '03b-archived' && (
                  <div className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center font-black text-xs relative">
                        <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-red-600 rounded-full" />
                        XM
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#0b1c30]">Premium</span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                            Unavailable ⓘ
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          1100012001
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleConnectClick('XM')}
                      className="text-xs font-bold text-[#5945F1] hover:underline cursor-pointer"
                    >
                      Go to XM
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* PANEL 3: Right Stacked Sidebar (approx 3.4 cols) */}
        <div className="lg:col-span-3 space-y-4 flex flex-col justify-between">
          {/* Card A: Rank Progression Header */}
          <div className="rounded-2xl bg-white border border-slate-200/90 p-4 shadow-2xs space-y-3">
            {/* Scenario 01: You're on the board */}
            {activeScenario === '01-empty' && (
              <>
                <div>
                  <h4 className="font-display font-extrabold text-sm text-[#0b1c30]">
                    You're on the boar<span className="text-[#FD02B0]">d.</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                    Just connect a broker and trade to unlock your next rank!
                  </p>
                </div>

                <div className="flex items-center justify-between px-2 py-1">
                  <div className="flex flex-col items-center gap-1">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#FD02B0] shadow-xs" />
                    <span className="text-[10px] font-bold text-slate-700">You</span>
                  </div>

                  <div className="flex-1 flex flex-col items-center px-2">
                    <span className="text-[9px] font-semibold text-[#84cc16]">Want this level?</span>
                    <div className="w-full border-b-2 border-dashed border-[#FD02B0]/40 my-1 relative">
                      <span className="absolute right-0 -top-1 w-1.5 h-1.5 border-t-2 border-r-2 border-[#FD02B0] rotate-45" />
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-1">
                    <span className="w-4 h-4 rounded-full border-2 border-[#5945F1] flex items-center justify-center text-[9px] font-bold text-[#5945F1]">
                      C
                    </span>
                    <span className="text-[10px] font-bold text-[#5945F1]">Climber</span>
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    onClick={onOpenViewPlan}
                    className="px-3 py-1 rounded-full border border-slate-300 hover:border-[#5945F1] text-[11px] font-bold text-slate-700 hover:text-[#5945F1] transition-colors cursor-pointer shadow-2xs"
                  >
                    View Plan
                  </button>
                </div>
              </>
            )}

            {/* Scenario 02, 03, 03a: Move up. Earn More. */}
            {(activeScenario === '02-pending' || activeScenario === '03-approved' || activeScenario === '03a-rejected') && (
              <>
                <div>
                  <h4 className="font-display font-extrabold text-sm text-[#0b1c30]">
                    Move up. Earn Mor<span className="text-[#FD02B0]">e.</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                    Keep trading to climb levels and boost cashback.
                  </p>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <div className="flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-[#5945F1] text-white flex items-center justify-center text-[9px]">
                        You
                      </span>
                      <span className="text-slate-700">Rookie</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full border-2 border-[#5945F1] flex items-center justify-center" />
                      <span className="text-[#5945F1]">Climber</span>
                    </div>
                    <span className="font-mono text-slate-500 font-normal">0/50 lots</span>
                  </div>
                  <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
                    <div className="w-0 h-full bg-[#5945F1]" />
                  </div>
                </div>

                {/* 50-Lot Bounty */}
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#0b1c30]">50-Lot Bounty</span>
                    <button
                      onClick={onOpenViewPlan}
                      className="text-[10px] text-[#5945F1] font-bold hover:underline cursor-pointer"
                    >
                      View Plan
                    </button>
                  </div>
                  <div className="space-y-0.5 text-[10px] text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <span className="text-emerald-600 font-bold">$</span>
                      <span>+10% Cashback Boost</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[#5945F1]">⚡</span>
                      <span>Higher Confidence Signals</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Scenario 04 & 03b: Staying here is boring. */}
            {(activeScenario === '04-trade-earn' || activeScenario === '03b-archived') && (
              <>
                <div>
                  <h4 className="font-display font-extrabold text-sm text-[#0b1c30]">
                    Staying here is borin<span className="text-[#FD02B0]">g.</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                    Make some trades and level up your rank automatically!
                  </p>
                </div>

                <div className="flex items-center justify-between px-1 py-1">
                  <div className="flex flex-col items-center gap-1">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#FD02B0] shadow-xs" />
                    <span className="text-[10px] font-bold text-slate-700">You</span>
                  </div>

                  <div className="flex-1 flex flex-col items-center px-1">
                    <div className="bg-[#bef264] text-slate-900 px-2 py-0.5 rounded-full text-[9px] font-black tracking-tight flex items-center gap-1 shadow-2xs">
                      <span>Just</span>
                      <span className="text-[#5945F1] font-extrabold">44 lots</span>
                      <span>and you're here!</span>
                    </div>
                    <div className="w-full border-b-2 border-dashed border-[#FD02B0]/40 my-1 relative">
                      <span className="absolute right-0 -top-1 w-1.5 h-1.5 border-t-2 border-r-2 border-[#FD02B0] rotate-45" />
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-1">
                    <span className="w-4 h-4 rounded-full border-2 border-[#5945F1] flex items-center justify-center text-[9px] font-bold text-[#5945F1]">
                      C
                    </span>
                    <span className="text-[10px] font-bold text-[#5945F1]">Climber</span>
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    onClick={onNavigateToSignals}
                    className="px-3.5 py-1 bg-[#5945F1] hover:bg-[#432bd4] text-white rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer"
                  >
                    Trade Now
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Card B: "You're Connected. Nice!" Milestone (Present in 02, 03, 04, 03a, 03b) */}
          {activeScenario !== '01-empty' && (
            <div className="rounded-2xl bg-white border border-slate-200/90 p-4 shadow-2xs space-y-2 relative">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  Achievement
                </span>
                <span className="inline-flex items-center gap-1 text-[9px] font-bold text-[#FD02B0] bg-pink-50 border border-pink-200 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FD02B0]" />
                  Next Milestone
                </span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#5945F1] text-white flex items-center justify-center font-black text-sm shadow-xs">
                    ⚡
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-[#0b1c30]">
                      You're Connected. Nice!
                    </h5>
                    <p className="text-[10px] text-slate-500">
                      Start trading to get cashback
                    </p>
                  </div>
                </div>
                <button
                  onClick={onNavigateToSignals}
                  className="px-2.5 py-1 bg-[#5945F1] hover:bg-[#432bd4] text-white text-[10px] font-bold rounded-lg shadow-2xs cursor-pointer"
                >
                  Trade Now
                </button>
              </div>

              {/* Dots carousel indicator */}
              <div className="flex items-center justify-center gap-1 pt-1">
                <span className="text-[10px] text-slate-400">&lt;</span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#5945F1]" />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                <span className="text-[10px] text-slate-400">&gt;</span>
              </div>
            </div>
          )}

          {/* Card C: Most Recent Signals */}
          <div className="rounded-2xl bg-white border border-slate-200/90 p-4 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-display font-extrabold text-xs text-[#0b1c30]">
                  Most Recent Signal<span className="text-[#FD02B0]">s.</span>
                </h4>
                <p className="text-[10px] text-slate-400">
                  View most recent signals for your trading
                </p>
              </div>
              <button
                onClick={onNavigateToSignals}
                className="text-[11px] font-bold text-slate-500 hover:text-[#5945F1] flex items-center cursor-pointer"
              >
                <span>More</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-1.5">
              {recentSignalsData.map((s) => (
                <div
                  key={s.ticker}
                  className="flex items-center justify-between py-1 px-1.5 rounded-lg hover:bg-slate-50 text-xs transition-colors"
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="font-bold text-[#0b1c30]">{s.ticker}</span>
                    {s.type !== 'upgrade' && (
                      <span
                        className={`text-[10px] font-mono font-semibold ${
                          s.change.startsWith('+') ? 'text-emerald-600' : 'text-[#5945F1]'
                        }`}
                      >
                        {s.change}
                      </span>
                    )}
                  </div>

                  {s.type === 'buy' && (
                    <button
                      onClick={onNavigateToSignals}
                      className="px-2.5 py-0.5 rounded-md bg-[#A3E635] text-slate-900 font-bold text-[10px] shadow-2xs hover:opacity-90 cursor-pointer"
                    >
                      Buy
                    </button>
                  )}
                  {s.type === 'sell' && (
                    <button
                      onClick={onNavigateToSignals}
                      className="px-2.5 py-0.5 rounded-md bg-[#5945F1] text-white font-bold text-[10px] shadow-2xs hover:opacity-90 cursor-pointer"
                    >
                      Sell
                    </button>
                  )}
                  {s.type === 'upgrade' && (
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] text-amber-600 font-bold flex items-center gap-0.5">
                        👑 Premium Signal
                      </span>
                      <button
                        onClick={onNavigateToSignals}
                        className="px-2 py-0.5 rounded-md border border-[#5945F1] text-[#5945F1] font-bold text-[10px] hover:bg-indigo-50 cursor-pointer"
                      >
                        Upgrade
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── MIDDLE SECTION: TRANSACTIONS (Scenarios 02, 03, 04, 03a, 03b) OR PURPLE BANNER (Scenario 01) ─── */}
      {activeScenario === '01-empty' ? (
        /* SCENARIO 01 PURPLE BANNER */
        <div className="rounded-3xl bg-[#5945F1] text-white p-7 sm:p-9 shadow-md space-y-6">
          <div>
            <h2 className="font-display text-xl sm:text-2xl font-black text-[#CAEB0E] tracking-tight">
              Ready To Earn Your First Cashback?
            </h2>
            <p className="text-xs sm:text-sm text-white/90 mt-1">
              A few simple steps and your cashback won't be empty for long!
            </p>
          </div>

          {/* 4 Steps Row with dotted line connectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative">
            {/* Step 1 */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full border border-white/40 flex items-center justify-center shrink-0">
                <ShoppingBag className="w-4 h-4 text-white" />
              </div>
              <div className="space-y-0.5">
                <div className="font-extrabold text-sm text-white">Choose Broker</div>
                <div className="text-xs text-white/75 leading-relaxed">
                  Pick yours, or find a better one here.
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full border border-white/40 flex items-center justify-center shrink-0">
                <Link2 className="w-4 h-4 text-white" />
              </div>
              <div className="space-y-0.5">
                <div className="font-extrabold text-sm text-white">Link Trading Account</div>
                <div className="text-xs text-white/75 leading-relaxed">
                  So we know where the trades are happening.
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full border border-white/40 flex items-center justify-center shrink-0">
                <CandlestickChart className="w-4 h-4 text-white" />
              </div>
              <div className="space-y-0.5">
                <div className="font-extrabold text-sm text-white">Trade as Usual</div>
                <div className="text-xs text-white/75 leading-relaxed">
                  Keep trading like you do, and we'll keep an eye on the cashback
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full border border-white/40 flex items-center justify-center shrink-0">
                <DollarSign className="w-4 h-4 text-white" />
              </div>
              <div className="space-y-0.5">
                <div className="font-extrabold text-sm text-white">Earn Cashback</div>
                <div className="text-xs text-white/75 leading-relaxed">
                  Start earning cashback on eligible trades automatically
                </div>
              </div>
            </div>
          </div>

          <div>
            <button
              onClick={onNavigateToBrokers}
              className="px-6 py-2 rounded-full bg-white hover:bg-slate-100 text-[#5945F1] font-bold text-xs shadow-xs transition-all cursor-pointer"
            >
              Explore All Brokers
            </button>
          </div>
        </div>
      ) : (
        /* SCENARIOS 02, 03, 04, 03a, 03b TRANSACTIONS SECTION */
        <div className="space-y-3">
          <h2 className="text-lg font-bold font-display text-[#0b1c30]">Transactions</h2>

          {/* Controls Bar: Account Filter + Downloads */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Account ID</span>
              <div className="relative">
                <select
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                  className="pl-3 pr-8 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-[#5945F1]/20 cursor-pointer shadow-2xs"
                >
                  <option value="all">All Account ID</option>
                  <option value="1100012001">1100012001 (XM)</option>
                  <option value="1100012002">1100012002 (HFM)</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadExcel}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-[#5945F1] text-xs font-bold rounded-xl shadow-2xs transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Excel</span>
              </button>
              <button
                onClick={handleDownloadPDF}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-[#5945F1] text-xs font-bold rounded-xl shadow-2xs transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>

          {/* Transactions Container */}
          {activeScenario === '04-trade-earn' ? (
            /* Scenario 04 Table */
            <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50 text-[#5945F1] font-semibold">
                      <th className="py-3 px-4 font-semibold">Cashback Form</th>
                      <th className="py-3 px-4 font-semibold">Volume (Lots)</th>
                      <th className="py-3 px-4 font-semibold">Cashback Amount</th>
                      <th className="py-3 px-4 font-semibold">Asset</th>
                      <th className="py-3 px-4 font-semibold">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {scenario04Transactions.map((t) => (
                      <tr key={t.id} className="hover:bg-indigo-50/20 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-[#0b1c30]">
                          <div className="flex items-center gap-2.5">
                            <div className="w-6 h-6 rounded-md bg-black text-white flex items-center justify-center font-bold text-[8px] relative">
                              <span className="absolute top-0.5 right-0.5 w-1 h-1 bg-red-600 rounded-full" />
                              XM
                            </div>
                            <span>{t.accountLabel}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-medium text-slate-700">
                          {t.lots}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-[#0b1c30]">
                          {t.amount}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-700">
                          {t.asset}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                          {t.date}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Scenarios 02, 03, 03a, 03b Activity Empty State */
            <div className="bg-white border border-slate-200/90 rounded-2xl p-12 text-center shadow-2xs space-y-3">
              {/* 3D Purple Open Box Graphic */}
              <div className="w-16 h-16 mx-auto relative flex items-center justify-center">
                <svg
                  className="w-16 h-16 drop-shadow-sm"
                  viewBox="0 0 80 80"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M40 8L68 24V56L40 72L12 56V24L40 8Z"
                    fill="#EDE9FE"
                    stroke="#8B5CF6"
                    strokeWidth="2"
                  />
                  <path
                    d="M40 8L68 24L40 40L12 24L40 8Z"
                    fill="#DDD6FE"
                    stroke="#7C3AED"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M40 40V72L68 56V24L40 40Z"
                    fill="#C4B5FD"
                    stroke="#7C3AED"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M12 24L40 40V72L12 56V24Z"
                    fill="#A78BFA"
                    stroke="#6D28D9"
                    strokeWidth="1.5"
                  />
                  {/* Flaps */}
                  <path
                    d="M12 24L30 16L40 24L22 32L12 24Z"
                    fill="#7C3AED"
                    opacity="0.8"
                  />
                  <path
                    d="M68 24L50 16L40 24L58 32L68 24Z"
                    fill="#6D28D9"
                    opacity="0.9"
                  />
                </svg>
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-sm text-[#0b1c30]">Activity Empty</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  Once approved, you can begin trading. Your cashback and lot data will appear here automatically after your first trade
                </p>
              </div>

              <div>
                <button
                  onClick={() => handleConnectClick('XM')}
                  className="px-5 py-2 rounded-xl bg-[#5338ec] hover:bg-[#432bd4] text-white font-bold text-xs shadow-2xs transition-colors cursor-pointer"
                >
                  Find broker to connect
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── MORE CONNECTED BROKERS (Shown in Scenarios 02, 03, 04, 03a, 03b) ─── */}
      {activeScenario !== '01-empty' && (
        <div className="rounded-3xl bg-white dark:bg-[#170345] border border-slate-200/90 dark:border-indigo-950/70 p-6 sm:p-8 shadow-2xs space-y-6 relative overflow-hidden">
          <BorderBeam
            borderWidth={2}
            duration={10}
            colorFrom="#5945F1"
            colorTo="#FD02B0"
          />
          <div className="text-center space-y-1">
            <h3 className="font-display font-black text-xl text-[#0b1c30]">
              More Connected Brokers. More Opportunitie<span className="text-[#FD02B0]">s</span>.
            </h3>
            <p className="text-xs text-slate-500">
              Connect more broker partners and give your trades more ways to earn cashback.
            </p>
          </div>

          {/* 5 Broker Cards Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {bottomBrokers.map((b) => (
              <div
                key={b.id}
                className="p-3.5 rounded-2xl border border-slate-200/80 bg-white shadow-2xs flex flex-col items-center text-center justify-between"
              >
                <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-slate-900 bg-[#a3e635] px-2 py-0.5 rounded-full mb-2">
                  ✓ Verified
                </span>

                <div className={`w-11 h-11 rounded-xl ${b.logoBg} shadow-xs flex items-center justify-center mb-1.5`}>
                  {b.renderLogo()}
                </div>

                <div className="font-bold text-xs text-[#0b1c30]">
                  {b.name}
                </div>

                <div className="mt-1">
                  <div className="text-xs font-black text-[#5945F1] font-mono">
                    {b.maxCashback}
                  </div>
                  <div className="text-[9px] text-slate-400 font-medium">
                    Max Cashback
                  </div>
                </div>

                <button
                  onClick={() => handleConnectClick(b.name)}
                  className="w-full mt-2.5 py-1 px-2 rounded-lg bg-white hover:bg-[#5945F1] text-[#5945F1] hover:text-white border border-[#5945F1]/40 text-[11px] font-bold transition-all shadow-2xs cursor-pointer"
                >
                  Connect
                </button>
              </div>
            ))}
          </div>

          <div className="text-center pt-2">
            <button
              onClick={onNavigateToBrokers}
              className="px-6 py-2 rounded-xl bg-[#5945F1] hover:bg-[#432bd4] text-white font-bold text-xs shadow-2xs transition-colors cursor-pointer"
            >
              Explore All Brokers
            </button>
          </div>
        </div>
      )}

      {/* ─── BOTTOM SECTION 1: CASHBACK ELIGIBILITY & PAYOUTS ─── */}
      <div className="space-y-3">
        <div>
          <h3 className="font-display font-extrabold text-lg text-[#0b1c30]">
            Cashback Eligibility & Payout<span className="text-[#5945F1]">s.</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Here are some quick answers to what's probably on your mind.
          </p>
        </div>

        <div className="rounded-2xl bg-white border border-[#5945F1]/30 p-5 sm:p-6 shadow-2xs space-y-2.5 text-xs text-slate-700 leading-relaxed">
          <p>1. Cashback is earned on eligible trades placed through a linked and approved broker's trading account.</p>
          <p>2. Trading activity must be validated and approved by the broker before cashback is released.</p>
          <p>3. Cashback amounts can differ based on the broker, instrument traded, account type, and your MarketSyde membership level.</p>
          <p>4. Cashback is credited directly to your trading account with the broker</p>
        </div>
      </div>

      {/* ─── BOTTOM SECTION 2: HOW CASHBACK WORKS (FAQ ACCORDIONS) ─── */}
      <div className="space-y-4">
        <div>
          <h3 className="font-display font-extrabold text-lg text-[#0b1c30]">
            How Cashback Work<span className="text-[#FD02B0]">s</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated Rebates Across All Assets. Total Transparency.
          </p>
        </div>

        <div className="space-y-2.5">
          {/* FAQ 1 */}
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
            <button
              onClick={() => toggleFaq(0)}
              className="w-full px-5 py-3.5 flex items-center justify-between text-left text-xs sm:text-sm font-bold text-[#0b1c30] hover:bg-slate-50/70 transition-colors cursor-pointer"
            >
              <span>How is my cashback generated?</span>
              {openFaq === 0 ? <Minus className="w-4 h-4 text-slate-500" /> : <Plus className="w-4 h-4 text-slate-500" />}
            </button>
            {openFaq === 0 && (
              <div className="px-5 pb-4 text-xs text-slate-600 leading-relaxed border-l-4 border-[#2563eb] ml-5 my-1">
                Cashback is generated from eligible trades placed through a connected broker account. The account must be linked correctly for trades to count.
              </div>
            )}
          </div>

          {/* FAQ 2 */}
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
            <button
              onClick={() => toggleFaq(1)}
              className="w-full px-5 py-3.5 flex items-center justify-between text-left text-xs sm:text-sm font-bold text-[#0b1c30] hover:bg-slate-50/70 transition-colors cursor-pointer"
            >
              <span>Does my cashback rate increase over time?</span>
              {openFaq === 1 ? <Minus className="w-4 h-4 text-slate-500" /> : <Plus className="w-4 h-4 text-slate-500" />}
            </button>
            {openFaq === 1 && (
              <div className="px-5 pb-4 text-xs text-slate-600 leading-relaxed border-l-4 border-[#2563eb] ml-5 my-1">
                Yes! As your trading volume grows and your tier advances from Rookie up to Master and Legend, your cashback rate receives automated boosts up to +25%.
              </div>
            )}
          </div>

          {/* FAQ 3 */}
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
            <button
              onClick={() => toggleFaq(2)}
              className="w-full px-5 py-3.5 flex items-center justify-between text-left text-xs sm:text-sm font-bold text-[#0b1c30] hover:bg-slate-50/70 transition-colors cursor-pointer"
            >
              <span>When will my cashback appear?</span>
              {openFaq === 2 ? <Minus className="w-4 h-4 text-slate-500" /> : <Plus className="w-4 h-4 text-slate-500" />}
            </button>
            {openFaq === 2 && (
              <div className="px-5 pb-4 text-xs text-slate-600 leading-relaxed border-l-4 border-[#2563eb] ml-5 my-1">
                Cashback reflects in your pending balances typically within 24 hours of trade execution once the broker syncs settlement records.
              </div>
            )}
          </div>

          {/* FAQ 4 */}
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
            <button
              onClick={() => toggleFaq(3)}
              className="w-full px-5 py-3.5 flex items-center justify-between text-left text-xs sm:text-sm font-bold text-[#0b1c30] hover:bg-slate-50/70 transition-colors cursor-pointer"
            >
              <span>When can I withdraw my cashback?</span>
              {openFaq === 3 ? <Minus className="w-4 h-4 text-slate-500" /> : <Plus className="w-4 h-4 text-slate-500" />}
            </button>
            {openFaq === 3 && (
              <div className="px-5 pb-4 text-xs text-slate-600 leading-relaxed border-l-4 border-[#2563eb] ml-5 my-1">
                Once validated at the scheduled settlement period (daily or weekly depending on your broker), earnings are ready for payout or credited straight to your balance.
              </div>
            )}
          </div>

          {/* FAQ 5 */}
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
            <button
              onClick={() => toggleFaq(4)}
              className="w-full px-5 py-3.5 flex items-center justify-between text-left text-xs sm:text-sm font-bold text-[#0b1c30] hover:bg-slate-50/70 transition-colors cursor-pointer"
            >
              <span>How do I withdraw my cashback?</span>
              {openFaq === 4 ? <Minus className="w-4 h-4 text-slate-500" /> : <Plus className="w-4 h-4 text-slate-500" />}
            </button>
            {openFaq === 4 && (
              <div className="px-5 pb-4 text-xs text-slate-600 leading-relaxed border-l-4 border-[#2563eb] ml-5 my-1">
                You can withdraw directly through your broker account payment options (Bank wire, Crypto, E-wallets) or automated internal transfer.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Broker, UserProfile, UserTierType } from '../../types';
import {
  Check,
  ArrowLeft,
  Calendar,
  Wallet,
  Building2,
  CircleDollarSign,
  Users,
} from 'lucide-react';
import { AuthModal } from '../AuthModal';
import { Tier1CashbackTab } from './tabs/Tier1CashbackTab';
import { Tier1AccountTab } from './tabs/Tier1AccountTab';
import { Tier1CompanyTab } from './tabs/Tier1CompanyTab';
import { Tier2CashbackTab } from './tabs/Tier2CashbackTab';
import { Tier2AccountTab } from './tabs/Tier2AccountTab';
import { Tier2CompanyTab } from './tabs/Tier2CompanyTab';
import { OffshoreCashbackTab } from './tabs/OffshoreCashbackTab';
import { OffshoreAccountTab } from './tabs/OffshoreAccountTab';
import { OffshoreCompanyTab } from './tabs/OffshoreCompanyTab';
import { FolderTabs } from '../common/FolderTabs';

interface BrokerDetailPageProps {
  broker: Broker;
  user: UserProfile;
  isLoggedIn?: boolean;
  onBackToBrokers: () => void;
  onNavigateToConnectBroker: (broker: Broker) => void;
  onNavigateToComparison?: () => void;
  onNavigateToRebateTable?: () => void;
  onOpenViewPlan?: () => void;
  onShowToast?: (msg: string) => void;
  onOpenSignUp?: () => void;
  onLoginSuccess?: (email?: string, name?: string) => void;
}

export const BrokerDetailPage: React.FC<BrokerDetailPageProps> = ({
  broker,
  user,
  isLoggedIn = false,
  onBackToBrokers,
  onNavigateToConnectBroker,
  onNavigateToComparison,
  onNavigateToRebateTable,
  onOpenViewPlan,
  onShowToast,
  onOpenSignUp,
  onLoginSuccess,
}) => {
  // Current user tier for the 3 tab scenarios (default tier-1 or matching broker)
  const [userTier, setUserTier] = useState<UserTierType>('tier-1');

  // Fallback internal sign up modal state
  const [isLocalSignUpModalOpen, setIsLocalSignUpModalOpen] = useState(false);

  // Cashback availability for this broker (supports toggling for interactive demo)
  const [hasCashbackProgram, setHasCashbackProgram] = useState<boolean>(
    broker.hasCashback !== false && (broker.cashbackPerLot > 0 || broker.maxCashback !== '-')
  );

  // Active Tab Scenario (Cashback, Account, Company)
  // If broker has no cashback, default to 'account'
  const [activeTab, setActiveTab] = useState<'cashback' | 'account' | 'company'>(
    broker.hasCashback !== false && (broker.cashbackPerLot > 0 || broker.maxCashback !== '-') ? 'cashback' : 'account'
  );

  // Synchronize activeTab if cashback availability changes
  useEffect(() => {
    if (!hasCashbackProgram && activeTab === 'cashback') {
      setActiveTab('account');
    }
  }, [hasCashbackProgram, activeTab]);

  // Keep state updated if broker prop changes
  useEffect(() => {
    const available = broker.hasCashback !== false && (broker.cashbackPerLot > 0 || broker.maxCashback !== '-');
    setHasCashbackProgram(available);
    if (!available) {
      setActiveTab('account');
    }
  }, [broker.id, broker.hasCashback, broker.cashbackPerLot, broker.maxCashback]);

  // Monthly Lots Interactive Slider in Top Card (matches exact screenshot default of 25)
  const [lotsPerMonth, setLotsPerMonth] = useState<number>(25);

  // User authentication state (defaults to isLoggedIn prop, togglable in scenario controls)
  const [isSignedIn, setIsSignedIn] = useState<boolean>(isLoggedIn);

  useEffect(() => {
    setIsSignedIn(isLoggedIn);
  }, [isLoggedIn]);

  // Scenario toggle: Connected to MarketSyde (default true for current user scenario)
  const [isConnectedToMarketSyde, setIsConnectedToMarketSyde] = useState<boolean>(true);

  // Exact math from reference screenshot:
  // Rate: $8.00/lot, 25 lots -> $120/mth. ($4.80/lot net reward), $1,440/yr.
  const calculatedMonthly = Math.round(lotsPerMonth * 4.8);
  const calculatedAnnual = calculatedMonthly * 12;

  const handleConnectClick = () => {
    if (isConnectedToMarketSyde) {
      onShowToast?.(`Your account #1100045789 with ${broker.name} is active and ready for trading!`);
    } else {
      onNavigateToConnectBroker(broker);
    }
  };

  const handleSeeComparison = () => {
    if (onNavigateToComparison) {
      onNavigateToComparison();
    } else {
      onBackToBrokers();
    }
  };

  // Render stylized HFM logo or broker logo
  const renderBrokerLogo = () => {
    const name = broker.name.toLowerCase();
    if (name.includes('hfm')) {
      return (
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-black flex flex-col items-center justify-center text-white shrink-0 p-1 shadow-sm">
          <div className="font-black text-xl tracking-tight leading-none flex items-center">
            <span>HF</span>
            <span className="text-red-600">M</span>
          </div>
          <span className="text-[7px] text-white/90 font-bold tracking-widest mt-0.5 uppercase">
            HF MARKETS
          </span>
        </div>
      );
    }
    return (
      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-slate-900 flex items-center justify-center text-white shrink-0 shadow-sm font-black text-xl">
        {broker.name.slice(0, 3).toUpperCase()}
      </div>
    );
  };

  // Regulation badge label based on tier
  const getTierRegulationBadgeText = () => {
    if (userTier === 'tier-1') return 'Tier 1 Regulated';
    if (userTier === 'tier-2') return 'Regulated';
    return 'Offshore';
  };

  return (
    <div id="broker-detail-page" className="w-full space-y-8 pb-20">
      {/* ─────────────────────────────────────────────────────────────
          TOP BAR: BACK BUTTON ONLY (CLEAN, NO INTRUSIVE BANNERS)
         ───────────────────────────────────────────────────────────── */}
      <div className="pt-1">
        <button
          type="button"
          onClick={onBackToBrokers}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700 hover:text-[#5945F1] transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to Partner Brokers</span>
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TOP SECTION: 2-COLUMN CARDS (EXACT MATCH TO REFERENCE IMAGE)
          Left Card: Broker Specs & Summary with magenta outline
          Right Card: Cashback with MarketSyde (Solid Purple with Lime Accent)
         ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* LEFT CARD: GRADIENT BORDER CONTAINER (7 COLS ON LG) */}
        <div className="lg:col-span-7 p-[1.5px] rounded-[24px] bg-gradient-to-br from-[#FD02B0] via-[#C084FC] to-[#818CF8] shadow-xs">
          <div className="bg-white rounded-[22.5px] p-6 sm:p-7 flex flex-col justify-between h-full space-y-4">
            {/* Top Identity Row: Logo, Name, Verified Badge, Founded */}
            <div>
              <div className="flex items-start gap-4">
                {renderBrokerLogo()}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h2 className="font-display font-bold text-2xl sm:text-[26px] text-[#0b1c30]">
                      {broker.name}
                    </h2>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#CAEB0E] text-black text-xs font-bold tracking-tight">
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Verified</span>
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 mt-1 font-medium">
                    Headquarter: {broker.headquarters || 'Cyprus'} | Founded: {broker.founded || 2009}
                  </p>
                </div>
              </div>

              {/* Highlights Pill Banner */}
              <div className="bg-[#f4f5fa] rounded-xl px-4 py-2.5 text-xs text-slate-600 mt-4">
                <span className="font-bold text-slate-900">Highlights:</span>{' '}
                {broker.name} is popular for its account flexibility and execution quality.
              </div>

              {/* Summary Section */}
              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-[#0b1c30]">Summary</h4>
                  <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#edf0fe] text-[#5945F1] text-xs font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#5945F1]" />
                    <span>{getTierRegulationBadgeText()}</span>
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 font-medium">
                  <div className="grid grid-cols-12 gap-2">
                    <span className="col-span-5 text-slate-500">• Min Deposit</span>
                    <span className="col-span-7 font-bold text-slate-800">: From $10</span>
                  </div>
                  <div className="grid grid-cols-12 gap-2">
                    <span className="col-span-5 text-slate-500">• Max Leverage</span>
                    <span className="col-span-7 font-bold text-slate-800">: Up to 1:1000</span>
                  </div>
                  <div className="grid grid-cols-12 gap-2">
                    <span className="col-span-5 text-slate-500">• Platforms</span>
                    <span className="col-span-7 font-bold text-slate-800">: MT4, MT5, Web, App</span>
                  </div>
                  <div className="grid grid-cols-12 gap-2">
                    <span className="col-span-5 text-slate-500">• Spread Type</span>
                    <span className="col-span-7 font-bold text-slate-800">: Standard, Ultra-Low, Zero Accounts</span>
                  </div>
                  <div className="grid grid-cols-12 gap-2">
                    <span className="col-span-5 text-slate-500">• Supported Currencies</span>
                    <span className="col-span-7 font-bold text-slate-800">: EUR, JPY, THB, USD, IDR, NGN</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT CARD: CASHBACK WITH MARKETSYDE (5 COLS ON LG) OR DIRECT BROKER CARD */}
        {hasCashbackProgram ? (
          <div className="lg:col-span-5 bg-[#5240F2] rounded-[24px] p-6 sm:p-7 text-white shadow-xl flex flex-col justify-between">
            <div>
              {/* Title: Cashback with MarketSyde (Exact match to hero.png) */}
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-display font-extrabold text-[22px] sm:text-2xl tracking-tight text-white">
                  Cashback with <span className="text-[#CAEB0E]">MarketSyde</span>
                </h3>
              </div>

              {/* Estimated Cashback Metric (Exact match to hero.png) */}
              <div className="flex items-center gap-4 mt-3.5">
                <div className="text-[13px] text-white/90 font-medium leading-[1.25] shrink-0">
                  <div>Estimated</div>
                  <div>cashback</div>
                </div>
                <div className="text-3xl sm:text-[38px] font-black text-[#CAEB0E] tracking-tight leading-none">
                  {broker.cashbackPerLot > 0 ? `$${broker.cashbackPerLot.toFixed(2)}/lot` : '$8.00/lot'}
                </div>
              </div>

              {/* Lots Slider (Exact match to hero.png) */}
              <div className="mt-5 space-y-2">
                <div className="text-xs sm:text-[13px] text-white font-bold tracking-tight">
                  Lots trade per month
                </div>
                <div className="flex items-center gap-3.5">
                  <div className="relative flex-1 flex items-center">
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={lotsPerMonth}
                      onChange={(e) => setLotsPerMonth(parseInt(e.target.value))}
                      className="hero-slider w-full h-2.5 rounded-full appearance-none cursor-pointer focus:outline-none"
                      style={{
                        background: `linear-gradient(to right, #CAEB0E ${((lotsPerMonth - 1) / 99) * 100}%, #D6DCE7 ${((lotsPerMonth - 1) / 99) * 100}%)`,
                      }}
                    />
                  </div>
                  <div className="w-[52px] h-[38px] rounded-xl bg-white text-[#5240F2] font-black text-lg flex items-center justify-center shadow-xs shrink-0 select-none">
                    {lotsPerMonth}
                  </div>
                </div>
              </div>

              {/* Monthly & Annual Projected Rewards with subtle vertical divider (Exact match to hero.png) */}
              <div className="grid grid-cols-2 gap-2 mt-5 pt-3 relative">
                {/* Left Column: Your monthly rewards */}
                <div className="pr-2">
                  <div className="flex items-center gap-1.5 text-xs text-white/90 font-medium">
                    <Wallet className="w-3.5 h-3.5 text-white stroke-[2]" />
                    <span>Your monthly rewards</span>
                  </div>
                  <div className="mt-1 flex items-baseline gap-0.5">
                    <span className="text-2xl sm:text-[32px] font-black text-white tracking-tight leading-none">
                      ${calculatedMonthly.toLocaleString()}
                    </span>
                    <span className="text-sm sm:text-base font-normal text-white">
                      /mth.
                    </span>
                  </div>
                </div>

                {/* Center subtle vertical line divider */}
                <div className="absolute top-3 bottom-0 left-1/2 w-[1px] bg-white/20 -translate-x-1/2" />

                {/* Right Column: Your annual total */}
                <div className="pl-3 sm:pl-4">
                  <div className="flex items-center gap-1.5 text-xs text-white/90 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-white stroke-[2]" />
                    <span>Your annual total</span>
                  </div>
                  <div className="mt-1 flex items-baseline gap-0.5">
                    <span className="text-2xl sm:text-[32px] font-black text-white tracking-tight leading-none">
                      ${calculatedAnnual.toLocaleString()}
                    </span>
                    <span className="text-sm sm:text-base font-normal text-white">
                      /yr.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons: 3 States based on user request:
                State 1 (!isSignedIn): hero (1) -> "Get Cashback"
                State 2 (isSignedIn && !isConnectedToMarketSyde): hero (2) -> "Connect Now"
                State 3 (isSignedIn && isConnectedToMarketSyde): hero (4) -> "Add Trading Account" + "Trade with HFM"
            */}
            {!isSignedIn ? (
              <button
                type="button"
                onClick={() => {
                  if (onOpenSignUp) {
                    onOpenSignUp();
                  } else {
                    setIsLocalSignUpModalOpen(true);
                  }
                }}
                className="w-full mt-6 py-3.5 rounded-xl bg-[#CAEB0E] hover:bg-[#b8d60d] text-slate-950 font-extrabold text-sm sm:text-base transition-all shadow-md active:scale-95 cursor-pointer text-center"
              >
                Get Cashback
              </button>
            ) : !isConnectedToMarketSyde ? (
              <button
                type="button"
                onClick={() => onNavigateToConnectBroker(broker)}
                className="w-full mt-6 py-3.5 rounded-xl bg-[#CAEB0E] hover:bg-[#b8d60d] text-slate-950 font-extrabold text-sm sm:text-base transition-all shadow-md active:scale-95 cursor-pointer text-center"
              >
                Connect Now
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-3 mt-6 pt-1">
                <button
                  type="button"
                  onClick={() => onNavigateToConnectBroker(broker)}
                  className="w-full py-3 px-3 rounded-xl border border-white bg-transparent hover:bg-white/10 text-white font-medium text-xs sm:text-sm transition-all cursor-pointer text-center truncate active:scale-[0.98]"
                >
                  Add Trading Account
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onShowToast?.(`Routing trade execution through ${broker.name} (Account #1100045789)`);
                  }}
                  className="w-full py-3 px-3 rounded-xl bg-[#CAEB0E] hover:bg-[#b8d60d] text-slate-950 font-bold text-xs sm:text-sm transition-all cursor-pointer text-center shadow-xs active:scale-[0.98] truncate"
                >
                  Trade with {broker.name}
                </button>
              </div>
            )}
          </div>
        ) : (
          /* BROKER WITHOUT CASHBACK RIGHT CARD */
          <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-slate-800 rounded-[24px] p-6 sm:p-7 text-white shadow-xl flex flex-col justify-between border border-slate-700/50">
            <div>
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-display font-bold text-xl sm:text-[22px] tracking-tight text-white">
                  Trade with <span className="text-slate-200">{broker.name}</span>
                </h3>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 text-[10px] font-semibold border border-slate-700">
                  No Cashback
                </span>
              </div>

              <p className="text-xs text-slate-300 mt-2.5 leading-relaxed">
                {broker.name} operates under direct standard execution and does not offer cashback rebates. You can open and manage your direct institutional account below.
              </p>

              <div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-slate-700/60">
                <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/40">
                  <div className="text-[11px] text-slate-400 font-medium">Spread From</div>
                  <div className="text-lg font-bold text-white mt-0.5">{broker.spreadFrom || '0.8 pips'}</div>
                </div>
                <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/40">
                  <div className="text-[11px] text-slate-400 font-medium">Max Leverage</div>
                  <div className="text-lg font-bold text-white mt-0.5">{broker.maxLeverage || '1:500'}</div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleConnectClick}
              className="w-full mt-6 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm transition-all shadow-md active:scale-95 cursor-pointer text-center"
            >
              Open Direct Account with {broker.name}
            </button>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TABS NAVIGATION:
          - If broker has cashback: Show Cashback, Account, Company
          - If broker has NO cashback: Show ONLY Account, Company
         ───────────────────────────────────────────────────────────── */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#B8ABFB]/90 pb-0">
          <FolderTabs<'cashback' | 'account' | 'company'>
            className="flex-1"
            tabs={
              hasCashbackProgram
                ? [
                    {
                      id: 'cashback',
                      label: 'Cashback',
                      icon: <CircleDollarSign className="w-5 h-5" strokeWidth={2} />,
                    },
                    {
                      id: 'account',
                      label: 'Account',
                      icon: <Users className="w-5 h-5" strokeWidth={2} />,
                    },
                    {
                      id: 'company',
                      label: 'Company',
                      icon: <Building2 className="w-5 h-5" strokeWidth={2} />,
                    },
                  ]
                : [
                    {
                      id: 'account',
                      label: 'Account',
                      icon: <Users className="w-5 h-5" strokeWidth={2} />,
                    },
                    {
                      id: 'company',
                      label: 'Company',
                      icon: <Building2 className="w-5 h-5" strokeWidth={2} />,
                    },
                  ]
            }
            activeTab={activeTab}
            onChange={(tabId) => setActiveTab(tabId)}
          />

          {/* Clean, compact Scenario controls */}
          <div className="flex flex-wrap items-center gap-2.5 pb-2.5 text-xs shrink-0 self-end">
            {/* Broker Cashback Toggle */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-medium text-[11px]">Broker:</span>
              <div className="inline-flex p-0.5 bg-slate-100 rounded-lg border border-slate-200">
                <button
                  type="button"
                  onClick={() => setHasCashbackProgram(true)}
                  className={`px-2 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    hasCashbackProgram
                      ? 'bg-white text-[#5945F1] shadow-2xs font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Show 3 tabs: Cashback, Account, Company"
                >
                  Has Cashback
                </button>
                <button
                  type="button"
                  onClick={() => setHasCashbackProgram(false)}
                  className={`px-2 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    !hasCashbackProgram
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Show 2 tabs: Account, Company"
                >
                  No Cashback
                </button>
              </div>
            </div>

            {/* Auth State Toggle: Not Signed In (hero 1) vs Signed In (hero 2/4) */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-medium text-[11px]">Auth:</span>
              <div className="inline-flex p-0.5 bg-slate-100 rounded-lg border border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsSignedIn(false)}
                  className={`px-2 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    !isSignedIn
                      ? 'bg-white text-slate-800 shadow-2xs font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="ยังไม่ได้ Sign In -> แสดง Hero (1): ปุ่ม 'Get Cashback'"
                >
                  Not Signed In
                </button>
                <button
                  type="button"
                  onClick={() => setIsSignedIn(true)}
                  className={`px-2 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    isSignedIn
                      ? 'bg-white text-[#5945F1] shadow-2xs font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Sign In แล้ว -> แสดง Hero (2) หรือ (4)"
                >
                  Signed In
                </button>
              </div>
            </div>

            {/* Connection Scenario Toggle */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-medium text-[11px]">Scenario:</span>
              <div className="inline-flex p-0.5 bg-slate-100 rounded-lg border border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsConnectedToMarketSyde(false)}
                  className={`px-2 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    !isConnectedToMarketSyde
                      ? 'bg-white text-slate-800 shadow-2xs font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Scenario: ยังไม่ได้เชื่อมต่อ MarketSyde"
                >
                  Not Connected
                </button>
                <button
                  type="button"
                  onClick={() => setIsConnectedToMarketSyde(true)}
                  className={`px-2 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                    isConnectedToMarketSyde
                      ? 'bg-[#CAEB0E] text-black shadow-2xs font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Scenario: เชื่อมต่อ MarketSyde แล้ว"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-black" />
                  Connected
                </button>
              </div>
            </div>

            {/* Tier Scenario Picker */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-medium text-[11px]">Tier:</span>
              <div className="inline-flex p-0.5 bg-slate-100 rounded-lg border border-slate-200">
                <button
                  type="button"
                  onClick={() => setUserTier('tier-1')}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    userTier === 'tier-1'
                      ? 'bg-white text-[#5945F1] shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Tier 1: Tier 1 Regulated"
                >
                  Tier 1
                </button>
                <button
                  type="button"
                  onClick={() => setUserTier('tier-2')}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    userTier === 'tier-2'
                      ? 'bg-white text-[#5945F1] shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Tier 2: Regulated"
                >
                  Tier 2
                </button>
                <button
                  type="button"
                  onClick={() => setUserTier('offshore')}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    userTier === 'offshore'
                      ? 'bg-white text-[#5945F1] shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Offshore: Offshore"
                >
                  Offshore
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            TAB CONTENTS CONDITIONAL ON TIER & TAB SCENARIO
           ───────────────────────────────────────────────────────────── */}
        {/* SCENARIO 1: CASHBACK TAB (ONLY VISIBLE WHEN hasCashbackProgram) */}
        {hasCashbackProgram && activeTab === 'cashback' && (
          <>
            {userTier === 'tier-1' && (
              <Tier1CashbackTab
                broker={broker}
                user={user}
                isConnected={isConnectedToMarketSyde}
                onOpenRebateTable={onNavigateToRebateTable}
                onOpenViewPlan={onOpenViewPlan}
                onSeeComparison={handleSeeComparison}
                onExploreAllBrokers={onBackToBrokers}
              />
            )}
            {userTier === 'tier-2' && (
              <Tier2CashbackTab
                broker={broker}
                user={user}
                isConnected={isConnectedToMarketSyde}
                onOpenRebateTable={onNavigateToRebateTable}
                onNavigateToConnect={() => onNavigateToConnectBroker(broker)}
                onOpenViewPlan={onOpenViewPlan}
                onShowToast={onShowToast}
                onSeeComparison={handleSeeComparison}
                onExploreAllBrokers={onBackToBrokers}
              />
            )}
            {userTier === 'offshore' && (
              <OffshoreCashbackTab
                broker={broker}
                user={user}
                isConnected={isConnectedToMarketSyde}
                onOpenRebateTable={onNavigateToRebateTable}
                onNavigateToConnect={() => onNavigateToConnectBroker(broker)}
                onShowToast={onShowToast}
                onOpenViewPlan={onOpenViewPlan}
                onSeeComparison={handleSeeComparison}
                onExploreAllBrokers={onBackToBrokers}
              />
            )}
          </>
        )}

        {/* SCENARIO 2: ACCOUNT TAB */}
        {activeTab === 'account' && (
          <>
            {userTier === 'tier-1' && (
              <Tier1AccountTab
                broker={broker}
                user={user}
                isConnected={isConnectedToMarketSyde}
                onSeeComparison={handleSeeComparison}
                onExploreAllBrokers={onBackToBrokers}
              />
            )}
            {userTier === 'tier-2' && (
              <Tier2AccountTab
                broker={broker}
                user={user}
                isConnected={isConnectedToMarketSyde}
                onNavigateToConnect={() => onNavigateToConnectBroker(broker)}
                onShowToast={onShowToast}
                onSeeComparison={handleSeeComparison}
                onExploreAllBrokers={onBackToBrokers}
              />
            )}
            {userTier === 'offshore' && (
              <OffshoreAccountTab
                broker={broker}
                user={user}
                isConnected={isConnectedToMarketSyde}
                onNavigateToConnect={() => onNavigateToConnectBroker(broker)}
                onShowToast={onShowToast}
                onSeeComparison={handleSeeComparison}
                onExploreAllBrokers={onBackToBrokers}
              />
            )}
          </>
        )}

        {/* SCENARIO 3: ABOUT COMPANY TAB */}
        {activeTab === 'company' && (
          <>
            {userTier === 'tier-1' && (
              <Tier1CompanyTab
                broker={broker}
                user={user}
                isConnected={isConnectedToMarketSyde}
                onSeeComparison={handleSeeComparison}
                onExploreAllBrokers={onBackToBrokers}
              />
            )}
            {userTier === 'tier-2' && (
              <Tier2CompanyTab
                broker={broker}
                user={user}
                isConnected={isConnectedToMarketSyde}
                onNavigateToConnect={() => onNavigateToConnectBroker(broker)}
                onSeeComparison={handleSeeComparison}
                onExploreAllBrokers={onBackToBrokers}
              />
            )}
            {userTier === 'offshore' && (
              <OffshoreCompanyTab
                broker={broker}
                user={user}
                isConnected={isConnectedToMarketSyde}
                onSeeComparison={handleSeeComparison}
                onExploreAllBrokers={onBackToBrokers}
              />
            )}
          </>
        )}
      </div>

      {/* Fallback Local Sign Up Modal */}
      <AuthModal
        isOpen={isLocalSignUpModalOpen}
        initialMode="signup"
        onClose={() => setIsLocalSignUpModalOpen(false)}
        onSuccess={(email, name) => {
          setUserTier('tier-2');
          onLoginSuccess?.(email, name);
          onNavigateToConnectBroker(broker);
        }}
        onShowToast={onShowToast}
      />
    </div>
  );
};

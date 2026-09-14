import React, { useState } from 'react';
import { Broker, UserProfile, UserTierType } from '../../types';
import {
  Check,
  ArrowLeft,
  Calendar,
  Wallet,
  User,
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
  onOpenViewPlan,
  onShowToast,
  onOpenSignUp,
  onLoginSuccess,
}) => {
  // Current user tier for the 3 tab scenarios
  const [userTier, setUserTier] = useState<UserTierType>('tier-2');

  // Fallback internal sign up modal state
  const [isLocalSignUpModalOpen, setIsLocalSignUpModalOpen] = useState(false);

  // Active Tab Scenario (Cashback, Account, Company)
  const [activeTab, setActiveTab] = useState<'cashback' | 'account' | 'company'>('cashback');

  // Monthly Lots Interactive Slider in Top Card (matches exact screenshot default of 25)
  const [lotsPerMonth, setLotsPerMonth] = useState<number>(25);

  // Exact math from reference screenshot:
  // Rate: $8.00/lot, 25 lots -> $120/mth. ($4.80/lot net reward), $1,440/yr.
  const calculatedMonthly = Math.round(lotsPerMonth * 4.8);
  const calculatedAnnual = calculatedMonthly * 12;

  // Handler for Get Cashback button:
  // If not signed up / logged in: show AuthModal (D12_Sign-Up.png)
  // If already signed up: show Connect to MarketSyde (D12_Connect to MarketSyde.png)
  const handleGetCashbackClick = () => {
    if (!isLoggedIn) {
      if (onOpenSignUp) {
        onOpenSignUp();
      } else {
        setIsLocalSignUpModalOpen(true);
      }
    } else {
      onNavigateToConnectBroker(broker);
    }
  };

  const handleRegisterPrompt = () => {
    if (!isLoggedIn) {
      if (onOpenSignUp) {
        onOpenSignUp();
      } else {
        setIsLocalSignUpModalOpen(true);
      }
    } else {
      onNavigateToConnectBroker(broker);
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
          Left Card: Broker Specs & Summary with gradient outline
          Right Card: Cashback with MarketSyde (Solid Purple with Lime Accent)
         ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* LEFT CARD: GRADIENT BORDER CONTAINER (7 COLS ON LG) */}
        <div className="lg:col-span-7 p-[1.5px] rounded-[24px] bg-gradient-to-br from-[#818CF8] via-[#C084FC] to-[#FB7185] shadow-xs">
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
                    <span>Offshore</span>
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="grid grid-cols-12 gap-2">
                    <span className="col-span-5 text-slate-500">• Min Deposit</span>
                    <span className="col-span-7 font-medium text-slate-800">: From $10</span>
                  </div>
                  <div className="grid grid-cols-12 gap-2">
                    <span className="col-span-5 text-slate-500">• Max Leverage</span>
                    <span className="col-span-7 font-medium text-slate-800">: Up to 1:1000</span>
                  </div>
                  <div className="grid grid-cols-12 gap-2">
                    <span className="col-span-5 text-slate-500">• Platforms</span>
                    <span className="col-span-7 font-medium text-slate-800">: MT4, MT5, Web, App</span>
                  </div>
                  <div className="grid grid-cols-12 gap-2">
                    <span className="col-span-5 text-slate-500">• Spread Type</span>
                    <span className="col-span-7 font-medium text-slate-800">: Standard, Ultra-Low, Zero Accounts</span>
                  </div>
                  <div className="grid grid-cols-12 gap-2">
                    <span className="col-span-5 text-slate-500">• Supported Currencies</span>
                    <span className="col-span-7 font-medium text-slate-800">: EUR, JPY, THB, USD, IDR, NGN</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT CARD: CASHBACK WITH MARKETSYDE (5 COLS ON LG - EXACT MATCH) */}
        <div className="lg:col-span-5 bg-[#5945F1] rounded-[24px] p-6 sm:p-7 text-white shadow-xl flex flex-col justify-between">
          <div>
            {/* Title */}
            <h3 className="font-display font-bold text-xl sm:text-[22px] tracking-tight text-white">
              Cashback with <span className="text-[#CAEB0E]">MarketSyde</span>
            </h3>

            {/* Estimated Cashback Metric */}
            <div className="flex items-center gap-3 mt-3">
              <div className="text-[11px] sm:text-xs text-white/80 font-medium leading-tight">
                <div>Estimated</div>
                <div>cashback</div>
              </div>
              <div className="text-3xl sm:text-4xl font-black text-[#CAEB0E] tracking-tight">
                $8.00/lot
              </div>
            </div>

            {/* Lots Slider */}
            <div className="mt-5 space-y-2">
              <div className="text-xs text-white/90 font-medium">
                Lots trade per month
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={lotsPerMonth}
                  onChange={(e) => setLotsPerMonth(parseInt(e.target.value))}
                  className="flex-1 h-2 bg-white/30 rounded-lg appearance-none cursor-pointer accent-[#CAEB0E]"
                />
                <div className="w-11 h-8 rounded-lg bg-white text-[#5945F1] font-bold text-sm flex items-center justify-center shadow-xs shrink-0">
                  {lotsPerMonth}
                </div>
              </div>
            </div>

            {/* Monthly & Annual Projected Rewards */}
            <div className="grid grid-cols-2 gap-4 mt-6 pt-3 border-t border-white/10">
              <div>
                <div className="flex items-center gap-1.5 text-xs text-white/80">
                  <Wallet className="w-3.5 h-3.5 text-white stroke-[2]" />
                  <span>Your monthly rewards</span>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                  ${calculatedMonthly.toLocaleString()}/mth.
                </div>
              </div>

              <div className="border-l border-white/15 pl-4">
                <div className="flex items-center gap-1.5 text-xs text-white/80">
                  <Calendar className="w-3.5 h-3.5 text-white stroke-[2]" />
                  <span>Your annual total</span>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                  ${calculatedAnnual.toLocaleString()}/yr.
                </div>
              </div>
            </div>
          </div>

          {/* Action Button: Get Cashback */}
          <button
            type="button"
            onClick={handleGetCashbackClick}
            className="w-full mt-6 py-3.5 rounded-xl bg-[#CAEB0E] hover:bg-[#b8d60d] text-black font-extrabold text-sm transition-all shadow-md active:scale-95 cursor-pointer text-center"
          >
            Get Cashback
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TABS NAVIGATION:
          Tab 1: Cashback (Scenario 1)
          Tab 2: Account (Scenario 2)
          Tab 3: Company (Scenario 3)
          + Subtle Tier Scenario Switcher aligned to the right
         ───────────────────────────────────────────────────────────── */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <FolderTabs<'cashback' | 'account' | 'company'>
            className="flex-1"
            tabs={[
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
            ]}
            activeTab={activeTab}
            onChange={(tabId) => setActiveTab(tabId)}
          />

          {/* Clean, compact Tier scenario picker for tab scenarios */}
          <div className="flex items-center gap-1.5 pb-2 text-xs">
            <span className="text-slate-400 font-medium text-[11px]">View Tier:</span>
            <div className="inline-flex p-0.5 bg-slate-100 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setUserTier('tier-1')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  userTier === 'tier-1'
                    ? 'bg-white text-[#5945F1] shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Tier 1: Unregistered visitor"
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
                title="Tier 2: Registered member"
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
                title="Offshore: Active trader"
              >
                Offshore
              </button>
            </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            TAB CONTENTS CONDITIONAL ON TIER & TAB SCENARIO
           ───────────────────────────────────────────────────────────── */}
        {/* SCENARIO 1: CASHBACK TAB */}
        {activeTab === 'cashback' && (
          <>
            {userTier === 'tier-1' && (
              <Tier1CashbackTab
                broker={broker}
                user={user}
                onOpenViewPlan={onOpenViewPlan}
                onRegisterPrompt={handleRegisterPrompt}
              />
            )}
            {userTier === 'tier-2' && (
              <Tier2CashbackTab
                broker={broker}
                user={user}
                onNavigateToConnect={() => onNavigateToConnectBroker(broker)}
                onOpenViewPlan={onOpenViewPlan}
                onShowToast={onShowToast}
              />
            )}
            {userTier === 'offshore' && (
              <OffshoreCashbackTab
                broker={broker}
                user={user}
                onNavigateToConnect={() => onNavigateToConnectBroker(broker)}
                onShowToast={onShowToast}
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
                onRegisterPrompt={handleRegisterPrompt}
              />
            )}
            {userTier === 'tier-2' && (
              <Tier2AccountTab
                broker={broker}
                user={user}
                onNavigateToConnect={() => onNavigateToConnectBroker(broker)}
                onShowToast={onShowToast}
              />
            )}
            {userTier === 'offshore' && (
              <OffshoreAccountTab
                broker={broker}
                user={user}
                onNavigateToConnect={() => onNavigateToConnectBroker(broker)}
                onShowToast={onShowToast}
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
                onRegisterPrompt={handleRegisterPrompt}
              />
            )}
            {userTier === 'tier-2' && (
              <Tier2CompanyTab
                broker={broker}
                user={user}
                onNavigateToConnect={() => onNavigateToConnectBroker(broker)}
              />
            )}
            {userTier === 'offshore' && (
              <OffshoreCompanyTab broker={broker} user={user} />
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

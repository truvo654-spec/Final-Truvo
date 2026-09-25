import React, { useState } from 'react';
import { Copy, ShieldAlert, BadgeCheck, Wallet2, Check, Lock, ArrowRight } from 'lucide-react';
import { UserProfile, MarketSignal, Mission, Broker } from '../../types';
import { InstrumentAnalysisWidget } from './InstrumentAnalysisWidget';
import { MissionCardWidget } from './MissionCardWidget';
import { PromotionWidget } from './PromotionWidget';
import { ActivityCarousel } from './ActivityCarousel';
import { MoreConnectedBrokersBanner } from './MoreConnectedBrokersBanner';

interface Demo3DashboardViewProps {
  user: UserProfile;
  signals: MarketSignal[];
  brokers: Broker[];
  missions: Mission[];
  onUpdateMissions?: (missions: Mission[]) => void;
  onOpenConnectModal?: (broker?: Broker) => void;
  onNavigateToTab?: (tab: string) => void;
  onNavigateToConnectBroker?: (broker?: Broker) => void;
  onSelectBrokerDetail?: (broker?: Broker) => void;
  onSelectSignal?: (signal: MarketSignal) => void;
  onShowToast?: (msg: string) => void;
}

function maskEmail(email?: string): string {
  if (!email) return 'trader***@****';
  const [local, domain] = email.split('@');
  const maskedLocal = (local || 'trader').slice(0, 3) + '***';
  const maskedDomain = domain ? domain[0] + '****' : '****';
  return `${maskedLocal}@${maskedDomain}`;
}

/**
 * Demo 3 — a Bybit-style "home" layout, built primarily from the same
 * widget components used on the real MarketSyde dashboard
 * (InstrumentAnalysisWidget, MissionCardWidget, PromotionWidget,
 * ActivityCarousel, MoreConnectedBrokersBanner). Only the profile status
 * bar and onboarding stepper are bespoke to this layout.
 */
export const Demo3DashboardView: React.FC<Demo3DashboardViewProps> = ({
  user,
  signals,
  brokers,
  missions,
  onUpdateMissions,
  onOpenConnectModal,
  onNavigateToTab,
  onNavigateToConnectBroker,
  onSelectBrokerDetail,
  onSelectSignal,
  onShowToast,
}) => {
  const [uidCopied, setUidCopied] = useState(false);
  const toast = (msg: string) => onShowToast?.(msg);

  const getTargetBroker = (brokerName: string) =>
    brokers.find((b) => b.name.toLowerCase() === brokerName.toLowerCase()) || brokers[0];

  const handleConnectBrokerAction = (brokerName: string) => {
    const target = getTargetBroker(brokerName);
    if (onNavigateToConnectBroker) {
      onNavigateToConnectBroker(target);
    } else {
      onOpenConnectModal?.(target);
    }
  };

  const handleSelectBrokerDetail = (brokerName: string) => {
    const target = getTargetBroker(brokerName);
    onSelectBrokerDetail?.(target);
  };

  const copyUid = () => {
    setUidCopied(true);
    toast('UID copied to clipboard.');
    setTimeout(() => setUidCopied(false), 1500);
  };

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* ═══════════════════ MAIN COLUMN ═══════════════════ */}
      <div className="lg:col-span-2 space-y-6">
        {/* ─── 1. PROFILE STATUS BAR ─── */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-2xs p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center overflow-hidden shrink-0">
              {user.avatar ? (
                <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <span className="text-lg font-bold text-[#5945F1]">{user.username?.[0]?.toUpperCase()}</span>
              )}
            </div>
            <div>
              <div className="font-bold text-sm text-[#0b1c30]">{maskEmail(user.email)}</div>
              <button
                onClick={copyUid}
                className="flex items-center gap-1 text-xs text-slate-400 mt-0.5 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <span>UID: {user.id}</span>
                <Copy className="w-3 h-3" />
                {uidCopied && <span className="text-[#5945F1] font-semibold">Copied</span>}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-xs font-bold text-[#0b1c30]">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              {user.rankTitle} · Lv.{user.tierLevel}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-xs font-bold text-[#0b1c30]">
              <Wallet2 className="w-3.5 h-3.5" />
              Main Account
            </span>
            <button
              onClick={() => onNavigateToTab?.('account-security')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-xs font-bold text-amber-600 hover:bg-amber-100 transition-colors cursor-pointer"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              Not Verified
            </button>
          </div>
        </div>

        {/* ─── 2. GET STARTED STEPPER ─── */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-2xs p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-5">
            <span className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center shrink-0">
              <Check className="w-3.5 h-3.5" />
            </span>
            <div className="h-px flex-1 bg-slate-100" />
            <span className="w-6 h-6 rounded-full bg-[#5945F1] text-white text-xs font-bold flex items-center justify-center shrink-0">2</span>
            <div className="h-px flex-1 bg-slate-100" />
            <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-400 text-xs font-bold flex items-center justify-center shrink-0">3</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr_1fr] gap-4">
            {/* Step 1: Sign Up — completed */}
            <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 flex flex-col items-start justify-between opacity-70">
              <span className="text-sm font-bold text-slate-400">Sign Up</span>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 mt-6">
                <Check className="w-3.5 h-3.5" /> Completed
              </span>
            </div>

            {/* Step 2: Verify Identity — active */}
            <div className="rounded-2xl border-2 border-[#5945F1] bg-indigo-50/40 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex-1">
                <div className="font-bold text-[#0b1c30] mb-2">Verify identity to unlock full platform access</div>
                <ul className="space-y-1 mb-4">
                  <li className="text-xs text-slate-500 flex items-start gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                    Takes 2–5 minutes with a valid ID
                  </li>
                  <li className="text-xs text-slate-500 flex items-start gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                    Encrypted data storage — your info stays private
                  </li>
                  <li className="text-xs text-slate-500 flex items-start gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                    Estimated approval within 5 minutes
                  </li>
                </ul>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => (onNavigateToTab ? onNavigateToTab('account-security') : toast('Verification flow coming soon.'))}
                    className="px-5 py-2.5 rounded-xl bg-[#5945F1] hover:bg-[#4834e0] text-white text-sm font-semibold transition-all cursor-pointer"
                  >
                    Get Verified Now
                  </button>
                  <button
                    onClick={() => toast('Verified accounts unlock higher cashback tiers, faster payouts, and full broker access.')}
                    className="text-xs font-semibold text-[#5945F1] hover:underline cursor-pointer"
                  >
                    Why is it important?
                  </button>
                </div>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-[#5945F1]/10 flex items-center justify-center shrink-0">
                <BadgeCheck className="w-9 h-9 text-[#5945F1] stroke-[1.5]" />
              </div>
            </div>

            {/* Step 3: Connect Broker — locked */}
            <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 flex flex-col items-start justify-between opacity-70">
              <span className="text-sm font-bold text-slate-400">Connect Broker</span>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 mt-6">
                <Lock className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </div>

        {/* ─── 3. MARKETS — real dashboard widget (InstrumentAnalysisWidget) ─── */}
        <InstrumentAnalysisWidget onNavigateToTab={onNavigateToTab ?? (() => {})} />

        {/* ─── 4. TRENDING CHALLENGES — real dashboard widget (MissionCardWidget) ─── */}
        <div>
          <h3 className="font-bold text-lg text-[#0b1c30] mb-4">Trending Challenges</h3>
          <MissionCardWidget
            missions={missions}
            onUpdateMissions={onUpdateMissions}
            onNavigateToTab={onNavigateToTab}
          />
        </div>

        {/* ─── 5. ANNOUNCEMENTS — real dashboard widget (PromotionWidget) ─── */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-2xs p-5 sm:p-6">
          <h3 className="font-bold text-lg text-[#0b1c30] mb-4">Announcements</h3>
          <PromotionWidget />
        </div>
      </div>

      {/* ═══════════════════ SIDEBAR ═══════════════════ */}
      <div className="space-y-6">
        {/* New to MarketSyde? */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-2xs p-5 sm:p-6">
          <h3 className="font-bold text-base text-[#0b1c30] mb-3.5">New to MarketSyde?</h3>
          <div className="space-y-3">
            {[
              { label: 'How to connect your first broker', tab: 'brokers' },
              { label: 'How to complete verification and unlock rewards', tab: 'account-security' },
              { label: 'How cashback tracking works, step by step', tab: 'credit-earning-guide' },
              { label: 'Trader Protection Guide: keep your account safe', tab: 'account-security' },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => onNavigateToTab?.(item.tab)}
                className="block text-left text-sm text-slate-600 hover:text-[#5945F1] transition-colors cursor-pointer leading-snug"
              >
                {item.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => onNavigateToTab?.('level-points-guide')}
            className="mt-4 text-xs font-bold text-[#5945F1] hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            Learn More <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Activity — real dashboard widget (ActivityCarousel) */}
        <ActivityCarousel
          onNavigateToTab={onNavigateToTab ?? (() => {})}
          onConnectBroker={handleConnectBrokerAction}
          onSelectBrokerDetail={handleSelectBrokerDetail}
        />

        {/* More Connected Brokers — real dashboard widget (MoreConnectedBrokersBanner) */}
        <MoreConnectedBrokersBanner
          onConnectBroker={handleConnectBrokerAction}
          onNavigateToTab={onNavigateToTab}
        />
      </div>
    </div>
  );
};

export default Demo3DashboardView;

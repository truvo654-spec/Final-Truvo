import React, { useState } from 'react';
import {
  ArrowRight,
  Plus,
  UserPlus,
  Link2,
  CandlestickChart,
  DollarSign,
  AlertCircle,
  RefreshCw,
  Trash2,
  ExternalLink,
  X,
} from 'lucide-react';
import { ConnectionDeniedPopup } from './ConnectionDeniedPopup';
import { ConnectionUnavailablePopup } from './ConnectionUnavailablePopup';
import { BorderBeam } from '../ui/BorderBeam';


export type ConnectedAccountStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'unavailable'
  | 'first-trade';

interface ConnectedAccountStepperCardProps {
  status: ConnectedAccountStatus;
  brokerName?: string;
  accountNumber?: string;
  accountType?: string;
  onNavigateToTab: (tab: string) => void;
  onOpenConnectModal?: (broker?: any) => void;
  onShowToast?: (message: string) => void;
  onDeleteAccount?: () => void;
  onOpenDeniedPopup?: () => void;
  onOpenUnavailablePopup?: () => void;
}

export const ConnectedAccountStepperCard: React.FC<ConnectedAccountStepperCardProps> = ({
  status,
  brokerName = 'HFM',
  accountNumber = '1100012001',
  accountType = 'Premium',
  onNavigateToTab,
  onOpenConnectModal,
  onShowToast,
  onDeleteAccount,
  onOpenDeniedPopup,
  onOpenUnavailablePopup,
}) => {
  const [showResolutionModal, setShowResolutionModal] = useState(false);

  const isPending = status === 'pending';
  const isRejected = status === 'rejected';
  const isUnavailable = status === 'unavailable';
  const isApproved = status === 'approved';
  const isFirstTrade = status === 'first-trade';

  return (
    <>
      <div className="md:col-span-8 rounded-2xl bg-white dark:bg-[#170345] border border-[#f0abfc]/70 dark:border-pink-900/50 p-5 sm:p-6 shadow-2xs flex flex-col justify-between interactive-card relative overflow-hidden">
        <BorderBeam
          borderWidth={1.8}
          duration={8}
          colorFrom="#5945F1"
          colorTo="#FD02B0"
        />
        <div>
          {/* Header with Title & Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <h3 className="font-display font-extrabold text-xl sm:text-[22px] text-[#5240F2] tracking-tight">
                {isPending ? 'Verification Loading Screen ⏳' : 'Guild Link Online ⚡'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal">
                {isPending
                  ? 'Your broker is doing paperwork at dial-up speed. Sit tight while we ping them relentlessly.'
                  : 'Greedy for more loot? Link another guild and hoard multi-broker rebates like a boss.'}
              </p>
            </div>

            {/* Top Right Action Buttons Stacked */}
            <div className="flex flex-col items-stretch sm:items-end gap-2 shrink-0">
              {/* Primary: Explore Brokers */}
              <button
                type="button"
                onClick={() => onNavigateToTab('brokers')}
                className="px-4 py-1.5 rounded-xl bg-[#5240F2] hover:bg-[#4335C4] text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-transform active:scale-95 cursor-pointer"
              >
                <span>Browse Guilds</span>
                <ArrowRight className="w-4 h-4 stroke-[2.2]" />
              </button>

              {/* Secondary: Add More Account */}
              <button
                type="button"
                onClick={() => onNavigateToTab('active-trading-accounts')}
                className="px-4 py-1.5 rounded-xl bg-white hover:bg-indigo-50/60 border border-[#5240F2] text-[#5240F2] text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 shadow-2xs transition-transform active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Link Another Account</span>
              </button>
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              SCENARIO A: FIRST TRADE (AFTER TRADE)
              Clean horizontal account row with Approved badge & Gradient Button
             ───────────────────────────────────────────────────────────── */}
          {isFirstTrade ? (
            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2 animate-in fade-in duration-200">
              {/* Account details */}
              <div className="flex items-center gap-3.5 flex-wrap">
                {/* Round HFM Badge */}
                <div className="w-10 h-10 rounded-full bg-black flex flex-col items-center justify-center text-white shrink-0 overflow-hidden shadow-xs select-none">
                  <span className="text-[10px] font-black tracking-tight leading-none">
                    {brokerName}
                  </span>
                  <div className="w-3 h-[1px] bg-[#E11D89] my-[1.5px]" />
                  <span className="text-[4.5px] text-white/80 font-bold leading-none tracking-tighter">
                    HF MARKETS
                  </span>
                </div>

                <div className="flex items-center gap-2 sm:gap-2.5 text-sm sm:text-[15px] font-bold text-slate-900 flex-wrap">
                  <span>{accountType}</span>
                  <span className="text-slate-400 font-normal">•</span>
                  <span className="text-slate-600 font-medium">{accountNumber}</span>
                  <span className="text-slate-400 font-normal">•</span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EAFBF3] text-[#12B76A] border border-[#D1F7E5]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#12B76A]" />
                    Approved
                  </span>
                </div>
              </div>

              {/* Vibrant Gradient Trade Now Button */}
              <button
                type="button"
                onClick={() => {
                  if (onShowToast) {
                    onShowToast('Connecting to trading terminal...');
                  }
                  onNavigateToTab('signals');
                }}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#7C3AED] via-[#A855F7] to-[#EC4899] hover:opacity-95 text-white text-xs sm:text-sm font-semibold shadow-sm transition-transform active:scale-95 cursor-pointer self-start sm:self-auto"
              >
                Trade Now
              </button>
            </div>
          ) : (
            /* ─────────────────────────────────────────────────────────────
                SCENARIO B: STEPPER (Pending, Approved, Rejected, Unavailable)
               ───────────────────────────────────────────────────────────── */
            <div className="relative mt-8 mb-2">
              {/* Full Background Track Line */}
              <div className="absolute top-[24px] left-[12.5%] right-[12.5%] h-[3px] bg-[#EEF0F8] rounded-full z-0 pointer-events-none" />

              {/* Connected Progress Lines */}
              {isPending ? (
                <>
                  {/* Step 1 to Step 2: Solid Purple */}
                  <div className="absolute top-[24px] left-[12.5%] w-[25%] h-[3px] bg-[#5240F2] rounded-full z-0 pointer-events-none" />
                  {/* Step 2 forward: Pink/Magenta Line */}
                  <div className="absolute top-[24px] left-[37.5%] w-[10%] h-[3px] bg-[#E11D89] rounded-full z-0 pointer-events-none" />
                </>
              ) : (
                <>
                  {/* Step 1 through Step 3: Solid Purple */}
                  <div className="absolute top-[24px] left-[12.5%] w-[50%] h-[3px] bg-[#5240F2] rounded-full z-0 pointer-events-none" />
                  {/* Step 3 forward: Pink/Magenta Line */}
                  <div className="absolute top-[24px] left-[62.5%] w-[10%] h-[3px] bg-[#E11D89] rounded-full z-0 pointer-events-none" />
                </>
              )}

              {/* 4 Steps Grid */}
              <div className="grid grid-cols-4 relative z-10">
                {/* ── STEP 1: Broker Chosen ── */}
                <div className="flex flex-col items-center text-center px-1">
                  <div className="w-12 h-12 rounded-[14px] bg-[#5240F2] text-white flex items-center justify-center shadow-sm shrink-0">
                    <UserPlus className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div className="font-semibold text-xs sm:text-[13px] text-[#5240F2] mt-3">
                    Guild Chosen
                  </div>
                </div>

                {/* ── STEP 2: Link Trading Account ── */}
                <div className="flex flex-col items-center text-center px-1">
                  {isPending ? (
                    /* In Pending State: HFM Logo with glowing magenta border */
                    <>
                      <div className="w-12 h-12 rounded-[14px] p-[2px] bg-gradient-to-tr from-[#E11D89] via-[#FD02B0] to-[#E11D89] shadow-[0_0_12px_rgba(225,29,137,0.4)] flex items-center justify-center shrink-0">
                        <div className="w-full h-full rounded-[12px] bg-black text-white flex flex-col items-center justify-center overflow-hidden px-1 select-none">
                          <span className="text-[11px] font-black tracking-tight text-white leading-none">
                            {brokerName}
                          </span>
                          <div className="w-3.5 h-[1.5px] bg-[#E11D89] my-[2px]" />
                          <span className="text-[5px] text-white/80 font-bold leading-none tracking-tighter">
                            HF MARKETS
                          </span>
                        </div>
                      </div>
                      <div className="font-bold text-xs sm:text-[13px] text-[#5240F2] mt-3">
                        Sync Account
                      </div>
                      <div className="text-[11px] sm:text-xs text-slate-500 mt-1 leading-snug max-w-[140px]">
                        Broker's thinking... don't panic
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (onOpenConnectModal) {
                            onOpenConnectModal(brokerName);
                          } else {
                            onNavigateToTab('brokers');
                          }
                        }}
                        className="mt-2.5 px-3.5 py-1.5 rounded-lg bg-[#5240F2] hover:bg-[#4335C4] text-white text-[11px] sm:text-xs font-semibold shadow-xs transition-transform active:scale-95 cursor-pointer"
                      >
                        Register with Us
                      </button>
                    </>
                  ) : (
                    /* In Approved, Rejected, Unavailable States: Solid Purple with Link2 icon */
                    <>
                      <div className="w-12 h-12 rounded-[14px] bg-[#5240F2] text-white flex items-center justify-center shadow-sm shrink-0">
                        <Link2 className="w-5 h-5 stroke-[2.2]" />
                      </div>
                      <div className="font-semibold text-xs sm:text-[13px] text-[#5240F2] mt-3">
                        Account Synced
                      </div>
                    </>
                  )}
                </div>

                {/* ── STEP 3: Trade as Usual / Connection Denied / Account Archived ── */}
                <div className="flex flex-col items-center text-center px-1">
                  {isPending ? (
                    /* Pending state: Gray/lavender container */
                    <>
                      <div className="w-12 h-12 rounded-[14px] bg-[#EEF0F8] text-[#5240F2] flex items-center justify-center shrink-0">
                        <CandlestickChart className="w-5 h-5 stroke-[2.2]" />
                      </div>
                      <div className="font-semibold text-xs sm:text-[13px] text-slate-700 mt-3">
                        Raid the Market
                      </div>
                      <div className="text-[11px] sm:text-xs text-slate-500 mt-1 leading-snug max-w-[140px]">
                        Unlocks right after verification
                      </div>
                    </>
                  ) : isRejected ? (
                    /* Rejected state: Connection Denied */
                    <>
                      <div className="w-12 h-12 rounded-[14px] p-[2px] bg-gradient-to-tr from-[#E11D89] via-[#FD02B0] to-[#E11D89] shadow-[0_0_12px_rgba(225,29,137,0.4)] flex items-center justify-center shrink-0">
                        <div className="w-full h-full rounded-[12px] bg-black text-white flex flex-col items-center justify-center overflow-hidden px-1 select-none">
                          <span className="text-[11px] font-black tracking-tight text-white leading-none">
                            {brokerName}
                          </span>
                          <div className="w-3.5 h-[1.5px] bg-[#E11D89] my-[2px]" />
                          <span className="text-[5px] text-white/80 font-bold leading-none tracking-tighter">
                            HF MARKETS
                          </span>
                        </div>
                      </div>
                      <div className="font-bold text-xs sm:text-[13px] text-[#5240F2] mt-3">
                        Connection Denied
                      </div>
                      <div className="text-[11px] sm:text-xs text-slate-500 mt-1 leading-snug max-w-[140px]">
                        Let's get this sorted out
                      </div>
                      <button
                        type="button"
                        id="stepper-rejected-see-action-btn"
                        onClick={() => (onOpenDeniedPopup ? onOpenDeniedPopup() : setShowResolutionModal(true))}
                        className="mt-2.5 px-3.5 py-1.5 rounded-lg bg-[#5240F2] hover:bg-[#4335C4] text-white text-[11px] sm:text-xs font-semibold shadow-xs transition-transform active:scale-95 cursor-pointer"
                      >
                        See what you can do
                      </button>
                    </>
                  ) : isUnavailable ? (
                    /* Unavailable state: Account Archived */
                    <>
                      <div className="w-12 h-12 rounded-[14px] p-[2px] bg-gradient-to-tr from-[#E11D89] via-[#FD02B0] to-[#E11D89] shadow-[0_0_12px_rgba(225,29,137,0.4)] flex items-center justify-center shrink-0">
                        <div className="w-full h-full rounded-[12px] bg-black text-white flex flex-col items-center justify-center overflow-hidden px-1 select-none">
                          <span className="text-[11px] font-black tracking-tight text-white leading-none">
                            {brokerName}
                          </span>
                          <div className="w-3.5 h-[1.5px] bg-[#E11D89] my-[2px]" />
                          <span className="text-[5px] text-white/80 font-bold leading-none tracking-tighter">
                            HF MARKETS
                          </span>
                        </div>
                      </div>
                      <div className="font-bold text-xs sm:text-[13px] text-[#5240F2] mt-3">
                        Account Archived
                      </div>
                      <div className="text-[11px] sm:text-xs text-slate-500 mt-1 leading-snug max-w-[140px]">
                        Let's get this sorted out
                      </div>
                      <button
                        type="button"
                        id="stepper-unavailable-see-action-btn"
                        onClick={() => (onOpenUnavailablePopup ? onOpenUnavailablePopup() : setShowResolutionModal(true))}
                        className="mt-2.5 px-3.5 py-1.5 rounded-lg bg-[#5240F2] hover:bg-[#4335C4] text-white text-[11px] sm:text-xs font-semibold shadow-xs transition-transform active:scale-95 cursor-pointer"
                      >
                        See what you can do
                      </button>
                    </>
                  ) : (
                    /* Approved state: Trade as Usual */
                    <>
                      <div className="w-12 h-12 rounded-[14px] p-[2px] bg-gradient-to-tr from-[#E11D89] via-[#FD02B0] to-[#E11D89] shadow-[0_0_12px_rgba(225,29,137,0.4)] flex items-center justify-center shrink-0">
                        <div className="w-full h-full rounded-[12px] bg-black text-white flex flex-col items-center justify-center overflow-hidden px-1 select-none">
                          <span className="text-[11px] font-black tracking-tight text-white leading-none">
                            {brokerName}
                          </span>
                          <div className="w-3.5 h-[1.5px] bg-[#E11D89] my-[2px]" />
                          <span className="text-[5px] text-white/80 font-bold leading-none tracking-tighter">
                            HF MARKETS
                          </span>
                        </div>
                      </div>
                      <div className="font-bold text-xs sm:text-[13px] text-[#5240F2] mt-3">
                        Raid the Market
                      </div>
                      <div className="text-[11px] sm:text-xs text-slate-500 mt-1 leading-snug max-w-[140px]">
                        Ready to roll. Make your move!
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (onShowToast) {
                            onShowToast('Connecting to trading terminal...');
                          }
                          onNavigateToTab('signals');
                        }}
                        className="mt-2.5 px-4 py-1.5 rounded-lg bg-[#5240F2] hover:bg-[#4335C4] text-white text-[11px] sm:text-xs font-semibold shadow-xs transition-transform active:scale-95 cursor-pointer"
                      >
                        Trade Now
                      </button>
                    </>
                  )}
                </div>

                {/* ── STEP 4: Earn Cashback ── */}
                <div className="flex flex-col items-center text-center px-1">
                  <div className="w-12 h-12 rounded-[14px] bg-[#EEF0F8] text-[#5240F2] flex items-center justify-center shrink-0">
                    <DollarSign className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div className="font-semibold text-xs sm:text-[13px] text-slate-700 mt-3">
                    Harvest Cashback
                  </div>
                  <div className="text-[11px] sm:text-xs text-slate-500 mt-1 leading-snug max-w-[140px]">
                    Loot drops per lot, automatically
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          RESOLUTION POPUPS
          Connection Denied Popup.png & Connection Unavailable Popup.png
         ───────────────────────────────────────────────────────────── */}
      {isRejected && (
        <ConnectionDeniedPopup
          isOpen={showResolutionModal}
          onClose={() => setShowResolutionModal(false)}
          onReconnect={() => {
            setShowResolutionModal(false);
            if (onOpenConnectModal) {
              onOpenConnectModal(brokerName);
            } else {
              onNavigateToTab('brokers');
            }
          }}
          onExploreBrokers={() => {
            setShowResolutionModal(false);
            onNavigateToTab('brokers');
          }}
          brokerName={brokerName}
        />
      )}

      {isUnavailable && (
        <ConnectionUnavailablePopup
          isOpen={showResolutionModal}
          onClose={() => setShowResolutionModal(false)}
          onConnectNewBrokers={() => {
            setShowResolutionModal(false);
            onNavigateToTab('brokers');
          }}
          brokerName={brokerName}
        />
      )}
    </>
  );
};


import React, { useState } from 'react';
import { Broker } from '../types';
import {
  ArrowLeft,
  Check,
  Copy,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

interface ConnectToTruvoPageProps {
  broker: Broker | null;
  brokers: Broker[];
  onSelectBroker: (broker: Broker) => void;
  onBackToDashboard: () => void;
  onNavigateToCashback: () => void;
  onOpenConnectModal: (broker: Broker) => void;
  onShowToast?: (msg: string) => void;
}

export const ConnectToTruvoPage: React.FC<ConnectToTruvoPageProps> = ({
  broker,
  brokers,
  onSelectBroker,
  onBackToDashboard,
  onNavigateToCashback,
  onOpenConnectModal,
  onShowToast,
}) => {
  // Default to selected broker or HFM to match D12_Connect to MarketSyde.png
  const currentBroker = broker || brokers.find((b) => b.name === 'HFM') || brokers[0];
  const [activeMode, setActiveMode] = useState<'open_new' | 'already_have'>('open_new');
  const [copiedCode, setCopiedCode] = useState(false);
  const [partnerCode] = useState('xyz123');
  const [existingAccountId, setExistingAccountId] = useState('');
  const [isExistingSubmitted, setIsExistingSubmitted] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(partnerCode);
    setCopiedCode(true);
    onShowToast?.(`Partner code "${partnerCode}" copied to clipboard!`);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleLinkExisting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!existingAccountId.trim()) {
      onShowToast?.('Please enter your trading account number');
      return;
    }
    setIsExistingSubmitted(true);
    onShowToast?.(`Request submitted for ${currentBroker.name} account #${existingAccountId}!`);
  };

  return (
    <div className="w-full space-y-6 pb-20 animate-in fade-in duration-200">
      {/* Back button */}
      <div className="pt-1">
        <button
          onClick={onBackToDashboard}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-indigo-200/80 bg-white dark:bg-[#120d2b] dark:border-indigo-950 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-[#5945F1] hover:border-[#5945F1] transition-all shadow-2xs cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Brokers</span>
        </button>
      </div>

      {/* ─── 1. TOP TITLE HEADER (Exact match to D12_Connect to MarketSyde.png) ─── */}
      <div className="space-y-2.5">
        <h1 className="font-display text-3xl sm:text-4xl lg:text-[42px] font-black tracking-tight leading-tight">
          <span className="text-[#5945F1]">Let's Get Your Account Connecte</span>
          <span className="text-[#FE01B1]">d</span>
          <span className="text-[#CAEB0E]">.</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
          Follow the steps below to connect your broker and trading account. Once approved, you'll be ready to earn cashback, track your trading activity, and access rewards.
        </p>
      </div>

      {/* ─── 2. APPROVAL NOTICE BANNER ─── */}
      <div className="p-4 sm:p-4.5 rounded-2xl bg-[#F5F4FE] dark:bg-[#181238] border border-indigo-100/90 dark:border-indigo-950/60 text-xs sm:text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed shadow-2xs">
        <span>Approval may take 2–3 business days, depending on the broker's review process. You can track your application status anytime from your </span>
        <button
          type="button"
          onClick={onNavigateToCashback}
          className="font-bold underline text-[#5945F1] hover:text-[#4533db] transition-colors cursor-pointer"
        >
          Cashback dashboard
        </button>
        <span>.</span>
      </div>

      {/* ─── 3. TAB SWITCHER (Open New Account vs Already Have An Account) ─── */}
      <div className="flex justify-center pt-2">
        <div className="inline-flex items-center p-1 rounded-full bg-[#f1f3f9] dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700 shadow-inner">
          <button
            type="button"
            onClick={() => setActiveMode('open_new')}
            className={`px-6 py-2 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeMode === 'open_new'
                ? 'bg-white dark:bg-slate-900 text-[#5945F1] shadow-2xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Open New Account
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('already_have')}
            className={`px-6 py-2 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeMode === 'already_have'
                ? 'bg-white dark:bg-slate-900 text-[#5945F1] shadow-2xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Already Have An Account
          </button>
        </div>
      </div>

      {/* ─── 4. BROKER SHOWCASE CARD (Purple-Pink Gradient Border) ─── */}
      <div
        className="rounded-3xl bg-white dark:bg-[#120d2b] border-2 border-transparent bg-origin-border p-6 sm:p-7 shadow-xs relative overflow-hidden"
        style={{
          backgroundImage: 'linear-gradient(white, white), linear-gradient(135deg, #5945F1 0%, #FE01B1 100%)',
          backgroundOrigin: 'border-box',
          backgroundClip: 'padding-box, border-box',
        }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left device graphic preview (Desktop & tilted Phone mockup) */}
          <div className="lg:col-span-5 flex justify-center items-center">
            <div className="relative w-full max-w-[340px] h-[195px] rounded-2xl bg-[#0d121f] p-3 text-white shadow-xl flex flex-col justify-between overflow-hidden border border-slate-700">
              {/* Desktop Mockup Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <div className="px-1.5 py-0.5 rounded bg-red-600 font-black text-[10px] text-white tracking-tighter">
                    HFM
                  </div>
                  <span className="text-[10px] font-bold text-slate-300 tracking-wider">
                    HF MARKETS
                  </span>
                </div>
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                </div>
              </div>

              {/* Graphic Body */}
              <div className="py-2 space-y-1.5 z-10 max-w-[190px]">
                <div className="text-[11px] font-black text-white leading-tight uppercase tracking-tight">
                  TRADE THE MARKETS WITH THE <span className="text-red-500">BEST TRADING</span> CONDITIONS
                </div>
                <div className="text-[9px] text-slate-400 leading-snug">
                  CFDs on Forex, Commodities, Bonds, Metals, Energies, Shares, Indices and more with 1:2000 leverage.
                </div>
                <div className="pt-1">
                  <span className="px-3 py-1 rounded bg-[#CAEB0E] text-black font-black text-[9px] uppercase tracking-wider inline-block shadow-2xs">
                    Register
                  </span>
                </div>
              </div>

              {/* Mockup Floating Phone Card Overlay */}
              <div className="absolute -right-2 -bottom-2 w-32 h-44 bg-[#0a0f1d] rounded-xl border-2 border-slate-600 p-2.5 shadow-2xl rotate-3 flex flex-col justify-between z-20">
                <div className="flex items-center justify-between border-b border-slate-800 pb-1">
                  <span className="text-[9px] font-black text-red-500">HFM</span>
                  <span className="text-[7px] text-slate-400">LOGIN</span>
                </div>
                <div className="space-y-1 text-center py-1">
                  <div className="text-[8px] font-black text-white leading-tight uppercase">
                    TRADE THE MARKETS WITH THE <span className="text-red-500">BEST TRADING</span> CONDITIONS
                  </div>
                  <div className="px-2 py-0.5 rounded bg-[#CAEB0E] text-black font-extrabold text-[7px] uppercase inline-block">
                    Register
                  </div>
                </div>
                <div className="p-1 rounded bg-slate-900 border border-slate-800 text-[6.5px] text-amber-300 text-center font-bold">
                  ★ AWARDED BEST TRADING ACCOUNTS
                </div>
              </div>
            </div>
          </div>

          {/* Middle Broker Specs */}
          <div className="lg:col-span-4 space-y-2.5">
            <div className="flex items-center gap-2">
              <h2 className="font-display text-2xl sm:text-3xl font-black text-[#0b1c30] dark:text-white">
                {currentBroker.name}
              </h2>
              <span className="inline-flex items-center gap-1 text-[11px] font-black text-black bg-[#CAEB0E] px-2.5 py-0.5 rounded-full shadow-2xs">
                ✔ Verified
              </span>
            </div>

            <a
              href="#risk-warning"
              onClick={(e) => e.preventDefault()}
              className="text-xs text-[#5945F1] hover:underline font-semibold block"
            >
              70% of retail CFD accounts lose money
            </a>

            {/* Spec key-values with bullet points exactly as in screenshot */}
            <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1 pt-1">
              <div className="flex items-center">
                <span className="w-40 text-slate-500 dark:text-slate-400">• Settlement Period</span>
                <span className="font-semibold text-slate-900 dark:text-white">: Weekly</span>
              </div>
              <div className="flex items-center">
                <span className="w-40 text-slate-500 dark:text-slate-400">• Platform</span>
                <span className="font-semibold text-slate-900 dark:text-white">: MT4, MT5</span>
              </div>
              <div className="flex items-center">
                <span className="w-40 text-slate-500 dark:text-slate-400">• Leverage</span>
                <span className="font-semibold text-slate-900 dark:text-white">: 1000</span>
              </div>
              <div className="flex items-center">
                <span className="w-40 text-slate-500 dark:text-slate-400">• Min. Deposit Amount</span>
                <span className="font-semibold text-slate-900 dark:text-white">: 5</span>
              </div>
              <div className="flex items-center">
                <span className="w-40 text-slate-500 dark:text-slate-400">• Margin call/Stop out</span>
                <span className="font-semibold text-slate-900 dark:text-white">: 50% / 20%</span>
              </div>
              <div className="flex items-center">
                <span className="w-40 text-slate-500 dark:text-slate-400">• Supported Currencies</span>
                <span className="font-semibold text-slate-900 dark:text-white">: EUR, JPY, THB, USD, IDR, NGN</span>
              </div>
            </div>
          </div>

          {/* Right Highest Cashback Solid Purple Box */}
          <div className="lg:col-span-3 flex justify-center lg:justify-end">
            <div className="w-full sm:w-auto min-w-[185px] rounded-2xl bg-[#5945F1] text-white p-5 sm:p-6 shadow-md flex flex-col items-center justify-center text-center">
              <span className="text-xs font-semibold text-white/90">Highest Cashback</span>
              <span className="text-2xl sm:text-[26px] font-black font-display tracking-tight mt-1 text-white">
                $8.00 / lot
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 5. STEP BY STEP GUIDE (D12_Connect to MarketSyde.png) ─── */}
      {activeMode === 'open_new' ? (
        <div className="space-y-4">
          {/* ──────────────── STEP 1 CARD ──────────────── */}
          <div className="rounded-2xl bg-white dark:bg-[#120d2b] border border-slate-200/90 dark:border-slate-800 p-6 sm:p-7 shadow-2xs">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
              {/* Step 1 Left Details */}
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-xl bg-[#5945F1] text-white flex items-center justify-center font-bold text-base shrink-0 shadow-2xs">
                  1
                </div>

                <div className="space-y-3">
                  <h3 className="font-display text-base sm:text-lg font-black text-[#0b1c30] dark:text-white">
                    Create Account with &lt;&lt;{currentBroker.name}&gt;&gt;
                  </h3>

                  {/* 1.1 Open Broker Account */}
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                      1.1 Open Broker Account
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-lg leading-relaxed">
                      Create a new broker account via the link below. Once completed, simply move on to 1.2!
                    </p>
                  </div>

                  {/* 1.2 Open New Trading Account */}
                  <div className="space-y-0.5 pt-1">
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                      1.2 Open New Trading Account
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-lg leading-relaxed">
                      Enter the partner code while creating the new trading account
                    </p>
                  </div>

                  {/* Footnote note */}
                  <div className="pt-2 text-xs text-slate-400 italic">
                    *To receive cashback, don't forget to enter the partner code every time you open a new account.
                  </div>
                </div>
              </div>

              {/* Step 1 Right Action Button & Partner Code */}
              <div className="flex flex-col sm:items-end gap-3 shrink-0 pt-2 lg:pt-0">
                <a
                  href={`https://${currentBroker.name.toLowerCase()}.com`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-56 py-2.5 px-4 rounded-xl bg-[#5945F1] hover:bg-[#4533db] text-white font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap active:scale-95 text-center"
                >
                  <span>Go to &lt;&lt;{currentBroker.name}'s Name&gt;&gt;</span>
                </a>

                <div className="w-full sm:w-56 space-y-1">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                    Partner Code
                  </span>
                  <div className="flex items-center justify-between px-3.5 py-2 rounded-xl border border-indigo-200/90 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xs">
                    <span className="font-mono font-bold text-slate-800 dark:text-white text-sm">
                      {partnerCode}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="p-1 text-slate-400 hover:text-[#5945F1] transition-colors cursor-pointer"
                      title="Copy Partner Code"
                    >
                      {copiedCode ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ──────────────── STEP 2 CARD ──────────────── */}
          <div className="rounded-2xl bg-white dark:bg-[#120d2b] border border-slate-200/90 dark:border-slate-800 p-6 sm:p-7 shadow-2xs">
            <div className="flex items-start gap-4">
              <div className="w-9 h-9 rounded-xl bg-[#5945F1] text-white flex items-center justify-center font-bold text-base shrink-0 shadow-2xs">
                2
              </div>
              <div className="space-y-0.5">
                <h3 className="font-display text-base sm:text-lg font-black text-[#0b1c30] dark:text-white">
                  Pending Approval
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl">
                  Final registration may take 2 to 3 business days, depending on the Broker's processing time for account approval/IB creation.
                </p>
              </div>
            </div>
          </div>

          {/* ──────────────── PINK/PURPLE OUTLINE BANNER ──────────────── */}
          <div className="rounded-2xl border border-[#FE01B1] p-4 bg-white dark:bg-[#120d2b] shadow-2xs text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 text-center">
            Once your trading account is approved, return to our platform and complete the final steps to start earning cashback.
          </div>

          {/* ──────────────── STEPS 3, 4, 5 CONNECTED CARD ──────────────── */}
          <div className="rounded-2xl bg-white dark:bg-[#120d2b] border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-2xs relative">
            {/* Timeline Vertical Track */}
            <div className="absolute left-[38px] sm:left-[46px] top-12 bottom-12 w-0.5 bg-indigo-100 dark:bg-slate-800 -z-0" />

            <div className="space-y-7 relative z-10">
              {/* STEP 3 */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-xl bg-[#5945F1] text-white flex items-center justify-center font-bold text-base shrink-0 shadow-2xs">
                    3
                  </div>
                  <div>
                    <h3 className="font-display text-base font-black text-[#0b1c30] dark:text-white">
                      Register Trading Account
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                      Register your trading account details to receive cashback.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onOpenConnectModal(currentBroker)}
                  className="px-6 py-2.5 rounded-xl bg-[#5945F1] hover:bg-[#4533db] text-white font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer whitespace-nowrap active:scale-95 sm:self-center"
                >
                  Register to Marketsyde
                </button>
              </div>

              {/* STEP 4 */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-xl bg-[#5945F1] text-white flex items-center justify-center font-bold text-base shrink-0 shadow-2xs">
                    4
                  </div>
                  <div>
                    <h3 className="font-display text-base font-black text-[#0b1c30] dark:text-white">
                      Approval Status
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 max-w-xl">
                      Check if your trading account is approved in the 'My Cashback' menu. Process takes 1-2 business days depending on the broker.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onNavigateToCashback}
                  className="px-6 py-2.5 rounded-xl bg-[#5945F1] hover:bg-[#4533db] text-white font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer whitespace-nowrap active:scale-95 sm:self-center"
                >
                  Go to 'My Cashback'
                </button>
              </div>

              {/* STEP 5 */}
              <div className="flex items-start gap-4 pt-2">
                <div className="w-9 h-9 rounded-xl bg-[#5945F1] text-white flex items-center justify-center font-bold text-base shrink-0 shadow-2xs">
                  5
                </div>
                <div>
                  <h3 className="font-display text-base font-black text-[#0b1c30] dark:text-white">
                    Start Earning
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    Start trading for unlimited cashback when your account status is linked.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ──────────────── ALREADY HAVE AN ACCOUNT (IB TRANSFER FLOW) ──────────────── */
        <div className="rounded-2xl bg-white dark:bg-[#120d2b] border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-2xs space-y-6">
          <div className="space-y-2">
            <h3 className="font-display text-lg font-black text-[#0b1c30] dark:text-white">
              Transfer your existing {currentBroker.name} account to MarketSyde IB
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
              If you already have an account with {currentBroker.name}, you do not need to open a new profile. Simply transfer your account under MarketSyde IB to unlock cashback.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl border border-indigo-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 space-y-2">
              <span className="text-xs font-bold text-[#5945F1] uppercase tracking-wider">Method 1: Broker Client Portal</span>
              <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                Log into {currentBroker.name} Portal &gt; Partners / IB Transfer &gt; Enter Partner Code:
                <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-mono font-bold text-slate-900 dark:text-white text-xs">
                  <span>{partnerCode}</span>
                  <button onClick={handleCopyCode} className="text-[#5945F1] hover:underline cursor-pointer">
                    Copy
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-indigo-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 space-y-2">
              <span className="text-xs font-bold text-[#5945F1] uppercase tracking-wider">Method 2: Support Ticket</span>
              <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                Send an email to {currentBroker.name} Support from your registered address:
                <div className="mt-2 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg font-mono text-[11px] text-slate-600 dark:text-slate-400">
                  "Please transfer my account #{existingAccountId || 'XXXXXX'} under MarketSyde Partner ID: {partnerCode}"
                </div>
              </div>
            </div>
          </div>

          {/* Quick Submit Form */}
          <form onSubmit={handleLinkExisting} className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
              Submit your existing {currentBroker.name} Trading Account for Verification:
            </label>
            <div className="flex flex-col sm:flex-row gap-2.5 max-w-md">
              <input
                type="text"
                value={existingAccountId}
                onChange={(e) => setExistingAccountId(e.target.value)}
                placeholder="e.g. 1100087642"
                className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono focus:outline-hidden focus:border-[#5945F1]"
              />
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#5945F1] hover:bg-[#4533db] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                {isExistingSubmitted ? 'Submitted ✓' : 'Submit Account'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

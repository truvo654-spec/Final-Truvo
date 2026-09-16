import React, { useState } from 'react';
import { Broker } from '../types';
import {
  ArrowLeft,
  Check,
  Copy,
  ChevronRight,
  ExternalLink,
  Mail,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { GenerateIbEmailModal } from './GenerateIbEmailModal';

export type AlreadyHaveIbScenario = 'multi_ib' | 'single_ib' | 'restricted_ib';

interface ConnectToTruvoPageProps {
  broker: Broker | null;
  brokers: Broker[];
  onSelectBroker: (broker: Broker) => void;
  onBackToDashboard: () => void;
  backLabel?: string;
  onNavigateToCashback: () => void;
  onOpenConnectModal: (broker: Broker) => void;
  onShowToast?: (msg: string) => void;
}

export const ConnectToTruvoPage: React.FC<ConnectToTruvoPageProps> = ({
  broker,
  brokers,
  onSelectBroker,
  onBackToDashboard,
  backLabel,
  onNavigateToCashback,
  onOpenConnectModal,
  onShowToast,
}) => {
  // Default to selected broker or HFM to match D5, D6, D7 exactly
  const currentBroker = broker || brokers.find((b) => b.name === 'HFM') || brokers[0];
  const [activeMode, setActiveMode] = useState<'open_new' | 'already_have'>('already_have');
  const [ibScenario, setIbScenario] = useState<AlreadyHaveIbScenario>('multi_ib');
  const [copiedCode, setCopiedCode] = useState(false);
  const [partnerCode] = useState('xyz123');
  const [isGenerateEmailOpen, setIsGenerateEmailOpen] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(partnerCode);
    setCopiedCode(true);
    onShowToast?.(`Partner code "${partnerCode}" copied to clipboard!`);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleGoToBroker = () => {
    onShowToast?.(`Redirecting to ${currentBroker.name} portal...`);
    window.open(`https://${currentBroker.name.toLowerCase().replace(/\s+/g, '')}.com`, '_blank');
  };

  return (
    <div className="w-full space-y-6 pb-20 animate-in fade-in duration-200">
      {/* Back button */}
      <div className="pt-1 flex items-center justify-between">
        <button
          onClick={onBackToDashboard}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-indigo-200/80 bg-white dark:bg-[#120d2b] dark:border-indigo-950 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-[#5338ec] hover:border-[#5338ec] transition-all shadow-2xs cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{backLabel || 'Back to Brokers'}</span>
        </button>

        {/* Quick Broker Switcher if user wants to test with different brokers */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">Broker:</span>
          <select
            value={currentBroker.name}
            onChange={(e) => {
              const selected = brokers.find((b) => b.name === e.target.value);
              if (selected) onSelectBroker(selected);
            }}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-[#120d2b] border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white focus:outline-hidden focus:border-[#5338ec] cursor-pointer"
          >
            {brokers.map((b) => (
              <option key={b.name} value={b.name}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ─── 1. TOP TITLE HEADER (Exact Match: Connecte in purple, d in pink, . in lime) ─── */}
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

      {/* ─── 2. APPROVAL NOTICE BANNER (Lavender box) ─── */}
      <div className="p-4 sm:p-4.5 rounded-2xl bg-[#F5F4FE] dark:bg-[#181238] border border-indigo-100/90 dark:border-indigo-950/60 text-xs sm:text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed shadow-2xs">
        <span>Approval may take 2–3 business days, depending on the broker's review process. You can track your application status anytime from your </span>
        <button
          type="button"
          onClick={onNavigateToCashback}
          className="font-bold underline text-[#5945F1] hover:text-[#4533db] transition-colors cursor-pointer"
        >
          Cashback dashboard.
        </button>
      </div>

      {/* ─── 3. TAB SWITCHER (Open New Account vs Already Have An Account) ─── */}
      <div className="flex flex-col items-center gap-3 pt-2">
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

        {/* ─── 3.1 SUB-SCENARIO SWITCHER (Multi-IB vs Single-IB vs Restricted IB) ─── */}
        {activeMode === 'already_have' && (
          <div className="w-full max-w-2xl flex flex-col sm:flex-row items-center justify-between gap-2.5 p-2 sm:p-2.5 rounded-2xl bg-gradient-to-r from-slate-50 via-indigo-50/40 to-slate-50 dark:from-slate-900/80 dark:to-slate-900/80 border border-slate-200/90 dark:border-slate-800 shadow-2xs animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="flex items-center gap-2 pl-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Connection Scenario:
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden md:inline">
                ({ibScenario === 'multi_ib' ? 'Image D5' : ibScenario === 'single_ib' ? 'Image D6' : 'Image D7'})
              </span>
            </div>
            <div className="flex items-center gap-1 p-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
              <button
                type="button"
                onClick={() => {
                  setIbScenario('multi_ib');
                  onShowToast?.('Switched to Multi-IB scenario (D5)');
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  ibScenario === 'multi_ib'
                    ? 'bg-[#5338ec] text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-[#5338ec] hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                Multi-IB
              </button>
              <button
                type="button"
                onClick={() => {
                  setIbScenario('single_ib');
                  onShowToast?.('Switched to Single-IB scenario (D6)');
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  ibScenario === 'single_ib'
                    ? 'bg-[#5338ec] text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-[#5338ec] hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                Single-IB
              </button>
              <button
                type="button"
                onClick={() => {
                  setIbScenario('restricted_ib');
                  onShowToast?.('Switched to Restricted IB scenario (D7)');
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  ibScenario === 'restricted_ib'
                    ? 'bg-[#5338ec] text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-[#5338ec] hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                Restricted IB
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─── 4. BROKER SHOWCASE CARD (Purple-Pink Gradient Border - Exact across D5, D6, D7) ─── */}
      <div className="rounded-2xl p-[2px] bg-gradient-to-r from-[#5945F1] via-[#7B35FA] to-[#FE01B1] shadow-xs">
        <div className="rounded-[14px] bg-white dark:bg-[#120d2b] p-6 sm:p-7">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left device graphic preview (Desktop & tilted Phone mockup) */}
            <div className="lg:col-span-5 flex justify-center items-center">
              <div className="relative w-full max-w-[340px] h-[195px] rounded-2xl bg-[#0d121f] p-3 text-white shadow-xl flex flex-col justify-between overflow-hidden border border-slate-700">
                {/* Desktop Mockup Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="px-1.5 py-0.5 rounded bg-red-600 font-black text-[10px] text-white tracking-tighter">
                      {currentBroker.name}
                    </div>
                    <span className="text-[10px] font-bold text-slate-300 tracking-wider">
                      {currentBroker.name === 'HFM' ? 'HF MARKETS' : currentBroker.name.toUpperCase()}
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
                    <span className="text-[9px] font-black text-red-500">{currentBroker.name}</span>
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
      </div>

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* ─── 5. STEPS SECTION: DYNAMIC ACCORDING TO MODE & SCENARIO ─── */}
      {/* ──────────────────────────────────────────────────────────────────────── */}

      {/* ──────────────────── OPEN NEW ACCOUNT MODE (D12) ──────────────────── */}
      {activeMode === 'open_new' && (
        <div className="space-y-4">
          {/* STEP 1 CARD */}
          <div className="rounded-2xl bg-white dark:bg-[#120d2b] border border-slate-200/90 dark:border-slate-800 p-6 sm:p-7 shadow-2xs">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-xl bg-[#5945F1] text-white flex items-center justify-center font-bold text-base shrink-0 shadow-2xs">
                  1
                </div>

                <div className="space-y-3">
                  <h3 className="font-display text-base sm:text-lg font-black text-[#0b1c30] dark:text-white">
                    Create Account with &lt;&lt;{currentBroker.name}&gt;&gt;
                  </h3>

                  <div className="space-y-0.5">
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                      1.1 Open Broker Account
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-lg leading-relaxed">
                      Create a new broker account via the link below. Once completed, simply move on to 1.2!
                    </p>
                  </div>

                  <div className="space-y-0.5 pt-1">
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                      1.2 Open New Trading Account
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-lg leading-relaxed">
                      Enter the partner code while creating the new trading account
                    </p>
                  </div>

                  <div className="pt-2 text-xs text-slate-400 italic">
                    *To receive cashback, don't forget to enter the partner code every time you open a new account.
                  </div>
                </div>
              </div>

              {/* Right Button & Partner Code */}
              <div className="flex flex-col sm:items-end gap-3 shrink-0 pt-2 lg:pt-0">
                <button
                  type="button"
                  onClick={handleGoToBroker}
                  className="w-full sm:w-60 py-2.5 px-4 rounded-xl bg-[#5338ec] hover:bg-[#4533db] text-white font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center justify-between cursor-pointer active:scale-95"
                >
                  <span className="flex-1 text-center">Go to &lt;&lt;{currentBroker.name}&gt;&gt;</span>
                  <span className="w-5 h-5 rounded-full bg-black flex items-center justify-center text-white shrink-0 ml-2">
                    <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />
                  </span>
                </button>

                <div className="w-full sm:w-60 space-y-1">
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
                      className="p-1 text-[#5338ec] hover:text-[#4326d8] transition-colors cursor-pointer"
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

          {/* STEP 2 CARD */}
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

          {/* PINK/MAGENTA OUTLINE NOTICE BANNER */}
          <div className="rounded-2xl border border-[#FE01B1] p-4 bg-white dark:bg-[#120d2b] shadow-2xs text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 text-center">
            Once your trading account is approved, return to our platform and complete the final steps to start earning cashback.
          </div>

          {/* STEPS 3, 4, 5 CONNECTED CARD */}
          <div className="rounded-2xl bg-white dark:bg-[#120d2b] border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-2xs relative">
            <div className="absolute left-[39px] sm:left-[47px] top-12 bottom-12 w-0.5 bg-indigo-100 dark:bg-slate-800" />

            <div className="space-y-7 relative z-10">
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
      )}

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* ─── SCENARIO 1: MULTI-IB (Image D5 - Already Have An Account_Multi-IB) ─── */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      {activeMode === 'already_have' && ibScenario === 'multi_ib' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* STEP 1 CARD (D5: Create New Trading Account) */}
          <div className="rounded-2xl bg-white dark:bg-[#120d2b] border border-slate-200/90 dark:border-slate-800 p-6 sm:p-7 shadow-2xs">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
              {/* Step 1 Left Details */}
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-xl bg-[#5945F1] text-white flex items-center justify-center font-bold text-base shrink-0 shadow-2xs">
                  1
                </div>

                <div className="space-y-3">
                  <h3 className="font-display text-base sm:text-lg font-black text-[#0b1c30] dark:text-white">
                    Create New Trading Account
                  </h3>

                  {/* 1.1 Open Trading Account */}
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                      1.1 Open Trading Account
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-lg leading-relaxed">
                      Open a new live trading account through the link and use the partner code provided to ensure your account is linked correctly.
                    </p>
                  </div>

                  {/* 1.2 Enter Partner Code */}
                  <div className="space-y-0.5 pt-1">
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                      1.2 Enter Partner Code
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-lg leading-relaxed">
                      Open a trading account and enter the code in the Partner Code field.
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
                <button
                  type="button"
                  onClick={handleGoToBroker}
                  className="w-full sm:w-60 py-2.5 px-4 rounded-xl bg-[#5338ec] hover:bg-[#4533db] text-white font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center justify-between cursor-pointer active:scale-95"
                >
                  <span className="flex-1 text-center">Go to &lt;&lt;{currentBroker.name}&gt;&gt;</span>
                  <span className="w-5 h-5 rounded-full bg-black flex items-center justify-center text-white shrink-0 ml-2">
                    <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />
                  </span>
                </button>

                <div className="w-full sm:w-60 space-y-1">
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
                      className="p-1 text-[#5338ec] hover:text-[#4326d8] transition-colors cursor-pointer"
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

          {/* PINK/MAGENTA OUTLINE NOTICE BANNER (Exact Match) */}
          <div className="rounded-2xl border border-[#FE01B1] p-4 bg-white dark:bg-[#120d2b] shadow-2xs text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 text-center">
            Once your trading account is approved, return to our platform and complete the final steps to start earning cashback.
          </div>

          {/* STEPS 2, 3, 4 CONNECTED CARD (D5: Connected with vertical line) */}
          <div className="rounded-2xl bg-white dark:bg-[#120d2b] border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-2xs relative">
            {/* Timeline Vertical Track */}
            <div className="absolute left-[39px] sm:left-[47px] top-12 bottom-12 w-0.5 bg-indigo-100 dark:bg-slate-800" />

            <div className="space-y-7 relative z-10">
              {/* STEP 2: Register Trading Account */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-xl bg-[#5945F1] text-white flex items-center justify-center font-bold text-base shrink-0 shadow-2xs">
                    2
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

              {/* STEP 3: Pending Approval */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-xl bg-[#5945F1] text-white flex items-center justify-center font-bold text-base shrink-0 shadow-2xs">
                    3
                  </div>
                  <div>
                    <h3 className="font-display text-base font-black text-[#0b1c30] dark:text-white">
                      Pending Approval
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

              {/* STEP 4: Start Earning */}
              <div className="flex items-start gap-4 pt-2">
                <div className="w-9 h-9 rounded-xl bg-[#5945F1] text-white flex items-center justify-center font-bold text-base shrink-0 shadow-2xs">
                  4
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
      )}

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* ─── SCENARIO 2: SINGLE-IB (Image D6 - Already Have An Account_Single-IB) ─── */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      {activeMode === 'already_have' && ibScenario === 'single_ib' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* STEP 1 CARD (D6: Request IB Transfer) */}
          <div className="rounded-2xl bg-white dark:bg-[#120d2b] border border-slate-200/90 dark:border-slate-800 p-6 sm:p-7 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-xl bg-[#5945F1] text-white flex items-center justify-center font-bold text-base shrink-0 shadow-2xs">
                  1
                </div>
                <div className="space-y-1">
                  <h3 className="font-display text-base sm:text-lg font-black text-[#0b1c30] dark:text-white">
                    Request IB Transfer
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
                    Fill in your details, and we will generate a transfer email for you. Then, copy the drafted message into your email and send it to your broker as shown in the template.
                  </p>
                </div>
              </div>

              {/* Right Button: Generate Email with Black Circle */}
              <button
                type="button"
                onClick={() => setIsGenerateEmailOpen(true)}
                className="w-full sm:w-60 py-2.5 px-5 rounded-xl bg-[#5338ec] hover:bg-[#4533db] text-white font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center justify-between cursor-pointer active:scale-95 shrink-0"
              >
                <span className="flex-1 text-center">Generate Email</span>
                <span className="w-5 h-5 rounded-full bg-black flex items-center justify-center text-white shrink-0 ml-2">
                  <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />
                </span>
              </button>
            </div>
          </div>

          {/* STEP 2 CARD (D6: Pending Approval - Standalone Card) */}
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
                  Final registration may take up to 2 to 3 business days, depending on the Broker's processing time for account approval/IB creation.
                </p>
              </div>
            </div>
          </div>

          {/* PINK/MAGENTA OUTLINE NOTICE BANNER (Exact Match) */}
          <div className="rounded-2xl border border-[#FE01B1] p-4 bg-white dark:bg-[#120d2b] shadow-2xs text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 text-center">
            Once your trading account is approved, return to our platform and complete the final steps to start earning cashback.
          </div>

          {/* STEPS 3, 4, 5 CONNECTED CARD (D6: Connected with vertical line) */}
          <div className="rounded-2xl bg-white dark:bg-[#120d2b] border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-2xs relative">
            <div className="absolute left-[39px] sm:left-[47px] top-12 bottom-12 w-0.5 bg-indigo-100 dark:bg-slate-800" />

            <div className="space-y-7 relative z-10">
              {/* STEP 3: Register Trading Account */}
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

              {/* STEP 4: Approval Status */}
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

              {/* STEP 5: Start Earning */}
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
      )}

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* ─── SCENARIO 3: RESTRICTED IB (Image D7 - Already Have An Account_Restricted IB) ─── */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      {activeMode === 'already_have' && ibScenario === 'restricted_ib' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* STEP 1 CARD (D7: IB Setup with Two Stacked Buttons) */}
          <div className="rounded-2xl bg-white dark:bg-[#120d2b] border border-slate-200/90 dark:border-slate-800 p-6 sm:p-7 shadow-2xs">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
              {/* Left Details */}
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-xl bg-[#5945F1] text-white flex items-center justify-center font-bold text-base shrink-0 shadow-2xs">
                  1
                </div>

                <div className="space-y-3">
                  <h3 className="font-display text-base sm:text-lg font-black text-[#0b1c30] dark:text-white">
                    IB Setup
                  </h3>

                  {/* Paragraph 1 */}
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed">
                    <strong className="text-slate-900 dark:text-white">If NO IB is linked:</strong> Fill in your details and we will prepare the email request for you. Copy it, send it to your broker, so you can continue with the next steps.
                  </p>

                  {/* Paragraph 2 */}
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed">
                    <strong className="text-slate-900 dark:text-white">If you are already registered under another IB,</strong> a direct change is not allowed. Please follow the steps below, and proceed to the next instructions.
                  </p>

                  {/* Numbered Sub-Instructions */}
                  <div className="space-y-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xl pl-1">
                    <div>1. Sign up using a different email address via our dedicated link here.</div>
                    <div>2. Open a new trading account.</div>
                  </div>
                </div>
              </div>

              {/* Right Action Buttons (Stacked Vertically with Black Circles) */}
              <div className="flex flex-col sm:items-end gap-3 shrink-0 pt-2 lg:pt-0">
                <button
                  type="button"
                  onClick={() => setIsGenerateEmailOpen(true)}
                  className="w-full sm:w-60 py-2.5 px-4 rounded-xl bg-[#5338ec] hover:bg-[#4533db] text-white font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center justify-between cursor-pointer active:scale-95"
                >
                  <span className="flex-1 text-center">Generate Email</span>
                  <span className="w-5 h-5 rounded-full bg-black flex items-center justify-center text-white shrink-0 ml-2">
                    <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleGoToBroker}
                  className="w-full sm:w-60 py-2.5 px-4 rounded-xl bg-[#5338ec] hover:bg-[#4533db] text-white font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center justify-between cursor-pointer active:scale-95"
                >
                  <span className="flex-1 text-center">Go to &lt;&lt;{currentBroker.name}&gt;&gt;</span>
                  <span className="w-5 h-5 rounded-full bg-black flex items-center justify-center text-white shrink-0 ml-2">
                    <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* STEP 2 CARD (D7: Pending Approval - Standalone Card) */}
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
                  Final registration may take up to 2 to 3 business days, depending on the Broker's processing time for account approval/IB creation.
                </p>
              </div>
            </div>
          </div>

          {/* PINK/MAGENTA OUTLINE NOTICE BANNER (Exact Match) */}
          <div className="rounded-2xl border border-[#FE01B1] p-4 bg-white dark:bg-[#120d2b] shadow-2xs text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 text-center">
            Once your trading account is approved, return to our platform and complete the final steps to start earning cashback.
          </div>

          {/* STEPS 3, 4, 5 CONNECTED CARD (D7: Connected with vertical line) */}
          <div className="rounded-2xl bg-white dark:bg-[#120d2b] border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-2xs relative">
            <div className="absolute left-[39px] sm:left-[47px] top-12 bottom-12 w-0.5 bg-indigo-100 dark:bg-slate-800" />

            <div className="space-y-7 relative z-10">
              {/* STEP 3: Register Trading Account */}
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

              {/* STEP 4: Approval Status */}
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

              {/* STEP 5: Start Earning */}
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
      )}

      {/* ─── EMAIL GENERATION MODAL (For Single-IB & Restricted IB) ─── */}
      <GenerateIbEmailModal
        isOpen={isGenerateEmailOpen}
        onClose={() => setIsGenerateEmailOpen(false)}
        broker={currentBroker}
        partnerCode={partnerCode}
        scenarioType={ibScenario === 'restricted_ib' ? 'restricted_ib' : 'single_ib'}
        onShowToast={onShowToast}
      />
    </div>
  );
};


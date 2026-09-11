import React, { useState } from 'react';
import { Broker } from '../types';
import {
  ArrowLeft,
  Check,
  Copy,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  Info,
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
  // Default to HFM or selected broker matching screenshot
  const currentBroker = broker || brokers.find((b) => b.name === 'HFM') || brokers[0];
  const [activeMode, setActiveMode] = useState<'open_new' | 'already_have'>('open_new');
  const [copiedCode, setCopiedCode] = useState(false);
  const [partnerCode] = useState('xyz123');
  const [tradingAccountId, setTradingAccountId] = useState('');
  const [isLinked, setIsLinked] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(partnerCode);
    setCopiedCode(true);
    onShowToast?.(`Partner code "${partnerCode}" copied to clipboard!`);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleLinkExisting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tradingAccountId.trim()) {
      onShowToast?.('Please enter your trading account number');
      return;
    }
    setIsLinked(true);
    onShowToast?.(`Request submitted for ${currentBroker.name} account #${tradingAccountId}!`);
  };

  return (
    <div className="w-full space-y-6 pb-16 animate-in fade-in duration-200">
      {/* Back button */}
      <div>
        <button
          onClick={onBackToDashboard}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-[#5945F1] transition-colors shadow-2xs cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </button>
      </div>

      {/* ─── 1. TOP TITLE HEADER ─── */}
      <div className="space-y-2 pt-1">
        <h1 className="font-display text-2xl sm:text-3xl lg:text-[34px] font-extrabold tracking-tight leading-tight">
          <span className="text-[#5945F1]">Let us help you get starte</span>
          <span className="text-[#FD02B0]">d.</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
          Getting set up is easy with provided options, follow these steps to set up. Once the account is ready, start trading and earning cashback
        </p>
      </div>

      {/* ─── 2. APPROVAL NOTICE BANNER ─── */}
      <div className="p-4 rounded-2xl bg-[#f4f6fb] border border-slate-200/80 text-xs sm:text-sm text-slate-600 leading-relaxed shadow-2xs">
        <span>Approval may take 2 to 3 business days, depending on the broker's processing time for account approval or IB transfer. Please check your approval status in the </span>
        <button
          onClick={onNavigateToCashback}
          className="font-bold underline text-slate-900 hover:text-[#5945F1] transition-colors cursor-pointer"
        >
          Cashback
        </button>
        <span> menu</span>
      </div>

      {/* ─── 3. TAB SWITCHER (Open New Account vs Already Have An Account) ─── */}
      <div className="flex justify-center pt-2">
        <div className="inline-flex items-center p-1 rounded-2xl bg-slate-100/90 border border-slate-200/70 shadow-inner">
          <button
            onClick={() => setActiveMode('open_new')}
            className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeMode === 'open_new'
                ? 'bg-white text-[#5945F1] shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Open New Account
          </button>
          <button
            onClick={() => setActiveMode('already_have')}
            className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeMode === 'already_have'
                ? 'bg-white text-[#5945F1] shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Already Have An Account
          </button>
        </div>
      </div>

      {/* ─── 4. BROKER SHOWCASE CARD ─── */}
      <div className="rounded-3xl bg-white border-2 border-transparent bg-origin-border p-6 shadow-xs relative overflow-hidden"
           style={{
             backgroundImage: 'linear-gradient(white, white), linear-gradient(135deg, #5945F1 0%, #FD02B0 100%)',
             backgroundOrigin: 'border-box',
             backgroundClip: 'padding-box, border-box',
           }}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left device graphic preview */}
          <div className="lg:col-span-5 flex justify-center items-center">
            <div className="relative w-full max-w-[320px] h-[190px] rounded-2xl bg-gradient-to-br from-slate-900 to-black p-3.5 text-white shadow-xl flex flex-col justify-between overflow-hidden border border-slate-800">
              {/* Mockup UI Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-black text-white flex items-center justify-center font-black text-[9px] border border-slate-700">
                    {currentBroker.name.substring(0, 3)}
                  </div>
                  <span className="text-[11px] font-bold text-slate-200">TRADE THE MARKETS</span>
                </div>
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                </div>
              </div>

              {/* Graphic Body */}
              <div className="py-2 space-y-1">
                <div className="text-xs font-black text-white leading-tight uppercase tracking-tight">
                  WITH THE <span className="text-amber-400">BEST TRADING</span> CONDITIONS
                </div>
                <div className="text-[10px] text-slate-400 leading-snug">
                  Ultra-fast execution, raw spreads & zero swap accounts available.
                </div>
              </div>

              {/* Mockup Floating Phone Card */}
              <div className="absolute -right-3 -bottom-2 w-28 h-36 bg-slate-900/95 rounded-xl border-2 border-slate-700 p-2 shadow-2xl rotate-3 flex flex-col justify-between">
                <div className="text-[8px] font-bold text-amber-400">AWARDED BEST TRADING</div>
                <div className="space-y-1 text-[7px] text-slate-300">
                  <div className="flex justify-between"><span>EUR/USD</span><span className="text-emerald-400">1.0845</span></div>
                  <div className="flex justify-between"><span>XAU/USD</span><span className="text-amber-400">2,340.5</span></div>
                  <div className="flex justify-between"><span>BTC/USD</span><span className="text-purple-400">68,200</span></div>
                </div>
                <div className="py-0.5 rounded-md bg-[#5945F1] text-[8px] font-bold text-center text-white">
                  REGISTER
                </div>
              </div>
            </div>
          </div>

          {/* Middle Broker Specs */}
          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center gap-2.5">
              <h2 className="font-display text-2xl font-black text-[#0b1c30]">
                {currentBroker.name}
              </h2>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-900 bg-[#a3e635] px-2.5 py-0.5 rounded-full">
                ✔ Verified
              </span>
            </div>

            <a
              href="#risk"
              onClick={(e) => e.preventDefault()}
              className="text-xs text-[#2563eb] hover:underline font-medium block"
            >
              70% of retail CFD accounts lose money
            </a>

            {/* Spec key-values */}
            <div className="text-xs text-slate-600 space-y-1 font-mono pt-1">
              <div className="flex items-center">
                <span className="w-36 text-slate-500 font-sans">Settlement Period</span>
                <span className="font-semibold text-slate-800">: Weekly</span>
              </div>
              <div className="flex items-center">
                <span className="w-36 text-slate-500 font-sans">Platform</span>
                <span className="font-semibold text-slate-800">: MT4, MT5</span>
              </div>
              <div className="flex items-center">
                <span className="w-36 text-slate-500 font-sans">Leverage</span>
                <span className="font-semibold text-slate-800">: 1000</span>
              </div>
              <div className="flex items-center">
                <span className="w-36 text-slate-500 font-sans">Min. Deposit Amount</span>
                <span className="font-semibold text-slate-800">: 5</span>
              </div>
              <div className="flex items-center">
                <span className="w-36 text-slate-500 font-sans">Margin call/Stop out</span>
                <span className="font-semibold text-slate-800">: 50% / 20%</span>
              </div>
              <div className="flex items-center">
                <span className="w-36 text-slate-500 font-sans">Supported Currencies</span>
                <span className="font-semibold text-slate-800">: EUR, JPY, THB, USD, IDR, NGN</span>
              </div>
            </div>
          </div>

          {/* Right Highest Cashback Badge */}
          <div className="lg:col-span-3 flex justify-center lg:justify-end">
            <div className="w-full sm:w-auto min-w-[170px] rounded-2xl bg-[#5945F1] text-white p-5 shadow-md flex flex-col items-center justify-center text-center">
              <span className="text-xs font-semibold text-white/90">Highest Cashback</span>
              <span className="text-xl sm:text-2xl font-black font-display tracking-tight mt-0.5">
                $8.00 / lot
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 5. STEP BY STEP GUIDE ─── */}
      {activeMode === 'open_new' ? (
        <div className="rounded-2xl bg-white border border-slate-200/90 p-6 sm:p-8 shadow-2xs space-y-8">
          {/* STEP 1 */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-9 h-9 rounded-xl bg-[#5945F1] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs">
                1
              </div>
              <div>
                <h3 className="font-display text-base sm:text-lg font-extrabold text-[#0b1c30]">
                  Sign-up to Truvo
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Create an account to start earning cashback on every trade.
                </p>
              </div>
            </div>

            <div className="self-end sm:self-center">
              <button
                disabled
                className="px-6 py-2 rounded-xl border border-slate-300 bg-white text-slate-400 font-semibold text-xs shadow-2xs cursor-default"
              >
                Signed Up
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-slate-100" />

          {/* STEP 2 */}
          <div className="flex items-start gap-4">
            <div className="w-9 h-9 rounded-xl bg-[#5945F1] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs">
              2
            </div>

            <div className="flex-1 space-y-6 min-w-0">
              <div>
                <h3 className="font-display text-base sm:text-lg font-extrabold text-[#0b1c30]">
                  Create Account with &lt;&lt;{currentBroker.name}&gt;&gt;
                </h3>
              </div>

              {/* 2.1 Open Account */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-[#0b1c30]">2.1 Open Account</h4>
                  <p className="text-xs text-slate-500 max-w-lg leading-relaxed">
                    Create a new Broker account via the link below, and once that's done, don't forget to move on to 2.2!
                  </p>
                </div>

                <a
                  href={`https://${currentBroker.name.toLowerCase()}.com`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 px-6 py-2.5 rounded-xl bg-[#5945F1] hover:bg-[#4734dc] text-white font-bold text-xs shadow-xs transition-all cursor-pointer whitespace-nowrap active:scale-95"
                >
                  <span>Go to &lt;&lt;{currentBroker.name}&gt;&gt;</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* 2.2 Enter Partner Code */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pt-3">
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-[#0b1c30]">2.2 Enter Partner Code</h4>
                  <p className="text-xs text-slate-500 max-w-lg leading-relaxed">
                    Open a trading account and enter the code in the Partner Code field.
                  </p>
                </div>

                <div className="space-y-1 w-full sm:w-56">
                  <label className="text-xs font-semibold text-slate-700 block">Partner Code</label>
                  <div className="flex items-center justify-between px-3 py-2 rounded-xl border border-slate-300 bg-white shadow-2xs">
                    <span className="font-mono font-bold text-slate-800 text-sm tracking-wide">
                      {partnerCode}
                    </span>
                    <button
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

              {/* Footer Note */}
              <div className="pt-2 text-xs text-slate-400 leading-relaxed">
                * Every time you open a new trading account, you must enter the partner code to receive up to 100% rebate.
              </div>

              {/* Step 2.3 Ready to Link */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="text-xs text-slate-600">
                  Already created your account on {currentBroker.name}? Connect your account number now:
                </span>
                <button
                  onClick={() => onOpenConnectModal(currentBroker)}
                  className="px-5 py-2 rounded-xl border border-[#5945F1] text-[#5945F1] hover:bg-indigo-50 font-bold text-xs transition-colors cursor-pointer whitespace-nowrap shadow-2xs"
                >
                  Link Account Number
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ALREADY HAVE AN ACCOUNT (IB TRANSFER GUIDE) */
        <div className="rounded-2xl bg-white border border-slate-200/90 p-6 sm:p-8 shadow-2xs space-y-6">
          <div className="space-y-2">
            <h3 className="font-display text-lg font-black text-[#0b1c30]">
              Transfer your existing {currentBroker.name} account to Truvo IB
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              If you already trade with {currentBroker.name}, you do not need to open a new profile. Simply request an IB transfer through your broker's cabinet or support.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <span className="text-xs font-bold text-[#5945F1] uppercase tracking-wider">Method 1: Partner Transfer</span>
              <div className="text-xs text-slate-700 leading-relaxed">
                Log into {currentBroker.name} Client Portal &gt; Go to <strong>Partners / IB</strong> &gt; Enter Partner Code:
                <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-white border border-slate-300 rounded-lg font-mono font-bold text-slate-900 text-xs">
                  <span>{partnerCode}</span>
                  <button onClick={handleCopyCode} className="text-[#5945F1] hover:underline cursor-pointer">
                    Copy
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <span className="text-xs font-bold text-[#5945F1] uppercase tracking-wider">Method 2: Support Ticket</span>
              <div className="text-xs text-slate-700 leading-relaxed">
                Email {currentBroker.name} Support from your registered email:
                <div className="mt-2 p-2 bg-white border border-slate-200 rounded-lg font-mono text-[11px] text-slate-600">
                  "Please transfer my account #{tradingAccountId || 'XXXXXX'} under Partner ID: {partnerCode}"
                </div>
              </div>
            </div>
          </div>

          {/* Quick Submit Form */}
          <form onSubmit={handleLinkExisting} className="pt-4 border-t border-slate-100 space-y-3">
            <label className="block text-xs font-bold text-slate-800">
              Submit your existing {currentBroker.name} Trading Account for Verification:
            </label>
            <div className="flex flex-col sm:flex-row gap-2.5 max-w-md">
              <input
                type="text"
                value={tradingAccountId}
                onChange={(e) => setTradingAccountId(e.target.value)}
                placeholder="e.g. 1100087642"
                className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:outline-hidden focus:border-[#5945F1]"
              />
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#5945F1] hover:bg-[#4734dc] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                {isLinked ? 'Submitted ✓' : 'Submit Account'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

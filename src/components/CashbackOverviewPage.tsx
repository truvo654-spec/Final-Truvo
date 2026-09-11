import React, { useState } from 'react';
import {
  ArrowLeft,
  ChevronRight,
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
} from 'lucide-react';
import { UserProfile, Broker, MarketSignal } from '../types';

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
  // Accordion state
  const [openFaq, setOpenFaq] = useState<number | null>(0); // 0 open by default as in screenshot

  const toggleFaq = (index: number) => {
    setOpenFaq((prev) => (prev === index ? null : index));
  };

  const handleConnectClick = (brokerName: string) => {
    const found = brokers.find((b) => b.name.toLowerCase().includes(brokerName.toLowerCase())) || brokers[0];
    if (onNavigateToConnectBroker) {
      onNavigateToConnectBroker(found);
    } else {
      onOpenConnectModal(found);
    }
  };

  const featuredBrokers = [
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
  ];

  // Most recent signals list matching screenshot
  const recentSignalsData = [
    { ticker: 'EUR/USD', change: '+0.33%', type: 'buy', sparkColor: '#16a34a' },
    { ticker: 'GOOGL', change: '-0.11%', type: 'sell', sparkColor: '#5945F1' },
    { ticker: 'BTC/USD', change: 'Premium', type: 'upgrade', sparkColor: '#FD02B0' },
    { ticker: 'S&P 500', change: '+0.44%', type: 'buy', sparkColor: '#16a34a' },
    { ticker: 'XAU/USD', change: '+0.24%', type: 'buy', sparkColor: '#16a34a' },
  ];

  return (
    <div className="w-full space-y-8 pb-20 animate-in fade-in duration-200">
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
          Cashback Overview
        </h1>
      </div>

      {/* ─── TOP SECTION: 3 PANELS ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Panel 1: Your Total Cashback ($0.00) (approx 3.5 cols) */}
        <div className="lg:col-span-4 rounded-3xl bg-white border-2 border-[#FD02B0]/80 p-6 shadow-2xs flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <div className="text-4xl sm:text-5xl font-black tracking-tight text-[#5945F1] font-display">
                $0.00
              </div>
              <div className="text-xs sm:text-sm font-semibold text-slate-700 mt-1">
                Your Total Cashback
              </div>
            </div>

            <div>
              <span className="text-xs font-bold text-[#2563eb]">
                5.00 Lots Traded
              </span>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100">
            <p className="text-xs text-slate-400 leading-relaxed">
              Your total cashback reflects all cashback credited from eligible trades across your connected trading accounts.
            </p>
          </div>
        </div>

        {/* Panel 2: Your cashback starts here (approx 4.5 cols) */}
        <div className="lg:col-span-5 rounded-3xl bg-white border border-slate-200/90 p-6 shadow-2xs flex flex-col justify-between">
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
              {featuredBrokers.map((b) => (
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
        </div>

        {/* Panel 3: Right Stacked (approx 3 cols) */}
        <div className="lg:col-span-3 space-y-4 flex flex-col justify-between">
          {/* Card 1: You're on the board. */}
          <div className="rounded-2xl bg-white border border-slate-200/90 p-4 shadow-2xs space-y-3">
            <div>
              <h4 className="font-display font-extrabold text-sm text-[#0b1c30]">
                You're on the boar<span className="text-[#FD02B0]">d.</span>
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                Just connect a broker and trade to unlock your next rank!
              </p>
            </div>

            {/* Rank progression illustration */}
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
          </div>

          {/* Card 2: Most Recent Signals. */}
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
                      <span className={`text-[10px] font-mono font-semibold ${s.change.startsWith('+') ? 'text-emerald-600' : 'text-[#5945F1]'}`}>
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

      {/* ─── MIDDLE PURPLE BANNER: READY TO EARN YOUR FIRST CASHBACK? ─── */}
      <div className="rounded-3xl bg-[#5945F1] text-white p-7 sm:p-9 shadow-md space-y-6">
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-black text-[#CAEB0E] tracking-tight">
            Ready To Earn Your First Cashback?
          </h2>
          <p className="text-xs sm:text-sm text-white/90 mt-1">
            A few simple steps and your cashback won't be empty for long!
          </p>
        </div>

        {/* 4 Steps Row */}
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

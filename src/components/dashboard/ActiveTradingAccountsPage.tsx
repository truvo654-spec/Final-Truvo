import React, { useState } from 'react';
import { Broker } from '../../types';
import { ArrowLeft, Info } from 'lucide-react';

interface ActiveTradingAccountsPageProps {
  brokers: Broker[];
  onBackToDashboard: () => void;
  onSelectBroker: (broker: Broker) => void;
  onShowToast?: (msg: string) => void;
}

interface LinkedBrokerItem {
  id: string;
  name: string;
  cashbackRates: string[];
  accounts: {
    label: string;
    accountNumber: string;
    hasTooltip?: boolean;
    tooltipText?: string;
  }[];
}

export const ActiveTradingAccountsPage: React.FC<ActiveTradingAccountsPageProps> = ({
  brokers,
  onBackToDashboard,
  onSelectBroker,
  onShowToast,
}) => {
  // State to toggle the speech balloon tooltip matching D2 screenshot
  const [activeTooltipId, setActiveTooltipId] = useState<string | null>('icmarkets-0');

  // Find actual broker objects from brokers array or fallback
  const getBrokerObj = (name: string): Broker => {
    const found = brokers.find((b) => b.name.toLowerCase() === name.toLowerCase());
    if (found) return found;
    return (
      brokers[0] || {
        id: name.toLowerCase().replace(/\s+/g, ''),
        name,
        logo: '',
        verified: true,
        isTopPick: true,
        hasCashback: true,
        score: 9.8,
        maxCashback: 'Up to $8 / lot',
        cashbackPerLot: 8.0,
        spread: '0.1 pips',
        leverage: '1:1000',
        minDeposit: '$5',
        regulation: 'FCA, CySEC, FSA',
        tradingPlatforms: ['MT4', 'MT5'],
        accountTypes: ['Standard', 'Pro', 'Cent'],
        depositMethods: ['Visa', 'Mastercard', 'Crypto'],
        features: ['Instant Withdrawals', 'Negative Balance Protection'],
        reviewCount: 342,
      }
    );
  };

  const linkedBrokers: LinkedBrokerItem[] = [
    {
      id: 'xm',
      name: 'XM',
      cashbackRates: [
        'Cash Back: Up to $70 (Top up, Copy Trading, Crypto, Premium, Cent)',
        'Cash Back: Up to $19.6 (Pro, Zero)',
      ],
      accounts: [
        { label: 'Premium', accountNumber: '1100012001' },
        { label: 'Pro', accountNumber: '1100012001' },
      ],
    },
    {
      id: 'hfm',
      name: 'HFM',
      cashbackRates: [
        'Cash Back: 20% of the spread (Standard, Cent, Social Standard)',
        'Cash Back: 12.5% of the spread (Pro, Social Pro)',
        'Cash Back: Up to $9 (Raw Spread, Zero)',
      ],
      accounts: [{ label: 'Cent Active', accountNumber: '1100012001' }],
    },
    {
      id: 'exness',
      name: 'Exness',
      cashbackRates: [
        'Cash Back: Up to 35% (Standard, Instant, Fixed, FxPro, Edge)',
        'Cash Back: Up to $19.6 (Pro, Zero)',
      ],
      accounts: [{ label: 'Standard Active', accountNumber: '1100012001' }],
    },
    {
      id: 'icmarkets',
      name: 'IC Markets',
      cashbackRates: [
        'Cash Back: 21% (Standard, Standard cent)',
        'Cash Back: 15.40% (Pro)',
        'Cash Back: Up to $2.67 (Raw Spread)',
      ],
      accounts: [
        {
          label: 'Raw Spread Active',
          accountNumber: '1100012001',
          hasTooltip: true,
          tooltipText:
            "You have already connected a 'Raw Spread' account. You can link additional accounts of this type if supported by your broker",
        },
      ],
    },
  ];

  const handleAddTradingAccount = (brokerName: string) => {
    const broker = getBrokerObj(brokerName);
    onShowToast?.(`Opening connection steps for ${broker.name}...`);
    onSelectBroker(broker);
  };

  const renderLogo = (brokerId: string) => {
    switch (brokerId) {
      case 'xm':
        return (
          <div className="w-14 h-14 rounded-2xl bg-black flex items-center justify-center p-2 shrink-0 relative overflow-hidden select-none shadow-xs border border-slate-800">
            <div
              className="absolute top-0 right-0 w-3.5 h-3.5 bg-[#E11928]"
              style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }}
            />
            <span className="font-black text-white text-xl tracking-tight">XM</span>
          </div>
        );
      case 'hfm':
        return (
          <div className="w-14 h-14 rounded-2xl bg-black flex flex-col items-center justify-center text-white shrink-0 p-2 select-none shadow-xs border border-slate-800">
            <div className="flex items-center font-black text-base leading-none tracking-tight">
              <span className="text-white">HF</span>
              <span className="text-[#E11928]">M</span>
            </div>
            <span className="text-[6.5px] text-slate-300 font-bold uppercase tracking-wider mt-1 leading-none">
              BY MARKETS
            </span>
          </div>
        );
      case 'exness':
        return (
          <div className="w-14 h-14 rounded-2xl bg-[#FFCC00] flex items-center justify-center text-black shrink-0 p-2 select-none shadow-xs">
            <span className="font-black text-2xl tracking-tighter">ex</span>
          </div>
        );
      case 'icmarkets':
      default:
        return (
          <div className="w-14 h-14 rounded-2xl bg-black flex flex-col items-center justify-center shrink-0 p-2 select-none shadow-xs border border-slate-800">
            <div className="flex items-end gap-1 h-3.5">
              <span className="w-1 h-2 bg-[#00D084] rounded-xs" />
              <span className="w-1 h-3 bg-[#00D084] rounded-xs" />
              <span className="w-1 h-3.5 bg-[#00D084] rounded-xs" />
            </div>
            <span className="text-[7.5px] text-white font-black leading-none mt-1 tracking-tight">
              IC Markets
            </span>
            <span className="text-[5.5px] text-slate-400 font-bold uppercase tracking-tighter leading-none mt-0.5">
              Global
            </span>
          </div>
        );
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-160px)] bg-[#FAFBFD] dark:bg-[#0c081e] py-8 sm:py-10 animate-in fade-in duration-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Back navigation */}
        <div className="pt-1">
          <button
            onClick={onBackToDashboard}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-indigo-200/80 bg-white dark:bg-[#120d2b] dark:border-indigo-950 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-[#5240F2] hover:border-[#5240F2] transition-all shadow-2xs cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </button>
        </div>

        {/* ─── PAGE TITLE (Exact match to D2 - Select Linked Broker.png) ─── */}
        <div className="pt-1 pb-2">
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            <span className="text-[#5240F2]">Active Trading Accoun</span>
            <span className="text-[#FD02B0]">t</span>
          </h1>
        </div>

        {/* ─── BROKER LISTING STACK ─── */}
        <div className="space-y-4 sm:space-y-5">
          {linkedBrokers.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-indigo-200/80 dark:border-indigo-950/60 bg-white dark:bg-[#120d2b] p-5 sm:p-6 shadow-2xs hover:shadow-xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              {/* Left Details */}
              <div className="flex items-start gap-4 sm:gap-5 flex-1">
                {renderLogo(item.id)}

                <div className="space-y-2 flex-1 min-w-0">
                  {/* Broker Name */}
                  <h2 className="font-display text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                    {item.name}
                  </h2>

                  {/* Cash Back Specs */}
                  <div className="text-xs sm:text-[13px] text-slate-500 dark:text-slate-400 space-y-0.5 font-normal leading-relaxed">
                    {item.cashbackRates.map((rate, idx) => (
                      <div key={idx}>{rate}</div>
                    ))}
                  </div>

                  {/* Active Connected Account Chips */}
                  <div className="pt-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      {item.accounts.map((acc, accIdx) => {
                        const tooltipKey = `${item.id}-${accIdx}`;
                        const isTooltipOpen = activeTooltipId === tooltipKey;

                        return (
                          <div key={accIdx} className="relative">
                            <button
                              type="button"
                              onClick={() =>
                                setActiveTooltipId(isTooltipOpen ? null : tooltipKey)
                              }
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ECFDF3] dark:bg-emerald-950/40 border border-[#A6F4C5] dark:border-emerald-800 text-[#027A48] dark:text-emerald-300 text-xs font-semibold select-none hover:bg-[#d1fadf] dark:hover:bg-emerald-900/60 transition-colors cursor-pointer"
                              title="Click to view details"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-[#12B76A]" />
                              <span>
                                {acc.label} • {acc.accountNumber}
                              </span>
                              <Info className="w-3.5 h-3.5 text-[#027A48] dark:text-emerald-400" />
                            </button>

                            {/* Speech balloon / Tooltip for account info */}
                            {acc.hasTooltip && isTooltipOpen && (
                              <div className="absolute left-0 top-full mt-2 z-30 w-72 sm:w-80 animate-in fade-in zoom-in-95 duration-150">
                                {/* Upward caret triangle */}
                                <div className="absolute -top-1.5 left-6 w-3 h-3 bg-[#F6F5FE] dark:bg-[#1f1747] border-t border-l border-[#E1DEFD] dark:border-indigo-900 rotate-45" />
                                <div className="relative p-3 rounded-xl bg-[#F6F5FE] dark:bg-[#1f1747] border border-[#E1DEFD] dark:border-indigo-900 text-slate-800 dark:text-slate-200 text-xs leading-relaxed shadow-md">
                                  {acc.tooltipText}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Action Button (Lead to d12_connect to marketsyde) */}
              <div className="shrink-0 flex items-center md:self-center pt-2 md:pt-0">
                <button
                  type="button"
                  onClick={() => handleAddTradingAccount(item.name)}
                  className="w-full sm:w-auto px-7 py-3 rounded-xl bg-[#5240F2] hover:bg-[#4332dc] text-white font-bold text-sm shadow-xs transition-all active:scale-[0.98] cursor-pointer text-center whitespace-nowrap"
                >
                  Add Trading Account
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

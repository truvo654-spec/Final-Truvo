import React, { useState, useMemo } from 'react';
import { Broker, UserProfile } from '../../types';
import { Search, Filter, ArrowLeft, ChevronDown, Check } from 'lucide-react';

interface BrokerRebateTablePageProps {
  broker: Broker;
  user: UserProfile;
  onBack: () => void;
  onShowToast?: (msg: string) => void;
}

type LevelCategory = 'Beginner' | 'Intermediate' | 'Pro' | 'Expert';
type InstrumentType = 'All' | 'Indices' | 'Forex' | 'Commodities' | 'Crypto';
type AccountTypeFilter = 'All' | 'Bonus' | 'Standard' | 'Premium' | 'Pro' | 'Zero (ECN)';

interface RebateRowItem {
  id: string;
  accountType: string;
  instrument: string;
  symbol: string;
  symbolCode: string;
  badgeType: 'msci' | 'russell' | 'sp' | 'topix' | 'bovespa' | 'nifty' | 'kospi' | 'tsx' | 'forex' | 'gold' | 'crypto';
  badgeColor: string;
  baseCashback: number; // Beginner rate
}

const DEFAULT_REBATE_ROWS: RebateRowItem[] = [
  {
    id: 'idx-1',
    accountType: 'Bonus',
    instrument: 'Indices',
    symbol: 'MSCIEMEA',
    symbolCode: 'MSCIEMEA',
    badgeType: 'msci',
    badgeColor: '#0072CE',
    baseCashback: 4.20,
  },
  {
    id: 'idx-2',
    accountType: 'Bonus',
    instrument: 'Indices',
    symbol: 'MSCIAsia',
    symbolCode: 'MSCIAsia',
    badgeType: 'msci',
    badgeColor: '#0072CE',
    baseCashback: 4.25,
  },
  {
    id: 'idx-3',
    accountType: 'Bonus',
    instrument: 'Indices',
    symbol: 'Russell2000',
    symbolCode: 'Russell2000',
    badgeType: 'russell',
    badgeColor: '#C41230',
    baseCashback: 4.10,
  },
  {
    id: 'idx-4',
    accountType: 'Bonus',
    instrument: 'Indices',
    symbol: 'S&P1500',
    symbolCode: 'S&P1500',
    badgeType: 'sp',
    badgeColor: '#D92228',
    baseCashback: 4.35,
  },
  {
    id: 'idx-5',
    accountType: 'Bonus',
    instrument: 'Indices',
    symbol: 'S&P600',
    symbolCode: 'S&P600',
    badgeType: 'sp',
    badgeColor: '#1E293B',
    baseCashback: 4.55,
  },
  {
    id: 'idx-6',
    accountType: 'Bonus',
    instrument: 'Indices',
    symbol: 'TOPIX',
    symbolCode: 'TOPIX',
    badgeType: 'topix',
    badgeColor: '#D92228',
    baseCashback: 4.50,
  },
  {
    id: 'idx-7',
    accountType: 'Bonus',
    instrument: 'Indices',
    symbol: 'Bovespa',
    symbolCode: 'Bovespa',
    badgeType: 'bovespa',
    badgeColor: '#002776',
    baseCashback: 4.60,
  },
  {
    id: 'idx-8',
    accountType: 'Bonus',
    instrument: 'Indices',
    symbol: 'Nifty50',
    symbolCode: 'Nifty50',
    badgeType: 'nifty',
    badgeColor: '#FF671F',
    baseCashback: 4.40,
  },
  {
    id: 'idx-9',
    accountType: 'Bonus',
    instrument: 'Indices',
    symbol: 'KOSPI',
    symbolCode: 'KOSPI',
    badgeType: 'kospi',
    badgeColor: '#0047A0',
    baseCashback: 4.75,
  },
  {
    id: 'idx-10',
    accountType: 'Bonus',
    instrument: 'Indices',
    symbol: 'S&PTSX',
    symbolCode: 'S&PTSX',
    badgeType: 'tsx',
    badgeColor: '#002D62',
    baseCashback: 4.80,
  },
  // Additional Instruments for standard/premium/pro accounts
  {
    id: 'fx-1',
    accountType: 'Pro',
    instrument: 'Forex',
    symbol: 'EUR/USD',
    symbolCode: 'EURUSD',
    badgeType: 'forex',
    badgeColor: '#5945F1',
    baseCashback: 8.00,
  },
  {
    id: 'fx-2',
    accountType: 'Standard',
    instrument: 'Forex',
    symbol: 'GBP/USD',
    symbolCode: 'GBPUSD',
    badgeType: 'forex',
    badgeColor: '#5945F1',
    baseCashback: 6.00,
  },
  {
    id: 'comm-1',
    accountType: 'Premium',
    instrument: 'Commodities',
    symbol: 'XAU/USD (Gold)',
    symbolCode: 'XAUUSD',
    badgeType: 'gold',
    badgeColor: '#E5A919',
    baseCashback: 7.00,
  },
  {
    id: 'cry-1',
    accountType: 'Pro',
    instrument: 'Crypto',
    symbol: 'BTC/USD',
    symbolCode: 'BTCUSD',
    badgeType: 'crypto',
    badgeColor: '#F7931A',
    baseCashback: 5.50,
  },
];

// Level multipliers
const LEVEL_MULTIPLIERS: Record<LevelCategory, number> = {
  Beginner: 1.0,
  Intermediate: 1.15,
  Pro: 1.25,
  Expert: 1.5,
};

export const BrokerRebateTablePage: React.FC<BrokerRebateTablePageProps> = ({
  broker,
  user,
  onBack,
  onShowToast,
}) => {
  const [selectedLevel, setSelectedLevel] = useState<LevelCategory>('Beginner');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInstrument, setSelectedInstrument] = useState<InstrumentType>('All');
  const [selectedAccountType, setSelectedAccountType] = useState<AccountTypeFilter>('All');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  // Filtered rows
  const filteredRows = useMemo(() => {
    return DEFAULT_REBATE_ROWS.filter((row) => {
      // Instrument filter
      if (selectedInstrument !== 'All' && row.instrument !== selectedInstrument) {
        return false;
      }
      // Account type filter
      if (selectedAccountType !== 'All' && row.accountType !== selectedAccountType) {
        return false;
      }
      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchAccount = row.accountType.toLowerCase().includes(query);
        const matchInstrument = row.instrument.toLowerCase().includes(query);
        const matchSymbol = row.symbol.toLowerCase().includes(query);
        const multiplier = LEVEL_MULTIPLIERS[selectedLevel];
        const rate = (row.baseCashback * multiplier).toFixed(2);
        const matchRate = rate.includes(query);
        if (!matchAccount && !matchInstrument && !matchSymbol && !matchRate) {
          return false;
        }
      }
      return true;
    });
  }, [selectedInstrument, selectedAccountType, searchQuery, selectedLevel]);

  const levelMultiplier = LEVEL_MULTIPLIERS[selectedLevel];

  // Render symbol graphic/pill
  const renderSymbolBadge = (row: RebateRowItem) => {
    switch (row.badgeType) {
      case 'msci':
        return (
          <div className="flex items-center gap-2">
            <span className="w-5 h-3.5 rounded-[3px] bg-[#EBF3FC] text-[#0072CE] border border-[#0072CE]/30 text-[7px] font-black tracking-tight flex items-center justify-center shrink-0">
              MSCI
            </span>
            <span className="font-semibold text-slate-800 text-xs">{row.symbol}</span>
          </div>
        );
      case 'russell':
        return (
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-[#C41230] text-white text-[7px] font-bold flex items-center justify-center shrink-0">
              R
            </span>
            <span className="font-semibold text-slate-800 text-xs">{row.symbol}</span>
          </div>
        );
      case 'sp':
        return (
          <div className="flex items-center gap-2">
            <span className="px-1 py-0.5 rounded-[3px] bg-red-50 text-[#D92228] border border-[#D92228]/30 text-[7px] font-black tracking-tighter flex items-center justify-center shrink-0">
              S&P
            </span>
            <span className="font-semibold text-slate-800 text-xs">{row.symbol}</span>
          </div>
        );
      case 'topix':
        return (
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-red-600 text-white text-[6px] font-black flex items-center justify-center shrink-0">
              T
            </span>
            <span className="font-semibold text-slate-800 text-xs">{row.symbol}</span>
          </div>
        );
      case 'bovespa':
        return (
          <div className="flex items-center gap-2">
            <span className="px-1 py-0.5 rounded-[3px] bg-blue-50 text-[#002776] border border-[#002776]/30 text-[7px] font-bold flex items-center justify-center shrink-0">
              [B]³
            </span>
            <span className="font-semibold text-slate-800 text-xs">{row.symbol}</span>
          </div>
        );
      case 'nifty':
        return (
          <div className="flex items-center gap-2">
            <span className="px-1 py-0.5 rounded-[3px] bg-orange-50 text-[#FF671F] border border-[#FF671F]/30 text-[7px] font-extrabold flex items-center justify-center shrink-0">
              N50
            </span>
            <span className="font-semibold text-slate-800 text-xs">{row.symbol}</span>
          </div>
        );
      case 'kospi':
        return (
          <div className="flex items-center gap-2">
            <span className="px-1 py-0.5 rounded-[3px] bg-blue-50 text-[#0047A0] border border-[#0047A0]/30 text-[7px] font-bold flex items-center justify-center shrink-0">
              KRX
            </span>
            <span className="font-semibold text-slate-800 text-xs">{row.symbol}</span>
          </div>
        );
      case 'tsx':
        return (
          <div className="flex items-center gap-2">
            <span className="px-1 py-0.5 rounded-[3px] bg-slate-100 text-[#002D62] border border-[#002D62]/30 text-[7px] font-black flex items-center justify-center shrink-0">
              TSX
            </span>
            <span className="font-semibold text-slate-800 text-xs">{row.symbol}</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-md bg-[#5945F1]/10 text-[#5945F1] text-[8px] font-bold flex items-center justify-center shrink-0">
              FX
            </span>
            <span className="font-semibold text-slate-800 text-xs">{row.symbol}</span>
          </div>
        );
    }
  };

  return (
    <div className="w-full space-y-7 pb-20 animate-in fade-in duration-200">
      {/* Back button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-[#5945F1] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to {broker.name} Details</span>
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          HERO SECTION (Exact match to D02_Cashback Rebate Table_Default View.png)
         ───────────────────────────────────────────────────────────── */}
      <div className="text-center space-y-3 pt-2">
        {/* HFM Squircle Logo */}
        <div className="w-14 h-14 rounded-2xl bg-black flex flex-col items-center justify-center text-white mx-auto shadow-sm p-1.5">
          <div className="font-black text-sm tracking-tight leading-none flex items-center">
            <span>HF</span>
            <span className="text-[#D92228]">M</span>
          </div>
          <span className="text-[5px] text-white/90 font-bold tracking-widest mt-0.5 uppercase">
            HF MARKETS
          </span>
        </div>

        {/* Title: HFM Cashback Rate Details (Details ending in vibrant pink 's') */}
        <h1 className="font-display font-black text-2xl sm:text-3xl text-[#5945F1] tracking-tight">
          {broker.name} Cashback Rate Detail<span className="text-[#FD02B0]">s</span>
        </h1>

        {/* Subtitle */}
        <p className="text-xs text-slate-500 max-w-xl mx-auto font-medium leading-relaxed">
          Select Account Type and Instrument to view the applicable cashback rate. Symbol is enabled only when it is relevant.
        </p>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TABS & SEARCH SECTION (Exact match to D02)
         ───────────────────────────────────────────────────────────── */}
      <div className="space-y-3 pt-4">
        {/* Level Tabs (Beginner, Intermediate, Pro, Expert) */}
        <div className="border-b border-indigo-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {(['Beginner', 'Intermediate', 'Pro', 'Expert'] as LevelCategory[]).map((level) => {
            const isActive = selectedLevel === level;
            return (
              <button
                key={level}
                type="button"
                onClick={() => {
                  setSelectedLevel(level);
                  onShowToast?.(`Switched to ${level} tier rates`);
                }}
                className={`px-5 py-2.5 text-xs font-bold transition-all relative cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'border-t-2 border-x border-[#5945F1]/30 bg-white text-[#5945F1] rounded-t-xl -mb-[1px] shadow-2xs font-extrabold'
                    : 'text-slate-600 hover:text-[#5945F1] rounded-t-xl'
                }`}
              >
                {level}
              </button>
            );
          })}
        </div>

        {/* Search Bar + Filter Funnel Button */}
        <div className="flex items-center gap-3 relative">
          <div className="flex-1 h-11 rounded-xl border border-slate-200/90 bg-white px-3.5 flex items-center gap-2.5 text-xs text-slate-800 placeholder-slate-400 focus-within:border-[#5945F1] focus-within:ring-2 focus-within:ring-[#5945F1]/10 shadow-2xs transition-all">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by account type, instrument, symbol, cashback amount"
              className="w-full bg-transparent outline-none text-xs text-slate-800 placeholder-slate-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-xs text-slate-400 hover:text-slate-600 font-bold px-1.5"
              >
                ×
              </button>
            )}
          </div>

          {/* Filter button with dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
              className={`h-11 w-11 rounded-xl border flex items-center justify-center transition-all cursor-pointer shadow-2xs ${
                selectedInstrument !== 'All' || selectedAccountType !== 'All'
                  ? 'border-[#5945F1] bg-[#5945F1]/10 text-[#5945F1]'
                  : 'border-slate-200/90 hover:border-[#5945F1]/50 text-[#5945F1] bg-white'
              }`}
              title="Filter by instrument and account type"
            >
              <Filter className="w-4 h-4 stroke-[2.2]" />
            </button>

            {/* Filter Dropdown Popover */}
            {isFilterDropdownOpen && (
              <div className="absolute right-0 top-12 z-30 w-64 bg-white rounded-2xl border border-slate-200 shadow-xl p-4 space-y-4 animate-in fade-in duration-150">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                    Instrument
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {(['All', 'Indices', 'Forex', 'Commodities', 'Crypto'] as InstrumentType[]).map((inst) => (
                      <button
                        key={inst}
                        type="button"
                        onClick={() => setSelectedInstrument(inst)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                          selectedInstrument === inst
                            ? 'bg-[#5945F1] text-white font-bold'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {inst}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                    Account Type
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {(['All', 'Bonus', 'Standard', 'Premium', 'Pro', 'Zero (ECN)'] as AccountTypeFilter[]).map((acc) => (
                      <button
                        key={acc}
                        type="button"
                        onClick={() => setSelectedAccountType(acc)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                          selectedAccountType === acc
                            ? 'bg-[#5945F1] text-white font-bold'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {acc}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedInstrument('All');
                      setSelectedAccountType('All');
                      setSearchQuery('');
                      setIsFilterDropdownOpen(false);
                    }}
                    className="text-xs text-slate-400 hover:text-slate-700 cursor-pointer font-medium"
                  >
                    Reset
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsFilterDropdownOpen(false)}
                    className="px-3 py-1 rounded-lg bg-[#5945F1] text-white text-xs font-bold cursor-pointer hover:bg-[#4734dc]"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          REBATE TABLE (Exact match to D02 layout & typography)
         ───────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-indigo-100/90 bg-white overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-indigo-100/70 bg-[#fafaff]">
                <th className="py-3.5 px-6 font-bold text-[#5945F1] text-xs">
                  Account Type
                </th>
                <th className="py-3.5 px-6 font-bold text-[#5945F1] text-xs">
                  Instrument
                </th>
                <th className="py-3.5 px-6 font-bold text-[#5945F1] text-xs">
                  Symbol
                </th>
                <th className="py-3.5 px-6 font-bold text-[#5945F1] text-xs">
                  Cashback
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRows.length > 0 ? (
                filteredRows.map((row) => {
                  const calculatedRate = (row.baseCashback * levelMultiplier).toFixed(2);
                  return (
                    <tr
                      key={row.id}
                      className="hover:bg-indigo-50/20 transition-colors"
                    >
                      {/* Account Type */}
                      <td className="py-3.5 px-6 font-medium text-slate-800 text-xs">
                        {row.accountType}
                      </td>

                      {/* Instrument */}
                      <td className="py-3.5 px-6 font-medium text-slate-700 text-xs">
                        {row.instrument}
                      </td>

                      {/* Symbol with Mini Logo */}
                      <td className="py-3.5 px-6">
                        {renderSymbolBadge(row)}
                      </td>

                      {/* Cashback Rate */}
                      <td className="py-3.5 px-6 font-extrabold text-[#0b1c30] text-xs">
                        ${calculatedRate}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400">
                    No cashback rates match your search or filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Info Notice */}
      <div className="text-center text-[11px] text-slate-400 pt-2">
        Rates displayed reflect verified {broker.name} rebate schedules updated in real time via MarketSyde IB protocols.
      </div>
    </div>
  );
};

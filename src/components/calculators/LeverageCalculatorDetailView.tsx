import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Search, Plus, Minus } from 'lucide-react';

interface CurrencyItem {
  code: string;
  name: string;
  type: 'fiat' | 'crypto';
  flag?: string;
  cryptoColor?: string;
  cryptoSymbol?: string;
}

const ACCOUNT_CURRENCIES: CurrencyItem[] = [
  { code: 'AUD', name: 'Australian Dollar', type: 'fiat', flag: '🇦🇺' },
  { code: 'BCH', name: 'Bitcoin Cash', type: 'crypto', cryptoColor: '#0ac18e', cryptoSymbol: '₿' },
  { code: 'BTC', name: 'Bitcoin', type: 'crypto', cryptoColor: '#f7931a', cryptoSymbol: '₿' },
  { code: 'CAD', name: 'Canadian Dollar', type: 'fiat', flag: '🇨🇦' },
  { code: 'CHF', name: 'Swiss Franc', type: 'fiat', flag: '🇨🇭' },
  { code: 'CNH', name: 'Chinese Yuan', type: 'fiat', flag: '🇨🇳' },
  { code: 'CNY', name: 'Chinese Yuan', type: 'fiat', flag: '🇨🇳' },
  { code: 'CZK', name: 'Czech Koruna', type: 'fiat', flag: '🇨🇿' },
  { code: 'DKK', name: 'Danish Krone', type: 'fiat', flag: '🇩🇰' },
  { code: 'DOGE', name: 'Dogecoin', type: 'crypto', cryptoColor: '#c2a633', cryptoSymbol: 'Ð' },
  { code: 'DSH', name: 'Dashcoin', type: 'crypto', cryptoColor: '#008de4', cryptoSymbol: 'Đ' },
  { code: 'EOS', name: 'EOS', type: 'crypto', cryptoColor: '#2a2a2a', cryptoSymbol: 'ε' },
  { code: 'ETH', name: 'Ethereum', type: 'crypto', cryptoColor: '#627eea', cryptoSymbol: 'Ξ' },
  { code: 'EUR', name: 'Euro', type: 'fiat', flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound', type: 'fiat', flag: '🇬🇧' },
  { code: 'HKD', name: 'Hong Kong Dollar', type: 'fiat', flag: '🇭🇰' },
  { code: 'JPY', name: 'Japanese Yen', type: 'fiat', flag: '🇯🇵' },
  { code: 'MXN', name: 'Mexican Peso', type: 'fiat', flag: '🇲🇽' },
  { code: 'NOK', name: 'Norwegian Krone', type: 'fiat', flag: '🇳🇴' },
  { code: 'NZD', name: 'New Zealand Dollar', type: 'fiat', flag: '🇳🇿' },
  { code: 'PLN', name: 'Polish Zloty', type: 'fiat', flag: '🇵🇱' },
  { code: 'SEK', name: 'Swedish Krona', type: 'fiat', flag: '🇸🇪' },
  { code: 'SGD', name: 'Singapore Dollar', type: 'fiat', flag: '🇸🇬' },
  { code: 'THB', name: 'Thai Baht', type: 'fiat', flag: '🇹🇭' },
  { code: 'TRY', name: 'Turkish Lira', type: 'fiat', flag: '🇹🇷' },
  { code: 'USD', name: 'US Dollar', type: 'fiat', flag: '🇺🇸' },
  { code: 'ZAR', name: 'South African Rand', type: 'fiat', flag: '🇿🇦' },
];

interface PairItem {
  code: string;
  baseFlag: string;
  quoteFlag: string;
}

const CURRENCY_PAIRS: PairItem[] = [
  { code: 'AUD/CAD', baseFlag: '🇦🇺', quoteFlag: '🇨🇦' },
  { code: 'AUD/CHF', baseFlag: '🇦🇺', quoteFlag: '🇨🇭' },
  { code: 'AUD/JPY', baseFlag: '🇦🇺', quoteFlag: '🇯🇵' },
  { code: 'AUD/NZD', baseFlag: '🇦🇺', quoteFlag: '🇳🇿' },
  { code: 'AUD/USD', baseFlag: '🇦🇺', quoteFlag: '🇺🇸' },
  { code: 'CAD/CHF', baseFlag: '🇨🇦', quoteFlag: '🇨🇭' },
  { code: 'CAD/JPY', baseFlag: '🇨🇦', quoteFlag: '🇯🇵' },
  { code: 'CHF/JPY', baseFlag: '🇨🇭', quoteFlag: '🇯🇵' },
  { code: 'EUR/AUD', baseFlag: '🇪🇺', quoteFlag: '🇦🇺' },
  { code: 'EUR/CAD', baseFlag: '🇪🇺', quoteFlag: '🇨🇦' },
  { code: 'EUR/CHF', baseFlag: '🇪🇺', quoteFlag: '🇨🇭' },
  { code: 'EUR/GBP', baseFlag: '🇪🇺', quoteFlag: '🇬🇧' },
  { code: 'EUR/JPY', baseFlag: '🇪🇺', quoteFlag: '🇯🇵' },
  { code: 'EUR/USD', baseFlag: '🇪🇺', quoteFlag: '🇺🇸' },
  { code: 'GBP/AUD', baseFlag: '🇬🇧', quoteFlag: '🇦🇺' },
  { code: 'GBP/CAD', baseFlag: '🇬🇧', quoteFlag: '🇨🇦' },
  { code: 'GBP/CHF', baseFlag: '🇬🇧', quoteFlag: '🇨🇭' },
  { code: 'GBP/JPY', baseFlag: '🇬🇧', quoteFlag: '🇯🇵' },
  { code: 'GBP/NZD', baseFlag: '🇬🇧', quoteFlag: '🇳🇿' },
  { code: 'GBP/USD', baseFlag: '🇬🇧', quoteFlag: '🇺🇸' },
  { code: 'NZD/CAD', baseFlag: '🇳🇿', quoteFlag: '🇨🇦' },
  { code: 'NZD/CHF', baseFlag: '🇳🇿', quoteFlag: '🇨🇭' },
  { code: 'NZD/JPY', baseFlag: '🇳🇿', quoteFlag: '🇯🇵' },
  { code: 'NZD/USD', baseFlag: '🇳🇿', quoteFlag: '🇺🇸' },
  { code: 'USD/CAD', baseFlag: '🇺🇸', quoteFlag: '🇨🇦' },
  { code: 'USD/CHF', baseFlag: '🇺🇸', quoteFlag: '🇨🇭' },
  { code: 'USD/JPY', baseFlag: '🇺🇸', quoteFlag: '🇯🇵' },
  { code: 'XAU/USD', baseFlag: '🪙', quoteFlag: '🇺🇸' },
  { code: 'BTC/USD', baseFlag: '₿', quoteFlag: '🇺🇸' },
  { code: 'ETH/USD', baseFlag: '♦️', quoteFlag: '🇺🇸' },
];

const FAQ_ITEMS = [
  {
    question: 'What is financial leverage in forex trading?',
    answer:
      'Financial leverage allows traders to control larger position sizes with a relatively small amount of actual capital margin. For example, a 100:1 leverage ratio allows you to trade $100,000 worth of currency with just $1,000 in account margin.',
  },
  {
    question: 'Can I adjust my leverage parameters directly inside this tool?',
    answer:
      'Yes, you can adjust the account currency, currency pair, margin, and position size to calculate your effective leverage ratio or required margin in real time.',
  },
  {
    question: 'Does high leverage increase my trading transaction costs?',
    answer:
      'Leverage itself does not directly increase percentage spreads or commission rates, but larger position sizes mean each pip movement has a larger monetary value, which amplifies both transaction costs and potential profits or losses.',
  },
  {
    question: 'What is a safe leverage tier for beginner accounts?',
    answer:
      'Most professional risk management frameworks recommend conservative leverage between 1:10 and 1:30 for beginners, ensuring adequate buffer against adverse market volatility.',
  },
  {
    question: 'How does leverage relate directly to margin requirements?',
    answer:
      'Leverage is the inverse of the margin requirement. A 100:1 leverage ratio corresponds to a 1% margin requirement (1/100), while a 500:1 leverage ratio requires only 0.2% margin (1/500).',
  },
];

export interface LeverageCalculatorDetailViewProps {
  currencyPair: string;
  setCurrencyPair: (val: string) => void;
  accountCurrency: string;
  setAccountCurrency: (val: string) => void;
  marginInput: string;
  setMarginInput: (val: string) => void;
  positionSizeInput: string;
  setPositionSizeInput: (val: string) => void;
  value: number;
  ratio: string;
  onReset?: () => void;
  onSave?: () => void;
}

export const LeverageCalculatorDetailView: React.FC<LeverageCalculatorDetailViewProps> = ({
  currencyPair,
  setCurrencyPair,
  accountCurrency,
  setAccountCurrency,
  marginInput,
  setMarginInput,
  positionSizeInput,
  setPositionSizeInput,
  value,
  ratio,
  onReset,
}) => {
  // Dropdown states
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const [currencySearch, setCurrencySearch] = useState('');
  const [isPairOpen, setIsPairOpen] = useState(false);
  const [pairSearch, setPairSearch] = useState('');

  // Accordion state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const currencyDropdownRef = useRef<HTMLDivElement>(null);
  const pairDropdownRef = useRef<HTMLDivElement>(null);
  const currencySearchInputRef = useRef<HTMLInputElement>(null);
  const pairSearchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        currencyDropdownRef.current &&
        !currencyDropdownRef.current.contains(event.target as Node)
      ) {
        setIsCurrencyOpen(false);
      }
      if (pairDropdownRef.current && !pairDropdownRef.current.contains(event.target as Node)) {
        setIsPairOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-focus search input when opened
  useEffect(() => {
    if (isCurrencyOpen) {
      setTimeout(() => currencySearchInputRef.current?.focus(), 50);
    }
  }, [isCurrencyOpen]);

  useEffect(() => {
    if (isPairOpen) {
      setTimeout(() => pairSearchInputRef.current?.focus(), 50);
    }
  }, [isPairOpen]);

  // Filtered Currencies
  const filteredCurrencies = useMemo(() => {
    if (!currencySearch.trim()) return ACCOUNT_CURRENCIES;
    const query = currencySearch.toLowerCase().trim();
    return ACCOUNT_CURRENCIES.filter(
      (c) => c.code.toLowerCase().includes(query) || c.name.toLowerCase().includes(query)
    );
  }, [currencySearch]);

  // Filtered Pairs
  const filteredPairs = useMemo(() => {
    if (!pairSearch.trim()) return CURRENCY_PAIRS;
    const query = pairSearch.toLowerCase().trim();
    return CURRENCY_PAIRS.filter((p) => p.code.toLowerCase().includes(query));
  }, [pairSearch]);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex((prev) => (prev === index ? null : index));
  };

  // Format value cleanly (e.g. "$ 110,000" or "$ 1,100")
  const displayValue = useMemo(() => {
    if (value === 0) return '0';
    return value.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  }, [value]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight flex items-center">
          <span className="text-[#5945F1] dark:text-[#ABA1F8]">Leverage Calculato</span>
          <span className="text-[#FD02B0]">r</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-[#CCC6FB] mt-1">
          Determine safe leverage with advance risk assessment
        </p>
      </div>

      {/* Interactive Form Card */}
      <div className="bg-white dark:bg-[#170345] rounded-3xl p-6 sm:p-7 border border-slate-100 dark:border-[#230674] shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          {/* 1. Account Currency Dropdown (D04) */}
          <div className="space-y-2 relative" ref={currencyDropdownRef}>
            <label className="text-xs sm:text-[13px] font-semibold text-slate-800 dark:text-white block">
              Account Currency
            </label>

            <button
              type="button"
              onClick={() => {
                setIsCurrencyOpen(!isCurrencyOpen);
                setIsPairOpen(false);
              }}
              className={`w-full h-11 px-3.5 pr-10 rounded-xl bg-white dark:bg-[#230674] border ${
                isCurrencyOpen
                  ? 'border-[#5945F1] ring-1 ring-[#5945F1]'
                  : 'border-slate-200 dark:border-[#3410D5]'
              } text-slate-800 dark:text-white font-medium text-sm focus:outline-none flex items-center justify-between cursor-pointer transition-all`}
            >
              <span>{accountCurrency}</span>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none transition-transform duration-200 ${
                  isCurrencyOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Expanded Dropdown Card (D04) */}
            {isCurrencyOpen && (
              <div className="absolute top-full left-0 mt-1.5 w-full min-w-[280px] sm:min-w-[320px] bg-white dark:bg-[#1a054d] border border-slate-200 dark:border-[#3410D5] rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
                {/* Search Header */}
                <div className="p-2.5 border-b border-slate-100 dark:border-[#28086a] flex items-center gap-2 bg-slate-50/50 dark:bg-[#230674]/50">
                  <Search className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
                  <input
                    ref={currencySearchInputRef}
                    type="text"
                    value={currencySearch}
                    onChange={(e) => setCurrencySearch(e.target.value)}
                    placeholder="Search..."
                    className="w-full bg-transparent text-sm text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none"
                  />
                </div>

                {/* Currency List */}
                <div className="max-h-64 overflow-y-auto overscroll-contain py-1 divide-y divide-slate-50 dark:divide-[#240866]">
                  {filteredCurrencies.length === 0 ? (
                    <div className="py-4 text-center text-xs text-slate-400">
                      No currency found
                    </div>
                  ) : (
                    filteredCurrencies.map((item) => {
                      const isSelected = item.code === accountCurrency;
                      return (
                        <button
                          key={item.code}
                          type="button"
                          onClick={() => {
                            setAccountCurrency(item.code);
                            setIsCurrencyOpen(false);
                            setCurrencySearch('');
                          }}
                          className={`w-full px-3.5 py-2 flex items-center justify-between text-left transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-50/80 dark:bg-[#2e0988]'
                              : 'hover:bg-slate-50 dark:hover:bg-[#240866]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            {/* Icon / Flag */}
                            {item.type === 'crypto' ? (
                              <span
                                className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-2xs shrink-0"
                                style={{ backgroundColor: item.cryptoColor || '#f7931a' }}
                              >
                                {item.cryptoSymbol || '₿'}
                              </span>
                            ) : (
                              <span className="text-base leading-none shrink-0">
                                {item.flag || '🌐'}
                              </span>
                            )}
                            <span className="text-sm font-semibold text-slate-900 dark:text-white">
                              {item.code}
                            </span>
                          </div>
                          <span className="text-xs text-slate-400 dark:text-[#8A7AF6]">
                            {item.name}
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 2. Currency Pair Dropdown (D06) */}
          <div className="space-y-2 relative" ref={pairDropdownRef}>
            <label className="text-xs sm:text-[13px] font-semibold text-slate-800 dark:text-white block">
              Currency Pair
            </label>

            <button
              type="button"
              onClick={() => {
                setIsPairOpen(!isPairOpen);
                setIsCurrencyOpen(false);
              }}
              className={`w-full h-11 px-3.5 pr-10 rounded-xl bg-white dark:bg-[#230674] border ${
                isPairOpen
                  ? 'border-[#5945F1] ring-1 ring-[#5945F1]'
                  : 'border-slate-200 dark:border-[#3410D5]'
              } text-slate-800 dark:text-white font-medium text-sm focus:outline-none flex items-center justify-between cursor-pointer transition-all`}
            >
              <span>{currencyPair}</span>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none transition-transform duration-200 ${
                  isPairOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Expanded Dropdown Card (D06) */}
            {isPairOpen && (
              <div className="absolute top-full left-0 mt-1.5 w-full min-w-[260px] sm:min-w-[280px] bg-white dark:bg-[#1a054d] border border-slate-200 dark:border-[#3410D5] rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
                {/* Search Header */}
                <div className="p-2.5 border-b border-slate-100 dark:border-[#28086a] flex items-center gap-2 bg-slate-50/50 dark:bg-[#230674]/50">
                  <Search className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
                  <input
                    ref={pairSearchInputRef}
                    type="text"
                    value={pairSearch}
                    onChange={(e) => setPairSearch(e.target.value)}
                    placeholder="Search..."
                    className="w-full bg-transparent text-sm text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none"
                  />
                </div>

                {/* Pairs List with Dual Flags */}
                <div className="max-h-64 overflow-y-auto overscroll-contain py-1 divide-y divide-slate-50 dark:divide-[#240866]">
                  {filteredPairs.length === 0 ? (
                    <div className="py-4 text-center text-xs text-slate-400">
                      No currency pair found
                    </div>
                  ) : (
                    filteredPairs.map((pair) => {
                      const isSelected = pair.code === currencyPair;
                      return (
                        <button
                          key={pair.code}
                          type="button"
                          onClick={() => {
                            setCurrencyPair(pair.code);
                            setIsPairOpen(false);
                            setPairSearch('');
                          }}
                          className={`w-full px-3.5 py-2 flex items-center gap-3 text-left transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-50/80 dark:bg-[#2e0988]'
                              : 'hover:bg-slate-50 dark:hover:bg-[#240866]'
                          }`}
                        >
                          {/* Dual Circular Flags */}
                          <div className="flex items-center -space-x-1.5 shrink-0">
                            <span className="w-5 h-5 rounded-full overflow-hidden flex items-center justify-center text-xs shadow-2xs z-10 bg-slate-100 dark:bg-slate-800">
                              {pair.baseFlag}
                            </span>
                            <span className="w-5 h-5 rounded-full overflow-hidden flex items-center justify-center text-xs shadow-2xs bg-slate-100 dark:bg-slate-800">
                              {pair.quoteFlag}
                            </span>
                          </div>
                          <span className="text-sm font-semibold text-slate-900 dark:text-white">
                            {pair.code}
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 3. Margin Input */}
          <div className="space-y-2">
            <label className="text-xs sm:text-[13px] font-semibold text-slate-800 dark:text-white block">
              Margin
            </label>
            <input
              type="number"
              value={marginInput}
              onChange={(e) => setMarginInput(e.target.value)}
              placeholder="100"
              className="w-full h-11 px-3.5 rounded-xl bg-white dark:bg-[#230674] border border-slate-200 dark:border-[#3410D5] text-slate-800 dark:text-white font-medium text-sm focus:outline-none focus:border-[#5945F1]"
            />
          </div>

          {/* 4. Position Size Input */}
          <div className="space-y-2">
            <label className="text-xs sm:text-[13px] font-semibold text-slate-800 dark:text-white block">
              Position Size
            </label>
            <input
              type="number"
              step="0.01"
              value={positionSizeInput}
              onChange={(e) => setPositionSizeInput(e.target.value)}
              placeholder="0.01"
              className="w-full h-11 px-3.5 rounded-xl bg-white dark:bg-[#230674] border border-slate-200 dark:border-[#3410D5] text-slate-800 dark:text-white font-medium text-sm focus:outline-none focus:border-[#5945F1]"
            />
          </div>
        </div>

        {/* Reset Button (Directly under inputs) */}
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={onReset}
            className="text-[#5945F1] dark:text-[#ABA1F8] font-semibold text-sm hover:underline cursor-pointer transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Calculation Results Card (Distinctive Hot-Pink Border) */}
      <div className="bg-white dark:bg-[#170345] rounded-3xl p-6 sm:p-7 border-2 border-[#FD02B0] shadow-xs space-y-4">
        <h3 className="text-sm font-bold tracking-tight">
          <span className="text-[#5945F1] dark:text-[#ABA1F8]">Calculation Result</span>
          <span className="text-[#FD02B0]">s</span>
        </h3>

        <div className="flex items-center justify-center gap-16 sm:gap-28 py-3">
          <div className="text-center space-y-1">
            <div className="text-xs font-semibold text-slate-500 dark:text-[#CCC6FB]">
              Value
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              $ {displayValue}
            </div>
          </div>

          <div className="text-center space-y-1">
            <div className="text-xs font-semibold text-slate-500 dark:text-[#CCC6FB]">
              Leverage
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {ratio}
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer Text */}
      <p className="text-[11px] sm:text-xs text-slate-500 dark:text-[#8A7AF6] leading-relaxed">
        <span className="font-bold text-slate-700 dark:text-[#CCC6FB]">Disclaimer:</span> This
        calculator provides estimates for guidance only. Actual results may vary due to market
        conditions, spreads, execution, and trading costs. Consider professional advice before
        trading.
      </p>

      {/* Educational Content: How Leverage Calculator Works */}
      <div className="space-y-4 pt-2">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
          How Leverage Calculator Works
        </h2>

        <p className="text-xs sm:text-[13px] text-slate-600 dark:text-[#CCC6FB] leading-relaxed">
          Our Forex Leverage Calculator evaluates your real account exposure by comparing your total
          transactional position size against your available account capital equity. By selecting
          your target asset pair and inputting your desired lot volume, the software demonstrates
          exactly how much buying power you command. This interactive analysis allows you to gauge
          whether your structural risk profile aligns safely with your specific capital preservation
          thresholds.
        </p>

        {/* Formula & Breakdown Callout Box */}
        <div className="bg-[#f8fafc] dark:bg-[#230674] rounded-2xl p-5 border border-slate-200/80 dark:border-[#3410D5] space-y-3">
          <div className="font-bold text-xs sm:text-sm text-slate-800 dark:text-white">
            Leverage Ratio = Total Position Value / Account Equity
          </div>
          <div className="text-xs text-slate-600 dark:text-[#CCC6FB] space-y-1.5 leading-relaxed">
            <div className="font-semibold text-slate-700 dark:text-[#ABA1F8]">Where:</div>
            <div>• Total Position Value = Lot Size * Contract Size * Current Base Price</div>
            <div>• Account Equity = Net deposits plus or minus open floating profits or losses</div>
          </div>
        </div>
      </div>

      {/* Key Benefits */}
      <div className="space-y-3 pt-2">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
          Key Benefits
        </h2>

        <ul className="space-y-2.5 text-xs sm:text-[13px] text-slate-600 dark:text-[#CCC6FB] leading-relaxed">
          <li className="flex items-start gap-2">
            <span className="text-slate-400 mt-0.5">•</span>
            <div>
              <span className="font-semibold text-slate-800 dark:text-white">
                Visualizes Absolute Risk Exposure:
              </span>{' '}
              Instantly reveals your true market leverage ratio to help you avoid hidden over-leverage
              traps.
            </div>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-slate-400 mt-0.5">•</span>
            <div>
              <span className="font-semibold text-slate-800 dark:text-white">
                Optimizes Buying Power Allocation:
              </span>{' '}
              Lets you experiment with varying lot sizes to see how changes dynamically adjust your
              actual account gearing.
            </div>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-slate-400 mt-0.5">•</span>
            <div>
              <span className="font-semibold text-slate-800 dark:text-white">
                Maximizes Strategy Alignment:
              </span>{' '}
              Helps systematic traders keep their overall market exposure within strict institutional
              boundaries.
            </div>
          </li>
        </ul>
      </div>

      {/* Leverage Calculator FAQ */}
      <div className="space-y-3 pt-4">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
          Leverage Calculator FAQ
        </h2>

        <div className="divide-y divide-slate-100 dark:divide-[#28086a] border-t border-b border-slate-100 dark:border-[#28086a]">
          {FAQ_ITEMS.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div key={idx} className="py-3.5">
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex items-center justify-between text-left gap-4 cursor-pointer group"
                >
                  <span className="text-xs sm:text-[13px] font-bold text-slate-900 dark:text-white group-hover:text-[#5945F1] dark:group-hover:text-[#ABA1F8] transition-colors">
                    {faq.question}
                  </span>
                  <span className="text-[#5945F1] dark:text-[#ABA1F8] shrink-0 font-bold">
                    {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </span>
                </button>
                {isOpen && (
                  <p className="mt-2.5 text-xs sm:text-[13px] text-slate-600 dark:text-[#CCC6FB] leading-relaxed animate-in fade-in-50 duration-150">
                    {faq.answer}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Search } from 'lucide-react';

export interface CurrencyItem {
  code: string;
  name: string;
  type: 'fiat' | 'crypto';
  flag?: string;
  cryptoColor?: string;
  cryptoSymbol?: string;
}

export const ACCOUNT_CURRENCIES: CurrencyItem[] = [
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
  { code: 'HUF', name: 'Hungarian Forint', type: 'fiat', flag: '🇭🇺' },
  { code: 'IDR', name: 'Indonesian Rupiah', type: 'fiat', flag: '🇮🇩' },
  { code: 'ILS', name: 'Israeli Shekel', type: 'fiat', flag: '🇮🇱' },
  { code: 'INR', name: 'Indian Rupee', type: 'fiat', flag: '🇮🇳' },
  { code: 'JPY', name: 'Japanese Yen', type: 'fiat', flag: '🇯🇵' },
  { code: 'MXN', name: 'Mexican Peso', type: 'fiat', flag: '🇲🇽' },
  { code: 'NOK', name: 'Norwegian Krone', type: 'fiat', flag: '🇳🇴' },
  { code: 'NZD', name: 'New Zealand Dollar', type: 'fiat', flag: '🇳🇿' },
  { code: 'PLN', name: 'Polish Zloty', type: 'fiat', flag: '🇵🇱' },
  { code: 'RUB', name: 'Russian Ruble', type: 'fiat', flag: '🇷🇺' },
  { code: 'SEK', name: 'Swedish Krona', type: 'fiat', flag: '🇸🇪' },
  { code: 'SGD', name: 'Singapore Dollar', type: 'fiat', flag: '🇸🇬' },
  { code: 'THB', name: 'Thai Baht', type: 'fiat', flag: '🇹🇭' },
  { code: 'TRY', name: 'Turkish Lira', type: 'fiat', flag: '🇹🇷' },
  { code: 'USD', name: 'US Dollar', type: 'fiat', flag: '🇺🇸' },
  { code: 'ZAR', name: 'South African Rand', type: 'fiat', flag: '🇿🇦' },
];

export interface PairItem {
  code: string;
  baseFlag: string;
  quoteFlag: string;
  name?: string;
}

export const CURRENCY_PAIRS: PairItem[] = [
  { code: 'AUD/CAD', baseFlag: '🇦🇺', quoteFlag: '🇨🇦', name: 'Australian Dollar / Canadian Dollar' },
  { code: 'AUD/CHF', baseFlag: '🇦🇺', quoteFlag: '🇨🇭', name: 'Australian Dollar / Swiss Franc' },
  { code: 'AUD/JPY', baseFlag: '🇦🇺', quoteFlag: '🇯🇵', name: 'Australian Dollar / Japanese Yen' },
  { code: 'AUD/NZD', baseFlag: '🇦🇺', quoteFlag: '🇳🇿', name: 'Australian Dollar / New Zealand Dollar' },
  { code: 'AUD/USD', baseFlag: '🇦🇺', quoteFlag: '🇺🇸', name: 'Australian Dollar / US Dollar' },
  { code: 'CAD/CHF', baseFlag: '🇨🇦', quoteFlag: '🇨🇭', name: 'Canadian Dollar / Swiss Franc' },
  { code: 'CAD/JPY', baseFlag: '🇨🇦', quoteFlag: '🇯🇵', name: 'Canadian Dollar / Japanese Yen' },
  { code: 'CHF/JPY', baseFlag: '🇨🇭', quoteFlag: '🇯🇵', name: 'Swiss Franc / Japanese Yen' },
  { code: 'EUR/AUD', baseFlag: '🇪🇺', quoteFlag: '🇦🇺', name: 'Euro / Australian Dollar' },
  { code: 'EUR/CAD', baseFlag: '🇪🇺', quoteFlag: '🇨🇦', name: 'Euro / Canadian Dollar' },
  { code: 'EUR/CHF', baseFlag: '🇪🇺', quoteFlag: '🇨🇭', name: 'Euro / Swiss Franc' },
  { code: 'EUR/GBP', baseFlag: '🇪🇺', quoteFlag: '🇬🇧', name: 'Euro / British Pound' },
  { code: 'EUR/JPY', baseFlag: '🇪🇺', quoteFlag: '🇯🇵', name: 'Euro / Japanese Yen' },
  { code: 'EUR/USD', baseFlag: '🇪🇺', quoteFlag: '🇺🇸', name: 'Euro / US Dollar' },
  { code: 'GBP/AUD', baseFlag: '🇬🇧', quoteFlag: '🇦🇺', name: 'British Pound / Australian Dollar' },
  { code: 'GBP/CAD', baseFlag: '🇬🇧', quoteFlag: '🇨🇦', name: 'British Pound / Canadian Dollar' },
  { code: 'GBP/CHF', baseFlag: '🇬🇧', quoteFlag: '🇨🇭', name: 'British Pound / Swiss Franc' },
  { code: 'GBP/JPY', baseFlag: '🇬🇧', quoteFlag: '🇯🇵', name: 'British Pound / Japanese Yen' },
  { code: 'GBP/NZD', baseFlag: '🇬🇧', quoteFlag: '🇳🇿', name: 'British Pound / New Zealand Dollar' },
  { code: 'GBP/USD', baseFlag: '🇬🇧', quoteFlag: '🇺🇸', name: 'British Pound / US Dollar' },
  { code: 'NZD/CAD', baseFlag: '🇳🇿', quoteFlag: '🇨🇦', name: 'New Zealand Dollar / Canadian Dollar' },
  { code: 'NZD/CHF', baseFlag: '🇳🇿', quoteFlag: '🇨🇭', name: 'New Zealand Dollar / Swiss Franc' },
  { code: 'NZD/JPY', baseFlag: '🇳🇿', quoteFlag: '🇯🇵', name: 'New Zealand Dollar / Japanese Yen' },
  { code: 'NZD/USD', baseFlag: '🇳🇿', quoteFlag: '🇺🇸', name: 'New Zealand Dollar / US Dollar' },
  { code: 'USD/CAD', baseFlag: '🇺🇸', quoteFlag: '🇨🇦', name: 'US Dollar / Canadian Dollar' },
  { code: 'USD/CHF', baseFlag: '🇺🇸', quoteFlag: '🇨🇭', name: 'US Dollar / Swiss Franc' },
  { code: 'USD/JPY', baseFlag: '🇺🇸', quoteFlag: '🇯🇵', name: 'US Dollar / Japanese Yen' },
  { code: 'XAU/USD', baseFlag: '🪙', quoteFlag: '🇺🇸', name: 'Gold / US Dollar' },
  { code: 'BTC/USD', baseFlag: '₿', quoteFlag: '🇺🇸', name: 'Bitcoin / US Dollar' },
  { code: 'ETH/USD', baseFlag: '♦️', quoteFlag: '🇺🇸', name: 'Ethereum / US Dollar' },
];

export interface AccountCurrencyDropdownProps {
  value: string;
  onChange: (val: string) => void;
  id?: string;
  label?: string;
}

export const AccountCurrencyDropdown: React.FC<AccountCurrencyDropdownProps> = ({
  value,
  onChange,
  id,
  label,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedItem = useMemo(
    () => ACCOUNT_CURRENCIES.find((c) => c.code === value) || ACCOUNT_CURRENCIES[25], // USD default
    [value]
  );

  const filteredItems = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return ACCOUNT_CURRENCIES;
    return ACCOUNT_CURRENCIES.filter(
      (c) => c.code.toLowerCase().includes(term) || c.name.toLowerCase().includes(term)
    );
  }, [searchTerm]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchTerm('');
    }
  }, [isOpen]);

  return (
    <div className="w-full space-y-2" ref={containerRef} id={id}>
      {label && (
        <label className="text-xs sm:text-[13px] font-semibold text-slate-800 dark:text-white block">
          {label}
        </label>
      )}
      <div className="relative w-full">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="relative w-full h-11 px-3.5 pr-10 rounded-xl bg-white dark:bg-[#230674] border border-slate-200 dark:border-[#3410D5] text-slate-800 dark:text-white font-medium text-sm flex items-center justify-between focus:outline-none focus:border-[#5945F1] cursor-pointer hover:border-slate-300 transition-colors"
        >
          <span className="truncate">{selectedItem ? selectedItem.code : value}</span>
          <ChevronDown
            className={`w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-[#5945F1]' : ''
            }`}
          />
        </button>

        {isOpen && (
          <div className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-2xl bg-white dark:bg-[#1a0459] border border-slate-200 dark:border-[#3410D5] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Search Bar */}
            <div className="p-2.5 border-b border-slate-100 dark:border-[#2b0885]">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-50 dark:bg-[#230674] border border-slate-200 dark:border-[#3410D5] text-xs sm:text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#5945F1]"
                />
              </div>
            </div>

            {/* List */}
            <div className="max-h-60 overflow-y-auto py-1 divide-y divide-slate-50 dark:divide-slate-800/40">
              {filteredItems.length === 0 ? (
                <div className="px-4 py-3 text-xs text-slate-400 text-center">No currency found</div>
              ) : (
                filteredItems.map((item) => {
                  const isSelected = item.code === value;
                  return (
                    <div
                      key={item.code}
                      onClick={() => {
                        onChange(item.code);
                        setIsOpen(false);
                      }}
                      className={`px-3.5 py-2 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-[#280786] transition-colors ${
                        isSelected ? 'bg-indigo-50/60 dark:bg-[#2e0988]' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        {item.type === 'fiat' ? (
                          <span className="text-base leading-none">{item.flag}</span>
                        ) : (
                          <span
                            className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[11px] font-bold"
                            style={{ backgroundColor: item.cryptoColor || '#627eea' }}
                          >
                            {item.cryptoSymbol || '₿'}
                          </span>
                        )}
                        <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white">
                          {item.code}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 dark:text-[#aba1f8]">
                        {item.name}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export interface CurrencyPairDropdownProps {
  value: string;
  onChange: (val: string) => void;
  id?: string;
  label?: string;
}

export const CurrencyPairDropdown: React.FC<CurrencyPairDropdownProps> = ({
  value,
  onChange,
  id,
  label,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredItems = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return CURRENCY_PAIRS;
    return CURRENCY_PAIRS.filter(
      (p) => p.code.toLowerCase().includes(term) || (p.name && p.name.toLowerCase().includes(term))
    );
  }, [searchTerm]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchTerm('');
    }
  }, [isOpen]);

  return (
    <div className="w-full space-y-2" ref={containerRef} id={id}>
      {label && (
        <label className="text-xs sm:text-[13px] font-semibold text-slate-800 dark:text-white block">
          {label}
        </label>
      )}
      <div className="relative w-full">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="relative w-full h-11 px-3.5 pr-10 rounded-xl bg-white dark:bg-[#230674] border border-slate-200 dark:border-[#3410D5] text-slate-800 dark:text-white font-medium text-sm flex items-center justify-between focus:outline-none focus:border-[#5945F1] cursor-pointer hover:border-slate-300 transition-colors"
        >
          <span className="truncate">{value}</span>
          <ChevronDown
            className={`w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-[#5945F1]' : ''
            }`}
          />
        </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-2xl bg-white dark:bg-[#1a0459] border border-slate-200 dark:border-[#3410D5] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Search Bar */}
          <div className="p-2.5 border-b border-slate-100 dark:border-[#2b0885]">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-50 dark:bg-[#230674] border border-slate-200 dark:border-[#3410D5] text-xs sm:text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#5945F1]"
              />
            </div>
          </div>

          {/* List */}
          <div className="max-h-60 overflow-y-auto py-1 divide-y divide-slate-50 dark:divide-slate-800/40">
            {filteredItems.length === 0 ? (
              <div className="px-4 py-3 text-xs text-slate-400 text-center">No pair found</div>
            ) : (
              filteredItems.map((item) => {
                const isSelected = item.code === value;
                return (
                  <div
                    key={item.code}
                    onClick={() => {
                      onChange(item.code);
                      setIsOpen(false);
                    }}
                    className={`px-3.5 py-2 flex items-center justify-between gap-2.5 cursor-pointer hover:bg-slate-50 dark:hover:bg-[#280786] transition-colors ${
                      isSelected ? 'bg-indigo-50/60 dark:bg-[#2e0988]' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex -space-x-1 items-center shrink-0">
                        <span className="text-base leading-none">{item.baseFlag}</span>
                        <span className="text-base leading-none">{item.quoteFlag}</span>
                      </div>
                      <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-white shrink-0">
                        {item.code}
                      </span>
                    </div>
                    {item.name && (
                      <span className="text-xs text-slate-400 dark:text-slate-400 truncate max-w-[200px] sm:max-w-none text-right">
                        {item.name}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export interface LeverageDropdownProps {
  value: string;
  onChange: (val: string) => void;
  id?: string;
  label?: string;
}

export const LEVERAGE_OPTIONS: string[] = [
  '1:1',
  '1:5',
  '1:10',
  '1:20',
  '1:25',
  '1:30',
  '1:33',
  '1:40',
  '1:50',
  '1:66',
  '1:100',
  '1:125',
  '1:150',
  '1:200',
  '1:300',
  '1:400',
  '1:500',
  '1:888',
  '1:1000',
  '1:2000',
  '1:3000',
  '1:Unlimited',
];

export const LeverageDropdown: React.FC<LeverageDropdownProps> = ({
  value,
  onChange,
  id,
  label,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredItems = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return LEVERAGE_OPTIONS;
    return LEVERAGE_OPTIONS.filter((opt) => opt.toLowerCase().includes(term));
  }, [searchTerm]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchTerm('');
    }
  }, [isOpen]);

  return (
    <div className="w-full space-y-2" ref={containerRef} id={id}>
      {label && (
        <label className="text-xs sm:text-[13px] font-semibold text-slate-800 dark:text-white block">
          {label}
        </label>
      )}
      <div className="relative w-full">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="relative w-full h-11 px-3.5 pr-10 rounded-xl bg-white dark:bg-[#230674] border border-slate-200 dark:border-[#3410D5] text-slate-800 dark:text-white font-medium text-sm flex items-center justify-between focus:outline-none focus:border-[#5945F1] cursor-pointer hover:border-slate-300 transition-colors"
        >
          <span className="truncate">{value || '1:100'}</span>
          <ChevronDown
            className={`w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-[#5945F1]' : ''
            }`}
          />
        </button>

        {isOpen && (
          <div className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-2xl bg-white dark:bg-[#1a0459] border border-slate-200 dark:border-[#3410D5] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Search Bar */}
            <div className="p-2.5 border-b border-slate-100 dark:border-[#2b0885]">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-50 dark:bg-[#230674] border border-slate-200 dark:border-[#3410D5] text-xs sm:text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#5945F1]"
                />
              </div>
            </div>

            {/* List */}
            <div className="max-h-60 overflow-y-auto py-1 divide-y divide-slate-50 dark:divide-slate-800/40">
              {filteredItems.length === 0 ? (
                <div className="px-4 py-3 text-xs text-slate-400 text-center">No leverage option found</div>
              ) : (
                filteredItems.map((opt) => {
                  const isSelected = opt === value;
                  return (
                    <div
                      key={opt}
                      onClick={() => {
                        onChange(opt);
                        setIsOpen(false);
                      }}
                      className={`px-3.5 py-2.5 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-[#280786] transition-colors ${
                        isSelected ? 'bg-indigo-50/60 dark:bg-[#2e0988] font-bold text-[#5945F1] dark:text-[#ABA1F8]' : 'text-slate-800 dark:text-white'
                      }`}
                    >
                      <span className="text-xs sm:text-sm font-medium">{opt}</span>
                      {isSelected && (
                        <span className="text-xs text-[#5945F1] dark:text-[#ABA1F8] font-bold">✓</span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// 4. REBATE PER LOT CURRENCY DROPDOWN (Matches D10 - Dropdown Expanded_ Rebate Per Lot Currency.png)
// ─────────────────────────────────────────────────────────────
export interface RebateLotCurrencyDropdownProps {
  value: string;
  onChange: (val: string) => void;
  id?: string;
}

export const RebateLotCurrencyDropdown: React.FC<RebateLotCurrencyDropdownProps> = ({
  value,
  onChange,
  id,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredCurrencies = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return ACCOUNT_CURRENCIES;
    return ACCOUNT_CURRENCIES.filter(
      (c) => c.code.toLowerCase().includes(term) || c.name.toLowerCase().includes(term)
    );
  }, [searchTerm]);

  const showPips = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    return 'pips'.includes(term);
  }, [searchTerm]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchTerm('');
    }
  }, [isOpen]);

  return (
    <div className="relative inline-block" ref={containerRef} id={id}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="h-8 px-3 flex items-center gap-1.5 rounded-lg bg-slate-50 dark:bg-[#1E0560] border border-slate-200/90 dark:border-[#3410D5] text-slate-700 dark:text-[#ABA1F8] font-semibold text-xs cursor-pointer hover:bg-slate-100 dark:hover:bg-[#280786] transition-colors"
      >
        <span className="truncate max-w-[60px]">{value}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#5945F1]' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1.5 z-50 w-72 rounded-2xl bg-white dark:bg-[#1a0459] border border-slate-200 dark:border-[#3410D5] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Search Bar */}
          <div className="p-2.5 border-b border-slate-100 dark:border-[#2b0885]">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-50 dark:bg-[#230674] border border-slate-200 dark:border-[#3410D5] text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#5945F1]"
              />
            </div>
          </div>

          {/* List with slim scrollbar */}
          <div className="max-h-64 overflow-y-auto py-1 dropdown-scrollbar divide-y divide-slate-50 dark:divide-slate-800/40">
            {/* Pips Option - exactly matching D10 */}
            {showPips && (
              <div
                onClick={() => {
                  onChange('Pips');
                  setIsOpen(false);
                }}
                className={`px-3.5 py-2 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-[#280786] transition-colors ${
                  value === 'Pips' ? 'bg-indigo-50/60 dark:bg-[#2e0988]' : ''
                }`}
              >
                <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white">
                  Pips
                </span>
              </div>
            )}

            {filteredCurrencies.length === 0 && !showPips ? (
              <div className="px-4 py-3 text-xs text-slate-400 text-center">No results found</div>
            ) : (
              filteredCurrencies.map((item) => {
                const isSelected = item.code === value;
                return (
                  <div
                    key={item.code}
                    onClick={() => {
                      onChange(item.code);
                      setIsOpen(false);
                    }}
                    className={`px-3.5 py-2 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-[#280786] transition-colors ${
                      isSelected ? 'bg-indigo-50/60 dark:bg-[#2e0988]' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {item.type === 'fiat' ? (
                        <span className="text-base leading-none">{item.flag}</span>
                      ) : (
                        <span
                          className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[11px] font-bold"
                          style={{ backgroundColor: item.cryptoColor || '#627eea' }}
                        >
                          {item.cryptoSymbol || '₿'}
                        </span>
                      )}
                      <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white">
                        {item.code}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 dark:text-[#aba1f8]">
                      {item.name}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

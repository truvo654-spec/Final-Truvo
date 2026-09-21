import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';
import { DualCurrencyIcon } from '../signals/SignalSearchDropdown';

export const ALL_CURRENCY_PAIRS = [
  'AUD/CAD',
  'AUD/CHF',
  'AUD/JPY',
  'AUD/NZD',
  'AUD/USD',
  'CAD/CHF',
  'CAD/JPY',
  'CHF/JPY',
  'EUR/AUD',
  'EUR/CAD',
  'EUR/CHF',
  'EUR/GBP',
  'EUR/JPY',
  'EUR/USD',
  'GBP/AUD',
  'GBP/CAD',
  'GBP/CHF',
  'GBP/JPY',
  'GBP/USD',
  'NZD/CAD',
  'NZD/CHF',
  'NZD/JPY',
  'NZD/USD',
  'USD/CAD',
  'USD/CHF',
  'USD/JPY',
  'XAU/USD',
];

interface CurrencyPairDropdownProps {
  value: string;
  onChange: (pair: string) => void;
  label?: string;
  className?: string;
}

export const CurrencyPairDropdown: React.FC<CurrencyPairDropdownProps> = ({
  value,
  onChange,
  label = 'Currency Pair',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  const filteredPairs = ALL_CURRENCY_PAIRS.filter((pair) =>
    pair.toLowerCase().replace('/', '').includes(searchQuery.toLowerCase().replace('/', ''))
  );

  return (
    <div className={`space-y-2 relative ${className}`} ref={dropdownRef}>
      {label && (
        <label className="text-xs sm:text-[13px] font-semibold text-slate-800 dark:text-white block">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-11 px-3.5 rounded-xl bg-white dark:bg-[#230674] border border-slate-200 dark:border-[#3410D5] text-slate-800 dark:text-white font-medium text-sm flex items-center justify-between cursor-pointer hover:border-[#5945F1] transition-all"
      >
        <div className="flex items-center gap-2.5">
          <DualCurrencyIcon ticker={value} />
          <span className="font-semibold text-sm text-slate-900 dark:text-white">{value}</span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu (Exact match to D05 screenshot) */}
      {isOpen && (
        <div className="absolute top-full left-0 w-full mt-1.5 bg-white dark:bg-[#170345] border border-slate-200 dark:border-[#3410D5] rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Search Bar */}
          <div className="p-3 border-b border-slate-100 dark:border-[#230674] flex items-center gap-2.5">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full text-xs sm:text-sm bg-transparent border-none outline-none text-slate-800 dark:text-white placeholder-slate-400 font-medium"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* List of Pairs */}
          <div className="max-h-72 overflow-y-auto divide-y divide-slate-50 dark:divide-[#230674]/50">
            {filteredPairs.length > 0 ? (
              filteredPairs.map((pair) => {
                const isSelected = pair === value;
                return (
                  <button
                    key={pair}
                    type="button"
                    onClick={() => {
                      onChange(pair);
                      setIsOpen(false);
                      setSearchQuery('');
                    }}
                    className={`w-full px-4 py-2.5 flex items-center gap-3 cursor-pointer text-left transition-colors ${
                      isSelected
                        ? 'bg-indigo-50/70 dark:bg-[#230674] text-[#5945F1] dark:text-[#ABA1F8]'
                        : 'hover:bg-slate-50 dark:hover:bg-[#230674]/60 text-slate-800 dark:text-white'
                    }`}
                  >
                    <DualCurrencyIcon ticker={pair} />
                    <span className="font-semibold text-xs sm:text-sm">{pair}</span>
                    {isSelected && (
                      <span className="ml-auto text-xs text-[#5945F1] dark:text-[#ABA1F8] font-bold">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })
            ) : (
              <div className="p-4 text-center text-xs text-slate-400 dark:text-[#8A7AF6]">
                No currency pairs found matching "{searchQuery}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

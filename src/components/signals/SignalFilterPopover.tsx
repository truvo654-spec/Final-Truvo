import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Check } from 'lucide-react';

export interface PeriodOption {
  id: string;
  name: string;
  duration: string;
  isPro?: boolean;
}

export const PERIOD_OPTIONS: PeriodOption[] = [
  { id: 'Scalping', name: 'Scalping', duration: '5m-15m', isPro: true },
  { id: 'Intraday', name: 'Intraday', duration: '15m-1H' },
  { id: 'Swing', name: 'Swing', duration: '4H-1D' },
  { id: 'Position', name: 'Position', duration: '1D-1W' },
  { id: 'Investment', name: 'Investment', duration: '1W-1M', isPro: true },
];

export const CONFIDENCE_OPTIONS = [
  { id: 'All', label: 'All' },
  { id: '90%+', label: '90%+ Confidence' },
  { id: '80%+', label: '80%+ Confidence' },
  { id: '70%+', label: '70%+ Confidence' },
];

export const SORT_OPTIONS = [
  { id: 'Highest Confidence', label: 'Highest Confidence' },
  { id: 'Lowest Confidence', label: 'Lowest Confidence' },
  { id: 'Risk/Reward Ratio', label: 'Risk/Reward Ratio' },
  { id: 'Newest First', label: 'Newest First' },
];

interface SignalFilterPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPeriod: string;
  onSelectPeriod: (period: string) => void;
  selectedConfidence: string;
  onSelectConfidence: (conf: string) => void;
  selectedSort: string;
  onSelectSort: (sort: string) => void;
}

/**
 * Signal Filter Popover & Dropdown Lists
 * Exact match to:
 * - Broker Filter.png
 * - Broker Filter (1).png
 * - Broker Filter (2).png
 * - Dropdown List.png
 */
export const SignalFilterPopover: React.FC<SignalFilterPopoverProps> = ({
  isOpen,
  onClose,
  selectedPeriod,
  onSelectPeriod,
  selectedConfidence,
  onSelectConfidence,
  selectedSort,
  onSelectSort,
}) => {
  const [activeDropdown, setActiveDropdown] = useState<'period' | 'confidence' | 'sort' | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) {
      setActiveDropdown(null);
      return;
    }

    const handlePointerDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={containerRef}
      className="absolute right-0 top-12 z-50 select-none animate-in fade-in slide-in-from-top-2 duration-150"
    >
      {/* Main Filter Popover Card */}
      <div className="w-[280px] bg-white dark:bg-[#120838] rounded-2xl border border-[#D4D2FB] dark:border-[#2f1c74] shadow-[0_12px_36px_-6px_rgba(83,56,245,0.18)] p-4 space-y-4">
        {/* ─── 1. PERIOD SECTION ─── */}
        <div className="relative">
          <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
            Period
          </label>
          <button
            type="button"
            onClick={() => setActiveDropdown((prev) => (prev === 'period' ? null : 'period'))}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border ${
              activeDropdown === 'period' || selectedPeriod !== 'All'
                ? 'border-[#5338F5]'
                : 'border-[#D4D2FB] dark:border-[#382285]'
            } bg-white dark:bg-[#180d46] text-sm transition-colors cursor-pointer`}
          >
            <span
              className={
                selectedPeriod === 'All'
                  ? 'text-slate-500 dark:text-slate-400'
                  : 'text-slate-800 dark:text-slate-100 font-medium'
              }
            >
              {selectedPeriod}
            </span>
            <ChevronDown
              className={`w-4 h-4 text-slate-500 dark:text-slate-400 transition-transform ${
                activeDropdown === 'period' ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Period Dropdown List (Exact match to Dropdown List.png) */}
          <AnimatePresence>
            {activeDropdown === 'period' && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="absolute left-0 top-[72px] z-60 w-full bg-white dark:bg-[#15093f] rounded-2xl border border-[#D4D2FB] dark:border-[#382285] shadow-xl p-3 space-y-3"
              >
                {PERIOD_OPTIONS.map((opt) => {
                  const isChecked = selectedPeriod === opt.name;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => {
                        onSelectPeriod(isChecked ? 'All' : opt.name);
                        setActiveDropdown(null);
                      }}
                      className="flex items-center gap-2.5 cursor-pointer hover:bg-slate-50 dark:hover:bg-[#1f1057] p-1.5 rounded-lg transition-colors"
                    >
                      {/* Checkbox (Square with rounded corners) */}
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                          isChecked
                            ? 'bg-[#5338F5] text-white'
                            : 'border border-[#D4D2FB] dark:border-[#3d278f] bg-white dark:bg-[#180d46]'
                        }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>

                      {/* Label */}
                      <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                        {opt.name}
                      </span>

                      {/* Pro Badge if applicable */}
                      {opt.isPro && (
                        <span className="px-2 py-0.5 rounded-md bg-[#EEF0FE] dark:bg-[#28186b] text-[#5338F5] dark:text-[#9d8bfd] text-xs font-semibold leading-none">
                          Pro
                        </span>
                      )}

                      {/* Duration range */}
                      <span className="ml-auto text-xs text-slate-400 font-normal">
                        {opt.duration}
                      </span>
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ─── 2. CONFIDENCE SECTION ─── */}
        <div className="relative">
          <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
            Confidence
          </label>
          <button
            type="button"
            onClick={() => setActiveDropdown((prev) => (prev === 'confidence' ? null : 'confidence'))}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border ${
              activeDropdown === 'confidence' || selectedConfidence !== 'All'
                ? 'border-[#5338F5]'
                : 'border-[#D4D2FB] dark:border-[#382285]'
            } bg-white dark:bg-[#180d46] text-sm transition-colors cursor-pointer`}
          >
            <span
              className={
                selectedConfidence === 'All'
                  ? 'text-slate-500 dark:text-slate-400'
                  : 'text-slate-800 dark:text-slate-100 font-medium'
              }
            >
              {selectedConfidence}
            </span>
            <ChevronDown
              className={`w-4 h-4 text-slate-500 dark:text-slate-400 transition-transform ${
                activeDropdown === 'confidence' ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Confidence Dropdown List */}
          <AnimatePresence>
            {activeDropdown === 'confidence' && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="absolute left-0 top-[72px] z-60 w-full bg-white dark:bg-[#15093f] rounded-2xl border border-[#D4D2FB] dark:border-[#382285] shadow-xl p-3 space-y-2.5"
              >
                {CONFIDENCE_OPTIONS.map((opt) => {
                  const isChecked = selectedConfidence === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => {
                        onSelectConfidence(opt.id);
                        setActiveDropdown(null);
                      }}
                      className="flex items-center gap-2.5 cursor-pointer hover:bg-slate-50 dark:hover:bg-[#1f1057] p-1.5 rounded-lg transition-colors"
                    >
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                          isChecked
                            ? 'bg-[#5338F5] text-white'
                            : 'border border-[#D4D2FB] dark:border-[#3d278f] bg-white dark:bg-[#180d46]'
                        }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                        {opt.label}
                      </span>
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ─── 3. SORT BY SECTION ─── */}
        <div className="relative">
          <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
            Sort by
          </label>
          <button
            type="button"
            onClick={() => setActiveDropdown((prev) => (prev === 'sort' ? null : 'sort'))}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border ${
              activeDropdown === 'sort' || selectedSort !== 'Highest Confidence'
                ? 'border-[#5338F5]'
                : 'border-[#D4D2FB] dark:border-[#382285]'
            } bg-white dark:bg-[#180d46] text-sm transition-colors cursor-pointer`}
          >
            <span className="text-slate-800 dark:text-slate-100 font-medium text-sm">
              {selectedSort}
            </span>
            <ChevronDown
              className={`w-4 h-4 text-slate-500 dark:text-slate-400 transition-transform ${
                activeDropdown === 'sort' ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Sort By Dropdown List */}
          <AnimatePresence>
            {activeDropdown === 'sort' && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="absolute left-0 top-[72px] z-60 w-full bg-white dark:bg-[#15093f] rounded-2xl border border-[#D4D2FB] dark:border-[#382285] shadow-xl p-3 space-y-2.5"
              >
                {SORT_OPTIONS.map((opt) => {
                  const isChecked = selectedSort === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => {
                        onSelectSort(opt.id);
                        setActiveDropdown(null);
                      }}
                      className="flex items-center gap-2.5 cursor-pointer hover:bg-slate-50 dark:hover:bg-[#1f1057] p-1.5 rounded-lg transition-colors"
                    >
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                          isChecked
                            ? 'bg-[#5338F5] text-white'
                            : 'border border-[#D4D2FB] dark:border-[#3d278f] bg-white dark:bg-[#180d46]'
                        }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                        {opt.label}
                      </span>
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ─── 4. DONE BUTTON ─── */}
        <button
          type="button"
          onClick={() => {
            setActiveDropdown(null);
            onClose();
          }}
          className="w-full py-2.5 rounded-xl border border-[#D4D2FB] dark:border-[#382285] bg-white dark:bg-[#180d46] text-[#5338F5] dark:text-[#a08efd] font-semibold text-sm hover:bg-[#5338F5]/5 active:scale-[0.99] transition-all cursor-pointer shadow-2xs"
        >
          Done
        </button>
      </div>
    </div>
  );
};

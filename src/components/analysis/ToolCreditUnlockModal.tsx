import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Sparkles, X, ChevronDown, Check, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile } from '../../types';

export type UnlockDurationOption = '1d' | '7d' | '30d';

export interface UnlockableTool {
  id: string;
  title: string;
  shortDescription: string;
  categoryName?: string;
  dailyPrice: number;
  minLevel?: number;
}

export const UNLOCKABLE_TOOLS_DATA: Record<string, UnlockableTool> = {
  correlation: {
    id: 'correlation',
    title: 'Correlation analytics',
    shortDescription: 'Advanced cross-asset Pearson correlation matrices and portfolio hedging telemetry.',
    dailyPrice: 180,
    minLevel: 4,
  },
  heatmap: {
    id: 'heatmap',
    title: 'Heatmap analytics',
    shortDescription: 'Real-time multi-asset heatmaps, sector volatility mapping, and volume clustering.',
    dailyPrice: 100,
    minLevel: 2,
  },
  scatter: {
    id: 'scatter',
    title: 'Scatter plot analytics',
    shortDescription: 'Institutional 2D risk-reward distribution, RSI relative momentum, and beta correlation maps.',
    dailyPrice: 120,
    minLevel: 3,
  },
  volume: {
    id: 'volume',
    title: 'Cross-market analytics',
    shortDescription: 'Multi-asset trade volume distribution and comparative liquidity depth.',
    dailyPrice: 100,
    minLevel: 3,
  },
  news: {
    id: 'news',
    title: 'Market News & Recap',
    shortDescription: 'Curated macroeconomic intelligence, sentiment analysis, and editorial recaps.',
    dailyPrice: 120,
    minLevel: 3,
  },
};

interface ToolCreditUnlockModalProps {
  isOpen: boolean;
  tool: UnlockableTool | null;
  user: UserProfile;
  onClose: () => void;
  onConfirmUnlock: (tool: UnlockableTool, duration: UnlockDurationOption, cost: number) => void;
  onViewLevelBenefits?: () => void;
}

export const ToolCreditUnlockModal: React.FC<ToolCreditUnlockModalProps> = ({
  isOpen,
  tool,
  user,
  onClose,
  onConfirmUnlock,
  onViewLevelBenefits,
}) => {
  const [selectedDuration, setSelectedDuration] = useState<UnlockDurationOption>('1d');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedDuration('1d');
      setIsConfirmed(false);
      setIsDropdownOpen(false);
    }
  }, [isOpen, tool?.id]);

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !tool) return null;

  const currentLevel = user.tierLevel || 1;
  const userCredits = user.sydeCredits ?? 154;

  // Pricing calculations
  const durationConfig: Record<
    UnlockDurationOption,
    { label: string; shortLabel: string; ms: number; multiplier: number }
  > = {
    '1d': { label: '1 day', shortLabel: '1d', ms: 24 * 60 * 60 * 1000, multiplier: 1 },
    '7d': { label: '7 days', shortLabel: '7d', ms: 7 * 24 * 60 * 60 * 1000, multiplier: 5 }, // ~28% discount
    '30d': { label: '30 days', shortLabel: '30d', ms: 30 * 24 * 60 * 60 * 1000, multiplier: 15.5 }, // ~48% discount
  };

  const getCostForDuration = (dur: UnlockDurationOption) => {
    const base = tool.dailyPrice;
    return Math.round(base * durationConfig[dur].multiplier);
  };

  const creditCost = getCostForDuration(selectedDuration);
  const currentDurationInfo = durationConfig[selectedDuration];

  // Expiry timestamp string e.g. "9/19/2026, 3:07:24 PM"
  const expiryDate = new Date(Date.now() + currentDurationInfo.ms);
  const expiryFormatted = expiryDate.toLocaleString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const hasEnoughCredits = userCredits >= creditCost;

  const handleConfirm = () => {
    if (!isConfirmed) return;
    onConfirmUnlock(tool, selectedDuration, creditCost);
    onClose();
  };

  return (
    <AnimatePresence>
      <div
        id="tool-unlock-modal-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          id="tool-unlock-modal"
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="w-full max-w-[480px] bg-white dark:bg-[#120B2E] rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-2xl p-6 sm:p-7 relative overflow-visible text-slate-900 dark:text-white"
        >
          {/* Header Row */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
                {tool.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Use credits to unlock this tool. Other premium features remain separate.
              </p>
            </div>
            <button
              id="tool-unlock-close-btn"
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg border border-slate-200 dark:border-white/15 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer shrink-0"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Access Window Banner Box */}
          <div className="mt-5 p-4 rounded-2xl bg-[#F6F4FE] dark:bg-[#5945F1]/15 border border-[#E9E4FC] dark:border-[#5945F1]/25 flex items-start gap-3">
            <div className="w-6 h-6 rounded-lg bg-[#5945F1]/15 dark:bg-[#5945F1]/30 flex items-center justify-center shrink-0 mt-0.5 text-[#5945F1] dark:text-[#CAEB0E]">
              <Sparkles className="w-4 h-4 text-[#5945F1] dark:text-[#CAEB0E]" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-[#5945F1] dark:text-[#A396FC]">
                Choose your access window
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 font-medium">
                Level {currentLevel} pricing · {userCredits.toLocaleString()} C available. No cash payment.
              </p>
            </div>
          </div>

          {/* Duration Selector */}
          <div className="mt-5 relative" ref={dropdownRef}>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
              Duration
            </label>
            <button
              id="tool-unlock-duration-btn"
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-slate-200 dark:border-white/15 bg-white dark:bg-white/5 text-sm font-semibold text-slate-900 dark:text-white shadow-2xs hover:border-slate-300 dark:hover:border-white/25 transition-all cursor-pointer"
            >
              <span>
                {currentDurationInfo.label} · {creditCost.toLocaleString()} C
              </span>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                  isDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Dropdown Options */}
            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-[#1a123d] rounded-xl border border-slate-200 dark:border-white/15 shadow-xl py-1 z-30 animate-in fade-in zoom-in-95 duration-150">
                {(['1d', '7d', '30d'] as UnlockDurationOption[]).map((dur) => {
                  const optCost = getCostForDuration(dur);
                  const optInfo = durationConfig[dur];
                  const isSelected = selectedDuration === dur;
                  return (
                    <button
                      key={dur}
                      type="button"
                      onClick={() => {
                        setSelectedDuration(dur);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-2.5 flex items-center justify-between text-xs font-semibold transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-[#5945F1]/10 text-[#5945F1] dark:text-[#CAEB0E]'
                          : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {optInfo.label} · {optCost.toLocaleString()} C
                        {dur === '7d' && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold">
                            Save 28%
                          </span>
                        )}
                        {dur === '30d' && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 font-bold">
                            Save 48%
                          </span>
                        )}
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Credit Deduction Row */}
          <div className="mt-3.5 px-4 py-3.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
              Credit deduction
            </span>
            <span className="text-base font-bold text-[#5945F1] dark:text-[#ABA1F8] font-mono">
              {creditCost.toLocaleString()} C
            </span>
          </div>

          {/* Estimated Expiry Note */}
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Estimated expiry: {expiryFormatted}. Starts on confirmation; no automatic renewal. Access ends at expiry unless included in your level.
          </p>

          {/* Insufficient Credits Warning if needed */}
          {!hasEnoughCredits && (
            <div className="mt-3 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 flex items-center gap-2 text-rose-700 dark:text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>
                You need {(creditCost - userCredits).toLocaleString()} more Syde Credits to unlock this tool.
              </span>
            </div>
          )}

          {/* Checkbox Confirmation */}
          <label className="mt-4 flex items-start gap-2.5 cursor-pointer select-none group">
            <input
              type="checkbox"
              checked={isConfirmed}
              onChange={(e) => setIsConfirmed(e.target.checked)}
              className="mt-0.5 rounded border-slate-300 dark:border-white/20 text-[#5945F1] focus:ring-[#5945F1] w-4 h-4 cursor-pointer accent-[#5945F1]"
            />
            <span className="text-xs text-slate-600 dark:text-slate-300 leading-snug group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
              I confirm spending {creditCost.toLocaleString()} credits for {currentDurationInfo.shortLabel} of {tool.title}.
            </span>
          </label>

          {/* Primary Action Button */}
          <button
            id="tool-unlock-confirm-btn"
            type="button"
            disabled={!isConfirmed || !hasEnoughCredits}
            onClick={handleConfirm}
            className={`mt-4 w-full py-3 px-4 rounded-xl font-bold text-sm text-white transition-all flex items-center justify-center gap-2 shadow-md ${
              !isConfirmed || !hasEnoughCredits
                ? 'opacity-50 cursor-not-allowed bg-[#5945F1]'
                : 'bg-[#5945F1] hover:bg-[#4a36e2] active:scale-[0.99] cursor-pointer hover:shadow-lg hover:shadow-[#5945F1]/20'
            }`}
          >
            Confirm · check credit balance
          </button>

          {/* Footer Actions */}
          <div className="mt-5 flex items-center justify-between">
            <button
              id="tool-unlock-view-benefits-btn"
              type="button"
              onClick={() => {
                onClose();
                onViewLevelBenefits?.();
              }}
              className="px-4 py-2 rounded-full border border-slate-200 dark:border-white/15 bg-white dark:bg-white/5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              View level benefits
            </button>

            <button
              id="tool-unlock-cancel-btn"
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-full border border-slate-200 dark:border-white/15 bg-white dark:bg-white/5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

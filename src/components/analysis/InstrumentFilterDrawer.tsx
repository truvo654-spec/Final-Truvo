import React, { useState } from 'react';
import { X, ChevronDown, PlusCircle, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface FilterCondition {
  id: string;
  field: 'marketCap' | 'rolVolume' | 'rsi' | 'return1M' | 'change' | 'price';
  label: string;
  operator: '>' | '<' | '>=' | '<=' | '=';
  value: number;
  displayValue: string;
}

export const DEFAULT_FILTER_CONDITIONS: FilterCondition[] = [
  {
    id: 'marketCap',
    field: 'marketCap',
    label: 'Market Cap',
    operator: '>',
    value: 10,
    displayValue: '> $10B',
  },
  {
    id: 'relativeVolume',
    field: 'rolVolume',
    label: 'Relative Volume',
    operator: '>',
    value: 1.5,
    displayValue: '> 1.5',
  },
  {
    id: 'rsi',
    field: 'rsi',
    label: 'RSI (14)',
    operator: '<',
    value: 45,
    displayValue: '< 45',
  },
  {
    id: 'return1M',
    field: 'return1M',
    label: '1M Return',
    operator: '>',
    value: 5,
    displayValue: '> 5%',
  },
];

export const AVAILABLE_CONDITIONS_TO_ADD: FilterCondition[] = [
  {
    id: 'marketCap',
    field: 'marketCap',
    label: 'Market Cap',
    operator: '>',
    value: 10,
    displayValue: '> $10B',
  },
  {
    id: 'relativeVolume',
    field: 'rolVolume',
    label: 'Relative Volume',
    operator: '>',
    value: 1.5,
    displayValue: '> 1.5',
  },
  {
    id: 'rsi',
    field: 'rsi',
    label: 'RSI (14)',
    operator: '<',
    value: 45,
    displayValue: '< 45',
  },
  {
    id: 'return1M',
    field: 'return1M',
    label: '1M Return',
    operator: '>',
    value: 5,
    displayValue: '> 5%',
  },
  {
    id: 'change',
    field: 'change',
    label: '24h Change',
    operator: '>',
    value: 2,
    displayValue: '> 2%',
  },
  {
    id: 'price',
    field: 'price',
    label: 'Price',
    operator: '>',
    value: 100,
    displayValue: '> $100',
  },
];

interface InstrumentFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  sector: string;
  onSectorChange: (sector: string) => void;
  subSector: string;
  onSubSectorChange: (subSector: string) => void;
  conditions: FilterCondition[];
  onRemoveCondition: (id: string) => void;
  onAddCondition: (condition: FilterCondition) => void;
  onResetAll?: () => void;
  onDone: () => void;
}

export const InstrumentFilterDrawer: React.FC<InstrumentFilterDrawerProps> = ({
  isOpen,
  onClose,
  sector,
  onSectorChange,
  subSector,
  onSubSectorChange,
  conditions,
  onRemoveCondition,
  onAddCondition,
  onResetAll,
  onDone,
}) => {
  const [showAddMenu, setShowAddMenu] = useState(false);

  if (!isOpen) return null;

  const existingIds = new Set(conditions.map((c) => c.id));
  const candidateConditions = AVAILABLE_CONDITIONS_TO_ADD.filter((c) => !existingIds.has(c.id));

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/30 backdrop-blur-md animate-in fade-in duration-200">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      {/* Slide-over Drawer Panel */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="relative w-full max-w-[360px] sm:max-w-[380px] h-full bg-white dark:bg-[#120a2e] border-l border-purple-200/80 dark:border-purple-900/50 shadow-2xl flex flex-col justify-between z-10 select-none"
      >
        {/* Scrollable Content Container */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* ─── 1. TOP DIVIDER: FILTER ─── */}
          <div className="relative flex items-center justify-center pt-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-purple-200 dark:border-purple-800/60" />
            </div>
            <span className="relative bg-white dark:bg-[#120a2e] px-4 text-xs font-medium text-purple-400 dark:text-purple-300">
              Filter
            </span>
          </div>

          {/* ─── SECTOR SELECT ─── */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
              Sector
            </label>
            <div className="relative">
              <select
                value={sector}
                onChange={(e) => onSectorChange(e.target.value)}
                className="w-full appearance-none bg-white dark:bg-[#1a113d] border border-purple-200 dark:border-purple-800/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-700 dark:text-slate-200 font-medium focus:outline-hidden focus:border-[#5945F1] pr-8 cursor-pointer shadow-2xs"
              >
                <option value="All">All</option>
                <option value="Crypto">Crypto</option>
                <option value="Forex">Forex</option>
                <option value="Equities">Equities</option>
                <option value="Commodities">Commodities</option>
                <option value="Indices">Indices</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* ─── SUB-SECTOR SELECT ─── */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
              Sub-sector
            </label>
            <div className="relative">
              <select
                value={subSector}
                onChange={(e) => onSubSectorChange(e.target.value)}
                className="w-full appearance-none bg-white dark:bg-[#1a113d] border border-purple-200 dark:border-purple-800/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-700 dark:text-slate-200 font-medium focus:outline-hidden focus:border-[#5945F1] pr-8 cursor-pointer shadow-2xs"
              >
                <option value="All">All</option>
                <option value="Layer 1">Layer 1</option>
                <option value="DeFi">DeFi</option>
                <option value="Majors">Majors</option>
                <option value="Tech">Tech</option>
                <option value="Precious Metals">Precious Metals</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* ─── 2. MIDDLE DIVIDER: LOGIC ─── */}
          <div className="relative flex items-center justify-center pt-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-purple-200 dark:border-purple-800/60" />
            </div>
            <span className="relative bg-white dark:bg-[#120a2e] px-4 text-xs font-medium text-purple-400 dark:text-purple-300">
              Logic
            </span>
          </div>

          {/* ─── CONDITIONS LIST ─── */}
          <div className="space-y-4">
            {conditions.map((cond) => (
              <div key={cond.id}>
                <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                  {cond.label}
                </label>
                <div className="flex items-center justify-between border border-purple-200 dark:border-purple-800/80 rounded-xl px-3.5 py-2.5 bg-white dark:bg-[#1a113d] text-xs font-medium text-slate-700 dark:text-slate-200 shadow-2xs">
                  <span>{cond.displayValue}</span>
                  <button
                    type="button"
                    onClick={() => onRemoveCondition(cond.id)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-0.5 rounded-sm transition-colors cursor-pointer"
                    title={`Remove ${cond.label}`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* ─── ADD CONDITION BUTTON ─── */}
          <div className="relative pt-1">
            <button
              type="button"
              onClick={() => setShowAddMenu((prev) => !prev)}
              className="w-full py-2.5 px-4 rounded-full border border-purple-300 dark:border-purple-700 text-[#5945F1] dark:text-purple-300 hover:bg-purple-50/80 dark:hover:bg-purple-950/40 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer active:scale-98"
            >
              <PlusCircle className="w-4 h-4 text-[#5945F1] dark:text-purple-300" />
              <span>Add Condition</span>
            </button>

            {/* Candidate Condition Picker Menu */}
            {showAddMenu && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-[#1a113d] border border-purple-200 dark:border-purple-800 rounded-2xl shadow-xl p-2 z-20 space-y-1 animate-in zoom-in-95 duration-150">
                {candidateConditions.length > 0 ? (
                  candidateConditions.map((cand) => (
                    <button
                      key={cand.id}
                      type="button"
                      onClick={() => {
                        onAddCondition(cand);
                        setShowAddMenu(false);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-950/50 rounded-lg transition-colors cursor-pointer text-left"
                    >
                      <span>{cand.label}</span>
                      <span className="text-purple-600 dark:text-purple-400">{cand.displayValue}</span>
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-2 text-xs text-slate-400 text-center">
                    All conditions already active
                  </div>
                )}
                {onResetAll && (
                  <button
                    type="button"
                    onClick={() => {
                      onResetAll();
                      setShowAddMenu(false);
                    }}
                    className="w-full border-t border-slate-100 dark:border-slate-800 mt-1 pt-1.5 px-3 py-1.5 text-[11px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-center cursor-pointer"
                  >
                    Reset to Default Conditions
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ─── 3. BOTTOM ACTION: DONE BUTTON (Exact Match to Screenshot) ─── */}
        <div className="p-6 border-t border-slate-100 dark:border-purple-900/30 bg-white dark:bg-[#120a2e]">
          <button
            type="button"
            onClick={onDone}
            className="w-full py-3.5 px-6 rounded-xl bg-[#5945F1] hover:bg-[#4a36e2] text-white font-bold text-sm shadow-md hover:shadow-lg hover:shadow-[#5945F1]/25 transition-all cursor-pointer active:scale-98"
          >
            Done
          </button>
        </div>
      </motion.div>
    </div>
  );
};

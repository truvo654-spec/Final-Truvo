import React from 'react';
import { X, Calculator, Pencil, Trash2, Bookmark } from 'lucide-react';
import { SavedCalculation } from './savedCalculationsTypes';

interface SavedCalculationsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  savedCalculations: SavedCalculation[];
  onLoadCalculation: (calc: SavedCalculation) => void;
  onEditCalculation: (calc: SavedCalculation) => void;
  onDeleteCalculation: (id: string) => void;
  onViewPlans: () => void;
}

export const SavedCalculationsSidebar: React.FC<SavedCalculationsSidebarProps> = ({
  isOpen,
  onClose,
  savedCalculations,
  onLoadCalculation,
  onEditCalculation,
  onDeleteCalculation,
  onViewPlans,
}) => {
  if (!isOpen) return null;

  const slotsUsed = savedCalculations.length;
  const maxSlots = 2;
  const slotsLeft = Math.max(0, maxSlots - slotsUsed);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none animate-in fade-in duration-150">
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <aside
        className="fixed inset-y-0 right-0 z-50 w-80 sm:w-88 bg-white dark:bg-[#14033f] border-l border-indigo-100 dark:border-[#230674] shadow-2xl p-5 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200"
        aria-label="Saved Calculations"
      >
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#230674]">
            <h2 className="text-base font-bold tracking-tight">
              <span className="text-[#5945F1] dark:text-[#ABA1F8]">Saved Calculation</span>
              <span className="text-[#FD02B0]">s</span>
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer"
              aria-label="Close Sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* EMPTY STATE (Matches 'Sidebar - Empty State.png' exactly) */}
          {slotsUsed === 0 ? (
            <div className="rounded-3xl border-2 border-[#FD02B0] bg-white dark:bg-[#1a084c]/50 p-6 flex flex-col items-center justify-center text-center mt-4 shadow-xs">
              {/* 3D Isometric Empty Box Illustration with Lightning Bolt & Glow */}
              <div className="w-36 h-36 relative flex items-center justify-center my-1">
                <svg viewBox="0 0 160 140" className="w-full h-full drop-shadow-md overflow-visible">
                  <defs>
                    {/* Shadow / Pedestal */}
                    <radialGradient id="pedestalGrad" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#C4B5FD" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#EDE9FE" stopOpacity="0" />
                    </radialGradient>

                    {/* Isometric Cube Faces */}
                    <linearGradient id="cubeTop" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#7C3AED" />
                      <stop offset="50%" stopColor="#6366F1" />
                      <stop offset="100%" stopColor="#4F46E5" />
                    </linearGradient>
                    <linearGradient id="cubeLeft" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#4338CA" />
                      <stop offset="100%" stopColor="#2E1065" />
                    </linearGradient>
                    <linearGradient id="cubeRight" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#5B21B6" />
                      <stop offset="100%" stopColor="#1E1B4B" />
                    </linearGradient>

                    {/* Electric Lightning Gradient */}
                    <linearGradient id="lightningGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FFFBEB" />
                      <stop offset="25%" stopColor="#FDE047" />
                      <stop offset="75%" stopColor="#F59E0B" />
                      <stop offset="100%" stopColor="#D97706" />
                    </linearGradient>

                    {/* Glow filter */}
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>

                  {/* Circular ground pedestal shadow */}
                  <ellipse cx="80" cy="118" rx="52" ry="15" fill="url(#pedestalGrad)" />

                  {/* Isometric Box / Cube */}
                  {/* Left Face */}
                  <polygon points="40,68 80,90 80,124 40,102" fill="url(#cubeLeft)" stroke="#312E81" strokeWidth="1" />
                  {/* Right Face */}
                  <polygon points="80,90 120,68 120,102 80,124" fill="url(#cubeRight)" stroke="#312E81" strokeWidth="1" />
                  {/* Top Face / Open Box Rim */}
                  <polygon points="80,46 120,68 80,90 40,68" fill="url(#cubeTop)" stroke="#A78BFA" strokeWidth="1.5" />

                  {/* Inner Box Opening Depth */}
                  <polygon points="80,55 110,70 80,85 50,70" fill="#1E1B4B" opacity="0.95" />

                  {/* Sparkling lightning emerging out of the box */}
                  <polygon
                    points="83,16 93,42 79,46 88,68 68,44 80,39"
                    fill="url(#lightningGrad)"
                    filter="url(#glow)"
                  />

                  {/* Floating sparkles */}
                  {/* Pink Sparkle Left */}
                  <path d="M46 44 Q50 44 50 40 Q50 44 54 44 Q50 44 50 48 Q50 44 46 44" fill="#FD02B0" />
                  {/* Purple Sparkle Right */}
                  <path d="M116 38 Q119 38 119 35 Q119 38 122 38 Q119 38 119 41 Q119 38 116 38" fill="#5945F1" />
                  {/* Golden Sparkle Center */}
                  <path d="M64 24 Q66 24 66 22 Q66 24 68 24 Q66 24 66 26 Q66 24 64 24" fill="#FBBF24" />
                  {/* Magenta Dot Bottom Right */}
                  <circle cx="106" cy="98" r="2.5" fill="#FD02B0" />
                </svg>
              </div>

              {/* Title */}
              <h3 className="text-sm font-bold text-[#5945F1] dark:text-[#ABA1F8] mt-2">
                It's a bit empty here
              </h3>

              {/* Subtext */}
              <p className="text-xs text-slate-500 dark:text-[#CCC6FB] mt-2 leading-relaxed">
                Rookie get <span className="font-bold text-slate-800 dark:text-white">2 save slots</span>.
                To unlock more space and break the limit,{' '}
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onViewPlans();
                  }}
                  className="text-[#5945F1] dark:text-[#ABA1F8] font-bold underline hover:opacity-80 transition-opacity cursor-pointer"
                >
                  View Plans
                </button>
              </p>
            </div>
          ) : (
            /* LIST STATE (Matches 'Saved Calculations Sidebar - Save Entry Shown.png' exactly) */
            <div className="space-y-4">
              {/* Upsell Banner Card */}
              <div className="rounded-2xl border border-indigo-200/90 dark:border-[#3410D5] bg-indigo-50/50 dark:bg-[#1f0a59]/60 p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white dark:bg-[#230674] border border-indigo-100 dark:border-[#3410D5] text-[#5945F1] dark:text-[#ABA1F8] flex items-center justify-center shrink-0 shadow-2xs">
                    <svg
                      className="w-4 h-4 text-[#5945F1] dark:text-[#ABA1F8]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="2" y="4" width="20" height="16" rx="3" />
                      <path d="M6 8h4" />
                      <path d="M6 12h8" />
                      <path d="M6 16h2" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-[#5945F1] dark:text-[#ABA1F8]">
                      {slotsUsed >= maxSlots ? 'Limit Reached!' : `${slotsLeft} slot${slotsLeft === 1 ? '' : 's'} left!`}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-[#CCC6FB] mt-0.5">
                      {slotsUsed >= maxSlots ? 'See how to break the limit' : 'Need more than that?'}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onViewPlans();
                  }}
                  className="w-full py-2 rounded-xl border border-indigo-200/90 dark:border-[#3410D5] bg-white dark:bg-[#230674] hover:bg-slate-50 dark:hover:bg-[#2E0AA3] text-[#5945F1] dark:text-[#ABA1F8] font-bold text-xs transition-all cursor-pointer shadow-2xs text-center"
                >
                  View Plan
                </button>
              </div>

              {/* Slot limit indicator */}
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-[#CCC6FB] px-1 pt-1">
                <Calculator className="w-3.5 h-3.5 text-slate-500 dark:text-[#8A7AF6]" />
                <span>
                  Save Limit {slotsUsed}/{maxSlots} Calculations
                </span>
              </div>

              {/* Saved items list */}
              <div className="space-y-2.5">
                {savedCalculations.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 sm:p-4 rounded-xl border border-indigo-200/80 dark:border-[#3410D5] bg-white dark:bg-[#1a084c] hover:border-[#5945F1] dark:hover:border-[#8A7AF6] transition-all flex items-center justify-between group shadow-2xs"
                  >
                    <div
                      className="min-w-0 flex-1 pr-2 cursor-pointer"
                      onClick={() => onLoadCalculation(item)}
                      title="Load scenario in calculator"
                    >
                      <div className="font-bold text-xs sm:text-sm text-[#5945F1] dark:text-[#ABA1F8] hover:underline transition-colors truncate">
                        {item.name}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-[#8A7AF6] mt-0.5 font-normal">
                        {item.toolLabel} | {item.date}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {/* Edit (Rename) */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditCalculation(item);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-[#5945F1] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#230674] transition-colors cursor-pointer"
                        title="Rename scenario"
                        aria-label="Rename scenario"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteCalculation(item.id);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                        title="Delete scenario"
                        aria-label="Delete scenario"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="pt-4 border-t border-slate-100 dark:border-[#230674] text-center">
          <p className="text-[11px] text-slate-400 dark:text-[#8A7AF6]">
            MarketSyde Calculation Engine
          </p>
        </div>
      </aside>
    </div>
  );
};

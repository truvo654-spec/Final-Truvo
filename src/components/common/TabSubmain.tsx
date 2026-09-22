import React from 'react';
import { Lock } from 'lucide-react';

export interface TabSubmainItem<T extends string = string> {
  id: T;
  label: string;
  count?: number | string;
  icon?: React.ReactNode;
  isLocked?: boolean;
  badge?: string | number;
  minTierLevel?: number;
  tierName?: string;
  description?: string;
}

export interface TabSubmainProps<T extends string = string> {
  tabs: TabSubmainItem<T>[];
  activeTab: T;
  onChange: (tabId: T) => void;
  onLockedTabClick?: (tab: TabSubmainItem<T>) => void;
  prefixLabel?: string;
  rightContent?: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md';
}

/**
 * TabSubmain Component ("tab_submain")
 *
 * Implements the signature browser folder-tab sub-navigation style with
 * smooth inverted fillets (concave curves) and lavender baseline matching
 * the design language of TabMain, proportioned cleanly for secondary toolbars,
 * timeframe selectors, and sub-view bars.
 */
export const TabSubmain = <T extends string = string>({
  tabs,
  activeTab,
  onChange,
  onLockedTabClick,
  prefixLabel,
  rightContent,
  className = '',
  size = 'sm',
}: TabSubmainProps<T>) => {
  const isSmall = size === 'sm';

  return (
    <div
      className={`relative inline-flex items-end select-none ${className}`}
      id="tab-submain-navigation"
    >
      <div className="flex items-end overflow-x-auto scrollbar-none pt-1">
        {/* Optional Prefix Label (e.g. "DURATION") */}
        {prefixLabel && (
          <div className="flex items-center self-end border-b-[1.5px] border-[#D4D0FC] dark:border-[#3B2E85] pb-1.5 pr-2.5 sm:pr-3 pl-1 shrink-0">
            <span className="text-[10px] sm:text-[11px] font-extrabold text-slate-400 dark:text-slate-400 tracking-wider uppercase select-none">
              {prefixLabel}
            </span>
          </div>
        )}

        {/* Left baseline spacer */}
        <div className="w-1.5 sm:w-2 border-b-[1.5px] border-[#D4D0FC] dark:border-[#3B2E85] self-end shrink-0" />

        {/* Tab Items */}
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          const isLocked = Boolean(tab.isLocked);

          if (isActive) {
            return (
              <div
                key={tab.id}
                className={`relative z-10 flex items-center gap-1.5 ${
                  isSmall ? 'px-3 py-1 text-xs' : 'px-4 py-1.5 text-sm'
                } bg-white dark:bg-[#120a2e] text-[#5945F1] dark:text-[#ABA1F8] font-bold select-none cursor-default transition-all self-end shrink-0`}
              >
                {/* ─── Outline wrapper (rounded top + straight edges down to fillet) ─── */}
                <div className="absolute inset-0 pointer-events-none">
                  {/* Top rounded section */}
                  <div className="absolute inset-x-0 top-0 h-[8px] rounded-t-[8px] border-t-[1.5px] border-l-[1.5px] border-r-[1.5px] border-[#D4D0FC] dark:border-[#3B2E85]" />
                  {/* Straight left edge down to 10px from bottom */}
                  <div className="absolute left-0 top-[8px] bottom-[10px] w-[1.5px] bg-[#D4D0FC] dark:bg-[#3B2E85]" />
                  {/* Straight right edge down to 10px from bottom */}
                  <div className="absolute right-0 top-[8px] bottom-[10px] w-[1.5px] bg-[#D4D0FC] dark:bg-[#3B2E85]" />
                </div>

                {/* ─── Left Inverted Fillet (Concave Curve) ─── */}
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 10 10"
                  fill="none"
                  className="absolute bottom-0 -left-[10px] pointer-events-none overflow-visible z-10"
                >
                  <path
                    d="M 0 10 C 5 10 10 5 10 0"
                    fill="none"
                    className="stroke-[#D4D0FC] dark:stroke-[#3B2E85]"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>

                {tab.icon && (
                  <span className="shrink-0 flex items-center text-[#5945F1] dark:text-[#ABA1F8]">
                    {tab.icon}
                  </span>
                )}

                <span className="whitespace-nowrap">{tab.label}</span>

                {/* Optional Badge */}
                {tab.count !== undefined && (
                  <span className="inline-flex items-center justify-center min-w-[18px] px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-[#5945F1] text-white leading-none shadow-2xs">
                    {tab.count}
                  </span>
                )}

                {/* ─── Right Inverted Fillet (Concave Curve) ─── */}
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 10 10"
                  fill="none"
                  className="absolute bottom-0 -right-[10px] pointer-events-none overflow-visible z-10"
                >
                  <path
                    d="M 0 0 C 0 5 5 10 10 10"
                    fill="none"
                    className="stroke-[#D4D0FC] dark:stroke-[#3B2E85]"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            );
          }

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                if (isLocked) {
                  onLockedTabClick?.(tab);
                } else {
                  onChange(tab.id);
                }
              }}
              className={`group relative z-0 flex items-center gap-1 ${
                isSmall ? 'px-2.5 py-1 text-xs' : 'px-3.5 py-1.5 text-sm'
              } ${
                isLocked
                  ? 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'
                  : 'text-slate-600 dark:text-slate-300 hover:text-[#5945F1] dark:hover:text-[#ABA1F8]'
              } font-medium transition-colors cursor-pointer select-none whitespace-nowrap border-b-[1.5px] border-[#D4D0FC] dark:border-[#3B2E85] self-end shrink-0`}
              title={isLocked ? `${tab.label} (Locked - Click to unlock)` : tab.label}
            >
              {tab.icon && (
                <span className="shrink-0 flex items-center group-hover:text-[#5945F1] transition-colors">
                  {tab.icon}
                </span>
              )}
              <span>{tab.label}</span>
              {isLocked && (
                <Lock className="w-2.5 h-2.5 text-purple-400/80 stroke-[2.5] shrink-0" />
              )}
              {tab.count !== undefined && (
                <span className="inline-flex items-center justify-center min-w-[16px] px-1 py-0.2 text-[9px] font-bold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 leading-none">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}

        {/* Baseline filler to right */}
        <div className="w-2 sm:w-3 border-b-[1.5px] border-[#D4D0FC] dark:border-[#3B2E85] self-end shrink-0" />

        {rightContent && (
          <div className="pb-1 pl-2 border-b-[1.5px] border-[#D4D0FC] dark:border-[#3B2E85] self-end shrink-0">
            {rightContent}
          </div>
        )}
      </div>
    </div>
  );
};

export default TabSubmain;

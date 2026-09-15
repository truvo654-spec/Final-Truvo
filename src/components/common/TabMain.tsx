import React from 'react';

export interface TabMainItem<T extends string = string> {
  id: T;
  label: string;
  count?: number | string;
  icon?: React.ReactNode;
  showBadge?: boolean;
}

export interface TabMainProps<T extends string = string> {
  tabs: TabMainItem<T>[];
  activeTab: T;
  onChange: (tabId: T) => void;
  className?: string;
  /**
   * If true (default), the count badge is displayed on the active tab (matching the reference design).
   * Inactive tabs remain clean text.
   */
  showBadgeOnActiveOnly?: boolean;
}

/**
 * TabMain Component ("tab main")
 *
 * Implements the browser folder-tab navigation style with smooth inverted fillets
 * and lavender baseline matching the reference design 1:1.
 */
export const TabMain = <T extends string = string>({
  tabs,
  activeTab,
  onChange,
  className = '',
  showBadgeOnActiveOnly = true,
}: TabMainProps<T>) => {
  return (
    <div className={`w-full ${className}`} id="tab-main-navigation">
      {/* Scrollable container for mobile responsiveness */}
      <div className="w-full overflow-x-auto scrollbar-none pt-1">
        {/* Baseline line with left & right padding */}
        <div className="relative flex items-end min-w-max border-b-[1.5px] border-[#D4D0FC] dark:border-[#3B2E85] pl-3 sm:pl-5 pr-4 pb-0">
          <div className="flex items-end">
            {tabs.map((tab) => {
              const isActive = tab.id === activeTab;
              const shouldShowBadge =
                tab.count !== undefined &&
                (tab.showBadge !== undefined
                  ? tab.showBadge
                  : showBadgeOnActiveOnly
                  ? isActive
                  : true);

              if (isActive) {
                return (
                  <div
                    key={tab.id}
                    className="relative z-10 flex items-center gap-2 px-5 py-2 sm:py-2.5 bg-white dark:bg-[#090119] text-[#5945F1] dark:text-[#ABA1F8] font-semibold text-sm sm:text-[15px] rounded-t-[10px] border-t-[1.5px] border-l-[1.5px] border-r-[1.5px] border-[#D4D0FC] dark:border-[#3B2E85] -mb-[1.5px] select-none cursor-default transition-all shadow-[0_-1px_3px_rgba(89,69,241,0.03)]"
                  >
                    {/* ─── Left Inverted Fillet (Concave Curve) ─── */}
                    <svg
                      width="14"
                      height="12"
                      viewBox="0 0 14 12"
                      fill="none"
                      className="absolute bottom-0 -left-[12px] pointer-events-none overflow-visible z-10"
                    >
                      {/* White fill covering bottom 12px of tab's border-l */}
                      <path
                        d="M 0 12 C 6 12 12 6 12 0 L 14 0 L 14 12 Z"
                        className="fill-white dark:fill-[#090119]"
                      />
                      {/* Lavender curve matching stroke */}
                      <path
                        d="M 0 12 C 6 12 12 6 12 0"
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

                    <span className="whitespace-nowrap font-semibold">{tab.label}</span>

                    {/* Pill Badge (matching image.png) */}
                    {shouldShowBadge && (
                      <span className="inline-flex items-center justify-center min-w-[22px] px-2 py-0.5 text-[11px] sm:text-xs font-bold rounded-full bg-[#5945F1] text-white leading-none shadow-2xs">
                        {tab.count}
                      </span>
                    )}

                    {/* ─── Right Inverted Fillet (Concave Curve) ─── */}
                    <svg
                      width="14"
                      height="12"
                      viewBox="0 0 14 12"
                      fill="none"
                      className="absolute bottom-0 -right-[12px] pointer-events-none overflow-visible z-10"
                    >
                      {/* White fill covering bottom 12px of tab's border-r */}
                      <path
                        d="M 0 0 L 2 0 C 2 6 8 12 14 12 L 0 12 Z"
                        className="fill-white dark:fill-[#090119]"
                      />
                      {/* Lavender curve matching stroke */}
                      <path
                        d="M 2 0 C 2 6 8 12 14 12"
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
                  onClick={() => onChange(tab.id)}
                  className="group relative z-0 flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 text-slate-800 dark:text-slate-200 hover:text-[#5945F1] dark:hover:text-[#ABA1F8] font-medium text-sm sm:text-[15px] transition-colors cursor-pointer select-none whitespace-nowrap"
                >
                  {tab.icon && (
                    <span className="shrink-0 flex items-center text-slate-700 dark:text-slate-300 group-hover:text-[#5945F1] dark:group-hover:text-[#ABA1F8] transition-colors">
                      {tab.icon}
                    </span>
                  )}
                  <span>{tab.label}</span>
                  {shouldShowBadge && (
                    <span className="inline-flex items-center justify-center min-w-[20px] px-1.5 py-0.5 text-[11px] font-bold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 leading-none">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TabMain;

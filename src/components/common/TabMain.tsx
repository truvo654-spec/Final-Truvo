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
  rightContent?: React.ReactNode;
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
  rightContent,
}: TabMainProps<T>) => {
  return (
    <div className={`w-full ${className}`} id="tab-main-navigation">
      {/* Scrollable container for mobile responsiveness */}
      <div className="w-full overflow-x-auto scrollbar-none pt-1">
        {/* Baseline line with left & right padding */}
        <div className="relative flex items-end justify-between min-w-full pl-3 sm:pl-5 pr-3 sm:pr-4 pb-0">
          <div className="flex items-end flex-1">
            {/* Left baseline spacer */}
            <div className="w-2 sm:w-3 border-b-[1.5px] border-[#D4D0FC] dark:border-[#3B2E85] self-end" />

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
                    className="relative z-10 flex items-center gap-2 px-5 py-2 sm:py-2.5 bg-transparent text-[#5945F1] dark:text-[#ABA1F8] font-semibold text-sm sm:text-[15px] select-none cursor-default transition-all self-end"
                  >
                    {/* Outline wrapper without filling background */}
                    <div className="absolute inset-0 pointer-events-none">
                      {/* Top rounded section */}
                      <div className="absolute inset-x-0 top-0 h-[10px] rounded-t-[10px] border-t-[1.5px] border-l-[1.5px] border-r-[1.5px] border-[#D4D0FC] dark:border-[#3B2E85]" />
                      {/* Straight left edge down to 12px from bottom */}
                      <div className="absolute left-0 top-[10px] bottom-[12px] w-[1.5px] bg-[#D4D0FC] dark:bg-[#3B2E85]" />
                      {/* Straight right edge down to 12px from bottom */}
                      <div className="absolute right-0 top-[10px] bottom-[12px] w-[1.5px] bg-[#D4D0FC] dark:bg-[#3B2E85]" />
                    </div>

                    {/* ─── Left Inverted Fillet (Concave Curve) ─── */}
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      className="absolute bottom-0 -left-[12px] pointer-events-none overflow-visible z-10"
                    >
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

                    {/* Pill Badge */}
                    {shouldShowBadge && (
                      <span className="inline-flex items-center justify-center min-w-[22px] px-2 py-0.5 text-[11px] sm:text-xs font-bold rounded-full bg-[#5945F1] text-white leading-none shadow-2xs">
                        {tab.count}
                      </span>
                    )}

                    {/* ─── Right Inverted Fillet (Concave Curve) ─── */}
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      className="absolute bottom-0 -right-[12px] pointer-events-none overflow-visible z-10"
                    >
                      <path
                        d="M 0 0 C 0 6 6 12 12 12"
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
                  className="group relative z-0 flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 text-slate-800 dark:text-slate-200 hover:text-[#5945F1] dark:hover:text-[#ABA1F8] font-medium text-sm sm:text-[15px] transition-colors cursor-pointer select-none whitespace-nowrap border-b-[1.5px] border-[#D4D0FC] dark:border-[#3B2E85] self-end"
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

            {/* Baseline filler to right */}
            <div className="flex-1 border-b-[1.5px] border-[#D4D0FC] dark:border-[#3B2E85] self-end" />
          </div>

          {rightContent && (
            <div className="pb-1.5 pl-3 sm:pl-4 ml-auto flex items-center shrink-0 border-b-[1.5px] border-[#D4D0FC] dark:border-[#3B2E85] self-end">
              {rightContent}
            </div>
          )}
          {/* Far right spacer */}
          <div className="w-3 sm:w-4 border-b-[1.5px] border-[#D4D0FC] dark:border-[#3B2E85] self-end" />
        </div>
      </div>
    </div>
  );
};

export default TabMain;

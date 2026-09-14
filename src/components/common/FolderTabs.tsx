import React from 'react';

export interface FolderTabItem<T extends string = string> {
  id: T;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

interface FolderTabsProps<T extends string = string> {
  tabs: FolderTabItem<T>[];
  activeTab: T;
  onChange: (tabId: T) => void;
  className?: string;
}

export const FolderTabs = <T extends string = string>({
  tabs,
  activeTab,
  onChange,
  className = '',
}: FolderTabsProps<T>) => {
  const activeIndex = tabs.findIndex((t) => t.id === activeTab);

  return (
    <div className={`w-full ${className}`}>
      {/* Bottom border baseline */}
      <div className="relative flex items-end border-b border-slate-300/80 dark:border-slate-700 w-full overflow-x-auto scrollbar-none">
        <div className="flex items-end">
          {tabs.map((tab, index) => {
            const isActive = tab.id === activeTab;
            const isFirst = index === 0;
            const isLast = index === tabs.length - 1;

            if (isActive) {
              return (
                <div
                  key={tab.id}
                  className="relative z-10 flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-white dark:bg-[#150444] text-[#5945F1] dark:text-[#ABA1F8] font-medium text-sm sm:text-base rounded-t-xl border-t border-l border-r border-slate-300/80 dark:border-slate-700 -mb-[1px] select-none cursor-default transition-all shadow-[0_-1px_2px_rgba(0,0,0,0.02)]"
                >
                  {/* Left Concave Fillet Curve (if not at the very left edge) */}
                  {!isFirst && (
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 10 10"
                      fill="none"
                      className="absolute bottom-0 -left-[10px] pointer-events-none"
                    >
                      <path
                        d="M0 10 C5 10 10 5 10 0 L10 10 Z"
                        className="fill-white dark:fill-[#150444]"
                      />
                      <path
                        d="M0 10 C5 10 10 5 10 0"
                        className="stroke-slate-300/80 dark:stroke-slate-700"
                        strokeWidth="1"
                        fill="none"
                      />
                    </svg>
                  )}

                  {tab.icon && <span className="shrink-0">{tab.icon}</span>}
                  <span className="whitespace-nowrap">{tab.label}</span>
                  {typeof tab.count === 'number' && (
                    <span className="text-xs px-1.5 py-0.5 rounded-full bg-indigo-50 dark:bg-[#230674] text-[#5945F1] dark:text-[#ABA1F8] font-semibold">
                      {tab.count}
                    </span>
                  )}

                  {/* Right Concave Fillet Curve */}
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 10 10"
                    fill="none"
                    className="absolute bottom-0 -right-[10px] pointer-events-none"
                  >
                    <path
                      d="M0 0 C0 5 5 10 10 10 L0 10 Z"
                      className="fill-white dark:fill-[#150444]"
                    />
                    <path
                      d="M0 0 C0 5 5 10 10 10"
                      className="stroke-slate-300/80 dark:stroke-slate-700"
                      strokeWidth="1"
                      fill="none"
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
                className="relative z-0 flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 text-slate-800 dark:text-slate-200 hover:text-[#5945F1] dark:hover:text-[#ABA1F8] font-medium text-sm sm:text-base transition-colors cursor-pointer select-none whitespace-nowrap"
              >
                {tab.icon && <span className="shrink-0 text-slate-500">{tab.icon}</span>}
                <span>{tab.label}</span>
                {typeof tab.count === 'number' && (
                  <span className="text-xs px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

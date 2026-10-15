import React from 'react';

/**
 * A segmented control: the whole group sits in a grey track and the chosen
 * option lifts out of it as a white pill. Used where a panel needs to switch
 * between a handful of views without the weight of the folder tabs.
 */
export interface SegmentedTabItem<T extends string = string> {
  id: T;
  label: string;
  /** Shown with a lock and not selectable. */
  isLocked?: boolean;
}

export function SegmentedTabs<T extends string = string>({
  tabs,
  activeTab,
  onChange,
  onLockedClick,
  className = '',
}: {
  tabs: SegmentedTabItem<T>[];
  activeTab: T;
  onChange: (id: T) => void;
  onLockedClick?: (tab: SegmentedTabItem<T>) => void;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      className={`inline-flex w-full items-center gap-1 rounded-xl bg-[#f1f2f6] p-1 dark:bg-white/10 ${className}`}
    >
      {tabs.map((tab) => {
        const active = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => (tab.isLocked ? onLockedClick?.(tab) : onChange(tab.id))}
            className={`flex-1 whitespace-nowrap rounded-[10px] px-3 py-2 text-[14px] transition-colors ${
              active
                ? 'bg-white font-bold text-[#5945F1] shadow-sm dark:bg-[#170345] dark:text-white'
                : 'text-slate-700 hover:bg-white/60 dark:text-white/70'
            } ${tab.isLocked ? 'opacity-60' : ''}`}
          >
            {tab.isLocked ? `\u{1F512} ${tab.label}` : tab.label}
          </button>
        );
      })}
    </div>
  );
}

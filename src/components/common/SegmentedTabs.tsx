import React from 'react';
import { Lock } from 'lucide-react';

/**
 * A segmented control: the whole group sits in a grey track and the chosen
 * option lifts out of it as a white pill. Used where a panel needs to switch
 * between a handful of views without the weight of the folder tabs.
 */
export interface SegmentedTabItem<T extends string = string> {
  id: T;
  label: string;
  /** Marked with a lock. Still selectable: the panel behind shows why. */
  isLocked?: boolean;
}

export function SegmentedTabs<T extends string = string>({
  tabs,
  activeTab,
  onChange,
  className = '',
}: {
  tabs: SegmentedTabItem<T>[];
  activeTab: T;
  onChange: (id: T) => void;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      data-keep-button-icons
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
            onClick={() => onChange(tab.id)}
            className={`flex-1 whitespace-nowrap rounded-[10px] px-3 py-2 text-[14px] transition-colors ${
              active
                ? 'bg-white font-bold text-[#5945F1] shadow-sm dark:bg-[#170345] dark:text-white'
                : 'text-slate-700 hover:bg-white/60 dark:text-white/70'
            }`}
          >
            <span className="inline-flex items-center gap-1.5">
              {tab.isLocked && <Lock size={13} className={active ? 'text-[#5945F1]' : 'text-slate-400'} aria-hidden />}
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

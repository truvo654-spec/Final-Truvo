import React from 'react';

export interface TabSubItem<T extends string = string> {
  id: T;
  label: string;
  badge?: string | number;
  count?: number | string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface TabSubProps<T extends string = string> {
  tabs: readonly (TabSubItem<T> | string)[] | (TabSubItem<T> | string)[];
  activeTab: T | string;
  onChange: (tabId: T) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  id?: string;
}

/**
 * tab_sub / TabSub Component
 * Sub-navigation pill tab component matching the sleek pill bar design in `select account (1).png`.
 * Features:
 * - Rounded pill container (#F0F3F8)
 * - White active pill with #5945F1 brand purple text and subtle elevation
 * - Sleek inactive items with responsive hover state
 * - Supports string array (e.g. ['Bonus', 'Standard', 'Premium', 'Pro', 'Zero (ECN)'])
 *   or structured TabSubItem array
 */
export const TabSub = <T extends string = string>({
  tabs,
  activeTab,
  onChange,
  className = '',
  size = 'md',
  fullWidth = false,
  id,
}: TabSubProps<T>) => {
  // Normalize items
  const items: TabSubItem<T>[] = tabs.map((tab) => {
    if (typeof tab === 'string') {
      return { id: tab as T, label: tab };
    }
    return tab;
  });

  // Size variations
  const sizeClasses = {
    sm: {
      container: 'p-0.5 rounded-xl gap-0.5',
      button: 'px-3 py-1.5 text-xs rounded-lg',
    },
    md: {
      container: 'p-1 rounded-2xl gap-1',
      button: 'px-4 sm:px-5 py-2 text-sm rounded-xl',
    },
    lg: {
      container: 'p-1.5 rounded-2xl gap-1.5',
      button: 'px-6 py-2.5 text-base rounded-xl',
    },
  }[size];

  return (
    <div
      id={id}
      className={`inline-flex items-center bg-[#F0F3F8] dark:bg-[#1b0849] border border-slate-200/50 dark:border-[#381691]/50 ${
        sizeClasses.container
      } ${fullWidth ? 'w-full justify-between' : ''} max-w-full overflow-x-auto scrollbar-none shadow-2xs ${className}`}
      role="tablist"
    >
      {items.map((item) => {
        const isActive = activeTab.toLowerCase() === item.id.toLowerCase() || activeTab === item.label;

        return (
          <button
            key={item.id}
            id={`tab-sub-${item.id.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
            type="button"
            role="tab"
            aria-selected={isActive}
            disabled={item.disabled}
            onClick={() => !item.disabled && onChange(item.id)}
            className={`cursor-pointer transition-all duration-150 font-semibold whitespace-nowrap select-none flex items-center justify-center gap-1.5 ${
              sizeClasses.button
            } ${fullWidth ? 'flex-1' : ''} ${
              isActive
                ? 'bg-white dark:bg-[#120233] text-[#5945F1] dark:text-[#CAEB0E] shadow-2xs'
                : 'text-slate-800 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
            } ${item.disabled ? 'opacity-40 cursor-not-allowed' : 'active:scale-[0.98]'}`}
          >
            {item.icon && <span className="shrink-0">{item.icon}</span>}
            <span>{item.label}</span>
            {item.badge !== undefined && (
              <span
                className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full leading-normal ${
                  isActive
                    ? 'bg-[#5945F1]/10 text-[#5945F1] dark:bg-[#CAEB0E]/20 dark:text-[#CAEB0E]'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                {item.badge}
              </span>
            )}
            {item.count !== undefined && (
              <span className="text-xs opacity-75 font-normal">({item.count})</span>
            )}
          </button>
        );
      })}
    </div>
  );
};

// Also export with alias tab_sub as specifically requested by the user
export const tab_sub = TabSub;
export default TabSub;

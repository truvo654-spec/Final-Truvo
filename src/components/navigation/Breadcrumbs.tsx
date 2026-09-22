import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { getRouteMeta } from '../../router';

interface BreadcrumbsProps {
  activeTab: string;
  onNavigateToTab: (tab: string) => void;
  customLabel?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  activeTab,
  onNavigateToTab,
  customLabel,
}) => {
  const meta = getRouteMeta(activeTab);

  // If on top-level dashboard or landing, breadcrumbs can be subtle or hidden
  if (activeTab === 'dashboard' || activeTab === 'landing') {
    return null;
  }

  const items = [...meta.breadcrumbs];
  if (customLabel) {
    items[items.length - 1] = customLabel;
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-[#8A7AF6] py-2 px-1 overflow-x-auto no-scrollbar"
    >
      <button
        onClick={() => onNavigateToTab('dashboard')}
        className="flex items-center gap-1 hover:text-[#5945F1] dark:hover:text-white transition-colors cursor-pointer shrink-0 font-medium"
      >
        <Home className="w-3.5 h-3.5" />
        <span>Home</span>
      </button>

      {items.slice(1).map((crumb, index) => {
        const isLast = index === items.length - 2;
        return (
          <React.Fragment key={crumb}>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 shrink-0" />
            <span
              className={`shrink-0 ${
                isLast
                  ? 'font-semibold text-slate-900 dark:text-white'
                  : 'hover:text-[#5945F1] dark:hover:text-white cursor-pointer transition-colors'
              }`}
              onClick={() => {
                if (!isLast) {
                  if (crumb === 'Trade') onNavigateToTab('signals');
                  else if (crumb === 'Calculators') onNavigateToTab('leverage-calculator');
                  else if (crumb === 'Brokers') onNavigateToTab('brokers');
                  else if (crumb === 'Community') onNavigateToTab('community');
                  else if (crumb === 'Account') onNavigateToTab('profile');
                  else if (crumb === 'Company') onNavigateToTab('about');
                  else if (crumb === 'Cashback') onNavigateToTab('cashback-overview');
                  else if (crumb === 'Membership') onNavigateToTab('member-plan');
                }
              }}
            >
              {crumb}
            </span>
          </React.Fragment>
        );
      })}

      <div className="ml-auto hidden sm:flex items-center gap-1 text-[11px] text-slate-400 dark:text-[#6f60e9] font-mono bg-slate-100 dark:bg-[#1a085c] px-2 py-0.5 rounded-md border border-slate-200 dark:border-[#2f1092]">
        <span>Path:</span>
        <span className="font-semibold text-slate-700 dark:text-purple-200">{meta.path}</span>
      </div>
    </nav>
  );
};

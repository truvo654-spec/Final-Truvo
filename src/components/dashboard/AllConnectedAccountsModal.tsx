import React, { useState } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Star,
  Plus,
  Search,
} from 'lucide-react';

export interface ConnectedAccountModalItem {
  id: string;
  brokerId: string;
  brokerName: string;
  accountType: string;
  accountNumber: string;
  status: 'pending' | 'approved';
  durationText?: string;
  progressPercent?: number;
  isFavorite?: boolean;
}

export interface AllConnectedAccountsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab: (tab: string) => void;
  onNavigateToConnectBroker?: (broker?: any) => void;
  onOpenConnectModal?: (broker?: any) => void;
  onShowToast?: (message: string) => void;
}

const DEFAULT_ACCOUNTS: ConnectedAccountModalItem[] = [
  // Page 1 (matches exact 6 cards in the screenshot)
  {
    id: 'hfm-1',
    brokerId: 'hfm',
    brokerName: 'HFM',
    accountType: 'Premium',
    accountNumber: '1100045789',
    status: 'pending',
    durationText: 'Takes 2–3 days',
    progressPercent: 65,
    isFavorite: true,
  },
  {
    id: 'xm-1',
    brokerId: 'xm',
    brokerName: 'XM',
    accountType: 'Ultra Low',
    accountNumber: '1100098765',
    status: 'pending',
    durationText: 'Takes 2–3 days',
    progressPercent: 65,
    isFavorite: true,
  },
  {
    id: 'fxpro-1',
    brokerId: 'fxpro',
    brokerName: 'FxPro',
    accountType: 'Raw+',
    accountNumber: '1100034521',
    status: 'pending',
    durationText: 'Takes 2–3 days',
    progressPercent: 65,
    isFavorite: true,
  },
  {
    id: 'pepperstone-1',
    brokerId: 'pepperstone',
    brokerName: 'Pepperstone',
    accountType: 'Premium',
    accountNumber: '1100072348',
    status: 'pending',
    durationText: 'Takes 2–3 days',
    progressPercent: 65,
    isFavorite: false,
  },
  {
    id: 'vantage-1',
    brokerId: 'vantage',
    brokerName: 'Vantage',
    accountType: 'Premium',
    accountNumber: '1100089652',
    status: 'approved',
    isFavorite: true,
  },
  {
    id: 'vantage-2',
    brokerId: 'vantage-teal',
    brokerName: 'Vantage',
    accountType: 'Premium',
    accountNumber: '1100056739',
    status: 'approved',
    isFavorite: false,
  },
  // Page 2+ accounts
  {
    id: 'icmarkets-1',
    brokerId: 'icmarkets',
    brokerName: 'IC Markets',
    accountType: 'Raw Spread',
    accountNumber: '1100089234',
    status: 'approved',
  },
  {
    id: 'exness-1',
    brokerId: 'exness',
    brokerName: 'Exness',
    accountType: 'Standard',
    accountNumber: '1100065431',
    status: 'pending',
    durationText: 'Takes 2–3 days',
    progressPercent: 60,
  },
  {
    id: 'xm-2',
    brokerId: 'xm',
    brokerName: 'XM',
    accountType: 'Shares Account',
    accountNumber: '1100071239',
    status: 'approved',
  },
  {
    id: 'fxpro-2',
    brokerId: 'fxpro',
    brokerName: 'FxPro',
    accountType: 'cTrader',
    accountNumber: '1100049812',
    status: 'approved',
  },
  {
    id: 'pepperstone-2',
    brokerId: 'pepperstone',
    brokerName: 'Pepperstone',
    accountType: 'Razor',
    accountNumber: '1100023419',
    status: 'pending',
    durationText: 'Takes 2–3 days',
    progressPercent: 75,
  },
  {
    id: 'hfm-2',
    brokerId: 'hfm',
    brokerName: 'HFM',
    accountType: 'Pro Account',
    accountNumber: '1100099881',
    status: 'approved',
  },
];

export const AllConnectedAccountsModal: React.FC<AllConnectedAccountsModalProps> = ({
  isOpen,
  onClose,
  onNavigateToTab,
  onNavigateToConnectBroker,
  onOpenConnectModal,
  onShowToast,
}) => {
  const [accounts, setAccounts] = useState<ConnectedAccountModalItem[]>(DEFAULT_ACCOUNTS);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isFixMode, setIsFixMode] = useState<boolean>(false);

  if (!isOpen) return null;

  const pageSize = 6;
  const totalPages = Math.ceil(accounts.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const currentAccounts = accounts.slice(startIndex, startIndex + pageSize);

  const toggleFavorite = (id: string) => {
    setAccounts((prev) =>
      prev.map((acc) => (acc.id === id ? { ...acc, isFavorite: !acc.isFavorite } : acc))
    );
    onShowToast?.('Updated favorite accounts priority.');
  };

  const handleTradeNow = (account: ConnectedAccountModalItem) => {
    onShowToast?.(`Routing trade execution via ${account.brokerName} (${account.accountNumber})`);
    onClose();
    onNavigateToTab('signals');
  };

  const handleAccountClick = (account: ConnectedAccountModalItem) => {
    if (account.status === 'pending') {
      onShowToast?.(
        `${account.brokerName} #${account.accountNumber} is awaiting approval (takes 2–3 business days).`
      );
    } else {
      handleTradeNow(account);
    }
  };

  const handleConnectAnotherBroker = () => {
    onClose();
    if (onNavigateToConnectBroker) {
      onNavigateToConnectBroker();
    } else {
      onNavigateToTab('brokers');
    }
  };

  const handleAddMoreTradingAccount = () => {
    onClose();
    if (onOpenConnectModal) {
      onOpenConnectModal();
    } else {
      onNavigateToTab('active-trading-accounts');
    }
  };

  // Render authentic broker logo matching the screenshot
  const renderBrokerLogo = (brokerId: string) => {
    switch (brokerId) {
      case 'hfm':
        return (
          <div className="w-8 h-8 rounded-lg bg-black flex flex-col items-center justify-center text-white shrink-0 p-1 select-none shadow-2xs">
            <div className="flex items-center font-black text-[9px] leading-none tracking-tight">
              <span className="text-white">HF</span>
              <span className="text-[#E11928]">M</span>
            </div>
            <span className="text-[4px] text-slate-300 font-bold uppercase tracking-wider mt-0.5 leading-none">
              BY MARKETS
            </span>
          </div>
        );
      case 'xm':
        return (
          <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center p-1 shrink-0 relative overflow-hidden select-none shadow-2xs">
            <div
              className="absolute top-0 right-0 w-2.5 h-2.5 bg-[#E11928]"
              style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }}
            />
            <span className="font-black text-white text-[11px] tracking-tight">XM</span>
          </div>
        );
      case 'fxpro':
        return (
          <div className="w-8 h-8 rounded-lg bg-[#E11928] flex flex-col items-center justify-center text-white shrink-0 p-1 select-none shadow-2xs">
            <span className="font-black text-[10px] tracking-tight leading-none">FxPro</span>
            <span className="text-[4px] text-white/90 uppercase tracking-tighter leading-none mt-0.5 font-bold">
              Trade Like A Pro
            </span>
          </div>
        );
      case 'pepperstone':
        return (
          <div className="w-8 h-8 rounded-lg bg-[#0052FF] flex flex-col items-center justify-center text-white shrink-0 p-1 select-none shadow-2xs">
            <span className="font-black text-[12px] leading-none">P</span>
            <span className="text-[4px] text-white/95 lowercase tracking-tighter leading-none mt-0.5 font-bold">
              pepperstone
            </span>
          </div>
        );
      case 'vantage':
        return (
          <div className="w-8 h-8 rounded-lg bg-[#0B1528] flex items-center justify-center text-white shrink-0 p-1 select-none shadow-2xs">
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none" strokeWidth="3">
              <path d="M5 14l4 6 4-13" stroke="#ffffff" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 14l4 6 4-13" stroke="#00D084" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        );
      case 'vantage-teal':
        return (
          <div className="w-8 h-8 rounded-lg bg-[#07333B] flex items-center justify-center text-white shrink-0 p-1 select-none shadow-2xs">
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none" strokeWidth="3">
              <path d="M5 14l4 6 4-13" stroke="#ffffff" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 14l4 6 4-13" stroke="#F97316" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        );
      case 'icmarkets':
        return (
          <div className="w-8 h-8 rounded-lg bg-black flex flex-col items-center justify-center shrink-0 p-1 select-none shadow-2xs">
            <div className="flex items-end gap-0.5 h-2.5">
              <span className="w-0.5 h-1.5 bg-[#00D084] rounded-xs" />
              <span className="w-0.5 h-2.5 bg-[#00D084] rounded-xs" />
            </div>
            <span className="text-[5.5px] text-white font-bold leading-none mt-0.5">IC</span>
          </div>
        );
      case 'exness':
      default:
        return (
          <div className="w-8 h-8 rounded-lg bg-[#FFCC00] flex items-center justify-center text-black shrink-0 p-1 select-none shadow-2xs">
            <span className="font-black text-xs">ex</span>
          </div>
        );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl border border-slate-200/90 shadow-2xl p-6 sm:p-7 select-none animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Top Header ── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-[#0b1c30] tracking-tight">
              All Your Connected Accounts
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1 font-normal">
              <span>Want your favorites first?</span>
              <button
                type="button"
                onClick={() => setIsFixMode(!isFixMode)}
                className="text-[#5945F1] underline font-semibold hover:text-[#432bd4] cursor-pointer transition-colors"
              >
                {isFixMode ? 'Done.' : 'Fix it.'}
              </button>
              {isFixMode && (
                <span className="text-[11px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md font-medium ml-1">
                  Click star to pin favorites to top
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer shrink-0"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 stroke-[2.2]" />
          </button>
        </div>

        {/* ── 3-Column Grid of Accounts (Matches exact 6 cards) ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 mt-5">
          {currentAccounts.map((account) => (
            <div
              key={account.id}
              onClick={() => handleAccountClick(account)}
              className="bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between cursor-pointer group hover:border-indigo-200 relative min-h-[145px]"
            >
              {/* Star / Favorite toggle in Fix Mode */}
              {isFixMode && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(account.id);
                  }}
                  className="absolute top-2 right-2 p-1 rounded-full bg-white/90 hover:bg-indigo-50 text-slate-400 hover:text-amber-500 transition-colors shadow-2xs"
                  title="Pin as favorite"
                >
                  <Star
                    className={`w-3.5 h-3.5 ${
                      account.isFavorite ? 'fill-amber-400 text-amber-500' : 'text-slate-300'
                    }`}
                  />
                </button>
              )}

              {/* Card Top: Logo + Name & Number */}
              <div>
                <div className="flex items-start gap-2.5">
                  {renderBrokerLogo(account.brokerId)}
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-sm text-[#0b1c30] truncate leading-tight group-hover:text-[#5945F1] transition-colors">
                      {account.accountType}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5 truncate">
                      {account.accountNumber}
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="mt-2.5">
                  {account.status === 'pending' ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FFFBEB] text-[#D97706] text-[10.5px] font-semibold border border-[#FDE68A]/80">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
                      <span>Pending Approval</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#ECFDF5] text-[#059669] text-[10.5px] font-semibold border border-[#A7F3D0]/80">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                      <span>Approved</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Card Bottom: Progress / Duration or Trade Now button */}
              <div className="mt-3 pt-1">
                {account.status === 'pending' ? (
                  <div>
                    {/* Gradient Progress Bar */}
                    <div className="w-full bg-slate-100 rounded-full h-1 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#5945F1] via-[#8B5CF6] to-[#FD02B0] rounded-full transition-all duration-500"
                        style={{ width: `${account.progressPercent || 65}%` }}
                      />
                    </div>
                    <div className="text-[11px] text-slate-400 text-center mt-1.5 font-normal">
                      {account.durationText || 'Takes 2–3 days'}
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTradeNow(account);
                    }}
                    className="w-full py-1.5 px-3 bg-[#5945F1] hover:bg-[#4734dc] text-white text-xs font-semibold rounded-xl shadow-2xs transition-all active:scale-95 cursor-pointer text-center"
                  >
                    Trade Now
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* ── Pagination Bar: |< < 1 2 ... 5 > >| ── */}
        <div className="flex items-center justify-center gap-1.5 mt-5">
          {/* First Page button |< */}
          <button
            type="button"
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="w-8 h-8 rounded-lg border border-slate-200/90 hover:border-slate-300 disabled:opacity-40 disabled:hover:border-slate-200 text-slate-500 flex items-center justify-center text-xs transition-colors cursor-pointer disabled:cursor-not-allowed bg-white"
            aria-label="First page"
          >
            <ChevronsLeft className="w-3.5 h-3.5" />
          </button>

          {/* Prev Page button < */}
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="w-8 h-8 rounded-lg border border-slate-200/90 hover:border-slate-300 disabled:opacity-40 disabled:hover:border-slate-200 text-slate-500 flex items-center justify-center text-xs transition-colors cursor-pointer disabled:cursor-not-allowed bg-white"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          {/* Page 1 */}
          <button
            type="button"
            onClick={() => setCurrentPage(1)}
            className={`w-8 h-8 rounded-lg border text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer ${
              currentPage === 1
                ? 'border-[#0b1c30] text-[#0b1c30] bg-white shadow-2xs font-bold'
                : 'border-slate-200/90 text-slate-600 hover:bg-slate-50'
            }`}
          >
            1
          </button>

          {/* Page 2 */}
          <button
            type="button"
            onClick={() => setCurrentPage(2)}
            className={`w-8 h-8 rounded-lg border text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer ${
              currentPage === 2
                ? 'border-[#0b1c30] text-[#0b1c30] bg-white shadow-2xs font-bold'
                : 'border-slate-200/90 text-slate-600 hover:bg-slate-50'
            }`}
          >
            2
          </button>

          {/* Ellipsis */}
          <span className="w-8 h-8 rounded-lg border border-slate-200/90 text-slate-400 flex items-center justify-center text-xs select-none bg-white">
            ...
          </span>

          {/* Page 5 (last page placeholder matching screenshot) */}
          <button
            type="button"
            onClick={() => setCurrentPage(5)}
            className={`w-8 h-8 rounded-lg border text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer ${
              currentPage === 5
                ? 'border-[#0b1c30] text-[#0b1c30] bg-white shadow-2xs font-bold'
                : 'border-slate-200/90 text-slate-600 hover:bg-slate-50'
            }`}
          >
            5
          </button>

          {/* Next Page button > */}
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="w-8 h-8 rounded-lg border border-slate-200/90 hover:border-slate-300 disabled:opacity-40 disabled:hover:border-slate-200 text-slate-500 flex items-center justify-center text-xs transition-colors cursor-pointer disabled:cursor-not-allowed bg-white"
            aria-label="Next page"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          {/* Last Page button >| */}
          <button
            type="button"
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="w-8 h-8 rounded-lg border border-slate-200/90 hover:border-slate-300 disabled:opacity-40 disabled:hover:border-slate-200 text-slate-500 flex items-center justify-center text-xs transition-colors cursor-pointer disabled:cursor-not-allowed bg-white"
            aria-label="Last page"
          >
            <ChevronsRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* ── Divider & Bottom Section ── */}
        <div className="border-t border-slate-200/80 my-4" />

        <p className="text-xs text-slate-500 font-medium text-center mb-3">
          More Accounts. More Action. Make Your Move
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleConnectAnotherBroker}
            className="w-full py-2.5 px-4 rounded-xl border border-[#5945F1]/50 hover:border-[#5945F1] text-[#5945F1] hover:text-[#432bd4] text-xs sm:text-sm font-semibold bg-white hover:bg-indigo-50/50 shadow-2xs transition-colors cursor-pointer text-center"
          >
            Connect Another Broker
          </button>

          <button
            type="button"
            onClick={handleAddMoreTradingAccount}
            className="w-full py-2.5 px-4 rounded-xl border border-[#5945F1]/50 hover:border-[#5945F1] text-[#5945F1] hover:text-[#432bd4] text-xs sm:text-sm font-semibold bg-white hover:bg-indigo-50/50 shadow-2xs transition-colors cursor-pointer text-center"
          >
            Add more trading account
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Plus, Search } from 'lucide-react';
import { AllConnectedAccountsModal } from './AllConnectedAccountsModal';

export interface ConnectedAccountItem {
  id: string;
  brokerId: string;
  brokerName: string;
  accountType: string;
  accountNumber: string;
  status: 'pending' | 'approved';
  durationText?: string;
  progressPercent?: number;
}

export interface ConnectedAccountsCarouselProps {
  onNavigateToTab: (tab: string) => void;
  onNavigateToConnectBroker?: (broker?: any) => void;
  onOpenConnectModal?: (broker?: any) => void;
  onShowToast?: (message: string) => void;
  className?: string;
}

const INITIAL_ACCOUNTS: ConnectedAccountItem[] = [
  {
    id: 'xm-1',
    brokerId: 'xm',
    brokerName: 'XM',
    accountType: 'Ultra Low',
    accountNumber: '1100098765',
    status: 'pending',
    durationText: 'Takes 2–3 days',
    progressPercent: 65,
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
  },
  {
    id: 'vantage-1',
    brokerId: 'vantage',
    brokerName: 'Vantage',
    accountType: 'Premium',
    accountNumber: '1100089652',
    status: 'approved',
  },
  {
    id: 'icmarkets-1',
    brokerId: 'icmarkets',
    brokerName: 'IC Markets',
    accountType: 'Raw Spread',
    accountNumber: '1100089234',
    status: 'approved',
  },
  {
    id: 'hfm-1',
    brokerId: 'hfm',
    brokerName: 'HFM',
    accountType: 'Premium',
    accountNumber: '1100045789',
    status: 'pending',
    durationText: 'Takes 2–3 days',
    progressPercent: 65,
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
];

export const ConnectedAccountsCarousel: React.FC<ConnectedAccountsCarouselProps> = ({
  onNavigateToTab,
  onNavigateToConnectBroker,
  onOpenConnectModal,
  onShowToast,
  className = '',
}) => {
  const [accounts] = useState<ConnectedAccountItem[]>(INITIAL_ACCOUNTS);
  const [isAllConnectedModalOpen, setIsAllConnectedModalOpen] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [activeDotIndex, setActiveDotIndex] = useState(1); // Default to middle dot like screenshot
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Total dot indicators (3 dots matching screenshot)
  const totalDots = 3;

  const updateScrollState = useCallback(() => {
    if (!carouselRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);

    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll > 0) {
      const ratio = scrollLeft / maxScroll;
      const dotIndex = Math.min(totalDots - 1, Math.max(0, Math.round(ratio * (totalDots - 1))));
      setActiveDotIndex(dotIndex);
    }
  }, [totalDots]);

  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateScrollState, { passive: true });
    updateScrollState();
    return () => el.removeEventListener('scroll', updateScrollState);
  }, [updateScrollState]);

  const scrollToIndex = (index: number) => {
    if (!carouselRef.current) return;
    const { scrollWidth, clientWidth } = carouselRef.current;
    const maxScroll = scrollWidth - clientWidth;
    const targetScroll = (index / (totalDots - 1)) * maxScroll;
    carouselRef.current.scrollTo({ left: targetScroll, behavior: 'smooth' });
    setActiveDotIndex(index);
  };

  const handlePrev = () => {
    if (!carouselRef.current) return;
    const cardWidth = 205;
    carouselRef.current.scrollBy({ left: -cardWidth, behavior: 'smooth' });
  };

  const handleNext = () => {
    if (!carouselRef.current) return;
    const cardWidth = 205;
    carouselRef.current.scrollBy({ left: cardWidth, behavior: 'smooth' });
  };

  const handleAddMoreAccounts = () => {
    onNavigateToTab('active-trading-accounts');
  };

  const handleExploreBrokers = () => {
    onNavigateToTab('brokers');
  };

  const handleTradeNow = (account: ConnectedAccountItem) => {
    onShowToast?.(`Routing trade execution through ${account.brokerName} (${account.accountNumber})`);
    onNavigateToTab('signals');
  };

  const handleAccountCardClick = (account: ConnectedAccountItem) => {
    if (account.status === 'pending') {
      onShowToast?.(`${account.brokerName} account #${account.accountNumber} is pending broker approval (takes 2-3 business days).`);
    } else {
      onNavigateToTab('signals');
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
            <span className="text-[4.5px] text-slate-300 font-bold uppercase tracking-wider mt-0.5 leading-none">
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
            <span className="text-[4.5px] text-white/95 lowercase tracking-tighter leading-none mt-0.5 font-bold">
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
      className={`rounded-3xl bg-white border border-purple-200/90 p-5 shadow-2xs flex flex-col justify-between relative select-none ${className}`}
    >
      {/* ── Top Header Section (Matches Design: Connected Accounts top-right, Add More Accounts + Explore Brokers beneath) ── */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div>
            <h3 className="font-display font-extrabold text-xl text-[#0b1c30] tracking-tight">
              Ready to Trade
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal">
              Account connected and ready for trading.
            </p>
          </div>

          {/* Top Right Action Controls matching design image */}
          <div className="flex flex-col items-start sm:items-end gap-1.5 shrink-0">
            {/* Row 1: Connected Accounts Pill Button */}
            <button
              type="button"
              onClick={() => setIsAllConnectedModalOpen(true)}
              className="px-4 py-1 rounded-full border border-indigo-200/90 hover:border-indigo-300 text-[#5945F1] hover:text-[#432bd4] text-xs sm:text-sm font-semibold bg-white hover:bg-indigo-50/40 shadow-2xs transition-colors cursor-pointer"
            >
              Connected Accounts
            </button>

            {/* Row 2: + Add More Accounts , 🔍 Explore Brokers */}
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#5945F1]">
              <button
                type="button"
                onClick={handleAddMoreAccounts}
                className="text-[#5945F1] hover:text-[#432bd4] hover:underline flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Add More Accounts</span>
              </button>
              <span className="text-[#5945F1] select-none">,</span>
              <button
                type="button"
                onClick={handleExploreBrokers}
                className="text-[#5945F1] hover:text-[#432bd4] hover:underline flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Search className="w-3.5 h-3.5 stroke-[2.2]" />
                <span>Explore Brokers</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── Carousel Slider Cards Container (Horizontal Scrollable) ── */}
        <div className="relative mt-4">
          <div
            ref={carouselRef}
            className="flex items-stretch gap-3 overflow-x-auto scroll-smooth scrollbar-none snap-x snap-mandatory py-1 px-0.5"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {accounts.map((account) => (
              <div
                key={account.id}
                onClick={() => handleAccountCardClick(account)}
                className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs hover:shadow-xs transition-all w-[180px] sm:w-[195px] shrink-0 snap-start flex flex-col justify-between cursor-pointer group hover:border-indigo-200"
              >
                {/* Card Top: Logo + Name & Account Number */}
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

                {/* Card Bottom: Progress bar / Takes 2-3 days OR Trade Now button */}
                <div className="mt-3 pt-1">
                  {account.status === 'pending' ? (
                    <div>
                      {/* Purple to Magenta Gradient Progress Bar matching screenshot */}
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
                      className="w-full py-2 px-3 bg-[#5945F1] hover:bg-[#4734dc] text-white text-xs font-semibold rounded-xl shadow-2xs transition-all active:scale-95 cursor-pointer text-center"
                    >
                      Trade Now
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom Carousel Pagination Controls: < • • • > ── */}
      <div className="flex items-center justify-center gap-2 pt-3">
        <button
          type="button"
          onClick={handlePrev}
          className="p-1 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer rounded-full hover:bg-slate-100"
          aria-label="Previous broker account"
        >
          <ChevronLeft className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>

        <div className="flex items-center gap-1.5">
          {Array.from({ length: totalDots }).map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => scrollToIndex(idx)}
              className={`rounded-full transition-all cursor-pointer ${
                activeDotIndex === idx
                  ? 'w-2.5 h-2.5 bg-[#5945F1]'
                  : 'w-2 h-2 bg-[#C7D2FE] hover:bg-[#A5B4FC]'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={handleNext}
          className="p-1 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer rounded-full hover:bg-slate-100"
          aria-label="Next broker account"
        >
          <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>
      </div>

      {/* ── All Connected Accounts Modal (Matches user design screenshot) ── */}
      <AllConnectedAccountsModal
        isOpen={isAllConnectedModalOpen}
        onClose={() => setIsAllConnectedModalOpen(false)}
        onNavigateToTab={onNavigateToTab}
        onNavigateToConnectBroker={onNavigateToConnectBroker}
        onOpenConnectModal={onOpenConnectModal}
        onShowToast={onShowToast}
      />
    </div>
  );
};

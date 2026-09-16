import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Plus, Search } from 'lucide-react';

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
    status: 'approved',
  },
  {
    id: 'vantage-1',
    brokerId: 'vantage',
    brokerName: 'Vantage',
    accountType: 'RAW ECN',
    accountNumber: '1100078912',
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
    const cardWidth = 200;
    carouselRef.current.scrollBy({ left: -cardWidth, behavior: 'smooth' });
  };

  const handleNext = () => {
    if (!carouselRef.current) return;
    const cardWidth = 200;
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
      case 'vantage':
        return (
          <div className="w-8 h-8 rounded-lg bg-[#002D72] flex items-center justify-center text-white shrink-0 p-1 select-none shadow-2xs">
            <span className="font-black text-xs tracking-wider">V</span>
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
      className={`rounded-3xl bg-white border-2 border-[#FE01B1] p-5 shadow-xs flex flex-col justify-between relative select-none ${className}`}
    >
      {/* ── Top Header Section ── */}
      <div>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display font-extrabold text-xl text-[#FD02B0] tracking-tight">
              Ready to Trade
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1 flex-wrap font-normal">
              <span>Account connected and ready for trading.</span>
              <button
                type="button"
                onClick={handleAddMoreAccounts}
                className="text-[#5945F1] hover:text-[#4734dc] font-semibold hover:underline flex items-center gap-0.5 cursor-pointer ml-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Add More Accounts</span>
              </button>
              <span className="text-slate-400">,</span>
              <button
                type="button"
                onClick={handleExploreBrokers}
                className="text-[#5945F1] hover:text-[#4734dc] font-semibold hover:underline flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Search className="w-3 h-3 text-[#5945F1]" />
                <span>Explore Brokers</span>
              </button>
            </div>
          </div>

          {/* Top Right Pill Badge */}
          <span className="px-3 py-1 rounded-full border border-indigo-200/90 text-[#5945F1] text-xs font-semibold bg-white shrink-0 shadow-2xs">
            Connected Accounts
          </span>
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
                className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs hover:shadow-xs transition-all w-[180px] sm:w-[190px] shrink-0 snap-start flex flex-col justify-between cursor-pointer group hover:border-indigo-200"
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
                      {/* Purple Progress Bar */}
                      <div className="w-full bg-slate-100 rounded-full h-1 overflow-hidden">
                        <div
                          className="h-full bg-[#5945F1] rounded-full transition-all duration-500"
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
                      className="w-full py-1.5 px-3 bg-[#5945F1] hover:bg-[#4734dc] text-white text-xs font-semibold rounded-lg shadow-2xs transition-all active:scale-95 cursor-pointer text-center"
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
          className="p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer rounded-full hover:bg-slate-100"
          aria-label="Previous broker account"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-center gap-1.5">
          {Array.from({ length: totalDots }).map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => scrollToIndex(idx)}
              className={`rounded-full transition-all cursor-pointer ${
                activeDotIndex === idx
                  ? 'w-2 h-2 bg-[#5945F1]'
                  : 'w-1.5 h-1.5 bg-[#C7D2FE] hover:bg-[#A5B4FC]'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={handleNext}
          className="p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer rounded-full hover:bg-slate-100"
          aria-label="Next broker account"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

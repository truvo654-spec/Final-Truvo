import React from 'react';
import { Star, ThumbsUp, ArrowRight } from 'lucide-react';
import { Broker } from '../../types';

export interface BrokersMatchingPreferencesProps {
  activeTool?: string;
  currencyPair?: string;
  brokers: Broker[];
  onOpenConnectModal: (broker: Broker) => void;
  onOpenBrokerComparison: () => void;
  onSelectBrokerDetail?: (broker: Broker) => void;
}

export const BrokersMatchingPreferences: React.FC<BrokersMatchingPreferencesProps> = ({
  activeTool = 'leverage',
  currencyPair = 'EUR/USD',
  brokers,
  onOpenConnectModal,
  onOpenBrokerComparison,
  onSelectBrokerDetail,
}) => {
  // Matched brokers data tailored to replicate the provided designs with 100% precision
  const matchedBrokers = [
    {
      id: 'hfm',
      name: 'HFM',
      accountType: activeTool === 'stop-out' || activeTool === 'margin' ? 'Micro | 1:888' : 'ECN | Raw spread',
      badge: {
        type: 'star',
        label: 'Best match',
      },
      verified: true,
      metrics: {
        maxLeverage: '500:1',
        marginReq: activeTool === 'stop-out' || activeTool === 'margin' ? '0.11%' : '0.2%',
        minDeposit: activeTool === 'stop-out' || activeTool === 'margin' ? '$5' : '$200',
        stopOutLevel: '20%',
        marginNeeded: '~$11.25',
      },
      bottomPill: activeTool === 'stop-out' || activeTool === 'margin' 
        ? 'Margin needed ~$11.25' 
        : activeTool === 'spread' 
        ? 'Saves $3.00/lot'
        : 'Min position size 0.01 lots',
      renderLogo: () => (
        <div className="w-12 h-12 rounded-xl bg-black text-white flex flex-col items-center justify-center shrink-0 border border-slate-800 shadow-xs">
          <span className="text-[12px] font-black tracking-tight leading-none text-white">
            HF<span className="text-[#E31825]">M</span>
          </span>
          <span className="text-[6.5px] font-mono tracking-widest text-slate-300 mt-0.5">HF MARKETS</span>
        </div>
      ),
    },
    {
      id: 'exness',
      name: 'Exness',
      accountType: activeTool === 'stop-out' || activeTool === 'margin' ? 'Micro | 1:888' : 'ECN | Raw spread',
      badge: {
        type: 'thumb',
        label: 'Low margin',
      },
      verified: true,
      metrics: {
        maxLeverage: '200:1',
        marginReq: activeTool === 'stop-out' || activeTool === 'margin' ? '0.11%' : '0.5%',
        minDeposit: activeTool === 'stop-out' || activeTool === 'margin' ? '$5' : '$200',
        stopOutLevel: '20%',
        marginNeeded: '~$11.25',
      },
      bottomPill: activeTool === 'stop-out' || activeTool === 'margin' 
        ? 'Margin needed ~$11.25' 
        : activeTool === 'spread' 
        ? 'Saves $2.80/lot'
        : 'Min position size 0.01 lots',
      renderLogo: () => (
        <div className="w-12 h-12 rounded-xl bg-[#FFDE00] text-slate-950 flex items-center justify-center shrink-0 font-black text-base tracking-tighter shadow-xs">
          ex
        </div>
      ),
    },
    {
      id: 'fxpro',
      name: 'FxPro',
      accountType: activeTool === 'stop-out' || activeTool === 'margin' ? 'Micro | 1:888' : 'ECN | Raw spread',
      badge: {
        type: 'thumb',
        label: 'Low margin',
      },
      verified: activeTool === 'margin' ? false : true,
      metrics: {
        maxLeverage: activeTool === 'margin' ? '1:888' : '100:1',
        marginReq: activeTool === 'stop-out' || activeTool === 'margin' ? '0.11%' : '1%',
        minDeposit: activeTool === 'stop-out' || activeTool === 'margin' ? '$5' : '$200',
        stopOutLevel: '20%',
        marginNeeded: activeTool === 'stop-out' || activeTool === 'margin' ? '~$11.25' : '~$15.00',
      },
      bottomPill: activeTool === 'stop-out' || activeTool === 'margin' 
        ? 'Margin needed ~$11.25' 
        : activeTool === 'spread' 
        ? 'Saves $2.50/lot' 
        : 'Min position size 0.01 lots',
      renderLogo: () => (
        <div className="w-12 h-12 rounded-xl bg-[#E31825] text-white flex flex-col items-center justify-center shrink-0 shadow-xs">
          <span className="text-[12px] font-black tracking-tight leading-none text-white">FxPro</span>
          <span className="text-[6.5px] text-white/90 mt-0.5 font-medium leading-tight">Trade Like a Pro</span>
        </div>
      ),
    },
  ];

  const handleBrokerDetailClick = (idOrName: string) => {
    const query = idOrName.toLowerCase();
    const found =
      brokers.find((b) => b.id.toLowerCase() === query) ||
      brokers.find((b) => b.name.toLowerCase() === query) ||
      brokers.find((b) => b.name.toLowerCase().includes(query)) ||
      brokers[0];
    if (onSelectBrokerDetail) {
      onSelectBrokerDetail(found);
    } else if (onOpenConnectModal) {
      onOpenConnectModal(found);
    }
  };

  const isDetailedMarginView = activeTool === 'stop-out' || activeTool === 'margin';

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h3 className="text-xl font-bold tracking-tight">
          <span className="text-[#5945F1] dark:text-[#ABA1F8]">Brokers</span>{' '}
          <span className="text-slate-900 dark:text-white">Matching Your</span>{' '}
          <span className="text-[#5945F1] dark:text-[#ABA1F8]">Preferences</span>
          <span className="text-[#FD02B0]">.</span>
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-[#CCC6FB] mt-1 leading-relaxed">
          Different brokers offer different trading conditions. Compare your options and find the right fit.
        </p>
      </div>

      {/* Cards List */}
      <div className="space-y-3.5">
        {matchedBrokers.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl border border-indigo-100/90 dark:border-[#3410D5] bg-white dark:bg-[#1A044D] p-4 sm:p-5 shadow-xs hover:border-indigo-200 dark:hover:border-[#5945F1] transition-all space-y-3.5"
          >
            {/* Top Badge */}
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#EEF0FE] dark:bg-[#3410D5]/50 text-[#5945F1] dark:text-[#ABA1F8]">
                {item.badge.type === 'star' ? (
                  <Star className="w-3.5 h-3.5 fill-[#5945F1] dark:fill-[#ABA1F8] text-[#5945F1] dark:text-[#ABA1F8]" />
                ) : (
                  <ThumbsUp className="w-3.5 h-3.5 text-[#5945F1] dark:text-[#ABA1F8]" />
                )}
                {item.badge.label}
              </span>
            </div>

            {/* Middle Content */}
            <div className="flex items-start justify-between gap-3">
              {/* Left: Logo & Info (Clickable to view details) */}
              <div
                onClick={() => handleBrokerDetailClick(item.id || item.name)}
                className="flex items-center gap-3 cursor-pointer group"
                title={`View ${item.name} Details`}
              >
                {item.renderLogo()}
                <div>
                  <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white leading-tight group-hover:text-[#5945F1] dark:group-hover:text-[#ABA1F8] transition-colors">
                    {item.name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-[#8A7AF6] mt-0.5 font-medium">
                    {item.accountType}
                  </p>
                  {item.verified && (
                    <div className="mt-1.5">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#bef226] text-slate-950 text-[10px] font-bold inline-flex items-center gap-1 shadow-2xs">
                        ✔ Verified
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Metrics */}
              {activeTool === 'rebate' ? (
                /* Rebate Metrics layout (Matching D04 - Rebate Calculator.png) */
                <div className="w-44 text-xs space-y-1.5 shrink-0 text-right">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 dark:text-[#8A7AF6]">Rebate / lot</span>
                    <span className="text-emerald-500 dark:text-emerald-400 font-bold">$2.50</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 dark:text-[#8A7AF6]">Paid</span>
                    <span className="text-slate-900 dark:text-white font-medium">Daily</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 dark:text-[#8A7AF6]">Pairs eligible</span>
                    <span className="text-[#5945F1] dark:text-[#ABA1F8] font-bold">All majors</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 dark:text-[#8A7AF6]">Est. Earn</span>
                    <span className="px-2 py-0.5 rounded-md bg-[#EEF2FF] dark:bg-[#3410D5]/50 text-[#5945F1] dark:text-[#ABA1F8] font-bold text-[11px]">
                      ~$250/mo
                    </span>
                  </div>
                </div>
              ) : isDetailedMarginView ? (
                /* Detail divider layout (Broker Card Suggestion) */
                <div className="w-44 text-xs space-y-1 shrink-0">
                  <div className="flex justify-between items-center pb-1 border-b border-indigo-100/60 dark:border-[#3410D5]/40">
                    <span className="text-slate-500 dark:text-[#8A7AF6]">Margin req.</span>
                    <span className="text-emerald-500 dark:text-emerald-400 font-bold">{item.metrics.marginReq}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-indigo-100/60 dark:border-[#3410D5]/40">
                    <span className="text-slate-500 dark:text-[#8A7AF6]">Min. deposit</span>
                    <span className="text-slate-900 dark:text-white font-bold">{item.metrics.minDeposit}</span>
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-slate-500 dark:text-[#8A7AF6]">Stop out level</span>
                    <span className="text-[#5945F1] dark:text-[#ABA1F8] font-bold">{item.metrics.stopOutLevel}</span>
                  </div>
                </div>
              ) : (
                /* Clean 3-tier metrics layout (Image 1) */
                <div className="text-right space-y-1 text-xs shrink-0">
                  <div className="text-slate-500 dark:text-[#8A7AF6]">
                    Max leverage: <span className="text-[#5945F1] dark:text-[#ABA1F8] font-bold ml-1">{item.metrics.maxLeverage}</span>
                  </div>
                  <div className="text-slate-500 dark:text-[#8A7AF6]">
                    Margin req: <span className="text-emerald-500 dark:text-emerald-400 font-bold ml-1">{item.metrics.marginReq}</span>
                  </div>
                  <div className="text-slate-500 dark:text-[#8A7AF6]">
                    Min. deposit: <span className="text-slate-900 dark:text-white font-bold ml-1">{item.metrics.minDeposit}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Row */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-100/80 dark:border-[#230674]/60">
              {activeTool === 'rebate' ? (
                <div className="w-full flex justify-center">
                  <button
                    type="button"
                    onClick={() => handleBrokerDetailClick(item.id || item.name)}
                    className="w-full py-1.5 rounded-xl border border-indigo-200/90 dark:border-[#3410D5] text-[#5945F1] dark:text-[#ABA1F8] hover:bg-indigo-50 dark:hover:bg-[#230674] text-xs font-semibold cursor-pointer transition-colors text-center"
                  >
                    View Details
                  </button>
                </div>
              ) : (
                <>
                  <span className="px-3 py-1 rounded-full bg-[#EEF2FF] dark:bg-[#3410D5]/40 text-[#5945F1] dark:text-[#ABA1F8] text-xs font-medium inline-block">
                    {item.bottomPill}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleBrokerDetailClick(item.id || item.name)}
                    className={
                      isDetailedMarginView
                        ? "px-3 py-1 rounded-lg border border-indigo-200 dark:border-[#3410D5] text-[#5945F1] dark:text-[#ABA1F8] hover:bg-indigo-50 dark:hover:bg-[#230674] text-xs font-semibold cursor-pointer transition-colors"
                        : "text-[#5945F1] dark:text-[#ABA1F8] hover:underline font-semibold text-xs sm:text-sm cursor-pointer transition-colors"
                    }
                  >
                    View Details
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Compare Matched Brokers Button */}
      <button
        type="button"
        onClick={onOpenBrokerComparison}
        className="w-full py-2.5 px-4 rounded-xl bg-[#5945F1] hover:bg-[#4736d4] text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
      >
        <span>Compare Matched Brokers</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};

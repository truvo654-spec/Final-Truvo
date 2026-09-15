import React, { useState } from 'react';
import { InstrumentIcon } from './InstrumentIcon';
import { ArrowRight, X } from 'lucide-react';

interface CryptoRecapItem {
  name: string;
  symbol: string;
  change: string;
  iconType: string;
  headline: string;
  body: string;
  tags: string[];
}

export const TodaysCryptoWidget: React.FC = () => {
  const [selectedRecap, setSelectedRecap] = useState<CryptoRecapItem | null>(null);

  const items: CryptoRecapItem[] = [
    {
      name: 'Bitcoin',
      symbol: 'BTC/USD',
      change: '+0.45%',
      iconType: 'btc',
      headline: 'Sweating in a tailored suit, waiting on a text from Daddy Fed.',
      body: 'Bitcoin is currently consolidating in the mid-$70K range. The primary driver today is macroeconomic caution; traders are bracing for the upcoming U.S. Federal Reserve interest rate decision. Mixed inflation data and some recent spot ETF outflows have kept retail sentiment relatively muted, though institutional accumulation continues to provide a strong floor.',
      tags: ['#bitcoin', '#recap', '#fed'],
    },
    {
      name: 'Binance',
      symbol: 'BNB/USD',
      change: '+0.45%',
      iconType: 'bnb',
      headline: 'A dependable corporate minivan idling in macroeconomic rush hour.',
      body: 'BNB is trading sideways, mirroring the broader holding pattern across major altcoins. While Binance Smart Chain ecosystem updates and launchpool activities consistently provide underlying utility, the coin is currently suppressed by the same broader macroeconomic uncertainties weighing on Bitcoin.',
      tags: ['#bnb', '#sideways', '#recap'],
    },
    {
      name: 'Dogecoin',
      symbol: 'DOGE/USD',
      change: '+0.45%',
      iconType: 'doge',
      headline: 'No thoughts, head empty, begging the internet for a meme-bone.',
      body: "Dogecoin is facing localized pressure. Sentiment took a bearish hit recently following reports that Bitwise closed its Spot Dogecoin ETF due to weak investor demand and low liquidity. Additionally, DOGE's inflationary supply mechanics continue to weigh heavily on its long-term valuation prospects.",
      tags: ['#dogecoin', '#meme', '#etf'],
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
      {/* Title matching Instrumental Analysis (1).png */}
      <h3 className="text-lg font-bold font-display flex items-center gap-1.5">
        <span className="text-[#0b1c30]">Today’s</span>
        <span className="text-[#5945F1]">Crypto</span>
      </h3>

      {/* 3 Detailed Editorial Cards */}
      <div className="space-y-3.5">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl border border-slate-200/80 bg-white hover:border-indigo-200 hover:shadow-xs transition-all space-y-2.5"
          >
            {/* Header: Icon + Name + Symbol + Green Change Badge */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <InstrumentIcon iconType={item.iconType} name={item.name} className="w-6 h-6" />
                <span className="font-bold text-sm text-slate-900">{item.name}</span>
                <span className="text-xs text-slate-400 font-medium">{item.symbol}</span>
              </div>
              <span className="text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                {item.change}
              </span>
            </div>

            {/* Editorial Headline */}
            <h4 className="font-bold text-xs text-slate-800 leading-snug">
              {item.headline}
            </h4>

            {/* Paragraph body */}
            <p className="text-[11px] text-slate-500 leading-relaxed">
              {item.body}
            </p>

            {/* Hashtags */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {item.tags.map((tag, tIdx) => (
                <span
                  key={tIdx}
                  className="px-2 py-0.5 rounded-md text-[10px] font-semibold text-slate-600 bg-slate-100"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* View Full Recap Button in lime green #BEF226 */}
            <div className="pt-1.5">
              <button
                type="button"
                onClick={() => setSelectedRecap(item)}
                className="w-full py-2 px-3 rounded-lg bg-[#BEF226] hover:bg-[#aedb24] text-[#0f2402] font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
              >
                <span>View Full Recap</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Full Recap Modal Popup */}
      {selectedRecap && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 relative border border-slate-200">
            <button
              type="button"
              onClick={() => setSelectedRecap(null)}
              className="absolute right-4 top-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <InstrumentIcon
                iconType={selectedRecap.iconType}
                name={selectedRecap.name}
                className="w-9 h-9"
              />
              <div>
                <h3 className="font-bold text-lg text-slate-900">
                  {selectedRecap.name} ({selectedRecap.symbol})
                </h3>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                  24h Change: {selectedRecap.change}
                </span>
              </div>
            </div>

            <h4 className="text-base font-bold text-slate-900 border-l-4 border-[#5945F1] pl-3 py-0.5">
              {selectedRecap.headline}
            </h4>

            <p className="text-sm text-slate-600 leading-relaxed">
              {selectedRecap.body}
            </p>

            <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
              {selectedRecap.tags.map((tag, i) => (
                <span key={i} className="text-xs font-semibold text-[#5945F1] bg-indigo-50 px-2.5 py-1 rounded-md">
                  {tag}
                </span>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedRecap(null)}
                className="px-4 py-2 bg-[#5945F1] text-white text-xs font-bold rounded-lg hover:bg-[#4338CA] transition-colors"
              >
                Close Recap
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

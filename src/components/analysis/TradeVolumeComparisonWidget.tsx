import React, { useState } from 'react';
import { VolumeCategoryItem } from './instrumentAnalysisData';

interface TradeVolumeComparisonWidgetProps {
  data: {
    '1D': VolumeCategoryItem[];
    '1W': VolumeCategoryItem[];
    '1M': VolumeCategoryItem[];
    '1Y': VolumeCategoryItem[];
  };
}

export const TradeVolumeComparisonWidget: React.FC<TradeVolumeComparisonWidgetProps> = ({
  data,
}) => {
  const [metric, setMetric] = useState<string>('Trade Volume');
  const [activeTimeframe, setActiveTimeframe] = useState<'1D' | '1W' | '1M' | '1Y'>('1D');

  // Exact data from screenshot for 1D, fall back to props
  const default1D: VolumeCategoryItem[] = [
    { name: 'Stablecoin', volume: '48.52 B', rawVolume: 100, color: '#2563EB' },
    { name: 'Bitcoin', volume: '28.45 B', rawVolume: 64, color: '#2563EB' },
    { name: 'De-Fi', volume: '$6.12 B', rawVolume: 22, color: '#2563EB' },
    { name: 'Meme', volume: '$4.89 B', rawVolume: 18, color: '#F97316' },
    { name: 'Layer 2', volume: '$3.15 B', rawVolume: 14, color: '#818CF8' },
    { name: 'AI & DePIN', volume: '$1.78 B', rawVolume: 10, color: '#F97316' },
    { name: 'Game-Fi', volume: '$842.6 M', rawVolume: 6, color: '#F97316' },
  ];

  const currentItems =
    activeTimeframe === '1D'
      ? default1D
      : (data[activeTimeframe] || default1D).map((item, idx) => ({
          ...item,
          color:
            idx < 3
              ? '#2563EB'
              : idx === 3
              ? '#F97316'
              : idx === 4
              ? '#818CF8'
              : '#F97316',
        }));

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
      {/* Title: Data in magenta, Worth Looking at in dark slate */}
      <div>
        <h3 className="text-lg font-bold font-display flex items-center gap-1.5 leading-tight">
          <span className="text-[#FD02B0]">Data</span>
          <span className="text-[#0b1c30]">Worth Looking at</span>
        </h3>

        {/* 2 Dropdown Filters matching screenshot */}
        <div className="flex items-center gap-2 mt-2.5">
          <div className="relative flex-1">
            <select
              value={metric}
              onChange={(e) => setMetric(e.target.value)}
              className="w-full bg-white border border-[#5046E5]/40 text-[#5046E5] rounded-xl px-2.5 py-1.5 text-xs font-bold appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#5046E5] pr-6 shadow-2xs"
            >
              <option value="Trade Volume">Trade Volume</option>
              <option value="Market Cap">Market Cap</option>
              <option value="Liquidity">Liquidity</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#5046E5]">
              <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>

          <div className="relative w-28">
            <select
              value={activeTimeframe}
              onChange={(e) => setActiveTimeframe(e.target.value as any)}
              className="w-full bg-white border border-[#5046E5]/40 text-[#5046E5] rounded-xl px-2.5 py-1.5 text-xs font-bold appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#5046E5] pr-6 shadow-2xs"
            >
              <option value="1D">1 Day</option>
              <option value="1W">1 Week</option>
              <option value="1M">1 Month</option>
              <option value="1Y">1 Year</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#5046E5]">
              <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bars List with exact color matching */}
      <div className="space-y-3 pt-1">
        {currentItems.map((item, idx) => (
          <div key={idx} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">{item.name}</span>
              <span className="font-mono text-slate-500 font-medium">{item.volume}</span>
            </div>
            {/* Progress Track with colored bar matching screenshot */}
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.max(item.rawVolume, 3)}%`,
                  backgroundColor: item.color || '#2563EB',
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Footnote disclaimer */}
      <div className="pt-3 border-t border-slate-100">
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Relative activity compares participation; it is not a capital-flow nor trade recommendation
        </p>
      </div>
    </div>
  );
};

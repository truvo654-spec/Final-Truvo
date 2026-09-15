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
  const [activeTimeframe, setActiveTimeframe] = useState<'1D' | '1W' | '1M' | '1Y'>('1D');

  // Exact data from screenshot for 1D, fall back to props
  const default1D: VolumeCategoryItem[] = [
    { name: 'Stablecoin', volume: '48.52 B', rawVolume: 100, color: '#2563EB' },
    { name: 'Bitcoin', volume: '28.45 B', rawVolume: 64, color: '#2563EB' },
    { name: 'De-Fi', volume: '6.12 B', rawVolume: 22, color: '#2563EB' },
    { name: 'Meme', volume: '4.89 B', rawVolume: 18, color: '#F97316' },
    { name: 'Layer 2', volume: '3.15 B', rawVolume: 14, color: '#818CF8' },
    { name: 'AI & DePIN', volume: '1.78 B', rawVolume: 10, color: '#F97316' },
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
      {/* Title with Trade Volume in magenta and Comparison in navy matching Instrumental Analysis (1).png */}
      <h3 className="text-lg font-bold font-display flex items-center gap-1.5">
        <span className="text-[#FD02B0]">Trade Volume</span>
        <span className="text-[#0b1c30]">Comparison</span>
      </h3>

      {/* Timeframe selector pills matching screenshot */}
      <div className="flex items-center gap-1 p-1 bg-slate-50/90 border border-slate-200/70 rounded-xl">
        {(['1D', '1W', '1M', '1Y'] as const).map((tf) => (
          <button
            key={tf}
            type="button"
            onClick={() => setActiveTimeframe(tf)}
            className={`flex-1 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTimeframe === tf
                ? 'bg-white text-[#2563EB] shadow-2xs border border-blue-200 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {tf}
          </button>
        ))}
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

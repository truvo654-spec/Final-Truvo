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

  const currentItems = data[activeTimeframe] || data['1D'];

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-5">
      {/* Title */}
      <h3 className="text-base font-bold font-display text-[#0b1c30]">
        Trade Volume Comparison
      </h3>

      {/* Timeframe selector pills */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-50 border border-slate-200/70 rounded-xl">
        {(['1D', '1W', '1M', '1Y'] as const).map((tf) => (
          <button
            key={tf}
            type="button"
            onClick={() => setActiveTimeframe(tf)}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTimeframe === tf
                ? 'bg-white text-[#4F46E5] shadow-xs border border-indigo-100'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {tf}
          </button>
        ))}
      </div>

      {/* Progress Bars List */}
      <div className="space-y-4 pt-1">
        {currentItems.map((item, idx) => (
          <div key={idx} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">{item.name}</span>
              <span className="font-mono text-slate-500 font-medium">{item.volume}</span>
            </div>
            {/* Progress Track */}
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#5945F1] rounded-full transition-all duration-500"
                style={{
                  width: `${Math.max(item.rawVolume, 4)}%`,
                  opacity: Math.max(0.4, item.rawVolume / 100),
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

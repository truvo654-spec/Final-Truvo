import React, { useState } from 'react';
import { motion } from 'motion/react';

interface InstrumentCorrelationViewProps {
  onSelectInstrument?: (symbol: string) => void;
}

export const InstrumentCorrelationView: React.FC<InstrumentCorrelationViewProps> = ({
  onSelectInstrument,
}) => {
  const instruments = [
    'BTC/USD',
    'ETH/USD',
    'SOL/USD',
    'BNB/USD',
    'XRP/USD',
    'UNI/USD',
    'DOGE/USD',
    'ADA/USD',
    'AAVE/USD',
  ];

  // Exact 9x9 matrix data matching Frame 427322387 (3).png
  const matrixData: { text: string; val: number }[][] = [
    // BTC/USD
    [
      { text: '100%', val: 100 },
      { text: '82%', val: 82 },
      { text: '+12%', val: 12 },
      { text: '+64%', val: 64 },
      { text: '+71%', val: 71 },
      { text: '+38%', val: 38 },
      { text: '+58%', val: 58 },
      { text: '+52%', val: 52 },
      { text: '+43%', val: 43 },
    ],
    // ETH/USD
    [
      { text: '82%', val: 82 },
      { text: '100%', val: 100 },
      { text: '+87%', val: 87 },
      { text: '+69%', val: 69 },
      { text: '+67%', val: 67 },
      { text: '+51%', val: 51 },
      { text: '-72%', val: -72 },
      { text: '+63%', val: 63 },
      { text: '+74%', val: 74 },
    ],
    // SOL/USD
    [
      { text: '+12%', val: 12 },
      { text: '+87%', val: 87 },
      { text: '100%', val: 100 },
      { text: '+61%', val: 61 },
      { text: '-59%', val: -59 },
      { text: '+42%', val: 42 },
      { text: '+68%', val: 68 },
      { text: '+55%', val: 55 },
      { text: '+71%', val: 71 },
    ],
    // BNB/USD
    [
      { text: '+64%', val: 64 },
      { text: '+69%', val: 69 },
      { text: '+61%', val: 61 },
      { text: '100%', val: 100 },
      { text: '+48%', val: 48 },
      { text: '+31%', val: 31 },
      { text: '+54%', val: 54 },
      { text: '+44%', val: 44 },
      { text: '-39%', val: -39 },
    ],
    // XRP/USD
    [
      { text: '+71%', val: 71 },
      { text: '+67%', val: 67 },
      { text: '-59%', val: -59 },
      { text: '+48%', val: 48 },
      { text: '100%', val: 100 },
      { text: '+29%', val: 29 },
      { text: '+63%', val: 63 },
      { text: '+57%', val: 57 },
      { text: '+34%', val: 34 },
    ],
    // UNI/USD
    [
      { text: '+38%', val: 38 },
      { text: '+51%', val: 51 },
      { text: '+42%', val: 42 },
      { text: '+31%', val: 31 },
      { text: '+29%', val: 29 },
      { text: '100%', val: 100 },
      { text: '-12%', val: -12 },
      { text: '+18%', val: 18 },
      { text: '+46%', val: 46 },
    ],
    // DOGE/USD
    [
      { text: '+58%', val: 58 },
      { text: '-72%', val: -72 },
      { text: '+68%', val: 68 },
      { text: '+54%', val: 54 },
      { text: '+63%', val: 63 },
      { text: '-12%', val: -12 },
      { text: '100%', val: 100 },
      { text: '+69%', val: 69 },
      { text: '+21%', val: 21 },
    ],
    // ADA/USD
    [
      { text: '+52%', val: 52 },
      { text: '+63%', val: 63 },
      { text: '+55%', val: 55 },
      { text: '+44%', val: 44 },
      { text: '+57%', val: 57 },
      { text: '+18%', val: 18 },
      { text: '+69%', val: 69 },
      { text: '100%', val: 100 },
      { text: '+27%', val: 27 },
    ],
    // AAVE/USD
    [
      { text: '+43%', val: 43 },
      { text: '+74%', val: 74 },
      { text: '+71%', val: 71 },
      { text: '-39%', val: -39 },
      { text: '+34%', val: 34 },
      { text: '+46%', val: 46 },
      { text: '+21%', val: 21 },
      { text: '+27%', val: 27 },
      { text: '100%', val: 100 },
    ],
  ];

  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null);

  // Exact color styling matching Frame 427322387 (3).png
  const getCellClasses = (val: number) => {
    if (val === 100) {
      return 'bg-[#16A34A] text-white font-bold shadow-2xs';
    }
    if (val < 0) {
      // Soft red / salmon
      if (val <= -50) return 'bg-[#FECDD3] text-slate-800 font-medium';
      return 'bg-[#FEE2E2] text-slate-800 font-medium';
    }
    // Positive mint green scale
    if (val >= 75) return 'bg-[#86EFAC]/80 text-slate-800 font-medium';
    if (val >= 50) return 'bg-[#BBF7D0]/70 text-slate-800 font-medium';
    if (val >= 30) return 'bg-[#DCFCE7]/70 text-slate-800 font-medium';
    return 'bg-[#F0FDF4] text-slate-800 font-medium';
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-[#8B5CF6]/30 p-5 sm:p-7 shadow-2xs space-y-6">
      {/* ─── Top Header Bar: Title + Subtitle ─── */}
      <div>
        <h2 className="text-base sm:text-lg font-bold font-display text-slate-900 select-none">
          Adaptive Correlation
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Derived from the current market, venue, sector, and filter selection.
        </p>
      </div>

      {/* ─── 9x9 Matrix Table (Exact match to Frame 427322387 (3).png) ─── */}
      <div className="overflow-x-auto scrollbar-none pb-2 select-none">
        <div className="min-w-[700px] w-full">
          {/* Column Header Row */}
          <div className="grid grid-cols-10 gap-2 pb-2 text-xs font-semibold text-slate-700">
            {/* Empty corner cell */}
            <div className="p-2" />
            {instruments.map((inst, cIdx) => {
              const isColActive = hoveredCell?.col === cIdx;
              return (
                <div
                  key={inst}
                  className={`p-2 text-center transition-colors rounded-lg ${
                    isColActive ? 'text-[#5945F1] font-bold bg-indigo-50/60' : 'text-slate-700'
                  }`}
                >
                  {inst}
                </div>
              );
            })}
          </div>

          {/* Matrix Rows */}
          <div className="space-y-2">
            {instruments.map((rowInst, rIdx) => {
              const isRowActive = hoveredCell?.row === rIdx;
              return (
                <div key={rowInst} className="grid grid-cols-10 gap-2 items-center">
                  {/* Row Header Cell */}
                  <div
                    className={`py-3 px-2 text-xs font-semibold text-slate-700 transition-colors rounded-lg truncate ${
                      isRowActive ? 'text-[#5945F1] font-bold bg-indigo-50/60' : ''
                    }`}
                  >
                    {rowInst}
                  </div>

                  {/* 9 Data Cells in Row */}
                  {matrixData[rIdx].map((cell, cIdx) => {
                    const isHovered = hoveredCell?.row === rIdx && hoveredCell?.col === cIdx;
                    return (
                      <motion.div
                        key={cIdx}
                        onMouseEnter={() => setHoveredCell({ row: rIdx, col: cIdx })}
                        onMouseLeave={() => setHoveredCell(null)}
                        whileHover={{ scale: 1.04 }}
                        onClick={() => onSelectInstrument?.(rowInst)}
                        className={`h-12 sm:h-14 rounded-xl flex items-center justify-center text-xs sm:text-sm transition-all cursor-pointer ${getCellClasses(
                          cell.val
                        )} ${isHovered ? 'ring-2 ring-indigo-400 shadow-sm' : ''}`}
                      >
                        {cell.text}
                      </motion.div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

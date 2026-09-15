import React, { useState } from 'react';
import { X as CloseIcon, ChevronDown } from 'lucide-react';

interface CashbackCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab?: (tab: string) => void;
  onTradeNow?: () => void;
}

interface CalendarDayData {
  day: number;
  cashback?: string;
  lots?: string;
  status: 'active' | 'empty-outline' | 'empty-filled';
}

const FEBRUARY_DAYS_DATA: CalendarDayData[] = [
  // Week 1
  { day: 1, cashback: '$155.00', lots: '8.2 Lots', status: 'active' },
  { day: 2, cashback: '$240.50', lots: '12.5 Lots', status: 'active' },
  { day: 3, status: 'empty-outline' },
  { day: 4, cashback: '$192.00', lots: '8.2 Lots', status: 'active' },
  { day: 5, cashback: '$310.25', lots: '15.8 Lots', status: 'active' },
  { day: 6, cashback: '$178.50', lots: '9.4 Lots', status: 'active' },
  { day: 7, cashback: '$415.00', lots: '22.0 Lots', status: 'active' },

  // Week 2
  { day: 8, cashback: '$210.75', lots: '11.2 Lots', status: 'active' },
  { day: 9, cashback: '$285.00', lots: '14.6 Lots', status: 'active' },
  { day: 10, cashback: '$345.50', lots: '18.3 Lots', status: 'active' },
  { day: 11, cashback: '$142.25', lots: '7.5 Lots', status: 'active' },
  { day: 12, status: 'empty-outline' },
  { day: 13, cashback: '$388.00', lots: '20.1 Lots', status: 'active' },
  { day: 14, status: 'empty-outline' },

  // Week 3
  { day: 15, status: 'empty-outline' },
  { day: 16, status: 'empty-outline' },
  { day: 17, cashback: '$265.25', lots: '13.9 Lots', status: 'active' },
  { day: 18, status: 'empty-filled' },
  { day: 19, status: 'empty-filled' },
  { day: 20, status: 'empty-filled' },
  { day: 21, status: 'empty-filled' },

  // Week 4
  { day: 22, status: 'empty-filled' },
  { day: 23, status: 'empty-filled' },
  { day: 24, status: 'empty-filled' },
  { day: 25, status: 'empty-filled' },
  { day: 26, status: 'empty-filled' },
  { day: 27, status: 'empty-filled' },
  { day: 28, status: 'empty-filled' },
];

export const CashbackCalendarModal: React.FC<CashbackCalendarModalProps> = ({
  isOpen,
  onClose,
  onNavigateToTab,
  onTradeNow,
}) => {
  const [selectedMonth, setSelectedMonth] = useState('February');

  if (!isOpen) return null;

  return (
    <div
      id="cashback-calendar-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/40 backdrop-blur-xs overflow-y-auto animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-8 space-y-6 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          id="close-cashback-calendar-btn"
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <CloseIcon className="w-5 h-5 stroke-[2.2]" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pr-8">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#0b1c30] tracking-tight">
              Cashback Calendar
            </h2>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              Latest Update 15 Feb 2026 11:59PM HH:MM
            </p>
          </div>

          {/* Month Selector */}
          <div className="flex flex-col items-start sm:items-end">
            <span className="text-xs font-semibold text-slate-500 mb-1">Month</span>
            <div className="relative">
              <select
                id="cashback-calendar-month-select"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="appearance-none pl-3.5 pr-8 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-[#0b1c30] shadow-2xs hover:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-[#5945F1]/20 cursor-pointer"
              >
                <option value="January">January</option>
                <option value="February">February</option>
                <option value="March">March</option>
                <option value="April">April</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Top Summary Card with Gradient Glow Border */}
        <div className="rounded-2xl p-[2px] bg-gradient-to-r from-[#5945F1] via-[#c084fc] to-[#FE01B1] shadow-xs">
          <div className="rounded-2xl bg-white p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 overflow-hidden relative">
            <div className="flex items-center gap-4 relative z-10">
              {/* 3D Wallet Icon */}
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#818cf8] via-[#6366f1] to-[#4f46e5] p-2.5 shadow-md flex items-center justify-center relative shrink-0">
                <svg viewBox="0 0 36 36" fill="none" className="w-9 h-9 drop-shadow-xs">
                  <path
                    d="M 8 14 C 8 10, 12 8, 18 8 C 24 8, 28 10, 28 14 L 30 26 C 30 30, 26 32, 18 32 C 10 32, 6 30, 6 26 Z"
                    fill="#a5b4fc"
                  />
                  <path
                    d="M 10 14 C 10 12, 13 10, 18 10 C 23 10, 26 12, 26 14 C 26 16, 23 17, 18 17 C 13 17, 10 16, 10 14 Z"
                    fill="#c7d2fe"
                  />
                  <circle cx="18" cy="22" r="5" fill="#fde047" stroke="#ca8a04" strokeWidth="1" />
                  <text x="18" y="24.5" textAnchor="middle" fontSize="6" fontWeight="bold" fill="#854d0e">$</text>
                </svg>
              </div>

              <div>
                <div className="text-2xl sm:text-3xl font-extrabold font-display text-[#5945F1] tracking-tight">
                  $3,128.00
                </div>
                <div className="text-xs sm:text-sm text-slate-500 font-semibold mt-0.5">
                  163.6 Lots
                </div>
              </div>
            </div>

            {/* Smooth Purple Wave Graph stretching right */}
            <div className="w-full md:w-1/2 h-14 flex items-end">
              <svg viewBox="0 0 360 70" preserveAspectRatio="none" className="w-full h-full">
                <defs>
                  <linearGradient id="calWaveGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#c084fc" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {/* Gradient Fill */}
                <path
                  d="M 0,35 Q 40,38 80,45 T 160,40 T 240,32 T 300,18 T 360,8 L 360,70 L 0,70 Z"
                  fill="url(#calWaveGrad)"
                />
                {/* Purple Line */}
                <path
                  d="M 0,35 Q 40,38 80,45 T 160,40 T 240,32 T 300,18 T 360,8"
                  fill="none"
                  stroke="#5945F1"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Calendar Grid Container */}
        <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-2xs">
          {/* Day Names Header */}
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/70 text-center">
            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((d) => (
              <div key={d} className="py-2.5 text-xs font-bold text-slate-600 truncate px-1">
                <span className="hidden sm:inline">{d}</span>
                <span className="sm:hidden">{d.slice(0, 3)}</span>
              </div>
            ))}
          </div>

          {/* Days Cells Grid */}
          <div className="grid grid-cols-7 divide-x divide-y divide-slate-200">
            {FEBRUARY_DAYS_DATA.map((item) => (
              <div
                key={`feb-day-${item.day}`}
                className={`min-h-[72px] sm:min-h-[88px] p-1.5 sm:p-2.5 flex flex-col justify-between transition-colors ${
                  item.status === 'active'
                    ? 'bg-white hover:bg-indigo-50/30'
                    : item.status === 'empty-filled'
                    ? 'bg-slate-50/60'
                    : 'bg-white'
                }`}
              >
                {/* Cell Header: Day Number & Status Indicator */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700">{item.day}</span>

                  {/* Status Indicator Icon */}
                  {item.status === 'active' && (
                    <span
                      title="Trading activity logged"
                      className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-xs bg-[#5945F1] shrink-0"
                    />
                  )}
                  {item.status === 'empty-outline' && (
                    <span
                      title="No trading"
                      className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-xs border border-slate-300 shrink-0"
                    />
                  )}
                  {item.status === 'empty-filled' && (
                    <span
                      title="Future or unlogged date"
                      className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-xs bg-slate-300 shrink-0"
                    />
                  )}
                </div>

                {/* Cashback & Lots Content */}
                {item.status === 'active' ? (
                  <div className="mt-1 space-y-0.5">
                    <div className="text-[11px] sm:text-xs font-bold text-[#5945F1] font-mono leading-tight">
                      {item.cashback}
                    </div>
                    <div className="text-[9px] sm:text-[10px] font-semibold text-slate-400 leading-tight">
                      {item.lots}
                    </div>
                  </div>
                ) : (
                  <div className="h-4" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer Action Buttons */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            id="modal-my-cashback-btn"
            onClick={() => {
              onClose();
              if (onNavigateToTab) onNavigateToTab('cashback-overview');
            }}
            className="px-6 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm shadow-2xs transition-all cursor-pointer active:scale-95"
          >
            My Cashback
          </button>

          <button
            id="modal-trade-now-btn"
            onClick={() => {
              onClose();
              if (onTradeNow) {
                onTradeNow();
              } else if (onNavigateToTab) {
                onNavigateToTab('signals');
              }
            }}
            className="px-6 py-2.5 rounded-xl bg-[#5945F1] hover:bg-[#4734dc] text-white font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer active:scale-95"
          >
            Trade Now
          </button>
        </div>
      </div>
    </div>
  );
};

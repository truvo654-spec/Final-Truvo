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
  // Week 1 (Days 1 to 7: Sunday to Saturday)
  { day: 1, cashback: '$155.00', lots: '8.2 Lots', status: 'active' },
  { day: 2, cashback: '$240.50', lots: '12.5 Lots', status: 'active' },
  { day: 3, status: 'empty-outline' },
  { day: 4, cashback: '$192.00', lots: '8.2 Lots', status: 'active' },
  { day: 5, cashback: '$310.25', lots: '15.8 Lots', status: 'active' },
  { day: 6, cashback: '$178.50', lots: '9.4 Lots', status: 'active' },
  { day: 7, cashback: '$415.00', lots: '22.0 Lots', status: 'active' },

  // Week 2 (Days 8 to 14: Sunday to Saturday)
  { day: 8, cashback: '$210.75', lots: '11.2 Lots', status: 'active' },
  { day: 9, cashback: '$285.00', lots: '14.6 Lots', status: 'active' },
  { day: 10, cashback: '$345.50', lots: '18.3 Lots', status: 'active' },
  { day: 11, cashback: '$142.25', lots: '7.5 Lots', status: 'active' },
  { day: 12, status: 'empty-outline' },
  { day: 13, cashback: '$388.00', lots: '20.1 Lots', status: 'active' },
  { day: 14, status: 'empty-outline' },

  // Week 3 (Days 15 to 21: Sunday to Saturday)
  { day: 15, status: 'empty-outline' },
  { day: 16, status: 'empty-outline' },
  { day: 17, cashback: '$265.25', lots: '13.9 Lots', status: 'active' },
  { day: 18, status: 'empty-filled' },
  { day: 19, status: 'empty-filled' },
  { day: 20, status: 'empty-filled' },
  { day: 21, status: 'empty-filled' },

  // Week 4 (Days 22 to 28: Sunday to Saturday)
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
      id="cashback-calendar-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/30 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="cashback-calendar-modal-content"
        className="relative w-full max-w-[860px] bg-white rounded-3xl shadow-2xl border border-slate-200/80 p-6 sm:p-8 space-y-5 my-auto animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button (X in top-right corner) */}
        <button
          id="close-cashback-calendar-btn"
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <CloseIcon className="w-5 h-5 stroke-[2]" />
        </button>

        {/* Modal Header: Title & Month Dropdown (1:1 with Notification Card.png) */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pr-10">
          <div>
            <h2 className="font-display text-2xl sm:text-[26px] font-extrabold text-[#0b1c30] tracking-tight">
              Cashback Calendar
            </h2>
            <p className="text-xs sm:text-[13px] text-slate-400 mt-1 font-normal">
              Latest Update 15 Feb 2026 11:59PM HH:MM
            </p>
          </div>

          {/* Month Selector */}
          <div className="flex flex-col items-start sm:items-end">
            <label
              htmlFor="cashback-calendar-month-select"
              className="text-xs font-semibold text-slate-700 mb-1"
            >
              Month
            </label>
            <div className="relative w-36 sm:w-40">
              <select
                id="cashback-calendar-month-select"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full appearance-none pl-3.5 pr-8 py-2 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-medium text-slate-600 shadow-2xs hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#5945F1]/20 cursor-pointer"
              >
                <option value="January">January</option>
                <option value="February">February</option>
                <option value="March">March</option>
                <option value="April">April</option>
                <option value="May">May</option>
                <option value="June">June</option>
                <option value="July">July</option>
                <option value="August">August</option>
                <option value="September">September</option>
                <option value="October">October</option>
                <option value="November">November</option>
                <option value="December">December</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Divider line under header matching design */}
        <div className="w-full h-px bg-slate-100 -mt-1" />

        {/* ─── BANNER CARD (GRADIENT BORDER + 3D WALLET + AREA WAVE GRAPH) ─── */}
        <div className="rounded-2xl p-[1.5px] bg-gradient-to-r from-[#5945F1] via-[#A855F7] to-[#FD02B0] shadow-xs">
          <div className="rounded-[14px] bg-white px-5 py-4 sm:py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 overflow-hidden relative">
            {/* Left: 3D Wallet Icon & Amount */}
            <div className="flex items-center gap-4 relative z-10 shrink-0">
              {/* 3D Wallet Icon matching design with coin badge */}
              <div className="w-14 h-14 relative flex items-center justify-center shrink-0">
                <svg viewBox="0 0 64 64" fill="none" className="w-full h-full drop-shadow-sm">
                  {/* Soft shadow */}
                  <ellipse cx="32" cy="54" rx="22" ry="4" fill="#6366f1" fillOpacity="0.12" />
                  
                  {/* Back wallet card/leather */}
                  <rect
                    x="10"
                    y="16"
                    width="44"
                    height="32"
                    rx="8"
                    fill="#F1F3FB"
                    stroke="#D9E0F2"
                    strokeWidth="1.5"
                  />
                  {/* Inner flap fold */}
                  <path
                    d="M 10 24 Q 32 30 54 24"
                    stroke="#D0D7EE"
                    strokeWidth="1.5"
                    fill="none"
                  />
                  
                  {/* Front wallet flap */}
                  <rect
                    x="13"
                    y="22"
                    width="41"
                    height="28"
                    rx="7"
                    fill="#FFFFFF"
                    stroke="#CBD5E1"
                    strokeWidth="1.5"
                  />
                  
                  {/* Side clasp / blue card notch */}
                  <rect
                    x="48"
                    y="32"
                    width="8"
                    height="8"
                    rx="2"
                    fill="#38BDF8"
                    fillOpacity="0.9"
                  />
                  
                  {/* 3D Purple Dollar Coin on left */}
                  <g transform="translate(6, 12)">
                    <circle
                      cx="14"
                      cy="14"
                      r="12"
                      fill="url(#coinGrad)"
                      stroke="#4338CA"
                      strokeWidth="1"
                    />
                    <circle
                      cx="14"
                      cy="14"
                      r="10"
                      fill="none"
                      stroke="#A5B4FC"
                      strokeWidth="0.75"
                      strokeDasharray="2 1"
                    />
                    <text
                      x="14"
                      y="18.5"
                      textAnchor="middle"
                      fill="#FFFFFF"
                      fontSize="13"
                      fontWeight="900"
                      fontFamily="sans-serif"
                    >
                      $
                    </text>
                  </g>

                  <defs>
                    <linearGradient id="coinGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#818CF8" />
                      <stop offset="50%" stopColor="#6366F1" />
                      <stop offset="100%" stopColor="#4F46E5" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              <div>
                <div className="text-3xl sm:text-[32px] font-extrabold font-display text-[#4338CA] tracking-tight leading-none">
                  $3,128.00
                </div>
                <div className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                  163.6 Lots
                </div>
              </div>
            </div>

            {/* Right: Smooth Area Line Chart (1:1 with Notification Card.png) */}
            <div className="w-full md:w-[58%] h-14 sm:h-16 flex items-end">
              <svg
                viewBox="0 0 360 80"
                preserveAspectRatio="none"
                className="w-full h-full overflow-visible"
              >
                <defs>
                  {/* Line Gradient: starts with pink accent, blends into purple */}
                  <linearGradient id="calLineGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#FD02B0" />
                    <stop offset="10%" stopColor="#6366F1" />
                    <stop offset="100%" stopColor="#4F46E5" />
                  </linearGradient>
                  {/* Area fill gradient: soft purple fading to transparent */}
                  <linearGradient id="calAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366F1" stopOpacity="0.32" />
                    <stop offset="70%" stopColor="#A855F7" stopOpacity="0.08" />
                    <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Area Fill */}
                <path
                  d="M 0,40 C 20,40 40,44 70,46 C 105,48 135,45 165,44 C 190,43 210,44 230,36 C 242,31 254,32 265,36 C 278,40 290,39 300,36 C 315,30 330,22 350,16 L 350,80 L 0,80 Z"
                  fill="url(#calAreaGrad)"
                />

                {/* Line Path */}
                <path
                  d="M 0,40 C 20,40 40,44 70,46 C 105,48 135,45 165,44 C 190,43 210,44 230,36 C 242,31 254,32 265,36 C 278,40 290,39 300,36 C 315,30 330,22 350,16"
                  fill="none"
                  stroke="url(#calLineGrad)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* ─── CALENDAR DAYS OF WEEK HEADERS (CLEAN TEXT HEADERS 1:1) ─── */}
        <div className="pt-2">
          <div className="grid grid-cols-7 text-center pb-2">
            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(
              (dayName) => (
                <div
                  key={dayName}
                  className="text-xs sm:text-[13px] font-medium text-slate-700 truncate px-1"
                >
                  <span className="hidden sm:inline">{dayName}</span>
                  <span className="sm:hidden">{dayName.slice(0, 3)}</span>
                </div>
              )
            )}
          </div>

          {/* ─── CALENDAR 4x7 CELLS GRID (1:1 with Notification Card.png) ─── */}
          <div className="border border-slate-200 bg-white grid grid-cols-7 divide-x divide-y divide-slate-200 shadow-2xs">
            {FEBRUARY_DAYS_DATA.map((item) => (
              <div
                key={`feb-day-${item.day}`}
                className={`min-h-[76px] sm:min-h-[86px] p-2 sm:p-2.5 flex flex-col justify-between transition-colors ${
                  item.status === 'active'
                    ? 'bg-white hover:bg-indigo-50/25'
                    : item.status === 'empty-filled'
                    ? 'bg-white'
                    : 'bg-white'
                }`}
              >
                {/* Header row of cell: Day Number & Status Indicator Square */}
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-[13px] font-semibold text-slate-800 leading-none">
                    {item.day}
                  </span>

                  {/* Status Indicator Square */}
                  {item.status === 'active' && (
                    <span
                      title="Trading activity logged"
                      className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-[1px] bg-[#5945F1] shrink-0"
                    />
                  )}
                  {item.status === 'empty-outline' && (
                    <span
                      title="No trades"
                      className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-[1px] border border-slate-300 bg-white shrink-0"
                    />
                  )}
                  {item.status === 'empty-filled' && (
                    <span
                      title="Unlogged / Future date"
                      className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-[1px] bg-slate-300 shrink-0"
                    />
                  )}
                </div>

                {/* Cell Body: Cashback Amount & Lots (Shown on active trading days) */}
                {item.status === 'active' ? (
                  <div className="mt-1 space-y-0.5">
                    <div className="text-xs sm:text-[13px] font-bold text-[#4338CA] font-mono leading-tight">
                      {item.cashback}
                    </div>
                    <div className="text-[10px] sm:text-[11px] font-normal text-slate-500 leading-tight">
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

        {/* ─── MODAL FOOTER ACTIONS (1:1 with Notification Card.png) ─── */}
        <div className="flex items-center justify-center gap-3 pt-3">
          {/* Button 1: My Cashback (White with purple border & text) */}
          <button
            id="modal-my-cashback-btn"
            onClick={() => {
              onClose();
              if (onNavigateToTab) onNavigateToTab('cashback-overview');
            }}
            className="px-6 sm:px-7 py-2.5 rounded-xl border border-indigo-200 hover:border-indigo-300 bg-white hover:bg-indigo-50/40 text-[#4F46E5] font-semibold text-xs sm:text-sm shadow-2xs transition-all cursor-pointer active:scale-95"
          >
            My Cashback
          </button>

          {/* Button 2: Trade Now (Solid purple with white text) */}
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
            className="px-6 sm:px-7 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold text-xs sm:text-sm shadow-xs transition-all cursor-pointer active:scale-95"
          >
            Trade Now
          </button>
        </div>
      </div>
    </div>
  );
};

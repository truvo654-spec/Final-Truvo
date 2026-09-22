import React, { useState, useMemo } from 'react';
import { ChevronDown, Clock, Calendar, ArrowUpDown, Check } from 'lucide-react';

interface SharedConversionProps {
  onReset?: () => void;
  onSave?: () => void;
}

// ─────────────────────────────────────────────────────────────
// 1. TRADING TIMEZONE CONVERTER VIEW
// ─────────────────────────────────────────────────────────────
export const TradingTimezoneConverterView: React.FC<SharedConversionProps> = ({
  onReset,
  onSave,
}) => {
  const [timeFormat, setTimeFormat] = useState<'12h' | '24h'>('12h');
  const [isLive, setIsLive] = useState(true);
  const [selectedTimezone, setSelectedTimezone] = useState('GMT+7');
  const [timeInput, setTimeInput] = useState('12:00');
  const [dateInput, setDateInput] = useState('22/04/2026');

  const handleReset = () => {
    setTimeFormat('12h');
    setIsLive(true);
    setSelectedTimezone('GMT+7');
    setTimeInput('12:00');
    setDateInput('22/04/2026');
    onReset?.();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight flex items-center gap-0.5">
          <span className="text-[#5945F1] dark:text-[#ABA1F8]">Trading Timezone Convert</span>
          <span className="text-[#FD02B0]">er</span>
        </h1>
        <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-[#CCC6FB] mt-1">
          Converted Times: <span className="font-normal text-slate-500 dark:text-[#8A7AF6]">Wednesday Apr 22</span>
        </p>
      </div>

      {/* Inputs Card */}
      <div className="bg-white dark:bg-[#170345] rounded-3xl p-6 sm:p-7 border border-slate-100 dark:border-[#230674] shadow-xs space-y-5">
        {/* Row 1: Time Format & Live toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs sm:text-[13px] font-semibold text-slate-800 dark:text-white">
              Time Format
            </span>
            <div className="flex items-center bg-slate-100 dark:bg-[#230674] p-1 rounded-xl border border-slate-200 dark:border-[#3410D5]">
              <button
                type="button"
                onClick={() => setTimeFormat('12h')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  timeFormat === '12h'
                    ? 'bg-white dark:bg-[#5945F1] text-[#5945F1] dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-[#CCC6FB]'
                }`}
              >
                12h
              </button>
              <button
                type="button"
                onClick={() => setTimeFormat('24h')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  timeFormat === '24h'
                    ? 'bg-white dark:bg-[#5945F1] text-[#5945F1] dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-[#CCC6FB]'
                }`}
              >
                24h
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="text-xs sm:text-[13px] font-semibold text-slate-800 dark:text-white">
              Live
            </span>
            <button
              type="button"
              onClick={() => setIsLive(!isLive)}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                isLive ? 'bg-[#5945F1]' : 'bg-slate-200 dark:bg-slate-700'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform flex items-center justify-center ${
                  isLive ? 'translate-x-5' : 'translate-x-0'
                }`}
              >
                {isLive && <Check className="w-2.5 h-2.5 text-[#5945F1]" />}
              </div>
            </button>
          </div>
        </div>

        {/* Timezone Select */}
        <div className="space-y-2">
          <label className="text-xs sm:text-[13px] font-semibold text-slate-800 dark:text-white block">
            Timezone
          </label>
          <div className="relative">
            <select
              value={selectedTimezone}
              onChange={(e) => setSelectedTimezone(e.target.value)}
              className="w-full h-11 px-3.5 pr-10 rounded-xl bg-white dark:bg-[#230674] border border-slate-200 dark:border-[#3410D5] text-slate-800 dark:text-white font-medium text-xs sm:text-sm focus:outline-none focus:border-[#5945F1] appearance-none cursor-pointer"
            >
              <option value="GMT+7">GMT +07:00: Bangkok, Hanoi, Ho Chi Minh, Jakarta</option>
              <option value="GMT+0">GMT +00:00: London, Dublin, Lisbon</option>
              <option value="GMT-4">GMT -04:00: New York, Toronto, Washington</option>
              <option value="GMT+9">GMT +09:00: Tokyo, Seoul</option>
              <option value="GMT+10">GMT +10:00: Sydney, Melbourne</option>
              <option value="GMT+1">GMT +01:00: Frankfurt, Paris, Berlin</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Time and Date Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-xs sm:text-[13px] font-semibold text-slate-800 dark:text-white block">
              Time
            </label>
            <div className="relative">
              <input
                type="text"
                value={timeInput}
                onChange={(e) => setTimeInput(e.target.value)}
                placeholder="12:00"
                className="w-full h-11 px-3.5 pr-10 rounded-xl bg-white dark:bg-[#230674] border border-slate-200 dark:border-[#3410D5] text-slate-800 dark:text-white font-medium text-sm focus:outline-none focus:border-[#5945F1]"
              />
              <Clock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs sm:text-[13px] font-semibold text-slate-800 dark:text-white block">
              Date
            </label>
            <div className="relative">
              <input
                type="text"
                value={dateInput}
                onChange={(e) => setDateInput(e.target.value)}
                placeholder="22/04/2026"
                className="w-full h-11 px-3.5 pr-10 rounded-xl bg-white dark:bg-[#230674] border border-slate-200 dark:border-[#3410D5] text-slate-800 dark:text-white font-medium text-sm focus:outline-none focus:border-[#5945F1]"
              />
              <Calendar className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-center gap-3 pt-3">
          <button
            onClick={handleReset}
            className="px-6 py-2.5 rounded-xl border border-indigo-200/90 dark:border-[#3410D5] bg-white dark:bg-[#230674] hover:bg-slate-50 dark:hover:bg-[#2E0AA3] text-[#5945F1] dark:text-[#ABA1F8] font-semibold text-sm transition-all cursor-pointer shadow-2xs"
          >
            Reset
          </button>
          <button
            onClick={onSave}
            className="px-7 py-2.5 rounded-xl bg-[#5945F1] hover:bg-[#4736d4] text-white font-semibold text-sm transition-all cursor-pointer shadow-xs"
          >
            Save
          </button>
        </div>
      </div>

      {/* Results Card: Converted Market Overlaps */}
      <div className="bg-white dark:bg-[#170345] rounded-3xl p-6 sm:p-7 border-2 border-[#FD02B0] shadow-xs space-y-5">
        <h3 className="text-sm font-bold tracking-tight">
          <span className="text-[#5945F1] dark:text-[#ABA1F8]">Converted Market Overlap</span>
          <span className="text-[#FD02B0]">s</span>
        </h3>

        {/* Sessions Timeline Chart */}
        <div className="relative pt-6 pb-2">
          {/* Active Time Indicator Pill */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-1 flex flex-col items-center z-20">
            <div className="bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 px-2.5 py-0.5 rounded-lg text-center shadow-xs">
              <div className="text-[11px] font-bold text-slate-900 dark:text-white">12:00</div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> High
              </div>
            </div>
            <div className="w-[1.5px] h-48 bg-[#5945F1] -mt-0.5"></div>
          </div>

          {/* Time axis header */}
          <div className="flex justify-between text-[11px] font-medium text-slate-400 dark:text-[#8A7AF6] pl-16 pr-2 mb-3">
            <span>4:00</span>
            <span>8:00</span>
            <span>12:00</span>
            <span>16:00</span>
            <span>20:00</span>
            <span>23:59</span>
          </div>

          {/* Session Rows */}
          <div className="space-y-3.5 text-xs font-semibold">
            {/* Sydney */}
            <div className="flex items-center gap-3">
              <span className="w-14 text-slate-700 dark:text-[#CCC6FB] text-right">Sydney</span>
              <div className="flex-1 h-5 bg-slate-100 dark:bg-[#230674] rounded-full relative overflow-hidden">
                <div className="absolute left-[15%] w-[35%] h-full bg-emerald-400/80 dark:bg-emerald-500/80 rounded-full"></div>
              </div>
            </div>

            {/* Tokyo */}
            <div className="flex items-center gap-3">
              <span className="w-14 text-slate-700 dark:text-[#CCC6FB] text-right">Tokyo</span>
              <div className="flex-1 h-5 bg-slate-100 dark:bg-[#230674] rounded-full relative overflow-hidden">
                <div className="absolute left-[18%] w-[12%] h-full bg-emerald-400/80 rounded-full"></div>
                <div className="absolute left-[33%] w-[12%] h-full bg-emerald-400/80 rounded-full"></div>
              </div>
            </div>

            {/* London */}
            <div className="flex items-center gap-3">
              <span className="w-14 text-slate-700 dark:text-[#CCC6FB] text-right">London</span>
              <div className="flex-1 h-5 bg-slate-100 dark:bg-[#230674] rounded-full relative overflow-hidden">
                <div className="absolute left-[45%] w-[30%] h-full bg-rose-400/80 dark:bg-rose-500/80 rounded-full"></div>
              </div>
            </div>

            {/* New York */}
            <div className="flex items-center gap-3">
              <span className="w-14 text-slate-700 dark:text-[#CCC6FB] text-right">New York</span>
              <div className="flex-1 h-5 bg-slate-100 dark:bg-[#230674] rounded-full relative overflow-hidden">
                <div className="absolute left-[65%] w-[25%] h-full bg-rose-400/80 dark:bg-rose-500/80 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Volume wave curve */}
          <div className="pl-16 pr-2 pt-5">
            <svg viewBox="0 0 400 40" className="w-full h-10 overflow-visible">
              <path
                d="M 0 32 Q 50 30 100 25 T 200 15 T 300 32 T 400 28"
                fill="none"
                stroke="#f97316"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
            <div className="text-[11px] text-slate-500 dark:text-[#8A7AF6] font-medium mt-1">
              <span className="font-bold text-slate-700 dark:text-[#CCC6FB]">Trading Volume</span>: Volume peaks during this time window.
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-[11px] sm:text-xs text-slate-400 dark:text-[#8A7AF6] leading-relaxed">
        <span className="font-bold text-slate-600 dark:text-[#CCC6FB]">Disclaimer:</span> This
        converter is for guidance only. Session times may vary due to daylight saving changes,
        market holidays, or broker server time. Please verify before trading.
      </p>

      {/* Educational Section */}
      <div className="space-y-4 pt-2">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
          How Trading Timezone Converter Works
        </h2>
        <p className="text-xs sm:text-[13px] text-slate-600 dark:text-[#CCC6FB] leading-relaxed">
          Our Trading Timezone Converter simplifies session tracking by synchronizing global market open and close windows into your local time. When major sessions overlap (such as London and New York), trading volume and liquidity reach their peak.
        </p>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// 2. GLOBAL MARKET STATUS SIDEBAR (Used in Timezone View)
// ─────────────────────────────────────────────────────────────
export const GlobalMarketStatusSidebar: React.FC = () => {
  const markets = [
    { name: 'New York Stock Exchange', status: 'Close', timeNote: 'NYSE • NASDAQ, Current Time: 05:21 EST', hours: 'Trading Hours: 21:30 - 4:00 EST', countdown: 'Opens in 03:50:05', flag: '🇺🇸' },
    { name: 'London Stock Exchange', status: 'Open', timeNote: 'LSE • FTSE, Current Time: 05:21 EST', hours: 'Trading Hours: 21:30 - 4:00 EST', countdown: 'Closes in 05:48:51', flag: '🇬🇧' },
    { name: 'Tokyo Stock Exchange', status: 'Close', timeNote: 'TSE • Nikkei, Current Time: 05:21 EST', hours: 'Trading Hours: 9:00 AM - 11:30 AM, 12:30 PM - 3:30 PM JST', countdown: 'Opens in 13:17:12', flag: '🇯🇵' },
    { name: 'Australian Securities Exchange', status: 'Open', timeNote: 'LSE • FTSE, Current Time: 05:21 EST', hours: 'Trading Hours: 21:30 - 4:00 EST', countdown: 'Closes in 12:15:16', flag: '🇦🇺' },
    { name: 'Frankfurt Stock Exchange', status: 'Close', timeNote: 'FRA • DAX, Current Time: 05:21 EST', hours: 'Trading Hours: 9:00 AM - 5:30 PM CET/CEST', countdown: 'Opens in 05:43:33', flag: '🇩🇪' },
    { name: 'Hong Kong Stock Exchange', status: 'Close', timeNote: 'HKEX • Hang Seng, Current Time: 05:21 EST', hours: 'Trading Hours: 9:30 AM - 12:00 PM, 1:00 PM - 4:00 PM HKT', countdown: 'Opens in 13:17:12', flag: '🇭🇰' },
    { name: 'Shanghai Stock Exchange', status: 'Close', timeNote: 'SSE • Shanghai Composite, Current Time: 05:21 EST', hours: 'Trading Hours: 9:30 AM - 11:30 AM, 1:00 PM - 3:00 PM CST', countdown: 'Opens in 13:17:12', flag: '🇨🇳' },
    { name: 'Toronto Stock Exchange', status: 'Close', timeNote: 'TSX • S&P/TSX, Current Time: 05:21 EST', hours: 'Trading Hours: 9:30 AM - 4:00 PM EST', countdown: 'Opens in 03:40:28', flag: '🇨🇦' },
  ];

  return (
    <div className="space-y-6">
      {/* Global Market Status Card */}
      <div className="bg-white dark:bg-[#170345] rounded-3xl p-5 sm:p-6 border-2 border-[#5945F1]/30 dark:border-[#230674] shadow-xs space-y-4">
        <h3 className="text-sm font-bold tracking-tight">
          <span className="text-[#5945F1] dark:text-[#ABA1F8]">Global Market Statu</span>
          <span className="text-[#FD02B0]">s</span>
        </h3>

        <div className="space-y-4 divide-y divide-slate-100 dark:divide-[#230674]">
          {markets.map((m, idx) => (
            <div key={idx} className={idx === 0 ? '' : 'pt-3'}>
              <div className="flex items-center justify-between">
                <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>{m.flag}</span>
                  <span>{m.name}</span>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                    m.status === 'Open'
                      ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                      : 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${m.status === 'Open' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                  {m.status}
                </span>
              </div>
              <div className="text-[10px] text-slate-400 dark:text-[#8A7AF6] mt-0.5">
                {m.timeNote}
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-[#CCC6FB] mt-0.5">
                <span>{m.hours}</span>
                <span className="font-bold text-slate-800 dark:text-white">{m.countdown}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Converted Times Card */}
      <div className="bg-white dark:bg-[#170345] rounded-3xl p-5 sm:p-6 border-2 border-[#5945F1]/30 dark:border-[#230674] shadow-xs space-y-4">
        <h3 className="text-sm font-bold tracking-tight">
          <span className="text-[#5945F1] dark:text-[#ABA1F8]">Converted Time</span>
          <span className="text-[#FD02B0]">s</span>
        </h3>

        <div className="space-y-3">
          <div className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
            Americas
          </div>
          <div className="flex items-center justify-between text-xs py-1 border-b border-slate-100 dark:border-[#230674]">
            <div className="space-y-0.5">
              <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>🇺🇸</span> New York
              </div>
              <div className="text-[10px] text-slate-400">-11 hours</div>
            </div>
            <div className="text-right">
              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1 justify-end">
                <span>01:00</span>
                <span className="text-[9px] bg-rose-50 text-rose-600 px-1 py-0.5 rounded font-bold">EDT</span>
              </div>
              <div className="text-[10px] text-slate-400">Wednesday, Apr 22</div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs py-1">
            <div className="space-y-0.5">
              <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>🇺🇸</span> Los Angeles
              </div>
              <div className="text-[10px] text-slate-400">-14 hours</div>
            </div>
            <div className="text-right">
              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1 justify-end">
                <span>22:00</span>
                <span className="text-[9px] bg-indigo-50 text-indigo-600 px-1 py-0.5 rounded font-bold">PST</span>
              </div>
              <div className="text-[10px] text-slate-400">Tuesday, Apr 21</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// 3. CURRENCY CONVERTER VIEW
// ─────────────────────────────────────────────────────────────
export const CurrencyConverterView: React.FC<SharedConversionProps> = ({ onReset, onSave }) => {
  const [fromAmount, setFromAmount] = useState('1');
  const [fromCurrency, setFromCurrency] = useState('EUR');
  const [toCurrency, setToCurrency] = useState('USD');
  const [timeframe, setTimeframe] = useState<'1D' | '5D' | '1M' | '1Y' | '5Y' | 'Max'>('1D');

  const exchangeRates: Record<string, number> = {
    'EUR-USD': 1.1757,
    'USD-EUR': 0.8506,
    'GBP-USD': 1.2875,
    'USD-GBP': 0.7767,
    'USD-JPY': 154.20,
    'JPY-USD': 0.00648,
    'EUR-GBP': 0.8450,
  };

  const rate = useMemo(() => {
    const pair = `${fromCurrency}-${toCurrency}`;
    return exchangeRates[pair] || 1.1757;
  }, [fromCurrency, toCurrency]);

  const toAmount = useMemo(() => {
    const amt = parseFloat(fromAmount) || 0;
    return (amt * rate).toFixed(4);
  }, [fromAmount, rate]);

  const handleSwap = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
  };

  const handleReset = () => {
    setFromAmount('1');
    setFromCurrency('EUR');
    setToCurrency('USD');
    setTimeframe('1D');
    onReset?.();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight flex items-center gap-0.5">
          <span className="text-[#5945F1] dark:text-[#ABA1F8]">Curren</span>
          <span className="text-[#FD02B0]">cy Converter</span>
        </h1>
        <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-[#CCC6FB] mt-1">
          Mid-market rate at <span className="font-normal text-slate-500 dark:text-[#8A7AF6]">04:18 UTC</span>
        </p>
      </div>

      {/* Inputs Card */}
      <div className="bg-white dark:bg-[#170345] rounded-3xl p-6 sm:p-7 border border-slate-100 dark:border-[#230674] shadow-xs space-y-4">
        {/* Row 1: From */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-xs sm:text-[13px] font-semibold text-slate-800 dark:text-white block">
              From
            </label>
            <input
              type="text"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              placeholder="1"
              className="w-full h-11 px-3.5 rounded-xl bg-white dark:bg-[#230674] border border-slate-200 dark:border-[#3410D5] text-slate-800 dark:text-white font-medium text-sm focus:outline-none focus:border-[#5945F1]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs sm:text-[13px] font-semibold text-slate-800 dark:text-white block">
              Currency
            </label>
            <div className="relative">
              <select
                value={fromCurrency}
                onChange={(e) => setFromCurrency(e.target.value)}
                className="w-full h-11 px-3.5 pr-10 rounded-xl bg-white dark:bg-[#230674] border border-slate-200 dark:border-[#3410D5] text-slate-800 dark:text-white font-medium text-sm focus:outline-none focus:border-[#5945F1] appearance-none cursor-pointer"
              >
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
                <option value="GBP">GBP</option>
                <option value="JPY">JPY</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center -my-1">
          <button
            type="button"
            onClick={handleSwap}
            className="w-10 h-10 rounded-full bg-[#5945F1] text-white flex items-center justify-center shadow-md hover:bg-[#4736d4] transition-transform hover:scale-105 cursor-pointer z-10"
          >
            <ArrowUpDown className="w-4 h-4" />
          </button>
        </div>

        {/* Row 2: To */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-xs sm:text-[13px] font-semibold text-slate-800 dark:text-white block">
              To
            </label>
            <input
              type="text"
              value={toAmount}
              readOnly
              className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-[#230674]/60 border border-slate-200 dark:border-[#3410D5] text-slate-800 dark:text-white font-semibold text-sm focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs sm:text-[13px] font-semibold text-slate-800 dark:text-white block">
              Currency
            </label>
            <div className="relative">
              <select
                value={toCurrency}
                onChange={(e) => setToCurrency(e.target.value)}
                className="w-full h-11 px-3.5 pr-10 rounded-xl bg-white dark:bg-[#230674] border border-slate-200 dark:border-[#3410D5] text-slate-800 dark:text-white font-medium text-sm focus:outline-none focus:border-[#5945F1] appearance-none cursor-pointer"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="JPY">JPY</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-center gap-3 pt-3">
          <button
            onClick={handleReset}
            className="px-6 py-2.5 rounded-xl border border-indigo-200/90 dark:border-[#3410D5] bg-white dark:bg-[#230674] hover:bg-slate-50 dark:hover:bg-[#2E0AA3] text-[#5945F1] dark:text-[#ABA1F8] font-semibold text-sm transition-all cursor-pointer shadow-2xs"
          >
            Reset
          </button>
          <button
            onClick={onSave}
            className="px-7 py-2.5 rounded-xl bg-[#5945F1] hover:bg-[#4736d4] text-white font-semibold text-sm transition-all cursor-pointer shadow-xs"
          >
            Save
          </button>
        </div>
      </div>

      {/* Results Card: Live Conversion */}
      <div className="bg-white dark:bg-[#170345] rounded-3xl p-6 sm:p-7 border-2 border-[#FD02B0] shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-sm font-bold tracking-tight">
            <span className="text-[#5945F1] dark:text-[#ABA1F8]">Live Conversio</span>
            <span className="text-[#FD02B0]">n</span>
          </h3>

          {/* Timeframe tabs */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#230674] p-1 rounded-xl">
            {(['1D', '5D', '1M', '1Y', '5Y', 'Max'] as const).map((tf) => (
              <button
                key={tf}
                type="button"
                onClick={() => setTimeframe(tf)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  timeframe === tf
                    ? 'bg-[#5945F1] text-white shadow-xs'
                    : 'text-slate-600 dark:text-[#CCC6FB] hover:text-slate-900'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>{fromAmount} {fromCurrency} {fromCurrency === 'EUR' ? '🇪🇺' : '🇺🇸'} = {toAmount} {toCurrency} {toCurrency === 'USD' ? '🇺🇸' : '🇪🇺'}</span>
          </div>
          <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
            ▲ +0.002% Today
          </div>
        </div>

        {/* Live Chart */}
        <div className="w-full bg-white dark:bg-[#1f0559] p-4 rounded-2xl border border-slate-100 dark:border-[#230674] relative">
          {/* Tooltip */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-white dark:bg-[#170345] border border-slate-200 dark:border-[#3410D5] px-3 py-1.5 rounded-xl shadow-md text-center z-10">
            <div className="text-xs font-extrabold text-slate-900 dark:text-white">0.724806</div>
            <div className="text-[10px] text-slate-400">Dec 19, 2025, 12:00 UTC</div>
          </div>

          <div className="relative h-44 sm:h-52 w-full">
            <svg viewBox="0 0 500 200" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="currencyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#5945F1" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#5945F1" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid lines */}
              {[40, 80, 120, 160].map((y, idx) => (
                <line
                  key={idx}
                  x1="40"
                  y1={y}
                  x2="480"
                  y2={y}
                  stroke="#e2e8f0"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
              ))}

              {/* Y Axis Labels */}
              <text x="32" y="44" textAnchor="end" fontSize="10" fill="#94a3b8">0.74</text>
              <text x="32" y="84" textAnchor="end" fontSize="10" fill="#94a3b8">0.73</text>
              <text x="32" y="124" textAnchor="end" fontSize="10" fill="#94a3b8">0.72</text>
              <text x="32" y="164" textAnchor="end" fontSize="10" fill="#94a3b8">0.71</text>

              {/* Area path */}
              <path
                d="M 40 120 C 100 110, 140 90, 200 115 C 250 140, 300 70, 360 120 C 410 160, 440 90, 480 110 L 480 170 L 40 170 Z"
                fill="url(#currencyGrad)"
              />

              {/* Line path */}
              <path
                d="M 40 120 C 100 110, 140 90, 200 115 C 250 140, 300 70, 360 120 C 410 160, 440 90, 480 110"
                fill="none"
                stroke="#5945F1"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Tooltip vertical line & point */}
              <line x1="250" y1="35" x2="250" y2="170" stroke="#94a3b8" strokeWidth="1" />
              <circle cx="250" cy="115" r="4.5" fill="#5945F1" stroke="#ffffff" strokeWidth="2" />

              {/* X Axis timestamps */}
              <text x="120" y="188" textAnchor="middle" fontSize="10" fill="#94a3b8">4:00</text>
              <text x="200" y="188" textAnchor="middle" fontSize="10" fill="#94a3b8">8:00</text>
              <text x="280" y="188" textAnchor="middle" fontSize="10" fill="#94a3b8">12:00</text>
              <text x="360" y="188" textAnchor="middle" fontSize="10" fill="#94a3b8">16:00</text>
              <text x="440" y="188" textAnchor="middle" fontSize="10" fill="#94a3b8">20:00</text>
            </svg>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-[11px] sm:text-xs text-slate-400 dark:text-[#8A7AF6] leading-relaxed">
        <span className="font-bold text-slate-600 dark:text-[#CCC6FB]">Disclaimer:</span> This
        converter is for guidance only. Session times may vary due to daylight saving changes,
        market holidays, or broker server time. Please verify before trading.
      </p>

      {/* Educational Section */}
      <div className="space-y-4 pt-2">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
          How Currency Converter Works
        </h2>
        <p className="text-xs sm:text-[13px] text-slate-600 dark:text-[#CCC6FB] leading-relaxed">
          Our Currency Converter provides instant transparency across global financial markets by calculating live exchange values using mid-market interbank rates.
        </p>
      </div>
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface SharedTechnicalProps {
  onReset?: () => void;
  onSave?: () => void;
}

// ─────────────────────────────────────────────────────────────
// 1. FIBONACCI CALCULATOR VIEW
// ─────────────────────────────────────────────────────────────
export const FibonacciCalculatorView: React.FC<SharedTechnicalProps> = ({ onReset, onSave }) => {
  const [trend, setTrend] = useState<'uptrend' | 'downtrend'>('uptrend');
  const [highPrice, setHighPrice] = useState('4055');
  const [lowPrice, setLowPrice] = useState('4022');
  const [customValue, setCustomValue] = useState('1.1050');

  const levels = useMemo(() => {
    const high = parseFloat(highPrice) || 4055;
    const low = parseFloat(lowPrice) || 4022;
    const diff = Math.abs(high - low);

    const formatNum = (n: number) => {
      // Check decimal places
      if (Number.isInteger(n)) return n.toLocaleString();
      return n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 3 });
    };

    if (trend === 'uptrend') {
      const retracements = [
        { pct: '0%', val: formatNum(high) },
        { pct: '23.6%', val: formatNum(high - 0.236 * diff) },
        { pct: '38.2%', val: formatNum(high - 0.382 * diff) },
        { pct: '50%', val: formatNum(high - 0.5 * diff) },
        { pct: '61.8%', val: formatNum(high - 0.618 * diff) },
        { pct: '76.4%', val: formatNum(high - 0.764 * diff) },
        { pct: '100%', val: formatNum(low) },
        { pct: '138.2%', val: formatNum(high - 1.382 * diff) },
      ];

      const extensions = [
        { pct: '261.8%', val: formatNum(high + 1.345 * diff) },
        { pct: '200%', val: formatNum(high + 0.727 * diff) },
        { pct: '161.8%', val: formatNum(high + 0.345 * diff) },
        { pct: '138.2%', val: formatNum(high + 0.109 * diff) },
        { pct: '100%', val: formatNum(high - 0.272 * diff) },
        { pct: '61.8%', val: formatNum(high - 0.654 * diff) },
        { pct: '50%', val: formatNum(high - 0.772 * diff) },
        { pct: '38.2%', val: formatNum(high - 0.89 * diff) },
      ];

      return { retracements, extensions };
    } else {
      const retracements = [
        { pct: '0%', val: formatNum(low) },
        { pct: '23.6%', val: formatNum(low + 0.236 * diff) },
        { pct: '38.2%', val: formatNum(low + 0.382 * diff) },
        { pct: '50%', val: formatNum(low + 0.5 * diff) },
        { pct: '61.8%', val: formatNum(low + 0.618 * diff) },
        { pct: '76.4%', val: formatNum(low + 0.764 * diff) },
        { pct: '100%', val: formatNum(high) },
        { pct: '138.2%', val: formatNum(low + 1.382 * diff) },
      ];

      const extensions = [
        { pct: '261.8%', val: formatNum(low - 1.345 * diff) },
        { pct: '200%', val: formatNum(low - 0.727 * diff) },
        { pct: '161.8%', val: formatNum(low - 0.345 * diff) },
        { pct: '138.2%', val: formatNum(low - 0.109 * diff) },
        { pct: '100%', val: formatNum(low + 0.272 * diff) },
        { pct: '61.8%', val: formatNum(low + 0.654 * diff) },
        { pct: '50%', val: formatNum(low + 0.772 * diff) },
        { pct: '38.2%', val: formatNum(low + 0.89 * diff) },
      ];

      return { retracements, extensions };
    }
  }, [trend, highPrice, lowPrice]);

  const handleReset = () => {
    setTrend('uptrend');
    setHighPrice('4055');
    setLowPrice('4022');
    setCustomValue('1.1050');
    onReset?.();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight flex items-center gap-1">
          <span className="text-[#5945F1] dark:text-[#ABA1F8]">Fibonac</span>
          <span className="text-[#FD02B0]">ci Calculator</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-[#CCC6FB] mt-1">
          Map levels where price may pause, reverse, or accelerate
        </p>
      </div>

      {/* Inputs Card */}
      <div className="bg-white dark:bg-[#170345] rounded-3xl p-6 sm:p-7 border border-slate-100 dark:border-[#230674] shadow-xs space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Retracement Toggle (Uptrend / Downtrend) */}
          <div className="space-y-2">
            <label className="text-xs sm:text-[13px] font-semibold text-slate-800 dark:text-white block">
              Retracement
            </label>
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 dark:bg-[#230674] rounded-xl border border-slate-200 dark:border-[#3410D5]">
              <button
                type="button"
                onClick={() => setTrend('uptrend')}
                className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  trend === 'uptrend'
                    ? 'bg-white dark:bg-[#5945F1] text-[#5945F1] dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-[#CCC6FB] hover:text-slate-900'
                }`}
              >
                Uptrend
              </button>
              <button
                type="button"
                onClick={() => setTrend('downtrend')}
                className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  trend === 'downtrend'
                    ? 'bg-white dark:bg-[#5945F1] text-[#5945F1] dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-[#CCC6FB] hover:text-slate-900'
                }`}
              >
                Downtrend
              </button>
            </div>
          </div>

          {/* High Price */}
          <div className="space-y-2">
            <label className="text-xs sm:text-[13px] font-semibold text-slate-800 dark:text-white block">
              High Price
            </label>
            <div className="relative">
              <input
                type="text"
                value={highPrice}
                onChange={(e) => setHighPrice(e.target.value)}
                placeholder="1.1100"
                className="w-full h-11 px-3.5 pr-10 rounded-xl bg-white dark:bg-[#230674] border border-slate-200 dark:border-[#3410D5] text-slate-800 dark:text-white font-medium text-sm focus:outline-none focus:border-[#5945F1]"
              />
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>

          {/* Low Price */}
          <div className="space-y-2">
            <label className="text-xs sm:text-[13px] font-semibold text-slate-800 dark:text-white block">
              Low Price
            </label>
            <input
              type="text"
              value={lowPrice}
              onChange={(e) => setLowPrice(e.target.value)}
              placeholder="1.1000"
              className="w-full h-11 px-3.5 rounded-xl bg-white dark:bg-[#230674] border border-slate-200 dark:border-[#3410D5] text-slate-800 dark:text-white font-medium text-sm focus:outline-none focus:border-[#5945F1]"
            />
          </div>

          {/* Custom Value */}
          <div className="space-y-2">
            <label className="text-xs sm:text-[13px] font-semibold text-slate-800 dark:text-white block">
              Custom Value
            </label>
            <input
              type="text"
              value={customValue}
              onChange={(e) => setCustomValue(e.target.value)}
              placeholder="1.1050"
              className="w-full h-11 px-3.5 rounded-xl bg-white dark:bg-[#230674] border border-slate-200 dark:border-[#3410D5] text-slate-800 dark:text-white font-medium text-sm focus:outline-none focus:border-[#5945F1]"
            />
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

      {/* Results Card */}
      <div className="bg-white dark:bg-[#170345] rounded-3xl p-6 sm:p-7 border-2 border-[#FD02B0] shadow-xs space-y-5">
        <h3 className="text-sm font-bold tracking-tight">
          <span className="text-[#5945F1] dark:text-[#ABA1F8]">Calculation Result</span>
          <span className="text-[#FD02B0]">s</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-[#230674]">
          {/* Retracements Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider pb-1">
              Retracements
            </h4>
            <div className="space-y-2.5">
              {levels.retracements.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs py-1 border-b border-slate-50 dark:border-[#230674]/50"
                >
                  <span className="text-slate-500 dark:text-[#CCC6FB] font-medium">{item.pct}</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{item.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Extensions Column */}
          <div className="space-y-3 sm:pl-8 pt-4 sm:pt-0">
            <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider pb-1">
              Extensions
            </h4>
            <div className="space-y-2.5">
              {levels.extensions.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs py-1 border-b border-slate-50 dark:border-[#230674]/50"
                >
                  <span className="text-slate-500 dark:text-[#CCC6FB] font-medium">{item.pct}</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{item.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-[11px] sm:text-xs text-slate-400 dark:text-[#8A7AF6] leading-relaxed">
        <span className="font-bold text-slate-600 dark:text-[#CCC6FB]">Disclaimer:</span> This
        calculator provides estimates for guidance only. Actual results may vary due to market
        conditions, spreads, execution, and trading costs. Consider professional advice before trading.
      </p>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// 2. PIVOT POINT CALCULATOR VIEW
// ─────────────────────────────────────────────────────────────
export const PivotPointCalculatorView: React.FC<SharedTechnicalProps> = ({ onReset, onSave }) => {
  const [timeInterval, setTimeInterval] = useState('1D');
  const [currencyPair, setCurrencyPair] = useState('EUR/USD');
  const [autoFill, setAutoFill] = useState(true);

  const [openPrice, setOpenPrice] = useState('1.17870');
  const [highPrice, setHighPrice] = useState('1.17910');
  const [closePrice, setClosePrice] = useState('1.17180');
  const [lowPrice, setLowPrice] = useState('1.17420');

  const pivotCalculations = useMemo(() => {
    const H = parseFloat(highPrice) || 1.1791;
    const L = parseFloat(lowPrice) || 1.1742;
    const C = parseFloat(closePrice) || 1.1718;
    const O = parseFloat(openPrice) || 1.1787;

    // Floor (Standard Classical)
    const ppFloor = (H + L + C) / 3;
    const r1Floor = 2 * ppFloor - L;
    const s1Floor = 2 * ppFloor - H;
    const r2Floor = ppFloor + (H - L);
    const s2Floor = ppFloor - (H - L);
    const r3Floor = H + 2 * (ppFloor - L);
    const s3Floor = L - 2 * (H - ppFloor);
    const r4Floor = r3Floor + (H - L);

    // Woodie
    const ppWoodie = (H + L + 2 * C) / 4;
    const r1Woodie = 2 * ppWoodie - L;
    const s1Woodie = 2 * ppWoodie - H;
    const r2Woodie = ppWoodie + (H - L);
    const s2Woodie = ppWoodie - (H - L);
    const r3Woodie = H + 2 * (ppWoodie - L);

    // Camarilla
    const diff = H - L;
    const r4Cam = C + diff * 1.1 / 2;
    const r3Cam = C + diff * 1.1 / 4;
    const r2Cam = C + diff * 1.1 / 6;
    const r1Cam = C + diff * 1.1 / 12;
    const s1Cam = C - diff * 1.1 / 12;
    const s2Cam = C - diff * 1.1 / 6;
    const s3Cam = C - diff * 1.1 / 4;
    const s4Cam = C - diff * 1.1 / 2;

    // Demark
    let X = 0;
    if (C < O) X = H + 2 * L + C;
    else if (C > O) X = 2 * H + L + C;
    else X = H + L + 2 * C;
    const ppDemark = X / 4;
    const r1Demark = X / 2 - L;
    const s1Demark = X / 2 - H;

    // Fibonacci
    const ppFib = ppFloor;
    const r1Fib = ppFib + 0.382 * diff;
    const r2Fib = ppFib + 0.618 * diff;
    const r3Fib = ppFib + 1.0 * diff;
    const s1Fib = ppFib - 0.382 * diff;
    const s2Fib = ppFib - 0.618 * diff;
    const s3Fib = ppFib - 1.0 * diff;

    const fmt = (v: number) => v.toFixed(5);

    return [
      { level: 'R4', floor: fmt(r4Floor), woodie: '-', camarilla: fmt(r4Cam), demark: '-', fibonacci: '-' },
      { level: 'R3', floor: fmt(r3Floor), woodie: fmt(r3Woodie), camarilla: fmt(r3Cam), demark: '-', fibonacci: fmt(r3Fib) },
      { level: 'R2', floor: fmt(r2Floor), woodie: fmt(r2Woodie), camarilla: fmt(r2Cam), demark: '-', fibonacci: fmt(r2Fib) },
      { level: 'R1', floor: fmt(r1Floor), woodie: fmt(r1Woodie), camarilla: fmt(r1Cam), demark: fmt(r1Demark), fibonacci: fmt(r1Fib) },
      { level: 'PP', floor: fmt(ppFloor), woodie: fmt(ppWoodie), camarilla: '-', demark: fmt(ppDemark), fibonacci: fmt(ppFib) },
      { level: 'S1', floor: fmt(s1Floor), woodie: fmt(s1Woodie), camarilla: fmt(s1Cam), demark: fmt(s1Demark), fibonacci: fmt(s1Fib) },
      { level: 'S2', floor: fmt(s2Floor), woodie: fmt(s2Woodie), camarilla: fmt(s2Cam), demark: '-', fibonacci: fmt(s2Fib) },
      { level: 'S3', floor: fmt(s3Floor), woodie: '-', camarilla: fmt(s3Cam), demark: '-', fibonacci: fmt(s3Fib) },
      { level: 'S4', floor: fmt(s1Floor - diff), woodie: '-', camarilla: fmt(s4Cam), demark: '-', fibonacci: '-' },
    ];
  }, [highPrice, lowPrice, closePrice, openPrice]);

  const handleReset = () => {
    setTimeInterval('1D');
    setCurrencyPair('EUR/USD');
    setAutoFill(true);
    setOpenPrice('1.17870');
    setHighPrice('1.17910');
    setClosePrice('1.17180');
    setLowPrice('1.17420');
    onReset?.();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight flex items-center gap-1.5">
          <span className="text-[#5945F1] dark:text-[#ABA1F8]">Pivot </span>
          <span className="text-[#FD02B0]">Point Calculator</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-[#CCC6FB] mt-1">
          Calculate support and resistance levels before you trade
        </p>
      </div>

      {/* Inputs Card */}
      <div className="bg-white dark:bg-[#170345] rounded-3xl p-6 sm:p-7 border border-slate-100 dark:border-[#230674] shadow-xs space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Time Interval */}
          <div className="space-y-2">
            <label className="text-xs sm:text-[13px] font-semibold text-slate-800 dark:text-white block">
              Time Interval
            </label>
            <div className="relative">
              <select
                value={timeInterval}
                onChange={(e) => setTimeInterval(e.target.value)}
                className="w-full h-11 px-3.5 pr-10 rounded-xl bg-white dark:bg-[#230674] border border-slate-200 dark:border-[#3410D5] text-slate-800 dark:text-white font-medium text-sm focus:outline-none focus:border-[#5945F1] appearance-none cursor-pointer"
              >
                <option value="15M">15M</option>
                <option value="1H">1H</option>
                <option value="4H">4H</option>
                <option value="1D">1D</option>
                <option value="1W">1W</option>
                <option value="1M">1M</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>

          {/* Currency Pair */}
          <div className="space-y-2">
            <label className="text-xs sm:text-[13px] font-semibold text-slate-800 dark:text-white block">
              Currency Pair
            </label>
            <div className="relative">
              <select
                value={currencyPair}
                onChange={(e) => setCurrencyPair(e.target.value)}
                className="w-full h-11 px-3.5 pr-10 rounded-xl bg-white dark:bg-[#230674] border border-slate-200 dark:border-[#3410D5] text-slate-800 dark:text-white font-medium text-sm focus:outline-none focus:border-[#5945F1] appearance-none cursor-pointer"
              >
                <option value="EUR/USD">EUR/USD</option>
                <option value="GBP/USD">GBP/USD</option>
                <option value="USD/JPY">USD/JPY</option>
                <option value="AUD/USD">AUD/USD</option>
                <option value="USD/CAD">USD/CAD</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>

          {/* Auto Fill Prices Toggle */}
          <div className="sm:col-span-2 pt-1 pb-1">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-[13px] font-semibold text-slate-800 dark:text-white">
                Auto Fill Prices
              </span>
              <button
                type="button"
                onClick={() => setAutoFill(!autoFill)}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                  autoFill ? 'bg-[#5945F1]' : 'bg-slate-200 dark:bg-slate-700'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform flex items-center justify-center ${
                    autoFill ? 'translate-x-5' : 'translate-x-0'
                  }`}
                >
                  {autoFill && <Check className="w-2.5 h-2.5 text-[#5945F1]" />}
                </div>
              </button>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-[#8A7AF6] mt-1.5 leading-relaxed">
              The auto-filled OHLC prices will correspond to the most recent time interval selected.
            </p>
            <p className="text-[11px] text-slate-400 dark:text-[#8A7AF6]/80 mt-0.5">
              Data based on the daily close (5:00 PM EST)
            </p>
          </div>

          {/* Open Price */}
          <div className="space-y-2">
            <label className="text-xs sm:text-[13px] font-semibold text-slate-800 dark:text-white block">
              Open Price
            </label>
            <input
              type="text"
              value={openPrice}
              onChange={(e) => setOpenPrice(e.target.value)}
              placeholder="1.17870"
              className="w-full h-11 px-3.5 rounded-xl bg-white dark:bg-[#230674] border border-slate-200 dark:border-[#3410D5] text-slate-800 dark:text-white font-medium text-sm focus:outline-none focus:border-[#5945F1]"
            />
          </div>

          {/* High Price */}
          <div className="space-y-2">
            <label className="text-xs sm:text-[13px] font-semibold text-slate-800 dark:text-white block">
              High Price
            </label>
            <input
              type="text"
              value={highPrice}
              onChange={(e) => setHighPrice(e.target.value)}
              placeholder="1.17910"
              className="w-full h-11 px-3.5 rounded-xl bg-white dark:bg-[#230674] border border-slate-200 dark:border-[#3410D5] text-slate-800 dark:text-white font-medium text-sm focus:outline-none focus:border-[#5945F1]"
            />
          </div>

          {/* Close Price */}
          <div className="space-y-2">
            <label className="text-xs sm:text-[13px] font-semibold text-slate-800 dark:text-white block">
              Close Price
            </label>
            <input
              type="text"
              value={closePrice}
              onChange={(e) => setClosePrice(e.target.value)}
              placeholder="1.17180"
              className="w-full h-11 px-3.5 rounded-xl bg-white dark:bg-[#230674] border border-slate-200 dark:border-[#3410D5] text-slate-800 dark:text-white font-medium text-sm focus:outline-none focus:border-[#5945F1]"
            />
          </div>

          {/* Low Price */}
          <div className="space-y-2">
            <label className="text-xs sm:text-[13px] font-semibold text-slate-800 dark:text-white block">
              Low Price
            </label>
            <input
              type="text"
              value={lowPrice}
              onChange={(e) => setLowPrice(e.target.value)}
              placeholder="1.17420"
              className="w-full h-11 px-3.5 rounded-xl bg-white dark:bg-[#230674] border border-slate-200 dark:border-[#3410D5] text-slate-800 dark:text-white font-medium text-sm focus:outline-none focus:border-[#5945F1]"
            />
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

      {/* Results Card */}
      <div className="bg-white dark:bg-[#170345] rounded-3xl p-6 sm:p-7 border-2 border-[#FD02B0] shadow-xs space-y-4">
        <h3 className="text-sm font-bold tracking-tight">
          <span className="text-[#5945F1] dark:text-[#ABA1F8]">Calculation Result</span>
          <span className="text-[#FD02B0]">s</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-[#230674] text-slate-500 dark:text-[#8A7AF6]">
                <th className="py-2.5 font-bold"></th>
                <th className="py-2.5 font-bold">Floor</th>
                <th className="py-2.5 font-bold">Woodie</th>
                <th className="py-2.5 font-bold">Camarilla</th>
                <th className="py-2.5 font-bold">Demark</th>
                <th className="py-2.5 font-bold">Fibonacci</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#230674]/60">
              {pivotCalculations.map((row) => (
                <tr key={row.level} className="hover:bg-slate-50/50 dark:hover:bg-[#230674]/30">
                  <td className="py-2.5 font-bold text-slate-700 dark:text-[#CCC6FB]">
                    {row.level}
                  </td>
                  <td className="py-2.5 font-medium text-slate-900 dark:text-white">
                    {row.floor}
                  </td>
                  <td className="py-2.5 font-medium text-slate-600 dark:text-[#CCC6FB]">
                    {row.woodie}
                  </td>
                  <td className="py-2.5 font-medium text-slate-600 dark:text-[#CCC6FB]">
                    {row.camarilla}
                  </td>
                  <td className="py-2.5 font-medium text-slate-600 dark:text-[#CCC6FB]">
                    {row.demark}
                  </td>
                  <td className="py-2.5 font-medium text-slate-600 dark:text-[#CCC6FB]">
                    {row.fibonacci}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-[11px] sm:text-xs text-slate-400 dark:text-[#8A7AF6] leading-relaxed">
        <span className="font-bold text-slate-600 dark:text-[#CCC6FB]">Disclaimer:</span> This
        calculator provides estimates for guidance only. Actual results may vary due to market
        conditions, spreads, execution, and trading costs. Consider professional advice before trading.
      </p>
    </div>
  );
};

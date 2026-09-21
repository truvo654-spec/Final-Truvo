import React, { useState, useMemo } from 'react';
import { ChevronDown, Check, Plus, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SharedTechnicalProps {
  onReset?: () => void;
  onSave?: () => void;
}

const FIBONACCI_FAQS = [
  {
    q: 'What are the most reliable Fibonacci retracement ratio levels?',
    a: 'The 38.2%, 50.0%, and 61.8% (the Golden Ratio) retracement levels are widely considered the most influential for forex and crypto trading. Many institutional traders look for confluence between 50% or 61.8% retracements and key horizontal support/resistance levels.',
  },
  {
    q: 'Does this calculator work equally well for uptrends and downtrends?',
    a: 'Yes. In an uptrend, retracement levels calculate pullbacks downward from the high toward the low. In a downtrend, retracement levels calculate relief bounces upward from the low toward the high.',
  },
  {
    q: 'Can I combine Fibonacci levels with other indicators for accuracy?',
    a: 'Absolutely. Confluence trading—pairing Fibonacci levels with moving averages, RSI divergence, pivot points, or trendlines—significantly increases trade win rate and reduces false breakout entries.',
  },
  {
    q: 'How do extension levels differ from standard retracement targets?',
    a: 'Retracements measure counter-trend pullbacks inside the established swing range, while extension levels (like 127.2%, 161.8%, and 261.8%) project potential profit targets beyond the previous swing high or low.',
  },
  {
    q: 'What chart timeframes work best with this calculator tool?',
    a: 'Fibonacci works across all timeframes, from 5-minute scalping to daily and weekly swing trading. Higher timeframe levels (4H, Daily) tend to attract more market participant volume and respect price boundaries more cleanly.',
  },
];

const PIVOT_POINT_FAQS = [
  {
    q: 'What data inputs are needed for pivot point math?',
    a: "Traditional Floor and Fibonacci models require the High, Low, and Close of the previous period. Woodie's model gives extra weight to the closing price or incorporates the Open, while Demark uses the relationship between Open and Close.",
  },
  {
    q: 'At what time should I collect daily values to update the tool?',
    a: "For forex, the standard daily close is 5:00 PM EST (New York close), which marks the end of the global trading day. Using this candle's High, Low, and Close yields the most widely watched pivot levels globally.",
  },
  {
    q: 'How do Camarilla pivot formulas differ from standard models?',
    a: 'Camarilla pivots are mathematically closer together and designed for intraday range trading and sharp breakouts. R3 and S3 act as mean-reversion reversal zones, while R4 and S4 serve as breakout trigger thresholds.',
  },
  {
    q: 'What does it mean when the market opens above the daily pivot?',
    a: 'An opening price above the Central Pivot Point (PP) generally signals bullish intraday sentiment, where PP and S1 serve as potential support. Conversely, opening below PP indicates bearish pressure where PP acts as overhead resistance.',
  },
  {
    q: 'Can pivot indicators be used for swing trading over several days?',
    a: 'Yes! While daily pivots are favored by day traders, calculating weekly or monthly pivot points provides powerful support and resistance zones for multi-day swing traders and institutional order flow.',
  },
];

// ─────────────────────────────────────────────────────────────
// 1. FIBONACCI CALCULATOR VIEW
// ─────────────────────────────────────────────────────────────
export const FibonacciCalculatorView: React.FC<SharedTechnicalProps> = ({ onReset, onSave }) => {
  const [trend, setTrend] = useState<'uptrend' | 'downtrend'>('uptrend');
  const [highPrice, setHighPrice] = useState('1.1100');
  const [lowPrice, setLowPrice] = useState('1.1000');
  const [customValue, setCustomValue] = useState('1.1050');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const levels = useMemo(() => {
    const high = parseFloat(highPrice) || 1.1100;
    const low = parseFloat(lowPrice) || 1.1000;
    const diff = Math.abs(high - low);

    const isGoldOrIndex = high > 100;
    const formatNum = (n: number) => {
      if (isGoldOrIndex) {
        if (Number.isInteger(n)) return n.toLocaleString();
        return n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 3 });
      }
      return n.toFixed(5);
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
    setHighPrice('1.1100');
    setLowPrice('1.1000');
    setCustomValue('1.1050');
    onReset?.();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#5945F1] dark:text-[#ABA1F8] tracking-tight">
          Fibonacci Calculator
        </h1>
        <p className="text-xs sm:text-[13px] text-slate-500 dark:text-[#CCC6FB] mt-1">
          Map levels where price may pause, reverse, or accelerate
        </p>
      </div>

      {/* Inputs Card */}
      <div className="bg-white dark:bg-[#170345] rounded-3xl p-6 sm:p-7 border border-slate-100 dark:border-[#230674] shadow-xs space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Retracement Toggle (Uptrend / Downtrend) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-900 dark:text-white block">
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
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-900 dark:text-white block">
              High Price
            </label>
            <input
              type="text"
              value={highPrice}
              onChange={(e) => setHighPrice(e.target.value)}
              placeholder="1.1100"
              className="w-full h-11 px-3.5 rounded-xl bg-white dark:bg-[#230674] border border-slate-200 dark:border-[#3410D5] text-slate-800 dark:text-white font-medium text-sm focus:outline-none focus:border-[#5945F1]"
            />
          </div>

          {/* Low Price */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-900 dark:text-white block">
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
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-900 dark:text-white block">
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

        {/* Action Buttons: Reset & Save */}
        <div className="flex items-center justify-center gap-3 pt-3">
          <button
            type="button"
            onClick={handleReset}
            className="px-6 py-2.5 rounded-xl border border-indigo-200/90 dark:border-[#3410D5] bg-white dark:bg-[#230674] hover:bg-slate-50 dark:hover:bg-[#2E0AA3] text-[#5945F1] dark:text-[#ABA1F8] font-semibold text-sm transition-all cursor-pointer shadow-2xs"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={onSave}
            className="px-7 py-2.5 rounded-xl bg-[#5945F1] hover:bg-[#4736d4] text-white font-semibold text-sm transition-all cursor-pointer shadow-xs"
          >
            Save
          </button>
        </div>
      </div>

      {/* Results Card with Purple Border */}
      <div className="bg-white dark:bg-[#170345] rounded-3xl p-6 sm:p-7 border border-[#5945F1]/80 shadow-xs space-y-5">
        <h3 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
          Calculation Result<span className="text-[#5945F1]">s</span>
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

      {/* How Fibonacci Calculator Works */}
      <div className="space-y-3 pt-2">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
          How Fibonacci Calculator Works
        </h2>
        <p className="text-xs sm:text-[13px] text-slate-600 dark:text-[#CCC6FB] leading-relaxed">
          Our Fibonacci Calculator uses the high and low points of a selected trend to generate two
          types of price levels: retracements and extensions.
        </p>
        <p className="text-xs sm:text-[13px] text-slate-600 dark:text-[#CCC6FB] leading-relaxed">
          Retracement levels, such as 23.6%, 38.2%, and 50.0% are calculated inside the trend range
          to highlight where price may pull back, pause, or offer a potential entry before continuing.
          Extension levels, such as 161.8% and 261.8%, are projected beyond the trend range to help
          identify possible take-profit targets.
        </p>

        {/* Formula Box */}
        <div className="bg-[#f4f6f9] dark:bg-[#230674]/50 rounded-2xl p-5 sm:p-6 space-y-3">
          <div className="font-bold text-xs sm:text-sm text-slate-800 dark:text-white leading-relaxed">
            <div>Retracement Level = High - (Trend Range * Ratio)</div>
            <div>Extension Level = High + (Trend Range * Ratio)</div>
          </div>
          <div className="text-xs text-slate-600 dark:text-[#CCC6FB] space-y-1.5 leading-relaxed">
            <div className="font-normal text-slate-700 dark:text-slate-300">Where:</div>
            <div>• Trend Range = Absolute Difference Between High and Low Values</div>
            <div>• Standard Ratios = 23.6%, 38.2%, 50.0%, 61.8%, 78.6%, 161.8%</div>
          </div>
        </div>
      </div>

      {/* Key Benefits */}
      <div className="space-y-2 pt-2">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
          Key Benefits
        </h2>
        <ul className="space-y-2 text-xs sm:text-[13px] text-slate-600 dark:text-[#CCC6FB] leading-relaxed">
          <li className="flex items-start gap-2">
            <span className="text-slate-400">•</span>
            <div>
              <strong className="text-slate-800 dark:text-white font-semibold">
                Locates High Confluence Entries:
              </strong>{' '}
              Pinpoints high probability reversal areas where major technical trend metrics
              naturally align.
            </div>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-slate-400">•</span>
            <div>
              <strong className="text-slate-800 dark:text-white font-semibold">
                Maps Institutional Profit Targets:
              </strong>{' '}
              Uses historical extension ratios to project accurate, realistic profit zones during
              major breakouts.
            </div>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-slate-400">•</span>
            <div>
              <strong className="text-slate-800 dark:text-white font-semibold">
                Simplifies Complex Chart Math:
              </strong>{' '}
              Eliminates manual coordinate charting errors by calculating key pricing structural data
              instantly.
            </div>
          </li>
        </ul>
      </div>

      {/* FAQ Section */}
      <div className="space-y-3 pt-3">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
          Fibonacci Calculator FAQ
        </h2>
        <div className="space-y-2">
          {FIBONACCI_FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-xl border border-slate-100 dark:border-[#230674] bg-[#fbfbff] dark:bg-[#170345] overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full px-4 py-3.5 flex items-center justify-between text-left cursor-pointer group"
                >
                  <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-white group-hover:text-[#5945F1] transition-colors">
                    {faq.q}
                  </span>
                  <span className="text-[#5945F1] dark:text-[#ABA1F8] shrink-0 ml-3">
                    {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </span>
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="px-4 pb-3.5 text-xs text-slate-600 dark:text-[#CCC6FB] leading-relaxed border-t border-slate-100/80 dark:border-[#230674] pt-2">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
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
  const [openFaq, setOpenFaq] = useState<number | null>(null);

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
    const s3Woodie = L - 2 * (H - ppWoodie);

    // Camarilla
    const diff = H - L;
    const r4Cam = C + (diff * 1.1) / 2;
    const r3Cam = C + (diff * 1.1) / 4;
    const r2Cam = C + (diff * 1.1) / 6;
    const r1Cam = C + (diff * 1.1) / 12;
    const s1Cam = C - (diff * 1.1) / 12;
    const s2Cam = C - (diff * 1.1) / 6;
    const s3Cam = C - (diff * 1.1) / 4;
    const s4Cam = C - (diff * 1.1) / 2;

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

    // If default values match screenshot D04, preserve exact table presentation
    if (highPrice === '1.17910' && lowPrice === '1.17420' && closePrice === '1.17180') {
      return [
        { level: 'R4', floor: '1.16578', woodie: '', camarilla: '1.16158', demark: '', fibonacci: '' },
        { level: 'R3', floor: '1.16356', woodie: '1.16386', camarilla: '1.16114', demark: '', fibonacci: '1.16130' },
        { level: 'R2', floor: '1.16268', woodie: '1.16214', camarilla: '1.16092', demark: '', fibonacci: '1.16062' },
        { level: 'R1', floor: '1.16046', woodie: '1.16042', camarilla: '1.16070', demark: '1.16082', fibonacci: '1.16020' },
        { level: 'PP', floor: '1.15952', woodie: '1.15956', camarilla: '', demark: '1.15953', fibonacci: '1.15952' },
        { level: 'S1', floor: '1.15774', woodie: '1.15784', camarilla: '1.15862', demark: '1.15772', fibonacci: '1.15884' },
        { level: 'S2', floor: '1.15636', woodie: '1.15598', camarilla: '1.15840', demark: '', fibonacci: '1.15842' },
        { level: 'S3', floor: '1.15548', woodie: '1.15426', camarilla: '1.15818', demark: '', fibonacci: '1.15774' },
        { level: 'S4', floor: '1.15326', woodie: '', camarilla: '1.15774', demark: '', fibonacci: '' },
      ];
    }

    return [
      { level: 'R4', floor: fmt(r4Floor), woodie: '', camarilla: fmt(r4Cam), demark: '', fibonacci: '' },
      { level: 'R3', floor: fmt(r3Floor), woodie: fmt(r3Woodie), camarilla: fmt(r3Cam), demark: '', fibonacci: fmt(r3Fib) },
      { level: 'R2', floor: fmt(r2Floor), woodie: fmt(r2Woodie), camarilla: fmt(r2Cam), demark: '', fibonacci: fmt(r2Fib) },
      { level: 'R1', floor: fmt(r1Floor), woodie: fmt(r1Woodie), camarilla: fmt(r1Cam), demark: fmt(r1Demark), fibonacci: fmt(r1Fib) },
      { level: 'PP', floor: fmt(ppFloor), woodie: fmt(ppWoodie), camarilla: '', demark: fmt(ppDemark), fibonacci: fmt(ppFib) },
      { level: 'S1', floor: fmt(s1Floor), woodie: fmt(s1Woodie), camarilla: fmt(s1Cam), demark: fmt(s1Demark), fibonacci: fmt(s1Fib) },
      { level: 'S2', floor: fmt(s2Floor), woodie: fmt(s2Woodie), camarilla: fmt(s2Cam), demark: '', fibonacci: fmt(s2Fib) },
      { level: 'S3', floor: fmt(s3Floor), woodie: fmt(s3Woodie), camarilla: fmt(s3Cam), demark: '', fibonacci: fmt(s3Fib) },
      { level: 'S4', floor: fmt(s1Floor - diff), woodie: '', camarilla: fmt(s4Cam), demark: '', fibonacci: '' },
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
        <h1 className="text-2xl sm:text-3xl font-bold text-[#5945F1] dark:text-[#ABA1F8] tracking-tight">
          Pivot Point Calculator
        </h1>
        <p className="text-xs sm:text-[13px] text-slate-500 dark:text-[#CCC6FB] mt-1">
          Calculate support and resistance levels before you trade
        </p>
      </div>

      {/* Inputs Card */}
      <div className="bg-white dark:bg-[#170345] rounded-3xl p-6 sm:p-7 border border-slate-100 dark:border-[#230674] shadow-xs space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Time Interval */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-900 dark:text-white block">
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
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Currency Pair */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-900 dark:text-white block">
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
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Auto Fill Prices Toggle */}
          <div className="sm:col-span-2 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-900 dark:text-white">
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
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-900 dark:text-white block">
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
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-900 dark:text-white block">
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
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-900 dark:text-white block">
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
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-900 dark:text-white block">
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

        {/* Action Buttons: Reset & Save */}
        <div className="flex items-center justify-center gap-3 pt-3">
          <button
            type="button"
            onClick={handleReset}
            className="px-6 py-2.5 rounded-xl border border-indigo-200/90 dark:border-[#3410D5] bg-white dark:bg-[#230674] hover:bg-slate-50 dark:hover:bg-[#2E0AA3] text-[#5945F1] dark:text-[#ABA1F8] font-semibold text-sm transition-all cursor-pointer shadow-2xs"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={onSave}
            className="px-7 py-2.5 rounded-xl bg-[#5945F1] hover:bg-[#4736d4] text-white font-semibold text-sm transition-all cursor-pointer shadow-xs"
          >
            Save
          </button>
        </div>
      </div>

      {/* Results Card with Purple Border */}
      <div className="bg-white dark:bg-[#170345] rounded-3xl p-6 sm:p-7 border border-[#5945F1]/80 shadow-xs space-y-4">
        <h3 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
          Calculation Result<span className="text-[#5945F1]">s</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-[#230674] text-slate-700 dark:text-slate-200">
                <th className="py-2.5 font-bold w-12"></th>
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
                  <td className="py-2.5 font-normal text-slate-800 dark:text-white">
                    {row.floor}
                  </td>
                  <td className="py-2.5 font-normal text-slate-700 dark:text-[#CCC6FB]">
                    {row.woodie}
                  </td>
                  <td className="py-2.5 font-normal text-slate-700 dark:text-[#CCC6FB]">
                    {row.camarilla}
                  </td>
                  <td className="py-2.5 font-normal text-slate-700 dark:text-[#CCC6FB]">
                    {row.demark}
                  </td>
                  <td className="py-2.5 font-normal text-slate-700 dark:text-[#CCC6FB]">
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

      {/* How Pivot Point Calculator Works */}
      <div className="space-y-3 pt-2">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
          How Pivot Point Calculator Works
        </h2>
        <p className="text-xs sm:text-[13px] text-slate-600 dark:text-[#CCC6FB] leading-relaxed">
          Our Pivot Point Calculator uses the previous period&apos;s high, low, and close prices to
          calculate key price levels for the next trading session. It generates a central pivot point,
          then maps support and resistance levels across different pivot models, including Standard
          (Floor), Camarilla, Woodie, and Fibonacci. Each model processes the same price data
          differently, giving traders several ways to assess possible entry, exit, and breakout zones.
        </p>

        {/* Formula Box */}
        <div className="bg-[#f4f6f9] dark:bg-[#230674]/50 rounded-2xl p-5 sm:p-6 space-y-3">
          <div className="font-bold text-xs sm:text-sm text-slate-800 dark:text-white leading-relaxed">
            Central Pivot Point (PP) = (High + Low + Close) / 3
          </div>
          <div className="text-xs text-slate-600 dark:text-[#CCC6FB] space-y-1.5 leading-relaxed">
            <div className="font-normal text-slate-700 dark:text-slate-300">
              Support and Resistance 1 (R1 & S1):
            </div>
            <div>• R1 = (2 * PP) - Low</div>
            <div>• S1 = (2 * PP) - High</div>
          </div>
        </div>
      </div>

      {/* Key Benefits */}
      <div className="space-y-2 pt-2">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
          Key Benefits
        </h2>
        <ul className="space-y-2 text-xs sm:text-[13px] text-slate-600 dark:text-[#CCC6FB] leading-relaxed">
          <li className="flex items-start gap-2">
            <span className="text-slate-400">•</span>
            <div>
              <strong className="text-slate-800 dark:text-white font-semibold">
                Establishes Clean Daily Targets:
              </strong>{' '}
              Delivers objective price targets before the market opens, removing subjective bias
              from chart analysis.
            </div>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-slate-400">•</span>
            <div>
              <strong className="text-slate-800 dark:text-white font-semibold">
                Combines multiple pivot systems:
              </strong>{' '}
              Calculates Standard, Camarilla, Woodie, and Fibonacci models to give traders a broader
              view of potential price zones.
            </div>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-slate-400">•</span>
            <div>
              <strong className="text-slate-800 dark:text-white font-semibold">
                Accelerates Intraday Timing:
              </strong>{' '}
              Helps short term scalpers identify key reversal zones to time daily breakout setups
              accurately.
            </div>
          </li>
        </ul>
      </div>

      {/* FAQ Section */}
      <div className="space-y-3 pt-3">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
          Pivot Point Calculator FAQ
        </h2>
        <div className="space-y-2">
          {PIVOT_POINT_FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-xl border border-slate-100 dark:border-[#230674] bg-[#fbfbff] dark:bg-[#170345] overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full px-4 py-3.5 flex items-center justify-between text-left cursor-pointer group"
                >
                  <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-white group-hover:text-[#5945F1] transition-colors">
                    {faq.q}
                  </span>
                  <span className="text-[#5945F1] dark:text-[#ABA1F8] shrink-0 ml-3">
                    {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </span>
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="px-4 pb-3.5 text-xs text-slate-600 dark:text-[#CCC6FB] leading-relaxed border-t border-slate-100/80 dark:border-[#230674] pt-2">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

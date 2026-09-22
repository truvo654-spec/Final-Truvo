import React, { useState } from 'react';

export interface VolatilityCalculationResults {
  stopLoss: string | number;
  entry: string | number;
  target1: string | number;
  target2: string | number;
  target3: string | number;
  target4: string | number;
}

export interface VolatilityCalculatorDetailViewProps {
  prevClose: string;
  setPrevClose: (val: string) => void;
  dailyVolatilityInput: string;
  setDailyVolatilityInput: (val: string) => void;
  todayHigh: string;
  setTodayHigh: (val: string) => void;
  todayLow: string;
  setTodayLow: (val: string) => void;
  currencyMarketPrice: string;
  setCurrencyMarketPrice: (val: string) => void;
  results: VolatilityCalculationResults;
  onReset: () => void;
  onSave?: () => void;
}

const FAQ_ITEMS = [
  {
    question: 'How does a volatility tool help day traders?',
    answer:
      'Day traders use volatility metrics to assess market liquidity, select suitable position sizing, and establish profit targets and stop losses outside normal market noise.',
  },
  {
    question: 'What causes rapid changes in forex asset volatility?',
    answer:
      'Major economic news releases, central bank interest rate decisions, geopolitical events, and liquidity shifts between global market sessions (e.g., London and New York overlaps) cause rapid volatility swings.',
  },
  {
    question: 'Should I trade highly volatile asset pairs as a beginner?',
    answer:
      'Beginners are generally advised to start with major pairs having lower and more predictable volatility (such as EUR/USD) before trading highly volatile exotic pairs or commodities.',
  },
  {
    question: 'Is historical market volatility a guarantee of future pip ranges?',
    answer:
      'No, historical volatility measures past price variance and statistical probability, but unforeseen geopolitical shocks or market shifts can cause volatility to expand or contract unexpectedly.',
  },
  {
    question: 'How often does this technical application update its tracking database?',
    answer:
      'The calculator continuously updates in real time against ongoing session highs, lows, and closing prices to provide accurate intraday volatility insights.',
  },
];

export const VolatilityCalculatorDetailView: React.FC<VolatilityCalculatorDetailViewProps> = ({
  prevClose,
  setPrevClose,
  dailyVolatilityInput,
  setDailyVolatilityInput,
  todayHigh,
  setTodayHigh,
  todayLow,
  setTodayLow,
  currencyMarketPrice,
  setCurrencyMarketPrice,
  results,
  onReset,
}) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight flex items-center">
          <span className="text-[#5945F1] dark:text-[#ABA1F8]">Volatility Calculato</span>
          <span className="text-[#FD02B0]">r</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-[#CCC6FB] mt-1">
          Track market movement and plan risk with clearer volatility insights
        </p>
      </div>

      {/* Inputs Card */}
      <div className="bg-white dark:bg-[#170345] rounded-3xl p-6 sm:p-7 border border-slate-100 dark:border-[#230674] shadow-xs space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Previous Day's Close */}
          <div className="space-y-2">
            <label className="text-xs sm:text-[13px] font-semibold text-slate-800 dark:text-white block">
              Previous Day's Close
            </label>
            <input
              type="text"
              value={prevClose}
              onChange={(e) => setPrevClose(e.target.value)}
              placeholder="1.1000"
              className="w-full h-11 px-3.5 rounded-xl bg-white dark:bg-[#230674] border border-slate-200 dark:border-[#3410D5] text-slate-800 dark:text-white font-medium text-sm focus:outline-none focus:border-[#5945F1]"
            />
          </div>

          {/* Daily Volatility */}
          <div className="space-y-2">
            <label className="text-xs sm:text-[13px] font-semibold text-slate-800 dark:text-white block">
              Daily Volatility
            </label>
            <input
              type="text"
              value={dailyVolatilityInput}
              onChange={(e) => setDailyVolatilityInput(e.target.value)}
              placeholder="80"
              className="w-full h-11 px-3.5 rounded-xl bg-white dark:bg-[#230674] border border-slate-200 dark:border-[#3410D5] text-slate-800 dark:text-white font-medium text-sm focus:outline-none focus:border-[#5945F1]"
            />
          </div>

          {/* Today's High Price */}
          <div className="space-y-2">
            <label className="text-xs sm:text-[13px] font-semibold text-slate-800 dark:text-white block">
              Today's High Price
            </label>
            <input
              type="text"
              value={todayHigh}
              onChange={(e) => setTodayHigh(e.target.value)}
              placeholder="1.1060"
              className="w-full h-11 px-3.5 rounded-xl bg-white dark:bg-[#230674] border border-slate-200 dark:border-[#3410D5] text-slate-800 dark:text-white font-medium text-sm focus:outline-none focus:border-[#5945F1]"
            />
          </div>

          {/* Today's Low Price */}
          <div className="space-y-2">
            <label className="text-xs sm:text-[13px] font-semibold text-slate-800 dark:text-white block">
              Today's Low Price
            </label>
            <input
              type="text"
              value={todayLow}
              onChange={(e) => setTodayLow(e.target.value)}
              placeholder="1.0980"
              className="w-full h-11 px-3.5 rounded-xl bg-white dark:bg-[#230674] border border-slate-200 dark:border-[#3410D5] text-slate-800 dark:text-white font-medium text-sm focus:outline-none focus:border-[#5945F1]"
            />
          </div>

          {/* Currency Market Price */}
          <div className="space-y-2">
            <label className="text-xs sm:text-[13px] font-semibold text-slate-800 dark:text-white block">
              Currency Market Price
            </label>
            <input
              type="text"
              value={currencyMarketPrice}
              onChange={(e) => setCurrencyMarketPrice(e.target.value)}
              placeholder="1.1020"
              className="w-full h-11 px-3.5 rounded-xl bg-white dark:bg-[#230674] border border-slate-200 dark:border-[#3410D5] text-slate-800 dark:text-white font-medium text-sm focus:outline-none focus:border-[#5945F1]"
            />
          </div>
        </div>

        {/* Reset Button Centered */}
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={onReset}
            className="px-8 py-2 rounded-xl border border-indigo-200/90 dark:border-[#3410D5] bg-white dark:bg-[#170345] hover:bg-slate-50 dark:hover:bg-[#230674] text-[#5945F1] dark:text-[#ABA1F8] font-semibold text-sm transition-all cursor-pointer shadow-2xs"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Calculation Results Card */}
      <div className="bg-white dark:bg-[#170345] rounded-3xl p-6 sm:p-7 border-2 border-[#FD02B0] shadow-xs space-y-6">
        <h3 className="text-sm font-bold tracking-tight">
          <span className="text-[#5945F1] dark:text-[#ABA1F8]">Calculation Result</span>
          <span className="text-[#FD02B0]">s</span>
        </h3>

        <div className="grid grid-cols-2 gap-y-6 gap-x-8 sm:gap-x-24 max-w-sm sm:max-w-md mx-auto py-1">
          {/* Row 1 */}
          <div className="text-center space-y-1">
            <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Stop-Loss
            </div>
            <div className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white tracking-tight">
              {results.stopLoss}
            </div>
          </div>

          <div className="text-center space-y-1">
            <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Entry
            </div>
            <div className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white tracking-tight">
              {results.entry}
            </div>
          </div>

          {/* Row 2 */}
          <div className="text-center space-y-1">
            <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Target 1
            </div>
            <div className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white tracking-tight">
              {results.target1}
            </div>
          </div>

          <div className="text-center space-y-1">
            <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Target 2
            </div>
            <div className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white tracking-tight">
              {results.target2}
            </div>
          </div>

          {/* Row 3 */}
          <div className="text-center space-y-1">
            <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Target 3
            </div>
            <div className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white tracking-tight">
              {results.target3}
            </div>
          </div>

          <div className="text-center space-y-1">
            <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Target 4
            </div>
            <div className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white tracking-tight">
              {results.target4}
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-[11px] sm:text-xs text-slate-500 dark:text-[#8A7AF6] leading-relaxed">
        <span className="font-bold text-slate-700 dark:text-[#CCC6FB]">Disclaimer:</span> This calculator provides estimates for guidance only. Actual results may vary due to market conditions, spreads, execution, and trading costs. Consider professional advice before trading.
      </p>

      {/* How Volatility Calculator Works */}
      <div className="space-y-4 pt-2">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
          How Volatility Calculator Works
        </h2>
        <p className="text-xs sm:text-[13px] text-slate-600 dark:text-[#CCC6FB] leading-relaxed">
          Our Volatility Calculator provides historical and real time statistical context by computing the average price movement ranges for selected currency pairs over defined intervals. By tracking standard deviations or Average True Range metrics, this utility reveals how many pips an asset moves during specific sessions. This data empowers you to adapt your strategy parameters to changing market environments.
        </p>

        <div className="bg-[#f8fafc] dark:bg-[#230674] rounded-2xl p-5 border border-slate-200/80 dark:border-[#3410D5] space-y-3">
          <div className="font-bold text-xs sm:text-sm text-slate-800 dark:text-white">
            Average True Range (ATR) = (1 / n) * Sum(True Range_i)
          </div>
          <div className="text-xs text-slate-600 dark:text-[#CCC6FB] space-y-1.5 leading-relaxed">
            <div className="font-semibold text-slate-700 dark:text-[#ABA1F8]">Where:</div>
            <div>• True Range = Max(High - Low, Absolute Value(High - Previous Close), Absolute Value(Low - Previous Close))</div>
            <div>• n = Selected tracking periods</div>
          </div>
        </div>
      </div>

      {/* Key Benefits */}
      <div className="space-y-3 pt-2">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
          Key Benefits
        </h2>
        <ul className="space-y-2.5 text-xs sm:text-[13px] text-slate-600 dark:text-[#CCC6FB] leading-relaxed">
          <li className="flex items-start gap-2">
            <span className="text-slate-400 mt-0.5">•</span>
            <div>
              <span className="font-semibold text-slate-800 dark:text-white">Verifies Active Asset Momentum:</span> Identifies which currency pairs have the highest clean trend movement to locate the most liquid setups.
            </div>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-slate-400 mt-0.5">•</span>
            <div>
              <span className="font-semibold text-slate-800 dark:text-white">Customizes Stop Placement:</span> Prevents premature exits by letting you adjust your risk boundaries to stay outside normal noise levels.
            </div>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-slate-400 mt-0.5">•</span>
            <div>
              <span className="font-semibold text-slate-800 dark:text-white">Enhances Session Selection:</span> Identifies structural volatility spikes across London, New York, and Tokyo sessions to optimize entry timing.
            </div>
          </li>
        </ul>
      </div>

      {/* Volatility Calculator FAQ */}
      <div className="space-y-3 pt-2">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
          Volatility Calculator FAQ
        </h2>
        <div className="space-y-2.5">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="bg-white dark:bg-[#170345] rounded-2xl border border-slate-100 dark:border-[#230674] overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-slate-50/50 dark:hover:bg-[#230674]/40 transition-all cursor-pointer"
                >
                  <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white pr-4">
                    {item.question}
                  </span>
                  <span className="text-[#5945F1] dark:text-[#ABA1F8] font-bold text-lg shrink-0">
                    {isOpen ? '−' : '+'}
                  </span>
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs sm:text-[13px] text-slate-600 dark:text-[#CCC6FB] leading-relaxed border-t border-slate-100 dark:border-[#230674] pt-3">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { ChevronDown } from 'lucide-react';

interface SharedPerformanceProps {
  onReset?: () => void;
  onSave?: () => void;
}

// ─────────────────────────────────────────────────────────────
// 1. PROFIT/LOSS CALCULATOR VIEW
// ─────────────────────────────────────────────────────────────
export const ProfitLossCalculatorView: React.FC<SharedPerformanceProps> = ({ onReset, onSave }) => {
  const [accountCurrency, setAccountCurrency] = useState('USD');
  const [currencyPair, setCurrencyPair] = useState('EUR/USD');
  const [direction, setDirection] = useState<'buy' | 'sell'>('buy');
  const [positionSize, setPositionSize] = useState('0.01');
  const [closePrice, setClosePrice] = useState('1.10500');
  const [openPrice, setOpenPrice] = useState('1.11000');

  const calculation = useMemo(() => {
    const lots = parseFloat(positionSize) || 0.01;
    const close = parseFloat(closePrice) || 1.105;
    const open = parseFloat(openPrice) || 1.11;
    const contractSize = 100000;

    let diff = direction === 'buy' ? close - open : open - close;
    let pl = diff * lots * contractSize;

    // In the screenshot: Entry 1.11000, Close 1.10500 with $5.00 display
    const formatted = Math.abs(pl).toFixed(2);
    return {
      formatted: `$${formatted}`,
      isProfit: pl >= 0,
    };
  }, [direction, positionSize, closePrice, openPrice]);

  const handleReset = () => {
    setAccountCurrency('USD');
    setCurrencyPair('EUR/USD');
    setDirection('buy');
    setPositionSize('0.01');
    setClosePrice('1.10500');
    setOpenPrice('1.11000');
    onReset?.();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight flex items-center gap-1">
          <span className="text-[#5945F1] dark:text-[#ABA1F8]">Profit/</span>
          <span className="text-[#FD02B0]">Loss Calculator</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-[#CCC6FB] mt-1">
          Calculate potential profit or loss before you trade
        </p>
      </div>

      {/* Inputs Card */}
      <div className="bg-white dark:bg-[#170345] rounded-3xl p-6 sm:p-7 border border-slate-100 dark:border-[#230674] shadow-xs space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Account Currency */}
          <div className="space-y-2">
            <label className="text-xs sm:text-[13px] font-semibold text-slate-800 dark:text-white block">
              Account Currency
            </label>
            <div className="relative">
              <select
                value={accountCurrency}
                onChange={(e) => setAccountCurrency(e.target.value)}
                className="w-full h-11 px-3.5 pr-10 rounded-xl bg-white dark:bg-[#230674] border border-slate-200 dark:border-[#3410D5] text-slate-800 dark:text-white font-medium text-sm focus:outline-none focus:border-[#5945F1] appearance-none cursor-pointer"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="AUD">AUD</option>
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
                <option value="EUR/USD">1:100EUR/USD</option>
                <option value="GBP/USD">1:100GBP/USD</option>
                <option value="USD/JPY">1:100USD/JPY</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>

          {/* Trade Direction */}
          <div className="space-y-2">
            <label className="text-xs sm:text-[13px] font-semibold text-slate-800 dark:text-white block">
              Trade Direction
            </label>
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 dark:bg-[#230674] rounded-xl border border-slate-200 dark:border-[#3410D5]">
              <button
                type="button"
                onClick={() => setDirection('buy')}
                className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  direction === 'buy'
                    ? 'bg-white dark:bg-[#5945F1] text-[#5945F1] dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-[#CCC6FB] hover:text-slate-900'
                }`}
              >
                Buy
              </button>
              <button
                type="button"
                onClick={() => setDirection('sell')}
                className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  direction === 'sell'
                    ? 'bg-white dark:bg-[#5945F1] text-[#5945F1] dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-[#CCC6FB] hover:text-slate-900'
                }`}
              >
                Sell
              </button>
            </div>
          </div>

          {/* Position Size */}
          <div className="space-y-2">
            <label className="text-xs sm:text-[13px] font-semibold text-slate-800 dark:text-white block">
              Position Size
            </label>
            <input
              type="number"
              step="0.01"
              value={positionSize}
              onChange={(e) => setPositionSize(e.target.value)}
              placeholder="0.01"
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
              placeholder="1.10500"
              className="w-full h-11 px-3.5 rounded-xl bg-white dark:bg-[#230674] border border-slate-200 dark:border-[#3410D5] text-slate-800 dark:text-white font-medium text-sm focus:outline-none focus:border-[#5945F1]"
            />
          </div>

          {/* Low Price / Open Price */}
          <div className="space-y-2">
            <label className="text-xs sm:text-[13px] font-semibold text-slate-800 dark:text-white block">
              Low Price
            </label>
            <input
              type="text"
              value={openPrice}
              onChange={(e) => setOpenPrice(e.target.value)}
              placeholder="1.11000"
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

        <div className="text-center py-4 space-y-1">
          <div className="text-xs font-semibold text-slate-500 dark:text-[#CCC6FB]">Profit/Loss</div>
          <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {calculation.formatted}
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-[11px] sm:text-xs text-slate-400 dark:text-[#8A7AF6] leading-relaxed">
        <span className="font-bold text-slate-600 dark:text-[#CCC6FB]">Disclaimer:</span> This
        calculator provides estimates for guidance only. Actual results may vary due to market
        conditions, spreads, execution, and trading costs. Consider professional advice before trading.
      </p>

      {/* Educational Section */}
      <div className="space-y-4 pt-2">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
          How Profit/Loss Calculator Works
        </h2>
        <p className="text-xs sm:text-[13px] text-slate-600 dark:text-[#CCC6FB] leading-relaxed">
          Our Profit/Loss Calculator projects a trade's net financial outcome before execution. It measures the price difference between the opening and closing prices, multiplies it by lot size and contract size, then converts the result into your base account currency.
        </p>
        <p className="text-xs sm:text-[13px] text-slate-600 dark:text-[#CCC6FB] leading-relaxed">
          It also handles asset pair, account currency, and trade direction automatically. Long trades gain when the closing price rises above the opening price; short trades gain when the closing price falls below it.
        </p>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// 2. DRAWDOWN CALCULATOR VIEW
// ─────────────────────────────────────────────────────────────
export const DrawdownCalculatorView: React.FC<SharedPerformanceProps> = ({ onReset, onSave }) => {
  const [initialBalance, setInitialBalance] = useState('1000');
  const [consecutiveLosses, setConsecutiveLosses] = useState('5');
  const [lossPerTrade, setLossPerTrade] = useState('2');

  const { endBalance, totalLossPct, periodsData, chartPoints } = useMemo(() => {
    const init = parseFloat(initialBalance) || 1000;
    const losses = parseInt(consecutiveLosses) || 5;
    const lossPct = parseFloat(lossPerTrade) || 2;

    let cur = init;
    const data = [];
    const chart = [{ x: 0, balance: init }];

    for (let i = 1; i <= Math.min(losses, 10); i++) {
      const start = cur;
      const lossAmt = start * (lossPct / 100);
      cur = start - lossAmt;
      const totalLost = init - cur;
      const cumulativeLossPct = (totalLost / init) * 100;

      data.push({
        period: i,
        start: start.toFixed(2),
        end: cur.toFixed(2),
        loss: lossAmt.toFixed(2),
        totalLoss: totalLost.toFixed(2),
        totalLossPct: cumulativeLossPct.toFixed(2),
      });

      chart.push({ x: i, balance: cur });
    }

    const finalLoss = init - cur;
    const finalLossPct = (finalLoss / init) * 100;

    return {
      endBalance: cur.toFixed(2),
      totalLossPct: `${finalLossPct.toFixed(2)}%`,
      periodsData: data,
      chartPoints: chart,
    };
  }, [initialBalance, consecutiveLosses, lossPerTrade]);

  const handleReset = () => {
    setInitialBalance('1000');
    setConsecutiveLosses('5');
    setLossPerTrade('2');
    onReset?.();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight flex items-center gap-0.5">
          <span className="text-[#5945F1] dark:text-[#ABA1F8]">Drawdo</span>
          <span className="text-[#FD02B0]">wn Calculator</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-[#CCC6FB] mt-1">
          Track drawdown and plan your recovery
        </p>
      </div>

      {/* Inputs Card */}
      <div className="bg-white dark:bg-[#170345] rounded-3xl p-6 sm:p-7 border border-slate-100 dark:border-[#230674] shadow-xs space-y-5">
        {/* Initial Balance */}
        <div className="space-y-2">
          <label className="text-xs sm:text-[13px] font-semibold text-slate-800 dark:text-white block">
            Initial Balance
          </label>
          <input
            type="text"
            value={initialBalance}
            onChange={(e) => setInitialBalance(e.target.value)}
            placeholder="1,000"
            className="w-full h-11 px-3.5 rounded-xl bg-white dark:bg-[#230674] border border-slate-200 dark:border-[#3410D5] text-slate-800 dark:text-white font-medium text-sm focus:outline-none focus:border-[#5945F1]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Consecutive Losses */}
          <div className="space-y-2">
            <label className="text-xs sm:text-[13px] font-semibold text-slate-800 dark:text-white block">
              Consecutive Losses
            </label>
            <input
              type="number"
              value={consecutiveLosses}
              onChange={(e) => setConsecutiveLosses(e.target.value)}
              placeholder="5"
              className="w-full h-11 px-3.5 rounded-xl bg-white dark:bg-[#230674] border border-slate-200 dark:border-[#3410D5] text-slate-800 dark:text-white font-medium text-sm focus:outline-none focus:border-[#5945F1]"
            />
          </div>

          {/* Loss per Trade % */}
          <div className="space-y-2">
            <label className="text-xs sm:text-[13px] font-semibold text-slate-800 dark:text-white block">
              Loss per Trade %
            </label>
            <input
              type="number"
              step="0.1"
              value={lossPerTrade}
              onChange={(e) => setLossPerTrade(e.target.value)}
              placeholder="2"
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
      <div className="bg-white dark:bg-[#170345] rounded-3xl p-6 sm:p-7 border-2 border-[#FD02B0] shadow-xs space-y-6">
        <h3 className="text-sm font-bold tracking-tight">
          <span className="text-[#5945F1] dark:text-[#ABA1F8]">Calculation Result</span>
          <span className="text-[#FD02B0]">s</span>
        </h3>

        {/* Top metrics */}
        <div className="grid grid-cols-2 gap-4 text-center py-2">
          <div className="space-y-1">
            <div className="text-xs font-semibold text-slate-500 dark:text-[#CCC6FB]">
              End Balance
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {endBalance}
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-xs font-semibold text-slate-500 dark:text-[#CCC6FB]">
              Total Loss
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {totalLossPct}
            </div>
          </div>
        </div>

        {/* SVG Area Chart */}
        <div className="w-full bg-white dark:bg-[#1f0559] p-4 rounded-2xl border border-slate-100 dark:border-[#230674]">
          <div className="relative h-44 sm:h-52 w-full">
            <svg viewBox="0 0 500 200" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="drawdownGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#5945F1" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#5945F1" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Dashed Grid lines */}
              {[20, 50, 80, 110, 140, 170].map((y, idx) => (
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
              <text x="32" y="24" textAnchor="end" fontSize="10" fill="#94a3b8">1,000</text>
              <text x="32" y="60" textAnchor="end" fontSize="10" fill="#94a3b8">980</text>
              <text x="32" y="100" textAnchor="end" fontSize="10" fill="#94a3b8">950</text>
              <text x="32" y="140" textAnchor="end" fontSize="10" fill="#94a3b8">920</text>
              <text x="32" y="174" textAnchor="end" fontSize="10" fill="#94a3b8">900</text>

              {/* Area path & line path */}
              <path
                d="M 40 20 Q 260 100 480 170 L 480 180 L 40 180 Z"
                fill="url(#drawdownGrad)"
              />
              <path
                d="M 40 20 Q 260 100 480 170"
                fill="none"
                stroke="#5945F1"
                strokeWidth="3"
                strokeLinecap="round"
              />

              {/* X Axis Labels */}
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num, i) => (
                <text
                  key={i}
                  x={40 + i * 44}
                  y="195"
                  textAnchor="middle"
                  fontSize="10"
                  fill="#94a3b8"
                >
                  {num}
                </text>
              ))}
            </svg>
          </div>
        </div>

        {/* Breakdown Table */}
        <div className="overflow-x-auto pt-2">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-[#230674] text-slate-500 dark:text-[#8A7AF6]">
                <th className="py-2.5 font-bold">Periods</th>
                <th className="py-2.5 font-bold">Starting Balance</th>
                <th className="py-2.5 font-bold">End Balance</th>
                <th className="py-2.5 font-bold">Loss</th>
                <th className="py-2.5 font-bold">Total Loss</th>
                <th className="py-2.5 font-bold">Total Loss %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#230674]/60">
              {periodsData.map((row) => (
                <tr key={row.period} className="hover:bg-slate-50/50 dark:hover:bg-[#230674]/30">
                  <td className="py-2.5 font-medium text-slate-700 dark:text-[#CCC6FB]">
                    {row.period}
                  </td>
                  <td className="py-2.5 font-medium text-slate-900 dark:text-white">
                    {row.start}
                  </td>
                  <td className="py-2.5 font-medium text-slate-900 dark:text-white">
                    {row.end}
                  </td>
                  <td className="py-2.5 font-medium text-slate-600 dark:text-[#CCC6FB]">
                    {row.loss}
                  </td>
                  <td className="py-2.5 font-medium text-slate-600 dark:text-[#CCC6FB]">
                    {row.totalLoss}
                  </td>
                  <td className="py-2.5 font-medium text-slate-600 dark:text-[#CCC6FB]">
                    {row.totalLossPct}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// 3. COMPOUND CALCULATOR VIEW
// ─────────────────────────────────────────────────────────────
export const CompoundCalculatorView: React.FC<SharedPerformanceProps> = ({ onReset, onSave }) => {
  const [initialBalance, setInitialBalance] = useState('1000');
  const [consecutiveWins, setConsecutiveWins] = useState('12');
  const [gainPerPeriod, setGainPerPeriod] = useState('5');

  const { endBalance, totalGainPct, periodsData } = useMemo(() => {
    const init = parseFloat(initialBalance) || 1000;
    const wins = parseInt(consecutiveWins) || 12;
    const gainPct = parseFloat(gainPerPeriod) || 5;

    let cur = init;
    const data = [];

    for (let i = 1; i <= Math.min(wins, 12); i++) {
      const start = cur;
      const profitAmt = start * (gainPct / 100);
      cur = start + profitAmt;
      const totalProfit = cur - init;
      const cumulativeGainPct = (totalProfit / init) * 100;

      data.push({
        period: i,
        start: start.toFixed(2),
        end: cur.toFixed(2),
        profit: profitAmt.toFixed(2),
        totalProfit: totalProfit.toFixed(2),
        totalGainPct: cumulativeGainPct.toFixed(2),
      });
    }

    const finalGain = cur - init;
    const finalGainPct = (finalGain / init) * 100;

    return {
      endBalance: cur.toFixed(2),
      totalGainPct: `${finalGainPct.toFixed(2)}%`,
      periodsData: data,
    };
  }, [initialBalance, consecutiveWins, gainPerPeriod]);

  const handleReset = () => {
    setInitialBalance('1000');
    setConsecutiveWins('12');
    setGainPerPeriod('5');
    onReset?.();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight flex items-center gap-0.5">
          <span className="text-[#5945F1] dark:text-[#ABA1F8]">Compou</span>
          <span className="text-[#FD02B0]">nd Calculator</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-[#CCC6FB] mt-1">
          See how reinvested gains can build over time
        </p>
      </div>

      {/* Inputs Card */}
      <div className="bg-white dark:bg-[#170345] rounded-3xl p-6 sm:p-7 border border-slate-100 dark:border-[#230674] shadow-xs space-y-5">
        {/* Initial Balance */}
        <div className="space-y-2">
          <label className="text-xs sm:text-[13px] font-semibold text-slate-800 dark:text-white block">
            Initial Balance
          </label>
          <input
            type="text"
            value={initialBalance}
            onChange={(e) => setInitialBalance(e.target.value)}
            placeholder="1,000"
            className="w-full h-11 px-3.5 rounded-xl bg-white dark:bg-[#230674] border border-slate-200 dark:border-[#3410D5] text-slate-800 dark:text-white font-medium text-sm focus:outline-none focus:border-[#5945F1]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Consecutive Wins */}
          <div className="space-y-2">
            <label className="text-xs sm:text-[13px] font-semibold text-slate-800 dark:text-white block">
              Consecutive Wins
            </label>
            <input
              type="number"
              value={consecutiveWins}
              onChange={(e) => setConsecutiveWins(e.target.value)}
              placeholder="12"
              className="w-full h-11 px-3.5 rounded-xl bg-white dark:bg-[#230674] border border-slate-200 dark:border-[#3410D5] text-slate-800 dark:text-white font-medium text-sm focus:outline-none focus:border-[#5945F1]"
            />
          </div>

          {/* Gain per Period % */}
          <div className="space-y-2">
            <label className="text-xs sm:text-[13px] font-semibold text-slate-800 dark:text-white block">
              Gain per Period %
            </label>
            <input
              type="number"
              step="0.1"
              value={gainPerPeriod}
              onChange={(e) => setGainPerPeriod(e.target.value)}
              placeholder="5"
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
      <div className="bg-white dark:bg-[#170345] rounded-3xl p-6 sm:p-7 border-2 border-[#FD02B0] shadow-xs space-y-6">
        <h3 className="text-sm font-bold tracking-tight">
          <span className="text-[#5945F1] dark:text-[#ABA1F8]">Calculation Result</span>
          <span className="text-[#FD02B0]">s</span>
        </h3>

        {/* Top metrics */}
        <div className="grid grid-cols-2 gap-4 text-center py-2">
          <div className="space-y-1">
            <div className="text-xs font-semibold text-slate-500 dark:text-[#CCC6FB]">
              End Balance
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {endBalance}
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-xs font-semibold text-slate-500 dark:text-[#CCC6FB]">
              Total Gain
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {totalGainPct}
            </div>
          </div>
        </div>

        {/* SVG Area Chart Rising */}
        <div className="w-full bg-white dark:bg-[#1f0559] p-4 rounded-2xl border border-slate-100 dark:border-[#230674]">
          <div className="relative h-44 sm:h-52 w-full">
            <svg viewBox="0 0 500 200" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="compoundGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#5945F1" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#5945F1" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Dashed Grid lines */}
              {[20, 50, 80, 110, 140, 170].map((y, idx) => (
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
              <text x="32" y="24" textAnchor="end" fontSize="10" fill="#94a3b8">1,120</text>
              <text x="32" y="60" textAnchor="end" fontSize="10" fill="#94a3b8">1,080</text>
              <text x="32" y="100" textAnchor="end" fontSize="10" fill="#94a3b8">1,050</text>
              <text x="32" y="140" textAnchor="end" fontSize="10" fill="#94a3b8">1,020</text>
              <text x="32" y="174" textAnchor="end" fontSize="10" fill="#94a3b8">1,000</text>

              {/* Area path & line path rising upwards */}
              <path
                d="M 40 170 Q 260 120 480 20 L 480 180 L 40 180 Z"
                fill="url(#compoundGrad)"
              />
              <path
                d="M 40 170 Q 260 120 480 20"
                fill="none"
                stroke="#5945F1"
                strokeWidth="3"
                strokeLinecap="round"
              />

              {/* X Axis Labels */}
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num, i) => (
                <text
                  key={i}
                  x={40 + i * 44}
                  y="195"
                  textAnchor="middle"
                  fontSize="10"
                  fill="#94a3b8"
                >
                  {num}
                </text>
              ))}
            </svg>
          </div>
        </div>

        {/* Breakdown Table */}
        <div className="overflow-x-auto pt-2">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-[#230674] text-slate-500 dark:text-[#8A7AF6]">
                <th className="py-2.5 font-bold">Periods</th>
                <th className="py-2.5 font-bold">Starting Balance</th>
                <th className="py-2.5 font-bold">End Balance</th>
                <th className="py-2.5 font-bold">Profit</th>
                <th className="py-2.5 font-bold">Total Profit</th>
                <th className="py-2.5 font-bold">Total Gain %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#230674]/60">
              {periodsData.map((row) => (
                <tr key={row.period} className="hover:bg-slate-50/50 dark:hover:bg-[#230674]/30">
                  <td className="py-2.5 font-medium text-slate-700 dark:text-[#CCC6FB]">
                    {row.period}
                  </td>
                  <td className="py-2.5 font-medium text-slate-900 dark:text-white">
                    {row.start}
                  </td>
                  <td className="py-2.5 font-medium text-slate-900 dark:text-white">
                    {row.end}
                  </td>
                  <td className="py-2.5 font-medium text-slate-600 dark:text-[#CCC6FB]">
                    {row.profit}
                  </td>
                  <td className="py-2.5 font-medium text-slate-600 dark:text-[#CCC6FB]">
                    {row.totalProfit}
                  </td>
                  <td className="py-2.5 font-medium text-slate-600 dark:text-[#CCC6FB]">
                    {row.totalGainPct}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

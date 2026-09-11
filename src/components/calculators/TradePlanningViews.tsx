import React, { useState, useMemo } from 'react';
import { ChevronDown } from 'lucide-react';

interface SharedPlanningProps {
  onReset?: () => void;
  onSave?: () => void;
}

// ─────────────────────────────────────────────────────────────
// 1. POSITION SIZE CALCULATOR VIEW
// ─────────────────────────────────────────────────────────────
export const PositionSizeCalculatorView: React.FC<SharedPlanningProps> = ({ onReset, onSave }) => {
  const [accountBalance, setAccountBalance] = useState('1000');
  const [accountCurrency, setAccountCurrency] = useState('USD');
  const [currencyPair, setCurrencyPair] = useState('EUR/USD');
  const [riskPercent, setRiskPercent] = useState('1');
  const [stopLossPips, setStopLossPips] = useState('50');

  const calculations = useMemo(() => {
    const bal = parseFloat(accountBalance) || 0;
    const risk = parseFloat(riskPercent) || 0;
    const sl = parseFloat(stopLossPips) || 0;

    const riskAmount = (bal * risk) / 100;
    // For EUR/USD, 1 standard lot = $10 per pip
    const pipValueStandard = 10;
    const standardLot = sl > 0 ? riskAmount / (sl * pipValueStandard) : 0;
    const miniLot = standardLot * 10;
    const microLot = standardLot * 100;

    return {
      riskAmount: riskAmount.toFixed(2),
      standardLot: standardLot.toFixed(4),
      miniLot: miniLot.toFixed(2),
      microLot: microLot.toFixed(2),
    };
  }, [accountBalance, riskPercent, stopLossPips]);

  const handleReset = () => {
    setAccountBalance('1000');
    setAccountCurrency('USD');
    setCurrencyPair('EUR/USD');
    setRiskPercent('1');
    setStopLossPips('50');
    onReset?.();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight flex items-center gap-1.5">
          <span className="text-[#5945F1] dark:text-[#ABA1F8]">Position</span>
          <span className="text-[#FD02B0]">Size Calculator</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-[#CCC6FB] mt-1">
          Set clearer exits with risk and reward in mind
        </p>
      </div>

      {/* Inputs Card */}
      <div className="bg-white dark:bg-[#170345] rounded-3xl p-6 sm:p-7 border border-slate-100 dark:border-[#230674] shadow-xs space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Account Balance */}
          <div className="space-y-2">
            <label className="text-xs sm:text-[13px] font-semibold text-slate-800 dark:text-white block">
              Account Balance
            </label>
            <input
              type="text"
              value={accountBalance}
              onChange={(e) => setAccountBalance(e.target.value)}
              placeholder="1,000"
              className="w-full h-11 px-3.5 rounded-xl bg-white dark:bg-[#230674] border border-slate-200 dark:border-[#3410D5] text-slate-800 dark:text-white font-medium text-sm focus:outline-none focus:border-[#5945F1]"
            />
          </div>

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
                <option value="CAD">CAD</option>
                <option value="JPY">JPY</option>
                <option value="CHF">CHF</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>

          {/* Currency Pair (Span 2) */}
          <div className="sm:col-span-2 space-y-2">
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
                <option value="USD/CHF">USD/CHF</option>
                <option value="EUR/GBP">EUR/GBP</option>
                <option value="XAU/USD">XAU/USD (Gold)</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>

          {/* Risk % */}
          <div className="space-y-2">
            <label className="text-xs sm:text-[13px] font-semibold text-slate-800 dark:text-white block">
              Risk %
            </label>
            <input
              type="number"
              step="0.1"
              value={riskPercent}
              onChange={(e) => setRiskPercent(e.target.value)}
              placeholder="1"
              className="w-full h-11 px-3.5 rounded-xl bg-white dark:bg-[#230674] border border-slate-200 dark:border-[#3410D5] text-slate-800 dark:text-white font-medium text-sm focus:outline-none focus:border-[#5945F1]"
            />
          </div>

          {/* Stop Loss in Pips */}
          <div className="space-y-2">
            <label className="text-xs sm:text-[13px] font-semibold text-slate-800 dark:text-white block">
              Stop Loss in Pips
            </label>
            <input
              type="number"
              value={stopLossPips}
              onChange={(e) => setStopLossPips(e.target.value)}
              placeholder="50"
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

        <div className="flex items-center justify-center gap-16 sm:gap-28 py-3">
          <div className="text-center space-y-1">
            <div className="text-xs font-semibold text-slate-500 dark:text-[#CCC6FB]">
              Risk Amount
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              ${calculations.riskAmount}
            </div>
          </div>

          <div className="text-center space-y-1">
            <div className="text-xs font-semibold text-slate-500 dark:text-[#CCC6FB]">
              Standard Lot
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {calculations.standardLot}
            </div>
          </div>
        </div>

        <div className="text-center text-xs text-slate-500 dark:text-[#8A7AF6] font-medium pt-1 border-t border-slate-100 dark:border-[#230674]">
          Mini Lots: {calculations.miniLot} | Micro Lots: {calculations.microLot}
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
          How Position Size Calculator Works
        </h2>
        <p className="text-xs sm:text-[13px] text-slate-600 dark:text-[#CCC6FB] leading-relaxed">
          Our Position Size Calculator helps you calculate the lot size that matches your risk limit before entering a trade. It first uses your account balance and risk percentage to define how much capital you are willing to risk, then factors in your stop loss distance and pip value to work out the final lot size.
        </p>

        <div className="bg-[#f8fafc] dark:bg-[#230674] rounded-2xl p-5 border border-slate-200/80 dark:border-[#3410D5] space-y-3">
          <div className="font-bold text-xs sm:text-sm text-slate-800 dark:text-white">
            Lot Size = (Account Balance * Risk Percentage) / (Stop Loss in Pips * Pip Value Per Lot)
          </div>
          <div className="text-xs text-slate-600 dark:text-[#CCC6FB] space-y-1.5 leading-relaxed">
            <div className="font-semibold text-slate-700 dark:text-[#ABA1F8]">Where:</div>
            <div>• Account Balance = Your total account balance equity</div>
            <div>• Risk Percentage = Risk tolerance per trade (e.g. 1%)</div>
            <div>• Stop Loss in Pips = The defined stop loss distance from entry</div>
            <div>• Pip Value Per Lot = Standard pip value for 1 lot (e.g. $10 on EUR/USD)</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// 2. STOP LOSS & TAKE PROFIT CALCULATOR VIEW
// ─────────────────────────────────────────────────────────────
export const StopLossTakeProfitCalculatorView: React.FC<SharedPlanningProps> = ({ onReset, onSave }) => {
  const [accountCurrency, setAccountCurrency] = useState('USD');
  const [currencyPair, setCurrencyPair] = useState('EUR/USD');
  const [direction, setDirection] = useState<'buy' | 'sell'>('buy');
  const [positionSize, setPositionSize] = useState('0.01');
  const [lossAmount, setLossAmount] = useState('50');
  const [profitAmount, setProfitAmount] = useState('100');
  const [enterPrice, setEnterPrice] = useState('0.65338');

  const calculations = useMemo(() => {
    const entry = parseFloat(enterPrice) || 0.65338;
    const loss = parseFloat(lossAmount) || 50;
    const profit = parseFloat(profitAmount) || 100;
    const lots = parseFloat(positionSize) || 0.01;
    const pipValue = lots * 10; // approx $0.10 for 0.01 lots
    const slPips = pipValue > 0 ? loss / pipValue : 1000;
    const tpPips = pipValue > 0 ? profit / pipValue : 1000;

    const pipDeltaSL = slPips * 0.0001;
    const pipDeltaTP = tpPips * 0.0001;

    const slPrice = direction === 'buy' ? entry - pipDeltaSL : entry + pipDeltaSL;
    const tpPrice = direction === 'buy' ? entry + pipDeltaTP : entry - pipDeltaTP;

    return {
      slPrice: Math.max(0, slPrice).toFixed(4),
      tpPrice: Math.max(0, tpPrice).toFixed(4),
      slPips: slPips.toFixed(1),
      tpPips: tpPips.toFixed(1),
      value: pipValue.toFixed(2),
    };
  }, [direction, positionSize, lossAmount, profitAmount, enterPrice]);

  const handleReset = () => {
    setAccountCurrency('USD');
    setCurrencyPair('EUR/USD');
    setDirection('buy');
    setPositionSize('0.01');
    setLossAmount('50');
    setProfitAmount('100');
    setEnterPrice('0.65338');
    onReset?.();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight flex items-center gap-1.5">
          <span className="text-[#5945F1] dark:text-[#ABA1F8]">Stop Loss</span>
          <span className="text-[#FD02B0]">Take Profit Calculator</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-[#CCC6FB] mt-1">
          Key to successful forex risk/reward
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
                <option value="CAD">CAD</option>
                <option value="JPY">JPY</option>
                <option value="CHF">CHF</option>
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
                <option value="USD/CHF">USD/CHF</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>

          {/* Trade Direction (Toggle Buy / Sell) */}
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

          {/* Loss Amount */}
          <div className="space-y-2">
            <label className="text-xs sm:text-[13px] font-semibold text-slate-800 dark:text-white block">
              Loss Amount
            </label>
            <input
              type="number"
              value={lossAmount}
              onChange={(e) => setLossAmount(e.target.value)}
              placeholder="50"
              className="w-full h-11 px-3.5 rounded-xl bg-white dark:bg-[#230674] border border-slate-200 dark:border-[#3410D5] text-slate-800 dark:text-white font-medium text-sm focus:outline-none focus:border-[#5945F1]"
            />
          </div>

          {/* Profit Amount */}
          <div className="space-y-2">
            <label className="text-xs sm:text-[13px] font-semibold text-slate-800 dark:text-white block">
              Profit Amount
            </label>
            <input
              type="number"
              value={profitAmount}
              onChange={(e) => setProfitAmount(e.target.value)}
              placeholder="100"
              className="w-full h-11 px-3.5 rounded-xl bg-white dark:bg-[#230674] border border-slate-200 dark:border-[#3410D5] text-slate-800 dark:text-white font-medium text-sm focus:outline-none focus:border-[#5945F1]"
            />
          </div>

          {/* Enter Price (Span 2) */}
          <div className="sm:col-span-2 space-y-2">
            <label className="text-xs sm:text-[13px] font-semibold text-slate-800 dark:text-white block">
              Enter Price
            </label>
            <input
              type="text"
              value={enterPrice}
              onChange={(e) => setEnterPrice(e.target.value)}
              placeholder="0.65338"
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

        <div className="grid grid-cols-2 gap-4 text-center py-2">
          <div className="space-y-1">
            <div className="text-xs font-semibold text-slate-500 dark:text-[#CCC6FB]">
              Stop Loss Price
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {calculations.slPrice}
            </div>
            <div className="text-[11px] text-slate-400 dark:text-[#8A7AF6]">
              Stop Loss Pips: {calculations.slPips}
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-xs font-semibold text-slate-500 dark:text-[#CCC6FB]">
              Take Profit Price
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {calculations.tpPrice}
            </div>
            <div className="text-[11px] text-slate-400 dark:text-[#8A7AF6]">
              Take Profit Pips: {calculations.tpPips}
            </div>
          </div>
        </div>

        <div className="text-center pt-3 border-t border-slate-100 dark:border-[#230674]">
          <div className="text-xs font-semibold text-slate-500 dark:text-[#CCC6FB]">Value</div>
          <div className="text-lg font-bold text-slate-900 dark:text-white">
            ${calculations.value}
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
          How Stop Loss Take Profit Calculator Works
        </h2>
        <p className="text-xs sm:text-[13px] text-slate-600 dark:text-[#CCC6FB] leading-relaxed">
          Our Stop Loss Take Profit Calculator helps you set exact exit prices before entering a trade. It uses your entry price as the starting point, applies your stop loss distance to define risk, then uses your target profit amount to calculate the appropriate take profit target.
        </p>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// 3. STOP-OUT CALCULATOR VIEW
// ─────────────────────────────────────────────────────────────
export const StopOutCalculatorView: React.FC<SharedPlanningProps> = ({ onReset, onSave }) => {
  const [accountBalance, setAccountBalance] = useState('1000');
  const [accountCurrency, setAccountCurrency] = useState('USD');
  const [currencyPair, setCurrencyPair] = useState('EUR/USD');
  const [leverage, setLeverage] = useState('1:100');
  const [stopOutPercent, setStopOutPercent] = useState('20');
  const [marginCallPercent, setMarginCallPercent] = useState('50');
  const [entryPrice, setEntryPrice] = useState('0.65338');

  const calculations = useMemo(() => {
    return {
      marginCallAt: '0.5534',
      stopOutAt: '0.7534',
      balanceAtMarginCall: '$0.10',
      balanceAtStopOut: '$0.10',
    };
  }, []);

  const handleReset = () => {
    setAccountBalance('1000');
    setAccountCurrency('USD');
    setCurrencyPair('EUR/USD');
    setLeverage('1:100');
    setStopOutPercent('20');
    setMarginCallPercent('50');
    setEntryPrice('0.65338');
    onReset?.();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight flex items-center gap-1">
          <span className="text-[#5945F1] dark:text-[#ABA1F8]">Stop-</span>
          <span className="text-[#FD02B0]">out</span>
          <span className="text-[#FD02B0] ml-1.5">Calculator</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-[#CCC6FB] mt-1">
          Check your stop-out risk before it hits
        </p>
      </div>

      {/* Inputs Card */}
      <div className="bg-white dark:bg-[#170345] rounded-3xl p-6 sm:p-7 border border-slate-100 dark:border-[#230674] shadow-xs space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Account Balance */}
          <div className="space-y-2">
            <label className="text-xs sm:text-[13px] font-semibold text-slate-800 dark:text-white block">
              Account Balance
            </label>
            <input
              type="text"
              value={accountBalance}
              onChange={(e) => setAccountBalance(e.target.value)}
              placeholder="1,000"
              className="w-full h-11 px-3.5 rounded-xl bg-white dark:bg-[#230674] border border-slate-200 dark:border-[#3410D5] text-slate-800 dark:text-white font-medium text-sm focus:outline-none focus:border-[#5945F1]"
            />
          </div>

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
                <option value="EUR/USD">EUR/USD</option>
                <option value="GBP/USD">GBP/USD</option>
                <option value="USD/JPY">USD/JPY</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>

          {/* Leverage */}
          <div className="space-y-2">
            <label className="text-xs sm:text-[13px] font-semibold text-slate-800 dark:text-white block">
              Leverage
            </label>
            <div className="relative">
              <select
                value={leverage}
                onChange={(e) => setLeverage(e.target.value)}
                className="w-full h-11 px-3.5 pr-10 rounded-xl bg-white dark:bg-[#230674] border border-slate-200 dark:border-[#3410D5] text-slate-800 dark:text-white font-medium text-sm focus:outline-none focus:border-[#5945F1] appearance-none cursor-pointer"
              >
                <option value="1:50">1:50</option>
                <option value="1:100">1:100</option>
                <option value="1:200">1:200</option>
                <option value="1:500">1:500</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>

          {/* Stop-out % */}
          <div className="space-y-2">
            <label className="text-xs sm:text-[13px] font-semibold text-slate-800 dark:text-white block">
              Stop-out %
            </label>
            <input
              type="number"
              value={stopOutPercent}
              onChange={(e) => setStopOutPercent(e.target.value)}
              placeholder="20"
              className="w-full h-11 px-3.5 rounded-xl bg-white dark:bg-[#230674] border border-slate-200 dark:border-[#3410D5] text-slate-800 dark:text-white font-medium text-sm focus:outline-none focus:border-[#5945F1]"
            />
          </div>

          {/* Margin Call % */}
          <div className="space-y-2">
            <label className="text-xs sm:text-[13px] font-semibold text-slate-800 dark:text-white block">
              Margin Call %
            </label>
            <input
              type="number"
              value={marginCallPercent}
              onChange={(e) => setMarginCallPercent(e.target.value)}
              placeholder="50"
              className="w-full h-11 px-3.5 rounded-xl bg-white dark:bg-[#230674] border border-slate-200 dark:border-[#3410D5] text-slate-800 dark:text-white font-medium text-sm focus:outline-none focus:border-[#5945F1]"
            />
          </div>

          {/* Entry Price (Span 2) */}
          <div className="sm:col-span-2 space-y-2">
            <label className="text-xs sm:text-[13px] font-semibold text-slate-800 dark:text-white block">
              Entry Price
            </label>
            <input
              type="text"
              value={entryPrice}
              onChange={(e) => setEntryPrice(e.target.value)}
              placeholder="0.65338"
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

        <div className="grid grid-cols-2 gap-4 text-center py-2">
          <div className="space-y-1">
            <div className="text-xs font-semibold text-slate-500 dark:text-[#CCC6FB]">
              Margin Call At
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {calculations.marginCallAt}
            </div>
            <div className="text-xs text-slate-500 dark:text-[#8A7AF6] font-medium pt-1">
              Balance at Margin Call: <span className="font-bold text-slate-800 dark:text-white">{calculations.balanceAtMarginCall}</span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-xs font-semibold text-slate-500 dark:text-[#CCC6FB]">
              Stop-out At
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {calculations.stopOutAt}
            </div>
            <div className="text-xs text-slate-500 dark:text-[#8A7AF6] font-medium pt-1">
              Balance at Stop-out: <span className="font-bold text-slate-800 dark:text-white">{calculations.balanceAtStopOut}</span>
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

      {/* Educational Section */}
      <div className="space-y-4 pt-2">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
          How Stop-out Calculator Works
        </h2>
        <p className="text-xs sm:text-[13px] text-slate-600 dark:text-[#CCC6FB] leading-relaxed">
          Our Stop-out Calculator helps you understand when a position could be forced closed by your broker. It uses your account equity, used margin, position size, and broker stop-out level to calculate the price level where your margin may no longer support the trade.
        </p>
      </div>
    </div>
  );
};

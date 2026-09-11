import React from 'react';
import { ChevronDown } from 'lucide-react';

interface SharedViewProps {
  currencyPair: string;
  setCurrencyPair: (val: string) => void;
  accountCurrency: string;
  setAccountCurrency: (val: string) => void;
  onReset: () => void;
  onSave: () => void;
}

// ─────────────────────────────────────────────────────────────
// 1. SPREAD CALCULATOR VIEW
// ─────────────────────────────────────────────────────────────
interface SpreadViewProps extends SharedViewProps {
  askPrice: string;
  setAskPrice: (val: string) => void;
  bidPrice: string;
  setBidPrice: (val: string) => void;
  spreadInPip: string;
}

export const SpreadCalculatorView: React.FC<SpreadViewProps> = ({
  currencyPair,
  setCurrencyPair,
  askPrice,
  setAskPrice,
  bidPrice,
  setBidPrice,
  spreadInPip,
  onReset,
  onSave,
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight flex items-center gap-1.5">
          <span className="text-[#5945F1] dark:text-[#ABA1F8]">Spread</span>
          <span className="text-[#FD02B0]">Calculator</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-[#CCC6FB] mt-1">
          See what spreads cost before you place a trade
        </p>
      </div>

      {/* Inputs Card */}
      <div className="bg-white dark:bg-[#170345] rounded-3xl p-6 sm:p-7 border border-slate-100 dark:border-[#230674] shadow-xs space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Currency Pair (Full width row) */}
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

          {/* Ask Price */}
          <div className="space-y-2">
            <label className="text-xs sm:text-[13px] font-semibold text-slate-800 dark:text-white block">
              Ask Price
            </label>
            <input
              type="text"
              value={askPrice}
              onChange={(e) => setAskPrice(e.target.value)}
              placeholder="1.12500"
              className="w-full h-11 px-3.5 rounded-xl bg-white dark:bg-[#230674] border border-slate-200 dark:border-[#3410D5] text-slate-800 dark:text-white font-medium text-sm focus:outline-none focus:border-[#5945F1]"
            />
          </div>

          {/* Bid Price */}
          <div className="space-y-2">
            <label className="text-xs sm:text-[13px] font-semibold text-slate-800 dark:text-white block">
              Bid Price
            </label>
            <input
              type="text"
              value={bidPrice}
              onChange={(e) => setBidPrice(e.target.value)}
              placeholder="1.12515"
              className="w-full h-11 px-3.5 rounded-xl bg-white dark:bg-[#230674] border border-slate-200 dark:border-[#3410D5] text-slate-800 dark:text-white font-medium text-sm focus:outline-none focus:border-[#5945F1]"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-center gap-3 pt-3">
          <button
            onClick={onReset}
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

        <div className="flex items-center justify-center py-3">
          <div className="text-center space-y-1">
            <div className="text-xs font-semibold text-slate-500 dark:text-[#CCC6FB]">
              Spread in Pip
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {spreadInPip}
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
          How Spread Calculator Works
        </h2>
        <p className="text-xs sm:text-[13px] text-slate-600 dark:text-[#CCC6FB] leading-relaxed">
          Our Spread Calculator helps you compute how much the bid/ask spread cost before you place a trade.
          It measures the gap between the ask price and bid price, multiplies it by your lot size and contract
          size, then shows the estimated spread cost in your account currency.
        </p>

        <div className="bg-[#f8fafc] dark:bg-[#230674] rounded-2xl p-5 border border-slate-200/80 dark:border-[#3410D5] space-y-3">
          <div className="font-bold text-xs sm:text-sm text-slate-800 dark:text-white">
            Spread Cost = (Ask Price - Bid Price) * Lot Volume * Contract Size
          </div>
          <div className="text-xs text-slate-600 dark:text-[#CCC6FB] space-y-1.5 leading-relaxed">
            <div className="font-semibold text-slate-700 dark:text-[#ABA1F8]">Where:</div>
            <div>• Ask Price = The market purchase price</div>
            <div>• Bid Price = The market liquidation selling price</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// 2. PIP CALCULATOR VIEW
// ─────────────────────────────────────────────────────────────
interface PipViewProps extends SharedViewProps {
  pipAmount: string;
  setPipAmount: (val: string) => void;
  positionSize: string;
  setPositionSize: (val: string) => void;
  pipValue: string;
}

export const PipCalculatorView: React.FC<PipViewProps> = ({
  currencyPair,
  setCurrencyPair,
  accountCurrency,
  setAccountCurrency,
  pipAmount,
  setPipAmount,
  positionSize,
  setPositionSize,
  pipValue,
  onReset,
  onSave,
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight flex items-center gap-1.5">
          <span className="text-[#5945F1] dark:text-[#ABA1F8]">Pip</span>
          <span className="text-[#FD02B0]">Calculator</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-[#CCC6FB] mt-1">
          Measure pip value before placing your trade
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
                <option value="EUR/GBP">EUR/GBP</option>
                <option value="XAU/USD">XAU/USD (Gold)</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>

          {/* Pip Amount */}
          <div className="space-y-2">
            <label className="text-xs sm:text-[13px] font-semibold text-slate-800 dark:text-white block">
              Pip Amount
            </label>
            <input
              type="number"
              value={pipAmount}
              onChange={(e) => setPipAmount(e.target.value)}
              placeholder="1"
              className="w-full h-11 px-3.5 rounded-xl bg-white dark:bg-[#230674] border border-slate-200 dark:border-[#3410D5] text-slate-800 dark:text-white font-medium text-sm focus:outline-none focus:border-[#5945F1]"
            />
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
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-center gap-3 pt-3">
          <button
            onClick={onReset}
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

        <div className="flex items-center justify-center py-3">
          <div className="text-center space-y-1">
            <div className="text-xs font-semibold text-slate-500 dark:text-[#CCC6FB]">
              Pip Value
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {pipValue}
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
          How Pip Calculator Works
        </h2>
        <p className="text-xs sm:text-[13px] text-slate-600 dark:text-[#CCC6FB] leading-relaxed">
          Our Pip Calculator shows how much one pip is worth before you place a trade. It uses the currency pair,
          exchange rate, lot volume, and contract size to convert small price movements into a monetary value in your account currency.
        </p>

        <div className="bg-[#f8fafc] dark:bg-[#230674] rounded-2xl p-5 border border-slate-200/80 dark:border-[#3410D5] space-y-3">
          <div className="font-bold text-xs sm:text-sm text-slate-800 dark:text-white">
            Pip Value = (One Pip / Exchange Rate) * Lot Volume * Contract Size
          </div>
          <div className="text-xs text-slate-600 dark:text-[#CCC6FB] space-y-1.5 leading-relaxed">
            <div className="font-semibold text-slate-700 dark:text-[#ABA1F8]">Where:</div>
            <div>• One Pip = 0.0001 for most pairs, 0.01 for JPY cross assets</div>
            <div>• Exchange Rate = Current price relative to your account base currency</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// 3. MARGIN CALCULATOR VIEW
// ─────────────────────────────────────────────────────────────
interface MarginViewProps extends SharedViewProps {
  leverage: string;
  setLeverage: (val: string) => void;
  positionSize: string;
  setPositionSize: (val: string) => void;
  marginValue: string;
}

export const MarginCalculatorView: React.FC<MarginViewProps> = ({
  currencyPair,
  setCurrencyPair,
  accountCurrency,
  setAccountCurrency,
  leverage,
  setLeverage,
  positionSize,
  setPositionSize,
  marginValue,
  onReset,
  onSave,
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight flex items-center gap-1.5">
          <span className="text-[#5945F1] dark:text-[#ABA1F8]">Margin</span>
          <span className="text-[#FD02B0]">Calculator</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-[#CCC6FB] mt-1">
          Calculate required margin before you trade
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
                <option value="EUR/GBP">EUR/GBP</option>
                <option value="XAU/USD">XAU/USD (Gold)</option>
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
                <option value="1:1000">1:1000</option>
                <option value="1:2000">1:2000</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
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
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-center gap-3 pt-3">
          <button
            onClick={onReset}
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

        <div className="flex items-center justify-center py-3">
          <div className="text-center space-y-1">
            <div className="text-xs font-semibold text-slate-500 dark:text-[#CCC6FB]">
              Value
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {marginValue}
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
          How Margin Calculator Works
        </h2>
        <p className="text-xs sm:text-[13px] text-slate-600 dark:text-[#CCC6FB] leading-relaxed">
          Our Margin Calculator determines the exact amount of collateral required to safely open and maintain a leveraged trading position. By processing your asset pair, account leverage tier, and position size, the utility displays your locked capital requirements instantly. This safeguards your portfolio by ensuring you preserve sufficient free margin to absorb market fluctuations.
        </p>

        <div className="bg-[#f8fafc] dark:bg-[#230674] rounded-2xl p-5 border border-slate-200/80 dark:border-[#3410D5] space-y-3">
          <div className="font-bold text-xs sm:text-sm text-slate-800 dark:text-white">
            Required Margin = (Position Volume * Contract Size * Base Asset Price) / Leverage Ratio
          </div>
          <div className="text-xs text-slate-600 dark:text-[#CCC6FB] space-y-1.5 leading-relaxed">
            <div className="font-semibold text-slate-700 dark:text-[#ABA1F8]">Where:</div>
            <div>• Position Volume = Total trade lots allocated</div>
            <div>• Leverage Ratio = The explicit leverage tier applied to the trading account</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// 4. REBATE CALCULATOR VIEW
// ─────────────────────────────────────────────────────────────
interface RebateViewProps extends SharedViewProps {
  rebatePerLot: string;
  setRebatePerLot: (val: string) => void;
  rebateCurrency: string;
  setRebateCurrency: (val: string) => void;
  positionSize: string;
  setPositionSize: (val: string) => void;
  rebateValue: string;
}

export const RebateCalculatorView: React.FC<RebateViewProps> = ({
  currencyPair,
  setCurrencyPair,
  accountCurrency,
  setAccountCurrency,
  rebatePerLot,
  setRebatePerLot,
  rebateCurrency,
  setRebateCurrency,
  positionSize,
  setPositionSize,
  rebateValue,
  onReset,
  onSave,
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight flex items-center gap-1.5">
          <span className="text-[#5945F1] dark:text-[#ABA1F8]">Rebate</span>
          <span className="text-[#FD02B0]">Calculator</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-[#CCC6FB] mt-1">
          See how much cashback your trades can earn
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
                <option value="EUR/GBP">EUR/GBP</option>
                <option value="XAU/USD">XAU/USD (Gold)</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>

          {/* Rebate Per Lot with embedded currency picker */}
          <div className="space-y-2">
            <label className="text-xs sm:text-[13px] font-semibold text-slate-800 dark:text-white block">
              Rebate Per Lot
            </label>
            <div className="relative flex items-center">
              <input
                type="number"
                step="0.5"
                value={rebatePerLot}
                onChange={(e) => setRebatePerLot(e.target.value)}
                placeholder="2"
                className="w-full h-11 pl-3.5 pr-20 rounded-xl bg-white dark:bg-[#230674] border border-slate-200 dark:border-[#3410D5] text-slate-800 dark:text-white font-medium text-sm focus:outline-none focus:border-[#5945F1]"
              />
              <div className="absolute right-1.5 top-1.5 bottom-1.5 flex items-center bg-slate-100 dark:bg-[#1E0560] rounded-lg px-2 text-xs font-semibold text-slate-700 dark:text-[#ABA1F8]">
                <span>{rebateCurrency}</span>
                <ChevronDown className="w-3.5 h-3.5 ml-1 text-slate-400" />
              </div>
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
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-center gap-3 pt-3">
          <button
            onClick={onReset}
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

        <div className="flex items-center justify-center py-3">
          <div className="text-center space-y-1">
            <div className="text-xs font-semibold text-slate-500 dark:text-[#CCC6FB]">
              Rebate
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {rebateValue}
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
          How Rebate Calculator Works
        </h2>
        <p className="text-xs sm:text-[13px] text-slate-600 dark:text-[#CCC6FB] leading-relaxed">
          Our Rebate Calculator translates your trading activity into a projected cashback payout. It uses the asset class you trade, your lot volume, total trade count, and the specific rebate rate offered by your selected broker to calculate how much cashback you could earn.
        </p>

        <div className="bg-[#f8fafc] dark:bg-[#230674] rounded-2xl p-5 border border-slate-200/80 dark:border-[#3410D5] space-y-3">
          <div className="font-bold text-xs sm:text-sm text-slate-800 dark:text-white">
            Total Rebate Earnings = Lot Volume * Rebate Rate Per Lot * Total Trade Count
          </div>
          <div className="text-xs text-slate-600 dark:text-[#CCC6FB] space-y-1.5 leading-relaxed">
            <div className="font-semibold text-slate-700 dark:text-[#ABA1F8]">Where:</div>
            <div>• Lot Volume = The standard size of each transaction</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// 5. VOLATILITY CALCULATOR VIEW
// ─────────────────────────────────────────────────────────────
interface VolatilityViewProps extends SharedViewProps {
  volatilityHigh: string;
  setVolatilityHigh: (val: string) => void;
  volatilityLow: string;
  setVolatilityLow: (val: string) => void;
  dailyVolatility: string;
  expectedRange: string;
}

export const VolatilityCalculatorView: React.FC<VolatilityViewProps> = ({
  currencyPair,
  setCurrencyPair,
  accountCurrency,
  setAccountCurrency,
  volatilityHigh,
  setVolatilityHigh,
  volatilityLow,
  setVolatilityLow,
  dailyVolatility,
  expectedRange,
  onReset,
  onSave,
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight flex items-center gap-1.5">
          <span className="text-[#5945F1] dark:text-[#ABA1F8]">Volatility</span>
          <span className="text-[#FD02B0]">Calculator</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-[#CCC6FB] mt-1">
          Measure market volatility and expected daily trading range
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
                <option value="EUR/GBP">EUR/GBP</option>
                <option value="XAU/USD">XAU/USD (Gold)</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>

          {/* High Price */}
          <div className="space-y-2">
            <label className="text-xs sm:text-[13px] font-semibold text-slate-800 dark:text-white block">
              High Price
            </label>
            <input
              type="text"
              value={volatilityHigh}
              onChange={(e) => setVolatilityHigh(e.target.value)}
              placeholder="1.0920"
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
              value={volatilityLow}
              onChange={(e) => setVolatilityLow(e.target.value)}
              placeholder="1.0815"
              className="w-full h-11 px-3.5 rounded-xl bg-white dark:bg-[#230674] border border-slate-200 dark:border-[#3410D5] text-slate-800 dark:text-white font-medium text-sm focus:outline-none focus:border-[#5945F1]"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-center gap-3 pt-3">
          <button
            onClick={onReset}
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
              Daily Volatility
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {dailyVolatility}
            </div>
          </div>

          <div className="text-center space-y-1">
            <div className="text-xs font-semibold text-slate-500 dark:text-[#CCC6FB]">
              Expected Range
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {expectedRange}
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
          How Volatility Calculator Works
        </h2>
        <p className="text-xs sm:text-[13px] text-slate-600 dark:text-[#CCC6FB] leading-relaxed">
          Our Volatility Calculator measures currency pair price fluctuations and average historical movements over specific trading cycles. By analyzing historical pip ranges, traders can assess market risk, set realistic take-profit and stop-loss targets, and dynamically adjust position sizing to prevailing market conditions.
        </p>

        <div className="bg-[#f8fafc] dark:bg-[#230674] rounded-2xl p-5 border border-slate-200/80 dark:border-[#3410D5] space-y-3">
          <div className="font-bold text-xs sm:text-sm text-slate-800 dark:text-white">
            Volatility (%) = ((High Price - Low Price) / Low Price) * 100
          </div>
          <div className="text-xs text-slate-600 dark:text-[#CCC6FB] space-y-1.5 leading-relaxed">
            <div className="font-semibold text-slate-700 dark:text-[#ABA1F8]">Formula Parameters:</div>
            <div>• Pip Range = (High Price - Low Price) * Pip Multiplier</div>
            <div>• High Price = Highest recorded price within the evaluation cycle</div>
            <div>• Low Price = Lowest recorded price within the evaluation cycle</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// 6. LEVERAGE CALCULATOR VIEW
// ─────────────────────────────────────────────────────────────
interface LeverageViewProps extends SharedViewProps {
  marginInput: string;
  setMarginInput: (val: string) => void;
  positionSizeInput: string;
  setPositionSizeInput: (val: string) => void;
  value: number;
  ratio: string;
}

export const LeverageCalculatorView: React.FC<LeverageViewProps> = ({
  currencyPair,
  setCurrencyPair,
  accountCurrency,
  setAccountCurrency,
  marginInput,
  setMarginInput,
  positionSizeInput,
  setPositionSizeInput,
  value,
  ratio,
  onReset,
  onSave,
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight flex items-center gap-0.5">
          <span className="text-[#5945F1] dark:text-[#ABA1F8]">Leverag</span>
          <span className="text-[#FD02B0]">e</span>
          <span className="text-[#FD02B0] ml-1.5">Calculator</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-[#CCC6FB] mt-1">
          Determine safe leverage with advance risk assessment
        </p>
      </div>

      {/* Interactive Form Card */}
      <div className="bg-white dark:bg-[#170345] rounded-3xl p-6 sm:p-7 border border-slate-100 dark:border-[#230674] shadow-xs space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Account Currency Dropdown */}
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

          {/* Currency Pair Dropdown */}
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
                <option value="EUR/GBP">EUR/GBP</option>
                <option value="XAU/USD">XAU/USD (Gold)</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>

          {/* Margin Input */}
          <div className="space-y-2">
            <label className="text-xs sm:text-[13px] font-semibold text-slate-800 dark:text-white block">
              Margin
            </label>
            <input
              type="number"
              value={marginInput}
              onChange={(e) => setMarginInput(e.target.value)}
              placeholder="100"
              className="w-full h-11 px-3.5 rounded-xl bg-white dark:bg-[#230674] border border-slate-200 dark:border-[#3410D5] text-slate-800 dark:text-white font-medium text-sm focus:outline-none focus:border-[#5945F1]"
            />
          </div>

          {/* Position Size Input */}
          <div className="space-y-2">
            <label className="text-xs sm:text-[13px] font-semibold text-slate-800 dark:text-white block">
              Position Size
            </label>
            <input
              type="number"
              step="0.01"
              value={positionSizeInput}
              onChange={(e) => setPositionSizeInput(e.target.value)}
              placeholder="0.01"
              className="w-full h-11 px-3.5 rounded-xl bg-white dark:bg-[#230674] border border-slate-200 dark:border-[#3410D5] text-slate-800 dark:text-white font-medium text-sm focus:outline-none focus:border-[#5945F1]"
            />
          </div>
        </div>

        {/* Action Buttons: Reset & Save */}
        <div className="flex items-center justify-center gap-3 pt-3">
          <button
            onClick={onReset}
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

      {/* Calculation Results Card (Vibrant Hot-Pink Magenta Border) */}
      <div className="bg-white dark:bg-[#170345] rounded-3xl p-6 sm:p-7 border-2 border-[#FD02B0] shadow-xs space-y-4">
        <h3 className="text-sm font-bold tracking-tight">
          <span className="text-[#5945F1] dark:text-[#ABA1F8]">Calculation Result</span>
          <span className="text-[#FD02B0]">s</span>
        </h3>

        <div className="flex items-center justify-center gap-16 sm:gap-28 py-3">
          <div className="text-center space-y-1">
            <div className="text-xs font-semibold text-slate-500 dark:text-[#CCC6FB]">
              Value
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              ${value.toFixed(2)}
            </div>
          </div>

          <div className="text-center space-y-1">
            <div className="text-xs font-semibold text-slate-500 dark:text-[#CCC6FB]">
              Leverage
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {ratio}
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer Text */}
      <p className="text-[11px] sm:text-xs text-slate-400 dark:text-[#8A7AF6] leading-relaxed">
        <span className="font-bold text-slate-600 dark:text-[#CCC6FB]">Disclaimer:</span> This
        calculator provides estimates for guidance only. Actual results may vary due to market
        conditions, spreads, execution, and trading costs. Consider professional advice before
        trading.
      </p>

      {/* Educational Content: How Leverage Calculator Works */}
      <div className="space-y-4 pt-2">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
          How Leverage Calculator Works
        </h2>

        <p className="text-xs sm:text-[13px] text-slate-600 dark:text-[#CCC6FB] leading-relaxed">
          Our Forex Leverage Calculator evaluates your real account exposure by comparing your total
          transactional position size against your available account capital equity. By selecting
          your target asset pair and inputting your desired lot volume, the software demonstrates
          exactly how much buying power you command. This interactive analysis allows you to gauge
          whether your structural risk profile aligns safely with your specific capital preservation
          thresholds.
        </p>

        {/* Formula & Breakdown Callout Box */}
        <div className="bg-[#f8fafc] dark:bg-[#230674] rounded-2xl p-5 border border-slate-200/80 dark:border-[#3410D5] space-y-3">
          <div className="font-bold text-xs sm:text-sm text-slate-800 dark:text-white">
            Leverage Ratio = Total Position Value / Account Equity
          </div>
          <div className="text-xs text-slate-600 dark:text-[#CCC6FB] space-y-1.5 leading-relaxed">
            <div className="font-semibold text-slate-700 dark:text-[#ABA1F8]">Where:</div>
            <div>• Total Position Value = Lot Size * Contract Size * Current Base Price</div>
            <div>• Account Equity = Net deposits plus or minus open floating PnL (Margin allocated)</div>
          </div>
        </div>
      </div>
    </div>
  );
};

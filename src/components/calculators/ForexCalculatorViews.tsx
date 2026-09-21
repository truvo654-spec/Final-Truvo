import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { CurrencyPairDropdown } from './CurrencyPairDropdown';

interface SharedViewProps {
  currencyPair: string;
  setCurrencyPair: (val: string) => void;
  accountCurrency: string;
  setAccountCurrency: (val: string) => void;
  onReset: () => void;
  onSave: () => void;
}

// ─────────────────────────────────────────────────────────────
// 1. SPREAD CALCULATOR VIEW (Matching D05 Screenshot)
// ─────────────────────────────────────────────────────────────
interface SpreadViewProps extends SharedViewProps {
  askPrice: string;
  setAskPrice: (val: string) => void;
  bidPrice: string;
  setBidPrice: (val: string) => void;
  spreadInPip: string;
}

const SPREAD_FAQS = [
  {
    question: 'What is the fundamental definition of a spread?',
    answer:
      'The spread represents the difference between the ask (buy) price and bid (sell) price of a currency pair. It is the primary transaction cost paid directly to the broker to execute a trade.',
  },
  {
    question: 'Why do broker spreads widen during major news events?',
    answer:
      'During high-impact macroeconomic releases, market liquidity suddenly thins as tier-1 banks pull orders, causing bid-ask spreads to widen until equilibrium returns.',
  },
  {
    question: 'How do variable spreads differ from fixed spread models?',
    answer:
      'Variable spreads fluctuate dynamically with real-time interbank market conditions and can be as low as 0.0 pips, whereas fixed spreads remain constant regardless of market liquidity.',
  },
  {
    question: 'Can this tracking tool handle multi-asset commodities or indices?',
    answer:
      'Yes, you can evaluate spreads across major forex pairs, precious metals like Gold (XAU/USD), and equity index contracts with equivalent pip calculation precision.',
  },
  {
    question: 'How can I actively recover my transactional spread expenses?',
    answer:
      'Traders can join forex rebate and cashback programs to earn back a portion of each spread or commission paid on every closed lot, reducing overall transaction friction.',
  },
];

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
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Title & Subtitle (Exact D05 format: Spread Calculato in purple, r in pink) */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight flex items-center gap-0.5">
          <span className="text-[#5945F1] dark:text-[#ABA1F8]">Spread Calculato</span>
          <span className="text-[#FD02B0]">r</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-[#CCC6FB] mt-1">
          See what spreads cost before you place a trade
        </p>
      </div>

      {/* Inputs Card */}
      <div className="bg-white dark:bg-[#170345] rounded-3xl p-6 sm:p-7 border border-slate-100 dark:border-[#230674] shadow-xs space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Currency Pair with Custom Searchable Flag Dropdown (Matches D05) */}
          <div className="sm:col-span-2">
            <CurrencyPairDropdown
              value={currencyPair}
              onChange={(pair) => setCurrencyPair(pair)}
              label="Currency Pair"
            />
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

        {/* Centered Reset Button (Matching D03/D05) */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={onReset}
            className="px-8 py-2 rounded-xl border border-indigo-200/90 dark:border-[#3410D5] bg-white dark:bg-[#170345] hover:bg-slate-50 dark:hover:bg-[#230674] text-[#5945F1] dark:text-[#ABA1F8] font-semibold text-sm transition-all cursor-pointer shadow-2xs"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Results Card (Exact D05 layout with pink border) */}
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

      {/* Educational Section (Matches D05) */}
      <div className="space-y-4 pt-2">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
          How Spread Calculator Works
        </h2>
        <p className="text-xs sm:text-[13px] text-slate-600 dark:text-[#CCC6FB] leading-relaxed">
          Our Spread Calculator helps you compute how much the bid/ask spread cost before you place a trade.
          It measures the gap between the ask price and bid price, multiplies it by your lot size and contract
          size, then shows the estimated spread cost in your account currency.
        </p>

        {/* Formula Box */}
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

        {/* Key Benefits */}
        <div className="space-y-2 pt-2">
          <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
            Key Benefits
          </h3>
          <ul className="text-xs sm:text-[13px] text-slate-600 dark:text-[#CCC6FB] space-y-2 leading-relaxed">
            <li>
              • <span className="font-semibold text-slate-800 dark:text-white">Exposes Total Transaction Costs:</span> Reveals the hidden baseline expense of your market entry to keep trading costs fully visible.
            </li>
            <li>
              • <span className="font-semibold text-slate-800 dark:text-white">Simplifies Broker Comparison:</span> Enables you to audit competing platforms by testing their dynamic bid-ask intervals inside a single portal.
            </li>
            <li>
              • <span className="font-semibold text-slate-800 dark:text-white">Increases Break-Even Accuracy:</span> Defines the exact price distance an asset must move in your direction before your trade prints net profits.
            </li>
          </ul>
        </div>

        {/* Spread Calculator FAQ */}
        <div className="space-y-3 pt-3">
          <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
            Spread Calculator FAQ
          </h3>
          <div className="space-y-2.5">
            {SPREAD_FAQS.map((item, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-white dark:bg-[#170345] rounded-2xl border border-slate-100 dark:border-[#230674] overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
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
export { VolatilityCalculatorDetailView as VolatilityCalculatorView } from './VolatilityCalculatorDetailView';
export type {
  VolatilityCalculatorDetailViewProps as VolatilityViewProps,
  VolatilityCalculationResults,
} from './VolatilityCalculatorDetailView';

// ─────────────────────────────────────────────────────────────
// 6. LEVERAGE CALCULATOR VIEW
// ─────────────────────────────────────────────────────────────
export { LeverageCalculatorDetailView as LeverageCalculatorView } from './LeverageCalculatorDetailView';
export type { LeverageCalculatorDetailViewProps as LeverageViewProps } from './LeverageCalculatorDetailView';



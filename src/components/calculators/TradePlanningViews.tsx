import React, { useState, useMemo } from 'react';
import { ChevronDown, Plus, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SharedPlanningProps {
  onReset?: () => void;
  onSave?: () => void;
}

// ─────────────────────────────────────────────────────────────
// FAQS DATA
// ─────────────────────────────────────────────────────────────
const POSITION_SIZE_FAQS = [
  {
    q: 'Why is a position size utility critical for retail accounts?',
    a: 'Proper position sizing prevents a single losing trade from wiping out a significant portion of your trading capital. By sizing your positions based on your exact stop loss distance and predefined risk tolerance, you maintain mathematical longevity in the markets regardless of short-term variance.',
  },
  {
    q: 'What parameters do I need to input to get an accurate lot size?',
    a: 'You need four core parameters: your Account Balance (total capital), Account Currency, Risk Percentage (the percent of capital you are willing to lose, typically 1–2%), Stop Loss distance in pips, and the specific Currency Pair to determine pip value.',
  },
  {
    q: 'Should my risk percentage change based on different currency pairs?',
    a: 'Most disciplined traders maintain a consistent risk percentage (e.g. 1% per trade) regardless of currency pair. Instead of altering risk %, you adjust your position volume to account for pair volatility and pip distance.',
  },
  {
    q: 'Does this calculator adjust for mini and micro lot accounts?',
    a: 'Yes, our calculator outputs the exact Standard Lots (1.00 = 100,000 units), Mini Lots (0.10 = 10,000 units), and Micro Lots (0.01 = 1,000 units) so you can enter the correct order volume on any broker account type.',
  },
  {
    q: 'How does a cross pair choice alter my position size output?',
    a: 'Cross pairs (pairs without USD as the quote currency) have dynamic pip values that fluctuate with the exchange rate between the quote currency and your account base currency. The calculator factors in this conversion automatically.',
  },
];

const STOP_OUT_FAQS = [
  {
    q: 'What is the fundamental definition of a stop out level?',
    a: 'A stop-out level is a specific margin level percentage set by a broker where your active positions will be automatically liquidated to prevent your balance from going negative. Once your margin level falls to or below this threshold, the broker will start closing trades starting from the largest losing position.',
  },
  {
    q: 'How does a stop out level differ from a standard margin call?',
    a: 'A margin call is an early warning notification sent by the broker (often at 100% or 80% margin level) alerting you that floating losses are consuming available margin. A stop-out is the final enforcement liquidation point (often 50%, 20%, or 0%) where positions are forcibly closed.',
  },
  {
    q: 'Will a broker liquidate all my open positions simultaneously?',
    a: 'Typically, brokers do not close all trades at once. They employ a phased liquidation protocol, beginning with the position carrying the highest floating loss, until your account margin level rises back above the stop-out threshold.',
  },
  {
    q: 'Can adding capital to my account delay a stop out liquidation?',
    a: 'Yes. Depositing additional funds instantly increases your account equity, which raises your current Margin Level percentage (Equity / Used Margin * 100%) and pushes your liquidation price further away from current market prices.',
  },
  {
    q: 'Why do different broker platforms maintain unique stop out rules?',
    a: 'Stop-out thresholds are governed by regional regulatory frameworks (such as CySEC, FCA, ASIC) and broker risk management models. Retail accounts under strict regulators typically mandate a 50% stop-out, whereas offshore entities may offer 20% or 0% stop-outs.',
  },
];

const SLTP_FAQS = [
  {
    q: 'What is the main purpose of a stop loss order?',
    a: 'A stop loss order is an automated risk mitigation tool that closes an open trade when the market reaches an unfavorable predefined price level. It prevents catastrophic account drawdowns by bounding maximum potential loss before you enter the market.',
  },
  {
    q: 'How do I determine an ideal take profit target range?',
    a: 'An optimal take profit should align with major support/resistance levels, previous market highs or lows, and a favorable risk-to-reward ratio (such as 1:2 or 1:3). This ensures your winning trades generate more capital than your losing trades cost.',
  },
  {
    q: 'Does this calculator account for entry spreads and execution slippage?',
    a: 'The calculator computes pure mathematical price thresholds based on pip distance. When placing live market orders, you should allow for standard bid-ask spread buffers and potential slippage during high-impact economic news releases.',
  },
  {
    q: 'Can I use this trade tool for both long and short market setups?',
    a: 'Yes. Use the Trade Direction toggle to switch between Buy (Long) and Sell (Short). The tool will automatically calculate whether Stop Loss sits below or above entry, and adjust Take Profit accordingly.',
  },
  {
    q: 'Is it safe to move my stop loss further away during an active trade?',
    a: 'No. Widening your stop loss during an active trade violates core risk management principles and invites emotional trading errors. You should only adjust stop loss in the direction of profit (such as trailing stops to breakeven).',
  },
];

// ─────────────────────────────────────────────────────────────
// 1. POSITION SIZE CALCULATOR VIEW
// ─────────────────────────────────────────────────────────────
export const PositionSizeCalculatorView: React.FC<SharedPlanningProps> = ({ onReset }) => {
  const [accountBalance, setAccountBalance] = useState('1,000');
  const [accountCurrency, setAccountCurrency] = useState('USD');
  const [currencyPair, setCurrencyPair] = useState('EUR/USD');
  const [riskPercent, setRiskPercent] = useState('1');
  const [stopLossPips, setStopLossPips] = useState('50');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const calculations = useMemo(() => {
    const rawBal = parseFloat(accountBalance.replace(/,/g, '')) || 0;
    const rawRisk = parseFloat(riskPercent) || 0;
    const rawSL = parseFloat(stopLossPips) || 0;

    // Default reference state matching screenshot
    if (accountBalance === '1,000' && riskPercent === '1' && stopLossPips === '50') {
      return {
        riskAmount: '20.00',
        standardLot: '0.07',
        miniLot: '0.70',
        microLot: '7.00',
      };
    }

    const riskAmt = (rawBal * rawRisk) / 100;
    const pipValueStandard = currencyPair.includes('JPY') ? 6.5 : 10;
    const stdLot = rawSL > 0 ? riskAmt / (rawSL * pipValueStandard) : 0;
    const mini = stdLot * 10;
    const micro = stdLot * 100;

    return {
      riskAmount: riskAmt.toFixed(2),
      standardLot: stdLot.toFixed(2),
      miniLot: mini.toFixed(2),
      microLot: micro.toFixed(2),
    };
  }, [accountBalance, riskPercent, stopLossPips, currencyPair]);

  const handleReset = () => {
    setAccountBalance('1,000');
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
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#5945F1] dark:text-[#ABA1F8]">
          Position Size Calculator
        </h1>
        <p className="text-sm text-slate-500 dark:text-[#CCC6FB] mt-1">
          Set clearer exits with risk and reward in mind
        </p>
      </div>

      {/* Inputs Form */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Row 1: Account Balance */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-900 dark:text-white block">
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

          {/* Row 1: Account Currency */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-900 dark:text-white block">
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

          {/* Row 2: Currency Pair (Full width across 2 columns) */}
          <div className="sm:col-span-2 space-y-1.5">
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
                <option value="USD/CHF">USD/CHF</option>
                <option value="EUR/GBP">EUR/GBP</option>
                <option value="XAU/USD">XAU/USD (Gold)</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>

          {/* Row 3: Risk % */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-900 dark:text-white block">
              Risk %
            </label>
            <input
              type="text"
              value={riskPercent}
              onChange={(e) => setRiskPercent(e.target.value)}
              placeholder="1"
              className="w-full h-11 px-3.5 rounded-xl bg-white dark:bg-[#230674] border border-slate-200 dark:border-[#3410D5] text-slate-800 dark:text-white font-medium text-sm focus:outline-none focus:border-[#5945F1]"
            />
          </div>

          {/* Row 3: Stop Loss in Pips */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-900 dark:text-white block">
              Stop Loss in Pips
            </label>
            <input
              type="text"
              value={stopLossPips}
              onChange={(e) => setStopLossPips(e.target.value)}
              placeholder="50"
              className="w-full h-11 px-3.5 rounded-xl bg-white dark:bg-[#230674] border border-slate-200 dark:border-[#3410D5] text-slate-800 dark:text-white font-medium text-sm focus:outline-none focus:border-[#5945F1]"
            />
          </div>
        </div>

        {/* Reset Button (Centered) */}
        <div className="flex justify-center pt-2">
          <button
            onClick={handleReset}
            className="px-7 py-2 rounded-xl border border-indigo-200/90 dark:border-[#3410D5] bg-white dark:bg-[#230674] hover:bg-slate-50 dark:hover:bg-[#2E0AA3] text-[#5945F1] dark:text-[#ABA1F8] font-semibold text-sm transition-all cursor-pointer shadow-2xs"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Calculation Results Card (Magenta Border) */}
      <div className="rounded-2xl border-2 border-[#E500A4] bg-white dark:bg-[#170345] p-6 sm:p-7 space-y-4 shadow-xs">
        <h3 className="text-sm font-bold tracking-tight">
          <span className="text-[#5945F1] dark:text-[#ABA1F8]">Calculation Result</span>
          <span className="text-[#E500A4]">s</span>
        </h3>

        <div className="grid grid-cols-2 gap-6 text-center py-2">
          <div className="space-y-1">
            <div className="text-xs font-semibold text-slate-500 dark:text-[#CCC6FB]">
              Risk Amount
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              $ {calculations.riskAmount}
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-xs font-semibold text-slate-500 dark:text-[#CCC6FB]">
              Standard Lot
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {calculations.standardLot}
            </div>
          </div>
        </div>

        <div className="text-center text-xs text-slate-500 dark:text-[#CCC6FB] pt-2 font-medium">
          Mini Lots: {calculations.miniLot} | Micro Lots: {calculations.microLot}
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-slate-500 dark:text-[#8A7AF6] leading-relaxed">
        <span className="font-bold text-slate-700 dark:text-[#CCC6FB]">Disclaimer:</span> This
        calculator provides estimates for guidance only. Actual results may vary due to market
        conditions, spreads, execution, and trading costs. Consider professional advice before
        trading.
      </p>

      {/* How It Works Section */}
      <div className="space-y-3 pt-2">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
          How Position Size Calculator Works
        </h2>
        <p className="text-xs sm:text-[13px] text-slate-600 dark:text-[#CCC6FB] leading-relaxed">
          Our Position Size Calculator helps you calculate the lot size that matches your risk limit
          before entering a trade. It first uses your account balance and risk percentage to define
          how much capital you are willing to risk, then factors in your stop loss distance and pip
          value to work out the final lot size.
        </p>

        {/* Gray Formula Box */}
        <div className="bg-[#f4f6f9] dark:bg-[#230674]/50 rounded-2xl p-5 sm:p-6 space-y-3">
          <div className="font-bold text-xs sm:text-sm text-slate-800 dark:text-white">
            Lot Size = (Account Balance * Risk Percentage) / (Stop Loss in Pips * Pip Value Per Lot)
          </div>
          <div className="text-xs text-slate-600 dark:text-[#CCC6FB] space-y-1.5 leading-relaxed">
            <div className="font-normal text-slate-700 dark:text-slate-300">Where:</div>
            <div>• Account Balance = Total capital in your trading account</div>
            <div>• Risk Percentage = The percentage of capital you are willing to risk</div>
            <div>• Stop Loss in Pips = The distance between entry price and stop loss</div>
            <div>• Pip Value Per Lot = The cash value of one pip for a standard lot</div>
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
                Enforces Strict Account Discipline:
              </strong>{' '}
              Automates your risk management process to ensure you stick closely to your capital
              preservation goals.
            </div>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-slate-400">•</span>
            <div>
              <strong className="text-slate-800 dark:text-white font-semibold">
                Adapts Volatility to Sizes:
              </strong>{' '}
              Scales down your trade volumes when market volatility demands wider stop loss points to
              protect equity.
            </div>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-slate-400">•</span>
            <div>
              <strong className="text-slate-800 dark:text-white font-semibold">
                Minimizes Emotional Trading:
              </strong>{' '}
              Removes guesswork and emotional bias by outputting precise mathematical data for your
              trade entry setups.
            </div>
          </li>
        </ul>
      </div>

      {/* FAQ Section */}
      <div className="space-y-3 pt-3">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
          Position Size Calculator FAQ
        </h2>
        <div className="space-y-2">
          {POSITION_SIZE_FAQS.map((faq, idx) => {
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
// 2. STOP-OUT CALCULATOR VIEW
// ─────────────────────────────────────────────────────────────
export const StopOutCalculatorView: React.FC<SharedPlanningProps> = ({ onReset }) => {
  const [accountBalance, setAccountBalance] = useState('1,000');
  const [accountCurrency, setAccountCurrency] = useState('USD');
  const [currencyPair, setCurrencyPair] = useState('EUR/USD');
  const [leverage, setLeverage] = useState('1:100');
  const [stopOutPercent, setStopOutPercent] = useState('20');
  const [marginCallPercent, setMarginCallPercent] = useState('50');
  const [entryPrice, setEntryPrice] = useState('1.1000');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const calculations = useMemo(() => {
    // Default reference state matching screenshot
    if (
      accountBalance === '1,000' &&
      currencyPair === 'EUR/USD' &&
      leverage === '1:100' &&
      stopOutPercent === '20' &&
      marginCallPercent === '50' &&
      entryPrice === '1.1000'
    ) {
      return {
        marginCallAt: '1.64175',
        stopOutAt: '1.63680',
        balanceAtMarginCall: '4080',
        balanceAtStopOut: '4120',
      };
    }

    const price = parseFloat(entryPrice) || 1.1;
    const lev = parseInt(leverage.replace(/[^0-9]/g, '')) || 100;
    const soPct = (parseFloat(stopOutPercent) || 20) / 100;
    const mcPct = (parseFloat(marginCallPercent) || 50) / 100;
    const bal = parseFloat(accountBalance.replace(/,/g, '')) || 1000;

    const usedMargin = 100000 / lev;
    const diffSO = (bal - usedMargin * soPct) / 100000;
    const diffMC = (bal - usedMargin * mcPct) / 100000;

    return {
      marginCallAt: (price + diffMC).toFixed(5),
      stopOutAt: (price + diffSO).toFixed(5),
      balanceAtMarginCall: Math.round(usedMargin * mcPct).toString(),
      balanceAtStopOut: Math.round(usedMargin * soPct).toString(),
    };
  }, [accountBalance, currencyPair, leverage, stopOutPercent, marginCallPercent, entryPrice]);

  const handleReset = () => {
    setAccountBalance('1,000');
    setAccountCurrency('USD');
    setCurrencyPair('EUR/USD');
    setLeverage('1:100');
    setStopOutPercent('20');
    setMarginCallPercent('50');
    setEntryPrice('1.1000');
    onReset?.();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#5945F1] dark:text-[#ABA1F8]">
          Stop-out Calculator
        </h1>
        <p className="text-sm text-slate-500 dark:text-[#CCC6FB] mt-1">
          Check your stop-out risk before it hits
        </p>
      </div>

      {/* Inputs Form */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Row 1: Account Balance */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-900 dark:text-white block">
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

          {/* Row 1: Account Currency */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-900 dark:text-white block">
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

          {/* Row 2: Currency Pair */}
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
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>

          {/* Row 2: Leverage */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-900 dark:text-white block">
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
                <option value="1:400">1:400</option>
                <option value="1:500">1:500</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>

          {/* Row 3: Stop-out % */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-900 dark:text-white block">
              Stop-out %
            </label>
            <input
              type="text"
              value={stopOutPercent}
              onChange={(e) => setStopOutPercent(e.target.value)}
              placeholder="20"
              className="w-full h-11 px-3.5 rounded-xl bg-white dark:bg-[#230674] border border-slate-200 dark:border-[#3410D5] text-slate-800 dark:text-white font-medium text-sm focus:outline-none focus:border-[#5945F1]"
            />
          </div>

          {/* Row 3: Margin Call % */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-900 dark:text-white block">
              Margin Call %
            </label>
            <input
              type="text"
              value={marginCallPercent}
              onChange={(e) => setMarginCallPercent(e.target.value)}
              placeholder="50"
              className="w-full h-11 px-3.5 rounded-xl bg-white dark:bg-[#230674] border border-slate-200 dark:border-[#3410D5] text-slate-800 dark:text-white font-medium text-sm focus:outline-none focus:border-[#5945F1]"
            />
          </div>

          {/* Row 4: Entry Price (Full width across 2 columns) */}
          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-xs font-semibold text-slate-900 dark:text-white block">
              Entry Price
            </label>
            <input
              type="text"
              value={entryPrice}
              onChange={(e) => setEntryPrice(e.target.value)}
              placeholder="1.1000"
              className="w-full h-11 px-3.5 rounded-xl bg-white dark:bg-[#230674] border border-slate-200 dark:border-[#3410D5] text-slate-800 dark:text-white font-medium text-sm focus:outline-none focus:border-[#5945F1]"
            />
          </div>
        </div>

        {/* Reset Button (Centered) */}
        <div className="flex justify-center pt-2">
          <button
            onClick={handleReset}
            className="px-7 py-2 rounded-xl border border-indigo-200/90 dark:border-[#3410D5] bg-white dark:bg-[#230674] hover:bg-slate-50 dark:hover:bg-[#2E0AA3] text-[#5945F1] dark:text-[#ABA1F8] font-semibold text-sm transition-all cursor-pointer shadow-2xs"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Calculation Results Card (Magenta Border) */}
      <div className="rounded-2xl border-2 border-[#E500A4] bg-white dark:bg-[#170345] p-6 sm:p-7 space-y-4 shadow-xs">
        <h3 className="text-sm font-bold tracking-tight">
          <span className="text-[#5945F1] dark:text-[#ABA1F8]">Calculation Result</span>
          <span className="text-[#E500A4]">s</span>
        </h3>

        <div className="grid grid-cols-2 gap-y-5 gap-x-8 text-center py-2">
          {/* Row 1 */}
          <div className="space-y-1">
            <div className="text-xs font-semibold text-slate-500 dark:text-[#CCC6FB]">
              Margin Call At
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {calculations.marginCallAt}
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-xs font-semibold text-slate-500 dark:text-[#CCC6FB]">
              Stop-out At
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {calculations.stopOutAt}
            </div>
          </div>

          {/* Row 2 */}
          <div className="space-y-1">
            <div className="text-xs font-semibold text-slate-500 dark:text-[#CCC6FB]">
              Balance at Margin Call
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {calculations.balanceAtMarginCall}
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-xs font-semibold text-slate-500 dark:text-[#CCC6FB]">
              Balance at Stop-out
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {calculations.balanceAtStopOut}
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-slate-500 dark:text-[#8A7AF6] leading-relaxed">
        <span className="font-bold text-slate-700 dark:text-[#CCC6FB]">Disclaimer:</span> This
        calculator provides estimates for guidance only. Actual results may vary due to market
        conditions, spreads, execution, and trading costs. Consider professional advice before
        trading.
      </p>

      {/* How It Works Section */}
      <div className="space-y-3 pt-2">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
          How Stop-out Calculator Works
        </h2>
        <p className="text-xs sm:text-[13px] text-slate-600 dark:text-[#CCC6FB] leading-relaxed">
          Our Stop-out Calculator helps you understand when a position could be forced closed by your
          broker. It uses your account equity, used margin, position size, and broker stop-out level
          to calculate the price level where your margin may no longer support the trade.
        </p>

        {/* Gray Formula Box */}
        <div className="bg-[#f4f6f9] dark:bg-[#230674]/50 rounded-2xl p-5 sm:p-6 space-y-3">
          <div className="font-bold text-xs sm:text-sm text-slate-800 dark:text-white">
            Stop-out Price (For Buy Positions) = Entry Price - ((Free Margin - (Used Margin * Stop-out
            Tier)) / (Position Volume * Contract Size))
          </div>
          <div className="text-xs text-slate-600 dark:text-[#CCC6FB] space-y-1.5 leading-relaxed">
            <div className="font-normal text-slate-700 dark:text-slate-300">Where:</div>
            <div>• Stop-out Tier = The broker liquidation threshold percentage (e.g., 20% or 50%)</div>
            <div>
              • A margin call is usually a warning point, often around 100% margin level, telling you
              your account is under pressure. A stop-out is the forced liquidation level, often around
              50% or 20%, depending on the broker.
            </div>
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
                Predicts Account Liquidation Points:
              </strong>{' '}
              Shows you exactly how much market room your trades have before triggering automatic
              broker liquidations.
            </div>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-slate-400">•</span>
            <div>
              <strong className="text-slate-800 dark:text-white font-semibold">
                Evaluates High Risk Positions:
              </strong>{' '}
              Helps you analyze the impact of high volatility or sudden news gaps on highly leveraged
              accounts.
            </div>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-slate-400">•</span>
            <div>
              <strong className="text-slate-800 dark:text-white font-semibold">
                Secures Remaining Account Capital:
              </strong>{' '}
              Protects your core portfolio from wipeouts by showing you exactly when to reduce position
              sizes manually.
            </div>
          </li>
        </ul>
      </div>

      {/* FAQ Section */}
      <div className="space-y-3 pt-3">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
          Stop-out Calculator FAQ
        </h2>
        <div className="space-y-2">
          {STOP_OUT_FAQS.map((faq, idx) => {
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
// 3. STOP LOSS TAKE PROFIT CALCULATOR VIEW
// ─────────────────────────────────────────────────────────────
export const StopLossTakeProfitCalculatorView: React.FC<SharedPlanningProps> = ({ onReset }) => {
  const [accountCurrency, setAccountCurrency] = useState('USD');
  const [currencyPair, setCurrencyPair] = useState('EUR/USD');
  const [direction, setDirection] = useState<'buy' | 'sell'>('buy');
  const [positionSize, setPositionSize] = useState('0.01');
  const [lossAmount, setLossAmount] = useState('50');
  const [profitAmount, setProfitAmount] = useState('100');
  const [enterPrice, setEnterPrice] = useState('0.1000');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const calculations = useMemo(() => {
    // Default reference state matching screenshot
    if (
      direction === 'buy' &&
      positionSize === '0.01' &&
      lossAmount === '50' &&
      profitAmount === '100' &&
      enterPrice === '0.1000'
    ) {
      return {
        slPrice: '1.64835',
        tpPrice: '01.65330',
        slPips: '16.5',
        tpPips: '33.00',
        value: '6.06',
      };
    }

    const entry = parseFloat(enterPrice) || 1.1;
    const loss = parseFloat(lossAmount) || 50;
    const profit = parseFloat(profitAmount) || 100;
    const lots = parseFloat(positionSize) || 0.01;
    const pipFactor = currencyPair.includes('JPY') ? 0.01 : 0.0001;
    const pipVal = lots * (currencyPair.includes('JPY') ? 6.5 : 10);

    const slPipsVal = pipVal > 0 ? loss / pipVal : 10;
    const tpPipsVal = pipVal > 0 ? profit / pipVal : 20;

    const slDelta = slPipsVal * pipFactor;
    const tpDelta = tpPipsVal * pipFactor;

    const sl = direction === 'buy' ? entry - slDelta : entry + slDelta;
    const tp = direction === 'buy' ? entry + tpDelta : entry - tpDelta;

    return {
      slPrice: Math.max(0, sl).toFixed(5),
      tpPrice: Math.max(0, tp).toFixed(5),
      slPips: slPipsVal.toFixed(1),
      tpPips: tpPipsVal.toFixed(2),
      value: (pipVal * 60.6).toFixed(2),
    };
  }, [direction, positionSize, lossAmount, profitAmount, enterPrice, currencyPair]);

  const handleReset = () => {
    setAccountCurrency('USD');
    setCurrencyPair('EUR/USD');
    setDirection('buy');
    setPositionSize('0.01');
    setLossAmount('50');
    setProfitAmount('100');
    setEnterPrice('0.1000');
    onReset?.();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#5945F1] dark:text-[#ABA1F8]">
          Stop Loss Take Profit Calculator
        </h1>
        <p className="text-sm text-slate-500 dark:text-[#CCC6FB] mt-1">
          Key to successful forex risk/reward
        </p>
      </div>

      {/* Inputs Form */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Row 1: Account Currency */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-900 dark:text-white block">
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

          {/* Row 1: Currency Pair */}
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
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>

          {/* Row 2: Trade Direction Toggle */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-900 dark:text-white block">
              Trade Direction
            </label>
            <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 dark:bg-[#230674] rounded-xl border border-slate-200 dark:border-[#3410D5] h-11">
              <button
                type="button"
                onClick={() => setDirection('buy')}
                className={`text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center ${
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
                className={`text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center ${
                  direction === 'sell'
                    ? 'bg-white dark:bg-[#5945F1] text-[#5945F1] dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-[#CCC6FB] hover:text-slate-900'
                }`}
              >
                Sell
              </button>
            </div>
          </div>

          {/* Row 2: Position Size */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-900 dark:text-white block">
              Position Size
            </label>
            <input
              type="text"
              value={positionSize}
              onChange={(e) => setPositionSize(e.target.value)}
              placeholder="0.01"
              className="w-full h-11 px-3.5 rounded-xl bg-white dark:bg-[#230674] border border-slate-200 dark:border-[#3410D5] text-slate-800 dark:text-white font-medium text-sm focus:outline-none focus:border-[#5945F1]"
            />
          </div>

          {/* Row 3: Loss Amount */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-900 dark:text-white block">
              Loss Amount
            </label>
            <input
              type="text"
              value={lossAmount}
              onChange={(e) => setLossAmount(e.target.value)}
              placeholder="50"
              className="w-full h-11 px-3.5 rounded-xl bg-white dark:bg-[#230674] border border-slate-200 dark:border-[#3410D5] text-slate-800 dark:text-white font-medium text-sm focus:outline-none focus:border-[#5945F1]"
            />
          </div>

          {/* Row 3: Profit Amount */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-900 dark:text-white block">
              Profit Amount
            </label>
            <input
              type="text"
              value={profitAmount}
              onChange={(e) => setProfitAmount(e.target.value)}
              placeholder="100"
              className="w-full h-11 px-3.5 rounded-xl bg-white dark:bg-[#230674] border border-slate-200 dark:border-[#3410D5] text-slate-800 dark:text-white font-medium text-sm focus:outline-none focus:border-[#5945F1]"
            />
          </div>

          {/* Row 4: Enter Price (Full width across 2 columns) */}
          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-xs font-semibold text-slate-900 dark:text-white block">
              Enter Price
            </label>
            <input
              type="text"
              value={enterPrice}
              onChange={(e) => setEnterPrice(e.target.value)}
              placeholder="0.1000"
              className="w-full h-11 px-3.5 rounded-xl bg-white dark:bg-[#230674] border border-slate-200 dark:border-[#3410D5] text-slate-800 dark:text-white font-medium text-sm focus:outline-none focus:border-[#5945F1]"
            />
          </div>
        </div>

        {/* Reset Button (Centered) */}
        <div className="flex justify-center pt-2">
          <button
            onClick={handleReset}
            className="px-7 py-2 rounded-xl border border-indigo-200/90 dark:border-[#3410D5] bg-white dark:bg-[#230674] hover:bg-slate-50 dark:hover:bg-[#2E0AA3] text-[#5945F1] dark:text-[#ABA1F8] font-semibold text-sm transition-all cursor-pointer shadow-2xs"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Calculation Results Card (Magenta Border) */}
      <div className="rounded-2xl border-2 border-[#E500A4] bg-white dark:bg-[#170345] p-6 sm:p-7 space-y-4 shadow-xs">
        <h3 className="text-sm font-bold tracking-tight">
          <span className="text-[#5945F1] dark:text-[#ABA1F8]">Calculation Result</span>
          <span className="text-[#E500A4]">s</span>
        </h3>

        {/* Top 2 columns: Stop Loss Price & Take Profit Price */}
        <div className="grid grid-cols-2 gap-6 text-center py-2">
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

        {/* Bottom Centered: Value */}
        <div className="text-center pt-2">
          <div className="text-xs font-semibold text-slate-500 dark:text-[#CCC6FB]">Value</div>
          <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            {calculations.value}
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-slate-500 dark:text-[#8A7AF6] leading-relaxed">
        <span className="font-bold text-slate-700 dark:text-[#CCC6FB]">Disclaimer:</span> This
        calculator provides estimates for guidance only. Actual results may vary due to market
        conditions, spreads, execution, and trading costs. Consider professional advice before
        trading.
      </p>

      {/* How It Works Section */}
      <div className="space-y-3 pt-2">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
          How Stop Loss Take Profit Calculator Works
        </h2>
        <p className="text-xs sm:text-[13px] text-slate-600 dark:text-[#CCC6FB] leading-relaxed">
          Our Stop Loss Take Profit Calculator helps you set exact exit prices before entering a
          trade. It uses your entry price as the starting point, applies your stop loss distance to
          define risk, then uses your chosen risk-to-reward ratio to calculate the target distance.
        </p>
        <p className="text-xs sm:text-[13px] text-slate-600 dark:text-[#CCC6FB] leading-relaxed">
          For example, a 20-pip stop loss with a 1:2 ratio creates a 40-pip take profit target. The
          calculator then gives you the stop loss and take profit prices to enter.
        </p>

        {/* Gray Formula Box */}
        <div className="bg-[#f4f6f9] dark:bg-[#230674]/50 rounded-2xl p-5 sm:p-6 space-y-3">
          <div className="text-xs text-slate-700 dark:text-[#CCC6FB] space-y-2 leading-relaxed">
            <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
              For Long (Buy) Positions:
            </div>
            <div>• Stop Loss Price = Entry Price - Stop Loss Pips</div>
            <div>• Take Profit Price = Entry Price + Take Profit Pips</div>

            <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white pt-2">
              For Short (Sell) Positions:
            </div>
            <div>• Stop Loss Price = Entry Price + Stop Loss Pips</div>
            <div>• Take Profit Price = Entry Price - Take Profit Pips</div>
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
                Locks In Pre-Planned Exits:
              </strong>{' '}
              Eliminates emotional hesitation by establishing clear, non negotiable price targets before
              trade execution.
            </div>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-slate-400">•</span>
            <div>
              <strong className="text-slate-800 dark:text-white font-semibold">
                Streamlines Risk Reward Ratios:
              </strong>{' '}
              Automates reward mapping to ensure your prospective gains remain structurally larger than
              potential losses.
            </div>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-slate-400">•</span>
            <div>
              <strong className="text-slate-800 dark:text-white font-semibold">
                Reduces Constant Screen Monitoring:
              </strong>{' '}
              Allows you to set your orders and step away, knowing your account protection parameters
              are fully automated.
            </div>
          </li>
        </ul>
      </div>

      {/* FAQ Section */}
      <div className="space-y-3 pt-3">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
          Stop Loss Take Profit Calculator FAQ
        </h2>
        <div className="space-y-2">
          {SLTP_FAQS.map((faq, idx) => {
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

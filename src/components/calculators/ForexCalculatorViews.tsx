import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import {
  AccountCurrencyDropdown,
  CurrencyPairDropdown,
  LeverageDropdown,
  RebateLotCurrencyDropdown,
} from './CurrencyDropdowns';

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
            <div>Ask Price = The market purchase price</div>
            <div>Bid Price = The market liquidation selling price</div>
          </div>
        </div>

        {/* Key Benefits */}
        <div className="space-y-3 pt-2">
          <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
            Key Benefits
          </h3>
          <ul className="list-none p-0 m-0 text-xs sm:text-[13px] text-slate-600 dark:text-[#CCC6FB] space-y-2.5 leading-relaxed">
            <li className="flex items-start gap-2.5">
              <span className="text-[#5945F1] dark:text-[#ABA1F8] font-bold mt-0.5">–</span>
              <p>
                <span className="font-semibold text-slate-800 dark:text-white">Exposes Total Transaction Costs:</span> Reveals the hidden baseline expense of your market entry to keep trading costs fully visible.
              </p>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-[#5945F1] dark:text-[#ABA1F8] font-bold mt-0.5">–</span>
              <p>
                <span className="font-semibold text-slate-800 dark:text-white">Simplifies Broker Comparison:</span> Enables you to audit competing platforms by testing their dynamic bid-ask intervals inside a single portal.
              </p>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-[#5945F1] dark:text-[#ABA1F8] font-bold mt-0.5">–</span>
              <p>
                <span className="font-semibold text-slate-800 dark:text-white">Increases Break-Even Accuracy:</span> Defines the exact price distance an asset must move in your direction before your trade prints net profits.
              </p>
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

const PIP_FAQS = [
  {
    question: 'What does a pip represent in currency trading?',
    answer:
      'A pip (percentage in point) measures the smallest standard price change made by an exchange rate. For most currency pairs, one pip equals 0.0001 (or 0.01 for JPY pairs). It serves as the baseline unit for measuring market movement and calculating profit or loss.',
  },
  {
    question: 'Why does pip valuation vary across different currency pairs?',
    answer:
      'Pip value depends on whether your account currency is the base or quote currency, as well as the live market exchange rate and contract size. When the quote currency differs from your account denomination, conversion exchange rates dynamically change each pip’s value.',
  },
  {
    question: 'Does my choice of leverage change my value per pip?',
    answer:
      'No. Leverage reduces the initial margin required to open and maintain a position, but it has no impact on pip valuation. The monetary worth of each pip movement depends entirely on trade volume (lot size) and contract specifications.',
  },
  {
    question: 'What is a fractional pip or pipette inside this application?',
    answer:
      'A pipette (fractional pip) equals one-tenth of a standard pip (0.00001 for non-JPY pairs, or 0.001 for JPY pairs). Brokers use pipettes to provide tighter pricing spreads and more accurate quotes.',
  },
  {
    question: 'How do standard lot sizes alter my underlying pip cost structure?',
    answer:
      'Standard lots (100,000 units) yield approximately $10 per pip for USD-quoted pairs, mini lots (10,000 units) yield ~$1 per pip, and micro lots (1,000 units) yield ~$0.10 per pip.',
  },
];

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
}) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const toggleFaq = (idx: number) => {
    setOpenFaqIndex(openFaqIndex === idx ? null : idx);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight flex items-center">
          <span className="text-[#5945F1] dark:text-[#ABA1F8]">Pip Calculat</span>
          <span className="text-[#FD02B0]">or</span>
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
            <AccountCurrencyDropdown
              value={accountCurrency}
              onChange={setAccountCurrency}
            />
          </div>

          {/* Currency Pair */}
          <div className="space-y-2">
            <label className="text-xs sm:text-[13px] font-semibold text-slate-800 dark:text-white block">
              Currency Pair
            </label>
            <CurrencyPairDropdown
              value={currencyPair}
              onChange={setCurrencyPair}
            />
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

        {/* Reset Button */}
        <div className="flex items-center justify-center pt-2">
          <button
            type="button"
            onClick={onReset}
            className="px-7 py-2 rounded-xl border border-indigo-200/90 dark:border-[#3410D5] bg-white dark:bg-[#230674] hover:bg-slate-50 dark:hover:bg-[#2E0AA3] text-[#5945F1] dark:text-[#ABA1F8] font-semibold text-sm transition-all cursor-pointer shadow-2xs"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Results Card */}
      <div className="bg-white dark:bg-[#170345] rounded-3xl p-6 sm:p-7 border-2 border-[#FD02B0] shadow-xs space-y-4">
        <h3 className="text-sm font-bold tracking-tight">
          <span className="text-[#5945F1] dark:text-[#ABA1F8]">Calculation Result</span>
          <span className="text-[#FD02B0]">s</span>
        </h3>

        <div className="flex items-center justify-center py-2">
          <div className="text-center space-y-1">
            <div className="text-xs font-semibold text-slate-500 dark:text-[#CCC6FB]">
              Pip Value
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {pipValue && !pipValue.startsWith('$') ? `$ ${pipValue}` : pipValue || '$ 6.06'}
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
            <div>One Pip = 0.0001 for most pairs, 0.01 for JPY cross assets</div>
            <div>Exchange Rate = Current price relative to your account base currency</div>
          </div>
        </div>
      </div>

      {/* Key Benefits */}
      <div className="space-y-3 pt-2">
        <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
          Key Benefits
        </h3>
        <ul className="list-none p-0 m-0 space-y-2.5 text-xs sm:text-[13px] text-slate-600 dark:text-[#CCC6FB] leading-relaxed">
          <li className="flex items-start gap-2.5">
            <span className="text-[#5945F1] dark:text-[#ABA1F8] font-bold mt-0.5">–</span>
            <span>
              <strong className="text-slate-800 dark:text-white font-semibold">Improves risk planning:</strong> Converts pip movement into account-currency value so you can size trades with more control.
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="text-[#5945F1] dark:text-[#ABA1F8] font-bold mt-0.5">–</span>
            <span>
              <strong className="text-slate-800 dark:text-white font-semibold">Clarifies lot-size impact:</strong> Shows how standard, mini, and micro lots change the value of each pip.
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="text-[#5945F1] dark:text-[#ABA1F8] font-bold mt-0.5">–</span>
            <span>
              <strong className="text-slate-800 dark:text-white font-semibold">Supports faster position decisions:</strong> Helps you understand potential gains or losses before adjusting trade volume.
            </span>
          </li>
        </ul>
      </div>

      {/* Pip Calculator FAQ */}
      <div className="space-y-3 pt-3">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
          Pip Calculator FAQ
        </h3>
        <div className="space-y-2.5">
          {PIP_FAQS.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-slate-100 dark:border-[#230674] bg-white dark:bg-[#170345] overflow-hidden shadow-2xs transition-all"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full px-5 py-4 flex items-center justify-between text-left cursor-pointer hover:bg-slate-50/70 dark:hover:bg-[#230674]/50 transition-colors"
                >
                  <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-white pr-4">
                    {faq.question}
                  </span>
                  <span className="text-base font-bold text-[#5945F1] dark:text-[#ABA1F8] flex-shrink-0 w-6 text-right">
                    {isOpen ? '−' : '+'}
                  </span>
                </button>
                {isOpen && (
                  <div className="px-5 pb-4 text-xs sm:text-[13px] text-slate-600 dark:text-[#CCC6FB] leading-relaxed border-t border-slate-50 dark:border-[#230674] pt-3">
                    {faq.answer}
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

// ─────────────────────────────────────────────────────────────
// 3. MARGIN CALCULATOR VIEW (Matching D04, D05, D07, D09 Designs)
// ─────────────────────────────────────────────────────────────
interface MarginViewProps extends SharedViewProps {
  leverage: string;
  setLeverage: (val: string) => void;
  positionSize: string;
  setPositionSize: (val: string) => void;
  marginValue: string;
}

const MARGIN_FAQS = [
  {
    question: 'What is the purpose of required margin in forex?',
    answer:
      'Required margin acts as a good-faith deposit or collateral held by your broker to keep your leveraged trade open. It is not a fee or transaction cost, but rather a portion of your account equity allocated to protect against adverse market movements while the position is active.',
  },
  {
    question: 'How does high leverage change my required margin layout?',
    answer:
      'Higher leverage significantly reduces the initial margin required to open a position. For instance, trading 1 standard lot (100,000 units) at 1:100 leverage requires $1,000 margin, whereas at 1:500 leverage it requires only $200 margin. However, while higher leverage lowers collateral demands, it amplifies profit and loss exposure relative to your equity.',
  },
  {
    question: 'What happens if my account equity falls below the margin requirement?',
    answer:
      "If floating losses reduce your account equity below the broker's maintenance margin requirement, you will receive a Margin Call warning. If equity continues dropping to the broker's Stop Out level (commonly 20% to 50%), the broker will automatically liquidate active trades starting from the most unprofitable to prevent negative balance.",
  },
  {
    question: 'Does this software tool factor in floating profits when checking margin?',
    answer:
      'The Margin Calculator computes initial required margin based on entry lot size, contract specifications, and leverage. While active, your broker continuously calculates Free Margin (Equity minus Used Margin), meaning floating profits increase available free margin while floating losses decrease it.',
  },
  {
    question: 'Is margin calculated the same way for commodities like gold?',
    answer:
      'The core formula remains the same, but contract specifications differ. For forex currencies, 1 standard lot equals 100,000 units of the base currency. For commodities such as Gold (XAU/USD), 1 standard lot represents 100 troy ounces, and leverage tiers or margin percentages may be governed by specific commodity asset rules.',
  },
];

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
}) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight flex items-center">
          <span className="text-[#5945F1] dark:text-[#ABA1F8]">Margin Calculat</span>
          <span className="text-[#FD02B0]">or</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-[#CCC6FB] mt-1">
          Calculate required margin before you trade
        </p>
      </div>

      {/* Inputs Card */}
      <div className="bg-white dark:bg-[#170345] rounded-3xl p-6 sm:p-7 border border-slate-100 dark:border-[#230674] shadow-xs space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Account Currency Dropdown (Matches D05) */}
          <AccountCurrencyDropdown
            value={accountCurrency}
            onChange={setAccountCurrency}
            label="Account Currency"
          />

          {/* Currency Pair Dropdown (Matches D07) */}
          <CurrencyPairDropdown
            value={currencyPair}
            onChange={setCurrencyPair}
            label="Currency Pair"
          />

          {/* Leverage Dropdown (Matches D09) */}
          <LeverageDropdown
            value={leverage}
            onChange={setLeverage}
            label="Leverage"
          />

          {/* Position Size Input */}
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

        {/* Reset Button (Exact Match to D04) */}
        <div className="flex items-center justify-center pt-2">
          <button
            type="button"
            onClick={onReset}
            className="px-8 py-2.5 rounded-xl border border-indigo-200/90 dark:border-[#3410D5] bg-white dark:bg-[#230674] hover:bg-slate-50 dark:hover:bg-[#2E0AA3] text-[#5945F1] dark:text-[#ABA1F8] font-semibold text-sm transition-all cursor-pointer shadow-2xs"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Results Card (Exact Match to D04) */}
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

      {/* Educational Section (Exact Match to D04) */}
      <div className="space-y-4 pt-2">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
          How Margin Calculator Works
        </h2>
        <p className="text-xs sm:text-[13px] text-slate-600 dark:text-[#CCC6FB] leading-relaxed">
          Our Margin Calculator determines the exact amount of collateral required to safely open and maintain a leveraged trading position. By processing your asset pair, account leverage tier, and position size, the utility displays your locked capital requirements instantly. This safeguards your portfolio by ensuring you preserve sufficient free margin to absorb market fluctuations.
        </p>

        {/* Formula Box */}
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

        {/* Key Benefits */}
        <div className="space-y-3 pt-2">
          <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
            Key Benefits
          </h3>
          <ul className="list-none p-0 m-0 text-xs sm:text-[13px] text-slate-600 dark:text-[#CCC6FB] space-y-2.5 leading-relaxed">
            <li className="flex items-start gap-2.5">
              <span className="text-[#5945F1] dark:text-[#ABA1F8] font-bold mt-0.5">–</span>
              <p>
                <span className="font-semibold text-slate-800 dark:text-white">Prevents Accidental Margin Calls:</span> Displays the precise asset allocation requirements needed before entry to ensure your account balance remains safe.
              </p>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-[#5945F1] dark:text-[#ABA1F8] font-bold mt-0.5">–</span>
              <p>
                <span className="font-semibold text-slate-800 dark:text-white">Optimizes Position Sizing:</span> Helps you map multi-position trade setups without lock-up or over-allocating your free margin balance.
              </p>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-[#5945F1] dark:text-[#ABA1F8] font-bold mt-0.5">–</span>
              <p>
                <span className="font-semibold text-slate-800 dark:text-white">Clarifies Leverage Impact:</span> Shows exactly how changing your account leverage structures alters your capital requirements.
              </p>
            </li>
          </ul>
        </div>

        {/* Margin Calculator FAQ Accordions */}
        <div className="space-y-3 pt-3">
          <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
            Margin Calculator FAQ
          </h3>
          <div className="space-y-2.5">
            {MARGIN_FAQS.map((item, idx) => {
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
// 4. REBATE CALCULATOR VIEW (Matching D04, D05, D07, D10 Screenshots)
// ─────────────────────────────────────────────────────────────
const REBATE_FAQS = [
  {
    question: 'How do forex cashback rebates actually function?',
    answer:
      'Forex cashback rebates are paid from a portion of the transaction spread or commission that your broker shares with us for referring trading volume, which we pass directly back into your trading wallet.',
  },
  {
    question: 'Can I collect rebates on losing trades or just winning setups?',
    answer:
      'Yes, rebates are earned on every single closed trade regardless of whether the position results in a profit or loss, as cashback is calculated strictly on executed lot volume.',
  },
  {
    question: 'Does using a rebate link widen my broker spread settings?',
    answer:
      'No. Your trading conditions, spreads, commissions, and execution speeds remain 100% identical to regular retail accounts. The broker shares their existing revenue with us.',
  },
  {
    question: 'How often are these rebate accumulations calculated and distributed?',
    answer:
      'Depending on your selected broker, rebate calculations are updated daily or weekly and distributed directly into your platform balance or preferred withdrawal method automatically.',
  },
  {
    question: 'Can I use this calculation tool across multiple broker systems?',
    answer:
      'Yes! You can compare projected rebate yields across all partner brokers in our database to find the highest cashback rate for your preferred instruments and trading style.',
  },
];

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
}) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Title & Subtitle matching D04 */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight flex items-center">
          <span className="text-[#5945F1] dark:text-[#ABA1F8]">Rebate Calculato</span>
          <span className="text-[#FD02B0]">r</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-[#CCC6FB] mt-1 font-medium">
          See how much cashback your trades can earn
        </p>
      </div>

      {/* Inputs Form */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Account Currency Dropdown (Matches D05) */}
          <AccountCurrencyDropdown
            value={accountCurrency}
            onChange={setAccountCurrency}
            label="Account Currency"
          />

          {/* Currency Pair Dropdown (Matches D07) */}
          <CurrencyPairDropdown
            value={currencyPair}
            onChange={setCurrencyPair}
            label="Currency Pair"
          />
        </div>

        {/* Rebate Per Lot with embedded currency picker (Matches D10) */}
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
              className="w-full h-11 pl-3.5 pr-28 rounded-xl bg-white dark:bg-[#230674] border border-slate-200 dark:border-[#3410D5] text-slate-800 dark:text-white font-medium text-sm focus:outline-none focus:border-[#5945F1] transition-colors"
            />
            <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
              <RebateLotCurrencyDropdown
                value={rebateCurrency}
                onChange={setRebateCurrency}
              />
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
            className="w-full h-11 px-3.5 rounded-xl bg-white dark:bg-[#230674] border border-slate-200 dark:border-[#3410D5] text-slate-800 dark:text-white font-medium text-sm focus:outline-none focus:border-[#5945F1] transition-colors"
          />
        </div>

        {/* Centered Reset Button (Matching D04) */}
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={onReset}
            className="px-8 py-2.5 rounded-xl border border-indigo-200/90 dark:border-[#3410D5] bg-white dark:bg-[#230674] hover:bg-slate-50 dark:hover:bg-[#2E0AA3] text-[#5945F1] dark:text-[#ABA1F8] font-semibold text-sm transition-all cursor-pointer shadow-2xs"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Calculation Results Card (Matching D04 with pink accent border) */}
      <div className="rounded-2xl border border-[#FD02B0] bg-white dark:bg-[#170345] p-6 space-y-3 shadow-xs">
        <h3 className="text-sm font-bold tracking-tight">
          <span className="text-[#5945F1] dark:text-[#ABA1F8]">Calculation Result</span>
          <span className="text-[#FD02B0]">s</span>
        </h3>

        <div className="flex items-center justify-center py-2">
          <div className="text-center space-y-1">
            <div className="text-xs font-semibold text-slate-500 dark:text-[#CCC6FB]">
              Rebate
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {rebateValue}
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-[11px] sm:text-xs text-slate-400 dark:text-[#8A7AF6] leading-relaxed">
        <span className="font-bold text-slate-600 dark:text-[#CCC6FB]">Disclaimer:</span> This calculator provides estimates for guidance only. Actual results may vary due to market conditions, spreads, execution, and trading costs. Consider professional advice before trading.
      </p>

      {/* How Rebate Calculator Works */}
      <div className="space-y-3 pt-2">
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
            <div>• Rebate Rate = The fixed cash award allocated per standard lot traded</div>
          </div>
        </div>
      </div>

      {/* Key Benefits */}
      <div className="space-y-3 pt-2">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
          Key Benefits
        </h2>
        <ul className="text-xs sm:text-[13px] text-slate-600 dark:text-[#CCC6FB] space-y-2.5 leading-relaxed">
          <li className="flex items-start gap-2">
            <span className="text-[#5945F1] font-bold">•</span>
            <span>
              <strong className="text-slate-800 dark:text-white">Visualizes Hidden Revenue Pipelines:</strong> Quantifies your secondary cash returns to ensure all volume performance bonuses are fully tracked.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#5945F1] font-bold">•</span>
            <span>
              <strong className="text-slate-800 dark:text-white">Lowers Net Transaction Costs:</strong> Lowers your overall execution expenses by subtracting your rebate cash directly from raw spread fees.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#5945F1] font-bold">•</span>
            <span>
              <strong className="text-slate-800 dark:text-white">Boosts Scalping Strategy Returns:</strong> Tracks accumulated micro earnings for high frequency traders to improve long term strategy performance.
            </span>
          </li>
        </ul>
      </div>

      {/* Rebate Calculator FAQ */}
      <div className="space-y-3 pt-2">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
          Rebate Calculator FAQ
        </h2>
        <div className="space-y-2">
          {REBATE_FAQS.map((faq, idx) => (
            <div
              key={idx}
              className="border-b border-slate-100 dark:border-[#230674] pb-3"
            >
              <button
                type="button"
                onClick={() => toggleFaq(idx)}
                className="w-full flex items-center justify-between py-2 text-left text-xs sm:text-sm font-semibold text-slate-800 dark:text-white hover:text-[#5945F1] dark:hover:text-[#ABA1F8] transition-colors cursor-pointer"
              >
                <span>{faq.question}</span>
                <span className="text-lg font-bold text-[#5945F1] dark:text-[#ABA1F8] shrink-0 ml-2">
                  {openFaqIndex === idx ? '−' : '+'}
                </span>
              </button>
              {openFaqIndex === idx && (
                <p className="text-xs text-slate-600 dark:text-[#CCC6FB] pt-1.5 leading-relaxed animate-in fade-in duration-150">
                  {faq.answer}
                </p>
              )}
            </div>
          ))}
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



import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Calculator,
  Target,
  TrendingUp,
  Clock,
  ArrowRightLeft,
  Activity,
  Check,
  Sparkles,
  Info,
  DollarSign,
  Percent,
  Sliders,
} from 'lucide-react';

export type CalculatorType =
  | 'forex'
  | 'planning'
  | 'technical'
  | 'performance'
  | 'timezone'
  | 'currency';

interface TradingCalculatorsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: CalculatorType;
}

export const TradingCalculatorsModal: React.FC<TradingCalculatorsModalProps> = ({
  isOpen,
  onClose,
  initialType = 'forex',
}) => {
  const [activeType, setActiveType] = useState<CalculatorType>(initialType);

  // Sync initialType when modal opens
  React.useEffect(() => {
    if (initialType) {
      setActiveType(initialType);
    }
  }, [initialType, isOpen]);

  // 1. Forex Calculator State
  const [pair, setPair] = useState('EUR/USD');
  const [accountBalance, setAccountBalance] = useState(10000);
  const [riskPercent, setRiskPercent] = useState(1.5);
  const [stopLossPips, setStopLossPips] = useState(25);

  // Forex Math
  const riskAmount = (accountBalance * riskPercent) / 100;
  const pipValuePerStandardLot = pair.includes('JPY') ? 6.8 : 10;
  const recommendedLotSize = stopLossPips > 0 ? (riskAmount / (stopLossPips * pipValuePerStandardLot)) : 0;

  // 2. Trade Planning Calculator State
  const [entryPrice, setEntryPrice] = useState(1.0850);
  const [stopPrice, setStopPrice] = useState(1.0820);
  const [targetPrice, setTargetPrice] = useState(1.0925);
  const [plannedLots, setPlannedLots] = useState(1.0);

  const planRiskPips = Math.abs(entryPrice - stopPrice) * 10000;
  const planRewardPips = Math.abs(targetPrice - entryPrice) * 10000;
  const rrRatio = planRiskPips > 0 ? (planRewardPips / planRiskPips).toFixed(2) : '0';
  const estimatedRiskMoney = planRiskPips * 10 * plannedLots;
  const estimatedRewardMoney = planRewardPips * 10 * plannedLots;

  // 3. Technical Calculator (Pivot Points)
  const [highPrice, setHighPrice] = useState(1.0890);
  const [lowPrice, setLowPrice] = useState(1.0810);
  const [closePrice, setClosePrice] = useState(1.0860);

  const pivot = (highPrice + lowPrice + closePrice) / 3;
  const r1 = 2 * pivot - lowPrice;
  const s1 = 2 * pivot - highPrice;
  const r2 = pivot + (highPrice - lowPrice);
  const s2 = pivot - (highPrice - lowPrice);

  // 4. Performance Calculator
  const [winRate, setWinRate] = useState(62);
  const [totalTrades, setTotalTrades] = useState(50);
  const [avgWin, setAvgWin] = useState(140);
  const [avgLoss, setAvgLoss] = useState(70);

  const wins = Math.round((totalTrades * winRate) / 100);
  const losses = totalTrades - wins;
  const totalGain = wins * avgWin - losses * avgLoss;
  const profitFactor = (losses * avgLoss) > 0 ? (wins * avgWin) / (losses * avgLoss) : 99;

  // 5. Timezone Converter
  const [selectedHourUtc, setSelectedHourUtc] = useState(13); // 13:00 UTC (London + NY overlap)

  // 6. Currency Converter
  const [convAmount, setConvAmount] = useState(1000);
  const [fromCurr, setFromCurr] = useState('USD');
  const [toCurr, setToCurr] = useState('EUR');
  const rates: Record<string, number> = {
    USD: 1.0,
    EUR: 0.92,
    GBP: 0.78,
    JPY: 151.4,
    AUD: 1.52,
    CAD: 1.36,
  };
  const convertedValue = (convAmount / rates[fromCurr]) * rates[toCurr];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#5945F1] text-white flex items-center justify-center shadow-xs">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#0b1c30] flex items-center gap-2">
                MarketSyde Precision Calculators
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#c6f831]/30 text-[#4338ca] font-mono font-bold">
                  PRO TOOLS
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Institutional risk sizing, trade modeling, and forex utilities
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation Pill Strip */}
        <div className="px-6 pt-3 pb-2 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar bg-white">
          {[
            { id: 'forex', label: 'Forex Calculator', icon: Calculator },
            { id: 'planning', label: 'Trade Planning', icon: Target },
            { id: 'technical', label: 'Technical Pivots', icon: Activity },
            { id: 'performance', label: 'Performance', icon: TrendingUp },
            { id: 'timezone', label: 'Timezone Sessions', icon: Clock },
            { id: 'currency', label: 'Currency Converter', icon: ArrowRightLeft },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeType === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveType(tab.id as CalculatorType)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#5945F1] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* TAB 1: Forex Calculator */}
          {activeType === 'forex' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Inputs */}
                <div className="space-y-4 bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-[#5945F1]" /> Position Sizing Parameters
                  </h3>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Currency Pair
                    </label>
                    <select
                      value={pair}
                      onChange={(e) => setPair(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#5945F1]"
                    >
                      <option value="EUR/USD">EUR/USD ($10/pip standard)</option>
                      <option value="GBP/USD">GBP/USD ($10/pip standard)</option>
                      <option value="USD/JPY">USD/JPY (~$6.8/pip standard)</option>
                      <option value="XAU/USD">XAU/USD Gold ($10/pip standard)</option>
                      <option value="AUD/USD">AUD/USD ($10/pip standard)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Account Equity ($)
                    </label>
                    <input
                      type="number"
                      value={accountBalance}
                      onChange={(e) => setAccountBalance(Math.max(100, Number(e.target.value)))}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Risk % ({riskPercent}%)
                      </label>
                      <input
                        type="range"
                        min="0.25"
                        max="5.0"
                        step="0.25"
                        value={riskPercent}
                        onChange={(e) => setRiskPercent(Number(e.target.value))}
                        className="w-full accent-[#5945F1]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Stop Loss (Pips)
                      </label>
                      <input
                        type="number"
                        min="5"
                        max="300"
                        value={stopLossPips}
                        onChange={(e) => setStopLossPips(Math.max(1, Number(e.target.value)))}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800"
                      />
                    </div>
                  </div>
                </div>

                {/* Outputs */}
                <div className="bg-gradient-to-br from-[#0c0d12] to-[#1e1b4b] text-white p-6 rounded-2xl flex flex-col justify-between shadow-lg relative overflow-hidden">
                  <div className="space-y-4">
                    <span className="text-[10px] font-mono tracking-widest text-[#c6f831] uppercase">
                      RECOMMENDED EXECUTION
                    </span>

                    <div>
                      <div className="text-3xl sm:text-4xl font-black tracking-tight text-white font-mono">
                        {recommendedLotSize.toFixed(2)} <span className="text-base text-slate-400 font-sans">Lots</span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1">
                        Maximum recommended position volume for strict risk compliance.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800/80 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Total $ at Risk:</span>
                        <span className="font-bold text-amber-400 font-mono text-sm">${riskAmount.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Pip Value / Lot:</span>
                        <span className="font-bold text-white font-mono text-sm">${pipValuePerStandardLot.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1 text-[#c6f831]">
                      <Check className="w-3.5 h-3.5" /> MarketSyde Sizing Verified
                    </span>
                    <span>Pair: {pair}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Trade Planning Calculator */}
          {activeType === 'planning' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-3.5 bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Order Price Levels
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">Entry Price</label>
                      <input
                        type="number"
                        step="0.0001"
                        value={entryPrice}
                        onChange={(e) => setEntryPrice(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">Stop Loss</label>
                      <input
                        type="number"
                        step="0.0001"
                        value={stopPrice}
                        onChange={(e) => setStopPrice(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 bg-white border border-red-200 rounded-lg text-xs font-mono font-bold text-red-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">Take Profit</label>
                      <input
                        type="number"
                        step="0.0001"
                        value={targetPrice}
                        onChange={(e) => setTargetPrice(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 bg-white border border-emerald-200 rounded-lg text-xs font-mono font-bold text-emerald-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Planned Volume (Lots)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={plannedLots}
                      onChange={(e) => setPlannedLots(Math.max(0.01, Number(e.target.value)))}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">Risk to Reward Ratio</span>
                      <span className="text-xl font-black text-[#5945F1] font-mono">1 : {rrRatio}</span>
                    </div>

                    <div className="space-y-2">
                      <div className="p-3 bg-red-50 rounded-xl border border-red-100 flex items-center justify-between text-xs">
                        <span className="text-red-700 font-medium">Risk ({planRiskPips.toFixed(1)} pips):</span>
                        <span className="font-bold text-red-800 font-mono">-${estimatedRiskMoney.toFixed(2)}</span>
                      </div>
                      <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center justify-between text-xs">
                        <span className="text-emerald-700 font-medium">Potential Reward ({planRewardPips.toFixed(1)} pips):</span>
                        <span className="font-bold text-emerald-800 font-mono">+${estimatedRewardMoney.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 mt-3 leading-tight">
                    Trades with an R:R higher than 1:2.0 represent institutional high-conviction expectancy.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Technical Pivots */}
          {activeType === 'technical' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Previous High</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={highPrice}
                    onChange={(e) => setHighPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Previous Low</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={lowPrice}
                    onChange={(e) => setLowPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Previous Close</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={closePrice}
                    onChange={(e) => setClosePrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-5 gap-2 pt-3">
                <div className="p-3 rounded-xl bg-red-50 text-center border border-red-100">
                  <div className="text-[10px] text-red-500 font-bold">R2 Resistance</div>
                  <div className="text-xs font-mono font-bold text-red-700 mt-1">{r2.toFixed(4)}</div>
                </div>
                <div className="p-3 rounded-xl bg-red-50/60 text-center border border-red-100">
                  <div className="text-[10px] text-red-500 font-bold">R1 Resistance</div>
                  <div className="text-xs font-mono font-bold text-red-700 mt-1">{r1.toFixed(4)}</div>
                </div>
                <div className="p-3 rounded-xl bg-[#5945F1]/10 text-center border border-[#5945F1]/30">
                  <div className="text-[10px] text-[#5945F1] font-bold">Central Pivot (P)</div>
                  <div className="text-xs font-mono font-bold text-[#5945F1] mt-1">{pivot.toFixed(4)}</div>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50/60 text-center border border-emerald-100">
                  <div className="text-[10px] text-emerald-600 font-bold">S1 Support</div>
                  <div className="text-xs font-mono font-bold text-emerald-700 mt-1">{s1.toFixed(4)}</div>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50 text-center border border-emerald-100">
                  <div className="text-[10px] text-emerald-600 font-bold">S2 Support</div>
                  <div className="text-xs font-mono font-bold text-emerald-700 mt-1">{s2.toFixed(4)}</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Performance Calculator */}
          {activeType === 'performance' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">Win Rate %</label>
                  <input
                    type="number"
                    value={winRate}
                    onChange={(e) => setWinRate(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">Trades Sample</label>
                  <input
                    type="number"
                    value={totalTrades}
                    onChange={(e) => setTotalTrades(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">Avg Win ($)</label>
                  <input
                    type="number"
                    value={avgWin}
                    onChange={(e) => setAvgWin(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">Avg Loss ($)</label>
                  <input
                    type="number"
                    value={avgLoss}
                    onChange={(e) => setAvgLoss(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-slate-900 text-white">
                  <div className="text-[11px] text-slate-400">Total Net Gain</div>
                  <div className={`text-xl font-black font-mono mt-1 ${totalGain >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    ${totalGain.toFixed(2)}
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900 text-white">
                  <div className="text-[11px] text-slate-400">Profit Factor</div>
                  <div className="text-xl font-black font-mono text-amber-400 mt-1">
                    {profitFactor.toFixed(2)}
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900 text-white">
                  <div className="text-[11px] text-slate-400">Winning / Losing Trades</div>
                  <div className="text-xl font-black font-mono text-white mt-1">
                    {wins}W / {losses}L
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Timezone Sessions */}
          {activeType === 'timezone' && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-700">
                    UTC Slider: {selectedHourUtc}:00 UTC
                  </span>
                  <span className="text-xs font-mono text-[#5945F1] font-bold">
                    {selectedHourUtc >= 12 && selectedHourUtc <= 16 ? '🔥 London + NY Overlap (Peak Liquidity)' : 'Normal Liquidity'}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="23"
                  value={selectedHourUtc}
                  onChange={(e) => setSelectedHourUtc(Number(e.target.value))}
                  className="w-full accent-[#5945F1]"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { city: 'London', open: 8, close: 17, offset: 0 },
                  { city: 'New York', open: 13, close: 22, offset: -5 },
                  { city: 'Tokyo', open: 0, close: 9, offset: 9 },
                  { city: 'Sydney', open: 21, close: 6, offset: 11 },
                ].map((s) => {
                  const isOpen =
                    s.open < s.close
                      ? selectedHourUtc >= s.open && selectedHourUtc < s.close
                      : selectedHourUtc >= s.open || selectedHourUtc < s.close;

                  return (
                    <div
                      key={s.city}
                      className={`p-4 rounded-2xl border transition-all ${
                        isOpen
                          ? 'bg-emerald-50/70 border-emerald-300 shadow-xs'
                          : 'bg-slate-50 border-slate-200 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-slate-800">{s.city}</span>
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase ${
                            isOpen ? 'bg-emerald-500 text-white' : 'bg-slate-300 text-slate-700'
                          }`}
                        >
                          {isOpen ? 'Open' : 'Closed'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {s.open}:00 - {s.close}:00 UTC
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 6: Currency Converter */}
          {activeType === 'currency' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center bg-slate-50 p-5 rounded-2xl border border-slate-200">
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">Amount</label>
                  <input
                    type="number"
                    value={convAmount}
                    onChange={(e) => setConvAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">From</label>
                  <select
                    value={fromCurr}
                    onChange={(e) => setFromCurr(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                  >
                    {Object.keys(rates).map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">To</label>
                  <select
                    value={toCurr}
                    onChange={(e) => setToCurr(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                  >
                    {Object.keys(rates).map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[#0b1c30] text-white flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400">Calculated Exchange</span>
                  <div className="text-2xl font-black font-mono text-[#c6f831] mt-0.5">
                    {convertedValue.toFixed(2)} {toCurr}
                  </div>
                </div>
                <div className="text-right text-xs text-slate-400">
                  1 {fromCurr} = {(rates[toCurr] / rates[fromCurr]).toFixed(4)} {toCurr}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            Powered by MarketSyde Institutional Analytics Engine
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-900 text-white font-bold hover:bg-black transition-colors"
          >
            Close Calculator
          </button>
        </div>
      </motion.div>
    </div>
  );
};

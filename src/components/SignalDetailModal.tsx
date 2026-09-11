import React, { useState } from 'react';
import { MarketSignal } from '../types';
import { X, ArrowUpRight, ArrowDownRight, Target, ShieldAlert, Sparkles, Copy, Check, Calculator } from 'lucide-react';

interface SignalDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  signal: MarketSignal | null;
  onNavigateToDetailPage?: () => void;
}

export const SignalDetailModal: React.FC<SignalDetailModalProps> = ({
  isOpen,
  onClose,
  signal,
  onNavigateToDetailPage,
}) => {
  const [copied, setCopied] = useState(false);
  const [calcLots, setCalcLots] = useState('1.0');

  if (!isOpen || !signal) return null;

  const isBuy = signal.action === 'BUY';
  const pricePrecision = signal.price > 100 ? 2 : 4;

  const handleCopy = () => {
    const text = `Precision Market Pulse Signal: ${signal.ticker} (${signal.action})
Entry: ${signal.entryPrice.toFixed(pricePrecision)}
TP1: ${signal.takeProfit1.toFixed(pricePrecision)}
TP2: ${signal.takeProfit2.toFixed(pricePrecision)}
SL: ${signal.stopLoss.toFixed(pricePrecision)}
R:R: ${signal.riskReward}
Confidence: ${signal.confidence}%`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const parsedLots = parseFloat(calcLots) || 0;
  const estimatedRebate = (parsedLots * 8.00 * 1.10).toFixed(2); // with 10% boost

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-[#e2e8f0] overflow-hidden">
        {/* Top Header */}
        <div className="p-5 border-b border-[#e2e8f0] flex items-center justify-between bg-[#f8fafc]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-xl shadow-xs">
              {signal.flag}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-lg text-[#0b1c30]">
                  {signal.ticker}
                </h3>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    isBuy
                      ? 'bg-[#c6f831] text-[#0f172a]'
                      : signal.action === 'SELL'
                      ? 'bg-[#5338ec] text-white'
                      : 'bg-[#fdf2f8] text-[#db2777] border border-[#fbcfe8]'
                  }`}
                >
                  {signal.action} SIGNAL
                </span>
              </div>
              <span className="text-xs text-[#474556]">
                {signal.name} • {signal.timeframe} timeframe • {signal.timestamp}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Key Quantitative Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Entry Price
              </span>
              <span className="font-bold text-sm text-[#0b1c30] tabular-nums">
                {signal.entryPrice.toFixed(pricePrecision)}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#f0fdf4] border border-[#bbf7d0]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#15803d] block mb-1">
                Take Profit 1
              </span>
              <span className="font-bold text-sm text-[#15803d] tabular-nums">
                {signal.takeProfit1.toFixed(pricePrecision)}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#f0fdf4] border border-[#bbf7d0]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#15803d] block mb-1">
                Take Profit 2
              </span>
              <span className="font-bold text-sm text-[#15803d] tabular-nums">
                {signal.takeProfit2.toFixed(pricePrecision)}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#fff1f2] border border-[#fecdd3]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#be123c] block mb-1">
                Stop Loss
              </span>
              <span className="font-bold text-sm text-[#be123c] tabular-nums">
                {signal.stopLoss.toFixed(pricePrecision)}
              </span>
            </div>
          </div>

          {/* Risk/Reward & Confidence Badges */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#f8f9ff] border border-[#d6d0ff]/70 text-xs">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-[#5338ec]" />
              <span className="text-slate-600 font-medium">Risk-to-Reward Ratio:</span>
              <span className="font-bold text-[#5338ec]">{signal.riskReward}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">Quantitative Confidence:</span>
              <span className="font-bold text-[#15803d] bg-[#dcfce7] px-2 py-0.5 rounded-full">
                {signal.confidence}%
              </span>
            </div>
          </div>

          {/* Rationale / Analysis */}
          <div>
            <h4 className="font-display font-bold text-xs uppercase tracking-wider text-[#0b1c30] mb-1.5">
              Technical Rationale
            </h4>
            <div className="p-3.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-xs text-[#474556] leading-relaxed">
              {signal.analysis}
            </div>
          </div>

          {/* Quick Rebate Calculator for this Signal */}
          <div className="p-3.5 rounded-xl bg-white border border-[#e2e8f0] shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#0b1c30]">
                <Calculator className="w-3.5 h-3.5 text-[#5338ec]" />
                <span>Estimate Cashback on This Trade</span>
              </div>
              <span className="text-[11px] text-[#5338ec] font-semibold">
                Includes your Rookie +10% boost
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1 flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Position Size:</span>
                <input
                  type="number"
                  step="0.1"
                  min="0.01"
                  value={calcLots}
                  onChange={(e) => setCalcLots(e.target.value)}
                  className="w-20 px-2.5 py-1 rounded-lg border border-[#e2e8f0] text-xs font-bold text-[#0b1c30] focus:outline-none focus:border-[#5338ec]"
                />
                <span className="text-xs text-slate-500">Lots</span>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 block">
                  You Will Earn
                </span>
                <span className="text-base font-bold text-[#15803d] tabular-nums">
                  +${estimatedRebate}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#e2e8f0] bg-[#f8fafc] flex items-center justify-between">
          <button
            onClick={handleCopy}
            className="px-4 py-2 rounded-lg border border-[#e2e8f0] bg-white hover:bg-slate-50 text-xs font-bold text-[#0b1c30] flex items-center gap-1.5 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-[#15803d]" />
                <span className="text-[#15803d]">Copied to Clipboard</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copy Parameters</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            {onNavigateToDetailPage && (
              <button
                onClick={onNavigateToDetailPage}
                className="px-4 py-2 rounded-lg bg-[#CAEB0E] hover:bg-[#bce000] text-slate-950 text-xs font-extrabold transition-all cursor-pointer shadow-xs"
              >
                View Full Chart & Details →
              </button>
            )}
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-lg bg-[#5338ec] hover:bg-[#4338ca] text-white text-xs font-bold transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

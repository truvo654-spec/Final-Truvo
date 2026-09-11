import React, { useState } from 'react';
import { X, Check, Shield, TrendingUp, Gem, Clock, AlertTriangle, ExternalLink, Zap, BarChart2, Globe, DollarSign } from 'lucide-react';
import { MarketSignal } from '../types';

// ─── 1. Asset Class Selector Modal (Task: Add a New Asset Class) ───
interface AssetClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAsset: (assetName: string, category: string) => void;
}

export const AssetClassModal: React.FC<AssetClassModalProps> = ({ isOpen, onClose, onSelectAsset }) => {
  const [selected, setSelected] = useState('gold');

  if (!isOpen) return null;

  const assetOptions = [
    {
      id: 'gold',
      symbol: 'XAU/USD',
      name: 'Spot Gold',
      category: 'Commodities',
      icon: '🪙',
      spread: '0.12 pips',
      rebate: '$5.50/lot',
      points: '+20 Pts/lot',
      volatility: 'High',
    },
    {
      id: 'googl',
      symbol: 'GOOGL',
      name: 'Alphabet Inc.',
      category: 'US Equities',
      icon: '💻',
      spread: '0.04 pips',
      rebate: '$3.80/share',
      points: '+35 Pts/trade',
      volatility: 'Moderate',
    },
    {
      id: 'spx',
      symbol: 'S&P 500',
      name: 'US Indices ETF',
      category: 'Indices',
      icon: '🔴',
      spread: '0.40 pts',
      rebate: '$4.20/contract',
      points: '+20 Pts/contract',
      volatility: 'Balanced',
    },
    {
      id: 'btc',
      symbol: 'BTC/USD',
      name: 'Bitcoin',
      category: 'Digital Assets',
      icon: '₿',
      spread: '$12.00',
      rebate: '$8.00/coin',
      points: '+45 Pts/trade',
      volatility: 'Extreme',
    },
  ];

  const handleConfirm = () => {
    const item = assetOptions.find((a) => a.id === selected) || assetOptions[0];
    onSelectAsset(item.symbol, item.category);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-[#5338ec]/5 to-purple-50">
          <div>
            <div className="text-xs font-bold text-[#5338ec] uppercase tracking-wider">Mission Task 1</div>
            <h3 className="text-base font-bold text-[#0b1c30]">Add a New Asset Class</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-xs text-slate-600">
            Expand your trading portfolio to unlock new cashback rebate pools and earn multi-asset loyalty points.
          </p>

          <div className="space-y-2">
            {assetOptions.map((opt) => {
              const isChosen = selected === opt.id;
              return (
                <div
                  key={opt.id}
                  onClick={() => setSelected(opt.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    isChosen
                      ? 'border-[#5338ec] bg-[#5338ec]/5 ring-1 ring-[#5338ec]'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{opt.icon}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#0b1c30]">{opt.symbol}</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
                          {opt.category}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {opt.name} • Spread: {opt.spread}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-bold text-[#5338ec]">{opt.points}</div>
                    <div className="text-[10px] text-emerald-600 font-medium">{opt.rebate}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 py-2.5 rounded-xl bg-[#5338ec] hover:bg-[#432ec4] text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Add & Claim Reward</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── 2. Stop-Loss Trigger Modal (Task: Set a Stop-Loss Order) ───
interface StopLossModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmStopLoss: (ticker: string, slLevel: number) => void;
}

export const StopLossModal: React.FC<StopLossModalProps> = ({ isOpen, onClose, onConfirmStopLoss }) => {
  const [ticker, setTicker] = useState('EUR/USD');
  const [entryPrice, setEntryPrice] = useState(1.0835);
  const [pipsDistance, setPipsDistance] = useState(25);
  const [trailingStop, setTrailingStop] = useState(true);

  if (!isOpen) return null;

  const slPrice = Number((entryPrice - (pipsDistance * 0.0001)).toFixed(4));
  const estimatedRisk = (pipsDistance * 1.0).toFixed(2);

  const handleConfirm = () => {
    onConfirmStopLoss(ticker, slPrice);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-50 to-indigo-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Mission Task 3</div>
              <h3 className="text-base font-bold text-[#0b1c30]">Set a Stop-Loss Order</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-xs text-slate-600">
            Professional risk management is essential. Setting a stop-loss protects your equity and qualifies you for cashback boosts.
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Target Instrument</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#0b1c30]">{ticker}</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">BUY</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Entry Reference</span>
              <span className="text-xs font-mono font-bold text-slate-800">{entryPrice.toFixed(4)}</span>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium text-slate-600">Stop-Loss Buffer</span>
                <span className="font-bold text-[#5338ec] font-mono">{pipsDistance} pips</span>
              </div>
              <input
                type="range"
                min="10"
                max="60"
                step="5"
                value={pipsDistance}
                onChange={(e) => setPipsDistance(Number(e.target.value))}
                className="w-full accent-[#5338ec] cursor-pointer"
              />
            </div>

            <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs">
              <span className="font-medium text-slate-600">Calculated SL Trigger</span>
              <span className="font-bold text-rose-600 font-mono text-sm">{slPrice.toFixed(4)}</span>
            </div>
          </div>

          <label className="flex items-center gap-2.5 p-2 rounded-lg bg-indigo-50/60 border border-indigo-100 cursor-pointer">
            <input
              type="checkbox"
              checked={trailingStop}
              onChange={(e) => setTrailingStop(e.target.checked)}
              className="rounded text-[#5338ec] focus:ring-[#5338ec]"
            />
            <span className="text-xs text-indigo-900 font-medium">
              Enable Trailing Stop (lock in profits as price moves forward)
            </span>
          </label>

          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Arm SL & Complete (3/3)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── 3. Morning Alpha Brief Modal (Market Watch: Task 1) ───
interface AlphaBriefModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmRead: () => void;
}

export const AlphaBriefModal: React.FC<AlphaBriefModalProps> = ({ isOpen, onClose, onConfirmRead }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-pink-50 to-purple-50">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🌅</span>
            <div>
              <div className="text-xs font-bold text-pink-600 uppercase tracking-wider">Morning Alpha Brief</div>
              <h3 className="text-base font-bold text-[#0b1c30]">Daily Institutional Market Context</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#5338ec]">EUR/USD Liquidity Sweep</span>
              <span className="text-slate-400">08:00 UTC</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Price reclaimed the 1.0820 Asian low after a swift liquidity grab. Stochastic divergence on the 15m timeframe indicates institutional accumulation ahead of London session fix.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-amber-600">Gold (XAU/USD) Momentum</span>
              <span className="text-slate-400">08:30 UTC</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Spot Gold maintains a bullish flag pattern testing $2,895 resistance. Macro safe-haven hedging keeps downside firmly cushioned near $2,870 support.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-emerald-600">S&P 500 Technical Bias</span>
              <span className="text-slate-400">09:00 UTC</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Indices trade in positive territory following solid tech earnings reports. Institutional dealers remain delta-neutral heading into upcoming Fed speaking engagements.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-between gap-3">
            <button
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                onConfirmRead();
                onClose();
              }}
              className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-[#f43f5e] to-[#ec4899] text-white text-xs font-bold shadow-xs hover:opacity-95 transition-all flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Mark as Read (+8 Pts, +15 Credits)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── 4. Economic Calendar Modal (Market Watch: Task 2) ───
interface EconomicCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmReviewed: () => void;
}

export const EconomicCalendarModal: React.FC<EconomicCalendarModalProps> = ({
  isOpen,
  onClose,
  onConfirmReviewed,
}) => {
  if (!isOpen) return null;

  const events = [
    {
      time: '13:30 GMT',
      currency: 'USD',
      impact: 'HIGH',
      title: 'Core PCE Price Index (MoM)',
      forecast: '0.2%',
      previous: '0.3%',
    },
    {
      time: '14:45 GMT',
      currency: 'EUR',
      impact: 'HIGH',
      title: 'ECB President Lagarde Speech',
      forecast: 'N/A',
      previous: 'N/A',
    },
    {
      time: '15:00 GMT',
      currency: 'USD',
      impact: 'MEDIUM',
      title: 'ISM Manufacturing PMI',
      forecast: '49.8',
      previous: '49.1',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <div className="text-xs font-bold text-rose-600 uppercase tracking-wider">High-Impact Events</div>
            <h3 className="text-base font-bold text-[#0b1c30]">Economic Calendar Risk Monitor</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-xs text-slate-600">
            Be aware of volatility spikes during news announcements. Our system tracks spread widening to safeguard your rebates.
          </p>

          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
            {events.map((ev, i) => (
              <div key={i} className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-500">{ev.time}</span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                      {ev.currency}
                    </span>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                        ev.impact === 'HIGH' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {ev.impact}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-[#0b1c30]">{ev.title}</div>
                </div>

                <div className="text-right text-[11px] text-slate-500 font-mono">
                  <div>Fcst: <strong className="text-slate-700">{ev.forecast}</strong></div>
                  <div>Prev: {ev.previous}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 flex items-center justify-between gap-3">
            <button
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onConfirmReviewed();
                onClose();
              }}
              className="py-2.5 px-5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Confirm Reviewed (+7 Pts, +10 Credits)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── 5. Live Spreads Comparison Modal (7-Day Explorer: Day 1) ───
interface SpreadsComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClaimDay1: () => void;
}

export const SpreadsComparisonModal: React.FC<SpreadsComparisonModalProps> = ({
  isOpen,
  onClose,
  onClaimDay1,
}) => {
  if (!isOpen) return null;

  const brokers = [
    { name: 'Exness Pro', spreadEUR: '0.0 pips', spreadGold: '0.10 pips', cashback: '$8.00/lot', rating: '9.9' },
    { name: 'IC Markets Raw', spreadEUR: '0.0 pips', spreadGold: '0.12 pips', cashback: '$7.50/lot', rating: '9.8' },
    { name: 'Pepperstone Razor', spreadEUR: '0.1 pips', spreadGold: '0.15 pips', cashback: '$6.80/lot', rating: '9.6' },
    { name: 'XM Ultra Low', spreadEUR: '0.6 pips', spreadGold: '0.22 pips', cashback: '$9.20/lot', rating: '9.7' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-lime-50">
          <div>
            <div className="text-xs font-bold text-lime-800 uppercase tracking-wider">7-Day Explorer: Day 1</div>
            <h3 className="text-base font-bold text-[#0b1c30]">Live Spreads & Cashback Comparison</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-xs text-slate-600">
            Real-time bid/ask tick spread latency across verified Tier-1 brokers. You receive cashback directly into your balance on top of these raw spreads.
          </p>

          <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
            {brokers.map((b, i) => (
              <div key={i} className="p-3 flex items-center justify-between hover:bg-slate-50">
                <div>
                  <div className="text-xs font-bold text-[#0b1c30]">{b.name}</div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                    EUR/USD: <span className="font-bold text-[#5338ec]">{b.spreadEUR}</span> • Gold: {b.spreadGold}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-emerald-600">{b.cashback}</div>
                  <div className="text-[10px] text-slate-400">Score: {b.rating}/10</div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 flex items-center justify-between gap-3">
            <button
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onClaimDay1();
                onClose();
              }}
              className="py-2.5 px-5 rounded-xl bg-[#c6f831] hover:bg-[#bcf220] text-[#0b1c30] text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Verify & Claim Day 1 (+40 Credits)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── 6. Asset Points Breakdown Modal (Clicking any asset in Tops Earning Points) ───
interface AssetPointsDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: {
    symbol: string;
    name: string;
    icon: string;
    points: number;
    cashback: string;
    spread: string;
    volatility: string;
  } | null;
  onTradeNow: () => void;
  onViewSignal: () => void;
}

export const AssetPointsDetailModal: React.FC<AssetPointsDetailModalProps> = ({
  isOpen,
  onClose,
  asset,
  onTradeNow,
  onViewSignal,
}) => {
  if (!isOpen || !asset) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-[#5338ec]/5 via-purple-50 to-pink-50">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{asset.icon}</span>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-lg font-bold font-display text-[#0b1c30]">{asset.symbol}</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#5338ec]/10 text-[#5338ec]">
                  Top Earner
                </span>
              </div>
              <div className="text-xs text-slate-500">{asset.name}</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-100">
              <div className="text-[11px] font-medium text-purple-700">Reward Rate</div>
              <div className="text-xl font-bold font-display text-[#5338ec] flex items-center gap-1 mt-0.5">
                <Gem className="w-4 h-4 text-[#5338ec]" />
                <span>{asset.points} Pts</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">per standard lot traded</div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100">
              <div className="text-[11px] font-medium text-emerald-700">Cashback Rebate</div>
              <div className="text-xl font-bold font-display text-emerald-600 mt-0.5">
                {asset.cashback}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">deposited automatically</div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
            <div className="flex items-center justify-between text-slate-600">
              <span>Typical Raw Spread:</span>
              <span className="font-bold text-slate-800 font-mono">{asset.spread}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Market Volatility:</span>
              <span className="font-bold text-slate-800">{asset.volatility}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Points Boost Multiplier:</span>
              <span className="font-bold text-[#5338ec]">1.15x Active</span>
            </div>
          </div>

          <div className="pt-2 grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                onClose();
                onViewSignal();
              }}
              className="py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5"
            >
              <BarChart2 className="w-3.5 h-3.5 text-[#5338ec]" />
              <span>View Signal</span>
            </button>
            <button
              onClick={() => {
                onClose();
                onTradeNow();
              }}
              className="py-2.5 rounded-xl bg-[#5338ec] hover:bg-[#432ec4] text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Trade & Earn</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

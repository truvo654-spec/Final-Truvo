import React, { useState } from 'react';
import { X } from 'lucide-react';
import { PortfolioAssetClass } from '../../types';

interface AddManualTradeModalProps {
  onClose: () => void;
  brokers?: string[];
  onSubmit: (trade: {
    broker: string;
    result: number | null;
    symbol: string;
    assetClass: PortfolioAssetClass;
    direction: 'BUY' | 'SELL';
    entryPrice: number;
    exitPrice: number | null;
    size: number;
  }) => void;
}

const ASSET_CLASSES: PortfolioAssetClass[] = ['Forex', 'Crypto', 'Stocks', 'Commodity', 'Indices'];

export const AddManualTradeModal: React.FC<AddManualTradeModalProps> = ({ onClose, onSubmit, brokers = ['Manual Log', 'HFM', 'Exness'] }) => {
  const [broker, setBroker] = useState(brokers[0]);
  const [result, setResult] = useState('');
  const [symbol, setSymbol] = useState('');
  const [assetClass, setAssetClass] = useState<PortfolioAssetClass>('Forex');
  const [direction, setDirection] = useState<'BUY' | 'SELL'>('BUY');
  const [entryPrice, setEntryPrice] = useState('');
  const [exitPrice, setExitPrice] = useState('');
  const [size, setSize] = useState('');

  const canSubmit = symbol.trim() && entryPrice && size;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white border border-[#e2e8f0] rounded-2xl w-full max-w-md shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <h2 className="text-lg font-bold text-[#0b1c30] mb-1">Log a manual trade</h2>
        <p className="text-xs text-[#474556] mb-5">Record a trade from a broker that isn't connected yet.</p>

        <div className="space-y-3.5">
          <div>
            <label className="text-xs font-semibold text-[#474556] mb-1 block">Broker</label>
            <select
              value={broker}
              onChange={(e) => setBroker(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5338ec]/30"
            >
              {brokers.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#474556] mb-1 block">Symbol</label>
            <input
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              placeholder="e.g. EUR/USD"
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5338ec]/30"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#474556] mb-1 block">Asset class</label>
              <select
                value={assetClass}
                onChange={(e) => setAssetClass(e.target.value as PortfolioAssetClass)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5338ec]/30"
              >
                {ASSET_CLASSES.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-[#474556] mb-1 block">Direction</label>
              <div className="flex rounded-xl border border-slate-200 overflow-hidden">
                <button
                  onClick={() => setDirection('BUY')}
                  className={`flex-1 py-2 text-xs font-bold transition-colors ${
                    direction === 'BUY' ? 'bg-emerald-500 text-white' : 'bg-white text-slate-500'
                  }`}
                >
                  BUY
                </button>
                <button
                  onClick={() => setDirection('SELL')}
                  className={`flex-1 py-2 text-xs font-bold transition-colors ${
                    direction === 'SELL' ? 'bg-rose-500 text-white' : 'bg-white text-slate-500'
                  }`}
                >
                  SELL
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#474556] mb-1 block">Entry price</label>
              <input
                value={entryPrice}
                onChange={(e) => setEntryPrice(e.target.value)}
                type="number"
                placeholder="1.0835"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5338ec]/30"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#474556] mb-1 block">Exit price</label>
              <input
                value={exitPrice}
                onChange={(e) => setExitPrice(e.target.value)}
                type="number"
                placeholder="Optional"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5338ec]/30"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#474556] mb-1 block">Size (lots)</label>
              <input
                value={size}
                onChange={(e) => setSize(e.target.value)}
                type="number"
                placeholder="1.0"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5338ec]/30"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-[#474556] mb-1 block">Result ($, optional)</label>
            <input
              value={result}
              onChange={(e) => setResult(e.target.value)}
              type="number"
              placeholder="Leave empty to calculate from prices"
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5338ec]/30"
            />
          </div>
        </div>

        <button
          disabled={!canSubmit}
          onClick={() =>
            canSubmit &&
            onSubmit({
              broker,
              result: result !== '' && exitPrice ? parseFloat(result) : null,
              symbol,
              assetClass,
              direction,
              entryPrice: parseFloat(entryPrice),
              exitPrice: exitPrice ? parseFloat(exitPrice) : null,
              size: parseFloat(size),
            })
          }
          className="w-full mt-5 bg-[#5338ec] hover:bg-[#4326d8] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
        >
          Save trade
        </button>
      </div>
    </div>
  );
};

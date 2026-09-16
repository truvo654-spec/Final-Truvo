import React, { useState } from 'react';
import { InstrumentIcon } from './InstrumentIcon';
import { motion } from 'motion/react';

interface HeatmapTile {
  id: string;
  name: string;
  symbol: string;
  iconType: string;
  change: string;
  value: string;
  theme: 'green' | 'red' | 'lime';
  colSpan?: string;
  rowSpan?: string;
  minHeight?: string;
}

interface InstrumentHeatmapViewProps {
  onSelectInstrument?: (symbol: string) => void;
}

export const InstrumentHeatmapView: React.FC<InstrumentHeatmapViewProps> = ({
  onSelectInstrument,
}) => {
  const [sizeBy, setSizeBy] = useState<string>('Relative Volume ($B)');
  const [colorBy, setColorBy] = useState<string>('Change 1 Day (%)');

  // Exact tiles from Frame 427322387 (1).png
  const topTilesSection = [
    // Column 1: Bitcoin (large primary tile)
    {
      id: 'btc',
      name: 'Bitcoin',
      symbol: 'BTC/USD',
      iconType: 'btc',
      change: '+0.85%',
      value: '$1.54T',
      theme: 'green' as const,
      area: 'btc',
    },
    // Column 2
    {
      id: 'btc2',
      name: 'Bitcoin Cash',
      symbol: 'BCH/USD',
      iconType: 'btc',
      change: '+0.85%',
      value: '$4.45B',
      theme: 'green' as const,
      area: 'c2t',
    },
    {
      id: 'icp',
      name: 'Internet Computer',
      symbol: 'ICP/USD',
      iconType: 'icp',
      change: '+0.85%',
      value: '$1.54B',
      theme: 'green' as const,
      area: 'c2b',
    },
    // Column 3
    {
      id: 'usdt',
      name: 'Tether USD',
      symbol: 'USDT/USD',
      iconType: 'usdt',
      change: '+0.85%',
      value: '$2.65B',
      theme: 'red' as const,
      area: 'c3t',
    },
    {
      id: 'celo',
      name: 'Celo',
      symbol: 'CELO/USD',
      iconType: 'link',
      change: '+0.85%',
      value: '$3.74B',
      theme: 'red' as const,
      area: 'c3b',
    },
    // Column 4 & 5
    {
      id: 'ada',
      name: 'Cardano',
      symbol: 'ADA/USD',
      iconType: 'ada',
      change: '+0.85%',
      value: '$0.41B',
      theme: 'green' as const,
      area: 'c4t1',
    },
    {
      id: 'cro',
      name: 'Cronos',
      symbol: 'CRO/USD',
      iconType: 'pol',
      change: '+0.85%',
      value: '$2.78B',
      theme: 'red' as const,
      area: 'c4t2',
    },
    {
      id: 'dai',
      name: 'Dai',
      symbol: 'DAI/USD',
      iconType: 'doge',
      change: '+0.85%',
      value: '$4.57B',
      theme: 'lime' as const,
      area: 'c4m1',
    },
    {
      id: 'doge',
      name: 'Dogecoin',
      symbol: 'DOGE/USD',
      iconType: 'doge',
      change: '+0.85%',
      value: '$14.20B',
      theme: 'red' as const,
      area: 'c4m2',
    },
    {
      id: 'eth',
      name: 'Ethereum',
      symbol: 'ETH/USD',
      iconType: 'eth',
      change: '+0.85%',
      value: '$302B',
      theme: 'red' as const,
      area: 'eth',
    },
  ];

  const middleTilesSection = [
    // Binance big square
    {
      id: 'bnb',
      name: 'Binance Coin',
      symbol: 'BNB/USD',
      iconType: 'bnb',
      change: '+0.85%',
      value: '$0.95B',
      theme: 'green' as const,
      area: 'bnb',
    },
    // ICP col
    {
      id: 'icp2',
      name: 'ICP Protocol',
      symbol: 'ICP/USD',
      iconType: 'icp',
      change: '+0.85%',
      value: '$1.54T',
      theme: 'green' as const,
      area: 'mid_c2t',
    },
    {
      id: 'kcs',
      name: 'KuCoin Token',
      symbol: 'KCS/USD',
      iconType: 'kcs',
      change: '+0.85%',
      value: '$0.947B',
      theme: 'red' as const,
      area: 'mid_c2b',
    },
    // Center square
    {
      id: 'ton2',
      name: 'The Open Network',
      symbol: 'TON/USD',
      iconType: 'ton',
      change: '+0.85%',
      value: '$0.741B',
      theme: 'green' as const,
      area: 'mid_c3',
    },
    // HBAR col
    {
      id: 'hbar',
      name: 'Hedera',
      symbol: 'HBAR/USD',
      iconType: 'hbar',
      change: '+0.85%',
      value: '$0.059B',
      theme: 'green' as const,
      area: 'mid_c4t',
    },
    {
      id: 'ton_sub',
      name: 'Diamond Token',
      symbol: 'DMD/USD',
      iconType: 'ton',
      change: '+0.85%',
      value: '$0.041B',
      theme: 'red' as const,
      area: 'mid_c4b',
    },
    // XMR col
    {
      id: 'xmr',
      name: 'Monero',
      symbol: 'XMR/USD',
      iconType: 'xmr',
      change: '+0.85%',
      value: '$0.118B',
      theme: 'red' as const,
      area: 'mid_c5t',
    },
    {
      id: 'near',
      name: 'NEAR Protocol',
      symbol: 'NEAR/USD',
      iconType: 'near',
      change: '+0.85%',
      value: '$0.448B',
      theme: 'green' as const,
      area: 'mid_c5b',
    },
    // Right group
    {
      id: 'ltc',
      name: 'Litecoin',
      symbol: 'LTC/USD',
      iconType: 'ltc',
      change: '+0.85%',
      value: '$4.08B',
      theme: 'green' as const,
      area: 'mid_c6_1',
    },
    {
      id: 'uni_star',
      name: 'Uniswap Asterisk',
      symbol: 'UNI/USD',
      iconType: 'uni',
      change: '+0.85%',
      value: '$1.886B',
      theme: 'green' as const,
      area: 'mid_c6_2',
    },
    {
      id: 'pepe',
      name: 'Pepe',
      symbol: 'PEPE/USD',
      iconType: 'pepe',
      change: '+0.85%',
      value: '$0.187B',
      theme: 'green' as const,
      area: 'mid_c6_3',
    },
    {
      id: 'chz',
      name: 'Chiliz',
      symbol: 'CHZ/USD',
      iconType: 'chz',
      change: '+0.85%',
      value: '$0.131B',
      theme: 'green' as const,
      area: 'mid_c6_4',
    },
  ];

  const bottomTilesSection = [
    {
      id: 'pol',
      name: 'Polygon',
      symbol: 'POL/USD',
      iconType: 'pol',
      change: '+0.85%',
      value: '$1.04B',
      theme: 'red' as const,
    },
    {
      id: 'crv',
      name: 'Curve DAO',
      symbol: 'CRV/USD',
      iconType: 'crv',
      change: '+0.85%',
      value: '$88.78B',
      theme: 'green' as const,
    },
    {
      id: 'shib',
      name: 'Shiba Inu',
      symbol: 'SHIB/USD',
      iconType: 'shib',
      change: '+0.85%',
      value: '$3.03B',
      theme: 'red' as const,
    },
    {
      id: 'sol',
      name: 'Solana',
      symbol: 'SOL/USD',
      iconType: 'sol',
      change: '+0.85%',
      value: '$60.30B',
      theme: 'red' as const,
    },
  ];

  const getTileClasses = (theme: 'green' | 'red' | 'lime') => {
    switch (theme) {
      case 'green':
        return 'bg-[#EBF6EE] border-emerald-100/60 hover:bg-[#E2F3E7] hover:border-emerald-300/80';
      case 'red':
        return 'bg-[#FEE2E2]/75 border-rose-100/60 hover:bg-[#FCD2D2] hover:border-rose-300/80';
      case 'lime':
        return 'bg-[#FEF9C3]/75 border-amber-100/60 hover:bg-[#FEF08A]/80 hover:border-amber-300/80';
    }
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-[#8B5CF6]/30 p-5 sm:p-7 shadow-2xs space-y-6">
      {/* ─── Top Header Bar: Title + Subtitle + Size/Color Selects ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold font-display text-slate-900 select-none">
            Market Heatmap
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Tile size and color use the selected market fields
          </p>
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          {/* Size By */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Size by</span>
            <select
              value={sizeBy}
              onChange={(e) => setSizeBy(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#8B5CF6]/40 cursor-pointer shadow-2xs"
            >
              <option value="Relative Volume ($B)">Relative Volume ($B)</option>
              <option value="Market Cap ($B)">Market Cap ($B)</option>
              <option value="24h Volume ($B)">24h Volume ($B)</option>
            </select>
          </div>

          {/* Color By */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Color by</span>
            <select
              value={colorBy}
              onChange={(e) => setColorBy(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#8B5CF6]/40 cursor-pointer shadow-2xs"
            >
              <option value="Change 1 Day (%)">Change 1 Day (%)</option>
              <option value="Change 7 Days (%)">Change 7 Days (%)</option>
              <option value="1M Return (%)">1M Return (%)</option>
            </select>
          </div>
        </div>
      </div>

      {/* ─── Heatmap Multi-Section Responsive Layout (Exact match to Frame 427322387 (1).png) ─── */}
      <div className="space-y-3 select-none">
        {/* SECTION 1: Top Block */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-12 gap-3">
          {/* Bitcoin BTC: Large tile spanning 3 cols */}
          <motion.div
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.985 }}
            onClick={() => onSelectInstrument?.('BTC/USD')}
            className={`col-span-2 sm:col-span-2 lg:col-span-3 rounded-2xl p-4 flex flex-col items-center justify-center text-center transition-all cursor-pointer border ${getTileClasses(
              'green'
            )} min-h-[160px] sm:min-h-[220px]`}
          >
            <InstrumentIcon iconType="btc" name="Bitcoin" className="w-9 h-9 sm:w-10 sm:h-10 mb-2" />
            <span className="text-emerald-700 font-extrabold text-sm sm:text-base">
              +0.85%
            </span>
            <span className="text-slate-600 font-medium text-xs mt-0.5">$1.54T</span>
          </motion.div>

          {/* Column 2: 2 stacked tiles */}
          <div className="col-span-1 sm:col-span-1 lg:col-span-1.5 flex flex-col gap-3">
            <motion.div
              whileHover={{ scale: 1.02 }}
              onClick={() => onSelectInstrument?.('BCH/USD')}
              className={`flex-1 rounded-2xl p-3 flex flex-col items-center justify-center text-center transition-all cursor-pointer border ${getTileClasses(
                'green'
              )} min-h-[102px]`}
            >
              <InstrumentIcon iconType="btc" name="Bitcoin Cash" className="w-6 h-6 mb-1.5" />
              <span className="text-emerald-700 font-extrabold text-xs">+0.85%</span>
              <span className="text-slate-600 font-medium text-[11px] mt-0.5">$4.45B</span>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              onClick={() => onSelectInstrument?.('ICP/USD')}
              className={`flex-1 rounded-2xl p-3 flex flex-col items-center justify-center text-center transition-all cursor-pointer border ${getTileClasses(
                'green'
              )} min-h-[102px]`}
            >
              <InstrumentIcon iconType="icp" name="ICP" className="w-6 h-6 mb-1.5" />
              <span className="text-emerald-700 font-extrabold text-xs">+0.85%</span>
              <span className="text-slate-600 font-medium text-[11px] mt-0.5">$1.54B</span>
            </motion.div>
          </div>

          {/* Column 3: 2 stacked tiles (Tether USD + Celo) */}
          <div className="col-span-1 sm:col-span-1 lg:col-span-1.5 flex flex-col gap-3">
            <motion.div
              whileHover={{ scale: 1.02 }}
              onClick={() => onSelectInstrument?.('USDT/USD')}
              className={`flex-1 rounded-2xl p-3 flex flex-col items-center justify-center text-center transition-all cursor-pointer border ${getTileClasses(
                'red'
              )} min-h-[102px]`}
            >
              <div className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center mb-1.5">
                T
              </div>
              <span className="text-emerald-700 font-extrabold text-xs">+0.85%</span>
              <span className="text-slate-600 font-medium text-[11px] mt-0.5">$2.65B</span>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              onClick={() => onSelectInstrument?.('CELO/USD')}
              className={`flex-1 rounded-2xl p-3 flex flex-col items-center justify-center text-center transition-all cursor-pointer border ${getTileClasses(
                'red'
              )} min-h-[102px]`}
            >
              <div className="w-6 h-6 rounded-full bg-lime-400 text-slate-950 font-bold text-xs flex items-center justify-center mb-1.5">
                C
              </div>
              <span className="text-emerald-700 font-extrabold text-xs">+0.85%</span>
              <span className="text-slate-600 font-medium text-[11px] mt-0.5">$3.74B</span>
            </motion.div>
          </div>

          {/* Column 4 & 5: Sub-grid for ADA, CRO, DAI, DOGE */}
          <div className="col-span-2 sm:col-span-2 lg:col-span-4 grid grid-cols-2 gap-3">
            {/* ADA */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              onClick={() => onSelectInstrument?.('ADA/USD')}
              className={`rounded-2xl p-3 flex flex-col items-center justify-center text-center transition-all cursor-pointer border ${getTileClasses(
                'green'
              )} min-h-[102px]`}
            >
              <InstrumentIcon iconType="ada" name="Cardano" className="w-6 h-6 mb-1.5" />
              <span className="text-emerald-700 font-extrabold text-xs">+0.85%</span>
              <span className="text-slate-600 font-medium text-[11px] mt-0.5">$0.41B</span>
            </motion.div>

            {/* CRO */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              onClick={() => onSelectInstrument?.('CRO/USD')}
              className={`rounded-2xl p-3 flex flex-col items-center justify-center text-center transition-all cursor-pointer border ${getTileClasses(
                'red'
              )} min-h-[102px]`}
            >
              <div className="w-6 h-6 rounded-full bg-indigo-900 text-white font-bold text-[10px] flex items-center justify-center mb-1.5">
                ⬡
              </div>
              <span className="text-emerald-700 font-extrabold text-xs">+0.85%</span>
              <span className="text-slate-600 font-medium text-[11px] mt-0.5">$2.78B</span>
            </motion.div>

            {/* DAI */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              onClick={() => onSelectInstrument?.('DAI/USD')}
              className={`rounded-2xl p-3 flex flex-col items-center justify-center text-center transition-all cursor-pointer border ${getTileClasses(
                'lime'
              )} min-h-[102px]`}
            >
              <div className="w-6 h-6 rounded-full bg-amber-400 text-amber-950 font-bold text-xs flex items-center justify-center mb-1.5">
                Ð
              </div>
              <span className="text-emerald-700 font-extrabold text-xs">+0.85%</span>
              <span className="text-slate-600 font-medium text-[11px] mt-0.5">$4.57B</span>
            </motion.div>

            {/* DOGE */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              onClick={() => onSelectInstrument?.('DOGE/USD')}
              className={`rounded-2xl p-3 flex flex-col items-center justify-center text-center transition-all cursor-pointer border ${getTileClasses(
                'red'
              )} min-h-[102px]`}
            >
              <InstrumentIcon iconType="doge" name="Dogecoin" className="w-6 h-6 mb-1.5" />
              <span className="text-emerald-700 font-extrabold text-xs">+0.85%</span>
              <span className="text-slate-600 font-medium text-[11px] mt-0.5">$14.20B</span>
            </motion.div>
          </div>

          {/* Far Right: Ethereum ETH tall tile */}
          <motion.div
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.985 }}
            onClick={() => onSelectInstrument?.('ETH/USD')}
            className={`col-span-2 sm:col-span-2 lg:col-span-2 rounded-2xl p-4 flex flex-col items-center justify-center text-center transition-all cursor-pointer border ${getTileClasses(
              'red'
            )} min-h-[160px] sm:min-h-[220px]`}
          >
            <InstrumentIcon iconType="eth" name="Ethereum" className="w-8 h-8 sm:w-9 sm:h-9 mb-2" />
            <span className="text-emerald-700 font-extrabold text-sm sm:text-base">
              +0.85%
            </span>
            <span className="text-slate-600 font-medium text-xs mt-0.5">$302B</span>
          </motion.div>
        </div>

        {/* SECTION 2: Middle Block */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-12 gap-3">
          {/* Binance BNB: Large square spanning 3 cols */}
          <motion.div
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.985 }}
            onClick={() => onSelectInstrument?.('BNB/USD')}
            className={`col-span-2 sm:col-span-2 lg:col-span-3 rounded-2xl p-4 flex flex-col items-center justify-center text-center transition-all cursor-pointer border ${getTileClasses(
              'green'
            )} min-h-[160px] sm:min-h-[220px]`}
          >
            <InstrumentIcon iconType="bnb" name="Binance" className="w-9 h-9 sm:w-10 sm:h-10 mb-2" />
            <span className="text-emerald-700 font-extrabold text-sm sm:text-base">
              +0.85%
            </span>
            <span className="text-slate-600 font-medium text-xs mt-0.5">$0.95B</span>
          </motion.div>

          {/* Stacked ICP + KCS */}
          <div className="col-span-1 sm:col-span-1 lg:col-span-1.5 flex flex-col gap-3">
            <motion.div
              whileHover={{ scale: 1.02 }}
              onClick={() => onSelectInstrument?.('ICP/USD')}
              className={`flex-1 rounded-2xl p-3 flex flex-col items-center justify-center text-center transition-all cursor-pointer border ${getTileClasses(
                'green'
              )} min-h-[102px]`}
            >
              <InstrumentIcon iconType="icp" name="ICP" className="w-6 h-6 mb-1.5" />
              <span className="text-emerald-700 font-extrabold text-xs">+0.85%</span>
              <span className="text-slate-600 font-medium text-[11px] mt-0.5">$1.54T</span>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              onClick={() => onSelectInstrument?.('KCS/USD')}
              className={`flex-1 rounded-2xl p-3 flex flex-col items-center justify-center text-center transition-all cursor-pointer border ${getTileClasses(
                'red'
              )} min-h-[102px]`}
            >
              <InstrumentIcon iconType="kcs" name="KuCoin" className="w-6 h-6 mb-1.5" />
              <span className="text-emerald-700 font-extrabold text-xs">+0.85%</span>
              <span className="text-slate-600 font-medium text-[11px] mt-0.5">$0.947B</span>
            </motion.div>
          </div>

          {/* Center Green Square (TON Protocol) */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            onClick={() => onSelectInstrument?.('TON/USD')}
            className={`col-span-1 sm:col-span-1 lg:col-span-2.5 rounded-2xl p-4 flex flex-col items-center justify-center text-center transition-all cursor-pointer border ${getTileClasses(
              'green'
            )} min-h-[160px] sm:min-h-[220px]`}
          >
            <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-sm mb-2">
              ●
            </div>
            <span className="text-emerald-700 font-extrabold text-sm sm:text-base">
              +0.85%
            </span>
            <span className="text-slate-600 font-medium text-xs mt-0.5">$0.741B</span>
          </motion.div>

          {/* Stacked HBAR + DMD */}
          <div className="col-span-1 sm:col-span-1 lg:col-span-1.5 flex flex-col gap-3">
            <motion.div
              whileHover={{ scale: 1.02 }}
              onClick={() => onSelectInstrument?.('HBAR/USD')}
              className={`flex-1 rounded-2xl p-3 flex flex-col items-center justify-center text-center transition-all cursor-pointer border ${getTileClasses(
                'green'
              )} min-h-[102px]`}
            >
              <InstrumentIcon iconType="hbar" name="HBAR" className="w-6 h-6 mb-1.5" />
              <span className="text-emerald-700 font-extrabold text-xs">+0.85%</span>
              <span className="text-slate-600 font-medium text-[11px] mt-0.5">$0.059B</span>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              onClick={() => onSelectInstrument?.('DMD/USD')}
              className={`flex-1 rounded-2xl p-3 flex flex-col items-center justify-center text-center transition-all cursor-pointer border ${getTileClasses(
                'red'
              )} min-h-[102px]`}
            >
              <div className="w-6 h-6 rounded-full bg-sky-500 text-white flex items-center justify-center text-xs mb-1.5">
                ✦
              </div>
              <span className="text-emerald-700 font-extrabold text-xs">+0.85%</span>
              <span className="text-slate-600 font-medium text-[11px] mt-0.5">$0.041B</span>
            </motion.div>
          </div>

          {/* Stacked XMR + NEAR */}
          <div className="col-span-1 sm:col-span-1 lg:col-span-1.5 flex flex-col gap-3">
            <motion.div
              whileHover={{ scale: 1.02 }}
              onClick={() => onSelectInstrument?.('XMR/USD')}
              className={`flex-1 rounded-2xl p-3 flex flex-col items-center justify-center text-center transition-all cursor-pointer border ${getTileClasses(
                'red'
              )} min-h-[102px]`}
            >
              <InstrumentIcon iconType="xmr" name="Monero" className="w-6 h-6 mb-1.5" />
              <span className="text-emerald-700 font-extrabold text-xs">+0.85%</span>
              <span className="text-slate-600 font-medium text-[11px] mt-0.5">$0.118B</span>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              onClick={() => onSelectInstrument?.('NEAR/USD')}
              className={`flex-1 rounded-2xl p-3 flex flex-col items-center justify-center text-center transition-all cursor-pointer border ${getTileClasses(
                'green'
              )} min-h-[102px]`}
            >
              <InstrumentIcon iconType="near" name="NEAR" className="w-6 h-6 mb-1.5" />
              <span className="text-emerald-700 font-extrabold text-xs">+0.85%</span>
              <span className="text-slate-600 font-medium text-[11px] mt-0.5">$0.448B</span>
            </motion.div>
          </div>

          {/* Far Right 4-group: LTC, Star, Pepe, Soccer */}
          <div className="col-span-2 sm:col-span-2 lg:col-span-2 grid grid-cols-2 gap-3">
            <motion.div
              whileHover={{ scale: 1.02 }}
              onClick={() => onSelectInstrument?.('LTC/USD')}
              className={`rounded-2xl p-3 flex flex-col items-center justify-center text-center transition-all cursor-pointer border ${getTileClasses(
                'green'
              )} min-h-[102px]`}
            >
              <InstrumentIcon iconType="ltc" name="Litecoin" className="w-6 h-6 mb-1.5" />
              <span className="text-emerald-700 font-extrabold text-xs">+0.85%</span>
              <span className="text-slate-600 font-medium text-[11px] mt-0.5">$4.08B</span>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              onClick={() => onSelectInstrument?.('UNI/USD')}
              className={`rounded-2xl p-3 flex flex-col items-center justify-center text-center transition-all cursor-pointer border ${getTileClasses(
                'green'
              )} min-h-[102px]`}
            >
              <div className="w-6 h-6 rounded-full bg-emerald-800 text-white font-bold text-xs flex items-center justify-center mb-1.5">
                ✱
              </div>
              <span className="text-emerald-700 font-extrabold text-xs">+0.85%</span>
              <span className="text-slate-600 font-medium text-[11px] mt-0.5">$1.886B</span>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              onClick={() => onSelectInstrument?.('PEPE/USD')}
              className={`rounded-2xl p-3 flex flex-col items-center justify-center text-center transition-all cursor-pointer border ${getTileClasses(
                'green'
              )} min-h-[102px]`}
            >
              <InstrumentIcon iconType="pepe" name="Pepe" className="w-6 h-6 mb-1.5" />
              <span className="text-emerald-700 font-extrabold text-xs">+0.85%</span>
              <span className="text-slate-600 font-medium text-[11px] mt-0.5">$0.187B</span>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              onClick={() => onSelectInstrument?.('CHZ/USD')}
              className={`rounded-2xl p-3 flex flex-col items-center justify-center text-center transition-all cursor-pointer border ${getTileClasses(
                'green'
              )} min-h-[102px]`}
            >
              <InstrumentIcon iconType="chz" name="Chiliz" className="w-6 h-6 mb-1.5" />
              <span className="text-emerald-700 font-extrabold text-xs">+0.85%</span>
              <span className="text-slate-600 font-medium text-[11px] mt-0.5">$0.131B</span>
            </motion.div>
          </div>
        </div>

        {/* SECTION 3: Bottom Row Horizontal Bars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {bottomTilesSection.map((tile) => (
            <motion.div
              key={tile.id}
              whileHover={{ scale: 1.015 }}
              onClick={() => onSelectInstrument?.(tile.symbol)}
              className={`rounded-2xl p-3.5 flex items-center justify-center gap-3 transition-all cursor-pointer border ${getTileClasses(
                tile.theme
              )}`}
            >
              <InstrumentIcon iconType={tile.iconType} name={tile.name} className="w-6 h-6 shrink-0" />
              <div className="flex items-center gap-2">
                <span className="text-emerald-700 font-extrabold text-xs sm:text-sm">
                  {tile.change}
                </span>
                <span className="text-slate-600 font-medium text-xs">
                  {tile.value}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

import HM_NOT_FOUND from '../../assets/community/ia-notfound.png';
import HM_ERROR from '../../assets/community/ia-error.png';
import { Search } from 'lucide-react';
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
  /** Lets the page preview the empty and failed states. */
  state?: HeatmapState;
  onSelectInstrument?: (symbol: string) => void;
}

export type HeatmapState = 'default' | 'notfound' | 'error';

export const InstrumentHeatmapView: React.FC<InstrumentHeatmapViewProps> = ({
  onSelectInstrument,
  state = 'default',
}) => {
  const [sizeBy, setSizeBy] = useState<string>('Relative Volume ($B)');
  const [showRemaining, setShowRemaining] = useState(false);
  const [remainingQuery, setRemainingQuery] = useState('');
  const remainingCount = 256;
  const remainingValue = '$270.30B';
  const [colorBy, setColorBy] = useState<string>('Change 1 Day (%)');

/** What the "N More" tile opens, as in the design. */
const REMAINING_ASSETS = [
  { name: 'ZCash', change: '+2.31%', value: '$1.12B', tint: '#f5a524' },
  { name: 'Internet Explorer', change: '-1.74%', value: '$0.64B', tint: '#5945F1' },
  { name: 'Steller', change: '+4.08%', value: '$3.41B', tint: '#111827' },
  { name: 'Avalance', change: '-2.26%', value: '$18.73B', tint: '#e84142' },
  { name: 'Cronos', change: '+1.19%', value: '$3.28B', tint: '#0b1c30' },
  { name: 'Litecoin', change: '-0.92%', value: '$6.54B', tint: '#345d9d' },
];

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
        return 'bg-[#E8F88E] border-[#D6EC6F] text-slate-900 hover:bg-[#DFF27B] hover:shadow-xs';
      case 'red':
        return 'bg-[#FFBBE5] border-[#F2A3D4] text-slate-900 hover:bg-[#FFAFDF] hover:shadow-xs';
      case 'lime':
        return 'bg-[#FEF08A] border-amber-200 text-slate-900 hover:bg-[#FDE047] hover:shadow-xs';
    }
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-[#e0e7ff] p-5 sm:p-7 shadow-xs space-y-6">
      {/* ─── Top Header Bar: Title + Subtitle + Legend + Size/Color Selects ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold font-display text-slate-900 select-none">
            Market Heatmap
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Tile size and color update based on your selections below.
          </p>
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          {/* Size By */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[13px] text-slate-500 font-medium">Size by</span>
            <select
              value={sizeBy}
              onChange={(e) => setSizeBy(e.target.value)}
              className="w-[190px] bg-white border border-[#d7d3fb] rounded-xl px-3.5 py-2.5 text-[14px] font-medium text-slate-900 hover:border-[#5945F1] focus:outline-none focus:ring-2 focus:ring-[#5945F1]/25 cursor-pointer"
            >
              <option value="Relative Volume ($B)">Relative Volume ($B)</option>
              <option value="Market Cap ($B)">Market Cap ($B)</option>
              <option value="24h Volume ($B)">24h Volume ($B)</option>
            </select>
          </div>

          {/* Color By */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[13px] text-slate-500 font-medium">Color by</span>
            <select
              value={colorBy}
              onChange={(e) => setColorBy(e.target.value)}
              className="w-[190px] bg-white border border-[#d7d3fb] rounded-xl px-3.5 py-2.5 text-[14px] font-medium text-slate-900 hover:border-[#5945F1] focus:outline-none focus:ring-2 focus:ring-[#5945F1]/25 cursor-pointer"
            >
              <option value="Change 1 Day (%)">Change 1 Day (%)</option>
              <option value="Change 7 Days (%)">Change 7 Days (%)</option>
              <option value="1M Return (%)">1M Return (%)</option>
            </select>
          </div>
        </div>
      </div>

      {state !== 'default' ? (
        <div className="flex min-h-[560px] flex-col items-center justify-center px-6 text-center">
          <img src={state === 'error' ? HM_ERROR : HM_NOT_FOUND} alt="" className={state === 'error' ? 'w-[270px] h-auto' : 'w-[200px] h-auto'} />
          <p className="mt-6 font-display text-[34px] font-bold text-[#c026d3]">
            {state === 'error' ? 'Well, that didn’t load' : 'Data not found'}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            {state === 'error'
              ? 'It’s not you, it’s us. Try refreshing again in a bit.'
              : 'No instruments match these filters. Try loosening them up a bit.'}
          </p>
        </div>
      ) : (
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

          {/* Everything that did not fit, as in the design */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowRemaining((v) => !v)}
              aria-expanded={showRemaining}
              className="w-full h-full min-h-[76px] rounded-2xl border border-dashed border-[#c9c4fb] bg-[repeating-linear-gradient(45deg,#f6f5ff_0_6px,#ffffff_6px_12px)] flex flex-col items-center justify-center transition hover:border-[#5945F1]"
            >
              <span className="text-[15px] font-bold text-slate-900">{remainingCount} More</span>
              <span className="text-xs text-slate-500">{remainingValue}</span>
            </button>

            {showRemaining && (
              <div className="absolute bottom-[calc(100%+10px)] left-1/2 z-20 w-[300px] -translate-x-1/2 rounded-2xl border border-[#e4e0fa] bg-white p-4 shadow-2xl">
                <p className="text-[15px] font-bold text-slate-900">Remaining assets</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">Tile size and color use the selected market fields</p>
                <div className="mt-3 flex items-center gap-2 rounded-lg border border-[#e4e0fa] px-3 py-2">
                  <Search className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
                  <input
                    value={remainingQuery}
                    onChange={(e) => setRemainingQuery(e.target.value)}
                    placeholder="Search..."
                    aria-label="Search the remaining assets"
                    className="w-full min-w-0 bg-transparent text-[14px] outline-none placeholder:text-slate-400"
                  />
                </div>
                <ul className="mt-3 max-h-[180px] space-y-2.5 overflow-y-auto pr-1">
                  {REMAINING_ASSETS.filter((a) => a.name.toLowerCase().includes(remainingQuery.trim().toLowerCase())).map((a) => (
                    <li key={a.name} className="flex items-center gap-2 text-[14px]">
                      <span className="h-4 w-4 shrink-0 rounded-full" style={{ background: a.tint }} aria-hidden />
                      <span className="flex-1 truncate text-slate-900">{a.name}</span>
                      <span className={`tabular-nums ${a.change.startsWith('-') ? 'text-[#5945F1]' : 'text-[#5f7a00]'}`}>{a.change}</span>
                      <span className="w-[62px] text-right tabular-nums text-slate-900">{a.value}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 4: colour scale */}
        <div className="pt-2">
          <div className="grid grid-cols-7 gap-2 text-center text-xs text-slate-500">
            {['-3%', '-2%', '-1%', '0%', '1%', '2%', '3%'].map((t) => <span key={t}>{t}</span>)}
          </div>
          <div className="mt-1.5 grid grid-cols-7 gap-2">
            {['#8b7bf7', '#a99bff', '#cdc6ff', '#eef1f5', '#e4f09a', '#d3ea4e', '#caeb0e'].map((c) => (
              <span key={c} className="h-2.5 rounded-full" style={{ background: c }} />
            ))}
          </div>
        </div>
      </div>
      )}
    </div>
  );
};

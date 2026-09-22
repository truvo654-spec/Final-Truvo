import React from 'react';

interface InstrumentIconProps {
  iconType: string;
  name: string;
  className?: string;
}

export const InstrumentIcon: React.FC<InstrumentIconProps> = ({
  iconType,
  name,
  className = 'w-7 h-7',
}) => {
  switch (iconType) {
    case 'btc':
      return (
        <div
          className={`${className} rounded-full bg-[#F7931A] text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0 select-none`}
        >
          ₿
        </div>
      );
    case 'eth':
      return (
        <div
          className={`${className} rounded-full bg-[#1E293B] text-[#8299E5] flex items-center justify-center font-bold text-xs shadow-xs shrink-0 select-none`}
        >
          <svg viewBox="0 0 32 32" className="w-4 h-4 fill-current">
            <path d="M16 2 L7 16.5 L16 21.5 L25 16.5 Z" />
            <path d="M16 23 L7 18 L16 30 L25 18 Z" opacity="0.8" />
          </svg>
        </div>
      );
    case 'bnb':
      return (
        <div
          className={`${className} rounded-full bg-[#F3BA2F] text-black flex items-center justify-center font-bold text-xs shadow-xs shrink-0 select-none`}
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
            <path d="M12 2L8.5 5.5L12 9L15.5 5.5L12 2ZM5.5 8.5L2 12L5.5 15.5L9 12L5.5 8.5ZM18.5 8.5L15 12L18.5 15.5L22 12L18.5 8.5ZM12 15L8.5 18.5L12 22L15.5 18.5L12 15ZM12 10.5L10.5 12L12 13.5L13.5 12L12 10.5Z" />
          </svg>
        </div>
      );
    case 'xmr':
      return (
        <div
          className={`${className} rounded-full bg-[#FF6600] text-white flex items-center justify-center font-black text-xs shadow-xs shrink-0 select-none`}
        >
          M
        </div>
      );
    case 'ltc':
      return (
        <div
          className={`${className} rounded-full bg-[#345D9D] text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0 select-none`}
        >
          Ł
        </div>
      );
    case 'xrp':
      return (
        <div
          className={`${className} rounded-full bg-[#006097] text-white flex items-center justify-center p-1.5 shadow-xs shrink-0 select-none`}
        >
          <svg viewBox="0 0 24 24" className="w-full h-full fill-white">
            <circle cx="12" cy="5.5" r="2.5" />
            <circle cx="6.5" cy="15" r="2.5" />
            <circle cx="17.5" cy="15" r="2.5" />
            <path d="M12 8v3m-3.5 2.5L10 12m4 0l1.5 1.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
      );
    case 'pol':
      return (
        <div
          className={`${className} rounded-full bg-[#8247E5] text-white flex items-center justify-center p-1.5 shadow-xs shrink-0 select-none`}
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
            <path d="M16.5 8.5L12 6 7.5 8.5v5L12 16l4.5-2.5v-5zM12 4l6.5 3.75v7.5L12 19l-6.5-3.75V7.75L12 4z" />
          </svg>
        </div>
      );
    case 'avax':
      return (
        <div
          className={`${className} rounded-full bg-[#E84142] text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0 select-none`}
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
            <path d="M12 4L4 18h4.5l3.5-6.5 3.5 6.5H20L12 4z" />
          </svg>
        </div>
      );
    case 'sol':
      return (
        <div
          className={`${className} rounded-full bg-[#10141E] text-white flex items-center justify-center p-1.5 shadow-xs shrink-0 select-none`}
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4">
            <path d="M4 6.5h13l3 2H7l-3-2z" fill="#00FFA3" />
            <path d="M20 11.5H7l-3 2h13l3-2z" fill="#03E1FF" />
            <path d="M4 16.5h13l3 2H7l-3-2z" fill="#DC1FFF" />
          </svg>
        </div>
      );
    case 'uni':
      return (
        <div
          className={`${className} rounded-full bg-pink-50 text-[#FF007A] flex items-center justify-center p-1 shadow-xs shrink-0 select-none border border-pink-100`}
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#FF007A]">
            <path d="M12 2C8.5 4 6 7 6 11c0 2.5 1 4.5 3 6-1 2-1 3-1 3s3-1 5-2c2 1 4.5 0 6-2 2-3 2-7-1-10-2-2-5-3-7-4z" />
          </svg>
        </div>
      );
    case 'link':
      return (
        <div
          className={`${className} rounded-full bg-[#375BD2] text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0 select-none`}
        >
          ⬡
        </div>
      );
    case 'ada':
      return (
        <div
          className={`${className} rounded-full bg-[#0033AD] text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0 select-none`}
        >
          ₳
        </div>
      );
    case 'doge':
      return (
        <div
          className={`${className} rounded-full bg-[#C2A633] text-white flex items-center justify-center font-black text-xs shadow-xs shrink-0 select-none`}
        >
          Ð
        </div>
      );
    case 'usdt':
    case 'tether':
      return (
        <div
          className={`${className} rounded-full bg-[#26A17B] text-white flex items-center justify-center font-black text-xs shadow-xs shrink-0 select-none`}
        >
          ₮
        </div>
      );
    case 'icp':
      return (
        <div
          className={`${className} rounded-full bg-gradient-to-r from-amber-500 via-pink-500 to-indigo-500 text-white flex items-center justify-center font-black text-xs shadow-xs shrink-0 select-none`}
        >
          ∞
        </div>
      );
    case 'kcs':
      return (
        <div
          className={`${className} rounded-full bg-[#24AE8F] text-white flex items-center justify-center font-black text-xs shadow-xs shrink-0 select-none`}
        >
          ₭
        </div>
      );
    case 'near':
      return (
        <div
          className={`${className} rounded-full bg-black text-white flex items-center justify-center font-black text-xs shadow-xs shrink-0 select-none`}
        >
          N
        </div>
      );
    case 'hbar':
      return (
        <div
          className={`${className} rounded-full bg-black text-white flex items-center justify-center font-black text-xs shadow-xs shrink-0 select-none`}
        >
          Ħ
        </div>
      );
    case 'ton':
      return (
        <div
          className={`${className} rounded-full bg-[#0098EA] text-white flex items-center justify-center font-black text-xs shadow-xs shrink-0 select-none`}
        >
          💎
        </div>
      );
    case 'pepe':
      return (
        <div
          className={`${className} rounded-full bg-[#499946] text-white flex items-center justify-center font-black text-xs shadow-xs shrink-0 select-none`}
        >
          🐸
        </div>
      );
    case 'chz':
      return (
        <div
          className={`${className} rounded-full bg-[#CD0124] text-white flex items-center justify-center font-black text-xs shadow-xs shrink-0 select-none`}
        >
          ⚽
        </div>
      );
    case 'crv':
      return (
        <div
          className={`${className} rounded-full bg-[#3B82F6] text-white flex items-center justify-center font-black text-xs shadow-xs shrink-0 select-none`}
        >
          CRV
        </div>
      );
    case 'shib':
      return (
        <div
          className={`${className} rounded-full bg-[#FFA409] text-white flex items-center justify-center font-black text-xs shadow-xs shrink-0 select-none`}
        >
          🦊
        </div>
      );
    case 'wld':
      return (
        <div
          className={`${className} rounded-full bg-black text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0 select-none`}
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
            <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="2" fill="none" />
            <circle cx="12" cy="12" r="4" fill="white" />
          </svg>
        </div>
      );
    case 'dot':
      return (
        <div
          className={`${className} rounded-full bg-[#E6007A] text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0 select-none`}
        >
          ●
        </div>
      );
    case 'canton':
      return (
        <div
          className={`${className} rounded-full bg-[#0F172A] text-[#F59E0B] flex items-center justify-center font-bold text-xs shadow-xs shrink-0 select-none border border-amber-500/30`}
        >
          C
        </div>
      );
    case 'aave':
      return (
        <div
          className={`${className} rounded-full bg-gradient-to-r from-[#2EBAC6] to-[#B6509E] text-white flex items-center justify-center font-black text-xs shadow-xs shrink-0 select-none`}
        >
          A
        </div>
      );

    // Forex
    case 'fx-eur':
      return (
        <div
          className={`${className} rounded-full bg-[#003399] text-[#FFCC00] flex items-center justify-center font-bold text-xs shadow-xs shrink-0 select-none`}
        >
          €
        </div>
      );
    case 'fx-gbp':
      return (
        <div
          className={`${className} rounded-full bg-[#C8102E] text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0 select-none`}
        >
          £
        </div>
      );
    case 'fx-jpy':
      return (
        <div
          className={`${className} rounded-full bg-[#BC002D] text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0 select-none`}
        >
          ¥
        </div>
      );
    case 'fx-aud':
      return (
        <div
          className={`${className} rounded-full bg-[#00843D] text-[#FFCD00] flex items-center justify-center font-bold text-xs shadow-xs shrink-0 select-none`}
        >
          A$
        </div>
      );
    case 'fx-cad':
      return (
        <div
          className={`${className} rounded-full bg-[#D80027] text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0 select-none`}
        >
          C$
        </div>
      );
    case 'fx-chf':
      return (
        <div
          className={`${className} rounded-full bg-[#FF0000] text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0 select-none`}
        >
          +
        </div>
      );
    case 'fx-nzd':
      return (
        <div
          className={`${className} rounded-full bg-[#00247D] text-[#CC142B] flex items-center justify-center font-bold text-xs shadow-xs shrink-0 select-none`}
        >
          NZ
        </div>
      );

    // Commodities
    case 'cmd-gold':
      return (
        <div
          className={`${className} rounded-full bg-amber-400 text-amber-950 flex items-center justify-center font-bold text-xs shadow-xs shrink-0 select-none`}
        >
          Au
        </div>
      );
    case 'cmd-silver':
      return (
        <div
          className={`${className} rounded-full bg-slate-300 text-slate-800 flex items-center justify-center font-bold text-xs shadow-xs shrink-0 select-none`}
        >
          Ag
        </div>
      );
    case 'cmd-oil':
    case 'cmd-brent':
      return (
        <div
          className={`${className} rounded-full bg-slate-900 text-amber-400 flex items-center justify-center font-bold text-xs shadow-xs shrink-0 select-none`}
        >
          🛢️
        </div>
      );
    case 'cmd-gas':
      return (
        <div
          className={`${className} rounded-full bg-sky-500 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0 select-none`}
        >
          🔥
        </div>
      );
    case 'cmd-copper':
      return (
        <div
          className={`${className} rounded-full bg-[#B87333] text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0 select-none`}
        >
          Cu
        </div>
      );
    case 'cmd-plat':
      return (
        <div
          className={`${className} rounded-full bg-slate-400 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0 select-none`}
        >
          Pt
        </div>
      );
    case 'cmd-pall':
      return (
        <div
          className={`${className} rounded-full bg-zinc-500 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0 select-none`}
        >
          Pd
        </div>
      );
    case 'cmd-wheat':
      return (
        <div
          className={`${className} rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0 select-none`}
        >
          🌾
        </div>
      );
    case 'cmd-coffee':
      return (
        <div
          className={`${className} rounded-full bg-[#78350F] text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0 select-none`}
        >
          ☕
        </div>
      );

    // Indices & Stocks
    case 'index-us':
    case 'index-nas':
    case 'index-dow':
    case 'index-ger':
    case 'index-uk':
    case 'index-jpn':
    case 'index-hk':
    case 'index-eu':
    case 'index-fr':
      return (
        <div
          className={`${className} rounded-full bg-indigo-900 text-indigo-200 flex items-center justify-center font-bold text-[10px] shadow-xs shrink-0 select-none`}
        >
          IDX
        </div>
      );

    case 'stk-aapl':
      return (
        <div
          className={`${className} rounded-full bg-black text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0 select-none`}
        >
          
        </div>
      );
    case 'stk-nvda':
      return (
        <div
          className={`${className} rounded-full bg-[#76B900] text-white flex items-center justify-center font-black text-[10px] shadow-xs shrink-0 select-none`}
        >
          NV
        </div>
      );
    case 'stk-msft':
      return (
        <div
          className={`${className} rounded-full bg-[#00A4EF] text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0 select-none`}
        >
          ⊞
        </div>
      );
    case 'stk-amzn':
      return (
        <div
          className={`${className} rounded-full bg-[#FF9900] text-slate-950 flex items-center justify-center font-black text-xs shadow-xs shrink-0 select-none`}
        >
          a
        </div>
      );
    case 'stk-googl':
      return (
        <div
          className={`${className} rounded-full bg-[#4285F4] text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0 select-none`}
        >
          G
        </div>
      );
    case 'stk-meta':
      return (
        <div
          className={`${className} rounded-full bg-[#0668E1] text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0 select-none`}
        >
          ∞
        </div>
      );
    case 'stk-tsla':
      return (
        <div
          className={`${className} rounded-full bg-[#E82127] text-white flex items-center justify-center font-black text-xs shadow-xs shrink-0 select-none`}
        >
          T
        </div>
      );
    default:
      return (
        <div
          className={`${className} rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shadow-xs shrink-0 select-none`}
        >
          {name.charAt(0)}
        </div>
      );
  }
};

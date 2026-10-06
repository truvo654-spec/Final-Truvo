import React from 'react';
import { PromoType, PromoLevel } from '../../data/promotionsData';

/* ───────────── Banner artwork ───────────── */

export const THEME: Record<PromoType, { bg: string; ink: string; sub: string; art: string }> = {
  cashback: { bg: '#CAEB0E', ink: '#0b1c30', sub: 'rgba(11,28,48,0.7)', art: '#0b1c30' },
  deposit: { bg: '#5338ec', ink: '#ffffff', sub: 'rgba(255,255,255,0.78)', art: '#CAEB0E' },
  spread: { bg: '#0b1c30', ink: '#ffffff', sub: 'rgba(255,255,255,0.7)', art: '#CAEB0E' },
  fee: { bg: '#FD02B0', ink: '#ffffff', sub: 'rgba(255,255,255,0.85)', art: '#ffffff' },
  contest: { bg: '#3410D5', ink: '#ffffff', sub: 'rgba(255,255,255,0.78)', art: '#FD02B0' },
};

export const LEVEL_DOT: Record<PromoLevel, string> = { 1: '#94a3b8', 2: '#5338ec', 3: '#FD02B0', 4: '#CAEB0E' };

export const BannerArt: React.FC<{ type: PromoType; color: string }> = ({ type, color }) => {
  const c = color;
  return (
    <svg viewBox="0 0 160 140" className="absolute right-2 bottom-1 w-40 h-36" fill="none" aria-hidden>
      {type === 'cashback' && (
        <g stroke={c} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <path d={`M48 ${112 - i * 24} v14 c0 8 19 14 42 14 s42 -6 42 -14 v-14`} />
              <ellipse cx="90" cy={112 - i * 24} rx="42" ry="14" fill={i === 2 ? c : 'none'} fillOpacity={i === 2 ? 0.18 : 0} />
            </g>
          ))}
          <path d="M90 28 v22 M82 36 h12 a6 6 0 0 1 0 12 h-12" strokeWidth="4" />
        </g>
      )}
      {type === 'deposit' && (
        <g>
          <rect x="22" y="92" width="30" height="40" rx="6" fill={c} fillOpacity="0.45" />
          <rect x="62" y="64" width="30" height="68" rx="6" fill={c} fillOpacity="0.7" />
          <rect x="102" y="30" width="30" height="102" rx="6" fill={c} />
          <path d="M30 70 L72 42 L96 20" stroke={c} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M82 18 h16 v16" stroke={c} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      )}
      {type === 'spread' && (
        <g stroke={c} strokeWidth="5" strokeLinecap="round">
          <path d="M10 34 L150 66" />
          <path d="M10 118 L150 86" />
          <circle cx="150" cy="66" r="7" fill={c} />
          <circle cx="150" cy="86" r="7" fill={c} />
          <path d="M84 62 v-22 m0 0 l-7 8 m7 -8 l7 8 M84 90 v22 m0 0 l-7 -8 m7 8 l7 -8" strokeWidth="4" />
        </g>
      )}
      {type === 'fee' && (
        <g stroke={c} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M28 40 h58 l46 46 -46 46 h-58 z" fill={c} fillOpacity="0.16" />
          <circle cx="52" cy="86" r="8" />
          <path d="M20 128 L136 28" strokeWidth="6" />
        </g>
      )}
      {type === 'contest' && (
        <g>
          <rect x="22" y="84" width="34" height="48" rx="6" fill={c} fillOpacity="0.5" />
          <rect x="63" y="56" width="34" height="76" rx="6" fill={c} />
          <rect x="104" y="72" width="34" height="60" rx="6" fill={c} fillOpacity="0.7" />
          <path d="M80 20 l5 10 11 1.6 -8 7.8 2 11 -10 -5.4 -10 5.4 2 -11 -8 -7.8 11 -1.6 z" fill={c} />
        </g>
      )}
    </svg>
  );
};


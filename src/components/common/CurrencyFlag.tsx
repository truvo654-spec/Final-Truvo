import React from 'react';

/**
 * The flags behind a currency pair.
 *
 * A pair is two countries, and traders read it that way, so EUR/JPY shows the
 * European flag with the Japanese one tucked under it rather than a currency
 * glyph. Drawn rather than fetched, so nothing has to load.
 */

const FLAGS: Record<string, React.ReactNode> = {
  USD: (
    <>
      <rect width="24" height="24" fill="#b22234" />
      {[2, 6, 10, 14, 18, 22].map((y) => <rect key={y} y={y} width="24" height="2" fill="#fff" />)}
      <rect width="11" height="13" fill="#3c3b6e" />
    </>
  ),
  EUR: (
    <>
      <rect width="24" height="24" fill="#003399" />
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return <circle key={i} cx={12 + 7 * Math.sin(a)} cy={12 - 7 * Math.cos(a)} r="1.1" fill="#ffcc00" />;
      })}
    </>
  ),
  JPY: (
    <>
      <rect width="24" height="24" fill="#fff" />
      <circle cx="12" cy="12" r="6" fill="#bc002d" />
    </>
  ),
  GBP: (
    <>
      <rect width="24" height="24" fill="#012169" />
      <path d="M0 0l24 24M24 0L0 24" stroke="#fff" strokeWidth="5" />
      <path d="M0 0l24 24M24 0L0 24" stroke="#c8102e" strokeWidth="2.5" />
      <path d="M12 0v24M0 12h24" stroke="#fff" strokeWidth="8" />
      <path d="M12 0v24M0 12h24" stroke="#c8102e" strokeWidth="4.5" />
    </>
  ),
  CHF: (
    <>
      <rect width="24" height="24" fill="#d52b1e" />
      <path d="M10 5h4v5h5v4h-5v5h-4v-5H5v-4h5z" fill="#fff" />
    </>
  ),
  AUD: (
    <>
      <rect width="24" height="24" fill="#012169" />
      <circle cx="17" cy="16" r="2" fill="#fff" />
      <circle cx="8" cy="18" r="1.4" fill="#fff" />
      <path d="M0 0h11v9H0z" fill="#012169" />
      <path d="M0 0l11 9M11 0L0 9" stroke="#fff" strokeWidth="2" />
      <path d="M5.5 0v9M0 4.5h11" stroke="#fff" strokeWidth="3" />
      <path d="M5.5 0v9M0 4.5h11" stroke="#c8102e" strokeWidth="1.6" />
    </>
  ),
  CAD: (
    <>
      <rect width="24" height="24" fill="#fff" />
      <rect width="6" height="24" fill="#d80621" />
      <rect x="18" width="6" height="24" fill="#d80621" />
      <path d="M12 7l1.6 3.4L17 9.6l-1.4 3H17l-3 2 .6 2.4-2.6-1.4-2.6 1.4L10 14.6l-3-2h1.4l-1.4-3 3.4.8z" fill="#d80621" />
    </>
  ),
  NZD: (
    <>
      <rect width="24" height="24" fill="#012169" />
      <path d="M0 0h11v9H0z" fill="#012169" />
      <path d="M0 0l11 9M11 0L0 9" stroke="#fff" strokeWidth="2" />
      <path d="M5.5 0v9M0 4.5h11" stroke="#fff" strokeWidth="3" />
      <path d="M5.5 0v9M0 4.5h11" stroke="#c8102e" strokeWidth="1.6" />
      {[[17, 7], [19, 12], [16, 16], [20, 18]].map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="1.2" fill="#c8102e" stroke="#fff" strokeWidth="0.5" />
      ))}
    </>
  ),
};

/** Whether this ticker is a pair of currencies we can draw. */
export function currencyPair(ticker: string): [string, string] | null {
  const parts = ticker.toUpperCase().split('/');
  if (parts.length !== 2) return null;
  const [a, b] = parts.map((x) => x.trim());
  return FLAGS[a] && FLAGS[b] ? [a, b] : null;
}

export const CurrencyPairFlags: React.FC<{ pair: [string, string]; className?: string }> = ({ pair, className = '' }) => (
  <span className={`relative inline-block shrink-0 ${className}`} aria-hidden>
    <svg viewBox="0 0 24 24" className="h-full w-full rounded-[3px]">{FLAGS[pair[0]]}</svg>
    <svg viewBox="0 0 24 24" className="absolute -bottom-1 -right-1 h-1/2 w-1/2 rounded-full ring-2 ring-white">
      {FLAGS[pair[1]]}
    </svg>
  </span>
);

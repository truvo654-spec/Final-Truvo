/**
 * One place for a broker's brand mark: the colours and the short text each
 * broker is drawn with. The mock logo URLs point at stock photos that have
 * nothing to do with the brand, so everywhere that shows a broker uses this
 * instead and always gets the right look, online or off.
 */
export interface BrokerMark {
  bg: string;
  text: string;
  color: string;
  /** A smaller line under the mark, where the brand has one. */
  sub?: string;
  /** Lets a long word shrink to fit the square. */
  tight?: boolean;
}

const MARKS: Record<string, BrokerMark> = {
  hfm: { bg: '#000000', text: 'HFM', color: '#ffffff', sub: 'HF MARKETS' },
  hotforex: { bg: '#000000', text: 'HFM', color: '#ffffff', sub: 'HF MARKETS' },
  fxpro: { bg: '#dc2626', text: 'FxPro', color: '#ffffff', tight: true },
  exness: { bg: '#fbbf24', text: 'ex', color: '#0f172a' },
  pepperstone: { bg: '#1e3a8a', text: 'pepperstone', color: '#ffffff', tight: true },
  xm: { bg: '#e11d48', text: 'XM', color: '#ffffff' },
  icmarkets: { bg: '#0b3d91', text: 'IC', color: '#ffffff' },
  fbs: { bg: '#1d4ed8', text: 'FBS', color: '#ffffff' },
  octafx: { bg: '#0ea5e9', text: 'Octa', color: '#ffffff', tight: true },
  tickmill: { bg: '#0f766e', text: 'TM', color: '#ffffff' },
  vantage: { bg: '#f97316', text: 'VT', color: '#ffffff' },
  eightcap: { bg: '#111827', text: '8C', color: '#ffffff' },
  axi: { bg: '#b91c1c', text: 'AXI', color: '#ffffff' },
  fxtm: { bg: '#1e40af', text: 'FXTM', color: '#ffffff', tight: true },
};

/** The mark for a broker, falling back to its initials on brand purple. */
export function brokerMark(name: string): BrokerMark {
  const key = (name || '').toLowerCase().replace(/[^a-z]/g, '');
  const hit = Object.keys(MARKS).find((k) => key.includes(k));
  if (hit) return MARKS[hit];
  return { bg: '#5945F1', text: (name || '?').slice(0, 2).toUpperCase(), color: '#ffffff' };
}

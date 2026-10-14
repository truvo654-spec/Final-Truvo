/**
 * Maps a ticker to the mark the analysis pages draw for it.
 * Keeping it in one place means search, the tables and the detail pages
 * can never show three different logos for the same instrument.
 */
const BY_BASE: Record<string, string> = {
  BTC: 'btc', XBT: 'btc', ETH: 'eth', BNB: 'bnb', XMR: 'xmr', LTC: 'ltc', XRP: 'xrp',
  POL: 'pol', MATIC: 'pol', AVAX: 'avax', SOL: 'sol', UNI: 'uni', LINK: 'link',
  ADA: 'ada', DOGE: 'doge', USDT: 'usdt', ICP: 'icp', KCS: 'kcs', NEAR: 'near',
  HBAR: 'hbar', TON: 'ton', PEPE: 'pepe', CHZ: 'chz', CRV: 'crv', SHIB: 'shib',
  WLD: 'wld', DOT: 'dot', AAVE: 'aave', XAU: 'cmd-gold', XAG: 'cmd-silver', WTI: 'cmd-oil', USOIL: 'cmd-oil', UKOIL: 'cmd-brent', NGAS: 'cmd-gas', EUR: 'fx-eur', GBP: 'fx-gbp', JPY: 'fx-jpy', AUD: 'fx-aud', CAD: 'fx-cad', CHF: 'fx-chf', NZD: 'fx-nzd',
};

export function iconTypeFor(symbol: string): string {
  const base = (symbol || '').toUpperCase().split(/[\/\-_ ]/)[0].trim();
  return BY_BASE[base] ?? base.toLowerCase();
}

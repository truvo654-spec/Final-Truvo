/**
 * MarketSyde Application Router & Hierarchy Path Mapping
 * Provides seamless 2-way sync between browser URL and internal view tabs.
 */

export interface RouteResolution {
  tab: string;
  brokerId?: string;
  signalId?: string;
  calcTool?: string;
  subTab?: string;
  isNotFound?: boolean;
}

export interface RouteItem {
  path: string;
  tab: string;
  title: string;
  category: string;
  breadcrumbs: string[];
}

// Complete Hierarchy Registry
export const ROUTE_REGISTRY: Record<string, RouteItem> = {
  dashboard: {
    path: '/dashboard',
    tab: 'dashboard',
    title: 'Dashboard | MarketSyde',
    category: 'Dashboard',
    breadcrumbs: ['MarketSyde', 'Dashboard'],
  },
  landing: {
    path: '/home',
    tab: 'landing',
    title: 'Home | MarketSyde',
    category: 'Home',
    breadcrumbs: ['MarketSyde', 'Home'],
  },
  // Trade - Signals & Analysis
  signals: {
    path: '/trade/signals',
    tab: 'signals',
    title: 'Trading Signals | MarketSyde',
    category: 'Trade',
    breadcrumbs: ['Trade', 'Trading Signals'],
  },
  'signal-detail': {
    path: '/trade/signals/detail',
    tab: 'signal-detail',
    title: 'Signal Detail | MarketSyde',
    category: 'Trade',
    breadcrumbs: ['Trade', 'Signals', 'Signal Detail'],
  },
  'instrument-analysis': {
    path: '/trade/instrument-analysis',
    tab: 'instrument-analysis',
    title: 'Instrument Analysis | MarketSyde',
    category: 'Trade',
    breadcrumbs: ['Trade', 'Instrument Analysis'],
  },

  // Trade - Calculators (Forex)
  'leverage-calculator': {
    path: '/trade/calculators/forex/leverage',
    tab: 'leverage-calculator',
    title: 'Leverage Calculator | MarketSyde',
    category: 'Calculators',
    breadcrumbs: ['Trade', 'Calculators', 'Forex', 'Leverage'],
  },
  'pip-calculator': {
    path: '/trade/calculators/forex/pip-calculator',
    tab: 'pip-calculator',
    title: 'Pip Calculator | MarketSyde',
    category: 'Calculators',
    breadcrumbs: ['Trade', 'Calculators', 'Forex', 'Pip Calculator'],
  },
  'margin-calculator': {
    path: '/trade/calculators/forex/margin-calculator',
    tab: 'margin-calculator',
    title: 'Margin Calculator | MarketSyde',
    category: 'Calculators',
    breadcrumbs: ['Trade', 'Calculators', 'Forex', 'Margin'],
  },
  'rebate-calculator': {
    path: '/trade/calculators/forex/rebate-calculator',
    tab: 'rebate-calculator',
    title: 'Rebate Calculator | MarketSyde',
    category: 'Calculators',
    breadcrumbs: ['Trade', 'Calculators', 'Forex', 'Rebate'],
  },
  'volatility-calculator': {
    path: '/trade/calculators/forex/volatility-calculator',
    tab: 'volatility-calculator',
    title: 'Volatility Calculator | MarketSyde',
    category: 'Calculators',
    breadcrumbs: ['Trade', 'Calculators', 'Forex', 'Volatility'],
  },
  'spread-calculator': {
    path: '/trade/calculators/forex/spread-calculator',
    tab: 'spread-calculator',
    title: 'Spread Cost Calculator | MarketSyde',
    category: 'Calculators',
    breadcrumbs: ['Trade', 'Calculators', 'Forex', 'Spread Cost'],
  },

  // Trade - Calculators (Trade Planning)
  'position-size-calculator': {
    path: '/trade/calculators/planning/position-size',
    tab: 'position-size-calculator',
    title: 'Position Size Calculator | MarketSyde',
    category: 'Calculators',
    breadcrumbs: ['Trade', 'Calculators', 'Planning', 'Position Size'],
  },
  'sltp-calculator': {
    path: '/trade/calculators/planning/stop-loss-take-profit',
    tab: 'sltp-calculator',
    title: 'Stop Loss & Take Profit Calculator | MarketSyde',
    category: 'Calculators',
    breadcrumbs: ['Trade', 'Calculators', 'Planning', 'SL & TP'],
  },
  'stop-out-calculator': {
    path: '/trade/calculators/planning/stop-out',
    tab: 'stop-out-calculator',
    title: 'Stop-Out Calculator | MarketSyde',
    category: 'Calculators',
    breadcrumbs: ['Trade', 'Calculators', 'Planning', 'Stop Out'],
  },

  // Trade - Calculators (Technical Analysis)
  'fibonacci-calculator': {
    path: '/trade/calculators/technical/fibonacci',
    tab: 'fibonacci-calculator',
    title: 'Fibonacci Calculator | MarketSyde',
    category: 'Calculators',
    breadcrumbs: ['Trade', 'Calculators', 'Technical', 'Fibonacci'],
  },
  'pivot-point-calculator': {
    path: '/trade/calculators/technical/pivot-points',
    tab: 'pivot-point-calculator',
    title: 'Pivot Points Calculator | MarketSyde',
    category: 'Calculators',
    breadcrumbs: ['Trade', 'Calculators', 'Technical', 'Pivot Points'],
  },

  // Trade - Calculators (Performance)
  'profit-loss-calculator': {
    path: '/trade/calculators/performance/profit-loss',
    tab: 'profit-loss-calculator',
    title: 'Profit / Loss Calculator | MarketSyde',
    category: 'Calculators',
    breadcrumbs: ['Trade', 'Calculators', 'Performance', 'Profit & Loss'],
  },
  'drawdown-calculator': {
    path: '/trade/calculators/performance/drawdown',
    tab: 'drawdown-calculator',
    title: 'Drawdown Calculator | MarketSyde',
    category: 'Calculators',
    breadcrumbs: ['Trade', 'Calculators', 'Performance', 'Drawdown'],
  },
  'compound-calculator': {
    path: '/trade/calculators/performance/compounding',
    tab: 'compound-calculator',
    title: 'Compounding Calculator | MarketSyde',
    category: 'Calculators',
    breadcrumbs: ['Trade', 'Calculators', 'Performance', 'Compounding'],
  },

  // Trade - Converters
  'timezone-converter': {
    path: '/trade/converters/timezone',
    tab: 'timezone-converter',
    title: 'Trading Timezone Converter | MarketSyde',
    category: 'Converters',
    breadcrumbs: ['Trade', 'Converters', 'Trading Timezone'],
  },
  'currency-converter': {
    path: '/trade/converters/currency',
    tab: 'currency-converter',
    title: 'Currency Converter | MarketSyde',
    category: 'Converters',
    breadcrumbs: ['Trade', 'Converters', 'Currency Converter'],
  },

  // Brokers
  brokers: {
    path: '/brokers',
    tab: 'brokers',
    title: 'CFD & Forex Brokers Directory | MarketSyde',
    category: 'Brokers',
    breadcrumbs: ['Brokers', 'All Brokers'],
  },
  'broker-comparison': {
    path: '/brokers/compare',
    tab: 'broker-comparison',
    title: 'Broker Comparison Arena | MarketSyde',
    category: 'Brokers',
    breadcrumbs: ['Brokers', 'Compare Brokers'],
  },
  'connect-to-truvo': {
    path: '/brokers/connect',
    tab: 'connect-to-truvo',
    title: 'Connect Broker to MarketSyde | MarketSyde',
    category: 'Brokers',
    breadcrumbs: ['Brokers', 'Connect Account'],
  },
  'broker-detail': {
    path: '/brokers/detail',
    tab: 'broker-detail',
    title: 'Broker Overview | MarketSyde',
    category: 'Brokers',
    breadcrumbs: ['Brokers', 'Broker Detail'],
  },
  'broker-rebate-table': {
    path: '/brokers/rebates',
    tab: 'broker-rebate-table',
    title: 'Cashback Rebate Schedule | MarketSyde',
    category: 'Brokers',
    breadcrumbs: ['Brokers', 'Rebate Table'],
  },

  // Community
  community: {
    path: '/community',
    tab: 'community',
    title: 'Trader Community Floor | MarketSyde',
    category: 'Community',
    breadcrumbs: ['Community', 'Feeds & Discussions'],
  },
  leaderboard: {
    path: '/community/leaderboard',
    tab: 'leaderboard',
    title: 'Trader Leaderboard & Prize Pool | MarketSyde',
    category: 'Community',
    breadcrumbs: ['Community', 'Leaderboard'],
  },
  'points-credits': {
    path: '/community/points-credits',
    tab: 'points-credits',
    title: 'Syde Points & Credits Station | MarketSyde',
    category: 'Community',
    breadcrumbs: ['Community', 'Points & Credits'],
  },
  'level-points-guide': {
    path: '/community/points-guide',
    tab: 'level-points-guide',
    title: 'Trader Level Progression Guide | MarketSyde',
    category: 'Community',
    breadcrumbs: ['Community', 'Level Guide'],
  },
  'credit-earning-guide': {
    path: '/community/credit-guide',
    tab: 'credit-earning-guide',
    title: 'Syde Credits Earning Guide | MarketSyde',
    category: 'Community',
    breadcrumbs: ['Community', 'Credit Guide'],
  },

  // Cashback
  'cashback-overview': {
    path: '/cashback',
    tab: 'cashback-overview',
    title: 'Cashback Rebates Overview | MarketSyde',
    category: 'Cashback',
    breadcrumbs: ['Cashback', 'Overview & Claims'],
  },
  'active-trading-accounts': {
    path: '/cashback/accounts',
    tab: 'active-trading-accounts',
    title: 'Active Trading Accounts | MarketSyde',
    category: 'Cashback',
    breadcrumbs: ['Cashback', 'Linked Accounts'],
  },

  // Pricing / Membership
  'member-plan': {
    path: '/pricing',
    tab: 'member-plan',
    title: 'Membership & Pricing Plans | MarketSyde',
    category: 'Membership',
    breadcrumbs: ['Membership', 'Plans & Pricing'],
  },

  // Account
  profile: {
    path: '/account/profile',
    tab: 'profile',
    title: 'User Profile & Settings | MarketSyde',
    category: 'Account',
    breadcrumbs: ['Account', 'Profile Settings'],
  },
  'account-security': {
    path: '/account/security',
    tab: 'account-security',
    title: 'Account Security & MFA | MarketSyde',
    category: 'Account',
    breadcrumbs: ['Account', 'Security'],
  },
  'activity-logs': {
    path: '/account/activity-logs',
    tab: 'activity-logs',
    title: 'Activity Logs & Audit Trail | MarketSyde',
    category: 'Account',
    breadcrumbs: ['Account', 'Activity Logs'],
  },
  notifications: {
    path: '/account/notifications',
    tab: 'notifications',
    title: 'Notifications Center | MarketSyde',
    category: 'Account',
    breadcrumbs: ['Account', 'Notifications'],
  },

  // Company
  about: {
    path: '/about',
    tab: 'about',
    title: 'About MarketSyde | MarketSyde',
    category: 'Company',
    breadcrumbs: ['Company', 'About Us'],
  },
  'contact-us': {
    path: '/contact',
    tab: 'contact-us',
    title: 'Contact Support | MarketSyde',
    category: 'Company',
    breadcrumbs: ['Company', 'Contact Us'],
  },
  'terms-and-conditions': {
    path: '/terms',
    tab: 'terms-and-conditions',
    title: 'Terms & Conditions | MarketSyde',
    category: 'Company',
    breadcrumbs: ['Company', 'Terms & Conditions'],
  },

  // Error Pages
  '404': {
    path: '/404',
    tab: '404',
    title: 'Page Not Found (404) | MarketSyde',
    category: 'System',
    breadcrumbs: ['System', '404 Not Found'],
  },
  '500': {
    path: '/500',
    tab: '500',
    title: 'Server Error (500) | MarketSyde',
    category: 'System',
    breadcrumbs: ['System', '500 Internal Error'],
  },
  '503': {
    path: '/503',
    tab: '503',
    title: 'Maintenance Mode (503) | MarketSyde',
    category: 'System',
    breadcrumbs: ['System', '503 Maintenance'],
  },
};

/**
 * Convert internal tab and optional params to exact URL path
 */
export function tabToPath(
  tab: string,
  params?: { brokerId?: string; signalId?: string; calcTool?: string }
): string {
  // Direct matching
  if (tab === 'broker-detail' && params?.brokerId) {
    return `/brokers/${encodeURIComponent(params.brokerId.toLowerCase())}`;
  }
  if (tab === 'broker-rebate-table' && params?.brokerId) {
    return `/brokers/${encodeURIComponent(params.brokerId.toLowerCase())}/rebates`;
  }
  if (tab === 'signal-detail' && params?.signalId) {
    return `/trade/signals/${encodeURIComponent(params.signalId.toLowerCase())}`;
  }

  // Aliases
  if (tab === 'contact') tab = 'contact-us';
  if (tab === 'terms') tab = 'terms-and-conditions';
  if (tab === 'home') tab = 'landing';
  if (tab === 'membership') tab = 'member-plan';
  if (tab === 'calculators') tab = 'leverage-calculator';
  if (tab === 'pips-calculator') tab = 'pip-calculator';
  if (tab === 'loss-calculator' || tab === 'performance-calculator') tab = 'profit-loss-calculator';
  if (tab === 'trading-timezone-converter' || tab === 'conversion-calculator') tab = 'timezone-converter';
  if (tab === 'trade-planning-calculator') tab = 'position-size-calculator';

  const entry = ROUTE_REGISTRY[tab];
  return entry ? entry.path : '/dashboard';
}

/**
 * Parse an incoming URL pathname into the corresponding Tab & parameters
 */
export function pathToState(rawPath: string): RouteResolution {
  const pathname = (rawPath || '/').replace(/\/+$/, '') || '/';

  // 1. Root & Dashboard
  if (pathname === '/' || pathname === '/dashboard') {
    return { tab: 'dashboard' };
  }
  if (pathname === '/home' || pathname === '/landing') {
    return { tab: 'landing' };
  }

  // 2. Trade hierarchy
  if (pathname === '/trade/signals') {
    return { tab: 'signals' };
  }
  const signalMatch = pathname.match(/^\/trade\/signals\/([^/]+)$/);
  if (signalMatch) {
    return { tab: 'signal-detail', signalId: signalMatch[1] };
  }
  if (pathname === '/trade/instrument-analysis' || pathname === '/trade/analysis' || pathname === '/analysis') {
    return { tab: 'instrument-analysis' };
  }

  // 3. Calculators hierarchy
  if (pathname === '/trade/calculators' || pathname === '/trade/calculators/forex' || pathname === '/trade/calculators/forex/leverage') {
    return { tab: 'leverage-calculator' };
  }
  if (pathname === '/trade/calculators/forex/pip-calculator' || pathname === '/pip-calculator') {
    return { tab: 'pip-calculator' };
  }
  if (pathname === '/trade/calculators/forex/margin-calculator' || pathname === '/margin-calculator') {
    return { tab: 'margin-calculator' };
  }
  if (pathname === '/trade/calculators/forex/rebate-calculator' || pathname === '/rebate-calculator') {
    return { tab: 'rebate-calculator' };
  }
  if (pathname === '/trade/calculators/forex/volatility-calculator' || pathname === '/volatility-calculator') {
    return { tab: 'volatility-calculator' };
  }
  if (pathname === '/trade/calculators/forex/spread-calculator' || pathname === '/spread-calculator') {
    return { tab: 'spread-calculator' };
  }

  // Planning calculators
  if (pathname === '/trade/calculators/planning' || pathname === '/trade/calculators/planning/position-size' || pathname === '/position-size-calculator') {
    return { tab: 'position-size-calculator' };
  }
  if (pathname === '/trade/calculators/planning/stop-loss-take-profit' || pathname === '/sltp-calculator') {
    return { tab: 'sltp-calculator' };
  }
  if (pathname === '/trade/calculators/planning/stop-out' || pathname === '/stop-out-calculator') {
    return { tab: 'stop-out-calculator' };
  }

  // Technical calculators
  if (pathname === '/trade/calculators/technical' || pathname === '/trade/calculators/technical/fibonacci' || pathname === '/fibonacci-calculator') {
    return { tab: 'fibonacci-calculator' };
  }
  if (pathname === '/trade/calculators/technical/pivot-points' || pathname === '/pivot-point-calculator') {
    return { tab: 'pivot-point-calculator' };
  }

  // Performance calculators
  if (pathname === '/trade/calculators/performance' || pathname === '/trade/calculators/performance/profit-loss' || pathname === '/profit-loss-calculator') {
    return { tab: 'profit-loss-calculator' };
  }
  if (pathname === '/trade/calculators/performance/drawdown' || pathname === '/drawdown-calculator') {
    return { tab: 'drawdown-calculator' };
  }
  if (pathname === '/trade/calculators/performance/compounding' || pathname === '/compound-calculator') {
    return { tab: 'compound-calculator' };
  }

  // Converters
  if (pathname === '/trade/converters/timezone' || pathname === '/timezone-converter') {
    return { tab: 'timezone-converter' };
  }
  if (pathname === '/trade/converters/currency' || pathname === '/currency-converter') {
    return { tab: 'currency-converter' };
  }

  // 4. Brokers hierarchy
  if (pathname === '/brokers') {
    return { tab: 'brokers' };
  }
  if (pathname === '/brokers/compare') {
    return { tab: 'broker-comparison' };
  }
  if (pathname === '/brokers/connect') {
    return { tab: 'connect-to-truvo' };
  }
  const brokerRebateMatch = pathname.match(/^\/brokers\/([^/]+)\/rebates$/);
  if (brokerRebateMatch) {
    return { tab: 'broker-rebate-table', brokerId: brokerRebateMatch[1] };
  }
  const brokerDetailMatch = pathname.match(/^\/brokers\/([^/]+)$/);
  if (brokerDetailMatch && brokerDetailMatch[1] !== 'compare' && brokerDetailMatch[1] !== 'connect') {
    return { tab: 'broker-detail', brokerId: brokerDetailMatch[1] };
  }

  // 5. Community hierarchy
  if (pathname === '/community' || pathname === '/community/feed') {
    return { tab: 'community' };
  }
  if (pathname === '/community/leaderboard') {
    return { tab: 'leaderboard' };
  }
  if (pathname === '/community/points-credits') {
    return { tab: 'points-credits' };
  }
  if (pathname === '/community/points-guide') {
    return { tab: 'level-points-guide' };
  }
  if (pathname === '/community/credit-guide') {
    return { tab: 'credit-earning-guide' };
  }

  // 6. Cashback hierarchy
  if (pathname === '/cashback' || pathname === '/cashback/overview') {
    return { tab: 'cashback-overview' };
  }
  if (pathname === '/cashback/accounts') {
    return { tab: 'active-trading-accounts' };
  }

  // 7. Pricing & Membership
  if (pathname === '/pricing' || pathname === '/membership' || pathname === '/member-plan') {
    return { tab: 'member-plan' };
  }

  // 8. Account hierarchy
  if (pathname === '/account/profile' || pathname === '/profile') {
    return { tab: 'profile' };
  }
  if (pathname === '/account/security' || pathname === '/security') {
    return { tab: 'account-security' };
  }
  if (pathname === '/account/activity-logs' || pathname === '/activity-logs') {
    return { tab: 'activity-logs' };
  }
  if (pathname === '/account/notifications' || pathname === '/notifications') {
    return { tab: 'notifications' };
  }

  // 9. Company & Legal
  if (pathname === '/about') {
    return { tab: 'about' };
  }
  if (pathname === '/contact' || pathname === '/contact-us') {
    return { tab: 'contact-us' };
  }
  if (pathname === '/terms' || pathname === '/terms-and-conditions') {
    return { tab: 'terms-and-conditions' };
  }

  // 10. System Error Pages
  if (pathname === '/500') return { tab: '500' };
  if (pathname === '/503') return { tab: '503' };
  if (pathname === '/404') return { tab: '404' };

  // If no match found, fallback to 404
  return { tab: '404', isNotFound: true };
}

/**
 * Get Breadcrumbs and metadata for any active tab
 */
export function getRouteMeta(tab: string) {
  return ROUTE_REGISTRY[tab] || {
    path: '/dashboard',
    tab: 'dashboard',
    title: 'MarketSyde',
    category: 'Dashboard',
    breadcrumbs: ['MarketSyde'],
  };
}

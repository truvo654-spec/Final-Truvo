export const JOURNAL_TABS = {
  overview: 'Overview', entries: 'Trade Log', insights: 'Insights',
  playbook: 'Playbook', backtest: 'Backtest', review: 'AI Coach',
} as const;
export type JournalTab = keyof typeof JOURNAL_TABS;
export const JOURNAL_LEVELS = ['easy', 'standard', 'advanced'] as const;
export type JournalLevel = typeof JOURNAL_LEVELS[number];
export const LEVEL_DESCRIPTIONS: Record<JournalLevel, string> = {
  easy: 'Just the essentials, in plain words.',
  standard: 'More context and everyday tools.',
  advanced: 'The original journal with every control.',
};
export interface JournalCardDefinition {
  id: string;
  tab: JournalTab;
  subView?: string;
  title: string;
  plainSummary: string;
  level: JournalLevel;
  order: number;
  canHide: boolean;
  lazy: boolean;
  component: string;
}
const logCard = (id: string, title: string, plainSummary: string, level: JournalLevel, order: number): JournalCardDefinition =>
  ({ id, tab: 'entries', title, plainSummary, level, order, canHide: true, lazy: true, component: id });
export const JOURNAL_CARD_REGISTRY: readonly JournalCardDefinition[] = [
  logCard('summary', 'Your results', 'A sentence and three figures for the trades shown.', 'easy', 0),
  logCard('net', 'Net result', 'What you made after recorded trading costs.', 'standard', 1),
  logCard('win-rate', 'Win rate', 'How many closed trades finished with a gain.', 'standard', 2),
  logCard('payoff', 'Average win vs average loss', 'Compare the size of your average gain and loss.', 'standard', 3),
  logCard('profit-factor', 'Wins compared with losses', 'Money won for every unit of money lost.', 'standard', 4),
  logCard('trades', 'My trades', 'Your trades, newest first. Select one to review it.', 'easy', 10),
  logCard('realized-r', 'Result compared with risk', 'The existing average realized R and its coverage.', 'advanced', 20),
  logCard('fees', 'Commissions and fees', 'Recorded costs on closed trades.', 'advanced', 21),
  logCard('cashback', 'Cashback estimate', 'Estimated rewards in USD, separate from trading results.', 'advanced', 22),
  logCard('points', 'Points estimate', 'Estimated points before boosters.', 'advanced', 23),
  logCard('tools', 'Advanced trade tools', 'Grouping, all columns, CSV export, bulk actions and replay.', 'advanced', 30),
  ...(['overview', 'insights', 'playbook', 'backtest', 'review'] as const).map(tab => ({
    id: `${tab}-workspace`, tab, title: JOURNAL_TABS[tab],
    plainSummary: `Your existing ${JOURNAL_TABS[tab]} workspace. Its dedicated simplification will come later.`,
    level: 'easy' as const, order: 0, canHide: true, lazy: true, component: 'existing',
  })),
];
export interface JournalTabPreference {
  level: JournalLevel;
  hidden: string[];
  added: string[];
  order: string[];
}
export interface JournalViewPreferences {
  version: 1;
  defaultLevel: JournalLevel;
  tabs: Partial<Record<JournalTab, JournalTabPreference>>;
  welcomed: boolean;
}
export const defaultJournalViews = (): JournalViewPreferences => ({ version: 1, defaultLevel: 'easy', tabs: {}, welcomed: false });
export const isJournalLevel = (value: unknown): value is JournalLevel => JOURNAL_LEVELS.some(level => level === value);
const record = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);
const ids = (value: unknown, tab: JournalTab) => {
  const allowed = JOURNAL_CARD_REGISTRY.filter(card => card.tab === tab).map(card => card.id);
  return Array.isArray(value) ? [...new Set(value.filter((id): id is string => typeof id === 'string' && allowed.includes(id)))] : [];
};
export function migrateJournalViews(value: unknown): JournalViewPreferences {
  if (value == null) return defaultJournalViews();
  if (isJournalLevel(value)) return { ...defaultJournalViews(), defaultLevel: value };
  if (!record(value) || (value.version !== undefined && value.version !== 0 && value.version !== 1)) {
    throw new Error('Unsupported or unreadable journal view preferences');
  }
  const result = defaultJournalViews();
  result.defaultLevel = isJournalLevel(value.defaultLevel) ? value.defaultLevel : 'easy';
  result.welcomed = value.welcomed === true;
  if (record(value.tabs)) {
    for (const tab of Object.keys(JOURNAL_TABS) as JournalTab[]) {
      const saved = value.tabs[tab];
      if (isJournalLevel(saved)) result.tabs[tab] = { level: saved, hidden: [], added: [], order: [] };
      else if (record(saved)) {
        const hidden = ids(saved.hidden, tab);
        result.tabs[tab] = {
          level: isJournalLevel(saved.level) ? saved.level : result.defaultLevel,
          hidden, added: ids(saved.added, tab).filter(id => !hidden.includes(id)), order: ids(saved.order, tab),
        };
      }
    }
  }
  return result;
}
export const tabPreference = (prefs: JournalViewPreferences, tab: JournalTab): JournalTabPreference =>
  prefs.tabs[tab] || { level: prefs.defaultLevel, hidden: [], added: [], order: [] };
export function journalCardsFor(prefs: JournalViewPreferences, tab: JournalTab, subView?: string) {
  const pref = tabPreference(prefs, tab);
  return JOURNAL_CARD_REGISTRY.filter(card => card.tab === tab && (!card.subView || card.subView === subView))
    .filter(card => !pref.hidden.includes(card.id) && (pref.added.includes(card.id) || JOURNAL_LEVELS.indexOf(card.level) <= JOURNAL_LEVELS.indexOf(pref.level)))
    // The Standard summary is replaced by its four individual figures.
    .filter(card => card.id !== 'summary' || pref.level === 'easy' || pref.added.includes(card.id))
    .sort((a, b) => {
      const rank = (card: JournalCardDefinition) => pref.order.includes(card.id) ? pref.order.indexOf(card.id) : pref.order.length + card.order;
      return rank(a) - rank(b);
    });
}
export type JournalViewAction =
  | { type: 'level'; tab: JournalTab; level: JournalLevel }
  | { type: 'default'; level: JournalLevel }
  | { type: 'hide' | 'add'; tab: JournalTab; id: string }
  | { type: 'move'; tab: JournalTab; id: string; direction: -1 | 1; subView?: string }
  | { type: 'reset'; tab?: JournalTab }
  | { type: 'welcome' };
export function updateJournalViews(prefs: JournalViewPreferences, action: JournalViewAction): JournalViewPreferences {
  if (action.type === 'reset') {
    if (!action.tab) return { ...defaultJournalViews(), welcomed: prefs.welcomed };
    const tabs = { ...prefs.tabs }; delete tabs[action.tab]; return { ...prefs, tabs };
  }
  if (action.type === 'welcome') return { ...prefs, welcomed: true };
  if (action.type === 'default') return { ...prefs, defaultLevel: action.level, tabs: {} };
  const pref = { ...tabPreference(prefs, action.tab) };
  if (action.type === 'level') Object.assign(pref, { level: action.level, hidden: [], added: [], order: [] });
  else if (action.type === 'add' || action.type === 'hide') {
    const card = JOURNAL_CARD_REGISTRY.find(card => card.tab === action.tab && card.id === action.id);
    if (!card || (action.type === 'hide' && !card.canHide)) return prefs;
    pref.hidden = pref.hidden.filter(id => id !== action.id);
    pref.added = pref.added.filter(id => id !== action.id);
    if (action.type === 'hide') pref.hidden.push(action.id);
    else pref.added.push(action.id);
  } else if (action.type === 'move') {
    const order = journalCardsFor(prefs, action.tab, action.subView).map(card => card.id);
    const from = order.indexOf(action.id), to = from + action.direction;
    if (from < 0 || to < 0 || to >= order.length) return prefs;
    [order[from], order[to]] = [order[to], order[from]];
    pref.order = [...order, ...pref.order.filter(id => !order.includes(id))];
  }
  return { ...prefs, tabs: { ...prefs.tabs, [action.tab]: pref } };
}

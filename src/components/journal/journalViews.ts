export const JOURNAL_TABS = {
  overview: 'Overview', entries: 'Trade Log', insights: 'Insights',
  playbook: 'Playbook', backtest: 'Backtest', review: 'AI Coach',
} as const;
export type JournalTab = keyof typeof JOURNAL_TABS;
export const isJournalTab = (value: unknown): value is JournalTab => typeof value === 'string' && Object.hasOwn(JOURNAL_TABS, value);
export const JOURNAL_VIEW_TABS = ['overview', 'insights', 'playbook', 'backtest', 'review'] as const;
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
  easyOrder?: number;
  availableLevels?: readonly JournalLevel[];
  canHide: boolean;
  lazy: boolean;
  component: string;
}
export const JOURNAL_CARD_REGISTRY: readonly JournalCardDefinition[] = [
  ...JOURNAL_VIEW_TABS.filter(tab => tab !== 'insights').map(tab => ({
    id: `${tab}-workspace`, tab, title: JOURNAL_TABS[tab],
    plainSummary: `Your existing ${JOURNAL_TABS[tab]} workspace. Its dedicated simplification will come later.`,
    level: 'easy' as const, order: 0, canHide: true, lazy: true, component: 'existing',
  })),
  ...([
    ['insights-kpis', 'How am I doing?', 'Six result cards with daily trends and comparisons against the previous equal period.'],
    ['insights-playbooks', 'Your playbook progress', 'Automatic setup results and plan-following bars from this view. Progress reflects answered plan checks, not profit targets or account rewards.'],
    ['insights-discipline', 'Your discipline track', 'The existing Overview discipline score, review coverage and current reviewed-plan streak. Visual habit markers only; no Points or Credits are awarded.'],
    ['insights-calendar', 'Trading calendar', 'Closed-trade results by local exit date, with weekly totals.'],
    ['insights-curve', 'Cumulative P&L', 'Switch between cumulative and daily closed-trade P&L with the same realized drawdown, chart-only zoom and day drill-downs.'],
    ['insights-weekdays', 'Day-of-week performance', 'Compare net results and win rates by closing weekday.'],
    ['insights-hours', 'Time-of-day performance', 'Compare net results by entry hour in your profile timezone.'],
    ['insights-heatmap', 'Day × hour', 'Explore entry weekdays and hours together. Select a cell to inspect its trades.'],
    ['insights-callouts', 'What your trades show', 'Rule-based observations supported by at least five trades in every compared group.'],
  ] as const).map(([id, title, plainSummary], order) => ({
    id, tab: 'insights' as const, title, plainSummary, level: id === 'insights-heatmap' ? 'standard' as const : 'easy' as const, order,
    easyOrder: id === 'insights-kpis' ? 0 : id === 'insights-calendar' ? 1 : order + 1,
    availableLevels: id === 'insights-heatmap' ? ['standard', 'advanced'] as const : undefined,
    canHide: true, lazy: true, component: id,
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
export const journalCardAvailable = (card: JournalCardDefinition, level: JournalLevel) => !card.availableLevels || card.availableLevels.includes(level);
const record = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);
const ids = (value: unknown, tab: JournalTab, level: JournalLevel) => {
  const allowed = JOURNAL_CARD_REGISTRY.filter(card => card.tab === tab && journalCardAvailable(card, level)).map(card => card.id);
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
    for (const tab of JOURNAL_VIEW_TABS) {
      const saved = value.tabs[tab];
      if (isJournalLevel(saved)) result.tabs[tab] = { level: saved, hidden: [], added: [], order: [] };
      else if (record(saved)) {
        const level = isJournalLevel(saved.level) ? saved.level : result.defaultLevel;
        const hidden = ids(saved.hidden, tab, level);
        result.tabs[tab] = {
          level,
          hidden, added: ids(saved.added, tab, level).filter(id => !hidden.includes(id)), order: ids(saved.order, tab, level),
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
  return JOURNAL_CARD_REGISTRY.filter(card => card.tab === tab && journalCardAvailable(card, pref.level) && (!card.subView || card.subView === subView))
    .filter(card => !pref.hidden.includes(card.id) && (pref.added.includes(card.id) || JOURNAL_LEVELS.indexOf(card.level) <= JOURNAL_LEVELS.indexOf(pref.level)))
    .sort((a, b) => {
      const rank = (card: JournalCardDefinition) => pref.order.includes(card.id) ? pref.order.indexOf(card.id) : pref.order.length + (pref.level === 'easy' ? card.easyOrder ?? card.order : card.order);
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
  if (action.tab === 'entries') return prefs;
  const pref = { ...tabPreference(prefs, action.tab) };
  if (action.type === 'level') Object.assign(pref, { level: action.level, hidden: [], added: [], order: [] });
  else if (action.type === 'add' || action.type === 'hide') {
    const card = JOURNAL_CARD_REGISTRY.find(card => card.tab === action.tab && card.id === action.id);
    if (!card || !journalCardAvailable(card, pref.level) || (action.type === 'hide' && !card.canHide)) return prefs;
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

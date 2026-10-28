import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { defaultJournalViews, JOURNAL_CARD_REGISTRY, JOURNAL_VIEW_TABS, journalCardsFor, migrateJournalViews, updateJournalViews } from '../journalViews';
import { createJournalViewStore } from '../journalViewStore';
import { useJournalCards, type JournalCardsController } from '../useJournalCards';
import { JournalTradeLog } from '../JournalTradeLog';
import { JournalReviewDrawer } from '../JournalReviewDrawer';
import { JournalWorkspaceCard } from '../JournalCards';
import { formatPlainPF, pluralize } from '../journalPlain';
import type { JournalEntry } from '../../../types';

const trade = (patch: Partial<JournalEntry> = {}): JournalEntry => ({
  id: 'one', date: '2026-10-01', symbol: 'TEST', assetClass: 'Stocks', direction: 'BUY', entryPrice: 10,
  exitPrice: 12, size: 1, pnl: 20, commission: 0, rMultiple: null, outcome: 'win', tradingStatus: 'closed',
  strategy: 'Test', tags: [], setupNotes: '', emotionBefore: null, emotionAfter: null, followedPlan: null,
  checklistDone: [], mistakes: [], lessons: '', rating: null, source: 'manual', ...patch,
});
const storage = () => {
  const data = new Map<string, string>();
  return { data, getItem: (key: string) => data.get(key) ?? null, setItem: (key: string, value: string) => { data.set(key, value); } };
};
test('registry keeps foundation cards on other tabs and excludes Trade Log in every level', () => {
  assert.equal(new Set(JOURNAL_CARD_REGISTRY.map(card => card.id)).size, JOURNAL_CARD_REGISTRY.length);
  for (const defaultLevel of ['easy', 'standard', 'advanced'] as const) {
    const prefs = { ...defaultJournalViews(), defaultLevel };
    assert.deepEqual(journalCardsFor(prefs, 'entries'), []);
    for (const tab of JOURNAL_VIEW_TABS) assert.equal(journalCardsFor(prefs, tab)[0].id, tab === 'insights' ? defaultLevel === 'easy' ? 'insights-calendar' : 'insights-kpis' : `${tab}-workspace`);
  }
  const prefs = defaultJournalViews();
  assert.deepEqual(updateJournalViews(prefs, { type: 'level', tab: 'entries', level: 'standard' }), prefs);
});
test('card visibility, add, hide, order and reset are scoped to a tab', () => {
  let preferences = defaultJournalViews();
  preferences = updateJournalViews(preferences, { type: 'hide', tab: 'overview', id: 'overview-workspace' });
  assert.deepEqual(journalCardsFor(preferences, 'overview'), []);
  assert.equal(journalCardsFor(preferences, 'insights')[0].id, 'insights-calendar');
  preferences = updateJournalViews(preferences, { type: 'add', tab: 'overview', id: 'overview-workspace' });
  assert.equal(journalCardsFor(preferences, 'overview')[0].id, 'overview-workspace');
  assert.deepEqual(updateJournalViews(preferences, { type: 'move', tab: 'overview', id: 'overview-workspace', direction: -1 }), preferences);
  assert.deepEqual(updateJournalViews(preferences, { type: 'move', tab: 'overview', id: 'overview-workspace', direction: 1 }), preferences);
  preferences = updateJournalViews(preferences, { type: 'reset', tab: 'overview' });
  assert.equal(preferences.tabs.overview, undefined);
  assert.deepEqual(updateJournalViews(preferences, { type: 'add', tab: 'overview', id: 'insights-workspace' }), preferences);
});
test('versioned migration accepts legacy levels, de-duplicates and removes stale IDs without importing old trade filters', () => {
  assert.equal(migrateJournalViews('advanced').defaultLevel, 'advanced');
  const migrated = migrateJournalViews({
    version: 0, defaultLevel: 'standard',
    tabs: {
      insights: 'advanced',
      entries: { level: 'easy', hidden: ['summary'], added: ['points'], order: ['trades'] },
      overview: { level: 'easy', hidden: ['overview-workspace', 'stale', 'overview-workspace'], added: ['overview-workspace'], order: ['overview-workspace', 'stale'] },
    },
    brokerOff: ['old-broker'],
  });
  assert.equal(migrated.version, 1);
  assert.equal(migrated.tabs.insights.level, 'advanced');
  assert.equal(migrated.tabs.entries, undefined);
  assert.deepEqual(migrated.tabs.overview, { level: 'easy', hidden: ['overview-workspace'], added: [], order: ['overview-workspace'] });
  assert.deepEqual(migrateJournalViews(migrated), migrated);
  assert.throws(() => migrateJournalViews({ version: 9 }));
});
test('preference store notifies subscribers, survives reload and reports blocked storage explicitly', () => {
  const memory = storage(), store = createJournalViewStore(memory, 'views');
  let notifications = 0;
  const unsubscribe = store.subscribe(() => notifications++);
  memory.setItem('entries', JSON.stringify([trade()]));
  const savedTrades = memory.getItem('entries');
  store.dispatch({ type: 'hide', tab: 'overview', id: 'overview-workspace' });
  assert.equal(notifications, 1);
  const restored = createJournalViewStore(memory, 'views');
  assert.deepEqual(restored.getSnapshot().preferences, store.getSnapshot().preferences);
  assert.equal(memory.getItem('entries'), savedTrades);
  unsubscribe();
  store.dispatch({ type: 'welcome' });
  assert.equal(notifications, 1);
  const failing = createJournalViewStore({ getItem: () => null, setItem: () => { throw new Error('quota'); } }, 'views');
  failing.dispatch({ type: 'level', tab: 'overview', level: 'standard' });
  assert.match(failing.getSnapshot().error, /could not be saved/);
  assert.equal(failing.getSnapshot().preferences.tabs.overview.level, 'standard');
});
test('corrupt/future preferences remain untouched until an explicit reset', () => {
  const memory = storage();
  memory.setItem('views', '{"version":42}');
  const store = createJournalViewStore(memory, 'views');
  store.dispatch({ type: 'hide', tab: 'overview', id: 'overview-workspace' });
  assert.equal(memory.getItem('views'), '{"version":42}');
  assert.match(store.getSnapshot().error, /preserved/);
  store.dispatch({ type: 'reset' });
  assert.equal(JSON.parse(memory.getItem('views')).version, 1);
  assert.equal(store.getSnapshot().error, '');
});
test('useJournalCards retains Custom, persistence, move and reset on foundation tabs', () => {
  const memory = storage();
  Object.defineProperty(globalThis, 'window', { configurable: true, value: { localStorage: memory, addEventListener: () => {} } });
  let view: JournalCardsController;
  function Probe() { view = useJournalCards('overview'); return null; }
  const read = () => { renderToStaticMarkup(React.createElement(Probe)); return view; };
  assert.equal(read().level, 'easy');
  view.hide('overview-workspace');
  assert.equal(read().level, 'custom');
  assert.equal(view.cards.length, 0);
  view.add('overview-workspace');
  view.moveUp('overview-workspace');
  assert.deepEqual(read().cards.map(card => card.id), ['overview-workspace']);
  view.setLevel('standard');
  assert.equal(read().baseLevel, 'standard');
  assert.equal(JSON.parse(memory.getItem('ms-journal-v2-views')).tabs.overview.level, 'standard');
  view.reset();
  assert.equal(read().level, 'easy');
  Reflect.deleteProperty(globalThis, 'window');
});
test('plain language handles missing results, infinity, currency and singular counts', () => {
  assert.equal(formatPlainPF(2.21), '$2.21 won for every $1 lost');
  assert.match(formatPlainPF(Infinity), /no losing trades/);
  assert.match(formatPlainPF(null), /No gains or losses/);
  assert.match(formatPlainPF(2.21, 'EUR'), /€/);
  assert.equal(pluralize(1, 'trade'), '1 trade');
  assert.equal(pluralize(2, 'trade'), '2 trades');
});
test('Trade Log renders the original KPI strip, columns, grouping, export and pagination', () => {
  const props = { entries: [trade()], brokers: [], onChange: () => {}, onOpen: () => {}, onToast: () => {} };
  const html = renderToStaticMarkup(React.createElement(JournalTradeLog, props));
  for (const text of ['Cumul. Net P&amp;L', 'Profit Factor', 'Realized R-Avg', 'Export all', 'GROUP:', 'PER PAGE:', 'Columns (9/17)']) assert.ok(html.includes(text));
  assert.match(html, /\+\$20\.00/);
  assert.doesNotMatch(html, /My trades|Quick review|Table settings|Load more/);
});
test('trade selection uses the original full review with existing notes and risk fields', () => {
  const entry = trade({ lessons: 'Keep my existing lesson', initialRisk: 10, emotionAfter: 'Calm' });
  const html = renderToStaticMarkup(React.createElement(JournalReviewDrawer, {
    entry, cohort: [entry.id], onSelect: () => {}, onClose: () => {}, onSave: () => {}, onDelete: () => {}, onReplay: () => {},
  }));
  for (const text of ['Psychology and review', 'Initial monetary risk', 'Rule evidence', 'Pre-trade checklist', 'Complete review', 'Keep my existing lesson']) assert.ok(html.includes(text));
  assert.doesNotMatch(html, /Quick review|More detail|How it went/);
});
test('hidden workspace cards never mount their existing components; Advanced adds no card wrapper', () => {
  let mounts = 0;
  const Existing = () => { mounts++; return React.createElement('p', null, 'Existing workspace'); };
  const hidden: JournalCardsController = {
    cards: [], baseLevel: 'easy', level: 'custom', error: '', welcomed: true,
    setLevel: () => {}, hide: () => {}, add: () => {}, moveUp: () => {}, moveDown: () => {}, reset: () => {}, dismissWelcome: () => {},
  };
  const html = renderToStaticMarkup(React.createElement(JournalWorkspaceCard, { view: hidden, children: React.createElement(Existing) }));
  assert.equal(html, '');
  assert.equal(mounts, 0);
  const advanced: JournalCardsController = { ...hidden, baseLevel: 'advanced', level: 'advanced' };
  assert.equal(renderToStaticMarkup(React.createElement(JournalWorkspaceCard, { view: advanced, children: React.createElement(Existing) })), '<p>Existing workspace</p>');
  assert.equal(mounts, 1);
});

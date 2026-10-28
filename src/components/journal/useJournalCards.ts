import { useSyncExternalStore } from 'react';
import { journalSandbox } from './journalStorage';
import { createJournalViewStore } from './journalViewStore';
import { journalCardsFor, tabPreference, type JournalLevel, type JournalTab } from './journalViews';

const key = journalSandbox ? 'ms-journal-test-v2-views' : 'ms-journal-v2-views';
let store: ReturnType<typeof createJournalViewStore> | undefined;
function getStore() {
  if (!store) {
    // Access localStorage inside the adapter: browsers can throw even on its getter.
    store = createJournalViewStore({
      getItem: name => window.localStorage.getItem(name),
      setItem: (name, value) => window.localStorage.setItem(name, value),
    }, key);
    window.addEventListener('storage', event => { if (event.key === key || event.key === null) store?.reload(); });
  }
  return store;
}
export function useJournalPreferences() {
  const store = getStore();
  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  return { ...snapshot, dispatch: store.dispatch };
}
export function useJournalCards(tabId: JournalTab, subView?: string) {
  const { preferences, error, dispatch } = useJournalPreferences();
  const pref = tabPreference(preferences, tabId);
  const custom = !!(pref.hidden.length || pref.added.length || pref.order.length);
  return {
    level: custom ? 'custom' as const : pref.level, baseLevel: pref.level,
    cards: journalCardsFor(preferences, tabId, subView), error,
    setLevel: (level: JournalLevel) => dispatch({ type: 'level', tab: tabId, level }),
    hide: (id: string) => dispatch({ type: 'hide', tab: tabId, id }),
    add: (id: string) => dispatch({ type: 'add', tab: tabId, id }),
    moveUp: (id: string) => dispatch({ type: 'move', tab: tabId, id, direction: -1, subView }),
    moveDown: (id: string) => dispatch({ type: 'move', tab: tabId, id, direction: 1, subView }),
    reset: () => dispatch({ type: 'reset', tab: tabId }),
    welcomed: preferences.welcomed,
    dismissWelcome: () => dispatch({ type: 'welcome' }),
  };
}
export type JournalCardsController = ReturnType<typeof useJournalCards>;

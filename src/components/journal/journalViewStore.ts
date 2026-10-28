import { defaultJournalViews, migrateJournalViews, updateJournalViews, type JournalViewAction } from './journalViews';

type PreferenceStorage = Pick<Storage, 'getItem' | 'setItem'>;
export function createJournalViewStore(storage: PreferenceStorage, key: string) {
  let blocked = false;
  let snapshot = { preferences: defaultJournalViews(), error: '' };
  try {
    const raw = storage.getItem(key);
    snapshot = { preferences: migrateJournalViews(raw ? JSON.parse(raw) : null), error: '' };
  } catch (error) {
    blocked = true;
    console.warn('Journal view preferences could not be loaded.', error);
    snapshot = { ...snapshot, error: 'Journal views could not be loaded. Changes stay in this session; saved preferences are preserved until you reset them.' };
  }
  const listeners = new Set<() => void>();
  const notify = () => listeners.forEach(listener => listener());
  return {
    getSnapshot: () => snapshot,
    subscribe: (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; },
    dispatch: (action: JournalViewAction) => {
      const preferences = updateJournalViews(snapshot.preferences, action);
      let error = blocked ? snapshot.error : '';
      if (action.type === 'reset' && !action.tab) blocked = false;
      if (!blocked) {
        try { storage.setItem(key, JSON.stringify(preferences)); error = ''; }
        catch (cause) {
          console.warn('Journal view preferences could not be saved.', cause);
          error = 'Journal views could not be saved. Changes work in this session but may not survive reload.';
        }
      }
      snapshot = { preferences, error };
      notify();
    },
    reload: () => {
      try {
        const raw = storage.getItem(key);
        snapshot = { preferences: migrateJournalViews(raw ? JSON.parse(raw) : null), error: '' };
        blocked = false;
      } catch (error) {
        console.warn('Journal view preferences changed but could not be read.', error);
        blocked = true;
        snapshot = { ...snapshot, error: 'Saved journal views are unreadable. Your current view is kept in this session.' };
      }
      notify();
    },
  };
}

import { Strategy } from './engine/types';
import { TEMPLATES, cloneStrategy, uid } from './engine/templates';

const SAVED = 'marketsyde_saved_strategies';
const CURRENT = 'marketsyde_strategy_current';

const read = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};
const write = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage can be blocked */
  }
};

/** A stored strategy is only used if it still has the shape the engine expects. */
export const isValidStrategy = (s: unknown): s is Strategy => {
  const x = s as Strategy;
  return !!x && typeof x === 'object' && typeof x.name === 'string' && !!x.longEntry && Array.isArray(x.longEntry.conditions) && !!x.shortEntry && Array.isArray(x.shortEntry.conditions) && !!x.exit && !!x.exit.exitRules && !!x.sizing && !!x.costs && typeof x.capital === 'number' && typeof x.instrument === 'string';
};

export const loadSaved = (): Strategy[] => read<unknown[]>(SAVED, []).filter(isValidStrategy);
export const saveAll = (list: Strategy[]) => write(SAVED, list);
export const loadCurrent = (): Strategy => {
  const s = read<unknown>(CURRENT, null);
  return isValidStrategy(s) ? s : TEMPLATES[0].build();
};
export const saveCurrent = (s: Strategy) => write(CURRENT, s);

export const withNewId = (s: Strategy): Strategy => ({ ...cloneStrategy(s), id: uid('s'), updatedAt: new Date().toISOString() });

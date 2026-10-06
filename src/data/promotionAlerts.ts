import { useSyncExternalStore } from 'react';
import { Promotion } from './promotionsData';

/**
 * "My Promotion" feed shown on the Notifications page.
 * An item is added when the member taps Notify me (an upcoming offer) or takes an offer.
 * Kept in localStorage so it survives a refresh.
 */
export interface PromoAlert {
  /** Promotion id. One item per promotion and kind. */
  id: string;
  kind: 'notify' | 'taken';
  title: string;
  brokerName: string;
  source: 'broker' | 'platform';
  value: string;
  valueNote: string;
  minLevel: number;
  /** Days until the offer starts, when it was saved. */
  startsInDays: number;
  date: string;
  time: string;
  isRead: boolean;
}

const KEY = 'marketsyde_my_promotions';
let alerts: PromoAlert[] = load();
const listeners = new Set<() => void>();

function load(): PromoAlert[] {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(KEY) : null;
    return raw ? (JSON.parse(raw) as PromoAlert[]) : [];
  } catch {
    return [];
  }
}

function commit(next: PromoAlert[]) {
  alerts = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage can be blocked; the in-memory list still works */
  }
  listeners.forEach((l) => l());
}

const stamp = () => {
  const d = new Date();
  return { date: '05/10/26', time: `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}` };
};

const make = (p: Promotion, kind: PromoAlert['kind']): PromoAlert => ({
  id: p.id,
  kind,
  title: p.title,
  brokerName: p.source === 'platform' ? 'MarketSyde' : p.brokerName,
  source: p.source,
  value: p.value,
  valueNote: p.valueNote,
  minLevel: p.minLevel,
  startsInDays: p.startsInDays,
  ...stamp(),
  isRead: false,
});

export const promotionAlerts = {
  get: () => alerts,
  has: (id: string, kind: PromoAlert['kind']) => alerts.some((a) => a.id === id && a.kind === kind),
  notify: (p: Promotion) => {
    if (promotionAlerts.has(p.id, 'notify')) return;
    commit([make(p, 'notify'), ...alerts]);
  },
  stopNotify: (id: string) => commit(alerts.filter((a) => !(a.id === id && a.kind === 'notify'))),
  taken: (p: Promotion) => {
    if (promotionAlerts.has(p.id, 'taken')) return;
    commit([make(p, 'taken'), ...alerts]);
  },
  markRead: (id: string, kind: PromoAlert['kind']) => commit(alerts.map((a) => (a.id === id && a.kind === kind ? { ...a, isRead: true } : a))),
  markAllRead: () => commit(alerts.map((a) => ({ ...a, isRead: true }))),
  reset: () => commit([]),
};

export function useMyPromotionAlerts(): PromoAlert[] {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => alerts
  );
}

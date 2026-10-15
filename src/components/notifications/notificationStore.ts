import type { NotificationItem } from './NotificationsPage';

/**
 * Notifications the app raises while the person uses it, kept separately from
 * the seeded ones so a reload still shows what they did.
 */
const KEY = 'marketsyde_notifications';

export function readRaised(): NotificationItem[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as NotificationItem[]) : [];
  } catch {
    return [];
  }
}

/** Puts one at the top of the list. */
export function raiseNotification(item: NotificationItem) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify([item, ...readRaised()].slice(0, 30)));
  } catch { /* storage can be blocked */ }
}

/** The notification a price alert raises when it is set. */
export function priceAlertNotification(args: {
  name: string;
  condition: string;
  indicator?: string;
  period?: string;
  deviation?: string;
}): NotificationItem {
  const now = new Date();
  const detail = !args.indicator
    ? `${args.name} has entered the range of your price alert notification.`
    : args.indicator === 'Bollinger Bands'
      ? `${args.name} has entered the range of your price alert notification of ${args.indicator} indicator at Period ${args.period}, Standard Deviation (SD) ${args.deviation}.`
      : `${args.name} has entered the range of your price alert notification of ${args.indicator} indicator at Period ${args.period}.`;
  return {
    id: `alert_${now.getTime()}`,
    category: 'activities',
    source: 'cashback',
    sourceLabel: 'Price Alert',
    title: `${args.name} has entered the range of your price alert notification`,
    modalTitle: `${args.name} has entered the range of your price alert notification`,
    isRead: false,
    date: now.toLocaleDateString('en-GB'),
    time: now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    accountDetail: 'Account Detail',
    detailMessage: detail,
    primaryActionLabel: 'Go to Instrument Analysis',
  };
}

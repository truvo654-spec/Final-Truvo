import type { EconomicEvent, EventImpact } from '../types';

export type ReleaseState = 'Upcoming' | 'Released' | 'All day';
export type SurpriseState = 'Beat' | 'Miss' | 'In line' | 'Pending';

export interface EconomicEventSnapshot {
  event: EconomicEvent;
  releaseState: ReleaseState;
  surprise: SurpriseState;
  surpriseValue: number | null;
  affectedAssets: string[];
  trueRange: string;
  potentialRange: string;
}

export interface EconomicCalendarOverviewTile {
  key: string;
  label: string;
  date: string;
  eventCount: number;
  maxImpact: EventImpact | 'None';
  highImpactCount: number;
}

export interface EconomicCalendarProvider {
  readonly name: string;
  getEvents(): EconomicEvent[];
  getSnapshot(event: EconomicEvent): EconomicEventSnapshot;
  getOverview(from: string, to: string): EconomicCalendarOverviewTile[];
  getNextImpactfulEvent(nowMs: number): EconomicEventSnapshot | null;
  exportCalendar(events: EconomicEvent[]): string;
}

const impactRank: Record<EventImpact, number> = { Low: 1, Medium: 2, High: 3 };
const numberFrom = (value?: string) => {
  if (!value || !/[0-9]/.test(value)) return null;
  const parsed = Number(value.replace(/[^0-9.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : null;
};
const dayKey = (event: EconomicEvent) => event.date || event.at.slice(0, 10);
const addDays = (date: string, days: number) => {
  const next = new Date(`${date}T00:00:00Z`);
  next.setUTCDate(next.getUTCDate() + days);
  return next.toISOString().slice(0, 10);
};

const assetsFor = (event: EconomicEvent) => {
  if (event.acuity?.assetTickers?.length) return event.acuity.assetTickers;
  const pair = ['USD', 'EUR'].includes(event.currency) ? 'EUR/USD' : `${event.currency}/USD`;
  const related = event.relatedSignalTicker ? [event.relatedSignalTicker] : [];
  return Array.from(new Set([pair, event.currency, ...related]));
};

const snapshotFor = (event: EconomicEvent, nowMs: number): EconomicEventSnapshot => {
  const eventMs = Date.parse(event.at);
  const actual = numberFrom(event.actual);
  const forecast = numberFrom(event.forecast);
  const surpriseValue = actual !== null && forecast !== null ? Math.round((actual - forecast) * 100) / 100 : null;
  return {
    event,
    releaseState: event.allDay ? 'All day' : eventMs <= nowMs ? 'Released' : 'Upcoming',
    surprise: surpriseValue === null ? 'Pending' : surpriseValue > 0 ? 'Beat' : surpriseValue < 0 ? 'Miss' : 'In line',
    surpriseValue,
    affectedAssets: assetsFor(event),
    trueRange: event.impact === 'High' ? '0.8% – 1.4%' : event.impact === 'Medium' ? '0.3% – 0.7%' : '0.1% – 0.3%',
    potentialRange: event.impact === 'High' ? '1.5% – 2.4%' : event.impact === 'Medium' ? '0.7% – 1.2%' : '0.2% – 0.5%',
  };
};

export const createMockEconomicCalendarProvider = (events: EconomicEvent[]): EconomicCalendarProvider => ({
  name: 'MarketSyde Mock Calendar API',
  getEvents: () => events,
  getSnapshot: (event) => snapshotFor(event, Date.now()),
  getOverview: (from, to) => {
    const tiles: EconomicCalendarOverviewTile[] = [];
    for (let key = from; key <= to; key = addDays(key, 1)) {
      const rows = events.filter((event) => dayKey(event) === key);
      const maxImpact = rows.reduce<EventImpact | 'None'>((current, event) => {
        if (current === 'None' || impactRank[event.impact] > impactRank[current]) return event.impact;
        return current;
      }, 'None');
      tiles.push({ key, label: new Date(`${key}T00:00:00Z`).toLocaleDateString('en-US', { weekday: 'short' }), date: key, eventCount: rows.length, maxImpact, highImpactCount: rows.filter((event) => event.impact === 'High').length });
    }
    return tiles;
  },
  getNextImpactfulEvent: (nowMs) => {
    const next = events.filter((event) => !event.allDay && Date.parse(event.at) > nowMs && event.impact !== 'Low').sort((a, b) => Date.parse(a.at) - Date.parse(b.at))[0];
    return next ? snapshotFor(next, nowMs) : null;
  },
  exportCalendar: (rows) => [
    ['Date', 'Time', 'Currency', 'Event', 'Impact', 'Previous', 'Forecast', 'Actual'].join(','),
    ...rows.map((event) => [event.date || event.at.slice(0, 10), event.allDay ? 'All day' : event.at.slice(11, 16), event.currency, `"${event.title.replace(/"/g, '""')}"`, event.impact, event.previous || '', event.forecast || '', event.actual || ''].join(',')),
  ].join('\n'),
});

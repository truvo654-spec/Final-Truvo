import type { Broker } from '../../types';
import { PORTFOLIO_ACCOUNTS } from '../../data/portfolioData';
import { hashSeed, rng } from '../../backtest/rng';
import { validRange, type DateRange } from './journalDay';

export type BalanceBroker = Pick<Broker, 'id' | 'name' | 'connected'>;
export type BalanceDemoScope = 'connected' | 'sample';

export const SAMPLE_BALANCE_BROKERS: Pick<Broker, 'id' | 'name'>[] = [
  { id: 'hfm', name: 'HFM' },
  { id: 'exness', name: 'Exness' },
  { id: 'xm', name: 'XM' },
  { id: 'pepperstone', name: 'Pepperstone' },
];
export const BALANCE_DEMO_FROM = '2026-06-07';
export const BALANCE_DEMO_TO = '2026-10-31';

export interface AccountBalancePoint {
  date: string;
  balance: number;
  funding: number;
  net: number;
}

export interface DemoFundingMovement {
  id: string;
  date: string;
  kind: 'deposit' | 'withdrawal';
  amount: number;
}

const round = (value: number) => Math.round(value * 100) / 100;

/** Explicitly synthetic results and funding; never inferred from the user's journal or broker connection. */
export function generateDemoBrokerBalance(broker: Pick<Broker, 'id' | 'name'>) {
  const seed = hashSeed(`journal-balance:${broker.id}`);
  const random = rng(seed);
  const portfolio = PORTFOLIO_ACCOUNTS.find(account => account.kind === 'api' && account.id === `acc_${broker.id}`);
  const initialBalance = portfolio?.startBalance ?? 5000 + seed % 10000;
  const schedule: [string, 'deposit' | 'withdrawal', number][] = [
    ['2026-06-20', 'deposit', .10],
    ['2026-07-15', 'withdrawal', .04],
    ['2026-08-10', 'deposit', .12],
    ['2026-09-18', 'withdrawal', .07],
    ['2026-10-08', 'deposit', .08],
    ['2026-10-23', 'withdrawal', .10],
  ];
  const movements: DemoFundingMovement[] = schedule.map(([date, kind, fraction]) => ({
    id: `demo-${broker.id}-${date}`,
    date,
    kind,
    amount: round(initialBalance * fraction),
  }));
  const fundingByDay = new Map(movements.map(movement => [movement.date, movement.kind === 'deposit' ? movement.amount : -movement.amount]));
  const points: AccountBalancePoint[] = [];
  let balance = initialBalance;
  let funding = 0;
  const start = Date.parse(`${BALANCE_DEMO_FROM}T00:00:00Z`);
  const end = Date.parse(`${BALANCE_DEMO_TO}T00:00:00Z`);
  for (let time = start; time <= end; time += 86400000) {
    const date = new Date(time).toISOString().slice(0, 10);
    const net = time === start ? 0 : round(initialBalance * (.0008 + (random() - .5) * .008));
    const movement = fundingByDay.get(date) ?? 0;
    balance = round(balance + net + movement);
    funding = round(funding + movement);
    points.push({ date, balance, funding, net });
  }
  return { broker, initialBalance, movements, points };
}

export function demoAccountBalanceSeries(
  brokers: BalanceBroker[], selectedBroker: string, currency: string, range: DateRange | null, scope: BalanceDemoScope = 'connected',
) {
  if (range && !validRange(range)) throw new Error('Invalid account balance date range.');
  const available = scope === 'sample' ? SAMPLE_BALANCE_BROKERS : brokers.filter(broker => broker.connected);
  const distinct = [...new Map(available.map(broker => [broker.id, broker])).values()];
  const selected = selectedBroker === 'all' ? distinct : distinct.filter(broker => broker.id === selectedBroker);
  const accounts = selected.map(generateDemoBrokerBalance);
  const points: AccountBalancePoint[] = currency === 'USD' && accounts.length > 0
    ? accounts[0].points.map((point, index) => {
      const values = accounts.map(account => account.points[index]);
      return {
        date: point.date,
        balance: round(values.reduce((total, item) => total + item.balance, 0)),
        funding: round(values.reduce((total, item) => total + item.funding, 0)),
        net: round(values.reduce((total, item) => total + item.net, 0)),
      };
    }).filter(point => !range || (point.date >= range.from && point.date <= range.to)) : [];
  return {
    points,
    closingBalance: points.at(-1)?.balance ?? null,
    selectedBrokerCount: selected.length,
    demoAccountCount: accounts.length,
    accounts,
    movements: accounts.flatMap(account => account.movements.map(movement => ({ ...movement, broker: account.broker.name })))
      .filter(movement => !range || (movement.date >= range.from && movement.date <= range.to))
      .sort((a, b) => a.date.localeCompare(b.date) || a.broker.localeCompare(b.broker)),
    sourceFrom: BALANCE_DEMO_FROM,
    sourceTo: BALANCE_DEMO_TO,
    unsupportedCurrency: currency !== 'USD',
  };
}

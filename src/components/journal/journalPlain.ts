import { formatMoney } from './JournalCurrency';

export const pluralize = (count: number, singular: string, plural = `${singular}s`) => `${count} ${count === 1 ? singular : plural}`;
export const signedMoney = (value: number, currency = 'USD') => formatMoney(value, currency);
export function formatPlainPF(value: number | null, currency = 'USD') {
  if (value === null) return 'No gains or losses to compare yet';
  if (value === Infinity) return 'Gains recorded, with no losing trades yet';
  const money = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: amount === 1 ? 0 : 2 }).format(amount);
  return `${money(value)} won for every ${money(1)} lost`;
}
export const formatPlainPayoff = (value: number | null) => value === null
  ? 'An average loss is needed to compare'
  : `Your average win is ${value.toFixed(2)} times your average loss`;

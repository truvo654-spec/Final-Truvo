export const money = (v: number, d = 0) => `${v < 0 ? '-' : ''}$${Math.abs(v).toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d })}`;
export const signedMoney = (v: number, d = 0) => `${v > 0 ? '+' : v < 0 ? '-' : ''}$${Math.abs(v).toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d })}`;
export const pct = (v: number, d = 1) => `${v.toFixed(d)}%`;
export const signedPct = (v: number, d = 1) => `${v > 0 ? '+' : ''}${v.toFixed(d)}%`;
export const ratio = (v: number, d = 2) => (isFinite(v) ? v.toFixed(d) : '∞');
export const num = (v: number, d = 0) => v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d });
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const monthName = (m: number) => MONTHS[m];
export const dateShort = (t: number) => {
  const d = new Date(t);
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${String(d.getUTCFullYear()).slice(2)}`;
};
export const dateTime = (t: number) => {
  const d = new Date(t);
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${String(d.getUTCFullYear()).slice(2)} ${String(d.getUTCHours()).padStart(2, '0')}:00`;
};
export const axisDate = (t: number, spanDays: number) => {
  const d = new Date(t);
  return spanDays < 120 ? `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}` : `${MONTHS[d.getUTCMonth()]} ${String(d.getUTCFullYear()).slice(2)}`;
};
/** Bars to a rough duration in days. */
export const barsToDays = (bars: number, barsPerYear: number) => Math.round((bars / barsPerYear) * 365);

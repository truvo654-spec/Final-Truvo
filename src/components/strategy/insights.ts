import { BacktestResult, Metrics } from './engine/types';
import { barsToDays } from './format';

export interface Insight {
  tone: 'good' | 'warn' | 'info';
  title: string;
  text: string;
}

/** Plain-language reading of a backtest. Rules only, no prediction. */
export function buildInsights(r: BacktestResult, noCost: BacktestResult, split: { inSample: Metrics; outSample: Metrics }): Insight[] {
  const m = r.metrics;
  const out: Insight[] = [];
  const days = barsToDays(m.maxDrawdownBars, r.barsPerYear);

  if (r.blown) out.push({ tone: 'warn', title: 'The account was wiped out', text: 'Losses took the balance to zero, so the test stopped trading. Smaller size per trade or a tighter stop would change this.' });

  if (m.trades < 30) out.push({ tone: 'warn', title: `Only ${m.trades} trades`, text: 'That is a small sample. Results from so few trades can look good or bad by luck. A longer period or a faster candle size gives more trades to judge.' });
  else if (m.trades < 100) out.push({ tone: 'info', title: `${m.trades} trades`, text: 'A fair sample, though not a large one. Check the result on the other simulated histories before trusting it.' });
  else out.push({ tone: 'good', title: `${m.trades} trades`, text: 'A decent sample size, so the averages are less likely to be an accident.' });

  if (m.profitFactor < 1) out.push({ tone: 'warn', title: 'Losses outweighed wins', text: `Profit factor is ${isFinite(m.profitFactor) ? m.profitFactor.toFixed(2) : '∞'}. Every $1 lost was matched by only $${m.profitFactor.toFixed(2)} won.` });
  else if (m.profitFactor >= 1.5 && m.trades >= 30) out.push({ tone: 'good', title: 'Wins outweighed losses', text: `Profit factor ${isFinite(m.profitFactor) ? m.profitFactor.toFixed(2) : '∞'}. This is only a measure of the past on simulated prices, not a promise.` });

  if (m.winRate < 45 && m.payoff >= 1.8) out.push({ tone: 'info', title: 'Wins less than half the time', text: `${m.winRate.toFixed(0)}% winners, but the average win is ${m.payoff.toFixed(1)}× the average loss. That is a normal profile for trend following. It needs patience through losing runs.` });
  if (m.winRate >= 65 && m.payoff < 0.8 && m.trades >= 10) out.push({ tone: 'warn', title: 'Many small wins, fewer large losses', text: `${m.winRate.toFixed(0)}% winners, but the average loss is ${(1 / Math.max(m.payoff, 0.01)).toFixed(1)}× the average win. A few bad trades can erase a long run of wins.` });

  if (m.maxDrawdownPct >= 25) out.push({ tone: 'warn', title: `Deep drawdown: ${m.maxDrawdownPct.toFixed(0)}%`, text: `At the worst point the account was ${m.maxDrawdownPct.toFixed(0)}% below its peak, and it took about ${days} days from that peak to recover or end the test.` });
  else if (m.maxDrawdownPct > 0) out.push({ tone: m.maxDrawdownPct < 10 ? 'good' : 'info', title: `Largest drawdown ${m.maxDrawdownPct.toFixed(1)}%`, text: `The account fell ${m.maxDrawdownPct.toFixed(1)}% from a peak at worst, lasting about ${days} days.` });

  const gross = noCost.metrics.netProfit;
  const drag = gross - m.netProfit;
  if (gross > 0 && m.netProfit <= 0) out.push({ tone: 'warn', title: 'Profitable before costs, not after', text: `Without spread and commission the same rules made ${money(gross)}. Costs turned that into ${money(m.netProfit)}. Fast strategies are very sensitive to costs.` });
  else if (gross > 0 && drag / gross > 0.35) out.push({ tone: 'warn', title: 'Costs take a big bite', text: `Spread, slippage and commission removed about ${Math.round((drag / gross) * 100)}% of the profit the rules made before costs (${money(gross)} before, ${money(m.netProfit)} after).` });

  if (r.buyHoldPct > 0 || m.returnPct > 0) {
    const better = m.returnPct > r.buyHoldPct;
    out.push({ tone: 'info', title: better ? 'Beat simply holding' : 'Holding did better', text: `Buying at the start and holding returned ${r.buyHoldPct.toFixed(1)}% over this history. The strategy returned ${m.returnPct.toFixed(1)}%, with ${m.maxDrawdownPct.toFixed(0)}% worst drawdown.` });
  }

  if (split.outSample.trades >= 5 && split.inSample.trades >= 5) {
    if (split.inSample.returnPct > 0 && split.outSample.returnPct <= 0) out.push({ tone: 'warn', title: 'The later part lost money', text: `The first 70% of the history returned ${split.inSample.returnPct.toFixed(1)}% but the last 30% returned ${split.outSample.returnPct.toFixed(1)}%. The rules may be tuned to the early prices.` });
    else if (split.inSample.profitFactor > 1 && split.outSample.profitFactor > 1) out.push({ tone: 'good', title: 'Held up in the later part', text: `Profit factor was ${num(split.inSample.profitFactor)} in the first 70% and ${num(split.outSample.profitFactor)} in the last 30%.` });
  }

  if (m.maxConsecLosses >= 8) out.push({ tone: 'warn', title: `${m.maxConsecLosses} losses in a row at worst`, text: 'Ask yourself whether you would keep following the rules through a run like that.' });
  if (m.trades > 0 && m.exposurePct < 5) out.push({ tone: 'info', title: 'Rarely in the market', text: `Trades were open only ${m.exposurePct.toFixed(1)}% of the time.` });
  if (m.trades >= 10 && r.exitReasons.stop / m.trades > 0.6) out.push({ tone: 'info', title: 'Most trades end at the stop', text: `${Math.round((r.exitReasons.stop / m.trades) * 100)}% of trades were stopped out. A wider stop or a different entry might change that, at a different risk.` });
  if (m.longTrades >= 10 && m.shortTrades >= 10 && m.longNet * m.shortNet < 0) out.push({ tone: 'info', title: m.longNet > 0 ? 'Longs paid, shorts did not' : 'Shorts paid, longs did not', text: `Long trades ${money(m.longNet)}, short trades ${money(m.shortNet)}. Turning one side off may be worth testing.` });

  return out;
}

const money = (v: number) => `${v < 0 ? '-' : ''}$${Math.abs(Math.round(v)).toLocaleString()}`;
const num = (v: number) => (isFinite(v) ? v.toFixed(2) : '∞');

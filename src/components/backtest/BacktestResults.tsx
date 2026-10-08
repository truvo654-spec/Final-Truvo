// Results of an automated backtest: one sentence, four numbers, the curve, a verdict with
// clickable improvements, robustness checks, breakdowns and the trade log.
import React, { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, ChevronDown, Copy, Download, Mail, Pencil, Save, ShieldCheck, Sparkles, XCircle, CalendarPlus, NotebookPen, Target, GitCompare, Info } from 'lucide-react';
import type { JournalEntry } from '../../types';
import type { JournalPlaybook } from '../../data/journalPlaybooks';
import { BacktestSettings, JobOutput, Suggestion } from '../../backtest/types';
import { breakdown, computeMetrics } from '../../backtest/metrics';
import { robustness, verdictFor } from '../../backtest/robustness';
import { ruleCount, describeRules } from '../../backtest/rules';
import { MIN_TRADES, MAX_RULES } from '../../backtest/config';
import { dateOnly, money, num, pct, rr, tone, holdText } from '../../backtest/format';
import { healthOf, HEALTH_LABEL, liveStats } from '../../backtest/gap';
import type { PlaybookExpectedStats } from '../../backtest/store';
import { symbolSpec } from '../../backtest/marketData';
import { BarBreakdown, DrawdownChart, LineChart, ACCENT, UP, DOWN } from './charts';
import { Banner, Card, Hint, Kpi, Pill, Segmented, btnPrimary, btnSecondary } from './ui';
import { BacktestTradeLog } from './BacktestTradeLog';

interface Props {
  settings: BacktestSettings;
  output: JobOutput;
  name: string;
  saved: boolean;
  playbook: JournalPlaybook | null;
  entries: JournalEntry[];
  expected?: PlaybookExpectedStats;
  tz: string;
  onSave: () => void;
  onEdit: () => void;
  onApplySuggestion: (s: Suggestion) => void;
  onSetExpected: () => void;
  onSendNotes: (text: string, decision: 'keep' | 'adjust' | 'pause') => void;
  onAddToPlan: (text: string) => void;
  onToast: (m: string) => void;
}

const months = (a: number, b: number) => {
  const m = Math.round((b - a) / (30.44 * 86400000));
  return m >= 24 && m % 12 === 0 ? `${m / 12} years` : m >= 12 ? `${(m / 12).toFixed(1).replace(/\.0$/, '')} years` : `${Math.max(1, m)} month${m === 1 ? '' : 's'}`;
};

export const BacktestResults: React.FC<Props> = ({ settings: s, output, name, saved, playbook, entries, expected, tz, onSave, onEdit, onApplySuggestion, onSetExpected, onSendNotes, onAddToPlan, onToast }) => {
  const r = output.result;
  const cur = r.currency;
  const [unit, setUnit] = useState<'money' | 'r'>('money');
  const [by, setBy] = useState<'session' | 'weekday' | 'hour'>('session');
  const [allStats, setAllStats] = useState(false);
  const [more, setMore] = useState(false);
  const [showLive, setShowLive] = useState(false);

  const m = useMemo(() => computeMetrics(r.trades, r.startBalance, r.rangeStart, r.rangeEnd), [r]);
  const ddLimit = s.risk.maxDrawdownPct ?? s.prop?.maxDrawdownPct ?? 20;
  const rob = useMemo(() => robustness(r.trades, r.rangeStart, r.rangeEnd, r.startBalance, ddLimit), [r, ddLimit]);
  const rc = ruleCount(s);
  const v = useMemo(() => verdictFor(m, rob, rc), [m, rob, rc]);
  const buckets = useMemo(() => breakdown(r.trades, by, tz), [r, by, tz]);
  const live = useMemo(() => (playbook ? liveStats(entries, playbook.name) : null), [playbook, entries]);

  const equity = useMemo(() => {
    let cumR = 0;
    const pts = [{ x: r.rangeStart, y: unit === 'money' ? r.startBalance : 0 }];
    r.trades.forEach((t) => { cumR += t.r; pts.push({ x: t.exitTime, y: unit === 'money' ? t.balance : cumR }); });
    return pts;
  }, [r, unit]);
  const dd = useMemo(() => {
    let peak = r.startBalance;
    const pts = [{ x: r.rangeStart, dd: 0 }];
    r.trades.forEach((t) => { peak = Math.max(peak, t.balance); pts.push({ x: t.exitTime, dd: (peak - t.balance) / peak }); });
    return pts;
  }, [r]);

  const subject = playbook ? `your ${playbook.name} playbook` : 'these rules';
  const period = months(r.rangeStart, r.rangeEnd);
  const summary = m.trades
    ? `Over ${period} of ${s.symbol} ${s.timeframe} bars, ${subject} ${m.netPnl >= 0 ? 'made' : 'lost'} ${money(Math.abs(m.netPnl), cur, 0, false)} (${pct(m.netPct, 1, true)}) from ${m.trades} trades. It won ${pct(m.winRate, 0)} of them, averaged ${rr(m.avgR)} per trade, and its deepest drop from a high was ${pct(m.maxDDPct)}.`
    : '';
  const shareText = `${name}: ${summary} Verdict: ${v.label}.`;

  const exportCsv = () => {
    const head = ['id', 'entry_time_utc', 'exit_time_utc', 'direction', 'entry_price', 'order_type', 'exit_price', 'stop', 'target', 'size', 'gross', 'costs', 'net', 'r', 'mae_r', 'mfe_r', 'exit_reason', 'balance'];
    const lines = r.trades.map((t) => [t.id, new Date(t.entryTime).toISOString(), new Date(t.exitTime).toISOString(), t.direction, t.entryPrice, t.orderType, t.exitPrice, t.stopPrice, t.targetPrice ?? '', t.size, t.gross.toFixed(2), t.costs.toFixed(2), t.net.toFixed(2), t.r.toFixed(3), t.mae.toFixed(3), t.mfe.toFixed(3), t.exitReason, t.balance.toFixed(2)].join(','));
    try {
      const url = URL.createObjectURL(new Blob([[head.join(','), ...lines].join('\n')], { type: 'text/csv' }));
      const a = document.createElement('a'); a.href = url; a.download = `${name.replace(/[^\w-]+/g, '_')}.csv`; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      onToast('CSV downloaded');
    } catch { onToast('Your browser blocked the download'); }
  };
  const copy = async () => {
    try { await navigator.clipboard.writeText(shareText); onToast('Summary copied'); } catch { onToast('Copy blocked by the browser; select the summary text instead'); }
  };

  const hl = live && expected ? healthOf(live, expected) : null;

  const statRow: [string, string, React.ReactNode][] = [
    ['Profit factor', 'Gross profit ÷ gross loss. Above 1 means winners outweigh losers.', num(m.profitFactor)],
    ['Expectancy', 'Win rate × average win − loss rate × average loss: what an average trade earns.', <span className={tone(m.expectancy)}>{money(m.expectancy, cur)}</span>],
    ['Average win', 'Average net result of winning trades.', <span className="text-emerald-600">{money(m.avgWin, cur)}</span>],
    ['Average loss', 'Average net result of losing trades.', <span className="text-rose-600">{money(m.avgLoss, cur)}</span>],
    ['Max drawdown ($)', 'Largest fall from a balance high, in money.', <span className="text-rose-600">{money(-m.maxDD, cur)}</span>],
    ['Sharpe', 'Average daily return ÷ its variability × √252. Above 1 is good, above 2 is very good.', num(m.sharpe)],
    ['Sortino', 'Like Sharpe, but only counts downside swings.', num(m.sortino)],
    ['Calmar', 'Yearly return ÷ max drawdown %.', num(m.calmar)],
    ['Longest win streak', 'Most winning trades in a row.', `${m.longestWinStreak}`],
    ['Longest losing streak', 'Most losing trades in a row. Plan for at least this many.', `${m.longestLossStreak}`],
    ['Average hold', 'How long trades stayed open on average.', holdText(m.avgHoldMin)],
    ['Costs paid', 'Commission, spread and slippage across all trades.', money(-r.trades.reduce((a, t) => a + t.costs, 0), cur)],
  ];

  const toneCls = { good: 'border-emerald-200 bg-emerald-50', warn: 'border-amber-200 bg-amber-50', bad: 'border-rose-200 bg-rose-50', neutral: 'border-slate-200 bg-slate-50' }[v.tone];
  const toneTxt = { good: 'text-emerald-700', warn: 'text-amber-700', bad: 'text-rose-700', neutral: 'text-slate-700' }[v.tone];
  const ambiguous = r.trades.filter((t) => t.ambiguous).length;
  const spec = symbolSpec(s.symbol);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-xl font-bold text-[#0b1c30]">{name}</h2>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {playbook && <Pill tone="accent">Playbook: {playbook.name}</Pill>}
            <Pill>{s.symbol}{spec ? ` · ${spec.name}` : ''}</Pill>
            <Pill>{s.timeframe} bars</Pill>
            <Pill>{s.from} → {s.to}</Pill>
            <Pill title="Trades in this test">{m.trades} trades</Pill>
            {s.costs.enabled ? <Pill tone="good" title="Commission, spread and slippage are included">Costs included</Pill> : <Pill tone="warn" title="Results ignore costs and will look better than real trading">No costs</Pill>}
            {saved && <Pill tone="good"><CheckCircle2 className="w-3 h-3" /> Saved</Pill>}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={btnSecondary} onClick={onEdit}><Pencil className="w-3.5 h-3.5" /> Edit and re-run</button>
          {playbook && <button type="button" className={btnSecondary} aria-pressed={showLive} onClick={() => setShowLive((x) => !x)}><GitCompare className="w-3.5 h-3.5" /> Compare with my live trades</button>}
          <div className="relative">
            <button type="button" className={btnSecondary} aria-haspopup="true" aria-expanded={more} onClick={() => setMore((x) => !x)}>More <ChevronDown className="w-3.5 h-3.5" /></button>
            {more && (
              <div className="absolute right-0 z-30 mt-2 w-64 rounded-xl bg-white border border-slate-200 shadow-xl p-1.5" role="menu" onMouseLeave={() => setMore(false)}>
                {([
                  [<Copy className="w-3.5 h-3.5" />, 'Copy summary to share', copy, false],
                  [<Mail className="w-3.5 h-3.5" />, 'Email the summary', () => { window.location.href = `mailto:?subject=${encodeURIComponent(name)}&body=${encodeURIComponent(shareText)}`; }, false],
                  [<Download className="w-3.5 h-3.5" />, 'Export trades (CSV)', exportCsv, !r.trades.length],
                  [<Target className="w-3.5 h-3.5" />, "Save as playbook's expected stats", onSetExpected, !playbook || !m.trades],
                  [<NotebookPen className="w-3.5 h-3.5" />, 'Send notes to the playbook', () => onSendNotes(`${summary} Verdict: ${v.label}. ${v.reasons.join(' ')}`, v.tone === 'warn' ? 'adjust' : v.tone === 'bad' ? 'pause' : 'keep'), !playbook],
                  [<CalendarPlus className="w-3.5 h-3.5" />, "Add to tomorrow's plan", () => onAddToPlan(`Backtest (${name}): ${v.label}, ${rr(m.avgR)} per trade over ${m.trades} trades.`), !playbook],
                ] as [React.ReactNode, string, () => void, boolean][]).map(([icon, label, fn, dis]) => (
                  <button key={label} type="button" role="menuitem" disabled={dis} title={dis ? (playbook ? 'Needs trades' : 'Link a playbook in step 1 first') : undefined} onClick={() => { setMore(false); fn(); }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-xs font-semibold text-[#0b1c30] hover:bg-slate-50 disabled:text-slate-300 disabled:hover:bg-transparent">{icon}{label}</button>
                ))}
              </div>
            )}
          </div>
          <button type="button" className={btnPrimary} onClick={onSave} disabled={saved}><Save className="w-4 h-4" /> {saved ? 'Saved' : 'Save'}</button>
        </div>
      </div>

      {/* Warnings */}
      {r.zeroTradeReason && <Banner tone="bad" icon={<XCircle className="w-4 h-4" />} action={<button type="button" className={btnSecondary} onClick={onEdit}>Change the setup</button>}><b>No trades.</b> {r.zeroTradeReason}</Banner>}
      {m.trades > 0 && m.trades < MIN_TRADES && <Banner tone="warn" icon={<AlertTriangle className="w-4 h-4" />}><b>Small sample.</b> {m.trades} trades is fewer than {MIN_TRADES}, so these numbers could easily be luck. Try a longer date range or a lower timeframe.</Banner>}
      {rc > MAX_RULES && <Banner tone="warn" icon={<AlertTriangle className="w-4 h-4" />}><b>Many rules ({rc}).</b> With more than {MAX_RULES} rules and filters, a test can fit the past too closely. Results may not repeat.</Banner>}
      {r.stopReason && <Banner tone={r.propStatus === 'passed' ? 'good' : 'bad'} icon={r.propStatus === 'passed' ? <CheckCircle2 className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}><b>Test ended early.</b> {r.stopReason}</Banner>}
      {s.prop && !r.stopReason && <Banner tone="info" icon={<ShieldCheck className="w-4 h-4" />}><b>Prop challenge still in progress</b> at the end of the data: target not reached and no rule broken.</Banner>}
      {r.diagnostics.filtered.minSize > 0 && m.trades > 0 && <Banner tone="warn" icon={<AlertTriangle className="w-4 h-4" />} action={<button type="button" className={btnSecondary} onClick={onEdit}>Change risk</button>}><b>{r.diagnostics.filtered.minSize} signal{r.diagnostics.filtered.minSize === 1 ? ' was' : 's were'} skipped</b> because the position would have been smaller than 1 {spec?.sizeUnit.replace(/s$/, '') ?? 'unit'} at your risk per trade. Raise the risk or the starting balance to include them.</Banner>}
      {ambiguous > 0 && <Banner tone="info" icon={<Info className="w-4 h-4" />}>{ambiguous} trade{ambiguous === 1 ? '' : 's'} hit the stop and the target inside the same bar. Those were counted as stops, so results lean conservative.</Banner>}

      {m.trades > 0 && (
        <>
          <p className="text-[15px] leading-relaxed text-[#0b1c30] max-w-[70ch]">{summary}</p>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Kpi label="Net P&L" hint="Total profit or loss after costs." value={<span className={tone(m.netPnl)}>{money(m.netPnl, cur, 0)}</span>} sub={`${pct(m.netPct, 1, true)} on ${money(r.startBalance, cur, 0, false)}`} sample={m.trades} />
            <Kpi label="Win rate" hint="Winning trades ÷ all trades. Breakeven trades (within ±0.05R) count as not winning." value={pct(m.winRate, 1)} sub={`${m.wins} won · ${m.losses} lost${m.breakevens ? ` · ${m.breakevens} breakeven` : ''}`} sample={m.trades} />
            <Kpi label="Average R" hint="Average result per trade in units of risk. +0.30R means each trade earned 30% of what it risked, on average." value={<span className={tone(m.avgR)}>{rr(m.avgR)}</span>} sub={`Expectancy ${money(m.expectancy, cur)} per trade`} sample={m.trades} />
            <Kpi label="Max drawdown" hint="Largest fall from a balance high to a later low." value={<span className="text-rose-600">{pct(-m.maxDDPct)}</span>} sub={money(-m.maxDD, cur, 0)} sample={m.trades} />
          </div>
          <div>
            <button type="button" className="text-xs font-semibold text-[#5338ec] hover:underline" aria-expanded={allStats} onClick={() => setAllStats((x) => !x)}>{allStats ? 'Hide' : 'Show'} all stats</button>
            {allStats && (
              <dl className="mt-3 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {statRow.map(([k, hint, val]) => (
                  <div key={k} className="bg-white border border-[#e2e8f0] rounded-xl px-3 py-2.5">
                    <dt className="text-[10px] font-semibold text-slate-500"><Hint text={hint}>{k}</Hint></dt>
                    <dd className="text-sm font-bold tabular-nums text-[#0b1c30]">{val}</dd>
                    <p className="text-[10px] text-slate-400 tabular-nums">{m.trades} trades{['Sharpe', 'Sortino'].includes(k) ? ` · ${m.days} days` : ''}</p>
                  </div>
                ))}
              </dl>
            )}
          </div>

          {/* Equity + drawdown */}
          <Card title="Equity curve" sub={`Balance after each trade${s.prop ? ' with the prop-firm target and limit' : ''}. The red strip below shows drawdown.`}
            right={<Segmented size="sm" label="Units" value={unit} onChange={setUnit} options={[{ id: 'money', label: cur }, { id: 'r', label: 'R' }]} />}>
            <LineChart label="Equity curve" series={[{ name: unit === 'money' ? 'Balance' : 'Cumulative R', color: ACCENT, points: equity }]}
              yFmt={(y) => (unit === 'money' ? money(y, cur, 0, false) : rr(y, 1))} xFmt={(x) => dateOnly(x, tz)}
              hLines={unit === 'money' && s.prop ? [{ y: r.startBalance * (1 + s.prop.profitTargetPct / 100), label: `Target +${s.prop.profitTargetPct}%`, color: UP }, { y: r.startBalance * (1 - s.prop.maxDrawdownPct / 100), label: `Limit −${s.prop.maxDrawdownPct}%`, color: DOWN }] : []} />
            <DrawdownChart points={dd} xFmt={(x) => dateOnly(x, tz)} label="Drawdown from the balance high" />
          </Card>

          {/* Compare with live */}
          {showLive && playbook && live && (
            <Card title={`Backtest vs your live ${playbook.name} trades`} sub="Live numbers come from your journal entries tagged with this playbook.">
              <div className="overflow-x-auto">
                <table className="w-full text-xs tabular-nums">
                  <thead><tr className="text-[10px] uppercase tracking-wider text-slate-500 border-b border-slate-200"><th className="text-left py-2">Measure</th><th className="text-right py-2">This backtest</th><th className="text-right py-2">Your journal</th><th className="text-right py-2">Gap</th></tr></thead>
                  <tbody>
                    {([['Win rate', m.winRate, live.winRate, (x: number) => pct(x, 0), true], ['Average R', m.avgR, live.avgR, (x: number) => rr(x), true], ['Profit factor', m.profitFactor ?? 0, live.pf ?? 0, (x: number) => x.toFixed(2), true], ['Trades', m.trades, live.trades, (x: number) => `${x}`, null]] as [string, number, number, (x: number) => string, boolean | null][]).map(([k, a, b, f, higher]) => (
                      <tr key={k} className="border-b border-slate-100"><td className="py-2 font-semibold">{k}</td><td className="py-2 text-right">{f(a)}</td><td className="py-2 text-right">{f(b)}</td>
                        <td className={`py-2 text-right font-bold ${higher === null ? 'text-slate-400' : b >= a ? 'text-emerald-600' : 'text-rose-600'}`}>{higher === null ? '—' : `${b - a >= 0 ? '+' : '−'}${f(Math.abs(b - a)).replace(/^[+−]/, '')}`}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-[#474556] mt-3">{live.trades < 5 ? 'Too few live trades to compare yet.' : live.avgR >= m.avgR ? 'Your live trading is doing at least as well as the backtest.' : `Live trades average ${rr(live.avgR - m.avgR)} less than the backtest. Check the trades that broke the plan.`}{hl && hl.health !== 'untested' && <> Against the saved expected stats: <b>{HEALTH_LABEL[hl.health]}</b>.</>}</p>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Verdict */}
            <section className={`rounded-2xl border p-5 ${toneCls}`} aria-label="Verdict">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500"><Hint text="Calculated from this run's own checks (out-of-sample, walk-forward, Monte Carlo) and payoff.">Verdict</Hint></p>
                  <p className={`text-lg font-bold ${toneTxt}`}>{v.label}</p>
                </div>
                <div className="text-right" title="0–100. Built from profit factor, average R and the three robustness checks.">
                  <p className={`text-2xl font-bold tabular-nums ${toneTxt}`}>{v.score}</p>
                  <p className="text-[10px] text-slate-500">edge score</p>
                </div>
              </div>
              <ol className="mt-3 space-y-2">
                {v.reasons.map((x, i) => <li key={i} className="flex gap-2 text-xs text-[#0b1c30] leading-relaxed"><span className="font-bold text-slate-400">{i + 1}.</span>{x}</li>)}
              </ol>
              <div className="mt-4">
                <p className="text-[11px] font-bold text-[#0b1c30] mb-2 flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-[#5338ec]" /> Changes that tested better on the same data</p>
                {output.suggestions.length ? (
                  <div className="flex flex-wrap gap-2">
                    {output.suggestions.map((sg) => (
                      <button key={sg.id} type="button" title={`${sg.detail} Click to set up a new run with this change.`} onClick={() => onApplySuggestion(sg)}
                        className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-white border border-[#5338ec]/30 text-[#5338ec] text-xs font-semibold hover:bg-[#EEF0FE]">
                        {sg.label} <span className="text-emerald-700 tabular-nums">{rr(sg.deltaR)}/trade</span>
                      </button>
                    ))}
                  </div>
                ) : <p className="text-xs text-slate-500">None of the small changes we tried (target, stop, news days, session, direction, breakeven) beat the current rules.</p>}
              </div>
            </section>

            {/* Robustness */}
            <Card title="Robustness checks" sub="Would this hold up outside the data it was tested on?">
              <ul className="space-y-3">
                {([
                  ['Out-of-sample (70/30)', 'Splits the date range: the last 30% is treated as unseen data. A real edge should still work there.', rob.oos.pass, rob.oos.text],
                  ['Walk-forward (4 periods)', 'The same rules, checked period by period. A real edge should be profitable in most periods.', rob.wf.pass, rob.wf.text],
                  ['Monte Carlo (1,000 reshuffles)', 'Shuffles the order of the trades 1,000 times to see how deep drawdowns could get with the same trades.', rob.mc.pass, rob.mc.text],
                ] as [string, string, boolean, string][]).map(([k, hint, ok, text]) => (
                  <li key={k} className="flex gap-3">
                    {ok ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" aria-label="Passed" /> : <XCircle className="w-5 h-5 text-rose-600 shrink-0" aria-label="Did not pass" />}
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#0b1c30]"><Hint text={hint}>{k}</Hint> <span className={ok ? 'text-emerald-700' : 'text-rose-700'}>{ok ? 'Passed' : 'Did not pass'}</span></p>
                      <p className="text-xs text-[#474556] leading-relaxed">{text}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-3 grid grid-cols-4 gap-1.5" aria-label="Walk-forward periods">
                {rob.wf.periods.map((p, i) => (
                  <div key={i} className={`rounded-lg px-2 py-1.5 text-center ${p.m.netPnl > 0 ? 'bg-emerald-50' : 'bg-rose-50'}`} title={`${dateOnly(p.from, tz)} – ${dateOnly(p.to, tz)}: ${p.m.trades} trades`}>
                    <p className="text-[10px] text-slate-500">Period {i + 1}</p>
                    <p className={`text-xs font-bold tabular-nums ${tone(p.m.netPnl)}`}>{money(p.m.netPnl, cur, 0)}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <Card title="When it works" sub="Net result by entry time (your time zone for hours and weekdays; sessions in UTC). Hover a bar for the details."
            right={<Segmented size="sm" label="Group by" value={by} onChange={setBy} options={[{ id: 'session', label: 'Session' }, { id: 'weekday', label: 'Weekday' }, { id: 'hour', label: 'Hour' }]} />}>
            <BarBreakdown label={`Net result by ${by}`} buckets={buckets.map((b) => ({ label: by === 'session' ? b.label.replace('London / NY overlap', 'Overlap') : b.label, value: b.net, n: b.n }))} fmt={(x) => money(x, cur, 0)} />
          </Card>

          <details className="bg-white border border-[#e2e8f0] rounded-2xl p-5 group">
            <summary className="text-sm font-bold text-[#0b1c30] cursor-pointer">Rules used in this test</summary>
            <ul className="mt-3 space-y-1.5">{describeRules(s.rules, spec?.costUnit.label).map((x) => <li key={x.label} className="text-sm"><b className="text-[11px] uppercase tracking-wider text-slate-500 mr-2">{x.label}</b>{x.text}</li>)}</ul>
          </details>
        </>
      )}

      <BacktestTradeLog trades={r.trades} currency={cur} symbol={s.symbol} timeframe={s.timeframe} tz={tz} />
    </div>
  );
};

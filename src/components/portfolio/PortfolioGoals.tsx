import React, { useMemo, useState } from 'react';
import { Target, Trash2, Plus, ShieldAlert, AlertTriangle, CheckCircle2, Trophy } from 'lucide-react';
import { PortfolioCtx } from './portfolioContext';
import { Card, CardTitle, Locked, PLAN_RANK, money } from './portfolioUi';
import { currentDrawdown, goalProgress, maxDrawdown, closedMs, isClosed, achievements, drawdownSeries } from './portfolioMath';
import { EquityChart, DrawdownChart } from './PortfolioCharts';
import { PORTFOLIO_NOW, DAY } from '../../data/portfolioData';

const Ring: React.FC<{ value: number; tone: 'good' | 'warn' | 'bad'; label: string }> = ({ value, tone, label }) => {
  const size = 92;
  const r = 38;
  const c = 2 * Math.PI * r;
  const color = tone === 'good' ? '#10b981' : tone === 'warn' ? '#f59e0b' : '#f43f5e';
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f1f5f9" strokeWidth="9" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="9" strokeLinecap="round" strokeDasharray={`${c * Math.min(1, Math.max(0.02, value))} ${c}`} />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-sm font-bold font-mono text-[#0b1c30]">{label}</span>
    </div>
  );
};

export const PortfolioGoals: React.FC<{ ctx: PortfolioCtx }> = ({ ctx }) => {
  const rank = PLAN_RANK[ctx.plan];
  const [type, setType] = useState<'growth' | 'drawdown'>('growth');
  const [target, setTarget] = useState('');
  const [deadline, setDeadline] = useState('2026-12-31');
  const [alertAt, setAlertAt] = useState(75);
  const [dailyLoss, setDailyLoss] = useState(400);

  const ddGoal = ctx.goals.find((g) => g.type === 'drawdown');
  const limit = ddGoal?.target ?? 8;
  const curDd = currentDrawdown(ctx.fullSeries);
  const maxDd = maxDrawdown(ctx.fullSeries);

  const growthGoal = ctx.goals.find((g) => g.type === 'growth');
  const ddSeries = useMemo(() => drawdownSeries(ctx.fullSeries), [ctx.fullSeries]);
  const wins = useMemo(() => achievements(ctx.fullSeries, ctx.trades), [ctx.fullSeries, ctx.trades]);

  const todayPnl = useMemo(
    () =>
      ctx.trades
        .filter((t) => isClosed(t) && closedMs(t) >= PORTFOLIO_NOW - DAY)
        .reduce((a, t) => a + t.pnl, 0),
    [ctx.trades]
  );

  const warnings: { id: string; text: string; bad: boolean }[] = [];
  if (curDd >= limit * (alertAt / 100)) warnings.push({ id: 'dd', bad: curDd >= limit, text: `Drawdown is ${curDd.toFixed(1)}%. You asked to be warned at ${(limit * (alertAt / 100)).toFixed(1)}% of your ${limit}% limit.` });
  if (todayPnl <= -dailyLoss) warnings.push({ id: 'daily', bad: true, text: `Today's realized loss is ${money(todayPnl, 0)}, past your ${money(dailyLoss, 0)} daily limit.` });

  const addGoal = () => {
    const n = Number(target);
    if (!n || n <= 0) {
      ctx.toast('Enter a target above zero');
      return;
    }
    const now = ctx.fullSeries[ctx.fullSeries.length - 1];
    ctx.setGoals((prev) => [
      ...prev,
      type === 'growth'
        ? { id: `goal_${Date.now()}`, type, label: `Grow the account to ${money(n, 0)}`, target: n, deadline, startBalance: now.value, startDate: now.date }
        : { id: `goal_${Date.now()}`, type, label: `Keep max drawdown under ${n}%`, target: n },
    ]);
    setTarget('');
    ctx.toast('Goal added');
  };

  const field = 'w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5338ec]/30';

  return (
    <Locked locked={rank < 1} label="Unlock goals on Intermediate" onUpgrade={ctx.upgrade} className="min-h-[360px]" top>
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_380px] gap-6 items-start">
        <div className="space-y-5">
          {warnings.length > 0 ? (
            warnings.map((w) => (
              <div key={w.id} className={`flex items-start gap-3 rounded-2xl px-5 py-4 border ${w.bad ? 'bg-rose-50 border-rose-200' : 'bg-amber-50 border-amber-200'}`}>
                <AlertTriangle className={`w-5 h-5 shrink-0 mt-0.5 ${w.bad ? 'text-rose-500' : 'text-amber-500'}`} />
                <p className="text-sm text-[#0b1c30] leading-relaxed">{w.text}</p>
              </div>
            ))
          ) : (
            <div className="flex items-center gap-3 rounded-2xl px-5 py-4 border bg-emerald-50 border-emerald-200">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <p className="text-sm text-[#0b1c30]">You are inside every limit you set. Drawdown {curDd.toFixed(1)}% of {limit}% allowed.</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {ctx.goals.map((g) => {
              const p = goalProgress(g, ctx.fullSeries);
              return (
                <Card key={g.id} className="p-5">
                  <div className="flex items-center gap-4">
                    <Ring value={p.progress} tone={p.tone} label={`${Math.round(p.progress * 100)}%`} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-bold text-[#0b1c30] leading-snug">{g.label}</p>
                        <button onClick={() => { ctx.setGoals((prev) => prev.filter((x) => x.id !== g.id)); ctx.toast('Goal removed'); }} aria-label="Remove goal" className="text-slate-300 hover:text-rose-500 shrink-0"><Trash2 className="w-4 h-4" /></button>
                      </div>
                      <span className={`inline-block mt-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold ${p.tone === 'good' ? 'bg-emerald-50 text-emerald-600' : p.tone === 'warn' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-600'}`}>{p.status}</span>
                      <p className="text-xs text-[#474556] mt-1.5">{p.detail}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
            {ctx.goals.length === 0 && <Card className="p-8 md:col-span-2 text-center text-sm text-[#474556]">No goals yet. Add one on the right.</Card>}
          </div>

          <Card className="p-5">
            <CardTitle
              title="Progress over time"
              hint={growthGoal ? 'Equity against your growth target' : 'Equity history'}
            />
            <EquityChart
              data={ctx.fullSeries}
              theme="light"
              height={240}
              targetLine={growthGoal ? { value: growthGoal.target, label: `Target ${money(growthGoal.target, 0)}` } : undefined}
            />
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Card className="p-5">
              <CardTitle title="Drawdown against your limit" hint="Lower is better" />
              <DrawdownChart data={ddSeries} limit={limit} height={150} />
            </Card>
            <Card className="p-5">
              <CardTitle title="Achievements" icon={<Trophy className="w-4 h-4 text-amber-500" />} hint="Milestones from your own history" />
              <div className="space-y-3">
                {wins.map((a) => (
                  <div key={a.id} className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#0b1c30]">{a.title}</p>
                      <p className="text-[11px] text-[#94a3b8]">{a.detail}</p>
                    </div>
                    {a.date && <span className="text-[11px] font-mono text-[#474556] shrink-0">{a.date.slice(5)}</span>}
                  </div>
                ))}
                {wins.length === 0 && <p className="text-xs text-[#474556]">Your first milestone will show up here.</p>}
              </div>
            </Card>
          </div>
        </div>

        <aside className="space-y-5">
          <Card className="p-5">
            <CardTitle title="Add a goal" icon={<Target className="w-4 h-4 text-[#5338ec]" />} />
            <div className="space-y-3">
              <div className="flex rounded-xl border border-slate-200 overflow-hidden text-xs font-bold">
                <button onClick={() => setType('growth')} className={`flex-1 py-2 ${type === 'growth' ? 'bg-[#5338ec] text-white' : 'bg-white text-slate-500'}`}>Capital growth</button>
                <button onClick={() => setType('drawdown')} className={`flex-1 py-2 ${type === 'drawdown' ? 'bg-[#5338ec] text-white' : 'bg-white text-slate-500'}`}>Drawdown limit</button>
              </div>
              <div>
                <label className="text-xs font-semibold text-[#474556] mb-1 block">{type === 'growth' ? 'Target balance ($)' : 'Maximum drawdown (%)'}</label>
                <input type="number" value={target} onChange={(e) => setTarget(e.target.value)} placeholder={type === 'growth' ? '25000' : '6'} className={field} />
              </div>
              {type === 'growth' && (
                <div>
                  <label className="text-xs font-semibold text-[#474556] mb-1 block">Deadline</label>
                  <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className={field} />
                </div>
              )}
              <button onClick={addGoal} className="w-full flex items-center justify-center gap-1.5 bg-[#5338ec] hover:bg-[#4326d8] text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"><Plus className="w-4 h-4" /> Add goal</button>
            </div>
          </Card>

          <Card className="p-5">
            <CardTitle title="Risk guardrails" icon={<ShieldAlert className="w-4 h-4 text-[#5338ec]" />} hint="Portfolio-level alerts before you hit a limit" />
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1.5"><span className="font-semibold">Warn me at</span><span className="font-mono font-bold">{alertAt}% of my drawdown limit</span></div>
                <input type="range" min={50} max={95} step={5} value={alertAt} onChange={(e) => setAlertAt(Number(e.target.value))} className="w-full accent-[#5338ec]" />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#474556] mb-1 block">Daily loss limit ($)</label>
                <input type="number" value={dailyLoss} min={0} onChange={(e) => setDailyLoss(Number(e.target.value))} className={field} />
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-50 rounded-xl p-3"><p className="text-[#474556]">Current drawdown</p><p className="font-bold font-mono text-base">{curDd.toFixed(1)}%</p></div>
                <div className="bg-slate-50 rounded-xl p-3"><p className="text-[#474556]">Worst drawdown</p><p className="font-bold font-mono text-base">{maxDd.toFixed(1)}%</p></div>
              </div>
              <p className="text-[11px] text-[#94a3b8] leading-relaxed">Warnings appear here and in Smart notifications. They do not close positions for you.</p>
            </div>
          </Card>
        </aside>
      </div>
    </Locked>
  );
};

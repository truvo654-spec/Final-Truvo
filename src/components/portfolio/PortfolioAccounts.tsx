import React, { useState } from 'react';
import { Link2, PenLine, RefreshCw, Plus, Lock, CheckCircle2, PauseCircle, Check, Minus } from 'lucide-react';
import { PortfolioCtx } from './portfolioContext';
import { Card, CardTitle, PLAN_RANK, PLAN_LABEL, PlanId, money, signedMoney } from './portfolioUi';
import { ACCOUNT_SERIES } from '../../data/portfolioData';

const API_LIMIT: Record<PlanId, number> = { basic: 1, intermediate: 2, premium: 99 };
const SYNC: Record<PlanId, string> = { basic: 'Daily', intermediate: 'Hourly', premium: 'Real-time' };

const MATRIX: { label: string; basic: string | boolean; intermediate: string | boolean; premium: string | boolean }[] = [
  { label: 'Broker API connections', basic: '1', intermediate: '2', premium: 'Unlimited' },
  { label: 'Balance & trade sync', basic: 'Daily', intermediate: 'Hourly', premium: 'Real-time' },
  { label: 'Trade history', basic: '14 days', intermediate: '90 days', premium: 'Unlimited' },
  { label: 'Manual trade entry', basic: true, intermediate: true, premium: true },
  { label: 'Smart filters & analytics', basic: false, intermediate: true, premium: true },
  { label: 'Goals, CSV import & export', basic: false, intermediate: true, premium: true },
  { label: 'Live margin tracking', basic: false, intermediate: false, premium: true },
  { label: 'Custom layout & drill-down', basic: false, intermediate: false, premium: true },
  { label: 'Smart notifications & sharing', basic: false, intermediate: false, premium: true },
];

const Cell: React.FC<{ v: string | boolean }> = ({ v }) =>
  typeof v === 'boolean' ? (v ? <Check className="w-4 h-4 text-emerald-500 mx-auto" /> : <Minus className="w-4 h-4 text-slate-300 mx-auto" />) : <span className="font-semibold">{v}</span>;

export const PortfolioAccounts: React.FC<{ ctx: PortfolioCtx }> = ({ ctx }) => {
  const rank = PLAN_RANK[ctx.plan];
  const limit = API_LIMIT[ctx.plan];
  const [synced, setSynced] = useState<Record<string, string>>({});
  const [syncing, setSyncing] = useState<string | null>(null);

  const apiAccounts = ctx.accounts.filter((a) => a.kind === 'api');
  const activeApi = apiAccounts.slice(0, limit);

  const sync = (id: string) => {
    setSyncing(id);
    window.setTimeout(() => {
      setSyncing(null);
      setSynced((p) => ({ ...p, [id]: 'Just now' }));
      ctx.toast('Account synced');
    }, 900);
  };

  const connect = () => {
    if (activeApi.length >= limit) {
      ctx.toast(`${PLAN_LABEL[ctx.plan]} includes ${limit} broker connection${limit > 1 ? 's' : ''}.`);
      ctx.upgrade();
      return;
    }
    ctx.openConnect();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-[#0b1c30]">Connected accounts</h3>
          <p className="text-xs text-[#474556] mt-0.5">
            {activeApi.length} of {limit > 50 ? 'unlimited' : limit} broker connection{limit > 1 ? 's' : ''} in use · {SYNC[ctx.plan]} sync
          </p>
        </div>
        <button onClick={connect} className="flex items-center gap-1.5 bg-[#5338ec] hover:bg-[#4326d8] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
          <Plus className="w-4 h-4" /> Connect a broker
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {ctx.accounts.map((a) => {
          const series = ACCOUNT_SERIES[a.id];
          const bal = series[series.length - 1].value;
          const prev = series[Math.max(0, series.length - 31)].value;
          const paused = a.kind === 'api' && !activeApi.includes(a);
          const count = ctx.allTrades.filter((t) => t.broker === a.name).length;
          return (
            <Card key={a.id} className={`p-5 ${paused ? 'opacity-70' : ''}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-[#EEF0FE] flex items-center justify-center text-[#5338ec]">
                    {a.kind === 'api' ? <Link2 className="w-5 h-5" /> : <PenLine className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="text-base font-bold text-[#0b1c30]">{a.name}</p>
                    <p className="text-[11px] text-[#94a3b8]">{a.kind === 'api' ? a.server : 'Trades you log yourself'}</p>
                  </div>
                </div>
                {paused ? (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-slate-500"><PauseCircle className="w-3.5 h-3.5" /> Paused</span>
                ) : (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600"><CheckCircle2 className="w-3.5 h-3.5" /> {a.kind === 'api' ? 'Synced' : 'Active'}</span>
                )}
              </div>

              <p className="text-2xl font-bold font-mono text-[#0b1c30]">{money(bal)}</p>
              <p className={`text-xs font-semibold font-mono mb-4 ${bal - prev >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{signedMoney(bal - prev, 0)} <span className="text-[#94a3b8] font-medium">last 30 days</span></p>

              <div className="grid grid-cols-3 gap-2 text-center mb-4">
                <div className="bg-slate-50 rounded-xl py-2"><p className="text-[10px] text-[#474556]">Trades</p><p className="text-sm font-bold font-mono">{count}</p></div>
                <div className="bg-slate-50 rounded-xl py-2"><p className="text-[10px] text-[#474556]">Margin used</p><p className="text-sm font-bold font-mono">{money(a.marginUsed, 0)}</p></div>
                <div className="bg-slate-50 rounded-xl py-2"><p className="text-[10px] text-[#474556]">Free margin</p><p className="text-sm font-bold font-mono">{money(bal - a.marginUsed, 0)}</p></div>
              </div>

              {paused ? (
                <button onClick={ctx.upgrade} className="w-full flex items-center justify-center gap-1.5 text-xs font-bold text-[#5338ec] border border-[#5338ec]/30 hover:border-[#5338ec] rounded-xl py-2.5 transition-colors">
                  <Lock className="w-3.5 h-3.5" /> Upgrade to keep this account in sync
                </button>
              ) : a.kind === 'api' ? (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#94a3b8]">Last sync {synced[a.id] || a.lastSync}</span>
                  <button onClick={() => sync(a.id)} className="flex items-center gap-1.5 font-bold text-[#5338ec] hover:text-[#4326d8]">
                    <RefreshCw className={`w-3.5 h-3.5 ${syncing === a.id ? 'animate-spin' : ''}`} /> Sync now
                  </button>
                </div>
              ) : (
                <button onClick={() => ctx.setTab('trades')} className="w-full text-xs font-bold text-[#5338ec] border border-[#5338ec]/30 hover:border-[#5338ec] rounded-xl py-2.5 transition-colors">Log a trade</button>
              )}
            </Card>
          );
        })}
      </div>

      <Card className="p-5 overflow-x-auto">
        <CardTitle title="What each plan includes" hint="Your current plan is highlighted" />
        <table className="w-full text-sm min-w-[520px]">
          <thead>
            <tr className="text-xs text-[#94a3b8] uppercase tracking-wide">
              <th className="text-left font-bold pb-3">Feature</th>
              {(['basic', 'intermediate', 'premium'] as PlanId[]).map((p) => (
                <th key={p} className={`pb-3 font-bold px-3 ${ctx.plan === p ? 'text-[#5338ec]' : ''}`}>{PLAN_LABEL[p]}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MATRIX.map((r) => (
              <tr key={r.label} className="border-t border-[#f1f5f9]">
                <td className="py-3 font-medium text-[#0b1c30]">{r.label}</td>
                {(['basic', 'intermediate', 'premium'] as PlanId[]).map((p) => (
                  <td key={p} className={`py-3 px-3 text-center text-xs ${ctx.plan === p ? 'bg-[#F8F7FF]' : ''}`}><Cell v={r[p]} /></td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {rank < 2 && (
          <button onClick={ctx.upgrade} className="mt-4 text-xs font-bold text-[#5338ec] hover:underline">Compare membership plans →</button>
        )}
      </Card>
    </div>
  );
};

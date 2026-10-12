import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import type { RecommendationGoal, RecommendationMetrics, SetupRecommendation } from '../../backtest/recommender';
import { btnPrimary, inputBase, Pill } from './ui';

export const RecommendationBadge: React.FC<{ exploratory?: boolean }> = ({ exploratory }) => <span className="inline-flex items-center gap-1 rounded-full bg-[#5338ec] text-white px-2 py-0.5 text-[10px] font-bold"><Sparkles size={11} aria-hidden />{exploratory ? 'AI exploration' : 'AI candidate'}</span>;

export const MarketSydeRecommender: React.FC<{
  recommendation: SetupRecommendation; baseline: RecommendationMetrics; baselineName: string;
  goal: RecommendationGoal; onGoal: (goal: RecommendationGoal) => void;
  money: (value: number) => string; evidence: string; onUse?: (id: string) => void; action?: string;
}> = ({ recommendation: r, baseline, baselineName, goal, onGoal, money, evidence, onUse, action = 'Try this setup' }) => {
  const candidate = r.candidate;
  const delta = candidate ? candidate.metrics.netPnl - baseline.netPnl : 0;
  const holdout = candidate?.validation;
  const holdoutDelta = holdout ? holdout.candidate.netPnl - holdout.baseline.netPnl : null;
  return <section aria-label="MarketSyde AI recommender" className="rounded-2xl border border-[#5338ec]/30 bg-gradient-to-br from-[#F1EDFF] via-white to-[#F4FAFF] p-5 shadow-sm">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div><p className="flex items-center gap-2 text-sm font-bold text-[#5338ec]"><Sparkles size={17} aria-hidden />MarketSyde AI <Pill tone="accent">Beta</Pill></p><h3 className="text-lg font-bold text-[#0b1c30] mt-2">Find a setup worth testing</h3><p className="text-xs text-slate-600 mt-1">Your benchmark. Your goal. A measured next step.</p></div>
      <label className="text-[11px] font-semibold text-slate-600">Recommendation goal<select aria-label="Recommendation goal" className={`${inputBase} block mt-1`} value={goal} onChange={e => onGoal(e.target.value as RecommendationGoal)}><option value="net">Improve net result</option><option value="drawdown">Reduce drawdown</option><option value="win">Improve win rate</option></select></label>
    </div>
    <div className="mt-4 rounded-xl border border-white bg-white/80 p-4">
      {candidate ? <><div className="flex flex-wrap items-center gap-2"><RecommendationBadge exploratory={r.status === 'exploratory'} /><p className="font-bold text-[#0b1c30]">{candidate.name}</p>{candidate.estimated && <Pill tone="warn">Estimated price path</Pill>}</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 text-xs tabular-nums">
          <div><p className="text-slate-500">Selection net Δ</p><p className={`text-lg font-bold ${delta >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>{money(delta)}</p></div>
          <div><p className="text-slate-500">Drawdown Δ</p><p className="font-bold mt-1">{money(candidate.metrics.maxDD - baseline.maxDD)}</p></div>
          <div><p className="text-slate-500">Win rate Δ</p><p className="font-bold mt-1">{((candidate.metrics.winRate-baseline.winRate)*100).toFixed(1)} pts</p></div>
          <div><p className="text-slate-500">Selection trades</p><p className="font-bold mt-1">{candidate.metrics.trades} / {baseline.trades}</p></div>
        </div>
        {holdout && <p className={`text-xs mt-3 ${holdoutDelta! > 0 ? 'text-emerald-700' : 'text-amber-700'}`}>Holdout net Δ: <b>{money(holdoutDelta!)}</b> · {holdout.candidate.trades} trades · {holdoutDelta! > 0 ? 'Positive on this holdout' : 'Improvement not confirmed on this holdout'}{holdout.candidate.trades < 5 ? ' · small holdout sample' : ''}</p>}
        {onUse && <button type="button" className={`${btnPrimary} mt-3`} onClick={() => onUse(candidate.id)}>{action}<ArrowRight size={14} aria-hidden /></button>}
      </> : <p className="font-bold text-[#0b1c30]">{r.status === 'keep' ? 'Your benchmark remains the reference' : r.status === 'incomparable' ? 'Align the tests first' : 'Build your evidence with more trades'}</p>}
      <p className="text-xs text-slate-600 mt-3">{r.reason}</p>
      {r.status === 'exploratory' && <p className="text-xs text-amber-700 mt-2">Exploratory sample: fewer than ten selection trades. This candidate is a hypothesis, not a demonstrated edge.</p>}
    </div>
    <p className="text-[11px] text-slate-500 mt-3">Compared with {baselineName}. {evidence}</p>
    <details className="text-[11px] text-slate-500 mt-2"><summary className="cursor-pointer text-[#5338ec] font-semibold">How MarketSyde chooses</summary><p className="mt-2">Local statistical recommender; no trained predictive model or external AI service is used. Candidates are ranked by the selected goal with trade-count and risk guardrails. Net-result selection allows extra drawdown up to the larger of 25% of benchmark drawdown, 5% of absolute benchmark net, or one account-currency unit. Holdout results never change selection. Badges describe these tests, not future returns or superiority to other platforms.</p></details>
  </section>;
};

import { JournalHelp } from '../journal/JournalHelp';
import React, { useId, useState } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import type { RecommendationGoal, RecommendationMetrics, SetupRecommendation } from '../../backtest/recommender';
import type { WhatIfIdea } from '../../backtest/whatifStudy';
import { btnPrimary, inputBase, Pill, SectionToggle } from './ui';

export const RecommendationBadge: React.FC<{ exploratory?: boolean }> = ({ exploratory }) => <span className="inline-flex items-center gap-1 rounded-full bg-[#5338ec] text-white px-2 py-0.5 text-[10px] font-bold"><Sparkles size={11} aria-hidden />{exploratory ? 'AI exploration' : 'AI candidate'}</span>;

export const MarketSydeRecommender: React.FC<{
  recommendation: SetupRecommendation; baseline: RecommendationMetrics; baselineName: string;
  goal: RecommendationGoal; onGoal: (goal: RecommendationGoal) => void;
  money: (value: number) => string; evidence: string; onUse?: (id: string) => void; action?: string; collapsible?: boolean; estimateLabel?: string; ideas?: WhatIfIdea[]; selectedId?: string | null;
}> = ({ recommendation: r, baseline, baselineName, goal, onGoal, money, evidence, onUse, action = 'Try this setup', collapsible = false, estimateLabel='Estimated price path', ideas, selectedId }) => {
  const [open, setOpen] = useState(true);
  const bodyId = useId();
  const candidate = r.candidate;
  const delta = candidate ? candidate.metrics.netPnl - baseline.netPnl : 0;
  const holdout = candidate?.validation;
  const holdoutDelta = holdout ? holdout.candidate.netPnl - holdout.baseline.netPnl : null;
  if (ideas) {
    const significant = ideas.filter(i => i.improving).sort((a, b) => (b.id === candidate?.id ? 1 : 0) - (a.id === candidate?.id ? 1 : 0) || (b.metrics.netPnl - b.baseline.netPnl) - (a.metrics.netPnl - a.baseline.netPnl));
    return <section aria-label="MarketSyde AI recommender" className="rounded-2xl border border-[#5338ec]/30 bg-gradient-to-br from-[#F1EDFF] via-white to-[#F4FAFF] p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-sm font-bold text-[#5338ec]"><Sparkles size={16} aria-hidden />MarketSyde AI suggestions</h3>
        <select aria-label="Recommendation goal" className={`${inputBase} !h-8 text-xs`} value={goal} onChange={e => onGoal(e.target.value as RecommendationGoal)}><option value="net">Goal: more profit</option><option value="drawdown">Goal: less drawdown</option><option value="win">Goal: higher win rate</option></select>
      </div>
      {significant.length ? <>
        <p className="mt-1 text-xs text-slate-600">Pick one to see it on the chart.</p>
        <div className="mt-3 space-y-2" role="list">{significant.map(idea => {
          const d = idea.metrics.netPnl - idea.baseline.netPnl, active = selectedId === idea.id;
          return <button key={idea.id} type="button" role="listitem" aria-pressed={active} onClick={() => onUse?.(idea.id)} className={`flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-left transition ${active ? 'border-[#5338ec] bg-white shadow-sm' : 'border-white bg-white/70 hover:border-[#5338ec]/50'}`}>
            <span className="min-w-0"><span className="block text-[10px] font-bold uppercase tracking-wide text-slate-500">{idea.label}{idea.id === candidate?.id && <span className="ml-2 rounded-full bg-[#5338ec] px-1.5 py-0.5 text-[9px] text-white normal-case tracking-normal">Top pick</span>}</span><span className="block truncate text-sm font-semibold text-[#0b1c30]">{idea.name.replace(/ · demo prices$/, '')}</span></span>
            <span className="shrink-0 text-right"><span className={`block text-sm font-bold tabular-nums ${d >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>{d >= 0 ? '+' : ''}{money(d).replace(/^\+/, '')}</span><span className="block text-[10px] text-slate-500">{goal === 'drawdown' ? `drawdown ${money(idea.metrics.maxDD - idea.baseline.maxDD)}` : goal === 'win' ? `win rate ${((idea.metrics.winRate - idea.baseline.winRate) * 100).toFixed(0)} pts` : 'net vs now'}</span></span>
          </button>;
        })}</div>
      </> : <p className="mt-3 rounded-xl bg-white/70 px-3 py-3 text-sm text-slate-600">No change beats your current setup on these trades yet.{baseline.trades < 10 ? ' Add more trades for stronger suggestions.' : ''}</p>}
      <details className="mt-3 text-[11px] text-slate-500"><summary className="cursor-pointer font-semibold text-[#5338ec]">How suggestions are picked</summary><p className="mt-2">MarketSyde tests take-profit, breakeven and stop sizes in R, technical filters, session timing, daily guardrails and mistake tags on the same trades, and keeps the best of each tool that beats {baselineName}. {evidence} Results on {baseline.trades} trade{baseline.trades === 1 ? '' : 's'}; these are ideas to test, not predictions.</p></details>
    </section>;
  }
  return <section aria-label="MarketSyde AI recommender" className="rounded-2xl border border-[#5338ec]/30 bg-gradient-to-br from-[#F1EDFF] via-white to-[#F4FAFF] p-5 shadow-sm">
    {collapsible && <div className="flex items-start justify-between gap-3"><div className="min-w-0"><h3 className="flex flex-wrap items-center gap-2 text-sm font-bold text-[#5338ec]"><Sparkles size={17} aria-hidden />MarketSyde AI <Pill tone="accent">Beta</Pill></h3>{!open && <p className="mt-1 text-[11px] text-slate-500">{candidate ? candidate.name : r.status === 'keep' ? 'Your benchmark remains the reference' : r.status === 'incomparable' ? 'Align the tests first' : 'More trades needed to explore a setup'}</p>}</div><SectionToggle title="MarketSyde AI" open={open} controls={bodyId} onToggle={() => setOpen(v => !v)} /></div>}
    <div id={bodyId} hidden={collapsible && !open}>
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>{!collapsible && <p className="flex items-center gap-2 text-sm font-bold text-[#5338ec]"><Sparkles size={17} aria-hidden />MarketSyde AI <Pill tone="accent">Beta</Pill></p>}<h3 className="text-lg font-bold text-[#0b1c30] mt-2">Find a setup worth testing<JournalHelp label="Find a setup worth testing" /></h3><p className="text-xs text-slate-600 mt-1">Your benchmark. Your goal. A measured next step.</p></div>
      <label className="text-[11px] font-semibold text-slate-600">Recommendation goal<JournalHelp label="Recommendation goal" /><select aria-label="Recommendation goal" className={`${inputBase} block mt-1`} value={goal} onChange={e => onGoal(e.target.value as RecommendationGoal)}><option value="net">Improve net result</option><option value="drawdown">Reduce drawdown</option><option value="win">Improve win rate</option></select></label>
    </div>
    <div className="mt-4 rounded-xl border border-white bg-white/80 p-4">
      {candidate ? <><div className="flex flex-wrap items-center gap-2"><RecommendationBadge exploratory={r.status === 'exploratory'} /><p className="font-bold text-[#0b1c30]">{candidate.name}</p>{candidate.estimated && <Pill tone="warn">{estimateLabel}</Pill>}</div>
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
    {ideas && ideas.length > 0 && <div className="mt-4" aria-label="Suggestions by tool">
      <p className="text-xs font-bold text-[#0b1c30]">Best idea from each tool</p>
      <p className="text-[11px] text-slate-500 mt-0.5">Strongest tested setup per tool for this goal on the training days. Green means it beats your benchmark; grey means the best option still falls short.</p>
      <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{ideas.map(idea => {
        const d = idea.metrics.netPnl - idea.baseline.netPnl, hd = idea.holdout ? idea.holdout.candidate.netPnl - idea.holdout.baseline.netPnl : null;
        return <div key={idea.category} className={`rounded-xl border p-3 text-xs ${idea.improving ? 'border-emerald-200 bg-emerald-50/50' : 'border-slate-200 bg-white/80'}`}>
          <div className="flex items-start justify-between gap-2"><p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{idea.label}</p><span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${idea.improving ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{idea.improving ? 'Improves goal' : 'No gain'}</span></div>
          <p className="mt-1 font-semibold text-[#0b1c30]">{idea.name}</p>
          <p className="mt-1 text-[11px] text-slate-500">{idea.hint}{idea.estimated ? ' · estimated' : ''}</p>
          <div className="mt-2 grid grid-cols-3 gap-1 tabular-nums"><div><p className="text-[10px] text-slate-500">Net Δ</p><p className={`font-bold ${d >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>{money(d)}</p></div><div><p className="text-[10px] text-slate-500">Win rate Δ</p><p className="font-bold">{((idea.metrics.winRate - idea.baseline.winRate) * 100).toFixed(1)} pts</p></div><div><p className="text-[10px] text-slate-500">DD Δ</p><p className="font-bold">{money(idea.metrics.maxDD - idea.baseline.maxDD)}</p></div></div>
          <p className="mt-1 text-[10px] text-slate-500">{idea.metrics.trades} / {idea.baseline.trades} trades · {idea.tested} tested{hd !== null ? ` · holdout ${money(hd)}` : ''}</p>
          {onUse && <button type="button" className="mt-2 text-[11px] font-semibold text-[#5338ec] hover:underline" onClick={() => onUse(idea.id)}>See on chart & details →</button>}
        </div>;
      })}</div>
    </div>}
    <p className="text-[11px] text-slate-500 mt-3">Compared with {baselineName}. {evidence}</p>
    <details className="text-[11px] text-slate-500 mt-2"><summary className="cursor-pointer text-[#5338ec] font-semibold">How MarketSyde chooses</summary><p className="mt-2">Local statistical recommender; no trained predictive model or external AI service is used. Candidates are ranked by the selected goal with trade-count and risk guardrails. Net-result selection allows extra drawdown up to the larger of 25% of benchmark drawdown, 5% of absolute benchmark net, or one account-currency unit. Holdout results never change selection. Badges describe these tests, not future returns or superiority to other platforms.</p></details>
    </div>
  </section>;
};

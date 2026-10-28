import React, { useState } from 'react';
import { formatInsightsMoney } from './insightsData';
import { bucketLabel, countLabel, insightButton, InsightsTooltip, resultStyle, type InsightsWidgetProps } from './InsightsShared';

const percent = (value: number, locale?: string) => new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 0 }).format(value / 100);
function ProgressMeter({ label, value, text, onClick, compact = false, accessibleLabel = label, accessibleText = text }: { label: string; value: number | null; text: string; onClick: () => void; compact?: boolean; accessibleLabel?: string; accessibleText?: string }) {
  return <button type="button" className={`block w-full rounded-lg ${compact ? 'py-0.5' : 'py-1'} text-left focus-visible:outline-2 focus-visible:outline-[#5338ec]`} aria-label={`${accessibleLabel}: ${accessibleText}`} title={`${accessibleLabel}: ${accessibleText}`} onClick={onClick}>
    <span className={`${compact ? 'mb-1' : 'mb-2'} flex flex-wrap justify-between gap-2 text-xs`}><span className="text-slate-500">{label}</span><span className="font-semibold">{text}</span></span>
    <span role="progressbar" aria-label={accessibleLabel} aria-valuemin={0} aria-valuemax={100} aria-valuenow={value === null ? undefined : value} aria-valuetext={accessibleText} className="block h-2 overflow-hidden rounded-full bg-slate-100">
      <span className="block h-full rounded-full bg-[#5338ec]" style={{ width: `${value === null ? 0 : Math.max(0, Math.min(100, value))}%` }}/>
    </span>
  </button>;
}
export function InsightsPlaybookProgress({ data, onDrill, compact = false }: InsightsWidgetProps) {
  const [all, setAll] = useState(false), [hover, setHover] = useState<string | null>(null);
  const shown = all ? data.playbooks : data.playbooks.slice(0, 3);
  const active = data.playbooks.find(playbook => playbook.key === hover);
  return <div className={compact ? 'space-y-3' : 'space-y-4'}>
    <p className="text-sm text-slate-600">{data.playbookFocus
      ? compact ? <>Most-used setup: <strong>{data.playbookFocus.name}</strong></> : <>Your most-used setup in this view is <strong>{data.playbookFocus.name}</strong>. Follow your process—not a profit target.</>
      : 'These trades have no recorded playbook yet. Your results still count; setup progress needs a recorded playbook.'}</p>
    <div className={compact ? 'space-y-2' : 'space-y-3'}>
      {shown.map(playbook => {
        const label = !playbook.answered.length ? 'No plan answers' : playbook.answered.length < 5 ? 'Early progress' : playbook.adherence! >= 80 ? 'Consistent' : playbook.adherence! >= 60 ? 'Building consistency' : 'Keep reflecting';
        return <article key={playbook.key} className={`min-w-0 rounded-xl border border-slate-200 ${compact ? 'p-2.5' : 'p-4'}`} onMouseEnter={() => setHover(playbook.key)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(playbook.key)} onBlur={() => setHover(null)}>
          <button type="button" className="flex w-full min-w-0 items-start justify-between gap-3 text-left focus-visible:outline-2 focus-visible:outline-[#5338ec]" aria-label={`Explore playbook ${playbook.name}`} title={bucketLabel(playbook.name, playbook, data.settings)} onClick={() => onDrill(`Playbook · ${playbook.name}`, playbook.trades)}>
            <span className="min-w-0">
              <span className="block break-words text-sm font-semibold">{playbook.name}</span>
              <span className="mt-1 block text-xs text-slate-500">{countLabel(playbook.n, data.settings.locale)} · {playbook.winRate === null ? 'No win rate' : `${percent(playbook.winRate, data.settings.locale)} won`}{playbook.n < 5 ? ' · Small sample' : ''}</span>
            </span>
            <span className="shrink-0 text-right">
              <span className="block text-sm font-semibold" style={resultStyle(playbook.net)}>{formatInsightsMoney(playbook.net, data.settings)}</span>
              <span className="mt-1 block text-xs text-slate-500">{label}</span>
            </span>
          </button>
          <div className={compact ? 'mt-2' : 'mt-3'}><ProgressMeter compact={compact} label={compact ? 'On plan' : `Plan followed · ${playbook.name}`} accessibleLabel={`Plan followed · ${playbook.name}`} value={playbook.adherence}
            text={playbook.answered.length ? compact ? `${playbook.followed.length}/${playbook.answered.length} · ${percent(playbook.adherence!, data.settings.locale)}` : `${playbook.followed.length} of ${playbook.answered.length} answered · ${percent(playbook.adherence!, data.settings.locale)}` : 'Not answered yet'}
            accessibleText={playbook.answered.length ? `${playbook.followed.length} of ${playbook.answered.length} answered · ${percent(playbook.adherence!, data.settings.locale)}` : 'Not answered yet'}
            onClick={() => onDrill(`Plan checks · ${playbook.name}`, playbook.answered.length ? playbook.answered : playbook.trades)}/></div>
          {playbook.answered.length < playbook.n && <p className="mt-1 text-xs text-slate-500">{countLabel(playbook.n - playbook.answered.length, data.settings.locale)} with unanswered plan checks—not counted as passes or failures.</p>}
        </article>;
      })}
    </div>
    {data.playbooks.length > 3 && <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
      <span>{compact ? `${shown.length} of ${data.playbooks.length} groups` : `Showing ${shown.length} of ${data.playbooks.length} playbook groups`}</span>
      <button className={compact ? 'font-semibold text-[#5338ec] underline' : insightButton} aria-label={all ? 'Show fewer playbooks' : 'Show all playbooks'} aria-expanded={all} onClick={() => setAll(!all)}>{compact ? all ? 'Show fewer' : 'Show all playbooks' : all ? 'Show fewer playbooks' : 'Show all playbooks'}</button>
    </div>}
    {active && <InsightsTooltip label={active.name} bucket={active} settings={data.settings}>
      <p className="mt-1">Plan followed in {active.followed.length} of {active.answered.length} answered checks. {active.n - active.answered.length} unanswered.</p>
    </InsightsTooltip>}
    <p className="text-xs text-slate-500">{compact ? 'Answered plan checks only. Labels need 5 answers; not permanent ranks or recommendations.' : 'Bars use answered plan checks only. Consistency labels need at least 5 answers and describe this view, not permanent ranks or trading recommendations.'}</p>
  </div>;
}
export function InsightsDisciplineProgress({ data, onDrill, compact = false }: InsightsWidgetProps) {
  const track = data.discipline, score = track.score;
  if (!score) return <div className="space-y-4">
    <p className="text-sm text-slate-600">Your discipline track starts when you answer plan adherence and check mistakes in a trade's full review. Missing answers are not failures.</p>
    <button className={insightButton} onClick={() => onDrill('Trades to review for discipline', track.unanswered)}>Review your trades</button>
    <p className="text-xs text-slate-500">Visual progress only—no Points or Credits are awarded.</p>
  </div>;
  const badge = track.reviewed.length < 5 ? 'Early progress' : score.score >= 80 ? 'Steady process' : score.score >= 60 ? 'Building habits' : 'Starting fresh';
  const change = track.previousScore ? score.score - track.previousScore.score : null;
  const milestone = track.nextMilestone || 10;
  return <div className={compact ? 'space-y-3' : 'space-y-5'}>
    <div className="flex flex-wrap items-center gap-5">
      <button type="button" data-keep-button-icons className="relative shrink-0 rounded-full focus-visible:outline-2 focus-visible:outline-[#5338ec]" aria-label={`Explore discipline score ${score.score} of 100`} onClick={() => onDrill('Discipline review evidence', track.reviewed)}>
        <svg viewBox="0 0 100 100" className={compact ? 'h-20 w-20' : 'h-24 w-24'} role="progressbar" aria-label="Discipline score" aria-valuemin={0} aria-valuemax={100} aria-valuenow={score.score}>
          <circle cx="50" cy="50" r="40" fill="none" stroke="var(--bg-subtle)" strokeWidth="8"/>
          <circle cx="50" cy="50" r="40" pathLength="100" fill="none" stroke="var(--color-brand-primary)" strokeWidth="8" strokeLinecap="round" strokeDasharray="100" strokeDashoffset={100 - score.score} transform="rotate(-90 50 50)"/>
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-xl font-bold">{score.score}</span>
      </button>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{badge}</p>
        <p className="mt-1 text-xs text-slate-500">Score / 100 · {track.reviewed.length} of {data.current.length} trades have enough review evidence.</p>
        <p className="mt-2 text-xs text-slate-500">{change === null ? 'No scored reviews in the previous period.' : `Score change ${change > 0 ? '+' : ''}${change} vs the previous equal period.`}</p>
      </div>
    </div>
    <div className="space-y-3">
      <ProgressMeter compact={compact} label="Followed your plan" value={score.plan} text={percent(score.plan, data.settings.locale)} onClick={() => onDrill('Reviewed trades that followed your plan', track.followed)}/>
      <ProgressMeter compact={compact} label="Checklist completed" value={track.checklistLength ? score.checklist : null} text={track.checklistLength ? percent(score.checklist, data.settings.locale) : 'No checklist configured'} onClick={() => onDrill('Checklist review evidence', track.reviewed)}/>
      <ProgressMeter compact={compact} label="Reviewed without mistakes" value={score.clean} text={percent(score.clean, data.settings.locale)} onClick={() => onDrill('Reviewed trades without recorded mistakes', track.clean)}/>
    </div>
    <div className="rounded-xl bg-slate-50 p-4">
      {track.streakKnown ? <>
        <ProgressMeter compact={compact} label="Reviewed trades on plan in a row" value={Math.min(100, score.run / milestone * 100)}
          text={`${score.run.toLocaleString(data.settings.locale)} / ${milestone.toLocaleString(data.settings.locale)}`}
          onClick={() => onDrill('Current reviewed-plan streak', track.streak)}/>
        <p className="mt-2 text-xs text-slate-500">{track.nextMilestone ? `Next habit marker: ${track.nextMilestone} reviewed trades on plan.` : 'The 10-review habit marker is reached in this view.'} Markers reflect the current streak, not permanent badges.</p>
      </> : <p className="text-xs text-slate-500">Streak unavailable: some scored reviews lack reliable entry timing. The discipline score is still available.</p>}
    </div>
    {track.unanswered.length > 0 && <button className={insightButton} onClick={() => onDrill('Trades missing discipline review evidence', track.unanswered)}>Review {countLabel(track.unanswered.length, data.settings.locale)}</button>}
    <details className="text-xs text-slate-500">
      <summary className="cursor-pointer">How this track works</summary>
      <p className="mt-2">The existing Overview score is reused: plan 50%, checklist 30%, reviewed mistake-free trades 20%. It uses reviewed evidence only. With no configured checklist, the existing calculator gives full checklist credit.</p>
      <p className="mt-2">Streaks follow entry order among scored reviews in the current date/account/side view; unanswered trades are excluded, not treated as passes. Process progress does not require profits or more trading. No Points or Credits are awarded.</p>
    </details>
  </div>;
}

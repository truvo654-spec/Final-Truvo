import React from 'react';
import { ALL_TIMEFRAMES, type Timeframe } from '../../backtest/types';
import type { PlaybookTechnicalCondition, PlaybookTechnicalConditions } from '../../data/instrumentPatterns';
import { OperandFields } from './InstrumentPatternForm';
import { describeOperand, newTechnicalRule, RULE_OPERATORS, validateConditionRules } from './technicalPatternRules';

const maxPeriod = 1000;

export function validatePlaybookConditions(conditions: PlaybookTechnicalConditions | undefined): string | null {
  if (!conditions) return null;
  if (!['all', 'any'].includes(conditions.matchMode)) return 'Choose whether all or any technical conditions should match.';
  if (conditions.rules.some(rule => rule.timeframe && !ALL_TIMEFRAMES.includes(rule.timeframe))) return 'Choose a valid timeframe for each technical condition.';
  return validateConditionRules(conditions.rules, maxPeriod);
}

export function copyPlaybookConditions(conditions: PlaybookTechnicalConditions | undefined): PlaybookTechnicalConditions | undefined {
  return conditions && { ...conditions, rules: conditions.rules.map(rule => ({ ...rule, left: { ...rule.left }, right: { ...rule.right } })) };
}

export function PlaybookTechnicalConditionsEditor({ value, onChange }: {
  value: PlaybookTechnicalConditions | undefined;
  onChange: (value: PlaybookTechnicalConditions | undefined) => void;
}) {
  const rules = value?.rules || [];
  const updateRule = (id: string, patch: Partial<PlaybookTechnicalCondition>) => {
    if (value) onChange({ ...value, rules: rules.map(rule => rule.id === id ? { ...rule, ...patch } : rule) });
  };
  return <section aria-label="Advanced technical conditions" className="space-y-3 rounded-xl border border-violet-200 bg-violet-50/50 p-4 dark:border-violet-800 dark:bg-violet-950/30">
    <div className="flex flex-wrap items-center justify-between gap-2"><div><h3 className="text-sm font-bold">Advanced technical conditions <span className="font-normal text-slate-500 dark:text-slate-400">· optional</span></h3><p className="mt-1 text-xs text-slate-600 dark:text-slate-300">Save indicator comparisons with this playbook. They are not live signals and are not automatically used in scans or backtests.</p></div><button type="button" disabled={rules.length >= 12} onClick={() => onChange({ matchMode: value?.matchMode || 'all', rules: [...rules, newTechnicalRule()] })} className="min-h-9 rounded-lg border border-violet-300 bg-white px-3 text-xs font-semibold text-[#5338ec] disabled:opacity-40 dark:border-violet-700 dark:bg-slate-900 dark:text-violet-200">+ Add condition</button></div>
    {!rules.length ? <p className="text-xs text-slate-500 dark:text-slate-400">For example, RSI (14) below 30 or close above EMA (200).</p> : <>
      <label className="block text-xs font-semibold">Match conditions<select value={value?.matchMode} onChange={event => value && onChange({ ...value, matchMode: event.target.value as 'all' | 'any' })} className="mt-1 block min-h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-xs dark:border-slate-700 dark:bg-slate-900"><option value="all">All conditions</option><option value="any">Any condition</option></select></label>
      {rules.map((rule, index) => <section key={rule.id} aria-label={`Technical condition ${index + 1}`} className="min-w-0 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center justify-between gap-2"><h4 className="text-xs font-bold">Condition {index + 1}</h4><button type="button" aria-label={`Remove condition ${index + 1}`} onClick={() => { const next = rules.filter(item => item.id !== rule.id); onChange(next.length && value ? { ...value, rules: next } : undefined); }} className="text-xs font-semibold text-rose-700 dark:text-rose-300">Remove</button></div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2"><OperandFields label={`Condition ${index + 1} left`} side={rule.left} maxPeriod={maxPeriod} onChange={left => updateRule(rule.id, { left })}/><OperandFields label={`Condition ${index + 1} right`} side={rule.right} maxPeriod={maxPeriod} onChange={right => updateRule(rule.id, { right })}/></div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2"><label className="block text-xs font-semibold">Comparison<select value={rule.operator} onChange={event => updateRule(rule.id, { operator: event.target.value as PlaybookTechnicalCondition['operator'] })} className="mt-1 block min-h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-xs dark:border-slate-700 dark:bg-slate-900">{Object.entries(RULE_OPERATORS).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label><label className="block text-xs font-semibold">Timeframe <span className="font-normal text-slate-500">(optional)</span><select value={rule.timeframe || ''} onChange={event => updateRule(rule.id, { timeframe: event.target.value ? event.target.value as Timeframe : undefined })} className="mt-1 block min-h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-xs dark:border-slate-700 dark:bg-slate-900"><option value="">Not specified</option>{ALL_TIMEFRAMES.map(timeframe => <option key={timeframe} value={timeframe}>{timeframe}</option>)}</select></label></div>
      </section>)}
      <p className="text-xs text-slate-500 dark:text-slate-400">{rules.length}/12 conditions · periods from 2 to {maxPeriod} candles.</p>
    </>}
  </section>;
}

export function PlaybookTechnicalConditionsSummary({ conditions }: { conditions: PlaybookTechnicalConditions }) {
  return <div><h4 className="font-bold">Technical conditions · {conditions.matchMode === 'all' ? 'all' : 'any'}</h4><ul className="mt-1 space-y-1">{conditions.rules.map((rule, index) => <li key={`${rule.id}-${index}`} className="break-words">{describeOperand(rule.left)} {RULE_OPERATORS[rule.operator]} {describeOperand(rule.right)}{rule.timeframe ? ` · ${rule.timeframe}` : ''}</li>)}</ul><p className="mt-1 text-slate-500 dark:text-slate-400">Saved conditions only; not automatically evaluated.</p></div>;
}

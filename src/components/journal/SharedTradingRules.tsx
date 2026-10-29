import React, { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { JournalHelp } from './JournalHelp';
import { RULE_COMPARISON_LABELS, type CustomTradingRule, type GlobalTradingRules, type JournalRules, type RuleComparison } from '../../data/tradingRules';

const input = 'min-w-0 w-full rounded-lg border border-slate-200 px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5338ec]/30';
const limits = [
  ['maxRisk', 'Max risk per trade', '% of account'],
  ['maxDailyLoss', 'Max daily loss', '% of account'],
  ['maxTrades', 'Max trades per day', 'trades'],
  ['stopAfterLosses', 'Stop after consecutive losses', 'losses'],
] as const;
type LimitDraft = Record<keyof JournalRules, string>;
type CustomRuleDraft = string | { kind: 'numeric'; name: string; comparison: RuleComparison; value: string; unit: string };
const emptyNumeric = () => ({ name: '', comparison: 'atMost' as const, value: '', unit: '' });
const displayRule = (rule: CustomRuleDraft | CustomTradingRule) => typeof rule === 'string'
  ? rule
  : `${rule.name}: ${RULE_COMPARISON_LABELS[rule.comparison]} ${rule.value}${rule.unit ? ` ${rule.unit}` : ''}`;

interface Props {
  rules: GlobalTradingRules;
  storageFailed: boolean;
  onSave: (rules: GlobalTradingRules) => boolean;
}

export const SharedTradingRules: React.FC<Props> = ({ rules, storageFailed, onSave }) => {
  const [editing, setEditing] = useState(false);
  const [limitDraft, setLimitDraft] = useState<LimitDraft>(() => ({
    maxRisk: String(rules.maxRisk),
    maxDailyLoss: String(rules.maxDailyLoss),
    maxTrades: String(rules.maxTrades),
    stopAfterLosses: String(rules.stopAfterLosses),
  }));
  const [customDraft, setCustomDraft] = useState<CustomRuleDraft[]>(rules.customRules.map(rule => typeof rule === 'string' ? rule : { ...rule, value: String(rule.value) }));
  const [adding, setAdding] = useState(false);
  const [kind, setKind] = useState<'numeric' | 'written'>('numeric');
  const [written, setWritten] = useState('');
  const [numeric, setNumeric] = useState<{ name: string; comparison: RuleComparison; value: string; unit: string }>(emptyNumeric);
  const [error, setError] = useState('');

  const begin = () => {
    setLimitDraft({ maxRisk: String(rules.maxRisk), maxDailyLoss: String(rules.maxDailyLoss), maxTrades: String(rules.maxTrades), stopAfterLosses: String(rules.stopAfterLosses) });
    setCustomDraft(rules.customRules.map(rule => typeof rule === 'string' ? rule : { ...rule, value: String(rule.value) }));
    setEditing(true);
    setError('');
  };
  const cancel = () => {
    setEditing(false);
    setAdding(false);
    setError('');
  };
  const save = () => {
    const values: JournalRules = { maxRisk: 0, maxDailyLoss: 0, maxTrades: 0, stopAfterLosses: 0 };
    for (const [key, label] of limits) {
      const value = limitDraft[key].trim();
      if (!value || !Number.isFinite(Number(value)) || Number(value) < 0) {
        setError(`Enter a valid non-negative number for ${label}.`);
        return;
      }
      values[key] = Number(value);
    }
    const customRules: CustomTradingRule[] = [];
    for (const rule of customDraft) {
      if (typeof rule === 'string') {
        if (!rule.trim()) { setError('Enter text for each written rule.'); return; }
        customRules.push(rule.trim());
      } else {
        if (!rule.name.trim() || !rule.value.trim() || !Number.isFinite(Number(rule.value))) {
          setError('Enter a rule name and a valid number for each numeric rule.');
          return;
        }
        customRules.push({ kind: 'numeric', name: rule.name.trim(), comparison: rule.comparison, value: Number(rule.value), unit: rule.unit.trim() });
      }
    }
    if (storageFailed || !onSave({ ...values, customRules })) {
      setError('Shared trading rules could not be saved. Your changes are still open.');
      return;
    }
    setEditing(false);
    setAdding(false);
    setError('');
  };
  const addRule = () => {
    if (kind === 'written') {
      if (!written.trim()) { setError('Enter a rule before adding it.'); return; }
      setCustomDraft(previous => [...previous, written.trim()]);
    } else {
      if (!numeric.name.trim() || !numeric.value.trim() || !Number.isFinite(Number(numeric.value))) {
        setError('Enter a rule name and a valid number before adding it.');
        return;
      }
      setCustomDraft(previous => [...previous, { kind: 'numeric', name: numeric.name.trim(), comparison: numeric.comparison, value: numeric.value, unit: numeric.unit.trim() }]);
    }
    setWritten('');
    setNumeric(emptyNumeric());
    setAdding(false);
    setError('');
  };

  return <section className="rounded-2xl border border-[#e2e8f0] bg-white p-5" aria-label="Trading rules">
    <header className="mb-4 flex items-start justify-between gap-3">
      <div>
        <h4 className="flex items-center gap-1.5 text-sm font-bold"><ShieldCheck className="h-4 w-4 text-[#5338ec]" /> Trading rules<JournalHelp label="Trading rules" /></h4>
        <p className="mt-1 text-xs text-[#474556]">Shared rules update every existing playbook and are used as defaults for new ones. Turn a rule off for an individual strategy in its setup.</p>
      </div>
      {editing
        ? <div className="flex shrink-0 gap-3">
          <button type="button" onClick={cancel} className="text-xs font-semibold text-slate-500 hover:underline">Cancel</button>
          <button type="button" onClick={save} className="rounded-lg bg-[#5338ec] px-3 py-2 text-xs font-semibold text-white hover:bg-[#4326d8]">Save rules</button>
        </div>
        : <button type="button" aria-label="Edit shared trading rules" onClick={begin} className="shrink-0 rounded-lg border border-[#CFC5FF] px-3 py-2 text-xs font-semibold text-[#5338ec] hover:bg-[#F7F5FF]">Edit</button>}
    </header>
    <div role="list" aria-label="Shared trading rules" className="space-y-3">
      {limits.map(([key, label, unit]) => <div role="listitem" key={key} className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm font-semibold">{label}<JournalHelp label={label} /></span>
        <div className="flex items-center gap-2">
          {editing
            ? <input aria-label={label} type="number" min={0} step="any" value={limitDraft[key]} onChange={event => setLimitDraft(previous => ({ ...previous, [key]: event.target.value }))} className="w-20 rounded-xl border border-slate-200 px-3 py-1.5 text-right font-mono text-sm" />
            : <span className="text-sm font-mono">{rules[key]}</span>}
          <span className="w-20 text-[11px] text-slate-500">{unit}</span>
        </div>
      </div>)}
      {(editing ? customDraft : rules.customRules).map((rule, index) => <div role="listitem" key={index} className="flex items-start gap-3">
        {editing
          ? <div className="min-w-0 flex-1">
            {typeof rule === 'string'
              ? <label className="block text-xs font-semibold text-slate-600">Written rule
                <input aria-label={`Shared written rule ${index + 1}`} value={rule} onChange={event => setCustomDraft(previous => previous.map((item, i) => i === index ? event.target.value : item))} className={`${input} mt-1`} />
              </label>
              : <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <label className="text-xs font-semibold text-slate-600">Rule name<input aria-label={`Shared numeric rule ${index + 1} name`} value={rule.name} onChange={event => setCustomDraft(previous => previous.map((item, i) => i === index && typeof item !== 'string' ? { ...item, name: event.target.value } : item))} className={`${input} mt-1`} /></label>
                <label className="text-xs font-semibold text-slate-600">Condition<select aria-label={`Shared numeric rule ${index + 1} condition`} value={rule.comparison} onChange={event => setCustomDraft(previous => previous.map((item, i) => i === index && typeof item !== 'string' ? { ...item, comparison: event.target.value as RuleComparison } : item))} className={`${input} mt-1`}>{(Object.entries(RULE_COMPARISON_LABELS) as [RuleComparison, string][]).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label>
                <label className="text-xs font-semibold text-slate-600">Value<input aria-label={`Shared numeric rule ${index + 1} value`} type="number" step="any" value={rule.value} onChange={event => setCustomDraft(previous => previous.map((item, i) => i === index && typeof item !== 'string' ? { ...item, value: event.target.value } : item))} className={`${input} mt-1`} /></label>
                <label className="text-xs font-semibold text-slate-600">Unit (optional)<input aria-label={`Shared numeric rule ${index + 1} unit`} value={rule.unit} onChange={event => setCustomDraft(previous => previous.map((item, i) => i === index && typeof item !== 'string' ? { ...item, unit: event.target.value } : item))} className={`${input} mt-1`} /></label>
              </div>}
          </div>
          : <div className="min-w-0 flex-1">
            <span className="block break-words text-sm font-semibold text-[#0b1c30]">{displayRule(rule)}</span>
            <span className="text-[11px] text-slate-500">Reference only · not checked automatically</span>
          </div>}
        {editing && <button type="button" aria-label={`Remove shared rule ${index + 1}`} onClick={() => setCustomDraft(previous => previous.filter((_, i) => i !== index))} className="mt-2 shrink-0 text-xs font-semibold text-slate-500 hover:text-rose-600">Remove</button>}
      </div>)}
    </div>
    {editing && (adding
      ? <div className="mt-4 space-y-3 rounded-lg bg-slate-50 p-3">
        <label className="block text-xs font-semibold text-slate-600">Rule type<select aria-label="Shared rule type" value={kind} onChange={event => setKind(event.target.value as 'numeric' | 'written')} className={`${input} mt-1`}><option value="numeric">Numeric reminder</option><option value="written">Written reminder</option></select></label>
        {kind === 'written'
          ? <label className="block text-xs font-semibold text-slate-600">Rule<input aria-label="New shared written rule" value={written} onChange={event => setWritten(event.target.value)} className={`${input} mt-1`} placeholder="e.g. Avoid trading during major news" /></label>
          : <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <label className="text-xs font-semibold text-slate-600">Rule name<input aria-label="New shared numeric rule name" value={numeric.name} onChange={event => setNumeric(previous => ({ ...previous, name: event.target.value }))} className={`${input} mt-1`} /></label>
            <label className="text-xs font-semibold text-slate-600">Condition<select aria-label="New shared numeric rule condition" value={numeric.comparison} onChange={event => setNumeric(previous => ({ ...previous, comparison: event.target.value as RuleComparison }))} className={`${input} mt-1`}>{(Object.entries(RULE_COMPARISON_LABELS) as [RuleComparison, string][]).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label>
            <label className="text-xs font-semibold text-slate-600">Value<input aria-label="New shared numeric rule value" type="number" step="any" value={numeric.value} onChange={event => setNumeric(previous => ({ ...previous, value: event.target.value }))} className={`${input} mt-1`} /></label>
            <label className="text-xs font-semibold text-slate-600">Unit (optional)<input aria-label="New shared numeric rule unit" value={numeric.unit} onChange={event => setNumeric(previous => ({ ...previous, unit: event.target.value }))} className={`${input} mt-1`} /></label>
          </div>}
        <div className="flex gap-3"><button type="button" onClick={addRule} className="text-xs font-semibold text-[#5338ec] hover:underline">Add rule</button><button type="button" onClick={() => setAdding(false)} className="text-xs font-semibold text-slate-500 hover:underline">Cancel</button></div>
      </div>
      : editing && <button type="button" onClick={() => setAdding(true)} className="mt-4 rounded-lg border border-[#CFC5FF] px-3 py-2 text-xs font-semibold text-[#5338ec] hover:bg-[#F7F5FF]">Add rule</button>)}
    {error && <p role="alert" className="mt-2 text-xs text-rose-700">{error}</p>}
    {storageFailed && <p role="alert" className="mt-2 text-xs text-rose-700">Some saved trading rules could not be loaded. Existing data was preserved; defaults are being used.</p>}
  </section>;
};

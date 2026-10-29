import React, { useState } from 'react';
import { JournalHelp } from './JournalHelp';
import { describeCustomTradingRule, RULE_COMPARISON_LABELS, type CustomTradingRule, type JournalRules, type PlaybookTradingRules, type RuleComparison } from '../../data/tradingRules';

const input = 'min-w-0 w-full rounded-lg border border-slate-200 px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5338ec]/30';
const limits = [
  ['maxRisk', 'Max risk per trade', '% of account'],
  ['maxDailyLoss', 'Max daily loss', '% of account'],
  ['maxTrades', 'Max trades per day', 'trades'],
  ['stopAfterLosses', 'Stop after consecutive losses', 'losses'],
] as const;

type NumericDraft = { name: string; comparison: RuleComparison; value: string; unit: string };
const emptyNumericDraft = (): NumericDraft => ({ name: '', comparison: 'atMost', value: '', unit: '' });

interface NumericRuleFieldsProps {
  label: string;
  rule: NumericDraft;
  onChange: (rule: NumericDraft) => void;
}

const NumericRuleFields: React.FC<NumericRuleFieldsProps> = ({ label, rule, onChange }) => (
  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
    <label className="text-xs font-semibold text-slate-600">Rule name
      <input aria-label={`${label} name`} value={rule.name} onChange={event => onChange({ ...rule, name: event.target.value })} className={`${input} mt-1`} />
    </label>
    <label className="text-xs font-semibold text-slate-600">Condition
      <select aria-label={`${label} condition`} value={rule.comparison} onChange={event => onChange({ ...rule, comparison: event.target.value as RuleComparison })} className={`${input} mt-1`}>
        {(Object.entries(RULE_COMPARISON_LABELS) as [RuleComparison, string][]).map(([id, text]) => <option key={id} value={id}>{text}</option>)}
      </select>
    </label>
    <label className="text-xs font-semibold text-slate-600">Value
      <input aria-label={`${label} value`} type="number" step="any" value={rule.value} onChange={event => onChange({ ...rule, value: event.target.value })} className={`${input} mt-1`} />
    </label>
    <label className="text-xs font-semibold text-slate-600">Unit (optional)
      <input aria-label={`${label} unit`} value={rule.unit} onChange={event => onChange({ ...rule, unit: event.target.value })} className={`${input} mt-1`} />
    </label>
  </div>
);

interface Props {
  rules: PlaybookTradingRules;
  onChange: (rules: PlaybookTradingRules) => void;
}

export const PlaybookTradingRulesEditor: React.FC<Props> = ({ rules, onChange }) => {
  const [addingRule, setAddingRule] = useState(false);
  const [newRuleType, setNewRuleType] = useState<'numeric' | 'written'>('numeric');
  const [newWrittenRule, setNewWrittenRule] = useState('');
  const [newNumericRule, setNewNumericRule] = useState<NumericDraft>(emptyNumericDraft);
  const [error, setError] = useState('');

  const toggleLimit = (key: keyof JournalRules) => onChange({
    ...rules,
    enabled: { ...rules.enabled, [key]: !rules.enabled[key] },
  });
  const updateLimit = (key: keyof JournalRules, value: number) => onChange({
    ...rules,
    values: { ...rules.values, [key]: value },
  });
  const updateCustomRule = (index: number, rule: CustomTradingRule) => onChange({
    ...rules,
    customRules: rules.customRules.map((item, i) => i === index ? { ...item, rule } : item),
  });
  const toggleCustomRule = (index: number) => onChange({
    ...rules,
    customRules: rules.customRules.map((item, i) => i === index ? { ...item, enabled: !item.enabled } : item),
  });
  const removeCustomRule = (index: number) => onChange({
    ...rules,
    customRules: rules.customRules.filter((_, i) => i !== index),
  });
  const addRule = () => {
    let rule: CustomTradingRule;
    if (newRuleType === 'written') {
      if (!newWrittenRule.trim()) {
        setError('Enter a rule before adding it.');
        return;
      }
      rule = newWrittenRule.trim();
    } else {
      if (!newNumericRule.name.trim() || !newNumericRule.value.trim() || !Number.isFinite(Number(newNumericRule.value))) {
        setError('Enter a rule name and a valid number before adding it.');
        return;
      }
      rule = {
        kind: 'numeric',
        name: newNumericRule.name.trim(),
        comparison: newNumericRule.comparison,
        value: Number(newNumericRule.value),
        unit: newNumericRule.unit.trim(),
      };
    }
    onChange({
      ...rules,
      customRules: [...rules.customRules, { id: `custom-${crypto.randomUUID()}`, rule, enabled: true }],
    });
    setNewWrittenRule('');
    setNewNumericRule(emptyNumericDraft());
    setAddingRule(false);
    setError('');
  };

  return <section aria-label="Trading rules for this strategy" className="rounded-xl border border-slate-200 bg-white p-3">
    <h4 className="text-sm font-bold text-[#0b1c30]">Trading rules for this strategy</h4>
    <p className="mt-1 text-[11px] leading-relaxed text-slate-600">Choose which rules apply to this playbook. These choices do not change your other playbooks. Built-in checks need supporting journal evidence; added rules are reminders only.</p>
    <div role="list" aria-label="Strategy trading rules" className="mt-3 space-y-3">
      {limits.map(([key, label, unit]) => <div role="listitem" key={key} className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-100 p-2.5">
        <label className="flex min-w-0 flex-1 items-center gap-2 text-xs font-semibold text-[#0b1c30]">
          <input type="checkbox" aria-label={`Use ${label} for this strategy`} checked={rules.enabled[key]} onChange={() => toggleLimit(key)} />
          <span>{label}<JournalHelp label={label} /></span>
        </label>
        <div className="flex items-center gap-2">
          <input aria-label={`${label} value`} type="number" min={0} step="any" disabled={!rules.enabled[key]} value={rules.values[key]} onChange={event => updateLimit(key, Number(event.target.value))} className="w-20 rounded-lg border border-slate-200 px-2 py-1.5 text-right font-mono text-sm disabled:bg-slate-50 disabled:text-slate-400" />
          <span className="w-20 text-[10px] text-slate-500">{unit}</span>
        </div>
      </div>)}
      {rules.customRules.map((item, index) => <div role="listitem" key={item.id} className="rounded-lg border border-slate-100 p-2.5">
        <div className="flex items-start gap-3">
          <label className="flex min-w-0 flex-1 items-center gap-2 pt-1 text-xs font-semibold text-[#0b1c30]">
            <input type="checkbox" aria-label={`Use added rule ${index + 1} for this strategy`} checked={item.enabled} onChange={() => toggleCustomRule(index)} />
            <span>{describeCustomTradingRule(item.rule)}</span>
          </label>
          <button type="button" aria-label={`Remove added rule ${index + 1} from this strategy`} onClick={() => removeCustomRule(index)} className="shrink-0 text-xs font-semibold text-slate-500 hover:text-rose-600">Remove</button>
        </div>
        {item.enabled && typeof item.rule !== 'string' && <div className="mt-2">
          <NumericRuleFields
            label={`Added rule ${index + 1}`}
            rule={{ ...item.rule, value: String(item.rule.value) }}
            onChange={updated => updateCustomRule(index, { kind: 'numeric', ...updated, value: Number(updated.value) })}
          />
          <p className="mt-2 text-[10px] text-slate-500">Reference only · not checked automatically.</p>
        </div>}
        {item.enabled && typeof item.rule === 'string' && <label className="mt-2 block text-[10px] text-slate-500">Reminder text
          <input aria-label={`Added rule ${index + 1} text`} value={item.rule} onChange={event => updateCustomRule(index, event.target.value)} className={`${input} mt-1`} />
          <span className="mt-1 block">Reference only · not checked automatically.</span>
        </label>}
      </div>)}
    </div>
    {addingRule
      ? <div className="mt-3 space-y-3 rounded-lg bg-slate-50 p-3">
        <label className="block text-xs font-semibold text-slate-600">Rule type
          <select aria-label="New strategy rule type" value={newRuleType} onChange={event => setNewRuleType(event.target.value as 'numeric' | 'written')} className={`${input} mt-1`}>
            <option value="numeric">Numeric reminder</option>
            <option value="written">Written reminder</option>
          </select>
        </label>
        {newRuleType === 'numeric'
          ? <NumericRuleFields label="New strategy rule" rule={newNumericRule} onChange={setNewNumericRule} />
          : <label className="block text-xs font-semibold text-slate-600">Reminder text
            <input aria-label="New strategy rule text" value={newWrittenRule} onChange={event => setNewWrittenRule(event.target.value)} placeholder="e.g. Avoid trading during major news" className={`${input} mt-1`} />
          </label>}
        <p className="text-[10px] text-slate-500">Added reminders are not checked automatically.</p>
        <div className="flex gap-3">
          <button type="button" onClick={addRule} className="text-xs font-semibold text-[#5338ec] hover:underline">Add to strategy</button>
          <button type="button" onClick={() => { setAddingRule(false); setError(''); }} className="text-xs font-semibold text-slate-500 hover:underline">Cancel</button>
        </div>
      </div>
      : <button type="button" onClick={() => { setAddingRule(true); setError(''); }} className="mt-3 rounded-lg border border-[#CFC5FF] px-3 py-2 text-xs font-semibold text-[#5338ec] hover:bg-[#F7F5FF]">Add a strategy rule</button>}
    {error && <p role="alert" className="mt-2 text-xs text-rose-700">{error}</p>}
  </section>;
};

import React from 'react';
import type { JournalPlaybook } from '../../data/journalPlaybooks';
import { IND_LABEL, OP_LABEL, cond, describeCondition, ind, price, val } from '../../backtest/rules';
import { MAX_CONDITION_PERIOD, MAX_PLAYBOOK_CONDITIONS, playbookConditions, validatePlaybookConditions } from '../../backtest/playbookConditions';
import { IND_DEFAULT_PERIOD, type Condition, type IndType } from '../../backtest/types';

const field = 'mt-1 w-full min-w-0 rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs text-slate-800';

export const PlaybookTechnicalConditions: React.FC<{
  playbook: JournalPlaybook;
  onChange: React.Dispatch<React.SetStateAction<JournalPlaybook>>;
}> = ({ playbook, onChange }) => {
  const conditions = playbookConditions(playbook);
  const error = playbook.technicalEntryConditions ? validatePlaybookConditions(conditions) : null;
  const setConditions = (next: Condition[]) => onChange(current => ({ ...current, technicalEntryConditions: next }));
  const update = (id: string, patch: Partial<Condition>) => setConditions(conditions.map(condition => condition.id === id ? { ...condition, ...patch } : condition));
  return <section aria-label="Technical entry conditions" className="space-y-3">
    <p className="text-xs leading-relaxed text-slate-600">Choose an indicator, comparison and number for each condition. All conditions must pass on completed candles. They prefill backtest entries and are available in the sample-data instrument scanner. Backtests mirror long rules for short trades; the scanner checks the displayed long rules only.</p>
    <p className="text-[11px] leading-relaxed text-slate-500">Indicator settings follow the backtest engine: MACD 12/26/9, Bollinger bands 2 deviations, and Ultimate Oscillator 7/14/28. Periods are limited to {MAX_CONDITION_PERIOD} for scanner history. Results are not live signals.</p>
    {!conditions.length && <p className="rounded-lg border border-dashed border-slate-200 p-3 text-xs text-slate-500">No technical conditions set. Add one to customize the entry rules. Otherwise, backtests use a starter template based on the playbook name and style.</p>}
    {conditions.map((condition, index) => <div key={condition.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <div className="mb-3 flex items-center justify-between"><h4 className="text-xs font-bold">Condition {index + 1}</h4><button type="button" aria-label={`Remove technical condition ${index + 1}`} onClick={() => setConditions(conditions.filter(item => item.id !== condition.id))} className="text-xs font-semibold text-slate-500 hover:text-rose-600">Remove</button></div>
      {condition.left.kind !== 'value' && condition.right.kind === 'value' ? <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="block min-w-0 text-xs font-semibold">Indicator or price
          <select aria-label={`Condition ${index + 1} indicator`} className={field} value={condition.left.kind === 'ind' ? condition.left.ind.type : condition.left.field} onChange={event => {
            const type = event.target.value;
            if (type === 'open' || type === 'high' || type === 'low' || type === 'close') update(condition.id, { left: price(type) });
            else if (Object.hasOwn(IND_LABEL, type)) {
              const indicator = type as IndType;
              update(condition.id, { left: ind(indicator, IND_DEFAULT_PERIOD[indicator], 'asia') });
            }
          }}>
            <optgroup label="Technical indicators">{Object.entries(IND_LABEL).map(([type, name]) => <option key={type} value={type}>{name}</option>)}</optgroup>
            <optgroup label="Price"><option value="close">Close price</option><option value="open">Open price</option><option value="high">High price</option><option value="low">Low price</option></optgroup>
          </select>
        </label>
        {condition.left.kind === 'ind' && Object.hasOwn(IND_DEFAULT_PERIOD, condition.left.ind.type) && <label className="block text-xs font-semibold">Period<input aria-label={`Condition ${index + 1} period`} type="number" min={2} max={MAX_CONDITION_PERIOD} step={1} className={field} value={Number.isFinite(condition.left.ind.period) ? condition.left.ind.period : ''} onChange={event => { if (condition.left.kind === 'ind') update(condition.id, { left: { ...condition.left, ind: { ...condition.left.ind, period: event.target.valueAsNumber } } }); }} /></label>}
        {condition.left.kind === 'ind' && ['SESSION_HIGH', 'SESSION_LOW'].includes(condition.left.ind.type) && <label className="block text-xs font-semibold">Session (UTC)<select aria-label={`Condition ${index + 1} session`} className={field} value={condition.left.ind.session || 'asia'} onChange={event => { if (condition.left.kind === 'ind') update(condition.id, { left: { ...condition.left, ind: { ...condition.left.ind, session: event.target.value as 'asia' | 'london' | 'ny' } } }); }}><option value="asia">Asia</option><option value="london">London</option><option value="ny">New York</option></select></label>}
        <label className="block text-xs font-semibold">Comparison<select aria-label={`Condition ${index + 1} comparison`} className={field} value={condition.op} onChange={event => update(condition.id, { op: event.target.value as Condition['op'] })}>{Object.entries(OP_LABEL).map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></label>
        <label className="block text-xs font-semibold">Number<input aria-label={`Condition ${index + 1} number`} type="number" step="any" className={field} value={Number.isFinite(condition.right.value) ? condition.right.value : ''} onChange={event => update(condition.id, { right: val(event.target.valueAsNumber) })} /></label>
      </div> : <div className="space-y-2">
        <p className="text-xs font-semibold text-[#0b1c30]">{describeCondition(condition)}</p>
        <p className="text-[11px] text-slate-500">This saved condition compares two values or tools. It stays unchanged unless you remove or replace it.</p>
        <button type="button" aria-label={`Replace technical condition ${index + 1} with an indicator and number`} onClick={() => update(condition.id, { left: ind('RSI', 14), op: 'gt', right: val(50) })} className="text-xs font-semibold text-[#5338ec] hover:underline">Replace with an indicator and number</button>
      </div>}
    </div>)}
    {error && <p role="alert" className="text-xs font-semibold text-rose-700">{error}</p>}
    <div className="flex flex-wrap gap-2">
      <button type="button" disabled={conditions.length >= MAX_PLAYBOOK_CONDITIONS} onClick={() => setConditions([...conditions, cond(ind('RSI', 14), 'gt', val(50))])} className="rounded-lg border border-[#CFC5FF] bg-white px-3 py-2 text-xs font-semibold text-[#5338ec] disabled:opacity-40">Add condition</button>
      {playbook.technicalEntryConditions && <button type="button" onClick={() => onChange(current => ({ ...current, technicalEntryConditions: undefined }))} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600">Restore default conditions</button>}
    </div>
  </section>;
};

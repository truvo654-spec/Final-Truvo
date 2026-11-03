import React from 'react';
import type { JournalPlaybook } from '../../data/journalPlaybooks';
import { IND_LABEL, OP_LABEL, cond, describeCondition, ind, price, val } from '../../backtest/rules';
import { MAX_CONDITION_PERIOD, MAX_PLAYBOOK_CONDITIONS, playbookConditions, validatePlaybookConditions } from '../../backtest/playbookConditions';
import { IND_DEFAULT_PERIOD, type Condition, type IndType, type Operand } from '../../backtest/types';
import {InfoTooltip} from '../common/InfoTooltip';

const field = 'mt-1 w-full min-w-0 rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs text-slate-800';

function TestOperand({label,value,onChange}:{label:string;value:Operand;onChange:(value:Operand)=>void}){
 const kind=value.kind==='price'?value.field:value.kind==='ind'?value.ind.type:'number';
 return <div className="min-w-0"><label className="block text-xs font-semibold">{label.endsWith('left')?'Price or indicator':'Compare with'}<select aria-label={label} className={field} value={kind} onChange={e=>{const type=e.target.value;if(type==='number')onChange(val(0));else if(['open','high','low','close'].includes(type))onChange(price(type as 'close'));else onChange(ind(type as IndType,IND_DEFAULT_PERIOD[type as IndType],'asia'));}}><optgroup label="Price">{['close','open','high','low'].map(p=><option key={p} value={p}>{p[0].toUpperCase()+p.slice(1)} price</option>)}</optgroup><optgroup label="Indicators">{Object.entries(IND_LABEL).map(([id,name])=><option key={id} value={id}>{name}</option>)}</optgroup><option value="number">Number</option></select></label>
 {value.kind==='value'&&<label className="mt-2 block text-[11px] text-slate-500">Value<input aria-label={`${label} value`} type="number" step="any" className={field} value={Number.isFinite(value.value)?value.value:''} onChange={e=>onChange(val(e.target.valueAsNumber))}/></label>}
 {value.kind==='ind'&&Object.hasOwn(IND_DEFAULT_PERIOD,value.ind.type)&&<label className="mt-2 block text-[11px] text-slate-500">Period<input aria-label={`${label} period`} type="number" min={2} max={500} step={1} className={field} value={Number.isFinite(value.ind.period)?value.ind.period:''} onChange={e=>onChange({...value,ind:{...value.ind,period:e.target.valueAsNumber}})}/></label>}
 {value.kind==='ind'&&['SESSION_HIGH','SESSION_LOW'].includes(value.ind.type)&&<label className="mt-2 block text-[11px] text-slate-500">Session · UTC<select aria-label={`${label} session`} className={field} value={value.ind.session??'asia'} onChange={e=>onChange({...value,ind:{...value.ind,session:e.target.value as 'asia'|'london'|'ny'}})}><option value="asia">Asia</option><option value="london">London</option><option value="ny">New York</option></select></label>}
 </div>;
}

export const PlaybookTechnicalConditions: React.FC<{
  playbook: JournalPlaybook;
  onChange: React.Dispatch<React.SetStateAction<JournalPlaybook>>;
  mode?: 'playbook'|'test'|'whatif';
  onEditAdvanced?:(conditionId:string)=>void;
}> = ({ playbook, onChange, mode='playbook',onEditAdvanced }) => {
  const conditions = playbookConditions(playbook);
  const maxPeriod=mode==='playbook'?MAX_CONDITION_PERIOD:500;
  const error = playbook.technicalEntryConditions ? validatePlaybookConditions(conditions,maxPeriod) : null;
  const setConditions = (next: Condition[]) => onChange(current => ({ ...current, technicalEntryConditions: next }));
  const update = (id: string, patch: Partial<Condition>) => setConditions(conditions.map(condition => condition.id === id ? { ...condition, ...patch } : condition));
  return <section aria-label="Technical entry conditions" className="space-y-3">
    {mode==='whatif'?null:mode==='test'?<p className="flex items-center text-xs text-slate-500">Enter when all conditions match<InfoTooltip label="Test entry conditions" description="Conditions use completed candles. These are long entry rules; short entries mirror them automatically. MACD uses 12/26/9, Bollinger bands 2 deviations and Ultimate Oscillator 7/14/28. Changes apply to this test copy only."/></p>:<><p className="text-xs leading-relaxed text-slate-600">Choose an indicator, comparison and number for each condition. All conditions must pass on completed candles. They prefill backtest entries and are available in the sample-data instrument scanner. Backtests mirror long rules for short trades; the scanner checks the displayed long rules only.</p><p className="text-[11px] leading-relaxed text-slate-500">Indicator settings follow the backtest engine: MACD 12/26/9, Bollinger bands 2 deviations, and Ultimate Oscillator 7/14/28. Periods are limited to {MAX_CONDITION_PERIOD} for scanner history. Results are not live signals.</p></>}
    {!conditions.length && <p className="rounded-lg border border-dashed border-slate-200 p-3 text-xs text-slate-500">{mode==='whatif'?'Add a technical condition to compare.':'No technical conditions set. Add one to customize the entry rules. Otherwise, backtests use a starter template based on the playbook name and style.'}</p>}
    {conditions.map((condition, index) => <div key={condition.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><h4 className="text-xs font-bold">Condition {index + 1}</h4><div className="flex items-center gap-3">{mode==='whatif'&&onEditAdvanced&&<button type="button" onClick={()=>onEditAdvanced(condition.id)} className="text-xs font-semibold text-[#5338ec] hover:underline">Compare two tools</button>}<button type="button" aria-label={`Remove technical condition ${index + 1}`} onClick={() => setConditions(conditions.filter(item => item.id !== condition.id))} className="text-xs font-semibold text-slate-500 hover:text-rose-600">Remove</button></div></div>
      {mode==='test'?<><p className="mb-3 text-xs text-slate-500">{describeCondition(condition)}</p><div className="grid grid-cols-1 gap-3 sm:grid-cols-3"><TestOperand label={`Condition ${index+1} left`} value={condition.left} onChange={left=>update(condition.id,{left})}/><label className="block text-xs font-semibold">Comparison<select aria-label={`Condition ${index+1} comparison`} className={field} value={condition.op} onChange={e=>update(condition.id,{op:e.target.value as Condition['op']})}>{Object.entries(OP_LABEL).map(([id,name])=><option key={id} value={id}>{name}</option>)}</select></label><TestOperand label={`Condition ${index+1} right`} value={condition.right} onChange={right=>update(condition.id,{right})}/></div></>:condition.left.kind !== 'value' && condition.right.kind === 'value' ? <div className={mode==='whatif'?'grid grid-cols-2 items-end gap-3':'grid grid-cols-1 items-end gap-3 sm:grid-cols-2 lg:grid-cols-4'}>
        <label className={'block min-w-0 text-xs font-semibold'+(mode==='whatif'?' col-span-2':'')}>Indicator or price
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
        {condition.left.kind === 'ind' && Object.hasOwn(IND_DEFAULT_PERIOD, condition.left.ind.type) && <label className="block min-w-0 text-xs font-semibold">Period<input aria-label={`Condition ${index + 1} period`} type="number" min={2} max={maxPeriod} step={1} className={field} value={Number.isFinite(condition.left.ind.period) ? condition.left.ind.period : ''} onChange={event => { if (condition.left.kind === 'ind') update(condition.id, { left: { ...condition.left, ind: { ...condition.left.ind, period: event.target.valueAsNumber } } }); }} /></label>}
        {condition.left.kind === 'ind' && ['SESSION_HIGH', 'SESSION_LOW'].includes(condition.left.ind.type) && <label className="block text-xs font-semibold">Session (UTC)<select aria-label={`Condition ${index + 1} session`} className={field} value={condition.left.ind.session || 'asia'} onChange={event => { if (condition.left.kind === 'ind') update(condition.id, { left: { ...condition.left, ind: { ...condition.left.ind, session: event.target.value as 'asia' | 'london' | 'ny' } } }); }}><option value="asia">Asia</option><option value="london">London</option><option value="ny">New York</option></select></label>}
        <label className="block text-xs font-semibold">Comparison<select aria-label={`Condition ${index + 1} comparison`} className={field} value={condition.op} onChange={event => update(condition.id, { op: event.target.value as Condition['op'] })}>{Object.entries(OP_LABEL).map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></label>
        <label className="block text-xs font-semibold">Number<input aria-label={`Condition ${index + 1} number`} type="number" step="any" className={field} value={Number.isFinite(condition.right.value) ? condition.right.value : ''} onChange={event => update(condition.id, { right: val(event.target.valueAsNumber) })} /></label>
      </div> : <div className="space-y-2">
        <p className="text-xs font-semibold text-[#0b1c30]">{describeCondition(condition)}</p>
        {mode==='whatif'?<p className="text-[11px] text-slate-500">This condition compares two values or tools.</p>:<><p className="text-[11px] text-slate-500">This saved condition compares two values or tools. It stays unchanged unless you remove or replace it.</p><button type="button" aria-label={`Replace technical condition ${index + 1} with an indicator and number`} onClick={() => update(condition.id, { left: ind('RSI', 14), op: 'gt', right: val(50) })} className="text-xs font-semibold text-[#5338ec] hover:underline">Replace with an indicator and number</button></>}
      </div>}
    </div>)}
    {error && <p role="alert" className="text-xs font-semibold text-rose-700">{error}</p>}
    <div className="flex flex-wrap gap-2">
      <button type="button" disabled={conditions.length >= MAX_PLAYBOOK_CONDITIONS} onClick={() => setConditions([...conditions, cond(ind('RSI', 14), 'gt', val(50))])} className="rounded-lg border border-[#CFC5FF] bg-white px-3 py-2 text-xs font-semibold text-[#5338ec] disabled:opacity-40">Add condition</button>
      {mode==='playbook'&&playbook.technicalEntryConditions && <button type="button" onClick={() => onChange(current => ({ ...current, technicalEntryConditions: undefined }))} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600">Restore default conditions</button>}
    </div>
  </section>;
};

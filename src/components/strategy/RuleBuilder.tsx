import React from 'react';
import { Condition, Operand, OperandKind, Operator, RuleGroup } from './engine/types';
import { OP_LABEL, cond, describeOperand, num, uid } from './engine/templates';
import { NumInput, Opt, SelectBox, inputCls } from './ui';

const KIND_OPTIONS: Opt<OperandKind>[] = [
  { value: 'price', label: 'Price', group: 'Price and numbers' },
  { value: 'value', label: 'A number', group: 'Price and numbers' },
  { value: 'sma', label: 'Simple moving average (SMA)', group: 'Averages' },
  { value: 'ema', label: 'Exponential moving average (EMA)', group: 'Averages' },
  { value: 'rsi', label: 'RSI', group: 'Momentum' },
  { value: 'stoch', label: 'Stochastic %K', group: 'Momentum' },
  { value: 'macd', label: 'MACD line', group: 'Momentum' },
  { value: 'macdSignal', label: 'MACD signal line', group: 'Momentum' },
  { value: 'macdHist', label: 'MACD histogram', group: 'Momentum' },
  { value: 'bbUpper', label: 'Bollinger upper band', group: 'Volatility' },
  { value: 'bbMid', label: 'Bollinger middle line', group: 'Volatility' },
  { value: 'bbLower', label: 'Bollinger lower band', group: 'Volatility' },
  { value: 'atr', label: 'ATR (average range)', group: 'Volatility' },
  { value: 'donchianHigh', label: 'Highest high of the last N bars', group: 'Channels' },
  { value: 'donchianLow', label: 'Lowest low of the last N bars', group: 'Channels' },
];

const DEFAULTS: Record<OperandKind, Operand> = {
  price: { kind: 'price', field: 'close' },
  value: { kind: 'value', value: 50 },
  sma: { kind: 'sma', period: 20, field: 'close' },
  ema: { kind: 'ema', period: 20, field: 'close' },
  rsi: { kind: 'rsi', period: 14, field: 'close' },
  stoch: { kind: 'stoch', period: 14 },
  macd: { kind: 'macd', period: 12, period2: 26, period3: 9, field: 'close' },
  macdSignal: { kind: 'macdSignal', period: 12, period2: 26, period3: 9, field: 'close' },
  macdHist: { kind: 'macdHist', period: 12, period2: 26, period3: 9, field: 'close' },
  bbUpper: { kind: 'bbUpper', period: 20, mult: 2, field: 'close' },
  bbMid: { kind: 'bbMid', period: 20, mult: 2, field: 'close' },
  bbLower: { kind: 'bbLower', period: 20, mult: 2, field: 'close' },
  atr: { kind: 'atr', period: 14 },
  donchianHigh: { kind: 'donchianHigh', period: 20 },
  donchianLow: { kind: 'donchianLow', period: 20 },
};

const OPERATORS: Opt<Operator>[] = (Object.keys(OP_LABEL) as Operator[]).map((o) => ({ value: o, label: OP_LABEL[o] }));

export const OperandEditor: React.FC<{ operand: Operand; onChange: (o: Operand) => void; side: string }> = ({ operand: o, onChange, side }) => {
  const set = (patch: Partial<Operand>) => onChange({ ...o, ...patch });
  const changeKind = (k: OperandKind) => {
    const d = DEFAULTS[k];
    onChange(k === 'value' && typeof o.value === 'number' ? { ...d, value: o.value } : d);
  };
  const macdLike = o.kind === 'macd' || o.kind === 'macdSignal' || o.kind === 'macdHist';
  const bb = o.kind === 'bbUpper' || o.kind === 'bbMid' || o.kind === 'bbLower';
  return (
    <div className="space-y-1.5">
      <SelectBox value={o.kind} onChange={changeKind} options={KIND_OPTIONS} ariaLabel={`${side} indicator`} />
      <div className="flex flex-wrap items-center gap-2">
        {o.kind === 'price' && (
          <SelectBox<'close' | 'open' | 'high' | 'low'> value={o.field ?? 'close'} onChange={(f) => set({ field: f })} ariaLabel={`${side} price type`} options={[{ value: 'close', label: 'Close' }, { value: 'open', label: 'Open' }, { value: 'high', label: 'High' }, { value: 'low', label: 'Low' }]} />
        )}
        {o.kind === 'value' && (
          <div className="w-28"><NumInput value={o.value ?? 0} onChange={(v) => set({ value: v })} step={0.5} ariaLabel={`${side} number`} /></div>
        )}
        {['sma', 'ema', 'rsi', 'atr', 'stoch', 'donchianHigh', 'donchianLow'].includes(o.kind) && (
          <div className="w-24"><NumInput value={o.period ?? 14} onChange={(v) => set({ period: v })} min={1} max={500} integer suffix="bars" ariaLabel={`${side} length`} /></div>
        )}
        {macdLike && (
          <>
            <div className="w-20"><NumInput value={o.period ?? 12} onChange={(v) => set({ period: v })} min={1} max={200} integer ariaLabel={`${side} MACD fast`} suffix="fast" /></div>
            <div className="w-20"><NumInput value={o.period2 ?? 26} onChange={(v) => set({ period2: v })} min={2} max={400} integer ariaLabel={`${side} MACD slow`} suffix="slow" /></div>
            <div className="w-20"><NumInput value={o.period3 ?? 9} onChange={(v) => set({ period3: v })} min={1} max={200} integer ariaLabel={`${side} MACD signal`} suffix="sig" /></div>
          </>
        )}
        {bb && (
          <>
            <div className="w-24"><NumInput value={o.period ?? 20} onChange={(v) => set({ period: v })} min={2} max={500} integer suffix="bars" ariaLabel={`${side} band length`} /></div>
            <div className="w-24"><NumInput value={o.mult ?? 2} onChange={(v) => set({ mult: v })} min={0.5} max={5} step={0.5} suffix="σ" ariaLabel={`${side} band width`} /></div>
          </>
        )}
      </div>
    </div>
  );
};

const ConditionCard: React.FC<{ c: Condition; index: number; onChange: (c: Condition) => void; onRemove: () => void; joiner: string }> = ({ c, index, onChange, onRemove, joiner }) => (
  <div>
    {index > 0 && <p className="text-center text-[10px] font-black tracking-widest text-[#5338ec] my-1.5">{joiner}</p>}
    <div className="border border-[#e2e8f0] rounded-xl p-3 bg-[#fbfbff] space-y-2">
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0"><OperandEditor operand={c.left} onChange={(left) => onChange({ ...c, left })} side={`Rule ${index + 1} left`} /></div>
        <button type="button" onClick={onRemove} aria-label={`Remove rule ${index + 1}`} className="shrink-0 w-7 h-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 text-lg leading-none transition-colors">×</button>
      </div>
      <SelectBox value={c.op} onChange={(op) => onChange({ ...c, op })} options={OPERATORS} ariaLabel={`Rule ${index + 1} comparison`} />
      <OperandEditor operand={c.right} onChange={(right) => onChange({ ...c, right })} side={`Rule ${index + 1} right`} />
      <p className="text-[11px] text-[#6b7686] leading-snug">
        {describeOperand(c.left)} <b className="text-[#0b1c30]">{OP_LABEL[c.op]}</b> {describeOperand(c.right)}
      </p>
    </div>
  </div>
);

export const GroupEditor: React.FC<{ title: string; hint: string; group: RuleGroup; onChange: (g: RuleGroup) => void; disabled?: boolean; emptyNote: string }> = ({ title, hint, group, onChange, disabled, emptyNote }) => (
  <div className={disabled ? 'opacity-50 pointer-events-none' : ''}>
    <div className="flex items-center justify-between gap-2 mb-2">
      <div className="min-w-0">
        <p className="text-sm font-bold text-[#0b1c30]">{title}</p>
        <p className="text-[11px] text-[#6b7686]">{hint}</p>
      </div>
      {group.conditions.length > 1 && (
        <div className="inline-flex rounded-full border border-slate-200 overflow-hidden text-[11px] font-bold shrink-0" role="group" aria-label={`${title} logic`}>
          {(['AND', 'OR'] as const).map((l) => (
            <button key={l} type="button" aria-pressed={group.logic === l} onClick={() => onChange({ ...group, logic: l })} className={`px-3 py-1 transition-colors ${group.logic === l ? 'bg-[#5338ec] text-white' : 'bg-white text-[#474556] hover:bg-slate-50'}`}>
              {l === 'AND' ? 'All of' : 'Any of'}
            </button>
          ))}
        </div>
      )}
    </div>
    {group.conditions.length === 0 && <p className="text-xs text-[#6b7686] bg-slate-50 border border-dashed border-slate-300 rounded-xl px-3 py-3 mb-2">{emptyNote}</p>}
    {group.conditions.map((c, i) => (
      <ConditionCard
        key={c.id}
        c={c}
        index={i}
        joiner={group.logic === 'AND' ? 'AND' : 'OR'}
        onChange={(next) => onChange({ ...group, conditions: group.conditions.map((x) => (x.id === c.id ? next : x)) })}
        onRemove={() => onChange({ ...group, conditions: group.conditions.filter((x) => x.id !== c.id) })}
      />
    ))}
    <button type="button" onClick={() => onChange({ ...group, conditions: [...group.conditions, { ...cond({ kind: 'rsi', period: 14 }, 'crossesAbove', num(30)), id: uid() }] })} className="mt-2 text-xs font-bold text-[#5338ec] hover:underline">
      + Add a rule
    </button>
  </div>
);

export { inputCls };

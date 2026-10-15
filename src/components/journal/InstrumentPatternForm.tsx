import React, { useState } from 'react';
import type { InstrumentPatternSetup, TechnicalOperand, TechnicalPatternRule, TechnicalTool } from '../../data/instrumentPatterns';
import { validateInstrumentPattern } from './instrumentMatching';
import { editableTechnicalSetup, hasPeriod, newTechnicalRule, operand, RULE_OPERATORS, TECHNICAL_TOOLS } from './technicalPatternRules';

const field = 'mt-1.5 h-9 w-full min-w-0 rounded-lg border border-slate-200 bg-white px-2 text-xs font-normal text-slate-800';
const numberValue = (value:number) => Number.isNaN(value) ? '' : value;
const OperandFields: React.FC<{side:TechnicalOperand;onChange:(value:TechnicalOperand)=>void;label:string;maxPeriod:number}> = ({side,onChange,label,maxPeriod}) => {
  const update=(key:keyof TechnicalOperand,value:unknown)=>onChange({...side,[key]:value});
  return <fieldset className="min-w-0 space-y-2"><legend className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{label}</legend>
    <label className="block text-xs font-semibold">Technical tool<select aria-label={`${label} technical tool`} value={side.tool} onChange={e=>onChange(operand(e.target.value as TechnicalTool))} className={field}>{Object.entries(TECHNICAL_TOOLS).map(([tool,name])=><option key={tool} value={tool}>{name}</option>)}</select></label>
    {side.tool === 'number' && <label className="block text-xs font-semibold">Threshold<input required type="number" step="any" value={numberValue(side.value)} onChange={e=>update('value',e.target.valueAsNumber)} className={field}/></label>}
    {hasPeriod(side.tool) && <label className="block text-xs font-semibold">{side.tool.startsWith('breakout') ? 'Range period' : side.tool === 'relativeVolume' ? 'Volume average period' : 'Period'}<input required type="number" min={2} max={maxPeriod} value={numberValue(side.period)} onChange={e=>update('period',e.target.valueAsNumber)} className={field}/></label>}
    {side.tool === 'MACD' && <div className="grid grid-cols-3 gap-2">{(['fastPeriod','slowPeriod','signalPeriod'] as const).map(key=><label key={key} className="text-xs font-semibold">{key === 'fastPeriod' ? 'Fast' : key === 'slowPeriod' ? 'Slow' : 'Signal'}<input required type="number" min={2} max={maxPeriod} value={numberValue(side[key]!)} onChange={e=>update(key,e.target.valueAsNumber)} className={field}/></label>)}</div>}
    {side.tool.startsWith('BB_') && <label className="block text-xs font-semibold">Standard deviations<input required type="number" min={0.1} max={10} step="any" value={numberValue(side.deviations!)} onChange={e=>update('deviations',e.target.valueAsNumber)} className={field}/></label>}
    {side.tool.startsWith('breakout') && <label className="block text-xs font-semibold">ATR period<input required type="number" min={2} max={maxPeriod} value={numberValue(side.atrPeriod)} onChange={e=>update('atrPeriod',e.target.valueAsNumber)} className={field}/></label>}
    {side.tool.startsWith('SESSION_') && <label className="block text-xs font-semibold">Session (UTC)<select value={side.session} onChange={e=>update('session',e.target.value)} className={field}><option value="asia">Asia · 00:00–07:00</option><option value="london">London · 07:00–16:00</option><option value="ny">New York · 12:00–21:00</option></select></label>}
    <details className="text-[11px] text-slate-500"><summary className="cursor-pointer">Scale & offset</summary><div className="mt-2 grid grid-cols-2 gap-2"><label>Multiplier<input required type="number" step="any" value={numberValue(side.multiplier)} onChange={e=>update('multiplier',e.target.valueAsNumber)} className={field}/></label><label>Offset<input required type="number" step="any" value={numberValue(side.offset)} onChange={e=>update('offset',e.target.valueAsNumber)} className={field}/></label></div><p className="mt-1">Compared value = tool × multiplier + offset.</p></details>
  </fieldset>;
};

export const InstrumentPatternForm: React.FC<{
  initial: InstrumentPatternSetup; patterns: InstrumentPatternSetup[];
  onApply: (setup: InstrumentPatternSetup) => void; onCancel: () => void;
}> = ({ initial, patterns, onApply, onCancel }) => {
  const [draft,setDraft]=useState(()=>editableTechnicalSetup(initial));
  const [error,setError]=useState('');
  const update=<K extends keyof InstrumentPatternSetup>(key:K,value:InstrumentPatternSetup[K])=>{setDraft(current=>({...current,[key]:value}));setError('');};
  const rules=draft.technicalRules || [];
  const changeRule=(id:string,patch:Partial<TechnicalPatternRule>)=>update('technicalRules',rules.map(rule=>rule.id===id ? {...rule,...patch} : rule));
  return <form aria-label="Set up pattern" onSubmit={event=>{
    event.preventDefault();
    const error=validateInstrumentPattern(draft,patterns);
    if(error){setError(error);return;}
    onApply({...draft,id:draft.id || `pattern-${crypto.randomUUID()}`,name:draft.name.trim(),patternType:draft.patternType!.trim()});
  }} className="rounded-xl border border-[#DED5FF] bg-[#FAF8FF] p-4">
    <h3 className="text-sm font-bold">{initial.id ? 'Edit setup pattern' : 'Build your setup pattern'}</h3>
    <p className="mt-1 text-xs leading-relaxed text-slate-500">Define your own pattern type and technical rules. Parameters follow the tools you choose. Apply the pattern, then confirm to save it with your playbook.</p>
    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
      <label className="text-xs font-semibold">Pattern name<input autoFocus required maxLength={60} value={draft.name} onChange={e=>update('name',e.target.value)} placeholder="e.g. My London setup" className={field}/></label>
      <label className="text-xs font-semibold">Pattern type<input required maxLength={80} value={draft.patternType || ''} onChange={e=>update('patternType',e.target.value)} placeholder="Enter any type, e.g. RSI divergence" className={field}/><span className="mt-1 block text-[10px] font-normal text-slate-500">Your own category. The rules below define what gets matched.</span></label>
      <label className="text-xs font-semibold">Sample window (candles)<input required type="number" min={60} max={240} value={numberValue(draft.lookbackBars)} onChange={e=>update('lookbackBars',e.target.valueAsNumber)} className={field}/><span className="mt-1 block text-[10px] font-normal text-slate-500">60–240 completed candles, including indicator warm-up.</span></label>
      <label className="text-xs font-semibold">Match conditions<select value={draft.matchMode} onChange={e=>update('matchMode',e.target.value as 'all'|'any')} className={field}><option value="all">All rules must pass</option><option value="any">Any rule can pass</option></select></label>
      <label className="text-xs font-semibold">Minimum rules passed (%)<input required type="number" min={0} max={100} value={numberValue(draft.minFit)} onChange={e=>update('minFit',e.target.valueAsNumber)} className={field}/><span className="mt-1 block text-[10px] font-normal text-slate-500">Fit = passed rules ÷ total rules. All-rules mode requires 100%.</span></label>
    </div>
    <div className="mt-5 flex flex-wrap items-center justify-between gap-2"><h4 className="text-xs font-bold">Technical rules · {rules.length}/12</h4><button type="button" disabled={rules.length>=12} onClick={()=>update('technicalRules',[...rules,newTechnicalRule()])} className="min-h-8 rounded-lg border border-[#D8CEFF] bg-white px-3 text-xs font-semibold text-[#5338ec] disabled:opacity-40">+ Add technical rule</button></div>
    <p className="mt-2 text-[11px] leading-relaxed text-slate-500">Compare tools, price or thresholds. Crossovers use the last two completed candles. Relative volume excludes the current candle from its average; range tools use earlier candles. Fixed settings are shown in tool names. Missing indicator history produces no match.</p>
    <div className="mt-3 space-y-3">{rules.map((rule,index)=><section key={rule.id} aria-label={`Technical rule ${index+1}`} className="rounded-xl border border-slate-200 bg-white p-3">
      <div className="mb-3 flex items-center justify-between"><h5 className="text-xs font-bold">Rule {index+1}</h5><button type="button" aria-label={`Remove rule ${index+1}`} onClick={()=>update('technicalRules',rules.filter(item=>item.id!==rule.id))} className="text-xs text-slate-500 hover:text-rose-600">Remove</button></div>
      <div className="grid grid-cols-1 items-start gap-3 sm:grid-cols-2"><OperandFields label="Left" side={rule.left} maxPeriod={draft.lookbackBars-2} onChange={left=>changeRule(rule.id,{left})}/><OperandFields label="Right" side={rule.right} maxPeriod={draft.lookbackBars-2} onChange={right=>changeRule(rule.id,{right})}/></div>
      <label className="mt-3 block text-xs font-semibold">Comparison<select value={rule.operator} onChange={e=>changeRule(rule.id,{operator:e.target.value as TechnicalPatternRule['operator']} )} className={field}>{Object.entries(RULE_OPERATORS).map(([id,label])=><option key={id} value={id}>{label}</option>)}</select></label>
    </section>)}</div>
    {!rules.length && <p className="mt-3 rounded-lg border border-dashed border-[#D8CEFF] p-4 text-xs text-slate-500">Add a technical rule to start. For example: RSI (14) below 30, close above VWAP, or relative volume (20) at least 1.5×.</p>}
    {error && <p role="alert" className="mt-3 text-xs text-rose-700">{error}</p>}
    <div className="mt-4 flex flex-wrap justify-end gap-2"><button type="button" onClick={onCancel} className="min-h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600">Cancel pattern</button><button type="submit" className="min-h-9 rounded-lg bg-[#5338ec] px-3 text-xs font-semibold text-white">Apply pattern</button></div>
  </form>;
};

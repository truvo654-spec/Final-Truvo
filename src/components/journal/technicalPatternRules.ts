import type { InstrumentPatternSetup, TechnicalOperand, TechnicalPatternRule, TechnicalTool } from '../../data/instrumentPatterns';
import { createIndicator } from '../../backtest/indicators';
import { IND_DEFAULT_PERIOD, type IndType, type Series } from '../../backtest/types';

export const TECHNICAL_TOOLS: Record<TechnicalTool, string> = {
  close:'Close price',open:'Open price',high:'High price',low:'Low price',number:'Number / threshold',
  EMA:'EMA',SMA:'SMA',HMA:'Hull moving average',VWMA:'Volume-weighted moving average',VWAP:'VWAP (UTC day)',
  RSI:'RSI',MACD:'MACD histogram',STOCH:'Stochastic %K',STOCH_RSI:'Stochastic RSI',CCI:'CCI',ADX:'ADX',
  MOMENTUM:'Momentum',ROC:'Rate of change (%)',WILLR:'Williams %R',ULTIMATE:'Ultimate oscillator (7, 14, 28)',
  ATR:'ATR',BB_UPPER:'Bollinger upper',BB_MIDDLE:'Bollinger middle',BB_LOWER:'Bollinger lower',
  ICHIMOKU_CONVERSION:'Ichimoku conversion',ICHIMOKU_BASE:'Ichimoku base',BULL_POWER:'Bull power',BEAR_POWER:'Bear power',
  HIGHEST:'Previous range high',LOWEST:'Previous range low',PDH:'Previous UTC day high',PDL:'Previous UTC day low',
  SESSION_HIGH:'Session high',SESSION_LOW:'Session low',FVG_BULL:'Bullish fair value gap (0/1)',FVG_BEAR:'Bearish fair value gap (0/1)',
  OBV:'On-balance volume',MFI:'Money flow index',volume:'Candle volume',relativeVolume:'Relative volume (× average)',
  breakoutUp:'Break above range (ATR)',breakoutDown:'Break below range (ATR)',breakoutEither:'Break outside range (ATR)',
};
export const RULE_OPERATORS: Record<TechnicalPatternRule['operator'], string> = { above:'is above',below:'is below',atLeast:'is at least',atMost:'is at most',crossAbove:'crosses above',crossBelow:'crosses below' };
export const hasPeriod = (tool: TechnicalTool) => Object.hasOwn(IND_DEFAULT_PERIOD,tool) || tool === 'relativeVolume' || tool.startsWith('breakout');
export const operand = (tool: TechnicalTool = 'RSI', value = 50): TechnicalOperand => ({tool,period:IND_DEFAULT_PERIOD[tool as IndType] || (tool === 'relativeVolume' || tool.startsWith('breakout') ? 20 : 14),atrPeriod:14,value,multiplier:1,offset:0,session:'asia',fastPeriod:12,slowPeriod:26,signalPeriod:9,deviations:2});
export const newTechnicalRule = (): TechnicalPatternRule => ({id:crypto.randomUUID(),left:operand(),operator:'above',right:operand('number',50)});
export function validateConditionRules(rules: TechnicalPatternRule[], maxPeriod: number): string | null {
  if (!rules.length || rules.length > 12) return 'Add between 1 and 12 technical rules.';
  const ids = new Set<string>();
  for (const [index,rule] of rules.entries()) {
    if (!rule.id || ids.has(rule.id)) return 'Each technical rule must have a unique ID.';
    ids.add(rule.id);
    if (!Object.hasOwn(RULE_OPERATORS,rule.operator)) return `Rule ${index+1}: choose a comparison.`;
    for (const side of [rule.left,rule.right]) {
      if (!side || !Object.hasOwn(TECHNICAL_TOOLS,side.tool)) return `Rule ${index+1}: choose a supported technical tool.`;
      if (![side.value,side.multiplier,side.offset].every(Number.isFinite)) return `Rule ${index+1}: enter finite numeric parameters.`;
      if (hasPeriod(side.tool) && (!Number.isInteger(side.period) || side.period < 2 || side.period > maxPeriod)) return `Rule ${index+1}: period must be 2–${maxPeriod} candles.`;
      if (side.tool.startsWith('breakout') && (!Number.isInteger(side.atrPeriod) || side.atrPeriod < 2 || side.atrPeriod > maxPeriod)) return `Rule ${index+1}: choose a valid ATR period.`;
      if (side.tool.startsWith('SESSION_') && !['asia','london','ny'].includes(side.session)) return `Rule ${index+1}: choose a session.`;
      if (side.tool === 'MACD' && ([side.fastPeriod,side.slowPeriod,side.signalPeriod].some(period=>!Number.isInteger(period) || period! < 2 || period! > maxPeriod) || side.fastPeriod! >= side.slowPeriod!)) return `Rule ${index+1}: MACD needs valid fast, slow and signal periods, with fast below slow.`;
      if (side.tool.startsWith('BB_') && (!Number.isFinite(side.deviations) || side.deviations! <= 0 || side.deviations! > 10)) return `Rule ${index+1}: Bollinger deviation must be greater than 0 and at most 10.`;
    }
  }
  return null;
}
export function validateTechnicalRules(setup: InstrumentPatternSetup): string | null {
  if (!setup.patternType?.trim() || setup.patternType.trim().length > 80) return 'Enter a custom pattern type of 1–80 characters.';
  if (!['all','any'].includes(setup.matchMode || '')) return 'Choose All rules or Any rule.';
  return validateConditionRules(setup.technicalRules || [], setup.lookbackBars - 2);
}
export function describeOperand(side: TechnicalOperand): string {
  const label = side.tool === 'number' ? `${side.value}` : `${TECHNICAL_TOOLS[side.tool]}${hasPeriod(side.tool) ? ` (${side.period})` : ''}${side.tool.startsWith('breakout') ? ` / ATR ${side.atrPeriod}` : ''}${side.tool.startsWith('SESSION_') ? ` · ${side.session} UTC` : ''}`;
  return `${label}${side.tool === 'MACD' ? ` (${side.fastPeriod}, ${side.slowPeriod}, ${side.signalPeriod})` : ''}${side.tool.startsWith('BB_') ? ` · ${side.deviations}σ` : ''}${side.multiplier !== 1 ? ` × ${side.multiplier}` : ''}${side.offset ? ` ${side.offset > 0 ? '+' : '−'} ${Math.abs(side.offset)}` : ''}`;
}
/** Materialize only the supplied, completed candles. No expression evaluation or code execution. */
function values(series: Series, indices: number[], side: TechnicalOperand): number[] {
  const direct = {close:series.c,open:series.o,high:series.h,low:series.l,volume:series.v}[side.tool];
  let raw: number[];
  if (side.tool === 'number') raw = indices.map(() => side.value);
  else if (direct) raw = indices.map(i => direct[i]);
  else if (side.tool === 'relativeVolume') raw = indices.map((i,n) => {
    if (n < side.period) return NaN;
    const total = indices.slice(n-side.period,n).reduce((sum,j) => sum+series.v[j],0);
    return total > 0 ? series.v[i] / (total/side.period) : NaN;
  });
  else if (side.tool === 'MACD') {
    const fast=createIndicator({type:'EMA',period:side.fastPeriod}),slow=createIndicator({type:'EMA',period:side.slowPeriod}),signal=createIndicator({type:'EMA',period:side.signalPeriod});
    raw=indices.map(i=>{
      const args=[series.t[i],series.o[i],series.h[i],series.l[i],series.c[i],series.v[i]] as const;
      fast.update(...args);slow.update(...args);
      if(!Number.isFinite(fast.value) || !Number.isFinite(slow.value)) return NaN;
      const line=fast.value-slow.value;signal.update(series.t[i],0,0,0,line,0);
      return line-signal.value;
    });
  }
  else if(side.tool.startsWith('BB_')) raw=indices.map((_,n)=>{
    if(n+1<side.period) return NaN;
    const closes=indices.slice(n-side.period+1,n+1).map(i=>series.c[i]);
    const mean=closes.reduce((a,b)=>a+b,0)/closes.length;
    const deviation=Math.sqrt(closes.reduce((sum,c)=>sum+(c-mean)**2,0)/closes.length);
    return mean+(side.tool === 'BB_UPPER' ? 1 : side.tool === 'BB_LOWER' ? -1 : 0)*side.deviations!*deviation;
  });
  else {
    const breakout = side.tool.startsWith('breakout');
    const indicator = createIndicator({type:breakout ? 'ATR' : side.tool as IndType,period:breakout ? side.atrPeriod : side.period,session:side.session});
    raw = indices.map((i,n) => {
      indicator.update(series.t[i],series.o[i],series.h[i],series.l[i],series.c[i],series.v[i]);
      if (!breakout) return indicator.value;
      if (n < side.period || !(indicator.value > 0)) return NaN;
      const previous = indices.slice(n-side.period,n);
      const up=series.c[i]-Math.max(...previous.map(j=>series.h[j])),down=Math.min(...previous.map(j=>series.l[j]))-series.c[i];
      return (side.tool === 'breakoutUp' ? up : side.tool === 'breakoutDown' ? down : Math.max(0,up,down)) / indicator.value;
    });
  }
  return raw.map(value => value*side.multiplier+side.offset);
}
export function evaluateTechnicalRules(series: Series, indices: number[], setup: InstrumentPatternSetup) {
  if (validateTechnicalRules(setup)) return null;
  const reasons: string[] = [];
  let passed = 0;
  for (const rule of setup.technicalRules!) {
    const left=values(series,indices,rule.left),right=values(series,indices,rule.right);
    const a=left.at(-1)!,b=right.at(-1)!,pa=left.at(-2)!,pb=right.at(-2)!;
    if (![a,b].every(Number.isFinite) || (rule.operator.startsWith('cross') && ![pa,pb].every(Number.isFinite))) return null;
    const pass = rule.operator === 'above' ? a>b : rule.operator === 'below' ? a<b : rule.operator === 'atLeast' ? a>=b : rule.operator === 'atMost' ? a<=b : rule.operator === 'crossAbove' ? pa<=pb && a>b : pa>=pb && a<b;
    if (pass) passed++;
    reasons.push(`${pass ? 'Passed' : 'Not met'}: ${describeOperand(rule.left)} ${RULE_OPERATORS[rule.operator]} ${describeOperand(rule.right)} · ${a.toFixed(4)} vs ${b.toFixed(4)}.`);
  }
  const total=setup.technicalRules!.length,score=Math.round(100*passed/total);
  if ((setup.matchMode === 'all' ? passed !== total : passed === 0) || score < setup.minFit) return null;
  return {score,reasons:[`${setup.patternType}: ${passed}/${total} technical rules passed (${setup.matchMode}).`,...reasons]};
}

/** Convert earlier saved setups to editable technical rules without losing their thresholds. */
export function editableTechnicalSetup(initial: InstrumentPatternSetup): InstrumentPatternSetup {
  if (initial.pattern === 'custom') return {...initial,technicalRules:initial.technicalRules?.map(rule=>({...rule,left:{...rule.left},right:{...rule.right}})) || []};
  const rules: TechnicalPatternRule[] = [];
  const add=(left:TechnicalOperand,operator:TechnicalPatternRule['operator'],right:TechnicalOperand)=>rules.push({id:`legacy-${rules.length}`,left,operator,right});
  if (initial.direction !== 'either') add(operand('EMA'),initial.direction === 'bullish' ? 'above' : 'below',{...operand('EMA'),period:50});
  if (initial.minVolumeRatio > 0) add(operand('relativeVolume'),'atLeast',operand('number',initial.minVolumeRatio));
  if (initial.pattern === 'breakout' && initial.minBreakoutAtr > 0) add(operand('breakoutEither'),'atLeast',operand('number',initial.minBreakoutAtr));
  return {...initial,pattern:'custom',patternType:initial.id ? (initial.pattern === 'trend' ? 'Trend continuation' : initial.pattern === 'range' ? 'Mean reversion' : 'Range breakout') : '',matchMode:'all',technicalRules:rules,direction:'either',minVolumeRatio:0,minBreakoutAtr:0};
}

/** Saved, local rules for matching instruments against generated sample candles. */
import type { IndType } from '../backtest/types';
export type InstrumentPattern = 'trend' | 'breakout' | 'range' | 'custom';
export type TechnicalTool = IndType | 'close' | 'open' | 'high' | 'low' | 'volume' | 'relativeVolume' | 'breakoutUp' | 'breakoutDown' | 'breakoutEither' | 'number';
export interface TechnicalOperand {
  tool: TechnicalTool;
  period: number;
  atrPeriod: number;
  value: number;
  multiplier: number;
  offset: number;
  session: 'asia' | 'london' | 'ny';
  fastPeriod?: number;
  slowPeriod?: number;
  signalPeriod?: number;
  deviations?: number;
}
export interface TechnicalPatternRule {
  id: string;
  left: TechnicalOperand;
  operator: 'above' | 'below' | 'atLeast' | 'atMost' | 'crossAbove' | 'crossBelow';
  right: TechnicalOperand;
}
export interface InstrumentPatternSetup {
  id: string;
  name: string;
  pattern: InstrumentPattern;
  direction: 'either' | 'bullish' | 'bearish';
  lookbackBars: number;
  minFit: number;
  minVolumeRatio: number;
  minBreakoutAtr: number;
  patternType?: string;
  matchMode?: 'all' | 'any';
  technicalRules?: TechnicalPatternRule[];
}

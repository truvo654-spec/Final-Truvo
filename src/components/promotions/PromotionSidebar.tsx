import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Broker } from '../../types';
import { INITIAL_SIGNALS } from '../../data/mockData';
import { CANONICAL_SCREENSHOT_INSTRUMENTS } from '../analysis/instrumentAnalysisData';
import { InstrumentIcon } from '../analysis/InstrumentIcon';

interface PromotionSidebarProps {
  /** Broker shown in the ad. */
  broker?: Broker;
  brokerName: string;
  onViewBroker: () => void;
  onOpenSignals: () => void;
  onOpenSignal: (ticker: string) => void;
  onOpenAnalysis: () => void;
  onOpenInstrument: (symbol: string) => void;
}

const ActionText: React.FC<{ buy: boolean }> = ({ buy }) => (
  <span className={`text-sm font-semibold ${buy ? 'text-emerald-500' : 'text-rose-500'}`}>{buy ? 'BUY' : 'SELL'}</span>
);

const Row: React.FC<{ onClick: () => void; children: React.ReactNode }> = ({ onClick, children }) => (
  <div
    role="button"
    tabIndex={0}
    onClick={onClick}
    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onClick())}
    className="flex items-center gap-3 bg-slate-50 hover:bg-[#EEF0FE] rounded-lg px-3 py-2.5 cursor-pointer transition-colors"
  >
    {children}
    <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
  </div>
);

/** Three widgets for the side of the promotion page: a broker ad, Trading Signals and Instrument Analysis. */
export const PromotionSidebar: React.FC<PromotionSidebarProps> = ({ broker, brokerName, onViewBroker, onOpenSignals, onOpenSignal, onOpenAnalysis, onOpenInstrument }) => {
  const signals = INITIAL_SIGNALS.slice(0, 5);
  const instruments = CANONICAL_SCREENSHOT_INSTRUMENTS.slice(0, 5);

  return (
    <div className="bg-white border border-[#e2e8f0] rounded-2xl overflow-hidden">
      {/* 1. Broker ad */}
      <div className="p-5">
        <div className="relative rounded-lg overflow-hidden bg-[#0b1c30] text-white h-44 shadow-md">
          <div className="flex items-center justify-between px-3 py-2 bg-black/40 text-[9px] font-semibold text-white/70">
            <span className="font-black text-xs tracking-tight text-white">{brokerName}</span>
            <span className="uppercase tracking-wider">Sponsored</span>
          </div>
          <div className="p-4">
            <p className="font-display text-lg font-black leading-tight">
              TRADE THE MARKETS <br />
              WITH <span className="text-[#CAEB0E]">BETTER CONDITIONS</span>
            </p>
            <p className="text-[10px] text-white/70 mt-2 leading-snug max-w-[11rem]">CFDs on Forex, Commodities, Indices and more, with fast deposits and withdrawals.</p>
            <span className="inline-block mt-3 bg-[#CAEB0E] text-[#0b1c30] text-[10px] font-black px-3 py-1.5 rounded">REGISTER</span>
          </div>
          <div className="absolute right-3 bottom-3 flex">
            <span className="w-10 h-10 rounded-full bg-[#F3BA2F] border-2 border-white/30" />
            <span className="w-10 h-10 rounded-full bg-[#5945F1] border-2 border-white/30 -ml-3" />
          </div>
        </div>
        <p className="font-display text-2xl font-black text-[#0b1c30] mt-4">{brokerName}</p>
        <p className="text-sm text-[#474556]">70% of retail CFD accounts lose money</p>
        <button
          onClick={onViewBroker}
          disabled={!broker}
          className="w-full mt-4 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-sm font-bold text-[#0b1c30] rounded-lg py-3 transition-colors"
        >
          View Broker Details
        </button>
      </div>

      {/* 2. Trading Signals */}
      <div className="border-t border-[#e2e8f0] p-5">
        <div role="button" tabIndex={0} onClick={onOpenSignals} onKeyDown={(e) => e.key === 'Enter' && onOpenSignals()} className="flex items-center gap-1 mb-3 cursor-pointer group w-fit">
          <h3 className="text-lg font-display font-bold text-[#0b1c30] group-hover:text-[#5338ec] transition-colors">Trading Signals</h3>
          <ChevronRight className="w-4 h-4 text-[#0b1c30] group-hover:text-[#5338ec]" />
        </div>
        <div className="space-y-2">
          {signals.map((s) => (
            <Row key={s.id} onClick={() => onOpenSignal(s.ticker)}>
              <span className="text-lg leading-none w-6 text-center whitespace-nowrap">{s.flag.split('/')[0].trim()}</span>
              <span className="flex-1 text-sm font-semibold text-[#0b1c30]">{s.ticker}</span>
              <ActionText buy={s.action === 'BUY'} />
            </Row>
          ))}
        </div>
      </div>

      {/* 3. Instrument Analysis */}
      <div className="border-t border-[#e2e8f0] p-5">
        <div role="button" tabIndex={0} onClick={onOpenAnalysis} onKeyDown={(e) => e.key === 'Enter' && onOpenAnalysis()} className="flex items-center gap-1 mb-3 cursor-pointer group w-fit">
          <h3 className="text-lg font-display font-bold text-[#0b1c30] group-hover:text-[#5338ec] transition-colors">Instrument Analysis</h3>
          <ChevronRight className="w-4 h-4 text-[#0b1c30] group-hover:text-[#5338ec]" />
        </div>
        <div className="space-y-2">
          {instruments.map((i) => {
            const up = i.change >= 0;
            return (
              <Row key={i.id} onClick={() => onOpenInstrument(i.symbol)}>
                <InstrumentIcon iconType={i.iconType} name={i.name} className="w-6 h-6" />
                <span aria-hidden className={`text-[10px] ${up ? 'text-emerald-500' : 'text-rose-500'}`}>{up ? '▲' : '▼'}</span>
                <span className="flex-1 text-sm font-semibold text-[#0b1c30] truncate">{i.name}</span>
                <ActionText buy={up} />
              </Row>
            );
          })}
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Strategy, StopType, TakeProfitType } from './engine/types';
import { INSTRUMENTS, PERIODS, SCENARIOS, TIMEFRAMES, getInstrument } from './engine/marketData';
import { cloneStrategy, describeGroup } from './engine/templates';
import { GroupEditor } from './RuleBuilder';
import { Field, NumInput, Section, SelectBox, Switch } from './ui';

interface Props {
  strategy: Strategy;
  onChange: (s: Strategy) => void;
  scenario: number;
  onScenario: (n: number) => void;
  barCount: number;
}

export const SetupPanel: React.FC<Props> = ({ strategy: s, onChange, scenario, onScenario, barCount }) => {
  const edit = (fn: (draft: Strategy) => void) => {
    const d = cloneStrategy(s);
    fn(d);
    onChange(d);
  };
  const ins = getInstrument(s.instrument);
  const longOn = s.direction !== 'short';
  const shortOn = s.direction !== 'long';

  const stopLabel = s.exit.stopLoss.type === 'atr' ? '× ATR(14)' : s.exit.stopLoss.type === 'pips' ? 'pips' : '%';
  const tpLabel = s.exit.takeProfit.type === 'rr' ? '× the risk' : s.exit.takeProfit.type === 'atr' ? '× ATR(14)' : s.exit.takeProfit.type === 'pips' ? 'pips' : '%';

  return (
    <div className="space-y-3">
      <Section title="1. Market and data" summary={`${ins.label} · ${s.timeframe} · ${PERIODS.find((p) => p.id === s.period)?.label}`}>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Instrument" className="col-span-2">
            <SelectBox
              value={s.instrument}
              onChange={(id) =>
                edit((d) => {
                  d.instrument = id;
                  const i = getInstrument(id);
                  d.costs.spreadPips = i.defaultSpreadPips;
                  d.costs.commissionPerLot = i.defaultCommission;
                })
              }
              ariaLabel="Instrument"
              options={INSTRUMENTS.map((i) => ({ value: i.id, label: i.label, group: i.group }))}
            />
          </Field>
          <Field label="Candle size">
            <SelectBox value={s.timeframe} onChange={(v) => edit((d) => (d.timeframe = v))} ariaLabel="Candle size" options={TIMEFRAMES.map((t) => ({ value: t.id, label: t.label }))} />
          </Field>
          <Field label="Test period">
            <SelectBox value={s.period} onChange={(v) => edit((d) => (d.period = v))} ariaLabel="Test period" options={PERIODS.map((p) => ({ value: p.id, label: p.label }))} />
          </Field>
          <Field label="Price history" hint="Prices are simulated, not real quotes. Each history is a different repeatable random market. Try the same rules on all three.">
            <SelectBox<number> value={scenario} onChange={onScenario} ariaLabel="Simulated price history" options={SCENARIOS.map((x) => ({ value: x.id, label: x.label }))} />
          </Field>
          <Field label="Trade direction">
            <SelectBox value={s.direction} onChange={(v) => edit((d) => (d.direction = v))} ariaLabel="Trade direction" options={[{ value: 'both', label: 'Long and short' }, { value: 'long', label: 'Long only' }, { value: 'short', label: 'Short only' }]} />
          </Field>
          <Field label="Starting capital" className="col-span-2">
            <NumInput value={s.capital} onChange={(v) => edit((d) => (d.capital = v))} min={100} max={100000000} step={1000} suffix="USD" ariaLabel="Starting capital" />
          </Field>
        </div>
        <p className="text-[11px] text-[#6b7686]">About {barCount.toLocaleString()} candles. Prices are simulated for this preview.</p>
      </Section>

      <Section title="2. Entry rules" summary={`Buy: ${longOn ? describeGroup(s.longEntry) : 'off'} · Sell: ${shortOn ? describeGroup(s.shortEntry) : 'off'}`}>
        <GroupEditor title="Buy when" hint="Opens a long trade on the next candle's open." group={s.longEntry} onChange={(g) => edit((d) => (d.longEntry = g))} disabled={!longOn} emptyNote={longOn ? 'No rules yet. Add one to start buying.' : 'Long trades are switched off (see Trade direction).'} />
        <div className="border-t border-slate-100 pt-3" />
        <GroupEditor title="Sell short when" hint="Opens a short trade on the next candle's open." group={s.shortEntry} onChange={(g) => edit((d) => (d.shortEntry = g))} disabled={!shortOn} emptyNote={shortOn ? 'No rules yet. Add one to start selling short.' : 'Short trades are switched off (see Trade direction).'} />
      </Section>

      <Section title="3. Exit rules" summary={`Stop: ${s.exit.stopLoss.type === 'none' ? 'none' : `${s.exit.stopLoss.value} ${stopLabel}`} · Target: ${s.exit.takeProfit.type === 'none' ? 'none' : `${s.exit.takeProfit.value} ${tpLabel}`}`}>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Stop loss" hint="Where a losing trade is closed. ATR means the average candle range, so stops widen when the market is wild.">
            <SelectBox<StopType> value={s.exit.stopLoss.type} onChange={(v) => edit((d) => { d.exit.stopLoss.type = v; if (v === 'atr') d.exit.stopLoss.value = 2; if (v === 'pips') d.exit.stopLoss.value = 40; if (v === 'percent') d.exit.stopLoss.value = 1; })} ariaLabel="Stop loss type" options={[{ value: 'atr', label: 'ATR multiple' }, { value: 'pips', label: 'Fixed pips' }, { value: 'percent', label: 'Percent of price' }, { value: 'none', label: 'No stop' }]} />
          </Field>
          <Field label="Distance">
            <NumInput value={s.exit.stopLoss.value} onChange={(v) => edit((d) => (d.exit.stopLoss.value = v))} min={0.1} max={10000} step={0.5} suffix={s.exit.stopLoss.type === 'atr' ? '×' : s.exit.stopLoss.type === 'pips' ? 'pips' : '%'} disabled={s.exit.stopLoss.type === 'none'} ariaLabel="Stop loss distance" />
          </Field>
          <Field label="Take profit" hint="Where a winning trade is closed. 'Multiple of the risk' sets the target at, say, 2× the stop distance.">
            <SelectBox<TakeProfitType> value={s.exit.takeProfit.type} onChange={(v) => edit((d) => { d.exit.takeProfit.type = v; if (v === 'rr') d.exit.takeProfit.value = 2; if (v === 'atr') d.exit.takeProfit.value = 3; if (v === 'pips') d.exit.takeProfit.value = 80; if (v === 'percent') d.exit.takeProfit.value = 2; })} ariaLabel="Take profit type" options={[{ value: 'rr', label: 'Multiple of the risk' }, { value: 'atr', label: 'ATR multiple' }, { value: 'pips', label: 'Fixed pips' }, { value: 'percent', label: 'Percent of price' }, { value: 'none', label: 'No target' }]} />
          </Field>
          <Field label="Distance">
            <NumInput value={s.exit.takeProfit.value} onChange={(v) => edit((d) => (d.exit.takeProfit.value = v))} min={0.1} max={10000} step={0.5} suffix={s.exit.takeProfit.type === 'rr' ? '× risk' : s.exit.takeProfit.type === 'atr' ? '×' : s.exit.takeProfit.type === 'pips' ? 'pips' : '%'} disabled={s.exit.takeProfit.type === 'none'} ariaLabel="Take profit distance" />
          </Field>
        </div>
        {s.exit.takeProfit.type === 'rr' && s.exit.stopLoss.type === 'none' && <p className="text-[11px] text-amber-700 bg-amber-50 rounded-lg px-2.5 py-1.5">A target measured in risk needs a stop loss. Add a stop or pick another target type.</p>}

        <div className="border-t border-slate-100 pt-3 space-y-3">
          <Switch checked={s.exit.trailing.enabled} onChange={(v) => edit((d) => (d.exit.trailing.enabled = v))} label="Trailing stop (follows price, never backs off)" />
          {s.exit.trailing.enabled && (
            <div className="grid grid-cols-2 gap-3">
              <Field label="Trail by">
                <SelectBox value={s.exit.trailing.type} onChange={(v) => edit((d) => { d.exit.trailing.type = v; d.exit.trailing.value = v === 'atr' ? 2.5 : 40; })} ariaLabel="Trailing type" options={[{ value: 'atr', label: 'ATR multiple' }, { value: 'pips', label: 'Fixed pips' }]} />
              </Field>
              <Field label="Distance"><NumInput value={s.exit.trailing.value} onChange={(v) => edit((d) => (d.exit.trailing.value = v))} min={0.1} max={10000} step={0.5} suffix={s.exit.trailing.type === 'atr' ? '×' : 'pips'} ariaLabel="Trailing distance" /></Field>
            </div>
          )}
          <Field label="Close after" hint="Closes a trade that has not hit a stop or target after this many candles. 0 turns it off.">
            <NumInput value={s.exit.timeExitBars} onChange={(v) => edit((d) => (d.exit.timeExitBars = v))} min={0} max={5000} integer suffix="candles" ariaLabel="Time exit" />
          </Field>
          <Switch checked={s.exit.exitOnOpposite} onChange={(v) => edit((d) => (d.exit.exitOnOpposite = v))} label="Close, and flip, on the opposite entry signal" />
        </div>

        <div className="border-t border-slate-100 pt-3">
          <GroupEditor title="Also close when" hint="Optional. Closes whatever is open when these rules fire." group={s.exit.exitRules} onChange={(g) => edit((d) => (d.exit.exitRules = g))} emptyNote="No extra exit rules." />
        </div>
      </Section>

      <Section title="4. Position size and risk" summary={s.sizing.mode === 'risk' ? `Risk ${s.sizing.riskPct}% per trade` : `${s.sizing.lots} lots per trade`}>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Size trades by" hint="Risk percent sizes each trade so that hitting the stop loses about that share of your balance. It needs a stop loss.">
            <SelectBox value={s.sizing.mode} onChange={(v) => edit((d) => (d.sizing.mode = v))} ariaLabel="Sizing mode" options={[{ value: 'risk', label: 'Risk % of balance' }, { value: 'fixedLot', label: 'Fixed lots' }]} />
          </Field>
          {s.sizing.mode === 'risk' ? (
            <Field label="Risk per trade"><NumInput value={s.sizing.riskPct} onChange={(v) => edit((d) => (d.sizing.riskPct = v))} min={0.1} max={20} step={0.25} suffix="%" ariaLabel="Risk per trade" /></Field>
          ) : (
            <Field label="Lots per trade"><NumInput value={s.sizing.lots} onChange={(v) => edit((d) => (d.sizing.lots = v))} min={0.01} max={500} step={0.05} ariaLabel="Lots per trade" /></Field>
          )}
          <Field label="Largest size allowed" className="col-span-2"><NumInput value={s.sizing.maxLots} onChange={(v) => edit((d) => (d.sizing.maxLots = v))} min={0.01} max={500} step={1} suffix="lots" ariaLabel="Largest size" /></Field>
        </div>
        {s.sizing.mode === 'risk' && s.exit.stopLoss.type === 'none' && <p className="text-[11px] text-amber-700 bg-amber-50 rounded-lg px-2.5 py-1.5">Risk sizing needs a stop loss, so this will use {s.sizing.lots} fixed lots until you add one.</p>}
        {s.sizing.riskPct >= 5 && s.sizing.mode === 'risk' && <p className="text-[11px] text-amber-700 bg-amber-50 rounded-lg px-2.5 py-1.5">Risking {s.sizing.riskPct}% a trade means a short losing run can take a large share of the account.</p>}
      </Section>

      <Section title="5. Costs" summary={`Spread ${s.costs.spreadPips} pips · commission $${s.costs.commissionPerLot}/lot`} defaultOpen={false}>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Spread" hint="The gap between buy and sell price. Paid half on the way in and half on the way out."><NumInput value={s.costs.spreadPips} onChange={(v) => edit((d) => (d.costs.spreadPips = v))} min={0} max={1000} step={0.1} suffix="pips" ariaLabel="Spread" /></Field>
          <Field label="Slippage" hint="Extra cost when an order fills at a worse price than planned. Applied to market orders and stops."><NumInput value={s.costs.slippagePips} onChange={(v) => edit((d) => (d.costs.slippagePips = v))} min={0} max={1000} step={0.1} suffix="pips" ariaLabel="Slippage" /></Field>
          <Field label="Commission" hint="Round-trip commission in USD for each lot traded." className="col-span-2"><NumInput value={s.costs.commissionPerLot} onChange={(v) => edit((d) => (d.costs.commissionPerLot = v))} min={0} max={1000} step={0.5} suffix="$/lot" ariaLabel="Commission" /></Field>
        </div>
        <button type="button" onClick={() => edit((d) => { d.costs.spreadPips = ins.defaultSpreadPips; d.costs.commissionPerLot = ins.defaultCommission; d.costs.slippagePips = 0.2; })} className="text-xs font-bold text-[#5338ec] hover:underline">
          Use typical costs for {ins.label}
        </button>
      </Section>
    </div>
  );
};

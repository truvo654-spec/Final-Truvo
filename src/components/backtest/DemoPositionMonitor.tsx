import React from 'react';
import type { JournalEntry } from '../../types';
import type { JournalPlaybook, PlaybookScenario } from '../../data/journalPlaybooks';
import type { RunSnapshot } from '../../backtest/engine';
import type { DemoFeed, DemoHypothesis } from '../../backtest/demoReplay';
import { PositionPlan, PositionSetup, positionChecks, draftScenarioLevels } from '../../backtest/demoPosition';
import { symbolSpec } from '../../backtest/marketData';
import { Card, Field, Pill, btnSecondary, inputCls } from './ui';

interface Props {
  feed:DemoFeed; book:JournalPlaybook|null; entry?:JournalEntry; setup:PositionSetup; onChange:(v:PositionSetup)=>void;
  snapshot:RunSnapshot|null; plan:PositionPlan|null; scenario:PlaybookScenario|null; error:string|null;
  cursor:number; hypothesis:DemoHypothesis; atr:number|null;
}
const usd=(v:number)=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(v);
export function DemoPositionMonitor({feed,book,entry,setup,onChange,snapshot,plan,scenario,error,cursor,hypothesis,atr}:Props) {
  const spec=symbolSpec(feed.symbol)!, p=snapshot?.position;
  const set=(patch:Partial<PositionSetup>)=>onChange({...setup,...patch});
  const asOf=entry?.date??new Date().toISOString().slice(0,10);
  const checks=positionChecks({book,entry,feed,plan,snapshot,scenario,scenarioKey:setup.scenarioKey,asOf});
  const currentEquity=snapshot?snapshot.balance+(p?.realizedPartialNet??0)+(p?.unrealizedNet??0):null;
  const preview=()=>{
    if(!atr)return;
    const levels=draftScenarioLevels(feed,cursor,setup.bias,atr,hypothesis);
    if(levels)set(levels);
  };
  const prices=scenario?{entry:scenario.entry,stop:scenario.stop,target:scenario.target}:null;
  const metrics:[string,string][] = [
    ['Position state',error?'Setup invalid':p?`Open · ${p.direction}`:snapshot?.pending?'Pending signal order':snapshot?.finished?'Demo finished · flat':'Flat · no open position'],
    ['Remaining position',p?`${p.remaining} / ${p.size} ${spec.sizeUnit}`:snapshot?`0 ${spec.sizeUnit}`:'Unknown'],
    ['Entry / current price',p?`${p.entry.toFixed(feed.dp)} / ${feed.bars[cursor-1].c.toFixed(feed.dp)}`:snapshot?'No open entry':'Unknown'],
    ['Initial / current stop',p?`${p.initialStop.toFixed(feed.dp)} / ${p.stop.toFixed(feed.dp)}`:snapshot?'No open stop':'Unknown'],
    ['Initial stop risk',p?`${usd(p.initialRisk)} · ${(p.initialRisk/p.equityAtEntry*100).toFixed(2)}%`:snapshot?'No open risk':'Unknown'],
    ['Remaining stop risk',p?usd(p.remainingRisk):snapshot?usd(0):'Unknown'],
    ['Closed trade net',snapshot?usd(snapshot.closedNet):'Unknown'],
    ['Partial-close net',p?usd(p.realizedPartialNet):snapshot?usd(0):'Unknown'],
    ['Open P&L · close estimate',p?usd(p.unrealizedNet):snapshot?usd(0):'Unknown'],
    ['Demo equity · close estimate',currentEquity===null?'Unknown':`${usd(currentEquity)} · ${((currentEquity/Number(setup.equity)-1)*100).toFixed(2)}%`],
  ];
  return <Card title="Position size & setup monitor" sub="Hypothesis position at the replay timeline, not your broker account." label="Demo position monitor" right={<Pill tone="accent">Demo only</Pill>}>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <Field label="Demo equity (USD)"><input type="number" aria-label="Position demo equity USD" value={setup.equity} min="1" max="1000000000" onChange={e=>set({equity:e.target.value})} className={inputCls}/></Field>
      <Field label="Position sizing"><select aria-label="Position sizing mode" value={setup.mode} onChange={e=>set({mode:e.target.value as PositionSetup['mode']})} className={inputCls}><option value="risk">Risk percentage</option><option value="quantity">Fixed quantity</option></select></Field>
      {setup.mode==='risk'?<Field label="Risk budget per entry (%)"><input type="number" aria-label="Position risk percent" value={setup.percent} min="0.01" max="10" step="0.01" onChange={e=>set({percent:e.target.value})} className={inputCls}/></Field>:<Field label={`Quantity (${spec.sizeUnit})`}><input type="number" aria-label={`Position quantity in ${spec.sizeUnit}`} value={setup.quantity} min={spec.minSize} step={spec.sizeStep} onChange={e=>set({quantity:e.target.value})} className={inputCls}/></Field>}
    </div>
    <p className="mt-2 text-[11px] text-slate-500">Sizing uses {spec.sizeUnit} · minimum {spec.minSize} · increment {spec.sizeStep} · USD {spec.multiplier} per 1.0 price move per unit. Stop risk excludes commission and margin. Risk defaults to the selected playbook limit, or an explicit 1% demo default when none is recorded.</p>
    <div className="mt-3 grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_auto] gap-3 items-end">
      <Field label="Scenario setup"><select aria-label="Position scenario setup" value={setup.scenarioKey} onChange={e=>set({scenarioKey:e.target.value})} className={inputCls}><option value="">Strategy template · no price scenario</option>{(book?.scenarios??[]).map(s=><option key={s.id} value={s.id}>{s.symbol} · {s.bias==='long'?'BUY':'SELL'} · {s.status} · #{s.id}</option>)}<option value="custom">Demo-only price scenario</option></select></Field>
      {scenario && <button className={btnSecondary} onClick={()=>set({scenarioKey:'custom',bias:scenario.bias,entry:scenario.entry===undefined?'':String(scenario.entry),stop:scenario.stop===undefined?'':String(scenario.stop),target:scenario.target===undefined?'':String(scenario.target)})}>Copy to demo draft</button>}
    </div>
    {scenario && <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs mt-3 space-y-1"><p className="font-semibold">Saved playbook scenario · read-only</p><p>{scenario.hypothesis}</p><p>Written trigger: {scenario.trigger||'Not recorded'}</p><p>Entry {prices!.entry??'Unknown'} · Stop {prices!.stop??'Unknown'} · Target {prices!.target??'Unknown'}</p><p>{scenario.createdAt} → {scenario.validUntil} · {scenario.status}. This does not change its saved status.</p></div>}
    {setup.scenarioKey==='custom' && <div className="mt-3 rounded-xl border border-[#5338ec]/20 bg-[#FBFAFF] p-3"><div className="grid grid-cols-1 sm:grid-cols-4 gap-3"><Field label="Demo direction"><select aria-label="Demo scenario direction" value={setup.bias} onChange={e=>set({bias:e.target.value as PositionSetup['bias']})} className={inputCls}><option value="long">BUY</option><option value="short">SELL</option></select></Field>{(['entry','stop','target'] as const).map(k=><Field key={k} label={`Scenario ${k}`}><input type="number" aria-label={`Demo scenario ${k}`} value={setup[k]} min={spec.tickSize} step={spec.tickSize} onChange={e=>set({[k]:e.target.value})} className={inputCls}/></Field>)}</div><button className={`${btnSecondary} mt-3`} disabled={!atr||!Number.isFinite(hypothesis.stopAtr)||!Number.isFinite(hypothesis.targetR)} onClick={preview}>Use current demo price & ATR</button><p className="text-[11px] text-slate-500 mt-2">Demo draft only; not saved to the playbook. Numeric trigger: close crosses entry, then next-bar market fill; stop/target use these absolute levels. Other template management rules remain unchanged.</p></div>}
    {error && <p role="alert" className="text-xs text-rose-700 mt-3">{error}</p>}
    <dl className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2 mt-4">{metrics.map(([label,value])=><div key={label} className="rounded-lg border border-slate-100 bg-slate-50 p-3"><dt className="text-[11px] text-slate-500">{label}</dt><dd className="text-xs font-semibold tabular-nums mt-1">{value}</dd></div>)}</dl>
    {plan && <p className="text-xs mt-3 leading-relaxed"><span className="font-semibold">Setup preview · {plan.direction}</span>: {plan.quantity} {spec.sizeUnit} · entry {plan.entry.toFixed(feed.dp)} · stop {plan.stop.toFixed(feed.dp)} · target {plan.target.toFixed(feed.dp)} · initial risk {usd(plan.risk)} ({plan.riskPercent.toFixed(2)}%) · {plan.rr.toFixed(2)}R · round-trip commission {usd(plan.fees)}. {plan.quantity<spec.minSize?'Risk budget is too small for the minimum position size.':'Preview is not an order or fill.'}</p>}
    <p className="text-[11px] text-slate-500 mt-2">Playback recalculates the revealed demo from its start with the current setup. Closed-trade P&L, partial-close P&L and estimated open P&L remain separate. Open P&L assumes a market close now, including estimated round-trip commission; it is not realized P&L. At the final bar, the demo closes any remaining position.</p>
    <details className="mt-3 text-xs"><summary className="cursor-pointer text-[#5338ec] font-semibold">Playbook & scenario setup checks</summary><ul className="space-y-2 mt-3" aria-label="Position setup checks">{checks.map(c=><li key={c.label} className="rounded-lg border border-slate-200 p-3"><div className="flex items-center justify-between gap-3"><span className="font-semibold">{c.label}</span><Pill tone={c.state==='Match'?'good':c.state==='Mismatch'?'warn':'neutral'}>{c.state}</Pill></div><p className="text-slate-500 text-[11px] mt-1">{c.detail}</p></li>)}</ul></details>
  </Card>;
}

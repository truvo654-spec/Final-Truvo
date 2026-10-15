import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause, RotateCcw, Check } from 'lucide-react';
import type { JournalEntry } from '../../types';
import type { JournalPlaybook } from '../../data/journalPlaybooks';
import { SYMBOLS, symbolSpec, resolveSymbol } from '../../backtest/marketData';
import { createDemoFeed, demoTimeframe } from '../../backtest/demoReplay';
import { PositionDraft, TestPosition, parsePositionDraft, playbookPositionDraft, positionPath, recordedPositionDraft } from '../../backtest/positionReplay';
import type { Timeframe } from '../../backtest/types';
import { currencyOf, eligible, rawNet, realizedR, netRoiOf } from '../journal/journalMath';
import { CandleChart, LineChart, Marker, PriceLine } from './charts';
import { Card, Field, Pill, btnPrimary, btnSecondary, inputCls } from './ui';
import {ReplaySetupTransfer} from './ReplaySetupTransfer';
import {ReplayAICoach} from './ReplayAICoach';
import {applyReplayPositionSetup,replayRuleFields,replayVisibleAtr,type RelatedReplaySetup} from '../../backtest/replaySetups';
import {useReplayComparisons} from './useReplayComparisons';
import type {WhatIfRule} from '../../backtest/whatif';

const usd=(n:number)=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(n);
const money=(n:number,currency:string)=>new Intl.NumberFormat('en-US',{style:'currency',currency}).format(n);
const time=(t:number)=>new Date(t).toISOString().replace('T',' ').slice(0,16)+' UTC';
const MARKET_TYPES=['Forex','Indices','Commodities','Crypto','Stocks'] as const;
type PositionMarket=typeof MARKET_TYPES[number];
const marketTypeOf=(symbol:string):PositionMarket=>{const s=symbolSpec(symbol);return !s?'Forex':s.assetClass==='Futures'?(s.symbol==='MGC'?'Commodities':'Indices'):s.assetClass==='Forex'?'Forex':s.assetClass==='Crypto'?'Crypto':'Stocks';};
interface Props {entries:JournalEntry[];playbooks:JournalPlaybook[];initialEntryId?:string;lockRecordedTrade?:boolean;}
export const TestPositionReplay: React.FC<Props> = ({entries,playbooks,initialEntryId,lockRecordedTrade=false}) => {
  const initial=entries.find(e=>e.id===initialEntryId),firstBook=playbooks.find(b=>b.name===initial?.strategy)??playbooks[0]??null;
  const [entryId,setEntryId]=useState(initial?.id??'');
  const [bookId,setBookId]=useState(firstBook?.id??'');
  const [sampleValuation,setSampleValuation]=useState(true);
  const [sampleAI,setSampleAI]=useState(true);
  const [aiTargets,setAiTargets]=useState<number[]>([2]);
  const resultSection=useRef<HTMLDivElement>(null);
  const [comparisonView,setComparisonView]=useState<'pnl'|'candles'>('candles');
  const [comparisonBookId,setComparisonBookId]=useState(firstBook?.id??'');
  const [comparisonStop,setComparisonStop]=useState('');
  const [comparisonTarget,setComparisonTarget]=useState('');
  const [source,setSource]=useState<'recorded'|'playbook'>(initial?'recorded':'playbook');
  const [scenarioId,setScenarioId]=useState('');
  const [symbol,setSymbol]=useState(resolveSymbol(initial?.symbol??'')??'EUR/USD');
  const [marketFilter,setMarketFilter]=useState<PositionMarket>(()=>marketTypeOf(resolveSymbol(initial?.symbol??'')??'EUR/USD'));
  const [tf,setTf]=useState<Timeframe>(demoTimeframe(firstBook));
  const [pathNumber,setPathNumber]=useState(1),[cursor,setCursor]=useState(80);
  const [playing,setPlaying]=useState(false),[speed,setSpeed]=useState(1);
  const entry=entries.find(e=>e.id===entryId),book=playbooks.find(b=>b.id===bookId)??null;
  const feed=useMemo(()=>{
    const generated=createDemoFeed(symbol,tf,`${entryId||'sandbox'}:${pathNumber}`);
    if(source==='recorded'&&entry&&entry.entryPrice>0){
      const ratio=entry.entryPrice/generated.bars[79].c;
      return {...generated,bars:generated.bars.map(b=>({...b,o:b.o*ratio,h:b.h*ratio,l:b.l*ratio,c:b.c*ratio}))};
    }
    return generated;
  },[symbol,tf,entryId,pathNumber,source,entry]);
  const [draft,setDraft]=useState<PositionDraft>(()=>initial?recordedPositionDraft(initial):playbookPositionDraft(feed,firstBook,80));
  const [active,setActive]=useState<{position:TestPosition;start:number}|null>(null);
  const [manualExit,setManualExit]=useState<number|null>(null);
  const related=useRef<RelatedReplaySetup|null>(null);
  const [transferVersion,setTransferVersion]=useState(0),[aiRule,setAiRule]=useState<WhatIfRule|null>({kind:'target',r:2});
  useEffect(()=>{
    const base=source==='recorded'&&entry?recordedPositionDraft(entry):playbookPositionDraft(feed,book,80,'BUY',scenarioId);
    setDraft(related.current?applyReplayPositionSetup(base,related.current,symbol,replayVisibleAtr(feed.bars,80)):base);
    setActive(null);setAiRule({kind:'target',r:2});setManualExit(null);setPlaying(false);setCursor(80);
  },[feed,book,entry,source,scenarioId,transferVersion]);
  useEffect(()=>{
    if(!playing)return;
    const timer=window.setInterval(()=>setCursor(v=>Math.min(feed.bars.length,v+1)),1000/speed);
    return ()=>window.clearInterval(timer);
  },[playing,speed,feed]);
  useEffect(()=>{if(cursor>=feed.bars.length)setPlaying(false);},[cursor,feed]);
  const edit=(patch:Partial<PositionDraft>)=>{if(source==='recorded')return;setDraft(d=>({...d,...patch}));setActive(null);setManualExit(null);setPlaying(false);};
  const valuationDraft=sampleValuation?{...draft,unit:draft.unit||symbolSpec(symbol)!.sizeUnit,multiplier:draft.multiplier||String(symbolSpec(symbol)!.multiplier),costs:draft.costs||'0'}:draft;
  const parsed=parsePositionDraft(valuationDraft),scenario=book?.scenarios?.find(s=>s.id===scenarioId);
  const spec=symbolSpec(symbol)!;
  const instrumentOptions=SYMBOLS.filter(s=>marketTypeOf(s.symbol)===marketFilter);
  const quantity=Number(draft.quantity);
  const demoQuantity=draft.unit===spec.sizeUnit&&Number(draft.multiplier)===spec.multiplier;
  const mismatch=source==='recorded'&&!entry?'Choose a recorded trade.':source==='recorded'&&entry&&resolveSymbol(entry.symbol)!==symbol?'Select the chart instrument that matches the recorded trade.':source==='playbook'&&scenario&&resolveSymbol(scenario.symbol)!==symbol?'Select the chart instrument that matches the playbook scenario.':demoQuantity&&!sampleValuation&&(quantity<spec.minSize||Math.abs(quantity/spec.sizeStep-Math.round(quantity/spec.sizeStep))>1e-6)?`${symbol} demo size must be at least ${spec.minSize} ${spec.sizeUnit}, in increments of ${spec.sizeStep}.`:null;
  useEffect(()=>{
    if(parsed.position&&!mismatch){
      setActive({position:parsed.position,start:79});
      setManualExit(null);setCursor(lockRecordedTrade?feed.bars.length:80);setPlaying(false);
    }
  },[lockRecordedTrade,feed,sampleValuation,JSON.stringify(valuationDraft),parsed.error,mismatch]);
  const path=useMemo(()=>active?positionPath(feed.bars,active.position,active.start,cursor,manualExit):null,[active,feed,cursor,manualExit]);
  const aiPosition=useMemo(()=>{
    if(!active||!aiRule)return null;
    const p=active.position;
    const base:PositionDraft={direction:p.direction,entry:String(p.entry),stop:p.stop===null?String(p.entry-(p.direction==='BUY'?1:-1)*(replayVisibleAtr(feed.bars,80)||p.entry*0.01)):String(p.stop),target:p.target===null?'':String(p.target),quantity:String(p.quantity),unit:p.unit,multiplier:String(p.multiplier),costs:String(p.costs),equity:p.equity===null?'':String(p.equity)};
    return parsePositionDraft(applyReplayPositionSetup(base,replayRuleFields(aiRule),symbol)).position;
  },[active,aiRule,symbol]);
  const aiPath=useMemo(()=>active&&aiPosition?positionPath(feed.bars,aiPosition,active.start,cursor,manualExit):null,[active,aiPosition,feed,cursor,manualExit]);
  const aiAlternatives=sampleAI&&active?aiTargets.map((r,index)=>{
    const p=active.position,dir=p.direction==='BUY'?1:-1;
    const stop=p.stop??p.entry-dir*(replayVisibleAtr(feed.bars,80)||p.entry*0.01);
    const position={...p,stop,target:p.entry+dir*Math.abs(p.entry-stop)*r};
    return {id:`ai-${r}`,name:`AI · take profit at ${r}R · sample`,color:['#7c3aed','#c026d3','#9333ea'][[1.5,2,3].indexOf(r)],position,path:positionPath(feed.bars,position,active.start,cursor,manualExit)};
  }):[];
  const toggleAITarget=(r:number)=>{const next=aiTargets.includes(r)?aiTargets.filter(value=>value!==r):[...aiTargets,r];setAiTargets(next);setAiRule(next.length?{kind:'target',r:next.at(-1)!}:null);};
  const aiSeries=sampleAI?aiAlternatives.map(r=>({name:r.name,color:r.color,points:r.path.points.map(v=>({x:v.time,y:v.managedNet}))})):aiPath?[{name:'MarketSyde AI',color:'#5338ec',points:aiPath.points.map(v=>({x:v.time,y:v.managedNet}))}]:[];
  const multi=useReplayComparisons(feed,playbooks,valuationDraft,active,cursor,manualExit,path,aiPosition,aiPath,sampleAI,value=>{setSampleAI(value);setAiRule(value?{kind:'target',r:2}:null);},aiTargets,toggleAITarget,aiAlternatives);
  const current=path?.points.at(-1),p=active?.position,last=feed.bars[cursor-1],from=Math.max(0,cursor-85);
  const risk=p?.stop!==null&&p?.stop!==undefined?Math.abs(p.entry-p.stop)*p.quantity*p.multiplier:null;
  const aiCurrent=aiPath?.points.at(-1);
  const recordedNet=entry&&eligible(entry)?rawNet(entry):null;
  const recordedResult=recordedNet===null?'Unknown':Math.abs(recordedNet)<=0.005?'Breakeven':recordedNet>0?'Win':'Loss';
  const levels=(direction:string,entryPrice:number|null|undefined,stop:number|null|undefined,target:number|null|undefined,exit:number|null|undefined,dp:number)=>[
    `${direction}${entryPrice&&Number.isFinite(entryPrice)?` · entry ${entryPrice.toFixed(dp)}`:''}`,
    `Stop ${stop&&Number.isFinite(stop)?stop.toFixed(dp):'—'} · target ${target&&Number.isFinite(target)?target.toFixed(dp):'—'}`,
    exit&&Number.isFinite(exit)?`Exit ${exit.toFixed(dp)}`:'Exit not recorded',
  ].join(' · ');
  const positionLevels=p?levels(p.direction,p.entry,p.stop,p.target,path?.exit?.price??null,feed.dp):'Start a position test to see the setup';
  const aiLevels=aiPosition?levels(aiPosition.direction,aiPosition.entry,aiPosition.stop,aiPosition.target,aiPath?.exit?.price??null,feed.dp):'Choose an AI setup to compare';
  const aiRuleSummary=aiRule?(aiRule.kind==='stop'?`AI stop at ${aiRule.mult}× ATR`:aiRule.kind==='target'?`AI target at ${aiRule.r}R`:aiRule.kind==='breakeven'?`Move stop to breakeven at ${aiRule.r}R`:`AI ${aiRule.kind}`):'No AI setup selected';
  const lines:PriceLine[]=p&&path?.status!=='before'?[{price:p.entry,label:'Entry',color:'#5338ec'},...(p.stop===null?[]:[{price:p.stop,label:'Stop',color:'#e11d48',dashed:true}] as PriceLine[]),...(p.target===null?[]:[{price:p.target,label:'Target',color:'#059669',dashed:true}] as PriceLine[])]:[];
  const markers:Marker[]=active&&path?.status!=='before'?[{index:active.start,price:active.position.entry,kind:active.position.direction==='BUY'?'buy':'sell'},...(path?.exit?[{index:path.exit.index,price:path.exit.price,kind:'exit' as const}]:[])]:[];
  if(active&&path?.status!=='before'){
    for(const [position,color,label] of [[aiPosition,'#5338ec','AI']] as const){
      if(position?.stop!==null&&position?.stop!==undefined)lines.push({price:position.stop,color,label:`${label} stop`,dashed:true});
      if(position?.target!==null&&position?.target!==undefined)lines.push({price:position.target,color,label:`${label} target`,dashed:true});
    }

    if(aiPath?.exit)markers.push({index:aiPath.exit.index,price:aiPath.exit.price,kind:'exit',color:'#5338ec',label:'AI exit'});
  }
  const visiblePoints=path?.points.filter(point=>point.index>=from)??[];
  const visibleAiPoints=aiPath?.points.filter(point=>point.index>=from)??[];
  const riskPct=risk!==null&&p?.equity?risk/p.equity*100:null;

  return <div className="space-y-4" aria-label="Position replay workspace">
    <p className="rounded-xl border border-purple-100 bg-[#FBFAFF] p-3 text-xs"><Pill tone="accent">Simulated demo data</Pill> Generated candles anchored to the recorded entry at bar 80, not historical or live prices. Comparisons update automatically from your selected setups. Journal records stay unchanged.</p>
    {!lockRecordedTrade&&<ReplaySetupTransfer entries={entries} playbooks={playbooks} onSelect={setup=>{related.current=setup;if(setup){setTransferVersion(v=>v+1);setEntryId('');setSource('playbook');setScenarioId('');if(setup.playbookId)setBookId(setup.playbookId);if(setup.symbols.length){setSymbol(setup.symbols[0]);setMarketFilter(marketTypeOf(setup.symbols[0]));}if(setup.timeframe)setTf(setup.timeframe);}}}/>}
    <p className="text-[11px] text-slate-500">Position comparison copies prices, direction, sizing and target/stop parameters. Advanced playbook exits support breakeven and a maximum holding time; written entry and session rules remain reference context.</p>
    <section className="rounded-2xl border border-[#5338ec]/30 bg-gradient-to-br from-[#F1EDFF] via-white to-[#F4FAFF] p-5 shadow-sm" aria-label="Sample AI suggestions"><p className="text-sm font-bold text-[#5338ec]">✦ MarketSyde AI <Pill tone="accent">Beta</Pill></p><h3 className="text-lg font-bold mt-2">Find a setup worth testing</h3><p className="text-xs text-slate-600 mt-1">Your trade. Alternative exits. One comparison.</p><div className="mt-4 rounded-xl border border-white bg-white/80 p-4"><p className="text-sm font-bold">{sampleAI?'Explore alternative profit targets':'Compare suggestions from your journal'}</p>{sampleAI&&<div className="flex flex-wrap gap-2 mt-3">{[1.5,2,3].map(r=><button key={r} aria-pressed={aiTargets.includes(r)} className={aiTargets.includes(r)?btnPrimary:btnSecondary} onClick={()=>toggleAITarget(r)}>Take profit at {r}R</button>)}</div>}<p className="text-xs text-slate-500 mt-3">{sampleAI?'Sample suggestions use example parameters, not personalized analysis. Choose profit targets in the chart checklist.':'Sample AI is off. The journal recommender below uses prior closed trades.'}</p></div></section>
    {!sampleAI&&<ReplayAICoach entries={entries} symbol={symbol} excludeId={source==='recorded'?entryId:''} playbook={source==='recorded'?entry?.strategy||'':''} cutoff={source==='recorded'&&entry?.entryTime?Date.parse(entry.entryTime):Infinity} breakeven={false} action="Compare AI setup on this position" onUse={draft.stop.trim()?rule=>setAiRule(rule):undefined}/>}
    <div className="grid grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)] gap-4 items-start">
      <Card title={lockRecordedTrade?"Recorded baseline":"Position setup"} sub={lockRecordedTrade?"Trade Log values · read-only":"Choose a setup and instrument."}>
        <div className="space-y-4">
          {!lockRecordedTrade&&<div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1" role="group" aria-label="Setup source">
            <button type="button" aria-pressed={source==='playbook'} disabled={lockRecordedTrade} onClick={()=>{related.current=null;setSource('playbook');setEntryId('');}} className={`h-9 rounded-lg text-xs font-semibold disabled:opacity-40 ${source==='playbook'?'bg-white text-[#5338ec] shadow-sm':'text-slate-600 hover:bg-white/70'}`}>Use a playbook</button>
            <button type="button" aria-pressed={source==='recorded'} disabled={!entries.length} onClick={()=>{related.current=null;setSource('recorded');}} className={`h-9 rounded-lg text-xs font-semibold disabled:opacity-40 ${source==='recorded'?'bg-white text-[#5338ec] shadow-sm':'text-slate-600 hover:bg-white/70'}`}>Replay a trade</button>
          </div>}

          {source==='recorded'?<Field label={lockRecordedTrade?'Selected Trade Log entry':'Choose a journal trade'} hint={lockRecordedTrade?'Linked to the trade you opened. Position details are read-only Trade Log values.':undefined}><select aria-label="Position recorded trade" disabled={lockRecordedTrade} value={entryId} onChange={e=>{related.current=null;const trade=entries.find(t=>t.id===e.target.value);setEntryId(e.target.value);setScenarioId('');if(trade){const pb=playbooks.find(b=>b.name===trade.strategy);if(pb){setBookId(pb.id);setTf(demoTimeframe(pb));}const mapped=resolveSymbol(trade.symbol);if(mapped){setSymbol(mapped);setMarketFilter(marketTypeOf(mapped));}}}} className={inputCls}>{!lockRecordedTrade&&<option value="">Select a trade…</option>}{entries.filter(e=>!lockRecordedTrade||e.id===initialEntryId).map(e=><option key={e.id} value={e.id}>{e.date} · {e.symbol} · {e.direction} · {e.strategy}</option>)}</select></Field>:<div className="space-y-3">
            <Field label="Playbook"><select aria-label="Position playbook" value={bookId} onChange={e=>{related.current=null;const pb=playbooks.find(b=>b.id===e.target.value)??null;setBookId(e.target.value);setScenarioId('');setTf(demoTimeframe(pb));}} className={inputCls}>{!playbooks.length&&<option value="">Generic breakout</option>}{playbooks.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}</select></Field>
            <Field label="Scenario" hint="Optional. A saved scenario fills its own direction and price levels."><select aria-label="Position playbook scenario" className={inputCls} value={scenarioId} onChange={e=>{related.current=null;setScenarioId(e.target.value);const sc=book?.scenarios?.find(s=>s.id===e.target.value),mapped=sc&&resolveSymbol(sc.symbol);if(mapped){setSymbol(mapped);setMarketFilter(marketTypeOf(mapped));}}}><option value="">Use playbook template</option>{book?.scenarios?.map(sc=><option key={sc.id} value={sc.id}>{sc.symbol} · {sc.bias} · {sc.status}</option>)}</select></Field>
          </div>}

          {!lockRecordedTrade&&<div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2" role="group" aria-label="Market and instrument filter bar">
            <label className="min-w-0 flex-1 text-[10px] font-semibold text-slate-500">Market type<select aria-label="Position market type" value={marketFilter} disabled={source==='recorded'} onChange={e=>{related.current=null;const market=e.target.value as PositionMarket;setMarketFilter(market);const options=SYMBOLS.filter(s=>marketTypeOf(s.symbol)===market);if(!options.some(s=>s.symbol===symbol)){setSymbol(options[0].symbol);setScenarioId('');}}} className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-xs font-semibold text-[#0b1c30] disabled:opacity-60">{MARKET_TYPES.map(market=><option key={market} value={market}>{market} ({SYMBOLS.filter(s=>marketTypeOf(s.symbol)===market).length})</option>)}</select></label>
            <label className="min-w-0 flex-1 text-[10px] font-semibold text-slate-500">Instrument<select aria-label="Position instrument symbol" value={symbol} disabled={source==='recorded'} onChange={e=>{related.current=null;setSymbol(e.target.value);setScenarioId('');}} className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-xs font-semibold text-[#0b1c30] disabled:opacity-60">{instrumentOptions.map(instrument=><option key={instrument.symbol} value={instrument.symbol}>{instrument.symbol} · {instrument.name}</option>)}</select></label>
          </div>}
          <Field label="Chart timeframe"><select aria-label="Position chart timeframe" value={tf} onChange={e=>setTf(e.target.value as Timeframe)} className={inputCls}>{['1m','5m','15m','1h','4h','1D'].map(t=><option key={t}>{t}</option>)}</select></Field>
          {source==='recorded'&&entry&&<div className="rounded-xl bg-slate-50 p-3 text-[11px] text-slate-600 space-y-1"><p className="font-semibold text-slate-800">Historical reference · {entry.symbol} {entry.direction}</p><p>Recorded net: {eligible(entry)?new Intl.NumberFormat('en-US',{style:'currency',currency:currencyOf(entry)}).format(rawNet(entry)):'Unknown'} · Entry {entry.entryPrice} · size {entry.size} {entry.quantityUnit||'(unit unknown)'}</p><p>Replay uses generated candles; recorded dates, exits and fills are not replayed.</p></div>}

          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Position preview</p><p className="mt-1 text-xs font-semibold text-slate-800">{draft.direction} {draft.quantity||'—'} {draft.unit||''} · entry {draft.entry||'—'}</p><p className="mt-0.5 text-[10px] text-slate-500">Stop {draft.stop||'not set'} · target {draft.target||'not set'}</p>
          </div>

          <details className="rounded-xl border border-slate-200 bg-white p-3">
            <summary className="cursor-pointer list-none text-xs font-semibold text-[#5338ec] [&::-webkit-details-marker]:hidden">Position details <span className="ml-1 font-normal text-slate-500">Size, entry, stop, target and costs</span></summary>
            {source==='recorded'&&<p className="mt-2 text-xs text-slate-500">Read-only values from the selected Trade Log entry. Missing values stay unknown; update the trade in Trade Log to complete them.</p>}
            <fieldset disabled={source==='recorded'} className="mt-3 space-y-3">
              <Field label="Direction"><select aria-label="Test position direction" value={draft.direction} onChange={e=>edit({direction:e.target.value as 'BUY'|'SELL'})} className={inputCls}><option>BUY</option><option>SELL</option></select></Field>
              {([['entry','Entry price'],['quantity','Position size'],['stop','Stop price (optional)'],['target','Target price (optional)'],['multiplier','USD per 1.0 move / unit'],['costs','Estimated total costs (USD)'],['equity','Account equity (USD, optional)']] as const).map(([key,label])=><Field key={key} label={label}><input type="number" step="any" aria-label={`Test ${label}`} value={draft[key]} onChange={e=>edit({[key]:e.target.value})} className={inputCls}/></Field>)}
              <Field label="Quantity unit"><input aria-label="Test quantity unit" value={draft.unit} onChange={e=>edit({unit:e.target.value})} className={inputCls}/></Field>
              {source!=='recorded'&&<button type="button" className={`${btnSecondary} w-full`} onClick={()=>{edit({unit:spec.sizeUnit,multiplier:String(spec.multiplier),costs:'0'});}}>Use {symbol} demo valuation</button>}
              {source!=='recorded'&&<p className="text-[11px] text-slate-500">{spec.sizeUnit} · ${spec.multiplier} per 1.0 move per unit · zero estimated costs. No currency conversion.</p>}
              {source==='playbook'&&<button type="button" className={`${btnSecondary} w-full`} onClick={()=>{setDraft(playbookPositionDraft(feed,book,cursor,draft.direction,scenarioId));setActive(null);setManualExit(null);setPlaying(false);}}>Reload playbook setup</button>}
            </fieldset>
          </details>
          {source==='recorded'&&<label className="block text-xs rounded-lg border border-amber-200 bg-amber-50 p-3"><input type="checkbox" checked={sampleValuation} onChange={e=>{setSampleValuation(e.target.checked);setActive(null);}}/> Use sample valuation for missing unit, multiplier or costs<p className="mt-1 text-slate-500">Only fills missing replay inputs using sample instrument valuation and zero costs. JPY/CAD pairs use fixed reference FX conversion, not historical conversion. Trade Log values stay unchanged; sample results are hypothetical.</p></label>}
          {(parsed.error||mismatch)&&<p role="alert" className="text-xs text-rose-700">{mismatch||parsed.error}</p>}
        </div>
      </Card>
      <div className="min-w-0 space-y-4">
        <Card title={`${entry?.symbol??symbol} · ${tf} · setup comparison`} sub="Compare selected Trade Log, playbook and AI setups on a shared timeline." right={<button type="button" className={btnSecondary} disabled={!active} onClick={()=>{multi.showFinal();resultSection.current?.scrollIntoView({behavior:'smooth',block:'start'});}}>Final results</button>}>
          <div className="flex gap-2 mb-3" role="group" aria-label="Comparison chart view"><button className={comparisonView==='candles'?btnPrimary:btnSecondary} aria-pressed={comparisonView==='candles'} onClick={()=>setComparisonView('candles')}>Candles &amp; setup levels</button><button className={comparisonView==='pnl'?btnPrimary:btnSecondary} aria-pressed={comparisonView==='pnl'} onClick={()=>setComparisonView('pnl')}>P&amp;L comparison</button></div>
          <p className="text-[11px] text-slate-500 mb-2">{time(last.t)} · Price {last.c.toFixed(feed.dp)}{current&&p?` · Change from entry ${current.priceChange.toFixed(2)}% · Entry ${p.entry.toFixed(feed.dp)}`:''}</p>
<div className="mb-3">{multi.controls}</div>{comparisonView==='candles'?<CandleChart bars={feed.bars} from={from} to={cursor} height={380} dp={feed.dp} lines={(multi.showAI&&sampleAI?aiAlternatives.flatMap(r=>[{price:r.position.target,label:r.name,color:r.color,dashed:true}] as PriceLine[]):[]).concat(lines.filter(l=>l.label.startsWith('AI')?multi.showAI&&!sampleAI:l.label.startsWith('Playbook')?false:multi.showLog).concat(multi.rows.flatMap(r=>r.position?[...(r.position.stop===null?[]:[{price:r.position.stop,label:r.name+' stop',color:r.color,dashed:true}] as PriceLine[]),...(r.position.target===null?[]:[{price:r.position.target,label:r.name+' target',color:r.color,dashed:true}] as PriceLine[])]:[])))} markers={(multi.showAI&&sampleAI?aiAlternatives.flatMap(r=>r.path.exit?[{index:r.path.exit.index,price:r.path.exit.price,kind:'exit' as const,color:r.color,label:r.name}] as Marker[]:[]):[]).concat(markers.filter(m=>m.label==='AI exit'?multi.showAI&&!sampleAI:m.label==='Playbook exit'?false:multi.showLog).concat(multi.rows.flatMap(r=>r.path?.exit?[{index:r.path.exit.index,price:r.path.exit.price,kind:'exit' as const,color:r.color,label:r.name}] as Marker[]:[])))} label="Position test price history" pnl={{series:[...(multi.showLog?[{name:source==='recorded'?'Trade Log setup':'Your stop / target',color:'#0284c7',points:visiblePoints.map(v=>({x:v.time,y:v.managedNet}))},{name:'Keep position open',color:'#b45309',dashed:true,points:visiblePoints.map(v=>({x:v.time,y:v.holdNet}))}]:[]),...multi.series,...(multi.showAI?aiSeries:[])],detail:t=>{const v=visiblePoints.find(v=>v.time===t),a=visibleAiPoints.find(v=>v.time===t);return v?<><p>Open: {usd(v.openNet)} · Realized: {usd(v.realizedNet)}</p><p>With exits: {usd(v.managedNet)} · Keep open: {usd(v.holdNet)}</p>{a&&<p>MarketSyde AI: {usd(a.managedNet)}</p>}<p>Remaining: {v.remaining} {p?.unit} · ROI: {p?.equity?`${(v.managedNet/p.equity*100).toFixed(2)}%`:'Unknown'}</p></>:<p>Before position test · P&amp;L unavailable</p>;}}}/>
          :<LineChart label="Setup net P&L comparison" height={340} yFmt={usd} xFmt={time} area={false} series={[...(multi.showLog&&path?[{name:'Trade Log setup',color:'#0284c7',points:path.points.map(v=>({x:v.time,y:v.managedNet}))}]:[]),...multi.series,...(multi.showAI?aiSeries:[])]}/>}
          <label className="block text-xs font-semibold mt-3">Replay timeline · {cursor} / {feed.bars.length}<input type="range" aria-label="Position replay timeline" aria-valuetext={`${cursor} of ${feed.bars.length}, ${time(last.t)}`} min={1} max={feed.bars.length} value={cursor} onChange={e=>{setCursor(Number(e.target.value));setPlaying(false);}} className="w-full accent-[#5338ec] mt-2"/></label>
          <div className="flex flex-wrap justify-center gap-2 mt-2" role="toolbar" aria-label="Position playback controls">
            <button className={btnSecondary} aria-label="Go to position start" disabled={!active} onClick={()=>{setPlaying(false);setCursor(active!.start+1);}}><RotateCcw size={15}/></button>
            <button className={btnSecondary} aria-label="Previous position bar" disabled={cursor<=1} onClick={()=>{setPlaying(false);setCursor(c=>c-1);}}><ChevronLeft size={15}/></button>
            <button className={btnPrimary} aria-label={playing?'Pause position replay':'Play position replay'} disabled={cursor>=feed.bars.length} onClick={()=>setPlaying(v=>!v)}>{playing?<Pause size={15}/>:<Play size={15}/>} {playing?'Pause':'Play'}</button>
            <button className={btnSecondary} aria-label="Next position bar" disabled={cursor>=feed.bars.length} onClick={()=>{setPlaying(false);setCursor(c=>c+1);}}><ChevronRight size={15}/></button>
            <select aria-label="Position replay speed" className={inputCls+' !w-auto'} value={speed} onChange={e=>setSpeed(Number(e.target.value))}>{[1,2,5,10].map(n=><option key={n} value={n}>{n}×</option>)}</select>
            <button className={btnSecondary} disabled={path?.status!=='open'} onClick={()=>{setPlaying(false);setManualExit(cursor-1);}}>Close test position here</button>
          </div>
          <div className="flex flex-wrap justify-between gap-2 text-[11px] text-slate-500 mt-3"><span>{active?`Monitoring from ${time(feed.bars[active.start].t)} · start at bar close`:'Choose a bar and start a position test.'}</span><button className="text-[#5338ec]" onClick={()=>setPathNumber(n=>n+1)}>New demo path</button></div>
          {path?.exit&&<p role="status" className="text-xs mt-2">{path.exit.reason} at {path.exit.price.toFixed(feed.dp)} · {time(feed.bars[path.exit.index].t)}. The comparison continues to track holding the original size.</p>}
          {current&&p?<>
            <div className="flex flex-wrap gap-5 text-xs mt-3"><span>With stop / target: <strong>{usd(current.managedNet)}</strong></span><span>Keep position open: <strong>{usd(current.holdNet)}</strong></span><span>Difference: <strong>{usd(current.managedNet-current.holdNet)}</strong></span></div>
            <details className="mt-3 text-xs"><summary className="text-[#5338ec] cursor-pointer">Price and P&amp;L data</summary><div className="overflow-auto max-h-52 mt-2"><table className="w-full text-left tabular-nums"><caption className="sr-only">Revealed position history</caption><thead><tr>{['Chart time (UTC)','Price','Price change','Open net','Realized net','With exits','Keep open'].map(h=><th key={h} className="p-2 whitespace-nowrap" scope="col">{h}</th>)}</tr></thead><tbody>{path?.points.map(v=><tr key={v.index}><td className="p-2 whitespace-nowrap"><button className="text-[#5338ec] underline" onClick={()=>{setPlaying(false);setCursor(v.index+1);}}>{time(v.time)}</button></td><td className="p-2">{v.price.toFixed(feed.dp)}</td><td className="p-2">{v.priceChange.toFixed(2)}%</td>{[v.openNet,v.realizedNet,v.managedNet,v.holdNet].map((n,i)=><td key={i} className="p-2">{usd(n)}</td>)}</tr>)}</tbody></table></div></details>
            <p className="text-[11px] text-slate-500 mt-3">P&amp;L = (chart price − entry) × {p.direction==='BUY'?'1':'−1'} × {p.quantity} {p.unit} × ${p.multiplier} − ${p.costs} estimated total costs. Account return uses the entered equity. Open P&amp;L is an estimated close value.</p>
          </>:<p className="text-sm text-slate-500 py-6">{path?.status==='before'?'Move the timeline to the position’s start or later.':'Comparisons update automatically from your selected setups.'}</p>}
        </Card>
        <div ref={resultSection}>{multi.results}</div>
        {multi.editor}
        <details className="rounded-xl border border-slate-200 p-4"><summary className="text-xs font-semibold text-purple-700 cursor-pointer">Historical outcome &amp; replay details</summary><Card title="Trade history vs position test vs MarketSyde AI" sub="Historical results are journal facts. Both replay columns use the same generated candles, entry bar, position size and costs.">
          <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-xs">
            <caption className="sr-only">Comparison of recorded trade, user position test and MarketSyde AI setup</caption>
            <thead><tr className="border-b text-left"><th scope="col" className="py-3 pr-3">Strategy and result</th><th scope="col" className="p-3">Recorded trade</th><th scope="col" className="p-3">Your position test</th><th scope="col" className="p-3">MarketSyde AI</th></tr></thead>
            <tbody>
              <tr className="border-b align-top"><th scope="row" className="py-3 pr-3 text-left">Strategy</th><td className="p-3 break-words">{entry?`${entry.date} · ${entry.strategy||'Strategy not recorded'}${entry.setupNotes?` · ${entry.setupNotes}`:''}`:'Choose a recorded trade to compare history.'}</td><td className="p-3 break-words">{book?.name??'Custom position setup'}{scenario?` · ${scenario.symbol} ${scenario.bias} scenario`:''}</td><td className="p-3 break-words">{aiRuleSummary}</td></tr>
              <tr className="border-b align-top"><th scope="row" className="py-3 pr-3 text-left">Direction and levels</th><td className="p-3">{entry?levels(entry.direction,entry.entryPrice,entry.stopPrice,entry.takeProfit,entry.exitPrice,feed.dp):'—'}</td><td className="p-3">{positionLevels}</td><td className="p-3">{aiLevels}</td></tr>
              <tr className="border-b align-top"><th scope="row" className="py-3 pr-3 text-left">Result</th><td className="p-3">{entry?`${recordedResult}${recordedNet===null?'':` · ${money(recordedNet,currencyOf(entry))}`}`:'—'}</td><td className="p-3">{current&&path?`${path.exit?'Realized':'Open · close estimate'} · ${usd(current.managedNet)}`:'Start the position test'}</td><td className="p-3">{aiCurrent&&aiPath?`${aiPath.exit?'Realized':'Open · close estimate'} · ${usd(aiCurrent.managedNet)}`:aiRule?'Start the position test':'Select an AI recommendation above'}</td></tr>
              <tr className="border-b align-top"><th scope="row" className="py-3 pr-3 text-left">R multiple</th><td className="p-3">{entry&&realizedR(entry)!==null?`${realizedR(entry)!.toFixed(2)}R`:'Unknown'}</td><td className="p-3">{current&&risk!==null&&risk>0?`${(current.managedNet/risk).toFixed(2)}R`:'Unknown'}</td><td className="p-3">{aiCurrent&&aiPosition?.stop!==null&&aiPosition?.stop!==undefined?`${(aiCurrent.managedNet/(Math.abs(aiPosition.entry-aiPosition.stop)*aiPosition.quantity*aiPosition.multiplier)).toFixed(2)}R`:'Unknown'}</td></tr>
              <tr className="align-top"><th scope="row" className="py-3 pr-3 text-left">Return on account</th><td className="p-3">{entry&&netRoiOf(entry)!==null?`${netRoiOf(entry)!.toFixed(2)}%`:'Unknown'}</td><td className="p-3">{current&&p?.equity?`${(current.managedNet/p.equity*100).toFixed(2)}%`:'Unknown'}</td><td className="p-3">{aiCurrent&&aiPosition?.equity?`${(aiCurrent.managedNet/aiPosition.equity*100).toFixed(2)}%`:'Unknown'}</td></tr>
            </tbody>
          </table></div>
          <p className="text-[11px] text-slate-500 mt-3">Recorded outcome uses the journal’s net P&amp;L and original account currency. Replay outcomes are USD estimates on synthetic candles; they are not historical fills or a performance claim. R and return show Unknown when the required risk or equity data is missing.</p>
          {aiRule&&source!=='recorded'&&<button type="button" disabled={!draft.stop.trim()} className={`${btnSecondary} mt-3`} onClick={()=>{edit(applyReplayPositionSetup(draft,replayRuleFields(aiRule),symbol));setAiRule(null);}}>Use AI exits in my editable draft</button>}
        </Card>
        </details>
        <details className="rounded-xl border border-slate-200 bg-white p-4 text-xs"><summary className="font-semibold text-[#5338ec] cursor-pointer">Setup context & execution assumptions</summary>
          <div className="mt-3 space-y-2 text-slate-600"><p>Playbook: {book?.name??'Unknown'} · selected scenario: {scenario?`${scenario.symbol} · ${scenario.status}`:'Template / trade levels'}.</p><p>Initial stop risk: {risk===null?'Unknown':usd(risk)}{riskPct===null?'':` (${riskPct.toFixed(2)}% of equity)`}. Playbook limit: {book?.riskPerTrade===undefined?'Unknown':`${book.riskPerTrade}%`}{riskPct!==null&&book?.riskPerTrade!==undefined?` · ${riskPct<=book.riskPerTrade+1e-8?'Within limit':'Above limit'}`:''}.</p><p>This test holds the entered size from the chosen chart bar and closes it fully at a stop, target or your manual close. Discretionary triggers, partial fills, trailing stops and session rules are available through strategy simulation where supported; they are not automatically applied here.</p><p>Stops take precedence if both levels occur in one candle. A gap through the stop closes at the bar’s open. No spread or slippage is added beyond your estimated costs. The chart’s final bar does not force a close.</p>{scenario&&<p>Written scenario: {scenario.hypothesis} Trigger: {scenario.trigger} · {scenario.createdAt}–{scenario.validUntil}. Written conditions require your review.</p>}</div>
        </details>
      </div>
    </div>
  </div>;
}

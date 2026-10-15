import { JournalHelp } from '../journal/JournalHelp';
import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw, FlaskConical } from 'lucide-react';
import type { JournalEntry } from '../../types';
import type { JournalPlaybook } from '../../data/journalPlaybooks';
import { SYMBOLS, symbolSpec } from '../../backtest/marketData';
import { compareDemo, createDemoFeed, demoProblem, demoSettings, demoTimeframe } from '../../backtest/demoReplay';
import { describeCondition, describeRules, mirrorCondition } from '../../backtest/rules';
import { Timeframe, TF_MS } from '../../backtest/types';
import { CandleChart } from './charts';
import { DemoPositionMonitor } from './DemoPositionMonitor';
import { TestPositionReplay } from './TestPositionReplay';
import { defaultPositionSetup, monitorDemo, planPosition, PositionSetup, resolvePositionSetup } from '../../backtest/demoPosition';
import { Card, Field, Pill, btnPrimary, btnSecondary, inputCls } from './ui';
import { recommendSetup, type RecommendationGoal } from '../../backtest/recommender';
import { MarketSydeRecommender } from './MarketSydeRecommender';
import {ReplaySetupTransfer} from './ReplaySetupTransfer';
import {ReplayAICoach} from './ReplayAICoach';
import {compareDemoStudy,demoClosedEquity} from '../../backtest/demoReplayStudy';
import {replayRuleFields,type RelatedReplaySetup} from '../../backtest/replaySetups';
import {DemoStudyResults,type DemoComparison} from './DemoStudyResults';

interface Props { entries: JournalEntry[]; playbooks: JournalPlaybook[]; initialEntryId?: string; initialMode?: 'position'|'strategy'; lockRecordedTrade?: boolean; }
const time = (t:number) => new Date(t).toISOString().replace('T',' ').slice(0,16) + ' UTC';
const usd = (n:number) => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(n);

export const DemoReplay: React.FC<Props> = (props) => {
  const [mode,setMode]=useState(props.initialMode??'position');
  if(props.lockRecordedTrade)return <TestPositionReplay {...props}/>;
  return <div className="space-y-4"><div className="flex flex-wrap gap-2" role="group" aria-label="Replay mode"><button className={mode==='position'?btnPrimary:btnSecondary} aria-pressed={mode==='position'} onClick={()=>setMode('position')}>Position replay</button><button className={mode==='strategy'?btnPrimary:btnSecondary} aria-pressed={mode==='strategy'} onClick={()=>setMode('strategy')}>Strategy simulation</button></div>{mode==='position'?<TestPositionReplay key={props.lockRecordedTrade?props.initialEntryId:'position'} {...props}/>:<StrategyReplay key={props.lockRecordedTrade?props.initialEntryId:'strategy'} {...props}/>}</div>;
}

const StrategyReplay: React.FC<Props> = props => props.lockRecordedTrade ? <TestPositionReplay {...props}/> : <StandaloneStrategyReplay {...props}/>;

const StandaloneStrategyReplay: React.FC<Props> = ({entries, playbooks, initialEntryId, lockRecordedTrade = false}) => {
  const initial = entries.find(e=>e.id===initialEntryId);
  const initialBook = playbooks.find(p=>p.name===initial?.strategy) ?? playbooks[0] ?? null;
  const [entryId,setEntryId] = useState(initial?.id ?? '');
  const [bookId,setBookId] = useState(initialBook?.id ?? playbooks[0]?.id ?? '');
  const [importedBookId,setImportedBookId] = useState('');
  const [symbol,setSymbol] = useState(symbolSpec(initial?.symbol ?? '')?.symbol ?? 'EUR/USD');
  const [tf,setTf] = useState<Timeframe>(demoTimeframe(initialBook));
  const [scenario,setScenario] = useState(1);
  const [cursor,setCursor] = useState(80);
  const [playing,setPlaying] = useState(false);
  const [speed,setSpeed] = useState(1);
  const [stop,setStop] = useState('1.5');
  const [target,setTarget] = useState(String(initialBook?.benchmarkRR ?? 2));
  const [commission,setCommission] = useState('0');
  const [positionSetup,setPositionSetup] = useState<PositionSetup>(()=>defaultPositionSetup(initialBook,initial));
  const [result,setResult] = useState<ReturnType<typeof compareDemoStudy> | null>(null);
  const [direction,setDirection]=useState<'both'|'long'|'short'>(initial?.direction==='SELL'?'short':initial?.direction==='BUY'?'long':'both');
  const [management,setManagement]=useState({breakeven:'',sessionStart:'',sessionEnd:'',maxTrades:'',dailyLoss:''});
  const [recommendationGoal,setRecommendationGoal] = useState<RecommendationGoal>('net');
  const [error,setError] = useState<string | null>(null);
  const entry = entries.find(e=>e.id===entryId);
  const book = playbooks.find(p=>p.id===bookId) ?? null;
  const importedBook = playbooks.find(p=>p.id===importedBookId);
  const feed = useMemo(()=>createDemoFeed(symbol,tf,`${entryId || 'sandbox'}:${scenario}`),[symbol,tf,entryId,scenario]);
  const baseline = useMemo(()=>{
    const settings=demoSettings(feed,book,entry?.direction??null);settings.rules.direction=direction;
    if(management.breakeven!=='')settings.rules.exits.breakevenAtR=Number(management.breakeven);
    if(management.maxTrades!=='')settings.rules.maxTradesPerDay=Number(management.maxTrades);
    if(management.sessionStart!==''&&management.sessionEnd!=='')settings.session={id:'custom',start:Number(management.sessionStart),end:Number(management.sessionEnd)};
    if(management.dailyLoss!=='')settings.risk.dailyLossPct=Number(management.dailyLoss)/Number(positionSetup.equity)*100;
    return settings;
  },[feed,book,entry?.direction,direction,management,positionSetup.equity]);
  const hypothesis = {stopAtr:positionSetup.scenarioKey?1.5:stop.trim() ? Number(stop) : NaN, targetR:positionSetup.scenarioKey?2:target.trim() ? Number(target) : NaN, commission:commission.trim() ? Number(commission) : NaN};
  const invalidManagement=Object.entries(management).some(([key,value])=>value!==''&&(!Number.isFinite(Number(value))||Number(value)<0||(!key.startsWith('session')&&Number(value)<=0)))||
    (management.maxTrades!==''&&!Number.isInteger(Number(management.maxTrades)))||
    ((management.sessionStart!==''||management.sessionEnd!=='')&&(management.sessionStart===''||management.sessionEnd===''||!Number.isInteger(Number(management.sessionStart))||!Number.isInteger(Number(management.sessionEnd))||Number(management.sessionStart)>23||Number(management.sessionEnd)>24||Number(management.sessionStart)===Number(management.sessionEnd)));
  const problem = demoProblem(hypothesis)||(invalidManagement?'Enter valid session hours and positive management limits.':null);
  const positionConfig = useMemo(()=>resolvePositionSetup(positionSetup,book,feed.symbol),[positionSetup,book,feed.symbol]);
  const snapshot = useMemo(()=>!problem && positionConfig.config ? monitorDemo(feed,baseline,hypothesis,positionConfig.config,cursor):null,[feed,baseline,positionConfig.config,cursor,stop,target,commission,problem]);
  // ATR still comes from revealed candles when a new, incomplete scenario draft is being edited.
  const draftAtr = useMemo(()=>{
    if(snapshot)return snapshot.atr;
    if(problem)return null;
    const fallback=resolvePositionSetup({...defaultPositionSetup(book),scenarioKey:''},book,feed.symbol);
    return fallback.config?monitorDemo(feed,baseline,hypothesis,fallback.config,cursor).atr:null;
  },[snapshot,problem,feed,baseline,book,cursor,stop,target,commission]);
  const plan = snapshot && positionConfig.config ? planPosition(feed,positionConfig.config,hypothesis,snapshot,cursor,baseline.rules.direction==='short'?'SELL':'BUY'):null;
  const updatePosition = (next:PositionSetup) => {setPositionSetup(next);setResult(null);setPlaying(false);setError(null);};
  const reset = () => {setCursor(80);setPlaying(false);setResult(null);setError(null);};
  useEffect(()=>{reset();},[feed,bookId]);
  useEffect(()=>{
    if (!playing) return;
    const timer = window.setInterval(()=>setCursor(c=>Math.min(feed.bars.length,c+1)),1000/speed);
    return ()=>window.clearInterval(timer);
  },[playing,speed,feed]);
  useEffect(()=>{if(cursor>=feed.bars.length)setPlaying(false);},[cursor,feed]);
  const chooseEntry = (id:string) => {
    setEntryId(id);
    const e = entries.find(e=>e.id===id), pb = playbooks.find(p=>p.name===e?.strategy);
    if(pb) {setBookId(pb.id);setTf(demoTimeframe(pb));setTarget(String(pb.benchmarkRR));}
    setPositionSetup(defaultPositionSetup(pb??book,e));
    setDirection(e?.direction==='SELL'?'short':e?.direction==='BUY'?'long':'both');
    if(e && symbolSpec(e.symbol))setSymbol(symbolSpec(e.symbol)!.symbol);
    reset();
  };
  const change = (set:(s:string)=>void,value:string) => {set(value);setResult(null);setError(null);};
  const transferSetup=(setup:RelatedReplaySetup|null)=>{
    if(!setup)return;
    setEntryId('');
    if(setup.playbookId)setBookId(setup.playbookId);
    if(setup.symbols.length)setSymbol(setup.symbols[0]);
    if(setup.timeframe)setTf(setup.timeframe);
    setDirection(setup.direction?setup.direction==='BUY'?'long':'short':'both');
    if(setup.targetR!==undefined)setTarget(String(setup.targetR));
    if(setup.stopAtr!==undefined)setStop(String(setup.stopAtr));
    else if(setup.stopFraction!==undefined)setStop(String((Number(stop)||1.5)*setup.stopFraction));
    setManagement({breakeven:setup.breakevenR===undefined?'':String(setup.breakevenR),sessionStart:setup.session?String(setup.session.start):'',sessionEnd:setup.session?String(setup.session.end):'',maxTrades:setup.maxTrades===undefined?'':String(setup.maxTrades),dailyLoss:setup.dailyLoss===undefined?'':String(setup.dailyLoss)});
    setPositionSetup(s=>({...s,scenarioKey:setup.prices?'custom':'',mode:setup.riskPercent!==undefined?'risk':s.mode,equity:setup.equity===undefined?s.equity:String(setup.equity),percent:setup.riskPercent===undefined?s.percent:String(setup.riskPercent),...(setup.prices?{bias:setup.direction==='SELL'?'short' as const:'long' as const,entry:String(setup.prices.entry),stop:String(setup.prices.stop),target:String(setup.prices.target)}:{})}));
    setResult(null);setPlaying(false);setError(null);
  };
  const test = () => {
    if(problem || positionConfig.error || !positionConfig.config){setError(problem || positionConfig.error || 'Complete the position setup.');return;}
    setPlaying(false);
    try {setResult(compareDemoStudy(feed,baseline,hypothesis,positionConfig.config));setCursor(feed.bars.length);setError(null);}
    catch(e){setError(e instanceof Error ? e.message : 'Demo test could not run.');}
  };
  const last = feed.bars[cursor-1], from = Math.max(0,cursor-(result?feed.bars.length:85));
  const markers = (snapshot?.trades ?? []).flatMap(t=>[
    {index:feed.bars.findIndex(b=>b.t===t.entryTime),price:t.entryPrice,kind:t.direction==='long' ? 'buy' as const : 'sell' as const},
    {index:feed.bars.findIndex(b=>b.t+(t.exitReason==='time'||t.exitReason==='session end'||t.exitReason==='signal'||t.exitReason==='rule limit'||t.exitReason==='end of test' ? TF_MS[tf] : 0)===t.exitTime),price:t.exitPrice,kind:'exit' as const},
  ]);
  if(snapshot?.position)markers.push({index:feed.bars.findIndex(b=>b.t===snapshot.position!.entryTime),price:snapshot.position.entry,kind:snapshot.position.direction==='BUY'?'buy':'sell'});
  const positionLines=snapshot?.position ? [{price:snapshot.position.entry,color:'#5338ec',label:'Entry'},{price:snapshot.position.stop,color:'#e11d48',label:'Stop',dashed:true},...(snapshot.position.target===null?[]:[{price:snapshot.position.target,color:'#059669',label:'Target',dashed:true}])] : [];
  const recommendationBaseline = result?.baselineMetrics??{netPnl:0,maxDD:0,winRate:0,trades:0};
  const recommendation = recommendSetup(result?.candidates??[],recommendationBaseline,recommendationGoal);
  const aiCandidate=result?.candidates.find(r=>r.id===recommendation.candidate?.id);
  const comparisons:DemoComparison[]=result?[{name:'Strategy baseline',color:'#64748b',run:result.baseline},{name:'Your hypothesis',color:'#0284c7',run:result.variant},...(aiCandidate?[{name:'MarketSyde AI',color:'#5338ec',run:aiCandidate.output}]:[])]:[];
  if(result&&importedBook)comparisons.push({name:`Imported playbook · ${importedBook.name}`,color:'#a855f7',run:result.variant});
  const equitySeries=comparisons.map(r=>({name:r.name,color:r.color,points:demoClosedEquity(feed,r.run,cursor)}));
  return <div className="space-y-4 text-[#0b1c30]" aria-label="Demo replay workspace">
    {!lockRecordedTrade&&<ReplaySetupTransfer entries={entries} playbooks={playbooks} onSelect={transferSetup}/>}
    {!result&&<ReplayAICoach entries={entries} symbol={symbol} excludeId={entryId} cutoff={entry?.entryTime?Date.parse(entry.entryTime):Infinity} onUse={rule=>{const fields=replayRuleFields(rule);if(fields.targetR!==undefined)setTarget(String(fields.targetR));if(fields.stopFraction!==undefined)setStop(String((Number(stop)||1.5)*fields.stopFraction));if(fields.breakevenR!==undefined)setManagement(m=>({...m,breakeven:String(fields.breakevenR)}));setResult(null);setPlaying(false);}}/>}
    {result && <MarketSydeRecommender recommendation={recommendation} baseline={recommendationBaseline} baselineName="your hypothesis on the first 70% of generated candles" goal={recommendationGoal} onGoal={setRecommendationGoal} money={usd} evidence={`${result.candidates.length} bounded exit setups. ${result.trainingBars} training bars; ${result.holdoutBars} holdout bars run independently with fresh balance and indicator warmup. Holdout does not rank candidates. One generated path is learning evidence, not live performance.${positionConfig.config?.scenario?' Absolute scenario levels are fixed, so ATR/target exploration is disabled.':''}`} action="Use AI parameters in my editable hypothesis" onUse={id=>{const candidate=result.candidates.find(c=>c.id===id);if(candidate){setStop(String(candidate.setup.stopAtr));setTarget(String(candidate.setup.targetR));setResult(null);setPlaying(false);setCursor(80);}}}/>}
    <div className="rounded-xl border border-[#5338ec]/20 bg-[#FBFAFF] px-4 py-3 text-xs leading-relaxed"><Pill tone="accent">Simulated demo data</Pill><span className="ml-2">Generated candles, not historical or live prices. Recorded trades are reference only. Tests do not change journal records, playbooks, statistics, credits or points.</span></div>
    <div className="grid grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)] gap-4 items-start">
      <Card title="Playback" sub="Select a recorded strategy or practise freely.">
        <div className="space-y-3">
          <Field label={lockRecordedTrade?'Selected Trade Log entry':'Recorded trade'} hint={lockRecordedTrade?'Linked to the trade you opened. Close this replay to choose another journal entry.':undefined}><select aria-label="Replay recorded trade" disabled={lockRecordedTrade} value={entryId} onChange={e=>chooseEntry(e.target.value)} className={inputCls}>{!lockRecordedTrade&&<option value="">Free demo</option>}{entries.filter(e=>!lockRecordedTrade||e.id===initialEntryId).map(e=><option key={e.id} value={e.id}>{e.date} · {e.symbol} · {e.strategy || 'No strategy'} · {e.direction} · {e.assetClass} · #{e.id.slice(-6)}</option>)}</select></Field>
          {entry && <div className="text-xs rounded-lg bg-slate-50 p-3 space-y-1"><p className="font-semibold">Recorded reference · {entry.direction}</p><p>{entry.symbol} · {entry.strategy || 'No strategy recorded'}</p><p>Entry: {Number.isFinite(entry.entryPrice) ? entry.entryPrice : 'Unknown'}</p><p>Exit: {entry.exitPrice ?? 'Not recorded'}</p><p className="text-slate-500">These prices are not executions on the demo chart.</p>{!symbolSpec(entry.symbol) && <p className="text-amber-700">No instrument mapping. Select a separate demo instrument below.</p>}{!playbooks.some(p=>p.name===entry.strategy) && <p className="text-amber-700">Recorded strategy has no linked playbook. Choose a demo template; it does not evaluate the original strategy.</p>}</div>}
          <Field label="Demo instrument"><select aria-label="Demo instrument" disabled={lockRecordedTrade} value={symbol} onChange={e=>{setSymbol(e.target.value);setPositionSetup(s=>({...s,quantity:''}));}} className={inputCls}>{SYMBOLS.map(s=><option key={s.symbol}>{s.symbol}</option>)}</select></Field>
          {entry && symbol !== entry.symbol && symbolSpec(entry.symbol) && <p className="text-xs text-slate-500">Demo instrument: {symbol}. Valuation uses its own contract specification, not the recorded account.</p>}
          <Field label="Import playbook setup" hint="Keep the selected trade and compare with the same entry and exit setup."><select aria-label="Import playbook setup" value={importedBookId} onChange={e=>setImportedBookId(e.target.value)} className={inputCls}><option value="">Choose a playbook…</option>{playbooks.map(p=><option key={p.id} value={p.id}>{p.name} · {p.style}</option>)}</select></Field>
          <p className="text-xs text-slate-500">Source strategy: {book?.name ?? 'Generic breakout'}</p>
          <Field label="Demo bar size"><select aria-label="Demo bar size" value={tf} onChange={e=>setTf(e.target.value as Timeframe)} className={inputCls}>{['1m','5m','15m','1h','4h','1D'].map(t=><option key={t}>{t}</option>)}</select></Field>
          <button className={`${btnSecondary} w-full`} onClick={()=>setScenario(s=>s+1)}><RotateCcw size={14}/>New demo path</button>
          <p className="text-[11px] text-slate-500">Demo path {scenario} · {feed.bars.length} generated bars · UTC</p>
        </div>
      </Card>
      <div className="min-w-0 space-y-4">
        <Card title={`${feed.symbol} · ${tf}`} sub={result?'Price and cumulative closed net P&L on the same generated timeline. Independent price and USD scales.':'Slide backwards or forwards; future candles stay hidden during playback.'} right={<Pill tone="accent">Demo</Pill>}>
          <p className="text-[11px] tabular-nums text-slate-500 mb-2">{time(last.t)} · O {last.o.toFixed(feed.dp)} · H {last.h.toFixed(feed.dp)} · L {last.l.toFixed(feed.dp)} · C {last.c.toFixed(feed.dp)}</p>
          <CandleChart bars={feed.bars} from={from} to={cursor} dp={feed.dp} height={300} label="Simulated replay candlesticks" markers={markers} lines={positionLines} pnl={result?{series:equitySeries,detail:t=><>{equitySeries.map(s=><p key={s.name}>{s.name}: {usd(s.points.find(p=>p.x===t)?.y??0)}</p>)}</>}:undefined}/>
          {importedBook&&<div className="mt-3 rounded-xl border border-purple-200 bg-purple-50/40 p-3" aria-label="Imported playbook comparison"><p className="text-sm font-semibold">{importedBook.name} · matched execution comparison</p><p className="text-xs text-slate-500 mt-1">Uses your hypothesis entries, exits, quantity and costs on the same candles. Results match because execution settings are shared; curves overlap. Imported playbook rules are a practice guide, not separately executed signals.</p>{result?<div className="mt-3"><DemoStudyResults runs={comparisons.filter(r=>r.name==='Your hypothesis'||r.name.startsWith('Imported playbook'))}/></div>:<p className="text-xs mt-2">Test the hypothesis below to display both results on this chart.</p>}<details className="text-xs mt-2"><summary className="cursor-pointer text-purple-700">Imported playbook rules<JournalHelp label="Imported playbook rules" /></summary><p className="mt-2">{describeRules(demoSettings(feed,importedBook,entry?.direction??null).rules).map(r=>`${r.label}: ${r.text}`).join(' · ')}</p></details></div>}          <svg viewBox="0 0 760 48" role="img" aria-label="Generated demo volume, not market volume" className="w-full h-auto border-t border-slate-100"><title>Generated demo volume; exact values are in visible candle data</title>{feed.bars.slice(from,cursor).map((b,i)=>{const width=690/(cursor-from), h=b.v/1000*42;return <rect key={b.t} x={8+i*width} y={48-h} width={Math.max(1,width*0.7)} height={h} fill={b.c>=b.o?'#059669':'#e11d48'} opacity={0.6}/>;})}</svg>
          <div className="flex justify-between text-[10px] text-slate-500"><span>{time(feed.bars[from].t)}</span><span>{time(last.t)}</span></div>
          <label className="block text-xs font-semibold mt-3">Replay timeline · {cursor} / {feed.bars.length}<input type="range" aria-label="Replay timeline" aria-valuetext={`${cursor} of ${feed.bars.length} bars, ${time(last.t)}`} min={1} max={feed.bars.length} value={cursor} onChange={e=>{setPlaying(false);setCursor(Number(e.target.value));}} className="w-full accent-[#5338ec] mt-2"/></label>
          <div className="flex flex-wrap justify-center gap-2 mt-2" role="toolbar" aria-label="Demo playback controls">
            <button className={btnSecondary} aria-label="Restart demo playback" onClick={()=>{setPlaying(false);setCursor(1);}}><RotateCcw size={16}/></button>
            <button className={btnSecondary} aria-label="Previous demo bar" disabled={cursor<=1} onClick={()=>{setPlaying(false);setCursor(c=>Math.max(1,c-1));}}><ChevronLeft size={16}/></button>
            <button className={btnPrimary} aria-label={playing?'Pause demo playback':'Play demo playback'} disabled={cursor>=feed.bars.length} onClick={()=>setPlaying(v=>!v)}>{playing?<Pause size={16}/>:<Play size={16}/>} {playing?'Pause':'Play'}</button>
            <button className={btnSecondary} aria-label="Next demo bar" disabled={cursor>=feed.bars.length} onClick={()=>{setPlaying(false);setCursor(c=>Math.min(feed.bars.length,c+1));}}><ChevronRight size={16}/></button>
            <select aria-label="Demo playback speed" value={speed} onChange={e=>setSpeed(Number(e.target.value))} className="h-9 border border-slate-200 rounded-lg px-2 text-xs">{[1,2,5,10].map(s=><option key={s} value={s}>{s}×</option>)}</select>
          </div>
          <details className="mt-3 text-xs"><summary className="cursor-pointer text-[#5338ec]">Visible candle data and volume</summary><div className="overflow-x-auto max-h-44 mt-2"><table className="w-full text-left tabular-nums"><caption className="sr-only">Visible simulated candles only</caption><thead><tr>{['Time (UTC)','Open','High','Low','Close','Volume'].map(h=><th scope="col" key={h} className="p-2">{h}</th>)}</tr></thead><tbody>{feed.bars.slice(from,cursor).map(b=><tr key={b.t}><td className="p-2 whitespace-nowrap">{time(b.t)}</td>{[b.o,b.h,b.l,b.c].map((p,i)=><td key={i} className="p-2">{p.toFixed(feed.dp)}</td>)}<td className="p-2">{b.v}</td></tr>)}</tbody></table></div></details>
        </Card>
        <DemoPositionMonitor feed={feed} book={book} entry={entry} setup={positionSetup} onChange={updatePosition} snapshot={snapshot} plan={plan} scenario={positionConfig.scenario} error={positionConfig.error||problem} cursor={cursor} hypothesis={hypothesis} atr={draftAtr}/>
        <Card title="Test a strategy hypothesis" sub="Compare a strategy template with a different stop and target on the same demo path.">
          <p className="text-xs font-semibold">{book?.name ?? 'Generic breakout'} · {baseline.rules.direction} · {tf}</p>
          <p className="text-xs text-slate-500 mt-1">Simplified executable template, not automatic interpretation of every written playbook rule. {baseline.rules.entry.map(c=>describeCondition(baseline.rules.direction==='short'?mirrorCondition(c):c)).join('; ')}. {baseline.rules.direction==='both'?'Long rules shown; short conditions are mirrored. ':''}{baseline.rules.entryOrder.type==='market'?'Market orders fill at the next bar open.':`Template ${baseline.rules.entryOrder.type} orders become eligible on the next bar; price must reach the order level before expiry.`}</p>
          <p className="text-xs text-slate-500 mt-1">Baseline: {describeRules(baseline.rules).filter(r=>r.label==='Stop loss'||r.label==='Take profit'||r.label==='Manage').map(r=>`${r.label}: ${r.text}`).join(' ')} {book?.window ? `Session: ${book.window.label} (${book.window.start}–${book.window.end} UTC).` : 'Any session.'}</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
            <Field label="Hypothesis direction"><select aria-label="Hypothesis direction" value={direction} onChange={e=>{setDirection(e.target.value as typeof direction);setResult(null);}} className={inputCls}><option value="both">Long + short</option><option value="long">Long</option><option value="short">Short</option></select></Field>
            <Field label="Hypothesis stop (ATR)"><input type="number" aria-label="Hypothesis stop ATR" disabled={!!positionSetup.scenarioKey} min="0.1" max="10" step="0.1" value={stop} onChange={e=>change(setStop,e.target.value)} className={inputCls}/></Field>
            <Field label="Hypothesis target (R)"><input type="number" aria-label="Hypothesis target R" disabled={!!positionSetup.scenarioKey} min="0.1" max="20" step="0.1" value={target} onChange={e=>change(setTarget,e.target.value)} className={inputCls}/></Field>
            <Field label="Commission ($/unit/side)"><input type="number" aria-label="Demo commission per unit per side" min="0" max="100" step="0.01" value={commission} onChange={e=>change(setCommission,e.target.value)} className={inputCls}/></Field>
          </div>
          <details className="text-xs mt-3"><summary className="cursor-pointer text-[#5338ec] font-semibold">Editable session & management</summary><div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">{([['breakeven','Breakeven at R'],['sessionStart','Session start UTC'],['sessionEnd','Session end UTC'],['maxTrades','Max trades per day'],['dailyLoss','Max daily loss USD']] as const).map(([key,label])=><Field key={key} label={label}><input type="number" aria-label={`Demo ${label}`} value={management[key]} onChange={e=>{setManagement(m=>({...m,[key]:e.target.value}));setResult(null);}} className={inputCls}/></Field>)}</div><p className="text-[11px] text-slate-500 mt-2">Blank uses the strategy default. Daily loss USD is adapted to a percentage of entered demo equity. A losses-in-a-day What-if rule and mistake tags require manual review and are not automatic strategy filters.</p></details>
          <p className="text-[11px] text-slate-500 mt-2">Both tests use the position monitor’s demo equity and sizing settings, with identical commissions and zero spread/slippage. {positionSetup.scenarioKey?'The hypothesis uses the scenario bias and absolute price levels instead of ATR/target-R inputs. ':''}Other template management rules stay unchanged. Stops win same-bar ties; open positions close at the test end.</p>
          {(error || problem) && <p role="alert" className="text-xs text-rose-700 mt-2">{error || problem}</p>}
          <button className={`${btnPrimary} mt-3`} onClick={test} disabled={!!problem||!!positionConfig.error}><FlaskConical size={16}/>Test hypothesis · reveal full demo</button>
          {result&&<div className="mt-4"><DemoStudyResults runs={comparisons}/>{!aiCandidate&&<p className="text-xs text-slate-500 mt-2">MarketSyde AI has no qualifying alternative for this goal. Review the evidence above; your hypothesis stays unchanged.</p>}</div>}
          {result && <div className="mt-4" role="region" aria-label="Demo hypothesis comparison"><p role="status" className="text-xs font-semibold">Demo comparison complete · all {feed.bars.length} bars · no evidence of a live trading edge</p>{result.variant.zeroTradeReason && <p className="text-xs text-slate-500 mt-2">Hypothesis: {result.variant.zeroTradeReason}</p>}<details className="text-xs mt-3"><summary className="text-[#5338ec] cursor-pointer">Hypothesis execution ledger ({result.variant.trades.length})</summary><div className="overflow-x-auto max-h-44 mt-2"><table className="w-full text-left"><thead><tr>{['Side','Entry UTC','Exit UTC','Entry','Exit','Reason','Net USD','R'].map(h=><th scope="col" key={h} className="p-2 whitespace-nowrap">{h}</th>)}</tr></thead><tbody>{result.variant.trades.map(t=><tr key={t.id}><td className="p-2">{t.direction==='long'?'BUY':'SELL'}</td><td className="p-2 whitespace-nowrap">{time(t.entryTime)}</td><td className="p-2 whitespace-nowrap">{time(t.exitTime)}</td><td className="p-2">{t.entryPrice.toFixed(feed.dp)}</td><td className="p-2">{t.exitPrice.toFixed(feed.dp)}</td><td className="p-2">{t.exitReason}{t.ambiguous?' · stop-first tie':''}</td><td className="p-2">{usd(t.net)}</td><td className="p-2">{t.r.toFixed(2)}</td></tr>)}</tbody></table></div></details><p className="text-[11px] text-slate-500 mt-2">Chart markers show hypothesis executions only, not recorded fills. Generated volume is not market volume. No-news rules and other written discretionary rules are not evaluated.</p></div>}
        </Card>
      </div>
    </div>
  </div>;
}

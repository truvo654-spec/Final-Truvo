import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw, FlaskConical } from 'lucide-react';
import type { JournalEntry } from '../../types';
import type { JournalPlaybook } from '../../data/journalPlaybooks';
import { SYMBOLS, symbolSpec } from '../../backtest/marketData';
import { compareDemo, createDemoFeed, demoProblem, demoSettings, demoTimeframe } from '../../backtest/demoReplay';
import { describeCondition, describeRules, mirrorCondition } from '../../backtest/rules';
import { Timeframe, RunResult, TF_MS } from '../../backtest/types';
import { CandleChart } from './charts';
import { DemoPositionMonitor } from './DemoPositionMonitor';
import { TestPositionReplay } from './TestPositionReplay';
import { defaultPositionSetup, monitorDemo, planPosition, PositionSetup, resolvePositionSetup } from '../../backtest/demoPosition';
import { Card, Field, Pill, btnPrimary, btnSecondary, inputCls } from './ui';

interface Props { entries: JournalEntry[]; playbooks: JournalPlaybook[]; initialEntryId?: string; initialMode?: 'position'|'strategy'; }
const time = (t:number) => new Date(t).toISOString().replace('T',' ').slice(0,16) + ' UTC';
const usd = (n:number) => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(n);

export function DemoReplay(props:Props) {
  const [mode,setMode]=useState(props.initialMode??'position');
  return <div className="space-y-4"><div className="flex flex-wrap gap-2" role="group" aria-label="Replay mode"><button className={mode==='position'?btnPrimary:btnSecondary} aria-pressed={mode==='position'} onClick={()=>setMode('position')}>Position replay</button><button className={mode==='strategy'?btnPrimary:btnSecondary} aria-pressed={mode==='strategy'} onClick={()=>setMode('strategy')}>Strategy simulation</button></div>{mode==='position'?<TestPositionReplay {...props}/>:<StrategyReplay {...props}/>}</div>;
}

function StrategyReplay({entries, playbooks, initialEntryId}: Props) {
  const initial = entries.find(e=>e.id===initialEntryId);
  const initialBook = playbooks.find(p=>p.name===initial?.strategy) ?? playbooks[0] ?? null;
  const [entryId,setEntryId] = useState(initial?.id ?? '');
  const [bookId,setBookId] = useState(initialBook?.id ?? playbooks[0]?.id ?? '');
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
  const [result,setResult] = useState<ReturnType<typeof compareDemo> | null>(null);
  const [error,setError] = useState<string | null>(null);
  const entry = entries.find(e=>e.id===entryId);
  const book = playbooks.find(p=>p.id===bookId) ?? null;
  const feed = useMemo(()=>createDemoFeed(symbol,tf,`${entryId || 'sandbox'}:${scenario}`),[symbol,tf,entryId,scenario]);
  const baseline = useMemo(()=>demoSettings(feed,book,entry?.direction ?? null),[feed,book,entry?.direction]);
  const hypothesis = {stopAtr:positionSetup.scenarioKey?1.5:stop.trim() ? Number(stop) : NaN, targetR:positionSetup.scenarioKey?2:target.trim() ? Number(target) : NaN, commission:commission.trim() ? Number(commission) : NaN};
  const problem = demoProblem(hypothesis);
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
    if(e && symbolSpec(e.symbol))setSymbol(symbolSpec(e.symbol)!.symbol);
    reset();
  };
  const change = (set:(s:string)=>void,value:string) => {set(value);setResult(null);setError(null);};
  const test = () => {
    if(problem || positionConfig.error || !positionConfig.config){setError(problem || positionConfig.error || 'Complete the position setup.');return;}
    setPlaying(false);
    try {setResult(compareDemo(feed,baseline,hypothesis,positionConfig.config));setCursor(feed.bars.length);setError(null);}
    catch(e){setError(e instanceof Error ? e.message : 'Demo test could not run.');}
  };
  const last = feed.bars[cursor-1], from = Math.max(0,cursor-85);
  const markers = (snapshot?.trades ?? []).flatMap(t=>[
    {index:feed.bars.findIndex(b=>b.t===t.entryTime),price:t.entryPrice,kind:t.direction==='long' ? 'buy' as const : 'sell' as const},
    {index:feed.bars.findIndex(b=>b.t+(t.exitReason==='time'||t.exitReason==='session end'||t.exitReason==='signal'||t.exitReason==='rule limit'||t.exitReason==='end of test' ? TF_MS[tf] : 0)===t.exitTime),price:t.exitPrice,kind:'exit' as const},
  ]);
  if(snapshot?.position)markers.push({index:feed.bars.findIndex(b=>b.t===snapshot.position!.entryTime),price:snapshot.position.entry,kind:snapshot.position.direction==='BUY'?'buy':'sell'});
  const positionLines=snapshot?.position ? [{price:snapshot.position.entry,color:'#5338ec',label:'Entry'},{price:snapshot.position.stop,color:'#e11d48',label:'Stop',dashed:true},...(snapshot.position.target===null?[]:[{price:snapshot.position.target,color:'#059669',label:'Target',dashed:true}])] : [];
  const net = (r:RunResult) => r.endBalance-r.startBalance;
  return <div className="space-y-4 text-[#0b1c30]" aria-label="Demo replay workspace">
    <div className="rounded-xl border border-[#5338ec]/20 bg-[#FBFAFF] px-4 py-3 text-xs leading-relaxed"><Pill tone="accent">Simulated demo data</Pill><span className="ml-2">Generated candles, not historical or live prices. Recorded trades are reference only. Tests do not change journal records, playbooks, statistics, credits or points.</span></div>
    <div className="grid grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)] gap-4 items-start">
      <Card title="Playback" sub="Select a recorded strategy or practise freely.">
        <div className="space-y-3">
          <Field label="Recorded trade"><select aria-label="Replay recorded trade" value={entryId} onChange={e=>chooseEntry(e.target.value)} className={inputCls}><option value="">Free demo</option>{entries.map(e=><option key={e.id} value={e.id}>{e.date} · {e.symbol} · {e.strategy || 'No strategy'} · {e.direction} · {e.assetClass} · #{e.id.slice(-6)}</option>)}</select></Field>
          {entry && <div className="text-xs rounded-lg bg-slate-50 p-3 space-y-1"><p className="font-semibold">Recorded reference · {entry.direction}</p><p>{entry.symbol} · {entry.strategy || 'No strategy recorded'}</p><p>Entry: {Number.isFinite(entry.entryPrice) ? entry.entryPrice : 'Unknown'}</p><p>Exit: {entry.exitPrice ?? 'Not recorded'}</p><p className="text-slate-500">These prices are not executions on the demo chart.</p>{!symbolSpec(entry.symbol) && <p className="text-amber-700">No instrument mapping. Select a separate demo instrument below.</p>}{!playbooks.some(p=>p.name===entry.strategy) && <p className="text-amber-700">Recorded strategy has no linked playbook. Choose a demo template; it does not evaluate the original strategy.</p>}</div>}
          <Field label="Demo instrument"><select aria-label="Demo instrument" value={symbol} onChange={e=>{setSymbol(e.target.value);setPositionSetup(s=>({...s,quantity:''}));}} className={inputCls}>{SYMBOLS.map(s=><option key={s.symbol}>{s.symbol}</option>)}</select></Field>
          {entry && symbol !== entry.symbol && symbolSpec(entry.symbol) && <p className="text-xs text-slate-500">Demo instrument: {symbol}. Valuation uses its own contract specification, not the recorded account.</p>}
          <Field label="Strategy template"><select aria-label="Demo strategy template" value={bookId} onChange={e=>{setBookId(e.target.value);const b=playbooks.find(p=>p.id===e.target.value)??null;setTf(demoTimeframe(b));setTarget(String(b?.benchmarkRR??2));setPositionSetup(s=>({...defaultPositionSetup(b,entry),equity:s.equity}));}} className={inputCls}>{!playbooks.length && <option value="">Generic breakout</option>}{playbooks.map(p=><option key={p.id} value={p.id}>{p.name} · {p.style}</option>)}</select></Field>
          <Field label="Demo bar size"><select aria-label="Demo bar size" value={tf} onChange={e=>setTf(e.target.value as Timeframe)} className={inputCls}>{['1m','5m','15m','1h','4h','1D'].map(t=><option key={t}>{t}</option>)}</select></Field>
          <button className={`${btnSecondary} w-full`} onClick={()=>setScenario(s=>s+1)}><RotateCcw size={14}/>New demo path</button>
          <p className="text-[11px] text-slate-500">Demo path {scenario} · {feed.bars.length} generated bars · UTC</p>
        </div>
      </Card>
      <div className="min-w-0 space-y-4">
        <Card title={`${feed.symbol} · ${tf}`} sub="Slide backwards or forwards; future candles stay hidden during playback." right={<Pill tone="accent">Demo</Pill>}>
          <p className="text-[11px] tabular-nums text-slate-500 mb-2">{time(last.t)} · O {last.o.toFixed(feed.dp)} · H {last.h.toFixed(feed.dp)} · L {last.l.toFixed(feed.dp)} · C {last.c.toFixed(feed.dp)}</p>
          <CandleChart bars={feed.bars} from={from} to={cursor} dp={feed.dp} height={300} label="Simulated replay candlesticks" markers={markers} lines={positionLines}/>
          <svg viewBox="0 0 760 48" role="img" aria-label="Generated demo volume, not market volume" className="w-full h-auto border-t border-slate-100"><title>Generated demo volume; exact values are in visible candle data</title>{feed.bars.slice(from,cursor).map((b,i)=>{const width=690/(cursor-from), h=b.v/1000*42;return <rect key={b.t} x={8+i*width} y={48-h} width={Math.max(1,width*0.7)} height={h} fill={b.c>=b.o?'#059669':'#e11d48'} opacity={0.6}/>;})}</svg>
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
            <Field label="Hypothesis stop (ATR)"><input type="number" aria-label="Hypothesis stop ATR" disabled={!!positionSetup.scenarioKey} min="0.1" max="10" step="0.1" value={stop} onChange={e=>change(setStop,e.target.value)} className={inputCls}/></Field>
            <Field label="Hypothesis target (R)"><input type="number" aria-label="Hypothesis target R" disabled={!!positionSetup.scenarioKey} min="0.1" max="20" step="0.1" value={target} onChange={e=>change(setTarget,e.target.value)} className={inputCls}/></Field>
            <Field label="Commission ($/unit/side)"><input type="number" aria-label="Demo commission per unit per side" min="0" max="100" step="0.01" value={commission} onChange={e=>change(setCommission,e.target.value)} className={inputCls}/></Field>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Both tests use the position monitor’s demo equity and sizing settings, with identical commissions and zero spread/slippage. {positionSetup.scenarioKey?'The hypothesis uses the scenario bias and absolute price levels instead of ATR/target-R inputs. ':''}Other template management rules stay unchanged. Stops win same-bar ties; open positions close at the test end.</p>
          {(error || problem) && <p role="alert" className="text-xs text-rose-700 mt-2">{error || problem}</p>}
          <button className={`${btnPrimary} mt-3`} onClick={test} disabled={!!problem||!!positionConfig.error}><FlaskConical size={16}/>Test hypothesis · reveal full demo</button>
          {result && <div className="mt-4" role="region" aria-label="Demo hypothesis comparison"><p role="status" className="text-xs font-semibold">Demo comparison complete · all {feed.bars.length} bars · no evidence of a live trading edge</p><div className="overflow-x-auto mt-2"><table className="w-full text-xs text-left"><caption className="sr-only">Strategy baseline versus stop and target hypothesis, simulated USD account</caption><thead><tr>{['Test','Trades','Net P&L (USD)','Account return','Average R'].map(h=><th key={h} scope="col" className="p-2 bg-slate-50">{h}</th>)}</tr></thead><tbody>{([['Strategy baseline',result.baseline],['Stop / target hypothesis',result.variant]] as [string,RunResult][]).map(([name,r])=><tr key={name} className="border-t border-slate-100"><th scope="row" className="p-2">{name}</th><td className="p-2">{r.trades.length}</td><td className="p-2 tabular-nums">{usd(net(r))}</td><td className="p-2">{(net(r)/r.startBalance*100).toFixed(2)}%</td><td className="p-2">{r.trades.length ? (r.trades.reduce((s,t)=>s+t.r,0)/r.trades.length).toFixed(2)+'R' : 'Unknown'}</td></tr>)}</tbody></table></div>{result.variant.zeroTradeReason && <p className="text-xs text-slate-500 mt-2">Hypothesis: {result.variant.zeroTradeReason}</p>}<details className="text-xs mt-3"><summary className="text-[#5338ec] cursor-pointer">Hypothesis execution ledger ({result.variant.trades.length})</summary><div className="overflow-x-auto max-h-44 mt-2"><table className="w-full text-left"><thead><tr>{['Side','Entry UTC','Exit UTC','Entry','Exit','Reason','Net USD','R'].map(h=><th scope="col" key={h} className="p-2 whitespace-nowrap">{h}</th>)}</tr></thead><tbody>{result.variant.trades.map(t=><tr key={t.id}><td className="p-2">{t.direction==='long'?'BUY':'SELL'}</td><td className="p-2 whitespace-nowrap">{time(t.entryTime)}</td><td className="p-2 whitespace-nowrap">{time(t.exitTime)}</td><td className="p-2">{t.entryPrice.toFixed(feed.dp)}</td><td className="p-2">{t.exitPrice.toFixed(feed.dp)}</td><td className="p-2">{t.exitReason}{t.ambiguous?' · stop-first tie':''}</td><td className="p-2">{usd(t.net)}</td><td className="p-2">{t.r.toFixed(2)}</td></tr>)}</tbody></table></div></details><p className="text-[11px] text-slate-500 mt-2">Chart markers show hypothesis executions only, not recorded fills. Generated volume is not market volume. No-news rules and other written discretionary rules are not evaluated.</p></div>}
        </Card>
      </div>
    </div>
  </div>;
}

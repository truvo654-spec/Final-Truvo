import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause, RotateCcw } from 'lucide-react';
import type { JournalEntry } from '../../types';
import type { JournalPlaybook } from '../../data/journalPlaybooks';
import { SYMBOLS, symbolSpec, resolveSymbol } from '../../backtest/marketData';
import { createDemoFeed, demoTimeframe } from '../../backtest/demoReplay';
import { PositionDraft, TestPosition, parsePositionDraft, playbookPositionDraft, positionPath, recordedPositionDraft } from '../../backtest/positionReplay';
import type { Timeframe } from '../../backtest/types';
import { currencyOf, eligible, rawNet } from '../journal/journalMath';
import { CandleChart, Marker, PriceLine } from './charts';
import { Card, Field, Pill, btnPrimary, btnSecondary, inputCls } from './ui';

const usd=(n:number)=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(n);
const time=(t:number)=>new Date(t).toISOString().replace('T',' ').slice(0,16)+' UTC';
interface Props {entries:JournalEntry[];playbooks:JournalPlaybook[];initialEntryId?:string;}
export function TestPositionReplay({entries,playbooks,initialEntryId}:Props) {
  const initial=entries.find(e=>e.id===initialEntryId),firstBook=playbooks.find(b=>b.name===initial?.strategy)??playbooks[0]??null;
  const [entryId,setEntryId]=useState(initial?.id??'');
  const [bookId,setBookId]=useState(firstBook?.id??'');
  const [source,setSource]=useState<'recorded'|'playbook'>(initial?'recorded':'playbook');
  const [scenarioId,setScenarioId]=useState('');
  const [symbol,setSymbol]=useState(resolveSymbol(initial?.symbol??'')??'EUR/USD');
  const [tf,setTf]=useState<Timeframe>(demoTimeframe(firstBook));
  const [pathNumber,setPathNumber]=useState(1),[cursor,setCursor]=useState(80);
  const [playing,setPlaying]=useState(false),[speed,setSpeed]=useState(1);
  const entry=entries.find(e=>e.id===entryId),book=playbooks.find(b=>b.id===bookId)??null;
  const feed=useMemo(()=>createDemoFeed(symbol,tf,`${entryId||'sandbox'}:${pathNumber}`),[symbol,tf,entryId,pathNumber]);
  const [draft,setDraft]=useState<PositionDraft>(()=>initial?recordedPositionDraft(initial):playbookPositionDraft(feed,firstBook,80));
  const [active,setActive]=useState<{position:TestPosition;start:number}|null>(null);
  const [manualExit,setManualExit]=useState<number|null>(null);
  useEffect(()=>{
    setDraft(source==='recorded'&&entry?recordedPositionDraft(entry):playbookPositionDraft(feed,book,80,'BUY',scenarioId));
    setActive(null);setManualExit(null);setPlaying(false);setCursor(80);
  },[feed,book,entry,source,scenarioId]);
  useEffect(()=>{
    if(!playing)return;
    const timer=window.setInterval(()=>setCursor(v=>Math.min(feed.bars.length,v+1)),1000/speed);
    return ()=>window.clearInterval(timer);
  },[playing,speed,feed]);
  useEffect(()=>{if(cursor>=feed.bars.length)setPlaying(false);},[cursor,feed]);
  const edit=(patch:Partial<PositionDraft>)=>{setDraft(d=>({...d,...patch}));setActive(null);setManualExit(null);setPlaying(false);};
  const parsed=parsePositionDraft(draft),scenario=book?.scenarios?.find(s=>s.id===scenarioId);
  const spec=symbolSpec(symbol)!;
  const quantity=Number(draft.quantity);
  const demoQuantity=draft.unit===spec.sizeUnit&&Number(draft.multiplier)===spec.multiplier;
  const mismatch=source==='recorded'&&!entry?'Choose a recorded trade.':source==='recorded'&&entry&&resolveSymbol(entry.symbol)!==symbol?'Select the chart instrument that matches the recorded trade.':source==='playbook'&&scenario&&resolveSymbol(scenario.symbol)!==symbol?'Select the chart instrument that matches the playbook scenario.':demoQuantity&&(quantity<spec.minSize||Math.abs(quantity/spec.sizeStep-Math.round(quantity/spec.sizeStep))>1e-6)?`${symbol} demo size must be at least ${spec.minSize} ${spec.sizeUnit}, in increments of ${spec.sizeStep}.`:null;
  const path=useMemo(()=>active?positionPath(feed.bars,active.position,active.start,cursor,manualExit):null,[active,feed,cursor,manualExit]);
  const current=path?.points.at(-1),p=active?.position,last=feed.bars[cursor-1],from=Math.max(0,cursor-85);
  const risk=p?.stop!==null&&p?.stop!==undefined?Math.abs(p.entry-p.stop)*p.quantity*p.multiplier:null;
  const lines:PriceLine[]=p&&path?.status!=='before'?[{price:p.entry,label:'Entry',color:'#5338ec'},...(p.stop===null?[]:[{price:p.stop,label:'Stop',color:'#e11d48',dashed:true}]),...(p.target===null?[]:[{price:p.target,label:'Target',color:'#059669',dashed:true}])]:[];
  const markers:Marker[]=active&&path?.status!=='before'?[{index:active.start,price:active.position.entry,kind:active.position.direction==='BUY'?'buy':'sell'},...(path?.exit?[{index:path.exit.index,price:path.exit.price,kind:'exit' as const}]:[])]:[];
  const visiblePoints=path?.points.filter(point=>point.index>=from)??[];
  const riskPct=risk!==null&&p?.equity?risk/p.equity*100:null;
  const start=()=>{if(!parsed.position||mismatch)return;setActive({position:parsed.position,start:cursor-1});setManualExit(null);setPlaying(false);};
  return <div className="space-y-4" aria-label="Position replay workspace">
    <p className="rounded-xl border border-purple-100 bg-[#FBFAFF] p-3 text-xs"><Pill tone="accent">Simulated demo data</Pill> Generated candles, not historical or live prices. Start a position test to compare its P&amp;L with the price path. Journal records stay unchanged.</p>
    <div className="grid grid-cols-1 lg:grid-cols-[250px_minmax(0,1fr)] gap-4 items-start">
      <Card title="Position setup" sub="Load a trade or playbook, then adjust the test.">
        <div className="space-y-3">
          <Field label="Setup source"><select aria-label="Position setup source" value={source} onChange={e=>setSource(e.target.value as typeof source)} className={inputCls}><option value="playbook">Playbook setup</option><option value="recorded" disabled={!entries.length}>Recorded trade</option></select></Field>
          <Field label="Recorded trade"><select aria-label="Position recorded trade" value={entryId} onChange={e=>{const trade=entries.find(t=>t.id===e.target.value);setEntryId(e.target.value);setSource(trade?'recorded':'playbook');setScenarioId('');if(trade){const pb=playbooks.find(b=>b.name===trade.strategy);if(pb){setBookId(pb.id);setTf(demoTimeframe(pb));}const mapped=resolveSymbol(trade.symbol);if(mapped)setSymbol(mapped);}}} className={inputCls}><option value="">Choose a trade</option>{entries.map(e=><option key={e.id} value={e.id}>{e.date} · {e.symbol} · {e.direction} · {e.strategy} · #{e.id.slice(-6)}</option>)}</select></Field>
          <Field label="Playbook"><select aria-label="Position playbook" value={bookId} onChange={e=>{const pb=playbooks.find(b=>b.id===e.target.value)??null;setBookId(e.target.value);setScenarioId('');setTf(demoTimeframe(pb));}} className={inputCls}>{!playbooks.length&&<option value="">Generic breakout</option>}{playbooks.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}</select></Field>
          {source==='playbook'&&<Field label="Scenario"><select aria-label="Position playbook scenario" className={inputCls} value={scenarioId} onChange={e=>{setScenarioId(e.target.value);const sc=book?.scenarios?.find(s=>s.id===e.target.value),mapped=sc&&resolveSymbol(sc.symbol);if(mapped)setSymbol(mapped);}}><option value="">Template at chart price</option>{book?.scenarios?.map(sc=><option key={sc.id} value={sc.id}>{sc.symbol} · {sc.bias} · {sc.status}</option>)}</select></Field>}
          <Field label="Chart instrument"><select aria-label="Position chart instrument" value={symbol} onChange={e=>setSymbol(e.target.value)} className={inputCls}>{SYMBOLS.map(s=><option key={s.symbol}>{s.symbol}</option>)}</select></Field>
          <Field label="Chart timeframe"><select aria-label="Position chart timeframe" value={tf} onChange={e=>setTf(e.target.value as Timeframe)} className={inputCls}>{['1m','5m','15m','1h','4h','1D'].map(t=><option key={t}>{t}</option>)}</select></Field>
          {source==='recorded'&&entry&&<div className="text-[11px] bg-slate-50 rounded-lg p-3 space-y-1"><p className="font-semibold">{entry.symbol} · recorded {entry.direction}</p><p>Entry {entry.entryPrice} · size {entry.size} {entry.quantityUnit||'(unit unknown)'}</p><p>Recorded net: {eligible(entry)?new Intl.NumberFormat('en-US',{style:'currency',currency:currencyOf(entry)}).format(rawNet(entry)):'Unknown'}</p><p>Chart: {symbol}. Confirm the value per unit for this test. Recorded dates, exits and fills are not replayed by the generated price path.</p></div>}
          <Field label="Buy / Sell"><select aria-label="Test position direction" value={draft.direction} onChange={e=>edit({direction:e.target.value as 'BUY'|'SELL'})} className={inputCls}><option>BUY</option><option>SELL</option></select></Field>
          {([['entry','Entry price'],['quantity','Position size'],['stop','Stop price (optional)'],['target','Target price (optional)'],['multiplier','USD per 1.0 move / unit'],['costs','Estimated total costs (USD)'],['equity','Account equity (USD, optional)']] as const).map(([key,label])=><Field key={key} label={label}><input type="number" step="any" aria-label={`Test ${label}`} value={draft[key]} onChange={e=>edit({[key]:e.target.value})} className={inputCls}/></Field>)}
          <Field label="Quantity unit"><input aria-label="Test quantity unit" value={draft.unit} onChange={e=>edit({unit:e.target.value})} className={inputCls}/></Field>
          <button className={`${btnSecondary} w-full`} onClick={()=>{const spec=symbolSpec(symbol)!;edit({unit:spec.sizeUnit,multiplier:String(spec.multiplier),costs:'0'});}}>Use {symbol} demo valuation</button>
          <p className="text-[11px] text-slate-500">Demo valuation uses {symbolSpec(symbol)!.sizeUnit}, ${symbolSpec(symbol)!.multiplier} per 1.0 move per unit and zero estimated costs. No currency conversion.</p>
          {source==='playbook'&&<button className={`${btnSecondary} w-full`} onClick={()=>{setDraft(playbookPositionDraft(feed,book,cursor,draft.direction,scenarioId));setActive(null);setManualExit(null);setPlaying(false);}}>Reload playbook setup here</button>}
          {(parsed.error||mismatch)&&<p role="alert" className="text-xs text-rose-700">{mismatch||parsed.error}</p>}
        </div>
      </Card>
      <div className="min-w-0 space-y-4">
        <Card title={`${symbol} · ${tf}`} sub="Move through the chart to see how price affects your position." right={<button className={btnPrimary} disabled={!!parsed.error||!!mismatch} onClick={start}>{active?'Restart position test here':'Start position test here'}</button>}>
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-2 mb-3" aria-label="Position results at chart time">
            {[
              ['Position',p?`${path?.status==='before'?'Before test':path?.status==='closed'?'Closed':'Open'} · ${p.direction} · ${current?.remaining??0} ${p.unit}`:'Ready to set up'],
              ['Open P&L · net close estimate',current?usd(current.openNet):'—'],
              ['Realized test P&L',current?usd(current.realizedNet):'—'],
              ['Account return',current&&p?.equity?`${(current.managedNet/p.equity*100).toFixed(2)}%`:'Unknown'],
            ].map(([label,v])=><div key={label} className="rounded-lg bg-slate-50 p-3"><p className="text-[10px] text-slate-500">{label}</p><p className="text-xs font-bold mt-1 tabular-nums">{v}</p></div>)}
          </div>
          <p className="text-[11px] text-slate-500 mb-2">{time(last.t)} · Price {last.c.toFixed(feed.dp)}{current&&p?` · Change from entry ${current.priceChange.toFixed(2)}% · Entry ${p.entry.toFixed(feed.dp)}`:''}</p>
<CandleChart bars={feed.bars} from={from} to={cursor} height={380} dp={feed.dp} lines={lines} markers={markers} label="Position test price history" pnl={{series:[{name:'With stop / target',color:'#5338ec',points:visiblePoints.map(v=>({x:v.time,y:v.managedNet}))},{name:'Keep position open',color:'#b45309',dashed:true,points:visiblePoints.map(v=>({x:v.time,y:v.holdNet}))}],detail:t=>{const v=visiblePoints.find(v=>v.time===t);return v?<><p>Open: {usd(v.openNet)} · Realized: {usd(v.realizedNet)}</p><p>With exits: {usd(v.managedNet)} · Keep open: {usd(v.holdNet)}</p><p>Remaining: {v.remaining} {p?.unit} · ROI: {p?.equity?`${(v.managedNet/p.equity*100).toFixed(2)}%`:'Unknown'}</p></>:<p>Before position test · P&amp;L unavailable</p>;}}}/>
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
          </>:<p className="text-sm text-slate-500 py-6">{path?.status==='before'?'Move the timeline to the position’s start or later.':'Start a position test above. Its P&L will follow each revealed chart price.'}</p>}
        </Card>
        <details className="rounded-xl border border-slate-200 bg-white p-4 text-xs"><summary className="font-semibold text-[#5338ec] cursor-pointer">Setup context & execution assumptions</summary>
          <div className="mt-3 space-y-2 text-slate-600"><p>Playbook: {book?.name??'Unknown'} · selected scenario: {scenario?`${scenario.symbol} · ${scenario.status}`:'Template / trade levels'}.</p><p>Initial stop risk: {risk===null?'Unknown':usd(risk)}{riskPct===null?'':` (${riskPct.toFixed(2)}% of equity)`}. Playbook limit: {book?.riskPerTrade===undefined?'Unknown':`${book.riskPerTrade}%`}{riskPct!==null&&book?.riskPerTrade!==undefined?` · ${riskPct<=book.riskPerTrade+1e-8?'Within limit':'Above limit'}`:''}.</p><p>This test holds the entered size from the chosen chart bar and closes it fully at a stop, target or your manual close. Discretionary triggers, partial fills, trailing stops and session rules are available through strategy simulation where supported; they are not automatically applied here.</p><p>Stops take precedence if both levels occur in one candle. A gap through the stop closes at the bar’s open. No spread or slippage is added beyond your estimated costs. The chart’s final bar does not force a close.</p>{scenario&&<p>Written scenario: {scenario.hypothesis} Trigger: {scenario.trigger} · {scenario.createdAt}–{scenario.validUntil}. Written conditions require your review.</p>}</div>
        </details>
      </div>
    </div>
  </div>;
}

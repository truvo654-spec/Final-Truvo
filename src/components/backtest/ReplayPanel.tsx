import { JournalHelp } from '../journal/JournalHelp';
// Manual replay: bars appear one at a time with the future hidden. Place orders, manage the trade,
// tag it, take notes, and finish the session for Points.
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, EyeOff, Flag, Minus, Pause, Play, Shuffle, CalendarSearch, NotebookPen, Trash2, Monitor, ShieldCheck, Scissors, X } from 'lucide-react';
import type { JournalEntry } from '../../types';
import { eligible, netOf, realizedR } from '../journal/journalMath';
import { PracticeFilters, matchesJournal, practiceInstruments, practiceDateRangeError, feedMarket, journalMarket, DEFAULT_FILTER } from './PracticeFilters';
import { replayDaysLikeToday, replayJournalTrade, replayRandom, ReplayData, replayTimeframes } from '../../backtest/replay';
import { symbolSpec } from '../../backtest/marketData';
import {resolveSymbol} from '../../backtest/marketData';
import type {JournalPlaybook} from '../../data/journalPlaybooks';
import {ReplaySetupTransfer} from './ReplaySetupTransfer';
import {ReplayAICoach} from './ReplayAICoach';
import {relatedReplaySetups,replayRuleFields,replayVisibleAtr,type RelatedReplaySetup} from '../../backtest/replaySetups';
import {practiceEntryBlock,type PracticeGuardrails} from '../../backtest/practiceGuardrails';
import { clearPracticeDraft, loadPracticeDraft, savePracticeDraft, type PendingPracticeOrder, type PracticePosition } from '../../backtest/practiceDraft';
import type { PracticeFilter, PracticeTrade, ReplaySession } from '../../backtest/store';
import { Bar, Timeframe } from '../../backtest/types';
import { money, pct, priceFmt, rr, tone, dateTime } from '../../backtest/format';
import { CandleChart, LineChart } from './charts';
import { Card, Field, Pill, Segmented, Toggle, btnPrimary, btnSecondary, inputBase, inputCls, Banner } from './ui';

interface Props {
  entries: JournalEntry[];
  sessions: ReplaySession[];
  tz: string;
  initialEntryId: string | null;
  initialPlaybookId?: string | null;
  onFinish: (s: ReplaySession) => boolean;
  onToast: (m: string) => void;
  playbooks?:JournalPlaybook[];
}

type Side = 1 | -1;
type Pending = PendingPracticeOrder;
type Position = PracticePosition;
interface AutoReviewResult { net: number; r: number; exit: number; stop: number; target: number; exitReason: 'stop' | 'target' | 'trade close'; size: number }

const DEFAULT_BALANCE = 10000;
const WINDOW = 90;

const roundStep = (x: number, step: number) => Number((Math.floor(x / step + 1e-9) * step).toFixed(8));

export const ReplayPanel: React.FC<Props> = ({ entries, sessions, tz, initialEntryId, initialPlaybookId, onFinish, onToast,playbooks=[] }) => {
  const [restored] = useState(loadPracticeDraft);
  const d=restored.draft && !sessions.some(s=>s.id===restored.draft!.sessionId) ? restored.draft : null;
  const [draftError,setDraftError]=useState(restored.error);
  const [source, setSource] = useState<'random' | 'similar' | 'journal'>(d?.source ?? (initialEntryId ? 'journal' : 'random'));
  const [filter, setFilter] = useState<PracticeFilter>(d?.filter ?? DEFAULT_FILTER);
  const [tf, setTf] = useState<Timeframe>(d?.data.tf ?? '5m');
  const [blind, setBlind] = useState(d?.blind ?? true);
  const [useJournalSetup, setUseJournalSetup] = useState(d?.useJournalSetup ?? true);
  const [compareJournalResult, setCompareJournalResult] = useState(false);
  const [pickId, setPickId] = useState<string | null>(d?.pickId ?? initialEntryId);
  const [data, setData] = useState<ReplayData | null>(d?.data ?? null);
  const [cursor, setCursor] = useState(d?.cursor ?? 0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<'1' | '3' | '5' | '10'>('3');
  const [drawMode, setDrawMode] = useState(false);
  const [autoReview, setAutoReview] = useState(false);
  const [autoReviewResult, setAutoReviewResult] = useState<AutoReviewResult | null>(null);
  const [drawings, setDrawings] = useState<number[]>(d?.drawings ?? []);
  const [side, setSide] = useState<Side>(d?.side ?? 1);
  const [otype, setOtype] = useState<'market' | 'limit' | 'stop'>(d?.otype ?? 'market');
  const [oprice, setOprice] = useState(d?.oprice ?? '');
  const [riskPct, setRiskPct] = useState(d?.riskPct ?? 1);
  const [startingBalance, setStartingBalance] = useState(d?.startingBalance ?? DEFAULT_BALANCE);
  const [useRecordedSize, setUseRecordedSize] = useState(d?.useRecordedSize ?? false);
  const [stopPx, setStopPx] = useState(d?.stopPx ?? '');
  const [targetPx, setTargetPx] = useState(d?.targetPx ?? '');
  const [related,setRelated]=useState<RelatedReplaySetup|null>(d?.related ?? null);
  const [ticketEdited,setTicketEdited]=useState(d?.ticketEdited ?? false);
  const [targetR,setTargetR]=useState(d?.targetR ?? 2),[stopAtr,setStopAtr]=useState(d?.stopAtr ?? 1.5),[stopFraction,setStopFraction]=useState(d?.stopFraction ?? 1);
  const [breakevenR,setBreakevenR]=useState(d?.breakevenR ?? '');
  const [sessionStart,setSessionStart]=useState(d?.sessionStart ?? ''),[sessionEnd,setSessionEnd]=useState(d?.sessionEnd ?? '');
  const [maxTrades,setMaxTrades]=useState(d?.maxTrades ?? ''),[lossLimit,setLossLimit]=useState(d?.lossLimit ?? ''),[dailyLoss,setDailyLoss]=useState(d?.dailyLoss ?? '');
  const positiveLimit=(value:string)=>value.trim()&&Number.isFinite(Number(value))&&Number(value)>0?Number(value):null;
  const guardrails:PracticeGuardrails={session:sessionStart!==''&&sessionEnd!==''?{start:Number(sessionStart),end:Number(sessionEnd)}:null,maxTrades:positiveLimit(maxTrades),lossesPerDay:positiveLimit(lossLimit),dailyLoss:positiveLimit(dailyLoss)};
  const [pending, setPending] = useState<Pending | null>(d?.pending ?? null);
  const [pos, setPos] = useState<Position | null>(d?.pos ?? null);
  const [trades, setTrades] = useState<PracticeTrade[]>(d?.trades ?? []);
  const [tags, setTags] = useState<string[]>(d?.tags ?? []);
  const [notes, setNotes] = useState(d?.notes ?? '');
  const [finished, setFinished] = useState(false);
  const [sessionId, setSessionId] = useState(d?.sessionId ?? '');
  const [minCursor, setMinCursor] = useState(d?.minCursor ?? 0);
  const sessionStartedAt = useRef<string | null>(d?.startedAt ?? null);
  const stateRef = useRef({ pending, pos, cursor, data, trades });
  stateRef.current = { pending, pos, cursor, data, trades };
  useEffect(()=>{
    if (!data || finished || restored.error || autoReview) return;
    const saved=savePracticeDraft({version:1,data,cursor,minCursor,sessionId,startedAt:sessionStartedAt.current || new Date().toISOString(),
      pending,pos,trades,notes,tags,drawings,source,filter,blind,useJournalSetup,pickId,side,otype,oprice,riskPct,startingBalance,useRecordedSize,
      stopPx,targetPx,targetR,stopAtr,stopFraction,breakevenR,sessionStart,sessionEnd,maxTrades,lossLimit,dailyLoss,related,ticketEdited});
    setDraftError(saved?'':'Draft not saved: browser storage is unavailable. Keep this page open or finish and retry.');
  },[data,cursor,minCursor,sessionId,pending,pos,trades,notes,tags,drawings,source,filter,blind,useJournalSetup,pickId,side,otype,oprice,riskPct,startingBalance,useRecordedSize,
    stopPx,targetPx,targetR,stopAtr,stopFraction,breakevenR,sessionStart,sessionEnd,maxTrades,lossLimit,dailyLoss,related,ticketEdited,finished,autoReview,restored.error]);
  useEffect(()=>{
    if (!data || finished || !draftError) return;
    const warn=(event:BeforeUnloadEvent)=>{event.preventDefault();event.returnValue='';};
    window.addEventListener('beforeunload',warn);
    return ()=>window.removeEventListener('beforeunload',warn);
  },[data,finished,draftError]);

  const journalMatches = useMemo(() => entries.filter((e) => eligible(e) && e.exitPrice !== null && matchesJournal(e, filter))
    .sort((a, b) => (b.entryTime || b.date).localeCompare(a.entryTime || a.date)), [entries, filter]);
  const journalList = journalMatches;
  const feedMatches = useMemo(() => practiceInstruments(filter), [filter]);
  const allTags = useMemo(() => Array.from(new Set(entries.flatMap((e) => [...e.tags, ...e.mistakes]))).slice(0, 14), [entries]);
  const dateRangeError = practiceDateRangeError(source, filter);
  const logSessions = useMemo(() => {
    const selectedSymbols = new Set(filter.symbols.map((symbol) => symbolSpec(symbol)?.symbol ?? symbol));
    return sessions.filter((session) => {
      const spec = symbolSpec(session.symbol);
      const journalEntry = session.journalTradeId ? entries.find((entry) => entry.id === session.journalTradeId) : undefined;
      const sessionMarket = spec ? feedMarket(spec) : journalEntry ? journalMarket(journalEntry) : null;
      const sessionSymbol = spec?.symbol ?? session.symbol;
      return (!selectedSymbols.size || selectedSymbols.has(sessionSymbol))
        && (!filter.markets.length || (sessionMarket !== null && filter.markets.includes(sessionMarket)))
        && (!filter.from || (!!session.marketDate && session.marketDate >= filter.from))
        && (!filter.to || (!!session.marketDate && session.marketDate <= filter.to));
    });
  }, [sessions, entries, filter.markets, filter.symbols, filter.from, filter.to]);
  const logTrades = useMemo(() => logSessions.flatMap((session) => session.trades), [logSessions]);
  const practicePerformanceSessions = useMemo(() => [...logSessions].sort((a, b) =>
    (a.finishedAt ?? a.startedAt).localeCompare(b.finishedAt ?? b.startedAt)), [logSessions]);
  const practicePerformancePoints = useMemo(() => {
    let cumulative = 0;
    return [{ x: 0, y: 0 }, ...practicePerformanceSessions.map((session, index) => ({
      x: index + 1,
      y: (cumulative += session.net),
    }))];
  }, [practicePerformanceSessions]);
  const logWins = logTrades.filter((trade) => trade.net > 0).length;
  const logNet = logTrades.reduce((sum, trade) => sum + trade.net, 0);
  const logGrossProfit = logTrades.reduce((sum, trade) => sum + Math.max(0, trade.net), 0);
  const logGrossLoss = logTrades.reduce((sum, trade) => sum + Math.max(0, -trade.net), 0);
  const logR = logTrades.flatMap((trade) => trade.r !== null && Number.isFinite(trade.r) ? [trade.r] : []);
  const logAvgR = logR.length ? logR.reduce((sum, value) => sum + value, 0) / logR.length : null;
  const logProfitFactor = logGrossLoss > 0 ? logGrossProfit / logGrossLoss : logGrossProfit > 0 ? Infinity : null;
  const guidedPlaybook = related?.playbookId ? playbooks.find((book) => book.id === related.playbookId) : undefined;
  const guidedScenario = guidedPlaybook?.scenarios?.find((scenario) => related?.id === `scenario:${guidedPlaybook.id}:${scenario.id}`);

  const balance = startingBalance + trades.reduce((a, t) => a + t.net, 0);
  const bars = data?.bars ?? [];
  const last: Bar | undefined = bars[cursor - 1];

  const configureTicketFromTrade = (d: ReplayData, importJournalSetup: boolean) => {
    const setup = importJournalSetup ? d.trade : null;
    setStopPx(setup?.stop == null ? '' : String(setup.stop));
    setTargetPx(setup?.takeProfit == null ? '' : String(setup.takeProfit));
    setOprice('');
    setSide(setup?.direction === 'SELL' ? -1 : 1);
    const spec = symbolSpec(d.symbol);
    const hasCompatibleRecordedSize = !!setup && setup.quantityUnit === d.sizeUnit && Number.isFinite(setup.size)
      && setup.size >= d.minSize && !!spec && Math.abs(setup.size / spec.sizeStep - Math.round(setup.size / spec.sizeStep)) < 1e-6;
    setUseRecordedSize(hasCompatibleRecordedSize);
    const recordedRiskPct = setup?.initialRisk != null && setup.equityAtEntry != null && setup.equityAtEntry > 0
      ? setup.initialRisk / setup.equityAtEntry * 100 : null;
    if (recordedRiskPct != null && Number.isFinite(recordedRiskPct) && recordedRiskPct >= 0.01 && recordedRiskPct <= 100) setRiskPct(recordedRiskPct);
    else setRiskPct(1);
    const recordedUsdEquity = setup?.accountCurrency === 'USD' && Number.isFinite(setup.equityAtEntry) && setup.equityAtEntry! > 0
      ? setup.equityAtEntry! : null;
    setStartingBalance(recordedUsdEquity ?? DEFAULT_BALANCE);
  };

  const avgRange = useMemo(() => replayVisibleAtr(bars,cursor), [bars, cursor]);

  const applyTicketSetup=(setup:Partial<RelatedReplaySetup>,replay:ReplayData|null=data)=>{
    if(setup.riskPercent!==undefined)setRiskPct(setup.riskPercent);
    if(setup.equity!==undefined)setStartingBalance(setup.equity);
    if(setup.direction)setSide(setup.direction==='BUY'?1:-1);
    if(setup.targetR!==undefined){setTargetR(setup.targetR);setTargetPx('');}
    if(setup.stopAtr!==undefined){setStopAtr(setup.stopAtr);setStopPx('');}
    if(setup.stopFraction!==undefined){
      setStopFraction(setup.stopFraction);
      const reference=replay===data?entryRef:replay?.bars[replay.start-1]?.c;
      const original=replay===data?stopVal:replay?.trade?.stop;
      const direction=setup.direction?setup.direction==='BUY'?1:-1:replay===data?side:replay?.trade?.direction==='SELL'?-1:1;
      const previousFraction=replay===data&&Number.isFinite(stopFraction)&&stopFraction>0?stopFraction:1;
      setStopPx(reference!==undefined&&original!=null&&Number.isFinite(reference)&&Number.isFinite(original)?String(reference-direction*Math.abs(reference-original)*setup.stopFraction/previousFraction):'');
    }
    if(setup.breakevenR!==undefined)setBreakevenR(String(setup.breakevenR));
    if(setup.session){setSessionStart(String(setup.session.start));setSessionEnd(String(setup.session.end));}
    if(setup.maxTrades!==undefined)setMaxTrades(String(setup.maxTrades));
    if(setup.lossesPerDay!==undefined)setLossLimit(String(setup.lossesPerDay));
    if(setup.dailyLoss!==undefined)setDailyLoss(String(setup.dailyLoss));
    if(setup.prices&&replay&&setup.symbols?.length===1&&resolveSymbol(setup.symbols[0])===resolveSymbol(replay.symbol)){
      setOtype('limit');setOprice(String(setup.prices.entry));setStopPx(String(setup.prices.stop));setTargetPx(String(setup.prices.target));
    }
    setUseRecordedSize(false);
  };
  const transferSetup=(setup:RelatedReplaySetup|null)=>{
    setRelated(setup);if(!setup)return;setTicketEdited(false);
    setTargetR(2);setStopAtr(1.5);setStopFraction(1);setBreakevenR('');setSessionStart('');setSessionEnd('');setMaxTrades('');setLossLimit('');setDailyLoss('');
    setOtype('market');setOprice('');setStopPx('');setTargetPx('');
    setSide(1);
    if(setup.timeframe&&replayTimeframes.includes(setup.timeframe))setTf(setup.timeframe);
    const book = playbooks.find(p=>p.id===setup.playbookId);
    const sourceBook = playbooks.find(p=>p.id===book?.coachOrigin?.sourcePlaybookId);
    setFilter(f=>({...f,symbols:setup.symbols,markets:[],result:'all',playbook:sourceBook?.name||book?.name||''}));
    if(data&&setup.symbols.length&&!setup.symbols.includes(resolveSymbol(data.symbol)||data.symbol)){setData(null);setPlaying(false);}
    applyTicketSetup(setup);
  };
  useEffect(() => {
    if (!initialPlaybookId || d) return;
    const setup = relatedReplaySetups(playbooks, entries, [], []).find(s => s.id === `playbook:${initialPlaybookId}`);
    if (setup) transferSetup(setup);
  }, [initialPlaybookId]); // eslint-disable-line react-hooks/exhaustive-deps

  const load = (d: ReplayData, importJournalSetup = true) => {
    setData(d); setCursor(d.start); setMinCursor(d.start); setPlaying(false); setPending(null); setPos(null); setTrades([]); setDrawings([]);
    setFinished(false); setAutoReview(false); setAutoReviewResult(null); setNotes(''); setTags(d.trade?.mistakes ?? []); setSessionId(`rs_${Date.now().toString(36)}`); sessionStartedAt.current = new Date().toISOString();
    if(!ticketEdited){configureTicketFromTrade(d, importJournalSetup);if(related)applyTicketSetup(related,d);}
    else if(data&&resolveSymbol(data.symbol)!==resolveSymbol(d.symbol)){
      setStopPx('');setTargetPx('');setOprice('');setOtype('market');setUseRecordedSize(false);
    }
  };
  const loadSource = () => {
    try {
      if (data && !finished && !window.confirm('Replace the current practice draft? Its orders, positions and notes will be discarded.')) return;
      if (dateRangeError) { onToast(dateRangeError); return; }
      if (source !== 'journal') {
        if (!feedMatches.length) { onToast('No instruments match these filters. Pick another market or instrument.'); return; }
        const sym = feedMatches[Math.floor(Math.random() * feedMatches.length)].symbol;
        const dateRange = { from: filter.from, to: filter.to };
        load(source === 'random' ? replayRandom(sym, tf, Date.now(), dateRange) : replayDaysLikeToday(sym, tf, dateRange));
      } else {
        const e = entries.find((x) => x.id === pickId && journalMatches.some((m) => m.id === x.id)) || journalList[0] || (initialEntryId ? entries.find((x) => x.id === pickId) : undefined);
        if (!e) { onToast('No journal trades match these filters. Loosen one of them.'); return; }
        setPickId(e.id); load(replayJournalTrade(e), useJournalSetup);
      }
    } catch (err) { onToast(err instanceof Error ? err.message : 'Could not load the replay'); }
  };
  // Load the deep-linked trade straight away.
  useEffect(() => { if (initialEntryId) { const e = entries.find((x) => x.id === initialEntryId); if (e) { setBlind(true); load(replayJournalTrade(e)); } } }, [initialEntryId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Default stop/target suggestions follow the market until the user types their own.
  const autoStop = last ? last.c - side * avgRange * stopAtr * stopFraction : NaN;
  const entryRef = autoReview && data?.trade ? data.trade.entry : otype === 'market' ? last?.c ?? NaN : Number(oprice) || last?.c || NaN;
  const stopVal = autoReviewResult && autoReview ? autoReviewResult.stop : stopPx === '' ? autoStop : Number(stopPx);
  const riskDist = Math.abs(entryRef - stopVal);
  const targetVal = autoReviewResult && autoReview ? autoReviewResult.target : targetPx === '' ? entryRef + side * targetR * riskDist : Number(targetPx);
  const rrNow = riskDist > 0 && Number.isFinite(targetVal) ? Math.abs(targetVal - entryRef) / riskDist : NaN;
  const sizeNow = autoReviewResult && autoReview ? autoReviewResult.size
    : data && useRecordedSize && data.trade ? data.trade.size
    : data && riskDist > 0 ? roundStep((balance * riskPct / 100) / (riskDist * data.multiplier), data.minSize) : 0;
  const ticketProblem = !data ? 'Load a chart first.' : finished ? 'Session finished.' : autoReview ? 'Exit closed-trade review before placing an order.' : pos ? 'Close the open position first.' : pending ? 'Cancel the pending order first.'
    : ![stopAtr,stopFraction,targetR].every(v=>Number.isFinite(v)&&v>0)||[breakevenR,maxTrades,lossLimit,dailyLoss].some(v=>v!==''&&(!Number.isFinite(Number(v))||Number(v)<=0))||[maxTrades,lossLimit].some(v=>v!==''&&!Number.isInteger(Number(v)))?'Enter positive replay parameters and whole-number trade limits.'
    : (sessionStart!==''||sessionEnd!=='')&&(sessionStart===''||sessionEnd===''||!Number.isInteger(Number(sessionStart))||!Number.isInteger(Number(sessionEnd))||Number(sessionStart)<0||Number(sessionStart)>23||Number(sessionEnd)<0||Number(sessionEnd)>24||Number(sessionStart)===Number(sessionEnd))?'Enter a valid UTC session, or leave both hours blank.'
    : last&&practiceEntryBlock(trades,last.t,guardrails)?practiceEntryBlock(trades,last.t,guardrails)
    : !Number.isFinite(riskPct) || riskPct < 0.01 || riskPct > 100 ? 'Risk must be between 0.01% and 100%.'
    : !(riskDist > 0) || side * (entryRef - stopVal) <= 0 ? `The stop must be ${side === 1 ? 'below' : 'above'} the entry.`
    : Number.isFinite(targetVal) && side * (targetVal - entryRef) <= 0 ? `The target must be ${side === 1 ? 'above' : 'below'} the entry.`
    : !(sizeNow >= (data?.minSize ?? 0)) || sizeNow <= 0 ? 'Risk is too small for the minimum size.' : null;

  const toggleAutoReview = () => {
    if (!data?.trade) return;
    if (autoReview) {
      setAutoReview(false); setAutoReviewResult(null); setCursor(data.start); setMinCursor(data.start);
      return;
    }
    const journalTrade = data.trade;
    const entry = journalTrade.entry;
    const stop = stopPx === '' ? entry - side * (avgRange || entry * 0.003) * stopAtr * stopFraction : Number(stopPx);
    const riskDistance = Math.abs(entry - stop);
    const target = targetPx === '' ? entry + side * targetR * riskDistance : Number(targetPx);
    if (!(riskDistance > 0) || side * (entry - stop) <= 0 || !Number.isFinite(target) || side * (target - entry) <= 0) {
      onToast('Set a valid stop and target before reviewing this trade.');
      return;
    }
    const size = useRecordedSize ? journalTrade.size
      : roundStep((balance * riskPct / 100) / (riskDistance * data.multiplier), data.minSize);
    if (!(size >= data.minSize) || !Number.isFinite(size)) {
      onToast('Risk is too small for the minimum size.');
      return;
    }
    let exit = data.bars[journalTrade.exitIndex]?.c ?? journalTrade.exit;
    let managedStop=stop;
    let exitReason: AutoReviewResult['exitReason'] = 'trade close';
    for (let i = journalTrade.entryIndex; i <= journalTrade.exitIndex; i++) {
      const bar = data.bars[i];
      if (!bar) continue;
      const stopHit = side === 1 ? bar.l <= managedStop : bar.h >= managedStop;
      const targetHit = side === 1 ? bar.h >= target : bar.l <= target;
      if (stopHit) { exit = side*(bar.o-managedStop)<0?bar.o:managedStop; exitReason = 'stop'; break; }
      if (targetHit) { exit = bar.o > target && side === 1 || bar.o < target && side === -1 ? bar.o : target; exitReason = 'target'; break; }
      if(positiveLimit(breakevenR)!==null&&side*((side===1?bar.h:bar.l)-entry)>=Number(breakevenR)*riskDistance)managedStop=side===1?Math.max(managedStop,entry):Math.min(managedStop,entry);
    }
    const netResult = (exit - entry) * side * size * data.multiplier;
    const initialRisk = riskDistance * size * data.multiplier;
    setAutoReviewResult({ net: netResult, r: initialRisk > 0 ? netResult / initialRisk : 0, exit, stop, target, exitReason, size });
    setCursor(journalTrade.exitIndex + 1); setMinCursor(journalTrade.entryIndex); setPlaying(false);
    setAutoReview(true); setCompareJournalResult(true);
  };

  const closeAt = useCallback((p: Position, price: number, bar: number, qty = p.size): PracticeTrade => {
    const data = stateRef.current.data;
    const mult = data?.multiplier ?? 1;
    const net = (price - p.entry) * p.dir * qty * mult;
    return {
      dir: p.dir === 1 ? 'long' : 'short', entry: p.entry, exit: price, size: qty, net,
      r: p.initRisk > 0 ? net / (p.initRisk * (qty / p.size)) : null,
      entryBar: p.entryBar, exitBar: bar, tags: p.tags,
      entryTime: data?.bars[p.entryBar] ? new Date(data.bars[p.entryBar].t).toISOString() : undefined,
      exitTime: data?.bars[bar] ? new Date(data.bars[bar].t).toISOString() : undefined,
    };
  }, []);

  /** Reveal the next bar and run orders/position against it (stop first if both stop and target are inside the bar). */
  const advance = useCallback((n = 1) => {
    const st = stateRef.current;
    if (!st.data) return;
    let cur = st.cursor, pd = st.pending, p = st.pos;
    const done: PracticeTrade[] = [];
    for (let k = 0; k < n && cur < st.data.bars.length; k++) {
      const b = st.data.bars[cur];
      if(pd&&practiceEntryBlock([...st.trades,...done],b.t,guardrails)){pd=null;onToast('Pending practice order cancelled by your session or risk limits.');}
      if (pd && !p) {
        const fill = pd.type === 'market' ? b.o
          : pd.type === 'limit' ? ((pd.dir === 1 ? b.l < pd.price : b.h > pd.price) ? (pd.dir === 1 ? Math.min(b.o, pd.price) : Math.max(b.o, pd.price)) : null)
          : ((pd.dir === 1 ? b.h >= pd.price : b.l <= pd.price) ? (pd.dir === 1 ? Math.max(b.o, pd.price) : Math.min(b.o, pd.price)) : null);
        if (fill !== null) {
          p = { dir: pd.dir, entry: fill, size: pd.size, stop: pd.stop, target: pd.target, entryBar: cur, initRisk: Math.abs(fill - pd.stop) * pd.size * st.data.multiplier, tags: [] };
          pd = null;
        }
      }
      if (p) {
        const adv = p.dir === 1 ? b.l : b.h, fav = p.dir === 1 ? b.h : b.l;
        if (p.dir * (b.o - p.stop) <= 0 && p.entryBar !== cur) { done.push(closeAt(p, b.o, cur)); p = null; }
        else if (p.dir * (adv - p.stop) <= 0) { done.push(closeAt(p, p.stop, cur)); p = null; }
        else if (p.target !== null && p.dir * (fav - p.target) >= 0) { done.push(closeAt(p, p.target, cur)); p = null; }
        // A newly reached breakeven threshold changes the stop for the next bar only.
        if(p&&positiveLimit(breakevenR)!==null&&p.dir*(fav-p.entry)>=Number(breakevenR)*p.initRisk/(p.size*st.data.multiplier))p={...p,stop:p.dir===1?Math.max(p.stop,p.entry):Math.min(p.stop,p.entry)};
      }
      cur++;
    }
    setCursor(cur); setPending(pd); setPos(p);
    if (done.length) {
      setTrades((t) => [...t, ...done.map((x) => ({ ...x, tags }))]);
      setMinCursor(cur);
      done.forEach((d) => onToast(`Practice trade closed: ${rr(d.r)} (${money(d.net)})`));
    }
    if (cur >= st.data.bars.length) setPlaying(false);
  }, [closeAt, onToast, tags,breakevenR,sessionStart,sessionEnd,maxTrades,lossLimit,dailyLoss]);

  // Playback timer
  useEffect(() => {
    if (!playing || finished) return;
    const id = window.setInterval(() => advance(1), 1000 / Number(speed));
    return () => window.clearInterval(id);
  }, [playing, speed, advance, finished]);

  const place = () => {
    if (ticketProblem || !data || !last) { if (ticketProblem) onToast(ticketProblem); return; }
    setPending({ dir: side, type: otype, price: otype === 'market' ? last.c : Number(oprice), stop: stopVal, target: Number.isFinite(targetVal) ? targetVal : null, size: sizeNow });
    onToast(otype === 'market' ? 'Market order placed: it fills at the next bar open' : `${otype === 'limit' ? 'Limit' : 'Stop'} order placed`);
  };

  const closePos = (half = false) => {
    if (!pos || !last) return;
    const qty = half ? roundStep(pos.size / 2, data?.minSize ?? 0.01) : pos.size;
    if (half && (qty <= 0 || qty >= pos.size)) { onToast('Position too small to split'); return; }
    const t = closeAt(pos, last.c, cursor - 1, qty);
    setTrades((x) => [...x, { ...t, tags }]);
    setMinCursor(cursor);
    setPos(half ? { ...pos, size: +(pos.size - qty).toFixed(6), initRisk: pos.initRisk * (1 - qty / pos.size) } : null);
  };

  const finish = () => {
    if (!data) return;
    let all = trades;
    if (pos && last) { const t = closeAt(pos, last.c, cursor - 1); all = [...trades, { ...t, tags }]; }
    setPlaying(false);
    const finishedAt = new Date().toISOString();
    const saved=onFinish({
      id: sessionId, source: data.source, symbol: data.symbol, label: data.label,
      startedAt: sessionStartedAt.current ?? finishedAt, finishedAt,
      trades: all, net: all.reduce((a, t) => a + t.net, 0), notes, tags, pointsAwarded: false,
      journalTradeId: data.trade?.id, marketDate: new Date(data.bars[data.start]?.t ?? Date.now()).toISOString().slice(0, 10), timeframe: data.tf,
    });
    if (!saved) return;
    setTrades(all); setPos(null); setPending(null); setFinished(true);
    if (!clearPracticeDraft()) onToast('Session saved, but the draft could not be cleared. Do not finish it twice.');
  };

  // Keyboard: Space play/pause, → next bar, ← back, B buy, S sell
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName) || !data || finished) return;
      if (e.key === ' ') { e.preventDefault(); setPlaying((x) => !x); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); advance(1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); if (!pos && !pending && cursor > minCursor) setCursor(cursor - 1); }
      else if (e.key.toLowerCase() === 'b') { setSide(1); setTicketEdited(true); }
      else if (e.key.toLowerCase() === 's') { setSide(-1); setTicketEdited(true); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [data, finished, advance, pos, pending, cursor, minCursor]);

  const from = autoReview && data?.trade ? data.trade.entryIndex : Math.max(0, cursor - WINDOW);
  const unreal = pos && last ? (last.c - pos.entry) * pos.dir * pos.size * (data?.multiplier ?? 1) : 0;
  const unrealR = pos && pos.initRisk > 0 ? unreal / pos.initRisk : 0;
  const wins = trades.filter((t) => t.net > 0).length;
  const net = trades.reduce((a, t) => a + t.net, 0);
  const avgR = trades.length ? trades.reduce((a, t) => a + (t.r ?? 0), 0) / trades.length : 0;
  const hidden = blind && !finished && !autoReview;
  const dp = data?.dp ?? 5;

  const markers = useMemo(() => {
    const m: { index: number; price: number; kind: 'buy' | 'sell' | 'exit' }[] = [];
    trades.forEach((t) => { m.push({ index: t.entryBar, price: t.entry, kind: t.dir === 'long' ? 'buy' : 'sell' }); m.push({ index: t.exitBar, price: t.exit, kind: 'exit' }); });
    if (pos) m.push({ index: pos.entryBar, price: pos.entry, kind: pos.dir === 1 ? 'buy' : 'sell' });
    if ((finished || autoReview) && data?.trade) { m.push({ index: data.trade.entryIndex, price: data.trade.entry, kind: data.trade.direction === 'BUY' ? 'buy' : 'sell' }); m.push({ index: data.trade.exitIndex, price: data.trade.exit, kind: 'exit' }); }
    return m;
  }, [trades, pos, finished, data, autoReview]);

  const lines = [
    ...(pos ? [{ price: pos.entry, color: '#5338ec', label: 'Entry' }, { price: pos.stop, color: '#e11d48', label: 'Stop', dashed: true }, ...(pos.target !== null ? [{ price: pos.target, color: '#059669', label: 'Target', dashed: true }] : [])] : []),
    ...(!pos && pending ? [{ price: pending.type === 'market' ? NaN : pending.price, color: '#5338ec', label: pending.type === 'limit' ? 'Limit' : 'Stop ord', dashed: true }] : []),
    ...(!pos && !pending && data && !finished && last ? [{ price: stopVal, color: '#e11d4888', label: 'SL?', dashed: true }, { price: targetVal, color: '#05966988', label: 'TP?', dashed: true }] : []),
  ];

  return (
    <div className="space-y-5">
      <Banner tone={draftError?'bad':'info'}>{draftError || (d ? 'Unfinished practice restored, paused at the saved bar. Orders, open position, rules and notes are retained. No completion reward has been claimed.' : 'Unfinished practice is saved locally and resumes when you return. Generated and reconstructed price paths are simulations, not historical execution evidence.')}
        {(data || draftError) && <button type="button" className={`${btnSecondary} ml-3`} onClick={()=>{
          if (!window.confirm('Discard this practice draft, including its open position, pending order and notes?')) return;
          if (!clearPracticeDraft()) { onToast('Could not discard the draft: browser storage is unavailable.'); return; }
          setPlaying(false);setData(null);setPos(null);setPending(null);setTrades([]);setNotes('');
          if (restored.error) window.location.reload();
          else setDraftError('');
        }}>Discard draft</button>}
      </Banner>
      <div className="md:hidden"><Banner tone="info" icon={<Monitor className="w-4 h-4" />}>Replay works best on a larger screen. Everything still works here; the chart scrolls sideways.</Banner></div>
      <ReplaySetupTransfer entries={entries} playbooks={playbooks} initialId={d?.related?.id || (initialPlaybookId ? `playbook:${initialPlaybookId}` : '')} onSelect={transferSetup} disabled={!!pos||!!pending||(!finished&&trades.length>0)||autoReview}/>
      {guidedPlaybook&&<section className="rounded-2xl border border-[#5338ec]/25 bg-[#FBFAFF] p-4 space-y-3" aria-label={`${guidedPlaybook.name} playbook practice guide`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-wider text-[#5338ec]">Playbook practice guide</p><h3 className="mt-0.5 text-sm font-bold text-[#0b1c30]">{guidedPlaybook.name}</h3><p className="mt-1 text-xs text-slate-600">{guidedPlaybook.thesis}</p></div>
          <Pill tone="accent">{guidedPlaybook.status}</Pill>
        </div>
        {guidedScenario&&<div className="rounded-xl border border-[#5338ec]/15 bg-white p-3 text-xs"><p className="font-semibold text-[#0b1c30]">Scenario · {guidedScenario.symbol} · {guidedScenario.bias}</p><p className="mt-1 text-slate-600">{guidedScenario.hypothesis}</p><p className="mt-1 text-slate-500"><b>Trigger:</b> {guidedScenario.trigger}</p>{related?.prices&&<p className="mt-1 text-slate-500">Reference levels: entry {priceFmt(related.prices.entry,symbolSpec(guidedScenario.symbol)?.priceDp??dp)} · stop {priceFmt(related.prices.stop,symbolSpec(guidedScenario.symbol)?.priceDp??dp)} · target {priceFmt(related.prices.target,symbolSpec(guidedScenario.symbol)?.priceDp??dp)}</p>}</div>}
        <div className="grid gap-2 sm:grid-cols-3">
          <div className="rounded-xl bg-white p-3"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Entry trigger<JournalHelp label="Entry trigger" /></p><p className="mt-1 text-xs text-[#0b1c30]">{guidedScenario?.trigger||guidedPlaybook.entryTrigger||'No entry trigger recorded.'}</p></div>
          <div className="rounded-xl bg-white p-3"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Stop rule</p><p className="mt-1 text-xs text-[#0b1c30]">{guidedPlaybook.stopRule||'No stop rule recorded.'}</p></div>
          <div className="rounded-xl bg-white p-3"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Target rule</p><p className="mt-1 text-xs text-[#0b1c30]">{guidedPlaybook.targetRule||'No target rule recorded.'}</p></div>
        </div>
        {guidedPlaybook.rules.length>0&&<details className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs"><summary className="cursor-pointer font-semibold text-[#5338ec]">Checklist · {guidedPlaybook.rules.length} rules</summary><ol className="mt-2 space-y-2">{guidedPlaybook.rules.map((rule,index)=><li key={rule.id} className="flex gap-2"><span className="font-bold text-slate-400">{index+1}.</span><span><b className="text-[#0b1c30]">{rule.title}</b><span className="block text-slate-600">{rule.detail}</span></span></li>)}</ol>{guidedPlaybook.avoid?.length>0&&<p className="mt-3 border-t border-slate-100 pt-2 text-slate-600"><b>Avoid:</b> {guidedPlaybook.avoid.join(' · ')}</p>}</details>}
        <p className="text-[10px] text-slate-500">Use this guide to make your own decisions. Written rules are not automatically scored; replay orders use simulated fills.</p>
      </section>}
      {data?<ReplayAICoach entries={entries} symbol={data.symbol} cutoff={data.bars[data.start].t} excludeId={data.trade?.id||pickId||''} playbook={filter.playbook} onUse={!pos&&!pending&&!finished&&!autoReview?rule=>{applyTicketSetup(replayRuleFields(rule));setTicketEdited(true);}:undefined} action="Apply AI suggestion to order ticket"/>:<p className="text-xs text-slate-500">Load a practice chart to see MarketSyde AI guidance based on trades closed before that replay starts.</p>}

      <div className="grid grid-cols-1 xl:grid-cols-[280px_minmax(0,1fr)_300px] gap-5 items-start">
        {/* Source */}
        <Card title="Practice source" sub="Pick what to replay, then load it.">
          <div className="space-y-4">
            <Segmented size="sm" label="Practice from" value={source} onChange={setSource} options={[{ id: 'random', label: 'Random', title: 'A random date from the last two years' }, { id: 'similar', label: 'Like today', title: 'A past day whose range and direction looked like the latest day' }, { id: 'journal', label: 'My trades', title: 'One of your journal trades, rebuilt bar by bar' }]} />
            <PracticeFilters source={source} value={filter} onChange={setFilter} entries={entries} matchCount={source === 'journal' ? journalMatches.length : feedMatches.length} onToast={onToast} />
            {source !== 'journal' ? (
              <Field label="Bars" hint="Bar size of the replay chart.">
                <Segmented size="sm" label="Bar size" value={tf} onChange={setTf} options={replayTimeframes.map((t) => ({ id: t, label: t }))} />
              </Field>
            ) : (
              <div className="space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Pick a trade</p>
                <ul className="max-h-64 overflow-y-auto space-y-1.5 pr-1" aria-label="Your journal trades">
                  {journalList.map((e) => (
                    <li key={e.id}>
                      <button type="button" aria-pressed={pickId === e.id} onClick={() => setPickId(e.id)} className={`w-full text-left rounded-lg border px-2.5 py-2 text-[11px] ${pickId === e.id ? 'border-[#5338ec] bg-[#FBFAFF]' : 'border-slate-200 hover:bg-slate-50'}`}>
                        <span className="flex justify-between gap-2 font-semibold text-[#0b1c30]"><span className="truncate">{blind ? `Trade #${e.id.replace(/\D/g, '') || e.id}` : `${e.symbol} · ${e.date}`}</span>{!blind&&<span className={tone(netOf(e))}>{rr(realizedR(e), 1)}</span>}</span>
                        <span className="text-slate-500">{e.strategy}{!blind&&e.mistakes[0] ? ` · ${e.mistakes[0]}` : ''}</span>
                      </button>
                    </li>
                  ))}
                  {journalList.length === 0 && <li className="text-xs text-slate-500">No trades match.</li>}
                </ul>
              </div>
            )}
            <div className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 px-3 py-2.5">
              <div><p className="text-xs font-bold text-[#0b1c30] flex items-center gap-1.5"><EyeOff className="w-3.5 h-3.5" /> Blind mode</p><p className="text-[11px] text-slate-500">Hides the symbol, date, and recorded result until you finish.</p></div>
              <Toggle label="Blind mode" checked={blind} onChange={setBlind} />
            </div>
            <button type="button" className={`${btnPrimary} w-full`} disabled={!!dateRangeError} onClick={loadSource}>{source === 'random' ? <Shuffle className="w-4 h-4" /> : <CalendarSearch className="w-4 h-4" />} Load to chart</button>
          </div>
        </Card>

        {/* Chart */}
        <section className="bg-white border border-[#e2e8f0] rounded-2xl p-4 min-w-0" aria-label="Replay chart">
          {!data ? (
            <div className="h-[360px] grid place-items-center text-center">
              <div><p className="text-sm font-semibold text-[#0b1c30]">Load a chart to start</p><p className="text-xs text-slate-500 mt-1">Bars appear one at a time. You only ever see the past.</p></div>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-sm font-bold text-[#0b1c30]">{hidden ? 'Hidden market' : data.symbol}</span>
                <Pill>{data.tf}</Pill>
                <span className="text-[11px] text-slate-500 tabular-nums">{hidden ? `Bar ${cursor - data.start + 1}` : last ? dateTime(last.t, tz) : ''}</span>
                {hidden && <Pill tone="accent"><EyeOff className="w-3 h-3" /> Blind</Pill>}
                {data.trade && <button type="button" aria-pressed={autoReview} disabled={finished} title="Jump from the recorded entry to exit and compare your ticket scenario" onClick={toggleAutoReview} className="ml-auto rounded-md border px-2 py-0.5 text-[11px] disabled:opacity-50">{autoReview ? 'Review on' : 'Review closed'}</button>}
              </div>
              <div className="flex gap-2">
                <div className="flex flex-col gap-1 pt-1" role="toolbar" aria-label="Drawing tools">
                  <button type="button" aria-pressed={drawMode} title="Horizontal line: click the chart to draw" onClick={() => setDrawMode(!drawMode)} className={`p-2 rounded-lg ${drawMode ? 'bg-[#EEF0FE] text-[#5338ec]' : 'text-slate-500 hover:bg-slate-100'}`}><Minus className="w-4 h-4" /></button>
                  <button type="button" title="Clear drawings" onClick={() => setDrawings([])} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100"><Trash2 className="w-4 h-4" /></button>
                </div>
                <div className="flex-1 min-w-0 overflow-x-auto">
                  <div className="min-w-[520px] relative">
                    <CandleChart bars={bars} from={from} to={cursor} dp={dp} height={340} label="Replay chart" lines={lines} markers={markers} drawings={drawings} onPick={drawMode ? (p) => { setDrawings((d) => [...d, p]); setDrawMode(false); } : undefined} />
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-3" role="toolbar" aria-label="Replay controls">
                <button type="button" className={btnSecondary} title="Back one bar (←). Not possible past a closed trade or while a trade is open." disabled={!!pos || !!pending || cursor <= minCursor || finished} onClick={() => setCursor(cursor - 1)}><ChevronLeft className="w-4 h-4" /></button>
                <button type="button" className={`${btnPrimary} w-24`} disabled={finished || cursor >= bars.length} onClick={() => setPlaying(!playing)}>{playing ? <><Pause className="w-4 h-4" /> Pause</> : <><Play className="w-4 h-4" /> Play</>}</button>
                <button type="button" className={btnSecondary} title="Next bar (→)" disabled={finished || cursor >= bars.length} onClick={() => advance(1)}><ChevronRight className="w-4 h-4" /></button>
                <Segmented size="sm" label="Speed" value={speed} onChange={setSpeed} options={(['1', '3', '5', '10'] as const).map((x) => ({ id: x, label: `${x}x`, title: `${x} bar${x === '1' ? '' : 's'} per second` }))} />
                <select aria-label="Jump ahead" value="" onChange={(e) => { if (e.target.value) advance(Number(e.target.value)); }} className={`${inputBase} w-auto h-8 text-xs`} disabled={finished}>
                  <option value="">Jump ahead…</option><option value="10">10 bars</option><option value="50">50 bars</option><option value={data.tf === '5m' ? 288 : data.tf === '15m' ? 96 : data.tf === '1h' ? 24 : 1}>1 day</option>
                </select>
                <span className="text-[10px] text-slate-400 ml-auto hidden lg:inline">Keys: Space play · ← → step · B / S side</span>
              </div>
              {data.trade && (
                <section className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3" aria-label="Trade history setup and comparison">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-xs font-bold text-[#0b1c30]">Trade history setup<JournalHelp label="Trade history setup" /></h3>
                      <p className="text-[11px] text-slate-500">{hidden ? 'Trade identity and result are hidden.' : `${data.trade.id} · ${data.trade.date}`}</p>
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-start gap-2 text-xs font-semibold text-[#0b1c30]">
                        <input type="checkbox" checked={useJournalSetup} disabled={!!pos || !!pending || finished} onChange={(e) => {
                          setUseJournalSetup(e.target.checked);
                          if (!pos && !pending && !finished) configureTicketFromTrade(data, e.target.checked);
                        }} className="mt-0.5 accent-[#5338ec]" />
                        Use these values in the order ticket<JournalHelp label="Use these values in the order ticket" />
                      </label>
                      <label className="flex items-start gap-2 text-xs font-semibold text-[#0b1c30]">
                        <input type="checkbox" checked={compareJournalResult} onChange={(e) => setCompareJournalResult(e.target.checked)} className="mt-0.5 accent-[#5338ec]" />
                        Compare replay with the recorded result<JournalHelp label="Compare replay with the recorded result" />
                      </label>
                    </div>
                  </div>
                  <dl className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1 text-[11px]">
                    <dt className="text-slate-500">Strategy</dt><dd>{data.trade.strategy || 'Unknown'}</dd>
                    <dt className="text-slate-500">Direction<JournalHelp label="Direction" /></dt><dd>{hidden ? 'Hidden' : data.trade.direction}</dd>
                    <dt className="text-slate-500">Entry<JournalHelp label="Entry" /></dt><dd>{hidden ? 'Hidden' : priceFmt(data.trade.entry, dp)}</dd>
                    <dt className="text-slate-500">Stop loss<JournalHelp label="Stop loss" /></dt><dd>{data.trade.stop == null ? 'Not recorded' : priceFmt(data.trade.stop, dp)}</dd>
                    <dt className="text-slate-500">Take profit<JournalHelp label="Take profit" /></dt><dd>{data.trade.takeProfit == null ? 'Not recorded' : priceFmt(data.trade.takeProfit, dp)}</dd>
                    <dt className="text-slate-500">Recorded size<JournalHelp label="Recorded size" /></dt><dd>{data.trade.size} {data.trade.quantityUnit ?? '(unit not recorded)'}</dd>
                    <dt className="text-slate-500">Initial risk<JournalHelp label="Initial risk" /></dt><dd>{data.trade.initialRisk == null ? 'Not recorded' : `${data.trade.initialRisk} ${data.trade.accountCurrency}`}</dd>
                    <dt className="text-slate-500">Entry equity<JournalHelp label="Entry equity" /></dt><dd>{data.trade.equityAtEntry == null ? 'Not recorded' : `${data.trade.equityAtEntry} ${data.trade.accountCurrency}`}</dd>
                    <dt className="text-slate-500">Entry margin<JournalHelp label="Entry margin" /></dt><dd>{data.trade.marginAtEntry == null ? 'Not recorded' : `${data.trade.marginAtEntry} ${data.trade.accountCurrency}`}</dd>
                    <dt className="text-slate-500">Recorded commission<JournalHelp label="Recorded commission" /></dt><dd>{data.trade.commission == null ? 'Not recorded' : `${data.trade.commission} ${data.trade.accountCurrency}`}</dd>
                    <dt className="text-slate-500">Journal account currency<JournalHelp label="Journal account currency" /></dt><dd>{data.trade.accountCurrency}</dd>
                    <dt className="text-slate-500">Setup notes</dt><dd>{data.trade.setupNotes || 'Not recorded'}</dd>
                    <dt className="text-slate-500">Tags<JournalHelp label="Tags" /></dt><dd>{data.trade.tags.length ? data.trade.tags.join(', ') : 'None recorded'}</dd>
                    {!hidden && <><dt className="text-slate-500">Recorded result</dt><dd>{`${data.trade.pnl.toFixed(2)} ${data.trade.accountCurrency}`} · {rr(data.trade.r)}</dd></>}
                  </dl>
                  <p className="mt-2 text-[10px] text-slate-500">Recorded values are references, not fills on this generated replay. Risk % is derived only from recorded risk and equity. Practice results use USD demo valuation; recorded results retain their account currency without conversion. Account equity is applied only for USD. Recorded size is used only when its unit and demo increment match; otherwise replay risk sizing is used. Commission is shown for reference, not applied as a guessed fee. Missing or incompatible values are not guessed.</p>
                  {autoReview && autoReviewResult && (
                    <div className="mt-3 rounded-lg border border-[#d9d3ff] bg-white p-3 text-xs" aria-label="Replay and journal result comparison">
                      <p className="font-bold text-[#0b1c30]">Test scenario vs. recorded trade</p>
                      <p className="mt-1 text-slate-600">Scenario: {money(autoReviewResult.net)} · {rr(autoReviewResult.r)} · exit at {priceFmt(autoReviewResult.exit, dp)} ({autoReviewResult.exitReason}) · size {autoReviewResult.size} {data.sizeUnit}</p>
                      <p className="mt-1 text-slate-600">Recorded trade: {`${data.trade.pnl.toFixed(2)} ${data.trade.accountCurrency}`} · {rr(data.trade.r)} · entry {priceFmt(data.trade.entry, dp)} → exit {priceFmt(data.trade.exit, dp)}</p>
                      <p className="mt-1 text-[11px] text-slate-500">The chart path is generated from the recorded trade outcome, not verified historical market data. This comparison is illustrative and is not independent evidence of a strategy edge or actual fills.</p>
                    </div>
                  )}
                  {finished && compareJournalResult && !autoReview && (
                    <div className="mt-3 rounded-lg border border-[#d9d3ff] bg-white p-3 text-xs" aria-label="Replay and journal result comparison">
                      <p className="font-bold text-[#0b1c30]">Practice vs. recorded trade</p>
                      <p className="mt-1 text-slate-600">Your practice: {trades.length ? `${money(net)} · ${rr(trades.reduce((sum, trade) => sum + (trade.r ?? 0), 0))}` : 'No practice trades'} · Recorded: {`${data.trade.pnl.toFixed(2)} ${data.trade.accountCurrency}`} · {rr(data.trade.r)}</p>
                      <p className="mt-1 text-[11px] text-slate-500">The generated replay is not historical market data or a verified fill simulation.</p>
                    </div>
                  )}
                </section>
              )}
            </>
          )}
        </section>

        {/* Ticket + position */}
        <div className="space-y-5">
          <Card title="Order ticket" sub="Simulated. Sized from your risk %.">
            <div className="space-y-3" onChangeCapture={()=>setTicketEdited(true)}>
              <div className="grid grid-cols-2 gap-2" aria-label="Editable practice scenario parameters">{([['Target R',targetR,setTargetR],['Stop distance ATR',stopAtr,setStopAtr],['Stop risk fraction',stopFraction,setStopFraction]] as const).map(([label,value,set])=><Field key={label} label={label}><input type="number" aria-label={`Practice ${label}`} min="0.01" step="0.1" value={value} disabled={autoReview} onChange={e=>{set(Number(e.target.value));if(label==='Target R')setTargetPx('');else setStopPx('');}} className={inputCls}/></Field>)}<Field label="Breakeven at R (optional)"><input type="number" aria-label="Practice breakeven at R" min="0.01" step="0.1" value={breakevenR} onChange={e=>setBreakevenR(e.target.value)} className={inputCls}/></Field></div>
              <details className="text-xs"><summary className="cursor-pointer text-[#5338ec] font-semibold">Session & risk guardrails</summary><div className="grid grid-cols-2 gap-2 mt-2">{([['Session start UTC',sessionStart,setSessionStart],['Session end UTC',sessionEnd,setSessionEnd],['Max trades per day',maxTrades,setMaxTrades],['Stop after daily losses',lossLimit,setLossLimit],['Max daily loss USD',dailyLoss,setDailyLoss]] as const).map(([label,value,set])=><Field key={label} label={label}><input type="number" aria-label={`Practice ${label}`} value={value} onChange={e=>set(e.target.value)} className={inputCls}/></Field>)}</div><p className="text-[10px] text-slate-500 mt-2">Blank disables a limit. Limits use closed practice results on the UTC entry day; pending orders are checked again at execution. Breakeven applies from the next bar after its threshold.</p></details>
              <p className="text-[11px] text-slate-500">Practice balance: {money(balance)}{data?.trade && data.trade.accountCurrency !== 'USD' ? ` · recorded account is ${data.trade.accountCurrency}; no conversion applied` : useJournalSetup && data?.trade?.equityAtEntry != null ? ' · from recorded USD entry equity' : ''}</p>
              <div className="grid grid-cols-2 gap-1.5">
                <button type="button" aria-pressed={side === 1} disabled={autoReview} onClick={() => {setSide(1);setTicketEdited(true);}} className={`h-10 rounded-lg text-sm font-bold disabled:opacity-50 ${side === 1 ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'}`}>Buy / Long</button>
                <button type="button" aria-pressed={side === -1} disabled={autoReview} onClick={() => {setSide(-1);setTicketEdited(true);}} className={`h-10 rounded-lg text-sm font-bold disabled:opacity-50 ${side === -1 ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-500'}`}>Sell / Short</button>
              </div>
              <Segmented size="sm" label="Order type" value={otype} onChange={v=>{setOtype(v);setTicketEdited(true);}} disabled={autoReview ? { market: 'Exit closed-trade review to edit the order', limit: 'Exit closed-trade review to edit the order', stop: 'Exit closed-trade review to edit the order' } : {}} options={[{ id: 'market', label: 'Market', title: 'Fills at the next bar open' }, { id: 'limit', label: 'Limit', title: 'Fills only if price trades through your price' }, { id: 'stop', label: 'Stop', title: 'Fills when price reaches your price' }]} />
              {otype !== 'market' && <Field label="Order price"><input type="number" step="any" aria-label="Order price" disabled={autoReview} placeholder={last ? priceFmt(last.c, dp) : ''} value={oprice} onChange={(e) => setOprice(e.target.value)} className={inputCls} /></Field>}
              <div className="grid grid-cols-2 gap-2">
                <Field label="Stop loss"><input type="number" step="any" aria-label="Stop loss price" disabled={autoReview} placeholder={Number.isFinite(autoStop) ? priceFmt(autoStop, dp) : ''} value={stopPx} onChange={(e) => {setStopPx(e.target.value);setStopFraction(1);}} className={inputCls} /></Field>
                <Field label="Take profit"><input type="number" step="any" aria-label="Take profit price" disabled={autoReview} placeholder={Number.isFinite(targetVal) ? priceFmt(targetVal, dp) : ''} value={targetPx} onChange={(e) => setTargetPx(e.target.value)} className={inputCls} /></Field>
              </div>
              <div className="flex items-center gap-2">
                <Field label="Risk" className="w-24"><div className="flex items-center gap-1"><input type="number" step="0.01" min={0.01} max={100} aria-label="Risk percent" disabled={autoReview} value={riskPct} onChange={(e) => setRiskPct(Number(e.target.value))} className={inputCls} /><span className="text-xs text-slate-500">%</span></div></Field>
                <div className="flex-1 rounded-lg bg-slate-50 px-3 py-2 text-[11px] tabular-nums">
                  <p>Size <b>{sizeNow > 0 ? sizeNow : '—'}</b> {data?.sizeUnit ?? ''}</p>
                  {data?.trade && <label className="flex items-center gap-1.5 mt-1 cursor-pointer"><input type="checkbox" aria-label="Use recorded position size" disabled={autoReview || data.trade.quantityUnit !== data.sizeUnit || !symbolSpec(data.symbol) || data.trade.size < data.minSize || Math.abs(data.trade.size / (symbolSpec(data.symbol)?.sizeStep ?? 1) - Math.round(data.trade.size / (symbolSpec(data.symbol)?.sizeStep ?? 1))) >= 1e-6} checked={useRecordedSize} onChange={event => setUseRecordedSize(event.target.checked)} />Use recorded size<JournalHelp label="Use recorded size" /></label>}
                  <p>Reward:risk <b className={rrNow >= 2 ? 'text-emerald-700' : rrNow >= 1 ? 'text-[#0b1c30]' : 'text-rose-600'}>{Number.isFinite(rrNow) ? `1 : ${rrNow.toFixed(2)}` : '—'}</b></p>
                </div>
              </div>
              <button type="button" disabled={!!ticketProblem} title={ticketProblem ?? undefined} onClick={() => place()}
                className={`w-full h-11 rounded-lg text-sm font-bold text-white disabled:opacity-40 ${side === 1 ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'}`}>
                {side === 1 ? 'Buy' : 'Sell'} {otype === 'market' ? 'at market' : otype}
              </button>
              {ticketProblem && data && <p className="text-[11px] text-slate-500">{ticketProblem}</p>}
              {pending && (
                <div className="flex items-center justify-between rounded-lg border border-[#5338ec]/30 bg-[#FBFAFF] px-3 py-2 text-xs">
                  <span>Pending {pending.dir === 1 ? 'buy' : 'sell'} {pending.type}{pending.type !== 'market' ? ` @ ${priceFmt(pending.price, dp)}` : ''}</span>
                  <button type="button" aria-label="Cancel order" onClick={() => setPending(null)} className="p-1 rounded hover:bg-white"><X className="w-3.5 h-3.5" /></button>
                </div>
              )}
            </div>
          </Card>

          <Card title="Position" right={pos ? <Pill tone={pos.dir === 1 ? 'good' : 'bad'}>{pos.dir === 1 ? 'Long' : 'Short'} {pos.size}</Pill> : undefined}>
            {pos ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-[11px] tabular-nums">
                  <p className="text-slate-500">Entry <b className="block text-sm text-[#0b1c30]">{priceFmt(pos.entry, dp)}</b></p>
                  <p className="text-slate-500">Now <b className="block text-sm text-[#0b1c30]">{last ? priceFmt(last.c, dp) : '—'}</b></p>
                </div>
                <p className={`text-2xl font-bold tabular-nums ${tone(unreal)}`}>{money(unreal)} <span className="text-sm">{rr(unrealR)}</span></p>
                <div className="grid grid-cols-2 gap-1.5">
                  <button type="button" className={btnSecondary} onClick={() => { setPos({ ...pos, stop: pos.entry }); onToast('Stop moved to breakeven'); }} disabled={pos.stop === pos.entry}><ShieldCheck className="w-3.5 h-3.5" /> Stop to breakeven</button>
                  <button type="button" className={btnSecondary} onClick={() => closePos(true)}><Scissors className="w-3.5 h-3.5" /> Close half</button>
                  <button type="button" className={`${btnSecondary} col-span-2 text-rose-700 border-rose-200 hover:bg-rose-50`} onClick={() => closePos(false)}>Close at market</button>
                </div>
              </div>
            ) : <p className="text-xs text-slate-500">No open position.</p>}
          </Card>
        </div>
      </div>

      <Card title="Practice performance" sub="Cumulative simulated net P&L across completed sessions matching your filters.">
        {practicePerformanceSessions.length ? (
          <LineChart
            label="Cumulative net profit and loss across completed practice sessions"
            height={240}
            area
            yFmt={money}
            xFmt={(x) => `Session ${Math.round(x)}`}
            hLines={[{ y: 0, label: 'Break-even', color: '#94a3b8' }]}
            series={[{ name: 'Cumulative net', color: '#5338ec', points: practicePerformancePoints }]}
            tooltipDetail={(x) => {
              const sessionNumber = Math.round(x);
              if (sessionNumber < 1) return null;
              const index = Math.min(practicePerformanceSessions.length - 1, sessionNumber - 1);
              const session = practicePerformanceSessions[index];
              return session ? <p>{session.symbol} · {session.marketDate ?? session.finishedAt?.slice(0, 10) ?? 'Date unavailable'} · {money(session.net)} this session</p> : null;
            }}
          />
        ) : (
          <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-xs text-slate-500">Finish a practice session to build your performance chart.</p>
        )}
        <p className="mt-2 text-[10px] text-slate-500">Results use simulated fills on generated replay data and do not represent verified historical performance.</p>
      </Card>

      {/* Session telemetry */}
      <section className="bg-white border border-[#e2e8f0] rounded-2xl p-5" aria-label="Practice session">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
          <h3 className="text-sm font-bold text-[#0b1c30] mr-auto">This session</h3>
          {[['Trades', `${trades.length}`], ['Win rate', trades.length ? pct(wins / trades.length, 0) : '—'], ['Net', money(net)], ['Average', trades.length ? rr(avgR) : '—']].map(([k, v]) => (
            <div key={k} className="tabular-nums"><p className={`text-lg font-bold ${k === 'Net' ? tone(net) : 'text-[#0b1c30]'}`}>{v}</p><p className="text-[10px] uppercase tracking-wider text-slate-500">{k}</p></div>
          ))}
          <button type="button" className={btnPrimary} disabled={!data || finished} onClick={finish}><Flag className="w-4 h-4" /> Finish session</button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-4">
          <Field label="Tag this practice" hint="Your journal's own tags. Tags apply to the trades you close from now on.">
            <div className="flex flex-wrap gap-1.5">
              {allTags.map((t) => { const on = tags.includes(t); return <button key={t} type="button" aria-pressed={on} onClick={() => setTags(on ? tags.filter((x) => x !== t) : [...tags, t])} className={`h-7 px-2.5 rounded-full text-[11px] font-semibold border ${on ? 'bg-[#EEF0FE] border-[#5338ec]/40 text-[#5338ec]' : 'bg-white border-slate-200 text-[#474556]'}`}>{t}</button>; })}
            </div>
          </Field>
          <Field label="Notes" htmlFor="rp-notes" hint="Saved with this practice session.">
            <textarea id="rp-notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="What did you see? What would you do differently?" className="w-full resize-y border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5338ec]/30" />
          </Field>
        </div>
        {finished && data && (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-[#0b1c30] space-y-1">
            <p className="font-bold flex items-center gap-1.5"><NotebookPen className="w-4 h-4" /> Session finished</p>
            <p>That was <b>{data.symbol}</b>, {data.dateLabel}. You took {trades.length} trade{trades.length === 1 ? '' : 's'} for {money(net)}.</p>
            {data.trade && <p>Your real trade was a {data.trade.direction === 'BUY' ? 'long' : 'short'} at {priceFmt(data.trade.entry, dp)}, closed at {priceFmt(data.trade.exit, dp)} for <b className={tone(data.trade.pnl)}>{rr(data.trade.r)}</b>{data.trade.mistakes.length ? ` (tagged ${data.trade.mistakes.join(', ')})` : ''}. It is marked on the chart.</p>}
            <button type="button" className={`${btnSecondary} mt-2`} onClick={loadSource}>Practise another</button>
          </div>
        )}
      </section>

      <section className="bg-white border border-[#e2e8f0] rounded-2xl p-5" aria-label="Practice log and performance">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-[#0b1c30]">Practice log and performance</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Completed simulated sessions matching the selected market, instrument and replay dates.</p>
          </div>
          <span className="text-[11px] text-slate-500 tabular-nums">{logSessions.length} session{logSessions.length === 1 ? '' : 's'}</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4">
          {[
            ['Sim trades', `${logTrades.length}`],
            ['Win rate', logTrades.length ? pct(logWins / logTrades.length, 0) : '—'],
            ['Net P&L', money(logNet)],
            ['Average R', logAvgR !== null ? rr(logAvgR) : '—'],
            ['Profit factor', logProfitFactor === null ? '—' : Number.isFinite(logProfitFactor) ? logProfitFactor.toFixed(2) : '∞'],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl bg-slate-50 px-3 py-2.5 tabular-nums">
              <p className={`text-base font-bold ${label === 'Net P&L' ? tone(logNet) : 'text-[#0b1c30]'}`}>{value}</p>
              <p className="text-[10px] uppercase tracking-wider text-slate-500">{label}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[10px] text-slate-500">Practice uses simulated fills on generated replay data; these results are not verified historical fills or evidence of future performance.</p>
        {logSessions.length ? (
          <>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[720px] text-xs tabular-nums">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] uppercase tracking-wider text-slate-500">
                    <th className="py-2 pr-3 text-left">Replay date</th>
                    <th className="px-3 py-2 text-left">Instrument<JournalHelp label="Instrument" /></th>
                    <th className="px-3 py-2 text-left">Source</th>
                    <th className="px-3 py-2 text-right">Trades<JournalHelp label="Trades" /></th>
                    <th className="px-3 py-2 text-right">Win rate<JournalHelp label="Win rate" /></th>
                    <th className="px-3 py-2 text-right">Net</th>
                    <th className="py-2 pl-3 text-right">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {logSessions.slice(0, 20).map((session) => {
                    const count = session.trades.length;
                    const wins = session.trades.filter((trade) => trade.net > 0).length;
                    const sessionDp = symbolSpec(session.symbol)?.priceDp ?? dp;
                    return (
                      <tr key={session.id} className="border-b border-slate-100 align-top">
                        <td className="py-2.5 pr-3">
                          <span className="font-semibold text-[#0b1c30]">{session.marketDate ?? 'Date not recorded'}</span>
                          <span className="block text-[10px] text-slate-400">{session.timeframe ?? session.label}</span>
                        </td>
                        <td className="px-3 py-2.5 font-semibold">{session.symbol}</td>
                        <td className="px-3 py-2.5 capitalize">{session.source}</td>
                        <td className="px-3 py-2.5 text-right">{count}</td>
                        <td className="px-3 py-2.5 text-right">{count ? pct(wins / count, 0) : '—'}</td>
                        <td className={`px-3 py-2.5 text-right font-semibold ${tone(session.net)}`}>{money(session.net)}</td>
                        <td className="py-2.5 pl-3 text-right">
                          <details className="text-left">
                            <summary className="cursor-pointer text-[#5338ec] font-semibold">{count ? 'View trades' : 'View notes'}</summary>
                            {count > 0 && (
                              <div className="mt-2 min-w-[360px] rounded-lg border border-slate-200 p-2">
                                <table className="w-full text-[10px] tabular-nums">
                                  <thead><tr className="text-slate-500"><th className="py-1 text-left">Opened</th><th className="py-1 text-left">Side<JournalHelp label="Side" /></th><th className="py-1 text-right">Entry<JournalHelp label="Entry" /></th><th className="py-1 text-right">Exit<JournalHelp label="Exit" /></th><th className="py-1 text-right">R</th><th className="py-1 text-right">Net</th></tr></thead>
                                  <tbody>{session.trades.map((trade, index) => (
                                    <tr key={`${session.id}-${index}`} className="border-t border-slate-100">
                                      <td className="py-1">{trade.entryTime ? dateTime(Date.parse(trade.entryTime), tz) : `Bar ${trade.entryBar + 1}`}</td>
                                      <td className="py-1 capitalize">{trade.dir}</td>
                                      <td className="py-1 text-right">{priceFmt(trade.entry, sessionDp)}</td>
                                      <td className="py-1 text-right">{priceFmt(trade.exit, sessionDp)}</td>
                                      <td className="py-1 text-right">{trade.r === null ? '—' : rr(trade.r)}</td>
                                      <td className={`py-1 text-right font-semibold ${tone(trade.net)}`}>{money(trade.net)}</td>
                                    </tr>
                                  ))}</tbody>
                                </table>
                                {session.notes && <p className="mt-2 whitespace-pre-wrap text-[10px] text-slate-600">{session.notes}</p>}
                                {session.tags.length > 0 && <p className="mt-1 text-[10px] text-slate-500">Tags: {session.tags.join(', ')}</p>}
                              </div>
                            )}
                            {!count && <p className="mt-2 min-w-[180px] whitespace-pre-wrap text-[10px] text-slate-600">{session.notes || 'No notes saved.'}</p>}
                          </details>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {logSessions.length > 20 && <p className="mt-2 text-[11px] text-slate-500">Showing the 20 most recent matching sessions of {logSessions.length}.</p>}
          </>
        ) : <p className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-xs text-slate-500">No saved practice sessions match the current instrument and replay date filters yet.</p>}
      </section>
    </div>
  );
};

import type { ReplayData } from './replay';
import type { PracticeFilter, PracticeTrade } from './store';
import type { RelatedReplaySetup } from './replaySetups';
import { journalSandbox } from '../components/journal/journalStorage';

export interface PendingPracticeOrder { dir:1|-1; type:'market'|'limit'|'stop'; price:number; stop:number; target:number|null; size:number }
export interface PracticePosition { dir:1|-1; entry:number; size:number; stop:number; target:number|null; entryBar:number; initRisk:number; tags:string[] }
export interface PracticeDraft {
  version:1; data:ReplayData; cursor:number; minCursor:number; sessionId:string; startedAt:string;
  pending:PendingPracticeOrder|null; pos:PracticePosition|null; trades:PracticeTrade[]; notes:string; tags:string[]; drawings:number[];
  source:'random'|'similar'|'journal'; filter:PracticeFilter; blind:boolean; useJournalSetup:boolean; pickId:string|null;
  side:1|-1; otype:'market'|'limit'|'stop'; oprice:string; riskPct:number; startingBalance:number; useRecordedSize:boolean; stopPx:string; targetPx:string;
  targetR:number; stopAtr:number; stopFraction:number; breakevenR:string; sessionStart:string; sessionEnd:string; maxTrades:string; lossLimit:string; dailyLoss:string;
  related:RelatedReplaySetup|null; ticketEdited:boolean;
}
const key = journalSandbox ? 'ms_backtest_test_practice_draft_v1' : 'ms_backtest_practice_draft_v1';
const record = (value:unknown):value is Record<string,unknown> => !!value && typeof value==='object' && !Array.isArray(value);
const strings = (value:unknown):value is string[] => Array.isArray(value) && value.every(v=>typeof v==='string');
const finite = (value:unknown):value is number => typeof value==='number' && Number.isFinite(value);
const positive = (value:unknown) => finite(value) && value>0;
const direction = (value:unknown) => value===1 || value===-1;
const orderType = (value:unknown) => value==='market' || value==='limit' || value==='stop';
export function validPracticeDraft(value:unknown):value is PracticeDraft {
  if (!record(value) || value.version!==1 || !record(value.data)) return false;
  const data=value.data;
  if (!Array.isArray(data.bars) || !data.bars.length || !data.bars.every(b=>record(b) &&
    ['t','o','h','l','c','v'].every(k=>finite(b[k])) && positive(b.o) && positive(b.c) && Number(b.l)<=Number(b.h))) return false;
  if (!['id','symbol','tf','sizeUnit','label','dateLabel'].every(k=>typeof data[k]==='string') ||
    !['5m','15m','1h','4h','1D'].includes(String(data.tf)) || !['random','similar','journal'].includes(String(data.source)) ||
    !['tick','multiplier','minSize'].every(k=>positive(data[k])) || !finite(data.dp) ||
    !Number.isInteger(data.start) || Number(data.start)<1 || Number(data.start)>=data.bars.length) return false;
  if (data.trade !== undefined && (!record(data.trade) || !['id','date','strategy','accountCurrency','setupNotes','direction'].every(k=>typeof data.trade[k]==='string') ||
    !['entry','exit','entryIndex','exitIndex','size','pnl'].every(k=>finite(data.trade[k])) || !strings(data.trade.tags) || !strings(data.trade.mistakes))) return false;
  if (!Number.isInteger(value.cursor) || Number(value.cursor)<Number(data.start) || Number(value.cursor)>data.bars.length ||
    !Number.isInteger(value.minCursor) || Number(value.minCursor)<Number(data.start) || Number(value.minCursor)>Number(value.cursor)) return false;
  if (!['sessionId','startedAt','notes','oprice','stopPx','targetPx','breakevenR','sessionStart','sessionEnd','maxTrades','lossLimit','dailyLoss'].every(k=>typeof value[k]==='string') ||
    !Number.isFinite(Date.parse(String(value.startedAt))) || !strings(value.tags) ||
    !Array.isArray(value.drawings) || !value.drawings.every(finite)) return false;
  if (!['blind','useJournalSetup','useRecordedSize','ticketEdited'].every(k=>typeof value[k]==='boolean') ||
    !['riskPct','startingBalance','targetR','stopAtr','stopFraction'].every(k=>finite(value[k])) ||
    !direction(value.side) || !orderType(value.otype) || !['random','similar','journal'].includes(String(value.source))) return false;
  if (!record(value.filter) || !strings(value.filter.markets) || !strings(value.filter.symbols) ||
    !['playbook','mistake','result'].every(k=>typeof value.filter[k]==='string') || (value.pickId!==null && typeof value.pickId!=='string')) return false;
  if (value.related!==null && (!record(value.related) || typeof value.related.id!=='string' || !strings(value.related.symbols))) return false;
  for (const position of [value.pos,value.pending]) {
    if (position===null) continue;
    if (!record(position) || !direction(position.dir) || !positive(position.size) || !positive(position.stop) ||
      (position.target!==null && !positive(position.target))) return false;
  }
  if (value.pending!==null && (!record(value.pending) || !orderType(value.pending.type) || !positive(value.pending.price))) return false;
  if (value.pos!==null && (!record(value.pos) || !positive(value.pos.entry) || !positive(value.pos.initRisk) ||
    !Number.isInteger(value.pos.entryBar) || Number(value.pos.entryBar)>=Number(value.cursor) || !strings(value.pos.tags))) return false;
  return Array.isArray(value.trades) && value.trades.every(t=>record(t) &&
    ['long','short'].includes(String(t.dir)) && ['entry','exit','size'].every(k=>positive(t[k])) &&
    finite(t.net) && (t.r===null || finite(t.r)) && Number.isInteger(t.entryBar) && Number.isInteger(t.exitBar) && strings(t.tags));
}
export function loadPracticeDraft(): { draft:PracticeDraft|null; error:string } {
  try {
    const raw=localStorage.getItem(key);
    if (!raw) return {draft:null,error:''};
    const parsed:unknown=JSON.parse(raw);
    if (!validPracticeDraft(parsed)) throw Error('Unsupported or damaged practice draft');
    return {draft:parsed,error:''};
  } catch (error) {
    return {draft:null,error:error instanceof Error?error.message:'Practice draft could not be read'};
  }
}
export function savePracticeDraft(draft:PracticeDraft):boolean {
  if (!validPracticeDraft(draft)) return false;
  try { localStorage.setItem(key,JSON.stringify(draft)); return true; } catch { return false; }
}
export function clearPracticeDraft():boolean {
  try { localStorage.removeItem(key); return true; } catch { return false; }
}

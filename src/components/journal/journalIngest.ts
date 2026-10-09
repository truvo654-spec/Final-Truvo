// Statement ingestion for the journal: CSV parsing, automatic header mapping,
// row conversion and duplicate detection. Pure functions, no React.
import { JournalEntry, PortfolioAssetClass } from '../../types';
import { timestampMs } from './journalMath';

export type IngestField =
  | 'time'
  | 'symbol'
  | 'side'
  | 'entry'
  | 'exit'
  | 'qty'
  | 'pnl'
  | 'fee'
  | 'ticket';

export const INGEST_FIELDS: { key: IngestField; label: string; type: string; aliases: string[] }[] = [
  { key: 'time', label: 'Execution time', type: 'Timestamp', aliases: ['datetime', 'datetimeutc', 'executiontime', 'exectime', 'entrytime', 'opentime', 'timestamp', 'time', 'date'] },
  { key: 'symbol', label: 'Symbol / ticker', type: 'Text', aliases: ['symbol', 'instrument', 'contract', 'ticker', 'pair', 'market', 'product'] },
  { key: 'side', label: 'Direction (LONG/SHORT)', type: 'Enum flag', aliases: ['orderside', 'side', 'direction', 'buysell', 'action', 'type'] },
  { key: 'entry', label: 'Entry / fill price', type: 'Decimal', aliases: ['entryprice', 'openprice', 'fillprice', 'execavgprice', 'avgfillprice', 'avgprice', 'price'] },
  { key: 'exit', label: 'Exit price', type: 'Decimal', aliases: ['exitprice', 'closeprice'] },
  { key: 'qty', label: 'Quantity (source units)', type: 'Number', aliases: ['contractsizeqty', 'quantity', 'qty', 'size', 'volume', 'lots', 'filled', 'contracts'] },
  { key: 'pnl', label: 'Reported P&L (gross / net)', type: 'Currency', aliases: ['realizedpnlusd', 'realizedpnl', 'grosspnl', 'pnl', 'profitloss', 'profit', 'netpnl'] },
  { key: 'fee', label: 'Commissions / fees', type: 'Currency', aliases: ['exchangefeetotal', 'commissions', 'commission', 'fees', 'fee'] },
  { key: 'ticket', label: 'Ticket / order ID', type: 'ID', aliases: ['orderticketid', 'ticketid', 'ticket', 'orderid', 'tradeid', 'dealid', 'id'] },
];

export interface ColumnMapping {
  header: string;
  field: IngestField | null;
  confidence: number; // 0..100
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

/** RFC-4180-ish CSV parser (quotes, escaped quotes, CRLF). Auto-detects , ; or tab. */
export function parseCsv(text: string): string[][] {
  const clean = text.replace(/^﻿/, '');
  const firstLine = clean.split(/\r?\n/, 1)[0] || '';
  const delim = [',', ';', '\t'].reduce((best, d) => (firstLine.split(d).length > firstLine.split(best).length ? d : best), ',');
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < clean.length; i++) {
    const c = clean[i];
    if (quoted) {
      if (c === '"' && clean[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === delim) { row.push(cell); cell = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && clean[i + 1] === '\n') i++;
      row.push(cell); cell = '';
      if (row.some((v) => v.trim() !== '')) rows.push(row);
      row = [];
    } else cell += c;
  }
  row.push(cell);
  if (row.some((v) => v.trim() !== '')) rows.push(row);
  return rows;
}

/** Map each raw header to the best journal field. Each field is used at most once. */
export function autoMap(headers: string[]): ColumnMapping[] {
  const scored = headers.map((h) => {
    const n = norm(h);
    let best: { field: IngestField; score: number } | null = null;
    for (const f of INGEST_FIELDS) {
      f.aliases.forEach((a, idx) => {
        let score = 0;
        if (n === a) score = 100 - idx; // earlier aliases are more specific
        else if (n.length > 3 && (n.includes(a) && a.length > 3)) score = 70 - idx;
        if (score > 0 && (!best || score > best.score)) best = { field: f.key, score };
      });
    }
    return best as { field: IngestField; score: number } | null;
  });
  const used = new Set<IngestField>();
  const order = scored
    .map((s, i) => ({ s, i }))
    .filter((x) => x.s)
    .sort((a, b) => b.s!.score - a.s!.score);
  const result: ColumnMapping[] = headers.map((header) => ({ header, field: null, confidence: 0 }));
  for (const { s, i } of order) {
    if (used.has(s!.field)) continue;
    used.add(s!.field);
    result[i] = { header: headers[i], field: s!.field, confidence: Math.max(40, Math.min(100, Math.round(s!.score))) };
  }
  return result;
}

const toNum = (v: string | undefined) => {
  if (v === undefined) return NaN;
  const t = v.trim().replace(/[$,\s]/g, '');
  const neg = /^\(.*\)$/.test(t);
  const n = t ? Number(t.replace(/[()]/g, '')) : NaN;
  return neg ? -n : n;
};

const toSide = (v: string | undefined): 'BUY' | 'SELL' | null => {
  const t = (v || '').trim().toLowerCase();
  if (['buy', 'long', 'b', 'bought', '1'].includes(t)) return 'BUY';
  if (['sell', 'short', 's', 'sold', '-1'].includes(t)) return 'SELL';
  return null;
};

export const guessAssetClass = (symbol: string): PortfolioAssetClass => {
  const s = symbol.toUpperCase();
  if (/^(BTC|ETH|SOL|USDT|USDC|XRP)(?:[\/-]?(USD|USDT|USDC|EUR|GBP|BTC|ETH))?$/.test(s)) return 'Crypto';
  if (/^(XAU|XAG|WTI|BRENT|CL|GC|SI|NG)/.test(s)) return 'Commodity';
  if (/^(NQ|ES|YM|RTY|US500|NAS100|US30|GER40|DAX|SPX|NDX)/.test(s)) return 'Indices';
  if (/^[A-Z]{3}\/?[A-Z]{3}$/.test(s)) return 'Forex';
  return 'Stocks';
};

const toIso = (v: string | undefined, offset: string): { date: string; time?: string } | null => {
  const t = (v || '').trim();
  if (!/^\d{4}-\d\d-\d\d(?:[T ]\d\d:\d\d(?::\d\d(?:\.\d+)?)?(?:Z|[+-]\d\d:\d\d)?)?$/.test(t)) return null;
  const day=t.slice(0,10);
  const calendarDate=new Date(`${day}T00:00:00Z`);
  if(!Number.isFinite(calendarDate.getTime()) || calendarDate.toISOString().slice(0,10)!==day)return null;
  if(t.length===10)return {date:day};
  const s=t.replace(' ','T');
  const d=new Date(/[zZ]|[+-]\d\d:\d\d$/.test(s)?s:`${s}${offset==='UTC'?'Z':offset}`);
  if(!Number.isFinite(d.getTime()))return null;
  const iso=d.toISOString(); return {date:iso.slice(0,10),time:iso};
};

export interface ParsedRow {
  line: number; // 1-based line in the file (header is line 1)
  entry?: JournalEntry;
  status: 'ok' | 'duplicate' | 'invalid';
  reason?: string;
}

export const dedupeKey = (e: Pick<JournalEntry, 'accountId' | 'ticketId' | 'symbol' | 'entryTime' | 'date' | 'entryPrice' | 'size' | 'direction'>) =>
  `${e.accountId || 'legacy-demo'}|${e.ticketId ? `t:${e.ticketId}` : `k:${e.symbol}|${e.entryTime ? timestampMs(e.entryTime) : e.date}|${e.entryPrice}|${e.size}|${e.direction}`}`;

export function convertRows(
  rows: string[][],
  mapping: ColumnMapping[],
  existing: JournalEntry[],
  defaults: { strategy: string; accountId?: string; currency?: string; timezone?: string; pnlBasis?: 'gross' | 'net'; quantityUnit?: string }
): ParsedRow[] {
  const col = (f: IngestField) => mapping.findIndex((m) => m.field === f);
  const idx = Object.fromEntries(INGEST_FIELDS.map((f) => [f.key, col(f.key)])) as Record<IngestField, number>;
  const seen = new Set(existing.map((e) => dedupeKey(e)));
  const out: ParsedRow[] = [];
  rows.forEach((r, i) => {
    const line = i + 2;
    const get = (f: IngestField) => (idx[f] >= 0 ? r[idx[f]] : undefined);
    const symbol = (get('symbol') || '').trim().toUpperCase();
    const side = toSide(get('side'));
    const entryPrice = toNum(get('entry'));
    const size = toNum(get('qty'));
    if (!symbol) return out.push({ line, status: 'invalid', reason: 'Missing symbol' });
    if (!side) return out.push({ line, status: 'invalid', reason: 'Direction not recognised (use BUY/SELL or LONG/SHORT)' });
    if (!Number.isFinite(entryPrice) || entryPrice <= 0) return out.push({ line, status: 'invalid', reason: 'Missing or invalid positive price' });
    if (isNaN(size) || size <= 0) return out.push({ line, status: 'invalid', reason: 'Missing or invalid quantity' });
    const exit = toNum(get('exit'));
    if(get('exit')?.trim() && (!Number.isFinite(exit) || exit<=0)) return out.push({line,status:'invalid',reason:'Invalid exit price'});
    const exitPrice = isNaN(exit) ? null : exit;
    const pnlRaw = toNum(get('pnl'));
    const fee = toNum(get('fee'));
    const t = toIso(get('time'),defaults.timezone || 'UTC');
    if(!t)return out.push({line,status:'invalid',reason:'Missing/invalid ISO execution date or time; no date was invented'});
    if(get('fee')?.trim() && !Number.isFinite(fee))return out.push({line,status:'invalid',reason:'Invalid fee'});
    if(Number.isFinite(fee) && fee<0)return out.push({line,status:'invalid',reason:'Use non-negative cost magnitudes. Negative expense signs or rebates need source reconciliation before import.'});
    if(get('pnl')?.trim() && !Number.isFinite(pnlRaw))return out.push({line,status:'invalid',reason:'Invalid reported P&L'});
    let pnl = pnlRaw;
    if (isNaN(pnl)) {
      if(exitPrice!==null)return out.push({line,status:'invalid',reason:'Closed results require reported P&L; instrument valuation is not assumed'});
      pnl = 0;
    }
    const netBasis=defaults.pnlBasis==='net' || /netpnl/.test(norm(mapping[idx.pnl]?.header || ''));
    if(netBasis && !Number.isFinite(fee))return out.push({line,status:'invalid',reason:'Net P&L requires known costs (enter explicit zero when applicable) to preserve gross result'});
    if(netBasis)pnl+=Math.abs(fee);
    const hasResult = !isNaN(pnlRaw) || exitPrice !== null;
    const outcome = !hasResult ? 'open' : pnl > 0 ? 'win' : pnl < 0 ? 'loss' : 'breakeven';
    const ticket = (get('ticket') || '').trim();
    const entry: JournalEntry = {
      id: crypto.randomUUID(),
      accountId:defaults.accountId, accountCurrency:defaults.currency || 'USD', sourceTimezone:defaults.timezone || 'UTC', quantityUnit:defaults.quantityUnit || 'unknown',
      tradingStatus:hasResult?'closed':'open', pnlKnown:hasResult, reviewState:'needs_review', mistakesReviewed:false,
      date: t.date,
      symbol,
      assetClass: /^shares?$/i.test(defaults.quantityUnit || '')?'Stocks':guessAssetClass(symbol),
      direction: side,
      entryPrice,
      exitPrice,
      size,
      pnl,
      rMultiple: null,
      outcome,
      strategy: defaults.strategy,
      tags: ['Imported'],
      setupNotes: '',
      emotionBefore: null,
      emotionAfter: null,
      followedPlan: null,
      checklistDone: [],
      mistakes: [],
      lessons: '',
      rating: null,
      source: 'manual',
      commission: isNaN(fee) ? undefined : Math.abs(fee),
      entryTime: t.time,
      ticketId: ticket || undefined,
    };
    const key = dedupeKey(entry);
    if (seen.has(key)) return out.push({ line, entry, status: 'duplicate', reason: ticket ? `Ticket ${ticket} already journaled` : 'Same trade already journaled' });
    seen.add(key);
    out.push({ line, entry, status: 'ok' });
  });
  return out;
}

export const SAMPLE_CSV = [
  'DateTime_UTC,Instrument / Contract,Order_Side,Exec_Avg_Price,Contract_Size_Qty,Realized_PnL_USD,Exchange_Fee_Total,Order_Ticket_ID',
  '2026-10-07 14:32:04,NQZ26,BUY,20412.50,3,1315.00,12.60,TRD-88231',
  '2026-10-07 15:10:41,ESZ26,SELL,5832.25,2,-212.50,8.40,TRD-88244',
  '2026-10-07 16:02:19,EUR/USD,BUY,1.0912,1,64.00,3.50,TRD-88260',
].join('\n');

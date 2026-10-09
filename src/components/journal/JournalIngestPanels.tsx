import React, { useMemo, useRef, useState } from 'react';
import { Broker, JournalEntry } from '../../types';
import { INGEST_FIELDS, IngestField, ColumnMapping, SAMPLE_CSV, autoMap, convertRows, parseCsv } from './journalIngest';
import { useJournalState, saveJournalValue } from './journalStorage';
import { metrics } from './journalMath';

const MAX_BYTES = 10 * 1024 * 1024;
const MAX_ROWS = 5000;

interface UploadProps {
  existing: JournalEntry[];
  strategy: string;
  onImport: (entries: JournalEntry[]) => void;
}

export const StatementUploadPanel: React.FC<UploadProps> = ({ existing, strategy, onImport }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [drag, setDrag] = useState(false);
  const [rows, setRows] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<ColumnMapping[]>([]);
  const [accountId,setAccountId] = useState('');
  const [currency,setCurrency] = useState('USD');
  const [timezone,setTimezone] = useState('UTC');
  const [pnlBasis,setPnlBasis] = useState<'gross'|'net'>('gross');
  const [unit,setUnit] = useState('');
  const [history,setHistory,historyFailed] = useJournalState<{id:string;at:string;file:string;account:string;currency:string;imported:number;duplicate:number;invalid:number;net:number}[]>('imports',[]);

  const handleFile = async (file?: File) => {
    if (!file) return;
    setError('');
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'csv' && ext !== 'txt') {
      setError(`${ext?.toUpperCase() || 'This file type'} parsing isn't available in this build yet. Export the statement as CSV and upload that.`);
      return;
    }
    if (file.size > MAX_BYTES) {
      setError('File is larger than 10 MB. Split it by date range and upload in parts.');
      return;
    }
    const parsed = parseCsv(await file.text());
    if (parsed.length < 2) {
      setError('No data rows found. The first row must be the column headers.');
      return;
    }
    if (parsed.length - 1 > MAX_ROWS) {
      setError(`Too many rows (${parsed.length - 1}). The limit is ${MAX_ROWS} per upload.`);
      return;
    }
    setFileName(file.name);
    setMapping(autoMap(parsed[0]));
    setRows(parsed.slice(1));
  };

  const setField = (i: number, field: IngestField | '') =>
    setMapping((prev) =>
      prev.map((m, j) => {
        if (j === i) return { ...m, field: field || null, confidence: field ? 100 : 0 };
        // a destination can only be fed by one column
        return field && m.field === field ? { ...m, field: null, confidence: 0 } : m;
      })
    );

  const parsed = useMemo(
    () => (rows.length ? convertRows(rows, mapping, existing, { strategy,accountId,currency,timezone,pnlBasis,quantityUnit:unit || undefined }) : []),
    [rows, mapping, existing, strategy,accountId,currency,timezone,pnlBasis,unit]
  );
  const ok = parsed.filter((p) => p.status === 'ok');
  const dup = parsed.filter((p) => p.status === 'duplicate');
  const bad = parsed.filter((p) => p.status === 'invalid');
  const matched = mapping.filter((m) => m.field).length;
  const required: IngestField[] = ['time', 'symbol', 'side', 'entry', 'qty'];
  const missing = required.filter((f) => !mapping.some((m) => m.field === f));

  const downloadSample = () => {
    const url = URL.createObjectURL(new Blob([SAMPLE_CSV], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_fills.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-3 text-xs">
        <label>Account identity (required)<input aria-label="Import account identity" className="block w-full border border-slate-200 rounded-lg p-2 mt-1" placeholder="Broker + account name or ID" value={accountId} onChange={e=>setAccountId(e.target.value)}/></label>
        <label>Account currency<select aria-label="Import currency" className="block w-full border border-slate-200 rounded-lg p-2 mt-1" value={currency} onChange={e=>setCurrency(e.target.value)}>{['USD','EUR','GBP','THB','JPY','AUD','CAD','CHF','SGD'].map(c=><option key={c}>{c}</option>)}</select></label>
        <label>Source UTC offset<select aria-label="Source UTC offset" className="block w-full border border-slate-200 rounded-lg p-2 mt-1" value={timezone} onChange={e=>setTimezone(e.target.value)}>{['UTC','-05:00','-04:00','+01:00','+02:00','+07:00','+08:00','+09:00'].map(t=><option key={t}>{t}</option>)}</select></label>
        <label>Statement P&amp;L basis<select aria-label="Statement P&L basis" className="block w-full border border-slate-200 rounded-lg p-2 mt-1" value={pnlBasis} onChange={e=>setPnlBasis(e.target.value as 'gross'|'net')}><option value="gross">Gross (fees separate)</option><option value="net">Net (fees already deducted)</option></select></label>
        <label>Quantity unit<input aria-label="Import quantity unit" className="block w-full border border-slate-200 rounded-lg p-2 mt-1" placeholder="lots, shares, contracts, BTC…" value={unit} onChange={e=>setUnit(e.target.value)}/></label>
      </div>
      <p className="text-xs text-slate-500">ISO dates required. Timestamp offsets take precedence; otherwise the source offset above is used. Use offset-bearing timestamps across daylight-saving changes. Costs must be non-negative expense magnitudes; rebates need separate reconciliation. Net-named columns are treated as net and known costs reconstruct gross. No currency conversion or price-based profit estimates.</p>
      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files?.[0]); }}
        className={`rounded-xl border-2 border-dashed px-4 py-6 text-center transition-colors ${drag ? 'border-[#5338ec] bg-[#F8F7FF]' : 'border-slate-200'}`}
      >
        <p className="text-sm font-bold">Drag &amp; drop a statement CSV, or{' '}
          <label className="text-[#5338ec] cursor-pointer underline">
            browse files
            <input ref={inputRef} type="file" accept=".csv,.txt,text/csv" className="hidden" aria-label="Upload statement file" onChange={(e) => { handleFile(e.target.files?.[0]); e.target.value = ''; }} />
          </label>
        </p>
        <p className="text-[11px] text-[#94a3b8] mt-1">CSV up to 10 MB · {MAX_ROWS} rows · XLSX / PDF coming later · duplicates are skipped automatically</p>
        <button type="button" onClick={downloadSample} className="text-[11px] font-semibold text-[#5338ec] underline mt-2">Download a sample CSV</button>
      </div>

      {error && <p role="alert" className="text-xs font-semibold text-rose-600">{error}</p>}

      {rows.length > 0 && (
        <>
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#0b1c30]">{fileName} · {rows.length} row{rows.length > 1 ? 's' : ''}</span>
            <span className={`font-bold ${missing.length ? 'text-amber-600' : 'text-emerald-600'}`}>
              {matched} of {mapping.length} columns matched
            </span>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="grid grid-cols-[1fr_1fr_56px] gap-2 bg-slate-50 px-3 py-2 text-[10px] font-bold uppercase tracking-wide text-[#474556]">
              <span>File column</span><span>Journal field</span><span className="text-right">Match</span>
            </div>
            {mapping.map((m, i) => (
              <div key={i} className="grid grid-cols-[1fr_1fr_56px] items-center gap-2 px-3 py-1.5 border-t border-slate-100 text-xs">
                <span className="font-mono truncate" title={m.header}>{m.header}</span>
                <select
                  aria-label={`Map column ${m.header}`}
                  value={m.field ?? ''}
                  onChange={(e) => setField(i, e.target.value as IngestField | '')}
                  className="border border-slate-200 rounded-lg px-2 py-1 text-xs"
                >
                  <option value="">Ignore</option>
                  {INGEST_FIELDS.map((f) => <option key={f.key} value={f.key}>{f.label}</option>)}
                </select>
                <span className={`text-right font-bold ${m.field ? 'text-emerald-600' : 'text-slate-400'}`}>{m.field ? `${m.confidence}%` : '—'}</span>
              </div>
            ))}
          </div>

          {missing.length > 0 && (
            <p role="alert" className="text-xs font-semibold text-amber-600">
              Map these required fields to continue: {missing.map((f) => INGEST_FIELDS.find((x) => x.key === f)!.label).join(', ')}.
            </p>
          )}

          <div className="flex flex-wrap gap-3 text-xs font-semibold">
            <span className="text-emerald-600">{ok.length} ready</span>
            <span className="text-slate-500">{dup.length} duplicate{dup.length === 1 ? '' : 's'} skipped</span>
            <span className={bad.length ? 'text-rose-600' : 'text-slate-500'}>{bad.length} invalid</span>
          </div>
          <div className="overflow-x-auto border border-slate-200 rounded-xl"><table className="w-full text-xs"><caption className="text-left p-2 font-bold">Import preview · first 10 rows · {currency}</caption><thead><tr>{['Line','Instrument','UTC entry date','Status','Gross','Costs','Validation'].map(h=><th key={h} className="p-2 text-left">{h}</th>)}</tr></thead><tbody>{parsed.slice(0,10).map(p=><tr key={p.line} className="border-t border-slate-100">{[p.line,p.entry?.symbol || '—',p.entry?.entryTime || p.entry?.date || '—',p.entry?.tradingStatus || '—',p.entry?.pnlKnown===false?'Unknown':p.entry?.pnl ?? '—',p.entry?.commission ?? 'Unknown',p.reason || p.status].map((v,i)=><td key={i} className="p-2">{v}</td>)}</tr>)}</tbody></table></div>
          <p className="text-xs">Reconciliation: {ok.length+dup.length+bad.length}/{rows.length} rows accounted for · eligible net total {metrics(ok.map(p=>p.entry!)).total.toFixed(2)} {currency}. Rows with unknown costs are excluded from net.</p>
          {(bad.length > 0 || dup.length > 0) && (
            <ul className="max-h-24 overflow-y-auto text-[11px] text-[#474556] space-y-0.5 border border-slate-100 rounded-lg p-2">
              {[...bad, ...dup].slice(0, 20).map((p) => (
                <li key={p.line}>Line {p.line}: {p.reason}</li>
              ))}
            </ul>
          )}

          <button
            type="button"
            disabled={ok.length === 0 || missing.length > 0 || !accountId.trim()}
            onClick={() => { const list=ok.map(p=>p.entry!);const next=[{id:crypto.randomUUID(),at:new Date().toISOString(),file:fileName,account:accountId,currency,imported:ok.length,duplicate:dup.length,invalid:bad.length,net:metrics(list).total},...history];if(historyFailed || !saveJournalValue('imports',next)){setError('Import history could not be saved. Your existing records were not changed. Free browser storage or export a backup first.');return;}setHistory(next);onImport(list); }}
            className="w-full bg-[#5338ec] hover:bg-[#4326d8] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
          >
            Import {ok.length} trade{ok.length === 1 ? '' : 's'}
          </button>
        </>
      )}
      {history.length>0 && <details><summary className="text-xs font-bold cursor-pointer">Import history ({history.length})</summary><ul className="text-xs space-y-2 mt-2">{history.map(h=><li key={h.id}>{h.at} · {h.file} · {h.account} · {h.imported} imported / {h.duplicate} duplicates / {h.invalid} invalid · eligible net {h.net.toFixed(2)} {h.currency}</li>)}</ul></details>}
    </div>
  );
};

const BrokerLogo: React.FC<{ name: string; src: string }> = ({ name, src }) => {
  const [failed, setFailed] = useState(false);
  return failed || !src ? (
    <span className="w-9 h-9 rounded-lg bg-[#EEF0FE] text-[#5338ec] text-xs font-bold flex items-center justify-center shrink-0">{name.slice(0, 2).toUpperCase()}</span>
  ) : (
    <img src={src} alt="" onError={() => setFailed(true)} className="w-9 h-9 rounded-lg object-cover shrink-0" />
  );
};

interface AutoSyncProps {
  brokers: Broker[];
  onConnect?: (broker: Broker) => void;
}

/** Sync Account tab: the same MarketSyde broker directory and Connect flow used on the Brokers pages. */
export const AutoSyncPanel: React.FC<AutoSyncProps> = ({ brokers, onConnect }) => {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('All');
  const cats = ['All', ...Array.from(new Set(brokers.map((b) => b.category)))];
  const list = brokers
    .filter((b) => (cat === 'All' || b.category === cat) && (b.name + ' ' + b.platforms.join(' ') + ' ' + b.regulations.join(' ')).toLowerCase().includes(q.trim().toLowerCase()))
    .sort((a, b) => Number(b.connected) - Number(a.connected) || (b.score ?? 0) - (a.score ?? 0));
  const linked = brokers.filter((b) => b.connected).length;
  return (
    <div className="space-y-3">
      <div role="note" className="rounded-xl bg-amber-50 border border-amber-200 px-3 py-2 text-[11px] text-amber-800">
        Linking records your trading account with MarketSyde. Automatic trade sync isn't live in this build yet, so bring trades in with <strong>Upload Statement</strong> for now.
      </div>
      <div className="flex items-center justify-between gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search brokers, platforms, regulators"
          aria-label="Search brokers"
          className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5338ec]/30"
        />
        <span className="text-xs font-bold text-[#5338ec] whitespace-nowrap">{linked} linked</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {cats.map((c) => (
          <button key={c} type="button" onClick={() => setCat(c)} aria-pressed={cat === c}
            className={`px-3 py-1 rounded-full text-xs font-semibold border ${cat === c ? 'bg-[#5338ec] border-[#5338ec] text-white' : 'bg-white border-slate-200 text-[#474556]'}`}>{c}</button>
        ))}
      </div>
      {list.length === 0 && <p className="text-sm text-[#474556] text-center py-6">No broker matches that search.</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {list.map((b) => (
          <div key={b.id} className="border border-slate-200 rounded-xl p-3 flex flex-col gap-2">
            <div className="flex items-start gap-2.5">
              <BrokerLogo name={b.name} src={b.logo} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold leading-tight truncate">
                  {b.name}{b.verified && <span className="ml-1 text-emerald-600" title="Verified">✓</span>}
                </p>
                <p className="text-[11px] text-[#94a3b8]">{b.category}{b.score ? ` · ${b.score.toFixed(1)}/10` : ''}</p>
              </div>
              {b.hasCashback && <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 rounded px-1.5 py-0.5 whitespace-nowrap">{b.maxCashback}</span>}
            </div>
            <p className="text-[11px] text-[#474556] truncate" title={b.platforms.join(', ')}>{b.platforms.join(' · ')}</p>
            <p className="text-[11px] text-[#94a3b8] truncate" title={b.regulations.join(', ')}>{b.regulations.slice(0, 3).join(' · ')}</p>
            {b.connected ? (
              <span className="self-start px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700">Linked ({b.connectedAccountId})</span>
            ) : (
              <button
                type="button"
                disabled={!onConnect}
                onClick={() => onConnect?.(b)}
                className="self-start px-3 py-1 rounded-lg text-xs font-semibold border border-[#5338ec] text-[#5338ec] hover:bg-[#F8F7FF] disabled:opacity-40"
              >
                Connect
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

import React, { useMemo, useState } from 'react';
import { JournalEntry } from '../../types';
import { UNASSIGNED, addMonth, monthCells, monthLabel } from './journalOverview';
import { useMoney } from './JournalCurrency';
import { eligible } from './journalMath';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const usdBase = (n: number) => `${n < 0 ? '-' : n > 0 ? '+' : ''}$${Math.abs(n) >= 1000 ? `${(Math.abs(n) / 1000).toFixed(1)}k` : Math.abs(n) < 10 ? Math.abs(n).toFixed(1) : Math.abs(n).toFixed(0)}`;
const usdFullBase = (n: number) => `${n < 0 ? '-' : n > 0 ? '+' : ''}$${Math.abs(n).toFixed(2)}`;

interface Props {
  month: string; // YYYY-MM
  onMonthChange: (ym: string) => void;
  entries: JournalEntry[];
  valueOf: (e: JournalEntry) => number;
  eligibleForValue?: (e:JournalEntry)=>boolean;
  unit?: 'usd' | 'pts';
  label: string; // e.g. "gross", "gross + cashback"
  brokerName: (id: string) => string;
  brokerColor: (id: string) => string;
  today: string;
  selected: string | null;
  onSelect: (iso: string | null) => void;
}

export const JournalCalendar: React.FC<Props> = ({ month, onMonthChange, entries, valueOf, eligibleForValue=eligible, unit = 'usd', label, brokerName, brokerColor, today, selected, onSelect }) => {
  const [mouseDay,setHoverDay] = useState<string|null>(null);
  const [focusedDay,setFocusedDay] = useState<string|null>(null);
  const hoverDay=focusedDay===''?null:focusedDay ?? mouseDay;
  const money=useMoney();
  const pts = unit === 'pts';
  const fmtP = (n: number, signed: boolean) => `${signed ? (n < 0 ? '-' : n > 0 ? '+' : '') : ''}${Math.abs(n) >= 1000 ? `${(Math.abs(n) / 1000).toFixed(1)}k` : Math.round(Math.abs(n))}`;
  const usd = (n: number) => (pts ? fmtP(n, true) : money(n,0));
  const usdFull = (n: number) => (pts ? `${fmtP(n, true)} pts` : money(n));
  const byDay = useMemo(() => {
    const m: Record<string, { n: number; known:number; pnl: number; by: Record<string, number> }> = {};
    entries.forEach((e) => {
      const d = (m[e.date] ||= { n: 0, known:0, pnl: 0, by: {} });
      const v = valueOf(e);
      const k = e.brokerId || UNASSIGNED;
      d.n += 1;
      if(eligibleForValue(e))d.known++;
      d.pnl += v;
      d.by[k] = (d.by[k] || 0) + v;
    });
    return m;
  }, [entries, valueOf, eligibleForValue]);

  const cells = monthCells(month);
  const inMonth = cells.filter((c): c is string => !!c && !!byDay[c]);
  const monthPnl = inMonth.reduce((a, c) => a + byDay[c].pnl, 0);
  const monthEntries = inMonth.reduce((a, c) => a + byDay[c].n, 0);
  const maxAbs = Math.max(1, ...inMonth.map((c) => Math.abs(byDay[c].pnl)));

  return (
    <div className="bg-white border border-[#e2e8f0] rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <button type="button" aria-label="Previous month" onClick={() => onMonthChange(addMonth(month, -1))} className="w-8 h-8 rounded-lg border border-slate-200 text-slate-600 hover:border-[#5338ec] hover:text-[#5338ec]">‹</button>
        <div className="text-center">
          <h4 className="text-sm font-bold">{monthLabel(month)}</h4>
          <p className={`text-[11px] font-mono font-semibold ${monthPnl > 0 ? 'text-emerald-600' : monthPnl < 0 ? 'text-rose-600' : 'text-[#94a3b8]'}`}>
            {monthEntries} entr{monthEntries === 1 ? 'y' : 'ies'} · {usdFull(monthPnl)} {label}
          </p>
        </div>
        <button type="button" aria-label="Next month" onClick={() => onMonthChange(addMonth(month, 1))} className="w-8 h-8 rounded-lg border border-slate-200 text-slate-600 hover:border-[#5338ec] hover:text-[#5338ec]">›</button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAYS.map((d) => <span key={d} className="text-[10px] font-semibold text-[#94a3b8] text-center">{d}</span>)}
      </div>
      <div className="grid grid-cols-7 gap-1" role="grid" aria-label={`Journal calendar, ${monthLabel(month)}`}>
        {cells.map((iso, i) => {
          if (!iso) return <span key={`b${i}`} />;
          const d = byDay[iso];
          const isSel = selected === iso;
          const isToday = iso === today;
          const intensity = d ? 0.15 + 0.5 * (Math.abs(d.pnl) / maxAbs) : 0;
          const bg = d ? (d.pnl > 0 ? `rgba(16,185,129,${intensity})` : d.pnl < 0 ? `rgba(244,63,94,${intensity})` : '#f1f5f9') : undefined;
          return (
            <button
              key={iso}
              type="button"
              role="gridcell"
              aria-pressed={isSel}
              aria-label={`${iso}: ${d ? `${d.n} entr${d.n === 1 ? 'y' : 'ies'}, ${usdFull(d.pnl)}${Object.keys(d.by).length > 1 ? ` (${(Object.entries(d.by) as [string, number][]).map(([k, v]) => `${brokerName(k)} ${usdFull(v)}`).join(', ')})` : ''}` : 'no entries'}`}
              aria-describedby={hoverDay===iso ? 'calendar-day-details' : undefined}
              onMouseEnter={()=>setHoverDay(iso)} onMouseLeave={()=>setHoverDay(null)}
              onFocus={()=>setFocusedDay(iso)} onBlur={()=>setFocusedDay(null)}
              onKeyDown={ev=>{if(ev.key==='Escape'){setFocusedDay('');setHoverDay(null);}}}
              onClick={() => onSelect(isSel ? null : iso)}
              style={bg ? { backgroundColor: bg } : undefined}
              className={`aspect-square max-h-12 rounded-lg p-1 text-left flex flex-col justify-between border transition-colors ${
                isSel ? 'border-[#5338ec] ring-2 ring-[#5338ec]/30' : isToday ? 'border-[#5338ec]/50' : 'border-transparent hover:border-slate-300'
              } ${d ? '' : 'bg-slate-50'}`}
            >
              <span className={`text-[10px] font-semibold ${isToday ? 'text-[#5338ec]' : 'text-[#474556]'}`}>{Number(iso.slice(8))}</span>
              {d && (
                <span className="flex items-end justify-between gap-0.5">
                  <span className="text-[10px] font-bold font-mono leading-none text-[#0b1c30]">{d.known?usd(d.pnl):'—'}</span>
                  <span className="flex gap-0.5 pb-px">
                    {Object.keys(d.by).slice(0, 3).map((k) => <span key={k} className="w-1.5 h-1.5 rounded-full ring-1 ring-white" style={{ backgroundColor: brokerColor(k) }} />)}
                  </span>
                </span>
              )}
            </button>
          );
        })}
      </div>
      {hoverDay && <div id="calendar-day-details" role="tooltip" className="mt-3 rounded-xl bg-[#F7F5FF] border border-purple-100 p-3 text-xs break-words"><p className="font-bold">{hoverDay} · {label}</p><p>{byDay[hoverDay]?.n || 0} recorded entries · {byDay[hoverDay]?.known || 0} eligible closed · realized value {byDay[hoverDay]?.known?usdFull(byDay[hoverDay].pnl):'unavailable'}</p>{Object.entries(byDay[hoverDay]?.by || {}).map(([id,value])=><p key={id}>{brokerName(id)}: {usdFull(Number(value))} (eligible results only)</p>)}</div>}
      <p className="text-[11px] text-[#94a3b8] mt-2">Green is profitable, red losing, zero neutral. Dots show brokers. Hover or focus a day for its broker split; select it for linked trades and a reflection. Escape dismisses details.</p>
    </div>
  );
};

import { HashtagLink } from '../hashtag/HashtagText';
import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, BellRing, Check, ChevronRight, Pencil, Pause, Plus, Star, Trash2, X } from 'lucide-react';
import type { EconomicEvent } from '../../types';
import { buildDemoIndicator, formatValue, type AlertType, type Delivery, type EconomicIndicator, type IndicatorAlert, type IndicatorRelation, type IndicatorTab, type SeriesPoint } from '../../data/economicIndicatorDemoData';
import { createMockEconomicCalendarProvider } from '../../data/economicCalendarProvider';

export type { EconomicIndicator } from '../../data/economicIndicatorDemoData';
interface EconomicIndicatorDetailPageProps {
  event: EconomicEvent;
  whenLabel: string;
  isWatched: boolean;
  alertLeadTime: number | null;
  hasAiAccess: boolean;
  onClose: () => void;
  onToggleWatch: () => void;
  onSetAlert: (leadTimeMinutes: number | null) => void;
  onNavigateToArticle?: (articleId: string) => void;
  onNavigateToInstrument?: (symbol: string) => void;
  onUpgradePrompt: () => void;
  onShowToast: (msg: string) => void;
}
const panel = 'overflow-hidden rounded-lg border border-[#e2e8f0] bg-white';
const cell = 'px-3 py-2.5';
const headings = 'bg-[#f8fafc] text-left text-[10px] font-semibold uppercase tracking-wide text-[#64748b]';
const alertConditions: Record<AlertType, string[]> = {
  Release: ['Before release', 'At release', 'After release'],
  Threshold: ['Greater than', 'Less than', 'Greater than or equal', 'Less than or equal', 'Cross above', 'Cross below'],
  Consensus: ['Actual above consensus', 'Actual below consensus', 'Absolute surprise exceeds'],
  Change: ['Absolute change exceeds', 'Percentage change exceeds'],
  Forecast: ['Forecast revision exceeds'],
  News: ['Relevant news published'],
};
const number = formatValue;
const signed = (value: number) => `${value > 0 ? '+' : ''}${number(value)}`;
const formatDate = (value: string) => new Date(value).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

function Section({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return <section className={panel}><div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#e2e8f0] px-4 py-3"><h2 className="text-sm font-bold">{title}</h2>{note && <span className="text-[11px] text-slate-500">{note}</span>}</div>{children}</section>;
}
function Metrics({ items }: { items: { label: string; value: string; note?: string }[] }) {
  return <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-[#e2e8f0] bg-[#e2e8f0] sm:grid-cols-4">{items.map(item => <div key={item.label} className="bg-white px-4 py-3"><p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{item.label}</p><p className="mt-1 text-lg font-bold tabular-nums">{item.value}</p>{item.note && <p className="mt-1 text-[11px] text-slate-500">{item.note}</p>}</div>)}</div>;
}
function ResearchChart({ historical, forecasts = [], unit, threshold }: { historical: SeriesPoint[]; forecasts?: SeriesPoint[]; unit: string; threshold?: number | null }) {
  const [range, setRange] = useState(12);
  const history = historical.slice(-range);
  const points = [...history, ...forecasts];
  const values = points.map(p => p.value);
  if (threshold !== null && threshold !== undefined) values.push(threshold);
  const lowest = Math.min(...values);
  const highest = Math.max(...values);
  const padding = Math.max((highest - lowest) * 0.2, Math.abs(highest) * 0.015, 0.15);
  const min = lowest - padding;
  const max = highest + padding;
  const x = (i: number) => 65 + i / Math.max(points.length - 1, 1) * 710;
  const y = (v: number) => 190 - (v - min) / (max - min) * 165;
  const path = (rows: SeriesPoint[], start: number) => rows.map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(start + i)} ${y(p.value)}`).join(' ');
  const projected = forecasts.length ? [history[history.length - 1], ...forecasts] : [];
  return <div><div className="flex flex-wrap items-center justify-between gap-2 px-4 pt-3 text-[11px]"><span className="text-slate-500">{unit} · illustrative series</span><div className="flex gap-1">{[{ label: '6M', count: 6 }, { label: '1Y', count: 12 }].map(item => <button key={item.label} onClick={() => setRange(item.count)} aria-pressed={range === item.count} className={`rounded px-2 py-1 ${range === item.count ? 'bg-[#eeeaff] font-semibold text-[#5338ec]' : 'text-slate-500'}`}>{item.label}</button>)}</div></div><div className="overflow-x-auto px-3"><svg viewBox="0 0 800 235" className="w-full min-w-[420px]" role="img" aria-label={`${unit} historical chart${forecasts.length ? ' with separate dashed forecasts' : ''}`}>
    {[0, 1, 2, 3, 4].map(i => { const value = min + i / 4 * (max - min); return <g key={i}><line x1="65" x2="775" y1={y(value)} y2={y(value)} stroke="#e9eef5" /><text x="55" y={y(value) + 4} textAnchor="end" fill="#64748b" fontSize="10">{number(value)}</text></g>; })}
    {threshold !== null && threshold !== undefined && <g><line x1="65" x2="775" y1={y(threshold)} y2={y(threshold)} stroke="#94a3b8" strokeDasharray="4 4" /><text x="775" y={y(threshold) - 5} textAnchor="end" fill="#64748b" fontSize="10">Neutral {threshold}</text></g>}
    <path d={path(history, 0)} stroke="#5338ec" strokeWidth="2.5" fill="none" />
    {projected.length > 1 && <path d={path(projected, history.length - 1)} stroke="#0284c7" strokeWidth="2.5" strokeDasharray="6 5" fill="none" />}
    {points.map((point, i) => <g key={`${point.period}-${i}`}><circle cx={x(i)} cy={y(point.value)} r="3" fill={i >= history.length ? '#0284c7' : '#5338ec'}><title>{point.period}: {number(point.value)} {unit}{i >= history.length ? ' (projection)' : ' (sample history)'}</title></circle>{(i % Math.max(1, Math.ceil(points.length / 6)) === 0 || i === points.length - 1) && <text x={x(i)} y="215" textAnchor="middle" fill="#64748b" fontSize="10">{point.period}</text>}</g>)}
  </svg></div><div className="flex flex-wrap gap-4 px-4 pb-3 text-[11px] text-slate-500"><span>● Sample history</span>{forecasts.length > 0 && <span className="text-sky-600">┄ Model projections</span>}</div></div>;
}
function EventImpactChart({ indicator, asset }: { indicator: EconomicIndicator; asset: string }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [selectedRangeIndex, setSelectedRangeIndex] = useState(0);
  const rows = indicator.consensusHistory.slice(-12);
  if (!rows.length) return <div className="bg-[#171821] p-5 text-sm text-slate-400">No numeric actual-versus-forecast history is available for this event type.</div>;
  const values = rows.flatMap((row) => [row.actual, row.consensus]);
  const low = Math.min(...values);
  const high = Math.max(...values);
  const padding = Math.max((high - low) * 0.18, 0.2);
  const min = low - padding;
  const max = high + padding;
  const x = (index: number) => 48 + index / Math.max(rows.length - 1, 1) * 690;
  const y = (value: number) => 190 - ((value - min) / Math.max(max - min, 1)) * 135;
  const line = (key: 'actual' | 'consensus') => rows.map((row, index) => `${index === 0 ? 'M' : 'L'} ${x(index)} ${y(row[key])}`).join(' ');
  const rangeValue = (value: string) => Number.parseFloat(value.replace(/[^0-9.]/g, '')) || 0;
  const maxTrueRange = Math.max(...indicator.volatility.map((row) => rangeValue(row.trueRange)), 1);
  const maxPotentialRange = Math.max(...indicator.volatility.map((row) => rangeValue(row.potentialRange)), 1);
  const reactionSign = indicator.sentiment.label === 'Bearish' ? -1 : 1;
  const reaction = [0.06, 0.42, 0.24, 0.58].map((value) => reactionSign * value * (indicator.sentiment.score / 60));
  const primaryAssetClass = indicator.affectedAssets[0]?.assetClass || 'Other';
  const rangeUnit = primaryAssetClass === 'Forex' ? 'pips' : primaryAssetClass === 'Indices' ? 'points' : 'change %';
  const rangeMultiplier = primaryAssetClass === 'Forex' ? 100 : primaryAssetClass === 'Indices' ? 50 : 1;
  const moveMultiplier = primaryAssetClass === 'Forex' ? 100 : primaryAssetClass === 'Indices' ? 50 : 1;
  const rangeInMarketUnits = (value: string) => {
    const percent = rangeValue(value);
    return primaryAssetClass === 'Forex'
      ? `${Math.round(percent * rangeMultiplier)} pips`
      : primaryAssetClass === 'Indices'
        ? `${(percent * rangeMultiplier).toFixed(1)} pts`
        : `${percent.toFixed(2)}%`;
  };
  const moveInMarketUnits = (percent: number) => primaryAssetClass === 'Forex'
    ? `${Math.round(percent * moveMultiplier)} pips`
    : primaryAssetClass === 'Indices'
      ? `${(percent * moveMultiplier).toFixed(1)} pts`
      : `${percent.toFixed(2)}%`;
  const activePoint = hoveredIndex ?? selectedIndex;
  const activeRow = activePoint === null ? null : rows[activePoint];
  const activeX = activePoint === null ? 0 : x(activePoint);
  const activeY = activePoint === null || !activeRow ? 0 : y(activeRow.actual);
  const tooltipX = Math.min(Math.max(activeX - 88, 8), 572);
  const tooltipY = activeY < 112 ? 120 : 12;
  return <div className="grid overflow-hidden bg-[#171821] text-white lg:grid-cols-[minmax(0,1fr)_270px]">
    <div className="min-w-0 p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-base font-semibold">History of {indicator.name}</h3>
      <div className="flex flex-wrap gap-3 text-[10px] text-slate-300"><span><span className="mr-1 inline-block h-2 w-5 bg-white align-middle" />Actual line</span><span><span className="mr-1 inline-block h-0 w-5 border-t-2 border-dashed border-slate-400 align-middle" />Forecast line</span><span><span className="mr-1 inline-block h-2 w-2 rounded-sm bg-white" />True range %</span></div>
      </div>
      <div className="mt-3 overflow-x-auto">
        <svg viewBox="0 0 760 240" className="min-w-[620px] w-full" role="img" aria-label={`${indicator.name} actual, forecast and true range chart`}>
          {[0, 1, 2, 3, 4].map((step) => { const value = min + step / 4 * (max - min); return <g key={step}><line x1="48" x2="720" y1={y(value)} y2={y(value)} stroke="#2d303b" strokeDasharray="2 4" /><text x="41" y={y(value) + 4} textAnchor="end" fill="#8b90a3" fontSize="9">{number(value)}</text></g>; })}
          <path d={line('consensus')} stroke="#858aa3" strokeWidth="1.8" strokeDasharray="6 5" fill="none" />
          <path d={line('actual')} stroke="#f8fafc" strokeWidth="2" fill="none" />
          {rows.map((row, index) => {
            const barHeight = Math.max(7, rangeValue(indicator.volatility[index % indicator.volatility.length]?.trueRange || '0') / maxTrueRange * 48);
            return <g key={`${row.referencePeriod}-${index}`}>
              <rect
                x={x(index) - 5}
                y={202 - barHeight}
                width="10"
                height={barHeight}
                rx="2"
                fill="#f8fafc"
                opacity={selectedRangeIndex === index % indicator.volatility.length ? 1 : 0.72}
                tabIndex={0}
                role="button"
                aria-label={`Select ${indicator.volatility[index % indicator.volatility.length]?.window} range`}
                onClick={() => setSelectedRangeIndex(index % indicator.volatility.length)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    setSelectedRangeIndex(index % indicator.volatility.length);
                  }
                }}
                className="cursor-pointer"
              />
              <circle
                cx={x(index)}
                cy={y(row.actual)}
                r={activePoint === index ? 5 : 3.2}
                fill={row.surprise >= 0 ? '#34d399' : '#f43f5e'}
                tabIndex={0}
                role="button"
                aria-label={`Show ${row.referencePeriod} market reaction data`}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onFocus={() => setHoveredIndex(index)}
                onBlur={() => setHoveredIndex(null)}
                onClick={() => setSelectedIndex(selectedIndex === index ? null : index)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    setSelectedIndex(selectedIndex === index ? null : index);
                  }
                }}
                className="cursor-pointer outline-none"
              >
                <title>{row.referencePeriod}: actual {number(row.actual)}, forecast {number(row.consensus)}</title>
              </circle>
              {(index % 2 === 0 || index === rows.length - 1) && <text x={x(index)} y="224" textAnchor="middle" fill="#8b90a3" fontSize="9">{row.referencePeriod}</text>}
            </g>;
          })}
          {activeRow && (
            <g pointerEvents="none">
              <rect x={tooltipX} y={tooltipY} width="180" height="104" rx="6" fill="#0b1c30" stroke="#475569" />
              <text x={tooltipX + 10} y={tooltipY + 16} fill="#ffffff" fontSize="10" fontWeight="700">{activeRow.referencePeriod} · {asset}</text>
              <text x={tooltipX + 10} y={tooltipY + 32} fill="#cbd5e1" fontSize="9">Previous {number(activeRow.previous)}</text>
              <text x={tooltipX + 10} y={tooltipY + 46} fill="#cbd5e1" fontSize="9">Forecast {number(activeRow.consensus)}</text>
              <text x={tooltipX + 10} y={tooltipY + 60} fill="#ffffff" fontSize="9">Actual {number(activeRow.actual)} · {activeRow.surprise >= 0 ? 'Beat' : 'Miss'}</text>
              <text x={tooltipX + 10} y={tooltipY + 76} fill="#7dd3fc" fontSize="9">Surprise {signed(activeRow.surprise)}</text>
              <text x={tooltipX + 10} y={tooltipY + 92} fill="#86efac" fontSize="9">After 1H/1D/1W/1M: {moveInMarketUnits(activeRow.surprise / Math.max(Math.abs(activeRow.consensus), 1) * 100 * 0.4)} / {moveInMarketUnits(activeRow.surprise / Math.max(Math.abs(activeRow.consensus), 1) * 100 * 0.8)} / {moveInMarketUnits(activeRow.surprise / Math.max(Math.abs(activeRow.consensus), 1) * 100 * 1.1)} / {moveInMarketUnits(activeRow.surprise / Math.max(Math.abs(activeRow.consensus), 1) * 100 * 1.4)}</text>
            </g>
          )}
        </svg>
      </div>
      <p className="mt-2 text-[10px] text-slate-400">Illustrative history. White = actual line, dashed = forecast line, green/red points = beat/miss, bars = true range %.</p>
    </div>
    <aside className="border-t border-white/10 p-4 sm:p-5 lg:border-l lg:border-t-0">
      <p className="text-sm font-semibold">What happened to {asset}</p>
      <p className="mt-4 text-[10px] font-semibold uppercase tracking-wide text-slate-400">Price after the event</p>
      <div className="mt-2 grid grid-cols-2 gap-2">{['1H', '1D', '1W', '1M'].map((window, index) => <div key={window} className="rounded border border-white/10 bg-white/[0.04] p-2"><p className="text-[9px] text-slate-400">{window}</p><p className={`mt-1 text-sm font-bold ${reaction[index] >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{reaction[index] >= 0 ? '+' : ''}{reaction[index].toFixed(2)}%</p><p className="mt-1 text-[9px] text-slate-500">vs release</p></div>)}</div>
      <p className="mt-5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">News sentiment 1 day before</p>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-rose-500/80"><div className="h-full bg-emerald-400" style={{ width: `${indicator.sentiment.score}%` }} /></div>
      <div className="mt-1 flex justify-between text-[9px] text-slate-400"><span>Bearish {100 - indicator.sentiment.score}%</span><span>Bullish {indicator.sentiment.score}%</span></div>
      <p className="mt-1 text-[9px] text-slate-500">{indicator.sentiment.articleCount} related articles · {indicator.sentiment.window}</p>
      <p className="mt-5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">1H / 1D / 1W / 1M · true range % / potential range %</p>
      <p className="mt-1 text-[9px] font-semibold text-sky-300">Selected horizon: {indicator.volatility[selectedRangeIndex]?.window || '1H'} · click a chart bar to change</p>
      <p className="mt-1 text-[9px] text-slate-500">Market-unit proxy: {rangeUnit}; white = true range, blue = potential range.</p>
      <div className="mt-2 space-y-2">{indicator.volatility.map((row, index) => { const width = Math.max(8, rangeValue(row.potentialRange) / maxPotentialRange * 100); return <div key={row.window} className={`rounded px-1 ${selectedRangeIndex === index ? 'bg-white/[0.06] ring-1 ring-sky-400/50' : ''}`}><div className="mb-1 flex justify-between text-[9px]"><span className="text-slate-400">{row.window}</span><span className="text-sky-300">{row.trueRange} / {row.potentialRange}</span></div><div className="h-1.5 rounded bg-white/10"><div className="h-full rounded bg-sky-400" style={{ width: `${width}%` }} /><div className="relative -mt-1.5 h-1.5 rounded bg-white" style={{ width: `${Math.max(6, rangeValue(row.trueRange) / maxPotentialRange * 100)}%` }} /></div><p className="mt-1 text-[9px] text-slate-500">≈ {rangeInMarketUnits(row.trueRange)} / {rangeInMarketUnits(row.potentialRange)}</p></div>; })}</div>
    </aside>
  </div>;
}
function Relations({ rows, onSelect }: { rows: IndicatorRelation[]; onSelect: (row: IndicatorRelation) => void }) {
  return <div className="overflow-x-auto"><table className="w-full text-xs"><thead className={headings}><tr>{['Indicator', 'Latest', 'Previous', 'Unit', 'Period'].map(h => <th key={h} className={cell}>{h}</th>)}</tr></thead><tbody>{rows.map(row => <tr key={row.id} className="border-t border-slate-100 hover:bg-[#f8fafc]"><td className={cell}><button className="text-left font-semibold text-[#5338ec] hover:underline" onClick={() => onSelect(row)}>{row.name}</button><p className="mt-1 text-[10px] text-slate-500">{row.state}</p></td><td className={`${cell} tabular-nums`}>{number(row.latest)}</td><td className={`${cell} tabular-nums`}>{number(row.previous)}</td><td className={cell}>{row.unit}</td><td className={`${cell} whitespace-nowrap`}>{row.referencePeriod}</td></tr>)}</tbody></table></div>;
}
function SessionTable({ indicator, comparison = false, onSymbol }: { indicator: EconomicIndicator; comparison?: boolean; onSymbol?: (symbol: string) => void }) {
  return <div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead className={headings}><tr>{(comparison ? ['Venue / event', 'Expected', 'Sample status', 'Assessment'] : ['Venue / session', 'Instrument', 'Status', 'Reopening / timing']).map(h => <th className={cell} key={h}>{h}</th>)}</tr></thead><tbody>{indicator.sessions.map(row => <tr key={row.venue} className="border-t border-slate-100"><td className={`${cell} font-semibold`}>{row.venue}</td>{comparison ? <><td className={cell}>{row.expectation}</td><td className={cell}>{row.observed}</td><td className={`${cell} text-[#5338ec]`}>In line with schedule</td></> : <><td className={cell}><button onClick={() => onSymbol?.(row.symbol)} className="font-semibold text-[#5338ec] hover:underline">{row.symbol}</button></td><td className={cell}><span className="rounded bg-slate-100 px-2 py-1 text-[11px]">{row.status}</span></td><td className={cell}>{row.reopening}</td></>}</tr>)}</tbody></table></div>;
}
const loadAlerts = (indicator: EconomicIndicator): IndicatorAlert[] => {
  try { const stored = localStorage.getItem(`marketsyde.indicator-alerts.${indicator.id}`); if (stored) return JSON.parse(stored); } catch { /* A blocked browser store can use session state. */ }
  return indicator.seededAlerts;
};

export const EconomicIndicatorDetailPage: React.FC<EconomicIndicatorDetailPageProps> = ({ event, whenLabel, isWatched, onClose, onToggleWatch, onSetAlert, onNavigateToInstrument, onShowToast }) => {
  const [relatedEvent, setRelatedEvent] = useState<EconomicEvent | null>(null);
  const activeEvent = relatedEvent || event;
  const indicator = useMemo(() => buildDemoIndicator(activeEvent), [activeEvent]);
  const providerSnapshot = useMemo(() => createMockEconomicCalendarProvider([activeEvent]).getSnapshot(activeEvent), [activeEvent]);
  const [tab, setTab] = useState<IndicatorTab>('Summary');
  const [article, setArticle] = useState<EconomicIndicator['news'][number] | null>(null);
  const [alertsById, setAlertsById] = useState<Record<string, IndicatorAlert[]>>({});
  const alerts = alertsById[indicator.id] || loadAlerts(indicator);
  const [editing, setEditing] = useState<string | null>(null);
  const [alertType, setAlertType] = useState<AlertType>('Release');
  const [condition, setCondition] = useState('Before release');
  const [triggerValue, setTriggerValue] = useState('30');
  const [delivery, setDelivery] = useState<Delivery>('In-app');
  const [alertName, setAlertName] = useState('Release reminder');
  const numeric = indicator.kind === 'indicator';
  const surprise = numeric ? (indicator.latest ?? 0) - (indicator.consensus ?? 0) : null;
  const surprisePercent = surprise !== null && indicator.consensus !== null && indicator.consensus !== 0 ? surprise / Math.abs(indicator.consensus) * 100 : null;
  const providerSurprise = providerSnapshot.surpriseValue;
  const primaryAsset = indicator.affectedAssets[0]?.symbol || providerSnapshot.affectedAssets[0] || activeEvent.currency;
  const reactionDirection = providerSurprise === null ? 'Pending release' : providerSurprise > 0 ? 'Positive surprise' : providerSurprise < 0 ? 'Negative surprise' : 'In line with forecast';
  const conditions = alertConditions[alertType];
  useEffect(() => { setRelatedEvent(null); setTab('Summary'); setArticle(null); }, [event.id]);
  const updateAlerts = (next: IndicatorAlert[]) => {
    setAlertsById(current => ({ ...current, [indicator.id]: next }));
    try { localStorage.setItem(`marketsyde.indicator-alerts.${indicator.id}`, JSON.stringify(next)); } catch { /* Keep the current session usable when storage is unavailable. */ }
  };
  const selectRelation = (row: IndicatorRelation) => {
    const category = /PMI/.test(row.name) ? 'PMI' : /Inflation/.test(row.name) ? 'Inflation' : /Policy Rate/.test(row.name) ? 'Central Bank' : /Confidence/.test(row.name) ? 'Sentiment' : activeEvent.category;
    setRelatedEvent({ ...activeEvent, id: row.id, title: row.name, category, actual: String(row.latest), previous: String(row.previous), forecast: String(Math.round((row.latest + row.previous) / 2 * 100) / 100), allDay: false, hasSpeech: false, historicalTrend: [], acuity: undefined });
    setTab('Summary'); setEditing(null); setArticle(null);
    document.getElementById('indicator-detail-scroll')?.scrollTo({ top: 0 });
  };
  const saveAlert = () => {
    if (!alertName.trim()) { onShowToast('Enter an alert name'); return; }
    if (alertType !== 'News' && (!triggerValue.trim() || !Number.isFinite(Number(triggerValue)))) { onShowToast('Enter a numeric trigger value'); return; }
    const item: IndicatorAlert = { id: editing || `${indicator.id}-${Date.now()}`, indicatorId: indicator.id, name: alertName.trim(), type: alertType, condition, triggerValue: alertType === 'News' ? 'Any update' : triggerValue, delivery, active: editing ? alerts.find(a => a.id === editing)?.active ?? true : true };
    updateAlerts(editing ? alerts.map(a => a.id === editing ? item : a) : [...alerts, item]);
    if (alertType === 'Release' && condition === 'Before release' && !relatedEvent) onSetAlert(Number(triggerValue));
    onShowToast(editing ? 'Demo alert updated' : 'Demo alert created'); setEditing(null);
  };
  const changeAlertType = (type: AlertType) => { setAlertType(type); setCondition(alertConditions[type][0]); setTriggerValue(type === 'Release' ? '30' : type === 'Threshold' ? String(indicator.neutralThreshold ?? indicator.latest ?? 50) : type === 'News' ? 'Any update' : '1'); setAlertName(`${type} alert`); };
  const editAlert = (item: IndicatorAlert) => { setEditing(item.id); setAlertName(item.name); setAlertType(item.type); setCondition(item.condition); setTriggerValue(item.triggerValue); setDelivery(item.delivery); };
  const forecastRows = indicator.forecastSeries;
  const summaryMetrics = numeric ? [
    { label: 'Latest', value: `${number(indicator.latest)} ${indicator.unit}`, note: 'Sample release result' }, { label: 'Previous', value: number(indicator.previous), note: 'Prior reference period' },
    { label: 'Reference period', value: indicator.referencePeriod, note: indicator.frequency }, { label: 'Change', value: signed((indicator.latest ?? 0) - (indicator.previous ?? 0)), note: `In ${indicator.unit}` },
  ] : indicator.kind === 'holiday' ? [
    { label: 'Local market', value: 'Closed', note: 'Sample holiday schedule' }, { label: 'Offshore FX', value: 'Open', note: 'Reduced participation' },
    { label: 'Turnover index', value: '38 / 100', note: 'Normal session = 100 · simulated' }, { label: 'Reopening', value: indicator.sessions[0].reopening.split(' · ')[0], note: '09:30 local · sample schedule' },
  ] : [
    { label: 'Event status', value: 'Scheduled', note: 'Sample communication event' }, { label: 'Policy focus', value: 'Inflation', note: 'Growth and employment context' },
    { label: 'Attention index', value: '72 / 100', note: 'Simulated event interest' }, { label: 'Coverage', value: 'Remarks + Q&A', note: 'Illustrative agenda' },
  ];

  return <div id="indicator-detail-scroll" className="fixed inset-0 z-50 overflow-y-auto bg-[#f7f9fc] text-[#0b1c30]">
    <div className="border-b border-[#e2e8f0] bg-white"><div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-8"><button onClick={() => { if (relatedEvent) { setRelatedEvent(null); setTab('Summary'); } else onClose(); }} className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-[#5338ec]"><ArrowLeft className="h-4 w-4" />{relatedEvent ? 'Back to calendar event' : 'Back to Economic Calendar'}</button>{!relatedEvent && <button onClick={onToggleWatch} className="flex items-center gap-1.5 text-xs font-semibold text-[#5338ec]"><Star className={`h-3.5 w-3.5 ${isWatched ? 'fill-current' : ''}`} />{isWatched ? 'Watching' : 'Watch event'}</button>}</div></div>
    <main className="mx-auto max-w-6xl px-4 py-5 sm:px-8">
      <header className="mb-4"><p className="text-xs text-slate-500">{indicator.country.flag} {indicator.country.name} · {indicator.category} · {indicator.currency}</p><h1 className="mt-2 flex flex-wrap items-center gap-2 text-xl font-bold tracking-tight sm:text-2xl"><span>{indicator.name}</span><HashtagLink tag={indicator.currency} className="rounded-full bg-[#eeeaff] px-2 py-0.5 text-xs font-semibold text-[#5338ec]" /></h1><p className="mt-1 text-xs text-slate-500">{relatedEvent ? indicator.referencePeriod : whenLabel} · {indicator.frequency} · Updated {formatDate(indicator.lastUpdated)}</p></header>
      <p className="mb-4 rounded-md border border-[#ded8fb] bg-[#f3f0ff] px-3 py-2 text-xs leading-5 text-[#594293]"><strong>Introduction</strong> · Explore this indicator&apos;s release context, market reaction, historical trend and related research in one view. Values are illustrative demo data.</p>
      <section className="mb-4 overflow-hidden rounded-xl border border-[#dfe5ee] bg-white shadow-sm">
        <div className="border-b border-[#e7ebf2] px-4 py-4 sm:px-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Economic event detail</p>
              <h2 className="mt-1 text-lg font-bold text-[#0b1c30]">{activeEvent.title}</h2>
              <p className="mt-1 max-w-4xl text-xs leading-5 text-slate-600">{activeEvent.summary}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${activeEvent.impact === 'High' ? 'bg-rose-50 text-rose-600' : activeEvent.impact === 'Medium' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>{activeEvent.impact} impact</span>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-600">{providerSnapshot.releaseState}</span>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="mr-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">Affected assets</span>
            {providerSnapshot.affectedAssets.map(asset => <button key={asset} onClick={() => onNavigateToInstrument?.(asset)} className="rounded-full border border-[#dfe5ee] bg-[#f8fafc] px-2.5 py-1 text-[11px] font-semibold text-[#334155] hover:border-[#b9adfa] hover:text-[#5338ec]">{asset}</button>)}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-px bg-[#e7ebf2] sm:grid-cols-5">
          {[
            { label: 'Previous', value: activeEvent.previous || '—' },
            { label: 'Forecast', value: activeEvent.forecast || '—' },
            { label: 'Actual', value: activeEvent.actual || 'Pending' },
            { label: 'Surprise', value: providerSnapshot.surprise },
            { label: 'Provider', value: 'Mock API' },
          ].map(item => <div key={item.label} className="bg-white px-4 py-3"><p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{item.label}</p><p className={`mt-1 text-sm font-bold ${item.label === 'Surprise' && item.value === 'Beat' ? 'text-emerald-600' : item.label === 'Surprise' && item.value === 'Miss' ? 'text-rose-600' : 'text-[#0b1c30]'}`}>{item.value}</p></div>)}
        </div>
      </section>
      <nav role="tablist" aria-label="Indicator analysis" className="mb-4 flex gap-6 overflow-x-auto border-b border-[#e2e8f0]">{(['Summary', 'Forecast', 'Consensus', 'Alerts'] as IndicatorTab[]).map(item => <button id={`indicator-tab-${item}`} role="tab" aria-selected={tab === item} aria-controls="indicator-tab-content" key={item} onClick={() => { setTab(item); setArticle(null); }} className={`whitespace-nowrap border-b-2 pb-3 text-xs font-semibold ${tab === item ? 'border-[#5338ec] text-[#5338ec]' : 'border-transparent text-slate-600'}`}>{item}{item === 'Alerts' && <span className="ml-1.5 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500">{alerts.length}</span>}</button>)}</nav>
      <div id="indicator-tab-content" role="tabpanel" aria-labelledby={`indicator-tab-${tab}`}>
        {tab === 'Summary' && <div className="space-y-4">
          <Metrics items={summaryMetrics} />
          <Section title="Release status & surprise" note="Provider-shaped demo snapshot"><div className="grid gap-px bg-slate-100 sm:grid-cols-4">{[
            { label: 'Release state', value: providerSnapshot.releaseState, note: 'Calendar status' },
            { label: 'Surprise', value: providerSnapshot.surprise, note: providerSurprise === null ? 'Awaiting actual' : `${providerSurprise > 0 ? '+' : ''}${providerSurprise} vs forecast` },
            { label: 'Affected assets', value: String(providerSnapshot.affectedAssets.length), note: 'Linked instruments' },
            { label: 'Data source', value: 'Mock API', note: 'Replaceable adapter' },
          ].map(item => <div key={item.label} className="bg-white p-4"><p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{item.label}</p><p className="mt-1 text-base font-bold text-[#5338ec]">{item.value}</p><p className="mt-1 text-[11px] text-slate-500">{item.note}</p></div>)}</div></Section>
          <Section title={numeric ? 'Latest research brief' : indicator.kind === 'holiday' ? 'Holiday market brief' : 'Communication brief'} note={indicator.referencePeriod}><div className="p-4"><h2 className="text-base font-bold">{indicator.summary.headline}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{indicator.summary.mainResult}</p></div></Section>
          <Section title="Affected assets" note="Illustrative sensitivity map"><div className="divide-y divide-slate-100">{indicator.affectedAssets.map(asset => <button key={asset.symbol} onClick={() => onNavigateToInstrument?.(asset.symbol)} className="flex w-full flex-wrap items-center justify-between gap-2 px-4 py-3 text-left hover:bg-[#f8fafc]"><div><p className="text-xs font-bold text-[#5338ec]">{asset.symbol} <span className="ml-1 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">{asset.assetClass}</span></p><p className="mt-1 text-xs text-slate-600">{asset.rationale}</p></div><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${asset.sensitivity === 'High' ? 'bg-rose-50 text-rose-600' : asset.sensitivity === 'Medium' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>{asset.sensitivity} sensitivity</span></button>)}</div></Section>
          {!numeric && <Section title={indicator.kind === 'holiday' ? 'Affected markets & reopening schedule' : 'Event agenda'} note="Illustrative calendar"><SessionTable indicator={indicator} onSymbol={onNavigateToInstrument} /></Section>}
          <Section title="Event impact history" note="Actual vs forecast · illustrative ranges"><EventImpactChart indicator={indicator} asset={primaryAsset} /></Section>
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
            <Section title="News & insights" note="Provider-linked demo context"><div className="p-4"><div className="mb-4 flex items-center justify-between gap-3"><div><p className="text-xs font-bold text-[#0b1c30]">News sentiment before the event</p><p className="mt-1 text-[11px] text-slate-500">Illustrative correlation from related articles</p></div><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${indicator.sentiment.label === 'Bullish' ? 'bg-emerald-50 text-emerald-700' : indicator.sentiment.label === 'Bearish' ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-600'}`}>{indicator.sentiment.label}</span></div><div className="h-2 overflow-hidden rounded-full bg-rose-100"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${indicator.sentiment.score}%` }} /></div><div className="mt-2 flex justify-between text-[10px] font-semibold text-slate-500"><span>Bearish {100 - indicator.sentiment.score}%</span><span>Bullish {indicator.sentiment.score}%</span></div><p className="mt-4 text-xs leading-5 text-slate-600">{indicator.sentiment.rationale}</p></div></Section>
            <Section title={`What happened to ${primaryAsset}`} note="Simulated reaction bands"><div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-4 lg:grid-cols-2">{['1H', '1D', '1W', '1M'].map((window, index) => <div key={window} className="rounded-lg bg-[#f8fafc] p-3"><p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{window}</p><p className={`mt-1 text-sm font-bold ${providerSurprise === null ? 'text-slate-500' : providerSurprise >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{providerSurprise === null ? '—' : `${providerSurprise >= 0 ? '+' : ''}${(providerSurprise * [0.4, 0.8, 0.6, 1.1][index]).toFixed(2)}%`}</p></div>)}</div><p className="border-t border-slate-100 px-4 py-3 text-[11px] leading-5 text-slate-500">{reactionDirection}. True range {providerSnapshot.trueRange}; potential range {providerSnapshot.potentialRange}. These values are illustrative, not a price target.</p></Section>
          </div>
          <Section title={numeric ? 'Structured economic commentary' : 'Market implications'}><div className="grid gap-px bg-slate-100 sm:grid-cols-2">{indicator.summary.commentary.map(item => <div key={item.label} className="bg-white p-4"><h3 className="text-xs font-bold">{item.label}</h3><p className="mt-1.5 text-xs leading-5 text-slate-600">{item.text}</p></div>)}</div></Section>
          <div className="grid gap-4 lg:grid-cols-2">
            <Section title="Volatility profile" note="True range vs potential range"><div className="overflow-x-auto"><table className="w-full text-xs"><thead className={headings}><tr>{['Window', 'True range', 'Potential range', 'Confidence'].map(h => <th key={h} className={cell}>{h}</th>)}</tr></thead><tbody>{indicator.volatility.map(row => <tr key={row.window} className="border-t border-slate-100"><td className={`${cell} font-semibold`}>{row.window}</td><td className={`${cell} text-sky-700`}>{row.trueRange}</td><td className={`${cell} text-[#5338ec]`}>{row.potentialRange}</td><td className={cell}>{row.confidence}</td></tr>)}</tbody></table></div><p className="border-t border-slate-100 px-4 py-3 text-[11px] leading-5 text-slate-500">Ranges are simulated reaction bands, not a price target or trading recommendation.</p></Section>
            <Section title="Sentiment & news correlation" note="Demo analytical context"><div className="p-4"><div className="flex items-center justify-between gap-3"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${indicator.sentiment.label === 'Bullish' ? 'bg-emerald-50 text-emerald-600' : indicator.sentiment.label === 'Bearish' ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-600'}`}>{indicator.sentiment.label}</span><span className="text-lg font-bold text-[#5338ec]">{indicator.sentiment.score}/100</span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-[#5338ec]" style={{ width: `${indicator.sentiment.score}%` }} /></div><p className="mt-3 text-xs leading-5 text-slate-600">{indicator.sentiment.rationale}</p><p className="mt-3 text-[11px] text-slate-500">Correlation is illustrative and derived from the demo event, related news, and historical surprise path.</p></div></Section>
          </div>
          <Section title="Market-structure context" note="Execution-aware demo notes"><div className="grid gap-px bg-slate-100 sm:grid-cols-3">{indicator.marketStructure.map(item => <div key={item.label} className="bg-white p-4"><p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{item.label}</p><p className="mt-1 text-sm font-bold">{item.value}</p><p className="mt-1 text-xs leading-5 text-slate-600">{item.note}</p></div>)}</div></Section>
          {indicator.components.length > 0 && <Section title="Components & supporting measures" note="Sample relationships"><Relations rows={indicator.components} onSelect={selectRelation} /></Section>}
          <Section title="Related economic indicators" note="Select an indicator to explore"><Relations rows={indicator.relatedIndicators} onSelect={selectRelation} /></Section>
          <Section title={numeric ? 'About this indicator' : 'Methodology & calendar notes'}><dl className="divide-y divide-slate-100">{indicator.methodology.map(item => <div key={item.label} className="grid gap-1 px-4 py-3 text-xs sm:grid-cols-[150px_1fr]"><dt className="font-semibold">{item.label}</dt><dd className="leading-5 text-slate-600">{item.text}</dd></div>)}</dl></Section>
          <Section title="Related news & analysis" note="Sample research articles">{indicator.news.map(item => <button key={item.id} onClick={() => setArticle(item)} className="flex w-full items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 text-left hover:bg-[#f8fafc]"><div><p className="text-xs font-bold">{item.headline}</p><p className="mt-1 text-xs leading-5 text-slate-600">{item.summary}</p><p className="mt-1 text-[10px] text-slate-400">{item.source} · {formatDate(item.publishedAt)}</p></div><ChevronRight className="h-4 w-4 shrink-0 text-[#5338ec]" /></button>)}</Section>
        </div>}
        {tab === 'Forecast' && <div className="space-y-4">
          <Metrics items={numeric ? [{ label: 'Current actual', value: number(indicator.latest), note: indicator.unit }, { label: 'Next release projection', value: number(forecastRows[0].value), note: forecastRows[0].period }, { label: 'Next quarter', value: number(forecastRows[1].value), note: forecastRows[1].period }, { label: 'Longer term', value: number(forecastRows[3].value), note: forecastRows[3].period }] : [{ label: 'Current sample index', value: number(indicator.historicalSeries.at(-1)!.value), note: indicator.unit }, { label: 'Central scenario', value: indicator.outlook[0].probability, note: indicator.outlook[0].scenario }, { label: 'Reopening / next event', value: number(forecastRows[2].value), note: 'Simulated index projection' }, { label: 'Normal-session baseline', value: '100', note: 'Illustrative reference level' }]} />
          <Section title={numeric ? 'Historical observations & forecast path' : indicator.kind === 'holiday' ? 'Holiday liquidity & reopening outlook' : 'Event attention outlook'} note="Dashed line = projections"><ResearchChart historical={indicator.historicalSeries} forecasts={forecastRows} unit={indicator.unit} threshold={indicator.neutralThreshold} /></Section>
          <Section title="Projection table" note="Forward-looking sample values"><div className="overflow-x-auto"><table className="w-full text-xs"><thead className={headings}><tr>{['Period / scenario', 'Value', 'Type', 'Change vs current', 'Source / model'].map(h => <th key={h} className={cell}>{h}</th>)}</tr></thead><tbody>{forecastRows.map(row => <tr key={row.period} className="border-t border-slate-100"><td className={`${cell} font-semibold`}>{row.period}</td><td className={`${cell} font-bold text-sky-700`}>{number(row.value)}</td><td className={cell}>{row.type}</td><td className={cell}>{signed(row.change)}</td><td className={cell}>{row.source}</td></tr>)}</tbody></table></div><p className="border-t border-slate-100 px-4 py-3 text-xs leading-5 text-slate-500">{numeric ? 'The projection model is a separate demo series. Pre-release economist consensus appears in the Consensus tab.' : 'This event has no numerical economic forecast. The chart models an illustrative participation or attention index.'}</p></Section>
          <Section title="Scenario analysis" note="Illustrative probabilities"><div className="grid gap-px bg-slate-100 sm:grid-cols-3">{indicator.outlook.map(row => <div key={row.scenario} className="bg-white p-4"><p className="text-lg font-bold text-[#5338ec]">{row.probability}</p><h3 className="mt-1 text-xs font-bold">{row.scenario}</h3><p className="mt-2 text-xs leading-5 text-slate-600">{row.implication}</p></div>)}</div></Section>
        </div>}
        {tab === 'Consensus' && <div className="space-y-4">{numeric ? <>
          <Metrics items={[{ label: 'Actual', value: number(indicator.latest), note: 'Released sample result' }, { label: 'Consensus', value: number(indicator.consensus), note: 'Pre-release expectation' }, { label: 'Previous', value: number(indicator.previous), note: 'Previous observation' }, { label: 'Forecast', value: number(indicator.forecast), note: 'Next-period model projection' }]} />
          <Section title="Actual vs forecast history" note="Six illustrative releases"><div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 lg:grid-cols-6">{indicator.consensusHistory.map(row => { const max = Math.max(Math.abs(row.actual), Math.abs(row.consensus), 1); const actualHeight = Math.max(12, Math.abs(row.actual) / max * 74); const consensusHeight = Math.max(12, Math.abs(row.consensus) / max * 74); return <div key={row.referencePeriod} className="rounded-lg bg-[#f8fafc] p-2"><p className="truncate text-[10px] font-semibold text-slate-500">{row.referencePeriod}</p><div className="mt-2 flex h-20 items-end justify-center gap-1"><div className="w-3 rounded-t bg-[#5338ec]" style={{ height: `${actualHeight}px` }} title={`Actual ${number(row.actual)}`} /><div className="w-3 rounded-t bg-sky-300" style={{ height: `${consensusHeight}px` }} title={`Forecast ${number(row.consensus)}`} /></div><p className={`mt-1 text-center text-[10px] font-bold ${row.surprise >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{signed(row.surprise)}</p></div>; })}</div><div className="flex gap-4 border-t border-slate-100 px-4 py-2 text-[11px] text-slate-500"><span><span className="mr-1 inline-block h-2 w-2 rounded-full bg-[#5338ec]" />Actual</span><span><span className="mr-1 inline-block h-2 w-2 rounded-full bg-sky-300" />Forecast</span></div></Section>
          <Section title="Release surprise" note={indicator.unit}><div className="grid gap-4 p-4 sm:grid-cols-[1fr_2fr]"><div><p className="text-xl font-bold">{signed(surprise!)} <span className="text-sm text-slate-500">{indicator.unit}</span></p><p className="mt-1 text-sm font-semibold text-[#5338ec]">{Math.abs(surprise!) < 0.005 ? 'In Line' : surprise! > 0 ? 'Above Consensus' : 'Below Consensus'}</p><p className="mt-1 text-xs text-slate-500">{surprisePercent === null ? 'Percentage surprise undefined at zero consensus' : `${signed(surprisePercent)}% relative surprise`}</p></div><div className="text-xs leading-5 text-slate-600"><p>Surprise = actual − consensus. Relative surprise = surprise ÷ |consensus| × 100.</p><p className="mt-2">{indicator.higherIsEconomicallyPositive === null ? 'A higher reading requires context from policy targets and other indicators.' : indicator.higherIsEconomicallyPositive ? 'Higher values generally suggest stronger activity in this indicator.' : 'Lower values generally indicate improvement in this indicator.'} A beat describes expectations and does not by itself establish an economically positive result.</p></div></div></Section>
          <Section title="Historical consensus releases" note="6 illustrative releases"><div className="overflow-x-auto"><table className="w-full text-xs"><thead className={headings}><tr>{['Reference period', 'Release date', 'Actual', 'Consensus', 'Previous', 'Surprise'].map(h => <th className={cell} key={h}>{h}</th>)}</tr></thead><tbody>{[...indicator.consensusHistory].reverse().map(row => <tr key={row.referencePeriod} className="border-t border-slate-100"><td className={`${cell} font-semibold`}>{row.referencePeriod}</td><td className={cell}>{row.releaseDate}</td><td className={cell}>{number(row.actual)}</td><td className={cell}>{number(row.consensus)}</td><td className={cell}>{number(row.previous)}</td><td className={`${cell} font-semibold text-[#5338ec]`}>{signed(row.surprise)}</td></tr>)}</tbody></table></div></Section>
        </> : <>
          <Section title={indicator.kind === 'holiday' ? 'Expected schedule versus sample session status' : 'Expected communication versus sample message'}><div className="p-4"><h2 className="text-base font-bold">{indicator.kind === 'holiday' ? 'The closure follows the demo holiday schedule' : 'The message matches the sample policy outlook'}</h2><p className="mt-2 text-xs leading-5 text-slate-600">{indicator.kind === 'holiday' ? 'Holidays are calendar events. Use venue schedules, settlement availability and reopening conditions to compare expectations.' : 'A speech has no published actual or numerical economist consensus. Compare the message with the expected agenda and previous guidance.'}</p></div><SessionTable indicator={indicator} comparison /></Section>
          <Section title="Expectation watchlist"><div className="grid gap-px bg-slate-100 sm:grid-cols-3">{indicator.outlook.map(row => <div key={row.scenario} className="bg-white p-4"><h3 className="text-xs font-bold">{row.scenario}</h3><p className="mt-2 text-xs leading-5 text-slate-600">{row.implication}</p><span className="mt-2 block text-[11px] text-[#5338ec]">{row.probability} · sample scenario weight</span></div>)}</div></Section>
          <Section title="Related releases with numerical consensus" note="Explore the underlying indicator"><Relations rows={indicator.relatedIndicators} onSelect={selectRelation} /></Section>
        </>}</div>}
        {tab === 'Alerts' && <div className="space-y-4">
          <Section title={editing ? 'Edit alert' : 'Create indicator alert'} note="Demo alerts saved in this browser"><div className="p-4"><p className="mb-3 text-xs leading-5 text-slate-500">Sample rules let you explore release, threshold, consensus, change, forecast and news alerts. Delivery selections are stored for the demo.</p><div className="grid gap-3 sm:grid-cols-3"><label className="text-xs font-semibold">Alert name<input value={alertName} onChange={e => setAlertName(e.target.value)} className="mt-1 w-full rounded border border-slate-200 px-3 py-2 font-normal" /></label><label className="text-xs font-semibold">Type<select value={alertType} onChange={e => changeAlertType(e.target.value as AlertType)} className="mt-1 w-full rounded border border-slate-200 px-3 py-2 font-normal">{(Object.keys(alertConditions) as AlertType[]).filter(type => numeric || type === 'Release' || type === 'News').map(type => <option key={type}>{type}</option>)}</select></label><label className="text-xs font-semibold">Condition<select value={condition} onChange={e => setCondition(e.target.value)} className="mt-1 w-full rounded border border-slate-200 px-3 py-2 font-normal">{conditions.map(item => <option key={item}>{item}</option>)}</select></label><label className="text-xs font-semibold">{alertType === 'Release' ? 'Timing offset (minutes)' : 'Trigger value'}<input value={triggerValue} disabled={alertType === 'News'} onChange={e => setTriggerValue(e.target.value)} className="mt-1 w-full rounded border border-slate-200 px-3 py-2 font-normal disabled:bg-slate-50" /></label><label className="text-xs font-semibold">Delivery<select value={delivery} onChange={e => setDelivery(e.target.value as Delivery)} className="mt-1 w-full rounded border border-slate-200 px-3 py-2 font-normal"><option>In-app</option><option>Push</option><option>Email</option></select></label><div className="flex items-end gap-2"><button onClick={saveAlert} className="flex items-center gap-1.5 rounded bg-[#5338ec] px-3 py-2 text-xs font-semibold text-white">{editing ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}{editing ? 'Save changes' : 'Add alert'}</button>{editing && <button onClick={() => setEditing(null)} className="px-2 py-2 text-xs text-slate-500">Cancel</button>}</div></div></div></Section>
          <Section title="Your indicator alerts" note={`${alerts.filter(a => a.active).length} active · ${alerts.filter(a => !a.active).length} paused`}><div className="divide-y divide-slate-100">{alerts.map(item => <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"><div className="flex gap-3"><BellRing className={`mt-1 h-4 w-4 ${item.active ? 'text-[#5338ec]' : 'text-slate-400'}`} /><div><p className="text-xs font-bold">{item.name}</p><p className="mt-1 text-xs text-slate-500">{indicator.name}</p><p className="mt-1 text-[11px] text-slate-500">{item.type} · {item.condition} · {item.triggerValue}{item.type === 'Release' ? ' min' : ''} · {item.delivery} · {item.active ? 'Active' : 'Paused'}</p></div></div><div className="flex gap-1"><button aria-label={`Edit ${item.name}`} onClick={() => editAlert(item)} className="rounded p-2 text-slate-500 hover:bg-slate-100"><Pencil className="h-4 w-4" /></button><button aria-label={`${item.active ? 'Pause' : 'Resume'} ${item.name}`} onClick={() => updateAlerts(alerts.map(a => a.id === item.id ? { ...a, active: !a.active } : a))} className="rounded p-2 text-slate-500 hover:bg-slate-100">{item.active ? <Pause className="h-4 w-4" /> : <Check className="h-4 w-4" />}</button><button aria-label={`Delete ${item.name}`} onClick={() => { updateAlerts(alerts.filter(a => a.id !== item.id)); if (editing === item.id) setEditing(null); }} className="rounded p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600"><Trash2 className="h-4 w-4" /></button></div></div>)}{alerts.length === 0 && <p className="px-4 py-5 text-xs text-slate-500">All sample rules removed. Add a rule above to monitor this indicator.</p>}</div></Section>
        </div>}
      </div>
      {article && <section role="dialog" aria-label={article.headline} className={`${panel} mt-4 border-[#cfc5fb]`}><div className="flex items-center justify-between gap-3 px-4 py-3"><h2 className="text-sm font-bold">{article.headline}</h2><button aria-label="Close research article" onClick={() => setArticle(null)}><X className="h-4 w-4" /></button></div><p className="px-4 text-[11px] text-slate-500">{article.source} · {formatDate(article.publishedAt)}</p><p className="px-4 py-4 text-sm leading-6 text-slate-600">{article.body}</p></section>}
      <footer className="mt-5 border-t border-slate-200 pt-3 text-[11px] leading-5 text-slate-500">Source context: {indicator.provider} · {indicator.frequency} · Demo dataset updated {formatDate(indicator.lastUpdated)}</footer>
    </main>
  </div>;
};

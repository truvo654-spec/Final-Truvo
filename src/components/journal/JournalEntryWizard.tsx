import React, { useMemo, useState } from 'react';
import { X, Check, Star, Upload, ChevronLeft, ChevronRight, Link2, PenLine } from 'lucide-react';
import { Broker, JournalEntry, JournalEmotion, JournalChecklistItem, PortfolioAssetClass, PortfolioTrade } from '../../types';
import { PORTFOLIO_TRADES } from '../../data/portfolioData';
import { AutoSyncPanel, StatementUploadPanel } from './JournalIngestPanels';
import {
  JOURNAL_EMOTIONS,
  JOURNAL_STRATEGIES,
  JOURNAL_TAGS,
  JOURNAL_MISTAKES,
  JOURNAL_TODAY,
} from '../../data/journalData';

interface JournalEntryWizardProps {
  checklist: JournalChecklistItem[];
  journaledTradeIds: string[];
  onClose: () => void;
  onSave: (entry: JournalEntry) => void;
  existingEntries?: JournalEntry[];
  onImportMany?: (entries: JournalEntry[]) => void;
  brokers?: Broker[];
  onConnectBroker?: (broker: Broker) => void;
  initialMode?: 'auto' | 'upload' | 'import' | 'manual';
}

const STEPS = ['Trade', 'Setup', 'Execution', 'Review'];
const ASSET_CLASSES: PortfolioAssetClass[] = ['Forex', 'Crypto', 'Stocks', 'Commodity', 'Indices'];

const chip = (active: boolean) =>
  `px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
    active ? 'bg-[#5338ec] border-[#5338ec] text-white' : 'bg-white border-slate-200 text-[#474556] hover:border-[#5338ec]'
  }`;

export const JournalEntryWizard: React.FC<JournalEntryWizardProps> = ({
  checklist,
  journaledTradeIds,
  onClose,
  onSave,
  existingEntries = [],
  onImportMany,
  brokers = [],
  onConnectBroker,
  initialMode,
}) => {
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState<'auto' | 'upload' | 'import' | 'manual'>(initialMode ?? 'import');
  const [linked, setLinked] = useState<PortfolioTrade | null>(null);

  // manual trade fields
  const [symbol, setSymbol] = useState('');
  const [assetClass, setAssetClass] = useState<PortfolioAssetClass>('Forex');
  const [direction, setDirection] = useState<'BUY' | 'SELL'>('BUY');
  const [entryPrice, setEntryPrice] = useState('');
  const [exitPrice, setExitPrice] = useState('');
  const [stopPrice, setStopPrice] = useState('');
  const [size, setSize] = useState('');
  const [takeProfit, setTakeProfit] = useState('');
  const [commission, setCommission] = useState('');
  const [entryTime, setEntryTime] = useState('');
  const [exitTime, setExitTime] = useState('');

  // setup
  const [strategy, setStrategy] = useState(JOURNAL_STRATEGIES[0]);
  const [brokerId, setBrokerId] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [setupNotes, setSetupNotes] = useState('');
  const [screenshot, setScreenshot] = useState<string | undefined>();

  // execution
  const [checked, setChecked] = useState<string[]>([]);
  const [followedPlan, setFollowedPlan] = useState(true);
  const [emotionBefore, setEmotionBefore] = useState<JournalEmotion>('Calm');
  const [emotionAfter, setEmotionAfter] = useState<JournalEmotion>('Calm');
  const [mistakes, setMistakes] = useState<string[]>([]);

  // review
  const [lessons, setLessons] = useState('');
  const [rating, setRating] = useState(3);

  const importable = useMemo(
    () => PORTFOLIO_TRADES.filter((t) => !journaledTradeIds.includes(t.id)),
    [journaledTradeIds]
  );

  const toggle = (list: string[], setList: (v: string[]) => void, v: string) =>
    setList(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const timeOrderError =
    mode === 'manual' && entryTime && exitTime && new Date(exitTime).getTime() < new Date(entryTime).getTime()
      ? 'Exit time must be after entry time.'
      : '';
  const num = (v: string) => (v === '' ? NaN : parseFloat(v));
  const levelError = (() => {
    if (mode !== 'manual') return '';
    const e = num(entryPrice), sl = num(stopPrice), tp = num(takeProfit);
    const long = direction === 'BUY';
    if (!isNaN(e) && !isNaN(sl) && (long ? sl >= e : sl <= e)) return `Stop loss should be ${long ? 'below' : 'above'} entry for a ${long ? 'long' : 'short'}.`;
    if (!isNaN(e) && !isNaN(tp) && (long ? tp <= e : tp >= e)) return `Take profit should be ${long ? 'above' : 'below'} entry for a ${long ? 'long' : 'short'}.`;
    return '';
  })();
  const plannedRR = (() => {
    const e = num(entryPrice), sl = num(stopPrice), tp = num(takeProfit);
    if (isNaN(e) || isNaN(sl) || isNaN(tp) || levelError || Math.abs(e - sl) === 0) return null;
    return Math.round((Math.abs(tp - e) / Math.abs(e - sl)) * 100) / 100;
  })();
  const grossPreview = (() => {
    const e = num(entryPrice), x = num(exitPrice), sz = num(size);
    if (isNaN(e) || isNaN(x) || isNaN(sz)) return null;
    const move = direction === 'BUY' ? x - e : e - x;
    return Math.round(move * sz * 100 * 100) / 100;
  })();
  const netPreview = grossPreview === null ? null : Math.round((grossPreview - (num(commission) || 0)) * 100) / 100;
  const usd = (v: number) => `${v >= 0 ? '+' : '-'}$${Math.abs(v).toFixed(2)}`;
  const tradeValid =
    mode === 'import'
      ? !!linked
      : mode !== 'manual'
      ? false
      : symbol.trim() !== '' && entryPrice !== '' && size !== '' && !timeOrderError && !levelError;

  const handleFile = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setScreenshot(reader.result as string);
    reader.readAsDataURL(file);
  };

  const buildEntry = (): JournalEntry => {
    if (mode === 'import' && linked) {
      const outcome = !linked.isRealized ? 'open' : linked.outcome === 'neutral' ? 'breakeven' : linked.outcome;
      return {
        id: `jr_${Date.now()}`,
        date: JOURNAL_TODAY,
        symbol: linked.symbol,
        assetClass: linked.assetClass,
        direction: linked.direction,
        entryPrice: linked.entryPrice,
        exitPrice: linked.exitPrice,
        size: linked.size,
        pnl: linked.pnl,
        rMultiple: outcome === 'win' ? linked.riskRewardRatio ?? 1 : outcome === 'loss' ? -1 : null,
        outcome,
        strategy,
        tags,
        setupNotes,
        emotionBefore,
        emotionAfter,
        followedPlan,
        checklistDone: checked,
        mistakes,
        lessons,
        rating,
        screenshot,
        linkedTradeId: linked.id,
        source: 'portfolio',
      };
    }
    const entry = parseFloat(entryPrice);
    const exit = exitPrice ? parseFloat(exitPrice) : null;
    const sz = parseFloat(size);
    const move = exit !== null ? (direction === 'BUY' ? exit - entry : entry - exit) : 0;
    const pnl = Math.round(move * sz * 100 * 100) / 100;
    const stop = stopPrice ? Math.abs(entry - parseFloat(stopPrice)) : 0;
    const r = exit !== null && stop > 0 ? Math.round((move / stop) * 10) / 10 : null;
    const outcome = exit === null ? 'open' : pnl > 0 ? 'win' : pnl < 0 ? 'loss' : 'breakeven';
    return {
      id: `jr_${Date.now()}`,
      date: JOURNAL_TODAY,
      symbol: symbol.trim().toUpperCase(),
      assetClass,
      direction,
      entryPrice: entry,
      exitPrice: exit,
      size: sz,
      pnl,
      rMultiple: r,
      outcome,
      strategy,
      tags,
      setupNotes,
      emotionBefore,
      emotionAfter,
      followedPlan,
      checklistDone: checked,
      mistakes,
      lessons,
      rating,
      screenshot,
      source: 'manual',
      brokerId: brokerId || undefined,
      stopPrice: stopPrice ? parseFloat(stopPrice) : undefined,
      takeProfit: takeProfit ? parseFloat(takeProfit) : undefined,
      commission: commission ? parseFloat(commission) : undefined,
      entryTime: entryTime || undefined,
      exitTime: exitTime || undefined,
      plannedR: plannedRR,
    };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white border border-[#e2e8f0] rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl text-[#0b1c30]">
        {/* Header + stepper */}
        <div className="px-6 pt-5 pb-4 border-b border-[#f1f5f9]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">New journal entry</h2>
            <button onClick={onClose} aria-label="Close" className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            {STEPS.map((label, i) => (
              <React.Fragment key={label}>
                <div className="flex items-center gap-2">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                      i < step ? 'bg-emerald-500 text-white' : i === step ? 'bg-[#5338ec] text-white' : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
                  </span>
                  <span className={`text-xs font-semibold hidden sm:inline ${i === step ? 'text-[#0b1c30]' : 'text-slate-400'}`}>
                    {label}
                  </span>
                </div>
                {i < STEPS.length - 1 && <div className={`flex-1 h-px ${i < step ? 'bg-emerald-300' : 'bg-slate-200'}`} />}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 overflow-y-auto flex-1">
          {step === 0 && (
            <div>
              <div className="flex flex-wrap gap-2 mb-4" role="tablist" aria-label="How to add trades">
                <button role="tab" aria-selected={mode === 'auto'} onClick={() => setMode('auto')} className={chip(mode === 'auto')}>Sync Account</button>
                <button role="tab" aria-selected={mode === 'upload'} onClick={() => setMode('upload')} className={chip(mode === 'upload')}>Upload Statement</button>
                <button role="tab" aria-selected={mode === 'import'} onClick={() => setMode('import')} className={chip(mode === 'import') + ' flex items-center gap-1.5'}>
                  <Link2 className="w-3.5 h-3.5" /> Import from Portfolio
                </button>
                <button role="tab" aria-selected={mode === 'manual'} onClick={() => setMode('manual')} className={chip(mode === 'manual') + ' flex items-center gap-1.5'}>
                  <PenLine className="w-3.5 h-3.5" /> Enter manually
                </button>
              </div>

              {mode === 'auto' && <AutoSyncPanel brokers={brokers} onConnect={onConnectBroker} />}
              {mode === 'upload' && (
                <StatementUploadPanel
                  existing={existingEntries}
                  strategy={strategy}
                  onImport={(list) => (onImportMany ? onImportMany(list) : list.forEach(onSave))}
                />
              )}

              {mode === 'auto' || mode === 'upload' ? null : mode === 'import' ? (
                <div className="space-y-2">
                  {importable.length === 0 && (
                    <p className="text-sm text-[#474556] py-6 text-center">Every portfolio trade is already journaled. Nice work.</p>
                  )}
                  {importable.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setLinked(t)}
                      className={`w-full flex items-center justify-between gap-3 border rounded-xl px-4 py-3 text-left transition-colors ${
                        linked?.id === t.id ? 'border-[#5338ec] bg-[#F8F7FF]' : 'border-slate-200 hover:border-[#5338ec]'
                      }`}
                    >
                      <div>
                        <p className="text-sm font-bold">{t.symbol} <span className={t.direction === 'BUY' ? 'text-emerald-600' : 'text-rose-600'}>{t.direction}</span></p>
                        <p className="text-[11px] text-[#94a3b8]">{t.broker} · {t.size} lots · {t.isRealized ? 'Closed' : 'Open'}</p>
                      </div>
                      <span className={`text-sm font-bold font-mono ${t.pnl >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {t.pnl >= 0 ? '+' : '-'}${Math.abs(t.pnl).toFixed(2)}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-3.5">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-[#474556] mb-1 block">Symbol / ticker</label>
                      <input value={symbol} onChange={(e) => setSymbol(e.target.value)} placeholder="EUR/USD" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5338ec]/30" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-[#474556] mb-1 block">Asset class</label>
                      <select value={assetClass} onChange={(e) => setAssetClass(e.target.value as PortfolioAssetClass)} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm">
                        {ASSET_CLASSES.map((a) => <option key={a}>{a}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="flex rounded-xl border border-slate-200 overflow-hidden w-fit">
                    {(['BUY', 'SELL'] as const).map((d) => (
                      <button key={d} onClick={() => setDirection(d)} aria-pressed={direction === d} className={`px-6 py-2 text-xs font-bold ${direction === d ? (d === 'BUY' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white') : 'bg-white text-slate-500'}`}>{d === 'BUY' ? 'LONG' : 'SHORT'}</button>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                      ['Size (lots)', size, setSize, '1'],
                      ['Entry price', entryPrice, setEntryPrice, 'any'],
                      ['Exit price', exitPrice, setExitPrice, 'any'],
                      ['Commissions ($)', commission, setCommission, '0.01'],
                      ['Stop loss (SL)', stopPrice, setStopPrice, 'any'],
                      ['Take profit (TP)', takeProfit, setTakeProfit, 'any'],
                    ].map(([label, val, setter, step]) => (
                      <div key={label as string}>
                        <label className="text-xs font-semibold text-[#474556] mb-1 block">{label as string}</label>
                        <input type="number" step={step as string} min={label === 'Commissions ($)' || label === 'Size (lots)' ? 0 : undefined} value={val as string} onChange={(e) => (setter as (v: string) => void)(e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5338ec]/30" />
                      </div>
                    ))}
                    <div className="sm:col-span-2">
                      <label className="text-xs font-semibold text-[#474556] mb-1 block">Entry timestamp</label>
                      <input type="datetime-local" step="1" value={entryTime} onChange={(e) => setEntryTime(e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5338ec]/30" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-xs font-semibold text-[#474556] mb-1 block">Exit timestamp</label>
                      <input type="datetime-local" step="1" value={exitTime} onChange={(e) => setExitTime(e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5338ec]/30" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-semibold text-[#474556] mb-1 block">Playbook setup</label>
                      <select value={strategy} onChange={(e) => setStrategy(e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm">
                        {JOURNAL_STRATEGIES.map((st) => <option key={st}>{st}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-[#474556] mb-1 block">Broker</label>
                      <select value={brokerId} onChange={(e) => setBrokerId(e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm">
                        <option value="">Unassigned</option>
                        {brokers.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                      </select>
                    </div>
                    <div className="rounded-xl bg-slate-50 px-3 py-2 text-xs text-[#474556]">
                      <div className="flex justify-between"><span>Gross P&amp;L</span><span className="font-mono font-bold">{grossPreview === null ? '—' : usd(grossPreview)}</span></div>
                      <div className="flex justify-between mt-1"><span>Net after commissions</span><span className="font-mono font-bold">{netPreview === null ? '—' : usd(netPreview)}</span></div>
                    </div>
                  </div>
                  {(timeOrderError || levelError) && <p role="alert" className="text-[11px] font-semibold text-rose-600">{timeOrderError || levelError}</p>}
                  {plannedRR !== null && <p className="text-[11px] font-semibold text-[#5338ec]">Planned risk:reward 1 : {plannedRR}</p>}
                  <p className="text-[11px] text-[#94a3b8]">Leave exit empty for a trade that is still open. Stop loss lets us calculate your R multiple; take profit gives your planned risk:reward. P&L shown is gross, commissions are stored separately. You can refine the playbook, tags and notes in the next step.</p>
                </div>
              )}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-[#474556] mb-2">Strategy</p>
                <div className="flex flex-wrap gap-2">
                  {JOURNAL_STRATEGIES.map((s) => (
                    <button key={s} onClick={() => setStrategy(s)} className={chip(strategy === s)}>{s}</button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-[#474556] mb-2">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {JOURNAL_TAGS.map((t) => (
                    <button key={t} onClick={() => toggle(tags, setTags, t)} className={chip(tags.includes(t))}>{t}</button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-[#474556] mb-2">Why did you take this trade?</p>
                <textarea value={setupNotes} onChange={(e) => setSetupNotes(e.target.value)} rows={4} placeholder="Describe the setup, the level, and what had to be true for the trade to work..." className="w-full resize-none border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#5338ec]/30" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-[#474556] mb-2">Chart screenshot</p>
                {screenshot ? (
                  <div className="relative">
                    <img src={screenshot} alt="Screenshot" className="w-full rounded-xl border border-slate-200" />
                    <button onClick={() => setScreenshot(undefined)} className="absolute top-2 right-2 bg-white/90 text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-200">Remove</button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center gap-1.5 border-2 border-dashed border-slate-200 hover:border-[#5338ec] rounded-xl py-6 cursor-pointer transition-colors">
                    <Upload className="w-5 h-5 text-slate-400" />
                    <span className="text-xs font-semibold text-[#474556]">Attach a screenshot</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
                  </label>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-[#474556] mb-2">Pre-trade checklist</p>
                <div className="space-y-2">
                  {checklist.map((c) => (
                    <button key={c.id} onClick={() => toggle(checked, setChecked, c.id)} className="w-full flex items-center gap-3 text-left border border-slate-200 rounded-xl px-3.5 py-2.5 hover:border-[#5338ec] transition-colors">
                      <span className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${checked.includes(c.id) ? 'bg-[#5338ec] border-[#5338ec]' : 'border-slate-300'}`}>
                        {checked.includes(c.id) && <Check className="w-3.5 h-3.5 text-white" />}
                      </span>
                      <span className="text-sm">{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-[#474556] mb-2">Did you follow your plan?</p>
                <div className="flex gap-2">
                  <button onClick={() => setFollowedPlan(true)} className={chip(followedPlan)}>Yes</button>
                  <button onClick={() => setFollowedPlan(false)} className={chip(!followedPlan)}>No</button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-[#474556] mb-2">Feeling before</p>
                  <div className="flex flex-wrap gap-1.5">
                    {JOURNAL_EMOTIONS.map((e) => <button key={e} onClick={() => setEmotionBefore(e)} className={chip(emotionBefore === e)}>{e}</button>)}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-[#474556] mb-2">Feeling after</p>
                  <div className="flex flex-wrap gap-1.5">
                    {JOURNAL_EMOTIONS.map((e) => <button key={e} onClick={() => setEmotionAfter(e)} className={chip(emotionAfter === e)}>{e}</button>)}
                  </div>
                </div>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-[#474556] mb-2">Mistakes (if any)</p>
                <div className="flex flex-wrap gap-2">
                  {JOURNAL_MISTAKES.map((m) => <button key={m} onClick={() => toggle(mistakes, setMistakes, m)} className={chip(mistakes.includes(m))}>{m}</button>)}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div className="bg-[#F8F7FF] border border-[#ECEEFA] rounded-xl p-4 text-sm">
                <p className="font-bold mb-1">{mode === 'import' && linked ? linked.symbol : symbol.toUpperCase() || 'Your trade'} · {strategy}</p>
                <p className="text-xs text-[#474556]">
                  {checked.length}/{checklist.length} checklist items · {followedPlan ? 'Plan followed' : 'Plan broken'} · {emotionBefore} → {emotionAfter}
                  {mistakes.length > 0 && ` · ${mistakes.length} mistake${mistakes.length > 1 ? 's' : ''}`}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-[#474556] mb-2">What is the lesson?</p>
                <textarea value={lessons} onChange={(e) => setLessons(e.target.value)} rows={4} placeholder="What went well, what would you change, what will you do next time?" className="w-full resize-none border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#5338ec]/30" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-[#474556] mb-2">Rate your execution (not the result)</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} onClick={() => setRating(n)} aria-label={`${n} stars`}>
                      <Star className={`w-7 h-7 ${n <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#f1f5f9] flex items-center justify-between">
          <button
            onClick={() => (step === 0 ? onClose() : setStep(step - 1))}
            className="flex items-center gap-1 text-sm font-semibold text-[#474556] hover:text-[#0b1c30]"
          >
            <ChevronLeft className="w-4 h-4" /> {step === 0 ? 'Cancel' : 'Back'}
          </button>
          {step < STEPS.length - 1 ? (
            <button
              disabled={step === 0 && !tradeValid}
              onClick={() => setStep(step + 1)}
              className="flex items-center gap-1 bg-[#5338ec] hover:bg-[#4326d8] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => onSave(buildEntry())}
              className="bg-[#5338ec] hover:bg-[#4326d8] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
            >
              Save entry
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

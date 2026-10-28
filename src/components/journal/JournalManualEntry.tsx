import React, { useState } from 'react';
import type { Broker, JournalEntry, PortfolioAssetClass, TradingStatus } from '../../types';
import { validDate } from './journalDay';
import { resultOf } from './journalMath';
import { useDialogFocus } from './useDialogFocus';
import { journalButton } from './JournalCards';
import { JOURNAL_MARKET_TYPES } from './journalOverview';

interface Props {
  currency: string;
  account: string;
  brokers: Broker[];
  strategies: string[];
  onSave: (entry: JournalEntry) => void;
  onClose: () => void;
}
export function JournalManualEntry({ currency, account, brokers, strategies, onSave, onClose }: Props) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [symbol, setSymbol] = useState('');
  const [market, setMarket] = useState<PortfolioAssetClass>('Forex');
  const [direction, setDirection] = useState<'BUY' | 'SELL'>('BUY');
  const [status, setStatus] = useState<TradingStatus>('closed');
  const [accountId, setAccountId] = useState(account === 'all' ? 'manual' : account);
  const [strategy, setStrategy] = useState(strategies[0] || 'Unassigned');
  const [brokerId, setBrokerId] = useState('');
  const [values, setValues] = useState({ size: '', entry: '', exit: '', pnl: '', fees: '' });
  const [error, setError] = useState('');
  const close = () => { if ((!symbol && !Object.values(values).some(Boolean)) || window.confirm('Discard this unsaved trade?')) onClose(); };
  const ref = useDialogFocus(close);
  const field = 'mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm';
  return <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/35 p-3" onClick={event => { if (event.target === event.currentTarget) close(); }}>
    <div ref={ref} role="dialog" aria-modal="true" aria-label="Add trade" tabIndex={-1} className="max-h-[92dvh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 outline-none">
      <header className="mb-4 flex justify-between"><h2 className="text-lg font-bold">Add trade</h2><button className={journalButton} onClick={close}>Close</button></header>
      <p className="mb-4 text-sm text-slate-500">Record your trade and its reported result. Unknown costs stay unknown.</p>
      <form className="space-y-4" onSubmit={event => {
        event.preventDefault();
        if (!validDate(date) || !symbol.trim() || !accountId.trim()) { setError('Enter a valid date, symbol and account.'); return; }
        if (!(Number(values.size) > 0) || !(Number(values.entry) > 0) || !Number.isFinite(Number(values.size)) || !Number.isFinite(Number(values.entry))) { setError('Quantity and entry price must be positive finite numbers.'); return; }
        if ((status === 'closed' && values.pnl === '') || (values.pnl !== '' && !Number.isFinite(Number(values.pnl))) || (values.fees !== '' && (!Number.isFinite(Number(values.fees)) || Number(values.fees) < 0)) || (values.exit !== '' && (!Number.isFinite(Number(values.exit)) || Number(values.exit) <= 0))) { setError('A closed trade needs a reported result. Exit price must be positive and costs must be zero or positive when supplied.'); return; }
        const entry: JournalEntry = {
          id: crypto.randomUUID(), date, symbol: symbol.trim().toUpperCase(), assetClass: market, direction,
          tradingStatus: status, accountId: accountId.trim(), accountCurrency: currency,
          entryPrice: Number(values.entry), exitPrice: values.exit === '' ? null : Number(values.exit), size: Number(values.size),
          quantityUnit: 'unknown', pnl: values.pnl === '' ? 0 : Number(values.pnl), pnlKnown: values.pnl !== '',
          commission: values.fees === '' ? undefined : Number(values.fees), rMultiple: null, outcome: 'open',
          strategy, brokerId: brokerId || undefined, tags: [], setupNotes: '', emotionBefore: null, emotionAfter: null,
          followedPlan: null, checklistDone: [], mistakes: [], lessons: '', rating: null, reviewState: 'needs_review', source: 'manual',
        };
        onSave({ ...entry, outcome: resultOf(entry, 'gross') });
      }}>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm">Date (UTC)<input type="date" required value={date} onChange={event => setDate(event.target.value)} className={field}/></label>
          <label className="text-sm">Symbol<input required value={symbol} onChange={event => setSymbol(event.target.value)} placeholder="e.g. EUR/USD" className={field}/></label>
          <label className="text-sm">Market<select value={market} onChange={event => setMarket(event.target.value as PortfolioAssetClass)} className={field}>{JOURNAL_MARKET_TYPES.map(type => <option key={type}>{type}</option>)}</select></label>
          <label className="text-sm">Side<select value={direction} onChange={event => setDirection(event.target.value as 'BUY' | 'SELL')} className={field}><option value="BUY">Long</option><option value="SELL">Short</option></select></label>
          <label className="text-sm">Trading status<select value={status} onChange={event => setStatus(event.target.value as TradingStatus)} className={field}><option value="closed">Closed</option><option value="open">Open</option><option value="planned">Planned</option></select></label>
          <label className="text-sm">Account ({currency})<input required value={accountId} onChange={event => setAccountId(event.target.value)} className={field}/></label>
          {(['size', 'entry', 'exit', 'pnl', 'fees'] as const).map(key => <label key={key} className="text-sm">{{ size: 'Quantity (broker units)', entry: 'Entry price', exit: 'Exit price (optional)', pnl: `Reported gross result (${currency})`, fees: `Total costs (${currency}, optional)` }[key]}<input type="number" step="any" required={key === 'size' || key === 'entry' || (key === 'pnl' && status === 'closed')} value={values[key]} onChange={event => setValues(current => ({ ...current, [key]: event.target.value }))} className={field}/></label>)}
          <label className="text-sm">Playbook<select value={strategy} onChange={event => setStrategy(event.target.value)} className={field}>{[...new Set(['Unassigned', ...strategies])].map(name => <option key={name}>{name}</option>)}</select></label>
          <label className="text-sm">Broker<select value={brokerId} onChange={event => setBrokerId(event.target.value)} className={field}><option value="">Unassigned</option>{brokers.map(broker => <option key={broker.id} value={broker.id}>{broker.name}</option>)}</select></label>
        </div>
        {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
        <button type="submit" className="rounded-lg bg-[#5338ec] px-4 py-2 text-sm font-semibold text-white">Save trade</button>
      </form>
    </div>
  </div>;
}

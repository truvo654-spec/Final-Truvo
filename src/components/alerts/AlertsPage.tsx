import React, { useMemo, useState } from 'react';
import { Bell, BellRing, Mail, MessageSquare, Copy, Trash2, Pencil, Pause, Play, Send, AlertTriangle, Info } from 'lucide-react';
import { instruments } from '../analysis/detail/mockMarket';
import { planFromTier, PLAN_LABEL } from '../portfolio/portfolioUi';

type AlertType = 'price' | 'volatility' | 'news';
type Status = 'active' | 'paused' | 'triggered';

interface AlertRule {
  id: string;
  type: AlertType;
  symbol: string;
  condition: string;
  value: number;
  window: string;
  impact: 'Medium' | 'High';
  keyword: string;
  app: boolean;
  email: boolean;
  sms: boolean;
  repeat: 'once' | 'every';
  status: Status;
  lastTriggered?: string;
}

interface AlertsPageProps {
  userTierLevel: number;
  isLoggedIn: boolean;
  onUpgradePrompt: () => void;
  onShowToast: (msg: string) => void;
}

const LIMIT = { basic: 5, intermediate: 25, premium: 999 };
const blank = (): AlertRule => ({ id: '', type: 'price', symbol: 'EUR/USD', condition: 'above', value: 0, window: '1h', impact: 'High', keyword: '', app: true, email: true, sms: false, repeat: 'once', status: 'active' });

const TYPE_LABEL: Record<AlertType, string> = { price: 'Price', volatility: 'Volatility', news: 'News' };
const TYPE_STYLE: Record<AlertType, string> = { price: 'bg-[#EEF0FE] text-[#5338ec]', volatility: 'bg-amber-50 text-amber-700', news: 'bg-sky-50 text-sky-700' };

const away = (price: number | undefined, cond: string) => Number(((price ?? 0) * (cond === 'below' ? 0.995 : 1.005)).toFixed(4));
const fmt = (n: number) => (n >= 1000 ? n.toLocaleString(undefined, { maximumFractionDigits: 2 }) : n >= 10 ? n.toFixed(2) : n.toFixed(4));

export const AlertsPage: React.FC<AlertsPageProps> = ({ userTierLevel, isLoggedIn, onUpgradePrompt, onShowToast }) => {
  const plan = planFromTier(userTierLevel, isLoggedIn);
  const limit = LIMIT[plan];

  const symbols = useMemo(() => {
    const seen = new Set<string>();
    return instruments.filter((i) => (seen.has(i.symbol) ? false : seen.add(i.symbol))).slice(0, 40);
  }, []);
  const quote = (sym: string) => symbols.find((s) => s.symbol === sym);

  const [alerts, setAlerts] = useState<AlertRule[]>([
    { ...blank(), id: 'a1', type: 'price', symbol: 'XAU/USD', condition: 'above', value: 2700, repeat: 'once', email: false },
    { ...blank(), id: 'a2', type: 'volatility', symbol: 'BTC/USDT', condition: 'move', value: 3, window: '1h', repeat: 'every' },
    { ...blank(), id: 'a3', type: 'news', symbol: 'EUR/USD', condition: 'impact', value: 0, impact: 'High', keyword: 'ECB', status: 'triggered', lastTriggered: 'Today 09:14' },
  ]);
  const [form, setForm] = useState<AlertRule>(() => ({ ...blank(), value: away(quote('EUR/USD')?.price ?? 1.08, 'above') }));
  const [phone, setPhone] = useState('');
  const [fType, setFType] = useState<'all' | AlertType>('all');
  const [fStatus, setFStatus] = useState<'all' | Status>('all');
  const editing = alerts.some((a) => a.id === form.id);

  const q = quote(form.symbol);
  const set = <K extends keyof AlertRule>(k: K, v: AlertRule[K]) => setForm((f) => ({ ...f, [k]: v }));

  const describe = (a: AlertRule) => {
    if (a.type === 'price') {
      return a.condition === 'above' ? `${a.symbol} trades above ${fmt(a.value)}` : a.condition === 'below' ? `${a.symbol} trades below ${fmt(a.value)}` : `${a.symbol} moves ${a.value}% either way within ${a.window}`;
    }
    if (a.type === 'volatility') return `${a.symbol} moves more than ${a.value}% in ${a.window}`;
    return `${a.impact}-impact news on ${a.symbol}${a.keyword ? ` mentioning “${a.keyword}”` : ''}`;
  };

  const distance = (a: AlertRule) => {
    const p = quote(a.symbol)?.price;
    if (!p || a.type !== 'price' || a.condition === 'move' || !a.value) return null;
    return ((a.value - p) / p) * 100;
  };

  const problems: string[] = [];
  if (form.type !== 'news' && !(form.value > 0)) problems.push('Enter a value above zero.');
  if (!form.app && !form.email && !form.sms) problems.push('Pick at least one channel.');
  if (form.sms && !/^\+?\d{8,15}$/.test(phone.replace(/[\s-]/g, ''))) problems.push('Add a valid phone number to get SMS.');
  const warnNow =
    form.type === 'price' && q && ((form.condition === 'above' && q.price >= form.value) || (form.condition === 'below' && q.price <= form.value))
      ? `${form.symbol} is already ${form.condition} ${fmt(form.value)}, so this would fire straight away.`
      : null;

  const save = () => {
    if (problems.length) return;
    if (!editing && alerts.length >= limit) {
      onShowToast(`The ${PLAN_LABEL[plan]} plan includes ${limit} alerts.`);
      return onUpgradePrompt();
    }
    if (editing) setAlerts((p) => p.map((a) => (a.id === form.id ? { ...form, status: 'active' } : a)));
    else setAlerts((p) => [{ ...form, id: `a${Date.now()}` }, ...p]);
    onShowToast(editing ? 'Alert updated' : 'Alert created');
    setForm({ ...blank(), value: away(quote(form.symbol)?.price, 'above') });
  };

  const shown = alerts.filter((a) => (fType === 'all' || a.type === fType) && (fStatus === 'all' || a.status === fStatus));
  const channels = (a: AlertRule) => [a.app && 'In-app', a.email && 'Email', a.sms && 'SMS'].filter(Boolean).join(' · ');
  const field = 'w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5338ec]/30';
  const label = 'text-xs font-semibold text-[#474556] mb-1 block';

  return (
    <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-8 md:px-14 py-8 sm:py-10 pb-24">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-[#0b1c30]">Price Alerts</h1>
        <p className="text-sm text-[#474556] mt-1 max-w-xl">Tell us what matters and where to reach you. Preview exactly what you will receive before you save.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[440px_minmax(0,1fr)] gap-6 items-start">
        {/* Create / edit */}
        <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5 space-y-4 xl:sticky xl:top-24">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#0b1c30]">{editing ? 'Edit alert' : 'New alert'}</h3>
            {editing && <button onClick={() => setForm(blank())} className="text-xs font-semibold text-[#474556] hover:text-[#5338ec]">Cancel edit</button>}
          </div>

          <div className="inline-flex bg-[#f1f5f9] rounded-full p-1">
            {(['price', 'volatility', 'news'] as AlertType[]).map((t) => (
              <button key={t} onClick={() => setForm({ ...form, type: t, condition: t === 'price' ? 'above' : t === 'volatility' ? 'move' : 'impact', value: t === 'price' ? away(q?.price, 'above') : t === 'volatility' ? 3 : 0 })} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${form.type === t ? 'bg-white text-[#5338ec] shadow-xs' : 'text-[#474556]'}`}>
                {TYPE_LABEL[t]}
              </button>
            ))}
          </div>

          <div>
            <label className={label}>Instrument</label>
            <select value={form.symbol} onChange={(e) => { const s = e.target.value; setForm((f) => ({ ...f, symbol: s, value: f.type === 'price' ? away(quote(s)?.price, f.condition) : f.value })); }} className={field}>
              {symbols.map((s) => <option key={s.symbol} value={s.symbol}>{s.symbol}</option>)}
            </select>
            {q && <p className="text-[11px] text-[#94a3b8] mt-1">Now {fmt(q.price)} · {q.change >= 0 ? '+' : ''}{q.change.toFixed(2)}% today</p>}
          </div>

          {form.type === 'price' && (
            <div className="grid grid-cols-2 gap-3">
              <div><label className={label}>When price</label>
                <select value={form.condition} onChange={(e) => setForm((f) => ({ ...f, condition: e.target.value, value: e.target.value === 'move' ? 2 : away(q?.price, e.target.value) }))} className={field}><option value="above">Goes above</option><option value="below">Goes below</option><option value="move">Moves by %</option></select></div>
              <div><label className={label}>{form.condition === 'move' ? 'Percent' : 'Level'}</label>
                <input type="number" value={form.value || ''} onChange={(e) => set('value', Number(e.target.value))} className={field} /></div>
              {form.condition === 'move' && <div className="col-span-2"><label className={label}>Within</label><select value={form.window} onChange={(e) => set('window', e.target.value)} className={field}><option value="1h">1 hour</option><option value="4h">4 hours</option><option value="24h">24 hours</option></select></div>}
            </div>
          )}
          {form.type === 'volatility' && (
            <div className="grid grid-cols-2 gap-3">
              <div><label className={label}>Move larger than (%)</label><input type="number" value={form.value || ''} onChange={(e) => set('value', Number(e.target.value))} className={field} /></div>
              <div><label className={label}>Within</label><select value={form.window} onChange={(e) => set('window', e.target.value)} className={field}><option value="1h">1 hour</option><option value="4h">4 hours</option><option value="24h">24 hours</option></select></div>
            </div>
          )}
          {form.type === 'news' && (
            <div className="grid grid-cols-2 gap-3">
              <div><label className={label}>Minimum impact</label><select value={form.impact} onChange={(e) => set('impact', e.target.value as 'Medium' | 'High')} className={field}><option>Medium</option><option>High</option></select></div>
              <div><label className={label}>Keyword (optional)</label><input value={form.keyword} onChange={(e) => set('keyword', e.target.value)} placeholder="e.g. ECB" className={field} /></div>
            </div>
          )}

          <div>
            <label className={label}>Send it to</label>
            <div className="flex flex-wrap gap-2">
              {([['app', 'In-app', Bell], ['email', 'Email', Mail], ['sms', 'SMS', MessageSquare]] as const).map(([k, l, I]) => (
                <button key={k} onClick={() => set(k, !form[k])} className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors ${form[k] ? 'bg-[#5338ec] border-[#5338ec] text-white' : 'bg-white border-slate-200 text-[#474556] hover:border-[#5338ec]'}`}><I className="w-3.5 h-3.5" /> {l}</button>
              ))}
            </div>
            {form.sms && <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+66 81 234 5678" className={`${field} mt-2`} />}
          </div>

          <div>
            <label className={label}>How often</label>
            <div className="flex rounded-xl border border-slate-200 overflow-hidden text-xs font-bold">
              <button onClick={() => set('repeat', 'once')} className={`flex-1 py-2 ${form.repeat === 'once' ? 'bg-[#5338ec] text-white' : 'bg-white text-slate-500'}`}>Once</button>
              <button onClick={() => set('repeat', 'every')} className={`flex-1 py-2 ${form.repeat === 'every' ? 'bg-[#5338ec] text-white' : 'bg-white text-slate-500'}`}>Every time</button>
            </div>
          </div>

          {/* Preview before save */}
          <div className="bg-[#F8F7FF] border border-[#ECEEFA] rounded-xl p-4 space-y-2.5">
            <p className="text-[11px] font-bold uppercase tracking-wide text-[#5338ec]">Preview</p>
            <p className="text-sm text-[#0b1c30] leading-relaxed">We will tell you when <span className="font-bold">{describe(form)}</span>{form.repeat === 'once' ? ', one time.' : ', every time it happens.'}</p>
            {form.app && <div className="flex items-start gap-2 bg-white rounded-lg px-3 py-2 border border-[#e2e8f0]"><BellRing className="w-4 h-4 text-[#5338ec] mt-0.5 shrink-0" /><p className="text-xs text-[#0b1c30]"><span className="font-bold">{form.symbol}</span> alert: {describe(form)}.</p></div>}
            {form.email && <div className="bg-white rounded-lg px-3 py-2 border border-[#e2e8f0]"><p className="text-[10px] text-[#94a3b8]">Email · subject</p><p className="text-xs font-bold text-[#0b1c30]">{form.symbol}: {describe(form)}</p></div>}
            {form.sms && <div className="bg-white rounded-lg px-3 py-2 border border-[#e2e8f0]"><p className="text-[10px] text-[#94a3b8]">SMS</p><p className="text-xs text-[#0b1c30]">MarketSyde: {form.symbol} {describe(form).replace(`${form.symbol} `, '')}.</p></div>}
          </div>

          {warnNow && <p className="flex items-start gap-2 text-xs text-amber-800 bg-amber-50 rounded-xl px-3 py-2.5"><AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />{warnNow}</p>}
          {problems.map((p) => <p key={p} className="flex items-center gap-2 text-xs text-rose-600"><Info className="w-3.5 h-3.5" />{p}</p>)}

          <button disabled={problems.length > 0} onClick={save} className="w-full bg-[#5338ec] hover:bg-[#4326d8] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold py-2.5 rounded-xl transition-colors">
            {editing ? 'Save changes' : 'Create alert'}
          </button>
          <p className="text-[11px] text-[#94a3b8]">{alerts.length} of {limit > 900 ? 'unlimited' : limit} alerts used on the {PLAN_LABEL[plan]} plan.</p>
        </div>

        {/* Management */}
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <h3 className="text-base font-bold text-[#0b1c30] mr-2">Your alerts</h3>
            <select value={fType} onChange={(e) => setFType(e.target.value as typeof fType)} className="text-xs font-semibold border border-slate-200 rounded-full px-3.5 py-2 bg-white"><option value="all">All types</option><option value="price">Price</option><option value="volatility">Volatility</option><option value="news">News</option></select>
            <select value={fStatus} onChange={(e) => setFStatus(e.target.value as typeof fStatus)} className="text-xs font-semibold border border-slate-200 rounded-full px-3.5 py-2 bg-white"><option value="all">Any status</option><option value="active">Active</option><option value="paused">Paused</option><option value="triggered">Triggered</option></select>
            <button onClick={() => { setAlerts((p) => p.map((a) => ({ ...a, status: a.status === 'triggered' ? a.status : 'paused' }))); onShowToast('All alerts paused'); }} className="ml-auto text-xs font-semibold text-[#474556] hover:text-[#5338ec]">Pause all</button>
            <button onClick={() => { setAlerts((p) => p.map((a) => ({ ...a, status: 'active' }))); onShowToast('All alerts active'); }} className="text-xs font-semibold text-[#474556] hover:text-[#5338ec]">Resume all</button>
          </div>

          <div className="space-y-3">
            {shown.map((a) => {
              const d = distance(a);
              return (
                <div key={a.id} className="bg-white border border-[#e2e8f0] rounded-2xl p-4 flex flex-wrap items-center gap-x-5 gap-y-3">
                  <div className="min-w-0 flex-1 basis-60">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${TYPE_STYLE[a.type]}`}>{TYPE_LABEL[a.type]}</span>
                      <span className={`text-[10px] font-bold ${a.status === 'active' ? 'text-emerald-600' : a.status === 'paused' ? 'text-slate-400' : 'text-amber-600'}`}>{a.status === 'triggered' ? `Triggered ${a.lastTriggered ?? ''}` : a.status === 'active' ? 'Active' : 'Paused'}</span>
                    </div>
                    <p className="text-sm font-bold text-[#0b1c30]">{describe(a)}</p>
                    <p className="text-[11px] text-[#94a3b8]">{channels(a)} · {a.repeat === 'once' ? 'Once' : 'Every time'}{d !== null ? ` · ${Math.abs(d).toFixed(2)}% ${d >= 0 ? 'above' : 'below'} now` : ''}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => onShowToast(`Test sent: ${a.symbol} alert`)} title="Send a test" className="p-2 rounded-lg text-slate-400 hover:text-[#5338ec] hover:bg-[#F8F7FF]"><Send className="w-4 h-4" /></button>
                    <button onClick={() => setAlerts((p) => p.map((x) => (x.id === a.id ? { ...x, status: x.status === 'active' ? 'paused' : 'active' } : x)))} title={a.status === 'active' ? 'Pause' : 'Resume'} className="p-2 rounded-lg text-slate-400 hover:text-[#5338ec] hover:bg-[#F8F7FF]">{a.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}</button>
                    <button onClick={() => setForm(a)} title="Edit" className="p-2 rounded-lg text-slate-400 hover:text-[#5338ec] hover:bg-[#F8F7FF]"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => { if (alerts.length >= limit) { onShowToast(`The ${PLAN_LABEL[plan]} plan includes ${limit} alerts.`); return onUpgradePrompt(); } setAlerts((p) => [{ ...a, id: `a${Date.now()}`, status: 'active', lastTriggered: undefined }, ...p]); onShowToast('Alert duplicated'); }} title="Duplicate" className="p-2 rounded-lg text-slate-400 hover:text-[#5338ec] hover:bg-[#F8F7FF]"><Copy className="w-4 h-4" /></button>
                    <button onClick={() => { setAlerts((p) => p.filter((x) => x.id !== a.id)); onShowToast('Alert deleted'); }} title="Delete" className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              );
            })}
            {shown.length === 0 && <p className="text-center py-14 text-sm text-[#474556]">No alerts match. Create one on the left.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

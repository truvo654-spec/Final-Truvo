import React, { useEffect, useMemo, useState } from 'react';
import { X, Plus, Upload, Trophy, Users, BarChart3, Repeat, Activity, CalendarPlus, Send } from 'lucide-react';
import { Card, CardTitle, PillTabs, money } from './portfolioUi';
import { Sparkline } from './PortfolioCharts';
import { CLIENTS, ClientRow, WEEKLY_VOLUME, COHORTS, TOP_INSTRUMENTS, USER_PERFORMANCE } from '../../data/portfolioData';

function seedSeries(seed: number, up: boolean) {
  let a = seed * 9301 + 49297;
  const rnd = () => ((a = (a * 9301 + 49297) % 233280) / 233280);
  let v = 100;
  return Array.from({ length: 30 }, () => {
    v += (rnd() - (up ? 0.42 : 0.58)) * 3;
    return v;
  });
}

const input = 'w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5338ec]/30';
const RISK_STYLE = { Low: 'bg-emerald-50 text-emerald-700', Medium: 'bg-amber-50 text-amber-700', High: 'bg-rose-50 text-rose-600' } as const;

const Modal: React.FC<{ title: string; onClose: () => void; children: React.ReactNode }> = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
    <div className="bg-white rounded-2xl border border-[#e2e8f0] w-full max-w-md shadow-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-[#0b1c30]">{title}</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100"><X className="w-4 h-4" /></button>
      </div>
      {children}
    </div>
  </div>
);

/* ═════════════════════════ ADVISOR ═════════════════════════ */

interface Template { id: string; title: string; strategy: string; risk: string; description: string; adopters: number }
interface Session { id: string; title: string; date: string; seats: number }
interface Submission { id: string; client: string; note: string; reviewed: boolean; feedback?: string }

export const AdvisorPanel: React.FC<{ toast: (m: string) => void }> = ({ toast }) => {
  const [profit, setProfit] = useState<'all' | 'profit' | 'loss'>('all');
  const [risk, setRisk] = useState<'all' | 'Low' | 'Medium' | 'High'>('all');
  const [asset, setAsset] = useState('all');
  const [sort, setSort] = useState<'returnPct' | 'drawdown' | 'balance'>('returnPct');
  const [picked, setPicked] = useState<ClientRow | null>(null);
  const [feedback, setFeedback] = useState('');
  const [templates, setTemplates] = useState<Template[]>([
    { id: 't1', title: 'Conservative swing on majors', strategy: 'Swing', risk: 'Low', description: 'Max 1% risk, 2 open trades, weekly review.', adopters: 14 },
    { id: 't2', title: 'London breakout, 3 rules', strategy: 'Breakout', risk: 'Medium', description: 'One setup, fixed session, hard stop.', adopters: 9 },
  ]);
  const [sessions, setSessions] = useState<Session[]>([{ id: 's1', title: 'Friday portfolio clinic', date: '2026-10-09', seats: 12 }]);
  const [subs, setSubs] = useState<Submission[]>([
    { id: 'u1', client: 'Nina Park', note: 'Two stop-outs in a row on EUR/USD. Am I over-sizing?', reviewed: false },
    { id: 'u2', client: 'Kai Tanaka', note: 'Win rate is fine but equity is flat. Please look at my exits.', reviewed: false },
    { id: 'u3', client: 'Lina Chen', note: 'Is my US500 drawdown normal for this strategy?', reviewed: true, feedback: 'Yes, within the range for the rule set. Watch the 4% line.' },
  ]);
  const [tplOpen, setTplOpen] = useState(false);
  const [sesOpen, setSesOpen] = useState(false);
  const [tpl, setTpl] = useState({ title: '', strategy: 'Swing', risk: 'Low', description: '' });
  const [ses, setSes] = useState({ title: '', date: '2026-10-16', seats: 10 });

  const [tick, setTick] = useState(0);
  const [ago, setAgo] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => {
      setTick((t) => t + 1);
      setAgo(0);
    }, 5000);
    const sec = window.setInterval(() => setAgo((a) => a + 1), 1000);
    return () => {
      window.clearInterval(id);
      window.clearInterval(sec);
    };
  }, []);
  // small simulated drift so the panel behaves like a live feed
  const live = (c: ClientRow) => Math.round((c.returnPct + Math.sin(tick * 1.7 + c.seed) * 0.35) * 10) / 10;
  const assets = useMemo(() => Array.from(new Set(CLIENTS.flatMap((c) => c.assets))), []);
  const rows = useMemo(
    () =>
      CLIENTS.map((c) => ({ ...c, returnPct: live(c) })).filter((c) => (profit === 'all' ? true : profit === 'profit' ? c.returnPct > 0 : c.returnPct <= 0) && (risk === 'all' || c.risk === risk) && (asset === 'all' || c.assets.includes(asset))).sort((a, b) =>
        sort === 'drawdown' ? a.drawdown - b.drawdown : sort === 'balance' ? b.balance - a.balance : b.returnPct - a.returnPct
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [profit, risk, asset, sort, tick]
  );

  const totalAum = rows.reduce((a, c) => a + c.balance, 0);
  const avgRet = rows.length ? rows.reduce((a, c) => a + c.returnPct, 0) / rows.length : 0;
  const chip = (active: boolean) => `px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${active ? 'bg-[#5338ec] border-[#5338ec] text-white' : 'bg-white border-slate-200 text-[#474556] hover:border-[#5338ec]'}`;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-6 items-start">
      <div className="space-y-5">
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-4"><p className="text-[11px] font-semibold text-[#474556] mb-1">Clients shown</p><p className="text-xl font-bold font-mono">{rows.length}</p></Card>
          <Card className="p-4"><p className="text-[11px] font-semibold text-[#474556] mb-1">Combined balance</p><p className="text-xl font-bold font-mono">{money(totalAum, 0)}</p></Card>
          <Card className="p-4"><p className="text-[11px] font-semibold text-[#474556] mb-1">Average return</p><p className={`text-xl font-bold font-mono ${avgRet >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{avgRet >= 0 ? '+' : ''}{avgRet.toFixed(1)}%</p></Card>
        </div>

        <Card className="p-5">
          <CardTitle
            title="Client performance"
            hint="Segment by profitability, risk level and preferred assets"
            icon={<Users className="w-4 h-4 text-[#5338ec]" />}
            right={<span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-emerald-600"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live · {ago}s ago</span>}
          />
          <div className="space-y-3 mb-4">
            <div className="flex flex-wrap items-center gap-2"><span className="text-[11px] font-bold uppercase text-[#94a3b8] w-20">Profit</span>
              {([['all', 'All'], ['profit', 'Profitable'], ['loss', 'Losing']] as const).map(([id, l]) => <button key={id} onClick={() => setProfit(id)} className={chip(profit === id)}>{l}</button>)}
            </div>
            <div className="flex flex-wrap items-center gap-2"><span className="text-[11px] font-bold uppercase text-[#94a3b8] w-20">Risk</span>
              {(['all', 'Low', 'Medium', 'High'] as const).map((id) => <button key={id} onClick={() => setRisk(id)} className={chip(risk === id)}>{id === 'all' ? 'All' : id}</button>)}
            </div>
            <div className="flex flex-wrap items-center gap-2"><span className="text-[11px] font-bold uppercase text-[#94a3b8] w-20">Assets</span>
              {['all', ...assets].map((id) => <button key={id} onClick={() => setAsset(id)} className={chip(asset === id)}>{id === 'all' ? 'All' : id}</button>)}
            </div>
          </div>
          <div className="flex items-center justify-between mb-2 text-xs text-[#474556]">
            <span>Sort by</span>
            <PillTabs options={[{ id: 'returnPct', label: 'Return' }, { id: 'drawdown', label: 'Lowest drawdown' }, { id: 'balance', label: 'Balance' }]} value={sort} onChange={setSort} />
          </div>
          <div className="divide-y divide-[#f1f5f9]">
            {rows.map((c) => (
              <div key={c.id} onClick={() => { setPicked(c); setFeedback(''); }} className="w-full flex items-center gap-3 py-3 text-left hover:bg-[#fafbfe] rounded-lg px-1 transition-colors cursor-pointer">
                <span className="w-9 h-9 rounded-full text-white text-xs font-bold flex items-center justify-center shrink-0" style={{ background: c.color }}>{c.name.split(' ').map((p) => p[0]).join('')}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold text-[#0b1c30] truncate">{c.name}</span>
                  <span className="block text-[11px] text-[#94a3b8]">{c.assets.join(', ')} · active {c.active}</span>
                </span>
                <Sparkline values={seedSeries(c.seed, c.returnPct > 0)} color={c.returnPct > 0 ? '#10b981' : '#f43f5e'} className="w-16 h-6 hidden sm:block" />
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${RISK_STYLE[c.risk]}`}>{c.risk}</span>
                <span className={`text-sm font-bold font-mono w-16 text-right ${c.returnPct >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{c.returnPct >= 0 ? '+' : ''}{c.returnPct}%</span>
              </div>
            ))}
            {rows.length === 0 && <p className="py-10 text-center text-sm text-[#474556]">No clients match this segment.</p>}
          </div>
        </Card>
      </div>

      <aside className="space-y-5">
        <Card className="p-5">
          <CardTitle title="Portfolio templates" hint="Share a strategy your clients can follow" right={<button onClick={() => setTplOpen(true)} className="flex items-center gap-1 text-xs font-bold text-[#5338ec]"><Plus className="w-3.5 h-3.5" /> Publish</button>} />
          <div className="space-y-3">
            {templates.map((t) => (
              <div key={t.id} className="border border-[#f1f5f9] rounded-xl p-3">
                <p className="text-sm font-bold text-[#0b1c30]">{t.title}</p>
                <p className="text-xs text-[#474556] mt-0.5 mb-2">{t.description}</p>
                <div className="flex items-center gap-2 text-[10px] font-bold"><span className="px-2 py-0.5 rounded-md bg-[#EEF0FE] text-[#5338ec]">{t.strategy}</span><span className={`px-2 py-0.5 rounded-md ${RISK_STYLE[t.risk as keyof typeof RISK_STYLE] || 'bg-slate-100 text-slate-500'}`}>{t.risk} risk</span><span className="ml-auto text-[#94a3b8]">{t.adopters} following</span></div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <CardTitle title="Review sessions" hint="Clients submit performance for feedback" right={<button onClick={() => setSesOpen(true)} className="flex items-center gap-1 text-xs font-bold text-[#5338ec]"><CalendarPlus className="w-3.5 h-3.5" /> New</button>} />
          <div className="space-y-2 mb-4">
            {sessions.map((s) => (
              <div key={s.id} className="flex items-center justify-between bg-slate-50 rounded-xl px-3 py-2.5"><span className="text-sm font-semibold">{s.title}</span><span className="text-[11px] text-[#474556]">{s.date} · {s.seats} seats</span></div>
            ))}
          </div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-[#94a3b8] mb-2">Submissions</p>
          <div className="space-y-3">
            {subs.map((u) => (
              <div key={u.id} className="border border-[#f1f5f9] rounded-xl p-3">
                <div className="flex items-center justify-between mb-1"><span className="text-xs font-bold">{u.client}</span>{u.reviewed ? <span className="text-[10px] font-bold text-emerald-600">Reviewed</span> : <span className="text-[10px] font-bold text-amber-600">Waiting</span>}</div>
                <p className="text-xs text-[#474556] leading-relaxed">{u.note}</p>
                {u.feedback && <p className="text-xs text-[#5338ec] bg-[#F8F7FF] rounded-lg px-2.5 py-1.5 mt-2">{u.feedback}</p>}
                {!u.reviewed && (
                  <button onClick={() => { setSubs((p) => p.map((x) => (x.id === u.id ? { ...x, reviewed: true, feedback: 'Thanks for sharing. I left notes on your sizing and exits.' } : x))); toast(`Feedback sent to ${u.client}`); }} className="mt-2 text-[11px] font-bold text-[#5338ec] hover:underline">Send quick feedback</button>
                )}
              </div>
            ))}
          </div>
        </Card>
      </aside>

      {picked && (
        <Modal title={picked.name} onClose={() => setPicked(null)}>
          <div className="grid grid-cols-3 gap-3 mb-4 text-center">
            <div className="bg-slate-50 rounded-xl p-3"><p className="text-[11px] text-[#474556]">Return</p><p className={`font-bold font-mono ${picked.returnPct >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{picked.returnPct >= 0 ? '+' : ''}{picked.returnPct}%</p></div>
            <div className="bg-slate-50 rounded-xl p-3"><p className="text-[11px] text-[#474556]">Win rate</p><p className="font-bold font-mono">{picked.winRate}%</p></div>
            <div className="bg-slate-50 rounded-xl p-3"><p className="text-[11px] text-[#474556]">Max drawdown</p><p className="font-bold font-mono">{picked.drawdown}%</p></div>
          </div>
          <Sparkline values={seedSeries(picked.seed, picked.returnPct > 0)} color={picked.returnPct > 0 ? '#10b981' : '#f43f5e'} className="w-full h-20 mb-4" />
          <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} rows={3} placeholder="Write feedback for this client..." className={`${input} resize-none mb-3`} />
          <button disabled={!feedback.trim()} onClick={() => { toast(`Feedback sent to ${picked.name}`); setPicked(null); }} className="w-full flex items-center justify-center gap-1.5 bg-[#5338ec] hover:bg-[#4326d8] disabled:opacity-40 text-white text-sm font-semibold py-2.5 rounded-xl"><Send className="w-4 h-4" /> Send feedback</button>
        </Modal>
      )}
      {tplOpen && (
        <Modal title="Publish a portfolio template" onClose={() => setTplOpen(false)}>
          <div className="space-y-3">
            <input value={tpl.title} onChange={(e) => setTpl({ ...tpl, title: e.target.value })} placeholder="Template name" className={input} />
            <div className="grid grid-cols-2 gap-3">
              <select value={tpl.strategy} onChange={(e) => setTpl({ ...tpl, strategy: e.target.value })} className={input}>{['Swing', 'Breakout', 'Scalping', 'Day Trade', 'Position'].map((s) => <option key={s}>{s}</option>)}</select>
              <select value={tpl.risk} onChange={(e) => setTpl({ ...tpl, risk: e.target.value })} className={input}>{['Low', 'Medium', 'High'].map((s) => <option key={s}>{s}</option>)}</select>
            </div>
            <textarea value={tpl.description} onChange={(e) => setTpl({ ...tpl, description: e.target.value })} rows={3} placeholder="Rules and risk limits clients should follow" className={`${input} resize-none`} />
            <button disabled={!tpl.title.trim()} onClick={() => { setTemplates((p) => [{ id: `t${Date.now()}`, ...tpl, adopters: 0 }, ...p]); setTpl({ title: '', strategy: 'Swing', risk: 'Low', description: '' }); setTplOpen(false); toast('Template published'); }} className="w-full bg-[#5338ec] hover:bg-[#4326d8] disabled:opacity-40 text-white text-sm font-semibold py-2.5 rounded-xl">Publish</button>
          </div>
        </Modal>
      )}
      {sesOpen && (
        <Modal title="Create a review session" onClose={() => setSesOpen(false)}>
          <div className="space-y-3">
            <input value={ses.title} onChange={(e) => setSes({ ...ses, title: e.target.value })} placeholder="Session title" className={input} />
            <div className="grid grid-cols-2 gap-3">
              <input type="date" value={ses.date} onChange={(e) => setSes({ ...ses, date: e.target.value })} className={input} />
              <input type="number" min={1} value={ses.seats} onChange={(e) => setSes({ ...ses, seats: Number(e.target.value) })} className={input} />
            </div>
            <button disabled={!ses.title.trim()} onClick={() => { setSessions((p) => [...p, { id: `s${Date.now()}`, ...ses }]); setSes({ title: '', date: '2026-10-16', seats: 10 }); setSesOpen(false); toast('Review session created'); }} className="w-full bg-[#5338ec] hover:bg-[#4326d8] disabled:opacity-40 text-white text-sm font-semibold py-2.5 rounded-xl">Create session</button>
          </div>
        </Modal>
      )}
    </div>
  );
};

/* ═════════════════════════ BROKER ═════════════════════════ */

interface Guide { id: string; title: string; file: string }
interface Challenge { id: string; name: string; metric: string; prize: string; days: number; joined: number }

export const BrokerPanel: React.FC<{ toast: (m: string) => void }> = ({ toast }) => {
  const maxVol = Math.max(...WEEKLY_VOLUME);
  const maxLots = TOP_INSTRUMENTS[0].lots;
  const [guides, setGuides] = useState<Guide[]>([{ id: 'g1', title: 'Managing risk on 1:500 accounts', file: 'risk-on-high-leverage.pdf' }]);
  const [challenges, setChallenges] = useState<Challenge[]>([{ id: 'c1', name: 'October growth sprint', metric: 'Highest % return', prize: '$500 cashback pool', days: 21, joined: 186 }]);
  const [gTitle, setGTitle] = useState('');
  const [gFile, setGFile] = useState('');
  const [ch, setCh] = useState({ name: '', metric: 'Highest % return', prize: '', days: 14 });
  const input2 = input;

  const kpis = [
    { label: 'Active traders (30d)', value: '1,946', delta: '+8.2%', icon: Users },
    { label: 'Volume (30d)', value: '4,975 lots', delta: '+3.1%', icon: BarChart3 },
    { label: 'Avg trades / trader / week', value: '6.4', delta: '+0.3', icon: Activity },
    { label: '30-day retention', value: '78%', delta: '+2 pts', icon: Repeat },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <Card key={k.label} className="p-4">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold text-[#474556] mb-1.5"><k.icon className="w-3.5 h-3.5 text-[#5338ec]" /> {k.label}</p>
            <p className="text-xl font-bold font-mono">{k.value}</p>
            <p className="text-[11px] font-bold text-emerald-600 mt-1">{k.delta} vs previous 30 days</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] gap-5">
        <Card className="p-5">
          <CardTitle title="Weekly trading volume" hint="Lots traded by connected users, last 12 weeks" />
          <div className="flex items-end gap-2 h-44">
            {WEEKLY_VOLUME.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center justify-end h-full gap-1" title={`${v.toLocaleString()} lots`}>
                <div className={`w-full rounded-t-md ${i === WEEKLY_VOLUME.length - 1 ? 'bg-[#5338ec]' : 'bg-[#C9C2FA]'}`} style={{ height: `${(v / maxVol) * 100}%` }} />
                <span className="text-[10px] text-[#94a3b8]">W{i + 1}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <CardTitle title="Most traded instruments" />
          <div className="space-y-3">
            {TOP_INSTRUMENTS.map((t) => (
              <div key={t.name}>
                <div className="flex justify-between text-xs mb-1"><span className="font-semibold">{t.name}</span><span className="font-mono text-[#474556]">{t.lots.toLocaleString()} lots</span></div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-[#5338ec] rounded-full" style={{ width: `${(t.lots / maxLots) * 100}%` }} /></div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <CardTitle title="How your users perform over time" hint="Median return of traders with an account on your platform, 12 weeks" />
        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_240px] gap-6 items-center">
          <div>
            <Sparkline values={USER_PERFORMANCE.medianReturn} color="#10b981" className="w-full h-28" />
            <div className="flex justify-between text-[10px] text-[#94a3b8] mt-1"><span>Week 1</span><span>Week 12</span></div>
          </div>
          <div className="space-y-3">
            <div className="bg-emerald-50 rounded-xl p-3"><p className="text-[11px] text-emerald-700 font-semibold">Median return</p><p className="text-lg font-bold font-mono text-emerald-600">+{USER_PERFORMANCE.medianReturn[USER_PERFORMANCE.medianReturn.length - 1]}%</p></div>
            <div className="bg-slate-50 rounded-xl p-3"><p className="text-[11px] text-[#474556] font-semibold">Profitable users</p><p className="text-lg font-bold font-mono">{USER_PERFORMANCE.profitableShare}%</p></div>
            <div className="bg-slate-50 rounded-xl p-3"><p className="text-[11px] text-[#474556] font-semibold">Average max drawdown</p><p className="text-lg font-bold font-mono">{USER_PERFORMANCE.avgDrawdown}%</p></div>
          </div>
        </div>
      </Card>

      <Card className="p-5 overflow-x-auto">
        <CardTitle title="Retention by signup cohort" hint="Share of traders still active each week after signing up" />
        <table className="w-full text-xs min-w-[480px]">
          <thead><tr className="text-[#94a3b8] uppercase tracking-wide"><th className="text-left pb-2 font-bold">Cohort</th><th className="pb-2 font-bold text-right">Traders</th>{[0, 1, 2, 3, 4, 5].map((w) => <th key={w} className="pb-2 font-bold text-center">W{w}</th>)}</tr></thead>
          <tbody>
            {COHORTS.map((c) => (
              <tr key={c.label} className="border-t border-[#f1f5f9]">
                <td className="py-2 font-semibold">{c.label}</td>
                <td className="py-2 text-right font-mono">{c.size}</td>
                {[0, 1, 2, 3, 4, 5].map((w) => (
                  <td key={w} className="py-1.5 px-1 text-center">
                    {c.retention[w] !== undefined ? <span className="block rounded-md py-1 font-mono font-bold" style={{ background: `rgba(83,56,236,${0.08 + (c.retention[w] / 100) * 0.55})`, color: c.retention[w] > 70 ? '#fff' : '#0b1c30' }}>{c.retention[w]}%</span> : <span className="text-slate-300">—</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card className="p-5">
          <CardTitle title="Educational integration" hint="Upload strategy guides for your traders" icon={<Upload className="w-4 h-4 text-[#5338ec]" />} />
          <div className="space-y-2 mb-4">
            {guides.map((g) => <div key={g.id} className="flex items-center justify-between bg-slate-50 rounded-xl px-3 py-2.5"><span className="text-sm font-semibold">{g.title}</span><span className="text-[11px] text-[#94a3b8] truncate max-w-[130px]">{g.file}</span></div>)}
          </div>
          <input value={gTitle} onChange={(e) => setGTitle(e.target.value)} placeholder="Guide title" className={`${input2} mb-2`} />
          <label className="flex items-center justify-center gap-1.5 border-2 border-dashed border-slate-200 hover:border-[#5338ec] rounded-xl py-3 text-xs font-semibold text-[#474556] cursor-pointer mb-3 transition-colors">
            <Upload className="w-4 h-4" /> {gFile || 'Choose a PDF'}
            <input type="file" accept=".pdf,application/pdf" className="hidden" onChange={(e) => setGFile(e.target.files?.[0]?.name || '')} />
          </label>
          <button disabled={!gTitle.trim() || !gFile} onClick={() => { setGuides((p) => [...p, { id: `g${Date.now()}`, title: gTitle, file: gFile }]); setGTitle(''); setGFile(''); toast('Guide uploaded'); }} className="w-full bg-[#5338ec] hover:bg-[#4326d8] disabled:opacity-40 text-white text-sm font-semibold py-2.5 rounded-xl">Upload guide</button>
        </Card>

        <Card className="p-5">
          <CardTitle title="Portfolio growth challenges" hint="Run a challenge with prizes or perks" icon={<Trophy className="w-4 h-4 text-[#5338ec]" />} />
          <div className="space-y-2 mb-4">
            {challenges.map((c) => <div key={c.id} className="bg-slate-50 rounded-xl px-3 py-2.5"><div className="flex justify-between"><span className="text-sm font-semibold">{c.name}</span><span className="text-[11px] font-bold text-emerald-600">{c.joined} joined</span></div><p className="text-[11px] text-[#474556]">{c.metric} · {c.days} days · {c.prize}</p></div>)}
          </div>
          <div className="space-y-2">
            <input value={ch.name} onChange={(e) => setCh({ ...ch, name: e.target.value })} placeholder="Challenge name" className={input2} />
            <div className="grid grid-cols-2 gap-2">
              <select value={ch.metric} onChange={(e) => setCh({ ...ch, metric: e.target.value })} className={input2}>{['Highest % return', 'Best risk/reward', 'Most consistent'].map((m) => <option key={m}>{m}</option>)}</select>
              <input type="number" min={1} value={ch.days} onChange={(e) => setCh({ ...ch, days: Number(e.target.value) })} className={input2} />
            </div>
            <input value={ch.prize} onChange={(e) => setCh({ ...ch, prize: e.target.value })} placeholder="Prize or perk" className={input2} />
            <button disabled={!ch.name.trim() || !ch.prize.trim()} onClick={() => { setChallenges((p) => [...p, { id: `c${Date.now()}`, ...ch, joined: 0 }]); setCh({ name: '', metric: 'Highest % return', prize: '', days: 14 }); toast('Challenge launched'); }} className="w-full bg-[#5338ec] hover:bg-[#4326d8] disabled:opacity-40 text-white text-sm font-semibold py-2.5 rounded-xl">Launch challenge</button>
          </div>
        </Card>
      </div>
    </div>
  );
};


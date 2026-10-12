import React, { useMemo, useState } from 'react';
import { Search, Lock, Star, X, BadgeCheck, Upload, Check, Trash2, AlertTriangle } from 'lucide-react';
import { EXPERT_ADVISORS, ExpertAdvisor, EaReview, eaSeries } from '../../data/expertAdvisorData';
import { PLAN_RANK, planFromTier, PillTabs } from '../portfolio/portfolioUi';
import { EquityChart, Sparkline } from '../portfolio/PortfolioCharts';
import { downloadBlob } from '../portfolio/portfolioExport';

type Tab = 'library' | 'downloads' | 'contribute';
type Sort = 'return' | 'drawdown' | 'rating' | 'downloads';

interface ExpertAdvisorsPageProps {
  userTierLevel: number;
  isLoggedIn: boolean;
  onUpgradePrompt: () => void;
  onShowToast: (msg: string) => void;
}

interface DownloadRec { eaId: string; version: string; date: string }
interface Submission { id: string; name: string; platform: string; as: string; stage: number }

const RISK_STYLE = { Low: 'bg-emerald-50 text-emerald-700', Medium: 'bg-amber-50 text-amber-700', High: 'bg-rose-50 text-rose-600' } as const;
const STAGES = ['Submitted', 'Code review', '30-day forward test', 'Published'];
const avg = (ea: ExpertAdvisor) => (ea.reviews.length ? ea.reviews.reduce((a, r) => a + r.rating, 0) / ea.reviews.length : 0);

const Stars: React.FC<{ value: number; size?: string }> = ({ value, size = 'w-3.5 h-3.5' }) => (
  <span className="inline-flex">
    {[1, 2, 3, 4, 5].map((n) => (
      <Star key={n} className={`${size} ${n <= Math.round(value) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
    ))}
  </span>
);

export const ExpertAdvisorsPage: React.FC<ExpertAdvisorsPageProps> = ({ userTierLevel, isLoggedIn, onUpgradePrompt, onShowToast }) => {
  const rank = PLAN_RANK[planFromTier(userTierLevel, isLoggedIn)];
  const [tab, setTab] = useState<Tab>('library');
  const [search, setSearch] = useState('');
  const [platform, setPlatform] = useState('All');
  const [risk, setRisk] = useState('All');
  const [author, setAuthor] = useState('All');
  const [sort, setSort] = useState<Sort>('return');
  const [eas, setEas] = useState<ExpertAdvisor[]>(EXPERT_ADVISORS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [downloads, setDownloads] = useState<DownloadRec[]>([]);
  const [rvRating, setRvRating] = useState(5);
  const [rvText, setRvText] = useState('');
  const [subs, setSubs] = useState<Submission[]>([{ id: 's0', name: 'Asia Session Scalper', platform: 'MT5', as: 'Advisor', stage: 2 }]);
  const [form, setForm] = useState({ name: '', platform: 'MT5', as: 'Advisor', strategy: '', description: '' });
  const [file, setFile] = useState('');

  const selected = eas.find((e) => e.id === selectedId) || null;
  const list = useMemo(
    () =>
      eas
        .filter((e) => (platform === 'All' || e.platform === platform) && (risk === 'All' || e.risk === risk) && (author === 'All' || e.authorType === author) && (!search.trim() || (e.name + e.author + e.strategy).toLowerCase().includes(search.toLowerCase())))
        .sort((a, b) => (sort === 'return' ? b.stats.monthly - a.stats.monthly : sort === 'drawdown' ? a.stats.maxDD - b.stats.maxDD : sort === 'rating' ? avg(b) - avg(a) : b.downloads - a.downloads)),
    [eas, platform, risk, author, search, sort]
  );

  const doDownload = (ea: ExpertAdvisor, version: string) => {
    if (ea.minPlan > rank) return onUpgradePrompt();
    const sheet = `${ea.name} v${version}\nAuthor: ${ea.author}\nPlatform: ${ea.platform}\nPairs: ${ea.pairs.join(', ')}\n\nRecommended settings\n${ea.settings.map((s) => `- ${s}`).join('\n')}\n\nBefore you run it\n- Test on a demo account first.\n- Past performance does not guarantee future results.\n- Trading leveraged products carries a high risk of loss.\n`;
    try {
      downloadBlob(sheet, `${ea.name.replace(/\s+/g, '-')}_v${version}_settings.txt`, 'text/plain');
    } catch {
      /* downloads can be blocked in a sandbox; the record below still counts */
    }
    setDownloads((d) => [{ eaId: ea.id, version, date: '2026-10-05' }, ...d.filter((x) => !(x.eaId === ea.id && x.version === version))]);
    setEas((p) => p.map((x) => (x.id === ea.id ? { ...x, downloads: x.downloads + 1 } : x)));
    onShowToast(`${ea.name} v${version} added to My downloads`);
  };

  const addReview = (ea: ExpertAdvisor) => {
    if (!rvText.trim()) return;
    const r: EaReview = { id: `r${Date.now()}`, who: 'You', rating: rvRating, text: rvText.trim(), date: '2026-10-05' };
    setEas((p) => p.map((x) => (x.id === ea.id ? { ...x, reviews: [r, ...x.reviews] } : x)));
    setRvText('');
    onShowToast('Review posted');
  };

  const sel = 'text-xs font-semibold border border-slate-200 rounded-full px-3.5 py-2 bg-white';

  return (
    <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-8 md:px-14 py-8 sm:py-10 pb-24">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-[#0b1c30]">Expert Advisors</h1>
          <p className="text-sm text-[#474556] mt-1 max-w-xl">A vetted library of automated strategies. Every listing is versioned, tiered and tracked, with the drawdown shown next to the return. Figures here are sample data for preview.</p>
        </div>
        <PillTabs<Tab> options={[{ id: 'library', label: 'Library' }, { id: 'downloads', label: `My downloads${downloads.length ? ` (${downloads.length})` : ''}` }, { id: 'contribute', label: 'Contribute' }]} value={tab} onChange={setTab} />
      </div>

      {tab === 'library' && (
        <>
          <div className="flex flex-wrap items-center gap-2 mb-5">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, author or strategy" className="w-full border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5338ec]/30" />
            </div>
            <select value={platform} onChange={(e) => setPlatform(e.target.value)} className={sel}>{['All', 'MT4', 'MT5', 'cTrader'].map((x) => <option key={x} value={x}>{x === 'All' ? 'Any platform' : x}</option>)}</select>
            <select value={risk} onChange={(e) => setRisk(e.target.value)} className={sel}>{['All', 'Low', 'Medium', 'High'].map((x) => <option key={x} value={x}>{x === 'All' ? 'Any risk' : `${x} risk`}</option>)}</select>
            <select value={author} onChange={(e) => setAuthor(e.target.value)} className={sel}>{['All', 'Advisor', 'Broker', 'MarketSyde'].map((x) => <option key={x} value={x}>{x === 'All' ? 'Any author' : `By ${x}`}</option>)}</select>
            <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className={`${sel} ml-auto`}>
              <option value="return">Highest monthly return</option><option value="drawdown">Lowest drawdown</option><option value="rating">Best rated</option><option value="downloads">Most downloaded</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {list.map((ea) => {
              const locked = ea.minPlan > rank;
              const spark = eaSeries(ea, 60).map((p) => p.value);
              return (
                <div key={ea.id} onClick={() => setSelectedId(ea.id)} className="bg-white border border-[#e2e8f0] hover:border-[#5338ec] rounded-2xl p-5 cursor-pointer transition-colors">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0">
                      <p className="text-base font-bold text-[#0b1c30] truncate">{ea.name}</p>
                      <p className="flex items-center gap-1 text-xs text-[#474556]">{ea.author}<BadgeCheck className="w-3.5 h-3.5 text-sky-500 shrink-0" /><span className="text-[#94a3b8]">· {ea.authorType}</span></p>
                    </div>
                    {locked ? <span className="flex items-center gap-1 text-[10px] font-bold text-[#5338ec] bg-[#EEF0FE] px-2 py-1 rounded-md shrink-0"><Lock className="w-3 h-3" />{ea.minPlan === 2 ? 'Premium' : 'Intermediate'}</span> : <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md shrink-0">Vetted</span>}
                  </div>
                  <Sparkline values={spark} color={ea.risk === 'High' ? '#f59e0b' : '#10b981'} className="w-full h-12 mb-3" />
                  <div className="grid grid-cols-3 gap-2 text-center mb-3">
                    <div className="bg-slate-50 rounded-xl py-2"><p className="text-[10px] text-[#474556]">Monthly</p><p className="text-sm font-bold font-mono text-emerald-600">+{ea.stats.monthly}%</p></div>
                    <div className="bg-slate-50 rounded-xl py-2"><p className="text-[10px] text-[#474556]">Max drawdown</p><p className="text-sm font-bold font-mono">{ea.stats.maxDD}%</p></div>
                    <div className="bg-slate-50 rounded-xl py-2"><p className="text-[10px] text-[#474556]">Win rate</p><p className="text-sm font-bold font-mono">{ea.stats.winRate}%</p></div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#EEF0FE] text-[#5338ec]">{ea.platform}</span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600">{ea.strategy}</span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${RISK_STYLE[ea.risk]}`}>{ea.risk} risk</span>
                    <span className="ml-auto flex items-center gap-1 text-[11px] text-[#474556]"><Stars value={avg(ea)} />{ea.reviews.length ? `(${ea.reviews.length})` : ''}</span>
                  </div>
                </div>
              );
            })}
          </div>
          {list.length === 0 && <p className="text-center py-16 text-sm text-[#474556]">No advisors match these filters.</p>}
        </>
      )}

      {tab === 'downloads' && (
        <div className="bg-white border border-[#e2e8f0] rounded-2xl overflow-hidden">
          {downloads.length === 0 ? (
            <p className="text-center py-16 text-sm text-[#474556]">Nothing downloaded yet. Open an advisor from the Library to get a version.</p>
          ) : (
            downloads.map((d) => {
              const ea = eas.find((e) => e.id === d.eaId)!;
              const latest = ea.versions[0].v;
              return (
                <div key={`${d.eaId}-${d.version}`} className="flex flex-wrap items-center gap-4 px-5 py-4 border-b border-[#f1f5f9] last:border-0">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-[#0b1c30]">{ea.name} <span className="font-mono text-[#474556] font-semibold">v{d.version}</span></p>
                    <p className="text-[11px] text-[#94a3b8]">{ea.platform} · downloaded {d.date}</p>
                  </div>
                  {latest !== d.version && <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded-md">Update available: v{latest}</span>}
                  {latest !== d.version && <button onClick={() => doDownload(ea, latest)} className="text-xs font-bold text-white bg-[#5338ec] hover:bg-[#4326d8] px-3.5 py-2 rounded-xl">Get v{latest}</button>}
                  <button onClick={() => { setDownloads((p) => p.filter((x) => x !== d)); onShowToast('Removed from My downloads'); }} aria-label="Remove" className="text-slate-300 hover:text-rose-500"><Trash2 className="w-4 h-4" /></button>
                </div>
              );
            })
          )}
        </div>
      )}

      {tab === 'contribute' && (
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-6 items-start">
          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 space-y-4">
            <div>
              <h3 className="text-base font-bold text-[#0b1c30]">Submit an Expert Advisor</h3>
              <p className="text-xs text-[#474556] mt-1">Advisors and brokers can list EAs. Every submission is code-reviewed and forward-tested for 30 days before it is published.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="EA name" className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5338ec]/30" />
              <input value={form.strategy} onChange={(e) => setForm({ ...form, strategy: e.target.value })} placeholder="Strategy (e.g. Breakout)" className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5338ec]/30" />
              <select value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })} className="border border-slate-200 rounded-xl px-3 py-2 text-sm">{['MT4', 'MT5', 'cTrader'].map((x) => <option key={x}>{x}</option>)}</select>
              <select value={form.as} onChange={(e) => setForm({ ...form, as: e.target.value })} className="border border-slate-200 rounded-xl px-3 py-2 text-sm">{['Advisor', 'Broker'].map((x) => <option key={x}>Submitting as {x}</option>)}</select>
            </div>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="What it trades, the risk rules, and when it should be switched off" className="w-full resize-none border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#5338ec]/30" />
            <label className="flex items-center justify-center gap-2 border-2 border-dashed border-slate-200 hover:border-[#5338ec] rounded-xl py-4 text-xs font-semibold text-[#474556] cursor-pointer transition-colors">
              <Upload className="w-4 h-4" /> {file || 'Attach .ex4, .ex5 or .zip'}
              <input type="file" accept=".ex4,.ex5,.zip,.mq4,.mq5" className="hidden" onChange={(e) => setFile(e.target.files?.[0]?.name || '')} />
            </label>
            <button
              disabled={!form.name.trim() || !form.strategy.trim() || !file}
              onClick={() => { setSubs((p) => [{ id: `s${Date.now()}`, name: form.name.trim(), platform: form.platform, as: form.as.replace('Submitting as ', ''), stage: 0 }, ...p]); setForm({ name: '', platform: 'MT5', as: 'Advisor', strategy: '', description: '' }); setFile(''); onShowToast('Submitted for review'); }}
              className="bg-[#5338ec] hover:bg-[#4326d8] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
            >
              Submit for review
            </button>
          </div>
          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5">
            <h3 className="text-sm font-bold text-[#0b1c30] mb-4">Your submissions</h3>
            <div className="space-y-4">
              {subs.map((s) => (
                <div key={s.id}>
                  <p className="text-sm font-bold text-[#0b1c30]">{s.name} <span className="text-[11px] text-[#94a3b8] font-medium">{s.platform} · {s.as}</span></p>
                  <div className="flex items-center gap-1 mt-2">
                    {STAGES.map((st, i) => (
                      <div key={st} className="flex-1">
                        <div className={`h-1.5 rounded-full ${i <= s.stage ? 'bg-[#5338ec]' : 'bg-slate-100'}`} />
                        <p className={`text-[9px] mt-1 font-semibold ${i === s.stage ? 'text-[#5338ec]' : 'text-[#94a3b8]'}`}>{st}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/30 backdrop-blur-xs" onClick={() => setSelectedId(null)}>
          <div className="w-full max-w-xl bg-white h-full shadow-2xl overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-display font-bold text-[#0b1c30]">{selected.name}</h3>
                <p className="text-xs text-[#474556]">{selected.author} · {selected.platform} · {selected.strategy}</p>
              </div>
              <button onClick={() => setSelectedId(null)} className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100" aria-label="Close"><X className="w-4 h-4" /></button>
            </div>

            <EquityChart data={eaSeries(selected)} height={210} theme="light" />
            <p className="text-[11px] text-[#94a3b8] mb-4">Sample equity curve on a $10,000 start, last 180 days.</p>

            <div className="grid grid-cols-3 gap-2.5 mb-5">
              {[['Return / month', `+${selected.stats.monthly}%`], ['Max drawdown', `${selected.stats.maxDD}%`], ['Win rate', `${selected.stats.winRate}%`], ['Profit factor', selected.stats.profitFactor.toFixed(2)], ['Trades', String(selected.stats.trades)], ['Live days', String(selected.stats.liveDays)]].map(([k, v]) => (
                <div key={k} className="bg-slate-50 rounded-xl p-3"><p className="text-[10px] text-[#474556]">{k}</p><p className="text-sm font-bold font-mono">{v}</p></div>
              ))}
            </div>

            <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-3.5 py-3 mb-5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-900 leading-relaxed">Past results do not predict future ones. Run it on a demo account first, and size it so a {selected.stats.maxDD}% drawdown would not hurt.</p>
            </div>

            <p className="text-sm text-[#0b1c30] leading-relaxed mb-4">{selected.description}</p>
            <p className="text-xs font-bold uppercase tracking-wide text-[#474556] mb-2">Pairs</p>
            <div className="flex flex-wrap gap-1.5 mb-4">{selected.pairs.map((p) => <span key={p} className="px-2.5 py-1 rounded-full bg-[#EEF0FE] text-[#5338ec] text-xs font-semibold">{p}</span>)}</div>
            <p className="text-xs font-bold uppercase tracking-wide text-[#474556] mb-2">Recommended settings</p>
            <ul className="space-y-1 mb-5">{selected.settings.map((s) => <li key={s} className="flex items-center gap-2 text-xs text-[#0b1c30]"><Check className="w-3.5 h-3.5 text-emerald-500" />{s}</li>)}</ul>

            <p className="text-xs font-bold uppercase tracking-wide text-[#474556] mb-2">Versions</p>
            <div className="border border-[#e2e8f0] rounded-xl divide-y divide-[#f1f5f9] mb-6">
              {selected.versions.map((v, i) => {
                const have = downloads.some((d) => d.eaId === selected.id && d.version === v.v);
                const locked = selected.minPlan > rank;
                return (
                  <div key={v.v} className="flex items-center gap-3 px-4 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold font-mono text-[#0b1c30]">v{v.v} {i === 0 && <span className="ml-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">Latest</span>}</p>
                      <p className="text-[11px] text-[#474556]">{v.date} · {v.notes}</p>
                    </div>
                    <button onClick={() => doDownload(selected, v.v)} className={`flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl transition-colors ${locked ? 'border border-[#5338ec]/30 text-[#5338ec]' : have ? 'bg-emerald-50 text-emerald-700' : 'bg-[#5338ec] hover:bg-[#4326d8] text-white'}`}>
                      {locked ? <><Lock className="w-3.5 h-3.5" />{selected.minPlan === 2 ? 'Premium' : 'Intermediate'}</> : have ? 'Downloaded' : 'Download'}
                    </button>
                  </div>
                );
              })}
            </div>

            <p className="text-xs font-bold uppercase tracking-wide text-[#474556] mb-3">Community feedback</p>
            <div className="space-y-3 mb-4">
              {selected.reviews.map((r) => (
                <div key={r.id} className="bg-slate-50 rounded-xl p-3.5">
                  <div className="flex items-center justify-between mb-1"><span className="text-xs font-bold text-[#0b1c30]">{r.who}</span><Stars value={r.rating} /></div>
                  <p className="text-xs text-[#474556] leading-relaxed">{r.text}</p>
                </div>
              ))}
              {selected.reviews.length === 0 && <p className="text-xs text-[#474556]">No reviews yet. Be the first.</p>}
            </div>
            <div className="border border-[#e2e8f0] rounded-xl p-3.5">
              <div className="flex items-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} onClick={() => setRvRating(n)} aria-label={`${n} stars`}><Star className={`w-5 h-5 ${n <= rvRating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} /></button>
                ))}
              </div>
              <textarea value={rvText} onChange={(e) => setRvText(e.target.value)} rows={2} placeholder="How did it behave on your account?" className="w-full resize-none border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#5338ec]/30 mb-2" />
              <button disabled={!rvText.trim()} onClick={() => addReview(selected)} className="text-xs font-bold text-white bg-[#5338ec] disabled:opacity-40 px-4 py-2 rounded-lg">Post review</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

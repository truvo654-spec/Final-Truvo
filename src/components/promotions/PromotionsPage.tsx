import React, { useMemo, useState } from 'react';
import { Search, Lock, Check, X, Clock, Bookmark, BookmarkCheck, ShieldCheck } from 'lucide-react';
import { Broker } from '../../types';
import { PROMOTIONS, Promotion, PromoAsset, PromoType, PROMO_TYPES } from '../../data/promotionsData';
import { PLAN_RANK, planFromTier, PLAN_LABEL, PillTabs } from '../portfolio/portfolioUi';

type Tab = 'all' | 'drops' | 'mine';
type Sort = 'ending' | 'newest' | 'broker';

interface PromotionsPageProps {
  userTierLevel: number;
  isLoggedIn: boolean;
  brokers: Broker[];
  onOpenConnectModal: (broker?: Broker) => void;
  onNavigateToTab: (tab: string) => void;
  onUpgradePrompt: () => void;
  onShowToast: (msg: string) => void;
}

const ASSETS: PromoAsset[] = ['Forex', 'Crypto', 'Stocks', 'Commodity', 'Indices'];
const KIND_STYLE: Record<string, string> = {
  'Deposit bonus': 'bg-[#EEF0FE] text-[#5338ec]',
  'Cashback boost': 'bg-[#F0FCB1] text-[#323B01]',
  'Spread discount': 'bg-sky-50 text-sky-700',
  'Fee waiver': 'bg-amber-50 text-amber-700',
  Competition: 'bg-pink-50 text-pink-700',
  'Premium drop': 'bg-[#0b1c30] text-white',
};

const brokerColor = (name: string) => {
  const palette = ['#5338ec', '#0b1c30', '#FD02B0', '#0d9488', '#334155', '#8d6a1f', '#3410D5', '#be185d'];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return palette[h % palette.length];
};

export const PromotionsPage: React.FC<PromotionsPageProps> = ({
  userTierLevel,
  isLoggedIn,
  brokers,
  onOpenConnectModal,
  onNavigateToTab,
  onUpgradePrompt,
  onShowToast,
}) => {
  const plan = planFromTier(userTierLevel, isLoggedIn);
  const rank = PLAN_RANK[plan];
  const [tab, setTab] = useState<Tab>('all');
  const [search, setSearch] = useState('');
  const [assets, setAssets] = useState<PromoAsset[]>([]);
  const [types, setTypes] = useState<PromoType[]>([]);
  const [eligibleOnly, setEligibleOnly] = useState(false);
  const [sort, setSort] = useState<Sort>('ending');
  const [claimed, setClaimed] = useState<string[]>([]);
  const [saved, setSaved] = useState<string[]>([]);
  const [open, setOpen] = useState<Promotion | null>(null);
  const [agree, setAgree] = useState(false);

  const connected = (p: Promotion) => !!brokers.find((b) => b.id === p.brokerId)?.connected;

  /** Why the member can or cannot take this offer right now. */
  const status = (p: Promotion): { ok: boolean; reason?: string; action?: 'upgrade' | 'connect' } => {
    if (p.minPlan > rank) return { ok: false, reason: `Needs ${p.minPlan === 2 ? 'Premium' : 'Intermediate'}`, action: 'upgrade' };
    if (p.requiresConnected && !connected(p)) return { ok: false, reason: `Connect ${p.brokerName} first`, action: 'connect' };
    return { ok: true };
  };

  /** One predicate for every filter, so the type counts always match what you would get. */
  const passes = (p: Promotion, skipType: boolean) => {
    const q = search.trim().toLowerCase();
    if (tab === 'drops' && !p.premiumDrop) return false;
    if (tab === 'mine' && !claimed.includes(p.id) && !saved.includes(p.id)) return false;
    if (!skipType && types.length && !types.includes(p.type)) return false;
    if (assets.length && !p.assets.some((a) => assets.includes(a))) return false;
    if (eligibleOnly && !status(p).ok) return false;
    if (q && !(p.title.toLowerCase().includes(q) || p.brokerName.toLowerCase().includes(q) || p.kind.toLowerCase().includes(q))) return false;
    return true;
  };

  const list = useMemo(() => {
    return PROMOTIONS.filter((p) => passes(p, false)).sort((a, b) => (sort === 'ending' ? a.endsInDays - b.endsInDays : sort === 'newest' ? a.addedDaysAgo - b.addedDaysAgo : a.brokerName.localeCompare(b.brokerName)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, search, assets, types, eligibleOnly, sort, claimed, saved, rank, brokers]);

  const typeCounts = useMemo(() => {
    const out = {} as Record<PromoType, number>;
    PROMO_TYPES.forEach((t) => (out[t.id] = PROMOTIONS.filter((p) => p.type === t.id && passes(p, true)).length));
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, search, assets, eligibleOnly, claimed, saved, rank, brokers]);

  const activeFilters = types.length + assets.length + (eligibleOnly ? 1 : 0) + (search.trim() ? 1 : 0);
  const clearFilters = () => {
    setTypes([]);
    setAssets([]);
    setEligibleOnly(false);
    setSearch('');
  };

  const eligibleCount = PROMOTIONS.filter((p) => status(p).ok).length;
  const toggle = <T,>(arr: T[], v: T, set: (a: T[]) => void) => set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const act = (p: Promotion) => {
    const st = status(p);
    if (claimed.includes(p.id)) return;
    if (st.action === 'upgrade') return onUpgradePrompt();
    if (st.action === 'connect') return onOpenConnectModal(brokers.find((b) => b.id === p.brokerId));
    setAgree(false);
    setOpen(p);
  };

  const confirm = () => {
    if (!open || !agree) return;
    setClaimed((c) => [...c, open.id]);
    onShowToast(`${open.title} saved to My offers`);
    setOpen(null);
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: 'all', label: 'All offers' },
    { id: 'drops', label: 'Premium drops' },
    { id: 'mine', label: `My offers${claimed.length + saved.length ? ` (${claimed.length + saved.length})` : ''}` },
  ];

  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-8 md:px-14 py-8 sm:py-10 pb-24">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-[#0b1c30]">Promotions &amp; Bonuses</h1>
          <p className="text-sm text-[#474556] mt-1 max-w-xl">
            Broker offers sorted by what you can actually take. You are eligible for{' '}
            <span className="font-bold text-[#0b1c30]">{eligibleCount} of {PROMOTIONS.length}</span> right now on the {PLAN_LABEL[plan]} plan.
          </p>
        </div>
        <PillTabs options={tabs} value={tab} onChange={setTab} />
      </div>

      <div className="space-y-3 mb-5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search broker or offer" className="w-full border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5338ec]/30" />
          </div>
          <label className="flex items-center gap-2 text-xs font-semibold text-[#474556] cursor-pointer">
            <input type="checkbox" checked={eligibleOnly} onChange={(e) => setEligibleOnly(e.target.checked)} className="rounded border-slate-300 text-[#5338ec] focus:ring-[#5338ec]" />
            Only what I can take now
          </label>
          <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="ml-auto text-xs font-semibold border border-slate-200 rounded-full px-3.5 py-2 bg-white">
            <option value="ending">Ending soon</option>
            <option value="newest">Newest</option>
            <option value="broker">Broker A–Z</option>
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wide text-[#94a3b8] w-14 shrink-0">Type</span>
          <button onClick={() => setTypes([])} className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors ${types.length === 0 ? 'bg-[#5338ec] border-[#5338ec] text-white' : 'bg-white border-slate-200 text-[#474556] hover:border-[#5338ec]'}`}>
            All types
          </button>
          {PROMO_TYPES.map((t) => {
            const on = types.includes(t.id);
            return (
              <button
                key={t.id}
                title={t.hint}
                aria-pressed={on}
                onClick={() => toggle(types, t.id, setTypes)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors ${on ? 'bg-[#5338ec] border-[#5338ec] text-white' : 'bg-white border-slate-200 text-[#474556] hover:border-[#5338ec]'} ${!on && typeCounts[t.id] === 0 ? 'opacity-50' : ''}`}
              >
                {t.label} <span className={`ml-1 font-mono ${on ? 'text-white/80' : 'text-[#94a3b8]'}`}>{typeCounts[t.id]}</span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wide text-[#94a3b8] w-14 shrink-0">Asset</span>
          {ASSETS.map((a) => (
            <button key={a} onClick={() => toggle(assets, a, setAssets)} className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors ${assets.includes(a) ? 'bg-[#5338ec] border-[#5338ec] text-white' : 'bg-white border-slate-200 text-[#474556] hover:border-[#5338ec]'}`}>{a}</button>
          ))}
        </div>

        <div className="flex items-center justify-between text-xs text-[#474556]">
          <span>Showing <span className="font-bold text-[#0b1c30]">{list.length}</span> of {PROMOTIONS.length} offers</span>
          {activeFilters > 0 && <button onClick={clearFilters} className="font-semibold text-[#5338ec] hover:underline">Clear filters</button>}
        </div>
      </div>

      {tab === 'drops' && rank < 2 && (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0b1c30] text-white rounded-2xl px-5 py-4 mb-5">
          <div>
            <p className="text-sm font-bold">Premium drops are for Premium members</p>
            <p className="text-xs text-white/70">Short-run offers negotiated for members only. You can preview them here.</p>
          </div>
          <button onClick={onUpgradePrompt} className="bg-white text-[#0b1c30] text-xs font-bold px-4 py-2 rounded-xl hover:bg-slate-100 transition-colors">See Premium</button>
        </div>
      )}

      <div className="space-y-4">
        {list.map((p) => {
          const st = status(p);
          const isClaimed = claimed.includes(p.id);
          return (
            <div key={p.id} className="bg-white border border-[#e2e8f0] rounded-2xl p-5 flex flex-col md:flex-row md:items-center gap-5">
              <div className="flex items-center gap-4 md:w-[34%] min-w-0">
                <div className="w-12 h-12 rounded-xl text-white flex items-center justify-center text-sm font-black shrink-0" style={{ background: brokerColor(p.brokerName) }}>
                  {p.brokerName.split(' ').map((w) => w[0]).join('').slice(0, 2)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#474556]">{p.brokerName}</p>
                  <p className="text-base font-bold text-[#0b1c30] leading-snug">{p.title}</p>
                  <span className={`inline-block mt-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold ${KIND_STYLE[p.kind]}`}>{p.kind}</span>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#474556] leading-relaxed mb-2">{p.summary}</p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[#94a3b8] font-semibold">
                  <span>{p.assets.join(', ')}</span>
                  <span>{p.accountTypes.join(', ')}</span>
                  {p.minDeposit > 0 && <span>Min deposit ${p.minDeposit}</span>}
                  <span className={`flex items-center gap-1 ${p.endsInDays <= 7 ? 'text-rose-600' : ''}`}><Clock className="w-3 h-3" /> Ends in {p.endsInDays} days</span>
                </div>
              </div>

              <div className="md:w-[200px] shrink-0 flex flex-row md:flex-col items-center md:items-stretch justify-between gap-2">
                <p className="text-lg font-bold font-mono text-[#0b1c30] md:text-right">{p.value}</p>
                {isClaimed ? (
                  <span className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 rounded-xl py-2.5 px-3"><Check className="w-4 h-4" /> In My offers</span>
                ) : (
                  <button
                    onClick={() => act(p)}
                    className={`flex items-center justify-center gap-1.5 text-xs font-bold rounded-xl py-2.5 px-3 transition-colors ${
                      st.ok ? 'bg-[#5338ec] hover:bg-[#4326d8] text-white' : 'border border-[#5338ec]/30 hover:border-[#5338ec] text-[#5338ec]'
                    }`}
                  >
                    {!st.ok && st.action === 'upgrade' && <Lock className="w-3.5 h-3.5" />}
                    {st.ok ? 'Take this offer' : st.reason}
                  </button>
                )}
                <button onClick={() => { toggle(saved, p.id, setSaved); onShowToast(saved.includes(p.id) ? 'Removed from saved' : 'Saved for later'); }} className="flex items-center justify-center gap-1 text-[11px] font-semibold text-[#474556] hover:text-[#5338ec]">
                  {saved.includes(p.id) ? <BookmarkCheck className="w-3.5 h-3.5 text-[#5338ec]" /> : <Bookmark className="w-3.5 h-3.5" />} {saved.includes(p.id) ? 'Saved' : 'Save for later'}
                </button>
              </div>
            </div>
          );
        })}
        {list.length === 0 && (
          <div className="text-center py-16">
            <p className="text-sm font-semibold text-[#0b1c30] mb-1">{tab === 'mine' ? 'Nothing here yet' : 'No offers match'}</p>
            <p className="text-xs text-[#474556]">{tab === 'mine' ? 'Take or save an offer and it shows up here.' : 'Try fewer filters or turn off “Only what I can take now”.'}</p>
            {tab !== 'mine' && activeFilters > 0 && <button onClick={clearFilters} className="mt-3 text-xs font-bold text-[#5338ec] hover:underline">Clear filters</button>}
          </div>
        )}
      </div>

      <div className="mt-8 flex items-start gap-3 text-xs text-[#474556] leading-relaxed bg-slate-50 border border-[#e2e8f0] rounded-2xl p-4">
        <ShieldCheck className="w-4 h-4 text-[#5338ec] shrink-0 mt-0.5" />
        <p>
          Offers shown are examples for preview. Read each broker’s own terms before you deposit. Bonuses and credits can come with trading requirements, and trading leveraged products carries risk.{' '}
          <button onClick={() => onNavigateToTab('broker-comparison')} className="font-semibold text-[#5338ec] hover:underline">Compare brokers</button>
        </p>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-[#e2e8f0] w-full max-w-md shadow-2xl p-6">
            <div className="flex items-start justify-between mb-1">
              <div>
                <p className="text-xs font-semibold text-[#474556]">{open.brokerName}</p>
                <h3 className="text-lg font-bold text-[#0b1c30]">{open.title}</h3>
              </div>
              <button onClick={() => setOpen(null)} className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100" aria-label="Close"><X className="w-4 h-4" /></button>
            </div>
            <p className="text-sm text-[#474556] mb-4">{open.summary}</p>
            <p className="text-xs font-bold uppercase tracking-wide text-[#474556] mb-2">Terms</p>
            <ul className="space-y-1.5 mb-4">
              {open.terms.map((t) => (
                <li key={t} className="flex items-start gap-2 text-xs text-[#0b1c30]"><span className="text-[#5338ec] mt-0.5">•</span>{t}</li>
              ))}
            </ul>
            <label className="flex items-start gap-2.5 text-xs text-[#0b1c30] cursor-pointer mb-5">
              <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 rounded border-slate-300 text-[#5338ec] focus:ring-[#5338ec]" />
              I have read the terms and understand this offer comes from {open.brokerName}, not MarketSyde.
            </label>
            <button disabled={!agree} onClick={confirm} className="w-full bg-[#5338ec] hover:bg-[#4326d8] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold py-2.5 rounded-xl transition-colors">
              Save to My offers
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

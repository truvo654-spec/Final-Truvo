import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Search, X, Clock, ShieldCheck, Lock } from 'lucide-react';
import { Broker, Mission } from '../../types';
import { PROMOTIONS, Promotion, PromoType, PromoLevel, PROMO_TYPES, PROMO_LEVELS } from '../../data/promotionsData';
import { PillTabs } from '../portfolio/portfolioUi';
import { MoreConnectedBrokersBanner } from '../dashboard/MoreConnectedBrokersBanner';
import { THEME, LEVEL_DOT, BannerArt } from './promotionArt';
import { PromotionDetail, CtaKind, conditions } from './PromotionDetail';
import { LevelGateModal } from './LevelGateModal';
import { promotionAlerts, useMyPromotionAlerts } from '../../data/promotionAlerts';

type Tab = 'tier' | 'mine';
type Phase = 'live' | 'upcoming' | 'mine';
type Sort = 'soon' | 'newest' | 'broker';
type Skip = 'type' | 'letter' | 'phase';

interface PromotionsPageProps {
  /** Open offer (from the URL). */
  detailId: string | null;
  onDetailChange: (id: string | null) => void;
  userTierLevel: number;
  isLoggedIn: boolean;
  brokers: Broker[];
  missions: Mission[];
  points: number;
  maxPoints: number;
  credits: number;
  onSignIn: () => void;
  onSignUp: () => void;
  onOpenBrokerDetail: (broker: Broker) => void;
  onOpenSignal: (ticker: string) => void;
  onOpenInstrument: (symbol: string) => void;
  onGoToMissions: () => void;
  onOpenNotifications: () => void;
  onOpenConnectModal: (broker?: Broker) => void;
  onNavigateToTab: (tab: string) => void;
  onUpgradePrompt: () => void;
  onShowToast: (msg: string) => void;
}

const TAB_INFO: Record<Tab, { label: string; blurb: string }> = {
  tier: { label: 'Tier Offer', blurb: 'Broker offers and premium drops by tier. Offers above your tier show as unavailable until you level up.' },
  mine: { label: 'My offers', blurb: 'Promotions from MarketSyde on the platform.' },
};

/* ───────────── Dropdown shell ───────────── */

const FilterDropdown: React.FC<{
  label: string;
  summary: string;
  active: boolean;
  width?: string;
  children: (close: () => void) => React.ReactNode;
}> = ({ label, summary, active, width = 'w-80', children }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);
  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-2 border rounded-xl pl-3.5 pr-3 py-2 text-sm bg-white transition-colors ${open || active ? 'border-[#5338ec]' : 'border-slate-200 hover:border-[#5338ec]'}`}
      >
        <span className="text-[#474556] font-medium">{label}</span>
        <span className="font-bold text-[#0b1c30]">{summary}</span>
        <span aria-hidden className={`inline-block w-2 h-2 border-r-2 border-b-2 border-slate-400 transition-transform ${open ? 'rotate-[225deg] mt-1' : 'rotate-45 -mt-1'}`} />
      </button>
      {open && (
        <div role="listbox" className={`absolute left-0 top-full mt-2 ${width} max-w-[calc(100vw-2rem)] bg-white border border-[#e2e8f0] rounded-2xl shadow-xl p-2 z-30`}>
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
};

const Check: React.FC<{ on: boolean }> = ({ on }) => (
  <span className={`w-[18px] h-[18px] rounded-md border flex items-center justify-center shrink-0 ${on ? 'bg-[#5338ec] border-[#5338ec]' : 'border-slate-300 bg-white'}`}>
    {on && <span className="text-white text-[11px] leading-none font-bold">✓</span>}
  </span>
);

/* ───────────── Page ───────────── */

export const PromotionsPage: React.FC<PromotionsPageProps> = ({
  detailId,
  onDetailChange: setDetailId,
  userTierLevel,
  isLoggedIn,
  brokers,
  missions,
  points,
  maxPoints,
  credits,
  onSignIn,
  onSignUp,
  onOpenBrokerDetail,
  onOpenSignal,
  onOpenInstrument,
  onGoToMissions,
  onOpenNotifications,
  onOpenConnectModal,
  onNavigateToTab,
  onUpgradePrompt,
  onShowToast,
}) => {
  const level = (isLoggedIn ? Math.min(4, Math.max(1, userTierLevel || 1)) : 1) as PromoLevel;
  const [tab, setTab] = useState<Tab>('tier');
  const [phase, setPhase] = useState<Phase>('live');
  const [search, setSearch] = useState('');
  const [types, setTypes] = useState<PromoType[]>([]);
  const [letter, setLetter] = useState<string | null>(null);
  const [eligibleOnly, setEligibleOnly] = useState(false);
  const [sort, setSort] = useState<Sort>('soon');
  const alerts = useMyPromotionAlerts();
  const taken = alerts.filter((a) => a.kind === 'taken').map((a) => a.id);
  const notified = alerts.filter((a) => a.kind === 'notify').map((a) => a.id);
  const [gate, setGate] = useState<Promotion | null>(null);
  const [open, setOpen] = useState<Promotion | null>(null);
  const [agree, setAgree] = useState(false);

  const joinedAt = (id: string) => alerts.find((a) => a.kind === 'taken' && a.id === id)?.date;
  const connected = (p: Promotion) => p.source === 'platform' || !!brokers.find((b) => b.id === p.brokerId)?.connected;
  const inTab = (p: Promotion, t: Tab) => (t === 'tier' ? p.source === 'broker' : p.source === 'platform');
  const isLive = (p: Promotion) => p.startsInDays === 0;
  const first = (p: Promotion) => p.brokerName.charAt(0).toUpperCase();

  /** One predicate for every filter so each count matches what you would get. */
  const passes = (p: Promotion, skip: Skip[] = []) => {
    if (phase === 'mine') {
      // My Promotion: every offer the member has joined, whichever tab it lives in
      if (!taken.includes(p.id)) return false;
    } else {
      if (!inTab(p, tab)) return false;
      if (!skip.includes('phase') && (phase === 'live') !== isLive(p)) return false;
      if (eligibleOnly && !(p.minLevel <= level && isLive(p) && connected(p))) return false;
    }
    if (!skip.includes('type') && types.length && !types.includes(p.type)) return false;
    if (!skip.includes('letter') && letter && first(p) !== letter) return false;
    const q = search.trim().toLowerCase();
    if (q && !(p.title.toLowerCase().includes(q) || p.brokerName.toLowerCase().includes(q) || p.kind.toLowerCase().includes(q))) return false;
    return true;
  };

  const list = PROMOTIONS.filter((p) => passes(p)).sort((a, b) => {
    if (sort === 'broker') return a.brokerName.localeCompare(b.brokerName);
    if (sort === 'newest') return a.addedDaysAgo - b.addedDaysAgo;
    if (phase === 'mine') return taken.indexOf(a.id) - taken.indexOf(b.id); // most recently joined first
    return phase === 'upcoming' ? a.startsInDays - b.startsInDays : a.endsInDays - b.endsInDays;
  });

  const typeCounts = useMemo(() => {
    const out = {} as Record<PromoType, number>;
    PROMO_TYPES.forEach((t) => (out[t.id] = PROMOTIONS.filter((p) => p.type === t.id && passes(p, ['type'])).length));
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, phase, search, letter, eligibleOnly, level, brokers, alerts]);

  const letters = useMemo(() => {
    const m = new Map<string, { brokers: Set<string>; n: number }>();
    PROMOTIONS.filter((p) => passes(p, ['letter'])).forEach((p) => {
      const k = first(p);
      const e = m.get(k) || { brokers: new Set<string>(), n: 0 };
      e.brokers.add(p.brokerName);
      e.n += 1;
      m.set(k, e);
    });
    return Array.from(m.entries()).sort((a, b) => a[0].localeCompare(b[0]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, phase, search, types, eligibleOnly, level, brokers, alerts]);

  const phaseCount = (ph: Phase) =>
    PROMOTIONS.filter((p) => {
      if (ph === 'mine') {
        if (!taken.includes(p.id)) return false;
      } else {
        if (!inTab(p, tab)) return false;
        if ((ph === 'live') !== isLive(p)) return false;
      }
      if (types.length && !types.includes(p.type)) return false;
      if (letter && first(p) !== letter) return false;
      const q = search.trim().toLowerCase();
      if (q && !(p.title.toLowerCase().includes(q) || p.brokerName.toLowerCase().includes(q) || p.kind.toLowerCase().includes(q))) return false;
      return ph === 'mine' || !eligibleOnly || (p.minLevel <= level && isLive(p) && connected(p));
    }).length;

  const tabCount = (t: Tab) => PROMOTIONS.filter((p) => inTab(p, t)).length;
  // One list. What the member can take comes first, offers above their tier follow as unavailable.
  const ordered = phase === 'mine' ? list : [...list.filter((p) => p.minLevel <= level), ...list.filter((p) => p.minLevel > level)];

  const activeFilters = types.length + (letter ? 1 : 0) + (eligibleOnly ? 1 : 0) + (search.trim() ? 1 : 0);
  const clearFilters = () => {
    setTypes([]);
    setLetter(null);
    setEligibleOnly(false);
    setSearch('');
  };
  const toggleType = (t: PromoType) => setTypes((a) => (a.includes(t) ? a.filter((x) => x !== t) : [...a, t]));

  /** What the button on each banner does. Order matters: sign in, then level, then connection. */
  const cta = (p: Promotion): { label: string; kind: CtaKind } => {
    if (taken.includes(p.id)) return { label: 'Joined ✓', kind: 'done' };
    if (!isLoggedIn) return { label: 'Join MarketSyde', kind: 'join' };
    if (p.minLevel > level) return { label: `Unavailable until Lv.${p.minLevel}`, kind: 'locked' };
    if (!isLive(p)) return notified.includes(p.id) ? { label: 'We will notify you ✓', kind: 'notifying' } : { label: 'Notify me', kind: 'notify' };
    if (p.source === 'broker' && !connected(p)) return { label: 'Connect broker', kind: 'connect' };
    return { label: 'Join Promotion', kind: 'take' };
  };

  const act = (p: Promotion) => {
    const c = cta(p);
    if (c.kind === 'join') return onSignUp();
    if (c.kind === 'locked') return setGate(p);
    if (c.kind === 'connect') return onOpenConnectModal(brokers.find((b) => b.id === p.brokerId));
    if (c.kind === 'notify') {
      promotionAlerts.notify(p);
      return onShowToast(`We will notify you when “${p.title}” starts. Find it in Notifications › My Promotion.`);
    }
    if (c.kind === 'notifying') {
      promotionAlerts.stopNotify(p.id);
      return onShowToast('Notification turned off');
    }
    if (c.kind === 'take') {
      setAgree(false);
      setOpen(p);
    }
  };

  const confirm = () => {
    if (!open || !agree) return;
    promotionAlerts.taken(open);
    onShowToast(`You joined “${open.title}”`);
    setOpen(null);
  };

  const findBroker = (name: string) => {
    const n = name.toLowerCase();
    return brokers.find((b) => b.name.toLowerCase() === n) || brokers.find((b) => b.name.toLowerCase().includes(n) || n.includes(b.name.toLowerCase()));
  };

  const typeSummary = types.length === 0 ? 'All' : types.length === 1 ? PROMO_TYPES.find((t) => t.id === types[0])!.label : `${PROMO_TYPES.find((t) => t.id === types[0])!.label} +${types.length - 1}`;

  const renderCard = (p: Promotion) => {
    const t = THEME[p.type];
    const c = cta(p);
    const soon = p.endsInDays <= 7 && isLive(p);
    const isLocked = isLoggedIn ? p.minLevel > level : p.minLevel > 1;
    const needsConn = p.source === 'broker';
    return (
      <div key={p.id} data-locked={isLocked ? 'true' : undefined} className={`bg-white border border-[#e2e8f0] rounded-2xl overflow-hidden flex flex-col ${isLocked ? 'opacity-75' : ''}`}>
        <div onClick={() => setDetailId(p.id)} className="relative h-44 p-5 flex flex-col justify-between overflow-hidden cursor-pointer" style={{ background: t.bg, color: t.ink, filter: isLocked ? 'saturate(0.45)' : undefined }}>
          <div className="absolute -right-12 -bottom-16 w-60 h-60 rounded-full" style={{ background: 'rgba(255,255,255,0.10)' }} />
          <BannerArt type={p.type} color={t.art} />
          <div className="relative flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold truncate" style={{ background: 'rgba(255,255,255,0.18)', color: t.ink }}>{p.source === 'platform' ? 'MarketSyde' : p.brokerName}</span>
              <span className="text-[11px] font-semibold truncate" style={{ color: t.sub }}>{p.kind}</span>
            </div>
            <span className="flex items-center gap-1.5 bg-white text-[#0b1c30] text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0">
              <span className="w-2 h-2 rounded-full" style={{ background: LEVEL_DOT[p.minLevel], boxShadow: p.minLevel === 4 ? 'inset 0 0 0 1px #0b1c30' : undefined }} />
              Lv.{p.minLevel}{p.minLevel > 1 ? '+' : ''} {PROMO_LEVELS[p.minLevel]}
            </span>
          </div>
          <div className="relative">
            <p className="font-display text-3xl font-black leading-none tracking-tight">{p.value}</p>
            <p className="text-xs font-semibold mt-1.5" style={{ color: t.sub }}>{p.valueNote}</p>
          </div>
          {isLocked && (
            <div className="absolute inset-0 bg-slate-900/45 flex items-center justify-center">
              <span className="flex items-center gap-2 bg-white text-[#0b1c30] text-xs font-bold px-3.5 py-2 rounded-full shadow-md">
                <Lock className="w-3.5 h-3.5" /> Unavailable at your tier
              </span>
            </div>
          )}
        </div>

        <div className="p-5 flex flex-col flex-1">
          <h3 onClick={() => setDetailId(p.id)} className="text-base font-bold text-[#0b1c30] leading-snug cursor-pointer hover:text-[#5338ec] transition-colors">{p.title}</h3>
          <p className="text-sm text-[#474556] leading-relaxed mt-1 line-clamp-2">{p.summary}</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[#94a3b8] font-semibold mt-3">
            {p.source === 'broker' && <span>{p.accountTypes.join(', ')}</span>}
            {p.minDeposit > 0 && <span>Min deposit ${p.minDeposit}</span>}
            {phase === 'mine' && joinedAt(p.id) && <span className="text-emerald-600">Joined {joinedAt(p.id)}</span>}
            {needsConn && (
              !isLoggedIn ? <span>Broker account needed</span>
              : connected(p) ? <span className="text-emerald-600">{p.brokerName} connected</span>
              : <span className="text-amber-600">{p.brokerName} not connected</span>
            )}
            <span className={`flex items-center gap-1 ${soon ? 'text-rose-600' : ''}`}>
              <Clock className="w-3 h-3" />
              {isLive(p) ? `Ends in ${p.endsInDays} days` : `Starts in ${p.startsInDays} days`}
            </span>
          </div>
          <div className="mt-4 pt-4 border-t border-[#f1f5f9] mt-auto">
            <button
              onClick={() => act(p)}
              disabled={c.kind === 'done'}
              className={`w-full text-sm font-bold rounded-xl py-2.5 transition-colors ${
                c.kind === 'done' ? 'bg-emerald-50 text-emerald-700 cursor-default'
                : c.kind === 'take' || c.kind === 'join' ? 'bg-[#5338ec] hover:bg-[#4326d8] text-white'
                : c.kind === 'notifying' ? 'bg-[#EEF0FE] text-[#5338ec]'
                : c.kind === 'locked' ? 'bg-slate-100 hover:bg-slate-200 text-[#0b1c30]'
                : 'border border-[#5338ec]/40 hover:border-[#5338ec] text-[#5338ec]'
              }`}
            >
              {c.label}
            </button>
            {c.kind === 'notifying' && (
              <button onClick={onOpenNotifications} className="w-full mt-2 text-xs font-semibold text-[#5338ec] hover:underline">View in Notifications › My Promotion</button>
            )}
            <button onClick={() => setDetailId(p.id)} className="w-full mt-2.5 text-xs font-semibold text-[#474556] hover:text-[#5338ec] transition-colors">
              View details and conditions
            </button>
          </div>
        </div>
      </div>
    );
  };

  const modal = (
    <>
      {gate && (
        <LevelGateModal
          promo={gate}
          level={level}
          points={points}
          maxPoints={maxPoints}
          credits={credits}
          missions={missions}
          onClose={() => setGate(null)}
          onGoToMissions={() => {
            setGate(null);
            onGoToMissions();
          }}
        />
      )}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs" onClick={() => setOpen(null)}>
          <div role="dialog" aria-modal="true" aria-labelledby="join-title" className="bg-white rounded-2xl border border-[#e2e8f0] w-full max-w-md shadow-2xl p-6 max-h-[calc(100vh-2rem)] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-1 shrink-0">
              <div>
                <p className="text-xs font-semibold text-[#474556]">{open.source === 'platform' ? 'MarketSyde' : open.brokerName} · Lv.{open.minLevel}{open.minLevel > 1 ? '+' : ''}</p>
                <h3 id="join-title" className="text-lg font-bold text-[#0b1c30]">Review before you join</h3>
                <p className="text-sm font-semibold text-[#5338ec] mt-0.5">{open.title}</p>
              </div>
              <button onClick={() => setOpen(null)} className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100" aria-label="Close"><X className="w-4 h-4" /></button>
            </div>
            <p className="text-sm text-[#474556] mb-3 shrink-0">{open.summary}</p>
            {open.source === 'broker' && <p className="text-xs text-[#474556] bg-slate-50 rounded-lg px-3 py-2 mb-3 shrink-0">This offer comes from {open.brokerName}, not MarketSyde. {open.brokerName} sets its terms and pays it.</p>}

            <p className="text-xs font-bold uppercase tracking-wide text-[#474556] mb-2 shrink-0">Terms &amp; Conditions</p>
            <ul className="space-y-1.5 mb-3 overflow-y-auto border border-[#e2e8f0] rounded-xl p-3 min-h-[5rem]" tabIndex={0} aria-label="Terms and conditions">
              {conditions(open).map((x) => (
                <li key={x} className="flex items-start gap-2 text-xs text-[#0b1c30] leading-relaxed"><span className="text-[#5338ec] mt-0.5">•</span>{x}</li>
              ))}
            </ul>
            <button type="button" onClick={() => { const id = open.id; setOpen(null); setDetailId(id); }} className="self-start text-xs font-semibold text-[#5338ec] hover:underline mb-3 shrink-0">Open the full offer page</button>

            <label className="flex items-start gap-2.5 text-sm text-[#0b1c30] cursor-pointer mb-1 shrink-0">
              <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 rounded border-slate-300 text-[#5338ec] focus:ring-[#5338ec]" />
              <span>I have read and agree to the Terms &amp; Conditions of this promotion.</span>
            </label>
            <p className={`text-[11px] mb-4 shrink-0 ${agree ? 'text-transparent' : 'text-[#6b7686]'}`} aria-live="polite">{agree ? 'Ready' : 'Tick the box to enable Confirm.'}</p>

            <div className="flex gap-3 shrink-0">
              <button type="button" onClick={() => setOpen(null)} className="flex-1 border border-slate-200 hover:bg-slate-50 text-sm font-semibold py-2.5 rounded-xl transition-colors">Cancel</button>
              <button type="button" disabled={!agree} onClick={confirm} className="flex-1 bg-[#5338ec] hover:bg-[#4326d8] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold py-2.5 rounded-xl transition-colors">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </>
  );

  const detail = detailId ? PROMOTIONS.find((x) => x.id === detailId) ?? null : null;
  if (detail) {
    return (
      <>
        <PromotionDetail
          promo={detail}
          level={level}
          connected={connected(detail)}
          cta={cta(detail)}
          isLoggedIn={isLoggedIn}
          onSignIn={onSignIn}
          onOpenNotifications={onOpenNotifications}
          onAct={() => act(detail)}
          onBack={() => {
            setDetailId(null);
            window.scrollTo({ top: 0 });
          }}
          onOpen={(x) => setDetailId(x.id)}
          onLevelUp={onUpgradePrompt}
          onCompare={() => onNavigateToTab('broker-comparison')}
          onToast={onShowToast}
          adBroker={findBroker(detail.brokerName) || brokers.find((b) => b.connected) || brokers[0]}
          onViewAdBroker={() => {
            const b = findBroker(detail.brokerName) || brokers.find((x) => x.connected) || brokers[0];
            if (b) onOpenBrokerDetail(b);
          }}
          onOpenSignals={() => onNavigateToTab('signals')}
          onOpenSignal={onOpenSignal}
          onOpenAnalysis={() => onNavigateToTab('instrument-analysis')}
          onOpenInstrument={onOpenInstrument}
          onViewBroker={(name, ph) => {
            setDetailId(null);
            setTab('tier');
            setPhase(ph);
            setTypes([]);
            setLetter(null);
            setEligibleOnly(false);
            setSearch(name);
            window.scrollTo({ top: 0 });
          }}
        />
        {modal}
      </>
    );
  }

  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-8 md:px-14 py-8 sm:py-10 pb-24">
      {detailId && !detail && (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#F8F7FF] border border-[#ECEEFA] rounded-2xl px-5 py-3 mb-5">
          <p className="text-sm text-[#0b1c30]">We could not find that offer. It may have ended.</p>
          <button onClick={() => setDetailId(null)} className="text-xs font-semibold text-[#474556] hover:text-[#0b1c30]">Dismiss</button>
        </div>
      )}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-[#0b1c30]">Promotions &amp; Bonuses</h1>
          <p className="text-sm text-[#474556] mt-1 max-w-xl">
            {isLoggedIn ? (
              <>You are <span className="font-bold text-[#0b1c30]">Lv.{level} {PROMO_LEVELS[level]}</span>. Offers above your tier show as unavailable until you level up.</>
            ) : (
              <>You are browsing as a visitor. <button onClick={onSignIn} className="font-bold text-[#5338ec] hover:underline">Sign in</button> to take offers and get notified.</>
            )}
          </p>
        </div>
        <PillTabs<Tab>
          options={(Object.keys(TAB_INFO) as Tab[]).map((t) => ({ id: t, label: `${TAB_INFO[t].label} (${tabCount(t)})` }))}
          value={tab}
          onChange={(t) => {
            setTab(t);
            setLetter(null);
          }}
        />
      </div>
      <p className="text-xs text-[#94a3b8] mb-5">{phase === 'mine' ? 'Promotions you have joined, from brokers and MarketSyde.' : TAB_INFO[tab].blurb}</p>

      {/* Live / Upcoming / My Promotion */}
      <div className="flex items-center gap-6 border-b border-[#e2e8f0] mb-5">
        {(['live', 'upcoming', 'mine'] as Phase[]).map((ph) => (
          <button
            key={ph}
            onClick={() => setPhase(ph)}
            className={`pb-3 -mb-px text-sm font-bold border-b-2 transition-colors ${phase === ph ? 'border-[#5338ec] text-[#5338ec]' : 'border-transparent text-[#474556] hover:text-[#0b1c30]'}`}
          >
            {ph === 'live' ? 'Available' : ph === 'upcoming' ? 'Upcoming' : 'Ongoing'} <span className="ml-1 font-mono text-xs opacity-70">{phaseCount(ph)}</span>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="space-y-3 mb-5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-60">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search broker or offer" className="w-full border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5338ec]/30" />
          </div>

          <FilterDropdown label="Promotion Type" summary={typeSummary} active={types.length > 0}>
            {(close) => (
              <>
                <div className="flex items-center justify-between px-3 pt-2 pb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wide text-[#94a3b8]">Promotion Type</span>
                  {types.length > 0 && <button type="button" onClick={() => setTypes([])} className="text-xs font-semibold text-[#5338ec] hover:underline">Clear</button>}
                </div>
                {PROMO_TYPES.map((t) => {
                  const on = types.includes(t.id);
                  return (
                    <div key={t.id} role="option" aria-selected={on} tabIndex={0} onClick={() => toggleType(t.id)} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), toggleType(t.id))} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${on ? 'bg-[#F8F7FF]' : 'hover:bg-slate-50'}`}>
                      <Check on={on} />
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-[#0b1c30]">{t.label}</span>
                        <span className="block text-[11px] text-[#94a3b8] leading-snug">{t.hint}</span>
                      </span>
                      <span className={`text-xs font-mono ${typeCounts[t.id] === 0 && !on ? 'text-slate-300' : 'text-[#474556]'}`}>{typeCounts[t.id]}</span>
                    </div>
                  );
                })}
                <div className="px-3 pt-2 pb-1">
                  <button type="button" onClick={close} className="w-full bg-[#5338ec] hover:bg-[#4326d8] text-white text-xs font-bold py-2 rounded-lg transition-colors">
                    Show {list.length} offer{list.length === 1 ? '' : 's'}
                  </button>
                </div>
              </>
            )}
          </FilterDropdown>

          <FilterDropdown label="Broker A–Z" summary={letter ?? 'All'} active={!!letter} width="w-72">
            {(close) => (
              <div className="max-h-80 overflow-y-auto">
                <div
                  role="option"
                  aria-selected={!letter}
                  tabIndex={0}
                  onClick={() => { setLetter(null); close(); }}
                  onKeyDown={(e) => e.key === 'Enter' && (setLetter(null), close())}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer ${!letter ? 'bg-[#F8F7FF]' : 'hover:bg-slate-50'}`}
                >
                  <span className="w-7 h-7 rounded-lg bg-slate-100 text-[11px] font-black text-[#474556] flex items-center justify-center">All</span>
                  <span className="flex-1 text-sm font-semibold text-[#0b1c30]">All brokers</span>
                </div>
                {letters.map(([l, info]) => (
                  <div
                    key={l}
                    role="option"
                    aria-selected={letter === l}
                    tabIndex={0}
                    onClick={() => { setLetter(l); close(); }}
                    onKeyDown={(e) => e.key === 'Enter' && (setLetter(l), close())}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer ${letter === l ? 'bg-[#F8F7FF]' : 'hover:bg-slate-50'}`}
                  >
                    <span className="w-7 h-7 rounded-lg bg-[#EEF0FE] text-sm font-black text-[#5338ec] flex items-center justify-center">{l}</span>
                    <span className="min-w-0 flex-1 text-sm text-[#0b1c30] truncate">{Array.from(info.brokers).sort().join(', ')}</span>
                    <span className="text-xs font-mono text-[#474556]">{info.n}</span>
                  </div>
                ))}
                {letters.length === 0 && <p className="px-3 py-4 text-xs text-[#474556]">No brokers in this view.</p>}
              </div>
            )}
          </FilterDropdown>

          {phase !== 'mine' && (
          <label className="flex items-center gap-2 text-xs font-semibold text-[#474556] cursor-pointer">
              <input type="checkbox" checked={eligibleOnly} onChange={(e) => setEligibleOnly(e.target.checked)} className="rounded border-slate-300 text-[#5338ec] focus:ring-[#5338ec]" />
              Only what I can take now
            </label>
          )}
          <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="ml-auto text-xs font-semibold border border-slate-200 rounded-full px-3.5 py-2 bg-white">
            <option value="soon">{phase === 'mine' ? 'Recently joined' : phase === 'upcoming' ? 'Starting soon' : 'Ending soon'}</option>
            <option value="newest">Newest</option>
            <option value="broker">Broker A–Z</option>
          </select>
        </div>

        <div className="flex items-center justify-between text-xs text-[#474556]">
          <span>Showing <span className="font-bold text-[#0b1c30]">{list.length}</span> {phase === 'mine' ? 'ongoing' : phase === 'live' ? 'available' : phase} {phase === 'mine' ? `promotion${list.length === 1 ? '' : 's'}` : `offer${list.length === 1 ? '' : 's'}`}</span>
          {activeFilters > 0 && <button onClick={clearFilters} className="font-semibold text-[#5338ec] hover:underline">Clear filters</button>}
        </div>
      </div>

      {/* Banner cards: open to your tier first, unavailable ones after */}
      {ordered.length > 0 && <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">{ordered.map(renderCard)}</div>}

      {list.length === 0 && (
        <div className="text-center py-16 bg-white border border-[#e2e8f0] rounded-2xl">
          <p className="text-sm font-semibold text-[#0b1c30] mb-1">
            {activeFilters > 0 ? 'No offers match these filters' : phase === 'mine' ? 'You have not joined any promotion yet' : phase === 'live' ? 'Nothing available here right now' : 'Nothing upcoming here right now'}
          </p>
          <p className="text-xs text-[#474556]">{activeFilters > 0 ? 'Try fewer filters.' : phase === 'mine' ? 'Join an offer from Available and it shows up here.' : 'Check the other tab.'}</p>
          {activeFilters > 0 && <button onClick={clearFilters} className="mt-3 text-xs font-bold text-[#5338ec] hover:underline">Clear filters</button>}
          {activeFilters === 0 && phase === 'mine' && <button onClick={() => setPhase('live')} className="mt-3 text-xs font-bold text-[#5338ec] hover:underline">Browse available offers</button>}
        </div>
      )}

      <div className="mt-8 flex items-start gap-3 text-xs text-[#474556] leading-relaxed bg-slate-50 border border-[#e2e8f0] rounded-2xl p-4">
        <ShieldCheck className="w-4 h-4 text-[#5338ec] shrink-0 mt-0.5" />
        <p>
          Offers shown are examples for preview. Read each broker’s own terms before you deposit. Bonuses and credits can come with trading requirements, and trading leveraged products carries risk.{' '}
          <button onClick={() => onNavigateToTab('broker-comparison')} className="font-semibold text-[#5338ec] hover:underline">Compare brokers</button>
        </p>
      </div>

      {/* Connect more brokers, same section as the dashboard */}
      <div className="mt-10">
        <MoreConnectedBrokersBanner
          className="w-full"
          onNavigateToTab={onNavigateToTab}
          onConnectBroker={(name) => onOpenConnectModal(findBroker(name))}
        />
      </div>

      {modal}
    </div>
  );
};

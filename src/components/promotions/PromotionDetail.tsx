import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Clock, ShieldCheck } from 'lucide-react';
import { Promotion, PromoLevel, PROMO_LEVELS, PROMO_TYPES, PROMOTIONS } from '../../data/promotionsData';
import { THEME, LEVEL_DOT, BannerArt } from './promotionArt';

export type CtaKind = 'take' | 'connect' | 'notify' | 'done' | 'notifying';

interface PromotionDetailProps {
  promo: Promotion;
  level: PromoLevel;
  connected: boolean;
  cta: { label: string; kind: CtaKind };
  onAct: () => void;
  onBack: () => void;
  onOpen: (p: Promotion) => void;
  onLevelUp: () => void;
  onCompare: () => void;
}

/** Fixed "today" so sample dates stay stable (same day the rest of the demo uses). */
const TODAY = Date.parse('2026-10-05T00:00:00Z');
const DAY = 86400000;
const date = (days: number) => new Date(TODAY + days * DAY).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });

const sourceName = (p: Promotion) => (p.source === 'platform' ? 'MarketSyde' : p.brokerName);

function howItWorks(p: Promotion): { title: string; text: string }[] {
  const who = sourceName(p);
  const steps: { title: string; text: string }[] = [];
  steps.push({ title: 'Check you can take it', text: `This offer is for Lv.${p.minLevel}${p.minLevel > 1 ? ' and above' : ''}. Your status is on the right.` });
  if (p.source === 'broker') {
    steps.push(
      p.requiresConnected
        ? { title: `Connect your ${who} account`, text: `Link the account to MarketSyde so we can see which trades count. It takes about a minute.` }
        : { title: `Use your ${who} account`, text: `Log in to your ${who} account, or open one through MarketSyde if you do not have one yet.` }
    );
  }
  const byType: Record<Promotion['type'], { title: string; text: string }> = {
    cashback: { title: 'Trade as you normally do', text: 'Eligible lots earn the extra cashback automatically. There is no code to enter.' },
    deposit: { title: p.minDeposit > 0 ? `Deposit at least $${p.minDeposit}` : 'Fund your account', text: 'The credit is added after your deposit clears. Check the conditions for how the credit can be used.' },
    spread: { title: 'Trade on a listed account type', text: `Open positions on ${p.accountTypes.join(' or ')} accounts while the offer is live.` },
    fee: { title: 'Open positions while the offer is live', text: 'The fee relief is applied to positions opened during the promotion period.' },
    contest: { title: 'Join, then trade', text: 'Join the competition, then place eligible trades. Your rank updates on the board.' },
  };
  steps.push(byType[p.type]);
  steps.push({ title: 'Track it', text: p.source === 'platform' ? 'Your reward shows up in your cashback balance once it is validated.' : 'Follow your result in your dashboard. Broker validation can take a little time.' });
  return steps;
}

function conditions(p: Promotion): string[] {
  const out = [...p.terms];
  out.push(`Valid from ${date(p.startsInDays)} to ${date(p.endsInDays)}.`);
  if (p.source === 'broker') out.push(`${p.brokerName} sets and pays this offer. MarketSyde does not guarantee it and cannot change ${p.brokerName}’s terms.`);
  out.push('The provider can change or withdraw the offer. If that happens we will update this page.');
  out.push('Trading leveraged products carries a high risk of loss. Bonuses and credits may come with trading requirements.');
  return out;
}

function faqs(p: Promotion): { q: string; a: string }[] {
  const who = sourceName(p);
  const list: { q: string; a: string }[] = [];
  list.push({ q: 'Who provides this offer?', a: p.source === 'platform' ? 'MarketSyde provides this promotion on the platform.' : `${p.brokerName} provides it. MarketSyde shows it to you based on your member level.` });
  list.push({ q: 'Why can I see this offer?', a: `It is open to Lv.${p.minLevel}${p.minLevel > 1 ? ' and above' : ''}. As your level goes up, more offers appear.` });
  if (p.type === 'cashback') list.push({ q: 'When do I receive the extra cashback?', a: 'It is added after the broker validates your lots. Until then it shows as pending.' });
  if (p.type === 'deposit') list.push({ q: 'Can I withdraw the credit?', a: 'Usually the credit itself cannot be withdrawn, but profits can once any lot requirement is met. Read the conditions above for this offer.' });
  if (p.type === 'spread') list.push({ q: 'Does it apply to every pair?', a: 'No. It applies to the account types and instruments listed in the conditions.' });
  if (p.type === 'fee') list.push({ q: 'Is every position covered?', a: 'Only positions that match the conditions and are opened while the offer is live.' });
  if (p.type === 'contest') list.push({ q: 'How is the winner decided?', a: 'The ranking rule is in the conditions. Results are final once the provider confirms them.' });
  list.push({ q: 'Can I combine it with other offers?', a: `Sometimes. ${who} decides, so check the conditions before you stack offers.` });
  if (p.requiresConnected) list.push({ q: 'Why do I need to connect my account?', a: 'We can only match trades to the offer when the account is connected. You can disconnect any time.' });
  list.push({ q: 'What if my level changes?', a: 'You keep what you already took. New offers follow your current level.' });
  return list;
}

const Section: React.FC<{ id: string; title: string; children: React.ReactNode; refFn: (el: HTMLElement | null) => void }> = ({ id, title, children, refFn }) => (
  <section id={id} ref={refFn} className="scroll-mt-28">
    <h2 className="text-lg font-display font-bold text-[#0b1c30] mb-4">{title}</h2>
    {children}
  </section>
);

export const PromotionDetail: React.FC<PromotionDetailProps> = ({ promo: p, level, connected, cta, onAct, onBack, onOpen, onLevelUp, onCompare }) => {
  const t = THEME[p.type];
  const typeLabel = PROMO_TYPES.find((x) => x.id === p.type)!.label;
  const live = p.startsInDays === 0;
  const [faqOpen, setFaqOpen] = useState<number | null>(0);
  const [active, setActive] = useState('overview');
  const sections = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    window.scrollTo({ top: 0 });
    setFaqOpen(0);
    setActive('overview');
  }, [p.id]);

  const go = (id: string) => {
    setActive(id);
    const el = sections.current[id];
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 110, behavior: 'smooth' });
  };

  const levelOk = level >= p.minLevel;
  const steps = useMemo(() => howItWorks(p), [p]);
  const faq = useMemo(() => faqs(p), [p]);
  const related = useMemo(() => {
    const pool = PROMOTIONS.filter((x) => x.id !== p.id && x.minLevel <= level && x.source === p.source);
    const score = (x: Promotion) => (x.brokerId === p.brokerId ? 2 : 0) + (x.type === p.type ? 1 : 0) + (x.startsInDays === 0 ? 0.5 : 0);
    return [...pool].sort((a, b) => score(b) - score(a)).slice(0, 3);
  }, [p, level]);

  const facts: [string, string][] = [
    ['Offer', `${p.value} ${p.valueNote}`],
    ['Promotion type', typeLabel],
    ['Provided by', sourceName(p)],
    [live ? 'Valid until' : 'Starts', live ? date(p.endsInDays) : date(p.startsInDays)],
    ...(live ? [] : ([['Ends', date(p.endsInDays)]] as [string, string][])),
    ['Level needed', `Lv.${p.minLevel}${p.minLevel > 1 ? '+' : ''} ${PROMO_LEVELS[p.minLevel]}`],
    ...(p.source === 'broker' ? ([['Account types', p.accountTypes.join(', ')]] as [string, string][]) : []),
    ['Minimum deposit', p.minDeposit > 0 ? `$${p.minDeposit}` : 'None'],
  ];

  const checks: { ok: boolean | null; title: string; text: string }[] = [
    { ok: levelOk, title: `Level ${p.minLevel}${p.minLevel > 1 ? '+' : ''}`, text: levelOk ? `You are Lv.${level} ${PROMO_LEVELS[level]}.` : `You are Lv.${level}. This opens at Lv.${p.minLevel}.` },
    p.requiresConnected
      ? { ok: connected, title: `${p.brokerName} account connected`, text: connected ? 'Connected.' : `Connect it to take this offer.` }
      : { ok: true, title: 'No connection needed', text: 'You can take this offer without linking an account.' },
    { ok: null, title: 'Region and account rules', text: `${sourceName(p)} may limit offers by country or account type. Check the conditions.` },
  ];

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'how', label: 'How it works' },
    { id: 'conditions', label: 'Conditions' },
    { id: 'faq', label: 'FAQ' },
    ...(related.length ? [{ id: 'more', label: 'More offers' }] : []),
  ];

  return (
    <div className="w-full max-w-[1120px] mx-auto px-4 sm:px-8 md:px-14 py-6 sm:py-8 pb-24">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-[#474556] mb-4">
        <button onClick={onBack} className="font-semibold text-[#5338ec] hover:underline">← Promotions &amp; Bonuses</button>
        <span className="text-slate-300">/</span>
        <span className="truncate">{p.title}</span>
      </div>

      {/* Hero */}
      <div className="relative rounded-3xl overflow-hidden h-56 sm:h-64 p-6 sm:p-8 flex flex-col justify-between" style={{ background: t.bg, color: t.ink }}>
        <div className="absolute -right-16 -bottom-24 w-80 h-80 rounded-full" style={{ background: 'rgba(255,255,255,0.10)' }} />
        <div className="absolute right-4 sm:right-10 bottom-0 scale-[1.3] origin-bottom-right">
          <BannerArt type={p.type} color={t.art} />
        </div>
        <div className="relative flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: 'rgba(255,255,255,0.18)' }}>{sourceName(p)}</span>
            <span className="text-xs font-semibold" style={{ color: t.sub }}>{p.kind}</span>
          </div>
          <span className="flex items-center gap-1.5 bg-white text-[#0b1c30] text-xs font-bold px-3 py-1.5 rounded-full shrink-0">
            <span className="w-2 h-2 rounded-full" style={{ background: LEVEL_DOT[p.minLevel], boxShadow: p.minLevel === 4 ? 'inset 0 0 0 1px #0b1c30' : undefined }} />
            Lv.{p.minLevel}{p.minLevel > 1 ? '+' : ''} {PROMO_LEVELS[p.minLevel]}
          </span>
        </div>
        <div className="relative">
          <p className="font-display text-4xl sm:text-5xl font-black leading-none tracking-tight">{p.value}</p>
          <p className="text-sm font-semibold mt-2" style={{ color: t.sub }}>{p.valueNote}</p>
        </div>
      </div>

      {/* Title row */}
      <div className="mt-6 mb-2">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${live ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{live ? 'Live now' : 'Upcoming'}</span>
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#EEF0FE] text-[#5338ec]">{typeLabel}</span>
          <span className={`flex items-center gap-1 text-[11px] font-semibold ${live && p.endsInDays <= 7 ? 'text-rose-600' : 'text-[#474556]'}`}>
            <Clock className="w-3 h-3" />
            {live ? `Ends in ${p.endsInDays} days · ${date(p.endsInDays)}` : `Starts in ${p.startsInDays} days · ${date(p.startsInDays)}`}
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-[#0b1c30]">{p.title}</h1>
      </div>

      {/* Section nav */}
      <div className="sticky top-[68px] z-20 bg-[#f8fafc]/95 backdrop-blur-xs -mx-1 px-1 py-2 mb-6 border-b border-[#e2e8f0]">
        <div className="flex items-center gap-6 overflow-x-auto">
          {tabs.map((x) => (
            <button key={x.id} onClick={() => go(x.id)} className={`pb-2 -mb-px text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${active === x.id ? 'border-[#5338ec] text-[#5338ec]' : 'border-transparent text-[#474556] hover:text-[#0b1c30]'}`}>
              {x.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-8 items-start">
        <div className="space-y-10 min-w-0">
          <Section id="overview" title="Overview" refFn={(el) => (sections.current.overview = el)}>
            <p className="text-sm text-[#0b1c30] leading-relaxed mb-5">{p.summary}</p>
            <div className="bg-white border border-[#e2e8f0] rounded-2xl divide-y divide-[#f1f5f9]">
              {facts.map(([k, v]) => (
                <div key={k} className="flex items-start justify-between gap-4 px-5 py-3">
                  <span className="text-xs font-semibold text-[#474556]">{k}</span>
                  <span className="text-sm font-bold text-[#0b1c30] text-right">{v}</span>
                </div>
              ))}
            </div>
          </Section>

          <Section id="how" title="How it works" refFn={(el) => (sections.current.how = el)}>
            <ol className="space-y-4">
              {steps.map((s, i) => (
                <li key={s.title} className="flex items-start gap-4">
                  <span className="w-8 h-8 rounded-full bg-[#5338ec] text-white text-sm font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                  <div className="pt-0.5">
                    <p className="text-sm font-bold text-[#0b1c30]">{s.title}</p>
                    <p className="text-sm text-[#474556] leading-relaxed">{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Section>

          <Section id="conditions" title="Conditions" refFn={(el) => (sections.current.conditions = el)}>
            <ul className="bg-white border border-[#e2e8f0] rounded-2xl p-5 space-y-3">
              {conditions(p).map((c) => (
                <li key={c} className="flex items-start gap-3 text-sm text-[#0b1c30] leading-relaxed">
                  <span className="text-[#5338ec] mt-0.5">•</span>
                  {c}
                </li>
              ))}
            </ul>
          </Section>

          <Section id="faq" title="Frequently asked questions" refFn={(el) => (sections.current.faq = el)}>
            <div className="bg-white border border-[#e2e8f0] rounded-2xl divide-y divide-[#f1f5f9] overflow-hidden">
              {faq.map((f, i) => {
                const on = faqOpen === i;
                return (
                  <div key={f.q}>
                    <div
                      role="button"
                      tabIndex={0}
                      aria-expanded={on}
                      onClick={() => setFaqOpen(on ? null : i)}
                      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), setFaqOpen(on ? null : i))}
                      className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer hover:bg-[#fafbfe] transition-colors"
                    >
                      <span className="text-sm font-bold text-[#0b1c30]">{f.q}</span>
                      <span className="text-lg font-light text-[#5338ec] leading-none w-4 text-center">{on ? '−' : '+'}</span>
                    </div>
                    {on && <p className="px-5 pb-4 -mt-1 text-sm text-[#474556] leading-relaxed">{f.a}</p>}
                  </div>
                );
              })}
            </div>
          </Section>

          {related.length > 0 && (
            <Section id="more" title="More offers for you" refFn={(el) => (sections.current.more = el)}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {related.map((r) => {
                  const rt = THEME[r.type];
                  return (
                    <div key={r.id} onClick={() => onOpen(r)} className="bg-white border border-[#e2e8f0] hover:border-[#5338ec] rounded-2xl overflow-hidden cursor-pointer transition-colors">
                      <div className="relative h-24 p-4 flex flex-col justify-between overflow-hidden" style={{ background: rt.bg, color: rt.ink }}>
                        <span className="text-[10px] font-bold" style={{ color: rt.sub }}>{sourceName(r)}</span>
                        <p className="font-display text-xl font-black leading-none">{r.value}</p>
                      </div>
                      <div className="p-4">
                        <p className="text-sm font-bold text-[#0b1c30] leading-snug line-clamp-2">{r.title}</p>
                        <p className="text-[11px] text-[#94a3b8] font-semibold mt-1.5">{r.startsInDays === 0 ? `Ends in ${r.endsInDays} days` : `Starts in ${r.startsInDays} days`}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Section>
          )}

          <div className="flex items-start gap-3 text-xs text-[#474556] leading-relaxed bg-slate-50 border border-[#e2e8f0] rounded-2xl p-4">
            <ShieldCheck className="w-4 h-4 text-[#5338ec] shrink-0 mt-0.5" />
            <p>
              This page is a sample for preview. Read the provider’s own terms before you deposit or trade.{' '}
              <button onClick={onCompare} className="font-semibold text-[#5338ec] hover:underline">Compare brokers</button>
            </p>
          </div>
        </div>

        {/* Right rail */}
        <aside className="lg:sticky lg:top-[140px] space-y-4">
          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5">
            <p className="text-[11px] font-bold uppercase tracking-wide text-[#94a3b8] mb-1">{live ? 'Available now' : 'Coming soon'}</p>
            <p className="font-display text-2xl font-black text-[#0b1c30] leading-tight">{p.value}</p>
            <p className="text-xs text-[#474556] mb-4">{p.valueNote}</p>
            <button
              onClick={onAct}
              disabled={cta.kind === 'done'}
              className={`w-full text-sm font-bold rounded-xl py-3 transition-colors ${
                cta.kind === 'done' ? 'bg-emerald-50 text-emerald-700 cursor-default'
                : cta.kind === 'take' ? 'bg-[#5338ec] hover:bg-[#4326d8] text-white'
                : cta.kind === 'notifying' ? 'bg-[#EEF0FE] text-[#5338ec]'
                : 'border border-[#5338ec]/40 hover:border-[#5338ec] text-[#5338ec]'
              }`}
            >
              {cta.label}
            </button>
            <p className="text-[11px] text-[#94a3b8] mt-3 text-center">{live ? `Ends ${date(p.endsInDays)}` : `Starts ${date(p.startsInDays)}`}</p>
          </div>

          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5">
            <p className="text-sm font-bold text-[#0b1c30] mb-3">Can you take it?</p>
            <ul className="space-y-3">
              {checks.map((c) => (
                <li key={c.title} className="flex items-start gap-3">
                  <span className={`w-5 h-5 rounded-full text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5 ${c.ok === true ? 'bg-emerald-100 text-emerald-700' : c.ok === false ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-500'}`}>
                    {c.ok === true ? '✓' : c.ok === false ? '✕' : 'i'}
                  </span>
                  <div>
                    <p className="text-xs font-bold text-[#0b1c30]">{c.title}</p>
                    <p className="text-[11px] text-[#474556] leading-snug">{c.text}</p>
                  </div>
                </li>
              ))}
            </ul>
            {!levelOk && <button onClick={onLevelUp} className="mt-4 w-full text-xs font-bold text-[#5338ec] hover:underline">See how to level up</button>}
          </div>
        </aside>
      </div>
    </div>
  );
};

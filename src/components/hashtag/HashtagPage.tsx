import React, { useMemo, useState } from 'react';
import { ArrowLeft, BadgeCheck, MessageCircle, Repeat2, Heart, BarChart2, Search, Clock, Sparkles } from 'lucide-react';
import { Promotion, PROMO_LEVELS } from '../../data/promotionsData';
import { NewsArticle, MarketSignal } from '../../types';
import { InstrumentIcon } from '../analysis/InstrumentIcon';
import { THEME } from '../promotions/promotionArt';
import { HashtagLink, HashtagText } from './HashtagText';
import { openHashtag } from '../../lib/hashtagNav';
import {
  FEATURE_LABEL,
  FeatureKind,
  HashtagItem,
  TRENDING_TAGS,
  featureOf,
  itemsForHashtag,
  prettyTag,
  relatedTags,
  summarize,
} from '../../data/hashtagIndex';

interface HashtagPageProps {
  tag: string;
  onBack: () => void;
  onNavigateToTab: (tab: string) => void;
  onOpenArticle: (article: NewsArticle) => void;
  onOpenSignal: (ticker: string) => void;
  onOpenInstrument: (symbol: string) => void;
  onOpenPromotion: (id: string) => void;
}

type FeedTab = 'all' | FeatureKind;
type Sort = 'top' | 'latest';

const TAB_ORDER: FeedTab[] = ['all', 'post', 'news', 'signal', 'analysis', 'event', 'course', 'offer'];
const WEIGHT: Record<FeatureKind, number> = { post: 1, news: 0.95, signal: 0.9, analysis: 0.85, event: 0.7, course: 0.6, offer: 0.6 };
const COLORS = ['#5338ec', '#0d9488', '#be185d', '#8d6a1f', '#3410D5', '#0b1c30'];
const colorFor = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return COLORS[h % COLORS.length];
};

/** Image when it loads, initials otherwise. Remote avatars can be blocked, so the fallback matters. */
const Avatar: React.FC<{ src?: string; name: string; size?: number }> = ({ src, name, size = 40 }) => {
  const [failed, setFailed] = useState(false);
  const initials = name.replace(/[^A-Za-z ]/g, '').split(/\s+/).filter(Boolean).map((w) => w[0]).join('').slice(0, 2).toUpperCase() || '?';
  if (src && !failed) {
    return <img src={src} alt="" onError={() => setFailed(true)} className="rounded-full object-cover shrink-0 border border-slate-200" style={{ width: size, height: size }} />;
  }
  return (
    <span className="rounded-full text-white font-bold flex items-center justify-center shrink-0" style={{ width: size, height: size, background: colorFor(name), fontSize: size * 0.36 }}>
      {initials}
    </span>
  );
};

const Stat: React.FC<{ icon: React.ElementType; value: string | number }> = ({ icon: Icon, value }) => (
  <span className="flex items-center gap-1.5 text-xs text-[#6b7686]">
    <Icon className="w-4 h-4" />
    {value}
  </span>
);

const fmtN = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K` : String(n));
const when = (iso: string) => new Date(iso).toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Bangkok' });

/** Tweet-style shell: avatar on the left, header, body, and an optional thread under it. */
const Tweet: React.FC<{
  avatar: React.ReactNode;
  name: string;
  handle?: string;
  verified?: boolean;
  time?: string;
  label: string;
  onClick?: () => void;
  children: React.ReactNode;
  thread?: React.ReactNode;
}> = ({ avatar, name, handle, verified, time, label, onClick, children, thread }) => (
  <article onClick={onClick} className={`px-4 pt-4 pb-3 border-b border-[#e8ebf0] hover:bg-[#fafbfe] transition-colors ${onClick ? 'cursor-pointer' : ''}`}>
    <div className="flex gap-3">
      <div className="flex flex-col items-center shrink-0">
        {avatar}
        {thread && <div className="w-0.5 flex-1 bg-[#e2e8f0] mt-2 rounded-full" />}
      </div>
      <div className="min-w-0 flex-1 pb-1">
        <div className="flex items-center flex-wrap gap-x-1.5 text-sm">
          <span className="font-bold text-[#0b1c30] truncate">{name}</span>
          {verified && <BadgeCheck className="w-4 h-4 text-sky-500 shrink-0" />}
          {handle && <span className="text-[#6b7686] truncate">@{handle.replace(/^@/, '')}</span>}
          {time && <span className="text-[#6b7686]">· {time}</span>}
          <span className="ml-auto text-[10px] font-bold uppercase tracking-wide text-[#5338ec] bg-[#EEF0FE] px-2 py-0.5 rounded-full">{label}</span>
        </div>
        {children}
      </div>
    </div>
    {thread}
  </article>
);

const Reply: React.FC<{ name: string; avatar?: string; time: string; text: string; last: boolean }> = ({ name, avatar, time, text, last }) => (
  <div className="flex gap-3 mt-1">
    <div className="flex flex-col items-center shrink-0 w-10">
      <Avatar src={avatar} name={name} size={28} />
      {!last && <div className="w-0.5 flex-1 bg-[#e2e8f0] mt-1.5 rounded-full" />}
    </div>
    <div className="min-w-0 flex-1 pb-3">
      <p className="text-sm">
        <span className="font-bold text-[#0b1c30]">{name}</span> <span className="text-[#6b7686]">· {time}</span>
      </p>
      <p className="text-sm text-[#0b1c30] leading-relaxed"><HashtagText text={text} /></p>
    </div>
  </div>
);

export const HashtagPage: React.FC<HashtagPageProps> = ({ tag, onBack, onNavigateToTab, onOpenArticle, onOpenSignal, onOpenInstrument, onOpenPromotion }) => {
  const [tab, setTab] = useState<FeedTab>('all');
  const [sort, setSort] = useState<Sort>('top');
  const [query, setQuery] = useState('');

  const items = useMemo(() => itemsForHashtag(tag), [tag]);
  const summary = useMemo(() => summarize(tag, items), [tag, items]);
  const related = useMemo(() => relatedTags(tag, items), [tag, items]);
  const name = prettyTag(tag);

  const feed = useMemo(() => {
    const maxBy: Partial<Record<FeatureKind, number>> = {};
    items.forEach((i) => {
      const k = featureOf(i);
      maxBy[k] = Math.max(maxBy[k] ?? 1, i.score);
    });
    const rank = (i: HashtagItem) => (i.score / (maxBy[featureOf(i)] || 1)) * WEIGHT[featureOf(i)];
    const list = items.filter((i) => tab === 'all' || featureOf(i) === tab);
    return [...list].sort((a, b) => (sort === 'latest' ? a.age - b.age : rank(b) - rank(a)));
  }, [items, tab, sort]);

  const tabLabel = (t: FeedTab) => (t === 'all' ? 'All' : FEATURE_LABEL[t]);
  const tabCount = (t: FeedTab) => (t === 'all' ? items.length : summary.counts[t]);
  const sentimentPct = summary.bullishPct;

  const renderItem = (i: HashtagItem) => {
    if (i.kind === 'post') {
      const p = i.post;
      const replies = (p.comments || []).slice(0, 2);
      return (
        <Tweet
          key={i.id}
          avatar={<Avatar src={p.author.avatar} name={p.author.name} />}
          name={p.author.name}
          handle={p.author.handle}
          verified={p.author.verified}
          time={p.timestamp}
          label="Community"
          onClick={() => onNavigateToTab('community')}
          thread={
            replies.length > 0 && (
              <div className="pl-0 mt-1">
                {replies.map((r, idx) => (
                  <Reply key={r.id} name={r.author} avatar={r.avatar} time={r.time} text={r.text} last={idx === replies.length - 1 && p.commentsCount <= replies.length} />
                ))}
                {p.commentsCount > replies.length && <p className="ml-[52px] pb-2 text-sm font-semibold text-[#5338ec]">Show {p.commentsCount - replies.length} more replies</p>}
              </div>
            )
          }
        >
          {p.title && <p className="text-[15px] font-bold text-[#0b1c30] mt-1 leading-snug">{p.title}</p>}
          <p className="text-[15px] text-[#0b1c30] mt-1 leading-relaxed whitespace-pre-line line-clamp-6"><HashtagText text={p.content} /></p>
          {p.tokenMentions && p.tokenMentions.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {p.tokenMentions.slice(0, 3).map((t) => (
                <span key={t.symbol} className="text-xs font-semibold bg-slate-100 rounded-full px-2.5 py-1">
                  ${t.symbol} <span className={t.change >= 0 ? 'text-emerald-600' : 'text-rose-600'}>{t.change >= 0 ? '+' : ''}{t.change}%</span>
                </span>
              ))}
            </div>
          )}
          <div className="flex items-center justify-between max-w-sm mt-3">
            <Stat icon={MessageCircle} value={p.commentsCount} />
            <Stat icon={Repeat2} value={p.repostsCount ?? 0} />
            <Stat icon={Heart} value={fmtN(p.likes)} />
            <Stat icon={BarChart2} value={p.viewsCount ?? '—'} />
          </div>
        </Tweet>
      );
    }
    if (i.kind === 'trending') {
      const p = i.post;
      return (
        <Tweet key={i.id} avatar={<Avatar src={p.authorAvatar} name={p.authorName} />} name={p.authorName} handle={p.authorHandle} verified={p.verified} time={p.timeAgo} label="Community" onClick={() => onNavigateToTab('community')}>
          <p className="text-[15px] font-bold text-[#0b1c30] mt-1 leading-snug">{p.title}</p>
          <p className="text-[15px] text-[#0b1c30] mt-1 leading-relaxed line-clamp-5"><HashtagText text={p.body} /></p>
          {p.hashtags && (
            <div className="flex flex-wrap gap-x-3 mt-2">
              {p.hashtags.map((h) => <HashtagLink key={h} tag={h} className="text-sm font-semibold text-[#5338ec]" />)}
            </div>
          )}
          <div className="flex items-center gap-4 mt-3 text-xs text-[#6b7686]">
            <span>Influence <b className="text-[#0b1c30]">{p.influenceScore}</b></span>
            <span>Predict <b className="text-[#0b1c30]">{p.predictPrecision}%</b></span>
            {p.pollAgreePct !== undefined && <span>Poll <b className="text-[#0b1c30]">{p.pollAgreePct}% agree</b></span>}
          </div>
        </Tweet>
      );
    }
    if (i.kind === 'news') {
      const a = i.article;
      return (
        <Tweet key={i.id} avatar={<Avatar src={a.sourceAvatar} name={a.source} />} name={a.source} verified time={a.timestamp} label="News" onClick={() => onOpenArticle(a)}>
          <p className="text-[15px] font-bold text-[#0b1c30] mt-1 leading-snug">{a.headline}</p>
          <p className="text-sm text-[#474556] mt-1 leading-relaxed line-clamp-3">{a.excerpt}</p>
          <div className="mt-3 border border-[#e2e8f0] rounded-2xl overflow-hidden flex">
            <img src={a.thumbnail} alt="" className="w-28 h-24 object-cover shrink-0" />
            <div className="p-3 min-w-0">
              <p className="text-xs text-[#6b7686]">{a.assetClass} · {a.readTime}</p>
              <p className={`text-xs font-bold mt-1 ${a.sentiment === 'Bullish' ? 'text-emerald-600' : a.sentiment === 'Bearish' ? 'text-rose-600' : 'text-slate-500'}`}>{a.sentiment}</p>
              <p className="text-xs text-[#6b7686] mt-1 truncate">{a.tags.map((t) => `#${t.replace(/\s+/g, '')}`).join('  ')}</p>
            </div>
          </div>
          <div className="flex items-center gap-6 mt-3">
            <Stat icon={MessageCircle} value={a.commentsCount} />
            <Stat icon={Heart} value={fmtN(a.claps)} />
          </div>
        </Tweet>
      );
    }
    if (i.kind === 'signal') {
      const s: MarketSignal = i.signal;
      const buy = s.action === 'BUY';
      return (
        <Tweet key={i.id} avatar={<Avatar name="MarketSyde" />} name="MarketSyde Signals" verified time={s.timestamp} label="Signal" onClick={() => onOpenSignal(s.ticker)}>
          <div className="mt-2 border border-[#e2e8f0] rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <p className="text-base font-bold text-[#0b1c30]"><span className="mr-2">{s.flag.split('/')[0]}</span>{s.ticker}</p>
              <span className={`text-xs font-black px-3 py-1 rounded-full ${buy ? 'bg-[#CAEB0E] text-slate-900' : 'bg-[#5945F1] text-white'}`}>{buy ? 'BUY' : 'SELL'}</span>
            </div>
            <p className="text-xs text-[#6b7686] mt-1">{s.timeframe} · {s.confidence}% confidence · R:R {s.riskReward}</p>
            <div className="grid grid-cols-3 gap-2 mt-3 text-center">
              {[['Entry', s.entryPrice], ['Target', s.takeProfit1], ['Stop', s.stopLoss]].map(([k, v]) => (
                <div key={String(k)} className="bg-slate-50 rounded-xl py-2"><p className="text-[10px] text-[#6b7686]">{k}</p><p className="text-sm font-bold font-mono">{v}</p></div>
              ))}
            </div>
          </div>
        </Tweet>
      );
    }
    if (i.kind === 'analysis') {
      const r = i.row;
      const up = r.change >= 0;
      return (
        <Tweet key={i.id} avatar={<Avatar name="Analysis" />} name="Instrument Analysis" verified label="Analysis" onClick={() => onOpenInstrument(r.symbol)}>
          <div className="mt-2 border border-[#e2e8f0] rounded-2xl p-4 flex items-center gap-4">
            <InstrumentIcon iconType={r.iconType} name={r.name} className="w-11 h-11" />
            <div className="min-w-0 flex-1">
              <p className="text-base font-bold text-[#0b1c30]">{r.name} <span className="text-sm font-medium text-[#6b7686]">{r.symbol}</span></p>
              <p className="text-xs text-[#6b7686] mt-0.5">1M {r.return1M >= 0 ? '+' : ''}{r.return1M}% · RSI {r.rsi} · Cap {r.marketCap}</p>
            </div>
            <div className="text-right">
              <p className="text-base font-bold font-mono text-[#0b1c30]">${r.price.toLocaleString(undefined, { minimumFractionDigits: r.decimals, maximumFractionDigits: r.decimals })}</p>
              <p className={`text-xs font-bold ${up ? 'text-emerald-600' : 'text-rose-600'}`}>{up ? '▲' : '▼'} {Math.abs(r.change).toFixed(2)}%</p>
            </div>
          </div>
        </Tweet>
      );
    }
    if (i.kind === 'event') {
      const e = i.event;
      return (
        <Tweet key={i.id} avatar={<Avatar name="Calendar" />} name="Economic Calendar" verified label="Calendar" onClick={() => onNavigateToTab('economic-calendar')}>
          <div className="mt-2 border border-[#e2e8f0] rounded-2xl p-4">
            <p className="text-base font-bold text-[#0b1c30]"><span className="mr-2">{e.countryFlag}</span>{e.title}</p>
            <p className="text-xs text-[#6b7686] mt-1 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {when(e.at)} · {e.currency}</p>
            <div className="flex items-center gap-4 mt-3 text-xs text-[#6b7686]">
              <span className={`font-bold ${e.impact === 'High' ? 'text-rose-600' : e.impact === 'Medium' ? 'text-amber-600' : 'text-slate-500'}`}>{e.impact} impact</span>
              {e.forecast && <span>Forecast <b className="text-[#0b1c30]">{e.forecast}</b></span>}
              {e.previous && <span>Previous <b className="text-[#0b1c30]">{e.previous}</b></span>}
            </div>
          </div>
        </Tweet>
      );
    }
    if (i.kind === 'course') {
      const c = i.course;
      return (
        <Tweet key={i.id} avatar={<Avatar src={c.instructorAvatar} name={c.instructorName} />} name={c.instructorName} label="Learn" onClick={() => onNavigateToTab('education-hub')}>
          <div className="mt-2 border border-[#e2e8f0] rounded-2xl overflow-hidden flex">
            <img src={c.thumbnail} alt="" className="w-28 h-24 object-cover shrink-0" />
            <div className="p-3 min-w-0">
              <p className="text-sm font-bold text-[#0b1c30] leading-snug line-clamp-2">{c.title}</p>
              <p className="text-xs text-[#6b7686] mt-1">{c.level} · {c.lessons.length} lessons · +{c.pointsReward} pts</p>
            </div>
          </div>
        </Tweet>
      );
    }
    const p: Promotion = i.promo;
    const t = THEME[p.type];
    return (
      <Tweet key={i.id} avatar={<Avatar name={p.brokerName} />} name={p.brokerName} label="Offer" time={`Ends in ${p.endsInDays}d`} onClick={() => onOpenPromotion(p.id)}>
        <div className="mt-2 rounded-2xl overflow-hidden flex items-stretch" style={{ background: t.bg, color: t.ink }}>
          <div className="p-4 flex-1 min-w-0">
            <p className="text-[11px] font-semibold" style={{ color: t.sub }}>{p.kind} · Lv.{p.minLevel} {PROMO_LEVELS[p.minLevel]}</p>
            <p className="font-display text-2xl font-black leading-none mt-1">{p.value}</p>
            <p className="text-xs mt-1" style={{ color: t.sub }}>{p.valueNote}</p>
          </div>
        </div>
        <p className="text-sm font-bold text-[#0b1c30] mt-2">{p.title}</p>
      </Tweet>
    );
  };

  return (
    <div className="w-full max-w-[1080px] mx-auto px-0 sm:px-6 py-0 sm:py-6 pb-24">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,640px)_320px] gap-6 justify-center items-start">
        {/* ───────── Timeline ───────── */}
        <div className="bg-white sm:border border-[#e2e8f0] sm:rounded-2xl overflow-clip">
          <div className="sticky top-[68px] z-20 bg-white border-b border-[#e8ebf0] px-4 py-2.5 flex items-center gap-4">
            <button onClick={onBack} aria-label="Back" className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors"><ArrowLeft className="w-5 h-5 text-[#0b1c30]" /></button>
            <div className="min-w-0">
              <h1 className="text-lg font-bold text-[#0b1c30] leading-tight truncate">#{name}</h1>
              <p className="text-xs text-[#6b7686]">{summary.total} {summary.total === 1 ? 'item' : 'items'} across {summary.features} {summary.features === 1 ? 'feature' : 'features'}</p>
            </div>
          </div>

          {/* Summary */}
          <section className="px-4 py-5 border-b border-[#e8ebf0] bg-[#fbfbff]">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-[#5338ec]" />
              <h2 className="text-sm font-bold text-[#0b1c30]">Summary of #{name}</h2>
            </div>
            <p className="text-[15px] text-[#0b1c30] leading-relaxed">{summary.text}</p>

            {sentimentPct !== null && (
              <div className="mt-4">
                <div className="flex justify-between text-[11px] font-semibold mb-1">
                  <span className="text-emerald-600">Bullish {sentimentPct}%</span>
                  <span className="text-rose-600">Bearish {100 - sentimentPct}%</span>
                </div>
                <div className="flex h-2 rounded-full overflow-hidden bg-slate-100">
                  <div className="bg-emerald-400" style={{ width: `${sentimentPct}%` }} />
                  <div className="bg-rose-400" style={{ width: `${100 - sentimentPct}%` }} />
                </div>
              </div>
            )}

            {summary.instrument && (
              <div className="mt-4 flex items-center gap-3 bg-white border border-[#e2e8f0] rounded-xl px-4 py-3">
                <InstrumentIcon iconType={summary.instrument.iconType} name={summary.instrument.name} className="w-9 h-9" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#0b1c30]">{summary.instrument.name}</p>
                  <p className="text-[11px] text-[#6b7686]">RSI {summary.instrument.rsi} · 1M {summary.instrument.return1M >= 0 ? '+' : ''}{summary.instrument.return1M}%</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold font-mono">${summary.instrument.price.toLocaleString(undefined, { minimumFractionDigits: summary.instrument.decimals, maximumFractionDigits: summary.instrument.decimals })}</p>
                  <p className={`text-xs font-bold ${summary.instrument.change >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{summary.instrument.change >= 0 ? '+' : ''}{summary.instrument.change.toFixed(2)}%</p>
                </div>
              </div>
            )}

            {summary.points.length > 0 && (
              <ul className="mt-4 space-y-1.5">
                {summary.points.map((pt) => (
                  <li key={pt} className="flex items-start gap-2 text-sm text-[#0b1c30] leading-relaxed"><span className="text-[#5338ec] mt-1">•</span>{pt}</li>
                ))}
              </ul>
            )}
            <p className="text-[11px] text-[#94a3b8] mt-4">Built from the items below. It describes what is on MarketSyde, it is not a forecast or advice.</p>
          </section>

          {/* Tabs */}
          <div className="sticky top-[128px] z-10 bg-white border-b border-[#e8ebf0]">
            <div className="flex overflow-x-auto scrollbar-none">
              {TAB_ORDER.map((t) => {
                const n = tabCount(t);
                return (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    disabled={n === 0 && t !== 'all'}
                    className={`relative shrink-0 px-4 py-3 text-sm font-bold transition-colors disabled:opacity-35 disabled:cursor-not-allowed ${tab === t ? 'text-[#0b1c30]' : 'text-[#6b7686] hover:bg-slate-50'}`}
                  >
                    {tabLabel(t)} <span className="font-mono text-xs opacity-70">{n}</span>
                    {tab === t && <span className="absolute left-3 right-3 bottom-0 h-1 rounded-full bg-[#5338ec]" />}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-2 px-4 py-2 border-t border-[#f1f5f9] text-xs">
              <span className="text-[#6b7686]">Sort</span>
              {(['top', 'latest'] as Sort[]).map((s) => (
                <button key={s} onClick={() => setSort(s)} className={`px-3 py-1 rounded-full font-bold transition-colors ${sort === s ? 'bg-[#0b1c30] text-white' : 'bg-slate-100 text-[#474556] hover:bg-slate-200'}`}>
                  {s === 'top' ? 'Top' : 'Latest'}
                </button>
              ))}
            </div>
          </div>

          {/* Feed */}
          <div>
            {feed.map(renderItem)}
            {feed.length === 0 && (
              <div className="py-16 px-6 text-center">
                <p className="text-lg font-bold text-[#0b1c30]">Nothing for #{name} yet</p>
                <p className="text-sm text-[#474556] mt-1">Try one of these instead.</p>
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  {TRENDING_TAGS.slice(0, 6).map((t) => <HashtagLink key={t} tag={t} className="px-3 py-1.5 rounded-full bg-[#EEF0FE] text-sm font-semibold text-[#5338ec]" />)}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ───────── Right rail ───────── */}
        <aside className="hidden lg:block lg:sticky lg:top-[88px] space-y-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (query.trim()) {
                openHashtag(query.trim());
                setQuery('');
              }
            }}
            className="relative"
          >
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search a hashtag, e.g. #gold" className="w-full bg-slate-100 focus:bg-white border border-transparent focus:border-[#5338ec] rounded-full pl-10 pr-4 py-2.5 text-sm focus:outline-none" />
          </form>

          {related.length > 0 && (
            <div className="bg-slate-50 rounded-2xl overflow-hidden">
              <h3 className="text-lg font-bold text-[#0b1c30] px-4 pt-4 pb-2">Related hashtags</h3>
              {related.map((r) => (
                <div key={r.tag} role="link" tabIndex={0} onClick={() => openHashtag(r.tag)} onKeyDown={(e) => e.key === 'Enter' && openHashtag(r.tag)} className="px-4 py-2.5 hover:bg-slate-100 cursor-pointer transition-colors">
                  <p className="text-sm font-bold text-[#0b1c30]">#{r.tag}</p>
                  <p className="text-xs text-[#6b7686]">{r.count} {r.count === 1 ? 'item' : 'items'} alongside #{name}</p>
                </div>
              ))}
            </div>
          )}

          <div className="bg-slate-50 rounded-2xl overflow-hidden">
            <h3 className="text-lg font-bold text-[#0b1c30] px-4 pt-4 pb-2">Trending now</h3>
            {TRENDING_TAGS.filter((t) => t.toLowerCase() !== tag.toLowerCase()).slice(0, 6).map((t, idx) => (
              <div key={t} role="link" tabIndex={0} onClick={() => openHashtag(t)} onKeyDown={(e) => e.key === 'Enter' && openHashtag(t)} className="px-4 py-2.5 hover:bg-slate-100 cursor-pointer transition-colors">
                <p className="text-[11px] text-[#6b7686]">{idx + 1} · Trending in markets</p>
                <p className="text-sm font-bold text-[#0b1c30]">#{t}</p>
                <p className="text-xs text-[#6b7686]">{itemsForHashtag(t).length} items</p>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
};

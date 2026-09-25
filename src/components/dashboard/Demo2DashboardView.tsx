import React, { useRef, useState } from 'react';
import { ExternalLink, Camera, Check, ArrowRight, ArrowUpRight, Gem, Bookmark, Link2, Heart, MessageCircle, Share2, UserPlus, Hash, Landmark, CandlestickChart, Wallet2, Lock, ChevronDown, X, Star, ThumbsDown, MoreHorizontal, Repeat2 } from 'lucide-react';
import { UserProfile, MarketSignal, Broker, Mission, QuickStep } from '../../types';
import { InstrumentAnalysisWidget } from './InstrumentAnalysisWidget';
import { MissionCardWidget } from './MissionCardWidget';
import { SAMPLE_COMMUNITY_POSTS } from './CommunityWidget';
import { PromotionWidget } from './PromotionWidget';
import { BorderBeam } from '../ui/BorderBeam';
import { TabSub } from '../common/TabSub';
import { COMMUNITY_ARTICLES, TOP_INFLUENCERS, OTHER_INFLUENCERS } from '../../data/communityData';
import { getNextTierInfo, LEVEL_SCENARIOS, LevelScenarioId } from '../../data/levelScenarios';
import { useTone } from '../../context/ToneContext';

/**
 * Published artifacts block remote images entirely (CSP allows no external
 * <img> sources), so any avatar/photo coming from an external CDN URL
 * (unsplash.com, cdn.21st.dev, etc.) renders broken once published. These
 * helpers generate self-contained SVG data URIs instead — deterministic
 * per person/post so the same "mock person" always gets the same look.
 */
const MOCK_AVATAR_PALETTE = ['#5945F1', '#FD02B0', '#16A34A', '#F59E0B', '#0EA5E9', '#A855F7', '#EF4444', '#14B8A6'];

function hashSeed(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Deterministic "mock person" avatar — colored circle with initials. */
function mockAvatar(name: string, seed?: string): string {
  const key = seed ?? name;
  const color = MOCK_AVATAR_PALETTE[hashSeed(key) % MOCK_AVATAR_PALETTE.length];
  const initials = getInitials(name);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" rx="40" fill="${color}"/><text x="40" y="41" text-anchor="middle" dominant-baseline="central" font-family="Arial, sans-serif" font-size="28" font-weight="700" fill="white">${initials}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/** Deterministic "mock content photo" — soft gradient rectangle, no external asset needed. */
function mockContentImage(seed: string): string {
  const h = hashSeed(seed);
  const color1 = MOCK_AVATAR_PALETTE[h % MOCK_AVATAR_PALETTE.length];
  const color2 = MOCK_AVATAR_PALETTE[(h + 3) % MOCK_AVATAR_PALETTE.length];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 240"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${color1}"/><stop offset="100%" stop-color="${color2}"/></linearGradient></defs><rect width="400" height="240" fill="url(#g)"/><g opacity="0.35" stroke="white" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M30 180 L110 120 L170 150 L240 70 L330 100"/></g></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Ghost mascot icon for Lv.1 "Rookie" — duplicated locally from
 * CustomizableWidgets.tsx (TierMascotIcon/RookieGhostIcon aren't exported).
 */
function RookieGhostIcon() {
  return (
    <div className="w-12 h-14 sm:w-14 sm:h-16 flex items-center justify-center shrink-0">
      <svg viewBox="0 0 70 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-xs">
        <path
          d="M 12 40 C 12 18, 22 8, 35 8 C 48 8, 58 18, 58 40 L 58 64 C 58 68, 54 70, 50 67 C 46 64, 43 64, 40 68 C 37 72, 33 72, 30 68 C 27 64, 24 64, 20 67 C 16 70, 12 68, 12 64 Z"
          stroke="white"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <ellipse cx="27" cy="34" rx="3" ry="5" fill="white" />
        <ellipse cx="43" cy="34" rx="3" ry="5" fill="white" />
      </svg>
    </div>
  );
}

/**
 * Tier mascot icon supporting Rookie (Lv.1) through Boss (Lv.4) — same
 * asset used on the real /dashboard's "Your Level" widget.
 */
function TierMascotIcon({ tierLevel = 1 }: { tierLevel?: number }) {
  if (tierLevel === 4) {
    return (
      <div className="w-12 h-14 sm:w-14 sm:h-16 flex items-center justify-center shrink-0">
        <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-xs" fill="none" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M 20 85 L 20 44 L 38 62 L 50 30 L 62 62 L 80 44 L 80 85 Z" fill="none" />
          <line x1="20" y1="94" x2="80" y2="94" strokeWidth="6" />
          <circle cx="20" cy="40" r="4" fill="white" stroke="none" />
          <circle cx="50" cy="26" r="4" fill="white" stroke="none" />
          <circle cx="80" cy="40" r="4" fill="white" stroke="none" />
        </svg>
      </div>
    );
  }
  if (tierLevel === 3) {
    return (
      <div className="w-12 h-14 sm:w-14 sm:h-16 flex items-center justify-center shrink-0">
        <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-xs" fill="none" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="55,16 28,60 50,60 45,104 74,54 52,54" fill="none" stroke="white" strokeWidth="5" />
          <circle cx="76" cy="30" r="4" fill="#CAEB0E" stroke="none" />
          <circle cx="24" cy="85" r="4" fill="#CAEB0E" stroke="none" />
        </svg>
      </div>
    );
  }
  if (tierLevel === 2) {
    return (
      <div className="w-12 h-14 sm:w-14 sm:h-16 flex items-center justify-center shrink-0">
        <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-xs" fill="none" stroke="white" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round">
          <g transform="translate(14, 16)">
            <rect x="8" y="10" width="18" height="30" rx="9" fill="none" stroke="white" strokeWidth="4.5" />
            <rect x="10" y="46" width="14" height="14" rx="7" fill="none" stroke="white" strokeWidth="4.5" />
            <rect x="36" y="20" width="18" height="30" rx="9" fill="none" stroke="white" strokeWidth="4.5" />
            <rect x="38" y="56" width="14" height="14" rx="7" fill="none" stroke="white" strokeWidth="4.5" />
          </g>
        </svg>
      </div>
    );
  }
  return <RookieGhostIcon />;
}

/**
 * Crisp vector wallet icon for Cumulative Cashback — same asset used on the
 * real /dashboard (DemoDashboardView's LimeWalletIcon), duplicated locally
 * since it isn't exported from that file.
 */
function LimeWalletIcon({ className = 'w-10 h-10' }: { className?: string }) {
  return (
    <div className={`${className} shrink-0 flex items-center justify-center`}>
      <svg viewBox="0 0 44 44" fill="none" className="w-full h-full">
        <path
          d="M 13 10 L 31 10 C 32.5 10 33.5 11 33.5 12.5 L 33.5 15 L 10.5 15 L 10.5 12.5 C 10.5 11 11.5 10 13 10 Z"
          fill="#D9F99D"
          stroke="#84CC16"
          strokeWidth="2"
        />
        <rect x="6" y="14" width="32" height="24" rx="6" fill="#F7FEE7" stroke="#84CC16" strokeWidth="2.4" />
        <path
          d="M 26 21 L 38 21 C 39 21 40 22 40 23 L 40 29 C 40 30 39 31 38 31 L 26 31 C 23.5 31 22 29.5 22 26 C 22 22.5 23.5 21 26 21 Z"
          fill="#BEF226"
          stroke="#84CC16"
          strokeWidth="2"
        />
        <circle cx="28.5" cy="26" r="2" fill="#4D7C0F" />
      </svg>
    </div>
  );
}

/**
 * Follow-stat card — ported from the shared PaymentSummaryCard pattern
 * (title + big amount + an interactive sub-card with an avatar stack),
 * re-themed with this app's own tokens instead of shadcn/ui's bg-card /
 * text-muted-foreground / bg-primary variables.
 */
interface FollowPreviewPerson {
  id: string;
  avatar: string;
  name: string;
}

interface FollowStatCardProps {
  title: string;
  amount: number;
  subCardTitle: string;
  subCardSubtitle: string;
  people: FollowPreviewPerson[];
  moreCount?: number;
  onSubCardClick?: () => void;
}

function FollowStatCard({
  title,
  amount,
  subCardTitle,
  subCardSubtitle,
  people,
  moreCount = 0,
  onSubCardClick,
}: FollowStatCardProps) {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if ((event.key === 'Enter' || event.key === ' ') && onSubCardClick) {
      event.preventDefault();
      onSubCardClick();
    }
  };

  return (
    <div className="w-full h-full flex flex-col rounded-2xl bg-white border border-slate-100 p-5 sm:p-6 shadow-2xs">
      <h2 className="text-sm font-medium text-slate-500">{title}</h2>
      <p className="mt-2 text-4xl sm:text-5xl font-bold tracking-tight text-[#0b1c30]">
        {amount.toLocaleString()}
      </p>

      <div
        role="button"
        tabIndex={0}
        onClick={onSubCardClick}
        onKeyDown={handleKeyDown}
        className="group mt-auto pt-6 cursor-pointer"
      >
        <div className="rounded-xl bg-slate-50 hover:bg-slate-100 p-4 transition-all duration-300 ease-in-out hover:shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-semibold text-[#0b1c30]">{subCardTitle}</p>
              <p className="text-sm text-slate-500">{subCardSubtitle}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-2xs transition-transform duration-300 group-hover:scale-110 shrink-0">
              <ArrowUpRight className="h-5 w-5 text-slate-500" />
            </div>
          </div>

          {/* Avatar Stack */}
          <div className="mt-4 flex items-center">
            {people.map((person, index) => (
              <img
                key={person.id}
                src={person.avatar}
                alt={person.name}
                referrerPolicy="no-referrer"
                className="h-10 w-10 rounded-full border-2 border-white object-cover"
                style={{ marginLeft: index > 0 ? '-12px' : 0 }}
              />
            ))}
            {moreCount > 0 && (
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-[#5945F1] text-sm font-semibold text-white"
                style={{ marginLeft: '-12px' }}
              >
                +{moreCount}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Community post card — light-mode version of the "link preview + stats
 * row" post design (avatar/name/handle/time, bookmark icon, content,
 * a link-preview sub-card, and a Like / Comment / Share stat row split
 * by vertical dividers).
 */
interface LinkPreviewPostCardProps {
  author: string;
  handle: string;
  avatar: string;
  time: string;
  content: string;
  linkTitle: string;
  linkSubtitle: string;
  likes: number;
  comments: number;
  shares: number;
  onClick?: () => void;
}

const LinkPreviewPostCard: React.FC<LinkPreviewPostCardProps> = ({
  author,
  handle,
  avatar,
  time,
  content,
  linkTitle,
  linkSubtitle,
  likes,
  comments,
  shares,
  onClick,
}) => {
  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-5 sm:p-6 hover:border-slate-300 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={avatar}
            alt={author}
            referrerPolicy="no-referrer"
            className="w-11 h-11 rounded-full object-cover shrink-0"
          />
          <div className="min-w-0">
            <div className="font-bold text-[#0b1c30] truncate">{author}</div>
            <div className="text-sm text-slate-500 truncate">
              @{handle} · {time}
            </div>
          </div>
        </div>
        <button
          onClick={(e) => e.stopPropagation()}
          className="text-slate-400 hover:text-slate-600 transition-colors shrink-0 cursor-pointer"
          title="Save"
        >
          <Bookmark className="w-5 h-5" />
        </button>
      </div>

      <p className="mt-4 text-[15px] leading-relaxed text-[#0b1c30] whitespace-pre-line">{content}</p>

      <button
        onClick={onClick}
        className="w-full mt-4 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 p-4 flex items-center gap-3.5 text-left transition-colors cursor-pointer"
      >
        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
          <Link2 className="w-4.5 h-4.5 text-[#5945F1]" />
        </div>
        <div className="min-w-0">
          <div className="font-bold text-sm text-[#0b1c30] truncate">{linkTitle}</div>
          <div className="text-xs text-slate-500 truncate">{linkSubtitle}</div>
        </div>
      </button>

      <div className="grid grid-cols-3 mt-4 pt-4 border-t border-slate-100 divide-x divide-slate-100">
        <button
          onClick={(e) => e.stopPropagation()}
          className="flex items-center justify-center gap-2 text-slate-500 hover:text-rose-500 text-sm font-medium transition-colors cursor-pointer"
        >
          <Heart className="w-4.5 h-4.5" />
          {likes}
        </button>
        <button onClick={onClick} className="flex items-center justify-center gap-2 text-slate-500 hover:text-[#5945F1] text-sm font-medium transition-colors cursor-pointer">
          <MessageCircle className="w-4.5 h-4.5" />
          {comments}
        </button>
        <button
          onClick={(e) => e.stopPropagation()}
          className="flex items-center justify-center gap-2 text-slate-500 hover:text-emerald-600 text-sm font-medium transition-colors cursor-pointer"
        >
          <Share2 className="w-4.5 h-4.5" />
          {shares}
        </button>
      </div>
    </div>
  );
};

interface MediumStylePostCardProps {
  author: string;
  avatar: string;
  date: string;
  title: string;
  subtitle: string;
  thumbnail?: string;
  claps: string;
  comments: number;
  reposts: number;
  onClick?: () => void;
}

/** Medium-blog-style list row for the "Top Post" tab — avatar+author+date, bold title, subtitle, thumbnail, engagement row. */
const MediumStylePostCard: React.FC<MediumStylePostCardProps> = ({
  author,
  avatar,
  date,
  title,
  subtitle,
  thumbnail,
  claps,
  comments,
  reposts,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className="border-l-2 border-slate-100 hover:border-[#5945F1] pl-4 py-1 transition-colors cursor-pointer group"
    >
      <div className="flex items-center gap-2 mb-2">
        <img src={avatar} alt={author} referrerPolicy="no-referrer" className="w-6 h-6 rounded-full object-cover shrink-0" />
        <span className="text-sm text-slate-700 truncate">{author}</span>
        <span className="text-sm text-slate-400 shrink-0">· {date}</span>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h4 className="font-black text-lg sm:text-xl text-[#0b1c30] leading-snug group-hover:text-[#5945F1] transition-colors">
            {title}
          </h4>
          <p className="text-sm text-slate-500 mt-1.5">{subtitle}</p>
        </div>
        {thumbnail && (
          <img
            src={thumbnail}
            alt=""
            className="w-24 h-16 sm:w-28 sm:h-20 rounded-lg object-cover shrink-0"
          />
        )}
      </div>

      <div className="flex items-center justify-between mt-3.5 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            {claps}
          </span>
          <span className="flex items-center gap-1.5">
            <MessageCircle className="w-3.5 h-3.5" />
            {comments}
          </span>
          <span className="flex items-center gap-1.5">
            <Repeat2 className="w-3.5 h-3.5" />
            {reposts}
          </span>
        </div>
        <div className="flex items-center gap-3 text-slate-300">
          <ThumbsDown
            className="w-4 h-4 hover:text-slate-500 transition-colors cursor-pointer"
            onClick={(e) => e.stopPropagation()}
          />
          <Bookmark
            className="w-4 h-4 hover:text-slate-500 transition-colors cursor-pointer"
            onClick={(e) => e.stopPropagation()}
          />
          <MoreHorizontal
            className="w-4 h-4 hover:text-slate-500 transition-colors cursor-pointer"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </div>
    </div>
  );
};


/**
 * Expanded (non-carousel) mission card — same color-per-theme language as
 * MissionCardWidget, but every mission renders in full, stacked in a list,
 * instead of cycling one at a time.
 */
const MISSION_THEME_BG: Record<Mission['theme'], string> = {
  purple: 'bg-[#5136EE]',
  pink: 'bg-gradient-to-br from-[#FF007A] via-[#E11D74] to-[#B90C5C]',
  lime: 'bg-[#CAEB0E]',
};
const MISSION_THEME_TEXT: Record<Mission['theme'], string> = {
  purple: 'text-white',
  pink: 'text-white',
  lime: 'text-slate-950',
};
const MISSION_THEME_SUBTEXT: Record<Mission['theme'], string> = {
  purple: 'text-white/85',
  pink: 'text-white/85',
  lime: 'text-slate-800',
};
const MISSION_THEME_SUFFIX: Record<Mission['theme'], string> = {
  purple: '#BEF226',
  pink: '#FFDE59',
  lime: '#0F172A',
};

/** Trending hashtags shown atop the News tab — on-brand, MarketSyde-voice placeholders. */
const TRENDING_HASHTAGS = ['GoldBreaksKeyResistance', 'BTCETFInflowSurge', 'FedRateDecisionWatch'];

/** Medium-style blog posts for the "Top Post" tab — title + subtitle, thumbnail, author row, engagement stats. */
const MEDIUM_STYLE_POSTS = [
  {
    id: 'mp1',
    author: 'Sarah Chen',
    date: 'Sep 1',
    title: 'What Should Traders Do While the Signal Updates?',
    subtitle: 'Hint: not open five more chart tabs',
    claps: '6.7K',
    comments: 263,
    reposts: 95,
  },
  {
    id: 'mp2',
    author: 'Marcus Cole',
    date: 'Aug 28',
    title: 'Why Most Retail Traders Get Risk Sizing Wrong',
    subtitle: "It's not about being right more often",
    claps: '4.2K',
    comments: 148,
    reposts: 61,
  },
  {
    id: 'mp3',
    author: 'Elena Ruiz',
    date: 'Aug 24',
    title: 'The Broker Comparison Nobody Tells You About',
    subtitle: 'Spreads are only half the story',
    claps: '3.1K',
    comments: 97,
    reposts: 40,
  },
  {
    id: 'mp4',
    author: 'James Park',
    date: 'Aug 19',
    title: "I Tracked My Cashback for 90 Days. Here's What Happened",
    subtitle: 'The numbers surprised even me',
    claps: '5.9K',
    comments: 211,
    reposts: 84,
  },
];

/**
 * "New to MarketSyde?" FAQ accordion — content mapped to the empty-state
 * (brand-new, nothing connected yet) trader, covering the questions they'd
 * most likely have before taking their first action on the platform.
 */
interface FaqItem {
  q: string;
  a: string;
}

const NEW_TO_MARKETSYDE_FAQS: FaqItem[] = [
  {
    q: 'How do I connect a broker account?',
    a: 'Go to Brokers, pick a partner (XM, HFM, Exness, Pepperstone, IC Markets, or FxPro), and enter your MT4/MT5 account number. It takes under a minute, and tracking starts on your very next trade.',
  },
  {
    q: 'How do I start earning points?',
    a: 'You get +50 for connecting your first broker, +10 to +30 per completed mission, and +5 for every 1.0 lot you trade. Points show up on your Level card instantly.',
  },
  {
    q: 'When does cashback actually get paid?',
    a: "Cashback is calculated per closed trade and moves to your wallet's Available balance within 24 hours. You can withdraw anytime once your balance hits $10.",
  },
  {
    q: "What's the fastest way to level up?",
    a: 'Stack daily missions on top of your normal trading. Most Rookies reach Level 2 (Climber) in under a week just from connecting a broker and clearing 3–4 missions.',
  },
];

/**
 * FAQ accordion card — single-open-at-a-time, chevron rotates on expand.
 * Built locally (couldn't fetch the referenced 21st.dev component — this
 * environment has no web/browser access), following the same "accordion
 * list inside a card" shape that pattern commonly uses.
 */
function NewToMarketSydeFaq({ onClose }: { onClose?: () => void }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="rounded-2xl bg-white border border-slate-200/90 p-5 sm:p-6 shadow-2xs relative">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-bold text-lg text-[#0b1c30]">New to MarketSyde?</h3>
          <p className="text-xs text-slate-500 mt-1 mb-3">Quick answers before you get started.</p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg p-1 -mt-1 -mr-1 shrink-0 cursor-pointer transition-colors"
            title="Dismiss"
            aria-label="Dismiss New to MarketSyde"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="divide-y divide-slate-100">
        {NEW_TO_MARKETSYDE_FAQS.map((item, i) => {
          const isOpen = openIndex === i;
          return (
            <div key={item.q} className="py-3">
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="w-full flex items-center justify-between gap-3 text-left cursor-pointer group"
              >
                <span
                  className={`text-sm font-semibold transition-colors ${
                    isOpen ? 'text-[#5945F1]' : 'text-[#0b1c30] group-hover:text-[#5945F1]'
                  }`}
                >
                  {item.q}
                </span>
                <ChevronDown
                  className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-[#5945F1]' : 'text-slate-400'
                  }`}
                />
              </button>
              {isOpen && (
                <p className="mt-2 text-xs text-slate-500 leading-relaxed pr-6">{item.a}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Icons for the "Get Started" stepper, matched to quickSteps by index (Choose Broker / Link Account / Trade / Earn Cashback). */
const GET_STARTED_STEP_ICONS = [Landmark, Link2, CandlestickChart, Wallet2];

interface ExpandedMissionCardProps {
  mission: Mission;
  onToggleTask: (missionId: string, taskId: string) => void;
  onNavigateToTab?: (tab: string) => void;
}

const ExpandedMissionCard: React.FC<ExpandedMissionCardProps> = ({ mission, onToggleTask, onNavigateToTab }) => {
  const completedCount = mission.tasks.filter((t) => t.completed).length;
  const bg = MISSION_THEME_BG[mission.theme];
  const textColor = MISSION_THEME_TEXT[mission.theme];
  const subTextColor = MISSION_THEME_SUBTEXT[mission.theme];
  const badgeClass = mission.theme === 'lime' ? 'bg-black/10 text-slate-950' : 'bg-black/20 text-white';

  return (
    <div className={`rounded-2xl ${bg} p-4 sm:p-5`}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <h4 className={`font-black text-lg ${textColor} leading-tight`}>
          {mission.title}
          {mission.coloredSuffix && (
            <>
              {' '}
              <span style={{ color: MISSION_THEME_SUFFIX[mission.theme] }}>{mission.coloredSuffix.text}</span>
            </>
          )}
        </h4>
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ${badgeClass}`}>
          {completedCount}/{mission.tasks.length}
        </span>
      </div>
      <p className={`text-xs ${subTextColor} mb-3`}>{mission.subtitle}</p>

      <div className="flex items-center gap-2 flex-wrap mb-4">
        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${badgeClass}`}>
          ⌛ {mission.expiresIn || (mission.isDaily ? 'Daily Reset' : 'Expires in 5 Days')}
        </span>
        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${badgeClass}`}>
          💎 +{mission.rewardPoints} Points
        </span>
        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${badgeClass}`}>
          🪙 +{mission.rewardCredits} Credits
        </span>
      </div>

      <div className="bg-white rounded-xl p-3.5 sm:p-4 space-y-3">
        {mission.tasks.map((task) => (
          <div
            key={task.id}
            onClick={() => onToggleTask(mission.id, task.id)}
            className="flex items-center justify-between gap-3 cursor-pointer group select-none"
          >
            <div className="flex items-center gap-3 min-w-0">
              {task.completed ? (
                <div className="w-5 h-5 rounded-full bg-[#16a34a] text-white flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 stroke-[3.5]" />
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full bg-[#edf2f7] border border-slate-200/80 shrink-0" />
              )}
              <div className="min-w-0">
                <div
                  className={`text-xs sm:text-sm font-semibold truncate ${
                    task.completed ? 'text-[#16a34a]' : 'text-slate-900'
                  }`}
                >
                  {task.title}
                </div>
                <div className="text-[11px] text-slate-400 truncate">{task.description}</div>
              </div>
            </div>
            {!task.completed && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigateToTab?.('points-credits');
                }}
                className="rounded-lg border border-indigo-200 bg-white text-[#5945F1] hover:bg-indigo-50 px-3.5 py-1.5 text-xs font-semibold shadow-2xs transition-colors shrink-0 cursor-pointer"
              >
                {task.actionLabel || 'Go'}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

interface Demo2DashboardViewProps {
  user: UserProfile;
  signals: MarketSignal[];
  brokers: Broker[];
  missions: Mission[];
  onUpdateMissions?: (missions: Mission[]) => void;
  quickSteps: QuickStep[];
  onStepClick?: (index: number) => void;
  onToggleStep?: (index: number) => void;
  onSelectLevelScenario?: (scenarioId: LevelScenarioId) => void;
  onOpenConnectModal?: (broker?: Broker) => void;
  onOpenLedger?: () => void;
  onNavigateToTab?: (tab: string) => void;
  onNavigateToConnectBroker?: (broker?: Broker) => void;
  onSelectSignal?: (signal: MarketSignal) => void;
  onShowToast?: (msg: string) => void;
  /** When true, the "Your Level" card in the stats row is replaced with a Cumulative Cashback card instead. */
  showCashbackInsteadOfLevel?: boolean;
  /** When false, hides the Cumulative Cashback card next to Get Started (e.g. Demo 3, which already shows cashback elsewhere). */
  showCashbackInGetStarted?: boolean;
  /** When true, drops the cover banner and puts a compact profile block beside a smaller Cashback/Followers/Following row (Demo 3). */
  compactProfile?: boolean;
  /** When true, Community sits in a narrower sticky sidebar beside Markets (like a Bybit-style layout), instead of its own full-width row lower down. */
  communityBesideMarkets?: boolean;
  /** When true, "Get Started" renders as a big numbered stepper (active step highlighted) instead of the compact Mission-style checklist. */
  getStartedStepperStyle?: boolean;
}

/**
 * Demo 2 — a Binance-style "home" layout, built primarily from the same
 * widget components used on the real MarketSyde dashboard
 * (InstrumentAnalysisWidget, MissionCardWidget, CommunityWidget,
 * PromotionWidget, ConnectedAccountsCarousel). Only the profile header,
 * onboarding stepper, and balance card are bespoke to this layout — the
 * rest is the same building blocks as /dashboard.
 */
export const Demo2DashboardView: React.FC<Demo2DashboardViewProps> = ({
  user,
  signals,
  brokers,
  missions,
  onUpdateMissions,
  quickSteps: quickStepsProp,
  onStepClick,
  onToggleStep,
  onSelectLevelScenario,
  onOpenConnectModal,
  onOpenLedger,
  onNavigateToTab,
  onNavigateToConnectBroker,
  onSelectSignal,
  onShowToast,
  showCashbackInsteadOfLevel = false,
  showCashbackInGetStarted = true,
  compactProfile = false,
  communityBesideMarkets = false,
  getStartedStepperStyle = false,
}) => {
  const toast = (msg: string) => onShowToast?.(msg);
  const { copy } = useTone();

  const [coverImage, setCoverImage] = useState<string | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [squareTab, setSquareTab] = useState<'post' | 'news'>('post');
  const [showNewToMarketSydeFaq, setShowNewToMarketSydeFaq] = useState(true);

  const handleToggleMissionTask = (missionId: string, taskId: string) => {
    if (!onUpdateMissions) return;
    onUpdateMissions(
      missions.map((m) =>
        m.id !== missionId
          ? m
          : { ...m, tasks: m.tasks.map((t) => (t.id !== taskId ? t : { ...t, completed: !t.completed })) }
      )
    );
  };

  // ─── "Your Level" card data — forced to the empty state (0 points) regardless of mock user data ───
  const currentPoints = 0;
  const maxPoints = user.maxPoints || 100;
  const levelProgressPercent = Math.min(100, Math.max(0, (currentPoints / maxPoints) * 100));
  const nextTierInfo = getNextTierInfo(user.tierLevel || 1, currentPoints);
  const nextLevelText = nextTierInfo.isMaxLevel
    ? 'Max Level Reached'
    : `Next level at ${nextTierInfo.pointsNeeded} Points`;

  // ─── Followers / Following mockup avatar stacks (adapted from the shared PaymentSummaryCard pattern) ───
  const followersPreview = TOP_INFLUENCERS.slice(0, 3).map((p) => ({ ...p, avatar: mockAvatar(p.name, p.id) }));
  const followersMoreCount = Math.max(TOP_INFLUENCERS.length - followersPreview.length, 0);
  const followingPreview = OTHER_INFLUENCERS.slice(0, 3).map((p) => ({ ...p, avatar: mockAvatar(p.name, p.id) }));
  const followingMoreCount = Math.max(OTHER_INFLUENCERS.length - followingPreview.length, 0);

  // Community posts with external photo URLs swapped for generated mock images (see helpers above)
  const mockCommunityPosts = SAMPLE_COMMUNITY_POSTS.map((post) => ({
    ...post,
    avatar: mockAvatar(post.author, post.id),
    image: post.image ? mockContentImage(post.id) : undefined,
  }));

  // Light-mode post cards: same post data, paired with a generic link-preview + share count
  const linkPreviewPosts = mockCommunityPosts.map((post) => ({
    ...post,
    linkTitle: 'View Full Discussion',
    linkSubtitle: `Join the conversation with ${post.author} in Community`,
    shares: Math.max(4, Math.round(post.comments * 0.7)),
  }));

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast('Please choose an image file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setCoverImage(reader.result as string);
      toast('Cover photo updated.');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const getTargetBroker = (brokerName: string) =>
    brokers.find((b) => b.name.toLowerCase() === brokerName.toLowerCase()) || brokers[0];

  const handleConnectBrokerAction = (brokerName: string) => {
    const target = getTargetBroker(brokerName);
    if (onNavigateToConnectBroker) {
      onNavigateToConnectBroker(target);
    } else {
      onOpenConnectModal?.(target);
    }
  };

  // ─── Get Started stepper (real platform steps, shared with /dashboard) ───
  // Get Started always renders in its empty state (no steps pre-completed), regardless of the mock data passed in.
  const quickSteps = quickStepsProp.map((s) => ({ ...s, completed: false }));
  const completedStepsCount = quickSteps.filter((s) => s.completed).length;
  const allStepsDone = completedStepsCount === quickSteps.length;
  const activeStepIndex = quickSteps.findIndex((s) => !s.completed);

  const handleStepRowClick = (index: number) => {
    onToggleStep?.(index);
  };

  const handleStepButtonClick = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onStepClick) {
      onStepClick(index);
    } else {
      toast('This step is coming soon.');
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* ─── TOP GREETING (same ToneContext copy used on the real /dashboard, tone switcher removed) ─── */}
      <div>
        <h1 className="font-display text-2xl sm:text-3xl lg:text-[32px] font-extrabold tracking-tight leading-tight">
          <span>👋 </span>
          <span className="text-[#5945F1]">Welcome, </span>
          <span className="text-[#FD02B0]">{user.username}!</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal">
          {copy.greetingSubtitle(user.username)}
        </p>
      </div>

      {compactProfile ? (
        /* ─── 1. COMPACT PROFILE — no cover banner, profile + Cashback/Followers/Following in one smaller row (Demo 3) ─── */
        <div className="bg-white rounded-3xl border border-slate-100 p-5 sm:p-6">
          <div className="flex flex-col lg:flex-row lg:items-start gap-5">
            {/* Compact profile info */}
            <div className="flex items-center gap-3 lg:w-56 shrink-0">
              <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center overflow-hidden shrink-0">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <span className="text-base font-bold text-[#5945F1]">{user.username?.[0]?.toUpperCase()}</span>
                )}
              </div>
              <div className="min-w-0">
                <div className="font-bold text-base text-[#0b1c30] leading-tight truncate">
                  {user.fullName || user.username}
                </div>
                <button
                  onClick={() => toast('Social account linking is coming soon.')}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#5945F1] bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded-full transition-colors cursor-pointer mt-1"
                >
                  <span>Link Social Account</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </button>
              </div>
            </div>

            <div className="hidden lg:block w-px self-stretch bg-slate-100" />

            {/* Cashback / Points / Credits / Followers / Following — flat inline stats, no boxes (short, grid-aligned) */}
            <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-4">
              <button
                onClick={() => handleConnectBrokerAction(brokers[0]?.name ?? '')}
                className="text-left cursor-pointer group"
              >
                <div className="text-[11px] font-semibold text-slate-400 truncate">{copy.yourCashbackLabel}</div>
                <div className="mt-1 flex items-center gap-1 text-base font-bold text-[#0b1c30] group-hover:text-[#5945F1] transition-colors">
                  $0.00
                  <ChevronDown className="w-3.5 h-3.5 -rotate-90 text-slate-300" />
                </div>
              </button>

              <button
                onClick={() => onNavigateToTab?.('member-plan')}
                className="text-left cursor-pointer group"
              >
                <div className="text-[11px] font-semibold text-slate-400">Points</div>
                <div className="mt-1 flex items-center gap-1 text-base font-bold text-[#0b1c30] group-hover:text-[#5945F1] transition-colors">
                  0
                  <ChevronDown className="w-3.5 h-3.5 -rotate-90 text-slate-300" />
                </div>
              </button>

              <button
                onClick={() => onNavigateToTab?.('points-credits')}
                className="text-left cursor-pointer group"
              >
                <div className="text-[11px] font-semibold text-slate-400">Credits</div>
                <div className="mt-1 flex items-center gap-1 text-base font-bold text-[#0b1c30] group-hover:text-[#5945F1] transition-colors">
                  0
                  <ChevronDown className="w-3.5 h-3.5 -rotate-90 text-slate-300" />
                </div>
              </button>

              <button
                onClick={() => onNavigateToTab?.('community')}
                className="text-left cursor-pointer group"
              >
                <div className="text-[11px] font-semibold text-slate-400">Followers</div>
                <div className="mt-1 flex items-center gap-1 text-base font-bold text-[#0b1c30] group-hover:text-[#5945F1] transition-colors">
                  {user.followersCount ?? 0}
                  <ChevronDown className="w-3.5 h-3.5 -rotate-90 text-slate-300" />
                </div>
              </button>

              <button
                onClick={() => onNavigateToTab?.('community')}
                className="text-left cursor-pointer group"
              >
                <div className="text-[11px] font-semibold text-slate-400">Following</div>
                <div className="mt-1 flex items-center gap-1 text-base font-bold text-[#0b1c30] group-hover:text-[#5945F1] transition-colors">
                  {user.followingCount ?? 0}
                  <ChevronDown className="w-3.5 h-3.5 -rotate-90 text-slate-300" />
                </div>
              </button>
            </div>
          </div>
        </div>
      ) : (
      <>
      {/* ─── 1. PROFILE HEADER — YouTube-style cover banner ─── */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-2xs">
        {/* Cover banner */}
        <div className="relative w-full h-28 sm:h-40 md:h-48 rounded-t-3xl overflow-hidden group/cover">
          {coverImage ? (
            <img src={coverImage} alt="Channel cover" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#5945F1] via-[#6f5cf5] to-[#FD02B0] relative overflow-hidden">
              <div
                className="absolute inset-0 opacity-[0.15]"
                style={{
                  backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                  backgroundSize: '18px 18px',
                }}
              />
            </div>
          )}

          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleCoverChange}
          />
          <button
            onClick={() => coverInputRef.current?.click()}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/35 backdrop-blur-sm text-white text-xs font-semibold opacity-90 sm:opacity-0 sm:group-hover/cover:opacity-100 transition-opacity cursor-pointer hover:bg-black/50"
          >
            <Camera className="w-3.5 h-3.5" />
            Change Cover
          </button>
        </div>

        {/* Profile content — avatar sits just below the banner, no overlap (avoids any clipping) */}
        <div className="px-5 sm:px-6 pb-5 sm:pb-6">
          <div className="flex items-end gap-3.5 pt-4">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white p-1 shrink-0 shadow-md">
              <div className="w-full h-full rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center overflow-hidden">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <span className="text-xl font-bold text-[#5945F1]">{user.username?.[0]?.toUpperCase()}</span>
                )}
              </div>
            </div>
            <div className="pb-1 space-y-1.5">
              <div className="font-bold text-lg text-[#0b1c30] leading-tight">
                {user.fullName || user.username}
              </div>
              <button
                onClick={() => toast('Social account linking is coming soon.')}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#5945F1] bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-full transition-colors cursor-pointer"
              >
                <span>Link Social Account</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div className="mt-5 pt-5 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-4 gap-5 items-stretch">
            {showCashbackInsteadOfLevel ? (
              /* Cumulative Cashback — swapped in for "Your Level" (Demo 3) */
              <div className="sm:col-span-2 h-full flex flex-col justify-center bg-slate-50/70 border border-slate-100 rounded-2xl p-5 relative overflow-hidden">
                <BorderBeam borderWidth={1.8} duration={8} colorFrom="#5945F1" colorTo="#FD02B0" />
                <div className="flex items-start gap-3">
                  <LimeWalletIcon className="w-11 h-11" />
                  <div>
                    <div className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                      {copy.yourCashbackLabel}
                    </div>
                    <div className="text-3xl sm:text-4xl font-black text-[#0b1c30] leading-tight mt-1">
                      $0.00
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5 font-normal">0.0 Lots</div>
                  </div>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed pt-2.5">
                  {copy.yourCashbackEmptyDescription}
                </p>
                <button
                  onClick={() => handleConnectBrokerAction(brokers[0]?.name ?? '')}
                  className="mt-4 self-start inline-flex items-center gap-2 rounded-xl bg-[#5945F1] hover:bg-[#4834e0] text-white text-sm font-bold px-5 py-2.5 shadow-xs transition-all cursor-pointer active:scale-95"
                >
                  {copy.chooseBrokerCta}
                </button>
              </div>
            ) : (
              /* Your Level — leftmost, same widget as the real /dashboard's level-card */
              <div className="sm:col-span-2 h-full flex flex-col justify-between bg-[#5945F1] rounded-2xl p-5 text-white relative overflow-hidden shadow-xs">
                <div className="text-xs font-semibold text-white/80">Your Level</div>

                <div
                  onClick={() => onNavigateToTab?.('member-plan')}
                  className="flex items-center gap-3.5 mt-2 cursor-pointer group"
                  title="View Profile & Account"
                >
                  <TierMascotIcon tierLevel={user.tierLevel || 1} />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-black text-2xl text-white tracking-tight leading-tight group-hover:underline">
                      {user.rankTitle || 'Rookie'}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-white/95 mt-1">
                      <Gem className="w-3.5 h-3.5 text-white shrink-0" />
                      <span>
                        {currentPoints.toLocaleString()}/{maxPoints.toLocaleString()} points.
                      </span>
                    </div>
                  </div>
                </div>

                <div className="w-full bg-white/25 rounded-full h-2 mt-4 mb-2.5 overflow-hidden">
                  <div
                    className="h-full bg-[#FE01B1] rounded-full transition-all duration-300"
                    style={{ width: `${levelProgressPercent}%` }}
                  />
                </div>

                <div className="flex items-center justify-between gap-2 text-xs text-white/90">
                  <span className="font-medium">{nextLevelText}</span>
                  <button
                    onClick={() => onNavigateToTab?.('member-plan')}
                    className="px-4 py-1.5 rounded-full bg-white hover:bg-slate-100 text-[#5945F1] font-bold text-xs shadow-xs transition-all whitespace-nowrap cursor-pointer active:scale-95 shrink-0"
                  >
                    View Plan
                  </button>
                </div>
              </div>
            )}

            {/* Followers — full PaymentSummaryCard-style card */}
            <FollowStatCard
              title="Followers"
              amount={user.followersCount ?? 0}
              subCardTitle="Recent Activity"
              subCardSubtitle="Traders following you"
              people={followersPreview}
              moreCount={followersMoreCount}
              onSubCardClick={() => onNavigateToTab?.('community')}
            />

            {/* Following — full PaymentSummaryCard-style card */}
            <FollowStatCard
              title="Following"
              amount={user.followingCount ?? 0}
              subCardTitle="Suggested for You"
              subCardSubtitle="Traders you might like"
              people={followingPreview}
              moreCount={followingMoreCount}
              onSubCardClick={() => onNavigateToTab?.('community')}
            />
          </div>
        </div>
      </div>
      </>
      )}

      {/* ─── 2. GET STARTED + CUMULATIVE CASHBACK (side by side, one container) ─── */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-2xs p-5 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Get Started */}
          <div className={showCashbackInGetStarted ? 'lg:col-span-8' : 'lg:col-span-12'}>
            <div className="mb-4">
              <h3 className="font-bold text-lg text-[#0b1c30]">Get Started</h3>
              <p className="mt-1 text-sm text-slate-500">
                Complete these steps to unlock full platform access
              </p>
              <div className="mt-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">
                    {allStepsDone ? (
                      <span className="font-semibold text-emerald-600">All done 🎉</span>
                    ) : (
                      <>
                        <span className="font-semibold text-[#0b1c30]">{completedStepsCount}</span>{' '}
                        of {quickSteps.length} completed
                      </>
                    )}
                  </span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${(completedStepsCount / quickSteps.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {getStartedStepperStyle ? (
              /* Big numbered stepper — active step highlighted with an illustration + CTA, others shown small */
              <div>
                <div className="flex items-center gap-2 mb-5">
                  {quickSteps.map((step, index) => (
                    <React.Fragment key={step.step}>
                      <span
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          step.completed
                            ? 'bg-slate-800 text-white'
                            : index === activeStepIndex
                            ? 'bg-[#5945F1] text-white'
                            : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        {step.completed ? <Check className="w-3.5 h-3.5" /> : index + 1}
                      </span>
                      {index < quickSteps.length - 1 && <div className="h-px flex-1 bg-slate-100" />}
                    </React.Fragment>
                  ))}
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                  {quickSteps.map((step, index) => {
                    const StepIcon = GET_STARTED_STEP_ICONS[index] ?? Landmark;
                    const isActive = index === activeStepIndex;

                    if (step.completed) {
                      return (
                        <div
                          key={step.step}
                          className="md:flex-1 rounded-2xl bg-slate-50 border border-slate-100 p-4 flex flex-col justify-between min-h-[180px] opacity-80"
                        >
                          <span className="text-sm font-bold text-slate-400">{step.title}</span>
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400">
                            <Check className="w-3.5 h-3.5" /> Completed
                          </span>
                        </div>
                      );
                    }

                    if (isActive) {
                      return (
                        <div
                          key={step.step}
                          className="md:flex-[2] rounded-2xl border border-indigo-200 bg-indigo-50/40 p-5 flex items-center gap-4 min-h-[180px] relative overflow-hidden"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-[#0b1c30] mb-2">{step.title}</div>
                            <p className="text-xs text-slate-500 leading-relaxed mb-4 max-w-sm">{step.desc}</p>
                            <div className="flex items-center gap-4">
                              <button
                                onClick={(e) => handleStepButtonClick(index, e)}
                                className="px-5 py-2.5 rounded-xl bg-[#5945F1] hover:bg-[#4834e0] text-white text-sm font-bold transition-all cursor-pointer active:scale-95"
                              >
                                {step.actionText}
                              </button>
                              <button
                                onClick={() => toast(step.desc)}
                                className="text-xs font-semibold text-[#5945F1] hover:underline cursor-pointer"
                              >
                                Why is it important?
                              </button>
                            </div>
                          </div>
                          <div className="w-16 h-16 rounded-2xl bg-[#5945F1]/10 flex items-center justify-center shrink-0">
                            <StepIcon className="w-8 h-8 text-[#5945F1] stroke-[1.5]" />
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={step.step}
                        className="md:flex-1 rounded-2xl bg-slate-50 border border-slate-100 p-4 flex flex-col justify-between min-h-[180px] opacity-80"
                      >
                        <span className="text-sm font-bold text-slate-400">{step.title}</span>
                        <Lock className="w-4 h-4 text-slate-300" />
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Compact checklist, matching MissionCardWidget's task-row style */
              <div className="bg-slate-50 rounded-2xl p-4 sm:p-5">
                <div className="space-y-3.5">
                  {quickSteps.map((step, index) => (
                    <div
                      key={step.step}
                      onClick={() => handleStepRowClick(index)}
                      className="flex items-center justify-between gap-4 cursor-pointer group select-none"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        {step.completed ? (
                          <div className="w-5 h-5 rounded-full bg-[#16a34a] text-white flex items-center justify-center shrink-0 shadow-2xs">
                            <Check className="w-3 h-3 stroke-[3.5]" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-[#edf2f7] border border-slate-200/80 group-hover:border-[#5945F1] shrink-0 transition-colors" />
                        )}

                        <div className="min-w-0">
                          <div
                            className={`text-xs sm:text-sm font-semibold truncate ${
                              step.completed
                                ? 'text-[#16a34a]'
                                : 'text-slate-900 group-hover:text-[#5945F1] transition-colors'
                            }`}
                          >
                            {step.title}
                          </div>
                          <div className="text-[11px] sm:text-xs text-slate-400 font-normal mt-0.5 truncate">
                            {step.desc}
                          </div>
                        </div>
                      </div>

                      {!step.completed && (
                        <button
                          type="button"
                          onClick={(e) => handleStepButtonClick(index, e)}
                          className="rounded-lg border border-indigo-200 bg-white text-[#5945F1] hover:bg-indigo-50 px-3.5 py-1.5 text-xs font-semibold shadow-2xs transition-colors shrink-0 cursor-pointer"
                        >
                          {step.actionText}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Choose a Broker — to the right of Get Started, with a broker-logo stack under the CTA */}
          {showCashbackInGetStarted && (
            <div className="lg:col-span-4 rounded-2xl bg-white border border-slate-100 p-6 flex flex-col items-center justify-center text-center h-full min-h-[260px] relative overflow-hidden">
              <BorderBeam borderWidth={1.8} duration={8} colorFrom="#5945F1" colorTo="#FD02B0" />
              <h3 className="font-display font-extrabold text-xl sm:text-[22px] text-[#0b1c30] tracking-tight leading-tight">
                {copy.chooseBrokerTitle}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-[220px] leading-relaxed">
                {copy.chooseBrokerSubtitle}
              </p>
              <button
                onClick={() => handleConnectBrokerAction(brokers[0]?.name ?? '')}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#5945F1] hover:bg-[#4834e0] text-white text-sm font-bold px-6 py-2.5 shadow-xs transition-all cursor-pointer active:scale-95"
              >
                {copy.chooseBrokerCta}
              </button>

              {/* Broker logo stack */}
              <div className="mt-5 flex items-center">
                {brokers.slice(0, 4).map((broker, index) => (
                  <img
                    key={broker.id}
                    src={mockAvatar(broker.name, broker.id)}
                    alt={broker.name}
                    title={broker.name}
                    className="w-9 h-9 rounded-full border-2 border-white shadow-2xs object-cover shrink-0"
                    style={{ marginLeft: index > 0 ? '-10px' : 0 }}
                  />
                ))}
                {brokers.length > 4 && (
                  <div
                    className="flex w-9 h-9 items-center justify-center rounded-full border-2 border-white shadow-2xs bg-white text-[10px] font-bold text-slate-500 shrink-0"
                    style={{ marginLeft: '-10px' }}
                  >
                    +{brokers.length - 4}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── 3. MARKETS + ANNOUNCEMENTS + COMMUNITY/MISSIONS ─── */}
      {(() => {
        const communityBlock = (
          <div className="rounded-2xl bg-white border border-slate-200/90 p-5 sm:p-6 shadow-2xs">
            <div className="flex items-center justify-between gap-3 mb-4">
              <TabSub
                tabs={[
                  { id: 'post', label: 'Top Post' },
                  { id: 'news', label: 'Top News' },
                ]}
                activeTab={squareTab}
                onChange={(id) => setSquareTab(id as 'post' | 'news')}
                size="sm"
              />
              <button
                onClick={() => onNavigateToTab?.('community')}
                className={`inline-flex items-center gap-1.5 rounded-full text-white text-xs font-bold px-4 py-2 shadow-xs transition-all cursor-pointer active:scale-95 shrink-0 ${
                  squareTab === 'news'
                    ? 'bg-[#EC4899] hover:bg-[#DB2777]'
                    : 'bg-[#5945F1] hover:bg-[#4834e0]'
                }`}
              >
                {squareTab === 'news' ? 'Newsroom' : 'Go to Community'}
              </button>
            </div>

            {squareTab === 'post' ? (
              <div className="space-y-5">
                {MEDIUM_STYLE_POSTS.slice(0, communityBesideMarkets ? 4 : 3).map((post) => (
                  <MediumStylePostCard
                    key={post.id}
                    author={post.author}
                    avatar={mockAvatar(post.author, post.id)}
                    date={post.date}
                    title={post.title}
                    subtitle={post.subtitle}
                    thumbnail={mockContentImage(post.id)}
                    claps={post.claps}
                    comments={post.comments}
                    reposts={post.reposts}
                    onClick={() => onNavigateToTab?.('community')}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-5">
                <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                  <div className="text-sm font-semibold text-[#0b1c30] mb-2.5">Trending topic</div>
                  <div className="flex flex-wrap gap-x-6 gap-y-2">
                    {TRENDING_HASHTAGS.map((tag, i) => (
                      <button
                        key={tag}
                        onClick={() => onNavigateToTab?.('community')}
                        className="flex items-center gap-1.5 text-sm cursor-pointer group"
                      >
                        <span className="text-amber-500 font-bold">{i + 1}</span>
                        <Hash className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-semibold text-[#0b1c30] group-hover:text-[#5945F1] transition-colors">
                          {tag}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {COMMUNITY_ARTICLES.slice(0, 4).map((article, i) => (
                  <div key={article.id} className="flex gap-3">
                    <div className="flex flex-col items-center pt-1.5 shrink-0">
                      <span className="w-2 h-2 rounded-full bg-slate-300" />
                      {i < 3 && <span className="w-px flex-1 bg-slate-100 mt-1" />}
                    </div>
                    <button
                      onClick={() => onNavigateToTab?.('community')}
                      className="text-left flex-1 pb-1 group cursor-pointer"
                    >
                      <div className="text-xs text-slate-400 mb-1">{article.date}</div>
                      <div className="font-bold text-sm text-[#0b1c30] group-hover:text-[#5945F1] transition-colors leading-snug">
                        {article.title}
                      </div>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
                        {article.summary}
                      </p>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

        const missionsBlock = (
          <div>
            <h3 className="font-bold text-lg text-[#0b1c30] mb-4">Missions</h3>
            <MissionCardWidget
              missions={missions}
              onUpdateMissions={onUpdateMissions}
              onNavigateToTab={onNavigateToTab}
            />
          </div>
        );

        const stickySidebarClass =
          'lg:sticky lg:top-[100px] lg:self-start lg:max-h-[calc(100vh-120px)] lg:overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]';

        return communityBesideMarkets ? (
          <>
            {/* Promotion — full width, between Get Started and Markets */}
            <div>
              <h3 className="font-bold text-lg text-[#0b1c30] mb-4">Promotion</h3>
              <PromotionWidget />
            </div>

            {/* Markets + Community, side by side (Community as a fixed 300px sticky sidebar) */}
            <div className="flex flex-col lg:flex-row gap-6 items-start">
              <div className="flex-1 min-w-0">
                <InstrumentAnalysisWidget
                  onNavigateToTab={onNavigateToTab ?? (() => {})}
                  itemsPerPage={12}
                  maxBodyHeightVh={80}
                  defaultFilter="By top change"
                />
              </div>
              <div className={`w-full lg:w-[494px] lg:shrink-0 ${stickySidebarClass}`}>
                {communityBlock}
              </div>
            </div>

            {/* Missions, alongside "New to MarketSyde?" (same row, matching the Markets/Community widths) */}
            <div className="flex flex-col lg:flex-row gap-6 items-start">
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg text-[#0b1c30] mb-4">Missions</h3>
                <MissionCardWidget
                  missions={missions}
                  onUpdateMissions={onUpdateMissions}
                  onNavigateToTab={onNavigateToTab}
                />
              </div>
              <div className="w-full lg:w-[494px] lg:shrink-0">
                {showNewToMarketSydeFaq && (
                  <NewToMarketSydeFaq onClose={() => setShowNewToMarketSydeFaq(false)} />
                )}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Announcements */}
            <div>
              <h3 className="font-bold text-lg text-[#0b1c30] mb-4">Promotion</h3>
              <PromotionWidget />
            </div>

            {/* Markets */}
            <InstrumentAnalysisWidget
              onNavigateToTab={onNavigateToTab ?? (() => {})}
              itemsPerPage={10}
              defaultFilter="By top change"
              compact
            />

            {/* Community + Missions, side by side */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
              <div className="lg:col-span-3">{communityBlock}</div>
              <div className={`lg:col-span-2 ${stickySidebarClass}`}>{missionsBlock}</div>
            </div>
          </>
        );
      })()}
    </div>
  );
};

export default Demo2DashboardView;

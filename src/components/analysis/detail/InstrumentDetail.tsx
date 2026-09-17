import "./market.css";
"use client";

import React, { useEffect, useRef, useState, type ReactNode, type CSSProperties } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  CircleHelp,
  ExternalLink,
  LineChart,
  Lock,
  Maximize2,
  MessageCircle,
  Minimize2,
  Minus,
  Newspaper,
  Plus,
  Send,
  ShieldCheck,
  Star,
  ThumbsDown,
  ThumbsUp,
  TrendingDown,
  TrendingUp,
  Users,
  WalletCards,
  X,
} from "lucide-react";
import type {
  Instrument,
  InstrumentDetailData,
  MarketIndex,
} from "./types";
import { useMarketEngagement } from "./MarketEngagementContext";
import { useRewards } from "./MarketEngagementContext";
import { instrumentDetailData, marketIndices } from "./mockMarket";
import { historicalTierForTimeframe } from "./tierAccess";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "./resizable";
type PanelImperativeHandle = any;

type DetailTab =
  | "Overview"
  | "Technicals"
  | "Market Data"
  | "News"
  | "Analysis"
  | "Forecast"
  | "Products"
  | "Brokers"
  | "Tokenomics"
  | "Financial Report";
type ProductType =
  | "Spot"
  | "Share"
  | "Fractional share"
  | "FX spot"
  | "CFD"
  | "Future"
  | "Perpetual";
type Broker = {
  name: string;
  venue: string;
  products: ProductType[];
  symbols: string[];
  status: "Available" | "Requires account" | "Restricted";
  spread: string;
  minimum: string;
  platform: string;
  commission?: string;
  execution?: string;
  details?: string;
};

const cryptoCoverageBrokers = [
  "Atlas Exchange",
  "Marketsyde Demo",
  "Nova Crypto",
  "OrbitX Markets",
  "Zenith Digital",
  "Harbor Markets",
  "Vertex Exchange",
  "Meridian Crypto",
  "Aster Markets",
  "BluePeak Digital",
];
const cryptoCoverageSeed = (value: string) =>
  [...value].reduce((total, character) => (total * 31 + character.charCodeAt(0)) % 997, 7);

const brokers: Broker[] = [
  {
    name: "Marketsyde Demo",
    venue: "Multi-asset gateway",
    products: ["Share", "Fractional share", "FX spot", "CFD", "Future", "Spot"],
    symbols: ["AAPL", "NVDA", "EUR/USD", "BTC/USD", "XAU/USD", "SPX"],
    status: "Available",
    spread: "Demo quote",
    minimum: "$0",
    platform: "Marketsyde",
    commission: "$0 demo",
    execution: "Simulated instant fill",
    details:
      "Practice account with synthetic quotes and no real-money execution.",
  },
  {
    name: "ApexTrade Demo",
    venue: "US equity routing demo",
    products: ["Share", "Fractional share"],
    symbols: ["AAPL", "MSFT", "NVDA"],
    status: "Available",
    spread: "From $0.01",
    minimum: "$5",
    platform: "Apex Web",
    commission: "$0 per share",
    execution: "Demo smart routing",
    details: "Dummy US equity broker with whole and fractional share access.",
  },
  {
    name: "Nova CFD Lab",
    venue: "Multi-asset CFD demo",
    products: ["CFD"],
    symbols: ["AAPL", "NVDA", "XAU/USD", "SPX"],
    status: "Requires account",
    spread: "From 0.12%",
    minimum: "$100",
    platform: "Nova Terminal",
    commission: "Included in spread",
    execution: "Demo market execution",
    details:
      "Dummy leveraged-product provider for testing eligibility and account flows.",
  },
  {
    name: "FractionHub Sandbox",
    venue: "Fractional equity demo",
    products: ["Fractional share"],
    symbols: ["AAPL", "MSFT", "NVDA"],
    status: "Restricted",
    spread: "Reference quote",
    minimum: "$1",
    platform: "Mobile + web",
    commission: "$0 demo",
    execution: "Scheduled batch demo",
    details: "Dummy fractional-share venue with region-dependent availability.",
  },
  {
    name: "Northstar Markets",
    venue: "Regulated broker demo",
    products: ["Share", "FX spot", "CFD", "Future"],
    symbols: ["AAPL", "MSFT", "EUR/USD", "XAU/USD", "SPX"],
    status: "Requires account",
    spread: "From 0.8 pip",
    minimum: "$250",
    platform: "WebTrader",
  },
  {
    name: "Atlas Exchange",
    venue: "Digital asset venue demo",
    products: ["Spot", "Perpetual"],
    symbols: ["BTC/USD", "ETH/USD", "SOL/USD"],
    status: "Requires account",
    spread: "From 0.04%",
    minimum: "$10",
    platform: "API + web",
  },
  {
    name: "Regional Access Desk",
    venue: "Jurisdiction-dependent",
    products: ["CFD", "Future"],
    symbols: ["XAU/USD", "WTI/USD", "SPX"],
    status: "Restricted",
    spread: "Check conditions",
    minimum: "Varies",
    platform: "Partner platform",
  },
];

const tabList: DetailTab[] = [
  "Overview",
  "Technicals",
  "Market Data",
  "News",
  "Forecast",
  "Products",
  "Brokers",
];
type InstrumentNews = {
  source: string;
  time: string;
  title: string;
  summary: string;
};
const instrumentNews = (instrument: Instrument): InstrumentNews[] => [
  {
    source: "Marketsyde AI",
    time: "10:42",
    title: `${instrument.name} holds its monitored technical level`,
    summary: `${instrument.symbol} is showing ${instrument.rvol.toFixed(2)}x relative volume with sentiment at ${instrument.sentiment}%.`,
  },
  {
    source: "Demo Wire",
    time: "09:18",
    title: `Participation broadens across ${instrument.sector}`,
    summary: `The latest move is being tracked alongside ${instrument.subSector ?? "the broader market"} activity.`,
  },
  {
    source: "Market Brief",
    time: "Yesterday",
    title: `What matters next for ${instrument.symbol}`,
    summary:
      "Macro context, liquidity, and provider availability remain the main watch items.",
  },
  {
    source: "Sector Pulse",
    time: "Yesterday",
    title: `${instrument.sector} breadth keeps expanding`,
    summary: `Related names are contributing to the ${instrument.symbol} move, with participation spreading across the group.`,
  },
  {
    source: "Exchange Desk",
    time: "Sep 9",
    title: `Liquidity remains healthy around ${instrument.symbol}`,
    summary:
      "Demo market depth and relative activity remain above the recent baseline.",
  },
  {
    source: "Research Note",
    time: "Sep 8",
    title: `Analysts update the ${instrument.name} watchlist`,
    summary:
      "The latest context combines momentum, volume, and upcoming market catalysts.",
  },
];

function assetClass(instrument: Instrument) {
  if (instrument.market === "Forex") return "Forex";
  if (instrument.market === "Crypto") return "Crypto";
  if (instrument.market === "Commodity") return "Commodity";
  if (instrument.market === "US Stocks" || instrument.market === "Stocks")
    return "Stock";
  return "Index";
}

function availableProducts(instrument: Instrument): ProductType[] {
  const kind = assetClass(instrument);
  if (kind === "Crypto") return ["Spot", "Perpetual", "CFD"];
  if (kind === "Forex") return ["FX spot", "CFD", "Future"];
  if (kind === "Commodity") return ["Spot", "CFD", "Future"];
  if (kind === "Index") return ["CFD", "Future"];
  return ["Share", "Fractional share", "CFD"];
}

function productIdentifiers(instrument: Instrument) {
  const symbol = instrument.symbol.replace("/", "");
  if (assetClass(instrument) === "Stock") {
    if (instrument.symbol === "NVDA") {
      return [
        "NVDA",
        "XNVDA",
        "TNVDA",
        "S45018",
        "NVD3",
        "SNVDA",
        "XNVDAUSDT",
        "NVDACW",
        "AT000A3RDT2",
        "NAEXP",
      ];
    }
    return [
      instrument.symbol,
      `X${symbol}`,
      `T${symbol}`,
      `S${symbol}`,
      `${symbol}CW`,
      `X${symbol}USDT`,
    ];
  }
  return [instrument.symbol];
}

function brokerSupportsInstrument(broker: Broker, instrument: Instrument) {
  return productIdentifiers(instrument).some((identifier) =>
    broker.symbols.includes(identifier),
  );
}

function brokerProductPair(broker: Broker, instrument: Instrument) {
  const identifiers = productIdentifiers(instrument);
  const seed = cryptoCoverageSeed(`${broker.name}-${instrument.symbol}`);
  const first = identifiers[seed % identifiers.length];
  const second = identifiers[(seed + 3) % identifiers.length];
  return first === second ? [first] : [first, second];
}

function brokerSpecialOffer(brokerName: string) {
  const offers = [
    "10% cashback",
    "50 bonus points",
    "Free Level 2 unlock",
    "Free 200 Marketsyde credit",
  ];
  const index = [...brokerName].reduce((total, character) => total + character.charCodeAt(0), 0) % offers.length;
  return offers[index];
}

function productIdentifierDetail(identifier: string, instrument: Instrument) {
  if (identifier === instrument.symbol) {
    return `${instrument.symbol} · primary ${instrument.primaryMarket ?? instrument.market} listing · underlying share`;
  }
  if (identifier.endsWith("USDT")) {
    return `${identifier} · crypto pair · quoted against USDT · synthetic/demo access`;
  }
  if (identifier.endsWith("CW")) {
    return `${identifier} · covered warrant · issuer-specific terms · expiry and barrier apply`;
  }
  if (identifier.startsWith("X")) {
    return `${identifier} · exchange symbol · ${instrument.primaryMarket ?? "venue"} routing · cash equity`;
  }
  if (identifier.startsWith("T")) {
    return `${identifier} · turbo certificate · leveraged long/short exposure · issuer terms apply`;
  }
  if (identifier.startsWith("S")) {
    return `${identifier} · structured product · certificate reference · issuer terms apply`;
  }
  if (identifier === "NVD3") {
    return "NVD3 · broker-specific derivative code · product terms and leverage depend on the venue.";
  }
  if (/^[A-Z]{2}\d{10}$/.test(identifier)) {
    return `${identifier} · ISIN-style identifier · security lookup/reference code`;
  }
  if (identifier === "NAEXP") {
    return "NAEXP · broker product reference · venue-specific lookup code";
  }
  return `${identifier} · broker-supported product or venue reference`;
}

function recommendedProductCopy(
  kind: string,
): { product: ProductType; detail: string }[] {
  if (kind === "Crypto")
    return [
      { product: "Spot", detail: "Direct 24/7 asset exposure" },
      { product: "Perpetual", detail: "Leveraged directional product" },
    ];
  if (kind === "Forex")
    return [
      { product: "FX spot", detail: "Standard currency-pair access" },
      { product: "CFD", detail: "Flexible margin product" },
    ];
  if (kind === "Commodity")
    return [
      { product: "Future", detail: "Exchange-traded contract" },
      { product: "CFD", detail: "Flexible margin product" },
    ];
  if (kind === "Index")
    return [
      { product: "CFD", detail: "Broad index exposure" },
      { product: "Future", detail: "Exchange-traded contract" },
    ];
  return [
    { product: "Share", detail: "Direct company ownership" },
    { product: "Fractional share", detail: "Smaller position sizing" },
  ];
}

function displayValue(instrument: Instrument) {
  if (assetClass(instrument) === "Forex") return instrument.price.toFixed(4);
  if (instrument.price < 1) return instrument.price.toFixed(4);
  return instrument.price.toLocaleString(undefined, {
    maximumFractionDigits: 2,
  });
}

type PerformancePeriod = "1D" | "1W" | "1M" | "1Y";
type VoteSide = "Bullish" | "Bearish";
type VoteRange = "2W" | "1M";
type CompareRange =
  "1d" | "3d" | "7d" | "14d" | "1m" | "3m" | "6m" | "1y" | "3y" | "5y";
const thirtyTwo = 32;
const weeklyVoteWindow = 7 * 24 * 60 * 60 * 1000;
const marketTagTopics = [
  "TECHNICAL",
  "BREADTH",
  "MACRO",
  "SECTOR",
  "RISK",
] as const;
const rangeReturnMultiplier: Record<CompareRange, number> = {
  "1d": 1,
  "3d": 1.35,
  "7d": 1.8,
  "14d": 2.2,
  "1m": 1,
  "3m": 2.2,
  "6m": 3.8,
  "1y": 7.4,
  "3y": 16,
  "5y": 25,
};
const compareReturn = (instrument: Instrument, range: CompareRange) =>
  range === "1m"
    ? instrument.return1m
    : instrument.change * rangeReturnMultiplier[range];
const voteRangeOptions: {
  value: VoteRange;
  label: string;
  days: number;
  requiredLevel: number;
  compareRange: CompareRange;
  intervalDays: number;
  cadence: "week" | "month";
}[] = [
  {
    value: "2W",
    label: "2W",
    days: 14,
    requiredLevel: 1,
    compareRange: "14d",
    intervalDays: 7,
    cadence: "week",
  },
  {
    value: "1M",
    label: "1M",
    days: 30,
    requiredLevel: 2,
    compareRange: "1m",
    intervalDays: 7,
    cadence: "week",
  },
];
function voteHistorySeries(instrument: Instrument, range: VoteRange) {
  const config = voteRangeOptions.find((option) => option.value === range);
  if (!config) return [];
  const totalReturn = compareReturn(instrument, config.compareRange);
  const volatility = Math.max(Math.abs(totalReturn) * 0.18, 0.35);
  return Array.from({ length: config.days + 1 }, (_, index) => {
    const progress = index / config.days;
    const wave =
      Math.sin(index * 0.21 + instrument.price) * volatility * (1 - progress) +
      Math.sin(index * 0.07) * volatility * 0.35;
    return (
      instrument.price *
      (1 - totalReturn / 100 + (totalReturn / 100) * progress + wave / 100)
    );
  });
}
const periodReturn = (instrument: Instrument, period: PerformancePeriod) =>
  period === "1D"
    ? instrument.change
    : period === "1W"
      ? compareReturn(instrument, "7d")
      : period === "1M"
        ? instrument.return1m
        : compareReturn(instrument, "1y");
const periodToRange: Record<PerformancePeriod, CompareRange> = {
  "1D": "1d",
  "1W": "7d",
  "1M": "1m",
  "1Y": "1y",
};
function performanceSeries(
  instrument: Instrument,
  period: PerformancePeriod,
  selectedReturn = periodReturn(instrument, period),
) {
  const totalReturn = selectedReturn;
  const volatility = Math.max(Math.abs(totalReturn) * 0.18, 0.35);
  return Array.from({ length: thirtyTwo }, (_, index) => {
    const progress = index / (thirtyTwo - 1);
    const wave =
      Math.sin(index * 1.37 + instrument.price) * volatility * (1 - progress) +
      Math.sin(index * 0.47) * volatility * 0.35;
    return (
      instrument.price *
      (1 - totalReturn / 100 + (totalReturn / 100) * progress + wave / 100)
    );
  });
}

function weeklyVoteStorageKey(symbol: string) {
  return `marketsyde:weekly-vote:${symbol}`;
}

function readWeeklyVote(symbol: string): { side: VoteSide; votedAt: number } | null {
  const stored = window.localStorage.getItem(weeklyVoteStorageKey(symbol));
  if (!stored) return null;
  try {
    const parsed = JSON.parse(stored) as { side?: VoteSide; votedAt?: number };
    if (
      (parsed.side !== "Bullish" && parsed.side !== "Bearish") ||
      typeof parsed.votedAt !== "number"
    ) {
      window.localStorage.removeItem(weeklyVoteStorageKey(symbol));
      return null;
    }
    if (Date.now() - parsed.votedAt >= weeklyVoteWindow) {
      window.localStorage.removeItem(weeklyVoteStorageKey(symbol));
      return null;
    }
    return { side: parsed.side, votedAt: parsed.votedAt };
  } catch {
    window.localStorage.removeItem(weeklyVoteStorageKey(symbol));
    return null;
  }
}

export function InstrumentDetail({
  instrument,
  initialTab,
  focusId,
  chartOpen,
  chartContent,
  showLinkedTags,
  watchlistCount,
  watchlistLimit,
  onShowLinkedTagsChange,
  followedPublisher,
  onFollowPublisher,
  onCommunityChart,
  onOpenCommunity,
  onBack,
  onChart,
  onToast,
}: {
  instrument: Instrument;
  initialTab?: string;
  focusId?: string;
  chartOpen: boolean;
  chartContent: ReactNode;
  showLinkedTags: boolean;
  watchlistCount: number;
  watchlistLimit: number;
  onShowLinkedTagsChange: (show: boolean) => void;
  followedPublisher: { name: string; tag: string } | null;
  onFollowPublisher: (name: string, tag: string) => void;
  onCommunityChart: (name: string, tag: string) => void;
  onOpenCommunity: () => void;
  onBack: () => void;
  onChart: () => void;
  onToast: (message: string) => void;
}) {
  const [tab, setTab] = useState(initialTab ?? "Overview");
  const { openBrokerAccess, requestUnlock } = useMarketEngagement();
  const { snapshot } = useRewards();
  const conceptColumnsRef = useRef<HTMLDivElement>(null);
  const cashbackRef = useRef<HTMLElement>(null);
  const [watching, setWatching] = useState(false);
  const [weeklyVote, setWeeklyVote] = useState<{
    side: VoteSide;
    votedAt: number;
  } | null>(null);
  const [article, setArticle] = useState<InstrumentNews | null>(null);
  const [newPostOpen, setNewPostOpen] = useState(false);
  const [newPostText, setNewPostText] = useState("");
  const [newCommunityPost, setNewCommunityPost] = useState<string | null>(null);
  const [product, setProduct] = useState<ProductType>(
    availableProducts(instrument)[0],
  );
  const products = availableProducts(instrument);
  const [newsFilter, setNewsFilter] = useState("All news");
  const kind = assetClass(instrument);
  const instrumentTitle = instrument.name.includes("Basket")
    ? `${instrument.symbol} · ${instrument.name}`
    : instrument.name;
  const news = instrumentNews(instrument);
  const taggedNews = news.map((item, index) => ({
    ...item,
    tag: marketTagTopics[index % marketTagTopics.length],
  }));
  useEffect(() => {
    if (typeof window === "undefined") return;
    setWeeklyVote(readWeeklyVote(instrument.symbol));
  }, [instrument.symbol]);
  useEffect(() => {
    if (!weeklyVote) return;
    const remaining = weeklyVoteWindow - (Date.now() - weeklyVote.votedAt);
    if (remaining <= 0) {
      setWeeklyVote(null);
      window.localStorage.removeItem(weeklyVoteStorageKey(instrument.symbol));
      return;
    }
    const timeout = window.setTimeout(() => {
      setWeeklyVote(null);
      window.localStorage.removeItem(weeklyVoteStorageKey(instrument.symbol));
    }, remaining);
    return () => window.clearTimeout(timeout);
  }, [instrument.symbol, weeklyVote]);
  useEffect(() => {
    if (!focusId) return;
    let timeout: number | undefined;
    const frame = window.requestAnimationFrame(() => {
      const target = document.getElementById(focusId);
      if (!target) return;
      target.scrollIntoView({ behavior: "smooth", block: "center" });
      target.classList.add("market-context-highlight");
      timeout = window.setTimeout(
        () => target.classList.remove("market-context-highlight"),
        2200,
      );
    });
    return () => {
      window.cancelAnimationFrame(frame);
      if (timeout) window.clearTimeout(timeout);
    };
  }, [focusId, instrument.symbol]);
  const positive = instrument.change >= 0;
  const toggleWatching = () => {
    if (!watching && watchlistCount >= watchlistLimit) {
      onToast(`Level ${snapshot.level.level} watchlists are limited to ${watchlistLimit} symbols.`);
      return;
    }
    setWatching(current => !current);
    onToast(watching ? "Removed from watchlist" : "Added to watchlist");
  };
  const recordVote = (side: VoteSide) => {
    if (weeklyVote) {
      onToast("You can vote again in 7 days.");
      return;
    }
    const nextVote = { side, votedAt: Date.now() };
    window.localStorage.setItem(
      weeklyVoteStorageKey(instrument.symbol),
      JSON.stringify(nextVote),
    );
    setWeeklyVote(nextVote);
    onToast(`${side} vote recorded for this week`);
  };
  const instrumentTabs = (
    <nav
      className="concept-tabs concept-tabs-workspace"
      aria-label="Instrument sections"
    >
      {[
        ...tabList.filter(
          (item) => !["News", "Products", "Brokers"].includes(item),
        ),
        "Products & Brokers",
        ...(kind === "Stock" ? ["Financial Report"] : []),
      ].map((item) => (
        <button
          key={item}
          onClick={() => setTab(item)}
          aria-current={tab === item ? "page" : undefined}
        >
          {item}
        </button>
      ))}
    </nav>
  );
  return (
    <div className="market-feature">
      <div className="concept-instrument">
        <section className="concept-quote">
        <div className="concept-identity">
          <button onClick={onBack} className="concept-back">
            <ArrowLeft size={14} /> Markets / {kind}
          </button>
          <div className="concept-name">
            <div className="concept-symbol">
              {instrument.symbol.slice(0, 4)}
            </div>
            <div>
              <h1>{instrumentTitle}</h1>
              <div className="concept-tags">
                <span>
                  {instrument.primaryMarket ?? instrument.market}:{" "}
                  {instrument.symbol}
                </span>
                <span>{instrument.subSector ?? instrument.sector}</span>
              </div>
              <p>
                Demo quote ·{" "}
                {kind === "Crypto" ? "24/7 market" : "Regular market session"} ·
                USD
              </p>
            </div>
          </div>
        </div>
        <div className="concept-price">
          <h2>
            {kind === "Forex" ? "" : "$"}
            {displayValue(instrument)}
          </h2>
          <span className={positive ? "concept-up" : "concept-down"}>
            {positive ? "↗ +" : "↘ "}
            {instrument.change.toFixed(2)}%
          </span>
          <small> Today · demo snapshot</small>
          <div className="concept-quote-stats">
            <div>
              <small>MARKET CAP</small>
              <b>
                {instrument.marketCap
                  ? `$${instrument.marketCap.toLocaleString()}B`
                  : "—"}
              </b>
            </div>
            <div>
              <small>VOLUME</small>
              <b>{instrument.volume.toLocaleString()}M</b>
            </div>
            <div>
              <small>RELATIVE VOLUME</small>
              <b>{instrument.rvol.toFixed(2)}×</b>
            </div>
            <div>
              <small>1 MONTH RETURN</small>
              <b>
                {instrument.return1m > 0 ? "+" : ""}
                {instrument.return1m}%
              </b>
            </div>
          </div>
          <div className="concept-actions">
            <button
              onClick={toggleWatching}
            >
              <Star size={15} fill={watching ? "currentColor" : "none"} />
              {watching ? "Watching" : "Watchlist"}
            </button>
            <button
              onClick={() =>
                onToast(`Demo price alert created for ${instrument.symbol}`)
              }
            >
              <Bell size={15} /> Alert
            </button>
            <button
              className="concept-primary"
              onClick={openBrokerAccess}
            >
              Trade via broker <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>
      <div className="concept-columns" ref={conceptColumnsRef}>
        <aside className="concept-news concept-card" id="financial-news">
          <div className="concept-section-title">
            <Newspaper size={19} />
            <div>
              <h2>Latest news</h2>
              <p>Market context for {instrument.symbol}</p>
            </div>
          </div>
          <div className="concept-news-filters">
            {["All news", "Market", "Research"].map((item) => (
              <button
                key={item}
                className={`${newsFilter === item ? "selected" : ""} ${item === "Research" && snapshot.level.level < 4 ? "cursor-not-allowed opacity-50" : ""}`}
                aria-disabled={item === "Research" && snapshot.level.level < 4}
                title={item === "Research" && snapshot.level.level < 4 ? "Requires Level 4" : undefined}
                onClick={() => {
                  if (item === "Research" && snapshot.level.level < 4) {
                    requestUnlock("researchNews");
                    return;
                  }
                  setNewsFilter(item);
                }}
              >
                {item}
                {item === "Research" && snapshot.level.level < 4 && <Lock className="ml-1 inline size-2.5" />}
              </button>
            ))}
          </div>
          {taggedNews
            .filter(
              (_, index) =>
                newsFilter === "All news" ||
                (newsFilter === "Market" ? index < 3 : index >= 3),
            )
            .map((item) => (
              <article
                id={`news-${instrument.symbol.replaceAll("/", "-")}-${item.tag}`}
                className="market-tag-target"
                key={item.title}
                onClick={() => {
                  setArticle(item);
                  const target = document.getElementById(
                    `news-${instrument.symbol.replaceAll("/", "-")}-${item.tag}`,
                  );
                  target?.classList.add("market-context-highlight");
                  window.setTimeout(
                    () => target?.classList.remove("market-context-highlight"),
                    1800,
                  );
                }}
              >
                <div className="concept-news-meta">
                  <span>{item.source}</span>
                  <small>{item.time}</small>
                </div>
                <a
                  className="market-context-tag"
                  href={`#community-${instrument.symbol.replaceAll("/", "-")}-${item.tag}`}
                >
                  #{instrument.symbol}_{item.tag}
                </a>
                <h3>{item.title}</h3>
                <p>{item.summary}</p>
                <button onClick={() => setArticle(item)}>
                  Read full <ArrowRight size={12} />
                </button>
              </article>
            ))}
        </aside>
        <div className="concept-analysis">
          {tab !== "Overview" && (
            <section className="panel concept-tabs-panel">
              {instrumentTabs}
            </section>
          )}
          {tab === "Overview" && (
            <>
              <Overview
                instrument={instrument}
                kind={kind}
                onChart={onChart}
                tierLevel={snapshot.level.level}
                onToast={onToast}
                chartOpen={chartOpen}
                chartContent={chartContent}
                showLinkedTags={showLinkedTags}
                onShowLinkedTagsChange={onShowLinkedTagsChange}
                tabs={instrumentTabs}
              />
            </>
          )}
          {tab === "Technicals" && (
            <TechnicalSummary
              instrument={instrument}
              tierLevel={snapshot.level.level}
              onToast={onToast}
            />
          )}
          {tab === "Market Data" && (
            <MarketStats
              instrument={instrument}
              kind={kind}
              tierLevel={snapshot.level.level}
            />
          )}
          {tab === "Analysis" && (
            <Analysis instrument={instrument} kind={kind} />
          )}
          {tab === "Forecast" && (
            <Forecast
              instrument={instrument}
              kind={kind}
              tierLevel={snapshot.level.level}
              userVote={weeklyVote?.side ?? null}
            />
          )}
          {["Products", "Brokers", "Products & Brokers"].includes(tab) && (
            <ProductsAndBrokersTable
              instrument={instrument}
              product="CFD"
              products={availableProducts(instrument)}
              setProduct={setProduct}
              brokers={brokers.filter((b) =>
                b.symbols.includes(instrument.symbol),
              )}
            />
          )}
          {tab === "Financial Report" && (
            <FinancialReport
              instrument={instrument}
              tierLevel={snapshot.level.level}
              onToast={onToast}
            />
          )}
        </div>
        <aside className="concept-trading-signal concept-card !bg-slate-100" aria-label="Most recent signals">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                Most Recent <span className="text-violet-600">Signals.</span>
              </h2>
              <p className="mt-1 text-[11px] text-slate-500">
                View most recent signals for your trading
              </p>
            </div>
            <a
              href="/?view=screener"
              className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-slate-900"
            >
              More <ArrowRight className="size-3" />
            </a>
          </div>
          <div className="mt-4 divide-y divide-slate-200">
            {[
              {
                symbol: "EUR/USD",
                mark: "EU",
                markClass: "bg-blue-700",
                change: "+0.33%",
                action: "Buy",
                actionClass: "bg-lime-400 text-slate-950",
                chart: "M2 10 C14 8 16 16 25 12 S37 10 43 15 S53 8 61 12 S74 15 82 8 S92 11 98 6",
                chartClass: "text-lime-500",
              },
              {
                symbol: "GOOGL",
                mark: "G",
                markClass: "bg-white text-blue-600",
                change: "-0.11%",
                action: "Sell",
                actionClass: "bg-violet-600 text-white",
                chart: "M2 7 C12 12 17 5 26 10 S39 18 48 12 S58 14 67 8 S79 13 88 6 S94 7 98 4",
                chartClass: "text-violet-500",
              },
              {
                symbol: "BTC/USD",
                mark: "₿",
                markClass: "bg-orange-500 text-white",
                change: "Premium Signal",
                action: "Upgrade",
                actionClass: "border border-violet-300 bg-white text-fuchsia-600",
                chart: "M2 11 C13 6 18 15 27 10 S40 13 48 8 S61 14 70 9 S82 14 91 7 S96 9 98 5",
                chartClass: "text-violet-500",
                premium: true,
              },
              {
                symbol: "S&P 500",
                mark: "500",
                markClass: "bg-rose-700 text-white",
                change: "+0.44%",
                action: "Buy",
                actionClass: "bg-lime-400 text-slate-950",
                chart: "M2 12 C13 10 16 6 24 11 S38 13 46 8 S59 15 67 10 S78 14 86 7 S94 10 98 4",
                chartClass: "text-lime-500",
              },
              {
                symbol: "XAU/USD",
                mark: "Au",
                markClass: "bg-amber-500 text-white",
                change: "+0.24%",
                action: "Buy",
                actionClass: "bg-lime-400 text-slate-950",
                chart: "M2 13 C12 8 20 16 29 11 S39 12 48 7 S62 14 70 10 S83 13 91 6 S96 8 98 4",
                chartClass: "text-lime-500",
              },
            ].map((signal) => (
              <div key={signal.symbol} className="flex items-center gap-2 py-3">
                <span className={`grid size-8 shrink-0 place-items-center rounded-full text-[10px] font-bold ${signal.markClass}`}>
                  {signal.mark}
                </span>
                <div className="min-w-0 flex-1">
                  <b className="block text-sm font-medium text-slate-800">{signal.symbol}</b>
                  <span className={`block text-xs font-semibold ${signal.premium ? "text-fuchsia-500" : signal.change.startsWith("-") ? "text-violet-600" : "text-lime-600"}`}>
                    {signal.premium && "◇ "}{signal.change}
                  </span>
                </div>
                <svg viewBox="0 0 100 24" className={`h-7 w-20 shrink-0 ${signal.chartClass}`} aria-hidden="true">
                  <path d={signal.chart} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <a
                  href={signal.premium ? "/?view=points-credits" : `/?view=instrument&symbol=${encodeURIComponent(signal.symbol)}`}
                  className={`inline-flex min-w-[64px] items-center justify-center rounded-lg px-3 py-2 text-xs font-semibold ${signal.actionClass}`}
                >
                  {signal.action}
                </a>
              </div>
            ))}
          </div>
        </aside>
        <aside className="concept-community concept-card">
          <div className="concept-section-title">
            <Users size={20} />
            <div>
              <h2>Nvidia Community</h2>
              <p>Community perspectives and discussion</p>
            </div>
          </div>
          <div className="concept-voting">
            <div>
              <b className="concept-up">↗ {instrument.sentiment}% Bullish</b>
              <b className="concept-down">
                {100 - instrument.sentiment}% Bearish ↘
              </b>
            </div>
            <div className="concept-sentiment-bar">
              <i style={{ width: `${instrument.sentiment}%` }} />
            </div>
            <div>
              {["Bullish", "Bearish"].map((item) => (
                <button
                  key={item}
                  type="button"
                  aria-pressed={weeklyVote?.side === item}
                  disabled={Boolean(weeklyVote)}
                  title={weeklyVote ? "You can vote again in 7 days" : undefined}
                  onClick={() => recordVote(item as VoteSide)}
                >
                  {weeklyVote?.side === item ? "✓ " : ""}Vote {item}
                </button>
              ))}
            </div>
            <p className="concept-vote-status">
              {weeklyVote
                ? `Your ${weeklyVote.side.toLowerCase()} vote is counted · next vote in 7 days`
                : "Vote once every 7 days to update the community view"}
            </p>
          </div>
          <h3 className="concept-eyebrow">PREDICTOR SPOTLIGHT</h3>
          <div className="concept-predictor">
            <span className="concept-avatar">MC</span>
            <div>
              <b>Maya Chen</b>
              <p>Momentum analyst</p>
            </div>
            <strong>
              82%<small>accuracy · demo</small>
            </strong>
          </div>
          <button
            className="concept-outline"
            onClick={() => setNewPostOpen(true)}
          >
            Discuss {instrument.symbol} <MessageCircle size={15} />
          </button>
          {newCommunityPost && (
            <CommunityPredictionPost
              instrument={instrument}
              post={{
                name: "You",
                initials: "YO",
                time: "now",
                tag: "COMMUNITY",
                text: newCommunityPost,
                agree: 0,
                disagree: 0,
              }}
              followed={false}
              onFollow={() => undefined}
              onToast={onToast}
              onCommunityChart={onCommunityChart}
            />
          )}
          {[
            {
              name: "Daniel Markson",
              initials: "DM",
              time: "19h",
              tag: "TECHNICAL",
              text: `Watching ${instrument.symbol}: participation is stronger than the prior session. Looking for confirmation around the next pullback.`,
              agree: 14,
              disagree: 6,
            },
            {
              name: "CLORA",
              initials: "CL",
              time: "21h",
              tag: "BREADTH",
              text: `The ${instrument.symbol} setup looks constructive. Volume and broader ${instrument.sector.toLowerCase()} activity are the next things on my checklist.`,
              agree: 13,
              disagree: 5,
            },
            {
              name: "Aisha Rahman",
              initials: "AR",
              time: "1d",
              tag: "MACRO",
              text: `Base case for ${instrument.symbol}: steady demand and improving breadth support a measured continuation, with volatility around earnings.`,
              agree: 17,
              disagree: 7,
            },
            {
              name: "Leo Park",
              initials: "LP",
              time: "1d",
              tag: "SECTOR",
              text: `I see a range scenario for ${instrument.symbol}. A breakout needs stronger volume; otherwise consolidation remains likely.`,
              agree: 9,
              disagree: 8,
            },
            {
              name: "Sofia Mendes",
              initials: "SM",
              time: "2d",
              tag: "RISK",
              text: `Risk case for ${instrument.symbol}: valuation sensitivity could create a deeper retest before the longer-term trend resumes.`,
              agree: 8,
              disagree: 12,
            },
          ].map((post) => (
            <CommunityPredictionPost
              key={post.name}
              instrument={instrument}
              post={post}
              followed={followedPublisher?.tag === post.tag}
              onFollow={() => onFollowPublisher(post.name, post.tag)}
              onToast={onToast}
              onCommunityChart={onCommunityChart}
            />
          ))}
          <div className="concept-community-footer">
            <button
              type="button"
              className="concept-post-community-link"
              aria-label={`Open ${instrument.symbol} Community`}
              title="Open Community"
              onClick={onOpenCommunity}
            >
              <ExternalLink size={14} />
              Community
            </button>
          </div>
        </aside>
      </div>
      <section className="concept-cashback" ref={cashbackRef}>
        <div className="concept-bounty-icon">
          <WalletCards />
        </div>
        <div>
          <span className="concept-gold-label">BROKER REWARDS</span>
          <h2>Make your {instrument.symbol} trades go further</h2>
          <p>
            Explore matched brokers, product access, and available cashback
            offers.
          </p>
        </div>
        <button
          onClick={() => {
            setTab("Brokers");
            window.scrollTo({ top: 400, behavior: "smooth" });
          }}
        >
          Explore broker offers <ArrowRight size={16} />
        </button>
      </section>
      <footer className="concept-footer">
        <b>marketsyde</b>
        <span>Market intelligence · News · Community · Rewards</span>
        <small>Demo market data and community content</small>
      </footer>
      {newPostOpen && (
        <div
          className="concept-modal-backdrop"
          onClick={() => setNewPostOpen(false)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-community-post-title"
            className="concept-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="label">NVIDIA COMMUNITY</p>
                <h2 id="new-community-post-title">Create a new post</h2>
                <p>Share an idea, question, or market observation.</p>
              </div>
              <button
                type="button"
                aria-label="Close new post window"
                onClick={() => setNewPostOpen(false)}
              >
                <X size={18} />
              </button>
            </div>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                const text = newPostText.trim();
                if (!text) return;
                setNewCommunityPost(text);
                onToast("Community post created · demo");
                setNewPostText("");
                setNewPostOpen(false);
              }}
              className="mt-4"
            >
              <textarea
                autoFocus
                value={newPostText}
                onChange={(event) => setNewPostText(event.target.value)}
                placeholder={`What are you seeing in ${instrument.symbol}?`}
                aria-label="Community post"
                rows={5}
              />
              <div className="mt-3 flex justify-end gap-2">
                <button
                  type="button"
                  className="concept-outline"
                  onClick={() => setNewPostOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="concept-primary">
                  Publish post
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
      {article && (
        <div
          className="concept-modal-backdrop"
          onClick={() => setArticle(null)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-label={article.title}
            className="concept-card concept-article"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="concept-outline"
              onClick={() => setArticle(null)}
            >
              Close article
            </button>
            <p className="concept-eyebrow">
              {article.source} · {article.time} · DEMO
            </p>
            <h2>{article.title}</h2>
            <p>{article.summary}</p>
            <p>
              This preview contains a synthetic market brief for{" "}
              {instrument.symbol}.
            </p>
          </section>
        </div>
      )}
      </div>
    </div>
  );
}

function CommunityPredictionPost({
  instrument,
  post,
  followed,
  onFollow,
  onToast,
  onCommunityChart,
}: {
  key?: string;
  instrument: Instrument;
  post: {
    name: string;
    initials: string;
    time: string;
    tag: string;
    text: string;
    agree: number;
    disagree: number;
  };
  followed: boolean;
  onFollow: () => void;
  onToast: (message: string) => void;
  onCommunityChart: (name: string, tag: string) => void;
}) {
  const [reaction, setReaction] = useState<"agree" | "disagree" | null>(null);
  const [commentOpen, setCommentOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([
    {
      author: "Maya Chen",
      initials: "MC",
      time: "12m",
      text: "The volume confirmation is the key level I am watching.",
    },
    {
      author: "Alex Kim",
      initials: "AK",
      time: "34m",
      text: "This matches my base case, with risk kept below the recent swing.",
    },
    {
      author: "Priya S.",
      initials: "PS",
      time: "1h",
      text: "Useful scenario. I would wait for one more close above support.",
    },
  ]);
  const agree = post.agree + (reaction === "agree" ? 1 : 0);
  const disagree = post.disagree + (reaction === "disagree" ? 1 : 0);
  const total = agree + disagree;
  const agreePercent = Math.round((agree / total) * 100);
  const disagreePercent = 100 - agreePercent;
  const direction = agreePercent >= 50 ? "Long" : "Short";
  const vote = (next: "agree" | "disagree") => {
    setReaction((current) => (current === next ? null : next));
    onToast(`${next === "agree" ? "Agree" : "Disagree"} vote recorded · demo`);
  };
  return (
    <article
      id={`community-${instrument.symbol.replaceAll("/", "-")}-${post.tag}`}
      className="concept-post market-tag-target"
      onClick={(event) => {
        if ((event.target as HTMLElement).closest("button, a")) return;
        event.currentTarget.scrollIntoView({ behavior: "smooth", block: "center" });
        event.currentTarget.classList.add("concept-post-focus");
        window.setTimeout(
          () => event.currentTarget.classList.remove("concept-post-focus"),
          2200,
        );
      }}
    >
      <div>
        <span className="concept-avatar">{post.initials}</span>
        <b>
          {post.name}
          <small>Community contributor · {post.time}</small>
        </b>
        <span
          className={`ml-auto rounded-full px-2 py-1 text-[8px] font-bold ${direction === "Long" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}
        >
          Community vote · {direction} {agreePercent}%
        </span>
      </div>
      <button
        aria-pressed={followed}
        onClick={() => {
          onFollow();
          window.dispatchEvent(
            new CustomEvent("market-community-context", {
              detail: { mode: "Alerts", tag: post.tag },
            }),
          );
        }}
        className={followed ? "text-amber-600" : ""}
      >
        <Bell size={14} fill={followed ? "currentColor" : "none"} />
        {followed ? "Following alerts" : "Follow alerts"}
      </button>
      <p>{post.text}</p>
      <div className="mb-2 flex h-1.5 overflow-hidden rounded-full">
        <div
          className="h-full bg-emerald-400 transition-all"
          style={{ width: `${agreePercent}%` }}
        />
        <div
          className="h-full bg-rose-400 transition-all"
          style={{ width: `${disagreePercent}%` }}
        />
      </div>
      <button
        className="text-emerald-600"
        aria-pressed={reaction === "agree"}
        onClick={() => vote("agree")}
      >
        <ThumbsUp size={14} /> Agree {agreePercent}%
      </button>
      <button
        className="text-rose-600"
        aria-pressed={reaction === "disagree"}
        onClick={() => vote("disagree")}
      >
        <ThumbsDown size={14} /> Disagree {disagreePercent}%
      </button>
      <small className="ml-1 text-[9px] text-slate-400">{total} voters</small>
      <button
        aria-expanded={commentOpen}
        onClick={() => setCommentOpen((open) => !open)}
      >
        <MessageCircle size={14} /> Comment {comments.length}
      </button>
      {commentOpen && (
        <div className="mt-3 flex flex-col gap-2 rounded-xl bg-slate-50 p-2">
          {comments.map((item, index) => (
            <div
              key={`${item.author}-${index}`}
              className="flex w-full items-start gap-2 rounded-lg bg-white p-2 text-[9px]"
            >
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-violet-100 font-bold text-violet-600">
                {item.initials}
              </span>
              <div className="min-w-0">
                <b>
                  {item.author}{" "}
                  <small className="font-normal text-slate-400">
                    · {item.time}
                  </small>
                </b>
                <p className="mt-0.5 text-slate-600">{item.text}</p>
              </div>
            </div>
          ))}
          <form
            className="mt-1 flex w-full gap-1 border-t border-slate-200 pt-2"
            onSubmit={(event) => {
              event.preventDefault();
              if (!comment.trim()) return;
              setComments((current) => [
                ...current,
                {
                  author: "Josh",
                  initials: "J",
                  time: "now",
                  text: comment.trim(),
                },
              ]);
              setComment("");
              onToast("Comment posted · demo");
            }}
          >
            <input
              autoFocus
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="Add a comment…"
              className="min-w-0 flex-1 rounded-lg border border-slate-200 px-2 py-1.5 text-[10px]"
            />
            <button type="submit" aria-label="Post comment">
              <Send size={13} />
            </button>
          </form>
        </div>
      )}
    </article>
  );
}

function LegacyInstrumentDetail({
  instrument,
  onBack,
  onChart,
  onToast,
}: {
  instrument: Instrument;
  onBack: () => void;
  onChart: () => void;
  onToast: (message: string) => void;
}) {
  const kind = assetClass(instrument);
  const { snapshot } = useRewards();
  const products = availableProducts(instrument);
  const [tab, setTab] = useState<DetailTab>("Overview");
  const [product, setProduct] = useState<ProductType>(products[0]);
  const [watching, setWatching] = useState(false);
  const [alerting, setAlerting] = useState(false);
  const [compare, setCompare] = useState(false);
  const [insightsOpen, setInsightsOpen] = useState(true);
  const [selectedNews, setSelectedNews] = useState<InstrumentNews | null>(null);
  const [shareReference, setShareReference] = useState<InstrumentNews | null>(
    null,
  );
  const [communityReference, setCommunityReference] =
    useState<InstrumentNews | null>(null);
  const matchingBrokers = brokers.filter(
    (broker) =>
      broker.symbols.includes(instrument.symbol) &&
      broker.products.includes(product),
  );
  const related =
    kind === "Index"
      ? marketIndices
          .filter((index) => index.symbol !== instrument.symbol)
          .slice(0, 3)
          .map((index) => ({
            symbol: index.symbol,
            name: index.name,
            change: index.change,
          }))
      : [];
  const tabs =
    kind === "Crypto"
      ? [...tabList, "Tokenomics" as DetailTab]
      : kind === "Stock"
        ? [...tabList, "Financial Report" as DetailTab]
        : tabList;

  return (
    <div className="instrument-page space-y-4">
      <div className="flex items-center gap-3 text-xs text-slate-500">
        <button onClick={onBack} className="secondary">
          <ArrowLeft />
          Back to screener
        </button>
        <span>Markets</span>
        <ArrowRight className="size-3" />
        <span>{kind}</span>
        <ArrowRight className="size-3" />
        <b className="text-slate-800">{instrument.symbol}</b>
      </div>

      <section className="panel overflow-hidden">
        <div className="flex flex-wrap items-start justify-between gap-4 p-5">
          <div className="flex items-start gap-3">
            <div className="grid size-12 place-items-center rounded-2xl bg-violet-100 text-lg font-semibold text-violet-700">
              {instrument.symbol.slice(0, 2)}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="badge">{kind}</span>
                <span className="badge">
                  {instrument.primaryMarket ?? instrument.market}
                </span>
                <span className="badge positive">DEMO DATA</span>
              </div>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
                {instrument.name}
              </h1>
              <p className="mt-1 text-xs text-slate-500">
                {instrument.symbol} - {instrument.sector} -{" "}
                {instrument.subSector ?? "Unclassified"} -{" "}
                {kind === "Crypto"
                  ? "24/7 market"
                  : kind === "Forex"
                    ? "24/5 market"
                    : "Market session applies"}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setWatching(!watching);
                onToast(
                  watching ? "Removed from watchlist" : "Added to watchlist",
                );
              }}
              className="secondary"
            >
              <Star
                className={watching ? "fill-violet-600 text-violet-600" : ""}
              />
              {watching ? "Watching" : "Watchlist"}
            </button>
            <button
              onClick={() => {
                setAlerting(!alerting);
                onToast(alerting ? "Alert removed" : "Alert created");
              }}
              className="secondary"
            >
              <Bell />
              {alerting ? "Alert active" : "Alert"}
            </button>
            <button
              onClick={() => {
                setCompare(!compare);
                onToast(
                  compare ? "Removed from comparison" : "Added to comparison",
                );
              }}
              className="secondary"
            >
              <Plus />
              Compare
            </button>
            <button
              onClick={() => setInsightsOpen(!insightsOpen)}
              className="secondary"
            >
              <MessageCircle />
              {insightsOpen ? "Hide insights" : "Show insights"}
            </button>
            <button
              onClick={() => {
                if (snapshot.level.level < 2) {
                  onToast("Advanced chart requires Level 2.");
                  return;
                }
                onChart();
              }}
              className={`primary ${snapshot.level.level < 2 ? "cursor-not-allowed opacity-60" : ""}`}
              aria-disabled={snapshot.level.level < 2}
              title={snapshot.level.level < 2 ? "Requires Level 2" : "Open advanced chart"}
            >
              <LineChart />
              Advanced chart
              {snapshot.level.level < 2 && <Lock className="size-3" />}
            </button>
          </div>
        </div>
        <div className="grid grid-cols-[minmax(0,1fr)_260px] border-t border-border max-md:grid-cols-1">
          <div className="p-5">
            <div className="flex items-end gap-3">
              <span className="font-mono text-3xl font-semibold text-slate-900">
                {displayValue(instrument)}
              </span>
              <span className="mb-1 text-xs text-slate-400">
                {kind === "Forex"
                  ? "quote"
                  : kind === "Index"
                    ? "points"
                    : "USD"}
              </span>
              <span
                className={`mb-1 flex items-center gap-1 text-sm font-semibold ${instrument.change >= 0 ? "up" : "down"}`}
              >
                {instrument.change >= 0 ? (
                  <TrendingUp className="size-4" />
                ) : (
                  <TrendingDown className="size-4" />
                )}
                {instrument.change > 0 ? "+" : ""}
                {instrument.change}% 1D
              </span>
            </div>
            <p className="mt-2 text-[10px] text-slate-400">
              Last update: demo snapshot - Market data availability does not
              imply broker trading availability.
            </p>
          </div>
          <div className="border-l border-border bg-slate-50 p-3 max-md:border-l-0 max-md:border-t">
            <div className="flex items-center justify-between">
              <span className="label">Trading access</span>
              <span className="text-[9px] text-violet-600">
                {instrument.symbol}
              </span>
            </div>
            <p className="mt-1 text-xs font-semibold text-slate-900">
              Recommended products
            </p>
            <div className="mt-2 space-y-1.5">
              {recommendedProductCopy(kind).map((option) => (
                <button
                  key={option.product}
                  onClick={() => {
                    setProduct(option.product);
                    setTab("Brokers");
                  }}
                  className="w-full rounded-lg border border-border bg-white p-2 text-left hover:border-violet-300"
                >
                  <span className="block text-[10px] font-semibold text-slate-800">
                    {option.product}
                  </span>
                  <span className="mt-0.5 block text-[9px] text-slate-500">
                    {option.detail}
                  </span>
                </button>
              ))}
            </div>
            <button
              onClick={() => setTab("Brokers")}
              className="primary mt-2 w-full justify-center"
            >
              <BriefcaseBusiness />
              Find broker
            </button>
          </div>
        </div>
        <div className="flex gap-1 overflow-x-auto border-t border-border px-3 py-2">
          {tabs.map((item) => (
            <button
              key={item}
              onClick={() => setTab(item)}
              className={`whitespace-nowrap rounded-lg px-3 py-2 text-[10px] ${tab === item ? "bg-violet-100 font-semibold text-violet-700" : "text-slate-500 hover:bg-slate-50"}`}
            >
              {item}
            </button>
          ))}
        </div>
      </section>
      <DailyMarketFocus instrument={instrument} />
      <div className="mb-1 flex items-center justify-between">
        <span className="label text-violet-600">Market workspace</span>
        <span className="text-[9px] text-slate-400">
          Price, chart, technicals, fundamentals, and products
        </span>
      </div>
      <div className="grid grid-cols-1 items-start gap-4">
        <div className="min-w-0 space-y-4">
          {tab === "Overview" && (
            <AssetOverviewLayout
              instrument={instrument}
              kind={kind}
              onChart={onChart}
              tierLevel={snapshot.level.level}
              onToast={onToast}
              onNews={() => setTab("News")}
            />
          )}
          {tab === "Technicals" && (
            <TechnicalSummary
              instrument={instrument}
              tierLevel={snapshot.level.level}
              onToast={onToast}
            />
          )}
          {tab === "Market Data" && (
            <MarketStats
              instrument={instrument}
              kind={kind}
              tierLevel={snapshot.level.level}
            />
          )}
          {tab === "News" && (
            <News
              instrument={instrument}
              onSelect={(article) => {
                setSelectedNews(article);
                setInsightsOpen(true);
              }}
              onShare={(article) => {
                setSelectedNews(article);
                setShareReference(article);
                setInsightsOpen(true);
              }}
              onCommunity={(article) => {
                setSelectedNews(article);
                setCommunityReference(article);
                setInsightsOpen(true);
              }}
            />
          )}
          {tab === "Analysis" && (
            <Analysis instrument={instrument} kind={kind} />
          )}
          {tab === "Forecast" && (
            <Forecast
              instrument={instrument}
              kind={kind}
              tierLevel={snapshot.level.level}
              userVote={null}
            />
          )}
          {tab === "Products" && (
            <ProductPanel
              products={products}
              product={product}
              setProduct={setProduct}
            />
          )}
          {tab === "Brokers" && (
            <BrokerPanel
              instrument={instrument}
              product={product}
              products={products}
              setProduct={setProduct}
              brokers={matchingBrokers}
            />
          )}
          {tab === "Tokenomics" && (
            <AssetSpecific kind="Crypto" instrument={instrument} />
          )}
          {tab === "Financial Report" && (
            <FinancialReport
              instrument={instrument}
              tierLevel={snapshot.level.level}
              onToast={onToast}
            />
          )}
          {related.length > 0 && (
            <section className="panel p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="label">Related markets</p>
                  <h2 className="mt-1 text-sm font-semibold text-slate-900">
                    Compare nearby indices
                  </h2>
                </div>
                <CircleHelp className="size-4 text-slate-400" />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3 max-md:grid-cols-1">
                {related.map((item) => (
                  <div
                    key={item.symbol}
                    className="rounded-xl border border-border p-3"
                  >
                    <b className="text-sm text-slate-900">{item.name}</b>
                    <p className="mt-1 text-[10px] text-slate-400">
                      {item.symbol}
                    </p>
                    <span
                      className={`mt-3 block text-xs font-semibold ${item.change >= 0 ? "up" : "down"}`}
                    >
                      {item.change > 0 ? "+" : ""}
                      {item.change}%
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
        <aside className="grid grid-cols-2 items-stretch gap-4 max-md:grid-cols-1">
          <div className="panel p-5">
            <p className="label">User workspace</p>
            <h2 className="mt-1 text-sm font-semibold text-slate-900">
              Track {instrument.symbol}
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              Manage watchlist, alerts, broker access, and symbol rewards.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setWatching(!watching);
                  onToast(
                    watching ? "Removed from watchlist" : "Added to watchlist",
                  );
                }}
                className="secondary justify-center"
              >
                <Star />
                {watching ? "Watching" : "Watch"}
              </button>
              <button
                onClick={() => {
                  setAlerting(!alerting);
                  onToast(alerting ? "Alert removed" : "Alert created");
                }}
                className="secondary justify-center"
              >
                <Bell />
                {alerting ? "Active" : "Alert"}
              </button>
            </div>
          </div>
          <CampaignPromotion instrument={instrument} />
        </aside>
      </div>
      {insightsOpen && (
        <InstrumentInsightRail
          instrument={instrument}
          selectedNews={selectedNews}
          shareReference={shareReference}
          communityReference={communityReference}
          onSelectNews={setSelectedNews}
          openNews={() => setTab("News")}
          openChart={onChart}
          onClose={() => setInsightsOpen(false)}
        />
      )}
      <footer className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 text-[9px] text-slate-400">
        <span>MarketSyde · Demo market intelligence</span>
        <span>
          Market data, broker access, rewards, News, and Community remain
          asset-linked to {instrument.symbol}.
        </span>
      </footer>
    </div>
  );
}

function DailyMarketFocus({ instrument }: { instrument: Instrument }) {
  return (
    <section className="rounded-2xl bg-linear-to-r from-violet-700 to-indigo-600 px-5 py-4 text-white shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[.16em] text-violet-200">
            Daily market focus
          </p>
          <h2 className="mt-1 text-sm font-semibold">
            Analyze {instrument.symbol} and review today&apos;s market context
          </h2>
          <p className="mt-1 text-[10px] text-violet-100">
            Chart, News, Community, and broker insights stay linked to{" "}
            {instrument.name}.
          </p>
        </div>
        <button className="rounded-lg bg-white px-3 py-2 text-[10px] font-semibold text-violet-700">
          Open asset checklist
        </button>
      </div>
    </section>
  );
}

function AssetOverviewLayout({
  instrument,
  kind,
  onChart,
  tierLevel = 1,
  onToast = () => undefined,
  onNews,
}: {
  instrument: Instrument;
  kind: string;
  onChart: () => void;
  tierLevel?: number;
  onToast?: (message: string) => void;
  onNews: () => void;
}) {
  return (
    <div className="asset-overview-grid grid grid-cols-[minmax(0,1fr)_300px] items-start gap-4 max-lg:grid-cols-1">
      <section className="min-w-0">
        <News
          instrument={instrument}
          onSelect={() => onNews()}
          onShare={() => onNews()}
          onCommunity={() => onNews()}
        />
      </section>
      <section className="min-w-0">
        <div className="mb-2 flex items-center justify-between">
          <span className="label text-violet-600">Market analysis</span>
          <span className="text-xs text-slate-400">
            Overview, chart, and evidence
          </span>
        </div>
        <Overview
          instrument={instrument}
          kind={kind}
          onChart={onChart}
          tierLevel={tierLevel}
          onToast={onToast}
        />
      </section>
      <CommunityOverviewCard instrument={instrument} />
    </div>
  );
}

function CommunityOverviewCard({ instrument }: { instrument: Instrument }) {
  const bullish = Math.max(0, Math.min(100, Math.round(instrument.sentiment)));
  return (
    <section className="panel p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="label">Community</p>
          <h2 className="mt-1 text-sm font-semibold text-slate-900">
            Sentiment
          </h2>
        </div>
        <Users className="size-4 text-cyan-600" />
      </div>
      <p className="mt-1 text-[10px] text-slate-400">
        Active {instrument.market.toLowerCase()} traders
      </p>
      <div className="mt-4 flex items-center justify-between text-xs">
        <b className="text-emerald-600">{bullish}% Bullish</b>
        <b className="text-rose-600">{100 - bullish}% Bearish</b>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-rose-500">
        <div
          className="h-full bg-emerald-500"
          style={{ width: `${bullish}%` }}
        />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button className="rounded-lg border border-emerald-300 py-2 text-[10px] font-semibold text-emerald-600">
          Vote Bullish
        </button>
        <button className="rounded-lg border border-rose-300 py-2 text-[10px] font-semibold text-rose-600">
          Vote Bearish
        </button>
      </div>
      <div className="mt-4 rounded-xl bg-slate-50 p-3">
        <p className="label">Top predictor</p>
        <div className="mt-2 flex items-center justify-between">
          <b className="text-xs text-slate-800">Maya Chen</b>
          <span className="text-[10px] font-semibold text-violet-600">
            82% accuracy
          </span>
        </div>
        <p className="mt-1 text-[9px] text-slate-400">
          {instrument.symbol} market view
        </p>
      </div>
      <button className="secondary mt-3 w-full justify-center">
        Open Community
      </button>
    </section>
  );
}

function CampaignPromotion({ instrument }: { instrument: Instrument }) {
  const brokers = [
    {
      name: "HFM",
      mark: "HFM",
      tone: "bg-slate-950 text-white",
      points: "1.5x",
      credit: "50 credits",
    },
    {
      name: "Exness",
      mark: "ex",
      tone: "bg-yellow-400 text-slate-950",
      points: "1.25x",
      credit: "50 credits",
    },
    {
      name: "FX Pro",
      mark: "Fx",
      tone: "bg-red-500 text-white",
      points: "1.1x",
      credit: "50 credits",
    },
  ];
  return (
    <section className="panel overflow-hidden">
      <div className="border-b border-border bg-violet-50 px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="label text-violet-600">Campaigns & Brokers</span>
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[8px] font-semibold text-amber-700">
                SPONSORED
              </span>
            </div>
            <h2 className="mt-1 text-sm font-semibold text-slate-900">
              Bonus points for {instrument.symbol}
            </h2>
            <p className="mt-1 text-[10px] text-slate-500">
              Symbol-linked rewards for {instrument.name} · {instrument.market}{" "}
              · {instrument.primaryMarket ?? "Demo venue"}.
            </p>
          </div>
          <button className="secondary">
            <ArrowRight />
            View all brokers
          </button>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3 max-md:grid-cols-1">
          {brokers.map((broker) => (
            <article
              key={broker.name}
              className="rounded-xl border border-violet-100 bg-white p-3 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div
                  className={`grid size-9 place-items-center rounded-lg text-xs font-bold ${broker.tone}`}
                >
                  {broker.mark}
                </div>
                <span className="rounded-full bg-emerald-50 px-2 py-1 text-[8px] font-semibold text-emerald-700">
                  VERIFIED
                </span>
              </div>
              <b className="mt-3 block text-xs text-slate-900">{broker.name}</b>
              <p className="mt-1 text-[10px] font-semibold text-violet-600">
                {broker.credit} for using {broker.name}
              </p>
              <p className="mt-1 text-[9px] text-slate-500">
                {broker.points} points on {instrument.symbol}
              </p>
              <div className="mt-2 space-y-1 border-t border-border pt-2 text-[9px] text-slate-500">
                <div className="flex justify-between">
                  <span>Bonus</span>
                  <b className="text-slate-800">{broker.credit}</b>
                </div>
                <div className="flex justify-between">
                  <span>Asset</span>
                  <b className="text-slate-800">{instrument.symbol}</b>
                </div>
              </div>
              <button className="primary mt-3 w-full justify-center">
                <BriefcaseBusiness />
                View offer
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
function InstrumentInsightRail({
  instrument,
  selectedNews,
  shareReference,
  communityReference,
  onSelectNews,
  openNews,
  openChart,
  onClose,
}: {
  instrument: Instrument;
  selectedNews: InstrumentNews | null;
  shareReference: InstrumentNews | null;
  communityReference: InstrumentNews | null;
  onSelectNews: (article: InstrumentNews) => void;
  openNews: () => void;
  openChart: () => void;
  onClose: () => void;
}) {
  const [communityTab, setCommunityTab] = useState<"Top" | "Latest">("Top");
  const [followed, setFollowed] = useState(false);
  const [draft, setDraft] = useState("");
  const [newsExpanded, setNewsExpanded] = useState(true);
  const [votes, setVotes] = useState<
    Record<
      string,
      { agreement?: "agree" | "disagree"; direction?: "bull" | "bear" }
    >
  >({});
  useEffect(() => {
    if (shareReference)
      setDraft(
        `Sharing ${shareReference.title}  -  #${instrument.symbol}:${instrument.name}`,
      );
  }, [instrument, shareReference]);
  const [panelSize, setPanelSize] = useState({ width: 390, height: 720 });
  const [newsWindowExpanded, setNewsWindowExpanded] = useState(false);
  const newsPanelRef = useRef<PanelImperativeHandle | null>(null);
  const [resizeStart, setResizeStart] = useState<{
    axis: "width" | "height" | "both";
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  useEffect(() => {
    if (!resizeStart) return;
    const move = (event: PointerEvent) =>
      setPanelSize((current) => ({
        width:
          resizeStart.axis === "height"
            ? current.width
            : Math.max(
                320,
                Math.min(
                  window.innerWidth - 32,
                  resizeStart.width + resizeStart.x - event.clientX,
                ),
              ),
        height:
          resizeStart.axis === "width"
            ? current.height
            : Math.max(
                Math.round(window.innerHeight * 0.5),
                Math.min(
                  window.innerHeight - 96,
                  resizeStart.height + event.clientY - resizeStart.y,
                ),
              ),
      }));
    const up = () => setResizeStart(null);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [resizeStart]);
  const news = instrumentNews(instrument);
  const visibleNews = newsExpanded ? news : news.slice(0, 4);
  const toggleNewsWindow = () => {
    const expanded = !newsWindowExpanded;
    setNewsWindowExpanded(expanded);
    newsPanelRef.current?.resize(expanded ? "95%" : "85%");
  };
  const setBalancedLayout = () => {
    setNewsWindowExpanded(false);
    newsPanelRef.current?.resize("50%");
  };
  const posts = communityReference
    ? [
        {
          author: "Topic thread",
          role: "Community share",
          text: `Discussing: ${communityReference.title}`,
          sentiment: "Watch",
        },
      ]
    : communityTab === "Top"
      ? [
          {
            author: "Daniel_Markson",
            role: "Momentum desk",
            text: `Watching ${instrument.symbol}: the move has better participation than the prior session.`,
            sentiment: "Bullish",
          },
          {
            author: "CLORA",
            role: "Community analyst",
            text: `The ${instrument.symbol} setup looks constructive, but I want confirmation before adding risk.`,
            sentiment: "Watch",
          },
        ]
      : [
          {
            author: "Maya Chen",
            role: "Marketsyde Pro",
            text: `Fresh read on ${instrument.symbol}: volume and breadth are moving together.`,
            sentiment: "Bullish",
          },
          {
            author: "Jon Bell",
            role: "Risk monitor",
            text: `Keeping a tight invalidation level around this ${instrument.market.toLowerCase()} setup.`,
            sentiment: "Watch",
          },
        ];
  const updateVote = (
    author: string,
    kind: "agreement" | "direction",
    value: "agree" | "disagree" | "bull" | "bear",
  ) =>
    setVotes((current) => ({
      ...current,
      [author]: {
        ...current[author],
        [kind]: current[author]?.[kind] === value ? undefined : value,
      },
    }));
  return (
    <aside
      style={{ width: panelSize.width, height: panelSize.height }}
      className="instrument-insights fixed right-0 top-16 bottom-0 z-40 min-h-[420px] min-w-[320px] max-w-[calc(100vw-2rem)] overflow-hidden border-l border-border bg-white shadow-none"
    >
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <div>
          <p className="label">Asset insights</p>
          <p className="mt-0.5 text-[10px] text-slate-400">
            {instrument.name} - {instrument.symbol}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-amber-50 px-2 py-1 text-[9px] font-semibold text-amber-600">
            MOCK
          </span>
          <button
            aria-label="Close asset insights"
            onClick={onClose}
            className="text-lg leading-none text-slate-400 hover:text-slate-700"
          >
            x
          </button>
        </div>
      </div>
      <ResizablePanelGroup
        orientation="vertical"
        className="h-[calc(100%-47px)] min-h-0"
      >
        <ResizablePanel
          id="news-panel"
          panelRef={newsPanelRef}
          defaultSize="75%"
          minSize="10%"
          maxSize="85%"
          className="min-h-0 overflow-y-auto"
        >
          <div className="p-3">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Newspaper className="size-3.5 text-violet-600" />
                <b className="text-xs text-slate-900">News</b>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] text-slate-400">
                  {news.length} articles
                </span>
                <button
                  onClick={() => setNewsExpanded(!newsExpanded)}
                  className="text-[9px] font-semibold text-violet-600"
                >
                  {newsExpanded ? "Show less" : "Show more"}
                </button>
                <button
                  onClick={setBalancedLayout}
                  title="Set News and Community to equal height"
                  className="text-[9px] font-semibold text-slate-500 hover:text-violet-600"
                >
                  50/50
                </button>
                <button
                  onClick={toggleNewsWindow}
                  title={
                    newsWindowExpanded
                      ? "Restore News window"
                      : "Expand News window"
                  }
                  aria-label={
                    newsWindowExpanded
                      ? "Restore News window"
                      : "Expand News window"
                  }
                  className="text-slate-400 hover:text-violet-600"
                >
                  {newsWindowExpanded ? (
                    <Minimize2 className="size-3" />
                  ) : (
                    <Maximize2 className="size-3" />
                  )}
                </button>
              </div>
            </div>
            <div className="space-y-3">
              {visibleNews.map((item) => (
                <article
                  key={item.title}
                  className="border-b border-border pb-3 last:border-0"
                >
                  <div className="flex justify-between text-[9px] text-slate-400">
                    <span>{item.source}</span>
                    <span>{item.time}</span>
                  </div>
                  <h3 className="mt-1 text-[11px] font-semibold leading-snug text-slate-800">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-[10px] leading-relaxed text-slate-500">
                    {item.summary}
                  </p>
                  <button className="mt-2 text-[9px] font-medium text-violet-600">
                    Read article <ArrowRight className="ml-1 inline size-2.5" />
                  </button>
                </article>
              ))}
            </div>
          </div>
        </ResizablePanel>
        <ResizableHandle className="relative z-50 !my-1 !h-2 !w-full !shrink-0 cursor-row-resize border-y border-slate-200 bg-slate-50 hover:border-violet-300 hover:bg-violet-50" />
        <ResizablePanel
          id="community-panel"
          defaultSize="25%"
          minSize="15%"
          className="min-h-0 overflow-y-auto bg-white"
        >
          <div className="p-3">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <MessageCircle className="size-3.5 text-cyan-600" />
                <b className="text-xs text-slate-900">Community</b>
              </div>
              <span className="flex items-center gap-1 text-[9px] text-slate-400">
                <Users className="size-3" /> 6.7M votes
              </span>
            </div>
            <div className="rounded-lg border border-border bg-white p-2.5">
              <div className="flex items-center justify-between text-[9px]">
                <b className="text-slate-700">Community sentiment</b>
                <span className="font-semibold text-violet-600">See more</span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className="font-semibold text-emerald-600">74%</span>
                <div className="flex h-2 flex-1 overflow-hidden rounded-full bg-rose-500">
                  <div className="w-3/4 bg-emerald-500" />
                </div>
                <span className="font-semibold text-rose-600">26%</span>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <button className="rounded-md border border-emerald-400 py-1 text-[9px] font-semibold text-emerald-600">
                  Bullish
                </button>
                <button className="rounded-md border border-rose-400 py-1 text-[9px] font-semibold text-rose-600">
                  Bearish
                </button>
              </div>
            </div>
            <div className="mt-3 flex rounded-lg bg-slate-100 p-1">
              <button
                onClick={() => setCommunityTab("Top")}
                className={`flex-1 rounded-md py-1.5 text-[10px] font-semibold ${communityTab === "Top" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500"}`}
              >
                Top
              </button>
              <button
                onClick={() => setCommunityTab("Latest")}
                className={`flex-1 rounded-md py-1.5 text-[10px] font-semibold ${communityTab === "Latest" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500"}`}
              >
                Latest
              </button>
            </div>
            <div className="mt-3 space-y-3">
              {posts.map((post, index) => (
                <article
                  key={post.author}
                  className="border-b border-border pb-3 last:border-0"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="grid size-6 shrink-0 place-items-center rounded-full bg-slate-900 text-[9px] font-bold text-white">
                        {post.author.slice(0, 1)}
                      </span>
                      <div>
                        <b className="block text-[10px] text-slate-800">
                          {post.author}
                        </b>
                        <span className="text-[9px] text-slate-400">
                          {post.role} - {index ? "21h" : "19h"}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setFollowed(!followed)}
                      className={`rounded-md px-2.5 py-1.5 text-[9px] font-semibold ${followed ? "bg-slate-100 text-slate-600" : "bg-violet-600 text-white"}`}
                    >
                      {followed ? "Following" : "+ Follow"}
                    </button>
                  </div>
                  <p className="mt-2 text-[11px] leading-relaxed text-slate-700">
                    {post.text}{" "}
                    <span className="font-medium text-violet-600">
                      #{instrument.symbol.replace("/", "")}
                    </span>
                  </p>
                  <button
                    onClick={openChart}
                    aria-label={`Open full chart for ${instrument.symbol}`}
                    className="mt-2 block h-20 w-full rounded-lg bg-[#0b1119] p-2 text-left hover:ring-1 hover:ring-cyan-400/60"
                  >
                    <div className="relative h-full overflow-hidden">
                      <svg
                        viewBox="0 0 320 64"
                        preserveAspectRatio="none"
                        className="absolute inset-0 size-full"
                      >
                        <polyline
                          points="0,48 32,42 64,49 96,30 128,36 160,24 192,31 224,18 256,23 288,10 320,15"
                          fill="none"
                          stroke="#34d399"
                          strokeWidth="2"
                        />
                        <polyline
                          points="0,58 320,58"
                          fill="none"
                          stroke="#ffffff33"
                          strokeDasharray="3 4"
                        />
                      </svg>
                      <div className="relative flex h-full items-end justify-between">
                        <span className="rounded bg-black/50 px-1.5 py-1 text-[9px] font-semibold text-cyan-200">
                          {instrument.symbol} · SHARED CHART
                        </span>
                        <span className="rounded bg-black/50 px-1.5 py-1 text-[8px] text-emerald-300">
                          Open full chart
                        </span>
                      </div>
                    </div>
                  </button>
                  <div className="mt-2 grid grid-cols-4 gap-1.5">
                    <button
                      title="Agree"
                      aria-label="Agree with this post"
                      onClick={() =>
                        updateVote(post.author, "agreement", "agree")
                      }
                      className={`flex items-center justify-center gap-1 rounded border px-2 py-1 text-[8px] font-semibold ${votes[post.author]?.agreement === "agree" ? "border-emerald-400 bg-emerald-50 text-emerald-700" : "border-border text-slate-500"}`}
                    >
                      <ThumbsUp className="size-3.5" />
                    </button>
                    <button
                      title="Disagree"
                      aria-label="Disagree with this post"
                      onClick={() =>
                        updateVote(post.author, "agreement", "disagree")
                      }
                      className={`flex items-center justify-center gap-1 rounded border px-2 py-1 text-[8px] font-semibold ${votes[post.author]?.agreement === "disagree" ? "border-rose-400 bg-rose-50 text-rose-700" : "border-border text-slate-500"}`}
                    >
                      <ThumbsDown className="size-3.5" />
                    </button>
                    <button
                      title="Bull"
                      aria-label="Vote bullish on this post"
                      onClick={() =>
                        updateVote(post.author, "direction", "bull")
                      }
                      className={`flex items-center justify-center gap-1 rounded border px-2 py-1 text-[8px] font-semibold ${votes[post.author]?.direction === "bull" ? "border-cyan-400 bg-cyan-50 text-cyan-700" : "border-border text-slate-500"}`}
                    >
                      <TrendingUp className="size-3.5" />
                    </button>
                    <button
                      title="Bear"
                      aria-label="Vote bearish on this post"
                      onClick={() =>
                        updateVote(post.author, "direction", "bear")
                      }
                      className={`flex items-center justify-center gap-1 rounded border px-2 py-1 text-[8px] font-semibold ${votes[post.author]?.direction === "bear" ? "border-amber-400 bg-amber-50 text-amber-700" : "border-border text-slate-500"}`}
                    >
                      <TrendingDown className="size-3.5" />
                    </button>
                  </div>
                </article>
              ))}
            </div>
            <div className="mt-2 flex items-center gap-2 rounded-lg bg-slate-100 p-1.5">
              <span className="grid size-6 place-items-center rounded-full bg-slate-300 text-[9px] text-white">
                @
              </span>
              <input
                aria-label={`Post about ${instrument.symbol}`}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder={`$${instrument.symbol} How do you feel today?`}
                className="min-w-0 flex-1 bg-transparent px-1 text-[10px] text-slate-700 outline-none"
              />
              <button
                onClick={() => setDraft("")}
                className="rounded-md bg-violet-600 px-3 py-1.5 text-[9px] font-semibold text-white"
              >
                <Send className="size-3" />
              </button>
            </div>
          </div>
        </ResizablePanel>
        <ResizableHandle className="relative z-50 !my-1 !h-2 !w-full !shrink-0 cursor-row-resize border-y border-slate-200 bg-slate-50 hover:border-violet-300 hover:bg-violet-50" />
        <ResizablePanel
          id="promotion-panel"
          defaultSize="10%"
          minSize="8%"
          maxSize="25%"
          className="min-h-0 overflow-y-auto"
        >
          <div className="p-3">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="size-3.5 text-violet-600" />
                <b className="text-xs text-slate-900">Campaigns & Brokers</b>
              </div>
              <span className="rounded-full bg-amber-50 px-2 py-1 text-[8px] font-semibold text-amber-600">
                SPONSORED
              </span>
            </div>
            <div className="rounded-lg border border-violet-200 bg-violet-50 p-2.5">
              <p className="text-[10px] font-semibold text-slate-800">
                Trade {instrument.symbol} with a matched broker
              </p>
              <p className="mt-1 text-[9px] leading-relaxed text-slate-500">
                Compare demo access, product availability, and campaign rewards
                for this asset.
              </p>
              <div className="mt-2 flex gap-1.5">
                <button className="flex-1 rounded-md bg-violet-600 px-2 py-1.5 text-[9px] font-semibold text-white">
                  View brokers
                </button>
                <button className="rounded-md border border-violet-200 bg-white px-2 py-1.5 text-[9px] font-semibold text-violet-700">
                  Campaign
                </button>
              </div>
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
      <div className="pointer-events-none absolute bottom-1 right-1 text-xs text-slate-300">
        ◈
      </div>
      <button
        aria-label="Resize insights width"
        onPointerDown={(event) =>
          setResizeStart({
            axis: "width",
            x: event.clientX,
            y: event.clientY,
            width: panelSize.width,
            height: panelSize.height,
          })
        }
        className="absolute inset-y-12 left-0 w-1 cursor-ew-resize bg-transparent hover:bg-violet-200/60"
      />
      <button
        aria-label="Resize insights height"
        onPointerDown={(event) =>
          setResizeStart({
            axis: "height",
            x: event.clientX,
            y: event.clientY,
            width: panelSize.width,
            height: panelSize.height,
          })
        }
        className="absolute inset-x-12 bottom-0 h-1 cursor-ns-resize bg-transparent hover:bg-violet-200/60"
      />
      <button
        aria-label="Resize insights width and height"
        onPointerDown={(event) =>
          setResizeStart({
            axis: "both",
            x: event.clientX,
            y: event.clientY,
            width: panelSize.width,
            height: panelSize.height,
          })
        }
        className="absolute bottom-0 left-0 size-4 cursor-nwse-resize bg-slate-200/70"
      />
    </aside>
  );
}

function Overview({
  instrument,
  kind,
  onChart,
  tierLevel = 1,
  onToast = () => undefined,
  chartOpen = false,
  chartContent = null,
  showLinkedTags = true,
  onShowLinkedTagsChange = () => undefined,
  tabs = null,
}: {
  instrument: Instrument;
  kind: string;
  onChart: () => void;
  tierLevel?: number;
  onToast?: (message: string) => void;
  chartOpen?: boolean;
  chartContent?: ReactNode;
  showLinkedTags?: boolean;
  onShowLinkedTagsChange?: (show: boolean) => void;
  tabs?: ReactNode;
}) {
  const { requestUnlock } = useMarketEngagement();
  const [period, setPeriod] = useState<PerformancePeriod>("1D");
  const [compareRange, setCompareRange] = useState<CompareRange>("1d");
  const [openLinkedTag, setOpenLinkedTag] = useState<string | null>(null);
  const selectedReturn = compareReturn(instrument, compareRange);
  const series = performanceSeries(instrument, period, selectedReturn);
  const low = Math.min(...series);
  const high = Math.max(...series);
  const range = Math.max(high - low, 0.0001);
  const points = series
    .map(
      (value, index) =>
        `${(index / (series.length - 1)) * 100},${94 - ((value - low) / range) * 76}`,
    )
    .join(" ");
  const changeLabel = `${selectedReturn >= 0 ? "+" : ""}${selectedReturn.toFixed(2)}%`;
  const volatility = (
    Math.abs(selectedReturn) * 0.42 +
    (period === "1D" ? 8 : period === "1W" ? 11 : period === "1M" ? 16 : 27)
  ).toFixed(1);
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_320px] gap-4 max-xl:grid-cols-1">
      <section className="panel p-5">
        {tabs}
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="label">Performance</p>
            <h2 className="mt-1 text-sm font-semibold text-slate-900">
              {instrument.symbol} price performance
            </h2>
            <p className="mt-1 text-[10px] text-slate-400">
              Demo price series · {compareRange} range
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="seg" aria-label="Chart display">
              <button
                onClick={() => chartOpen && onChart()}
                className={!chartOpen ? "active" : ""}
              >
                Performance
              </button>
              <button
                onClick={() => {
                  if (tierLevel < 2) {
                    requestUnlock("advancedChart");
                    return;
                  }
                  if (!chartOpen) onChart();
                }}
                className={`${chartOpen ? "active" : ""} ${tierLevel < 2 ? "cursor-not-allowed opacity-50" : ""}`}
                aria-disabled={tierLevel < 2}
                title={tierLevel < 2 ? "Requires Level 2" : "Open advanced chart"}
              >
                Advanced chart
                {tierLevel < 2 && <Lock className="ml-1 inline size-2.5" />}
              </button>
            </div>
            {!chartOpen && (
              <>
                <div className="seg">
                  {(["1D", "1W", "1M", "1Y"] as PerformancePeriod[]).map(
                    (item) => {
                      const requiredTier = historicalTierForTimeframe(item);
                      const locked = requiredTier > tierLevel;
                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() => {
                            if (locked) {
                              requestUnlock(requiredTier >= 3 ? "performanceAnalytics" : "historicalData");
                              return;
                            }
                            setPeriod(item);
                            setCompareRange(periodToRange[item]);
                          }}
                          aria-disabled={locked}
                          title={locked ? `Requires Level ${requiredTier}` : `Use ${item} performance`}
                          className={`${period === item ? "active" : ""} ${locked ? "cursor-not-allowed opacity-50" : ""}`}
                        >
                          {item}
                          {locked && <Lock className="ml-1 inline size-2.5" />}
                        </button>
                      );
                    },
                  )}
                </div>
              </>
            )}
          </div>
        </div>
        {chartOpen ? (
          <div className="mt-5 min-w-0 overflow-hidden rounded-xl">
            {chartContent}
          </div>
        ) : (
          <>
            <div className="relative mt-5 h-52 overflow-hidden rounded-xl border border-border bg-white grid-surface">
              <svg
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                className="absolute inset-0 size-full"
              >
                <defs>
                  <linearGradient
                    id="instrumentArea"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#7c3aed" stopOpacity=".24" />
                    <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <polyline
                  points={`0,94 ${points} 100,94`}
                  fill="url(#instrumentArea)"
                  stroke="none"
                />
                <polyline
                  points={points}
                  fill="none"
                  stroke="#7c3aed"
                  strokeWidth="1.8"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
              <div className="absolute left-3 top-3 rounded-md bg-white/85 px-2 py-1 text-[10px] font-semibold text-slate-600">
                {compareRange} - {changeLabel}
              </div>
              <div className="absolute right-3 top-3 rounded-md bg-white/85 px-2 py-1 text-[9px] text-slate-500">
                Max ({compareRange}){" "}
                {displayValue({ ...instrument, price: high })}
              </div>
              <div className="absolute right-3 bottom-7 rounded-md bg-white/85 px-2 py-1 text-[9px] text-slate-500">
                Min ({compareRange}){" "}
                {displayValue({ ...instrument, price: low })}
              </div>
              {showLinkedTags &&
                marketTagTopics.map((topic, index) => (
                  <span
                    key={topic}
                    id={`chart-${instrument.symbol.replaceAll("/", "-")}-${topic}`}
                    className="market-tag-target absolute z-10"
                    style={{
                      left: `${index === marketTagTopics.length - 1 ? 92 : 22 + index * 14}%`,
                      top: `${68 - index * 10}%`,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setOpenLinkedTag((current) =>
                          current === topic ? null : topic,
                        );
                        const post = document.getElementById(
                          `community-${instrument.symbol.replaceAll("/", "-")}-${topic}`,
                        );
                        post?.scrollIntoView({ behavior: "smooth", block: "center" });
                        post?.classList.add("concept-post-focus");
                        window.setTimeout(
                          () => post?.classList.remove("concept-post-focus"),
                          2200,
                        );
                      }}
                      aria-expanded={openLinkedTag === topic}
                      aria-label={`Choose destination for ${instrument.symbol} ${topic}`}
                      className="grid size-5 place-items-center rounded-full border-2 border-white bg-violet-600 text-[7px] font-bold text-white shadow-md transition hover:scale-125"
                    >
                      {index + 1}
                    </button>
                    <span
                      className={`absolute bottom-full left-1/2 mb-2 w-max -translate-x-1/2 rounded-lg bg-slate-900 p-2 text-[8px] font-medium text-white shadow-xl ${openLinkedTag === topic ? "block" : "hidden"}`}
                    >
                      <b className="mb-1 block text-violet-300">
                        #{instrument.symbol}_{topic}
                      </b>
                      <span className="flex gap-2">
                        <a
                          onClick={() => setOpenLinkedTag(null)}
                          className="rounded bg-white/10 px-2 py-1 hover:bg-white/20"
                          href={`#news-${instrument.symbol.replaceAll("/", "-")}-${topic}`}
                        >
                          News
                        </a>
                      </span>
                    </span>
                  </span>
                ))}
              <div className="absolute bottom-2 left-3 right-3 flex justify-between text-[9px] text-slate-400">
                <span>{compareRange} range</span>
                <span>Now - {displayValue(instrument)}</span>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-6 gap-3 max-xl:grid-cols-3 max-md:grid-cols-2">
              <Metric label={`${compareRange} return`} value={changeLabel} />
              <Metric
                label={`Min (${compareRange})`}
                value={displayValue({ ...instrument, price: low })}
              />
              <Metric
                label={`Max (${compareRange})`}
                value={displayValue({ ...instrument, price: high })}
              />
              <Metric
                label="Price range"
                value={`${displayValue({ ...instrument, price: low })} - ${displayValue({ ...instrument, price: high })}`}
              />
              <Metric label="Last price" value={displayValue(instrument)} />
              <Metric
                label="Signal"
                value={`${instrument.signal} ${instrument.confidence}%`}
              />
            </div>
          </>
        )}
        <div className="mt-4 flex justify-end">
          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-white px-2.5 py-2 text-[9px] font-medium text-slate-600">
            <input
              type="checkbox"
              checked={showLinkedTags}
              onChange={(event) => onShowLinkedTagsChange(event.target.checked)}
              className="accent-violet-600"
            />
            Linked tags
          </label>
        </div>
      </section>
      <section className="panel p-5">
        <p className="label">Key information</p>
        <div className="mt-3 space-y-3">
          <InfoRow label="Asset class" value={kind} />
          <InfoRow
            label="Venue"
            value={instrument.primaryMarket ?? instrument.market}
          />
          <InfoRow label="Sector" value={instrument.sector} />
          <InfoRow
            label="Sub-sector"
            value={instrument.subSector ?? "Unclassified"}
          />
          <InfoRow
            label="Market status"
            value={kind === "Crypto" ? "Open 24/7" : "Demo session"}
          />
          <InfoRow label="Data status" value="Delayed demo" />
        </div>
      </section>
    </div>
  );
}

function TechnicalSummary({
  instrument,
  tierLevel,
  onToast,
}: {
  instrument: Instrument;
  tierLevel: number;
  onToast: (message: string) => void;
}) {
  const { requestUnlock } = useMarketEngagement();
  const technicalIntervals = [
    { label: "1 minute", level: 3, scale: 0.18 },
    { label: "5 minutes", level: 3, scale: 0.24 },
    { label: "15 minutes", level: 3, scale: 0.32 },
    { label: "30 minutes", level: 3, scale: 0.4 },
    { label: "1 hour", level: 1, scale: 0.5 },
    { label: "2 hours", level: 1, scale: 0.62 },
    { label: "4 hours", level: 1, scale: 0.74 },
    { label: "1 day", level: 1, scale: 1 },
    { label: "1 week", level: 2, scale: 1.35 },
    { label: "1 month", level: 3, scale: 1.8 },
  ];
  const [technicalInterval, setTechnicalInterval] = useState("1 day");
  const [customAveragePeriod, setCustomAveragePeriod] = useState("");
  const [customAveragePeriods, setCustomAveragePeriods] = useState<number[]>([]);
  const [customOscillatorPeriod, setCustomOscillatorPeriod] = useState("");
  const [customOscillatorPeriods, setCustomOscillatorPeriods] = useState<number[]>([]);
  const [hiddenTechnicalParameters, setHiddenTechnicalParameters] = useState<string[]>([]);
  const intervalScale =
    technicalIntervals.find((interval) => interval.label === technicalInterval)
      ?.scale ?? 1;
  const intervalRsi = Math.max(
    0,
    Math.min(100, 50 + (instrument.rsi - 50) * intervalScale),
  );
  const intervalReturn = instrument.return1m * intervalScale;
  const oscillatorScore = Math.max(0, Math.min(100, 100 - intervalRsi));
  const movingAverageScore = Math.max(
    0,
    Math.min(100, 50 + intervalReturn * 2.5),
  );
  const overallScore = Math.round(
    (oscillatorScore + movingAverageScore + instrument.confidence) / 3,
  );
  const oscillators = [
    ["Relative Strength Index (14)", intervalRsi.toFixed(2)],
    ["Stochastic %K (14, 3, 3)", (intervalRsi * 0.96).toFixed(2)],
    ["Commodity Channel Index (20)", (-intervalRsi * 0.39).toFixed(2)],
    ["Average Directional Index (14)", (instrument.rvol * 7.1).toFixed(2)],
    ["Oscillator", (intervalReturn * 0.21 - 2.75).toFixed(2)],
    ["Momentum (10)", (intervalReturn * 0.76).toFixed(2)],
    ["MACD Level (12, 26)", (intervalReturn * 0.2).toFixed(2)],
    ["Stochastic RSI Fast (3, 3, 14, 14)", (intervalRsi * 0.18).toFixed(2)],
    ["Williams Percent Range (14)", (-100 + intervalRsi * 0.5).toFixed(2)],
    ["Bull Bear Power", (intervalReturn * 0.32 - 6.67).toFixed(2)],
    ["Ultimate Oscillator (7, 14, 28)", (intervalRsi * 0.75).toFixed(2)],
  ];
  customOscillatorPeriods.forEach((period) => {
    oscillators.push([
      `Custom Oscillator (${period}) · User`,
      (intervalRsi * (period / 14)).toFixed(2),
      intervalRsi >= 50 ? "Buy" : "Sell",
      String(period),
    ]);
  });
  const averagePeriods = [10, 20, 30, 50, 100, 200];
  const averages = averagePeriods.flatMap((period) => {
    const exponential = instrument.price * (1 - intervalReturn / 1000 - period / 10000);
    const simple = instrument.price * (1 - intervalReturn / 900 - period / 9500);
    return [
      [`Exponential Moving Average (${period})`, exponential.toFixed(2), period <= 20 ? "Sell" : "Buy"],
      [`Simple Moving Average (${period})`, simple.toFixed(2), period <= 30 ? "Sell" : "Buy"],
    ];
  });
  averages.push(
    ["Ichimoku Base Line (9, 26, 52, 26)", (instrument.price * (1 - intervalReturn / 1100)).toFixed(2), "Neutral"],
    ["Volume Weighted Moving Average (20)", (instrument.price * (1 - intervalReturn / 980)).toFixed(2), intervalReturn > 0 ? "Buy" : "Sell"],
    ["Hull Moving Average (9)", (instrument.price * (1 - intervalReturn / 850)).toFixed(2), intervalReturn > 0 ? "Buy" : "Sell"],
  );
  customAveragePeriods.forEach((period) => {
    averages.push([
      `Simple Moving Average (${period}) · User`,
      (instrument.price * (1 - intervalReturn / 900 - period / 9500)).toFixed(2),
      intervalReturn > 0 ? "Buy" : "Sell",
      String(period),
    ]);
  });
  const visibleTechnicalToolCount = tierLevel >= 3 ? Number.POSITIVE_INFINITY : tierLevel >= 2 ? 7 : 5;
  const availableOscillators = oscillators.filter(([name]) => !hiddenTechnicalParameters.includes(name));
  const availableAverages = averages.filter(([name]) => !hiddenTechnicalParameters.includes(name));
  return (
    <section className="panel p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="label">Technical summary</p>
          <h2 className="mt-1 text-sm font-semibold text-slate-900">
            Evidence, not an instruction
          </h2>
        </div>
        <span className="badge positive">
          {instrument.signal} - {instrument.confidence}%
        </span>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-1 rounded-lg border border-slate-200 bg-white p-1">
        {technicalIntervals.map((interval) => {
          const locked = tierLevel < interval.level;
          return (
            <button
              key={interval.label}
              type="button"
              aria-pressed={technicalInterval === interval.label}
              title={locked ? `Requires Level ${interval.level}` : `Use ${interval.label} interval`}
              onClick={() => {
                if (locked) {
                  requestUnlock(interval.level >= 3 ? "technicalIntervals" : "historicalData");
                  return;
                }
                setTechnicalInterval(interval.label);
              }}
              className={`rounded px-3 py-2 text-[10px] font-medium transition ${
                technicalInterval === interval.label
                  ? "bg-slate-100 text-slate-900 shadow-sm"
                  : locked
                    ? "cursor-not-allowed text-slate-300 blur-[1px] opacity-55"
                    : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              {interval.label}
            </button>
          );
        })}
      </div>
      <div className="mt-5 grid grid-cols-3 gap-3 max-md:grid-cols-1">
        <CompassGauge
          label="Oscillators"
          score={oscillatorScore}
          detail={`RSI 14  -  ${intervalRsi.toFixed(1)}`}
        />
        <CompassGauge
          label="Moving averages"
          score={movingAverageScore}
          detail={`${technicalInterval} trend  -  ${intervalReturn > 0 ? "+" : ""}${intervalReturn.toFixed(2)}%`}
        />
        <CompassGauge
          label="Overall summary"
          score={overallScore}
          detail={`Confidence  -  ${instrument.confidence}%`}
        />
      </div>
      <div className="mt-5 rounded-xl bg-slate-50 p-4 text-xs text-slate-600">
        RSI 14 is {intervalRsi.toFixed(2)} for {technicalInterval}. Relative volume is {instrument.rvol}x.
        Confidence summarizes demo evidence quality and is not a probability of
        profit.
      </div>
      <div className="mt-5 grid grid-cols-2 gap-6 max-lg:grid-cols-1">
        <TechnicalTable
          title="Oscillators"
          rows={availableOscillators}
          visibleCount={visibleTechnicalToolCount}
          canCustomize={tierLevel >= 3}
          customPeriod={customOscillatorPeriod}
          onCustomPeriodChange={setCustomOscillatorPeriod}
          onAddCustomPeriod={() => {
            const period = Number.parseInt(customOscillatorPeriod, 10);
            if (!Number.isInteger(period) || period < 2 || period > 500) {
              onToast("Enter an oscillator period from 2 to 500.");
              return;
            }
            if (!customOscillatorPeriods.includes(period)) {
              setCustomOscillatorPeriods((current) => [...current, period].sort((a, b) => a - b));
            }
            setCustomOscillatorPeriod("");
          }}
          onRemoveCustomPeriod={(period) =>
            setCustomOscillatorPeriods((current) => current.filter((item) => item !== period))
          }
          customLabel="Custom Oscillator"
          canRemoveBuiltIn={tierLevel >= 3}
          onRemoveBuiltIn={(name) =>
            setHiddenTechnicalParameters((current) => [...current, name])
          }
        />
        <TechnicalTable
          title="Moving Averages"
          rows={availableAverages}
          visibleCount={visibleTechnicalToolCount}
          canCustomize={tierLevel >= 3}
          customPeriod={customAveragePeriod}
          onCustomPeriodChange={setCustomAveragePeriod}
          onAddCustomPeriod={() => {
            const period = Number.parseInt(customAveragePeriod, 10);
            if (!Number.isInteger(period) || period < 2 || period > 500) {
              onToast("Enter a moving-average period from 2 to 500.");
              return;
            }
            if (!customAveragePeriods.includes(period)) {
              setCustomAveragePeriods((current) => [...current, period].sort((a, b) => a - b));
            }
            setCustomAveragePeriod("");
          }}
          onRemoveCustomPeriod={(period) =>
            setCustomAveragePeriods((current) => current.filter((item) => item !== period))
          }
          customLabel="Simple Moving Average"
          canRemoveBuiltIn={tierLevel >= 3}
          onRemoveBuiltIn={(name) =>
            setHiddenTechnicalParameters((current) => [...current, name])
          }
        />
      </div>
      <div className="mt-4 rounded-lg border border-dashed border-slate-200 bg-white p-3">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[10px] font-semibold text-slate-600">Removed tools</p>
          <span className="text-[9px] text-slate-400">Restore any parameter</span>
        </div>
        {hiddenTechnicalParameters.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {hiddenTechnicalParameters.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() =>
                  setHiddenTechnicalParameters((current) =>
                    current.filter((item) => item !== name),
                  )
                }
                className="rounded border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] text-slate-600 hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700"
                title={`Restore ${name}`}
              >
                + {name}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-[10px] text-slate-400">No removed tools yet.</p>
        )}
      </div>
    </section>
  );
}

function TechnicalTable({
  title,
  rows,
  visibleCount,
  canCustomize = false,
  customPeriod,
  onCustomPeriodChange,
  onAddCustomPeriod,
  onRemoveCustomPeriod,
  customLabel = "Simple Moving Average",
  canRemoveBuiltIn = false,
  onRemoveBuiltIn,
}: {
  title: string;
  rows: string[][];
  visibleCount?: number;
  canCustomize?: boolean;
  customPeriod?: string;
  onCustomPeriodChange?: (value: string) => void;
  onAddCustomPeriod?: () => void;
  onRemoveCustomPeriod?: (period: number) => void;
  customLabel?: string;
  canRemoveBuiltIn?: boolean;
  onRemoveBuiltIn?: (name: string) => void;
}) {
  const { requestUnlock } = useMarketEngagement();
  const [periodEdits, setPeriodEdits] = useState<Record<string, string[]>>({});
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">{title} ›</h3>
      </div>
      <div className="overflow-hidden rounded-lg border border-slate-200">
        {rows.map(([name, value, action, customPeriodValue], rowIndex) => {
          const locked = rowIndex >= (visibleCount ?? Number.POSITIVE_INFINITY);
          const periodMatch = name.match(/^(.*)\((\d[^)]*)\)(.*)$/);
          const periodValues =
            periodEdits[name] ??
            periodMatch?.[2].split(",").map((period) => period.trim()) ??
            [];
          return (
          <div
            key={name}
            onClick={() => locked && requestUnlock("technicalTools")}
            role={locked ? "button" : undefined}
            tabIndex={locked ? 0 : undefined}
            onKeyDown={(event) => {
              if (locked && (event.key === "Enter" || event.key === " ")) {
                event.preventDefault();
                requestUnlock("technicalTools");
              }
            }}
            title={locked ? "Choose a credit unlock for advanced technical tools" : undefined}
            className={`grid grid-cols-[minmax(0,1fr)_70px_52px] items-center gap-2 border-b border-slate-100 px-3 py-2 text-[10px] last:border-b-0 ${
              locked ? "select-none blur-[2px] opacity-45" : ""
            }`}
          >
            <span className="flex items-center gap-1 text-slate-700">
              {periodMatch && !customPeriodValue ? (
                <>
                  {periodMatch[1]}[
                  {periodValues.map((period, periodIndex) => (
                    <input
                      key={`${name}-${periodIndex}`}
                      type="number"
                      min="2"
                      max="500"
                      value={period}
                      onChange={(event) =>
                        setPeriodEdits((current) => ({
                          ...current,
                          [name]: periodValues.map((value, index) =>
                            index === periodIndex ? event.target.value : value,
                          ),
                        }))
                      }
                      readOnly={!canCustomize || locked}
                      onClick={() => (!canCustomize || locked) && requestUnlock("technicalParameters")}
                      title={!canCustomize ? "Choose a credit unlock to edit custom periods" : "Edit parameter period"}
                      aria-label={`Edit period ${periodIndex + 1} for ${periodMatch[1].trim()}`}
                      className="mx-0.5 w-10 min-w-[2.5rem] rounded border border-slate-300 bg-white px-1 text-center text-[10px] outline-none disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                    />
                  ))}
                  ]{periodMatch[3]}
                </>
              ) : (
                name
              )}
              {!customPeriodValue && !locked && canRemoveBuiltIn && onRemoveBuiltIn && (
                <button
                  type="button"
                  onClick={() => onRemoveBuiltIn(name)}
                  className="rounded text-slate-400 hover:text-rose-500"
                  title="Remove this parameter"
                  aria-label={`Remove ${name}`}
                >
                  <Minus size={11} />
                </button>
              )}
              {customPeriodValue && !locked && onRemoveCustomPeriod && (
                <button
                  type="button"
                  onClick={() => onRemoveCustomPeriod(Number(customPeriodValue))}
                  className="rounded text-slate-400 hover:text-rose-500"
                  title="Remove custom parameter"
                  aria-label={`Remove ${customPeriodValue}-period parameter`}
                >
                  <Minus size={11} />
                </button>
              )}
            </span>
            <span className="text-right font-medium text-slate-800">{value}</span>
            <span className="flex items-center justify-end gap-1">
              <span className={action === "Buy" ? "text-blue-600" : action === "Sell" ? "text-rose-500" : "text-slate-500"}>
                {action ?? "Neutral"}
              </span>
            </span>
          </div>
          );
        })}
      </div>
    </div>
  );
}
function CompassGauge({
  label,
  score,
  detail,
}: {
  label: string;
  score: number;
  detail: string;
}) {
  const rating =
    score >= 78
      ? "Strong Buy"
      : score >= 60
        ? "Buy"
        : score >= 42
          ? "Neutral"
          : score >= 24
            ? "Sell"
            : "Strong Sell";
  const angle = -90 + score * 1.8;
  return (
    <div className="rounded-xl border border-border bg-white p-4 text-center">
      <p className="text-[10px] font-semibold text-slate-500">{label}</p>
      <div
        className="compass-gauge mx-auto mt-3"
        style={
          {
            "--gauge-angle": `${angle}deg`,
            "--gauge-fill": `${score * 1.8}deg`,
          } as React.CSSProperties
        }
      >
        <div className="compass-gauge__arc" />
        <div className="compass-gauge__needle" />
        <div className="compass-gauge__hub" />
        <span className="compass-gauge__score">{Math.round(score)}</span>
      </div>
      <p className="mt-2 text-xs font-semibold text-slate-800">{rating}</p>
      <p className="mt-1 text-[9px] text-slate-400">{detail}</p>
    </div>
  );
}
function fallbackDetailData(instrument: Instrument): InstrumentDetailData {
  return {
    quoteCurrency: "USD",
    unit: "points",
    dataSource: "Marketsyde Demo Provider",
    marketStatus: "Demo session",
    open: instrument.price,
    previousClose: instrument.price - instrument.change,
    dayLow: instrument.price - Math.abs(instrument.change),
    dayHigh: instrument.price + Math.abs(instrument.change),
    historicalLow: instrument.price * 0.7,
    historicalHigh: instrument.price * 1.25,
    volumeType: "Index reference volume",
    performance1d: instrument.change,
    performance1w: instrument.change * 1.8,
    performance1m: instrument.return1m,
    performance6m: instrument.return1m * 3.8,
    performanceYtd: instrument.return1m * 4.6,
    performance1y: instrument.return1m * 7.4,
    factors: [
      { label: "Index family", value: instrument.name },
      { label: "Market breadth", value: "Demo constituent basket" },
      {
        label: "Sector contribution",
        value: instrument.subSector ?? "Broad market",
      },
    ],
  };
}
function MarketStats({
  instrument,
  kind,
  tierLevel,
}: {
  instrument: Instrument;
  kind: string;
  tierLevel: number;
}) {
  const detail =
    instrumentDetailData[instrument.symbol] ?? fallbackDetailData(instrument);
  return (
    <div className="space-y-4">
      <section className="panel p-5">
        <p className="label">Market statistics</p>
        <div className="mt-4 grid grid-cols-4 gap-3 max-lg:grid-cols-2 max-md:grid-cols-1">
          <Metric label="Last price" value={displayValue(instrument)} />
          <Metric
            label="Absolute change"
            value={`${instrument.change >= 0 ? "+" : ""}${(instrument.price - detail.previousClose).toFixed(2)}`}
          />
          <Metric label="Daily change" value={`${instrument.change}%`} />
          <Metric label="Quote currency" value={detail.quoteCurrency} />
          <Metric
            label="Open"
            value={detail.open.toFixed(kind === "Forex" ? 4 : 2)}
          />
          <Metric
            label="Previous close"
            value={detail.previousClose.toFixed(kind === "Forex" ? 4 : 2)}
          />
          <Metric
            label="Day low / high"
            value={`${detail.dayLow.toFixed(kind === "Forex" ? 4 : 2)} / ${detail.dayHigh.toFixed(kind === "Forex" ? 4 : 2)}`}
          />
          <Metric
            label="Historical low / high"
            value={`${detail.historicalLow.toFixed(2)} / ${detail.historicalHigh.toFixed(2)}`}
          />
          <Metric label="Volume" value={`${instrument.volume}M`} />
          <Metric label="Volume type" value={detail.volumeType} />
          <Metric
            label={kind === "Stock" ? "P/E" : "Market size"}
            value={
              kind === "Stock"
                ? `${instrument.pe ?? "n/a"}x`
                : `$${instrument.marketCap}B`
            }
          />
          <Metric label="Data source" value={detail.dataSource} />
        </div>
      </section>
      <FinancialFactors factors={detail.factors} />
      <SeasonalPerformance
        instrument={instrument}
        tierLevel={tierLevel}
      />
    </div>
  );
}
function FinancialFactors({
  factors,
}: {
  factors: InstrumentDetailData["factors"];
}) {
  return (
    <section className="panel p-5">
      <p className="label">Financial factors</p>
      <div className="mt-4 grid grid-cols-3 gap-3 max-lg:grid-cols-2 max-md:grid-cols-1">
        {factors.map((factor) => (
          <Metric
            key={factor.label}
            label={factor.label}
            value={factor.value}
          />
        ))}
      </div>
    </section>
  );
}

function SeasonalPerformance({
  instrument,
  tierLevel,
}: {
  instrument: Instrument;
  tierLevel: number;
}) {
  const { requestUnlock } = useMarketEngagement();
  const [year, setYear] = useState("All years");
  const [dateRange, setDateRange] = useState<"1Y" | "3Y" | "5Y" | "All">("All");
  const [scale, setScale] = useState<"Monthly" | "Quarterly">("Monthly");
  const [mode, setMode] = useState<"Table" | "Chart">("Table");
  if (tierLevel < 4) {
    return (
      <section className="panel flex min-h-48 flex-col items-center justify-center gap-2 p-5 text-center">
        <Lock className="size-5 text-violet-500" />
        <b className="text-xs text-slate-800">Seasonal performance requires Level 4</b>
        <p className="max-w-sm text-[10px] text-slate-500">
          Year-plus historical analysis is available with Elite access.
        </p>
        <button type="button" className="primary mt-1 px-3 py-1.5 text-[10px]" onClick={() => requestUnlock("performanceAnalytics")}>
          Unlock
        </button>
      </section>
    );
  }
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const periods = scale === "Monthly" ? months : ["Q1", "Q2", "Q3", "Q4"];
  const rangeYears =
    dateRange === "1Y"
      ? 1
      : dateRange === "3Y"
        ? 3
        : dateRange === "5Y"
          ? 5
          : 6;
  const years =
    year === "All years"
      ? Array.from({ length: rangeYears }, (_, index) => 2026 - index)
      : [Number(year)];
  const seasonal = years.map((currentYear, yearIndex) =>
    periods.map((_, periodIndex) =>
      Number(
        (
          Math.sin(currentYear * 0.31 + periodIndex * 1.7 + instrument.price) *
            1.4 +
          instrument.return1m / (scale === "Monthly" ? 13 : 4) +
          instrument.change * 0.18
        ).toFixed(2),
      ),
    ),
  );
  const average = periods.map((_, periodIndex) =>
    Number(
      (
        seasonal.reduce((sum, row) => sum + row[periodIndex], 0) /
        seasonal.length
      ).toFixed(2),
    ),
  );
  const annual = seasonal.map((row) =>
    Number(row.reduce((sum, value) => sum + value, 0).toFixed(2)),
  );
  return (
    <section className="panel p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="label">Seasonal performance</p>
          <h2 className="mt-1 text-sm font-semibold text-slate-900">
            Recurring {scale.toLowerCase()} performance patterns
          </h2>
          <p className="mt-1 text-[10px] text-slate-400">
            Demo historical tracking for {instrument.symbol}; positive values
            are green, negative values red.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            aria-label="Seasonal year"
            value={year}
            onChange={(event) => setYear(event.target.value)}
            className="rounded-lg border border-border bg-white px-2 py-1.5 text-[10px] text-slate-600"
          >
            <option>All years</option>
            {[2026, 2025, 2024, 2023, 2022, 2021].map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
          <select
            aria-label="Seasonal date range"
            value={dateRange}
            onChange={(event) =>
              setDateRange(event.target.value as "1Y" | "3Y" | "5Y" | "All")
            }
            className="rounded-lg border border-border bg-white px-2 py-1.5 text-[10px] text-slate-600"
          >
            <option value="1Y">Date range: 1Y</option>
            <option value="3Y">Date range: 3Y</option>
            <option value="5Y">Date range: 5Y</option>
            <option value="All">Date range: All</option>
          </select>
          <select
            aria-label="Seasonal scale"
            value={scale}
            onChange={(event) =>
              setScale(event.target.value as "Monthly" | "Quarterly")
            }
            className="rounded-lg border border-border bg-white px-2 py-1.5 text-[10px] text-slate-600"
          >
            <option>Monthly</option>
            <option>Quarterly</option>
          </select>
          <div className="seg">
            <button
              onClick={() => setMode("Table")}
              className={mode === "Table" ? "active" : ""}
            >
              Table
            </button>
            <button
              onClick={() => setMode("Chart")}
              className={mode === "Chart" ? "active" : ""}
            >
              Chart
            </button>
          </div>
        </div>
      </div>
      {mode === "Table" ? (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-180 text-left text-[10px]">
            <thead>
              <tr>
                <th className="px-2 py-2">Year</th>
                {periods.map((period) => (
                  <th className="px-2 py-2 text-right" key={period}>
                    {period}
                  </th>
                ))}
                <th className="px-2 py-2 text-right">Year</th>
              </tr>
            </thead>
            <tbody>
              {seasonal.map((row, rowIndex) => (
                <tr className="border-t border-border" key={years[rowIndex]}>
                  <td className="px-2 py-2 font-semibold text-slate-700">
                    {years[rowIndex]}
                  </td>
                  {row.map((value, index) => (
                    <td
                      className={`px-2 py-2 text-right font-mono ${value >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}
                      key={`${years[rowIndex]}-${index}`}
                    >
                      {value > 0 ? "+" : ""}
                      {value.toFixed(2)}%
                    </td>
                  ))}
                  <td
                    className={`px-2 py-2 text-right font-mono font-semibold ${annual[rowIndex] >= 0 ? "text-emerald-700" : "text-rose-700"}`}
                  >
                    {annual[rowIndex] > 0 ? "+" : ""}
                    {annual[rowIndex].toFixed(2)}%
                  </td>
                </tr>
              ))}
              <tr className="border-t-2 border-border">
                <td className="px-2 py-2 font-semibold text-slate-700">
                  Average
                </td>
                {average.map((value, index) => (
                  <td
                    className={`px-2 py-2 text-right font-mono font-semibold ${value >= 0 ? "text-emerald-700" : "text-rose-700"}`}
                    key={`average-${index}`}
                  >
                    {value > 0 ? "+" : ""}
                    {value.toFixed(2)}%
                  </td>
                ))}
                <td className="px-2 py-2 text-right font-mono font-semibold text-slate-700">
                  {average.reduce((sum, value) => sum + value, 0).toFixed(2)}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <div id="seasonal-performance">
          <SeasonalChart values={average} labels={periods} />
        </div>
      )}
    </section>
  );
}

function SeasonalChart({
  values,
  labels,
}: {
  values: number[];
  labels: string[];
}) {
  const min = Math.min(...values, 0);
  const max = Math.max(...values, 0);
  const span = Math.max(max - min, 0.01);
  const points = values
    .map(
      (value, index) =>
        `${(index / Math.max(values.length - 1, 1)) * 94 + 3},${92 - ((value - min) / span) * 72}`,
    )
    .join(" ");
  return (
    <div className="mt-5">
      <div className="relative h-56 overflow-hidden rounded-xl border border-border grid-surface">
        <div className="absolute left-3 right-3 top-1/2 border-t border-dashed border-slate-300" />
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 size-full"
        >
          <polyline
            points={points}
            fill="none"
            stroke="#7c3aed"
            strokeWidth="1.8"
            vectorEffect="non-scaling-stroke"
          />
          <g>
            {values.map((value, index) => (
              <circle
                key={labels[index]}
                cx={(index / Math.max(values.length - 1, 1)) * 94 + 3}
                cy={92 - ((value - min) / span) * 72}
                r="1.6"
                fill={value >= 0 ? "#10b981" : "#ef4444"}
                className="cursor-pointer"
                onClick={() => {
                  const topic = marketTagTopics[index % marketTagTopics.length];
                  document
                    .getElementById(`community-NVDA-${topic}`)
                    ?.scrollIntoView({ behavior: "smooth", block: "center" });
                }}
              />
            ))}
          </g>
        </svg>
      </div>
      <div className="mt-2 grid grid-cols-12 gap-1 text-center text-[9px] text-slate-400">
        {labels.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
    </div>
  );
}
function News({
  instrument,
  onSelect,
  onShare,
  onCommunity,
}: {
  instrument: Instrument;
  onSelect: (article: InstrumentNews) => void;
  onShare: (article: InstrumentNews) => void;
  onCommunity: (article: InstrumentNews) => void;
}) {
  const articles = instrumentNews(instrument);
  return (
    <section className="panel p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="label">News & context</p>
          <p className="mt-1 text-[10px] text-slate-400">
            Related to #{instrument.symbol}:{instrument.name}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onSelect(articles[0])}
            className="text-[9px] font-semibold text-violet-600"
          >
            Open in popup
          </button>
          <Newspaper className="size-4 text-violet-600" />
        </div>
      </div>
      <div className="mt-3 divide-y divide-border">
        {articles.map((article) => (
          <div
            className="flex items-start justify-between gap-4 py-3"
            key={article.title}
          >
            <button
              onClick={() => onSelect(article)}
              className="min-w-0 text-left"
            >
              <b className="text-xs text-slate-800">{article.title}</b>
              <p className="mt-1 text-[10px] text-slate-500">
                {article.summary}
              </p>
              <p className="mt-1 text-[10px] text-slate-400">
                {article.time} - {article.source} - #{instrument.symbol}:
                {instrument.name}
              </p>
            </button>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <button
                onClick={() => onShare(article)}
                className="text-[9px] font-semibold text-cyan-600"
              >
                Share here
              </button>
              <button
                onClick={() => onCommunity(article)}
                className="text-[9px] font-semibold text-violet-600"
              >
                View community
              </button>
              <ExternalLink className="size-3 text-slate-400" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
function Analysis({
  instrument,
  kind,
}: {
  instrument: Instrument;
  kind: string;
}) {
  return (
    <section className="panel p-5">
      <p className="label">Analysis</p>
      <h2 className="mt-1 text-sm font-semibold text-slate-900">
        {instrument.name} decision context
      </h2>
      <p className="mt-3 max-w-2xl text-xs leading-relaxed text-slate-500">
        {kind} instrument with{" "}
        {instrument.change >= 0 ? "positive" : "negative"} daily momentum,{" "}
        {instrument.rvol.toFixed(2)}x relative volume, and a{" "}
        {instrument.signal.toLowerCase()} demo signal. Validate market data,
        product terms, and broker eligibility before acting.
      </p>
    </section>
  );
}
function WeeklyVoteChart({
  instrument,
  userVote,
  tierLevel,
}: {
  instrument: Instrument;
  userVote: VoteSide | null;
  tierLevel: number;
}) {
  const { requestUnlock } = useMarketEngagement();
  const maximumRange = tierLevel >= 2 ? "1M" : "2W";
  const [range, setRange] = useState<VoteRange>(maximumRange);
  useEffect(() => {
    setRange(maximumRange);
  }, [instrument.symbol, maximumRange]);
  const prices = voteHistorySeries(instrument, range);
  const rangeConfig = voteRangeOptions.find((option) => option.value === range);
  const rangeDays = rangeConfig?.days ?? 14;
  const markerInterval = rangeConfig?.intervalDays ?? 7;
  const timelineDays =
    rangeDays >= 180
      ? [
          rangeDays,
          Math.round(rangeDays * 0.75),
          Math.round(rangeDays * 0.5),
          Math.round(rangeDays * 0.25),
          0,
        ]
      : rangeDays <= 14
        ? [rangeDays, 7, 0]
        : [rangeDays, 21, 14, 7, 0];
  const timelineLabels = timelineDays.map((days) => ({
    days,
    label:
      days === 0
        ? "Today"
        : rangeConfig?.cadence === "month"
          ? `${Math.max(1, Math.round(days / 30))}mo`
          : `${days}d`,
  }));
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceSpan = Math.max(maxPrice - minPrice, 0.01);
  const voteSeries = prices.map((_, index) =>
    Math.max(
      18,
      Math.min(
        88,
        instrument.sentiment +
          Math.sin(index * 0.52 + instrument.price) * 6 +
          (index / Math.max(prices.length - 1, 1) - 0.5) *
            (instrument.change >= 0 ? 7 : -7),
      ),
    ),
  );
  const voteTimelinePoints = Array.from(
    { length: Math.ceil(rangeDays / markerInterval) + 1 },
    (_, index) => Math.min(rangeDays, index * markerInterval),
  )
    .filter((index, pointIndex, indexes) => indexes.indexOf(index) === pointIndex)
    .map((index, pointIndex, points) => {
      const bullish = Math.round(voteSeries[index]);
      const normalizedPrice =
        ((prices[index] - minPrice) / priceSpan) * 100;
      return {
        index,
        bullish,
        bearish: 100 - bullish,
        normalizedPrice,
        date:
          pointIndex === points.length - 1
            ? "Today"
            : rangeConfig?.cadence === "month"
              ? `${Math.max(1, Math.round((rangeDays - index) / 30))}mo ago`
              : `${rangeDays - index}d ago`,
      };
    });
  const [selectedWeekIndex, setSelectedWeekIndex] = useState(
    voteTimelinePoints.length - 1,
  );
  useEffect(() => {
    setSelectedWeekIndex(voteTimelinePoints.length - 1);
  }, [range, voteTimelinePoints.length]);
  const selectedWeek =
    voteTimelinePoints[selectedWeekIndex] ??
    voteTimelinePoints[voteTimelinePoints.length - 1];
  const point = (value: number, index: number) => {
    const x = (index / Math.max(prices.length - 1, 1)) * 94 + 3;
    const y = 92 - value * 0.72;
    return `${x},${y}`;
  };
  const pricePoints = prices
    .map((value, index) =>
      point(((value - minPrice) / priceSpan) * 100, index),
    )
    .join(" ");
  const votePoints = voteSeries
    .map((value, index) => point(value, index))
    .join(" ");
  const currentBullish = Math.round(voteSeries[voteSeries.length - 1]);
  return (
    <div className="mt-5 overflow-hidden rounded-xl border border-border bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div>
          <p className="text-[10px] font-semibold text-slate-900">
            {rangeDays}-day vote history
          </p>
          <p className="mt-1 text-[9px] text-slate-400">
            Price is indexed to 100 so direction can be compared with the
            community vote share.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-3">
          <div className="seg">
            {voteRangeOptions.map((option) => {
              const locked = option.requiredLevel > tierLevel;
              return (
                <button
                  key={option.value}
                  type="button"
                  className={`${range === option.value ? "active" : ""} ${locked ? "cursor-not-allowed opacity-40" : ""}`}
                  disabled={locked}
                  aria-label={
                    locked
                      ? `${option.label} timeline requires Level ${option.requiredLevel}`
                      : `Show ${option.label} vote timeline`
                  }
                  title={
                    locked
                      ? `Requires Level ${option.requiredLevel}`
                      : `Show ${option.label} vote timeline`
                  }
                  onClick={() => locked
                    ? requestUnlock(option.requiredLevel >= 3 ? "performanceAnalytics" : "historicalData")
                    : setRange(option.value)}
                >
                  {locked && <Lock className="mr-1 inline size-2.5" />}
                  {option.label}
                </button>
              );
            })}
          </div>
          <div className="flex gap-3 text-[9px] text-slate-500">
            <span>
              <i className="mr-1 inline-block size-2 rounded-full bg-violet-500" />
              Price
            </span>
            <span>
              <i className="mr-1 inline-block size-2 rounded-full bg-emerald-400" />
              By community vote
            </span>
          </div>
        </div>
      </div>
      <div className="relative h-64 bg-gradient-to-b from-white to-slate-50">
        <div className="absolute inset-x-4 top-3 flex justify-between text-[9px] text-slate-400">
          <span>100%</span>
          <span>50%</span>
          <span>0%</span>
        </div>
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-4 size-[calc(100%-2rem)]"
          aria-label={`${instrument.symbol} price and community vote history`}
        >
          {[20, 50, 80].map((y) => (
            <line
              key={y}
              x1="3"
              x2="97"
              y1={y}
              y2={y}
              stroke="#e8edf4"
              strokeWidth=".5"
            />
          ))}
          <polyline
            points={pricePoints}
            fill="none"
            stroke="#7657ff"
            strokeWidth="1.8"
            vectorEffect="non-scaling-stroke"
          />
          <polyline
            points={votePoints}
            fill="none"
            stroke="#10b981"
            strokeWidth="1.8"
            vectorEffect="non-scaling-stroke"
          />
          {voteTimelinePoints.map((week) => (
            <circle
              key={week.index}
              cx={point(week.bullish, week.index).split(",")[0]}
              cy={point(week.bullish, week.index).split(",")[1]}
              r={selectedWeek?.index === week.index ? "2.8" : "2.2"}
              fill={week.bullish >= 50 ? "#10b981" : "#f43f5e"}
              stroke="white"
              strokeWidth="1"
              className="cursor-pointer"
              role="button"
              tabIndex={0}
              aria-label={`${week.date}: ${week.bullish}% Bullish, ${week.bearish}% Bearish`}
              onClick={() =>
                setSelectedWeekIndex(voteTimelinePoints.indexOf(week))
              }
              onFocus={() =>
                setSelectedWeekIndex(voteTimelinePoints.indexOf(week))
              }
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  setSelectedWeekIndex(voteTimelinePoints.indexOf(week));
                }
              }}
            >
              <title>
                {week.date} · {week.bullish}% Bullish · {week.bearish}% Bearish
              </title>
            </circle>
          ))}
          <circle
            cx="97"
            cy={point(((prices[prices.length - 1] - minPrice) / priceSpan) * 100, prices.length - 1).split(",")[1]}
            r="1.8"
            fill="#7657ff"
          />
          <circle
            cx="97"
            cy={point(currentBullish, voteSeries.length - 1).split(",")[1]}
            r="1.8"
            fill="#10b981"
          />
        </svg>
        <div className="absolute inset-x-4 bottom-3 flex justify-between text-[9px] text-slate-400">
          {timelineLabels.map((tick) => (
            <span key={tick.days}>{tick.label}</span>
          ))}
        </div>
      </div>
      {selectedWeek && (
        <div className="grid grid-cols-4 gap-3 border-t border-border bg-slate-50 px-4 py-3 text-[10px]">
          <div>
            <span className="label">Selected vote</span>
            <b className="mt-1 block text-slate-800">{selectedWeek.date}</b>
          </div>
          <div>
            <span className="label">Bullish</span>
            <b className="mt-1 block text-emerald-600">
              {selectedWeek.bullish}%
            </b>
          </div>
          <div>
            <span className="label">Bearish</span>
            <b className="mt-1 block text-rose-600">
              {selectedWeek.bearish}%
            </b>
          </div>
          <div>
            <span className="label">Price index</span>
            <b className="mt-1 block text-violet-600">
              {selectedWeek.normalizedPrice.toFixed(0)}
            </b>
          </div>
        </div>
      )}
      <div className="grid grid-cols-3 gap-3 border-t border-border p-4 text-[10px]">
        <div>
          <span className="label">By community vote</span>
          <b className="mt-1 block text-sm text-emerald-600">
            {currentBullish}% Bullish
          </b>
        </div>
        <div>
          <span className="label">Price direction</span>
          <b className="mt-1 block text-sm text-violet-600">
            {prices[prices.length - 1] >= prices[0] ? "Uptrend" : "Downtrend"}
          </b>
        </div>
        <div>
          <span className="label">Your weekly vote</span>
          <b className="mt-1 block text-sm text-slate-800">
            {userVote ?? "Not voted"}
          </b>
        </div>
      </div>
    </div>
  );
}

function Forecast({
  instrument,
  kind,
  tierLevel,
  userVote,
}: {
  instrument: Instrument;
  kind: string;
  tierLevel: number;
  userVote: VoteSide | null;
}) {
  const forecast = instrument.return1m * 1.35;
  return (
    <div className="space-y-4">
      <section className="panel p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="label">Community vote vs price</p>
            <h2 className="mt-1 text-sm font-semibold text-slate-900">
              How sentiment tracked the last 30 days
            </h2>
            <p className="mt-1 text-[10px] text-slate-400">
              Compare the synthetic price path with the community bullish vote
              share for {instrument.symbol}.
            </p>
          </div>
          <span className="badge">WEEKLY VOTES</span>
        </div>
        <WeeklyVoteChart
          instrument={instrument}
          userVote={userVote}
          tierLevel={tierLevel}
        />
        <div className="mt-5 grid grid-cols-4 gap-3 max-lg:grid-cols-2 max-md:grid-cols-1">
          <Metric
            label="30D scenario"
            value={`${forecast >= 0 ? "+" : ""}${forecast.toFixed(1)}%`}
          />
          <Metric
            label="Direction"
            value={forecast >= 0 ? "Positive bias" : "Negative bias"}
          />
          <Metric
            label="Community confidence"
            value={`${Math.max(35, Math.min(88, instrument.confidence - 4))}%`}
          />
          <Metric
            label="Driver"
            value={
              kind === "Forex"
                ? "Rates / macro"
                : kind === "Crypto"
                  ? "Momentum / liquidity"
                  : kind === "Commodity"
                    ? "Supply / USD"
                    : "Trend / breadth"
            }
          />
        </div>
        <div className="mt-5 rounded-xl bg-slate-50 p-4 text-xs text-slate-600">
          Forecast inputs are synthetic and combine recent return, relative
          volume, sentiment, and technical context. Production forecasts require
          a validated data provider and model provenance.
        </div>
      </section>
    </div>
  );
}
function FinancialReport({
  instrument,
  tierLevel,
  onToast,
}: {
  instrument: Instrument;
  tierLevel: number;
  onToast: (message: string) => void;
}) {
  const { requestUnlock } = useMarketEngagement();
  const financialAnalysisLocked = tierLevel < 3;
  const [period, setPeriod] = useState<"Annual" | "Quarterly">("Annual");
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [aiSummary, setAiSummary] = useState(false);
  const openRelatedNews = () => {
    const news = document.querySelector(`#news-${instrument.symbol}-BREADTH`);
    news?.scrollIntoView({ behavior: "smooth", block: "center" });
    news?.classList.add("market-context-highlight");
    window.setTimeout(() => news?.classList.remove("market-context-highlight"), 1800);
  };
  const openRelatedCommunity = () => {
    const community = document.querySelector(
      `#community-${instrument.symbol.replaceAll("/", "-")}-TECHNICAL`,
    );
    community?.scrollIntoView({ behavior: "smooth", block: "center" });
    community?.classList.add("market-context-highlight");
    window.setTimeout(
      () => community?.classList.remove("market-context-highlight"),
      1800,
    );
  };
  const downloadReport = () => {
    if (!selectedReport) return;
    const content = `${selectedReport}\n${instrument.symbol} official release report\nDemo document for interface evaluation.`;
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([content], { type: "text/plain" }));
    link.download = `${instrument.symbol}-${selectedReport.toLowerCase().replaceAll(" ", "-")}.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
  };
  const annual = [
    { label: "FY22", revenue: 27.0, income: 9.8, margin: 36.2 },
    { label: "FY23", revenue: 27.0, income: 4.4, margin: 16.2 },
    { label: "FY24", revenue: 60.9, income: 29.8, margin: 48.9 },
    { label: "FY25", revenue: 130.5, income: 72.9, margin: 55.8 },
  ];
  const quarterly = [
    { label: "Q2 25", revenue: 30.0, income: 16.6, margin: 55.3 },
    { label: "Q3 25", revenue: 35.1, income: 19.3, margin: 55.0 },
    { label: "Q4 25", revenue: 39.3, income: 22.1, margin: 56.2 },
    { label: "Q1 26", revenue: 44.1, income: 24.8, margin: 56.3 },
  ];
  const series = period === "Annual" ? annual : quarterly;
  const maxRevenue = Math.max(...series.map((item) => item.revenue));
  return (
    <div className="space-y-4">
      <section className="panel p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="label">Fundamentals & stats</p>
            <h2 className="mt-1 text-sm font-semibold text-slate-900">
              {instrument.symbol} financial overview
            </h2>
            <p className="mt-1 text-[10px] text-slate-400">
              Interactive demo statements, profitability, valuation, and
              financial health.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="seg">
              {(["Annual", "Quarterly"] as const).map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    if (financialAnalysisLocked) {
                      requestUnlock("performanceAnalytics");
                      return;
                    }
                    setPeriod(item);
                  }}
                  aria-disabled={financialAnalysisLocked}
                  className={`${period === item ? "active" : ""} ${financialAnalysisLocked ? "cursor-not-allowed opacity-50" : ""}`}
                >
                  {item}
                  {financialAnalysisLocked && <Lock className="ml-1 inline size-2.5" />}
                </button>
              ))}
            </div>
            <span className="badge positive">DEMO DATA</span>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-4 gap-3 max-lg:grid-cols-2 max-md:grid-cols-1">
          <Metric
            label="Market capitalization"
            value={`$${instrument.marketCap?.toLocaleString() ?? "—"}B`}
          />
          <Metric
            label="P/E ratio (TTM)"
            value={instrument.pe ? `${instrument.pe.toFixed(1)}×` : "—"}
          />
          <Metric
            label="Basic EPS (TTM)"
            value={`$${(instrument.price / (instrument.pe ?? 25)).toFixed(2)}`}
          />
          <Metric label="Revenue growth" value="+114.2%" />
        </div>
      </section>
      <section className="panel p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="label">Official release reports</p>
            <h3 className="mt-1 text-sm font-semibold text-slate-900">SEC filings and company financial documents</h3>
            <p className="mt-1 text-[10px] text-slate-400">Open a document to review the release and link it to related news.</p>
          </div>
          <button className="secondary px-2 py-1 text-[9px]" onClick={() => setAiSummary((current) => !current)}>
            {aiSummary ? "Hide AI summary" : "AI summary assistance"}
          </button>
        </div>
        {aiSummary && <div className="mt-4 rounded-lg border border-violet-200 bg-violet-50 p-3 text-[10px] text-violet-800">AI summary: {instrument.symbol} shows strong reported growth and expanding profitability in this demo filing set. Verify every figure against the official source.</div>}
        <div className="mt-4 grid grid-cols-3 gap-3 max-md:grid-cols-1">
          {["FY25 annual report", "Q1 FY26 earnings release", "10-Q filing"].map((report) => (
            <button key={report} className={`rounded-lg border p-3 text-left text-[10px] ${selectedReport === report ? "border-violet-300 bg-violet-50" : "border-slate-200 bg-white"}`} onClick={() => setSelectedReport(report)}>
              <b className="block text-slate-900">{report}</b>
              <span className="mt-1 block text-slate-400">Official release document · demo link</span>
            </button>
          ))}
        </div>
        {selectedReport && <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4 text-[10px] text-slate-600">
          <b className="text-slate-900">{selectedReport}</b>
          <p className="mt-2">Document viewer: reported revenue, net income, margins, and management commentary for {instrument.symbol}.</p>
          <div className="mt-3 flex flex-wrap gap-3">
            <button className="text-violet-600 underline" onClick={openRelatedNews}>View related news</button>
            <button className="text-violet-600 underline" onClick={openRelatedCommunity}>View related community</button>
            <button className="secondary px-2 py-1 text-[9px]" onClick={downloadReport}>Download document</button>
          </div>
        </div>}
      </section>
      <div className="relative">
        <div className={financialAnalysisLocked ? "pointer-events-none select-none opacity-50" : ""}>
          <div className="grid grid-cols-2 gap-4 max-xl:grid-cols-1">
            <section className="panel p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="label">Growth</p>
              <h3 className="mt-1 text-sm font-semibold text-slate-900">
                Revenue & net income
              </h3>
            </div>
            <div className="flex gap-3 text-[9px] text-slate-500">
              <span>
                <i className="mr-1 inline-block size-2 rounded-sm bg-violet-500" />
                Revenue
              </span>
              <span>
                <i className="mr-1 inline-block size-2 rounded-sm bg-emerald-400" />
                Net income
              </span>
            </div>
          </div>
          <div className="mt-5 flex h-64 items-end gap-4 border-b border-slate-200 px-2">
            {series.map((item) => (
              <div
                key={item.label}
                className="group flex h-full flex-1 flex-col justify-end"
              >
                <div className="relative flex flex-1 items-end justify-center gap-1">
                  <div
                    className="w-2/5 rounded-t bg-violet-500 transition-opacity group-hover:opacity-80"
                    style={{ height: `${(item.revenue / maxRevenue) * 88}%` }}
                    title={`${item.label} revenue: $${item.revenue}B`}
                  />
                  <div
                    className="w-2/5 rounded-t bg-emerald-400 transition-opacity group-hover:opacity-80"
                    style={{ height: `${(item.income / maxRevenue) * 88}%` }}
                    title={`${item.label} net income: $${item.income}B`}
                  />
                  <div className="pointer-events-none absolute bottom-2 left-1/2 z-20 hidden w-36 -translate-x-1/2 rounded-lg bg-slate-900 p-2 text-[9px] text-white shadow-xl group-hover:block">
                    <b>{item.label}</b>
                    <span className="mt-1 block">Revenue ${item.revenue}B</span>
                    <span className="block">Net income ${item.income}B</span>
                  </div>
                </div>
                <span className="py-2 text-center text-[9px] text-slate-500">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
            </section>
            <section className="panel p-5">
          <p className="label">Profitability</p>
          <h3 className="mt-1 text-sm font-semibold text-slate-900">
            Net margin trend
          </h3>
          <div className="mt-5 space-y-5">
            {series.map((item) => (
              <div key={item.label}>
                <div className="mb-2 flex justify-between text-[10px]">
                  <span className="text-slate-500">{item.label}</span>
                  <b className="text-slate-900">{item.margin}%</b>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-emerald-400"
                    style={{ width: `${item.margin}%` }}
                    title={`${item.label} net margin: ${item.margin}%`}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <Metric label="Gross margin" value="75.0%" />
            <Metric label="Operating margin" value="62.1%" />
            <Metric label="ROE" value="91.4%" />
            <Metric label="Free cash flow" value="$60.9B" />
          </div>
            </section>
          </div>
          <section className="panel overflow-hidden">
        <div className="border-b border-border p-5">
          <p className="label">Financial health</p>
          <h3 className="mt-1 text-sm font-semibold text-slate-900">
            Balance sheet & valuation
          </h3>
        </div>
        <div className="grid grid-cols-2 max-lg:grid-cols-1">
          <div className="p-5">
            <div className="space-y-4">
              {[
                ["Cash & equivalents", "$43.2B", 72],
                ["Total debt", "$10.3B", 24],
                ["Current assets", "$80.1B", 88],
                ["Total liabilities", "$32.3B", 42],
              ].map(([label, value, width]) => (
                <div key={label as string}>
                  <div className="mb-2 flex justify-between text-[10px]">
                    <span className="text-slate-500">{label}</span>
                    <b>{value}</b>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-violet-500"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="border-l border-border p-5 max-lg:border-l-0 max-lg:border-t">
            <table className="w-full text-[10px]">
              <tbody className="divide-y divide-border">
                {[
                  ["Price / sales", "26.1×"],
                  ["Price / book", "51.8×"],
                  ["EV / EBITDA", "42.7×"],
                  ["Debt / equity", "11.5%"],
                  ["Current ratio", "4.1×"],
                  ["Dividend yield", "0.03%"],
                ].map(([label, value]) => (
                  <tr key={label}>
                    <td className="py-3 text-slate-500">{label}</td>
                    <td className="py-3 text-right font-semibold text-slate-900">
                      {value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
          </section>
        </div>
        {financialAnalysisLocked && (
          <button
            type="button"
            className="absolute inset-0 z-10 flex items-center justify-center gap-2 rounded-2xl bg-white/75 text-xs font-semibold text-violet-700 shadow-sm"
            onClick={() => requestUnlock("performanceAnalytics")}
          >
            <Lock size={14} /> Financial analysis · Requires Level 3
          </button>
        )}
      </div>
      <p className="px-1 text-[9px] leading-relaxed text-slate-400">
        All figures are synthetic demo data for interface evaluation and are not
        investment information.
      </p>
    </div>
  );
}
function ProductsAndBrokersTable({
  instrument,
  products,
  product,
  setProduct,
  brokers,
}: {
  instrument: Instrument;
  products: ProductType[];
  product: ProductType;
  setProduct: (product: ProductType) => void;
  brokers: Broker[];
}) {
  const generatedCfdPartners: Broker[] = [
    ["XM", "Global CFD partner", "From 0.08%", "$5", "MT4 / MT5"],
    ["HFM", "Multi-asset CFD partner", "From 0.09%", "$5", "MT4 / MT5 / Web"],
    ["Exness", "Global CFD partner", "From 0.07%", "$10", "MT4 / MT5 / Web"],
    ["Pepperstone", "Regulated CFD partner", "From 0.06%", "$10", "MT4 / MT5 / cTrader"],
    ["IC Markets", "Raw spread CFD partner", "From 0.05%", "$200", "MT4 / MT5 / cTrader"],
    ["Fx Pro", "Multi-asset CFD partner", "From 0.10%", "$100", "FxPro Edge / MT5"],
  ].map(([name, venue, spread, minimum, platform]) => ({
    name,
    venue,
    products: ["CFD"],
    symbols: [instrument.symbol],
    status: "Available",
    spread,
    minimum,
    platform,
    commission: "Partner terms apply",
    execution: "Demo market execution",
    details: `${name} CFD access for ${instrument.symbol}; verify regional eligibility, costs, and account terms before connecting.`,
  }));
  const matchedBrokers =
    product === "CFD"
      ? generatedCfdPartners
      : brokers.filter(
          (broker) =>
            broker.products.includes(product) &&
            brokerSupportsInstrument(broker, instrument),
        );
  const productDetails: Record<ProductType, string> = {
    Spot: "Buy or sell the underlying asset for direct settlement.",
    Share: "Whole-share ownership with standard equity market access.",
    "Fractional share":
      "Trade part of one share with a smaller minimum amount.",
    "FX spot": "Exchange currency pairs at the current market rate.",
    CFD: "Track price movement without owning the underlying asset; leverage may apply.",
    Future: "Standardized contract with a defined expiry and contract size.",
    Perpetual: "Derivative contract without expiry; funding charges may apply.",
  };
  return (
    <section className="panel overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border p-5">
        <div>
          <p className="label">Products & broker access</p>
          <h2 className="mt-1 text-sm font-semibold text-slate-900">
            Trade {instrument.symbol} by product
          </h2>
          <p className="mt-1 text-[10px] text-slate-400">
            Choose a product to compare matching providers, costs, minimums, and
            access.
          </p>
        </div>
      </div>
      <div className="w-full overflow-visible">
        <table className="w-full table-fixed text-left text-[9px]">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-5 py-3">Product</th>
              <th className="px-4 py-3">Broker</th>
              <th className="px-4 py-3">Spread</th>
              <th className="px-4 py-3">Minimum</th>
              <th className="px-4 py-3">Special offer</th>
              <th className="px-5 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {instrument.market === "Crypto" ? (
              <CryptoBrokerRows instrument={instrument} product={product} />
            ) : (
            matchedBrokers.map((broker) => (
              <tr
                key={`${product}-${broker.name}`}
                className="group cursor-pointer bg-white hover:bg-violet-50/40"
                onClick={() => {
                  window.location.href = "?view=brokers";
                }}
              >
                <td className="w-[11%] px-2 py-3 font-semibold text-violet-700">
                  <div className="flex flex-wrap gap-1">
                    {brokerProductPair(broker, instrument).map((identifier) => (
                      <span
                        key={identifier}
                        className="group/identifier relative rounded border border-violet-100 bg-violet-50 px-1.5 py-1 text-[9px] text-violet-700"
                        title={productIdentifierDetail(identifier, instrument)}
                      >
                        {identifier}
                        <span className="pointer-events-none absolute bottom-full left-0 z-50 mb-1 hidden w-max max-w-64 rounded-md bg-slate-900 p-2 text-left text-[9px] font-normal leading-relaxed text-white shadow-lg group-hover/identifier:block">
                          {productIdentifierDetail(identifier, instrument)}
                        </span>
                      </span>
                    ))}
                  </div>
                </td>
                <td
                  className="relative w-[18%] px-2 py-3 font-semibold text-slate-900"
                  tabIndex={0}
                >
                  {broker.name}
                  <div
                    role="tooltip"
                    className="pointer-events-none absolute left-2 top-[calc(100%-4px)] z-40 hidden w-72 rounded-lg border border-violet-200 bg-white p-4 text-left font-normal shadow-2xl group-hover:block group-focus:block"
                  >
                    <b className="text-xs text-slate-900">{broker.name}</b>
                    <p className="mt-1 leading-relaxed text-slate-500">
                      {broker.details}
                    </p>
                    <dl className="mt-3 grid grid-cols-2 gap-2">
                      <div>
                        <dt className="text-[8px] uppercase text-slate-400">
                          Commission
                        </dt>
                        <dd className="mt-1 text-slate-700">
                          {broker.commission}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[8px] uppercase text-slate-400">
                          Execution
                        </dt>
                        <dd className="mt-1 text-slate-700">
                          {broker.execution}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </td>
                <td className="w-[9%] px-2 py-3 text-slate-600">{broker.spread}</td>
                <td className="w-[8%] px-2 py-3 text-slate-600">{broker.minimum}</td>
                <td className="w-[18%] px-2 py-3">
                  <span className="rounded bg-emerald-50 px-2 py-1 text-[9px] font-semibold text-emerald-700">
                    {brokerSpecialOffer(broker.name)}
                  </span>
                </td>
                <td className="w-[10%] px-2 py-3 text-right">
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      window.location.href = "?view=brokers";
                    }}
                    className="primary justify-center"
                  >
                    Connect
                  </button>
                </td>
              </tr>
            ))
            )}
          </tbody>
        </table>
      </div>
      {instrument.market !== "Crypto" && matchedBrokers.length === 0 && (
        <div className="m-5 rounded-xl bg-amber-50 p-4 text-xs text-amber-700">
          <Lock className="mr-2 inline size-3" />
          No demo provider supports this exact product combination.
        </div>
      )}
    </section>
  );
}

function CryptoBrokerRows({
  instrument,
  product,
}: {
  instrument: Instrument;
  product: ProductType;
}) {
  const pairs = [instrument.symbol];
  return (
    <>
      {pairs.flatMap((pair) => {
        const brokerCount = 5 + (cryptoCoverageSeed(pair) % 6);
        const brokerNames = [...cryptoCoverageBrokers]
          .sort(
            (left, right) =>
              cryptoCoverageSeed(`${pair}-${left}`) -
              cryptoCoverageSeed(`${pair}-${right}`),
          )
          .slice(0, brokerCount);
        return brokerNames.map((broker) => ({
          broker,
          pair,
          product,
        }));
      }).map((row) => (
        <tr
          key={`${row.pair}-${row.broker}`}
          className="group cursor-pointer bg-white hover:bg-violet-50/40"
          onClick={() => {
            window.location.href = "?view=brokers";
          }}
        >
          <td className="w-[11%] px-2 py-3 font-semibold text-violet-700">
            {row.pair}
          </td>
          <td className="w-[18%] px-2 py-3 font-semibold text-slate-900">
            {row.broker}
          </td>
          <td className="w-[9%] px-2 py-3 text-slate-600">From 0.04%</td>
          <td className="w-[8%] px-2 py-3 text-slate-600">$10</td>
          <td className="w-[18%] px-2 py-3">
            <span className="rounded bg-emerald-50 px-2 py-1 text-[9px] font-semibold text-emerald-700">
              {brokerSpecialOffer(row.broker)}
            </span>
          </td>
          <td className="w-[10%] px-2 py-3 text-right">
            <button
              onClick={(event) => {
                event.stopPropagation();
                window.location.href = "?view=brokers";
              }}
              className="primary justify-center"
            >
              Connect
            </button>
          </td>
        </tr>
      ))}
    </>
  );
}

function ProductPanel({
  products,
  product,
  setProduct,
}: {
  products: ProductType[];
  product: ProductType;
  setProduct: (product: ProductType) => void;
}) {
  return (
    <section className="panel p-5">
      <p className="label">Trading products</p>
      <h2 className="mt-1 text-sm font-semibold text-slate-900">
        Choose the exact product
      </h2>
      <p className="mt-1 text-[10px] text-slate-400">
        Spot, CFD, futures, shares, and perpetuals are separate products.
      </p>
      <div className="mt-4 grid grid-cols-3 gap-3 max-md:grid-cols-1">
        {products.map((item) => (
          <button
            key={item}
            onClick={() => setProduct(item)}
            className={`rounded-xl border p-4 text-left ${product === item ? "border-violet-300 bg-violet-50" : "border-border bg-white"}`}
          >
            <b className="text-xs text-slate-900">{item}</b>
            <p className="mt-2 text-[10px] text-slate-500">
              {item === "Share"
                ? "Shares"
                : item === "Future"
                  ? "Contracts"
                  : item === "FX spot"
                    ? "Lots / units"
                    : "Product-specific units"}
            </p>
            {product === item && (
              <Check className="mt-3 size-4 text-violet-600" />
            )}
          </button>
        ))}
      </div>
    </section>
  );
}
function BrokerPanel({
  instrument,
  product,
  products,
  setProduct,
  brokers,
}: {
  instrument: Instrument;
  product: ProductType;
  products: ProductType[];
  setProduct: (product: ProductType) => void;
  brokers: Broker[];
}) {
  return (
    <section className="panel p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="label">Broker matching</p>
          <h2 className="mt-1 text-sm font-semibold text-slate-900">
            Providers for {instrument.symbol} - {product}
          </h2>
          <p className="mt-1 text-[10px] text-slate-400">
            Matched by exact symbol, product type, and demo eligibility.
          </p>
        </div>
        <label className="flex items-center gap-2 text-[10px] text-slate-500">
          Product
          <select
            value={product}
            onChange={(event) => setProduct(event.target.value as ProductType)}
            className="rounded-lg border border-border bg-white px-2 py-1.5 text-[10px]"
          >
            {products.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 max-lg:grid-cols-1">
        {brokers.map((broker) => (
          <div
            key={broker.name}
            className="rounded-xl border border-border p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <b className="text-sm text-slate-900">{broker.name}</b>
                <p className="mt-1 text-[10px] text-slate-400">
                  {broker.venue}
                </p>
              </div>
              <span
                className={`badge ${broker.status === "Available" ? "positive" : ""}`}
              >
                {broker.status}
              </span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Metric label="Spread" value={broker.spread} />
              <Metric label="Minimum" value={broker.minimum} />
              <Metric label="Platform" value={broker.platform} />
              <Metric label="Symbol" value={instrument.symbol} />
            </div>
            <div className="mt-4 flex gap-2">
              <button className="primary flex-1 justify-center">Connect</button>
              <button className="secondary">
                <ExternalLink />
              </button>
            </div>
          </div>
        ))}
      </div>
      {brokers.length === 0 && (
        <div className="mt-4 rounded-xl bg-amber-50 p-4 text-xs text-amber-700">
          <Lock className="mr-2 inline size-3" />
          No demo provider supports this exact product combination.
        </div>
      )}
    </section>
  );
}
function AssetSpecific({
  kind,
  instrument,
}: {
  kind: string;
  instrument: Instrument;
}) {
  const rows =
    kind === "Crypto"
      ? [
          ["Network", "Demo chain metadata"],
          ["Consensus", "Proof of Stake"],
          ["Supply", "Protocol-defined"],
          ["24h volume", `${instrument.volume}M USD`],
        ]
      : [
          ["Revenue", "Demo financial statement"],
          ["Earnings", "Next event not connected"],
          ["Balance sheet", "Demo balance sheet"],
          ["Cash flow", "Demo cash flow"],
        ];
  return (
    <section className="panel p-5">
      <p className="label">{kind} detail</p>
      <div className="mt-4 grid grid-cols-2 gap-3 max-md:grid-cols-1">
        {rows.map(([label, value]) => (
          <InfoRow key={label} label={label} value={value} />
        ))}
      </div>
    </section>
  );
}
function Metric({ label, value }: { key?: string; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <div className="text-[9px] uppercase tracking-wide text-slate-400">
        {label}
      </div>
      <div className="mt-1 text-xs font-semibold text-slate-800">{value}</div>
    </div>
  );
}
function InfoRow({ label, value }: { key?: string; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border pb-2 text-xs">
      <span className="text-slate-400">{label}</span>
      <b className="text-right text-slate-700">{value}</b>
    </div>
  );
}

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight, BarChart3, Bell, BookOpen, Briefcase, Calculator, CalendarDays, ChevronRight,
  Clock, Gift, LayoutGrid, LineChart, Newspaper, NotebookPen, Search, SlidersHorizontal,
  Sparkles, Trophy, Users, Wallet, X,
} from 'lucide-react';

/**
 * The command palette: one box that searches and jumps.
 *
 * What makes it usable rather than merely present:
 *  - it opens from anywhere with ⌘K or /, and closes with Escape
 *  - the keyboard alone can reach every row: ↑ ↓ to move, ↵ to go, and the
 *    highlighted row is always scrolled into view
 *  - the mouse and the keyboard share one highlight, so they never disagree
 *  - the part of a result that matched is marked, so the reader can see why
 *    it came back
 *  - nothing is hidden behind a tab: results are grouped and labelled
 *  - recent searches are remembered, and can be cleared in one click
 */

export interface PaletteItem {
  id: string;
  label: string;
  /** The line under the label, when it helps tell two results apart. */
  sub?: string;
  group: string;
  icon: React.ElementType;
  /** Shown on the right: a shortcut, a tag, or a price. */
  meta?: string;
  /** True when choosing this opens another screen rather than acting in place. */
  navigates?: boolean;
  run: () => void;
}

const RECENT_KEY = 'marketsyde.palette.recent';
const RECENT_MAX = 5;

/** Splits a label around the matched text so the match can be marked. */
function markMatch(label: string, query: string) {
  const q = query.trim();
  if (!q) return <>{label}</>;
  const at = label.toLowerCase().indexOf(q.toLowerCase());
  if (at < 0) return <>{label}</>;
  return (
    <>
      {label.slice(0, at)}
      <mark className="bg-transparent font-bold text-[#5945F1] dark:text-[#c9bfff]">{label.slice(at, at + q.length)}</mark>
      {label.slice(at + q.length)}
    </>
  );
}

/** Ranks a candidate: a prefix beats a word start, which beats a loose match. */
function score(label: string, sub: string | undefined, q: string): number {
  const l = label.toLowerCase();
  const s = (sub ?? '').toLowerCase();
  const n = q.toLowerCase();
  if (!n) return 0;
  if (l === n) return 100;
  if (l.startsWith(n)) return 80;
  if (l.split(/[\s/]+/).some((w) => w.startsWith(n))) return 60;
  if (l.includes(n)) return 40;
  if (s.includes(n)) return 20;
  return -1;
}

export const CommandPalette: React.FC<{
  open: boolean;
  onClose: () => void;
  /** Everything the palette can reach, built by the caller from live data. */
  items: PaletteItem[];
  /** Hands the typed text to the full search screen. */
  onAdvancedSearch: (query: string) => void;
}> = ({ open, onClose, items, onAdvancedSearch }) => {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const [recent, setRecent] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (!open) return;
    setQuery('');
    setActive(0);
    try { setRecent(JSON.parse(window.localStorage.getItem(RECENT_KEY) || '[]')); } catch { setRecent([]); }
    const t = window.setTimeout(() => inputRef.current?.focus(), 30);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { window.clearTimeout(t); document.body.style.overflow = overflow; };
  }, [open]);

  const remember = useCallback((text: string) => {
    const t = text.trim();
    if (!t) return;
    const next = [t, ...recent.filter((r) => r.toLowerCase() !== t.toLowerCase())].slice(0, RECENT_MAX);
    setRecent(next);
    try { window.localStorage.setItem(RECENT_KEY, JSON.stringify(next)); } catch { /* storage can be blocked */ }
  }, [recent]);

  const clearRecent = () => {
    setRecent([]);
    try { window.localStorage.removeItem(RECENT_KEY); } catch { /* ignore */ }
  };

  /** What the list shows: matches when typing, the browse list when not. */
  const rows = useMemo(() => {
    const q = query.trim();
    if (!q) return items.filter((i) => i.group === 'Browse' || i.group === 'Jump to').slice(0, 40);
    return items
      .map((i) => ({ i, s: score(i.label, i.sub, q) }))
      .filter((x) => x.s >= 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 24)
      .map((x) => x.i);
  }, [items, query]);

  /** The rows in render order, with their group headings. */
  const grouped = useMemo(() => {
    const out: { group: string; rows: PaletteItem[] }[] = [];
    rows.forEach((r) => {
      const last = out[out.length - 1];
      if (last && last.group === r.group) last.rows.push(r);
      else out.push({ group: r.group, rows: [r] });
    });
    return out;
  }, [rows]);

  useEffect(() => { setActive(0); }, [query]);

  useEffect(() => {
    rowRefs.current[active]?.scrollIntoView({ block: 'nearest' });
  }, [active, rows]);

  const choose = (item: PaletteItem) => {
    remember(query || item.label);
    onClose();
    item.run();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => (rows.length ? (a + 1) % rows.length : 0)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => (rows.length ? (a - 1 + rows.length) % rows.length : 0)); }
    else if (e.key === 'Home') { e.preventDefault(); setActive(0); }
    else if (e.key === 'End') { e.preventDefault(); setActive(Math.max(0, rows.length - 1)); }
    else if (e.key === 'Enter') {
      e.preventDefault();
      if (rows[active]) choose(rows[active]);
      else if (query.trim()) { remember(query); onClose(); onAdvancedSearch(query); }
    } else if (e.key === 'Escape') { e.preventDefault(); onClose(); }
  };

  if (!open) return null;

  let index = -1;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-start justify-center bg-slate-900/55 p-4 pt-[8vh] backdrop-blur-sm print:hidden"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search MarketSyde"
        data-keep-button-icons
        className="flex max-h-[76vh] w-full max-w-[680px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-[#0f0726]"
        onKeyDown={onKeyDown}
      >
        {/* the box itself, on brand */}
        <div className="flex items-center gap-3 bg-[#5945F1] px-5 py-4">
          <Search className="h-6 w-6 shrink-0 text-white/90" aria-hidden />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search or jump to…"
            aria-label="Search or jump to"
            role="combobox"
            aria-expanded
            aria-controls="palette-list"
            aria-activedescendant={rows[active] ? `palette-row-${rows[active].id}` : undefined}
            className="w-full min-w-0 bg-transparent text-[20px] text-white outline-none placeholder:text-white/60"
          />
          {query && (
            <button type="button" onClick={() => { setQuery(''); inputRef.current?.focus(); }} aria-label="Clear the search" className="rounded-lg p-1 text-white/70 transition hover:bg-white/15 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <div id="palette-list" ref={listRef} role="listbox" aria-label="Results" className="min-h-0 flex-1 overflow-y-auto p-2">
          {/* the way out when the palette is not enough */}
          <button
            type="button"
            onClick={() => { remember(query); onClose(); onAdvancedSearch(query); }}
            className="flex w-full items-center gap-3 rounded-xl bg-[#f1f0fe] px-3.5 py-3 text-left transition hover:bg-[#e8e5fd] dark:bg-white/5 dark:hover:bg-white/10"
          >
            <SlidersHorizontal className="h-[18px] w-[18px] shrink-0 text-[#5945F1] dark:text-[#a99bff]" aria-hidden />
            <span className="flex-1 text-[15px] font-semibold text-slate-900 dark:text-white">Advanced search</span>
            <span className="text-[13px] text-slate-500 dark:text-white/50">filters</span>
          </button>

          {!query && recent.length > 0 && (
            <>
              <div className="flex items-center justify-between px-3.5 pb-1 pt-4">
                <span className="text-[12px] font-semibold uppercase tracking-wide text-slate-400">Recent</span>
                <button type="button" onClick={clearRecent} className="text-[13px] text-slate-500 transition hover:text-[#5945F1] dark:text-white/50">Clear</button>
              </div>
              {recent.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => { setQuery(r); inputRef.current?.focus(); }}
                  className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left transition hover:bg-slate-50 dark:hover:bg-white/5"
                >
                  <Clock className="h-[18px] w-[18px] shrink-0 text-slate-400" aria-hidden />
                  <span className="flex-1 truncate text-[15px] text-slate-700 dark:text-white/80">{r}</span>
                </button>
              ))}
            </>
          )}

          {grouped.map(({ group, rows: list }) => (
            <div key={group}>
              <p className="px-3.5 pb-1 pt-4 text-[12px] font-semibold uppercase tracking-wide text-slate-400">{group}</p>
              {list.map((item) => {
                index += 1;
                const i = index;
                const Icon = item.icon;
                const on = i === active;
                return (
                  <button
                    key={item.id}
                    id={`palette-row-${item.id}`}
                    ref={(el) => { rowRefs.current[i] = el; }}
                    type="button"
                    role="option"
                    aria-selected={on}
                    onMouseMove={() => setActive(i)}
                    onClick={() => choose(item)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left transition ${on ? 'bg-[#f1f0fe] dark:bg-white/10' : 'hover:bg-slate-50 dark:hover:bg-white/5'}`}
                  >
                    <Icon className="h-[18px] w-[18px] shrink-0 text-slate-500 dark:text-white/60" aria-hidden />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[15px] text-slate-900 dark:text-white">{markMatch(item.label, query)}</span>
                      {item.sub && <span className="block truncate text-[12.5px] text-slate-500 dark:text-white/50">{item.sub}</span>}
                    </span>
                    {item.meta && <span className="shrink-0 text-[13px] text-slate-500 dark:text-white/50">{item.meta}</span>}
                    {item.navigates && <ArrowRight className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />}
                  </button>
                );
              })}
            </div>
          ))}

          {query.trim() && rows.length === 0 && (
            <div className="px-4 py-10 text-center">
              <p className="text-[15px] font-semibold text-slate-900 dark:text-white">Nothing matches “{query.trim()}”</p>
              <p className="mt-1 text-[13px] text-slate-500 dark:text-white/50">Try a shorter word, or open the advanced search to filter by type.</p>
            </div>
          )}
        </div>

        {/* what the keyboard can do, where a new reader will see it */}
        <div className="flex items-center gap-4 border-t border-slate-200 px-4 py-2.5 text-[12px] text-slate-500 dark:border-white/10 dark:text-white/50">
          <span><kbd className="rounded border border-slate-300 px-1 dark:border-white/20">↑</kbd> <kbd className="rounded border border-slate-300 px-1 dark:border-white/20">↓</kbd> move</span>
          <span><kbd className="rounded border border-slate-300 px-1 dark:border-white/20">↵</kbd> open</span>
          <span><kbd className="rounded border border-slate-300 px-1 dark:border-white/20">esc</kbd> close</span>
          <span className="ml-auto">{rows.length} result{rows.length === 1 ? '' : 's'}</span>
        </div>
      </div>
    </div>
  );
};

/** The pages the palette can jump to, in the order a trader would look for them. */
export function navigationItems(go: (tab: string) => void): PaletteItem[] {
  const page = (id: string, label: string, sub: string, icon: React.ElementType): PaletteItem => ({
    id: `nav-${id}`, label, sub, group: 'Browse', icon, navigates: true, run: () => go(id),
  });
  return [
    page('dashboard', 'Dashboard', 'Your morning, positions and cashback', LayoutGrid),
    page('signals', 'Trading Signals', 'Open calls and their confidence', LineChart),
    page('instrument-analysis', 'Instrument Analysis', 'Table, heatmap, scatter and correlation', BarChart3),
    page('economic-calendar', 'Economic Calendar', 'What is due and what it can move', CalendarDays),
    page('trading-journal', 'Trading Journal', 'Entries, playbooks, backtest and AI coach', NotebookPen),
    page('portfolio-tracker', 'Portfolio Tracker', 'Equity, drawdown and goals', Wallet),
    page('alerts', 'Price Alerts', 'Levels worth being told about', Bell),
    page('brokers', 'Broker List', 'Spreads, cashback and regulation', Briefcase),
    page('broker-comparison', 'Broker Comparison', 'Costs side by side', Briefcase),
    page('promotions', 'Promotions', 'Offers live for your level', Gift),
    page('cashback-overview', 'Cashback', 'Credited, pending and the rate per lot', Wallet),
    page('news', 'Market News', 'Today’s stories and the desk’s read', Newspaper),
    page('education-hub', 'Education Hub', 'Courses and lessons that pay points', BookOpen),
    page('community', 'Community', 'The floor, articles and your page', Users),
    page('leaderboard', 'Leaderboard', 'Where you stand this period', Trophy),
    page('points-credits', 'Points & Credits', 'Level, missions and conversion', Sparkles),
    page('leverage-calculator', 'Trading Calculator', 'Leverage, margin and position size', Calculator),
    page('ai-companion', 'AI Companion', 'Ask about brokers, learning and your trades', Sparkles),
    page('profile', 'Profile', 'Your account and saved work', ChevronRight),
  ];
}

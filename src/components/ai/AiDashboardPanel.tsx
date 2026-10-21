import React, { useEffect, useMemo, useRef, useState } from 'react';
import { aiAllowance, asksLeft, asksUsedToday, recordAsk } from './aiAllowance';
import { answerFromPage } from './aiAnswer';
import { Activity, BarChart3, BookOpenCheck, CalendarDays, Check, ChevronDown, ChevronRight, Compass, Info, LayoutGrid, Lightbulb, MessageCircle, Paperclip, Plus, RefreshCw, Search, Send, Shield, Sparkles, Square, Sun, X } from 'lucide-react';
import { SpotlightData } from './AiSpotlightPanel';
import { AiGhost } from './AiGhost';

/**
 * The AI panel as a small dashboard: a greeting, the headline read, four
 * figures with their trend, and where to go next. Light and dark.
 */

const ICONS = [LayoutGrid, Activity, BarChart3, Shield];

/** A stable sparkline for a figure, so it does not jump between renders. */
function spark(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i += 1) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const pts: number[] = [];
  let v = 50;
  for (let i = 0; i < 16; i += 1) {
    h = (h * 1103515245 + 12345) >>> 0;
    v = Math.max(8, Math.min(92, v + ((h % 100) - 48) / 2.2));
    pts.push(v);
  }
  return pts.map((y, i) => `${i === 0 ? 'M' : 'L'}${(i / (pts.length - 1)) * 160},${34 - (y / 100) * 28}`).join(' ');
}

const TREND: Record<string, string> = { good: '#aeea00', bad: '#ff4fa3', neutral: '#8b7bf7' };

export const AiDashboardPanel: React.FC<{
  data: SpotlightData;
  greeting: string;
  /** The person's level, for the daily allowance on the Chat tab. */
  tierLevel?: number;
  tierName?: string;
  onClose: () => void;
  storageKey?: string;
  className?: string;
}> = ({ data, greeting, tierLevel = 1, tierName = 'your level', onClose, storageKey, className = '' }) => {
  const [tab, setTab] = useState(data.tabs[0]?.id ?? 'summary');
  const [run, setRun] = useState(0);
  const [busy, setBusy] = useState(false);
  const [openStat, setOpenStat] = useState<string | null>(null);

  useEffect(() => {
    if (run === 0) return;
    setBusy(true);
    const t = window.setTimeout(() => setBusy(false), 700);
    return () => window.clearTimeout(t);
  }, [run]);
  const active = useMemo(() => data.tabs.find((t) => t.id === tab) ?? data.tabs[0], [data.tabs, tab]);
  const first = active?.id === data.tabs[0]?.id;
  /** The conversation on the Chat tab, for as long as the panel is open. */
  const [chat, setChat] = useState<{
    id: number;
    from: 'you' | 'ai';
    text: string;
    /** Where this answer could take the person, if they want to go. */
    go?: { label: string; run: () => void; asked?: string };
    /** What it looked at before answering, and how long that took. */
    thought?: { seconds: number; steps: string[] };
    /** What it found, when the question was worked rather than answered. */
    rows?: { title: string; meta: string; action?: { label: string; run: () => void }; node?: React.ReactNode }[];
  }[]>([]);
  /** What it is doing right now, while the answer is still coming. */
  const [thinking, setThinking] = useState<{ steps: string[]; done: number; seconds: number } | null>(null);
  /** Which answers have their working opened. */
  const [openThought, setOpenThought] = useState<number | null>(null);
  /** The answer still being said, if any. */
  const [streaming, setStreaming] = useState<number | null>(null);
  /** The plus menu above the composer. */
  const [plusOpen, setPlusOpen] = useState(false);
  const plusRef = useRef<HTMLSpanElement | null>(null);

  // A menu that only closes by pressing the same button again is a trap on
  // touch, so a press anywhere else or the escape key closes it too.
  useEffect(() => {
    if (!plusOpen) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      if (!plusRef.current?.contains(e.target as Node)) setPlusOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setPlusOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('touchstart', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('touchstart', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [plusOpen]);
  /** What the person's level allows today, and what they have used. */
  const [asked, setAsked] = useState(() => asksUsedToday());
  const allowance = aiAllowance(tierLevel);
  const left = useMemo(() => asksLeft(tierLevel), [tierLevel, asked]);
  const stream = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(stream.current), []);

  /** True while it is thinking or still speaking. */
  const chatBusy = thinking !== null || streaming !== null;

  /** Cut it short: stop the clock, the steps and whatever is being said. */
  const stop = () => {
    window.clearTimeout(stream.current);
    setStreaming(null);
    setThinking(null);
  };

  const [draft, setDraft] = useState('');
  /** A file the person attached, with its text if we could read it. */
  const [file, setFile] = useState<{ name: string; size: number; text?: string } | null>(null);
  const filePicker = useRef<HTMLInputElement>(null);

  const takeFile = async (picked: File | undefined) => {
    if (!picked) return;
    const readable = /\.(csv|txt|json|md|tsv)$/i.test(picked.name) || picked.type.startsWith('text/');
    if (!readable) {
      setFile({ name: picked.name, size: picked.size });
      return;
    }
    try {
      const text = await picked.text();
      setFile({ name: picked.name, size: picked.size, text: text.slice(0, 20000) });
    } catch {
      setFile({ name: picked.name, size: picked.size });
    }
  };

  /** Finds the lines of an attached file that bear on the question. */
  const readFile = (question: string): string | null => {
    if (!file) return null;
    if (!file.text) {
      return `I can see ${file.name} attached, but I can only read text files: csv, tsv, json, md or txt. Attach one of those and I will read it.`;
    }
    const want = question.toLowerCase().split(/[^\p{L}\p{N}%.]+/u).filter((w) => w.length > 2);
    const lines = file.text.split(/\r?\n/).filter((l) => l.trim());
    const hits = lines
      .map((line) => ({ line, score: want.reduce((n, w) => (line.toLowerCase().includes(w) ? n + 1 : n), 0) }))
      .filter((h) => h.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((h) => h.line.trim());
    if (hits.length === 0) {
      return `${file.name} has ${lines.length} lines. Nothing in it mentions that. Its first line reads: ${lines[0]?.slice(0, 160) ?? '(empty)'}`;
    }
    return `From ${file.name}:\n${hits.join('\n')}`;
  };

  /**
   * What to offer above the composer.
   *
   * The feature brings its own, and where that is fewer than five the figures
   * on the page make up the rest: each one is a question this panel can answer
   * from what it already read, so nothing here leads to a shrug.
   */
  const openers = useMemo(() => {
    const own = (data.suggestions ?? []).map((sg) => ({
      label: sg.label,
      sub: sg.sub,
      cta: sg.cta ?? (sg.onClick ? { label: `Open: ${sg.label}`, run: sg.onClick } : undefined),
    }));
    const fromStats = (data.stats ?? [])
      .filter((st) => !own.some((o) => o.label.toLowerCase().includes(st.label.toLowerCase())))
      .map((st) => ({
        label: `What is ${st.label.toLowerCase()}?`,
        sub: data.statNotes?.[st.label],
        cta: undefined,
      }));
    return [...own, ...fromStats].slice(0, 5);
  }, [data.suggestions, data.stats, data.statNotes]);

  /**
   * Carries a question one step further inside the conversation.
   *
   * If the feature can show something, it arrives as rows with their own
   * actions. If it cannot, the button does what it always did and opens the
   * page, because a dead end is worse than a jump.
   */
  const work = (go: { label: string; run: () => void; asked?: string }) => {
    const found = (go.asked ? data.onResults?.(go.asked) : null)
      ?? data.onResults?.(go.label)
      ?? data.onResults?.(go.label.replace(/^Open:\s*/, ''));
    if (!found || found.rows.length === 0) { go.run(); return; }
    setChat((c) => [...c, {
      id: Date.now(),
      from: 'ai',
      text: found.intro,
      rows: found.rows,
    }]);
  };

  /**
   * The rows behind this feature's first question, for the Summary tab.
   *
   * Only shown when the feature actually has something: no placeholder rows,
   * and the links below stay either way.
   */
  const picks = useMemo(() => {
    const first = (data.suggestions ?? [])[0];
    if (!first || !data.onResults) return null;
    return data.onResults(first.label) ?? (first.cta ? data.onResults(first.cta.label) : null);
  }, [data.suggestions, data.onResults]);

  const say = (text: string, go?: { label: string; run: () => void; asked?: string }) => {
    const t = text.trim();
    if (!t || thinking) return;
    if (left !== null && left <= 0) {
      setChat((c) => [...c, {
        id: Date.now(),
        from: 'ai',
        text: `That is today\u2019s ${allowance.perDay} questions at ${tierName}. The count resets at midnight, or open the AI Companion to lift it for the day with credits.`,
      }]);
      setDraft('');
      return;
    }
    recordAsk();
    setAsked(asksUsedToday());
    window.clearTimeout(stream.current);
    setStreaming(null);

    // What it actually consults, named plainly, so the wait says something
    // true rather than filling time.
    const steps = [
      'Reading what is on this page',
      file ? `Opening ${file.name}` : 'Checking the figures on this page',
      'Putting the answer together',
    ];

    setChat((c) => [...c, { id: Date.now(), from: 'you', text: t }]);
    setDraft('');
    setThinking({ steps, done: 0, seconds: 0 });
    const clock = window.setInterval(
      () => setThinking((t) => (t ? { ...t, seconds: t.seconds + 1 } : t)),
      1000,
    );

    const started = Date.now();
    const tick = (i: number) => {
      window.setTimeout(() => {
        if (i < steps.length) {
          setThinking((t) => (t ? { ...t, done: i + 1 } : t));
          tick(i + 1);
          return;
        }
        const reply = readFile(t) ?? data.onAsk?.(t) ?? answerFromPage(data, t);
        const id = Date.now() + 1;
        window.clearInterval(clock);
        setThinking(null);
        setChat((c) => [...c, {
          id,
          from: 'ai',
          text: '',
          go: go ? { ...go, asked: go.asked ?? t } : undefined,
          thought: { seconds: Math.max(1, Math.round((Date.now() - started) / 1000)), steps },
        }]);

        // Say it a few words at a time. The person can start reading before
        // the sentence is finished, and nothing jumps into place at once.
        const words = reply.split(/(\s+)/);
        setStreaming(id);
        let at = 0;
        const feed = () => {
          at += 2;
          const upTo = words.slice(0, at).join('');
          setChat((c) => c.map((m) => (m.id === id ? { ...m, text: upTo } : m)));
          if (at < words.length) {
            stream.current = window.setTimeout(feed, 28);
          } else {
            setStreaming(null);
          }
        };
        feed();
      }, 420);
    };
    tick(0);
  };

  const pill = 'rounded-lg px-3 py-1.5 text-[14px] transition-colors';

  return (
    <section
      aria-label={`MarketSyde AI: ${data.pretext}`}
      data-keep-button-icons
      className={`flex flex-col overflow-hidden rounded-2xl border border-[#e4e0fa] bg-[#fbfbff] text-[#0b1c30] shadow-[0_18px_50px_rgba(11,28,48,0.18)] dark:border-[#2a1a66] dark:bg-[#090119] dark:text-white ${className}`}
    >
      {/* header — brand purple, with the MarketSyde glyph */}
      <div className="flex shrink-0 items-center gap-2.5 bg-gradient-to-r from-[#5945F1] via-[#6d3ae8] to-[#c026d3] px-3.5 py-2.5">
        <span className="flex shrink-0 items-center gap-2">
          <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/25">
            <AiGhost className="h-4 w-4" />
          </span>
          <span className="hidden font-display text-[15px] font-bold tracking-tight text-white sm:inline">
            market<span className="text-[#bef226]">syde</span>
          </span>
        </span>

        <nav aria-label="AI panel sections" className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto no-scrollbar">
          {data.tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              aria-pressed={active?.id === t.id}
              title={t.label}
              onClick={() => setTab(t.id)}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-[13px] transition-colors ${active?.id === t.id
                ? 'bg-white font-semibold text-[#5945F1] shadow-sm'
                : 'text-white/75 hover:bg-white/15 hover:text-white'}`}
            >
              {t.label}
            </button>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-1.5">
          <button type="button" aria-label="Analyze again" onClick={() => setRun((r) => r + 1)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/30 text-white transition hover:bg-white/15 active:scale-95">
            <RefreshCw className={`h-4 w-4 ${busy ? 'animate-spin' : ''}`} />
          </button>
          <button type="button" aria-label="Close the MarketSyde AI panel" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/30 text-white transition hover:bg-white/15 active:scale-95">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div key={`${active?.id}-${run}`} className={`min-h-0 flex-1 overflow-y-auto px-5 ${active?.id === 'chat' ? 'flex flex-col pb-0 pt-4' : 'py-4'}`}>
        {busy && (
          <div role="status" aria-live="polite" className="mb-4">
            <p className="text-[12px] font-semibold text-[#5945F1] dark:text-[#a99bff]">{data.pretext}…</p>
            <div className="mt-2 space-y-2" aria-hidden>
              {[86, 62].map((w) => <div key={w} className="h-2.5 animate-pulse rounded-full bg-[#f1f0fe] dark:bg-white/10" style={{ width: `${w}%` }} />)}
            </div>
          </div>
        )}
        {first ? (
          <>
            <div className="flex flex-col-reverse gap-4">
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 text-[14px] text-[#64748b] dark:text-white/70">
                  <Sun className="h-4 w-4" aria-hidden />{greeting}
                </p>
                <h2 className="mt-1.5 font-display text-[21px] font-bold leading-tight sm:text-[21px]">{data.headline}</h2>
                {data.overview && <p className="mt-2.5 max-w-[520px] text-[14px] leading-relaxed text-[#474556] dark:text-white/70">{data.overview}</p>}
              </div>
              <span
                className="grid h-14 w-14 shrink-0 self-center place-items-center rounded-2xl bg-gradient-to-br from-[#5945F1] to-[#2a1b7a]"
                aria-hidden
              >
                <Sparkles className="h-7 w-7 text-white/90" />
              </span>
            </div>

            {data.visual && <div className="mt-4">{data.visual}</div>}

            {!data.visual && data.stats && data.stats.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-2.5">
                {data.stats.slice(0, 4).map((s, i) => {
                  const Icon = ICONS[i % ICONS.length];
                  const colour = TREND[s.tone ?? 'neutral'];
                  const open = openStat === s.label;
                  return (
                    <button
                      key={s.label}
                      type="button"
                      aria-expanded={open}
                      onClick={() => setOpenStat(open ? null : s.label)}
                      className={`rounded-xl border bg-[#f8f7ff] p-3.5 text-left transition dark:bg-[#170345] ${open ? 'border-[#5945F1] dark:border-[#6b5bff]' : 'border-[#e4e0fa] hover:border-[#bdb4fa] dark:border-[#2a1a66] dark:hover:border-[#4a35b5]'}`}
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-[#5945F1] dark:bg-white/5 dark:text-white">
                          <Icon className="h-[18px] w-[18px]" aria-hidden />
                        </span>
                        <span className="min-w-0">
                          <span className="block break-words text-[10.5px] font-semibold uppercase leading-tight tracking-wide text-[#64748b] dark:text-white/60">{s.label}</span>
                          <span className="mt-1 block font-display text-[18px] font-bold leading-none" style={{ color: s.tone ? colour : undefined }}>{s.value}</span>
                        </span>
                      </div>
                      <svg viewBox="0 0 160 36" preserveAspectRatio="none" className="mt-2 h-6 w-full" aria-hidden>
                        <path d={spark(s.label + s.value)} fill="none" stroke={colour} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {open && (
                        <p className="mt-2 text-[12px] leading-relaxed text-[#64748b] dark:text-white/60">
                          {data.statNotes?.[s.label] ?? 'Taken from this page. Open the full view for the workings.'}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </>
        ) : active?.id === 'chat' ? (
          /* A conversation about this page: ask in your own words, or take an
             opener, which both says it and takes you where it leads. */
          <div className="flex flex-col gap-5">
            {chat.length === 0 ? (
              <div className="flex min-h-[260px] flex-1 flex-col items-center justify-center gap-5 px-2 text-center">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-[#5945F1] to-[#2a1b7a]" aria-hidden>
                  <Sparkles className="h-6 w-6 text-white/90" />
                </span>
                <span className="block">
                  <span className="block text-[17px] font-medium text-[#64748b] dark:text-white/60">
                    {greeting.split(',')[0]},
                  </span>
                  <span className="mt-0.5 block text-[16px] font-bold text-[#0b1c30] dark:text-white">
                    What would you like to know about this page?
                  </span>
                  <span className="mx-auto mt-2 block max-w-[340px] text-[13.5px] leading-relaxed text-[#64748b] dark:text-white/60">
                    I have already read it. Pick one of these, or ask in your own words.
                  </span>
                </span>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {chat.map((m) => (
                  <span
                    key={m.id}
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[14px] leading-relaxed ${
                      m.from === 'you'
                        ? 'ml-auto rounded-br-md bg-[#5945F1] text-white'
                        : 'mr-auto flex gap-2.5 rounded-bl-md bg-[#f5f4ff] text-[#0b1c30]'
                    }`}
                  >
                    {m.from === 'ai' && (
                      <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[#5945F1]" aria-hidden />
                    )}
                    <span className="min-w-0">
                      {m.thought && (
                        <button
                          type="button"
                          onClick={() => setOpenThought(openThought === m.id ? null : m.id)}
                          aria-expanded={openThought === m.id}
                          className="mb-1.5 inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[12px] text-[#64748b] transition-colors hover:text-[#0b1c30]"
                        >
                          <Sparkles className="h-3 w-3" aria-hidden />
                          Thought for {m.thought.seconds}s
                          <ChevronRight className={`h-3 w-3 transition-transform ${openThought === m.id ? 'rotate-90' : ''}`} aria-hidden />
                        </button>
                      )}
                      {m.thought && openThought === m.id && (
                        <span className="mb-2 block border-l border-[#CCC6FB] pl-3">
                          {m.thought.steps.map((st) => (
                            <span key={st} className="block py-0.5 text-[12.5px] text-[#64748b]">{st}</span>
                          ))}
                        </span>
                      )}
                      <span className="block whitespace-pre-line">
                        {m.text}
                        {streaming === m.id && (
                          <span className="ml-1 inline-block h-3.5 w-1 translate-y-0.5 animate-pulse rounded-full bg-[#5945F1]" aria-hidden />
                        )}
                      </span>
                      {m.rows && m.rows.length > 0 && (
                        <span className={m.rows.some((r) => r.node)
                          ? 'mt-2 -mx-1 flex snap-x snap-mandatory gap-2 overflow-x-auto px-1 pb-1 no-scrollbar'
                          : 'mt-2 flex flex-col gap-1.5'}>
                          {m.rows.map((row) => row.node ? (
                            <span key={row.title} className="block w-[72%] shrink-0 snap-start">{row.node}</span>
                          ) : (
                            <span
                              key={row.title}
                              className="flex items-center gap-2 rounded-lg border border-[#CCC6FB] bg-white px-2.5 py-2"
                            >
                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-[13px] font-bold text-[#0b1c30]">{row.title}</span>
                                <span className="block truncate text-[12px] text-[#64748b]">{row.meta}</span>
                              </span>
                              {row.action && (
                                <button
                                  type="button"
                                  onClick={row.action.run}
                                  className="shrink-0 rounded-md bg-[#5945F1] px-2.5 py-1 text-[12px] font-bold text-white transition hover:bg-[#4a38d6]"
                                >
                                  {row.action.label}
                                </button>
                              )}
                            </span>
                          ))}
                        </span>
                      )}

                      {m.go && !m.rows && (
                        <button
                          type="button"
                          onClick={() => work(m.go!)}
                          className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-[#5945F1] px-3 py-1.5 text-[12.5px] font-bold text-white transition-colors hover:bg-[#4a38d6]"
                        >
                          {m.go.label}
                          <ChevronRight className="h-3.5 w-3.5" aria-hidden />
                        </button>
                      )}
                    </span>
                  </span>
                ))}
                {thinking && (
                  <span className="mr-auto flex w-full max-w-[92%] flex-col gap-1 rounded-2xl rounded-bl-md bg-[#f5f4ff] px-3.5 py-3">
                    <span className="flex items-center gap-2 text-[13px]">
                      <Sparkles className="h-3.5 w-3.5 shrink-0 text-[#8a7af6]" aria-hidden />
                      <span className="ai-shimmer font-medium">Thinking it through</span>
                      <span className="ml-auto font-mono text-[11px] tabular-nums text-[#94a3b8]">{thinking.seconds}s</span>
                    </span>

                    <ol className="relative ml-[7px] border-l border-[#CCC6FB] pl-5 pt-1">
                      {thinking.steps.slice(0, thinking.done + 1).map((st, i) => {
                        const complete = i < thinking.done;
                        return (
                          <li
                            key={st}
                            className="ai-step-in relative flex min-h-8 items-center gap-3 py-1 text-[12.5px] leading-5"
                            style={{ animationDelay: `${i * 45}ms` }}
                          >
                            <span className="absolute -left-[26px] grid size-[11px] place-items-center rounded-full bg-[#f5f4ff] ring-4 ring-[#f5f4ff]">
                              {complete
                                ? <Check className="h-3 w-3 text-[#5f7a00]" aria-label="Done" />
                                : <span className="size-1.5 animate-pulse rounded-full bg-[#5945F1]" aria-label="In progress" />}
                            </span>
                            <span className={complete ? 'text-[#64748b]' : 'text-[#0b1c30]'}>
                              {st}{complete ? '' : '\u2026'}
                            </span>
                          </li>
                        );
                      })}
                    </ol>
                  </span>
                )}
              </div>
            )}

          </div>
        ) : (
          <div className="space-y-5">
            {(active?.lines ?? []).map((l) => (
              <div key={l.label}>
                <p className="text-[15px] font-bold">{l.label}</p>
                <p className="mt-1 text-[14px] leading-relaxed text-[#474556] dark:text-white/70">{l.body}</p>
              </div>
            ))}
          </div>
        )}

        {active?.id !== 'chat' && data.suggestions && data.suggestions.length > 0 && (
          <>
            <p className="mt-5 flex items-center gap-2 text-[12px] font-bold uppercase tracking-wide text-[#5945F1] dark:text-[#d6f73a]">
              <Compass className="h-4 w-4" aria-hidden />Where to go next
            </p>
            {/* What the first question actually brings back, shown here rather
                than behind a link, so the figures above have something under
                them a person can act on. */}
            {picks && picks.rows.length > 0 && (
              <div className="mt-3 flex flex-col gap-1.5">
                {picks.intro !== data.overview && (
                  <p className="text-[13px] leading-relaxed text-[#474556] dark:text-white/70">{picks.intro}</p>
                )}
                <div className={picks.rows.some((r) => r.node)
                  ? '-mx-1 flex snap-x snap-mandatory gap-2 overflow-x-auto px-1 pb-1 no-scrollbar'
                  : 'flex flex-col gap-1.5'}>
                {picks.rows.map((row) => row.node ? (
                  <div key={row.title} className="w-[72%] shrink-0 snap-start">{row.node}</div>
                ) : (
                  <div
                    key={row.title}
                    className="flex items-center gap-2 rounded-xl border border-[#CCC6FB] bg-white px-3 py-2.5 dark:bg-transparent"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13.5px] font-bold text-[#0b1c30] dark:text-white">{row.title}</span>
                      <span className="block truncate text-[12.5px] text-[#64748b] dark:text-white/60">{row.meta}</span>
                    </span>
                    {row.action && (
                      <button
                        type="button"
                        onClick={row.action.run}
                        className="shrink-0 rounded-lg bg-[#5945F1] px-3 py-1.5 text-[12.5px] font-bold text-white transition hover:bg-[#4a38d6]"
                      >
                        {row.action.label}
                      </button>
                    )}
                  </div>
                ))}
                </div>
              </div>
            )}

            <div className="mt-3 grid gap-2.5">
              {data.suggestions.map((s, i) => {
                const Icon = [BookOpenCheck, CalendarDays, MessageCircle][i % 3];
                // The first is what MarketSyde would do next, so it is the one
                // dressed as the action; the rest step back from it.
                const rank = i === 0 ? 'first' : i === 1 ? 'second' : 'rest';
                return (
                  <button
                    key={s.label}
                    type="button"
                    onClick={() => {
                      setTab('chat');
                      say(s.label, s.cta ?? (s.onClick ? { label: `Open: ${s.label}`, run: s.onClick } : undefined));
                    }}
                    className={`flex items-start gap-3 rounded-xl p-3.5 text-left transition ${
                      rank === 'first'
                        ? 'bg-[#5945F1] text-white hover:bg-[#4a38d6]'
                        : rank === 'second'
                          ? 'border border-[#5945F1] bg-[#f1f0fe] text-[#0b1c30] hover:bg-[#e7e4fd] dark:text-white'
                          : 'border border-[#CCC6FB] bg-white text-[#0b1c30] hover:border-[#5945F1] hover:bg-[#f8f7ff] dark:bg-transparent dark:text-white'
                    }`}
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                        rank === 'first' ? 'bg-white/15 text-white' : 'bg-white text-[#5945F1]'
                      }`}
                    >
                      <Icon className="h-[18px] w-[18px]" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[14px] font-bold">{s.label}</span>
                      {s.sub && (
                        <span className={`mt-1 block text-[13px] leading-relaxed ${
                          rank === 'first' ? 'text-white/75' : 'text-[#64748b] dark:text-white/60'
                        }`}>
                          {s.sub}
                        </span>
                      )}
                    </span>
                    <ChevronRight
                      className={`mt-0.5 h-4 w-4 shrink-0 ${rank === 'first' ? 'text-white/80' : 'text-[#94a3b8] dark:text-white/50'}`}
                      aria-hidden
                    />
                  </button>
                );
              })}
            </div>
          </>
        )}

        {data.footnote && active?.id !== 'chat' && (
          <p className="mt-6 flex items-start gap-2 text-[12px] leading-relaxed text-[#94a3b8] dark:text-white/45">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />{data.footnote}
          </p>
        )}

      </div>

      {active?.id === 'chat' && (
        <div className="shrink-0 border-t border-[#CCC6FB] bg-white px-5 pb-4 pt-3 dark:bg-[#170345]">
        {/* the composer */}
        {file && (
          <span className="flex items-center gap-2 self-start rounded-lg border border-[#CCC6FB] bg-white px-2.5 py-1.5 text-[12.5px] text-[#0b1c30] dark:bg-transparent dark:text-white">
            <Paperclip className="h-3.5 w-3.5 shrink-0 text-[#5945F1]" aria-hidden />
            <span className="max-w-[220px] truncate">{file.name}</span>
            <span className="shrink-0 text-[#94a3b8]">{Math.max(1, Math.round(file.size / 1024))} KB</span>
            <button type="button" onClick={() => setFile(null)} aria-label={`Remove ${file.name}`} className="shrink-0 text-[#94a3b8] hover:text-[#0b1c30]">
              <X className="h-3.5 w-3.5" aria-hidden />
            </button>
          </span>
        )}
        <input
          ref={filePicker}
          type="file"
          accept=".csv,.tsv,.txt,.json,.md,image/*"
          className="hidden"
          onChange={(e) => { void takeFile(e.target.files?.[0]); e.target.value = ''; }}
        />
        {/* openers for this feature: its own, topped up from the figures */}
        <div className="-mx-1 mb-2 flex gap-2 overflow-x-auto px-1 pb-0.5 no-scrollbar">
          {openers.map((sg, i) => {
            const Icon = [Compass, CalendarDays, MessageCircle, BarChart3, BookOpenCheck][i % 5];
            const tint = ['text-[#5945F1]', 'text-[#0ea5e9]', 'text-[#16a34a]', 'text-[#ec4899]', 'text-[#f59e0b]'][i % 5];
            return (
              <button
                key={sg.label}
                type="button"
                title={sg.sub}
                onClick={() => say(sg.label, sg.cta)}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[#CCC6FB] bg-white px-2.5 py-1.5 text-[12.5px] font-medium text-[#0b1c30] transition hover:border-[#5945F1] hover:bg-[#f7f6ff] dark:bg-transparent dark:text-white"
              >
                <Icon className={`h-3.5 w-3.5 shrink-0 ${tint}`} aria-hidden />
                {sg.label}
              </button>
            );
          })}
        </div>

        <div className="rounded-xl border border-[#CCC6FB] bg-white dark:bg-[#170345]">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-[#94a3b8]"
              aria-hidden
            />
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); say(draft); } }}
              aria-label="Ask MarketSyde AI"
              placeholder="Ask me anything..."
              rows={3}
              className="w-full resize-none rounded-t-xl bg-transparent py-3 pl-9 pr-10 text-[14px] leading-relaxed text-[#0b1c30] outline-none placeholder:text-[#94a3b8] dark:text-white"
            />
            <button
              type="button"
              onClick={() => say(draft)}
              disabled={!draft.trim()}
              aria-label="Send"
              className="absolute right-2 top-2.5 flex h-8 w-8 items-center justify-center rounded-lg text-[#94a3b8] transition-colors hover:text-[#5945F1] disabled:opacity-40"
            >
              <Send className="h-4 w-4" aria-hidden />
            </button>
          </div>

          <div className="flex items-center gap-1.5 border-t border-[#CCC6FB] bg-[#faf9ff] px-3 py-2 dark:bg-white/5">
            {/* One control rather than two pickers: a file, a figure from
                this page, or one of the openers, all under the same plus. */}
            <span className="relative" ref={plusRef}>
              <button
                type="button"
                onClick={() => setPlusOpen((o) => !o)}
                aria-expanded={plusOpen}
                aria-label="Add to this question"
                className={`flex h-8 w-8 items-center justify-center rounded-lg border transition ${
                  plusOpen
                ? 'border-[#5945F1] bg-white text-[#5945F1]'
                : 'border-[#CCC6FB] bg-white text-[#64748b] hover:border-[#5945F1] hover:text-[#5945F1] dark:bg-transparent'
                }`}
              >
                <Plus className="h-4 w-4" aria-hidden />
              </button>

              {plusOpen && (
                <span
                  className="absolute bottom-10 left-0 z-20 flex max-h-[260px] w-[250px] flex-col overflow-y-auto rounded-xl border border-[#CCC6FB] bg-white p-1.5 shadow-[0_12px_32px_-12px_rgba(11,28,48,0.35)]"
                  role="menu"
                >
                  <button
                type="button"
                role="menuitem"
                onClick={() => { setPlusOpen(false); filePicker.current?.click(); }}
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] text-[#0b1c30] transition hover:bg-[#f5f4ff]"
                  >
                <Paperclip className="h-4 w-4 shrink-0 text-[#64748b]" aria-hidden />
                {file ? 'Replace the file' : 'Upload a file'}
                  </button>

                  {file && (
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => { setPlusOpen(false); setFile(null); }}
                  className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] text-[#0b1c30] transition hover:bg-[#f5f4ff]"
                >
                  <X className="h-4 w-4 shrink-0 text-[#64748b]" aria-hidden />
                  <span className="min-w-0 flex-1 truncate">Remove {file.name}</span>
                </button>
                  )}

                  {(data.stats ?? []).length > 0 && (
                <>
                  <span className="my-1 block h-px bg-[#eceafb]" />
                  <span className="px-2.5 pb-1 pt-0.5 text-[11px] font-semibold uppercase tracking-wide text-[#94a3b8]">
                    From this page
                  </span>
                  {(data.stats ?? []).map((st) => (
                    <button
                      key={st.label}
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setPlusOpen(false);
                        setDraft((d) => `${d ? `${d.trim()} ` : ''}about ${st.label} (${st.value})`.trim());
                      }}
                      className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] text-[#0b1c30] transition hover:bg-[#f5f4ff]"
                    >
                      <BarChart3 className="h-4 w-4 shrink-0 text-[#64748b]" aria-hidden />
                      <span className="min-w-0 flex-1 truncate">{st.label}</span>
                      <span className="shrink-0 text-[12px] font-bold text-[#5945F1]">{st.value}</span>
                    </button>
                  ))}
                </>
                  )}

                  {openers.length > 0 && (
                <>
                  <span className="my-1 block h-px bg-[#eceafb]" />
                  <span className="px-2.5 pb-1 pt-0.5 text-[11px] font-semibold uppercase tracking-wide text-[#94a3b8]">
                    Ask about
                  </span>
                  {openers.map((sg) => (
                    <button
                      key={sg.label}
                      type="button"
                      role="menuitem"
                      onClick={() => { setPlusOpen(false); setDraft(sg.label); }}
                      className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] text-[#0b1c30] transition hover:bg-[#f5f4ff]"
                    >
                      <Lightbulb className="h-4 w-4 shrink-0 text-[#64748b]" aria-hidden />
                      <span className="min-w-0 truncate">{sg.label}</span>
                    </button>
                  ))}
                </>
                  )}
                </span>
              )}
            </span>

            <span className="flex-1" />

            <button
              type="button"
              onClick={() => { setChat([]); setFile(null); }}
              disabled={chat.length === 0}
              aria-label="Clear the conversation"
              title="Clear the conversation"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#64748b] transition hover:bg-white hover:text-[#0b1c30] disabled:opacity-30 dark:text-white/60"
            >
              <RefreshCw className="h-4 w-4" aria-hidden />
            </button>

            <button
              type="button"
              onClick={() => (chatBusy ? stop() : say(draft))}
              disabled={!chatBusy && !draft.trim()}
              aria-label={chatBusy ? 'Stop' : 'Send'}
              className="flex h-8 items-center gap-1.5 rounded-lg bg-[#5945F1] pl-3 pr-2.5 text-[12.5px] font-bold text-white transition hover:bg-[#4a38d6] disabled:bg-[#cdc7f5] disabled:text-white/80"
            >
              {chatBusy ? <>Stop<Square className="h-3 w-3 fill-current" aria-hidden /></> : <>Send<Send className="h-3.5 w-3.5" aria-hidden /></>}
            </button>
          </div>
        </div>
        </div>
      )}

    </section>
  );
};

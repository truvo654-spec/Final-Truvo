import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Send, Building2, GraduationCap, Newspaper, LineChart, HeartPulse, Compass, ShieldCheck, ChevronRight, Copy, ThumbsUp, ThumbsDown, Trash2, BookMarked, Gift, Wallet, FlaskConical, Bot, Users } from 'lucide-react';
import { Broker, MarketSignal, UserProfile } from '../../types';
import { PORTFOLIO_TRADES } from '../../data/portfolioData';
import { JOURNAL_ENTRIES } from '../../data/journalData';
import { tradeStats, tradesInRange } from '../portfolio/portfolioMath';
import { AiContext, AiItem, AiMemory, AiMessage, AiReply, BrokerPrefs, Level, RangeDays, Surface, SURFACE_PROMPTS, greeting, route, runSurface } from './aiEngine';

interface AiCompanionPageProps {
  user: UserProfile;
  brokers: Broker[];
  signals: MarketSignal[];
  onNavigateToTab: (tab: string) => void;
  onSelectSignal: (signal: MarketSignal) => void;
  onSelectBroker?: (broker: Broker) => void;
  onShowToast: (msg: string) => void;
}

const SURFACES: { id: Surface; title: string; desc: string; icon: React.ElementType }[] = [
  { id: 'broker', title: 'Broker matching', desc: 'Rank, compare and price brokers for how you trade.', icon: Building2 },
  { id: 'learn', title: 'Learning assistant', desc: 'Plain answers, quizzes and calculators at your level.', icon: GraduationCap },
  { id: 'market', title: 'Market summaries', desc: 'Today, week ahead, an asset class or one instrument.', icon: Newspaper },
  { id: 'insights', title: 'Trading insights', desc: 'What your trades say, by strategy, pair and session.', icon: LineChart },
  { id: 'behavior', title: 'Behavioral observation', desc: 'Mood, plan and mistakes, before they cost you.', icon: HeartPulse },
  { id: 'playbook', title: 'Playbook review', desc: 'Which of your setups actually pays, and which does not.', icon: BookMarked },
  { id: 'portfolio', title: 'Portfolio review', desc: 'Accounts, equity, drawdown and your goals.', icon: Wallet },
  { id: 'strategy', title: 'Backtest guide', desc: 'What to test next, and how to read the result.', icon: FlaskConical },
  { id: 'tools', title: 'Advisors & alerts', desc: 'Expert advisors worth a look, and alert hygiene.', icon: Bot },
  { id: 'community', title: 'Community pulse', desc: 'What traders are posting and which article to read.', icon: Users },
  { id: 'rewards', title: 'Cashback & perks', desc: 'Cashback, points, level, missions and live offers.', icon: Gift },
  { id: 'next', title: 'Recommendations', desc: 'What to learn, read and watch next, with the reason.', icon: Compass },
];

const STORE_KEY = 'marketsyde.aiCompanion.v2';
const LEVELS: Level[] = ['Beginner', 'Intermediate', 'Advanced'];
const RANGES: RangeDays[] = [7, 30, 90];

interface Saved {
  messages: AiMessage[];
  memory: AiMemory;
  prefs: BrokerPrefs;
  level: Level;
  range: RangeDays;
  allowTrades: boolean;
  allowJournal: boolean;
  quizAnswers: Record<string, number>;
  feedback: Record<string, 'up' | 'down'>;
}

const loadSaved = (): Partial<Saved> => {
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    if (!raw) return {};
    const v = JSON.parse(raw);
    return v && typeof v === 'object' && Array.isArray(v.messages) ? v : {};
  } catch {
    return {};
  }
};

const plainText = (m: AiMessage) =>
  [
    m.heading,
    ...(m.paragraphs ?? []),
    ...(m.stats ?? []).map((s) => `${s.label}: ${s.value}`),
    ...(m.bars ?? []).flatMap((b) => [b.title, ...b.rows.map((r) => `  ${r.label}: ${r.display}`)]),
    ...(m.table ? [m.table.columns.join(' | '), ...m.table.rows.map((r) => r.join(' | '))] : []),
    ...(m.items ?? []).map((i) => `- ${i.title}${i.sub ? ` (${i.sub})` : ''}`),
    m.note,
  ].filter(Boolean).join('\n');

const toneClass = (t?: string) => (t === 'good' ? 'text-emerald-600' : t === 'bad' ? 'text-rose-600' : 'text-[#0b1c30]');

const Bars: React.FC<{ title: string; rows: { label: string; value: number; display: string }[] }> = ({ title, rows }) => {
  const max = Math.max(1e-9, ...rows.map((r) => Math.abs(r.value)));
  return (
    <div className="mt-3 bg-white border border-[#e2e8f0] rounded-xl p-3">
      <p className="text-[11px] font-bold uppercase tracking-wide text-[#94a3b8] mb-2">{title}</p>
      <div className="space-y-1.5">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center gap-2 text-[11px]">
            <span className="w-28 sm:w-32 shrink-0 truncate text-[#474556]" title={r.label}>{r.label}</span>
            <span className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden"><span className={`block h-full rounded-full ${r.value < 0 ? 'bg-rose-400' : 'bg-[#5338ec]'}`} style={{ width: `${Math.max(3, (Math.abs(r.value) / max) * 100)}%` }} /></span>
            <span className={`w-20 shrink-0 text-right font-semibold ${r.value < 0 ? 'text-rose-600' : 'text-[#0b1c30]'}`}>{r.display}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const AiCompanionPage: React.FC<AiCompanionPageProps> = ({ user, brokers, signals, onNavigateToTab, onSelectSignal, onSelectBroker, onShowToast }) => {
  const first = user.firstName || user.username || 'there';
  const saved = useMemo(loadSaved, []);
  const defaultLevel: Level = user.tierLevel >= 4 ? 'Advanced' : user.tierLevel >= 2 ? 'Intermediate' : 'Beginner';

  const [messages, setMessages] = useState<AiMessage[]>(saved.messages?.length ? saved.messages : [greeting(first)]);
  const [memory, setMemory] = useState<AiMemory>(saved.memory ?? {});
  const [prefs, setPrefs] = useState<BrokerPrefs>(saved.prefs ?? { priority: 'cost', style: 'swing', platform: 'any', lots: 20 });
  const [level, setLevel] = useState<Level>(saved.level ?? defaultLevel);
  const [range, setRange] = useState<RangeDays>(saved.range ?? 30);
  const [allowTrades, setAllowTrades] = useState(saved.allowTrades ?? true);
  const [allowJournal, setAllowJournal] = useState(saved.allowJournal ?? true);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>(saved.quizAnswers ?? {});
  const [feedback, setFeedback] = useState<Record<string, 'up' | 'down'>>(saved.feedback ?? {});
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, [messages, thinking]);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  useEffect(() => {
    try {
      const data: Saved = { messages: messages.slice(-40), memory, prefs, level, range, allowTrades, allowJournal, quizAnswers, feedback };
      window.localStorage.setItem(STORE_KEY, JSON.stringify(data));
    } catch { /* storage can be unavailable; the chat still works in memory */ }
  }, [messages, memory, prefs, level, range, allowTrades, allowJournal, quizAnswers, feedback]);

  const ctx: AiContext = { firstName: first, user, brokers, signals, level, range, allowTrades, allowJournal, prefs, memory };

  const respond = (make: () => AiReply) => {
    setThinking(true);
    const r = make();
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      setMessages((m) => [...m, r.msg]);
      setMemory(r.mem);
      setThinking(false);
    }, 420);
  };

  const ask = (text: string) => {
    const t = text.trim();
    if (!t || thinking) return;
    setMessages((m) => [...m, { id: `u${Date.now()}`, role: 'user', text: t }]);
    setInput('');
    respond(() => route(t, ctx));
  };

  const pickSurface = (s: Surface) => {
    if (thinking) return;
    setMessages((m) => [...m, { id: `u${Date.now()}`, role: 'user', text: SURFACES.find((x) => x.id === s)!.title }]);
    respond(() => runSurface(s, ctx));
  };

  const matchWithPrefs = (next: BrokerPrefs) => {
    setPrefs(next);
    if (thinking) return;
    setMessages((m) => [...m, { id: `u${Date.now()}`, role: 'user', text: 'Match me with brokers' }]);
    respond(() => runSurface('broker', { ...ctx, prefs: next }));
  };

  const open = (it: AiItem) => {
    if (it.broker) {
      const b = brokers.find((x) => x.id === it.broker);
      if (b && onSelectBroker) return onSelectBroker(b);
      return onNavigateToTab('brokers');
    }
    if (it.signal) {
      const sig = signals.find((s) => s.ticker === it.signal);
      if (sig) return onSelectSignal(sig);
    }
    if (it.tab) onNavigateToTab(it.tab);
  };

  const copy = async (m: AiMessage) => {
    try { await navigator.clipboard.writeText(plainText(m)); onShowToast('Copied'); } catch { onShowToast('Could not copy here'); }
  };
  const vote = (id: string, v: 'up' | 'down') => {
    setFeedback((f) => { const n = { ...f }; if (n[id] === v) delete n[id]; else n[id] = v; return n; });
    onShowToast(v === 'up' ? 'Thanks, glad it helped' : 'Thanks, noted');
  };
  const clearChat = () => {
    window.clearTimeout(timer.current);
    setThinking(false);
    setMessages([greeting(first)]);
    setMemory({});
    setQuizAnswers({});
    setFeedback({});
    onShowToast('Conversation cleared');
  };

  const active: Surface = memory.surface ?? 'broker';
  const stats = tradeStats(tradesInRange(PORTFOLIO_TRADES, 30));
  const lastAiId = [...messages].reverse().find((m) => m.role === 'ai')?.id;
  const chip = (on: boolean) => `px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${on ? 'bg-[#5338ec] border-[#5338ec] text-white' : 'bg-white border-slate-200 text-[#474556] hover:border-[#5338ec]'}`;
  const label = 'text-[11px] font-bold uppercase tracking-wide text-[#94a3b8] mb-2';
  const lastUserIdx = messages.length - 1;

  return (
    <div data-keep-button-icons className="w-full max-w-[1280px] mx-auto px-4 sm:px-8 md:px-14 py-8 sm:py-10 pb-24">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-[#0b1c30]">AI Companion<span className="text-[#FD02B0]">.</span></h1>
        <p className="text-sm text-[#474556] mt-1 max-w-xl">AI that helps traders navigate smarter. Not AI predicting the market: AI around the trader.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)_290px] gap-6 items-start">
        {/* Surfaces */}
        <div className="flex lg:block gap-2 lg:space-y-2 overflow-x-auto lg:overflow-visible pb-1 -mx-1 px-1">
          {SURFACES.map((s) => {
            const Icon = s.icon;
            return (
              <button key={s.id} type="button" onClick={() => pickSurface(s.id)} aria-pressed={active === s.id} className={`min-w-[230px] lg:min-w-0 w-full flex items-start gap-3 text-left bg-white border rounded-2xl p-3.5 transition-colors ${active === s.id ? 'border-[#5338ec]' : 'border-[#e2e8f0] hover:border-[#5338ec]'}`}>
                <span className="w-9 h-9 rounded-xl bg-[#EEF0FE] flex items-center justify-center shrink-0"><Icon className="w-[18px] h-[18px] text-[#5338ec]" /></span>
                <span className="min-w-0">
                  <span className="block text-sm font-bold text-[#0b1c30]">{s.title}</span>
                  <span className="block text-[11px] text-[#474556] leading-snug">{s.desc}</span>
                </span>
              </button>
            );
          })}
        </div>

        {/* Chat */}
        <div className="bg-white border border-[#e2e8f0] rounded-2xl flex flex-col h-[72vh] min-h-[520px] max-h-[760px]">
          <div className="flex items-center justify-between px-5 py-3 border-b border-[#f1f5f9]">
            <p className="text-xs font-bold text-[#0b1c30]">{SURFACES.find((s) => s.id === active)!.title}</p>
            <button type="button" onClick={clearChat} className="flex items-center gap-1.5 text-[11px] font-semibold text-[#474556] hover:text-[#5338ec] transition-colors"><Trash2 className="w-3.5 h-3.5" />New conversation</button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-5" aria-live="polite">
            {messages.map((m, idx) =>
              m.role === 'user' ? (
                <div key={m.id} className="flex justify-end"><p className="max-w-[80%] bg-[#5338ec] text-white text-sm rounded-2xl rounded-br-md px-4 py-2.5 break-words">{m.text}</p></div>
              ) : (
                <div key={m.id} className="max-w-[96%] sm:max-w-[92%]">
                  <div className="bg-[#F8F7FF] border border-[#ECEEFA] rounded-2xl rounded-bl-md px-4 py-3.5">
                    {m.heading && <p className="text-sm font-bold text-[#0b1c30] mb-1.5">{m.heading}</p>}
                    {m.paragraphs?.map((p, i) => <p key={i} className="text-sm text-[#0b1c30] leading-relaxed mb-1.5 last:mb-0">{p}</p>)}

                    {m.stats && m.stats.length > 0 && (
                      <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {m.stats.map((s) => (
                          <div key={s.label} className="bg-white border border-[#e2e8f0] rounded-xl px-3 py-2">
                            <p className="text-[10px] font-bold uppercase tracking-wide text-[#94a3b8] truncate">{s.label}</p>
                            <p className={`text-sm font-bold ${toneClass(s.tone)}`}>{s.value}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {m.bars?.map((b) => <Bars key={b.title} title={b.title} rows={b.rows} />)}

                    {m.table && (
                      <div className="mt-3 bg-white border border-[#e2e8f0] rounded-xl overflow-x-auto">
                        <table className="w-full text-[11px]">
                          <thead><tr className="bg-[#F8F7FF]">{m.table.columns.map((c, i) => <th key={i} className="text-left font-bold text-[#0b1c30] px-3 py-2 whitespace-nowrap">{c}</th>)}</tr></thead>
                          <tbody>{m.table.rows.map((r, i) => <tr key={i} className="border-t border-[#f1f5f9]">{r.map((c, j) => <td key={j} className={`px-3 py-1.5 ${j === 0 ? 'text-[#94a3b8] font-semibold whitespace-nowrap' : 'text-[#0b1c30]'}`}>{c}</td>)}</tr>)}</tbody>
                        </table>
                      </div>
                    )}

                    {m.quiz && (() => {
                      const picked = quizAnswers[m.id];
                      const answered = picked !== undefined;
                      return (
                        <div className="mt-3 bg-white border border-[#e2e8f0] rounded-xl p-3.5">
                          <p className="text-sm font-semibold text-[#0b1c30] mb-2.5">{m.quiz.question}</p>
                          <div className="space-y-1.5">
                            {m.quiz.options.map((o, i) => {
                              const isRight = i === m.quiz!.correctIndex;
                              const cls = !answered ? 'border-slate-200 hover:border-[#5338ec] text-[#0b1c30]' : isRight ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : i === picked ? 'border-rose-400 bg-rose-50 text-rose-700' : 'border-slate-200 text-[#94a3b8]';
                              return <button key={i} type="button" disabled={answered} onClick={() => setQuizAnswers((a) => ({ ...a, [m.id]: i }))} className={`w-full text-left text-xs font-medium border rounded-lg px-3 py-2 transition-colors ${cls}`}>{o}</button>;
                            })}
                          </div>
                          {answered && <p className="text-xs text-[#474556] leading-relaxed mt-3"><span className={`font-bold ${picked === m.quiz.correctIndex ? 'text-emerald-600' : 'text-rose-600'}`}>{picked === m.quiz.correctIndex ? 'Correct. ' : 'Not quite. '}</span>{m.quiz.explanation}</p>}
                        </div>
                      );
                    })()}

                    {m.items && m.items.length > 0 && (
                      <div className="mt-3 space-y-1.5">
                        {m.items.map((it, i) => {
                          const clickable = !!(it.tab || it.signal || it.broker);
                          return (
                            <div key={i} role={clickable ? 'button' : undefined} tabIndex={clickable ? 0 : undefined} onClick={() => clickable && open(it)} onKeyDown={(e) => clickable && e.key === 'Enter' && open(it)} className={`flex items-center justify-between gap-3 bg-white border border-[#e2e8f0] rounded-xl px-3 py-2.5 ${clickable ? 'cursor-pointer hover:border-[#5338ec]' : ''}`}>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-[#0b1c30] truncate">{it.title}</p>
                                {it.sub && <p className="text-[11px] text-[#474556] leading-snug">{it.sub}</p>}
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                {it.badge && <span className="text-[10px] font-bold text-[#5338ec] bg-[#EEF0FE] rounded-full px-2 py-0.5">{it.badge}</span>}
                                {clickable && <ChevronRight className="w-4 h-4 text-slate-300" />}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {m.note && <p className="text-[11px] text-[#474556] mt-3 leading-relaxed">{m.note}</p>}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 ml-1">
                    {m.sources && <p className="text-[10px] text-[#94a3b8]">Based on: {m.sources.join(' · ')}</p>}
                    {idx > 0 && (
                      <span className="flex items-center gap-1 ml-auto">
                        <button type="button" aria-label="Copy answer" onClick={() => copy(m)} className="p-1 text-slate-400 hover:text-[#5338ec]"><Copy className="w-3.5 h-3.5" /></button>
                        <button type="button" aria-label="Helpful" aria-pressed={feedback[m.id] === 'up'} onClick={() => vote(m.id, 'up')} className={`p-1 ${feedback[m.id] === 'up' ? 'text-[#5338ec]' : 'text-slate-400 hover:text-[#5338ec]'}`}><ThumbsUp className="w-3.5 h-3.5" /></button>
                        <button type="button" aria-label="Not helpful" aria-pressed={feedback[m.id] === 'down'} onClick={() => vote(m.id, 'down')} className={`p-1 ${feedback[m.id] === 'down' ? 'text-rose-500' : 'text-slate-400 hover:text-rose-500'}`}><ThumbsDown className="w-3.5 h-3.5" /></button>
                      </span>
                    )}
                  </div>

                  {m.id === lastAiId && idx === lastUserIdx && m.followUps && m.followUps.length > 0 && !thinking && (
                    <div className="flex flex-wrap gap-2 mt-2.5 ml-1">
                      {m.followUps.map((f) => <button key={f} type="button" onClick={() => ask(f)} className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white border border-[#d9dcf7] text-[#5338ec] hover:bg-[#EEF0FE] transition-colors text-left">{f}</button>)}
                    </div>
                  )}
                </div>
              )
            )}
            {thinking && <div className="flex gap-1.5 ml-2" aria-label="Thinking">{[0, 1, 2].map((i) => <span key={i} className="w-2 h-2 rounded-full bg-[#ABA1F8] animate-pulse" style={{ animationDelay: `${i * 150}ms` }} />)}</div>}
            <div ref={endRef} />
          </div>

          <div className="border-t border-[#f1f5f9] p-4 space-y-3">
            <div className="flex gap-2 overflow-x-auto pb-0.5">
              {SURFACE_PROMPTS[active].map((p) => <button key={p} type="button" onClick={() => ask(p)} className="shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#EEF0FE] text-[#5338ec] hover:bg-[#E0E3FC] transition-colors">{p}</button>)}
            </div>
            <div className="flex items-center gap-2">
              <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && ask(input)} aria-label="Ask the AI Companion" placeholder="Ask about brokers, a term, the market or your trades" className="flex-1 min-w-0 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#5338ec]/30" />
              <button type="button" onClick={() => ask(input)} disabled={!input.trim() || thinking} aria-label="Send" className="w-10 h-10 rounded-xl bg-[#5338ec] hover:bg-[#4326d8] disabled:opacity-40 text-white flex items-center justify-center shrink-0 transition-colors"><Send className="w-4 h-4" /></button>
            </div>
          </div>
        </div>

        {/* Context */}
        <div className="space-y-4">
          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5">
            <h3 className="text-sm font-bold text-[#0b1c30] mb-3">Find a broker</h3>
            <p className={label}>What matters most</p>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {([['cost', 'Low costs'], ['safety', 'Regulation'], ['cashback', 'Cashback'], ['deposit', 'Small deposit']] as const).map(([k, l]) => <button key={k} type="button" onClick={() => setPrefs({ ...prefs, priority: k })} className={chip(prefs.priority === k)}>{l}</button>)}
            </div>
            <p className={label}>How you trade</p>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {([['scalping', 'Scalping'], ['swing', 'Swing'], ['crypto', 'Crypto']] as const).map(([k, l]) => <button key={k} type="button" onClick={() => setPrefs({ ...prefs, style: k })} className={chip(prefs.style === k)}>{l}</button>)}
            </div>
            <p className={label}>Platform</p>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {(['any', 'MT4', 'MT5', 'cTrader'] as const).map((k) => <button key={k} type="button" onClick={() => setPrefs({ ...prefs, platform: k })} className={chip(prefs.platform === k)}>{k === 'any' ? 'Any' : k}</button>)}
            </div>
            <p className={label}>Lots you trade a month</p>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {[5, 20, 50, 100].map((k) => <button key={k} type="button" onClick={() => setPrefs({ ...prefs, lots: k })} className={chip(prefs.lots === k)}>{k}</button>)}
            </div>
            <button type="button" onClick={() => matchWithPrefs(prefs)} className="w-full bg-[#5338ec] hover:bg-[#4326d8] text-white text-xs font-bold py-2.5 rounded-xl transition-colors">Match me</button>
          </div>

          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5">
            <h3 className="text-sm font-bold text-[#0b1c30] mb-3">How I answer</h3>
            <p className={label}>Your level</p>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {LEVELS.map((l) => <button key={l} type="button" onClick={() => { setLevel(l); onShowToast(`I will explain at ${l} level`); }} className={chip(level === l)}>{l}</button>)}
            </div>
            <p className={label}>Look back</p>
            <div className="flex flex-wrap gap-1.5">
              {RANGES.map((r) => <button key={r} type="button" onClick={() => setRange(r)} className={chip(range === r)}>{r} days</button>)}
            </div>
          </div>

          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5">
            <h3 className="text-sm font-bold text-[#0b1c30] mb-3">What I can see</h3>
            <ul className="space-y-2 text-xs text-[#474556] mb-4">
              <li className="flex justify-between"><span>Rank</span><span className="font-bold text-[#0b1c30]">{user.rankTitle}</span></li>
              <li className="flex justify-between"><span>Connected brokers</span><span className="font-bold text-[#0b1c30]">{brokers.filter((b) => b.connected).length}</span></li>
              <li className="flex justify-between"><span>30-day trades</span><span className="font-bold text-[#0b1c30]">{allowTrades ? stats.closed : 'hidden'}</span></li>
              <li className="flex justify-between"><span>30-day win rate</span><span className="font-bold text-[#0b1c30]">{allowTrades ? `${stats.winRate.toFixed(0)}%` : 'hidden'}</span></li>
              <li className="flex justify-between"><span>Journal entries</span><span className="font-bold text-[#0b1c30]">{allowJournal ? JOURNAL_ENTRIES.length : 'hidden'}</span></li>
            </ul>
            <div className="space-y-2.5">
              <label className="flex items-start gap-2.5 text-xs text-[#0b1c30] cursor-pointer">
                <input type="checkbox" checked={allowTrades} onChange={(e) => { setAllowTrades(e.target.checked); onShowToast(e.target.checked ? 'I can use your trades again' : 'I will not use your trades'); }} className="mt-0.5 rounded border-slate-300 text-[#5338ec] focus:ring-[#5338ec]" />
                Use my portfolio trades
              </label>
              <label className="flex items-start gap-2.5 text-xs text-[#0b1c30] cursor-pointer">
                <input type="checkbox" checked={allowJournal} onChange={(e) => { setAllowJournal(e.target.checked); onShowToast(e.target.checked ? 'I can use your journal again' : 'I will not use your journal'); }} className="mt-0.5 rounded border-slate-300 text-[#5338ec] focus:ring-[#5338ec]" />
                Use my trading journal
              </label>
            </div>
          </div>

          <p className="flex items-start gap-2 text-[11px] text-[#474556] leading-relaxed px-1"><ShieldCheck className="w-4 h-4 text-[#5338ec] shrink-0" />Answers are built from MarketSyde data on this page and show where they came from. The chat is kept on this device only. Not financial advice.</p>
        </div>
      </div>
    </div>
  );
};

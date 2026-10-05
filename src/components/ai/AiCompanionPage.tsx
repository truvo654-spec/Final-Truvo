import React, { useEffect, useRef, useState } from 'react';
import { Send, Building2, GraduationCap, Newspaper, LineChart, HeartPulse, Compass, ShieldCheck, ChevronRight } from 'lucide-react';
import { Broker, MarketSignal, UserProfile } from '../../types';
import { AiMessage, BrokerPrefs, Surface, behaviorObservation, learnAnswer, marketSummary, matchBrokers, recommendations, route, tradingInsights } from './aiEngine';
import { PORTFOLIO_TRADES } from '../../data/portfolioData';
import { tradeStats, tradesInRange } from '../portfolio/portfolioMath';

interface AiCompanionPageProps {
  user: UserProfile;
  brokers: Broker[];
  signals: MarketSignal[];
  onNavigateToTab: (tab: string) => void;
  onSelectSignal: (signal: MarketSignal) => void;
  onShowToast: (msg: string) => void;
}

const SURFACES: { id: Surface; title: string; desc: string; icon: React.ElementType; prompts: string[] }[] = [
  { id: 'broker', title: 'Broker matching', desc: 'Pair you with brokers that fit your profile.', icon: Building2, prompts: ['Which broker suits me?', 'Brokers with the best cashback'] },
  { id: 'learn', title: 'Learning assistant', desc: 'Plain answers tied to your level.', icon: GraduationCap, prompts: ['What is drawdown?', 'Explain risk/reward'] },
  { id: 'market', title: 'Market summaries', desc: 'Minutes, not hours.', icon: Newspaper, prompts: ['Give me today’s briefing'] },
  { id: 'insights', title: 'Trading insights', desc: 'Context across your recent trades.', icon: LineChart, prompts: ['How are my trades doing?'] },
  { id: 'behavior', title: 'Behavioral observation', desc: 'Surface habits before they cost you.', icon: HeartPulse, prompts: ['Any habits I should watch?'] },
  { id: 'next', title: 'Recommendations', desc: 'What to read, learn and watch next.', icon: Compass, prompts: ['What should I do next?'] },
];

export const AiCompanionPage: React.FC<AiCompanionPageProps> = ({ user, brokers, signals, onNavigateToTab, onSelectSignal, onShowToast }) => {
  const first = user.firstName || user.username || 'there';
  const [surface, setSurface] = useState<Surface>('broker');
  const [usePersonal, setUsePersonal] = useState(true);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [prefs, setPrefs] = useState<BrokerPrefs>({ priority: 'cost', style: 'swing' });
  const [messages, setMessages] = useState<AiMessage[]>([
    { id: 'hello', role: 'ai', heading: `Hi ${first}.`, paragraphs: ['I help you navigate. I do not predict the market, and nothing here is financial advice. Pick a topic on the left or just ask.'] },
  ]);
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, [messages, thinking]);

  const ctx = { firstName: first, brokers, signals, usePersonalData: usePersonal };

  const reply = (make: () => AiMessage) => {
    setThinking(true);
    window.setTimeout(() => {
      setMessages((m) => [...m, make()]);
      setThinking(false);
    }, 450);
  };

  const ask = (text: string) => {
    const t = text.trim();
    if (!t || thinking) return;
    setMessages((m) => [...m, { id: `u${Date.now()}`, role: 'user', text: t }]);
    setInput('');
    reply(() => route(t, ctx, prefs));
  };

  const runSurface = (s: Surface) => {
    setSurface(s);
    const label = SURFACES.find((x) => x.id === s)!.title;
    setMessages((m) => [...m, { id: `u${Date.now()}`, role: 'user', text: label }]);
    reply(() =>
      s === 'broker' ? matchBrokers(brokers, prefs)
      : s === 'learn' ? learnAnswer('start')
      : s === 'market' ? marketSummary(signals)
      : s === 'insights' ? (usePersonal ? tradingInsights() : route('my trades', ctx, prefs))
      : s === 'behavior' ? (usePersonal ? behaviorObservation() : route('habit', ctx, prefs))
      : recommendations(signals)
    );
  };

  const stats = tradeStats(tradesInRange(PORTFOLIO_TRADES, 30));
  const active = SURFACES.find((s) => s.id === surface)!;
  const chip = (on: boolean) => `px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${on ? 'bg-[#5338ec] border-[#5338ec] text-white' : 'bg-white border-slate-200 text-[#474556] hover:border-[#5338ec]'}`;

  const open = (it: AiMessage['items'] extends (infer I)[] | undefined ? I : never) => {
    if (it.signal) {
      const sig = signals.find((s) => s.ticker === it.signal);
      if (sig) return onSelectSignal(sig);
    }
    if (it.tab) onNavigateToTab(it.tab);
  };

  return (
    <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-8 md:px-14 py-8 sm:py-10 pb-24">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-[#0b1c30]">AI Companion<span className="text-[#FD02B0]">.</span></h1>
        <p className="text-sm text-[#474556] mt-1 max-w-xl">AI that helps traders navigate smarter. Not AI predicting the market: AI around the trader.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)_280px] gap-6 items-start">
        {/* Surfaces */}
        <div className="space-y-2">
          {SURFACES.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.id} tabIndex={0} onClick={() => runSurface(s.id)} onKeyDown={(e) => e.key === 'Enter' && runSurface(s.id)} className={`w-full flex items-start gap-3 text-left bg-white border rounded-2xl p-3.5 cursor-pointer transition-colors ${surface === s.id ? 'border-[#5338ec]' : 'border-[#e2e8f0] hover:border-[#5338ec]'}`}>
                <span className="w-9 h-9 rounded-xl bg-[#EEF0FE] flex items-center justify-center shrink-0"><Icon className="w-[18px] h-[18px] text-[#5338ec]" /></span>
                <span className="min-w-0">
                  <span className="block text-sm font-bold text-[#0b1c30]">{s.title}</span>
                  <span className="block text-[11px] text-[#474556] leading-snug">{s.desc}</span>
                </span>
              </div>
            );
          })}
        </div>

        {/* Chat */}
        <div className="bg-white border border-[#e2e8f0] rounded-2xl flex flex-col h-[640px]">
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {messages.map((m) =>
              m.role === 'user' ? (
                <div key={m.id} className="flex justify-end"><p className="max-w-[80%] bg-[#5338ec] text-white text-sm rounded-2xl rounded-br-md px-4 py-2.5">{m.text}</p></div>
              ) : (
                <div key={m.id} className="max-w-[92%]">
                  <div className="bg-[#F8F7FF] border border-[#ECEEFA] rounded-2xl rounded-bl-md px-4 py-3.5">
                    {m.heading && <p className="text-sm font-bold text-[#0b1c30] mb-1.5">{m.heading}</p>}
                    {m.paragraphs?.map((p, i) => <p key={i} className="text-sm text-[#0b1c30] leading-relaxed mb-1.5 last:mb-0">{p}</p>)}
                    {m.items && m.items.length > 0 && (
                      <div className="mt-3 space-y-1.5">
                        {m.items.map((it, i) => (
                          <div key={i} onClick={() => open(it)} className={`flex items-center justify-between gap-3 bg-white border border-[#e2e8f0] rounded-xl px-3 py-2.5 ${it.tab || it.signal ? 'cursor-pointer hover:border-[#5338ec]' : ''}`}>
                            <div className="min-w-0"><p className="text-xs font-bold text-[#0b1c30] truncate">{it.title}</p>{it.sub && <p className="text-[11px] text-[#474556]">{it.sub}</p>}</div>
                            {(it.tab || it.signal) && <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />}
                          </div>
                        ))}
                      </div>
                    )}
                    {m.note && <p className="text-[11px] text-[#474556] mt-3 leading-relaxed">{m.note}</p>}
                  </div>
                  {m.sources && <p className="text-[10px] text-[#94a3b8] mt-1.5 ml-1">Based on: {m.sources.join(' · ')}</p>}
                </div>
              )
            )}
            {thinking && <div className="flex gap-1.5 ml-2">{[0, 1, 2].map((i) => <span key={i} className="w-2 h-2 rounded-full bg-[#ABA1F8] animate-pulse" style={{ animationDelay: `${i * 150}ms` }} />)}</div>}
            <div ref={endRef} />
          </div>

          <div className="border-t border-[#f1f5f9] p-4 space-y-3">
            <div className="flex flex-wrap gap-2">
              {active.prompts.map((p) => <button key={p} onClick={() => ask(p)} className="px-3 py-1.5 rounded-full text-xs font-semibold bg-[#EEF0FE] text-[#5338ec] hover:bg-[#E0E3FC] transition-colors">{p}</button>)}
            </div>
            <div className="flex items-center gap-2">
              <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && ask(input)} placeholder="Ask about brokers, a term, the market or your trades" className="flex-1 min-w-0 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#5338ec]/30" />
              <button onClick={() => ask(input)} disabled={!input.trim() || thinking} aria-label="Send" className="w-10 h-10 rounded-xl bg-[#5338ec] hover:bg-[#4326d8] disabled:opacity-40 text-white flex items-center justify-center shrink-0 transition-colors"><Send className="w-4 h-4" /></button>
            </div>
          </div>
        </div>

        {/* Context */}
        <div className="space-y-4">
          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5">
            <h3 className="text-sm font-bold text-[#0b1c30] mb-3">Find a broker</h3>
            <p className="text-[11px] font-bold uppercase tracking-wide text-[#94a3b8] mb-2">What matters most</p>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {([['cost', 'Low costs'], ['safety', 'Regulation'], ['cashback', 'Cashback'], ['deposit', 'Small deposit']] as const).map(([k, l]) => <button key={k} onClick={() => setPrefs({ ...prefs, priority: k })} className={chip(prefs.priority === k)}>{l}</button>)}
            </div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-[#94a3b8] mb-2">How you trade</p>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {([['scalping', 'Scalping'], ['swing', 'Swing'], ['crypto', 'Crypto']] as const).map(([k, l]) => <button key={k} onClick={() => setPrefs({ ...prefs, style: k })} className={chip(prefs.style === k)}>{l}</button>)}
            </div>
            <button onClick={() => runSurface('broker')} className="w-full bg-[#5338ec] hover:bg-[#4326d8] text-white text-xs font-bold py-2.5 rounded-xl transition-colors">Match me</button>
          </div>

          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5">
            <h3 className="text-sm font-bold text-[#0b1c30] mb-3">What I can see</h3>
            <ul className="space-y-2 text-xs text-[#474556] mb-4">
              <li className="flex justify-between"><span>Level</span><span className="font-bold text-[#0b1c30]">{user.rankTitle}</span></li>
              <li className="flex justify-between"><span>Connected brokers</span><span className="font-bold text-[#0b1c30]">{brokers.filter((b) => b.connected).length}</span></li>
              <li className="flex justify-between"><span>30-day trades</span><span className="font-bold text-[#0b1c30]">{usePersonal ? stats.closed : 'hidden'}</span></li>
              <li className="flex justify-between"><span>30-day win rate</span><span className="font-bold text-[#0b1c30]">{usePersonal ? `${stats.winRate.toFixed(0)}%` : 'hidden'}</span></li>
            </ul>
            <label className="flex items-start gap-2.5 text-xs text-[#0b1c30] cursor-pointer">
              <input type="checkbox" checked={usePersonal} onChange={(e) => { setUsePersonal(e.target.checked); onShowToast(e.target.checked ? 'I can use your trades and journal again' : 'I will not use your trades or journal'); }} className="mt-0.5 rounded border-slate-300 text-[#5338ec] focus:ring-[#5338ec]" />
              Use my portfolio and journal data to answer
            </label>
          </div>

          <p className="flex items-start gap-2 text-[11px] text-[#474556] leading-relaxed px-1"><ShieldCheck className="w-4 h-4 text-[#5338ec] shrink-0" />Answers are built from MarketSyde data on this page and show where they came from. Not financial advice.</p>
        </div>
      </div>
    </div>
  );
};

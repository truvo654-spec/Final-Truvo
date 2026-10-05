import React, { useMemo, useState } from 'react';
import { X, Users } from 'lucide-react';
import { PortfolioCtx } from './portfolioContext';
import { Card, CardTitle, Locked, PLAN_RANK } from './portfolioUi';
import { TradeStats, maxDrawdown } from './portfolioMath';
import { EquityPoint } from '../../data/portfolioData';

interface Shared {
  id: string;
  group: string;
  caption: string;
  ret: string;
  win: string;
  comments: { who: string; text: string }[];
}

const GROUPS = ['Bangkok Forex Circle', 'Mentor: Sarah K.', 'Swing traders (Premium)'];

const COHORT = [
  { label: 'Return', pct: 72 },
  { label: 'Lower drawdown', pct: 64 },
  { label: 'Plan adherence', pct: 81 },
  { label: 'Consistency', pct: 58 },
];

export const PortfolioCommunityCard: React.FC<{ ctx: PortfolioCtx; stats: TradeStats; series: EquityPoint[] }> = ({ ctx, stats, series }) => {
  const rank = PLAN_RANK[ctx.plan];
  const [open, setOpen] = useState(false);
  const [group, setGroup] = useState(GROUPS[0]);
  const [caption, setCaption] = useState('');
  const [commentFor, setCommentFor] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [shared, setShared] = useState<Shared[]>([
    {
      id: 'sh1',
      group: 'Mentor: Sarah K.',
      caption: 'September review: win rate steady, drawdown under control.',
      ret: '+7.8%',
      win: '54%',
      comments: [{ who: 'Sarah K.', text: 'Nice discipline on sizing. Look at your Friday exits.' }],
    },
  ]);

  const snap = useMemo(() => {
    const first = series[0]?.value || 1;
    const last = series[series.length - 1]?.value || first;
    const r = ((last - first) / first) * 100;
    return { ret: `${r >= 0 ? '+' : ''}${r.toFixed(1)}%`, win: `${stats.winRate.toFixed(0)}%`, pf: stats.profitFactor >= 99 ? '∞' : stats.profitFactor.toFixed(2), dd: `${maxDrawdown(series).toFixed(1)}%`, trades: stats.closed };
  }, [series, stats]);

  return (
    <Card className="p-5">
      <CardTitle title="Community" icon={<Users className="w-4 h-4 text-[#5338ec]" />} hint="Share an anonymized snapshot and compare" />
      <Locked locked={rank < 2} label="Unlock on Premium" onUpgrade={ctx.upgrade}>
        <div className="space-y-4">
          <button onClick={() => setOpen(true)} className="w-full bg-[#0b1c30] hover:bg-slate-800 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors">
            Share anonymized portfolio
          </button>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-[#94a3b8] mb-2">You vs other Premium users</p>
            <div className="space-y-2.5">
              {COHORT.map((c) => (
                <div key={c.label}>
                  <div className="flex justify-between text-[11px] mb-1"><span className="font-semibold text-[#0b1c30]">{c.label}</span><span className="font-mono text-[#474556]">top {100 - c.pct}%</span></div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-[#5338ec] rounded-full" style={{ width: `${c.pct}%` }} /></div>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-[#94a3b8] mt-2">Sample cohort for preview.</p>
          </div>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-[#94a3b8] mb-2">Shared by you</p>
            <div className="space-y-3">
              {shared.map((s) => (
                <div key={s.id} className="border border-[#f1f5f9] rounded-xl p-3">
                  <div className="flex items-center justify-between text-[11px] mb-1.5"><span className="font-bold text-[#5338ec]">{s.group}</span><span className="font-mono text-emerald-600 font-bold">{s.ret} · {s.win} win</span></div>
                  <p className="text-xs text-[#0b1c30] leading-relaxed mb-2">{s.caption}</p>
                  {s.comments.map((c, i) => (
                    <p key={i} className="text-[11px] text-[#474556] bg-slate-50 rounded-lg px-2.5 py-1.5 mb-1.5"><span className="font-bold text-[#0b1c30]">{c.who}:</span> {c.text}</p>
                  ))}
                  {commentFor === s.id ? (
                    <div className="flex gap-2 mt-1">
                      <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Add a comment" className="flex-1 min-w-0 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#5338ec]/30" />
                      <button
                        disabled={!draft.trim()}
                        onClick={() => {
                          setShared((p) => p.map((x) => (x.id === s.id ? { ...x, comments: [...x.comments, { who: 'You', text: draft.trim() }] } : x)));
                          setDraft('');
                          setCommentFor(null);
                        }}
                        className="text-xs font-bold text-white bg-[#5338ec] disabled:opacity-40 px-3 rounded-lg"
                      >
                        Post
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => setCommentFor(s.id)} className="text-[11px] font-bold text-[#5338ec] hover:underline">Comment</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Locked>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-[#e2e8f0] w-full max-w-md shadow-2xl p-6">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-lg font-bold text-[#0b1c30]">Share anonymized portfolio</h3>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100"><X className="w-4 h-4" /></button>
            </div>
            <p className="text-xs text-[#474556] mb-4">Only percentages are shared. Your name, balances, broker names and trade prices stay private.</p>
            <div className="grid grid-cols-4 gap-2 mb-4 text-center">
              {[['Return', snap.ret], ['Win rate', snap.win], ['Profit factor', snap.pf], ['Max DD', snap.dd]].map(([k, v]) => (
                <div key={k} className="bg-slate-50 rounded-xl py-2.5"><p className="text-[10px] text-[#474556]">{k}</p><p className="text-sm font-bold font-mono">{v}</p></div>
              ))}
            </div>
            <label className="text-xs font-semibold text-[#474556] mb-1 block">Share with</label>
            <select value={group} onChange={(e) => setGroup(e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm mb-3">
              {GROUPS.map((g) => <option key={g}>{g}</option>)}
            </select>
            <textarea value={caption} onChange={(e) => setCaption(e.target.value)} rows={3} placeholder="What would you like feedback on?" className="w-full resize-none border border-slate-200 rounded-xl px-3 py-2.5 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-[#5338ec]/30" />
            <button
              onClick={() => {
                setShared((p) => [{ id: `sh${Date.now()}`, group, caption: caption.trim() || 'Sharing my latest snapshot.', ret: snap.ret, win: snap.win, comments: [] }, ...p]);
                setCaption('');
                setOpen(false);
                ctx.toast(`Shared with ${group}`);
              }}
              className="w-full bg-[#5338ec] hover:bg-[#4326d8] text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
            >
              Share snapshot
            </button>
          </div>
        </div>
      )}
    </Card>
  );
};

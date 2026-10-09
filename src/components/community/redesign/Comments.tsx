import React, { useState } from 'react';
import { ChevronDown, Heart } from 'lucide-react';
import { Avatar, PrimaryButton, Verified, BORDER } from './ui';
import { CommentItem, ReplyItem } from './data';
import { ShowToast } from './Toast';

export interface Me { name: string; handle: string; avatar: string }

const Row: React.FC<{ c: ReplyItem; onLike: () => void; liked: boolean; onReply?: () => void; trailing?: React.ReactNode; small?: boolean }> = ({ c, onLike, liked, onReply, trailing, small }) => (
  <div>
    <div className="flex items-center gap-1.5 text-[14px] leading-5">
      <Avatar src={c.avatar} alt={c.name} size={24} />
      <span className="font-semibold text-[#111827]">{c.name}</span><Verified className="!w-5 !h-5" />
      <span className="text-[#6b7280] text-sm truncate">{c.handle} · {c.time}</span>
    </div>
    <p className="text-[16px] leading-5 text-[#111827] mt-2">{c.text}</p>
    <div className="flex items-center gap-[18px] mt-3 pl-2 text-[13px] text-[#374151]">
      <button type="button" onClick={onLike} aria-pressed={liked} className={`flex items-center gap-1 ${liked ? 'text-[#5945F1]' : 'hover:text-[#5945F1]'}`}><Heart className={`w-3.5 h-3.5 ${liked ? 'fill-current' : ''}`} />{c.likes + (liked ? 1 : 0)}</button>
      {onReply && <button type="button" onClick={onReply} className="hover:text-[#5945F1]">Reply</button>}
      <span className="ml-auto">{trailing}</span>
    </div>
  </div>
);

const Composer: React.FC<{ placeholder: string; max: number; multiline?: boolean; onPost: (t: string) => void; autoFocus?: boolean }> = ({ placeholder, max, multiline, onPost, autoFocus }) => {
  const [v, setV] = useState('');
  const submit = () => { const t = v.trim(); if (!t) return; onPost(t); setV(''); };
  const common = { value: v, onChange: (e: React.ChangeEvent<HTMLInputElement & HTMLTextAreaElement>) => setV(e.target.value.slice(0, max)), placeholder, maxLength: max, 'aria-label': placeholder, autoFocus };
  return (
    <div>
      <div className={`flex ${multiline ? 'flex-col items-stretch gap-2' : 'items-center gap-[7px]'}`}>
        {multiline
          ? <textarea {...common} rows={3} className={`w-full border ${BORDER} rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#5945F1]/30 resize-none`} />
          : <div className={`flex-1 min-w-0 flex items-center h-[37px] border ${BORDER} rounded-lg px-3 bg-white focus-within:ring-2 focus-within:ring-[#5945F1]/30`}>
              <input {...common} onKeyDown={(e) => e.key === 'Enter' && submit()} className="flex-1 min-w-0 text-[15px] text-[#111827] placeholder:text-[#cbd5e1] outline-none bg-transparent" />
              <span className="text-sm text-[#6b7280] shrink-0 ml-2">{v.length}/{max}</span>
            </div>}
        {!multiline && <PrimaryButton onClick={submit} className="shrink-0 !h-9 w-[62px] !px-0 !text-[15px] !font-medium">Post</PrimaryButton>}
      </div>
      {multiline && (
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-[11px] text-[#94a3b8]">{v.length}/{max}</span>
          <PrimaryButton onClick={submit}>Post</PrimaryButton>
        </div>
      )}
    </div>
  );
};

export const CommentThread: React.FC<{ comments: CommentItem[]; me: Me; max?: number; multiline?: boolean; onChange: (c: CommentItem[]) => void; onToast: ShowToast }> = ({ comments, me, max = 50, multiline, onChange, onToast }) => {
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [replying, setReplying] = useState<string | null>(null);
  const now = (): Omit<ReplyItem, 'id' | 'text'> => ({ name: me.name, handle: me.handle, time: 'Just now', avatar: me.avatar, likes: 0 });
  const toggleLike = (id: string) => setLiked((l) => ({ ...l, [id]: !l[id] }));

  return (
    <div className="space-y-4">
      <Composer placeholder={multiline ? 'Write a comment...' : 'Comment Here'} max={max} multiline={multiline} onPost={(t) => { const first = !comments.some((c) => c.handle === me.handle); onChange([{ ...now(), id: `c${Date.now()}`, text: t, replies: [] }, ...comments]); onToast(first ? '+5 Credits' : 'Comment Posted', first ? 'First comment posted' : 'Your comment is live', { reward: first }); }} />
      {comments.map((c) => (
        <div key={c.id} className={`border ${BORDER} bg-[#faf9ff] rounded-lg p-3`}>
          <Row c={c} liked={!!liked[c.id]} onLike={() => toggleLike(c.id)} onReply={() => { setReplying(replying === c.id ? null : c.id); setOpen((o) => ({ ...o, [c.id]: true })); }}
            trailing={c.replies.length > 0 && <button type="button" aria-expanded={!!open[c.id]} onClick={() => setOpen((o) => ({ ...o, [c.id]: !o[c.id] }))} className="flex items-center gap-1 hover:text-[#5945F1]">{open[c.id] ? 'Hide' : 'View'} {c.replies.length} {c.replies.length === 1 ? 'reply' : 'replies'}<ChevronDown className={`w-3.5 h-3.5 transition-transform ${open[c.id] ? 'rotate-180' : ''}`} /></button>} />
          {open[c.id] && (
            <div className={`mt-3 border ${BORDER} bg-white rounded-xl p-3 space-y-3`}>
              {c.replies.map((r, i) => (
                <div key={r.id} className={i ? `pt-3 border-t ${BORDER}` : ''}><Row c={r} small liked={!!liked[r.id]} onLike={() => toggleLike(r.id)} /></div>
              ))}
              {replying === c.id && (
                <Composer autoFocus placeholder="Reply here" max={max} onPost={(t) => { onChange(comments.map((x) => (x.id === c.id ? { ...x, replies: [...x.replies, { ...now(), id: `r${Date.now()}`, text: t }] } : x))); setReplying(null); onToast('Reply Posted', 'Your reply is live'); }} />
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

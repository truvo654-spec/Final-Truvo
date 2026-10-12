import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, ArrowUpRight, ArrowDownRight, Brain, ChartNoAxesColumnIncreasing, ChevronLeft, ChevronRight, Image as ImageIcon, Plus, Search, Send, X } from 'lucide-react';
import { Avatar, PrimaryButton, Verified, BORDER } from './ui';
import { Me } from './Comments';
import { ShowToast } from './Toast';

export interface NewPostDraft {
  text: string;
  media: { id: string; url: string; kind: 'image' | 'video'; name?: string }[];
  poll?: { question: string; options: { id: string; text: string; votes: number }[] };
  sentiment?: { symbol: string; price: string; view: SentimentView };
}

export type SentimentView = 'bullish' | 'neutral' | 'bearish';

/** Instruments the sentiment picker can tag, with a demo quote. */
const INSTRUMENTS: { symbol: string; price: string }[] = [
  { symbol: 'EUR/NZD', price: '2.00000' },
  { symbol: 'EUR/USD', price: '1.08520' },
  { symbol: 'GBP/USD', price: '1.26430' },
  { symbol: 'USD/JPY', price: '151.280' },
  { symbol: 'XAU/USD', price: '2890.40' },
  { symbol: 'BTC/USD', price: '67,420.00' },
  { symbol: 'ETH/USD', price: '3,280.00' },
  { symbol: 'S&P 500', price: '5,842.10' },
  { symbol: 'NVDA', price: '128.44' },
];

const MAX_MB = 5;
const MAX_OPTIONS = 6;
const ACCEPT = 'image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm,video/quicktime';

interface Props {
  open: boolean;
  me: Me;
  /** Which section to open focused: the uploader or the poll. */
  intent?: 'text' | 'media' | 'poll';
  onClose: () => void;
  onSubmit: (draft: NewPostDraft) => void;
  onToast: ShowToast;
}

export const CreatePostModal: React.FC<Props> = ({ open, me, intent = 'text', onClose, onSubmit, onToast }) => {
  const [text, setText] = useState('');
  const [media, setMedia] = useState<NewPostDraft['media']>([]);
  const [slide, setSlide] = useState(0);
  const [pollOpen, setPollOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [symbol, setSymbol] = useState<{ symbol: string; price: string } | null>(null);
  const [symbolQuery, setSymbolQuery] = useState('');
  const [view, setView] = useState<SentimentView | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const dialog = useRef<HTMLDivElement>(null);
  const area = useRef<HTMLTextAreaElement>(null);
  const urls = useRef<string[]>([]);

  const reset = () => {
    urls.current.forEach((u) => URL.revokeObjectURL(u));
    urls.current = [];
    setText(''); setMedia([]); setSlide(0); setPollOpen(false); setQuestion(''); setOptions(['', '']);
    setSymbol(null); setSymbolQuery(''); setView(null);
  };

  useEffect(() => {
    if (!open) return;
    setPollOpen(intent === 'poll');
    const t = window.setTimeout(() => (intent === 'media' ? fileRef.current?.click() : area.current?.focus()), 60);
    const prior = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); onClose(); } };
    document.addEventListener('keydown', key);
    return () => { window.clearTimeout(t); document.removeEventListener('keydown', key); document.body.style.overflow = overflow; prior?.focus(); };
  }, [open, intent, onClose]);

  useEffect(() => () => urls.current.forEach((u) => URL.revokeObjectURL(u)), []);
  if (!open) return null;

  const addFiles = (files: FileList | null) => {
    if (!files?.length) return;
    const next: NewPostDraft['media'] = [];
    Array.from(files).forEach((f) => {
      if (f.size > MAX_MB * 1024 * 1024) { onToast('File Too Large', `${f.name} is over ${MAX_MB} MB`); return; }
      if (!/^(image|video)\//.test(f.type)) { onToast('Unsupported File', `${f.name} is not a photo or video`); return; }
      const url = URL.createObjectURL(f);
      urls.current.push(url);
      next.push({ id: `m${Date.now()}_${next.length}`, url, kind: f.type.startsWith('video') ? 'video' : 'image', name: f.name });
    });
    if (!next.length) return;
    setMedia((m) => [...m, ...next]);
    setSlide(media.length);
    onToast(next.length > 1 ? 'Files Added' : next[0].kind === 'video' ? 'Video Added' : 'Photo Added', next.map((n) => n.name).join(', '));
  };

  const removeMedia = (id: string) => {
    setMedia((m) => {
      const left = m.filter((x) => x.id !== id);
      setSlide((s) => Math.max(0, Math.min(s, left.length - 1)));
      return left;
    });
    onToast('Attachment Removed', 'It is no longer on this post');
  };

  const pollReady = pollOpen && question.trim().length > 0 && options.filter((o) => o.trim()).length >= 2;
  const canPost = text.trim().length > 0 || media.length > 0 || pollReady || !!(symbol && view);

  const submit = () => {
    if (!canPost) return;
    onSubmit({
      text: text.trim(),
      media,
      poll: pollReady
        ? { question: question.trim(), options: options.filter((o) => o.trim()).map((o, i) => ({ id: `o${i}`, text: o.trim(), votes: 0 })) }
        : undefined,
      sentiment: symbol && view ? { symbol: symbol.symbol, price: symbol.price, view } : undefined,
    });
    urls.current = []; // ownership passes to the post
    reset();
    onClose();
  };

  const field = `w-full border ${BORDER} rounded-lg bg-white text-[15px] text-[#111827] placeholder:text-[#9ca3af] outline-none focus:ring-2 focus:ring-[#5945F1]/30`;
  const footBtn = 'flex items-center justify-center gap-2 h-[35px] px-4 rounded-lg bg-[#5945F1] text-white text-[15px] font-medium hover:bg-[#4a38d6] transition-colors';
  const counter = (v: string, max: number) => <span className="text-[14px] text-[#9ca3af] shrink-0 tabular-nums pr-3.5">{v.length}/{max}</span>;

  return (
    <div className="fixed inset-0 z-[70] bg-slate-900/40 backdrop-blur-[2px] flex items-start justify-center overflow-y-auto p-4 sm:p-6" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={dialog} role="dialog" aria-modal="true" aria-label="Create Post" className={`w-full max-w-[664px] bg-white border ${BORDER} rounded-2xl shadow-2xl my-auto`}>
        <div className="px-[17px] pt-[17px] pb-4">
          <header className="flex items-start justify-between gap-3">
            <h2 className="text-[19px] leading-5 font-semibold text-[#5945F1]">Create Post</h2>
            <button type="button" aria-label="Close" onClick={onClose} className="-mt-0.5 text-[#111827] hover:text-[#5945F1]"><X className="w-[22px] h-[22px]" strokeWidth={1.8} /></button>
          </header>

          <div className="flex items-center gap-2.5 mt-[18px]">
            <Avatar src={me.avatar} alt={me.name} size={36} />
            <span className="flex items-center gap-1.5 text-[17px] leading-6"><b className="font-bold text-[#111827]">{me.name}</b><Verified /><span className="text-[#6b7280]">{me.handle}</span></span>
          </div>

          <textarea
            ref={area}
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, 2000))}
            placeholder={`What's on your mind, ${me.name}?`}
            aria-label="Post text"
            className={`${field} h-[108px] mt-[16px] px-4 py-3 resize-y block`}
          />

          <input ref={fileRef} type="file" accept={ACCEPT} multiple hidden onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }} />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); addFiles(e.dataTransfer.files); }}
            className={`w-full h-[166px] mt-[17px] border border-dashed ${BORDER} rounded-lg bg-[#fbfbff] hover:bg-[#f3f1ff] transition-colors flex flex-col items-center justify-center`}
          >
            <span className="w-7 h-7 rounded-md bg-[#f0efff] flex items-center justify-center"><ImageIcon className="w-4 h-4 text-[#aba1f8]" /></span>
            <span className="mt-[18px] text-[17px] leading-6 font-semibold text-[#5945F1]">Upload Photo / Video</span>
            <span className="mt-2 text-[14px] leading-[19px] text-[#6b7280] text-center">Recommended 1200 × 630px (16:9)<br />JPG, PNG, MP4 (max {MAX_MB}MB)</span>
          </button>

          {media.length > 0 && (
            <>
              <div className="relative mt-[17px] rounded-lg overflow-hidden bg-black aspect-[631/355]">
                {media[slide]?.kind === 'video'
                  ? <video key={media[slide].id} src={media[slide].url} controls playsInline className="w-full h-full object-cover" />
                  : <img src={media[slide]?.url} alt={media[slide]?.name ?? 'Attachment'} className="w-full h-full object-cover" />}
                <button type="button" aria-label="Remove attachment" onClick={() => removeMedia(media[slide].id)} className="absolute top-1.5 right-1.5 w-[38px] h-[38px] rounded-full bg-white text-[#5945F1] shadow-sm flex items-center justify-center hover:bg-[#EEF0FE]"><X className="w-[18px] h-[18px]" strokeWidth={2} /></button>
              </div>
              <div className="flex items-center justify-center gap-1.5 h-[23px] mt-3">
                <button type="button" aria-label="Previous attachment" disabled={slide === 0} onClick={() => setSlide(slide - 1)} className="p-0.5 text-[#111827] disabled:text-[#9ca3af] disabled:cursor-default"><ChevronLeft className="w-3.5 h-3.5" strokeWidth={2.5} /></button>
                {(media.length > 1 ? media : [media[0], media[0]]).map((m, i) => (
                  <button key={i} type="button" aria-label={`Attachment ${i + 1}`} aria-current={i === slide} disabled={media.length < 2} onClick={() => setSlide(i)} className={`w-2 h-2 rounded-full ${i === slide ? 'bg-[#5945F1]' : 'bg-[#c9c4fb]'}`} />
                ))}
                <button type="button" aria-label="Next attachment" disabled={slide >= media.length - 1} onClick={() => setSlide(slide + 1)} className="p-0.5 text-[#111827] disabled:text-[#9ca3af] disabled:cursor-default"><ChevronRight className="w-3.5 h-3.5" strokeWidth={2.5} /></button>
              </div>
            </>
          )}

          {pollOpen && (
            <section className={`mt-3 border ${BORDER} rounded-lg px-[17px] pt-4 pb-[15px]`} aria-label="Poll">
              <p className="flex items-center gap-2 text-[17px] leading-[18px] font-semibold text-[#5945F1]"><ChartNoAxesColumnIncreasing className="w-[18px] h-[18px]" />Create a Poll</p>
              <div className={`flex items-center h-[37px] mt-[19px] border ${BORDER} rounded-lg bg-white focus-within:ring-2 focus-within:ring-[#5945F1]/30`}>
                <input value={question} onChange={(e) => setQuestion(e.target.value.slice(0, 200))} placeholder="Ask the community something..." aria-label="Poll question" className="flex-1 min-w-0 px-3.5 text-[15px] text-[#111827] placeholder:text-[#9ca3af] outline-none bg-transparent" />
                {counter(question, 200)}
              </div>
              {options.map((o, i) => (
                <div key={i} className={`flex items-center h-[37px] mt-[18px] border ${BORDER} rounded-lg bg-white focus-within:ring-2 focus-within:ring-[#5945F1]/30`}>
                  <input value={o} onChange={(e) => setOptions(options.map((x, j) => (j === i ? e.target.value.slice(0, 100) : x)))} placeholder={`Option ${i + 1}`} aria-label={`Poll option ${i + 1}`} className="flex-1 min-w-0 px-3.5 text-[15px] text-[#111827] placeholder:text-[#9ca3af] outline-none bg-transparent" />
                  {counter(o, 100)}
                  {options.length > 2 && <button type="button" aria-label={`Remove option ${i + 1}`} onClick={() => setOptions(options.filter((_, j) => j !== i))} className="pr-3.5 -ml-2 text-[#9ca3af] hover:text-[#5945F1]"><X className="w-4 h-4" /></button>}
                </div>
              ))}
              {options.length < MAX_OPTIONS && (
                <button type="button" onClick={() => setOptions([...options, ''])} className={`w-full h-[35px] mt-[18px] border ${BORDER} rounded-lg text-[15px] font-medium text-[#5945F1] hover:bg-[#EEF0FE] flex items-center justify-center gap-2`}><Plus className="w-4 h-4" strokeWidth={2.2} />Add Option</button>
              )}
            </section>
          )}

          <section className={`mt-[22px] border ${BORDER} rounded-lg px-[17px] pt-[18px] pb-[15px]`} aria-label="Market or asset sentiment">
            <div className="flex items-center justify-between gap-3">
              <p className="flex items-center gap-2 text-[17px] leading-[18px] font-semibold text-[#5945F1]"><Brain className="w-[18px] h-[18px]" />Market or Asset Sentiment</p>
              <span className="text-[14px] text-[#6b7280]">(Optional)</span>
            </div>

            {symbol ? (
              <div className={`flex items-center gap-2 h-[44px] mt-[18px] border ${BORDER} rounded-lg px-3.5`}>
                <Search className="w-4 h-4 text-[#9ca3af] shrink-0" aria-hidden />
                <span className="text-[16px] font-bold text-[#111827] flex-1 min-w-0 truncate">{symbol.symbol}</span>
                <span className="text-[16px] text-[#111827] tabular-nums">{symbol.price}</span>
                <button type="button" aria-label="Clear instrument" onClick={() => { setSymbol(null); setView(null); setSymbolQuery(''); }} className="text-[#9ca3af] hover:text-[#5945F1]"><X className="w-4 h-4" /></button>
              </div>
            ) : (
              <>
                <div className={`flex items-center gap-2 h-[44px] mt-[18px] border ${BORDER} rounded-lg px-3.5 focus-within:ring-2 focus-within:ring-[#5945F1]/30`}>
                  <Search className="w-4 h-4 text-[#9ca3af] shrink-0" aria-hidden />
                  <input
                    value={symbolQuery}
                    onChange={(e) => setSymbolQuery(e.target.value)}
                    placeholder="Search an instrument, e.g. EUR/NZD"
                    aria-label="Search an instrument"
                    className="flex-1 min-w-0 text-[15px] text-[#111827] placeholder:text-[#9ca3af] outline-none bg-transparent"
                  />
                </div>
                {(() => {
                  const q = symbolQuery.trim().toLowerCase();
                  const hits = q ? INSTRUMENTS.filter((i) => i.symbol.toLowerCase().includes(q)) : [];
                  if (!q) {
                    return <p className="text-[13px] leading-relaxed text-[#6b7280] mt-2.5">Pick an instrument to say where you think it goes. Leave it blank if the post is not about one.</p>;
                  }
                  if (!hits.length) {
                    return <p className="text-[13px] leading-relaxed text-[#6b7280] mt-2.5">Nothing matches “{symbolQuery.trim()}”. Try a pair like EUR/USD, or a symbol like XAU/USD.</p>;
                  }
                  return (
                    <ul className={`mt-2 border ${BORDER} rounded-lg divide-y divide-[#ece9ff] overflow-hidden`}>
                      {hits.slice(0, 5).map((i) => (
                        <li key={i.symbol}>
                          <button type="button" onClick={() => { setSymbol(i); setSymbolQuery(''); }} className="w-full flex items-center justify-between gap-3 px-3.5 py-2.5 text-left hover:bg-[#faf9ff]">
                            <span className="text-[15px] font-semibold text-[#111827]">{i.symbol}</span>
                            <span className="text-[14px] text-[#6b7280] tabular-nums">{i.price}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  );
                })()}
              </>
            )}

            <div className="grid grid-cols-3 gap-3 mt-3.5">
              {([
                { id: 'bullish' as const, label: 'Bullish', Icon: ArrowUpRight, base: 'bg-[#e5f586] text-[#4d5d00]', on: 'ring-2 ring-[#9cb400]' },
                { id: 'neutral' as const, label: 'Neutral', Icon: ArrowRight, base: 'bg-[#f3f4f6] text-[#111827]', on: 'ring-2 ring-[#9ca3af]' },
                { id: 'bearish' as const, label: 'Bearish', Icon: ArrowDownRight, base: 'bg-[#ece9ff] text-[#5945F1]', on: 'ring-2 ring-[#5945F1]' },
              ]).map(({ id, label, Icon, base, on }) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={view === id}
                  disabled={!symbol}
                  onClick={() => { setView(view === id ? null : id); if (view !== id && symbol) onToast('Sentiment Set', `${label} on ${symbol.symbol}`); }}
                  className={`h-[42px] rounded-lg text-[15px] font-medium flex items-center justify-center gap-2 transition-all ${base} ${view === id ? on : ''} ${symbol ? 'hover:brightness-95' : 'opacity-50 cursor-not-allowed'}`}
                >
                  <Icon className="w-4 h-4" aria-hidden />{label}
                </button>
              ))}
            </div>
            {!symbol && <p className="text-[12px] text-[#9ca3af] mt-2">Choose an instrument first.</p>}
          </section>
        </div>

        <footer className={`flex items-center gap-[9px] border-t ${BORDER} px-[17px] py-[17px]`}>
          <button type="button" onClick={() => fileRef.current?.click()} className={footBtn}><ImageIcon className="w-4 h-4" />Photo / Video</button>
          <button type="button" aria-pressed={pollOpen} onClick={() => { setPollOpen((v) => !v); if (!pollOpen) onToast('Poll Added', 'Write a question and two options'); }} className={footBtn}><ChartNoAxesColumnIncreasing className="w-4 h-4" />Poll</button>
          <button type="button" onClick={submit} disabled={!canPost} className={`${footBtn} ml-auto disabled:opacity-40`}><Send className="w-4 h-4" />Post</button>
        </footer>
      </div>
    </div>
  );
};

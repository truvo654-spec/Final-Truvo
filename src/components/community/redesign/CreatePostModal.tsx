import React, { useEffect, useRef, useState } from 'react';
import { ChartNoAxesColumnIncreasing, ChevronLeft, ChevronRight, Image as ImageIcon, Plus, Send, X } from 'lucide-react';
import { Avatar, PrimaryButton, Verified, BORDER } from './ui';
import { Me } from './Comments';
import { ShowToast } from './Toast';

export interface NewPostDraft {
  text: string;
  media: { id: string; url: string; kind: 'image' | 'video'; name?: string }[];
  poll?: { question: string; options: { id: string; text: string; votes: number }[] };
}

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
  const fileRef = useRef<HTMLInputElement>(null);
  const dialog = useRef<HTMLDivElement>(null);
  const area = useRef<HTMLTextAreaElement>(null);
  const urls = useRef<string[]>([]);

  const reset = () => {
    urls.current.forEach((u) => URL.revokeObjectURL(u));
    urls.current = [];
    setText(''); setMedia([]); setSlide(0); setPollOpen(false); setQuestion(''); setOptions(['', '']);
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
  const canPost = text.trim().length > 0 || media.length > 0 || pollReady;

  const submit = () => {
    if (!canPost) return;
    onSubmit({
      text: text.trim(),
      media,
      poll: pollReady
        ? { question: question.trim(), options: options.filter((o) => o.trim()).map((o, i) => ({ id: `o${i}`, text: o.trim(), votes: 0 })) }
        : undefined,
    });
    urls.current = []; // ownership passes to the post
    reset();
    onClose();
  };

  const field = `w-full border ${BORDER} rounded-lg px-3.5 py-2.5 text-[15px] text-[#111827] placeholder:text-[#9ca3af] outline-none focus:ring-2 focus:ring-[#5945F1]/30`;
  const footBtn = (on: boolean) => `flex items-center gap-2 h-9 px-4 rounded-lg text-[14px] font-medium transition-colors ${on ? 'bg-[#5945F1] text-white' : `border ${BORDER} text-[#5945F1] hover:bg-[#EEF0FE]`}`;
  const counter = (v: string, max: number) => <span className="text-[13px] text-[#9ca3af] shrink-0 tabular-nums">{v.length}/{max}</span>;

  return (
    <div className="fixed inset-0 z-[70] bg-slate-900/40 backdrop-blur-[2px] flex items-start justify-center overflow-y-auto p-4 sm:p-6" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={dialog} role="dialog" aria-modal="true" aria-label="Create Post" className={`w-full max-w-[674px] bg-white border ${BORDER} rounded-2xl shadow-2xl my-auto`}>
        <header className="flex items-start justify-between gap-3 px-5 pt-5 pb-3">
          <h2 className="text-[20px] leading-7 font-semibold text-[#5945F1]">Create Post</h2>
          <button type="button" aria-label="Close" onClick={onClose} className="text-[#111827] hover:text-[#5945F1]"><X className="w-5 h-5" /></button>
        </header>

        <div className="px-5 pb-5 space-y-4">
          <div className="flex items-center gap-2.5">
            <Avatar src={me.avatar} alt={me.name} size={34} />
            <span className="flex items-center gap-1.5 text-[16px]"><b className="text-[#111827]">{me.name}</b><Verified /><span className="text-[#6b7280]">{me.handle}</span></span>
          </div>

          <textarea
            ref={area}
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, 2000))}
            rows={4}
            placeholder={`What's on your mind, ${me.name}?`}
            aria-label="Post text"
            className={`${field} resize-y min-h-[104px]`}
          />

          <input ref={fileRef} type="file" accept={ACCEPT} multiple hidden onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }} />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); addFiles(e.dataTransfer.files); }}
            className={`w-full border border-dashed ${BORDER} rounded-lg bg-[#faf9ff] hover:bg-[#f3f1ff] transition-colors py-8 flex flex-col items-center gap-2`}
          >
            <span className="w-9 h-9 rounded-lg bg-[#EEF0FE] flex items-center justify-center"><ImageIcon className="w-[18px] h-[18px] text-[#5945F1]" /></span>
            <span className="text-[15px] font-semibold text-[#5945F1]">Upload Photo / Video</span>
            <span className="text-[13px] text-[#6b7280] text-center leading-5">Recommended 1200 × 630px (16:9)<br />JPG, PNG, MP4 (max {MAX_MB}MB)</span>
          </button>

          {media.length > 0 && (
            <div>
              <div className="relative rounded-lg overflow-hidden bg-black">
                {media[slide]?.kind === 'video'
                  ? <video key={media[slide].id} src={media[slide].url} controls playsInline className="w-full max-h-[340px] object-contain bg-black" />
                  : <img src={media[slide]?.url} alt={media[slide]?.name ?? 'Attachment'} className="w-full max-h-[340px] object-contain bg-black" />}
                <button type="button" aria-label="Remove attachment" onClick={() => removeMedia(media[slide].id)} className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white text-[#5945F1] shadow flex items-center justify-center hover:bg-[#EEF0FE]"><X className="w-4 h-4" /></button>
              </div>
              {media.length > 1 && (
                <div className="flex items-center justify-center gap-1.5 mt-2.5">
                  <button type="button" aria-label="Previous attachment" disabled={slide === 0} onClick={() => setSlide(slide - 1)} className="p-0.5 text-[#111827] disabled:text-[#9ca3af]"><ChevronLeft className="w-3.5 h-3.5" strokeWidth={2.5} /></button>
                  {media.map((m, i) => <button key={m.id} type="button" aria-label={`Attachment ${i + 1}`} aria-current={i === slide} onClick={() => setSlide(i)} className={`w-2 h-2 rounded-full ${i === slide ? 'bg-[#5945F1]' : 'bg-[#c9c4fb]'}`} />)}
                  <button type="button" aria-label="Next attachment" disabled={slide === media.length - 1} onClick={() => setSlide(slide + 1)} className="p-0.5 text-[#111827] disabled:text-[#9ca3af]"><ChevronRight className="w-3.5 h-3.5" strokeWidth={2.5} /></button>
                </div>
              )}
            </div>
          )}

          {pollOpen && (
            <section className={`border ${BORDER} rounded-lg p-4 space-y-3`} aria-label="Poll">
              <p className="flex items-center gap-2 text-[15px] font-semibold text-[#5945F1]"><ChartNoAxesColumnIncreasing className="w-4 h-4" />Add an Interest</p>
              <div className={`flex items-center gap-2 border ${BORDER} rounded-lg px-3.5 bg-white focus-within:ring-2 focus-within:ring-[#5945F1]/30`}>
                <input value={question} onChange={(e) => setQuestion(e.target.value.slice(0, 200))} placeholder="Poll Question" aria-label="Poll question" className="flex-1 min-w-0 py-2.5 text-[15px] outline-none bg-transparent" />
                {counter(question, 200)}
              </div>
              {options.map((o, i) => (
                <div key={i} className={`flex items-center gap-2 border ${BORDER} rounded-lg px-3.5 bg-white focus-within:ring-2 focus-within:ring-[#5945F1]/30`}>
                  <input value={o} onChange={(e) => setOptions(options.map((x, j) => (j === i ? e.target.value.slice(0, 100) : x)))} placeholder={`Option ${i + 1}`} aria-label={`Poll option ${i + 1}`} className="flex-1 min-w-0 py-2.5 text-[15px] outline-none bg-transparent" />
                  {counter(o, 100)}
                  {options.length > 2 && <button type="button" aria-label={`Remove option ${i + 1}`} onClick={() => setOptions(options.filter((_, j) => j !== i))} className="text-[#9ca3af] hover:text-[#5945F1]"><X className="w-4 h-4" /></button>}
                </div>
              ))}
              {options.length < MAX_OPTIONS && (
                <button type="button" onClick={() => setOptions([...options, ''])} className={`w-full border ${BORDER} rounded-lg py-2.5 text-[15px] font-medium text-[#5945F1] hover:bg-[#EEF0FE] flex items-center justify-center gap-2`}><Plus className="w-4 h-4" />Add Option</button>
              )}
            </section>
          )}
        </div>

        <footer className={`flex flex-wrap items-center gap-2 border-t ${BORDER} px-5 py-4`}>
          <button type="button" onClick={() => fileRef.current?.click()} className={footBtn(false)}><ImageIcon className="w-4 h-4" />Photo / Video</button>
          <button type="button" aria-pressed={pollOpen} onClick={() => { setPollOpen((v) => !v); if (!pollOpen) onToast('Poll Added', 'Write a question and two options'); }} className={footBtn(pollOpen)}><ChartNoAxesColumnIncreasing className="w-4 h-4" />Poll</button>
          <PrimaryButton onClick={submit} disabled={!canPost} className="ml-auto flex items-center gap-2 !h-9 !px-4 !text-[14px] !font-medium"><Send className="w-4 h-4" />Post</PrimaryButton>
        </footer>
      </div>
    </div>
  );
};

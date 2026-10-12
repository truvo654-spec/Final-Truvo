import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft, Bold, ChevronDown, Eye, FileText, Image as ImageIcon, Italic, Link2, List, ListOrdered, Send, Underline, Video, X,
} from 'lucide-react';
import { ARTICLE_FILTERS, Article, ArticleCategory, CATEGORY_STYLE, DEFAULT_INTERESTS } from './data';
import { Avatar, Verified, BORDER } from './ui';
import { Me } from './Comments';
import { ShowToast } from './Toast';

const TOPICS = ARTICLE_FILTERS.filter((f) => f.id !== 'all').map((f) => f.label) as ArticleCategory[];
const MAX_DECK = 150;

export interface ArticleDraft {
  headline: string;
  deck: string;
  topic: ArticleCategory | '';
  tags: string[];
  cover?: string;
  body: string;
}

const EMPTY: ArticleDraft = { headline: '', deck: '', topic: '', tags: [], body: '' };

interface Props {
  me: Me;
  /** An existing draft or article to carry on with. */
  initial?: Partial<ArticleDraft>;
  onBack: () => void;
  onPublish: (draft: ArticleDraft) => void;
  onSaveDraft: (draft: ArticleDraft) => void;
  onToast: ShowToast;
}

const StepCard: React.FC<{ step: number; title: string; children: React.ReactNode }> = ({ step, title, children }) => (
  <section className={`bg-white border ${BORDER} rounded-2xl p-5 sm:p-6`} aria-label={title}>
    <div className="flex items-center gap-3 mb-5">
      <span className="w-8 h-8 rounded-full bg-[#5945F1] text-white text-[15px] font-semibold flex items-center justify-center shrink-0">{step}</span>
      <h2 className="text-[17px] font-semibold text-[#111827]">{title}</h2>
    </div>
    {children}
  </section>
);

const ErrorText: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-[13px] text-[#ef4444] text-right mt-1.5">{children}</p>
);

/** The article editor: three steps, a live word count, preview and publish. */
export const WriteArticle: React.FC<Props> = ({ me, initial, onBack, onPublish, onSaveDraft, onToast }) => {
  const [draft, setDraft] = useState<ArticleDraft>({ ...EMPTY, ...initial });
  const [touched, setTouched] = useState(false);
  const [preview, setPreview] = useState(false);
  const [tagDraft, setTagDraft] = useState('');
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const coverUrl = useRef<string | null>(null);

  useEffect(() => () => { if (coverUrl.current) URL.revokeObjectURL(coverUrl.current); }, []);
  useEffect(() => {
    if (!draft.headline && !draft.body) return;
    setSaved(false);
    const t = window.setTimeout(() => setSaved(true), 900);
    return () => window.clearTimeout(t);
  }, [draft.headline, draft.body, draft.deck]);

  const set = <K extends keyof ArticleDraft>(k: K, v: ArticleDraft[K]) => setDraft((d) => ({ ...d, [k]: v }));
  const words = useMemo(() => draft.body.trim().split(/\s+/).filter(Boolean).length, [draft.body]);

  const errors = {
    headline: !draft.headline.trim() ? 'A headline is required.' : '',
    deck: draft.deck.length > MAX_DECK ? `Keep the deck under ${MAX_DECK} characters.` : '',
    topic: !draft.topic ? 'Choose a related topic.' : '',
    cover: !draft.cover ? 'A cover image is required.' : '',
    body: words < 40 ? 'Write at least 40 words before publishing.' : '',
  };
  const show = (k: keyof typeof errors) => touched && !!errors[k];
  const ring = (bad: boolean) => (bad ? 'border-[#ef4444] focus:ring-[#ef4444]/25' : `${BORDER} focus:ring-[#5945F1]/30`);

  const pickCover = (files: FileList | null) => {
    const f = files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) return onToast('File Too Large', `${f.name} is over 5 MB`);
    if (!f.type.startsWith('image/')) return onToast('Unsupported File', 'Use a JPG or PNG');
    if (coverUrl.current) URL.revokeObjectURL(coverUrl.current);
    coverUrl.current = URL.createObjectURL(f);
    set('cover', coverUrl.current);
    onToast('Cover Added', f.name);
  };

  const publish = () => {
    setTouched(true);
    const bad = Object.values(errors).some(Boolean);
    if (bad) {
      onToast('Check the Form', 'Some fields still need filling in');
      document.querySelector('[data-bad="true"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    onPublish(draft);
  };

  const addTag = () => {
    const t = tagDraft.trim().replace(/^#?/, '#');
    if (t.length < 2) return;
    if (draft.tags.includes(t)) { onToast('Already Added', `${t} is on this article`); setTagDraft(''); return; }
    set('tags', [...draft.tags, t]);
    setTagDraft('');
    onToast('Tag Added', t);
  };

  if (preview) {
    const a = {
      category: (draft.topic || 'Market News') as ArticleCategory,
      title: draft.headline || 'Untitled article',
      excerpt: draft.deck,
    };
    return (
      <div className="max-w-[1000px] mx-auto">
        <button type="button" onClick={() => setPreview(false)} className="flex items-center gap-2.5 text-[15px] text-[#111827] hover:text-[#5945F1] mb-6">
          <ArrowLeft className="w-4 h-4" />Back to editing
        </button>
        <article className="max-w-[664px] mx-auto">
          <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${CATEGORY_STYLE[a.category]}`}>{a.category}</span>
          <h1 className="font-display text-3xl sm:text-[34px] leading-tight text-[#0b1c30] mt-3">{a.title}</h1>
          {a.excerpt && <p className="text-[15px] text-[#64748b] leading-relaxed mt-3">{a.excerpt}</p>}
          <div className="flex items-center gap-2 mt-5 text-sm">
            <Avatar src={me.avatar} alt={me.name} size={32} />
            <span className="font-semibold text-[#0b1c30]">{me.name}</span><Verified />
            <span className="text-[#64748b] text-[13px]">{me.handle} · {Math.max(1, Math.round(words / 200))} min read</span>
          </div>
          <div className="mt-6 rounded-xl overflow-hidden bg-[#e4e9ef] aspect-[16/9] flex items-center justify-center">
            {draft.cover ? <img src={draft.cover} alt="" className="w-full h-full object-cover" /> : <ImageIcon className="w-24 h-24 text-[#c6cfda]" aria-hidden />}
          </div>
          <div className="mt-6 space-y-4">
            {(draft.body || 'Nothing written yet.').split(/\n{2,}/).map((p, i) => (
              <p key={i} className="text-[15px] leading-relaxed text-[#0b1c30] whitespace-pre-wrap">{p}</p>
            ))}
          </div>
          {draft.tags.length > 0 && (
            <p className="flex flex-wrap gap-2 mt-6 text-[13px] text-[#5945F1]">{draft.tags.map((t) => <span key={t}>{t}</span>)}</p>
          )}
        </article>
      </div>
    );
  }

  const tool = 'w-8 h-8 rounded-md flex items-center justify-center text-[#5945F1] hover:bg-[#EEF0FE] transition-colors';

  return (
    <div className="max-w-[664px] mx-auto">
      <button type="button" onClick={onBack} className="flex items-center gap-2.5 text-[15px] text-[#111827] hover:text-[#5945F1] mb-5">
        <ArrowLeft className="w-4 h-4" />Back to Articles
      </button>
      <h1 className="font-display text-[34px] sm:text-[40px] font-bold leading-tight bg-gradient-to-r from-[#5945F1] to-[#c026d3] bg-clip-text text-transparent">Write an Article</h1>
      <p className="text-[15px] text-[#474556] mt-1.5 mb-6">Share your trading insights with the community. Keep it clear and back it up.</p>

      <div className="space-y-5">
        <StepCard step={1} title="Basic information">
          <div data-bad={show('headline')}>
            <input
              value={draft.headline}
              onChange={(e) => set('headline', e.target.value)}
              placeholder="Add a compelling headline..."
              aria-label="Headline"
              aria-invalid={show('headline')}
              className={`w-full h-[46px] border rounded-lg px-4 text-[17px] font-bold text-[#111827] placeholder:text-[#9ca3af] outline-none focus:ring-2 ${ring(show('headline'))}`}
            />
            {show('headline') && <ErrorText>{errors.headline}</ErrorText>}
          </div>

          <div className="mt-4">
            <div className={`flex items-center h-[42px] border rounded-lg px-4 bg-white focus-within:ring-2 ${ring(show('deck'))}`}>
              <input
                value={draft.deck}
                onChange={(e) => set('deck', e.target.value.slice(0, MAX_DECK + 1))}
                placeholder="Add a short deck or subtitle"
                aria-label="Deck or subtitle"
                className="flex-1 min-w-0 text-[15px] text-[#111827] placeholder:text-[#9ca3af] outline-none bg-transparent"
              />
              <span className="text-[14px] text-[#9ca3af] tabular-nums shrink-0">{draft.deck.length}/{MAX_DECK}</span>
            </div>
            {show('deck') && <ErrorText>{errors.deck}</ErrorText>}
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mt-5">
            <div data-bad={show('topic')}>
              <label htmlFor="wa-topic" className="block text-[14px] text-[#111827] mb-1.5">Select Related Topics</label>
              <select
                id="wa-topic"
                value={draft.topic}
                onChange={(e) => set('topic', e.target.value as ArticleCategory)}
                className={`w-full h-[42px] border rounded-lg px-3.5 bg-white text-[15px] text-[#111827] outline-none focus:ring-2 ${ring(show('topic'))}`}
              >
                <option value="">Select a Topic</option>
                {TOPICS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              {show('topic') && <ErrorText>{errors.topic}</ErrorText>}
            </div>

            <div>
              <label htmlFor="wa-tags" className="block text-[14px] text-[#111827] mb-1.5">Create Tags</label>
              <div className={`flex items-center h-[42px] border ${BORDER} rounded-lg px-3.5 bg-white focus-within:ring-2 focus-within:ring-[#5945F1]/30`}>
                <input
                  id="wa-tags"
                  list="wa-tag-options"
                  value={tagDraft}
                  onChange={(e) => setTagDraft(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                  onBlur={addTag}
                  placeholder="e.g. Bitcoin, Trading Strategy..."
                  className="flex-1 min-w-0 text-[15px] text-[#111827] placeholder:text-[#9ca3af] outline-none bg-transparent"
                />
                <ChevronDown className="w-4 h-4 text-[#6b7280] shrink-0" aria-hidden />
              </div>
              <datalist id="wa-tag-options">{DEFAULT_INTERESTS.map((t) => <option key={t} value={t} />)}</datalist>
              {draft.tags.length > 0 && (
                <p className="flex flex-wrap gap-2 mt-2">
                  {draft.tags.map((t) => (
                    <span key={t} className="inline-flex items-center gap-1 rounded-md bg-[#EEF0FE] text-[#5945F1] px-2 py-1 text-[12px] font-semibold">
                      {t}
                      <button type="button" aria-label={`Remove ${t}`} onClick={() => set('tags', draft.tags.filter((x) => x !== t))}><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </p>
              )}
            </div>
          </div>
        </StepCard>

        <StepCard step={2} title="Cover Image">
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => { pickCover(e.target.files); e.target.value = ''; }} />
          <div data-bad={show('cover')}>
            {draft.cover ? (
              <div className="relative rounded-lg overflow-hidden aspect-[16/9] bg-black">
                <img src={draft.cover} alt="Cover" className="w-full h-full object-cover" />
                <button type="button" aria-label="Remove cover" onClick={() => { set('cover', undefined); onToast('Cover Removed', 'Pick another one'); }} className="absolute top-2 right-2 w-9 h-9 rounded-full bg-white text-[#5945F1] shadow flex items-center justify-center hover:bg-[#EEF0FE]"><X className="w-4 h-4" /></button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); pickCover(e.dataTransfer.files); }}
                className={`w-full h-[166px] border border-dashed rounded-lg bg-[#fbfbff] hover:bg-[#f3f1ff] transition-colors flex flex-col items-center justify-center ${show('cover') ? 'border-[#ef4444]' : BORDER}`}
              >
                <span className="w-7 h-7 rounded-md bg-[#f0efff] flex items-center justify-center"><ImageIcon className="w-4 h-4 text-[#aba1f8]" /></span>
                <span className="mt-[18px] text-[17px] leading-6 font-semibold text-[#5945F1]">Upload a Cover Image</span>
                <span className="mt-2 text-[14px] leading-[19px] text-[#6b7280] text-center">Recommended 1200 × 630px (16:9)<br />JPG, PNG (max 5MB)</span>
              </button>
            )}
            {show('cover') && <ErrorText>{errors.cover}</ErrorText>}
          </div>
        </StepCard>

        <StepCard step={3} title="Article Content">
          <div data-bad={show('body')}>
            <div className={`border rounded-lg overflow-hidden ${show('body') ? 'border-[#ef4444]' : BORDER}`}>
              <div className={`flex items-center gap-1 border-b ${BORDER} px-2.5 py-2`}>
                <span className="flex items-center gap-1 text-[14px] text-[#111827] pr-2.5">Paragraph <ChevronDown className="w-4 h-4" aria-hidden /></span>
                <span className={`w-px h-5 bg-[#e5e1fb] mr-1`} aria-hidden />
                {[
                  { Icon: Bold, label: 'Bold', wrap: '**' },
                  { Icon: Italic, label: 'Italic', wrap: '_' },
                  { Icon: Underline, label: 'Underline', wrap: '__' },
                ].map(({ Icon, label, wrap }) => (
                  <button key={label} type="button" aria-label={label} onClick={() => set('body', `${draft.body}${wrap}text${wrap}`)} className={tool}><Icon className="w-[18px] h-[18px]" /></button>
                ))}
                <button type="button" aria-label="Bullet list" onClick={() => set('body', `${draft.body}\n• `)} className={tool}><List className="w-[18px] h-[18px]" /></button>
                <button type="button" aria-label="Numbered list" onClick={() => set('body', `${draft.body}\n1. `)} className={tool}><ListOrdered className="w-[18px] h-[18px]" /></button>
                <button type="button" aria-label="Link" onClick={() => set('body', `${draft.body}[text](https://)`)} className={tool}><Link2 className="w-[18px] h-[18px]" /></button>
                <button type="button" aria-label="Insert image" onClick={() => onToast('Not Yet', 'Inline images come with the editor upgrade')} className={tool}><ImageIcon className="w-[18px] h-[18px]" /></button>
                <button type="button" aria-label="Insert video" onClick={() => onToast('Not Yet', 'Inline video comes with the editor upgrade')} className={tool}><Video className="w-[18px] h-[18px]" /></button>
              </div>
              <textarea
                value={draft.body}
                onChange={(e) => set('body', e.target.value)}
                rows={6}
                placeholder={'Tell your story...\nUse short paragraphs, add evidence, charts or images, and give a clear takeaway for the community.'}
                aria-label="Article content"
                className="w-full px-4 py-3 text-[15px] leading-relaxed text-[#111827] placeholder:text-[#9ca3af] outline-none resize-y min-h-[150px]"
              />
              <div className="flex items-center justify-between px-4 py-2.5 text-[13px] text-[#6b7280]">
                <span>{words} {words === 1 ? 'Word' : 'Words'}</span>
                <span className="flex items-center gap-1.5">
                  <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${saved ? 'border-[#5945F1] text-[#5945F1]' : 'border-[#cbd5e1] text-[#cbd5e1]'}`} aria-hidden>✓</span>
                  {saved ? 'Draft autosaved' : 'Not saved yet'}
                </span>
              </div>
            </div>
            {show('body') && <ErrorText>{errors.body}</ErrorText>}
          </div>
        </StepCard>

        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={() => setPreview(true)} className={`flex items-center gap-2 h-10 px-4 rounded-lg border ${BORDER} text-[15px] font-medium text-[#5945F1] hover:bg-[#EEF0FE] transition-colors`}>
            <Eye className="w-4 h-4" />Preview
          </button>
          <span className="flex-1" />
          <button type="button" onClick={() => { onSaveDraft(draft); setSaved(true); }} className={`flex items-center gap-2 h-10 px-4 rounded-lg border ${BORDER} text-[15px] font-medium text-[#111827] hover:bg-[#EEF0FE] transition-colors`}>
            <FileText className="w-4 h-4 text-[#5945F1]" />Save as Draft
          </button>
          <button type="button" onClick={publish} className="flex items-center gap-2 h-10 px-5 rounded-lg bg-gradient-to-r from-[#5945F1] to-[#c026d3] hover:brightness-110 text-white text-[15px] font-semibold transition">
            <Send className="w-4 h-4" />Publish Article
          </button>
        </div>
      </div>
    </div>
  );
};

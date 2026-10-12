import React, { useEffect, useRef, useState } from 'react';
import { Code2, Facebook, Linkedin, Send, X } from 'lucide-react';
import { BORDER } from './ui';
import { ShowToast } from './Toast';

const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M12.04 2c-5.46 0-9.9 4.44-9.9 9.9 0 1.75.46 3.45 1.32 4.95L2 22l5.3-1.39a9.86 9.86 0 0 0 4.74 1.21h.01c5.46 0 9.9-4.44 9.9-9.9 0-2.64-1.03-5.13-2.9-7A9.82 9.82 0 0 0 12.04 2Zm0 18.02h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.1.81.83-3.02-.2-.31a8.19 8.19 0 0 1-1.26-4.37c0-4.54 3.7-8.23 8.23-8.23 2.2 0 4.26.86 5.82 2.41a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.21-8.24 8.21Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.25-.64.8-.78.97-.15.16-.29.18-.54.06-.25-.13-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.43.13-.15.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43h-.47c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.21.89 2.39 1.01 2.55.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.47-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.1-.23-.16-.48-.29Z" />
  </svg>
);

interface Props {
  open: boolean;
  url: string;
  title: string;
  onClose: () => void;
  onToast: ShowToast;
}

/** The share sheet for an article or a post: the networks people actually use, plus the raw link. */
export const SharePanel: React.FC<Props> = ({ open, url, title, onClose, onToast }) => {
  const [copied, setCopied] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    setCopied(false);
    closeRef.current?.focus();
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); onClose(); } };
    document.addEventListener('keydown', key);
    return () => document.removeEventListener('keydown', key);
  }, [open, onClose]);
  if (!open) return null;

  const copy = async (text: string, what: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      onToast('Link Copied', what);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      onToast('Could Not Copy', 'Copy the link from the field instead');
    }
  };
  const open_ = (href: string, where: string) => {
    window.open(href, '_blank', 'noopener,noreferrer,width=640,height=560');
    onToast('Shared', `Opened ${where}`);
  };

  const e = encodeURIComponent;
  const targets = [
    { id: 'embed', label: 'Embed', ring: 'bg-[#f0efff] text-[#5945F1]', node: <Code2 className="w-6 h-6" />, run: () => copy(`<iframe src="${url}" width="640" height="420" title="${title}" frameborder="0"></iframe>`, 'Embed code copied') },
    { id: 'facebook', label: 'Facebook', ring: 'bg-[#1877F2] text-white', node: <Facebook className="w-7 h-7 fill-current" />, run: () => open_(`https://www.facebook.com/sharer/sharer.php?u=${e(url)}`, 'Facebook') },
    { id: 'telegram', label: 'Telegram', ring: 'bg-[#26a4e3] text-white', node: <Send className="w-6 h-6" />, run: () => open_(`https://t.me/share/url?url=${e(url)}&text=${e(title)}`, 'Telegram') },
    { id: 'linkedin', label: 'LinkedIn', ring: 'bg-[#0a66c2] text-white !rounded-lg', node: <Linkedin className="w-6 h-6 fill-current" />, run: () => open_(`https://www.linkedin.com/sharing/share-offsite/?url=${e(url)}`, 'LinkedIn') },
    { id: 'whatsapp', label: 'WhatsApp', ring: 'bg-white text-[#25D366]', node: <WhatsAppIcon className="w-[46px] h-[46px]" />, run: () => open_(`https://wa.me/?text=${e(`${title} ${url}`)}`, 'WhatsApp') },
  ];

  return (
    <div className="fixed inset-0 z-[80] bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center p-4" onMouseDown={(ev) => ev.target === ev.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-label="Share" className={`w-full max-w-[486px] bg-white border ${BORDER} rounded-2xl shadow-2xl p-5`}>
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-[17px] font-semibold text-[#111827]">Share</h2>
          <button ref={closeRef} type="button" aria-label="Close" onClick={onClose} className="text-[#6b7280] hover:text-[#111827]"><X className="w-[18px] h-[18px]" /></button>
        </div>

        <ul className="flex items-start justify-between gap-2 mt-5">
          {targets.map((t) => (
            <li key={t.id} className="flex-1">
              <button type="button" onClick={t.run} className="w-full flex flex-col items-center gap-2 group">
                <span className={`w-[58px] h-[58px] rounded-full flex items-center justify-center transition-transform group-hover:scale-105 ${t.ring}`}>{t.node}</span>
                <span className="text-[12px] text-[#6b7280]">{t.label}</span>
              </button>
            </li>
          ))}
        </ul>

        <div className={`flex items-center gap-2 mt-5 border ${BORDER} rounded-lg pl-3.5 pr-1.5 py-1.5`}>
          <input readOnly value={url} aria-label="Link to share" onFocus={(ev) => ev.currentTarget.select()} className="flex-1 min-w-0 text-[14px] text-[#111827] outline-none bg-transparent" />
          <button type="button" onClick={() => copy(url, title)} className="shrink-0 h-9 px-4 rounded-lg bg-[#5945F1] hover:bg-[#4a38d6] text-white text-[14px] font-semibold transition-colors">
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>
    </div>
  );
};

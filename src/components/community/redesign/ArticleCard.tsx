import React from 'react';
import { Bookmark, Eye, Heart, MessageCircle, Share2 } from 'lucide-react';
import { Avatar, Card, Verified } from './ui';
import { Article, CATEGORY_STYLE } from './data';
import { MoreMenu } from './PostCard';

interface Props {
  article: Article;
  signedIn: boolean;
  onOpen: () => void;
  onToggle: (key: 'liked' | 'saved') => void;
  onMenu: (action: 'edit' | 'draft' | 'delete') => void;
  onShare: () => void;
}

export const ArticleCard: React.FC<Props> = ({ article: a, signedIn, onOpen, onToggle, onMenu, onShare }) => (
  <Card className="overflow-hidden flex flex-col">
    <div className="relative">
      <button type="button" onClick={onOpen} aria-label={`Read: ${a.title}`} className="block w-full aspect-[16/9] bg-slate-100"><img src={a.cover} alt="" className="w-full h-full object-cover" loading="lazy" /></button>
      {signedIn && a.own && (
        <div className="absolute top-2 right-2"><MoreMenu label="Article options" items={[{ label: 'Edit', onClick: () => onMenu('edit') }, { label: 'Move to Drafts', onClick: () => onMenu('draft') }, { label: 'Delete', onClick: () => onMenu('delete') }]} /></div>
      )}
    </div>
    <div className="p-4 flex-1 flex flex-col">
      <span className={`self-start rounded-full px-3 py-1 text-xs font-medium ${CATEGORY_STYLE[a.category]}`}>{a.category}</span>
      <button type="button" onClick={onOpen} className="text-left mt-3"><h3 className="text-[17px] font-bold text-[#0b1c30] leading-snug hover:text-[#5945F1] transition-colors">{a.title}</h3></button>
      <p className="text-xs text-[#64748b] leading-relaxed mt-2 line-clamp-2">{a.excerpt}</p>
      <div className="flex items-center gap-2 mt-4 text-xs">
        <Avatar src={a.avatar} alt={a.author} size={24} /><span className="font-bold text-[#0b1c30]">{a.author}</span><Verified className="!w-3.5 !h-3.5" /><span className="text-[#64748b] truncate">{a.handle} · {a.date}</span>
      </div>
      <div className={`flex items-center gap-4 mt-3 pt-3 border-t border-[#ece9ff] text-xs text-[#0b1c30]`}>
        <button type="button" aria-pressed={!!a.liked} aria-label="Like" onClick={() => onToggle('liked')} className={a.liked ? 'text-[#5945F1]' : 'hover:text-[#5945F1]'}><Heart className={`w-4 h-4 ${a.liked ? 'fill-current' : ''}`} /></button>
        <span className="flex items-center gap-1.5"><Eye className="w-4 h-4" />{a.views}</span>
        <span className="flex items-center gap-1.5"><MessageCircle className="w-4 h-4" />{a.comments}</span>
        <button type="button" aria-pressed={!!a.saved} aria-label={a.saved ? 'Remove from saved' : 'Save article'} onClick={() => onToggle('saved')} className={`flex items-center gap-1.5 ${a.saved ? 'text-[#5945F1]' : 'hover:text-[#5945F1]'}`}><Bookmark className={`w-4 h-4 ${a.saved ? 'fill-current' : ''}`} />{a.saves}</button>
        <button type="button" aria-label="Share" onClick={onShare} className="ml-auto hover:text-[#5945F1]"><Share2 className="w-4 h-4" /></button>
      </div>
    </div>
  </Card>
);

import React, { useState } from 'react';
import {
  ArrowLeft,
  Flame,
  MessageCircle,
  Bookmark,
  Share2,
  MoreHorizontal,
  Play,
  Lock,
  Sparkles,
  Plus,
  Check,
  Star,
  ShieldCheck,
} from 'lucide-react';
import { FollowButton } from './FollowButton';
import { useNewsFollowState } from '../../data/newsFollows';
import { NewsArticle, NewsComment, AdvisorLabel } from '../../types';
import { NEWS_ARTICLES, NEWS_COMMENTS } from '../../data/newsData';
import { AVATAR_ADVISOR_SARAH } from '../../data/newsImagePlaceholders';
import { NewsPromoBanner } from './NewsPromoBanner';

interface NewsDetailPageProps {
  article: NewsArticle;
  relatedArticles?: NewsArticle[];
  comments?: NewsComment[];
  isLoggedIn: boolean;
  hasAccess: boolean;
  isAdvisor?: boolean;
  onBack: () => void;
  onUpgradePrompt: () => void;
  onShowToast: (msg: string) => void;
  /** Opens the sign-in modal. Following needs an account. */
  onSignIn?: () => void;
  /** Open the list of stories by a writer. */
  onSelectWriter?: (writer: string) => void;
}

const LABEL_STYLES: Record<AdvisorLabel, string> = {
  Critical: 'bg-rose-50 text-rose-600',
  'Long-term': 'bg-[#F0FCB1] text-[#323B01]',
  'Temporary Noise': 'bg-slate-100 text-slate-600',
};

export const NewsDetailPage: React.FC<NewsDetailPageProps> = ({
  article,
  relatedArticles,
  comments,
  isLoggedIn,
  hasAccess,
  isAdvisor = false,
  onBack,
  onUpgradePrompt,
  onShowToast,
  onSignIn,
  onSelectWriter,
}) => {
  const follow = useNewsFollowState();
  const following = follow.follows.some((f) => f.writer === article.source);
  const notifying = follow.follows.find((f) => f.writer === article.source)?.notify ?? false;
  const [claps, setClaps] = useState(article.claps);
  const [hasClapped, setHasClapped] = useState(false);
  const [saved, setSaved] = useState(false);
  const [followedTags, setFollowedTags] = useState<Record<string, boolean>>({});
  const [commentDraft, setCommentDraft] = useState('');
  const [label, setLabel] = useState<AdvisorLabel>(article.advisorPick?.label || 'Long-term');
  const [commentary, setCommentary] = useState(article.advisorPick?.commentary || '');
  const [bannerVisible, setBannerVisible] = useState(!isLoggedIn);
  const [showMemberTooltip, setShowMemberTooltip] = useState(!hasAccess);

  const related =
    relatedArticles ??
    NEWS_ARTICLES.filter((a) => a.id !== article.id && a.source === article.source).slice(0, 2);
  const articleComments = comments ?? NEWS_COMMENTS.filter((c) => c.articleId === article.id);

  const handleClap = () => {
    setClaps((c) => (hasClapped ? c - 1 : c + 1));
    setHasClapped((v) => !v);
  };

  const toggleTag = (tag: string) => {
    setFollowedTags((prev) => {
      const next = !prev[tag];
      onShowToast(next ? `Following ${tag}` : `Unfollowed ${tag}`);
      return { ...prev, [tag]: next };
    });
  };

  return (
    <>
    <div className="w-full">
      <NewsPromoBanner
        visible={bannerVisible}
        onDismiss={() => setBannerVisible(false)}
        onUpgrade={onUpgradePrompt}
      />

      <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-8 md:px-14 py-8 sm:py-10 pb-24">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm font-medium text-[#474556] hover:text-[#5338ec] mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Market News
        </button>

        <div className={`grid grid-cols-1 ${isAdvisor ? 'lg:grid-cols-[minmax(0,1fr)_320px]' : ''} gap-10 items-start`}>
          {/* Article column */}
          <div className="min-w-0">
            {!hasAccess && (
              <div className="relative mb-6">
                {showMemberTooltip && (
                  <div className="absolute -top-14 left-0 bg-[#0b1c30] text-white text-xs font-medium rounded-xl px-4 py-2.5 shadow-lg">
                    This member-only story is on us.
                    <div className="absolute -bottom-1.5 left-6 w-3 h-3 bg-[#0b1c30] rotate-45" />
                  </div>
                )}
                <div
                  onClick={() => setShowMemberTooltip(false)}
                  className="inline-flex items-center gap-1.5 bg-[#F8F7FF] border border-[#ECEEFA] rounded-full px-3 py-1.5 cursor-default"
                >
                  <Star className="w-3.5 h-3.5 text-[#5338ec] fill-current" />
                  <span className="text-xs font-semibold text-[#5338ec]">Member-only story</span>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 flex-wrap mb-4">
              {article.tags.map((t) => {
                const followed = !!followedTags[t];
                return (
                  <button
                    key={t}
                    onClick={() => toggleTag(t)}
                    className="flex items-center gap-1 pl-2.5 pr-1.5 py-0.5 rounded-md bg-[#EEF0FE] text-[#5338ec] text-xs font-semibold hover:bg-[#E0E3FC] transition-colors"
                  >
                    {t}
                    {followed ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                  </button>
                );
              })}
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-[34px] font-display font-bold text-[#0b1c30] leading-tight mb-4">
              {article.headline}
            </h1>

            <div className="flex items-center gap-3 py-4 border-y border-[#f1f5f9] mb-6">
              <img
                src={article.sourceAvatar}
                alt={article.source}
                className="w-10 h-10 rounded-full object-cover border border-slate-200"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[#0b1c30]">{article.source}</p>
                <p className="text-xs text-[#474556]">
                  {article.timestamp} · {article.readTime}
                </p>
              </div>
              <div className="flex items-center gap-3 text-[#474556]">
                <button
                  onClick={handleClap}
                  className={`flex items-center gap-1 text-xs font-semibold transition-colors ${
                    hasClapped ? 'text-[#5338ec]' : 'hover:text-[#5338ec]'
                  }`}
                >
                  <Flame className={`w-4 h-4 ${hasClapped ? 'fill-current' : ''}`} /> {claps}
                </button>
                <span className="flex items-center gap-1 text-xs">
                  <MessageCircle className="w-4 h-4" /> {articleComments.length}
                </span>
                <button
                  onClick={() => {
                    setSaved((v) => !v);
                    onShowToast(saved ? 'Removed from reading list' : 'Saved to your reading list');
                  }}
                  className={saved ? 'text-[#5338ec]' : 'hover:text-[#5338ec] transition-colors'}
                >
                  <Bookmark className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
                </button>
                <button
                  onClick={() => onShowToast('Link copied')}
                  className="hover:text-[#5338ec] transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button className="hover:text-[#5338ec] transition-colors">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden aspect-video w-full bg-slate-100 border border-slate-200 mb-6">
              <img src={article.heroImage} alt={article.headline} className="w-full h-full object-cover" />
            </div>

            <div className={`space-y-5 text-[#0b1c30] text-[17px] leading-[1.75] ${!hasAccess ? 'relative' : ''}`}>
              {article.content.map((para, i) => (
                <p key={i}>{para}</p>
              ))}

              {!hasAccess && (
                <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white via-white/90 to-transparent pointer-events-none" />
              )}

              {hasAccess && article.expertSummary && (
                <p className="relative">
                  <span className="bg-[#F0FCB1] rounded px-0.5 box-decoration-clone">
                    {article.expertSummary}
                  </span>
                  <span className="hidden sm:flex items-center gap-1 absolute -right-28 top-0 text-xs text-[#667705] font-semibold whitespace-nowrap">
                    <Sparkles className="w-3.5 h-3.5" /> Expert highlight
                  </span>
                </p>
              )}
            </div>

            {!hasAccess && (
              <div className="flex items-center justify-between gap-4 bg-[#F8F7FF] border border-[#ECEEFA] rounded-2xl px-5 py-4 -mt-2">
                <span className="text-sm font-medium text-[#0b1c30]">
                  Unlock the rest of this story, plus every premium source.
                </span>
                <button
                  onClick={onUpgradePrompt}
                  className="shrink-0 bg-[#5338ec] hover:bg-[#4326d8] text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors"
                >
                  See plans
                </button>
              </div>
            )}

            {/* Author card */}
            <div className="flex items-center justify-between gap-4 mt-10 pt-6 border-t border-[#f1f5f9]">
              <div
                role={onSelectWriter ? 'link' : undefined}
                tabIndex={onSelectWriter ? 0 : undefined}
                onClick={() => onSelectWriter?.(article.source)}
                onKeyDown={(e) => e.key === 'Enter' && onSelectWriter?.(article.source)}
                className={`flex items-center gap-3 ${onSelectWriter ? 'cursor-pointer group' : ''}`}
              >
                <img
                  src={article.sourceAvatar}
                  alt={article.source}
                  className="w-11 h-11 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <p className={`text-sm font-bold text-[#0b1c30] ${onSelectWriter ? 'group-hover:text-[#5338ec] group-hover:underline' : ''}`}>Written by {article.source}</p>
                  <p className="text-xs text-[#474556]">38.2K followers · Verified newswire partner</p>
                </div>
              </div>
              <FollowButton writer={article.source} following={following} notify={notifying} isLoggedIn={isLoggedIn} onSignIn={onSignIn} onToast={onShowToast} />
            </div>

            {/* Responses */}
            <div className="mt-10 pt-6 border-t border-[#f1f5f9]">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-lg font-bold text-[#0b1c30]">Responses ({articleComments.length})</h3>
                <ShieldCheck className="w-4 h-4 text-slate-300" />
              </div>

              <div className="flex items-start gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-[#5338ec] text-white flex items-center justify-center text-xs font-bold shrink-0">
                  {isLoggedIn ? 'U' : '?'}
                </div>
                <input
                  value={commentDraft}
                  onChange={(e) => setCommentDraft(e.target.value)}
                  placeholder="What are your thoughts?"
                  className="flex-1 bg-[#f1f5f9] rounded-full px-4 py-2.5 text-sm text-[#0b1c30] placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#5338ec]/30"
                />
              </div>

              <div className="space-y-5">
                {articleComments.map((c) => (
                  <div key={c.id}>
                    <div className="flex items-center gap-2 mb-1.5">
                      {c.avatar ? (
                        <img src={c.avatar} alt={c.author} className="w-7 h-7 rounded-full object-cover" />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px] font-bold">
                          {c.author.slice(0, 1).toUpperCase()}
                        </div>
                      )}
                      <span className="text-sm font-semibold text-[#0b1c30]">{c.author}</span>
                      <span className="text-xs text-[#94a3b8]">{c.date}</span>
                    </div>
                    <p className="text-sm text-[#0b1c30] leading-relaxed pl-9">{c.text}</p>
                    <div className="flex items-center gap-4 pl-9 mt-1.5 text-xs text-[#94a3b8]">
                      <span className="flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5" /> {c.claps}
                      </span>
                      <span>{c.repliesCount} replies</span>
                      <button className="font-semibold hover:text-[#5338ec]">Reply</button>
                    </div>
                  </div>
                ))}
              </div>

              {articleComments.length > 0 && (
                <button
                  onClick={() => onShowToast('Loading all responses...')}
                  className="mt-6 border border-slate-300 rounded-full px-4 py-2 text-sm font-semibold text-[#0b1c30] hover:bg-slate-50 transition-colors"
                >
                  See all responses
                </button>
              )}
            </div>

            {/* More from source */}
            {related.length > 0 && (
              <div className="mt-10 pt-6 border-t border-[#f1f5f9]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-[#0b1c30]">More from {article.source}</h3>
                  {onSelectWriter && (
                    <button onClick={() => onSelectWriter(article.source)} className="text-sm font-semibold text-[#5338ec] hover:underline">See all stories</button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {related.map((r) => (
                    <div key={r.id} className="cursor-pointer group">
                      <div className="aspect-video rounded-xl overflow-hidden bg-slate-100 mb-2">
                        <img
                          src={r.thumbnail}
                          alt={r.headline}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[#474556] mb-1">
                        <img src={r.sourceAvatar} alt={r.source} className="w-4 h-4 rounded-full object-cover" />
                        <span className="font-semibold">{r.source}</span> · <span>{r.timestamp}</span>
                      </div>
                      <p className="text-sm font-bold text-[#0b1c30] group-hover:text-[#5338ec] leading-snug transition-colors">
                        {r.headline}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Advisor control rail (advisor/mentor accounts only) */}
          {isAdvisor && (
            <aside className="space-y-5 lg:sticky lg:top-6">
              <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5 shadow-xs">
                <div className="flex items-center gap-2.5 mb-4">
                  <img
                    src={AVATAR_ADVISOR_SARAH}
                    alt="You"
                    className="w-9 h-9 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <p className="text-sm font-bold text-[#0b1c30]">Sarah K.</p>
                    <p className="text-[11px] text-[#474556]">Verified Advisor</p>
                  </div>
                </div>

                <p className="text-xs font-bold uppercase tracking-wide text-[#474556] mb-2">Label this story</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {(Object.keys(LABEL_STYLES) as AdvisorLabel[]).map((l) => (
                    <button
                      key={l}
                      onClick={() => setLabel(l)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                        label === l ? LABEL_STYLES[l] + ' border-transparent' : 'bg-white border-slate-200 text-slate-500'
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>

                <textarea
                  value={commentary}
                  onChange={(e) => setCommentary(e.target.value)}
                  rows={3}
                  placeholder="Add your commentary — what should your members actually do with this?"
                  className="w-full resize-none border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-[#0b1c30] placeholder:text-slate-400 mb-4 focus:outline-none focus:ring-2 focus:ring-[#5338ec]/30"
                />

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => onShowToast('Pushed to your community timeline')}
                    className="bg-[#5338ec] hover:bg-[#4326d8] text-white text-sm font-semibold rounded-xl py-2.5 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Sparkles className="w-4 h-4" /> Push to community timeline
                  </button>
                  <button
                    onClick={() => onShowToast('Pinned inside your group module')}
                    className="border border-slate-200 hover:bg-slate-50 text-sm font-semibold text-[#0b1c30] rounded-xl py-2.5 transition-colors"
                  >
                    Pin inside a group module
                  </button>
                  <button
                    onClick={() => onShowToast('Linked to your next live class')}
                    className="border border-slate-200 hover:bg-slate-50 text-sm font-semibold text-[#0b1c30] rounded-xl py-2.5 transition-colors"
                  >
                    Link to a live class session
                  </button>
                  <button
                    onClick={() => onShowToast('Saved as a case study')}
                    className="border border-slate-200 hover:bg-slate-50 text-sm font-semibold text-[#0b1c30] rounded-xl py-2.5 transition-colors"
                  >
                    Turn into a case study
                  </button>
                </div>

                <p className="text-[11px] text-slate-400 mt-3">
                  Members following you get pinged the moment this goes out.
                </p>
              </div>

              {article.advisorPick?.lessonTitle && (
                <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5 shadow-xs">
                  <p className="text-xs font-bold uppercase tracking-wide text-[#474556] mb-3">Connected lesson</p>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-16 h-12 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                      <Play className="w-4 h-4 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#0b1c30] leading-snug">{article.advisorPick.lessonTitle}</p>
                      <p className="text-xs text-[#474556]">
                        Recorded · {article.advisorPick.lessonDate} · {article.advisorPick.lessonDuration}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => onShowToast('Opening replay...')}
                    className="w-full text-sm font-semibold text-[#5338ec] hover:text-[#4326d8] transition-colors"
                  >
                    Watch replay
                  </button>
                </div>
              )}
            </aside>
          )}
        </div>
      </div>
    </div>
    </>
  );
};

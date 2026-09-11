import React, { useState } from 'react';
import {
  Image,
  Tag,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Send,
  X,
} from 'lucide-react';
import { CommunityPost, UserProfile } from '../../types';

interface CreateCommunityPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (post: Partial<CommunityPost>) => void;
  user: UserProfile;
}

export const CreateCommunityPostModal: React.FC<CreateCommunityPostModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  user,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [ticker, setTicker] = useState('BTC');
  const [sentiment, setSentiment] = useState<'Bullish' | 'Bearish'>('Bullish');
  const [imageUrl, setImageUrl] = useState('');
  const [tagsInput, setTagsInput] = useState('AlphaCall, ForexRebates');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    onSubmit({
      title,
      content,
      image: imageUrl.trim() || undefined,
      tokenMentions: [
        {
          symbol: ticker.toUpperCase(),
          change: sentiment === 'Bullish' ? 4.82 : -3.25,
          sentiment,
        },
      ],
      tags,
    });

    // Reset
    setTitle('');
    setContent('');
    setImageUrl('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-[#e2e8f0] rounded-2xl w-full max-w-xl text-[#0b1c30] shadow-2xl p-6 relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#ede9fe] border border-indigo-100 flex items-center justify-center text-[#5338ec]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0b1c30] font-display">Create Community Post</h3>
              <p className="text-xs text-[#474556]">
                Share trading setups, order-flow alpha, or broker spread reviews.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-[#474556] font-medium block mb-1">
              Headline Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. BTC Breakout Analysis or Exness Spread Review"
              className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-3 py-2 text-xs text-[#0b1c30] placeholder-slate-400 focus:outline-none focus:border-[#5338ec] focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[#474556] font-medium block mb-1">
                Primary Ticker / Symbol
              </label>
              <input
                type="text"
                value={ticker}
                onChange={(e) => setTicker(e.target.value.toUpperCase())}
                placeholder="BTC, ETH, XAU/USD"
                className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-3 py-2 text-xs text-[#0b1c30] placeholder-slate-400 focus:outline-none focus:border-[#5338ec] focus:bg-white font-mono"
              />
            </div>

            <div>
              <label className="text-xs text-[#474556] font-medium block mb-1">
                Market Sentiment
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSentiment('Bullish')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                    sentiment === 'Bullish'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                      : 'bg-[#f8fafc] border-[#e2e8f0] text-[#474556] hover:bg-[#f1f5f9]'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Bullish</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSentiment('Bearish')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                    sentiment === 'Bearish'
                      ? 'bg-rose-50 border-rose-500 text-rose-700'
                      : 'bg-[#f8fafc] border-[#e2e8f0] text-[#474556] hover:bg-[#f1f5f9]'
                  }`}
                >
                  <TrendingDown className="w-3.5 h-3.5" />
                  <span>Bearish</span>
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs text-[#474556] font-medium block mb-1">
              Post Body / Technical Thesis
            </label>
            <textarea
              required
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Provide your chart structure, key entry zones, liquidity targets, and how cashback offsets spread..."
              className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-3 text-xs text-[#0b1c30] placeholder-slate-400 focus:outline-none focus:border-[#5338ec] focus:bg-white resize-none"
            />
          </div>

          <div>
            <label className="text-xs text-[#474556] font-medium block mb-1">
              Optional Chart or Image URL
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/... or TradingView link"
              className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-3 py-2 text-xs text-[#0b1c30] placeholder-slate-400 focus:outline-none focus:border-[#5338ec] focus:bg-white"
            />
          </div>

          <div>
            <label className="text-xs text-[#474556] font-medium block mb-1">
              Hashtags (comma separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Arbitrum, DeFi, Scalping"
              className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-3 py-2 text-xs text-[#0b1c30] placeholder-slate-400 focus:outline-none focus:border-[#5338ec] focus:bg-white"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#f1f5f9]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#474556] hover:text-[#0b1c30]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 bg-[#5338ec] hover:bg-[#4326d8] text-white px-5 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Publish Post (+25 pts)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

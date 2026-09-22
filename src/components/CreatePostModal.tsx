import React, { useState } from 'react';
import { X, Sparkles, Send, TrendingUp, TrendingDown, HelpCircle, Shield, AlertCircle } from 'lucide-react';
import { CommunityPost } from '../types';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (post: Omit<CommunityPost, 'id' | 'likes' | 'hasLiked' | 'commentsCount' | 'comments'>) => void;
  username: string;
  avatar: string;
  tier: string;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  username,
  avatar,
  tier,
}) => {
  const [category, setCategory] = useState<'Alpha' | 'Discussion' | 'Review' | 'Educational'>('Alpha');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [ticker, setTicker] = useState('XAU/USD');
  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY');
  const [entryPrice, setEntryPrice] = useState('2888.00');
  const [targetPrice, setTargetPrice] = useState('2920.00');
  const [stopLoss, setStopLoss] = useState('2872.00');
  const [tagsInput, setTagsInput] = useState('Gold, Scalp, RebateBoost');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a descriptive title.');
      return;
    }
    if (!content.trim()) {
      setError('Please provide the thesis or discussion details.');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    onSubmit({
      author: {
        name: username,
        handle: `@${username.toLowerCase().replace(/\s+/g, '_')}`,
        avatar,
        tier,
        verified: true,
        winRate: '78.5%',
      },
      timestamp: 'Just now',
      category,
      title: title.trim(),
      content: content.trim(),
      tags: tags.length > 0 ? tags : ['CommunityAlpha'],
      ...(category === 'Alpha'
        ? {
            ticker: ticker.toUpperCase(),
            side,
            entryPrice: parseFloat(entryPrice) || undefined,
            targetPrice: parseFloat(targetPrice) || undefined,
            stopLoss: parseFloat(stopLoss) || undefined,
            projectedRebate: '+$8.00 / lot (Exness Raw)',
          }
        : {}),
    });

    // Reset and close
    setTitle('');
    setContent('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0b1c30]/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#5338ec]/10 text-[#5338ec] flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4 text-[#5338ec]" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-[#0b1c30]">
                Share Alpha & Strategy Setup
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Publish trading setups and earn +15 Community Karma points
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-200/70 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Category Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Category
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['Alpha', 'Discussion', 'Review', 'Educational'] as const).map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`py-2 px-2 text-xs font-semibold rounded-xl border transition-all ${
                    category === cat
                      ? 'bg-[#5338ec] text-white border-[#5338ec] shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {cat === 'Alpha' && '⚡ '}
                  {cat === 'Discussion' && '💬 '}
                  {cat === 'Review' && '⭐ '}
                  {cat === 'Educational' && '📚 '}
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* If Alpha: Trade Parameters */}
          {category === 'Alpha' && (
            <div className="p-3.5 rounded-xl bg-[#f8fafc] border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#0b1c30] uppercase tracking-wider">
                  Quantitative Trade Parameters
                </span>
                <span className="text-[11px] text-[#5338ec] font-semibold bg-[#5338ec]/10 px-2 py-0.5 rounded-full">
                  Rebate Buffered
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-1">
                    Symbol
                  </label>
                  <input
                    type="text"
                    value={ticker}
                    onChange={(e) => setTicker(e.target.value)}
                    placeholder="e.g. XAU/USD"
                    className="w-full px-2.5 py-1.5 text-xs font-mono font-bold bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#5338ec]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-1">
                    Side
                  </label>
                  <div className="grid grid-cols-2 gap-1 bg-white p-1 rounded-lg border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setSide('BUY')}
                      className={`text-[11px] font-bold py-1 rounded transition-colors ${
                        side === 'BUY'
                          ? 'bg-emerald-600 text-white'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      BUY
                    </button>
                    <button
                      type="button"
                      onClick={() => setSide('SELL')}
                      className={`text-[11px] font-bold py-1 rounded transition-colors ${
                        side === 'SELL'
                          ? 'bg-rose-600 text-white'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      SELL
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-1">
                    Entry Price
                  </label>
                  <input
                    type="text"
                    value={entryPrice}
                    onChange={(e) => setEntryPrice(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-mono bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#5338ec]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-1">
                    Take Profit
                  </label>
                  <input
                    type="text"
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-mono text-emerald-700 font-semibold bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#5338ec]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">
                  Stop Loss Price
                </label>
                <input
                  type="text"
                  value={stopLoss}
                  onChange={(e) => setStopLoss(e.target.value)}
                  className="w-full max-w-[200px] px-2.5 py-1.5 text-xs font-mono text-rose-700 font-semibold bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#5338ec]"
                />
              </div>
            </div>
          )}

          {/* Post Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Title / Core Thesis
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Gold Liquidity Sweep on 15m with US Yield Divergence"
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#5338ec] focus:bg-white transition-all font-medium"
            />
          </div>

          {/* Post Content */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Detailed Analysis & Execution Plan
            </label>
            <textarea
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share the confluence factors, timeframes, order flow indicators, and how broker cashback mitigates execution friction..."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#5338ec] focus:bg-white transition-all leading-relaxed"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Forex, Scalping, IC Markets, RiskManagement"
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#5338ec] focus:bg-white transition-all"
            />
          </div>

          {/* Footer Points Notice */}
          <div className="p-3 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-between text-xs text-violet-900">
            <span className="flex items-center gap-1.5">
              <span className="text-base">💎</span>
              <span className="font-semibold">Author Reward:</span>
              <span className="text-slate-600">You will earn +15 Level Points instantly</span>
            </span>
            <span className="font-bold text-[#5338ec]">+15 pts</span>
          </div>

          {/* Submit Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-[#5338ec] hover:bg-[#4338ca] rounded-xl shadow-md transition-all flex items-center gap-2 active:scale-95"
            >
              <Send className="w-3.5 h-3.5 text-[#c6f831]" />
              <span>Publish Post</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

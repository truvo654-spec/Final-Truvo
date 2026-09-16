import React, { useState } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Image,
  Tag,
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
  const [imageUrl, setImageUrl] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    onSubmit({
      title,
      content,
      image: imageUrl.trim() || undefined,
      tags,
    });

    // Reset
    setTitle('');
    setContent('');
    setImageUrl('');
    setTagsInput('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-[#e2e8f0] rounded-2xl w-full max-w-lg text-[#0b1c30] shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#ede9fe] text-[#5338ec] flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0b1c30] font-display">Create Post</h3>
              <p className="text-xs text-[#474556]">Share insights, analysis, or questions with the community.</p>
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
              Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your post a concise title..."
              className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-3 py-2 text-xs text-[#0b1c30] placeholder-slate-400 focus:outline-none focus:border-[#5338ec] focus:bg-white"
            />
          </div>

          <div>
            <label className="text-xs text-[#474556] font-medium block mb-1">
              Content
            </label>
            <textarea
              required
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's happening in the markets?..."
              className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-3 text-xs text-[#0b1c30] placeholder-slate-400 focus:outline-none focus:border-[#5338ec] focus:bg-white resize-none"
            />
          </div>

          <div>
            <label className="text-xs text-[#474556] font-medium block mb-1 flex items-center gap-1">
              <Image className="w-3.5 h-3.5" />
              <span>Image URL (Optional)</span>
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-3 py-2 text-xs text-[#0b1c30] placeholder-slate-400 focus:outline-none focus:border-[#5338ec] focus:bg-white"
            />
          </div>

          <div>
            <label className="text-xs text-[#474556] font-medium block mb-1 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" />
              <span>Tags (comma-separated)</span>
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Crypto, Bitcoin, Forex, Scalping"
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
              className="inline-flex items-center gap-1.5 bg-[#5338ec] hover:bg-[#4326d8] text-white px-5 py-2 rounded-xl text-xs font-semibold shadow-xs transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Publish Post</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

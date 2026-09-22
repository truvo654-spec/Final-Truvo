import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Mail,
  MessageSquare,
  Globe,
  Sparkles,
  ShieldCheck,
  Send,
  HelpCircle,
  ChevronDown,
  CheckCircle2,
} from 'lucide-react';

interface CompanyModalsProps {
  isOpen: boolean;
  type: 'about' | 'contact';
  onClose: () => void;
  onNavigateToAbout?: () => void;
}

export const CompanyModals: React.FC<CompanyModalsProps> = ({
  isOpen,
  type,
  onClose,
  onNavigateToAbout,
}) => {
  const [contactSubject, setContactSubject] = useState('General Inquiry');
  const [contactMessage, setContactMessage] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setContactMessage('');
      onClose();
    }, 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#5945F1] flex items-center justify-center shadow-sm">
                {type === 'about' ? (
                  <Sparkles className="w-5 h-5 text-white" />
                ) : (
                  <Mail className="w-5 h-5 text-white" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#0b1c30]">
                  {type === 'about' ? 'About MarketSyde' : 'Contact MarketSyde Desk'}
                </h3>
                <p className="text-xs text-slate-500">
                  {type === 'about'
                    ? 'Our mission, core values, and transparent trading ecosystem.'
                    : 'Drop a message, reach our 24/7 institutional desk, or browse FAQs.'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="p-6 overflow-y-auto space-y-6 text-sm">
            {type === 'about' ? (
              <>
                {/* Mission Hero */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-[#eff2fe] to-[#e0e7ff] border border-indigo-100/60">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#5945F1] mb-1 font-sans">
                    Our Mission
                  </div>
                  <h4 className="text-base sm:text-lg font-bold text-[#0b1c30] leading-snug">
                    Democratizing institutional rebates and high-conviction market intelligence for every trader.
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                    MarketSyde was founded on a simple principle: traders shouldn't leave money on the table. By aggregating volume across leading tier-1 regulated brokers, we pass back the highest automated cash rebates directly to our members with zero hidden markups.
                  </p>
                </div>

                {/* Core Values 3-Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <ShieldCheck className="w-5 h-5 text-[#5945F1] mb-2" />
                    <h5 className="font-bold text-slate-900 text-sm">Total Transparency</h5>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Audited spread reports, zero pip widening, and daily automated cashback ledgers.
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <Sparkles className="w-5 h-5 text-[#5945F1] mb-2" />
                    <h5 className="font-bold text-slate-900 text-sm">Trader First</h5>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Community-driven tools, transparent fee audits, and verified setups.
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <Globe className="w-5 h-5 text-[#5945F1] mb-2" />
                    <h5 className="font-bold text-slate-900 text-sm">Global Liquidity</h5>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Direct integration with licensed institutional brokers across 140+ countries.
                    </p>
                  </div>
                </div>

                {/* Story Timeline */}
                <div className="border-t border-slate-100 pt-4">
                  <h5 className="font-bold text-slate-900 mb-3 text-sm">Our Journey</h5>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#5945F1]/10 text-[#5945F1] font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                        1
                      </div>
                      <div>
                        <span className="font-bold text-slate-800 text-xs">Automated Rebate Engine</span>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          Launched direct broker API synchronization for instant per-lot rebates.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#5945F1]/10 text-[#5945F1] font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                        2
                      </div>
                      <div>
                        <span className="font-bold text-slate-800 text-xs">Signal & Quantitative Cues</span>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          Integrated multi-timeframe confirmation engines with 85%+ verified win-rates.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {onNavigateToAbout && (
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        onClose();
                        onNavigateToAbout();
                      }}
                      className="w-full py-3 rounded-2xl bg-[#5945F1] hover:bg-[#492CED] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                    >
                      <span>Explore Our Full Story & Philosophy</span>
                      <Sparkles className="w-4 h-4 text-[#bef226]" />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <>
                {/* Quick Channels */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#5945F1]/10 flex items-center justify-center text-[#5945F1] shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold text-slate-400 uppercase">Direct Email</div>
                      <div className="text-xs font-bold text-slate-800">support@marketsyde.com</div>
                    </div>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#bef226]/30 flex items-center justify-center text-slate-900 shrink-0">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold text-slate-400 uppercase">Live Telegram VIP</div>
                      <div className="text-xs font-bold text-slate-800">@marketsyde_desk</div>
                    </div>
                  </div>
                </div>

                {/* Message Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Your Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="trader@example.com"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#5945F1] focus:ring-2 focus:ring-[#5945F1]/15"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Inquiry Topic
                    </label>
                    <select
                      value={contactSubject}
                      onChange={(e) => setContactSubject(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#5945F1]"
                    >
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Broker Connection & Rebates">Broker Connection & Rebates</option>
                      <option value="VIP Signals & API">VIP Signals & API</option>
                      <option value="Partnership & IB Onboarding">Partnership & IB Onboarding</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Your Message
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="How can our desk assist your trading today?"
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#5945F1] focus:ring-2 focus:ring-[#5945F1]/15"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitted}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#5945F1] hover:bg-[#4b35e0] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
                  >
                    {isSubmitted ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-[#bef226]" />
                        Message Sent to Desk!
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        Send Message
                      </>
                    )}
                  </button>
                </form>

                {/* Quick FAQ Section */}
                <div className="border-t border-slate-100 pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <HelpCircle className="w-4 h-4 text-[#5945F1]" />
                    <span className="font-bold text-slate-800 text-xs">Frequently Asked Questions</span>
                  </div>
                  <div className="space-y-2">
                    {[
                      {
                        q: 'How does MarketSyde pay cashback on my trades?',
                        a: 'Brokers share a portion of the spread with us for introducing volume. We pass up to 90% of this commission back into your account daily.',
                      },
                      {
                        q: 'Does connecting my broker widen my spreads?',
                        a: 'No. Your trading conditions, spreads, execution speed, and leverage remain identical to direct accounts.',
                      },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl border border-slate-200/80 overflow-hidden bg-slate-50/50"
                      >
                        <button
                          type="button"
                          onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                          className="w-full px-3 py-2 text-left flex items-center justify-between text-xs font-semibold text-slate-800 cursor-pointer"
                        >
                          <span>{item.q}</span>
                          <ChevronDown
                            className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                              expandedFaq === idx ? 'rotate-180' : ''
                            }`}
                          />
                        </button>
                        {expandedFaq === idx && (
                          <div className="px-3 pb-2.5 text-[11px] text-slate-600 leading-relaxed border-t border-slate-100 bg-white">
                            {item.a}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

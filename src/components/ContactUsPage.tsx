import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Minus, Check, Send } from 'lucide-react';

interface ContactUsPageProps {
  onShowToast?: (message: string) => void;
  onNavigateToTab?: (tab: string) => void;
}

type FaqCategory = 'most-asked' | 'cashback' | 'brokers' | 'points';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: FaqCategory;
}

const FAQ_DATA: FaqItem[] = [
  // Most Asked (Exact items from design reference)
  {
    id: 'faq-1',
    category: 'most-asked',
    question: 'How do I connect my trading account to MarketSyde?',
    answer:
      'Simply create an account on MarketSyde, navigate to the Brokers section, select your broker (e.g. Exness, XM, IC Markets, Pepperstone), and enter your trading account number. Our automated verification system will sync your account within minutes.',
  },
  {
    id: 'faq-2',
    category: 'most-asked',
    question: 'How does cashback work?',
    answer:
      'Every time you execute a trade with your linked broker, the broker pays us an institutional volume rebate. We pass up to 90% of that rebate directly back into your MarketSyde wallet daily as withdrawable cash.',
  },
  {
    id: 'faq-3',
    category: 'most-asked',
    question: 'Which brokers can I connect?',
    answer:
      'We support over 20 top-tier regulated brokers worldwide including Exness, XM, IC Markets, Pepperstone, Vantage, FP Markets, and more. You can link existing accounts or open fresh accounts through our direct partner links.',
  },
  {
    id: 'faq-4',
    category: 'most-asked',
    question: 'Do I need to open a new broker account?',
    answer:
      'Not necessarily! For many brokers, you can simply transfer your existing account under our IB code or open an additional sub-account under your existing broker profile without needing new identity verification.',
  },
  {
    id: 'faq-5',
    category: 'most-asked',
    question: 'How long does account verification take?',
    answer:
      'Verification typically takes between 5 to 30 minutes during standard market trading hours. You will receive an instant in-app notification and email confirmation once your account is active and verified.',
  },

  // Cashback category
  {
    id: 'faq-cb-1',
    category: 'cashback',
    question: 'When is my cashback paid out?',
    answer:
      'Cashback is calculated and credited to your wallet daily at 00:00 UTC for all closed trades from the preceding trading day. You can withdraw anytime once credited.',
  },
  {
    id: 'faq-cb-2',
    category: 'cashback',
    question: 'Is there a minimum withdrawal amount for cashback?',
    answer:
      'Our minimum withdrawal threshold is only $10. You can withdraw directly to crypto (USDT, USDC), bank wire, Skrill, Neteller, or local banking partners with zero MarketSyde fees.',
  },
  {
    id: 'faq-cb-3',
    category: 'cashback',
    question: 'Can I earn cashback on both winning and losing trades?',
    answer:
      'Yes! Rebates are paid based purely on completed trade lot volume, regardless of whether your individual trades result in a profit or loss.',
  },
  {
    id: 'faq-cb-4',
    category: 'cashback',
    question: 'Does receiving cashback widen my broker spreads or commissions?',
    answer:
      'Absolutely not. Your spreads, commissions, and execution speeds remain 100% identical to trading directly with the broker. Our rebates come directly from the broker’s marketing budget.',
  },

  // Brokers category
  {
    id: 'faq-br-1',
    category: 'brokers',
    question: 'Are my broker login passwords or API credentials stored on MarketSyde?',
    answer:
      'No. We never ask for, access, or store your trading passwords. Account linking is done strictly through public broker account IDs and read-only rebate API reporting.',
  },
  {
    id: 'faq-br-2',
    category: 'brokers',
    question: 'Can I link multiple trading accounts across different brokers?',
    answer:
      'Yes! You can connect an unlimited number of accounts across different brokers under a single unified MarketSyde dashboard and aggregate your cashback into one balance.',
  },
  {
    id: 'faq-br-3',
    category: 'brokers',
    question: 'What happens if my broker is not listed?',
    answer:
      'You can request a broker via our Contact Form or support chat. Our partnership team reviews requested brokers weekly and can onboard qualified regulated brokers rapidly.',
  },

  // Points category
  {
    id: 'faq-pt-1',
    category: 'points',
    question: 'How do I earn MarketSyde points and credits?',
    answer:
      'You earn points by trading volume, completing daily missions, verifying trading accounts, engaging in the community hub, and maintaining active trading streaks.',
  },
  {
    id: 'faq-pt-2',
    category: 'points',
    question: 'What rewards can I redeem with points?',
    answer:
      'Points can be redeemed in the Rewards store for VIP signal access, spread discounts, cash bonuses, TradingView subscriptions, and exclusive merchandise.',
  },
  {
    id: 'faq-pt-3',
    category: 'points',
    question: 'Do MarketSyde points ever expire?',
    answer:
      'Points remain active as long as your account has at least one active trade or platform login recorded every 90 days.',
  },
];

export const ContactUsPage: React.FC<ContactUsPageProps> = ({
  onShowToast,
  onNavigateToTab,
}) => {
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // FAQ State
  const [selectedCategory, setSelectedCategory] = useState<FaqCategory>('most-asked');
  const [openFaqIds, setOpenFaqIds] = useState<string[]>([]);

  const toggleFaq = (id: string) => {
    setOpenFaqIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      onShowToast?.('Please complete all required fields.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      onShowToast?.('Message sent successfully! Our team will get back to you shortly.');
      setFormData({ name: '', email: '', message: '' });
      setTimeout(() => setIsSubmitted(false), 6000);
    }, 700);
  };

  const filteredFaqs = FAQ_DATA.filter((faq) => faq.category === selectedCategory);

  return (
    <div className="w-full bg-white dark:bg-[#0e022b] text-[#0b1c30] dark:text-white font-sans selection:bg-[#5945F1]/20 selection:text-[#5945F1] transition-colors">
      {/* ─────────────────────────────────────────────────────────────
          SECTION 1: HERO HEADER
          "Get In Touch With Us."
          "Have a question or need help? Hit us up. We're around."
         ───────────────────────────────────────────────────────────── */}
      <section className="w-full pt-[100px] pb-8 sm:pb-12 px-4 sm:px-6 text-center max-w-5xl mx-auto">
        {/* Main Display Heading */}
        <h1 className="text-4xl sm:text-5xl md:text-[62px] font-black tracking-tight leading-[1.08] mb-4 sm:mb-5">
          <span className="text-[#5945F1]">Get In Touch With U</span>
          <span className="text-[#5945F1]">s</span>
          <span className="text-[#E11D48] ml-0.5">.</span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg md:text-xl text-slate-800 dark:text-slate-200">
          Have a question or need help?{' '}
          <strong className="font-bold text-slate-900 dark:text-white">
            Hit us up. We're around.
          </strong>
        </p>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 2: 3D ILLUSTRATION (LEFT) + FORM (RIGHT)
         ───────────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 sm:pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* LEFT: 3D Floating Mail Illustration */}
          <div className="lg:col-span-6 flex items-center justify-center relative py-6">
            {/* Ambient circular soft background disc with radial gradient */}
            <div className="relative w-[320px] h-[320px] sm:w-[390px] sm:h-[390px] md:w-[420px] md:h-[420px] flex items-center justify-center select-none">
              {/* Soft circular disc backdrop */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-b from-[#f3f4fa]/90 via-[#f8f9ff]/70 to-[#eef0fc]/90 dark:from-[#21095e]/40 dark:to-[#170345]/50 shadow-[inset_0_2px_12px_rgba(0,0,0,0.03)] border border-slate-100/80 dark:border-indigo-900/30" />

              {/* Orbiting 3D Accent Spheres */}
              {/* 1. Purple Sphere - Top Center */}
              <motion.div
                animate={{ y: [-4, 4, -4] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-5 left-1/2 -translate-x-1/2 w-4.5 h-4.5 rounded-full shadow-md z-20"
                style={{
                  background: 'radial-gradient(circle at 35% 30%, #8978fc 0%, #5945F1 60%, #351cd1 100%)',
                }}
              />

              {/* 2. Lime Green Sphere - Far Left */}
              <motion.div
                animate={{ y: [3, -5, 3] }}
                transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                className="absolute top-1/3 left-6 w-3.5 h-3.5 rounded-full shadow-md z-20"
                style={{
                  background: 'radial-gradient(circle at 35% 30%, #e1ff68 0%, #bef226 65%, #84cc16 100%)',
                }}
              />

              {/* 3. Lime Green Sphere - Upper Right */}
              <motion.div
                animate={{ y: [-3, 5, -3] }}
                transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
                className="absolute top-1/4 right-8 w-3.5 h-3.5 rounded-full shadow-md z-20"
                style={{
                  background: 'radial-gradient(circle at 35% 30%, #e1ff68 0%, #bef226 65%, #84cc16 100%)',
                }}
              />

              {/* 4. Lime Green Sphere - Lower Right */}
              <motion.div
                animate={{ y: [4, -4, 4] }}
                transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
                className="absolute bottom-1/4 right-14 w-3.5 h-3.5 rounded-full shadow-md z-20"
                style={{
                  background: 'radial-gradient(circle at 35% 30%, #e1ff68 0%, #bef226 65%, #84cc16 100%)',
                }}
              />

              {/* 5. Purple Sphere - Bottom */}
              <motion.div
                animate={{ y: [-3, 3, -3] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
                className="absolute bottom-9 left-[45%] w-3 h-3 rounded-full shadow-md z-20"
                style={{
                  background: 'radial-gradient(circle at 35% 30%, #8978fc 0%, #5945F1 60%, #351cd1 100%)',
                }}
              />

              {/* Central Floating Envelope & Floating Elements */}
              <motion.div
                animate={{ y: [-6, 6, -6] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
                className="relative flex items-center justify-center z-10"
              >
                {/* 3D Envelope Base */}
                <div className="relative w-44 h-34 sm:w-52 sm:h-38 rounded-2xl bg-white/80 dark:bg-[#1a084e]/80 backdrop-blur-md border border-white dark:border-indigo-800/40 shadow-[0_20px_45px_rgba(89,69,241,0.18)] p-2 flex flex-col justify-end overflow-hidden">
                  {/* Inside Letter Card Popping Out */}
                  <motion.div
                    animate={{ y: [-4, 2, -4] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute -top-6 left-1/2 -translate-x-1/2 w-32 h-34 sm:w-38 sm:h-38 rounded-xl bg-gradient-to-b from-[#7660fc] to-[#5945F1] shadow-xl p-3 flex flex-col justify-center items-center gap-2 z-10 border border-white/40"
                  >
                    {/* Three horizontal message line bars */}
                    <div className="w-18 sm:w-20 h-2 rounded-full bg-white/95 shadow-2xs" />
                    <div className="w-22 sm:w-24 h-2 rounded-full bg-white/85" />
                    <div className="w-16 sm:w-18 h-2 rounded-full bg-white/75" />
                  </motion.div>

                  {/* Frosted Front V-folds */}
                  <div
                    className="absolute inset-x-0 bottom-0 h-22 sm:h-26 bg-white/70 dark:bg-[#230674]/70 backdrop-blur-sm pointer-events-none border-t border-white/80 dark:border-indigo-700/40"
                    style={{
                      clipPath: 'polygon(0% 100%, 50% 30%, 100% 100%)',
                    }}
                  />
                  <div
                    className="absolute inset-y-0 left-0 w-22 sm:w-26 bg-white/45 dark:bg-[#230674]/40 backdrop-blur-xs pointer-events-none"
                    style={{
                      clipPath: 'polygon(0% 0%, 50% 50%, 0% 100%)',
                    }}
                  />
                  <div
                    className="absolute inset-y-0 right-0 w-22 sm:w-26 bg-white/45 dark:bg-[#230674]/40 backdrop-blur-xs pointer-events-none"
                    style={{
                      clipPath: 'polygon(100% 0%, 50% 50%, 100% 100%)',
                    }}
                  />
                </div>

                {/* 3D Chat Speech Bubble with '...' (Top Left) */}
                <motion.div
                  animate={{
                    y: [-4, 5, -4],
                    scale: [1, 1.05, 1],
                  }}
                  transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
                  className="absolute -top-7 -left-7 sm:-left-9 z-30"
                >
                  <div
                    className="w-12 h-12 rounded-full shadow-lg border border-white/40 flex items-center justify-center p-2 relative"
                    style={{
                      background: 'radial-gradient(circle at 35% 30%, #7660fc 0%, #5945F1 70%, #3e26cf 100%)',
                    }}
                  >
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    </div>
                    {/* Tail */}
                    <div
                      className="absolute -bottom-1 right-2 w-3 h-3 rotate-45"
                      style={{ background: '#5945F1' }}
                    />
                  </div>
                </motion.div>

                {/* 3D Question Mark Bubble (Top Right) */}
                <motion.div
                  animate={{
                    y: [4, -5, 4],
                    scale: [1, 1.06, 1],
                  }}
                  transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
                  className="absolute top-4 -right-7 sm:-right-9 z-30"
                >
                  <div
                    className="w-11 h-11 rounded-full shadow-lg border border-white/40 flex items-center justify-center relative"
                    style={{
                      background: 'radial-gradient(circle at 35% 30%, #7660fc 0%, #5945F1 70%, #3e26cf 100%)',
                    }}
                  >
                    <span className="text-white font-extrabold text-base leading-none">?</span>
                    {/* Tail */}
                    <div
                      className="absolute -bottom-1 left-2 w-2.5 h-2.5 rotate-45"
                      style={{ background: '#5945F1' }}
                    />
                  </div>
                </motion.div>

                {/* 3D Purple Paper Plane (Bottom Left) */}
                <motion.div
                  animate={{
                    y: [5, -5, 5],
                    x: [-3, 3, -3],
                    rotate: [0, 5, 0],
                  }}
                  transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -bottom-7 -left-10 sm:-left-12 z-30"
                >
                  <svg
                    viewBox="0 0 54 54"
                    className="w-15 h-15 filter drop-shadow-[0_12px_18px_rgba(89,69,241,0.35)]"
                  >
                    {/* Left Wing */}
                    <polygon points="8,42 46,8 24,30" fill="#7f6efc" />
                    {/* Right Wing */}
                    <polygon points="24,30 46,8 32,46" fill="#5945F1" />
                    {/* Center Crease */}
                    <polygon points="24,30 26,38 32,46" fill="#3a22c5" />
                    {/* Highlights */}
                    <line x1="8" y1="42" x2="46" y2="8" stroke="#ffffff" strokeWidth="1.2" opacity="0.6" />
                  </svg>
                </motion.div>
              </motion.div>
            </div>
          </div>

          {/* RIGHT: Send Us a Message Card Form */}
          <div className="lg:col-span-6 flex justify-center lg:justify-start">
            <div className="w-full max-w-[480px] bg-[#f8f9fe] dark:bg-[#16063f]/60 rounded-3xl p-7 sm:p-9 border border-slate-100 dark:border-indigo-900/40 shadow-[0_4px_30px_rgba(89,69,241,0.05)]">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-6">
                Send Us a Message
              </h2>

              {isSubmitted ? (
                <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                    <Check className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Message Received!
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xs leading-relaxed">
                    Thank you for reaching out. We will review your inquiry and respond within 24 hours.
                  </p>
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="mt-2 text-xs font-semibold text-[#5945F1] hover:underline cursor-pointer"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  {/* Name Input */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                      Name<span className="text-red-500 ml-0.5">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter your name"
                      required
                      className="w-full px-4 py-3 bg-white dark:bg-[#100133] border border-slate-200 dark:border-indigo-900/60 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5945F1]/30 focus:border-[#5945F1] transition-all"
                    />
                  </div>

                  {/* Email Input */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                      Email<span className="text-red-500 ml-0.5">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Enter your email"
                      required
                      className="w-full px-4 py-3 bg-white dark:bg-[#100133] border border-slate-200 dark:border-indigo-900/60 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5945F1]/30 focus:border-[#5945F1] transition-all"
                    />
                  </div>

                  {/* Message Input */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                      Message<span className="text-red-500 ml-0.5">*</span>
                    </label>
                    <textarea
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Enter your message"
                      required
                      className="w-full px-4 py-3 bg-white dark:bg-[#100133] border border-slate-200 dark:border-indigo-900/60 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5945F1]/30 focus:border-[#5945F1] transition-all resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-6 rounded-xl bg-[#5945F1] hover:bg-[#4834df] active:scale-[0.99] text-white font-semibold text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 mt-2"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-0.5" />
                        Send Message
                      </>
                    )}
                  </button>

                  {/* Privacy Disclaimer */}
                  <p className="text-xs text-slate-500 dark:text-slate-400 text-center pt-2 leading-relaxed">
                    I understand that my data will be hold securely in accordance with the{' '}
                    <button
                      type="button"
                      onClick={() => onShowToast?.('Privacy policy: Your information is encrypted and never shared.')}
                      className="underline text-slate-600 dark:text-slate-300 hover:text-[#5945F1] transition-colors cursor-pointer"
                    >
                      privacy policy
                    </button>
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 3: "Got Questions?" FAQ ACCORDION SECTION
         ───────────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          {/* Left Column: Title, Subtitle, Category Pills */}
          <div className="lg:col-span-4 flex flex-col items-start">
            {/* Purple Circular Bullet */}
            <div className="w-5 h-5 rounded-full bg-[#5945F1] mb-3" />

            {/* Heading */}
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#5945F1] tracking-tight mb-2">
              Got Questions?
            </h2>

            {/* Subtitle */}
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-7 max-w-xs">
              Get answers to some of the most common questions.
            </p>

            {/* Vertical Category Filter Pills */}
            <div className="flex flex-col space-y-2.5 w-full">
              <button
                type="button"
                onClick={() => setSelectedCategory('most-asked')}
                className={`w-fit px-6 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer text-left ${
                  selectedCategory === 'most-asked'
                    ? 'bg-[#5945F1] text-white shadow-xs'
                    : 'bg-white dark:bg-[#16063f]/60 border border-slate-200 dark:border-indigo-900/60 text-slate-700 dark:text-slate-300 hover:border-[#5945F1]/50'
                }`}
              >
                Most Asked
              </button>

              <button
                type="button"
                onClick={() => setSelectedCategory('cashback')}
                className={`w-fit px-6 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer text-left ${
                  selectedCategory === 'cashback'
                    ? 'bg-[#5945F1] text-white shadow-xs'
                    : 'bg-white dark:bg-[#16063f]/60 border border-slate-200 dark:border-indigo-900/60 text-slate-700 dark:text-slate-300 hover:border-[#5945F1]/50'
                }`}
              >
                Cashback
              </button>

              <button
                type="button"
                onClick={() => setSelectedCategory('brokers')}
                className={`w-fit px-6 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer text-left ${
                  selectedCategory === 'brokers'
                    ? 'bg-[#5945F1] text-white shadow-xs'
                    : 'bg-white dark:bg-[#16063f]/60 border border-slate-200 dark:border-indigo-900/60 text-slate-700 dark:text-slate-300 hover:border-[#5945F1]/50'
                }`}
              >
                Brokers
              </button>

              <button
                type="button"
                onClick={() => setSelectedCategory('points')}
                className={`w-fit px-6 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer text-left ${
                  selectedCategory === 'points'
                    ? 'bg-[#5945F1] text-white shadow-xs'
                    : 'bg-white dark:bg-[#16063f]/60 border border-slate-200 dark:border-indigo-900/60 text-slate-700 dark:text-slate-300 hover:border-[#5945F1]/50'
                }`}
              >
                Points
              </button>
            </div>
          </div>

          {/* Right Column: Accordion Questions */}
          <div className="lg:col-span-8 flex flex-col justify-start">
            <div className="divide-y divide-slate-200/80 dark:divide-indigo-900/40">
              {filteredFaqs.map((faq) => {
                const isOpen = openFaqIds.includes(faq.id);
                return (
                  <div key={faq.id} className="py-4.5 sm:py-5 first:pt-0">
                    <button
                      type="button"
                      onClick={() => toggleFaq(faq.id)}
                      className="w-full flex items-center justify-between text-left group cursor-pointer"
                    >
                      <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-[#5945F1] transition-colors pr-6 leading-snug">
                        {faq.question}
                      </span>
                      <span className="shrink-0 w-7 h-7 flex items-center justify-center text-[#5945F1]">
                        {isOpen ? (
                          <Minus className="w-5 h-5 text-[#5945F1]" />
                        ) : (
                          <Plus className="w-5 h-5 text-[#5945F1]" />
                        )}
                      </span>
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          key={`content-${faq.id}`}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.25, ease: 'easeInOut' }}
                          className="overflow-hidden"
                        >
                          <p className="pt-3 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed pr-8">
                            {faq.answer}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

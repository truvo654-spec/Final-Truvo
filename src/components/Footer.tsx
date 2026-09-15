import React, { useState } from 'react';
import { X, Shield, Scale, FileText } from 'lucide-react';

export interface FooterProps {
  onNavigateToAbout?: () => void;
  onNavigateToPlan?: () => void;
  onNavigateToTab?: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigateToAbout,
  onNavigateToPlan: _onNavigateToPlan,
  onNavigateToTab,
}) => {
  const [activeModal, setActiveModal] = useState<'legal' | 'privacy' | 'terms' | null>(null);

  return (
    <>
      <footer className="w-full bg-white dark:bg-[#0c0422] border-t border-slate-200/80 dark:border-white/10 text-slate-700 dark:text-slate-300 py-8 sm:py-10 px-4 sm:px-8 md:px-[56px] transition-colors relative z-10">
        <div className="w-full">
          {/* Top Bar: Left (Logo + Email), Center (Navigation Links), Right (Social Icons) */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8">
            
            {/* Left: MarketSyde Logo + Email */}
            <div className="flex items-center gap-3 shrink-0">
              {/* Purple Circular Glyph with Swirl 'm' & Neon Lime Dot */}
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#5945F1] flex items-center justify-center relative shadow-xs shrink-0">
                <svg viewBox="0 0 32 32" className="w-5 h-5 fill-none">
                  <path
                    d="M 8 20 C 8 14.5, 9.5 11.5, 12 11.5 C 14 11.5, 15.5 13.5, 16.5 16 C 17.5 13.5, 19 11.5, 21 11.5 C 23 11.5, 24 14.5, 24 18.5"
                    stroke="white"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="24.5" cy="19.5" r="2.2" fill="#bef226" />
                </svg>
              </div>

              <a
                href="mailto:abc@MarketSyde.com"
                className="text-[#5945F1] font-medium text-sm sm:text-base hover:underline transition-all select-none"
              >
                abc@MarketSyde.com
              </a>
            </div>

            {/* Center: Navigation Links */}
            <nav className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200">
              <button
                onClick={() => {
                  if (onNavigateToAbout) onNavigateToAbout();
                  else if (onNavigateToTab) onNavigateToTab('about');
                }}
                className="hover:text-[#5945F1] transition-colors cursor-pointer"
              >
                About Us
              </button>

              <button
                onClick={() => onNavigateToTab?.('contact-us')}
                className="hover:text-[#5945F1] transition-colors cursor-pointer"
              >
                Contact Us
              </button>

              <button
                onClick={() => setActiveModal('legal')}
                className="hover:text-[#5945F1] transition-colors cursor-pointer"
              >
                Legal Notice
              </button>

              <button
                onClick={() => setActiveModal('privacy')}
                className="hover:text-[#5945F1] transition-colors cursor-pointer"
              >
                Privacy Policy
              </button>

              <button
                onClick={() => setActiveModal('terms')}
                className="hover:text-[#5945F1] transition-colors cursor-pointer"
              >
                Terms & Conditions
              </button>
            </nav>

            {/* Right: Social Media Icons (Facebook, Instagram, X, LINE) */}
            <div className="flex items-center gap-3 shrink-0">
              {/* Facebook */}
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-[#5945F1] hover:bg-[#4b39db] flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-xs text-white"
                title="Facebook"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>

              {/* Instagram */}
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-[#5945F1] hover:bg-[#4b39db] flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-xs text-white"
                title="Instagram"
              >
                <svg
                  className="w-4 h-4 fill-none stroke-current"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>

              {/* X / Twitter */}
              <a
                href="https://x.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-[#5945F1] hover:bg-[#4b39db] flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-xs text-white"
                title="X (Twitter)"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>

              {/* LINE */}
              <a
                href="https://line.me"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-[#5945F1] hover:bg-[#4b39db] flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-xs text-white"
                title="LINE"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19.365 9.864c0-4.343-4.429-7.864-9.865-7.864s-9.865 3.521-9.865 7.864c0 3.887 3.501 7.15 8.243 7.765.321.069.757.213.867.489.1.25.065.641.032.894l-.141.851c-.043.26-.201 1.018.892.555 1.092-.463 5.897-3.473 8.046-5.945 1.251-1.393 1.791-2.909 1.791-4.609zm-13.81 2.373h-1.632a.586.586 0 0 1-.586-.586v-3.556a.586.586 0 0 1 .586-.586h1.632a.586.586 0 1 1 0 1.172h-1.046v.606h1.046a.586.586 0 1 1 0 1.172h-1.046v.606h1.046a.586.586 0 1 1 0 1.172zm3.323 0h-1.632a.586.586 0 0 1-.586-.586v-3.556a.586.586 0 0 1 1.172 0v2.97h1.046a.586.586 0 1 1 0 1.172zm2.748 0h-.586a.586.586 0 0 1-.586-.586v-3.556a.586.586 0 0 1 1.172 0v3.556a.586.586 0 0 1-.586.586zm4.184 0h-.586a.586.586 0 0 1-.497-.276l-1.611-2.348v2.038a.586.586 0 0 1-1.172 0v-3.556a.586.586 0 0 1 .983-.414l1.696 2.473v-2.059a.586.586 0 1 1 1.172 0v3.556a.586.586 0 0 1-.586.586z" />
                </svg>
              </a>
            </div>

          </div>

          {/* Full-width Divider */}
          <div className="w-full border-t border-slate-200/80 dark:border-white/10 my-7" />

          {/* Bottom Section: Centered Disclaimer & Copyright matching reference */}
          <div className="w-full max-w-4xl mx-auto text-center space-y-3">
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
              By using this website, you agree to be bound by MarketSyde's Terms & Conditions, which may be updated at any time without prior notice. Continued use of the site signifies your acceptance of all current terms, including any revisions. All content is provided for informational purposes only and may be changed or removed at our discretion. If you do not agree with these terms, please discontinue use of the website.
            </p>

            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium">
              © 2026 MarketSyde. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Policy and Legal Modals */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#12092b] border border-slate-200 dark:border-white/10 rounded-2xl max-w-xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 dark:border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-white/10 flex items-center justify-center text-[#5945F1]">
                  {activeModal === 'legal' && <Scale className="w-5 h-5" />}
                  {activeModal === 'privacy' && <Shield className="w-5 h-5" />}
                  {activeModal === 'terms' && <FileText className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    {activeModal === 'legal' && 'Legal Notice'}
                    {activeModal === 'privacy' && 'Privacy Policy'}
                    {activeModal === 'terms' && 'Terms & Conditions'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    MarketSyde Institutional Services
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {activeModal === 'legal' && (
                <>
                  <p>
                    <strong>Risk Disclosure:</strong> Trading foreign exchange, CFDs, and digital assets on margin carries a high level of risk and may not be suitable for all investors. The high degree of leverage can work against you as well as for you.
                  </p>
                  <p>
                    Before deciding to trade forex or any financial instruments, you should carefully consider your investment objectives, level of experience, and risk appetite. MarketSyde does not provide investment or financial advice.
                  </p>
                  <p>
                    All cashback rebates, points calculations, and broker spread benchmarks are delivered strictly for informational and analytical convenience.
                  </p>
                </>
              )}

              {activeModal === 'privacy' && (
                <>
                  <p>
                    <strong>Data Encryption & Security:</strong> We enforce bank-grade TLS 1.3 encryption for all data transmissions. Your broker read-only trading credentials and investor passwords are never exposed or shared with third parties.
                  </p>
                  <p>
                    <strong>Account Information:</strong> We store minimal profile credentials required to track trading volumes and calculate eligible rebate distributions. You retain full rights to export or delete your profile data at any time.
                  </p>
                  <p>
                    <strong>Zero Data Selling:</strong> MarketSyde does not sell, rent, or lease customer data to brokers, advertisers, or third-party marketers.
                  </p>
                </>
              )}

              {activeModal === 'terms' && (
                <>
                  <p>
                    <strong>1. Acceptance of Terms:</strong> By creating an account or accessing the MarketSyde platform, you agree to comply with and be legally bound by these terms.
                  </p>
                  <p>
                    <strong>2. Cash Rebates & Points Program:</strong> Rebate calculations are calculated based on verifiable lot execution reports supplied by affiliated regulated partner brokers. Syde Points and Level perks are governed by platform community rules and may be updated periodically.
                  </p>
                  <p>
                    <strong>3. Platform Availability:</strong> We strive to maintain continuous uptime but are not liable for transient broker feed interruptions or market latency beyond our infrastructure.
                  </p>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-white/5 flex justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 bg-[#5945F1] hover:bg-[#4b39db] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};


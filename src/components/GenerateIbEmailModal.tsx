import React, { useState } from 'react';
import { X, Copy, Check, Mail, ExternalLink, ShieldCheck } from 'lucide-react';
import { Broker } from '../types';

interface GenerateIbEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  broker: Broker;
  partnerCode: string;
  scenarioType?: 'single_ib' | 'restricted_ib';
  onShowToast?: (msg: string) => void;
}

export const GenerateIbEmailModal: React.FC<GenerateIbEmailModalProps> = ({
  isOpen,
  onClose,
  broker,
  partnerCode,
  scenarioType = 'single_ib',
  onShowToast,
}) => {
  const [accountNumber, setAccountNumber] = useState('11004829');
  const [fullName, setFullName] = useState('Josh Miller');
  const [registeredEmail, setRegisteredEmail] = useState('josh.trader@example.com');
  const [copiedSubject, setCopiedSubject] = useState(false);
  const [copiedBody, setCopiedBody] = useState(false);

  if (!isOpen) return null;

  const brokerSupportEmail = `support@${broker.name.toLowerCase().replace(/\s+/g, '')}.com`;

  const emailSubject = `Request to transfer trading account #${accountNumber || 'XXXXXX'} under IB Partner MarketSyde (ID: ${partnerCode})`;

  const emailBody = `Dear ${broker.name} Support Team,

I would like to request to transfer/link my trading account under the Introducing Broker (IB) partner MarketSyde.

Account Details:
• Full Name: ${fullName}
• Trading Account Number: ${accountNumber}
• Registered Email: ${registeredEmail}
• New IB Partner Code: ${partnerCode}
• IB Partner Name: MarketSyde

Please confirm once my trading account has been successfully linked to the requested IB partner so I can start tracking my cashback.

Thank you for your support,
${fullName}`;

  const handleCopySubject = () => {
    navigator.clipboard.writeText(emailSubject);
    setCopiedSubject(true);
    onShowToast?.('Email Subject copied to clipboard!');
    setTimeout(() => setCopiedSubject(false), 2000);
  };

  const handleCopyBody = () => {
    navigator.clipboard.writeText(emailBody);
    setCopiedBody(true);
    onShowToast?.('Email Body drafted template copied to clipboard!');
    setTimeout(() => setCopiedBody(false), 2000);
  };

  const handleCopyAll = () => {
    const fullText = `To: ${brokerSupportEmail}\nSubject: ${emailSubject}\n\n${emailBody}`;
    navigator.clipboard.writeText(fullText);
    setCopiedBody(true);
    onShowToast?.('Full email draft copied to clipboard!');
    setTimeout(() => setCopiedBody(false), 2000);
  };

  const mailtoLink = `mailto:${brokerSupportEmail}?subject=${encodeURIComponent(
    emailSubject
  )}&body=${encodeURIComponent(emailBody)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-white dark:bg-[#120d2b] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#5338ec] text-white flex items-center justify-center font-bold text-sm shadow-2xs">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display text-base font-black text-[#0b1c30] dark:text-white">
                Generate IB Transfer Request Email
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {scenarioType === 'restricted_ib' ? 'Restricted IB Policy' : 'Single-IB Transfer'} • {broker.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto">
          {/* Instructions banner */}
          <div className="p-3.5 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 text-xs text-slate-700 dark:text-slate-300 leading-relaxed flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#5338ec] shrink-0 mt-0.5" />
            <span>
              Fill in your account details below. We will instantly draft the exact IB transfer email required by{' '}
              <strong>{broker.name}</strong>. Copy and send this from your broker-registered email address.
            </span>
          </div>

          {/* Form Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Trading Account Number
              </label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="e.g. 11004829"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono text-slate-800 dark:text-white focus:outline-hidden focus:border-[#5338ec]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Full Name (on Broker)
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Josh Miller"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-white focus:outline-hidden focus:border-[#5338ec]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Broker Registered Email
              </label>
              <input
                type="email"
                value={registeredEmail}
                onChange={(e) => setRegisteredEmail(e.target.value)}
                placeholder="josh.trader@example.com"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-white focus:outline-hidden focus:border-[#5338ec]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                MarketSyde Partner Code
              </label>
              <input
                type="text"
                readOnly
                value={partnerCode}
                className="w-full px-3 py-2 rounded-xl border border-indigo-200 dark:border-slate-700 bg-indigo-50/50 dark:bg-slate-800 text-xs font-mono font-bold text-[#5338ec] dark:text-indigo-400 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Email Preview */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Drafted Email Template:
              </span>
              <button
                type="button"
                onClick={handleCopyAll}
                className="text-xs font-bold text-[#5338ec] hover:underline flex items-center gap-1 cursor-pointer"
              >
                {copiedBody ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy Full Email</span>
              </button>
            </div>

            {/* Recipient & Subject Box */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-slate-400 font-medium">To: </span>
                  <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                    {brokerSupportEmail}
                  </span>
                </div>
              </div>
              <div className="flex items-start justify-between gap-2 pt-1 border-t border-slate-200/70 dark:border-slate-800">
                <div className="flex-1">
                  <span className="text-slate-400 font-medium">Subject: </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {emailSubject}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopySubject}
                  className="text-slate-400 hover:text-[#5338ec] p-1 shrink-0 transition-colors"
                  title="Copy Subject"
                >
                  {copiedSubject ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Body Box */}
            <div className="relative rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 font-mono text-[11px] leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line">
              {emailBody}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50">
          <span className="text-[11px] text-slate-400">
            Average response time: 2–3 business days
          </span>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <a
              href={mailtoLink}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-[#5338ec] hover:bg-[#4326d8] text-white text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open in Email App</span>
            </a>
            <button
              type="button"
              onClick={handleCopyAll}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Copy Text
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

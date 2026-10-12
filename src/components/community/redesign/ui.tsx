import React from 'react';
import { BadgeCheck, ChevronLeft, ChevronRight } from 'lucide-react';

export type PreviewState = 'default' | 'empty' | 'error' | 'signed-out';

export const BORDER = 'border-[#d0cbfb]';

export const Card: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = '', children }) => (
  <div className={`bg-white border ${BORDER} rounded-lg ${className}`}>{children}</div>
);

export const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <h3 className={`text-[18.5px] leading-6 font-medium text-[#5945F1] ${className}`}>{children}</h3>
);

export const Verified: React.FC<{ className?: string }> = ({ className = '' }) => (
  <BadgeCheck className={`w-6 h-6 -my-0.5 text-white fill-[#5945F1] shrink-0 ${className}`} aria-label="Verified" />
);

export const Avatar: React.FC<{ src: string; alt: string; size?: number; ring?: boolean }> = ({ src, alt, size = 36, ring }) => (
  <img src={src} alt={alt} width={size} height={size} style={{ width: size, height: size }} className={`rounded-full object-cover shrink-0 ${ring ? 'ring-2 ring-[#5945F1]' : ''}`} />
);

export const EmptyState: React.FC<{
  image: string;
  title: string;
  text: string;
  error?: boolean;
  className?: string;
  imgClass?: string;
  action?: { label: string; onClick: () => void; icon?: React.ReactNode };
}> = ({ image, title, text, error, className = '', imgClass = 'w-[172px]', action }) => (
  <div className={`flex flex-col items-center justify-center text-center px-6 ${className}`} role={error ? 'alert' : 'status'}>
    <img src={image} alt="" className={`${imgClass} h-auto`} />
    <p className="mt-4 text-[17px] leading-6 font-medium text-[#9a1cc8]">{title}</p>
    <p className="text-xs leading-4 text-[#6b7280] mt-2">{text}</p>
    {action && (
      <button type="button" onClick={action.onClick} className="mt-5 inline-flex items-center gap-2 h-10 px-5 rounded-lg bg-[#5945F1] hover:bg-[#4a38d6] text-white text-[15px] font-medium transition-colors">
        {action.icon}{action.label}
      </button>
    )}
  </div>
);

export const OutlineButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ className = '', children, ...rest }) => (
  <button type="button" {...rest} className={`border ${BORDER} text-[#5945F1] hover:bg-[#EEF0FE] rounded-lg text-xs font-semibold px-3 py-1.5 transition-colors ${className}`}>{children}</button>
);

export const PrimaryButton = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(({ className = '', children, ...rest }, ref) => (
  <button ref={ref} type="button" {...rest} className={`bg-[#5945F1] hover:bg-[#4a38d6] text-white rounded-lg text-sm font-semibold px-4 py-2 transition-colors disabled:opacity-40 ${className}`}>{children}</button>
));
PrimaryButton.displayName = 'PrimaryButton';

/** Small dot pager used by the carousels in the sidebars (matches the design: chevrons + 2 dots). */
export const Dots: React.FC<{ count: number; index: number; onChange: (i: number) => void; className?: string }> = ({ count, index, onChange, className = '' }) => (
  <div className={`flex items-center justify-center gap-1.5 ${className}`}>
    <button type="button" aria-label="Previous" disabled={index === 0} onClick={() => onChange(index - 1)} className="p-0.5 text-[#111827] disabled:text-[#9ca3af] disabled:cursor-default"><ChevronLeft className="w-3.5 h-3.5" strokeWidth={2.5} /></button>
    {Array.from({ length: count }, (_, i) => (
      <button key={i} type="button" aria-label={`Slide ${i + 1}`} aria-current={i === index} onClick={() => onChange(i)} className={`w-2 h-2 rounded-full ${i === index ? 'bg-[#5945F1]' : 'bg-[#c9c4fb]'}`} />
    ))}
    <button type="button" aria-label="Next" disabled={index === count - 1} onClick={() => onChange(index + 1)} className="p-0.5 text-[#111827] disabled:text-[#9ca3af] disabled:cursor-default"><ChevronRight className="w-3.5 h-3.5" strokeWidth={2.5} /></button>
  </div>
);

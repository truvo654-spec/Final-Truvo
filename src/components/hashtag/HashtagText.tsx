import React from 'react';
import { openHashtag } from '../../lib/hashtagNav';

/** A clickable #tag that opens the hashtag page. */
export const HashtagLink: React.FC<{ tag: string; className?: string; children?: React.ReactNode }> = ({ tag, className = '', children }) => (
  <span
    role="link"
    tabIndex={0}
    onClick={(e) => {
      e.stopPropagation();
      openHashtag(tag);
    }}
    onKeyDown={(e) => {
      if (e.key === 'Enter') {
        e.stopPropagation();
        openHashtag(tag);
      }
    }}
    className={`cursor-pointer hover:underline ${className}`}
  >
    {children ?? (tag.startsWith('#') ? tag : `#${tag}`)}
  </span>
);

/** Plain text where every #hashtag becomes a link. */
export const HashtagText: React.FC<{ text: string; linkClassName?: string }> = ({ text, linkClassName = 'text-[#5338ec] font-semibold' }) => {
  const parts = text.split(/(#[A-Za-z][A-Za-z0-9_]*)/g);
  return (
    <>
      {parts.map((part, i) =>
        /^#[A-Za-z][A-Za-z0-9_]*$/.test(part) ? <HashtagLink key={i} tag={part} className={linkClassName} /> : <React.Fragment key={i}>{part}</React.Fragment>
      )}
    </>
  );
};

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CopyTone, COPY_TONES, ToneCopy } from '../data/copyTones';

interface ToneContextValue {
  tone: CopyTone;
  setTone: (tone: CopyTone) => void;
  copy: ToneCopy;
}

const ToneContext = createContext<ToneContextValue | undefined>(undefined);

const STORAGE_KEY = 'marketsyde_copy_tone';

export const ToneProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tone, setToneState] = useState<CopyTone>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'default' || saved === 'cheekyGamer') return saved;
    } catch {}
    return 'default';
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, tone);
    } catch {}
  }, [tone]);

  const setTone = (t: CopyTone) => setToneState(t);

  return (
    <ToneContext.Provider value={{ tone, setTone, copy: COPY_TONES[tone] }}>
      {children}
    </ToneContext.Provider>
  );
};

// Falls back to the 'default' tone if used outside the provider, so this
// hook is always safe to call even before the provider is wired up everywhere.
export function useTone(): ToneContextValue {
  const ctx = useContext(ToneContext);
  if (ctx) return ctx;
  return { tone: 'default', setTone: () => {}, copy: COPY_TONES.default };
}

import { useEffect, useState } from 'react';
import { isCustomTradingRule } from './customTradingRule';
const sandbox = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('journalTest') === '1';
export const journalSandbox = sandbox;
const prefix = sandbox ? 'ms-journal-test-v2-' : 'ms-journal-v2-';
// Use before an import dialog unmounts; its effects cannot save newly queued history.
export function saveJournalValue(name:string,value:unknown) { try { localStorage.setItem(prefix+name,JSON.stringify(value)); return true; } catch { return false; } }
export function saveJournalValues(values: readonly (readonly [string, unknown])[]) {
  const previous = new Map<string, string | null>();
  try {
    for (const [name] of values) previous.set(name, localStorage.getItem(prefix + name));
    for (const [name, value] of values) localStorage.setItem(prefix + name, JSON.stringify(value));
    return true;
  } catch {
    for (const [name, value] of previous) {
      try {
        if (value === null) localStorage.removeItem(prefix + name);
        else localStorage.setItem(prefix + name, value);
      } catch {
        // The caller reports the failure; rollback is best-effort while storage is unavailable.
      }
    }
    return false;
  }
}
export function useJournalState<T>(name: string, initial: T) {
  const [loaded] = useState(()=>{try{
    const raw=localStorage.getItem(prefix+name);if(!raw)return {value:initial,failed:false};
    const parsed=JSON.parse(raw);
    if(parsed==null || Array.isArray(initial)!==Array.isArray(parsed) || typeof parsed!==typeof initial)throw Error('Invalid saved state');
    if(name==='TradingJournalPage-rules' && !['maxRisk','maxDailyLoss','maxTrades','stopAfterLosses'].every(key=>typeof parsed[key]==='number'&&Number.isFinite(parsed[key])&&parsed[key]>=0))throw Error('Invalid trading rule defaults');
    if(name==='entries' && !parsed.every((e:any)=>e && typeof e.id==='string' && typeof e.symbol==='string' && typeof e.date==='string' && Number.isFinite(e.pnl) && Array.isArray(e.tags) && Array.isArray(e.mistakes) && Array.isArray(e.checklistDone) && typeof e.lessons==='string'))throw Error('Invalid journal records');
    if(name==='TradingJournalPage-customRules' && !parsed.every(isCustomTradingRule))throw Error('Invalid custom trading rules');
    if(name==='tab' && !['overview','entries','insights','playbook','backtest','review'].includes(parsed))throw Error('Unknown journal tab');
    return {value:parsed as T,failed:false};
  }catch{return {value:initial,failed:true};}});
  const readFailed=loaded.failed;
  const [value, setValue] = useState<T>(loaded.value);
  const [failed, setFailed] = useState(readFailed);
  useEffect(() => { if (readFailed) return; try { localStorage.setItem(prefix+name,JSON.stringify(value)); setFailed(false); } catch { setFailed(true); } },[value,name,readFailed]);
  return [value,setValue,failed] as const;
}

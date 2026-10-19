import { journalSandbox, saveStorageBatch } from './journalStorage';
import { validPracticeDraft } from '../../backtest/practiceDraft';

const journalNames=['entries','playbooks','checklist','TradingJournalPage-rules','daily-notes','weekly','imports'] as const;
const backtestNames=['runs','replay','whatif','expected','practice_draft','practice_filters'] as const;
const keys:Record<string,string>=Object.fromEntries([
  ...journalNames.map(name=>[name,`${journalSandbox?'ms-journal-test-v2-':'ms-journal-v2-'}${name}`]),
  ...backtestNames.map(name=>[`backtest:${name}`,`ms_backtest_${journalSandbox?'test_':''}${name}_v1`]),
]);
export interface JournalBackup { format:'marketsyde-journal'; version:1; createdAt:string; values:Record<string,string|null> }
const object=(v:unknown):v is Record<string,unknown>=>!!v && typeof v==='object' && !Array.isArray(v);
const textList=(v:unknown)=>Array.isArray(v) && v.every(item=>typeof item==='string');
export function parseJournalBackup(text:string):JournalBackup {
  const value:unknown=JSON.parse(text);
  if (!object(value) || value.format!=='marketsyde-journal' || value.version!==1 || typeof value.createdAt!=='string' || !object(value.values)) throw Error('Unsupported journal backup format/version.');
  const values:Record<string,string|null>={};
  for (const [name,raw] of Object.entries(value.values)) {
    if (!Object.prototype.hasOwnProperty.call(keys,name) || (raw!==null && typeof raw!=='string')) throw Error(`Unsupported backup field: ${name}`);
    const serialized=typeof raw==='string'?raw:null;
    if (serialized!==null) {
      const data:unknown=JSON.parse(serialized);
      if (name==='entries' && (!Array.isArray(data) || !data.every(e=>object(e) &&
        ['id','symbol','date','strategy','lessons','setupNotes'].every(k=>typeof e[k]==='string') &&
        ['entryPrice','size','pnl'].every(k=>typeof e[k]==='number' && Number.isFinite(e[k])) &&
        textList(e.tags) && textList(e.mistakes) && textList(e.checklistDone)))) throw Error('Backup has invalid journal records.');
      if (name==='playbooks' && (!Array.isArray(data) || !data.every(p=>object(p) &&
        ['id','name','thesis','entryTrigger','stopRule','targetRule','style','status','grade','createdAt'].every(k=>typeof p[k]==='string') &&
        Array.isArray(p.rules) && p.rules.every(r=>object(r) && ['id','title','detail'].every(k=>typeof r[k]==='string')) &&
        textList(p.tags) && textList(p.markets)))) throw Error('Backup has invalid playbooks.');
      if (name==='checklist' && (!Array.isArray(data) || !data.every(c=>object(c) && typeof c.id==='string' && typeof c.label==='string'))) throw Error('Backup has invalid checklist items.');
      if (['weekly','imports','backtest:runs','backtest:replay','backtest:whatif','backtest:practice_filters'].includes(name) && !Array.isArray(data)) throw Error(`Backup has invalid ${name}.`);
      if (name==='backtest:practice_draft' && !validPracticeDraft(data)) throw Error('Backup has an unsupported or invalid practice draft.');
      if (name==='backtest:runs' && Array.isArray(data) && !data.every(r=>object(r) && typeof r.id==='string' && object(r.settings) && object(r.output) && object(r.output.result) && Array.isArray(r.output.result.trades))) throw Error('Backup has invalid saved runs.');
      if (name==='backtest:replay' && Array.isArray(data) && !data.every(s=>object(s) && typeof s.id==='string' && Array.isArray(s.trades))) throw Error('Backup has invalid practice sessions.');
      if (['TradingJournalPage-rules','daily-notes','backtest:expected'].includes(name) && !object(data)) throw Error(`Backup has invalid ${name}.`);
    }
    values[name]=serialized;
  }
  if (!values.entries || !values.playbooks) throw Error('Backup must contain journal records and playbooks.');
  if (Object.keys(values).length!==Object.keys(keys).length) throw Error('Backup is incomplete. Restore requires the full versioned data set.');
  return {format:'marketsyde-journal',version:1,createdAt:value.createdAt,values};
}
export function createJournalBackup():JournalBackup {
  const backup={format:'marketsyde-journal' as const,version:1 as const,createdAt:new Date().toISOString(),
    values:Object.fromEntries(Object.entries(keys).map(([name,key])=>[name,localStorage.getItem(key)]))};
  return parseJournalBackup(JSON.stringify(backup));
}
export const restoreJournalBackup=(backup:JournalBackup)=> {
  const checked=parseJournalBackup(JSON.stringify(backup));
  return saveStorageBatch(Object.fromEntries(Object.entries(checked.values).map(([name,raw])=>[keys[name],raw])));
};

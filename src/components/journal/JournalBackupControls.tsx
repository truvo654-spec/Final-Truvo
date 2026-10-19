import React, { useState } from 'react';
import { createJournalBackup, parseJournalBackup, restoreJournalBackup, type JournalBackup } from './journalBackup';

export function JournalBackupControls({onToast}:{onToast:(message:string)=>void}) {
  const [pending,setPending]=useState<JournalBackup|null>(null);
  const [error,setError]=useState('');
  const download=()=>{
    try {
      const backup=createJournalBackup();
      const url=URL.createObjectURL(new Blob([JSON.stringify(backup)],{type:'application/json'}));
      const link=document.createElement('a');link.href=url;link.download=`journal-backup-${backup.createdAt.slice(0,10)}.json`;link.click();
      setTimeout(()=>URL.revokeObjectURL(url),1000);setError('');
    } catch (err) {setError(err instanceof Error?err.message:'Backup could not be exported.');}
  };
  return <section aria-label="Journal backup" className="text-xs mb-4 space-y-2">
    <div className="flex flex-wrap items-center gap-3"><button type="button" className="font-semibold text-[#5338ec] underline" onClick={download}>Download full Journal Backup</button>
      <label className="cursor-pointer font-semibold text-[#5338ec] underline">Restore Journal Backup<input type="file" className="sr-only" accept="application/json,.json" aria-label="Restore Journal Backup" onChange={async event=>{
        const file=event.target.files?.[0];event.target.value='';if(!file)return;
        try {if(file.size>50*1024*1024)throw Error('Backup exceeds 50 MB. Restore a smaller backup.');setPending(parseJournalBackup(await file.text()));setError('');}
        catch(err){setPending(null);setError(err instanceof Error?err.message:'Backup could not be read.');}
      }}/></label>
      <span className="text-slate-500">Lossless local records, reviews, images, playbooks, saved experiments and Practice draft. No login, credits or access unlocks.</span>
    </div>
    {error && <p role="alert" className="text-rose-700">{error}</p>}
    {pending && <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-3 space-y-2">
      <p>Restore the backup from {pending.createdAt}? This <strong>replaces</strong> the local journal and saved experiments, not just the visible account. Download your current backup first. Filters, login, credits and access remain unchanged.</p>
      <button type="button" className="font-bold text-rose-700 mr-4" onClick={()=>{
        try {
          if (!restoreJournalBackup(pending)) {setError('Restore failed. Recovery of previous data was attempted but cannot be guaranteed while storage is failing. Keep your backup and free storage before retrying.');return;}
          onToast('Journal backup restored. Reloading to apply every saved data set.');window.location.reload();
        } catch(err){setError(err instanceof Error?err.message:'Restore failed.');}
      }}>Replace local journal and reload</button>
      <button type="button" className="font-semibold" onClick={()=>setPending(null)}>Cancel restore</button>
    </div>}
  </section>;
}

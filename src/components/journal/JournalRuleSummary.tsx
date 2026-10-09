import React from 'react';
import type { JournalEntry } from '../../types';
import type { JournalPlaybook } from '../../data/journalPlaybooks';
export const JournalRuleSummary:React.FC<{entries:JournalEntry[];playbooks:JournalPlaybook[];onDrill:(ids:string[],label:string)=>void}>=({entries,playbooks,onDrill})=><section className="bg-white border border-slate-200 rounded-2xl p-5 mt-5">
  <h3 className="text-sm font-bold">Per-rule evidence · selected scope</h3>
  <p className="text-xs text-slate-500 mt-1">Historical snapshots stay attached to each reviewed trade. Missing answers are unknown, not followed. Unversioned legacy records appear under current rules only, not every historical version. Counts include all trading statuses; performance statistics use eligible closed trades only.</p>
  <details className="mt-3 text-xs"><summary className="cursor-pointer font-semibold">Historical rule definitions</summary>{playbooks.filter(pb=>pb.ruleHistory?.length).map(pb=><div key={pb.id} className="mt-2"><b>{pb.name}</b>{pb.ruleHistory!.map(h=><p key={h.version}>Version {h.version} · effective date {h.effectiveAt || 'unknown (legacy)'} · {h.rules.map(r=>r.title).join(' · ')}</p>)}</div>)}<p className="mt-2 text-slate-500">Versions are retained when a rule definition changes; legacy effective dates are not invented.</p></details>
  <div className="overflow-x-auto"><table className="w-full text-xs mt-3"><thead><tr>{['Playbook / rule version','Followed','Broken','Unknown','Not applicable'].map(h=><th key={h} className="text-left p-2">{h}</th>)}</tr></thead><tbody>{playbooks.flatMap(pb=>{
    const trades=entries.filter(e=>e.strategy===pb.name);
    if(!trades.length)return [];
    const current=JSON.stringify(pb.rules);
    const versions=new Map<string,{label:string;version:string;ruleId:string}>();
    trades.forEach(e=>e.ruleEvidence?.forEach(r=>versions.set(`${r.version}|${r.ruleId}`,r)));
    pb.rules.forEach(r=>{if(!versions.has(`${current}|${r.id}`))versions.set(`${current}|${r.id}`,{label:r.title,version:current,ruleId:r.id});});
    const versionIds=[...new Set([...versions.values()].map(r=>r.version))];
    return [...versions.values()].map((r,i)=>{
      const lists={pass:[] as string[],fail:[] as string[],unknown:[] as string[],not_applicable:[] as string[]};
      trades.forEach(e=>{const answer=e.ruleEvidence?.find(x=>x.ruleId===r.ruleId && x.version===r.version);if(answer)lists[answer.state].push(e.id);else if(!e.ruleEvidence && r.version===current)lists.unknown.push(e.id);});
      return <tr key={`${pb.id}-${r.version}-${r.ruleId}`} className="border-t border-slate-100"><td className="p-2">{pb.name} · {r.label}<span className="block text-slate-500">{r.version===current?'Current rule definition':`Historical snapshot ${versionIds.indexOf(r.version)+1}`}</span></td>{(['pass','fail','unknown','not_applicable'] as const).map(state=><td key={state} className="p-2"><button disabled={!lists[state].length} className="text-[#5338ec] underline disabled:text-slate-400" onClick={()=>onDrill(lists[state],`${pb.name} · ${r.label} · ${state}`)}>{lists[state].length}</button></td>)}</tr>;
    });
  })}</tbody></table></div>
</section>;

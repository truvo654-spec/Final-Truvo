const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({viewport:{width:1280,height:900}}); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto('file://' + require('path').resolve(__dirname, '../harness.html') + '');
  const r = await p.evaluate(() => {
    const out = {};
    T.render();
    const sims = T.ACC.filter(a => a.sim);
    out.sims = sims.map(a => { const ps = T.POS.filter(x => x.a === a.id); const pl = Math.round(ps.reduce((s,x)=>s+x.pl,0)*100)/100, mu = Math.round(ps.reduce((s,x)=>s+x.m,0)*100)/100;
      return { id:a.id, nick:a.nick, ins: ps.map(x=>x.ins+' '+x.side+' '+x.lots+' en '+x.en+' pl '+x.pl+' usd '+x.usd+' m '+x.m).join(' | '), bal:a.bal, eq:a.eq, pl:a.pl, mu:a.mu, okPl: pl===a.pl, okEq: Math.abs(a.bal+a.pl-a.eq)<0.01, okMu: mu===a.mu, eqLast: T.EQX[a.id] && T.EQX[a.id][30]===a.eq }; });
    out.pep = !!T.BM.Pepperstone && T.BR.some(x=>x.id==='Pepperstone');
    const m = T.manage(); out.undef = /undefined/.test(m);
    // portfolios scope: pick hfm only, holdings
    T.S.tab='portfolios'; T.S.mon.view='tiles'; T.H7.pview(null,'positions'); T.S.scope='a:hfm'; T.render(); T.H7.pvt(null,'holdings');
    const el = T.root.querySelector('[data-pvt-body] [data-hold-ids]'); out.pfHold = el ? el.getAttribute('data-hold-ids') : 'none';
    T.S.scope='all'; T.S.pfDir='short'; T.render(); const el2 = T.root.querySelector('[data-pvt-body] [data-hold-ids]'); out.pfHoldSell = el2 ? el2.getAttribute('data-hold-ids') : 'none';
    out.posRestored = T.POS.length;
    return out;
  });
  console.log(JSON.stringify(r, null, 1)); console.log('errors', errs);
  await b.close();
})();

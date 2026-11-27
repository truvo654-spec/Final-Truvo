const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({viewport:{width:1280,height:900}}); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto('file://' + require('path').resolve(__dirname, '../harness.html') + '');
  const r = await p.evaluate(() => {
    T.render(); const o = {}; const C = T.CLOSED;
    o.total = C.length; o.gen = C.filter(c=>c.g31).length;
    o.sorted = C.every((c,i)=> i===0 || C[i-1].day >= c.day);
    o.xmMax = Math.max(...C.filter(c=>c.a==='xm').map(c=>c.day)); o.ic2 = C.filter(c=>c.a==='ic2').length;
    o.gaps = [];
    T.ACC.filter(a=>a.status!=='none').forEach(a => { ['Buy','Sell'].forEach(sd => { [7,31].forEach(w => { const last = a.status==='stale'?27:30; const n = C.filter(c=>c.a===a.id && c.side===sd && c.day > 30-w).length; if (!n) o.gaps.push(a.id+' '+sd+' '+w+'d'); }); }); });
    o.perAcc = T.ACC.map(a=>a.id+':'+C.filter(c=>c.a===a.id).length+' net '+Math.round(C.filter(c=>c.a===a.id).reduce((s,c)=>s+c.pl,0))).join(', ');
    o.sample = C.filter(c=>c.g31).slice(0,4).map(c=>[c.day,c.t,c.a,c.ins,c.side,c.lots,c.en,c.ex,c.pl].join(' '));
    o.keys = Object.keys(C.filter(c=>!c.g31)[0]).filter(k=>!(k in C.filter(c=>c.g31)[0]));
    return o;
  });
  console.log(JSON.stringify(r,null,1)); console.log('errors', errs); await b.close();
})();

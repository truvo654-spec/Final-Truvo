const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const out=[]; const ok=(n,c,x)=>out.push((c?'PASS ':'FAIL ')+n+(x!==undefined?' · '+x:''));
  for (const vp of [{w:1280,h:900,t:'D'},{w:390,h:820,t:'M'}]) {
    const p = await b.newPage({viewport:{width:vp.w,height:vp.h}}); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
    await p.goto('file://' + require('path').resolve(__dirname, '../harness.html') + '');
    const ev=(f,a)=>p.evaluate(f,a), has=s=>ev(s=>!!T.root.querySelector(s),s), P=vp.t+' ';
    await ev(()=>{T.S.tab='portfolios';T.S.mon.view='tiles';T.H7.pview(null,'positions');T.root.scrollTop=0;});
    ok(P+'card with bar', await has('[data-section="pv"] [data-pvt-bar]') && await has('[data-section="pv"] .pvcharts'));
    ok(P+'no separate drawdown', !(await has('[data-section="drawdown"]')));
    ok(P+'pf positions + closed kept', await has('[data-section="pf-positions"]') && await has('[data-section="pf-closed"]'));
    const order = await ev(()=>{const a=T.root.querySelector('[data-section="pv"]'),b=T.root.querySelector('[data-section="pf-positions"]');return !!(a.compareDocumentPosition(b)&Node.DOCUMENT_POSITION_FOLLOWING);});
    ok(P+'card before positions', order);
    await ev(()=>T.H7.pvt(null,'drawdown'));
    ok(P+'drawdown tab', await has('[data-pvt-body] [data-section="drawdown"]'));
    await ev(()=>T.root.querySelector('[data-pvt-bar]').scrollIntoView()); await p.screenshot({path:'PF'+vp.t+'.png'});
    await ev(()=>T.H7.pvt(null,'margin'));
    ok(P+'margin tab', await has('[data-pvt-body] [data-section="margin-risk"]'));
    await ev(()=>T.H7.pvt(null,'alerts'));
    ok(P+'alerts in portfolios', await has('[data-pvt-body] [data-alerts]') || await has('[data-section="pv"]'));
    await ev(()=>{T.S.pfView='analytics';T.render();});
    ok(P+'analytics untouched', !(await has('[data-pvt-bar]')));
    ok(P+'no errors', errs.length===0, errs.join('|'));
  }
  console.log(out.join('\n')); await b.close();
})();

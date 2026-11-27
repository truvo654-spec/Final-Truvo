const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({viewport:{width:1280,height:900}}); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto('file://' + require('path').resolve(__dirname, '../harness.html') + '');
  const ev=(f,a)=>p.evaluate(f,a); const out=[];
  await ev(()=>{T.S.mon.view='tiles';T.S.tab='monitor';T.H7.pview(null,'positions');});
  for (const v of ['holdings','margin','stoploss','drawdown','charts','matrix','currency','tiles']) {
    await ev(()=>T.root.querySelector('[data-pvt-bar]').scrollIntoView());
    await p.click(`[data-pvt-bar] [data-v="${v}"]`);
    out.push(v+': '+await ev(()=>({own:T.S.pvtView,nat:T.S.mon.view,on:[...T.root.querySelectorAll('[data-pvt-bar] .on')].map(x=>x.textContent.trim()).join('/')})).then(JSON.stringify));
  }
  await p.click('[data-pvt-bar] .pvt-al'); out.push('alerts: '+await ev(()=>T.S.mon.view+' own '+T.S.pvtView));
  await ev(()=>{T.S.mon.view='tiles';T.S.pvtView='margin';T.S.tab='portfolios';T.render();T.S.tab='monitor';T.render();T.S.tab='overview';T.render();});
  out.push('tabs ok: '+await ev(()=>T.S.tab));
  console.log(out.join('\n')); console.log('errors', errs);
  await b.close();
})();

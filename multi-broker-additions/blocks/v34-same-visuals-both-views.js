
/* ============================ v34 · Portfolio status: same visuals as Open positions, different data ============================
   Charts, Holdings, Matrix, Map and Exposure now draw exactly the same views in both modes. Only the data changes:
   Open positions = positions open at the latest snapshot; Portfolio status = closed trades in the date range, grouped per
   account · instrument · side (size = traded volume, P/L = realized). The data is swapped in while the view draws. */
function pvsNotional(c) {
  var px = parseFloat(String(c.ex).replace(/,/g, '')) || D30_PX[c.ins] || 1, n;
  if (c.ins === 'BTCUSD' || c.ins === 'US500') n = c.lots * px; else if (c.ins === 'XAUUSD') n = c.lots * 100 * px;
  else if (c.ins === 'USDJPY') n = c.lots * 100000; else if (/JPY$/.test(c.ins)) n = c.lots * 100000 * 1.271; else n = c.lots * 100000 * px;
  return Math.round(n) * (c.side === 'Buy' ? 1 : -1);
}
function pvsSynth(known) {
  var L = pvsTrades().L, m = {}, o = [];
  L.forEach(function (c) {
    if (known && typeof INS !== 'undefined' && !INS[c.ins]) return;
    var k = c.a + '|' + c.ins + '|' + c.side;
    if (!m[k]) { m[k] = { id: 'pvs-' + c.a + '-' + c.ins + '-' + c.side, a: c.a, ins: c.ins, side: c.side, lots: 0, en: c.en, cu: c.ex, pl: 0, m: 0, usd: 0, opened: DAYS[c.day], n: 0, closed: true }; o.push(k); }
    var g = m[k]; g.lots = r2(g.lots + c.lots); g.pl = r2(g.pl + c.pl); g.usd += pvsNotional(c); g.n++;
  });
  return o.map(function (k) { return m[k]; });
}
function pvsWith(fn, known) {
  var keepP = POS, keepC = S.mon.ccyView, syn = pvsSynth(known), tpl = null, added = [];
  for (var k in PX) { tpl = PX[k]; break; }
  syn.forEach(function (p) { if (!(p.id in PX)) { var t = {}; if (tpl) Object.keys(tpl).forEach(function (f) { t[f] = f === 'sl' ? null : tpl[f]; }); PX[p.id] = t; added.push(p.id); } });
  try { POS = syn; S.mon.ccyView = 'positions'; return fn(); }
  finally { POS = keepP; S.mon.ccyView = keepC; added.forEach(function (id) { delete PX[id]; }); }
}
var PVS_SAME = ['charts', 'holdings', 'matrix', 'map', 'currency'];
var _pvsBody34 = pvsBody;
pvsBody = function (v) {
  if (PVS_SAME.indexOf(v) < 0) return _pvsBody34(v);
  var D = pvsTrades(), rl = esc(rangeLabel());
  if (!D.L.length) return '<div class="na" style="min-height:90px">No closed trades for ' + esc(scopeName()) + (D.X.dir ? ' · ' + dirName(D.X.dir) : '') + ' in ' + rl + '</div>';
  var note = pvsNote('Same view as Open positions, filled with closed trades from ' + rl + ': size = traded volume, P/L = realized.');
  return note + pvsWith(function () {
    var h = pvtBody(v);
    if (v === 'charts') h = h.split('data-a="pvins"').join('data-a="pvsins"').split('data-a="pvacc"').join('data-a="pvsacc"')
      .replace('exposure · long right, short left', 'traded volume · long right, short left').replace('Bar length = exposure', 'Bar length = traded volume')
      .replace(/unrealized P\/L · [^<]*/, 'realized P/L · ' + rl);
    return h;
  }, v === 'currency');
};
/* panels opened from those views (status mode) read the same grouped data */
if (typeof posPanel === 'function') {
  var _posPanel34 = posPanel;
  posPanel = function (pn) {
    if (pn && pn.ids && pn.ids.some(function (id) { return String(id).indexOf('pvs-') === 0; })) return pvsWith(function () { return _posPanel34(pn); });
    return _posPanel34.apply(this, arguments);
  };
}
/* Portfolios › Portfolio status: the same tabbed card, placed above Closed trades */
portfolios = (function (prev) {
  return function () {
    var h = prev();
    if (pvOn() || S.pfView === 'analytics' || S.loading) return h;
    try { var c = pvsCard(), k = h.indexOf('<div class="card pad mb16" data-section="pf-closed"'); return k >= 0 ? h.slice(0, k) + c + h.slice(k) : h + c; }
    catch (e) { pvtErr(e); return h; }
  };
})(portfolios);

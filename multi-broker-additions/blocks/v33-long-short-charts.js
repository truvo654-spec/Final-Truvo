
/* ============================ v33 · Long / Short classification in the card charts ============================
   Colour now means direction everywhere in this card, matching the Buy / Sell side tags: Long = olive, Short = purple.
   Gain or loss is shown by which side of $0 a bar sits on and by the +/− sign; totals in these charts are not coloured,
   so purple never means both "short" and "loss" in the same chart.
   Charts tab (both views, Monitor and Portfolios): every instrument and account row splits into a Long bar and a
   Short bar. Map tab (Portfolio status): each tile shows its Long / Short split. */
function lsGroup(list, key, name, val) {
  var m = {}, o = [];
  list.forEach(function (x) {
    var k = key(x); if (!m[k]) { m[k] = { k: k, name: name(k), L: 0, S: 0, nL: 0, nS: 0 }; o.push(k); }
    var g = m[k], v = val(x); if (x.side === 'Buy') { g.L += v; g.nL++; } else { g.S += v; g.nS++; }
  });
  return o.map(function (k) { var g = m[k]; g.L = r2(g.L); g.S = r2(g.S); g.t = r2(g.L + g.S); return g; });
}
function lsBar(v, mx, cls) {
  if (!v) return '<span class="lstr"><s></s></span>';
  var w = Math.min(50, Math.abs(v) / mx * 50).toFixed(2);
  return '<span class="lstr"><s></s><i class="' + cls + '" style="' + (v < 0 ? 'right:50%' : 'left:50%') + ';width:' + w + '%"></i></span>';
}
function lsChart(o) {
  var rows = o.rows, mx = Math.max.apply(null, rows.map(function (r) { return Math.max(Math.abs(r.L), Math.abs(r.S)); }).concat([1]));
  var body = rows.map(function (r) {
    var sub = (r.nL ? r.nL + ' long' : '') + (r.nL && r.nS ? ' · ' : '') + (r.nS ? r.nS + ' short' : '');
    var tot = o.mode === 'exp' ? r.L - r.S : r.t, totTxt = o.mode === 'exp' ? (tot === 0 ? '$0' : sgn0(tot)) + ' net' : sgn(tot);
    var kx = function (v) { return v ? '$' + (v / 1000).toFixed(1) + 'k' : '—'; }, lTxt = o.mode === 'exp' ? kx(r.L) : (r.nL ? sgn(r.L) : '—'), sTxt = o.mode === 'exp' ? kx(r.S) : (r.nS ? sgn(r.S) : '—');
    return '<button class="lsr" data-a="' + o.act + '" data-v="' + esc(r.k) + '" data-ls-row="' + esc(r.k) + '" aria-label="' + esc(r.name) + ': long ' + lTxt + ', short ' + sTxt + ', ' + (o.mode === 'exp' ? 'net ' + (tot === 0 ? '$0' : sgn0(tot)) : 'total ' + totTxt) + '">' +
      '<span class="lsn"><b>' + esc(r.name) + '</b><small>' + sub + '</small></span>' +
      '<span class="lsb">' + (o.mode === 'exp' ? '<span class="lstr"><s></s>' + (r.S ? '<i class="s" style="right:50%;width:' + Math.min(50, r.S / mx * 50).toFixed(2) + '%"></i>' : '') + (r.L ? '<i class="l" style="left:50%;width:' + Math.min(50, r.L / mx * 50).toFixed(2) + '%"></i>' : '') + '</span>'
        : lsBar(r.L, mx, 'l') + lsBar(r.S, mx, 's')) + '</span>' +
      '<span class="lsv"><b class="' + (o.mode === 'exp' ? '' : plc(tot)) + '">' + totTxt + '</b><small><em class="l">L</em> ' + lTxt + ' <em class="s">S</em> ' + sTxt + '</small></span></button>';
  }).join('');
  return '<div class="pvch" data-ls-chart="' + o.id + '"><h4>' + o.title + ' <small>' + o.sub + '</small></h4>' +
    '<div class="lsleg"><span><i class="l"></i>Long</span><span><i class="s"></i>Short</span><span class="mut">' + o.axis + '</span></div>' +
    (rows.length ? body + '<div class="lsax" aria-hidden="true"><span></span><span class="lsaxl"><b>' + (o.mode === 'exp' ? 'Short' : 'Loss') + '</b><b>$0</b><b>' + (o.mode === 'exp' ? 'Long' : 'Gain') + '</b></span><span></span></div>' : '<div class="mut">Nothing in this scope.</div>') + '</div>';
}
/* Open positions › Charts */
function lsPosCharts() {
  var X = pvScope(), P = X.pos;
  if (!P.length) return '<div class="na" style="min-height:90px">No open positions for ' + esc(pvName(X)) + '</div>';
  var gi = lsGroup(P, function (p) { return p.ins; }, function (k) { return k; }, function (p) { return Math.abs(p.usd); }).sort(function (a, b) { return (b.L + b.S) - (a.L + a.S); });
  var ga = lsGroup(P, function (p) { return p.a; }, function (k) { return accName(acc(k)); }, function (p) { return p.pl; }).sort(function (a, b) { return a.t - b.t; });
  return '<div class="pvcharts">' + lsChart({ id: 'pos-ins', title: 'By instrument', sub: 'exposure · long right, short left', rows: gi, mode: 'exp', act: 'pvins', axis: 'Bar length = exposure' }) +
    lsChart({ id: 'pos-acc', title: 'By account', sub: 'unrealized P/L · ' + sgn(X.upl) + ' total', rows: ga, mode: 'pl', act: 'pvacc', axis: 'Right of $0 = gain, left = loss' }) + '</div>';
}
/* Portfolio status › Charts */
function lsStatCharts() {
  var D = pvsTrades(), L = D.L, rl = esc(rangeLabel());
  if (!L.length) return '<div class="na" style="min-height:90px">No closed trades for ' + esc(scopeName()) + ' in ' + rl + '</div>';
  var gi = lsGroup(L, function (c) { return c.ins; }, function (k) { return k; }, function (c) { return c.pl; }).sort(function (a, b) { return b.t - a.t; });
  var ga = lsGroup(L, function (c) { return c.a; }, function (k) { return accName(acc(k)); }, function (c) { return c.pl; }).sort(function (a, b) { return b.t - a.t; });
  return '<div class="pvcharts">' + lsChart({ id: 'st-ins', title: 'By instrument', sub: 'realized P/L · ' + rl, rows: gi, mode: 'pl', act: 'pvsins', axis: 'Right of $0 = gain, left = loss' }) +
    lsChart({ id: 'st-acc', title: 'By account', sub: 'realized P/L · ' + rl, rows: ga, mode: 'pl', act: 'pvsacc', axis: 'Right of $0 = gain, left = loss' }) + '</div>';
}
/* Portfolio status › Map: tile size = share of realized P/L; inner bar = Long / Short split of that P/L */
function lsStatMap() {
  var D = pvsTrades(), L = D.L, rl = esc(rangeLabel());
  if (!L.length) return '<div class="na" style="min-height:90px">No closed trades for ' + esc(scopeName()) + ' in ' + rl + '</div>';
  var gm = lsGroup(L, function (c) { return c.ins; }, function (k) { return k; }, function (c) { return c.pl; }).sort(function (a, b) { return Math.abs(b.t) - Math.abs(a.t); });
  var tot = gm.reduce(function (s, g) { return s + Math.abs(g.t); }, 0) || 1;
  return pvsNote('Tile size = share of realized P/L · inner bar = Long / Short split · ' + rl) + '<div class="lsleg" style="margin-bottom:8px"><span><i class="l"></i>Long</span><span><i class="s"></i>Short</span></div><div class="pvs-map" data-pvs-map>' + gm.map(function (g) {
    var sh = Math.abs(g.t) / tot, a = Math.abs(g.L) + Math.abs(g.S) || 1;
    return '<button class="pvs-tile ls" style="flex:' + Math.max(0.06, sh).toFixed(3) + ' 1 0" data-a="pvsins" data-v="' + esc(g.k) + '" aria-label="' + esc(g.k) + ' realized ' + sgn(g.t) + '; long ' + sgn(g.L) + ', short ' + sgn(g.S) + '"><b>' + esc(g.k) + '</b><span class="' + plc(g.t) + '">' + sgn(g.t) + '</span>' +
      '<span class="lssplit"><i class="l" style="width:' + (Math.abs(g.L) / a * 100).toFixed(1) + '%"></i><i class="s" style="width:' + (Math.abs(g.S) / a * 100).toFixed(1) + '%"></i></span>' +
      '<small><em class="l">L</em> ' + sgn(g.L) + ' · <em class="s">S</em> ' + sgn(g.S) + '</small></button>';
  }).join('') + '</div>';
}
var _pvtBody33 = pvtBody;
pvtBody = function (v) { return v === 'charts' ? lsPosCharts() : _pvtBody33(v); };
var _pvsBody33 = pvsBody;
pvsBody = function (v) { return v === 'charts' ? lsStatCharts() : v === 'map' ? lsStatMap() : _pvsBody33(v); };
/* the Open positions card now always draws Charts through pvtBody */
function pvtCard() {
  if (!S.pvtInit) { S.pvtInit = true; if (S.mon.view === 'tiles') S.pvtView = 'charts'; }
  var v = pvtV();
  if (v === 'alerts' && typeof monAlertsView !== 'function') return null;
  var card = pvModule({ charts: false }), e = card.lastIndexOf('</div>');
  return card.slice(0, e) + pvtBar() + '<div class="pvtb" data-pvt-body data-mon-view="' + v + '">' + pvtBody(v) + '</div>' + card.slice(e);
}
(function () {
  var st = document.createElement('style'); st.setAttribute('data-mb-v33', '1');
  st.textContent = [
    '#mb-root .lsleg{display:flex;flex-wrap:wrap;gap:12px;align-items:center;font-size:12px;margin:0 0 6px}#mb-root .lsleg span{display:inline-flex;align-items:center;gap:5px}',
    '#mb-root .lsleg i,#mb-root .lssplit i{display:inline-block;width:10px;height:10px;border-radius:3px}',
    '#mb-root i.l,#mb-root .lstr i.l{background:#879e07}#mb-root i.s,#mb-root .lstr i.s{background:#5945f1}',
    '#mb-root em.l,#mb-root em.s{font-style:normal;font-weight:700;font-size:10px;border-radius:4px;padding:0 4px;margin-right:1px}#mb-root em.l{background:rgba(135,158,7,.16);color:#4d5c04}#mb-root em.s{background:#efecff;color:#3d2bc4}',
    '#mb-root .lsr,#mb-root .lsax{display:grid;grid-template-columns:132px 1fr 150px;gap:10px;align-items:center}',
    '#mb-root .lsr{width:100%;border:0;background:none;padding:7px 4px;border-radius:8px;font:inherit;text-align:left;cursor:pointer;color:#171717}#mb-root .lsr:hover{background:#f6f4ff}#mb-root .lsr:focus-visible{outline:2px solid var(--b)}',
    '#mb-root .lsn b{display:block;font-size:13px}#mb-root .lsn small{display:block;font-size:11px;color:var(--tx2)}',
    '#mb-root .lsb{display:flex;flex-direction:column;gap:3px}',
    '#mb-root .lstr{position:relative;display:block;height:9px;background:#efede8;border-radius:5px}#mb-root .lsb .lstr:only-child{height:14px}',
    '#mb-root .lstr s{position:absolute;left:50%;top:-3px;bottom:-3px;border-left:1.5px solid #8a8a8a}#mb-root .lstr i{position:absolute;top:0;bottom:0;border-radius:4px}',
    '#mb-root .lsv{text-align:right}#mb-root .lsv b{display:block;font-size:13px}#mb-root .lsv small{display:block;font-size:11px;color:var(--tx2);white-space:nowrap}',
    '#mb-root .lsax{padding:0 4px;font-size:10px;color:var(--tx2)}#mb-root .lsaxl{display:flex;justify-content:space-between}#mb-root .lsaxl b{font-weight:500}',
    '#mb-root .pvs-tile.ls{background:#f7f6f2;color:#171717}',
    '#mb-root .lssplit{display:flex;width:100%;height:6px;border-radius:3px;overflow:hidden;background:#e7e4dd;margin:4px 0}#mb-root .lssplit i{height:6px;border-radius:0;width:auto}',
    '#mb-root .lsv b.pos,#mb-root .lsv b.neg,#mb-root .pvs-tile.ls span.pos,#mb-root .pvs-tile.ls span.neg{color:#171717}',
    '@media (max-width:760px){#mb-root .lsr,#mb-root .lsax{grid-template-columns:96px 1fr 92px;gap:6px}#mb-root .lsv small{display:none}}'
  ].join('\n');
  document.head.appendChild(st);
})();

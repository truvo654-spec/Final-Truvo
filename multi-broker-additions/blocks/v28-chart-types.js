
/* ============================ v28 · Open positions chart types ============================
   Overview: diverging bar chart on one shared $ axis. Monitor: bullet chart for margin level with broker stop-out
   markers, and a single stacked bar for stop-loss coverage. Portfolios: underwater equity drawdown chart with
   hover / tap-drag / arrow-key inspection. All read pvScope (Long/Short applies to P/L and stop-loss exposure only). */
function niceMax(v) { if (!(v > 0)) return 1; var p = Math.pow(10, Math.floor(Math.log10(v))), m = v / p; return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 2.5 ? 2.5 : m <= 5 ? 5 : 10) * p; }
function axisMoney(v) { var a = Math.abs(v), s = a >= 1000 ? '$' + (a / 1000).toFixed(a % 1000 ? 1 : 0) + 'k' : '$' + Math.round(a); return v === 0 ? '$0' : (v < 0 ? '−' : '+') + s; }

/* ---------- Overview · Unrealized P/L by instrument (diverging bars) ---------- */
function divChart(X) {
  var gi = pvGroup(X.pos, function (p) { return p.ins; }, function (k) { return k; }).sort(function (a, b) { return a.upl - b.upl; });
  var mx = niceMax(Math.max.apply(null, gi.map(function (r) { return Math.abs(r.upl); }).concat([1]))), half = 34;
  var rows = gi.map(function (r) {
    var w = Math.abs(r.upl) / mx * half, neg = r.upl < 0, on = S.posF.ins === r.k;
    return '<button class="dvrow' + (on ? ' on' : '') + '" data-a="pvinsT" data-v="' + esc(r.k) + '" data-pv-row="' + esc(r.k) + '" aria-pressed="' + on + '" aria-label="' + esc(r.k) + ' ' + sgn(r.upl) + ' unrealized, ' + r.n + ' position' + (r.n === 1 ? '' : 's') + '. Filter the Trade Tracker"><span class="dvn"><b>' + esc(r.k) + '</b><small>' + r.n + ' position' + (r.n === 1 ? '' : 's') + '</small></span>' +
      '<span class="dvtrack"><s></s>' + (r.upl ? '<i class="' + (neg ? 'n' : 'p') + '" style="' + (neg ? 'right:50%' : 'left:50%') + ';width:' + w.toFixed(2) + '%"></i>' : '') + '<em class="' + (neg ? 'neg' : r.upl ? 'pos' : '') + '" style="' + (neg ? 'right:' + (50 + w).toFixed(2) + '%' : 'left:' + (50 + w).toFixed(2) + '%') + '" data-dv-val="' + esc(r.k) + '">' + (r.upl === 0 ? '$0.00' : sgn(r.upl)) + '</em></span></button>';
  }).join('');
  var ticks = [-1, -0.5, 0, 0.5, 1].map(function (t) { return '<span style="left:' + (50 + t * half) + '%">' + axisMoney(t * mx) + '</span>'; }).join('');
  return '<div class="pvch" data-pv-chart="ins-upl"><h4>Unrealized P/L by instrument <small>losses left · gains right · total ' + sgn(X.upl) + '</small></h4>' + rows +
    '<div class="dvaxis" aria-hidden="true"><span></span><span class="dvticks">' + ticks + '</span></div></div>';
}
var _pvModule28 = pvModule;
pvModule = function (o) {
  var h = _pvModule28(o); if (!o || !o.ov) return h;
  var a = h.indexOf('<div class="pvch" data-pv-chart="ins-upl">'); if (a < 0) return h;
  var e = h.indexOf('</div>', a); return h.slice(0, a) + divChart(pvScope()) + h.slice(e + 6);
};

/* ---------- Monitor · Margin risk by account (bullet chart) ---------- */
marginRiskCard = function () {
  var X = pvScope(), SC = 400, rows = X.accs.map(function (a) {
    var none = a.status === 'none', ml = none ? null : mlvl(a), th = none ? null : mrThreshold(a);
    return { a: a, none: none, ml: ml, th: th, dist: ml != null && th != null ? Math.round(ml - th) : null, free: none ? null : r2(a.eq - a.mu) };
  });
  rows.sort(function (x, y) { if (x.none !== y.none) return x.none ? 1 : -1; var dx = x.dist == null ? x.ml : x.dist, dy = y.dist == null ? y.ml : y.dist; return dx - dy; });
  var px = function (v) { return Math.min(100, v / SC * 100).toFixed(2) + '%'; };
  var body = rows.map(function (r) {
    var a = r.a, st = a.status === 'stale', name = '<span class="mrn"><b>' + esc(accName(a)) + '</b><small>' + (st ? '<span class="warn">Last known ' + esc(a.snap) + '</span>' : esc(a.nick)) + '</small></span>';
    if (r.none) return '<div class="blrow un" data-mr-row="' + a.id + '">' + name + '<span class="fds na">Margin data unavailable</span><span></span><span></span><span class="mrd"><button class="lnk" data-a="pvmanage">Data status in Manage →</button></span></div>';
    var cls = r.ml < 100 ? 'ri' : r.ml < 150 ? 'wa' : 'ok', over = r.ml > SC;
    return '<button class="blrow" data-a="mracc" data-v="' + a.id + '" data-mr-row="' + a.id + '" aria-label="' + esc(accName(a)) + ': margin level ' + pct(r.ml) + ', free margin ' + usd(r.free) + (r.th != null ? ', ' + r.dist + ' points above ' + r.th + '% stop-out' : ', threshold unavailable') + '. Open positions">' + name +
      '<span class="bullet"><span class="bband" style="left:0;width:' + px(100) + '"></span><span class="bband w" style="left:' + px(100) + ';width:' + (50 / SC * 100) + '%"></span><i class="' + cls + '" style="width:' + px(r.ml) + '"></i>' + (over ? '<b class="bover">›</b>' : '') + (r.th != null ? '<em style="left:' + px(r.th) + '" title="Stop-out ' + r.th + '%"></em>' : '') + '</span>' +
      '<span class="blv"><b class="' + (cls === 'ri' ? 'bad' : '') + '" data-mr-ml="' + a.id + '">' + pct(r.ml) + '</b><small>margin level</small></span>' +
      '<span class="blv"><b data-mr-free="' + a.id + '" class="' + (r.free < 0 ? 'bad' : '') + '">' + usd(r.free) + '</b><small>free margin</small></span>' +
      '<span class="mrd" data-mr-dist="' + a.id + '">' + (r.th == null ? '<span class="mut">Threshold unavailable</span>' : '<b>' + (r.dist >= 0 ? r.dist.toLocaleString('en-US') + ' pts' : '<span class="bad">' + Math.abs(r.dist) + ' pts below</span>') + '</b><small>to ' + r.th + '% stop-out</small>') + '</span></button>';
  }).join('');
  var ticks = [0, 100, 200, 300, 400].map(function (t) { return '<span style="left:' + (t / SC * 100) + '%">' + t + '%' + (t === SC ? '+' : '') + '</span>'; }).join('');
  return '<div class="card pad mb16" data-section="margin-risk"><div class="ch"><div><h3>Margin risk by account</h3><div class="lbl">Full-account margin level · most urgent first · Direction doesn’t change these</div></div><span class="bleg"><i class="mk"></i>Broker stop-out (demo values) <i class="bd1"></i>&lt;100% <i class="bd2"></i>100–150%</span></div>' +
    (rows.length ? body + '<div class="blaxis" aria-hidden="true"><span></span><span class="blticks">' + ticks + '</span></div>' : '<div class="mut">No accounts in this scope.</div>') + '</div>';
};

/* ---------- Monitor · Stop-loss coverage (single stacked bar) ---------- */
stopCard = function () {
  var X = pvScope(), g = { set: { v: 0, n: 0 }, none: { v: 0, n: 0 }, na: { v: 0, n: 0 } }, tot = 0;
  X.pos.forEach(function (p) { var k = slKey(p), v = Math.abs(p.usd); g[k].v += v; g[k].n++; tot += v; });
  var keys = ['set', 'none', 'na'];
  var segs = keys.filter(function (k) { return g[k].n; }).map(function (k) {
    var w = tot ? g[k].v / tot * 100 : 0, lab = SLK[k] + ' · ' + g[k].n;
    return '<button class="slseg sl-' + k + (S.mon.slf === k ? ' on' : '') + (S.mon.slf && S.mon.slf !== k ? ' dim' : '') + '" style="width:' + w.toFixed(2) + '%" data-a="mslf" data-v="' + k + '" data-sl-seg="' + k + '" aria-pressed="' + (S.mon.slf === k) + '" aria-label="' + SLK[k] + ': ' + usd0(g[k].v) + ' gross, ' + g[k].n + ' positions. Filter Holdings">' + (w >= 22 ? '<span>' + lab + '</span><small>' + usd0(g[k].v) + '</small>' : w >= 9 ? '<span>' + g[k].n + '</span>' : '') + '</button>';
  }).join('');
  var leg = keys.map(function (k) { return '<button class="slleg' + (S.mon.slf === k ? ' on' : '') + '" data-a="mslf" data-v="' + k + '"' + (g[k].n ? '' : ' disabled') + '><i class="sl-' + k + '"></i><b>' + SLK[k] + '</b><span data-sl-amt="' + k + '">' + usd0(g[k].v) + ' · ' + g[k].n + ' position' + (g[k].n === 1 ? '' : 's') + (tot ? ' · ' + Math.round(g[k].v / tot * 100) + '%' : '') + '</span></button>'; }).join('');
  return '<div class="card pad mb16" data-section="stop-status"><div class="ch"><div><h3>Stop-loss coverage</h3><div class="lbl">Gross exposure ' + usd0(Math.round(tot)) + ' across ' + X.n + ' position' + (X.n === 1 ? '' : 's') + (X.dir ? ' · ' + dirName(X.dir) + ' only' : '') + ' · gross, so offsetting positions stay visible</div></div>' + (S.mon.slf ? '<button class="btn sm" data-a="mslfclr" data-sl-clear>× Clear · ' + SLK[S.mon.slf] + '</button>' : '') + '</div>' +
    (X.n ? '<div class="slbar" role="group" aria-label="Stop-loss coverage by gross exposure">' + segs + '</div>' : '<div class="mut">No open positions.</div>') + '<div class="slleg-w">' + leg + '</div><div class="lbl">Click a segment to filter Holdings. Stop data unavailable: XM’s partner feed doesn’t send stop-loss fields (demo).</div></div>';
};

/* ---------- Portfolios · Equity drawdown (underwater chart) ---------- */
function uwCalc() {
  var X = pvScope(), ids = X.rep.map(function (a) { return a.id; }).filter(function (id) { return EQ[id]; });
  if (!ids.length || !rangeOK() || rangeEnd() - rangeStart() < 2) return { ok: false, X: X };
  var s = eqAdj(ids), pkAll = -Infinity, pkAllI = 0; for (var i = 0; i <= 30; i++) if (s[i] > pkAll) { pkAll = s[i]; pkAllI = i; }
  var a0 = rangeStart(), a1 = rangeEnd(), rp = -Infinity, rpI = a0, pts = [], mdd = 0, mI = -1, mPk = a0;
  for (var j = a0; j <= a1; j++) { if (s[j] > rp) { rp = s[j]; rpI = j; } var d = rp > 0 ? (rp - s[j]) / rp : 0; pts.push({ i: j, eq: s[j], pk: rp, pkI: rpI, dd: r2(rp - s[j]), pc: d }); if (d > mdd) { mdd = d; mI = j; mPk = rpI; } }
  var stale = X.rep.filter(function (a) { return a.status === 'stale' && ids.indexOf(a.id) >= 0; });
  return { ok: true, X: X, s: s, pts: pts, cur: pkAll > 0 ? (pkAll - s[30]) / pkAll : 0, curAbs: r2(pkAll - s[30]), pkAllI: pkAllI, mdd: mdd, mAbs: mI >= 0 ? r2(s[mPk] - s[mI]) : 0, mI: mI, mPk: mPk, stale: stale };
}
function uwHead(c) {
  return '<div class="ddg"><div><small>Current drawdown</small><b data-dd-cur>' + (c.cur > 0 ? '−' + (c.cur * 100).toFixed(1) + '%' : '0.0%') + '</b><span>' + (c.cur > 0 ? '−$' + f2(c.curAbs) + ' below the ' + DAYS[c.pkAllI] + ' peak' : 'At peak') + ' · latest ' + DAYS[30] + '</span></div>' +
    '<div><small>Max drawdown · ' + esc(rangeLabel()) + '</small><b data-dd-max>' + (c.mdd > 0 ? '−' + (c.mdd * 100).toFixed(1) + '%' : '0.0%') + '</b><span>' + (c.mdd > 0 ? '−$' + f2(c.mAbs) + ' · peak ' + DAYS[c.mPk] + ' → trough ' + DAYS[c.mI] : 'No drawdown in period') + '</span></div></div>';
}
function uwSvg(c) {
  var W = Math.max(300, Math.min(640, (root.clientWidth || 720) - 84)), H = W < 480 ? 190 : 210, L = 46, R = 12, T = 12, B = 26, n = c.pts.length, ymax = niceMax(Math.max(c.mdd * 100, 0.5));
  var X = function (k) { return L + k * (W - L - R) / Math.max(1, n - 1); }, Y = function (pc) { return T + pc * 100 / ymax * (H - T - B); };
  var g = '';
  for (var t = 0; t <= 4; t++) { var v = ymax * t / 4, y = T + t / 4 * (H - T - B); g += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + y.toFixed(1) + '" y2="' + y.toFixed(1) + '" stroke="' + (t ? '#efece6' : '#9c9c9c') + '"' + (t ? ' stroke-dasharray="3 4"' : '') + '/><text x="' + (L - 6) + '" y="' + (y + 3.5).toFixed(1) + '" text-anchor="end" font-size="10" fill="#737373">' + (v ? '−' + (+v.toFixed(2)) + '%' : '0%') + '</text>'; }
  [0, Math.floor((n - 1) / 2), n - 1].forEach(function (k, j) { g += '<text x="' + X(k).toFixed(1) + '" y="' + (H - 8) + '" font-size="10" fill="#737373" text-anchor="' + (j === 0 ? 'start' : j === 2 ? 'end' : 'middle') + '">' + DAYS[c.pts[k].i] + '</text>'; });
  var line = c.pts.map(function (p, k) { return X(k).toFixed(1) + ',' + Y(p.pc).toFixed(1); }).join(' ');
  var area = '<polygon points="' + X(0).toFixed(1) + ',' + T + ' ' + line + ' ' + X(n - 1).toFixed(1) + ',' + T + '" fill="#5945f1" fill-opacity=".16"/><polyline points="' + line + '" fill="none" stroke="#5945f1" stroke-width="2" stroke-linejoin="round"/>';
  var mk = '';
  if (c.mI >= 0) {
    var kp = c.mPk - c.pts[0].i, kt = c.mI - c.pts[0].i;
    mk = '<circle cx="' + X(kp).toFixed(1) + '" cy="' + T + '" r="5" fill="#fff" stroke="#16a34a" stroke-width="2" data-uw-peak/><text x="' + X(kp).toFixed(1) + '" y="' + (T + 18) + '" font-size="10" font-weight="700" fill="#15803d" text-anchor="' + (kp < n / 2 ? 'start' : 'end') + '">Peak ' + DAYS[c.mPk] + '</text>' +
      '<circle cx="' + X(kt).toFixed(1) + '" cy="' + Y(c.mdd).toFixed(1) + '" r="5" fill="#e03434" stroke="#fff" stroke-width="2" data-uw-trough/><text x="' + X(kt).toFixed(1) + '" y="' + (Y(c.mdd) - 9).toFixed(1) + '" font-size="10" font-weight="700" fill="#b42318" text-anchor="' + (kt < n / 2 ? 'start' : 'end') + '">Trough ' + DAYS[c.mI] + ' −' + (c.mdd * 100).toFixed(1) + '%</text>';
  }
  var guide = '<line data-uw-guide x1="0" x2="0" y1="' + T + '" y2="' + (H - B) + '" stroke="#171717" stroke-width="1" visibility="hidden"/><circle data-uw-dot r="4" cx="0" cy="0" fill="#171717" visibility="hidden"/>';
  return { svg: '<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" role="img" aria-hidden="true">' + g + area + mk + guide + '</svg>', W: W, xs: c.pts.map(function (p, k) { return +X(k).toFixed(1); }), ys: c.pts.map(function (p) { return +Y(p.pc).toFixed(1); }) };
}
drawdown = function (compact) {
  var c = uwCalc(), head = '<div class="ch"><div><h3>Equity drawdown</h3><div class="lbl">Full account · ' + esc(scopeName()) + ' · deposits and withdrawals removed · Direction doesn’t apply</div></div><span class="tag gr" style="margin:0">Simulated equity history</span></div>';
  if (!c.ok) return '<div class="card pad mb16' + (compact ? ' ddc' : '') + '" data-section="drawdown" data-dd-state="na">' + head + '<div class="na" style="min-height:90px" data-dd-na><b style="color:#171717">Drawdown unavailable</b><span>Not enough equity history for ' + esc(scopeName()) + (rangeOK() ? ' in ' + esc(rangeLabel()) : '') + '.</span></div></div>';
  var stale = c.stale.length ? '<div class="lbl" data-dd-stale><span class="tag wa" style="margin:0 6px 0 0">Last known</span>' + c.stale.map(function (a) { return esc(accName(a)) + ' is held at its ' + esc(a.snap) + ' value after that date'; }).join(', ') + '</div>' : '';
  if (compact) return '<div class="card pad mb16 ddc" data-section="drawdown" data-dd-state="ok">' + head + uwHead(c) + stale + '</div>';
  var v = uwSvg(c), data = { xs: v.xs, ys: v.ys, W: v.W, p: c.pts.map(function (p) { return [DAYS[p.i] + ' 2026', p.eq, p.pk, DAYS[p.pkI], p.dd, +(p.pc * 100).toFixed(2)]; }) };
  return '<div class="card pad mb16" data-section="drawdown" data-dd-state="ok">' + head + uwHead(c) + stale +
    '<div class="uw" data-uw="' + esc(JSON.stringify(data)) + '"><div class="uwsvg" tabindex="0" role="slider" aria-label="Underwater equity chart. Use left and right arrows to inspect dates" aria-valuemin="0" aria-valuemax="' + (c.pts.length - 1) + '" aria-valuenow="' + (c.pts.length - 1) + '" aria-valuetext="' + esc(DAYS[c.pts[c.pts.length - 1].i]) + '">' + v.svg + '</div><div class="uwtip" data-uw-tip role="status" aria-live="polite" hidden></div></div>' +
    '<div class="lbl" style="margin-top:6px">Hover, tap or drag the chart, or focus it and use ← →, to inspect a date. Equity is shown after removing deposits and withdrawals.</div></div>';
};
function uwSet(box, k) {
  var D; try { D = JSON.parse(box.getAttribute('data-uw')); } catch (e) { return; }
  k = Math.max(0, Math.min(D.p.length - 1, k)); box.setAttribute('data-uw-i', k);
  var svg = box.querySelector('svg'), gl = svg.querySelector('[data-uw-guide]'), dot = svg.querySelector('[data-uw-dot]'), tip = box.querySelector('[data-uw-tip]'), p = D.p[k], x = D.xs[k];
  gl.setAttribute('x1', x); gl.setAttribute('x2', x); gl.setAttribute('visibility', 'visible'); dot.setAttribute('cx', x); dot.setAttribute('cy', D.ys[k]); dot.setAttribute('visibility', 'visible');
  tip.hidden = false; tip.innerHTML = '<b>' + esc(p[0]) + '</b><span>Equity <b>' + usd(p[1]) + '</b></span><span>Prior peak <b>' + usd(p[2]) + '</b> · ' + esc(p[3]) + '</span><span>Drawdown <b class="' + (p[4] > 0 ? 'neg' : '') + '">' + (p[4] > 0 ? '−$' + f2(p[4]) + ' · −' + p[5].toFixed(2) + '%' : '$0.00 · 0%') + '</b></span>';
  var pctX = x / D.W * 100; tip.style.left = pctX + '%'; tip.style.transform = 'translateX(' + (pctX > 70 ? '-100%' : pctX < 30 ? '0' : '-50%') + ')';
  var s = box.querySelector('.uwsvg'); s.setAttribute('aria-valuenow', k); s.setAttribute('aria-valuetext', p[0] + ', drawdown ' + p[5].toFixed(2) + ' percent');
}
function uwAt(box, clientX) { var D = JSON.parse(box.getAttribute('data-uw')), r = box.querySelector('svg').getBoundingClientRect(), x = (clientX - r.left) / r.width * D.W, best = 0; D.xs.forEach(function (v, k) { if (Math.abs(v - x) < Math.abs(D.xs[best] - x)) best = k; }); uwSet(box, best); }
root.addEventListener('pointermove', function (e) { var b = e.target.closest && e.target.closest('[data-uw]'); if (b && e.target.closest('.uwsvg')) uwAt(b, e.clientX); });
root.addEventListener('pointerdown', function (e) { var b = e.target.closest && e.target.closest('[data-uw]'); if (b && e.target.closest('.uwsvg')) uwAt(b, e.clientX); });
root.addEventListener('pointerleave', function () {}, true);
root.addEventListener('mouseout', function (e) { var s = e.target.closest && e.target.closest('.uwsvg'); if (!s || (e.relatedTarget && s.contains(e.relatedTarget)) || document.activeElement === s) return; var b = s.closest('[data-uw]'), t = b.querySelector('[data-uw-tip]'); t.hidden = true; b.querySelectorAll('[data-uw-guide],[data-uw-dot]').forEach(function (el) { el.setAttribute('visibility', 'hidden'); }); });
root.addEventListener('keydown', function (e) {
  var s = e.target.closest && e.target.closest('.uwsvg'); if (!s) return; var b = s.closest('[data-uw]'), n = JSON.parse(b.getAttribute('data-uw')).p.length, k = b.hasAttribute('data-uw-i') ? +b.getAttribute('data-uw-i') : n - 1;
  var m = { ArrowLeft: k - 1, ArrowRight: k + 1, Home: 0, End: n - 1 }; if (!(e.key in m)) return; e.preventDefault(); e.stopPropagation(); uwSet(b, m[e.key]);
});
root.addEventListener('focusin', function (e) { var s = e.target.closest && e.target.closest('.uwsvg'); if (s) { var b = s.closest('[data-uw]'); uwSet(b, b.hasAttribute('data-uw-i') ? +b.getAttribute('data-uw-i') : JSON.parse(b.getAttribute('data-uw')).p.length - 1); } });

(function () {
  var st = document.createElement('style'); st.setAttribute('data-mb-v28', '1');
  st.textContent = [
    '#mb-root .dvrow,#mb-root .dvaxis{display:grid;grid-template-columns:96px 1fr;gap:10px;align-items:center}#mb-root .dvrow{width:100%;border:0;background:none;padding:6px 4px;border-radius:8px;font:inherit;text-align:left;cursor:pointer;color:#171717}#mb-root .dvrow:hover,#mb-root .dvrow.on{background:#f1efff}#mb-root .dvrow:focus-visible{outline:2px solid var(--b)}',
    '#mb-root .dvn b{display:block;font-size:13px}#mb-root .dvn small{display:block;font-size:11px;color:var(--tx2)}',
    '#mb-root .dvtrack{position:relative;display:block;height:22px}#mb-root .dvtrack s{position:absolute;left:50%;top:-4px;bottom:-4px;border-left:1.5px solid #8a8a8a}#mb-root .dvtrack i{position:absolute;top:3px;bottom:3px;border-radius:3px}#mb-root .dvtrack i.p{background:#879e07}#mb-root .dvtrack i.n{background:#5945f1}',
    '#mb-root .dvtrack em{position:absolute;top:2px;font-style:normal;font-size:11.5px;font-weight:700;white-space:nowrap;padding:0 4px;font-variant-numeric:tabular-nums}',
    '#mb-root .dvaxis{padding:0 4px;margin-top:2px}#mb-root .dvticks{position:relative;height:16px;border-top:1px solid #d9d6cf}#mb-root .dvticks span{position:absolute;top:2px;transform:translateX(-50%);font-size:10px;color:var(--tx2);white-space:nowrap}',
    '#mb-root .blrow{display:grid;grid-template-columns:140px minmax(120px,1fr) 70px 100px 130px;gap:12px;align-items:center;width:100%;border:0;border-top:1px solid #f3f2ee;background:none;padding:10px 4px;font:inherit;text-align:left;color:#171717;cursor:pointer}#mb-root .blrow:hover{background:#f7f5ff}#mb-root .blrow:focus-visible{outline:2px solid var(--b)}#mb-root .blrow.un{cursor:default}#mb-root .blrow.un:hover{background:none}',
    '#mb-root .bullet{position:relative;display:block;height:20px;background:#f1f0ec;border-radius:4px;overflow:visible}#mb-root .bband{position:absolute;top:0;bottom:0;background:#fbe3e3}#mb-root .bband.w{background:#fdf0dc}#mb-root .bullet i{position:absolute;left:0;top:6px;height:8px;border-radius:2px}#mb-root .bullet i.ok{background:#3f4d03}#mb-root .bullet i.wa{background:#b45309}#mb-root .bullet i.ri{background:#e03434}',
    '#mb-root .bullet em{position:absolute;top:-3px;bottom:-3px;width:3px;margin-left:-1.5px;background:#171717;border-radius:1px}#mb-root .bover{position:absolute;right:-12px;top:0;font-size:14px;color:#3f4d03}',
    '#mb-root .blv{text-align:right;font-variant-numeric:tabular-nums}#mb-root .blv b{display:block;font-size:13.5px}#mb-root .blv small{display:block;font-size:10.5px;color:var(--tx2)}',
    '#mb-root .blaxis{display:grid;grid-template-columns:140px minmax(120px,1fr) 70px 100px 130px;gap:12px;padding:0 4px}#mb-root .blticks{position:relative;height:16px;border-top:1px solid #d9d6cf}#mb-root .blticks span{position:absolute;top:2px;transform:translateX(-50%);font-size:10px;color:var(--tx2)}#mb-root .blticks span:last-child{transform:translateX(-100%)}',
    '#mb-root .bleg{display:inline-flex;align-items:center;gap:6px;font-size:11px;color:var(--tx2)}#mb-root .bleg i{display:inline-block;width:10px;height:10px;border-radius:2px}#mb-root .bleg .mk{width:3px;height:12px;background:#171717}#mb-root .bleg .bd1{background:#fbe3e3}#mb-root .bleg .bd2{background:#fdf0dc}',
    '#mb-root .slbar{height:44px}#mb-root .slseg{display:flex;flex-direction:column;align-items:center;justify-content:center;line-height:1.15;overflow:hidden;white-space:nowrap}#mb-root .slseg span{font-size:11.5px;font-weight:700}#mb-root .slseg small{font-size:10.5px;font-weight:500;opacity:.9}#mb-root .slseg.sl-set,#mb-root .slleg i.sl-set{background:#879e07}#mb-root .slseg.sl-none,#mb-root .slleg i.sl-none{background:#e03434}#mb-root .slseg.sl-na,#mb-root .slleg i.sl-na{background:repeating-linear-gradient(45deg,#9c9c9c 0 5px,#bdbdbd 5px 10px);color:#171717}#mb-root .slseg.dim{opacity:.35}#mb-root .slseg:focus-visible{outline:2px solid #171717;outline-offset:-2px}',
    '#mb-root .uw{position:relative;margin-top:6px}#mb-root .uwsvg{outline:0;border-radius:8px;touch-action:pan-y;cursor:crosshair}#mb-root .uwsvg:focus-visible{box-shadow:0 0 0 2px var(--b)}',
    '#mb-root .uwtip{position:absolute;top:4px;background:#171717;color:#fff;border-radius:10px;padding:8px 10px;font-size:11.5px;line-height:1.5;pointer-events:none;display:flex;flex-direction:column;min-width:170px;z-index:3}#mb-root .uwtip[hidden]{display:none}#mb-root .uwtip b{font-weight:700}#mb-root .uwtip .neg{color:#cfc8ff}',
    '@media (max-width:760px){#mb-root .blrow,#mb-root .blaxis{grid-template-columns:1fr 1fr;row-gap:6px}#mb-root .blrow .bullet{grid-column:1/-1;grid-row:2}#mb-root .blrow .mrd{grid-column:2;grid-row:1}#mb-root .blrow .blv{grid-row:3;text-align:left}#mb-root .blaxis span:first-child{display:none}#mb-root .blaxis .blticks{grid-column:1/-1}#mb-root .dvrow,#mb-root .dvaxis{grid-template-columns:72px 1fr}}'
  ].join('\n');
  document.head.appendChild(st);
})();

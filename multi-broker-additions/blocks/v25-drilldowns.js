
/* ============================ v25 · From a summary number to the positions behind it ============================
   Compare: Open positions count (Exact numbers), Open P/L bar and Exposure bar open an account positions panel
   (side panel on desktop, sheet on mobile). Closing it restores selection, metric, filters and scroll.
   Monitor › Currency: Exposure | Open positions toggle; Open P/L card opens Holdings with the active filters.
   Overview: "N open positions" opens Trade Tracker › Open for that account; coverage line names missing / last-known
   accounts. Portfolios › Analytics: Long vs Short net realized P/L bars that filter the Closed trades table.
   Manage: per-feed data status in Account details; no undefined Connection values. Alerts: View position / View trade.
   Wrappers below call the earlier functions and add to their output, so earlier behaviour stays as it was. */
S.dd = null; S.mon.ccyView = 'exposure'; S.ovLatest = false; S.ovCov = false; S.pfSide = '';

/* ---------- shared positions panel ---------- */
function ddPos(a, dir) { return POS.filter(function (p) { return p.a === a.id && (!dir || pdir(p) === dir); }); }
function ddSynced(a) { return S.sync[a.id] === 'done' ? 'just now' : snapTime(a); }
function ddWhen(a) { return a.status === 'stale' ? 'Last known at ' + snapTime(a) : 'Latest · synced ' + ddSynced(a); }
function ovHist() { return S.tab === 'overview' && S.dtSet && S.cr && S.cr.mode === 'custom' && S.cr.e < 30; }
function ddState(d) {
  var a = acc(d.acc);
  if (!a || a.status === 'none') return { kind: 'unavail' };
  if (d.src === 'cmp' && !d.latest) { var sn = snapAt(a); if (sn.kind === 'none' || sn.sim) return { kind: 'nosnap', day: crEnd() }; }
  return { kind: 'ok' };
}
function ddRow(p, ex, focus) {
  var side = dirName(pdir(p)), xs = (p.usd < 0 ? 'Short ' : 'Long ') + usd0(Math.abs(p.usd));
  return '<div class="ddrow' + (ex ? ' x' : '') + (focus === p.id ? ' on' : '') + '" data-dd-row="' + p.id + '"><span class="c1"><b>' + p.ins + '</b><small class="show-m">' + side + ' · ' + p.lots.toFixed(2) + ' lots' + (ex ? ' · ' + xs : '') + '</small></span>' +
    '<span class="hide-m">' + pdirCell(p) + '</span><span class="hide-m r">' + p.lots.toFixed(2) + ' lots</span>' + (ex ? '<span class="hide-m r" data-dd-exp="' + p.id + '">' + xs + '</span>' : '') +
    '<span class="r ' + plc(p.pl) + '"><b>' + sgn(p.pl) + '</b></span></div>';
}
function ddPanel() {
  var d = S.dd, a = acc(d.acc); if (!a) return '';
  var st = ddState(d), dir = d.src === 'cmp' ? S.cmpDir : '', ex = d.metric === 'ex', body = '';
  var what = { np: 'Open positions', pl: 'Open P/L', ex: 'Exposure' }[d.metric] || 'Open positions';
  var ctx = d.src === 'cmp' ? 'Compare · ' + what + ' · ' + (d.latest ? 'Latest snapshot' : snapHead()) : d.src === 'note' ? 'From a notification · simulated fill' + (d.deal ? ' · deal ' + esc(d.deal) : '') : what;
  var head = '<div class="dh"><div style="display:flex;gap:10px;align-items:center">' + logo(a.broker) + '<div><b>' + esc(accName(a)) + ' · ' + esc(a.nick) + '</b><div class="mut" style="font-size:12px" data-dd-ctx>' + ctx + '</div></div></div><button class="btn sm" data-a="ddclose" data-dd-close aria-label="Close">✕</button></div>';
  if (d.trade) {
    var c = CLOSED.filter(function (x) { return x.id === d.trade; })[0];
    body = c ? '<div class="ddtrade" data-dd-trade="' + esc(c.id) + '"><div class="ch" style="margin-bottom:8px"><span><b>' + c.ins + '</b> ' + cdirCell(c) + '</span><b class="' + plc(c.pl) + '">' + sgn(c.pl) + '</b></div><div class="gg num"><div><small>Closed</small><b>' + DAYS[c.day] + ' · ' + c.t + '</b></div><div><small>Size</small><b>' + c.lots.toFixed(2) + ' lots</b></div><div><small>Entry → exit</small><b>' + c.en + ' → ' + c.ex + '</b></div><div><small>Source</small><b>' + esc(SRC[c.src] || c.src) + '</b></div></div></div><div class="lbl" style="margin-top:10px">This fill maps to a closed trade, so there’s no open position to show. Realized P/L is the trade’s, as in the Closed trades table.</div>' : '<div class="na">Trade not found</div>';
  } else if (st.kind === 'unavail') {
    body = '<div class="na" data-dd-unavail><b style="color:#171717">Position data unavailable</b><span>' + esc(a.reason || 'Partner sync failed') + '. Shown as unavailable, not as zero positions.</span><button class="btn sm" data-a="rsync" data-v="' + a.id + '">Retry sync</button></div>';
  } else if (st.kind === 'nosnap') {
    body = '<div class="na" data-dd-nosnap><b style="color:#171717">No position snapshot for ' + DAYS[st.day] + '</b><span>The demo records positions at each sync only. Equity and margin for this date are simulated, but which positions were open isn’t known.</span><button class="btn sm pri" data-a="ddlatest">View latest</button></div>';
  } else {
    var L = ddPos(a, dir), pl = r2(sumOf(L, 'pl')), lo = 0, sh = 0; L.forEach(function (p) { if (p.usd > 0) lo += p.usd; else sh -= p.usd; });
    var sum = '<div class="ddsum"><div><small>Open positions' + (dir ? ' · ' + dirName(dir) : '') + '</small><b data-dd-count>' + L.length + '</b></div><div><small>Unrealized P/L</small><b class="' + plc(pl) + '" data-dd-pl>' + sgn(pl) + '</b></div>' +
      (ex ? (dir !== 'short' ? '<div><small>Long exposure</small><b data-dd-xl>' + usd0(lo) + '</b></div>' : '') + (dir !== 'long' ? '<div><small>Short exposure</small><b data-dd-xs>' + usd0(sh) + '</b></div>' : '') + (dir ? '' : '<div><small>Net exposure</small><b data-dd-xn>' + (Math.round(lo - sh) === 0 ? '$0' : sgn0(lo - sh)) + '</b></div>') : '') + '</div>';
    var when = '<div class="lbl ddwhen" data-dd-when>' + (a.status === 'stale' ? '<span class="tag wa" style="margin:0 6px 0 0">Last known</span>' : '') + esc(ddWhen(a)) + (d.latest ? ' · selected date ' + DAYS[crEnd()] + ' has no position snapshot' : '') + (dir ? ' · ' + dirName(dir) + ' positions only (Direction filter)' : '') + '</div>';
    body = sum + when + (L.length ? '<div class="ddrows" data-dd-rows><div class="ddrow h' + (ex ? ' x' : '') + '"><span>Symbol</span><span class="hide-m">Side</span><span class="hide-m r">Size</span>' + (ex ? '<span class="hide-m r">Exposure</span>' : '') + '<span class="r">Unrealized P/L</span></div>' + L.map(function (p) { return ddRow(p, ex, d.focus); }).join('') + '</div>'
      : '<div class="na" data-dd-empty style="min-height:120px"><b style="color:#171717">No open positions</b><span>The positions feed synced ' + esc(ddSynced(a)) + ' and returned none' + (dir ? ' for ' + dirName(dir).toLowerCase() + ' positions' : '') + '.</span></div>');
  }
  var foot = '<div class="ddfoot"><button class="lnk" data-a="ddacct" data-v="' + a.id + '">Account details →</button>' + (d.src === 'cmp' ? '<span class="lbl">Closing returns to the same comparison</span>' : '') + '</div>';
  return '<div class="ov" data-a="ddclose"></div><aside class="drw ddp" role="dialog" aria-modal="true" aria-label="' + esc(accName(a)) + ' · ' + what + '" data-dd-panel="' + a.id + '" data-dd-src="' + d.src + '">' + head + '<div class="db">' + body + foot + '</div></aside>';
}
function ddOpen(o) {
  o.scroll = root.scrollTop; o.tab = S.tab; S.cmpSelOpen = false; S.crOpen = false; S.fbDate = false; S.panel = null; S.drawer = null; S.alPop = [];
  S.dd = o; render(); root.scrollTop = o.scroll;
  var b = root.querySelector('[data-dd-close]'); if (b) try { b.focus({ preventScroll: true }); } catch (e) { b.focus(); }
}
var _render25 = render;
render = function () {
  if (S.dd && S.dd.tab !== S.tab) S.dd = null;
  _render25();
  if (S.dd) { try { root.insertAdjacentHTML('beforeend', ddPanel()); } catch (err) { S.dd = null; } }
};
H7.ddclose = function () {
  var d = S.dd; if (!d) return; S.dd = null; render(); root.scrollTop = d.scroll;
  var t = d.ret && root.querySelector(d.ret); if (t) try { t.focus({ preventScroll: true }); } catch (e) { t.focus(); }
};
H7.ddlatest = function () { if (!S.dd) return; S.dd.latest = true; var k = root.scrollTop; render(); root.scrollTop = k; };
H7.ddacct = function (el, v) { S.dd = null; H7.open(el, v); };
var _activate25 = activate;
activate = function () { S.dd = null; return _activate25.apply(null, arguments); };
document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && S.on && S.dd) { e.stopPropagation(); H7.ddclose(); } }, true);
root.addEventListener('keydown', function (e) {
  if (e.key !== 'Enter' && e.key !== ' ') return;
  var t = e.target; if (!t || !t.getAttribute || /^(BUTTON|INPUT|SELECT|TEXTAREA|A)$/.test(t.tagName)) return;
  if (t.getAttribute('role') === 'button' && t.getAttribute('data-a')) { e.preventDefault(); t.click(); }
});

/* ---------- 1 · Compare ---------- */
var _cmpRow25 = cmpRow;
cmpRow = function (a, sn, mode, scale) {
  var h = _cmpRow25(a, sn, mode, scale);
  if (mode !== 'pl' && mode !== 'ex') return h;
  return h.replace('<span class="crow-viz">', '<span class="crow-viz cdrill" data-a="cpos" data-v="' + a.id + '|' + mode + '" role="button" tabindex="0" title="Show the positions behind this bar" aria-label="Show ' + (mode === 'pl' ? 'open P/L' : 'exposure') + ' positions for ' + esc(accName(a)) + '">');
};
var _cmpExact25 = cmpExact;
cmpExact = function (list, SN, PD) {
  var btn = function (id, v) { return '<button class="cnum" data-a="cpos" data-v="' + id + '|np" aria-label="Show open positions for ' + esc(accName(acc(id))) + '">' + v + '<span class="cgo" aria-hidden="true"> ›</span></button>'; };
  return _cmpExact25(list, SN, PD)
    .replace(/(<td class="v num" data-x="np:([^"]+)">)((?:(?!<\/td>)[\s\S])*)(<\/td>)/g, function (m, o, id, v, c) { return o + btn(id, v) + c; })
    .replace(/(<div class="mcard" data-mcard="([^"]+)">(?:(?!data-mcard=)[\s\S])*?<span>Open positions<\/span><b>)((?:(?!<\/b><\/div>)[\s\S])*)(<\/b><\/div>)/g, function (m, o, id, v, c) { return o + btn(id, v) + c; });
};
H7.cpos = function (el, v) { var x = v.split('|'); ddOpen({ acc: x[0], src: 'cmp', metric: x[1], ret: '[data-a="cpos"][data-v="' + v + '"]' }); };

/* ---------- 2 · Monitor › Currency ---------- */
function ccyPositions(c) {
  var pos = mPos().filter(function (p) { var f = INS[p.ins] && INS[p.ins].fx; return f && f.indexOf(c) >= 0; });
  var con = function (p) { return INS[p.ins].fx[0] === c ? p.usd : -p.usd; }, tot = 0, pl = 0;
  pos.sort(function (x, y) { return Math.abs(con(y)) - Math.abs(con(x)); });
  pos.forEach(function (p) { tot += con(p); pl += p.pl; });
  var cx = function (v) { return '<span class="cdirx ' + (v < 0 ? 'neg' : 'pos') + '">' + (v < 0 ? 'Short ' : 'Long ') + c + '</span> <b>' + sgn0(v) + '</b>'; };
  var why = function (p) { var f = INS[p.ins].fx, base = f[0] === c; return dirName(pdir(p)) + ' ' + p.ins + ' → ' + (con(p) < 0 ? 'short ' : 'long ') + c + ' (' + c + ' is the ' + (base ? 'base' : 'quote') + ' currency)'; };
  var rows = pos.map(function (p) { var a = acc(p.a), v = con(p); return '<tr class="click" data-a="open" data-v="' + a.id + '" data-ccy-pos="' + p.id + '"><td>' + logo(a.broker, true) + ' ' + esc(accName(a)) + (a.status === 'stale' ? ' <span class="tag wa">Last known</span>' : '') + '</td><td><b>' + p.ins + '</b></td><td>' + pdirCell(p) + '</td><td class="r">' + p.lots.toFixed(2) + '</td><td class="r" data-ccy-con="' + p.id + '" title="' + esc(why(p)) + '">' + cx(v) + '</td><td class="r ' + plc(p.pl) + '">' + sgn(p.pl) + '</td></tr>'; }).join('');
  var cards = pos.map(function (p) { var a = acc(p.a), v = con(p); return '<div class="ccyc" data-ccy-card="' + p.id + '"><div class="ccyc1"><b>' + p.ins + '</b> ' + pdirCell(p) + ' <span class="mut">' + p.lots.toFixed(2) + ' lots</span><span class="' + plc(p.pl) + '" style="margin-left:auto">' + sgn(p.pl) + '</span></div><div class="ccyc2">' + cx(v) + '</div><div class="lbl">' + esc(accName(a)) + ' · ' + esc(why(p)) + '</div></div>'; }).join('');
  return '<div class="card pad" data-section="ccy-positions"><div class="ch"><div><h3>' + c + ' · open positions</h3><div class="lbl">Trade side is the position’s direction. ' + c + ' exposure is the effect on your ' + c + ': a long EURUSD is short USD.</div></div><span class="pill p-pu">' + c + ' ' + sk1(tot) + '</span></div>' +
    (pos.length ? '<div class="hide-m" style="overflow-x:auto"><table class="num" data-table="ccy-positions"><thead><tr><th>Account</th><th>Instrument</th><th>Trade side</th><th class="r">Size (lots)</th><th class="r">' + c + ' exposure</th><th class="r">Unrealized P/L</th></tr></thead><tbody>' + rows +
      '<tr class="mfoot"><td colspan="4"><b>Total net ' + c + '</b> <span class="mut">· ' + pos.length + ' position' + (pos.length === 1 ? '' : 's') + ' · matches the ' + c + ' bar above</span></td><td class="r"><b class="' + (tot < 0 ? 'neg' : 'pos') + '" data-ccy-pos-total>' + sk1(tot) + '</b></td><td class="r ' + plc(pl) + '"><b>' + sgn(r2(pl)) + '</b></td></tr></tbody></table></div><div class="show-m">' + cards + '<div class="kv" style="padding:8px 2px"><b>Total net ' + c + '</b><b class="' + (tot < 0 ? 'neg' : 'pos') + '">' + sk1(tot) + '</b></div></div>'
      : '<div class="na" style="min-height:110px">No open positions contribute to ' + c + ' in this scope.</div>') + '</div>';
}
var _monCur25 = monCurrency;
monCurrency = function () {
  var h = _monCur25(), i = h.indexOf('<div class="g12r mb16">'); if (i < 0) return h;
  var v = S.mon.ccyView === 'positions' ? 'positions' : 'exposure', c = S.mon.ccy;
  var tog = '<div class="ccytog mb16" data-ccy-toggle><span class="lbl">' + esc(c) + ' details</span><span class="seg" role="group" aria-label="Currency details">' + [['exposure', 'Exposure'], ['positions', 'Open positions']].map(function (x) { return '<button data-a="mccyview" data-v="' + x[0] + '" class="' + (v === x[0] ? 'on' : '') + '" aria-pressed="' + (v === x[0]) + '">' + x[1] + '</button>'; }).join('') + '</span></div>';
  if (v !== 'positions') return h.slice(0, i) + tog + h.slice(i);
  var j = h.indexOf('<div class="card pad mside">');
  return h.slice(0, i) + tog + '<div class="g12r mb16">' + ccyPositions(c) + (j >= 0 ? h.slice(j) : '</div>');
};
H7.mccyview = function (el, v) { S.mon.ccyView = v; var k = root.scrollTop; render(); root.scrollTop = k; };
var _monKpis25 = monKpis;
monKpis = function () { return _monKpis25().replace('<div><span class="l5">Open P/L</span>', '<div class="mkgo" data-a="mopenpl" role="button" tabindex="0" title="Open Holdings with these filters"><span class="l5">Open P/L <span class="mkarr" aria-hidden="true">→ Holdings</span></span>'); };
H7.mopenpl = function () {
  S.mon.view = 'holdings'; S.mon.opt = false; S.mon.open = {};
  try { holdGroups().forEach(function (g) { S.mon.open[g.k] = true; }); } catch (e) {}
  render(); var s = root.querySelector('[data-section="mon-holdings"]'); if (s) root.scrollTop = Math.max(0, s.offsetTop - 90);
};

/* ---------- 3 · Overview ---------- */
var _accCard25 = accCard4;
accCard4 = function (b) {
  var h = _accCard25(b), m = /data-card="([^"]+)"/.exec(h); if (!m || !acc(m[1])) return h; var id = m[1];
  return h.replace(/<div class="kvr"><span>Open positions<\/span><b>([^<]*)<\/b><\/div>/, function (x, t) { return '<div class="kvr"><span>Open positions</span><button class="lnk kvgo" data-a="ovpos" data-v="' + id + '" aria-label="Show ' + esc(t) + ' for ' + esc(accName(acc(id))) + ' in the Trade Tracker">' + esc(t) + ' →</button></div>'; });
};
H7.ovpos = function (el, v) {
  S.posF.acc = v; S.posF.broker = ''; S.posF.ins = ''; S.posF.status = ''; S.ptab = 'open'; S.fopen = false; render();
  var tc = root.querySelector('[data-section="trades"]'); if (tc) { root.scrollTop = tc.offsetTop - 20; var f = tc.querySelector('[data-acc-chip] .lnk'); if (f) try { f.focus({ preventScroll: true }); } catch (e) {} }
};
H7.ovposclr = function () { S.posF.acc = ''; var k = root.scrollTop; render(); root.scrollTop = k; };
H7.ovlatest = function () { S.ovLatest = true; var k = root.scrollTop; render(); root.scrollTop = k; };
H7.ovlatestx = function () { S.ovLatest = false; var k = root.scrollTop; render(); root.scrollTop = k; };
var _pc25 = positionsCard4;
positionsCard4 = function () {
  var h = _pc25(), f = S.posF;
  if (f.acc && acc(f.acc)) h = h.replace(/(<span class="lbl" data-pos-summary>(?:(?!<\/span>)[\s\S])*<\/span>)/, function (m) { return m + '<span class="fchip" data-acc-chip>Account: ' + esc(accName(acc(f.acc))) + ' <button class="lnk" data-a="ovposclr" aria-label="Clear account filter">× Clear</button></span>'; });
  if (S.ptab === 'open' && ovHist()) {
    var k = h.indexOf('<div style="overflow-x:auto"><table class="num ptab" data-table="positions">'); if (k < 0) k = h.indexOf('<div class="mut" style="padding:22px;text-align:center">No positions match');
    if (k >= 0) {
      if (!S.ovLatest) h = h.slice(0, k) + '<div class="na" data-ov-nosnap style="min-height:150px"><b style="color:#171717">No position snapshot for ' + DAYS[S.cr.e] + '</b><span>Your date range ends ' + DAYS[S.cr.e] + '. The demo only records open positions at the latest sync (' + DAYS[30] + ' 11:58).</span><button class="btn sm pri" data-a="ovlatest">View latest</button></div></div>';
      else h = h.slice(0, k) + '<div class="ddlnote" data-ov-latest>Showing the latest positions (' + DAYS[30] + ' 11:58 sync). Your date range ends ' + DAYS[S.cr.e] + '. <button class="lnk" data-a="ovlatestx">Back to ' + DAYS[S.cr.e] + '</button></div>' + h.slice(k);
    }
  }
  return h;
};
var _setDate25 = setDate;
setDate = function () { S.ovLatest = false; if (S.dd) S.dd.latest = false; return _setDate25.apply(null, arguments); };
var _sum25 = summary4;
summary4 = function () {
  var h = _sum25(), L = ACC, rep = L.filter(reporting), miss = L.filter(function (a) { return a.status === 'none'; }), st = L.filter(function (a) { return a.status === 'stale'; });
  if (st.length) h = h.replace('<div class="lbl">Total equity</div>', '<div class="lbl">Total equity <span class="tag wa" data-ov-lastknown title="' + esc(st.map(function (a) { return accName(a) + ' last known ' + a.snap; }).join(', ')) + '">Includes last-known values</span></div>');
  var cov;
  if (!miss.length && !st.length) cov = '<div class="lbl" style="margin-top:10px" data-ov-coverage>All ' + L.length + ' accounts included · aggregated in USD</div>';
  else cov = '<div class="ovcov" data-ov-coverage><span class="ovcovt"><b data-ov-covtext>' + rep.length + ' of ' + L.length + ' accounts included' + (miss.length ? ' · ' + miss.length + ' missing' : '') + '</b>' + (st.length ? ' · ' + st.length + ' last known' : '') + '</span> <button class="lnk" data-a="ovcov" aria-expanded="' + !!S.ovCov + '">' + (S.ovCov ? 'Hide' : 'Which accounts?') + '</button>' +
    (S.ovCov ? '<div class="ovcovl" data-ov-covlist>' + L.map(function (a) { var k = a.status === 'none' ? 'miss' : a.status === 'stale' ? 'old' : 'ok'; return '<span class="ovca ' + k + '" data-cov-acc="' + a.id + '">' + (k === 'ok' ? '✓' : k === 'old' ? '◷' : '✕') + ' ' + esc(accName(a)) + ' <small>' + (k === 'ok' ? 'live' : k === 'old' ? 'last known ' + esc(a.snap) : 'missing · not in totals') + '</small></span>'; }).join('') + '</div>' : '') +
    '<div class="lbl">Aggregated in USD. Missing accounts are left out of the totals, not counted as $0.</div></div>';
  return h.replace(/<div class="lbl" style="margin-top:10px">Aggregated in USD across \d+ reporting accounts<\/div>/, cov);
};
H7.ovcov = function () { S.ovCov = !S.ovCov; var k = root.scrollTop; render(); root.scrollTop = k; };

/* ---------- 4 · Portfolios › Long vs Short ---------- */
function pfNoDir(fn) { var d = S.pfDir; S.pfDir = ''; try { return fn(); } finally { S.pfDir = d; } }
function lsBars() {
  if (!rangeOK()) return '';
  var T = pfNoDir(pfTrades), R = ['long', 'short'].map(function (d) { var L = T.filter(function (c) { return cdir(c) === d; }); return { d: d, n: L.length, pl: r2(sumOf(L, 'pl')) }; });
  var mx = Math.max(Math.abs(R[0].pl), Math.abs(R[1].pl)) || 1;
  var rows = R.map(function (r) {
    return '<button class="lsrow' + (S.pfSide === r.d ? ' on' : '') + '" data-a="pfside" data-v="' + r.d + '" data-ls="' + r.d + '" aria-pressed="' + (S.pfSide === r.d) + '" aria-label="' + dirName(r.d) + ': ' + (r.pl === 0 ? '$0.00' : sgn(r.pl)) + ' net realized from ' + r.n + ' closed trades. Show these trades">' +
      '<span class="lsl"><b>' + dirName(r.d) + '</b><small data-ls-n="' + r.d + '">' + r.n + ' closed trade' + (r.n === 1 ? '' : 's') + '</small></span>' +
      '<span class="lstrack"><s></s>' + (r.pl ? '<i class="' + (r.pl < 0 ? 'n' : 'p') + '" style="' + (r.pl < 0 ? 'right:50%' : 'left:50%') + ';width:' + (Math.abs(r.pl) / mx * 50).toFixed(1) + '%"></i>' : '') + '</span>' +
      '<b class="lsv ' + (r.pl === 0 ? '' : plc(r.pl)) + '" data-ls-pl="' + r.d + '">' + (r.pl === 0 ? '$0.00' : sgn(r.pl)) + '</b></button>';
  }).join('');
  return '<div class="lsbox" data-section="long-short"><div class="ch" style="margin:0 0 4px"><h4 style="margin:0;font-size:13px">Long vs Short · net realized P/L</h4><span class="lbl">Direction of the closed position · click a bar to see its trades</span></div>' + rows +
    '<div class="lsaxis" aria-hidden="true"><span></span><span><i>' + sgn(-mx) + '</i><i>$0</i><i>' + sgn(mx) + '</i></span><span></span></div>' +
    (S.pfDir ? '<div class="lbl" style="margin-top:4px">Both sides are shown here. The ' + dirName(S.pfDir) + ' Direction filter still applies to the rest of Analytics.</div>' : '') + '</div>';
}
var _an25 = analyticsView;
analyticsView = function (tr, label, ids) {
  var h = _an25(tr, label, ids); if (S.tab !== 'portfolios') return h;
  var b = lsBars(); if (!b) return h;
  var i = h.indexOf('<div class="agrid">'); if (i >= 0) return h.slice(0, i) + b + h.slice(i);
  i = h.lastIndexOf('</div>'); return h.slice(0, i) + b + h.slice(i);
};
var _pf25 = portfolios;
portfolios = function () {
  var h = _pf25(); if (S.pfView === 'analytics' || !S.pfSide) return h;
  var k = h.indexOf('<div class="card pad mb16" data-section="pf-closed">'); if (k < 0) return h;
  var side = S.pfSide, pred = function (c) { return pfNoDir(function () { return pfTradePred(c); }) && cdir(c) === side; };
  return h.slice(0, k) + '<div class="card pad mb16" data-section="pf-closed" data-side="' + side + '"><div class="ch"><h3>Closed trades</h3><div class="ctl"><span class="fchip" data-side-chip>' + dirName(side) + ' trades only <button class="lnk" data-a="pfsideclr" aria-label="Clear the ' + dirName(side) + ' filter">× Clear</button></span><button class="btn sm" data-a="pfanalytics">Analytics →</button><button class="btn sm pri" data-a="journal" data-v="log">Open in Trading Journal →</button></div></div>' +
    closedTable(pfAccounts(), pfLabel() + ' · ' + dirName(side) + ' trades', pred) + '</div>';
};
H7.pfside = function (el, v) { S.pfSide = v; S.pfView = 'main'; render(); var s = root.querySelector('[data-section="pf-closed"]'); if (s) root.scrollTop = Math.max(0, s.offsetTop - 20); };
H7.pfsideclr = function () { S.pfSide = ''; var k = root.scrollTop; render(); root.scrollTop = k; };

/* ---------- 5 · Manage, Account details, Alerts ---------- */
function mbConnType(a) { return a && (a.partnerId || a.server) ? 'Partner API' : '<span class="mut">Source unavailable</span>'; }
function feedRows(a) {
  var none = a.status === 'none', stale = a.status === 'stale', t = none ? 'Never' : ddSynced(a), old = 'Last known at ' + (none ? '' : snapTime(a));
  var np = POS.filter(function (p) { return p.a === a.id; }).length, nt = CLOSED.filter(function (c) { return c.a === a.id && c.src !== 'manual'; }).length;
  var hist = none ? 'Never' : S.sync[a.id] === 'done' ? 'just now' : stale ? snapTime(a) : DAYS[30] + ' 11:45';
  return [
    ['bal', 'Balances', none ? ['na', 'Balance data unavailable'] : stale ? ['old', old] : ['ok', 'Up to date'], t],
    ['pos', 'Open positions', none ? ['na', 'Position data unavailable'] : stale ? ['old', old + ' · ' + np + ' position' + (np === 1 ? '' : 's')] : np ? ['ok', np + ' open position' + (np === 1 ? '' : 's')] : ['zero', 'No open positions'], t],
    ['hist', 'Trade history', none ? ['na', 'Trade history unavailable'] : stale ? ['old', old + ' · ' + nt + ' trade' + (nt === 1 ? '' : 's')] : ['ok', 'Up to date · ' + nt + ' synced trade' + (nt === 1 ? '' : 's')], hist]
  ];
}
function feedSection(a) {
  return '<section data-feed-status><h4>Data status</h4>' + feedRows(a).map(function (r) { return '<div class="fdrow" data-feed="' + r[0] + '" data-feed-state="' + r[2][0] + '"><span class="fdl">' + r[1] + '</span><span class="fds ' + r[2][0] + '">' + esc(r[2][1]) + '</span><span class="fdt"><small>Last successful update</small>' + esc(r[3]) + '</span></div>'; }).join('') +
    '<div class="lbl" style="margin-top:6px">Each feed syncs from ' + esc(a.broker) + '’s partner API on its own schedule (demo times). Missing data shows as unavailable, never as $0 or 0 positions. Connection: ' + mbConnType(a) + '.</div></section>';
}
function feedPosState(a) { var r = feedRows(a)[1][2]; return '<span class="fds ' + r[0] + '">' + esc(r[1]) + '</span>'; }
var _manage25 = manage;
manage = function () {
  return _manage25()
    .replace(/(<tr data-manage-row="([^"]+)"><td>(?:(?!<\/td>)[\s\S])*<\/td>)<td>(?:undefined|null)?<\/td>/g, function (m, pre, id) { return pre + '<td>' + mbConnType(acc(id)) + '</td>'; })
    .replace('<th>Status</th><th>Last sync</th>', '<th>Status</th><th>Open positions</th><th>Last sync</th>')
    .replace(/<td data-sync="([^"]+)">/g, function (m, id) { var a = acc(id); return '<td data-pos-state="' + id + '"><button class="lnk fdgo" data-a="open" data-v="' + id + '" title="Account details">' + (a ? feedPosState(a) : '') + '</button></td>' + m; })
    .replace('<span class="pill p-gr">Not a partner broker</span></td>', '<span class="pill p-gr">Not a partner broker</span></td><td class="mut">Not connected</td>');
};
var _drawer25 = drawer;
drawer = function (id) {
  var h = _drawer25(id), a = acc(id); if (!a || S.dload) return h;
  var k = h.indexOf('<div class="seg dtabs">');
  if (k >= 0) { if (S.dtab !== 'overview') return h; var e = h.indexOf('</div>', k) + 6; return h.slice(0, e) + feedSection(a) + h.slice(e); }
  k = h.indexOf('<div class="db">'); if (k < 0) return h; k += 15; return h.slice(0, k) + feedSection(a) + h.slice(k);
};
function fillTarget(n) {
  var p = POS.filter(function (x) { return x.a === n.acc && x.ins === n.ins && x.side === n.side; })[0]; if (p) return { pos: p };
  var cs = CLOSED.filter(function (c) { return c.a === n.acc && c.ins === n.ins; }).sort(function (x, y) { return y.day - x.day || (y.t > x.t ? 1 : -1); });
  return cs[0] ? { trade: cs[0] } : null;
}
var _note25 = alNoteHtml;
alNoteHtml = function (n, c) {
  var h = _note25(n, c); if (!n || n.kind !== 'fill') return h;
  var m = fillTarget(n); if (!m) return h;
  var i = h.lastIndexOf('</div>');
  return h.slice(0, i) + '<div class="alnact" data-note-act="' + (m.pos ? 'position' : 'trade') + '"><button class="btn sm" data-a="' + (m.pos ? 'alpos' : 'altrade') + '" data-v="' + esc(n.id) + '">' + (m.pos ? 'View position' : 'View trade') + '</button><span class="lbl">' + (m.pos ? 'Position still open' : 'Maps to a closed trade') + ' · simulated feed</span></div>' + h.slice(i);
};
function alNoteById(id) { return alStore().notes.filter(function (n) { return n.id === id; })[0]; }
H7.alpos = function (el, v) { var n = alNoteById(v), m = n && fillTarget(n); if (!m || !m.pos) return; ddOpen({ acc: n.acc, src: 'note', metric: 'np', focus: m.pos.id, deal: n.deal, ret: '[data-a="alpos"][data-v="' + v + '"]' }); };
H7.altrade = function (el, v) { var n = alNoteById(v), m = n && fillTarget(n); if (!m || !m.trade) return; ddOpen({ acc: n.acc, src: 'note', trade: m.trade.id, deal: n.deal, ret: '[data-a="altrade"][data-v="' + v + '"]' }); };

(function () {
  var st = document.createElement('style'); st.setAttribute('data-mb-v25', '1');
  st.textContent = [
    '#mb-root .cdrill{cursor:pointer;border-radius:8px;padding:6px;margin:-6px;outline:0;transition:background .12s}#mb-root .cdrill:hover{background:#f1efff}#mb-root .cdrill:focus-visible{box-shadow:0 0 0 2px var(--b)}',
    '#mb-root .cnum{border:0;background:none;padding:2px 6px;margin:-2px -6px;border-radius:6px;font:inherit;color:var(--b);font-weight:600;cursor:pointer;text-decoration:underline;text-underline-offset:3px}#mb-root .cnum:hover{background:#f1efff}#mb-root .cnum:focus-visible{outline:2px solid var(--b)}',
    '#mb-root .ddsum{display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:8px;margin-bottom:10px}#mb-root .ddsum>div{background:#faf9f6;border-radius:10px;padding:8px 10px}#mb-root .ddsum small{display:block;font-size:11px;color:var(--tx2)}#mb-root .ddsum b{font-size:18px;font-variant-numeric:tabular-nums}',
    '#mb-root .ddwhen{margin-bottom:8px}',
    '#mb-root .ddrow{display:grid;grid-template-columns:1.2fr .9fr .8fr 1fr;gap:8px;align-items:center;padding:9px 6px;border-bottom:1px solid #f3f2ee;font-size:13px;font-variant-numeric:tabular-nums}#mb-root .ddrow.x{grid-template-columns:1fr .8fr .8fr 1.2fr 1fr}',
    '#mb-root .ddrow.h{font-size:11px;color:var(--tx2);font-weight:600;text-transform:uppercase;letter-spacing:.03em}#mb-root .ddrow .r{text-align:right}#mb-root .ddrow.on{background:#f4f2ff;border-radius:8px;box-shadow:inset 3px 0 0 var(--b)}#mb-root .ddrow .c1 small{font-size:11.5px;color:#5c5c5c}',
    '#mb-root .ddfoot{display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;margin-top:14px}',
    '#mb-root .ddtrade{border:1px solid var(--l1);border-radius:12px;padding:12px}',
    '#mb-root .ddlnote{font-size:12.5px;background:#f4f2ff;color:#2d2490;border-radius:10px;padding:8px 12px;margin-bottom:8px}',
    '#mb-root .ccytog{display:flex;align-items:center;gap:10px;flex-wrap:wrap}#mb-root .ccytog .lbl{font-weight:600;color:#404040}',
    '#mb-root .cdirx{font-size:11px;font-weight:600;border-radius:6px;padding:1px 6px;white-space:nowrap}#mb-root .cdirx.neg{background:var(--t);color:var(--b)}#mb-root .cdirx.pos{background:rgba(135,158,7,.14);color:#5f7005}',
    '#mb-root .ccyc{border:1px solid var(--l1);border-radius:12px;padding:10px 12px;margin-bottom:8px;font-size:13px}#mb-root .ccyc1{display:flex;align-items:center;gap:6px;flex-wrap:wrap}#mb-root .ccyc2{margin:4px 0 2px}',
    '#mb-root .mkgo{cursor:pointer;border-radius:10px;transition:background .12s}#mb-root .mkgo:hover{background:#f7f5ff}#mb-root .mkgo:focus-visible{outline:2px solid var(--b)}#mb-root .mkarr{color:var(--b);font-weight:600;margin-left:2px}',
    '#mb-root .kvgo{font-size:11.5px;font-weight:600;text-decoration:underline;text-underline-offset:2px;padding:0}',
    '#mb-root .fchip{display:inline-flex;align-items:center;gap:6px;background:var(--t);color:#2d2490;border-radius:999px;padding:3px 10px;font-size:12px;font-weight:600;white-space:nowrap}#mb-root .fchip .lnk{font-size:12px}',
    '#mb-root .ovcov{margin-top:10px;font-size:12.5px}#mb-root .ovcovt b{font-weight:600}#mb-root .ovcovl{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0 4px}#mb-root .ovca{border-radius:8px;padding:3px 8px;font-size:12px;background:#f1f1ee}#mb-root .ovca small{color:inherit;opacity:.8;margin-left:2px}#mb-root .ovca.ok{background:#eef6e0;color:#3f4d03}#mb-root .ovca.old{background:#fdf0dc;color:#9a4b03}#mb-root .ovca.miss{background:#fff;color:#404040;border:1px dashed #c9c6bd}',
    '#mb-root .lsbox{background:#faf9f6;border-radius:12px;padding:12px 14px;margin-bottom:14px}',
    '#mb-root .lsrow,#mb-root .lsaxis{display:grid;grid-template-columns:120px 1fr 110px;gap:12px;align-items:center}#mb-root .lsrow{width:100%;border:0;background:none;padding:8px 6px;border-radius:10px;font:inherit;text-align:left;cursor:pointer;color:#171717}#mb-root .lsrow:hover,#mb-root .lsrow.on{background:#f1efff}#mb-root .lsrow.on{box-shadow:inset 0 0 0 1.5px var(--b)}',
    '#mb-root .lsl b{display:block;font-size:13.5px}#mb-root .lsl small{display:block;font-size:11.5px;color:var(--tx2)}',
    '#mb-root .lstrack{position:relative;display:block;height:16px;border-radius:8px;background:#ebe9e3;overflow:hidden}#mb-root .lstrack s{position:absolute;left:50%;top:-2px;bottom:-2px;width:2px;background:#8a8a8a;z-index:1}#mb-root .lstrack i{position:absolute;top:0;bottom:0}#mb-root .lstrack i.p{background:#879e07}#mb-root .lstrack i.n{background:#5945f1}',
    '#mb-root .lsv{text-align:right;font-variant-numeric:tabular-nums;font-size:14px}#mb-root .lsaxis{padding:0 6px;font-size:10.5px;color:var(--tx2)}#mb-root .lsaxis>span:nth-child(2){display:flex;justify-content:space-between}#mb-root .lsaxis i{font-style:normal}',
    '#mb-root .fdrow{display:grid;grid-template-columns:110px 1fr 130px;gap:8px;align-items:center;padding:8px 0;border-bottom:1px solid #f3f2ee;font-size:12.5px}#mb-root .fdl{font-weight:600}#mb-root .fds{font-weight:600}#mb-root .fds.ok{color:#15803d}#mb-root .fds.zero{color:#404040}#mb-root .fds.old{color:#9a4b03}#mb-root .fds.na{color:#b42318}#mb-root .fdt{text-align:right}#mb-root .fdt small{display:block;font-size:10.5px;color:var(--tx2)}',
    '#mb-root .fdgo{font-size:12.5px;text-align:left;white-space:normal}#mb-root .alnact{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:6px}',
    '@keyframes mbddup{from{transform:translateY(40px);opacity:0}to{transform:none;opacity:1}}',
    '@media (max-width:760px){#mb-root .drw.ddp{top:auto;left:0;right:0;bottom:0;width:100%;max-height:84vh;border-radius:18px 18px 0 0;animation:mbddup .2s ease-out}#mb-root .ddp .db{padding-bottom:28px}#mb-root .ddrow,#mb-root .ddrow.x{grid-template-columns:1fr auto}#mb-root .ddrow.h .hide-m{display:none}',
    '#mb-root .ccytog .seg{display:flex;width:100%}#mb-root .ccytog .seg button{flex:1}#mb-root .lsrow,#mb-root .lsaxis{grid-template-columns:72px 1fr 92px;gap:8px}#mb-root .fdrow{grid-template-columns:1fr;row-gap:2px}#mb-root .fdt{text-align:left}#mb-root .cdrill{margin:-4px;padding:4px}}'
  ].join('\n');
  document.head.appendChild(st);
})();

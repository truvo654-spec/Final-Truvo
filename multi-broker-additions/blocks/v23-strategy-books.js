
/* ============================ v23 · Several Strategy Books per trade ============================
   A trade can carry more than one Strategy Book. The list keeps the order books were added; the first is the primary.
   Journal records keep `strategy` = primary (the Journal's own single field) and add `strategies` = the full list.
   If the Journal changes its Strategy field, that book becomes the primary; if it clears it, the trade has no books.
   Book filters match a trade when any of its books is selected, and each trade is still counted once in totals. */
function normList(v) { var L = Array.isArray(v) ? v : (typeof v === 'string' && v ? [v] : []), out = []; L.forEach(function (n) { if (typeof n === 'string' && n && out.indexOf(n) < 0) out.push(n); }); return out; }
function recList(x) {
  var L = normList(x.strategies), s = x.strategy || '';
  if (!s) return [];
  if (!L.length || L[0] === s) return L.length ? L : [s];
  return [s].concat(L.filter(function (n) { return n !== s; }));
}
function assignList(p) {
  var E = jEntries(), id = jid(p), rec = E && E.filter(function (x) { return x.id === id; })[0];
  if (rec) return recList(rec);
  return normList(lsGet(LS_ASSIGN, {})[mbKey(p)]);
}
function assignOf(p) { return assignList(p)[0] || ''; }
function sameList(a, b) { return a.join('\u0001') === b.join('\u0001'); }
function setAssign(p, v) {
  var L = normList(v), pend = lsGet(LS_ASSIGN, {}), k = mbKey(p); if (L.length) pend[k] = L; else delete pend[k]; lsSet(LS_ASSIGN, pend);
  var E = jEntries(); if (E) {
    var id = jid(p), hit = false;
    E = E.map(function (x) { if (x.id !== id) return x; hit = true; return Object.assign({}, x, { strategy: L[0] || '', strategies: L }); });
    lsSet(JPRE + 'entries', E); if (!hit) syncJournal();
  }
}
function syncJournal() {
  var E = jEntries(); if (!E) return false;
  var pend = lsGet(LS_ASSIGN, {}), byId = {}, changed = false;
  E.forEach(function (x, i) { byId[x.id] = i; });
  var put = function (p, closed) {
    var id = jid(p), k = mbKey(p), i = byId[id], L = normList(pend[k]);
    if (i == null) { var r = jRecord(p, closed); r.strategy = L[0] || ''; r.strategies = L; E.unshift(r); byId[id] = -1; changed = true; return; }
    if (i < 0) return;
    var x = E[i];
    if (closed && x.tradingStatus !== 'closed') { var c = jRecord(p, closed); E[i] = Object.assign({}, x, { tradingStatus: 'closed', pnlKnown: true, exitPrice: c.exitPrice, exitTime: c.exitTime, pnl: c.pnl, outcome: c.outcome, commission: 0 }); changed = true; }
    var J = recList(x); if (!sameList(J, L)) { if (J.length) pend[k] = J; else delete pend[k]; }
  };
  POS.forEach(function (p) { if (ticketOf(p)) put(p, null); });
  closedFromSim().forEach(function (c) { put(c.orig, c); });
  lsSet(LS_ASSIGN, pend);
  if (changed) lsSet(JPRE + 'entries', E);
  return changed;
}
/* ---------- book identity: every assigned name resolves to a saved book (rename-safe cache per name) ---------- */
function bookFor(t, nm, i) {
  var map = lsGet(LS_BOOKIDS, {}), k = tradeKey(t) + (i ? '::' + nm : ''), c = map[k];
  if (c && c.name === nm && bookById(c.id)) return { id: c.id };
  var cur = bookById(c && c.id); if (cur && cur.name === nm) return { id: cur.id };
  var m = booksNamed(nm);
  if (m.length === 1) { map[k] = { id: m[0].id, name: nm }; lsSet(LS_BOOKIDS, map); return { id: m[0].id }; }
  return { unresolved: nm, ambiguous: m.length > 1 };
}
function tradeBook(t) {
  var L = assignList(t); if (!L.length) return { none: true, ids: [] };
  var R = L.map(function (nm, i) { return bookFor(t, nm, i); }), out = {};
  for (var key in R[0]) out[key] = R[0][key];
  out.ids = []; R.forEach(function (r) { if (r.id && out.ids.indexOf(r.id) < 0) out.ids.push(r.id); });
  out.unres = R.filter(function (r) { return r.unresolved; }).map(function (r) { return r.unresolved; });
  return out;
}
function fMatch(tb, F) {
  if (!F.length) return true; if (tb.none) return F.indexOf('none') >= 0;
  var ids = tb.ids || (tb.id ? [tb.id] : []); return ids.some(function (id) { return F.indexOf(id) >= 0; });
}
function unresolvedFor(a) {
  var out = {}, add = function (tb) { (tb.unres || (tb.unresolved ? [tb.unresolved] : [])).forEach(function (n) { out[n] = (out[n] || 0) + 1; }); };
  POS.filter(function (x) { return x.a === a.id; }).forEach(function (x) { add(tradeBook(x)); });
  closedIn([a.id]).forEach(function (c) { if (c.ticket) add(tradeBook({ a: c.a, ticket: c.ticket, id: c.pid || c.id })); });
  return out;
}
function tbLabel(tb) {
  if (tb.none) return '<span class="mut">Unassigned</span>';
  var parts = (tb.ids || (tb.id ? [tb.id] : [])).map(function (id) { return esc(bookChipName(id)); });
  (tb.unres || (tb.unresolved ? [tb.unresolved] : [])).forEach(function (n) { parts.push('<span class="warn">“' + esc(n) + '” unresolved</span>'); });
  return parts.join(' + ');
}
/* ---------- Holdings: strategy cell, group summary, multi-select chooser ---------- */
function sbSummary(L) {
  var names = {}, un = 0; L.forEach(function (p) { var A = assignList(p); if (!A.length) un++; A.forEach(function (n) { names[n] = (names[n] || 0) + 1; }); });
  var ks = Object.keys(names);
  if (!ks.length) return '<span class="sbsum mut" data-sb-un="' + un + '">' + un + ' unassigned</span>';
  return '<span class="sbsum">' + ks.map(function (n) { return '<b>' + esc(n) + '</b>' + (L.length > 1 ? ' <span class="mut">' + names[n] + '</span>' : ''); }).join(' · ') + (un ? ' · <span class="mut" data-sb-un="' + un + '">' + un + ' unassigned</span>' : '') + '</span>';
}
function sbCell(p) {
  var A = assignList(p), lbl = esc(accName(acc(p.a))) + ' ' + p.ins;
  if (!A.length) return '<span class="sbw" data-sb="' + p.id + '"><button class="sbassign" data-a="sbpick" data-v="' + p.id + '" aria-haspopup="menu">+ Assign strategy</button></span>';
  return '<span class="sbw" data-sb="' + p.id + '" data-sb-count="' + A.length + '">' + A.map(function (n, i) {
    return '<button class="sbname' + (i ? ' sec' : '') + '" data-a="sbopen" data-v="' + esc(n) + '" title="' + (A.length > 1 && !i ? 'Primary book · ' : '') + 'Open the ' + esc(n) + ' strategy book">' + esc(n) + (A.length > 1 && !i ? '<i class="sbpri" aria-label="primary">●</i>' : '') + '</button>';
  }).join('') + '<button class="sbedit" data-a="sbpick" data-v="' + p.id + '" aria-haspopup="menu" aria-label="Add or change strategy books for ' + lbl + '">' + (A.length > 1 ? 'Edit' : '+ Add') + '</button></span>';
}
function sbPop() {
  var p = POS.filter(function (x) { return x.id === S.sbPick; })[0]; if (!p) return '';
  var A = assignList(p), B = books(), a = acc(p.a), at = S.sbAt || { x: 200, y: 200 }, known = B.map(function (b) { return b.name; });
  var rows = B.filter(function (b) { return b.status !== 'archived' || A.indexOf(b.name) >= 0; }).map(function (b) { return { n: b.name, st: b.status }; })
    .concat(A.filter(function (n) { return known.indexOf(n) < 0; }).map(function (n) { return { n: n, st: 'not in Playbook' }; }));
  var opts = rows.map(function (r) {
    var i = A.indexOf(r.n), on = i >= 0;
    return '<div class="sbrow" data-sb-row="' + esc(r.n) + '"><button class="sbopt' + (on ? ' on' : '') + '" data-a="sbset" data-v="' + esc(r.n) + '" role="menuitemcheckbox" aria-checked="' + on + '"><span class="bx" aria-hidden="true">' + (on ? '✓' : '') + '</span><span>' + esc(r.n) + '</span>' + (r.st !== 'active' ? '<small>' + esc(r.st) + '</small>' : '') + '</button>' +
      (on && A.length > 1 ? (i === 0 ? '<span class="sbprimtag" data-sb-primary>Primary</span>' : '<button class="sbprim" data-a="sbprim" data-v="' + esc(r.n) + '">Make primary</button>') : '') + '</div>';
  }).join('');
  return '<div class="sbscrim" data-a="sbclose"></div><div class="sbpop" role="menu" aria-label="Strategy books" data-sb-pop data-sb-multi style="left:' + at.x + 'px;top:' + at.y + 'px">' +
    '<div class="sbph"><b>Strategy books</b><span class="mut">' + esc(accName(a)) + ' · ' + p.ins + ' ' + dirName(pdir(p)).toLowerCase() + ' ' + p.lots.toFixed(2) + ' · #' + ticketOf(p) + '</span><span class="sbhint" data-sb-hint>' + (A.length ? A.length + ' selected' + (A.length > 1 ? ' · first is primary' : '') : 'Pick one or more') + '</span></div>' + opts +
    (A.length ? '<button class="sbopt clr" data-a="sbset" data-v="">Clear all</button>' : '') +
    '<div class="sbdone"><button class="btn sm pri" data-a="sbclose">Done</button></div>' +
    '<div class="sbpf"><span class="mut" data-sb-rule>The trade shows under each book you pick and is counted once in totals. The Journal’s Strategy field shows the primary.</span><button class="lnk" data-a="sbreview" data-v="' + p.id + '">Open this trade in Journal ↗</button><button class="lnk" data-a="simclose" data-v="' + p.id + '">Simulate close (demo)</button><span class="mut">Journal metadata only · nothing changes at the broker</span></div></div>';
}
function sbRollup(pf) {
  var L = portPos(pf.id), names = {}, un = 0; L.forEach(function (p) { var A = assignList(p); if (!A.length) un++; A.forEach(function (n) { names[n] = 1; }); });
  var k = Object.keys(names).length;
  return '<button class="sbroll" data-a="sbroll" data-v="' + pf.id + '" data-sb-roll="' + pf.id + '" title="Show strategy assignments in Holdings">▤ ' + k + ' strateg' + (k === 1 ? 'y' : 'ies') + ' · ' + un + ' unassigned</button>';
}
function simNote() { var c = closedFromSim(); return c.length ? '<div class="simrow" data-sim-note><span>Demo: ' + c.map(function (x) { var A = assignList(x.orig); return accName(acc(x.a)) + ' ' + x.ins + ' #' + x.ticket + ' closed' + (A.length ? ' · ' + esc(A.join(' + ')) : ''); }).join(', ') + '. Its Journal trade keeps the same record and strategies.</span><button class="lnk" data-a="simundo">Undo demo close</button></div>' : ''; }
function sbKeep() { S.sbOpenedAt = Date.now(); var k = root.scrollTop; render(); root.scrollTop = k; fitPop(); }
function sbLbl(p) { return accName(acc(p.a)) + ' ' + p.ins + ' ' + dirName(pdir(p)).toLowerCase(); }
H7.sbset = function (el, v) {
  var p = POS.filter(function (x) { return x.id === S.sbPick; })[0]; if (!p) return;
  var A = assignList(p), msg;
  if (!v) { A = []; msg = 'Strategies cleared · ' + sbLbl(p); }
  else { var i = A.indexOf(v); if (i >= 0) { A.splice(i, 1); msg = v + ' removed' + (i === 0 && A.length ? ' · ' + A[0] + ' is now primary' : '') + ' · ' + sbLbl(p); } else { A.push(v); msg = v + (A.length > 1 ? ' added · ' + A.length + ' books' : ' assigned') + ' · ' + sbLbl(p); } }
  setAssign(p, A); sbKeep(); toast(msg);
};
H7.sbprim = function (el, v) {
  var p = POS.filter(function (x) { return x.id === S.sbPick; })[0]; if (!p) return;
  var A = assignList(p); if (A.indexOf(v) < 0) return;
  setAssign(p, [v].concat(A.filter(function (n) { return n !== v; }))); sbKeep(); toast(v + ' is now primary · ' + sbLbl(p));
};
(function () {
  var st = document.createElement('style'); st.setAttribute('data-mb-sb23', '1');
  st.textContent = [
    '#mb-root .sbw{gap:4px 6px}#mb-root .sbname.sec{background:#f6f5fb;font-weight:500}',
    '#mb-root .sbpri{font-style:normal;font-size:7px;vertical-align:middle;margin-left:5px;color:#5945f1}',
    '#mb-root .sbrow{display:flex;align-items:center;gap:4px}#mb-root .sbrow .sbopt{flex:1;min-width:0}',
    '#mb-root .sbopt .bx{width:16px;height:16px;border:1.5px solid #b9b3d9;border-radius:4px;display:inline-flex;align-items:center;justify-content:center;font-size:11px;line-height:1;color:#fff;flex:0 0 auto}#mb-root .sbopt.on .bx{background:#5945f1;border-color:#5945f1}',
    '#mb-root .sbprim{border:0;background:none;color:#4836d9;font-size:11px;text-decoration:underline;cursor:pointer;white-space:nowrap;padding:2px 6px}',
    '#mb-root .sbprimtag{font-size:10.5px;font-weight:600;color:#3b2bb8;background:#e8e5ff;border-radius:999px;padding:2px 7px;margin-right:6px;white-space:nowrap}',
    '#mb-root .sbph .sbhint{display:block;font-size:11px;color:#5945f1;margin-top:3px}',
    '#mb-root .sbdone{display:flex;justify-content:flex-end;padding:8px 6px 2px}'
  ].join('\n');
  document.head.appendChild(st);
})();

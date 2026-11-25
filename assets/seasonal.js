/* CFA seasonal effects: snow, leaves, Halloween, blossom, summer. See assets/effects-config.js for the controls. */
(function () {
  'use strict';
  try {
    var C = { enabled: true, force: null, visitorSwitch: true, offPages: [] }, u = window.CFA_EFFECTS || {};
    for (var k in u) C[k] = u[k];
    var THEMES = { winter: 'Snow', autumn: 'Leaves', halloween: 'Halloween', spring: 'Blossom', summer: 'Sunshine' };
    var q = new URLSearchParams(location.search).get('effects');
    if (q === 'off') return;
    function themeFor(d) {
      var m = d.getMonth() + 1, day = d.getDate();
      if (m === 10 && day >= 24) return 'halloween';
      if (m === 9 || m === 10 || (m === 11 && day <= 18)) return 'autumn';
      if ((m === 11 && day >= 19) || m === 12 || (m === 1 && day <= 20)) return 'winter';
      if (m === 3 || m === 4) return 'spring';
      if ((m === 5 && day >= 25) || (m >= 6 && m <= 8)) return 'summer';
      return null;
    }
    var preview = !!(q && THEMES[q]), theme;
    if (preview) theme = q;
    else {
      if (!C.enabled) return;
      theme = (C.force && THEMES[C.force]) ? C.force : themeFor(new Date());
    }
    if (!theme) return;
    var path = location.pathname.replace(/index\.html$/, '').replace(/\.html$/, '').replace(/(.)\/$/, '$1') || '/';
    if (!preview && C.offPages.indexOf(path) > -1) return;
    if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var KEY = 'cfa_fx', enabled = true;
    try { if (localStorage.getItem(KEY) === 'off') enabled = false; } catch (e) {}
    var cv, ctx, W, H, DPR = Math.min(window.devicePixelRatio || 1, 1.5), parts = [], running = false, last = 0, t0 = Date.now(), extra = null, nextExtra = 0;
    var snowSprites = null, rnd = function (a, b) { return a + Math.random() * (b - a); }, clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };

    function count() {
      var a = W * H, s = W < 700 ? 0.6 : 1;
      if (theme === 'winter') return Math.round(clamp(a / 45000, 14, 28) * s);
      if (theme === 'summer') return Math.round(clamp(a / 60000, 10, 20) * s);
      if (theme === 'spring') return Math.round(10 * s) + 2;
      return Math.round(clamp(a / 60000, 8, 22) * s);
    }
    var LEAF = ['#d9531e', '#e8a33d', '#b5361f', '#c97a2b', '#9c4a1a'], LEAF_H = ['#e8731e', '#c4521a', '#8a3b12', '#f08a24', '#3b2a1c'];
    var FLOW = ['#ff6f9f', '#ffc83d', '#a98bff', '#ff8a4d'], PETAL = ['#f7b6c8', '#fbd5df', '#ffffff', '#f4a3bb'], POLLEN = ['#fff3c4', '#ffe08a', '#fffaf0', '#ffd36b'];

    function make(initial) {
      var p = { x: rnd(0, W), y: initial ? rnd(-H, H) : rnd(-40, -10), ph: rnd(0, 6.28), a: rnd(0.4, 1.2), rot: rnd(0, 6.28), vr: rnd(-0.03, 0.03) };
      if (theme === 'winter') { p.k = Math.random() < 0.7 ? -1 : (Math.random() < 0.5 ? 1 : 2); p.r = p.k < 0 ? rnd(0.7, 1.7) : rnd(2.2, 3.2); p.al2 = p.k < 0 ? rnd(0.35, 0.7) : rnd(0.55, 0.8); p.vr = rnd(-0.012, 0.012); p.vy = 0.15 + p.r * 0.05; p.amp = rnd(0.12, 0.4); }
      else if (theme === 'summer') { p.y = initial ? rnd(0, H) : H + 10; p.r = rnd(1, 2.6); p.vy = -rnd(0.1, 0.42); p.amp = rnd(0.2, 0.6); p.col = POLLEN[(Math.random() * 4) | 0]; p.al = rnd(0.45, 0.9); }
      else if (theme === 'spring') { p.r = rnd(4.5, 6.5); p.vy = rnd(0.16, 0.34); p.amp = rnd(0.3, 0.7); p.vr = rnd(-0.012, 0.012); p.col = PETAL[(Math.random() * 4) | 0]; }
      else { p.k = (Math.random() * 3) | 0; p.r = rnd(7, 13); p.vy = rnd(0.55, 1.25); p.amp = rnd(0.6, 1.4); p.col = (theme === 'halloween' ? LEAF_H : LEAF)[(Math.random() * 5) | 0]; }
      return p;
    }
    function sprite(kind) {
      var N = 128, c = document.createElement('canvas'); c.width = c.height = N; var g = c.getContext('2d'), h = N / 2;
      g.translate(h, h); g.lineCap = 'round'; g.lineJoin = 'round';
      var gr = g.createLinearGradient(-h, -h, h, h); gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.5, '#cfe6ff'); gr.addColorStop(1, '#9cc4f5');
      g.strokeStyle = gr; g.shadowColor = 'rgba(170,210,255,.95)'; g.shadowBlur = 7;
      function arms(len, side, w) {
        g.lineWidth = w;
        for (var i = 0; i < 6; i++) {
          g.save(); g.rotate(i * Math.PI / 3); g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -len); g.stroke();
          if (side) { [0.45, 0.7].forEach(function (t, k) { var y = -len * t, l = side * (1 - k * 0.35); g.beginPath(); g.moveTo(0, y); g.lineTo(l * 0.7, y - l * 0.7); g.moveTo(0, y); g.lineTo(-l * 0.7, y - l * 0.7); g.stroke(); }); }
          g.restore();
        }
      }
      function hex(r) { g.beginPath(); for (var i = 0; i < 6; i++) { var a = i * Math.PI / 3 - Math.PI / 2; g[i ? 'lineTo' : 'moveTo'](Math.cos(a) * r, Math.sin(a) * r); } g.closePath(); }
      if (kind === 0) { arms(54, 22, 4); }
      else if (kind === 1) { arms(52, 0, 4); hex(18); g.lineWidth = 3.5; g.stroke(); g.fillStyle = 'rgba(210,232,255,.35)'; g.shadowBlur = 0; g.fill(); }
      else { hex(46); g.lineWidth = 4; g.stroke(); g.fillStyle = 'rgba(200,226,255,.28)'; g.shadowBlur = 0; g.fill(); hex(24); g.lineWidth = 2.5; g.stroke(); g.lineWidth = 2; for (var i = 0; i < 6; i++) { g.save(); g.rotate(i * Math.PI / 3); g.beginPath(); g.moveTo(0, -24); g.lineTo(0, -46); g.stroke(); g.restore(); } }
      g.shadowBlur = 0; g.fillStyle = 'rgba(255,255,255,.95)'; g.beginPath(); g.arc(0, 0, 5, 0, 6.28); g.fill();
      return c;
    }
    function leafG(g, s, col, kind) {
      var i, t, w, a;
      g.beginPath();
      if (kind === 0) { /* maple */
        var P = [[-180, 0.25], [-140, 0.42], [-112, 0.74], [-84, 0.46], [-56, 0.96], [-28, 0.52], [0, 1.06], [28, 0.52], [56, 0.96], [84, 0.46], [112, 0.74], [140, 0.42], [180, 0.25]];
        P.forEach(function (q, n) { a = q[0] * Math.PI / 180; var x = s * q[1] * Math.sin(a), y = -s * q[1] * Math.cos(a); g[n ? 'lineTo' : 'moveTo'](x, y); });
      } else if (kind === 1) { /* oak */
        for (i = 0; i <= 28; i++) { t = i / 28; w = s * 0.55 * Math.pow(Math.sin(Math.PI * Math.pow(t, 0.9)), 0.8) * (1 + 0.3 * Math.cos(t * 4 * 6.283 + 0.6)); g[i ? 'lineTo' : 'moveTo'](w, -s + t * 2 * s); }
        for (i = 28; i >= 0; i--) { t = i / 28; w = s * 0.55 * Math.pow(Math.sin(Math.PI * Math.pow(t, 0.9)), 0.8) * (1 + 0.3 * Math.cos(t * 4 * 6.283 + 0.6)); g.lineTo(-w, -s + t * 2 * s); }
      } else { /* elm / birch with fine teeth */
        for (i = 0; i <= 30; i++) { t = i / 30; w = s * 0.58 * Math.pow(Math.sin(Math.PI * Math.pow(t, 0.8)), 0.9) * (1 + 0.07 * Math.cos(t * 34)); g[i ? 'lineTo' : 'moveTo'](w, -s + t * 2 * s); }
        for (i = 30; i >= 0; i--) { t = i / 30; w = s * 0.58 * Math.pow(Math.sin(Math.PI * Math.pow(t, 0.8)), 0.9) * (1 + 0.07 * Math.cos(t * 34)); g.lineTo(-w, -s + t * 2 * s); }
      }
      g.closePath(); g.fillStyle = col; g.fill();
      var gr = g.createLinearGradient(-s, -s, s, s); gr.addColorStop(0, 'rgba(255,225,150,.32)'); gr.addColorStop(0.55, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(40,10,0,.45)');
      g.fillStyle = gr; g.fill();
      g.strokeStyle = 'rgba(50,16,4,.5)'; g.lineWidth = Math.max(0.5, s * 0.07); g.lineCap = 'round';
      g.beginPath(); g.moveTo(0, kind === 0 ? s * 0.2 : s * 0.95); g.lineTo(0, -s * (kind === 0 ? 0.95 : 0.85));
      if (kind === 0) { [-56, -28, 28, 56].forEach(function (d) { var ad = d * Math.PI / 180; g.moveTo(0, s * 0.05); g.lineTo(s * 0.7 * Math.sin(ad), -s * 0.7 * Math.cos(ad)); }); }
      else { for (i = 1; i < 5; i++) { var yy = -s * 0.8 + i * s * 0.36; g.moveTo(0, yy); g.lineTo(s * 0.32, yy - s * 0.2); g.moveTo(0, yy); g.lineTo(-s * 0.32, yy - s * 0.2); } }
      g.stroke();
      if (kind === 0) { g.beginPath(); g.moveTo(0, s * 0.2); g.lineTo(0, s * 1.15); g.stroke(); }
    }

    function petalG(g, s, col) {
      g.beginPath(); g.moveTo(0, s); g.bezierCurveTo(-s * 0.95, s * 0.35, -s * 0.9, -s * 0.7, -s * 0.2, -s * 0.98); g.quadraticCurveTo(-s * 0.05, -s * 0.8, 0, -s * 0.72); g.quadraticCurveTo(s * 0.05, -s * 0.8, s * 0.2, -s * 0.98); g.bezierCurveTo(s * 0.9, -s * 0.7, s * 0.95, s * 0.35, 0, s); g.closePath();
      g.fillStyle = col; g.fill();
      var gr = g.createRadialGradient(0, s * 0.8, 0, 0, s * 0.1, s * 1.1); gr.addColorStop(0, 'rgba(255,255,255,.85)'); gr.addColorStop(0.55, 'rgba(255,255,255,.12)'); gr.addColorStop(1, 'rgba(225,95,140,.4)'); g.fillStyle = gr; g.fill();
      g.strokeStyle = 'rgba(215,100,140,.35)'; g.lineWidth = Math.max(0.4, s * 0.07); g.lineCap = 'round'; g.beginPath(); g.moveTo(0, s * 0.9); g.lineTo(0, -s * 0.55); g.moveTo(0, s * 0.5); g.lineTo(-s * 0.4, -s * 0.3); g.moveTo(0, s * 0.5); g.lineTo(s * 0.4, -s * 0.3); g.stroke();
    }
    function flowerG(g, s, col) {
      for (var i = 0; i < 5; i++) { g.save(); g.rotate(i * 1.2566); g.translate(0, -s * 0.52); g.beginPath(); g.ellipse(0, 0, s * 0.36, s * 0.52, 0, 0, 6.283); g.fillStyle = col; g.fill();
        var gr = g.createLinearGradient(0, -s * 0.5, 0, s * 0.5); gr.addColorStop(0, 'rgba(255,255,255,.5)'); gr.addColorStop(1, 'rgba(0,0,0,.12)'); g.fillStyle = gr; g.fill(); g.restore(); }
      g.beginPath(); g.arc(0, 0, s * 0.24, 0, 6.283); g.fillStyle = '#ffd23f'; g.fill(); g.strokeStyle = '#d9930a'; g.lineWidth = 0.9; g.stroke();
      g.fillStyle = '#b8710a'; for (i = 0; i < 4; i++) { g.beginPath(); g.arc(Math.cos(i * 1.57) * s * 0.1, Math.sin(i * 1.57) * s * 0.1, s * 0.03, 0, 6.283); g.fill(); }
    }
    function starG(g, cx, cy, s, col) {
      g.save(); g.translate(cx, cy); g.rotate(0.3); g.beginPath();
      for (var i = 0; i < 10; i++) { var r = i % 2 ? s * 0.42 : s, a = i * Math.PI / 5 - Math.PI / 2; g[i ? 'lineTo' : 'moveTo'](Math.cos(a) * r, Math.sin(a) * r); }
      g.closePath(); g.fillStyle = col; g.lineJoin = 'round'; g.shadowColor = 'rgba(0,0,0,.3)'; g.shadowBlur = 3; g.shadowOffsetY = 1.5; g.fill(); g.shadowColor = 'transparent';
      g.strokeStyle = '#f4894b'; g.lineWidth = s * 0.14; g.stroke(); g.fillStyle = 'rgba(255,240,200,.8)';
      for (i = 0; i < 5; i++) { var a2 = i * 1.2566 - Math.PI / 2; for (var k = 1; k < 3; k++) { g.beginPath(); g.arc(Math.cos(a2) * s * 0.28 * k, Math.sin(a2) * s * 0.28 * k, s * 0.045, 0, 6.283); g.fill(); } }
      g.restore();
    }
    function shellG(g, cx, by, s) {
      g.save(); g.translate(cx, by); g.beginPath(); g.moveTo(0, 0);
      for (var i = 0; i <= 7; i++) { var a = (-70 + i * 20) * Math.PI / 180, ax = Math.sin(a) * s, ay = -Math.cos(a) * s; var b = (-60 + i * 20) * Math.PI / 180; g.quadraticCurveTo(Math.sin(b - 0.17) * s * 1.1, -Math.cos(b - 0.17) * s * 1.1, ax, ay); }
      g.closePath(); var gr = g.createLinearGradient(0, -s, 0, 0); gr.addColorStop(0, '#fff0e6'); gr.addColorStop(1, '#efa597'); g.fillStyle = gr; g.shadowColor = 'rgba(0,0,0,.28)'; g.shadowBlur = 3; g.shadowOffsetY = 1.5; g.fill(); g.shadowColor = 'transparent';
      g.strokeStyle = 'rgba(190,100,90,.55)'; g.lineWidth = 0.8; for (i = 0; i < 6; i++) { var a3 = (-50 + i * 20) * Math.PI / 180; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.sin(a3) * s * 0.95, -Math.cos(a3) * s * 0.95); g.stroke(); }
      g.restore();
    }
    function ballG(g, cx, cy, r) {
      g.save(); g.beginPath(); g.arc(cx, cy, r, 0, 6.283); g.clip(); var cols = ['#ff4d4d', '#ffffff', '#ffd23f', '#ffffff', '#2f8cff', '#ffffff'];
      for (var i = 0; i < 6; i++) { g.fillStyle = cols[i]; g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, r * 1.2, i * 1.0472 + 0.4, (i + 1) * 1.0472 + 0.4); g.closePath(); g.fill(); }
      var gr = g.createRadialGradient(cx - r * 0.35, cy - r * 0.4, r * 0.1, cx, cy, r); gr.addColorStop(0, 'rgba(255,255,255,.6)'); gr.addColorStop(0.5, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(0,0,40,.35)'); g.fillStyle = gr; g.fillRect(cx - r, cy - r, r * 2, r * 2); g.restore();
      g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 0.8; g.beginPath(); g.arc(cx, cy, r, 0, 6.283); g.stroke();
    }
    function iceG(g, cx, by, s) {
      g.save(); g.shadowColor = 'rgba(0,0,0,.3)'; g.shadowBlur = 4; g.shadowOffsetY = 2;
      g.beginPath(); g.moveTo(cx - s * 0.27, by - s * 1.05); g.lineTo(cx + s * 0.27, by - s * 1.05); g.lineTo(cx, by); g.closePath(); g.fillStyle = '#e3a95a'; g.fill(); g.shadowColor = 'transparent';
      g.save(); g.clip(); g.strokeStyle = 'rgba(150,88,28,.6)'; g.lineWidth = 1; for (var i = -4; i < 5; i++) { g.beginPath(); g.moveTo(cx + i * s * 0.12 - s * 0.3, by - s * 1.1); g.lineTo(cx + i * s * 0.12 + s * 0.3, by); g.moveTo(cx + i * s * 0.12 + s * 0.3, by - s * 1.1); g.lineTo(cx + i * s * 0.12 - s * 0.3, by); g.stroke(); } g.restore();
      function scoop(x, y, r, c1, c2) { var gr = g.createRadialGradient(x - r * 0.3, y - r * 0.35, r * 0.1, x, y, r); gr.addColorStop(0, c1); gr.addColorStop(1, c2); g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, 6.283); g.fill(); }
      scoop(cx, by - s * 1.18, s * 0.36, '#ffc2d8', '#f0719e');
      for (i = -2; i <= 2; i++) { g.fillStyle = '#f0719e'; g.beginPath(); g.arc(cx + i * s * 0.16, by - s * 0.98, s * 0.11, 0, 6.283); g.fill(); }
      scoop(cx + s * 0.02, by - s * 1.62, s * 0.31, '#fffaea', '#f1dca0');
      g.fillStyle = '#e0243b'; g.beginPath(); g.arc(cx + s * 0.04, by - s * 1.98, s * 0.1, 0, 6.283); g.fill(); g.strokeStyle = '#4b7a1f'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(cx + s * 0.04, by - s * 2.07); g.quadraticCurveTo(cx + s * 0.12, by - s * 2.25, cx + s * 0.2, by - s * 2.2); g.stroke();
      g.restore();
    }
    function melonG(g, cx, by, s) {
      var r = s * 0.9, cy = by - r; g.save(); g.shadowColor = 'rgba(0,0,0,.3)'; g.shadowBlur = 4; g.shadowOffsetY = 2;
      g.beginPath(); g.arc(cx, cy, r, 0, Math.PI); g.closePath(); g.fillStyle = '#2f9a43'; g.fill(); g.shadowColor = 'transparent';
      g.beginPath(); g.arc(cx, cy, r * 0.93, 0, Math.PI); g.closePath(); g.fillStyle = '#c7ecaa'; g.fill();
      g.beginPath(); g.arc(cx, cy, r * 0.85, 0, Math.PI); g.closePath(); var gr = g.createLinearGradient(0, cy, 0, cy + r); gr.addColorStop(0, '#ff7f8e'); gr.addColorStop(1, '#e2304c'); g.fillStyle = gr; g.fill();
      g.fillStyle = '#1b1210'; [[-0.5, 0.35], [-0.2, 0.6], [0.15, 0.45], [0.5, 0.3], [0.3, 0.7], [-0.45, 0.65], [0, 0.25]].forEach(function (q) { g.save(); g.translate(cx + q[0] * r, cy + q[1] * r * 0.95); g.rotate(q[0] * 0.8); g.beginPath(); g.ellipse(0, 0, r * 0.045, r * 0.075, 0, 0, 6.283); g.fill(); g.restore(); });
      g.restore();
    }
    function leaf(s, col, kind) { leafG(ctx, s, col, kind || 0); }
    function bat(e, t) {
      var f = Math.sin(t * 0.02) * 0.6 + 0.4; ctx.save(); ctx.translate(e.x, e.y); ctx.scale(e.dir, 1); ctx.fillStyle = 'rgba(10,8,14,.88)';
      ctx.beginPath(); ctx.ellipse(0, 0, 4, 6, 0, 0, 6.28); ctx.fill();
      [1, -1].forEach(function (s) { ctx.beginPath(); ctx.moveTo(0, -3); ctx.quadraticCurveTo(s * 14, -16 * f - 4, s * 26, -2 * f); ctx.quadraticCurveTo(s * 18, 3, s * 12, 2); ctx.quadraticCurveTo(s * 8, 8, 0, 5); ctx.fill(); });
      ctx.restore();
    }
    function butterfly(e, t) {
      var w = Math.abs(Math.sin(t * 0.012)); ctx.save(); ctx.translate(e.x, e.y); ctx.rotate(Math.sin(t * 0.004) * 0.25);
      ctx.fillStyle = '#f6a21e'; ctx.beginPath(); ctx.ellipse(-5 * w - 1, -3, 6 * w + 1, 7, -0.4, 0, 6.28); ctx.fill(); ctx.beginPath(); ctx.ellipse(5 * w + 1, -3, 6 * w + 1, 7, 0.4, 0, 6.28); ctx.fill();
      ctx.fillStyle = '#e9573f'; ctx.beginPath(); ctx.ellipse(-4 * w - 1, 5, 4 * w + 1, 5, 0.4, 0, 6.28); ctx.fill(); ctx.beginPath(); ctx.ellipse(4 * w + 1, 5, 4 * w + 1, 5, -0.4, 0, 6.28); ctx.fill();
      ctx.fillStyle = '#2a1a10'; ctx.fillRect(-0.8, -7, 1.6, 15); ctx.restore();
    }
    function spawnExtra(now) {
      if (theme === 'halloween') { var d = Math.random() < 0.5 ? 1 : -1; extra = { kind: 'bat', dir: d, x: d === 1 ? -40 : W + 40, y: rnd(70, H * 0.4), vx: 2.4 * d, base: 0 }; extra.base = extra.y; }
      else if (theme === 'summer') { var d2 = Math.random() < 0.5 ? 1 : -1; extra = { kind: 'bf', dir: d2, x: d2 === 1 ? -30 : W + 30, y: rnd(H * 0.3, H * 0.75), vx: 1.1 * d2, base: 0 }; extra.base = extra.y; }
      else if (theme === 'spring' && new Date().getMonth() === 3 || (theme === 'spring' && q === 'spring')) { extra = { kind: 'rain', life: 0, drops: [] }; for (var i = 0; i < (W < 700 ? 40 : 70); i++) extra.drops.push({ x: rnd(0, W), y: rnd(0, H), v: rnd(9, 15) }); }
    }
    var surf = [], spiders = [], navH = 70, frameN = 0;
    function calcSurf() {
      var h = host(); if (!h) return; var hr = h.getBoundingClientRect(); surf = [];
      h.querySelectorAll('.hero-media, .badge, .btn-red, .btn-ghost, .btn-outline').forEach(function (el) { var r = el.getBoundingClientRect(); if (r.width < 20 || r.height < 10) return; surf.push({ x0: r.left - hr.left, x1: r.right - hr.left, y0: r.top - hr.top, y1: r.bottom - hr.top, m: el.classList.contains('hero-media') }); });
      var nv = document.querySelector('nav'); navH = nv ? nv.offsetHeight : 70;
      var m = surf.filter(function (q) { return q.m; })[0];
      spiders = [{ x: 56, top: navH + 2, len: 130, s: 1 }, { x: W - 74, top: navH + 2, len: 175, s: 1.1 }].concat(m ? [{ x: m.x1 - 34, top: m.y0 + 2, len: 70, s: 0.9 }] : []);
      spiders.forEach(function (q, i) { q.ph = i * 2.1; });
    }
    function restOf(p) { return theme === 'winter' ? p.r * 0.8 : theme === 'summer' ? p.r : p.f ? p.r * 0.3 : p.r * 0.35; }
    function drawP(p, fa) {
      if (theme === 'winter') { ctx.globalAlpha = p.al2 * fa; if (p.k < 0) { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.28); ctx.fill(); } else { ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.drawImage(snowSprites[p.k], -p.r * 2, -p.r * 2, p.r * 4, p.r * 4); ctx.restore(); } }
      else if (theme === 'summer') { ctx.globalAlpha = p.al * fa; ctx.fillStyle = p.col; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.28); ctx.fill(); }
      else if (theme === 'spring') { ctx.globalAlpha = 0.95 * fa; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); if (p.f) flowerG(ctx, p.r, p.col); else petalG(ctx, p.r, p.col); ctx.restore(); }
      else { ctx.globalAlpha = 0.95 * fa; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); leaf(p.r, p.col, p.k); ctx.restore(); }
    }
    function spider(q, now) {
      var t = now * 0.0006 + q.ph, y = q.top + q.len * (0.55 + 0.45 * Math.sin(t)), x = q.x + Math.sin(t * 1.7) * 2, sc = q.s, i;
      ctx.globalAlpha = 0.9; ctx.strokeStyle = 'rgba(235,235,245,.55)'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(q.x, q.top); ctx.lineTo(x, y); ctx.stroke();
      ctx.save(); ctx.translate(x, y + 7 * sc); ctx.scale(sc, sc); ctx.strokeStyle = '#150d14'; ctx.lineWidth = 1.3; ctx.lineCap = 'round';
      for (i = 0; i < 4; i++) for (var d = -1; d <= 1; d += 2) { var w = Math.sin(now * 0.008 + i + d) * 1.2; ctx.beginPath(); ctx.moveTo(d * 2, -1 + i * 1.6); ctx.quadraticCurveTo(d * 8, -6 + i * 2.6 + w, d * 10.5, 4 + i * 3.2 + w); ctx.stroke(); }
      ctx.fillStyle = '#17101a'; ctx.beginPath(); ctx.ellipse(0, 3.5, 5.3, 6.4, 0, 0, 6.283); ctx.fill(); ctx.beginPath(); ctx.arc(0, -3.2, 3.2, 0, 6.283); ctx.fill();
      ctx.fillStyle = '#e8402a'; ctx.beginPath(); ctx.ellipse(0, 4.5, 1.6, 2.4, 0, 0, 6.283); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.beginPath(); ctx.arc(-1.4, 1.4, 1, 0, 6.283); ctx.fill();
      ctx.restore(); ctx.globalAlpha = 1;
    }
    function frame(now) {
      if (!running) return; requestAnimationFrame(frame);
      var dt = Math.min(40, now - last) / 16.67; last = now; ctx.clearRect(0, 0, W, H);
      if ((frameN++ % 45) === 0) calcSurf();
      var i, p, k, sf, py, fall = theme !== 'summer';
      for (i = 0; i < parts.length; i++) {
        p = parts[i];
        if (p.land) {
          p.land.t += dt; var fa0 = p.land.t > p.land.life ? Math.max(0, 1 - (p.land.t - p.land.life) / 90) : 1;
          if (fa0 <= 0) { parts[i] = make(false); continue; }
          drawP(p, fa0 * (theme === 'winter' ? 1 : 1)); continue;
        }
        py = p.y; p.ph += 0.012 * dt * p.a; p.x += Math.sin(p.ph) * p.amp * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
        if (p.y > H + 20 || p.y < -30 || p.x < -30 || p.x > W + 30) { if (p.x < -30) p.x = W + 20; else if (p.x > W + 30) p.x = -20; else { parts[i] = p = make(false); if (theme === 'summer') p.y = H + 10; } }
        var hit = false;
        for (k = 0; k < surf.length; k++) {
          sf = surf[k]; if (p.x < sf.x0 + 3 || p.x > sf.x1 - 3) continue;
          if (fall && py <= sf.y0 && p.y >= sf.y0 - restOf(p)) { p.y = sf.y0 - restOf(p); p.land = { t: 0, life: rnd(420, 900) }; p.vr = 0; hit = true; break; }
          if (p.y > sf.y0 + 2 && p.y < sf.y1) { parts[i] = p = make(false); if (theme === 'summer') p.y = H + 10; break; }
        }
        var fa = theme === 'winter' ? clamp((H - p.y) / (H * 0.14), 0, 1) : 1;
        drawP(p, fa);
      }
      ctx.globalAlpha = 1;
      if (theme === 'halloween') spiders.forEach(function (q) { spider(q, now); });
      if (!extra && now > nextExtra) { spawnExtra(now); nextExtra = now + (theme === 'spring' ? rnd(70000, 140000) : rnd(8000, 16000)); }
      if (extra) {
        if (extra.kind === 'bat' || extra.kind === 'bf') {
          extra.x += extra.vx * dt; extra.y = extra.base + Math.sin(extra.x * 0.03) * (extra.kind === 'bat' ? 18 : 28);
          if (extra.kind === 'bat') bat(extra, now); else butterfly(extra, now);
          if (extra.x < -60 || extra.x > W + 60) extra = null;
        } else if (extra.kind === 'rain') {
          extra.life += dt / 60; var a = Math.min(1, extra.life, Math.max(0, (14 - extra.life) / 2)) * 0.5; ctx.strokeStyle = 'rgba(110,150,205,' + a + ')'; ctx.lineWidth = 1; ctx.beginPath();
          extra.drops.forEach(function (d) { d.y += d.v * dt; d.x -= 1.5 * dt; if (d.y > H) { d.y = -12; d.x = rnd(0, W + 40); } ctx.moveTo(d.x, d.y); ctx.lineTo(d.x - 2, d.y + 12); }); ctx.stroke();
          if (extra.life > 14) extra = null;
        }
      }
    }
    function host() { return document.querySelector('.hero, .page-hero'); }
    function size() { calcSurf(); var hh = host(); W = hh ? hh.clientWidth : innerWidth; H = hh ? hh.clientHeight : innerHeight; cv.width = W * DPR; cv.height = H * DPR; cv.style.width = W + 'px'; cv.style.height = H + 'px'; ctx.setTransform(DPR, 0, 0, DPR, 0, 0); }
    function start() {
      if (running) return; if (!cv) {
        if (!host()) return; cv = document.createElement('canvas'); cv.className = 'fx-canvas'; cv.setAttribute('aria-hidden', 'true'); if (host()) { cv.className += ' fx-in-hero'; host().appendChild(cv); } else { cv = null; return; } ctx = cv.getContext('2d'); size();
        if (theme === 'winter') snowSprites = [sprite(0), sprite(1), sprite(2)];
        window.addEventListener('resize', function () { size(); paintSoon(); });
      }
      cv.style.display = 'block'; parts = []; var n = count(); for (var i = 0; i < n; i++) parts.push(make(true));
      if (theme === 'spring') for (var fi = 0; fi < 2 && fi < parts.length; fi++) { var fp = parts[fi]; fp.f = true; fp.r = rnd(9, 11); fp.col = FLOW[(Math.random() * 4) | 0]; fp.vy = rnd(0.16, 0.24); fp.vr = rnd(-0.008, 0.008); }
      document.documentElement.classList.add('fx-on', 'fx-' + theme);
      caps(true);
      running = true; last = performance.now(); nextExtra = last + rnd(3000, 7000); requestAnimationFrame(frame);
    }
    function stop() {
      running = false; extra = null; if (pileH) pileH.style.display = pileN.style.display = 'none'; if (cv) { ctx.clearRect(0, 0, W, H); cv.style.display = 'none'; }
      document.documentElement.classList.remove('fx-on', 'fx-' + theme);
    }
    /* snow lying and piling on the hero: drawn on canvas layers so it looks like real drifts */
    var lvl = 0.55, lvlTimer = null, hero = null, pileH = null, pileN = null, wrapped = false, paintT = null;
    function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
    function rr(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
    function leaves(g, x0, x1, y, n, size, seed) {
      var R = rng(seed), cols = theme === 'halloween' ? LEAF_H : LEAF, i, j;
      for (i = 0; i < n; i++) {
        var cx = x0 + 6 + R() * Math.max(1, x1 - x0 - 12), k = R() < 0.4 ? 2 : 1;
        for (j = 0; j < k; j++) {
          var s = size * (0.8 + R() * 0.5); g.save(); g.translate(cx + j * size * 0.9, y - 1 - R() * size * 0.5 - j * size * 0.3); g.rotate(R() * 6.28);
          g.shadowColor = 'rgba(0,0,0,.35)'; g.shadowBlur = 3; g.shadowOffsetY = 1.5; if (theme === 'spring') { if (R() < 0.12) flowerG(g, s * 1.5, FLOW[(R() * 4) | 0]); else petalG(g, s, PETAL[(R() * PETAL.length) | 0]); } else if (theme === 'summer') { shellG(g, 0, s * 0.5, s * 1.4); } else leafG(g, s, cols[(R() * cols.length) | 0], (R() * 3) | 0); g.restore();
        }
      }
    }
    function drift(g, x0, x1, base, Hm, o) {
      Hm *= lvl; if (Hm < 2 || x1 - x0 < 8) return;
      var R = rng(o.seed), p1 = R() * 6.28, p2 = R() * 6.28, f1 = 0.7 + R() * 1.0, f2 = 2 + R() * 2, len = x1 - x0, rad = clamp(Hm * 0.3, 3.5, 11), pts = [], x, t, h, edge;
      for (x = x0; x <= x1 + 0.1; x += 2) { t = (x - x0) / len; h = 0.62 + 0.24 * Math.sin(t * 6.28 * f1 + p1) + 0.14 * Math.sin(t * 6.28 * f2 + p2); edge = o.bank ? 1 : Math.pow(Math.sin(Math.PI * t), 0.5); pts.push([x, base - Hm * h * edge + rad * 0.6]); }
      var minY = base; pts.forEach(function (q) { if (q[1] - rad < minY) minY = q[1] - rad; });
      g.save(); g.globalAlpha = o.alpha || 1;
      g.shadowColor = 'rgba(70,105,165,.55)'; g.shadowBlur = 5; g.shadowOffsetY = 2.5;
      g.fillStyle = '#fff'; g.beginPath(); g.moveTo(x0, base + 3);
      pts.forEach(function (q) { g.lineTo(q[0], q[1]); }); g.lineTo(x1, base + 3); g.closePath(); g.fill();
      var j = 0; g.beginPath(); for (x = x0 + rad * 0.5; x < x1 - rad * 0.5; x += rad * (0.9 + R() * 0.9)) { var idx = clamp(Math.round((x - x0) / 2), 0, pts.length - 1), rr2 = rad * (0.75 + R() * 0.5); g.moveTo(x + rr2, pts[idx][1]); g.arc(x, pts[idx][1], rr2, 0, 6.28); j++; } g.fill();
      g.shadowColor = 'transparent'; g.shadowBlur = 0; g.shadowOffsetY = 0;
      var gr = g.createLinearGradient(0, minY, 0, base + 3); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.6, 'rgba(225,236,252,.0)'); gr.addColorStop(1, o.lo || 'rgba(170,196,236,.75)');
      g.globalCompositeOperation = 'source-atop'; g.fillStyle = gr; g.fillRect(x0 - 2, minY - 2, len + 4, base + 8 - minY);
      g.restore();
    }
    function blanket(g, x, y, w, h, rad, depth) {
      depth *= (0.6 + 0.4 * lvl); g.save(); rr(g, x, y, w, h, rad); g.clip();
      var gr = g.createLinearGradient(0, y, 0, y + depth); gr.addColorStop(0, 'rgba(255,255,255,.82)'); gr.addColorStop(0.55, 'rgba(235,244,255,.38)'); gr.addColorStop(1, 'rgba(235,244,255,0)'); g.fillStyle = gr; g.fillRect(x, y, w, depth);
      g.restore();
    }
    function web(g, cx, cy, R, dx, dy, seed) {
      var n = 6, ang = [], i, k; for (i = 0; i < n; i++) ang.push(i * (Math.PI / 2) / (n - 1));
      g.save(); g.strokeStyle = 'rgba(240,240,255,.55)'; g.lineWidth = 0.8; g.lineCap = 'round';
      ang.forEach(function (a) { g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + dx * Math.cos(a) * R, cy + dy * Math.sin(a) * R); g.stroke(); });
      [0.28, 0.48, 0.68, 0.88].forEach(function (f, q) { g.beginPath(); for (k = 0; k < n; k++) { var a = ang[k], x = cx + dx * Math.cos(a) * R * f, y = cy + dy * Math.sin(a) * R * f; if (!k) g.moveTo(x, y); else { var am = (ang[k - 1] + a) / 2; g.quadraticCurveTo(cx + dx * Math.cos(am) * R * f * 0.86, cy + dy * Math.sin(am) * R * f * 0.86, x, y); } } g.stroke(); });
      g.restore();
    }
    function pumpkin(g, cx, by, r) {
      g.save(); g.fillStyle = 'rgba(0,0,0,.35)'; g.filter = 'blur(3px)'; g.beginPath(); g.ellipse(cx, by + 2, r * 1.05, r * 0.16, 0, 0, 6.283); g.fill(); g.filter = 'none';
      var cy = by - r * 0.78; [-0.62, 0.62, -0.32, 0.32, 0].forEach(function (o) { var gr = g.createRadialGradient(cx + o * r - r * 0.12, cy - r * 0.25, r * 0.1, cx + o * r, cy, r * 0.85); gr.addColorStop(0, '#ffb04a'); gr.addColorStop(0.6, '#f07b12'); gr.addColorStop(1, '#bf4d08'); g.fillStyle = gr; g.strokeStyle = 'rgba(120,40,0,.55)'; g.lineWidth = 1; g.beginPath(); g.ellipse(cx + o * r, cy, r * 0.5, r * 0.78, 0, 0, 6.283); g.fill(); g.stroke(); });
      g.fillStyle = '#5a7a1e'; g.strokeStyle = '#3d5512'; g.beginPath(); g.moveTo(cx - r * 0.1, cy - r * 0.72); g.quadraticCurveTo(cx - r * 0.1, cy - r * 1.05, cx + r * 0.16, cy - r * 1.1); g.lineTo(cx + r * 0.2, cy - r * 0.98); g.quadraticCurveTo(cx + r * 0.05, cy - r * 0.95, cx + r * 0.1, cy - r * 0.72); g.closePath(); g.fill(); g.stroke();
      g.shadowColor = '#ffb300'; g.shadowBlur = 9; g.fillStyle = '#ffe27a';
      g.beginPath(); g.moveTo(cx - r * 0.4, cy - r * 0.18); g.lineTo(cx - r * 0.14, cy - r * 0.2); g.lineTo(cx - r * 0.28, cy - r * 0.45); g.closePath(); g.fill();
      g.beginPath(); g.moveTo(cx + r * 0.4, cy - r * 0.18); g.lineTo(cx + r * 0.14, cy - r * 0.2); g.lineTo(cx + r * 0.28, cy - r * 0.45); g.closePath(); g.fill();
      g.beginPath(); g.moveTo(cx, cy - r * 0.02); g.lineTo(cx - r * 0.07, cy + r * 0.1); g.lineTo(cx + r * 0.07, cy + r * 0.1); g.closePath(); g.fill();
      g.beginPath(); g.moveTo(cx - r * 0.5, cy + r * 0.2); for (var i = 0; i <= 8; i++) { var x = cx - r * 0.5 + i * r * 0.125, y = cy + r * 0.2 + (i % 2 ? r * 0.2 : r * 0.05) + Math.sin(i / 8 * Math.PI) * r * 0.08; g.lineTo(x, y); } g.lineTo(cx + r * 0.5, cy + r * 0.27); g.lineTo(cx - r * 0.5, cy + r * 0.27); g.closePath(); g.fill();
      g.restore();
    }
    function sandBank(g, w, h) {
      var gr = g.createLinearGradient(0, h - 34, 0, h); gr.addColorStop(0, '#f8e6b8'); gr.addColorStop(1, '#e2c185');
      g.save(); g.shadowColor = 'rgba(80,50,0,.3)'; g.shadowBlur = 5; g.shadowOffsetY = -1; g.fillStyle = gr; g.beginPath(); g.moveTo(0, h + 2);
      for (var x = 0; x <= w; x += 4) g.lineTo(x, h - 15 - 5 * Math.sin(x * 0.012 + 1) - 3 * Math.sin(x * 0.037)); g.lineTo(w, h + 2); g.closePath(); g.fill(); g.restore();
    }
    function layer(cls, parent, fixed) {
      var c = document.createElement('canvas'); c.className = 'fx-pile ' + cls; c.setAttribute('aria-hidden', 'true'); parent.appendChild(c); return c;
    }
    function prep(c, w, h) { var d = 2; c.width = w * d; c.height = h * d; c.style.width = w + 'px'; c.style.height = h + 'px'; var g = c.getContext('2d'); g.setTransform(d, 0, 0, d, 0, 0); g.clearRect(0, 0, w, h); return g; }
    function paint() {
      var AUT = theme === 'autumn' || theme === 'spring';
      if (!hero || !document.documentElement.classList.contains('fx-on')) return;
      var hr = hero.getBoundingClientRect(), w = hr.width, h = hr.height, g = prep(pileH, w, h), seed = 11;
      function rel(el) { var r = el.getBoundingClientRect(); return { x: r.left - hr.left, y: r.top - hr.top, w: r.width, h: r.height }; }
      if (theme === 'halloween' || theme === 'summer') {
        prep(pileN, innerWidth, 120);
        var m0 = hero.querySelector('.hero-media'), mm = m0 ? rel(m0) : null, nb = (document.querySelector('nav') || {}).offsetHeight || 70;
        if (theme === 'halloween') {
          web(g, 0, nb, 120, 1, 1, 1); web(g, w, nb, 120, -1, 1, 2); if (mm && mm.w > 0) web(g, mm.x + mm.w, mm.y, 70, -1, 1, 3);
          leaves(g, 0, w, h - 1, 10, 9, 5); pumpkin(g, w * 0.9, h - 3, 24); pumpkin(g, w * 0.9 - 42, h - 3, 14);
        } else {
          var gl = g.createRadialGradient(w, 0, 10, w, 0, Math.max(w, h) * 0.7); gl.addColorStop(0, 'rgba(255,214,110,.14)'); gl.addColorStop(1, 'rgba(255,214,110,0)'); g.fillStyle = gl; g.fillRect(0, 0, w, h);
          sandBank(g, w, h);
          var by = h - 12; shellG(g, w * 0.55, by + 2, 17); ballG(g, w - 40, by - 12, 12);
          if (mm && mm.w > 0) { leaves(g, mm.x, mm.x + mm.w, mm.y + 4, 3, 8, 21); }
          hero.querySelectorAll('.btn-red, .btn-ghost, .btn-outline').forEach(function (el, i) { var r = rel(el); if (r.w > 20) leaves(g, r.x, r.x + r.w, r.y + 3, 1, 6, 31 + i); });
        }
        return;
      }
      /* bottom snowbank: back layer for depth, then the front */
      if (AUT) { leaves(g, 0, w, h - 1, 9, 9, 5); } else {
      drift(g, -4, w + 4, h + 1, 16, { bank: true, seed: 5, hi: '#e6f0ff', mid: '#c9dbf5', lo: '#9db8e0', alpha: 0.7, nosparkle: true });
      drift(g, -4, w + 4, h + 2, 10, { bank: true, seed: 9, mid: '#f1f6ff', lo: '#aac3e8' });
      }
      var media = hero.querySelector('.hero-media');
      if (media) { var m = rel(media); if (m.w > 0) {
        if (AUT) { leaves(g, m.x, m.x + m.w, m.y + 4, 8, 8.5, 21); } else {
        blanket(g, m.x, m.y, m.w, m.h, 18, 10);
        drift(g, m.x - 6, m.x + m.w + 6, m.y + 3, 7, { seed: 21 });
        drift(g, m.x - 8, m.x + m.w * 0.3, m.y + 4, 11, { seed: 23 });
        drift(g, m.x + m.w * 0.72, m.x + m.w + 8, m.y + 4, 9.5, { seed: 27 });
        }
      } }
      hero.querySelectorAll('.badge, .btn-red, .btn-ghost, .btn-outline').forEach(function (el) {
        var r = rel(el); if (r.w < 20 || r.h < 10) return; seed += 7;
        if (AUT) { leaves(g, r.x, r.x + r.w, r.y + 3, 3, 6, seed); return; }
        blanket(g, r.x, r.y, r.w, r.h, 8, el.classList.contains('badge') ? 8 : 5); drift(g, r.x - 3, r.x + r.w + 3, r.y + 2, el.classList.contains('badge') ? 3.8 : 4.2, { seed: seed });
      });
      if (!AUT) hero.querySelectorAll('h1 .fx-w').forEach(function (sp, i) {
        var tn = sp.firstChild; if (!tn || tn.nodeType !== 3) return; var rg = document.createRange(); rg.setStart(tn, 0); rg.setEnd(tn, Math.min(2, tn.nodeValue.length)); var r = rg.getBoundingClientRect(), fs = parseFloat(getComputedStyle(sp).fontSize) || 48;
        var x0 = r.left - hr.left, y = r.top - hr.top + fs * 0.22;
        drift(g, x0 + fs * 0.02, x0 + fs * 0.62, y, fs * 0.056, { seed: 40 + i, nosparkle: true, mid: '#e6f0ff', lo: '#a9c2e8' });
      });
      /* nav: logo and Get in Touch */
      var gn = prep(pileN, innerWidth, 120);
      document.querySelectorAll('nav .nav-cta').forEach(function (el, i) {
        var r = el.getBoundingClientRect(); if (r.width < 20 || r.height < 10 || r.top > 110) return;
        if (AUT) { leaves(gn, r.left, r.left + r.width, r.top + 3, 3, 6, 60 + i); return; } blanket(gn, r.left, r.top, r.width, r.height, 8, 10); drift(gn, r.left - 2, r.left + r.width + 2, r.top + 2, 3.8, { seed: 60 + i });
      });
    }
    function paintSoon() { clearTimeout(paintT); paintT = setTimeout(paint, 120); }
    function caps(on) {
      if (!on) return; hero = document.querySelector('.hero, .page-hero'); if (!hero) return;
      if (!wrapped) {
        wrapped = true;
        hero.querySelectorAll('h1').forEach(function (h) {
          var w = document.createTreeWalker(h, NodeFilter.SHOW_TEXT), nodes = [], n; while ((n = w.nextNode())) nodes.push(n);
          nodes.forEach(function (t) {
            if (!t.nodeValue.trim()) return; var f = document.createDocumentFragment();
            t.nodeValue.split(/(\s+)/).forEach(function (s) { if (!s) return; if (/^[A-Z]/.test(s)) { var sp = document.createElement('span'); sp.className = 'fx-w'; sp.appendChild(document.createTextNode(s)); f.appendChild(sp); } else f.appendChild(document.createTextNode(s)); });
            t.parentNode.replaceChild(f, t);
          });
        });
        pileH = layer('fx-pile-hero', hero); pileN = layer('fx-pile-nav', document.body);
        window.addEventListener('load', paintSoon); if (window.ResizeObserver) new ResizeObserver(paintSoon).observe(hero);
      }
      pileH.style.display = pileN.style.display = 'block';
      lvl = 0.55; paint(); setTimeout(paint, 700); setTimeout(paint, 2000);
      clearInterval(lvlTimer); lvlTimer = setInterval(function () { lvl = Math.min(1, lvl + 0.02); paint(); if (lvl >= 1) clearInterval(lvlTimer); }, 4000);
    }
    /* visitor on/off button */
    function button() {
      if (!C.visitorSwitch) return;
      var b = document.createElement('button'); b.type = 'button'; b.className = 'fx-switch';
      function label() { b.textContent = THEMES[theme] + ': ' + (enabled ? 'on' : 'off'); b.setAttribute('aria-pressed', enabled ? 'true' : 'false'); b.setAttribute('aria-label', 'Turn ' + THEMES[theme].toLowerCase() + ' effect ' + (enabled ? 'off' : 'on')); }
      b.addEventListener('click', function () { enabled = !enabled; try { localStorage.setItem(KEY, enabled ? 'on' : 'off'); } catch (e) {} if (enabled) start(); else stop(); label(); });
      label(); document.body.appendChild(b);
    }
    function go() { button(); if (enabled) start(); document.addEventListener('visibilitychange', function () { if (document.hidden) { running = false; } else if (enabled && cv && !running) { running = true; last = performance.now(); requestAnimationFrame(frame); } }); }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
    window.CFA_FX = { theme: theme };
  } catch (e) {}
})();

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
      if (theme === 'winter') return Math.round(clamp(a / 22000, 22, 70) * s);
      if (theme === 'summer') return Math.round(clamp(a / 38000, 14, 34) * s);
      if (theme === 'spring') return Math.round(clamp(a / 50000, 10, 26) * s);
      return Math.round(clamp(a / 60000, 8, 22) * s);
    }
    var LEAF = ['#d9531e', '#e8a33d', '#b5361f', '#c97a2b', '#9c4a1a'], LEAF_H = ['#e8731e', '#c4521a', '#8a3b12', '#f08a24', '#3b2a1c'];
    var PETAL = ['#f7b6c8', '#fbd5df', '#ffffff', '#f4a3bb'], POLLEN = ['#fff3c4', '#ffe08a', '#fffaf0', '#ffd36b'];

    function make(initial) {
      var p = { x: rnd(0, W), y: initial ? rnd(-H, H) : rnd(-40, -10), ph: rnd(0, 6.28), a: rnd(0.4, 1.2), rot: rnd(0, 6.28), vr: rnd(-0.03, 0.03) };
      if (theme === 'winter') { p.r = rnd(1.9, 3.9); p.k = (Math.random() * 3) | 0; p.vr = rnd(-0.012, 0.012); p.vy = 0.35 + p.r * 0.2; p.amp = rnd(0.3, 0.9); }
      else if (theme === 'summer') { p.y = initial ? rnd(0, H) : H + 10; p.r = rnd(1, 2.6); p.vy = -rnd(0.1, 0.42); p.amp = rnd(0.2, 0.6); p.col = POLLEN[(Math.random() * 4) | 0]; p.al = rnd(0.45, 0.9); }
      else if (theme === 'spring') { p.r = rnd(3.5, 7); p.vy = rnd(0.35, 0.9); p.amp = rnd(0.5, 1.2); p.col = PETAL[(Math.random() * 4) | 0]; }
      else { p.r = rnd(6, 12); p.vy = rnd(0.55, 1.25); p.amp = rnd(0.6, 1.4); p.col = (theme === 'halloween' ? LEAF_H : LEAF)[(Math.random() * 5) | 0]; }
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
    function leaf(s, col) {
      ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(0, -s); ctx.bezierCurveTo(s * 0.95, -s * 0.4, s * 0.8, s * 0.6, 0, s); ctx.bezierCurveTo(-s * 0.8, s * 0.6, -s * 0.95, -s * 0.4, 0, -s); ctx.fill();
      ctx.strokeStyle = 'rgba(60,20,5,.35)'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(0, -s); ctx.lineTo(0, s); ctx.stroke();
    }
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
    function frame(now) {
      if (!running) return; requestAnimationFrame(frame);
      var dt = Math.min(40, now - last) / 16.67; last = now; ctx.clearRect(0, 0, W, H);
      var i, p;
      for (i = 0; i < parts.length; i++) {
        p = parts[i]; p.ph += 0.012 * dt * p.a; p.x += Math.sin(p.ph) * p.amp * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
        if (p.y > H + 20 || p.y < -30 || p.x < -30 || p.x > W + 30) { if (p.x < -30) p.x = W + 20; else if (p.x > W + 30) p.x = -20; else { parts[i] = p = make(false); if (theme === 'summer') p.y = H + 10; } }
        if (theme === 'winter') { ctx.globalAlpha = 0.78; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.drawImage(snowSprites[p.k], -p.r * 2, -p.r * 2, p.r * 4, p.r * 4); ctx.restore(); }
        else if (theme === 'summer') { ctx.globalAlpha = p.al; ctx.fillStyle = p.col; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.28); ctx.fill(); }
        else if (theme === 'spring') { ctx.globalAlpha = 0.95; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillStyle = p.col; ctx.strokeStyle = 'rgba(214,120,150,.45)'; ctx.lineWidth = 0.7; ctx.beginPath(); ctx.ellipse(0, 0, p.r, p.r * 0.55, 0, 0, 6.28); ctx.fill(); ctx.stroke(); ctx.restore(); }
        else { ctx.globalAlpha = 0.95; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); leaf(p.r, p.col); ctx.restore(); }
      }
      ctx.globalAlpha = 1;
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
    function size() { W = innerWidth; H = innerHeight; cv.width = W * DPR; cv.height = H * DPR; cv.style.width = W + 'px'; cv.style.height = H + 'px'; ctx.setTransform(DPR, 0, 0, DPR, 0, 0); }
    function start() {
      if (running) return; if (!cv) {
        cv = document.createElement('canvas'); cv.className = 'fx-canvas'; cv.setAttribute('aria-hidden', 'true'); document.body.appendChild(cv); ctx = cv.getContext('2d'); size();
        if (theme === 'winter') snowSprites = [sprite(0), sprite(1), sprite(2)];
        window.addEventListener('resize', function () { size(); });
      }
      cv.style.display = 'block'; parts = []; var n = count(); for (var i = 0; i < n; i++) parts.push(make(true));
      document.documentElement.classList.add('fx-on', 'fx-' + theme);
      if (theme === 'winter') caps(true);
      running = true; last = performance.now(); nextExtra = last + rnd(3000, 7000); requestAnimationFrame(frame);
    }
    function stop() {
      running = false; extra = null; if (cv) { ctx.clearRect(0, 0, W, H); cv.style.display = 'none'; }
      document.documentElement.classList.remove('fx-on', 'fx-' + theme);
    }
    /* snow piling up on the headline words, buttons and cards (winter only) */
    var capsDone = false, lvlTimer = null;
    function caps(on) {
      if (!on) return;
      if (!capsDone) {
        capsDone = true;
        document.querySelectorAll('.hero h1, .page-hero h1').forEach(function (h) {
          var w = document.createTreeWalker(h, NodeFilter.SHOW_TEXT), nodes = [], n; while ((n = w.nextNode())) nodes.push(n);
          nodes.forEach(function (t) {
            if (!t.nodeValue.trim()) return; var f = document.createDocumentFragment();
            t.nodeValue.split(/(\s+)/).forEach(function (s) { if (!s) return; if (/^\s+$/.test(s)) f.appendChild(document.createTextNode(s)); else if (/^[A-Z]/.test(s)) { var sp = document.createElement('span'); sp.className = 'fx-w'; sp.appendChild(document.createTextNode(s)); var m = document.createElement('i'); m.className = 'fx-mound'; m.style.setProperty('--fx-wd', (0.58 + Math.random() * 0.22).toFixed(2) + 'em'); m.style.setProperty('--fx-l', (Math.random() * 0.05 - 0.01).toFixed(2) + 'em'); sp.appendChild(m); f.appendChild(sp); } else f.appendChild(document.createTextNode(s)); });
            t.parentNode.replaceChild(f, t);
          });
        });
        document.querySelectorAll('.btn-red, .btn-ghost, .nav-cta, .nav-logo-chip, .brand-lockup, .hero-media, .hero-badge, .badge, .svc-card, .insight-card, .team-card, .pkg-card').forEach(function (el) {
          if (el.closest('.print-sec')) return; if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
          var c = document.createElement('i'); c.className = 'fx-cap'; c.style.setProperty('--fx-a', (22 + Math.random() * 20).toFixed(0) + '%'); c.style.setProperty('--fx-b', (58 + Math.random() * 24).toFixed(0) + '%'); el.appendChild(c);
        });
      }
      var lvl = 0.55; document.documentElement.style.setProperty('--fx-lvl', lvl);
      clearInterval(lvlTimer); lvlTimer = setInterval(function () { lvl = Math.min(1, lvl + 0.03); document.documentElement.style.setProperty('--fx-lvl', lvl.toFixed(2)); if (lvl >= 1) clearInterval(lvlTimer); }, 2500);
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

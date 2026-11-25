// CFA Accountants site build.
// Fills in the shared menu and footer on every page, then writes the finished site to /dist.
// Edit partials/nav.html, partials/mobile-nav.html or partials/footer.html once and every page updates.
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const OUT = path.join(ROOT, 'dist');
const SKIP = new Set(['dist', 'partials', 'node_modules', '.git', 'build.js', 'package.json', 'package-lock.json', 'vercel.json', 'README.md', 'CFA_PROJECT_HANDOVER.md', '.DS_Store']);

const partial = (n) => fs.readFileSync(path.join(ROOT, 'partials', n + '.html'), 'utf8').trim();
const PARTS = {};
for (const f of fs.readdirSync(path.join(ROOT, 'partials'))) if (f.endsWith('.html')) PARTS[f.slice(0, -5)] = partial(f.slice(0, -5));

// Which menu item is highlighted for which page.
const SERVICE_PAGES = new Set(['services', 'accounting', 'advisory', 'annual-accounts', 'bookkeeping', 'company-secretarial', 'companies-house-id-verification', 'corporation-tax', 'mtd-vat', 'payroll', 'self-assessment', 'tax']);
function activeId(rel) {
  const p = rel.replace(/\.html$/, '');
  if (p === 'index') return 'nav-home';
  if (p.startsWith('blog/') || p === 'insights') return 'nav-insights';
  if (p === 'about') return 'nav-about';
  if (p === 'contact') return 'nav-contact';
  if (p === 'pricing') return 'nav-pricing';
  if (p === 'switch-accountant') return 'nav-switch';
  if (p === 'tide') return 'nav-solutions';
  if (SERVICE_PAGES.has(p)) return 'nav-services';
  if (/^accountants-for-|-accountants-manchester$/.test(p)) return 'nav-industries';
  return null;
}
function markActive(html, id) {
  if (!id) return html;
  return html.replace(new RegExp('<a ([^>]*?)id="' + id + '"([^>]*)>'), (m, pre, post) => {
    const all = pre + 'id="' + id + '"' + post;
    if (/class="/.test(all)) return '<a ' + all.replace(/class="([^"]*)"/, 'class="$1 active"') + '>';
    return '<a ' + pre + 'class="active" id="' + id + '"' + post + '>';
  });
}

let pages = 0, copied = 0;
function walk(dir, rel) {
  for (const name of fs.readdirSync(dir)) {
    if (SKIP.has(name) && rel === '') continue;
    const src = path.join(dir, name), r = rel ? rel + '/' + name : name;
    const dst = path.join(OUT, r);
    if (fs.statSync(src).isDirectory()) { fs.mkdirSync(dst, { recursive: true }); walk(src, r); continue; }
    fs.mkdirSync(path.dirname(dst), { recursive: true });
    if (!name.endsWith('.html')) { fs.copyFileSync(src, dst); copied++; continue; }
    let html = fs.readFileSync(src, 'utf8');
    html = html.replace(/<!-- include:([a-z0-9-]+)([^>]*?)-->[\s\S]*?<!-- \/include:\1 -->/g, (m, key, flags) => {
      let out = PARTS[key];
      if (out === undefined) throw new Error('Missing partial partials/' + key + '.html used in ' + r);
      if (key === 'nav') {
        if (/scrolled/.test(flags)) out = out.replace(/^<nav>/, '<nav id="mainNav" class="scrolled">');
        out = markActive(out, activeId(r));
      }
      return out;
    });
    fs.writeFileSync(dst, html);
    pages++;
  }
}
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
walk(ROOT, '');
console.log('Build complete: ' + pages + ' pages, ' + copied + ' other files copied to dist/');

# CFA Accountants website

Menu and footer live in ONE place: the `partials/` folder.
- `partials/nav.html`         desktop menu
- `partials/mobile-nav.html`  mobile menu
- `partials/footer.html`      footer

Edit one of those files, upload it to GitHub, and every page updates when Vercel builds the site (`build.js`).

## Adding a new page
1. Copy a similar page (for example `company-secretarial.html`) and change the content, title, description, canonical and og tags.
2. Keep the three `<!-- include:... -->` markers around the menu and footer exactly as they are.
3. Add a rewrite for it in `vercel.json` and a line in `sitemap.xml`.
4. Add a link in `partials/nav.html` / `partials/footer.html` if you want it in the menu.

Never upload the `dist/` folder. Vercel creates it.

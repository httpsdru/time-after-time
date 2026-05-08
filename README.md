# time after time

Cafe website — Vite + React, hosted on Netlify, content managed via Decap CMS.

- **Two pages**: `/` (scrollable home gallery) and `/menu` (scroll-driven menu).
- **Type**: Times New Roman.
- **CMS**: `/admin/` — git-based, no external service or paid plan.

---

## Local development

```bash
# 1. install deps
npm install

# 2. start the dev server
npm run dev
```

Open http://localhost:5173.

### Running the CMS locally

By default the CMS uses Netlify Identity, which only works once the site is deployed. To edit content locally:

```bash
# in a second terminal:
npx decap-server
```

Then open http://localhost:5173/admin/. The CMS will read & write directly to your local files (because `local_backend: true` is set in `public/admin/config.yml`). Once you push to git, Netlify rebuilds.

---

## Deployment (one-time setup)

1. **Push to GitHub.** Create an empty repo, then:

   ```bash
   git init
   git add .
   git commit -m "initial commit"
   git remote add origin git@github.com:<you>/time-after-time.git
   git push -u origin main
   ```

2. **Connect to Netlify.**

   - Go to https://app.netlify.com → "Add new site" → "Import an existing project" → pick your GitHub repo.
   - Netlify will auto-detect the `netlify.toml` (build command `npm run build`, publish dir `dist`). Just click Deploy.

3. **Enable Netlify Identity (so the client can log in to `/admin/`).**

   In the Netlify dashboard for the site:

   - **Identity** → **Enable Identity**.
   - **Identity** → **Settings & usage** → **Registration** → set to **Invite only** (you don't want random people creating accounts).
   - **Identity** → **Services** → **Git Gateway** → **Enable Git Gateway**. (This is what lets the CMS commit to your repo.)
   - **Identity** → **Invite users** → enter the client's email.

4. **Update `site_url` and `display_url`** in `public/admin/config.yml` to your real Netlify URL, then push.

The client will receive an invite email, set a password, and from then on can log in at `https://<your-site>.netlify.app/admin/` to add menu items, swap photos, edit hours, etc.

---

## Content structure

All content lives in `src/content/` as JSON. The CMS writes to these same files.

```
src/content/
├── site.json              ← hours, address, instagram
├── menu/
│   ├── 01-french-toast.json
│   ├── 02-avocado.json
│   └── ... one file per item
└── gallery/
    ├── 01.json
    └── ... one file per home-page photo
```

Photos uploaded through the CMS go to `public/uploads/` and are referenced by URL (e.g. `/uploads/folded-eggs.jpg`).

### Menu item schema

```json
{
  "id": "folded-eggs",
  "name": "folded eggs",
  "price": 18,
  "category": "food",
  "order": 3,
  "image": "/uploads/folded-eggs.jpg",
  "description": "folded eggs on sourdough bread, cracked pepper"
}
```

`category` is `"food"` or `"drink"`. `order` controls position within the category (lower = earlier).

### Gallery photo schema

```json
{
  "image": "/uploads/croissant.jpg",
  "alt": "fig and ricotta croissant on a silver tray",
  "order": 1
}
```

---

## Project structure

```
.
├── public/
│   ├── admin/         ← Decap CMS (login at /admin/)
│   ├── uploads/       ← media uploaded via the CMS
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── Header.jsx + .css
│   │   └── Marquee.jsx + .css
│   ├── pages/
│   │   ├── Home.jsx + .css
│   │   └── Menu.jsx + .css
│   ├── content/       ← JSON content files (CMS writes here)
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── netlify.toml
├── vite.config.js
└── package.json
```

---

## How the menu interaction works

The `/menu` page renders all items as a single tall list. A scroll listener (in `src/pages/Menu.jsx`) finds the item closest to ~40% from the top of the viewport every frame and marks it as the "active" item — its photo and description appear in the sticky right-hand panel (or floating panel on mobile). Clicking an item smooth-scrolls it to the active position.

The `food` and `drink` links in the header jump to in-page anchors (`#food` at the top of the food section, `#drink` at the first drink item).

## How the home gallery works

`/` renders gallery photos as full-viewport sections stacked vertically. The cafe info card is positioned `fixed` at the centre of the viewport, and the `time after time` marquee is `fixed` at the bottom — both stay put while photos scroll past behind them. White text + `mix-blend-mode: difference` makes the overlays read on any background.

---

## Common tasks

**Add a new menu item without using the CMS:**
```bash
# Just add a new JSON file in src/content/menu/, commit, push.
```

**Reorder items:** change the `order` field. Lower numbers come first.

**Hide an item temporarily:** delete the JSON file (or move it out of `src/content/menu/`).

**Change the typeface:** edit `--serif` in `src/index.css`.

**Tweak the marquee speed:** change the `animation` duration in `src/components/Marquee.css` (currently `80s`).

# Deborasaurus Rex 🦕 — Source Code

Personal website for Kate (Deborah Kate P. Santiago).
Dual-theme (light fossil / dark Chrome dino), PIN-gated poems, game-gated personal info, ambient music, guestbook, and visitor interactions.

---

## File Structure

```
deborasaurus-rex/
│
├── index.html            ← Main page (HTML structure only, no content)
│
├── css/
│   └── styles.css        ← All visual styling & both themes
│
├── js/
│   ├── poems.js          ← ★ ADD / EDIT POEMS HERE
│   ├── about-data.js     ← ★ EDIT PERSONAL INFO HERE
│   ├── pin.js            ← ★ CHANGE PIN HERE
│   ├── music.js          ← Background music engine (rarely edited)
│   ├── game.js           ← Dino unlock game (rarely edited)
│   └── app.js            ← Core app logic (rarely edited)
│
├── backend/
│   ├── server.py         ← FastAPI backend (guestbook / mystery / identity)
│   └── requirements.txt  ← Python dependencies
│
├── vercel.json           ← Vercel deployment config (static deploy)
└── README.md             ← This file
```

---

## The Three Files You'll Edit Most

### 1. `js/poems.js` — Add or Edit Poems

Open this file. Scroll to the bottom of the `POEMS` array.

**To add a new poem**, paste this block before the final `];` and fill it in:

```js
,
{
  id: 36,               // ← next number after the last poem
  title: 'Your Title',
  dataTrack: 'read_poem_yourtitle',   // lowercase, underscores, no spaces
  text: `Your poem text here.
Line two.

New stanza starts here.`
}
```

**To edit an existing poem**, find it by its `title:` field, update the `text:` value, save.

**Line break rules inside the text:**
- Press Enter inside the backticks for a new line
- Leave a blank line between stanzas (just press Enter twice)

---

### 2. `js/about-data.js` — Edit Personal Info

All info shown in the "All About Kate" category tabs is here.

**To change a value**, find the row by its `label` and update `value`:

```js
{ label: 'Age', value: '19' },   // ← just change '18' to '19'
```

**To add a new row to a category**, add a new `{ label: ..., value: ... }` line inside the `rows: [...]` array of the right category.

**To add new Rapid-Fire answers**, find `rapidfire` → `items` and add:
```js
{ q: 'Your question?', a: 'Your answer' },
```

---

### 3. `js/pin.js` — Change the PIN

Open the file. Find this line near the top:

```js
const CORRECT = '101613';
```

Change `'101613'` to your new 6-digit PIN.

To also update the clue text, open `index.html` and find:
```html
<div class="pin-clue">Clue: <strong>"ordeal and some numbers"</strong></div>
```
Replace the clue text inside the `<strong>` tags.

---

## Deployment Options

### Option A — Vercel (Static, Recommended for quick deploy)

Works immediately with no setup. Poems, game, PIN, music, themes, and all personal info work perfectly. The guestbook, mystery, and identity voting sections will show "loading" but fail silently (they need a persistent backend).

**Steps:**

1. Upload this folder to a GitHub repository.
2. Go to [vercel.com](https://vercel.com) → New Project → Import your repo.
3. Framework preset: **Other**
4. Root directory: leave as-is (root of the repo)
5. Build command: leave empty
6. Output directory: leave empty
7. Click Deploy.

Done. Your site is live at `https://your-project.vercel.app`.

---

### Option B — Railway (Full-stack, Guestbook + Voting work)

Railway supports Python + persistent filesystem (SQLite works here).

**Steps:**

1. Push this folder to GitHub.
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub.
3. Add a `Procfile` to the root with:
   ```
   web: uvicorn backend.server:app --host 0.0.0.0 --port $PORT
   ```
4. In `index.html`, update the fetch URLs from `/api/deborasaurusrex/...` to `/api/...` (or configure Railway's routing).
5. The SQLite file (`deborasaurus.db`) will persist on Railway's volume.

---

### Option C — Render (Full-stack, Free tier available)

Same as Railway. Create a new Web Service, set:
- **Build command**: `pip install -r backend/requirements.txt`
- **Start command**: `uvicorn backend.server:app --host 0.0.0.0 --port $PORT`
- Set the root directory appropriately.

---

## How to Upload to GitHub

1. Create a new repository at [github.com](https://github.com) (name it anything, e.g. `deborasaurus-rex`).
2. On your computer, open a terminal in this folder and run:
   ```bash
   git init
   git add .
   git commit -m "Initial Deborasaurus Rex site"
   git remote add origin https://github.com/YOUR_USERNAME/deborasaurus-rex.git
   git push -u origin main
   ```
3. Done.

---

## Changing the Dino Game Unlock Score

Open `js/game.js`. Find:
```js
const TARGET_SCORE = 1900;
```
Change `1900` to whatever score you want (e.g. `500` to make it easier, `3000` to make it harder).

---

## Changing the Music Speed / Feel

Open `js/music.js`. Find:
```js
const BEAT = 0.22; // seconds per note
```
- Lower = faster (e.g. `0.15`)
- Higher = slower (e.g. `0.35`)

---

## Changing the Theme Colors

Open `css/styles.css`.

**Light mode colors** are at the top under `:root { ... }`.
**Dark mode colors** are under `[data-theme="dark"] { ... }`.

The main accent color is `--accent`. Change it to any CSS color value.

---

## Adding a Hero Badge

Open `index.html`. Find the `hero-badges` section:
```html
<div class="hero-badges">
  <span class="badge">🌍 Planet-sized personality</span>
  ...
```
Add a new `<span class="badge">Your emoji Your text</span>` line.

---

## Poem Count

Currently **36 poems** (poem-0 through poem-35).
Each new poem added to `js/poems.js` appears automatically — no HTML editing needed.

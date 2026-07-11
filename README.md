# Cue

Copy-paste prompts for landing pages. Black + electric blue premium theme.

Public browse-and-copy library. Admin (you) adds prompts by editing `src/data/prompts.js`.

## Run

```bash
npm install
npm run dev      # http://localhost:5173  (Vite default) — this project runs on :5230 via launch.json
npm run build
npm run preview
```

## What ships

- **Nav** — logo + tabs (All / Heroes / Landings / Pricing / CTA / Portfolios / Agencies) + search icon. Blurs on scroll. Tabs filter the grid.
- **Hero** — mixed sans caps + Instrument Serif italic accent. Hides when a filter is active.
- **Filter bar** — Pricing (All / Free / Premium) + Sort (Popular / Newest). "Clear filters" appears when any filter is active.
- **Rails on home** — Featured picks (2-up), Fresh finds (3-up), Trending this week (3-up).
- **Category view** — when any tab or filter is active, rails collapse into a single grid with the count in the header.
- **Cards** — thumb (mini-site preview) + title + category + badge (Copy or Premium). Click card = open modal. Click Copy badge = copy directly + toast.
- **Detail modal** — preview + tags + full prompt in monospace + Copy CTA + "Open in Bolt" / "Open in v0" pre-filled deep-links. Esc / backdrop / close button all dismiss.
- **Search overlay** — ⌘K (or /) opens. Live-filters grid by title / brand / category. Esc closes.
- **Toast** — bottom-right, 240ms slide-up, 2.4s auto-dismiss.
- **Empty state** — when filters return 0 results.
- **URL sync** — `?item=cue001`, `?section=Hero`, `?pricing=free`, `?q=aurora` all round-trip; back button works.
- **Footer** — one-line credit + Colophon / Twitter links.

## Adding prompts

Edit `src/data/prompts.js`. Each prompt is a plain object:

```js
{
  id: 'cue0XX',                 // stable, incrementing
  title: 'Your prompt title',
  category: 'User-facing label',
  section: 'Hero',              // Hero | Landing | Pricing | CTA | Portfolio | Agency
  tier: 'free',                 // 'free' or 'premium'
  brand: 'Aurora',              // shown inside card thumb
  variant: 'serif',             // 'sans' | 'caps' | 'serif' | 'sans-accent'
  stack: ['Bolt', 'v0'],        // deep-link buttons will show for Bolt and v0
  prompt: `Full paste-ready prompt string…`
}
```

The first two prompts appear in "Featured picks", the next six in "Fresh finds", the next six in "Trending". Remaining are only reached via filter or search.

## Design tokens

`src/styles/tokens.css` holds every color, radius, type size, and motion curve. Change once, propagate everywhere.

- Palette: near-black surfaces + one accent (electric blue `#3B82F6`)
- Type: Inter (UI) + Instrument Serif italic (accent words only)
- Radii: 20 / 22 / 24px on cards
- Motion: 240ms cubic-bezier(0.2, 0.7, 0.2, 1). Hover translateY(-2px) on cards, nothing else.

## Structure

```
public/
  favicon.svg
src/
  App.jsx                      Home composition + ⌘K handler
  main.jsx
  context/
    AppContext.jsx             filter + modal + toast state, URL sync, popstate
  hooks/
    useClipboard.js            navigator.clipboard + legacy fallback
  data/
    prompts.js                 the seed library + filterPrompts / sortPrompts helpers
  components/
    Nav.jsx                    sticky nav w/ scroll-blur, functional tabs
    Hero.jsx
    FilterBar.jsx              dropdowns + Clear filters
    FilterMenu.jsx             generic popover
    Rail.jsx                   titled shelf
    Card.jsx                   card + badge (Copy/Premium)
    CardThumb.jsx              mini site preview
    Modal.jsx                  detail sheet + Copy + Open-in deep links
    Toast.jsx                  slide-up notification
    Search.jsx                 ⌘K overlay
    EmptyState.jsx
    Footer.jsx
  styles/
    tokens.css                 all design tokens
    global.css                 reset + components
```

## Backends — local vs Supabase

Cue has two runtime modes. It picks automatically based on `.env`.

### Local mode (default)

- No config. Prompts live in the browser (localStorage).
- Every visitor sees the same seed prompts baked into `src/data/prompts.js`.
- Anything you add via `/#/admin` is a **local draft** — only visible in the browser it was added from.
- Use "Copy code" or "Export as JSON" from admin to move drafts into `src/data/prompts.js` permanently, then rebuild + redeploy.

### Supabase mode (recommended for a real launch)

- Prompts live in a Postgres table. Images and videos live in a Storage bucket.
- Admin form writes to the DB — new prompts appear site-wide instantly, no rebuild.
- Public reads use the anon key. Writes require auth (admin sign-in with email + password you set up in Supabase).

**One-time setup:**

1. Create a project at [supabase.com](https://supabase.com) (free tier is enough).
2. Copy `.env.example` → `.env` and fill:
   - `VITE_SUPABASE_URL` — from Project Settings → API
   - `VITE_SUPABASE_ANON_KEY` — same page
3. Open the Supabase **SQL editor**, paste the contents of `supabase-schema.sql`, and run. This creates the `prompts` table, RLS policies, and the `cue-media` storage bucket.
4. Supabase **Authentication → Users → Add user**. Set an email + password — this is your admin login.
5. Restart the dev server (`npm run dev`). The admin bar now says "Backed by Supabase".
6. Visit `/#/admin`, sign in, add a prompt. It publishes instantly.

That's it. Deploy `dist/` to Vercel / Netlify / Cloudflare Pages with the same env vars set in the host dashboard.

## What's next (after launch)

- Paywall gate + Stripe for Premium
- Analytics (basic click + copy events)
- Sitemap for SEO
- Bookmarks / favorites (localStorage)
- Category page routes (currently inline filter)

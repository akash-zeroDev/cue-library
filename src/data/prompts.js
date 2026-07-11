/**
 * CUE — prompt library seed
 *
 * Fields:
 *   id       — stable slug (used in URL later)
 *   title    — card title
 *   category — user-facing category label ("Hero section", "Pricing"…)
 *   section  — normalized taxonomy ("Hero", "Landing", "Pricing", "CTA", "Portfolio", "Agency")
 *   tier     — 'free' (Copy) | 'premium' (locked)
 *   rail     — 'featured' | 'fresh' | 'trending' | null   (which home shelf this appears on)
 *   brand    — text shown in the card thumb preview
 *   variant  — thumb typography style: 'sans' | 'caps' | 'serif' | 'sans-accent'
 *   stack    — target tools this prompt is written for
 *   thumbSrc — optional image URL for the card thumb (falls back to mock preview)
 *   prompt   — the actual paste-ready prompt string
 */
export const prompts = [
  {
    id: 'cue001',
    title: 'Aurora hero',
    category: 'Hero section',
    section: 'Hero',
    tier: 'free',
    rail: 'featured',
    brand: 'Aurora',
    variant: 'serif',
    stack: ['Bolt', 'v0', 'Cursor', 'Framer'],
    prompt: `Design a hero section for a dark-theme landing page.

Layout
- Full viewport width. 96px top padding, 72px bottom.
- Single centered column, max-width 720px. All elements center-aligned.

Palette
- Background #0A0A0A
- Text #FFFFFF (headline), rgba(255,255,255,0.65) (body)
- Accent electric blue #3B82F6

Order (top to bottom)
1. Chip badge: uppercase pill "FRESH DROPS EVERY WEEK". 12px, letter-spacing 0.14em. Background #0B1F3D, text #93C5FD, 0.5px hairline border rgba(147,197,253,0.2). Small blue dot before text.
2. Heading: two lines, uppercase. Line 1 "SHIP your NEXT". Line 2 "LANDING PAGE". Font 88px, weight 500, letter-spacing -0.035em, line-height 0.96. Wrap "your" in Instrument Serif italic 400 in lowercase.
3. Subhead: one line, 16px, color rgba(255,255,255,0.65), max-width 480px.
4. Button: off-white pill "Get unlimited →". Background #F4F4F1, text #0A0A0A, padding 14px 28px, border-radius 999px. Hover translateY(-1px) 240ms ease.

Typography
- Sans: Inter (weights 400, 500)
- Serif accent: Instrument Serif italic 400

Motion
- Button hover only. Nothing else animated.`
  },
  {
    id: 'cue002',
    title: 'Vantage landing',
    category: 'Landing page',
    section: 'Landing',
    tier: 'premium',
    rail: 'featured',
    brand: 'VANTAGE',
    variant: 'caps',
    stack: ['Bolt', 'v0', 'Framer'],
    prompt: `Full landing page for a fintech product called "Vantage".

Structure
1. Sticky nav — logo left, 5 links center, sign-in right. Transparent over hero, blurs after 60px scroll.
2. Hero — uppercase all-caps wordmark "VANTAGE" at 96px, tight tracking 0.02em. Sub "The vantage point for modern finance." Primary filled dark + secondary ghost outline CTA.
3. Trust logos strip — 6 muted marks in one row.
4. Feature triptych — 3 columns, small icon + 20px heading + one-line body each.
5. Pull-quote band — 32px serif italic on dimmed background.
6. Pricing preview — 2 tier cards, right one accented with "Most popular" chip.
7. Footer — 4 link columns + fine print.

Palette background #0A0A0A, cream #E8DFCF accent band, text #EDEDED body / #FFFFFF headings.
Type Inter Display headings, Inter body, Instrument Serif italic in the pull-quote only.
No gradients. Solid fills. Rounded 20px on cards, 999px on pills.`
  },
  {
    id: 'cue003',
    title: 'Nebula portfolio',
    category: 'Portfolio',
    section: 'Portfolio',
    tier: 'free',
    rail: 'fresh',
    brand: 'Nebula',
    variant: 'sans-accent',
    stack: ['v0', 'Framer'],
    prompt: `Single-page portfolio for a designer.

Structure
1. Top-left wordmark "Nebula" in electric blue #3B82F6, 24px, weight 500.
2. One-line H1 introduction — 44px sans, weight 500. "Independent designer for teams shaping the future."
3. 12-tile project grid. 4 columns desktop, 2 tablet, 1 mobile. Each tile 16:10, radius 20px, dark surface #111, subtle inset hairline. Hover translateY(-2px).
4. Sticky filter strip between H1 and grid: All / Product / Brand / Motion.
5. 3-column footer: contact email, socials, small credits.

Palette pure black #000, text #EDEDED, muted rgba(255,255,255,0.5). Only accent — electric blue #3B82F6.
Type Geist or Inter (400, 500). No serif anywhere.
No hover scaling on thumbs. No autoplay video. Poster frames only, loop on hover.`
  },
  {
    id: 'cue004',
    title: 'Halo pricing',
    category: 'Pricing',
    section: 'Pricing',
    tier: 'premium',
    rail: 'fresh',
    brand: 'Halo',
    variant: 'serif',
    stack: ['Bolt', 'v0'],
    prompt: `Pricing section with three tier cards.

Section header — small "PRICING" eyebrow uppercase muted. Large heading "Halo" in Instrument Serif italic 400, 48px. One-line sub in body gray.
Cards — row of 3, stacks to 1 column below 900px. Dark surface, 24px radius, 32px padding.

Tiers
- Free — $0. "For hobby projects." 5 features.
- Pro — $29/mo. "For solo builders." Accented 2px electric blue border + "Most popular" chip. 8 features.
- Team — $79/mo. "For small teams." 12 features.

Card internals: tier name, large price with tiny "/mo" superscript, one-line description, divider hairline, bulleted list (checkmarks blue for Pro, muted for Free, bold for Team), CTA button (Pro filled electric blue, others ghost outline).

Palette bg #0A0A0A, card #111, accent #3B82F6, border rgba(255,255,255,0.08).
Only Pro is accented. Never accent multiple tiers. No stars, no strikethroughs, no "save X%" strips.`
  },
  {
    id: 'cue005',
    title: 'Meridian CTA',
    category: 'CTA section',
    section: 'CTA',
    tier: 'free',
    rail: 'fresh',
    brand: 'MERIDIAN',
    variant: 'caps',
    stack: ['Bolt', 'v0', 'Cursor', 'Framer'],
    prompt: `Full-width CTA band for end of a landing page.

Layout — full viewport width, 160px vertical padding. Content max-width 640px, center-aligned.

Content
1. Small pill "READY TO SHIP" uppercase, tracked, muted.
2. Heading — two lines, 56px sans, weight 500, letter-spacing -0.02em. Line 1 "Ship it faster". Line 2 "with Meridian" — "Meridian" in Instrument Serif italic 400, slightly muted white.
3. Sub-copy — two-line paragraph, 15px, rgba(255,255,255,0.6).
4. Buttons — Primary: filled electric blue pill "Get started →". Secondary: ghost outline "Book a demo".
5. Trust line — "No credit card. Free forever plan." — 12px muted.

Palette bg #0A0A0A. Subtle inset hairline top rule. Accent electric blue #3B82F6 on primary button only.
No image, no illustration. Type and buttons only. Buttons must be pills, not rectangles.`
  },
  {
    id: 'cue006',
    title: 'Kelp studios',
    category: 'Agency',
    section: 'Agency',
    tier: 'free',
    rail: 'fresh',
    brand: 'Kelp',
    variant: 'sans',
    stack: ['v0', 'Framer'],
    prompt: `Agency landing hero for "Kelp Studios".

Layout — full viewport, 88px top padding. 60/40 split. Left = copy, right = single 16:10 showcase image, radius 20px.

Left column
- Eyebrow "AGENCY · SF" uppercase tracked
- Heading — three lines, 56px sans 500, letter-spacing -0.02em. "Studios for" / "brands that" / "actually ship."
- Two-line sub, 14.5px gray
- One CTA pill "See recent work →" (dark bg, hairline border)
- Row of 5 muted client logos

Right column — 16:10 dark #0A0A0A surface, radius 20px, soft inset hairline. No caption.

Palette background near-black #0A0A0A, text #EDEDED, muted rgba(255,255,255,0.55). Zero accent — grayscale only. The work is the color.
Do not center the hero. Left-align on desktop. No glow, gradient, shadow. No serif. Sans across the board.`
  },
  {
    id: 'cue007',
    title: 'Solstice hero',
    category: 'Hero section',
    section: 'Hero',
    tier: 'free',
    rail: 'fresh',
    brand: 'Solstice',
    variant: 'serif',
    stack: ['v0', 'Framer'],
    prompt: `Editorial hero for a fashion or wellness brand called "Solstice".

Layout single centered column, 120px top padding, 96px bottom. Max-width 560px.
Content order
1. Small serif italic eyebrow "S/S 26" — Instrument Serif italic, 14px, muted.
2. Heading — one line, "Solstice" in Instrument Serif italic 400, 96px, letter-spacing -0.02em, color #F4F4F1.
3. Sub — one line, 15px, muted, 60ch max.
4. Ghost outline pill button "Enter the season →".

Palette bg #0A0A0A, text #F4F4F1, muted rgba(244,244,241,0.55). No accent color. Zero saturation.
Type Instrument Serif italic across headings, Inter body.
Motion — none. This hero holds still.`
  },
  {
    id: 'cue008',
    title: 'Zenith hero',
    category: 'Hero section',
    section: 'Hero',
    tier: 'premium',
    rail: 'fresh',
    brand: 'ZENITH',
    variant: 'caps',
    stack: ['Bolt', 'v0'],
    prompt: `Bold uppercase hero for a developer tool "Zenith".

Layout centered column, 96px top padding, max-width 780px.
Content
1. Uppercase pill "V3 SHIPPED" — small text, letter-spacing 0.16em, dark bg with accent electric blue border.
2. Heading two lines uppercase — "ZENITH" line 1 at 120px sans 500, tracking -0.03em. "for the fastest 1%" line 2 at 32px sans 400, tracked normal, muted.
3. Sub paragraph 15px gray.
4. Two buttons: primary filled electric blue pill "Try v3 →", secondary ghost pill "See what's new".

Palette bg #0A0A0A, text #FFFFFF, accent #3B82F6.
Type Inter Display for the wordmark. Nothing serif.
Buttons pills. Filled button uses electric blue #3B82F6. Ghost uses hairline border.`
  },
  {
    id: 'cue009',
    title: 'Prisma hero',
    category: 'Hero section',
    section: 'Hero',
    tier: 'free',
    rail: 'trending',
    brand: 'Prisma',
    variant: 'sans-accent',
    stack: ['v0', 'Framer'],
    prompt: `Minimal hero with an accent-word treatment for a design agency "Prisma".

Layout — left-aligned, 80px top padding, max-width 900px, side padding 48px.
Content
1. Wordmark "Prisma." top-left, 20px, electric blue #3B82F6.
2. Heading one line: "Design systems for teams that ship in weeks, not quarters." 44px sans 500, letter-spacing -0.02em, line-height 1.15. Wrap "in weeks" in electric blue #93C5FD to accent it.
3. Sub two lines, 14.5px, muted.
4. One CTA pill "Book a call →" dark background, hairline border.

Palette bg #0A0A0A, text #EDEDED, muted rgba(255,255,255,0.55), accent #93C5FD (soft blue) — used only on the two accent words.
Type Inter across the board.
Left-align everything. Do not center.`
  },
  {
    id: 'cue010',
    title: 'Continuum landing',
    category: 'Landing page',
    section: 'Landing',
    tier: 'free',
    rail: 'trending',
    brand: 'Continuum',
    variant: 'sans',
    stack: ['Bolt', 'v0'],
    prompt: `Landing page for a productivity app "Continuum".

Sections
1. Nav — logo left, 3 links, sign-in right.
2. Hero — left-aligned in a 60/40 split. Left: eyebrow "PRODUCTIVITY, RE-IMAGINED", 48px 3-line heading, sub, primary + ghost buttons. Right: dark 16:10 product screenshot placeholder with radius 20px.
3. Bento feature grid — 4 tiles asymmetric layout (2×1 wide, 1×1, 1×1, 1×2 tall).
4. Testimonial 3-column.
5. Simple footer.

Palette bg #0A0A0A, surfaces #111, hairline borders rgba(255,255,255,0.08). Accent electric blue on 1 CTA only.
Type Inter throughout.
Bento grid tiles must have different heights but same width unit. Do not use gradients.`
  },
  {
    id: 'cue011',
    title: 'Origin landing',
    category: 'Landing page',
    section: 'Landing',
    tier: 'premium',
    rail: 'trending',
    brand: 'Origin',
    variant: 'serif',
    stack: ['Framer', 'v0'],
    prompt: `Landing page for a launch/waitlist page "Origin".

Structure
1. Nav — minimal, logo left, sign-in right only.
2. Hero — single centered column max-width 640px. "Origin" wordmark in Instrument Serif italic 84px. Heading below: "A better way to ship the start of everything." 20px sans, muted. Email input row: input + primary electric blue submit button pill.
3. Below-fold: 3-step "how it works" row with numbered chips.
4. FAQ accordion 6 items.
5. Footer minimal single line.

Palette bg near-black, text #EDEDED. Only accent is electric blue on submit button.
Motion — subtle fade-in on scroll for the "how it works" steps only.`
  },
  {
    id: 'cue012',
    title: 'Tier pricing',
    category: 'Pricing',
    section: 'Pricing',
    tier: 'free',
    rail: 'trending',
    brand: 'Tier',
    variant: 'caps',
    stack: ['Bolt', 'v0'],
    prompt: `Compact pricing section with 2 tiers side by side.

Layout — two 480px cards, centered on page, 24px gap between.
Cards
- Free — dark surface, hairline border, 32px padding. "$0" price in 44px 500. 6 features with muted check icons. Ghost pill CTA "Start free".
- Pro — same dimensions but 2px electric blue border, "MOST POPULAR" uppercase blue chip above card. "$19/mo" price. 10 features with electric blue check icons. Filled electric blue CTA "Get Pro →".

Palette bg #0A0A0A, cards #111, accent #3B82F6.
Type Inter across.
Rounded 20px on cards, 999px on pills. No gradients. Only Pro is accented.`
  },
  {
    id: 'cue013',
    title: 'Column pricing',
    category: 'Pricing',
    section: 'Pricing',
    tier: 'premium',
    rail: 'trending',
    brand: 'Column',
    variant: 'sans',
    stack: ['v0'],
    prompt: `Comparison table pricing with 4 tiers.

Layout — full-width table below a small section header. First column = feature name, next 4 columns = tier prices with check marks or "-" for missing.
Header row — tier name, price, one-line description, CTA button below the header.
Rows — 14 rows: Users, Projects, Storage, Custom domain, SSO, Analytics, API access, Support tier, ...

Style — hairline rows only, no borders on cells (only dividers). Sticky header on scroll. Third tier ("Business") is accented with a subtle electric blue tint on its column background.

Palette bg #0A0A0A, table hairlines rgba(255,255,255,0.08).
Type Inter, 14px body, 12px meta.
Accent used only to highlight the Business column.`
  },
  {
    id: 'cue014',
    title: 'Signal CTA',
    category: 'CTA section',
    section: 'CTA',
    tier: 'free',
    rail: 'trending',
    brand: 'Signal',
    variant: 'serif',
    stack: ['Bolt', 'v0', 'Framer'],
    prompt: `Compact CTA card for above-the-fold placement.

Layout — 720px wide card, centered, dark #111 surface, 32px padding, radius 24px, hairline border.
Content
1. Small eyebrow "READY?" uppercase, tracked, muted.
2. Heading two lines: "Ship your next" / "site with Signal" — 32px sans 500. "Signal" in Instrument Serif italic 400 accent, in slightly muted color.
3. Right side (in a 2-column grid): primary electric blue filled pill "Start free →".

Palette card bg #111, accent electric blue #3B82F6.
Layout: 2-column grid, text left, CTA right, vertically centered.`
  },
  {
    id: 'cue015',
    title: 'Beacon CTA',
    category: 'CTA section',
    section: 'CTA',
    tier: 'premium',
    rail: null,
    brand: 'BEACON',
    variant: 'caps',
    stack: ['v0', 'Framer'],
    prompt: `Full-bleed uppercase CTA band.

Layout — full viewport width strip, 200px vertical padding. Center-aligned column.
Content
1. Massive uppercase heading "READY WHEN YOU ARE." 88px sans 500, tracking -0.035em, color #F4F4F1.
2. Sub — one line, 16px, muted.
3. Primary CTA pill "Talk to us →" filled electric blue.

Palette bg #0A0A0A, top and bottom of the band have hairline borders rgba(255,255,255,0.08).
Type Inter Display for the headline.
No decorative elements. Just type and one button.`
  },
  {
    id: 'cue016',
    title: 'Archive portfolio',
    category: 'Portfolio',
    section: 'Portfolio',
    tier: 'free',
    rail: null,
    brand: 'Archive',
    variant: 'caps',
    stack: ['v0', 'Framer'],
    prompt: `Chronological archive-style portfolio.

Layout — single column, max-width 720px, centered.
Structure
1. Small heading "ARCHIVE" uppercase 14px tracked.
2. Rows of past work grouped by year. Each row: year on left (large 40px), 3-5 project links on right with hover underline.
3. 4 year groups: 2026, 2025, 2024, 2023.
4. At bottom: contact block with email and 2 social links.

Palette bg #0A0A0A, text #EDEDED, muted rgba(255,255,255,0.5), no accent.
Type Inter throughout. Year numbers in weight 500.
Hover on project links: underline appears, no color change.`
  },
  {
    id: 'cue017',
    title: 'Studio portfolio',
    category: 'Portfolio',
    section: 'Portfolio',
    tier: 'free',
    rail: null,
    brand: 'Studio',
    variant: 'sans',
    stack: ['v0', 'Framer'],
    prompt: `Studio-style portfolio landing.

Structure
1. Top nav — logo left, links right (Work / About / Contact).
2. Hero — massive left-aligned heading "We build brands people remember." 72px sans 500, letter-spacing -0.03em.
3. Featured project row — 3 large cards, each 4:3, radius 16px. Title + client + year overlay bottom-left.
4. About block — 2 paragraphs of 15px body.
5. Contact CTA — one line + email link.

Palette bg #0A0A0A, cards #111, text #EDEDED. Zero accent.
Type Inter across.
Motion — hover translateY(-2px) on cards.`
  },
  {
    id: 'cue018',
    title: 'Workshop agency',
    category: 'Agency',
    section: 'Agency',
    tier: 'premium',
    rail: null,
    brand: 'Workshop',
    variant: 'serif',
    stack: ['Framer', 'v0'],
    prompt: `Boutique agency single-page site.

Structure
1. Nav — wordmark left, one link "Contact" right.
2. Hero — centered, 3-line manifesto: "We only take" / "on work we" / "believe in." — mixed sans + Instrument Serif italic on "believe in".
3. Services list — 4 rows: Brand, Web, Motion, Print. Each row expands on click to reveal a paragraph.
4. Selected work grid — 6 tiles 16:10 in 3 columns.
5. Contact — email + one-line address.

Palette bg #0A0A0A, hairlines rgba(255,255,255,0.08). No accent color.
Type Inter + Instrument Serif italic.
Motion — accordion expand 240ms ease.`
  }
]

export const featured = prompts.filter((p) => p.rail === 'featured')
export const fresh = prompts.filter((p) => p.rail === 'fresh')
export const trending = prompts.filter((p) => p.rail === 'trending')

export const SECTIONS = ['Hero', 'Landing', 'Pricing', 'CTA', 'Portfolio', 'Agency']

export function filterPrompts(list, { section, pricing, q }) {
  const needle = q.trim().toLowerCase()
  return list.filter((p) => {
    if (section && p.section !== section) return false
    if (pricing === 'free' && p.tier !== 'free') return false
    if (pricing === 'premium' && p.tier !== 'premium') return false
    if (needle) {
      const hay = `${p.title} ${p.category} ${p.brand} ${p.section}`.toLowerCase()
      if (!hay.includes(needle)) return false
    }
    return true
  })
}

export function sortPrompts(list, sort) {
  const copy = [...list]
  if (sort === 'newest') {
    copy.sort((a, b) => b.id.localeCompare(a.id))
  }
  // 'popular' is source order for now
  return copy
}

# TekSeries New

The visual language of the TekSeries homepage ("TekSeries Home - Larger Text"). TekSeries is a § 501(c)(3) non-profit working in New York and South East Nigeria, preparing underserved Nigerian youth for the future of work and innovation. The look is warm and confident: deep plum surfaces, saffron and coral accents, pill-shaped actions and generously rounded cards on a soft blush page.

## Voice

- Plain, hopeful and direct: "Expanding Opportunity, Empowering Our Future", "One Youth Career At A Time".
- Title Case for headlines and buttons ("Support our work" is the one sentence-case exception in the source; keep whichever the page already uses).
- The brand triad is **Share. Create. Solve.**, with "Solve." in saffron when it is set as display type.
- Cite sources for statistics (Statista, WEF). Don't invent figures; use a placeholder like [NUMBER].

## Colour

- **Plum** (`plum`) is the brand. It fills the hero, the mission card and the footer, and it colours headings on light grounds.
- **Saffron** (`saffron`) is the accent: chips, the main hero button, eyebrows on plum, avatar rings, the active slider dot and hover states. Text on saffron is always `ink`.
- **Coral** (`coral`) is for small labels only: eyebrows on white, team roles, quote sources, service numbers. It is about 3.1:1 on white, so keep it at 14px or larger and bold.
- The page is `blush`; cards are `white` with a 1px `line` border. Soft fills use `lilac`, with `lilac-deep` for hover.
- Text: `ink` for the base, `body` for long paragraphs on white, `muted` for secondary text, `mist` for body on plum, and `lilac-deep` for the lead line and footer text on plum.
- The hero photo sits under a left-to-right plum overlay: `overlay-strong` at 0%, `overlay-mid` at 45%, `overlay-soft` at 100%.

## Type

- **Schibsted Grotesk** (`display`, weights 700–800) for headlines, numbers and card titles, with tight negative tracking (−2% to −3%).
- **Onest** (`text`, weights 400–700) for everything else. Ligatures are off (`font-variant-ligatures: none`).
- Scale: h1 62, h2 54, stat 50, footer-display 38, h3 32, card-title 28, name 24; lead 22, body-l 18, body 17, body-s 16, eyebrow 15 (uppercase, +12%), caption 14 (uppercase, +10%).
- Both families and the icon font load from Google Fonts. `components/bundle.css` imports them.

## Responsive scale

Three sizes, matched to the breakpoints: **desktop** (above 1100px), **tablet** (641–1100px, designed at 834px) and **mobile** (640px and below, designed at 390px). Tablet and mobile keep every colour, radius style and component. Only the size steps down, so a page reads the same on a phone without shouting. The text styles carry `-tablet` and `-mobile` versions (`h1-mobile` and so on), and the `layout` and `size` families hold the matching spacing and element sizes.

| Element | Desktop | Tablet | Mobile |
| --- | --- | --- | --- |
| Hero headline (h1) | 62 / 1.02 | 40 / 1.04 | 30 / 1.05 |
| Section title (h2) | 54 | 36 | 28 |
| Stat number | 50 | 44 | 36 |
| Service title (h3) | 32 | 26 | 22 |
| Card statement | 28 | 24 | 21 |
| Team name / stat title | 24 | 21 | 19 / 18 |
| Hero lead | 22 | 19 | 17 |
| Body (Mission, Method, Services) | 18 · 17 | 16 | 15 |
| Bios, footer | 16 | 15 | 14 |
| Quotes | 17 | 15 | 14 |
| Eyebrow, hero chip | 15 | 13 | 12 |
| Roles, sources, copyright | 14 | 13 | 12 |
| Buttons (text · padding) | 17 · 14/26 | 16 · 13/22 | 15 · 12/20, hero pair full width |
| Page gutter | 56 | 24 | 16 |
| Section padding (vertical) | 48 | 40 | 32 |
| Card padding | 44 | 32 (service/team 28/24) | 24/20 (service/team 22/20) |
| Card gap | 20 | 18 | 16 |
| Card radius (main / service, team / quote) | 32 / 28 / 20 | 28 / 24 / 18 | 24 / 22 / 16 |
| Icon tile · icon | 60 · 30 | 54 · 27 | 48 · 24 |
| Team photo · ring | 104 · 4 | 92 · 4 | 80 · 3 |
| Logo height | 44 | 40 | 34 |
| Partner logos | 40 | 34 | 30 |

Rules:

- Tap targets never go below `touch-target` (44px). The menu button and social links stay at 44px on every size.
- The hero chip wraps inside the hero on tablet and mobile (`width: fit-content; max-width: 100%`) and never runs off the edge.
- On tablet the nav collapses to the menu button and grids go to one column (Team keeps two). On mobile everything is one column and the hero buttons stack full width.
- The components switch to these sizes by themselves at the breakpoints. On a fixed-width artboard, where the window is not the device, put the class `ts-tablet` or `ts-mobile` on the artboard's root to get the same sizes.

## Motion

Motion is used sparingly, for a handful of reveals that make the page feel alive without slowing reading. It is built with CSS animations (`@keyframes` plus the `animation` tokens as custom properties), with no animation library; the tokens keep the same names in the boards and the WordPress theme. Scroll reveals start when an element comes into view: a small IntersectionObserver adds a `data-in` attribute, and CSS does the rest.

- **Easing.** `ease-out` for entrances (hero copy, Pillar cards, impact counters); `ease-soft` for gentler follow-ups (section headings, the content inside a Pillar card). Both are CSS `cubic-bezier()` curves.
- **Timing.** One reveal lasts `duration-reveal` (0.8s); items shown in sequence are spaced by `stagger-reveal` (0.12s). The impact count-up runs 2s.
- **Distance.** Revealed elements rise by `distance-reveal` (28px); Pillar cards travel twice that.
- **What moves.** The hero copy rises in on load (the photo stays still); the impact numbers count up from 0 when the card comes into view; each Pillar card slides up, its content a beat later; section headings fade up. Nothing loops except the partner logo strip.
- **Reduced motion.** With "reduce motion" on, nothing animates: the page shows finished, with the final numbers.

## Shape, spacing and layout

- Everything is rounded: `radius-pill` for actions and chips, `radius-xl` (32) for the hero and main cards, `radius-lg` (28) for service and team cards, `radius-md` (20) for quotes and icon tiles, `radius-footer` (36) for the footer panel.
- No shadows. Separation comes from colour blocks and 1px `line` borders.
- Content maxes out at 1440px, with side padding of max(56px, (100% − 1440px) / 2). The gutter drops to 24px at 1100px and 16px at 640px.
- Cards sit on a 12-column grid with 20px gaps (About splits 7 / 5). Sections have 32–48px of vertical padding.

## Iconography

Material Symbols Rounded, weight 400, outline, by ligature name (`TekSeries.Icon`). The names in use are hub, lightbulb, settings_suggest, co_present, potted_plant, emoji_events, work, menu and close. Icons are plum inside lilac tiles on white, and saffron beside white words on plum. The social links use two-letter marks (in, fb, ig) rather than logos.

## Imagery

The source uses real programme photography (bootcamps and workshops) at 32px corners, team portraits in circles with a 4px saffron ring, and partner logos at 40px height in a white pill strip. None of these are stored in this system; the TekSeries logo isn't either. Designs link the originals on tekseries.com.

## Listing cards (Events and other post archives)

The site is built for WordPress, so every card in a post listing (the Events page, and any archive built the same way) shows that post's **featured image** under a tinted overlay.

- **Each post owns its tone.** The tone is set once when the post is published and stored with it (post meta), so the post keeps the same colour and topic icon wherever it appears: its listing card, the "More events" cards, and the solid banner at the top of its own page. A new post takes the tone after the newest post's in the cycle `saffron` → `plum` → `ink` → `lilac` → `saffron`, so a newest-first listing always reads plum, saffron, lilac, ink, plum, saffron… (today: Women in Engineering plum, Empower Her Future saffron, Smart Job Search lilac, AI Impact ink, Tech Career Explore plum, Makers’ Prize saffron).
- **Paging.** The large "Latest event" card (always the newest post) and the saffron Get Involved card stay put on every page. Only the five grid cards change, stepping back through older posts (page 2 shows posts 7–11, and so on), each in its own tone and icon. Filters never recolour a post.
- **Post page banner.** The banner on a post's own page is that post's tone as a solid colour, with no image, carrying the breadcrumb, type badge, title, date, time, venue and buttons, the large date (desktop only; tablet and mobile drop it), and the topic icon bleeding off the bottom-right corner. Text and buttons follow the tone: plum and ink banners use white text with saffron accents; saffron uses ink text with ink buttons; lilac uses plum text with plum buttons. The poster appears as its own card: beside the details on desktop and tablet, and on mobile straight after the banner and before Event details.
- **Overlay.** The same left-to-right gradient as the homepage hero, in the card's tone: 94% at 0%, 72% at 45%, 15% at 100%. Plum `rgba(74, 29, 94, …)`, saffron `rgba(244, 162, 97, …)`, lilac `rgba(241, 230, 238, …)`, ink `rgba(42, 21, 51, …)`. The image is `object-fit: cover`, anchored to the top.
- **On top of the overlay**, unchanged per tone: the type badge top left, the large date (day, then month and year in the tone's accent) bottom left, and a large Material Symbols topic icon bleeding off the bottom-right corner at low opacity.
- **Tone colours.** Plum: white text, saffron accent and badge. Saffron: ink text, plum accent, ink badge. Lilac: plum text, ink accent, plum badge. Ink: white text, saffron accent, lilac badge.
- **No featured image:** the card shows the solid tone with the same badge, date and icon.
- The first card on page 1 is the large "Latest event" card; the rest sit in the grid (3 columns on desktop, 2 on tablet, 1 on mobile), with a saffron Get Involved card in the last slot.

## Components

`window.TekSeries` (React 18). Load `components/bundle.css`, then `components/bundle.js`.

- Actions: Button (primary / soft / dark / accent / outline · sm / md / lg).
- Labels: Chip, Eyebrow.
- Navigation: NavLink, SocialButton.
- Hero: Pillar, SliderDots.
- Icons: Icon, IconTile.
- Cards: ServiceCard, QuoteCard, TeamCard, StatBar, CtaCard.

Every component reads the colour and radius tokens as CSS variables and falls back to the source values, so it renders correctly even without `tokens.css`. Page layout, sections and copy stay as ordinary markup.

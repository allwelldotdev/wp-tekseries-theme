# Architecture decisions

This file records the significant architecture and design decisions for the TekSeries block theme (`wp-content/themes/tekseries`) and the `tekseries-blocks` plugin, starting with those the site owner made on 2026-10-09 before the build.

## ADR-001: The repository is the WordPress root, tracked through a whitelist

**Status:** Accepted

**Context:** tekseries.com is being rebuilt as a block theme plus a companion plugin. The site already runs as a LocalWP install with real content, plugins and uploads. Only the theme, the plugin, root tooling and `docs/` belong in version control.

**Options:**
- A standalone repository holding the theme and plugin, run only on wp-env.
- A standalone repository symlinked into the LocalWP install.
- The repository root is the WordPress root, with a whitelist `.gitignore`.

**Decision:** The repository root is the WordPress root. `.gitignore` ignores `/*` and re-includes, one directory level at a time, only the root tooling files, `.github/`, `docs/`, `specs/`, `tests/`, `types/`, `wp-content/themes/tekseries/` and `wp-content/plugins/tekseries-blocks/`. Root npm workspaces (`package.json`) hold the shared tooling. The plugin is the only workspace and the only package with a build step. Root scripts, `phpcs.xml.dist` and `vitest.config.mts` name our folders explicitly.

**Rationale:** The theme and plugin sit at their real WordPress paths, so no symlinks or copies are needed. The whitelist keeps WordPress core, `wp-config.php`, uploads and third-party code out of git. Explicit paths stop linters, formatters and test runners from crawling WordPress core.

## ADR-002: Develop on LocalWP and run e2e tests on wp-env

**Status:** Accepted

**Context:** The LocalWP site has the real content and the third-party plugins the site depends on (WP Job Manager, Fluent Forms, Rank Math, ACF, WP Mail SMTP). Tests and the "activates on a fresh install" check need a clean, reproducible WordPress.

**Options:**
- wp-env for development and tests.
- LocalWP for development, wp-env for e2e tests and the fresh-install check.

**Decision:** Daily development runs on the LocalWP site, using its PHP, WP-CLI and Composer. wp-env (`.wp-env.json`) runs only the e2e tests and the fresh-install check: WordPress 7.1.3, PHP 8.2, port 8890, the theme and plugin mapped from `wp-content/`, and the theme activated by `lifecycleScripts`. wp-env's separate tests environment is off, so `playwright.config.ts` reads the port from `.wp-env.json` and starts wp-env as its web server.

**Rationale:** Development needs the real data; tests need a clean install. Port 8890 avoids Local's ports (10000 and up) and other wp-env projects (8888 and 8889). wp-env does not activate themes on its own, hence the lifecycle scripts.

## ADR-003: Support PHP 8.2+ and WordPress 7.1+, checked by PHPCompatibilityWP 3.0 alpha

**Status:** Accepted

**Context:** The live host runs PHP 8.2.34 and WordPress 7.1.x. The core Tabs block needs WordPress 7.1. PHP 8.2 security support ends on 2026-12-31.

**Options:**
- Minimum PHP: 8.3, or 8.2 to match the host.
- PHP compatibility checks: the stable PHPCompatibilityWP 2.1, or the 3.0 alpha.

**Decision:** The theme (`style.css`) and the plugin header declare `Requires at least: 7.1` and `Requires PHP: 8.2`. `phpcs.xml.dist` sets `minimum_wp_version` to 7.1 and `testVersion` to `8.2-`, and `composer.json` pins the platform to PHP 8.2. Compatibility checks use PHPCompatibilityWP 3.0 alpha, with `@alpha` on all three PHPCompatibility packages, alongside WordPress Coding Standards 3.4. LocalWP and wp-env both stay on PHP 8.2.

**Rationale:** Matching the host avoids code that runs locally but fails live. The stable PHPCompatibilityWP 2.1 has no sniffs for PHP 8.x features. The alpha flags PHP 8.3 code such as typed class constants and `json_validate()`. Raising the floor waits for the host upgrade (see Future work).

## ADR-004: Pin the JavaScript toolchain to Node 24 LTS, TypeScript 6.0 and wp-prettier

**Status:** Superseded by ADR-016 (e2e runner only)

**Context:** `@wordpress/scripts` drives the build, linting, unit tests (Vitest) and e2e tests (Playwright). Some newer releases of its dependencies break it.

**Options:**
- Node: 24 LTS, or 25.
- TypeScript: `~6.0`, or the latest 7.x.
- Prettier: let npm hoist upstream `prettier`, or alias it to `wp-prettier`.

**Decision:** Node 24 LTS (`.nvmrc`; `engines.node` is `^24.15.0 || >=26.0.0`, with npm 11+). `@wordpress/scripts` ^36.1, TypeScript `~6.0.3`, Vitest 5 with Vite 8, Playwright 1.64 through `wp-scripts test-e2e`, and `@wordpress/env` 11.17. The root `prettier` dependency is `npm:wp-prettier`.

**Rationale:** Node 25 is end-of-life and fails `wp-scripts check-engines`. TypeScript 7 falls outside typescript-eslint's peer range and breaks linting. Without the alias, npm hoists upstream Prettier, which drops WordPress's spacing inside parentheses.

## ADR-005: Split the code into three layers; the plugin owns blocks and data, the theme owns design

**Status:** Accepted

**Context:** The rebuild replaces Divi, the Divi child theme and DiviFlash. Site editors must change text, images, links, header, footer and global colours in the Site Editor without code. Every page must show its content and navigate with JavaScript disabled.

**Options:**
- Keep a page builder, as today.
- A headless or React-rendered frontend.
- A block theme that also holds the custom blocks and content types.
- A block theme plus a companion blocks plugin, with fixed layers.

**Decision:** A block theme plus the `tekseries-blocks` plugin, with three layers:
- Editor UI: React via `@wordpress/element` and TypeScript (`edit.tsx`), in wp-admin only.
- Server render: PHP (`render.php`) outputs complete HTML that works without JavaScript.
- Frontend behaviour: the Interactivity API (`view.ts`, `data-wp-*` directives).

React never ships to visitors. Our code uses no inline `<script>`, jQuery or CDN scripts. Custom blocks, content types, meta, binding sources and WP Job Manager overrides live in the plugin. The theme holds only `theme.json`, templates, parts, patterns and a light `functions.php`. Core blocks and patterns come first, and Block Bindings come before a new dynamic block when the only need is a meta-backed field. PHP globals are prefixed `tekseries_` or `TekSeries`. Every control is keyboard-operable with a visible focus ring, tap targets are at least 44px, and text meets WCAG AA contrast.

**Rationale:** Anything in the plugin survives a theme change. Server rendering keeps pages usable without JavaScript, and the Interactivity API adds behaviour without shipping React. Core blocks keep content editable in the Site Editor. The plugin registers its blocks from the build manifest (`wp_register_block_types_from_metadata_collection()`), so a new block needs no PHP edits.

## ADR-006: Use separate text domains for the theme and the plugin

**Status:** Accepted

**Context:** Every user-facing string is translatable. The theme and the plugin are separate WordPress packages.

**Options:**
- One `tekseries` text domain for both.
- `tekseries` for the theme and `tekseries-blocks` for the plugin.

**Decision:** The theme uses `tekseries` and the plugin uses `tekseries-blocks`, as their `Text Domain` headers in `style.css` and `tekseries-blocks.php` declare. `phpcs.xml.dist` accepts both.

**Rationale:** WordPress loads a plugin's translations by its slug. A plugin using the theme's domain would lose its translations after a theme change, which ADR-005 exists to prevent.

## ADR-007: Allow third-party jQuery only on the Contact form and the job submit form

**Status:** Accepted

**Context:** Our code uses no jQuery (ADR-005). Fluent Forms and WP Job Manager's submit and edit form depend on it for TinyMCE, select2 and file uploads. WP Job Manager also uses jQuery for its AJAX listing filters and its apply toggle.

**Options:**
- No jQuery anywhere, replacing the plugins' forms.
- Allow third-party jQuery wherever a plugin enqueues it.
- Allow third-party jQuery only where replacing it is impractical.

**Decision:** Third-party jQuery may load only on the Contact page (Fluent Forms) and on the WP Job Manager submit and edit form. Every other screen stays jQuery-free: the job dashboard's actions menu uses `<details>`, the apply toggle uses `<details>` or the Interactivity API, and the job listing is our own block (ADR-012).

**Rationale:** Those two forms need jQuery for their editor, select fields and uploads. Rebuilding them would cost far more than it saves. Limiting the exception to two screens keeps it small and explicit.

## ADR-008: Self-host fonts and icons, and add a darker coral for small text

**Status:** Superseded by ADR-021 (font subsets only)

**Context:** The design system (`docs/design-reference/design-system/tekseries/`) loads Schibsted Grotesk, Onest and the Material Symbols icon font from Google Fonts, and the boards draw social icons from Font Awesome on jsDelivr. Its coral `#E76F51` is 3.09:1 on white. The design system allows it at 14px bold, but WCAG AA counts only 18.66px bold and larger as large text.

**Options:**
- Fonts: load from Google Fonts, or self-host.
- Icons: a self-hosted Material Symbols subset font, SVGs registered with the WordPress 7.1 Icon API for the core Icon block, or inline SVG from a custom block.
- Social icons: Font Awesome from a CDN, or the core Social Links icons.
- Small coral text: keep `#E76F51` and accept AA failures, or add a darker text token.

**Decision:**
- Schibsted Grotesk and Onest are self-hosted through `theme.json` `fontFace`, subset to latin and latin-ext.
- About 110 Material Symbols become an SVG collection that the plugin registers on the Icon API.
- Social links use the core Social Links icons.
- A `coral-text` token `#CE401C` (4.80:1 on white, 4.52:1 on blush) is used for coral text below 18.66px bold. The source coral stays for large type and decoration.

**Rationale:** Self-hosting removes third-party requests and CDN dependencies (ADR-005). SVG icons follow `currentColor`, show no ligature text while a font loads, and appear in the editor's icon picker. Latin-ext covers Igbo names (ị, ọ, ụ, ṅ). The darker coral keeps the brand colour and meets AA.

## ADR-009: Style with plain CSS from theme.json tokens, light-only, with fluid sizes

**Status:** Superseded by ADR-021 (radii only)

**Context:** The design system defines one light theme (`tokens.json`) and three sizes: desktop above 1100px, tablet 641–1100px and mobile 640px and below. Editors change global colours in the Site Editor. In WordPress 7.1, responsive `@tablet` and `@mobile` styles are documented only under `styles.blocks`, not for root spacing or elements.

**Options:**
- Plain CSS/SCSS driven by `theme.json` tokens, or Tailwind.
- Light-only, or a dark style variation as well.
- Three fixed size steps matching the boards, or fluid `clamp()` sizes.

**Decision:** Plain CSS/SCSS reads `theme.json` tokens through CSS custom properties; no Tailwind. The site is light-only: no dark style variation and no `prefers-color-scheme` rules. Type, section padding, gaps, card padding and radii use fluid `clamp()`. The page gutter steps 56 / 24 / 16px at the `settings.viewport` widths: mobile 640px, tablet 1100px.

**Rationale:** Tokens stay in one place, `theme.json`, where editors change them in the Styles panel. Tailwind would add a second token system and a theme build step. The design system has no dark theme. Fluid sizes land within about 3.5px of the tablet boards and need no root-level breakpoints.

## ADR-010: Move the event model into the plugin and keep event fields in ACF

**Status:** Superseded by ADR-032 (tone and icon fields only)

**Context:** Events are the `event` post type with the `event_type` taxonomy, registered today in the Divi child theme. A theme switch would make `/events/`, every `/event/{slug}/` and the type archives return 404. Event fields live in an ACF group: `event_date` (stored as `Ymd`), `cta_link` (an ACF link array) and `cta_name`. The design also needs a time label, venue, tone and topic icon.

**Options:**
- Registration: in the new theme, or in the plugin.
- Fields: keep ACF and bind with ACF's `acf/field` binding source; native plugin meta with `show_in_rest` plus a one-off migration from ACF; or `register_post_meta` on the existing ACF keys, which fails for the `cta_link` array.

**Decision:** The plugin registers `event` and `event_type` with the child theme's args unchanged (`has_archive` `events`, rewrite slugs `event` and `event_type`, `show_in_rest`), before the theme switch. Event fields stay in ACF and bind through `acf/field`. New fields (time label, venue, tone, icon and an optional short title) join the same group, registered in plugin code with `acf_add_local_field_group()` and `show_in_rest`. The plugin header declares `Requires Plugins: advanced-custom-fields`.

**Rationale:** The site owner chose to keep the existing data in place with no migration. Identical registration args keep every event URL. Registering fields in code puts them under version control. The cost is a hard ACF dependency, and native meta would have given ISO dates and a plain URL field. A spike must confirm that a Button `url` binding accepts `cta_link`; if not, a small `tekseries/event` binding source or a separate URL field fills the gap.

## ADR-011: Auto-assign each post's tone on first publish, and let editors pick its icon

**Status:** Accepted

**Context:** The design gives every event and news post one of four tones (plum, saffron, lilac, ink) and a topic icon. A post keeps both everywhere: its listing card, the "More" strips and its own banner. The design system says a new post takes the tone after the newest post's tone in the cycle saffron → plum → ink → lilac. Core blocks cannot bind a class or background to post meta.

**Options:**
- Tone: editors pick it for every post; or it is auto-assigned on first publish and stored, with an editor override.
- Cycle: one shared by events and news, or one per post type.
- Icon: editors pick from a curated set, or a fixed icon per event type.
- Rendering: a `render_block` filter that injects a tone class, a custom card block, a custom binding source, or a wrapper block.

**Decision:** On first publish, a post takes the tone after the newest same-type post's tone. Events and news have separate cycles. The tone is stored as post meta, and editors can override it in the sidebar. A WP-CLI backfill command tones existing posts in date order. Editors pick the topic icon from a curated set of about 30 icons, with defaults per event type (Webinar, Workshop, Makers Prize) and one default for news. A `tekseries/post-tone` wrapper block (InnerBlocks, `usesContext: postId`) outputs a `ts-tone--{tone}` class and the decorative icon; CSS variables do the rest.

**Rationale:** A stored tone never changes, so filters and paging never recolour a post. Separate cycles keep each listing rotating visually. The wrapper block works inside Query Loop and leaves the card's contents as editable core blocks.

## ADR-012: Render the Job Series listing with a plugin block, and keep WP Job Manager overrides in the plugin

**Status:** Accepted

**Context:** WP Job Manager's `[jobs]` shortcode loads its rows by AJAX with jQuery and shows nothing without JavaScript. With filters off it renders rows, but its pagination still needs JavaScript and it ignores filter parameters. WP Job Manager counts search impressions only on pages that contain `[jobs]`. The design restyles the listing, single job, submit flow and dashboard, which needs WP Job Manager template overrides, and those are PHP. WP Job Manager's meta keys start with `_`, so `core/post-meta` bindings cannot read them.

**Options:**
- Listing: `[jobs]` with overrides, accepting a no-JavaScript exception; or a custom server-rendered block.
- Overrides: in the theme's `job_manager/` folder (WP Job Manager's convention), or in the plugin.

**Decision:** `tekseries/job-listings` is a dynamic plugin block. It reuses `get_job_listings()` and `content-job_listing.php`, takes filters as GET parameters, uses real `?pg=` links, and is enhanced with the Interactivity API. It keeps WP Job Manager's listing markup and stats script, so impressions still count. Template overrides live in the plugin and load through the `job_manager_locate_template` filter. The theme keeps only `single-job_listing.html`, page patterns and tokens. A `tekseries/job-field` binding source exposes WP Job Manager fields to core blocks.

**Rationale:** The block keeps the listing usable without JavaScript and free of jQuery (ADR-007). Reusing WP Job Manager's query and row template keeps its data and behaviour. Overrides are PHP, which ADR-005 keeps out of the theme, and in the plugin they survive a theme change.

## ADR-013: Collapse the header at 1100px with two core Navigation blocks

**Status:** Superseded by ADR-018 (compact menu overlay only)

**Context:** The boards collapse the header at 1100px into an inline panel below the header bar. Core Navigation collapses at a hard-coded 600px into an overlay, and core navigation overlays are always full-screen.

**Options:**
- Accept core's 600px full-screen overlay.
- One Navigation block with CSS that overrides core's 600px rules.
- Two core Navigation blocks switched by WordPress 7.1 block visibility.

**Decision:** The header part holds two core Navigation blocks shown by 7.1 block visibility: the full menu above 1100px and a compact one at 1100px and below, styled as the board's inline panel. No `navigation-overlay` template part is used. Menu anchor links are absolute (`/#about`) so they work from inner pages.

**Rationale:** It matches the boards with core blocks only. Block visibility uses the same `settings.viewport` widths as the styles (ADR-009).

## ADR-014: Ship the Home page static first, with animated plugin blocks later

**Status:** Accepted

**Context:** The Home boards show a hero with slider dots, count-up statistics and a scrolling partner-logo marquee. The live hero already has two slides. Core has no carousel block, a count-up value set in CSS is not editable, and a marquee needs a pause control (WCAG 2.2.2).

**Options:**
- Static core blocks only: one hero, plain numbers, a wrapping logo row.
- Animated custom blocks only.
- Both: static versions first, animated blocks later.

**Decision:** Home first ships static core-block versions: a single hero without dots, static stat numbers and a wrapping logo row. Later, the plugin adds `tekseries/hero-carousel`, a `tekseries/stat` count-up and `tekseries/logo-marquee` with a pause control. All three honour `prefers-reduced-motion`. Editors can swap a static section for its animated block.

**Rationale:** The site owner chose both. The static versions keep the page complete without JavaScript and do not wait on custom blocks.

## ADR-015: Build the Gallery as a custom block over a private media_album taxonomy

**Status:** Superseded by ADR-044 (taxonomy visibility only)

**Context:** The Gallery boards have type and year filters with counts, video items, Load more with a counter, and a lightbox with captions and thumbnails. Today's gallery is six DiviFlash albums holding 32 unique images, with the year only in each album title; the upload dates were lost in a 2023 migration. 1,711 of the media library's attachments are WP Job Manager company logos.

**Options:**
- Display: core Gallery with "Enlarge on click", which loses the filters, counts, Load more, lightbox captions, thumbnails and video; or a custom `tekseries/media-gallery` block.
- Items: all media, images attached to the Gallery page, a `gallery_item` post type, or attachments tagged with a private taxonomy.

**Decision:** `tekseries/media-gallery` renders the grid on the server, with type and year filters as real links, Load more and the counter. An Interactivity API lightbox adds captions and thumbnails. Items are attachments tagged with a private `media_album` taxonomy whose terms carry the year. The six albums map 1:1 to terms.

**Rationale:** It keeps the designed features and works without JavaScript. The year comes from the album, not the upload date. Tagging excludes the WP Job Manager logos by construction.

## ADR-016: Run e2e tests with Playwright directly

**Status:** Accepted

**Context:** ADR-002 runs e2e tests on wp-env, and ADR-004 pinned `wp-scripts test-e2e` as the runner. Before any test, that runner made two network calls: a `playwright install` check, and a wp-env config load that asks api.wordpress.org for the latest WordPress version even with core pinned. Both flaked with `ERR_SOCKET_CLOSED_BEFORE_CONNECTION`. The root `playwright.config.ts` already sets the base URL, reads the port and starts wp-env, which is all the runner added.

**Options:**
- Keep `wp-scripts test-e2e` and retry on failure.
- Run `playwright test` directly.

**Decision:** `npm run test:e2e` is `playwright test`. Browsers install once with `npm run test:e2e:install` (`playwright install chromium`). Playwright itself stays at the version ADR-004 pins.

**Rationale:** Tests no longer depend on network calls that have nothing to do with the code under test. Test runs behave the same offline and on a flaky connection.

## ADR-017: Keep theme strings in PHP patterns, and leave parts and templates as references

**Status:** Accepted

**Context:** HTML template parts and templates cannot call gettext, so strings in them are not translatable (ADR-006). The header, footer, 404 page and empty-results message all contain user-facing text.

**Options:**
- Hard-code English in `parts/*.html` and `templates/*.html`.
- Put the markup in PHP patterns with gettext calls, and have the parts and templates reference the patterns.

**Decision:** `parts/header.html` and `parts/footer.html` each hold only a `wp:pattern` block. `patterns/header.php`, `footer.php`, `404.php` and `no-results.php` hold the markup, with `tekseries` gettext calls. The templates reference the 404 and no-results patterns the same way. The block markup comes from the editor's serializer, so it validates in the Site Editor. The footer copyright year is computed with `wp_date( 'Y' )`. Once an editor saves the footer part in the Site Editor, the pattern is expanded into the stored part and the year becomes static text.

**Rationale:** The theme's strings stay translatable while editors can still edit the parts. The cost is that a saved footer no longer updates its year, so editors must change it by hand.

## ADR-018: Restyle core's navigation overlay for the compact header menu

**Status:** Accepted

**Context:** ADR-013 left the compact menu's overlay open ("styled as the board's inline panel"). Core's overlay already provides the toggle, focus trap, Escape handling and ARIA state through the Interactivity API. WordPress 7.1's custom overlay template part was considered, but core's navigation render code still renders it inside the full-screen modal container.

**Options:**
- A custom overlay template part.
- Core's overlay, restyled with CSS.

**Decision:** The compact Navigation block (1100px and below) keeps core's overlay and restyles it with CSS into a panel under the header bar, with the close button placed over the menu button. Its accessible name is "Menu", because core renames a second "Main" navigation to "Main 2". Desktop navigation links are 44px-high pills to meet the touch-target rule in ADR-005.

**Rationale:** Core keeps ownership of focus and keyboard behaviour, so no custom script is added (ADR-005). CSS alone gives the board's layout. The restyle depends on core's overlay class names, so core updates need a visual check.

## ADR-019: Define block style variation data in theme.json and register only the names in PHP

**Status:** Accepted

**Context:** The design needs named variations: button soft, dark and accent; group card, card-plum, card-saffron and card-lilac; paragraph eyebrow. Core's outline button must work on light and plum surfaces. WordPress 7.1 supports block-level `:hover` in `theme.json`. Core drops `theme.json` variation data for variations that are not registered, and responsive keys do not apply in standalone `styles/*.json` partials (Trac #65992).

**Options:**
- Standalone `styles/blocks/*.json` partials.
- `register_block_style()` with inline CSS.
- Data in `theme.json` `styles.blocks.*.variations`, names registered in PHP.

**Decision:** Style data lives in `theme.json` under `styles.blocks.*.variations`. `tekseries_register_block_styles()` in `functions.php` registers the names and labels only. Core's outline button is restyled with `inherit` and `currentColor`, so it follows the surface. The focus ring colour also follows the surface.

**Rationale:** One file holds all the values and editors can change them in the Styles panel (ADR-009). Registering names satisfies core's filter without duplicating the styles. Partials would lose the responsive keys.

## ADR-020: Run WordPress in theme development mode

**Status:** Accepted

**Context:** WordPress caches a theme's pattern list and `theme.json` until the theme version changes. During development, new patterns never registered and the template parts rendered empty (ADR-017).

**Options:**
- Clear the cache by hand or bump the theme version on every change.
- Set `WP_DEVELOPMENT_MODE` to `theme`.

**Decision:** `WP_DEVELOPMENT_MODE` is `theme` in `.wp-env.json` (ADR-002) and on the LocalWP site's configuration.

**Rationale:** Theme edits take effect at once in both environments, and neither needs manual cache steps.

## ADR-021: Ship Fontsource variable fonts with a Vietnamese subset for Igbo, and use radius presets

**Status:** Accepted

**Context:** ADR-008 chose self-hosted fonts subset to latin and latin-ext, and ADR-009 chose fluid radii. Igbo letters ị, ọ and ụ (U+1EA0 to U+1EF1) are in neither latin nor latin-ext. Core has had `border.radiusSizes` presets since 6.9.

**Options:**
- Fonts: latin and latin-ext only, or add the Vietnamese subset where a font has one.
- Radii: CSS variables only, or `border.radiusSizes` presets.

**Decision:**
- Fonts are variable woff2 files from the Fontsource packages, in `assets/fonts/`, with their OFL licences alongside. They are declared in `theme.json` `fontFace` with `unicodeRange`. Schibsted Grotesk has latin and latin-ext. Onest adds the vietnamese subset, which covers ị, ọ and ụ.
- Schibsted Grotesk has no Vietnamese subset, so those letters fall back to the system sans in headings. This is a known gap (see Future work).
- Radii are `border.radiusSizes` presets, so editors get a radius picker.
- The page gutter (56 / 24 / 16px) is a CSS variable stepped at the `theme.json` viewports (ADR-009), not a fluid size.

**Rationale:** The Vietnamese subset is the only one that includes the Igbo letters missing from latin-ext, and it costs one extra file for body text. Radius presets put the tokens in the editor UI. A stepped gutter matches the boards exactly, where fluid sizing would not.

## ADR-022: Keep page content in each page's post content, built from theme patterns

**Status:** Accepted

**Context:** The Home, Contact and Gallery sections could live in templates or in the pages themselves. The site owner wanted editors to own page content, with revisions, in the page editor. ADR-017 keeps strings in patterns.

**Options:**
- Keep the sections in `front-page.html` and page templates.
- Insert the sections from patterns into each page's post content.

**Decision:** `front-page.html` and the custom template "Page with its own hero" (`page-no-title.html`) render `post-content` at full width. Home, Contact and Gallery content is inserted from patterns and edited in the page editor. The theme ships section patterns (`home-*`, `contact-*`, `gallery-hero`, `cta-band`) and full-page patterns (`page-home`, `page-contact`, `page-gallery`, with `Block Types: core/post-content`), so a new page can start from them. There is no home content in any template.

**Rationale:** Editors get per-page ownership and revisions, and a new page starts from a complete layout. The cost is that content changes ship to live as page content, through a database migration step, and not with the theme.

## ADR-023: Use existing media-library images in page content, and bundle optimised copies in patterns

**Status:** Accepted

**Context:** The Local site is a copy of live, so the Home and Gallery photos are already in the media library. Patterns must also look complete on a fresh install, where those attachments do not exist (ADR-002).

**Options:**
- Import images into the media library from the theme.
- Use the existing attachments in page content and bundle fallbacks in the theme.

**Decision:** Page content (ADR-022) uses the existing attachments, and nothing was imported. One team portrait stays on Cloudinary as an external image URL, as the owner prefers. The theme bundles optimised copies in `assets/images/` (`home/hero.jpg`, `about.jpg`, `case-study.jpg`, four partner logos and `avatar.svg`, a placeholder avatar) for use in patterns.

**Rationale:** Live content keeps its attachments and IDs, and a fresh install still shows full patterns. The Cloudinary portrait is an owner choice, and it adds one external dependency that ADR-005 does not otherwise allow for images.

## ADR-024: Register a `tekseries` icon collection from Google's Material Symbols SVGs

**Status:** Accepted

**Context:** ADR-008 chose SVGs on the WordPress 7.1 Icon API instead of an icon font, at about 110 icons. The design now uses 117. The `@material-symbols/svg-400` npm package is optical size 48 and lacks six names the design uses.

**Options:**
- The `@material-symbols/svg-400` package.
- SVGs fetched from Google's gstatic at optical size 24.

**Decision:** The plugin registers a `tekseries` icon collection of 117 Material Symbols Rounded SVGs in `assets/icons/`, committed with the Apache-2.0 licence (`LICENSE.txt`). `npm run icons` (`scripts/fetch-icons.mjs`) fetches them from gstatic at optical size 24.

**Rationale:** Size 24 matches the sizes the design draws, and the package could not supply every name. Committing the files keeps builds offline. This sets the final icon count that ADR-008 estimated.

## ADR-025: Drive responsive layout with per-block `@tablet` and `@mobile` styles

**Status:** Accepted

**Context:** ADR-009 stepped the page gutter at the `theme.json` viewports and noted that WordPress 7.1 documents `@tablet` and `@mobile` styles under `styles.blocks`. Pages built from core blocks (ADR-022) need responsive grids, flex direction and padding.

**Options:**
- Theme utility classes with media queries.
- Per-block `@tablet` and `@mobile` styles in block attributes.

**Decision:** Grid column counts and spans, flex orientation and padding use per-block `@tablet` and `@mobile` styles. Theme CSS covers only what block supports cannot express: decorative circles and icons, card media internals and third-party form styling (ADR-028).

**Rationale:** Editors can change responsive behaviour in the editor, and the page keeps no hidden class dependency. Deviations from the boards: the Pillar II key figures stack to one column on mobile, because three columns need 11px labels. Insight cards stack on tablet and mobile instead of a swipe carousel. The team is a plain grid, not masonry.

## ADR-026: Build listings from two non-inherited Query Loops, and inherit on type archives

**Status:** Superseded by ADR-033 (interim plum tone only)

**Context:** The Events archive and the News posts page show a "Latest" card, then a grid with a "Get Involved" card as its last item. Core ignores `offset` on inherited queries. The design's per-post tone (ADR-011) is not yet bound.

**Options:**
- One inherited query for every listing.
- Two non-inherited Query Loops, with offset, on the main listings.
- A custom listing block.

**Decision:**
- `archive-event.html` and `home.html` use two non-inherited Query Loops. The first is the "Latest" card (1 post). The second is a grid of 5 per page with `offset` 1 and the "Get Involved" card last.
- Pagination uses core `?query-N-page=` URLs, the owner's default. The Latest card never moves.
- Event type archives (`taxonomy-event_type.html`) use a single inherited query.
- Event filters are links to the `event_type` archives.
- Plum is the interim tone for every card until the per-post tone is bound (see Future work).

**Rationale:** Core blocks give the layout with no new block (ADR-005). Offset needs a non-inherited query, and type archives need inheritance to filter by term. Skipping a custom block keeps the markup editable.

## ADR-027: Keep template text in non-inserter PHP patterns

**Status:** Accepted

**Context:** ADR-017 moved header, footer, 404 and no-results text into PHP patterns. The other templates also hold user-facing text.

**Options:**
- Hard-code English in `templates/*.html`.
- Use `template-*` PHP patterns, referenced from the templates.

**Decision:** Each template's text lives in a `template-*` pattern (`Inserter: no`): `archive`, `events`, `event-type`, `index`, `legal`, `news`, `page`, `search`, `single` and `single-event`. The templates keep layout and a `wp:pattern` reference. This extends ADR-017 from parts to templates.

**Rationale:** The strings stay translatable (ADR-006). Pages cannot insert these patterns by accident.

## ADR-028: Set the current-page state and breadcrumbs with theme filters

**Status:** Accepted

**Context:** Core marks a navigation link as current only when it stores an object ID. The header and filter links are relative URLs. Core's breadcrumbs insert a term, such as "Uncategorized", between the archive and the title.

**Options:**
- Custom script or CSS for the current state.
- Theme filters on the rendered blocks.

**Decision:** In `functions.php`, a `render_block_core/navigation-link` filter adds the current class and `aria-current="page"` to relative links on an exact path match. On a single event or post, the Events or News link counts as the current section. A `block_core_breadcrumbs_items` filter keeps single posts and events to Home / archive / title.

**Rationale:** Server-side output works without JavaScript (ADR-005). Both filters are presentation only, which fits the light `functions.php` that ADR-005 allows the theme.

## ADR-029: Edit Fluent Forms form 1 in place and style its block through the theme

**Status:** Accepted

**Context:** The Contact form holds 318 entries. The design adds a topic choice, placeholders and a "Send message" button. ADR-007 allows jQuery on the Contact page.

**Options:**
- Create a new form and migrate entries.
- Edit form 1 in place.

**Decision:** Form 1 was edited in place and keeps its entries. It gained a "What is this about?" radio (General question, Workshops, Job Series, Support or sponsorship), defaulting to General and prefilled from `?topic=`, plus the design's placeholders and the button. The theme styles the Fluent Forms block through `wp_enqueue_block_style`. The jQuery exception of ADR-007 stands.

**Rationale:** Editing in place keeps every entry and the form's ID in page content. Styling through a block style loads the CSS only where the block renders.

## ADR-030: Use core Gallery blocks for the interim gallery

**Status:** Superseded by ADR-045

**Context:** ADR-015 plans `tekseries/media-gallery`, which is not built. The stored alt text for the gallery images is file-name style.

**Options:**
- Wait for the custom block.
- One core Gallery block per album, with the core lightbox.

**Decision:** Until `tekseries/media-gallery` ships, the Gallery page holds one core Gallery block per album, with the core lightbox, shown as a uniform 4:3 grid. Alt text falls back to the image captions. ADR-015 stands as the target.

**Rationale:** The page is usable now and needs no custom code. The filters, counts, Load more and video of ADR-015 are missing until the block replaces it.

## ADR-031: Style legal pages through a "Legal page" template

**Status:** Accepted

**Context:** The terms and privacy pages share one layout: a plum hero, a questions card and numbered sections. A table-of-contents block is planned.

**Options:**
- Page content only, with hand-built sections.
- A custom template with CSS counters over a restructured page.

**Decision:** The "Legal page" template (`page-legal.html`) holds only the layout and references `tekseries/template-legal` (ADR-027). It gives a plum hero, a sticky questions card, and numbered H2 sections via CSS counters. Each page's content was restructured so every section is an H2 with a stable anchor, and the wording is unchanged. The template holds no legal content.

**Rationale:** CSS counters keep the numbering out of the text, so editors can reorder sections. Stable anchors are ready for the table-of-contents block.

## ADR-032: Store tone and topic icon as plugin-registered post meta, assigned on publish

**Status:** Accepted

**Context:** ADR-011 gives every event and news post a tone and a topic icon. ADR-010 listed both among the new fields in the code-registered ACF group. Only the plugin's own block, the publish hook and the editor sidebar read them. wp-env has no ACF (ADR-002), so ACF-backed meta would not work in the e2e tests or on a fresh install.

**Options:**
- Tone and icon as ACF fields with an `acf/field` binding.
- Plain post meta registered by the plugin with `register_post_meta`.
- Icon default: a stored value set on publish, or a default computed at render.

**Decision:**
- `tekseries_tone` (saffron, plum, ink, lilac) and `tekseries_icon` (one of 30 curated icons from the `tekseries` collection, ADR-024) are post meta registered on `event` and `post` (`includes/meta.php`). Each has `show_in_rest` with an enum schema where an empty value means "not chosen", a sanitize callback and `edit_post` auth. They are not ACF fields. The ACF "Events" group (`event_date`, `cta_link`, `cta_name`, plus new time and venue fields) still moves into code, unchanged, with the Block Bindings work in Phase 5.
- With no icon picked, a post shows a default computed at render: the event type's icon (webinar `videocam`, workshop `co_present`, makers-prize `emoji_events`), `newspaper` for news, otherwise `event`. It is not stored, so changing a type changes the default. A read-only REST field, `tekseries_default_icon`, exposes it to the editor.
- On the transition into `publish`, a post with no tone gets the tone after the newest published post of the same type that has one, in the cycle saffron, plum, ink, lilac (`includes/tone-cycle.php`). Posts published in the same second are ordered by ID. With no toned post, the tone is plum. Events and news cycle separately. The hook is `wp_after_insert_post`, which fires after REST has saved meta, so a tone picked before publishing is kept. Editors can override the tone in the sidebar (ADR-034).
- `wp tekseries backfill-tones [--post_type=event|post] [--force] [--dry-run]` (`includes/cli.php`) tones published posts oldest first. The oldest starts where the cycle must start for the newest post to land on plum. This reproduces the design boards' sample listings: on Local, 19 events and 20 news posts, newest first plum, saffron, lilac, ink and so on. Posts with a tone keep it unless `--force` is given.
- There is no PHPUnit suite. The cycle is tested end to end over REST in `specs/tones.spec.ts`.

**Rationale:** The tone is stored, so filters and paging never recolour a post (ADR-011). Plain registered meta needs no binding source and works without ACF. The cost is that two event-related fields sit outside the ACF group that holds the rest. A computed default keeps untouched posts in step with their event type.

## ADR-033: Render tone through a `tekseries/post-tone` block, with the block owning its look and the theme owning what is inside

**Status:** Accepted

**Context:** Listing cards and post banners must take the post's tone as a background, text colour and large decorative icon. Core blocks cannot bind a class or background to post meta (ADR-011). The blocks inside, such as the date, type badge, breadcrumbs and buttons, also change with the tone.

**Options:**
- A `render_block` filter that injects a tone class.
- A wrapper block that outputs the tone class, with CSS split by ownership.
- Keep the Cover block with a fixed plum overlay.

**Decision:**
- `tekseries/post-tone` is a dynamic wrapper block (InnerBlocks; uses context `postId` and `postType`; attribute `variant` is `card` or `banner`). `render.php` outputs `ts-tone--{tone} ts-tone--{variant}` and the topic icon SVG from `wp_get_icon()`, `aria-hidden`, bleeding off the bottom-right corner. It has no front-end script. It declares `supports.interactivity.clientNavigation`, so it does not disable enhanced pagination. Supports are align, a flex layout with no switching, padding, margin, block gap, minimum height, aspect ratio and border radius.
- The block's stylesheet maps the theme's `custom.tone.{tone}.*` tokens to `--ts-tone-*` custom properties and draws the surface: background, text colour, headings that inherit the tone text, a featured image inside that fills the box under the tone's overlay gradient (card), and the icon.
- The theme's `assets/css/blocks/post-tone.css`, loaded only where the block is, uses those properties for the blocks inside: large date, type badge, breadcrumbs, accent icons, banner buttons and the focus ring.
- The rule: the block's own look lives in the plugin; how core blocks inside it look lives in the theme (ADR-005).
- `theme.json` `custom.tone` gained `banner-accent`, `sub` (breadcrumbs), `button-bg`, `button-text` and `line` (outline) for each tone, from the EventPost board. Card and banner accents differ for lilac: ink on cards, plum on banners.
- Listing card media and single banners in the theme's template patterns now use this block instead of a Cover with a fixed plum overlay. The inner-page hero (`hero-plum`) is unchanged.

**Rationale:** A wrapper block works inside Query Loop and leaves the contents as editable core blocks. Tokens stay in `theme.json` (ADR-009). Splitting by ownership keeps the block reusable under another theme while the theme controls how its own blocks look. This delivers the per-post tone that ADR-026 left as an interim plum.

## ADR-034: Build editor-only TypeScript with type-only WordPress packages and a webpack entry for the sidebar

**Status:** Accepted

**Context:** `edit.tsx` files and the post sidebar need types for `@wordpress/*` editor packages, which WordPress provides as externals at runtime. WordPress 7.1 ships React 18.3.1. `@wordpress/block-editor` ships no types. The "Tone and icon" sidebar panel is not a block, and `wp-scripts` builds only the scripts that `block.json` files list.

**Options:**
- Types: no type checking for editor code; or `@wordpress/*` as devDependencies used only for types.
- Block editor types: `@types/wordpress__block-editor`, or a small local declaration.
- Sidebar build: a second build tool, or an extra entry added to the default `wp-scripts` webpack config.
- Icon list: duplicated in TypeScript, or passed from PHP.

**Decision:**
- The `@wordpress/*` editor packages are devDependencies of the plugin workspace, on the `@wordpress/scripts` 36.1 release line, used only for types. At runtime they remain WordPress externals. Root `package.json` pins `@types/react` to 18.3.31 to match React 18.3.1.
- `types/wordpress-block-editor.d.ts` declares only the `@wordpress/block-editor` exports the plugin uses, because `@types/wordpress__block-editor` pins older `@wordpress` packages. `types/assets.d.ts` covers asset imports.
- The plugin's `webpack.config.js` adds `post-settings/index` as an extra entry to the default script config. `includes/editor.php` enqueues it in the block editor.
- The curated icon list reaches the panel from PHP as inline data, so `tekseries_blocks_topic_icons()` stays the one source of truth (ADR-032). Icon SVGs and labels come from the core icon REST entity.
- The panel uses only stable components, `ColorPalette` for the tone and a button group for icons, because `ToggleGroupControl` is still experimental.

**Rationale:** Type-only packages give editor code real checks without shipping a second copy of WordPress's libraries (ADR-005). A small local declaration avoids a version clash. One extra entry avoids a second build. One icon list removes drift between PHP validation and the picker. Stable components avoid breakage when experimental APIs change.

## ADR-035: Register the ACF Events group in code and bind event fields to core blocks

**Status:** Accepted

**Context:** ADR-010 chose to keep event fields in ACF, register them in code and spike whether a Button `url` binding accepts `cta_link`. ADR-032 moved tone and icon out of that group and left the rest for this phase. The group was first made in the ACF admin and is stored in the database. Events run in West Africa Time (WAT) and the site time zone is UTC. Every event on the site is already past, and the design has no past-event state. wp-env had no ACF (ADR-032), so the e2e tests could not exercise the bindings.

**Options:**
- Keep the database-stored group and bind to it.
- Register the group in code under new keys, with a migration.
- Register the group in code under the existing group and field keys.
- A custom `tekseries/event` binding source, if core bindings fall short.

**Decision:**
- `includes/acf.php` registers the "Events" group with `acf_add_local_field_group()` on `acf/include_fields`, using the same group key (`group_643e98e5780ba`) and field keys as the stored group. The code version replaces it and existing values keep loading, which was verified on the dev site. The stored group can be deleted once the code group is live. Every field has `show_in_rest` and `allow_in_bindings`, because ACF's `acf/field` source returns an empty string without the latter.
- Two optional text fields are new: `time_label`, free text with a time zone such as "11:00 AM WAT", and `venue`.
- The plugin header declares `Requires Plugins: advanced-custom-fields`. wp-env installs the exact release 6.8.10 from `https://downloads.wordpress.org/plugin/advanced-custom-fields.6.8.10.zip`. The wordpress.org slug serves WP Engine's ACF again, and the zip is byte-identical to the dev site's copy. A unit test checks the header and that `.wp-env.json` pins an exact version.
- Templates bind core blocks. Date blocks take `datetime` from `event_date`. Paragraphs take `time_label`, `venue` and `cta_link`, which shows as "Join here" text. The Register Button takes `url` from `cta_link` and `text` from `cta_name`, and opens in a new tab. `cta_link` returns a URL string, so the Button binding works unchanged and the `tekseries/event` source was not needed.
- An `acf/blocks/binding_value` filter fixes two values. A Date block bound to a date field gets an ISO 8601 date at midnight in the site time zone, not ACF's formatted "September 26, 2026". Core's Date block accepted the formatted string, but `<time datetime>` was then invalid and the day could shift on a site west of UTC. A link field bound to text drops its scheme ("bit.ly/WomEngineers").
- Blocks with class `ts-register` (the Register button and the Join here row) pass through a `render_block` filter in `includes/events.php`. Once the event date (`Ymd`, site time zone) has passed, the button becomes a "This event has ended" note and the other blocks are removed. A Register button with no link is hidden. This plain note is interim: the designer was asked for a past-event state.
- A row whose bound value is empty is hidden with CSS `:has()`: a `.ts-event-row` without a non-empty `.ts-event-value`. Older events have no time or venue.

**Rationale:** The same keys keep every stored value with no migration, and the fields come under version control, as ADR-010 intended. Core bindings keep the templates as editable core blocks (ADR-005). The hard ACF dependency that ADR-010 accepted now also holds in wp-env, so the bindings are testable on a fresh install. The ISO date filter keeps the markup valid and the day correct. A free-text time label avoids storing a time zone for events that all run in WAT.

## ADR-036: Sort events by event date

**Status:** Accepted

**Context:** Events listed by publish date, which is not when they happen. Core runs `query_loop_block_query_vars` only for non-inherited Query Loops. The event archive and event type archives use an inherited loop (ADR-026), so that filter never fires for them. Some events have no date.

**Options:**
- Order by `meta_value` with a single meta key, which drops undated events.
- Custom orderby in each template.
- Two filters: one for non-inherited loops, one for the main query.

**Decision:** Two filters set the order. `query_loop_block_query_vars` covers the non-inherited loops: the Latest card, the paginated grid and More events. `pre_get_posts` covers the main query of the event archive and the type archives. Both use the same arguments: a meta query that is an OR of `event_date` EXISTS, a named clause used for ordering, and NOT EXISTS, so undated events stay in the list, last. Publish date breaks ties. Only loops left on the default "date" orderby change, and their ASC or DESC direction is kept. The Latest card with the offset-1 grid (ADR-026) still pairs correctly because both queries share the order. The tone cycle stays on publish order (ADR-032).

**Rationale:** Sorting by event date puts upcoming and recent events first, which is what a visitor expects. The OR clause keeps undated events visible. Touching only the default orderby leaves an editor's explicit choice alone. Tones are assigned at publish, so the cycle must not follow event date.

## ADR-037: Add event type icons through filters on core blocks

**Status:** Accepted

**Context:** The event type badge and the type filter chips had no icon (ADR-033). The post topic icon already follows the event type by default (ADR-032). Templates should stay core blocks (ADR-005).

**Options:**
- A custom block for the badge and for the chips.
- Filters on core blocks, keyed on classes.

**Decision:**
- `includes/event-types.php` registers `tekseries_icon` term meta on `event_type`. It is REST-editable and uses the same curated set and sanitiser as the topic icon. An unset term falls back to the slug map in `includes/meta.php` (Webinar `videocam`, Workshop `co_present`, Makers' Prize `emoji_events`), which stays the single source of defaults. An event's default topic icon follows its first type's icon.
- `render_block_core/post-terms` adds the icon to each term link of a "badge" Post Terms block.
- `render_block_core/navigation-link` adds the icon to links with class `ts-type-chip`, matching the `/event_type/<slug>/` path. "All events" gets `apps`, which was added to the icon collection (ADR-024).
- `render_block_core/icon` swaps the drawing of an Icon block with class `ts-event-type-icon` (the details card), keeping its size and classes.
- There is no wp-admin picker yet. Editors set the icon over REST or with `wp term meta update`.

**Rationale:** Class-keyed filters keep every template a core block that editors can still change. Reusing the topic icon set and sanitiser avoids a second list (ADR-034). The slug map means a type with no stored icon still shows one.

## ADR-038: Add Share Links and Table of Contents blocks

**Status:** Accepted

**Context:** The boards put share links under single events and news and a numbered table of contents on the legal pages. Core Social Links cannot share the current page, because their URLs are fixed. ADR-031 prepared the legal pages with anchored H2 sections. Core has no table-of-contents block.

**Options:**
- Core Social Links with fixed URLs.
- Dynamic plugin blocks, rendered on the server.
- Interactive blocks that need JavaScript.

**Decision:** Both are dynamic plugin blocks with no front-end JavaScript. Editor previews use ServerSideRender (`@wordpress/server-side-render`, a type-only plugin devDependency, installed through `@wordpress/editor`, as in ADR-034).
- `tekseries/share-links` renders one link per chosen service to that service's share page for the current post: LinkedIn share-offsite, Facebook sharer, X intent and WhatsApp `wa.me` with the title and link. An optional plain "Link to this page" is also available. Links open in a new tab. Icons are core's Social Icons artwork, from `block_core_social_link_get_icon()`. The default services are LinkedIn, Facebook and WhatsApp, as on the boards. Styles are default (lilac) and "Dark" (ink). It sits under the article on single events ("Share this event") and single news ("Share this story").
- `tekseries/toc` lists the H2 headings of the saved content that have an anchor, found with `WP_HTML_Tag_Processor`. They are numbered 01, 02 and so on inside a `<details open>`, so it works without JavaScript. It renders nothing when there are no anchored H2s. In the Legal page template (ADR-031) it sits in the aside above the questions card: sticky beside the article on desktop only, above the article on tablet and mobile. Privacy (12 sections) and Terms (8) already had anchored H2s.
- Deferred to the Interactivity API phase: copy-to-clipboard, the table of contents folded by default on phones (as on the board), and highlighting the section being read.

**Rationale:** Server rendering keeps both usable without JavaScript (ADR-005). Reading the saved HTML means the list always matches the page. Core's icon artwork avoids a second icon set and a CDN (ADR-008). Deferring the enhancements keeps this phase free of front-end scripts.

## ADR-039: Load WP Job Manager as a soft dependency, with plugin overrides and its own CSS left out

**Status:** Accepted

**Context:** ADR-012 put the WP Job Manager (WPJM) overrides in the plugin. The site's other parts (events, news, gallery) do not need jobs. WPJM's `frontend.css` fights the design, and its `job-listings.css` loaded on every page. wp-env needs the same WPJM release as live (ADR-002).

**Options:**
- Declare `Requires Plugins: wp-job-manager`, as is done for ACF (ADR-035).
- Treat WPJM as a soft dependency and guard every call.
- Keep WPJM's CSS and restyle on top of it.

**Decision:**
- wp-env installs WPJM 2.4.8 from the pinned wordpress.org zip. That is the version live runs, and the zip is byte-identical to the local site's copy.
- The plugin does not declare WPJM in `Requires Plugins`. Every WPJM call is guarded, so events and the rest work without it.
- Overrides live in `wp-content/plugins/tekseries-blocks/templates/wpjm/`. They load through `job_manager_locate_template` only for WPJM's own `job_manager` template path, so add-ons keep theirs. File names are checked with `validate_file()`.
- WPJM's `frontend.css` is left out on every screen the plugin styles: the single job, pages with the Job Listings block, the submission form and the dashboard. Its `job-listings.css` is dequeued. select2 loads only on the submission form. Its dashboard CSS stays for the statistics dialog (ADR-043).
- PHPCS exempts `templates/wpjm/` from the file-name and hook-prefix rules, because overrides must keep WPJM's names and fire its hooks.

**Rationale:** A soft dependency keeps the rest of the site independent of jobs. Dropping WPJM's CSS avoids fighting it and stops it loading on unrelated pages. Checking the template path and file name keeps the filter from touching other plugins' templates.

## ADR-040: Expose job data through two binding sources and class-keyed icon filters

**Status:** Accepted

**Context:** ADR-012 added a `tekseries/job-field` source because WPJM's `_`-prefixed meta is out of reach for `core/post-meta`. The templates need display-ready values, and the Job Series hero needs an open-jobs count.

**Options:**
- A custom dynamic block for job chips and the count.
- Binding sources that return display strings, with core blocks in the templates.

**Decision:**
- `tekseries/job-field` has the keys `company`, `location`, `posted` and `type`. Location reads "Lagos", "Lagos (Remote)", "Remote" or "Anywhere". Posted reads "Posted 3 days ago", or "Posted on <date>" in WPJM's date format. It applies the same read checks as core's post-meta source (publicly viewable or `read_post`, and the password check) plus WPJM's view capability. It returns null without WPJM.
- `tekseries/job-stats` has the key `open`. It returns the number of open jobs from WPJM's cached `get_job_listings()` query. The Job Series hero shows "{N} open jobs" in place of the design's "100's" figure (owner decision).
- Icon blocks with class `ts-job-type-icon` draw the job type's icon (an 8-type map, `work` as fallback). `ts-job-location-icon` draws a globe for remote jobs. Both work through a render filter, the class-hook pattern of ADR-037. The SVG swap is now a shared helper, `tekseries_blocks_swap_icon()`.

**Rationale:** Binding sources keep templates as core blocks that editors can change (ADR-005). Sharing the read checks with core's source avoids leaking private jobs. The shared swap helper keeps event and job icons on one code path.

## ADR-041: Build the single job page as a theme template over a plugin body override

**Status:** Accepted

**Context:** The single job board has a plum hero, a description card and a side card. The page must work without JavaScript, and WPJM's jQuery `job-application.js` is not allowed here (ADR-007). Imported job descriptions can contain H1s.

**Options:**
- The whole page in plugin overrides.
- Theme template and pattern for the hero and "More jobs", plugin override for the body.
- Keep WPJM's jQuery apply toggle.

**Decision:**
- The theme has `single-job_listing.html` and a pattern. The hero has breadcrumbs (Home / Job Series / title), the title, chips bound to type, location and posted (ADR-040), and a "work" watermark. Post content follows. "More jobs" is a Query Loop of three other jobs, leaving out filled jobs when WPJM hides them.
- A plugin breadcrumb filter supplies "Job Series" from WPJM's job listings page. It also does so on the submit and dashboard pages.
- The body is a plugin override of `content-single-job_listing.php` (with `-company`, `-meta` and `job-application*.php`). A description card holds "Apply for job" and "All jobs". Beside it sits a side card: a company tile, details rows with icons, the apply box and a third-party note. The tile shows the uploaded logo, or initials on one of four tones hashed from the company name with the boards' own hash.
- The side card comes first in the markup, so tablet and mobile get the boards' order with no CSS reordering. On desktop it is a sticky column.
- The apply box is a native `<details>`, and `job-application.js` is no longer loaded. WPJM's apply-click statistic is pointed at `.application_button`, the summary, because its script binds the first match.
- The second "Apply for job" under the description links straight to the application (URL in a new tab, or a mailto). A second toggle cannot open a `<details>` without JavaScript.
- H1 headings in job descriptions become H2s, since the page already has the job title as H1.
- The submission preview reuses the same body (owner default: one layout for single and preview).

**Rationale:** The theme owns the hero and layout, and the plugin owns WPJM-specific markup (ADR-005). Source order gives the mobile order without reordering. `<details>` keeps the apply box working without JavaScript and keeps jQuery off this screen (ADR-007). One layout for preview and single means the employer sees what visitors will see.

## ADR-042: Implement the Job Listings block as a plain GET form with server-rendered results

**Status:** Accepted

**Context:** ADR-012 chose a `tekseries/job-listings` block over `[jobs]`. This records how it was built. WPJM enables search statistics only on pages whose content contains `[jobs]`.

**Options:**
- Filters and pages as an AJAX app.
- A plain GET form with server-rendered results and real links.
- Re-implement WPJM's search statistics.

**Decision:**
- The block has `render.php`, a ServerSideRender editor preview and a `perPage` attribute (default 25).
- It reads `search_keywords`, `search_location`, `search_category`, `filter_job_type[]` (none ticked means all types), `remote_position` and `pg` from a GET form. Type chips are real checkboxes under styled labels. "Remote positions only" is a checkbox with `role="switch"`.
- It queries WPJM's `get_job_listings()`, newest first, and prints "N open jobs" or "N jobs match your search". Rows come from the `content-job_listing.php` override (`li.job_listing`, with its post class kept). Empty states offer "Clear filters".
- Pagination is `paginate_links()` with end size 1 and mid size 2 ("1 2 3 … 54 →") on every screen size. That is the mobile board's set. The desktop board shows more numbers.
- To get search statistics, the block calls WPJM's private `Stats_Script::enqueue_stats_script()` through a bound closure. That keeps WPJM's nonce, stat definitions and filters. The call is guarded with `method_exists`. The risk is that a WPJM update renaming the method silently drops search statistics. An e2e test checks that the impression stat is set up, so such an update would fail the test.
- Live filtering as you type is not part of this ADR (see Future work). ADR-012's Interactivity API enhancement is deferred to Phase 6.

**Rationale:** A GET form works without JavaScript, gives shareable URLs and needs no jQuery (ADR-007). Calling WPJM's own statistics code is less work and less drift than copying it. The e2e test turns the private-method risk into a visible failure.

## ADR-043: Restyle the submission flow and dashboard with static heroes and WPJM overrides

**Status:** Accepted

**Context:** The boards redesign the submit flow (form, preview, submitted) and the employer dashboard. The submit form needs jQuery for its editor and uploads (ADR-007). Site registration is off.

**Options:**
- Page heroes generated inside the overrides, or static theme patterns.
- Fully redesigned statistics dialog, or WPJM's own dialog.
- Delete or Duplicate as a pending job's main dashboard action.

**Decision:**
- The "Post a job" and "Job dashboard" heroes are static theme patterns above WPJM's shortcode in a wide group (owner default). Steps live inside the overrides.
- Overrides: `job-submit.php` (steps aside Job details, Preview and Submitted, with tips; the form in "Job details" and "Company details" cards; `<button>` Preview and Save draft with WPJM's names), `account-signin.php` (signed-in bar with initial and Sign out; signed-out sign-in card beside "How posting works"), `job-preview.php` (plum bar with Edit listing and Submit listing), `job-submitted.php` (done card), `job-dashboard.php` and `job-dashboard-login.php`.
- Field labels, placeholders and help come from a `submit_job_form_fields` filter. The job category is optional (owner default; imported jobs all sit in one category). Required fields get a star.
- Registration stays off, so the sign-in cards say "No account yet? Contact us to get an employer account" (owner default).
- The dashboard has search, Add job, rows with status pills, a main action, a native `<details>` menu with icons, an empty state and "Signed in as". A draft's main action is Continue Submission. Other jobs get Edit where offered. Delete is never the main button: Duplicate takes it, because with the site's settings a pending job cannot be edited and WPJM would otherwise put Delete there. Published jobs read "Published" instead of "Active", on this site only. WPJM's behaviour stays for Duplicate (opens the copy in the form) and Delete (confirm).
- `job-dashboard-login.php` is a plain sign-in card. No board exists for that state yet.
- The statistics dialog keeps WPJM's layout and copy, since the board's redesign would need its overlay templates rewritten. WPJM's dashboard CSS stays for it (ADR-039).
- The submit form works without JavaScript except reCAPTCHA. jQuery remains allowed there only (ADR-007).

**Rationale:** Static heroes keep editors in control of page copy and the overrides simple. Keeping Delete off the main button protects employers from a destructive default. Keeping WPJM's dialog saves a large rewrite for a secondary screen. The copy matches a site with no self-registration.

## ADR-044: Make media_album a public, non-queryable taxonomy that carries the gallery year

**Status:** Accepted

**Context:** ADR-015 decided the gallery reads a "private `media_album` taxonomy". The Media Library holds about 2,060 files, about 1,710 of them WPJM company-logo uploads, so the gallery must show only files an editor chose. The design filters by year, but the migrated photos' upload dates are wrong for that: photos from 2016 to 2019 were uploaded in 2023.

**Options:**
- Visibility: a fully private taxonomy (`public` false), or a public taxonomy that is not publicly queryable.
- Album and year as attachment post meta.
- Year: from each file's upload date, or as term meta on the album.

**Decision:**
- Taxonomy `media_album` on attachments, registered in the plugin. It is `public` but not `publicly_queryable`, with no rewrite rules, no query var, and hidden from navigation menus and the tag cloud, so it has no front-end archive. It counts terms with `_update_generic_term_count`.
- Each album carries integer term meta `tekseries_year`, exposed over REST. Editors set it in a "Year" field on the Add and Edit Album screens (Media, Albums).
- A file in several albums takes the latest year. A file whose albums have no year lists only under "All years".
- Existing photos were put into six albums with a one-off script. The plugin has no importer.

**Rationale:** WordPress shows a taxonomy field in a file's attachment details (Media Library grid) only for public taxonomies. With a private one, editors would have to open each file's full edit screen. Not being publicly queryable still gives no archive, and the taxonomy does not enter the SEO plugin's sitemap (checked on the development site). Core's default counter counts an attachment only through a published parent post, and gallery files are unattached, so counts would read 0. The year on the album is one field per album instead of one per file, and it matches how the old site grouped photos. An e2e test guards the Media Library field and the wp-admin Year field. This refines the "private" wording of ADR-015.

## ADR-045: Build the Media Gallery as a dynamic block that filters in PHP, with links for every state

**Status:** Superseded by ADR-050 (masonry layout only)

**Context:** ADR-015 chose a custom block, and ADR-030 shipped core Gallery blocks per album as an interim. The design has type (All / Photos / Videos) and year filters with counts, a masonry of tiles, "Showing N of M" with Load more, and a lightbox. Server HTML must be complete and usable without JavaScript.

**Options:**
- Keep core Galleries, which have no filters, counts or Load more.
- A dynamic block that filters in SQL with one count query per chip.
- A dynamic block that reads the whole hand-picked set once and filters in PHP.
- Layout: CSS columns, or a JavaScript masonry.
- URLs: `type` and `year`, or prefixed parameters.

**Decision:**
- Dynamic block `tekseries/media-gallery`. One query reads every image and video attachment that has a `media_album` term (ADR-044), cached for the request. Results sort by newest album year first, then newest upload first within a year.
- Filters are plain links with counts. URL parameters are `media_type` (`photo` or `video`), `media_year` and `media_shown`. Unknown values are ignored.
- "Load more" is a link that raises `media_shown` by the block's per-page setting (default 12, cumulative) and lands on the first newly shown tile. Filter links land on the gallery.
- A filter group renders only when it distinguishes something: both photos and videos exist, or there is more than one year.
- Tiles are links to the full file in a CSS-columns masonry (4, 3 and 2 columns), each sized from its file's stored dimensions. A tile's accessible name ("View photo: ..." or "Play video: ...") and hover caption is the attachment caption, falling back to alt text, then title.
- A `tekseries/media-stats` block-binding source gives templates the totals ("32 photos"). It is empty when there are none, so the chip hides.
- The Gallery page pattern uses the block, and the interim `.ts-gallery` styling for core Gallery is removed.
- Deferred: the lightbox, and filtering and loading without a page reload.

**Rationale:** `year` is a WordPress query variable. On a page URL it turns the request into a date archive and the page 404s. `type` is a reserved term. The set is small and curated, and every chip needs a count, so one query plus PHP filtering is simpler and cheaper than a count query per chip. CSS columns need no script, but reading and tab order run down each column, a known difference from the design's row order. On the migrated photos the captions are clean while the alt texts are file names. Links keep every state shareable and can be intercepted later for in-place navigation. This replaces the interim gallery of ADR-030.

## ADR-046: Build the Home motion blocks with CSS only

**Status:** Superseded by ADR-052 (Home's static patterns only); by ADR-053 ("the carousel ships no script" only)

**Context:** ADR-014 decided Home motion ships in two versions: static core blocks first, moving plugin blocks later (hero carousel, count-up stat, logo marquee). The design's count-up is CSS. Its marquee pauses only on hover, with no keyboard or touch control, which fails WCAG 2.2.2. Its slider dots have nothing to slide. Server HTML must work without JavaScript, and motion must respect `prefers-reduced-motion`.

**Options:**
- Wait and build all three with the Interactivity API.
- Render static markup now with inert controls and add behaviour later.
- Build them with CSS only, so they are complete now.

**Decision:** Three dynamic blocks that ship no script and move only under `prefers-reduced-motion: no-preference`.
- `tekseries/stat` (attributes `value`, `suffix`): the number is a CSS counter fed by a registered custom property (`@property`) that animates from 0. The drawn figure is hidden from assistive technology, and a screen-reader copy carries the plain "312+", which is also what shows without CSS.
- `tekseries/logo-marquee` (Image inner blocks): the server repeats the set so each half of the strip holds at least eight logos, and the strip slides by half its width. Repeats are `aria-hidden` and `inert` with empty alt text. The pause control is a checkbox drawn as a button, placed before the logos in the document, and hovering pauses too. Without motion, and in the editor, it is a still wrapping row.
- `tekseries/hero-carousel` (Cover inner blocks): a scroll-snap track that can be swiped. The server gives each slide an id and slide roles, the dots are links to those ids, and the current dot follows `:target`. One slide renders with no dots or carousel roles.
- Home keeps its static patterns until the site owner asks for the switch.

**Rationale:** CSS covers what the design shows, so nothing waits on a later phase and nothing breaks without JavaScript. A checkbox gives a real pause control with no script, where an inert button would be worse than none. Anchor dots plus native scrolling make a usable carousel without script. This delivers the blocks that ADR-014 deferred. Later, optional behaviour is listed in Future work.

## ADR-047: Give each behaving block one Interactivity API script module

**Status:** Accepted

**Context:** ADR-005 allows frontend behaviour only through the Interactivity API. Several blocks now need it: Share Links, Table of Contents, Media Gallery and Job Listings. Script modules have no translation loading. Core enqueues a view module on every render of a block that supports interactivity, and Share Links sits on every post and event, where most of its services have no behaviour.

**Options:**
- jQuery or hand-written DOM scripts.
- Bundle our own Preact and a store.
- One `view.ts` per block, with WordPress supplying the Interactivity API runtime.

**Decision:**
- A block that behaves has `src/<block>/view.ts`, declared as `viewScriptModule` in `block.json` with `supports.interactivity: true`. `@wordpress/interactivity` and `@wordpress/interactivity-router` are type-only devDependencies of the plugin workspace (ADR-034). Nothing is bundled.
- Behaviour hooks onto the markup `render.php` already prints, using `data-wp-*` attributes. The page without JavaScript is the same page, and every JavaScript-off test stayed unchanged (ADR-005).
- Translated strings reach a script through `wp_interactivity_state()` or `wp_interactivity_config()`.
- A block's script loads only on pages that contain the block. Share Links also dequeues its module in a `render_block_tekseries/share-links` filter (`includes/share-links.php`) unless a block offers "Link to this page".
- `specs/visitor-scripts.spec.ts` checks each kind of public page: no React, no jQuery (except the job submission form, ADR-007), and block scripts only with their block.
- Share Links behaviour: "Link to this page" copies the link with the Clipboard API, shows "Link copied" for 2.5 seconds and announces it in a status element. Once the script runs, its accessible name becomes "Copy the link to this page". A modified click, an insecure page or a refused copy keep the plain link.

**Rationale:** The Interactivity API ships no React to visitors and adds no second runtime. Hooking onto existing markup keeps the no-JavaScript page complete. Passing strings through state works around the missing translation loading. Dequeuing the unused module keeps the extra request off every post and event. The scripts spec turns the "no React, no jQuery" rule into a test. This delivers the copy-link item that ADR-038 deferred.

## ADR-048: Build the gallery lightbox as a native modal dialog that reads the tiles on the page

**Status:** Accepted

**Context:** ADR-045 deferred the lightbox. The boards show captions, a counter, Previous and Next, thumbnails and video. Focus handling, Escape and an inert page behind are easy to get wrong by hand.

**Options:**
- Core's image lightbox, which has no captions, counter, thumbnails or video.
- A hand-written focus trap over a positioned element.
- A REST call for the item data.
- A native `<dialog>` rendered by the block, reading the tiles.

**Decision:**
- `render.php` of `tekseries/media-gallery` prints a `<dialog>`, opened with `showModal()`. The browser provides the focus trap, Escape, the inert page and the return of focus to the tile.
- The lightbox steps through the tiles loaded under the current filter. When it opens, it reads each item (file, caption, picture, proportions) from the tile's own markup. There is no second data source and no request.
- Features: a counter, Previous and Next that wrap, thumbnails, arrow keys and a sideways swipe. Photos use the tile's `srcset`. Videos play in `<video controls>` and pause when the viewer moves on or closes. A polite live region reads "3 of 12: caption". The opening fade runs only without a reduced-motion preference. A modified click still opens the file.
- The phone layout has a bottom bar instead of side buttons and thumbnails, as on the boards. On tablets the side buttons get a dark backing so they stay visible over a photo. The boards do not show that backing.

**Rationale:** The browser already does the hard accessibility work for a modal dialog. Reading the tiles keeps one source of truth, so filters and Load more (ADR-049) need no extra wiring. Tiles stay real links, so the page works without JavaScript (ADR-047).

## ADR-049: Update lists in place through the Interactivity router, with the server building every list

**Status:** Accepted

**Context:** ADR-045 and ADR-042 left filtering, Load more and paging as full page loads and deferred in-place updates. Those views are real links and form addresses. WPJM's statistics script binds to the first `ul.job_listings` it finds and watches rows (ADR-042).

**Options:**
- Re-implement the filters in JavaScript over REST or embedded JSON.
- Use `@wordpress/interactivity-router` with `data-wp-router-region`, following the addresses the page already has.

**Decision:**
- A block, or part of it, is a `data-wp-router-region`. The script follows the same links and form addresses, and the router swaps in what the server rendered. The address still changes, so views can be shared and Back and Forward work. A failed fetch falls back to loading the page. The router's generic "Page loaded" announcement is turned off in both blocks.
- Media Gallery: the whole block is the region. Filter links and Load more are fetched without their `#media...` fragment, so the page does not jump, and get it back afterwards. Tiles are keyed. After Load more, focus goes to the first new tile. A visually hidden status element reads the server's summary ("Showing 4 of 6", "No videos from 2019 yet") after each update, taken from the server state of the page the router last showed.
- Job Listings: only the results section is the region. The search form stays outside it, because a region is redrawn from the server's HTML and would overwrite a field while someone types. Typing in Keywords or Location is followed after a 400 ms pause and replaces the history entry. Chips, the remote switch, the category and Enter add an entry. After an update the script sets checkboxes and the select from the address, and text fields only on Back and Forward and on "Clear filters". Empty fields, and a checkbox group with every box ticked, are left out of the address. A page change moves focus and the view to the results. The count line is a status element.
- WPJM statistics keep working. Job rows are keyed, so a row that arrives in place is a new element that the observer sees. `ul.job_listings` is always rendered, hidden when empty, because the script binds to the first list. The statistics script now loads even when the first view finds nothing.

**Rationale:** The server stays the only place that builds lists. Two implementations of the filters would drift, and a REST or JSON version would not keep WPJM's query, caching and statistics (ADR-012). Following existing addresses keeps every state shareable and the no-JavaScript page unchanged (ADR-047). Keeping the form outside the region protects what people type. This delivers the in-place behaviour that ADR-045 and ADR-042 deferred.

## ADR-050: Lay out the gallery masonry as a CSS grid of thin rows

**Status:** Accepted

**Context:** ADR-045 chose CSS columns for the masonry. Columns read and tab down each column and rebalance when items are added, so every tile moved on Load more. That became unacceptable once Load more updates in place (ADR-049). The rest of ADR-045 stands.

**Options:**
- Keep CSS columns.
- A script that measures and places tiles.
- `grid-template-rows: masonry`, which is not widely supported.
- A CSS grid with thin rows and tiles that span several rows.

**Decision:**
- A row is 1/40 of a column's width, using a container query unit on the block. `render.php` computes the number of rows from the file's width and height, adds two for the gap, and passes it as `--ts-media-rows`. Auto-placement in document order puts each tile in the shortest column, left to right, as the boards do. Appended tiles never move earlier ones. No script is involved.
- The tile fills its rows minus the gap and the picture covers it. Gaps are exact and the picture is cropped by a few pixels at most.
- Browsers without container units keep the CSS columns layout (`@supports (width: 1cqw)`).

**Rationale:** Document-order placement matches the boards' reading order and makes Load more additive. Spanning rows needs only CSS, so the block stays script-free for layout (ADR-005). A measuring script would add a second layout engine and a flash on load.

## ADR-051: Highlight the current section and fold the table of contents on phones

**Status:** Accepted

**Context:** ADR-038 deferred two Table of Contents behaviours: folding on phones, as on the board, and marking the section being read. Without a script the `<details>` must arrive open. Closing it from the script alone made the article jump up after first paint on every phone visit.

**Options:**
- Close the `<details>` from the script only.
- Render it closed, which leaves larger screens with an unusable default without JavaScript.
- Hold the list shut with CSS where scripts run, until the script closes the element.

**Decision:**
- The link of the section being read gets `aria-current`. That is the last heading to have reached the top 30% of the screen, found with an IntersectionObserver. A share of the screen height means the plugin does not depend on the theme's header height. A picked link is marked at once and keeps the mark for a second, because a section near the end of a page cannot reach the top.
- On phones (640px and narrower) the list starts folded. The `<details>` still arrives open. Where scripts run (`@media (scripting: enabled)`), CSS holds the list shut until the script has closed the element, so nothing moves. The hold is a 5-second animation, so the list opens by itself if the script never arrives.

**Rationale:** The CSS hold removes the layout shift and still fails open without JavaScript (ADR-005). A fixed header offset would tie the plugin to the theme (ADR-047). This delivers the behaviour deferred in ADR-038.

## ADR-052: Use the Stat and Logo Marquee blocks on Home

**Status:** Superseded by ADR-053 (the hero part only)

**Context:** ADR-046 built the Stat, Logo Marquee and Hero Carousel blocks and kept Home's static patterns until the owner asked for the switch. The site owner decided on 2026-10-10 to switch.

**Options:**
- Keep the static patterns.
- Switch the stat and logo sections and wait on the hero.
- Switch all three, including a two-slide hero.

**Decision:** `home-impact` uses `tekseries/stat` for 312+, 675+, 25+ and 100's. `home-partners` wraps its logos in `tekseries/logo-marquee`. Both are CSS-only, so Home still loads no script of ours. The hero stays one static Cover. The Hero Carousel waits for a second slide, so carousel controls (autoplay, Previous and Next, dots that follow swipes) were not built.

**Rationale:** The stat and marquee blocks are complete and need nothing more. A carousel with one slide has nothing to show. This changes only the "Home keeps its static patterns" part of ADR-046.

## ADR-053: Make the Home hero a two-slide carousel that can change slides by itself

**Status:** Accepted

**Context:** ADR-052 kept the Home hero a single Cover until a second slide existed. On 2026-10-10 the site owner decided that Home shows the carousel the design board draws: a hero with slider dots. The current live site's slider already rotates by itself. ADR-046 built the carousel with CSS only, with dots as `:target` links.

**Options:**
- Keep one static Cover.
- A carousel with dots only and no automatic change. This matches the board exactly.
- A carousel whose automatic change is an editor setting, with a pause control.

**Decision:**
- `patterns/home-hero.php` is a `tekseries/hero-carousel` block with two Cover slides and "Change slides automatically" on. Slide 2 is the live site's second slide: "One Youth Career At A Time" over the 2025 Jr. Rural Camp photo (`assets/images/home/hero-camp.jpg`). Only slide 1 holds the page's H1. Slide 2's headline is an H2 with the H1's size. Slide 2's chip, lead and buttons are a first draft from existing site copy, for the owner to edit.
- The carousel now has an Interactivity API script module (`view.ts`, ADR-047). This ends "ships no script" for the carousel in ADR-046. Stat and Logo Marquee are unchanged and stay CSS-only.
- Dots: the track's scroll position names the slide in view, and that slide's dot gets `aria-current`. The no-JavaScript `:target` styling applies only while no dot has `aria-current`. A dot click moves the track alone, so the page does not jump and the address gets no fragment.
- New attribute `autoplay`, an editor switch, off by default. Each slide waits 7 seconds. The wait restarts when the slide changes or the visitor pauses. A turn is skipped while the pointer is over the carousel, focus is inside it or the tab is hidden. The server renders a pause/play button hidden, and the script shows it. Under `prefers-reduced-motion: reduce` nothing starts and the button stays hidden.
- Corner radius is a block support of the carousel. The track clips the slides to it, so they move inside one rounded frame.
- Not built, on purpose: Previous and Next arrows, which the board does not show. Dot spacing stays at the design system's 44px tap target (ADR-005), though the board draws 8px gaps.
- Editors add a slide by duplicating a Cover inside the carousel and remove one by deleting it (`specs/home-motion.spec.ts`). Inserted from the theme pattern, the hero is treated as a pattern in WordPress 7.1, which asks for "Edit pattern" before structural changes. Page content that holds the blocks directly is edited freely.

**Rationale:** The board shows the dots, and the live slider already rotates. Motion that starts by itself needs a pause control (WCAG 2.2.2), the reasoning ADR-046 used for the marquee. An off-by-default setting leaves the choice with editors, and the Home pattern turns it on to match the live site. Everything is an enhancement of the server markup, so the page without JavaScript is unchanged (ADR-005). This reverses the hero part of ADR-052 and delivers the carousel items in Future work.

## Future work

- **Hosting and deploy:** not decided. The options are a git pull on the server or CI-built theme and plugin zips; no remote or CI exists yet. A release must ship only the theme and plugin, never the repository root (ADR-001).
- **PHP 8.3+:** ask the host to move to PHP 8.3 or newer before PHP 8.2 security support ends on 2026-12-31, then raise the floor in a new ADR (ADR-003).
- **Schibsted Grotesk glyph gap:** Igbo ị, ọ and ụ fall back to the system sans in headings (ADR-021). Find a font file that covers them, or accept the fallback.
- **Gallery captions and alt text:** write descriptive captions and alt text for the gallery photos. Nine share one caption, and the alt texts are file names (ADR-045).
- **Gallery Load more size:** it still adds 12 on every screen, where the boards show 10 on phones (ADR-045, ADR-049).
- **Gallery hero chips:** the totals on the Gallery page do not follow the year filter (ADR-045).
- **Gallery video on live:** done on the development site (album "2026 Empower Her Webinar", year 2026, with a poster as featured image). Repeat it on the live site (owner; ADR-045).
- **Album years:** the owner confirmed "2023-2024" under 2024. Confirm the Junior Camp album with the owner. It is filed under 2022 on the development site, because its captions, alt text and matching event say 2022, while only the file names say 2021 (ADR-044).
- **Bulk album action:** a bulk "add to album" action in the Media Library, if editors need it (ADR-044).
- **Motion behaviour:** an in-view start for the stat count, and Previous and Next arrows on the carousel, if wanted (ADR-046, ADR-053).
- **Lost emoji:** fix the emoji that became `????` in posts and events.
- **Past-event and registration-closed states:** replace the interim "This event has ended" note when the designer delivers (ADR-035).
- **Event type icon picker:** add one to wp-admin (ADR-037).
- **Event page on phones:** show the poster before the details and Register at the end of the article, as on the board. Today the poster follows the details card and Register sits in the card.
- **Time and venue for older events:** editors fill the new fields, since the old bodies hold them as text (ADR-035).
- **Statistics dialog redesign:** restyle WPJM's dialog to dashboard board 7, which needs its overlay templates rewritten (ADR-043).
- **Logged-out job dashboard:** replace the plain sign-in card when the designer delivers the state (ADR-043).
- **Job categories:** a curated list to replace the 76 imported terms (owner; ADR-043). The Job Series category filter lists only what the owner curates (ADR-049).
- **Pending jobs:** decide whether employers may edit them, a WPJM setting (owner; ADR-043).
- **"Upload your CV" links:** hidden until a target exists (ADR-043).
- **Employer self-registration:** only if the owner wants it (ADR-043).
- **Design-system updates:** add the components the boards use but the system lacks (Impact, Insight, Key figure, Pull quote, Pillar badge, anchor chip, marquee) and the missing tokens (`coral-text` from ADR-008, status colours, alpha and radius tokens). Settle the tablet and mobile h1/h2 sizes (the tokens win) and the footer radius (36 / 32 / 24px). Then refresh `docs/design-reference/`.

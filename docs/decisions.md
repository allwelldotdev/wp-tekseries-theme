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

**Status:** Superseded by ADR-070 (the ordering mechanism only)

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

**Status:** Superseded by ADR-052 (Home's static patterns only); by ADR-053 ("the carousel ships no script" only); by ADR-060 ("the Stat ships no script and counts on page load" only)

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

**Status:** Superseded by ADR-060 (one module that is no block's own only)

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

**Status:** Superseded by ADR-071 (where the dialog is printed only)

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

**Status:** Superseded by ADR-068 (the fixed 7-second stay, the unconditional hold under the pointer and the dot spacing only)

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

## ADR-054: Text over a photo carries a halo in the overlay's colour

**Status:** Accepted

**Context:** The design's photo overlay is a left-to-right gradient in the tone colour: 94% at the left edge, 72% at 45% and 15% at the right. An accessibility audit measured the real pixels behind text over photos, which axe cannot judge. With real site content, the month and year on listing cards with a featured image measured as low as 1.75:1. The Home hero's lead line measured 2.8:1 on phones, where text spans the whole photo. WCAG AA needs 4.5:1 for that text. A brighter photo would be worse.

**Options:**
- A stronger overlay.
- A solid or feathered box behind the text.
- Change the text colour alone.
- Keep the overlay and the photo as designed and give the text a soft halo.

**Decision:** Give the text a halo of six stacked `text-shadow`s (blur 3, 3, 6, 6, 12 and 12px, no offset) in the overlay's own colour. It applies to:
- The card month label, only when the card has a featured image, in the card tone's colour (`--ts-tone-bg`, `wp-content/themes/tekseries/assets/css/blocks/post-tone.css`).
- Headings, paragraphs without their own background (chips are left out) and outline buttons inside a Cover that uses the plum overlay gradient. This is the new `assets/css/blocks/cover.css`, loaded for `core/cover` through the per-block stylesheet list in `functions.php`.
- Each Hero Carousel dot also gets a 1.5px dark ring (ink at 72%), like the pause button's dark disc, so dots stay visible over a bright part of the photo.

After the change the card month measures at least 5.1:1 and the hero lead at least 5.7:1 on a pure white photo (plum, ink) or a pure black one (saffron, lilac).

**Rationale:** A stronger overlay fails on phones, where text spans the photo: the whole photo would need about 80% tone and all but disappear. A box leaves a visible band across the photo. A text colour change alone still fails where the overlay thins. The halo keeps the photo and the overlay as designed. It is a small, visible deviation from the boards. ADR-056 adds a regression test that measures it.

## ADR-055: Correct what the accessibility audit found

**Status:** Accepted

**Context:** The audit ran axe at WCAG 2.2 levels A and AA on 55 pages and states of the development site with real content (0 violations after the fixes below). It also included a keyboard walk of every page type at 1280px and 390px and a read of the accessibility tree. No real screen reader was used. Each item below failed a WCAG criterion or was announced wrongly.

**Options:**
- Fix each finding in the markup or CSS that caused it.
- Leave some findings as found, where the cause is outside our code or is content.

**Decision:**
1. `:focus-visible` shares the anchors' 96px `scroll-margin-top`, so keyboard focus is never left under the sticky header (WCAG 2.4.11 Focus Not Obscured). In `global.css`.
2. The eyebrow's coral text measured 3.95:1 on lilac. On lilac surfaces (`.is-style-card-lilac`, `.has-lilac-background-color` and the job sign-in panel's "How posting works") it is `color-mix(in srgb, coral-text 85%, ink)`, about 4.8:1, with no new palette colour. The boards use the lighter coral there, about 2.5:1.
3. The Stat block's suffix uses the `coral-text` colour. The light coral was 2.91:1 on the blush tile, and large text needs 3:1.
4. Fluent Forms: the submit button gets a focus ring (it only faded), and a topic chip is ringed as a whole when its radio has keyboard focus. In `fluentform.css`.
5. The "Read more" arrow is CSS content with empty alternative text (`content: "\2192" / ""`, the plain declaration first as the fallback), so it is no longer read as part of the link's name.
6. Images in a job description get `alt=""` when they have no alt attribute, through the `wpjm_the_job_description` filter in the plugin's `includes/wpjm.php`. 41 imported descriptions carried a source logo without one.
7. Two Groups carried an `aria-label` on a plain `div`, which ARIA does not allow. The previous and next post links are now a `nav` named "More posts". The Home figures group lost its label.
8. The Job Listings block prints a screen-reader-only `h2` "Job listings". It names the results region (`aria-labelledby`) and puts the job titles (`h3`) under a heading.

Left as found:
- Fluent Forms' own markup: `aria-label` on `label` elements, no group semantics for the topic radios, and the reCAPTCHA frame.
- The gallery video has no captions. That is content.
- The large card date and the meta date are both read.
- The event page's section labels are styled paragraphs, not headings.
- Text links, badges and table-of-contents links are smaller than the design system's 44px target (ADR-005) but meet WCAG 2.2's 24px-or-spacing rule.

**Rationale:** Each fix removes a failed criterion or a wrong announcement without changing the design, and uses existing tokens. The items left are in third-party markup, are content, or already meet the criterion. The halo for text over photos is ADR-054.

## ADR-056: Check accessibility automatically in the end-to-end suite

**Status:** Accepted

**Context:** The audit in ADR-055 was a one-off. Without a repeatable check, the fixes can regress silently. Axe cannot measure text over a photo (ADR-054).

**Options:**
- Inject axe-core by hand from a transitive dependency. This is fragile.
- Screenshot diffing. This is brittle.
- Lighthouse's accessibility score in CI. It gives a score, not a list of failures, and has no states.
- `@axe-core/playwright` in the existing end-to-end suite, plus a pixel measurement for text over photos.

**Decision:**
- `specs/a11y.spec.ts` uses `@axe-core/playwright` 4.13 (root devDependency). It builds one page of every public kind on the test site: front page, the Home and Contact page patterns, events archive, event type archive, event, news post, gallery, an empty gallery filter, legal page, job listings, a job search with no results, job, job dashboard, job submission, search results, an empty search and not found. It expects no axe violation against WCAG 2.2 A and AA at 1280px and 390px.
- It also scans states only a script or a click reaches: hero on its second slide and paused, header menu open at 834px and 390px, gallery viewer open, table of contents opened on a phone, apply box opened, and, signed in, the job submission form and the dashboard.
- Excluded as not ours, with a comment in the spec: WordPress's admin toolbar (`#wpadminbar`) and the TinyMCE editor's own buttons (`.mce-tinymce`).
- A Shift+Tab walk checks that focus is never under the sticky header.
- `specs/utils/contrast.ts` measures text over a photo. It captures the text's box twice, as drawn and with the letters' fill made transparent (a text shadow stays). It takes the differing pixels as the letters and returns the WCAG contrast ratio that all but the worst twentieth of those pixels, and one pixel around them, reach. The test puts a pure white photo under plum and ink cards and the hero, and a pure black one under saffron and lilac cards. It expects 4.5:1 for small text and 3:1 for the hero's large heading at 1280, 834 and 390px.
- The card-month test and the focus walk were checked to fail without their fix (card month 1.76:1; eight focus stops under the header) and to pass with it. The suite went from 94 to 119 tests.

**Rationale:** The check runs where the other browser tests run and fails with a list of violations. Worst-case photos make the contrast test independent of what editors upload. Limits: axe sees names, roles, structure and solid colours, not everything. The Contact form (Fluent Forms) exists only on the development site, so it is scanned there by hand and not in the suite.

## ADR-057: Preload the two text fonts and load later carousel photos at low priority

**Status:** Accepted

**Context:** Lighthouse 13.5 on the development site (simulated throttling, medians of three runs) already scored 95 to 99 on mobile and 100 on desktop for Home, Gallery, Job Series and an event page. The remaining loss on Home was a layout shift of 0.044 on phones: the headline reflowed when its font arrived.

**Options:**
- Preload the Latin font files and lower the priority of later carousel photos.
- `fetchpriority="high"` on the first two gallery tiles. Tried and dropped: Largest Contentful Paint went from 2.88 s to 3.03 s.
- Raise WordPress's inline-style limit to remove five small render-blocking stylesheets. Not done: bigger HTML on every page for an estimated 150 ms on throttled mobile.
- Convert uploads to WebP or AVIF. Not done: content and host work.

**Decision:** A `wp_preload_resources` filter in the theme preloads the Latin file of each family (Schibsted Grotesk and Onest). Other unicode ranges still load on demand. The Hero Carousel sets `fetchpriority="low"` on the photos of slides after the first. They still load at once, behind the first, rather than lazily, so they are there before their slide comes.

Mobile results, before to after:
- First Contentful Paint: Home 1.53 to 1.15 s, Gallery 1.38 to 1.11 s, Job Series 1.53 to 1.16 s, event 1.38 to 1.21 s.
- Home's Cumulative Layout Shift: 0.044 to 0.001.
- Largest Contentful Paint within 0.1 s: Home 2.58 to 2.65 s, Gallery 2.96 to 2.96 s back to back, Job Series 1.83 to 1.68 s, event 2.67 to 2.65 s.
- Total Blocking Time: 0 to about 60 ms.
- Scores after: Home 96, Gallery 95, Job Series 99, event 96 on mobile, and 100 on desktop. Accessibility, best practices and SEO are 100 on all four (Job Series' accessibility went 99 to 100 with the list heading of ADR-055).

**Rationale:** Preloading removes the font reflow, the one measurable loss, and brings First Contentful Paint down by 0.2 to 0.4 s. Low priority for later slides keeps their bandwidth from competing with the first photo without delaying them. What remains is the host's: server response time (the development site has no page cache, and the live site answers from one) and cache lifetimes for static files.

## ADR-058: Release 1.0.0 as two uploaded zips, with database content as a scripted bundle

**Status:** Superseded by ADR-059 (the apply step: the WP-CLI script and the WP-CLI tone backfill on the live site)

**Context:** On 2026-10-10 the site owner chose to deploy by uploading zips, not by pulling git on the server. The theme and the plugin are always released together. Much of the new site also lives in the development site's database: page content built from the patterns, gallery albums, topic icons and the contact form's fields. Zips do not carry it, and the development database must not replace the live one, because it is an old copy.

**Options:**
- A git pull on the server. The owner chose otherwise, and it needs a build step on the server.
- Copy the development database to live. It would overwrite newer live content and bring an old copy's damage.
- Paste ten pages by hand. It is slow, error-prone and has no dry run.
- Two zips plus a scripted bundle of the database content.

**Decision:**
- One version, 1.0.0, in the theme header, the plugin header and both package files, kept equal by a unit test.
- `npm run plugin-zip` (after `npm run build`) and the new `npm run theme-zip` produce the two files. The theme zip is `zip -FS` of the theme folder, which holds only files that ship: it is exactly the 91 tracked theme files. Both zips are git-ignored.
- The database content travels as a bundle exported from the development site: ten pages and posts with the development domain replaced, the icons, the albums, the gallery video's poster image and the contact form's fields.
- A WP-CLI script applies the bundle on the live site. It does a dry run by default, checks every item before touching it (same ID, type and address) and skips what is already done. Tones for existing posts come from the plugin's own `wp tekseries backfill-tones`.
- The export and apply scripts and the step-by-step runbook are kept outside the repository with the site's private working files.
- A release tag is made only after the owner approves. There is no CI, so the gate runs on a developer's machine.

Verified: both zips were installed through WordPress's own installer on a fresh WordPress 7.1.3 (with ACF 6.8.10 and WP Job Manager 2.4.8). Both activate at 1.0.0 with nothing of ours in the debug log. The apply script was rehearsed on the test site with a made-up bundle (12 changes on the first run, 0 on the second). It has never run against the live site or a copy of it. The live site's page, post and media IDs were compared with the development site's through its public REST API and match.

**Rationale:** Zips match the owner's choice and carry only what ships (ADR-001). A checked, dry-run-first script moves database content without overwriting live content, and a second run changes nothing. One equal version keeps the two packages from drifting.

## ADR-059: Apply the release bundle from wp-admin with a one-off migration plugin

**Status:** Accepted

**Context:** ADR-058 had a WP-CLI script apply the bundle on the live site, and the plugin's `wp tekseries backfill-tones` set the tones of existing posts. On 2026-10-11 the site owner said the live host has no SSH and no WP-CLI, because the account is not on a plan with SSH. Neither step can run there. The rest of ADR-058 stands: one version, two release zips, a bundle exported from the development site, no copy of the development database, and a tag only after the owner approves (`v1.0.0` was tagged on 2026-10-11).

**Options:**
- Apply the bundle by hand in wp-admin (paste ten pages, create seven albums, pick icons). It is slow, error-prone, has no dry run and cannot set the tones of existing posts in bulk.
- Put a migration screen inside TekSeries Blocks. The released plugin would carry one-off code and one site's content for good.
- Ask the host for SSH on a different plan. It costs money, needs an owner decision and is not needed.
- A one-off plugin, uploaded as a third zip.

**Decision:**
- The bundle is applied from wp-admin by "TekSeries Migration (one-off)": folder `tekseries-migration`, zip `tekseries-migration.zip`. The export script builds it from the development site. It holds the plugin's code plus the bundle, written for one site address.
- It adds one screen, Tools → TekSeries migration. Opening the screen is the dry run: it lists what would change and changes nothing. A button, behind a required "I took a backup" tick, applies the changes.
- It refuses the whole run when the site's address is not the one the bundle was written for, TekSeries Blocks is not active, the TekSeries theme is not installed, Advanced Custom Fields is older than 6.8.10, or a bundle file is missing or fails its SHA-1 checksum in the manifest.
- Every step looks first. Items already right are left alone, so a second run makes 0 changes. Items not found as expected (ID, type and address) are listed as skipped and left alone. Changes that do not go through are listed as failed.
- It stores each old page as a revision before replacing it. WordPress on its own keeps a revision of what it saves, not of what was there.
- Page content is saved byte for byte. WordPress's HTML filter for accounts without `unfiltered_html` is switched off during the save and restored after, and the stored content is compared with the bundle. Measured: that filter would alter 3 of the 10 pages (Home, Gallery, Terms), which gives broken blocks in the editor.
- When WordPress updates a page it re-checks the page's current template against the active theme, and fails the save with "Invalid page template." if that theme does not have it. That can happen on a second run while Divi is still active, on a page that already has its new template. The plugin skips that re-check during the save and sets the template itself. Measured without the skip: the run reported that page as failed although its content had been saved.
- Tones for existing events and news posts come from the plugin's own planner, `tekseries_blocks_plan_tones()`, the function the WP-CLI command uses. The migration saves its result. The WP-CLI command stays, for development sites.
- It also sets the site logo option. It switches the theme to TekSeries last, in the same request as the content, so visitors never see the new content under Divi or the Divi content under the new theme.
- Only administrators (`manage_options`) can open the screen or run it, and the apply request needs the screen's nonce.
- Deleting the plugin removes its files and the one option it stores, the report of its last run. Nothing it changed is undone.
- Like the export script and the runbook (ADR-058), the migration plugin is kept outside the repository with the site's private working files. Released TekSeries Blocks 1.0.0 and the theme are unchanged by it.

Verified in a rehearsal on 2026-10-11, run again from a fresh site on the final code: 46 checks, 0 failed (4 refusals + 16 browser checks + 16 database and uploads checks + 2 leftover checks + 8 edge cases). A throwaway WordPress was set up like the live site before the move: WordPress 7.1.3 on PHP 8.2, a copy of Divi 4.27.9 with its child theme active, Divi-built stand-in pages, ACF 6.8.10, WP Job Manager 2.4.8, Fluent Forms 6.2.15, Rank Math 1.0.279, and the live site's page, post and media IDs, addresses and dates (9 pages, 19 events, 20 posts, 35 media rows). The seeded pages carried a page template as saved pages do (Divi's blank page template on Contact, `default` on the rest). A browser did what the owner will do: uploaded the three zips, read the dry run, pressed the button and deleted the plugin.
- 4 of 4 refusals gave the right reason: plugin not active, theme not installed, a bundle file with one byte added, a bundle written for another site.
- 16 of 16 browser checks: the dry run listed 50 changes and nothing skipped. A request without the nonce got 403, and an editor got 403 on the screen and on the apply request. A request without the backup tick changed nothing. The run made 50 changes, 0 skipped, 0 failed, and a second look found nothing left. Ten public pages returned 200 with no Divi shortcode and no PHP message. The block editor reported no broken block on the eight pages. The plugin deactivated and deleted from the Plugins screen.
- 16 of 16 checks of the database and uploads folder: all ten pages and posts match the bundle and each keeps its old content as a revision; 16 icons; 7 albums with their years and 33 files; the poster uploaded with thumbnails; the duplicate video and its file gone and the other video's file kept; the contact form's title and fields; and all 39 events and posts got exactly the tone the same post has on the development site.
- 2 of 2 leftover checks: the deleted plugin left no folder and no option (1), and the debug log named none of our code (1).
- 8 of 8 edge cases: with the HTML filter on, Home still landed byte for byte. A save that something altered was reported as failed, the screen offered it again, and pressing again finished it. With Divi active again and Contact already on its new template, the page was saved all the same and the theme switched (2 checks).

Separate from the 46: on the development site, a bundle written for that site reports 0 to change, 0 skipped, 43 already done.

Not verified: the plugin has never run on the live site or on a copy of its database. Read-only facts about the live site, from its public REST API and home page: its address is `https://tekseries.com`, the Divi child theme is active, and the IDs compared in ADR-058 match.

**Rationale:** The host allows uploads in wp-admin and nothing else, and a plugin zip is that route. It keeps ADR-058's checked, dry-run-first, second-run-changes-nothing behaviour without WP-CLI. Keeping it as a third zip keeps one-off code and one site's content out of the released plugin and theme (ADR-001). The refusals, the backup tick, the nonce and the capability check stop it from running against the wrong site or by the wrong person. The byte-for-byte save and the single-request theme switch protect the pages and the visitors during the move.

## ADR-060: Animate Home in CSS, with one small script that only says when a block is in view

**Status:** Superseded by ADR-062 (how a focused block is kept shown while its entrance plays only)

**Context:** The design canvas pulled on 2026-10-11 animates the three Home boards with GSAP 3.15.0 (core only, no ScrollTrigger). Four animations:
- On load, the hero chip, headline, lead, buttons and pillar labels rise 28px and fade in over 0.8s, 0.12s apart, starting at 0.15s. The photo stays still.
- The impact counters count from 0 over 2s, 0.12s apart, when their grid is in view.
- Each of the three pillar cards rises 64px and fades in over 0.9s, then its contents follow (20px, 0.7s, 0.1s apart, after 0.2s).
- The four section headings rise 24px and fade in over 0.8s.

"In view" on the boards is a plain `IntersectionObserver` at 18% of the element. GSAP only moves, fades and counts. With reduced motion the boards animate nothing. No other board animates, and the design system has no motion tokens.

`gsap.min.js` is 72,927 bytes (28,268 gzipped), against 8,476 bytes for all five visitor script modules together (ADR-047). Its standard licence is free for commercial sites but proprietary, not GPL. Pure CSS cannot yet start a timed animation on scroll everywhere (MDN browser-compat-data, 2026-10-11). `animation-trigger` is in Chrome 146+ only. `animation-timeline: view()` is in Chrome 115+, Safari 26 and Firefox preview builds only, and it ties the animation to scroll position, so it does not play for a set time and runs backwards when scrolling up.

Before this, the impact figures counted on page load (ADR-046). Measured on the development site, they sit just below the first screen at 1440x900 and at 390x844, so the count had usually finished unseen.

**Options:**
- Ship GSAP.
- Pure-CSS `animation-trigger`. Chrome only today.
- Pure-CSS scroll-linked timelines. Wrong feel, no stable Firefox.
- Hide blocks with CSS under `@media (scripting: enabled)` before the script runs. A failed script would leave content hidden unless a timed fallback were added.
- CSS does every animation; one small script marks a block when it enters view.

**Decision:** The last option, chosen by the site owner.
- `theme.json` `settings.custom.motion` gains `ease.out` (cubic ease-out, GSAP's power2.out), `ease.out-strong` (quartic, power3.out), and `reveal.duration` 0.8s, `reveal.distance` 24px and `reveal.stagger` 0.12s. Single-use values stay beside the rule that uses them. A unit test checks that every motion token used in styles is defined.
- The last section of `assets/css/global.css` holds the look. A block with the class `ts-reveal` rises in the first time it is scrolled to. A marked Group comes from further down and its direct children follow in turn. Decorative icons stay put. The states are `is-reveal-pending` and `is-revealed`. Rules sit under `prefers-reduced-motion: no-preference` and are screen-only, so print is unaffected. `:focus-within` shows a waiting block at once.
- `src/reveal/view.ts` (684 bytes built) is an Interactivity API script module. It is not a block's, so it is a module entry in `webpack.config.js`. `includes/reveal.php` is a `render_block` filter: blocks with the class get `data-wp-init---reveal="tekseries/reveal::callbacks.watch"`, plus `data-wp-interactive` only when they have none. The module is enqueued only on pages with such a block.
- The script marks a block still below the screen as pending and watches it with one observer. Once 18% of it is on screen, or 18% of the screen for a block taller than that, it is marked revealed. Blocks arriving in the same observer batch get `--ts-reveal-place` 0, 1, 2, and so on, which CSS turns into 0.12s steps.
- The Stat block lists the same module by id and carries the directive. Below the screen at load it waits at 0 and counts (2s) when revealed. On screen at load it counts from load, as before.
- The hero animation is CSS only, in `hero-carousel/style.scss`, on whatever sits beside the first slide's H1.
- The Home patterns `home-about`, `home-impact`, `home-services` and `home-team` carry the class on the four section headings and the three pillar cards.
- The in-page link offsets stay at 96px, although the boards now use 100, 96 and 88px. GSAP is not installed and its file is not copied into the design reference.
- Deliberate differences from the boards:
  - A block already on screen when the script starts does not animate in. The boards hide such blocks after load and then animate them, which flashes.
  - Tall blocks are measured against the screen. The pillar cards are about 1,800px tall on phones and would sit blank for a third of the screen.
  - Counters start per figure as it comes into view, not all four with the grid.
- Known limit: a fast jump (a hero link to a pillar card) can pass blocks before the observer sees them. They play when the visitor scrolls back to them.
- Visitor scripts are now six modules, 9,160 bytes together. `specs/visitor-scripts.spec.ts` covers them, `specs/reveal.spec.ts` and `specs/home-motion.spec.ts` cover the behaviour and the Home marks.

Measured on the development site: the largest paint is the hero photo with and without motion (desktop medians 616 ms without and 572 ms with; phone 588 ms both; three loads each), so hiding the hero text briefly does not delay it.

**Rationale:** The boards' trigger is an `IntersectionObserver` and the library only tweens, which CSS does natively, so 72.9 KB of library buys nothing here. It also avoids a proprietary, non-GPL licence. Server HTML stays complete without JavaScript (ADR-005): nothing is hidden unless the script is running and the block is off screen. No script, a failed script or JavaScript off leave the page as it was, and counters count on load. With reduced motion the script marks nothing and the CSS is guarded too. This changes ADR-046, where the Stat ships no script and counts on page load. Without the script it still counts on load. The marquee is unchanged. It also changes ADR-047: one module is now no block's own, but nothing is bundled and it still loads only with the blocks that need it.

## ADR-061: Animate the compact menu's opening in CSS, and let it close instantly

**Status:** Superseded by ADR-062 (how a focused link is shown at once only)

**Context:** At 1100px and below, the header menu is core's Navigation overlay restyled into a panel under the header bar (ADR-018). Core keeps the toggle, focus trap, Escape and ARIA state. The close button sits over the menu button, 54 to 56px above the panel's top edge. The panel appeared with no motion, and the site owner asked for an animation at tablet and phone widths, built in CSS. The motion tokens from ADR-060 (`ease.out`, `ease.out-strong`) are reused. This is their first use outside Home, and the menu is on every page.

**Options:**
- Animate the opening in CSS and let the closing be instant.
- Also animate the closing by copying core's open-state layout rules onto the closed state, so an exit transition could hold the layout. Fragile against core updates, and discrete `display` transitions are not in every browser.
- Add a script for the closing. The request was for CSS, and the rest needs no script.
- Add a dimming layer behind the panel. It would change the look of the page, which was not asked for.

**Decision:** The first option. The last section of `assets/css/blocks/navigation.css` holds it, all under `prefers-reduced-motion: no-preference`. With reduced motion the menu behaves as before. There is no markup change, no script and no new token.
- The panel unrolls from under the header bar with a `clip-path` animation from `inset(-80px 0 100% 0)` to `inset(-80px 0 0 0)` over 0.45s.
- The links rise 12px one after another (0.4s each, 0.04s apart, from 0.06s), then the two buttons.
- The close cross turns into place from -90 degrees and 0.6 scale over 0.4s.
- While the menu is open, the menu button's bars are held turned 90 degrees and transparent under the cross (`:has(.is-menu-open)`). A transition on them makes them swing back when the menu closes. This is the only motion on closing.
- A link with `:focus-visible` drops its animation.
- `specs/header.spec.ts` covers it.

**Rationale:** The clip reaches 80px above the panel so it never cuts the close button. This is also why `overflow: hidden` is not used. Core moves focus to the first link when the menu opens, and a keyboard user must not see a focus ring on a link still fading in. Pointer users get the whole cascade. The panel does not animate out because core closes the menu by removing the class that also lays the panel out, so the contents collapse into a row at once (seen in the browser). The bars' swing gives the closing some motion without depending on that class. Core's overlay class names are still relied on, as in ADR-018.

## ADR-062: Show a focused block by overriding its animated properties, never by removing the animation

**Status:** Accepted

**Context:** ADR-060 and ADR-061 say a block that holds keyboard focus is shown at once. It was built as `animation: none` on `:focus-within` (the hero's first-slide text in the hero carousel block's stylesheet; a revealed `ts-reveal` block and a revealed Group's children in the theme's `assets/css/global.css`) and on `li:has(:focus-visible)` (the compact menu's links in `assets/css/blocks/navigation.css`). Found on 2026-10-12, in 1.1.0 and 1.1.1: when focus moved on, `animation-name` came back and the browser started a new animation. The block vanished and rose in again. In Chromium, after focus left, the hero item, the first menu link and a revealed card were each at opacity 0 with a running animation.

**Options:**
- Cut the animation short on focus by changing `animation-duration` or `animation-delay`. It depends on browsers updating a running animation, and after an early blur the animation resumes from where it was cut.
- Animate a registered custom property and override it normally. It runs off the compositor and needs `@property`.
- Replace the keyframes with `@starting-style` transitions. They cannot replay, but it rewrites three shipped mechanisms and has narrower browser support.
- Keep the animation and override the properties it animates while focus is inside.

**Decision:** The last option. The animation is never removed. While focus is inside, the rule sets `opacity: 1 !important; translate: none !important` (1.1.3).
- An important author declaration ranks above animation declarations in the cascade (CSS Cascade, cascade sorting order). The block shows at once, the animation runs out on its own clock, and nothing restarts when focus leaves. If focus leaves before the animation's natural end, the block joins the animation where it then is.
- In the reveal rule the override names only the animated children: `> :not([class*="is-style-deco"], .ts-reveal)`. Decorative icons have their own low opacity (0.06 to 0.1) and must not be forced to 1. Children marked `ts-reveal` have their own turn.
- This replaces how a block is kept shown while its entrance plays: in ADR-060, a revealed `ts-reveal` block, a revealed Group's animated children and the hero's first-slide text; in ADR-061, "A link with `:focus-visible` drops its animation". The rule for a waiting block in ADR-060 is unchanged: a block still marked `is-reveal-pending` that takes focus is shown with a plain `opacity: 1`, because nothing is animating yet. The rest of both stands.
- These are the only `!important` declarations on animated properties in the theme and plugin. Any future entrance animation uses the same pattern, never `animation: none` on a focus state.
- `specs/home-motion.spec.ts`, `specs/reveal.spec.ts` and `specs/header.spec.ts` move the focus on after the entrance has played and assert that no animation is running and the block is fully shown. Each failed before the fix.

Checked in Chromium 156 and Firefox 157: important beats the animation while focused, and nothing replays after. WebKit could not be run on the development machine (missing system library), so Safari is unverified here.

**Rationale:** The important override is the smallest change and is what the cascade specifies. It removes the cause of the replay, which was the animation coming back, instead of racing it. If an engine did not honour the override, a focused block would finish fading in under the focus ring, and it still would not replay.

## ADR-063: Offer the Home hero's on-load entrance as a class, `ts-intro`

**Status:** Accepted

**Context:** ADR-060 built two entrances. The hero carousel block raises the first slide's text when the page opens (CSS inside the block: `:has(> h1) > *`, 28px, 0.8s, 0.12s apart, from 0.15s). Any block with the class `ts-reveal` rises in when scrolled to (theme CSS plus a small script). The owner liked `ts-reveal` being a class and marked 38 Home blocks with it by hand. On 2026-10-12 the owner asked for the hero's on-load effect as a class too, so other pages' heroes can use it. Those heroes are a Group with the style `is-style-hero-plum` (decorative circles as pseudo-elements) holding a Group of text (breadcrumbs, H1, paragraph, buttons) and sometimes a card.

**Options:**
- Make `ts-reveal` also play for blocks on screen at load. ADR-060 leaves those alone on purpose, because hiding them after load flashes. It also needs the script, so the top of the page would depend on JavaScript.
- Move the hero carousel's rule onto the class and mark the Home slide. The block lives in the plugin and must work without a theme class (ADR-001), and Home's content is the owner's, in the database.
- A class for containers only. The owner marks single blocks with `ts-reveal`, and a class that did nothing on a single heading would confuse. Single marks also matter for speed (see the measurements below).
- One class that reads the block it is on.

**Decision:** The last option, in version 1.2.0. It is the last section of the theme's `assets/css/global.css`, under `screen and (prefers-reduced-motion: no-preference)`. CSS only: no script, no markup, no server code. It works with JavaScript off and prints whole.
- On a Group (`.wp-block-group.ts-intro`; Row, Stack and Grid are Groups), the direct children rise in one after another and the Group itself does not move, so a hero's background and circles stay still.
- On any other block, the block rises in itself. Marked siblings take turns with `:nth-child(n of .ts-intro)` (Chrome 111, Firefox 113, Safari 9). Where unsupported, the rule is dropped and they rise together.
- The values are the hero's: 28px, `reveal.duration` 0.8s, `ease.out-strong`, start 0.15s, `reveal.stagger` 0.12s apart. There are six places (`--ts-intro-place` 0 to 5); later blocks come with the sixth. No new token: 28px and 0.15s sit beside the rule, as in the hero carousel. The design system's own motion tokens are still to come.
- The outermost mark wins. A marked block inside a marked block is not animated on its own (`:not(.ts-intro *)`), so two animations never stack on one element. A marked Group inside a marked Group rises as one of the outer Group's blocks.
- Decorative icons (`[class*="is-style-deco"]`) are left out, as in the reveal rules.
- The place rules for a Group's children come after those for single marks, because both can match a marked block inside a marked Group and the Group's must win. A Group's first child gets place 0 explicitly, because custom properties inherit: a marked Group that is the second marked sibling carries place 1.
- The editor stays still. The selectors exclude `.block-editor-block-list__block`, because the theme stylesheet is also loaded as an editor style. Otherwise the entrance would play on every editor load and for every inserted or moved block.
- Keyboard focus follows ADR-062: the animated properties are overridden with important declarations while focus is inside, and the animation is never removed.
- The hero carousel keeps its built-in rule. The two share values but not code (`ts-carousel-rise` in the plugin, `ts-intro-rise` in the theme).
- No page carries the class yet. On a text-led hero, mark the pieces (heading, buttons, card) and leave the large paragraph unmarked.
- `specs/intro.spec.ts` has four tests:
  - A Group's blocks come in turn (0.15s to 0.75s) and all are shown once played.
  - Single marks take turns, a nested mark is left to the outer one, and a decorative icon stays still.
  - A block the keyboard reaches is shown at once with no replay.
  - Nothing moves under reduced motion, in print or in the editor, and no script is loaded.
  - The editor test and the focus test were each checked to fail when their rule is broken.

Measured cost (Chrome 156 on the development site, three loads each, medians). Chrome records a text block for Largest Contentful Paint only when its fade from opacity 0 has finished.
- Contact at 1440px: unmarked 0.40s; the hero's text Group marked 1.78s; only the H1 and the buttons marked 0.33s. At 390px: 0.32s, 1.55s and 0.32s. On both, the largest element is the hero's lead paragraph.
- Job Series at 1440 and 834px: about 0.4s unmarked, about 1.5s with the text Group marked. At 390px the largest element is outside the hero and the time did not change (about 0.28s).
- Home is not affected: its largest element is the hero photo.
- Starting the fade at a tiny non-zero opacity would hide the cost from the measure without changing what visitors see. That was not done.

Tried on the development site's Contact, Job Series and Privacy heroes at 1440, 834 and 390px by adding the class to the HTML on its way to the browser (no page was changed). The text rose in order, the background, circles and card stayed, and nothing was left hidden. Checked in Chromium 156 and Firefox 157. Safari is unverified, as in ADR-062.

**Rationale:** One class that adapts to the block it is on matches how the owner already marks `ts-reveal`, and covers both a whole hero and single pieces. Pure CSS keeps the top of the page independent of JavaScript (ADR-005) and avoids the flash ADR-060 avoided. Keeping the hero carousel's own rule leaves the plugin working without the theme (ADR-001). The outermost-mark rule and the place ordering prevent stacked animations and wrong delays. The measured cost is why the class is opt-in and the advice is to leave a large lead paragraph unmarked.

## ADR-064: Depart from the boards on page top spacing and hero and banner alignment

**Status:** Accepted

**Context:** The boards (`docs/design-reference/project`, for example `Events.dc.html`, `Contact.dc.html`, `EventPost.dc.html`, `NewsPostText.dc.html`) show three things the owner changed after reviewing the built site on 2026-10-11 and 2026-10-12. There are 48px between the sticky header and the first block. A hero's text is centred vertically against the card beside it on desktop. Post banners have a 480px minimum height with the text at the bottom. The owner asked for less space under the header, the hero text column at the top, and no 480px minimum. This is release 1.2.4 on branch `feat/hero-bands` (commit bf3eeb5), not merged yet. The six heroes with a card beside the text are Events, event types, News, Contact, Gallery and Job Series. The banners are the event and news post banners.

**Options:**
- Redefine the 32px spacing preset. It has 44 other uses in the theme's own files, and more in saved page content, which would all move.
- A negative margin, or a CSS override on `main`. Editors could not see or change it in the Site Editor, because the padding is a block attribute.
- Keep the banner minimum for events only. The owner asked for both.
- Change the block attributes in the templates and the pattern generator, and make the Post Tone block cope with short banners.

**Decision:** The last option, in 1.2.4. It supersedes no ADR in full. It refines ADR-025 (responsive layout with per-block styles) and ADR-033 (Post Tone block) on the points below.
- Top space: `main`'s top padding goes from the 32px spacing preset to the existing 4px preset in all 14 templates. WordPress's 16px block gap under the header part stays, so the visible gap goes from 48px to 20px. The 32px preset is not redefined.
- Heroes: the text column of the plum hero (`heroPlum()` in the pattern generator) is `verticalAlignment: top` instead of `center`. Six patterns were regenerated: `template-events`, `template-event-type`, `template-news`, `contact-hero`, `gallery-hero`, `job-series-hero`.
- Banners: in `template-single-event` and `template-single`, the `tekseries/post-tone` banner variant loses its `minHeight: 480px` (and the `0px` overrides for tablet and mobile) and the inner grid's `selfStretch: fill`. Its text column is `top` instead of `bottom`. A banner is as tall as its content.
- Plugin: the banner's topic icon is 340px on desktop and bleeds off the bottom-right corner, with the block clipping overflow. A short banner would cut its top off. `post-tone/style.scss` now sizes the icon at `min(icon size, 100% / 0.85)` of the band's height and moves it with `translate: 9% 15%` from `right: 0; bottom: 0`, so the 85% of it above the bottom edge never exceeds the band. Where the icon fits, size and offsets are unchanged (measured on listing cards and banners).
- Measured on the development site at 1440, 834 and 390px: the gap under the header is 20px on every page kind (was 48px). The first element of the hero text column sits at band top plus band padding on all six heroes. A news banner with a one-line title is 295px tall at 1440 (was 576px). An event banner with a four-line title is 568px (was 576px). In-page anchors still land 22px or more below the header, because scroll-margin is 96px and unchanged.
- Templates customised in the Site Editor keep their saved padding until reset. None is customised on the development site.

**Rationale:** The owner's review outranks the boards, and the boards' own values stay in `docs/design-reference/`. Changing block attributes keeps every change visible and editable in the Site Editor, and leaves the other uses of the 32px preset alone. Putting the change in the pattern generator means regenerated patterns keep it. The icon rule in the plugin is needed only because a banner can now be shorter than the icon, and it leaves the icon unchanged where it already fitted. These three points now differ from the boards on purpose. A later design pull that still shows 48px, centred text or a 480px minimum must not be read as a regression to fix.

## ADR-065: Let the Home Mission card end with its text, with a class `ts-fit`

**Status:** Accepted

**Context:** On the Home board (`docs/design-reference/project/Main.dc.html`) the plum Mission card in "Who We Are" is as tall as the column beside it (the photo and the "Get Involved" card). As built, it stretched to the grid row and left about 55px of empty plum under its last paragraph at 1440px. On 2026-10-11 and 2026-10-12 the owner asked for the card to hug its text on desktop. This is release 1.2.5 on branch `feat/mission-fit` (commit 38e8e51), not merged yet.

**Options:**
- The block's own vertical alignment control. In WordPress 7.1 a grid child has no per-item "align self" control in the editor. Only the stack's content alignment exists, and it does not stop the stretch.
- A rule aimed at that one card. A class any card can take is no more code, and editors can reuse or remove it under Advanced, Additional CSS class(es).
- A utility class in the theme.

**Decision:** The last option, in 1.2.5.
- `assets/css/blocks/group.css` gains `.ts-fit { align-self: start; }`.
- The `home-about` pattern sets the class on the Mission card, through the pattern generator, so regeneration keeps it.
- The development site's Home page got the class by a surgical edit of that block. The page carries the owner's own edits, so it is never regenerated.
- There is no media query. At 1100px and below the layout is one column and each card is alone in its row, so the class has no effect.
- Measured on the development site: at 1440px the card is 568px tall (was 624px). It ends 55px above the column beside it, with exactly its 44px padding under the last paragraph. At 834px and 390px its height is unchanged (450px and 714px).

**Rationale:** The class is the smallest change that works in 7.1 and stays visible and editable in the editor. It is an editor-facing convention alongside `ts-reveal` (ADR-060) and `ts-intro` (ADR-063). This is a deliberate difference from the board, like ADR-064: a later design pull that shows the stretched card is not a regression to fix. It refines the per-block layout approach of ADR-025.

## ADR-066: Show the horizontal logo from the Site Logo setting in the header, and a bundled stacked logo in the footer

**Status:** Accepted

**Context:** On 2026-10-11 and 2026-10-12 the owner asked for the horizontal TekSeries logo in the header and the stacked one in the footer. Both files are in the Media Library on the development site and on the live site with the same IDs (horizontal 283171, 244 by 60; stacked 283170, 218 by 150), checked on live through its public REST API. The stacked logo is blue and dark grey on a transparent ground, and the footer panel is plum. This is release 1.4.0 on branch `feat/logos` (commit 762b2c0), not merged yet.

**Options:**
- An SVG of the logo in the theme for both places. No vector source was supplied, and the owner's own files are the source of truth.
- A second Site Logo block in the footer. It would show the same horizontal file.
- A Media Library image in the footer. Patterns must look complete on a fresh install (ADR-023).
- Draw the footer plate with block background and padding attributes. The footer's other spacing is already in `global.css`, and the plate is part of the logo's look, not something to tune per page.

**Decision:**
- Header: it stays the core Site Logo block, so the picture is the site's own `site_logo` setting and an editor swaps it in the Site Editor. The block's `width` goes from 64 to 179 (the horizontal file at 44px tall). The theme CSS is unchanged and sizes the logo by height, 44 / 40 / 34px at desktop / tablet / phone, with `width: auto`, so any file keeps its proportions. On the development site `site_logo` changed from 283170 to 283171. The release bundle for live already carries that option (ADR-059).
- Footer: an Image block in the footer pattern, first in the brand column. It points at `assets/images/logo-stacked.png`, a copy of attachment 283170 shipped with the theme (ADR-023). It is 44px tall on a white rounded plate with 6px by 10px padding (56px in all), alt text "TekSeries". Theme CSS draws the plate and gives the picture its aspect ratio, so it has a width before the file loads.
- Measured on the development site: header logo 178.9 by 44 at 1440, 162.7 by 40 at 834, 138.3 by 34 at 390 and 360. Bar height is unchanged, with 146px left to the menu button at 360. The footer panel is 311px at 1440 (was 279), 553px at 834 (was 483) and 689px at 390 (was 619).

**Rationale:** The Site Logo block keeps the header logo editable without code, and sizing by height keeps any replacement file in proportion. A theme file lets the footer look complete on a fresh install, and the plate keeps a dark-grey-and-blue logo legible on plum. Consequences:
- The 244 by 60 horizontal file is slightly soft on high-density screens at 179 by 44. A larger or SVG copy can be swapped in the Site Editor with no code change. The owner has been told.
- The development site's header and footer are saved copies in the database (edited in the Site Editor on 2026-10-12), so they were patched there by hand as well as in the patterns. A site with saved copies of these parts does not pick up pattern changes by itself (ADR-017). The release bundle does not yet carry saved template parts.
- The footer is 32px taller on desktop.

## ADR-067: Draw icons on core Buttons with classes in theme CSS, set by an editor-only panel in the plugin

**Status:** Accepted

**Context:** The boards put a Material Symbols icon on many buttons. Core's Button block has no icon in WordPress 7.1, and the first build left the icons off. That difference from the design was never recorded. On 2026-10-11 and 2026-10-12 the owner asked for every missing design icon and for a way to pick one in the editor. This is release 1.6.0 on branch `feat/button-icons` (commit e8b20e1), not merged yet. The first rule of the mechanism landed in 1.3.0 (commit 8402f6c).

**Options:**
- Classes on the core Button, drawn by theme CSS, with an editor panel that sets the class.
- A `render_block` filter that injects an inline SVG. It runs PHP on every button render, its markup differs from the editor's, and the colour would still need CSS.
- A custom "icon button" block. Every existing Button would need converting, and block styles such as outline and glass would be rebuilt.
- Core's Icon block beside the text in a Row. It is not a link target and splits the button's hover and focus into two controls.
- An icon font. ADR-024 forbids it.

**Decision:** The first option, in 1.6.0.
- A core Button with the class `ts-icon-<name>` draws that icon before its text. With `ts-icon-after` as well, it draws it after. `ts-icon-small` draws it at 18px instead of 20px.
- Theme, `assets/css/blocks/buttons.css`: one generic rule (a `::before` or `::after` box with `mask: var(--ts-button-icon, <transparent gradient>)` and `background-color: currentcolor`), plus one rule per icon that sets `--ts-button-icon` to a data URI. A name with no rule draws nothing, never a solid square.
- A local script produces the data URIs from the plugin's SVG files in `assets/icons/`, so the artwork has one source.
- Plugin, editor only: `src/button-icon/index.tsx`, a webpack entry like the post sidebar's (ADR-034), loaded on `enqueue_block_editor_assets`. An `editor.BlockEdit` filter adds an "Icon" panel to `core/button` with a dropdown and an "Icon after the text" switch. It only rewrites `className`.
- The icon list is `tekseries_blocks_button_icons()` in `includes/editor.php` (15 names), passed to the script with their labels. A unit test checks that this list and the theme's per-icon rules name exactly the same icons.
- The same technique, without the panel, draws the contact form's topic chip icons (by the radio's value) and the "Send message" icon in `fluentform.css` (ADR-029). It also draws an upload icon on the job form's file button, as a background image, because `::file-selector-button` takes no pseudo-element.
- The job dashboard's row buttons get no icon, because no board draws one.

**Rationale:**
- No new attribute means the saved markup is exactly core's. A button stays valid with the plugin off, in patterns, and on a site that never had the plugin. Block validity is tested for every pattern and template.
- Nothing ships to visitors: no script, no render filter, no inline SVG per button. Rule 1, that React never ships to visitors, is untouched.
- Patterns carry icons as plain class names, which the pattern generator and the editor's "Additional CSS class(es)" field both handle.
- Cost, measured: with 15 icons `buttons.css` is 12.2 KB (3.75 KB gzipped), and WordPress no longer inlines it in the page head, as it did at 3.2 KB. It is now one more linked stylesheet on every page with a button. First contentful paint on a throttled connection (150 ms latency, 1.6 Mbps, median of five cold loads on the development site) was 1096 ms with it against 1076 ms without on Home, and 1304 ms against 1392 ms on Contact. That is no difference outside the noise. Each icon added to the list costs about 0.5 KB.
- Mask icons disappear in forced-colours mode, as the Register button's arrow already does. The buttons keep their text, so nothing is lost.
- The contact form's topic chips hide the radio dot, except under forced colours. There the dot stays, because the chip's fill is not drawn.
- This closes the unrecorded design difference. The icons now match the boards.

## ADR-068: Make the Hero Carousel's stay, pointer hold and dot spacing editor settings, and give a new slide whole

**Status:** Accepted

**Context:** ADR-053 fixed the stay at 7 seconds, always held the slides under the pointer, and kept every dot a 44px tap target although the board draws the dots 8px apart. Editors added a slide by duplicating one. On 2026-10-11 and 2026-10-12 the owner asked for the timing, the hover hold and the dot spacing to be settings, and for an "Add slide" control that gives a complete slide. This is release 1.7.0 on branch `feat/carousel-settings` (commit 4ff1b98), not merged yet.

**Options:**
- A free "seconds" number field with no limits. Under 3 seconds nobody can read a slide, and over 30 it no longer reads as a carousel.
- Refuse `close` dots when there are three or more slides, to enforce the tap target. The owner asked for the board's look, so the help text informs instead.
- Core's `defaultBlock` for the appender. In WordPress 7.1.3 a default block cannot carry inner blocks.
- Offer the slide only as a block variation or a pattern. The appender is where an editor looks, and a variation of `core/cover` would show up everywhere Covers can go.
- Attributes with settings controls, a custom appender and a slide template (chosen).

**Decision:** The last option, for the block `tekseries/hero-carousel`.
- Attributes: `interval` (integer seconds, default 7, clamped by the server to 3 to 30), `pauseOnHover` (boolean, default true) and `dotSpacing` (`touch`, the default, or `close`). The defaults reproduce 1.6.0 exactly, so no stored block changes behaviour.
- `render.php` puts `stay` and `hover` in the block's Interactivity context and adds the class `has-close-dots`. `view.ts` reads them: one timeout of `stay` seconds per slide, and the pointer over the carousel passes a turn only when `hover` is true. Focus inside the carousel, a hidden tab and `prefers-reduced-motion: reduce` hold or stop the slides whatever the settings.
- Close dots (`style.scss`): each dot link is only as wide as its dot (28px for the slide in view, 8px otherwise), 8px apart and still 44px tall. The controls sit 40px in from the corner (24px on phones) and 8px from the pause button. The focus ring goes outside the dot.
- "Add slide": `edit.tsx` renders its own appender, a button that inserts a slide built from a template (`slide.ts`) with `createBlocksFromInnerBlocksTemplate` and `insertBlocks`. The slide is a Cover with the plum overlay, a label, an H2 at the H1's size, a line, two "#" buttons and the Share / Create / Solve row. The block's `template` is the same slide.
- A bare Cover inserted from the block library is replaced by a whole slide in the same undo step (`__unstableMarkNextChangeAsNotPersistent`). Undo then removes the slide, and does not bring back a bare Cover to fill in again.
- Empty placeholders draw nothing on the site (`:empty`).
- ADR-060's entrance of the first slide is unchanged.

**Rationale:**
- It is the owner's request. The defaults keep the accessible behaviour, and the control's help text tells an editor who loosens it what it costs.
- WCAG 2.2 success criterion 2.5.8 (Target Size, Minimum, level AA) asks for 24 by 24 CSS pixels, or enough room that a 24px circle centred on a smaller target touches no other target.
  - With close dots and two slides the dots pass. The 8px dot's centre is 12px from its neighbour (4px plus the 8px gap). The 8px gap to the pause button was added for the same reason. The accessibility suite (ADR-056) measures this with axe on the close-dots hero with the second slide in view and the slides paused, the worst case because the 8px dot then sits beside the pause button, at 1280 and 390px. It does not scan that page with the first slide in view.
  - With three or more slides two 8px dots sit 16px apart centre to centre, and they fail it. The automated test would report such a page.
  - The default, `touch`, keeps 44px, which also meets the design system's own rule (ADR-005). The setting's help text says close dots are harder to tap and fall under the guideline's smallest target with three or more slides.
- Turning off the pointer hold does not affect WCAG 2.2.2 (Pause, Stop, Hide). The pause button stays.
- Consequences:
  - The slide template exists twice, in `slide.ts` (the editor) and in the pattern generator (the Home pattern), and the two must be kept alike by hand.
  - The template names theme presets (overlay gradient, font sizes, spacing), like the rest of the plugin's blocks (ADR-046).
  - `__unstableMarkNextChangeAsNotPersistent` is an unstable editor API. If it goes, the fallback is a visible extra undo step.

## ADR-069: Show a real Google map on Contact through a small server-rendered Map block that frames Google Maps embeds only

**Status:** Accepted

**Context:** The Contact board draws a stand-in for a map: a plum card with a street grid and a pin, with the address card over it. The old live site had a real Google Maps embed. The first build followed the board (ADR-029). On 2026-10-11 and 2026-10-12 the owner chose the real map, in the design's frame, as one of the optional features of this batch. This is release 1.9.0 on branch `feat/contact-map` (commit 7ff2f7c), not merged yet.

**Options:**
- Core's Embed block. It has no Google Maps provider.
- Core's Custom HTML block. It lets any markup in, is not something to hand to site editors, and the pattern would carry raw HTML.
- A static map image linking to Google Maps. There is no third-party request until the click, but it is not the real map the owner asked for, and Google's static images need an API key.
- OpenStreetMap or a JavaScript map library. Visitors would get a script and a different look from the live site's map.
- Keep the address card over the map, as on the board. It would cover Google's own controls and attribution, which must stay visible.
- A block of our own that frames Google Maps embeds only (chosen).

**Decision:** The last option, in 1.9.0.
- Block `tekseries/map` in the plugin (`src/map/`), with attributes `src` and `title`. It is dynamic: `save` returns nothing.
- `render.php` prints an `<iframe>` only when `src` matches `^https://www.google.com/maps/embed` followed by `?` or `/`. The iframe has `loading="lazy"`, a `title` (the editor's, else "Map"), `referrerpolicy="no-referrer-when-downgrade"` and `allowfullscreen`. Any other `src` prints nothing.
- The frame is 450px tall (the old site's height). The wrapper clips it to the block's corner radius, through a block support. There is no view script.
- Editor (`edit.tsx`, `embed.ts`): the editor pastes Google's whole `<iframe ...>` snippet or the address alone. The block extracts and keeps the address. It refuses anything that is not a Google Maps embed, shows a notice and leaves the map as it was. The canvas shows a still card, not the live frame, so wp-admin asks nothing of Google and the pattern and editor tests stay self-contained.
- Contact (`contact-message` pattern, through the pattern generator): the Map block with the large corner radius, using the embed address read from the live site's Contact page on 2026-10-11. The address and "Get directions" sit in their own card under it. The stand-in's CSS (`.ts-map` in the theme's `group.css`) is removed.
- The development site's Contact page was patched by hand, because the owner has edited it.

**Rationale:**
- A server-side allow-list of one host and one path means the block cannot frame anything else, whatever is saved in the attribute.
- Rule 3 holds: the frame is plain server HTML and works without JavaScript. Rule 1 holds: nothing of ours ships to visitors. ADR-047 holds: this block has no script.
- Tests stub Google. `specs/map.spec.ts` covers the frame, three refused addresses, no script, the editor's paste and refusal, and no request to Google from the editor. The accessibility suite's visitor contexts also stub it (ADR-056).
- Consequences:
  - Privacy: the Contact page now loads content from Google for visitors, which the stand-in did not. `loading="lazy"` leaves the timing to the browser. Measured on the development site, the map was requested on page load at 1440, 834 and 390px, because it sits within the browser's lazy-loading distance. The owner has been told the Privacy Policy may need a line about it. A click-to-load consent step was not asked for and is not built.
  - The height is fixed at 450px in the block's stylesheet. There is no height control.
- This is a deliberate difference from the board (a real map instead of the drawn one), at the owner's request, like ADR-064 to ADR-066. A later design pull that shows the drawn map is not a regression to fix.

## ADR-070: Let visitors switch event and job lists between newest and oldest first with `?order=asc`

**Status:** Accepted

**Context:**
- The boards draw a static "Newest first" label above the Events lists and the Job Series list. On 2026-10-11 the owner asked for the sort to work. This is release 1.11.0 on branch `feat/list-order` (commit cc4bcb4).
- ADR-036 sorted on a meta query that was an OR of `event_date` EXISTS (named, used for ordering) and NOT EXISTS. For an event without a date, the join used for ordering holds the event's other meta rows. The database ordered it by whichever row it picked (its tone, for one), so it could be listed above every dated event. This was seen on the test site (wp-env), where three test events without a date led the Events page. Every event on the live site has a date.

**Options:**
- A private parameter name, such as `list_order`, instead of WordPress's public `order` query variable.
- A select or a pair of links for the two orders.
- Sorting in the browser.
- For the Events page grid, keeping the offset and flipping the order. That would leave out the oldest event, not the newest.

**Decision:**
- The address carries the order. `?order=asc` is oldest first; anything else is newest first. `order` is WordPress's own public query variable, so the main query of the event type archives follows it with no extra code. `tekseries_blocks_list_order()` in `includes/list-order.php` reads it for everything else. On the development site, Rank Math's canonical link for `/events/?order=asc`, `/event_type/webinar/?order=asc` and `/jobs/?order=asc` is the address without the parameter, and nothing redirects. A private parameter is not needed.
- The switch on event pages is a core Button with the class `ts-sort`, bound on `text` and `url` to a new Block Bindings source, `tekseries/list-order`. Key `label` is the order on show. Key `url` is the same list from its first page in the other order. It is a plain link, so it works without JavaScript. A `render_block_core/button` filter adds an `aria-label` that starts with the visible text and says what the link does ("Newest first. Show oldest first").
- The theme draws `ts-sort` as plain text with the `swap_vert` icon at the design's sizes (15, 14 and 13px) and a 44px touch target. `swap_vert` joins the Button icon list of ADR-067, which now has 16 icons.
- Events page: the Latest card stays the newest event in either order. The grid is the Query Loop with an offset (ADR-026). When the address asks for oldest first, the grid is turned round and leaves the newest events out with `post__not_in`, looked up with the same query arguments, instead of the offset. "The rest" is then the same set in both orders and the page count is exact. Only event loops with an offset follow the address; the Latest card and "More events" do not.
- Event order mechanism, replacing ADR-036's meta query: `tekseries_blocks_event_order_args()` now only marks the query (`tekseries_event_order`). A `posts_clauses` filter joins `event_date` under its own alias and orders by "has no date" first, then the date, then the publish date. Undated events (no row or an empty value) come after the dated ones in either order. ADR-036's two filters (`query_loop_block_query_vars` and `pre_get_posts`) and its rule that only loops left on the default date orderby change stand.
- Event type chips keep the chosen order: the existing `ts-type-chip` filter (ADR-037) adds the parameter.
- Job Listings block: the label became a link inside the router region, with `actions.order`. A hidden `order` field at the end of the search form carries the order through a search, and the script keeps it in step with the address. Page links and "Clear filters" keep the order. The arrow icon turns for "Oldest first".
- Departures from the design: on the Job Series phone board the label is hidden, and the switch is shown on phones because it now does something. The Job Series label is drawn at weight 600 (the board's static text is regular) to match the Events switch.

**Rationale:**
- A link with the state in the address works without JavaScript, can be shared and bookmarked, and needs no script on the event pages.
- Core's own query variable means the inherited archive query needs no code. The canonical link keeps search engines on one address per list.
- Block Bindings on a core Button keeps the templates core blocks (ADR-005, and the rule to try bindings before a dynamic block).
- `post__not_in` keeps the Latest card and the grid from showing the same event and makes the oldest-first page count exact.
- A join of its own makes the order deterministic for undated events.
- Consequences:
  - `?order=asc` on any page reaches WordPress's main query too. On singular pages that changes nothing visible.
  - A Button with the class `ts-sort` that is not bound to the source would get a misleading `aria-label`. The class is for the bound switch only.
  - The switch's wording and addresses come from the plugin. Without the plugin, the pattern's fallback link `?order=asc` still orders the type archives through core.

## ADR-071: Share the Gallery's viewer with links elsewhere, marked by the class `ts-lightbox-open`

**Status:** Accepted

**Context:**
- The viewer (a modal `<dialog>`, ADR-048) was part of the Media Gallery block's render output and could only show the Gallery's tiles.
- On 2026-10-11 and 2026-10-12 the owner asked for two things that need it elsewhere: the event poster in the design's frame with a "View full size" link, and a "See video" pill on the Home page's Case Study card that opens a video. This is release 1.12.0 on branch `feat/viewer-anywhere` (commit 9604b8b).

**Options:**
- A second, separate lightbox for single files.
- Core's "Expand on click" for Image blocks. It shows photos only, no video, and it is a different viewer from the Gallery's.
- A new block for each opener.
- A class on core blocks, with one shared dialog.

**Decision:** The last option.
- A block with the class `ts-lightbox-open` is an opener. A `render_block` filter in `includes/lightbox.php` looks at its first link. When the link leads to a photo or a video file, the link gets `data-wp-interactive`, a `data-wp-context` describing the file (address, kind, size, caption, a photo's `srcset`, a video's poster) and `data-wp-on--click="actions.openOne"`. The Gallery block's view module and stylesheet are enqueued. The attachment is looked up by address, and an unknown file is judged by its extension. Any other link (a page, `#`) stays an ordinary link. Without JavaScript the link opens the file.
- A Featured Image block with the class has no link to its file, so the filter puts one around the picture, to the full-size file, with an `aria-label` built from the alt text.
- The dialog moved to `includes/lightbox.php` and is printed once per page. The Gallery block prints it inside its router region (ADR-049) when the page has one. Otherwise it is printed in `wp_footer`, run through `wp_interactivity_process_directives`, when an opener asked for it.
- The viewer has a single-item mode. `state.isSingle` puts `is-single` on the dialog, which hides the counter, Previous and Next, the thumbnails and the phone's step bar and gives the media their room. A Gallery with one tile gets it too.
- Event poster: a Group `ts-poster` (card style, flow layout) holds the Featured Image and a caption row with "Event poster" and "View full size". "View full size" is a core Button drawn as plain text (`ts-poster-link`), with the `open_in_full` icon of ADR-067, which now has 17 icons. Its URL is bound to a new Block Bindings source, `tekseries/featured-image` (key `url`). A `render_block_core/group` filter leaves the frame out when the post has no featured image.
- "See video": a Group `ts-photo-pill` holds the photo and a Buttons block positioned over the photo's bottom-left corner, so the card keeps its height. The pattern's link is `#`, because a theme pattern has no video of its own. A site's page links it to a video file.
- The event sidebar stack is now `flexWrap: nowrap`. A vertical stack in WordPress is a wrapping column flexbox unless told otherwise. A wrapping column measures each item at its own content width before stretching it, so a poster file narrower than the column got a box shorter than the square picture, and the picture spilled over what followed. Measured on the test site with a 218px-wide file in a 379px column: the box was 218px tall and the picture 379px.

**Rationale:**
- One dialog and one script: the Gallery's viewer already handles photos, videos, focus, Escape and reduced motion, and is tested for accessibility.
- A class on core blocks keeps templates and patterns core blocks an editor can change (ADR-005), and lets an editor make any link to a media file an opener. It follows the class-keyed filters of ADR-037.
- Printing the dialog in the footer only when asked keeps it off pages that have no opener.
- Block Bindings give the Button its address without a custom block.
- Consequences:
  - A page with an opener loads the Gallery block's whole stylesheet (about 13 KB before compression) and its view module, though only the viewer's part is used.
  - The attachment lookup by address (`attachment_url_to_postid`) is one database query per opener per page view.
  - Other vertical stacks in the patterns still wrap (the generator's default). None holds a picture sized this way today. A stack that gets one needs `flexWrap: nowrap` too.

## ADR-072: Give news posts a video through ACF fields and a Post Video block, and play YouTube and Vimeo links in the viewer from an address the server builds

**Status:** Accepted

**Context:**
- On 2026-10-12 the site owner asked for news posts to carry a video: a switch, then an uploaded file or a YouTube or Vimeo link, plus a thumbnail, opening in the Gallery's viewer. This is release 1.13.0 on branch `feat/post-video` (commit 2b366b0).
- ADR-071 made the viewer available outside the Gallery, for photo and video files only.

**Options:**
- Core's Video and Embed blocks in the post's content. They load the provider's player with the page and sit in the text, not in a card of the design's. Nothing new to build.
- WordPress oEmbed (`wp_oembed_get`). The server fetches markup from the provider and prints what the provider returns.
- Post meta registered by the plugin with a custom sidebar panel, as for tone and icon (ADR-032), instead of ACF fields.
- ACF fields with a dynamic block (chosen).

**Decision:** The last option.
- Fields: an ACF group "Video" on posts, registered in code like the event fields (ADR-010, ADR-035). `tekseries_video` is a switch. `tekseries_video_file` is a video file and stores the attachment ID. `tekseries_video_link` is a URL. `tekseries_video_thumbnail` is an image ID. The last three show once the switch is on. The group is exposed over REST.
- Block: `tekseries/post-video`, dynamic, with no settings, placed after the post content in the single post pattern. It prints nothing unless the switch is on and the post has a video file or a YouTube or Vimeo link. A file wins over a link. The card is 16:9, with the Gallery's play disc and a "Watch the video" label on ink. Its picture is the thumbnail, else the file's poster (the attachment's featured image), else a plain plum card. The card is a link, to the file or to the video's own page, so it works without JavaScript.
- Embedded player: `tekseries_blocks_video_embed()` accepts only YouTube (watch, youtu.be, shorts, live, embed) and Vimeo links, including the private hash of an unlisted video. It builds the player's address itself from the video's ID: `https://www.youtube-nocookie.com/embed/<id>?autoplay=1&rel=0` or `https://player.vimeo.com/video/<id>?autoplay=1&dnt=1`. Nothing else from the link is used, and any other link gives no card.
- Viewer: an item can carry an `embed` address. The dialog has a `data-wp-each` template over `state.players`, which holds the one player only while the viewer is open on such an item. The `<iframe>` therefore exists only then. Closing the viewer removes the frame, which stops the video, and no history entry is added (changing a frame's `src` back to blank would add one). The frame has a title (the caption, or "Video player") and `allow` for autoplay, encrypted media, picture in picture and fullscreen.
- `includes/lightbox.php` gained `tekseries_blocks_lightbox_request()` and `tekseries_blocks_lightbox_directives()`, which the opener filter and the Post Video block share.

**Rationale:**
- Building the address from the ID alone means no markup or address from another site reaches the page, and the two hosts framed are fixed in code. This is the approach of ADR-069 for Google Maps.
- A frame that exists only while the viewer is open keeps third-party requests behind a visitor's own click, which page-level embeds would not.
- ACF is already required for the event fields (ADR-010). It gives editors a file picker, a URL field and conditional fields with no editor code to write and test.
- A block in the template, not in each post's content, shows the card in the same place on every post and needs nothing from the editor beyond the fields.
- Consequences:
  - When a visitor opens a linked video, their browser contacts YouTube (its no-cookie domain) or Vimeo. The Privacy Policy may need a line, as for the Contact map (ADR-069).
  - `autoplay=1` is sent because the visitor has just asked for the video. A browser may still hold playback until they press play.
  - A post with a video loads the Gallery block's stylesheet and view module (ADR-071's consequence applies).
  - The fields need ACF. Without it the block prints nothing.
  - Tests stub YouTube and Vimeo. Real playback from the two services is not exercised by the test suite.
  - The development site has dummy content for it: news post 284259 with the Media Library video 284253. It does not travel to live, because the migration leaves posts alone.

## Future work

- **Safari focus check:** confirm on WebKit that a focused animated block is shown at once and does not replay (ADR-062, ADR-063).
- **Intro motion tokens:** when the design system delivers its motion tokens, move the 28px distance and 0.15s start of `ts-intro` (and the hero carousel) onto them (ADR-063).

- **Saved header and footer on live:** the release bundle does not carry saved template parts, so the 1.4.0 logos reach a live site with saved copies only if the owner applies them (owner; ADR-066, ADR-059).
- **Hosting and deploy:** the release method is decided (ADR-058, ADR-059). Still open on the host: a page cache and longer cache lifetimes for static files on the development site's host, and the first real run of the migration plugin on the live site (owner; ADR-059).
- **Accessibility leftovers:** captions for the gallery video (content), and a hand scan of the Contact form after each change to it, as the suite cannot reach it (ADR-055, ADR-056).
- **Image formats:** convert uploads to WebP or AVIF (content and host work; ADR-057).
- **PHP 8.3+:** ask the host to move to PHP 8.3 or newer before PHP 8.2 security support ends on 2026-12-31, then raise the floor in a new ADR (ADR-003).
- **Schibsted Grotesk glyph gap:** Igbo ị, ọ and ụ fall back to the system sans in headings (ADR-021). Find a font file that covers them, or accept the fallback.
- **Gallery captions and alt text:** write descriptive captions and alt text for the gallery photos. Nine share one caption, and the alt texts are file names (ADR-045).
- **Gallery Load more size:** it still adds 12 on every screen, where the boards show 10 on phones (ADR-045, ADR-049).
- **Gallery hero chips:** the totals on the Gallery page do not follow the year filter (ADR-045).
- **Gallery video on live:** done on the development site (album "2026 Empower Her Webinar", year 2026, with a poster as featured image). Repeat it on the live site (owner; ADR-045). The release bundle carries the poster and the album (ADR-058).
- **Album years:** the owner confirmed "2023-2024" under 2024. Confirm the Junior Camp album with the owner. It is filed under 2022 on the development site, because its captions, alt text and matching event say 2022, while only the file names say 2021 (ADR-044).
- **Bulk album action:** a bulk "add to album" action in the Media Library, if editors need it (ADR-044).
- **Motion behaviour:** Previous and Next arrows on the carousel, if wanted (ADR-053). The in-view start for the stat count is delivered by ADR-060.
- **Reveal after a fast jump:** blocks passed by a quick jump play only when the visitor scrolls back to them. Add a catch-up if that proves a problem (ADR-060).
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

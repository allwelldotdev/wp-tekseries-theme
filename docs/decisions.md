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

**Context:** ADR-011 gives every event and news post a tone and a topic icon, and ADR-010 had listed both in the ACF group. Only the plugin's block, the publish hook and the editor sidebar read them. wp-env has no ACF (ADR-002), so ACF-backed meta would fail in the e2e tests.

**Options:**
- Tone and icon as ACF fields with an `acf/field` binding.
- Plain post meta registered by the plugin with `register_post_meta`.
- Icon default: a stored value set on publish, or a default computed at render.

**Decision:**
- `tekseries_tone` (saffron, plum, ink, lilac) and `tekseries_icon` (one of 30 curated icons from the `tekseries` collection, ADR-024) are post meta registered on `event` and `post`, with an enum schema in REST (empty means "not chosen"), a sanitize callback and `edit_post` auth.
- They are not ACF fields. The ACF "Events" group still moves into code, unchanged, with the Block Bindings work in Phase 5.
- With no icon picked, a post shows a default computed at render and never stored: the event type's icon (webinar `videocam`, workshop `co_present`, makers-prize `emoji_events`), `newspaper` for news, otherwise `event`. A read-only REST field, `tekseries_default_icon`, exposes it to the editor.
- A post that moves to `publish` with no tone gets the next tone in the cycle saffron, plum, ink, lilac after the newest published post of its type that has one, or plum if none. Events and news cycle separately.
- A tone picked before publishing is kept, and editors can override it in the sidebar (ADR-034).
- `wp tekseries backfill-tones` tones published posts oldest first, so the newest lands on plum, as in the design boards. It skips posts that have a tone unless `--force` is given.

**Rationale:** The tone is stored, so filters and paging never recolour a post (ADR-011). Plain registered meta needs no binding source and works without ACF. The cost is that two event-related fields sit outside the ACF group. A computed default keeps untouched posts in step with their event type.

## ADR-033: Render tone through a `tekseries/post-tone` block, with the block owning its look and the theme owning what is inside

**Status:** Accepted

**Context:** Listing cards and post banners take the post's tone as background, text colour and a large icon. Core blocks cannot bind a class or background to post meta (ADR-011). The blocks inside also change with the tone.

**Options:**
- A `render_block` filter that injects a tone class.
- A wrapper block that outputs the tone class, with CSS split by ownership.
- Keep the Cover block with a fixed plum overlay.

**Decision:**
- `tekseries/post-tone` is a dynamic wrapper block that holds inner blocks, and its `variant` attribute is `card` or `banner`. It outputs a `ts-tone--{tone}` class and the topic icon, `aria-hidden`, bleeding off the bottom-right corner. It ships no script and declares `supports.interactivity.clientNavigation`, so enhanced pagination stays on.
- The block's stylesheet maps the theme's `custom.tone.{tone}.*` tokens to `--ts-tone-*` properties and draws the surface. The theme's `post-tone.css`, loaded only where the block is, styles the core blocks inside it. The rule is that the block's own look lives in the plugin, and the look of the core blocks inside it lives in the theme (ADR-005).
- `theme.json` `custom.tone` gained `banner-accent`, `sub`, `button-bg`, `button-text` and `line` per tone. Lilac uses an ink accent on cards and a plum accent on banners.
- Listing card media and single banners use this block instead of a Cover with a fixed plum overlay. The inner-page hero (`hero-plum`) is unchanged.

**Rationale:** A wrapper block works inside Query Loop and leaves the contents as editable core blocks. Tokens stay in `theme.json` (ADR-009). Splitting by ownership keeps the block reusable under another theme, while the theme controls how its own blocks look. This delivers the per-post tone that ADR-026 left as an interim plum.

## ADR-034: Build editor-only TypeScript with type-only WordPress packages and a webpack entry for the sidebar

**Status:** Accepted

**Context:** `edit.tsx` files and the post sidebar need types for the `@wordpress/*` editor packages, which WordPress provides as runtime externals. WordPress 7.1 ships React 18.3.1, and `@wordpress/block-editor` ships no types. The "Tone and icon" sidebar panel is not a block, so `wp-scripts` does not build it.

**Options:**
- Types: no type checking for editor code; or `@wordpress/*` as devDependencies used only for types.
- Block editor types: `@types/wordpress__block-editor`, or a small local declaration.
- Sidebar build: a second build tool, or an extra entry added to the default `wp-scripts` webpack config.
- Icon list: duplicated in TypeScript, or passed from PHP.

**Decision:**
- The `@wordpress/*` editor packages are plugin devDependencies on the `@wordpress/scripts` 36.1 release line, used only for types. The root `package.json` pins `@types/react` to 18.3.31 to match React 18.3.1.
- A local declaration file covers only the `@wordpress/block-editor` exports the plugin uses, because `@types/wordpress__block-editor` pins older `@wordpress` packages.
- The plugin's `webpack.config.js` adds `post-settings/index` as an extra entry to the default config, and the plugin enqueues it in the block editor.
- The icon list reaches the panel from PHP as inline data, so `tekseries_blocks_topic_icons()` stays the one source (ADR-032).
- The panel uses only stable components, because `ToggleGroupControl` is still experimental.

**Rationale:** Type-only packages give editor code real checks without shipping a second copy of WordPress's libraries (ADR-005). The local declaration avoids a version clash, and one extra entry avoids a second build. One icon list stops PHP validation and the picker drifting apart. Stable components avoid breakage when experimental APIs change.

## ADR-035: Register the ACF Events group in code and bind event fields to core blocks

**Status:** Accepted

**Context:** ADR-010 chose to keep event fields in ACF, register them in code and spike whether a Button `url` binding accepts `cta_link`. ADR-032 moved tone and icon out of that group. The group lives in the database, and wp-env had no ACF, so the e2e tests could not exercise the bindings. Events run in West Africa Time (WAT) and the site time zone is UTC. Every event is already past, and the design has no past-event state.

**Options:**
- Keep the database-stored group and bind to it.
- Register the group in code under new keys, with a migration.
- Register the group in code under the existing group and field keys.
- A custom `tekseries/event` binding source, if core bindings fall short.

**Decision:**
- The plugin registers the "Events" group in code under the same group key (`group_643e98e5780ba`) and field keys as the stored group, so existing values keep loading. The stored group can be deleted once the code group is live. Every field has `show_in_rest` and `allow_in_bindings`, because ACF's binding source returns an empty string without `allow_in_bindings`.
- Two optional text fields are new: `time_label`, free text such as "11:00 AM WAT", and `venue`.
- The plugin header declares `Requires Plugins: advanced-custom-fields`, and wp-env installs the exact release 6.8.10.
- Templates bind core blocks. Date blocks take `datetime` from `event_date`, paragraphs take `time_label`, `venue` and `cta_link`, and the Register Button takes `url` from `cta_link` and `text` from `cta_name`, and opens in a new tab. `cta_link` returns a URL string, so the `tekseries/event` source was not needed.
- An `acf/blocks/binding_value` filter gives a bound Date block an ISO 8601 date at midnight in the site time zone, so `<time datetime>` stays valid and the day cannot shift on a site west of UTC. It also drops the scheme from a link field bound to text.
- Blocks with class `ts-register` are filtered at render. Once the event date has passed in the site time zone, the Register button becomes a "This event has ended" note and the Join here row is removed. The note is interim, because the designer was asked for a past-event state.
- A Register button with no link, and rows with an empty bound value, are hidden.

**Rationale:** The same keys keep every stored value with no migration, and the fields come under version control, as ADR-010 intended. The ACF dependency that ADR-010 accepted now also holds in wp-env, so the bindings are testable on a fresh install. A free-text time label avoids storing a time zone for events that all run in WAT. Core bindings keep the templates as editable core blocks (ADR-005).

## ADR-036: Sort events by event date

**Status:** Superseded by ADR-070 (the ordering mechanism only)

**Context:** Events listed by publish date, which is not when they happen. Core runs `query_loop_block_query_vars` only for non-inherited Query Loops, and the event and event type archives use an inherited loop (ADR-026). Some events have no date.

**Options:**
- Order by `meta_value` with a single meta key, which drops undated events.
- Custom orderby in each template.
- Two filters: one for non-inherited loops, one for the main query.

**Decision:** Two filters set the order. `query_loop_block_query_vars` covers the non-inherited loops (the Latest card, the paginated grid and More events), and `pre_get_posts` covers the main query of the event and type archives.
- Both use a meta query that is an OR of `event_date` EXISTS and NOT EXISTS, so undated events stay in the list, last. Publish date breaks ties.
- Only loops left on the default "date" orderby change, and their direction is kept.
- The Latest card with the offset-1 grid (ADR-026) still pairs correctly because both queries share the order. The tone cycle stays on publish order (ADR-032).

**Rationale:** Sorting by event date puts upcoming and recent events first, as a visitor expects. The OR clause keeps undated events visible. Touching only the default orderby leaves an editor's explicit choice alone. Tones are assigned at publish, so the cycle must not follow event date.

## ADR-037: Add event type icons through filters on core blocks

**Status:** Accepted

**Context:** The event type badge and the type filter chips had no icon (ADR-033). The post topic icon already follows the event type by default (ADR-032). Templates should stay core blocks (ADR-005).

**Options:**
- A custom block for the badge and for the chips.
- Filters on core blocks, keyed on classes.

**Decision:**
- The plugin registers `tekseries_icon` term meta on `event_type`, editable over REST, with the same curated set and sanitiser as the topic icon. An unset term falls back to the slug map (Webinar `videocam`, Workshop `co_present`, Makers' Prize `emoji_events`), the single source of defaults. An event's default topic icon follows its first type's icon.
- `render_block_core/post-terms` adds the icon to each term link of a "badge" Post Terms block.
- `render_block_core/navigation-link` adds it to links with class `ts-type-chip`. "All events" gets `apps`, added to the icon collection (ADR-024).
- `render_block_core/icon` swaps the drawing of an Icon block with class `ts-event-type-icon` (the details card).
- There is no wp-admin picker yet. Editors set the icon over REST or with `wp term meta update`.

**Rationale:** Class-keyed filters keep every template a core block that editors can still change. Reusing the topic icon set and sanitiser avoids a second list (ADR-034). The slug map means a type with no stored icon still shows one.

## ADR-038: Add Share Links and Table of Contents blocks

**Status:** Accepted

**Context:** The boards put share links under single events and news and a numbered table of contents on the legal pages (ADR-031). Core Social Links cannot share the current page, because their URLs are fixed. Core has no table-of-contents block.

**Options:**
- Core Social Links with fixed URLs.
- Dynamic plugin blocks, rendered on the server.
- Interactive blocks that need JavaScript.

**Decision:** Both are dynamic plugin blocks with no front-end JavaScript. Editor previews use ServerSideRender (a type-only plugin devDependency, as in ADR-034).
- `tekseries/share-links` renders one new-tab link per chosen service (LinkedIn, Facebook, X or WhatsApp) to that service's share page for the current post, plus an optional plain "Link to this page". It uses core's Social Icons artwork, defaults to LinkedIn, Facebook and WhatsApp, and has default (lilac) and "Dark" (ink) styles. It sits under single events as "Share this event" and under single news as "Share this story".
- `tekseries/toc` lists the anchored H2 headings of the saved content, numbered 01, 02 and so on, inside a `<details open>`. It renders nothing when there are none. In the Legal page template (ADR-031) it sits in the aside above the questions card, sticky on desktop only and above the article on tablet and mobile.
- Copy-to-clipboard, folding the table of contents on phones and highlighting the section being read are deferred to the Interactivity API phase.

**Rationale:** Server rendering keeps both usable without JavaScript (ADR-005). Reading the saved HTML keeps the list in step with the page. Core's icon artwork avoids a second icon set and a CDN (ADR-008). Deferring the enhancements keeps this phase free of front-end scripts.

## ADR-039: Load WP Job Manager as a soft dependency, with plugin overrides and its own CSS left out

**Status:** Accepted

**Context:** ADR-012 put the WP Job Manager (WPJM) overrides in the plugin. Events, news and the gallery do not need jobs. WPJM's `frontend.css` fights the design, and its `job-listings.css` loaded on every page. wp-env needs the same WPJM release as live (ADR-002).

**Options:**
- Declare `Requires Plugins: wp-job-manager`, as is done for ACF (ADR-035).
- Treat WPJM as a soft dependency and guard every call.
- Keep WPJM's CSS and restyle on top of it.

**Decision:**
- wp-env installs WPJM 2.4.8, the version live runs.
- The plugin does not declare WPJM in `Requires Plugins`. Every WPJM call is guarded, so events and the rest work without it.
- Overrides live in `templates/wpjm/` in the plugin. They load through `job_manager_locate_template` only for WPJM's own `job_manager` template path, so add-ons keep theirs. File names are checked with `validate_file()`.
- WPJM's `frontend.css` is left out on every screen the plugin styles: the single job, pages with the Job Listings block, the submission form and the dashboard. Its `job-listings.css` is dequeued, and select2 loads only on the submission form. Its dashboard CSS stays for the statistics dialog (ADR-043).
- The coding-standards check exempts `templates/wpjm/` from the file-name and hook-prefix rules, because the overrides must keep WPJM's names and hooks.

**Rationale:** A soft dependency keeps the rest of the site independent of jobs. Dropping WPJM's CSS avoids a fight with it and stops it loading on unrelated pages. Checking the template path and file name keeps the filter away from other plugins' templates.

## ADR-040: Expose job data through two binding sources and class-keyed icon filters

**Status:** Accepted

**Context:** ADR-012 added a `tekseries/job-field` source because WPJM's `_`-prefixed meta is out of reach for `core/post-meta`. The templates need display-ready values, and the Job Series hero needs an open-jobs count.

**Options:**
- A custom dynamic block for job chips and the count.
- Binding sources that return display strings, with core blocks in the templates.

**Decision:**
- `tekseries/job-field` has the keys `company`, `location`, `posted` and `type`. `location` and `posted` return display text, such as "Lagos (Remote)" and "Posted 3 days ago". The source applies core's post-meta read checks plus WPJM's view capability, and returns null without WPJM.
- `tekseries/job-stats` has the key `open`, the number of open jobs from WPJM's cached `get_job_listings()` query. The Job Series hero shows "{N} open jobs" in place of the design's "100's" figure (owner decision).
- Icon blocks with class `ts-job-type-icon` draw the job type's icon (an 8-type map, `work` as fallback), and `ts-job-location-icon` draws a globe for remote jobs. Both use the render filter of ADR-037 through a shared helper, `tekseries_blocks_swap_icon()`.

**Rationale:** Binding sources keep templates as core blocks that editors can change (ADR-005). Sharing core's read checks avoids leaking private jobs. The shared helper keeps event and job icons on one code path.

## ADR-041: Build the single job page as a theme template over a plugin body override

**Status:** Accepted

**Context:** The single job board has a plum hero, a description card and a side card. The page must work without JavaScript, and WPJM's jQuery `job-application.js` is not allowed here (ADR-007). Imported job descriptions can contain H1s.

**Options:**
- The whole page in plugin overrides.
- Theme template and pattern for the hero and "More jobs", plugin override for the body.
- Keep WPJM's jQuery apply toggle.

**Decision:**
- The theme has `single-job_listing.html` and a pattern for the hero and for "More jobs". The hero's chips are bound to type, location and posted (ADR-040). "More jobs" is a Query Loop of three other jobs, which leaves out filled jobs when WPJM hides them. A plugin breadcrumb filter supplies "Job Series" from WPJM's job listings page, here and on the submit and dashboard pages.
- The body is a plugin override of `content-single-job_listing.php` and its related templates. A description card sits beside a side card with a company tile, details rows, the apply box and a third-party note.
- The side card comes first in the markup, so tablet and mobile get the boards' order without CSS reordering. On desktop the side card is a sticky column.
- The apply box is a native `<details>`, and `job-application.js` is no longer loaded. WPJM's apply-click statistic is pointed at the summary.
- The second "Apply for job" under the description links straight to the application, since a second toggle cannot open a `<details>` without JavaScript.
- H1 headings in job descriptions become H2s, since the page already has the job title as H1.
- The submission preview reuses the same body (owner default).

**Rationale:** The theme owns the hero and layout, and the plugin owns WPJM-specific markup (ADR-005). `<details>` keeps the apply box working without JavaScript and keeps jQuery off this screen (ADR-007). One layout means the employer previews what visitors will see.

## ADR-042: Implement the Job Listings block as a plain GET form with server-rendered results

**Status:** Accepted

**Context:** ADR-012 chose a `tekseries/job-listings` block over `[jobs]`. WPJM enables search statistics only on pages whose content contains `[jobs]`.

**Options:**
- Filters and pages as an AJAX app.
- A plain GET form with server-rendered results and real links.
- Re-implement WPJM's search statistics.

**Decision:**
- The block is server-rendered, with a ServerSideRender editor preview and a `perPage` attribute (default 25).
- It reads `search_keywords`, `search_location`, `search_category`, `filter_job_type[]` (none ticked means all types), `remote_position` and `pg` from a GET form. Type chips are real checkboxes, and "Remote positions only" is a checkbox with `role="switch"`.
- It queries WPJM's `get_job_listings()`, newest first, and prints "N open jobs" or "N jobs match your search". Empty states offer "Clear filters".
- Pagination is `paginate_links()` with end size 1 and mid size 2 on every screen size, which is the mobile board's set. The desktop board shows more numbers.
- For search statistics, the block calls WPJM's private `Stats_Script::enqueue_stats_script()` through a bound closure guarded by `method_exists`. A WPJM update that renames the method would silently drop the statistics, and an e2e test checks that the impression stat is set up so that such an update fails.
- Live filtering as you type is not part of this ADR (see Future work). ADR-012's Interactivity API enhancement is deferred to Phase 6.

**Rationale:** A GET form works without JavaScript, gives shareable URLs and needs no jQuery (ADR-007). Calling WPJM's own statistics code keeps its nonce, stat definitions and filters, and is less work and less drift than copying it.

## ADR-043: Restyle the submission flow and dashboard with static heroes and WPJM overrides

**Status:** Accepted

**Context:** The boards redesign the submit flow (form, preview, submitted) and the employer dashboard. The submit form needs jQuery for its editor and uploads (ADR-007). Site registration is off.

**Options:**
- Page heroes generated inside the overrides, or static theme patterns.
- Fully redesigned statistics dialog, or WPJM's own dialog.
- Delete or Duplicate as a pending job's main dashboard action.

**Decision:**
- The "Post a job" and "Job dashboard" heroes are static theme patterns above WPJM's shortcode in a wide group (owner default). Steps live inside the overrides.
- Overrides cover the submit form, the sign-in cards, the preview, the submitted card, the dashboard and the dashboard login. The login is a plain sign-in card, since no board exists for it.
- Field labels, placeholders and help come from a `submit_job_form_fields` filter, and required fields get a star. The job category is optional (owner default; imported jobs all sit in one category).
- Registration stays off, so the sign-in cards say "No account yet? Contact us to get an employer account" (owner default).
- A draft's main dashboard action is Continue Submission, and other jobs get Edit where WPJM offers it. WPJM's own behaviour stays for Duplicate and Delete. Delete is never the main button: Duplicate takes it, because a pending job cannot be edited with the site's settings and WPJM would put Delete there. Published jobs read "Published" instead of "Active", on this site only.
- The statistics dialog keeps WPJM's layout and copy, since the board's redesign would need its overlay templates rewritten. WPJM's dashboard CSS stays for it (ADR-039).
- The submit form works without JavaScript except reCAPTCHA. jQuery remains allowed there only (ADR-007).

**Rationale:** Static heroes keep editors in control of page copy and the overrides simple. Keeping Delete off the main button protects employers from a destructive default. The copy matches a site with no self-registration. Keeping WPJM's dialog saves a large rewrite of a secondary screen.

## ADR-044: Make media_album a public, non-queryable taxonomy that carries the gallery year

**Status:** Accepted

**Context:** ADR-015 decided the gallery reads a "private `media_album` taxonomy". Most Media Library files are WPJM company-logo uploads, so the gallery must show only files an editor chose. The design filters by year, but the migrated photos' upload dates are wrong for that: photos from 2016 to 2019 were uploaded in 2023.

**Options:**
- Visibility: a fully private taxonomy (`public` false), or a public taxonomy that is not publicly queryable.
- Album and year as attachment post meta.
- Year: from each file's upload date, or as term meta on the album.

**Decision:**
- The plugin registers the taxonomy `media_album` on attachments. It is `public` but not `publicly_queryable`. It has no rewrite rules or query var and is hidden from navigation menus and the tag cloud, so it has no front-end archive. It counts terms with `_update_generic_term_count`.
- Each album carries integer term meta `tekseries_year`, exposed over REST and set in a "Year" field on the Add and Edit Album screens.
- A file in several albums takes the latest year. A file whose albums have no year lists only under "All years".
- Existing photos were put into six albums with a one-off script. The plugin has no importer.

**Rationale:** WordPress shows a taxonomy field in a file's attachment details only for public taxonomies, so a private one would force editors into each file's full edit screen. Not being publicly queryable still gives no archive, and it keeps the taxonomy out of the SEO plugin's sitemap. Core's default counter counts an attachment only through a published parent post, and gallery files are unattached, so counts would read 0. A year on each album needs one field per album instead of one per file, and it matches how the old site grouped photos. This refines the "private" wording of ADR-015.

## ADR-045: Build the Media Gallery as a dynamic block that filters in PHP, with links for every state

**Status:** Superseded by ADR-050 (masonry layout only)

**Context:** ADR-015 chose a custom block, and ADR-030 shipped core Gallery blocks as an interim. The design has type and year filters with counts, a masonry of tiles, Load more and a lightbox. Server HTML must work without JavaScript.

**Options:**
- Keep core Galleries, which have no filters, counts or Load more.
- A dynamic block that filters in SQL with one count query per chip.
- A dynamic block that reads the whole hand-picked set once and filters in PHP.
- Layout: CSS columns, or a JavaScript masonry.
- URLs: `type` and `year`, or prefixed parameters.

**Decision:**
- The gallery is a dynamic block, `tekseries/media-gallery`. One query, cached for the request, reads every image and video attachment with a `media_album` term (ADR-044), sorted by newest album year and then by newest upload.
- Filters are plain links with counts, using the URL parameters `media_type`, `media_year` and `media_shown`. A filter group shows only when it distinguishes something.
- "Load more" is a link that raises `media_shown` by the block's per-page setting (default 12).
- Tiles link to the full file in a CSS-columns masonry (4, 3 and 2 columns). A tile's accessible name and hover caption come from the attachment caption, then the alt text, then the title.
- A `tekseries/media-stats` binding source gives templates the totals ("32 photos"). The Gallery page pattern uses the block, and the interim core Gallery styling is removed.
- The lightbox, and filtering and loading without a page reload, are deferred.

**Rationale:** Links keep every state shareable. `year` is a WordPress query variable that turns a page URL into a date archive, and `type` is a reserved term, so the parameters are prefixed. The set is small and every chip needs a count, so one query plus PHP filtering beats a count query per chip. CSS columns need no script, though reading order runs down each column, unlike the design's rows. Captions come first because the migrated alt texts are file names. This replaces the interim gallery of ADR-030.

## ADR-046: Build the Home motion blocks with CSS only

**Status:** Superseded by ADR-052 (Home's static patterns only); by ADR-053 ("the carousel ships no script" only); by ADR-060 ("the Stat ships no script and counts on page load" only)

**Context:** ADR-014 shipped Home's motion in two steps: static core blocks first, then plugin blocks for the hero carousel, count-up stat and logo marquee. The design's count-up is CSS, but its marquee pauses only on hover, which fails WCAG 2.2.2, and its slider dots have nothing to slide. Server HTML must work without JavaScript, and motion must respect `prefers-reduced-motion`.

**Options:**
- Wait and build all three with the Interactivity API.
- Render static markup now with inert controls and add behaviour later.
- Build them with CSS only, so they are complete now.

**Decision:** The plugin adds three dynamic blocks that ship no script and move only under `prefers-reduced-motion: no-preference`.
- `tekseries/stat`: a CSS counter animates the number from 0. A screen-reader copy carries the plain figure, which also shows without CSS.
- `tekseries/logo-marquee`: the server repeats the logos so the strip can slide by half its width, and the repeats are hidden from assistive technology and inert. A checkbox drawn as a button, placed before the logos, pauses it, as does hovering. Without motion, and in the editor, it is a still row.
- `tekseries/hero-carousel`: a scroll-snap track of Cover blocks. The dots are links to slide ids and follow `:target`. One slide renders without dots or carousel roles.
- Home keeps its static patterns until the owner asks for the switch.

**Rationale:** CSS covers what the design shows, so nothing waits on a later phase or breaks without JavaScript. A checkbox gives a real pause control without a script, where an inert button would be worse than none. This delivers the blocks ADR-014 deferred. Later, optional behaviour is listed in Future work.

## ADR-047: Give each behaving block one Interactivity API script module

**Status:** Superseded by ADR-060 (one module that is no block's own only)

**Context:** ADR-005 allows frontend behaviour only through the Interactivity API, and Share Links, Table of Contents, Media Gallery and Job Listings now need it. Script modules have no translation loading. Core enqueues a view module on every render of an interactive block, and Share Links sits on every post and event, where most of its services have no behaviour.

**Options:**
- jQuery or hand-written DOM scripts.
- Bundle our own Preact and a store.
- One `view.ts` per block, with WordPress supplying the Interactivity API runtime.

**Decision:**
- A block that behaves has `src/<block>/view.ts`, declared as `viewScriptModule` in `block.json` with `supports.interactivity: true`. `@wordpress/interactivity` and `@wordpress/interactivity-router` are type-only devDependencies (ADR-034), and nothing is bundled.
- Behaviour hooks onto the markup `render.php` already prints, using `data-wp-*` attributes, so the page without JavaScript is the same page (ADR-005).
- Translated strings reach a script through `wp_interactivity_state()` or `wp_interactivity_config()`.
- A block's script loads only on pages that contain the block. Share Links also dequeues its module unless a block offers "Link to this page".
- A spec checks each kind of public page for no React, no jQuery (except the job submission form, ADR-007), and block scripts only with their block.
- In Share Links, "Link to this page" copies the link with the Clipboard API and announces "Link copied" in a status element. A modified click, an insecure page or a refused copy keep the plain link. Once the script runs, the link's accessible name becomes "Copy the link to this page".

**Rationale:** The Interactivity API ships no React to visitors and adds no second runtime. Hooking onto existing markup keeps the no-JavaScript page complete. Passing strings through state works around the missing translation loading. Dequeuing the unused module keeps the extra request off every post and event. This delivers the copy-link item that ADR-038 deferred.

## ADR-048: Build the gallery lightbox as a native modal dialog that reads the tiles on the page

**Status:** Superseded by ADR-071 (where the dialog is printed only)

**Context:** ADR-045 deferred the lightbox. The boards show captions, a counter, Previous and Next, thumbnails and video. Focus handling, Escape and an inert page behind are easy to get wrong by hand.

**Options:**
- Core's image lightbox, which has no captions, counter, thumbnails or video.
- A hand-written focus trap over a positioned element.
- A REST call for the item data.
- A native `<dialog>` rendered by the block, reading the tiles.

**Decision:**
- `tekseries/media-gallery` prints a `<dialog>`, opened with `showModal()`. The browser provides the focus trap, Escape, the inert page and the return of focus to the tile.
- The lightbox steps through the tiles loaded under the current filter and reads each item from the tile's own markup when it opens. There is no second data source and no request.
- It has a counter, wrapping Previous and Next, thumbnails, arrow keys and a swipe. Videos play in `<video controls>` and pause when the viewer moves on or closes. The opening fade runs only without a reduced-motion preference. A polite live region reads "3 of 12: caption". A modified click still opens the file.
- The phone layout has a bottom bar instead of side buttons and thumbnails, as on the boards. On tablets the side buttons get a dark backing so they stay visible over a photo. The boards do not show that backing.

**Rationale:** The browser already does the hard accessibility work for a modal dialog. Reading the tiles keeps one source of truth, so filters and Load more (ADR-049) need no extra wiring. Tiles stay real links, so the page works without JavaScript (ADR-047).

## ADR-049: Update lists in place through the Interactivity router, with the server building every list

**Status:** Accepted

**Context:** ADR-045 and ADR-042 deferred in-place updates, so filtering, Load more and paging are full page loads on real links and form addresses. WPJM's statistics script binds to the first `ul.job_listings` and watches rows (ADR-042).

**Options:**
- Re-implement the filters in JavaScript over REST or embedded JSON.
- Use `@wordpress/interactivity-router` with `data-wp-router-region`, following the addresses the page already has.

**Decision:**
- A block, or part of it, is a `data-wp-router-region`. The script follows the same links and form addresses, and the router swaps in what the server rendered. The address still changes, so views can be shared and Back and Forward work. A failed fetch falls back to a page load, and the router's generic "Page loaded" announcement is off in both blocks.
- Media Gallery: the whole block is the region. Filter links and Load more are fetched without their `#media...` fragment, so the page does not jump. After Load more, focus goes to the first new tile, and a visually hidden status element reads the server's summary. After an update the script sets checkboxes and the select from the address, and sets text fields only on Back, Forward and "Clear filters".
- Job Listings: only the results section is the region. The search form stays outside it, because the region is redrawn from the server's HTML and would overwrite a field while someone types. Typing in Keywords or Location is followed after a 400 ms pause and replaces the history entry, while chips, the remote switch, the category and Enter add an entry. A page change moves focus to the results. The count line is a status element. Empty fields and a checkbox group with every box ticked are left out of the address.
- WPJM statistics keep working. Job rows are keyed, so a row arriving in place is a new element that the observer sees. `ul.job_listings` is always rendered, hidden when empty, and the statistics script loads even when the first view finds nothing.

**Rationale:** The server stays the only place that builds lists. Two implementations of the filters would drift, and a REST or JSON version would not keep WPJM's query, caching and statistics (ADR-012). Following existing addresses keeps every state shareable and the no-JavaScript page unchanged (ADR-047). This delivers the in-place behaviour that ADR-045 and ADR-042 deferred.

## ADR-050: Lay out the gallery masonry as a CSS grid of thin rows

**Status:** Accepted

**Context:** ADR-045 chose CSS columns for the masonry. Columns read and tab down each column and rebalance when items are added, so every tile moved on Load more. That became unacceptable once Load more updates in place (ADR-049). The rest of ADR-045 stands.

**Options:**
- Keep CSS columns.
- A script that measures and places tiles.
- `grid-template-rows: masonry`, which is not widely supported.
- A CSS grid with thin rows and tiles that span several rows.

**Decision:**
- A row is 1/40 of a column's width, using a container query unit on the block. The block computes each tile's row count from the file's width and height, adds two for the gap, and passes it as `--ts-media-rows`. Auto-placement in document order puts each tile in the shortest column, left to right, as the boards do. Appended tiles never move earlier ones.
- The tile fills its rows minus the gap, so gaps are exact and the picture is cropped by a few pixels at most.
- Browsers without container units keep the CSS columns layout.

**Rationale:** Document-order placement matches the boards' reading order and makes Load more additive. Spanning rows needs only CSS, so layout stays script-free (ADR-005). A measuring script would add a second layout engine and a flash on load.

## ADR-051: Highlight the current section and fold the table of contents on phones

**Status:** Accepted

**Context:** ADR-038 deferred two Table of Contents behaviours: folding on phones and marking the section being read. Without a script the `<details>` must arrive open, and closing it from the script alone made the article jump up after first paint on every phone visit.

**Options:**
- Close the `<details>` from the script only.
- Render it closed, which leaves larger screens with an unusable default without JavaScript.
- Hold the list shut with CSS where scripts run, until the script closes the element.

**Decision:**
- The link of the section being read gets `aria-current`. That is the last heading to have reached the top 30% of the screen, found with an IntersectionObserver. A share of the screen height keeps the plugin independent of the theme's header height. A picked link is marked at once and keeps the mark for a second, because a section near the end of a page cannot reach the top.
- On phones (640px and narrower) the list starts folded, though the `<details>` still arrives open. Where scripts run (`@media (scripting: enabled)`), CSS holds the list shut until the script has closed the element, so nothing moves. The hold is a 5-second animation, so the list opens by itself if the script never arrives.

**Rationale:** The CSS hold removes the layout shift and still fails open without JavaScript (ADR-005). A fixed header offset would tie the plugin to the theme (ADR-047). This delivers ADR-038's deferred behaviour.

## ADR-052: Use the Stat and Logo Marquee blocks on Home

**Status:** Superseded by ADR-053 (the hero part only)

**Context:** ADR-046 built the Stat, Logo Marquee and Hero Carousel blocks and kept Home's static patterns until the owner asked for the switch. The site owner decided on 2026-10-10 to switch.

**Options:**
- Keep the static patterns.
- Switch the stat and logo sections and wait on the hero.
- Switch all three, including a two-slide hero.

**Decision:** `home-impact` uses `tekseries/stat` for 312+, 675+, 25+ and 100's. `home-partners` wraps its logos in `tekseries/logo-marquee`. Both are CSS-only, so Home still loads no script of ours. The hero stays one static Cover. The Hero Carousel waits for a second slide, so the controls it still lacks (autoplay, Previous and Next, and dots that follow swipes) were not built.

**Rationale:** The stat and marquee blocks are complete and need nothing more. A carousel with one slide has nothing to show. This changes only the "Home keeps its static patterns" part of ADR-046.

## ADR-053: Make the Home hero a two-slide carousel that can change slides by itself

**Status:** Superseded by ADR-068 (the fixed 7-second stay, the unconditional hold under the pointer and the dot spacing only)

**Context:** ADR-052 kept the Home hero a single Cover until a second slide existed. On 2026-10-10 the owner decided that Home shows the carousel the design board draws, a hero with slider dots. The live site's slider already rotates by itself. ADR-046 built the carousel with CSS only.

**Options:**
- Keep one static Cover.
- A carousel with dots only and no automatic change. This matches the board exactly.
- A carousel whose automatic change is an editor setting, with a pause control.

**Decision:**
- The Home hero pattern is a `tekseries/hero-carousel` block with two Cover slides and "Change slides automatically" on. Slide 2 is the live site's second slide, "One Youth Career At A Time" over the 2025 Jr. Rural Camp photo. Its chip, lead and buttons are a first draft from existing site copy, for the owner to edit.
- Only slide 1 holds the page's H1. Slide 2's headline is an H2 with the H1's size.
- The carousel now has an Interactivity API script module (`view.ts`, ADR-047). This ends "ships no script" for the carousel in ADR-046. Stat and Logo Marquee stay CSS-only.
- The track's scroll position names the slide in view, and that slide's dot gets `aria-current`. The no-JavaScript `:target` styling applies only while no dot has `aria-current`. A dot click moves the track alone, so the page does not jump. Page content that holds the blocks directly is edited freely.
- New attribute `autoplay`, an editor switch, off by default. Each slide waits 7 seconds, and the wait restarts when the slide changes or the visitor pauses. A turn is skipped while the pointer is over the carousel, focus is inside it or the tab is hidden. The server renders a hidden pause/play button, which the script shows. Under `prefers-reduced-motion: reduce` nothing starts and the button stays hidden.
- Corner radius is a block support, and the track clips the slides to it.
- Previous and Next arrows were left out on purpose, because the board does not show them. Dot spacing stays at the design system's 44px tap target (ADR-005), though the board draws 8px gaps.
- Editors add a slide by duplicating a Cover and remove one by deleting it. Inserted from the theme pattern, the hero counts as a pattern in WordPress 7.1 and asks for "Edit pattern" before structural changes.

**Rationale:** The board shows the dots, and the live slider already rotates. Motion that starts by itself needs a pause control (WCAG 2.2.2), as ADR-046 reasoned for the marquee. An off-by-default setting leaves the choice with editors, and the Home pattern turns it on to match the live site. The script only enhances the server markup, so the page without JavaScript is unchanged (ADR-005). This reverses the hero part of ADR-052 and delivers the carousel items in Future work.

## ADR-054: Text over a photo carries a halo in the overlay's colour

**Status:** Accepted

**Context:** The design's photo overlay is a left-to-right gradient in the tone colour: 94% at the left edge, 72% at 45% and 15% at the right. An accessibility audit measured the real pixels behind text over photos, which axe cannot judge. The month and year on cards with a featured image measured as low as 1.75:1, and the Home hero's lead line 2.8:1 on phones. WCAG AA needs 4.5:1 for that text.

**Options:**
- A stronger overlay.
- A solid or feathered box behind the text.
- Change the text colour alone.
- Keep the overlay and the photo as designed and give the text a soft halo.

**Decision:** Give the text a halo of six stacked `text-shadow`s, with no offset, in the overlay's own colour. It applies to:
- The card month label, only when the card has a featured image, in the card tone's colour (`--ts-tone-bg`).
- Headings, paragraphs without their own background (chips are left out) and outline buttons inside a Cover that uses the plum overlay gradient, through a new Cover stylesheet.
- Each Hero Carousel dot also gets a 1.5px dark ring, like the pause button's disc, so dots stay visible over a bright photo.

Both measurements now pass 4.5:1 against the worst-case photo, which is pure white under plum and ink and pure black under saffron and lilac.

**Rationale:** A stronger overlay fails on phones, where text spans the photo: the whole photo would need about 80% tone and all but disappear. A box leaves a visible band across the photo. A text colour change alone still fails where the overlay thins. The halo keeps the photo and the overlay as designed. It is a small, visible deviation from the boards. ADR-056 adds a regression test that measures it.

## ADR-055: Correct what the accessibility audit found

**Status:** Accepted

**Context:** The audit ran axe at WCAG 2.2 A and AA on the development site with real content, plus a keyboard walk of every page type and a read of the accessibility tree. No real screen reader was used. After the fixes, axe found no violations. Each item below failed a criterion or was announced wrongly.

**Options:**
- Fix each finding in the markup or CSS that caused it.
- Leave some findings as found, where the cause is outside our code or is content.

**Decision:**
1. `:focus-visible` shares the anchors' 96px `scroll-margin-top`, so keyboard focus is never left under the sticky header (WCAG 2.4.11 Focus Not Obscured).
2. The eyebrow's coral text measured 3.95:1 on lilac. On lilac surfaces (the lilac card style, lilac backgrounds and the job sign-in panel's "How posting works") it is `color-mix(in srgb, coral-text 85%, ink)`, about 4.8:1, with no new palette colour. The boards use a lighter coral there, about 2.5:1.
3. The Stat suffix uses the `coral-text` colour, because the light coral was 2.91:1 on the blush tile and large text needs 3:1.
4. Fluent Forms: the submit button gets a focus ring, and a topic chip is ringed as a whole when its radio has keyboard focus.
5. The "Read more" arrow has empty alternative text, so it no longer joins the link's name.
6. Images in a job description get `alt=""` when they have no alt attribute, through the `wpjm_the_job_description` filter, because 41 imported descriptions carried a source logo without one.
7. Two Groups carried an `aria-label` on a plain `div`, which ARIA does not allow. The previous and next post links are now a `nav` named "More posts", and the Home figures group lost its label.
8. The Job Listings block prints a screen-reader-only `h2` "Job listings" that names the results region and heads the job titles (`h3`).

Left as found:
- Fluent Forms' own markup: `aria-label` on `label` elements, no group semantics for the topic radios, and the reCAPTCHA frame.
- The gallery video has no captions. That is content.
- The large card date and the meta date are both read.
- The event page's section labels are styled paragraphs, not headings.
- Text links, badges and table-of-contents links are smaller than the design system's 44px target (ADR-005) but meet WCAG 2.2's 24px-or-spacing rule.

**Rationale:** Each fix removes a failed criterion or a wrong announcement without changing the design, and uses existing tokens. The items left are third-party markup, content, or already meet the criterion. The halo for text over photos is ADR-054.

## ADR-056: Check accessibility automatically in the end-to-end suite

**Status:** Accepted

**Context:** The audit in ADR-055 was a one-off, so its fixes can regress silently. Axe cannot measure text over a photo (ADR-054).

**Options:**
- Inject axe-core by hand from a transitive dependency. This is fragile.
- Screenshot diffing. This is brittle.
- Lighthouse's accessibility score in CI. It gives a score, not a list of failures, and has no states.
- `@axe-core/playwright` in the existing end-to-end suite, plus a pixel measurement for text over photos.

**Decision:**
- An axe spec (`@axe-core/playwright`, a root devDependency) builds one page of every public kind on the test site, including empty states, and expects no violation against WCAG 2.2 A and AA at 1280px and 390px.
- It also scans states only a script or a click reaches: the hero on its second slide and paused, the open header menu, gallery viewer, table of contents on a phone and apply box, and, signed in, the job submission form and the dashboard.
- Excluded as not ours: WordPress's admin toolbar (`#wpadminbar`) and the TinyMCE editor's own buttons (`.mce-tinymce`).
- A Shift+Tab walk checks that focus is never under the sticky header.
- A contrast helper measures text over a photo by comparing the text's box with and without the letters' fill, and takes the differing pixels as the letters. A pure white photo goes under the plum and ink cards and the hero, and a pure black one under the saffron and lilac cards. The test expects 4.5:1 for small text and 3:1 for the hero's large heading at 1280, 834 and 390px.
- The card-month test and the focus walk were checked to fail without their fix and to pass with it.

**Rationale:** The check runs where the other browser tests run and fails with a list of violations. Worst-case photos make the contrast test independent of what editors upload. Axe sees names, roles, structure and solid colours, not everything. The Contact form (Fluent Forms) exists only on the development site, so it is scanned there by hand and not in the suite.

## ADR-057: Preload the two text fonts and load later carousel photos at low priority

**Status:** Accepted

**Context:** Lighthouse on the development site already scored well on Home, Gallery, Job Series and an event page. The remaining loss on Home was a layout shift on phones, where the headline reflowed when its font arrived.

**Options:**
- Preload the Latin font files and lower the priority of later carousel photos.
- `fetchpriority="high"` on the first two gallery tiles. Tried and dropped: it made Largest Contentful Paint slower.
- Raise WordPress's inline-style limit to remove five small render-blocking stylesheets. Not done: bigger HTML on every page for a small gain on throttled mobile.
- Convert uploads to WebP or AVIF. Not done: content and host work.

**Decision:** A `wp_preload_resources` filter in the theme preloads the Latin file of each family (Schibsted Grotesk and Onest). Other unicode ranges still load on demand. The Hero Carousel sets `fetchpriority="low"` on the photos of slides after the first. They still load at once, behind the first, rather than lazily, so they are there before their slide comes.

On mobile, First Contentful Paint fell and Home's layout shift went from 0.044 to 0.001. Largest Contentful Paint was unchanged within 0.1 s, and Total Blocking Time rose from 0 to about 60 ms. Accessibility is 100 on all four pages, with Job Series reaching it through the list heading of ADR-055.

**Rationale:** Preloading removes the font reflow, the one measurable loss. Low priority for later slides keeps their bandwidth from competing with the first photo without delaying them. What remains is the host's: server response time (the development site has no page cache, and the live site answers from one) and cache lifetimes for static files.

## ADR-058: Release 1.0.0 as two uploaded zips, with database content as a scripted bundle

**Status:** Superseded by ADR-059 (the apply step: the WP-CLI script and the WP-CLI tone backfill on the live site)

**Context:** On 2026-10-10 the owner chose to deploy by uploading zips, not by pulling git on the server. The theme and the plugin are always released together. Much of the new site also lives in the development database: page content, gallery albums, topic icons and the contact form's fields. Zips do not carry it, and the development database is an old copy that must not replace the live one.

**Options:**
- A git pull on the server. The owner chose otherwise, and it needs a build step on the server.
- Copy the development database to live. It would overwrite newer live content.
- Paste ten pages by hand. It is slow, error-prone and has no dry run.
- Two zips plus a scripted bundle of the database content (chosen).

**Decision:**
- One version, 1.0.0, in the theme header, the plugin header and both package files, kept equal by a unit test.
- `npm run plugin-zip` (after `npm run build`) and `npm run theme-zip` produce the two git-ignored zips. The theme zip holds only the files that ship.
- The database content travels as a bundle exported from the development site: ten pages and posts with the development domain replaced, the icons, the albums, the gallery video's poster image and the contact form's fields.
- A WP-CLI script applies the bundle on the live site. It does a dry run by default, checks every item before touching it and skips what is already done. Tones for existing posts come from `wp tekseries backfill-tones`.
- The export and apply scripts and the runbook are kept outside the repository.
- A release tag is made only after the owner approves. There is no CI, so the gate runs on a developer's machine.

Both zips were installed on a fresh site, the apply script was rehearsed with a made-up bundle where a second run changed nothing, and the live site's page, post and media IDs were found to match the development site's. Not verified: the script has never run against the live site or a copy of it.

**Rationale:** Zips match the owner's choice and carry only what ships (ADR-001). A dry-run-first script moves database content without overwriting live content. One equal version keeps the two packages from drifting.

## ADR-059: Apply the release bundle from wp-admin with a one-off migration plugin

**Status:** Superseded by ADR-073 (what the bundle carries, the refusals, and what stays after the plugin is deleted only)

**Context:** ADR-058 had a WP-CLI script apply the bundle on the live site, and `wp tekseries backfill-tones` set the tones of existing posts. On 2026-10-11 the owner said the live host has no SSH and no WP-CLI, so neither step can run there. The rest of ADR-058 stands: one version, two release zips, a bundle exported from the development site, no copy of the development database, and a tag only after the owner approves (`v1.0.0` was tagged on 2026-10-11).

**Options:**
- Apply the bundle by hand in wp-admin. It is slow, error-prone, has no dry run and cannot set tones in bulk.
- Put a migration screen inside TekSeries Blocks. The released plugin would carry one-off code and one site's content for good.
- Ask the host for SSH on a different plan. It costs money and is not needed.
- A one-off plugin, uploaded as a third zip (chosen).

**Decision:**
- "TekSeries Migration (one-off)" (folder `tekseries-migration`, zip `tekseries-migration.zip`) applies the bundle from wp-admin. The export script builds the zip from the development site, and the zip holds the plugin's code plus the bundle, written for one site address.
- It adds one screen under Tools, "TekSeries migration". Opening the screen is the dry run: it lists what would change and changes nothing. A button, behind a required "I took a backup" tick, applies the changes.
- It refuses the whole run when the site address is not the one the bundle was written for, TekSeries Blocks is not active, the TekSeries theme is not installed, Advanced Custom Fields is older than 6.8.10, or a bundle file is missing or fails its SHA-1 checksum.
- Every step looks first. Items already right are left alone, so a second run changes nothing. Items not found as expected (ID, type and address) are listed as skipped, and changes that do not go through as failed.
- Each old page is stored as a revision before it is replaced, because WordPress on its own keeps a revision of what it saves, not of what was there.
- Page content is saved byte for byte. WordPress's HTML filter for accounts without `unfiltered_html` is switched off during the save and restored after, and the stored content is compared with the bundle. The filter would otherwise break some pages' blocks.
- The plugin skips WordPress's re-check of a page's template against the active theme during the save, and sets the template itself. Without the skip, a save while Divi is still active fails with "Invalid page template.", and a second run reported a page as failed although its content had been saved.
- Tones for existing events and news posts come from `tekseries_blocks_plan_tones()`, the planner the WP-CLI command also uses. The command stays, for development sites.
- It also sets the site logo option. It switches the theme to TekSeries last, in the same request as the content, so visitors never see the new content under Divi or the Divi content under the new theme.
- Only administrators (`manage_options`) can open or run the screen, and the apply request needs its nonce.
- Deleting the plugin removes its files and its one option, the report of its last run. Nothing it changed is undone.
- Like the export script and the runbook (ADR-058), the plugin is kept outside the repository. Released TekSeries Blocks 1.0.0 and the theme are unchanged by it.

A rehearsal on a throwaway site set up like live, with Divi's child theme active, passed every check, including uploading the three zips, reading the dry run, applying it and deleting the plugin. Not verified: a run on the live site or on a copy of its database.

**Rationale:** The host allows uploads in wp-admin and nothing else, and a plugin zip is that route. It keeps ADR-058's checked, dry-run-first behaviour without WP-CLI. A third zip keeps one-off code and one site's content out of the released plugin and theme (ADR-001). The refusals, the backup tick, the nonce and the capability check stop a run against the wrong site or by the wrong person.

## ADR-060: Animate Home in CSS, with one small script that only says when a block is in view

**Status:** Superseded by ADR-062 (how a focused block is kept shown while its entrance plays only)

**Context:**
- The design canvas pulled on 2026-10-11 animates the three Home boards with GSAP: a hero entrance on load, counters, and pillar cards and headings that rise in. "In view" is an `IntersectionObserver` at 18% of the element, and with reduced motion nothing animates. The design system has no motion tokens.
- GSAP is about 73 KB, against about 8 KB for all five visitor script modules together (ADR-047), and its licence is proprietary, not GPL.
- Pure CSS cannot yet start a timed animation on scroll everywhere: `animation-trigger` is Chrome 146+ only, and `animation-timeline: view()` ties the animation to scroll position.
- The impact figures counted on page load (ADR-046), so the count had usually finished unseen.

**Options:**
- Ship GSAP. It is heavy and proprietary.
- Pure-CSS `animation-trigger`. Chrome only today.
- Pure-CSS scroll-linked timelines. Wrong feel, no stable Firefox.
- Hide blocks with CSS under `@media (scripting: enabled)` before the script runs. A failed script would leave content hidden unless a timed fallback were added.
- CSS does every animation; one small script marks a block when it enters view (chosen).

**Decision:** The last option, chosen by the site owner.
- `theme.json` `settings.custom.motion` gains `ease.out`, `ease.out-strong`, `reveal.duration` (0.8s), `reveal.distance` (24px) and `reveal.stagger` (0.12s). A unit test checks that every motion token used in styles is defined. Single-use values stay beside the rule that uses them.
- A block with the class `ts-reveal` rises in the first time it is scrolled to, and a marked Group's direct children follow in turn. Decorative icons stay put. The rules sit in `assets/css/global.css` under `prefers-reduced-motion: no-preference`, and `:focus-within` shows a waiting block at once. The rules are screen-only, so print is unaffected.
- A small Interactivity API module (`src/reveal/view.ts`), whose directive a `render_block` filter adds to marked blocks, is enqueued only on pages with a marked block. It marks a block below the screen as pending and, once 18% of it is on screen (or 18% of the screen, for a taller block), as revealed. Blocks revealed together are staggered 0.12s apart.
- The Stat block carries the same directive. Below the screen at load it waits at 0 and counts when revealed. On screen at load it counts from load, as before.
- The hero entrance is CSS only, in the Hero Carousel stylesheet. `home-about`, `home-impact`, `home-services` and `home-team` carry the class on the four section headings and the three pillar cards.
- The in-page link offsets stay at 96px, although the boards now use 100, 96 and 88px. GSAP is not installed, and its file is not copied into the design reference.
- Deliberate differences from the boards:
  - A block already on screen when the script starts does not animate in. The boards hide such blocks after load and then animate them, which flashes.
  - Tall blocks are measured against the screen, because the pillar cards are about 1,800px tall on phones and would otherwise sit blank for a third of the screen.
  - Counters start per figure as it comes into view, not all four with the grid.
- Known limit: a fast jump, such as a hero link to a pillar card, can pass blocks before the observer sees them. They play when the visitor scrolls back.

Checked on the development site: the hero photo is the largest paint with and without the motion.

**Rationale:** The boards' trigger is an `IntersectionObserver` and the library only tweens, which CSS does natively, so the library buys nothing and its licence is avoided. Server HTML stays complete without JavaScript (ADR-005): nothing is hidden unless the script is running and the block is off screen. With reduced motion, the script marks nothing and the CSS is guarded too. This changes ADR-046, where the Stat ships no script and counts on page load, which it still does without the script. It also changes ADR-047: one module is now no block's own, but nothing is bundled and it loads only with the blocks that need it. The marquee is unchanged.

## ADR-061: Animate the compact menu's opening in CSS, and let it close instantly

**Status:** Superseded by ADR-062 (how a focused link is shown at once only)

**Context:** At 1100px and below, the header menu is core's Navigation overlay restyled into a panel under the header bar (ADR-018). Core keeps the toggle, focus trap, Escape and ARIA state. The panel appeared with no motion, and the owner asked for a CSS animation at tablet and phone widths. It reuses the motion tokens of ADR-060.

**Options:**
- Animate the opening in CSS and let the closing be instant (chosen).
- Also animate the closing by copying core's open-state layout rules onto the closed state. It is fragile against core updates.
- Add a script for the closing. The request was for CSS.
- Add a dimming layer behind the panel. It would change the look of the page, which was not asked for.

**Decision:** The first option, in the last section of `assets/css/blocks/navigation.css`, all under `prefers-reduced-motion: no-preference`. There is no markup change, no script and no new token.
- The panel unrolls from under the header bar with a `clip-path` animation.
- The links rise one after another, then the two buttons, and the close cross turns into place.
- While the menu is open, the menu button's bars are held turned and transparent under the cross. They swing back when the menu closes, which is the only motion on closing.
- A link with `:focus-visible` drops its animation.
- With reduced motion the menu behaves as before.

**Rationale:** The clip reaches above the panel so it never cuts the close button, which is why `overflow: hidden` is not used. A keyboard user must not see a focus ring on a link still fading in, because core moves focus to the first link on opening. The panel does not animate out because core closes the menu by removing the class that also lays the panel out, so the contents collapse at once. The bars' swing gives the closing some motion without depending on that class. Core's overlay class names are still relied on, as in ADR-018.

## ADR-062: Show a focused block by overriding its animated properties, never by removing the animation

**Status:** Superseded by ADR-077 (the `translate: none` part, for pointer focus)

**Context:** ADR-060 and ADR-061 say that a block holding keyboard focus is shown at once. This was built as `animation: none` on `:focus-within` and on the compact menu's links with `:focus-visible`. Found on 2026-10-12, in 1.1.0 and 1.1.1: when focus moved on, `animation-name` came back and the browser started a new animation, so the block vanished and rose in again.

**Options:**
- Cut the animation short on focus by changing `animation-duration` or `animation-delay`. It depends on browsers updating a running animation.
- Animate a registered custom property and override it normally. It runs off the compositor and needs `@property`.
- Replace the keyframes with `@starting-style` transitions. It rewrites three shipped mechanisms and has narrower browser support.
- Keep the animation and override the properties it animates while focus is inside (chosen).

**Decision:** The last option, in 1.1.3. The animation is never removed. While focus is inside, the rule sets `opacity: 1 !important; translate: none !important`.
- An important author declaration ranks above animation declarations in the cascade, so the block shows at once, the animation runs out on its own clock, and nothing restarts when focus leaves.
- In the reveal rule the override names only the animated children. Decorative icons keep their own low opacity, and children marked `ts-reveal` have their own turn.
- This replaces how a block is kept shown while its entrance plays: in ADR-060, a revealed `ts-reveal` block, a revealed Group's animated children and the hero's first-slide text; in ADR-061, "A link with `:focus-visible` drops its animation". The rule in ADR-060 for a waiting block is unchanged: a block still marked `is-reveal-pending` that takes focus gets a plain `opacity: 1`, because nothing is animating yet. The rest of both stands.
- These are the only `!important` declarations on animated properties in the theme and plugin. A future entrance animation uses the same pattern, never `animation: none` on a focus state.

Checked in Chromium and Firefox: nothing replays after focus leaves. Not verified: Safari.

**Rationale:** The important override is the smallest change and is what the cascade specifies. It removes the cause of the replay instead of racing it. If an engine did not honour the override, a focused block would finish fading in under the focus ring, and it still would not replay.

## ADR-063: Offer the Home hero's on-load entrance as a class, `ts-intro`

**Status:** Accepted

**Context:** ADR-060 built two entrances: the Hero Carousel raises the first slide's text when the page opens, and a block with `ts-reveal` rises in when scrolled to. On 2026-10-12 the owner asked for the hero's on-load effect as a class too, so other pages' heroes can use it. Those heroes are a Group with the style `is-style-hero-plum` holding a Group of text and sometimes a card.

**Options:**
- Make `ts-reveal` also play for blocks on screen at load. It needs the script, so the top of the page would depend on JavaScript, and hiding blocks after load flashes (ADR-060).
- Move the Hero Carousel's rule onto the class and mark the Home slide. The block lives in the plugin and must work without a theme class (ADR-001).
- A class for containers only. It would do nothing on a single heading, which would confuse.
- One class that reads the block it is on (chosen).

**Decision:** The last option, in 1.2.0. It is CSS only, in the last section of the theme's `assets/css/global.css`, under `prefers-reduced-motion: no-preference`. It works with JavaScript off and prints whole.
- On a Group marked `ts-intro` (Row, Stack and Grid are Groups), the direct children rise in one after another and the Group itself does not move, so a hero's background and circles stay still. On any other block, the block rises in itself. Marked siblings take turns where the browser supports `:nth-child(n of .ts-intro)`, and rise together where it does not.
- The values are the hero's: 28px, `reveal.duration`, `ease.out-strong`, a start of 0.15s and `reveal.stagger`. There are six places in the sequence, and later blocks come in with the sixth. There is no new token, and 28px and 0.15s sit beside the rule.
- The outermost mark wins, so two animations never stack on one element. A marked Group inside a marked Group rises as one of the outer Group's blocks.
- Where a single-mark rule and a Group's child rule both match a block, the Group's place wins.
- Decorative icons are left out, as in the reveal rules.
- The editor stays still. The theme stylesheet also loads as an editor style, so the selectors leave out editor blocks, or the entrance would play on every editor load and for every inserted or moved block.
- Keyboard focus follows ADR-062. The Hero Carousel keeps its built-in rule.
- No page carries the class yet. On a text-led hero, mark the pieces (heading, buttons, card) and leave the large paragraph unmarked.

Measured cost: Chrome counts a text block for Largest Contentful Paint only once its fade has finished. On Contact and Job Series, marking the hero's whole text Group moved that time from about 0.3 to 0.4s to about 1.5 to 1.8s, while marking only the H1 and the buttons did not slow it. Starting the fade at a tiny non-zero opacity would hide the cost from the measure without changing what visitors see, and that was not done.

Tried on the Contact, Job Series and Privacy heroes by adding the class to the HTML on its way to the browser: the text rose in order, and the background, circles and card stayed. Checked in Chromium and Firefox. Not verified: Safari.

**Rationale:** One class that adapts to the block it is on matches how the owner already marks `ts-reveal`, and covers both a whole hero and single pieces. Pure CSS keeps the top of the page independent of JavaScript (ADR-005). Keeping the Hero Carousel's own rule leaves the plugin working without the theme (ADR-001). Pure CSS also avoids the flash ADR-060 avoided. The measured cost is why the class is opt-in and why a large lead paragraph should stay unmarked.

## ADR-064: Depart from the boards on page top spacing and hero and banner alignment

**Status:** Accepted

**Context:** The boards (`docs/design-reference/project`) show 48px between the sticky header and the first block, a hero's text centred against the card beside it on desktop, and post banners with a 480px minimum height and the text at the bottom. After reviewing the built site on 2026-10-11 and 2026-10-12, the owner asked for less space under the header, the hero text at the top, and no 480px minimum. The six heroes with a card are Events, event types, News, Contact, Gallery and Job Series. The banners are the event and news post banners.

**Options:**
- Redefine the 32px spacing preset. It has 44 other uses in the theme's own files, and more in saved page content.
- A negative margin, or a CSS override on `main`. Editors could not see or change it in the Site Editor.
- Keep the banner minimum for events only. The owner asked for both.
- Change the block attributes in the templates and the pattern generator, and make the Post Tone block cope with short banners (chosen).

**Decision:** The last option, in 1.2.4. It supersedes no ADR in full. It refines ADR-025 and ADR-033 on the points below.
- `main`'s top padding goes from the 32px spacing preset to the existing 4px preset in all 14 templates, so the visible gap under the header goes from 48px to 20px. The 32px preset is not redefined.
- The text column of the plum hero (`heroPlum()` in the pattern generator) is top-aligned instead of centred, in the six regenerated hero patterns.
- In `template-single-event` and `template-single`, the `tekseries/post-tone` banner loses its `minHeight: 480px` and its text column is top-aligned instead of bottom.
- `post-tone/style.scss` caps the banner's topic icon by the band's height, because a short banner would cut off the top of the 340px icon. Where the icon already fitted, it is unchanged.
- Templates customised in the Site Editor keep their saved padding until reset. None is customised on the development site.

Checked on the development site at three widths: the gap is 20px on every page kind and in-page anchors still land clear of the header.

**Rationale:** The owner's review outranks the boards, and the boards' own values stay in `docs/design-reference/`. Changing block attributes keeps every change visible and editable in the Site Editor and leaves the other uses of the 32px preset alone. Changing the pattern generator means regenerated patterns keep it. These three points now differ from the boards on purpose, so a later design pull that still shows 48px, centred text or a 480px minimum must not be read as a regression to fix.

## ADR-065: Let the Home Mission card end with its text, with a class `ts-fit`

**Status:** Accepted

**Context:** On the Home board the plum Mission card in "Who We Are" is as tall as the column beside it. As built, it stretched to the grid row and left about 55px of empty plum under its last paragraph at 1440px. On 2026-10-11 and 2026-10-12 the owner asked for the card to hug its text on desktop.

**Options:**
- The block's own vertical alignment control. In WordPress 7.1 a grid child has no per-item "align self" control in the editor.
- A rule aimed at that one card. A class any card can take is no more code, and editors can reuse or remove it under Advanced, Additional CSS class(es).
- A utility class in the theme (chosen).

**Decision:** The last option, in 1.2.5.
- `assets/css/blocks/group.css` gains `.ts-fit { align-self: start; }`.
- The `home-about` pattern sets the class on the Mission card through the pattern generator, so regeneration keeps it. The development site's Home page got the class by a hand edit, since it carries the owner's edits and is never regenerated.
- There is no media query. At 1100px and below each card is alone in its row, so the class has no effect.

Checked on the development site: at 1440px the card now ends with just its padding, and its height at 834px and 390px is unchanged.

**Rationale:** The class is the smallest change that works in 7.1 and stays visible and editable in the editor. It is an editor-facing convention alongside `ts-reveal` (ADR-060) and `ts-intro` (ADR-063). Like ADR-064, it differs from the board on purpose, so a later design pull that shows the stretched card is not a regression to fix. It refines ADR-025.

## ADR-066: Show the horizontal logo from the Site Logo setting in the header, and a bundled stacked logo in the footer

**Status:** Accepted

**Context:** On 2026-10-11 and 2026-10-12 the owner asked for the horizontal TekSeries logo in the header and the stacked one in the footer. Both files are in the Media Library on the development and live sites with the same IDs (horizontal 283171, 244 by 60; stacked 283170). The stacked logo is blue and dark grey on a transparent ground, and the footer panel is plum.

**Options:**
- An SVG of the logo in the theme for both places. No vector source was supplied.
- A second Site Logo block in the footer. It would show the same horizontal file.
- A Media Library image in the footer. Patterns must look complete on a fresh install (ADR-023).
- Draw the footer plate with block background and padding attributes. The plate is part of the logo's look, not something to tune per page.

**Decision:** This ships in release 1.4.0.
- Header: it stays the core Site Logo block, so the picture is the site's own `site_logo` setting and an editor swaps it in the Site Editor. The block's `width` goes from 64 to 179. The theme CSS is unchanged and sizes the logo by height (44, 40 and 34px at desktop, tablet and phone). On the development site `site_logo` changed from 283170 to 283171, and the release bundle for live already carries that option (ADR-059).
- Footer: an Image block first in the brand column of the footer pattern, pointing at `assets/images/logo-stacked.png`, a copy of attachment 283170 shipped with the theme (ADR-023). It is 44px tall on a white rounded plate, with alt text "TekSeries". Theme CSS draws the plate and gives the picture its aspect ratio.

**Rationale:** The Site Logo block keeps the header logo editable without code, and sizing by height keeps any replacement file in proportion. A theme file lets the footer look complete on a fresh install, and the plate keeps the logo legible on plum. Consequences:
- The 244 by 60 horizontal file is slightly soft on high-density screens at 179 by 44. A larger or SVG copy can be swapped in the Site Editor with no code change.
- The development site's header and footer are saved copies in the database, so they were patched by hand as well as in the patterns. A site with saved copies of these parts does not pick up pattern changes by itself (ADR-017). The release bundle does not yet carry saved template parts.
- The footer is 32px taller on desktop.

## ADR-067: Draw icons on core Buttons with classes in theme CSS, set by an editor-only panel in the plugin

**Status:** Accepted

**Context:** The boards put a Material Symbols icon on many buttons. Core's Button block has no icon in WordPress 7.1, and the first build left the icons off without recording the difference from the design. On 2026-10-11 and 2026-10-12 the owner asked for every missing design icon and for a way to pick one in the editor. The first rule of the mechanism landed in 1.3.0.

**Options:**
- Classes on the core Button, drawn by theme CSS, with an editor panel that sets the class (chosen).
- A `render_block` filter that injects an inline SVG. It runs PHP on every button render.
- A custom "icon button" block. Every existing Button would need converting.
- Core's Icon block beside the text in a Row. It splits the button's hover and focus into two controls.
- An icon font. ADR-024 forbids it.

**Decision:** The first option, in 1.6.0.
- A core Button with the class `ts-icon-<name>` draws that icon before its text. With `ts-icon-after` as well, it draws it after. `ts-icon-small` draws it at 18px instead of 20px.
- In the theme's `assets/css/blocks/buttons.css`, one generic rule masks the icon in the text colour, and one rule per icon sets `--ts-button-icon` to a data URI. A name with no rule draws nothing. A local script produces the data URIs from the plugin's SVG files in `assets/icons/`.
- In the plugin, editor only, `src/button-icon/index.tsx` (a webpack entry like the post sidebar's, ADR-034) adds an "Icon" panel to `core/button` with a dropdown and an "Icon after the text" switch. It only rewrites `className`.
- The icon list is `tekseries_blocks_button_icons()` (15 names). A unit test checks that it and the theme's per-icon rules name the same icons.
- The same technique, without the panel, draws the contact form's topic chip icons and the "Send message" icon (ADR-029), and an upload icon on the job form's file button. The job dashboard's row buttons get no icon, because no board draws one.

**Rationale:** No new attribute means the saved markup is exactly core's, so a button stays valid with the plugin off and in patterns. Patterns carry icons as plain class names. Nothing ships to visitors: no script, no render filter, no inline SVG per button, so rule 1, that React never ships to visitors, is untouched. This closes the unrecorded design difference. Consequences:
- With 15 icons `buttons.css` is 12.2 KB and WordPress no longer inlines it, so it is one more linked stylesheet on pages with a button. Each added icon costs about 0.5 KB.
- Mask icons disappear in forced-colours mode, but the buttons keep their text. The contact form's topic chips hide the radio dot, except under forced colours.

## ADR-068: Make the Hero Carousel's stay, pointer hold and dot spacing editor settings, and give a new slide whole

**Status:** Accepted

**Context:** ADR-053 fixed the stay at 7 seconds, always held the slides under the pointer, and kept every dot a 44px tap target although the board draws the dots 8px apart. Editors added a slide by duplicating one. On 2026-10-11 and 2026-10-12 the owner asked for the timing, the hover hold and the dot spacing to be settings, and for an "Add slide" control that gives a complete slide.

**Options:**
- A free "seconds" number field with no limits. Under 3 seconds nobody can read a slide, and over 30 it no longer reads as a carousel.
- Refuse `close` dots when there are three or more slides, to enforce the tap target. The owner asked for the board's look, so the help text informs instead.
- Core's `defaultBlock` for the appender. In WordPress 7.1.3 a default block cannot carry inner blocks.
- Offer the slide only as a block variation or a pattern. The appender is where an editor looks.
- Attributes with settings controls, a custom appender and a slide template (chosen).

**Decision:** The last option, for the block `tekseries/hero-carousel`, in 1.7.0.
- Attributes: `interval` (integer seconds, default 7, clamped by the server to 3 to 30), `pauseOnHover` (default true) and `dotSpacing` (`touch`, the default, or `close`). The defaults reproduce 1.6.0, so no stored block changes behaviour.
- `render.php` passes the stay and hover settings to the block's Interactivity context and adds the class `has-close-dots`. Focus inside the carousel, a hidden tab and `prefers-reduced-motion: reduce` hold or stop the slides whatever the settings.
- With close dots, each dot's link is only as wide as its dot (8px, or 28px for the slide in view), 8px apart and still 44px tall, with 8px between the dots and the pause button.
- `edit.tsx` renders its own appender, which inserts a complete slide built from a template (`slide.ts`): a Cover with the plum overlay, a label, an H2, a line, two "#" buttons and the Share / Create / Solve row. The block's `template` is the same slide.
- A bare Cover inserted from the block library is replaced by a whole slide in the same undo step, so undo removes the slide and does not bring back a bare Cover. Empty placeholders draw nothing on the site.
- ADR-060's entrance of the first slide is unchanged.

**Rationale:** It is the owner's request. The defaults keep the accessible behaviour, and the control's help text tells an editor who loosens it what it costs.
- WCAG 2.2 criterion 2.5.8 (Target Size, Minimum) asks for 24 by 24 CSS pixels, or enough room that a 24px circle centred on a smaller target touches no other target. With close dots and two slides the dots pass, and the 8px gap to the pause button was added for the same reason. With three or more slides, two 8px dots sit 16px apart centre to centre and fail it. The accessibility suite (ADR-056) scans the worst two-slide case with the second slide in view, but not the same page with the first slide in view.
- The default, `touch`, keeps 44px, which also meets the design system's own rule (ADR-005). Turning off the pointer hold does not affect WCAG 2.2.2, because the pause button stays.
- Consequences: the slide template exists in both `slide.ts` and the pattern generator, and the two must be kept alike by hand. It names theme presets, like the rest of the plugin's blocks (ADR-046). The same-undo-step replacement uses `__unstableMarkNextChangeAsNotPersistent`, and if that API goes the fallback is a visible extra undo step.

## ADR-069: Show a real Google map on Contact through a small server-rendered Map block that frames Google Maps embeds only

**Status:** Accepted

**Context:** The Contact board draws a stand-in for a map: a plum card with a street grid and a pin, with the address card over it. The old live site had a real Google Maps embed, and the first build followed the board (ADR-029). On 2026-10-11 and 2026-10-12 the owner chose the real map, in the design's frame.

**Options:**
- Core's Embed block. It has no Google Maps provider.
- Core's Custom HTML block. It lets any markup in and is not something to hand to site editors.
- A static map image linking to Google Maps. It is not the real map, and Google's static images need an API key.
- OpenStreetMap or a JavaScript map library. Visitors would get a script and a different look from the live map.
- Keep the address card over the map, as on the board. It would cover Google's own controls and attribution, which must stay visible.
- A block of our own that frames Google Maps embeds only (chosen).

**Decision:** The last option, in 1.9.0.
- Block `tekseries/map` in the plugin, with attributes `src` and `title`. It is dynamic and has no view script.
- `render.php` prints a lazy-loaded, titled `<iframe>` only when `src` begins with `https://www.google.com/maps/embed` followed by `?` or `/`. Any other `src` prints nothing. The frame is 450px tall, the old site's height, and clipped to the block's corner radius.
- The editor pastes Google's whole `<iframe>` snippet or the address alone, and the block keeps the address. It refuses anything that is not a Google Maps embed, shows a notice and leaves the map as it was. The canvas shows a still card, so wp-admin asks nothing of Google.
- The `contact-message` pattern uses the Map block with the large corner radius and the embed address read from the live Contact page. The address and "Get directions" sit in their own card under it, and the stand-in's CSS is removed. The development site's Contact page was patched by hand, because the owner has edited it.

**Rationale:** A server-side allow-list of one host and one path means the block cannot frame anything else, whatever is saved in the attribute. The frame is plain server HTML (rule 3), nothing of ours ships to visitors (rule 1), and the block has no script (ADR-047). Tests stub Google, including the accessibility suite's visitor contexts (ADR-056). This is a deliberate difference from the board, at the owner's request, like ADR-064 to ADR-066, so a later design pull that shows the drawn map is not a regression to fix. Consequences:
- Privacy: the Contact page now loads content from Google, which the stand-in did not. The Privacy Policy may need a line about it. A click-to-load consent step was not asked for and is not built.
- The height is fixed at 450px in the block's stylesheet. There is no height control.

## ADR-070: Let visitors switch event and job lists between newest and oldest first with `?order=asc`

**Status:** Accepted

**Context:**
- The boards draw a static "Newest first" label above the Events lists and the Job Series list. On 2026-10-11 the owner asked for the sort to work.
- ADR-036 sorted on a meta query joining `event_date`. For an event without a date, the database ordered by whichever meta row it picked, so the event could be listed above every dated event. This was seen on the test site. Every event on the live site has a date.

**Options:**
- A private parameter name, such as `list_order`, instead of WordPress's public `order` query variable. It is not needed.
- A select or a pair of links for the two orders.
- Sorting in the browser.
- For the Events page grid, keeping the offset and flipping the order. That would leave out the oldest event, not the newest.

**Decision:** The address carries the order, in 1.11.0.
- `?order=asc` is oldest first; anything else is newest first. `order` is WordPress's own public query variable, so the main query of the event type archives follows it with no extra code, and `tekseries_blocks_list_order()` reads it for everything else. Rank Math's canonical link for a list with the parameter is the address without it, and nothing redirects.
- The switch on event pages is a core Button with the class `ts-sort`, bound on `text` and `url` to a new Block Bindings source, `tekseries/list-order`. It is a plain link, and a `render_block_core/button` filter gives it an `aria-label` that starts with the visible text and says what the link does. The switch's wording and addresses come from the plugin. The theme draws it as plain text with the `swap_vert` icon, which joins the Button icon list of ADR-067 (now 16 icons).
- On the Events page the Latest card stays the newest event in either order. When the address asks for oldest first, the grid is turned round and leaves the newest events out with `post__not_in` instead of the offset (ADR-026), so "the rest" is the same set in both orders and the page count is exact. Only event loops with an offset follow the address; the Latest card and "More events" do not.
- Event order mechanism, replacing ADR-036's meta query: `tekseries_blocks_event_order_args()` marks the query, and a `posts_clauses` filter joins `event_date` under its own alias and orders by "has no date" first, then the date, then the publish date. A join of its own makes the order deterministic for undated events. Undated events come after dated ones in either order. ADR-036's two filters and its rule that only loops left on the default date orderby change stand.
- Event type chips keep the chosen order through the existing `ts-type-chip` filter (ADR-037).
- In the Job Listings block the label became a link inside the router region. A hidden `order` field carries the order through a search, and page links and "Clear filters" keep it.
- Departures from the design: the Job Series phone board hides the label, but the switch is shown on phones because it now does something. The Job Series label is drawn at weight 600 to match the Events switch.

**Rationale:** A link with the state in the address works without JavaScript and can be shared and bookmarked. Core's own query variable means the archive query needs no code, and the canonical link keeps search engines on one address per list. Block Bindings on a core Button keeps the templates core blocks (ADR-005). `post__not_in` keeps the Latest card and the grid from showing the same event. Consequences:
- `?order=asc` on any page reaches WordPress's main query too. On singular pages that changes nothing visible.
- A Button with the class `ts-sort` that is not bound to the source would get a misleading `aria-label`. The class is for the bound switch only.
- Without the plugin, the pattern's fallback link `?order=asc` still orders the type archives through core.

## ADR-071: Share the Gallery's viewer with links elsewhere, marked by the class `ts-lightbox-open`

**Status:** Accepted

**Context:**
- The viewer (a modal `<dialog>`, ADR-048) was part of the Media Gallery block's output and could show only the Gallery's tiles.
- The owner asked for the event poster in the design's frame with a "View full size" link, and for a "See video" pill on the Home page's Case Study card that opens a video. Both need the viewer outside the Gallery.

**Options:**
- A second, separate lightbox for single files.
- Core's "Expand on click" for Image blocks. It shows photos only, no video, and it is a different viewer from the Gallery's.
- A new block for each opener.
- A class on core blocks, with one shared dialog.

**Decision:** The last option, in 1.12.0.
- A block with the class `ts-lightbox-open` is an opener. When its first link leads to a photo or a video file, the link opens the shared viewer, and the Gallery block's view module and stylesheet load on that page. Any other link (a page, `#`) stays ordinary. Without JavaScript the link opens the file.
- A Featured Image block with the class has no link to its file, so the server wraps the picture in a link to the full-size file, with an `aria-label` built from the alt text.
- The dialog is printed once per page. The Gallery block prints it inside its router region (ADR-049) when the page has one. Otherwise it is printed in the footer, and only when an opener asked for it.
- The viewer has a single-item mode, used by openers and by a Gallery with one tile. It hides the counter, Previous and Next, the thumbnails and the phone's step bar.
- Event poster: a Group `ts-poster` holds the Featured Image and a caption row with "Event poster" and "View full size". The link is a core Button drawn as plain text (`ts-poster-link`) with the `open_in_full` icon of ADR-067, which now has 17 icons. Its URL is bound to a new Block Bindings source, `tekseries/featured-image` (key `url`). The frame is left out when the post has no featured image.
- "See video": a Group `ts-photo-pill` holds the photo and a Buttons block over its bottom-left corner. The pattern's link is `#`, because a theme pattern has no video of its own, and a site's page links it to a video file.
- The event sidebar stack is now `flexWrap: nowrap`, because in a wrapping column a poster file narrower than the column spilled over what followed. Other vertical stacks still wrap.

**Rationale:**
- One dialog and one script: the Gallery's viewer already handles photos, videos, focus, Escape and reduced motion, and is tested for accessibility.
- A class on core blocks keeps templates and patterns editable (ADR-005), lets an editor make any link to a media file an opener, and follows the class-keyed filters of ADR-037.
- Block Bindings give the Button its address without a custom block.
- Consequences:
  - A page with an opener loads the Gallery block's whole stylesheet and view module, though only the viewer is used.
  - Each opener costs one database lookup per page view, to find the attachment by its address.
  - A vertical stack that gets a picture sized this way needs `flexWrap: nowrap` too.

## ADR-072: Give news posts a video through ACF fields and a Post Video block, and play YouTube and Vimeo links in the viewer from an address the server builds

**Status:** Accepted

**Context:**
- The owner asked for news posts to carry a video: a switch, then an uploaded file or a YouTube or Vimeo link, plus a thumbnail, opening in the Gallery's viewer.
- ADR-071 made the viewer available outside the Gallery, for photo and video files only.

**Options:**
- Core's Video and Embed blocks in the post's content. They load the provider's player with the page and sit in the text, not in a card.
- WordPress oEmbed (`wp_oembed_get`). The server prints whatever markup the provider returns.
- Post meta registered by the plugin with a custom sidebar panel, as for tone and icon (ADR-032), instead of ACF fields.
- ACF fields with a dynamic block (chosen).

**Decision:** The last option, in 1.13.0.
- An ACF group "Video" on posts, registered in code like the event fields (ADR-010, ADR-035), holds a switch (`tekseries_video`), a video file (`tekseries_video_file`), a URL (`tekseries_video_link`) and a thumbnail (`tekseries_video_thumbnail`). The last three show once the switch is on. The group is exposed over REST.
- `tekseries/post-video` is a dynamic block with no settings, placed after the post content in the single post pattern. It prints nothing unless the switch is on and the post has a video file or a YouTube or Vimeo link. A file wins over a link.
- The card is 16:9, with the Gallery's play disc. Its picture is the thumbnail, else the file's poster, else a plain plum card. The card is a link to the file or to the video's own page, so it works without JavaScript.
- `tekseries_blocks_video_embed()` accepts only YouTube and Vimeo links, including the private hash of an unlisted video. It builds the player's address itself from the video's ID, on `youtube-nocookie.com` or `player.vimeo.com`, with autoplay. Autoplay is sent because the visitor has just asked for the video, though a browser may still hold playback. Any other link gives no card.
- An item in the viewer can carry an `embed` address. The `<iframe>` exists only while the viewer is open on such an item, so closing the viewer removes the frame and stops the video without adding a history entry.

**Rationale:**
- Building the address from the ID alone means no markup or address from another site reaches the page, and the two hosts are fixed in code, as in ADR-069.
- A frame that exists only while the viewer is open keeps third-party requests behind a visitor's own click.
- ACF is already required for the event fields (ADR-010), and it gives editors a file picker, a URL field and conditional fields with no editor code. A block in the template shows the card in the same place on every post.
- Consequences:
  - A visitor who opens a linked video makes their browser contact YouTube (its no-cookie domain) or Vimeo, so the Privacy Policy may need a line, as for the Contact map (ADR-069).
  - A post with a video loads the Gallery block's stylesheet and view module (ADR-071). Without ACF the block prints nothing.
  - Tests stub YouTube and Vimeo, so real playback is not exercised by the test suite.

## ADR-073: Carry what the owner saved in the Site Editor, and the media made on the development site, in the release bundle

**Status:** Superseded by ADR-078 (carrying saved templates, parts and menus only; the rest stands)

**Context:**
- The owner sets up the live look on the development site, and asked that the header, footer "and any other such changes I make in the Editor" go into the bundle.
- The live host takes only wp-admin uploads (ADR-059). The bundle (ADR-058, ADR-059) did not carry template parts, templates, menus, Site Editor styles or media uploaded on the development site.
- The development site's header, footer and four templates were saved copies. The header pointed to a menu by ID, and Home used photos and a 47 MB video uploaded there. Those IDs belong to unrelated posts on live.
- A saved copy replaces the theme's file and stops following theme releases.

**Options:**
- Redo the editor work by hand on live. It is slow and error-prone.
- Move every owner edit into the theme's patterns. Each wording change would need a release, and it cannot carry media or menus.
- Carry every saved template and part as it is. It would also freeze `single-event`, a copy with no change in it.
- Put the large video in the migration plugin's zip. The live host may refuse a 48 MB upload.
- Extend the bundle and the one-off migration plugin (chosen).

**Decision:** The bundle and the migration plugin (1.1.0) carry the owner's Site Editor work and its media. The export script and the plugin stay outside the repository (ADR-058, ADR-059), and the released plugin and theme are unchanged.
- The export adds saved template parts and templates, the menus they point to, and the theme's Site Editor styles, including Additional CSS.
- A saved template or part that matches the theme's file is left out. Only the editor's own rewriting is ignored in that comparison, so it can carry too much but never too little.
- Media Library files that the carried texts or albums use, and that live lacks, travel with their title, caption and alternative text. A file over 5 MB goes in an `upload-first` folder, which the owner uploads first.
- On live, the plugin uploads each file, or finds a hand-uploaded one by size and SHA-1. It marks each upload and menu with `_tekseries_migration_source`.
- Before saving any text, it rewrites media IDs, media addresses and menu IDs to live's values. Album membership and video posters use the same mapping.
- Two refusals join those of ADR-059: an `upload-first` file missing from the Media Library, and a blocks plugin or theme older than the bundle.
- The export lists what it carries and leaves out, and warns about saved content it does not carry.
- Deleting the plugin keeps the marks, so a later bundle reuses the same uploads and menus. The rest of ADR-059 stands.

A rehearsal on a throwaway site set up like live passed every check, including a seeded ID clash. Not verified: a run on live, the live host's upload limit, and real Site Editor styles.

**Rationale:**
- The owner works in the editors, and uploads are the only road to live, so the bundle must carry what the editors save.
- IDs from the development site cannot be trusted on live, so they are rewritten before saving.
- An unchanged saved copy would only freeze a template.
- Consequence: after the migration, live's header, footer and three templates come from the database. A later theme change to them needs the same change in the saved copy, or a reset. Moving the `ts-intro` marks and the footer line into the patterns was offered to the owner.

## ADR-074: Count down to events in Nigerian time, and never print a clock the server cannot keep right

**Status:** Accepted

**Context:**
- The owner asked for a countdown on upcoming events, on the Events page and on each event's own page (release 1.14.0). An event had a date (`event_date`) and a free-text "Time", which a script cannot count down to.
- WordPress's clock is on UTC, but events are announced in West Africa Time (UTC+1).
- Live is behind a page cache, and the server's HTML must work without JavaScript (ADR-005).
- ADR-035 ended an event once its date passed in the site time zone. This ADR changes that detail and does not supersede ADR-035.

**Options:**
- Set WordPress's time zone to Lagos. It would shift every post's time.
- A time zone field on every event. It is more to fill in, for a case that has not come up.
- Print the full clock from the server and let the script correct it. A cached page, or a visitor without JavaScript, would see a wrong clock that does not move.
- List the script in `block.json` (`viewScriptModule`). It would load wherever the block is placed, even where every event is past.
- Parse the free-text "Time" field. It is written for people and cannot be relied on.
- Block Bindings alone (ADR-035). A ticking figure needs behaviour.

**Decision:**
- Block `tekseries/event-countdown` is dynamic, with an Interactivity API script. It reads the event from block context, so one block serves the event page and the cards in a Query Loop. It has a full size with tiles and a compact line such as "In 13 days".
- A new optional ACF field, "Start time" (`start_time`), is added. With it, the countdown runs to that moment. Without it only calendar days count.
- Days and start times are read in `Africa/Lagos` through `tekseries_blocks_event_timezone()` and its filter, not WordPress's setting. The "has ended" rule of ADR-035 uses the same Nigerian day, so an event ends at midnight in Nigeria. The start reaches the browser as an absolute instant, so every visitor sees the same time left.
- From the start to the end of the event's day the block says "Happening now" ("Today" without a start time), then prints nothing.
- Server output holds only what stays true for a while: the whole days, the compact line and a screen-reader sentence. The ticking tiles appear once the script runs and are hidden from screen readers.
- The script is its own entry, an exception to ADR-047's one module per block, and `render.php` enqueues it only when it prints a countdown. The arithmetic is written twice on purpose, in TypeScript and PHP, and the look uses the theme's tokens because there is no board.

**Rationale:**
- A fixed zone read in code does not depend on a setting that also governs posts and schedules.
- Printing only stable values means a cached page or a visitor without JavaScript never sees a wrong, frozen clock.
- A start time field is reliable where the free-text "Time" is not. Leaving it optional keeps older events working in days.
- Consequences: the two copies of the arithmetic must stay alike (the e2e spec compares them). For a visitor without JavaScript, a cached compact line can be a day out just after midnight. Events in another zone would need the filter or a per-event field.

## ADR-075: Open Formbricks forms from marked buttons, and load Formbricks' script only when a visitor reaches for one

**Status:** Superseded by ADR-076 (fallback, focus and settings; the rest stands)

**Context:**
- The owner asked for two "Website & App" forms ("Upload your CV", "Apply for the Maker's Prize") to open over the page from their buttons. Formbricks is self-hosted and run by a partner company, Beekomm Technologies Limited.
- Such a survey needs Formbricks' script on the page, set up with the server's address and an ID. It opens when an action fires, such as a code action fired with `formbricks.track( key )`.
- Four buttons are links in page content, patterns and the single job template. Their link was `#`.
- ADR-005 applies: only our own Interactivity API code runs for visitors (rule 1), and the server's HTML works without JavaScript (rule 3).

**Options:**
- Formbricks' snippet in the `<head>` of every page. Every visitor would load a third-party script for two buttons most never press.
- A no-code click action in Formbricks. A script of ours is still needed, and matching by text breaks when a label changes.
- "Link" surveys in a new tab or an iframe. They are not the form over the page that the owner asked for.
- A custom block for the button. A class on core Buttons follows the `ts-lightbox-open` and `ts-icon-*` convention (ADR-071, ADR-067).
- The two values in `wp-config.php`. The owner has wp-admin only on live (ADR-059).

**Decision:** In 1.15.0, a class marks the button, our own module loads Formbricks late, and the link stays real.
- Marking: a core Button with the class `ts-survey-<key>` opens the survey triggered by the code action `<key>`. A `render_block` filter adds the directives, as ADR-071 does for `ts-lightbox-open`, and the single job template calls the same helper. A later form needs no code, only a new action key in Formbricks and the class on a Button.
- Settings: a Settings, Forms (Formbricks) screen stores the server address (https only), the ID and the ID's name in one plugin option, `tekseries_blocks_formbricks`. Neither value is a secret, because both are in the page for anyone to read. Until both are set, marked buttons stay plain links and no script loads.
- Script: the store `tekseries/surveys` does what Formbricks' own snippet does, but not on page load. It starts on the first sign that a visitor is going for a marked button, which is the pointer over it or keyboard focus. A click then fires the action.
- Fallback: the link is followed with JavaScript off, on a modified click, and when Formbricks cannot be reached or does not answer within 8 seconds.
- Third-party content: Formbricks' script and survey are an exception of the same kind as reCAPTCHA on the job form (ADR-007), the Google map (ADR-069) and the YouTube and Vimeo players (ADR-072).

**Rationale:**
- Loading on first approach keeps the script away from visitors who never reach for a button, as with ADR-072's frame that exists only after a click. The first press can wait on the script's download, so hovering or focusing the button starts it early.
- The button is a working link without JavaScript, so a blocked or slow Formbricks costs the visitor only the form. A class on core Buttons keeps them editable in the Site Editor (ADR-005), and wp-admin settings suit a host with no file access.
- Consequences:
  - Answers and uploaded CVs leave the site for the Formbricks server run by Beekomm Technologies Limited. The Privacy Policy needs a line for it, which was suggested to the owner, who writes that page.
  - The forms depend on Formbricks settings the site cannot check: the survey type, the action's key, and "Keep showing while conditions match" with "Ignore Cooldown Period", without which a form shows once per visitor. The settings screen lists them.
  - A blocker that stops Formbricks' script sends the visitor along the button's link, so each button needs a useful link, which is still open with the owner. The buttons were tested against a stand-in for Formbricks' script, not the owner's Formbricks.

## ADR-076: Follow the link when no Formbricks form appears, manage focus ourselves, and keep one ID setting

**Status:** Accepted

**Context:**
- ADR-075 is recorded but not yet merged or tagged, so this entry corrects it rather than rewriting it.
- The buttons were tested against the owner's self-hosted Formbricks 4.5.0, which the owner keeps on purpose. On a wrong ID, a server error or an action with no published form, Formbricks' `setup()` and `track()` calls finish normally and nothing opens. ADR-075's fallback covered only a script that could not be loaded.
- Formbricks 4.5.0 draws its form at the end of the page with no dialog role, leaves focus on the button behind it, and Escape does not close it.
- It knows only `environmentId`, though it shows a "Workspace ID" and an "Environment ID". ADR-075's third setting (the ID's name) defaulted to Workspace ID, which opened nothing and gave no message.

**Options:**
- Fallback: follow the link only when the script fails to load (ADR-075). Or wait for Formbricks' panel and follow the link if it does not appear (chosen).
- Focus: leave it to Formbricks. Or move it ourselves (chosen).
- ID name: keep the setting and change its default. Or remove it and pass the ID under both names (chosen).

**Decision:**
- Fallback: after firing the action, the script waits up to 8 seconds for Formbricks' panel. If none appears, it follows the button's link, and a `#` link still does nothing. This replaces the fallback line of ADR-075.
- Focus: when the form opens, focus moves to the first thing the keyboard can reach in it, and when it closes, focus returns to the button. Neither happens if the visitor has moved focus elsewhere. Escape is Formbricks' code and is left alone.
- Settings: the ID's name setting is removed. The option `tekseries_blocks_formbricks` holds `url` and `id`, the script passes the ID as both `workspaceId` and `environmentId`, and the help says to copy the Environment ID.
- Links: the owner chose to keep the four buttons' links as `#` for now, and to add real fallback links if the popup fails to load repeatedly.

All four buttons were checked on the development site, where each opens its real form. Nothing was submitted.

**Rationale:**
- Watching for the panel covers every way a form can fail to appear, which keeps rule 3 of ADR-005 true for the real server.
- Moving focus is the smallest fix we own for keyboard and screen-reader visitors left behind the form. One ID passed under both names works on old and current Formbricks and removes a setting that gave no error when wrong.
- Consequences:
  - With `#` links, a visitor whose form does not appear sees nothing happen. This is accepted until the failure is seen in practice.
  - The check relies on Formbricks' internal panel markup, so an upgrade needs a retest.
  - Nothing is fetched from Formbricks before a visitor reaches for a button. Formbricks sets no cookie and keeps one local-storage entry.

## ADR-077: Move a focused block into place early only for keyboard focus, so a press still sends its click

**Status:** Accepted

**Context:**
- ADR-062 overrides a focused block with `opacity: 1 !important; translate: none !important` on `:focus-within`. That also matches when a link is pressed with a mouse or finger, because the press gives the link focus.
- Found while testing form buttons (ADR-075, ADR-076): a block still rising in jumped to its final place between press and release. The jump was 28px for the Home hero's first slide and `ts-intro` blocks (ADR-063), and up to 84px for a `ts-reveal` card (ADR-060). The release landed beside the link, so the browser sent no click.

**Options:**
- Leave it. The window is about a second, but the Home hero's buttons are the most pressed links on the site and are in it when the page opens.
- Drop the override for all focus. Keyboard focus would again sit on something still moving in, which is the reason for ADR-062.
- Ignore presses until the entrance ends (`pointer-events`). The buttons would be dead for a second.
- Split the override by kind of focus (chosen).

**Decision:** The last option, in 1.15.1, in CSS only.
- Any focus still sets `opacity: 1 !important`.
- Only keyboard focus (`:focus-visible` on the block or anything inside it) also sets `translate: none !important`. Under a pointer press the block keeps gliding in, so the pointer stays on the link and the click is sent.
- The animation is left alone in both cases, so nothing replays. The rest of ADR-062 stands, including which children the reveal rule names.
- The rules for `ts-reveal`, `ts-intro` and the hero carousel's first slide change, and their specs gain a case that presses a link during a slowed entrance.

**Rationale:**
- A click needs the pointer on the same element at press and release, so the block must not move under a press. A keyboard user has no such need and still gets a settled block under the focus ring.
- Consequences:
  - It needs `:has()` and `:focus-visible`. The theme already relies on `:has()` and on `:nth-child(n of S)` (ADR-063). Without `:has()`, a keyboard-focused block shows at once but is not moved into place early, which is harmless.
  - A text field focused with the pointer matches `:focus-visible`, so its block snaps into place on a press. Nothing is lost, because the field already has focus.

## ADR-078: Keep the owner's Site Editor choices in the theme's patterns, and keep no saved copies of the theme's templates and parts on the development site

**Status:** Accepted

**Context:**
- The owner sets up the live look on the development site. A saved copy wins over the theme's file, so ADR-073 made the bundle carry the saved footer, header and four templates to live, and each release that changed one had to patch the copy too.
- The owner asked: "Move my edits into the theme."
- Comparing every saved copy and page with the theme's files showed the edits:
  - The class `ts-intro` on the plum hero band of three templates and five pages, and `ts-reveal` on Home's and Contact's cards and tiles.
  - New wording on the two Home slides and the case study, and a new footer line.
  - The saved header and single-event template held no change of the owner's.

**Options:**
- Keep carrying saved copies in the bundle (ADR-073 as it was). Both sites would run on database copies that every release must patch.
- Move only the three template marks and the footer line. A fresh install or a hand-inserted pattern would not look like the site.
- Move everything into the theme and reset the saved copies (chosen).

**Decision:** The last option, in 1.13.1.
- The edits went into the pattern generator and the sixteen generated patterns were regenerated. The hand-written footer pattern was edited directly, and the event type pages' band shares the Events band, so it is marked too.
- The theme's files were first shown to draw the same pages as each saved copy. Then the six saved copies on the development site were moved to the trash rather than deleted, and their content was backed up outside the repository. The reversible way was used because the owner had not answered that question in words. The owner was told.

**Rationale:**
- Both sites follow the theme's files again, so a release that changes a template needs no matching patch.
- Moving the page-level marks and wording too means a fresh install or a hand-inserted pattern looks like the site.
- Consequences:
  - The bundle carries no template parts, templates or menus unless the owner saves one in the Site Editor again, and then it carries it as ADR-073 describes. ADR-073 is partly overtaken.
  - Photos, portraits, partner logos, the video link and the contact form block stay page content, because a pattern can only use pictures that ship inside the theme. Page patterns are starting content, so no existing page changes, and existing pages keep the owner's edits.
  - ADR-063 said no page or pattern carried `ts-intro` yet. Nine hero bands now do.

## ADR-079: Tell each Formbricks form which button opened it, with a second class `ts-entry-<value>`

**Status:** Superseded by ADR-082 (entry values only; the rest stands)

**Context:**
- This builds on ADR-075 and ADR-076 and supersedes neither.
- The owner added a hidden field `entry_point` to the Formbricks forms and asked for `?entry_point=home_job_series` in the CV form and `?entry_point=home_makers_prize` in the Maker's Prize form, "so each record shows which button was clicked".
- A "Website & App" survey (ADR-075) takes hidden fields from the page's script through `formbricks.track`. The owner's Formbricks 4.5.0 keeps only the fields the survey declares.
- The buttons' links are `#` (ADR-076), so a link address cannot carry the value.

**Options:**
- The value in the button's link as `?entry_point=…`. The links are `#`, the popup does not read the link, and a real link would be followed without JavaScript.
- A second class `ts-entry-<value>` on the Button, next to `ts-survey-<key>` (chosen).
- A prefix `ts-survey-entry-…`. The existing `ts-survey-<key>` rule would read it as an action key if it came first.
- An editor panel on core Button. It is more code for one value.
- Working the name out from the page and section. The markup has no reliable section name, and the owner wants to choose the names.

**Decision:** The second option, in 1.16.0.
- A Button with `ts-survey-<key>` and `ts-entry-<value>` (letters, digits, `_`, `-`) passes the value to Formbricks as the hidden field `entry_point` when the survey opens. The field's name is fixed in code. Without the class nothing is sent. The single job template passes `job_listing` to the same helper.
- The site's buttons follow a `<page>_<section>` pattern: `home_job_series` (Home "Upload your CV") and `home_makers_prize` (Home "Apply for the Maker's Prize"), both the owner's names, then `job_series_hero` (the Job Series hero) and `job_listing` (each job's "Upload your CV to Job Series"). The job itself is in the page address that Formbricks records.
- The classes are in the theme's patterns and on the development site's Home and Job Series pages, so they reach live with the migration bundle (ADR-073, ADR-078).

An e2e spec with a stand-in for Formbricks' script, and a check with the owner's real 4.5.0 script and stand-in forms, showed each of the four buttons' forms receiving its value. Not verified: the owner's real forms, because their server listed no active "Website & App" form at the time.

**Rationale:**
- A class works while the links are `#` and in the editor, and follows the convention of the action key (ADR-075, ADR-071, ADR-067). A class cannot hold `?` or `=`, so it holds only the value.
- Passing the value through `track` is how Website & App surveys take hidden fields, and it leaves the link and the no-JavaScript fallback unchanged (ADR-005 rule 3, ADR-076).
- Consequences:
  - Each form must declare `entry_point` as a hidden field. Otherwise it still opens, records no name, and Formbricks logs a console error.
  - When real fallback links come (ADR-076), a link to a Formbricks Link survey should carry `?entry_point=…` itself, which the site does not add.
  - The `job_listing` name is in code, not in the editor.

## ADR-080: Keep the theme's own motion values instead of mapping the design system's `animation` tokens

**Status:** Accepted

**Context:**
- The latest design pull brought the design system's first `animation` tokens (`docs/design-reference/design-system/tekseries/tokens.json`).
- The theme has mapped its tokens from the design system, which wins over the canvas's embedded copy (ADR-009).
- The design system's motion values differ from the build's in easing, rise distances, durations and hover timing. The build's sit in `settings.custom.motion` in `theme.json` (ADR-060), in the theme's CSS and in the Stat block. The build keeps its entrance and gentle easings, a 24px scroll-reveal rise, a 64px pillar rise over 0.9s, card contents at 20px, 0.7s and 0.1s, its count-up easing and 150ms hover transitions.

**Options:**
- Map the design system's `animation` tokens into `settings.custom.motion` and the rules. This changes the easing, distances and timing the owner has already seen and accepted.
- Keep the build's values and ask Claude Design to change its tokens to match (chosen).
- Keep the build's values and leave the two sets to drift. Later pulls would show a difference nobody has judged.

**Decision:** The second option, as the owner decided for release 1.16.1. The theme keeps its own motion values and does not map from the design system's `animation` tokens.
- For motion only, this reverses the rule that the theme maps its tokens from the design system. Colours, type, spacing and radii still map from it.
- The owner will ask Claude Design to change its tokens to the build's values. When a later pull shows them matching, mapping them is a no-op and can be done with the theme-tokens unit test.

**Rationale:**
- The owner has watched and approved the build's motion (ADR-060, ADR-063), and the design system's values would change the site's feel for no gain.
- Changing the design system to match keeps one source of truth, which is simpler than carrying two sets of numbers in the theme.
- Consequences: nothing changes on the site in 1.16.1, and `docs/design-reference/` keeps the design system's values verbatim because that folder is never hand-edited.

## ADR-081: Keep one deadline per page as page meta, and switch open and closed states on the server and again in the browser

**Status:** Superseded by ADR-084 (the fixed Nigerian-time reading and the two picker consequences only)

**Context:**
- The design update adds a Maker Prize page (built in 1.18.0) with a countdown to 1 December 2026, 11:59 PM WAT. After the deadline, "Apply now" becomes a disabled "Applications closed" button and a winners line appears.
- Live is behind a page cache, and the server's HTML must work without JavaScript (ADR-005).
- WordPress's clock is UTC, and event times are already read in Nigerian time (ADR-074).
- Several blocks on the page must agree on one moment.

**Options:**
- Where the deadline lives: an ACF field (ADR-010), or registered page meta (chosen).
- How blocks get it: a block attribute on each block, or one value on the page (chosen).
- Where the state switches: in the browser only, or on the server plus a browser swap (chosen). In the browser only, a closed page would still print the Apply link and load the Formbricks script (ADR-075), and without JavaScript it would show "open".
- The countdown: reuse the event countdown block (ADR-074), or a new block (chosen).

**Decision:** Released in 1.17.0.
- Field: page meta `tekseries_deadline` on `page`, read in Nigerian time through `tekseries_blocks_event_timezone()` (ADR-074) and REST-visible. An invalid value is stored as empty, and empty means no deadline. It is not an ACF field.
- Block: `tekseries/deadline-countdown`, dynamic, with a tiles view and a days line such as "12 days left to apply", or "Last day to apply" in the last 24 hours. It prints nothing on a page without a deadline. Once closed, the days line prints nothing and the tiles show 00, dimmed.
- States: a block with the class `ts-when-open` shows before the deadline and one with `ts-when-closed` after it. The server decides this before the survey link is built, so a closed page prints no Apply link and loads no Formbricks script. A page without a deadline is always open. On a page made before the deadline, closed blocks are printed `hidden` and the script swaps both kinds at zero.
- A Button set to be a `<button>` with the class `ts-disabled` gets `disabled`.
- The script is not listed in `block.json`. It is enqueued only while something counts down on an open page, whether that is the block itself or a `ts-when-*` block. This is the exception ADR-074 made to ADR-047. A closed page loads no script.
- Server output holds only what stays true for a while: the days, the days line and a screen-reader sentence by whole days. The hours, minutes and seconds wait for the script, as in ADR-074. The arithmetic and the words are written twice, in TypeScript and PHP, and must be kept alike. Words are [ one, many ] pairs, which fixes the board's "1 days" and "0 days left".

**Rationale:**
- Page meta works without ACF (ADR-032), and the editor sidebar and the migration can set it. One value keeps every block agreeing, where attributes could drift apart.
- Deciding on the server keeps a closed page free of the Apply link and the Formbricks script, and keeps rule 3 of ADR-005 true. The browser swap covers a page made before the deadline.
- The event countdown reads event fields and an event day, so a new block is simpler than bending it.
- Consequences:
  - A page cached while open stays open until the script swaps it at zero, or, without JavaScript, until the cache expires. The owner should also close the form in Formbricks at the deadline. Deadline dates written in the page's copy are plain text and must be changed by hand, as the help text says.
  - The editor's date-time picker has no seconds, so 11:59 PM is saved as 23:59:00, a minute before the design's 23:59:59. The migration and the page's own value use 23:59:59.
  - The picker works in the site's time zone (UTC) and may show a "UTC" note, while the value is read as Nigerian time. The help text says so.

## ADR-082: Give the Maker's Prize its own page, and open its form with the existing code action, not the board's id hook

**Status:** Accepted

**Context:**
- The design update adds Maker Prize boards, open and closed. They hook "Apply now" for a no-code Formbricks click action with `id="maker-prize-apply"` on both Apply links, so the id is duplicated on the page.
- Home's Pillar III button "Apply for the Maker’s Prize" opened the form itself, with entry value `home_makers_prize` (ADR-075, ADR-079).
- The migration plugin's runner (ADR-059) updates existing pages and creates menus, but does not create pages.

**Options:**
- Keep the form on Home only and add no page. The boards would have no place to live.
- Use the board's id hook. A no-code action is set up in Formbricks, not in our code, a repeated id is invalid HTML, and it would bypass the entry value (ADR-079).
- Use the existing code action (ADR-075) on the new page (chosen).
- Ship the page as a pattern only and have the owner create it on live by hand. The migration plugin can do it, and the owner has wp-admin only (ADR-059).

**Decision:**
- Page: `/maker-prize/`, from the pattern `tekseries/page-maker-prize`, with the template `page-no-title`. Its deadline is page meta (ADR-081).
- Home: the Pillar III button becomes a plain link to `/maker-prize/`, and entry value `home_makers_prize` is retired. ADR-079's list of values is now `home_job_series`, `job_series_hero`, `job_listing`, `maker_prize_hero` and `maker_prize_cta`.
- Apply links use the class `ts-survey-makers-prize` with `ts-entry-maker_prize_hero` or `ts-entry-maker_prize_cta`. ADR-075 stands, and the board's id hook is rejected.
- Breadcrumbs: the page sits under Home's What We Do. `tekseries_breadcrumb_sections()` maps page slug to section crumb and is filterable through the filter of the same name. Only `maker-prize` is in it.
- Live: migration plugin 1.3.0 creates the page, with its template and `tekseries_deadline`, before it updates pages and posts. It marks the page with `_tekseries_migration_source` like the menus it creates, updates it on later runs, and skips an unmarked page already at that slug.

**Rationale:**
- The code action keeps one way to open forms, with the entry value recorded, the link fallback of ADR-076 and no duplicate id.
- A page of its own gives the boards a home and Home a real link that works without JavaScript (ADR-005).
- A filterable map keeps the breadcrumb rule out of the page and open to the next page that needs a section. The mark lets a later bundle find the page it made and leaves an owner-made page untouched, as with menus.
- Consequences:
  - Answers already in Formbricks keep `home_makers_prize`. New ones carry the page's two values.
  - On live, the runner must create the page before it updates Home, or Home would link to a missing page for a moment.
  - The owner should set the Formbricks form to close at the deadline too, because a cached page can stay open past it (ADR-081).

## ADR-083: Pick a video's poster from frames grabbed in the editor's browser

**Status:** Accepted

**Context:**
- The owner wanted to choose a Gallery video's poster from three frames across the video, when uploading a video and adding it to an album. The one existing poster was made by hand.
- The Gallery, the viewer and the Post Video card already read a video's featured image as its poster (ADR-045, ADR-072).
- The live host has no SSH or WP-CLI (ADR-059), so the picker must work through wp-admin alone, and the owner asked for no third-party plugin.
- The owner chose the middle frame, set automatically for a video with no poster that is in an album and is opened in wp-admin.

**Options:**
- Server-side ffmpeg. The live host has no shell.
- A third-party plugin such as Videopack. The owner said no, and it is heavy for one job.
- Grab a frame on upload, in the background. An upload over REST or from a phone has no page open to grab it in.
- Grab the frames in the editor's browser with `<video>` and `<canvas>` (chosen).

**Decision:** The last option, in 1.19.0.
- A "Poster frame" row appears in a video's details, in every media modal and on Edit Media. It is a placeholder with no inputs, so core saves nothing from it.
- The picker grabs three frames at 25, 50 and 75% of the video. "Show other frames" picks three new moments between 10 and 90%, and a slider with "Use this moment" picks an exact one.
- The chosen frame is uploaded as a JPEG over core REST and set as the video's featured image. The front end is unchanged.
- Attachment meta `tekseries_poster_of` holds the video's ID on a JPEG the picker made. Picking again deletes the old poster only when it carries this video's ID, so a poster added by hand is kept.
- A video in an album (ADR-044) with no poster gets its middle frame when it is opened in wp-admin.
- Access is admin only, with `upload_files` and `edit_post` checked. The script is plain TypeScript with no React, and visitors load nothing (ADR-005).

Unit tests for the frame helpers and an e2e spec with a real short clip passed.

**Rationale:**
- The browser can decode and draw a video on any host, so the picker works on Local and on live with wp-admin alone.
- Reusing the featured image needs no front-end change and leaves the Featured Image box as a fallback. The marker means only a poster the picker made is ever deleted.
- Consequences:
  - The automatic frame needs a browser. It does not run on an upload over REST, and on live it waits until someone opens the video.
  - A video the browser cannot decode, such as some .mov or HEVC files, gets a message, and the Featured Image box still works.
  - On Edit Media the form's hidden `_thumbnail_id` is kept in step with the pick, so Update does not undo it.

## ADR-084: Read a page's deadline in a time zone chosen for that page

**Status:** Accepted

**Context:**
- The owner decided (release 1.20.0) that a non-technical admin sets the deadline's date, time and time zone from the Deadline Countdown block's settings.
- ADR-081 fixed the deadline to Nigerian time (ADR-074). Its picker has no seconds, so 11:59 PM saved as 23:59:00, a minute short of the design's 23:59:59.

**Options:**
- One site-wide zone through the filter `tekseries_blocks_event_timezone`. It cannot differ between pages.
- A zone per page as page meta (chosen).
- Format the preview with `Intl` alone. It lacks zone abbreviations such as WAT.
- Format the help text with `dateI18n` from `@wordpress/date`, with `Intl` for the preview's arithmetic (chosen).
- A seconds field or checkbox. It adds a control that editors must understand.
- A fixed rule for seconds (chosen).

**Decision:**
- Page meta `tekseries_deadline_timezone` is a REST-visible string on `page`, sanitised against PHP's `timezone_identifiers_list()`. Empty means Nigerian time, so existing pages keep WAT and the migration is unchanged.
- `tekseries_deadline` stays a wall time, `Y-m-d\TH:i:s`. `tekseries_blocks_deadline_wall_time()` checks it in UTC, so a time skipped by a clock change still makes a deadline and does not leave the page open.
- PHP's zone list reaches the editor as `window.tekseriesDeadline`, because the names from `Intl.supportedValuesOf` differ. The preview uses `zonedTime()` in `src/deadline-countdown/time.ts`, which matches PHP 8.2 for skipped and repeated hours under a unit test. The help text names the exact moment with `dateI18n`.
- A time picked at :59 saves :59 seconds, and any other minute saves :00, so 11:59 PM is 23:59:59. Core's UTC note under the picker is hidden in this panel.
- `view.ts`, `render.php` and the phase filter are unchanged, and visitors still get only the millisecond moment.

**Rationale:**
- The zone belongs to the page, as each deadline has its own place and hour. Empty meaning WAT means nothing is migrated.
- PHP's list keeps the editor's names the same as the ones the server accepts. A rule for seconds needs no new control and removes the minute's gap.
- This changes ADR-081 in three places: its Nigerian-time reading of `tekseries_deadline` becomes the page's zone with WAT as the default, and its consequences on the missing seconds and on the UTC picker note no longer hold. The rest of ADR-081 stands.
- Consequences:
  - The zone arithmetic exists twice, in PHP and `time.ts`, and must stay alike, as for the countdown (ADR-074).
  - `@wordpress/date` has zone data to 2030, so labels for later deadlines use the last known rules.
  - A minute other than :59 cannot be given seconds.

## ADR-085: Set a block's deadline behaviour and the closed button from a "Deadline" panel in the block sidebar

**Status:** Accepted

**Context:**
- The owner decided (release 1.21.0) that a non-technical admin runs the whole deadline flow from block settings.
- Under ADR-081 the admin typed `ts-when-open` or `ts-when-closed` into Advanced > Additional CSS classes. The disabled "Applications closed" button needed the code editor, because `core/button` has no UI for `tagName` in WordPress 7.1.

**Options:**
- Block attributes or a block-supports extension. Saved markup would depend on the plugin and the server would need changes.
- Class tokens, as the Button icon panel does (ADR-067) (chosen).
- A panel under Advanced. The admin would not find it.
- A panel of its own in the default settings group (chosen).
- `ToggleGroupControl`. It is still `__experimental` in 7.1.
- `RadioControl` (chosen).
- A custom "Applications closed" block. It duplicates `core/button` and its styles.
- `core/button` with a toggle (chosen).

**Decision:**
- `src/deadline-tools` is editor only, enqueued from `includes/editor.php`, so visitors load nothing (ADR-005).
- A "Deadline" panel in the default settings group shows only on pages, for blocks that support `customClassName`, when the page has a deadline or the block already carries a token. The Deadline Countdown block is left out, as it has its own panel (ADR-084).
- A `RadioControl` offers Always, Before the deadline (`ts-when-open`) and After the deadline (`ts-when-closed`).
- On a before-the-deadline block, one action inserts its twin after it. For a Button the twin is a disabled "Applications closed" button (`tagName` `button`, classes `ts-icon-lock ts-disabled ts-when-closed`), as in the Maker Prize pattern (ADR-082). For any other block the twin is a copy with the token swapped.
- A Button toggle, "Applications closed button (disabled)", when on, sets `tagName` `button` and `ts-disabled`, clears `url`, `linkTarget` and `rel`, and adds the lock icon unless the button has an icon. When off, it makes the button a link again with no URL, to be added from the toolbar.
- The server, `tekseries_blocks_deadline_phase()` and `tekseries_blocks_disabled_button()` (ADR-081) are unchanged.

**Rationale:**
- Class tokens keep saved markup valid without the plugin and need no server change.
- Showing the panel only where a deadline exists keeps every other block's sidebar uncluttered.
- Consequences:
  - The classes stay visible and editable under Advanced.
  - Turning the toggle off loses the link, and undo brings it back.
  - A block whose rendered root lacks its `className` misses the browser swap at zero, as in ADR-081.

## ADR-086: Write a page's deadline into its text with a block bindings source

**Status:** Accepted

**Context:**
- The owner decided (release 1.22.0) that the deadline flow runs from block settings (ADR-085).
- ADR-081 left two written dates as plain text to change by hand: "December 1, 2026, 11:59 PM WAT" in the Maker Prize hero and "Submission Deadline: December 1, 2026." in its band.
- The deadline and its zone are page meta (ADR-081, ADR-084).

**Options:**
- A dynamic "deadline date" block. Core's way for meta is bindings (rule 4).
- A Block Bindings API source (chosen).
- Fixed sentence templates in the plugin. The copy would live in the plugin.
- Text tokens replaced on render. Saved text would show tokens, and the editor could not preview them.

**Decision:**
- Source `tekseries/page-deadline` ("Page deadline") is registered on the server like the job-field sources. Its `format` is `datetime` ("F j, Y, g:i A T"), `date` ("F j, Y") or `time` ("g:i A T"), all translatable, and an optional `after` adds text such as ".".
- Output is `wp_date()` in the page's zone (ADR-084), escaped. It returns null outside a page or without a deadline, so the block's saved text stays as the fallback.
- `src/deadline-tools/bindings.ts` calls `registerBlockBindingsSource` with `getFieldsList` (pages only), so WordPress 7.1's Attributes panel offers "Deadline: date and time / date / time" with a preview. `getValues` reads the edited page's meta, so the text follows the deadline before saving. `canUserEditValue` is false. The formats come from the server.
- A "Deadline date" paragraph variation is added to the inserter. The source is named `page-deadline` because the icon test reads quoted `'tekseries/<word>'` ids as icons, and the name is clearer.
- In the Maker Prize pattern and the Local page, each label and date is a flex-wrap group of a label paragraph and a bound paragraph. A binding replaces the whole content, so the label stays a separate editable paragraph. The fallback text is kept, and a date that does not fit wraps whole under its label.
- The migration export now carries `tekseries_deadline_timezone`, and empty means WAT.

**Rationale:**
- Bindings are core's route for meta, need no new block, and keep the sentence in the page where editors can change it.
- A null return keeps the page complete with no deadline or no JavaScript (rule 3).
- Consequences:
  - Bound paragraphs cannot be typed into. The admin disconnects the binding in Attributes to edit.
  - The live page gets the new markup through the migration bundle. The migration plugin marks the page, so owner edits on live would be replaced.
  - The date formats exist in PHP and are passed to the editor, and the zone arithmetic exists twice, as in ADR-084. For deadlines after 2030 the editor preview uses `@wordpress/date`'s last known rules, and the page is unaffected.

## ADR-087: Mark an ongoing event with an editor switch, not an empty end date

**Status:** Accepted

**Context:**
- The design calls an event ongoing when `event_start` is set and `event_end` is empty. The build has one `event_date` field and no end date (ADR-035), so that rule would mark every event ongoing.
- The owner chose a switch instead.

**Options:**
- The design's rule. It marks every event ongoing.
- An ACF true/false field (chosen).

**Decision:** The ACF field `event_ongoing` marks an event ongoing. Its date reads "Since …", an Ongoing chip follows the type badge, and it is never "ended" and has no countdown (ADR-035).
- The Events page "Happening now" card is a Query Loop whose query carries the custom key `"tekseriesOngoing":true`. Template blocks use the classes `ts-ongoing-only` and `ts-not-ongoing`.
- Texts come from the binding source `tekseries/event-ongoing`, in Nigerian time.
- Card columns start at the top, as the owner's alignment rule says, not centred as on the board.
- Event CTA buttons that link to this site open in the same tab.

**Rationale:** A switch is the only signal the data can carry, and editors set it in the event.
- Texts and states come from one source, so templates stay core blocks (ADR-005).

## ADR-088: Search events by title with `?q=`, updated in place through the router

**Status:** Accepted

**Context:**
- The board's search matches type, date, venue and excerpt, and WordPress's `?s=` switches to the site search template.
- The owner chose a title-only match.

**Options:**
- `?s=`. It leaves the Events page.
- The board's wider match. The owner chose title only.
- `?q=` with a title match (chosen).

**Decision:** The block `tekseries/event-search` (form and status parts) filters the Events page grid loop marked `"tekseriesSearch":true`, 12 a page while searching.
- The Latest card and "Happening now" carry `ts-hide-searching` and hide while searching.
- Results update in place through Interactivity router regions (classes `ts-event-region--*`), as Job Series does (ADR-049). The placeholder is "Search events by name".
- Core numbers a block style variation per instance (`is-style-card-plum--21`), and the router disables the first page's variation stylesheet, which left the footer unstyled. The script re-enables it after each navigation, since a variation's rules are the same for any number.

**Rationale:** `?q=` keeps the Events template and works as a link without JavaScript (ADR-005).
- Re-enabling the stylesheet is safe because the rules do not depend on the number.

## ADR-089: Let a video's poster be a Media Library picture or an upload

**Status:** Accepted

**Context:** ADR-083 offers only frames grabbed from the video. Editors also need a designed picture.

**Options:**
- Frames only. A designed poster could not be used.
- Frames, plus a picture from the Media Library or an upload (chosen).

**Decision:** The "Poster frame" row also opens core's `wp.media` frame, where the editor picks a picture or uploads one, and it becomes the featured image.
- Only posters the picker made (`tekseries_poster_of`) are deleted when replaced, so a Library picture is never removed.

**Rationale:** It reuses core's media frame and ADR-083's marker, with no front-end change.

## ADR-090: List six events per page on event type pages

**Status:** Accepted

**Context:** Event type pages use an inherited query (ADR-026), so the grid took the default page size, not rows of three.

**Options:**
- The default page size. Rows end short.
- `pre_get_posts` sets 6, two rows of three (chosen).

**Decision:** A `pre_get_posts` filter lists 6 events a page on type pages. On paged archives the current type chip stays marked, because the path is compared without `/page/N` (ADR-028).

**Rationale:** Full rows keep the grid even, and the chip stays correct on every page.

## ADR-091: Remove the host's injected contrast style from the page head

**Status:** Accepted

**Context:**
- On live (2026-10-22, after the 1.25.0 migration), GoDaddy's managed-WordPress must-use plugin echoes a style of about 90 KB, `<style id="wp-site-designer-contrast-fallback">`, into `wp_head` after the theme's stylesheet. wp-admin cannot turn it off, and the host has no SSH or WP-CLI.
- Its field rule (`body .wp-site-blocks input:not([type="submit"])…`, `textarea`, `select`) scores (0,8,2). It sets background, colour and border from the `base` and `contrast` colour presets, which the theme does not define. The declarations are invalid at computed-value time, so fields lose their border and background.
- A second rule, `.wp-site-blocks button[type="submit"]:not(.wp-element-button)`, restyles submit buttons.
- Contact (Fluent Forms, ADR-029), the Job Series filters, Post a Job, the Events search (ADR-088) and the job dashboard search were affected. Removing only that element on live restored them, checked with Playwright.

**Options:**
- Out-specify it in every field and button rule across the form, search, listing and job stylesheets. Fragile, many edits, and its `!important` text colours would remain.
- Define `base`, `contrast` and `accent-2` presets. Its rules become valid and impose the host's colours.
- `wp_dequeue_style`. The style is echoed, not enqueued.
- Buffer `wp_head` and remove the element (chosen).

**Decision:** `tekseries_strip_host_contrast_css()` in the theme's `functions.php` runs on `template_redirect`, so on the front end only. It buffers `wp_head` from priority `PHP_INT_MIN` to `PHP_INT_MAX` and removes that one element by id. It does nothing where the id is absent (LocalWP, wp-env).
- The host's other injected styles (`site-designer-shared-pattern-classes`, `site-designer-logo-constraints`) and the `data-dsgo-inline-bg` attribute on the header group stay, because they do no harm today.
- The e2e fixture `specs/fixtures/host-contrast-css.php` is a must-use plugin mapped in `.wp-env.json`. It prints live's two rules verbatim, and `specs/host-css.spec.ts` guards the id, so every e2e run sees what live sees.

**Rationale:** Removing the source fixes every field and button at once, and the theme's own CSS stays simple.
- If the host renames the id, the problem returns, and the spec's fixture only guards the id we know.
- Live needs a recheck after host updates (see Future work).

## Future work

- **Host contrast style on live:** recheck the id and the forms and search fields on live after each host update (ADR-091).
- **Maker Prize page on live:** the migration plugin 1.3.0 creates `/maker-prize/` before it updates Home. What remains is running it on live after the rehearsal (owner; ADR-082, ADR-059).
- **Safari focus check:** confirm on WebKit that a focused animated block is shown at once and does not replay (ADR-062, ADR-063).
- **Intro motion tokens:** when the design system's `animation` tokens match the build's values (ADR-080), map them, and move the 28px distance and 0.15s start of `ts-intro` (and the hero carousel) onto tokens (ADR-063).

- **Large uploads and Site Editor styles on live:** the live host's upload size limit is unknown, and carrying real Site Editor styles has not been exercised (owner; ADR-073).
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
- **Formbricks buttons:** add a Formbricks line to the Privacy Policy (owner). The four links stay `#` for now, and real fallback links follow if the popup fails to load repeatedly (ADR-076).
- **Entry point on the owner's real forms:** retest that each form records `entry_point` once an active "Website & App" form is published and declares the hidden field (owner; ADR-079).
- **Employer self-registration:** only if the owner wants it (ADR-043).
- **Design-system updates:** add the components the boards use but the system lacks (Impact, Insight, Key figure, Pull quote, Pillar badge, anchor chip, marquee) and the missing tokens (`coral-text` from ADR-008, status colours, alpha and radius tokens). Settle the tablet and mobile h1/h2 sizes (the tokens win) and the footer radius (36 / 32 / 24px). Then refresh `docs/design-reference/`.

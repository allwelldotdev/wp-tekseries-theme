# TekSeries

This repo holds the `tekseries` block theme and the `tekseries-blocks` plugin that rebuild tekseries.com, version 1.0.0. Site editors change text, images, links, header, footer and colours in the Site Editor without code, and React never ships to visitors: it runs only in wp-admin (ADR-005). `specs/visitor-scripts.spec.ts` checks this on every kind of public page, and jQuery loads only on the Contact form and the job submission form (ADR-007).

## Requirements

- Node 24.15+ and npm 11+. `.nvmrc` pins Node 24; `engines` also accepts 26+, but not 25.
- Docker, for the wp-env e2e tests only.
- LocalWP running this site. The theme and plugin need WordPress 7.1+ and PHP 8.2+ (ADR-003).
- Advanced Custom Fields, active. The plugin declares it in `Requires Plugins` (ADR-035), and wp-env installs ACF 6.8.10 from `.wp-env.json`.
- WP Job Manager, for the Job Series screens. It's a soft dependency, so events and the rest work without it (ADR-039). wp-env installs 2.4.8 from `.wp-env.json`.
- The `localwp` wrapper, which runs Composer, PHP and WP-CLI inside Local's site environment. Open the site's "Site shell" in Local once so it writes `~/.config/Local/ssh-entry/<site-id>.sh`, then export `LOCALWP_SSH_ENTRY` with that path.

## Setup

```bash
nvm use                                      # Node 24, from .nvmrc
npm ci
npm run build                                # the plugin's blocks and sidebar panel
localwp composer install
localwp wp plugin activate tekseries-blocks
```

The site runs at `https://tekseriescomnew.local`, or whichever domain Local shows, with the `tekseries` theme active.

`build/` is not tracked. Without it the plugin registers no blocks and the e2e tests fail. For theme work, set development mode once, or WordPress serves a cached pattern list.

```bash
localwp wp config set WP_DEVELOPMENT_MODE theme --type=constant
```

Every event and news post has a tone and a topic icon, assigned on first publish (ADR-032). To tone posts that already exist, run `localwp wp tekseries backfill-tones --dry-run`, then again without `--dry-run`.

## Commands

| Command | What it does |
|---|---|
| `npm run check-engines` | Checks your Node and npm versions against `engines`. |
| `npm run lint:js` | ESLint over the plugin, `scripts/`, `specs/`, `tests/`, `types/` and the JS/TS config files. |
| `npm run lint:css` | Stylelint over the theme's CSS and SCSS and the plugin's `src/` and `assets/css/`. |
| `npm run format` | Prettier (`wp-prettier`) over the theme, plugin, scripts, tests and config files. |
| `npm run typecheck` | `tsc --noEmit` over the plugin source, tests and config files. |
| `npm run test:unit` | Vitest unit tests. |
| `npm run test:e2e` | Playwright e2e tests on wp-env. |
| `npm run test:e2e:install` | Installs Playwright's Chromium once. |
| `npm run build` / `npm run start` | Builds the plugin's blocks and post sidebar into `build/` with a blocks manifest, or watches and rebuilds. |
| `npm run icons` | Downloads the plugin's Material Symbols SVGs from Google, for the names listed in `includes/icons.php`. |
| `npm run plugin-zip` | Zips the plugin, `templates/` included, to `wp-content/plugins/tekseries-blocks/tekseries-blocks.zip`. |
| `npm run theme-zip` | Zips the theme folder to `wp-content/themes/tekseries.zip`. |
| `npm run wp-env <cmd>` | Runs wp-env, e.g. `npm run wp-env start` or `stop`. |
| `localwp composer run lint` | PHPCS with WordPress Coding Standards and PHPCompatibilityWP (PHP 8.2+) over the theme and plugin. |
| `localwp composer run format` | Runs `phpcbf`. It exits 1 after fixing files, which isn't a failure. |

Every script names our folders explicitly. Run wp-scripts without paths and it crawls WordPress core, and `format` rewrites it (ADR-001).

## Tests

- `npm run test:unit` runs 179 Vitest tests in `tests/unit/`: design tokens, templates, icons and project metadata, including that the theme, plugin and both package files share one version (ADR-058).
- `npm run test:e2e` runs 119 Playwright tests in 27 spec files against wp-env on `http://localhost:8890`, the port in `.wp-env.json` (ADR-002). Run `npm run build` first. They cover the theme, events, tones, the blocks, the job screens and media albums, check the scripts each public page loads, and drive the lightbox, in-place filtering and search, copy link and table of contents in a browser.
- `specs/a11y.spec.ts` scans every kind of public page at 1280px and 390px with `@axe-core/playwright` against WCAG 2.2 A and AA. It also covers states only a script or click reaches, keyboard focus under the sticky header, and the contrast of text over photos (ADR-056).
- The first `npm run wp-env start` pulls Docker images and takes several minutes, longer than Playwright's 120-second start timeout. Run it once by hand first, and retry on a network error.
- Run `npm run test:e2e:install` once, then `sudo npx playwright install-deps chromium` once per machine for system libraries.
- `localwp composer run lint` checks the theme's and plugin's PHP with PHPCS.

## Repo layout

```text
.                                          # WordPress root and git root
├── wp-content/themes/tekseries/           # block theme: theme.json, templates, parts, patterns, assets
├── wp-content/plugins/tekseries-blocks/   # blocks plugin
│   ├── src/                               # one folder per block, plus post-settings (sidebar panel)
│   ├── includes/                          # event and job fields, media albums, bindings, icons, share links, tone meta and cycle, editor, WP-CLI
│   ├── templates/wpjm/                    # WP Job Manager template overrides
│   └── assets/css/                        # job screen styles
├── specs/                                 # Playwright e2e specs
├── tests/unit/                            # Vitest unit tests
├── scripts/, types/                       # fetch-icons.mjs, TypeScript declarations
├── docs/                                  # decisions.md, changelog.md and design-reference/
└── package.json, composer.json, phpcs.xml.dist, .wp-env.json and other root config
```

The repo root is the WordPress root. `.gitignore` is a whitelist, so WordPress core, uploads and other plugins and themes are never tracked, and neither are the zips (ADR-001).

The plugin has eight blocks: `post-tone` (ADR-033), `share-links`, `toc` (ADR-038), `job-listings` (ADR-042), `media-gallery` (ADR-045), `hero-carousel` (ADR-053) and the CSS-only `stat` and `logo-marquee` (ADR-046). Five send visitors a small script module on the Interactivity API, `src/<block>/view.ts` (ADR-047), and each works without JavaScript:

- `share-links` copies "Link to this page", and loads only when a block offers that link.
- `media-gallery` has a lightbox (ADR-048), and its filters and Load more update in place (ADR-049).
- `job-listings` updates search and paging in place (ADR-049).
- `toc` marks the section being read and starts folded on phones (ADR-051).
- `hero-carousel` dots follow the slide in view. "Change slides automatically" (off by default) advances every 7 seconds with a pause button, never under reduced motion.

Event templates show the ACF fields through Block Bindings. Job pages read WP Job Manager data through the `tekseries/job-field` and `tekseries/job-stats` sources (ADR-040), and the gallery reads totals through `tekseries/media-stats`. Only media in an album (Media → Albums) appears in the gallery (ADR-044).

## Release

Releases ship as two zips uploaded in wp-admin (ADR-058). From a clean install, run `npm ci`, `npm run build`, `npm run plugin-zip` and `npm run theme-zip`. Upload `tekseries-blocks.zip` under Plugins, then `tekseries.zip` under Themes. The content that lives in the database (page content, albums, topic icons, the contact form's fields) moves separately, as a scripted bundle with a dry run (ADR-058).

## Design reference

`docs/design-reference/` holds the design canvas's page boards at desktop, tablet and mobile widths, plus the design system's tokens and components. It's reference material: don't edit it by hand, because later pulls diff against it. The theme's `theme.json` implements its tokens.

## Status

| Phase | Name | Status |
|---|---|---|
| 0 | Repo prep and design pull | done |
| 1 | Environment | done |
| 2 | Design tokens and theme shell | done |
| 3 | Pages from core blocks | done |
| 4 | Blocks plugin scaffold | done |
| 5a | Custom blocks: events | done |
| 5b | Custom blocks: Job Series | done |
| 5c | Custom blocks: gallery and home motion | done |
| 6 | Frontend behaviour | done |
| 7 | QA and release | done |

The build plan is complete at version 1.0.0. Lighthouse on the development site scores 95 to 99 on mobile and 100 on desktop for Home, Gallery, Job Series and an event page (ADR-057). What is still to do is outside the code: the release tag, made once the site owner approves, and moving the site to the live server, which means uploading the two zips and the first run of the content bundle (ADR-058).

Architecture decisions and future work are in [docs/decisions.md](docs/decisions.md). Changes are in [docs/changelog.md](docs/changelog.md).

# TekSeries

This repo holds the `tekseries` block theme and the `tekseries-blocks` plugin that rebuild tekseries.com. Site editors change text, images, links, header, footer and colours in the Site Editor without code, and React never ships to visitors: it runs only in wp-admin (ADR-005).

## Requirements

- Node 24.15+ and npm 11+. `.nvmrc` pins Node 24; `engines` also accepts 26+, but not 25.
- Docker, for the wp-env e2e tests only.
- LocalWP running this site. The theme and plugin need WordPress 7.1+ and PHP 8.2+ (ADR-003).
- The `localwp` wrapper, which runs Composer, PHP and WP-CLI inside Local's site environment. Open the site's "Site shell" in Local once so it writes `~/.config/Local/ssh-entry/<site-id>.sh`, then export `LOCALWP_SSH_ENTRY` with that path.

## Setup

```bash
nvm use                                      # Node 24, from .nvmrc
npm ci
localwp composer install
localwp wp plugin activate tekseries-blocks
```

The site runs at `https://tekseriescomnew.local`, or whichever domain Local shows, with the `tekseries` theme active. Pages that still hold Divi shortcodes show them as raw text until their content is re-authored from the theme's patterns.

For theme work, set development mode once, or WordPress serves a cached pattern list and new theme patterns don't appear. wp-env already sets it in `.wp-env.json`.

```bash
localwp wp config set WP_DEVELOPMENT_MODE theme --type=constant
```

Set the site logo in the Site Editor or Settings, not in code.

## Commands

| Command | What it does |
|---|---|
| `npm run check-engines` | Checks your Node and npm versions against `engines`. |
| `npm run lint:js` | ESLint over the plugin, `scripts/`, `specs/`, `tests/`, `types/` and the JS/TS config files. |
| `npm run lint:css` | Stylelint over the theme's and plugin's CSS and SCSS. |
| `npm run format` | Prettier (`wp-prettier`) over the theme, plugin, scripts, tests and config files. |
| `npm run typecheck` | `tsc --noEmit` over the plugin source, tests and config files. |
| `npm run test:unit` | Vitest unit tests. |
| `npm run test:e2e` | Playwright e2e tests on wp-env. |
| `npm run test:e2e:install` | Installs Playwright's Chromium once. |
| `npm run build` / `npm run start` | Builds the plugin's blocks into its `build/` folder, or watches and rebuilds. Nothing to build until the first block lands. |
| `npm run icons` | Downloads the plugin's Material Symbols SVGs from Google, for the names listed in `includes/icons.php`. |
| `npm run plugin-zip` | Zips the plugin for release. |
| `npm run wp-env <cmd>` | Runs wp-env, e.g. `npm run wp-env start` or `stop`. |
| `localwp composer run lint` | PHPCS with WordPress Coding Standards and PHPCompatibilityWP (PHP 8.2+) over the theme and plugin. |
| `localwp composer run format` | Runs `phpcbf`. It exits 1 after fixing files, which isn't a failure. |

Every script names our folders explicitly. Run wp-scripts without paths and it crawls WordPress core, and `format` rewrites it (ADR-001).

## Tests

- `npm run test:unit` runs Vitest on `tests/unit/`, including design-token checks (colour, font and preset slugs used in block markup), template-wiring checks and the icon list.
- `npm run test:e2e` runs Playwright against wp-env on `http://localhost:8890`, the port in `.wp-env.json` (ADR-002). It covers the header menu, global styles, fonts, event URLs and the icons endpoint. It also checks that every pattern and theme template is valid in the editor, that listing, single, search and 404 pages render without PHP notices or raw shortcodes, and that home links and buttons show a focus ring.
- Run `npm run test:e2e:install` once to get the browser. The e2e script doesn't install it.
- The first `npm run wp-env start` pulls Docker images and takes several minutes, longer than Playwright's 120-second start timeout. Run it once by hand before your first e2e run.
- Install Chromium's system libraries once per machine with `sudo npx playwright install-deps chromium`.
- `localwp composer run lint` checks the theme's and plugin's PHP with PHPCS.

## Repo layout

```text
.                                          # WordPress root and git root
├── wp-content/themes/tekseries/           # block theme: theme.json, templates, parts, patterns, assets
├── wp-content/plugins/tekseries-blocks/   # blocks plugin (event post type and taxonomy, icon collection)
├── specs/                                 # Playwright e2e specs
├── tests/unit/                            # Vitest unit tests
├── types/                                 # TypeScript declarations
├── scripts/                               # fetch-icons.mjs
├── docs/                                  # decisions.md and design-reference/
└── package.json, composer.json, phpcs.xml.dist, .wp-env.json and other root config
```

The theme has design tokens in `theme.json`, self-hosted fonts, header and footer parts whose content lives in PHP patterns (for translation), home, Contact and Gallery page patterns, templates for every screen (events and news listings and singles, archive, search, 404, "Page with its own hero", "Legal page"), block style variations and per-block CSS in `assets/css/blocks`.

The repo root is the WordPress root. `.gitignore` is a whitelist, so WordPress core, uploads and other plugins and themes are never tracked (ADR-001).

## Design reference

`docs/design-reference/` holds the Claude Design page boards at desktop, tablet and mobile widths, plus the design system's tokens and components. It's reference material: don't edit it by hand, because later pulls diff against it. The theme's `theme.json` implements its tokens.

## Status

| Phase | Name | Status |
|---|---|---|
| 0 | Repo prep and design pull | done |
| 1 | Environment | done |
| 2 | Design tokens and theme shell | done |
| 3 | Pages from core blocks | done |
| 4 | Blocks plugin scaffold | not started |
| 5 | Custom blocks | not started |
| 6 | Frontend behaviour | not started |
| 7 | QA and release | not started |

Pages from core blocks are built. Per-post tone and the custom blocks come next.

Architecture decisions and future work are in [docs/decisions.md](docs/decisions.md).

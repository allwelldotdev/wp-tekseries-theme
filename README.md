# TekSeries

This repo holds the `tekseries` block theme and the `tekseries-blocks` plugin that rebuild tekseries.com. Editors change everything in the Site Editor without code, and React never ships to visitors (ADR-005).

## Requirements

- Node 24.15+ and npm 11+ (`.nvmrc` pins 24). Docker, for the wp-env e2e tests only.
- Advanced Custom Fields, active (ADR-035). WP Job Manager is optional (ADR-039).
- LocalWP running this site, with WordPress 7.1+ and PHP 8.2+ (ADR-003).
- The `localwp` wrapper runs Composer, PHP and WP-CLI inside Local. Open the site's "Site shell" in Local once so it writes `~/.config/Local/ssh-entry/<site-id>.sh`, then export `LOCALWP_SSH_ENTRY` with that path.

## Setup

```bash
nvm use
npm ci
npm run build                                # build/ is not tracked
localwp composer install
localwp wp plugin activate tekseries-blocks
```

The site runs at `https://tekseriescomnew.local`, or whichever domain Local shows. For theme work, run `localwp wp config set WP_DEVELOPMENT_MODE theme --type=constant` once.

## Commands

| Command | What it does |
|---|---|
| `npm run check-engines` | Checks your Node and npm versions. |
| `npm run lint:js` / `lint:css` / `format` / `typecheck` | ESLint, Stylelint, Prettier and `tsc --noEmit`. |
| `npm run test:unit` | Vitest unit tests. |
| `npm run test:e2e` | Playwright e2e tests on wp-env. |
| `npm run build` / `start` | Builds the plugin, or watches and rebuilds. |
| `npm run icons` | Downloads the plugin's Material Symbols SVGs. |
| `npm run plugin-zip` / `theme-zip` | Zips the plugin or the theme for upload. |
| `npm run wp-env <cmd>` | Runs wp-env, for example `start` or `stop`. |
| `localwp composer run lint` / `format` | PHPCS and `phpcbf`. `phpcbf` exits 1 after fixing files, which isn't a failure. |

Every script names our folders explicitly. Run wp-scripts without paths and it crawls WordPress core (ADR-001).

## Tests

- E2E runs against wp-env on `http://localhost:8890` (ADR-002). Run `npm run build` first.
- The first `wp-env start` pulls Docker images and outlasts Playwright's start timeout. Run it once by hand, and retry on a network error.
- Run `npm run test:e2e:install` once, then `sudo npx playwright install-deps chromium` once per machine.
- `specs/a11y.spec.ts` runs axe accessibility checks at WCAG 2.2 A and AA on every kind of public page (ADR-056).

## Repo layout

```text
.                                          # WordPress root and git root
├── wp-content/themes/tekseries/           # block theme: theme.json, templates, parts, patterns
├── wp-content/plugins/tekseries-blocks/   # blocks plugin: src/, includes/, templates/, assets/
├── specs/                                 # Playwright e2e specs
├── tests/unit/                            # Vitest unit tests
├── scripts/, types/                       # icon fetcher, TypeScript declarations
├── docs/                                  # decisions.md, changelog.md, design-reference/
└── package.json, composer.json, phpcs.xml.dist, .wp-env.json and other root config
```

The repo root is the WordPress root, and `.gitignore` is a whitelist, so WordPress core, uploads, other plugins and themes, and the zips are never tracked (ADR-001). Custom blocks live in the plugin, the theme holds design (ADR-005), behaviour uses only the Interactivity API and every page works without JavaScript (ADR-047); `docs/decisions.md` has the rest.

## Design reference

`docs/design-reference/` holds the design boards and design system, and isn't edited by hand. The theme's `theme.json` implements its tokens, except motion, which keeps the theme's own values (ADR-080).

## Release

Releases are tagged `vX.Y.Z` and reach the live host, which has no SSH or WP-CLI, as zips uploaded in wp-admin (ADR-058, ADR-059, ADR-073). Build the first two with `npm ci`, `npm run build`, `npm run plugin-zip` and `npm run theme-zip`; the migration zip is built from the development site. Upload in this order:

1. Any file in the `upload-first` folder, into the Media Library.
2. `tekseries-blocks.zip` under Plugins. Activate it.
3. `tekseries.zip` under Appearance → Themes. Don't activate it.
4. `tekseries-migration.zip` under Plugins. Activate it.

Media over 5 MB goes to `upload-first`, and the bundle's contents are in ADR-073 and ADR-082. Do a dry run under Tools → TekSeries migration first, and delete the plugin afterwards. It refuses to run on an older blocks plugin or theme.

## Status

Build phases 0 to 7 are done, and the plan finished at 1.0.0. The migration has not been run on the live site yet (ADR-059).

Decisions and future work are in [docs/decisions.md](docs/decisions.md). Changes are in [docs/changelog.md](docs/changelog.md).

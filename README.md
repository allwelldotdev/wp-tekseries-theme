# TekSeries

The `tekseries` block theme and `tekseries-blocks` plugin that rebuild tekseries.com. Editors change everything in the Site Editor. React never ships to visitors (ADR-005).

## Requirements

- Node 24.15+ and npm 11+ (`.nvmrc` pins 24). Docker, for e2e only.
- Advanced Custom Fields (ADR-035). WP Job Manager is optional (ADR-039).
- LocalWP with this site, WordPress 7.1+ and PHP 8.2+ (ADR-003).
- The `localwp` wrapper needs `LOCALWP_SSH_ENTRY`, set to the ssh-entry file Local creates when you open "Site shell".

## Setup

```bash
nvm use
npm ci
npm run build
localwp composer install
localwp wp plugin activate tekseries-blocks
```

The site runs at `https://tekseriescomnew.local`. For theme work, run `localwp wp config set WP_DEVELOPMENT_MODE theme --type=constant` once.

## Commands

| Command | What it does |
|---|---|
| `npm run lint:js` / `lint:css` / `format` / `typecheck` | ESLint, Stylelint, Prettier, `tsc`. |
| `npm run test:unit` | Vitest unit tests. |
| `npm run test:e2e` | Playwright e2e tests on wp-env. |
| `npm run build` / `start` | Builds, or watches. |
| `npm run icons` | Fetches the Material Symbols icons. |
| `npm run plugin-zip` / `theme-zip` | Zips for upload. |
| `npm run wp-env <cmd>` | Runs wp-env (`start`, `stop`). |
| `localwp composer run lint` / `format` | PHPCS and `phpcbf` (exits 1 after fixing). |

Every script names our folders, or wp-scripts crawls WordPress core (ADR-001).

## Tests

- E2E runs on wp-env at `http://localhost:8890` (ADR-002). Run `npm run build` first.
- The first `wp-env start` pulls images and outlasts Playwright's timeout. Run it once by hand.
- Once per machine: `npm run test:e2e:install`, then `sudo npx playwright install-deps chromium`.
- `specs/a11y.spec.ts` runs axe checks on public pages (ADR-056).

## Repo layout

```text
wp-content/themes/tekseries/           # theme.json, templates, parts, patterns
wp-content/plugins/tekseries-blocks/   # blocks plugin
specs/, tests/unit/                    # tests
docs/                                  # decisions, changelog, design-reference/
package.json, composer.json and other root config
```

The repo root is the WordPress root and `.gitignore` is a whitelist, so core, uploads and other plugins are never tracked (ADR-001). Blocks live in the plugin, the theme holds design (ADR-005), and pages work without JavaScript (ADR-047).

## Design reference

`docs/design-reference/` holds the design boards and system. Don't edit it by hand. `theme.json` implements its tokens, except motion (ADR-080).

## Release

Releases are tagged `vX.Y.Z` and go up as wp-admin zips, because the live host has no SSH or WP-CLI (ADR-058, ADR-059). Build with `npm ci`, `npm run build`, `npm run plugin-zip` and `npm run theme-zip`.

A routine release:

1. `tekseries.zip` under Appearance → Themes, with "Replace current with uploaded".
2. `tekseries-blocks.zip` under Plugins the same way, when its version changed.

A release that carries development-site content also needs `tekseries-migration.zip`, built from that site (ADR-059, ADR-073). Upload `upload-first` media over 5 MB to the Media Library, then the two zips, then the migration zip under Plugins, and activate it. Run its dry run under Tools → TekSeries migration, apply, then delete the plugin. It refuses an older blocks plugin or theme (ADR-073, ADR-082).

## Status

Build phases 0 to 7 are done, the plan finished at 1.0.0, and the live migration has run (ADR-059). See [docs/decisions.md](docs/decisions.md) and [docs/changelog.md](docs/changelog.md).

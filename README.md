# TekSeries

The `tekseries` block theme and the `tekseries-blocks` plugin that rebuild tekseries.com. Editors change everything in the Site Editor, and React never ships to visitors (ADR-005).

## Requirements

- Node 24.15+ and npm 11+ (`.nvmrc` pins 24). Docker, for the wp-env e2e tests only.
- Advanced Custom Fields, active (ADR-035). WP Job Manager is optional (ADR-039).
- LocalWP running this site, with WordPress 7.1+ and PHP 8.2+ (ADR-003).
- The `localwp` wrapper runs Composer, PHP and WP-CLI inside Local. Open the site's "Site shell" in Local once to create its ssh-entry, then export `LOCALWP_SSH_ENTRY` with that path.

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
| `npm run lint:js` / `lint:css` / `format` / `typecheck` | ESLint, Stylelint, Prettier, `tsc --noEmit`. |
| `npm run test:unit` | Vitest unit tests. |
| `npm run test:e2e` | Playwright e2e tests on wp-env. |
| `npm run build` / `start` | Builds the plugin, or watches and rebuilds. |
| `npm run icons` | Downloads the plugin's Material Symbols SVGs. |
| `npm run plugin-zip` / `theme-zip` | Zips the plugin or the theme for upload. |
| `npm run wp-env <cmd>` | Runs wp-env, for example `start` or `stop`. |
| `localwp composer run lint` / `format` | PHPCS and `phpcbf`. `phpcbf` exits 1 after fixing files. |

Every script names our folders explicitly, because wp-scripts without paths crawls WordPress core (ADR-001).

## Tests

- E2E runs on wp-env at `http://localhost:8890` (ADR-002). Run `npm run build` first.
- The first `wp-env start` pulls Docker images and outlasts Playwright's start timeout. Run it once by hand.
- Run `npm run test:e2e:install` once, then `sudo npx playwright install-deps chromium` once per machine.
- `specs/a11y.spec.ts` runs axe checks on every kind of public page (ADR-056).

## Repo layout

```text
wp-content/themes/tekseries/           # theme.json, templates, parts, patterns
wp-content/plugins/tekseries-blocks/   # blocks plugin
specs/, tests/unit/                    # Playwright and Vitest tests
docs/                                  # decisions.md, changelog.md, design-reference/
package.json, composer.json and other root config
```

The repo root is the WordPress root, and `.gitignore` is a whitelist, so WordPress core, uploads, other plugins and themes, and the zips are never tracked (ADR-001). Blocks live in the plugin and the theme holds design (ADR-005). Behaviour uses only the Interactivity API, and every page works without JavaScript (ADR-047).

## Design reference

`docs/design-reference/` holds the design boards and design system. Don't edit it by hand; `theme.json` implements its tokens, except motion (ADR-080).

## Release

Releases are tagged `vX.Y.Z`. The live host has no SSH or WP-CLI, so a release goes up as zips in wp-admin (ADR-058, ADR-059, ADR-073). Build two with `npm ci`, `npm run build`, `npm run plugin-zip` and `npm run theme-zip`; the migration zip comes from the development site. Upload in this order:

1. Files in the `upload-first` folder (media over 5 MB), into the Media Library.
2. `tekseries-blocks.zip` under Plugins. Activate it.
3. `tekseries.zip` under Appearance → Themes. Don't activate it.
4. `tekseries-migration.zip` under Plugins. Activate it.

Run the dry run under Tools → TekSeries migration first, and delete the plugin afterwards. It refuses an older blocks plugin or theme; its contents are in ADR-073 and ADR-082.

## Status

Build phases 0 to 7 are done, and the plan finished at 1.0.0. The live migration has run (ADR-059).

Decisions are in [docs/decisions.md](docs/decisions.md), changes in [docs/changelog.md](docs/changelog.md).

# TekSeries

This repo holds the `tekseries` block theme and the `tekseries-blocks` plugin that rebuild tekseries.com. Editors change text, images, links, header, footer and colours in the Site Editor without code, and React never ships to visitors (ADR-005).

## Requirements

- Node 24.15+ and npm 11+ (`.nvmrc` pins 24; `engines` also accepts 26+, not 25). Docker, for the wp-env e2e tests only.
- LocalWP running this site, with WordPress 7.1+ and PHP 8.2+ (ADR-003).
- Advanced Custom Fields, active (ADR-035). WP Job Manager for the Job Series screens, which is optional (ADR-039). wp-env installs both.
- The `localwp` wrapper, which runs Composer, PHP and WP-CLI inside Local. Open the site's "Site shell" in Local once so it writes `~/.config/Local/ssh-entry/<site-id>.sh`, then export `LOCALWP_SSH_ENTRY` with that path.

## Setup

```bash
nvm use                                      # Node 24, from .nvmrc
npm ci
npm run build                                # the plugin's blocks and scripts; build/ is not tracked
localwp composer install
localwp wp plugin activate tekseries-blocks
```

The site runs at `https://tekseriescomnew.local`, or whichever domain Local shows, with the `tekseries` theme active. For theme work, run `localwp wp config set WP_DEVELOPMENT_MODE theme --type=constant` once, or WordPress serves a cached pattern list.

## Commands

| Command | What it does |
|---|---|
| `npm run check-engines` | Checks your Node and npm versions against `engines`. |
| `npm run lint:js` / `lint:css` | ESLint and Stylelint over our folders. |
| `npm run format` | Prettier over the theme, plugin, scripts, tests and config files. |
| `npm run typecheck` | `tsc --noEmit`. |
| `npm run test:unit` | Vitest unit tests. |
| `npm run test:e2e` | Playwright e2e tests on wp-env. |
| `npm run test:e2e:install` | Installs Playwright's Chromium once. |
| `npm run build` / `npm run start` | Builds the plugin into `build/`, or watches and rebuilds. |
| `npm run icons` | Downloads the plugin's Material Symbols SVGs. |
| `npm run plugin-zip` / `theme-zip` | Zips the plugin or the theme for upload. |
| `npm run wp-env <cmd>` | Runs wp-env, e.g. `start` or `stop`. |
| `localwp composer run lint` | PHPCS over the theme and plugin. |
| `localwp composer run format` | Runs `phpcbf`. It exits 1 after fixing files, which isn't a failure. |

Every script names our folders explicitly. Run wp-scripts without paths and it crawls WordPress core (ADR-001).

## Tests

- Unit: `npm run test:unit` runs Vitest in `tests/unit/`.
- E2E: `npm run test:e2e` runs the 41 Playwright specs in `specs/` against wp-env on `http://localhost:8890`, the port in `.wp-env.json` (ADR-002). Run `npm run build` first.
- The first `npm run wp-env start` pulls Docker images and outlasts Playwright's 120-second start timeout. Run it once by hand, and retry on a network error.
- Run `npm run test:e2e:install` once, then `sudo npx playwright install-deps chromium` once per machine.
- PHP: `localwp composer run lint`.
- Accessibility: `specs/a11y.spec.ts` runs axe at WCAG 2.2 A and AA on every kind of public page (ADR-056).

## Repo layout

```text
.                                          # WordPress root and git root
├── wp-content/themes/tekseries/           # block theme: theme.json, templates, parts, patterns, assets
├── wp-content/plugins/tekseries-blocks/   # blocks plugin: src/ (blocks and scripts), includes/, templates/, assets/
├── specs/                                 # Playwright e2e specs, with fixtures/
├── tests/unit/                            # Vitest unit tests
├── scripts/, types/                       # icon fetcher, TypeScript declarations
├── docs/                                  # decisions.md, changelog.md, design-reference/
└── package.json, composer.json, phpcs.xml.dist, .wp-env.json and other root config
```

The repo root is the WordPress root. `.gitignore` is a whitelist, so WordPress core, uploads, other plugins and themes, and the zips are never tracked (ADR-001).

Custom blocks live in the plugin and the theme holds design (ADR-005). Frontend behaviour uses only the Interactivity API, and every page works without JavaScript (ADR-047). The `ts-reveal` and `ts-intro` classes animate a block in (ADR-063), and `ts-when-open` and `ts-when-closed` switch blocks at a page deadline, which has its own time zone (ADR-081, ADR-084). Editors set those classes from a "Deadline" panel in a block's sidebar (ADR-085), and text can follow the deadline through the `tekseries/page-deadline` binding source (ADR-086). `docs/decisions.md` has the rest.

## Release

Each release is tagged `vX.Y.Z` when it is merged, and the code is at 1.22.0. The live host has no SSH or WP-CLI, so a release reaches it as three zips uploaded in wp-admin (ADR-058, ADR-059, ADR-073). Build the first two with `npm ci`, `npm run build`, `npm run plugin-zip` and `npm run theme-zip`. Upload in this order:

1. Any file in the `upload-first` folder, into the Media Library.
2. `tekseries-blocks.zip` under Plugins. Activate it.
3. `tekseries.zip` under Appearance → Themes. Don't activate it.
4. `tekseries-migration.zip` under Plugins. Activate it.

The third zip is a one-off plugin, "TekSeries Migration", built from the development site by a script kept outside this repository. It carries page content, gallery albums, topic icons, the contact form's fields, the Formbricks connection, the Media Library files those pages use, and the Maker Prize page (ADR-073, ADR-082). A media file over 5 MB goes to `upload-first` beside the zip instead.

Open Tools → TekSeries migration for a dry run that changes nothing. A button then applies the changes, gives existing events and posts their tones, and switches the theme. It refuses to run when the blocks plugin or theme on the site is older than the bundle requires. Delete the plugin afterwards.

## Design reference

`docs/design-reference/` holds the design canvas's page boards and the design system's tokens and components. It's reference material: don't edit it by hand, because later pulls diff against it. The theme's `theme.json` implements its tokens, except motion, which keeps the theme's own values (ADR-080).

## Status

The build plan's phases 0 to 7 are all done: repo prep, environment, design tokens and theme shell, pages from core blocks, blocks plugin scaffold, custom blocks (events, Job Series, gallery and home motion), frontend behaviour, and QA and release. The plan finished at 1.0.0. Later versions are listed in the changelog. The migration has not been run on the live site yet (ADR-059).

Architecture decisions and future work are in [docs/decisions.md](docs/decisions.md). Changes are in [docs/changelog.md](docs/changelog.md).

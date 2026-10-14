# TekSeries

This repo holds the `tekseries` block theme and the `tekseries-blocks` plugin that rebuild tekseries.com. Site editors change text, images, links, header, footer and colours in the Site Editor without code, and React never ships to visitors: it runs only in wp-admin (ADR-005). `specs/visitor-scripts.spec.ts` checks this on every kind of public page, and jQuery loads only on the Contact form and the job submission form (ADR-007).

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
npm run build                                # the plugin's blocks, editor panels and scripts
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
| `npm run build` / `npm run start` | Builds the plugin's blocks, editor panels and scripts into `build/` with a blocks manifest, or watches and rebuilds. |
| `npm run icons` | Downloads the plugin's Material Symbols SVGs from Google, for the names listed in `includes/icons.php`. |
| `npm run plugin-zip` | Zips the plugin, `templates/` included, to `wp-content/plugins/tekseries-blocks/tekseries-blocks.zip`. |
| `npm run theme-zip` | Zips the theme folder to `wp-content/themes/tekseries.zip`. |
| `npm run wp-env <cmd>` | Runs wp-env, e.g. `npm run wp-env start` or `stop`. |
| `localwp composer run lint` | PHPCS with WordPress Coding Standards and PHPCompatibilityWP (PHP 8.2+) over the theme and plugin. |
| `localwp composer run format` | Runs `phpcbf`. It exits 1 after fixing files, which isn't a failure. |

Every script names our folders explicitly. Run wp-scripts without paths and it crawls WordPress core, and `format` rewrites it (ADR-001).

## Tests

- `npm run test:unit` runs the Vitest tests in `tests/unit/`: design tokens, templates, icons and project metadata, including that the theme, plugin and both package files share one version (ADR-058).
- `npm run test:e2e` runs the Playwright specs in `specs/` (36 files) against wp-env on `http://localhost:8890`, the port in `.wp-env.json` (ADR-002). Run `npm run build` first. They cover the theme, events, tones, the blocks, the job screens and media albums, and check the scripts each public page loads.
- `specs/a11y.spec.ts` scans every kind of public page at 1280px and 390px with `@axe-core/playwright` against WCAG 2.2 A and AA. It also covers states only a script or click reaches, keyboard focus under the sticky header, and the contrast of text over photos (ADR-056).
- The first `npm run wp-env start` pulls Docker images and takes several minutes, longer than Playwright's 120-second start timeout. Run it once by hand first, and retry on a network error.
- Run `npm run test:e2e:install` once, then `sudo npx playwright install-deps chromium` once per machine for system libraries.
- `localwp composer run lint` checks the theme's and plugin's PHP with PHPCS.

## Repo layout

```text
.                                          # WordPress root and git root
├── wp-content/themes/tekseries/           # block theme: theme.json, templates, parts, patterns, assets
├── wp-content/plugins/tekseries-blocks/   # blocks plugin
│   ├── src/                               # one folder per block, plus post-settings and button-icon (editor panels), and reveal, contact-form, job-submit and surveys (scripts)
│   ├── includes/                          # event and job fields, media albums, bindings, icons, share links, tone meta and cycle, reveal, list order, viewer, post video, contact form, surveys, editor, WP-CLI
│   ├── templates/wpjm/                    # WP Job Manager template overrides
│   └── assets/css/                        # job screen styles
├── specs/                                 # Playwright e2e specs
├── tests/unit/                            # Vitest unit tests
├── scripts/, types/                       # fetch-icons.mjs, TypeScript declarations
├── docs/                                  # decisions.md, changelog.md and design-reference/
└── package.json, composer.json, phpcs.xml.dist, .wp-env.json and other root config
```

The repo root is the WordPress root. `.gitignore` is a whitelist, so WordPress core, uploads and other plugins and themes are never tracked, and neither are the zips (ADR-001).

The plugin has eleven blocks: `event-countdown` (ADR-074), `post-tone` (ADR-033), `share-links`, `toc` (ADR-038), `job-listings` (ADR-042), `media-gallery` (ADR-045), `hero-carousel` (ADR-053), `map` (ADR-069), `post-video` (ADR-072) and the `stat` and `logo-marquee`, which are built in CSS (ADR-046). Ten small script modules on the Interactivity API reach visitors (ADR-047), and every page works without JavaScript. Six belong to blocks, as `src/<block>/view.ts`:

- `event-countdown` counts down to an event's start, in Nigerian time.
- `share-links` copies "Link to this page", and loads only when a block offers that link.
- `media-gallery` has a lightbox (ADR-048), and its filters and Load more update in place (ADR-049).
- `job-listings` updates search and paging in place (ADR-049).
- `toc` marks the section being read and starts folded on phones (ADR-051).
- `hero-carousel` dots follow the slide in view. "Change slides automatically" (off by default) advances every 7 seconds with a pause button, never under reduced motion. Its first slide's text rises in when the page opens.
- `src/reveal/view.ts` is the seventh. It isn't a block: it says when a block has scrolled into view, and `includes/reveal.php` loads it only on pages that use it.
- `src/contact-form/view.ts` is the eighth. It changes the Contact form's Subject hint to match the topic picked.
- `src/job-submit/view.ts` is the ninth. It checks the "Post a job" form's description before Preview.
- `src/surveys/view.ts` is the tenth. A Button with the class `ts-survey-<key>` opens the Formbricks form whose action has that key, and `includes/surveys.php` loads Formbricks' script only when a visitor reaches for one (ADR-075). Focus moves into the form and back to the button, and the button's link is followed when no form opens (ADR-076). A second class, `ts-entry-<value>`, sends the value as the form's hidden field `entry_point`, so each answer records which button opened it (ADR-079). Fill in the "SDK connection URL" and the "ID" under Settings → Forms (Formbricks).

On Home, the `stat` figures count when scrolled to, and the section headings and cards rise in (ADR-060). The owner's choices from the Site Editor, such as the hero bands' `ts-intro`, the cards' `ts-reveal`, Home's wording and the footer line, live in the theme's patterns, and the development site keeps no saved copies of templates or parts (ADR-078). Editors can make any block rise in when scrolled to with the class `ts-reveal`, or when the page opens with `ts-intro` (ADR-063), under Advanced → Additional CSS class(es). On a Group, `ts-intro` raises the blocks inside it one after another. A press with a mouse or finger on a link in a block still rising in works the first time, and only keyboard focus moves it into place at once (ADR-077). The look is in the theme's `assets/css/global.css`, and the timings are tokens in `theme.json` under `settings.custom.motion`. Reduced motion shows everything at once.

A Button's "Icon" panel sets the icon classes the theme's CSS draws (ADR-067), `ts-lightbox-open` opens a photo or video in the Gallery's viewer (ADR-071), and `?order=asc` lists events and jobs oldest first (ADR-070). Event templates show the ACF fields through Block Bindings, and job pages read WP Job Manager data through the `tekseries/job-field` and `tekseries/job-stats` sources (ADR-040). Only media in an album (Media → Albums) appears in the gallery (ADR-044).

## Release

The latest tagged release is 1.15.1 (`v1.15.1`). The code is at 1.16.0, not yet merged or tagged. Each release is tagged `vX.Y.Z` when it is merged, and `git tag` lists the released versions. The live host has no SSH or WP-CLI, so a release reaches it as three zips uploaded in wp-admin (ADR-058, ADR-059, ADR-073). From a clean install, run `npm ci`, `npm run build`, `npm run plugin-zip` and `npm run theme-zip` for the first two.

Upload in this order:

1. Any file in the `upload-first` folder, into the Media Library.
2. `tekseries-blocks.zip` under Plugins. Activate it.
3. `tekseries.zip` under Appearance → Themes. Don't activate it.
4. `tekseries-migration.zip` under Plugins. Activate it.

The third zip is a one-off plugin, "TekSeries Migration", built from the development site by a script kept outside this repository. It carries:

- page content, gallery albums, topic icons and the contact form's fields;
- the Formbricks connection, only when it is set on the development site, so the form buttons work straight after the migration;
- Media Library files made on the development site that the pages and albums use;
- anything saved in the Site Editor: templates, template parts, menus and styles with Additional CSS. Nothing is saved there now, so the bundle carries none of it (ADR-073, ADR-078).

The bundle built on 2026-10-13 holds ten pages and posts, sixteen topic icons, eight albums, five media files, one poster and three options. A media file over 5 MB goes to `upload-first` beside the zip instead (today, one 47 MB video), and you upload it by hand first. The migration screen names any such file that is still missing and shows no button until it is there.

Migration plugin 1.2.0 refuses to run when TekSeries Blocks or the theme on the site is older than 1.15.1. Open Tools → TekSeries migration for a dry run that changes nothing. A button then applies the changes, gives existing events and posts their tones, and switches the theme.

Delete the plugin afterwards. It leaves a small hidden mark on the media files (and any menu) it created, so a later migration zip finds them instead of creating them again.

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

The build plan was completed at version 1.0.0. Versions 1.1.0 to 1.13.0 add the Home motion, the Map and Post Video blocks, the Button icon panel, list order and the shared viewer (ADR-060 to ADR-072). Versions 1.13.1 to 1.16.0 move the owner's editor choices into the theme, add the event countdown and the Formbricks buttons, fix pressing a link in a block that is rising in, and record which button opened a Formbricks form (ADR-074 to ADR-079). At 1.0.0, Lighthouse on the development site scored 95 to 99 on mobile and 100 on desktop for Home, Gallery, Job Series and an event page (ADR-057). The migration has not been run on the live site yet (ADR-059).

Architecture decisions and future work are in [docs/decisions.md](docs/decisions.md). Changes are in [docs/changelog.md](docs/changelog.md).

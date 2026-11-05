# Phase 2 — Reference Pokédex & Catalog Handoff

**Date**: November 5, 2026  
**Status**: COMPLETED — Phase 3 remains pending Navigator approval and a separately approved plan.  
**Approved plan**: [Phase 2 reference catalog](../approved-artifacts/phase-2-reference-pokedex-and-catalog.md)  
**Earlier correction evidence**: [Consistency cycle](../approved-artifacts/phase-2-consistency-adjustments.md)

## 1. Delivered Behavior

- A real launch awaits the bootstrap initializer: idempotent Dexie reference seeding first, then catalog and evolution-rule loading. Concurrent starts are deduplicated. Storage/read failures resolve into a pt-BR retry state instead of disabling the shell.
- The home route lazy-loads `PokedexCatalogComponent`; `/pokedex` and unknown routes redirect home. The read-only catalog covers #001–#386, with exact-number/name search, primary/secondary type filtering, four sort choices, live counts, and an empty state.
- CDK virtual rows are 280px tall and reflow from one to four columns. ResizeObserver is disconnected on teardown. Result/layout changes reset scrolling; template caching is disabled to avoid retaining stale card state in recycled rows.
- Card activation opens a named bottom sheet with stats, sprite/fallback, and full branching family. Material owns scrolling. Escape dismisses and returns focus to the original card, or the list if virtualization/resizing removed the card.
- Existing ROM facts remain unchanged: 386 species, 184 evolution rules, 17 Fairy species, Granbull Normal/Dark, Porygon Normal/Psychic, and Kadabra to Alakazam at level 48.
- No profile/specimen tracking, cloud auth/sync, service worker, deployment, dependency installation, or Git mutation was introduced.

## 2. TDD and Implementation Evidence

The earlier consistency cycle ended with 63 tests. New startup/catalog tests first failed with the missing modules, then an executable RED run recorded eight failures with 63 existing tests passing. A route-test setup error was corrected before GREEN (router providers must be configured before TestBed injection). jsdom scrolling is mocked at the CDK boundary; actual scrolling was separately exercised in the browser. The ResizeObserver double models both the viewport and Material observers, including teardown.

GREEN added initialization ordering/deduplication, failure/retry, failed-rule readiness, the actual application initializer, routed catalog/filtering/detail interactions, loading/error states, and responsive rows/cleanup. Browser testing found lost focus after a breakpoint resize removed the trigger; a new regression failed, then passed after adding a teardown-safe dismissal subscription with a list-focus fallback. Final suite: 73 passing tests.

The first integration build warned at 622.77 kB, and moving only the seed to a lazy chunk still warned at 503.11 kB. Lazy-loading the startup coordinator as well brought the shell below the unchanged 500 kB budget. The seed is imported before opening the Dexie transaction, avoiding transaction auto-close while fetching a module.

## 3. Final Shell Verification

| Check | Actual result |
| --- | --- |
| `npm run lint` | PASS: explicit application/test TypeScript checks and source Prettier check |
| `npm test` | PASS: 15 files, 73 tests, zero failures |
| `npm run build` | PASS: 397.91 kB initial bundle, estimated transfer 98.44 kB; zero Angular errors/warnings |
| Bootstrap integration | PASS: actual app initializer seeds 386 species and 184 rules in isolated fake IndexedDB and loads catalog/family services |
| Seed structural/content audit | PASS: semantic SHA-256 unchanged (`ff857de34cd832db336dd0e91ef34983c839e54cd456fdf0819dcffe6628333d`); complete 386 IDs, 184 unique rules, valid references/stat totals, 17 Fairy species, zero cycles |
| Documentation/production artifact audit | PASS: 59 local Markdown targets resolve (anchors not checked); production base href is `/firered-definitive-pokedex/`; ROM/save ignore patterns remain present |

An in-sandbox verification attempt failed before most suites could run because Vitest could not read its temporary bundle files (ENOENT). The final rerun outside the sandbox passed all 73 tests. npm still reports the pre-existing user-config `always-auth` warning; this is not an Angular build warning and global npm configuration was not modified.

## 4. Browser and Scoped Accessibility Verification

The initial local server was inaccessible through the sandbox. A loopback-only server outside the sandbox on port 4201 enabled in-app browser verification. Earlier native Chrome verification had been stopped by Computer Use because it could not establish the browser URL; no bypass was attempted. Verification resumed through the supported in-app browser once the local server was reachable.

Observed through the real UI and read-only DOM inspection:

- Fresh launch/reload displays `Exibindo 386 de 386 Pokémon` with ascending numbers.
- `#025` finds Pikachu; Fada gives 17 results; an unmatched query displays the localized empty state.
- Descending sort begins with Deoxys #386. Keyboard End on the virtual list reaches #386 without rendering every card. Desktop inspection found 20 rendered cards rather than 386 and measured 280px row heights.
- Porygon shows Normal/Psychic and Granbull Normal/Dark.
- Keyboard Enter opens Kadabra details, which display Alakazam, `Nível 48`, and the ROM-change callout. Eevee details show all five independent branches and item conditions.
- All seven stat meters have localized accessible names. Type chips measure at least 48px in each dimension. Their contrast regression covers all 19 documented palette colors; the prior actual-token audit found a minimum 5.53:1 ratio.
- Desktop 1024×900 and mobile 390×844/320×844 CSS viewports showed no document horizontal overflow. The browser's existing scale required compensating the viewport override; recorded dimensions are the measured CSS viewport, not requested backing dimensions. One/four-column reflow was observed.
- Mobile detail uses one Material-owned scrolling container. Escape restores card focus normally and list focus when a desktop-to-mobile resize replaces the original card. Unit regression also covers removed-trigger recovery.
- Browser console log inspection returned no warnings/errors for the final checked state. Temporary viewport overrides were reset.

Screenshots were saved as local visual evidence outside the repository (`phase-2-catalog.jpg` and `phase-2-mobile-detail.jpg` in the chat's visualization workspace). They are not application assets or files prescribed for Git staging.

## 5. Limits and Deferred Checks

- These are phase-appropriate label, contrast, target, keyboard, and responsive checks, not a full WCAG certification or a screen-reader audit. Full release accessibility and additional browser/platform coverage remain Phase 6 work.
- Automated Playwright E2E infrastructure, service-worker caching, installability, and cold offline reload tests remain Phase 5 work. Catalog persistence alone does not prove offline application delivery. Optional remote sprites and fonts/icons retain external dependencies; sprite failure fallback is unit-tested.
- Browser observations prove real catalog launch behavior; exact persisted table counts are separately checked by the application-initializer integration test, not an independent production-browser storage audit.
- No full ROM re-extraction was performed during completion. Seed structural/content identity is checked separately; the earlier correction cycle records the approved direct BST verification.
- `git status --short` reports that this supplied directory is not a Git repository. Tracking state, Git diff, and tracked-ROM exclusion cannot be verified here. `.gitignore` excludes `*.gba` and `*.sav`; no ROM/save was copied, distributed, or modified. No repository was initialized automatically.

## 6. Recommended Manual Git Commands

Run these only in a verified Git checkout containing these changes. Do not initialize this directory or stage game files as part of this handoff. Inspect the status and diff before staging:

```powershell
git status --short
git diff --check
git diff --stat
git add -- AGENTS.md README.md package.json src docs
git diff --cached --stat
git commit -m "Complete Phase 2 reference catalog and verification"
```

The staging list intentionally excludes ROM/save files, dependencies, build output, and local screenshots. Review it against the actual checkout; no push or deployment is part of Phase 2.

## 7. Next Gate

Request Navigator approval to begin **Phase 3 planning**. Its proposal must resolve the documented ownership/outbox/restore questions and be approved/archived before player-state implementation. Do not treat Phase 2 closure as approval for Phase 3 code.

# Phase 2 — Consistency Adjustments Proposal

**Status**: COMPLETED — approved correction cycle checkpoint. Phase 2 subsequently completed; current results are in [the Phase 2 handoff](../agent-handoffs/phase-2-handoff.md). Remaining-work statements below preserve the correction-cycle snapshot.
**Approval**: The Navigator explicitly approved this proposal with “Yes” in the current conversation, before source/configuration implementation.
**Additional approval (November 5, 2026)**: The Navigator approved ROM-based expectation corrections for the two existing Pikachu BST assertions. Direct local ROM reads at `0x254784 + internalId * 28` confirmed Bulbasaur 318, Pikachu 300, and Mewtwo 680. Only the erroneous expected BST and ordering are corrected; gameplay seed values and production sorting/rendering are unchanged.
**Date**: November 4, 2026
**Parent phase**: Phase 2 — Reference Pokédex & Catalog (in progress).
**Parent artifact**: [Reference catalog plan](./phase-2-reference-pokedex-and-catalog.md).

## 1. Objective and Boundaries

Align the current code, verification tooling, and documentation without declaring Phase 2 complete or implementing later phases. This is a bounded correction cycle within Phase 2, not a new development phase.

The catalog page, home route, bootstrap initialization, catalog/tree loading integration, virtual grid, and card-to-sheet wiring remain open under the parent plan. Phase 3 remains pending.

No dependency installation or upgrades, ROM-data changes, deployment, cloud changes, destructive file operations, or mutating Git commands are authorized by this proposal.

## 2. TDD and Evidence Policy

- A failing test can be an intentional RED checkpoint. Do not classify a failure as accidental solely because the suite is not green.
- The archived plan currently marks detail tests as implemented, but does not document the observed TS1308 syntax failure as intentional RED. Its intended checkpoint is unverified.
- Record the initial lint, test, and build results before changing implementation. Preserve test assertions and domain invariants.
- Correct the invalid test mock setup so the existing behavioral tests can execute; do not make its synchronous tree contract asynchronous merely to permit `await`.
- For behavior changes, first add and execute meaningful failing tests, implement the minimum fix, and then refactor.
- Do not rewrite historical verification results as current results. Distinguish source presence, executed verification, pending acceptance, and documented RED checkpoints.

## 3. Architecture and Tasks

### 3.1 Verification Tooling and Existing Tests

- Make the lint gate explicitly typecheck `tsconfig.app.json` and `tsconfig.spec.json`, followed by the existing source-format check.
- Repair the invalid `await` placement in the detail test setup while preserving all assertions.
- Apply formatting to files identified by Prettier. Preserve seed values and ordering.
- Update current documentation describing the lint command; retain historical command snapshots with context.

### 3.2 Reference Database Completeness

- Replace the species-count-only seed readiness check with a check covering both canonical reference tables and their expected identifiers.
- Evaluate readiness and repair inside the existing atomic transaction. Restore missing canonical entries using the existing authoritative seed without touching future player data.
- Test missing evolution rules despite a complete species table, partial reference data, repeat initialization, and rollback when a reference write fails.
- Document that this repair is not a general dataset migration/versioning implementation. Future reference-data revisions require an explicit migration policy.

### 3.3 Existing Presentation Components

- Correct type-label foreground selection against the existing color tokens to meet at least 4.5:1 contrast for small text. Test all supported type colors with an independent contrast calculation. Unit tests use the documented palette fixture; independently audit actual SCSS tokens during verification without adding Node typings or dependencies.
- Add the missing MYSTERY token, retaining 18 playable filter types and 19 ROM type identifiers.
- Preserve native filter-button semantics, associate accessible names with stat meters, and meet the documented minimum touch-target size for current custom controls.
- Add the sprite and offline-safe fallback promised by the approved species-detail header. Use the existing sprite source and fallback approach without new asset dependencies.
- Keep current Material palette configuration; document accurately how stock Material palettes and separate brand tokens are used. Do not invent a new design system.
- Document remaining browser accessibility verification and external font/icon dependencies accurately; full offline application delivery remains Phase 5 work.

### 3.4 Documentation Synchronization

- Synchronize `AGENTS.md`, README, roadmap, architecture, domain model, provenance, affected ADRs, and the living Phase 2 artifact with verified repository facts.
- Identify installed versus planned dependencies and resolved patch versions versus declared version ranges. Preserve historical runtime evidence; record the currently observed runtime separately.
- Replace broken machine-specific links with repository-relative links. Link the Phase 0 handoff to the preserved repository artifact.
- Add supersession notes to historical seed paths, evolution enums, schema examples, and earlier lint choices. Preserve the historical decisions and results.
- Clarify Phase 3 durable outbox writes versus Phase 4 delivery, and include event synchronization in the illustrative atomic evolution example.
- Record account adoption, child-entity ownership/composite keys, multi-device ordering, and tombstone policies as explicit design questions for the appropriate future phase. Do not silently adopt unapproved semantics.
- Keep incomplete Phase 2 integration unchecked. Mark verification claims according to actual results rather than source-file existence.

## 4. Acceptance Criteria

1. Existing behavioral assertions remain intact; the detail suite can execute.
2. `npm run lint`, `npm test`, and `npm run build` execute successfully; production build reports zero warnings. Any failure or environment limitation is recorded explicitly and prevents claiming the corresponding criterion passed.
3. New database tests demonstrate recovery of missing canonical reference entries and atomic rollback without duplicate records.
4. Type-label contrast checks cover all 19 defined type tokens. Current custom controls retain appropriate semantics and names.
5. Species detail implements the approved sprite/fallback behavior with focused verification.
6. No seed gameplay facts change; structural verification still finds 386 species, 184 evolution rules, 17 Fairy species, valid references, and an acyclic graph.
7. Documents consistently show Phase 2 in progress and identify its outstanding integration work. Future-phase questions remain explicitly pending.
8. A correction-cycle record captures actual changes, RED/GREEN evidence, executed checks, unexecuted checks with reasons, and remaining work. It must not claim to be a completed Phase 2 handoff.

## 5. Approval and Execution Sequence

1. Present this proposal to the Navigator and obtain explicit approval.
2. Record approval in this artifact before any source/configuration implementation.
3. Execute the tasks above using TDD and keep this artifact synchronized with any adaptations.
4. Record verification and report the correction-cycle outcome. Provide exact manual Git commands only where an actual repository is available; do not initialize one automatically.
5. Continue to treat Phase 2 completion and advancement to Phase 3 as separate milestones under the canonical Collaboration Contract.

## 6. Initial Evidence From the Read-Only Review

- Application TypeScript check passed; test TypeScript check failed with TS1308 in the species-detail test mock.
- Prettier reported 13 source files requiring formatting.
- In-memory seed analysis found 386 unique species, 184 unique rules, no missing National Dex IDs, valid rule references and stat totals, 17 Fairy species, and no cycles. ROM extraction was not repeated.
- Full tests and build were not executed during that analysis-only review.
- `git status` reported that the supplied directory was not a Git repository. Tracking and ignore enforcement therefore remain unverified.

These observations are a review snapshot, not current correction-cycle acceptance results.

## 7. Execution Record — November 5, 2026

### Changes and TDD Evidence

- Archived Navigator approval before changing source/configuration. Later recorded separate explicit approval for the two ROM-based BST expectation corrections before changing those assertions.
- Baseline: lint failed on formatting in 13 files; tests failed during compilation with TS1308; production build succeeded with a 298.51 kB initial bundle and no Angular build warnings.
- Replaced the invalid asynchronous expression in the synchronous tree mock with a static import, preserving its behavior assertions.
- RED: after adding regression tests, 15 tests failed and 48 passed (63 total). Thirteen failures exercised new contrast, seed-repair, sprite, and semantics requirements. Two existing failures exposed incorrect BST expectations. The rollback test passed against the existing atomic transaction and preserves that invariant.
- Direct ROM reads confirmed base-stat bytes `[35, 55, 30, 90, 50, 40]` for Pikachu, totaling 300; Bulbasaur totaled 318 and Mewtwo 680. With Navigator approval, corrected card output expectation to `BST 300` and descending sort expectation to `[150, 1, 25]`. No game data, sorting behavior, or display calculation was changed to satisfy those assertions.
- GREEN: seed repair now checks canonical IDs within one transaction and inserts only missing entries; all new regression cases pass. Existing unrelated rows are preserved. Completeness of identifiers is not a content/version migration guarantee.
- Type badges use dark text except on Fighting, Poison, Ghost, Dragon, and Dark backgrounds. Added MYSTERY color `#68a090`; filter choices remain 18 playable types plus Todos.
- Native toggle-button roles are preserved within a named group. Custom filter controls have 48px minimum targets. Detail meters have accessible names; the detail header now supports sprites and inline SVG fallback.
- REFACTOR: formatted source files without changing seed values/order; synchronized current docs and added explicit historical supersession annotations. Stock Material palettes, external asset dependencies, and pending future design questions are documented.
- Contrast unit tests use the documented palette fixture. An initial attempt to read SCSS from the TypeScript test required unavailable Node typings; that approach and its temporary tsconfig change were reverted. The final implementation adds no dependency. Actual SCSS tokens were audited independently against the fixture and foreground function.

### Final Verification

| Check | Actual result |
| --- | --- |
| `npm run lint` | PASS: explicit app/test TypeScript checks and source Prettier check |
| `npm test` | PASS: 13 test files, 63 tests, zero failures |
| `npm run build` | PASS: 298.54 kB initial bundle, zero Angular build errors or warnings |
| Seed structural/content audit | PASS: 386 unique species, 184 unique rules, complete Dex numbering, valid references/stat totals, 17 Fairy species, zero cycles |
| Seed values and order | PASS: semantic SHA-256 before/after `ff857de34cd832db336dd0e91ef34983c839e54cd456fdf0819dcffe6628333d` |
| Actual SCSS type-label contrast | PASS: 19 tokens match the test fixture; minimum contrast 5.53:1 |
| Local Markdown link audit | PASS: all non-placeholder local file/directory targets in AGENTS, README, and docs exist; no `file:///` links remain. Anchor resolution was not checked. |

The final in-sandbox test attempt failed before most suites could run because Vitest could not read its sandbox temporary files (ENOENT). The required rerun outside the sandbox succeeded with all 63 tests. No test was disabled or weakened to handle that environment failure.

Each npm invocation emitted the pre-existing user-configuration warning about `always-auth`. This is distinct from Angular build warnings; global npm configuration was not changed.

### Limits and Remaining Work

- Browser/mobile visual, keyboard, screen-reader, and full WCAG checks were not executed. The catalog route is absent and this cycle verifies existing components, not an integrated catalog. DOM tests and contrast arithmetic do not prove full accessibility compliance.
- Full offline reload/installability was not verified; the service worker remains Phase 5 work. External fonts/icons and remote sprites still need the future caching/fallback policy.
- Git status was attempted again and failed because the supplied directory is not a Git repository. Tracked ROM exclusion, uncommitted-file status, and Git diff cannot be verified here. `.gitignore` contains `*.gba` and `*.sav`; no ROM or save was copied, distributed, or changed. No repository was initialized and no Git mutation was executed. No manual Git mutation commands are prescribed without a verified repository.
- Full ROM extraction was not repeated; only the disputed BST values were checked directly. Seed structural checks cannot independently prove every gameplay fact.
- Phase 2 still requires bootstrap seeding; catalog/tree startup loading and failure handling; the routed catalog page and responsive virtual grid; card-to-sheet integration; actual browser accessibility and launch verification; final phase gates after integration; and `docs/agent-handoffs/phase-2-handoff.md`.
- This artifact is the correction-cycle checkpoint, not a completed Phase 2 handoff. Phase 3 remains pending. No deployment, cloud change, dependency installation/upgrade, or destructive cleanup occurred.

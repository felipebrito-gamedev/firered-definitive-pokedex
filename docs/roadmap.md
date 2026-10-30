# Project Roadmap & Living Phase Tracker

**Project**: Pokémon Definitive Pokédex (FireRed Definitivo PT-BR v2.0.4)  
**Current Phase**: Phase 1 — Project Foundation & Tooling Validation (COMPLETED — PENDING APPROVAL)  
**Next Phase**: Phase 2 — Reference Pokédex & Catalog (READY FOR APPROVAL TO START)  

---

## Standardized Phase Lifecycle Protocol

To guarantee continuity across any AI agent (Google Antigravity, OpenCode, Claude, etc.) and human developers, every phase follows this strict execution workflow:

1. **Phase Planning & Proposal Artifact**: At the beginning of each phase, the agent crafts a comprehensive proposal artifact (e.g. `phase-X-<title>.md`), detailing planned architectural changes, domain invariants, task breakdown, and acceptance criteria, and submits it to the user for explicit approval.
2. **Pre-Implementation Archiving**: Upon receiving user approval, the agent **MUST** save the approved artifact directly to [`docs/approved-artifacts/phase-X-<title>.md`](./approved-artifacts/) **BEFORE writing any production code**.
3. **Implementation with Living Artifact Sync**: Code implementation commences strictly under TDD (RED → GREEN → REFACTOR). If implementation requirements or technical details evolve during the phase, the agent updates the artifact in `docs/approved-artifacts/` to preserve complete parity between plan and code.
4. **Phase Closure & Verification**:
   - Run full verification checks (`npm run lint`, `npm test`, `npm run build` must all pass with 0 errors).
   - Document any unexecuted checks with explicit reasons.
   - Author [`docs/agent-handoffs/phase-X-handoff.md`](./agent-handoffs/).
   - Update milestones in both [`docs/roadmap.md`](./roadmap.md) and [`AGENTS.md`](../AGENTS.md) Section 10.
   - Archive the finalized phase completion artifact in [`docs/approved-artifacts/`](./approved-artifacts/).
   - Provide the exact recommended git commands for the human developer to execute manually in their terminal (agents must **NEVER** run mutating git commands).
   - Request user approval to proceed to the next phase.

---

## Phases Overview

| Phase | Description | Status | Key Deliverables & Milestones |
| :---: | :--- | :---: | :--- |
| **0** | **Discovery & Architecture** | **COMPLETED** | Dataset verification from ROM (`FRDefinitivo-v2.0.4.gba`), 100% DAG evolution graph verification, 4-tier evolution eligibility model, 4-layer security contract, corrected sync conflict safety principle, versioned JSON backup contract, `AGENTS.md` operating manual. |
| **1** | **Project Foundation & Tooling** | **COMPLETED** | Validation and scaffolding of Angular 22 latest stable (`@angular/core@22.2.4` on Node.js v24.22.1 LTS), Vitest v5 unit testing (11 tests passing), Angular Material 22 with custom Pokédex SCSS theme, TDD RED→GREEN domain utility, CI pipeline (`ci.yml`), GitHub Pages base href `/firered-definitive-pokedex/`, full documentation suite (`docs/`). |
| **2** | **Reference Pokédex & Catalog** | *PENDING APPROVAL* | Seed `firered-definitivo-v2.0.4.json` dataset (386 species, 184 evolution rules, 19 types), virtual-scrolled Pokédex catalog, search & type filters, species detail modal. |
| **3** | **Local Player Tracking & Collection** | *PENDING* | Dexie IndexedDB repositories, multi-profile manager (starting empty), specimen tracking (captures, duplicates), atomic evolution transactions, dashboard completion stats, versioned JSON backup & non-destructive restore. |
| **4** | **Authentication & Secure Cloud Sync** | *PENDING* | Firebase Auth (Google Sign-In), Cloud Firestore scoped under `/users/{userId}/profiles/{profileId}`, field-level Firestore Security Rules tested on Local Emulator, outbox sync engine with conflict preservation. |
| **5** | **PWA & Deployment** | *PENDING* | Angular Service Worker caching, GitHub Pages deployment workflow (`deploy.yml`) with base href `/firered-definitive-pokedex/`, mobile viewport optimization, Playwright E2E offline tests. |
| **6** | **Product Polish & Visualizations** | *PENDING* | Interactive evolution family graphs, Brazilian Portuguese UI audit, WCAG AA accessibility verification, final production verification. |

---

## Detailed Milestone Log

### Phase 0 — Discovery and Architecture
- [x] Inspect `Pokedex_Pessoal_FireRed_Definitivo_v2.0.4.xlsm` workbook: 386 species, 184 evolution transitions.
- [x] Inspect binary ROM `FRDefinitivo-v2.0.4.gba`: Verified 19 types (Type ID 18 = FAIRY), Granbull (Normal/Dark), Porygon (Normal/Psychic), and 17 Fairy species.
- [x] Graph Traversal: Confirmed 184 transitions form a 100% Directed Acyclic Graph (DAG) with zero cycles.
- [x] Protect repository: Updated `.gitignore` to strictly exclude `*.gba` and `*.sav`.
- [x] Canonical operating manual established in `AGENTS.md`.
- [x] Established 4-tier evolution eligibility model (`FINAL_STAGE`, `EVOLUTION_PATH_AVAILABLE`, `REQUIREMENTS_REPORTED_MET`, `CONDITION_UNKNOWN`).
- [x] Established corrected synchronization safety principle (preserving committed gameplay events, no reliance on client timestamps).
- [x] Clarified domain contracts: `PokemonEvent`, `SyncOperation`, and atomic local transactions.
- [x] Excluded legacy Excel import from scope; established canonical versioned JSON backup with non-destructive restore tiers.
- [x] Confirmed GitHub Pages base href: `/firered-definitive-pokedex/`.
- [x] Phase 0 architectural baseline formally reviewed and accepted.

### Phase 1 — Project Foundation & Tooling Validation
- [x] Node.js v24.22.1 LTS ("Krypton") runtime confirmed and validated.
- [x] Angular 22.2.4 scaffolded in standalone mode with routing and strict TypeScript.
- [x] Angular Material 22 integrated with custom Pokédex SCSS theme (`$pokedex-red-palette`, 19 Pokémon type color tokens).
- [x] Application shell established with Pokédex toolbar, app title, profile placeholder, and router outlet.
- [x] Vitest v5 unit testing engine configured via `@angular/build:unit-test`.
- [x] TDD cycle completed: RED (6 failures) → GREEN (11/11 passing tests) for National Pokédex number formatting (#001–#386).
- [x] Configured offline-safe production build (font inlining disabled for isolated environments).
- [x] Configured production base href `/firered-definitive-pokedex/` in `angular.json`.
- [x] Created GitHub Actions CI workflow (`.github/workflows/ci.yml`).
- [x] Configured linting script (`tsc --noEmit && prettier --check`).
- [x] Authored full documentation suite: `product-requirements.md`, `data-provenance.md`, and ADRs (ADR-001 through ADR-004).
- [x] Phase 1 handoff summary authored in `docs/agent-handoffs/phase-1-handoff.md`.

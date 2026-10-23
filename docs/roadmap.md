# Project Roadmap & Living Phase Tracker

**Project**: Pokémon Definitive Pokédex (FireRed Definitivo PT-BR v2.0.4)  
**Current Phase**: Phase 0 — Discovery and Architecture (COMPLETED & APPROVED)  
**Next Phase**: Phase 1 — Project Foundation & Tooling Validation (READY FOR APPROVAL TO START)  

---

## Phases Overview

| Phase | Description | Status | Key Deliverables & Milestones |
| :---: | :--- | :---: | :--- |
| **0** | **Discovery & Architecture** | **COMPLETED** | Dataset verification from ROM (`FRDefinitivo-v2.0.4.gba`), 100% DAG evolution graph verification, 4-tier evolution eligibility model, 4-layer security contract, corrected sync conflict safety principle, versioned JSON backup contract, `AGENTS.md` operating manual. |
| **1** | **Project Foundation & Tooling** | *PENDING APPROVAL* | Validation and installation of Angular 22 latest stable (Node.js v24.22.1 LTS), Vitest v5, Angular Material 22, Dexie v4.4, ESLint, Git CI workflow (`ci.yml`), custom Pokédex theme in SCSS, base documentation suite (`docs/`). |
| **2** | **Reference Pokédex & Catalog** | *PENDING* | Seed `firered-definitivo-v2.0.4.json` dataset (386 species, 184 evolution rules, 19 types), virtual-scrolled Pokédex catalog, search & type filters, species detail modal. |
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

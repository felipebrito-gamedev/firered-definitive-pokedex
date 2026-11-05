# Phase 2 — Reference Pokédex & Catalog: Planning & Proposal Artifact

**Project**: Pokémon Definitive Pokédex (FireRed Definitivo PT-BR v2.0.4)  
**Phase**: Phase 2 — Reference Pokédex & Catalog  
**Status**: COMPLETED — approved implementation and scoped verification finished  
**Date**: October 2026  
**Last synchronized**: November 5, 2026 (Phase 2 closure; Phase 3 awaits approval)

**Completion authorization (November 5, 2026)**: The Navigator requested “Complete phase 2,” authorizing execution of this already-approved plan's remaining work. The implementation sequence is archived here before source changes: (1) test startup sequencing/error recovery; (2) wire a bootstrap initializer that seeds and loads catalog/evolution data, retaining a recoverable error state; (3) test and implement the lazy home catalog with CDK virtual rows and responsive column counts; (4) connect card selection to the accessible detail bottom sheet; (5) verify filters, scrolling, branching details, keyboard use, and mobile/desktop layout; (6) run final lint/tests/build and synchronize closure/handoff documents. Use existing dependencies only. Phase 3, cloud work, service workers, and deployment remain outside this authorization.

**Completion design**: A small startup coordinator exposes loading/ready/error signals and deduplicates concurrent initialization. `provideAppInitializer` awaits seeding and catalog/tree loads; initialization failures are caught into localized, retryable page state instead of preventing the shell from rendering. The home route lazy-loads the catalog; `/pokedex` redirects home. CDK fixed-height virtual rows use the existing row-chunk helper, a ResizeObserver for column count, and scroll reset when results/layout change. Detail opening is gated on ready state, with accessible dialog naming and focus restoration. Tests cover observable behavior and preserve existing assertions.

**Prior correction cycle**: [Approved consistency adjustments](./phase-2-consistency-adjustments.md). Source-file presence is not verification evidence. The detail test compilation error was corrected; two erroneous BST expectations required separate Navigator approval and direct ROM verification. See that artifact for executed checks and remaining browser/integration acceptance.

---

## 1. Phase 2 Scope & Objectives

The goal of **Phase 2** is to build the core **Reference Pokédex & Catalog** module. At the end of Phase 2, players will be able to browse all 386 National Pokédex species (#001 Bulbasaur to #386 Deoxys), search instantaneously by name or number, filter by playable types (including Fairy), view base stats, and inspect the verified ROM evolution family trees in a rich modal/bottom sheet.

This phase establishes the read-only catalog foundation before player collection tracking (captures, specimens, and multi-profile journeys) is introduced in Phase 3.

---

## 2. Architecture & Technical Design

```
+---------------------------------------------------------------------------------+
|                               PRESENTATION LAYER                                |
|                                                                                 |
|  +---------------------------------------------------------------------------+  |
|  | PokedexCatalogComponent (Main View) — LAZY HOME ROUTE                      |  |
|  | - Search & Filter Bar (Name/Number, Type Chips, Sort Dropdown)           |  |
|  | - Results Metric Counter ("Exibindo 386 de 386 Pokémon")                  |  |
|  | - Virtual / Responsive Grid of PokemonCardComponent                       |  |
|  +---------------------------------------------------------------------------+  |
|                                       |                                         |
|  +------------------------------------+--------------------------------------+  |
|  | PokemonCardComponent                      | SpeciesDetailComponent        |  |
|  | - #001 formatDexNumber()                  | - Base stats bars             |  |
|  | - Species name                            | - BST calculation             |  |
|  | - Type badges (CSS vars)                  | - ROM Evolution Family Tree   |  |
|  | - BST Pill & Sprite with fallback         | - ROM-specific triggers       |  |
|  +-------------------------------------------+-------------------------------+  |
+---------------------------------------------------------------------------------+
                                        |
                                        v
+---------------------------------------------------------------------------------+
|                                 DOMAIN LAYER                                    |
|                                                                                 |
|  +---------------------------------------------------------------------------+  |
|  | PokedexCatalogService (Angular Signals Reactive State)                    |  |
|  | - searchTerm = signal('')                                                 |  |
|  | - selectedType = signal<PokemonType | null>(null)                         |  |
|  | - sortOrder = signal<'id_asc' | 'id_desc' | 'name_asc' | 'bst_desc'>      |  |
|  | - allSpecies = signal<Species[]>([])                                      |  |
|  | - filteredSpecies = computed(...)                                         |  |
|  +---------------------------------------------------------------------------+  |
|  | EvolutionTreeService: Resolves incoming & outgoing DAG branches for sheet  |  |
+---------------------------------------------------------------------------------+
                                        |
                                        v
+---------------------------------------------------------------------------------+
|                          LOCAL PERSISTENCE LAYER                                |
|                                                                                 |
|  +---------------------------------------------------------------------------+  |
|  | Dexie.js v4 Database (DefinitivePokedexDB)                                |  |
|  | - Schema v1:                                                              |  |
|  |   - species: 'id, name, primaryType, secondaryType, [primaryType+secondaryType]' |
|  |   - evolutionRules: 'id, fromSpeciesId, toSpeciesId, method'              |  |
|  | - Seed source: src/app/core/data/pokedex-seed.data.ts                     |  |
|  | - DatabaseInitializerService: atomic, idempotent seed (wired at   |  |
|  |   bootstrap; catalog/tree loads awaited)                                         |  |
|  +---------------------------------------------------------------------------+  |
+---------------------------------------------------------------------------------+
```

---

## 3. Seed Dataset Specification

Canonical seed is a TypeScript constants module (not a separate JSON asset):

`src/app/core/data/pokedex-seed.data.ts`

1. **Species Dataset (386 entries)**:
   - Directly derived from verified ROM binary offsets (`gBaseStats` at `0x254784`, `sSpeciesToNationalPokedexNum` at `0x251fee`).
   - Fields: `id` (1–386), `internalId` (1–411), `name`, `primaryType`, `secondaryType` (or null), `baseStats` (`hp`, `attack`, `defense`, `speed`, `spAttack`, `spDefense`, `total`), optional `spriteUrl`.
   - Verified ROM Quirks:
     - **Granbull (#210)**: `NORMAL` / `DARK`
     - **Porygon (#137)**: `NORMAL` / `PSYCHIC`
     - **17 Fairy Pokémon** correctly assigned `FAIRY`
2. **Evolution Rules Dataset (184 entries)**:
   - Derived from verified workbook `sheet3.xml` and ROM evolution tables.
   - Fields: `id` (string, e.g. `evo_1_2_0`), `fromSpeciesId`, `toSpeciesId`, `method` (`LEVEL_UP` | `ITEM` | `HAPPINESS` | `PERSONALITY` | `SPECIAL`), `condition` (pt-BR trigger text), optional `minLevel`, `item`, `isRomModification`, `notes`.
   - Former trade evolutions are stored as `LEVEL_UP` or `ITEM` with `isRomModification: true` (there is no `TRADE_REPLACEMENT` method enum).
   - Verified ROM Trade Replacements included:
     - Kadabra → Alakazam (Lv 48)
     - Machoke → Machamp (Lv 48)
     - Graveler → Golem (Lv 45)
     - Haunter → Gengar (Lv 44)
     - Onix → Steelix (Lv 47)
     - Scyther → Scizor (Lv 47)
     - Seadra → Kingdra (Lv 47)
     - Porygon → Porygon2 (Lv 43)
     - Poliwhirl → Politoed (Lv 46)
     - Slowpoke → Slowking (Water Stone)
     - Eevee → Espeon (Sun Stone) / Umbreon (Moon Stone)
     - Clamperl → Huntail / Gorebyss (Lv 36 Personality Branches)
     - Nincada → Ninjask & Shedinja (Lv 20 Special)

---

## 4. Dependencies to Install

In accordance with `AGENTS.md` Section 7:
- **`dexie@^4.4.7`**: Typed IndexedDB client for local persistence (**installed**; lockfile `dexie@4.4.7`).
- **`fake-indexeddb`**: Dexie test double for Vitest (**installed**).

---

## 5. Living Implementation Notes (parity with code)

These adaptations were recorded during implementation so the artifact does not drift:

1. **Seed format**: TypeScript module `pokedex-seed.data.ts` instead of `src/assets/data/firered-definitivo-v2.0.4.json`. The original plan allowed either form.
2. **Dexie primary keys**: Schema uses explicit `id` (National Dex / rule id), not auto-increment `++id`.
3. **Evolution methods**: `TRADE_REPLACEMENT` was not added. ROM trade replacements use `LEVEL_UP` or `ITEM` plus `isRomModification`.
4. **Trigger text field**: Implemented as `condition` (pt-BR), not `descriptionPtBr`.
5. **Type filter chips**: 18 playable types including Fairy, plus a "Todos" chip. `MYSTERY` (`???`) exists on the type union but is not a catalog filter chip.
6. **Bootstrap**: `provideAppInitializer` lazy-loads the startup coordinator, awaits idempotent seeding and catalog/tree loading, and exposes recoverable error/retry state. Exact fresh-table counts are verified through the application initializer integration test; a real browser launch/reload displays the full catalog.
7. **Catalog page**: The lazy home route renders `PokedexCatalogComponent`; `/pokedex` redirects home. CDK fixed-height 280px rows use responsive columns, reset scrolling on result/layout changes, and open named detail sheets. Focus returns to the original card or the list when resizing replaced the card.
8. **Sprites**: Optional remote URLs with inline SVG fallbacks on both card and detail. External fonts/icons remain dependencies; full offline application reload/installability remains Phase 5 work.
9. **Seed repair**: Within one transaction, inspect canonical IDs in both tables and insert missing entries. Do not delete unrelated records or treat this as a dataset-revision migration.
10. **Verification**: Lint explicitly checks app/test configurations then Prettier. Regression tests cover missing reference entries, rollback, type contrast, filter semantics, and detail sprite fallback/meter names. The MYSTERY color token completes the 19-token palette.
11. **Theme/accessibility**: Material stock red/azure palettes coexist with separate brand tokens. Scoped desktop/mobile browser checks passed; full release WCAG and assistive-technology certification remains Phase 6 work. Light custom family surfaces explicitly retain dark text.
12. **Bundle budget**: The initial integration build exceeded 500 kB. Lazy-loading the startup coordinator and seed module reduced the final initial bundle to 397.91 kB without increasing budgets. The seed import completes before the transaction opens.
13. **Mobile polish**: Material owns detail scrolling, avoiding nested scrollbars. A regression test preserves focus recovery when virtualization or resizing removes a sheet trigger.

---

## 6. Detailed Task Breakdown & Execution Plan

### Step 2.1: Local Persistence & Dataset Seeding
- [x] Install `dexie@^4.4.7`.
- [x] Define `Species` and `EvolutionRule` domain models in `src/app/core/domain/models/`.
- [x] Create static seed dataset `src/app/core/data/pokedex-seed.data.ts` (386 species + 184 evolution transitions).
- [x] Implement `DefinitivePokedexDB` extending `Dexie` with schema v1.
- [x] Implement `DatabaseInitializerService` (idempotent, atomic seed). **Application-launch wiring and recoverable startup are complete.**
- [x] **TDD**: Unit tests verifying 386 species, 184 rules, no duplicates, Granbull, Porygon, Fairy count, Kadabra Lv 48.

### Step 2.2: Reactive Domain Services
- [x] Implement `PokedexCatalogService`:
  - Signals: `searchTerm`, `selectedType`, `sortOrder`, `allSpecies`.
  - Computed signal: `filteredSpecies` handling case-insensitive name matching, `#001` or `1` number matching, type filtering, and multi-criteria sorting.
- [x] Implement `EvolutionTreeService`:
  - Methods to query ancestors and descendants for any given species ID.
  - Builds the evolution family graph as a clean tree structure for UI rendering.
- [x] **TDD**: Unit tests for search matching, type filtering, BST sorting, and evolution tree resolution.

### Step 2.3: Pokédex Catalog Presentation Components
- [x] Implement `PokemonCardComponent`:
  - Padded `#001` number, Pokémon name, type pills styled with `--type-*` variables.
  - Base stat total badge.
  - Sprite image loader with placeholder/fallback SVG.
  - Accessible button trigger (emits `selected`; parent must open details).
- [x] Implement `PokedexFilterComponent`:
  - Search input with clear button.
  - Horizontal chip list for playable types (including "Todos" / clear filter).
  - Sort dropdown (Número crescente, Número decrescente, Nome A–Z, BST maior).
  - Active count metric ("Exibindo X de Y Pokémon").
- [x] Implement `PokedexCatalogComponent` (route `/` or `/pokedex`):
  - Integrates filter bar and virtual/responsive grid layout.
- [x] **TDD**: Catalog page tests verifying rendering, search input reactivity, type chip filtering, and opening the detail sheet. (Card and filter specs already exist.)

### Step 2.4: Species Detail Sheet / Modal
- [x] Implement `SpeciesDetailComponent` (Angular Material `MatBottomSheet`):
  - Species header with sprite, name, types, and National Dex number.
  - Base Stats visualization: Meter bars with intensity classes and exact numerical values (HP, Ataque, Defesa, Atq. Esp., Def. Esp., Velocidade, Total).
  - Evolution Family Tree component: Visual sequence displaying origin species, evolution trigger badge (e.g., "Nível 48", "Pedra da Água"), and destination species. Callout for ROM-specific mechanics ("Alterado no FireRed Definitivo").
- [x] **TDD**: Unit tests verifying stats rendering and evolution trigger formatting (`species-detail.component.spec.ts`).

### Step 2.5: Integration & Verification
- [x] Connect home route `/` to `PokedexCatalogComponent`.
- [x] Wire `DatabaseInitializerService` + catalog/tree `load()` on application start.
- [x] Open `SpeciesDetailComponent` from a card selection.
- [x] Execute complete regression checks:
  - `npm run lint` (0 errors)
  - `npm test` (100% passing tests)
  - `npm run build` (production build succeeds within budget)
- [x] Verify accessibility (WCAG AA): aria labels, color contrast for type pills, keyboard focus navigation.
- [x] Author `docs/agent-handoffs/phase-2-handoff.md`.
- [x] Update `docs/roadmap.md` and `AGENTS.md` Section 10 to **COMPLETED** only after the checks above pass.
- [x] Provide exact recommended git commands for manual execution by the developer.

---

## 7. Acceptance Criteria for Phase 2

1. **Data Integrity**: Exactly 386 species and 184 evolution transitions are seeded in IndexedDB on a real application launch. Granbull is Normal/Dark, Porygon is Normal/Psychic, and 17 Fairy types are present.
2. **Instant Search & Filtering**:
   - Typing "pika" or "025" or "25" filters to Pikachu instantaneously.
   - Selecting "Fada" filters exclusively to the 17 verified Fairy Pokémon.
   - Filtering is computed from Angular Signals (`filterCatalogSpecies`).
3. **Detail Modal & Evolution Visualization**:
   - Clicking any Pokémon displays its base stat bars and full evolution path.
   - Kadabra shows evolution to Alakazam at Level 48 with an explicit ROM change indicator.
   - Branching evolutions (Eevee, Gloom, Poliwhirl, Tyrogue, Wurmple, Clamperl) render all independent branches correctly.
4. **Quality Gates**:
   - `npm test` passes with 100% green status across all unit tests.
   - `npm run lint` passes with explicit app/test TypeScript checks and source Prettier checks.
   - `npm run build` succeeds with zero errors and zero warnings.
5. **Strict Git Ban Enforced**: AI agent performs zero repository-modifying git commands; exact commands are provided for developer manual execution.

---

## 8. Phase Closure and Next Gate

All implementation items above are complete. Final lint, 73 tests across 15 files, and production build passed; initial bundle 397.91 kB with zero Angular errors/warnings. Scoped browser checks passed at desktop 1024×900 and mobile 320/390×844 CSS viewports. The [Phase 2 handoff](../agent-handoffs/phase-2-handoff.md) records test evidence, browser observations, manual Git commands, and explicit verification limits.

Phase 3 remains pending. Obtain approval for its plan before implementing player state.

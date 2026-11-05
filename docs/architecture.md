# System Architecture & Technical Design

**Project**: Pokémon Definitive Pokédex (FireRed Definitivo PT-BR v2.0.4)  
**Status**: Approved Baseline  
**Stack in the repository**: Angular core 22.2.4; CLI/build/Material/CDK 22.2.5; TypeScript ~6.0.2 (resolved 6.0.3, strict); Dexie 4.4.7; Vitest 5.0.5. Runtime baseline 24.22.1, observed 24.22.2.  
**Stack specified for later phases**: Firebase Auth & Firestore (Phase 4), Angular Service Worker and GitHub Pages deployment (Phase 5)  
**Current delivery phase**: Phase 2 — Reference Pokédex & Catalog (completed); Phase 3 awaits approval  

---

## 1. High-Level Architecture Overview

The **Definitive Pokédex** is built on pragmatic Clean Architecture with mobile-first Progressive Web Application (PWA) principles. The durable client database is IndexedDB through Dexie.js. Phase 4 adds Cloud Firestore synchronization through an outbox queue when the device is online.

The diagram below is the approved **target** architecture through Phase 4. In the current Phase 2 repository, the coded slices are the catalog presentation components listed in section 2, the reference domain models (`Species`, `EvolutionRule`, `PokemonType`), and Dexie schema v1 (`species`, `evolutionRules`). Profile, specimen, event, and sync paths are specified for Phases 3 and 4.

```
+-------------------------------------------------------------------------+
|                           PRESENTATION LAYER                            |
|             Angular 22 (Standalone Components, Signals UI)              |
|          Angular Material 22 + Custom Mobile-First Pokédex SCSS         |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
|                              DOMAIN LAYER                               |
|   Phase 2: Species, EvolutionRule, catalog & family-tree services       |
|   Phase 3: Player entities, 4-tier engine, ProfileContextService        |
+-------------------------------------------------------------------------+
                                    |
         +--------------------------+--------------------------+
         v                                                     v
+----------------------------------+        +-----------------------------+
|        LOCAL PERSISTENCE         |        |      CLOUD PERSISTENCE      |
|  Dexie.js v4 (IndexedDB)         |        |  Phase 4 — Cloud Firestore  |
|  Phase 2: species, evolutionRules| <====> |  - /users/{uid}/profiles/...|
|  Phase 3: profiles, specimens,   |  Sync  |  - Security Rules Enforced  |
|           events, syncQueue      | Engine |  - Firebase Auth (Google)   |
+----------------------------------+        +-----------------------------+
```

---

## 2. Layer Responsibilities

### Presentation Layer (`src/app/features/` & `src/app/shared/`)
- Phase 2 catalog UI lives under `src/app/features/pokedex/`: `PokemonCardComponent`, `PokedexFilterComponent`, `SpeciesDetailComponent`, `EvolutionFamilyTreeComponent`, and the routed `PokedexCatalogComponent`.
- `PokedexCatalogComponent` is lazy-routed at home; `/pokedex` redirects home. Its CDK virtual rows reflow from one to four columns using ResizeObserver, reset scroll on result/layout changes, and open a named `SpeciesDetailComponent` sheet from card selection. The sheet uses Material-owned scrolling and restores focus to the original trigger or the list if the trigger was removed.
- `src/app/shared/` is reserved for later shared UI and is empty.
- Pure standalone components using Angular Signals for fine-grained reactivity.
- Mobile-first responsive layouts utilizing Angular Material 22 components styled with custom Pokédex SCSS design tokens (Crimson Red `#DC0A2D`, Dark Slate `#2A2A2A`, Off-White surface `#F7F7F7`).
- Zero direct dependencies on Firestore or IndexedDB; presentation consumes domain services and signals.
- Catalog/detail copy is structured in `UI_MESSAGES` and type labels for pt-BR and future i18n support. Shell literals still require extraction before a future translation layer.
- Material uses stock red/azure palettes; separate brand tokens style custom surfaces and the toolbar. All 19 type tokens exist; 18 playable types appear in filters.
- Card/detail sprites have inline SVG fallbacks. External font/icon stylesheets remain network dependencies; offline application reload/installability is Phase 5 work. Scoped browser checks cover keyboard use, labels, targets, and overflow on desktop/mobile. These and unit contrast checks are not full release WCAG or screen-reader certification; see the Phase 2 handoff.

### Domain Layer (`src/app/core/domain/`)

**Coded in Phase 2:**
- Models in `src/app/core/domain/models/`: `Species`, `EvolutionRule`, `PokemonType`.
- Catalog filter (`catalog-filter.ts`, including `chunkSpeciesRows`) and evolution family tree builder (`evolution-tree.ts`).
- `PokedexCatalogService` and `EvolutionTreeService` in `src/app/core/pokedex/`.

**Specified for Phase 3** (contract in `docs/domain-model.md`; no TypeScript modules in the repository yet):
- Entities: `PlayerProfile`, `PokemonSpecimen`, `SpeciesRegistration`, `PokemonEvent`.
- 4-tier evolution eligibility engine:
  - `FINAL_STAGE`
  - `EVOLUTION_PATH_AVAILABLE`
  - `REQUIREMENTS_REPORTED_MET`
  - `CONDITION_UNKNOWN`
- Invariants that engine must enforce:
  - Evolving a specimen mutates its species while preserving specimen identity (`id`).
  - Destination species is automatically registered; original species remains registered.
  - Ownership is decoupled from Pokédex registration.
  - Multi-specimen duplicate support (e.g. multiple Eevees/Pikachus).
  - Independent branching evolution paths (evolving to Vaporeon does not register Jolteon or Flareon).
- `ProfileContextService`: reactive signal boundary providing `activeProfileId`, derived specimen lists, and progress metrics with zero cross-profile state leakage.

### Local Persistence Layer (`src/app/core/persistence/`)

**Coded in Phase 2:**
- Dexie.js v4 database `DefinitivePokedexDB`, schema v1: `species` and `evolutionRules`, seeded from `src/app/core/data/pokedex-seed.data.ts`. Primary keys are explicit `id` values.
- `DatabaseInitializerService` performs an idempotent seed. The seed transaction checks canonical identifiers in both reference tables and inserts missing entries without deleting unrelated rows. Existing values are not a versioned migration target; future reference revisions require an explicit policy. The bootstrap initializer lazy-loads `PokedexStartupService`, which seeds first and then awaits catalog/tree loads before ready state. Failure resolves into localized retryable page state so the shell remains usable. The coordinator deduplicates concurrent starts. The seed module loads before the Dexie transaction, avoiding IndexedDB auto-close during module fetch and keeping metadata outside the initial shell bundle.

**Specified for Phase 3:**
- Typed repositories for profiles, specimens, registrations, and events.
- Durable local operations: every mutation (capture, evolution, release) is written to IndexedDB first before entering the synchronization pipeline.
- Atomic multi-record transactions for operations affecting specimens, registrations, history, and events (e.g., evolution and Nincada dual-specimen generation).
- Atomic outbox insertion is Phase 3 work; network delivery and reconciliation are Phase 4 work.

Lint gate: `npm run lint` runs `tsc --noEmit -p tsconfig.app.json`, `tsc --noEmit -p tsconfig.spec.json`, and the source Prettier check. Angular test/build verifies template compilation. ESLint is not installed.

### Cloud Persistence & Sync Layer (Phase 4)

`src/app/core/sync/` and `src/app/core/auth/` are introduced in Phase 4. The approved contract for that phase is:

- Firebase Authentication with Google Sign-In (`firebase/auth`).
- Outbox Queue Synchronization (`SyncEngine`):
  - Consumes durable `SyncOperation` records atomically enqueued by Phase 3 local writes, including event records.
  - Dispatches operations in batches to Cloud Firestore under `/users/{userId}/profiles/{profileId}`.
  - Guarantees idempotency via unique `idempotencyKey`.
  - Conflict resolution safety: Preserves committed gameplay events and prevents silent data loss. Client timestamps alone are not treated as conflict-proof; unresolvable conflicts preserve conflicting data for explicit user resolution.
  - Soft-deletes with tombstones (`isDeleted: true`) ensure deletion propagation without recreation.

---

Sections 3 and 4 are the approved target contracts for Phases 3 and 4. They are the rules later phases must implement. They are not a description of modules present in the Phase 2 tree.

## 3. Account and Multi-Profile Security Boundary (Phase 4 contract)

```
[Google Account Authentication: userId] <--- SOLE AUTHORIZATION BOUNDARY
           │
           ├── Profile 1: "Ash" (profileId_1)     <--- Independent gameplay journey
           ├── Profile 2: "Gary" (profileId_2)    <--- Independent gameplay journey
           └── Profile 3: "Family" (profileId_3)  <--- Independent gameplay journey
```

1. **Account Boundary**: The Firebase Auth UID (`userId`) is the sole authorization security boundary. Firestore Security Rules enforce `request.auth.uid == userId` on all document reads and writes.
2. **Profile Isolation**: Profiles under the same account are independent gameplay journeys, not separate authenticated principals. Children can safely track journeys under a parent's account without requiring separate Google accounts.
3. **4-Layer Isolation Guarantee**:
   - **UI Layer**: Signal boundaries and route guards guarantee reactive state is purged when switching profiles or signing out.
   - **Local Storage Layer**: Dexie queries filter strictly by composite keys (`userId`, `profileId`).
   - **Sync Layer**: Outbox sync operates only within `/users/{userId}/profiles/{profileId}`.
   - **Cloud Security Rules**: Enforced at the database engine level.

---

## 4. Offline-First Data Flow (Phase 3 local writes, Phase 4 sync)

```
[User Action: Capture / Evolve]
               │
               v
  [Dexie Atomic Transaction]
  ├── Update PokemonSpecimen
  ├── Upsert SpeciesRegistration
  ├── Insert PokemonEvent
  └── Enqueue SyncOperations for specimen, registration, and event (outbox)
               │
      (Local UI updates instantly via Signals)
               │
               v
     [Network Status Check]
     ├── If Offline: Wait for online event
     └── If Online & Authenticated:
             │
             v
       [SyncEngine Batch Worker]
       ├── Dispatch batched writes to Firestore
       ├── Acknowledge success -> Remove from syncQueue
       └── On failure -> Retry with exponential backoff
```

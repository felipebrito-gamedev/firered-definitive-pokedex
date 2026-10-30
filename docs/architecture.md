# System Architecture & Technical Design

**Project**: Pokémon Definitive Pokédex (FireRed Definitivo PT-BR v2.0.4)  
**Status**: Approved Baseline  
**Stack**: Angular 22, TypeScript 5.8 (Strict), Dexie.js v4, Firebase Auth & Firestore, Vitest v5, GitHub Pages  

---

## 1. High-Level Architecture Overview

The **Definitive Pokédex** is built on pragmatic Clean Architecture with mobile-first Progressive Web Application (PWA) principles. It operates completely **offline-first**, using IndexedDB (Dexie.js) as the durable client database, and synchronizes transparently with Cloud Firestore via an Outbox Queue engine when online.

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
|        Entities, Value Objects, 4-Tier Evolution Engine, Invariants     |
|         ProfileContextService (Active profile signal & isolation)       |
+-------------------------------------------------------------------------+
                                    |
         +--------------------------+--------------------------+
         v                                                     v
+----------------------------------+        +-----------------------------+
|        LOCAL PERSISTENCE         |        |      CLOUD PERSISTENCE      |
|  Dexie.js v4 (IndexedDB)         |        |  Cloud Firestore            |
|  - Species (Static Reference)    | <====> |  - /users/{uid}/profiles/...|
|  - EvolutionRules (Static)       |  Sync  |  - Security Rules Enforced  |
|  - Profiles, Specimens, Events   | Engine |  - Firebase Auth (Google)   |
|  - SyncQueue (Outbox pattern)    |        |                             |
+----------------------------------+        +-----------------------------+
```

---

## 2. Layer Responsibilities

### Presentation Layer (`src/app/features/` & `src/app/shared/`)
- Pure standalone components using Angular Signals for fine-grained reactivity.
- Mobile-first responsive layouts utilizing Angular Material 22 components styled with custom Pokédex SCSS design tokens (Crimson Red `#DC0A2D`, Dark Slate `#2A2A2A`, Off-White surface `#F7F7F7`).
- Zero direct dependencies on Firestore or IndexedDB; presentation consumes domain services and signals.
- All user-facing strings are structured for pt-BR with future i18n support.

### Domain Layer (`src/app/core/domain/`)
- Pure TypeScript business entities: `Species`, `EvolutionRule`, `PlayerProfile`, `PokemonSpecimen`, `SpeciesRegistration`, `PokemonEvent`.
- 4-Tier Evolution Eligibility Engine:
  - `FINAL_STAGE`
  - `EVOLUTION_PATH_AVAILABLE`
  - `REQUIREMENTS_REPORTED_MET`
  - `CONDITION_UNKNOWN`
- Enforces mandatory business invariants:
  - Evolving a specimen mutates its species while preserving specimen identity (`id`).
  - Destination species is automatically registered; original species remains registered.
  - Ownership is decoupled from Pokédex registration.
  - Multi-specimen duplicate support (e.g. multiple Eevees/Pikachus).
  - Independent branching evolution paths (evolving to Vaporeon does not register Jolteon or Flareon).
- `ProfileContextService`: Reactive signal boundary providing `activeProfileId`, derived specimen lists, and progress metrics with zero cross-profile state leakage.

### Local Persistence Layer (`src/app/core/persistence/`)
- Dexie.js v4 database (`DefinitivePokedexDB`) with typed repositories.
- Durable local operations: Every mutation (capture, evolution, release) is written to IndexedDB first before entering the synchronization pipeline.
- Atomic multi-record transactions for operations affecting specimens, registrations, history, and events (e.g., evolution and Nincada dual-specimen generation).

### Cloud Persistence & Sync Layer (`src/app/core/sync/` & `src/app/core/auth/`)
- Firebase Authentication with Google Sign-In (`firebase/auth`).
- Outbox Queue Synchronization (`SyncEngine`):
  - Enqueues durable `SyncOperation` records on every local write.
  - Dispatches operations in batches to Cloud Firestore under `/users/{userId}/profiles/{profileId}`.
  - Guarantees idempotency via unique `idempotencyKey`.
  - Conflict resolution safety: Preserves committed gameplay events and prevents silent data loss. Client timestamps alone are not treated as conflict-proof; unresolvable conflicts preserve conflicting data for explicit user resolution.
  - Soft-deletes with tombstones (`isDeleted: true`) ensure deletion propagation without recreation.

---

## 3. Account and Multi-Profile Security Boundary

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

## 4. Offline-First Data Flow

```
[User Action: Capture / Evolve]
               │
               v
  [Dexie Atomic Transaction]
  ├── Update PokemonSpecimen
  ├── Upsert SpeciesRegistration
  ├── Insert PokemonEvent
  └── Enqueue SyncOperation (outbox)
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

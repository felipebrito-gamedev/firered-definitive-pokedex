# Product Requirements Specification

## 1. Product Overview & Purpose
**Pokémon Definitive Pokédex** is a mobile-first, offline-first Progressive Web Application (PWA) tailored specifically for the ROM hack **Pokémon FireRed Definitivo PT-BR v2.0.4**. 

Unlike generic Pokédex references, this application serves as an interactive **personal collection and playthrough tracker**. It allows players to manage multiple independent playthrough journeys per user account, track caught specimens (including duplicates and branching evolutions), record Pokédex registrations, plan evolutions based on ROM-verified rules, and safely backup or synchronize progress across devices.

---

## 2. Target Dataset Specification
- **Base Game / Hack**: Pokémon FireRed Definitivo PT-BR v2.0.4 (`FRDefinitivo-v2.0.4.gba`).
- **Pokedex Scope**: National Pokédex #001 (Bulbasaur) through #386 (Deoxys).
- **Type System**: 19 types (standard Gen 3 Types 0–17 plus Type ID 18 = FAIRY).
- **Evolution Graph**: 184 custom transitions verified as a 100% Directed Acyclic Graph (zero cycles). All trade evolutions replaced with level-up or item triggers.
- **Provenance & Verification**: All game data is extracted from the verified ROM binary (`gBaseStats` at `0x254784`, `sSpeciesToNationalPokedexNum` at `0x251fee`). The author's Excel workbook serves as development reference only.
- **Scope Boundary**: There is **NO legacy spreadsheet importer**. All player profiles start with empty progress by default.

---

## 3. User Personas & Core Journeys

### Persona A: Casual Collector / Playthrough Player
- Plays FireRed Definitivo on mobile or handheld emulator.
- Wants a fast, offline-capable Pokédex on their phone to look up where and when Pokémon evolve.
- Logs captures as they happen without requiring an internet connection.

### Persona B: Living Pokédex & Completionist Tracker
- Retains living specimens (e.g. catches 5 Eevees to obtain all evolution branches: Vaporeon, Jolteon, Flareon, Espeon, Umbreon).
- Needs clear distinction between **physical specimens owned** vs. **species registered** in the Pokédex.
- Wants to verify whether a Pokémon is in its final evolutionary stage or can still evolve.

### Persona C: Multi-Save Player (Shared Account / Multiple Runs)
- Has multiple playthroughs (e.g., "Nuzlocke Run", "Mono-Fairy Challenge", "Standard Run").
- Needs independent tracking per profile under the same account with zero cross-profile state leakage.

---

## 4. Functional Scope & Feature Modules

### Feature 1: National Pokédex Catalog & Reference
- **F1.1**: Browse species #001 to #386 with search by name, number (#001–#386), and filtering by primary/secondary type.
- **F1.2**: Detailed species view showing base stats (HP, Atk, Def, SpA, SpD, Speed, BST), types (including Fairy), and verified evolution paths.
- **F1.3**: Visual indication of ROM-specific evolutions (e.g. Kadabra evolving at Lv 48, Slowpoke evolving to Slowking with Water Stone).

### Feature 2: Specimen Tracking & Collection Management
- **F2.1 Specimen Creation**: Capture/register a specimen of any species with optional level, nickname, capture date, and acquisition method (Wild, Gift, Egg, Trade).
- **F2.2 Specimen vs. Registration Separation**: Catching a specimen automatically registers the species. Releasing or evolving a specimen leaves the species registered permanently.
- **F2.3 Duplicate Specimen Support**: Players may catch and retain multiple specimens of the identical species (e.g., 3 Pikachus) with distinct identifiers, levels, and histories.
- **F2.4 Evolution Execution**: Evolving a specimen mutates its current species and records an immutable entry in `evolutionHistory`, preserving its unique specimen ID. The destination species is automatically registered.
- **F2.5 Branching Evolution Support**: Evolving a specimen along a branch (e.g. Eevee → Vaporeon) leaves alternate branches (Jolteon, Flareon, etc.) unregistered until independently obtained.
- **F2.6 4-Tier Evolution Eligibility**:
  - `FINAL_STAGE`: Species has no outgoing transitions.
  - `EVOLUTION_PATH_AVAILABLE`: Species has descendants, but requirements are not verified met.
  - `REQUIREMENTS_REPORTED_MET`: Reported level or item conditions verified met.
  - `CONDITION_UNKNOWN`: Evolution depends on unverified in-game factors (e.g. Clamperl personality branch).

### Feature 3: Multi-Profile Management
- **F3.1 Multi-Journey Tracking**: Create, switch, rename, and archive distinct profiles under one account.
- **F3.2 Strict In-Memory Signal Boundary**: Switching profiles flushes in-memory reactive signals immediately, eliminating cross-profile state bleeding.
- **F3.3 Scoped Persistence**: All specimen, registration, and event queries strictly isolate by `profileId`.

### Feature 4: Local Persistence & Offline-First Operation
- **F4.1 Local IndexedDB**: All operations write durably to Dexie.js v4 before any network operation.
- **F4.2 Full Offline Usability**: The app remains fully functional without network access (browsing, capturing, evolving, profile creation, and backup export/import).
- **F4.3 Atomic Transactions**: Multi-entity mutations (captures, evolutions, special splits) execute in a single Dexie transaction.

### Feature 5: Canonical Backup & Restoration
- **F5.1 Versioned JSON Export**: Full offline export of profile data, specimens, registrations, and event history with explicit `schemaVersion`.
- **F5.2 Integrity Validation**: Zod-based schema validation of backup files before import.
- **F5.3 Non-Destructive Restore Policy**:
  1. *Restore as a new profile* (default).
  2. *Merge with existing profile* (only when deterministic merge semantics are tested).
  3. *Replace existing profile* (only with explicit confirmation).
- **F5.4 Zero Firebase Dependency**: Backup and restore work 100% offline without Firebase authentication or network connectivity.

### Feature 6: Cloud Synchronization & Authentication (Phase 4)
- **F6.1 Google Sign-In**: Firebase Authentication (Google provider) via Firebase Modular SDK v13.
- **F6.2 Outbox Queue**: Offline mutations enqueue in `syncQueue` and drain via exponential backoff.
- **F6.3 Cloud Security Rules**: Firestore security rules enforce `request.auth.uid == userId` and validate document immutability.
- **F6.4 Conflict Safety**: Preserves committed gameplay events; does not rely solely on client timestamps for conflict safety.

---

## 5. Non-Functional Requirements & Constraints
- **Zero-Cost Constraint**: Operates entirely within free service tiers (Firebase Spark plan, GitHub Pages hosting, local IndexedDB).
- **Language Contract**: Source code, test suites, architecture docs, and commit messages are in **English**. All user-facing UI labels, error messages, and type names are in **Brazilian Portuguese (pt-BR)**.
- **Accessibility**: Compliant with WCAG 2.1 AA standards for contrast, touch targets (≥ 48x48px), and keyboard navigation.
- **Performance Budget**: Initial bundle < 500 kB (enforced by Angular CLI budget: 500 kB warning, 1 MB error).
- **Target Platform**: Node.js v24.22.1 LTS, Angular 22 standalone, Angular Material 22, modern mobile and desktop evergreen browsers (Chrome, Firefox, Safari, Edge).

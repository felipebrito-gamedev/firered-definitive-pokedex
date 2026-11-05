# Pokémon Definitive Pokédex (FireRed Definitivo PT-BR v2.0.4)

A mobile-first, offline-first Pokédex and collection tracker in development. Phase 2 is complete: startup seeds the reference catalog and loads its services, and the routed catalog provides search, type filters, sorting, responsive virtual rows, and species/evolution detail sheets. Collection tracking, cloud sync, and installable PWA delivery follow in later phases.

## Overview
- **ROM Target**: Pokémon FireRed Definitivo PT-BR v2.0.4 (#001 Bulbasaur through #386 Deoxys).
- **Purpose**: Enables independent player journeys (multiple profiles per account) to track Pokédex registrations, owned specimens, duplicate captures, branching evolution paths, and completion metrics with full offline persistence.
- **Dataset Provenance**: 100% Directed Acyclic Graph (184 evolution transitions) and 19 types (including Fairy, Normal/Dark Granbull, and Normal/Psychic Porygon) verified directly against the game binary.

## Tech Stack
- **Framework**: Angular 22 (Standalone Components, Angular Signals)
- **Language**: TypeScript ~6.0.2 (strict mode: `strict`, `noImplicitAny`, `strictNullChecks`)
- **Local Persistence**: Dexie.js v4 (IndexedDB)
- **Cloud Persistence & Auth (planned Phase 4; not installed)**: Firebase Modular SDK v13 (Google Sign-In & Cloud Firestore)
- **UI Library**: Angular Material 22 with Custom Pokédex SCSS Theme
- **Testing**: Vitest v5 (`@angular/build:unit-test` with jsdom); Playwright is planned for Phase 5
- **Hosting (planned Phase 5)**: GitHub Pages (`/firered-definitive-pokedex/`); base href is configured, deployment is pending

The lockfile resolves Angular core 22.2.4, CLI/build/Material/CDK 22.2.5, TypeScript 6.0.3, Dexie 4.4.7, and Vitest 5.0.5. Material uses stock red/azure palettes plus separate Pokédex brand tokens. The 19 ROM type tokens include MYSTERY; filters show 18 playable types.

## Getting Started

### Prerequisites
- Node.js **v24.22.1 (LTS "Krypton")** project baseline; **v24.22.2** was observed during the consistency cycle
- npm **11.x+**

### Installation
```bash
npm install
```

### Development Server
```bash
npm start
```
Navigate to `http://localhost:4200/`.

The home route displays the catalog; `/pokedex` redirects home. Startup failures offer a localized retry action. IndexedDB persistence does not cache the application itself; offline reload/installability requires the Phase 5 service worker. Fonts/icons and optional sprites currently use external URLs; card/detail sprite failures have inline fallbacks.

### Running Unit Tests (Vitest)
```bash
npm test
```

### Production Build
```bash
npm run build
```

## Documentation & Architecture
- Canonical Agent Instructions: [`AGENTS.md`](./AGENTS.md)
- Living Roadmap: [`docs/roadmap.md`](./docs/roadmap.md)
- System Architecture: [`docs/architecture.md`](./docs/architecture.md)
- Domain Model: [`docs/domain-model.md`](./docs/domain-model.md)
- Approved Phase Artifacts: [`docs/approved-artifacts/`](./docs/approved-artifacts/)

**Current phase**: Phase 2 — Reference Pokédex & Catalog (completed). Phase 3 requires a separately approved plan. See [the Phase 2 handoff](./docs/agent-handoffs/phase-2-handoff.md) for verification and limitations.

### Quality scripts
```bash
npm run lint   # explicit app + test typechecks, then source Prettier check
npm test
npm run build
```

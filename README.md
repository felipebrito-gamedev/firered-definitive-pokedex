# Pokémon Definitive Pokédex (FireRed Definitivo PT-BR v2.0.4)

A production-quality, mobile-first, offline-first Progressive Web Application (PWA) Pokédex and Pokémon collection tracker.

## Overview
- **ROM Target**: Pokémon FireRed Definitivo PT-BR v2.0.4 (#001 Bulbasaur through #386 Deoxys).
- **Purpose**: Enables independent player journeys (multiple profiles per account) to track Pokédex registrations, owned specimens, duplicate captures, branching evolution paths, and completion metrics with full offline persistence.
- **Dataset Provenance**: 100% Directed Acyclic Graph (184 evolution transitions) and 19 types (including Fairy, Normal/Dark Granbull, and Normal/Psychic Porygon) verified directly against the game binary.

## Tech Stack
- **Framework**: Angular 22 (Standalone Components, Angular Signals)
- **Language**: TypeScript 5.8+ (Strict Mode)
- **Local Persistence**: Dexie.js v4 (IndexedDB)
- **Cloud Persistence & Auth**: Firebase Modular SDK v13 (Google Sign-In & Cloud Firestore)
- **UI Library**: Angular Material 22 with Custom Pokédex SCSS Theme
- **Testing**: Vitest v5 (`@angular/build:unit-test` with jsdom) & Playwright
- **Hosting**: GitHub Pages (`/firered-definitive-pokedex/`)

## Getting Started

### Prerequisites
- Node.js **v24.22.1 (LTS "Krypton")**
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

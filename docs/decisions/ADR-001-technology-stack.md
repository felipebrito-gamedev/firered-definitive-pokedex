# ADR-001: Technology Stack Selection

## Status
Accepted

## Context
The Pokémon Definitive Pokédex project requires a modern, mobile-first, offline-first Progressive Web Application (PWA) to serve as a personal Pokédex and collection tracker for the ROM hack *Pokémon FireRed Definitivo PT-BR v2.0.4*. The application must adhere to a strict **Zero-Cost Constraint** (utilizing free service tiers only: Firebase Spark, GitHub Pages, Dexie IndexedDB) with zero paid infrastructure, while maintaining enterprise-grade type safety and testability.

## Decision
We selected the following core technology stack:
1. **Runtime & Language**: Node.js **v24.22.1 LTS ("Krypton")**, TypeScript in strict mode (`strict: true`, `noImplicitAny: true`, `strictNullChecks: true`).
2. **Frontend Framework**: **Angular 22** (`@angular/core@^22.2.4`) utilizing standalone components, Angular Signals for reactive state management, `provideHttpClient()`, and `provideRouter()`. NgRx and heavy external state management libraries are explicitly excluded to maintain simplicity and zero bundle bloat.
3. **UI Library & Styling**: **Angular Material 22** (`@angular/material@^22.2.4`) with SCSS, styled with a custom Pokédex theme:
   - Primary: Crimson Red (`#DC0A2D`)
   - Tertiary: Dark Slate (`#2A2A2A`)
   - Surface: Off-White (`#F7F7F7`)
   - 19 custom color tokens representing all Pokémon types (including Fairy).
4. **Local Persistence**: **Dexie.js v4** (`dexie@^4.4.0`) providing typed IndexedDB repositories and atomic transactions.
5. **Cloud Persistence & Authentication**: **Firebase Modular SDK v13** (`firebase@^13.1.0`), using Firebase Authentication (Google Sign-In) and Cloud Firestore scoped to `/users/{userId}/profiles/{profileId}` under the free Spark tier.
6. **Testing**:
   - Unit testing: **Vitest v5** (`vitest@^5.0.0`) with `jsdom` via `@angular/build:unit-test`.
   - End-to-End testing: **Playwright** (deferred to Phase 5 when the UI shell is established).
   - Security Rules testing: `@firebase/rules-unit-testing` against the Firebase Local Emulator Suite.
7. **Hosting & PWA**: GitHub Pages with `@angular/pwa` targeting base href `/firered-definitive-pokedex/`.

## Consequences
- **Positive**:
  - Latest stable LTS runtime and framework ensuring long-term maintenance and peak performance.
  - Signal-based reactivity provides fine-grained DOM updates without zone.js overhead.
  - Zero financial cost for hosting and data storage.
  - Full offline capability from day one via IndexedDB.
- **Negative / Trade-offs**:
  - Angular 22 deprecates legacy `@angular/animations` in favor of new template-level syntax; we pin compatible dependencies for `@angular/material`.
  - Offline font inlining requires explicit configuration in `angular.json` to prevent build failures in isolated environments.

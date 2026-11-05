# ADR-001: Technology Stack Selection

## Status
Accepted

## Context
The Pokémon Definitive Pokédex project requires a modern, mobile-first, offline-first Progressive Web Application (PWA) to serve as a personal Pokédex and collection tracker for the ROM hack *Pokémon FireRed Definitivo PT-BR v2.0.4*. The application must adhere to a strict **Zero-Cost Constraint** (utilizing free service tiers only: Firebase Spark, GitHub Pages, Dexie IndexedDB) with zero paid infrastructure, while maintaining enterprise-grade type safety and testability.

## Decision
We selected the following core technology stack:
1. **Runtime & Language**: Node.js **v24.22.1 LTS ("Krypton")**, TypeScript **~6.0.2** in strict mode (`strict: true`, `noImplicitAny: true`, `strictNullChecks: true`).
   - **Linting**: Explicit `tsc --noEmit -p tsconfig.app.json` and `tsc --noEmit -p tsconfig.spec.json`, followed by source Prettier checks (`npm run lint`). Angular templates are compiled by test/build. Bare root `tsc --noEmit` was the historical gate; ESLint is **not** installed.
2. **Frontend Framework**: **Angular 22** (`@angular/core@^22.2.4`) utilizing standalone components, Angular Signals for reactive state management, `provideHttpClient()`, and `provideRouter()`. NgRx and heavy external state management libraries are explicitly excluded to maintain simplicity and zero bundle bloat.
3. **UI Library & Styling**: **Angular Material 22** (`@angular/material@^22.2.4`) with SCSS, styled with a custom Pokédex theme:
   - Material theme: stock red primary and azure tertiary palettes.
   - Separate custom brand tokens: Crimson Red (`#DC0A2D`), Dark Slate (`#2A2A2A`), Off-White (`#F7F7F7`), used on custom surfaces and the toolbar.
   - 19 custom color tokens representing all Pokémon types (including Fairy).
4. **Local Persistence**: **Dexie.js v4** (`dexie@^4.4.7`, lockfile **4.4.7**) providing typed IndexedDB repositories and atomic transactions. Phase 2 delivers the reference catalog schema. Player repositories arrive in Phase 3.
5. **Cloud Persistence & Authentication (planned Phase 4; not installed)**: **Firebase Modular SDK v13** (`firebase@^13.1.0`), using Firebase Authentication (Google Sign-In) and Cloud Firestore scoped to `/users/{userId}/profiles/{profileId}` under the free Spark tier.
6. **Testing**:
   - Unit testing: **Vitest v5** (`vitest@^5.0.0`) with `jsdom` via `@angular/build:unit-test`.
   - End-to-End testing: **Playwright** (deferred to Phase 5 when the UI shell is established).
   - Security Rules testing: `@firebase/rules-unit-testing` against the Firebase Local Emulator Suite.
7. **Hosting & PWA (planned Phase 5)**: GitHub Pages with `@angular/pwa` targeting base href `/firered-definitive-pokedex/`. The base href exists; service worker and deployment remain pending.

Current lockfile snapshot: Angular core 22.2.4; CLI/build/Material/CDK 22.2.5; TypeScript 6.0.3; Dexie 4.4.7; Vitest 5.0.5. Caret/tilde declarations are ranges, not exact pins. Runtime 24.22.2 was observed during the consistency cycle; 24.22.1 remains the historical project baseline.

## Consequences
- **Positive**:
  - Latest stable LTS runtime and framework ensuring long-term maintenance and peak performance.
  - Signal-based reactivity provides fine-grained DOM updates without zone.js overhead.
  - Zero financial cost for hosting and data storage.
  - Durable local data through IndexedDB; full offline reload/installability requires Phase 5 application asset caching.
- **Negative / Trade-offs**:
  - Angular 22 deprecates legacy `@angular/animations` in favor of new template-level syntax; we pin compatible dependencies for `@angular/material`.
  - Font inlining is disabled for isolated builds. Runtime font/icon URLs are still external dependencies and require Phase 5 caching/fallback decisions.

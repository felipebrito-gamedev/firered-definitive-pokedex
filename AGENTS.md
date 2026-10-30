# AGENTS.md — Canonical Agent Instructions & Operating Manual

## 1. Project Overview & Scope
- **Project Name**: Pokémon Definitive Pokédex (FireRed Definitivo PT-BR v2.0.4)
- **Application Type**: Progressive Web Application (PWA), mobile-first, offline-first.
- **Purpose**: Personal Pokédex and Pokémon collection tracker enabling multiple player profiles per account to track species registration, currently owned specimens, duplicate captures, branching evolution paths, and completion metrics independently.
- **Target Dataset**: ROM hack *Pokémon FireRed Definitivo PT-BR v2.0.4* (#001 Bulbasaur through #386 Deoxys, 184 custom evolution transitions).
- **Dataset Provenance & Copyright Rule**:
  - ROM data verified directly against `FRDefinitivo-v2.0.4.gba` binary and author workbook.
  - Verified ROM-specific facts: 19 types (Type ID 18 = FAIRY), Granbull (#210) is NORMAL/DARK, Porygon (#137) is NORMAL/PSYCHIC, and 184 evolution transitions form a 100% Directed Acyclic Graph (DAG) with zero cycles.
  - **NEVER** commit or distribute copyrighted ROM files (`*.gba`, `*.sav`) in the repository. Keep `.gitignore` enforced.
  - **NEVER** invent game data or silently substitute canonical Pokémon rules for verified ROM-specific rules.
  - The author's Excel workbook (`.xlsm`/`.xlsx`) serves strictly as a development reference/fixture. **There is NO legacy spreadsheet importer in the application scope.** All new player profiles start with empty progress by default.

## 2. Collaboration Contract & Agent Guidelines
1. **Roles**: The human developer is the **NAVIGATOR** and final authority. Any AI agent operates as the **DRIVER**.
2. **Phase Lifecycle & Pre-Implementation Approval Protocol**:
   - Every development phase MUST strictly adhere to this four-step sequence:
     1. **Phase Planning & Proposal Artifact**: At the beginning of each phase, the agent must plan and present proposed changes inside a structured artifact (e.g. `phase-X-<title>.md`), detailing architecture, tasks, and acceptance criteria, and ask for explicit user approval.
     2. **Pre-Implementation Artifact Archiving**: Immediately upon receiving user approval, the agent MUST save that approved artifact inside the repository at `docs/approved-artifacts/phase-X-<title>.md` **BEFORE starting code implementation**.
     3. **Execution with Living Artifact Synchronization**: The agent implements code strictly according to the approved plan (following TDD). If implementation details diverge or adapt during execution, the agent MUST update this artifact in `docs/approved-artifacts/` to preserve complete parity between plan and reality.
     4. **Phase Closure & Handoff**: Execute all verification checks (lint, test, build with 0 errors), author `docs/agent-handoffs/phase-X-handoff.md`, update roadmap tracking in both `docs/roadmap.md` and `AGENTS.md`, provide the exact recommended git commands for the user to execute manually in their terminal, and request user approval to advance.
3. **Approval Gate & Strict Git Policy**:
   - **Never start code implementation** without presenting a concrete phase plan and obtaining explicit user approval.
   - **Strict Git Mutation Ban for Agents**: AI agents MUST **NEVER** execute git commands that modify repository state, history, index, worktree, or remote branches (including but not limited to `git add`, `git commit`, `git push`, `git checkout`, `git switch`, `git reset`, `git merge`, `git rebase`, `git tag`, `git clean`, `git stash`). All repository-modifying git actions are reserved strictly for the human developer.
   - **Read-Only Git Commands Permitted**: The agent is restricted to non-mutating inspection commands (`git status`, `git diff`, `git log`). When git actions are recommended (e.g. at phase completion), the agent MUST provide the exact recommended commands for the human developer to execute manually in their own shell.
   - Always obtain explicit approval before:
     - Destructive file commands (file deletion outside temporary scratch directories).
     - Deployments.
     - Installing unexpected or unapproved dependencies.
     - Modifying cloud resources or security settings.
4. **Phase-by-Phase Execution**: Work strictly in small, verified phases. Never skip ahead.
5. **Agent Startup Routine**: Before starting any work, the agent must inspect the latest approved roadmap phase in `docs/roadmap.md` and `AGENTS.md` Section 10, along with the most recent handoff summary in `docs/agent-handoffs/`.
6. **TDD Workflow**: RED (failing test) → GREEN (minimal passing implementation) → REFACTOR (clean code and design).
7. **Test Integrity**: Never alter or disable an existing test simply to make failing code pass. Tests define the invariants.
8. **No Phantom Claims**: Never state that a test, build, lint, or security check passed unless it was actually executed and succeeded in the shell. Document any unexecuted checks and the explicit reasons they were skipped.
9. **Budget & Simplicity (Zero-Cost Constraint)**: Strictly operate within free service tiers (Firebase Spark plan, GitHub Pages, Dexie IndexedDB). Never introduce unapproved paid services, heavy state management libraries (no NgRx), microservices, or unnecessary backend code.
10. **Language Rule**:
    - Source code, comments, test suites, architecture docs, git commits, and agent instructions MUST be in **English**.
    - User-facing UI, labels, and error messages MUST be in **Brazilian Portuguese (pt-BR)**.
    - Code must structure UI strings to permit future i18n.
11. **Cross-Agent Portability**:
    - `AGENTS.md` is the canonical, tool-independent source of truth. Both Google Antigravity and OpenCode (and any other agent) follow this identical contract.
    - Any tool-specific configuration files must remain minimal adapters referencing `AGENTS.md`.

## 3. Mandatory Domain Invariants
Any code handling collection and Pokédex state MUST strictly enforce:
1. **Specimen vs. Registration**:
   - `PokemonSpecimen` represents a physical entity caught/owned.
   - `SpeciesRegistration` represents the fact that a species has been obtained in the Pokédex.
   - Releasing or evolving a specimen DOES NOT remove the species from the registered Pokédex.
2. **Evolution Invariant**:
   - Evolving a specimen mutates its current species and records history, but preserves its unique specimen identity (`id`).
   - Evolution automatically registers the destination species.
   - The origin species remains registered.
3. **Multiple Specimens (Duplicates)**:
   - A player can catch and retain multiple specimens of the same species (e.g., 3 Pikachus, 5 Eevees) with independent levels, nicknames, and capture dates.
4. **Branching Evolutions**:
   - Each branch is an independent evolution path. Evolving Eevee to Vaporeon MUST NOT mark Jolteon, Flareon, Espeon, or Umbreon as registered or completed.
5. **Evolution Eligibility States (4-Tier Model)**:
   - Do not assume a Pokémon can evolve immediately merely because its recorded level meets a threshold.
   - Formally distinguish four states:
     - `FINAL_STAGE`: Species has no outgoing evolution transitions in the ROM dataset.
     - `EVOLUTION_PATH_AVAILABLE`: Species has descendants in the ROM, but prerequisites are not confirmed.
     - `REQUIREMENTS_REPORTED_MET`: Known specimen conditions (e.g. level, reported evolution item) are verified met.
     - `CONDITION_UNKNOWN`: Evolution depends on unverified in-game factors (personality branch, happiness value, in-game trigger).
   - Distinguish evolution eligibility from whether the destination species has already been registered in the Pokédex.
   - Preserve uncertain conditions explicitly rather than guessing.
6. **Profile Isolation & In-Memory Flushing**:
   - All progress, specimens, and registrations are strictly scoped to `profileId`.
   - Switching profiles must immediately flush reactive signals to prevent cross-profile leakage.
7. **Consistency & Atomic Local Transactions**:
   - Operations that mutate multiple entities (such as evolutions, captures, or special events like Nincada producing Ninjask and potentially Shedinja) MUST execute within a single atomic local Dexie transaction.
   - `SpeciesRegistration` and `PokemonEvent` records must remain strictly consistent with specimen state without maintaining unsynchronized, independently mutable sources of truth.

## 4. Account and Profile Security Contract
1. **4-Layer Isolation Boundary**:
   - **UI Layer**: Signal boundaries and route guards guarantee reactive state is purged when switching profiles or signing out.
   - **Local Storage Layer**: Dexie IndexedDB repositories strictly query by composite keys (`userId`, `profileId`).
   - **Sync Layer**: Outbox sync operates only within `/users/{userId}/profiles/{profileId}`.
   - **Cloud Security Rules**: Cloud Firestore Security Rules enforce `request.auth.uid == userId` on every document read and write.
2. **Security Principal vs. Gameplay Journeys**:
   - The authenticated account (`userId`) is the sole authorization security boundary.
   - Profiles under the same account are independently tracked gameplay journeys, NOT independently authenticated security principals.
   - Children profiles share the parent's account authentication safely without requiring independent Google accounts.
3. **Cross-Account Protection**:
   - Data from one authenticated account must never be synchronized into or merged with another account.
   - Sign-out and account-switching must safely isolate or clear cached data according to explicit user preference.
4. **Firestore Security Validation Requirements (Phase 4)**:
   - Account-path matching is only a baseline. Security rules must enforce document field and type validation, immutability of ownership identifiers (`userId`, `profileId`, `id`), and operation-specific constraints (creation, update, deletion).
   - Rules must be validated using `@firebase/rules-unit-testing` against the Firebase Local Emulator, proving denial of unauthorized cross-account access and malformed writes.

## 5. Offline-First Synchronization & Persistence Contract
1. **Durable Local Operations (Write-Ahead)**:
   - Every user mutation (capture, evolution, release, profile edit) MUST be written durably to IndexedDB (Dexie) first.
   - Mutations atomically enqueue an operation into a local `syncQueue` (outbox pattern).
2. **Conflict Resolution & Safety Principle**:
   - **Conflict resolution must preserve committed gameplay events and prevent silent data loss. The strategy must be formally defined and tested before implementation. Client timestamps alone must not be considered sufficient to guarantee conflict safety.**
   - If any conflict cannot be safely resolved automatically, the application must preserve the conflicting data and require explicit resolution rather than silently overwriting it.
   - Keep the synchronization architecture simple and robust; do not introduce speculative CRDT complexity or full event sourcing without proven necessity.
3. **Sync Engine Guarantees**:
   - **Idempotency**: Retrying a sync operation must produce the identical remote state without duplicating records.
   - **Safe Retries**: Exponential backoff on transient network failures.
   - **Bidirectional Reconciliation**: Remote changes safely reconcile into local IndexedDB without discarding un-synced local changes.
   - **Deletion Propagation**: Soft-deletes with tombstones (`isDeleted: true`) ensure deletions synchronize cleanly.
   - **Interrupted-Sync Recovery**: If connectivity drops mid-sync, the queue retains unacknowledged items and resumes cleanly upon reconnection.
4. **Required Sync Test Scenarios**:
   - Automated tests in Phase 4 must cover duplicate synchronization, concurrent offline changes on multiple devices, cross-profile isolation, and interrupted sync recovery.

## 6. Backup, Restoration & Non-Destructive Policy
1. **Canonical Versioned JSON Backup**:
   - Full backup export and import functions completely offline, independent of Firebase availability.
   - Canonical format is versioned JSON with an explicit `schemaVersion`.
   - Backup includes player profile data, Pokémon specimens, species registrations, capture and evolution history, and necessary reconstruction metadata.
   - Validation with Zod guarantees schema integrity, referential consistency, and migration support for older backup versions.
   - CSV is excluded from the MVP backup contract (reserved for future reporting).
2. **Non-Destructive Restoration Policy**:
   - **NEVER** silently overwrite existing player progress during import.
   - Do not automatically merge imported data without explicit user intent.
   - Restoration policy defines three clear tiers:
     1. *Restore as a new profile* (preferred default).
     2. *Merge with an existing profile* (only when deterministic, safe merge semantics are formally defined and tested).
     3. *Replace an existing profile* (only after explicit confirmation and safety checks).

## 7. Technical Architecture & Stack Validation
- **Runtime Environment**: Node.js **v24.22.1 (LTS "Krypton")** (satisfies Angular 22 engine requirement `^24.15.0`).
- **Framework**: **Angular 22** latest stable (`@angular/core@^22.2.0`, standalone components, Angular Signals, `provideHttpClient`, `provideRouter`).
- **Language**: TypeScript in strict mode (`strict: true`, `noImplicitAny: true`, `strictNullChecks: true`).
- **UI Library**: Angular Material 22 (`@angular/material@^22.2.0`) with SCSS and a custom Pokédex theme (crimson red `#DC0A2D`, dark slate `#2A2A2A`, off-white surface `#F7F7F7`).
- **Local Persistence**: Dexie.js v4 (`dexie@^4.4.0`) (IndexedDB) with typed repositories.
- **Cloud Persistence & Auth**: Firebase Modular SDK v13 (`firebase@^13.1.0`) (Google Sign-In) and Cloud Firestore (scoped paths `/users/{userId}/profiles/{profileId}/...`).
- **PWA Tooling**: Angular Service Worker (`@angular/pwa@^22.2.0`) targeting GitHub Pages. Service worker approach must be validated for caching and routing.
- **Planned Application Base Href**: `/firered-definitive-pokedex/` on GitHub Pages.
- **Testing**:
  - Unit: Vitest v5 (`vitest@^5.0.0` with jsdom).
  - E2E: Playwright (introduced when the application shell is established in Phase 5).
  - Security Rules: `@firebase/rules-unit-testing` against Firebase Local Emulator.

## 8. Testing, Quality & Release Criteria
1. **Phase-Appropriate Testing**:
   - Focus on unit and domain invariant tests during early phases (TDD).
   - Do not demand E2E tests before an application UI shell exists.
2. **Release Acceptance Criteria**:
   - Complete relevant regression suite must pass with 100% green status.
   - Production build (`npm run build`) must succeed with zero errors and zero warnings.
   - WCAG AA accessibility checks must pass for mobile and desktop viewports.
   - Offline functionality verified: app loads, navigates, captures, and evolves without internet connectivity.
3. **Test Integrity**: Never weaken, disable, or alter existing tests merely to make new code pass.

## 9. Documentation Standards
- **Artifact Preservation & Pre-Implementation Rule**:
  - For every interaction cycle that proposes or completes a phase, all generated artifacts must be preserved inside the repository at `docs/approved-artifacts/`.
  - **Pre-Implementation Requirement**: When an agent proposes a phase plan artifact and receives user approval, it MUST save that artifact to `docs/approved-artifacts/phase-X-<title>.md` **before** executing implementation.
  - **Living Synchronization**: If any technical detail, dependency, or architectural decision adapts during implementation, the agent must update this artifact in place to prevent drift.
- Keep all documentation files synchronized with `AGENTS.md`:
  - `docs/approved-artifacts/`: Permanent repository archive of approved artifacts across all phases.
  - `docs/architecture.md`: System layers, reactive signals architecture, and outbox sync engine.
  - `docs/domain-model.md`: Entities, value objects, lifecycle states, and invariant test traces.
  - `docs/product-requirements.md`: Functional scope, user stories, and acceptance criteria.
  - `docs/roadmap.md`: Living progress tracker for all phases.
  - `docs/data-provenance.md`: ROM binary analysis, evolution graph verification, and type assignment logs.
  - `docs/decisions/`: Architectural Decision Records (ADRs).
  - `docs/agent-handoffs/`: Compact phase summaries for seamless cross-agent handoffs.

## 10. Development Roadmap & Status
- **Phase 0 — Discovery and Architecture**: **COMPLETED & APPROVED** (ROM binary verified, 100% DAG, domain invariants, architecture baselined).
- **Phase 1 — Project Foundation & Tooling**: **COMPLETED** (Angular 22.2.4 on Node.js v24.22.1 LTS, Vitest v5, Material 22 custom theme, TDD domain utility, CI pipeline, base docs suite; ready for approval).
- **Phase 2 — Reference Pokédex & Catalog**: **PENDING APPROVAL** (Next Phase: ROM dataset seeding, Dexie schema v1, virtual-scrolled Pokédex catalog, search & type filters, detail sheet).
- **Phase 3 — Local Player Tracking & Collection**: Pending.
- **Phase 4 — Authentication & Secure Firestore Sync**: Pending.
- **Phase 5 — PWA & GitHub Pages Deployment**: Pending.
- **Phase 6 — Product Polish & Visualizations**: Pending.

## 11. Agent Handoff Protocol
When completing a phase, the agent must:
1. Run all relevant unit, integration, and build checks, verifying green status.
2. Document any unexecuted checks and the explicit reasons for skipping them.
3. Update `docs/agent-handoffs/phase-X-handoff.md`.
4. Update `docs/roadmap.md` with completed milestones.
5. Update `AGENTS.md` Section 10 to keep the canonical roadmap status perfectly synchronized across all agentic platforms.
6. Verify no uncommitted scratch files, broken paths, or copyrighted ROM files exist in git tracking.
7. Save the finalized phase artifact to `docs/approved-artifacts/`.
8. Summarize changes, provide the exact recommended git commands for the human developer to execute manually in their terminal, and request user approval to proceed to the next phase.

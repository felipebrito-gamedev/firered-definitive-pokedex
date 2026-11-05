# ADR-003: Offline-First Synchronization & Conflict Resolution Strategy

## Status
Accepted

## Context
Players interact with the application on mobile devices in varied connectivity environments (including full offline emulator play on trains, flights, or disconnected settings). The app must support fully offline local gameplay tracking while supporting multi-device synchronization via Cloud Firestore when network connectivity is available.

A critical design issue in naive offline-first architectures is silent data loss caused by simplistic Last-Write-Wins (LWW) strategies using client clocks. When two offline devices perform mutations, blind LWW can overwrite captures or evolutions without warning.

## Decision
We adopted the following synchronization architecture:

1. **Write-Ahead Local Operations (Outbox Pattern)**:
   - All gameplay mutations (captures, evolutions, releases, profile updates) write durably to Dexie IndexedDB first.
   - Each mutation atomically enqueues an operation into a local `syncQueue` table.
   - Phase 3 implements durable queue insertion for every affected entity, including events. Phase 4 implements network delivery and reconciliation.

2. **Event-Preserving Conflict Resolution**:
   - Conflict resolution must preserve committed gameplay events and prevent silent data loss.
   - The strategy must be formally defined and tested before implementation. Client timestamps alone are explicitly rejected as sufficient to guarantee conflict safety.
   - If any conflict cannot be safely resolved automatically, the application must preserve the conflicting data and require explicit user resolution rather than silently overwriting it.
   - Full event sourcing and heavy CRDT frameworks are excluded to prevent premature complexity.

3. **Sync Engine Guarantees**:
   - **Idempotency**: Retrying a sync operation produces identical remote state without duplicating records.
   - **Soft-Delete Propagation**: Deletions use tombstones (`isDeleted: true`) so removals sync cleanly across devices.
   - **Exponential Backoff**: Transient network and rate-limit errors retry with exponential jitter.
   - **Interrupted Sync Recovery**: If network drops mid-sync, unacknowledged queue items remain durable and resume upon reconnect.

4. **Security Boundary Alignment**:
   - The user account (`userId`) is the authorization security boundary (`request.auth.uid == userId`).
   - Remote paths are strictly structured under `/users/{userId}/profiles/{profileId}`.
   - Data from one account cannot be synced into or merged with another account.

5. **Canonical Versioned JSON Backup**:
   - Complete export and import of profile data, specimens, registrations, and history via versioned JSON (`schemaVersion`).
   - 100% offline functionality, completely independent of Firebase availability.
   - Non-destructive restoration policy: default restore creates a new profile.

## Consequences
- **Positive**:
  - Zero gameplay data loss during offline play.
  - Safe, predictable multi-device synchronization.
  - Portable JSON backups guarantee player data sovereignty.
- **Negative / Trade-offs**:
  - Sync engine requires rigorous edge-case testing (Phase 4).
  - Tombstones require eventual compaction/purge strategy.

Account adoption, ownership fields/indexes, event ordering across devices, and tombstone semantics remain explicit design questions in [the domain model](../domain-model.md#4-design-questions-requiring-future-phase-approval). This ADR does not supply their implementation policy.

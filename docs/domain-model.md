# Domain Model Specification

**Project**: Pokémon Definitive Pokédex (FireRed Definitivo PT-BR v2.0.4)  
**Status**: Approved baseline  
**Delivery**: Sections 1.1 and 1.2 are coded in Phase 2 under `src/app/core/domain/models/` (`species.model.ts`, `evolution-rule.model.ts`, `pokemon-type.model.ts`). Sections 1.3 through 1.6, the 4-tier eligibility engine, and the player invariants are the Phase 3 contract. Those types have no TypeScript modules yet.

The player snippets below are conceptual drafts, not complete persistence schemas. Supporting contracts (`AcquisitionMethod`, `SpecimenStatus`, `EvolutionHistoryEntry`, `PokemonEventType`, `SyncOperation`) have historical examples in the [Phase 0 artifact](./approved-artifacts/phase-0-discovery-and-architecture.md); finalize them under the Phase 3 plan before implementation. The ROM has 19 type identifiers, including MYSTERY, but only 18 playable filter types.

---

## 1. Domain Entities & Value Objects

### 1.1 Species (Reference Entity)
A species in the National Pokédex (#001 through #386) representing canonical data in the ROM hack.
```typescript
export interface Species {
  readonly id: number; // National Dex 1 to 386
  readonly internalId: number; // ROM internal index 1 to 411
  readonly name: string;
  readonly primaryType: PokemonType;
  readonly secondaryType?: PokemonType | null;
  readonly baseStats: {
    hp: number;
    attack: number;
    defense: number;
    speed: number;
    spAttack: number;
    spDefense: number;
    total: number;
  };
  readonly spriteUrl?: string;
}
```

### 1.2 EvolutionRule (Reference Entity)
A directed transition from one species to another in the evolution graph.

```typescript
export type EvolutionMethod =
  | 'LEVEL_UP'
  | 'ITEM'
  | 'HAPPINESS'
  | 'PERSONALITY'
  | 'SPECIAL';

export interface EvolutionRule {
  readonly id: string; // e.g. "evo_1_2_0"
  readonly fromSpeciesId: number;
  readonly toSpeciesId: number;
  readonly method: EvolutionMethod;
  readonly condition: string; // pt-BR trigger text (e.g. "Nível 16", "Pedra da Água")
  readonly minLevel?: number;
  readonly item?: string;
  readonly isRomModification?: boolean; // true when FireRed Definitivo replaced a canonical trigger (e.g. trade)
  readonly notes?: string;
}
```

### 1.3 PlayerProfile (User Journey Entity — Phase 3)
An independent gameplay journey owned by an authenticated account (`userId`).
```typescript
export interface PlayerProfile {
  readonly id: string; // UUID
  readonly userId: string; // Firebase UID or "local"
  name: string;
  avatar?: string;
  isArchived: boolean;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}
```

### 1.4 PokemonSpecimen (Owned Entity — Phase 3)
A specific physical Pokémon captured or evolved by a player profile.
- A player can own multiple specimens of the same species (duplicates supported).
- Changing species through evolution mutates `currentSpeciesId` and appends an entry to `evolutionHistory`, but preserves the specimen's unique `id`.
```typescript
export interface PokemonSpecimen {
  readonly id: string; // UUID
  readonly profileId: string;
  readonly originalSpeciesId: number;
  currentSpeciesId: number;
  nickname?: string;
  level?: number;
  acquisitionMethod: AcquisitionMethod;
  acquisitionDate: string;
  status: SpecimenStatus; // 'OWNED' | 'RELEASED' | 'TRADED_AWAY'
  notes?: string;
  evolutionHistory: EvolutionHistoryEntry[];
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean; // Soft-delete tombstone for cloud sync
}
```

### 1.5 SpeciesRegistration (Pokédex Registration Entity — Phase 3)
Tracks whether a species has been obtained in the Pokédex for that profile.
- Releasing or evolving an owned specimen never removes the species registration.
```typescript
export interface SpeciesRegistration {
  readonly id: string; // `${profileId}_${speciesId}`
  readonly profileId: string;
  readonly speciesId: number; // 1 to 386
  isRegistered: boolean;
  firstObtainedAt: string;
  firstObtainedMethod: AcquisitionMethod;
  firstSpecimenId?: string;
  updatedAt: string;
}
```

### 1.6 PokemonEvent (Audit Event Entity — Phase 3)
An immutable, ordered log of gameplay mutations.
```typescript
export interface PokemonEvent {
  readonly id: string; // UUID
  readonly profileId: string;
  readonly specimenId?: string;
  readonly eventType: PokemonEventType;
  readonly timestamp: string; // ISO
  readonly sequenceNumber: number; // Monotonic sequence
  readonly payload: Record<string, unknown>;
}
```

---

## 2. 4-Tier Evolution Eligibility Model (Phase 3)

The domain engine evaluates specimen evolution availability through four formal states:

1. **`FINAL_STAGE`**: The species has no outgoing evolution transitions in the ROM dataset. The specimen cannot evolve further.
2. **`EVOLUTION_PATH_AVAILABLE`**: The species has descendants in the ROM dataset, but prerequisites are not confirmed met (e.g. level condition is higher than specimen level, or an item is required).
3. **`REQUIREMENTS_REPORTED_MET`**: Known specimen conditions (e.g. reported specimen level >= target level, or user confirms holding required evolution item) are verified met.
4. **`CONDITION_UNKNOWN`**: Evolution depends on in-game factors that the application does not directly verify (personality branch, in-game happiness, special trigger).

*Key Rule*: Evolution eligibility is evaluated independently from whether the destination species has already been registered in the Pokédex.

---

## 3. Mandatory Domain Invariants (Phase 3)

1. **Specimen vs Registration**:
   `PokemonSpecimen` represents a physical entity; `SpeciesRegistration` represents permanent Pokédex completion. Evolving or releasing a specimen never unregisters a species.
2. **Evolution Invariant**:
   Evolution mutates `currentSpeciesId`, appends to `evolutionHistory`, registers the destination species, and preserves original species registration and specimen `id`.
3. **Duplicate Support**:
   Multiple specimens of the same species can be owned with independent levels, nicknames, and capture dates.
4. **Independent Branching Paths**:
   Evolving one branch (e.g. Eevee -> Vaporeon) has zero effect on other branches (Jolteon, Flareon, Espeon, Umbreon remain uncompleted).
5. **Atomic Multi-Record Mutations**:
   All state changes involving multiple entities execute within an atomic local Dexie transaction to ensure zero desynchronization between specimens, registrations, and sync outbox operations.

## 4. Design Questions Requiring Future Phase Approval

- **Phase 3 ownership**: Finalize child-entity ownership fields and indexes to enforce the canonical `(userId, profileId)` repository boundary. The current snippets containing only `profileId` do not fully specify this storage contract.
- **Phase 3 outbox**: Define `SyncOperation` payloads for every affected entity, including immutable events. Queue writes belong to local transactions in Phase 3; delivery begins in Phase 4.
- **Phase 3/4 account adoption**: Define explicit user intent and identifier/queue handling when moving a local profile into an authenticated account. The draft `userId: "local"` is not an automatic merge policy.
- **Phase 4 ordering**: Define the scope of monotonic event sequence numbers and deterministic ordering for concurrent devices. Client timestamps alone are insufficient.
- **Phase 3/4 tombstones**: Finalize archive/delete semantics for profiles, registrations, specimens, and immutable events; define retention and safe compaction before cloud deletion propagation.
- **Phase 3 restoration**: Finalize ID/reference remapping, supported acquisition methods (including eggs), and backup metadata. Merge remains disabled until deterministic semantics are approved and tested.

These questions do not authorize an implementation or a new domain policy during Phase 2.

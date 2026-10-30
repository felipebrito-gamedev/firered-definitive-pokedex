# Domain Model Specification

**Project**: Pokémon Definitive Pokédex (FireRed Definitivo PT-BR v2.0.4)  
**Status**: Approved Baseline  

---

## 1. Domain Entities & Value Objects

### 1.1 Species (Reference Entity)
A species in the National Pokédex (#001 through #386) representing canonical data in the ROM hack.
```typescript
export interface Species {
  readonly id: number; // 1 to 386
  readonly name: string;
  readonly primaryType: PokemonType;
  readonly secondaryType?: PokemonType;
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
export interface EvolutionRule {
  readonly id: string; // e.g. "evo_4_5"
  readonly fromSpeciesId: number;
  readonly toSpeciesId: number;
  readonly method: EvolutionMethod;
  readonly condition: string;
  readonly minLevel?: number;
  readonly item?: string;
  readonly notes?: string;
}
```

### 1.3 PlayerProfile (User Journey Entity)
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

### 1.4 PokemonSpecimen (Owned Entity)
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

### 1.5 SpeciesRegistration (Pokédex Registration Entity)
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

### 1.6 PokemonEvent (Audit Event Entity)
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

## 2. 4-Tier Evolution Eligibility Model

The domain engine evaluates specimen evolution availability through four formal states:

1. **`FINAL_STAGE`**: The species has no outgoing evolution transitions in the ROM dataset. The specimen cannot evolve further.
2. **`EVOLUTION_PATH_AVAILABLE`**: The species has descendants in the ROM dataset, but prerequisites are not confirmed met (e.g. level condition is higher than specimen level, or an item is required).
3. **`REQUIREMENTS_REPORTED_MET`**: Known specimen conditions (e.g. reported specimen level >= target level, or user confirms holding required evolution item) are verified met.
4. **`CONDITION_UNKNOWN`**: Evolution depends on in-game factors that the application does not directly verify (personality branch, in-game happiness, special trigger).

*Key Rule*: Evolution eligibility is evaluated independently from whether the destination species has already been registered in the Pokédex.

---

## 3. Mandatory Domain Invariants

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

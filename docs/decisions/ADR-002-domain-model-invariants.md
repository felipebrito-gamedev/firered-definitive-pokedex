# ADR-002: Domain Model & Core Collection Invariants

## Status
Accepted

## Context
A Pokédex tracker must support real gameplay behaviors: catching duplicate specimens of the same species, retaining un-evolved specimens while registering evolved forms, exploring branching evolution paths (e.g. Eevee having 5 distinct evolutions), and distinguishing between a physical Pokémon owned versus a species registered in the Pokédex.

## Decision
We established the following domain invariants and architectural abstractions:

1. **Separation of Specimen and Registration**:
   - `PokemonSpecimen` represents a physical entity owned by the player with unique ID, nickname, level, and evolution history.
   - `SpeciesRegistration` represents whether a National Dex species (#001–#386) has been registered.
   - Releasing or evolving a specimen NEVER removes the species from `SpeciesRegistration`.

2. **Evolution Identity & Registration Invariant**:
   - Evolution mutates the specimen's `currentSpeciesId` and records an immutable entry in `evolutionHistory`, but preserves its unique specimen identity (`id`).
   - Evolution automatically registers the destination species in `SpeciesRegistration`.
   - The origin species remains permanently registered.

3. **Support for Duplicates**:
   - Players can own multiple independent specimens of the same species (e.g. multiple Pikachus or Eevees) with distinct levels and capture dates.

4. **Independent Evolution Branches**:
   - Evolving a specimen along a branch (e.g. Eevee → Vaporeon) MUST NOT mark sibling branches (Jolteon, Flareon, Espeon, Umbreon) as registered.

5. **4-Tier Evolution Eligibility Model**:
   - `FINAL_STAGE`: Species has no outgoing evolution transitions in the ROM dataset.
   - `EVOLUTION_PATH_AVAILABLE`: Descendants exist, but conditions are not verified met.
   - `REQUIREMENTS_REPORTED_MET`: Reported specimen conditions (e.g. level, item) verified met.
   - `CONDITION_UNKNOWN`: Evolution depends on unverified in-game factors (e.g. personality branches).

6. **Strict Profile Isolation Boundary**:
   - All collection entities are strictly scoped to `profileId`.
   - Switching active profiles flushes in-memory reactive signals to prevent cross-profile leakage.

7. **Atomic Persistence Transactions**:
   - Operations that mutate multiple entities (such as evolutions, captures, or Nincada splitting into Ninjask and Shedinja) execute inside a single atomic Dexie transaction.

## Consequences
- **Positive**:
  - Faithfully models actual Pokémon collection mechanics without ambiguous state.
  - Prevents accidental data loss or phantom completion marks.
  - Multi-profile saves are strictly isolated at both UI and storage tiers.
- **Negative / Trade-offs**:
  - Requires maintaining two related tables (`specimens` and `speciesRegistrations`) rather than a single boolean flag per species.

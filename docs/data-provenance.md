# Game Data Provenance & ROM Verification Specification

## 1. Overview & Provenance Contract
This document details the reverse engineering, binary extraction, and formal verification of the game dataset used by the **Pokémon Definitive Pokédex**.

The current application seed is [`pokedex-seed.data.ts`](../src/app/core/data/pokedex-seed.data.ts). Earlier JSON paths in discovery records are superseded. There are 19 ROM type IDs including MYSTERY, and 18 playable catalog filter types. Metadata is the game-data authority; optional remote sprite URLs are presentation references, not sources for species stats or evolution rules.

- **ROM Binary**: `FRDefinitivo-v2.0.4.gba`
- **Game Identifier**: `BPRE` (Pokémon FireRed, expanded 32 MB ROM)
- **Author**: Community ROM Hack *Pokémon FireRed Definitivo PT-BR v2.0.4*
- **National Dex Scope**: #001 (Bulbasaur) through #386 (Deoxys)
- **Copyright Policy**: The ROM binary (`*.gba`, `*.sav`) is strictly excluded from version control via `.gitignore`. No copyrighted assets are distributed. All game facts are stored as verified structural metadata.

---

## 2. ROM Binary Architecture & Offsets

The dataset was directly extracted from binary offsets verified against the Game Boy Advance memory map:

| Symbol / Table | Binary Offset | Struct Size / Entry | Purpose |
|----------------|---------------|---------------------|---------|
| `gSpeciesNames` | `0x245EE0` | 11 bytes per species | In-game Portuguese species names |
| `sSpeciesToNationalPokedexNum` | `0x251FEE` | 2 bytes (uint16_le) | Maps internal Gen 3 indices (1..411) to National Dex numbers (1..386) |
| `gBaseStats` | `0x254784` | 28 bytes per species | HP, Attack, Defense, Speed, SpAtk, SpDef, Type 1, Type 2, Catch Rate, Exp Yield, etc. |
| `gEvolutionTable` | ROM-indexed | 8 bytes per transition | Method (uint16), parameter/level (uint16), destination species (uint16) |

---

## 3. Verified Type System & Fairy Additions

The ROM hack extends the canonical Generation 3 18-type system (IDs 0–17) with **Type ID 18 = FAIRY** (19 types total):

| ID | Type Name (EN) | Type Name (PT-BR) | Hex Color Code |
|----|----------------|-------------------|----------------|
| 0 | Normal | Normal | `#A8A77A` |
| 1 | Fighting | Lutador | `#C22E28` |
| 2 | Flying | Voador | `#A98FF3` |
| 3 | Poison | Venenoso | `#A33EA1` |
| 4 | Ground | Terrestre | `#E2BF65` |
| 5 | Rock | Pedra | `#B6A136` |
| 6 | Bug | Inseto | `#A6B91A` |
| 7 | Ghost | Fantasma | `#735797` |
| 8 | Steel | Aço | `#B7B7CE` |
| 9 | Fire | Fogo | `#EE8130` |
| 10 | Water | Água | `#6390F0` |
| 11 | Grass | Planta | `#7AC74C` |
| 12 | Electric | Elétrico | `#F7D02C` |
| 13 | Psychic | Psíquico | `#F95587` |
| 14 | Ice | Gelo | `#96D9D6` |
| 15 | Dragon | Dragão | `#6F35FC` |
| 16 | Dark | Noturno | `#705746` |
| 17 | (Mystery/Shadow) | ??? | `#68A090` |
| 18 | Fairy | Fada | `#D685AD` |

### 17 Verified Fairy Pokémon in the ROM
1. **Clefairy** (#035): Pure Fairy
2. **Clefable** (#036): Pure Fairy
3. **Jigglypuff** (#039): Normal / Fairy
4. **Wigglytuff** (#040): Normal / Fairy
5. **Mr. Mime** (#122): Psychic / Fairy
6. **Cleffa** (#173): Pure Fairy
7. **Igglybuff** (#174): Normal / Fairy
8. **Togepi** (#175): Pure Fairy
9. **Togetic** (#176): Fairy / Flying
10. **Marill** (#183): Water / Fairy
11. **Azumarill** (#184): Water / Fairy
12. **Snubbull** (#209): Pure Fairy
13. **Azurill** (#298): Normal / Fairy
14. **Mawile** (#303): Steel / Fairy
15. **Ralts** (#280): Psychic / Fairy
16. **Kirlia** (#281): Psychic / Fairy
17. **Gardevoir** (#282): Psychic / Fairy

---

## 4. Critical ROM-Specific Deviations from Canonical Rules

Verification against binary offsets revealed custom modifications created by the ROM author that **differ from both Gen 3 and modern Gen 6+ mechanics**:

| Species | National Dex | Canonical Types (Gen 6+) | FireRed Definitivo Types | Binary Verification |
|---------|--------------|---------------------------|--------------------------|---------------------|
| **Granbull** | #210 | Pure FAIRY | **NORMAL / DARK** | Type 1: 0 (Normal), Type 2: 16 (Dark) |
| **Porygon** | #137 | Pure NORMAL | **NORMAL / PSYCHIC** | Type 1: 0 (Normal), Type 2: 13 (Psychic) |

> [!IMPORTANT]
> The Pokédex application strictly implements these verified ROM facts. Canonical Pokémon rules MUST NEVER override binary-verified ROM mechanics.

---

## 5. Evolution Graph & Trade Replacement Verification

All 184 evolution transitions were extracted and analyzed using topological sorting and Tarjan's cycle detection algorithm.
- **DAG Property**: **100% Directed Acyclic Graph** (zero cycles, zero infinite loops).
- **Trade Evolution Elimination**: Since Game Boy Advance link cable emulation is impractical on many mobile emulators, all trade evolutions were replaced with in-game level or item triggers:

| Origin Species | Destination Species | Canonical Method | FireRed Definitivo ROM Method |
|----------------|---------------------|------------------|-------------------------------|
| Kadabra (#064) | Alakazam (#065) | Trade | Level Up (Lv 48) |
| Machoke (#067) | Machamp (#068) | Trade | Level Up (Lv 48) |
| Graveler (#075) | Golem (#076) | Trade | Level Up (Lv 45) |
| Haunter (#093) | Gengar (#094) | Trade | Level Up (Lv 44) |
| Poliwhirl (#061) | Politoed (#186) | Trade w/ King's Rock | Level Up (Lv 46) |
| Slowpoke (#079) | Slowking (#199) | Trade w/ King's Rock | Water Stone |
| Onix (#095) | Steelix (#208) | Trade w/ Metal Coat | Level Up (Lv 47) |
| Scyther (#123) | Scizor (#212) | Trade w/ Metal Coat | Level Up (Lv 47) |
| Seadra (#117) | Kingdra (#230) | Trade w/ Dragon Scale | Level Up (Lv 47) |
| Porygon (#137) | Porygon2 (#233) | Trade w/ Up-Grade | Level Up (Lv 43) |
| Clamperl (#366) | Huntail (#367) | Trade w/ DeepSeaTooth | Level 36 (Personality Branch A) |
| Clamperl (#366) | Gorebyss (#368) | Trade w/ DeepSeaScale | Level 36 (Personality Branch B) |
| Eevee (#133) | Espeon (#196) | Happiness (Day) | Sun Stone |
| Eevee (#133) | Umbreon (#197) | Happiness (Night) | Moon Stone |

### Special Evolution Conditions
- **Nincada (#290)**: Evolves into Ninjask (#291) at Level 20. If an empty party slot exists and a Poké Ball is present, Shedinja (#292) is simultaneously produced. Both species register atomically.
- **Clamperl (#366)**: Branching condition is marked `CONDITION_UNKNOWN` in the 4-tier model unless the specific ROM personality value calculation can be verified.

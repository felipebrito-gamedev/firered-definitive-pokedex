# ADR-004: Game Data Provenance & Verified ROM Reference

## Status
Accepted

## Context
ROM hacks often introduce balance changes, custom evolutions, new types, or altered species characteristics that differ from both canonical Generation 3 Pokémon games and later generations. Relying on public Pokémon APIs (such as PokéAPI) would introduce incorrect data (e.g. missing Fairy type, incorrect trade evolution methods, or incorrect typing for altered species).

Furthermore, the original project workbook (`.xlsm`/`.xlsx`) contained initial gameplay references, but was proposed as a possible import source.

## Decision
1. **Direct ROM Binary Extraction as Authoritative Source**:
   - Game data was reverse engineered directly from the binary `FRDefinitivo-v2.0.4.gba` (`gBaseStats` at `0x254784`, `sSpeciesToNationalPokedexNum` at `0x251FEE`, `gSpeciesNames` at `0x245EE0`).
   - Verified ROM facts are authoritative:
     - 19 types (Type ID 18 = FAIRY) with 17 Fairy species.
     - Granbull (#210) is NORMAL/DARK (verified).
     - Porygon (#137) is NORMAL/PSYCHIC (verified).
     - 184 evolution transitions form a 100% DAG with zero cycles.
     - All trade evolutions replaced with level-up or item triggers.

2. **Copyright & ROM File Isolation**:
   - The copyrighted ROM file (`FRDefinitivo-v2.0.4.gba`, `*.gba`, `*.sav`) is strictly excluded from git tracking via `.gitignore`.
   - Seed data is persisted as clean, non-copyrighted structural JSON (`scratch/rom_species_data.json`).

3. **Exclusion of Legacy Spreadsheet Importer**:
   - The author's Excel spreadsheet serves strictly as a development reference.
   - There is NO legacy spreadsheet importer in the application scope. All new player profiles start with empty progress by default.

4. **Zero Guessing Policy**:
   - When in-game conditions are uncertain (such as personality branch algorithms for Clamperl), the system assigns `CONDITION_UNKNOWN` rather than inventing speculative rules.

## Consequences
- **Positive**:
  - 100% fidelity to the actual ROM hack played by users.
  - No copyright infringement risks in repository distribution.
  - Elimination of the brittle legacy spreadsheet import feature simplifies scope.
- **Negative / Trade-offs**:
  - ROM-specific quirks (Granbull Normal/Dark) may surprise users expecting canonical Gen 6+ Fairy typing; these are documented clearly in the UI.

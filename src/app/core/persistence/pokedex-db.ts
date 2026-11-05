import Dexie, { type Table } from 'dexie';
import { Species } from '../domain/models/species.model';
import { EvolutionRule } from '../domain/models/evolution-rule.model';

/**
 * Dexie.js v4 Typed Database for Pokémon Definitive Pokédex.
 * Schema v1 defines static reference tables:
 * - `species`: 386 National Pokédex species (#001–#386)
 * - `evolutionRules`: 184 evolution transitions in a 100% DAG
 */
export class DefinitivePokedexDB extends Dexie {
  species!: Table<Species, number>;
  evolutionRules!: Table<EvolutionRule, string>;

  constructor(databaseName = 'DefinitivePokedexDB') {
    super(databaseName);
    this.version(1).stores({
      species: 'id, name, primaryType, secondaryType, [primaryType+secondaryType]',
      evolutionRules: 'id, fromSpeciesId, toSpeciesId, method',
    });
  }

  /**
   * Atomically seeds the static reference tables with authoritative ROM data.
   * Restores missing canonical entries without deleting unrelated records.
   * Reference revisions require a separate migration policy.
   */
  async seedReferenceData(): Promise<void> {
    // Load the seed before opening the transaction so IndexedDB cannot auto-close
    // while the module is fetched, and keep reference metadata out of the shell.
    const { SEED_SPECIES, SEED_EVOLUTION_RULES } = await import('../data/pokedex-seed.data');
    await this.transaction('rw', this.species, this.evolutionRules, async () => {
      const species = await this.species.bulkGet(SEED_SPECIES.map((entry) => entry.id));
      const rules = await this.evolutionRules.bulkGet(
        SEED_EVOLUTION_RULES.map((entry) => entry.id),
      );
      const missingSpecies = SEED_SPECIES.filter((_, index) => species[index] === undefined);
      const missingRules = SEED_EVOLUTION_RULES.filter((_, index) => rules[index] === undefined);

      if (missingSpecies.length > 0) {
        await this.species.bulkPut(missingSpecies);
      }
      if (missingRules.length > 0) {
        await this.evolutionRules.bulkPut(missingRules);
      }
    });
  }
}

/**
 * Singleton database instance for the application.
 */
export const pokedexDb = new DefinitivePokedexDB();

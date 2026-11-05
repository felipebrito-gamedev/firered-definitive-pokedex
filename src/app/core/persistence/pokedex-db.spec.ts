import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SEED_SPECIES, SEED_EVOLUTION_RULES } from '../data/pokedex-seed.data';
import { setupTestIndexedDb } from '../testing/setup-dexie-test';
import { DefinitivePokedexDB } from './pokedex-db';

describe('DefinitivePokedexDB', () => {
  let db: DefinitivePokedexDB;

  beforeEach(async () => {
    setupTestIndexedDb();
    db = new DefinitivePokedexDB(`test_pokedex_${Date.now()}_${Math.random()}`);
    await db.open();
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await db.delete();
  });

  it('repairs missing rules even when all species exist', async () => {
    await db.species.bulkPut([...SEED_SPECIES]);
    await db.seedReferenceData();
    expect(await db.evolutionRules.count()).toBe(184);
  });

  it('repairs missing canonical identifiers despite matching table counts', async () => {
    await db.seedReferenceData();
    await db.species.delete(25);
    await db.species.put({ ...SEED_SPECIES[0]!, id: 999 });
    await db.evolutionRules.delete(SEED_EVOLUTION_RULES[0]!.id);
    await db.evolutionRules.put({ ...SEED_EVOLUTION_RULES[0]!, id: 'unexpected_rule' });
    await db.seedReferenceData();
    expect(await db.species.get(25)).toEqual(SEED_SPECIES.find((entry) => entry.id === 25));
    expect(await db.evolutionRules.get(SEED_EVOLUTION_RULES[0]!.id)).toEqual(
      SEED_EVOLUTION_RULES[0],
    );
    // Repair does not delete unrelated records; cleanup requires a separate policy.
    expect(await db.species.get(999)).toBeDefined();
    expect(await db.evolutionRules.get('unexpected_rule')).toBeDefined();
  });

  it('rolls back both reference tables when the rule write fails', async () => {
    await db.species.put(SEED_SPECIES[0]!);
    vi.spyOn(db.evolutionRules, 'bulkPut').mockRejectedValueOnce(
      new Error('Simulated write failure'),
    );
    await expect(db.seedReferenceData()).rejects.toThrow('Simulated write failure');
    expect(await db.species.toArray()).toEqual([SEED_SPECIES[0]]);
    expect(await db.evolutionRules.count()).toBe(0);
  });

  it('should initialize empty tables on first open', async () => {
    const speciesCount = await db.species.count();
    const rulesCount = await db.evolutionRules.count();
    expect(speciesCount).toBe(0);
    expect(rulesCount).toBe(0);
  });

  it('should seed all 386 species and 184 evolution rules atomically', async () => {
    await db.seedReferenceData();

    const speciesCount = await db.species.count();
    const rulesCount = await db.evolutionRules.count();

    expect(speciesCount).toBe(386);
    expect(rulesCount).toBe(184);
  });

  it('should be idempotent and not duplicate data on multiple seed calls', async () => {
    await db.seedReferenceData();
    await db.seedReferenceData();

    expect(await db.species.count()).toBe(386);
    expect(await db.evolutionRules.count()).toBe(184);
  });

  it('should preserve verified ROM-specific typings (Granbull & Porygon)', async () => {
    await db.seedReferenceData();

    const granbull = await db.species.get(210);
    expect(granbull).toBeDefined();
    expect(granbull?.name).toBe('Granbull');
    expect(granbull?.primaryType).toBe('NORMAL');
    expect(granbull?.secondaryType).toBe('DARK');

    const porygon = await db.species.get(137);
    expect(porygon).toBeDefined();
    expect(porygon?.name).toBe('Porygon');
    expect(porygon?.primaryType).toBe('NORMAL');
    expect(porygon?.secondaryType).toBe('PSYCHIC');
  });

  it('should verify exactly 17 Fairy-type Pokémon in the seeded database', async () => {
    await db.seedReferenceData();

    const fairySpecies = await db.species
      .filter((s) => s.primaryType === 'FAIRY' || s.secondaryType === 'FAIRY')
      .toArray();

    expect(fairySpecies.length).toBe(17);
  });

  it('should verify ROM trade replacement (Kadabra evolving at Lv 48)', async () => {
    await db.seedReferenceData();

    const kadabraEvo = await db.evolutionRules.where('fromSpeciesId').equals(64).first();

    expect(kadabraEvo).toBeDefined();
    expect(kadabraEvo?.toSpeciesId).toBe(65);
    expect(kadabraEvo?.method).toBe('LEVEL_UP');
    expect(kadabraEvo?.minLevel).toBe(48);
    expect(kadabraEvo?.isRomModification).toBe(true);
  });
});

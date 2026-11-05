import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { DefinitivePokedexDB } from '../persistence/pokedex-db';
import { setupTestIndexedDb } from '../testing/setup-dexie-test';
import { PokedexCatalogService } from './pokedex-catalog.service';

describe('PokedexCatalogService', () => {
  let db: DefinitivePokedexDB;
  let service: PokedexCatalogService;

  beforeEach(async () => {
    setupTestIndexedDb();
    db = new DefinitivePokedexDB(`catalog_${Date.now()}_${Math.random()}`);
    await db.open();
    await db.seedReferenceData();

    TestBed.configureTestingModule({
      providers: [PokedexCatalogService, { provide: DefinitivePokedexDB, useValue: db }],
    });
    service = TestBed.inject(PokedexCatalogService);
    await service.load();
  });

  afterEach(async () => {
    await db.delete();
  });

  it('loads all 386 species and defaults to National Dex order', async () => {
    expect(service.allSpecies()).toHaveLength(386);
    expect(service.filteredSpecies()[0]?.id).toBe(1);
    expect(service.filteredSpecies()[385]?.id).toBe(386);
    expect(service.resultCountLabel()).toBe('Exibindo 386 de 386 Pokémon');
  });

  it('filters by name and type through reactive signals', () => {
    service.setSearchTerm('pika');
    expect(service.filteredSpecies().map((entry) => entry.name)).toEqual(['Pikachu']);

    service.setSearchTerm('');
    service.setSelectedType('FAIRY');
    expect(service.filteredSpecies()).toHaveLength(17);
    expect(service.resultCountLabel()).toBe('Exibindo 17 de 386 Pokémon');
  });
});

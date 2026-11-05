import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { DefinitivePokedexDB } from '../persistence/pokedex-db';
import { setupTestIndexedDb } from '../testing/setup-dexie-test';
import { EvolutionTreeService } from './evolution-tree.service';

describe('EvolutionTreeService', () => {
  let db: DefinitivePokedexDB;
  let service: EvolutionTreeService;

  beforeEach(async () => {
    setupTestIndexedDb();
    db = new DefinitivePokedexDB(`tree_${Date.now()}_${Math.random()}`);
    await db.open();
    await db.seedReferenceData();

    TestBed.configureTestingModule({
      providers: [EvolutionTreeService, { provide: DefinitivePokedexDB, useValue: db }],
    });
    service = TestBed.inject(EvolutionTreeService);
    await service.load();
  });

  afterEach(async () => {
    await db.delete();
  });

  it('resolves Kadabra family from seeded evolution rules', () => {
    const tree = service.getFamilyTree(64);
    expect(tree.memberIds).toEqual([63, 64, 65]);
    expect(tree.hasRomModification).toBe(true);
  });
});

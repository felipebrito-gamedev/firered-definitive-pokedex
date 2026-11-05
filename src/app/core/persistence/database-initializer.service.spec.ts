import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { setupTestIndexedDb } from '../testing/setup-dexie-test';
import { DatabaseInitializerService } from './database-initializer.service';
import { DefinitivePokedexDB } from './pokedex-db';

describe('DatabaseInitializerService', () => {
  let service: DatabaseInitializerService;
  let testDb: DefinitivePokedexDB;

  beforeEach(() => {
    setupTestIndexedDb();
    testDb = new DefinitivePokedexDB(`test_init_${Date.now()}_${Math.random()}`);
    TestBed.configureTestingModule({
      providers: [DatabaseInitializerService, { provide: DefinitivePokedexDB, useValue: testDb }],
    });
    service = TestBed.inject(DatabaseInitializerService);
  });

  afterEach(async () => {
    await testDb.delete();
  });

  it('should seed database on initialize()', async () => {
    expect(await testDb.species.count()).toBe(0);

    await service.initialize();

    expect(await testDb.species.count()).toBe(386);
    expect(await testDb.evolutionRules.count()).toBe(184);
  });
});

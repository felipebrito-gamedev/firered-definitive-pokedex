import { ApplicationInitStatus } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { appConfig } from '../../app.config';
import { DatabaseInitializerService } from '../persistence/database-initializer.service';
import { DefinitivePokedexDB } from '../persistence/pokedex-db';
import { setupTestIndexedDb } from '../testing/setup-dexie-test';
import { EvolutionTreeService } from './evolution-tree.service';
import { PokedexCatalogService } from './pokedex-catalog.service';
import { PokedexStartupService } from './pokedex-startup.service';

describe('PokedexStartupService', () => {
  afterEach(() => vi.restoreAllMocks());

  it('waits for seeding before loading both services and deduplicates concurrent starts', async () => {
    let finishSeed!: () => void;
    const initialize = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          finishSeed = resolve;
        }),
    );
    const catalogLoad = vi.fn().mockResolvedValue(undefined);
    const treeLoad = vi.fn().mockResolvedValue(undefined);
    TestBed.configureTestingModule({
      providers: [
        { provide: DatabaseInitializerService, useValue: { initialize } },
        { provide: PokedexCatalogService, useValue: { load: catalogLoad } },
        { provide: EvolutionTreeService, useValue: { load: treeLoad } },
      ],
    });
    const startup = TestBed.inject(PokedexStartupService);
    const first = startup.initialize();
    const second = startup.initialize();
    expect(startup.status()).toBe('loading');
    expect(initialize).toHaveBeenCalledTimes(1);
    expect(catalogLoad).not.toHaveBeenCalled();
    expect(treeLoad).not.toHaveBeenCalled();
    finishSeed();
    await Promise.all([first, second]);
    expect(catalogLoad).toHaveBeenCalledTimes(1);
    expect(treeLoad).toHaveBeenCalledTimes(1);
    expect(startup.status()).toBe('ready');
  });

  it('keeps initialization failures recoverable and retries all required data', async () => {
    const initialize = vi
      .fn()
      .mockRejectedValueOnce(new Error('IndexedDB unavailable'))
      .mockResolvedValue(undefined);
    const load = vi.fn().mockResolvedValue(undefined);
    TestBed.configureTestingModule({
      providers: [
        { provide: DatabaseInitializerService, useValue: { initialize } },
        { provide: PokedexCatalogService, useValue: { load } },
        { provide: EvolutionTreeService, useValue: { load } },
      ],
    });
    const startup = TestBed.inject(PokedexStartupService);
    await expect(startup.initialize()).resolves.toBeUndefined();
    expect(startup.status()).toBe('error');
    expect(load).not.toHaveBeenCalled();
    await startup.initialize();
    expect(startup.status()).toBe('ready');
    expect(load).toHaveBeenCalledTimes(2);
  });

  it('does not enable detail opening when evolution loading fails', async () => {
    const initialize = vi.fn().mockResolvedValue(undefined);
    TestBed.configureTestingModule({
      providers: [
        { provide: DatabaseInitializerService, useValue: { initialize } },
        {
          provide: PokedexCatalogService,
          useValue: { load: vi.fn().mockResolvedValue(undefined) },
        },
        {
          provide: EvolutionTreeService,
          useValue: { load: vi.fn().mockRejectedValue(new Error('Rules read failure')) },
        },
      ],
    });
    const startup = TestBed.inject(PokedexStartupService);
    await startup.initialize();
    expect(startup.status()).toBe('error');
  });

  it('seeds 386 species and 184 rules through the actual application initializer', async () => {
    setupTestIndexedDb();
    const db = new DefinitivePokedexDB(`bootstrap_${Date.now()}_${Math.random()}`);
    TestBed.configureTestingModule({
      providers: [...appConfig.providers, { provide: DefinitivePokedexDB, useValue: db }],
    });
    try {
      const initialization = TestBed.inject(ApplicationInitStatus);
      await initialization.donePromise;
      expect(await db.species.count()).toBe(386);
      expect(await db.evolutionRules.count()).toBe(184);
      expect(TestBed.inject(PokedexCatalogService).filteredSpecies()).toHaveLength(386);
      expect(TestBed.inject(EvolutionTreeService).getFamilyTree(64).memberIds).toEqual([
        63, 64, 65,
      ]);
      expect(TestBed.inject(PokedexStartupService).status()).toBe('ready');
    } finally {
      await db.delete();
    }
  });
});

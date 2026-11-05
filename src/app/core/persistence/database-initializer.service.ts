import { Injectable, inject } from '@angular/core';
import { DefinitivePokedexDB, pokedexDb } from './pokedex-db';

@Injectable({
  providedIn: 'root',
})
export class DatabaseInitializerService {
  private readonly db = inject(DefinitivePokedexDB, { optional: true }) ?? pokedexDb;

  /**
   * Initializes and seeds reference data into the local Dexie database.
   */
  async initialize(): Promise<void> {
    await this.db.open();
    await this.db.seedReferenceData();
  }
}

import { Injectable, inject, signal } from '@angular/core';
import { DatabaseInitializerService } from '../persistence/database-initializer.service';
import { EvolutionTreeService } from './evolution-tree.service';
import { PokedexCatalogService } from './pokedex-catalog.service';

@Injectable({ providedIn: 'root' })
export class PokedexStartupService {
  private readonly database = inject(DatabaseInitializerService);
  private readonly catalog = inject(PokedexCatalogService);
  private readonly trees = inject(EvolutionTreeService);
  private inFlight: Promise<void> | undefined;
  readonly status = signal<'loading' | 'ready' | 'error'>('loading');

  initialize(): Promise<void> {
    if (this.inFlight) return this.inFlight;
    this.status.set('loading');
    this.inFlight = this.load().finally(() => {
      this.inFlight = undefined;
    });
    return this.inFlight;
  }

  private async load(): Promise<void> {
    try {
      await this.database.initialize();
      await Promise.all([this.catalog.load(), this.trees.load()]);
      this.status.set('ready');
    } catch {
      // Keep the shell usable so the player can retry a storage failure.
      this.status.set('error');
    }
  }
}

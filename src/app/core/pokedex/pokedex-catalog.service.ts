import { Injectable, computed, inject, signal } from '@angular/core';
import { CatalogSortOrder, filterCatalogSpecies } from '../domain/catalog-filter';
import { PokemonType } from '../domain/models/pokemon-type.model';
import { Species } from '../domain/models/species.model';
import { UI_MESSAGES } from '../i18n/ui-messages';
import { DefinitivePokedexDB, pokedexDb } from '../persistence/pokedex-db';

@Injectable({
  providedIn: 'root',
})
export class PokedexCatalogService {
  private readonly db = inject(DefinitivePokedexDB, { optional: true }) ?? pokedexDb;

  readonly searchTerm = signal('');
  readonly selectedType = signal<PokemonType | null>(null);
  readonly sortOrder = signal<CatalogSortOrder>('id_asc');
  readonly allSpecies = signal<Species[]>([]);
  readonly isLoading = signal(true);

  readonly filteredSpecies = computed(() =>
    filterCatalogSpecies(this.allSpecies(), {
      searchTerm: this.searchTerm(),
      selectedType: this.selectedType(),
      sortOrder: this.sortOrder(),
    }),
  );

  readonly resultCountLabel = computed(() =>
    UI_MESSAGES.catalog.showing(this.filteredSpecies().length, this.allSpecies().length),
  );

  async load(): Promise<void> {
    this.isLoading.set(true);
    const species = await this.db.species.orderBy('id').toArray();
    this.allSpecies.set(species);
    this.isLoading.set(false);
  }

  setSearchTerm(value: string): void {
    this.searchTerm.set(value);
  }

  setSelectedType(type: PokemonType | null): void {
    this.selectedType.set(type);
  }

  setSortOrder(order: CatalogSortOrder): void {
    this.sortOrder.set(order);
  }
}

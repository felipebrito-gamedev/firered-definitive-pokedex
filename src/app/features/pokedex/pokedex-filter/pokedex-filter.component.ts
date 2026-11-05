import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CatalogSortOrder } from '../../../core/domain/catalog-filter';
import {
  PLAYABLE_POKEMON_TYPES,
  POKEMON_TYPE_LABELS_PT_BR,
  PokemonType,
} from '../../../core/domain/models/pokemon-type.model';
import { typeCssVar, typeUsesDarkLabel } from '../../../core/domain/pokemon-type.util';
import { CATALOG_SORT_OPTIONS, UI_MESSAGES } from '../../../core/i18n/ui-messages';
import { PokedexCatalogService } from '../../../core/pokedex/pokedex-catalog.service';

@Component({
  selector: 'app-pokedex-filter',
  imports: [FormsModule, MatFormFieldModule, MatInputModule, MatIconModule, MatSelectModule],
  templateUrl: './pokedex-filter.component.html',
  styleUrl: './pokedex-filter.component.scss',
})
export class PokedexFilterComponent {
  readonly catalog = inject(PokedexCatalogService);
  readonly messages = UI_MESSAGES;
  readonly types = PLAYABLE_POKEMON_TYPES;
  readonly typeLabels = POKEMON_TYPE_LABELS_PT_BR;
  readonly sortOptions = CATALOG_SORT_OPTIONS;
  readonly typeCssVar = typeCssVar;
  readonly typeUsesDarkLabel = typeUsesDarkLabel;

  onSearchInput(value: string): void {
    this.catalog.setSearchTerm(value);
  }

  clearSearch(): void {
    this.catalog.setSearchTerm('');
  }

  selectType(type: PokemonType | null): void {
    const next = this.catalog.selectedType() === type ? null : type;
    this.catalog.setSelectedType(next);
  }

  onSortChange(order: CatalogSortOrder): void {
    this.catalog.setSortOrder(order);
  }
}

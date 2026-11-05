import { Component, computed, inject, signal } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {
  POKEMON_TYPE_LABELS_PT_BR,
  PokemonType,
} from '../../../core/domain/models/pokemon-type.model';
import { Species } from '../../../core/domain/models/species.model';
import { formatDexNumber } from '../../../core/domain/pokedex-number.util';
import { typeCssVar, typeUsesDarkLabel } from '../../../core/domain/pokemon-type.util';
import { statFillPercent, statIntensity } from '../../../core/domain/stat-bar';
import { UI_MESSAGES } from '../../../core/i18n/ui-messages';
import { EvolutionTreeService } from '../../../core/pokedex/evolution-tree.service';
import { PokedexCatalogService } from '../../../core/pokedex/pokedex-catalog.service';
import { EvolutionFamilyTreeComponent } from '../evolution-family-tree/evolution-family-tree.component';

export interface SpeciesDetailData {
  readonly species: Species;
}

interface StatRow {
  readonly key: keyof typeof UI_MESSAGES.detail.statLabels;
  readonly value: number;
  readonly max: number;
}

@Component({
  selector: 'app-species-detail',
  imports: [MatButtonModule, MatIconModule, EvolutionFamilyTreeComponent],
  templateUrl: './species-detail.component.html',
  styleUrl: './species-detail.component.scss',
})
export class SpeciesDetailComponent {
  private readonly sheetRef = inject(MatBottomSheetRef<SpeciesDetailComponent>, { optional: true });
  private readonly catalog = inject(PokedexCatalogService);
  private readonly evolutionTrees = inject(EvolutionTreeService);
  readonly data = inject<SpeciesDetailData>(MAT_BOTTOM_SHEET_DATA);

  readonly messages = UI_MESSAGES;
  readonly typeLabels = POKEMON_TYPE_LABELS_PT_BR;
  readonly typeCssVar = typeCssVar;
  readonly typeUsesDarkLabel = typeUsesDarkLabel;
  readonly statFillPercent = statFillPercent;
  readonly statIntensity = statIntensity;

  readonly species = this.data.species;
  readonly spriteFailed = signal(false);
  readonly dexNumber = formatDexNumber(this.species.id);
  readonly tree = this.evolutionTrees.getFamilyTree(this.species.id);
  readonly speciesById = computed(() => {
    const map = new Map<number, Species>();
    for (const entry of this.catalog.allSpecies()) {
      map.set(entry.id, entry);
    }
    map.set(this.species.id, this.species);
    return map;
  });

  readonly types: PokemonType[] = this.species.secondaryType
    ? [this.species.primaryType, this.species.secondaryType]
    : [this.species.primaryType];

  readonly stats: readonly StatRow[] = [
    { key: 'hp', value: this.species.baseStats.hp, max: 255 },
    { key: 'attack', value: this.species.baseStats.attack, max: 255 },
    { key: 'defense', value: this.species.baseStats.defense, max: 255 },
    { key: 'spAttack', value: this.species.baseStats.spAttack, max: 255 },
    { key: 'spDefense', value: this.species.baseStats.spDefense, max: 255 },
    { key: 'speed', value: this.species.baseStats.speed, max: 255 },
    { key: 'total', value: this.species.baseStats.total, max: 720 },
  ];

  close(): void {
    this.sheetRef?.dismiss();
  }
}

import { Component, input, output, signal } from '@angular/core';
import { formatDexNumber } from '../../../core/domain/pokedex-number.util';
import {
  POKEMON_TYPE_LABELS_PT_BR,
  PokemonType,
} from '../../../core/domain/models/pokemon-type.model';
import { Species } from '../../../core/domain/models/species.model';
import { typeCssVar, typeUsesDarkLabel } from '../../../core/domain/pokemon-type.util';
import { UI_MESSAGES } from '../../../core/i18n/ui-messages';

@Component({
  selector: 'app-pokemon-card',
  templateUrl: './pokemon-card.component.html',
  styleUrl: './pokemon-card.component.scss',
})
export class PokemonCardComponent {
  readonly species = input.required<Species>();
  readonly selected = output<Species>();

  readonly labels = UI_MESSAGES.catalog;
  readonly typeLabels = POKEMON_TYPE_LABELS_PT_BR;
  readonly spriteFailed = signal(false);

  dexNumber(): string {
    return formatDexNumber(this.species().id);
  }

  types(): PokemonType[] {
    const { primaryType, secondaryType } = this.species();
    return secondaryType ? [primaryType, secondaryType] : [primaryType];
  }

  readonly typeCssVar = typeCssVar;
  readonly typeUsesDarkLabel = typeUsesDarkLabel;

  ariaLabel(): string {
    return this.labels.openDetails(this.species().name, this.dexNumber());
  }

  onSpriteError(): void {
    this.spriteFailed.set(true);
  }

  open(): void {
    this.selected.emit(this.species());
  }
}

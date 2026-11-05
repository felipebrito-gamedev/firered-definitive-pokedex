import { Component, computed, input } from '@angular/core';
import { EvolutionFamilyTree, EvolutionTreeNode } from '../../../core/domain/evolution-tree';
import { Species } from '../../../core/domain/models/species.model';
import { formatDexNumber } from '../../../core/domain/pokedex-number.util';
import { UI_MESSAGES } from '../../../core/i18n/ui-messages';

@Component({
  selector: 'app-evolution-family-tree',
  templateUrl: './evolution-family-tree.component.html',
  styleUrl: './evolution-family-tree.component.scss',
})
export class EvolutionFamilyTreeComponent {
  readonly tree = input.required<EvolutionFamilyTree>();
  readonly speciesById = input.required<ReadonlyMap<number, Species>>();
  readonly nodes = input<EvolutionTreeNode[] | null>(null);
  readonly showHeading = input(true);

  readonly messages = UI_MESSAGES.detail;
  readonly renderedNodes = computed(() => this.nodes() ?? this.tree().roots);

  nameOf(speciesId: number): string {
    return this.speciesById().get(speciesId)?.name ?? `#${speciesId}`;
  }

  dexOf(speciesId: number): string {
    return formatDexNumber(speciesId);
  }

  isFocus(speciesId: number): boolean {
    return this.tree().focusSpeciesId === speciesId;
  }

  triggerLabel(node: EvolutionTreeNode): string {
    return node.incomingRule?.condition ?? '';
  }

  isRomChange(node: EvolutionTreeNode): boolean {
    return node.incomingRule?.isRomModification === true;
  }
}

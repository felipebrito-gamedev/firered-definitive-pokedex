import { Injectable, inject, signal } from '@angular/core';
import { EvolutionFamilyTree, buildEvolutionFamilyTree } from '../domain/evolution-tree';
import { EvolutionRule } from '../domain/models/evolution-rule.model';
import { DefinitivePokedexDB, pokedexDb } from '../persistence/pokedex-db';

@Injectable({
  providedIn: 'root',
})
export class EvolutionTreeService {
  private readonly db = inject(DefinitivePokedexDB, { optional: true }) ?? pokedexDb;
  private readonly rules = signal<EvolutionRule[]>([]);

  async load(): Promise<void> {
    const rules = await this.db.evolutionRules.toArray();
    this.rules.set(rules);
  }

  getFamilyTree(speciesId: number): EvolutionFamilyTree {
    return buildEvolutionFamilyTree(speciesId, this.rules());
  }
}

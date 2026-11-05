import { PokemonType } from './models/pokemon-type.model';

const LIGHT_TEXT_TYPES = new Set<PokemonType>(['FIGHTING', 'POISON', 'GHOST', 'DRAGON', 'DARK']);

export function typeCssVar(type: PokemonType): string {
  return `var(--type-${type.toLowerCase()})`;
}

/**
 * Selects dark text except on the five backgrounds supporting AA white labels.
 */
export function typeUsesDarkLabel(type: PokemonType): boolean {
  return !LIGHT_TEXT_TYPES.has(type);
}

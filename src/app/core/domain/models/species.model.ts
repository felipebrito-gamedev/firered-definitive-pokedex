import { PokemonType } from './pokemon-type.model';

export interface BaseStats {
  readonly hp: number;
  readonly attack: number;
  readonly defense: number;
  readonly speed: number;
  readonly spAttack: number;
  readonly spDefense: number;
  readonly total: number;
}

/**
 * Species Reference Entity.
 * Represents static National Pokédex data (#001–#386) extracted from the ROM binary.
 */
export interface Species {
  readonly id: number; // National Dex 1 to 386
  readonly internalId: number; // ROM internal index 1 to 411
  readonly name: string; // In-game Portuguese name
  readonly primaryType: PokemonType;
  readonly secondaryType?: PokemonType | null;
  readonly baseStats: BaseStats;
  readonly spriteUrl?: string;
}

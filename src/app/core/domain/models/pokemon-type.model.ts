/**
 * All 19 Pokémon types recognized in Pokémon FireRed Definitivo PT-BR v2.0.4,
 * including verified Type ID 18 (FAIRY).
 */
export type PokemonType =
  | 'NORMAL'
  | 'FIRE'
  | 'WATER'
  | 'GRASS'
  | 'ELECTRIC'
  | 'ICE'
  | 'FIGHTING'
  | 'POISON'
  | 'GROUND'
  | 'FLYING'
  | 'PSYCHIC'
  | 'BUG'
  | 'ROCK'
  | 'GHOST'
  | 'DRAGON'
  | 'STEEL'
  | 'DARK'
  | 'FAIRY'
  | 'MYSTERY';

/**
 * Portuguese labels for Pokémon types (UI display).
 */
export const POKEMON_TYPE_LABELS_PT_BR: Record<PokemonType, string> = {
  NORMAL: 'Normal',
  FIRE: 'Fogo',
  WATER: 'Água',
  GRASS: 'Planta',
  ELECTRIC: 'Elétrico',
  ICE: 'Gelo',
  FIGHTING: 'Lutador',
  POISON: 'Venenoso',
  GROUND: 'Terrestre',
  FLYING: 'Voador',
  PSYCHIC: 'Psíquico',
  BUG: 'Inseto',
  ROCK: 'Pedra',
  GHOST: 'Fantasma',
  DRAGON: 'Dragão',
  STEEL: 'Aço',
  DARK: 'Noturno',
  FAIRY: 'Fada',
  MYSTERY: '???',
};

/**
 * List of all 18 standard playable types (excluding MYSTERY) for filtering chips.
 */
export const PLAYABLE_POKEMON_TYPES: readonly PokemonType[] = [
  'NORMAL',
  'FIRE',
  'WATER',
  'GRASS',
  'ELECTRIC',
  'ICE',
  'FIGHTING',
  'POISON',
  'GROUND',
  'FLYING',
  'PSYCHIC',
  'BUG',
  'ROCK',
  'GHOST',
  'DRAGON',
  'STEEL',
  'DARK',
  'FAIRY',
] as const;

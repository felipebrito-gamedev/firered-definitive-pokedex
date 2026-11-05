import { describe, expect, it } from 'vitest';
import { PokemonType, POKEMON_TYPE_LABELS_PT_BR } from './models/pokemon-type.model';
import { typeUsesDarkLabel } from './pokemon-type.util';

// Palette fixture from data-provenance.md; audit actual SCSS tokens separately.
const colors: Record<PokemonType, string> = {
  NORMAL: 'a8a77a',
  FIRE: 'ee8130',
  WATER: '6390f0',
  GRASS: '7ac74c',
  ELECTRIC: 'f7d02c',
  ICE: '96d9d6',
  FIGHTING: 'c22e28',
  POISON: 'a33ea1',
  GROUND: 'e2bf65',
  FLYING: 'a98ff3',
  PSYCHIC: 'f95587',
  BUG: 'a6b91a',
  ROCK: 'b6a136',
  GHOST: '735797',
  DRAGON: '6f35fc',
  STEEL: 'b7b7ce',
  DARK: '705746',
  FAIRY: 'd685ad',
  MYSTERY: '68a090',
};

function luminance(hex: string): number {
  const channels = hex.match(/\w\w/g)!.map((channel) => {
    const value = Number.parseInt(channel, 16) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return channels[0]! * 0.2126 + channels[1]! * 0.7152 + channels[2]! * 0.0722;
}

describe('type badge contrast', () => {
  for (const type of Object.keys(POKEMON_TYPE_LABELS_PT_BR) as PokemonType[]) {
    it(`provides a defined ${type} token and AA small-text contrast`, () => {
      const hex = colors[type];
      expect(hex).toBeDefined();
      const background = luminance(hex!);
      const foreground = luminance(typeUsesDarkLabel(type) ? '1a1a1a' : 'ffffff');
      expect(
        (Math.max(background, foreground) + 0.05) / (Math.min(background, foreground) + 0.05),
      ).toBeGreaterThanOrEqual(4.5);
    });
  }
});

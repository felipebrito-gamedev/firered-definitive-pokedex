import { describe, expect, it } from 'vitest';
import { SEED_SPECIES } from '../data/pokedex-seed.data';
import { chunkSpeciesRows, filterCatalogSpecies, matchesCatalogSearch } from './catalog-filter';
import { Species } from './models/species.model';

function speciesById(id: number): Species {
  const found = SEED_SPECIES.find((entry) => entry.id === id);
  if (!found) {
    throw new Error(`Missing seed species ${id}`);
  }
  return found;
}

describe('filterCatalogSpecies', () => {
  it('matches Pikachu by partial name, unpadded number, and padded #025', () => {
    const pikachu = speciesById(25);

    expect(matchesCatalogSearch(pikachu, 'pika')).toBe(true);
    expect(matchesCatalogSearch(pikachu, '25')).toBe(true);
    expect(matchesCatalogSearch(pikachu, '#025')).toBe(true);
    expect(matchesCatalogSearch(pikachu, '025')).toBe(true);

    const byName = filterCatalogSpecies(SEED_SPECIES, {
      searchTerm: 'pika',
      selectedType: null,
      sortOrder: 'id_asc',
    });
    expect(byName.map((entry) => entry.id)).toEqual([25]);

    const byNumber = filterCatalogSpecies(SEED_SPECIES, {
      searchTerm: '25',
      selectedType: null,
      sortOrder: 'id_asc',
    });
    expect(byNumber.map((entry) => entry.id)).toEqual([25]);
  });

  it('does not treat a numeric query as a prefix (25 does not include 250)', () => {
    const results = filterCatalogSpecies(SEED_SPECIES, {
      searchTerm: '25',
      selectedType: null,
      sortOrder: 'id_asc',
    });
    expect(results.every((entry) => entry.id === 25)).toBe(true);
  });

  it('filters exclusively to the 17 verified Fairy-type Pokémon', () => {
    const fairy = filterCatalogSpecies(SEED_SPECIES, {
      searchTerm: '',
      selectedType: 'FAIRY',
      sortOrder: 'id_asc',
    });

    expect(fairy).toHaveLength(17);
    expect(
      fairy.every((entry) => entry.primaryType === 'FAIRY' || entry.secondaryType === 'FAIRY'),
    ).toBe(true);
  });

  it('sorts by BST descending', () => {
    const subset = [speciesById(1), speciesById(150), speciesById(25)];
    const sorted = filterCatalogSpecies(subset, {
      searchTerm: '',
      selectedType: null,
      sortOrder: 'bst_desc',
    });

    // ROM totals: Mewtwo 680, Bulbasaur 318, Pikachu 300.
    expect(sorted.map((entry) => entry.id)).toEqual([150, 1, 25]);
  });

  it('chunks a filtered list into virtual-scroll rows', () => {
    const rows = chunkSpeciesRows(SEED_SPECIES.slice(0, 5), 2);
    expect(rows).toHaveLength(3);
    expect(rows[0]).toHaveLength(2);
    expect(rows[2]).toHaveLength(1);
  });
});

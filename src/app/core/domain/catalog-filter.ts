import { Species } from './models/species.model';
import { PokemonType } from './models/pokemon-type.model';

export type CatalogSortOrder = 'id_asc' | 'id_desc' | 'name_asc' | 'bst_desc';

export interface CatalogFilterState {
  readonly searchTerm: string;
  readonly selectedType: PokemonType | null;
  readonly sortOrder: CatalogSortOrder;
}

const NUMERIC_SEARCH = /^#?\d+$/;

/**
 * Instant catalog matching: case-insensitive name, exact National Dex number
 * (`25`, `#025`), and primary/secondary type filter.
 */
export function matchesCatalogSearch(species: Species, searchTerm: string): boolean {
  const raw = searchTerm.trim();
  if (raw.length === 0) {
    return true;
  }

  const normalized = raw.toLowerCase();
  if (NUMERIC_SEARCH.test(normalized)) {
    const dexNumber = Number.parseInt(normalized.replace('#', ''), 10);
    return species.id === dexNumber;
  }

  return species.name.toLowerCase().includes(normalized);
}

export function matchesSelectedType(species: Species, selectedType: PokemonType | null): boolean {
  if (selectedType === null) {
    return true;
  }

  return species.primaryType === selectedType || species.secondaryType === selectedType;
}

export function compareSpecies(left: Species, right: Species, sortOrder: CatalogSortOrder): number {
  switch (sortOrder) {
    case 'id_desc':
      return right.id - left.id;
    case 'name_asc':
      return left.name.localeCompare(right.name, 'pt-BR');
    case 'bst_desc':
      return right.baseStats.total - left.baseStats.total;
    case 'id_asc':
    default:
      return left.id - right.id;
  }
}

export function filterCatalogSpecies(
  species: readonly Species[],
  state: CatalogFilterState,
): Species[] {
  return species
    .filter(
      (entry) =>
        matchesCatalogSearch(entry, state.searchTerm) &&
        matchesSelectedType(entry, state.selectedType),
    )
    .sort((left, right) => compareSpecies(left, right, state.sortOrder));
}

export function chunkSpeciesRows(species: readonly Species[], columnCount: number): Species[][] {
  const safeColumns = Math.max(1, columnCount);
  const rows: Species[][] = [];
  for (let index = 0; index < species.length; index += safeColumns) {
    rows.push(species.slice(index, index + safeColumns));
  }
  return rows;
}

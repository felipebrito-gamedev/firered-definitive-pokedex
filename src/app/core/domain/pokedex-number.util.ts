/**
 * Pure domain utility for formatting National Pokédex numbers.
 * The FireRed Definitivo PT-BR v2.0.4 dataset includes species #001 (Bulbasaur)
 * through #386 (Deoxys).
 */
export const MIN_DEX_NUMBER = 1;
export const MAX_DEX_NUMBER = 386;

/**
 * Formats a National Pokédex number into a standard 3-digit padded string (e.g. `#001`).
 *
 * @param dexNumber National Pokédex integer index (1 to 386)
 * @returns Formatted Pokédex string (e.g. `#001`, `#025`, `#386`)
 * @throws RangeError if `dexNumber` is not an integer or outside the range [1, 386]
 */
export function formatDexNumber(dexNumber: number): string {
  if (!Number.isInteger(dexNumber)) {
    throw new RangeError(`Invalid Pokédex number: must be an integer, received ${dexNumber}`);
  }

  if (dexNumber < MIN_DEX_NUMBER || dexNumber > MAX_DEX_NUMBER) {
    throw new RangeError(
      `Invalid Pokédex number: ${dexNumber} is outside the FireRed Definitivo range [${MIN_DEX_NUMBER}, ${MAX_DEX_NUMBER}]`,
    );
  }

  return `#${dexNumber.toString().padStart(3, '0')}`;
}

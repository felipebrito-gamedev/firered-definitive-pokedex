export type EvolutionMethod = 'LEVEL_UP' | 'ITEM' | 'HAPPINESS' | 'PERSONALITY' | 'SPECIAL';

/**
 * EvolutionRule Reference Entity.
 * Represents a verified transition between two species in the ROM Directed Acyclic Graph.
 */
export interface EvolutionRule {
  readonly id: string; // e.g. "evo_1_2"
  readonly fromSpeciesId: number; // Origin National Dex ID
  readonly toSpeciesId: number; // Destination National Dex ID
  readonly method: EvolutionMethod;
  readonly condition: string; // Portuguese description (e.g. "Nível 16", "Pedra da Água")
  readonly minLevel?: number;
  readonly item?: string;
  readonly isRomModification?: boolean; // True if altered from canonical games (e.g. trade replacement)
  readonly notes?: string;
}

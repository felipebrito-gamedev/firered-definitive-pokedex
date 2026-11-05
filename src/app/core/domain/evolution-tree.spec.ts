import { describe, expect, it } from 'vitest';
import { SEED_EVOLUTION_RULES } from '../data/pokedex-seed.data';
import { buildEvolutionFamilyTree, flattenOutgoingRules } from './evolution-tree';

describe('buildEvolutionFamilyTree', () => {
  it('shows Kadabra evolving to Alakazam at level 48 as a ROM modification', () => {
    const tree = buildEvolutionFamilyTree(64, SEED_EVOLUTION_RULES);
    const abra = tree.roots[0];
    const kadabra = abra?.branches[0];
    const alakazam = kadabra?.branches[0];

    expect(tree.memberIds).toEqual([63, 64, 65]);
    expect(kadabra?.speciesId).toBe(64);
    expect(alakazam?.speciesId).toBe(65);
    expect(alakazam?.incomingRule?.minLevel).toBe(48);
    expect(alakazam?.incomingRule?.condition).toBe('Nível 48');
    expect(alakazam?.incomingRule?.isRomModification).toBe(true);
    expect(tree.hasRomModification).toBe(true);
  });

  it('keeps Eevee branches independent', () => {
    const tree = buildEvolutionFamilyTree(133, SEED_EVOLUTION_RULES);
    const destinations = tree.roots[0]?.branches
      .map((branch) => branch.speciesId)
      .sort((a, b) => a - b);

    expect(destinations).toEqual([134, 135, 136, 196, 197]);
    expect(tree.roots[0]?.branches.every((branch) => branch.branches.length === 0)).toBe(true);
  });

  it('renders Gloom, Poliwhirl, Tyrogue, Wurmple, and Clamperl as independent branches', () => {
    const gloom = buildEvolutionFamilyTree(44, SEED_EVOLUTION_RULES);
    expect(
      gloom.roots[0]?.branches[0]?.branches.map((branch) => branch.speciesId).sort((a, b) => a - b),
    ).toEqual([45, 182]);

    const poliwhirl = buildEvolutionFamilyTree(61, SEED_EVOLUTION_RULES);
    expect(
      poliwhirl.roots[0]?.branches[0]?.branches
        .map((branch) => branch.speciesId)
        .sort((a, b) => a - b),
    ).toEqual([62, 186]);

    const tyrogue = buildEvolutionFamilyTree(236, SEED_EVOLUTION_RULES);
    expect(
      tyrogue.roots[0]?.branches.map((branch) => branch.speciesId).sort((a, b) => a - b),
    ).toEqual([106, 107, 237]);

    const wurmple = buildEvolutionFamilyTree(265, SEED_EVOLUTION_RULES);
    expect(
      wurmple.roots[0]?.branches.map((branch) => branch.speciesId).sort((a, b) => a - b),
    ).toEqual([266, 268]);

    const clamperl = buildEvolutionFamilyTree(366, SEED_EVOLUTION_RULES);
    expect(
      clamperl.roots[0]?.branches.map((branch) => branch.speciesId).sort((a, b) => a - b),
    ).toEqual([367, 368]);
  });

  it('includes Nincada producing both Ninjask and Shedinja', () => {
    const tree = buildEvolutionFamilyTree(290, SEED_EVOLUTION_RULES);
    const destinations = tree.roots[0]?.branches
      .map((branch) => branch.speciesId)
      .sort((a, b) => a - b);
    expect(destinations).toEqual([291, 292]);
    expect(flattenOutgoingRules(tree.roots[0]!).some((rule) => rule.toSpeciesId === 292)).toBe(
      true,
    );
  });
});

import { EvolutionRule } from './models/evolution-rule.model';

export interface EvolutionTreeNode {
  readonly speciesId: number;
  readonly incomingRule: EvolutionRule | null;
  readonly branches: EvolutionTreeNode[];
}

export interface EvolutionFamilyTree {
  readonly focusSpeciesId: number;
  readonly roots: EvolutionTreeNode[];
  readonly memberIds: readonly number[];
  readonly hasRomModification: boolean;
}

function outgoingMap(rules: readonly EvolutionRule[]): Map<number, EvolutionRule[]> {
  const map = new Map<number, EvolutionRule[]>();
  for (const rule of rules) {
    const current = map.get(rule.fromSpeciesId) ?? [];
    current.push(rule);
    map.set(rule.fromSpeciesId, current);
  }
  return map;
}

function incomingMap(rules: readonly EvolutionRule[]): Map<number, EvolutionRule[]> {
  const map = new Map<number, EvolutionRule[]>();
  for (const rule of rules) {
    const current = map.get(rule.toSpeciesId) ?? [];
    current.push(rule);
    map.set(rule.toSpeciesId, current);
  }
  return map;
}

function collectFamilyIds(
  speciesId: number,
  outgoing: Map<number, EvolutionRule[]>,
  incoming: Map<number, EvolutionRule[]>,
): Set<number> {
  const family = new Set<number>();
  const queue = [speciesId];

  while (queue.length > 0) {
    const current = queue.pop();
    if (current === undefined || family.has(current)) {
      continue;
    }
    family.add(current);

    for (const rule of outgoing.get(current) ?? []) {
      queue.push(rule.toSpeciesId);
    }
    for (const rule of incoming.get(current) ?? []) {
      queue.push(rule.fromSpeciesId);
    }
  }

  return family;
}

function buildNode(
  speciesId: number,
  incomingRule: EvolutionRule | null,
  outgoing: Map<number, EvolutionRule[]>,
  family: Set<number>,
): EvolutionTreeNode {
  const branches = (outgoing.get(speciesId) ?? [])
    .filter((rule) => family.has(rule.toSpeciesId))
    .map((rule) => buildNode(rule.toSpeciesId, rule, outgoing, family));

  return { speciesId, incomingRule, branches };
}

/**
 * Resolves the full connected evolution family for a species as a DAG tree
 * (independent branches, no cross-registration side effects).
 */
export function buildEvolutionFamilyTree(
  speciesId: number,
  rules: readonly EvolutionRule[],
): EvolutionFamilyTree {
  const outgoing = outgoingMap(rules);
  const incoming = incomingMap(rules);
  const family = collectFamilyIds(speciesId, outgoing, incoming);

  const roots = [...family]
    .filter((id) => (incoming.get(id) ?? []).every((rule) => !family.has(rule.fromSpeciesId)))
    .sort((left, right) => left - right)
    .map((id) => buildNode(id, null, outgoing, family));

  const familyRules = rules.filter(
    (rule) => family.has(rule.fromSpeciesId) && family.has(rule.toSpeciesId),
  );

  return {
    focusSpeciesId: speciesId,
    roots,
    memberIds: [...family].sort((left, right) => left - right),
    hasRomModification: familyRules.some((rule) => rule.isRomModification === true),
  };
}

export function flattenOutgoingRules(node: EvolutionTreeNode): EvolutionRule[] {
  const rules: EvolutionRule[] = [];
  for (const branch of node.branches) {
    if (branch.incomingRule) {
      rules.push(branch.incomingRule);
    }
    rules.push(...flattenOutgoingRules(branch));
  }
  return rules;
}

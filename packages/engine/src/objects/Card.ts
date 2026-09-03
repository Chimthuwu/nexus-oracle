export interface CardDefinition {
  id: string; // The static Scryfall/database ID
  name: string;
  manaCost: string;
  typeLine: string;
  oracleText: string;
  power?: string;
  toughness?: string;
  loyalty?: string;
}

export type CardType = 'Artifact' | 'Creature' | 'Enchantment' | 'Instant' | 'Land' | 'Planeswalker' | 'Sorcery';

export function parseTypes(typeLine: string): CardType[] {
  // Simple heuristic for now
  const types: CardType[] = [];
  if (typeLine.includes('Artifact')) types.push('Artifact');
  if (typeLine.includes('Creature')) types.push('Creature');
  if (typeLine.includes('Enchantment')) types.push('Enchantment');
  if (typeLine.includes('Instant')) types.push('Instant');
  if (typeLine.includes('Land')) types.push('Land');
  if (typeLine.includes('Planeswalker')) types.push('Planeswalker');
  if (typeLine.includes('Sorcery')) types.push('Sorcery');
  return types;
}

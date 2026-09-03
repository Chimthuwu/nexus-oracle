import { CardDefinition, parseTypes, CardType } from './Card';

export class GameObject {
  public instanceId: string;
  public ownerId: string;
  public controllerId: string;
  
  public card: CardDefinition;
  
  // Runtime state
  public isTapped: boolean = false;
  public damage: number = 0;
  public counters: Record<string, number> = {};
  public types: CardType[] = [];
  
  // E.g., summoning sickness
  public hasSummoningSickness: boolean = true;

  constructor(instanceId: string, ownerId: string, card: CardDefinition) {
    this.instanceId = instanceId;
    this.ownerId = ownerId;
    this.controllerId = ownerId;
    this.card = card;
    this.types = parseTypes(card.typeLine);
    
    // Non-creatures technically don't care about summoning sickness, but it applies to permanents
  }
}

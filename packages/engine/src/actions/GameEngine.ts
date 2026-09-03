import { GameState } from '../state/GameState';
import { Phase, Step, ZoneId } from '../state/Enums';
import { GameObject } from '../objects/GameObject';
import { CardDefinition } from '../objects/Card';

export class GameEngine {
  private state: GameState;
  private instanceCounter: number = 0;

  constructor(state: GameState) {
    this.state = state;
  }

  public getState(): GameState {
    return this.state;
  }

  // --- Core Mechanics ---

  public createObject(card: CardDefinition, ownerId: string, zoneId: ZoneId): string {
    const instanceId = `obj_${++this.instanceCounter}`;
    const obj = new GameObject(instanceId, ownerId, card);
    this.state.objects.set(instanceId, obj);
    this.moveObject(instanceId, zoneId);
    return instanceId;
  }

  public moveObject(instanceId: string, toZone: ZoneId) {
    const obj = this.state.objects.get(instanceId);
    if (!obj) throw new Error("Object not found");

    // Remove from current zone
    this.removeFromAllZones(instanceId);

    // Add to new zone
    const isShared = toZone === ZoneId.BATTLEFIELD || toZone === ZoneId.STACK || toZone === ZoneId.EXILE;
    const targetMap = isShared ? this.state.zones['SHARED'] : this.state.zones[obj.ownerId];
    
    if (!targetMap[toZone]) targetMap[toZone] = [];
    targetMap[toZone].push(instanceId);

    // Reset properties if moving between public/hidden zones (simplified)
    if (toZone === ZoneId.BATTLEFIELD) {
      obj.isTapped = false;
      obj.damage = 0;
      obj.hasSummoningSickness = true;
    }
  }

  private removeFromAllZones(instanceId: string) {
    for (const playerKey of Object.keys(this.state.zones)) {
      for (const zoneKey of Object.keys(this.state.zones[playerKey])) {
        const arr = this.state.zones[playerKey][zoneKey];
        const idx = arr.indexOf(instanceId);
        if (idx !== -1) arr.splice(idx, 1);
      }
    }
  }

  // --- Player Actions ---

  public playLand(playerId: string, instanceId: string) {
    if (this.state.activePlayerId !== playerId) throw new Error("Not active player");
    if (this.state.phase !== Phase.PRECOMBAT_MAIN && this.state.phase !== Phase.POSTCOMBAT_MAIN) throw new Error("Not main phase");
    if (this.state.zones['SHARED'][ZoneId.STACK].length > 0) throw new Error("Stack is not empty");
    
    const obj = this.state.objects.get(instanceId);
    if (!obj || obj.ownerId !== playerId) throw new Error("Invalid object");
    if (!obj.types.includes('Land')) throw new Error("Not a land");
    
    // Check if in hand (simplified)
    const hand = this.state.zones[playerId][ZoneId.HAND] || [];
    if (!hand.includes(instanceId)) throw new Error("Not in hand");

    // Move directly to battlefield (lands don't use stack)
    this.moveObject(instanceId, ZoneId.BATTLEFIELD);
  }

  public castSpell(playerId: string, instanceId: string, targets?: string[]) {
    // simplified
    const obj = this.state.objects.get(instanceId);
    if (!obj || obj.ownerId !== playerId) throw new Error("Invalid object");
    if (obj.types.includes('Land')) throw new Error("Cannot cast a land");

    // Move to stack
    this.moveObject(instanceId, ZoneId.STACK);
    
    // Active player gets priority back after casting
    this.state.priorityPlayerId = playerId;
  }

  // --- Turn Progression ---

  public passPriority(playerId: string) {
    // simplified: just alternating priority for 2 players
    const p1 = this.state.players[0].id;
    const p2 = this.state.players[1]?.id;

    if (this.state.priorityPlayerId === p1 && p2) {
      this.state.priorityPlayerId = p2;
    } else {
      // Both passed, resolve stack or advance step
      const stack = this.state.zones['SHARED'][ZoneId.STACK];
      if (stack && stack.length > 0) {
        this.resolveTopmostStackItem();
      } else {
        this.advanceStep();
      }
    }
  }

  private resolveTopmostStackItem() {
    // Implement resolution logic (spells entering battlefield, instants taking effect, etc.)
    const stack = this.state.zones['SHARED'][ZoneId.STACK];
    const instanceId = stack.pop();
    if (!instanceId) return;
    
    const obj = this.state.objects.get(instanceId);
    if (!obj) return;

    if (obj.types.includes('Permanent' as any) || obj.types.includes('Creature') || obj.types.includes('Artifact') || obj.types.includes('Enchantment') || obj.types.includes('Planeswalker')) {
      this.moveObject(instanceId, ZoneId.BATTLEFIELD);
    } else {
      this.moveObject(instanceId, ZoneId.GRAVEYARD);
    }
    
    // Priority returns to active player
    this.state.priorityPlayerId = this.state.activePlayerId;
  }

  private advanceStep() {
    // Simplified phase progression
    const steps = [
      { phase: Phase.BEGINNING, step: Step.UNTAP },
      { phase: Phase.BEGINNING, step: Step.UPKEEP },
      { phase: Phase.BEGINNING, step: Step.DRAW },
      { phase: Phase.PRECOMBAT_MAIN, step: Step.PRECOMBAT_MAIN as any },
      { phase: Phase.COMBAT, step: Step.BEGIN_COMBAT },
      { phase: Phase.COMBAT, step: Step.DECLARE_ATTACKERS },
      { phase: Phase.COMBAT, step: Step.DECLARE_BLOCKERS },
      { phase: Phase.COMBAT, step: Step.COMBAT_DAMAGE },
      { phase: Phase.COMBAT, step: Step.END_COMBAT },
      { phase: Phase.POSTCOMBAT_MAIN, step: Step.POSTCOMBAT_MAIN as any },
      { phase: Phase.ENDING, step: Step.END },
      { phase: Phase.ENDING, step: Step.CLEANUP },
    ];

    let currentIndex = steps.findIndex(s => s.phase === this.state.phase && s.step === this.state.step);
    if (currentIndex === -1) currentIndex = 0;
    
    if (currentIndex >= steps.length - 1) {
      // Next turn
      this.state.turnNumber++;
      const p1 = this.state.players[0].id;
      const p2 = this.state.players[1]?.id;
      this.state.activePlayerId = this.state.activePlayerId === p1 ? (p2 || p1) : p1;
      this.state.phase = steps[0].phase;
      this.state.step = steps[0].step;
    } else {
      this.state.phase = steps[currentIndex + 1].phase;
      this.state.step = steps[currentIndex + 1].step;
    }

    this.state.priorityPlayerId = this.state.activePlayerId;
    this.triggerStepEffects();
  }

  private triggerStepEffects() {
    if (this.state.step === Step.UNTAP) {
      const activeId = this.state.activePlayerId;
      const bf = this.state.zones['SHARED'][ZoneId.BATTLEFIELD] || [];
      for (const instanceId of bf) {
        const obj = this.state.objects.get(instanceId);
        if (obj && obj.controllerId === activeId) {
          obj.isTapped = false;
        }
      }
    }
  }

}

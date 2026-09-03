import { Player } from './Player';
import { Phase, Step, ZoneId } from './Enums';

export class GameState {
  public players: Player[] = [];
  public activePlayerId: string | null = null;
  public priorityPlayerId: string | null = null;
  
  public turnNumber: number = 1;
  public phase: Phase = Phase.BEGINNING;
  public step: Step = Step.UNTAP;

  // Simplified zone maps: PlayerId -> ZoneId -> CardIds[]
  // For shared zones (Battlefield, Stack, Exile), we can use a special "SHARED" player ID or store them globally.
  public zones: Record<string, Record<ZoneId, string[]>> = {};

  constructor(playerIds: string[]) {
    this.players = playerIds.map(id => new Player(id));
    if (playerIds.length > 0) {
      this.activePlayerId = playerIds[0];
      this.priorityPlayerId = playerIds[0];
    }
  }

  // Next steps: adding state transitions, passing priority, advancing phases, drawing cards, etc.
}

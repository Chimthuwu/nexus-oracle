import { Player } from './Player';
import { Phase, Step, ZoneId } from './Enums';
import { GameObject } from '../objects/GameObject';

export class GameState {
  public players: Player[] = [];
  public activePlayerId: string | null = null;
  public priorityPlayerId: string | null = null;
  
  public turnNumber: number = 1;
  public phase: Phase = Phase.BEGINNING;
  public step: Step = Step.UNTAP;

  // Global registry of all objects currently existing in the game (across all zones)
  public objects: Map<string, GameObject> = new Map();
  
  // Zones: PlayerId -> ZoneId -> InstanceId[]
  // Shared zones use a special 'SHARED' key
  public zones: Record<string, Record<string, string[]>> = {
    SHARED: {
      [ZoneId.BATTLEFIELD]: [],
      [ZoneId.STACK]: [],
      [ZoneId.EXILE]: []
    }
  };

  constructor(playerIds: string[]) {
    this.players = playerIds.map(id => new Player(id));
    
    // Initialize personal zones for each player
    for (const pid of playerIds) {
      this.zones[pid] = {
        [ZoneId.LIBRARY]: [],
        [ZoneId.HAND]: [],
        [ZoneId.GRAVEYARD]: [],
        [ZoneId.COMMAND]: []
      };
    }

    if (playerIds.length > 0) {
      this.activePlayerId = playerIds[0];
      this.priorityPlayerId = playerIds[0];
    }
  }
}

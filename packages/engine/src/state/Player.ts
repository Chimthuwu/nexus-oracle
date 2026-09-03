export class Player {
  public id: string;
  public life: number = 20;
  public manaPool: Record<string, number> = { W: 0, U: 0, B: 0, R: 0, G: 0, C: 0 };
  public poisonCounters: number = 0;

  constructor(id: string) {
    this.id = id;
  }
}

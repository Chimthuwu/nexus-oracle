import { create } from 'zustand';
import type { CardData } from './useOracleStore';

/**
 * Mock duel state — a deliberately shallow slice of Magic so the Duel view is
 * playable now: draw, drop creatures/lands onto the battlefield, swing, drop
 * the opponent to 0. No mana, no stack, no blockers yet.
 *
 * This is scaffolding for todo.md big feature #3. When `@nexus/engine` exposes
 * a stable GameState + applyAction, the actions below become thin adapters
 * over it and the scene keeps rendering from the same selectors.
 */

export type Side = 'you' | 'oracle';
export type DuelZone = 'hand' | 'creatures' | 'lands' | 'graveyard';
export type DuelPhase = 'main1' | 'combat' | 'main2' | 'end';

export interface DuelCard {
  uid: string;
  card: CardData;
  owner: Side;
  zone: DuelZone;
  tapped: boolean;
  sick: boolean;
}

const CARDS_API = 'https://nexus-oracle-u6ra.onrender.com/api/cards/search';
const PHASE_ORDER: DuelPhase[] = ['main1', 'combat', 'main2', 'end'];

const isLand = (c: CardData) => /land/i.test(c.typeLine);
const isCreature = (c: CardData) => /creature/i.test(c.typeLine);
const power = (c: CardData) => {
  const n = Number.parseInt(c.power ?? '', 10);
  return Number.isNaN(n) ? 1 : n;
};

let uidSeq = 0;
const mkCard = (card: CardData, owner: Side, zone: DuelZone): DuelCard => ({
  uid: `d${uidSeq++}`,
  card,
  owner,
  zone,
  tapped: false,
  sick: zone === 'creatures',
});

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface DuelState {
  active: boolean;
  loading: boolean;
  turn: number;
  phase: DuelPhase;
  current: Side;
  life: Record<Side, number>;
  winner: Side | null;
  cards: DuelCard[];
  library: Record<Side, CardData[]>;
  log: string[];

  startDuel: () => Promise<void>;
  playCard: (uid: string) => void;
  attack: (uid: string) => void;
  nextPhase: () => void;
  endDuel: () => void;
}

const say = (log: string[], line: string) => [line, ...log].slice(0, 30);

export const useDuelStore = create<DuelState>((set, get) => ({
  active: false,
  loading: false,
  turn: 1,
  phase: 'main1',
  current: 'you',
  life: { you: 20, oracle: 20 },
  winner: null,
  cards: [],
  library: { you: [], oracle: [] },
  log: [],

  startDuel: async () => {
    set({ loading: true });
    try {
      const res = await fetch(`${CARDS_API}?limit=50`);
      const data = (await res.json()) as { cards?: CardData[] };
      const pool = Array.isArray(data.cards) ? data.cards : [];
      const creatures = pool.filter(isCreature);
      const rest = pool.filter((c) => !isCreature(c) && !isLand(c));
      const build = () =>
        shuffle([
          ...shuffle(creatures).slice(0, 10),
          ...shuffle(rest).slice(0, 6),
        ]);
      const youDeck = build();
      const oracleDeck = build();

      const cards = [
        ...youDeck.slice(0, 5).map((c) => mkCard(c, 'you', 'hand')),
        ...oracleDeck.slice(0, 5).map((c) => mkCard(c, 'oracle', 'hand')),
      ].map((c) => ({ ...c, sick: false }));

      set({
        active: true,
        loading: false,
        turn: 1,
        phase: 'main1',
        current: 'you',
        life: { you: 20, oracle: 20 },
        winner: null,
        cards,
        library: { you: youDeck.slice(5), oracle: oracleDeck.slice(5) },
        log: ['The duel begins. You have priority.'],
      });
    } catch (err) {
      console.error('startDuel failed:', err);
      set({ loading: false });
    }
  },

  playCard: (uid) => {
    const s = get();
    if (!s.active || s.winner || s.current !== 'you') return;
    if (s.phase !== 'main1' && s.phase !== 'main2') return;
    const dc = s.cards.find((c) => c.uid === uid && c.owner === 'you' && c.zone === 'hand');
    if (!dc) return;
    const toZone: DuelZone = isLand(dc.card) ? 'lands' : 'creatures';
    set({
      cards: s.cards.map((c) =>
        c.uid === uid
          ? { ...c, zone: toZone, sick: toZone === 'creatures' }
          : c
      ),
      log: say(s.log, `You play ${dc.card.name}.`),
    });
  },

  attack: (uid) => {
    const s = get();
    if (!s.active || s.winner || s.current !== 'you' || s.phase !== 'combat') return;
    const atk = s.cards.find(
      (c) => c.uid === uid && c.owner === 'you' && c.zone === 'creatures' && !c.tapped && !c.sick
    );
    if (!atk) return;
    const dmg = power(atk.card);
    const oracleLife = s.life.oracle - dmg;
    set({
      cards: s.cards.map((c) => (c.uid === uid ? { ...c, tapped: true } : c)),
      life: { ...s.life, oracle: oracleLife },
      log: say(s.log, `${atk.card.name} hits the Oracle for ${dmg}.`),
      winner: oracleLife <= 0 ? 'you' : s.winner,
    });
    if (oracleLife <= 0) set({ log: say(get().log, 'The Oracle falls. You win.') });
  },

  nextPhase: () => {
    const s = get();
    if (!s.active || s.winner) return;
    const idx = PHASE_ORDER.indexOf(s.phase);
    if (idx < PHASE_ORDER.length - 1) {
      set({ phase: PHASE_ORDER[idx + 1] });
      return;
    }
    // End of a turn — hand over.
    if (s.current === 'you') {
      set({ current: 'oracle', phase: 'main1', log: say(s.log, 'The Oracle takes its turn.') });
      setTimeout(() => runOracleTurn(set, get), 700);
    } else {
      beginTurn(set, get, 'you');
    }
  },

  endDuel: () => set({ active: false, cards: [], winner: null, log: [] }),
}));

/** Untap, clear sickness, draw for `side`, and give them main1. */
function beginTurn(
  set: (partial: Partial<DuelState>) => void,
  get: () => DuelState,
  side: Side
) {
  const s = get();
  const lib = [...s.library[side]];
  const drawn = lib.shift();
  const turn = side === 'you' ? s.turn + 1 : s.turn;
  set({
    current: side,
    phase: 'main1',
    turn,
    library: { ...s.library, [side]: lib },
    cards: [
      ...s.cards.map((c) =>
        c.owner === side && (c.zone === 'creatures' || c.zone === 'lands')
          ? { ...c, tapped: false, sick: false }
          : c
      ),
      ...(drawn ? [mkCard(drawn, side, 'hand')] : []),
    ],
    log: say(s.log, side === 'you' ? 'Your turn. You draw a card.' : 'The Oracle draws.'),
  });
}

/** Minimal opponent: play a land, play the biggest creature, swing with all. */
function runOracleTurn(
  set: (partial: Partial<DuelState>) => void,
  get: () => DuelState
) {
  beginTurn(set, get, 'oracle');

  setTimeout(() => {
    let s = get();
    if (!s.active || s.winner) return;
    const hand = s.cards.filter((c) => c.owner === 'oracle' && c.zone === 'hand');
    const land = hand.find((c) => isLand(c.card));
    const creature = hand
      .filter((c) => isCreature(c.card))
      .sort((a, b) => power(b.card) - power(a.card))[0];
    const play = [land?.uid, creature?.uid].filter(Boolean) as string[];
    if (play.length) {
      set({
        cards: s.cards.map((c) =>
          play.includes(c.uid)
            ? { ...c, zone: isLand(c.card) ? 'lands' : 'creatures', sick: !isLand(c.card) }
            : c
        ),
        log: say(
          s.log,
          `The Oracle plays ${[land?.card.name, creature?.card.name].filter(Boolean).join(' and ')}.`
        ),
      });
    }

    setTimeout(() => {
      s = get();
      if (!s.active || s.winner) return;
      const attackers = s.cards.filter(
        (c) => c.owner === 'oracle' && c.zone === 'creatures' && !c.tapped && !c.sick
      );
      let youLife = s.life.you;
      let log = s.log;
      for (const a of attackers) {
        youLife -= power(a.card);
        log = say(log, `The Oracle's ${a.card.name} strikes you for ${power(a.card)}.`);
      }
      set({
        cards: s.cards.map((c) =>
          attackers.some((a) => a.uid === c.uid) ? { ...c, tapped: true } : c
        ),
        life: { ...s.life, you: youLife },
        winner: youLife <= 0 ? 'oracle' : s.winner,
        log: youLife <= 0 ? say(log, 'You have fallen. The Oracle wins.') : log,
      });

      setTimeout(() => {
        if (!get().winner) beginTurn(set, get, 'you');
      }, 800);
    }, 800);
  }, 800);
}

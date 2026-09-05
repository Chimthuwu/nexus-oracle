import { create } from 'zustand';
import type { CardData } from './useOracleStore';

/**
 * Mock duel state — a deliberately shallow slice of Magic so the Duel view is
 * playable now: draw, drop lands, tap them to pay a spell's mana value,
 * summoning-sick creatures, swing, drop the opponent to 0. Mana is generic —
 * any untapped land pays for any cost, no colored pips — and there's still
 * no stack or blockers.
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

/** One segment of a log line — plain text, or a card name linked to its uid
 * (so clicking it in the HUD can highlight/inspect that exact card). */
export interface LogPart {
  text: string;
  uid?: string;
}
export type LogLine = LogPart[];

const CARDS_API = '/api/cards/search';
const PHASE_ORDER: DuelPhase[] = ['main1', 'combat', 'main2', 'end'];

const isLand = (c: CardData) => /land/i.test(c.typeLine);
const isCreature = (c: CardData) => /creature/i.test(c.typeLine);
const power = (c: CardData) => {
  const n = Number.parseInt(c.power ?? '', 10);
  return Number.isNaN(n) ? 1 : n;
};
const cost = (c: CardData) => c.manaValue ?? 0;
const untappedLands = (cards: DuelCard[], side: Side) =>
  cards.filter((c) => c.owner === side && c.zone === 'lands' && !c.tapped);

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

const HAND_SIZE = 5;

/**
 * Shuffle a full pool (existing hand + library) back together, draw a fresh
 * hand, and bottom `mulligans` cards from it — a London-mulligan-style cost:
 * more mulligans, smaller functional hand, same fixed draw size.
 */
function drawMulliganHand(pool: CardData[], mulligans: number) {
  const shuffled = shuffle(pool);
  const drawn = shuffled.slice(0, HAND_SIZE);
  const rest = shuffled.slice(HAND_SIZE);
  const keepCount = Math.max(0, HAND_SIZE - mulligans);
  return {
    hand: drawn.slice(0, keepCount),
    library: [...rest, ...drawn.slice(keepCount)],
  };
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
  log: LogLine[];
  inspectedUid: string | null;
  /** True while you're looking at your opening hand, before the duel proper
   * starts — only `mulligan`/`keepHand` are live, everything else is inert. */
  pendingMulligan: boolean;
  mulligansTaken: number;

  startDuel: () => Promise<void>;
  mulligan: () => void;
  keepHand: () => void;
  playCard: (uid: string) => void;
  attack: (uid: string) => void;
  nextPhase: () => void;
  endDuel: () => void;
  setInspected: (uid: string | null) => void;
}

const say = (log: LogLine[], line: LogLine) => [line, ...log].slice(0, 30);
/** A log line with no card references. */
const plain = (text: string): LogLine => [{ text }];
/** A log line naming one card, linked to its uid. */
const withCard = (before: string, dc: { uid: string; card: CardData }, after = ''): LogLine => [
  { text: before },
  { text: dc.card.name, uid: dc.uid },
  { text: after },
];

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
  inspectedUid: null,
  pendingMulligan: false,
  mulligansTaken: 0,

  setInspected: (uid) => set({ inspectedUid: uid }),

  startDuel: async () => {
    set({ loading: true });
    try {
      // The search endpoint ranks an empty query as a flat alphabetical
      // list, so a plain "give me N cards" fetch is always the same N
      // cards starting with "A" — every deck ended up being a-words only.
      // A single letter as the query text-matches it anywhere in the name
      // or oracle text, which in a 30000+ card archive lands hits all over
      // the alphabet; merging several random letters' worth spreads that
      // further and de-duplicates any card multiple letters happen to hit.
      const ALPHABET = 'abcdefghijklmnopqrstuvwxyz';
      const randomLetters = (n: number) => shuffle(ALPHABET.split('')).slice(0, n);
      const fetchCards = async (params: string) => {
        const res = await fetch(`${CARDS_API}?${params}`);
        const data = (await res.json()) as { cards?: CardData[] };
        return Array.isArray(data.cards) ? data.cards : [];
      };
      const dedupe = (batches: CardData[][]) => {
        const seen = new Map<string, CardData>();
        for (const batch of batches) for (const c of batch) seen.set(c.id, c);
        return [...seen.values()];
      };

      const [landBatches, generalBatches] = await Promise.all([
        Promise.all(randomLetters(4).map((l) => fetchCards(`q=${l}&type=land&limit=15`))),
        Promise.all(randomLetters(8).map((l) => fetchCards(`q=${l}&limit=20`))),
      ]);
      const landPool = dedupe(landBatches);
      const generalPool = dedupe(generalBatches);
      const creatures = generalPool.filter(isCreature);
      const rest = generalPool.filter((c) => !isCreature(c) && !isLand(c));
      const build = () =>
        shuffle([
          ...shuffle(landPool).slice(0, 7),
          ...shuffle(creatures).slice(0, 7),
          ...shuffle(rest).slice(0, 2),
        ]);
      const youDeck = build();
      const oracleDeck = build();

      let youHand = youDeck.slice(0, HAND_SIZE);
      let youLib = youDeck.slice(HAND_SIZE);
      let oracleHand = oracleDeck.slice(0, HAND_SIZE);
      let oracleLib = oracleDeck.slice(HAND_SIZE);

      // The Oracle mulligans a hand with no lands at all (once) — same rule
      // you get to apply to yours, just decided for it.
      const log: LogLine[] = [];
      if (!oracleHand.some(isLand)) {
        const redraw = drawMulliganHand([...oracleHand, ...oracleLib], 1);
        oracleHand = redraw.hand;
        oracleLib = redraw.library;
        log.unshift(plain('The Oracle mulligans a hand with no lands.'));
      }

      const cards = [
        ...youHand.map((c) => mkCard(c, 'you', 'hand')),
        ...oracleHand.map((c) => mkCard(c, 'oracle', 'hand')),
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
        library: { you: youLib, oracle: oracleLib },
        log,
        pendingMulligan: true,
        mulligansTaken: 0,
        inspectedUid: null,
      });
    } catch (err) {
      console.error('startDuel failed:', err);
      set({ loading: false });
    }
  },

  mulligan: () => {
    const s = get();
    if (!s.pendingMulligan || s.winner) return;
    const currentHand = s.cards.filter((c) => c.owner === 'you' && c.zone === 'hand');
    const mulligansTaken = s.mulligansTaken + 1;
    const { hand, library } = drawMulliganHand(
      [...currentHand.map((c) => c.card), ...s.library.you],
      mulligansTaken
    );
    set({
      cards: [
        ...s.cards.filter((c) => !(c.owner === 'you' && c.zone === 'hand')),
        ...hand.map((c) => mkCard(c, 'you', 'hand')),
      ],
      library: { ...s.library, you: library },
      mulligansTaken,
      log: say(s.log, plain(`You mulligan to ${hand.length}.`)),
    });
  },

  keepHand: () => {
    const s = get();
    if (!s.pendingMulligan || s.winner) return;
    const handSize = s.cards.filter((c) => c.owner === 'you' && c.zone === 'hand').length;
    set({
      pendingMulligan: false,
      log: say(
        s.log,
        plain(
          s.mulligansTaken > 0
            ? `You keep your hand of ${handSize}. You have priority.`
            : 'The duel begins. You have priority.'
        )
      ),
    });
  },

  playCard: (uid) => {
    const s = get();
    set({ inspectedUid: null });
    if (!s.active || s.winner || s.pendingMulligan || s.current !== 'you') return;
    if (s.phase !== 'main1' && s.phase !== 'main2') return;
    const dc = s.cards.find((c) => c.uid === uid && c.owner === 'you' && c.zone === 'hand');
    if (!dc) return;

    if (isLand(dc.card)) {
      set({
        cards: s.cards.map((c) => (c.uid === uid ? { ...c, zone: 'lands' } : c)),
        log: say(s.log, withCard('You play ', dc, '.')),
      });
      return;
    }

    // Non-land spells cost mana: tap that many of your untapped lands.
    const need = cost(dc.card);
    const available = untappedLands(s.cards, 'you');
    if (available.length < need) {
      set({
        log: say(
          s.log,
          withCard(
            'Not enough mana to play ',
            dc,
            ` — need ${need}, have ${available.length}.`
          )
        ),
      });
      return;
    }
    const payWith = new Set(available.slice(0, need).map((c) => c.uid));
    set({
      cards: s.cards.map((c) =>
        c.uid === uid
          ? { ...c, zone: 'creatures', sick: true }
          : payWith.has(c.uid)
            ? { ...c, tapped: true }
            : c
      ),
      log: say(s.log, withCard('You play ', dc, '.')),
    });
  },

  attack: (uid) => {
    const s = get();
    set({ inspectedUid: null });
    if (!s.active || s.winner || s.pendingMulligan || s.current !== 'you' || s.phase !== 'combat')
      return;
    const atk = s.cards.find(
      (c) => c.uid === uid && c.owner === 'you' && c.zone === 'creatures' && !c.tapped && !c.sick
    );
    if (!atk) return;
    const dmg = power(atk.card);
    const oracleLife = s.life.oracle - dmg;
    set({
      cards: s.cards.map((c) => (c.uid === uid ? { ...c, tapped: true } : c)),
      life: { ...s.life, oracle: oracleLife },
      log: say(s.log, withCard('', atk, ` hits the Oracle for ${dmg}.`)),
      winner: oracleLife <= 0 ? 'you' : s.winner,
    });
    if (oracleLife <= 0) set({ log: say(get().log, plain('The Oracle falls. You win.')) });
  },

  nextPhase: () => {
    const s = get();
    if (!s.active || s.winner || s.pendingMulligan) return;
    const idx = PHASE_ORDER.indexOf(s.phase);
    if (idx < PHASE_ORDER.length - 1) {
      set({ phase: PHASE_ORDER[idx + 1] });
      return;
    }
    // End of a turn — hand over.
    if (s.current === 'you') {
      set({ current: 'oracle', phase: 'main1', log: say(s.log, plain('The Oracle takes its turn.')) });
      setTimeout(() => runOracleTurn(set, get), 700);
    } else {
      beginTurn(set, get, 'you');
    }
  },

  endDuel: () =>
    set({ active: false, cards: [], winner: null, log: [], pendingMulligan: false, mulligansTaken: 0 }),
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
  const drawnCard = drawn ? mkCard(drawn, side, 'hand') : null;
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
      ...(drawnCard ? [drawnCard] : []),
    ],
    // Your own draw names the card (it's your hidden information to see);
    // the Oracle's draw stays unnamed — no peeking at its hand.
    log: say(
      s.log,
      side === 'you' && drawnCard
        ? withCard('Your turn. You draw ', drawnCard, '.')
        : plain(side === 'you' ? 'Your turn. You draw a card.' : 'The Oracle draws.')
    ),
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
    // Lands enter untapped, so one played this turn already counts toward
    // what it can afford to cast this turn.
    const pool = untappedLands(s.cards, 'oracle').length + (land ? 1 : 0);
    const creature = hand
      .filter((c) => isCreature(c.card) && cost(c.card) <= pool)
      .sort((a, b) => power(b.card) - power(a.card))[0];
    const play = [land?.uid, creature?.uid].filter(Boolean) as string[];
    if (play.length) {
      const line: LogLine = [{ text: 'The Oracle plays ' }];
      if (land) line.push({ text: land.card.name, uid: land.uid });
      if (land && creature) line.push({ text: ' and ' });
      if (creature) line.push({ text: creature.card.name, uid: creature.uid });
      line.push({ text: '.' });

      // Pay for the creature: existing untapped lands first, then the one
      // just played (it's untapped and free until spent).
      const payWith = new Set<string>();
      if (creature) {
        let remaining = cost(creature.card);
        for (const l of untappedLands(s.cards, 'oracle')) {
          if (remaining <= 0) break;
          payWith.add(l.uid);
          remaining--;
        }
        if (remaining > 0 && land) payWith.add(land.uid);
      }

      set({
        cards: s.cards.map((c) => {
          if (c.uid === land?.uid) return { ...c, zone: 'lands', tapped: payWith.has(c.uid) };
          if (c.uid === creature?.uid) return { ...c, zone: 'creatures', sick: true };
          if (payWith.has(c.uid)) return { ...c, tapped: true };
          return c;
        }),
        log: say(s.log, line),
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
        log = say(log, withCard("The Oracle's ", a, ` strikes you for ${power(a.card)}.`));
      }
      set({
        cards: s.cards.map((c) =>
          attackers.some((a) => a.uid === c.uid) ? { ...c, tapped: true } : c
        ),
        life: { ...s.life, you: youLife },
        winner: youLife <= 0 ? 'oracle' : s.winner,
        log: youLife <= 0 ? say(log, plain('You have fallen. The Oracle wins.')) : log,
      });

      setTimeout(() => {
        if (!get().winner) beginTurn(set, get, 'you');
      }, 800);
    }, 800);
  }, 800);
}

import { create } from 'zustand';

/**
 * The canonical Nexus `Card` shape — mirrors @nexus/card-data's frozen `Card`
 * contract (TODO.txt §4.1). The server returns objects of exactly this shape in
 * `/api/oracle/ask` → `cards[]`, so they drop straight into the store.
 */
export interface CardData {
  id: string;
  name: string;
  manaCost: string;
  manaValue: number;
  typeLine: string;
  oracleText: string;
  colors: string[];
  colorIdentity: string[];
  rarity: 'common' | 'uncommon' | 'rare' | 'mythic';
  power?: string;
  toughness?: string;
  loyalty?: string;
  set: string;
  setName: string;
  artCropUrl: string;
  imageUrl: string;
  keywords: string[];
}

/** One turn of the conversation. `role` matches the server's §4.2 history shape. */
export interface ChatTurn {
  role: 'user' | 'oracle';
  content: string;
}

interface OracleState {
  isThinking: boolean;
  setThinking: (thinking: boolean) => void;

  /** The Oracle's current spoken line (drives the typewriter caption). */
  responseText: string;
  setResponseText: (text: string) => void;

  /** Rolling conversation log — sent back to the server as `history`. */
  history: ChatTurn[];
  pushTurn: (turn: ChatTurn) => void;
  clearHistory: () => void;

  cards: CardData[];
  setCards: (cards: CardData[]) => void;

  inspectedCard: CardData | null;
  setInspectedCard: (card: CardData | null) => void;
}

const HISTORY_LIMIT = 16;

export const useOracleStore = create<OracleState>((set) => ({
  isThinking: false,
  setThinking: (thinking) => set({ isThinking: thinking }),

  responseText: '',
  setResponseText: (text) => set({ responseText: text }),

  history: [],
  pushTurn: (turn) =>
    set((state) => ({ history: [...state.history, turn].slice(-HISTORY_LIMIT) })),
  clearHistory: () => set({ history: [] }),

  cards: [],
  setCards: (cards) => set({ cards }),

  inspectedCard: null,
  setInspectedCard: (card) => set({ inspectedCard: card }),
}));

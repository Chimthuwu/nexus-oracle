import { create } from 'zustand';

export interface CardData {
  id: string;
  name: string;
  manaCost: string;
  manaValue: number;
  typeLine: string;
  oracleText: string;
  colors: string[];
  colorIdentity: string[];
  rarity: "common" | "uncommon" | "rare" | "mythic";
  power?: string;
  toughness?: string;
  loyalty?: string;
  set: string;
  setName: string;
  artCropUrl: string;
  imageUrl: string;
  keywords: string[];
}

interface OracleState {
  isThinking: boolean;
  setThinking: (thinking: boolean) => void;
  responseText: string;
  setResponseText: (text: string) => void;
  cards: CardData[];
  setCards: (cards: CardData[]) => void;
  inspectedCard: CardData | null;
  setInspectedCard: (card: CardData | null) => void;
}

export const useOracleStore = create<OracleState>((set) => ({
  isThinking: false,
  setThinking: (thinking) => set({ isThinking: thinking }),
  responseText: '',
  setResponseText: (text) => set({ responseText: text }),
  cards: [],
  setCards: (cards) => set({ cards }),
  inspectedCard: null,
  setInspectedCard: (card) => set({ inspectedCard: card }),
}));

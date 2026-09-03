import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

/** One turn of a conversation. `role` matches the server's §4.2 history shape. */
export interface ChatTurn {
  role: 'user' | 'oracle';
  content: string;
  /** Cards summoned on this turn (oracle turns only) — replayed on thread switch. */
  cards?: CardData[];
  at: number;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  turns: ChatTurn[];
}

/** Turns sent back to the server as `history` (server bounds its own window). */
const HISTORY_SEND_LIMIT = 16;

export type View = 'oracle' | 'browser';

const CARDS_API = 'https://nexus-oracle-u6ra.onrender.com/api/cards/search';

interface OracleState {
  // ── Ephemeral view state (not persisted) ──────────────────────────────
  isThinking: boolean;
  setThinking: (thinking: boolean) => void;
  /** The Oracle's current spoken line (drives the typewriter caption). */
  responseText: string;
  setResponseText: (text: string) => void;
  cards: CardData[];
  setCards: (cards: CardData[]) => void;
  inspectedCard: CardData | null;
  setInspectedCard: (card: CardData | null) => void;

  // ── Card browser ─────────────────────────────────────────────────────
  view: View;
  setView: (v: View) => void;
  browserCards: CardData[];
  browserLoading: boolean;
  browserQuery: string;
  browserColors: string[];
  loadBrowser: (opts?: { query?: string; colors?: string[] }) => Promise<void>;

  // ── Persisted conversation history ────────────────────────────────────
  conversations: Conversation[];
  activeId: string | null;

  /** Turns of the active conversation (empty if none) — for rendering + send. */
  activeTurns: () => ChatTurn[];
  /** Prior turns to send as `history` on the next ask. */
  historyForSend: () => { role: 'user' | 'oracle'; content: string }[];

  newConversation: () => string;
  selectConversation: (id: string) => void;
  deleteConversation: (id: string) => void;
  renameConversation: (id: string, title: string) => void;

  /** Append a turn to the active conversation, creating one if needed. */
  appendTurn: (turn: Omit<ChatTurn, 'at'>) => void;
}

const genId = () =>
  `c_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

/** First user line → a short thread title. */
function titleFrom(text: string): string {
  const t = text.trim().replace(/\s+/g, ' ');
  return t.length > 42 ? `${t.slice(0, 41)}…` : t || 'New conversation';
}

export const useOracleStore = create<OracleState>()(
  persist(
    (set, get) => ({
      isThinking: false,
      setThinking: (thinking) => set({ isThinking: thinking }),
      responseText: '',
      setResponseText: (text) => set({ responseText: text }),
      cards: [],
      setCards: (cards) => set({ cards }),
      inspectedCard: null,
      setInspectedCard: (card) => set({ inspectedCard: card }),

      view: 'oracle',
      setView: (v) => set({ view: v, inspectedCard: null }),
      browserCards: [],
      browserLoading: false,
      browserQuery: '',
      browserColors: [],
      loadBrowser: async (opts) => {
        const query = opts?.query ?? get().browserQuery;
        const colors = opts?.colors ?? get().browserColors;
        set({ browserLoading: true, browserQuery: query, browserColors: colors });
        try {
          const params = new URLSearchParams({ limit: '50' });
          if (query.trim()) params.set('q', query.trim());
          if (colors.length) params.set('colors', colors.join(','));
          const res = await fetch(`${CARDS_API}?${params.toString()}`);
          const data = (await res.json()) as { cards?: CardData[] };
          set({ browserCards: Array.isArray(data.cards) ? data.cards : [] });
        } catch (err) {
          console.error('Card browser load failed:', err);
          set({ browserCards: [] });
        } finally {
          set({ browserLoading: false });
        }
      },

      conversations: [],
      activeId: null,

      activeTurns: () => {
        const { conversations, activeId } = get();
        return conversations.find((c) => c.id === activeId)?.turns ?? [];
      },

      historyForSend: () =>
        get()
          .activeTurns()
          .slice(-HISTORY_SEND_LIMIT)
          .map((t) => ({ role: t.role, content: t.content })),

      newConversation: () => {
        const id = genId();
        const now = Date.now();
        set((s) => ({
          // Drop other empty threads so "New conversation" doesn't pile up.
          conversations: [
            { id, title: 'New conversation', createdAt: now, updatedAt: now, turns: [] },
            ...s.conversations.filter((c) => c.turns.length > 0),
          ],
          activeId: id,
          responseText: '',
          cards: [],
          inspectedCard: null,
        }));
        return id;
      },

      selectConversation: (id) => {
        const conv = get().conversations.find((c) => c.id === id);
        if (!conv) return;
        const lastOracle = [...conv.turns].reverse().find((t) => t.role === 'oracle');
        set({
          activeId: id,
          responseText: lastOracle?.content ?? '',
          cards: lastOracle?.cards ?? [],
          inspectedCard: null,
        });
      },

      deleteConversation: (id) =>
        set((s) => {
          const conversations = s.conversations.filter((c) => c.id !== id);
          const wasActive = s.activeId === id;
          return {
            conversations,
            activeId: wasActive ? (conversations[0]?.id ?? null) : s.activeId,
            ...(wasActive ? { responseText: '', cards: [], inspectedCard: null } : {}),
          };
        }),

      renameConversation: (id, title) =>
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === id ? { ...c, title: title.trim() || c.title, updatedAt: Date.now() } : c
          ),
        })),

      appendTurn: (turn) => {
        const now = Date.now();
        let { activeId } = get();
        const full: ChatTurn = { ...turn, at: now };

        set((s) => {
          let conversations = s.conversations;
          if (!activeId || !conversations.some((c) => c.id === activeId)) {
            activeId = genId();
            conversations = [
              { id: activeId, title: 'New conversation', createdAt: now, updatedAt: now, turns: [] },
              ...conversations,
            ];
          }
          conversations = conversations.map((c) => {
            if (c.id !== activeId) return c;
            const isFirstUser = c.turns.length === 0 && turn.role === 'user';
            return {
              ...c,
              title: isFirstUser ? titleFrom(turn.content) : c.title,
              updatedAt: now,
              turns: [...c.turns, full],
            };
          });
          return { conversations, activeId };
        });
      },
    }),
    {
      name: 'nexus-conversations',
      partialize: (s) => ({ conversations: s.conversations, activeId: s.activeId }),
    }
  )
);

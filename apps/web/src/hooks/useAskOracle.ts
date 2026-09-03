import { useCallback } from 'react';
import { useOracleStore } from '../store/useOracleStore';

const API_URL = 'https://nexus-oracle-u6ra.onrender.com/api/oracle/ask';
const MEMORY_COLORS = ['#8b6cff', '#d6a84f', '#5b8cff', '#ff5b5b', '#5bff8b'];

interface AskResponse {
  text: string;
  cards: import('../store/useOracleStore').CardData[];
  action: 'none' | 'explain' | 'summon';
}

const randomPos = (): [number, number, number] => [
  (Math.random() - 0.5) * 3,
  (Math.random() - 0.5) * 2 + 1,
  (Math.random() - 0.5) * 3,
];

/**
 * The single Oracle turn — used by the command bar and the transcript chat
 * input alike. Appends the user turn, calls the server with prior history,
 * extracts `/memory` lines into the Mind Mapper, and stores the reply + cards.
 */
export function useAskOracle() {
  const store = useOracleStore;

  const ask = useCallback(async (raw: string) => {
    const message = raw.trim();
    const s = store.getState();
    if (!message || s.isThinking) return;

    // `/memory …` typed directly → store it, no server call.
    if (message.startsWith('/memory ')) {
      s.addMemory(message.slice(8).trim(), randomPos(), MEMORY_COLORS[Math.floor(Math.random() * 5)]);
      return;
    }

    s.setThinking(true);
    s.setInspectedCard(null);
    s.setResponseText('');

    const history = s.historyForSend();
    s.appendTurn({ role: 'user', content: message });

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, history }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as AskResponse;

      let text = data.text ?? '';
      
      const deckAddMatches = [...text.matchAll(/^\/deck add "(.*?)"(?: (\d+))?$/gm)];
      deckAddMatches.forEach((match) => {
        const name = match[1];
        const count = parseInt(match[2] || '1', 10);
        const summoned = Array.isArray(data.cards) ? data.cards : [];
        const card = summoned.find(c => c.name.toLowerCase() === name.toLowerCase());
        if (card) {
          store.getState().addCardToDeck(card, count);
        }
      });
      
      const deckRemoveMatches = [...text.matchAll(/^\/deck remove "(.*?)"(?: (\d+))?$/gm)];
      deckRemoveMatches.forEach((match) => {
        const name = match[1];
        const count = parseInt(match[2] || '1', 10);
        const deckList = store.getState().deckList;
        const deckCard = deckList.find(d => d.card.name.toLowerCase() === name.toLowerCase());
        if (deckCard) {
          store.getState().removeCardFromDeck(deckCard.card.id, count);
        }
      });
      
      text = text.replace(/^\/deck (add|remove) "(.*?)"(?: (\d+))?$/gm, '').trim();

      const memoryLines = text.match(/^\/memory (.*)$/gm);
      if (memoryLines) {
        for (const line of memoryLines) {
          store
            .getState()
            .addMemory(line.replace('/memory ', '').trim(), randomPos(), MEMORY_COLORS[Math.floor(Math.random() * 5)]);
        }
        text = text.replace(/^\/memory (.*)$/gm, '').trim();
      }

      const summoned = Array.isArray(data.cards) ? data.cards : [];
      store.getState().setResponseText(text);
      store.getState().appendTurn({ role: 'oracle', content: text, cards: summoned });
      store.getState().setCards(summoned);
    } catch (err) {
      console.error('Oracle query failed:', err);
      const line = 'I cannot reach the archive right now — the connection to the well has gone quiet.';
      store.getState().setResponseText(line);
      store.getState().appendTurn({ role: 'oracle', content: line });
      store.getState().setCards([]);
    } finally {
      store.getState().setThinking(false);
    }
  }, [store]);

  return ask;
}

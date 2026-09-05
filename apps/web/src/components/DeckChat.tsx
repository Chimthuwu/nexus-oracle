import { useEffect, useRef, useState } from 'react';
import { useOracleStore } from '../store/useOracleStore';
import type { CardData } from '../store/useOracleStore';

const API_URL = '/api/oracle/ask';

interface DeckChatTurn {
  role: 'user' | 'oracle';
  text: string;
}

interface AskResponse {
  text: string;
  cards?: CardData[];
}

function summarizeDeck(deckList: { card: CardData; count: number }[]): string {
  if (deckList.length === 0) return 'My deck is currently empty.';
  const total = deckList.reduce((acc, d) => acc + d.count, 0);
  const lines = deckList.map((d) => `${d.count}x ${d.card.name}`).join(', ');
  return `My current deck (${total} cards): ${lines}.`;
}

/**
 * A focused conversation about the deck in progress — separate from the main
 * Oracle thread so it doesn't clutter that transcript. Every message carries
 * a fresh snapshot of the deck list so the Oracle can actually reason about
 * what's in it; `/deck add` / `/deck remove` lines in its replies apply live,
 * same parsing convention as `useAskOracle`.
 */
export function DeckChat({ onClose }: { onClose: () => void }) {
  const deckList = useOracleStore((s) => s.deckList);
  const addCardToDeck = useOracleStore((s) => s.addCardToDeck);
  const removeCardFromDeck = useOracleStore((s) => s.removeCardFromDeck);

  const [turns, setTurns] = useState<DeckChatTurn[]>([]);
  const [draft, setDraft] = useState('');
  const [thinking, setThinking] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [turns, thinking]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const send = async (raw: string) => {
    const message = raw.trim();
    if (!message || thinking) return;
    setDraft('');
    setTurns((t) => [...t, { role: 'user', text: message }]);
    setThinking(true);

    try {
      const history = turns
        .slice(-10)
        .map((t) => ({ role: t.role, content: t.text }));
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `${summarizeDeck(deckList)}\n\n${message}`,
          history,
          mode: 'oracle',
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as AskResponse;
      const summoned = Array.isArray(data.cards) ? data.cards : [];
      let text = data.text ?? '';

      // Not anchored to the start of a line: the prompt asks the model for
      // "/deck add ..." on its own line, but free-tier models sometimes tack
      // it onto the end of a sentence instead — match the command wherever
      // it appears rather than silently dropping it.
      const changes: string[] = [];
      for (const m of text.matchAll(/\/deck add "(.*?)"(?: (\d+))?/g)) {
        const name = m[1];
        const count = Number.parseInt(m[2] || '1', 10);
        const card = summoned.find((c) => c.name.toLowerCase() === name.toLowerCase());
        if (card) {
          addCardToDeck(card, count);
          changes.push(`+${count} ${card.name}`);
        }
      }
      for (const m of text.matchAll(/\/deck remove "(.*?)"(?: (\d+))?/g)) {
        const name = m[1];
        const count = Number.parseInt(m[2] || '1', 10);
        const existing = deckList.find((d) => d.card.name.toLowerCase() === name.toLowerCase());
        if (existing) {
          removeCardFromDeck(existing.card.id, count);
          changes.push(`−${count} ${name}`);
        }
      }
      text = text.replace(/\/deck (add|remove) "(.*?)"(?: (\d+))?/g, '').trim();

      setTurns((t) => [
        ...t,
        {
          role: 'oracle',
          text: text || (changes.length ? 'Done.' : "I didn't change anything."),
        },
      ]);
    } catch {
      setTurns((t) => [
        ...t,
        { role: 'oracle', text: 'I cannot reach the archive right now — try again in a moment.' },
      ]);
    } finally {
      setThinking(false);
    }
  };

  const totalCards = deckList.reduce((acc, d) => acc + d.count, 0);

  return (
    <div className="transcript-scrim" onClick={onClose}>
      <div className="transcript glass" onClick={(e) => e.stopPropagation()}>
        <div className="transcript-head">
          <span className="transcript-title">Deck Chat</span>
          <div className="transcript-head-actions">
            <button className="transcript-close" onClick={onClose} title="Close (Esc)">
              ✕
            </button>
          </div>
        </div>

        <div className="deckchat-context">
          {totalCards} card{totalCards === 1 ? '' : 's'} in your deck. Ask for an analysis, a
          strategy, or specific swaps — the Oracle can add or remove cards as it explains.
        </div>

        <div className="transcript-body" ref={bodyRef}>
          {turns.length === 0 && (
            <div className="transcript-empty">
              Try "What's my deck missing?" or "Build me a mono-black control shell."
            </div>
          )}
          {turns.map((t, i) => (
            <div key={i} className={`transcript-turn ${t.role}`}>
              <div className="transcript-role">{t.role === 'user' ? 'You' : 'The Oracle'}</div>
              <div className="transcript-text">{t.text}</div>
            </div>
          ))}
          {thinking && (
            <div className="transcript-turn oracle">
              <div className="transcript-role">The Oracle</div>
              <div className="transcript-text dim">considering the deck…</div>
            </div>
          )}
        </div>

        <form
          className="transcript-input"
          onSubmit={(e) => {
            e.preventDefault();
            void send(draft);
          }}
        >
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                void send(draft);
              }
            }}
            placeholder="Ask about your deck…"
            rows={1}
            disabled={thinking}
            autoFocus
          />
          <button type="submit" disabled={thinking || !draft.trim()} aria-label="Send">
            ➤
          </button>
        </form>
      </div>
    </div>
  );
}

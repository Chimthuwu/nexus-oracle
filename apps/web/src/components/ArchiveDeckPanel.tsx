import { useState } from 'react';
import { useOracleStore } from '../store/useOracleStore';
import type { CardData } from '../store/useOracleStore';
import { DECK_PRESETS } from '../data/deckPresets';
import { DeckChat } from './DeckChat';

const CARDS_API = '/api/cards/search';

async function findCardByName(name: string): Promise<CardData | null> {
  try {
    const params = new URLSearchParams({ q: name, limit: '1' });
    const res = await fetch(`${CARDS_API}?${params.toString()}`);
    const data = (await res.json()) as { cards?: CardData[] };
    const card = data.cards?.[0];
    // The search is relevance-ranked, not exact-match — if this name isn't in
    // the archive it still returns its best guess. Only accept a real hit;
    // anything else would silently swap in an unrelated card.
    return card && card.name.toLowerCase() === name.toLowerCase() ? card : null;
  } catch {
    return null;
  }
}

/**
 * Deck building, folded into the Archive itself: a toggle-out panel with a
 * couple of common-build presets, an "ask the Oracle" shortcut into the same
 * `/deck add` pipeline the chat already understands, and the running list
 * with per-card removal. Replaces the old standalone Deck Builder view —
 * building a deck now happens right where you're already looking at cards.
 */
export function ArchiveDeckPanel() {
  const view = useOracleStore((s) => s.view);
  const deckList = useOracleStore((s) => s.deckList);
  const addCardToDeck = useOracleStore((s) => s.addCardToDeck);
  const removeCardFromDeck = useOracleStore((s) => s.removeCardFromDeck);
  const clearDeck = useOracleStore((s) => s.clearDeck);

  const [open, setOpen] = useState(false);
  const [loadingPreset, setLoadingPreset] = useState<string | null>(null);
  const [status, setStatus] = useState('');
  const [chatOpen, setChatOpen] = useState(false);

  if (view !== 'browser') return null;

  const totalCards = deckList.reduce((acc, item) => acc + item.count, 0);

  const loadPreset = async (name: string, cardNames: string[]) => {
    setLoadingPreset(name);
    setStatus('');
    clearDeck();
    const found = await Promise.all(cardNames.map(findCardByName));
    let added = 0;
    for (const card of found) {
      if (card) {
        addCardToDeck(card, 1);
        added++;
      }
    }
    setStatus(
      added === cardNames.length
        ? `Loaded ${name} — ${added} cards.`
        : `Loaded ${name} — ${added}/${cardNames.length} cards (rest not in the archive).`
    );
    setLoadingPreset(null);
  };

  return (
    <>
      <button
        className={`archive-deck-toggle ${open ? 'on' : ''}`}
        onClick={() => setOpen((o) => !o)}
        title="Build a deck"
      >
        🃏 Deck{totalCards > 0 ? ` · ${totalCards}` : ''}
      </button>

      {open && (
        <div className="archive-deck-panel glass">
          <div className="archive-deck-head">
            <span>YOUR DECK</span>
            <span className="deck-stats">{totalCards} / 100 Cards</span>
          </div>

          <div className="archive-deck-presets">
            {DECK_PRESETS.map((p) => (
              <button
                key={p.name}
                className="archive-deck-preset"
                disabled={loadingPreset != null}
                onClick={() => void loadPreset(p.name, p.cards)}
                title={p.blurb}
              >
                {loadingPreset === p.name ? 'Loading…' : p.name}
              </button>
            ))}
          </div>

          <button className="archive-deck-ai" onClick={() => setChatOpen(true)}>
            ✦ Chat with the Oracle about this deck
          </button>

          {status && <div className="archive-deck-status">{status}</div>}

          <div className="deck-list">
            {deckList.length === 0 && (
              <div className="deck-empty">Pick a preset, ask the Oracle, or add cards from the archive.</div>
            )}
            {deckList.map((item) => (
              <div key={item.card.id} className="deck-list-item">
                <span className="deck-count">{item.count}</span>
                <span className="deck-name">{item.card.name}</span>
                <button
                  className="deck-remove"
                  title="Remove"
                  onClick={() => removeCardFromDeck(item.card.id, item.count)}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {deckList.length > 0 && (
            <button className="archive-deck-clear" onClick={() => clearDeck()}>
              Clear deck
            </button>
          )}
        </div>
      )}

      {chatOpen && <DeckChat onClose={() => setChatOpen(false)} />}
    </>
  );
}

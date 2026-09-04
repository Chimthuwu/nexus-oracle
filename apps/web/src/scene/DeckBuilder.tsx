import { Html } from '@react-three/drei';
import { useOracleStore } from '../store/useOracleStore';

export function DeckBuilder() {
  const deckList = useOracleStore(s => s.deckList);
  const totalCards = deckList.reduce((acc, item) => acc + item.count, 0);

  return (
    <Html fullscreen zIndexRange={[10, 0]} style={{ pointerEvents: 'none' }}>
      <div className="deck-builder-layout">
        <div className="deck-sidebar glass">
          <div className="deck-sidebar-header">
            <h2>Current Deck</h2>
            <div className="deck-stats">{totalCards} / 100 Cards</div>
          </div>
          <div className="deck-list">
            {deckList.length === 0 && (
              <div className="deck-empty">Ask the Oracle to add cards to your deck.</div>
            )}
            {deckList.map(item => (
              <div key={item.card.id} className="deck-list-item">
                <span className="deck-count">{item.count}</span>
                <span className="deck-name">{item.card.name}</span>
                <span className="deck-mana">{item.card.manaCost}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="deck-main-area">
          <div className="deck-masonry">
            {deckList.map(item => (
              <div key={item.card.id} className="deck-card">
                <img src={item.card.imageUrl || item.card.artCropUrl} alt={item.card.name} />
                {item.count > 1 && <div className="card-badge">{item.count}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Html>
  );
}

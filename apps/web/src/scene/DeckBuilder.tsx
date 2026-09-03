import { Html } from '@react-three/drei';
import { useOracleStore } from '../store/useOracleStore';

export function DeckBuilder() {
  const deckList = useOracleStore(s => s.deckList);
  return (
    <Html center zIndexRange={[100, 0]} style={{ width: '100vw', height: '100vh', pointerEvents: 'none', position: 'relative' }}>
      <div style={{ position: 'absolute', top: '100px', left: '100px', pointerEvents: 'auto', background: 'rgba(10,10,20,0.8)', border: '1px solid #d6a84f', padding: '20px', borderRadius: '12px', color: 'white', width: '300px' }}>
        <h3>Deck Builder</h3>
        {deckList.length === 0 ? <p>Your deck is empty.</p> : (
          <ul>
            {deckList.map(d => (
              <li key={d.card.id}>{d.count}x {d.card.name}</li>
            ))}
          </ul>
        )}
      </div>
    </Html>
  );
}

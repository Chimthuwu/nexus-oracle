import { useOracleStore } from '../store/useOracleStore';
import { useDuelStore } from '../store/useDuelStore';

/**
 * Your hand — a compact DOM strip of card thumbnails along the bottom. Click one
 * to select it; the DuelHUD panel then shows its details + a PLAY CARD button.
 * Keeps the 3D battlefield uncrowded.
 */
export function DuelHand() {
  const view = useOracleStore((s) => s.view);
  const cards = useDuelStore((s) => s.cards);
  const inspectedUid = useDuelStore((s) => s.inspectedUid);
  const setInspected = useDuelStore((s) => s.setInspected);
  const current = useDuelStore((s) => s.current);
  const winner = useDuelStore((s) => s.winner);

  if (view !== 'duel') return null;

  const hand = cards.filter((c) => c.owner === 'you' && c.zone === 'hand');
  if (hand.length === 0) return null;

  const yourTurn = current === 'you' && !winner;

  return (
    <div className={`duel-hand ${yourTurn ? '' : 'waiting'}`}>
      {hand.map((dc) => (
        <button
          key={dc.uid}
          className={`duel-hand-card ${inspectedUid === dc.uid ? 'selected' : ''}`}
          onClick={() => setInspected(inspectedUid === dc.uid ? null : dc.uid)}
          title={dc.card.name}
        >
          <img src={dc.card.imageUrl} alt={dc.card.name} loading="lazy" />
        </button>
      ))}
    </div>
  );
}

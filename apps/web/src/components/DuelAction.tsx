import { useOracleStore } from '../store/useOracleStore';
import { useDuelStore } from '../store/useDuelStore';

/**
 * The floating action for the card you've picked up in the duel — sits just
 * below the focused 3D card. PLAY / ATTACK, or a hint about why you can't.
 */
export function DuelAction() {
  const view = useOracleStore((s) => s.view);
  const cards = useDuelStore((s) => s.cards);
  const phase = useDuelStore((s) => s.phase);
  const current = useDuelStore((s) => s.current);
  const winner = useDuelStore((s) => s.winner);
  const inspectedUid = useDuelStore((s) => s.inspectedUid);
  const playCard = useDuelStore((s) => s.playCard);
  const attack = useDuelStore((s) => s.attack);
  const setInspected = useDuelStore((s) => s.setInspected);
  const pendingMulligan = useDuelStore((s) => s.pendingMulligan);

  if (view !== 'duel' || !inspectedUid) return null;
  const dc = cards.find((c) => c.uid === inspectedUid);
  if (!dc) return null;

  const yourTurn = current === 'you' && !winner && !pendingMulligan;
  const isLand = /land/i.test(dc.card.typeLine);
  const canPlay = yourTurn && (phase === 'main1' || phase === 'main2');
  const canAttack = yourTurn && phase === 'combat';
  const manaCost = dc.card.manaValue ?? 0;
  const manaAvailable = cards.filter(
    (c) => c.owner === 'you' && c.zone === 'lands' && !c.tapped
  ).length;
  const canAfford = isLand || manaAvailable >= manaCost;

  let label: string;
  let run: (() => void) | null = null;
  let hint = '';

  if (dc.zone === 'hand') {
    label = isLand ? 'PLAY LAND' : 'PLAY CARD';
    if (canPlay && canAfford) run = () => playCard(dc.uid);
    else if (canPlay && !canAfford) hint = `need ${manaCost} mana, have ${manaAvailable}`;
    else if (pendingMulligan) hint = 'keep or mulligan your hand first';
    else hint = 'wait for your main phase';
  } else if (dc.zone === 'creatures' && dc.owner === 'you') {
    label = 'SEND TO ATTACK';
    if (canAttack && !dc.tapped && !dc.sick) run = () => attack(dc.uid);
    else if (dc.sick) hint = 'summoning sick this turn';
    else if (dc.tapped) hint = 'already attacked';
    else hint = 'declare attackers in combat';
  } else {
    label = '';
    hint = dc.owner === 'oracle' ? "the Oracle's card" : dc.zone;
  }

  return (
    <div className="duel-action">
      <div className="duel-action-name">{dc.card.name}</div>
      {run ? (
        <button className="duel-action-btn" onClick={run}>
          {label} ▸
        </button>
      ) : (
        <div className="duel-action-hint">{hint}</div>
      )}
      <button className="duel-action-close" onClick={() => setInspected(null)}>
        set down
      </button>
    </div>
  );
}

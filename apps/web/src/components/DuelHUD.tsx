import { useEffect } from 'react';
import { useOracleStore } from '../store/useOracleStore';
import { useDuelStore, type DuelPhase } from '../store/useDuelStore';

const PHASE_LABEL: Record<DuelPhase, string> = {
  main1: 'First Main',
  combat: 'Combat',
  main2: 'Second Main',
  end: 'End Step',
};

export function DuelHUD() {
  const view = useOracleStore((s) => s.view);

  const active = useDuelStore((s) => s.active);
  const loading = useDuelStore((s) => s.loading);
  const life = useDuelStore((s) => s.life);
  const turn = useDuelStore((s) => s.turn);
  const phase = useDuelStore((s) => s.phase);
  const current = useDuelStore((s) => s.current);
  const winner = useDuelStore((s) => s.winner);
  const log = useDuelStore((s) => s.log);
  const cards = useDuelStore((s) => s.cards);
  const inspectedUid = useDuelStore((s) => s.inspectedUid);
  const startDuel = useDuelStore((s) => s.startDuel);
  const nextPhase = useDuelStore((s) => s.nextPhase);
  const playCard = useDuelStore((s) => s.playCard);
  const attack = useDuelStore((s) => s.attack);
  const setInspected = useDuelStore((s) => s.setInspected);

  useEffect(() => {
    if (view === 'duel' && !active && !loading) void startDuel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  if (view !== 'duel') return null;

  const yourTurn = current === 'you' && !winner;
  const inspected = cards.find((c) => c.uid === inspectedUid) ?? null;
  const youCreatures = cards.filter((c) => c.owner === 'you' && c.zone === 'creatures').length;
  const oracleCreatures = cards.filter((c) => c.owner === 'oracle' && c.zone === 'creatures').length;
  const isLand = inspected ? /land/i.test(inspected.card.typeLine) : false;

  const canPlay = yourTurn && (phase === 'main1' || phase === 'main2');
  const canAttack = yourTurn && phase === 'combat';

  let action: { label: string; run: () => void } | null = null;
  if (inspected) {
    if (inspected.zone === 'hand' && canPlay) {
      action = { label: isLand ? 'PLAY LAND' : 'PLAY CARD', run: () => playCard(inspected.uid) };
    } else if (
      inspected.zone === 'creatures' &&
      inspected.owner === 'you' &&
      canAttack &&
      !inspected.tapped &&
      !inspected.sick
    ) {
      action = { label: 'SEND TO ATTACK', run: () => attack(inspected.uid) };
    }
  }

  return (
    <>
      <div className="duel-life duel-life-oracle">
        <span className="duel-life-name">ORACLE</span>
        <span className="duel-life-num">{life.oracle}</span>
      </div>
      <div className="duel-life duel-life-you">
        <span className="duel-life-name">YOU</span>
        <span className="duel-life-num">{life.you}</span>
      </div>

      <div className="duel-strip glass">
        <span className="duel-turn">Turn {turn}</span>
        <span className="duel-phase">{winner ? '—' : PHASE_LABEL[phase]}</span>
        <span className={`duel-who ${yourTurn ? 'you' : ''}`}>
          {winner
            ? winner === 'you'
              ? 'Victory'
              : 'Defeat'
            : yourTurn
              ? 'Your move'
              : 'Oracle thinking…'}
        </span>
      </div>

      {/* Right-side game summary */}
      <div className="duel-panel glass">
        <div className="duel-panel-head">THE DUEL</div>
        <div className="duel-panel-row">
          <span>Your board</span>
          <b>{youCreatures} creature{youCreatures === 1 ? '' : 's'}</b>
        </div>
        <div className="duel-panel-row">
          <span>Oracle board</span>
          <b>{oracleCreatures} creature{oracleCreatures === 1 ? '' : 's'}</b>
        </div>
        <div className="duel-panel-log">
          {(loading ? ['Dealing the opening hands…'] : log).slice(0, 12).map((line, i) => (
            <div key={i} className={i === 0 ? 'latest' : ''}>
              {line}
            </div>
          ))}
        </div>
        <div className="duel-panel-actions">
          {winner ? (
            <button className="duel-btn primary" onClick={() => void startDuel()}>
              New duel
            </button>
          ) : (
            <>
              <button className="duel-btn primary" disabled={!yourTurn} onClick={() => nextPhase()}>
                {phase === 'end' ? 'End turn ▸' : 'Next phase ▸'}
              </button>
              <button className="duel-btn ghost" onClick={() => void startDuel()}>
                Restart
              </button>
            </>
          )}
        </div>
      </div>

      {/* Card inspector */}
      {inspected && (
        <div className="duel-inspect glass">
          <button className="duel-inspect-close" onClick={() => setInspected(null)}>
            ✕
          </button>
          <div className="duel-inspect-eyebrow">
            {inspected.owner === 'you' ? 'YOUR CARD' : 'ORACLE CARD'} ·{' '}
            {inspected.zone === 'hand' ? 'IN HAND' : inspected.zone.toUpperCase()}
          </div>
          <div className="duel-inspect-name">{inspected.card.name}</div>
          <div className="duel-inspect-type">{inspected.card.typeLine}</div>
          <div className="duel-inspect-stats">
            {inspected.card.manaCost && <span>{inspected.card.manaCost}</span>}
            {inspected.card.power != null && inspected.card.toughness != null && (
              <span>
                {inspected.card.power}/{inspected.card.toughness}
              </span>
            )}
            {inspected.sick && inspected.zone === 'creatures' && <span className="warn">summoning sick</span>}
            {inspected.tapped && <span className="warn">tapped</span>}
          </div>
          <div className="duel-inspect-oracle">{inspected.card.oracleText || '—'}</div>
          {action ? (
            <button
              className="duel-btn primary big"
              onClick={() => {
                action!.run();
              }}
            >
              {action.label}
            </button>
          ) : (
            <button className="duel-btn ghost big" onClick={() => setInspected(null)}>
              Close
            </button>
          )}
        </div>
      )}
    </>
  );
}

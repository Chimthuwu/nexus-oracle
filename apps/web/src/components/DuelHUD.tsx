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
  const setInspected = useDuelStore((s) => s.setInspected);
  const startDuel = useDuelStore((s) => s.startDuel);
  const nextPhase = useDuelStore((s) => s.nextPhase);
  const pendingMulligan = useDuelStore((s) => s.pendingMulligan);
  const mulligansTaken = useDuelStore((s) => s.mulligansTaken);
  const mulligan = useDuelStore((s) => s.mulligan);
  const keepHand = useDuelStore((s) => s.keepHand);

  useEffect(() => {
    if (view === 'duel' && !active && !loading) void startDuel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  if (view !== 'duel') return null;

  const yourTurn = current === 'you' && !winner;
  const youCreatures = cards.filter((c) => c.owner === 'you' && c.zone === 'creatures').length;
  const oracleCreatures = cards.filter((c) => c.owner === 'oracle' && c.zone === 'creatures').length;
  const yourLands = cards.filter((c) => c.owner === 'you' && c.zone === 'lands');
  const yourManaOpen = yourLands.filter((c) => !c.tapped).length;
  const yourHandSize = cards.filter((c) => c.owner === 'you' && c.zone === 'hand').length;
  const nextMulliganSize = Math.max(0, 5 - (mulligansTaken + 1));

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

      <div className="duel-panel glass">
        <div className="duel-panel-head">THE DUEL</div>

        {pendingMulligan ? (
          <div className="duel-mulligan">
            <div className="duel-mulligan-head">
              Your opening hand — {yourHandSize} card{yourHandSize === 1 ? '' : 's'}
            </div>
            <div className="duel-panel-actions">
              <button className="duel-btn primary" onClick={() => keepHand()}>
                Keep ▸
              </button>
              <button className="duel-btn ghost" onClick={() => mulligan()}>
                Mulligan to {nextMulliganSize} ▸
              </button>
            </div>
          </div>
        ) : (
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
        )}

        <div className="duel-panel-row">
          <span>Your mana</span>
          <b>
            {yourManaOpen} / {yourLands.length} open
          </b>
        </div>
        <div className="duel-panel-row">
          <span>Your board</span>
          <b>
            {youCreatures} creature{youCreatures === 1 ? '' : 's'}
          </b>
        </div>
        <div className="duel-panel-row">
          <span>Oracle board</span>
          <b>
            {oracleCreatures} creature{oracleCreatures === 1 ? '' : 's'}
          </b>
        </div>

        <div className="duel-panel-log">
          {(loading ? [[{ text: 'Dealing the opening hands…' }]] : log).slice(0, 14).map((line, i) => (
            <div key={i} className={i === 0 ? 'latest' : ''}>
              {line.map((part, j) =>
                part.uid && cards.some((c) => c.uid === part.uid) ? (
                  <span
                    key={j}
                    className={`duel-log-card ${inspectedUid === part.uid ? 'active' : ''}`}
                    onClick={() => setInspected(inspectedUid === part.uid ? null : part.uid!)}
                    title="Inspect this card"
                  >
                    {part.text}
                  </span>
                ) : (
                  <span key={j}>{part.text}</span>
                )
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

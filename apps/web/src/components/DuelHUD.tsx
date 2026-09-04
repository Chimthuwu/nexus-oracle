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
  const startDuel = useDuelStore((s) => s.startDuel);
  const nextPhase = useDuelStore((s) => s.nextPhase);

  useEffect(() => {
    if (view === 'duel' && !active && !loading) void startDuel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  if (view !== 'duel') return null;

  const yourTurn = current === 'you' && !winner;
  const youCreatures = cards.filter((c) => c.owner === 'you' && c.zone === 'creatures').length;
  const oracleCreatures = cards.filter((c) => c.owner === 'oracle' && c.zone === 'creatures').length;

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
          {(loading ? ['Dealing the opening hands…'] : log).slice(0, 14).map((line, i) => (
            <div key={i} className={i === 0 ? 'latest' : ''}>
              {line}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

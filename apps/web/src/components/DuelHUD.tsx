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
  const startDuel = useDuelStore((s) => s.startDuel);
  const nextPhase = useDuelStore((s) => s.nextPhase);

  useEffect(() => {
    if (view === 'duel' && !active && !loading) void startDuel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  if (view !== 'duel') return null;

  const yourTurn = current === 'you' && !winner;

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

      {/* slim status strip, top-centre */}
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

      {/* action cluster, bottom-right */}
      <div className="duel-actions">
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

      <div className="duel-log">
        {loading ? 'dealing the opening hands…' : (log[0] ?? '')}
      </div>
    </>
  );
}

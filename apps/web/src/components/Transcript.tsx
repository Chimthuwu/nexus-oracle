import { useEffect, useRef } from 'react';
import { useOracleStore } from '../store/useOracleStore';

/**
 * The "deeper chat" view — the full active conversation as a scrollable
 * transcript, opened from the response caption or the command bar. The
 * floating caption stays the default; this is for reading back a long thread.
 */
export function Transcript() {
  const view = useOracleStore((s) => s.view);
  const open = useOracleStore((s) => s.showTranscript);
  const setOpen = useOracleStore((s) => s.setShowTranscript);
  const conversations = useOracleStore((s) => s.conversations);
  const activeId = useOracleStore((s) => s.activeId);
  const isThinking = useOracleStore((s) => s.isThinking);

  const conv = conversations.find((c) => c.id === activeId) ?? null;
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ block: 'end' });
  }, [open, conv?.turns.length, isThinking]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, setOpen]);

  if (view !== 'oracle' || !open) return null;

  return (
    <div className="transcript-scrim" onClick={() => setOpen(false)}>
      <div className="transcript glass" onClick={(e) => e.stopPropagation()}>
        <div className="transcript-head">
          <span className="transcript-title">{conv?.title ?? 'Conversation'}</span>
          <button className="transcript-close" onClick={() => setOpen(false)} title="Close (Esc)">
            ✕
          </button>
        </div>
        <div className="transcript-body">
          {!conv || conv.turns.length === 0 ? (
            <div className="transcript-empty">Nothing said yet. Ask the Oracle something.</div>
          ) : (
            conv.turns.map((t, i) => (
              <div key={i} className={`transcript-turn ${t.role}`}>
                <div className="transcript-role">{t.role === 'user' ? 'You' : 'The Oracle'}</div>
                <div className="transcript-text">{t.content}</div>
                {t.cards && t.cards.length > 0 && (
                  <div className="transcript-cards">
                    {t.cards.map((c) => (
                      <span key={c.id}>{c.name}</span>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
          {isThinking && (
            <div className="transcript-turn oracle">
              <div className="transcript-role">The Oracle</div>
              <div className="transcript-text dim">consulting the archive…</div>
            </div>
          )}
          <div ref={endRef} />
        </div>
      </div>
    </div>
  );
}

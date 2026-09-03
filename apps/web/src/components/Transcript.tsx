import { useEffect, useRef, useState } from 'react';
import { useOracleStore } from '../store/useOracleStore';
import { useAskOracle } from '../hooks/useAskOracle';

/**
 * The deep-conversation view — the full active thread as a scrollable chat with
 * its own input, so you can keep talking without leaving it. The floating
 * caption stays the ambient default; this is the "sit down and go deep" surface.
 */
export function Transcript() {
  const view = useOracleStore((s) => s.view);
  const open = useOracleStore((s) => s.showTranscript);
  const setOpen = useOracleStore((s) => s.setShowTranscript);
  const conversations = useOracleStore((s) => s.conversations);
  const activeId = useOracleStore((s) => s.activeId);
  const isThinking = useOracleStore((s) => s.isThinking);
  const newConversation = useOracleStore((s) => s.newConversation);

  const ask = useAskOracle();
  const [draft, setDraft] = useState('');
  const conv = conversations.find((c) => c.id === activeId) ?? null;
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [open, conv?.turns.length, isThinking]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, setOpen]);

  if (!open || (view !== 'oracle' && view !== 'mindmapper')) return null;

  const send = () => {
    const text = draft.trim();
    if (!text || isThinking) return;
    setDraft('');
    void ask(text);
  };

  return (
    <div className="transcript-scrim" onClick={() => setOpen(false)}>
      <div className="transcript glass-strong" onClick={(e) => e.stopPropagation()}>
        <div className="transcript-head">
          <span className="transcript-title">{conv?.title ?? 'Conversation'}</span>
          <div className="transcript-head-actions">
            <button
              className="transcript-new"
              onClick={() => {
                newConversation();
                setDraft('');
              }}
              title="Start a new conversation"
            >
              ＋ New
            </button>
            <button className="transcript-close" onClick={() => setOpen(false)} title="Close (Esc)">
              ✕
            </button>
          </div>
        </div>

        <div className="transcript-body" ref={bodyRef}>
          {!conv || conv.turns.length === 0 ? (
            <div className="transcript-empty">Nothing said yet — start below.</div>
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
        </div>

        <form
          className="transcript-input"
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
        >
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="Keep the conversation going…"
            rows={1}
            autoFocus
          />
          <button type="submit" disabled={isThinking || !draft.trim()} aria-label="Send">
            ➤
          </button>
        </form>
      </div>
    </div>
  );
}

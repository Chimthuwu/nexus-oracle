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
  const memories = useOracleStore((s) => s.memories);
  const focusedMemoryId = useOracleStore((s) => s.focusedMemoryId);
  const setFocusedMemoryId = useOracleStore((s) => s.setFocusedMemoryId);

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
      <div className="transcript glass" onClick={(e) => e.stopPropagation()}>
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
          {view === 'mindmapper' ? (
            memories.length === 0 ? (
              <div className="transcript-empty">The map is empty.</div>
            ) : (
              memories.map((m) => {
                const isFocused = focusedMemoryId === m.id;
                return (
                  <div 
                    key={m.id} 
                    className="transcript-turn oracle" 
                    style={{ cursor: 'pointer', borderLeft: isFocused ? `4px solid ${m.color}` : '4px solid transparent' }}
                    onClick={() => setFocusedMemoryId(m.id)}
                  >
                    <div className="transcript-role" style={{ color: m.color }}>Memory</div>
                    <div className="transcript-text">{m.text}</div>
                  </div>
                );
              })
            )
          ) : (
            !conv || conv.turns.length === 0 ? (
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
            )
          )}
          {isThinking && (
            <div className="transcript-turn oracle">
              <div className="transcript-role">MindMapper</div>
              <div className="transcript-text dim">mapping...</div>
            </div>
          )}
        </div>

        {view === 'mindmapper' ? null : (
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
        )}
      </div>
    </div>
  );
}

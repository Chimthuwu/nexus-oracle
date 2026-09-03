import { useState } from 'react';
import { useOracleStore } from '../store/useOracleStore';

function relTime(ts: number): string {
  const s = Math.max(1, Math.round((Date.now() - ts) / 1000));
  if (s < 60) return 'just now';
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  return d < 7 ? `${d}d ago` : new Date(ts).toLocaleDateString();
}

export function Spine() {
  const conversations = useOracleStore((s) => s.conversations);
  const activeId = useOracleStore((s) => s.activeId);
  const isThinking = useOracleStore((s) => s.isThinking);
  const inspectedCard = useOracleStore((s) => s.inspectedCard);
  const view = useOracleStore((s) => s.view);
  const setView = useOracleStore((s) => s.setView);
  const newConversation = useOracleStore((s) => s.newConversation);
  const selectConversation = useOracleStore((s) => s.selectConversation);
  const deleteConversation = useOracleStore((s) => s.deleteConversation);
  const renameConversation = useOracleStore((s) => s.renameConversation);

  const [pinned, setPinned] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState('');

  // Auto-hide the whole rail during card inspection, or while the Oracle
  // responds — unless the user has pinned it open.
  const forceHidden = !pinned && (inspectedCard != null || isThinking);
  const open = pinned || hovered;

  const beginRename = (id: string, current: string) => {
    setEditing(id);
    setDraft(current);
  };
  const commitRename = () => {
    if (editing) renameConversation(editing, draft);
    setEditing(null);
  };

  return (
    <div
      className={`spine ${open ? 'open' : ''} ${forceHidden ? 'gone' : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Rest state — thin line + sigil dots */}
      <div className="spine-rail" aria-hidden={open}>
        <span className="spine-line" />
        <span className="spine-dot" style={{ background: '#8b6cff' }} />
        <span className="spine-dot" style={{ background: '#5b8cff' }} />
        <span className="spine-dot" style={{ background: '#d6a84f' }} />
      </div>

      {/* Expanded — conversation history */}
      <div className="spine-panel glass" role="navigation" aria-label="Conversations">
        <div className="spine-head">
          <span className="spine-glyph">✦</span>
          <span className="spine-word">NEXUS</span>
          <button
            className={`spine-pin ${pinned ? 'on' : ''}`}
            title={pinned ? 'Unpin' : 'Keep open'}
            onClick={() => setPinned((p) => !p)}
          >
            {pinned ? '📌' : '📍'}
          </button>
        </div>

        <div className="spine-modes">
          <button
            className={view === 'oracle' ? 'on' : ''}
            onClick={() => setView('oracle')}
          >
            ✦ Oracle
          </button>
          <button
            className={view === 'browser' ? 'on' : ''}
            onClick={() => setView('browser')}
          >
            ⌘ Archive
          </button>
          <button
            className={view === 'duel' ? 'on' : ''}
            onClick={() => setView('duel')}
          >
            ⚔ Duel
          </button>
          <button
            className={view === 'mindmapper' ? 'on' : ''}
            onClick={() => setView('mindmapper')}
          >
            🧠 Mind Mapper
          </button>
        </div>

        <button className="spine-new" onClick={() => newConversation()}>
          <span>＋</span> New conversation
        </button>

        <div className="spine-list">
          {conversations.length === 0 && (
            <div className="spine-empty">Your conversations with the Oracle will gather here.</div>
          )}
          {conversations.map((c) => (
            <div
              key={c.id}
              className={`spine-item ${c.id === activeId ? 'active' : ''}`}
              onClick={() => editing !== c.id && selectConversation(c.id)}
            >
              {editing === c.id ? (
                <input
                  className="spine-rename"
                  autoFocus
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onBlur={commitRename}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commitRename();
                    if (e.key === 'Escape') setEditing(null);
                  }}
                />
              ) : (
                <>
                  <div className="spine-item-body">
                    <div className="spine-item-title">{c.title}</div>
                    <div className="spine-item-meta">{relTime(c.updatedAt)}</div>
                  </div>
                  <div className="spine-item-actions">
                    <button
                      title="Rename"
                      onClick={(e) => {
                        e.stopPropagation();
                        beginRename(c.id, c.title);
                      }}
                    >
                      ✎
                    </button>
                    <button
                      title="Delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteConversation(c.id);
                      }}
                    >
                      ✕
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

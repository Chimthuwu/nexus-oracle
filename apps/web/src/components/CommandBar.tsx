import React, { useState } from 'react';
import { useOracleStore } from '../store/useOracleStore';

export function CommandBar() {
  const [query, setQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const setResponseText = useOracleStore(state => state.setResponseText);
  const setThinking = useOracleStore(state => state.setThinking);
  const setCards = useOracleStore(state => state.setCards);
  const setInspectedCard = useOracleStore(state => state.setInspectedCard);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setThinking(true);
    setInspectedCard(null);
    
    try {
      const response = await fetch("https://nexus-oracle-u6ra.onrender.com/api/oracle/ask", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: query })
      });
      
      const data = await response.json();
      
      setResponseText(data.message);
      
      if (data.cards && data.cards.length > 0) {
        setCards(data.cards.map((c: any) => ({
          id: c.id,
          name: c.name,
          type: c.type_line,
          oracleText: c.oracle_text,
          manaCost: c.mana_cost,
          imageUrl: c.image_uris?.normal || c.image_uris?.large
        })));
      } else {
        setCards([]);
      }
    } catch (error) {
      console.error('Failed to query oracle:', error);
      setResponseText("I cannot reach the archive right now — the connection to the well has gone quiet.");
    } finally {
      setIsSubmitting(false);
      setThinking(false);
      setQuery('');
    }
  };

  const setPreset = (q: string) => {
    setQuery(q);
  };

  return (
    <div className="command-dock">
      <div className="hint" id="hint">Ask the Oracle anything, or try a suggestion below</div>
      <div className="suggestions" id="suggestions">
        <div className="chip" onClick={() => setPreset("Show me red aggro cards")}>Show me red aggro cards</div>
        <div className="chip" onClick={() => setPreset("What deals with fliers?")}>What deals with fliers?</div>
        <div className="chip" onClick={() => setPreset("Teach me the stack")}>Teach me the stack</div>
        <div className="chip" onClick={() => setPreset("Ramp into big green threats")}>Ramp into big green threats</div>
      </div>
      <div className="command-bar glass">
        <form onSubmit={handleSubmit} style={{ display: 'flex', width: '100%', alignItems: 'center' }}>
          <input 
            id="commandInput" 
            type="text" 
            placeholder="Ask the Oracle anything..." 
            autoComplete="off"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isSubmitting}
            style={{ flex: 1 }}
          />
          <button 
            type="submit"
            className="command-send" 
            id="commandSend" 
            aria-label="Ask"
            disabled={isSubmitting || !query.trim()}
          >
            {isSubmitting ? '...' : '➤'}
          </button>
        </form>
      </div>
    </div>
  );
}

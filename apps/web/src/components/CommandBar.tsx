import React, { useState } from 'react';
import { useOracleStore } from '../store/useOracleStore';

export function CommandBar() {
  const [query, setQuery] = useState('');
  const setThinking = useOracleStore(state => state.setThinking);
  const setResponseText = useOracleStore(state => state.setResponseText);
  const setCards = useOracleStore(state => state.setCards);
  const setInspectedCard = useOracleStore(state => state.setInspectedCard);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    const userQuery = query;
    setQuery('');
    setThinking(true);
    setResponseText('');
    setCards([]);
    setInspectedCard(null);
    
    try {
      const response = await fetch('http://localhost:8787/api/oracle/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: userQuery })
      });
      
      const data = await response.json();
      
      setThinking(false);
      setResponseText(data.text);
      if (data.cards && data.cards.length > 0) {
        setCards(data.cards);
      }
      
      // Auto clear text after a while for testing
      setTimeout(() => setResponseText(''), 8000);
      
    } catch (error) {
      console.error(error);
      setThinking(false);
      setResponseText("I can't reach the archive right now — the connection to the well has gone quiet.");
      setTimeout(() => setResponseText(''), 8000);
    }
  };

  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-50">
      <form 
        onSubmit={handleSubmit}
        className="backdrop-blur-xl bg-black/40 border border-white/10 p-2 rounded-2xl flex items-center gap-4 shadow-2xl shadow-purple-900/20"
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask the Oracle anything..."
          className="flex-1 bg-transparent border-none outline-none text-white px-4 py-2 placeholder:text-gray-500"
        />
        <button 
          type="submit"
          className="bg-gradient-to-r from-amber-500 to-amber-600 text-black px-6 py-2 rounded-xl font-semibold hover:scale-105 transition-transform"
        >
          ➤
        </button>
      </form>
    </div>
  );
}

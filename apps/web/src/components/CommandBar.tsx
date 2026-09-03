import React, { useState } from 'react';
import { useOracleStore } from '../store/useOracleStore';

export function CommandBar() {
  const [query, setQuery] = useState('');
  const setThinking = useOracleStore(state => state.setThinking);
  const setResponseText = useOracleStore(state => state.setResponseText);
  const setCards = useOracleStore(state => state.setCards);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setThinking(true);
    setResponseText('');
    setCards([]);
    
    // TODO: wire up real API call here
    setTimeout(() => {
      setThinking(false);
      setQuery('');
      setResponseText('I have searched the archives. Behold these artifacts of power.');
      
      // Mock cards
      setCards([
        {
          id: '1', name: 'Black Lotus', typeLine: 'Artifact', 
          oracleText: 'Sacrifice Black Lotus: Add three mana of any one color.',
          manaCost: '{0}', manaValue: 0, colors: [], colorIdentity: [], rarity: 'mythic',
          set: 'lea', setName: 'Limited Edition Alpha', keywords: [],
          artCropUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2564&auto=format&fit=crop',
          imageUrl: ''
        },
        {
          id: '2', name: 'Ancestral Recall', typeLine: 'Instant', 
          oracleText: 'Target player draws three cards.',
          manaCost: '{U}', manaValue: 1, colors: ['U'], colorIdentity: ['U'], rarity: 'rare',
          set: 'lea', setName: 'Limited Edition Alpha', keywords: [],
          artCropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=2564&auto=format&fit=crop',
          imageUrl: ''
        },
        {
          id: '3', name: 'Time Walk', typeLine: 'Sorcery', 
          oracleText: 'Take an extra turn after this one.',
          manaCost: '{1}{U}', manaValue: 2, colors: ['U'], colorIdentity: ['U'], rarity: 'rare',
          set: 'lea', setName: 'Limited Edition Alpha', keywords: [],
          artCropUrl: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?q=80&w=2564&auto=format&fit=crop',
          imageUrl: ''
        }
      ]);
      
      // Auto clear after 8 seconds for testing
      setTimeout(() => setResponseText(''), 8000);
    }, 2000);
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

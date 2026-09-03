import React from 'react';
import { useOracleStore } from '../store/useOracleStore';

export function InspectHUD() {
  const card = useOracleStore(state => state.inspectedCard);
  const setInspectedCard = useOracleStore(state => state.setInspectedCard);

  const isVisible = !!card;

  return (
    <div className={`absolute right-8 top-1/2 -translate-y-1/2 w-80 z-40 transition-all duration-400 ease-out ${isVisible ? 'opacity-100 translate-x-0 pointer-events-auto' : 'opacity-0 translate-x-8 pointer-events-none'}`}>
      {card && (
        <div className="backdrop-blur-xl bg-black/70 border border-white/10 rounded-2xl p-6 relative shadow-2xl">
          <button 
            onClick={() => setInspectedCard(null)}
            className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-gray-900 border border-white/20 text-white flex items-center justify-center hover:bg-purple-900/50 hover:border-purple-500 hover:rotate-90 transition-all"
          >
            ✕
          </button>
          
          <div className="text-[10px] tracking-widest text-amber-400 font-bold uppercase mb-2">{card.setName}</div>
          <h2 className="font-serif text-2xl mb-1">{card.name}</h2>
          <div className="text-gray-400 text-xs mb-4">{card.typeLine}</div>
          
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="border border-white/10 bg-white/5 rounded-lg px-3 py-1.5 text-[10px] text-gray-300">
              MANA <b className="text-amber-400 ml-1">{card.manaCost || '0'}</b>
            </div>
            {card.colors && card.colors.length > 0 && (
              <div className="border border-white/10 bg-white/5 rounded-lg px-3 py-1.5 text-[10px] text-gray-300">
                COLOR <b className="text-amber-400 ml-1">{card.colors.join('')}</b>
              </div>
            )}
            <div className="border border-white/10 bg-white/5 rounded-lg px-3 py-1.5 text-[10px] text-gray-300">
              RARITY <b className="text-amber-400 ml-1">{card.rarity.toUpperCase()}</b>
            </div>
          </div>
          
          <div className="text-xs leading-relaxed text-gray-300 border-t border-white/10 pt-4 mt-2 font-serif italic">
            {card.oracleText}
          </div>
        </div>
      )}
    </div>
  );
}

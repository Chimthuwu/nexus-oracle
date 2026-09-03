import React from 'react';
import { useOracleStore } from '../store/useOracleStore';

export function Spine() {
  const isThinking = useOracleStore(state => state.isThinking);
  const responseText = useOracleStore(state => state.responseText);
  
  // Hide spine if Oracle is busy or responding
  const isHidden = isThinking || !!responseText;

  return (
    <div 
      className={`fixed left-0 top-0 bottom-0 z-50 flex items-center transition-opacity duration-500 ${isHidden ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
    >
      <div className="group relative flex flex-col items-center justify-center h-full w-4 hover:w-48 transition-all duration-300 ease-out border-r border-white/5 bg-black/10 hover:bg-black/40 hover:backdrop-blur-xl">
        
        {/* Resting Line */}
        <div className="absolute left-1/2 -translate-x-1/2 top-10 bottom-10 w-[1px] bg-gradient-to-b from-transparent via-white/10 to-transparent group-hover:opacity-0 transition-opacity" />

        {/* Resting Dots */}
        <div className="absolute flex flex-col gap-12 group-hover:opacity-0 transition-opacity">
          <div className="w-1.5 h-1.5 rounded-full bg-purple-500/50 shadow-[0_0_8px_theme('colors.purple.500')]" />
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500/50 shadow-[0_0_8px_theme('colors.blue.500')]" />
          <div className="w-1.5 h-1.5 rounded-full bg-amber-500/50 shadow-[0_0_8px_theme('colors.amber.500')]" />
        </div>

        {/* Expanded Content */}
        <div className="absolute inset-0 flex-col py-12 px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none group-hover:pointer-events-auto flex gap-6">
          <div className="flex items-center gap-3 mb-8">
            <span className="text-amber-500 text-xl rotate-12">✦</span>
            <span className="font-serif tracking-[0.2em] text-xs font-bold text-white whitespace-nowrap">NEXUS</span>
          </div>

          <button className="flex items-center gap-4 text-left group/btn w-full hover:bg-white/5 p-2 rounded-xl transition-colors">
            <div className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_10px_theme('colors.purple.500')]" />
            <span className="text-xs text-gray-400 group-hover/btn:text-white transition-colors whitespace-nowrap">Card Database</span>
          </button>

          <button className="flex items-center gap-4 text-left group/btn w-full hover:bg-white/5 p-2 rounded-xl transition-colors">
            <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_theme('colors.blue.500')]" />
            <span className="text-xs text-gray-400 group-hover/btn:text-white transition-colors whitespace-nowrap">Duel Arena</span>
          </button>

          <button className="flex items-center gap-4 text-left group/btn w-full hover:bg-white/5 p-2 rounded-xl transition-colors">
            <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_10px_theme('colors.amber.500')]" />
            <span className="text-xs text-gray-400 group-hover/btn:text-white transition-colors whitespace-nowrap">Collection</span>
          </button>
        </div>

      </div>
    </div>
  );
}

import React from 'react';

export function InspectHUD() {
  // Placeholder for when card inspect mode is active
  const isVisible = false;

  if (!isVisible) return null;

  return (
    <div className="absolute right-8 top-1/2 -translate-y-1/2 w-80 z-40">
      <div className="backdrop-blur-xl bg-black/50 border border-white/10 rounded-2xl p-6 relative shadow-2xl">
        <button className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-gray-900 border border-white/20 text-white flex items-center justify-center hover:bg-purple-900/50 hover:border-purple-500 hover:rotate-90 transition-all">
          ✕
        </button>
        
        <div className="text-[10px] tracking-widest text-amber-400 font-bold uppercase mb-2">NEXUS RISING</div>
        <h2 className="font-serif text-2xl mb-1">Card Name</h2>
        <div className="text-gray-400 text-xs mb-4">Legendary Creature</div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="border border-white/10 bg-white/5 rounded-lg px-3 py-1.5 text-[10px] text-gray-300">
            MANA <b className="text-amber-400 ml-1">3UU</b>
          </div>
          <div className="border border-white/10 bg-white/5 rounded-lg px-3 py-1.5 text-[10px] text-gray-300">
            COLOR <b className="text-amber-400 ml-1">BLUE</b>
          </div>
        </div>
        
        <div className="text-xs leading-relaxed text-gray-400 border-t border-white/10 pt-4 mt-2">
          Oracle text placeholder...
        </div>
      </div>
    </div>
  );
}

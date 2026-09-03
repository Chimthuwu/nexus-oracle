import React, { useEffect, useState } from 'react';
import { useOracleStore } from '../store/useOracleStore';

export function ResponseCaption() {
  const responseText = useOracleStore(state => state.responseText);
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    if (responseText) {
      let currentIndex = 0;
      setDisplayedText('');

      const typeChar = () => {
        if (currentIndex < responseText.length) {
          setDisplayedText(prev => prev + responseText[currentIndex]);
          currentIndex++;
          timeout = setTimeout(typeChar, 30); // Typing speed
        }
      };
      
      typeChar();
    } else {
      setDisplayedText('');
    }

    return () => clearTimeout(timeout);
  }, [responseText]);

  if (!responseText) return null;

  return (
    <div className="absolute top-[16%] left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-40">
      <div className="backdrop-blur-xl bg-black/50 border border-white/10 rounded-2xl p-6 shadow-2xl shadow-purple-900/20">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_theme('colors.amber.400')] animate-pulse" />
          <span className="text-[10px] tracking-widest text-amber-400 font-bold uppercase">The Oracle</span>
        </div>
        <p className="text-gray-100 text-lg leading-relaxed">
          {displayedText}
          <span className="inline-block w-1 h-5 bg-amber-400 ml-1 align-middle animate-pulse" />
        </p>
      </div>
    </div>
  );
}

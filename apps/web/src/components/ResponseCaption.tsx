import { useEffect, useState } from 'react';
import { useOracleStore } from '../store/useOracleStore';

export function ResponseCaption() {
  const responseText = useOracleStore(state => state.responseText);
  const [displayedText, setDisplayedText] = useState('');
  
  useEffect(() => {
    if (!responseText) {
      setDisplayedText('');
      return;
    }
    
    let index = 0;
    setDisplayedText('');
    
    const interval = setInterval(() => {
      if (index < responseText.length) {
        setDisplayedText(prev => prev + responseText.charAt(index));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 20); // Typing speed
    
    return () => clearInterval(interval);
  }, [responseText]);

  if (!responseText) return null;

  return (
    <div className="response-wrap show" id="responseWrap">
      <div className="glass">
        <div className="response-eyebrow"><span className="pulse"></span>THE ORACLE</div>
        <div className="response-text" id="responseText">
          {displayedText}
          {displayedText.length < responseText.length && <span className="cursor"></span>}
        </div>
      </div>
    </div>
  );
}

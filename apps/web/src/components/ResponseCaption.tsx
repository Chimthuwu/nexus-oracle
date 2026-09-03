import { useEffect, useRef, useState } from 'react';
import { useOracleStore } from '../store/useOracleStore';

export function ResponseCaption() {
  const responseText = useOracleStore((s) => s.responseText);
  const [count, setCount] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (timer.current) clearInterval(timer.current);
    setCount(0);
    if (!responseText) return;

    let i = 0;
    timer.current = setInterval(() => {
      i += 1;
      setCount(i);
      if (i >= responseText.length && timer.current) {
        clearInterval(timer.current);
        timer.current = null;
      }
    }, 16);

    // Call our backend TTS proxy
    fetch('https://nexus-oracle-u6ra.onrender.com/api/oracle/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: responseText })
    })
      .then(res => res.json())
      .then(data => {
        if (data.file_id) {
          const audio = new Audio(`https://freetts.org/api/audio/${data.file_id}`);
          audio.play().catch(console.error);
        }
      })
      .catch(console.error);

    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [responseText]);

  if (!responseText) return null;

  const shown = responseText.slice(0, count);
  const typing = count < responseText.length;

  return (
    <div className="response-wrap show" id="responseWrap">
      <div className="glass">
        <div className="response-eyebrow">
          <span className="pulse" />
          THE ORACLE
        </div>
        <div className="response-text" id="responseText">
          {shown}
          {typing && <span className="cursor" />}
        </div>
      </div>
    </div>
  );
}

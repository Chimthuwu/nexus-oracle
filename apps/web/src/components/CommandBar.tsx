import React, { useState, useEffect, useRef } from 'react';
import { useOracleStore } from '../store/useOracleStore';

const API_URL = 'https://nexus-oracle-u6ra.onrender.com/api/oracle/ask';

// SpeechRecognition Types
const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

/** Server §4.2 response shape. `cards` are full @nexus/card-data `Card` objects. */
interface AskResponse {
  text: string;
  cards: import('../store/useOracleStore').CardData[];
  action: 'none' | 'explain' | 'summon';
}

export function CommandBar() {
  const [query, setQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const setResponseText = useOracleStore((s) => s.setResponseText);
  const setThinking = useOracleStore((s) => s.setThinking);
  const setCards = useOracleStore((s) => s.setCards);
  const setInspectedCard = useOracleStore((s) => s.setInspectedCard);
  const appendTurn = useOracleStore((s) => s.appendTurn);

  useEffect(() => {
    if (SpeechRecognitionAPI) {
      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      
      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        setQuery(transcript);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      recognition.onend = () => setIsListening(false);
      
      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setQuery('');
      recognitionRef.current?.start();
    }
  };

  const ask = async (raw: string) => {
    const message = raw.trim();
    if (!message || isSubmitting) return;

    if (isListening) recognitionRef.current?.stop();

    setIsSubmitting(true);
    setThinking(true);
    setInspectedCard(null);
    setResponseText('');
    setQuery('');

    // Snapshot history *before* adding this turn, so we don't echo the new
    // message back to the server as prior context.
    const history = useOracleStore.getState().historyForSend();
    appendTurn({ role: 'user', content: message });

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, history }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = (await res.json()) as AskResponse;

      const summoned = Array.isArray(data.cards) ? data.cards : [];
      setResponseText(data.text);
      appendTurn({ role: 'oracle', content: data.text, cards: summoned });
      setCards(summoned);
    } catch (error) {
      console.error('Oracle query failed:', error);
      setResponseText(
        'I cannot reach the archive right now — the connection to the well has gone quiet.'
      );
      setCards([]);
    } finally {
      setIsSubmitting(false);
      setThinking(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void ask(query);
  };

  return (
    <div className="command-dock">
      <div className="hint show" id="hint">
        Ask the Oracle anything, or try a suggestion below
      </div>
      <div className="suggestions" id="suggestions">
        {[
          'Show me red aggro cards',
          'Explain the stack in Magic',
          'Help me plan my week',
          'Give me a metaphor for entropy',
        ].map((s) => (
          <button
            key={s}
            type="button"
            className="chip"
            disabled={isSubmitting}
            onClick={() => void ask(s)}
          >
            {s}
          </button>
        ))}
      </div>
      <div className="command-bar glass">
        <form
          onSubmit={handleSubmit}
          style={{ display: 'flex', width: '100%', alignItems: 'center', gap: 10 }}
        >
          <input
            id="commandInput"
            type="text"
            placeholder={isListening ? "Listening..." : "Ask the Oracle anything..."}
            autoComplete="off"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isSubmitting}
            style={{ flex: 1, background: 'transparent', border: 'none', color: '#fff' }}
          />
          {SpeechRecognitionAPI && (
            <button
              type="button"
              className="command-send"
              title="Speak to the Oracle"
              onClick={toggleListening}
              disabled={isSubmitting}
              style={{ 
                background: isListening ? 'rgba(214,168,79,.3)' : 'transparent', 
                border: isListening ? '1px solid var(--gold)' : '1px solid rgba(255,255,255,.1)',
                color: isListening ? 'var(--gold)' : 'rgba(255,255,255,.5)',
                transition: 'all 0.2s'
              }}
            >
              <span aria-hidden>🎤</span>
            </button>
          )}
          <button
            type="submit"
            className={`command-send${isSubmitting ? ' busy' : ''}`}
            id="commandSend"
            aria-label="Ask"
            disabled={isSubmitting || !query.trim()}
          >
            <span aria-hidden>➤</span>
          </button>
        </form>
      </div>
    </div>
  );
}

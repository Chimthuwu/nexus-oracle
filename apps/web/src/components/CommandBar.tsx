import React, { useState, useEffect, useRef } from 'react';
import { useOracleStore } from '../store/useOracleStore';
import { useAskOracle } from '../hooks/useAskOracle';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export function CommandBar() {
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  const ask = useAskOracle();
  const isThinking = useOracleStore((s) => s.isThinking);
  const view = useOracleStore((s) => s.view);
  const setShowTranscript = useOracleStore((s) => s.setShowTranscript);
  const turnCount = useOracleStore((s) => s.activeTurns().length);

  const mind = view === 'mindmapper';
  const suggestions = mind
    ? [
        'Tell me about a place that shaped you',
        'What are you working toward right now?',
        'Describe a memory that still makes you smile',
        'What do you wish people understood about you?',
      ]
    : [
        'Show me red aggro cards',
        'Explain the stack in Magic',
        'Help me plan my week',
        'Give me a metaphor for entropy',
      ];

  useEffect(() => {
    if (!SpeechRecognitionAPI) return;
    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.onstart = () => setIsListening(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      let transcript = '';
      for (let i = 0; i < event.results.length; ++i) transcript += event.results[i][0].transcript;
      setQuery(transcript);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
  }, []);

  const toggleListening = () => {
    if (isListening) recognitionRef.current?.stop();
    else {
      setQuery('');
      recognitionRef.current?.start();
    }
  };

  const submit = (raw: string) => {
    if (isListening) recognitionRef.current?.stop();
    setQuery('');
    void ask(raw);
  };

  return (
    <div className="command-dock">
      <div className="hint show" id="hint">
        {mind
          ? 'Talk with the Oracle — it listens and remembers'
          : 'Ask the Oracle anything, or try a suggestion below'}
        {turnCount > 0 && (
          <button type="button" className="hint-link" onClick={() => setShowTranscript(true)}>
            · view this conversation
          </button>
        )}
      </div>
      <div className="suggestions" id="suggestions">
        {suggestions.map((s) => (
          <button key={s} type="button" className="chip" disabled={isThinking} onClick={() => submit(s)}>
            {s}
          </button>
        ))}
      </div>
      <div className="command-bar glass">
        <form
          onSubmit={(e: React.FormEvent) => {
            e.preventDefault();
            submit(query);
          }}
          style={{ display: 'flex', width: '100%', alignItems: 'center', gap: 10 }}
        >
          <input
            id="commandInput"
            type="text"
            placeholder={
              isListening ? 'Listening…' : mind ? 'Tell the Oracle about yourself…' : 'Ask the Oracle anything…'
            }
            autoComplete="off"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isThinking}
            style={{ flex: 1, background: 'transparent', border: 'none', color: '#fff' }}
          />
          {SpeechRecognitionAPI && (
            <button
              type="button"
              className="command-send"
              title="Speak to the Oracle"
              onClick={toggleListening}
              disabled={isThinking}
              style={{
                background: isListening ? 'rgba(214,168,79,.3)' : 'transparent',
                border: isListening ? '1px solid var(--gold)' : '1px solid rgba(255,255,255,.1)',
                color: isListening ? 'var(--gold)' : 'rgba(255,255,255,.5)',
                transition: 'all 0.2s',
              }}
            >
              <span aria-hidden>🎤</span>
            </button>
          )}
          <button
            type="submit"
            className={`command-send${isThinking ? ' busy' : ''}`}
            id="commandSend"
            aria-label="Ask"
            disabled={isThinking || !query.trim()}
          >
            <span aria-hidden>➤</span>
          </button>
        </form>
      </div>
    </div>
  );
}

import { useEffect, useRef } from 'react';
import { useOracleStore } from '../store/useOracleStore';

const TTS_URL = 'https://nexus-oracle-u6ra.onrender.com/api/oracle/tts';

/**
 * Speaks the Oracle's replies aloud (server proxies freetts.org). Renders a
 * small mute toggle top-right; playback only happens while it's on. Works in
 * both the Oracle and Mind Mapper views since both drive `responseText`.
 */
export function OracleVoice() {
  const view = useOracleStore((s) => s.view);
  const text = useOracleStore((s) => s.responseText);
  const enabled = useOracleStore((s) => s.voiceEnabled);
  const setEnabled = useOracleStore((s) => s.setVoiceEnabled);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastSpoken = useRef('');

  const stop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
  };

  useEffect(() => {
    if (!enabled) {
      stop();
      return;
    }
    const line = text.trim();
    if (!line || line === lastSpoken.current) return;
    lastSpoken.current = line;

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(TTS_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: line }),
        });
        if (!res.ok || cancelled) return;
        const ct = res.headers.get('content-type') ?? '';
        let src: string;
        if (ct.startsWith('audio/')) {
          src = URL.createObjectURL(await res.blob());
        } else {
          const data = (await res.json()) as { url?: string };
          if (!data.url) return;
          src = data.url;
        }
        if (cancelled) return;
        stop();
        const audio = new Audio(src);
        audio.volume = 0.9;
        audioRef.current = audio;
        void audio.play().catch(() => {});
      } catch {
        /* voice is best-effort */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [text, enabled]);

  if (view !== 'oracle' && view !== 'mindmapper') return null;

  return (
    <button
      className={`voice-toggle ${enabled ? 'on' : ''}`}
      onClick={() => {
        if (enabled) stop();
        setEnabled(!enabled);
      }}
      title={enabled ? 'Mute the Oracle' : "Hear the Oracle's voice"}
    >
      {enabled ? '🔊' : '🔇'}
    </button>
  );
}

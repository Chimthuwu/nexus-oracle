import { useEffect, useRef, useState } from 'react';
import { useOracleStore } from '../store/useOracleStore';
import { useAskOracle } from '../hooks/useAskOracle';

const KICKOFF =
  'Begin mapping my mind. Ask me one thoughtful question to start — just the question, warm and simple.';

/**
 * Mind Mapper isn't a chat — it's the Oracle interviewing you while the brain
 * grows. This overlay shows the current question, takes your answer, and asks
 * for the next one. No command bar, no floating caption.
 */
export function MindMapperHUD() {
  const view = useOracleStore((s) => s.view);
  const question = useOracleStore((s) => s.responseText);
  const isThinking = useOracleStore((s) => s.isThinking);
  const memCount = useOracleStore((s) => s.memories.length);
  const setShowTranscript = useOracleStore((s) => s.setShowTranscript);

  const ask = useAskOracle();
  const [answer, setAnswer] = useState('');
  const kicked = useRef(false);

  // First entry with nothing pending → ask the Oracle to open.
  useEffect(() => {
    if (view === 'mindmapper' && !question && !isThinking && !kicked.current) {
      kicked.current = true;
      void ask(KICKOFF, { silent: true });
    }
    if (view !== 'mindmapper') kicked.current = false;
  }, [view, question, isThinking, ask]);

  if (view !== 'mindmapper') return null;

  const submit = () => {
    const a = answer.trim();
    if (!a || isThinking) return;
    setAnswer('');
    void ask(a);
  };
  const skip = () => {
    if (isThinking) return;
    void ask('Skip that one — ask me something else.', { silent: true });
  };

  return (
    <div className="mm-hud">
      <div className="mm-progress">
        {memCount === 0
          ? 'the map is empty — every answer adds to it'
          : `${memCount} ${memCount === 1 ? 'thing' : 'things'} mapped`}
        <button className="mm-review" onClick={() => setShowTranscript(true)}>
          · review
        </button>
      </div>

      <div className="mm-question glass">
        <div className="mm-q-eyebrow">
          <span className="pulse" />
          MINDMAPPER:
        </div>
        <div className="mm-q-text">
          {isThinking && !question ? 'considering what to ask you…' : question || '…'}
        </div>
      </div>

      <div className="mm-answer glass">
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder={isThinking ? 'MindMapper is listening…' : 'your answer…'}
          rows={2}
          disabled={isThinking}
        />
        <div className="mm-answer-actions">
          <button className="mm-skip" onClick={skip} disabled={isThinking}>
            Skip
          </button>
          <button className="mm-send" onClick={submit} disabled={isThinking || !answer.trim()}>
            Answer ▸
          </button>
        </div>
      </div>
    </div>
  );
}

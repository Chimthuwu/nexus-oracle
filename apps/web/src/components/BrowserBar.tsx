import { useEffect, useState } from 'react';
import { useOracleStore } from '../store/useOracleStore';

const COLORS: { key: string; label: string; hex: string }[] = [
  { key: 'W', label: 'W', hex: '#f8f4d8' },
  { key: 'U', label: 'U', hex: '#4a9ee0' },
  { key: 'B', label: 'B', hex: '#9a8bb0' },
  { key: 'R', label: 'R', hex: '#e0603f' },
  { key: 'G', label: 'G', hex: '#5aa963' },
  { key: 'C', label: 'C', hex: '#b7b7c4' },
];

export function BrowserBar() {
  const view = useOracleStore((s) => s.view);
  const setView = useOracleStore((s) => s.setView);
  const loadBrowser = useOracleStore((s) => s.loadBrowser);
  const loading = useOracleStore((s) => s.browserLoading);
  const count = useOracleStore((s) => s.browserCards.length);
  const storedColors = useOracleStore((s) => s.browserColors);
  const inspecting = useOracleStore((s) => s.inspectedCard != null);

  const [q, setQ] = useState('');
  const [colors, setColors] = useState<string[]>(storedColors);

  // Load the archive the first time the browser opens.
  useEffect(() => {
    if (view === 'browser' && count === 0 && !loading) void loadBrowser({ query: '', colors: [] });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  if (view !== 'browser') return null;

  const toggleColor = (key: string) => {
    const next = colors.includes(key) ? colors.filter((c) => c !== key) : [...colors, key];
    setColors(next);
    void loadBrowser({ query: q, colors: next });
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    void loadBrowser({ query: q, colors });
  };

  return (
    <div className={`browser-bar${inspecting ? ' dimmed' : ''}`}>
      <div className="browser-inner glass">
        <button className="browser-close" onClick={() => setView('oracle')} title="Back to the Oracle">
          ✕
        </button>
        <div className="browser-title">
          THE ARCHIVE
          <span>{loading ? 'consulting…' : `${count} card${count === 1 ? '' : 's'}`}</span>
        </div>
        <form onSubmit={submit} className="browser-search">
          <input
            type="text"
            placeholder="Search the archive — name, theme, keyword…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            autoComplete="off"
          />
          <div className="browser-colors">
            {COLORS.map((c) => (
              <button
                key={c.key}
                type="button"
                className={`browser-pip ${colors.includes(c.key) ? 'on' : ''}`}
                style={{ ['--pip' as string]: c.hex }}
                onClick={() => toggleColor(c.key)}
                title={c.key}
              >
                {c.label}
              </button>
            ))}
          </div>
        </form>
      </div>
      <div className="browser-hint">scroll to sift · click a card to inspect</div>
    </div>
  );
}

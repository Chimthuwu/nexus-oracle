import { useOracleStore } from '../store/useOracleStore';

const COLOR_NAME: Record<string, string> = {
  W: 'White',
  U: 'Blue',
  B: 'Black',
  R: 'Red',
  G: 'Green',
};

export function InspectHUD() {
  const view = useOracleStore((s) => s.view);
  const inspectedCard = useOracleStore((s) => s.inspectedCard);
  const setInspectedCard = useOracleStore((s) => s.setInspectedCard);
  const deckList = useOracleStore((s) => s.deckList);
  const addCardToDeck = useOracleStore((s) => s.addCardToDeck);
  const removeCardFromDeck = useOracleStore((s) => s.removeCardFromDeck);

  const inDeck = inspectedCard ? deckList.find((d) => d.card.id === inspectedCard.id) : undefined;

  const colorLabel = inspectedCard
    ? inspectedCard.colors.length
      ? inspectedCard.colors.map((c) => COLOR_NAME[c] ?? c).join(' / ')
      : 'Colorless'
    : '—';

  const ptLabel =
    inspectedCard?.power != null && inspectedCard?.toughness != null
      ? `${inspectedCard.power} / ${inspectedCard.toughness}`
      : inspectedCard?.loyalty != null
        ? `Loyalty ${inspectedCard.loyalty}`
        : null;

  return (
    <div className={`inspect-hud ${inspectedCard ? 'show' : ''}`} id="inspectHud">
      {inspectedCard && (
        <div className="glass">
          <button
            className="hud-close"
            id="hudClose"
            aria-label="Close"
            onClick={() => setInspectedCard(null)}
          >
            ✕
          </button>
          <div className="hud-eyebrow" id="hudSet">
            {inspectedCard.setName || inspectedCard.set.toUpperCase()}
          </div>
          <div className="hud-name" id="hudName">
            {inspectedCard.name}
          </div>
          <div className="hud-type" id="hudType">
            {inspectedCard.typeLine}
          </div>
          <div className="hud-stats">
            <div className="hud-stat">
              MANA <b id="hudMana">{inspectedCard.manaCost || '—'}</b>
            </div>
            <div className="hud-stat">
              COLOR <b id="hudColor">{colorLabel}</b>
            </div>
            <div className="hud-stat">
              RARITY <b id="hudRarity">{inspectedCard.rarity}</b>
            </div>
            {ptLabel && (
              <div className="hud-stat">
                {inspectedCard.loyalty != null ? '' : 'P/T '}
                <b>{ptLabel}</b>
              </div>
            )}
          </div>
          <div className="hud-oracle" id="hudOracle">
            {inspectedCard.oracleText || 'No oracle text.'}
          </div>
          {view === 'browser' && (
            <div className="hud-deck-actions">
              <button
                className="hud-deck-add"
                onClick={() => addCardToDeck(inspectedCard, 1)}
              >
                + Add to deck
              </button>
              {inDeck && (
                <button
                  className="hud-deck-remove"
                  onClick={() => removeCardFromDeck(inspectedCard.id, 1)}
                >
                  − Remove ({inDeck.count})
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

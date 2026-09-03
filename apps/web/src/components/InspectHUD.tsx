
import { useOracleStore } from '../store/useOracleStore';

export function InspectHUD() {
  const inspectedCard = useOracleStore(state => state.inspectedCard);
  const setInspectedCard = useOracleStore(state => state.setInspectedCard);

  return (
    <div className={`inspect-hud ${inspectedCard ? 'show' : ''}`} id="inspectHud">
      {inspectedCard && (
        <div className="glass">
          <button 
            className="hud-close" 
            id="hudClose" 
            aria-label="Back to the Oracle"
            onClick={() => setInspectedCard(null)}
          >
            ✕
          </button>
          <div className="hud-eyebrow" id="hudSet">NEXUS RISING</div>
          <div className="hud-name" id="hudName">{inspectedCard.name}</div>
          <div className="hud-type" id="hudType">{inspectedCard.typeLine}</div>
          <div className="hud-stats">
            <div className="hud-stat">MANA <b id="hudMana">{inspectedCard.manaCost || '—'}</b></div>
            <div className="hud-stat">COLOR <b id="hudColor">—</b></div>
            <div className="hud-stat">RARITY <b id="hudRarity">—</b></div>
          </div>
          <div className="hud-oracle" id="hudOracle">
            {inspectedCard.oracleText || 'No oracle text available.'}
          </div>
        </div>
      )}
    </div>
  );
}

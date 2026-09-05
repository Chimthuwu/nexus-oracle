const fs = require('fs');
let code = fs.readFileSync('packages/card-data/scripts/fetch-cards.mjs', 'utf8');
const newCards = [
  'Dockside Extortionist', 'Fierce Guardianship', 'Deflecting Swat',
  "Teferi's Protection", 'Vampiric Tutor', 'Cyclonic Rift',
  'Craterhoof Behemoth', 'Sylvan Library', 'Jeweled Lotus', 'Mana Crypt', 
  'Sol Ring', 'Arcane Signet', 'Boseiju, Who Endures', 'Otawara, Soaring City', 
  'Takenuma, Abandoned Mire', 'Eiganjo, Seat of the Empire', 'Sokenzan, Crucible of Defiance',
  "Urza's Saga", 'Ancient Tomb', 'Command Tower', 'Blood Moon', 
  'Chalice of the Void', 'Force of Will', 'Force of Negation',
  'Wrenn and Six', 'Liliana of the Veil', 'Jace, the Mind Sculptor',
  'Lightning Bolt', 'Brainstorm', 'Ponder', 'Dark Ritual', 'Swords to Plowshares'
];

const match = code.match(/CARD_NAMES = \[([\s\S]*?)\];/);
if (match) {
  let list = match[1];
  let addedCount = 0;
  for (const c of newCards) {
    if (!list.includes('"' + c + '"') && !list.includes("'" + c + "'")) {
      list += ',\n    "' + c + '"';
      addedCount++;
    }
  }
  code = code.replace(match[0], 'CARD_NAMES = [' + list + '\n];');
  fs.writeFileSync('packages/card-data/scripts/fetch-cards.mjs', code);
  console.log('Cards added successfully. Total added:', addedCount);
} else {
  console.log('Failed to find CARD_NAMES.');
}

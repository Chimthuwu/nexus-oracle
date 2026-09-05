const fs = require('fs');
let code = fs.readFileSync('packages/card-data/scripts/fetch-cards.mjs', 'utf8');
const newCards = [
  'Atraxa, Grand Unifier', 'Elesh Norn, Mother of Machines', 'The Meathook Massacre',
  'Fable of the Mirror-Breaker', 'Wrenn and Realmbreaker', 
  'Muxus, Goblin Grandee', 'Koma, Cosmos Serpent', 'Toxrill, the Corrosive',
  'Tergrid, God of Fright', 'Niv-Mizzet, Parun', 'Phyrexian Altar', 
  'Smothering Tithe', 'Rhystic Study', 'Mystic Remora', 'Esper Sentinel'
];

const match = code.match(/CARD_NAMES = \[([\s\S]*?)\];/);
if (match) {
  let list = match[1];
  for (const c of newCards) {
    if (!list.includes('"' + c + '"')) {
      list += ',\n    "' + c + '"';
    }
  }
  code = code.replace(match[0], 'CARD_NAMES = [' + list + '\n];');
  fs.writeFileSync('packages/card-data/scripts/fetch-cards.mjs', code);
  console.log('Cards added successfully.');
} else {
  console.log('Failed to find CARD_NAMES.');
}

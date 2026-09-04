const fs = require('fs');

async function run() {
  console.log('Fetching top EDHREC cards from Scryfall...');
  const newNames = new Set();
  
  let hasMore = true;
  let url = 'https://api.scryfall.com/cards/search?q=f:commander+sort:edhrec&page=1';
  let pages = 0;
  
  while (hasMore && pages < 20) {
    const res = await fetch(url, { headers: { 'User-Agent': 'NexusEngine/1.0 (chimthuwu@example.com)' } });
    const data = await res.json();
    if (!data.data) break;
    data.data.forEach(c => newNames.add(c.name));
    hasMore = data.has_more;
    url = data.next_page;
    pages++;
    console.log(`Fetched page ${pages}...`);
    await new Promise(r => setTimeout(r, 200)); // be nice to Scryfall
  }

  let code = fs.readFileSync('packages/card-data/scripts/fetch-cards.mjs', 'utf8');
  const arrayStart = code.indexOf('const CARD_NAMES = [');
  const arrayEnd = code.indexOf('];', arrayStart);
  
  const existingBlock = code.substring(arrayStart, arrayEnd);
  const existingNames = [...existingBlock.matchAll(/"([^"]+)"/g)].map(m => m[1]);
  const existingSet = new Set(existingNames);
  
  const toAdd = Array.from(newNames).filter(n => !existingSet.has(n));
  console.log(`Found ${toAdd.length} new iconic cards to add!`);
  
  if (toAdd.length === 0) return;
  
  const linesToAdd = toAdd.map(n => `    "${n.replace(/"/g, '\\"')}"`).join(',\n');
  const newBlock = existingBlock + ',\n' + linesToAdd;
  code = code.substring(0, arrayStart) + newBlock + code.substring(arrayEnd);
  
  fs.writeFileSync('packages/card-data/scripts/fetch-cards.mjs', code);
  console.log('Updated fetch-cards.mjs with new names!');
}

run();

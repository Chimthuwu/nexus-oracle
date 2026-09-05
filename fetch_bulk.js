const https = require('https');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const readline = require('readline');

const OUT = path.join('packages', 'card-data', 'src', 'mockData.ts');

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'NexusEngine/1.0', 'Accept': 'application/json' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(get(res.headers.location));
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

function mapToCard(raw) {
  const card = raw.card_faces ? raw.card_faces[0] : raw;
  const image_uris = card.image_uris || raw.image_uris || {};
  return {
    id: raw.id,
    name: raw.name,
    manaCost: card.mana_cost || '',
    manaValue: raw.cmc || 0,
    typeLine: card.type_line || '',
    oracleText: card.oracle_text || '',
    colors: card.colors || [],
    colorIdentity: raw.color_identity || [],
    rarity: raw.rarity || 'common',
    power: card.power,
    toughness: card.toughness,
    loyalty: card.loyalty,
    set: raw.set,
    setName: raw.set_name,
    artCropUrl: image_uris.art_crop || '',
    imageUrl: image_uris.normal || image_uris.large || '',
    keywords: raw.keywords || []
  };
}

async function run() {
  console.log('Fetching bulk data metadata...');
  const meta = await get('https://api.scryfall.com/bulk-data/oracle-cards');
  const uri = meta.download_uri || meta.jsonl_download_uri;
  console.log('Downloading bulk data from:', uri);
  
  const mapped = [];
  
  await new Promise((resolve, reject) => {
    https.get(uri, { headers: { 'User-Agent': 'NexusEngine/1.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        https.get(res.headers.location, { headers: { 'User-Agent': 'NexusEngine/1.0' } }, handleResponse).on('error', reject);
      } else {
        handleResponse(res);
      }

      function handleResponse(response) {
        let stream = response;
        if (uri.endsWith('.gz')) {
          const gunzip = zlib.createGunzip();
          response.pipe(gunzip);
          stream = gunzip;
        }

        const rl = readline.createInterface({
          input: stream,
          crlfDelay: Infinity
        });

        rl.on('line', (line) => {
          if (!line || line === '[' || line === ']') return;
          if (line.endsWith(',')) line = line.slice(0, -1);
          
          try {
            const raw = JSON.parse(line);
            if (raw.layout !== 'token' && raw.layout !== 'emblem' && raw.layout !== 'art_series' && raw.set_type !== 'funny' && raw.set_type !== 'memorabilia') {
              const leg = raw.legalities || {};
              const isRealCard = leg.commander === 'legal' || leg.vintage === 'legal' || leg.legacy === 'legal' || leg.modern === 'legal' || leg.pioneer === 'legal' || leg.standard === 'legal' || leg.pauper === 'legal';
              if (isRealCard) {
                mapped.push(mapToCard(raw));
              }
            }
          } catch (e) {
            // Ignore parse errors for single lines
          }
        });

        rl.on('close', resolve);
      }
    }).on('error', reject);
  });
  
  console.log('Finished processing. Filtering valid cards...');
  
  // Scryfall's JSON array might be sent as one huge line if not jsonl.
  // Wait, if it's JSON array, readline might read the whole thing as one line.
  // Actually, jsonl is one JSON object per line.
  
  // Also limit to say 20000 cards so the file doesn't get ridiculously large for Vite to handle quickly?
  // Let's just output all of them!
  const final = mapped;
  
  const header = `// AUTO-GENERATED bulk data
import type { Card } from "./types";

export const MOCK_CARDS: Card[] = `;

  fs.writeFileSync(OUT, header + JSON.stringify(final, null, 2) + ";\n");
  console.log('Wrote', final.length, 'cards to mockData.ts');
}

run().catch(console.error);

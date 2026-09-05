/**
 * The canonical Nexus `Card` shape — FROZEN CONTRACT, see TODO.txt §4.1.
 *
 * Both Track A (apps/web) and Track B (apps/server) import this type, so it must
 * not change without a Status Log proposal first.
 */
export interface Card {
  id: string; // unique (Scryfall id for cards authored from real data; generated otherwise)
  name: string;
  manaCost: string; // e.g. "{3}{U}{U}" — "" for cards with no mana cost (e.g. lands)
  manaValue: number;
  typeLine: string;
  oracleText: string;
  colors: string[]; // e.g. ["U"], [] for colorless
  colorIdentity: string[];
  // Scryfall's full rarity set — "special" (e.g. Time Spiral timeshifted) and
  // "bonus" (e.g. The List / Mystery Booster) show up in the bulk data.
  rarity: "common" | "uncommon" | "rare" | "mythic" | "special" | "bonus";
  power?: string;
  toughness?: string;
  loyalty?: string;
  set: string;
  setName: string;
  artCropUrl: string; // URL to art (cropped) — placeholder allowed in mock data
  imageUrl: string; // URL to full card image
  keywords: string[]; // e.g. ["Flying", "Trample"]
}

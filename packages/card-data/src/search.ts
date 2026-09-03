import type { Card } from "./types";
import { MOCK_CARDS } from "./mockData";

/**
 * Filters accepted by `searchCards`, mirroring the frozen `search_cards` tool
 * schema in TODO.txt §4.3 field-for-field (snake_case included) so the server
 * can hand tool-call arguments straight through without reshaping.
 */
export interface SearchFilters {
  /** Required colors on the card's color identity. "C" means colorless. */
  colors?: Array<"W" | "U" | "B" | "R" | "G" | "C">;
  /** Substrings that must appear in the card's type line (e.g. "creature", "legendary"). */
  types?: string[];
  /** Only cards with mana value <= this. */
  max_mana_value?: number;
  /** Keywords the card must have (e.g. "Flying"). Case-insensitive substring. */
  keywords?: string[];
  /** Max results to return. Defaults to 3 (matches the tool schema default). */
  limit?: number;
}

const COLOR_LETTERS = new Set(["W", "U", "B", "R", "G", "C"]);

function matchesColorFilter(card: Card, colors: string[]): boolean {
  return colors.every((c) => {
    if (c === "C") return card.colorIdentity.length === 0;
    return card.colorIdentity.includes(c);
  });
}

/**
 * Full-text relevance for a free-text query token against a card.
 * Returns a score >= 0 (higher = more relevant).
 */
function tokenScore(card: Card, token: string): number {
  const name = card.name.toLowerCase();
  const oracle = card.oracleText.toLowerCase();
  const typeLine = card.typeLine.toLowerCase();
  const keywordText = card.keywords.join(" ").toLowerCase();
  let score = 0;
  if (name === token) score += 60;
  else if (name.startsWith(token)) score += 40;
  if (name.includes(token)) score += 25;
  if (keywordText.includes(token)) score += 20;
  if (oracle.includes(token)) score += 10;
  if (typeLine.includes(token)) score += 10;
  if (card.setName.toLowerCase().includes(token)) score += 5;
  return score;
}

/**
 * Search the Nexus card archive.
 *
 * - `query`: free text — card name, theme, or strategy. Every space-separated
 *   token must match somewhere (name / oracle text / type line / keywords).
 *   Empty query matches everything (subject to filters).
 * - `filters`: optional restrictions per the §4.3 schema. `colors` requires
 *   every listed color to be present on the card's color identity (searching
 *   for "U" includes multicolor cards that contain blue; "C" = colorless).
 *
 * Results are relevance-ranked: exact name matches first, then name-prefix,
 * then substring hits, then oracle/keyword/type hits, then alphabetical.
 */
export function searchCards(query: string, filters: SearchFilters = {}): Card[] {
  const limit = filters.limit ?? 3;
  const tokens = query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  const colors = (filters.colors ?? []).filter((c) => COLOR_LETTERS.has(c));
  const types = (filters.types ?? []).map((t) => t.toLowerCase()).filter(Boolean);
  const keywords = (filters.keywords ?? []).map((k) => k.toLowerCase()).filter(Boolean);
  const maxMv = filters.max_mana_value;

  const matches = MOCK_CARDS.filter((card) => {
    if (colors.length && !matchesColorFilter(card, colors)) return false;
    if (types.length) {
      const typeLine = card.typeLine.toLowerCase();
      if (!types.every((t) => typeLine.includes(t))) return false;
    }
    if (keywords.length) {
      const owned = card.keywords.join(" ").toLowerCase();
      if (!keywords.every((k) => owned.includes(k))) return false;
    }
    if (maxMv != null && !Number.isNaN(maxMv) && card.manaValue > maxMv) return false;
    if (tokens.length) {
      let total = 0;
      for (const token of tokens) {
        const score = tokenScore(card, token);
        if (score === 0) return false; // every token must match somewhere
        total += score;
      }
      return total > 0;
    }
    return true;
  });

  const scored = matches.map((card) => {
    if (!tokens.length) return { card, score: 0 };
    const full = query.trim().toLowerCase();
    let score = 0;
    for (const token of tokens) score += tokenScore(card, token);
    // Whole-phrase exact-name bonus puts the exact card on top.
    if (card.name.toLowerCase() === full) score += 500;
    return { card, score };
  });

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.card.name.localeCompare(b.card.name);
  });

  return scored.slice(0, limit).map((s) => s.card);
}

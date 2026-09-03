import { describe, it, expect } from "vitest";
import { MOCK_CARDS } from "../src/mockData";
import { searchCards } from "../src/search";
import type { Card } from "../src/types";

const RARITIES = new Set(["common", "uncommon", "rare", "mythic"]);
const LETTERS = new Set(["W", "U", "B", "R", "G"]);

describe("mock dataset contract invariants (frozen Card, TODO.txt §4.1)", () => {
  it("holds at least 30 cards", () => {
    expect(MOCK_CARDS.length).toBeGreaterThanOrEqual(30);
  });

  it("has unique ids and names", () => {
    expect(new Set(MOCK_CARDS.map((c) => c.id)).size).toBe(MOCK_CARDS.length);
    expect(new Set(MOCK_CARDS.map((c) => c.name)).size).toBe(MOCK_CARDS.length);
  });

  it("every card satisfies the frozen shape", () => {
    for (const card of MOCK_CARDS) {
      expect(typeof card.id).toBe("string");
      expect(typeof card.name).toBe("string");
      expect(typeof card.manaCost).toBe("string");
      expect(typeof card.manaValue).toBe("number");
      expect(typeof card.typeLine).toBe("string");
      expect(typeof card.oracleText).toBe("string");
      expect(Array.isArray(card.colors)).toBe(true);
      expect(Array.isArray(card.colorIdentity)).toBe(true);
      expect(RARITIES.has(card.rarity)).toBe(true);
      expect(typeof card.set).toBe("string");
      expect(typeof card.setName).toBe("string");
      expect(typeof card.artCropUrl).toBe("string");
      expect(typeof card.imageUrl).toBe("string");
      expect(Array.isArray(card.keywords)).toBe(true);
      if (card.manaCost) expect(card.manaCost.startsWith("{")).toBe(true);
    }
  });

  it("color fields are coherent (colors ⊆ colorIdentity ⊆ WUBRG)", () => {
    for (const card of MOCK_CARDS) {
      for (const c of card.colors) expect(LETTERS.has(c)).toBe(true);
      for (const c of card.colorIdentity) expect(LETTERS.has(c)).toBe(true);
      for (const c of card.colors) expect(card.colorIdentity).toContain(c);
    }
  });

  it("has useful spread across colors, rarities and types", () => {
    const has = (fn: (c: Card) => boolean) => MOCK_CARDS.some(fn);
    for (const letter of LETTERS) {
      expect(has((c) => c.colorIdentity.includes(letter))).toBe(true);
    }
    expect(has((c) => c.colorIdentity.length === 0)).toBe(true); // colorless
    for (const rarity of RARITIES) expect(has((c) => c.rarity === rarity)).toBe(true);
    for (const kind of ["Creature", "Instant", "Sorcery", "Planeswalker", "Artifact", "Land", "Enchantment"]) {
      expect(has((c) => c.typeLine.includes(kind))).toBe(true);
    }
  });
});

describe("searchCards — name & free text", () => {
  it("puts an exact name match first", () => {
    const hits = searchCards("lightning bolt", { limit: 5 });
    expect(hits.length).toBeGreaterThan(0);
    expect(hits[0].name).toBe("Lightning Bolt");
  });

  it("is case-insensitive", () => {
    expect(searchCards("GOYF")[0]?.name).toBe("Tarmogoyf");
    expect(searchCards("counterspell", { colors: ["U"] })[0]?.name).toBe("Counterspell");
  });

  it("matches substrings and oracle text", () => {
    const byOracle = searchCards("draw three cards", { limit: 5 });
    expect(byOracle.some((c) => c.name === "Jace, the Mind Sculptor")).toBe(true);
  });

  it("treats color words as identity filters, not text to match", () => {
    // "white" never appears in these cards' text — it must filter by identity.
    const whites = searchCards("white angel flying", { limit: 20 });
    expect(whites.length).toBeGreaterThan(0);
    for (const c of whites) expect(c.colorIdentity).toContain("W");
    // Angels (match both tokens) rank above cards that only match "flying".
    expect(whites[0]?.typeLine.toLowerCase()).toContain("angel");
    expect(whites.some((c) => c.name === "Avacyn, Angel of Hope")).toBe(true);
    expect(whites.some((c) => c.name === "Counterspell")).toBe(false);

    // Single letters work too, and colorless maps to empty identity.
    const blues = searchCards("blue counter", { limit: 10 });
    for (const c of blues) expect(c.colorIdentity).toContain("U");
    expect(blues.some((c) => c.name === "Counterspell")).toBe(true);
    const colorless = searchCards("colorless artifact", { limit: 20 });
    for (const c of colorless) expect(c.colorIdentity).toEqual([]);

    // A pure color-word query returns identity matches (alphabetical).
    const justRed = searchCards("red", { limit: 50 });
    expect(justRed.length).toBeGreaterThan(0);
    for (const c of justRed) expect(c.colorIdentity).toContain("R");
  });

  it("matches ANY token, ranking cards that match more tokens higher", () => {
    // LLM-generated queries copy whole sentences; any-match keeps recall high
    // while cumulative scoring ranks the best cards first.
    const hits = searchCards("angel lifelink", { limit: 10 });
    expect(hits.length).toBeGreaterThan(0);
    // Baneslayer Angel matches both tokens (type line + keyword) → first.
    expect(hits[0].name).toBe("Baneslayer Angel");
    const otherAngels = hits.filter((c) => c.typeLine.toLowerCase().includes("angel"));
    expect(otherAngels.length).toBeGreaterThan(1);
  });

  it("handles long verbose queries from LLM tool calls", () => {
    // A model paraphrasing the user will pass something like this verbatim.
    const hits = searchCards("white creature with flying that protects others", { limit: 5 });
    expect(hits.length).toBeGreaterThan(0);
    // The white angels should dominate the top of the ranking.
    const top = hits.slice(0, 3);
    for (const c of top) {
      expect(c.colorIdentity).toContain("W");
      expect(c.typeLine.toLowerCase()).toContain("creature");
    }
    expect(top.some((c) => c.typeLine.toLowerCase().includes("angel"))).toBe(true);
  });

  it("returns [] for nonsense queries", () => {
    expect(searchCards("zzzzqqqqx")).toEqual([]);
  });
});

describe("searchCards — filters (§4.3 schema)", () => {
  it("filters by color identity, including multicolor membership", () => {
    const blue = searchCards("", { colors: ["U"], limit: 50 });
    expect(blue.length).toBeGreaterThan(0);
    for (const c of blue) expect(c.colorIdentity).toContain("U");

    // Teferi, Time Raveler is WU → matches a blue search.
    expect(blue.some((c) => c.name === "Teferi, Time Raveler")).toBe(true);
    // Searching white must NOT return pure-blue cards.
    const white = searchCards("", { colors: ["W"], limit: 50 });
    expect(white.some((c) => c.name === "Counterspell")).toBe(false);
    expect(white.some((c) => c.name === "Teferi, Time Raveler")).toBe(true);
  });

  it("understands C = colorless", () => {
    const colorless = searchCards("", { colors: ["C"], limit: 50 });
    expect(colorless.length).toBeGreaterThan(0);
    for (const c of colorless) expect(c.colorIdentity).toEqual([]);
    expect(colorless.some((c) => c.name === "Black Lotus")).toBe(true);
  });

  it("filters by type line", () => {
    const creatures = searchCards("", { types: ["creature"], limit: 50 });
    expect(creatures.length).toBeGreaterThan(0);
    for (const c of creatures) expect(c.typeLine.toLowerCase()).toContain("creature");

    const legendary = searchCards("", { types: ["legendary"], limit: 50 });
    for (const c of legendary) expect(c.typeLine.toLowerCase()).toContain("legendary");
  });

  it("filters by max mana value", () => {
    const cheap = searchCards("", { max_mana_value: 1, limit: 50 });
    expect(cheap.length).toBeGreaterThan(0);
    for (const c of cheap) expect(c.manaValue).toBeLessThanOrEqual(1);
    expect(cheap.some((c) => c.name === "Dark Ritual")).toBe(true);
    expect(cheap.some((c) => c.name === "Emrakul, the Aeons Torn")).toBe(false);
  });

  it("filters by keywords", () => {
    const flyers = searchCards("", { keywords: ["flying"], limit: 50 });
    expect(flyers.length).toBeGreaterThan(0);
    for (const c of flyers) {
      expect(c.keywords.map((k) => k.toLowerCase())).toContain("flying");
    }
  });

  it("combines query + filters", () => {
    const goyfGreen = searchCards("goyf", { colors: ["G"] });
    expect(goyfGreen.some((c) => c.name === "Tarmogoyf")).toBe(true);
    expect(searchCards("goyf", { colors: ["U"] })).toEqual([]);
  });

  it("respects limit (default 3 per tool schema)", () => {
    expect(searchCards("").length).toBe(3);
    expect(searchCards("", { limit: 10 }).length).toBe(10);
    expect(searchCards("a", { limit: 50 }).length).toBeLessThanOrEqual(50);
  });
});

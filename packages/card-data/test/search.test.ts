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

  it("requires every space-separated token to match", () => {
    // "angel" hits the type line of white angels; "lifelink" is a keyword
    // only Baneslayer Angel carries in this set — every hit must have both.
    const hits = searchCards("angel lifelink", { limit: 10 });
    expect(hits.length).toBeGreaterThan(0);
    for (const c of hits) {
      expect(c.typeLine.toLowerCase()).toContain("angel");
      expect(c.keywords.map((k) => k.toLowerCase())).toContain("lifelink");
    }
    expect(hits.some((c) => c.name === "Baneslayer Angel")).toBe(true);
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

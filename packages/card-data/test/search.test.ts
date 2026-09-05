import { describe, it, expect } from "vitest";
import { MOCK_CARDS } from "../src/mockData";
import { searchCards } from "../src/search";
import type { Card } from "../src/types";

// Scryfall's full rarity set — the bulk archive carries all of these.
const RARITIES = new Set(["common", "uncommon", "rare", "mythic", "special", "bonus"]);
const LETTERS = new Set(["W", "U", "B", "R", "G"]);

// `searchCards` returns { data, total }; every test below only cares about the
// ranked rows, so unwrap once here.
const search = (query: string, filters?: Parameters<typeof searchCards>[1]): Card[] =>
  searchCards(query, filters).data;

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
    for (const rarity of ["common", "uncommon", "rare", "mythic"]) {
      expect(has((c) => c.rarity === rarity)).toBe(true);
    }
    for (const kind of ["Creature", "Instant", "Sorcery", "Planeswalker", "Artifact", "Land", "Enchantment"]) {
      expect(has((c) => c.typeLine.includes(kind))).toBe(true);
    }
  });
});

describe("searchCards — name & free text", () => {
  it("puts an exact name match first", () => {
    const hits = search("lightning bolt", { limit: 5 });
    expect(hits.length).toBeGreaterThan(0);
    expect(hits[0].name).toBe("Lightning Bolt");
  });

  it("is case-insensitive", () => {
    expect(search("tarmogoyf")[0]?.name).toBe("Tarmogoyf");
    expect(search("TARMOGOYF")[0]?.name).toBe("Tarmogoyf");
    expect(search("counterspell", { colors: ["U"] })[0]?.name).toBe("Counterspell");
  });

  it("matches substrings and oracle text", () => {
    // "goyf" isn't a word — only the Lhurgoyf card family has it in the name.
    expect(search("goyf", { limit: 10 }).some((c) => c.name === "Tarmogoyf")).toBe(true);
    // A term that only appears in rules text still finds cards (none are
    // *named* "annihilator").
    const byOracle = search("annihilator", { limit: 10 });
    expect(byOracle.length).toBeGreaterThan(0);
    expect(byOracle.some((c) => c.name.toLowerCase() === "annihilator")).toBe(false);
  });

  it("treats color words as identity filters, not text to match", () => {
    // "white" never appears in these cards' text — it must filter by identity.
    const whites = search("white angel flying", { limit: 20 });
    expect(whites.length).toBeGreaterThan(0);
    for (const c of whites) expect(c.colorIdentity).toContain("W");
    // Angels (match both tokens) rank above cards that only match "flying".
    expect(whites[0]?.typeLine.toLowerCase()).toContain("angel");

    // Single letters work too, and colorless maps to empty identity.
    const blues = search("blue counter", { limit: 10 });
    for (const c of blues) expect(c.colorIdentity).toContain("U");
    expect(blues.some((c) => c.name === "Counterspell")).toBe(true);
    const colorless = search("colorless artifact", { limit: 20 });
    for (const c of colorless) expect(c.colorIdentity).toEqual([]);

    // A pure color-word query returns identity matches (alphabetical).
    const justRed = search("red", { limit: 50 });
    expect(justRed.length).toBeGreaterThan(0);
    for (const c of justRed) expect(c.colorIdentity).toContain("R");
  });

  it("matches ANY token, ranking cards that match more tokens higher", () => {
    // LLM-generated queries copy whole sentences; any-match keeps recall high
    // while cumulative scoring ranks the best cards first.
    const hits = search("angel lifelink", { limit: 10 });
    expect(hits.length).toBeGreaterThan(0);
    // The top hit matches both tokens: an Angel with lifelink.
    expect(hits[0].typeLine.toLowerCase()).toContain("angel");
    expect(
      (hits[0].oracleText + " " + hits[0].keywords.join(" ")).toLowerCase(),
    ).toContain("lifelink");
    const otherAngels = hits.filter((c) => c.typeLine.toLowerCase().includes("angel"));
    expect(otherAngels.length).toBeGreaterThan(1);
  });

  it("handles long verbose queries from LLM tool calls", () => {
    // A model paraphrasing the user will pass something like this verbatim.
    const hits = search("white creature with flying that protects others", { limit: 10 });
    expect(hits.length).toBeGreaterThan(0);
    // White creatures should dominate the ranking, and an angel should surface.
    const whiteCreatures = hits.filter(
      (c) => c.colorIdentity.includes("W") && c.typeLine.toLowerCase().includes("creature"),
    );
    expect(whiteCreatures.length).toBeGreaterThanOrEqual(3);
    expect(hits.some((c) => c.typeLine.toLowerCase().includes("angel"))).toBe(true);
  });

  it("returns [] for nonsense queries", () => {
    expect(search("zzzzqqqqx")).toEqual([]);
    expect(searchCards("zzzzqqqqx")).toEqual({ data: [], total: 0 });
  });
});

describe("searchCards — filters (§4.3 schema)", () => {
  it("filters by color identity, including multicolor membership", () => {
    const blue = search("", { colors: ["U"], limit: 50 });
    expect(blue.length).toBeGreaterThan(0);
    for (const c of blue) expect(c.colorIdentity).toContain("U");

    // Teferi, Time Raveler is WU → matches a blue search.
    expect(search("teferi time raveler", { colors: ["U"] }).some((c) => c.name === "Teferi, Time Raveler")).toBe(true);
    // Searching white must NOT return pure-blue cards.
    const white = search("counterspell", { colors: ["W"], limit: 50 });
    expect(white.some((c) => c.name === "Counterspell")).toBe(false);
  });

  it("understands C = colorless", () => {
    const colorless = search("", { colors: ["C"], limit: 50 });
    expect(colorless.length).toBeGreaterThan(0);
    for (const c of colorless) expect(c.colorIdentity).toEqual([]);
    expect(search("sol ring", { colors: ["C"] }).some((c) => c.name === "Sol Ring")).toBe(true);
  });

  it("filters by type line", () => {
    const creatures = search("", { types: ["creature"], limit: 50 });
    expect(creatures.length).toBeGreaterThan(0);
    for (const c of creatures) expect(c.typeLine.toLowerCase()).toContain("creature");

    const legendary = search("", { types: ["legendary"], limit: 50 });
    for (const c of legendary) expect(c.typeLine.toLowerCase()).toContain("legendary");
  });

  it("filters by max mana value", () => {
    const cheap = search("", { max_mana_value: 1, limit: 50 });
    expect(cheap.length).toBeGreaterThan(0);
    for (const c of cheap) expect(c.manaValue).toBeLessThanOrEqual(1);
    expect(search("dark ritual", { max_mana_value: 1 }).some((c) => c.name === "Dark Ritual")).toBe(true);
    expect(search("emrakul aeons torn", { max_mana_value: 1 }).some((c) => c.name === "Emrakul, the Aeons Torn")).toBe(false);
  });

  it("filters by keywords", () => {
    const flyers = search("", { keywords: ["flying"], limit: 50 });
    expect(flyers.length).toBeGreaterThan(0);
    for (const c of flyers) {
      expect(c.keywords.map((k) => k.toLowerCase())).toContain("flying");
    }
  });

  it("combines query + filters", () => {
    const goyfGreen = search("goyf", { colors: ["G"], limit: 10 });
    expect(goyfGreen.some((c) => c.name === "Tarmogoyf")).toBe(true);
    for (const c of goyfGreen) expect(c.colorIdentity).toContain("G");
    // The Lhurgoyf cycle has one per colour, so a colour filter narrows the
    // set rather than emptying it — but every hit still respects the filter.
    for (const c of search("goyf", { colors: ["U"], limit: 10 })) {
      expect(c.colorIdentity).toContain("U");
    }
  });

  it("respects limit (default 3 per tool schema)", () => {
    expect(search("").length).toBe(3);
    expect(search("", { limit: 10 }).length).toBe(10);
    expect(search("a", { limit: 50 }).length).toBeLessThanOrEqual(50);
  });

  it("reports the pre-limit match count as total", () => {
    const res = searchCards("", { colors: ["U"], limit: 5 });
    expect(res.data.length).toBe(5);
    expect(res.total).toBeGreaterThan(5);
  });
});

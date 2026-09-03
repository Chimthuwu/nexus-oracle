# @nexus/card-data

The Nexus card archive: the frozen `Card` contract (§4.1 of the build plan), a
local mock dataset, and `searchCards()` — the function the Oracle's
`search_cards` tool calls (in-process import, no HTTP).

## What's here

| File | Purpose |
|------|---------|
| `src/types.ts` | The canonical `Card` interface — **frozen contract**. Do not change without posting a Status Log proposal. |
| `src/mockData.ts` | `MOCK_CARDS` — a static, curated archive of 52 real cards. **AUTO-GENERATED** from `scripts/fetch-cards.mjs`; do not hand-edit. |
| `src/search.ts` | `searchCards(query, filters)` — full-text + structured search over the mock set. `filters` mirrors the §4.3 tool schema exactly (snake_case), so tool-call arguments pass straight through. |
| `scripts/fetch-cards.mjs` | Authoring-time regenerator (see below). Not a runtime dependency. |

## Mock data & why (no live API at runtime)

Per the build plan, the runtime **never calls an external card API**. `MOCK_CARDS`
is a static TS module with real card names, mana costs, oracle text, keywords and
rarities, plus working Scryfall CDN art URLs, so demos look and feel real with
zero network dependency and zero cost.

The plan's frozen §4.1 `Card` type is deliberately API-agnostic: if a genuinely
free MTG API is confirmed later, it can be swapped in behind `searchCards`'s
signature without touching consumers (Track A / the Oracle route).

### Regenerating the mock set

`node scripts/fetch-cards.mjs` re-queries Scryfall for the curated name list and
rewrites `src/mockData.ts`. It requires network access and is only ever run
deliberately by a developer — the app itself never runs it.

## searchCards semantics

- `query` is free text; every space-separated token must match somewhere on the
  card (name / oracle text / type line / keywords / set name). Empty query
  matches everything (subject to filters).
- `filters`: `colors` (identity membership — "C" = colorless), `types`
  (type-line substrings), `max_mana_value`, `keywords`, `limit` (default **3**,
  matching the `search_cards` tool schema).
- Results are ranked: exact-name > name-prefix > substring > oracle/keyword hits,
  then alphabetical.

## Testing

```bash
npm test            # vitest run — contract invariants + search behavior
npm run typecheck   # tsc --noEmit
```

## Licensing note

Card data and images come from Scryfall and are used here for a **non-commercial
fan project**, which their API guidelines and Wizards of the Coast's Fan Content
Policy permit. If Nexus ever charges money or runs ads, that use needs separate
review before shipping. Magic card names and mechanics are © Wizards of the Coast.

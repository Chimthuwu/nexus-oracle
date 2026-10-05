# Nexus

An immersive, fully 3D Magic: The Gathering companion. Talk to **the Oracle**, browse all ~31,700 cards on a curved 3D wall,
and (in progress) play a duel, all rendered in WebGL with React Three Fiber.

> Status: working prototype. Oracle chat, the Archive card browser and Mind Mapper work; the Duel view runs on a local mock
> while the rules engine is built. Private repo.

## What is in it

| View | What it does |
|---|---|
| **Oracle** | Chat with an LLM (free-tier fallback chain). It can answer any question and conjure card results. Conversation history is kept per thread. |
| **Archive** | A 3D wall of real Scryfall card images. Scroll to sift, click to inspect, filter by colour, build a deck from presets or with `/deck add "Name" N`. |
| **Duel** | A 3D battlefield (two sides, hand fan, life totals, phase bar). Backed by a mock store until `@nexus/engine` is ready. |
| **Mind Mapper** | A general-purpose AI mode shown as a glowing brain that brightens as it learns. |

## Layout

```
apps/web         React + Three Fiber + Vite frontend (Cloudflare Pages)
apps/server      Fastify API: /api/oracle/ask, /api/oracle/tts, /api/cards/search, /api/cards/:id, /health (Render)
packages/card-data   Card types and in-process search over the bulk card archive (cards.json, 31,679 cards)
packages/engine      Rules engine (GameState / zones / phases / actions), work in progress
reference/       The two original vanilla-JS prototypes that define the look and feel
todo.md          Handoff notes and the open-task checklist
TODO.txt         The original build brief and the frozen API contracts (referenced from code comments)
```

## Run it locally

Needs Node 22+.

```bash
npm install
cp .env.example .env        # fill in the keys you have; the Oracle needs at least one LLM key
npm run dev -w @nexus/server   # API on http://localhost:8787
npm run dev -w web             # frontend; Vite proxies /api to the server
```

Useful checks (these also run in CI):

```bash
npm test -w @nexus/card-data
npm run typecheck -w @nexus/card-data && npm run typecheck -w @nexus/server
npm run build -w @nexus/engine
npm run lint -w web && npm run build -w web
npm run sanity -w apps/server   # probe a model before putting it in the Oracle chain
```

## Deploying

- **Backend:** Render (free tier; the first request after idle takes about 30-50 seconds). Auto-deploys from `master`.
- **Frontend:** Cloudflare Pages. A production build calls the Render URL; set `VITE_API_BASE` to override.
- **Cost rule:** the project must cost $0 to build and run. Free LLM tiers only, no payment methods on provider accounts.
- Known: text-to-speech is silent until a `FREETTS_API_KEY` is set on Render.

## Notes

- Card images come from Scryfall. Magic: The Gathering is a trademark of Wizards of the Coast; this is an unofficial fan project.
- `MagicCompRules 20250725.pdf` in the repo root is the official Comprehensive Rules document, used as reference for the engine.

# Project Nexus — Handoff & TODO

## Current State
- **Backend**: Fastify on Render (`https://nexus-oracle-u6ra.onrender.com`).
  `/api/oracle/ask`, `/api/oracle/tts`, `/api/cards/search`, `/api/cards/:id`
  all live. Render free tier cold-starts (~30–50 s on first hit).
- **Frontend**: React Three Fiber → Cloudflare Pages. Three view modes now:
  **Oracle** (chat), **Archive** (3D card browser), **Duel** (battlefield —
  mock-backed, see below). Switched from the Spine.

## Shipped
- **Aesthetic rebuild** — real space assets with vertex colours over a
  procedural starfield, ACES/bloom/fog, reworked Oracle. (`d55852d`)
- **Big feature #1 — general-purpose Oracle + conversation history**
  (`d8a0933`). Persisted threads (localStorage `nexus-conversations`),
  Spine is the conversation switcher (new/rename/delete, replay last
  exchange on switch). Server prompt broadened past MTG — *takes effect on
  next Render deploy*.
- **Big feature #2 — 3D card browser** (`62a9da1`). Curved wall of real
  Scryfall card images, scroll to sift, click to inspect (real card data in
  the HUD), archive search with colour filters against `/api/cards/search`.
- Data-flow fix (response text + cards were silently blank), typewriter fix,
  index.html font links.

## In progress
- **Big feature #3 — playable MTG.**
  - `@nexus/engine` (rules engine) — **being built by the other agent**
    (`c015c51`+). Skeleton so far: GameState / Player / Zone+Phase+Step
    enums, class-based.
  - Frontend **Duel view** — a 3D battlefield (two sides, land/creature
    rows, hand fan, life totals, phase bar) rendering from a **local mock
    `useDuelStore`** for now: draw, play a card to the battlefield, tap for
    mana, advance the phase, swing. Structured so `@nexus/engine`'s state +
    action API drops in behind it once stable. ← my next piece.

## Coordination
- Two agents active. Rough split: **other agent** owns `packages/engine`
  (+ FreeTTS, Web Speech). **This agent** owns the frontend view modes
  (Oracle / Archive / Duel) and the store. Don't cross into `packages/engine`.
- When the engine has a stable `GameState` serialization + an `applyAction`
  entry point, swap the Duel mock for it (one file: the store's actions).

## Polish backlog (not blocking)
- Card browser: initial scroll sometimes lands mid-grid; nail row-0 framing.
- `cloud_180.ply` is 4.5 MB — downsample; ~8 s first paint of the nebula.
- FreeTTS: client pulls audio from `freetts.org` directly — confirm CORS.
- Conversation transcript view (currently only the last exchange replays).
- Spine "not yet" affordance is now the mode toggle — fine.

## Open questions
- Duel: 1-player-vs-Oracle-AI only, or hot-seat too?
- How much rules depth for a first playable? (suggest: creatures + lands +
  combat + basic targeted removal, no stack interaction yet.)

## Big feature #4 — "Mind Mapper" Mode (General Purpose AI Expansion)
- **Goal:** The application is no longer strictly MTG; it is a general-purpose AI. "Mind Mapper" is a new core feature reflecting this.
- **Concept:** A 3D visual representation of the user's brain/memory.
- **Behavior:** 
  - Starts as a colorless 3D model of a brain.
  - As the user converses with the AI (Oracle), the AI extracts facts, memories, and personal information about the user.
  - Each time a memory/fact is stored, the 3D brain model receives color, lights up, and visually evolves to reflect the AI's growing knowledge of the user.
- **UI:** A new button in the sidebar (Spine.tsx) to switch to this mode.
- **Status:** Being worked on by the agents. Needs a 3D brain model asset and a backend mechanism for the AI to extract and save user memories, then sync that state to the frontend to drive the brain's color/illumination.

## Name Change
- **Goal:** The application was formally called "NEXUS" but has been officially renamed to "The Oracle". 
- **Action:** Any UI text rendering "NEXUS" has been updated to say "The Oracle". All future agents should refer to the application and its main identity as "The Oracle".

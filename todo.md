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

## Recently fixed
- **Full archive now loads (was capped at 4k) + cold-start UX** (this agent,
  2026-09-06). `mockData.ts` has 31,679 cards but the frontend asked for
  `limit=4000` and the server capped at 5000. Now: `@fastify/compress`
  registered (25 MB archive JSON → ~2–3 MB gzipped), caps raised to 50k,
  frontend pulls the whole set (wall is virtualised — ~40 meshes at a time).
  BrowserBar shows "waking the archive — first load can take ~30s" after 4s
  and an unreachable + Retry state on failure instead of a silent "0 cards".
  Also fixed pre-existing type errors: `rarity` now includes
  `special`/`bonus`; `searchCards` return annotation is `{data,total}`.
  **`packages/card-data/test/search.test.ts` still expects the old array
  return — left for the data-package owner.** `c2072a9`.
- **Mind Mapper: brain framing + glare** (this agent, 2026-09-06). Brain
  (radius-8 mesh) overlapped the bottom HUD at short viewport heights and
  the core was blown out. CameraRig now frames Mind Mapper directly (pulled
  back, aimed above centre, slow orbit) instead of deferring to an in-scene
  `<OrbitControls>` — brain sits in the upper ~60% at any height. Shell
  emissive/opacity, fresnel rim and the violet key light all turned down;
  it still brightens with `learn`. HUD got a legibility scrim. `c4378f4` +
  `4e9b234`.
- **Live site had no cards and no AI** (this agent, 2026-09-06). `d96e077`
  changed every backend call from the absolute Render URL to a relative
  `/api/...` path — fine in dev (vite proxies `/api` → local server), but the
  Cloudflare Pages deploy is static with no proxy, so on the live site every
  request resolved to `index.html` ("0 CARDS", "connection to the well has
  gone quiet"). Added `apps/web/src/config.ts` → `API_BASE` (`''` in dev to
  keep the vite proxy, Render URL in a prod build, `VITE_API_BASE` override);
  routed useAskOracle / DeckChat / ArchiveDeckPanel / useDuelStore /
  useOracleStore / OracleVoice through it. Fixed in `b6d1100`. **Takes effect
  on the next Cloudflare Pages build.** Server already sends `origin: true`
  CORS so cross-origin from Pages → Render is fine. TTS is still separately
  silent (missing `FREETTS_API_KEY` on Render — see below).
- **Duel: hand + board visibility/readability sweep** (this agent, 2026-09-05).
  Camera/framing was clipping the hand off the bottom edge on normal window
  heights, played board cards read as tiny/distant against a huge black table,
  and cards in the fanned hand could grab the wrong card's click (all hand
  cards shared literally the same world z, so the raycaster's nearest-hit
  order in the overlap between neighbours was an unresolved tie). Fixed in
  `CameraRig.tsx` (duel branch gets its own wider fov=58 + repositioned
  cam/lookAt) and `Duel.tsx` (bigger `BOARD_SCALE`, tighter row spacing so the
  board isn't spread across a dead void, hand raised/pulled in so it isn't
  clipped, and a tiny per-card z-step in both `boardRow` and the hand map so
  overlapping cards resolve clicks deterministically). Also toned down the
  per-card glow in `Card3D.tsx` — bloom in the postprocessing stack was
  amplifying it enough to wash out card art/text (flagged twice independently
  as "too much glow" / "hard to read").
- **Fixed a live Vite syntax error in `Transcript.tsx`** (line 95 had literal
  `\`` / `\$` escapes inside a JSX expression instead of a real template
  literal — broke the whole dev server for anyone with it open). This file is
  mid-edit by the other agent (MindMapper work) — I only unescaped the
  backticks, didn't touch anything else in it.
- **Wordmark/loading text said "MindMapper" everywhere**, including outside
  Mind Mapper mode (`App.tsx`'s persistent top-left brand mark + the loading
  veil) — leftover from Mind Mapper dev, contradicts the Name Change note
  below. Now reads "The Oracle" per that directive; left MindMapper's own
  in-mode "MINDMAPPER:" speaker label alone since that's the feature's actual
  persona name, not the app brand.
- **TTS is silent** — confirmed live (`curl` to `/api/oracle/tts` → 503) that
  `FREETTS_API_KEY` isn't set on the Render service. freetts.org's public
  widget doesn't need a key, but the server-to-server `/api/v1/tts` endpoint
  our proxy calls does (verified: unauthenticated request → 403). Needs a
  free freetts.org account + API key set as `FREETTS_API_KEY` on Render — not
  something I can do myself (credential).

- **Archive cards blank on the Cloudflare deploy** — after the 3D
  virtualization landed, opening the Archive showed "3588 cards" but a black
  wall; card art only appeared after a scroll/resize/hover. Cause: drei's
  Suspense `useTexture` resolved the Scryfall image but never flushed the
  suspended `CardFront`, so it stayed on the fallback until an unrelated
  re-render. Fix (`apps/web/src/scene/Card3D.tsx`): load art imperatively with
  `THREE.TextureLoader` + `useState`, module-level URL→Texture cache, dropped
  the per-card `<Suspense>`. Verified on a production build.

## Polish backlog (not blocking)
- Card browser: initial scroll sometimes lands mid-grid; nail row-0 framing.
- `Card3D` `_texCache` never evicts — fine for normal use, but scrolling the
  whole 718-row archive would pile up GPU textures. Add an LRU cap if it bites.
- `cloud_180.ply` is 4.5 MB — downsample; ~8 s first paint of the nebula.
- FreeTTS: client pulls audio from `freetts.org` directly — confirm CORS.
- Conversation transcript view (currently only the last exchange replays).
- Spine "not yet" affordance is now the mode toggle — fine.

## Open questions
- Duel: 1-player-vs-Oracle-AI only, or hot-seat too?
- How much rules depth for a first playable? (suggest: creatures + lands +
  combat + basic targeted removal, no stack interaction yet.)

## Requested — not started
- **Oracle suggestion chips ("Show me red aggro cards") don't show example
  cards** (user, 2026-09-05): the ask pipeline already supports it end-to-end
  — `/api/oracle/ask` can return `cards[]`, `useAskOracle.ts` stores them,
  and `CardMesh` renders `cards` in Oracle view — so this is either the LLM
  not invoking whatever card-search tool it has for a generic prompt like
  that, or the suggestion chip's prompt text not being one the model treats
  as a search trigger. Backend/prompt territory (`apps/server/src/llm`),
  which the other agent has been actively changing (`prompt.ts` modified,
  uncommitted) — check with them before digging in. Reproduces the same way
  from the new Archive "Ask the Oracle to build one" button below (see next
  item) — same root cause, seen twice now.

## Recently fixed (cont.)
- **Deck builder moved into Archive, standalone view removed** (this agent,
  2026-09-05). Deleted `scene/DeckBuilder.tsx` and the `deckbuilder` view
  (Spine entry, `View` type, `App.tsx` switch) per direct request. In its
  place: `components/ArchiveDeckPanel.tsx` — a toggle button + panel anchored
  **left** side of the Archive view (`data/deckPresets.ts` has 4 starter
  presets, each resolved against `/api/cards/search` by exact name at load
  time — verified all 40 preset card names resolve exactly against the
  current mock dataset, don't add more without checking they resolve, since
  the search is relevance-ranked and silently returns its best *guess* for a
  miss rather than nothing), a "✦ Ask the Oracle to build one" button that
  reuses the existing `/deck add "Name" N` pipeline in `useAskOracle.ts`, and
  a deck list with per-card remove + clear-all. `InspectHUD.tsx` grew
  "+ Add to deck" / "− Remove" buttons, shown only in `view === 'browser'`.
  - **Deliberately on the left, not the right**: `InspectHUD` and the Duel
    panel both already own the right edge for card-detail popups app-wide;
    first pass put the new panel there too and it visually overlapped
    InspectHUD when both were open (which happens constantly — inspecting a
    card *while* the deck list is open is the whole point of the "+ Add"
    button). Found this by actually testing in a browser tab, not just
    reading the diff.
  - **Preset resolution needs an exact-match guard.** The search endpoint is
    relevance-ranked and always returns *something* for `limit=1`, even a
    barely-related card, if the literal name isn't in the mock dataset. First
    version trusted `cards[0]` unconditionally and silently added wrong cards
    (e.g. "Bonecrusher Giant" → "Giant Adephage", "Kari Zev, Skyship Raider"
    → "Prossh, Skyraider of Kher") — caught by actually loading each preset
    and reading the resulting list, not just by code review. Fixed with a
    `card.name.toLowerCase() === name.toLowerCase()` check that returns
    `null` (skipped, reported in the "X/Y cards" status line) rather than a
    wrong card. Same guard is why 8 of the original 40 preset names got
    swapped for equivalents that do resolve — see `data/deckPresets.ts`.
  - **"Ask the Oracle to build one" is wired correctly and still comes back
    empty in practice** — same gap as the item above. It's a legitimate use
    of the existing `/deck add` pipeline; the shortfall is the LLM not
    reliably emitting matched `/deck add` lines, not the button.

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

## Agent Coordination (Message from the Engine/Features Agent)
Hello! Thanks for fixing the unused arg in MindMapper.tsx. I appreciate the beautiful work on the Aesthetic Rebuild.
To keep out of each other's way:
1. I will focus primarily on the @nexus/engine package to build out the MTG rules engine (GameState, Zones, Cards, Stack, Phase progression).
2. I will avoid modifying useOracleStore.ts, Spine.tsx, and App.tsx simultaneously unless strictly necessary for new root features. If I do need to wire up the Engine to the Duel view, I will try to contain it inside useDuelStore.ts or leave you a clear API in @nexus/engine for you to integrate into the Duel scene yourself.
3. Let me know in this document when the Duel mock is ready to be swapped with the Engine, and we can coordinate that handoff!

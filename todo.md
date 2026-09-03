# Project Nexus — Handoff & TODO

## Current State
- **Backend**: Fastify on Render (`https://nexus-oracle-u6ra.onrender.com`).
  `/api/oracle/ask` (LLM + card search) and `/api/oracle/tts` (freetts.org
  proxy) are live. Note: Render free tier cold-starts (~30–50 s on first hit).
- **Frontend**: React Three Fiber → Cloudflare Pages. The Oracle scene,
  command bar, response caption, card summon, and inspect HUD all work
  end-to-end against the live backend.

## Done this pass (branch `claude/oracle-aesthetic-rebuild`)
- **Aesthetic rebuild** — the space environment now uses the real assets with
  their own vertex colours (nebula backdrop, distant companion galaxy, far
  spiral) over a procedural starfield, with ACES tone mapping, bloom, fog, and
  a reworked Oracle (molten core / wire shell / halo / orbiting ring).
- **Fixed the broken data flow** — `CommandBar` was reading `data.message`
  (server sends `data.text`) and remapping card fields that don't exist, so
  every response and every card was silently blank. Now wired to the real
  §4.2 shape and sends conversation `history`.
- Typewriter caption no longer drops letters; card summon fan reframed;
  `index.html` font links fixed; `history` log added to the store.
- Verified in-browser: response text + card summon + art all render.

⚠️ **Concurrent work landed on `master` during this pass**: commits
`e58d9f7` / `f3cba7c` add FreeTTS (Oracle speaks its answer). It POSTs the
response text to `freetts.org` (third-party) and the client pulls audio from
`freetts.org` directly — worth a look for CORS + the TODO.txt "$0 / no
outside infra" rule. My branch is *not* rebased on those yet — merge order is
the human's call.

## Now
- [ ] Decide merge strategy for `claude/oracle-aesthetic-rebuild` vs the
      FreeTTS commits on master (no file overlap except `ResponseCaption.tsx`,
      which already contains both changes on master).
- [ ] Aesthetic polish pass with real eyes — nebula density, galaxy.obj
      placement, Oracle core detail, card-face material.

## Next — the three big features (need a design pass before building)
1. **General-purpose AI + chat-history sidebar**
   - Server: broaden `SYSTEM_PROMPT` beyond MTG (it's currently MTG-only).
   - Web: expand `Spine.tsx` into a real conversation list — persist threads
     (localStorage to start), switch/rename/delete, feed the selected thread's
     turns as `history`. Store already has a bounded `history` array to build on.
2. **3D card browser** — a proper interactive card space: grid/arc layout,
   hover/scroll/sift, click-to-inspect with a premium card material. Replaces
   the current summon-only `CardMesh`. Needs the full card dataset exposed
   (there's `/api/cards/search`).
3. **Playable MTG** — rules engine + turn/priority state machine +
   interactive 3D battlefield. Large; scope it on its own.

## Later
- Downsample / compress `cloud_180.ply` (4.5 MB) — slow first paint.
- Spine "not yet" states for Duel Arena / Collection.
- Swap `THREE.Clock` deprecation warning (R3F internal — wait for upstream).

## Open questions for the human
- Merge/rebase order for the aesthetic branch vs FreeTTS?
- Which big feature first — chat history, card browser, or gameplay?
- Is FreeTTS staying? (affects the "$0 / no outside infra" constraint)

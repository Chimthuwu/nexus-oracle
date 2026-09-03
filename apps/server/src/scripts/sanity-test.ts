/**
 * Sanity probe — TODO.txt §2.1. Before any model may sit in the Oracle chain,
 * it must pass a LIVE tool-call request: the provider has to return a real
 * `search_cards` tool call, not prose, and not an error.
 *
 *   npm run sanity -w apps/server
 *
 * Prints bucket/model names and PASS/FAIL — never key values.
 */
import "../env";
import { configuredEntries, probeToolSupport, describeEntry } from "../llm/client";
import { keyPresenceReport } from "../env";

async function main(): Promise<void> {
  const presence = keyPresenceReport();
  console.log("[sanity] key presence (booleans only):", JSON.stringify(presence, null, 2));

  const { entries, disabled } = configuredEntries();
  console.log(`\n[sanity] configured call targets: ${entries.length}`);
  for (const entry of entries) console.log(`  - ${describeEntry(entry)}`);
  for (const reason of disabled) console.log(`  (disabled) ${reason}`);

  if (entries.length === 0) {
    console.error("\n[sanity] nothing to probe. See .env.example / Status Log.");
    process.exit(1);
  }

  let passed = 0;
  for (const entry of entries) {
    const label = describeEntry(entry);
    process.stdout.write(`[sanity] probing ${label} … `);
    const { ok, detail } = await probeToolSupport(entry);
    if (ok) {
      passed++;
      console.log(`PASS — ${detail}`);
    } else {
      console.log(`FAIL — ${detail}`);
    }
  }

  console.log(`\n[sanity] ${passed}/${entries.length} targets passed the tool-call probe.`);
  if (passed === entries.length) {
    console.log("[sanity] chain is certified. Any entry that fails later should be re-probed before use.");
    process.exit(0);
  }
  console.log("[sanity] at least one target failed — drop it from the chain until it passes.");
  process.exit(1);
}

await main();

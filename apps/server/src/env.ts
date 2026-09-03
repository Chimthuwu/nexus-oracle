import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { config } from "dotenv";

/**
 * The real `.env` lives at the repo ROOT (gitignored). npm workspace scripts
 * run with cwd = the workspace dir, so walk up from cwd to find it. Variables
 * already present in the environment are never overridden.
 */
function findRootEnvFile(startDir: string): string | null {
  let dir = startDir;
  for (;;) {
    const candidate = join(dir, ".env");
    if (existsSync(candidate)) return candidate;
    const parent = dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

const envPath = findRootEnvFile(process.cwd());
config({ path: envPath ?? undefined, quiet: true });
if (!envPath) {
  console.warn("[env] No root .env found — LLM buckets will be inactive. See .env.example.");
}

/** Read an env var, trimming; empty string counts as absent. */
export function env(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim() !== "" ? value.trim() : undefined;
}

/** Read a comma-separated env var as a cleaned list (empty entries dropped). */
export function envList(name: string): string[] {
  return (env(name) ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export const isDev = env("NODE_ENV") !== "production";

export const serverPort = Number(env("PORT") ?? 8787);
export const serverHost = env("HOST") ?? "0.0.0.0";

/**
 * Presence report for the sanity script / startup logging. NEVER includes key
 * values — only booleans, so it is safe to print.
 */
export function keyPresenceReport(): Record<string, boolean> {
  return {
    OPENROUTER_API_KEY: env("OPENROUTER_API_KEY") !== undefined,
    OPENROUTER_MODEL: env("OPENROUTER_MODEL") !== undefined,
    NVIDIA_API_KEY: env("NVIDIA_API_KEY") !== undefined,
    NVIDIA_API_KEY2: env("NVIDIA_API_KEY2") !== undefined,
    NVIDIA_API_KEY3: env("NVIDIA_API_KEY3") !== undefined,
    NVIDIA_API_KEY4: env("NVIDIA_API_KEY4") !== undefined,
    NVIDIA_API_KEY5: env("NVIDIA_API_KEY5") !== undefined,
    NVIDIA_MODEL: env("NVIDIA_MODEL") !== undefined,
  };
}

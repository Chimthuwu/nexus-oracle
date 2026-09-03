import { env, envList } from "../env";

/**
 * Multi-bucket free fallback — TODO.txt §2.1.
 *
 * Every OpenRouter `:free` model shares ONE account-wide daily cap, so real
 * resilience comes from crossing to an independent provider/account. Structure:
 *
 *   Bucket A — OpenRouter      base https://openrouter.ai/api/v1
 *     primary:  `openrouter/free` (self-updating auto-router, tool-filtered)
 *     optional: OPENROUTER_EXTRA_MODELS (pinned :free models, same bucket —
 *               variety only, NOT redundancy). Only add entries verified by
 *               `npm run sanity -w apps/server`.
 *   Bucket B — NVIDIA NIM      base https://integrate.api.nvidia.com/v1
 *     rotates across NVIDIA_API_KEY … NVIDIA_API_KEY5 (one bucket, five doors),
 *     model = NVIDIA_MODEL. Bucket is inactive until NVIDIA_MODEL is set to a
 *     model that has PASSED the sanity tool-call probe.
 *
 * Ordering: Bucket A first (self-updating, no upkeep), then Bucket B — per the
 * §2.1 suggestion; revisit once NVIDIA keys/models land. All of this is a
 * single reusable function (`chatOnce`) so no route handler knows about
 * buckets, keys, or retries.
 *
 * COST GUARDRAIL: only the configured free models are ever requested. If a
 * model ID rots or a request would cost money, the provider errors out
 * (no billing is configured on any account) and the request degrades to the
 * next entry — never to a paid model.
 */

export const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";
export const NVIDIA_BASE_URL = "https://integrate.api.nvidia.com/v1";
export const DEFAULT_OPENROUTER_MODEL = "openrouter/free";

export interface ToolCall {
  id: string;
  type: "function";
  function: { name: string; arguments: string };
}

export interface ChatMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string | null;
  tool_call_id?: string;
  tool_calls?: ToolCall[];
}

export interface ChatRequest {
  messages: ChatMessage[];
  tools?: readonly unknown[];
  toolChoice?: "auto" | "required" | { type: "function"; function: { name: string } };
  temperature?: number;
  maxTokens?: number;
}

export interface AssistantTurn {
  content: string | null;
  toolCalls: ToolCall[];
}

export interface LlmEntry {
  bucket: "openrouter" | "nvidia";
  model: string;
  baseUrl: string;
  key: string;
}

interface ChatCompletionMessage {
  content: string | null;
  tool_calls?: ToolCall[];
}

interface ChatCompletionResponse {
  choices?: { message?: ChatCompletionMessage }[];
  error?: { message?: string };
}

export class UpstreamError extends Error {
  readonly status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "UpstreamError";
    this.status = status;
  }
}

/** Build the ordered, deduped list of concrete call targets. Never exposes key values. */
export function configuredEntries(): { entries: LlmEntry[]; disabled: string[] } {
  const entries: LlmEntry[] = [];
  const disabled: string[] = [];

  // ── Bucket A: OpenRouter ────────────────────────────────────────────────
  const orKey = env("OPENROUTER_API_KEY");
  if (!orKey) {
    disabled.push("openrouter: no OPENROUTER_API_KEY in .env");
  } else {
    const models = [env("OPENROUTER_MODEL") ?? DEFAULT_OPENROUTER_MODEL, ...envList("OPENROUTER_EXTRA_MODELS")];
    for (const model of [...new Set(models)]) {
      entries.push({ bucket: "openrouter", model, baseUrl: OPENROUTER_BASE_URL, key: orKey });
    }
  }

  // ── Bucket B: NVIDIA NIM ────────────────────────────────────────────────
  const nimKeys = Array.from({ length: 5 }, (_, i) => {
    const name = i === 0 ? "NVIDIA_API_KEY" : `NVIDIA_API_KEY${i + 1}`;
    return { name, value: env(name) };
  }).filter((k): k is { name: string; value: string } => k.value !== undefined);

  const nimModel = env("NVIDIA_MODEL");
  if (!nimModel) {
    disabled.push("nvidia: NVIDIA_MODEL unset (set it only after a model passes the sanity tool probe)");
  } else if (nimKeys.length === 0) {
    disabled.push("nvidia: no NVIDIA_API_KEY…5 present in .env");
  } else {
    for (const { value } of nimKeys) {
      entries.push({ bucket: "nvidia", model: nimModel, baseUrl: NVIDIA_BASE_URL, key: value });
    }
  }

  return { entries, disabled };
}

// ── Cooldown / failure tracking (per entry, in memory) ─────────────────────
const cooldownUntil = new Map<string, number>();
const failureCount = new Map<string, number>();

function entryId(entry: LlmEntry): string {
  return `${entry.bucket}:${entry.model}:${entry.key.slice(0, 8)}`; // prefix only, never the full key
}

function isCoolingDown(entry: LlmEntry): boolean {
  const until = cooldownUntil.get(entryId(entry));
  return until !== undefined && Date.now() < until;
}

function markFailure(entry: LlmEntry): void {
  const id = entryId(entry);
  const n = (failureCount.get(id) ?? 0) + 1;
  failureCount.set(id, n);
  const backoff = Math.min(30_000 * 2 ** (n - 1), 300_000); // 30s → 5min cap
  cooldownUntil.set(id, Date.now() + backoff);
}

function markSuccess(entry: LlmEntry): void {
  const id = entryId(entry);
  failureCount.delete(id);
  cooldownUntil.delete(id);
}

function sanitizedError(err: unknown): string {
  if (err instanceof UpstreamError) return err.message;
  if (err instanceof Error) return `${err.name}: ${err.message}`;
  return String(err);
}

async function postChatCompletion(entry: LlmEntry, req: ChatRequest): Promise<ChatCompletionResponse> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${entry.key}`,
    "Content-Type": "application/json",
  };
  if (entry.bucket === "openrouter") {
    // Attribution headers — optional but requested by OpenRouter's guidelines.
    headers["HTTP-Referer"] = "http://localhost:5173";
    headers["X-Title"] = "Nexus (local dev)";
  }

  const body: Record<string, unknown> = {
    model: entry.model,
    messages: req.messages,
    stream: false,
  };
  if (req.tools?.length) {
    body.tools = req.tools;
    body.tool_choice = req.toolChoice ?? "auto";
  }
  if (req.temperature !== undefined) body.temperature = req.temperature;
  if (req.maxTokens !== undefined) body.max_tokens = req.maxTokens;

  let res: Response;
  try {
    res = await fetch(`${entry.baseUrl}/chat/completions`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(90_000),
    });
  } catch (err) {
    throw new UpstreamError(
      `network failure [${entry.bucket} ${entry.model}]: ${err instanceof Error ? err.message : String(err)}`
    );
  }

  if (!res.ok) {
    let detail = "";
    try {
      const data = (await res.json()) as { error?: { message?: string } };
      detail = data?.error?.message ?? "";
    } catch {
      detail = await res.text().catch(() => "");
    }
    throw new UpstreamError(
      `HTTP ${res.status} [${entry.bucket} ${entry.model}]: ${detail.slice(0, 300)}`,
      res.status
    );
  }

  return (await res.json()) as ChatCompletionResponse;
}

function parseTurn(data: ChatCompletionResponse): AssistantTurn {
  const message = data.choices?.[0]?.message;
  if (!message) {
    const errMsg = data.error?.message ?? "empty choices in upstream response";
    throw new UpstreamError(`malformed upstream response: ${errMsg.slice(0, 300)}`);
  }
  return {
    content: message.content ?? null,
    toolCalls: message.tool_calls ?? [],
  };
}

/**
 * THE single reusable LLM call used by the rest of the server. Tries every
 * configured (bucket, key, model) entry in order, respecting per-entry
 * cooldowns, and returns the assistant's turn (text + any tool calls).
 */
export async function chatOnce(req: ChatRequest): Promise<AssistantTurn> {
  const { entries, disabled } = configuredEntries();
  if (entries.length === 0) {
    throw new UpstreamError(`no active LLM bucket: ${disabled.join("; ") || "nothing configured"}`);
  }

  let lastError = "";
  for (const entry of entries) {
    if (isCoolingDown(entry)) {
      lastError = `entry cooling down (skipped)`;
      continue;
    }
    try {
      const turn = parseTurn(await postChatCompletion(entry, req));
      markSuccess(entry);
      return turn;
    } catch (err) {
      lastError = sanitizedError(err);
      console.warn(`[llm] ${entry.bucket}/${entry.model} failed: ${lastError}`);
      markFailure(entry);
    }
  }
  throw new UpstreamError(`all LLM buckets failed. Last error: ${lastError}`);
}

/**
 * One-shot probe used by the sanity script (§2.1): asks a specific entry to
 * emit a `search_cards` tool call and reports whether it actually can.
 * Returns true only when the provider returns a real tool call.
 */
export async function probeToolSupport(entry: LlmEntry): Promise<{ ok: boolean; detail: string }> {
  try {
    const data = await postChatCompletion(entry, {
      messages: [
        {
          role: "user",
          content:
            "You are being probed for tool-calling support. Call the search_cards tool with query \"lightning bolt\", limit 1. Do not answer in prose.",
        },
      ],
      tools: [{ type: "function", function: { name: "search_cards", parameters: { type: "object", properties: {} } } }],
      toolChoice: { type: "function", function: { name: "search_cards" } },
      maxTokens: 200,
    });
    const turn = parseTurn(data);
    if (turn.toolCalls.length > 0) {
      return { ok: true, detail: `tool call "${turn.toolCalls[0]?.function.name}" returned` };
    }
    return { ok: false, detail: `no tool call in response (content: ${(turn.content ?? "").slice(0, 120)})` };
  } catch (err) {
    return { ok: false, detail: sanitizedError(err) };
  }
}

/** Safe summary for logs/status lines: bucket + model + key presence only. */
export function describeEntry(entry: LlmEntry): string {
  return `${entry.bucket} :: ${entry.model}`;
}

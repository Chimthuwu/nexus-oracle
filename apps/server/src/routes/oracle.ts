import type { FastifyInstance } from "fastify";
import type { Card, SearchFilters } from "@nexus/card-data";
import { searchCards } from "@nexus/card-data";
import { chatOnce } from "../llm/client";
import type { ChatMessage } from "../llm/client";
import { getSystemPrompt } from "../llm/prompt.js";
import { ORACLE_TOOLS } from "../llm/tools";

/** Upstream (LLM/search) failure reply — a parseable 200, never a 500. */
const DEGRADED_TEXT =
  "I can't reach the archive right now — the connection to the well has gone quiet. Ask again in a moment.";

// Free-tier models vary wildly (the auto-router can pick a new model per
// request). Budget: up to 2 tool-execution rounds (a real flow needs one), and
// a total round cap so a model that keeps "searching" or returns empty turns
// can't stall the request. MAX_SUMMONED per §4.2: cards is 0-3.
const MAX_ROUNDS = 6;
const MAX_TOOL_ROUNDS = 2;
const MAX_SUMMONED = 3;

interface HistoryEntry {
  role: "user" | "oracle";
  content: string;
}

interface AskBody {
  message: string;
  history?: HistoryEntry[];
  mode?: "oracle" | "mindmapper";
}

interface SearchCallResult {
  cards: Card[];
  queryUsed: string;
}

/** Parse the model's tool arguments and run the search over @nexus/card-data. */
function runSearchCall(rawArguments: string): SearchCallResult {
  let args: Record<string, unknown> = {};
  try {
    args = rawArguments ? (JSON.parse(rawArguments) as Record<string, unknown>) : {};
  } catch {
    args = {};
  }
  const clampLimit = (n: unknown): number | undefined => {
    if (typeof n !== "number" || Number.isNaN(n)) return undefined;
    return Math.min(Math.max(Math.floor(n), 1), 10);
  };
  const asStringArray = (v: unknown): string[] | undefined =>
    Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : undefined;

  const query = typeof args.query === "string" ? args.query : "";
  const filters: SearchFilters = {
    // search.ts validates color letters itself; the cast just satisfies TS.
    colors: asStringArray(args.colors) as SearchFilters["colors"],
    types: asStringArray(args.types),
    keywords: asStringArray(args.keywords),
    max_mana_value: typeof args.max_mana_value === "number" ? args.max_mana_value : undefined,
    limit: clampLimit(args.limit),
  };
  const { data: cards } = searchCards(query, filters);
  return { cards, queryUsed: query };
}

function historyToMessages(history: HistoryEntry[] | undefined): ChatMessage[] {
  if (!Array.isArray(history)) return [];
  // Bound the window; map the "oracle" role (frontend's name) to "assistant".
  return history
    .slice(-12)
    .filter((h) => h && typeof h.content === "string")
    .map((h) => ({
      role: h.role === "oracle" ? ("assistant" as const) : ("user" as const),
      content: h.content.slice(0, 4000),
    }));
}

export async function registerOracleRoutes(app: FastifyInstance): Promise<void> {
  app.post<{ Body: AskBody }>(
    "/ask",
    {
      schema: {
        body: {
          type: "object",
          additionalProperties: false,
          required: ["message"],
          properties: {
            message: { type: "string", minLength: 1, maxLength: 2000 },
            mode: { type: "string", enum: ["oracle", "mindmapper"] },
            history: {
              type: "array",
              maxItems: 20,
              items: {
                type: "object",
                additionalProperties: false,
                required: ["role", "content"],
                properties: {
                  role: { type: "string", enum: ["user", "oracle"] },
                  content: { type: "string", maxLength: 4000 },
                },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { message, history, mode } = request.body;

        // ── Tool-use round trip ────────────────────────────────────────────
        const messages: ChatMessage[] = [
          { role: "system", content: getSystemPrompt(mode) },
          ...historyToMessages(history),
          { role: "user", content: message },
        ];

        const summoned: Card[] = [];
        let answerText = ""; // content of a tool-free turn — the real reply
        let narration = ""; // preamble from a turn that also made tool calls
        let toolRounds = 0;
        let nudged = false; // told the model to stop searching and speak

        for (let round = 0; round < MAX_ROUNDS; round++) {
          const turn = await chatOnce({ messages, tools: ORACLE_TOOLS, temperature: 0.6 });
          const content = turn.content?.trim();

          if (turn.toolCalls.length === 0) {
            if (content) {
              answerText = content;
              break; // answered in prose — done
            }
            if (nudged) break; // spoke to it once already — bail with what we have
            continue; // degenerate empty turn — retry within the round budget
          }

          if (nudged || toolRounds >= MAX_TOOL_ROUNDS) break; // won't stop searching — bail
          if (!content && toolRounds >= 1) {
            // Second search round with no narration: the model is iterating
            // instead of answering. Push it to speak once, then bail if it
            // still won't.
            messages.push({ role: "user", content: "Speak your answer now — do not search again." });
            nudged = true;
            continue;
          }
          if (content) narration = content;

          messages.push({
            role: "assistant",
            content: turn.content ?? null,
            tool_calls: turn.toolCalls,
          });

          for (const call of turn.toolCalls) {
            if (call.function.name !== "search_cards") {
              messages.push({ role: "tool", tool_call_id: call.id, content: JSON.stringify({ error: "unknown tool" }) });
              continue;
            }
            const { cards, queryUsed } = runSearchCall(call.function.arguments);
            for (const card of cards) {
              if (!summoned.some((c) => c.id === card.id)) summoned.push(card);
            }
            // Hand the model the actual cards so it can speak to them truthfully.
            messages.push({
              role: "tool",
              tool_call_id: call.id,
              content: JSON.stringify({ query: queryUsed, cards }),
            });
          }
          toolRounds++;
        }

        // Prefer the real reply. If cards were conjured but the model never
        // answered (free-tier quirk), a short voiced line beats its unfinished
        // "let me search…" narration. Narration is only a last resort.
        const finalText =
          answerText ||
          (summoned.length
            ? "I have summoned what the archive offers — gaze upon them."
            : narration || "The archive holds no answer for that, traveler.");

        // §4.2: exact response shape. `action` is "summon" when cards were
        // conjured, "none" otherwise. "explain" is reserved for a future mode
        // with persistence (explaining cards from earlier context) and is not
        // emitted yet — see Status Log.
        return {
          text: finalText,
          cards: summoned.slice(0, MAX_SUMMONED),
          action: summoned.length > 0 ? ("summon" as const) : ("none" as const),
        };
      } catch (err) {
        request.log.error({ err }, "oracle/ask failed — degrading");
        reply.code(200);
        return { text: DEGRADED_TEXT, cards: [], action: "none" as const };
      }
    }
  );

  // ── Text-to-speech proxy ─────────────────────────────────────────────
  // The browser can't hit freetts.org directly (no CORS); the v1 endpoint
  // needs a key. Proxy it here and stream the audio straight back.
  const FREETTS_KEY = process.env.FREETTS_API_KEY?.trim();
  const FREETTS_VOICE = process.env.FREETTS_VOICE?.trim() || "en-US-JennyNeural";

  app.post<{ Body: { text: string; voice?: string } }>(
    "/tts",
    {
      schema: {
        body: {
          type: "object",
          required: ["text"],
          additionalProperties: false,
          properties: {
            text: { type: "string", minLength: 1, maxLength: 4000 },
            voice: { type: "string", maxLength: 60 },
          },
        },
      },
    },
    async (request, reply) => {
      if (!FREETTS_KEY) {
        reply.code(503);
        return { error: "TTS not configured — set FREETTS_API_KEY on the server." };
      }
      try {
        const upstream = await fetch("https://freetts.org/api/v1/tts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": FREETTS_KEY,
          },
          body: JSON.stringify({
            text: request.body.text,
            voice: request.body.voice || FREETTS_VOICE,
          }),
        });

        const type = upstream.headers.get("content-type") ?? "";
        if (!upstream.ok) {
          const detail = await upstream.text().catch(() => "");
          request.log.warn({ status: upstream.status, detail }, "freetts v1 rejected");
          reply.code(502);
          return { error: `TTS upstream ${upstream.status}`, detail: detail.slice(0, 200) };
        }

        // Audio bytes → stream straight through.
        if (type.startsWith("audio/") || type === "application/octet-stream") {
          const buf = Buffer.from(await upstream.arrayBuffer());
          reply.header("content-type", type.startsWith("audio/") ? type : "audio/mpeg");
          reply.header("cache-control", "no-store");
          return reply.send(buf);
        }

        // Otherwise it's JSON pointing at the audio — pass it back normalised.
        const data = (await upstream.json().catch(() => ({}))) as Record<string, unknown>;
        const url =
          (typeof data.audio_url === "string" && data.audio_url) ||
          (typeof data.url === "string" && data.url) ||
          (typeof data.file_id === "string" && `https://freetts.org/api/audio/${data.file_id}`) ||
          null;
        return url ? { url } : { error: "TTS returned no audio", raw: data };
      } catch (err) {
        request.log.error({ err }, "tts failed");
        reply.code(502);
        return { error: "TTS generation failed" };
      }
    }
  );
}


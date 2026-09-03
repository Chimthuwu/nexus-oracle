/**
 * The `search_cards` tool — FROZEN contract, TODO.txt §4.3. The schema there is
 * written in Anthropic's `input_schema` spelling; the OpenAI-compatible shape
 * below is the identical object with `input_schema` renamed to `parameters`
 * (both providers the fallback chain talks to speak this shape).
 */
export const SEARCH_CARDS_TOOL = {
  type: "function",
  function: {
    name: "search_cards",
    description:
      "Search the Nexus card archive for cards matching criteria drawn from the player's question.",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Free text — card name, theme, or strategy",
        },
        colors: {
          type: "array",
          items: { type: "string", enum: ["W", "U", "B", "R", "G", "C"] },
        },
        types: { type: "array", items: { type: "string" } },
        max_mana_value: { type: "number" },
        keywords: { type: "array", items: { type: "string" } },
        limit: { type: "number", default: 3 },
      },
      required: ["query"],
    },
  },
} as const;

export type SearchCardsTool = typeof SEARCH_CARDS_TOOL;

/** The single tool the Oracle is allowed to call (per §4.3 / §5). */
export const ORACLE_TOOLS = [SEARCH_CARDS_TOOL] as const;

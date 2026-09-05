import type { FastifyInstance } from "fastify";
import type { SearchFilters } from "@nexus/card-data";
import { MOCK_CARDS, searchCards } from "@nexus/card-data";

const COLOR_ENUM = ["W", "U", "B", "R", "G", "C"];

function parseListParam(raw: unknown): string[] {
  if (typeof raw !== "string" || raw === "") return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

interface SearchQuery {
  q?: string;
  colors?: string;
  type?: string;
  limit?: string;
}

export async function registerCardsRoutes(app: FastifyInstance): Promise<void> {
  // §4.4 — GET /api/cards/search?q=&colors=&type=&limit= → { cards: Card[] }
  app.get<{ Querystring: SearchQuery }>("/search", async (request) => {
    const q = (request.query.q ?? "").trim();
    const limitRaw = Number(request.query.limit);
    const limit = Number.isNaN(limitRaw) ? 10 : Math.min(Math.max(Math.floor(limitRaw), 1), 5000);

    const colors = parseListParam(request.query.colors).filter((c) => COLOR_ENUM.includes(c));
    const filters: SearchFilters = {
      // search.ts re-validates color letters at runtime; cast satisfies TS.
      colors: (colors.length ? colors : undefined) as SearchFilters["colors"],
      types: parseListParam(request.query.type),
      limit,
    };

    const { data: cards, total } = searchCards(q, filters);
    return { cards, total };
  });

  // §4.4 — GET /api/cards/:id → a single Card
  app.get<{ Params: { id: string } }>("/:id", async (request, reply) => {
    const card = MOCK_CARDS.find((c) => c.id === request.params.id);
    if (!card) {
      reply.code(404);
      return { error: `no card with id ${request.params.id} in the archive` };
    }
    return card;
  });
}

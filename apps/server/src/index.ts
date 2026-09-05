// Must run first: loads the root .env (see env.ts). Imported before everything
// else so bucket config is ready by the time any route is handled.
import "./env";

import Fastify from "fastify";
import cors from "@fastify/cors";
import compress from "@fastify/compress";
import { serverHost, serverPort } from "./env";
import { registerOracleRoutes } from "./routes/oracle";
import { registerCardsRoutes } from "./routes/cards";

const app = Fastify({ logger: true });

// Dev CORS: reflect any origin (the Vite dev server may run on any port, and
// Track A tests from LAN/mobile devices during the mobile pass).
await app.register(cors, { origin: true });

// The full card archive is a ~25 MB JSON response; gzip takes it to ~2–3 MB
// over the wire. Only kicks in above 1 KB so small replies are untouched.
await app.register(compress, { global: true, threshold: 1024 });

app.get("/health", async () => ({ ok: true, service: "nexus-server" }));

await app.register(registerOracleRoutes, { prefix: "/api/oracle" });
await app.register(registerCardsRoutes, { prefix: "/api/cards" });

try {
  await app.listen({ port: serverPort, host: serverHost });
  app.log.info(`Nexus server listening on http://${serverHost}:${serverPort}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}

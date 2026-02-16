// apps/api/src/server.ts
import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";

import { env } from "./config/env.js";
import { routes } from "./routes.js";
import authPlugin from "./plugins/auth.plugin.js";

const app = Fastify({ logger: true });

// ✅ 1) CORS primeiro (preflight precisa passar)
await app.register(cors, {
  origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
});

// ✅ 2) Auth depois
await app.register(authPlugin);

app.get("/health", async () => ({ ok: true }));

// ✅ 3) Rotas
await routes(app);

await app.listen({ port: env.PORT, host: "0.0.0.0" });

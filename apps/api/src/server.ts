// apps/api/src/server.ts
import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";

import { env } from "./config/env.js";
import { routes } from "./routes.js";
import authPlugin from "./plugins/auth.plugin.js";
import { requireAuth } from "./config/prehandlers.js"; // ✅ ADD

const app = Fastify({ logger: true });

await app.register(cors, {
  origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
});

await app.register(multipart, {
  limits: { fileSize: 50 * 1024 * 1024, files: 1 }, // 50MB
});

// ✅ Plugin agora é passivo (não bloqueia)
await app.register(authPlugin);

// ✅ Guard global oficial (bloqueia só o que não é público)
app.addHook("preHandler", requireAuth);

app.get("/health", async () => ({ ok: true }));

await routes(app);

await app.listen({ port: env.PORT, host: "0.0.0.0" });
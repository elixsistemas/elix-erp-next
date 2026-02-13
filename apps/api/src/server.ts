import "dotenv/config";
import Fastify from "fastify";
import { env } from "./config/env";
import { companiesRoutes } from "./modules/companies/companies.routes";

const app = Fastify({ logger: true });

app.get("/health", async () => ({ ok: true }));

await app.register(companiesRoutes);

await app.listen({ port: env.PORT, host: "0.0.0.0" });

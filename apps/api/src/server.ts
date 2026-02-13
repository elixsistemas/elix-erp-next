import "dotenv/config";
import Fastify from "fastify";
import { env } from "./config/env";
import { companiesRoutes } from "./modules/companies/companies.routes";
import { authRoutes } from "./modules/auth/auth.routes";

const app = Fastify({ logger: true });

app.setErrorHandler((err, req, rep) => {
  req.log.error(err);

  // Zod error
  if ((err as any).name === "ZodError") {
    return rep.code(400).send({
      message: "Validation error",
      issues: (err as any).issues
    });
  }

  return rep.code(500).send({ message: "Internal server error" });
});

app.get("/health", async () => ({ ok: true }));

await app.register(authRoutes);
await app.register(companiesRoutes);

await app.listen({ port: env.PORT, host: "0.0.0.0" });

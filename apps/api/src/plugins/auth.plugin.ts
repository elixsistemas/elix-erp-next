import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";

export default fp(async function authPlugin(_app: FastifyInstance) {
  // Intencionalmente vazio:
  // Autenticação fica em config/prehandlers.ts (requireAuth),
  // aplicado nas rotas privadas.
});
import { ZodError } from "zod";
import type { FastifyReply, FastifyRequest } from "fastify";
import { LoginSchema, PreLoginSchema } from "./auth.schema";
import * as service from "./auth.service";
import { getUserPermissions, getCompanyModules } from "./auth.repository";

export async function prelogin(req: FastifyRequest, rep: FastifyReply) {
  const payload = PreLoginSchema.parse(req.body);
  const result = await service.prelogin(payload);

  if (!result) {
    return rep.code(401).send({ message: "Invalid credentials" });
  }

  return rep.send(result);
}

export async function login(req: FastifyRequest, rep: FastifyReply) {
  try {
    const payload = LoginSchema.parse(req.body);
    const result = await service.login(payload);

    if (!result) {
      return rep.code(401).send({ message: "Invalid login ticket or company" });
    }
    return rep.send(result);
  } catch (err) {
    if (err instanceof ZodError) {
      return rep.code(400).send({ message: "Invalid request", issues: err.issues });
    }
    throw err;
  }
}

export async function me(req: FastifyRequest, rep: FastifyReply) {
  if (!req.auth) return rep.code(401).send({ message: "Unauthorized" });

  const { companyId, userId } = req.auth;

  const [modules, permissions] = await Promise.all([
    getCompanyModules(companyId),
    getUserPermissions(companyId, userId),
  ]);

  // ⚠️ aqui você pode buscar name/email no banco se não estiver no token
  // mas vou assumir que você já busca em algum lugar.
  return rep.send({
    user: req.auth.userId,     
    company: req.auth.companyId, 
    modules,
    permissions,
  });
}
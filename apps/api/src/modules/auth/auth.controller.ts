import type { FastifyReply, FastifyRequest } from "fastify";
import { LoginSchema, PreLoginSchema } from "./auth.schema";
import * as service from "./auth.service";

export async function prelogin(req: FastifyRequest, rep: FastifyReply) {
  const payload = PreLoginSchema.parse(req.body);
  const result = await service.prelogin(payload);

  if (!result) {
    return rep.code(401).send({ message: "Invalid credentials" });
  }

  return rep.send(result);
}

export async function login(req: FastifyRequest, rep: FastifyReply) {
  const payload = LoginSchema.parse(req.body);
  const result = await service.login(payload);

  if (!result) {
    return rep.code(401).send({ message: "Invalid login ticket or company" });
  }

  return rep.send(result);
}

export async function me(req: FastifyRequest, rep: FastifyReply) {
  const user = (req as any).user;

  if (!user) {
    return rep.code(401).send({ message: "Unauthorized" });
  }

  const result = await service.getMe(user.id, user.companyId);

  return rep.send(result);
}

import type { FastifyReply, FastifyRequest } from "fastify";
import { LoginSchema } from "./auth.schema";
import * as service from "./auth.service";

export async function login(req: FastifyRequest, rep: FastifyReply) {
  const payload = LoginSchema.parse(req.body);
  const result = await service.login(payload);

  if (!result) {
    return rep.code(401).send({ message: "Invalid credentials" });
  }

  return rep.send(result);
}

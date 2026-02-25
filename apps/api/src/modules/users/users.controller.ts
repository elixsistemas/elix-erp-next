import type { FastifyRequest, FastifyReply } from "fastify";
import { UserCreateSchema, UserUpdateSchema, UserIdParamSchema, UserSetRolesSchema } from "./users.schema";
import * as repo from "./users.repository";

export async function list(req: FastifyRequest, rep: FastifyReply) {
  return rep.send(await repo.listUsers(req.auth!.companyId));
}

export async function get(req: FastifyRequest, rep: FastifyReply) {
  const { id } = UserIdParamSchema.parse(req.params);
  const u = await repo.getUser(req.auth!.companyId, id);
  if (!u) return rep.code(404).send({ message: "User not found" });
  return rep.send(u);
}

export async function create(req: FastifyRequest, rep: FastifyReply) {
  const companyId = req.auth!.companyId;
  const payload = UserCreateSchema.parse(req.body);

  const created = await repo.createUser(companyId, payload);
  // set roles (opcional)
  await repo.setUserRoles(companyId, created.id, payload.roleIds);

  return rep.code(201).send(created);
}

export async function update(req: FastifyRequest, rep: FastifyReply) {
  const companyId = req.auth!.companyId;
  const { id } = UserIdParamSchema.parse(req.params);
  const payload = UserUpdateSchema.parse(req.body);

  const updated = await repo.updateUser(companyId, id, payload);
  if (!updated) return rep.code(404).send({ message: "User not found" });

  return rep.send(updated);
}

export async function roles(req: FastifyRequest, rep: FastifyReply) {
  const companyId = req.auth!.companyId;
  const { id } = UserIdParamSchema.parse(req.params);
  return rep.send(await repo.getUserRoles(companyId, id));
}

export async function setRoles(req: FastifyRequest, rep: FastifyReply) {
  const companyId = req.auth!.companyId;
  const { id } = UserIdParamSchema.parse(req.params);
  const payload = UserSetRolesSchema.parse(req.body);

  const ok = await repo.setUserRoles(companyId, id, payload.roleIds);
  if (!ok) return rep.code(404).send({ message: "User not found" });

  return rep.code(204).send();
}
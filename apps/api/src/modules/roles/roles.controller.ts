import type { FastifyRequest, FastifyReply } from "fastify";
import { RoleCreateSchema, RoleUpdateSchema, RoleIdParamSchema, RoleGrantSchema } from "./roles.schema";
import * as repo from "./roles.repository";

export async function list(req: FastifyRequest, rep: FastifyReply) {
  const companyId = req.auth!.companyId;
  return rep.send(await repo.listRoles(companyId));
}

export async function create(req: FastifyRequest, rep: FastifyReply) {
  const companyId = req.auth!.companyId;
  const payload = RoleCreateSchema.parse(req.body);
  const created = await repo.createRole(companyId, payload);
  return rep.code(201).send(created);
}

export async function update(req: FastifyRequest, rep: FastifyReply) {
  const companyId = req.auth!.companyId;
  const { id } = RoleIdParamSchema.parse(req.params);
  const payload = RoleUpdateSchema.parse(req.body);
  const updated = await repo.updateRole(companyId, id, payload);
  if (!updated) return rep.code(404).send({ message: "Role not found" });
  return rep.send(updated);
}

export async function remove(req: FastifyRequest, rep: FastifyReply) {
  const companyId = req.auth!.companyId;
  const { id } = RoleIdParamSchema.parse(req.params);
  const ok = await repo.deleteRole(companyId, id);
  if (!ok) return rep.code(404).send({ message: "Role not found" });
  return rep.code(204).send();
}

export async function permissionsCatalog(_req: FastifyRequest, rep: FastifyReply) {
  return rep.send(await repo.listPermissionsCatalog());
}

export async function getGranted(req: FastifyRequest, rep: FastifyReply) {
  const companyId = req.auth!.companyId;
  const { id } = RoleIdParamSchema.parse(req.params);
  return rep.send(await repo.getRoleGrantedPermissions(companyId, id));
}

export async function grant(req: FastifyRequest, rep: FastifyReply) {
  const companyId = req.auth!.companyId;
  const { id } = RoleIdParamSchema.parse(req.params);
  const payload = RoleGrantSchema.parse(req.body);
  const ok = await repo.setRolePermissions(companyId, id, payload.permissionCodes);
  if (!ok) return rep.code(404).send({ message: "Role not found" });
  return rep.code(204).send();
}
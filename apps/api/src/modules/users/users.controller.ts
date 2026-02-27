import type { FastifyRequest, FastifyReply } from "fastify";
import {
  UserCreateSchema,
  UserUpdateSchema,
  UserIdParamSchema,
  UserSetRolesSchema,
  UserLookupQuerySchema,
  UserLinkSchema,
} from "./users.schema";
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

// ✅ NOVO: lookup por e-mail
export async function lookupByEmail(req: FastifyRequest, rep: FastifyReply) {
  const companyId = req.auth!.companyId;
  const { email } = UserLookupQuerySchema.parse(req.query);

  const info = await repo.lookupUserByEmail(companyId, req.auth!.userId, email);

  // Retorno pensado pro front:
  // - exists: achou user global?
  // - linked: já está vinculado nesta company?
  // - user: dados básicos (se existir)
  // - importSources: empresas que o admin TAMBÉM faz parte (segurança)
  return rep.send(info);
}

// ✅ NOVO: vincular (e opcionalmente importar roles)
export async function link(req: FastifyRequest, rep: FastifyReply) {
  const companyId = req.auth!.companyId;
  const actorUserId = req.auth!.userId;

  const payload = UserLinkSchema.parse(req.body);

  // 1) cria ou vincula (sem resetar senha se já existir)
  const out = await repo.linkUserToCompany(companyId, payload);

  // 2) se pediu import, aplica com validação de acesso do admin à empresa origem
  if (payload.import?.enabled && payload.import.fromCompanyId && payload.import.fromCompanyId !== companyId) {
    // Segurança: só permite importar de uma empresa que o admin (actor) também participa
    const okActor = await repo.userIsActiveInCompany(actorUserId, payload.import.fromCompanyId);
    if (!okActor) {
      return rep.code(403).send({ message: "Forbidden", reason: "Import source not accessible" });
    }

    await repo.importUserRolesByCompanyCode({
      targetCompanyId: companyId,
      userId: out.id,
      fromCompanyId: payload.import.fromCompanyId,
    });
  } else {
    // Sem import: aplica roles mandadas (opcional)
    await repo.setUserRoles(companyId, out.id, payload.roleIds ?? []);
  }

  return rep.code(201).send(out);
}
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
import { assertUserSeatAvailable, LicenseLimitError } from "./users.service";

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
  try {
    const companyId = req.auth!.companyId;
    const payload = UserCreateSchema.parse(req.body);

    // Vai criar usuário ativo na empresa?
    const willBeActive = payload.active !== false;
    if (willBeActive) {
      await assertUserSeatAvailable(companyId, req.license?.userLimit ?? 0);
    }

    const created = await repo.createUser(companyId, payload);
    await repo.setUserRoles(companyId, created.id, payload.roleIds);
    return rep.code(201).send(created);
  } catch (e: any) {
    if (e?.code === "LICENSE_USER_LIMIT") {
      return rep.code(409).send({ message: e.message, code: e.code });
    }
    throw e;
  }
}

export async function update(req: FastifyRequest, rep: FastifyReply) {
  try {
    const companyId = req.auth!.companyId;
    const { id } = UserIdParamSchema.parse(req.params);
    const payload = UserUpdateSchema.parse(req.body);

    if (payload.active === true) {
      await assertUserSeatAvailable(companyId, req.license?.userLimit ?? 0);
    }

    const updated = await repo.updateUser(companyId, id, payload);
    if (!updated) return rep.code(404).send({ message: "User not found" });
    return rep.send(updated);
  } catch (e: any) {
    if (e?.code === "LICENSE_USER_LIMIT") {
      return rep.code(409).send({ message: e.message, code: e.code });
    }
    throw e;
  }
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
  try {
    const companyId = req.auth!.companyId;
    const actorUserId = req.auth!.userId;
    const payload = UserLinkSchema.parse(req.body);

    const willBeActive = payload.active !== false;
    if (willBeActive) {
      await assertUserSeatAvailable(companyId, req.license?.userLimit ?? 0);
    }

    const out = await repo.linkUserToCompany(companyId, payload);

    // ... resto igual (import roles / set roles)
    // (mantém seu código)

    return rep.code(201).send(out);
  } catch (e: any) {
    if (e?.code === "LICENSE_USER_LIMIT") {
      return rep.code(409).send({ message: e.message, code: e.code });
    }
    throw e;
  }
}
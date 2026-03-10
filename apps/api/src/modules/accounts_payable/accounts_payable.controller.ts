import type { FastifyReply, FastifyRequest } from "fastify";
import * as service from "./accounts_payable.service";
import {
  AccountsPayableCreateSchema,
  AccountsPayableIdParamsSchema,
  AccountsPayableListQuerySchema,
  AccountsPayableStatusUpdateSchema,
  AccountsPayableUpdateSchema,
} from "./accounts_payable.schema";

function getAuthOrThrow(req: FastifyRequest) {
  if (!req.auth) {
    throw new Error("Unauthorized");
  }

  return req.auth;
}

export async function listAccountsPayable(
  req: FastifyRequest,
  rep: FastifyReply,
) {
  const auth = getAuthOrThrow(req);
  const query = AccountsPayableListQuerySchema.parse(req.query);
  const data = await service.listAccountsPayable(auth.companyId, query);
  return rep.send(data);
}

export async function getAccountsPayableById(
  req: FastifyRequest,
  rep: FastifyReply,
) {
  const auth = getAuthOrThrow(req);
  const params = AccountsPayableIdParamsSchema.parse(req.params);
  const data = await service.getAccountsPayableById(auth.companyId, params.id);

  if (!data) {
    return rep.code(404).send({ message: "Conta a pagar não encontrada." });
  }

  return rep.send(data);
}

export async function createAccountsPayable(
  req: FastifyRequest,
  rep: FastifyReply,
) {
  const auth = getAuthOrThrow(req);
  const body = AccountsPayableCreateSchema.parse(req.body);
  const id = await service.createAccountsPayable(auth.companyId, body);
  return rep.code(201).send({ id });
}

export async function updateAccountsPayable(
  req: FastifyRequest,
  rep: FastifyReply,
) {
  const auth = getAuthOrThrow(req);
  const params = AccountsPayableIdParamsSchema.parse(req.params);
  const body = AccountsPayableUpdateSchema.parse(req.body);

  await service.updateAccountsPayable(auth.companyId, params.id, body);
  return rep.send({ ok: true });
}

export async function updateAccountsPayableStatus(
  req: FastifyRequest,
  rep: FastifyReply,
) {
  const auth = getAuthOrThrow(req);
  const params = AccountsPayableIdParamsSchema.parse(req.params);
  const body = AccountsPayableStatusUpdateSchema.parse(req.body);

  await service.updateAccountsPayableStatus(auth.companyId, params.id, body);
  return rep.send({ ok: true });
}
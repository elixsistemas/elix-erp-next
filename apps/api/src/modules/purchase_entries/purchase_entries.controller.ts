import type { FastifyReply, FastifyRequest } from "fastify";
import * as service from "./purchase_entries.service";
import {
  CreateProductFromImportItemSchema,
  CreateSupplierFromImportSchema,
  ImportXmlSchema,
  MatchProductSchema,
  MatchSupplierSchema,
  PurchaseEntryIdParamsSchema,
  PurchaseEntryInstallmentParamsSchema,
  PurchaseEntryItemParamsSchema,
  PurchaseEntryListQuerySchema,
  UpdateImportFinancialSchema,
  UpdateImportInstallmentSchema,
  UpdateImportItemSchema,
} from "./purchase_entries.schema";

function getAuthOrThrow(req: FastifyRequest) {
  if (!req.auth) {
    throw new Error("Unauthorized");
  }
  return req.auth;
}

export async function listImports(req: FastifyRequest, rep: FastifyReply) {
  const auth = getAuthOrThrow(req);
  const query = PurchaseEntryListQuerySchema.parse(req.query);
  const data = await service.listImports(auth.companyId, query);
  return rep.send(data);
}

export async function getImportById(req: FastifyRequest, rep: FastifyReply) {
  const auth = getAuthOrThrow(req);
  const params = PurchaseEntryIdParamsSchema.parse(req.params);
  const data = await service.getImportById(auth.companyId, params.id);

  if (!data) {
    return rep.code(404).send({ message: "Importação não encontrada." });
  }

  return rep.send(data);
}

export async function importXml(req: FastifyRequest, rep: FastifyReply) {
  const auth = getAuthOrThrow(req);
  const body = ImportXmlSchema.parse(req.body);
  const data = await service.importXml(auth.companyId, auth.userId, body);
  return rep.code(201).send(data);
}

export async function matchSupplier(req: FastifyRequest, rep: FastifyReply) {
  const auth = getAuthOrThrow(req);
  const params = PurchaseEntryIdParamsSchema.parse(req.params);
  const body = MatchSupplierSchema.parse(req.body);
  const data = await service.matchSupplier(auth.companyId, params.id, body);
  return rep.send(data);
}

export async function matchProduct(req: FastifyRequest, rep: FastifyReply) {
  const auth = getAuthOrThrow(req);
  const params = PurchaseEntryItemParamsSchema.parse(req.params);
  const body = MatchProductSchema.parse(req.body);
  const data = await service.matchProduct(auth.companyId, params.id, params.itemId, body);
  return rep.send(data);
}

export async function confirmImport(req: FastifyRequest, rep: FastifyReply) {
  const auth = getAuthOrThrow(req);
  const params = PurchaseEntryIdParamsSchema.parse(req.params);
  const data = await service.confirmImport(auth.companyId, auth.userId, params.id);
  return rep.send(data);
}

export async function cancelImport(req: FastifyRequest, rep: FastifyReply) {
  const auth = getAuthOrThrow(req);
  const params = PurchaseEntryIdParamsSchema.parse(req.params);
  const data = await service.cancelImport(auth.companyId, params.id);
  return rep.send(data);
}

export async function createSupplierFromImport(
  req: FastifyRequest,
  rep: FastifyReply,
) {
  const auth = getAuthOrThrow(req);
  const params = PurchaseEntryIdParamsSchema.parse(req.params);
  const body = CreateSupplierFromImportSchema.parse(req.body ?? {});
  const data = await service.createSupplierFromImport(auth.companyId, params.id, body);
  return rep.send(data);
}

export async function createProductFromImportItem(
  req: FastifyRequest,
  rep: FastifyReply,
) {
  const auth = getAuthOrThrow(req);
  const params = PurchaseEntryItemParamsSchema.parse(req.params);
  const body = CreateProductFromImportItemSchema.parse(req.body ?? {});
  const data = await service.createProductFromImportItem(
    auth.companyId,
    params.id,
    params.itemId,
    body,
  );
  return rep.send(data);
}

export async function getFinancialOptions(req: FastifyRequest, rep: FastifyReply) {
  const auth = getAuthOrThrow(req);
  const data = await service.getFinancialOptions(auth.companyId);
  return rep.send(data);
}

export async function updateImportFinancial(req: FastifyRequest, rep: FastifyReply) {
  const auth = getAuthOrThrow(req);
  const params = PurchaseEntryIdParamsSchema.parse(req.params);
  const body = UpdateImportFinancialSchema.parse(req.body);
  const data = await service.updateImportFinancial(auth.companyId, params.id, body);
  return rep.send(data);
}

export async function updateImportItem(req: FastifyRequest, rep: FastifyReply) {
  const auth = getAuthOrThrow(req);
  const params = PurchaseEntryItemParamsSchema.parse(req.params);
  const body = UpdateImportItemSchema.parse(req.body);
  const data = await service.updateImportItem(auth.companyId, params.id, params.itemId, body);
  return rep.send(data);
}

export async function updateImportInstallment(req: FastifyRequest, rep: FastifyReply) {
  const auth = getAuthOrThrow(req);
  const params = PurchaseEntryInstallmentParamsSchema.parse(req.params);
  const body = UpdateImportInstallmentSchema.parse(req.body);
  const data = await service.updateImportInstallment(
    auth.companyId,
    params.id,
    params.installmentId,
    body,
  );
  return rep.send(data);
}
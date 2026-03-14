import type { FastifyReply, FastifyRequest } from "fastify";
import * as service from "./purchase_entries.service";
import {
  CreateProductFromImportItemSchema,
  CreateSupplierFromImportSchema,
  ImportXmlSchema,
  MatchProductSchema,
  MatchSupplierSchema,
  PurchaseEntryInstallmentParamsSchema,
  PurchaseEntryItemParamsSchema,
  PurchaseEntryListQuerySchema,
  UpdateImportEconomicsSchema,
  UpdateImportFinancialSchema,
  UpdateImportInstallmentSchema,
  UpdateImportItemSchema,
  UpdateImportLogisticsSchema,
  PurchaseEntryDefinitiveListQuerySchema,
  PurchaseEntryIdParamsSchema,
  UpdateImportItemAllocationSchema,
} from "./purchase_entries.schema";

function getAuthOrThrow(req: FastifyRequest) {
  if (!req.auth) {
    const err = new Error("Não autenticado.") as Error & {
      statusCode?: number;
    };
    err.statusCode = 401;
    throw err;
  }

  return req.auth;
}

function sendHandledError(rep: FastifyReply, err: any, fallbackMessage: string) {
  const statusCode = err?.statusCode ?? 500;

  let error = "Internal Server Error";
  if (statusCode === 409) error = "Conflict";
  else if (statusCode === 422) error = "Unprocessable Entity";
  else if (statusCode === 404) error = "Not Found";
  else if (statusCode === 401) error = "Unauthorized";
  else if (statusCode === 400) error = "Bad Request";

  return rep.status(statusCode).send({
    statusCode,
    error,
    message: err?.message ?? fallbackMessage,
    code: err?.code,
    importId: err?.importId,
    details: err?.details,
  });
}

export async function listImports(req: FastifyRequest, rep: FastifyReply) {
  try {
    const auth = getAuthOrThrow(req);
    const query = PurchaseEntryListQuerySchema.parse(req.query);

    const data = await service.listImports(auth.companyId, query);
    return rep.send(data);
  } catch (err: any) {
    return sendHandledError(rep, err, "Erro ao listar importações.");
  }
}

export async function getImportById(req: FastifyRequest, rep: FastifyReply) {
  try {
    const auth = getAuthOrThrow(req);
    const params = PurchaseEntryIdParamsSchema.parse(req.params);

    const data = await service.getImportById(auth.companyId, params.id);

    if (!data) {
      return rep.status(404).send({
        statusCode: 404,
        error: "Not Found",
        message: "Importação não encontrada.",
      });
    }

    return rep.send(data);
  } catch (err: any) {
    return sendHandledError(rep, err, "Erro ao carregar importação.");
  }
}

export async function getFinancialOptions(req: FastifyRequest, rep: FastifyReply) {
  try {
    const auth = getAuthOrThrow(req);
    const data = await service.getFinancialOptions(auth.companyId);
    return rep.send(data);
  } catch (err: any) {
    return sendHandledError(rep, err, "Erro ao carregar opções financeiras.");
  }
}

export async function importXml(req: FastifyRequest, rep: FastifyReply) {
  try {
    const auth = getAuthOrThrow(req);
    const body = ImportXmlSchema.parse(req.body);

    const data = await service.importXml(auth.companyId, auth.userId, body);
    return rep.send(data);
  } catch (err: any) {
    return sendHandledError(rep, err, "Erro ao importar XML.");
  }
}

export async function updateImportEconomics(req: FastifyRequest, rep: FastifyReply) {
  try {
    const auth = getAuthOrThrow(req);
    const params = PurchaseEntryIdParamsSchema.parse(req.params);
    const body = UpdateImportEconomicsSchema.parse(req.body);

    const data = await service.updateImportEconomics(auth.companyId, params.id, body);
    return rep.send(data);
  } catch (err: any) {
    return sendHandledError(rep, err, "Erro ao atualizar motor econômico da importação.");
  }
}

export async function updateImportFinancial(req: FastifyRequest, rep: FastifyReply) {
  try {
    const auth = getAuthOrThrow(req);
    const params = PurchaseEntryIdParamsSchema.parse(req.params);
    const body = UpdateImportFinancialSchema.parse(req.body);

    const data = await service.updateImportFinancial(auth.companyId, params.id, body);
    return rep.send(data);
  } catch (err: any) {
    return sendHandledError(rep, err, "Erro ao atualizar classificação financeira.");
  }
}

export async function updateImportLogistics(req: FastifyRequest, rep: FastifyReply) {
  try {
    const auth = getAuthOrThrow(req);
    const params = PurchaseEntryIdParamsSchema.parse(req.params);
    const body = UpdateImportLogisticsSchema.parse(req.body);

    const data = await service.updateImportLogistics(auth.companyId, params.id, body);
    return rep.send(data);
  } catch (err: any) {
    return sendHandledError(rep, err, "Erro ao atualizar dados logísticos.");
  }
}

export async function matchSupplier(req: FastifyRequest, rep: FastifyReply) {
  try {
    const auth = getAuthOrThrow(req);
    const params = PurchaseEntryIdParamsSchema.parse(req.params);
    const body = MatchSupplierSchema.parse(req.body);

    const data = await service.matchSupplier(auth.companyId, params.id, body);
    return rep.send(data);
  } catch (err: any) {
    return sendHandledError(rep, err, "Erro ao vincular fornecedor.");
  }
}

export async function createSupplierFromImport(
  req: FastifyRequest,
  rep: FastifyReply,
) {
  try {
    const auth = getAuthOrThrow(req);
    const params = PurchaseEntryIdParamsSchema.parse(req.params);
    const body = CreateSupplierFromImportSchema.parse(req.body);

    const data = await service.createSupplierFromImport(auth.companyId, params.id, body);
    return rep.send(data);
  } catch (err: any) {
    return sendHandledError(rep, err, "Erro ao criar fornecedor a partir do XML.");
  }
}

export async function matchProduct(req: FastifyRequest, rep: FastifyReply) {
  try {
    const auth = getAuthOrThrow(req);
    const params = PurchaseEntryItemParamsSchema.parse(req.params);
    const body = MatchProductSchema.parse(req.body);

    const data = await service.matchProduct(
      auth.companyId,
      params.id,
      params.itemId,
      body,
    );

    return rep.send(data);
  } catch (err: any) {
    return sendHandledError(rep, err, "Erro ao vincular produto.");
  }
}

export async function createProductFromImportItem(
  req: FastifyRequest,
  rep: FastifyReply,
) {
  try {
    const auth = getAuthOrThrow(req);
    const params = PurchaseEntryItemParamsSchema.parse(req.params);
    const body = CreateProductFromImportItemSchema.parse(req.body);

    const data = await service.createProductFromImportItem(
      auth.companyId,
      params.id,
      params.itemId,
      body,
    );

    return rep.send(data);
  } catch (err: any) {
    return sendHandledError(rep, err, "Erro ao criar produto a partir do item.");
  }
}

export async function updateImportItem(req: FastifyRequest, rep: FastifyReply) {
  try {
    const auth = getAuthOrThrow(req);
    const params = PurchaseEntryItemParamsSchema.parse(req.params);
    const body = UpdateImportItemSchema.parse(req.body);

    const data = await service.updateImportItem(
      auth.companyId,
      params.id,
      params.itemId,
      body,
    );

    return rep.send(data);
  } catch (err: any) {
    return sendHandledError(rep, err, "Erro ao atualizar item da importação.");
  }
}

export async function updateImportInstallment(
  req: FastifyRequest,
  rep: FastifyReply,
) {
  try {
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
  } catch (err: any) {
    return sendHandledError(rep, err, "Erro ao atualizar parcela da importação.");
  }
}

export async function confirmImport(req: FastifyRequest, rep: FastifyReply) {
  try {
    const auth = getAuthOrThrow(req);
    const params = PurchaseEntryIdParamsSchema.parse(req.params);

    const data = await service.confirmImport(auth.companyId, auth.userId, params.id);
    return rep.send(data);
  } catch (err: any) {
    return sendHandledError(rep, err, "Erro ao confirmar importação.");
  }
}

export async function cancelImport(req: FastifyRequest, rep: FastifyReply) {
  try {
    const auth = getAuthOrThrow(req);
    const params = PurchaseEntryIdParamsSchema.parse(req.params);

    const data = await service.cancelImport(auth.companyId, params.id);
    return rep.send(data);
  } catch (err: any) {
    return sendHandledError(rep, err, "Erro ao cancelar importação.");
  }
}

export async function listSuppliersMini(req: FastifyRequest, rep: FastifyReply) {
  try {
    const auth = getAuthOrThrow(req);
    const data = await service.listSuppliersMini(auth.companyId);
    return rep.send(data);
  } catch (err: any) {
    return sendHandledError(rep, err, "Erro ao carregar fornecedores.");
  }
}

export async function listProductsMini(req: FastifyRequest, rep: FastifyReply) {
  try {
    const auth = getAuthOrThrow(req);
    const data = await service.listProductsMini(auth.companyId);
    return rep.send(data);
  } catch (err: any) {
    return sendHandledError(rep, err, "Erro ao carregar produtos.");
  }
}

export async function listDefinitiveEntries(req: FastifyRequest, rep: FastifyReply) {
  try {
    const auth = getAuthOrThrow(req);
    const query = PurchaseEntryDefinitiveListQuerySchema.parse(req.query);
    const data = await service.listDefinitiveEntries(auth.companyId, query);
    return rep.send(data);
  } catch (err: any) {
    return sendHandledError(rep, err, "Erro ao listar entradas definitivas.");
  }
}

export async function getDefinitiveEntryById(req: FastifyRequest, rep: FastifyReply) {
  try {
    const auth = getAuthOrThrow(req);
    const params = PurchaseEntryIdParamsSchema.parse(req.params);
    const data = await service.getDefinitiveEntryById(auth.companyId, params.id);

    if (!data) {
      return rep.status(404).send({
        statusCode: 404,
        error: "Not Found",
        message: "Entrada de compra não encontrada.",
      });
    }

    return rep.send(data);
  } catch (err: any) {
    return sendHandledError(rep, err, "Erro ao carregar entrada de compra.");
  }
}

export async function previewConfirmation(
  req: FastifyRequest,
  rep: FastifyReply,
) {
  try {
    const auth = getAuthOrThrow(req);
    const params = PurchaseEntryIdParamsSchema.parse(req.params);

    const data = await service.previewConfirmation(auth.companyId, params.id);
    return rep.send(data);
  } catch (err: any) {
    return sendHandledError(rep, err, "Erro ao gerar preview da confirmação.");
  }
}

export async function updateImportItemAllocation(
  req: FastifyRequest,
  rep: FastifyReply,
) {
  try {
    const auth = getAuthOrThrow(req);
    const params = PurchaseEntryItemParamsSchema.parse(req.params);
    const body = UpdateImportItemAllocationSchema.parse(req.body);

    const data = await service.updateImportItemAllocation(
      auth.companyId,
      params.id,
      params.itemId,
      body,
    );

    return rep.send(data);
  } catch (err: any) {
    return sendHandledError(rep, err, "Erro ao atualizar rateio manual do item.");
  }
}
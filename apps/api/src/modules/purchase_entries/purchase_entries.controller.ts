import type { FastifyReply, FastifyRequest } from "fastify";
import * as service from "./purchase_entries.service";
import type {
  CreateProductFromImportItemInput,
  CreateSupplierFromImportInput,
  PurchaseEntryDefinitiveListQuery,
  PurchaseEntryImportStatus,
  PurchaseEntryListQuery,
  UpdateImportEconomicsInput,
  UpdateImportFinancialInput,
  UpdateImportInstallmentInput,
  UpdateImportItemInput,
  UpdateImportLogisticsInput,
} from "./purchase_entries.schema";

type AuthenticatedRequest = FastifyRequest & {
  auth: {
    userId: number;
    companyId: number;
    roles: string[];
    perms: string[];
  };
};

function getCompanyId(req: FastifyRequest) {
  return (req as AuthenticatedRequest).auth.companyId;
}

function getUserId(req: FastifyRequest) {
  return (req as AuthenticatedRequest).auth.userId;
}

function getParamId(req: FastifyRequest, key = "id") {
  const params = req.params as Record<string, string>;
  return Number(params[key]);
}

function sendError(reply: FastifyReply, error: unknown) {
  const err = error as Error & {
    statusCode?: number;
    code?: string;
    details?: unknown;
  };

  const statusCode = err.statusCode ?? 500;

  return reply.status(statusCode).send({
    error: err.code ?? "PURCHASE_ENTRIES_ERROR",
    message: err.message ?? "Erro interno.",
    details: err.details ?? null,
  });
}

export async function importXml(req: FastifyRequest, reply: FastifyReply) {
  try {
    const companyId = getCompanyId(req);
    const body = req.body as {
      fileName: string;
      xmlContent: string;
    };

    const result = await service.importPurchaseEntryXml(
      companyId,
      body.xmlContent,
      body.fileName,
    );

    return reply.status(201).send(result);
  } catch (error) {
    return sendError(reply, error);
  }
}

export async function listImports(req: FastifyRequest, reply: FastifyReply) {
  try {
    const companyId = getCompanyId(req);
    const query = req.query as PurchaseEntryListQuery;

    const result = await service.listPurchaseEntryImports(companyId, query);
    return reply.send(result);
  } catch (error) {
    return sendError(reply, error);
  }
}

export async function getImportById(req: FastifyRequest, reply: FastifyReply) {
  try {
    const companyId = getCompanyId(req);
    const id = getParamId(req);

    const result = await service.getPurchaseEntryImportById(companyId, id);

    if (!result) {
      return reply.status(404).send({
        error: "PURCHASE_ENTRY_IMPORT_NOT_FOUND",
        message: "Importação não encontrada.",
      });
    }

    return reply.send(result);
  } catch (error) {
    return sendError(reply, error);
  }
}

export async function getFinancialOptions(req: FastifyRequest, reply: FastifyReply) {
  try {
    const companyId = getCompanyId(req);
    const result = await service.getFinancialOptions(companyId);
    return reply.send(result);
  } catch (error) {
    return sendError(reply, error);
  }
}

export async function listSuppliersMini(req: FastifyRequest, reply: FastifyReply) {
  try {
    const companyId = getCompanyId(req);
    const result = await service.listSuppliersMini(companyId);
    return reply.send(result);
  } catch (error) {
    return sendError(reply, error);
  }
}

export async function listProductsMini(req: FastifyRequest, reply: FastifyReply) {
  try {
    const companyId = getCompanyId(req);
    const result = await service.listProductsMini(companyId);
    return reply.send(result);
  } catch (error) {
    return sendError(reply, error);
  }
}

export async function matchSupplier(req: FastifyRequest, reply: FastifyReply) {
  try {
    const companyId = getCompanyId(req);
    const id = getParamId(req);
    const body = req.body as { supplierId: number };

    const result = await service.updateImportSupplier(
      companyId,
      id,
      Number(body.supplierId),
    );

    return reply.send(result);
  } catch (error) {
    return sendError(reply, error);
  }
}

export async function matchProduct(req: FastifyRequest, reply: FastifyReply) {
  try {
    const companyId = getCompanyId(req);
    const id = getParamId(req);
    const itemId = getParamId(req, "itemId");
    const body = req.body as { productId: number };

    const result = await service.updateImportItemProduct(
      companyId,
      id,
      itemId,
      Number(body.productId),
    );

    return reply.send(result);
  } catch (error) {
    return sendError(reply, error);
  }
}

export async function updateImportItem(req: FastifyRequest, reply: FastifyReply) {
  try {
    const companyId = getCompanyId(req);
    const id = getParamId(req);
    const itemId = getParamId(req, "itemId");
    const body = req.body as UpdateImportItemInput;

    const result = await service.updateImportItem(companyId, id, itemId, body);
    return reply.send(result);
  } catch (error) {
    return sendError(reply, error);
  }
}

export async function updateImportInstallment(req: FastifyRequest, reply: FastifyReply) {
  try {
    const companyId = getCompanyId(req);
    const id = getParamId(req);
    const installmentId = getParamId(req, "installmentId");
    const body = req.body as UpdateImportInstallmentInput;

    const result = await service.updateImportInstallment(
      companyId,
      id,
      installmentId,
      body,
    );

    return reply.send(result);
  } catch (error) {
    return sendError(reply, error);
  }
}

export async function updateImportFinancial(req: FastifyRequest, reply: FastifyReply) {
  try {
    const companyId = getCompanyId(req);
    const id = getParamId(req);
    const body = req.body as UpdateImportFinancialInput;

    const result = await service.updateImportFinancial(companyId, id, body);
    return reply.send(result);
  } catch (error) {
    return sendError(reply, error);
  }
}

export async function updateImportLogistics(req: FastifyRequest, reply: FastifyReply) {
  try {
    const companyId = getCompanyId(req);
    const id = getParamId(req);
    const body = req.body as UpdateImportLogisticsInput;

    const result = await service.updateImportLogistics(companyId, id, body);
    return reply.send(result);
  } catch (error) {
    return sendError(reply, error);
  }
}

export async function updateImportEconomics(req: FastifyRequest, reply: FastifyReply) {
  try {
    const companyId = getCompanyId(req);
    const id = getParamId(req);
    const body = req.body as UpdateImportEconomicsInput;

    const result = await service.updateImportEconomics(companyId, id, body);
    return reply.send(result);
  } catch (error) {
    return sendError(reply, error);
  }
}

export async function updateImportItemAllocation(req: FastifyRequest, reply: FastifyReply) {
  try {
    const companyId = getCompanyId(req);
    const importId = getParamId(req);
    const itemId = getParamId(req, "itemId");
    const body = req.body as {
      freightAllocated?: number;
      insuranceAllocated?: number;
      otherExpensesAllocated?: number;
      discountAllocated?: number;
    };

    const result = await service.updateImportItemManualAllocation(
      companyId,
      importId,
      itemId,
      body,
    );

    return reply.send(result);
  } catch (error) {
    return sendError(reply, error);
  }
}

export async function getImportPendingCounts(req: FastifyRequest, reply: FastifyReply) {
  try {
    const companyId = getCompanyId(req);
    const id = getParamId(req);

    const result = await service.getImportPendingCounts(companyId, id);
    return reply.send(result);
  } catch (error) {
    return sendError(reply, error);
  }
}

export async function previewConfirmation(req: FastifyRequest, reply: FastifyReply) {
  try {
    const companyId = getCompanyId(req);
    const id = getParamId(req);

    const result = await service.buildConfirmationPreview(companyId, id);
    return reply.send(result);
  } catch (error) {
    return sendError(reply, error);
  }
}

export async function confirmImport(req: FastifyRequest, reply: FastifyReply) {
  try {
    const companyId = getCompanyId(req);
    const userId = getUserId(req);
    const id = getParamId(req);

    const result = await service.confirmImport(companyId, userId, id);
    return reply.send(result);
  } catch (error) {
    return sendError(reply, error);
  }
}

export async function cancelImport(req: FastifyRequest, reply: FastifyReply) {
  try {
    const companyId = getCompanyId(req);
    const id = getParamId(req);

    const result = await service.cancelImport(companyId, id);
    return reply.send(result);
  } catch (error) {
    return sendError(reply, error);
  }
}

export async function updateImportStatus(req: FastifyRequest, reply: FastifyReply) {
  try {
    const companyId = getCompanyId(req);
    const id = getParamId(req);
    const body = req.body as {
      status: PurchaseEntryImportStatus;
      matchSummary?: string | null;
    };

    const result = await service.updateImportStatus(
      companyId,
      id,
      body.status,
      body.matchSummary,
    );

    return reply.send(result);
  } catch (error) {
    return sendError(reply, error);
  }
}

export async function createSupplierFromImport(req: FastifyRequest, reply: FastifyReply) {
  try {
    const companyId = getCompanyId(req);
    const importId = getParamId(req);
    const body = (req.body ?? {}) as CreateSupplierFromImportInput;

    const result = await service.createSupplierFromImport(companyId, importId, body);
    return reply.status(201).send(result);
  } catch (error) {
    return sendError(reply, error);
  }
}

export async function createProductFromImportItem(req: FastifyRequest, reply: FastifyReply) {
  try {
    const companyId = getCompanyId(req);
    const importId = getParamId(req);
    const itemId = getParamId(req, "itemId");
    const body = (req.body ?? {}) as CreateProductFromImportItemInput;

    const result = await service.createProductFromImportItem(
      companyId,
      importId,
      itemId,
      body,
    );

    return reply.status(201).send(result);
  } catch (error) {
    return sendError(reply, error);
  }
}

export async function listDefinitiveEntries(req: FastifyRequest, reply: FastifyReply) {
  try {
    const companyId = getCompanyId(req);
    const query = req.query as PurchaseEntryDefinitiveListQuery;

    const result = await service.listDefinitiveEntries(companyId, query);
    return reply.send(result);
  } catch (error) {
    return sendError(reply, error);
  }
}

export async function getDefinitiveEntryById(req: FastifyRequest, reply: FastifyReply) {
  try {
    const companyId = getCompanyId(req);
    const id = getParamId(req);

    const result = await service.getDefinitiveEntryById(companyId, id);

    if (!result) {
      return reply.status(404).send({
        error: "PURCHASE_ENTRY_NOT_FOUND",
        message: "Entrada de compra não encontrada.",
      });
    }

    return reply.send(result);
  } catch (error) {
    return sendError(reply, error);
  }
}
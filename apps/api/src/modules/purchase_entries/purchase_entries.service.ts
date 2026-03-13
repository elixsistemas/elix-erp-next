import { XMLParser } from "fast-xml-parser";
import * as repo from "./purchase_entries.repository";
import type {
  CreateProductFromImportItemInput,
  CreateSupplierFromImportInput,
  ImportXmlInput,
  MatchProductInput,
  MatchSupplierInput,
  PurchaseEntryListQuery,
  UpdateImportFinancialInput,
  UpdateImportInstallmentInput,
  UpdateImportItemInput,
  UpdateImportLogisticsInput,
} from "./purchase_entries.schema";

function ensureArray<T>(value: T | T[] | undefined | null): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function onlyDigits(value: unknown) {
  if (value === undefined || value === null) return "";
  return String(value).replace(/\D/g, "");
}

function getText(value: any): string | null {
  if (value === undefined || value === null) return null;
  if (typeof value === "string") return value.trim() || null;
  if (typeof value === "number") return String(value);
  return null;
}

function toNumber(value: any) {
  const normalized = String(value ?? "0").replace(",", ".");
  const n = Number(normalized);
  return Number.isFinite(n) ? n : 0;
}

function extractAccessKey(parsed: any): string | null {
  const idAttr =
    parsed?.nfeProc?.NFe?.infNFe?.["@_Id"] || parsed?.NFe?.infNFe?.["@_Id"];

  if (idAttr && typeof idAttr === "string") {
    return idAttr.replace(/^NFe/, "");
  }

  const chNFe =
    parsed?.nfeProc?.protNFe?.infProt?.chNFe || parsed?.protNFe?.infProt?.chNFe;

  if (typeof chNFe === "string") {
    return chNFe;
  }

  return null;
}

function makeConflictError(
  message: string,
  code: string,
  extra?: Record<string, unknown>,
) {
  const err = new Error(message) as Error & {
    statusCode?: number;
    code?: string;
    importId?: number;
    details?: Record<string, unknown>;
  };

  err.statusCode = 409;
  err.code = code;

  if (extra) {
    Object.assign(err, extra);
    err.details = extra;
  }

  return err;
}

function makeValidationError(
  message: string,
  code: string,
  extra?: Record<string, unknown>,
) {
  const err = new Error(message) as Error & {
    statusCode?: number;
    code?: string;
    details?: Record<string, unknown>;
  };

  err.statusCode = 422;
  err.code = code;

  if (extra) {
    Object.assign(err, extra);
    err.details = extra;
  }

  return err;
}

export async function importXml(
  companyId: number,
  _userId: number,
  input: ImportXmlInput,
) {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    parseTagValue: false,
    parseAttributeValue: false,
    trimValues: true,
  });

  let parsed: any;

  try {
    parsed = parser.parse(input.xmlContent);
  } catch {
    throw makeValidationError("XML inválido.", "PURCHASE_ENTRY_XML_INVALID");
  }

  const infNFe = parsed?.nfeProc?.NFe?.infNFe ?? parsed?.NFe?.infNFe;

  if (!infNFe) {
    throw makeValidationError(
      "Estrutura de NF-e não encontrada.",
      "PURCHASE_ENTRY_XML_STRUCTURE_INVALID",
    );
  }

  const accessKey = extractAccessKey(parsed);

  if (!accessKey || accessKey.length !== 44) {
    throw makeValidationError(
      "Chave de acesso não encontrada ou inválida.",
      "PURCHASE_ENTRY_XML_ACCESS_KEY_INVALID",
    );
  }

  const duplicateId = await repo.existsImportByAccessKey(companyId, accessKey);

  if (duplicateId) {
    throw makeConflictError(
      "XML já importado para esta empresa.",
      "PURCHASE_ENTRY_XML_DUPLICATE",
      {
        importId: duplicateId,
        accessKey,
      },
    );
  }

  const ide = infNFe?.ide ?? {};
  const emit = infNFe?.emit ?? {};
  const enderEmit = emit?.enderEmit ?? {};
  const dest = infNFe?.dest ?? {};
  const cobr = infNFe?.cobr ?? {};
  const transp = infNFe?.transp ?? {};
  const transporta = transp?.transporta ?? {};
  const veicTransp = transp?.veicTransp ?? {};

  const dups = ensureArray(cobr?.dup);
  const det = ensureArray(infNFe?.det);
  const totalIcms = infNFe?.total?.ICMSTot ?? {};

  const supplierDocument =
    onlyDigits(getText(emit?.CNPJ) || getText(emit?.CPF)) || null;

  const destinatarioDocumento =
    onlyDigits(getText(dest?.CNPJ) || getText(dest?.CPF)) || null;

  const companyDocumentRaw = await repo.getCompanyDocument(companyId);
  const companyDocument = onlyDigits(companyDocumentRaw);

  if (!companyDocument) {
    throw makeValidationError(
      "A empresa atual está sem documento cadastrado para validar o XML.",
      "PURCHASE_ENTRY_COMPANY_DOCUMENT_MISSING",
    );
  }

  if (!destinatarioDocumento) {
    throw makeValidationError(
      "Destinatário do XML não encontrado.",
      "PURCHASE_ENTRY_XML_DEST_MISSING",
    );
  }

  if (destinatarioDocumento !== companyDocument) {
    throw makeConflictError(
      "Este XML não pertence à empresa atual.",
      "PURCHASE_ENTRY_XML_COMPANY_MISMATCH",
      {
        xmlDestDocument: destinatarioDocumento,
        companyDocument,
        accessKey,
      },
    );
  }

  const supplierId = await repo.findSupplierByDocument(companyId, supplierDocument);

  const items: Array<{
    lineNo: number;
    supplierCode: string | null;
    ean: string | null;
    description: string;
    ncm: string | null;
    cfop: string | null;
    uom: string | null;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    productId: number | null;
    matchStatus: "PENDING" | "MATCHED" | "REVIEW" | "NEW_PRODUCT";
    matchNotes: string | null;
    grossUnitCost: number;
    freightAllocated: number;
    insuranceAllocated: number;
    otherExpensesAllocated: number;
    discountAllocated: number;
    landedTotalCost: number;
    landedUnitCost: number;
    weightKg: number | null;
  }> = [];

  let pendingCount = 0;

  for (let i = 0; i < det.length; i++) {
    const prod = det[i]?.prod ?? {};

    const quantity = toNumber(prod?.qCom);
    const unitPrice = toNumber(prod?.vUnCom);
    const totalPrice = toNumber(prod?.vProd);

    const match = await repo.findProductMatch(companyId, {
      ean: getText(prod?.cEAN),
      supplierCode: getText(prod?.cProd),
      description: getText(prod?.xProd) ?? "Item sem descrição",
    });

    if (!match.productId) {
      pendingCount += 1;
    }

    items.push({
      lineNo: i + 1,
      supplierCode: getText(prod?.cProd),
      ean: getText(prod?.cEAN),
      description: getText(prod?.xProd) ?? "Item sem descrição",
      ncm: getText(prod?.NCM),
      cfop: getText(prod?.CFOP),
      uom: getText(prod?.uCom),
      quantity,
      unitPrice,
      totalPrice,
      productId: match.productId,
      matchStatus: match.matchStatus,
      matchNotes: match.matchNotes,

      grossUnitCost: unitPrice,
      freightAllocated: 0,
      insuranceAllocated: 0,
      otherExpensesAllocated: 0,
      discountAllocated: 0,
      landedTotalCost: totalPrice,
      landedUnitCost: quantity > 0 ? Number((totalPrice / quantity).toFixed(6)) : 0,
      weightKg: null,
    });
  }

  const rawIssueDate = getText(ide?.dhEmi) || getText(ide?.dEmi);
  const normalizedIssueDate = rawIssueDate ? new Date(rawIssueDate) : null;

  if (
    rawIssueDate &&
    (!normalizedIssueDate || Number.isNaN(normalizedIssueDate.getTime()))
  ) {
    throw makeValidationError(
      "Data de emissão inválida no XML.",
      "PURCHASE_ENTRY_XML_ISSUE_DATE_INVALID",
    );
  }

  const installments =
    dups.length > 0
      ? dups.map((dup: any, index: number) => ({
          lineNo: index + 1,
          installmentNumber: getText(dup?.nDup),
          dueDate: getText(dup?.dVenc),
          amount: toNumber(dup?.vDup),
        }))
      : [
          {
            lineNo: 1,
            installmentNumber: "001",
            dueDate: normalizedIssueDate
              ? normalizedIssueDate.toISOString().slice(0, 10)
              : null,
            amount: toNumber(totalIcms?.vNF),
          },
        ];

  const hasPendingHeader = !supplierId;

  const status = !hasPendingHeader && pendingCount === 0 ? "READY" : "MATCH_PENDING";

  const importId = await repo.createImport(companyId, {
    accessKey,
    invoiceNumber: getText(ide?.nNF),
    invoiceSeries: getText(ide?.serie),
    issueDate: normalizedIssueDate ? normalizedIssueDate.toISOString() : null,

    supplierDocument,
    supplierName: getText(emit?.xNome),
    supplierIe: getText(emit?.IE),
    supplierId,

    supplierAddressLine1:
      [getText(enderEmit?.xLgr), getText(enderEmit?.nro)].filter(Boolean).join(", ") ||
      null,
    supplierAddressLine2: getText(enderEmit?.xCpl),
    supplierDistrict: getText(enderEmit?.xBairro),
    supplierCity: getText(enderEmit?.xMun),
    supplierState: getText(enderEmit?.UF),
    supplierZipCode: getText(enderEmit?.CEP),
    supplierCountry: getText(enderEmit?.xPais) || "BR",

    chartAccountId: 5,
    costCenterId: 9,
    paymentTermId: installments.length > 1 ? 2 : 1,

    totalAmount: toNumber(totalIcms?.vNF),
    productsAmount: toNumber(totalIcms?.vProd),
    freightAmount: toNumber(totalIcms?.vFrete),
    insuranceAmount: toNumber(totalIcms?.vSeg),
    otherExpensesAmount: toNumber(totalIcms?.vOutro),
    discountAmount: toNumber(totalIcms?.vDesc),

    carrierId: null,
    carrierVehicleId: null,
    freightMode: getText(transp?.modFrete),
    carrierNameXml: getText(transporta?.xNome),
    carrierDocumentXml:
      onlyDigits(getText(transporta?.CNPJ) || getText(transporta?.CPF)) || null,
    carrierIeXml: getText(transporta?.IE),

    allocationMethod: "VALUE",
    costPolicy: "LANDED_LAST_COST",
    pricePolicy: "NONE",
    markupPercent: null,
    marginPercent: null,

    purchaseOrderId: null,

    fileName: input.fileName,
    xmlContent: input.xmlContent,
    matchSummary: hasPendingHeader
      ? "Fornecedor pendente e/ou itens pendentes"
      : pendingCount > 0
        ? "Itens pendentes de vínculo"
        : "Pronto para confirmar",
    status,
    items,
    installments,
  });

  return repo.getImportById(companyId, importId);
}

export async function listImports(companyId: number, query: PurchaseEntryListQuery) {
  return repo.listImports(companyId, query);
}

export async function getImportById(companyId: number, id: number) {
  return repo.getImportById(companyId, id);
}

export async function getFinancialOptions(companyId: number) {
  const [chartAccounts, costCenters, paymentTerms] = await Promise.all([
    repo.listChartAccountsMini(companyId),
    repo.listCostCentersMini(companyId),
    repo.listPaymentTermsMini(companyId),
  ]);

  return {
    chartAccounts,
    costCenters,
    paymentTerms,
  };
}

async function refreshStatus(companyId: number, id: number) {
  const counts = await repo.getImportPendingCounts(companyId, id);

  if (!counts.headerReady || counts.pendingItems > 0) {
    await repo.updateImportStatus(
      companyId,
      id,
      "MATCH_PENDING",
      !counts.headerReady
        ? "Fornecedor pendente e/ou itens pendentes"
        : "Itens pendentes de vínculo",
    );
  } else {
    await repo.updateImportStatus(companyId, id, "READY", "Pronto para confirmar");
  }
}

export async function updateImportFinancial(
  companyId: number,
  id: number,
  input: UpdateImportFinancialInput,
) {
  await repo.updateImportFinancial(companyId, id, input);
  return repo.getImportById(companyId, id);
}

export async function updateImportLogistics(
  companyId: number,
  id: number,
  input: UpdateImportLogisticsInput,
) {
  await repo.updateImportLogistics(companyId, id, input);
  return repo.getImportById(companyId, id);
}

export async function matchSupplier(
  companyId: number,
  id: number,
  input: MatchSupplierInput,
) {
  await repo.updateImportSupplier(companyId, id, input.supplierId);
  await refreshStatus(companyId, id);
  return repo.getImportById(companyId, id);
}

export async function createSupplierFromImport(
  companyId: number,
  id: number,
  input: CreateSupplierFromImportInput,
) {
  await repo.createSupplierFromImport(companyId, id, input);
  await refreshStatus(companyId, id);
  return repo.getImportById(companyId, id);
}

export async function matchProduct(
  companyId: number,
  id: number,
  itemId: number,
  input: MatchProductInput,
) {
  await repo.updateImportItemProduct(companyId, id, itemId, input.productId);
  await refreshStatus(companyId, id);
  return repo.getImportById(companyId, id);
}

export async function createProductFromImportItem(
  companyId: number,
  id: number,
  itemId: number,
  input: CreateProductFromImportItemInput,
) {
  await repo.createProductFromImportItem(companyId, id, itemId, input);
  await refreshStatus(companyId, id);
  return repo.getImportById(companyId, id);
}

export async function updateImportItem(
  companyId: number,
  id: number,
  itemId: number,
  input: UpdateImportItemInput,
) {
  await repo.updateImportItem(companyId, id, itemId, input);
  return repo.getImportById(companyId, id);
}

export async function updateImportInstallment(
  companyId: number,
  id: number,
  installmentId: number,
  input: UpdateImportInstallmentInput,
) {
  await repo.updateImportInstallment(companyId, id, installmentId, input);
  return repo.getImportById(companyId, id);
}

export async function confirmImport(companyId: number, userId: number, id: number) {
  return repo.confirmImport(companyId, userId, id);
}

export async function cancelImport(companyId: number, id: number) {
  await repo.cancelImport(companyId, id);
  return { ok: true };
}
import { XMLParser } from "fast-xml-parser";
import * as repo from "./purchase_entries.repository";
import type {
  CreateProductFromImportItemInput,
  CreateSupplierFromImportInput,
  ImportXmlInput,
  MatchProductInput,
  MatchSupplierInput,
  PurchaseEntryListQuery,
} from "./purchase_entries.schema";

function ensureArray<T>(value: T | T[] | undefined | null): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function onlyDigits(value: string | null | undefined) {
  return (value ?? "").replace(/\D/g, "");
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
    parsed?.nfeProc?.NFe?.infNFe?.["@_Id"] ||
    parsed?.NFe?.infNFe?.["@_Id"];

  if (idAttr && typeof idAttr === "string") {
    return idAttr.replace(/^NFe/, "");
  }

  const chNFe =
    parsed?.nfeProc?.protNFe?.infProt?.chNFe ||
    parsed?.protNFe?.infProt?.chNFe;

  if (typeof chNFe === "string") {
    return chNFe;
  }

  return null;
}

export async function importXml(companyId: number, _userId: number, input: ImportXmlInput) {
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
    throw new Error("XML inválido.");
  }

  const infNFe = parsed?.nfeProc?.NFe?.infNFe ?? parsed?.NFe?.infNFe;
  if (!infNFe) {
    throw new Error("Estrutura de NF-e não encontrada.");
  }

  const accessKey = extractAccessKey(parsed);
  if (!accessKey || accessKey.length !== 44) {
    throw new Error("Chave de acesso não encontrada ou inválida.");
  }

  const duplicateId = await repo.existsImportByAccessKey(companyId, accessKey);
  if (duplicateId) {
    throw new Error(`XML já importado para esta empresa. Importação #${duplicateId}.`);
  }

  const ide = infNFe?.ide ?? {};
  const emit = infNFe?.emit ?? {};
  const enderEmit = emit?.enderEmit ?? {};
  const cobr = infNFe?.cobr ?? {};
  const dups = ensureArray(cobr?.dup);
  const det = ensureArray(infNFe?.det);
  const totalIcms = infNFe?.total?.ICMSTot ?? {};

  const supplierDocument =
    onlyDigits(getText(emit?.CNPJ) || getText(emit?.CPF)) || null;

  const supplierId = await repo.findSupplierByDocument(companyId, supplierDocument);

  const items = [];
  let pendingCount = 0;

  for (let i = 0; i < det.length; i++) {
    const prod = det[i]?.prod ?? {};
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
      quantity: toNumber(prod?.qCom),
      unitPrice: toNumber(prod?.vUnCom),
      totalPrice: toNumber(prod?.vProd),
      productId: match.productId,
      matchStatus: match.matchStatus,
      matchNotes: match.matchNotes,
    });
  }

  const rawIssueDate = getText(ide?.dhEmi) || getText(ide?.dEmi);
  const normalizedIssueDate = rawIssueDate ? new Date(rawIssueDate) : null;

  if (rawIssueDate && (!normalizedIssueDate || Number.isNaN(normalizedIssueDate.getTime()))) {
    throw new Error("Data de emissão inválida no XML.");
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
            dueDate: normalizedIssueDate ? normalizedIssueDate.toISOString().slice(0, 10) : null,
            amount: toNumber(totalIcms?.vNF),
          },
        ];

  const hasPendingHeader = !supplierId;
  const status =
    !hasPendingHeader && pendingCount === 0 ? "READY" : "MATCH_PENDING";

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
      [getText(enderEmit?.xLgr), getText(enderEmit?.nro)]
        .filter(Boolean)
        .join(", ") || null,
    supplierAddressLine2: getText(enderEmit?.xCpl),
    supplierDistrict: getText(enderEmit?.xBairro),
    supplierCity: getText(enderEmit?.xMun),
    supplierState: getText(enderEmit?.UF),
    supplierZipCode: getText(enderEmit?.CEP),
    supplierCountry: getText(enderEmit?.xPais) || "BR",

    totalAmount: toNumber(totalIcms?.vNF),
    productsAmount: toNumber(totalIcms?.vProd),
    freightAmount: toNumber(totalIcms?.vFrete),
    discountAmount: toNumber(totalIcms?.vDesc),

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

export async function confirmImport(companyId: number, userId: number, id: number) {
  return repo.confirmImport(companyId, userId, id);
}

export async function cancelImport(companyId: number, id: number) {
  await repo.cancelImport(companyId, id);
  return { ok: true };
}
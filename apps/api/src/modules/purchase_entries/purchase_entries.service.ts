import { XMLParser } from "fast-xml-parser";
import * as importRepo from "./purchase_entries.repository";
import * as definitiveRepo from "./purchase_entries.definitive.repository";
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

function asArray<T>(value: T | T[] | null | undefined): T[] {
    if (value == null) return [];
    return Array.isArray(value) ? value : [value];
}

function text(value: unknown): string | null {
    if (value == null) return null;
    const v = String(value).trim();
    return v || null;
}

function num(value: unknown): number {
    if (value == null || value === "") return 0;
    const normalized = String(value).replace(",", ".");
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
}

function extractAccessKey(infNFe: any): string {
    const attrs = infNFe?.["@_Id"] ?? infNFe?.["@_id"] ?? "";
    return String(attrs).replace(/^NFe/i, "").trim();
}

function mapFreightMode(value: string | null): string | null {
    const v = String(value ?? "").trim();

    switch (v) {
        case "0":
            return "CIF";
        case "1":
            return "FOB";
        case "2":
            return "THIRD_PARTY";
        case "3":
        case "4":
            return "OWN";
        case "9":
            return "NO_FREIGHT";
        default:
            return null;
    }
}

export async function importPurchaseEntryXml(
    companyId: number,
    xmlContent: string,
    fileName: string,
) {
    const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: "@_",
        parseTagValue: false,
        trimValues: true,
    });

    const parsed = parser.parse(xmlContent);
    const nfeProc = parsed?.nfeProc ?? parsed?.NFe ?? parsed;
    const nfe = nfeProc?.NFe ?? parsed?.NFe ?? parsed?.nfeProc?.NFe ?? parsed;
    const infNFe = nfe?.infNFe;

    if (!infNFe) {
        throw new Error("XML NF-e inválido: tag infNFe não encontrada.");
    }

    const accessKey = extractAccessKey(infNFe);
    if (!accessKey || accessKey.length !== 44) {
        throw new Error("Chave de acesso da NF-e inválida.");
    }

    const existingImportId = await importRepo.existsImportByAccessKey(companyId, accessKey);
    if (existingImportId) {
        const err = new Error("XML já importado anteriormente para esta empresa.") as Error & {
            statusCode?: number;
            code?: string;
            details?: Record<string, unknown>;
        };
        err.statusCode = 409;
        err.code = "PURCHASE_ENTRY_XML_DUPLICATE";
        err.details = { importId: existingImportId, accessKey };
        throw err;
    }

    const companyDocument = await importRepo.getCompanyDocument(companyId);

    const recipientDocument =
        text(infNFe?.dest?.CNPJ) ??
        text(infNFe?.dest?.CPF) ??
        text(infNFe?.dest?.cnpj) ??
        text(infNFe?.dest?.cpf);

    const issuerDocument =
        text(infNFe?.emit?.CNPJ) ??
        text(infNFe?.emit?.CPF) ??
        text(infNFe?.emit?.cnpj) ??
        text(infNFe?.emit?.cpf);

    const normalizeDigits = (v: string | null) => String(v ?? "").replace(/\D/g, "");

    if (
        normalizeDigits(companyDocument) &&
        normalizeDigits(recipientDocument) &&
        normalizeDigits(companyDocument) !== normalizeDigits(recipientDocument)
    ) {
        const err = new Error(
            "Este XML não pertence à empresa atual. O destinatário da NF-e difere do documento da empresa logada.",
        ) as Error & {
            statusCode?: number;
            code?: string;
            details?: Record<string, unknown>;
        };

        err.statusCode = 422;
        err.code = "PURCHASE_ENTRY_XML_COMPANY_MISMATCH";
        err.details = {
            companyDocument: normalizeDigits(companyDocument),
            xmlRecipientDocument: normalizeDigits(recipientDocument),
            xmlIssuerDocument: normalizeDigits(issuerDocument),
            accessKey,
        };

        throw err;
    }

    const ide = infNFe?.ide ?? {};
    const emit = infNFe?.emit ?? {};
    const transp = infNFe?.transp ?? {};
    const total = infNFe?.total?.ICMSTot ?? {};
    const cobr = infNFe?.cobr ?? {};
    const detList = asArray(infNFe?.det);

    const supplierDocument = text(emit?.CNPJ) ?? text(emit?.CPF);
    const supplierName = text(emit?.xNome);
    const supplierIe = text(emit?.IE);

    const supplierAddressLine1 = [text(emit?.enderEmit?.xLgr), text(emit?.enderEmit?.nro)]
        .filter(Boolean)
        .join(", ") || null;

    const supplierAddressLine2 = text(emit?.enderEmit?.xCpl);
    const supplierDistrict = text(emit?.enderEmit?.xBairro);
    const supplierCity = text(emit?.enderEmit?.xMun);
    const supplierState = text(emit?.enderEmit?.UF);
    const supplierZipCode = text(emit?.enderEmit?.CEP);
    const supplierCountry = text(emit?.enderEmit?.cPais) || text(emit?.enderEmit?.xPais);

    const carrierNameXml = text(transp?.transporta?.xNome);
    const carrierDocumentXml = text(transp?.transporta?.CNPJ) ?? text(transp?.transporta?.CPF);
    const carrierIeXml = text(transp?.transporta?.IE);
    const freightMode = mapFreightMode(text(transp?.modFrete));

    const items = [];
    for (const det of detList) {
        const prod = det?.prod ?? {};
        const rawLineNo = det?.["@_nItem"] ?? det?.nItem ?? items.length + 1;
        const lineNo: number = Number(rawLineNo);

        const match = await importRepo.findProductMatch(companyId, {
            ean: text(prod?.cEAN) ?? text(prod?.cEANTrib),
            supplierCode: text(prod?.cProd),
            description: text(prod?.xProd) ?? "",
        });

        const quantity = num(prod?.qCom);
        const unitPrice = num(prod?.vUnCom);
        const totalPrice = num(prod?.vProd);

        items.push({
            lineNo,
            supplierCode: text(prod?.cProd),
            ean: text(prod?.cEAN) ?? text(prod?.cEANTrib),
            description: text(prod?.xProd) ?? "",
            ncm: text(prod?.NCM),
            cfop: text(prod?.CFOP),
            uom: text(prod?.uCom),
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

    const dupList = asArray(cobr?.dup);
    const installments =
        dupList.length > 0
            ? dupList.map((dup: any, index: number) => ({
                lineNo: index + 1,
                installmentNumber: text(dup?.nDup),
                dueDate: text(dup?.dVenc),
                amount: num(dup?.vDup),
            }))
            : [
                {
                    lineNo: 1,
                    installmentNumber: "1",
                    dueDate: text(ide?.dhEmi)?.slice(0, 10) ?? text(ide?.dEmi),
                    amount: num(total?.vNF),
                },
            ];

    const supplierId = await importRepo.findSupplierByDocument(companyId, supplierDocument);

    const pendingCount = items.filter((item) => !item.productId).length;
    const status: PurchaseEntryImportStatus =
        pendingCount > 0 || !supplierId ? "MATCH_PENDING" : "READY";

    const matchSummary = !supplierId
        ? "Fornecedor pendente de vínculo"
        : pendingCount > 0
            ? `${pendingCount} item(ns) pendente(s) de revisão`
            : "Pronto para confirmação";

    const importId = await importRepo.createImport(companyId, {
        accessKey,
        invoiceNumber: text(ide?.nNF),
        invoiceSeries: text(ide?.serie),
        issueDate: text(ide?.dhEmi)?.slice(0, 10) ?? text(ide?.dEmi),

        supplierDocument,
        supplierName,
        supplierIe,
        supplierId,

        supplierAddressLine1,
        supplierAddressLine2,
        supplierDistrict,
        supplierCity,
        supplierState,
        supplierZipCode,
        supplierCountry,

        chartAccountId: null,
        costCenterId: null,
        paymentTermId: null,

        totalAmount: num(total?.vNF),
        productsAmount: num(total?.vProd),
        freightAmount: num(total?.vFrete),
        insuranceAmount: num(total?.vSeg),
        otherExpensesAmount: num(total?.vOutro),
        discountAmount: num(total?.vDesc),

        carrierId: null,
        carrierVehicleId: null,
        freightMode,
        carrierNameXml,
        carrierDocumentXml,
        carrierIeXml,

        allocationMethod: "VALUE",
        costPolicy: "LANDED_LAST_COST",
        pricePolicy: "NONE",
        markupPercent: null,
        marginPercent: null,

        purchaseOrderId: null,

        fileName,
        xmlContent,
        matchSummary,
        status,

        items,
        installments,
    });

    await importRepo.recalcImportTotals(companyId, importId, true);
    await importRepo.recalculateImportItemAllocations(companyId, importId);

    return importRepo.getImportById(companyId, importId);
}

export async function listPurchaseEntryImports(
    companyId: number,
    query: PurchaseEntryListQuery,
) {
    return importRepo.listImports(companyId, query);
}

export async function getPurchaseEntryImportById(companyId: number, id: number) {
    return importRepo.getImportById(companyId, id);
}

export async function listSuppliersMini(companyId: number) {
    return importRepo.listSuppliersMini(companyId);
}

export async function listProductsMini(companyId: number) {
    return importRepo.listProductsMini(companyId);
}

export async function listChartAccountsMini(companyId: number) {
    return importRepo.listChartAccountsMini(companyId);
}

export async function listCostCentersMini(companyId: number) {
    return importRepo.listCostCentersMini(companyId);
}

export async function listPaymentTermsMini(companyId: number) {
    return importRepo.listPaymentTermsMini(companyId);
}

export async function updateImportSupplier(companyId: number, id: number, supplierId: number) {
    await importRepo.updateImportSupplier(companyId, id, supplierId);
    return importRepo.getImportById(companyId, id);
}

export async function updateImportItemProduct(
    companyId: number,
    id: number,
    itemId: number,
    productId: number,
) {
    await importRepo.updateImportItemProduct(companyId, id, itemId, productId);
    return importRepo.getImportById(companyId, id);
}

export async function updateImportItem(
    companyId: number,
    id: number,
    itemId: number,
    input: UpdateImportItemInput,
) {
    await importRepo.updateImportItem(companyId, id, itemId, input);
    return importRepo.getImportById(companyId, id);
}

export async function updateImportInstallment(
    companyId: number,
    id: number,
    installmentId: number,
    input: UpdateImportInstallmentInput,
) {
    await importRepo.updateImportInstallment(companyId, id, installmentId, input);
    return importRepo.getImportById(companyId, id);
}

export async function updateImportFinancial(
    companyId: number,
    id: number,
    input: UpdateImportFinancialInput,
) {
    await importRepo.updateImportFinancial(companyId, id, input);
    return importRepo.getImportById(companyId, id);
}

export async function updateImportLogistics(
    companyId: number,
    id: number,
    input: UpdateImportLogisticsInput,
) {
    await importRepo.updateImportLogistics(companyId, id, input);
    return importRepo.getImportById(companyId, id);
}

export async function updateImportEconomics(
    companyId: number,
    id: number,
    input: UpdateImportEconomicsInput,
) {
    return importRepo.updateImportEconomics(companyId, id, input);
}

export async function updateImportItemManualAllocation(
    companyId: number,
    importId: number,
    itemId: number,
    payload: {
        freightAllocated?: number;
        insuranceAllocated?: number;
        otherExpensesAllocated?: number;
        discountAllocated?: number;
    },
) {
    await importRepo.updateImportItemManualAllocation(companyId, importId, itemId, payload);
    return importRepo.getImportById(companyId, importId);
}

export async function buildConfirmationPreview(companyId: number, importId: number) {
    return importRepo.buildConfirmationPreview(companyId, importId);
}

export async function getImportPendingCounts(companyId: number, id: number) {
    return importRepo.getImportPendingCounts(companyId, id);
}

export async function updateImportStatus(
    companyId: number,
    id: number,
    status: PurchaseEntryImportStatus,
    matchSummary?: string | null,
) {
    await importRepo.updateImportStatus(companyId, id, status, matchSummary);
    return importRepo.getImportById(companyId, id);
}

export async function cancelImport(companyId: number, id: number) {
    await importRepo.cancelImport(companyId, id);
    return { success: true };
}

export async function createSupplierFromImport(
    companyId: number,
    importId: number,
    input?: CreateSupplierFromImportInput,
) {
    const supplierId = await importRepo.createSupplierFromImport(companyId, importId, input);
    return {
        supplierId,
        import: await importRepo.getImportById(companyId, importId),
    };
}

export async function createProductFromImportItem(
    companyId: number,
    importId: number,
    itemId: number,
    input?: CreateProductFromImportItemInput,
) {
    const productId = await importRepo.createProductFromImportItem(companyId, importId, itemId, input);
    return {
        productId,
        import: await importRepo.getImportById(companyId, importId),
    };
}

export async function confirmImport(companyId: number, userId: number, id: number) {
    return importRepo.confirmImport(companyId, userId, id);
}

export async function listDefinitiveEntries(
    companyId: number,
    query: PurchaseEntryDefinitiveListQuery,
) {
    return definitiveRepo.listDefinitiveEntries(companyId, query);
}

export async function getDefinitiveEntryById(companyId: number, id: number) {
    return definitiveRepo.getDefinitiveEntryById(companyId, id);
}

export const listImports = listPurchaseEntryImports;
export const getImportById = getPurchaseEntryImportById;
export const getDefinitiveById = getDefinitiveEntryById;
export async function importXml(
    companyId: number,
    xmlContentOrUserId: string | number,
    maybeXmlContentOrFileName?: string,
    maybeFileName?: string,
) {
    // Compatibilidade com controller antigo:
    // importXml(companyId, xmlContent, fileName)
    if (typeof xmlContentOrUserId === "string") {
        return importPurchaseEntryXml(
            companyId,
            xmlContentOrUserId,
            maybeXmlContentOrFileName ?? "import.xml",
        );
    }

    // Compatibilidade com controller antigo:
    // importXml(companyId, userId, xmlContent, fileName)
    return importPurchaseEntryXml(
        companyId,
        maybeXmlContentOrFileName ?? "",
        maybeFileName ?? "import.xml",
    );
}

export async function matchSupplier(
    companyId: number,
    importId: number,
    input: number | { supplierId: number },
) {
    const supplierId = typeof input === "number" ? input : Number(input?.supplierId);

    await updateImportSupplier(companyId, importId, supplierId);
    return getPurchaseEntryImportById(companyId, importId);
}

export async function matchProduct(
    companyId: number,
    importId: number,
    itemId: number,
    input: number | { productId: number },
) {
    const productId = typeof input === "number" ? input : Number(input?.productId);

    await updateImportItemProduct(companyId, importId, itemId, productId);
    return getPurchaseEntryImportById(companyId, importId);
}

export async function previewConfirmation(companyId: number, importId: number) {
    return buildConfirmationPreview(companyId, importId);
}

export async function updateImportItemAllocation(
    companyId: number,
    importId: number,
    itemId: number,
    payload: {
        freightAllocated?: number;
        insuranceAllocated?: number;
        otherExpensesAllocated?: number;
        discountAllocated?: number;
    },
) {
    await updateImportItemManualAllocation(companyId, importId, itemId, payload);
    return getPurchaseEntryImportById(companyId, importId);
}

export async function getFinancialOptions(companyId: number) {
    const [chartAccounts, costCenters, paymentTerms] = await Promise.all([
        listChartAccountsMini(companyId),
        listCostCentersMini(companyId),
        listPaymentTermsMini(companyId),
    ]);

    return {
        chartAccounts,
        costCenters,
        paymentTerms,
    };
}


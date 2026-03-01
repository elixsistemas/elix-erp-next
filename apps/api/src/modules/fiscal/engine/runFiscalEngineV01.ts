export const ENGINE_VERSION = "v0.1-deterministic";

export type FiscalEngineContext = {
  companyId: number;
  sourceType: "sale";
  sourceId: number;
  docType: "NFE" | "NFSE" | "BOTH";
  issuedAt: string;
  originUF: string | null;
  destUF: string | null;
  crt: number | null;
  icmsContributor: boolean | null;
};

export type FiscalEngineItem = {
  lineId: number;
  productId: number | null;
  kind: "product" | "service" | null;
  trackInventory: boolean | null;
  description: string;
  ncmId: number | null;
  ncmCode: string | null;
  cest: string | null;
  qty: number;
  unitPrice: number;
  total: number;
};

export type FiscalAlert = {
  code:
    | "PRODUCT_NO_NCM"
    | "NCM_INVALID"
    | "SERVICE_WITH_NCM"
    | "TRACK_INV_MISMATCH";
  severity: "warn" | "block";
  message: string;
  lineId?: number;
  productId?: number | null;
};

export type FiscalEngineResult = {
  engineVersion: string;
  alerts: FiscalAlert[];
  items: any[];
};

export function runFiscalEngineV01(
  ctx: FiscalEngineContext,
  items: FiscalEngineItem[]
): FiscalEngineResult {
  const alerts: FiscalAlert[] = [];

  for (const it of items) {
    // 🔹 Validações para NFE (produto físico)
    if (ctx.docType === "NFE" || ctx.docType === "BOTH") {
      if (it.kind === "product") {
        if (!it.ncmId) {
          alerts.push({
            code: "PRODUCT_NO_NCM",
            severity: "block",
            message: "Produto sem NCM (obrigatório para NFe).",
            lineId: it.lineId,
            productId: it.productId,
          });
        }

        if (!it.ncmCode && it.ncmId) {
          alerts.push({
            code: "NCM_INVALID",
            severity: "block",
            message: "NCM inválido ou não encontrado.",
            lineId: it.lineId,
            productId: it.productId,
          });
        }

        if (it.trackInventory === false) {
          alerts.push({
            code: "TRACK_INV_MISMATCH",
            severity: "warn",
            message:
              "Produto físico com controle de estoque desativado.",
            lineId: it.lineId,
            productId: it.productId,
          });
        }
      }
    }

    // 🔹 Higiene de dados
    if (it.kind === "service" && it.ncmId) {
      alerts.push({
        code: "SERVICE_WITH_NCM",
        severity: "warn",
        message: "Serviço não deveria possuir NCM.",
        lineId: it.lineId,
        productId: it.productId,
      });
    }
  }

  return {
    engineVersion: ENGINE_VERSION,
    alerts,
    items,
  };
}
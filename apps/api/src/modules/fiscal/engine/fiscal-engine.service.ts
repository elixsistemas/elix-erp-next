// apps/api/src/modules/fiscal/engine/fiscal-engine.service.ts

export type FiscalEngineVersion = "0.1";
export type DocType = "NFE" | "NFSE" | "BOTH";

export type FiscalContext = {
  companyId: number;
  sourceType: "order" | "sale";
  sourceId: number;
  issuedAt: string; // ISO
  originUF: string | null;
  destUF: string | null;
  crt: 1 | 2 | 3 | null;
  icmsContributor: boolean | null;

  // ✅ opcional: só quem quer “modo B” passa
  docType?: DocType;
};

export type FiscalItemInput = {
  lineId: number;
  productId: number | null;
  description: string;

  // ✅ já existe
  ncmId: number | null;

  // 🔜 quando você plugar snapshot rico, pode preencher também
  kind?: "product" | "service" | null;
  ncmCode?: string | null;

  cest: string | null;
  qty: number;
  unitPrice: number;
  total: number;
};

export type FiscalItemResult = {
  lineId: number;
  cfop: string | null;
  flags: string[];
};

export type FiscalAlert = {
  code: string;
  severity: "warn" | "block";
  message: string;
  lineId?: number;
  productId?: number | null;
};

export type FiscalResult = {
  engineVersion: FiscalEngineVersion;

  headerFlags: string[];
  items: FiscalItemResult[];

  // ✅ novo (não quebra ninguém)
  alerts: FiscalAlert[];
};

const normUF = (uf: string | null) =>
  uf ? uf.trim().toUpperCase().slice(0, 2) : null;

const wantsNfe = (docType?: DocType) => docType === "NFE" || docType === "BOTH";
const wantsNfse = (docType?: DocType) => docType === "NFSE" || docType === "BOTH";

export function runFiscalEngineV01(ctx: FiscalContext, items: FiscalItemInput[]): FiscalResult {
  const originUF = normUF(ctx.originUF);
  const destUF   = normUF(ctx.destUF);

  const headerFlags: string[] = [];
  if (!originUF) headerFlags.push("MISSING_ORIGIN_UF");
  if (!destUF)   headerFlags.push("MISSING_DEST_UF");
  if (!ctx.crt)  headerFlags.push("MISSING_COMPANY_TAX_PROFILE");

  const intra = originUF && destUF ? originUF === destUF : false;

  const cfopDefaultIntra = "5102";
  const cfopDefaultInter = "6102";

  const results: FiscalItemResult[] = items.map((it) => {
    const flags: string[] = [];

    // ✅ Regra antiga mantida
    if (!it.ncmId) flags.push("MISSING_NCM");

    let cfop: string | null = null;
    if (originUF && destUF) {
      cfop = intra ? cfopDefaultIntra : cfopDefaultInter;
    } else {
      flags.push("CFOP_UNRESOLVED");
    }

    return { lineId: it.lineId, cfop, flags };
  });

  // ✅ Novo: converter flags em alerts (modo B)
  const alerts: FiscalAlert[] = [];

  // Header flags → alerts
  for (const f of headerFlags) {
    if (f === "MISSING_COMPANY_TAX_PROFILE") {
      alerts.push({
        code: f,
        severity: "warn",
        message: "Perfil tributário da empresa não definido (CRT).",
      });
      continue;
    }

    if (f === "MISSING_ORIGIN_UF" || f === "MISSING_DEST_UF") {
      alerts.push({
        code: f,
        severity: "block",
        message: "UF de origem/destino ausente — não é possível resolver CFOP com segurança.",
      });
      continue;
    }

    alerts.push({ code: f, severity: "warn", message: f });
  }

  // Item flags → alerts
  for (const it of items) {
    const itemRes = results.find((r) => r.lineId === it.lineId);
    const flags = itemRes?.flags ?? [];

    for (const f of flags) {
      if (f === "MISSING_NCM") {
        // 🔥 Só bloqueia se for emissão de NFE/BOTH e se item for product (se kind existir)
        // Se kind não vier, assume conservadoramente que pode ser produto e bloqueia para NFE.
        const kind = it.kind ?? null;
        const shouldBlock =
          wantsNfe(ctx.docType) && (kind === "product" || kind === null);

        alerts.push({
          code: "PRODUCT_NO_NCM",
          severity: shouldBlock ? "block" : "warn",
          message: shouldBlock
            ? "Produto sem NCM (obrigatório para NFe)."
            : "Item sem NCM (verificar cadastro).",
          lineId: it.lineId,
          productId: it.productId,
        });
        continue;
      }

      if (f === "CFOP_UNRESOLVED") {
        alerts.push({
          code: f,
          severity: "block",
          message: "CFOP não pôde ser resolvido (UF ausente).",
          lineId: it.lineId,
          productId: it.productId,
        });
        continue;
      }

      alerts.push({
        code: f,
        severity: "warn",
        message: f,
        lineId: it.lineId,
        productId: it.productId,
      });
    }

    // Higiene: serviço com NCM (se kind vier)
    if (wantsNfse(ctx.docType) && it.kind === "service" && it.ncmId) {
      alerts.push({
        code: "SERVICE_WITH_NCM",
        severity: "warn",
        message: "Serviço possui NCM preenchido (recomendado limpar).",
        lineId: it.lineId,
        productId: it.productId,
      });
    }
  }

  return { engineVersion: "0.1", headerFlags, items: results, alerts };
}
// apps/api/src/modules/fiscal/engine/fiscal-engine.service.ts
export type FiscalEngineVersion = "0.1";

export type FiscalContext = {
  companyId: number;
  sourceType: "order" | "sale";
  sourceId: number;
  issuedAt: string; // ISO date (pode ser created_at/confirmed_at/etc)
  originUF: string | null;
  destUF: string | null;
  crt: 1 | 2 | 3 | null; // perfil vigente
  icmsContributor: boolean | null;
};

export type FiscalItemInput = {
  lineId: number;              // id do item (order_items.id / sale_items.id)
  productId: number | null;
  description: string;
  ncmId: number | null;
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

export type FiscalResult = {
  engineVersion: FiscalEngineVersion;
  headerFlags: string[];
  items: FiscalItemResult[];
};

const normUF = (uf: string | null) =>
  uf ? uf.trim().toUpperCase().slice(0, 2) : null;

export function runFiscalEngineV01(ctx: FiscalContext, items: FiscalItemInput[]): FiscalResult {
  const originUF = normUF(ctx.originUF);
  const destUF   = normUF(ctx.destUF);

  const headerFlags: string[] = [];
  if (!originUF) headerFlags.push("MISSING_ORIGIN_UF");
  if (!destUF)   headerFlags.push("MISSING_DEST_UF");
  if (!ctx.crt)  headerFlags.push("MISSING_COMPANY_TAX_PROFILE");

  const intra = originUF && destUF ? originUF === destUF : false;

  // Defaults v0 (você pode futuramente trocar por tabela de regras)
  const cfopDefaultIntra = "5102";
  const cfopDefaultInter = "6102";

  const results: FiscalItemResult[] = items.map((it) => {
    const flags: string[] = [];
    if (!it.ncmId) flags.push("MISSING_NCM");

    let cfop: string | null = null;
    if (originUF && destUF) {
      cfop = intra ? cfopDefaultIntra : cfopDefaultInter;
    } else {
      flags.push("CFOP_UNRESOLVED");
    }

    return { lineId: it.lineId, cfop, flags };
  });

  return { engineVersion: "0.1", headerFlags, items: results };
}
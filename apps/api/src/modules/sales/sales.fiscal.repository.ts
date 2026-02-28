import { getPool } from "../../config/db";
import sql from "mssql";
import { runFiscalEngineV01 } from "../fiscal/engine/fiscal-engine.service";
import {
  getCompanyUF,
  getCustomerDestUF,
  getActiveCompanyTaxProfile,
  upsertFiscalCalculation,
  hasFiscalSnapshotTx,
} from "../fiscal/engine/fiscal-engine.repository";

const ENGINE_VERSION = "0.1" as const;

async function ensureSaleSnapshotTx(tx: sql.Transaction, companyId: number, saleId: number) {
  const already = await hasFiscalSnapshotTx(tx, companyId, "sale", saleId, ENGINE_VERSION);
  if (already) return;

  const saleRes = await new sql.Request(tx)
    .input("company_id", companyId)
    .input("sale_id", saleId)
    .query(`
      SELECT TOP 1 *
      FROM dbo.sales
      WHERE company_id=@company_id AND id=@sale_id
    `);

  const s = saleRes.recordset[0];
  if (!s) throw new Error("SALE_NOT_FOUND");

  const itemsRes = await new sql.Request(tx)
    .input("company_id", companyId)
    .input("sale_id", saleId)
    .query(`
      SELECT
        si.id,
        si.product_id,
        si.description,
        si.quantity,
        si.unit_price,
        si.total,
        p.ncm_id,
        p.cest,
        p.fiscal_json
      FROM dbo.sale_items si
      JOIN dbo.sales s ON s.id = si.sale_id AND s.company_id = @company_id
      LEFT JOIN dbo.products p ON p.id = si.product_id AND p.company_id = s.company_id
      WHERE si.sale_id = @sale_id
    `);

  const originUF = await getCompanyUF(companyId, tx);
  const destUF = await getCustomerDestUF(companyId, Number(s.customer_id), tx);
  const taxProfile = await getActiveCompanyTaxProfile(companyId, tx);

  const ctx = {
    companyId,
    sourceType: "sale" as const,
    sourceId: saleId,
    issuedAt: new Date().toISOString(),
    originUF,
    destUF,
    crt: taxProfile?.crt ?? null,
    icmsContributor: taxProfile?.icmsContributor ?? null,
  };

  const engineItems = itemsRes.recordset.map((r: any) => ({
    lineId: Number(r.id),
    productId: r.product_id ?? null,
    description: r.description,
    ncmId: r.ncm_id ?? null,
    cest: r.cest ?? null,
    qty: Number(r.quantity),
    unitPrice: Number(r.unit_price),
    total: Number(r.total),
  }));

  const result = runFiscalEngineV01(ctx, engineItems);

  await upsertFiscalCalculation(
    companyId,
    "sale",
    saleId,
    result.engineVersion,
    JSON.stringify(ctx),
    JSON.stringify(result),
    tx
  );
}

export async function issueFiscalTx(args: {
  companyId: number;
  saleId: number;
  type: "NFE" | "NFSE" | "BOTH";
}) {
  const pool = await getPool();
  const tx = new sql.Transaction(pool);

  const companyId = Number(args.companyId);
  const saleId = Number(args.saleId);
  const docType = args.type;

  await tx.begin();

  try {
    // ✅ garante multi-empresa: venda pertence à empresa
    const saleRes = await new sql.Request(tx)
      .input("company_id", companyId)
      .input("sale_id", saleId)
      .query(`
        SELECT TOP 1 id, company_id
        FROM dbo.sales
        WHERE company_id=@company_id AND id=@sale_id
      `);

    const sale = saleRes.recordset[0];
    if (!sale) throw new Error("SALE_NOT_FOUND");

    // ✅ snapshot obrigatório antes de emitir
    await ensureSaleSnapshotTx(tx, companyId, saleId);

    // 2) Carrega itens (blindado por company via JOIN em sales)
    const itemsRes = await new sql.Request(tx)
      .input("company_id", companyId)
      .input("sale_id", saleId)
      .query(`
        SELECT
          si.id,
          si.description,
          si.quantity,
          si.unit_price,
          si.total,
          p.kind
        FROM dbo.sale_items si
        JOIN dbo.sales s
          ON s.id = si.sale_id
         AND s.company_id = @company_id
        INNER JOIN dbo.products p
          ON p.id = si.product_id
         AND p.company_id = s.company_id
        WHERE si.sale_id=@sale_id
      `);

    const items = itemsRes.recordset;

    const products = items.filter((i: any) => i.kind === "product");
    const services = items.filter((i: any) => i.kind === "service");

    const createdDocs: any[] = [];

    async function createDocument(type: "NFE" | "NFSE", docItems: any[]) {
      if (!docItems.length) return;

      // ✅ Regra B: impede duplicidade (por empresa + venda + tipo) se já existir ativo
      const exists = await new sql.Request(tx)
        .input("company_id", companyId)
        .input("sale_id", saleId)
        .input("type", type)
        .query(`
          SELECT TOP 1 id
          FROM dbo.fiscal_documents
          WHERE company_id=@company_id
            AND sale_id=@sale_id
            AND [type]=@type
            AND [status] IN ('draft','issued','error')
          ORDER BY id DESC
        `);

      if (exists.recordset[0]) {
        const err = new Error(`FISCAL_ALREADY_EXISTS:${type}`);
        (err as any).code = "FISCAL_ALREADY_EXISTS";
        (err as any).docType = type;
        throw err;
      }

      const docRes = await new sql.Request(tx)
        .input("company_id", companyId)
        .input("sale_id", saleId)
        .input("type", type)
        .query(`
          INSERT INTO dbo.fiscal_documents (company_id, sale_id, [type])
          OUTPUT INSERTED.*
          VALUES (@company_id, @sale_id, @type)
        `);

      const doc = docRes.recordset[0];

      for (const it of docItems) {
        await new sql.Request(tx)
          .input("document_id", doc.id)
          .input("sale_item_id", it.id)
          .input("description", it.description)
          .input("quantity", it.quantity)
          .input("unit_price", it.unit_price)
          .input("total", it.total)
          .query(`
            INSERT INTO dbo.fiscal_document_items
              (document_id, sale_item_id, description, quantity, unit_price, total)
            VALUES
              (@document_id, @sale_item_id, @description, @quantity, @unit_price, @total)
          `);
      }

      createdDocs.push(doc);
    }

    if (docType === "NFE" || docType === "BOTH") {
      await createDocument("NFE", products);
    }

    if (docType === "NFSE" || docType === "BOTH") {
      await createDocument("NFSE", services);
    }

    await tx.commit();
    return createdDocs;
  } catch (e) {
    await tx.rollback();
    throw e;
  }
}

export async function listFiscalBySale(args: { companyId: number; saleId: number }) {
  const pool = await getPool();

  // garante que venda é da empresa
  const s = await pool.request()
    .input("company_id", args.companyId)
    .input("sale_id", args.saleId)
    .query(`
      SELECT TOP 1 id
      FROM sales
      WHERE company_id=@company_id AND id=@sale_id
    `);

  if (!s.recordset[0]) return null;

  const docs = await pool.request()
    .input("company_id", args.companyId)
    .input("sale_id", args.saleId)
    .query(`
      SELECT id, company_id, sale_id, [type], [status], number, series, created_at
      FROM fiscal_documents
      WHERE company_id=@company_id AND sale_id=@sale_id
      ORDER BY created_at DESC, id DESC
    `);

  const docIds = docs.recordset.map((d: any) => d.id);
  if (docIds.length === 0) return { documents: [] };

  const items = await pool.request()
    .input("ids", docIds.join(","))
    .query(`
      SELECT document_id, sale_item_id, description, quantity, unit_price, total
      FROM fiscal_document_items
      WHERE document_id IN (SELECT value FROM string_split(@ids, ','))
      ORDER BY document_id, id
    `);

  // agrupa itens por documento
  const map = new Map<number, any[]>();
  for (const it of items.recordset) {
    const k = Number(it.document_id);
    if (!map.has(k)) map.set(k, []);
    map.get(k)!.push(it);
  }

  return {
    documents: docs.recordset.map((d: any) => ({
      ...d,
      items: map.get(Number(d.id)) ?? []
    }))
  };
}


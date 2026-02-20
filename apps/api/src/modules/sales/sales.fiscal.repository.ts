import { getPool } from "../../config/db";
import sql from "mssql";

export async function issueFiscalTx(args: {
  companyId: number;
  saleId: number;
  type: "NFE" | "NFSE" | "BOTH";
}) {
  const pool = await getPool();
  const tx = new sql.Transaction(pool);
  await tx.begin();

  try {
    // ✅ garante multi-empresa: venda pertence à empresa
    const saleRes = await new sql.Request(tx)
    .input("company_id", args.companyId)
    .input("sale_id", args.saleId)
    .query(`
        SELECT id, company_id
        FROM sales
        WHERE company_id=@company_id AND id=@sale_id
    `);

    const sale = saleRes.recordset[0];
    if (!sale) throw new Error("SALE_NOT_FOUND");

    // 2) Carrega itens
    const itemsRes = await new sql.Request(tx)
      .input("sale_id", args.saleId)
      .query(`
        SELECT si.id, si.description, si.quantity, si.unit_price, si.total, p.kind
        FROM sale_items si
        INNER JOIN products p ON p.id = si.product_id
        WHERE si.sale_id=@sale_id
      `);

    const items = itemsRes.recordset;

    const products = items.filter(i => i.kind === "product");
    const services = items.filter(i => i.kind === "service");

    const createdDocs: any[] = [];

    async function createDocument(type: "NFE" | "NFSE", docItems: any[]) {
      if (!docItems.length) return;

        // ✅ Regra B: impede duplicidade (por empresa + venda + tipo) se já existir ativo
        const exists = await new sql.Request(tx)
        .input("company_id", args.companyId)
        .input("sale_id", args.saleId)
        .input("type", type)
        .query(`
            SELECT TOP 1 id
            FROM fiscal_documents
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
        .input("company_id", args.companyId)
        .input("sale_id", args.saleId)
        .input("type", type)
        .query(`
          INSERT INTO fiscal_documents (company_id, sale_id, type)
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
            INSERT INTO fiscal_document_items
            (document_id, sale_item_id, description, quantity, unit_price, total)
            VALUES
            (@document_id, @sale_item_id, @description, @quantity, @unit_price, @total)
          `);
      }

      createdDocs.push(doc);
    }

    if (args.type === "NFE" || args.type === "BOTH")
      await createDocument("NFE", products);

    if (args.type === "NFSE" || args.type === "BOTH")
      await createDocument("NFSE", services);

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


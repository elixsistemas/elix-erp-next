import { getPool } from "../../config/db";
import sql from "mssql";

export async function emitFiscalDocTx(args: { companyId: number; documentId: number }) {
  const pool = await getPool();
  const tx = new sql.Transaction(pool);
  await tx.begin();

  try {
    const docRes = await new sql.Request(tx)
      .input("company_id", args.companyId)
      .input("id", args.documentId)
      .query(`
        SELECT TOP 1 *
        FROM fiscal_documents WITH (UPDLOCK, ROWLOCK)
        WHERE company_id=@company_id AND id=@id
      `);

    const doc = docRes.recordset[0] ?? null;
    if (!doc) {
      await tx.rollback();
      return null;
    }

    const st = String(doc.status ?? "");
    if (st !== "draft" && st !== "error") {
      await tx.rollback();
      throw new Error("INVALID_STATUS");
    }

    // ✅ stub: marca como issued (no futuro aqui entra SEFAZ/prefeitura)
    const up = await new sql.Request(tx)
      .input("company_id", args.companyId)
      .input("id", args.documentId)
      .query(`
        UPDATE fiscal_documents
        SET status='issued'
        OUTPUT INSERTED.*
        WHERE company_id=@company_id AND id=@id
      `);

    await tx.commit();
    return up.recordset[0] ?? null;
  } catch (e) {
    await tx.rollback();
    throw e;
  }
}

export async function cancelFiscalDocTx(args: { companyId: number; documentId: number }) {
  const pool = await getPool();
  const tx = new sql.Transaction(pool);
  await tx.begin();

  try {
    const docRes = await new sql.Request(tx)
      .input("company_id", args.companyId)
      .input("id", args.documentId)
      .query(`
        SELECT TOP 1 *
        FROM fiscal_documents WITH (UPDLOCK, ROWLOCK)
        WHERE company_id=@company_id AND id=@id
      `);

    const doc = docRes.recordset[0] ?? null;
    if (!doc) {
      await tx.rollback();
      return null;
    }

    const st = String(doc.status ?? "");
    if (st !== "issued" && st !== "draft" && st !== "error") {
      await tx.rollback();
      throw new Error("INVALID_STATUS");
    }

    const up = await new sql.Request(tx)
      .input("company_id", args.companyId)
      .input("id", args.documentId)
      .query(`
        UPDATE fiscal_documents
        SET status='cancelled'
        OUTPUT INSERTED.*
        WHERE company_id=@company_id AND id=@id
      `);

    await tx.commit();
    return up.recordset[0] ?? null;
  } catch (e) {
    await tx.rollback();
    throw e;
  }
}

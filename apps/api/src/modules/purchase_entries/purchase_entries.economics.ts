import type { Transaction } from "mssql";
import type { PurchaseEntryImportRow } from "./purchase_entries.repository";
import { round2, round6 } from "./purchase_entries.helpers";

type SqlExecutor = {
  request: Transaction["request"];
};

export async function getProductStockBalance(
  tx: Transaction,
  companyId: number,
  productId: number,
) {
  const result = await tx
    .request()
    .input("company_id", companyId)
    .input("product_id", productId)
    .query<{ balance: number }>(`
      SELECT
        COALESCE(SUM(
          CASE
            WHEN [type] IN ('IN', 'ADJUST_POS') THEN quantity
            WHEN [type] IN ('OUT', 'ADJUST_NEG') THEN -quantity
            ELSE 0
          END
        ), 0) AS balance
      FROM dbo.inventory_movements
      WHERE company_id = @company_id
        AND product_id = @product_id
    `);

  return Number(result.recordset[0]?.balance ?? 0);
}

export async function validateImportAllocationTotals(
  tx: Transaction,
  companyId: number,
  importId: number,
) {
  const headerResult = await tx
    .request()
    .input("company_id", companyId)
    .input("import_id", importId)
    .query<{
      freight_amount: number;
      insurance_amount: number;
      other_expenses_amount: number;
      discount_amount: number;
    }>(`
      SELECT TOP 1
        freight_amount,
        insurance_amount,
        other_expenses_amount,
        discount_amount
      FROM dbo.purchase_entry_imports
      WHERE company_id = @company_id
        AND id = @import_id
    `);

  const header = headerResult.recordset[0];
  if (!header) {
    throw new Error("Importação não encontrada para validar rateios.");
  }

  const sumsResult = await tx
    .request()
    .input("company_id", companyId)
    .input("import_id", importId)
    .query<{
      freight_allocated: number;
      insurance_allocated: number;
      other_expenses_allocated: number;
      discount_allocated: number;
    }>(`
      SELECT
        COALESCE(SUM(freight_allocated), 0) AS freight_allocated,
        COALESCE(SUM(insurance_allocated), 0) AS insurance_allocated,
        COALESCE(SUM(other_expenses_allocated), 0) AS other_expenses_allocated,
        COALESCE(SUM(discount_allocated), 0) AS discount_allocated
      FROM dbo.purchase_entry_import_items
      WHERE company_id = @company_id
        AND import_id = @import_id
    `);

  const sums = sumsResult.recordset[0];

  const diffs = {
    freight: round2(Number(sums.freight_allocated ?? 0) - Number(header.freight_amount ?? 0)),
    insurance: round2(Number(sums.insurance_allocated ?? 0) - Number(header.insurance_amount ?? 0)),
    otherExpenses: round2(Number(sums.other_expenses_allocated ?? 0) - Number(header.other_expenses_amount ?? 0)),
    discount: round2(Number(sums.discount_allocated ?? 0) - Number(header.discount_amount ?? 0)),
  };

  if (
    diffs.freight !== 0 ||
    diffs.insurance !== 0 ||
    diffs.otherExpenses !== 0 ||
    diffs.discount !== 0
  ) {
    const err = new Error(
      "Os rateios dos itens não fecham com os totais do cabeçalho."
    ) as Error & {
      statusCode?: number;
      code?: string;
      details?: Record<string, unknown>;
    };

    err.statusCode = 422;
    err.code = "PURCHASE_ENTRY_ALLOCATION_MISMATCH";
    err.details = {
      expected: {
        freight: round2(Number(header.freight_amount ?? 0)),
        insurance: round2(Number(header.insurance_amount ?? 0)),
        otherExpenses: round2(Number(header.other_expenses_amount ?? 0)),
        discount: round2(Number(header.discount_amount ?? 0)),
      },
      allocated: {
        freight: round2(Number(sums.freight_allocated ?? 0)),
        insurance: round2(Number(sums.insurance_allocated ?? 0)),
        otherExpenses: round2(Number(sums.other_expenses_allocated ?? 0)),
        discount: round2(Number(sums.discount_allocated ?? 0)),
      },
      diffs,
    };

    throw err;
  }
}

export async function validateImportInstallmentsTotal(
  tx: Transaction,
  companyId: number,
  importId: number,
) {
  const headerResult = await tx
    .request()
    .input("company_id", companyId)
    .input("import_id", importId)
    .query<{ total_amount: number }>(`
      SELECT TOP 1 total_amount
      FROM dbo.purchase_entry_imports
      WHERE company_id = @company_id
        AND id = @import_id
    `);

  const header = headerResult.recordset[0];
  if (!header) {
    throw new Error("Importação não encontrada para validar parcelas.");
  }

  const instResult = await tx
    .request()
    .input("company_id", companyId)
    .input("import_id", importId)
    .query<{ installments_total: number; installment_count: number }>(`
      SELECT
        COALESCE(SUM(amount), 0) AS installments_total,
        COUNT(*) AS installment_count
      FROM dbo.purchase_entry_import_installments
      WHERE company_id = @company_id
        AND import_id = @import_id
    `);

  const row = instResult.recordset[0];
  const installmentsTotal = round2(Number(row.installments_total ?? 0));
  const totalAmount = round2(Number(header.total_amount ?? 0));
  const diff = round2(installmentsTotal - totalAmount);

  if (Number(row.installment_count ?? 0) <= 0) {
    const err = new Error("A importação não possui parcelas financeiras.") as Error & {
      statusCode?: number;
      code?: string;
    };
    err.statusCode = 422;
    err.code = "PURCHASE_ENTRY_INSTALLMENTS_MISSING";
    throw err;
  }

  if (diff !== 0) {
    const err = new Error(
      "A soma das parcelas não fecha com o total da nota."
    ) as Error & {
      statusCode?: number;
      code?: string;
      details?: Record<string, unknown>;
    };

    err.statusCode = 422;
    err.code = "PURCHASE_ENTRY_INSTALLMENTS_MISMATCH";
    err.details = {
      totalAmount,
      installmentsTotal,
      diff,
    };

    throw err;
  }
}

export async function applyProductEconomicsCore(
  tx: Transaction,
  companyId: number,
  productId: number,
  input: {
    quantity: number;
    landedUnitCost: number;
    costPolicy: "LAST_COST" | "AVERAGE_COST" | "LANDED_LAST_COST";
    pricePolicy: "NONE" | "MARKUP" | "MARGIN" | "SUGGESTED_ONLY";
    markupPercent: number | null;
    marginPercent: number | null;
  },
) {
  const currentResult = await tx
    .request()
    .input("company_id", companyId)
    .input("product_id", productId)
    .query<{
      id: number;
      cost: number;
      price: number;
    }>(`
      SELECT TOP 1 id, cost, price
      FROM dbo.products
      WHERE company_id = @company_id
        AND id = @product_id
    `);

  const current = currentResult.recordset[0];
  if (!current) {
    throw new Error(`Produto ${productId} não encontrado para atualização econômica.`);
  }

  const previousCost = Number(current.cost ?? 0);
  const previousPrice = Number(current.price ?? 0);
  const landedUnitCost = Number(input.landedUnitCost ?? 0);
  const quantity = Number(input.quantity ?? 0);

  let nextCost = previousCost;

  if (input.costPolicy === "LAST_COST" || input.costPolicy === "LANDED_LAST_COST") {
    nextCost = landedUnitCost;
  } else if (input.costPolicy === "AVERAGE_COST") {
    const stockBefore = await getProductStockBalance(tx, companyId, productId);

    if (stockBefore <= 0) {
      nextCost = landedUnitCost;
    } else {
      nextCost =
        ((stockBefore * previousCost) + (quantity * landedUnitCost)) /
        (stockBefore + quantity);
    }
  }

  nextCost = round6(nextCost);

  let suggestedPrice: number | null = null;
  let appliedPrice = previousPrice;
  let priceChanged = false;

  if (input.pricePolicy === "MARKUP" && input.markupPercent != null) {
    suggestedPrice = round6(nextCost * (1 + Number(input.markupPercent) / 100));
    appliedPrice = suggestedPrice;
    priceChanged = true;
  } else if (input.pricePolicy === "MARGIN" && input.marginPercent != null) {
    const divisor = 1 - Number(input.marginPercent) / 100;
    suggestedPrice = divisor > 0 ? round6(nextCost / divisor) : null;

    if (suggestedPrice != null) {
      appliedPrice = suggestedPrice;
      priceChanged = true;
    }
  } else if (input.pricePolicy === "SUGGESTED_ONLY") {
    if (input.markupPercent != null) {
      suggestedPrice = round6(nextCost * (1 + Number(input.markupPercent) / 100));
    } else if (input.marginPercent != null) {
      const divisor = 1 - Number(input.marginPercent) / 100;
      suggestedPrice = divisor > 0 ? round6(nextCost / divisor) : null;
    }
  }

  const currentMarginPercent =
    previousPrice > 0 ? round6(((previousPrice - previousCost) / previousPrice) * 100) : 0;

  const projectedMarginPercent =
    appliedPrice > 0 ? round6(((appliedPrice - nextCost) / appliedPrice) * 100) : 0;

  await tx
    .request()
    .input("company_id", companyId)
    .input("product_id", productId)
    .input("cost", nextCost)
    .input("price", appliedPrice)
    .query(`
      UPDATE dbo.products
      SET
        cost = @cost,
        price = @price,
        updated_at = SYSUTCDATETIME()
      WHERE company_id = @company_id
        AND id = @product_id
    `);

  return {
    previousCost,
    previousPrice,
    newCost: nextCost,
    suggestedPrice,
    appliedPrice,
    priceChanged,
    currentMarginPercent,
    projectedMarginPercent,
  };
}

export async function insertProductCostPriceHistory(
  tx: Transaction,
  companyId: number,
  params: {
    productId: number;
    purchaseEntryId: number;
    purchaseEntryItemId: number;
    originType: string;
    originId: number | null;
    previousCost: number;
    newCost: number;
    previousPrice: number;
    newPrice: number;
    costPolicy: string;
    pricePolicy: string;
    markupPercent: number | null;
    marginPercent: number | null;
    userId: number | null;
  },
) {
  await tx
    .request()
    .input("company_id", companyId)
    .input("product_id", params.productId)
    .input("purchase_entry_id", params.purchaseEntryId)
    .input("purchase_entry_item_id", params.purchaseEntryItemId)
    .input("origin_type", params.originType)
    .input("origin_id", params.originId)
    .input("previous_cost", round6(params.previousCost))
    .input("new_cost", round6(params.newCost))
    .input("previous_price", round6(params.previousPrice))
    .input("new_price", round6(params.newPrice))
    .input("cost_policy", params.costPolicy)
    .input("price_policy", params.pricePolicy)
    .input("markup_percent", params.markupPercent ?? null)
    .input("margin_percent", params.marginPercent ?? null)
    .input("created_by_user_id", params.userId ?? null)
    .query(`
      INSERT INTO dbo.product_cost_price_history (
        company_id,
        product_id,
        purchase_entry_id,
        purchase_entry_item_id,
        origin_type,
        origin_id,
        previous_cost,
        new_cost,
        previous_price,
        new_price,
        cost_policy,
        price_policy,
        markup_percent,
        margin_percent,
        created_by_user_id
      )
      VALUES (
        @company_id,
        @product_id,
        @purchase_entry_id,
        @purchase_entry_item_id,
        @origin_type,
        @origin_id,
        @previous_cost,
        @new_cost,
        @previous_price,
        @new_price,
        @cost_policy,
        @price_policy,
        @markup_percent,
        @margin_percent,
        @created_by_user_id
      )
    `);
}

export async function resolveFiscalUomId(
  executor: SqlExecutor,
  uomFromXml: string | null | undefined,
) {
  const normalized = String(uomFromXml ?? "").trim().toUpperCase();

  if (normalized) {
    const byXml = await executor
      .request()
      .input("code", normalized)
      .query<{ id: number }>(`
        SELECT TOP 1 id
        FROM dbo.fiscal_uom
        WHERE UPPER(code) = @code
          AND active = 1
        ORDER BY id
      `);

    if (byXml.recordset[0]?.id) {
      return Number(byXml.recordset[0].id);
    }
  }

  const fallback = await executor
    .request()
    .query<{ id: number }>(`
      SELECT TOP 1 id
      FROM dbo.fiscal_uom
      WHERE UPPER(code) = 'UN'
        AND active = 1
      ORDER BY id
    `);

  return Number(fallback.recordset[0]?.id ?? 0);
}
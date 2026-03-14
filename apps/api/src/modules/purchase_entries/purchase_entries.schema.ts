import { z } from "zod";

export const UpdateImportEconomicsSchema = z.object({
  allocationMethod: z
    .enum(["VALUE", "QUANTITY", "WEIGHT", "MANUAL"])
    .optional(),
  costPolicy: z
    .enum(["LAST_COST", "AVERAGE_COST", "LANDED_LAST_COST"])
    .optional(),
  pricePolicy: z
    .enum(["NONE", "MARKUP", "MARGIN", "SUGGESTED_ONLY"])
    .optional(),
  markupPercent: z.coerce.number().min(0).nullable().optional(),
  marginPercent: z.coerce.number().gt(0).lt(100).nullable().optional(),
});

export const UpdateImportItemAllocationSchema = z.object({
  freightAllocated: z.coerce.number().min(0).optional(),
  insuranceAllocated: z.coerce.number().min(0).optional(),
  otherExpensesAllocated: z.coerce.number().min(0).optional(),
  discountAllocated: z.coerce.number().min(0).optional(),
});

/* =========================================================
   IMPORT STAGING
   ========================================================= */

export const PurchaseEntryImportStatusSchema = z.enum([
  "IMPORTED",
  "MATCH_PENDING",
  "READY",
  "CONFIRMED",
  "ERROR",
  "CANCELED",
]);

export const PurchaseEntryItemMatchStatusSchema = z.enum([
  "PENDING",
  "MATCHED",
  "REVIEW",
  "NEW_PRODUCT",
]);

export const PurchaseEntryListQuerySchema = z.object({
  status: PurchaseEntryImportStatusSchema.optional(),
  q: z.string().trim().max(120).optional(),
  supplierId: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export const PurchaseEntryIdParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const PurchaseEntryItemParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
  itemId: z.coerce.number().int().positive(),
});

export const PurchaseEntryInstallmentParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
  installmentId: z.coerce.number().int().positive(),
});

export const MatchSupplierSchema = z.object({
  supplierId: z.coerce.number().int().positive(),
});

export const MatchProductSchema = z.object({
  productId: z.coerce.number().int().positive(),
});

export const ImportXmlSchema = z.object({
  fileName: z.string().trim().min(1).max(255),
  xmlContent: z.string().trim().min(1),
});

export const CreateSupplierFromImportSchema = z.object({
  overwriteName: z.string().trim().min(1).max(255).optional(),
});

export const CreateProductFromImportItemSchema = z.object({
  overwriteName: z.string().trim().min(1).max(255).optional(),
  kind: z.enum(["product", "service"]).default("product"),
  trackInventory: z.boolean().default(true),
});

export const UpdateImportFinancialSchema = z.object({
  chartAccountId: z.coerce.number().int().positive().nullable().optional(),
  costCenterId: z.coerce.number().int().positive().nullable().optional(),
  paymentTermId: z.coerce.number().int().positive().nullable().optional(),
});

export const UpdateImportLogisticsSchema = z.object({
  carrierId: z.coerce.number().int().positive().nullable().optional(),
  carrierVehicleId: z.coerce.number().int().positive().nullable().optional(),
  freightMode: z
    .enum(["CIF", "FOB", "THIRD_PARTY", "OWN", "NO_FREIGHT"])
    .nullable()
    .optional(),
});

export const UpdateImportItemSchema = z.object({
  quantity: z.coerce.number().positive().optional(),
  unitPrice: z.coerce.number().nonnegative().optional(),
  totalPrice: z.coerce.number().nonnegative().optional(),
});

export const UpdateImportInstallmentSchema = z.object({
  dueDate: z.string().trim().min(10).max(10).optional(),
  amount: z.coerce.number().positive().optional(),
});

/* =========================================================
   DEFINITIVE PURCHASE ENTRIES
   ========================================================= */

export const PurchaseEntryStatusSchema = z.enum([
  "DRAFT",
  "CONFIRMED",
  "POSTED",
  "CANCELED",
]);

export const PurchaseEntryOriginTypeSchema = z.enum([
  "XML_IMPORT",
  "MANUAL",
  "PURCHASE_ORDER",
]);

export const PurchaseEntryDefinitiveListQuerySchema = z.object({
  status: PurchaseEntryStatusSchema.optional(),
  q: z.string().trim().max(120).optional(),
  supplierId: z.coerce.number().int().positive().optional(),
  from: z.string().trim().min(10).max(10).optional(),
  to: z.string().trim().min(10).max(10).optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export type PurchaseEntryImportStatus = z.infer<typeof PurchaseEntryImportStatusSchema>;
export type PurchaseEntryItemMatchStatus = z.infer<typeof PurchaseEntryItemMatchStatusSchema>;
export type PurchaseEntryListQuery = z.infer<typeof PurchaseEntryListQuerySchema>;
export type PurchaseEntryIdParams = z.infer<typeof PurchaseEntryIdParamsSchema>;
export type PurchaseEntryItemParams = z.infer<typeof PurchaseEntryItemParamsSchema>;
export type PurchaseEntryInstallmentParams = z.infer<typeof PurchaseEntryInstallmentParamsSchema>;
export type MatchSupplierInput = z.infer<typeof MatchSupplierSchema>;
export type MatchProductInput = z.infer<typeof MatchProductSchema>;
export type ImportXmlInput = z.infer<typeof ImportXmlSchema>;
export type CreateSupplierFromImportInput = z.infer<typeof CreateSupplierFromImportSchema>;
export type CreateProductFromImportItemInput = z.infer<typeof CreateProductFromImportItemSchema>;
export type UpdateImportFinancialInput = z.infer<typeof UpdateImportFinancialSchema>;
export type UpdateImportLogisticsInput = z.infer<typeof UpdateImportLogisticsSchema>;
export type UpdateImportItemInput = z.infer<typeof UpdateImportItemSchema>;
export type UpdateImportInstallmentInput = z.infer<typeof UpdateImportInstallmentSchema>;
export type PurchaseEntryStatus = z.infer<typeof PurchaseEntryStatusSchema>;
export type PurchaseEntryOriginType = z.infer<typeof PurchaseEntryOriginTypeSchema>;
export type PurchaseEntryDefinitiveListQuery = z.infer<typeof PurchaseEntryDefinitiveListQuerySchema>;
export type UpdateImportEconomicsInput = z.infer<typeof UpdateImportEconomicsSchema>;
export type UpdateImportItemAllocationInput = z.infer<typeof UpdateImportItemAllocationSchema>;
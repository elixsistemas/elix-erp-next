import { z } from "zod";

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

export const UpdateImportItemSchema = z.object({
  quantity: z.coerce.number().positive().optional(),
  unitPrice: z.coerce.number().nonnegative().optional(),
  totalPrice: z.coerce.number().nonnegative().optional(),
});

export const UpdateImportInstallmentSchema = z.object({
  dueDate: z.string().trim().min(10).max(10).optional(),
  amount: z.coerce.number().positive().optional(),
});

export const UpdateImportLogisticsSchema = z.object({
  carrierId: z.coerce.number().int().positive().nullable().optional(),
  carrierVehicleId: z.coerce.number().int().positive().nullable().optional(),
  freightMode: z.string().trim().max(20).optional(),
});

export type PurchaseEntryImportStatus = z.infer<
  typeof PurchaseEntryImportStatusSchema
>;

export type PurchaseEntryItemMatchStatus = z.infer<
  typeof PurchaseEntryItemMatchStatusSchema
>;

export type PurchaseEntryListQuery = z.infer<
  typeof PurchaseEntryListQuerySchema
>;

export type PurchaseEntryIdParams = z.infer<
  typeof PurchaseEntryIdParamsSchema
>;

export type PurchaseEntryItemParams = z.infer<
  typeof PurchaseEntryItemParamsSchema
>;

export type PurchaseEntryInstallmentParams = z.infer<
  typeof PurchaseEntryInstallmentParamsSchema
>;

export type MatchSupplierInput = z.infer<typeof MatchSupplierSchema>;

export type MatchProductInput = z.infer<typeof MatchProductSchema>;

export type ImportXmlInput = z.infer<typeof ImportXmlSchema>;

export type CreateSupplierFromImportInput = z.infer<
  typeof CreateSupplierFromImportSchema
>;

export type CreateProductFromImportItemInput = z.infer<
  typeof CreateProductFromImportItemSchema
>;

export type UpdateImportFinancialInput = z.infer<
  typeof UpdateImportFinancialSchema
>;

export type UpdateImportItemInput = z.infer<
  typeof UpdateImportItemSchema
>;

export type UpdateImportInstallmentInput = z.infer<
  typeof UpdateImportInstallmentSchema
>;

export type UpdateImportLogisticsInput = z.infer<
  typeof UpdateImportLogisticsSchema
>;
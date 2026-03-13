import { z } from "zod";

export const PurchaseEntryImportUploadSchema = z.object({
  fileName: z
    .string()
    .trim()
    .min(1, "Arquivo é obrigatório")
    .max(255, "Nome do arquivo muito longo"),

  xmlContent: z
    .string()
    .trim()
    .min(1, "Conteúdo XML é obrigatório"),
});

export type PurchaseEntryImportUploadValues = z.infer<
  typeof PurchaseEntryImportUploadSchema
>;
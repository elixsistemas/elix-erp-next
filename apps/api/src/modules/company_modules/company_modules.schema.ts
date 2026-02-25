// apps/api/src/modules/company_modules/company_modules.schema.ts
import { z } from "zod";

export const CompanyModuleItemSchema = z.object({
  module_key: z.string().min(1).max(50),
  enabled: z.coerce.boolean(),
});

export type CompanyModuleItem = z.infer<typeof CompanyModuleItemSchema>;

export const CompanyModulesUpdateSchema = z.object({
  modules: z.array(CompanyModuleItemSchema).min(1),
});

export type CompanyModulesUpdateBody = z.infer<typeof CompanyModulesUpdateSchema>;

export const CompanyModulesListSchema = z.object({
  items: z.array(CompanyModuleItemSchema),
});

export type CompanyModulesListResponse = z.infer<typeof CompanyModulesListSchema>;
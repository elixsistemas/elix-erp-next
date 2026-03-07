import { z } from "zod";

export const CompanyModuleItemSchema = z.object({
  id: z.number().int().optional(),
  module_key: z.string().min(1).max(80),
  domain: z.string().max(40).optional().nullable(),
  label: z.string().max(120).optional().nullable(),
  description: z.string().max(400).optional().nullable(),
  sort_order: z.number().int().optional().nullable(),
  active: z.coerce.boolean().optional(),
  enabled: z.coerce.boolean(),
});

export type CompanyModuleItem = z.infer<typeof CompanyModuleItemSchema>;

export const CompanyModulesUpdateSchema = z.object({
  modules: z.array(
    z.object({
      module_key: z.string().min(1).max(80),
      enabled: z.coerce.boolean(),
    })
  ).min(1),
});

export type CompanyModulesUpdateBody = z.infer<typeof CompanyModulesUpdateSchema>;

export const CompanyModulesListSchema = z.object({
  items: z.array(CompanyModuleItemSchema),
});

export type CompanyModulesListResponse = z.infer<typeof CompanyModulesListSchema>;
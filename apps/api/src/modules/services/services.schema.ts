import { z } from "zod";

export const ServiceListQuerySchema = z.object({
  q: z.string().trim().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  active: z.coerce.number().int().optional(),
});

export const ServiceBaseSchema = z.object({
  name: z.string().trim().min(2).max(200),
  sku: z.string().trim().min(1).max(60).optional().nullable(),
  description: z.string().trim().min(1).max(2000).optional().nullable(),

  price: z.coerce.number().min(0).default(0),
  cost: z.coerce.number().min(0).default(0),

  active: z.coerce.boolean().optional().nullable(),

  uom: z.string().trim().min(1).max(10).optional().nullable(),
  uom_id: z.coerce.number().int().positive().optional().nullable(),

  image_url: z.string().trim().max(500).optional().nullable(),
});

export const ServiceCreateSchema = ServiceBaseSchema;

export const ServiceUpdateSchema = ServiceBaseSchema.partial();

export const IdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type ServiceListQuery = z.infer<typeof ServiceListQuerySchema>;
export type ServiceCreate = z.infer<typeof ServiceCreateSchema>;
export type ServiceUpdate = z.infer<typeof ServiceUpdateSchema>;
export type IdParam = z.infer<typeof IdParamSchema>;
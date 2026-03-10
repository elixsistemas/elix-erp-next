import { z } from "zod";

export const ServiceUpsertSchema = z.object({
  name: z.string().trim().min(2, "Nome obrigatório").max(200),

  sku: z.string().trim().max(60).optional().nullable(),
  description: z.string().trim().max(2000).optional().nullable(),

  uom: z.string().trim().max(10).optional().nullable(),
  uom_id: z.coerce.number().int().positive().optional().nullable(),

  price: z.coerce.number().min(0, "Preço inválido").default(0),
  cost: z.coerce.number().min(0, "Custo inválido").default(0),

  active: z.coerce.boolean().optional().nullable(),
  image_url: z.string().trim().max(500).optional().nullable(),
});

export type ServiceUpsertForm = z.infer<typeof ServiceUpsertSchema>;
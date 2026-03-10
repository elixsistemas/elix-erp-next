import { z } from "zod";

export const ProductKindSchema = z.enum([
  "product",
  "service",
  "consumable",
  "kit",
]);

export const ProductUpsertSchema = z
  .object({
    name: z.string().trim().min(2, "Nome obrigatório").max(200),

    sku: z.string().trim().max(60).optional().nullable(),
    kind: ProductKindSchema.default("product"),

    description: z
      .string()
      .trim()
      .max(2000)
      .optional()
      .nullable(),

    uom: z.string().trim().max(10).optional().nullable(),
    uom_id: z.coerce.number().int().positive().optional().nullable(),

    ncm: z.string().trim().max(20).optional().nullable(),
    ncm_id: z.coerce.number().int().positive().optional().nullable(),

    ean: z.string().trim().max(30).optional().nullable(),

    cest: z.string().trim().max(20).optional().nullable(),
    cest_id: z.coerce.number().int().positive().optional().nullable(),

    fiscal_json: z.string().optional().nullable(),

    price: z.coerce.number().min(0, "Preço inválido").default(0),
    cost: z.coerce.number().min(0, "Custo inválido").default(0),

    track_inventory: z.coerce.boolean().optional().nullable(),
    active: z.coerce.boolean().optional().nullable(),

    image_url: z.string().trim().max(500).optional().nullable(),

    weight_kg: z.coerce.number().min(0).optional().nullable(),
    width_cm: z.coerce.number().min(0).optional().nullable(),
    height_cm: z.coerce.number().min(0).optional().nullable(),
    length_cm: z.coerce.number().min(0).optional().nullable(),
  })
  .superRefine((data, ctx) => {
    const requiresNcm =
      data.kind === "product" || data.kind === "consumable";

    if (requiresNcm && !data.ncm_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["ncm_id"],
        message: "NCM é obrigatório para produto e consumível.",
      });
    }
  });

export type ProductUpsertForm = z.infer<typeof ProductUpsertSchema>;
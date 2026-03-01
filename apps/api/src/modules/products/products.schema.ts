import { z } from "zod";

/**
 * Query de listagem/busca:
 * GET /products?q=cabo&limit=20&active=1&kind=product
 */
export const ProductListQuerySchema = z.object({
  q: z.string().trim().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  active: z.coerce.number().int().optional(), // 1/0
  kind: z.enum(["product", "service"]).optional(),
});

// ✅ 1) BASE: sem refine/superRefine
export const ProductBaseSchema = z.object({
  name: z.string().trim().min(2).max(200),

  sku: z.string().trim().min(1).max(60).optional().nullable(),
  ncm: z.string().trim().min(1).max(20).optional().nullable(),
  ncmId: z.coerce.number().int().positive().optional().nullable(),
  ean: z.string().trim().min(1).max(30).optional().nullable(),

  // preços
  price: z.coerce.number().min(0).default(0),
  cost: z.coerce.number().min(0).default(0),

  description: z.string().trim().min(1).max(2000).optional().nullable(),
  uom: z.string().trim().min(1).max(10).optional().nullable(),

  kind: z.enum(["product", "service"]).default("product"),
  track_inventory: z.coerce.boolean().optional().nullable(),
  active: z.coerce.boolean().optional().nullable(),

  cest: z.string().trim().min(1).max(20).optional().nullable(),
  fiscal_json: z.string().optional().nullable(),
  image_url: z.string().trim().max(500).optional().nullable(),

  weight_kg: z.coerce.number().min(0).optional().nullable(),
  width_cm: z.coerce.number().min(0).optional().nullable(),
  height_cm: z.coerce.number().min(0).optional().nullable(),
  length_cm: z.coerce.number().min(0).optional().nullable(),
});

// ✅ 2) CREATE: aplica refinamentos aqui (SE você tiver regras)
export const ProductCreateSchema = ProductBaseSchema.superRefine((data, ctx) => {
  // Exemplo de regra (ative quando você decidir):
  // if (data.kind === "product" && !data.ncmId) {
  //   ctx.addIssue({
  //     code: z.ZodIssueCode.custom,
  //     path: ["ncmId"],
  //     message: "ncmId é obrigatório para produtos.",
  //   });
  // }
});

// ✅ 3) UPDATE: partial em cima do BASE (não explode no Zod v4)
export const ProductUpdateSchema = ProductBaseSchema.partial().superRefine((data, ctx) => {
  // Regras de update (se precisar), exemplo:
  // se vier kind=product no payload e vier ncmId explicitamente null, você pode bloquear
  // (do contrário, update parcial não deve exigir ncmId sempre)

  if (data.kind === "product" && "ncmId" in data && !data.ncmId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["ncmId"],
      message: "ncmId não pode ser vazio quando kind=product.",
    });
  }
});

export type ProductCreate = z.infer<typeof ProductCreateSchema>;
export type ProductUpdate = z.infer<typeof ProductUpdateSchema>;
export type ProductListQuery = z.infer<typeof ProductListQuerySchema>;
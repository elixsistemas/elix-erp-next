import { z } from "zod";

export const ProductKindSchema = z.enum([
  "product",
  "service",
  "consumable",
  "kit",
]);

export const ProductListQuerySchema = z.object({
  q: z.string().trim().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  active: z.coerce.number().int().optional(),
  kind: ProductKindSchema.optional(),
});

export const ProductBaseSchema = z.object({
  name: z.string().trim().min(2).max(200),
  sku: z.string().trim().min(1).max(60).optional().nullable(),
  ncm: z.string().trim().min(1).max(20).optional().nullable(),
  ncmId: z.coerce.number().int().positive().optional().nullable(),
  ean: z.string().trim().min(1).max(30).optional().nullable(),

  price: z.coerce.number().min(0).default(0),
  cost: z.coerce.number().min(0).default(0),

  description: z.string().trim().min(1).max(2000).optional().nullable(),
  uom: z.string().trim().min(1).max(10).optional().nullable(),

  kind: ProductKindSchema.default("product"),

  track_inventory: z.coerce.boolean().optional().nullable(),
  active: z.coerce.boolean().optional().nullable(),

  uomId: z.coerce.number().int().positive().optional().nullable(),
  cestId: z.coerce.number().int().positive().optional().nullable(),
  cest: z.string().trim().min(1).max(20).optional().nullable(),
  fiscal_json: z.string().optional().nullable(),
  image_url: z.string().trim().max(500).optional().nullable(),

  weight_kg: z.coerce.number().min(0).optional().nullable(),
  width_cm: z.coerce.number().min(0).optional().nullable(),
  height_cm: z.coerce.number().min(0).optional().nullable(),
  length_cm: z.coerce.number().min(0).optional().nullable(),
});

export const ProductCreateSchema = ProductBaseSchema.superRefine((data, ctx) => {
  if (["product", "consumable"].includes(data.kind) && !data.ncmId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["ncmId"],
      message: "ncmId é obrigatório para produtos e consumíveis.",
    });
  }
});

export const ProductUpdateSchema = ProductBaseSchema.partial().superRefine((data, ctx) => {
  if (
    ["product", "consumable"].includes(data.kind ?? "") &&
    "ncmId" in data &&
    !data.ncmId
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["ncmId"],
      message: "ncmId não pode ser vazio para produtos e consumíveis.",
    });
  }
});

export type ProductCreate = z.infer<typeof ProductCreateSchema>;
export type ProductUpdate = z.infer<typeof ProductUpdateSchema>;
export type ProductListQuery = z.infer<typeof ProductListQuerySchema>;
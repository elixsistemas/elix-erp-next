import { z } from "zod";

export const MovementTypeSchema = z.enum(["IN", "OUT", "ADJUST_POS", "ADJUST_NEG"]);

export const MovementFormSchema = z.object({
  productId: z.coerce.number().int().positive(),
  type: MovementTypeSchema,
  quantity: z.coerce.number().int().positive(),
  source: z.string().trim().optional(),
  sourceId: z.coerce.number().int().positive().optional(),
  note: z.string().trim().max(255).optional().nullable(),
});

export type MovementFormValues = z.infer<typeof MovementFormSchema>;

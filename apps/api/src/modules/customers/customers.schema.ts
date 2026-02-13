import { z } from "zod";

export const CustomerCreateSchema = z.object({
  name: z.string().min(2),
  document: z.string().min(3),
  email: z.string().email().optional(),
  phone: z.string().optional()
});

export const CustomerUpdateSchema = CustomerCreateSchema.partial();

export type CustomerCreate = z.infer<typeof CustomerCreateSchema>;
export type CustomerUpdate = z.infer<typeof CustomerUpdateSchema>;

import { z } from "zod";

export const LoginSchema = z.object({
  companyId: z.coerce.number().int().positive(),
  email: z.string().email(),
  password: z.string().min(4)
});

export type LoginInput = z.infer<typeof LoginSchema>;

import { z } from "zod";

export const SwitchCompanySchema = z.object({
  companyId: z.number().int().positive(),
});
export type SwitchCompanyInput = z.infer<typeof SwitchCompanySchema>;

export const PreLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(4),
});

export const LoginSchema = z.object({
  loginTicket: z.string().min(10),
  companyId: z.coerce.number().int().positive(),
});

export type PreLoginInput = z.infer<typeof PreLoginSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
import { z } from "zod";

export const UserIdParamSchema = z.object({ id: z.coerce.number().int().positive() });

export const UserCreateSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().max(160),
  password: z.string().min(6).max(200),
  active: z.boolean().optional(),
  roleIds: z.array(z.number().int().positive()).default([]),
});

export const UserUpdateSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  email: z.string().email().max(160).optional(),
  active: z.boolean().optional(),
});

export const UserSetRolesSchema = z.object({
  roleIds: z.array(z.number().int().positive()).default([]),
});

// ✅ NOVO: /users/lookup?email=...
export const UserLookupQuerySchema = z.object({
  email: z.string().email().max(160),
});

// ✅ NOVO: /users/link
export const UserLinkSchema = z.object({
  email: z.string().email().max(160),
  name: z.string().min(2).max(120).optional(), // usado se for criar user global
  password: z.string().min(6).max(200).optional(), // obrigatório só se não existir user global
  active: z.boolean().optional(),
  roleIds: z.array(z.number().int().positive()).default([]),

  import: z
    .object({
      enabled: z.boolean().default(false),
      fromCompanyId: z.number().int().positive().optional(),
      mode: z.enum(["roles"]).default("roles"),
    })
    .optional(),
});
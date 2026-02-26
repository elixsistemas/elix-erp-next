import { z } from "zod";

export const RoleCreateSchema = z.object({
  code: z.string().min(2).max(50).regex(/^[a-z0-9_]+$/i),
  name: z.string().min(2).max(120),
});

export const RoleUpdateSchema = RoleCreateSchema.partial().extend({
  active: z.coerce.boolean().optional(),
});

export const RoleIdParamSchema = z.object({ id: z.coerce.number().int().positive() });

export const RoleGrantSchema = z.object({
  permissionCodes: z.array(z.string().min(2).max(80)).default([]),
});
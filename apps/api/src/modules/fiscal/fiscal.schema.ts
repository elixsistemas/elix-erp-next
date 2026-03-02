import { z } from "zod";

// utils
const emptyToNull = z.string().transform(v => v.trim() === "" ? null : v);

const asNullableString = z.union([emptyToNull, z.null(), z.undefined()])
  .transform(v => v === undefined ? null : v);

const asNullableBool = z
  .union([z.boolean(), z.null(), z.undefined()])
  .transform((v) => (v === undefined ? null : v));

/** CFOP */
export const CfopUpsertSchema = z.object({
  code: z.string().trim().length(4),
  description: z.string().trim().min(3).max(500),
  nature: z.union([z.number().int().min(0).max(255), z.null(), z.undefined()]).transform((v) => (v === undefined ? null : v)),
  active: z.union([z.boolean(), z.null(), z.undefined()]).transform((v) => (v === undefined ? true : v ?? true)),
});

export const CfopListQuerySchema = z.object({
  search: z.string().optional(),
  active: z.union([z.string(), z.undefined()]).optional(), // "1" | "0"
  page: z.union([z.string(), z.undefined()]).optional(),
  pageSize: z.union([z.string(), z.undefined()]).optional(),
});

export const CfopImportSchema = z.object({
  dryRun: z.boolean().optional().default(false),
  items: z.array(
    z.object({
      code: z.string().trim().length(4),
      description: z.string().trim().min(3).max(500),
      nature: z.union([z.coerce.number().int().min(0).max(255), z.null(), z.undefined()]).transform((v) => (v === undefined ? null : v)),
      active: z.union([z.boolean(), z.null(), z.undefined()]).transform((v) => (v === undefined ? true : v ?? true)),
    })
  ),
});

/** NCM */
export const NcmUpsertSchema = z.object({
  code: z.string().trim().length(8),
  description: z.string().trim().min(3).max(2000),
  ex: asNullableString,
  start_date: asNullableString, // ✅ normaliza p/ string|null
  end_date: asNullableString,
  active: z.union([z.boolean(), z.null(), z.undefined()]).transform((v) => (v === undefined ? true : v ?? true)),
});

export const NcmListQuerySchema = z.object({
  search: z.string().optional(),
  active: z.union([z.string(), z.undefined()]).optional(),
  page: z.union([z.string(), z.undefined()]).optional(),
  pageSize: z.union([z.string(), z.undefined()]).optional(),
});

export const NcmImportSchema = z.object({
  dryRun: z.boolean().optional().default(false),
  items: z.array(
    z.object({
      code: z.string().trim().length(8),
      description: z.string().trim().min(3).max(2000),
      ex: asNullableString,
      start_date: asNullableString,
      end_date: asNullableString,
      active: z.union([z.boolean(), z.null(), z.undefined()]).transform((v) => (v === undefined ? true : v ?? true)),
    })
  ),
});

/** CEST */
export const CestUpsertSchema = z.object({
  code: z.string().trim().length(7),
  description: z.string().trim().min(3).max(1200),
  segment: asNullableString, // nvarchar(400) no DB, mas pode vir vazio
  active: z.union([z.boolean(), z.null(), z.undefined()])
    .transform((v) => (v === undefined ? true : v ?? true)),
});

export const CestListQuerySchema = z.object({
  search: z.string().optional(),
  active: z.union([z.string(), z.undefined()]).optional(), // "1" | "0"
  page: z.union([z.string(), z.undefined()]).optional(),
  pageSize: z.union([z.string(), z.undefined()]).optional(),
});

export const CestImportSchema = z.object({
  dryRun: z.boolean().optional().default(false),
  items: z.array(
    z.object({
      code: z.string().trim().length(7),
      description: z.string().trim().min(3).max(1200),
      segment: asNullableString,
      active: z.union([z.boolean(), z.null(), z.undefined()])
        .transform((v) => (v === undefined ? true : v ?? true)),
    })
  ),
});

export type CfopUpsert = z.infer<typeof CfopUpsertSchema>;
export type CfopImportPayload = z.infer<typeof CfopImportSchema>;
export type CfopImportItem = CfopImportPayload["items"][number];
export type CfopListQuery = z.infer<typeof CfopListQuerySchema>;

export type NcmUpsert = z.infer<typeof NcmUpsertSchema>;
export type NcmImportPayload = z.infer<typeof NcmImportSchema>;
export type NcmImportItem = NcmImportPayload["items"][number];
export type NcmListQuery = z.infer<typeof NcmListQuerySchema>;

export type CestUpsert = z.infer<typeof CestUpsertSchema>;
export type CestImportPayload = z.infer<typeof CestImportSchema>;
export type CestImportItem = CestImportPayload["items"][number];
export type CestListQuery = z.infer<typeof CestListQuerySchema>;


import { z } from "zod";

export const brandingQuerySchema = z.object({
  company: z.string().optional(),
  companyId: z.coerce.number().int().positive().optional(),
});

export type BrandingQuery = z.infer<typeof brandingQuerySchema>;

/**
 * DTO de resposta do endpoint /branding
 */
export const brandingResponseSchema = z.object({
  slug: z.string().min(1).max(80),
  display_name: z.string().min(1).max(120),

  logo_url: z.string().url().or(z.string().startsWith("/")).nullable(),
  logo_dark_url: z.string().url().or(z.string().startsWith("/")).nullable(),
  favicon_url: z.string().url().or(z.string().startsWith("/")).nullable(),

  primary_color: z.string().min(3).max(20),   // ex: #2563eb
  secondary_color: z.string().min(3).max(20), // ex: #22c55e

  use_default_logo: z.boolean(),
  show_powered_by: z.boolean(),
});

export type BrandingResponse = z.infer<typeof brandingResponseSchema>;


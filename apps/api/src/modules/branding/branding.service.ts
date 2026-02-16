import sql from "mssql";
import { getPool } from "../../config/db";

export type BrandingDTO = {
  slug: string;
  display_name: string;
  logo_url: string | null;
  logo_dark_url: string | null;
  favicon_url: string | null;
  primary_color: string;
  secondary_color: string;
  use_default_logo: boolean;
  show_powered_by: boolean;
};

const FALLBACK: BrandingDTO = {
  slug: "elix",
  display_name: "Elix Sistemas",
  logo_url: "/assets/elix-logo.png",
  logo_dark_url: "/assets/elix-logo.png",
  favicon_url: "/assets/favicon.ico",
  primary_color: "#2563eb",
  secondary_color: "#22c55e",
  use_default_logo: true,
  show_powered_by: true,
};

export async function getBrandingBySlug(slug: string): Promise<BrandingDTO> {
  const pool = await getPool();

  const result = await pool
    .request()
    .input("slug", sql.NVarChar(80), slug)
    .query(`
      SELECT TOP 1
        slug,
        display_name,
        logo_url,
        logo_dark_url,
        favicon_url,
        primary_color,
        secondary_color,
        use_default_logo,
        show_powered_by
      FROM dbo.company_branding
      WHERE slug = @slug;
    `);

  const row = result.recordset?.[0];
  if (!row) return FALLBACK;

  return {
    slug: row.slug,
    display_name: row.display_name,
    logo_url: row.logo_url ?? null,
    logo_dark_url: row.logo_dark_url ?? null,
    favicon_url: row.favicon_url ?? null,
    primary_color: row.primary_color,
    secondary_color: row.secondary_color,
    use_default_logo: Boolean(row.use_default_logo),
    show_powered_by: Boolean(row.show_powered_by),
  };
}

export async function getBrandingByCompanyId(companyId: number): Promise<BrandingDTO> {
  const pool = await getPool();

  const result = await pool
    .request()
    .input("companyId", sql.Int, companyId)
    .query(`
      SELECT TOP 1
        slug,
        display_name,
        logo_url,
        logo_dark_url,
        favicon_url,
        primary_color,
        secondary_color,
        use_default_logo,
        show_powered_by
      FROM dbo.company_branding
      WHERE company_id = @companyId;
    `);

  const row = result.recordset?.[0];
  if (!row) return FALLBACK;

  return {
    slug: row.slug,
    display_name: row.display_name,
    logo_url: row.logo_url ?? null,
    logo_dark_url: row.logo_dark_url ?? null,
    favicon_url: row.favicon_url ?? null,
    primary_color: row.primary_color,
    secondary_color: row.secondary_color,
    use_default_logo: Boolean(row.use_default_logo),
    show_powered_by: Boolean(row.show_powered_by),
  };
}

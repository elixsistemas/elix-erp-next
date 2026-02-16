// src/shared/types/branding.ts
export type Branding = {
  company_id: number;
  display_name: string;
  logo_url?: string | null;
  primary_color?: string | null;
  secondary_color?: string | null;
  show_powered_by?: boolean;
};

// src/shared/api/branding.service.ts
import { api } from "@/shared/api/client";
import type { Branding } from "@/contexts/BrandingContext";

export async function getBrandingByCompany(companyId: number): Promise<Branding> {
  // se teu endpoint for público, passa auth:false
  return api<Branding>(`/branding?companyId=${companyId}`, { auth: false });
}

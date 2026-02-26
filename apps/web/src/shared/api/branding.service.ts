import { api } from "@/shared/api/client";
import type { Branding } from "@/contexts/BrandingContext";

export async function getBrandingByCompany(companyId: number): Promise<Branding> {
  return api<Branding>(`/branding/company?companyId=${companyId}`, { auth: true });
}
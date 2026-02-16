// src/contexts/BrandingContext.tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "@/shared/api/client";

export type Branding = {
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

type BrandingState = {
  brand: Branding;
  isLoading: boolean;
  companySlug: string;
  reload: () => Promise<void>;
  setBranding: (b: Branding) => void; // ✅ obrigatório
};

const FALLBACK: Branding = {
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

const BrandingContext = createContext<BrandingState | null>(null);

function resolveCompanySlugFromUrl(): string {
  const qs = new URLSearchParams(window.location.search);
  const company = qs.get("company")?.trim();
  if (company) return company.toLowerCase();

  const host = window.location.hostname;
  const parts = host.split(".");
  if (parts.length >= 3) return parts[0].toLowerCase();

  return "elix";
}

function applyBrandingToDom(brand: Branding) {
  document.documentElement.style.setProperty("--brand-primary", brand.primary_color);
  document.documentElement.style.setProperty("--brand-secondary", brand.secondary_color);

  if (brand.favicon_url) {
    let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = brand.favicon_url;
  }
}

export function BrandingProvider({ children }: { children: React.ReactNode }) {
  const [brand, setBrand] = useState<Branding>(FALLBACK);
  const [isLoading, setIsLoading] = useState(true);

  const companySlug = useMemo(() => resolveCompanySlugFromUrl(), []);

  // ✅ setter público e consistente (aplica no DOM também)
  function setBranding(next: Branding) {
    setBrand(next);
    applyBrandingToDom(next);
  }

  async function load() {
    setIsLoading(true);
    try {
      // 🔥 seu backend resolve slug via query/header/host.
      const data = await api<Branding>(`/branding?company=${encodeURIComponent(companySlug)}`);
      setBranding(data);
    } catch {
      setBranding(FALLBACK);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value: BrandingState = {
    brand,
    isLoading,
    companySlug,
    reload: load,
    setBranding, // ✅ agora existe de verdade
  };

  return <BrandingContext.Provider value={value}>{children}</BrandingContext.Provider>;
}

export function useBranding() {
  const ctx = useContext(BrandingContext);
  if (!ctx) throw new Error("useBranding deve ser usado dentro de <BrandingProvider />");
  return ctx;
}

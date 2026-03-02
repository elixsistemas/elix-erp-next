import { useState, useMemo } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Menu, LogOut } from "lucide-react";

import { Sidebar } from "./Sidebar";
import { MobileSidebar } from "./MobileSidebar";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useBranding } from "@/contexts/BrandingContext";

// ✅ novo
import { SwitchCompanyDialog } from "@/components/SwitchCompanyDialog";

function pageTitleFromPath(pathname: string) {
  if (pathname.startsWith("/dashboard")) return "Dashboard";
  if (pathname.startsWith("/bank-accounts")) return "Contas Bancárias";
  if (pathname.startsWith("/finance")) return "Financeiro";
  return "Elix ERP Next";
}

export default function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const { logout, user, company } = useAuth();
  const { isLoading: brandingLoading } = useBranding();

  const location = useLocation();
  const title = useMemo(() => pageTitleFromPath(location.pathname), [location.pathname]);

  // ✅ nome “real” da empresa logada vem do AuthContext
  const companyName = company?.name || "Empresa";
  // ✅ logo/estilo vem do Branding (se houver)
  const logoUrl = useMemo(() => {
    const raw = company?.logo_base64?.trim();

    if (!raw) return "/company-placeholder.png";

    // se já veio pronto como data URL, usa direto
    if (raw.startsWith("data:")) return raw;

    // se veio só o base64 puro
    return `data:${company?.logo_mime || "image/png"};base64,${raw}`;
  }, [company?.logo_base64, company?.logo_mime]);

  const userInitials = useMemo(() => {
    const name = user?.name?.trim();
    if (!name) return "A";
    const parts = name.split(/\s+/);
    const a = parts[0]?.[0] ?? "A";
    const b = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
    return (a + b).toUpperCase();
  }, [user?.name]);

  return (
    <div className="h-screen flex bg-slate-100 dark:bg-slate-950">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex w-64 border-r bg-white dark:bg-slate-900">
        <Sidebar />
      </aside>

      {/* Sidebar Mobile */}
      <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />

      {/* Conteúdo */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header global */}
        <header className="h-16 flex items-center justify-between px-5 border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <button className="md:hidden" onClick={() => setMobileOpen(true)} aria-label="Abrir menu">
              <Menu size={22} />
            </button>

            {/* Branding + Empresa */}
            <div className="flex items-center gap-3">
              <div
                className="h-11 w-11 md:h-12 md:w-12 rounded-2xl overflow-hidden bg-slate-200 dark:bg-slate-800 flex items-center justify-center ring-1 ring-slate-200/60 dark:ring-slate-700/60"
                title={companyName}
              >
                <img
                  src={logoUrl}
                  alt={companyName}
                  className="h-full w-full object-contain p-1"
                  draggable={false}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = "/company-placeholder.png";
                  }}
                />
              </div>

              <div className="leading-tight">
                <div className="font-semibold text-[15px] md:text-base text-slate-900 dark:text-white">
                  {company ? companyName : (brandingLoading ? "Carregando..." : "Empresa")}
                </div>
                <div className="text-[12px] md:text-sm text-slate-500 dark:text-slate-400">
                  {title}
                </div>
              </div>
            </div>
          </div>

          {/* User box */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              <SwitchCompanyDialog />
            </div>

            <div className="hidden sm:flex items-center gap-2">
              <Avatar className="h-9 w-9">
                <AvatarImage src={(user as any)?.avatarUrl || ""} alt={user?.name || "Usuário"} />
                <AvatarFallback>{userInitials}</AvatarFallback>
              </Avatar>

              <div className="hidden md:block leading-tight">
                <div className="text-sm font-medium text-slate-900 dark:text-white">
                  {user?.name || "Administrador"}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{user?.email || ""}</div>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              className="text-slate-600 hover:text-red-600 dark:text-slate-300"
              title="Sair"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Main */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
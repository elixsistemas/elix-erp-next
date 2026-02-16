import { useState, useMemo } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Menu, LogOut } from "lucide-react";

import { Sidebar } from "./Sidebar";
import { MobileSidebar } from "./MobileSidebar";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useBranding } from "@/contexts/BrandingContext"; // ajuste o path se estiver diferente

function pageTitleFromPath(pathname: string) {
  if (pathname.startsWith("/dashboard")) return "Dashboard";
  if (pathname.startsWith("/bank-accounts")) return "Contas Bancárias";
  if (pathname.startsWith("/finance")) return "Financeiro";
  return "Elix ERP Next";
}

export default function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const { logout, user } = useAuth();
  const { brand, isLoading: brandingLoading } = useBranding();

  const location = useLocation();
  const title = useMemo(() => pageTitleFromPath(location.pathname), [location.pathname]);

  const displayName = brand?.display_name || "Elix Sistemas";
  const logoUrl = brand?.logo_url || "/assets/elix-logo.png";

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
        <header className="h-14 flex items-center justify-between px-4 border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button className="md:hidden" onClick={() => setMobileOpen(true)} aria-label="Abrir menu">
              <Menu size={22} />
            </button>

            {/* Branding */}
            <div className="flex items-center gap-2">
              <div
                className="h-9 w-9 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800 flex items-center justify-center"
                title={displayName}
              >
                {/* se tiver logo */}
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt={displayName}
                    className="h-9 w-9 object-contain"
                    draggable={false}
                  />
                ) : (
                  <span className="font-bold">E</span>
                )}
              </div>

              <div className="leading-tight">
                <div className="font-semibold text-slate-800 dark:text-white">
                  {brandingLoading ? "Carregando..." : displayName}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {title}
                </div>
              </div>
            </div>
          </div>

          {/* User box */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <Avatar className="h-8 w-8">
                {/* opcional: se você tiver user.avatarUrl */}
                <AvatarImage src={(user as any)?.avatarUrl || ""} alt={user?.name || "Usuário"} />
                <AvatarFallback>{userInitials}</AvatarFallback>
              </Avatar>

              <div className="hidden md:block">
                <div className="text-sm font-medium text-slate-800 dark:text-white">
                  {user?.name || "Administrador"}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {user?.email || ""}
                </div>
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

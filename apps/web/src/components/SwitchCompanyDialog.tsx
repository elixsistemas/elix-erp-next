import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useBranding } from "@/contexts/BrandingContext";
import { listCompanies, switchCompany, type CompanyLite } from "@/shared/api/auth.service";
import { getBrandingByCompany } from "@/shared/api/branding.service";
import { useNavigate } from "react-router-dom";

export function SwitchCompanyDialog() {
  const [open, setOpen] = useState(false);
  const [companies, setCompanies] = useState<CompanyLite[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const { company, login } = useAuth();
  const { setBranding } = useBranding();
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        const res = await listCompanies();
        setCompanies(res.companies ?? []);
        const current = company?.id ?? null;
        setSelected(current);
      } catch {
        toast.error("Não foi possível listar empresas");
      }
    })();
  }, [open, company?.id]);

  async function applyBrand(companyId: number) {
    try {
      const data = await getBrandingByCompany(companyId);
      setBranding(data);
    } catch {
      // branding é “nice to have”
    }
  }

  async function handleSwitch() {
    if (!selected) return;

    // se escolheu a mesma, só fecha
    if (selected === company?.id) {
      setOpen(false);
      return;
    }

    setLoading(true);
    try {
      const { token } = await switchCompany(selected);
      await login(token);
      await applyBrand(selected);

      toast.success("Empresa alterada");
      setOpen(false);
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      toast.error("Não foi possível trocar de empresa", {
        description: err?.message || "Tente novamente",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Trocar empresa</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Trocar empresa</DialogTitle>
        </DialogHeader>

        <div className="space-y-2">
          <label className="text-sm text-slate-600">Empresa</label>
          <select
            className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
            value={selected ?? ""}
            onChange={(e) => {
              const id = Number(e.target.value);
              setSelected(Number.isFinite(id) ? id : null);
            }}
            disabled={loading}
          >
            <option value="" disabled>Selecione</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSwitch} disabled={loading || !selected}>
            {loading ? "Trocando..." : "Confirmar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
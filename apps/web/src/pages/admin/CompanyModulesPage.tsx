import { useEffect, useMemo, useState } from "react";
import {
  getCompanyModulesCatalog,
  updateCompanyModules,
  type CompanyModuleCatalogItem,
} from "../admin/company-modules/api";
import { useAuth } from "@/contexts/AuthContext";

type GroupedModules = Record<string, CompanyModuleCatalogItem[]>;

export default function CompanyModulesPage() {
  const { company, refresh } = useAuth();

  const [items, setItems] = useState<CompanyModuleCatalogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    setIsLoading(true);
    setError(null);

    try {
      const res = await getCompanyModulesCatalog();
      setItems(res.items ?? []);
    } catch (err: any) {
      setError(err?.message ?? "Falha ao carregar módulos da empresa.");
    } finally {
      setIsLoading(false);
    }
  }

  function toggleModule(moduleKey: string) {
    setItems((prev) =>
      prev.map((item) =>
        item.module_key === moduleKey
          ? { ...item, enabled: !item.enabled }
          : item
      )
    );
  }

  async function handleSave() {
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const payload = items.map((item) => ({
        module_key: item.module_key,
        enabled: !!item.enabled,
      }));

      const res = await updateCompanyModules(payload);

      setItems(res.items ?? []);
      setSuccess("Módulos atualizados com sucesso.");
      await refresh();
    } catch (err: any) {
      setError(err?.message ?? "Falha ao salvar módulos.");
    } finally {
      setIsSaving(false);
    }
  }

  const grouped = useMemo<GroupedModules>(() => {
    return items.reduce<GroupedModules>((acc, item) => {
      const key = item.domain?.trim() || "geral";
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});
  }, [items]);

  if (isLoading) {
    return <div className="p-6">Carregando módulos da empresa...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Módulos da empresa</h1>
          <p className="text-sm text-slate-500">
            Gerencie os módulos disponíveis para <strong>{company?.name ?? "empresa atual"}</strong>.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-4 py-2 rounded-lg bg-slate-900 text-white disabled:opacity-60"
        >
          {isSaving ? "Salvando..." : "Salvar alterações"}
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

      <div className="space-y-6">
        {Object.entries(grouped).map(([domain, modules]) => (
          <section key={domain} className="rounded-2xl border border-slate-200 bg-white">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="text-lg font-medium capitalize">{domain}</h2>
            </div>

            <div className="divide-y divide-slate-100">
              {modules.map((item) => (
                <div
                  key={item.module_key}
                  className="flex items-center justify-between gap-4 px-5 py-4"
                >
                  <div>
                    <div className="font-medium">
                      {item.label || item.module_key}
                    </div>
                    <div className="text-sm text-slate-500">
                      {item.description || item.module_key}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      chave: {item.module_key}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleModule(item.module_key)}
                    className={`min-w-[110px] rounded-full px-4 py-2 text-sm font-medium transition ${
                      item.enabled
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {item.enabled ? "Habilitado" : "Desabilitado"}
                  </button>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
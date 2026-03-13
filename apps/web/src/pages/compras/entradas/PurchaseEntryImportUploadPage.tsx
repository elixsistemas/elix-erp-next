import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { importPurchaseEntryXml } from "./purchase-entry-imports.service";

export default function PurchaseEntryImportUploadPage() {
  const navigate = useNavigate();

  const [fileName, setFileName] = useState("");
  const [xmlContent, setXmlContent] = useState("");
  const [loading, setLoading] = useState(false);

  async function onFileChange(file?: File | null) {
    if (!file) return;

    setFileName(file.name);

    const text = await file.text();
    setXmlContent(text);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!xmlContent.trim()) return;

    setLoading(true);

    try {
      const data = await importPurchaseEntryXml({ fileName, xmlContent });
      navigate(`/compras/entradas/${data.id}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Importar XML de entrada</h1>
        <p className="text-sm text-muted-foreground">
          O XML será importado para staging e só afetará estoque e financeiro
          após confirmação.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4 rounded-lg border p-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium">Arquivo XML</label>
          <input
            type="file"
            accept=".xml,text/xml,application/xml"
            className="block w-full rounded-md border px-3 py-2 text-sm"
            onChange={(e) => void onFileChange(e.target.files?.[0])}
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Conteúdo XML</label>
          <textarea
            className="min-h-[320px] w-full rounded-md border px-3 py-2 text-sm font-mono"
            value={xmlContent}
            onChange={(e) => setXmlContent(e.target.value)}
            placeholder="<nfeProc>...</nfeProc>"
            disabled={loading}
          />
        </div>

        <div className="rounded-md bg-muted/40 p-3 text-sm">
          <div>
            <span className="font-medium">Arquivo:</span>{" "}
            {fileName || "Nenhum arquivo selecionado"}
          </div>
          <div>
            <span className="font-medium">Conteúdo carregado:</span>{" "}
            {xmlContent.trim() ? "Sim" : "Não"}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button type="submit" disabled={loading || !xmlContent.trim()}>
            {loading ? "Importando..." : "Importar XML"}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/compras/entradas")}
            disabled={loading}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}
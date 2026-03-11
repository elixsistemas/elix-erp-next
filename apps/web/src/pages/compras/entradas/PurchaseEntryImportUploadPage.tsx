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

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await importPurchaseEntryXml({ fileName, xmlContent });
      navigate(`/compras/entradas/${data.header.id}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Importar XML de entrada</h1>
        <p className="text-sm text-muted-foreground">
          O XML será importado para staging e só afetará estoque/financeiro após confirmação.
        </p>
      </div>

      <form className="space-y-4 rounded-xl border p-4" onSubmit={onSubmit}>
        <input
          type="file"
          accept=".xml,text/xml,application/xml"
          onChange={(e) => void onFileChange(e.target.files?.[0])}
        />

        <textarea
          className="min-h-[300px] w-full rounded-md border px-3 py-2 font-mono text-xs"
          placeholder="Ou cole o XML aqui"
          value={xmlContent}
          onChange={(e) => setXmlContent(e.target.value)}
        />

        <div className="flex items-center gap-2">
          <Button type="submit" disabled={loading || !xmlContent.trim()}>
            {loading ? "Importando..." : "Importar XML"}
          </Button>

          <Button type="button" variant="outline" onClick={() => navigate("/compras/entradas")}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}
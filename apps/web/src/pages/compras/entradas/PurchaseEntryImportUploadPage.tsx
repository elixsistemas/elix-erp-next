import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { importPurchaseEntryXml } from "./purchase-entry-imports.service";

export default function PurchaseEntryImportUploadPage() {
  const navigate = useNavigate();

  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState<number | null>(null);
  const [xmlContent, setXmlContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadFile(file: File) {
    if (!file.name.toLowerCase().endsWith(".xml")) {
      setError("Selecione um arquivo XML válido.");
      return;
    }

    setError(null);
    setFileName(file.name);
    setFileSize(file.size);

    const text = await file.text();
    setXmlContent(text);
  }

  async function onFileChange(file?: File | null) {
    if (!file) return;
    await loadFile(file);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!xmlContent.trim()) {
      setError("Carregue um XML antes de importar.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await importPurchaseEntryXml({
        fileName,
        xmlContent,
      });

      console.log("IMPORT RESULT", result);

      const importId =
        (result as any)?.header?.id ??
        (result as any)?.id ??
        null;

      if (!importId || Number.isNaN(Number(importId))) {
        throw new Error("A API não retornou um ID de importação válido.");
      }

      navigate(`/compras/entradas/${importId}`);
    } catch (err: any) {
      console.error("Erro ao importar XML:", err);
      setError(err?.message ?? "Erro ao importar XML.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Importar XML de compra</h1>
        <p className="text-sm text-muted-foreground">
          O XML será analisado e carregado para conferência antes de gerar a
          entrada definitiva no estoque e financeiro.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <div
          className="flex flex-col items-center justify-center rounded-lg border border-dashed p-10 text-center cursor-pointer hover:bg-muted/40"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files?.[0];
            if (file) void loadFile(file);
          }}
        >
          <div className="text-sm text-muted-foreground">
            Arraste o XML aqui ou selecione um arquivo
          </div>

          <input
            type="file"
            accept=".xml,text/xml,application/xml"
            className="mt-3"
            onChange={(e) => void onFileChange(e.target.files?.[0])}
            disabled={loading}
          />
        </div>

        {fileName && (
          <div className="rounded-md border p-3 text-sm space-y-1">
            <div>
              <span className="font-medium">Arquivo:</span> {fileName}
            </div>

            {fileSize && (
              <div>
                <span className="font-medium">Tamanho:</span>{" "}
                {(fileSize / 1024).toFixed(1)} KB
              </div>
            )}

            <div>
              <span className="font-medium">Conteúdo carregado:</span>{" "}
              {xmlContent ? "Sim" : "Não"}
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <Button type="submit" disabled={loading || !xmlContent}>
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
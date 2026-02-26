// src/pages/cadastros/empresa/components/LogoUpload.tsx
import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Props {
  /** Data-URL já salvo no banco — exibido como preview inicial */
  currentLogo?: string | null;
  /**
   * Chamado após upload com sucesso (url = novo data-URL)
   * ou após remoção (url = null)
   */
  onChanged?: (url: string | null) => void;
}

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];
const MAX_BYTES = 300_000;

export function LogoUpload({ currentLogo, onChanged }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentLogo ?? null);
  const [loading, setLoading] = useState(false);

  // ← CORREÇÃO PRINCIPAL: sincroniza quando o form abre com empresa diferente
  useEffect(() => {
    setPreview(currentLogo ?? null);
  }, [currentLogo]);

    async function handleFile(file: File) {
    if (!ALLOWED.includes(file.type)) {
        toast.error("Formato inválido. Use JPG, PNG, WebP ou SVG.");
        return;
    }
    if (file.size > MAX_BYTES) {
        toast.error(`Imagem muito grande (${(file.size / 1024).toFixed(0)} KB). Máximo: 300 KB.`);
        return;
    }

    setLoading(true);
    try {
        const token = localStorage.getItem("token"); // ← ajustar se o token tiver outro nome

        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("http://localhost:3333/companies/me/logo", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            // NÃO colocar Content-Type aqui — o browser define automaticamente com boundary
        },
        body: formData,
        });

        if (!res.ok) throw new Error(`Erro ${res.status}`);

        // Preview local imediato
        const reader = new FileReader();
        reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setPreview(dataUrl);
        onChanged?.(dataUrl);
        };
        reader.readAsDataURL(file);

        toast.success("Logo salvo com sucesso!");
    } catch {
        toast.error("Erro ao enviar logo. Tente novamente.");
    } finally {
        setLoading(false);
    }
    }

    async function handleRemove() {
    setLoading(true);
    try {
        const token = localStorage.getItem("token"); // ← mesmo ajuste aqui

        const res = await fetch("http://localhost:3333/companies/me/logo", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error(`Erro ${res.status}`);

        setPreview(null);
        onChanged?.(null);
        toast.success("Logo removido.");
    } catch {
        toast.error("Erro ao remover logo.");
    } finally {
        setLoading(false);
    }
    }

  return (
    <div className="flex flex-col gap-3">
      {preview ? (
        <div className="relative w-fit">
          <img
            src={preview}
            alt="Logo da empresa"
            className="h-20 max-w-[180px] rounded border object-contain p-1 shadow-sm"
          />
          <button
            type="button"
            onClick={handleRemove}
            disabled={loading}
            className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center
                       rounded-full bg-red-500 text-[10px] text-white shadow hover:bg-red-600"
            title="Remover logo"
          >
            ✕
          </button>
        </div>
      ) : (
        <div
          className="flex h-20 w-[180px] cursor-pointer items-center justify-center
                     rounded border-2 border-dashed border-gray-300 text-sm
                     text-gray-400 hover:border-gray-400 hover:text-gray-500"
          onClick={() => inputRef.current?.click()}
        >
          Sem logo
        </div>
      )}

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={loading}
          onClick={() => inputRef.current?.click()}
        >
          {loading ? "Enviando…" : preview ? "Trocar logo" : "Carregar logo"}
        </Button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED.join(",")}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />

      <p className="text-xs text-gray-400">JPG, PNG, WebP ou SVG · máx. 300 KB</p>
    </div>
  );
}

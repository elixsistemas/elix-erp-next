import { Button } from "@/components/ui/button";
import type { FiscalDoc } from "../sales.types";

type Props = {
  docs: FiscalDoc[];
  loading?: boolean;
  issuing: "NFE" | "NFSE" | "BOTH" | null;
  onReload: () => void;
  onIssue: (type: "NFE" | "NFSE" | "BOTH") => Promise<void>;
};

export function FiscalCard({ docs, loading, issuing, onReload, onIssue }: Props) {
  const nfe = docs.find((d) => String(d.type).toUpperCase() === "NFE") ?? null;
  const nfse = docs.find((d) => String(d.type).toUpperCase() === "NFSE") ?? null;

  return (
    <div className="rounded-xl border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="font-medium">Fiscal</div>
        <Button size="sm" variant="secondary" onClick={onReload} disabled={!!loading || issuing !== null}>
          Atualizar
        </Button>
      </div>

      <div className="rounded-lg border p-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-medium">NF-e</div>
            <div className="text-xs text-muted-foreground">
              {nfe ? `Status: ${nfe.status}` : "Não gerada"}
            </div>
          </div>

          {!nfe ? (
            <Button size="sm" onClick={() => onIssue("NFE")} disabled={!!loading || issuing !== null}>
              {issuing === "NFE" ? "Gerando..." : "Gerar"}
            </Button>
          ) : (
            <Button size="sm" variant="secondary" disabled>
              Ver
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-lg border p-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-medium">NFS-e</div>
            <div className="text-xs text-muted-foreground">
              {nfse ? `Status: ${nfse.status}` : "Não gerada"}
            </div>
          </div>

          {!nfse ? (
            <Button size="sm" onClick={() => onIssue("NFSE")} disabled={!!loading || issuing !== null}>
              {issuing === "NFSE" ? "Gerando..." : "Gerar"}
            </Button>
          ) : (
            <Button size="sm" variant="secondary" disabled>
              Ver
            </Button>
          )}
        </div>
      </div>

      {(!nfe || !nfse) && (
        <div className="pt-1">
          <Button
            className="w-full"
            variant="secondary"
            onClick={() => onIssue("BOTH")}
            disabled={!!loading || issuing !== null}
          >
            {issuing === "BOTH" ? "Gerando..." : "Gerar NF-e + NFS-e"}
          </Button>
          <div className="text-[11px] text-muted-foreground mt-1">
            Regra B: se já existir um tipo ativo, o backend retorna 409.
          </div>
        </div>
      )}
    </div>
  );
}

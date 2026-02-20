import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function QuoteActionsBar(props: {
  status?: string;
  disabled: boolean;
  onSave: () => void;
  onApprove: () => void;
  onCancel: () => void;
}) {
  const status = props.status ?? "draft";

  return (
    <div className="border rounded-lg p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
      <div className="flex items-center gap-2">
        <Badge variant="outline">Ações</Badge>
        <div className="text-sm text-muted-foreground">
          {status === "draft"
            ? "Rascunho: você pode editar e salvar."
            : status === "approved"
              ? "Aprovado: edição travada."
              : "Cancelado: edição travada."}
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={props.onSave} disabled={props.disabled}>
          Salvar
        </Button>

        <Button
          variant="outline"
          onClick={props.onApprove}
          disabled={props.disabled || status !== "draft"}
        >
          Aprovar
        </Button>

        <Button
          variant="destructive"
          onClick={props.onCancel}
          disabled={status === "cancelled"}
        >
          Cancelar
        </Button>
      </div>
    </div>
  );
}

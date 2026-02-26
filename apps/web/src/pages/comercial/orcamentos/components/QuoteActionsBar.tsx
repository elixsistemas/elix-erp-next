import { Button } from "@/components/ui/button";
import { StatusBadge } from "../../_shared/StatusBadge";   // ← _shared
import { CheckCircle, Save, XCircle } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Props {
  status?:   string;
  disabled:  boolean;
  onSave:    () => void;
  onApprove: () => void;
  onCancel:  () => void;
}

export function QuoteActionsBar({ status = "draft", disabled, onSave, onApprove, onCancel }: Props) {
  return (
    <div className="border rounded-lg p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
      <div className="flex items-center gap-2">
        <StatusBadge status={status} />
        <span className="text-sm text-muted-foreground">
          {status === "draft"
            ? "Rascunho: você pode editar e salvar."
            : status === "approved"
              ? "Aprovado: edição bloqueada."
              : "Cancelado: edição bloqueada."}
        </span>
      </div>

      <div className="flex gap-2">
        {/* Salvar */}
        <Button onClick={onSave} disabled={disabled}>
          <Save className="mr-2 h-4 w-4" /> Salvar
        </Button>

        {/* Aprovar */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              className="text-green-600 border-green-300 hover:bg-green-50"
              disabled={disabled || status !== "draft"}
            >
              <CheckCircle className="mr-2 h-4 w-4" /> Aprovar
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Aprovar orçamento?</AlertDialogTitle>
              <AlertDialogDescription>
                Após aprovado, o orçamento não poderá mais ser editado.
                Você poderá gerar um Pedido ou Venda a partir dele.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Voltar</AlertDialogCancel>
              <AlertDialogAction onClick={onApprove}>Aprovar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Cancelar */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              className="text-red-600 border-red-300 hover:bg-red-50"
              disabled={status === "cancelled"}
            >
              <XCircle className="mr-2 h-4 w-4" /> Cancelar
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancelar orçamento?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Voltar</AlertDialogCancel>
              <AlertDialogAction
                onClick={onCancel}
                className="bg-red-600 hover:bg-red-700"
              >
                Cancelar Orçamento
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

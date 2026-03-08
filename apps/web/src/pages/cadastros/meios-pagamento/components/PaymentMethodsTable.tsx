import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Power, RotateCcw } from "lucide-react";
import type { PaymentMethod } from "../payment-methods.types";

type Props = {
  rows: PaymentMethod[];
  onEdit: (row: PaymentMethod) => void;
  onDeactivate: (row: PaymentMethod) => void;
  onActivate: (row: PaymentMethod) => void;
};

function typeLabel(type: PaymentMethod["type"]) {
  switch (type) {
    case "cash":
      return "Dinheiro";
    case "pix":
      return "PIX";
    case "boleto":
      return "Boleto";
    case "credit_card":
      return "Cartão crédito";
    case "debit_card":
      return "Cartão débito";
    case "bank_transfer":
      return "Transferência";
    case "check":
      return "Cheque";
    case "wallet":
      return "Carteira";
    default:
      return "Outro";
  }
}

export function PaymentMethodsTable(props: Props) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Código</TableHead>
          <TableHead>Nome</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Liquidação</TableHead>
          <TableHead>Parcela</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="w-[180px]">Ações</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {props.rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell>{row.code || "-"}</TableCell>
            <TableCell>
              <div className="flex flex-col gap-1">
                <span className="font-medium">{row.name}</span>
                <div className="flex flex-wrap gap-1">
                  {row.is_default && <Badge variant="secondary">Padrão</Badge>}
                  {row.requires_bank_account && <Badge variant="outline">Exige conta</Badge>}
                </div>
              </div>
            </TableCell>
            <TableCell>{typeLabel(row.type)}</TableCell>
            <TableCell>{row.settlement_days} dia(s)</TableCell>
            <TableCell>
              {row.allows_installments ? `Até ${row.max_installments}x` : "Não"}
            </TableCell>
            <TableCell>
              <Badge variant={row.active ? "default" : "secondary"}>
                {row.active ? "Ativo" : "Inativo"}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => props.onEdit(row)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </Button>

                {row.active ? (
                  <Button size="sm" variant="outline" onClick={() => props.onDeactivate(row)}>
                    <Power className="mr-2 h-4 w-4" />
                    Desativar
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => props.onActivate(row)}>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Ativar
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
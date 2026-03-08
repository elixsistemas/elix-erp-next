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
import { Pencil } from "lucide-react";
import type { PaymentTerm } from "../payment-terms.types";

type Props = {
  rows: PaymentTerm[];
  onEdit: (row: PaymentTerm) => void;
};

function offsetsLabel(offsets: number[]) {
  if (!offsets?.length) return "-";
  if (offsets.length === 1 && offsets[0] === 0) return "À vista";
  return offsets.join("/");
}

export function PaymentTermsTable(props: Props) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Código</TableHead>
          <TableHead>Nome</TableHead>
          <TableHead>Vencimentos</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="w-[120px]">Ações</TableHead>
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
                  {row.allows_early_payment_discount && (
                    <Badge variant="outline">Desconto antecipado</Badge>
                  )}
                </div>
              </div>
            </TableCell>
            <TableCell>{offsetsLabel(row.offsets)}</TableCell>
            <TableCell>{row.term_type === "cash" ? "À vista" : `${row.installment_count}x`}</TableCell>
            <TableCell>
              <Badge variant={row.active ? "default" : "secondary"}>
                {row.active ? "Ativa" : "Inativa"}
              </Badge>
            </TableCell>
            <TableCell>
              <Button size="sm" variant="outline" onClick={() => props.onEdit(row)}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
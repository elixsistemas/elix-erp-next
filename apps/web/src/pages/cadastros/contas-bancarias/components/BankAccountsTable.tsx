import type { BankAccount } from "../bank-accounts.types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Power, RotateCcw } from "lucide-react";

function accountTypeLabel(type: BankAccount["account_type"]) {
  switch (type) {
    case "checking":
      return "Corrente";
    case "savings":
      return "Poupança";
    case "payment":
      return "Pagamento";
    case "cash":
      return "Caixa";
    default:
      return "Outra";
  }
}

export function BankAccountsTable(props: {
  rows: BankAccount[];
  onEdit: (row: BankAccount) => void;
  onDeactivate: (row: BankAccount) => void;
  onActivate: (row: BankAccount) => void;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Conta</TableHead>
          <TableHead>Banco</TableHead>
          <TableHead>Titular</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Operação</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="w-[190px]">Ações</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {props.rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell>
              <div className="flex flex-col gap-1">
                <span className="font-medium">{row.name}</span>
                <span className="text-xs text-muted-foreground">
                  {row.account ? `${row.account}${row.account_digit ? "-" + row.account_digit : ""}` : "-"}
                  {row.agency ? ` • Ag ${row.agency}${row.branch_digit ? "-" + row.branch_digit : ""}` : ""}
                </span>
                <div className="flex flex-wrap gap-1">
                  {row.is_default && <Badge variant="secondary">Padrão</Badge>}
                  {row.pix_key_value && <Badge variant="outline">PIX</Badge>}
                </div>
              </div>
            </TableCell>

            <TableCell>
              <div className="flex flex-col">
                <span>{row.bank_name || row.bank_code}</span>
                {row.bank_name && (
                  <span className="text-xs text-muted-foreground">{row.bank_code}</span>
                )}
              </div>
            </TableCell>

            <TableCell>{row.holder_name || "-"}</TableCell>
            <TableCell>{accountTypeLabel(row.account_type)}</TableCell>

            <TableCell>
              <div className="flex flex-wrap gap-1">
                {row.allow_receipts && <Badge variant="outline">Recebe</Badge>}
                {row.allow_payments && <Badge variant="outline">Paga</Badge>}
                {row.reconciliation_enabled && <Badge variant="outline">Concilia</Badge>}
              </div>
            </TableCell>

            <TableCell>
              <Badge variant={row.active ? "default" : "secondary"}>
                {row.active ? "Ativa" : "Inativa"}
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
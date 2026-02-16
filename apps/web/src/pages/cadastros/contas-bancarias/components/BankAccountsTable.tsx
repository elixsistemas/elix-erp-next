// components/BankAccountsTable.tsx
import type { BankAccount } from "../bank-accounts.types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Pencil, Power } from "lucide-react";

export function BankAccountsTable(props: {
  rows: BankAccount[];
  onEdit: (row: BankAccount) => void;
  onDeactivate: (row: BankAccount) => void;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Banco</TableHead>
          <TableHead>Agência</TableHead>
          <TableHead>Conta</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {props.rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell className="font-medium">{row.name}</TableCell>
            <TableCell>{row.bank_code}</TableCell>
            <TableCell>{row.agency ?? "-"}</TableCell>
            <TableCell>
              {row.account ? `${row.account}${row.account_digit ? "-" + row.account_digit : ""}` : "-"}
            </TableCell>
            <TableCell>
              <Badge className="bg-emerald-600">Ativa</Badge>
            </TableCell>
            <TableCell className="text-right space-x-2">
              <Button variant="outline" size="sm" onClick={() => props.onEdit(row)}>
                <Pencil className="h-4 w-4 mr-2" />
                Editar
              </Button>

              <Button variant="destructive" size="sm" onClick={() => props.onDeactivate(row)}>
                <Power className="h-4 w-4 mr-2" />
                Desativar
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

import type { Carrier } from "../carriers.types";
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
import { Pencil, Trash2 } from "lucide-react";

type Props = {
  rows: Carrier[];
  onEdit: (row: Carrier) => void;
  onDelete: (row: Carrier) => void;
};

export function CarriersTable(props: Props) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Documento</TableHead>
          <TableHead>Contato</TableHead>
          <TableHead>Cidade/UF</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="w-[160px]">Ações</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {props.rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell>
              <div className="flex flex-col gap-1">
                <span className="font-medium">{row.name}</span>
                {row.legal_name && (
                  <span className="text-xs text-muted-foreground">{row.legal_name}</span>
                )}
              </div>
            </TableCell>

            <TableCell>
              <div className="flex flex-col gap-1">
                <span>{row.document || "-"}</span>
                {row.rntrc && (
                  <span className="text-xs text-muted-foreground">RNTRC: {row.rntrc}</span>
                )}
              </div>
            </TableCell>

            <TableCell>
              <div className="flex flex-col gap-1">
                <span>{row.contact_name || "-"}</span>
                <span className="text-xs text-muted-foreground">
                  {row.phone || row.email || "-"}
                </span>
              </div>
            </TableCell>

            <TableCell>{[row.city, row.state].filter(Boolean).join("/") || "-"}</TableCell>

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

                <Button size="sm" variant="outline" onClick={() => props.onDelete(row)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ProductKitRow } from "../product-kits.types";

type Props = {
  rows: ProductKitRow[];
  loading: boolean;
  onEdit: (row: ProductKitRow) => void;
};

export function ProductKitsTable({ rows, loading, onEdit }: Props) {
  return (
    <div className="rounded-xl border bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">ID</TableHead>
            <TableHead>Kit</TableHead>
            <TableHead className="w-[120px]">SKU</TableHead>
            <TableHead className="w-[120px]">Status</TableHead>
            <TableHead className="w-[180px] text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                Carregando...
              </TableCell>
            </TableRow>
          ) : rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                Nenhum kit encontrado.
              </TableCell>
            </TableRow>
          ) : (
            rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-mono">#{r.id}</TableCell>
                <TableCell>{r.name}</TableCell>
                <TableCell>{r.sku ?? "—"}</TableCell>
                <TableCell>{r.active ? "Ativo" : "Inativo"}</TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" onClick={() => onEdit(r)}>
                    Composição
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
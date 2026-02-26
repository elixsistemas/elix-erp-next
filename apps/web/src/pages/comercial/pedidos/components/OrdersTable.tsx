import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Loader2 } from "lucide-react";
import { StatusBadge } from "../../_shared/StatusBadge";
import type { OrderRow } from "../orders.types";

interface Props {
  rows:    OrderRow[];
  loading: boolean;
  onOpen:  (id: number) => void;
}

const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const fmtDate = (s: string | null) => s ? new Date(s).toLocaleDateString("pt-BR") : "—";

export function OrdersTable({ rows, loading, onOpen }: Props) {
  if (loading) return (
    <div className="flex justify-center py-16">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  );
  if (!rows.length) return (
    <div className="text-center py-16 text-muted-foreground">
      Nenhum pedido encontrado.
    </div>
  );

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-16">#</TableHead>
          <TableHead>Cliente</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Total</TableHead>
          <TableHead>Vendedor</TableHead>
          <TableHead>Entrega</TableHead>
          <TableHead>Emissão</TableHead>
          <TableHead className="w-12" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map(row => (
          <TableRow key={row.id} className="cursor-pointer hover:bg-muted/50" onClick={() => onOpen(row.id)}>
            <TableCell className="font-mono text-muted-foreground">
              #{String(row.id).padStart(4, "0")}
            </TableCell>
            <TableCell className="font-medium">{row.customerName}</TableCell>
            <TableCell><StatusBadge status={row.status} /></TableCell>
            <TableCell className="text-right font-medium">{fmt(row.total)}</TableCell>
            <TableCell className="text-muted-foreground">{row.sellerName ?? "—"}</TableCell>
            <TableCell className="text-muted-foreground">{fmtDate(row.expectedDelivery)}</TableCell>
            <TableCell className="text-muted-foreground">{fmtDate(row.createdAt)}</TableCell>
            <TableCell>
              <Button size="icon" variant="ghost" onClick={e => { e.stopPropagation(); onOpen(row.id); }}>
                <Eye className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

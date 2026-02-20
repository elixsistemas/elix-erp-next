import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import type { QuoteListRow } from "../quotes.types";

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function statusBadge(status: string) {
  if (status === "approved") return <Badge>Aprovado</Badge>;
  if (status === "cancelled") return <Badge variant="destructive">Cancelado</Badge>;
  return <Badge variant="secondary">Rascunho</Badge>;
}

export function QuotesTable({ rows, loading }: { rows: QuoteListRow[]; loading: boolean }) {
  const nav = useNavigate();

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead style={{ width: 90 }}>#</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead style={{ width: 140 }}>Status</TableHead>
            <TableHead style={{ width: 170 }}>Total</TableHead>
            <TableHead style={{ width: 200 }}>Criado</TableHead>
            <TableHead style={{ width: 140 }} className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {loading ? (
            <TableRow><TableCell colSpan={6} className="py-10 text-center text-muted-foreground">Carregando...</TableCell></TableRow>
          ) : rows.length === 0 ? (
            <TableRow><TableCell colSpan={6} className="py-10 text-center text-muted-foreground">Nenhum orçamento encontrado.</TableCell></TableRow>
          ) : (
            rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">#{r.id}</TableCell>
                <TableCell>
                  <div className="font-medium">{r.customer_name}</div>
                  <div className="text-xs text-muted-foreground">{r.customer_document}</div>
                </TableCell>
                <TableCell>{statusBadge(r.status)}</TableCell>
                <TableCell className="font-mono tabular-nums">{brl.format(Number(r.total ?? 0))}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(r.created_at).toLocaleString("pt-BR")}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" onClick={() => nav(`/comercial/orcamentos/${r.id}`)}>
                    Abrir
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

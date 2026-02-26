import * as React from "react";
import { useNavigate } from "react-router-dom";
import { fetchSales } from "./sales.service";
import type { SaleRow } from "./sales.types";
import { StatusBadge } from "../_shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input }  from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, Loader2, PlusCircle, RefreshCw, Search, X } from "lucide-react";

const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const fmtDate = (s: string | null) => s ? new Date(s).toLocaleDateString("pt-BR") : "—";

export default function VendasListPage() {
  const nav = useNavigate();
  const [rows,    setRows]    = React.useState<SaleRow[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [query,   setQuery]   = React.useState("");
  const [status,  setStatus]  = React.useState("");

  const load = React.useCallback(async () => {
    setLoading(true);
    try { setRows(await fetchSales({ q: query || undefined, status: status || undefined, limit: 100 })); }
    finally { setLoading(false); }
  }, [query, status]);

  React.useEffect(() => { load(); }, [load]);

  return (
    <div className="p-6 space-y-4">
      {/* toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Vendas</h1>
          <p className="text-sm text-muted-foreground">Gerencie as vendas realizadas</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9 w-48" placeholder="Buscar..." value={query} onChange={e => setQuery(e.target.value)} />
            {query && <button className="absolute right-2 top-2.5" onClick={() => setQuery("")}><X className="h-4 w-4" /></button>}
          </div>
          <Select value={status || "all"} onValueChange={v => setStatus(v === "all" ? "" : v)}>
            <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="draft">Rascunho</SelectItem>
              <SelectItem value="completed">Concluído</SelectItem>
              <SelectItem value="cancelled">Cancelado</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button onClick={() => nav("/comercial/vendas/new")}>
            <PlusCircle className="mr-2 h-4 w-4" /> Nova Venda
          </Button>
        </div>
      </div>

      {/* tabela */}
      <div className="rounded-lg border bg-card">
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : !rows.length ? (
          <div className="text-center py-16 text-muted-foreground">Nenhuma venda encontrada.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">#</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Vendedor</TableHead>
                <TableHead>Origem</TableHead>
                <TableHead>Emissão</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(row => (
                <TableRow key={row.id} className="cursor-pointer hover:bg-muted/50" onClick={() => nav(`/comercial/vendas/${row.id}`)}>
                  <TableCell className="font-mono text-muted-foreground">#{String(row.id).padStart(4, "0")}</TableCell>
                  <TableCell className="font-medium">{row.customerName}</TableCell>
                  <TableCell><StatusBadge status={row.status} /></TableCell>
                  <TableCell className="text-right font-medium">{fmt(row.total)}</TableCell>
                  <TableCell className="text-muted-foreground">{row.sellerName ?? "—"}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {row.quoteId ? `Orç. #${row.quoteId}` : row.orderId ? `Ped. #${row.orderId}` : "Avulsa"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{fmtDate(row.createdAt)}</TableCell>
                  <TableCell>
                    <Button size="icon" variant="ghost" onClick={e => { e.stopPropagation(); nav(`/comercial/vendas/${row.id}`); }}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}

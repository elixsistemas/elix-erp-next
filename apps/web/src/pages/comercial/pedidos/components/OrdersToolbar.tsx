import { Input }  from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, RefreshCw, Search, X } from "lucide-react";

interface Props {
  query:     string;
  onQuery:   (v: string) => void;
  status:    string;
  onStatus:  (v: string) => void;
  loading:   boolean;
  onReload:  () => void;
  onCreate:  () => void;
}

export function OrdersToolbar({ query, onQuery, status, onStatus, loading, onReload, onCreate }: Props) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Pedidos</h1>
        <p className="text-sm text-muted-foreground">Gerencie os pedidos de venda</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {/* busca */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9 w-48"
            placeholder="Buscar..."
            value={query}
            onChange={e => onQuery(e.target.value)}
          />
          {query && (
            <button
              className="absolute right-2 top-2.5 text-muted-foreground hover:text-foreground"
              onClick={() => onQuery("")}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* filtro status */}
        <Select value={status || "all"} onValueChange={v => onStatus(v === "all" ? "" : v)}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="draft">Rascunho</SelectItem>
            <SelectItem value="confirmed">Confirmado</SelectItem>
            <SelectItem value="cancelled">Cancelado</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" size="icon" onClick={onReload} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
        <Button onClick={onCreate}>
          <PlusCircle className="mr-2 h-4 w-4" /> Novo Pedido
        </Button>
      </div>
    </div>
  );
}

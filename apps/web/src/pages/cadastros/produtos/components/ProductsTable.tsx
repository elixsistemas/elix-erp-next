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
import type { Product } from "../products.types";

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

type Props = {
  rows: Product[];
  loading: boolean;
  onEdit: (row: Product) => void;
  onRemove: (row: Product) => void;
};

export function ProductsTable({ rows, loading, onEdit, onRemove }: Props) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead style={{ width: 90 }}>ID</TableHead>
            <TableHead>Produto</TableHead>
            <TableHead style={{ width: 130 }}>Tipo</TableHead>
            <TableHead style={{ width: 160 }}>Preço</TableHead>
            <TableHead style={{ width: 140 }}>Status</TableHead>
            <TableHead style={{ width: 180 }} className="text-right">
              Ações
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                Carregando...
              </TableCell>
            </TableRow>
          ) : rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                Nenhum produto encontrado.
              </TableCell>
            </TableRow>
          ) : (
            rows.map((r) => {
              const active = r.active ?? true;

              return (
                <TableRow key={r.id}>
                  <TableCell>#{r.id}</TableCell>

                  <TableCell>
                    <div className="font-medium">{r.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {r.sku ? `SKU: ${r.sku}` : "—"} {r.ean ? ` • EAN: ${r.ean}` : ""}
                    </div>
                  </TableCell>

                  <TableCell>
                    {r.kind === "service" ? (
                      <Badge variant="secondary">Serviço</Badge>
                    ) : (
                      <Badge variant="outline">Produto</Badge>
                    )}
                  </TableCell>

                  <TableCell className="font-mono tabular-nums">
                    {brl.format(Number(r.price ?? 0))}
                  </TableCell>

                  <TableCell>
                    {active ? <Badge>Ativo</Badge> : <Badge variant="destructive">Inativo</Badge>}
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => onEdit(r)}>
                        Editar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onRemove(r)}
                        disabled={!active}
                        title={!active ? "Produto já está inativo" : "Desativar"}
                      >
                        Desativar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}

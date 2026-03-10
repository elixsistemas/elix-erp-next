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

import type { Product, ProductKind } from "../products.types";

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

type Props = {
  rows: Product[];
  loading: boolean;
  onEdit: (row: Product) => void;
  onRemove: (row: Product) => void;
};

function kindLabel(kind: ProductKind) {
  switch (kind) {
    case "service":
      return "Serviço";
    case "consumable":
      return "Consumível";
    case "kit":
      return "Kit";
    default:
      return "Produto";
  }
}

function kindVariant(kind: ProductKind) {
  switch (kind) {
    case "service":
      return "secondary" as const;
    case "consumable":
      return "outline" as const;
    case "kit":
      return "default" as const;
    default:
      return "secondary" as const;
  }
}

export function ProductsTable({
  rows,
  loading,
  onEdit,
  onRemove,
}: Props) {
  return (
    <div className="rounded-xl border bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">ID</TableHead>
            <TableHead>Item</TableHead>
            <TableHead className="w-[130px]">Tipo</TableHead>
            <TableHead className="w-[180px]">NCM</TableHead>
            <TableHead className="w-[140px]">Preço</TableHead>
            <TableHead className="w-[120px]">Status</TableHead>
            <TableHead className="w-[180px] text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="text-center text-muted-foreground"
              >
                Carregando...
              </TableCell>
            </TableRow>
          ) : rows.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="text-center text-muted-foreground"
              >
                Nenhum item encontrado.
              </TableCell>
            </TableRow>
          ) : (
            rows.map((r) => {
              const active = r.active ?? true;

              return (
                <TableRow key={r.id}>
                  <TableCell className="font-mono">#{r.id}</TableCell>

                  <TableCell>
                    <div className="font-medium">{r.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {r.sku ? `SKU: ${r.sku}` : "—"}
                      {r.ean ? ` • EAN: ${r.ean}` : ""}
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge variant={kindVariant(r.kind)}>
                      {kindLabel(r.kind)}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    {r.ncm ? (
                      <div className="space-y-1">
                        <div className="font-mono text-xs">{r.ncm}</div>
                        <div className="text-xs text-muted-foreground">
                          {(r as any).ncm_id ? "Vinculado" : "Manual"}
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        Não informado
                      </span>
                    )}
                  </TableCell>

                  <TableCell>{brl.format(Number(r.price ?? 0))}</TableCell>

                  <TableCell>
                    <Badge variant={active ? "default" : "outline"}>
                      {active ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(r)}
                      >
                        Editar
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onRemove(r)}
                        disabled={!active}
                        title={
                          !active
                            ? "Item já está inativo"
                            : "Desativar"
                        }
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
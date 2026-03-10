import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { ProductKind } from "../products.types";

type Props = {
  q: string;
  onChangeQ: (v: string) => void;

  showInactive: boolean;
  onToggleInactive: (v: boolean) => void;

  kind: ProductKind | "all";
  onChangeKind: (v: ProductKind | "all") => void;

  loading: boolean;
  onCreate: () => void;
  onReload: () => void;
};

export function ProductsToolbar(props: Props) {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Produtos</h2>
        <p className="text-sm text-muted-foreground">
          Cadastro completo para orçamento, pedido, venda, estoque, fiscal e
          logística. Nesta fase, o módulo já opera como base do catálogo de
          itens.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Input
            placeholder="Buscar por nome, SKU, EAN..."
            value={props.q}
            onChange={(e) => props.onChangeQ(e.target.value)}
          />
        </div>

        <div className="lg:col-span-3">
          <Select
            value={props.kind}
            onValueChange={(v) =>
              props.onChangeKind(v as ProductKind | "all")
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Tipo do item" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="product">Produto</SelectItem>
              <SelectItem value="service">Serviço</SelectItem>
              <SelectItem value="consumable">Consumível</SelectItem>
              <SelectItem value="kit">Kit</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 lg:col-span-2">
          <Switch
            id="show-inactive-products"
            checked={props.showInactive}
            onCheckedChange={props.onToggleInactive}
          />
          <Label htmlFor="show-inactive-products">Mostrar inativos</Label>
        </div>

        <div className="flex items-center justify-end gap-2 lg:col-span-2">
          <Button
            type="button"
            variant="outline"
            onClick={props.onReload}
            disabled={props.loading}
          >
            Atualizar
          </Button>

          <Button type="button" onClick={props.onCreate}>
            Novo item
          </Button>
        </div>
      </div>
    </div>
  );
}
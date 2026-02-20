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
    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div className="space-y-2">
        <div className="text-xl font-semibold">Produtos</div>
        <div className="text-sm text-muted-foreground">
          Cadastro completo para orçamento/pedido/venda (comercial + estoque + fiscal + logística).
        </div>
      </div>

      <div className="flex flex-col gap-2 md:flex-row md:items-center">
        <Input
          className="w-[320px]"
          placeholder="Buscar por nome, SKU, EAN..."
          value={props.q}
          onChange={(e) => props.onChangeQ(e.target.value)}
        />

        <Select value={props.kind} onValueChange={(v) => props.onChangeKind(v as any)}>
          <SelectTrigger className="w-[170px]">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="product">Produto</SelectItem>
            <SelectItem value="service">Serviço</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2 px-2">
          <Switch checked={props.showInactive} onCheckedChange={props.onToggleInactive} id="showInactiveProducts" />
          <Label htmlFor="showInactiveProducts">Mostrar inativos</Label>
        </div>

        <Button variant="outline" onClick={props.onReload} disabled={props.loading}>
          Atualizar
        </Button>

        <Button onClick={props.onCreate}>Novo produto</Button>
      </div>
    </div>
  );
}
